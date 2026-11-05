import { z } from "zod";

// Zod v4: z.enum memerlukan tuple literal, bukan as const array.
const kanalEnum = z.enum(["email", "whatsapp", "sms", "push", "in_app"]);
type KanalValue = z.infer<typeof kanalEnum>;
const KANAL_VALID: readonly KanalValue[] = ["email", "whatsapp", "sms", "push", "in_app"];

export const createTemplateNotifikasiSchema = z
  .object({
    eventTarget: z
      .string()
      .trim()
      .min(1, "Event target wajib diisi")
      .max(100)
      .regex(
        /^[a-z0-9_.]+$/i,
        "Event target hanya boleh mengandung huruf, angka, titik, dan garis bawah",
      ),
    kanal: kanalEnum,
    subjek: z.string().trim().max(255).nullable().optional(),
    isiTemplate: z
      .string()
      .trim()
      .min(1, "Isi template wajib diisi")
      .max(100000),
    variabel: z.record(z.string(), z.string().max(500)).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateTemplateNotifikasiSchema = createTemplateNotifikasiSchema
  .omit({ eventTarget: true, kanal: true })
  .partial()
  .strict().refine(value => Object.keys(value).length > 0, {message: "Sertakan perubahan template"});

export const listTemplateNotifikasiQuerySchema = z.object({
  kanal: kanalEnum.optional(),
  eventTarget: z.string().trim().max(100).optional(),
  isActive: z.enum(["true", "false"]).optional().transform(v => v === undefined ? undefined : v === "true"),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTemplateNotifikasiPayload = z.infer<
  typeof createTemplateNotifikasiSchema
>;
export type UpdateTemplateNotifikasiPayload = z.infer<
  typeof updateTemplateNotifikasiSchema
>;
