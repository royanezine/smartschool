import { apiFetch } from "../lib/api";

const ENDPOINT = "/api/gelombang-ppdb";

export interface GelombangPpdb {
  id: string;
  sekolahId: string;
  jalurPpdbId?: string | null;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  kuota?: number | null;
  status: "aktif" | "nonaktif" | string;
  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
  jalurPpdb?: {
    id: string;
    nama: string;
  } | null;
}

export interface GelombangPpdbPayload {
  nama: string;
  jalurPpdbId?: string | null;
  tanggalMulai: string;
  tanggalSelesai: string;
  kuota?: number | null;
  status?: "aktif" | "nonaktif" | string;
}

export interface GelombangPpdbFilters {
  search?: string;
  status?: string;
  jalurPpdbId?: string;
}

export interface GelombangPpdbListResponse {
  success: boolean;
  message?: string;
  data: GelombangPpdb[];
}

export interface GelombangPpdbResponse {
  success: boolean;
  message?: string;
  data: GelombangPpdb;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function assertPayload(payload: GelombangPpdbPayload) {
  const nama = String(payload?.nama || "").trim();
  if (!nama) {
    throw new Error("Nama gelombang wajib diisi.");
  }
  if (nama.length < 2) {
    throw new Error("Nama gelombang minimal 2 karakter.");
  }
  if (nama.length > 50) {
    throw new Error("Nama gelombang maksimal 50 karakter.");
  }

  const tanggalMulai = String(payload?.tanggalMulai || "").trim();
  const tanggalSelesai = String(payload?.tanggalSelesai || "").trim();

  if (!tanggalMulai || !tanggalSelesai) {
    throw new Error(
      "Tanggal mulai dan tanggal selesai wajib diisi."
    );
  }

  if (!DATE_REGEX.test(tanggalMulai)) {
    throw new Error("Format tanggal mulai harus YYYY-MM-DD.");
  }
  if (!DATE_REGEX.test(tanggalSelesai)) {
    throw new Error("Format tanggal selesai harus YYYY-MM-DD.");
  }

  if (tanggalSelesai < tanggalMulai) {
    throw new Error(
      "Tanggal selesai tidak boleh sebelum tanggal mulai."
    );
  }

  if (
    payload.kuota !== undefined &&
    payload.kuota !== null &&
    String(payload.kuota).trim() !== ""
  ) {
    const kuotaNum = Number(payload.kuota);
    if (!Number.isInteger(kuotaNum) || kuotaNum < 0) {
      throw new Error(
        "Kuota harus berupa bilangan bulat minimal 0."
      );
    }
  }

  if (
    payload.status &&
    payload.status !== "aktif" &&
    payload.status !== "nonaktif"
  ) {
    throw new Error("Status harus 'aktif' atau 'nonaktif'.");
  }
}

function serialize(payload: GelombangPpdbPayload) {
  return {
    nama: String(payload.nama || "").trim(),
    jalurPpdbId: payload.jalurPpdbId ? String(payload.jalurPpdbId).trim() : null,
    tanggalMulai: String(payload.tanggalMulai || "").trim(),
    tanggalSelesai: String(payload.tanggalSelesai || "").trim(),
    kuota:
      payload.kuota === undefined ||
      payload.kuota === null ||
      String(payload.kuota).trim() === ""
        ? null
        : Number(payload.kuota),
    status: payload.status === "nonaktif" ? "nonaktif" : "aktif",
  };
}

export async function getGelombangPpdb(
  filters?: GelombangPpdbFilters
): Promise<GelombangPpdbListResponse> {
  const query = new URLSearchParams();

  if (filters?.search?.trim()) {
    query.set("search", filters.search.trim());
  }

  if (filters?.status?.trim()) {
    query.set("status", filters.status.trim());
  }

  if (filters?.jalurPpdbId?.trim()) {
    query.set("jalurPpdbId", filters.jalurPpdbId.trim());
  }

  const qs = query.toString();

  return apiFetch(`${ENDPOINT}${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export function isGelombangEndpointMissing(
  error: unknown
): boolean {
  const err = error as {
    status?: number;
    raw?: unknown;
  };

  if (err?.status !== 404) {
    return false;
  }

  // If server responded with a string (HTML error page, e.g. "Cannot GET /api/gelombang-ppdb")
  if (typeof err.raw === "string") {
    return true;
  }

  // If server responded with JSON, the route exists and handled the request
  // (e.g. { success: false, message: "Gelombang PPDB tidak ditemukan" })
  return false;
}

export async function getGelombangPpdbById(
  id: string
): Promise<GelombangPpdbResponse> {
  if (!id) {
    throw new Error("ID gelombang tidak ditemukan.");
  }

  return apiFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function createGelombangPpdb(
  payload: GelombangPpdbPayload
): Promise<GelombangPpdbResponse> {
  assertPayload(payload);

  return apiFetch(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(serialize(payload)),
  });
}

export async function updateGelombangPpdb(
  id: string,
  payload: GelombangPpdbPayload
): Promise<GelombangPpdbResponse> {
  if (!id) {
    throw new Error("ID gelombang tidak ditemukan.");
  }

  assertPayload(payload);

  return apiFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(serialize(payload)),
  });
}

export async function deleteGelombangPpdb(
  id: string
): Promise<{ success: boolean; message?: string }> {
  if (!id) {
    throw new Error("ID gelombang tidak ditemukan.");
  }

  return apiFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
