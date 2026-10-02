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

const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = getToken();

  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${API_BASE}/${cleanEndpoint}`;

  console.log("API REQUEST:", url);

  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("API REQUEST GAGAL:", {
      url,
      status: response.status,
      statusText: response.statusText,
      result,
    });

    throw new Error(
      `${response.status} ${response.statusText} - ${url} - ${
        result?.message ||
        result?.error ||
        "Request gagal"
      }`,
    );
  }

  return result;
};

/* =========================================================
   TAHUN AJARAN
========================================================= */

export const getTahunAjaran = async () => {
  return apiFetch("tahun-ajaran");
};

/* =========================================================
   KELAS
========================================================= */

export const getKelas = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    tahunAjaranId?: string;
  } = {},
) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page || 1));
  query.set("limit", String(params.limit || 100));

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.tahunAjaranId) {
    query.set(
      "tahunAjaranId",
      params.tahunAjaranId,
    );
  }

  return apiFetch(
    `kelas?${query.toString()}`,
  );
};

/* =========================================================
   DETAIL KELAS
========================================================= */

export const getDetailKelas = async (
  kelasId: string,
) => {
  if (!kelasId) {
    throw new Error("ID kelas tidak ditemukan");
  }

  return apiFetch(
    `kelas/${encodeURIComponent(kelasId)}`,
  );
};

/* =========================================================
   RAPORT SISWA
========================================================= */

export const getRaportSiswa = async (
  siswaId: string,
  tahunAjaranId: string,
) => {
  if (!siswaId) {
    throw new Error("ID siswa tidak ditemukan");
  }

  if (!tahunAjaranId) {
    throw new Error(
      "ID tahun ajaran tidak ditemukan",
    );
  }

  return apiFetch(
    `v1/raport/${encodeURIComponent(
      siswaId,
    )}/tahun-ajaran/${encodeURIComponent(
      tahunAjaranId,
    )}`,
  );
};