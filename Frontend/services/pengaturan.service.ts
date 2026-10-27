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
