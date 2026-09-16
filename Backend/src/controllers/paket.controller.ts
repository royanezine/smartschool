import { Request, Response } from "express";
import { prisma } from "../config/db";
import { success } from "zod";

export const createPaket = async (req: Request, res: Response) => {
  try {
    const { nama, deskripsi, harga, durasi, modulIds } = req.body;

    if (!nama || harga === undefined || !durasi) {
      return res.status(400).json({
        success: false,
        message: "Nama, harga, dan durasi harus diisi",
      });
    }

    const paket = await prisma.paket.create({
      data: {
        nama,
        deskripsi,
        harga,
        durasi,
        status: "aktif",

        paketModul: {
          create:
            modulIds.map((modulId: string) => ({
              modulId,
              status: "aktif",
            })) || [],
        },
      },
      include: {
        paketModul: {
          include: {
            modul: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Paket berhasil dibuat",
      data: paket,
    });
  } catch (error) {
    console.error("create paket error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat paket",
    });
  }
};

export const getPaketPublic = async (req: Request, res: Response) => {
  try {
    const paket = await prisma.paket.findMany({
      where: {
        status: "aktif",
        dihapusPada: null,
      },
      orderBy: {
        harga: "asc",
      },
      include: {
        paketModul: {
          where: {
            status: "aktif",
            dihapusPada: null,
            modul: {
              status: "aktif",
              dihapusPada: null,
            },
          },
          include: {
            modul: true,
          },
        },
      },
    });

    const data = paket.map((item) => ({
      id: item.id,
      nama: item.nama,
      deskripsi: item.deskripsi,
      harga: item.harga,
      durasi: item.durasi,
      fitur: item.paketModul.map((pm) => ({
        id: pm.modul.id,
        kode: pm.modul.kode,
        nama: pm.modul.nama,
        deskripsi: pm.modul.deskripsi,
        ikon: pm.modul.ikon,
      })),
    }));

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan data paket",
      data,
    });
  } catch (error) {
    console.error("Get paket public error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data paket",
    });
  }
};

export const getPaketPublicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "ID paket tidak valid",
      });
    }

    const paket = await prisma.paket.findFirst({
      where: {
        id,
        status: "aktif",
        dihapusPada: null,
      },
      include: {
        paketModul: {
          where: {
            status: "aktif",
            dihapusPada: null,
            modul: {
              status: "aktif",
              dihapusPada: null,
            },
          },
          include: {
            modul: true,
          },
        },
      },
    });

    if (!paket) {
      return res.status(404).json({
        success: false,
        message: "Paket tidak ditemukan",
      });
    }

    const data = {
      id: paket.id,
      nama: paket.nama,
      deskripsi: paket.deskripsi,
      harga: paket.harga,
      durasi: paket.durasi,
      fitur: paket.paketModul.map((pm) => ({
        id: pm.modul.id,
        kode: pm.modul.kode,
        nama: pm.modul.nama,
        deskripsi: pm.modul.deskripsi,
        ikon: pm.modul.ikon,
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan data paket",
      data,
    });
  } catch (error) {
    console.error("Get paket public by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data paket",
    });
  }
};

export const getFiturPublic = async (req: Request, res: Response) => {
  try {
    const fitur = await prisma.modul.findMany({
      where: {
        status: "aktif",
        dihapusPada: null,
      },
      orderBy: {
        nama: "asc",
      },
      select: {
        id: true,
        kode: true,
        nama: true,
        deskripsi: true,
        ikon: true,
        sistem: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan data fitur",
      data: fitur,
    });
  } catch (error) {
    console.error("Get fitur public error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data fitur",
    });
  }
};

export const updatePaket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validasi ID untuk menghilangkan error TypeScript
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "ID paket tidak valid",
      });
    }

    const { nama, deskripsi, harga, durasi, modulIds, status } = req.body;

    const paket = await prisma.paket.update({
      // Paksa TypeScript mengenali ID sebagai string yang valid
      where: { id: String(id) },
      data: {
        nama,
        deskripsi,
        harga,
        durasi,
        status,
        ...(modulIds && {
          paketModul: {
            deleteMany: {}, // Hapus relasi lama
            create: modulIds.map((modulId: string) => ({
              modulId,
              status: "aktif",
            })),
          },
        }),
      },
      include: {
        paketModul: { include: { modul: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Paket berhasil diperbarui",
      data: paket,
    });
  } catch (error) {
    console.error("Update paket error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui paket",
    });
  }
};

export const deletePaket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validasi ID untuk menghilangkan error TypeScript
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "ID paket tidak valid",
      });
    }

    // Menggunakan Soft Delete (hanya mengubah status dan tanggal dihapus)
    await prisma.paket.update({
      where: { id: String(id) },
      data: {
        status: "nonaktif",
        dihapusPada: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Paket berhasil dinonaktifkan/dihapus",
    });
  } catch (error) {
    console.error("Delete paket error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus paket",
    });
  }
};