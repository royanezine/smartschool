import { Request, Response } from "express";
import { TokenPayLoad } from "../utils/generateToken";
import { prisma } from "../config/db";

interface AuthRequest extends Request {
  user?: TokenPayLoad;
}

const jadwalInclude = {
  kelasMapel: {
    include: {
      kelas: true,
      mataPelajaran: true,
      guruPengajar: {
        select: {
          id: true,
          namaLengkap: true,
          email: true,
          nip: true,
        },
      },
    },
  },
};

const hitungDurasiMenit = (jamMulai: string, jamSelesai: string) => {
  const [h1 = 0, m1 = 0] = jamMulai.split(":").map(Number);
  const [h2 = 0, m2 = 0] = jamSelesai.split(":").map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
};

export const getJadwalMengajar = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak terhubung dengan sekolah",
      });
    }

    const jadwal = await prisma.jadwalMengajar.findMany({
      where: {
        dihapusPada: null,
        kelasMapel: {
          kelas: {
            sekolahId,
          },
        },
      },
      include: jadwalInclude,
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    });

    return res.json({
      success: true,
      data: jadwal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil jadwal mengajar",
    });
  }
};

export const getJadwalMengajarById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;

    const jadwal = await prisma.jadwalMengajar.findFirst({
      where: {
        id,
        dihapusPada: null,
        kelasMapel: {
          kelas: { sekolahId },
        },
      },
      include: jadwalInclude,
    });

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: "Jadwal mengajar tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: jadwal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil jadwal mengajar",
    });
  }
};

export const createJadwalMengajar = async (req: AuthRequest, res: Response) => {
  try {
    const { kelasMapelId, hari, jamMulai, jamSelesai, ruangan } = req.body;
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak terhubung dengan sekolah",
      });
    }

    const kelasMapel = await prisma.kelasMapel.findFirst({
      where: {
        id: kelasMapelId,
        kelas: { sekolahId },
      },
    });

    if (!kelasMapel) {
      return res.status(404).json({
        success: false,
        message: "Kelas mapel tidak ditemukan",
      });
    }

    const orConditions: any[] = [
      { kelasMapel: { guruPengajarId: kelasMapel.guruPengajarId } },
    ];
    if (ruangan && ruangan.trim() !== "") {
      orConditions.push({ ruangan });
    }

    // 1. CEK BENTROK JADWAL GURU & RUANGAN
    const bentrok = await prisma.jadwalMengajar.findFirst({
      where: {
        hari,
        dihapusPada: null,
        OR: orConditions,
        jamMulai: { lt: jamSelesai },
        jamSelesai: { gt: jamMulai },
      },
      include: jadwalInclude,
    });

    if (bentrok) {
      const penyebab =
        bentrok.kelasMapel.guruPengajarId === kelasMapel.guruPengajarId
          ? "Jadwal guru"
          : "Ruangan";
      return res.status(409).json({
        success: false,
        message: `${penyebab} bentrok dengan jadwal lain`,
        data: { jadwalBentrok: bentrok },
      });
    }

    // 2. VALIDASI BEBAN KERJA GURU (DINAMIS DARI DATABASE)
    let maxJamMengajar = 40; // Fallback default
    const pengaturan = await prisma.pengaturanSistem.findFirst({
      where: { sekolahId, kunci: "MAX_JAM_MENGAJAR_MINGGUAN" },
    });

    if (pengaturan && !isNaN(Number(pengaturan.nilai))) {
      maxJamMengajar = Number(pengaturan.nilai);
    }

    const maxMenitMingguan = maxJamMengajar * 60;

    const jadwalExisting = await prisma.jadwalMengajar.findMany({
      where: {
        kelasMapel: {
          guruPengajarId: kelasMapel.guruPengajarId,
          kelas: { sekolahId },
        },
        dihapusPada: null,
      },
    });

    let totalMenitMingguan = hitungDurasiMenit(jamMulai, jamSelesai);
    jadwalExisting.forEach((j) => {
      totalMenitMingguan += hitungDurasiMenit(j.jamMulai, j.jamSelesai);
    });

    if (totalMenitMingguan > maxMenitMingguan) {
      return res.status(400).json({
        success: false,
        message: `Beban kerja melebihi batas maksimal ${maxJamMengajar} jam per minggu.`,
      });
    }

    const jadwal = await prisma.jadwalMengajar.create({
      data: {
        kelasMapelId,
        hari,
        jamMulai,
        jamSelesai,
        ruangan: ruangan || null,
        dibuatOleh: userId,
      },
      include: jadwalInclude,
    });

    return res.status(201).json({
      success: true,
      message: "Jadwal mengajar berhasil dibuat",
      data: jadwal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat jadwal mengajar",
    });
  }
};

export const updateJadwalMengajar = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { kelasMapelId, hari, jamMulai, jamSelesai, ruangan } = req.body;
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;

    const existing = await prisma.jadwalMengajar.findFirst({
      where: {
        id,
        dihapusPada: null,
        kelasMapel: { kelas: { sekolahId } },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Jadwal mengajar tidak ditemukan",
      });
    }

    const kelasMapel = await prisma.kelasMapel.findFirst({
      where: { id: kelasMapelId, kelas: { sekolahId } },
    });

    if (!kelasMapel) {
      return res.status(404).json({
        success: false,
        message: "Kelas mapel tidak ditemukan",
      });
    }

    const orConditions: any[] = [
      { kelasMapel: { guruPengajarId: kelasMapel.guruPengajarId } },
    ];
    if (ruangan && ruangan.trim() !== "") {
      orConditions.push({ ruangan });
    }

    // 1. CEK BENTROK JADWAL GURU & RUANGAN
    const bentrok = await prisma.jadwalMengajar.findFirst({
      where: {
        id: { not: id },
        hari,
        dihapusPada: null,
        OR: orConditions,
        jamMulai: { lt: jamSelesai },
        jamSelesai: { gt: jamMulai },
      },
      include: jadwalInclude,
    });

    if (bentrok) {
      const penyebab =
        bentrok.kelasMapel.guruPengajarId === kelasMapel.guruPengajarId
          ? "Jadwal guru"
          : "Ruangan";
      return res.status(409).json({
        success: false,
        message: `${penyebab} bentrok dengan jadwal lain`,
        data: { jadwalBentrok: bentrok },
      });
    }

    // 2. VALIDASI BEBAN KERJA GURU (DINAMIS DARI DATABASE)
    let maxJamMengajar = 40; // Fallback default
    const pengaturan = await prisma.pengaturanSistem.findFirst({
      where: { sekolahId, kunci: "MAX_JAM_MENGAJAR_MINGGUAN" },
    });

    if (pengaturan && !isNaN(Number(pengaturan.nilai))) {
      maxJamMengajar = Number(pengaturan.nilai);
    }

    const maxMenitMingguan = maxJamMengajar * 60;

    const jadwalExisting = await prisma.jadwalMengajar.findMany({
      where: {
        id: { not: id },
        kelasMapel: {
          guruPengajarId: kelasMapel.guruPengajarId,
          kelas: { sekolahId },
        },
        dihapusPada: null,
      },
    });

    let totalMenitMingguan = hitungDurasiMenit(jamMulai, jamSelesai);
    jadwalExisting.forEach((j) => {
      totalMenitMingguan += hitungDurasiMenit(j.jamMulai, j.jamSelesai);
    });

    if (totalMenitMingguan > maxMenitMingguan) {
      return res.status(400).json({
        success: false,
        message: `Beban kerja melebihi batas maksimal ${maxJamMengajar} jam per minggu.`,
      });
    }

    const jadwal = await prisma.jadwalMengajar.update({
      where: { id },
      data: {
        kelasMapelId,
        hari,
        jamMulai,
        jamSelesai,
        ruangan: ruangan || null,
        diperbaruiOleh: userId,
      },
      include: jadwalInclude,
    });

    return res.json({
      success: true,
      message: "Jadwal mengajar berhasil diperbarui",
      data: jadwal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui jadwal mengajar",
    });
  }
};

export const deleteJadwalMengajar = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;

    const jadwal = await prisma.jadwalMengajar.findFirst({
      where: {
        id,
        dihapusPada: null,
        kelasMapel: { kelas: { sekolahId } },
      },
    });

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: "Jadwal mengajar tidak ditemukan",
      });
    }

    await prisma.jadwalMengajar.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: userId,
      },
    });

    return res.json({
      success: true,
      message: "Jadwal mengajar berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus jadwal mengajar",
    });
  }
};
