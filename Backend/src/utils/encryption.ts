import crypto from "node:crypto";
import { AppError } from "./appError";

function key() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-f]{64}$/i.test(hex)) {
    throw new AppError("ENCRYPTION_KEY wajib berupa hex 64 karakter; konfigurasi rahasia tidak dapat disimpan", 503, "ENCRYPTION_KEY_INVALID");
  }
  return Buffer.from(hex, "hex");
}

export function encryptData(text: string, context = ""): string {
  // AAD binds a credential to its setting key without storing that key in the ciphertext.
  const iv = crypto.randomBytes(12);
  const authenticated = crypto.createCipheriv("aes-256-gcm", key(), iv);
  authenticated.setAAD(Buffer.from(context));
  const value = Buffer.concat([authenticated.update(text, "utf8"), authenticated.final()]);
  return [iv, authenticated.getAuthTag(), value].map(v => v.toString("base64")).join(":");
}

export function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  return parts.length === 3 && parts.every(part => Buffer.from(part, "base64").toString("base64") === part)
    && Buffer.from(parts[0]!, "base64").length === 12 && Buffer.from(parts[1]!, "base64").length === 16;
}

export function decryptData(value: string, context = ""): string {
  const encryptionKey = key();
  try {
    if (!isEncrypted(value)) throw new Error("Invalid encrypted data");
    const [iv, tag, encrypted] = value.split(":").map(v => Buffer.from(v, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, iv!);
    decipher.setAAD(Buffer.from(context)); decipher.setAuthTag(tag!);
    return Buffer.concat([decipher.update(encrypted!), decipher.final()]).toString("utf8");
  } catch {
    throw new AppError("Kredensial terenkripsi tidak dapat dibaca; periksa kunci dan integritas data", 500, "CREDENTIAL_DECRYPT_FAILED");
  }
}

export const maskCredential = (value: string) => value ? "********" : "";
