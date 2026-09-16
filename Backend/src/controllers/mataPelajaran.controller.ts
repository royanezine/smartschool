import { Request, Response } from "express";
import { prisma } from "../config/db";

interface MataPelajaranBody {
  nama: string;
  kode: string;
  status?: string;
}

export const getMataPelajaran = async (
  req: Request,
  res: Response
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;

    const data =
      await prisma.mataPelajaran.findMany({
        where: {
          sekolahId,
          dihapusPada: null,
        },
        orderBy: {
          nama: "asc",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data mata pelajaran",
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

export const createMataPelajaran = async (
  req: Request<{}, {}, MataPelajaranBody>,
  res: Response
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;

    const {
      nama,
      kode,
      status = "aktif",
    } = req.body;

    if (!nama || !kode) {
      return res.status(400).json({
        success: false,
        message: "Nama dan kode mata pelajaran wajib diisi",
      });
    }

    const existing =
      await prisma.mataPelajaran.findFirst({
        where: {
          kode,
          sekolahId,
          dihapusPada: null,
        },
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Kode mata pelajaran sudah digunakan",
      });
    }

    const data =
      await prisma.mataPelajaran.create({
        data: {
          nama,
          kode,
          status,
          sekolahId,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Mata pelajaran berhasil ditambahkan",
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

export const updateMataPelajaran = async (
  req: Request<
    { id: string },
    {},
    Partial<MataPelajaranBody>
  >,
  res: Response
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;
    const { id } = req.params;

    const existing =
      await prisma.mataPelajaran.findFirst({
        where: {
          id,
          sekolahId,
          dihapusPada: null,
        },
      });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Mata pelajaran tidak ditemukan",
      });
    }

    const { nama, kode, status } = req.body;

    if (kode && kode !== existing.kode) {
      const kodeExist =
        await prisma.mataPelajaran.findFirst({
          where: {
            kode,
            sekolahId,
            id: {
              not: id,
            },
            dihapusPada: null,
          },
        });

      if (kodeExist) {
        return res.status(409).json({
          success: false,
          message: "Kode mata pelajaran sudah digunakan",
        });
      }
    }

    const data =
      await prisma.mataPelajaran.update({
        where: {
          id,
        },
        data: {
          ...(nama && { nama }),
          ...(kode && { kode }),
          ...(status && { status }),
        },
      });

    return res.status(200).json({
      success: true,
      message: "Mata pelajaran berhasil diperbarui",
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

export const deleteMataPelajaran = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;
    const { id } = req.params;

    const existing =
      await prisma.mataPelajaran.findFirst({
        where: {
          id,
          sekolahId,
          dihapusPada: null,
        },
      });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Mata pelajaran tidak ditemukan",
      });
    }

    await prisma.mataPelajaran.update({
      where: {
        id,
      },
      data: {
        dihapusPada: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Mata pelajaran berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};