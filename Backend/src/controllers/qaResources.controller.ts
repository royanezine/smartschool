import { NextFunction, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { resolveSchoolId } from "../utils/schoolScope";
import { paginationQuery, paginationMeta } from "../utils/pagination";
import { successResponse } from "../utils/responseFormatter";

const idSchema = z.string().uuid();
const querySchema = z.object({ ...paginationQuery, sekolahId: idSchema.optional(), search: z.string().max(100).optional(), siswaId: idSchema.optional() });
const text = z.string().trim().max(10000).nullable().optional();
const jurusanSchema = z.object({
  kode: z.string().trim().min(1).max(20), nama: z.string().trim().min(1).max(100),
  deskripsi: text, status: z.enum(["aktif", "nonaktif"]).default("aktif"),
}).strict();
const pengumumanSchema = z.object({
  judul: z.string().trim().min(1).max(200), konten: z.string().trim().min(1).max(100000),
  status: z.enum(["draft", "dipublikasikan"]).default("draft"),
  dipublikasikanPada: z.string().datetime({ offset: true }).transform(v => new Date(v)).nullable().optional(),
}).strict();

export function schoolContext(req: AuthRequest) {
  const query = querySchema.parse(req.query);
  const sekolahId = resolveSchoolId(req.user, query.sekolahId);
  if (!sekolahId) throw new AppError("sekolahId wajib dipilih", 400);
  return { sekolahId, query };
}

export async function jurusanResource(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sekolahId, query } = schoolContext(req);
    const id = req.params.id ? idSchema.parse(req.params.id) : undefined;
    const where = { sekolahId, dihapusPada: null };
    if (req.method === "GET" && !id) {
      const filter = { ...where, ...(query.search && { OR: [
        { nama: { contains: query.search, mode: "insensitive" as const } },
        { kode: { contains: query.search, mode: "insensitive" as const } },
      ] }) };
      const [data, total] = await Promise.all([
        prisma.jurusan.findMany({ where: filter, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { nama: "asc" }, include: { _count: { select: { kelas: { where: { dihapusPada: null } } } } } }),
        prisma.jurusan.count({ where: filter }),
      ]);
      return res.json({ success: true, data, meta: paginationMeta(query.page, query.limit, total) });
    }
    const existing = id ? await prisma.jurusan.findFirst({ where: { ...where, id } }) : null;
    if (id && !existing) throw new AppError("Jurusan tidak ditemukan", 404);
    if (req.method === "GET") return successResponse(res, "Detail jurusan", existing);
    if (req.method === "DELETE") {
      if (await prisma.kelas.count({ where: { jurusanId: id, dihapusPada: null } })) throw new AppError("Jurusan masih digunakan kelas", 409);
      await prisma.jurusan.update({ where: { id }, data: { dihapusPada: new Date(), dihapusOleh: req.user!.userId } });
      return successResponse(res, "Jurusan dihapus");
    }
    const data = id ? jurusanSchema.partial().parse(req.body) : jurusanSchema.parse(req.body);
    const result = id
      ? await prisma.jurusan.update({ where: { id }, data: { ...data, diperbaruiOleh: req.user!.userId } })
      : await prisma.jurusan.create({ data: { ...jurusanSchema.parse(data), sekolahId, dibuatOleh: req.user!.userId } });
    return successResponse(res, "Jurusan disimpan", result, id ? 200 : 201);
  } catch (error) { next(error); }
}

export async function pengumumanResource(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sekolahId, query } = schoolContext(req);
    const id = req.params.id ? idSchema.parse(req.params.id) : undefined;
    const where = { sekolahId, dihapusPada: null };
    if (req.method === "GET" && !id) {
      const [data, total] = await Promise.all([
        prisma.pengumumanPpdb.findMany({ where, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { dibuatPada: "desc" } }),
        prisma.pengumumanPpdb.count({ where }),
      ]);
      return res.json({ success: true, data, meta: paginationMeta(query.page, query.limit, total) });
    }
    const existing = id ? await prisma.pengumumanPpdb.findFirst({ where: { ...where, id } }) : null;
    if (id && !existing) throw new AppError("Pengumuman tidak ditemukan", 404);
    if (req.method === "GET") return successResponse(res, "Detail pengumuman", existing);
    if (req.method === "DELETE") {
      await prisma.pengumumanPpdb.update({ where: { id }, data: { dihapusPada: new Date(), dihapusOleh: req.user!.userId } });
      return successResponse(res, "Pengumuman dihapus");
    }
    const data = id ? pengumumanSchema.partial().parse(req.body) : pengumumanSchema.parse(req.body);
    const publication = (data.status ?? existing?.status) === "dipublikasikan"
      ? data.dipublikasikanPada ?? existing?.dipublikasikanPada ?? new Date() : null;
    const result = id
      ? await prisma.pengumumanPpdb.update({ where: { id }, data: { ...data, dipublikasikanPada: publication, diperbaruiOleh: req.user!.userId } })
      : await prisma.pengumumanPpdb.create({ data: { ...data as z.output<typeof pengumumanSchema>, dipublikasikanPada: publication, sekolahId, dibuatOleh: req.user!.userId } });
    return successResponse(res, "Pengumuman disimpan", result, id ? 200 : 201);
  } catch (error) { next(error); }
}
