import { z } from "zod";

export const createLaporanKerusakanSchema = z.object({
  asetId: z.string().uuid("ID Aset tidak valid"),
  deskripsi: z.string().min(1, "Deskripsi kerusakan wajib diisi"),
  tanggalLaporan: z.string().optional(),
  status: z.string().default("menunggu"),
  catatanPerbaikan: z.string().optional().nullable(),
});

export const updateLaporanKerusakanSchema = z.object({
  status: z.string().optional(),
  catatanPerbaikan: z.string().optional().nullable(),
  deskripsi: z.string().optional(),
  asetId: z.string().uuid().optional(),
});

