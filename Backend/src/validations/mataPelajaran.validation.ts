import { z } from "zod";

export const createMataPelajaranSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama mata pelajaran wajib diisi")
    .max(100, "Nama mata pelajaran maksimal 100 karakter"),

  kode: z
    .string()
    .min(1, "Kode mata pelajaran wajib diisi")
    .max(20, "Kode mata pelajaran maksimal 20 karakter"),

  status: z
    .string()
    .max(20, "Status maksimal 20 karakter")
    .optional(),
});

export const updateMataPelajaranSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama mata pelajaran tidak boleh kosong")
    .max(100, "Nama mata pelajaran maksimal 100 karakter")
    .optional(),

  kode: z
    .string()
    .min(1, "Kode mata pelajaran tidak boleh kosong")
    .max(20, "Kode mata pelajaran maksimal 20 karakter")
    .optional(),

  status: z
    .string()
    .max(20, "Status maksimal 20 karakter")
    .optional(),
});