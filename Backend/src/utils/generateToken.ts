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

export interface PpdbUploadTokenPayload {
  pendaftaranId: string;
  nomorPendaftaran: string;
  sekolahId: string;
  purpose: "ppdb_upload";
}

export const generatePpdbUploadToken = (
  pendaftaranId: string,
  nomorPendaftaran: string,
  sekolahId: string,
): string => {
  return jwt.sign(
    { pendaftaranId, nomorPendaftaran, sekolahId, purpose: "ppdb_upload" },
    JWT_SECRET!,
    { expiresIn: "7d" },
  );
};

export const verifyPpdbUploadToken = (token: string): PpdbUploadTokenPayload => {
  const payload = jwt.verify(token, JWT_SECRET!) as PpdbUploadTokenPayload;

  if (
    !payload.pendaftaranId ||
    !payload.sekolahId ||
    payload.purpose !== "ppdb_upload"
  ) {
    throw new Error("Token pendaftaran PPDB tidak valid");
  }

  return payload;
};

export interface PpdbAccessTokenPayload {
  pendaftaranId: string;
  nomorPendaftaran: string;
  sekolahId: string;
  purpose: "ppdb_access";
}

export const generatePpdbAccessToken = (
  pendaftaranId: string,
  nomorPendaftaran: string,
  sekolahId: string,
): string => {
  return jwt.sign(
    { pendaftaranId, nomorPendaftaran, sekolahId, purpose: "ppdb_access" },
    JWT_SECRET!,
    { expiresIn: "1d" },
  );
};

export const verifyPpdbAccessToken = (token: string): PpdbAccessTokenPayload => {
  const payload = jwt.verify(token, JWT_SECRET!) as PpdbAccessTokenPayload;

  if (
    !payload.pendaftaranId ||
    !payload.sekolahId ||
    payload.purpose !== "ppdb_access"
  ) {
    throw new Error("Token akses pendaftar tidak valid");
  }

  return payload;
};