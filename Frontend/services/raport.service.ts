/* =========================================================
   RAPORT SERVICE
   Backend : Backend/src/routes/raport.routes.ts
   Mount   : /api/raport
   Auth    : Bearer token (middleware authenticate)

   Endpoint yang dipakai:
   - Guru / Wali Kelas
     GET  /api/raport/wali-kelas/kelas-saya
     GET  /api/raport/wali-kelas/kelas/:kelasId
     POST /api/raport/wali-kelas/kelas/:kelasId/generate
     PUT  /api/raport/wali-kelas/rapot/:rapotId/catatan
     PUT  /api/raport/wali-kelas/rapot/:rapotId/publish
   - Siswa
     GET  /api/raport/siswa
     GET  /api/raport/siswa/:rapotId
   - Pendukung nilai (dipakai halaman e-Raport)
     GET  /api/tahun-ajaran
     GET  /api/kelas
     GET  /api/kelas/:kelasId
     GET  /api/raport/:siswaId/tahun-ajaran/:tahunAjaranId
========================================================= */

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_BASE = (() => {
  const base = RAW_API_BASE.replace(/\/+$/, "");

  if (base.endsWith("/api")) {
    return base;
  }

  return `${base}/api`;
})();

/* =========================================================
   AUTH
========================================================= */

const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

/* =========================================================
   FETCH HELPER
========================================================= */

const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = getToken();

  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${API_BASE}/${cleanEndpoint}`;

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
    throw new Error(
      `${response.status} ${response.statusText} - ${url} - ${
        result?.message || result?.error || "Request gagal"
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

  return apiFetch(`kelas?${query.toString()}`);
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
   RAPORT SISWA (agregasi nilai)
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
    `raport/${encodeURIComponent(
      siswaId,
    )}/tahun-ajaran/${encodeURIComponent(
      tahunAjaranId,
    )}`,
  );
};

/* =========================================================
   GURU / WALI KELAS
========================================================= */

/**
 * GET /api/raport/wali-kelas/kelas-saya
 * Daftar kelas yang diwalikan oleh guru yang login.
 */
export const getKelasWali = async () => {
  return apiFetch("raport/wali-kelas/kelas-saya");
};

/**
 * GET /api/raport/wali-kelas/kelas/:kelasId
 * Daftar rapot (draft/published) pada kelas yang diwalikan.
 */
export const getRapotKelas = async (
  kelasId: string,
  params: { jenisRapot?: string } = {},
) => {
  if (!kelasId) {
    throw new Error("ID kelas tidak ditemukan");
  }

  const query = new URLSearchParams();

  if (params.jenisRapot) {
    query.set("jenisRapot", params.jenisRapot);
  }

  const suffix = query.toString();

  return apiFetch(
    `raport/wali-kelas/kelas/${encodeURIComponent(
      kelasId,
    )}${suffix ? `?${suffix}` : ""}`,
  );
};

/**
 * POST /api/raport/wali-kelas/kelas/:kelasId/generate
 * Generate rapot (status draft) untuk semua siswa di kelas.
 */
export const generateRapotKelas = async (
  kelasId: string,
  payload: {
    jenisRapot: "tengah_semester" | "akhir_semester";
    overwrite?: boolean;
  },
) => {
  if (!kelasId) {
    throw new Error("ID kelas tidak ditemukan");
  }

  if (!payload?.jenisRapot) {
    throw new Error("Jenis rapot wajib dipilih");
  }

  return apiFetch(
    `raport/wali-kelas/kelas/${encodeURIComponent(
      kelasId,
    )}/generate`,
    {
      method: "POST",
      body: JSON.stringify({
        jenisRapot: payload.jenisRapot,
        overwrite: payload.overwrite === true,
      }),
    },
  );
};

/**
 * PUT /api/raport/wali-kelas/rapot/:rapotId/catatan
 * Simpan catatan wali kelas / keterangan.
 */
export const isiCatatanRapot = async (
  rapotId: string,
  payload: {
    catatanWaliKelas?: string;
    keterangan?: string;
  },
) => {
  if (!rapotId) {
    throw new Error("ID rapot tidak ditemukan");
  }

  if (
    payload?.catatanWaliKelas === undefined &&
    payload?.keterangan === undefined
  ) {
    throw new Error(
      "catatanWaliKelas atau keterangan wajib diisi",
    );
  }

  return apiFetch(
    `raport/wali-kelas/rapot/${encodeURIComponent(
      rapotId,
    )}/catatan`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...(payload.catatanWaliKelas !== undefined
          ? {
              catatanWaliKelas:
                payload.catatanWaliKelas,
            }
          : {}),
        ...(payload.keterangan !== undefined
          ? { keterangan: payload.keterangan }
          : {}),
      }),
    },
  );
};

/**
 * PUT /api/raport/wali-kelas/rapot/:rapotId/publish
 * aksi: "publish" | "unpublish"
 */
export const setPublishRapot = async (
  rapotId: string,
  aksi: "publish" | "unpublish" = "publish",
) => {
  if (!rapotId) {
    throw new Error("ID rapot tidak ditemukan");
  }

  if (aksi !== "publish" && aksi !== "unpublish") {
    throw new Error("Aksi harus publish atau unpublish");
  }

  return apiFetch(
    `raport/wali-kelas/rapot/${encodeURIComponent(
      rapotId,
    )}/publish`,
    {
      method: "PUT",
      body: JSON.stringify({ aksi }),
    },
  );
};

/* =========================================================
   SISWA
========================================================= */

/**
 * GET /api/raport/siswa
 * Daftar rapot yang sudah dipublish milik siswa yang login.
 */
export const getRapotSaya = async () => {
  return apiFetch("raport/siswa");
};

/**
 * GET /api/raport/siswa/:rapotId
 * Detail rapot (nilai, kehadiran, catatan wali kelas).
 */
export const getDetailRapotSaya = async (
  rapotId: string,
) => {
  if (!rapotId) {
    throw new Error("ID rapot tidak ditemukan");
  }

  return apiFetch(
    `raport/siswa/${encodeURIComponent(rapotId)}`,
  );
};
