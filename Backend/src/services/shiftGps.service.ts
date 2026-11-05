import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { hitungJarakMeter } from "../utils/geo";

export async function assertShiftGps(
  sekolahId: string,
  data: { metode: string; lintang?: number; bujur?: number },
  action: "check-in" | "check-out",
) {
  const school = await prisma.sekolah.findFirst({
    where: { id: sekolahId, dihapusPada: null },
    select: { lintang: true, bujur: true, radiusAbsensi: true, metodeAbsensiAktif: true },
  });
  if (!school) throw new AppError("Sekolah tidak ditemukan", 404);
  if (school.metodeAbsensiAktif.length && !school.metodeAbsensiAktif.includes(data.metode)) {
    throw new AppError(`Metode absensi ${data.metode} sedang dinonaktifkan oleh sekolah. Metode yang diizinkan: ${school.metodeAbsensiAktif.join(", ")}`, 400);
  }
  if (data.metode !== "lokasi" && data.metode !== "face") return;
  if (data.lintang === undefined || data.bujur === undefined) {
    throw new AppError("Akses lokasi (GPS) wajib diaktifkan untuk metode ini", 400);
  }
  if (school.lintang === null || school.bujur === null) {
    throw new AppError("Koordinat sekolah belum dikonfigurasi. Hubungi administrator.", 400);
  }
  const radius = school.radiusAbsensi ?? 100;
  if (radius < 0) throw new AppError("Radius absensi sekolah tidak valid", 400);
  const jarak = hitungJarakMeter(data.lintang, data.bujur, Number(school.lintang), Number(school.bujur));
  if (jarak > radius) {
    throw new AppError(`Anda berada ${Math.round(jarak)} meter dari sekolah. Anda harus berada di dalam radius ${radius} meter untuk ${action}.`, 403);
  }
}
