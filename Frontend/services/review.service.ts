
import { apiFetch } from "../lib/api";

export type StatusReview = "menunggu" | "tampil" | "disembunyikan";

export interface ReviewPengguna {
  id: string;
  penggunaId?: string;
  rating: number;
  komentar: string;
  status: StatusReview;
  dibuatPada: string;
  diperbaruiPada: string;
  pengguna?: {
    id?: string;
    namaLengkap: string;
    jabatan?: string | null;
    peran?: {
      nama: string;
      namaTampilan: string;
    } | null;
  };
}

export interface ReviewPayload {
  rating: number;
  komentar: string;
}

export interface ReviewAdminPayload extends ReviewPayload {
  penggunaId: string;
  status?: StatusReview;
}

export interface ReviewAdminUpdatePayload {
  rating?: number;
  komentar?: string;
  status?: StatusReview;
  diperbaruiPada?: string;
}

export interface ReviewQuery {
  page?: number;
  limit?: number;
  status?: StatusReview;
  rating?: number;
  penggunaId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ReviewListResponse {
  success: boolean;
  data: ReviewPengguna[];
  meta: PaginationMeta;
}


function buildQuery(params: object = {}): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const result = query.toString();

  return result ? `?${result}` : "";
}


export async function getReviewSaya(): Promise<
  ApiResponse<ReviewPengguna | null>
> {
  return apiFetch("/users/review", {
    method: "GET",
  });
}

export async function createReviewSaya(
  payload: ReviewPayload,
): Promise<ApiResponse<ReviewPengguna>> {
  return apiFetch("/users/review", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReviewSaya(
  payload: Partial<ReviewPayload>,
): Promise<ApiResponse<ReviewPengguna>> {
  return apiFetch("/users/review", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}


export async function getReviews(
  params: ReviewQuery = {},
): Promise<ReviewListResponse> {
  return apiFetch(`/reviews${buildQuery(params)}`, {
    method: "GET",
  });
}

export async function getReviewById(
  id: string,
): Promise<ApiResponse<ReviewPengguna>> {
  return apiFetch(`/reviews/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function createReviewAdmin(
  payload: ReviewAdminPayload,
): Promise<ApiResponse<ReviewPengguna>> {
  return apiFetch("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReviewAdmin(
  id: string,
  payload: ReviewAdminUpdatePayload,
): Promise<ApiResponse<ReviewPengguna>> {
  return apiFetch(`/reviews/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteReviewAdmin(
  id: string,
): Promise<ApiResponse<null>> {
  return apiFetch(`/reviews/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}


export async function getPublicReviews(
  params: Pick<ReviewQuery, "page" | "limit"> = {},
): Promise<ReviewListResponse> {
  return apiFetch(`/publik/reviews${buildQuery(params)}`, {
    method: "GET",
  });
}
