import { NextFunction, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { paginationQuery, paginationMeta } from "../utils/pagination";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  LANGGANAN_DIBAYAR_WHERE,
  ambilSekolahBerlangganan,
  ambilSemuaIdSekolahBerlangganan,
  filterStatusSekolah,
  labelStatusSekolah,
} from "../utils/statusSekolah";

const querySchema = z.object({
  ...paginationQuery,
  search: z.string().trim().max(100).optional(),
  status: z.string().max(20).optional(),
});

const labelSekolahYayasan = async <
  T extends { sekolah: { id: string; status: string | null }[] },
>(
  daftar: T[],
  now: Date,
) => {
  const ids = daftar.flatMap((y) => y.sekolah.map((s) => s.id));
  const berlangganan = await ambilSekolahBerlangganan(ids, now);
  return daftar.map((y) => ({
    ...y,
    sekolah: labelStatusSekolah(y.sekolah, berlangganan),
  }));
};

export async function platformSchools(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = querySchema.parse(req.query);
    const id = req.params.id ? z.string().uuid().parse(req.params.id) : undefined;
    const now = new Date();

    const kondisi: Prisma.SekolahWhereInput[] = [{ dihapusPada: null }];
    if (id) kondisi.push({ id });
    if (query.status) kondisi.push(await filterStatusSekolah(query.status, now));
    if (query.search) {
      kondisi.push({ nama: { contains: query.search, mode: "insensitive" } });
    }
    const where: Prisma.SekolahWhereInput = { AND: kondisi };

    const select = {
      id: true,
      nama: true,
      subdomain: true,
      kode: true,
      npsn: true,
      status: true,
      jenjang: true,
      alamat: true,
      telepon: true,
      email: true,
      dibuatPada: true,
      yayasan: { select: { id: true, nama: true } },
      langgananSekolah: {
        where: LANGGANAN_DIBAYAR_WHERE,
        orderBy: { dibuatPada: "desc" as const },
        take: 1,
        select: {
          id: true,
          statusLangganan: true,
          tanggalMulai: true,
          tanggalBerakhir: true,
          paket: { select: { id: true, nama: true } },
        },
      },
      _count: {
        select: {
          pengguna: { where: { dihapusPada: null } },
          kelas: { where: { dihapusPada: null } },
        },
      },
    };

    if (id) {
      const mentah = await prisma.sekolah.findFirst({ where, select });
      if (!mentah) throw new AppError("Sekolah tidak ditemukan", 404);
      const berlangganan = await ambilSekolahBerlangganan([mentah.id], now);
      const [data] = labelStatusSekolah([mentah], berlangganan);
      return successResponse(res, "Detail sekolah", data);
    }

    const [mentah, total] = await Promise.all([
      prisma.sekolah.findMany({
        where,
        select,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ dibuatPada: "desc" }, { id: "asc" }],
      }),
      prisma.sekolah.count({ where }),
    ]);

    const berlangganan = await ambilSekolahBerlangganan(
      mentah.map((s) => s.id),
      now,
    );
    const data = labelStatusSekolah(mentah, berlangganan);

    return res.json({
      success: true,
      data,
      meta: paginationMeta(query.page, query.limit, total),
    });
  } catch (error) {
    next(error);
  }
}

export async function platformFoundations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = querySchema.parse(req.query);
    const id = req.params.id ? z.string().uuid().parse(req.params.id) : undefined;
    const subscribed = z.enum(["true", "false"]).optional().parse(req.query.berlangganan);
    const now = new Date();

    const where = {
      dihapusPada: null,
      ...(id && { id }),
      ...(subscribed === "true"
        ? { paketId: { not: null } }
        : subscribed === "false"
          ? { paketId: null }
          : {}),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        nama: { contains: query.search, mode: "insensitive" as const },
      }),
    };

    const select = {
      id: true,
      nama: true,
      npyp: true,
      status: true,
      alamat: true,
      telepon: true,
      email: true,
      dibuatPada: true,
      statusLangganan: true,
      tanggalMulaiLangganan: true,
      tanggalBerakhirLangganan: true,
      paket: true,
      sekolah: {
        where: { dihapusPada: null },
        orderBy: { nama: "asc" as const },
      },
      _count: { select: { sekolah: { where: { dihapusPada: null } } } },
    };

    if (id) {
      const mentah = await prisma.yayasan.findFirst({ where, select });
      if (!mentah) throw new AppError("Yayasan tidak ditemukan", 404);
      const [data] = await labelSekolahYayasan([mentah], now);
      return successResponse(res, "Detail yayasan", data);
    }

    const [mentah, total] = await Promise.all([
      prisma.yayasan.findMany({
        where,
        select,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ dibuatPada: "desc" }, { id: "asc" }],
      }),
      prisma.yayasan.count({ where }),
    ]);

    const data = await labelSekolahYayasan(mentah, now);

    return res.json({
      success: true,
      data,
      meta: paginationMeta(query.page, query.limit, total),
    });
  } catch (error) {
    next(error);
  }
}

export async function platformSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const idBerlangganan = await ambilSemuaIdSekolahBerlangganan(now);

    const [
      totalSekolah,
      totalYayasan,
      totalPengguna,
      sekolahAktif,
      sekolahUjiCoba,
      trial,
      paid,
    ] = await Promise.all([
      prisma.sekolah.count({ where: { dihapusPada: null } }),
      prisma.yayasan.count({ where: { dihapusPada: null } }),
      prisma.pengguna.count({ where: { dihapusPada: null } }),
      prisma.sekolah.count({
        where: { dihapusPada: null, status: "aktif", id: { in: idBerlangganan } },
      }),
      prisma.sekolah.count({
        where: { dihapusPada: null, status: "uji coba", id: { in: idBerlangganan } },
      }),
      prisma.sekolah.count({
        where: {
          dihapusPada: null,
          langgananSekolah: {
            some: {
              statusLangganan: "trialing",
              tanggalMulai: { lte: now },
              tanggalBerakhir: { gte: now },
            },
          },
        },
      }),
      prisma.sekolah.count({
        where: {
          dihapusPada: null,
          langgananSekolah: {
            some: {
              statusLangganan: "active",
              tanggalMulai: { lte: now },
              tanggalBerakhir: { gte: now },
            },
          },
        },
      }),
    ]);

    return successResponse(res, "Ringkasan platform", {
      totalSekolah,
      totalYayasan,
      totalPengguna,
      sekolahAktif,
      sekolahUjiCoba,
      sekolahTidakAktif: Math.max(0, totalSekolah - sekolahAktif - sekolahUjiCoba),
      langgananTrialAktif: trial,
      langgananBerbayarAktif: paid,
      dihitungPada: now,
    });
  } catch (error) {
    next(error);
  }
}