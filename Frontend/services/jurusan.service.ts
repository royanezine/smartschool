import { apiFetch } from "@/lib/api";

export interface JurusanItem {
  id: string;
  sekolahId?: string;
  kode: string;
  nama: string;
  deskripsi?: string | null;
  status: "aktif" | "nonaktif";
  dibuatPada?: string;
  diperbaruiPada?: string;
  _count?: {
    kelas?: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetJurusanParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetJurusanResponse {
  success: boolean;
  data: JurusanItem[];
  meta?: PaginationMeta;
}

export interface JurusanDetailResponse {
  success: boolean;
  message?: string;
  data: JurusanItem;
}

export interface CreateJurusanPayload {
  kode: string;
  nama: string;
  deskripsi?: string | null;
  status?: "aktif" | "nonaktif";
}

export interface UpdateJurusanPayload {
  kode?: string;
  nama?: string;
  deskripsi?: string | null;
  status?: "aktif" | "nonaktif";
}

export async function getJurusan(
  params?: GetJurusanParams
): Promise<GetJurusanResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/api/jurusan${qs}`);
}

export async function getJurusanById(
  id: string
): Promise<JurusanDetailResponse> {
  return apiFetch(`/api/jurusan/${encodeURIComponent(id)}`);
}

export async function createJurusan(
  payload: CreateJurusanPayload
): Promise<JurusanDetailResponse> {
  return apiFetch("/api/jurusan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateJurusan(
  id: string,
  payload: UpdateJurusanPayload
): Promise<JurusanDetailResponse> {
  return apiFetch(`/api/jurusan/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteJurusan(id: string): Promise<any> {
  return apiFetch(`/api/jurusan/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
