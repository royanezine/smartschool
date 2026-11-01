import { Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/appError";
import { normalizeRole } from "../utils/rbac";
export { platformFoundations as listYayasan } from "./platformDirectory.controller";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { successResponse } from "../utils/responseFormatter";

// 1. Mengambil Daftar Sekolah Binaan (Sudah ada, dipertahankan)
export const getSekolahBinaan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.yayasanId) {
      return res.status(403).json({ success: false, message: "Akses ditolak: Khusus Admin Yayasan" });
    }

    const sekolah = await prisma.sekolah.findMany({
      where: { yayasanId: req.user.yayasanId, dihapusPada: null },
      select: {
        id: true,
        nama: true,
        subdomain: true,
        status: true,
        telepon: true,
        email: true,
        logoBesarUrl: true,
        langgananSekolah: {
          orderBy: { dibuatPada: 'desc' },
          take: 1,
          select: { statusLangganan: true, tanggalBerakhir: true, paket: { select: { nama: true } } }
        }
      },
      orderBy: { dibuatPada: 'desc' }
    });

    return successResponse(res, "Berhasil mengambil data sekolah binaan", sekolah);
  } catch (error) {
    console.error("Error getSekolahBinaan:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// 2. Metrik Dashboard (Total Sekolah, Status Aktif, dll)
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.yayasanId) {
      return res.status(403).json({ success: false, message: "Akses ditolak: Khusus Admin Yayasan" });
    }

    const yayasanId = req.user.yayasanId;

    const totalSekolah = await prisma.sekolah.count({ where: { yayasanId, dihapusPada: null } });
    const sekolahAktif = await prisma.sekolah.count({ where: { yayasanId, status: "aktif", dihapusPada: null } });
    const sekolahUjiCoba = await prisma.sekolah.count({ where: { yayasanId, status: "uji coba", dihapusPada: null } });

    // Hitung total pengguna (Siswa & Guru) di bawah yayasan ini
    const totalPengguna = await prisma.pengguna.count({
      where: {
        sekolah: { yayasanId },
        peran: { nama: { in: ["siswa", "guru"] } },
        status: "aktif",
        dihapusPada: null
      }
    });

    const data = {
      totalSekolah,
      sekolahAktif,
      sekolahUjiCoba,
      totalPenggunaAktif: totalPengguna
    };

    return successResponse(res, "Berhasil mengambil metrik dashboard yayasan", data);
  } catch (error) {
    console.error("Error getDashboardSummary:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

const foundationSchema = z.object({
  nama: z.string().trim().min(3).max(100), npyp: z.string().trim().min(3).max(50),
  alamat: z.string().max(10000).nullable().optional(), telepon: z.string().max(20).nullable().optional(),
  email: z.string().email().max(100).nullable().optional(), status: z.enum(["aktif", "nonaktif"]).optional(),
}).strict();
const adminSchema = z.object({ namaPengguna: z.string().trim().min(1).max(50), namaLengkap: z.string().trim().min(2).max(100),
  email: z.string().email().max(100), kataSandi: z.string().min(8).max(72).refine(v => Buffer.byteLength(v) <= 72),
  status: z.enum(["aktif", "nonaktif"]).optional(),
}).strict();

async function foundationScope(req: AuthRequest) {
  const id = z.string().uuid().parse(req.params.yayasanId);
  if (normalizeRole(req.user?.role) !== "super_admin" && (normalizeRole(req.user?.role) !== "admin_yayasan" || req.user?.yayasanId !== id)) throw new AppError("Akses yayasan lain ditolak", 403);
  if (!await prisma.yayasan.findFirst({ where: { id, dihapusPada: null }, select: { id: true } })) throw new AppError("Yayasan tidak ditemukan", 404);
  return id;
}

export async function manageYayasan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.method === "POST") {
      const data = foundationSchema.parse(req.body);
      return successResponse(res, "Yayasan dibuat", await prisma.yayasan.create({ data: { ...data, status: data.status ?? "aktif", dibuatOleh: req.user!.userId } }), 201);
    }
    const id = await foundationScope(req);
    if (req.method === "GET") return successResponse(res, "Detail yayasan", await prisma.yayasan.findUnique({ where: { id }, include: { paket: true, sekolah: { where: { dihapusPada: null } } } }));
    const data = req.method === "DELETE" ? null : foundationSchema.partial().parse(req.body);
    if (normalizeRole(req.user?.role) !== "super_admin" && data?.status !== undefined) throw new AppError("Status yayasan hanya dapat diubah super admin", 403);
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT id FROM yayasan WHERE id = ${id} FOR UPDATE`;
      if (!data) {
        if (await tx.sekolah.count({ where: { yayasanId: id, dihapusPada: null } })) throw new AppError("Lepaskan sekolah sebelum menghapus yayasan", 409);
        await tx.pengguna.updateMany({ where: { yayasanId: id, sekolahId: null, peran: { nama: "admin_yayasan" }, dihapusPada: null }, data: { status: "nonaktif", dihapusPada: new Date(), dihapusOleh: req.user!.userId } });
        return tx.yayasan.update({ where: { id }, data: { status: "nonaktif", dihapusPada: new Date(), dihapusOleh: req.user!.userId } });
      }
      return tx.yayasan.update({ where: { id }, data: { ...data, diperbaruiOleh: req.user!.userId } });
    });
    return successResponse(res, data ? "Yayasan diperbarui" : "Yayasan dihapus", result);
  } catch (error) { next(error); }
}

export async function manageYayasanAdmins(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const yayasanId = await foundationScope(req);
    const id = req.params.adminId ? z.string().uuid().parse(req.params.adminId) : undefined;
    const select = { id: true, namaLengkap: true, namaPengguna: true, email: true, status: true, yayasanId: true, terakhirLogin: true } as const;
    const where = { yayasanId, sekolahId: null, peran: { nama: "admin_yayasan" }, dihapusPada: null };
    if (req.method === "GET") return successResponse(res, "Admin yayasan", await prisma.pengguna.findMany({ where, select, orderBy: { namaLengkap: "asc" } }));
    const parsed = req.method === "DELETE" ? null : id ? adminSchema.omit({ kataSandi: true }).partial().parse(req.body) : adminSchema.parse(req.body);
    const password = parsed && "kataSandi" in parsed ? await bcrypt.hash(parsed.kataSandi as string, 12) : undefined;
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT id FROM yayasan WHERE id = ${yayasanId} FOR UPDATE`;
      if (id) {
        const existing = await tx.pengguna.findFirst({ where: { ...where, id }, select });
        if (!existing) throw new AppError("Admin yayasan tidak ditemukan", 404);
        if (!parsed || parsed.status === "nonaktif") {
          if (id === req.user!.userId) throw new AppError("Tidak dapat menonaktifkan akun sendiri", 409);
          if (existing.status === "aktif" && await tx.pengguna.count({ where: { ...where, status: "aktif" } }) <= 1) throw new AppError("Yayasan harus memiliki minimal satu admin aktif", 409);
        }
        return tx.pengguna.update({ where: { id }, data: parsed ? { ...parsed, diperbaruiOleh: req.user!.userId } : { status: "nonaktif", dihapusPada: new Date(), dihapusOleh: req.user!.userId }, select });
      }
      const role = await tx.peran.findFirst({ where: { nama: "admin_yayasan", sekolahId: null, status: "aktif", dihapusPada: null } });
      if (!role) throw new AppError("Role admin_yayasan aktif belum dikonfigurasi", 409);
      const data = adminSchema.parse(req.body);
      return tx.pengguna.create({ data: { ...data, kataSandi: password!, yayasanId, sekolahId: null, peranId: role.id, status: data.status ?? "aktif", dibuatOleh: req.user!.userId }, select });
    });
    return successResponse(res, "Admin yayasan disimpan", result, id ? 200 : 201);
  } catch (error) { next(error); }
}

export async function manageYayasanSchools(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const yayasanId = await foundationScope(req);
    if (req.method === "GET") return successResponse(res, "Sekolah yayasan", await prisma.sekolah.findMany({ where: { yayasanId, dihapusPada: null }, include: { langgananSekolah: { take: 1, orderBy: { dibuatPada: "desc" }, include: { paket: true } } }, orderBy: { nama: "asc" } }));
    const sekolahId = z.string().uuid().parse(req.params.sekolahId);
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT id FROM yayasan WHERE id = ${yayasanId} FOR UPDATE`;
      await tx.$executeRaw`SELECT id FROM sekolah WHERE id = ${sekolahId} FOR UPDATE`;
      const school = await tx.sekolah.findFirst({ where: { id: sekolahId, dihapusPada: null } });
      if (!school || (school.yayasanId && school.yayasanId !== yayasanId)) throw new AppError("Sekolah tidak ditemukan atau berada di yayasan lain", 404);
      if (req.method === "DELETE" && school.yayasanId !== yayasanId) throw new AppError("Sekolah bukan anggota yayasan", 404);
      return tx.sekolah.update({ where: { id: sekolahId }, data: { yayasanId: req.method === "DELETE" ? null : yayasanId, diperbaruiOleh: req.user!.userId } });
    });
    return successResponse(res, "Naungan sekolah diperbarui", result);
  } catch (error) { next(error); }
}

// 3. Melihat Detail Statistik Satu Sekolah (Read-Only)
export const getDetailSekolahBinaan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.yayasanId) {
      return res.status(403).json({ success: false, message: "Akses ditolak: Khusus Admin Yayasan" });
    }

    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({ success: false, message: "ID sekolah tidak valid" });
    }

    // Pastikan sekolah ini benar-benar milik yayasan tersebut
    const sekolah = await prisma.sekolah.findFirst({
      where: { id, yayasanId: req.user.yayasanId, dihapusPada: null },
      include: {
        langgananSekolah: {
          orderBy: { dibuatPada: 'desc' },
          take: 1,
          include: { paket: true }
        }
      }
    });

    if (!sekolah) {
      return res.status(404).json({ success: false, message: "Sekolah tidak ditemukan atau tidak berada di bawah naungan Anda" });
    }

    // Ambil statistik jumlah guru dan siswa di sekolah tersebut
    const totalGuru = await prisma.pengguna.count({
      where: { sekolahId: id, peran: { nama: "guru" }, dihapusPada: null }
    });
    const totalSiswa = await prisma.pengguna.count({
      where: { sekolahId: id, peran: { nama: "siswa" }, dihapusPada: null }
    });
    const totalKelas = await prisma.kelas.count({
      where: { sekolahId: id, dihapusPada: null }
    });

    const data = {
      profil: sekolah,
      statistik: { totalGuru, totalSiswa, totalKelas }
    };

    return successResponse(res, "Berhasil mengambil detail sekolah", data);
  } catch (error) {
    console.error("Error getDetailSekolahBinaan:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};
