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
  status?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
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
  status?: string;
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

function assertPayload(payload: GelombangPpdbPayload) {
  if (!payload?.nama?.trim()) {
    throw new Error("Nama gelombang wajib diisi.");
  }

  if (!payload.tanggalMulai || !payload.tanggalSelesai) {
    throw new Error(
      "Tanggal mulai dan tanggal selesai wajib diisi."
    );
  }

  if (
    new Date(payload.tanggalSelesai).getTime() <
    new Date(payload.tanggalMulai).getTime()
  ) {
    throw new Error(
      "Tanggal selesai tidak boleh sebelum tanggal mulai."
    );
  }

  if (
    payload.kuota !== undefined &&
    payload.kuota !== null &&
    (!Number.isInteger(Number(payload.kuota)) ||
      Number(payload.kuota) < 0)
  ) {
    throw new Error(
      "Kuota harus berupa bilangan bulat minimal 0."
    );
  }
}

function serialize(payload: GelombangPpdbPayload) {
  return {
    nama: payload.nama.trim(),
    jalurPpdbId: payload.jalurPpdbId || null,
    tanggalMulai: payload.tanggalMulai,
    tanggalSelesai: payload.tanggalSelesai,
    kuota:
      payload.kuota === undefined ||
      payload.kuota === null ||
      String(payload.kuota) === ""
        ? null
        : Number(payload.kuota),
    status: payload.status || "aktif",
  };
}

export async function getGelombangPpdb(): Promise<GelombangPpdbListResponse> {
  return apiFetch(ENDPOINT, {
    method: "GET",
  });
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
