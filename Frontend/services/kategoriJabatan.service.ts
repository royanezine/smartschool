
import { apiFetch } from "../lib/api";

/* =========================================================
   TYPES
========================================================= */

export type StatusKategoriJabatan = "aktif" | "nonaktif";

export interface TarifJabatan {
  id?: string;
  kategoriJabatanId?: string;
  tarifPerJam: number;
  berlakuMulai?: string | null;
  berakhirPada?: string | null;
  catatan?: string | null;
  dibuatPada?: string;
}

export interface KategoriJabatan {
  id: string;
  sekolahId?: string;
  nama: string;
  kode: string | null;
  keterangan: string | null;
  status: StatusKategoriJabatan;
  tarifAktif?: TarifJabatan | null;
  tarifRiwayat?: TarifJabatan[];
  jumlahPengguna?: number;
  _count?: {
    pengguna?: number;
  };
  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface KategoriJabatanPayload {
  nama: string;
  kode?: string;
  keterangan?: string;
  status?: StatusKategoriJabatan;
  tarifPerJam: number;
  berlakuMulai?: string;
  catatanTarif?: string;
  sekolahId?: string;
}

export interface UpdateKategoriJabatanPayload {
  nama?: string;
  kode?: string;
  keterangan?: string;
  status?: StatusKategoriJabatan;
}

export interface TarifJabatanPayload {
  tarifPerJam: number;
  berlakuMulai?: string;
  catatan?: string;
}

export interface KategoriJabatanQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: StatusKategoriJabatan;
  sekolahId?: string;
}

export interface PaginatedKategoriJabatan {
  data: KategoriJabatan[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalData?: number;
    totalPages?: number;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalData?: number;
    totalPages?: number;
  };
};

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function unwrapData<T>(response: unknown): T {
  let result: unknown = response;

  for (let i = 0; i < 3; i++) {
    if (
      result !== null &&
      typeof result === "object" &&
      "data" in result
    ) {
      result = (result as { data: unknown }).data;
    } else {
      break;
    }
  }

  return result as T;
}

function normalizeTarif(tarif: TarifJabatan): TarifJabatan {
  return {
    ...tarif,
    tarifPerJam: Number(tarif.tarifPerJam ?? 0),
    berlakuMulai: tarif.berlakuMulai ?? null,
    berakhirPada: tarif.berakhirPada ?? null,
    catatan: tarif.catatan ?? null,
  };
}

function normalizeKategori(
  item: KategoriJabatan,
): KategoriJabatan {
  const riwayat = Array.isArray(item.tarifRiwayat)
    ? item.tarifRiwayat.map(normalizeTarif)
    : [];

  const tarifAktif =
    item.tarifAktif != null
      ? normalizeTarif(item.tarifAktif)
      : riwayat.find((tarif) => !tarif.berakhirPada) ?? null;

  return {
    ...item,
    kode: item.kode ?? null,
    keterangan: item.keterangan ?? null,
    jumlahPengguna: Number(
      item.jumlahPengguna ?? item._count?.pengguna ?? 0,
    ),
    tarifRiwayat: riwayat,
    tarifAktif,
  };
}

function buildQuery(params: KategoriJabatanQuery = {}) {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.sekolahId) {
    searchParams.set("sekolahId", params.sekolahId);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function getPagination(
  response: unknown,
  rawData: unknown,
  params: KategoriJabatanQuery,
  itemCount: number,
) {
  const root = response as ApiResponse<unknown>;
  const nested =
    rawData && typeof rawData === "object"
      ? (rawData as ApiResponse<unknown>)
      : undefined;

  const pagination =
    root.pagination ??
    root.meta ??
    nested?.pagination ??
    nested?.meta;

  const page = Number(pagination?.page ?? params.page ?? 1);
  const limit = Number(pagination?.limit ?? params.limit ?? 20);
  const total = Number(
    pagination?.totalData ?? pagination?.total ?? itemCount,
  );

  return {
    page,
    limit,
    total,
    totalPages: Number(
      pagination?.totalPages ??
        Math.ceil(total / Math.max(limit, 1)),
    ),
  };
}

/* =========================================================
   GET ALL KATEGORI JABATAN
========================================================= */

export async function getKategoriJabatan(
  params: KategoriJabatanQuery = {},
): Promise<PaginatedKategoriJabatan> {
  const queryParams = {
    page: 1,
    limit: 20,
    ...params,
  };

  const response = await apiFetch(
    `/api/kategori-jabatan${buildQuery(queryParams)}`,
    { method: "GET" },
  );

  const rawData = unwrapData<unknown>(response);
  let items: KategoriJabatan[] = [];

  if (Array.isArray(rawData)) {
    items = rawData as KategoriJabatan[];
  } else if (
    rawData &&
    typeof rawData === "object"
  ) {
    const objectData = rawData as Record<string, unknown>;

    if (Array.isArray(objectData.items)) {
      items = objectData.items as KategoriJabatan[];
    } else if (Array.isArray(objectData.data)) {
      items = objectData.data as KategoriJabatan[];
    }
  }

  return {
    data: items.map(normalizeKategori),
    ...getPagination(response, rawData, queryParams, items.length),
  };
}

/* =========================================================
   GET DETAIL KATEGORI JABATAN
========================================================= */

export async function getKategoriJabatanById(
  id: string,
): Promise<KategoriJabatan> {
  if (!id) {
    throw new Error("ID kategori jabatan wajib diisi.");
  }

  const response = await apiFetch(
    `/api/kategori-jabatan/${encodeURIComponent(id)}`,
    { method: "GET" },
  );

  return normalizeKategori(
    unwrapData<KategoriJabatan>(response),
  );
}

/* =========================================================
   CREATE KATEGORI JABATAN
========================================================= */

export async function createKategoriJabatan(
  payload: KategoriJabatanPayload,
): Promise<KategoriJabatan> {
  const body: KategoriJabatanPayload = {
    nama: payload.nama.trim(),
    kode: payload.kode?.trim() || undefined,
    keterangan: payload.keterangan?.trim() || undefined,
    status: payload.status ?? "aktif",
    tarifPerJam: Number(payload.tarifPerJam),
    berlakuMulai: payload.berlakuMulai || undefined,
    catatanTarif: payload.catatanTarif?.trim() || undefined,
    ...(payload.sekolahId
      ? { sekolahId: payload.sekolahId }
      : {}),
  };

  const response = await apiFetch("/api/kategori-jabatan", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return normalizeKategori(
    unwrapData<KategoriJabatan>(response),
  );
}

/* =========================================================
   UPDATE KATEGORI JABATAN
========================================================= */

export async function updateKategoriJabatan(
  id: string,
  payload: UpdateKategoriJabatanPayload,
): Promise<KategoriJabatan> {
  if (!id) {
    throw new Error("ID kategori jabatan wajib diisi.");
  }

  const body: UpdateKategoriJabatanPayload = {};

  if (payload.nama !== undefined) {
    body.nama = payload.nama.trim();
  }

  if (payload.kode !== undefined) {
    body.kode = payload.kode.trim();
  }

  if (payload.keterangan !== undefined) {
    body.keterangan = payload.keterangan.trim();
  }

  if (payload.status !== undefined) {
    body.status = payload.status;
  }

  const response = await apiFetch(
    `/api/kategori-jabatan/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );

  return normalizeKategori(
    unwrapData<KategoriJabatan>(response),
  );
}

/* =========================================================
   ADD TARIFF HISTORY
========================================================= */

export async function tambahTarifKategoriJabatan(
  id: string,
  payload: TarifJabatanPayload,
): Promise<KategoriJabatan | TarifJabatan> {
  if (!id) {
    throw new Error("ID kategori jabatan wajib diisi.");
  }

  const body: TarifJabatanPayload = {
    tarifPerJam: Number(payload.tarifPerJam),
    berlakuMulai: payload.berlakuMulai || undefined,
    catatan: payload.catatan?.trim() || undefined,
  };

  const response = await apiFetch(
    `/api/kategori-jabatan/${encodeURIComponent(id)}/tarif`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  return unwrapData<KategoriJabatan | TarifJabatan>(response);
}

/* =========================================================
   DELETE / NONAKTIFKAN KATEGORI
========================================================= */

export async function deleteKategoriJabatan(
  id: string,
): Promise<void> {
  if (!id) {
    throw new Error("ID kategori jabatan wajib diisi.");
  }

  await apiFetch(
    `/api/kategori-jabatan/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
