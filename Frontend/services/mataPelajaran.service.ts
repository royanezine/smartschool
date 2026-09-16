import { apiFetch } from "../lib/api";

const API_ENDPOINT = "/api/mata-pelajaran";

export interface MataPelajaran {
  id: string;
  sekolahId: string;
  nama: string;
  kode: string;
  status: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface GetMataPelajaranResponse {
  success: boolean;
  message: string;
  data: MataPelajaran[];
}

export interface CreateMataPelajaranPayload {
  nama: string;
  kode: string;
  status?: string;
}

export interface UpdateMataPelajaranPayload {
  nama?: string;
  kode?: string;
  status?: string;
}

export async function getMataPelajaran(): Promise<GetMataPelajaranResponse> {
  return apiFetch(API_ENDPOINT, {
    method: "GET",
  });
}

export async function createMataPelajaran(
  payload: CreateMataPelajaranPayload
) {
  return apiFetch(API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMataPelajaran(
  id: string,
  payload: UpdateMataPelajaranPayload
) {
  if (!id) {
    throw new Error("ID mata pelajaran tidak ditemukan.");
  }

  return apiFetch(`${API_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMataPelajaran(id: string) {
  if (!id) {
    throw new Error("ID mata pelajaran tidak ditemukan.");
  }

  return apiFetch(`${API_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}