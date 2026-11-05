import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";
import { encryptData, isEncrypted, maskCredential } from "../utils/encryption";
import { upsertKonfigurasiSchema, listKonfigurasiQuerySchema } from "../validations/konfigurasi.validation";
import { z } from "zod";

const keySchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9_.]+$/);
const publicIntegrationText = new Set(["smtp.host", "smtp.user", "smtp.from_email", "smtp.from_name", "midtrans.merchant_id"]);
function isCredentialKey(kunci: string) {
  return /(?:^|[._])(password|pass|secret|server_key|client_key|api_key|access_token|refresh_token|credential|private_key)(?:$|[._])/.test(kunci);
}
function requiresSecrecy(kunci: string, kategori: string) {
  return isCredentialKey(kunci) || (kategori === "INTEGRASI" && !publicIntegrationText.has(kunci));
}
function sanitized(item: Prisma.KonfigurasiSistemGetPayload<{}>) {
  const secret = item.isRahasia || isCredentialKey(item.kunci) || (item.nilaiText !== null && requiresSecrecy(item.kunci, item.kategori)) || (!!item.nilaiText && isEncrypted(item.nilaiText));
  return {...item, isRahasia: secret,
    nilaiText: secret && item.nilaiText ? maskCredential(item.nilaiText) : item.nilaiText,
    nilaiBoolean: secret ? null : item.nilaiBoolean,
    nilaiAngka: secret ? null : item.nilaiAngka === null ? null : Number(item.nilaiAngka),
    credentialConfigured: secret ? Boolean(item.nilaiText) : undefined};
}
function safeError(error: unknown, next: NextFunction) {
  if (error instanceof AppError || error instanceof z.ZodError) return next(error);
  // Never forward Prisma request details, which can contain configuration values, to logs.
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return next(new AppError("Kunci konfigurasi sudah digunakan", 409));
  return next(new AppError("Operasi konfigurasi gagal; periksa kesiapan database dan migration", 500, "CONFIGURATION_OPERATION_FAILED"));
}

export async function listKonfigurasiSistem(req: Request, res: Response, next: NextFunction) {
  try {
    const {kategori,search} = listKonfigurasiQuerySchema.parse(req.query);
    const data = await prisma.konfigurasiSistem.findMany({where: {kategori, ...(search && {OR:[{kunci:{contains:search,mode:"insensitive"}},{keterangan:{contains:search,mode:"insensitive"}}]})},orderBy:[{kategori:"asc"},{kunci:"asc"}]});
    return successResponse(res,"Berhasil mengambil konfigurasi sistem",data.map(sanitized));
  } catch(error) { safeError(error,next); }
}
export async function getKonfigurasiSistemByKunci(req: Request, res: Response, next: NextFunction) {
  try {
    const kunci = keySchema.parse(req.params.kunci);
    const item = await prisma.konfigurasiSistem.findUnique({where:{kunci}});
    if (!item) throw new AppError("Konfigurasi tidak ditemukan",404);
    return successResponse(res,"Berhasil mengambil konfigurasi",sanitized(item));
  } catch(error) { safeError(error,next); }
}
export async function upsertKonfigurasiSistem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const kunci = keySchema.parse(req.params.kunci);
    if (req.body?.kunci !== undefined && req.body.kunci !== kunci) throw new AppError("Kunci URL dan body berbeda",400);
    const input = upsertKonfigurasiSchema.parse({...req.body,kunci});
    const result = await prisma.$transaction(async tx => {
      // Serialize updates for a setting, including concurrent first creation.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${kunci}, 0))::text`;
      const existing = await tx.konfigurasiSistem.findUnique({where:{kunci}});
      const kategori = input.kategori ?? existing?.kategori;
      if (!kategori) throw new AppError("Kategori wajib diisi untuk konfigurasi baru",400);
      if (existing && kategori !== existing.kategori) throw new AppError("Kategori konfigurasi tidak dapat diubah",400);
      const hasValue = [input.nilaiText,input.nilaiBoolean,input.nilaiAngka].some(v => v !== undefined);
      if (!existing && !hasValue) throw new AppError("Nilai konfigurasi wajib diisi",400);
      const secret = Boolean(existing?.isRahasia || input.isRahasia || isCredentialKey(kunci) || (requiresSecrecy(kunci,kategori) && (input.nilaiText !== undefined || existing?.nilaiText)));
      if (input.isRahasia === false && secret) throw new AppError("Status rahasia tidak boleh dinonaktifkan",400);
      const values = hasValue ? {nilaiText:input.nilaiText ?? null,nilaiBoolean:input.nilaiBoolean ?? null,nilaiAngka:input.nilaiAngka ?? null}
        : {nilaiText:existing?.nilaiText ?? null,nilaiBoolean:existing?.nilaiBoolean ?? null,nilaiAngka:existing?.nilaiAngka ?? null};
      const ranges: Record<string, [number, number]> = {
        "security.token_ttl_minutes": [1, 1440], "security.max_login_attempts": [1, 20],
        "security.password_min_length": [8, 72], "smtp.port": [1, 65535],
      };
      const range = ranges[kunci];
      if (range && (typeof values.nilaiAngka !== "number" || !Number.isInteger(values.nilaiAngka) || values.nilaiAngka < range[0] || values.nilaiAngka > range[1])) {
        // Existing Decimal values are preserved on metadata-only updates.
        if (hasValue || !existing) throw new AppError("Nilai angka konfigurasi tidak valid",400);
      }
      if (secret && values.nilaiText === "") throw new AppError("Kredensial tidak boleh kosong; gunakan null untuk menghapus nilai",400);
      if (secret && (values.nilaiBoolean !== null || values.nilaiAngka !== null)) throw new AppError("Kredensial rahasia wajib menggunakan nilaiText",400);
      if (hasValue && values.nilaiText !== null && /^\*{3,}$/.test(values.nilaiText)) throw new AppError("Jangan kirim nilai masking; hilangkan nilaiText untuk mempertahankan kredensial",400);
      if (secret && values.nilaiText !== null && (hasValue || !existing?.isRahasia)) values.nilaiText = encryptData(values.nilaiText,kunci);
      const data = {...values,kategori,isRahasia:secret, ...(input.keterangan !== undefined && {keterangan:input.keterangan}), diperbaruiOleh:req.user!.userId};
      const saved = await tx.konfigurasiSistem.upsert({where:{kunci},create:{kunci,...data},update:data});
      return {saved,created:!existing};
    });
    return successResponse(res,"Konfigurasi tersimpan",sanitized(result.saved),result.created?201:200);
  } catch(error) { safeError(error,next); }
}
export async function deleteKonfigurasiSistem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const kunci = keySchema.parse(req.params.kunci);
    const deleted = await prisma.konfigurasiSistem.deleteMany({where:{kunci}});
    if (!deleted.count) throw new AppError("Konfigurasi tidak ditemukan",404);
    return successResponse(res,"Konfigurasi berhasil dihapus",null);
  } catch(error) { safeError(error,next); }
}

