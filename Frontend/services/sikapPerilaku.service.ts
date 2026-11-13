import { apiFetch } from "../lib/api";

export interface SikapPerilakuSiswaRef {
  id: string;
  namaLengkap: string;
  nipd?: string | null;
  nisn?: string | null;
}

export interface SikapPerilakuKelasRef {
  id: string;
  nama: string;
  tingkat?: number | null;
}

export interface SikapPerilakuRecord {
  id: string;
  sekolahId?: string;
  siswaId?: string | null;
  kelasId?: string | null;
  nama: string;
  kelas?: string | null;
  jenis: "Positif" | "Negatif" | "Netral" | string;
  catatan: string;
  poin: number;
  tanggal: string;
  dibuatPada?: string;
  diperbaruiPada?: string;
  siswa?: SikapPerilakuSiswaRef | null;
  kelasRel?: SikapPerilakuKelasRef | null;
}

export interface SikapPerilakuQuery {
  jenis?: string;
  kelasId?: string;
  siswaId?: string;
  search?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
}

export interface SikapPerilakuPayload {
  siswaId?: string | null;
  kelasId?: string | null;
  nama?: string;
  kelas?: string | null;
  jenis: "Positif" | "Negatif" | "Netral" | string;
  catatan: string;
  poin?: number;
  tanggal: string;
}

function buildQuery(params?: SikapPerilakuQuery): string {
  if (!params) return "";
  const query = new URLSearchParams();

  if (params.jenis && params.jenis !== "Semua") query.set("jenis", params.jenis);
  if (params.kelasId && params.kelasId !== "Semua") query.set("kelasId", params.kelasId);
  if (params.siswaId) query.set("siswaId", params.siswaId);
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.tanggalMulai) query.set("tanggalMulai", params.tanggalMulai);
  if (params.tanggalSelesai) query.set("tanggalSelesai", params.tanggalSelesai);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function getSikapPerilaku(
  params?: SikapPerilakuQuery
): Promise<SikapPerilakuRecord[]> {
  const result = await apiFetch(`/api/sikap-perilaku${buildQuery(params)}`, {
    method: "GET",
  });

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result)) return result;
  return [];
}

export async function getSikapPerilakuById(
  id: string
): Promise<SikapPerilakuRecord> {
  const result = await apiFetch(`/api/sikap-perilaku/${id}`, {
    method: "GET",
  });
  return (result?.data ?? result) as SikapPerilakuRecord;
}

export async function createSikapPerilaku(
  payload: SikapPerilakuPayload
): Promise<SikapPerilakuRecord> {
  const result = await apiFetch("/api/sikap-perilaku", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (result?.data ?? result) as SikapPerilakuRecord;
}

export async function updateSikapPerilaku(
  id: string,
  payload: Partial<SikapPerilakuPayload>
): Promise<SikapPerilakuRecord> {
  const result = await apiFetch(`/api/sikap-perilaku/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (result?.data ?? result) as SikapPerilakuRecord;
}

export async function deleteSikapPerilaku(id: string): Promise<void> {
  await apiFetch(`/api/sikap-perilaku/${id}`, {
    method: "DELETE",
  });
}
