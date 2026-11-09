import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_HOST;

let client: Redis | null = null;
let isConnected = false;

if (REDIS_URL || process.env.NODE_ENV === "production") {
  try {
    client = REDIS_URL
      ? new Redis(REDIS_URL, {
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 3000,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
        })
      : new Redis({
          host: process.env.REDIS_HOST || "127.0.0.1",
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 3000,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
        });

    client.on("connect", () => {
      isConnected = true;
      console.log("✅ [REDIS] Connected to Redis server");
    });

    client.on("error", (err) => {
      isConnected = false;
      // Jangan spam log jika redis offline di dev
      if (process.env.NODE_ENV === "production") {
        console.warn("[REDIS] Connection warning:", err.message);
      }
    });

    client.connect().catch(() => {
      isConnected = false;
    });
  } catch {
    isConnected = false;
    client = null;
  }
}

export const getRedisClient = (): Redis | null => {
  return isConnected ? client : null;
};

/**
 * Distributed Lock sederhana berbasis Redis SET NX PX
 */
export const acquireDistributedLock = async (
  key: string,
  ttlMs: number,
  value = "locked",
): Promise<boolean> => {
  const redis = getRedisClient();
  if (!redis) {
    // Jika redis tidak tersedia, kembalikan false untuk diteruskan ke fallback DB lock
    return false;
  }
  try {
    const res = await redis.set(key, value, "PX", ttlMs, "NX");
    return res === "OK";
  } catch {
    return false;
  }
};

/**
 * Melepaskan Distributed Lock di Redis
 */
export const releaseDistributedLock = async (key: string): Promise<void> => {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // Ignore error on release
  }
};

