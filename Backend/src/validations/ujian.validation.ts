import { z } from "zod";

export const createUjianSchema = z.object({
  kelasMapelId: z.string().uuid("ID Kelas Mapel tidak valid"),
  judul: z.string().min(3, "Judul ujian minimal 3 karakter").max(100),
  deskripsi: z.string().optional().nullable(),
  jenis: z.enum(["UTS", "UAS", "Kuis", "Harian", "Lainnya"], {
    error: "Jenis ujian tidak valid",
  }),
  durasi: z.number().int().min(5, "Durasi minimal 5 menit"),
  waktuMulai: z
    .string()
    .datetime({ message: "Format waktu mulai harus ISO DateTime" })
    .optional()
    .nullable(),
  waktuSelesai: z
    .string()
    .datetime({ message: "Format waktu selesai harus ISO DateTime" })
    .optional()
    .nullable(),
  nilaiKelulusan: z.number().min(0).max(100).optional().nullable(),
  modeUjian: z.string().optional().default("standard"),
  dipublikasikan: z.boolean().optional().default(false),
  penilaianOtomatis: z.boolean().optional().default(true),
});

export const updateUjianSchema = createUjianSchema.partial();

export const mulaiUjianSchema = z.object({
  token: z.string().min(4, "Token ujian wajib diisi"),
});

export const submitUjianSchema = z.object({
  jawaban: z.array(
    z.object({
      soalId: z.string().uuid("ID Soal tidak valid"),
      jawaban: z.string().nullable(),
    }),
  ),
});
