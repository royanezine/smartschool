import { prisma } from "../config/db";

export interface PengaturanSpmbNilai {
  pendaftaranDibuka: boolean;
  wajibLokasi: boolean;
  batasiPendaftarSesuaiKuota: boolean;
  rankingTerbuka: boolean;
  kirimEmailKonfirmasi: boolean;
}

const PENGATURAN_DEFAULT: PengaturanSpmbNilai = {
  pendaftaranDibuka: true,
  wajibLokasi: true,
  batasiPendaftarSesuaiKuota: false,
  rankingTerbuka: true,
  kirimEmailKonfirmasi: true,
};

export const ambilPengaturanSpmb = async (
  sekolahId: string,
): Promise<PengaturanSpmbNilai> => {
  const baris = await prisma.pengaturanSpmb.findUnique({
    where: { sekolahId },
  });

  if (!baris) {
    return { ...PENGATURAN_DEFAULT };
  }

  return {
    pendaftaranDibuka: baris.pendaftaranDibuka,
    wajibLokasi: baris.wajibLokasi,
    batasiPendaftarSesuaiKuota: baris.batasiPendaftarSesuaiKuota,
    rankingTerbuka: baris.rankingTerbuka,
    kirimEmailKonfirmasi: baris.kirimEmailKonfirmasi,
  };
};

export const parseBerkasWajib = (nilai: unknown): string[] => {
  if (!Array.isArray(nilai)) {
    return [];
  }

  return nilai.filter((item): item is string => typeof item === "string");
};

export const keAngka = (nilai: unknown): number | null => {
  if (nilai === null || nilai === undefined) {
    return null;
  }

  const angka = Number(nilai);

  return Number.isFinite(angka) ? angka : null;
};

const keRadian = (derajat: number) => (derajat * Math.PI) / 180;

export const hitungJarakKm = (
  lintang1: number,
  bujur1: number,
  lintang2: number,
  bujur2: number,
): number => {
  const selisihLintang = keRadian(lintang2 - lintang1);
  const selisihBujur = keRadian(bujur2 - bujur1);

  const a =
    Math.pow(Math.sin(selisihLintang / 2), 2) +
    Math.cos(keRadian(lintang1)) *
      Math.cos(keRadian(lintang2)) *
      Math.pow(Math.sin(selisihBujur / 2), 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(6371 * c * 1000) / 1000;
};

export interface EntriRanking {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  jarakKm: number | null;
  nilaiRapor: number | null;
  status: string | null;
  berkasLengkap: boolean;
  berkasKurang: string[];
  memenuhiKriteria: boolean;
  alasanTidakMemenuhi: string[];
  peringkat: number;
  masukKuota: boolean;
}

export interface HasilRanking {
  jalurId: string;
  namaJalur: string;
  kategori: string;
  metodeRanking: string;
  kuota: number;
  berkasWajib: string[];
  totalPendaftar: number;
  daftar: EntriRanking[];
}

const NILAI_BESAR = Number.MAX_SAFE_INTEGER;

export const ambilRankingJalur = async (
  jalurPpdbId: string,
  sekolahId?: string,
): Promise<HasilRanking | null> => {
  const jalur = await prisma.jalurPpdb.findFirst({
    where: {
      id: jalurPpdbId,
      dihapusPada: null,
      ...(sekolahId ? { sekolahId } : {}),
    },
  });

  if (!jalur) {
    return null;
  }

  const berkasWajib = parseBerkasWajib(jalur.berkasWajib);
  const jarakMaksimal = keAngka(jalur.jarakMaksimalKm);
  const nilaiMinimal = keAngka(jalur.nilaiMinimal);

  const baris = await prisma.pendaftaranPpdb.findMany({
    where: {
      jalurPpdbId,
      dihapusPada: null,
      status: { not: "ditolak" },
    },
    select: {
      id: true,
      nomorPendaftaran: true,
      namaLengkap: true,
      jarakKm: true,
      nilaiRapor: true,
      status: true,
      dibuatPada: true,
      berkasPpdb: {
        where: { dihapusPada: null },
        select: { namaBerkas: true },
      },
    },
  });

  const entri = baris.map((item) => {
    const jarak = keAngka(item.jarakKm);
    const nilai = keAngka(item.nilaiRapor);
    const terunggah = item.berkasPpdb.map((b) => b.namaBerkas);
    const berkasKurang = berkasWajib.filter((b) => !terunggah.includes(b));
    const alasan: string[] = [];

    if (berkasKurang.length > 0) {
      alasan.push(`Berkas wajib belum lengkap: ${berkasKurang.join(", ")}`);
    }

    if (jarakMaksimal !== null) {
      if (jarak === null) {
        alasan.push("Jarak rumah belum terhitung");
      } else if (jarak > jarakMaksimal) {
        alasan.push(`Jarak melebihi batas ${jarakMaksimal} km`);
      }
    }

    if (nilaiMinimal !== null && (nilai === null || nilai < nilaiMinimal)) {
      alasan.push(`Nilai rapor di bawah minimal ${nilaiMinimal}`);
    }

    return {
      id: item.id,
      nomorPendaftaran: item.nomorPendaftaran,
      namaLengkap: item.namaLengkap,
      jarakKm: jarak,
      nilaiRapor: nilai,
      status: item.status,
      dibuatPada: item.dibuatPada,
      berkasLengkap: berkasKurang.length === 0,
      berkasKurang,
      memenuhiKriteria: alasan.length === 0,
      alasanTidakMemenuhi: alasan,
    };
  });

  entri.sort((a, b) => {
    if (a.memenuhiKriteria !== b.memenuhiKriteria) {
      return a.memenuhiKriteria ? -1 : 1;
    }

    const selisihJarak =
      (a.jarakKm ?? NILAI_BESAR) - (b.jarakKm ?? NILAI_BESAR);
    const selisihNilai = (b.nilaiRapor ?? -1) - (a.nilaiRapor ?? -1);

    if (jalur.metodeRanking === "nilai") {
      if (selisihNilai !== 0) return selisihNilai;
      if (selisihJarak !== 0) return selisihJarak;
    } else {
      if (selisihJarak !== 0) return selisihJarak;
      if (selisihNilai !== 0) return selisihNilai;
    }

    return a.dibuatPada.getTime() - b.dibuatPada.getTime();
  });

  const daftar: EntriRanking[] = entri.map((item, index) => ({
    id: item.id,
    nomorPendaftaran: item.nomorPendaftaran,
    namaLengkap: item.namaLengkap,
    jarakKm: item.jarakKm,
    nilaiRapor: item.nilaiRapor,
    status: item.status,
    berkasLengkap: item.berkasLengkap,
    berkasKurang: item.berkasKurang,
    memenuhiKriteria: item.memenuhiKriteria,
    alasanTidakMemenuhi: item.alasanTidakMemenuhi,
    peringkat: index + 1,
    masukKuota: item.memenuhiKriteria && index + 1 <= jalur.kuota,
  }));

  return {
    jalurId: jalur.id,
    namaJalur: jalur.nama,
    kategori: jalur.kategori,
    metodeRanking: jalur.metodeRanking,
    kuota: jalur.kuota,
    berkasWajib,
    totalPendaftar: daftar.length,
    daftar,
  };
};