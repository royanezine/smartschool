import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";
import { getRedisClient } from "../config/redis";

/**
 * Middleware Rate Limiter yang mendukung multi-instance via Redis
 * dengan fallback in-memory yang aman jika Redis belum dikonfigurasi.
 */
export function requestLimit(limit: number, windowMs = 15 * 60 * 1000) {
  const entries = new Map<string, { count: number; until: number }>();

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = `ratelimit:${req.baseUrl || ""}:${req.path}:${req.user?.userId || req.ip || "unknown"}`;
    const redis = getRedisClient();

    if (redis) {
      try {
        const pipeline = redis.pipeline();
        pipeline.incr(key);
        pipeline.pttl(key);
        const results = await pipeline.exec();

        const count = results?.[0]?.[1] as number;
        let ttl = results?.[1]?.[1] as number;

        if (ttl === -1 || ttl === -2) {
          await redis.pexpire(key, windowMs);
          ttl = windowMs;
        }

        if (count > limit) {
          res.setHeader("Retry-After", Math.ceil(Math.max(ttl, 1000) / 1000));
          return res.status(429).json({
            success: false,
            message: "Terlalu banyak percobaan. Coba lagi nanti.",
            errorCode: "TOO_MANY_REQUESTS",
          });
        }
        return next();
      } catch (err) {
        // Fallback to in-memory if Redis error occurs during request
      }
    }

    // In-memory fallback
    const now = Date.now();
    for (const [k, value] of entries) {
      if (value.until <= now) entries.delete(k);
    }

    let entry = entries.get(key);
    if (!entry) {
      if (entries.size >= 10000) {
        return res.status(503).json({
          success: false,
          message: "Layanan sibuk, coba lagi nanti",
          errorCode: "SERVICE_BUSY",
        });
      }
      entry = { count: 0, until: now + windowMs };
      entries.set(key, entry);
    }

    if (++entry.count > limit) {
      res.setHeader("Retry-After", Math.ceil((entry.until - now) / 1000));
      return res.status(429).json({
        success: false,
        message: "Terlalu banyak percobaan. Coba lagi nanti.",
        errorCode: "TOO_MANY_REQUESTS",
      });
    }

    next();
  };
}
