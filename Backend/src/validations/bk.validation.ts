import { z } from "zod";

const TANGGAL_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const WAKTU_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ajukanSesiKonselingSchema = z
  .object({
    tanggal: z
      .string()
      .regex(TANGGAL_REGEX, "Format tanggal harus YYYY-MM-DD"),
    waktuMulai: z
      .string()
      .regex(WAKTU_REGEX, "Format waktu mulai harus HH:MM"),
    waktuSelesai: z
      .string()
      .regex(WAKTU_REGEX, "Format waktu selesai harus HH:MM"),
    topik: z
      .string()
      .trim()
      .min(1, "Topik wajib diisi")
      .max(150, "Topik maksimal 150 karakter"),
    masalah: z.string().optional().nullable(),
    konselorId: z.string().optional().nullable(),
  })
  .refine((data) => data.waktuSelesai > data.waktuMulai, {
    message: "waktuSelesai harus setelah waktuMulai",
    path: ["waktuSelesai"],
  });

export const createSesiKonselingSchema = z
  .object({
    siswaId: z
      .string()
      .min(1, "siswaId wajib diisi"),
    konselorId: z.string().optional().nullable(),
    tanggal: z
      .string()
      .regex(TANGGAL_REGEX, "Format tanggal harus YYYY-MM-DD"),
    waktuMulai: z
      .string()
      .regex(WAKTU_REGEX, "Format waktu mulai harus HH:MM"),
    waktuSelesai: z
      .string()
      .regex(WAKTU_REGEX, "Format waktu selesai harus HH:MM"),
    topik: z
      .string()
      .trim()
      .min(1, "Topik wajib diisi")
      .max(150, "Topik maksimal 150 karakter"),
    masalah: z.string().optional().nullable(),
    hasil: z.string().optional().nullable(),
    tindakLanjut: z.string().optional().nullable(),
    status: z
      .enum(["diajukan", "dijadwalkan", "berlangsung", "selesai", "dibatalkan"])
      .optional(),
    catatan: z.string().optional().nullable(),
  })
  .refine((data) => data.waktuSelesai > data.waktuMulai, {
    message: "waktuSelesai harus setelah waktuMulai",
    path: ["waktuSelesai"],
  });

export const updateSesiKonselingSchema = z
  .object({
    konselorId: z.string().optional().nullable(),
    tanggal: z
      .string()
      .regex(TANGGAL_REGEX, "Format tanggal harus YYYY-MM-DD")
      .optional(),
    waktuMulai: z
      .string()
      .regex(WAKTU_REGEX, "Format waktu mulai harus HH:MM")
      .optional(),
    waktuSelesai: z
      .string()
      .regex(WAKTU_REGEX, "Format waktu selesai harus HH:MM")
      .optional(),
    topik: z
      .string()
      .trim()
      .min(1, "Topik tidak boleh kosong")
      .max(150, "Topik maksimal 150 karakter")
      .optional(),
    masalah: z.string().optional().nullable(),
    hasil: z.string().optional().nullable(),
    tindakLanjut: z.string().optional().nullable(),
    status: z
      .enum(["diajukan", "dijadwalkan", "berlangsung", "selesai", "dibatalkan"])
      .optional(),
    catatan: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.waktuMulai && data.waktuSelesai) {
        return data.waktuSelesai > data.waktuMulai;
      }
      return true;
    },
    {
      message: "waktuSelesai harus setelah waktuMulai",
      path: ["waktuSelesai"],
    }
  );

export const createKategoriPelanggaranSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(1, "Nama kategori pelanggaran wajib diisi")
    .max(100, "Nama kategori maksimal 100 karakter"),
  deskripsi: z.string().optional().nullable(),
  poin: z.coerce
    .number()
    .int("Poin harus berupa bilangan bulat")
    .min(0, "Poin pelanggaran tidak boleh negatif"),
  status: z.enum(["aktif", "nonaktif"]).optional().default("aktif"),
});

export const updateKategoriPelanggaranSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(1, "Nama kategori pelanggaran tidak boleh kosong")
    .max(100, "Nama kategori maksimal 100 karakter")
    .optional(),
  deskripsi: z.string().optional().nullable(),
  poin: z.coerce
    .number()
    .int("Poin harus berupa bilangan bulat")
    .min(0, "Poin pelanggaran tidak boleh negatif")
    .optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
});

export const createPelanggaranSiswaSchema = z.object({
  siswaId: z
    .string()
    .min(1, "siswaId wajib diisi"),
  kategoriPelanggaranId: z
    .string()
    .min(1, "kategoriPelanggaranId wajib diisi"),
  tanggal: z
    .string()
    .regex(TANGGAL_REGEX, "Format tanggal harus YYYY-MM-DD"),
  kronologi: z.string().optional().nullable(),
  poin: z.coerce
    .number()
    .int("Poin harus berupa bilangan bulat")
    .min(0, "Poin pelanggaran tidak boleh negatif")
    .optional(),
  status: z.string().optional(),
  tindakLanjut: z.string().optional().nullable(),
  catatan: z.string().optional().nullable(),
});

export const updatePelanggaranSiswaSchema = z.object({
  kategoriPelanggaranId: z.string().optional(),
  tanggal: z
    .string()
    .regex(TANGGAL_REGEX, "Format tanggal harus YYYY-MM-DD")
    .optional(),
  kronologi: z.string().optional().nullable(),
  poin: z.coerce
    .number()
    .int("Poin harus berupa bilangan bulat")
    .min(0, "Poin pelanggaran tidak boleh negatif")
    .optional(),
  status: z.string().optional(),
  tindakLanjut: z.string().optional().nullable(),
  catatan: z.string().optional().nullable(),
});
