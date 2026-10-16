import { apiFetch } from "@/lib/api";

const BASE_PATH = "/api/penggajian";

/**
 * Mengambil daftar penggajian.
 *
 * Params:
 * - page
 * - limit
 * - bulan
 * - tahun
 * - status
 * - search
 * - sekolahId
 */
export async function getPenggajian(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return apiFetch(
    `${BASE_PATH}${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );
}

/**
 * Mengambil detail penggajian berdasarkan ID.
 * Termasuk rincian absensi dari backend.
 */
export async function getPenggajianById(id) {
  if (!id) {
    throw new Error("ID penggajian wajib diisi.");
  }

  return apiFetch(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

/**
 * Melakukan kalkulasi penggajian.
 *
 * Payload:
 * {
 *   bulan,
 *   tahun,
 *   penggunaId?, 
 *   sekolahId?
 * }
 */
export async function kalkulasiPenggajian(payload) {
  return apiFetch(`${BASE_PATH}/kalkulasi`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Mengubah status penggajian.
 *
 * Payload:
 * {
 *   status: "draft" | "disetujui" | "dibekukan" | "dibayar",
 *   catatan?
 * }
 */
export async function updateStatusPenggajian(id, payload) {
  if (!id) {
    throw new Error("ID penggajian wajib diisi.");
  }

  return apiFetch(
    `${BASE_PATH}/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Membekukan satu data penggajian.
 */
export async function freezePenggajian(id) {
  if (!id) {
    throw new Error("ID penggajian wajib diisi.");
  }

  return apiFetch(
    `${BASE_PATH}/${encodeURIComponent(id)}/freeze`,
    {
      method: "PATCH",
    },
  );
}

/**
 * Membekukan seluruh penggajian berstatus draft
 * pada periode yang dipilih.
 *
 * Payload:
 * {
 *   bulan,
 *   tahun,
 *   sekolahId?
 * }
 */
export async function freezePeriodePenggajian(payload) {
  return apiFetch(`${BASE_PATH}/freeze-periode`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Mengambil slip gaji milik pengguna yang login.
 *
 * Params:
 * - bulan?
 * - tahun?
 */
export async function getSlipGajiSaya(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return apiFetch(
    `${BASE_PATH}/slip/saya${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );
}