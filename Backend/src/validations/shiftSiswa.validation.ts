import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const kodeShiftSiswaSchema = z.enum(["pagi", "siang"]);

export const updateShiftSiswaSchema = z
  .object({
    jamMasuk: z
      .string()
      .regex(timeRegex, "Format jam masuk harus HH:mm (contoh: 07:00)")
      .optional(),
    jamKeluar: z
      .string()
      .regex(timeRegex, "Format jam keluar harus HH:mm (contoh: 14:00)")
      .optional(),
    toleransiTerlambatMenit: z.coerce.number().int().min(0).max(240).optional(),
  })
  .refine(
    (data) =>
      data.jamMasuk !== undefined ||
      data.jamKeluar !== undefined ||
      data.toleransiTerlambatMenit !== undefined,
    { message: "Minimal satu field harus diisi" },
  );