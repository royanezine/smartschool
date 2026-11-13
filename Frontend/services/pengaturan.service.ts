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

export interface PengaturanGlobalIdentitas {
  namaAplikasi: string;
  emailDukungan: string | null;
  teleponDukungan: string | null;
  logoUrl: string | null;
}

export interface PengaturanGlobalPendaftaran {
  pendaftaranDibuka: boolean;
  durasiUjiCobaHari: number;
}

export interface PengaturanGlobalPemeliharaan {
  aktif: boolean;
  pesan: string | null;
}

export interface PengaturanGlobalSemua {
  identitas: PengaturanGlobalIdentitas;
  pendaftaran: PengaturanGlobalPendaftaran;
  pemeliharaan: PengaturanGlobalPemeliharaan;
}

export interface PengaturanGlobalPublik {
  identitas: PengaturanGlobalIdentitas;
  pemeliharaan: PengaturanGlobalPemeliharaan;
}

export async function getPengaturanGlobalPublik(): Promise<{
  success: boolean;
  message: string;
  data: PengaturanGlobalPublik;
}> {
  return apiFetch("/api/pengaturan/global/publik");
}

export async function getPengaturanGlobalSemua(): Promise<{
  success: boolean;
  message: string;
  data: PengaturanGlobalSemua;
}> {
  return apiFetch("/api/pengaturan/global/semua");
}

export async function updatePengaturanGlobal(
  kelompok: "identitas" | "pendaftaran" | "pemeliharaan",
  payload: Record<string, unknown>
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> {
  return apiFetch(`/api/pengaturan/global/${kelompok}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
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

export interface KkmConfig {
  kkmDefault: number;
  kkmPerMapel?: Record<string, number>;
}

export async function getKkm(): Promise<{
  success: boolean;
  message: string;
  data: KkmConfig;
}> {
  return apiFetch("/api/pengaturan/kkm");
}

export async function setKkm(payload: KkmConfig): Promise<{
  success: boolean;
  message: string;
  data: KkmConfig;
}> {
  return apiFetch("/api/pengaturan/kkm", {
    method: "POST",
    body: JSON.stringify(payload),
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

export interface PengaturanPresensiSekolah {
  lintang: number | null;
  bujur: number | null;
  radiusAbsensi: number | null;
  metodeAbsensiAktif: ("barcode" | "lokasi" | "face")[];
}

export interface PengaturanPresensiResponse {
  success: boolean;
  message: string;
  data: PengaturanPresensiSekolah;
}

export interface UpdatePengaturanPresensiPayload {
  lintang?: number;
  bujur?: number;
  radiusAbsensi?: number;
  metodeAbsensiAktif?: ("barcode" | "lokasi" | "face")[];
}

export async function getPengaturanPresensiSekolah(
  sekolahId?: string
): Promise<PengaturanPresensiResponse> {
  const qs = sekolahId ? `?sekolahId=${encodeURIComponent(sekolahId)}` : "";
  return apiFetch(`/api/sekolah/pengaturan-presensi${qs}`);
}

export async function updatePengaturanPresensiSekolah(
  payload: UpdatePengaturanPresensiPayload,
  sekolahId?: string
): Promise<PengaturanPresensiResponse> {
  const qs = sekolahId ? `?sekolahId=${encodeURIComponent(sekolahId)}` : "";
  return apiFetch(`/api/sekolah/pengaturan-presensi${qs}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
