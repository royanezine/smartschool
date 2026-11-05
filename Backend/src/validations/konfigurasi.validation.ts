import { z } from "zod";

const KATEGORI_VALID = ["INTEGRASI", "KEAMANAN", "NOTIFIKASI"] as const;

/** Payload untuk membuat atau memperbarui satu item konfigurasi. */
export const upsertKonfigurasiSchema = z
  .object({
    kategori: z.enum(KATEGORI_VALID).optional(),
    kunci: z
      .string()
      .trim()
      .min(1, "Kunci wajib diisi")
      .max(100, "Kunci maksimal 100 karakter")
      .regex(
        /^[a-z0-9_.]+$/i,
        "Kunci hanya boleh mengandung huruf, angka, titik, dan garis bawah",
      ),
    nilaiText: z.string().max(100000).nullable().optional(),
    nilaiBoolean: z.boolean().nullable().optional(),
    nilaiAngka: z.number().finite().min(-99999999999999).max(99999999999999).nullable().optional(),
    isRahasia: z.boolean().optional(),
    keterangan: z.string().max(5000).nullable().optional(),
  })
  .strict()
  .refine(d => Object.keys(d).some(key => key !== "kunci"), {message: "Sertakan perubahan konfigurasi"})
  .refine(d => [d.nilaiText, d.nilaiBoolean, d.nilaiAngka].filter(v => v !== undefined && v !== null).length <= 1,
    {message: "Gunakan satu tipe nilai konfigurasi"});

/** Filter query untuk GET list konfigurasi. */
export const listKonfigurasiQuerySchema = z.object({
  kategori: z.enum(KATEGORI_VALID).optional(),
  search: z.string().trim().max(100).optional(),
});

export type UpsertKonfigurasiPayload = z.infer<typeof upsertKonfigurasiSchema>;

