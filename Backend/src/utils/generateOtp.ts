import crypto from "crypto";

/* Generate 6 digit numeric OTP using cryptographically secure PRNG */
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

