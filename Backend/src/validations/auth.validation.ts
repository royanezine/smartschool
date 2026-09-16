import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  namaPengguna: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh huruf, angka, dan underscore",
    ),
  namaLengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  kataSandi: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .regex(/[A-Z]/, "Kata sandi harus mengandung minimal 1 huruf kapital")
    .regex(/[0-9]/, "Kata sandi harus mengandung minimal 1 angka"),
});

export const verifySchema = z.object({
  email: z.string().email("Format email tidak valid"),
  kodeOtp: z.string().length(6, "Kode OTP harus terdiri dari 6 digit"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email atau username harus diisi"),
  kataSandi: z.string().min(1, "Kata sandi harus diisi"),
});

export const verifyLoginSchema = z.object({
  identifier: z.string().min(1, "Email atau username harus diisi"),
  kodeOtp: z.string().length(6, "Kode OTP harus terdiri dari 6 digit"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  kodeOtp: z.string().length(6, "Kode OTP harus terdiri dari 6 digit"),
  kataSandi: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .regex(/[A-Z]/, "Kata sandi harus mengandung minimal 1 huruf kapital")
    .regex(/[0-9]/, "Kata sandi harus mengandung minimal 1 angka"),
})