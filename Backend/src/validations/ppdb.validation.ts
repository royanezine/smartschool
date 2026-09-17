import { z } from "zod";

export const pendaftaranPpdbSchema = z.object({
  sekolahId: z.string().uuid(),
  jalurPpdbId: z.string().uuid(),

  namaLengkap: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100),

  nisn: z
    .string()
    .min(10, "NISN minimal 10 karakter")
    .max(20, "NISN maksimal 20 karakter"),

  tempatLahir: z
    .string()
    .min(2, "Tempat lahir minimal 2 karakter")
    .max(50),

  tanggalLahir: z.coerce.date(),

  jenisKelamin: z
    .string()
    .min(1)
    .max(10),

  alamat: z
    .string()
    .min(5, "Alamat minimal 5 karakter"),

  telepon: z
    .string()
    .max(20)
    .optional(),

  email: z
    .string()
    .email("Format email tidak valid")
    .optional(),

  namaAyah: z
    .string()
    .max(100)
    .optional(),

  namaIbu: z
    .string()
    .max(100)
    .optional(),

  asalSekolah: z
    .string()
    .max(100)
    .optional(),

  nilaiRapor: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional(),
});