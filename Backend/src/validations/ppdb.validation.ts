import { z } from "zod";
import {
  KATEGORI_JALUR,
  BERKAS_PPDB,
  METODE_RANKING,
} from "../utils/spmb.constants";

export const pendaftaranPpdbSchema = z.object({
  sekolahId: z.string().uuid(),
  jalurPpdbId: z.string().uuid(),
  jurusanId: z.string().uuid().optional(),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit"),
  gelombangPpdbId: z.string().uuid().optional(),

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
    .max(100),

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

  lintang: z.coerce
    .number()
    .min(-90)
    .max(90)
    .optional(),

  bujur: z.coerce
    .number()
    .min(-180)
    .max(180)
    .optional(),
});

export const loginPendaftarSchema = z.object({
  nomorPendaftaran: z.string().min(5).max(20),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit"),
});

export const pengaturanSpmbSchema = z.object({
  pendaftaranDibuka: z.boolean().optional(),
  wajibLokasi: z.boolean().optional(),
  batasiPendaftarSesuaiKuota: z.boolean().optional(),
  rankingTerbuka: z.boolean().optional(),
  kirimEmailKonfirmasi: z.boolean().optional(),
  lintangSekolah: z.coerce.number().min(-90).max(90).optional(),
  bujurSekolah: z.coerce.number().min(-180).max(180).optional(),
});

export const jalurSpmbSchema = z.object({
  nama: z.string().min(2).max(50),
  kategori: z.enum(KATEGORI_JALUR),
  deskripsi: z.string().max(2000).optional(),
  kuota: z.coerce.number().int().min(1),
  tanggalMulai: z.coerce.date().optional(),
  tanggalSelesai: z.coerce.date().optional(),
  jarakMaksimalKm: z.coerce.number().min(0).max(1000).nullable().optional(),
  metodeRanking: z.enum(METODE_RANKING).optional(),
  nilaiMinimal: z.coerce.number().min(0).max(100).nullable().optional(),
  berkasWajib: z.array(z.enum(BERKAS_PPDB)).min(1).optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
});

export const jalurSpmbUbahSchema = jalurSpmbSchema.partial();