import { NextFunction, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { resolveSchoolId } from "../utils/schoolScope";
import { successResponse } from "../utils/responseFormatter";
import { gelombangPpdbQuerySchema, gelombangPpdbSchema } from "../validations/gelombangPpdb.validation";

const includeJalur = { jalurPpdb: { select: { id: true, nama: true } } };

function scope(req: AuthRequest) {
  const query = gelombangPpdbQuerySchema.parse(req.query);
  const sekolahId = resolveSchoolId(req.user, query.sekolahId);
  return { query, where: { dihapusPada: null, ...(sekolahId && { sekolahId }) }, sekolahId };
}

async function checkJalur(jalurPpdbId: string | null | undefined, sekolahId: string) {
  if (!jalurPpdbId) return;
  const jalur = await prisma.jalurPpdb.findFirst({
    where: { id: jalurPpdbId, sekolahId, dihapusPada: null }, select: { id: true },
  });
  if (!jalur) throw new AppError("Jalur PPDB tidak ditemukan di sekolah ini", 404, "RESOURCE_NOT_FOUND");
}

export async function getGelombangPpdb(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { query, where } = scope(req);
    const data = await prisma.gelombangPpdb.findMany({
      where: {
        ...where,
        ...(query.status && { status: query.status }),
        ...(query.jalurPpdbId && { jalurPpdbId: query.jalurPpdbId }),
        ...(query.search && { nama: { contains: query.search, mode: "insensitive" } }),
      },
      include: includeJalur,
      orderBy: [{ tanggalMulai: "asc" }, { id: "asc" }],
    });
    return successResponse(res, "Data gelombang PPDB berhasil diambil", data);
  } catch (error) { next(error); }
}

export async function getGelombangPpdbById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { where } = scope(req);
    const id = z.string().uuid().parse(req.params.id);
    const data = await prisma.gelombangPpdb.findFirst({ where: { ...where, id }, include: includeJalur });
    if (!data) throw new AppError("Gelombang PPDB tidak ditemukan", 404, "RESOURCE_NOT_FOUND");
    return successResponse(res, "Detail gelombang PPDB berhasil diambil", data);
  } catch (error) { next(error); }
}

export async function createGelombangPpdb(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sekolahId } = scope(req);
    if (!sekolahId) throw new AppError("Sekolah wajib dipilih untuk membuat gelombang", 400);
    const body = gelombangPpdbSchema.parse(req.body);
    const sekolah = await prisma.sekolah.findFirst({
      where: { id: sekolahId, status: "aktif", dihapusPada: null }, select: { id: true },
    });
    if (!sekolah) throw new AppError("Sekolah tidak ditemukan atau tidak aktif", 404, "RESOURCE_NOT_FOUND");
    await checkJalur(body.jalurPpdbId, sekolahId);
    const data = await prisma.gelombangPpdb.create({
      data: {
        ...body, sekolahId, status: body.status ?? "aktif",
        dibuatOleh: req.user!.userId, diperbaruiOleh: req.user!.userId,
      },
      include: includeJalur,
    });
    return successResponse(res, "Gelombang PPDB berhasil dibuat", data, 201);
  } catch (error) { next(error); }
}

export async function updateGelombangPpdb(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { where } = scope(req);
    const id = z.string().uuid().parse(req.params.id);
    const body = gelombangPpdbSchema.parse(req.body);
    const existing = await prisma.gelombangPpdb.findFirst({ where: { ...where, id } });
    if (!existing) throw new AppError("Gelombang PPDB tidak ditemukan", 404, "RESOURCE_NOT_FOUND");
    await checkJalur(body.jalurPpdbId, existing.sekolahId);
    const data = await prisma.gelombangPpdb.update({
      where: { ...where, id }, data: { ...body, diperbaruiOleh: req.user!.userId }, include: includeJalur,
    });
    return successResponse(res, "Gelombang PPDB berhasil diperbarui", data);
  } catch (error) { next(error); }
}

export async function deleteGelombangPpdb(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { where } = scope(req);
    const id = z.string().uuid().parse(req.params.id);
    const existing = await prisma.gelombangPpdb.findFirst({ where: { ...where, id }, select: { id: true } });
    if (!existing) throw new AppError("Gelombang PPDB tidak ditemukan", 404, "RESOURCE_NOT_FOUND");
    await prisma.gelombangPpdb.update({
      where: { ...where, id },
      data: { status: "nonaktif", dihapusPada: new Date(), dihapusOleh: req.user!.userId, diperbaruiOleh: req.user!.userId },
    });
    return successResponse(res, "Gelombang PPDB berhasil dihapus");
  } catch (error) { next(error); }
}
