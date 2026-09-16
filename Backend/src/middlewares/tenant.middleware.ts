import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/db";

export const requireTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Pastikan user sudah login
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 2. Pastikan user terhubung dengan sekolah
    const sekolahId = req.user.sekolahId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message:
          "Akses Ditolak: Anda tidak terhubung dengan sekolah manapun",
      });
    }

    // 3. Cari sekolah berdasarkan sekolahId milik user
    const sekolah = await prisma.sekolah.findUnique({
      where: {
        id: sekolahId,
      },
    });

    if (!sekolah) {
      return res.status(404).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    // 4. Cek status sekolah
    if (sekolah.status !== "aktif") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak: Sekolah tidak aktif",
      });
    }

    // 5. Cari langganan sekolah
    const langganan = await prisma.langgananSekolah.findFirst({
      where: {
        sekolahId: sekolahId,
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    if (!langganan) {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak: Sekolah belum memiliki langganan",
      });
    }

    // 6. Cek status langganan
    const statusAktif =
      langganan.statusLangganan === "active" ||
      langganan.statusLangganan === "trialing";

    if (!statusAktif) {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak: Langganan sekolah tidak aktif",
      });
    }

    // 7. Cek tanggal berakhir
    if (
      langganan.tanggalBerakhir &&
      new Date() > new Date(langganan.tanggalBerakhir)
    ) {
      // Update status menjadi expired
      await prisma.langgananSekolah.update({
        where: {
          id: langganan.id,
        },
        data: {
          statusLangganan: "expired",
        },
      });

      return res.status(403).json({
        success: false,
        message: "Akses Ditolak: Masa langganan telah kadaluarsa",
      });
    }

    // 8. Kalau semua valid, lanjut ke controller
    next();
  } catch (error) {
    console.error("Tenant Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};