import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  buatSekolahCabangSchema,
  listSekolahCabangQuerySchema,
} from "../validations/yayasan.validation";

export const buatSekolahCabang = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as AuthRequest).user;
    const yayasanId = user?.yayasanId;

    if (!user || !yayasanId) {
      throw new AppError("Akun tidak terhubung dengan yayasan", 403);
    }

    const data = buatSekolahCabangSchema.parse(req.body);
    const emailAdmin = `admin@${data.subdomain}.smartschool.id`;
    const namaPenggunaAdmin = `admin_${data.subdomain}`;
    const passwordDefault = crypto.randomBytes(9).toString("base64url");
    const kataSandiHash = await bcrypt.hash(passwordDefault, 10);

    const hasil = await prisma.$transaction(async (tx) => {
      const yayasan = await tx.yayasan.findFirst({
        where: { id: yayasanId, dihapusPada: null },
        select: { tanggalBerakhirLangganan: true },
      });
      if (!yayasan) throw new AppError("Yayasan tidak ditemukan", 404);

      const paket = await tx.paket.findFirst({
        where: {
          id: data.paketId,
          tipe: "SEKOLAH",
          status: "aktif",
          dihapusPada: null,
        },
        include: {
          paketModul: {
            where: { dihapusPada: null },
            select: { modulId: true },
          },
        },
      });
      if (!paket) {
        throw new AppError("Paket tidak valid untuk sekolah cabang", 400);
      }

      const sekolahBentrok = await tx.sekolah.findFirst({
        where: {
          OR: [
            { subdomain: data.subdomain },
            { kode: data.kode },
            { npsn: data.npsn },
          ],
        },
        select: { subdomain: true, kode: true, npsn: true },
      });
      if (sekolahBentrok) {
        if (sekolahBentrok.npsn === data.npsn) {
          throw new AppError("NPSN sudah terdaftar", 409);
        }
        if (sekolahBentrok.subdomain === data.subdomain) {
          throw new AppError("Subdomain sudah digunakan", 409);
        }
        throw new AppError("Kode sekolah sudah digunakan", 409);
      }

      const penggunaBentrok = await tx.pengguna.findFirst({
        where: {
          OR: [{ email: emailAdmin }, { namaPengguna: namaPenggunaAdmin }],
        },
        select: { id: true },
      });
      if (penggunaBentrok) {
        throw new AppError("Akun admin untuk subdomain ini sudah ada", 409);
      }

      const peranAdminSekolah = await tx.peran.findFirst({
        where: { nama: "admin_sekolah", sekolahId: null },
      });
      if (!peranAdminSekolah) {
        throw new AppError(
          "Sistem bermasalah: Peran admin_sekolah tidak ditemukan",
          500,
        );
      }

      const sekolah = await tx.sekolah.create({
        data: {
          yayasanId,
          nama: data.nama,
          subdomain: data.subdomain,
          kode: data.kode,
          npsn: data.npsn,
          jenjang: data.jenjang,
          alamat: data.alamat ?? null,
          telepon: data.telepon ?? null,
          email: data.email ?? null,
          status: "aktif",
          konfigurasi: { jenjang: data.jenjang },
          dibuatOleh: user.userId,
          diperbaruiOleh: user.userId,
        },
      });

      const adminSekolah = await tx.pengguna.create({
        data: {
          namaPengguna: namaPenggunaAdmin,
          email: emailAdmin,
          kataSandi: kataSandiHash,
          namaLengkap: `Admin ${data.nama}`.slice(0, 100),
          sekolahId: sekolah.id,
          peranId: peranAdminSekolah.id,
          status: "aktif",
          dibuatOleh: user.userId,
          diperbaruiOleh: user.userId,
        },
      });

      const mulai = new Date();
      const berakhir = yayasan.tanggalBerakhirLangganan
        ? new Date(yayasan.tanggalBerakhirLangganan)
        : new Date(mulai.getTime() + paket.durasi * 24 * 60 * 60 * 1000);

      const langganan = await tx.langgananSekolah.create({
        data: {
          sekolahId: sekolah.id,
          paketId: paket.id,
          dibuatOleh: user.userId,
          statusPembayaran: "success",
          statusLangganan: "active",
          tanggalMulai: mulai,
          tanggalBerakhir: berakhir,
          hargaSaatBerlangganan: 0,
          siklusPenagihan: "annual",
        },
      });

      await tx.sekolah.update({
        where: { id: sekolah.id },
        data: { langgananAktifId: langganan.id },
      });

      if (paket.paketModul.length > 0) {
        await tx.sekolahModul.createMany({
          data: paket.paketModul.map((pm) => ({
            sekolahId: sekolah.id,
            modulId: pm.modulId,
            status: "aktif",
            diaktifkanPada: mulai,
            kedaluwarsaPada: berakhir,
            dibuatOleh: user.userId,
            diperbaruiOleh: user.userId,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          penggunaId: user.userId,
          sekolahId: sekolah.id,
          aksi: "create",
          modul: "yayasan",
          entitasId: sekolah.id,
          dataBaru: {
            nama: sekolah.nama,
            npsn: sekolah.npsn,
            subdomain: sekolah.subdomain,
            paketId: paket.id,
            adminEmail: adminSekolah.email,
          },
        },
      });

      return { sekolah, adminSekolah, langganan, paket };
    });

    res.setHeader("Cache-Control", "no-store");

    return successResponse(
      res,
      "Cabang sekolah berhasil dibuat. Salin kredensial admin sekolah dan berikan ke Kepala Sekolah.",
      {
        sekolah: {
          id: hasil.sekolah.id,
          nama: hasil.sekolah.nama,
          npsn: hasil.sekolah.npsn,
          kode: hasil.sekolah.kode,
          subdomain: hasil.sekolah.subdomain,
          jenjang: hasil.sekolah.jenjang,
          status: hasil.sekolah.status,
        },
        langganan: {
          paketId: hasil.paket.id,
          paketNama: hasil.paket.nama,
          statusLangganan: hasil.langganan.statusLangganan,
          tanggalMulai: hasil.langganan.tanggalMulai,
          tanggalBerakhir: hasil.langganan.tanggalBerakhir,
        },
        kredensialAdmin: {
          namaPengguna: hasil.adminSekolah.namaPengguna,
          email: hasil.adminSekolah.email,
          kataSandi: passwordDefault,
        },
      },
      201,
    );
  } catch (error: any) {
    if (error?.code === "P2002") {
      return next(
        new AppError("Subdomain, kode, atau NPSN sudah terdaftar", 409),
      );
    }
    next(error);
  }
};

export const listSekolahCabang = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as AuthRequest).user;
    const yayasanId = user?.yayasanId;

    if (!yayasanId) {
      throw new AppError("Akun tidak terhubung dengan yayasan", 403);
    }

    const { page, limit, search } = listSekolahCabangQuerySchema.parse(
      req.query,
    );

    const where: Prisma.SekolahWhereInput = {
      yayasanId,
      dihapusPada: null,
    };

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { npsn: { contains: search, mode: "insensitive" } },
        { subdomain: { contains: search, mode: "insensitive" } },
        { kode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, sekolahList] = await Promise.all([
      prisma.sekolah.count({ where }),
      prisma.sekolah.findMany({
        where,
        orderBy: { dibuatPada: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nama: true,
          npsn: true,
          kode: true,
          subdomain: true,
          jenjang: true,
          alamat: true,
          telepon: true,
          email: true,
          status: true,
          dibuatPada: true,
          langgananSekolah: {
            orderBy: { dibuatPada: "desc" },
            take: 1,
            select: {
              statusLangganan: true,
              statusPembayaran: true,
              tanggalBerakhir: true,
              paket: { select: { id: true, nama: true } },
            },
          },
        },
      }),
    ]);

    const ids = sekolahList.map((s) => s.id);

    const [siswaRows, guruRows, kelasRows] = await Promise.all([
      prisma.pengguna.groupBy({
        by: ["sekolahId"],
        where: {
          sekolahId: { in: ids },
          dihapusPada: null,
          status: "aktif",
          peran: { nama: "siswa" },
        },
        _count: { _all: true },
      }),
      prisma.pengguna.groupBy({
        by: ["sekolahId"],
        where: {
          sekolahId: { in: ids },
          dihapusPada: null,
          status: "aktif",
          peran: { nama: "guru" },
        },
        _count: { _all: true },
      }),
      prisma.kelas.groupBy({
        by: ["sekolahId"],
        where: { sekolahId: { in: ids }, dihapusPada: null },
        _count: { _all: true },
      }),
    ]);

    const siswaMap = new Map(siswaRows.map((r) => [r.sekolahId, r._count._all]));
    const guruMap = new Map(guruRows.map((r) => [r.sekolahId, r._count._all]));
    const kelasMap = new Map(kelasRows.map((r) => [r.sekolahId, r._count._all]));

    const items = sekolahList.map(({ langgananSekolah, ...sekolah }) => ({
      ...sekolah,
      langganan: langgananSekolah[0] ?? null,
      statistik: {
        totalSiswa: siswaMap.get(sekolah.id) ?? 0,
        totalGuru: guruMap.get(sekolah.id) ?? 0,
        totalKelas: kelasMap.get(sekolah.id) ?? 0,
      },
    }));

    return successResponse(res, "Berhasil mengambil daftar cabang sekolah", {
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