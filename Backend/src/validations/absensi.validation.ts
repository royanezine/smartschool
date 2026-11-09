import { z } from "zod";
import { paginationQuery } from "../utils/pagination";

const coordinate = (min: number, max: number) => z.preprocess(
  value => value === null || (typeof value === "string" && !value.trim()) ? undefined : value,
  z.union([z.number(), z.string().trim().min(1).pipe(z.coerce.number())]).pipe(z.number().min(min).max(max)).optional(),
);

export const createAbsensiSchema = z.object({
  kelasId: z.string().uuid("ID Kelas tidak valid"),
  mataPelajaranId: z.string().uuid("ID Mata Pelajaran tidak valid").optional(),
  status: z.enum(["hadir", "izin", "sakit", "alpha"]),
  keterangan: z.string().optional(),

  // Metode bisa salah satu dari array di pengaturan sekolah
  metode: z.enum(["lokasi", "barcode", "face", "manual"]).default("lokasi"),

  // Jika GPS
  lintang: z.coerce.number().optional(), // gunakan coerce agar string dari FormData otomatis jadi number
  bujur: z.coerce.number().optional(),

  // Jika Barcode
  barcodeData: z.string().optional(),
});

export const checkInShiftSchema = z.object({
  shiftKerjaId: z.string().uuid("ID shift kerja tidak valid").optional(),
  status: z.enum(["hadir", "izin", "sakit"]).default("hadir"),
  keterangan: z.string().optional(),
  metode: z.enum(["lokasi", "barcode", "face", "manual"]).default("lokasi"),
  lintang: coordinate(-90, 90),
  bujur: coordinate(-180, 180),
  barcodeData: z.string().optional(),
});

export const checkOutShiftSchema = z.object({
  keterangan: z.string().optional(),
  metode: z.enum(["lokasi", "barcode", "face", "manual"]).default("lokasi"),
  lintang: coordinate(-90, 90),
  bujur: coordinate(-180, 180),
});

export const absensiListQuerySchema = z.object({
  ...paginationQuery,
  sekolahId: z.string().uuid().optional(),
  kelasId: z.string().uuid().optional(),
  mataPelajaranId: z.string().uuid().optional(),
  penggunaId: z.string().uuid().optional(),
  shiftKerjaId: z.string().uuid().optional(),
  tanggal: z.string().optional(),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  search: z.string().trim().max(200).optional(),
  role: z.enum(["siswa", "guru", "staff", "staf", "pegawai", "karyawan", "admin_sekolah"]).optional(),
  status: z.enum(["hadir", "izin", "sakit", "alpha", "terlambat"]).optional(),
});

export const updateAbsensiSchema = z.object({
  status: z.enum(["hadir", "izin", "sakit", "alpha", "terlambat"]).optional(),
  keterangan: z.string().trim().max(2000).nullable().optional(),
}).strict().refine(value => value.status !== undefined || value.keterangan !== undefined, {
  message: "Isi status atau keterangan yang ingin diperbarui",
});
