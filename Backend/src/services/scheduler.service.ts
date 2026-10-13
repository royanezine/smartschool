import {
  triggerDeadlineH1Notification,
  triggerLanggananH7Notification,
} from "../controllers/notifikasi.controller";

let notificationInterval: NodeJS.Timeout | null = null;
let isDeadlineRunning = false;
let isLanggananRunning = false;

export const runNotificationJobs = async () => {
  if (!isDeadlineRunning) {
    isDeadlineRunning = true;
    try {
      await triggerDeadlineH1Notification();
    } catch (error) {
      console.error("[SCHEDULER] Gagal menjalankan deadline job:", error);
    } finally {
      isDeadlineRunning = false;
    }
  }

  if (!isLanggananRunning) {
    isLanggananRunning = true;
    try {
      await triggerLanggananH7Notification();
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
