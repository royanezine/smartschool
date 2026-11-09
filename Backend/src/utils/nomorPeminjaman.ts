import crypto from "crypto";

export const generateNomorPeminjaman = () => {
  const now = new Date();

  const tanggal = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `PJM-${tanggal}-${randomHex}`;
};
