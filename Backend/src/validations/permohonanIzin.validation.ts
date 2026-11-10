import { z } from "zod";

export const ajukanIzinSchema = z.object({
  jenis: z.enum(["sakit", "izin"] as const, {
    message: "Jenis izin wajib diisi dengan 'sakit' atau 'izin'",
  }),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  alasan: z.string().min(5, "Alasan minimal 5 karakter"),
  guruPenggantiId: z
    .string()
    .uuid("ID guru pengganti tidak valid")
    .optional()
    .nullable(),
});

export const verifikasiIzinSchema = z.object({
  status: z.enum(["disetujui", "ditolak"]),
  catatan: z.string().optional().nullable(),
});