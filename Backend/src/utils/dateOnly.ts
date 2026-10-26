import { AppError } from "./appError";

// PostgreSQL DATE is a calendar date, not midnight in the server's timezone.
export function parseDateOnly(value: string, field = "tanggal"): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(`${field} harus berformat YYYY-MM-DD`, 400);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new AppError(`${field} tidak valid`, 400);
  }
  return date;
}

function localParts(now: Date, timeZone = process.env.APP_TIMEZONE || "Asia/Jakarta") {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now).map(({ type, value }) => [type, value]),
  );
}

export function todayDateOnly(now = new Date(), timeZone?: string): Date {
  const parts = localParts(now, timeZone);
  return parseDateOnly(`${parts.year}-${parts.month}-${parts.day}`);
}

export function localClockMinutes(now: Date, timeZone?: string): number {
  const parts = localParts(now, timeZone);
  return Number(parts.hour) * 60 + Number(parts.minute);
}

export function attendanceDateFilter(query: {
  tanggal?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
}) {
  if (query.tanggal && (query.tanggalMulai || query.tanggalSelesai)) {
    throw new AppError("Gunakan tanggal atau rentang tanggal, bukan keduanya", 400);
  }
  if (query.tanggal) return parseDateOnly(query.tanggal);
  const gte = query.tanggalMulai ? parseDateOnly(query.tanggalMulai, "tanggalMulai") : undefined;
  const lte = query.tanggalSelesai ? parseDateOnly(query.tanggalSelesai, "tanggalSelesai") : undefined;
  if (gte && lte && gte > lte) {
    throw new AppError("tanggalMulai tidak boleh melewati tanggalSelesai", 400);
  }
  return gte || lte ? { ...(gte && { gte }), ...(lte && { lte }) } : undefined;
}
