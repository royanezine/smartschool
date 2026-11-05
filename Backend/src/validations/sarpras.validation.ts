import { z } from "zod";

export const gudangSchema = z.object({
  nama: z.string().trim().min(1).max(100),
  lokasi: z.string().trim().max(255).optional().nullable(),
  keterangan: z.string().trim().max(255).optional().nullable(),
});

export const kategoriAsetSchema = z.object({
  nama: z.string().trim().min(1).max(100),
  keterangan: z.string().trim().max(255).optional().nullable(),
});

export const ruanganSchema = z.object({
  nama: z.string().trim().min(1).max(100),
  lokasi: z.string().trim().max(255).optional().nullable(),
  kapasitas: z.number().int().nonnegative().optional().nullable(),
  keterangan: z.string().trim().max(255).optional().nullable(),
  gedungId: z.string().uuid("ID gedung tidak valid").optional().nullable(),
  lantaiId: z.string().uuid("ID lantai tidak valid").optional().nullable(),
});

export const asetSchema = z.object({
  nama: z.string().trim().min(1).max(150),
  kode: z.string().trim().min(1).max(50),
  gudangId: z.string().uuid().optional().nullable(),
  kategoriAsetId: z.string().uuid().optional().nullable(),
  ruanganId: z.string().uuid().optional().nullable(),
  kondisi: z.string().trim().max(50).optional().nullable(),
  jumlah: z.number().int().nonnegative().optional(),
  keterangan: z.string().trim().max(255).optional().nullable(),
});
