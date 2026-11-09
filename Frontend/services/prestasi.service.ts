
import { apiFetch } from "../lib/api";

const PRESTASI_ENDPOINT = "/api/prestasi";
const SISWA_ENDPOINT = "/api/users";
const KELAS_ENDPOINT = "/api/kelas";

export interface PrestasiPayload {
  siswaId?: string | null;
  kelasId?: string | null;
  namaSiswa?: string;
  kelas?: string | null;
  namaLomba: string;
  tingkat: string;
  juara: string;
  bulan?: string | null;
  tahun: number;
  penyelenggara: string;
  keterangan?: string | null;
  sertifikatUrl?: string | null;
}

export interface PrestasiFilter {
  tingkat?: string;
  tahun?: number | string;
  bulan?: string;
  search?: string;
  siswaId?: string;
  kelasId?: string;
  sekolahId?: string;
}

export interface PrestasiSiswa {
  id: string;
  namaLengkap: string;
  nipd?: string | null;
  nisn?: string | null;
}

export interface PrestasiKelas {
  id: string;
  nama: string;
  tingkat?: string | null;
}

export interface PrestasiRelasiSiswa {
  id: string;
  namaLengkap: string;
  nipd?: string | null;
  nisn?: string | null;
}

export interface PrestasiRelasiKelas {
  id: string;
  nama: string;
  tingkat?: string | null;
}

export interface Prestasi {
  id: string;
  sekolahId: string;
  siswaId?: string | null;
  kelasId?: string | null;
  namaSiswa: string;
  kelas?: string | null;
  namaLomba: string;
  tingkat: string;
  juara: string;
  bulan?: string | null;
  tahun: number;
  penyelenggara: string;
  keterangan?: string | null;
  sertifikatUrl?: string | null;
  siswa?: PrestasiRelasiSiswa | null;
  kelasRel?: PrestasiRelasiKelas | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ApiListResponse<T> {
  success?: boolean;
  message?: string;
  data?: T[] | {
    items?: T[];
    data?: T[];
    users?: T[];
    siswa?: T[];
    kelas?: T[];
    prestasi?: T[];
    results?: T[];
  };
  items?: T[];
  users?: T[];
  siswa?: T[];
  kelas?: T[];
  prestasi?: T[];
  results?: T[];
}

const buildQuery = (params?: PrestasiFilter): string => {
  const query = new URLSearchParams();

  if (!params) {
    return "";
  }

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.append(key, String(value));
    }
  });

  const result = query.toString();

  return result ? `?${result}` : "";
};

const extractArray = <T,>(
  response: ApiListResponse<T> | T[] | null,
): T[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && !Array.isArray(response.data)) {
    const nested = response.data;

    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.data)) return nested.data;
    if (Array.isArray(nested.users)) return nested.users;
    if (Array.isArray(nested.siswa)) return nested.siswa;
    if (Array.isArray(nested.kelas)) return nested.kelas;
    if (Array.isArray(nested.prestasi)) return nested.prestasi;
    if (Array.isArray(nested.results)) return nested.results;
  }

  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.users)) return response.users;
  if (Array.isArray(response.siswa)) return response.siswa;
  if (Array.isArray(response.kelas)) return response.kelas;
  if (Array.isArray(response.prestasi)) return response.prestasi;
  if (Array.isArray(response.results)) return response.results;

  return [];
};

export const getPrestasi = async (
  params?: PrestasiFilter,
): Promise<ApiResponse<Prestasi[]>> => {
  const query = buildQuery(params);

  return apiFetch(`${PRESTASI_ENDPOINT}${query}`, {
    method: "GET",
  });
};

export const getPrestasiById = async (
  id: string,
): Promise<ApiResponse<Prestasi>> => {
  if (!id) {
    throw new Error("ID prestasi wajib diisi");
  }

  return apiFetch(`${PRESTASI_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "GET",
  });
};

export const createPrestasi = async (
  payload: PrestasiPayload,
): Promise<ApiResponse<Prestasi>> => {
  return apiFetch(PRESTASI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const updatePrestasi = async (
  id: string,
  payload: Partial<PrestasiPayload>,
): Promise<ApiResponse<Prestasi>> => {
  if (!id) {
    throw new Error("ID prestasi wajib diisi");
  }

  return apiFetch(`${PRESTASI_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const deletePrestasi = async (
  id: string,
): Promise<ApiResponse<null>> => {
  if (!id) {
    throw new Error("ID prestasi wajib diisi");
  }

  return apiFetch(`${PRESTASI_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

export const getSiswaPrestasi = async (): Promise<
  PrestasiSiswa[]
> => {
  const response = await apiFetch(
    `${SISWA_ENDPOINT}?role=siswa&page=1&limit=1000`,
    {
      method: "GET",
    },
  );

  return extractArray<PrestasiSiswa>(
    response as ApiListResponse<PrestasiSiswa> | PrestasiSiswa[],
  ).filter(
    (item) =>
      Boolean(item.id) &&
      Boolean(item.namaLengkap),
  );
};

export const getKelasPrestasi = async (): Promise<
  PrestasiKelas[]
> => {
  const response = await apiFetch(
    `${KELAS_ENDPOINT}?page=1&limit=1000`,
    {
      method: "GET",
    },
  );

  return extractArray<PrestasiKelas>(
    response as ApiListResponse<PrestasiKelas> | PrestasiKelas[],
  ).filter(
    (item) =>
      Boolean(item.id) &&
      Boolean(item.nama),
  );
};
