import { z } from "zod";

export const siswaSchema = z.object({
  namaLengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  nisn: z.string().min(5, "NISN tidak valid"),
  nis: z.string().optional(),
  kelasId: z.string().uuid("ID Kelas tidak valid"),

  // Penambahan field baru sesuai notulen
  nik: z.string().optional(),
  namaAyah: z.string().optional(),
  pekerjaanAyah: z.string().optional(),
  namaIbu: z.string().optional(),
  pekerjaanIbu: z.string().optional(),
  alamatKtp: z.string().optional(),
  alamatDomisili: z.string().optional(),
  kecamatan: z.string().optional(),
  kelurahan: z.string().optional(),
  kota: z.string().optional(),
});
