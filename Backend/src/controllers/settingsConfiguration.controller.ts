import { NextFunction, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { schoolContext } from "./qaResources.controller";
import { activeDaysSchema, aggregateSchema, aggregateKey, readSetting, writeSetting } from "../utils/schoolSettings";

export async function attendanceSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sekolahId } = schoolContext(req);
    if (req.method === "GET") return successResponse(res, "Hari aktif presensi", await readSetting(sekolahId, "hari_aktif_presensi", { hariAktif: [0,1,2,3,4,5,6] }));
    const data = activeDaysSchema.parse(req.body);
    data.hariAktif.sort();
    await prisma.$transaction(tx => writeSetting(tx, sekolahId, "hari_aktif_presensi", data, req.user!.userId));
    return successResponse(res, "Hari aktif presensi disimpan", data);
  } catch (error) { next(error); }
}

export async function aggregateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sekolahId } = schoolContext(req);
    const year = z.string().uuid().parse(req.method === "GET" ? req.query.tahunAjaranId : req.body.tahunAjaranId);
    if (!await prisma.tahunAjaran.findFirst({ where: { id: year, sekolahId, dihapusPada: null }, select: { id: true } })) throw new AppError("Tahun ajaran tidak ditemukan", 404);
    if (req.method === "GET") return successResponse(res, "Agregat rapor", await readSetting(sekolahId, aggregateKey(year), { tahunAjaranId: year, mataPelajaran: [] }));
    const data = aggregateSchema.parse(req.body);
    await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${sekolahId}:nilai:${year}`}))`;
      if (await tx.nilaiAkhirMapel.count({ where: { sekolahId, status: "final", dihapusPada: null, kelasMapel: { kelas: { tahunAjaranId: year } } } })) throw new AppError("Tahun ajaran memiliki nilai final; batalkan finalisasi sebelum mengubah agregat", 409);
      const count = await tx.mataPelajaran.count({ where: { id: { in: data.mataPelajaran.map(m => m.mataPelajaranId) }, sekolahId, dihapusPada: null } });
      if (count !== data.mataPelajaran.length) throw new AppError("Mata pelajaran tidak ditemukan di sekolah ini", 400);
      await writeSetting(tx, sekolahId, aggregateKey(year), data, req.user!.userId);
    });
    return successResponse(res, "Agregat rapor disimpan", data);
  } catch (error) { next(error); }
}

const globalSchema = z.object({
  namaAplikasi: z.string().trim().min(1).max(100),
  emailDukungan: z.string().email().max(100).nullable(),
  teleponDukungan: z.string().trim().max(30).nullable(),
  logoUrl: z.string().url().max(255).nullable(),
}).strict();
export async function globalSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.method === "GET") return successResponse(res, "Pengaturan global", await readSetting(null, "identitas_platform", { namaAplikasi: "SmartSchool", emailDukungan: null, teleponDukungan: null, logoUrl: null }));
    const data = globalSchema.parse(req.body);
    await prisma.$transaction(tx => writeSetting(tx, null, "identitas_platform", data, req.user!.userId));
    return successResponse(res, "Pengaturan global disimpan", data);
  } catch (error) { next(error); }
}
