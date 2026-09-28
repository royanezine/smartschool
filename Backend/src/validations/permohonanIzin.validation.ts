import { z } from "zod";

export const ajukanIzinSchema = z.object({
  // Tambahkan 'as const' agar TypeScript yakin ini adalah tuple statis
  jenis: z.enum(["sakit", "izin"] as const, {
    message: "Jenis izin wajib diisi dengan 'sakit' atau 'izin'",
  }),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  alasan: z.string().min(5, "Alasan minimal 5 karakter"),
});
