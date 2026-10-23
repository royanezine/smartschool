import { apiFetch } from "@/lib/api";

const BASE_PATH = "/api/penggajian";

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

export async function getPenggajianById(id) {
  if (!id) {
    throw new Error("ID penggajian wajib diisi.");
  }

  return apiFetch(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function kalkulasiPenggajian(payload) {
  return apiFetch(`${BASE_PATH}/kalkulasi`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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

export async function freezePeriodePenggajian(payload) {
  return apiFetch(`${BASE_PATH}/freeze-periode`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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