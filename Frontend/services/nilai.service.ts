import { apiFetch } from "../lib/api";
import { getToken } from "../lib/auth";

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const API_BASE = (() => {
  const base = RAW_API_BASE.replace(/\/+$/, "");

  if (base.endsWith("/api")) {
    return base;
  }

  return `${base}/api`;
})();


export interface ExportRekapNilaiParams {
  kelasId?: string;
  kelasMapelId?: string;
}

export interface KomponenNilaiItem {
  id: string;
  nama: string;
  jenis?: string;
  bobot: number;
  nilaiMaksimum?: number;
  kelompok?: string;
}

export interface KomponenNilaiResponse {
  kelasMapelId: string;
  status: "final" | "draft";
  totalBobot: number;
  sisaBobot: number;
  komponen: KomponenNilaiItem[];
}

export interface KelasMapelNilaiItem {
  kelasMapelId: string;
  kelasId: string;
  kelas: {
    id: string;
    nama: string;
    tingkat?: number;
    tahunAjaranId?: string;
  };
  mataPelajaran: {
    id: string;
    nama: string;
    kode?: string;
  };
  status: "final" | "draft";
  _count?: {
    siswa?: number;
    komponen?: number;
  };
}

export interface CreateKomponenNilaiPayload {
  kelasMapelId: string;
  nama: string;
  jenis?: string;
  bobot: number;
  nilaiMaksimum?: number;
  kelompok?: string;
}

export interface TarikSumberNilaiPayload {
  kelasMapelId: string;
  komponenNilaiId: string;
  jenisSumber: "asesmen" | "tugas";
  sumberId: string;
}

export interface InputNilaiBulkPayload {
  kelasMapelId: string;
  nilai: Array<{
    penggunaId: string;
    komponenNilaiId: string;
    nilai: number;
  }>;
}


export async function getNilaiKelasSaya(): Promise<KelasMapelNilaiItem[]> {
  const result = await apiFetch("/api/nilai/kelas-saya", {
    method: "GET",
  });

  return Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result)
      ? result
      : [];
}


export async function getKomponenNilai(
  kelasMapelId: string
): Promise<KomponenNilaiResponse> {
  if (!kelasMapelId) {
    throw new Error("kelasMapelId wajib diisi");
  }

  const result = await apiFetch(
    `/api/nilai/komponen/${encodeURIComponent(kelasMapelId)}`,
    {
      method: "GET",
    }
  );

  return result?.data || result;
}


export async function createKomponenNilai(
  payload: CreateKomponenNilaiPayload
): Promise<any> {
  const result = await apiFetch("/api/nilai/komponen", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result?.data || result;
}


export async function getGridNilai(kelasMapelId: string): Promise<any> {
  if (!kelasMapelId) {
    throw new Error("kelasMapelId wajib diisi");
  }

  const result = await apiFetch(
    `/api/nilai/input/${encodeURIComponent(kelasMapelId)}`,
    {
      method: "GET",
    }
  );

  return result?.data || result;
}


export async function inputNilaiBulk(
  payload: InputNilaiBulkPayload
): Promise<any> {
  const result = await apiFetch("/api/nilai/input/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result?.data || result;
}


export async function finalisasiNilai(kelasMapelId: string): Promise<any> {
  if (!kelasMapelId) {
    throw new Error("kelasMapelId wajib diisi");
  }

  const result = await apiFetch(
    `/api/nilai/finalisasi/${encodeURIComponent(kelasMapelId)}`,
    {
      method: "POST",
    }
  );

  return result?.data || result;
}


export async function tarikSumberNilai(
  payload: TarikSumberNilaiPayload
): Promise<any> {
  const result = await apiFetch("/api/nilai/tarik-sumber", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result?.data || result;
}


export async function exportRekapNilai(
  params: ExportRekapNilaiParams = {}
): Promise<Blob> {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const searchParams = new URLSearchParams();

  if (params.kelasId) {
    searchParams.set("kelasId", params.kelasId);
  }

  if (params.kelasMapelId) {
    searchParams.set(
      "kelasMapelId",
      params.kelasMapelId
    );
  }

  const query = searchParams.toString();

  const url =
    `${API_BASE}/nilai/export` +
    (query ? `?${query}` : "");

  console.log("[NILAI API] Export Request:", {
    method: "GET",
    url,
    hasToken: Boolean(token),
  });

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error(
      "[NILAI API] Network Error:",
      error
    );

    throw new Error(
      "Tidak dapat terhubung ke backend. Pastikan server berjalan di http://localhost:5000."
    );
  }

  console.log("[NILAI API] Export Response:", {
    status: response.status,
    statusText: response.statusText,
    url,
    contentType:
      response.headers.get("content-type"),
  });

  if (!response.ok) {
    let message =
      `Gagal mengekspor rekap nilai (${response.status}).`;

    const contentType =
      response.headers.get("content-type");

    try {
      if (
        contentType?.includes(
          "application/json"
        )
      ) {
        const result =
          await response.json();

        message =
          result?.message ||
          result?.error ||
          message;
      } else {
        const text =
          await response.text();

        if (text.trim()) {
          message = text.trim();
        }
      }
    } catch {
    }

    if (response.status === 401) {
      throw new Error(
        message ||
          "Sesi login tidak valid. Silakan login kembali."
      );
    }

    if (response.status === 403) {
      throw new Error(
        message ||
          "Anda tidak memiliki akses untuk mengekspor rekap nilai."
      );
    }

    if (response.status === 404) {
      throw new Error(
        message ||
          "Endpoint export rekap nilai tidak ditemukan."
      );
    }

    throw new Error(message);
  }

  const blob =
    await response.blob();

  if (blob.size === 0) {
    throw new Error(
      "File rekap nilai yang diterima dari backend kosong."
    );
  }

  return blob;
}


export function downloadRekapNilai(
  blob: Blob,
  filename = "rekap-nilai.xlsx"
): void {
  if (typeof window === "undefined") {
    return;
  }

  const objectUrl =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    objectUrl
  );
}


