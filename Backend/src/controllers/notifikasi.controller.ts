import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { successResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";

// === GET NOTIFIKASI USER (BELL ICON) ===
export const getNotifikasiUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthRequest).user?.userId as string;

    const [notifikasi, unreadCount] = await Promise.all([
      prisma.notifikasi.findMany({
        where: { penggunaId: userId },
        orderBy: { dibuatPada: "desc" },
        take: 20,
      }),
      prisma.notifikasi.count({
        where: { penggunaId: userId, dibaca: false },
      }),
    ]);

    return successResponse(res, "Berhasil mengambil notifikasi", {
      unreadCount,
      list: notifikasi,
    });
  } catch (error) {
    next(error);
  }
};

// === TANDAI 1 NOTIFIKASI DIBACA ===
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const userId = (req as AuthRequest).user?.userId as string;

    await prisma.notifikasi.updateMany({
      where: { id, penggunaId: userId },
      data: {
        dibaca: true,
        dibacaPada: new Date(),
      },
    });

    return successResponse(res, "Notifikasi telah dibaca");
  } catch (error) {
    next(error);
  }
};

// === TANDAI SEMUA DIBACA ===
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthRequest).user?.userId as string;

    await prisma.notifikasi.updateMany({
      where: { penggunaId: userId, dibaca: false },
      data: {
        dibaca: true,
        dibacaPada: new Date(),
      },
    });

    return successResponse(res, "Semua notifikasi telah ditandai dibaca");
  } catch (error) {
    next(error);
  }
};

// === CRON TRIGGER: DEADLINE H-1 PENGINGAT TUGAS ===
export const triggerDeadlineH1Notification = async () => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Cari tugas yang deadline-nya antara sekarang sampai 24 jam ke depan
  const activeTugas = await prisma.tugas.findMany({
    where: {
      batasWaktu: {
        gte: now,
        lte: next24Hours,
      },
      dihapusPada: null,
    },
    include: {
      kelasMapel: {
        include: {
          kelas: {
            include: {
              anggota: true, // Ambil siswa dalam kelas
            },
          },
          mataPelajaran: true,
        },
      },
      pengumpulanTugasSiswa: true,
    },
  });

  for (const t of activeTugas) {
    const sudahMengumpulkanIds = new Set(
      t.pengumpulanTugasSiswa.map((p) => p.penggunaId),
    );
    const targetSiswa = t.kelasMapel.kelas.anggota.filter(
      (a) => !sudahMengumpulkanIds.has(a.penggunaId),
    );

    for (const s of targetSiswa) {
      const existNotif = await prisma.notifikasi.findFirst({
        where: {
          penggunaId: s.penggunaId,
          kategori: "deadline_tugas",
          targetUrl: `/tugas/${t.id}`,
        },
      });

      if (!existNotif) {
        await prisma.notifikasi.create({
          data: {
            penggunaId: s.penggunaId,
            judul: `Pengingat Deadline: ${t.judul}`,
            isi: `Tugas ${t.kelasMapel.mataPelajaran.nama} akan berakhir dalam waktu kurang dari 24 jam. Segera kumpulkan!`,
            tipe: "warning",
            kategori: "deadline_tugas",
            targetUrl: `/tugas/${t.id}`,
          },
        });
      }
    }
  }
};
