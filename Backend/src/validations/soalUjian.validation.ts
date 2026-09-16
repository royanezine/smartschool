import { z } from "zod";

export const createSoalSchema = z.object({
  ujianId: z.string().uuid(),
  teksSoal: z.string().min(1),
  jenisSoal: z.enum(["pilihan_ganda", "esai"]),
  pilihan: z.array(z.string()).optional(),
  jawabanBenar: z.string().optional(),
  poin: z.number().positive(),
  nomorUrut: z.number().int().positive(),
});

export const updateSoalSchema = z.object({
  teksSoal: z.string().min(1).optional(),
  jenisSoal: z.enum(["pilihan_ganda", "esai"]).optional(),
  pilihan: z.array(z.string()).optional(),
  jawabanBenar: z.string().optional(),
  poin: z.number().positive().optional(),
  nomorUrut: z.number().int().positive().optional(),
});