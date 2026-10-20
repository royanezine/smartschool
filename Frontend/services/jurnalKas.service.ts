
import { apiFetch } from "@/lib/api";

export interface AkunKas {
  id: string;
  kode: string;
  nama: string;
  tipe?: string;
  saldoAwal?: number | string;
  totalMasuk?: number | string;
  totalKeluar?: number | string;
  saldo?: number | string;
  status?: string;
}

export interface JurnalKas {
  id: string;
  nomorJurnal?: string;
  tanggal: string;
  jenis: "masuk" | "keluar";
  kategori: string;
  jumlah: number | string;
  keterangan?: string | null;
  sumber?: string;
  status?: string;
  akunKas?: {
    id: string;
    kode: string;
    nama: string;
  } | null;
}

export interface JurnalKasRingkasan {
  totalMasuk?: number | string;
  totalKeluar?: number | string;
  selisih?: number | string;
  totalSaldo?: number | string;
}

export interface JurnalKasMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  ringkasan?: JurnalKasRingkasan;
  meta?: JurnalKasMeta;
}

export interface JurnalKasParams {
  page?: number;
  limit?: number;
  q?: string;
  akunKasId?: string;
  jenis?: string;
  kategori?: string;
  sumber?: string;
  status?: string;
  dari?: string;
  sampai?: string;
}

export interface CreateJurnalKasPayload {
  akunKasId: string;
  tanggal: string;
  jenis: "masuk" | "keluar";
  kategori: string;
  jumlah: number;
  keterangan?: string;
}

function buildQuery(params: JurnalKasParams = {}): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "Semua"
    ) {
      query.set(key, String(value));
    }
  });

  const result = query.toString();
  return result ? `?${result}` : "";
}

// GET /api/keuangan/akun-kas
export async function getAkunKas(): Promise<ApiResponse<AkunKas[]>> {
  return apiFetch("/api/keuangan/akun-kas");
}

// GET /api/keuangan/jurnal-kas
export async function getJurnalKas(
  params: JurnalKasParams = {},
): Promise<ApiResponse<JurnalKas[]>> {
  return apiFetch(
    `/api/keuangan/jurnal-kas${buildQuery(params)}`,
  );
}

// POST /api/keuangan/jurnal-kas
export async function createJurnalKas(
  payload: CreateJurnalKasPayload,
): Promise<ApiResponse<JurnalKas>> {
  return apiFetch("/api/keuangan/jurnal-kas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// POST /api/keuangan/jurnal-kas/:id/batal
export async function batalkanJurnalKas(
  id: string,
  alasan: string,
): Promise<ApiResponse<null>> {
  return apiFetch(`/api/keuangan/jurnal-kas/${id}/batal`, {
    method: "POST",
    body: JSON.stringify({ alasan }),
  });
}
