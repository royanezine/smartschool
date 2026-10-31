import { Request, Response, NextFunction } from "express";
import {
  verifyPpdbAccessToken,
  PpdbAccessTokenPayload,
} from "../utils/generateToken";

export interface PendaftarRequest extends Request {
  pendaftar?: PpdbAccessTokenPayload;
}

export const authenticatePendaftar = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token pendaftar diperlukan",
      errorCode: "UNAUTHORIZED",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token pendaftar tidak ditemukan",
      errorCode: "TOKEN_MISSING",
    });
  }

  try {
    (req as PendaftarRequest).pendaftar = verifyPpdbAccessToken(token);
    return next();
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Sesi pendaftar telah berakhir, silakan masuk kembali",
        errorCode: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token pendaftar tidak valid",
      errorCode: "INVALID_TOKEN",
    });
  }
};