export const KATEGORI_JALUR = [
  "zonasi",
  "prestasi",
  "afirmasi",
  "perpindahan",
  "reguler",
] as const;

export const BERKAS_PPDB = [
  "KK",
  "AKTE",
  "IJAZAH",
  "SERTIFIKAT",
  "SKTM",
  "KIP",
  "SURAT_TUGAS",
] as const;

export const METODE_RANKING = ["jarak", "nilai"] as const;

export type KategoriJalur = (typeof KATEGORI_JALUR)[number];
export type MetodeRanking = (typeof METODE_RANKING)[number];

export interface DefaultJalur {
  berkasWajib: string[];
  jarakMaksimalKm: number | null;
  metodeRanking: MetodeRanking;
  nilaiMinimal: number | null;
}

export const DEFAULT_JALUR: Record<KategoriJalur, DefaultJalur> = {
  zonasi: {
    berkasWajib: ["KK", "AKTE", "IJAZAH"],
    jarakMaksimalKm: 3,
    metodeRanking: "jarak",
    nilaiMinimal: null,
  },
  prestasi: {
    berkasWajib: ["KK", "AKTE", "IJAZAH", "SERTIFIKAT"],
    jarakMaksimalKm: null,
    metodeRanking: "nilai",
    nilaiMinimal: null,
  },
  afirmasi: {
    berkasWajib: ["KK", "AKTE", "IJAZAH", "SKTM"],
    jarakMaksimalKm: null,
    metodeRanking: "jarak",
    nilaiMinimal: null,
  },
  perpindahan: {
    berkasWajib: ["KK", "AKTE", "IJAZAH", "SURAT_TUGAS"],
    jarakMaksimalKm: null,
    metodeRanking: "jarak",
    nilaiMinimal: null,
  },
  reguler: {
    berkasWajib: ["KK", "AKTE", "IJAZAH"],
    jarakMaksimalKm: null,
    metodeRanking: "nilai",
    nilaiMinimal: null,
  },
};