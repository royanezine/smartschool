import crypto from "crypto";

export const buatOrderIdMidtrans = (prefix: string, sumberId: string) => {
  const ringkas = sumberId.replace(/-/g, "").slice(0, 12);
  const acak = crypto.randomBytes(2).toString("hex");
  return `${prefix}-${ringkas}-${Date.now()}${acak}`.slice(0, 50);
};