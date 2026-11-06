
import { getToken as getAuthToken } from "../lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const BASE_ENDPOINT = "/api/jadwal-mengajar";

export interface RuanganRef {
  id: string;
  nama: string;
  lokasi?: string | null;
}

export interface JadwalMengajar {
  id: string;
  kelasMapelId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;

  // Foreign key relasi master ruangan
  ruanganId?: string | null;

  // Nama ruangan untuk kompatibilitas data lama
  ruangan?: string | null;

  // Hasil include relasi Backend
  ruanganRef?: RuanganRef | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;

  kelasMapel?: {
    id: string;
    kelasId: string;
    mataPelajaranId: string;
    guruPengajarId: string;
    status?: string | null;

    kelas?: {
      id: string;
      nama: string;
      tingkat?: number | null;
      sekolahId?: string;
    };

    mataPelajaran?: {
      id: string;
      nama: string;
      kode?: string | null;
      sekolahId?: string;
    };

    guruPengajar?: {
      id: string;
      namaLengkap: string;
      email?: string | null;
      nip?: string | null;
    };
  };
}

export interface JadwalMengajarResponse {
  success: boolean;
  message?: string;
  data?: JadwalMengajar[];
}

export interface JadwalMengajarDetailResponse {
  success: boolean;
  message?: string;
  data?: JadwalMengajar;
}

export interface CreateJadwalMengajarPayload {
  kelasMapelId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruanganId?: string | null;
}

export interface UpdateJadwalMengajarPayload {
  kelasMapelId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruanganId?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const rawToken = getAuthToken();

  const token = rawToken
    ? rawToken.replace(/^Bearer\s+/i, "").trim()
    : null;

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_URL}${endpoint}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[JADWAL API] Network error:", error);

    throw new Error(
      "Tidak dapat terhubung ke backend. Periksa koneksi server."
    );
  }

  const rawText = await response.text();

  let result: any = null;

  if (rawText.trim()) {
    try {
      result = JSON.parse(rawText);
    } catch {
      throw new Error(
        `Server mengembalikan response bukan JSON (${response.status}).`
      );
    }
  }

  if (response.status === 401) {
    throw new Error(
      result?.message ||
        "Token tidak valid atau sudah kedaluwarsa. Silakan login kembali."
    );
  }

  if (response.status === 403) {
    throw new Error(
      result?.message ||
        "Anda tidak memiliki akses ke jadwal mengajar."
    );
  }

  if (response.status === 404) {
    throw new Error(
      result?.message ||
        "Data jadwal atau ruangan tidak ditemukan."
    );
  }

  if (response.status === 409) {
    throw new Error(
      result?.message ||
        "Jadwal guru atau ruangan bentrok dengan jadwal lain."
    );
  }

  if (response.status === 400) {
    throw new Error(
      result?.message ||
        "Data jadwal mengajar tidak valid."
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

// GET seluruh jadwal mengajar
export async function getJadwalMengajar(): Promise<JadwalMengajarResponse> {
  return request<JadwalMengajarResponse>(
    BASE_ENDPOINT,
    {
      method: "GET",
    }
  );
}

// GET detail jadwal berdasarkan ID
export async function getJadwalMengajarById(
  id: string
): Promise<JadwalMengajarDetailResponse> {
  if (!id) {
    throw new Error("ID jadwal mengajar tidak ditemukan.");
  }

  return request<JadwalMengajarDetailResponse>(
    `${BASE_ENDPOINT}/${id}`,
    {
      method: "GET",
    }
  );
}

// POST tambah jadwal mengajar
export async function createJadwalMengajar(
  payload: CreateJadwalMengajarPayload
): Promise<ApiResponse<JadwalMengajar>> {
  if (!payload.kelasMapelId) {
    throw new Error(
      "Kelas dan mata pelajaran wajib dipilih."
    );
  }

  if (!payload.hari) {
    throw new Error("Hari jadwal wajib dipilih.");
  }

  if (!payload.jamMulai || !payload.jamSelesai) {
    throw new Error(
      "Jam mulai dan jam selesai wajib diisi."
    );
  }

  return request<ApiResponse<JadwalMengajar>>(
    BASE_ENDPOINT,
    {
      method: "POST",
      body: JSON.stringify({
        kelasMapelId: payload.kelasMapelId,
        hari: payload.hari,
        jamMulai: payload.jamMulai,
        jamSelesai: payload.jamSelesai,
        ruanganId: payload.ruanganId || null,
      }),
    }
  );
}

// PUT ubah jadwal mengajar
export async function updateJadwalMengajar(
  id: string,
  payload: UpdateJadwalMengajarPayload
): Promise<ApiResponse<JadwalMengajar>> {
  if (!id) {
    throw new Error(
      "ID jadwal mengajar tidak ditemukan."
    );
  }

  if (!payload.kelasMapelId) {
    throw new Error(
      "Kelas dan mata pelajaran wajib dipilih."
    );
  }

  if (!payload.hari) {
    throw new Error("Hari jadwal wajib dipilih.");
  }

  if (!payload.jamMulai || !payload.jamSelesai) {
    throw new Error(
      "Jam mulai dan jam selesai wajib diisi."
    );
  }

  return request<ApiResponse<JadwalMengajar>>(
    `${BASE_ENDPOINT}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        kelasMapelId: payload.kelasMapelId,
        hari: payload.hari,
        jamMulai: payload.jamMulai,
        jamSelesai: payload.jamSelesai,
        ruanganId: payload.ruanganId || null,
      }),
    }
  );
}

// DELETE jadwal mengajar
export async function deleteJadwalMengajar(
  id: string
): Promise<ApiResponse<null>> {
  if (!id) {
    throw new Error(
      "ID jadwal mengajar tidak ditemukan."
    );
  }

  return request<ApiResponse<null>>(
    `${BASE_ENDPOINT}/${id}`,
    {
      method: "DELETE",
    }
  );
}
