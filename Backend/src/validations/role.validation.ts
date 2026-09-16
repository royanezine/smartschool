import { z } from "zod";

export const createRoleSchema = z.object({
  nama: z
    .string()
    .min(3, "Nama role minimal 3 karakter")
    .max(50, "Maksimal 50 karakter")
    .regex(
      /^[a-z_]+$/,
      "Hanya huruf kecil dan underscore (contoh: kepala_sekolah)",
    ),
  namaTampilan: z.string().min(3, "Minimal 3 karakter").max(100),
  deskripsi: z.string().max(500).optional(),
  izinIds: z.array(z.string()).min(1, "Pilih minimal 1 izin"),
});

export const updateRoleSchema = z.object({
  nama: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z_]+$/)
    .optional(),
  namaTampilan: z.string().min(3).max(100).optional(),
  deskripsi: z.string().max(500).optional(),
  izinIds: z.array(z.string()).min(1).optional(),
});
