import { Request, Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getSesiKonseling = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.sesiKonseling.findMany({
      where: {
        sekolahId,
        dihapusPada: null,
      },
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

export const createSesiKonseling = async (
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

    const data = await prisma.sesiKonseling.create({
      data: {
        sekolahId,
        siswaId,
        konselorId,
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

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: {
        siswaId,
        konselorId,
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

    const data = await prisma.pelanggaranSiswa.findMany({
      where: {
        sekolahId,
        dihapusPada: null,
      },
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

export const getAsesmenMinatBakat = async (
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

    const data = await prisma.asesmenMinatBakat.findMany({
      where: {
        sekolahId,
        dihapusPada: null,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nis: true,
            nisn: true,
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
      message: "Gagal mengambil data asesmen minat bakat",
    });
  }
};

export const createAsesmenMinatBakat = async (
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
      tanggal,
      jenis,
      minat,
      bakat,
      hasil,
      rekomendasi,
      skor,
      status,
      catatan,
    } = req.body;

    if (!siswaId || !tanggal || !jenis) {
      return res.status(400).json({
        success: false,
        message: "siswaId, tanggal, dan jenis wajib diisi",
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

    const data = await prisma.asesmenMinatBakat.create({
      data: {
        sekolahId,
        siswaId,
        tanggal: new Date(tanggal),
        jenis,
        minat,
        bakat,
        hasil,
        rekomendasi,
        skor: skor !== undefined ? Number(skor) : undefined,
        status: status || "selesai",
        catatan,
        dibuatOleh: req.user?.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Asesmen minat bakat berhasil dibuat",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat asesmen minat bakat",
    });
  }
};

export const updateAsesmenMinatBakat = async (
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

    const existing = await prisma.asesmenMinatBakat.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Asesmen minat bakat tidak ditemukan",
      });
    }

    const {
      siswaId,
      tanggal,
      jenis,
      minat,
      bakat,
      hasil,
      rekomendasi,
      skor,
      status,
      catatan,
    } = req.body;

    const data = await prisma.asesmenMinatBakat.update({
      where: { id },
      data: {
        siswaId,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        jenis,
        minat,
        bakat,
        hasil,
        rekomendasi,
        skor: skor !== undefined ? Number(skor) : undefined,
        status,
        catatan,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Asesmen minat bakat berhasil diperbarui",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui asesmen minat bakat",
    });
  }
};

export const deleteAsesmenMinatBakat = async (
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

    const existing = await prisma.asesmenMinatBakat.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Asesmen minat bakat tidak ditemukan",
      });
    }

    await prisma.asesmenMinatBakat.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Asesmen minat bakat berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus asesmen minat bakat",
    });
  }
};