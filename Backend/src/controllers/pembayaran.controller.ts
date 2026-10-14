import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from "../config/db";
import {
  handle,
  getUser,
  ok,
  okPage,
  parsePage,
  str,
  requireStr,
  toMoney,
  toDate,
  optDate,
  nomor,
  todayDate,
  HttpError,
  STATUS_TAGIHAN_AKTIF,
  METODE_PEMBAYARAN,
} from '../utils/keuangan.helper';

export const bayarTagihan = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const tagihanId = requireStr(req.body.tagihanId, 'Tagihan');
  const akunKasId = requireStr(req.body.akunKasId, 'Akun kas');
  const metode = requireStr(req.body.metode, 'Metode pembayaran');
  const jumlah = toMoney(req.body.jumlah, 'Jumlah pembayaran');
  const tanggalBayar = req.body.tanggalBayar ? toDate(req.body.tanggalBayar, 'Tanggal bayar') : todayDate();

  if (!METODE_PEMBAYARAN.includes(metode)) {
    throw new HttpError(400, `Metode harus salah satu dari: ${METODE_PEMBAYARAN.join(', ')}`);
  }

  const hasil = await prisma.$transaction(async (tx) => {
    const akun = await tx.akunKas.findFirst({
      where: { id: akunKasId, sekolahId, status: 'aktif', dihapusPada: null },
    });
    if (!akun) throw new HttpError(404, 'Akun kas tidak ditemukan atau tidak aktif');

    const tagihan = await tx.tagihan.findFirst({
      where: { id: tagihanId, sekolahId, dihapusPada: null },
      include: {
        siswa: { select: { id: true, namaLengkap: true } },
        kategoriTagihan: { select: { nama: true } },
      },
    });
    if (!tagihan) throw new HttpError(404, 'Tagihan tidak ditemukan');
    if (!STATUS_TAGIHAN_AKTIF.includes(tagihan.status)) {
      throw new HttpError(409, `Tagihan berstatus ${tagihan.status} dan tidak dapat dibayar`);
    }
    if (jumlah.gt(tagihan.sisa)) {
      throw new HttpError(400, 'Jumlah pembayaran melebihi sisa tagihan');
    }

    const upd = await tx.tagihan.updateMany({
      where: { id: tagihanId, sekolahId, status: { in: STATUS_TAGIHAN_AKTIF }, sisa: { gte: jumlah } },
      data: {
        totalDibayar: { increment: jumlah },
        sisa: { decrement: jumlah },
        diperbaruiOleh: userId,
      },
    });
    if (upd.count === 0) {
      throw new HttpError(409, 'Tagihan baru saja berubah, muat ulang lalu coba lagi');
    }

    const setelah = await tx.tagihan.findUniqueOrThrow({ where: { id: tagihanId } });
    const statusBaru = setelah.sisa.lte(0) ? 'lunas' : 'sebagian';
    await tx.tagihan.update({ where: { id: tagihanId }, data: { status: statusBaru } });

    const pembayaran = await tx.pembayaranTagihan.create({
      data: {
        sekolahId,
        tagihanId,
        siswaId: tagihan.siswaId,
        akunKasId,
        penerimaId: userId,
        nomorPembayaran: nomor('PAY'),
        jumlah,
        metode,
        tanggalBayar,
        referensi: str(req.body.referensi),
        catatan: str(req.body.catatan),
        status: 'berhasil',
        dibuatOleh: userId,
      },
    });

    await tx.jurnalKas.create({
      data: {
        sekolahId,
        akunKasId,
        nomorJurnal: nomor('JRN'),
        tanggal: tanggalBayar,
        jenis: 'masuk',
        kategori: 'pembayaran_tagihan',
        jumlah,
        keterangan: `${tagihan.kategoriTagihan.nama} ${tagihan.nomorTagihan} - ${tagihan.siswa.namaLengkap}`,
        sumber: 'pembayaran_tagihan',
        sumberId: pembayaran.id,
        status: 'aktif',
        dibuatOleh: userId,
      },
    });

    return {
      pembayaran,
      tagihan: {
        id: setelah.id,
        nomorTagihan: setelah.nomorTagihan,
        totalTagihan: setelah.totalTagihan,
        totalDibayar: setelah.totalDibayar,
        sisa: setelah.sisa,
        status: statusBaru,
      },
    };
  });

  return ok(res, hasil, 'Pembayaran berhasil dicatat', 201);
});

export const listPembayaran = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);

  const where: Prisma.PembayaranTagihanWhereInput = { sekolahId, dihapusPada: null };
  const siswaId = str(req.query.siswaId);
  const tagihanId = str(req.query.tagihanId);
  const metode = str(req.query.metode);
  const status = str(req.query.status);
  const akunKasId = str(req.query.akunKasId);
  const dari = optDate(req.query.dari, 'Tanggal dari');
  const sampai = optDate(req.query.sampai, 'Tanggal sampai');
  const q = str(req.query.q);

  if (siswaId) where.siswaId = siswaId;
  if (tagihanId) where.tagihanId = tagihanId;
  if (metode) where.metode = metode;
  if (status) where.status = status;
  if (akunKasId) where.akunKasId = akunKasId;
  if (dari || sampai) {
    where.tanggalBayar = { ...(dari ? { gte: dari } : {}), ...(sampai ? { lte: sampai } : {}) };
  }
  if (q) {
    where.OR = [
      { nomorPembayaran: { contains: q, mode: 'insensitive' } },
      { siswa: { namaLengkap: { contains: q, mode: 'insensitive' } } },
      { siswa: { nis: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [data, total, agg] = await Promise.all([
    prisma.pembayaranTagihan.findMany({
      where,
      include: {
        siswa: { select: { id: true, namaLengkap: true, nis: true } },
        tagihan: {
          select: {
            id: true,
            nomorTagihan: true,
            periodeBulan: true,
            periodeTahun: true,
            kategoriTagihan: { select: { kode: true, nama: true } },
          },
        },
        akunKas: { select: { id: true, nama: true } },
      },
      orderBy: [{ tanggalBayar: 'desc' }, { dibuatPada: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.pembayaranTagihan.count({ where }),
    prisma.pembayaranTagihan.aggregate({
      where: { ...where, status: 'berhasil' },
      _sum: { jumlah: true },
    }),
  ]);

  return res.json({
    success: true,
    message: 'Berhasil',
    data,
    ringkasan: { totalDiterima: agg._sum.jumlah ?? new Prisma.Decimal(0) },
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const detailPembayaran = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const id = String(req.params.id);

  const data = await prisma.pembayaranTagihan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
    include: {
      siswa: { select: { id: true, namaLengkap: true, nis: true, nisn: true } },
      penerima: { select: { id: true, namaLengkap: true } },
      akunKas: { select: { id: true, kode: true, nama: true } },
      tagihan: {
        include: {
          kategoriTagihan: { select: { kode: true, nama: true } },
          tahunAjaran: { select: { tahunAjaran: true, semester: true } },
        },
      },
    },
  });
  if (!data) throw new HttpError(404, 'Pembayaran tidak ditemukan');

  return ok(res, data);
});

export const batalkanPembayaran = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);
  const alasan = requireStr(req.body.alasan, 'Alasan pembatalan');

  const hasil = await prisma.$transaction(async (tx) => {
    const pembayaran = await tx.pembayaranTagihan.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!pembayaran) throw new HttpError(404, 'Pembayaran tidak ditemukan');

    const upd = await tx.pembayaranTagihan.updateMany({
      where: { id, sekolahId, status: 'berhasil' },
      data: {
        status: 'dibatalkan',
        dibatalkanPada: new Date(),
        dibatalkanOleh: userId,
        alasanPembatalan: alasan,
        diperbaruiOleh: userId,
      },
    });
    if (upd.count === 0) throw new HttpError(409, 'Pembayaran sudah dibatalkan');

    await tx.tagihan.update({
      where: { id: pembayaran.tagihanId },
      data: {
        totalDibayar: { decrement: pembayaran.jumlah },
        sisa: { increment: pembayaran.jumlah },
        diperbaruiOleh: userId,
      },
    });

    const setelah = await tx.tagihan.findUniqueOrThrow({ where: { id: pembayaran.tagihanId } });
    const statusBaru = setelah.totalDibayar.lte(0) ? 'belum_bayar' : 'sebagian';
    await tx.tagihan.update({ where: { id: setelah.id }, data: { status: statusBaru } });

    await tx.jurnalKas.updateMany({
      where: { sekolahId, sumber: 'pembayaran_tagihan', sumberId: id, status: 'aktif' },
      data: { status: 'dibatalkan', diperbaruiOleh: userId },
    });

    return {
      pembayaranId: id,
      tagihan: {
        id: setelah.id,
        totalDibayar: setelah.totalDibayar,
        sisa: setelah.sisa,
        status: statusBaru,
      },
    };
  });

  return ok(res, hasil, 'Pembayaran dibatalkan');
});