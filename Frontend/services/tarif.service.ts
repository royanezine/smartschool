import { apiFetch } from "@/lib/api";

/* =========================================================
   TARIF TAGIHAN SERVICE
   Base backend : /api/keuangan  (Backend/src/routes/tarif.routes.ts)
   Auth         : Bearer token (dilampirkan oleh lib/api)
   Role         : admin_sekolah, bendahara, kepala_sekolah (read)
                  admin_sekolah, bendahara (write)
========================================================= */

const BASE_PATH = "/api/keuangan";

/* =========================================================
   TYPES
========================================================= */

export type SiklusTagihan = "bulanan" | "tahunan" | "sekali";

export type StatusAktif = "aktif" | "tidak_aktif";

export interface KategoriTagihan {
  id: string;
  sekolahId?: string;
  kode: string;
  nama: string;
  siklus: SiklusTagihan | string;
  deskripsi?: string | null;
  status?: StatusAktif | string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface TarifTagihan {
  id: string;
  sekolahId?: string;
  kategoriTagihanId: string;
  tahunAjaranId: string;
  kelasId?: string | null;
  tingkat?: string | null;
  nominal: string | number;
  keterangan?: string | null;
  status?: StatusAktif | string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  kategoriTagihan?: {
    id: string;
    kode: string;
    nama: string;
    siklus?: string;
  } | null;
  tahunAjaran?: {
    id: string;
    tahunAjaran?: string;
    semester?: string;
  } | null;
  kelas?: {
    id: string;
    nama: string;
    tingkat?: string | number;
  } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: PaginationMeta;
}

export interface ItemResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface KategoriQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}

export interface TarifQuery {
  page?: number;
  limit?: number;
  kategoriTagihanId?: string;
  tahunAjaranId?: string;
  kelasId?: string;
  tingkat?: string;
  status?: string;
}

export interface CreateKategoriPayload {
  kode: string;
  nama: string;
  siklus?: SiklusTagihan;
  deskripsi?: string;
}

export interface UpdateKategoriPayload {
  kode?: string;
  nama?: string;
  siklus?: SiklusTagihan;
  deskripsi?: string;
  status?: StatusAktif;
}

export interface CreateTarifPayload {
  kategoriTagihanId: string;
  tahunAjaranId: string;
  kelasId?: string;
  tingkat?: string;
  nominal: number;
  keterangan?: string;
}

export interface UpdateTarifPayload {
  nominal?: number;
  keterangan?: string;
  status?: StatusAktif;
}

/* =========================================================
   HELPERS
========================================================= */

function buildQuery(
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

/* =========================================================
   KATEGORI TAGIHAN
   GET /api/keuangan/kategori-tagihan
========================================================= */

export async function getKategoriTagihan(
  params: KategoriQuery = {}
): Promise<ListResponse<KategoriTagihan>> {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 100,
    q: params.q,
    status: params.status,
  });

  return apiFetch(`${BASE_PATH}/kategori-tagihan${query}`, {
    method: "GET",
  });
}

/* =========================================================
   POST /api/keuangan/kategori-tagihan
========================================================= */

export async function createKategoriTagihan(
  payload: CreateKategoriPayload
): Promise<ItemResponse<KategoriTagihan>> {
  if (!payload?.kode?.trim()) {
    throw new Error("Kode kategori wajib diisi.");
  }

  if (!payload?.nama?.trim()) {
    throw new Error("Nama kategori wajib diisi.");
  }

  return apiFetch(`${BASE_PATH}/kategori-tagihan`, {
    method: "POST",
    body: JSON.stringify({
      kode: payload.kode.trim(),
      nama: payload.nama.trim(),
      siklus: payload.siklus ?? "bulanan",
      deskripsi: payload.deskripsi?.trim() || undefined,
    }),
  });
}

/* =========================================================
   PUT /api/keuangan/kategori-tagihan/:id
========================================================= */

export async function updateKategoriTagihan(
  id: string,
  payload: UpdateKategoriPayload
): Promise<ItemResponse<KategoriTagihan>> {
  if (!id) {
    throw new Error("ID kategori wajib diisi.");
  }

  const body: Record<string, unknown> = {};

  if (payload.kode !== undefined) body.kode = payload.kode.trim();
  if (payload.nama !== undefined) body.nama = payload.nama.trim();
  if (payload.siklus !== undefined) body.siklus = payload.siklus;
  if (payload.deskripsi !== undefined) {
    body.deskripsi = payload.deskripsi.trim();
  }
  if (payload.status !== undefined) body.status = payload.status;

  return apiFetch(
    `${BASE_PATH}/kategori-tagihan/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}

/* =========================================================
   DELETE /api/keuangan/kategori-tagihan/:id
========================================================= */

export async function deleteKategoriTagihan(id: string) {
  if (!id) {
    throw new Error("ID kategori wajib diisi.");
  }

  return apiFetch(
    `${BASE_PATH}/kategori-tagihan/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================================================
   TARIF
   GET /api/keuangan/tarif
========================================================= */

export async function getTarif(
  params: TarifQuery = {}
): Promise<ListResponse<TarifTagihan>> {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 100,
    kategoriTagihanId: params.kategoriTagihanId,
    tahunAjaranId: params.tahunAjaranId,
    kelasId: params.kelasId,
    tingkat: params.tingkat,
    status: params.status,
  });

  return apiFetch(`${BASE_PATH}/tarif${query}`, {
    method: "GET",
  });
}

/* =========================================================
   POST /api/keuangan/tarif
========================================================= */

export async function createTarif(
  payload: CreateTarifPayload
): Promise<ItemResponse<TarifTagihan>> {
  if (!payload?.kategoriTagihanId) {
    throw new Error("Kategori tagihan wajib dipilih.");
  }

  if (!payload?.tahunAjaranId) {
    throw new Error("Tahun ajaran wajib dipilih.");
  }

  if (
    !Number.isFinite(Number(payload.nominal)) ||
    Number(payload.nominal) <= 0
  ) {
    throw new Error("Nominal tarif harus lebih dari 0.");
  }

  return apiFetch(`${BASE_PATH}/tarif`, {
    method: "POST",
    body: JSON.stringify({
      kategoriTagihanId: payload.kategoriTagihanId,
      tahunAjaranId: payload.tahunAjaranId,
      kelasId: payload.kelasId || undefined,
      tingkat: payload.kelasId ? undefined : payload.tingkat || undefined,
      nominal: Number(payload.nominal),
      keterangan: payload.keterangan?.trim() || undefined,
    }),
  });
}

/* =========================================================
   PUT /api/keuangan/tarif/:id
========================================================= */

export async function updateTarif(
  id: string,
  payload: UpdateTarifPayload
): Promise<ItemResponse<TarifTagihan>> {
  if (!id) {
    throw new Error("ID tarif wajib diisi.");
  }

  const body: Record<string, unknown> = {};

  if (payload.nominal !== undefined) {
    if (
      !Number.isFinite(Number(payload.nominal)) ||
      Number(payload.nominal) <= 0
    ) {
      throw new Error("Nominal tarif harus lebih dari 0.");
    }
    body.nominal = Number(payload.nominal);
  }

  if (payload.keterangan !== undefined) {
    body.keterangan = payload.keterangan.trim();
  }

  if (payload.status !== undefined) body.status = payload.status;

  return apiFetch(`${BASE_PATH}/tarif/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/* =========================================================
   DELETE /api/keuangan/tarif/:id
========================================================= */

export async function deleteTarif(id: string) {
  if (!id) {
    throw new Error("ID tarif wajib diisi.");
  }

  return apiFetch(`${BASE_PATH}/tarif/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
