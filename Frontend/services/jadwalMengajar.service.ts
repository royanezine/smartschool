const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const BASE_ENDPOINT =
  "/api/v1/jadwal-mengajar";

/* =========================================================
   INTERFACE
========================================================= */

export interface JadwalMengajar {
  id: string;
  kelasMapelId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string | null;

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

/* =========================================================
   RESPONSE
========================================================= */

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

/* =========================================================
   PAYLOAD
========================================================= */

export interface CreateJadwalMengajarPayload {
  kelasMapelId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string | null;
}

export interface UpdateJadwalMengajarPayload {
  kelasMapelId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string | null;
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
    "[JADWAL API] Token:",
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
    options.headers
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
    "[JADWAL API] Request:",
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
      "[JADWAL API] Network Error:",
      error
    );

    throw new Error(
      "Tidak dapat terhubung ke backend. Pastikan server berjalan di http://localhost:5000."
    );
  }

  const rawText =
    await response.text();

  console.log(
    "[JADWAL API] Response:",
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
        "[JADWAL API] Response bukan JSON:",
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
        "Anda tidak memiliki akses ke jadwal mengajar."
    );
  }

  if (response.status === 404) {
    throw new Error(
      result?.message ||
        "Data jadwal mengajar tidak ditemukan."
    );
  }

  if (response.status === 409) {
    throw new Error(
      result?.message ||
        "Jadwal guru bentrok dengan jadwal lain."
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

/* =========================================================
   GET SEMUA JADWAL
========================================================= */

export async function getJadwalMengajar(): Promise<JadwalMengajarResponse> {
  return request<JadwalMengajarResponse>(
    BASE_ENDPOINT,
    {
      method: "GET",
    }
  );
}

/* =========================================================
   GET JADWAL BY ID
========================================================= */

export async function getJadwalMengajarById(
  id: string
): Promise<JadwalMengajarDetailResponse> {
  if (!id) {
    throw new Error(
      "ID jadwal mengajar tidak ditemukan."
    );
  }

  return request<JadwalMengajarDetailResponse>(
    `${BASE_ENDPOINT}/${id}`,
    {
      method: "GET",
    }
  );
}

/* =========================================================
   CREATE
========================================================= */

export async function createJadwalMengajar(
  payload: CreateJadwalMengajarPayload
) {
  if (!payload.kelasMapelId) {
    throw new Error(
      "Kelas dan mata pelajaran wajib dipilih."
    );
  }

  if (!payload.hari) {
    throw new Error(
      "Hari jadwal wajib dipilih."
    );
  }

  if (!payload.jamMulai) {
    throw new Error(
      "Jam mulai wajib diisi."
    );
  }

  if (!payload.jamSelesai) {
    throw new Error(
      "Jam selesai wajib diisi."
    );
  }

  return request<{
    success: boolean;
    message?: string;
    data?: JadwalMengajar;
  }>(
    BASE_ENDPOINT,
    {
      method: "POST",

      body: JSON.stringify({
        kelasMapelId:
          payload.kelasMapelId,

        hari:
          payload.hari,

        jamMulai:
          payload.jamMulai,

        jamSelesai:
          payload.jamSelesai,

        ruangan:
          payload.ruangan || null,
      }),
    }
  );
}

/* =========================================================
   UPDATE
========================================================= */

export async function updateJadwalMengajar(
  id: string,
  payload: UpdateJadwalMengajarPayload
) {
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
    throw new Error(
      "Hari jadwal wajib dipilih."
    );
  }

  if (!payload.jamMulai) {
    throw new Error(
      "Jam mulai wajib diisi."
    );
  }

  if (!payload.jamSelesai) {
    throw new Error(
      "Jam selesai wajib diisi."
    );
  }

  return request<{
    success: boolean;
    message?: string;
    data?: JadwalMengajar;
  }>(
    `${BASE_ENDPOINT}/${id}`,
    {
      method: "PUT",

      body: JSON.stringify({
        kelasMapelId:
          payload.kelasMapelId,

        hari:
          payload.hari,

        jamMulai:
          payload.jamMulai,

        jamSelesai:
          payload.jamSelesai,

        ruangan:
          payload.ruangan || null,
      }),
    }
  );
}

/* =========================================================
   DELETE
========================================================= */

export async function deleteJadwalMengajar(
  id: string
) {
  if (!id) {
    throw new Error(
      "ID jadwal mengajar tidak ditemukan."
    );
  }

  return request<{
    success: boolean;
    message?: string;
  }>(
    `${BASE_ENDPOINT}/${id}`,
    {
      method: "DELETE",
    }
  );
}