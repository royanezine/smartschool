import { z } from "zod";

const kapasitas = z
  .union([z.string().trim().max(50), z.number().transform((value) => String(value))])
  .nullish();

const dasarFasilitas = z.object({
  nama: z.string().trim().min(1, "Nama fasilitas wajib diisi").max(150),
  lokasi: z.string().trim().min(1, "Lokasi wajib diisi").max(150),
  kategori: z.string().trim().min(1, "Kategori wajib diisi").max(50),
  kondisi: z.string().trim().min(1).max(50),
  kapasitas,
  deskripsi: z.string().trim().nullish(),
  foto: z.string().trim().max(255).nullish(),
});

export const createFasilitasSchema = dasarFasilitas.extend({
  kondisi: z.string().trim().min(1).max(50).default("Baik"),
});

export const updateFasilitasSchema = dasarFasilitas.partial();