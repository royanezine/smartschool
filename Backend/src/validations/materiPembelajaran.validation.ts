import { z } from "zod";

export const createMateriPembelajaranSchema = z.object({
    kelasMapelId: z
        .string()
        .uuid("kelasMapelId harus berupa UUID"),

    judul: z
    .string()
    .min(1, "Judul wajib di isi")
    .max(100, "Judul maksimal 100 karakter"),

    deskripsi: z
    .string()
    .optional()
    .nullable(),

    kategori: z
    .string()
    .max(50, "Kategori maksimal 50 karakter")
    .optional()
    .nullable(),

    urlLink: z
    .string()
    .url("URL link tidak valid")
    .optional()
    .nullable(),
});

export const updateMateriPembelajaranSchema = createMateriPembelajaranSchema.partial();