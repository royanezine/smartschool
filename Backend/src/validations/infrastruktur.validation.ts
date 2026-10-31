import { z } from "zod";

export const createGedungSchema = z.object({
  nama: z.string().trim().min(1).max(100),
  kode: z.string().trim().max(20).nullable().optional(),
  fotoGedung: z.string().trim().max(255).nullable().optional(),
  status: z.string().optional(),
});

export const updateGedungSchema = createGedungSchema.partial();

// Schema Lantai
export const createLantaiSchema = z.object({
  gedungId: z.string().uuid("ID gedung tidak valid"),
  nama: z.string().min(1, "Nama lantai wajib diisi").max(50),
});

export const updateLantaiSchema = createLantaiSchema.partial();
