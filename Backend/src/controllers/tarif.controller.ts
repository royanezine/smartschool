import { Request, Response } from 'express';
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
  HttpError,
} from '../utils/keuangan.helper';

const SIKLUS = ['bulanan', 'tahunan', 'sekali'];

export const listKategori = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);
  const q = str(req.query.q);
  const status = str(req.query.status);

  const where: any = { sekolahId, dihapusPada: null };
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { nama: { contains: q, mode: 'insensitive' } },
      { kode: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.kategoriTagihan.findMany({ where, orderBy: { nama: 'asc' }, skip, take: limit }),
    prisma.kategoriTagihan.count({ where }),
  ]);

  return okPage(res, data, page, limit, total);
});

export const createKategori = handle(async (req: Request, res: Response) => {
  const { id, sekolahId } = getUser(req);
  const kode = requireStr(req.body.kode, 'Kode').toUpperCase();
  const nama = requireStr(req.body.nama, 'Nama');
  const siklus = str(req.body.siklus) ?? 'bulanan';
  if (!SIKLUS.includes(siklus)) throw new HttpError(400, 'Siklus tidak valid');

  const exists = await prisma.kategoriTagihan.findFirst({
    where: { sekolahId, kode, dihapusPada: null },
  });
  if (exists) throw new HttpError(409, 'Kode kategori sudah digunakan');

  const data = await prisma.kategoriTagihan.create({
    data: {
      sekolahId,
      kode,
      nama,
      siklus,
      deskripsi: str(req.body.deskripsi),
      status: 'aktif',
      dibuatOleh: id,
    },
  });

  return ok(res, data, 'Kategori tagihan dibuat', 201);
});

export const updateKategori = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);

  const current = await prisma.kategoriTagihan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });
  if (!current) throw new HttpError(404, 'Kategori tagihan tidak ditemukan');

  const data: any = { diperbaruiOleh: userId };

  if (req.body.kode !== undefined) {
    const kode = requireStr(req.body.kode, 'Kode').toUpperCase();
    if (kode !== current.kode) {
      const dup = await prisma.kategoriTagihan.findFirst({
        where: { sekolahId, kode, dihapusPada: null, NOT: { id } },
      });
      if (dup) throw new HttpError(409, 'Kode kategori sudah digunakan');
    }
    data.kode = kode;
  }
  if (req.body.nama !== undefined) data.nama = requireStr(req.body.nama, 'Nama');
  if (req.body.siklus !== undefined) {
    const siklus = requireStr(req.body.siklus, 'Siklus');
    if (!SIKLUS.includes(siklus)) throw new HttpError(400, 'Siklus tidak valid');
    data.siklus = siklus;
  }
  if (req.body.deskripsi !== undefined) data.deskripsi = str(req.body.deskripsi) ?? null;
  if (req.body.status !== undefined) {
    const status = requireStr(req.body.status, 'Status');
    if (!['aktif', 'tidak_aktif'].includes(status)) throw new HttpError(400, 'Status tidak valid');
    data.status = status;
  }

  const updated = await prisma.kategoriTagihan.update({ where: { id }, data });
  return ok(res, updated, 'Kategori tagihan diperbarui');
});

export const deleteKategori = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);

  const current = await prisma.kategoriTagihan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });
  if (!current) throw new HttpError(404, 'Kategori tagihan tidak ditemukan');

  const dipakai = await prisma.tagihan.count({
    where: { kategoriTagihanId: id, dihapusPada: null },
  });
  if (dipakai > 0) {
    throw new HttpError(409, 'Kategori sudah dipakai pada tagihan dan tidak dapat dihapus');
  }

  await prisma.$transaction([
    prisma.tarifTagihan.updateMany({
      where: { kategoriTagihanId: id, dihapusPada: null },
      data: { dihapusPada: new Date(), dihapusOleh: userId },
    }),
    prisma.kategoriTagihan.update({
      where: { id },
      data: { dihapusPada: new Date(), dihapusOleh: userId },
    }),
  ]);

  return ok(res, null, 'Kategori tagihan dihapus');
});

export const listTarif = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);

  const where: any = { sekolahId, dihapusPada: null };
  const kategoriTagihanId = str(req.query.kategoriTagihanId);
  const tahunAjaranId = str(req.query.tahunAjaranId);
  const kelasId = str(req.query.kelasId);
  const tingkat = str(req.query.tingkat);
  const status = str(req.query.status);
  if (kategoriTagihanId) where.kategoriTagihanId = kategoriTagihanId;
  if (tahunAjaranId) where.tahunAjaranId = tahunAjaranId;
  if (kelasId) where.kelasId = kelasId;
  if (tingkat) where.tingkat = tingkat;
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.tarifTagihan.findMany({
      where,
      include: {
        kategoriTagihan: { select: { id: true, kode: true, nama: true, siklus: true } },
        tahunAjaran: { select: { id: true, tahunAjaran: true, semester: true } },
        kelas: { select: { id: true, nama: true, tingkat: true } },
      },
      orderBy: [{ dibuatPada: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.tarifTagihan.count({ where }),
  ]);

  return okPage(res, data, page, limit, total);
});

export const createTarif = handle(async (req: Request, res: Response) => {
  const { id, sekolahId } = getUser(req);
  const kategoriTagihanId = requireStr(req.body.kategoriTagihanId, 'Kategori tagihan');
  const tahunAjaranId = requireStr(req.body.tahunAjaranId, 'Tahun ajaran');
  const kelasId = str(req.body.kelasId);
  const tingkat = kelasId ? undefined : str(req.body.tingkat);
  const nominal = toMoney(req.body.nominal, 'Nominal');

  const [kategori, tahun, kelas] = await Promise.all([
    prisma.kategoriTagihan.findFirst({
      where: { id: kategoriTagihanId, sekolahId, dihapusPada: null },
    }),
    prisma.tahunAjaran.findFirst({ where: { id: tahunAjaranId, sekolahId, dihapusPada: null } }),
    kelasId
      ? prisma.kelas.findFirst({ where: { id: kelasId, sekolahId, dihapusPada: null } })
      : Promise.resolve(null),
  ]);

  if (!kategori) throw new HttpError(404, 'Kategori tagihan tidak ditemukan');
  if (!tahun) throw new HttpError(404, 'Tahun ajaran tidak ditemukan');
  if (kelasId && !kelas) throw new HttpError(404, 'Kelas tidak ditemukan');

  const dup = await prisma.tarifTagihan.findFirst({
    where: {
      sekolahId,
      kategoriTagihanId,
      tahunAjaranId,
      kelasId: kelasId ?? null,
      tingkat: tingkat ?? null,
      dihapusPada: null,
    },
  });
  if (dup) throw new HttpError(409, 'Tarif untuk cakupan ini sudah ada');

  const data = await prisma.tarifTagihan.create({
    data: {
      sekolahId,
      kategoriTagihanId,
      tahunAjaranId,
      kelasId: kelasId ?? null,
      tingkat: tingkat ?? null,
      nominal,
      keterangan: str(req.body.keterangan),
      status: 'aktif',
      dibuatOleh: id,
    },
  });

  return ok(res, data, 'Tarif tagihan dibuat', 201);
});

export const updateTarif = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);

  const current = await prisma.tarifTagihan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });
  if (!current) throw new HttpError(404, 'Tarif tagihan tidak ditemukan');

  const data: any = { diperbaruiOleh: userId };
  if (req.body.nominal !== undefined) data.nominal = toMoney(req.body.nominal, 'Nominal');
  if (req.body.keterangan !== undefined) data.keterangan = str(req.body.keterangan) ?? null;
  if (req.body.status !== undefined) {
    const status = requireStr(req.body.status, 'Status');
    if (!['aktif', 'tidak_aktif'].includes(status)) throw new HttpError(400, 'Status tidak valid');
    data.status = status;
  }

  const updated = await prisma.tarifTagihan.update({ where: { id }, data });
  return ok(res, updated, 'Tarif tagihan diperbarui');
});

export const deleteTarif = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);

  const current = await prisma.tarifTagihan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });
  if (!current) throw new HttpError(404, 'Tarif tagihan tidak ditemukan');

  await prisma.tarifTagihan.update({
    where: { id },
    data: { dihapusPada: new Date(), dihapusOleh: userId, status: 'tidak_aktif' },
  });

  return ok(res, null, 'Tarif tagihan dihapus');
});