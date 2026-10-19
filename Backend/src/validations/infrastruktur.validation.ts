import { z } from "zod";

export const createGedungSchema = z.object({
  nama: z.string(),
  kode: z.string().optional(),
  fotoGedung: z.string().optional(), 
  status: z.string().optional(),
});

export const updateGedungSchema = createGedungSchema.partial();

// Schema Lantai
export const createLantaiSchema = z.object({
  gedungId: z.string().uuid("ID gedung tidak valid"),
  nama: z.string().min(1, "Nama lantai wajib diisi").max(50),
});

export const updateLantaiSchema = createLantaiSchema.partial();
