import { Request, Response } from "express";
import { prisma } from "../config/db";

interface KelasMapelBody {
  kelasId: string;
  mataPelajaranId: string;
  guruPengajarId: string;
}

export const getKelasMapel = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;

    const data = await prisma.kelasMapel.findMany({
      where: {
        dihapusPada: null,

        kelas: {
          sekolahId,
        },
      },

      include: {
        kelas: true,

        mataPelajaran: true,

        guruPengajar: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            nip: true,
            nuptk: true,
          },
        },
      },

      orderBy: {
        dibuatPada: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data mata pelajaran kelas",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createKelasMapel = async (
  req: Request<{}, {}, KelasMapelBody>,
  res: Response,
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;

    const { kelasId, mataPelajaranId, guruPengajarId } = req.body;

    if (!kelasId || !mataPelajaranId || !guruPengajarId) {
      return res.status(400).json({
        success: false,
        message: "Kelas, mata pelajaran, dan guru pengajar wajib diisi",
      });
    }

    const kelas = await prisma.kelas.findFirst({
      where: {
        id: kelasId,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: "Kelas tidak ditemukan",
      });
    }

    const mataPelajaran = await prisma.mataPelajaran.findFirst({
      where: {
        id: mataPelajaranId,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!mataPelajaran) {
      return res.status(404).json({
        success: false,
        message: "Mata pelajaran tidak ditemukan",
      });
    }

    const guru = await prisma.pengguna.findFirst({
      where: {
        id: guruPengajarId,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!guru) {
      return res.status(404).json({
        success: false,
        message: "Guru pengajar tidak ditemukan",
      });
    }

    const existing = await prisma.kelasMapel.findFirst({
      where: {
        kelasId,
        mataPelajaranId,
        dihapusPada: null,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Mata pelajaran sudah diassign ke kelas tersebut",
      });
    }

    const data = await prisma.kelasMapel.create({
      data: {
        kelasId,
        mataPelajaranId,
        guruPengajarId,
        status: "aktif",
      },

      include: {
        kelas: true,
        mataPelajaran: true,
        guruPengajar: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Mata pelajaran berhasil diassign ke kelas",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateKelasMapel = async (
  req: Request<{ id: string }, {}, Partial<KelasMapelBody>>,
  res: Response,
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;
    const { id } = req.params;

    const existing = await prisma.kelasMapel.findFirst({
      where: {
        id,
        dihapusPada: null,

        kelas: {
          sekolahId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data kelas mapel tidak ditemukan",
      });
    }

    const { kelasId, mataPelajaranId, guruPengajarId } = req.body;

    if (kelasId) {
      const kelas = await prisma.kelas.findFirst({
        where: {
          id: kelasId,
          sekolahId,
          dihapusPada: null,
        },
      });

      if (!kelas) {
        return res.status(404).json({
          success: false,
          message: "Kelas tidak ditemukan",
        });
      }
    }

    if (mataPelajaranId) {
      const mapel = await prisma.mataPelajaran.findFirst({
        where: {
          id: mataPelajaranId,
          sekolahId,
          dihapusPada: null,
        },
      });

      if (!mapel) {
        return res.status(404).json({
          success: false,
          message: "Mata pelajaran tidak ditemukan",
        });
      }
    }

    if (guruPengajarId) {
      const guru = await prisma.pengguna.findFirst({
        where: {
          id: guruPengajarId,
          sekolahId,
          dihapusPada: null,
        },
      });

      if (!guru) {
        return res.status(404).json({
          success: false,
          message: "Guru pengajar tidak ditemukan",
        });
      }
    }

    const data = await prisma.kelasMapel.update({
      where: {
        id,
      },
      data: {
        ...(kelasId && { kelasId }),
        ...(mataPelajaranId && {
          mataPelajaranId,
        }),
        ...(guruPengajarId && {
          guruPengajarId,
        }),
      },

      include: {
        kelas: true,
        mataPelajaran: true,
        guruPengajar: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Data kelas mapel berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteKelasMapel = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;
    const { id } = req.params;

    const existing = await prisma.kelasMapel.findFirst({
      where: {
        id,
        dihapusPada: null,

        kelas: {
          sekolahId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data kelas mapel tidak ditemukan",
      });
    }

    await prisma.kelasMapel.update({
      where: {
        id,
      },
      data: {
        dihapusPada: new Date(),
        status: "tidak_aktif",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Mata pelajaran dari kelas berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createBulkKelasMapel = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;
    const { kelasIds, mataPelajaranId, guruPengajarId } = req.body; // Divalidasi via middleware

    // 1. Verifikasi Mapel & Guru
    const mapel = await prisma.mataPelajaran.findFirst({
      where: { id: mataPelajaranId, sekolahId, dihapusPada: null },
    });
    if (!mapel)
      return res
        .status(404)
        .json({ success: false, message: "Mata pelajaran tidak ditemukan" });

    const guru = await prisma.pengguna.findFirst({
      where: { id: guruPengajarId, sekolahId, dihapusPada: null },
    });
    if (!guru)
      return res
        .status(404)
        .json({ success: false, message: "Guru tidak ditemukan" });

    // 2. Ambil kelas yang valid & cek duplikasi
    const kelasValid = await prisma.kelas.findMany({
      where: { id: { in: kelasIds }, sekolahId, dihapusPada: null },
      select: { id: true, nama: true },
    });

    const existingAssigned = await prisma.kelasMapel.findMany({
      where: {
        kelasId: { in: kelasValid.map((k) => k.id) },
        mataPelajaranId,
        dihapusPada: null,
      },
    });
    const existingKelasIds = new Set(existingAssigned.map((e) => e.kelasId));

    // 3. Filter kelas yang belum di-assign mapel ini
    const kelasToAssign = kelasValid.filter((k) => !existingKelasIds.has(k.id));

    if (kelasToAssign.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Semua kelas yang dipilih sudah memiliki mata pelajaran ini.",
        });
    }

    await prisma.kelasMapel.createMany({
      data: kelasToAssign.map((k) => ({
        kelasId: k.id,
        mataPelajaranId,
        guruPengajarId,
        status: "aktif",
      })),
    });

    return res.status(201).json({
      success: true,
      message: `Berhasil menugaskan guru ke ${kelasToAssign.length} kelas.`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};