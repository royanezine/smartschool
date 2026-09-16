import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getJalurPpdb = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.jalurPpdb.findMany({
      where: {
        sekolahId,
        dihapusPada: null,
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data jalur PPDB",
    });
  }
};

export const getJalurPpdbById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const sekolahId = (req as any).user?.sekolahId;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.jalurPpdb.findFirst({
      where: {
        id: id as string,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Jalur PPDB tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail jalur PPDB",
    });
  }
};

export const createJalurPpdb = async (
  req: Request,
  res: Response
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;
    const userId = (req as any).user?.id;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const {
      nama,
      deskripsi,
      kuota,
      tanggalMulai,
      tanggalSelesai,
      status,
    } = req.body;

    if (tanggalMulai && tanggalSelesai) {
      if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
        return res.status(400).json({
          success: false,
          message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
        });
      }
    }

    const data = await prisma.jalurPpdb.create({
      data: {
        sekolahId,
        nama,
        deskripsi,
        kuota: Number(kuota),
        tanggalMulai: tanggalMulai
          ? new Date(tanggalMulai)
          : undefined,
        tanggalSelesai: tanggalSelesai
          ? new Date(tanggalSelesai)
          : undefined,
        status: status ?? "aktif",
        dibuatOleh: userId,
        diperbaruiOleh: userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Jalur PPDB berhasil dibuat",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat jalur PPDB",
    });
  }
};

export const updateJalurPpdb = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const sekolahId = (req as any).user?.sekolahId;
    const userId = (req as any).user?.id;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.jalurPpdb.findFirst({
      where: {
        id: id as string,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Jalur PPDB tidak ditemukan",
      });
    }

    const {
      nama,
      deskripsi,
      kuota,
      tanggalMulai,
      tanggalSelesai,
      status,
    } = req.body;

    const mulai = tanggalMulai
      ? new Date(tanggalMulai)
      : existing.tanggalMulai;

    const selesai = tanggalSelesai
      ? new Date(tanggalSelesai)
      : existing.tanggalSelesai;

    if (mulai && selesai && selesai < mulai) {
      return res.status(400).json({
        success: false,
        message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
      });
    }

    const data = await prisma.jalurPpdb.update({
      where: {
        id: id as string,
      },
      data: {
        nama,
        deskripsi,
        kuota:
          kuota !== undefined
            ? Number(kuota)
            : undefined,
        tanggalMulai: tanggalMulai
          ? new Date(tanggalMulai)
          : undefined,
        tanggalSelesai: tanggalSelesai
          ? new Date(tanggalSelesai)
          : undefined,
        status,
        diperbaruiOleh: userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Jalur PPDB berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui jalur PPDB",
    });
  }
};

export const deleteJalurPpdb = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const sekolahId = (req as any).user?.sekolahId;
    const userId = (req as any).user?.id;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.jalurPpdb.findFirst({
      where: {
        id: id as string,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Jalur PPDB tidak ditemukan",
      });
    }

    await prisma.jalurPpdb.update({
      where: {
        id: id as string,
      },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: userId,
        status: "nonaktif",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Jalur PPDB berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus jalur PPDB",
    });
  }
};