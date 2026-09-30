import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { successResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";

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

export const triggerDeadlineH1Notification = async () => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

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
              anggota: true, 
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

export const createBroadcastPengumuman = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as AuthRequest).user?.sekolahId;
    const pengirimId = (req as AuthRequest).user?.userId;
    const { judul, isi, targetRole } = req.body; 

    if (!judul || !isi)
      throw new AppError("Judul dan isi pengumuman wajib diisi", 400);

    const whereUser: any = { sekolahId, status: "aktif", dihapusPada: null };
    if (targetRole && targetRole !== "semua") {
      whereUser.peran = { nama: targetRole };
    }

    const targetUsers = await prisma.pengguna.findMany({
      where: whereUser,
      select: { id: true },
    });

    if (targetUsers.length === 0)
      throw new AppError("Tidak ada user target yang ditemukan", 404);

    const payloadNotif = targetUsers.map((user) => ({
      penggunaId: user.id,
      pengirimId,
      judul: `[Pengumuman] ${judul}`,
      isi,
      tipe: "info",
      kategori: "pengumuman_sekolah",
    }));

    await prisma.notifikasi.createMany({ data: payloadNotif });

    return successResponse(
      res,
      `Pengumuman berhasil dikirim ke ${payloadNotif.length} pengguna`,
      null,
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const triggerLanggananH7Notification = async () => {
  try {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const langgananHampirHabis = await prisma.langgananSekolah.findMany({
      where: {
        statusLangganan: "active",
        tanggalBerakhir: { gte: now, lte: next7Days },
      },
      include: { sekolah: true },
    });

    for (const langganan of langgananHampirHabis) {
      const adminSekolah = await prisma.pengguna.findFirst({
        where: {
          sekolahId: langganan.sekolahId,
          peran: { nama: "admin_sekolah" },
        },
      });

      if (adminSekolah) {
        const exist = await prisma.notifikasi.findFirst({
          where: {
            penggunaId: adminSekolah.id,
            kategori: "billing_alert",
            dibuatPada: { gte: new Date(now.setHours(0, 0, 0, 0)) },
          },
        });

        if (!exist) {
          await prisma.notifikasi.create({
            data: {
              penggunaId: adminSekolah.id,
              judul: "Peringatan: Masa Langganan Akan Berakhir",
              isi: `Masa langganan sekolah ${langganan.sekolah.nama} akan berakhir pada ${langganan.tanggalBerakhir?.toLocaleDateString("id-ID")}. Segera perpanjang agar sistem tetap bisa digunakan.`,
              tipe: "warning",
              kategori: "billing_alert",
              targetUrl: "/admin/billing",
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error trigger langganan H-7:", error);
  }
};