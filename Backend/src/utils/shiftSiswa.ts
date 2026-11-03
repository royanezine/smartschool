import { prisma } from "../config/db";

export type KodeShiftSiswa = "pagi" | "siang";

const DEFAULT_SHIFT_SISWA: Record<
  KodeShiftSiswa,
  {
    nama: string;
    jamMasuk: string;
    jamKeluar: string;
    toleransiTerlambatMenit: number;
  }
> = {
  pagi: {
    nama: "Pagi",
    jamMasuk: "07:00",
    jamKeluar: "14:00",
    toleransiTerlambatMenit: 15,
  },
  siang: {
    nama: "Siang",
    jamMasuk: "12:00",
    jamKeluar: "18:00",
    toleransiTerlambatMenit: 15,
  },
};

export const formatShiftSiswa = (item: {
  id: string;
  kode: string;
  nama: string;
  jamMasuk: string;
  jamKeluar: string;
  toleransiTerlambatMenit: number;
}) => ({
  id: item.id,
  kode: item.kode,
  nama: item.nama,
  jamMasuk: item.jamMasuk,
  jamKeluar: item.jamKeluar,
  toleransiTerlambatMenit: item.toleransiTerlambatMenit,
});

export const pastikanShiftSiswa = async (sekolahId: string) => {
  const existing = await prisma.shiftSiswa.findMany({ where: { sekolahId } });
  const sudahAda = new Set(existing.map((item) => item.kode));
  const kurang = (Object.keys(DEFAULT_SHIFT_SISWA) as KodeShiftSiswa[]).filter(
    (kode) => !sudahAda.has(kode),
  );

  if (kurang.length > 0) {
    await prisma.shiftSiswa.createMany({
      data: kurang.map((kode) => ({
        sekolahId,
        kode,
        ...DEFAULT_SHIFT_SISWA[kode],
      })),
      skipDuplicates: true,
    });
  }

  return prisma.shiftSiswa.findMany({
    where: { sekolahId },
    orderBy: { jamMasuk: "asc" },
  });
};

export const buatShiftSiswaDinamis = async (
  sekolahId: string,
  kode: string | null | undefined,
) => {
  if (!kode) return null;

  const normalized = kode.trim().toLowerCase();
  const daftar = await pastikanShiftSiswa(sekolahId);
  const found = daftar.find((item) => item.kode === normalized);

  if (!found) return null;

  return formatShiftSiswa(found);
};