import { z } from "zod";

export const createJalurPpdbSchema = z.object({
  nama: z
    .string()
    .min(2, "Nama jalur minimal 2 karakter")
    .max(50, "Nama jalur maksimal 50 karakter"),

  deskripsi: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),

  kuota: z.coerce
    .number()
    .int()
    .positive("Kuota harus lebih dari 0"),

  tanggalMulai: z.coerce.date().optional(),

  tanggalSelesai: z.coerce.date().optional(),

  status: z
    .string()
    .max(20)
    .optional(),
});

export const updateJalurPpdbSchema = createJalurPpdbSchema.partial();