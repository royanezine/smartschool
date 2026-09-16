import { apiFetch } from "../lib/api";

/* =========================================================
   CONFIG
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const BASE_ENDPOINT =
  "/api/v1/dashboard";

/* =========================================================
   INTERFACE
========================================================= */

export interface DashboardKehadiran {
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export interface DashboardCabang {
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
  persentaseHadir: string;
  rekapKehadiran: DashboardKehadiran;
}

export interface DashboardYayasan {
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
}

export interface DashboardData {
  cabang: DashboardCabang;
  yayasan: DashboardYayasan | null;
}

export interface DashboardResponse {
  success: boolean;
  message?: string;
  data?: DashboardData;
}

/* =========================================================
   GET TOKEN
========================================================= */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
  ];

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);

    if (value && value.trim()) {
      return value
        .trim()
        .replace(/^Bearer\s+/i, "");
    }
  }

  return null;
}

/* =========================================================
   REQUEST
========================================================= */

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  console.log(
    "[DASHBOARD API] Token:",
    token
      ? `${token.substring(0, 15)}...`
      : "TIDAK ADA"
  );

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan di browser. Silakan login kembali."
    );
  }

  const headers = new Headers(
    options.headers || {}
  );

  headers.set(
    "Accept",
    "application/json"
  );

  headers.set(
    "Authorization",
    `Bearer ${token}`
  );

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const url =
    `${API_URL}${endpoint}`;

  console.log(
    "[DASHBOARD API] Request:",
    {
      method:
        options.method || "GET",
      url,
      authorization:
        "Bearer ********",
    }
  );

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error(
      "[DASHBOARD API] Network Error:",
      error
    );

    throw new Error(
      "Tidak dapat terhubung ke backend. Pastikan server berjalan di http://localhost:5000."
    );
  }

  const rawText =
    await response.text();

  console.log(
    "[DASHBOARD API] Response:",
    {
      status:
        response.status,
      statusText:
        response.statusText,
      url,
      body:
        rawText.substring(
          0,
          500
        ),
    }
  );

  let result: any = null;

  if (rawText.trim()) {
    try {
      result =
        JSON.parse(rawText);
    } catch (error) {
      console.error(
        "[DASHBOARD API] Response bukan JSON:",
        {
          status:
            response.status,
          url,
          body:
            rawText.substring(
              0,
              500
            ),
        }
      );

      throw new Error(
        `Server mengembalikan response bukan JSON (${response.status}).`
      );
    }
  }

  /* =======================================================
     ERROR HANDLING
  ======================================================= */

  if (response.status === 401) {
    throw new Error(
      result?.message ||
        "Token tidak valid atau sudah expired. Silakan login kembali."
    );
  }

  if (response.status === 403) {
    throw new Error(
      result?.message ||
        "Anda tidak memiliki akses ke dashboard."
    );
  }

  if (response.status === 404) {
    throw new Error(
      result?.message ||
        "Endpoint dashboard tidak ditemukan."
    );
  }

  if (response.status === 400) {
    throw new Error(
      result?.message ||
        "Request dashboard tidak valid."
    );
  }

  if (response.status === 500) {
    throw new Error(
      result?.message ||
        "Terjadi kesalahan pada server saat mengambil dashboard."
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `Terjadi kesalahan pada server (${response.status}).`
    );
  }

  return result as T;
}

/* =========================================================
   GET DASHBOARD SEKOLAH
========================================================= */

export async function getDashboardSekolah(): Promise<DashboardResponse> {
  return request<DashboardResponse>(
    BASE_ENDPOINT,
    {
      method: "GET",
    }
  );
}