
import { apiFetch } from "../lib/api";
import { getToken } from "../lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export type GedungPayload = {
  nama: string;
  kode?: string | null;
  fotoGedung?: string | null;
};

export type LantaiPayload = {
  gedungId: string;
  nama: string;
  kode?: string | null;
  [key: string]: unknown;
};


function normalizeGedungPayload(data: GedungPayload) {
  const nama = String(data.nama ?? "").trim();
  const kode = String(data.kode ?? "").trim();
  const fotoGedung = String(data.fotoGedung ?? "").trim();

  if (!nama) {
    throw new Error("Nama gedung wajib diisi.");
  }

  if (nama.length > 100) {
    throw new Error("Nama gedung maksimal 100 karakter.");
  }

  if (kode.length > 20) {
    throw new Error("Kode gedung maksimal 20 karakter.");
  }

  if (fotoGedung.length > 255) {
    throw new Error("URL foto gedung maksimal 255 karakter.");
  }

  if (fotoGedung) {
    try {
      const url = new URL(fotoGedung);

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("URL foto harus menggunakan HTTP atau HTTPS.");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "URL foto harus menggunakan HTTP atau HTTPS."
      ) {
        throw error;
      }

      throw new Error("Masukkan URL foto gedung yang valid.");
    }
  }

  return {
    nama,
    kode: kode || null,
    fotoGedung: fotoGedung || null,
  };
}


export async function getGedung() {
  try {
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");

      return {
        success: false,
        data: [],
        message: "API URL belum dikonfigurasi.",
      };
    }

    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(
      `${API_URL}/api/infrastruktur/gedung`,
      {
        method: "GET",
        headers,
      }
    );

    let result: any = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (response.status === 401) {
      return {
        success: false,
        data: [],
        message: "Token belum valid. Silakan login kembali.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message:
          result?.message || "Gagal mengambil data gedung.",
      };
    }

    return result;
  } catch (error) {
    console.error("Error getGedung:", error);

    return {
      success: false,
      data: [],
      message: "Backend belum dapat diakses.",
    };
  }
}


export async function createGedung(data: GedungPayload) {
  const payload = normalizeGedungPayload(data);

  return apiFetch("/api/infrastruktur/gedung", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export async function updateGedung(
  id: string,
  data: GedungPayload
) {
  if (!id) {
    throw new Error("ID gedung tidak ditemukan.");
  }

  const payload = normalizeGedungPayload(data);

  return apiFetch(
    `/api/infrastruktur/gedung/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}


export async function deleteGedung(id: string) {
  if (!id) {
    throw new Error("ID gedung tidak ditemukan.");
  }

  return apiFetch(
    `/api/infrastruktur/gedung/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}


export async function getLantaiByGedung(gedungId: string) {
  if (!gedungId) {
    throw new Error("ID gedung tidak ditemukan.");
  }

  return apiFetch(
    `/api/infrastruktur/lantai/gedung/${encodeURIComponent(gedungId)}`,
    {
      method: "GET",
    }
  );
}


export async function createLantai(data: LantaiPayload) {
  return apiFetch("/api/infrastruktur/lantai", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function updateLantai(
  id: string,
  data: Partial<LantaiPayload>
) {
  if (!id) {
    throw new Error("ID lantai tidak ditemukan.");
  }

  return apiFetch(
    `/api/infrastruktur/lantai/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}


export async function deleteLantai(id: string) {
  if (!id) {
    throw new Error("ID lantai tidak ditemukan.");
  }

  return apiFetch(
    `/api/infrastruktur/lantai/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}
