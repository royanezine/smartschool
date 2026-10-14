import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createShiftKerjaSchema = z.object({
  nama: z.string().min(1, "Nama shift wajib diisi").max(50),
  kode: z.string().max(20).optional(),
  jamMasuk: z.string().regex(timeRegex, "Format jam masuk harus HH:mm (contoh: 07:00)"),
  jamKeluar: z.string().regex(timeRegex, "Format jam keluar harus HH:mm (contoh: 14:00)"),
  toleransiTerlambatMenit: z.coerce.number().int().min(0).default(15),
  status: z.enum(["aktif", "nonaktif"]).default("aktif"),
  sekolahId: z.string().uuid("ID Sekolah tidak valid").optional(),
});

export const updateShiftKerjaSchema = z.object({
  nama: z.string().min(1).max(50).optional(),
  kode: z.string().max(20).optional(),
  jamMasuk: z.string().regex(timeRegex, "Format jam masuk harus HH:mm (contoh: 07:00)").optional(),
  jamKeluar: z.string().regex(timeRegex, "Format jam keluar harus HH:mm (contoh: 14:00)").optional(),
  toleransiTerlambatMenit: z.coerce.number().int().min(0).optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
});
