
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const BK_BASE_PATH = "/api/bk";


export interface SesiKonseling {
  id: string;
  sekolahId: string;

  siswaId: string;
  konselorId?: string | null;

  tanggal: string;

  waktuMulai?: string | null;
  waktuSelesai?: string | null;

  topik: string;
  masalah?: string | null;
  hasil?: string | null;
  tindakLanjut?: string | null;

  status?: string | null;
  catatan?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;

  siswa?: {
    id: string;
    namaLengkap?: string | null;
    nis?: string | null;
    nisn?: string | null;
  } | null;

  konselor?: {
    id: string;
    namaLengkap?: string | null;
    nip?: string | null;
  } | null;
}


export interface KategoriPelanggaran {
  id: string;
  sekolahId: string;

  nama: string;
  deskripsi?: string | null;

  poin: number;

  status?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}


export interface PelanggaranSiswa {
  id: string;
  sekolahId: string;

  siswaId: string;
  kategoriPelanggaranId: string;

  tanggal: string;

  kronologi?: string | null;

  poin?: number | null;

  status?: string | null;

  tindakLanjut?: string | null;

  catatan?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;

  siswa?: {
    id: string;
    namaLengkap?: string | null;
    nis?: string | null;
    nisn?: string | null;
  } | null;

  kategoriPelanggaran?: {
    id: string;
    nama: string;
    deskripsi?: string | null;
    poin: number;
    status?: string | null;
  } | null;
}


export interface AsesmenMinatBakat {
  id: string;
  sekolahId: string;

  siswaId: string;

  tanggal: string;

  jenis: string;

  minat?: string | null;

  bakat?: string | null;

  hasil?: string | null;

  rekomendasi?: string | null;

  skor?: number | null;

  status?: string | null;

  catatan?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;

  siswa?: {
    id: string;
    namaLengkap?: string | null;
    nis?: string | null;
    nisn?: string | null;
  } | null;
}


export interface CreateSesiKonselingPayload {
  siswaId: string;
  konselorId?: string | null;

  tanggal: string;

  waktuMulai?: string | null;
  waktuSelesai?: string | null;

  topik: string;

  masalah?: string | null;
  hasil?: string | null;
  tindakLanjut?: string | null;

  status?: string | null;

  catatan?: string | null;
}

export interface UpdateSesiKonselingPayload {
  siswaId?: string;
  konselorId?: string | null;

  tanggal?: string;

  waktuMulai?: string | null;
  waktuSelesai?: string | null;

  topik?: string;

  masalah?: string | null;
  hasil?: string | null;
  tindakLanjut?: string | null;

  status?: string | null;

  catatan?: string | null;
}


export interface CreateKategoriPelanggaranPayload {
  nama: string;
  deskripsi?: string | null;
  poin: number;
  status?: string | null;
}

export interface UpdateKategoriPelanggaranPayload {
  nama?: string;
  deskripsi?: string | null;
  poin?: number;
  status?: string | null;
}


export interface CreatePelanggaranSiswaPayload {
  siswaId: string;
  kategoriPelanggaranId: string;

  tanggal: string;

  kronologi?: string | null;

  poin?: number | null;

  status?: string | null;

  tindakLanjut?: string | null;

  catatan?: string | null;
}

export interface UpdatePelanggaranSiswaPayload {
  kategoriPelanggaranId?: string;

  tanggal?: string;

  kronologi?: string | null;

  poin?: number | null;

  status?: string | null;

  tindakLanjut?: string | null;

  catatan?: string | null;
}


export interface CreateAsesmenMinatBakatPayload {
  siswaId: string;

  tanggal: string;

  jenis: string;

  minat?: string | null;

  bakat?: string | null;

  hasil?: string | null;

  rekomendasi?: string | null;

  skor?: number | null;

  status?: string | null;

  catatan?: string | null;
}

export interface UpdateAsesmenMinatBakatPayload {
  siswaId?: string;

  tanggal?: string;

  jenis?: string;

  minat?: string | null;

  bakat?: string | null;

  hasil?: string | null;

  rekomendasi?: string | null;

  skor?: number | null;

  status?: string | null;

  catatan?: string | null;
}


import { getToken, getRefreshToken, clearSession } from "../lib/auth";
import { apiFetch, requestNewAccessToken } from "../lib/api";

function getHeaders(): HeadersInit {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const result = await apiFetch(endpoint, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (
      result &&
      typeof result === "object" &&
      "data" in result
    ) {
      return result.data as T;
    }

    if (
      result &&
      typeof result === "object" &&
      "result" in result
    ) {
      return result.result as T;
    }

    return result as T;
  } catch (err: any) {
    if (err?.status && /^Request gagal\.\s*Status:/i.test(err.message || "")) {
      err.message = `Request gagal dengan status ${err.status}`;
    }
    throw err;
  }
}


const KONSELING_PATH =
  `${BK_BASE_PATH}/konseling`;

export async function getSesiKonseling(): Promise<
  SesiKonseling[]
> {
  return request<SesiKonseling[]>(KONSELING_PATH, {
    method: "GET",
    cache: "no-store",
  });
}

export async function getSesiKonselingById(
  id: string
): Promise<SesiKonseling> {
  if (!id) {
    throw new Error("ID sesi konseling wajib diisi");
  }

  return request<SesiKonseling>(`${KONSELING_PATH}/${id}`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function createSesiKonseling(
  payload: CreateSesiKonselingPayload
): Promise<SesiKonseling> {
  if (!payload.siswaId) {
    throw new Error("Siswa wajib dipilih");
  }

  if (!payload.tanggal) {
    throw new Error("Tanggal wajib diisi");
  }

  if (!payload.topik) {
    throw new Error("Topik wajib diisi");
  }

  return request<SesiKonseling>(KONSELING_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSesiKonseling(
  id: string,
  payload: UpdateSesiKonselingPayload
): Promise<SesiKonseling> {
  if (!id) {
    throw new Error("ID sesi konseling wajib diisi");
  }

  return request<SesiKonseling>(`${KONSELING_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteSesiKonseling(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error("ID sesi konseling wajib diisi");
  }

  await request<any>(`${KONSELING_PATH}/${id}`, {
    method: "DELETE",
  });
}


const KATEGORI_PATH =
  `${BK_BASE_PATH}/kategori-pelanggaran`;

export async function getKategoriPelanggaran(): Promise<
  KategoriPelanggaran[]
> {
  return request<KategoriPelanggaran[]>(KATEGORI_PATH, {
    method: "GET",
    cache: "no-store",
  });
}

export async function createKategoriPelanggaran(
  payload: CreateKategoriPelanggaranPayload
): Promise<KategoriPelanggaran> {
  if (!payload.nama) {
    throw new Error("Nama kategori wajib diisi");
  }

  if (
    payload.poin === undefined ||
    payload.poin === null
  ) {
    throw new Error("Poin wajib diisi");
  }

  return request<KategoriPelanggaran>(KATEGORI_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateKategoriPelanggaran(
  id: string,
  payload: UpdateKategoriPelanggaranPayload
): Promise<KategoriPelanggaran> {
  if (!id) {
    throw new Error(
      "ID kategori pelanggaran wajib diisi"
    );
  }

  return request<KategoriPelanggaran>(`${KATEGORI_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteKategoriPelanggaran(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID kategori pelanggaran wajib diisi"
    );
  }

  await request<any>(`${KATEGORI_PATH}/${id}`, {
    method: "DELETE",
  });
}


export interface PelanggaranQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  siswaId?: string;
  kategoriId?: string;
  status?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
}

export interface PelanggaranPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalData: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type PelanggaranSiswaListResult = PelanggaranSiswa[] & {
  data: PelanggaranSiswa[];
  meta: PelanggaranPaginationMeta;
  pagination: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  totalData: number;
  totalPages: number;
  currentPage: number;
};

const PELANGGARAN_PATH =
  `${BK_BASE_PATH}/pelanggaran`;

export async function getPelanggaranSiswa(
  params?: PelanggaranQueryParams
): Promise<PelanggaranSiswaListResult> {
  const query = new URLSearchParams();
  if (params?.page !== undefined && params?.page !== null) {
    query.set("page", String(params.page));
  }
  if (params?.limit !== undefined && params?.limit !== null) {
    query.set("limit", String(params.limit));
  }
  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.siswaId) {
    query.set("siswaId", params.siswaId);
  }
  if (params?.kategoriId) {
    query.set("kategoriId", params.kategoriId);
  }
  if (params?.status) {
    query.set("status", params.status);
  }
  if (params?.tanggalMulai) {
    query.set("tanggalMulai", params.tanggalMulai);
  }
  if (params?.tanggalSelesai) {
    query.set("tanggalSelesai", params.tanggalSelesai);
  }

  const qs = query.toString();
  const endpoint = qs
    ? `${PELANGGARAN_PATH}?${qs}`
    : PELANGGARAN_PATH;

  let result: any = null;
  try {
    result = await apiFetch(endpoint, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    });
  } catch (err: any) {
    if (err?.status && /^Request gagal\.\s*Status:/i.test(err.message || "")) {
      err.message = `Request gagal dengan status ${err.status}`;
    }
    throw err;
  }

  const rawData: PelanggaranSiswa[] = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result)
    ? result
    : [];

  const rawMeta = result?.meta || {};
  const rawPagination = result?.pagination || {};

  const totalData = Number(
    rawMeta.totalData ??
    rawMeta.total ??
    rawPagination.totalData ??
    result?.totalData ??
    rawData.length
  );

  const limit = Number(
    rawMeta.limit ??
    rawPagination.limit ??
    params?.limit ??
    10
  );

  const totalPages = Number(
    rawMeta.totalPages ??
    rawPagination.totalPages ??
    result?.totalPages ??
    (totalData > 0 ? Math.ceil(totalData / limit) : 1)
  );

  const currentPage = Number(
    rawMeta.currentPage ??
    rawMeta.page ??
    rawPagination.currentPage ??
    result?.currentPage ??
    params?.page ??
    1
  );

  const meta: PelanggaranPaginationMeta = {
    page: currentPage,
    limit,
    total: totalData,
    totalData,
    totalPages,
    currentPage,
    hasNext: Boolean(
      rawMeta.hasNext ??
      rawPagination.hasNext ??
      (currentPage < totalPages)
    ),
    hasPrev: Boolean(
      rawMeta.hasPrev ??
      rawPagination.hasPrev ??
      (currentPage > 1)
    ),
  };

  const pagination = {
    totalData,
    totalPages,
    currentPage,
    limit,
    hasNext: meta.hasNext,
    hasPrev: meta.hasPrev,
  };

  const list = [...rawData] as PelanggaranSiswaListResult;
  list.data = rawData;
  list.meta = meta;
  list.pagination = pagination;
  list.totalData = totalData;
  list.totalPages = totalPages;
  list.currentPage = currentPage;

  return list;
}

export interface PelanggaranExportParams {
  search?: string;
  siswaId?: string;
  kategoriId?: string;
  status?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
}

export interface PelanggaranExportResult {
  blob: Blob;
  filename: string;
}

export function extractFilenameFromDisposition(
  disposition: string | null | undefined,
  fallbackFilename: string
): string {
  if (!disposition || typeof disposition !== "string") {
    return fallbackFilename;
  }

  // 1. Try RFC 5987/6266 utf-8 filename*
  const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      const decoded = decodeURIComponent(utf8Match[1].trim());
      const clean = decoded.replace(/^["']|["']$/g, "").trim();
      if (clean && clean !== "undefined" && clean !== "null" && clean !== "[object Object]") {
        return clean;
      }
    } catch {
      // ignore decode error
    }
  }

  // 2. Try standard filename="..." or filename=...
  const match = disposition.match(/filename\s*=\s*(?:"([^"]+)"|'([^']+)'|([^;\s]+))/i);
  const found = match?.[1] || match?.[2] || match?.[3];
  if (found) {
    const clean = found.trim().replace(/^["']|["']$/g, "").trim();
    if (clean && clean !== "undefined" && clean !== "null" && clean !== "[object Object]") {
      return clean;
    }
  }

  return fallbackFilename;
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || !blob) {
    return;
  }
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "download";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    try {
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore revoke error
    }
  }, 100);
}

function getExportHeaders(type: "excel" | "pdf"): HeadersInit {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept:
      type === "excel"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream"
        : "application/pdf, application/octet-stream",
  };
}

async function exportPelanggaranBlob(
  type: "excel" | "pdf",
  params?: PelanggaranExportParams
): Promise<PelanggaranExportResult> {
  const query = new URLSearchParams();
  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.siswaId) {
    query.set("siswaId", params.siswaId);
  }
  if (params?.kategoriId) {
    query.set("kategoriId", params.kategoriId);
  }
  if (params?.status) {
    query.set("status", params.status);
  }
  if (params?.tanggalMulai) {
    query.set("tanggalMulai", params.tanggalMulai);
  }
  if (params?.tanggalSelesai) {
    query.set("tanggalSelesai", params.tanggalSelesai);
  }

  const qs = query.toString();
  const subPath = type === "excel" ? "export/excel" : "export/pdf";
  const primaryPath = `${PELANGGARAN_PATH}/${subPath}`;
  const url = qs
    ? `${API_URL}${primaryPath}?${qs}`
    : `${API_URL}${primaryPath}`;

  let headers = getExportHeaders(type);

  let response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (response.status === 401) {
    if (getRefreshToken()) {
      let newAccessToken: string | null = null;
      try {
        newAccessToken = await requestNewAccessToken();
      } catch {
        clearSession();
      }

      if (newAccessToken) {
        headers = {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        response = await fetch(url, {
          method: "GET",
          headers,
          cache: "no-store",
        });
        if (response.status === 401) {
          clearSession();
        }
      }
    } else {
      clearSession();
    }
  }

  // Fallback jika backend me-mount tanpa prefix /bk
  if (response.status === 404 && url.includes("/api/bk/pelanggaran/")) {
    const fallbackUrl = url.replace("/api/bk/pelanggaran/", "/api/pelanggaran/");
    try {
      const fallbackResponse = await fetch(fallbackUrl, {
        method: "GET",
        headers,
        cache: "no-store",
      });
      if (fallbackResponse.ok) {
        response = fallbackResponse;
      }
    } catch {
      // tetap gunakan response awal
    }
  }

  if (!response.ok) {
    let errorMessage = `Gagal mengekspor data ${type.toUpperCase()} (Status: ${response.status})`;

    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errorJson = await response.json();
        errorMessage = errorJson?.message || errorJson?.error || errorMessage;
      } else {
        const text = await response.text();
        if (text && text.trim() && !/<[a-z][\s\S]*>/i.test(text)) {
          errorMessage = text.trim();
        }
      }
    } catch {
      // gunakan message default
    }

    if (response.status === 401) {
      errorMessage = "Sesi login tidak valid atau telah berakhir. Silakan login kembali.";
    } else if (response.status === 403) {
      errorMessage = "Anda tidak memiliki hak akses untuk mengekspor data pelanggaran.";
    } else if (response.status === 404) {
      errorMessage = `Layanan export ${type.toUpperCase()} tidak ditemukan di server.`;
    }

    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const errorJson = await response.json();
    if (!errorJson?.success && !errorJson?.sukses) {
      const msg = errorJson?.message || errorJson?.pesan || `Gagal mengekspor data ${type.toUpperCase()}`;
      throw new Error(msg);
    }
  }

  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error(`File ${type.toUpperCase()} yang diterima dari server kosong.`);
  }

  const fallbackExt = type === "excel" ? "xlsx" : "pdf";
  const fallbackFilename = `daftar_pelanggaran.${fallbackExt}`;
  const disposition = response.headers.get("content-disposition");
  const filename = extractFilenameFromDisposition(disposition, fallbackFilename);

  return { blob, filename };
}

export async function exportPelanggaranExcel(
  params?: PelanggaranExportParams
): Promise<PelanggaranExportResult> {
  return exportPelanggaranBlob("excel", params);
}

export async function exportPelanggaranPdf(
  params?: PelanggaranExportParams
): Promise<PelanggaranExportResult> {
  return exportPelanggaranBlob("pdf", params);
}

export async function createPelanggaranSiswa(
  payload: CreatePelanggaranSiswaPayload
): Promise<PelanggaranSiswa> {
  if (!payload.siswaId) {
    throw new Error("Siswa wajib dipilih");
  }

  if (!payload.kategoriPelanggaranId) {
    throw new Error(
      "Kategori pelanggaran wajib dipilih"
    );
  }

  if (!payload.tanggal) {
    throw new Error("Tanggal wajib diisi");
  }

  return request<PelanggaranSiswa>(PELANGGARAN_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePelanggaranSiswa(
  id: string,
  payload: UpdatePelanggaranSiswaPayload
): Promise<PelanggaranSiswa> {
  if (!id) {
    throw new Error(
      "ID pelanggaran wajib diisi"
    );
  }

  return request<PelanggaranSiswa>(`${PELANGGARAN_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePelanggaranSiswa(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID pelanggaran wajib diisi"
    );
  }

  await request<any>(`${PELANGGARAN_PATH}/${id}`, {
    method: "DELETE",
  });
}


const ASESMEN_PATH =
  `${BK_BASE_PATH}/asesmen-minat-bakat`;

export async function getAsesmenMinatBakat(): Promise<
  AsesmenMinatBakat[]
> {
  return request<AsesmenMinatBakat[]>(ASESMEN_PATH, {
    method: "GET",
    cache: "no-store",
  });
}

export async function createAsesmenMinatBakat(
  payload: CreateAsesmenMinatBakatPayload
): Promise<AsesmenMinatBakat> {
  if (!payload.siswaId) {
    throw new Error("Siswa wajib dipilih");
  }

  if (!payload.tanggal) {
    throw new Error("Tanggal wajib diisi");
  }

  if (!payload.jenis) {
    throw new Error("Jenis asesmen wajib diisi");
  }

  return request<AsesmenMinatBakat>(ASESMEN_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAsesmenMinatBakat(
  id: string,
  payload: UpdateAsesmenMinatBakatPayload
): Promise<AsesmenMinatBakat> {
  if (!id) {
    throw new Error(
      "ID asesmen wajib diisi"
    );
  }

  return request<AsesmenMinatBakat>(`${ASESMEN_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAsesmenMinatBakat(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID asesmen wajib diisi"
    );
  }

  await request<any>(`${ASESMEN_PATH}/${id}`, {
    method: "DELETE",
  });
}


export type AjukanSesiKonselingPayload = {
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  topik: string;
  masalah?: string;
  konselorId?: string;
};

export async function ajukanSesiKonseling(
  payload: AjukanSesiKonselingPayload,
) {
  if (!payload.tanggal || !payload.waktuMulai || !payload.waktuSelesai) {
    throw new Error("Tanggal dan waktu konseling wajib diisi.");
  }

  if (!payload.topik) {
    throw new Error("Topik konseling wajib dipilih.");
  }

  return request("/api/bk/konseling/ajukan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function putuskanPengajuanKonseling(
  id: string,
  payload: {
    keputusan: "setujui" | "tolak";
    konselorId?: string;
    catatan?: string;
  }
) {
  return request(`/api/bk/konseling/${id}/keputusan`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function batalkanPengajuanKonseling(id: string): Promise<any> {
  if (!id) {
    throw new Error("ID pengajuan konseling wajib diisi");
  }

  return request(`/api/bk/konseling/${encodeURIComponent(id)}/batal`, {
    method: "PUT",
  });
}

export const batalKonseling = batalkanPengajuanKonseling;
