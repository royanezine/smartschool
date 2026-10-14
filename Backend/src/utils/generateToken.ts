import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface TokenPayLoad {
  userId: string;
  email: string;
  roleId?: string;
  role?: string;
  sekolahId?: string;
  yayasanId?: string;
  izin: string[];
  modulAktif: string[];
}

export interface RefreshPayLoad {
  userId: string;
  type: "refresh";
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET belum diatur!");
}

export const generateAccessToken = (payload: TokenPayLoad): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "3h",
  });
};

export const generateRefreshToken = (payload: RefreshPayLoad): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): TokenPayLoad => {
  return jwt.verify(token, JWT_SECRET) as TokenPayLoad;
};

export const verifyRefreshToken = (token: string): RefreshPayLoad => {
  return jwt.verify(token, JWT_SECRET) as RefreshPayLoad;
};

export interface PinTokenPayload {
  userId: string;
  purpose: "pin_setup" | "pin_access";
}

export const generatePinToken = (
  userId: string,
  purpose: PinTokenPayload["purpose"],
): string => {
  const expiresIn = purpose === "pin_setup" ? "10m" : "5m";

  return jwt.sign({ userId, purpose }, JWT_SECRET!, {
    expiresIn,
  });
};

export const verifyPinToken = (token: string): PinTokenPayload => {
  const payload = jwt.verify(token, JWT_SECRET!) as PinTokenPayload;

  if (
    !payload.userId ||
    !["pin_setup", "pin_access"].includes(payload.purpose)
  ) {
    throw new Error("Token PIN tidak valid");
  }

  return payload;
};