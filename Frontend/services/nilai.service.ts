const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const BASE_ENDPOINT =
  "/api/v1/nilai";

/* =========================================================
   TYPES
========================================================= */

export interface ExportRekapNilaiParams {
  kelasId?: string;
  kelasMapelId?: string;
}

/* =========================================================
   GET TOKEN
========================================================= */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

/* =========================================================
   EXPORT REKAP NILAI
========================================================= */

/**
 * GET /api/v1/nilai/export
 *
 * Backend:
 * authenticate
 *
 * Query:
 * ?kelasId=...
 * ?kelasMapelId=...
 *
 * Response:
 * Excel file (.xlsx)
 */
export async function exportRekapNilai(
  params: ExportRekapNilaiParams = {}
): Promise<Blob> {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const searchParams =
    new URLSearchParams();

  if (params.kelasId) {
    searchParams.set(
      "kelasId",
      params.kelasId
    );
  }

  if (params.kelasMapelId) {
    searchParams.set(
      "kelasMapelId",
      params.kelasMapelId
    );
  }

  const query =
    searchParams.toString();

  const url =
    `${API_URL}${BASE_ENDPOINT}/export${
      query ? `?${query}` : ""
    }`;

  console.log(
    "[NILAI API] Export Request:",
    {
      method: "GET",
      url,
      hasToken: Boolean(token),
    }
  );

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",

      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Authorization:
          `Bearer ${token}`,
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

  console.log(
    "[NILAI API] Export Response:",
    {
      status: response.status,
      statusText: response.statusText,
      url,
      contentType:
        response.headers.get(
          "content-type"
        ),
    }
  );

  /* =======================================================
     ERROR
  ======================================================= */

  if (!response.ok) {
    let message =
      `Gagal mengekspor rekap nilai (${response.status}).`;

    const contentType =
      response.headers.get(
        "content-type"
      );

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
          message =
            text.trim();
        }
      }
    } catch {
      // Gunakan message default
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

  /* =======================================================
     VALIDASI RESPONSE
  ======================================================= */

  const blob =
    await response.blob();

  if (blob.size === 0) {
    throw new Error(
      "File rekap nilai yang diterima dari backend kosong."
    );
  }

  return blob;
}

/* =========================================================
   DOWNLOAD HELPER
========================================================= */

/**
 * Membuat browser mendownload file Excel
 * hasil dari endpoint backend.
 */
export function downloadRekapNilai(
  blob: Blob,
  filename = "rekap-nilai.xlsx"
): void {
  if (typeof window === "undefined") {
    return;
  }

  const objectUrl =
    window.URL.createObjectURL(
      blob
    );

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