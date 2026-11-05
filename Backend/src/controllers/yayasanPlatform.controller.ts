import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  LANGGANAN_DIBAYAR_WHERE,
  ambilSekolahBerlangganan,
  labelStatusSekolah,
} from "../utils/statusSekolah";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  statusLangganan: z.string().trim().optional(),
});

export const listYayasanBerlangganan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, search, statusLangganan } = querySchema.parse(
      req.query,
    );

    const where: Prisma.YayasanWhereInput = {
      dihapusPada: null,
      paketId: { not: null },
    };
    if (statusLangganan) where.statusLangganan = statusLangganan;
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { npyp: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, daftar] = await Promise.all([
      prisma.yayasan.count({ where }),
      prisma.yayasan.findMany({
        where,
        orderBy: { tanggalMulaiLangganan: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nama: true,
          npyp: true,
          email: true,
          telepon: true,
          status: true,
          statusLangganan: true,
          tanggalMulaiLangganan: true,
          tanggalBerakhirLangganan: true,
          paket: {
            select: { id: true, nama: true, harga: true, durasi: true },
          },
          _count: {
            select: { sekolah: { where: { dihapusPada: null } } },
          },
        },
      }),
    ]);

    const items = daftar.map(({ _count, paket, ...yayasan }) => ({
      id: yayasan.id,
      nama: yayasan.nama,
      npyp: yayasan.npyp,
      email: yayasan.email,
      telepon: yayasan.telepon,
      status: yayasan.status,
      langganan: {
        paket,
        statusLangganan: yayasan.statusLangganan,
        tanggalMulai: yayasan.tanggalMulaiLangganan,
        tanggalBerakhir: yayasan.tanggalBerakhirLangganan,
      },
      totalSekolah: _count.sekolah,
    }));

    return successResponse(res, "Berhasil mengambil daftar yayasan berlangganan", {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDetailYayasanLangganan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = z.string().uuid().parse(req.params.yayasanId);

    const yayasan = await prisma.yayasan.findFirst({
      where: { id, dihapusPada: null },
      include: {
        paket: {
          include: {
            paketModul: {
              where: { dihapusPada: null },
              include: { modul: { select: { kode: true, nama: true } } },
            },
          },
        },
        pengguna: {
          where: {
            sekolahId: null,
            dihapusPada: null,
            peran: { nama: "admin_yayasan" },
          },
          select: {
            id: true,
            namaLengkap: true,
            namaPengguna: true,
            email: true,
            status: true,
            terakhirLogin: true,
          },
        },
        sekolah: {
          where: { dihapusPada: null },
          orderBy: { nama: "asc" },
          select: {
            id: true,
            nama: true,
            npsn: true,
            kode: true,
            subdomain: true,
            jenjang: true,
            status: true,
            langgananSekolah: {
              where: LANGGANAN_DIBAYAR_WHERE,
              orderBy: { dibuatPada: "desc" },
              take: 1,
              select: {
                statusLangganan: true,
                tanggalBerakhir: true,
                paket: { select: { nama: true } },
              },
            },
          },
        },
        pendaftaranTenant: {
          select: {
            id: true,
            midtransOrderId: true,
            status: true,
            dikonversiPada: true,
            dibuatPada: true,
          },
        },
      },
    });

    if (!yayasan) throw new AppError("Yayasan tidak ditemukan", 404);

    const berlangganan = await ambilSekolahBerlangganan(
      yayasan.sekolah.map((s) => s.id),
    );

    const sekarang = Date.now();
    const berakhir = yayasan.tanggalBerakhirLangganan;
    const sisaHari = berakhir
      ? Math.max(0, Math.ceil((berakhir.getTime() - sekarang) / 86400000))
      : null;

    const paket = yayasan.paket
      ? {
          id: yayasan.paket.id,
          nama: yayasan.paket.nama,
          deskripsi: yayasan.paket.deskripsi,
          harga: yayasan.paket.harga,
          durasi: yayasan.paket.durasi,
          modul: yayasan.paket.paketModul.map((pm) => pm.modul),
        }
      : null;

    return successResponse(res, "Berhasil mengambil detail langganan yayasan", {
      yayasan: {
        id: yayasan.id,
        nama: yayasan.nama,
        npyp: yayasan.npyp,
        alamat: yayasan.alamat,
        telepon: yayasan.telepon,
        email: yayasan.email,
        status: yayasan.status,
        dibuatPada: yayasan.dibuatPada,
      },
      langganan: {
        paket,
        statusLangganan: yayasan.statusLangganan,
        tanggalMulai: yayasan.tanggalMulaiLangganan,
        tanggalBerakhir: yayasan.tanggalBerakhirLangganan,
        sisaHari,
      },
      admin: yayasan.pengguna,
      totalSekolah: yayasan.sekolah.length,
      sekolah: labelStatusSekolah(yayasan.sekolah, berlangganan).map(
        ({ langgananSekolah, ...sekolah }) => ({
          ...sekolah,
          langganan: langgananSekolah[0] ?? null,
        }),
      ),
      riwayatPendaftaran: yayasan.pendaftaranTenant ? [yayasan.pendaftaranTenant] : [],
    });
  } catch (error) {
    next(error);
  }
};