import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayLoad } from "../utils/generateToken";
import { prisma } from "../config/db";
import { isSuperAdmin, normalizeRole } from "../utils/rbac";

export interface AuthRequest extends Request {
  user?: TokenPayLoad;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token diperlukan",
        errorCode: "UNAUTHORIZED",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Format token harus Bearer <token>",
        errorCode: "INVALID_TOKEN_FORMAT",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
        errorCode: "TOKEN_MISSING",
      });
    }

    const decode = verifyAccessToken(token);

    if (!decode || !decode.userId) {
      return res.status(401).json({
        success: false,
        message: "Payload token tidak valid",
        errorCode: "INVALID_TOKEN_PAYLOAD",
      });
    }

    const user = await prisma.pengguna.findUnique({
      where: { id: decode.userId },
      select: {
        id: true,
        email: true,
        status: true,
        dihapusPada: true,
        peranId: true,
        sekolahId: true,
        yayasanId: true,
        peran: {
          select: {
            id: true,
            nama: true,
            status: true,
            dihapusPada: true,
            peranIzin: {
              where: {
                dihapusPada: null,
                izin: { status: "aktif", dihapusPada: null },
              },
              select: {
                izin: {
                  select: { nama: true },
                },
              },
            },
          },
        },
        sekolah: {
          select: {
            id: true,
            status: true,
            dihapusPada: true,
            sekolahModul: {
              where: { status: "aktif", dihapusPada: null },
              select: {
                modul: {
                  select: { kode: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Pengguna tidak ditemukan",
        errorCode: "USER_NOT_FOUND",
      });
    }

    if (user.dihapusPada !== null) {
      return res.status(401).json({
        success: false,
        message: "Akun pengguna telah dihapus",
        errorCode: "ACCOUNT_DELETED",
      });
    }

    if (user.status !== "aktif") {
      return res.status(401).json({
        success: false,
        message: "Akun pengguna tidak aktif atau dinonaktifkan",
        errorCode: "ACCOUNT_INACTIVE",
      });
    }

    if (!user.peran || !user.peran.nama || user.peran.dihapusPada !== null) {
      return res.status(403).json({
        success: false,
        message: "Peran pengguna tidak ditemukan atau tidak valid",
        errorCode: "ROLE_NOT_FOUND",
      });
    }

    if (user.peran.status !== "aktif") {
      return res.status(403).json({
        success: false,
        message: "Peran pengguna sedang dinonaktifkan",
        errorCode: "ROLE_INACTIVE",
      });
    }

    // Role mismatch check: if token explicitly claims a role that conflicts with DB role
    if (decode.role && normalizeRole(decode.role) !== normalizeRole(user.peran.nama)) {
      return res.status(401).json({
        success: false,
        message: "Sesi otentikasi tidak valid: peran pengguna telah berubah. Silakan login kembali.",
        errorCode: "ROLE_MISMATCH",
      });
    }

    const isSuper = isSuperAdmin(user.peran.nama);
    let effectiveIzin: string[] = [];
    let effectiveModul: string[] = [];

    if (isSuper) {
      const [semuaModul, semuaIzin] = await Promise.all([
        prisma.modul.findMany({ select: { kode: true } }),
        prisma.izin.findMany({ where: { status: "aktif", dihapusPada: null }, select: { nama: true } }),
      ]);
      effectiveModul = semuaModul.map((m) => m.kode);
      effectiveIzin = semuaIzin.map((i) => i.nama);
    } else {
      effectiveIzin = user.peran.peranIzin.map((pi) => pi.izin.nama);
      effectiveModul = user.sekolah?.sekolahModul?.map((sm) => sm.modul.kode) ?? [];
    }

    (req as AuthRequest).user = {
      userId: user.id,
      email: user.email,
      roleId: user.peran.id,
      role: user.peran.nama,
      sekolahId: user.sekolahId ?? undefined,
      yayasanId: user.yayasanId ?? undefined,
      izin: effectiveIzin,
      modulAktif: effectiveModul,
    };

    next();
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token telah kedaluwarsa",
        errorCode: "TOKEN_EXPIRED",
      });
    }

    if (error?.name === "JsonWebTokenError" || error?.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
        errorCode: "INVALID_TOKEN",
      });
    }

    // Database errors or other infrastructure issues — do NOT return 401
    // as that would mask the real problem (service unavailability)
    if (
      error?.name === "PrismaClientInitializationError" ||
      error?.name === "PrismaClientKnownRequestError" ||
      error?.name === "PrismaClientUnknownRequestError" ||
      error?.name === "PrismaClientRustPanicError"
    ) {
      return res.status(503).json({
        success: false,
        message: "Layanan database tidak tersedia sementara",
        errorCode: "DATABASE_UNAVAILABLE",
      });
    }

    // Unexpected errors — return 500 Internal Server Error
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};