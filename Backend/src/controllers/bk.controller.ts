import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin, normalizeRole } from "../utils/rbac";
import { AppError } from "../utils/appError";

const WAKTU_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const TANGGAL_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const hariIniWib = () =>
  new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

const waktuBertabrakan = (
  mulaiA: string,
  selesaiA: string,
  mulaiB?: string | null,
  selesaiB?: string | null
) => {
  if (!mulaiB || !selesaiB) return false;
  return mulaiA < selesaiB && mulaiB < selesaiA;
};

export const getSesiKonseling = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    const where: any = {
      sekolahId,
      dihapusPada: null,
    };

    if (actorRole === "siswa") {
      where.siswaId = req.user?.userId;
    }

    const status = req.query.status;
    if (typeof status === "string" && status) {
      where.status = status;
    }

    const data = await prisma.sesiKonseling.findMany({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nis: true,
            nisn: true,
          },
        },
        konselor: {
          select: {
            id: true,
            namaLengkap: true,
            nip: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data sesi konseling",
    });
  }
};

export const getSesiKonselingById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
      include: {
        siswa: true,
        konselor: true,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Sesi konseling tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    if (actorRole === "siswa" && data.siswaId !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Anda hanya dapat melihat sesi konseling Anda sendiri",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil sesi konseling",
    });
  }
};

export const ajukanSesiKonseling = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const siswaId = req.user?.userId;

    if (!sekolahId || !siswaId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (normalizeRole(req.user?.role) !== "siswa") {
      return res.status(403).json({
        success: false,
        message: "Hanya siswa yang dapat mengajukan sesi konseling",
      });
    }

    const { tanggal, waktuMulai, waktuSelesai, topik, masalah, konselorId } =
      req.body;

    if (!tanggal || !waktuMulai || !waktuSelesai || !topik) {
      return res.status(400).json({
        success: false,
        message: "tanggal, waktuMulai, waktuSelesai, dan topik wajib diisi",
      });
    }

    const tanggalStr = String(tanggal).slice(0, 10);
    const mulai = String(waktuMulai);
    const selesai = String(waktuSelesai);
    const topikStr = String(topik).trim();

    if (
      !TANGGAL_REGEX.test(tanggalStr) ||
      Number.isNaN(new Date(tanggalStr).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal harus YYYY-MM-DD",
      });
    }

    if (tanggalStr < hariIniWib()) {
      return res.status(400).json({
        success: false,
        message: "Tanggal pengajuan tidak boleh di masa lalu",
      });
    }

    if (!WAKTU_REGEX.test(mulai) || !WAKTU_REGEX.test(selesai)) {
      return res.status(400).json({
        success: false,
        message: "Format waktu harus HH:MM",
      });
    }

    if (mulai >= selesai) {
      return res.status(400).json({
        success: false,
        message: "waktuSelesai harus setelah waktuMulai",
      });
    }

    if (!topikStr || topikStr.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Topik wajib diisi dan maksimal 150 karakter",
      });
    }

    if (konselorId) {
      const konselor = await prisma.pengguna.findFirst({
        where: {
          id: String(konselorId),
          sekolahId,
          dihapusPada: null,
          status: "aktif",
        },
        select: {
          id: true,
          peran: { select: { nama: true } },
        },
      });

      if (!konselor || normalizeRole(konselor.peran?.nama) === "siswa") {
        return res.status(404).json({
          success: false,
          message: "Konselor tidak ditemukan",
        });
      }
    }

    const sesiSiswa = await prisma.sesiKonseling.findMany({
      where: {
        sekolahId,
        siswaId,
        tanggal: new Date(tanggalStr),
        dihapusPada: null,
        status: { in: ["diajukan", "dijadwalkan"] },
      },
      select: {
        waktuMulai: true,
        waktuSelesai: true,
      },
    });

    if (
      sesiSiswa.some((s) =>
        waktuBertabrakan(mulai, selesai, s.waktuMulai, s.waktuSelesai)
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "Anda sudah memiliki pengajuan atau sesi pada jam tersebut",
      });
    }

    const data = await prisma.sesiKonseling.create({
      data: {
        sekolahId,
        siswaId,
        konselorId: konselorId ? String(konselorId) : null,
        tanggal: new Date(tanggalStr),
        waktuMulai: mulai,
        waktuSelesai: selesai,
        topik: topikStr,
        masalah: masalah ? String(masalah) : null,
        status: "diajukan",
        dibuatOleh: siswaId,
      },
      include: {
        konselor: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Pengajuan sesi konseling berhasil dikirim",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengajukan sesi konseling",
    });
  }
};

export const putuskanPengajuanKonseling = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;
    const id = String(req.params.id);

    if (!sekolahId || !userId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (normalizeRole(req.user?.role) === "siswa") {
      return res.status(403).json({
        success: false,
        message: "Siswa tidak dapat memproses pengajuan konseling",
      });
    }

    const { keputusan, konselorId, catatan } = req.body;

    if (keputusan !== "setujui" && keputusan !== "tolak") {
      return res.status(400).json({
        success: false,
        message: "keputusan harus berisi setujui atau tolak",
      });
    }

    const existing = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan konseling tidak ditemukan",
      });
    }

    if (existing.status !== "diajukan") {
      return res.status(400).json({
        success: false,
        message: "Pengajuan ini sudah diproses",
      });
    }

    if (keputusan === "tolak") {
      if (!catatan || !String(catatan).trim()) {
        return res.status(400).json({
          success: false,
          message: "Alasan penolakan wajib diisi pada catatan",
        });
      }

      const data = await prisma.sesiKonseling.update({
        where: { id },
        data: {
          status: "ditolak",
          catatan: String(catatan).trim(),
          diperbaruiOleh: userId,
        },
      });

      return res.json({
        success: true,
        message: "Pengajuan konseling ditolak",
        data,
      });
    }

    if (!existing.waktuMulai || !existing.waktuSelesai) {
      return res.status(400).json({
        success: false,
        message: "Pengajuan tidak memiliki jam sesi yang valid",
      });
    }

    const konselorFinal = konselorId
      ? String(konselorId)
      : existing.konselorId ?? userId;

    const konselor = await prisma.pengguna.findFirst({
      where: {
        id: konselorFinal,
        sekolahId,
        dihapusPada: null,
        status: "aktif",
      },
      select: {
        id: true,
        peran: { select: { nama: true } },
      },
    });

    if (!konselor || normalizeRole(konselor.peran?.nama) === "siswa") {
      return res.status(404).json({
        success: false,
        message: "Konselor tidak ditemukan",
      });
    }

    const sesiKonselor = await prisma.sesiKonseling.findMany({
      where: {
        sekolahId,
        konselorId: konselorFinal,
        tanggal: existing.tanggal,
        dihapusPada: null,
        status: "dijadwalkan",
        id: { not: id },
      },
      select: {
        waktuMulai: true,
        waktuSelesai: true,
      },
    });

    if (
      sesiKonselor.some((s) =>
        waktuBertabrakan(
          existing.waktuMulai as string,
          existing.waktuSelesai as string,
          s.waktuMulai,
          s.waktuSelesai
        )
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "Konselor sudah memiliki sesi pada jam tersebut",
      });
    }

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: {
        status: "dijadwalkan",
        konselorId: konselorFinal,
        catatan: catatan ? String(catatan).trim() : undefined,
        diperbaruiOleh: userId,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        konselor: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Pengajuan konseling disetujui",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memproses pengajuan konseling",
    });
  }
};

export const batalkanPengajuanKonseling = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const siswaId = req.user?.userId;
    const id = String(req.params.id);

    if (!sekolahId || !siswaId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (normalizeRole(req.user?.role) !== "siswa") {
      return res.status(403).json({
        success: false,
        message: "Hanya siswa yang dapat membatalkan pengajuannya",
      });
    }

    const existing = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        sekolahId,
        siswaId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan konseling tidak ditemukan",
      });
    }

    if (existing.status !== "diajukan") {
      return res.status(400).json({
        success: false,
        message: "Hanya pengajuan yang masih menunggu yang dapat dibatalkan",
      });
    }

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: {
        status: "dibatalkan",
        diperbaruiOleh: siswaId,
      },
    });

    return res.json({
      success: true,
      message: "Pengajuan konseling dibatalkan",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membatalkan pengajuan konseling",
    });
  }
};

export const createSesiKonseling = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;

    if (!isSuper && !sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Data tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    const {
      siswaId,
      konselorId,
      tanggal,
      waktuMulai,
      waktuSelesai,
      topik,
      masalah,
      hasil,
      tindakLanjut,
      status,
      catatan,
    } = req.body;

    if (!siswaId || !tanggal || !topik) {
      return res.status(400).json({
        success: false,
        message: "siswaId, tanggal, dan topik wajib diisi",
      });
    }

    const siswa = await prisma.pengguna.findFirst({
      where: {
        id: siswaId,
        dihapusPada: null,
        ...(!isSuper ? { sekolahId } : {}),
      },
    });

    if (!siswa || !siswa.sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Data tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    const targetSekolahId = siswa.sekolahId;

    if (!isSuper && sekolahId && targetSekolahId !== sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Data tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    if (konselorId) {
      const konselor = await prisma.pengguna.findFirst({
        where: {
          id: konselorId,
          sekolahId: targetSekolahId,
          dihapusPada: null,
        },
      });

      if (!konselor) {
        return res.status(403).json({
          success: false,
          message: "Data tidak ditemukan atau Anda tidak memiliki akses",
        });
      }
    }

    const data = await prisma.sesiKonseling.create({
      data: {
        sekolahId: targetSekolahId,
        siswaId,
        konselorId: konselorId || null,
        tanggal: new Date(tanggal),
        waktuMulai,
        waktuSelesai,
        topik,
        masalah,
        hasil,
        tindakLanjut,
        status: status || "dijadwalkan",
        catatan,
        dibuatOleh: req.user?.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Sesi konseling berhasil dibuat",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat sesi konseling",
    });
  }
};

export const updateSesiKonseling = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!isSuper && !sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Data tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    const existing = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        dihapusPada: null,
        ...(!isSuper ? { sekolahId } : {}),
      },
    });

    if (!existing) {
      return res.status(403).json({
        success: false,
        message: "Data tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    const targetSekolahId = existing.sekolahId;

    const {
      siswaId,
      konselorId,
      tanggal,
      waktuMulai,
      waktuSelesai,
      topik,
      masalah,
      hasil,
      tindakLanjut,
      status,
      catatan,
    } = req.body;

    if (siswaId && siswaId !== existing.siswaId) {
      const siswa = await prisma.pengguna.findFirst({
        where: {
          id: siswaId,
          sekolahId: targetSekolahId,
          dihapusPada: null,
        },
      });
      if (!siswa) {
        return res.status(403).json({
          success: false,
          message: "Data tidak ditemukan atau Anda tidak memiliki akses",
        });
      }
    }

    if (konselorId && konselorId !== existing.konselorId) {
      const konselor = await prisma.pengguna.findFirst({
        where: {
          id: konselorId,
          sekolahId: targetSekolahId,
          dihapusPada: null,
        },
      });
      if (!konselor) {
        return res.status(403).json({
          success: false,
          message: "Data tidak ditemukan atau Anda tidak memiliki akses",
        });
      }
    }

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: {
        siswaId: siswaId || undefined,
        konselorId: konselorId !== undefined ? konselorId : undefined,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        waktuMulai,
        waktuSelesai,
        topik,
        masalah,
        hasil,
        tindakLanjut,
        status,
        catatan,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Sesi konseling berhasil diperbarui",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui sesi konseling",
    });
  }
};

export const deleteSesiKonseling = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Sesi konseling tidak ditemukan",
      });
    }

    await prisma.sesiKonseling.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Sesi konseling berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus sesi konseling",
    });
  }
};

export const getKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.kategoriPelanggaran.findMany({
      where: {
        sekolahId,
        dihapusPada: null,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil kategori pelanggaran",
    });
  }
};

export const createKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const { nama, deskripsi, poin, status } = req.body;

    if (!nama || poin === undefined) {
      return res.status(400).json({
        success: false,
        message: "nama dan poin wajib diisi",
      });
    }

    const data = await prisma.kategoriPelanggaran.create({
      data: {
        sekolahId,
        nama,
        deskripsi,
        poin: Number(poin),
        status: status || "aktif",
        dibuatOleh: req.user?.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Kategori pelanggaran berhasil dibuat",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat kategori pelanggaran",
    });
  }
};

export const updateKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.kategoriPelanggaran.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Kategori pelanggaran tidak ditemukan",
      });
    }

    const { nama, deskripsi, poin, status } = req.body;

    const data = await prisma.kategoriPelanggaran.update({
      where: { id },
      data: {
        nama,
        deskripsi,
        poin: poin !== undefined ? Number(poin) : undefined,
        status,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Kategori pelanggaran berhasil diperbarui",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui kategori pelanggaran",
    });
  }
};

export const deleteKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.kategoriPelanggaran.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Kategori pelanggaran tidak ditemukan",
      });
    }

    await prisma.kategoriPelanggaran.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Kategori pelanggaran berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori pelanggaran",
    });
  }
};

export const getPelanggaranSiswa = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    const where: any = {
      sekolahId,
      dihapusPada: null,
    };

    if (actorRole === "siswa") {
      where.siswaId = req.user?.userId;
    }

    const data = await prisma.pelanggaranSiswa.findMany({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nis: true,
            nisn: true,
          },
        },
        kategoriPelanggaran: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pelanggaran siswa",
    });
  }
};

export const createPelanggaranSiswa = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const {
      siswaId,
      kategoriPelanggaranId,
      tanggal,
      kronologi,
      poin,
      status,
      tindakLanjut,
      catatan,
    } = req.body;

    if (!siswaId || !kategoriPelanggaranId || !tanggal) {
      return res.status(400).json({
        success: false,
        message: "siswaId, kategoriPelanggaranId, dan tanggal wajib diisi",
      });
    }

    const siswa = await prisma.pengguna.findFirst({
      where: {
        id: siswaId,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    const kategori = await prisma.kategoriPelanggaran.findFirst({
      where: {
        id: kategoriPelanggaranId,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori pelanggaran tidak ditemukan",
      });
    }

    const data = await prisma.pelanggaranSiswa.create({
      data: {
        sekolahId,
        siswaId,
        kategoriPelanggaranId,
        tanggal: new Date(tanggal),
        kronologi,
        poin: poin !== undefined ? Number(poin) : kategori.poin,
        status: status || "tercatat",
        tindakLanjut,
        catatan,
        dibuatOleh: req.user?.userId,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nis: true,
          },
        },
        kategoriPelanggaran: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Pelanggaran siswa berhasil dicatat",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mencatat pelanggaran siswa",
    });
  }
};

export const updatePelanggaranSiswa = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.pelanggaranSiswa.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data pelanggaran tidak ditemukan",
      });
    }

    const {
      kategoriPelanggaranId,
      tanggal,
      kronologi,
      poin,
      status,
      tindakLanjut,
      catatan,
    } = req.body;

    const data = await prisma.pelanggaranSiswa.update({
      where: { id },
      data: {
        kategoriPelanggaranId,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        kronologi,
        poin: poin !== undefined ? Number(poin) : undefined,
        status,
        tindakLanjut,
        catatan,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Data pelanggaran berhasil diperbarui",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui data pelanggaran",
    });
  }
};

export const deletePelanggaranSiswa = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.pelanggaranSiswa.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data pelanggaran tidak ditemukan",
      });
    }

    await prisma.pelanggaranSiswa.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Data pelanggaran berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus data pelanggaran",
    });
  }
};