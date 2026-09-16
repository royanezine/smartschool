import { z } from "zod";

export const pendaftaranPpdbSchema = z.object({
  sekolahId: z.string().uuid(),

  jalurPpdbId: z.string().uuid(),

  namaLengkap: z
    .string()
    .min(2)
    .max(100),

  nisn: z
    .string()
    .min(10)
    .max(20),

  tempatLahir: z
    .string()
    .min(2)
    .max(50),

  tanggalLahir: z.coerce.date(),

  jenisKelamin: z
    .string()
    .min(1)
    .max(10),

  alamat: z
    .string()
    .min(5),

  telepon: z
    .string()
    .max(20)
    .optional(),

  email: z
    .string()
    .email()
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

