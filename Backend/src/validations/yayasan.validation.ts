import { z } from "zod";

const opsional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    schema.optional(),
  );

export const buatSekolahCabangSchema = z.object({
  nama: z.string().trim().min(1, "Nama sekolah wajib diisi").max(100),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Subdomain minimal 3 karakter")
    .max(40, "Subdomain maksimal 40 karakter")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Subdomain hanya boleh huruf kecil, angka, dan tanda hubung",
    ),
  kode: z.string().trim().toUpperCase().min(1, "Kode wajib diisi").max(20),
  npsn: z.string().trim().regex(/^\d{8}$/, "NPSN harus 8 digit angka"),
  jenjang: z.string().trim().min(1, "Jenjang wajib diisi").max(20),
  alamat: opsional(z.string().trim()),
  telepon: opsional(z.string().trim().max(20)),
  email: opsional(z.string().trim().email("Format email tidak valid").max(100)),
  paketId: z.string().uuid("paketId tidak valid"),
});

export const listSekolahCabangQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});