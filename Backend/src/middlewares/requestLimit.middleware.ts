import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";

// Per-process guard; multi-instance deployments should use the same policy in
// their gateway/shared store. Never trust a client-supplied X-Forwarded-For.
export function requestLimit(limit: number, windowMs = 15 * 60 * 1000) {
  const entries = new Map<string, { count: number; until: number }>();
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const now = Date.now();
    for (const [key, value] of entries) if (value.until <= now) entries.delete(key);
    const key = req.user?.userId || req.ip || "unknown";
    let entry = entries.get(key);
    if (!entry) {
      if (entries.size >= 10000) return res.status(503).json({ success: false, message: "Layanan sibuk, coba lagi nanti" });
      entry = { count: 0, until: now + windowMs }; entries.set(key, entry);
    }
    if (++entry.count > limit) {
      res.setHeader("Retry-After", Math.ceil((entry.until - now) / 1000));
      return res.status(429).json({ success: false, message: "Terlalu banyak percobaan. Coba lagi nanti." });
    }
    next();
  };
}
