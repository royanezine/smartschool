import { NextFunction, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { paginationMeta } from "../utils/pagination";
import { resolveSchoolId } from "../utils/schoolScope";
import { successResponse } from "../utils/responseFormatter";
import { pendaftarQuerySchema } from "../validations/pendaftarQuery.validation";

function pendaftarFilter(req: AuthRequest) {
  const query = pendaftarQuerySchema.parse(req.query);
  const sekolahId = resolveSchoolId(req.user, query.sekolahId);
  const where: Prisma.PendaftaranPpdbWhereInput = {
    dihapusPada: null,
    ...(sekolahId && { sekolahId }),
    ...(query.jalurPpdbId && { jalurPpdbId: query.jalurPpdbId }),
    ...(query.gelombangPpdbId && { gelombangPpdbId: query.gelombangPpdbId }),
    ...(query.status && { status: query.status }),
    ...(query.search && {
      OR: [
        { namaLengkap: { contains: query.search, mode: "insensitive" } },
        { nisn: { contains: query.search, mode: "insensitive" } },
        { nomorPendaftaran: { contains: query.search, mode: "insensitive" } },
      ],
    }),
  };
  return { query, where };
}

async function countPendaftar(where: Prisma.PendaftaranPpdbWhereInput) {
  const groups = await prisma.pendaftaranPpdb.groupBy({
    by: ["status"], where, _count: { _all: true },
  });
  const statistik = { total: 0, menunggu: 0, lulus: 0, ditolak: 0 };
  for (const group of groups) {
    statistik.total += group._count._all;
    if (group.status === "menunggu" || group.status === "lulus" || group.status === "ditolak") {
      statistik[group.status] += group._count._all;
    }
  }
  return statistik;
}

export async function getPendaftar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { query, where } = pendaftarFilter(req);
    const [data, statistik] = await Promise.all([
      prisma.pendaftaranPpdb.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: { jalurPpdb: true, gelombangPpdb: true },
        orderBy: [{ dibuatPada: "desc" }, { id: "asc" }],
      }),
      countPendaftar(where),
    ]);
    return res.json({
      success: true, message: "Data pendaftar berhasil diambil", data,
      meta: paginationMeta(query.page, query.limit, statistik.total), statistik,
    });
  } catch (error) { next(error); }
}

export async function getStatistikPendaftar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { where } = pendaftarFilter(req);
    return successResponse(res, "Statistik pendaftar berhasil diambil", await countPendaftar(where));
  } catch (error) { next(error); }
}

export async function getDetailPendaftar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const requestedSchoolId = z.string().uuid().optional().parse(req.query.sekolahId);
    const sekolahId = resolveSchoolId(req.user, requestedSchoolId);
    const data = await prisma.pendaftaranPpdb.findFirst({
      where: { id, dihapusPada: null, ...(sekolahId && { sekolahId }) },
      include: {
        jalurPpdb: true, gelombangPpdb: true,
        berkasPpdb: { where: { dihapusPada: null }, orderBy: { dibuatPada: "asc" } },
        hasilSeleksiPpdb: true,
        pengguna: { select: { id: true, namaLengkap: true, namaPengguna: true, nisn: true } },
      },
    });
    if (!data) throw new AppError("Pendaftar tidak ditemukan", 404, "RESOURCE_NOT_FOUND");
    return successResponse(res, "Detail pendaftar berhasil diambil", {
      ...data,
      hasilSeleksiPpdb: data.hasilSeleksiPpdb?.dihapusPada ? null : data.hasilSeleksiPpdb,
    });
  } catch (error) { next(error); }
}
