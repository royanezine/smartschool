import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateNomorPeminjaman } from "../utils/nomorPeminjaman";

const prisma = new PrismaClient();

export const getBuku = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;

    const {
      search,
      tipe,
      kategori,
      status,
    } = req.query;

    const buku = await prisma.buku.findMany({
      where: {
        sekolahId,
        dihapusPada: null,

        ...(search
          ? {
              OR: [
                {
                  judul: {
                    contains: String(search),
                    mode: "insensitive",
                  },
                },
                {
                  penulis: {
                    contains: String(search),
                    mode: "insensitive",
                  },
                },
                {
                  kodeBuku: {
                    contains: String(search),
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(tipe ? { tipe: String(tipe) } : {}),
        ...(kategori ? { kategori: String(kategori) } : {}),
        ...(status ? { status: String(status) } : {}),
      },

      orderBy: {
        dibuatPada: "desc",
      },
    });

    return res.json({
      success: true,
      data: buku,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data buku",
    });
  }
};

export const getBukuById = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const id = String(req.params.id);

    const buku = await prisma.buku.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },

      include: {
        peminjamanBuku: {
          where: {
            dihapusPada: null,
          },
          include: {
            pengguna: {
              select: {
                id: true,
                namaLengkap: true,
                email: true,
                nisn: true,
              },
            },
          },
          orderBy: {
            tanggalPinjam: "desc",
          },
        },
      },
    });

    if (!buku) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: buku,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail buku",
    });
  }
};

export const createBuku = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const penggunaId = (req as any).user.userId;

    const {
      kodeBuku,
      judul,
      penulis,
      penerbit,
      tahunTerbit,
      isbn,
      tipe,
      kategori,
      deskripsi,
      coverUrl,
      urlEbook,
      jumlah = 0,
      status = "aktif",
    } = req.body;

    if (tipe === "EBOOK" && !urlEbook) {
      return res.status(400).json({
        success: false,
        message: "URL e-book wajib diisi untuk buku digital",
      });
    }

    const existing = await prisma.buku.findFirst({
      where: {
        sekolahId,
        kodeBuku,
        dihapusPada: null,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Kode buku sudah digunakan",
      });
    }

    const buku = await prisma.buku.create({
      data: {
        sekolahId,
        dibuatOleh: penggunaId,

        kodeBuku,
        judul,
        penulis,
        penerbit,
        tahunTerbit,
        isbn,
        tipe,
        kategori,
        deskripsi,
        coverUrl,
        urlEbook,

        jumlah: tipe === "EBOOK" ? 0 : jumlah,
        jumlahTersedia: tipe === "EBOOK" ? 0 : jumlah,

        status,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Buku berhasil ditambahkan",
      data: buku,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan buku",
    });
  }
};

export const updateBuku = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const penggunaId = (req as any).user.userId;
    const id = String(req.params.id);

    const buku = await prisma.buku.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!buku) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    const {
      kodeBuku,
      judul,
      penulis,
      penerbit,
      tahunTerbit,
      isbn,
      tipe,
      kategori,
      deskripsi,
      coverUrl,
      urlEbook,
      jumlah,
      status,
    } = req.body;

    const tipeFinal = tipe ?? buku.tipe;

    if (tipeFinal === "EBOOK" && urlEbook === undefined && !buku.urlEbook) {
      return res.status(400).json({
        success: false,
        message: "URL e-book wajib diisi untuk buku digital",
      });
    }

    let jumlahFinal = buku.jumlah;
    let jumlahTersediaFinal = buku.jumlahTersedia;

    if (tipeFinal === "EBOOK") {
      jumlahFinal = 0;
      jumlahTersediaFinal = 0;
    } else if (jumlah !== undefined) {
      const sedangDipinjam = buku.jumlah - buku.jumlahTersedia;

      if (jumlah < sedangDipinjam) {
        return res.status(400).json({
          success: false,
          message: "Jumlah buku tidak boleh lebih kecil dari jumlah yang sedang dipinjam",
        });
      }

      jumlahFinal = jumlah;
      jumlahTersediaFinal = jumlah - sedangDipinjam;
    }

    const updated = await prisma.buku.update({
      where: {
        id,
      },
      data: {
        diperbaruiOleh: penggunaId,

        kodeBuku,
        judul,
        penulis,
        penerbit,
        tahunTerbit,
        isbn,
        tipe,
        kategori,
        deskripsi,
        coverUrl,
        urlEbook,
        status,

        jumlah: jumlahFinal,
        jumlahTersedia: jumlahTersediaFinal,
      },
    });

    return res.json({
      success: true,
      message: "Buku berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui buku",
    });
  }
};

export const deleteBuku = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const penggunaId = (req as any).user.userId;
    const id = String(req.params.id);

    const buku = await prisma.buku.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!buku) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    await prisma.buku.update({
      where: {
        id,
      },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: penggunaId,
      },
    });

    return res.json({
      success: true,
      message: "Buku berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus buku",
    });
  }
};

export const pinjamBuku = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const penggunaId = (req as any).user.userId;

    const {
      bukuId,
      tanggalJatuhTempo,
      catatan,
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const buku = await tx.buku.findFirst({
        where: {
          id: bukuId,
          sekolahId,
          dihapusPada: null,
        },
      });

      if (!buku) {
        throw new Error("BUKU_NOT_FOUND");
      }

      if (buku.tipe === "EBOOK") {
        throw new Error("EBOOK_NOT_BORROWABLE");
      }

      if (buku.status !== "aktif") {
        throw new Error("BUKU_NOT_ACTIVE");
      }

      if (buku.jumlahTersedia <= 0) {
        throw new Error("STOCK_EMPTY");
      }

      const peminjamanAktif = await tx.peminjamanBuku.findFirst({
        where: {
          bukuId,
          penggunaId,
          status: "dipinjam",
          dihapusPada: null,
        },
      });

      if (peminjamanAktif) {
        throw new Error("ALREADY_BORROWED");
      }

      const peminjaman = await tx.peminjamanBuku.create({
        data: {
          sekolahId,
          bukuId,
          penggunaId,

          dibuatOleh: penggunaId,

          nomorPeminjaman: generateNomorPeminjaman(),
          tanggalJatuhTempo: new Date(tanggalJatuhTempo),
          catatan,

          status: "dipinjam",
        },

        include: {
          buku: true,
        },
      });

      await tx.buku.update({
        where: {
          id: bukuId,
        },
        data: {
          jumlahTersedia: {
            decrement: 1,
          },
        },
      });

      return peminjaman;
    });

    return res.status(201).json({
      success: true,
      message: "Buku berhasil dipinjam",
      data: result,
    });
  } catch (error: any) {
    const messages: Record<string, string> = {
      BUKU_NOT_FOUND: "Buku tidak ditemukan",
      EBOOK_NOT_BORROWABLE: "E-book tidak memerlukan proses peminjaman",
      BUKU_NOT_ACTIVE: "Buku sedang tidak aktif",
      STOCK_EMPTY: "Stok buku sedang habis",
      ALREADY_BORROWED: "Pengguna masih memiliki peminjaman aktif untuk buku ini",
    };

    if (messages[error.message]) {
      return res.status(400).json({
        success: false,
        message: messages[error.message],
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal memproses peminjaman buku",
    });
  }
};

export const kembalikanBuku = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const penggunaId = (req as any).user.userId;
    const id = String(req.params.id);

    const result = await prisma.$transaction(async (tx) => {
      const peminjaman = await tx.peminjamanBuku.findFirst({
        where: {
          id,
          sekolahId,
          dihapusPada: null,
        },
      });

      if (!peminjaman) {
        throw new Error("PEMINJAMAN_NOT_FOUND");
      }

      if (peminjaman.status !== "dipinjam") {
        throw new Error("ALREADY_RETURNED");
      }

      const updated = await tx.peminjamanBuku.update({
        where: {
          id,
        },
        data: {
          tanggalKembali: new Date(),
          status: "dikembalikan",
          diperbaruiOleh: penggunaId,
        },
        include: {
          buku: true,
          pengguna: {
            select: {
              id: true,
              namaLengkap: true,
              email: true,
            },
          },
        },
      });

      await tx.buku.update({
        where: {
          id: peminjaman.bukuId,
        },
        data: {
          jumlahTersedia: {
            increment: 1,
          },
        },
      });

      return updated;
    });

    return res.json({
      success: true,
      message: "Buku berhasil dikembalikan",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "PEMINJAMAN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Data peminjaman tidak ditemukan",
      });
    }

    if (error.message === "ALREADY_RETURNED") {
      return res.status(400).json({
        success: false,
        message: "Buku sudah dikembalikan",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengembalikan buku",
    });
  }
};

export const getPeminjaman = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;

    const { status, penggunaId } = req.query;

    const data = await prisma.peminjamanBuku.findMany({
      where: {
        sekolahId,
        dihapusPada: null,

        ...(status ? { status: String(status) } : {}),
        ...(penggunaId ? { penggunaId: String(penggunaId) } : {}),
      },

      include: {
        buku: {
          select: {
            id: true,
            kodeBuku: true,
            judul: true,
            tipe: true,
            coverUrl: true,
          },
        },

        pengguna: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            nisn: true,
          },
        },
      },

      orderBy: {
        tanggalPinjam: "desc",
      },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data peminjaman",
    });
  }
};