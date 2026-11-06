import { Request, Response } from "express";
import { TokenPayLoad } from "../utils/generateToken";
import { prisma } from "../config/db";

interface AuthRequest extends Request {
  user?: TokenPayLoad;
}

type HasilRuangan = {
  valid: boolean;
  ruanganId: string | null;
  ruangan: string | null;
};

const jadwalInclude = {
  ruanganRef: {
    select: {
      id: true,
      nama: true,
      lokasi: true,
    },
  },
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

const resolveRuangan = async (
  sekolahId: string,
  ruanganId: unknown,
  ruanganTeks: unknown,
): Promise<HasilRuangan> => {
  if (typeof ruanganId === "string" && ruanganId !== "") {
    const data = await prisma.ruangan.findFirst({
      where: { id: ruanganId, sekolahId, dihapusPada: null },
      select: { id: true, nama: true },
    });
    if (!data) {
      return { valid: false, ruanganId: null, ruangan: null };
    }
    return { valid: true, ruanganId: data.id, ruangan: data.nama };
  }

  const teks = typeof ruanganTeks === "string" ? ruanganTeks.trim() : "";
  return { valid: true, ruanganId: null, ruangan: teks === "" ? null : teks };
};

const buatKondisiRuangan = (hasil: HasilRuangan) => {
  const kondisi: any[] = [];
  if (hasil.ruanganId) {
    kondisi.push({ ruanganId: hasil.ruanganId });
  }
  if (hasil.ruangan) {
    kondisi.push({ ruangan: hasil.ruangan });
  }
  return kondisi;
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
    const { kelasMapelId, hari, jamMulai, jamSelesai, ruangan, ruanganId } =
      req.body;
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

    const hasilRuangan = await resolveRuangan(sekolahId, ruanganId, ruangan);
    if (!hasilRuangan.valid) {
      return res.status(404).json({
        success: false,
        message: "Ruangan tidak ditemukan",
      });
    }

    const orConditions: any[] = [
      { kelasMapel: { guruPengajarId: kelasMapel.guruPengajarId } },
      ...buatKondisiRuangan(hasilRuangan),
    ];

    const bentrok = await prisma.jadwalMengajar.findFirst({
      where: {
        hari,
        dihapusPada: null,
        kelasMapel: { kelas: { sekolahId } },
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

    let maxJamMengajar = 40;
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
        ruangan: hasilRuangan.ruangan,
        ruanganId: hasilRuangan.ruanganId,
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
    const { kelasMapelId, hari, jamMulai, jamSelesai, ruangan, ruanganId } =
      req.body;
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak terhubung dengan sekolah",
      });
    }

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

    const hasilRuangan = await resolveRuangan(sekolahId, ruanganId, ruangan);
    if (!hasilRuangan.valid) {
      return res.status(404).json({
        success: false,
        message: "Ruangan tidak ditemukan",
      });
    }

    const orConditions: any[] = [
      { kelasMapel: { guruPengajarId: kelasMapel.guruPengajarId } },
      ...buatKondisiRuangan(hasilRuangan),
    ];

    const bentrok = await prisma.jadwalMengajar.findFirst({
      where: {
        id: { not: id },
        hari,
        dihapusPada: null,
        kelasMapel: { kelas: { sekolahId } },
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

    let maxJamMengajar = 40;
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
        ruangan: hasilRuangan.ruangan,
        ruanganId: hasilRuangan.ruanganId,
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