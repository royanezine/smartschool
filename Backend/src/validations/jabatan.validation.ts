import { z } from "zod";

/**
 * Skema validasi untuk item izin menu pada Jabatan
 */
export const itemAksesMenuSchema = z.object({
  menu: z.string().min(1, "Nama menu wajib diisi"),
  permissions: z.array(z.string()).default([]),
});

/**
 * Skema validasi untuk pembuatan Jabatan baru
 */
export const createJabatanSchema = z.object({
  namaJabatan: z
    .string()
    .trim()
    .min(1, "Nama jabatan wajib diisi")
    .max(100, "Nama jabatan maksimal 100 karakter"),
  deskripsi: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .nullable(),
  aksesMenu: z.array(itemAksesMenuSchema).default([]),
});

/**
 * Skema validasi untuk pembaruan Jabatan (partial)
 */
export const updateJabatanSchema = z.object({
  namaJabatan: z
    .string()
    .trim()
    .min(1, "Nama jabatan minimal 1 karakter")
    .max(100, "Nama jabatan maksimal 100 karakter")
    .optional(),
  deskripsi: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .nullable(),
  aksesMenu: z.array(itemAksesMenuSchema).optional(),
});

export type CreateJabatanInput = z.infer<typeof createJabatanSchema>;
export type UpdateJabatanInput = z.infer<typeof updateJabatanSchema>;
export type ItemAksesMenuInput = z.infer<typeof itemAksesMenuSchema>;
