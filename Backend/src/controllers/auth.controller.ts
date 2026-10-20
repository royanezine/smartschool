import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import {
  registerSchema,
  verifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setupPinSchema,
  verifyPinSchema,
  forgotPinSchema,
  resetPinSchema,
} from "../validations/auth.validation";
import { generateOtp } from "../utils/generateOtp";
import { sendOtpEmail } from "../utils/email";
import { AppError } from "../utils/appError";
import {
  generateAccessToken,
  generatePinToken,
  verifyPinToken,
} from "../utils/generateToken";
import { ambilIzinDanModul } from "../services/auth.services";
import { isSuperAdmin, normalizeRole } from "../utils/rbac";
import { AuthRequest } from "../middlewares/auth.middleware";

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

interface AuthUserPayload {
  id: string;
  namaLengkap: string;
  email: string;
  namaPengguna: string;
  peran?: { nama?: string | null } | null;
}

export const formatAuthUser = (user: AuthUserPayload) => ({
  id: user.id,
  namaLengkap: user.namaLengkap,
  email: user.email,
  namaPengguna: user.namaPengguna,
  role: user.peran?.nama ?? null,
});

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

  if (
    userWithRole.peran?.nama?.trim().toLowerCase() === "siswa" &&
    !userWithRole.pinHash
  ) {
    return res.status(200).json({
      success: true,
      requiresPinSetup: true,
      setupToken: generatePinToken(userWithRole.id, "pin_setup"),
      message: "Verifikasi berhasil. Buat PIN keamanan terlebih dahulu.",
    });
  }

  const isSuperRegister = isSuperAdmin(userWithRole.peran?.nama);
  const { izin, modulAktif } = await ambilIzinDanModul(
    user.peranId ?? null,
    user.sekolahId ?? null,
    isSuperRegister,
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
    user: formatAuthUser(userWithRole),
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

  // 1. Verifikasi kata sandi terlebih dahulu (mencegah bypass kredensial)
  const isMatch = await bcrypt.compare(data.kataSandi, user.kataSandi);

  if (!isMatch) {
    throw new AppError("Kredensial tidak valid", 401);
  }

  const roleName = user.peran?.nama?.trim().toLowerCase();

  // 2. KHUSUS ROLE SISWA: Terapkan alur autentikasi PIN
  if (roleName === "siswa") {
    const now = new Date();

    // Cek apakah akun sedang terkunci karena brute-force PIN di database
    if (user.pinLockedUntil && user.pinLockedUntil > now) {
      const sisaDetik = Math.ceil(
        (user.pinLockedUntil.getTime() - now.getTime()) / 1000,
      );
      const sisaMenit = Math.ceil(sisaDetik / 60);
      throw new AppError(
        `Akun terkunci sementara karena 5 kali salah memasukkan PIN. Silakan coba lagi dalam ${sisaMenit} menit atau gunakan fitur lupa PIN.`,
        423,
      );
    }

    // Jika siswa belum setup PIN, kembalikan setupToken
    if (!user.pinHash) {
      const setupToken = generatePinToken(user.id, "pin_setup");

      return res.status(200).json({
        success: true,
        requiresPinSetup: true,
        setupToken,
        message: "Kata sandi valid. Silakan buat PIN 6 digit untuk melanjutkan.",
      });
    }

    // Jika siswa sudah memiliki PIN, kembalikan pinToken untuk diverifikasi di /api/auth/pin/verify
    const pinToken = generatePinToken(user.id, "pin_access");

    return res.status(200).json({
      success: true,
      requiresPin: true,
      pinToken,
      message: "Kata sandi valid. Masukkan PIN 6 digit Anda untuk menyelesaikan login.",
    });
  }

  // 3. ROLE LAIN (Guru, Admin Sekolah, Admin Yayasan, Superadmin): Alur standar langsung JWT
  await prisma.pengguna.update({
    where: { id: user.id },
    data: { terakhirLogin: new Date() },
  });

  const isSuper = isSuperAdmin(user.peran?.nama);
  const { izin, modulAktif } = await ambilIzinDanModul(
    user.peranId ?? null,
    user.sekolahId ?? null,
    isSuper,
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
    user: formatAuthUser(user),
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
    throw new AppError("Kode OTP tidak valid atau akun tidak aktif", 400);
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

export const logout = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Logout berhasil",
  });
};

export const setupPin = async (req: Request, res: Response) => {
  const data = setupPinSchema.parse(req.body);

  const authHeader = req.headers.authorization;
  const rawToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : data.setupToken;

  if (!rawToken) {
    throw new AppError("Token setup PIN diperlukan", 401);
  }

  let payload;
  try {
    payload = verifyPinToken(rawToken);
  } catch (error: any) {
    throw new AppError("Token setup PIN tidak valid atau sudah kedaluwarsa", 401);
  }

  if (payload.purpose !== "pin_setup") {
    throw new AppError("Token tidak valid untuk pembuatan PIN", 400);
  }

  const user = await prisma.pengguna.findUnique({
    where: { id: payload.userId },
    include: { peran: true, sekolah: true, yayasan: true },
  });

  if (!user || user.status !== "aktif" || user.dihapusPada !== null) {
    throw new AppError("Pengguna tidak ditemukan atau tidak aktif", 404);
  }

  if (user.peran?.nama?.trim().toLowerCase() !== "siswa") {
    throw new AppError("Setup PIN hanya berlaku untuk peran siswa", 403);
  }

  const hashedPin = await bcrypt.hash(data.pin, 10);

  // Atomic update untuk mencegah race condition (hanya update jika pinHash saat ini null)
  const result = await prisma.pengguna.updateMany({
    where: {
      id: user.id,
      pinHash: null,
      dihapusPada: null,
    },
    data: {
      pinHash: hashedPin,
      pinFailedAttempts: 0,
      pinLockedUntil: null,
      terakhirLogin: new Date(),
    },
  });

  if (result.count === 0) {
    const cekUser = await prisma.pengguna.findUnique({
      where: { id: user.id },
      select: { pinHash: true },
    });
    if (cekUser?.pinHash) {
      throw new AppError("PIN sudah pernah dibuat sebelumnya. Silakan login menggunakan PIN Anda.", 409);
    }
    throw new AppError("Gagal mengatur PIN", 500);
  }

  const isSuper = isSuperAdmin(user.peran?.nama);
  const { izin, modulAktif } = await ambilIzinDanModul(
    user.peranId ?? null,
    user.sekolahId ?? null,
    isSuper,
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
    message: "PIN keamanan 6 digit berhasil dibuat. Selamat datang!",
    token,
    user: formatAuthUser(user),
  });
};

export const verifyPin = async (req: Request, res: Response) => {
  const data = verifyPinSchema.parse(req.body);

  const authHeader = req.headers.authorization;
  const rawToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : data.pinToken;

  if (!rawToken) {
    throw new AppError("Token verifikasi PIN diperlukan", 401);
  }

  let payload;
  try {
    payload = verifyPinToken(rawToken);
  } catch (error: any) {
    throw new AppError("Token verifikasi PIN tidak valid atau sudah kedaluwarsa", 401);
  }

  if (payload.purpose !== "pin_access") {
    throw new AppError("Token tidak valid untuk verifikasi PIN", 400);
  }

  const user = await prisma.pengguna.findUnique({
    where: { id: payload.userId },
    include: { peran: true, sekolah: true, yayasan: true },
  });

  if (!user || user.status !== "aktif" || user.dihapusPada !== null) {
    throw new AppError("Pengguna tidak ditemukan atau tidak aktif", 401);
  }

  if (user.peran?.nama?.trim().toLowerCase() !== "siswa") {
    throw new AppError("Verifikasi PIN hanya untuk peran siswa", 403);
  }

  if (!user.pinHash) {
    throw new AppError("PIN belum dibuat. Silakan lakukan setup PIN terlebih dahulu.", 400);
  }

  const now = new Date();

  // Cek proteksi brute-force dari database
  if (user.pinLockedUntil && user.pinLockedUntil > now) {
    const sisaDetik = Math.ceil(
      (user.pinLockedUntil.getTime() - now.getTime()) / 1000,
    );
    const sisaMenit = Math.ceil(sisaDetik / 60);
    throw new AppError(
      `Akun terkunci sementara karena 5 kali salah memasukkan PIN. Coba lagi dalam ${sisaMenit} menit.`,
      423,
    );
  }

  const isPinMatch = await bcrypt.compare(data.pin, user.pinHash);

  if (!isPinMatch) {
    const currentAttempts =
      user.pinLockedUntil && user.pinLockedUntil <= now
        ? 0
        : user.pinFailedAttempts;

    const newAttempts = currentAttempts + 1;
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 5;

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      await prisma.pengguna.update({
        where: { id: user.id },
        data: {
          pinFailedAttempts: newAttempts,
          pinLockedUntil: lockUntil,
        },
      });

      throw new AppError(
        `PIN salah 5 kali berturut-turut. Akun Anda dikunci selama ${LOCKOUT_MINUTES} menit untuk keamanan.`,
        423,
      );
    } else {
      await prisma.pengguna.update({
        where: { id: user.id },
        data: {
          pinFailedAttempts: newAttempts,
        },
      });

      const sisaKesempatan = MAX_ATTEMPTS - newAttempts;
      throw new AppError(
        `PIN tidak cocok. Sisa kesempatan: ${sisaKesempatan} kali sebelum akun dikunci.`,
        401,
      );
    }
  }

  // PIN Valid: Reset counter kegagalan dan hapus status lockout di database
  await prisma.pengguna.update({
    where: { id: user.id },
    data: {
      pinFailedAttempts: 0,
      pinLockedUntil: null,
      terakhirLogin: new Date(),
    },
  });

  const isSuper = isSuperAdmin(user.peran?.nama);
  const { izin, modulAktif } = await ambilIzinDanModul(
    user.peranId ?? null,
    user.sekolahId ?? null,
    isSuper,
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
    message: "Verifikasi PIN berhasil. Selamat datang!",
    token,
    user: formatAuthUser(user),
  });
};

export const forgotPin = async (req: Request, res: Response) => {
  const data = forgotPinSchema.parse(req.body);

  const user = await prisma.pengguna.findFirst({
    where: {
      OR: [{ email: data.identifier }, { namaPengguna: data.identifier }],
    },
    include: { peran: true },
  });

  if (
    !user ||
    user.status !== "aktif" ||
    user.dihapusPada !== null ||
    user.peran?.nama?.trim().toLowerCase() !== "siswa"
  ) {
    return res.status(200).json({
      success: true,
      message: "Jika akun siswa terdaftar, kode OTP reset PIN telah dikirimkan ke email Anda.",
    });
  }

  const otpCode = generateOtp();
  const otpTimeout = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.pengguna.update({
    where: { id: user.id },
    data: {
      kodeOtp: otpCode,
      otpTimeout,
    },
  });

  try {
    await sendOtpEmail({
      email: user.email,
      namaLengkap: user.namaLengkap,
      kodeOtp: otpCode,
    });
  } catch (err) {
    throw new AppError(
      "Gagal mengirim email OTP reset PIN. Silakan coba lagi.",
      502,
    );
  }

  return res.status(200).json({
    success: true,
    message: "Kode OTP reset PIN telah dikirimkan ke email Anda.",
  });
};

export const resetPin = async (req: Request, res: Response) => {
  const data = resetPinSchema.parse(req.body);

  const user = await prisma.pengguna.findFirst({
    where: {
      OR: [{ email: data.identifier }, { namaPengguna: data.identifier }],
    },
    include: { peran: true },
  });

  if (
    !user ||
    user.status !== "aktif" ||
    user.dihapusPada !== null ||
    user.peran?.nama?.trim().toLowerCase() !== "siswa"
  ) {
    throw new AppError("Permintaan tidak valid atau pengguna tidak ditemukan", 400);
  }

  if (user.kodeOtp !== data.kodeOtp) {
    throw new AppError("Kode OTP salah", 400);
  }

  if (!user.otpTimeout || user.otpTimeout < new Date()) {
    throw new AppError("Kode OTP sudah kedaluwarsa", 400);
  }

  const hashedNewPin = await bcrypt.hash(data.pinBaru, 10);

  await prisma.pengguna.update({
    where: { id: user.id },
    data: {
      pinHash: hashedNewPin,
      pinFailedAttempts: 0,
      pinLockedUntil: null,
      kodeOtp: null,
      otpTimeout: null,
    },
  });

  return res.status(200).json({
    success: true,
    message: "PIN berhasil direset. Silakan login kembali menggunakan PIN baru Anda.",
  });
};

export const resetPinByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthRequest;
    const userId = req.params.userId as string;
    const actorRole = authReq.user?.role;
    const isSuper = isSuperAdmin(actorRole);
    const actorSekolahId = authReq.user?.sekolahId;

    if (!isSuper && !actorSekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const targetUser = await prisma.pengguna.findFirst({
      where: {
        id: userId,
        dihapusPada: null,
        ...(!isSuper ? { sekolahId: actorSekolahId } : {}),
      },
      include: { peran: true },
    });

    if (!targetUser) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    if (!isSuper && targetUser.sekolahId !== actorSekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    if (normalizeRole(targetUser.peran?.nama) !== "siswa") {
      throw new AppError("Reset PIN hanya berlaku untuk akun siswa", 400);
    }

    await prisma.pengguna.update({
      where: { id: userId },
      data: {
        pinHash: null,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "PIN siswa berhasil direset oleh admin. Siswa akan diminta membuat PIN baru saat login berikutnya.",
    });
  } catch (error) {
    next(error);
  }
};