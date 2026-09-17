import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse, paginatedResponse } from "../utils/responseFormatter";
import {
  ajukanPeminjamanSchema,
  persetujuanPeminjamanSchema,
  serahkanPeminjamanSchema,
  kembalikanPeminjamanSchema,
} from "../validations/peminjamanAset.validation";

const generateNomorPinjam = () => {
  const tgl = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PINJAM-${tgl}-${rand}`;
};

export const ajukanPeminjaman = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;

    if (!sekolahId || !userId) {
      throw new AppError("Data otentikasi tidak lengkap", 401);
    }

    const validated = ajukanPeminjamanSchema.parse(req.body);

    // Validasi stok aset dengan akumulasi jumlah jika terdapat asetId yang sama
    const itemQtyMap = new Map<string, number>();
    for (const item of validated.items) {
      itemQtyMap.set(
        item.asetId,
        (itemQtyMap.get(item.asetId) || 0) + item.jumlah
      );
    }

    for (const [asetId, totalDiminta] of itemQtyMap.entries()) {
      const aset = await prisma.aset.findFirst({
        where: { id: asetId, sekolahId, dihapusPada: null },
      });

      if (!aset) {
        throw new AppError("Aset tidak ditemukan", 404);
      }
      if (aset.status !== "aktif") {
        throw new AppError(
          `Aset "${aset.nama}" sedang tidak aktif/tersedia untuk dipinjam`,
          400
        );
      }
      if (aset.jumlahStok < totalDiminta) {
        throw new AppError(
          `Stok aset "${aset.nama}" tidak mencukupi (sisa: ${aset.jumlahStok}, diminta: ${totalDiminta})`,
          400
        );
      }
    }

    const peminjaman = await prisma.peminjamanAset.create({
      data: {
        sekolahId,
        peminjamId: userId,
        nomorPeminjaman: generateNomorPinjam(),
        keperluan: validated.keperluan,
        tanggalKembaliRencana: new Date(validated.tanggalKembaliRencana),
        catatanPeminjaman: validated.catatanPeminjaman,
        status: "menunggu_persetujuan",
        detailPeminjaman: {
          create: validated.items.map((item) => ({
            asetId: item.asetId,
            jumlah: item.jumlah,
            kondisiSaatPinjam: "baik",
          })),
        },
      },
      include: {
        detailPeminjaman: {
          include: { aset: { select: { id: true, kode: true, nama: true } } },
        },
      },
    });

    return successResponse(
      res,
      "Pengajuan peminjaman berhasil dikirim",
      peminjaman,
      201
    );
  } catch (error) {
    next(error);
  }
};

export const verifikasiPengajuan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;
    const petugasId = req.user?.userId;

    const validated = persetujuanPeminjamanSchema.parse(req.body);

    const pinjam = await prisma.peminjamanAset.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });

    if (!pinjam) {
      throw new AppError("Data peminjaman tidak ditemukan", 404);
    }
    if (pinjam.status !== "menunggu_persetujuan") {
      throw new AppError(`Peminjaman sudah berstatus '${pinjam.status}'`, 400);
    }

    const updated = await prisma.peminjamanAset.update({
      where: { id },
      data: {
        status: validated.status,
        petugasId,
        catatanPenolakan:
          validated.status === "ditolak" ? validated.catatanPenolakan : null,
      },
      include: {
        peminjam: { select: { id: true, namaLengkap: true, email: true } },
        detailPeminjaman: { include: { aset: true } },
      },
    });

    return successResponse(
      res,
      `Pengajuan peminjaman berhasil di-${validated.status}`,
      updated
    );
  } catch (error) {
    next(error);
  }
};

export const serahkanKeSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;
    const petugasId = req.user?.userId;

    const validated = serahkanPeminjamanSchema.parse(req.body);

    const pinjam = await prisma.peminjamanAset.findFirst({
      where: { id, sekolahId, dihapusPada: null },
      include: { detailPeminjaman: true },
    });

    if (!pinjam) {
      throw new AppError("Data peminjaman tidak ditemukan", 404);
    }
    if (pinjam.status !== "disetujui") {
      throw new AppError(
        "Hanya peminjaman dengan status 'disetujui' yang dapat diserahkan",
        400
      );
    }

    let namaPengambil = validated.namaSiswaPengambil || null;
    if (validated.siswaPengambilId) {
      const siswa = await prisma.pengguna.findFirst({
        where: { id: validated.siswaPengambilId, sekolahId },
      });
      if (!siswa) {
        throw new AppError(
          "Siswa pengambil tidak terdaftar di sekolah ini",
          404
        );
      }
      namaPengambil = siswa.namaLengkap;
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const item of pinjam.detailPeminjaman) {
        const aset = await tx.aset.findUnique({ where: { id: item.asetId } });
        if (!aset || aset.jumlahStok < item.jumlah) {
          throw new AppError(
            `Stok aset ${aset?.nama || item.asetId} tidak mencukupi saat penyerahan`,
            400
          );
        }

        await tx.aset.update({
          where: { id: item.asetId },
          data: { jumlahStok: { decrement: item.jumlah } },
        });

        if (validated.kondisiSaatPinjam) {
          await tx.detailPeminjamanAset.update({
            where: { id: item.id },
            data: { kondisiSaatPinjam: validated.kondisiSaatPinjam },
          });
        }
      }

      return tx.peminjamanAset.update({
        where: { id },
        data: {
          status: "dipinjam",
          petugasId,
          tanggalPinjam: new Date(),
          siswaPengambilId: validated.siswaPengambilId || null,
          namaSiswaPengambil: namaPengambil,
        },
        include: { detailPeminjaman: { include: { aset: true } } },
      });
    });

    return successResponse(
      res,
      "Aset berhasil diserahkan ke siswa dan stok telah berkurang",
      result
    );
  } catch (error) {
    next(error);
  }
};

export const kembalikanAset = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;

    const validated = kembalikanPeminjamanSchema.parse(req.body);

    const pinjam = await prisma.peminjamanAset.findFirst({
      where: { id, sekolahId, dihapusPada: null },
      include: { detailPeminjaman: true },
    });

    if (!pinjam) {
      throw new AppError("Data peminjaman tidak ditemukan", 404);
    }
    if (pinjam.status !== "dipinjam") {
      throw new AppError(
        "Hanya peminjaman berstatus 'dipinjam' yang dapat dikembalikan",
        400
      );
    }

    let namaPengembali = validated.namaSiswaPengembali || null;
    if (validated.siswaPengembaliId) {
      const siswa = await prisma.pengguna.findFirst({
        where: { id: validated.siswaPengembaliId, sekolahId },
      });
      if (!siswa) {
        throw new AppError(
          "Siswa pengembali tidak terdaftar di sekolah ini",
          404
        );
      }
      namaPengembali = siswa.namaLengkap;
    }

    const itemKondisiMap = new Map(validated.items.map((i) => [i.asetId, i]));

    const result = await prisma.$transaction(async (tx) => {
      for (const item of pinjam.detailPeminjaman) {
        const dataReturn = itemKondisiMap.get(item.asetId);

        await tx.aset.update({
          where: { id: item.asetId },
          data: { jumlahStok: { increment: item.jumlah } },
        });

        await tx.detailPeminjamanAset.update({
          where: { id: item.id },
          data: {
            kondisiSaatKembali: dataReturn?.kondisiSaatKembali || "baik",
            catatanKembali: dataReturn?.catatanKembali || null,
          },
        });
      }

      return tx.peminjamanAset.update({
        where: { id },
        data: {
          status: "dikembalikan",
          tanggalKembaliAktual: new Date(),
          siswaPengembaliId: validated.siswaPengembaliId || null,
          namaSiswaPengembali: namaPengembali,
        },
        include: { detailPeminjaman: { include: { aset: true } } },
      });
    });

    return successResponse(
      res,
      "Aset berhasil dikembalikan dan stok telah dipulihkan",
      result
    );
  } catch (error) {
    next(error);
  }
};

export const getKetersediaanAset = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

    const asets = await prisma.aset.findMany({
      where: { sekolahId, dihapusPada: null },
      select: {
        id: true,
        kode: true,
        nama: true,
        kondisi: true,
        jumlah: true,
        jumlahStok: true,
        lokasi: true,
        status: true,
        kategoriAset: { select: { id: true, nama: true } },
        gudang: { select: { id: true, nama: true, lokasi: true } },
      },
      orderBy: { nama: "asc" },
    });

    const data = asets.map((a) => ({
      ...a,
      isTersedia: a.jumlahStok > 0 && a.status === "aktif",
    }));

    return successResponse(
      res,
      "Daftar ketersediaan aset berhasil diambil",
      data
    );
  } catch (error) {
    next(error);
  }
};

export const getDaftarPeminjaman = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;
    const role = req.user?.role;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    const where: any = { sekolahId, dihapusPada: null };

    if (role === "guru") {
      where.peminjamId = userId;
    }

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { nomorPeminjaman: { contains: search, mode: "insensitive" } },
        { keperluan: { contains: search, mode: "insensitive" } },
        { namaSiswaPengambil: { contains: search, mode: "insensitive" } },
        { namaSiswaPengembali: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, totalData] = await Promise.all([
      prisma.peminjamanAset.findMany({
        where,
        skip,
        take: limit,
        include: {
          peminjam: { select: { id: true, namaLengkap: true, nip: true } },
          petugas: { select: { id: true, namaLengkap: true } },
          detailPeminjaman: {
            include: {
              aset: { select: { id: true, kode: true, nama: true } },
            },
          },
        },
        orderBy: { dibuatPada: "desc" },
      }),
      prisma.peminjamanAset.count({ where }),
    ]);

    return paginatedResponse(
      res,
      "Data peminjaman aset berhasil diambil",
      data,
      page,
      limit,
      totalData
    );
  } catch (error) {
    next(error);
  }
};

export const getDetailPeminjaman = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;
    const role = req.user?.role;

    const where: any = { id, sekolahId, dihapusPada: null };
    if (role === "guru") {
      where.peminjamId = userId;
    }

    const data = await prisma.peminjamanAset.findFirst({
      where,
      include: {
        peminjam: {
          select: { id: true, namaLengkap: true, email: true, noTelepon: true },
        },
        petugas: { select: { id: true, namaLengkap: true } },
        siswaPengambil: { select: { id: true, namaLengkap: true, nisn: true } },
        siswaPengembali: { select: { id: true, namaLengkap: true, nisn: true } },
        detailPeminjaman: {
          include: {
            aset: { select: { id: true, kode: true, nama: true, lokasi: true } },
          },
        },
      },
    });

    if (!data) throw new AppError("Data peminjaman tidak ditemukan", 404);

    return successResponse(res, "Detail peminjaman berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};