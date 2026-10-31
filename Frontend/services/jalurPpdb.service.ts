import { apiFetch } from "../lib/api";

const ENDPOINT = "/api/ppdb/jalur";

export type KategoriJalur =
  | "zonasi"
  | "prestasi"
  | "afirmasi"
  | "perpindahan"
  | "reguler";

export type MetodeRanking = "jarak" | "nilai";

export const KATEGORI_JALUR_OPTIONS: { value: KategoriJalur; label: string }[] = [
  { value: "zonasi", label: "Zonasi" },
  { value: "prestasi", label: "Prestasi" },
  { value: "afirmasi", label: "Afirmasi" },
  { value: "perpindahan", label: "Perpindahan Tugas Orang Tua" },
  { value: "reguler", label: "Reguler / Umum" },
];

export const METODE_RANKING_OPTIONS: { value: MetodeRanking; label: string }[] = [
  { value: "jarak", label: "Jarak (Radius Terdekat)" },
  { value: "nilai", label: "Nilai (Prestasi / Rapor)" },
];

export const BERKAS_PPDB_OPTIONS = [
  { value: "KK", label: "Kartu Keluarga (KK)" },
  { value: "AKTE", label: "Akta Kelahiran" },
  { value: "IJAZAH", label: "Ijazah / SKL" },
  { value: "SERTIFIKAT", label: "Sertifikat Prestasi" },
  { value: "SKTM", label: "Surat Keterangan Tidak Mampu (SKTM)" },
  { value: "KIP", label: "Kartu Indonesia Pintar (KIP)" },
  { value: "SURAT_TUGAS", label: "Surat Penugasan Orang Tua" },
] as const;

export interface JalurPpdb {
  id: string;
  sekolahId: string;
  nama: string;
  deskripsi?: string | null;
  kategori: KategoriJalur;
  kuota: number;
  metodeRanking: MetodeRanking;
  jarakMaksimalKm?: number | null;
  nilaiMinimal?: number | null;
  berkasWajib: string[];
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
  status: "aktif" | "nonaktif";
  pendaftaranBuka?: boolean;
  jumlahPendaftar?: number;
  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface JalurPpdbPayload {
  nama: string;
  kategori: KategoriJalur;
  deskripsi?: string;
  kuota: number;
  metodeRanking?: MetodeRanking;
  jarakMaksimalKm?: number | null;
  nilaiMinimal?: number | null;
  berkasWajib?: string[];
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
  status?: "aktif" | "nonaktif";
}

export interface JalurPpdbResponse {
  success: boolean;
  message?: string;
  data: JalurPpdb;
}

export interface JalurPpdbListResponse {
  success: boolean;
  message?: string;
  data: JalurPpdb[];
}

export async function getJalurPpdb(): Promise<JalurPpdbListResponse> {
  return apiFetch(ENDPOINT, {
    method: "GET",
  });
}

export async function getJalurPpdbById(
  id: string
): Promise<JalurPpdbResponse> {
  if (!id) {
    throw new Error("ID jalur PPDB tidak ditemukan.");
  }

  // Response dari endpoint terbaru GET /api/ppdb/jalur sebagai single source of truth
  const response = await getJalurPpdb();
  const list = Array.isArray(response?.data) ? response.data : [];
  const item = list.find((j) => j.id === id);

  if (!item) {
    throw new Error("Data jalur PPDB tidak ditemukan.");
  }

  return {
    success: true,
    data: item,
  };
}

export async function createJalurPpdb(
  payload: JalurPpdbPayload
): Promise<JalurPpdbResponse> {
  if (!payload?.nama?.trim()) {
    throw new Error("Nama jalur PPDB wajib diisi.");
  }

  const kuotaNum = Number(payload.kuota);
  if (!Number.isFinite(kuotaNum) || kuotaNum <= 0) {
    throw new Error("Kuota jalur PPDB wajib berupa angka minimal 1.");
  }

  const cleanPayload: Record<string, unknown> = {
    nama: payload.nama.trim(),
    kategori: payload.kategori || "reguler",
    kuota: Math.floor(kuotaNum),
    status: payload.status || "aktif",
  };

  if (payload.deskripsi !== undefined) {
    cleanPayload.deskripsi = payload.deskripsi.trim() || undefined;
  }

  if (payload.metodeRanking) {
    cleanPayload.metodeRanking = payload.metodeRanking;
  }

  if (payload.jarakMaksimalKm !== undefined) {
    cleanPayload.jarakMaksimalKm =
      payload.jarakMaksimalKm === null || payload.jarakMaksimalKm === undefined
        ? null
        : Number(payload.jarakMaksimalKm);
  }

  if (payload.nilaiMinimal !== undefined) {
    cleanPayload.nilaiMinimal =
      payload.nilaiMinimal === null || payload.nilaiMinimal === undefined
        ? null
        : Number(payload.nilaiMinimal);
  }

  if (Array.isArray(payload.berkasWajib) && payload.berkasWajib.length > 0) {
    cleanPayload.berkasWajib = payload.berkasWajib;
  }

  if (payload.tanggalMulai) {
    cleanPayload.tanggalMulai = new Date(payload.tanggalMulai).toISOString();
  }

  if (payload.tanggalSelesai) {
    cleanPayload.tanggalSelesai = new Date(payload.tanggalSelesai).toISOString();
  }

  return apiFetch(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(cleanPayload),
  });
}

export async function updateJalurPpdb(
  id: string,
  payload: Partial<JalurPpdbPayload>
): Promise<JalurPpdbResponse> {
  if (!id) {
    throw new Error("ID jalur PPDB tidak ditemukan.");
  }

  const cleanPayload: Record<string, unknown> = {};

  if (payload.nama !== undefined) {
    if (!payload.nama.trim()) {
      throw new Error("Nama jalur PPDB wajib diisi.");
    }
    cleanPayload.nama = payload.nama.trim();
  }

  if (payload.kategori !== undefined) {
    cleanPayload.kategori = payload.kategori;
  }

  if (payload.kuota !== undefined) {
    const kuotaNum = Number(payload.kuota);
    if (!Number.isFinite(kuotaNum) || kuotaNum <= 0) {
      throw new Error("Kuota jalur PPDB harus berupa angka minimal 1.");
    }
    cleanPayload.kuota = Math.floor(kuotaNum);
  }

  if (payload.deskripsi !== undefined) {
    cleanPayload.deskripsi = payload.deskripsi ? payload.deskripsi.trim() : null;
  }

  if (payload.metodeRanking !== undefined) {
    cleanPayload.metodeRanking = payload.metodeRanking;
  }

  if (payload.jarakMaksimalKm !== undefined) {
    cleanPayload.jarakMaksimalKm =
      payload.jarakMaksimalKm === null || payload.jarakMaksimalKm === undefined
        ? null
        : Number(payload.jarakMaksimalKm);
  }

  if (payload.nilaiMinimal !== undefined) {
    cleanPayload.nilaiMinimal =
      payload.nilaiMinimal === null || payload.nilaiMinimal === undefined
        ? null
        : Number(payload.nilaiMinimal);
  }

  if (payload.berkasWajib !== undefined) {
    cleanPayload.berkasWajib = Array.isArray(payload.berkasWajib)
      ? payload.berkasWajib
      : [];
  }

  if (payload.tanggalMulai !== undefined) {
    cleanPayload.tanggalMulai = payload.tanggalMulai
      ? new Date(payload.tanggalMulai).toISOString()
      : null;
  }

  if (payload.tanggalSelesai !== undefined) {
    cleanPayload.tanggalSelesai = payload.tanggalSelesai
      ? new Date(payload.tanggalSelesai).toISOString()
      : null;
  }

  if (payload.status !== undefined) {
    cleanPayload.status = payload.status;
  }

  return apiFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(cleanPayload),
  });
}

export async function deleteJalurPpdb(
  id: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!id) {
    throw new Error("ID jalur PPDB tidak ditemukan.");
  }

  // Route DELETE tetap menggunakan /api/jalur-ppdb/:id sesuai ketersediaan di Backend
  return apiFetch(`/api/jalur-ppdb/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getRankingJalurPpdb(
  id: string
): Promise<{
  success: boolean;
  data: any;
  message?: string;
}> {
  if (!id) {
    throw new Error("ID jalur PPDB tidak ditemukan.");
  }

  return apiFetch(`/api/ppdb/jalur/${encodeURIComponent(id)}/ranking`, {
    method: "GET",
  });
}
