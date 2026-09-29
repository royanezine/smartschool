import { z } from "zod";

const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const warnaSchema = z
  .string()
  .regex(hexRegex, "Warna harus berformat Hex, contoh: #2563EB");

const groupSchema = z.record(
  z.string().regex(/^[a-z0-9_]{1,40}$/, "Nama kunci warna tidak valid"),
  warnaSchema,
);

export const temaWarnaSchema = z
  .object({
    tema: groupSchema.optional(),
    badgeStatus: groupSchema.optional(),
    labelRole: groupSchema.optional(),
    shiftKerja: groupSchema.optional(),
  })
  .strict()
  .refine((v) => Object.values(v).some((g) => g && Object.keys(g).length > 0), {
    message: "Minimal satu warna harus dikirim",
  });