import { z } from "zod";

export const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK", "SLB", "Lainnya"] as const;

export const bankEnum = z.enum(["bca", "bni", "bri", "mandiri", "permata"]);

export const jenisPendaftaranEnum = z.enum(["sekolah", "yayasan"]);

const baseOnboardingSchema = z.object({
  jenisPendaftaran: jenisPendaftaranEnum.default("sekolah"),
  nama: z.string().min(3, "Nama admin minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  kataSandi: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .regex(/[A-Z]/, "Kata sandi harus mengandung minimal 1 huruf kapital")
    .regex(/[0-9]/, "Kata sandi harus mengandung minimal 1 angka"),
  paketId: z.string().uuid("ID Paket tidak valid"),
  bank: bankEnum.optional(),

  // Sekolah fields (opsional di root agar tidak error pada pendaftaran yayasan)
  namaSekolah: z.string().min(3, "Nama sekolah minimal 3 karakter").optional(),
  jenjang: z.enum(JENJANG_OPTIONS).optional(),
  subdomain: z
    .string()
    .min(3, "Subdomain minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Subdomain hanya boleh huruf kecil, angka, dan strip")
    .optional(),
  alamatSekolah: z.string().min(5, "Alamat sekolah minimal 5 karakter").optional(),
  teleponSekolah: z.string().min(8, "Nomor telepon tidak valid").optional(),
  logo: z.string().url("Format URL logo tidak valid").optional(),
  yayasanId: z.string().uuid("ID Yayasan tidak valid").optional(),

  // Yayasan fields
  namaYayasan: z.string().min(3, "Nama yayasan minimal 3 karakter").optional(),
  emailYayasan: z.string().email("Format email yayasan tidak valid").optional(),
  teleponYayasan: z.string().min(8, "Nomor telepon yayasan minimal 8 digit").optional(),
  alamatYayasan: z.string().min(5, "Alamat yayasan minimal 5 karakter").optional(),
  npypYayasan: z.string().min(3, "NPYP yayasan minimal 3 karakter").optional(),
});

export const tenantOnboardingSchema = baseOnboardingSchema.superRefine((data, ctx) => {
  const jenis = data.jenisPendaftaran || "sekolah";

  if (jenis === "sekolah") {
    if (!data.namaSekolah || data.namaSekolah.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama sekolah minimal 3 karakter",
        path: ["namaSekolah"],
      });
    }

    if (!data.jenjang) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jenjang sekolah wajib dipilih",
        path: ["jenjang"],
      });
    }

    if (!data.subdomain || data.subdomain.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Subdomain minimal 3 karakter",
        path: ["subdomain"],
      });
    } else if (!/^[a-z0-9-]+$/.test(data.subdomain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Subdomain hanya boleh huruf kecil, angka, dan strip",
        path: ["subdomain"],
      });
    }

    if (!data.alamatSekolah || data.alamatSekolah.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Alamat sekolah minimal 5 karakter",
        path: ["alamatSekolah"],
      });
    }

    if (!data.teleponSekolah || data.teleponSekolah.trim().length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nomor telepon tidak valid",
        path: ["teleponSekolah"],
      });
    }
  } else if (jenis === "yayasan") {
    if (!data.namaYayasan || data.namaYayasan.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama yayasan minimal 3 karakter",
        path: ["namaYayasan"],
      });
    }

    if (!data.emailYayasan || !z.string().email().safeParse(data.emailYayasan).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format email yayasan tidak valid",
        path: ["emailYayasan"],
      });
    }

    if (!data.teleponYayasan || data.teleponYayasan.trim().length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nomor telepon yayasan minimal 8 digit",
        path: ["teleponYayasan"],
      });
    }

    if (!data.alamatYayasan || data.alamatYayasan.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Alamat yayasan minimal 5 karakter",
        path: ["alamatYayasan"],
      });
    }

    if (!data.npypYayasan || data.npypYayasan.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NPYP yayasan minimal 3 karakter",
        path: ["npypYayasan"],
      });
    }
  }
});

export const tenantPaymentSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  kodeOtp: z.string().min(1, "Kode OTP wajib diisi"),
  bank: bankEnum.optional(),
});

export const verifyTenantSchema = tenantPaymentSchema;


