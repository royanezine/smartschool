import { NextFunction, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { parseDateOnly } from "../utils/dateOnly";
import { schoolContext } from "./qaResources.controller";
import { paginationMeta } from "../utils/pagination";

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const fields = {
  namaLengkap: z.string().trim().min(2).max(100), email: z.string().email().max(100),
  namaPengguna: z.string().trim().min(1).max(50), nisn: optionalText(20), nis: optionalText(20), nipd: optionalText(20),
  nik: z.string().regex(/^\d{16}$/).nullable().optional(), jenisKelamin: optionalText(10),
  tempatLahir: optionalText(50), tanggalLahir: z.string().transform(v => parseDateOnly(v, "tanggalLahir")).nullable().optional(),
  alamat: optionalText(10000), alamatKtp: optionalText(10000), alamatDomisili: optionalText(10000),
  alamatSesuaiDomisili: z.boolean().optional(), provinsi: optionalText(50), kotaKabupaten: optionalText(50),
  kecamatan: optionalText(50), kelurahan: optionalText(50), kodePos: optionalText(10), noTelepon: optionalText(20),
  namaAyah: optionalText(100), nikAyah: optionalText(20), pekerjaanAyah: optionalText(50), noHpAyah: optionalText(20),
  namaIbu: optionalText(100), nikIbu: optionalText(20), pekerjaanIbu: optionalText(50), noHpIbu: optionalText(20),
  namaWaliPesertaDidik: optionalText(20),
  kelasId: z.string().uuid().nullable().optional(), tahunAjaranId: z.string().uuid().optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
};
const createSchema = z.object({ ...fields, kataSandi: z.string().min(8).max(72).refine(v => Buffer.byteLength(v) <= 72) }).strict();
const updateSchema = z.object(fields).partial().strict();
const select = {
  id: true, sekolahId: true, namaPengguna: true, email: true, namaLengkap: true,
  nisn: true, nis: true, nipd: true, nik: true, status: true, jenisKelamin: true,
  tempatLahir: true, tanggalLahir: true, alamat: true, alamatKtp: true, alamatDomisili: true,
  alamatSesuaiDomisili: true, provinsi: true, kotaKabupaten: true, kecamatan: true,
  kelurahan: true, kodePos: true, noTelepon: true, namaAyah: true, nikAyah: true,
  pekerjaanAyah: true, noHpAyah: true, namaIbu: true, nikIbu: true, pekerjaanIbu: true,
  noHpIbu: true, namaWaliPesertaDidik: true,
  kelasSiswa: { where: { dihapusPada: null, status: "aktif", kelas: { dihapusPada: null } }, select: { id: true, kelasId: true, tahunAjaranId: true, kelas: { select: { id: true, nama: true, tahunAjaranId: true } } } },
} satisfies Prisma.PenggunaSelect;

export async function studentProfiles(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sekolahId, query } = schoolContext(req);
    const id = req.params.id ? z.string().uuid().parse(req.params.id) : undefined;
    const where: Prisma.PenggunaWhereInput = { sekolahId, dihapusPada: null, peran: { nama: "siswa" } };
    if (req.method === "GET") {
      if (id) {
        const data = await prisma.pengguna.findFirst({ where: { ...where, id }, select });
        if (!data) throw new AppError("Siswa tidak ditemukan", 404);
        return successResponse(res, "Detail siswa", data);
      }
      if (query.search) where.OR = [{ namaLengkap: { contains: query.search, mode: "insensitive" } }, { nisn: { contains: query.search, mode: "insensitive" } }];
      const [data, total] = await Promise.all([
        prisma.pengguna.findMany({ where, select, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: [{ namaLengkap: "asc" }, { id: "asc" }] }),
        prisma.pengguna.count({ where }),
      ]);
      return res.json({ success: true, message: "Data siswa berhasil diambil", data, meta: paginationMeta(query.page, query.limit, total) });
    }
    const parsed = id ? updateSchema.parse(req.body) : createSchema.parse(req.body);
    const { kelasId, tahunAjaranId, ...profile } = parsed;
    const { kataSandi, ...data } = profile as typeof profile & { kataSandi?: string };
    const hash = kataSandi ? await bcrypt.hash(kataSandi, 12) : undefined;
    const actor = req.user!.userId;
    const result = await prisma.$transaction(async tx => {
      if (id) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`student:${id}`}))`;
        if (!await tx.pengguna.findFirst({ where: { ...where, id }, select: { id: true } })) throw new AppError("Siswa tidak ditemukan", 404);
      }
      let selectedClass: { id: string; tahunAjaranId: string; kapasitas: number | null } | null = null;
      if (kelasId) {
        await tx.$executeRaw`SELECT id FROM kelas WHERE id = ${kelasId} FOR UPDATE`;
        selectedClass = await tx.kelas.findFirst({ where: { id: kelasId, sekolahId, dihapusPada: null, tahunAjaran: { dihapusPada: null } }, select: { id: true, tahunAjaranId: true, kapasitas: true } });
        if (!selectedClass || (tahunAjaranId && selectedClass.tahunAjaranId !== tahunAjaranId)) throw new AppError("Kelas/tahun ajaran tidak sesuai sekolah", 400);
        const count = await tx.anggotaKelas.count({ where: { kelasId, status: "aktif", dihapusPada: null, ...(id && { penggunaId: { not: id } }) } });
        if (selectedClass.kapasitas && count >= selectedClass.kapasitas) throw new AppError("Kapasitas kelas penuh", 409);
      } else if (kelasId === null && !tahunAjaranId) throw new AppError("tahunAjaranId diperlukan untuk melepas kelas", 400);
      if (tahunAjaranId && !await tx.tahunAjaran.findFirst({ where: { id: tahunAjaranId, sekolahId, dihapusPada: null }, select: { id: true } })) throw new AppError("Tahun ajaran tidak ditemukan", 400);
      let userId = id;
      if (id) await tx.pengguna.update({ where: { id }, data: { ...data, diperbaruiOleh: actor } });
      else {
        const role = await tx.peran.findFirst({ where: { nama: "siswa", status: "aktif", dihapusPada: null, OR: [{ sekolahId }, { sekolahId: null }] }, orderBy: { sekolahId: { sort: "desc", nulls: "last" } } });
        if (!role) throw new AppError("Role siswa belum dikonfigurasi", 409);
        const user = await tx.pengguna.create({ data: { ...data as z.output<typeof createSchema>, kataSandi: hash!, sekolahId, peranId: role.id, status: data.status ?? "aktif", dibuatOleh: actor } });
        userId = user.id;
      }
      if (kelasId !== undefined) {
        const year = selectedClass?.tahunAjaranId ?? tahunAjaranId!;
        await tx.anggotaKelas.updateMany({ where: { penggunaId: userId, tahunAjaranId: year, dihapusPada: null }, data: { status: "nonaktif", dihapusPada: new Date(), dihapusOleh: actor } });
        if (selectedClass) await tx.anggotaKelas.create({ data: { penggunaId: userId!, kelasId: selectedClass.id, tahunAjaranId: year, status: "aktif", dibuatOleh: actor } });
      }
      return tx.pengguna.findUniqueOrThrow({ where: { id: userId }, select });
    });
    return successResponse(res, id ? "Siswa diperbarui" : "Siswa dibuat", result, id ? 200 : 201);
  } catch (error) { next(error); }
}
