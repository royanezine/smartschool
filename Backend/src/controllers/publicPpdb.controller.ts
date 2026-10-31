import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { availableSchoolWhere } from "../utils/schoolAvailability";
import { successResponse } from "../utils/responseFormatter";
import { paginationQuery, paginationMeta } from "../utils/pagination";
import { todayDateOnly } from "../utils/dateOnly";

async function publicSchool(req: Request) {
  const subdomain = z.string().trim().min(1).max(50).parse(req.params.subdomain);
  const school = await prisma.sekolah.findFirst({ where: { subdomain, ...availableSchoolWhere() }, select: { id: true, nama: true, subdomain: true, jenjang: true } });
  if (!school) throw new AppError("Sekolah tidak ditemukan", 404);
  return school;
}
export async function publicPpdbOptions(req: Request, res: Response, next: NextFunction) {
  try {
    const sekolah = await publicSchool(req);
    const tanggal = todayDateOnly();
    const jalur = await prisma.jalurPpdb.findMany({ where: { sekolahId: sekolah.id, status: "aktif", dihapusPada: null },
      select: { id: true, nama: true, deskripsi: true, kuota: true, tanggalMulai: true, tanggalSelesai: true }, orderBy: { nama: "asc" } });
    const gelombang = await prisma.gelombangPpdb.findMany({ where: { sekolahId: sekolah.id, status: "aktif", dihapusPada: null },
      select: { id: true, nama: true, jalurPpdbId: true, tanggalMulai: true, tanggalSelesai: true, kuota: true }, orderBy: { tanggalMulai: "asc" } });
    return successResponse(res, "Pilihan PPDB", { sekolah, jalur: jalur.map(j => ({ ...j, pendaftaranDibuka: (!j.tanggalMulai || j.tanggalMulai <= tanggal) && (!j.tanggalSelesai || j.tanggalSelesai >= tanggal) })), gelombang });
  } catch (error) { next(error); }
}
export async function publicPpdbAnnouncements(req: Request, res: Response, next: NextFunction) {
  try {
    const school = await publicSchool(req);
    const query = z.object(paginationQuery).parse(req.query);
    const where = { sekolahId: school.id, dihapusPada: null, status: "dipublikasikan", dipublikasikanPada: { lte: new Date() } };
    const [data, total] = await Promise.all([
      prisma.pengumumanPpdb.findMany({ where, select: { id: true, judul: true, konten: true, dipublikasikanPada: true }, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: [{ dipublikasikanPada: "desc" }, { id: "asc" }] }),
      prisma.pengumumanPpdb.count({ where }),
    ]);
    return res.json({ success: true, data, meta: paginationMeta(query.page, query.limit, total) });
  } catch (error) { next(error); }
}
export async function publicPpdbLookup(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-store");
    const school = await publicSchool(req);
    const input = z.object({ nomorPendaftaran: z.string().trim().min(1).max(20), nik: z.string().regex(/^\d{16}$/) }).strict().parse(req.body);
    const row = await prisma.pendaftaranPpdb.findFirst({ where: { sekolahId: school.id, ...input, dihapusPada: null },
      select: { nomorPendaftaran: true, namaLengkap: true, status: true, jalurPpdb: { select: { nama: true } }, gelombangPpdb: { select: { nama: true } }, hasilSeleksiPpdb: { select: { statusKelulusan: true, dihapusPada: true } } } });
    if (!row) throw new AppError("Pendaftaran tidak ditemukan atau data pencarian tidak sesuai", 404);
    return successResponse(res, "Status pendaftaran", { nomorPendaftaran: row.nomorPendaftaran, namaLengkap: row.namaLengkap, status: row.status, jalur: row.jalurPpdb.nama, gelombang: row.gelombangPpdb?.nama ?? null,
      statusSeleksi: row.hasilSeleksiPpdb?.dihapusPada ? null : row.hasilSeleksiPpdb?.statusKelulusan ?? null });
  } catch (error) { next(error); }
}
