import { z } from "zod";

export const createFasilitasSchema = z.object({
  nama: z.string().min(1, "Nama fasilitas wajib diisi"),
  lokasi: z.string().min(1, "Lokasi fasilitas wajib diisi"),
  kategori: z.string().min(1, "Kategori fasilitas wajib diisi"),
  kondisi: z.string().default("Baik"),
  kapasitas: z.string().optional().nullable(),
  deskripsi: z.string().optional().nullable(),
  foto: z.string().optional().nullable(),
});

export const updateFasilitasSchema = createFasilitasSchema.partial();

