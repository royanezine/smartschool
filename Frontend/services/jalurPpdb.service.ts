import { apiFetch } from "../lib/api";

const ENDPOINT = "/api/v1/jalur-ppdb";

export interface JalurPpdb {
  id: string;
  sekolahId: string;
  nama: string;
  deskripsi?: string | null;
  kuota: number;
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
  status: string;
  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface JalurPpdbPayload {
  nama: string;
  deskripsi?: string;
  kuota: number;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  status?: string;
}

export interface JalurPpdbResponse {
  success: boolean;
  message?: string;
  data: JalurPpdb;
}

export interface JalurPpdbListResponse {
  success: boolean;
  message?: string;
  data: JalurPpdb[];
}

export async function getJalurPpdb(): Promise<JalurPpdbListResponse> {
  return apiFetch(ENDPOINT, {
    method: "GET",
  });
}

export async function getJalurPpdbById(
  id: string
): Promise<JalurPpdbResponse> {
  if (!id) {
    throw new Error("ID jalur PPDB tidak ditemukan.");
  }

  return apiFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function createJalurPpdb(
  payload: JalurPpdbPayload
): Promise<JalurPpdbResponse> {
  if (!payload?.nama?.trim()) {
    throw new Error("Nama jalur PPDB wajib diisi.");
  }

  if (!Number.isFinite(Number(payload.kuota))) {
    throw new Error("Kuota jalur PPDB wajib diisi.");
  }

  return apiFetch(ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      nama: payload.nama.trim(),
      deskripsi: payload.deskripsi?.trim() || undefined,
      kuota: Number(payload.kuota),
      tanggalMulai: payload.tanggalMulai || undefined,
      tanggalSelesai: payload.tanggalSelesai || undefined,
      status: payload.status || "aktif",
    }),
  });
}

export async function updateJalurPpdb(
  id: string,
  payload: Partial<JalurPpdbPayload>
): Promise<JalurPpdbResponse> {
  if (!id) {
    throw new Error("ID jalur PPDB tidak ditemukan.");
  }

  if (payload.nama !== undefined && !payload.nama.trim()) {
    throw new Error("Nama jalur PPDB wajib diisi.");
  }

  if (
    payload.kuota !== undefined &&
    !Number.isFinite(Number(payload.kuota))
  ) {
    throw new Error("Kuota jalur PPDB harus berupa angka.");
  }

  return apiFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(payload.nama !== undefined && {
        nama: payload.nama.trim(),
      }),
      ...(payload.deskripsi !== undefined && {
        deskripsi: payload.deskripsi.trim() || undefined,
      }),
      ...(payload.kuota !== undefined && {
        kuota: Number(payload.kuota),
      }),
      ...(payload.tanggalMulai !== undefined && {
        tanggalMulai: payload.tanggalMulai || undefined,
      }),
      ...(payload.tanggalSelesai !== undefined && {
        tanggalSelesai: payload.tanggalSelesai || undefined,
      }),
      ...(payload.status !== undefined && {
        status: payload.status || undefined,
      }),
    }),
  });
}

export async function deleteJalurPpdb(
  id: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!id) {
    throw new Error("ID jalur PPDB tidak ditemukan.");
  }

  return apiFetch(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}