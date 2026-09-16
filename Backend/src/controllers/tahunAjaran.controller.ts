import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

interface TahunAjaranBody {
  nama: string;
  semester: "Ganjil" | "Genap";
  status?: "aktif" | "tidak_aktif";
}

const getParamId = (req: AuthRequest): string | null => {
  const { id } = req.params;

  if (typeof id !== "string" || !id) {
    return null;
  }

  return id;
};

export const getTahunAjaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.tahunAjaran.findMany({
      where: {
        sekolahId,
        dihapusPada: null,
      },
      orderBy: {
        tahunAjaran: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data tahun ajaran",
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

export const createTahunAjaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const {
      nama,
      semester,
      status = "tidak_aktif",
    } = req.body as TahunAjaranBody;

    if (!nama || !semester) {
      return res.status(400).json({
        success: false,
        message: "Nama tahun ajaran dan semester wajib diisi",
      });
    }

    if (!["Ganjil", "Genap"].includes(semester)) {
      return res.status(400).json({
        success: false,
        message: "Semester harus Ganjil atau Genap",
      });
    }

    if (!["aktif", "tidak_aktif"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status harus aktif atau tidak_aktif",
      });
    }

    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        tahunAjaran: nama,
        semester,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Tahun ajaran dan semester tersebut sudah ada",
      });
    }

    if (status === "aktif") {
      await prisma.tahunAjaran.updateMany({
        where: {
          sekolahId,
          status: "aktif",
          dihapusPada: null,
        },
        data: {
          status: "tidak_aktif",
        },
      });
    }

    const data = await prisma.tahunAjaran.create({
      data: {
        tahunAjaran: nama,
        semester,
        status,
        sekolahId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Tahun ajaran berhasil ditambahkan",
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

export const updateTahunAjaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = getParamId(req);

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID tahun ajaran tidak valid",
      });
    }

    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Tahun ajaran tidak ditemukan",
      });
    }

    const {
      nama,
      semester,
      status,
    } = req.body as Partial<TahunAjaranBody>;

    if (
      semester &&
      !["Ganjil", "Genap"].includes(semester)
    ) {
      return res.status(400).json({
        success: false,
        message: "Semester harus Ganjil atau Genap",
      });
    }

    if (
      status &&
      !["aktif", "tidak_aktif"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status harus aktif atau tidak_aktif",
      });
    }

    if (status === "aktif") {
      await prisma.tahunAjaran.updateMany({
        where: {
          sekolahId,
          id: {
            not: id,
          },
          status: "aktif",
          dihapusPada: null,
        },
        data: {
          status: "tidak_aktif",
        },
      });
    }

    const data = await prisma.tahunAjaran.update({
      where: {
        id,
      },
      data: {
        ...(nama && {
          tahunAjaran: nama,
        }),
        ...(semester && {
          semester,
        }),
        ...(status && {
          status,
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Tahun ajaran berhasil diperbarui",
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

export const deleteTahunAjaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = getParamId(req);

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID tahun ajaran tidak valid",
      });
    }

    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Tahun ajaran tidak ditemukan",
      });
    }

    await prisma.tahunAjaran.update({
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
      message: "Tahun ajaran berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};