import { NextFunction, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { paginationMeta } from "../utils/pagination";
import { normalizeRole } from "../utils/rbac";
import { createReviewSchema, updateReviewSchema, adminCreateReviewSchema, adminUpdateReviewSchema, reviewQuerySchema } from "../validations/review.validation";

const identity = { id: true, namaLengkap: true, jabatan: true, peran: { select: { nama: true, namaTampilan: true } } } as const;
const include = { pengguna: { select: identity } } as const;
async function assertReviewer(penggunaId: string) {
  if (!await prisma.pengguna.findFirst({ where: { id: penggunaId, status: "aktif", dihapusPada: null,
    peran: { nama: { in: ["admin_yayasan", "admin_sekolah"] }, status: "aktif", dihapusPada: null } }, select: { id: true } })) throw new AppError("Pengguna review harus Admin Yayasan atau Admin Sekolah aktif", 400);
}
export async function ownReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!["admin_yayasan", "admin_sekolah"].includes(normalizeRole(req.user?.role))) throw new AppError("Review hanya untuk Admin Yayasan dan Admin Sekolah", 403);
    const penggunaId = req.user!.userId;
    if (req.method === "GET") return successResponse(res, "Review saya", await prisma.reviewPengguna.findUnique({ where: { penggunaId }, include }));
    const data = req.method === "POST" ? createReviewSchema.parse(req.body) : updateReviewSchema.parse(req.body);
    const review = req.method === "POST"
      ? await prisma.reviewPengguna.create({ data: { ...createReviewSchema.parse(data), penggunaId, status: "menunggu" }, include })
      : await prisma.reviewPengguna.update({ where: { penggunaId }, data: { ...data, status: "menunggu" }, include });
    return successResponse(res, "Review disimpan dan menunggu moderasi", review, req.method === "POST" ? 201 : 200);
  } catch (error) { next(error); }
}
export async function manageReviews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id ? z.string().uuid().parse(req.params.id) : undefined;
    if (req.method === "GET" && !id) {
      const { page, limit, ...filters } = reviewQuerySchema.parse(req.query);
      const where: Prisma.ReviewPenggunaWhereInput = filters;
      const [data, total] = await Promise.all([
        prisma.reviewPengguna.findMany({ where, include, skip: (page - 1) * limit, take: limit, orderBy: [{ dibuatPada: "desc" }, { id: "asc" }] }),
        prisma.reviewPengguna.count({ where }),
      ]);
      return res.json({ success: true, data, meta: paginationMeta(page, limit, total) });
    }
    if (req.method === "GET") {
      const data = await prisma.reviewPengguna.findUnique({ where: { id }, include });
      if (!data) throw new AppError("Review tidak ditemukan", 404);
      return successResponse(res, "Detail review", data);
    }
    if (req.method === "POST") {
      const data = adminCreateReviewSchema.parse(req.body);
      await assertReviewer(data.penggunaId);
      return successResponse(res, "Review dibuat", await prisma.reviewPengguna.create({ data, include }), 201);
    }
    if (req.method === "DELETE") {
      await prisma.reviewPengguna.delete({ where: { id } });
      return successResponse(res, "Review dihapus");
    }
    const { diperbaruiPada, ...data } = adminUpdateReviewSchema.parse(req.body);
    const result = await prisma.reviewPengguna.updateMany({ where: { id, ...(diperbaruiPada && { diperbaruiPada: new Date(diperbaruiPada) }) }, data: {
      ...data, ...((data.rating !== undefined || data.komentar !== undefined) && data.status === undefined && { status: "menunggu" }),
    } });
    if (!result.count) {
      if (!await prisma.reviewPengguna.findUnique({ where: { id }, select: { id: true } })) throw new AppError("Review tidak ditemukan", 404);
      throw new AppError("Review telah berubah; muat ulang sebelum moderasi", 409);
    }
    return successResponse(res, "Review diperbarui", await prisma.reviewPengguna.findUnique({ where: { id }, include }));
  } catch (error) { next(error); }
}
export async function publicReviews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = reviewQuerySchema.pick({ page: true, limit: true }).parse(req.query);
    const where: Prisma.ReviewPenggunaWhereInput = { status: "tampil", pengguna: { status: "aktif", dihapusPada: null, peran: { status: "aktif", dihapusPada: null, nama: { in: ["admin_yayasan", "admin_sekolah"] } } } };
    const [data, total] = await Promise.all([
      prisma.reviewPengguna.findMany({ where, select: { id: true, rating: true, komentar: true, dibuatPada: true,
        pengguna: { select: { namaLengkap: true, jabatan: true, peran: { select: { nama: true, namaTampilan: true } } } } },
        skip: (page - 1) * limit, take: limit, orderBy: [{ dibuatPada: "desc" }, { id: "asc" }] }),
      prisma.reviewPengguna.count({ where }),
    ]);
    return res.json({ success: true, data, meta: paginationMeta(page, limit, total) });
  } catch (error) { next(error); }
}
