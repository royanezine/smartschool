import { apiFetch } from "@/lib/api";

export interface PengaturanItem {
  id?: string;
  sekolahId?: string;
  kunci: string;
  nilai: string;
  tipeData?: string;
  kelompok?: string;
  keterangan?: string | null;
}

export async function getPengaturan(params?: { sekolahId?: string }): Promise<any> {
  const qs = params?.sekolahId ? `?sekolahId=${encodeURIComponent(params.sekolahId)}` : "";
  return apiFetch(`/api/pengaturan${qs}`);
}

export async function upsertPengaturan(payload: {
  kunci: string;
  nilai: string;
  tipeData?: string;
  kelompok?: string;
  keterangan?: string;
  sekolahId?: string;
}): Promise<any> {
  return apiFetch("/api/pengaturan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getKkm(): Promise<any> {
  return apiFetch("/api/pengaturan/kkm");
}

export async function setKkm(nilai: number): Promise<any> {
  return apiFetch("/api/pengaturan/kkm", {
    method: "POST",
    body: JSON.stringify({ nilai }),
  });
}

export interface HariAktifData {
  hariAktif: number[];
}

export interface HariAktifResponse {
  success: boolean;
  message: string;
  data: HariAktifData;
}

export interface UpdateHariAktifPayload {
  hariAktif: number[];
}

export async function getHariAktif(): Promise<HariAktifResponse> {
  return apiFetch("/api/pengaturan/hari-aktif");
}

export async function updateHariAktif(
  payload: UpdateHariAktifPayload
): Promise<HariAktifResponse> {
  return apiFetch("/api/pengaturan/hari-aktif", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export interface MataPelajaranAgregatItem {
  mataPelajaranId: string;
  tugas: number;
  uts: number;
  uas: number;
  praktik: number;
  kkm: number;
}

export interface AgregatRaporData {
  tahunAjaranId: string;
  mataPelajaran: MataPelajaranAgregatItem[];
}

export interface AgregatRaporResponse {
  success: boolean;
  message: string;
  data: AgregatRaporData;
}

export interface UpdateAgregatRaporPayload {
  tahunAjaranId: string;
  mataPelajaran: MataPelajaranAgregatItem[];
}

export async function getAgregatRapor(
  tahunAjaranId: string
): Promise<AgregatRaporResponse> {
  const qs = tahunAjaranId
    ? `?tahunAjaranId=${encodeURIComponent(tahunAjaranId)}`
    : "";
  return apiFetch(`/api/pengaturan/agregat-rapor${qs}`);
}

export async function updateAgregatRapor(
  payload: UpdateAgregatRaporPayload
): Promise<AgregatRaporResponse> {
  return apiFetch("/api/pengaturan/agregat-rapor", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
