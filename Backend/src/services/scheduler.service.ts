import {
  triggerDeadlineH1Notification,
  triggerLanggananH7Notification,
} from "../controllers/notifikasi.controller";
import { acquireDistributedLock, releaseDistributedLock, getRedisClient } from "../config/redis";
import { prisma } from "../config/db";

let notificationInterval: NodeJS.Timeout | null = null;
let isDeadlineRunning = false;
let isLanggananRunning = false;

const runWithDistributedLock = async (
  lockName: string,
  ttlMs: number,
  task: () => Promise<void>
) => {
  const redisKey = `scheduler:lock:${lockName}`;
  const redis = getRedisClient();

  if (redis) {
    const locked = await acquireDistributedLock(redisKey, ttlMs);
    if (!locked) {
      return; // Pod / instance lain sedang atau sudah menjalankan task ini
    }
    try {
      await task();
    } finally {
      await releaseDistributedLock(redisKey);
    }
    return;
  }

  // Fallback: Gunakan Postgres advisory lock non-blocking
  try {
    const lockRes: any = await prisma.$queryRaw`SELECT pg_try_advisory_lock(hashtext(${lockName})) as locked`;
    const isLocked = lockRes?.[0]?.locked === true;
    if (!isLocked) {
      return; // Pod / instance lain sedang menjalankan task ini
    }
    try {
      await task();
    } finally {
      await prisma.$queryRaw`SELECT pg_advisory_unlock(hashtext(${lockName}))`;
    }
    return;
  } catch {
    // Fallback jika database tidak mendukung pg advisory lock
    await task();
  }
};

export const runNotificationJobs = async () => {
  if (!isDeadlineRunning) {
    isDeadlineRunning = true;
    try {
      await runWithDistributedLock("scheduler:deadline_h1", 20 * 60 * 1000, async () => {
        await triggerDeadlineH1Notification();
      });
    } catch (error) {
      console.error("[SCHEDULER] Gagal menjalankan deadline job:", error);
    } finally {
      isDeadlineRunning = false;
    }
  }

  if (!isLanggananRunning) {
    isLanggananRunning = true;
    try {
      await runWithDistributedLock("scheduler:langganan_h7", 20 * 60 * 1000, async () => {
        await triggerLanggananH7Notification();
      });
    } catch (error) {
      console.error("[SCHEDULER] Gagal menjalankan subscription job:", error);
    } finally {
      isLanggananRunning = false;
    }
  }
};

export const startScheduler = (intervalMs = 30 * 60 * 1000) => {
  if (notificationInterval) return;

  // Initial run after a short delay so server startup is not blocked
  setTimeout(() => {
    runNotificationJobs().catch(console.error);
  }, 10 * 1000).unref();

  notificationInterval = setInterval(() => {
    runNotificationJobs().catch(console.error);
  }, intervalMs);

  if (notificationInterval.unref) {
    notificationInterval.unref();
  }

  console.log("⏰ Background job scheduler started.");
};

export const stopScheduler = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log("🛑 Background job scheduler stopped.");
  }
};
