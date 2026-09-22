import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import {
  registerSchema,
  verifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";
import { generateOtp } from "../utils/generateOtp";
import { sendOtpEmail } from "../utils/email";
import { AppError } from "../utils/appError";
import { generateAccessToken } from "../utils/generateToken";
import { ambilIzinDanModul } from "../services/auth.services";

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const existingUser = await prisma.pengguna.findFirst({
    where: {
      OR: [{ email: data.email }, { namaPengguna: data.namaPengguna }],
    },
  });

  if (existingUser) {
    if (existingUser.status === "aktif") {
      throw new AppError("Email atau username sudah terdaftar dan aktif", 400);
    }
  }

  const hashedPassword = await bcrypt.hash(data.kataSandi, 10);
  const otpCode = generateOtp();
  const otpTimeout = new Date(Date.now() + 5 * 60 * 1000);

  if (existingUser && existingUser.status === "menunggu_verifikasi") {
    await prisma.pengguna.update({
      where: { id: existingUser.id },
      data: {
        namaLengkap: data.namaLengkap,
        kataSandi: hashedPassword,
        kodeOtp: otpCode,
        otpTimeout,
      },
    });
  } else {
    await prisma.pengguna.create({
      data: {
        email: data.email,
        namaPengguna: data.namaPengguna,
        namaLengkap: data.namaLengkap,
        kataSandi: hashedPassword,
        status: "menunggu_verifikasi",
        kodeOtp: otpCode,
        otpTimeout,
      },
    });
  }

  try {
    await sendOtpEmail({
      email: data.email,
      namaLengkap: data.namaLengkap,
      kodeOtp: otpCode,
    });
  } catch (error: any) {
    console.error("[REGISTER] Pengiriman OTP gagal", {
      message: error?.message,
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
      response: error?.response,
      stack: error?.stack,
    });

    throw new AppError(
      "Registrasi berhasil, tetapi email OTP gagal dikirim.",
      502,
    );
  }

  return res.status(200).json({
    success: true,
    message: "Registrasi berhasil. Silakan cek email Anda untuk kode OTP verifikasi.",
  });
};

export const verifyRegister = async (req: Request, res: Response) => {
  const data = verifySchema.parse(req.body);

  const user = await prisma.pengguna.findUnique({
    where: { email: data.email },
  });

  if (!user || user.status !== "menunggu_verifikasi") {


    throw new AppError(
      "Pengguna tidak ditemukan atau sudah terverifikasi",
      400,
    );
  }

  if (user.kodeOtp !== data.kodeOtp) {
    throw new AppError("Kode OTP salah", 400);
  }

  if (!user.otpTimeout || user.otpTimeout < new Date()) {
    throw new AppError("Kode OTP sudah kedaluwarsa", 400);
  }

  await prisma.pengguna.update({
    where: { id: user.id },
    data: {
      status: "aktif",
      kodeOtp: null,
      otpTimeout: null,
    },
  });

  const userWithRole = await prisma.pengguna.findUnique({
    where: { id: user.id },
    include: {
      peran: true,
      sekolah: true,
      yayasan: true,
    },
  });

  if (!userWithRole) {
    throw new AppError("Data pengguna tidak ditemukan", 404);
  }

  const { izin, modulAktif } = await ambilIzinDanModul(
    user.peranId ?? null,
    user.sekolahId ?? null,
  );

  const token = generateAccessToken({
    userId: userWithRole.id,
    email: userWithRole.email,
    roleId: userWithRole.peranId ?? undefined,
    role: userWithRole.peran?.nama ?? undefined,
    sekolahId: userWithRole.sekolahId ?? undefined,
    yayasanId: userWithRole.yayasanId ?? undefined,
    izin,
    modulAktif,
  });

  return res.status(200).json({
    success: true,
    message: "Verifikasi berhasil. Anda sekarang telah login.",
    token,
  });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.pengguna.findFirst({
    where: {
      OR: [{ email: data.identifier }, { namaPengguna: data.identifier }],
    },
    include: {
      peran: true,
      sekolah: true,
      yayasan: true,
    },
  });

  if (!user) {
    throw new AppError("Kredensial tidak valid", 401);
  }

  if (user.status !== "aktif") {
    throw new AppError("Akun belum diverifikasi atau tidak aktif", 401);
  }

  const isMatch = await bcrypt.compare(data.kataSandi, user.kataSandi);

  if (!isMatch) {
    throw new AppError("Kredensial tidak valid", 401);
  }

  await prisma.pengguna.update({
    where: { id: user.id },
    data: { terakhirLogin: new Date() },
  });

  const { izin, modulAktif } = await ambilIzinDanModul(
    user.peranId ?? null,
    user.sekolahId ?? null,
  );

  const token = generateAccessToken({
    userId: user.id,
    email: user.email,
    roleId: user.peranId ?? undefined,
    role: user.peran?.nama ?? undefined,
    sekolahId: user.sekolahId ?? undefined,
    yayasanId: user.yayasanId ?? undefined,
    izin,
    modulAktif,
  });

  return res.status(200).json({
    success: true,
    message: "Login berhasil",
    token,
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const data = forgotPasswordSchema.parse(req.body);

  const user = await prisma.pengguna.findUnique({
    where: { email: data.email },
  });

  if (!user || user.status !== "aktif") {
    return res.status(200).json({
      success: true,
      message: "Jika email terdaftar, kode OTP reset password telah dikirim",
    });
  }

  const otpCode = generateOtp();
  const otpTimeout = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.pengguna.update({
    where: { id: user.id },
    data: { kodeOtp: otpCode, otpTimeout },
  });

  try {
    await sendOtpEmail({
      email: user.email,
      namaLengkap: user.namaLengkap,
      kodeOtp: otpCode,
    });
  } catch (err) {
    throw new AppError(
      "Gagal mengirim email OTP reset password. Silakan coba lagi.",
      502,
    );
  }

  return res.status(200).json({
    success: true,
    message: "Silakan cek email Anda untuk kode OTP reset password.",
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const data = resetPasswordSchema.parse(req.body);

  const user = await prisma.pengguna.findUnique({
    where: { email: data.email },
  });

  if (!user || user.status !== "aktif") {
    throw new AppError("Pengguna tidak ditemukan atau tidak aktif", 401);
  }

  if (user.kodeOtp !== data.kodeOtp) {
    throw new AppError("Kode OTP salah", 400);
  }

  if (!user.otpTimeout || user.otpTimeout < new Date()) {
    throw new AppError("Kode OTP sudah kedaluwarsa", 400);
  }

  const hashedPassword = await bcrypt.hash(data.kataSandi, 10);

  await prisma.pengguna.update({
    where: { id: user.id },
    data: {
      kataSandi: hashedPassword,
      kodeOtp: null,
      otpTimeout: null,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Reset password berhasil",
  });
};
