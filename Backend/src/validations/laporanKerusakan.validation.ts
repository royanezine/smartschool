import { z } from "zod";

const dasarLaporan = z.object({
  tanggalLaporan: z.coerce.date({ message: "Tanggal laporan tidak valid" }).optional(),
  deskripsi: z.string().trim().min(1, "Deskripsi wajib diisi"),
  status: z.string().trim().min(1).max(20).optional(),
  catatanPerbaikan: z.string().trim().nullish(),
});

export const createLaporanKerusakanSchema = dasarLaporan.extend({
  asetId: z.string().uuid("ID aset tidak valid"),
});

export const updateLaporanKerusakanSchema = dasarLaporan.partial();