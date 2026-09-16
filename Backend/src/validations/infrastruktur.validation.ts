import { z } from "zod";

// Schema Gedung
export const createGedungSchema = z.object({
  nama: z.string().min(1, "Nama gedung wajib diisi").max(100),
  kode: z.string().max(50).optional().nullable(),
  fotoUrl: z.string().url("Format URL foto tidak valid").optional().nullable(),
});

export const updateGedungSchema = createGedungSchema.partial();

// Schema Lantai
export const createLantaiSchema = z.object({
  gedungId: z.string().uuid("ID gedung tidak valid"),
  nama: z.string().min(1, "Nama lantai wajib diisi").max(50),
});

export const updateLantaiSchema = createLantaiSchema.partial();
