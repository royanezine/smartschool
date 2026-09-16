import { Request, Response } from "express";
import { TokenPayLoad } from "../utils/generateToken";
import { prisma } from "../config/db";

interface AuthRequest extends Request {
    user?: TokenPayLoad;
    file? : Express.Multer.File;
}

export const getMateriPembelajaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    const materi = await prisma.materiPembelajaran.findMany({
      where: {
        dihapusPada: null,
        kelasMapel: {
          kelas: {
            sekolahId,
          },
        },
      },
      include: {
        kelasMapel: {
          include: {
            kelas: true,
            mataPelajaran: true,
            guruPengajar: {
              select: {
                id: true,
                namaLengkap: true,
              },
            },
          },
        },
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    return res.json({
      success: true,
      data: materi,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil materi pembelajaran",
    });
  }
};

export const getMateriPembelajaranById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;

    const materi = await prisma.materiPembelajaran.findFirst({
      where: {
        id,
        dihapusPada: null,
        kelasMapel: {
          kelas: {
            sekolahId,
          },
        },
      },
      include: {
        kelasMapel: {
          include: {
            kelas: true,
            mataPelajaran: true,
            guruPengajar: {
              select: {
                id: true,
                namaLengkap: true,
              },
            },
          },
        },
      },
    });

    if (!materi) {
      return res.status(404).json({
        success: false,
        message: "Materi pembelajaran tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: materi,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil materi pembelajaran",
    });
  }
};

export const createMateriPembelajaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      kelasMapelId,
      judul,
      deskripsi,
      kategori,
      urlLink,
    } = req.body;

    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;

    const file = req.file;

    const kelasMapel = await prisma.kelasMapel.findFirst({
      where: {
        id: kelasMapelId,
        kelas: {
          sekolahId,
        },
      },
    });

    if (!kelasMapel) {
      return res.status(404).json({
        success: false,
        message: "Kelas mapel tidak ditemukan",
      });
    }

    if (!file && !urlLink) {
      return res.status(400).json({
        success: false,
        message: "Upload file atau masukkan link materi",
      });
    }

    if (file && urlLink) {
      return res.status(400).json({
        success: false,
        message: "Gunakan file atau link, jangan keduanya",
      });
    }

    let tipe: string;
    let urlFile: string | null = null;

    if (file) {
      const allowedMimeTypes = [
        "application/pdf",
        "video/mp4",
        "video/mpeg",
        "video/webm",
        "video/quicktime",
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "File hanya boleh PDF atau Video",
        });
      }

      urlFile = `/uploads/materi/${file.filename}`;

      tipe = file.mimetype === "application/pdf"
        ? "pdf"
        : "video";
    } else {
      tipe = "link";
    }

    const materi = await prisma.materiPembelajaran.create({
      data: {
        kelasMapelId,
        judul,
        deskripsi: deskripsi || null,
        kategori: kategori || null,
        urlFile,
        urlLink: urlLink || null,
        tipe,
        dibuatOleh: userId,
      },
      include: {
        kelasMapel: {
          include: {
            kelas: true,
            mataPelajaran: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Materi pembelajaran berhasil dibuat",
      data: materi,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat materi pembelajaran",
    });
  }
};

export const updateMateriPembelajaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const {
      kelasMapelId,
      judul,
      deskripsi,
      kategori,
      urlLink,
    } = req.body;

    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;

    const existing = await prisma.materiPembelajaran.findFirst({
      where: {
        id,
        dihapusPada: null,
        kelasMapel: {
          kelas: {
            sekolahId,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Materi pembelajaran tidak ditemukan",
      });
    }

    const kelasMapel = await prisma.kelasMapel.findFirst({
      where: {
        id: kelasMapelId,
        kelas: {
          sekolahId,
        },
      },
    });

    if (!kelasMapel) {
      return res.status(404).json({
        success: false,
        message: "Kelas mapel tidak ditemukan",
      });
    }

    const file = req.file;

    let urlFile = existing.urlFile;
    let tipe = existing.tipe;
    let finalUrlLink = urlLink || null;

    if (file && urlLink) {
      return res.status(400).json({
        success: false,
        message: "Gunakan file atau link, jangan keduanya",
      });
    }

    if (file) {
      const allowedMimeTypes = [
        "application/pdf",
        "video/mp4",
        "video/mpeg",
        "video/webm",
        "video/quicktime",
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "File hanya boleh PDF atau Video",
        });
      }

      urlFile = `/uploads/materi/${file.filename}`;
      finalUrlLink = null;

      tipe =
        file.mimetype === "application/pdf"
          ? "pdf"
          : "video";
    } else if (urlLink) {
      urlFile = null;
      tipe = "link";
    }

    const materi = await prisma.materiPembelajaran.update({
      where: {
        id,
      },
      data: {
        kelasMapelId,
        judul,
        deskripsi: deskripsi || null,
        kategori: kategori || null,
        urlFile,
        urlLink: finalUrlLink,
        tipe,
        diperbaruiOleh: userId,
      },
    });

    return res.json({
      success: true,
      message: "Materi pembelajaran berhasil diperbarui",
      data: materi,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui materi pembelajaran",
    });
  }
};

export const deleteMateriPembelajaran = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;

    const materi = await prisma.materiPembelajaran.findFirst({
      where: {
        id,
        dihapusPada: null,
        kelasMapel: {
          kelas: {
            sekolahId,
          },
        },
      },
    });

    if (!materi) {
      return res.status(404).json({
        success: false,
        message: "Materi pembelajaran tidak ditemukan",
      });
    }

    await prisma.materiPembelajaran.update({
      where: {
        id,
      },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: userId,
      },
    });

    return res.json({
      success: true,
      message: "Materi pembelajaran berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus materi pembelajaran",
    });
  }
};