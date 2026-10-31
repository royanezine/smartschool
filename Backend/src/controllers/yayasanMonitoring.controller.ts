import { Request, Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

const ambilSekolahIds = async (yayasanId: string, sekolahId?: string) => {
  const daftar = await prisma.sekolah.findMany({
    where: { yayasanId, dihapusPada: null },
    select: { id: true },
  });
  const ids = daftar.map((s) => s.id);
  if (sekolahId) return ids.includes(sekolahId) ? [sekolahId] : [];
  return ids;
};

export const listUsersLintasSekolah = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user?.yayasanId) {
      return res.status(403).json({
        success: false,
        message: "Akses khusus admin yayasan",
        errorCode: "FORBIDDEN",
      });
    }

    const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? "20"), 10) || 20, 1),
      100,
    );
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const peran = typeof req.query.peran === "string" ? req.query.peran : "";
    const sekolahId =
      typeof req.query.sekolahId === "string" ? req.query.sekolahId : undefined;

    const sekolahIds = await ambilSekolahIds(user.yayasanId, sekolahId);
    if (sekolahIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const where: any = {
      sekolahId: { in: sekolahIds },
      dihapusPada: null,
    };
    if (peran) where.peran = { nama: peran };
    if (q) {
      where.OR = [
        { namaLengkap: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { namaPengguna: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.pengguna.count({ where }),
      prisma.pengguna.findMany({
        where,
        orderBy: { namaLengkap: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          namaPengguna: true,
          namaLengkap: true,
          email: true,
          status: true,
          sekolahId: true,
          sekolah: { select: { id: true, nama: true } },
          peran: { select: { id: true, nama: true, namaTampilan: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[YAYASAN MONITORING] listUsersLintasSekolah:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pengguna",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getPengaturanSekolahBinaan = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user?.yayasanId) {
      return res.status(403).json({
        success: false,
        message: "Akses khusus admin yayasan",
        errorCode: "FORBIDDEN",
      });
    }

    const sekolah = await prisma.sekolah.findFirst({
      where: {
        id: req.params.id as string,
        yayasanId: user.yayasanId,
        dihapusPada: null,
      },
      select: {
        id: true,
        nama: true,
        kode: true,
        subdomain: true,
        jenjang: true,
        alamat: true,
        telepon: true,
        email: true,
        status: true,
        langgananAktifId: true,
      },
    });

    if (!sekolah) {
      return res.status(404).json({
        success: false,
        message: "Sekolah tidak ditemukan atau bukan binaan yayasan ini",
        errorCode: "SCHOOL_NOT_FOUND",
      });
    }

    return res.json({ success: true, data: sekolah });
  } catch (error) {
    console.error("[YAYASAN MONITORING] getPengaturanSekolahBinaan:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil pengaturan sekolah",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};