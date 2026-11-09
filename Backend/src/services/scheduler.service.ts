import {
  triggerDeadlineH1Notification,
  triggerLanggananH7Notification,
} from "../controllers/notifikasi.controller";
import { acquireDistributedLock, releaseDistributedLock, getRedisClient } from "../config/redis";
import { prisma } from "../config/db";

let notificationInterval: NodeJS.Timeout | null = null;
let isDeadlineRunning = false;
let isLanggananRunning = false;
let isDendaRunning = false;

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

export const runDendaPerpustakaanJob = async () => {
  if (isDendaRunning) return;
  isDendaRunning = true;
  try {
    await runWithDistributedLock("scheduler:denda_perpustakaan", 30 * 60 * 1000, async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueLoans = await prisma.peminjamanBuku.findMany({
        where: {
          dihapusPada: null,
          status: { in: ["dipinjam", "terlambat"] },
          tanggalJatuhTempo: {
            lt: today,
          },
        },
        select: {
          id: true,
          tanggalJatuhTempo: true,
          status: true,
          catatan: true,
        },
      });

      if (overdueLoans.length === 0) {
        return;
      }

      const TARIF_DENDA_PER_HARI = 1000;

      await prisma.$transaction(async (tx) => {
        for (const loan of overdueLoans) {
          const jatuhTempo = new Date(loan.tanggalJatuhTempo);
          jatuhTempo.setHours(0, 0, 0, 0);
          const selisihMs = today.getTime() - jatuhTempo.getTime();
          const selisihHari = Math.max(1, Math.ceil(selisihMs / (1000 * 60 * 60 * 24)));
          const totalDenda = selisihHari * TARIF_DENDA_PER_HARI;

          const dendaTag = `[DENDA: Terlambat ${selisihHari} hari (Rp ${totalDenda.toLocaleString("id-ID")})]`;
          const baseCatatan = loan.catatan
            ? loan.catatan.replace(/\[DENDA:.*?\]/g, "").trim()
            : "";
          const catatanBaru = baseCatatan ? `${baseCatatan} ${dendaTag}` : dendaTag;

          await tx.peminjamanBuku.update({
            where: { id: loan.id },
            data: {
              status: "terlambat",
              catatan: catatanBaru,
            },
          });
        }
      });

      console.log(
        `[SCHEDULER] Berhasil memproses denda keterlambatan untuk ${overdueLoans.length} peminjaman buku.`
      );
    });
  } catch (error) {
    console.error("[SCHEDULER] Gagal menjalankan denda perpustakaan job:", error);
  } finally {
    isDendaRunning = false;
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

export const runAllScheduledJobs = async () => {
  await Promise.allSettled([
    runNotificationJobs(),
    runDendaPerpustakaanJob(),
  ]);
};

export const startScheduler = (intervalMs = 30 * 60 * 1000) => {
  if (notificationInterval) return;

  // Initial run after a short delay so server startup is not blocked
  setTimeout(() => {
    runAllScheduledJobs().catch(console.error);
  }, 10 * 1000).unref();

  notificationInterval = setInterval(() => {
    runAllScheduledJobs().catch(console.error);
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
