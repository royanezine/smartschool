import { z } from "zod";

export const kalkulasiPenggajianSchema = z.object({
  bulan: z.coerce.number().int().min(1, "Bulan harus antara 1-12").max(12, "Bulan harus antara 1-12"),
  tahun: z.coerce.number().int().min(2000, "Tahun minimal 2000").max(2100, "Tahun maksimal 2100"),
  penggunaId: z.string().uuid("ID Pengguna tidak valid").optional(),
  sekolahId: z.string().uuid("ID Sekolah tidak valid").optional(),
});

export const updateStatusPenggajianSchema = z.object({
  status: z.enum(["draft", "disetujui", "dibekukan", "dibayar"]),
  catatan: z.string().optional(),
});
