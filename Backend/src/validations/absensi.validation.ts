import { z } from "zod";

export const createAbsensiSchema = z.object({
  kelasId: z.string().uuid("ID Kelas tidak valid"),
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
