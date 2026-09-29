import { Request, Response } from "express";
import { PrismaClient, KategoriBuku } from "@prisma/client";
import { generateNomorPeminjaman } from "../utils/nomorPeminjaman";

const prisma = new PrismaClient();

const parseKategori = (value: unknown) => {
  if (value === undefined) return { valid: true, value: undefined };
  if (value === null || value === "") return { valid: true, value: null };

  const kategori = String(value).toUpperCase() as KategoriBuku;

  if (!Object.values(KategoriBuku).includes(kategori)) {
    return { valid: false, value: undefined };
  }

  return { valid: true, value: kategori };
};

const parseInteger = (value: unknown) => {
  if (value === undefined) return { valid: true, value: undefined };
  if (value === null || value === "") return { valid: true, value: null };

  const angka = Number(value);

  if (!Number.isInteger(angka)) {
    return { valid: false, value: undefined };
  }

  return { valid: true, value: angka };
};

const mataPelajaranValid = async (
  sekolahId: string,
  mataPelajaranId: string
) => {
  const mapel = await prisma.mataPelajaran.findFirst({
    where: {
      id: mataPelajaranId,
      sekolahId,
      dihapusPada: null,
    },
    select: { id: true },
  });

  return !!mapel;
};

export const getBuku = async (req: Request, res: Response) => {
  try {
    const sekolahId = (req as any).user.sekolahId;

    const { search, tipe, kategori, mataPelajaranId, status } = req.query;

    const kategoriParsed = parseKategori(kategori);

    if (!kategoriParsed.valid) {
      return res.status(400).json({
        success: false,
        message: "Kategori buku tidak valid",
      });
    }

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
        ...(kategoriParsed.value ? { kategori: kategoriParsed.value } : {}),
        ...(mataPelajaranId
          ? { mataPelajaranId: String(mataPelajaranId) }
          : {}),
        ...(status ? { status: String(status) } : {}),
      },

      include: {
        mataPelajaran: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
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
        mataPelajaran: true,
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
      mataPelajaranId,
      deskripsi,
      coverUrl,
      urlEbook,
      jumlah,
      status = "aktif",
    } = req.body;

    if (!kodeBuku || !judul || !tipe) {
      return res.status(400).json({
        success: false,
        message: "Kode buku, judul, dan tipe wajib diisi",
      });
    }

    const kategoriParsed = parseKategori(kategori);

    if (!kategoriParsed.valid) {
      return res.status(400).json({
        success: false,
        message: "Kategori buku tidak valid",
      });
    }

    const tahunParsed = parseInteger(tahunTerbit);

    if (!tahunParsed.valid) {
      return res.status(400).json({
        success: false,
        message: "Tahun terbit harus berupa angka bulat",
      });
    }

    const jumlahParsed = parseInteger(jumlah);

    if (
      !jumlahParsed.valid ||
      (jumlahParsed.value !== undefined &&
        jumlahParsed.value !== null &&
        jumlahParsed.value < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Jumlah buku harus berupa angka bulat tidak negatif",
      });
    }

    if (tipe === "EBOOK" && !urlEbook) {
      return res.status(400).json({
        success: false,
        message: "URL e-book wajib diisi untuk buku digital",
      });
    }

    if (mataPelajaranId) {
      const valid = await mataPelajaranValid(sekolahId, mataPelajaranId);

      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Mata pelajaran tidak ditemukan",
        });
      }
    }

    const existing = await prisma.buku.findFirst({
      where: {
        sekolahId,
        kodeBuku,
      },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Kode buku sudah digunakan",
      });
    }

    const jumlahFinal =
      tipe === "EBOOK" ? 0 : (jumlahParsed.value ?? 0);

    const buku = await prisma.buku.create({
      data: {
        sekolahId,
        dibuatOleh: penggunaId,

        kodeBuku,
        judul,
        penulis,
        penerbit,
        tahunTerbit: tahunParsed.value,
        isbn,
        tipe,
        kategori: kategoriParsed.value,
        mataPelajaranId: mataPelajaranId || null,
        deskripsi,
        coverUrl,
        urlEbook,

        jumlah: jumlahFinal,
        jumlahTersedia: jumlahFinal,

        status,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Buku berhasil ditambahkan",
      data: buku,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Kode buku sudah digunakan",
      });
    }

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
      mataPelajaranId,
      deskripsi,
      coverUrl,
      urlEbook,
      jumlah,
      status,
    } = req.body;

    const kategoriParsed = parseKategori(kategori);

    if (!kategoriParsed.valid) {
      return res.status(400).json({
        success: false,
        message: "Kategori buku tidak valid",
      });
    }

    const tahunParsed = parseInteger(tahunTerbit);

    if (!tahunParsed.valid) {
      return res.status(400).json({
        success: false,
        message: "Tahun terbit harus berupa angka bulat",
      });
    }

    const jumlahParsed = parseInteger(jumlah);

    if (
      !jumlahParsed.valid ||
      jumlahParsed.value === null ||
      (jumlahParsed.value !== undefined && jumlahParsed.value < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Jumlah buku harus berupa angka bulat tidak negatif",
      });
    }

    if (kodeBuku && kodeBuku !== buku.kodeBuku) {
      const existing = await prisma.buku.findFirst({
        where: {
          sekolahId,
          kodeBuku,
          NOT: { id },
        },
        select: { id: true },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Kode buku sudah digunakan",
        });
      }
    }

    if (mataPelajaranId) {
      const valid = await mataPelajaranValid(sekolahId, mataPelajaranId);

      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Mata pelajaran tidak ditemukan",
        });
      }
    }

    const tipeFinal = tipe ?? buku.tipe;
    const urlEbookFinal = urlEbook === undefined ? buku.urlEbook : urlEbook;

    if (tipeFinal === "EBOOK" && !urlEbookFinal) {
      return res.status(400).json({
        success: false,
        message: "URL e-book wajib diisi untuk buku digital",
      });
    }

    const sedangDipinjam = await prisma.peminjamanBuku.count({
      where: {
        bukuId: id,
        status: "dipinjam",
        dihapusPada: null,
      },
    });

    let jumlahFinal = buku.jumlah;
    let jumlahTersediaFinal = buku.jumlahTersedia;

    if (tipeFinal === "EBOOK") {
      if (sedangDipinjam > 0) {
        return res.status(400).json({
          success: false,
          message: "Buku tidak dapat diubah menjadi e-book karena masih ada peminjaman aktif",
        });
      }

      jumlahFinal = 0;
      jumlahTersediaFinal = 0;
    } else if (jumlahParsed.value !== undefined) {
      if (jumlahParsed.value < sedangDipinjam) {
        return res.status(400).json({
          success: false,
          message: "Jumlah buku tidak boleh lebih kecil dari jumlah yang sedang dipinjam",
        });
      }

      jumlahFinal = jumlahParsed.value;
      jumlahTersediaFinal = jumlahParsed.value - sedangDipinjam;
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
        tahunTerbit: tahunParsed.value,
        isbn,
        tipe,
        kategori: kategoriParsed.value,
        mataPelajaranId:
          mataPelajaranId === undefined ? undefined : mataPelajaranId || null,
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
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Kode buku sudah digunakan",
      });
    }

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

    const sedangDipinjam = await prisma.peminjamanBuku.count({
      where: {
        bukuId: id,
        status: "dipinjam",
        dihapusPada: null,
      },
    });

    if (sedangDipinjam > 0) {
      return res.status(400).json({
        success: false,
        message: "Buku tidak dapat dihapus karena masih ada peminjaman aktif",
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

    const { bukuId, tanggalJatuhTempo, catatan } = req.body;

    if (!bukuId || !tanggalJatuhTempo) {
      return res.status(400).json({
        success: false,
        message: "Buku dan tanggal jatuh tempo wajib diisi",
      });
    }

    const jatuhTempo = new Date(tanggalJatuhTempo);

    if (Number.isNaN(jatuhTempo.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal jatuh tempo tidak valid",
      });
    }

    if (jatuhTempo.getTime() < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: "Tanggal jatuh tempo tidak boleh sebelum hari ini",
      });
    }

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

      const stokUpdate = await tx.buku.updateMany({
        where: {
          id: bukuId,
          jumlahTersedia: {
            gt: 0,
          },
        },
        data: {
          jumlahTersedia: {
            decrement: 1,
          },
        },
      });

      if (stokUpdate.count === 0) {
        throw new Error("STOCK_EMPTY");
      }

      const peminjaman = await tx.peminjamanBuku.create({
        data: {
          sekolahId,
          bukuId,
          penggunaId,

          dibuatOleh: penggunaId,

          nomorPeminjaman: generateNomorPeminjaman(),
          tanggalJatuhTempo: jatuhTempo,
          catatan,

          status: "dipinjam",
        },

        include: {
          buku: true,
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
    const messages: Record<string, { status: number; message: string }> = {
      BUKU_NOT_FOUND: { status: 404, message: "Buku tidak ditemukan" },
      EBOOK_NOT_BORROWABLE: {
        status: 400,
        message: "E-book tidak memerlukan proses peminjaman",
      },
      BUKU_NOT_ACTIVE: { status: 400, message: "Buku sedang tidak aktif" },
      STOCK_EMPTY: { status: 400, message: "Stok buku sedang habis" },
      ALREADY_BORROWED: {
        status: 400,
        message: "Pengguna masih memiliki peminjaman aktif untuk buku ini",
      },
    };

    const mapped = messages[error?.message];

    if (mapped) {
      return res.status(mapped.status).json({
        success: false,
        message: mapped.message,
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
    if (error?.message === "PEMINJAMAN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Data peminjaman tidak ditemukan",
      });
    }

    if (error?.message === "ALREADY_RETURNED") {
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