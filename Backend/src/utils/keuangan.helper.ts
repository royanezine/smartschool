import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const handle =
  (fn: Handler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (e: any) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ success: false, message: e.message });
      }
      if (e?.code === 'P2002') {
        return res.status(409).json({ success: false, message: 'Data sudah ada' });
      }
      if (e?.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
      }
      console.error(e);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  };

export const getUser = (req: Request) => {
  const u = (req as any).user;
  if (!u?.userId) throw new HttpError(401, 'Tidak terautentikasi');
  if (!u?.sekolahId) throw new HttpError(403, 'Akun ini tidak terikat ke sekolah');
  return { id: u.userId as string, sekolahId: u.sekolahId as string };
};

export const ok = (res: Response, data: unknown, message = 'Berhasil', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const okPage = (
  res: Response,
  data: unknown,
  page: number,
  limit: number,
  total: number
) =>
  res.json({
    success: true,
    message: 'Berhasil',
    data,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });

export const parsePage = (req: Request) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

export const str = (v: unknown): string | undefined => {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
};

export const requireStr = (v: unknown, label: string): string => {
  const s = str(v);
  if (!s) throw new HttpError(400, `${label} wajib diisi`);
  return s;
};

export const toMoney = (v: unknown, label: string, allowZero = false): Prisma.Decimal => {
  if (v === undefined || v === null || v === '') throw new HttpError(400, `${label} wajib diisi`);
  let d: Prisma.Decimal;
  try {
    d = new Prisma.Decimal(v as any);
  } catch {
    throw new HttpError(400, `${label} tidak valid`);
  }
  if (!d.isFinite()) throw new HttpError(400, `${label} tidak valid`);
  if (allowZero ? d.lt(0) : d.lte(0)) {
    throw new HttpError(400, `${label} harus ${allowZero ? 'tidak negatif' : 'lebih dari 0'}`);
  }
  return d.toDecimalPlaces(2);
};

export const toDate = (v: unknown, label: string): Date => {
  const s = requireStr(v, label);
  const d = new Date(s.length === 10 ? `${s}T00:00:00.000Z` : s);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, `${label} tidak valid`);
  return d;
};

export const optDate = (v: unknown, label: string): Date | undefined => {
  const s = str(v);
  return s ? toDate(s, label) : undefined;
};

export const todayDate = (): Date => {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
};

export const nomor = (prefix: string): string => {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const d = String(n.getDate()).padStart(2, '0');
  return `${prefix}-${y}${m}${d}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

export const STATUS_TAGIHAN_AKTIF = ['belum_bayar', 'sebagian'];
export const METODE_PEMBAYARAN = ['tunai', 'transfer', 'qris', 'lainnya'];