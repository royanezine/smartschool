import { prisma } from "../config/db";

export const KKM_KEY = "kkm_mapel";
export const KKM_FALLBACK = 75;

export type KkmConfig = {
  kkmDefault: number;
  kkmPerMapel: Record<string, number>;
};

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const getKkmConfig = async (sekolahId: string): Promise<KkmConfig> => {
  const row = await prisma.pengaturanSistem.findFirst({
    where: { sekolahId, kunci: KKM_KEY, dihapusOleh: null },
  });

  const fallback: KkmConfig = { kkmDefault: KKM_FALLBACK, kkmPerMapel: {} };
  if (!row) return fallback;

  try {
    const parsed = JSON.parse(row.nilai);
    const kkmDefault = Number(parsed?.kkmDefault);
    const perMapel: Record<string, number> = {};

    if (parsed?.kkmPerMapel && typeof parsed.kkmPerMapel === "object") {
      for (const [k, v] of Object.entries(parsed.kkmPerMapel)) {
        const num = Number(v);
        if (Number.isFinite(num)) perMapel[k.trim().toLowerCase()] = num;
      }
    }

    return {
      kkmDefault: Number.isFinite(kkmDefault) ? kkmDefault : KKM_FALLBACK,
      kkmPerMapel: perMapel,
    };
  } catch {
    return fallback;
  }
};

export const resolveKkm = (config: KkmConfig, namaMapel: string): number =>
  config.kkmPerMapel[namaMapel.trim().toLowerCase()] ?? config.kkmDefault;

export const hitungPredikat = (nilai: number, kkm: number): string => {
  if (nilai < kkm) return "D";
  if (nilai >= 90) return "A";
  if (nilai >= 80) return "B";
  return "C";
};