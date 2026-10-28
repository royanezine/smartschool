
import { apiFetch } from "../lib/api";


export type StatusShiftKerja = "aktif" | "nonaktif";

export interface ShiftKerja {
  id: string;
  sekolahId: string;
  nama: string;
  kode: string | null;
  jamMasuk: string;
  jamKeluar: string;
  toleransiTerlambatMenit: number;
  status: StatusShiftKerja;
  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
  jumlahPegawai?: number;
  totalAbsensi?: number;
  _count?: {
    pengguna?: number;
    absensi?: number;
  };
}

export interface ShiftKerjaPayload {
  nama: string;
  kode?: string;
  jamMasuk: string;
  jamKeluar: string;
  toleransiTerlambatMenit?: number;
  status?: StatusShiftKerja;
  sekolahId?: string;
}

export interface UpdateShiftKerjaPayload {
  nama?: string;
  kode?: string;
  jamMasuk?: string;
  jamKeluar?: string;
  toleransiTerlambatMenit?: number;
  status?: StatusShiftKerja;
}

export interface ShiftKerjaQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: StatusShiftKerja;
  sekolahId?: string;
}

export interface PaginatedShiftKerja {
  data: ShiftKerja[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AssignUserShiftPayload {
  penggunaId: string;
  shiftKerjaId: string | null;
  kategoriJabatanId?: string | null;
}

export interface AssignedUserShift {
  id: string;
  namaLengkap: string;
  email: string;
  shiftKerjaId: string | null;
  kategoriJabatanId: string | null;
  shiftKerjaMaster?: ShiftKerja | null;
  kategoriJabatan?: unknown;
}


type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};


function unwrapData<T>(response: unknown): T {
  let result: unknown = response;

  for (let i = 0; i < 2; i++) {
    if (
      result !== null &&
      typeof result === "object" &&
      "data" in result
    ) {
      result = result.data;
    } else {
      break;
    }
  }

  return result as T;
}

function normalizeShift(shift: ShiftKerja): ShiftKerja {
  return {
    ...shift,
    kode: shift.kode ?? null,
    toleransiTerlambatMenit: Number(
      shift.toleransiTerlambatMenit ?? 0,
    ),
    jumlahPegawai: Number(
      shift.jumlahPegawai ?? shift._count?.pengguna ?? 0,
    ),
    totalAbsensi: Number(
      shift.totalAbsensi ?? shift._count?.absensi ?? 0,
    ),
  };
}

function buildQuery(params: ShiftKerjaQuery = {}): string {
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





export async function getShiftKerjaById(
  id: string,
): Promise<ShiftKerja> {
  if (!id) {
    throw new Error("ID shift kerja wajib diisi.");
  }

  const response = await apiFetch(
    `/api/shift-kerja/${encodeURIComponent(id)}`,
    {
      method: "GET",
    },
  );

  return normalizeShift(unwrapData<ShiftKerja>(response));
}


export async function createShiftKerja(
  payload: ShiftKerjaPayload,
): Promise<ShiftKerja> {
  const body: ShiftKerjaPayload = {
    nama: payload.nama.trim(),
    kode: payload.kode?.trim() || undefined,
    jamMasuk: payload.jamMasuk,
    jamKeluar: payload.jamKeluar,
    toleransiTerlambatMenit:
      payload.toleransiTerlambatMenit ?? 15,
    status: payload.status ?? "aktif",
    ...(payload.sekolahId
      ? { sekolahId: payload.sekolahId }
      : {}),
  };

  const response = await apiFetch("/api/shift-kerja", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return unwrapData<ShiftKerja>(response);
}


export async function updateShiftKerja(
  id: string,
  payload: UpdateShiftKerjaPayload,
): Promise<ShiftKerja> {
  if (!id) {
    throw new Error("ID shift kerja wajib diisi.");
  }

  const body: UpdateShiftKerjaPayload = {};

  if (payload.nama !== undefined) {
    body.nama = payload.nama.trim();
  }

  if (payload.kode !== undefined) {
    body.kode = payload.kode.trim();
  }

  if (payload.jamMasuk !== undefined) {
    body.jamMasuk = payload.jamMasuk;
  }

  if (payload.jamKeluar !== undefined) {
    body.jamKeluar = payload.jamKeluar;
  }

  if (payload.toleransiTerlambatMenit !== undefined) {
    body.toleransiTerlambatMenit =
      payload.toleransiTerlambatMenit;
  }

  if (payload.status !== undefined) {
    body.status = payload.status;
  }

  const response = await apiFetch(
    `/api/shift-kerja/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );

  return unwrapData<ShiftKerja>(response);
}


export async function deleteShiftKerja(
  id: string,
): Promise<void> {
  if (!id) {
    throw new Error("ID shift kerja wajib diisi.");
  }

  await apiFetch(
    `/api/shift-kerja/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}



export async function getShiftKerja(
  params: ShiftKerjaQuery = {},
): Promise<PaginatedShiftKerja> {
  const query = buildQuery({
    page: 1,
    limit: 100,
    ...params,
  });

  const response = await apiFetch(`/shift-kerja${query}`, {
    method: "GET",
  });

  const result = response as ApiResponse<unknown>;
  const rawData = unwrapData<unknown>(response);

  let items: ShiftKerja[] = [];

  if (Array.isArray(rawData)) {
    items = rawData as ShiftKerja[];
  } else if (
    rawData &&
    typeof rawData === "object" &&
    Array.isArray((rawData as Record<string, unknown>).items)
  ) {
    items = (rawData as { items: ShiftKerja[] }).items;
  }

  const pagination =
    result.pagination ??
    result.meta ??
    (rawData && typeof rawData === "object"
      ? (rawData as ApiResponse<unknown>).pagination ??
        (rawData as ApiResponse<unknown>).meta
      : undefined);

  const page = Number(pagination?.page ?? params.page ?? 1);
  const limit = Number(pagination?.limit ?? params.limit ?? 100);
  const total = Number(pagination?.total ?? items.length);

  return {
    data: items.map(normalizeShift),
    page,
    limit,
    total,
    totalPages: Number(
      pagination?.totalPages ??
        Math.ceil(total / Math.max(limit, 1)),
    ),
  };
}

export async function assignUserShiftAndJabatan(
  payload: AssignUserShiftPayload,
): Promise<AssignedUserShift> {
  if (!payload.penggunaId) {
    throw new Error("Pegawai wajib dipilih.");
  }

  const body: AssignUserShiftPayload = {
    penggunaId: payload.penggunaId,
    shiftKerjaId: payload.shiftKerjaId,
  };

  if (payload.kategoriJabatanId !== undefined) {
    body.kategoriJabatanId = payload.kategoriJabatanId;
  }

  const response = await apiFetch("/shift-kerja/assign-user", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return unwrapData<AssignedUserShift>(response);
}
