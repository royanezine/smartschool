import { apiFetch } from "../lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getGedung() {
  try {
    if (!API_URL) {
      console.error(
        "NEXT_PUBLIC_API_URL belum dikonfigurasi."
      );

      return {
        success: false,
        data: [],
        message: "API URL belum dikonfigurasi.",
      };
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    const headers = {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };

    const response = await fetch(
      `${API_URL}/api/v1/infrastruktur/gedung`,
      {
        method: "GET",
        headers,
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.status === 401) {
      console.warn(
        "Token belum valid / belum terbaca."
      );

      return {
        success: false,
        data: [],
        message:
          "Token belum valid. Data gedung belum dapat dimuat.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message:
          data?.message ||
          "Gagal mengambil data gedung.",
      };
    }

    return data;
  } catch (error) {
    console.error(
      "Error getGedung:",
      error
    );

    return {
      success: false,
      data: [],
      message:
        "Backend belum dapat diakses.",
    };
  }
}

export async function createGedung(data) {
  return apiFetch(
    "/api/v1/infrastruktur/gedung",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateGedung(
  id,
  data
) {
  return apiFetch(
    `/api/v1/infrastruktur/gedung/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteGedung(id) {
  return apiFetch(
    `/api/v1/infrastruktur/gedung/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function getLantaiByGedung(
  gedungId
) {
  return apiFetch(
    `/api/v1/infrastruktur/lantai/gedung/${gedungId}`,
    {
      method: "GET",
    }
  );
}

export async function createLantai(data) {
  return apiFetch(
    "/api/v1/infrastruktur/lantai",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateLantai(
  id,
  data
) {
  return apiFetch(
    `/api/v1/infrastruktur/lantai/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteLantai(id) {
  return apiFetch(
    `/api/v1/infrastruktur/lantai/${id}`,
    {
      method: "DELETE",
    }
  );
}