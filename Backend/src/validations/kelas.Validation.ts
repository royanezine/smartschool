import { z } from "zod";

export const createKelasSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama kelas wajib diisi")
    .max(50, "Nama kelas maksimal 50 karakter"),

  tingkat: z
    .number({
      message: "Tingkat harus berupa angka",
    })
    .int("Tingkat harus berupa angka bulat"),

  tahunAjaranId: z.string().uuid("ID tahun ajaran tidak valid"),

  waliKelasId: z
    .string()
    .uuid("ID wali kelas tidak valid")
    .optional()
    .nullable(),

  kapasitas: z
    .number()
    .int("Kapasitas harus berupa angka bulat")
    .min(1, "Kapasitas minimal 1 siswa")
    .optional()
    .default(30),

  fotoKelasUrl: z
    .string()
    .url("Format URL foto tidak valid")
    .optional()
    .nullable(),

  lantaiId: z.string().uuid("ID lantai tidak valid").optional().nullable(),
});

export const updateKelasSchema = createKelasSchema.partial();
