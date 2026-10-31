import { NextFunction, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { paginationQuery, paginationMeta } from "../utils/pagination";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";

const querySchema = z.object({ ...paginationQuery, search: z.string().trim().max(100).optional(), status: z.string().max(20).optional() });
export async function platformSchools(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = querySchema.parse(req.query);
    const id = req.params.id ? z.string().uuid().parse(req.params.id) : undefined;
    const where = { dihapusPada: null, ...(id && { id }), ...(query.status && { status: query.status }), ...(query.search && { nama: { contains: query.search, mode: "insensitive" as const } }) };
    const select = { id: true, nama: true, subdomain: true, kode: true, npsn: true, status: true, jenjang: true, alamat: true, telepon: true, email: true, dibuatPada: true,
      yayasan: { select: { id: true, nama: true } },
      langgananSekolah: { orderBy: { dibuatPada: "desc" as const }, take: 1, select: { id: true, statusLangganan: true, tanggalMulai: true, tanggalBerakhir: true, paket: { select: { id: true, nama: true } } } },
      _count: { select: { pengguna: { where: { dihapusPada: null } }, kelas: { where: { dihapusPada: null } } } },
    };
    if (id) {
      const data = await prisma.sekolah.findFirst({ where, select });
      if (!data) throw new AppError("Sekolah tidak ditemukan", 404);
      return successResponse(res, "Detail sekolah", data);
    }
    const [data, total] = await Promise.all([prisma.sekolah.findMany({ where, select, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: [{ dibuatPada: "desc" }, { id: "asc" }] }), prisma.sekolah.count({ where })]);
    return res.json({ success: true, data, meta: paginationMeta(query.page, query.limit, total) });
  } catch (error) { next(error); }
}
export async function platformFoundations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = querySchema.parse(req.query);
    const id = req.params.id ? z.string().uuid().parse(req.params.id) : undefined;
    const where = { dihapusPada: null, ...(id && { id }), ...(query.status && { status: query.status }), ...(query.search && { nama: { contains: query.search, mode: "insensitive" as const } }) };
    const select = { id: true, nama: true, npyp: true, status: true, alamat: true, telepon: true, email: true, dibuatPada: true,
      statusLangganan: true, tanggalMulaiLangganan: true, tanggalBerakhirLangganan: true,
      paket: { select: { id: true, nama: true } }, _count: { select: { sekolah: { where: { dihapusPada: null } } } },
    };
    if (id) {
      const data = await prisma.yayasan.findFirst({ where, select });
      if (!data) throw new AppError("Yayasan tidak ditemukan", 404);
      return successResponse(res, "Detail yayasan", data);
    }
    const [data, total] = await Promise.all([prisma.yayasan.findMany({ where, select, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: [{ dibuatPada: "desc" }, { id: "asc" }] }), prisma.yayasan.count({ where })]);
    return res.json({ success: true, data, meta: paginationMeta(query.page, query.limit, total) });
  } catch (error) { next(error); }
}
export async function platformSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const [totalSekolah, totalYayasan, totalPengguna, sekolahAktif, trial, paid] = await Promise.all([
      prisma.sekolah.count({ where: { dihapusPada: null } }), prisma.yayasan.count({ where: { dihapusPada: null } }),
      prisma.pengguna.count({ where: { dihapusPada: null } }), prisma.sekolah.count({ where: { dihapusPada: null, status: "aktif" } }),
      prisma.sekolah.count({ where: { dihapusPada: null, langgananSekolah: { some: { statusLangganan: "trialing", tanggalMulai: { lte: now }, tanggalBerakhir: { gte: now } } } } }),
      prisma.sekolah.count({ where: { dihapusPada: null, langgananSekolah: { some: { statusLangganan: "active", tanggalMulai: { lte: now }, tanggalBerakhir: { gte: now } } } } }),
    ]);
    return successResponse(res, "Ringkasan platform", { totalSekolah, totalYayasan, totalPengguna, sekolahAktif, langgananTrialAktif: trial, langgananBerbayarAktif: paid, dihitungPada: now });
  } catch (error) { next(error); }
}
