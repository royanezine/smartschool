import { z } from "zod";

const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK", "SLB", "Lainnya"] as const;

export const tenantOnboardingSchema = z.object({
  nama: z.string().min(3, "Nama admin minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  namaSekolah: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  jenjang: z.enum(["SD", "SMP", "SMA", "SMK", "SLB", "Lainnya"]),
  subdomain: z
    .string()
    .min(3, "Subdomain minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Subdomain hanya boleh huruf kecil, angka, dan strip"),
  alamatSekolah: z.string().min(5, "Alamat sekolah minimal 5 karakter"),
  teleponSekolah: z.string().min(8, "Nomor telepon tidak valid"),
  kataSandi: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .regex(/[A-Z]/, "Kata sandi harus mengandung minimal 1 huruf kapital")
    .regex(/[0-9]/, "Kata sandi harus mengandung minimal 1 angka"),
  logo: z.string().url("Format URL logo tidak valid").optional(),
  paketId: z.string().uuid("ID Paket tidak valid"),
  yayasanId: z.string().uuid("ID Yayasan tidak valid").optional(),
});
