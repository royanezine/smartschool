import { z } from "zod";

export const createKelasMapelSchema = z.object({
  kelasId: z
    .string()
    .uuid("ID kelas tidak valid"),

  mataPelajaranId: z
    .string()
    .uuid("ID mata pelajaran tidak valid"),

  guruPengajarId: z
    .string()
    .uuid("ID guru pengajar tidak valid"),

  status: z
    .string()
    .max(20, "Status maksimal 20 karakter")
    .optional(),
});

export const updateKelasMapelSchema = z.object({
  kelasId: z
    .string()
    .uuid("ID kelas tidak valid")
    .optional(),

  mataPelajaranId: z
    .string()
    .uuid("ID mata pelajaran tidak valid")
    .optional(),

  guruPengajarId: z
    .string()
    .uuid("ID guru pengajar tidak valid")
    .optional(),

  status: z
    .string()
    .max(20, "Status maksimal 20 karakter")
    .optional(),
});

  export const createBulkKelasMapelSchema = z.object({
  kelasIds: z.array(z.string().uuid("ID kelas tidak valid")).min(1, "Pilih minimal 1 kelas"),
  mataPelajaranId: z.string().uuid("ID mata pelajaran tidak valid"),
  guruPengajarId: z.string().uuid("ID guru pengajar tidak valid"),
});