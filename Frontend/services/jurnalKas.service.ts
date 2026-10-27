
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
  akunKasId?: string;
  nomorJurnal?: string;
  tanggal: string;
  jenis: "masuk" | "keluar";
  kategori: string;
  jumlah: number | string;
  keterangan?: string | null;
  sumber?: string;
  sumberId?: string | null;
  status?: string;
  dibuatPada?: string;
  diperbaruiPada?: string;
  akunKas?: {
    id: string;
    kode: string;
    nama: string;
  } | null;
}

export interface LaporanKas {
  periode: { dari: string; sampai: string };
  saldoAwal: number | string;
  totalMasuk: number | string;
  totalKeluar: number | string;
  saldoAkhir: number | string;
  jumlahTransaksi: number;
  perKategori: Array<{
    kategori: string;
    jenis: "masuk" | "keluar";
    total: number | string;
    jumlah: number;
  }>;
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

export async function getAkunKas(): Promise<ApiResponse<AkunKas[]>> {
  return apiFetch("/api/keuangan/akun-kas");
}

export async function createAkunKas(payload: {
  kode: string;
  nama: string;
  tipe?: string;
  saldoAwal?: number | string;
}): Promise<ApiResponse<AkunKas>> {
  return apiFetch("/api/keuangan/akun-kas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAkunKas(
  id: string,
  payload: {
    nama?: string;
    tipe?: string;
    status?: string;
    saldoAwal?: number | string;
  },
): Promise<ApiResponse<AkunKas>> {
  return apiFetch(`/api/keuangan/akun-kas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAkunKas(
  id: string,
): Promise<ApiResponse<null>> {
  return apiFetch(`/api/keuangan/akun-kas/${id}`, {
    method: "DELETE",
  });
}


export async function getJurnalKas(
  params: JurnalKasParams = {},
): Promise<ApiResponse<JurnalKas[]>> {
  return apiFetch(
    `/api/keuangan/jurnal-kas${buildQuery(params)}`,
  );
}

export async function createJurnalKas(
  payload: CreateJurnalKasPayload,
): Promise<ApiResponse<JurnalKas>> {
  return apiFetch("/api/keuangan/jurnal-kas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function batalkanJurnalKas(
  id: string,
  alasan: string,
): Promise<ApiResponse<null>> {
  return apiFetch(`/api/keuangan/jurnal-kas/${id}/batal`, {
    method: "POST",
    body: JSON.stringify({ alasan }),
  });
}

export async function getLaporanKas(
  params: { dari: string; sampai: string; akunKasId?: string },
): Promise<ApiResponse<LaporanKas>> {
  return apiFetch(`/api/keuangan/laporan-kas${buildQuery(params)}`);
}

/**
 * There is no GET /jurnal-kas/:id endpoint. Walk the paginated list
 * (limit is capped at 100 by the backend) until the record is found.
 */
export async function getJurnalKasById(
  id: string,
): Promise<JurnalKas | null> {
  if (!id) return null;

  const limit = 100;
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getJurnalKas({ page, limit });
    const found = (response.data || []).find(
      (item) => String(item.id) === String(id),
    );

    if (found) return found;

    totalPages = response.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 100);

  return null;
}
