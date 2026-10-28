
import { getToken } from "../lib/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_ROOT = /\/api$/i.test(API_BASE_URL)
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

const TABUNGAN_URL = `${API_ROOT}/keuangan/tabungan`;


export type JenisTabungan = "setor" | "tarik";

export interface SiswaTabungan {
  id: string;
  namaLengkap: string;
  nis: string | null;
  nisn: string | null;
}

export interface TabunganSiswa {
  id: string;
  sekolahId: string;
  siswaId: string;
  saldo: string | number;
  status: string;
  dibuatPada?: string;
  diperbaruiPada?: string;
  siswa: SiswaTabungan;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TabunganListResponse {
  success: boolean;
  message: string;
  data: TabunganSiswa[];
  ringkasan: {
    totalSaldo: string | number;
  };
  meta: PaginationMeta;
}

export interface DetailTabunganResponse {
  siswa: SiswaTabungan;
  saldo: string | number;
  status: string;
  tabunganId: string | null;
}

export interface MutasiTabungan {
  id: string;
  sekolahId: string;
  tabunganSiswaId: string;
  akunKasId: string;
  petugasId: string;
  nomorTransaksi: string;
  jenis: JenisTabungan;
  jumlah: string | number;
  saldoSebelum: string | number;
  saldoSesudah: string | number;
  tanggal: string;
  keterangan?: string | null;
  status: string;
  dibuatPada?: string;
  petugas?: {
    id: string;
    namaLengkap: string;
  };
}

export interface MutasiListResponse {
  success: boolean;
  message: string;
  data: MutasiTabungan[];
  meta: PaginationMeta;
}

export interface LaporanTabungan {
  totalSetoran: string | number;
  jumlahSetoran: number;
  totalPenarikan: string | number;
  jumlahPenarikan: number;
  totalSaldoSemuaSiswa: string | number;
  jumlahRekening: number;
}

export interface TransaksiTabunganPayload {
  siswaId: string;
  akunKasId: string;
  jumlah: number;
  tanggal?: string;
  keterangan?: string;
}

export interface TabunganQuery {
  page?: number;
  limit?: number;
  q?: string;
  kelasId?: string;
}

export interface MutasiQuery {
  page?: number;
  limit?: number;
  jenis?: JenisTabungan;
  dari?: string;
  sampai?: string;
}

export interface LaporanTabunganQuery {
  dari?: string;
  sampai?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof window !== "undefined") {
    const token = getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[Tabungan Service] Koneksi Backend gagal:", error);

    throw new Error(
      "Tidak dapat terhubung ke Backend SmartSchool. Pastikan Backend berjalan di port 5000.",
    );
  }

  let result: any;
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();

      result = {
        success: false,
        message: text || `HTTP ${response.status}`,
      };
    }
  } catch {
    throw new Error(
      `Respons Backend tidak dapat dibaca. HTTP ${response.status}.`,
    );
  }

  if (!response.ok || result?.success === false) {
    console.error("[Tabungan Service] Request gagal:", {
      url,
      status: response.status,
      response: result,
    });

    throw new Error(
      result?.message ||
        `Permintaan gagal dengan status HTTP ${response.status}.`,
    );
  }

  return result as T;
}

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}


export async function getTabungan(
  params: TabunganQuery = {},
): Promise<TabunganListResponse> {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    q: params.q,
    kelasId: params.kelasId,
  });

  return apiFetch<TabunganListResponse>(
    `${TABUNGAN_URL}${query}`,
  );
}


export async function getDetailTabungan(
  siswaId: string,
): Promise<DetailTabunganResponse> {
  if (!siswaId?.trim()) {
    throw new Error("ID siswa wajib diisi.");
  }

  const response = await apiFetch<
    ApiResponse<DetailTabunganResponse>
  >(
    `${TABUNGAN_URL}/siswa/${encodeURIComponent(siswaId)}`,
  );

  return response.data;
}


export async function getMutasiTabungan(
  siswaId: string,
  params: MutasiQuery = {},
): Promise<MutasiListResponse> {
  if (!siswaId?.trim()) {
    throw new Error("ID siswa wajib diisi.");
  }

  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    jenis: params.jenis,
    dari: params.dari,
    sampai: params.sampai,
  });

  return apiFetch<MutasiListResponse>(
    `${TABUNGAN_URL}/siswa/${encodeURIComponent(siswaId)}/mutasi${query}`,
  );
}


export async function getLaporanTabungan(
  params: LaporanTabunganQuery = {},
): Promise<LaporanTabungan> {
  const query = buildQuery({
    dari: params.dari,
    sampai: params.sampai,
  });

  const response = await apiFetch<
    ApiResponse<LaporanTabungan>
  >(`${TABUNGAN_URL}/laporan${query}`);

  return response.data;
}


function validateTransaksi(
  payload: TransaksiTabunganPayload,
): void {
  if (!payload.siswaId?.trim()) {
    throw new Error("ID siswa wajib diisi.");
  }

  if (!payload.akunKasId?.trim()) {
    throw new Error("ID akun kas wajib diisi.");
  }

  if (
    !Number.isFinite(payload.jumlah) ||
    payload.jumlah <= 0
  ) {
    throw new Error("Jumlah transaksi harus lebih dari 0.");
  }
}


export async function setorTabungan(
  payload: TransaksiTabunganPayload,
): Promise<unknown> {
  validateTransaksi(payload);

  const response = await apiFetch<ApiResponse<unknown>>(
    `${TABUNGAN_URL}/setor`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}


export async function tarikTabungan(
  payload: TransaksiTabunganPayload,
): Promise<unknown> {
  validateTransaksi(payload);

  const response = await apiFetch<ApiResponse<unknown>>(
    `${TABUNGAN_URL}/tarik`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function cariSiswaTabungan(
  q: string,
  limit = 10,
): Promise<ApiResponse<Array<{
  id: string;
  nama: string;
  kelas: {
    id: string;
    nama: string;
    tingkat: number | null;
  } | null;
}>>> {
  const keyword = q.trim();

  if (keyword.length < 2) {
    throw new Error("Kata kunci minimal 2 karakter.");
  }

  const query = buildQuery({
    q: keyword,
    limit,
  });

  return apiFetch(
    `${TABUNGAN_URL}/cari-siswa${query}`,
  );
}
