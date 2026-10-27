
import { getToken, clearSession } from "../lib/auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");



export interface User {
  id: string;

  email: string;
  namaPengguna: string;
  namaLengkap: string;
  avatar?: string | null;

  nipd?: string | null;
  nip?: string | null;
  nuptk?: string | null;
  nisn?: string | null;
  nik?: string | null;

  jabatan?: string | null;
  golongan?: string | null;

  shiftKerja?: string | null;


  shiftKerjaId?: string | null;

  kategoriJabatanId?: string | null;

  shiftKerjaMaster?: {
    id?: string;
    nama?: string | null;
    kode?: string | null;
    jamMasuk?: string | null;
    jamKeluar?: string | null;
  } | null;

  kategoriJabatan?: {
    id?: string;
    nama?: string | null;
    kode?: string | null;
  } | null;

  jenisKelamin?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  alamat?: string | null;
  alamatDomisili?: string | null;
  noTelepon?: string | null;

  status?: string | null;
  dibuatPada?: string | null;
  diperbaruiPada?: string | null;

  sekolah?: {
    id?: string;
    nama?: string | null;
    kode?: string | null;
  } | null;

  peran?: {
    id?: string;
    nama?: string | null;
    namaTampilan?: string | null;
  } | null;

  [key: string]: any;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  limit: number;
  total?: number;
  totalData?: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface GetUsersResponse {
  success: boolean;
  message?: string;
  data: User[];
  meta?: Pagination;
  pagination?: Pagination;
}

export interface GetUserResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface CreateUserPayload {
  email: string;
  namaPengguna?: string;
  namaLengkap: string;
  kataSandi: string;

  peranId?: string | null;
  sekolahId?: string | null;
  yayasanId?: string | null;

  jenisKelamin?: string | null;
  nip?: string | null;
  nuptk?: string | null;
  nipd?: string | null;
  nisn?: string | null;
  nik?: string | null;

  jabatan?: string | null;
  golongan?: string | null;
  status?: string;

  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  noTelepon?: string | null;

  alamat?: string | null;
  alamatKtp?: string | null;
  alamatDomisili?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  kota?: string | null;

  shiftKerja?: "pagi" | "siang";
}

export interface UpdateUserPayload {
  email?: string;
  namaPengguna?: string;
  namaLengkap?: string;
  kataSandi?: string;

  peranId?: string | null;
  sekolahId?: string | null;
  yayasanId?: string | null;

  jenisKelamin?: string | null;
  nip?: string | null;
  nuptk?: string | null;
  nipd?: string | null;
  nisn?: string | null;
  nik?: string | null;

  jabatan?: string | null;
  golongan?: string | null;
  status?: string;

  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  noTelepon?: string | null;

  alamat?: string | null;
  alamatKtp?: string | null;
  alamatDomisili?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  kota?: string | null;

  shiftKerja?: "pagi" | "siang";
}

export interface UserMutationResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface UserAssignmentVerification {
  shift: boolean;
  category: boolean;
}

function hasOwnField(value: unknown, key: string): boolean {
  return (
    value != null &&
    typeof value === "object" &&
    Object.prototype.hasOwnProperty.call(value, key)
  );
}

export function verifyUserAssignment(
  user: unknown
): UserAssignmentVerification {
  if (user == null || typeof user !== "object") {
    return { shift: false, category: false };
  }

  const record = user as Record<string, unknown>;

  return {
    shift:
      hasOwnField(record, "shiftKerjaId") ||
      hasOwnField(record, "shiftKerjaMaster") ||
      (record.shiftKerja != null &&
        typeof record.shiftKerja === "object"),
    category:
      hasOwnField(record, "kategoriJabatanId") ||
      hasOwnField(record, "kategoriJabatan"),
  };
}


async function parseResponse(response: Response): Promise<any> {
  const rawText = await response.text();

  if (!rawText.trim()) return null;

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      message: rawText.slice(0, 1000),
    };
  }
}


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_URL}/api${normalizedEndpoint}`;
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (isFormData) {
    headers.delete("Content-Type");
  } else if (
    options.body != null &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("USER API NETWORK ERROR:", error);

    const netErr = new Error(
      `Tidak dapat terhubung ke server ${API_URL}. Periksa koneksi backend dan konfigurasi API.`
    ) as Error & { status?: number; isNetworkError?: boolean };
    netErr.status = 0;
    netErr.isNetworkError = true;
    throw netErr;
  }

  const result = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    console.error("GAGAL REQUEST USER:", {
      url,
      method: options.method || "GET",
      status: response.status,
      statusText: response.statusText,
      response: result,
    });

    const message =
      result?.message ||
      result?.error ||
      result?.detail ||
      (response.status === 400
        ? "Data pengguna tidak valid."
        : response.status === 401
          ? "Sesi login tidak valid. Silakan login kembali."
          : response.status === 403
            ? "Anda tidak memiliki izin untuk melakukan tindakan ini."
            : response.status === 404
              ? "Data pengguna atau endpoint tidak ditemukan."
              : response.status === 409
                ? "Data pengguna sudah digunakan."
                : `Request gagal (${response.status}).`);

    const err = new Error(message) as Error & { status?: number; data?: any };
    err.status = response.status;
    err.data = result?.data ?? result;
    throw err;
  }

  return result as T;
}


export async function getUsers(
  params: GetUsersParams = {}
): Promise<GetUsersResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status && params.status !== "semua") {
    searchParams.set("status", params.status);
  }

  if (params.role) {
    searchParams.set("role", params.role);
  }

  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }

  return request<GetUsersResponse>(
    `/users?${searchParams.toString()}`
  );
}


export async function getUserById(
  id: string
): Promise<GetUserResponse> {
  if (!id) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  return request<GetUserResponse>(
    `/users/${encodeURIComponent(id)}`
  );
}


export async function createUser(
  payload: CreateUserPayload
): Promise<UserMutationResponse> {
  const cleanPayload = {
    ...payload,
    namaPengguna: payload.namaPengguna?.trim(),
    email: payload.email.trim(),
    namaLengkap: payload.namaLengkap.trim(),
    kataSandi: payload.kataSandi,
    peranId: payload.peranId ?? null,
    sekolahId: payload.sekolahId ?? null,
    yayasanId: payload.yayasanId ?? null,

    nipd: payload.nipd?.trim() || null,
    nip: payload.nip?.trim() || null,
    nuptk: payload.nuptk?.trim() || null,
    nisn: payload.nisn?.trim() || null,
    nik: payload.nik?.trim() || null,

    jenisKelamin: payload.jenisKelamin || null,
    tempatLahir: payload.tempatLahir?.trim() || null,
    tanggalLahir: payload.tanggalLahir || null,
    noTelepon: payload.noTelepon?.trim() || null,

    alamat: payload.alamat?.trim() || null,
    alamatKtp: payload.alamatKtp?.trim() || null,
    alamatDomisili: payload.alamatDomisili?.trim() || null,
    kecamatan: payload.kecamatan?.trim() || null,
    kelurahan: payload.kelurahan?.trim() || null,
    kota: payload.kota?.trim() || null,

    jabatan: payload.jabatan?.trim() || null,
    golongan: payload.golongan?.trim() || null,
    shiftKerja: payload.shiftKerja || null,
  };

  return request<UserMutationResponse>("/users", {
    method: "POST",
    body: JSON.stringify(cleanPayload),
  });
}




export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<UserMutationResponse> {
  if (!id?.trim()) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  const cleanPayload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;

    cleanPayload[key] =
      typeof value === "string" ? value.trim() : value;
  }

  if (
    "email" in cleanPayload &&
    !cleanPayload.email
  ) {
    throw new Error("Email tidak boleh kosong.");
  }

  if (
    "namaLengkap" in cleanPayload &&
    !cleanPayload.namaLengkap
  ) {
    throw new Error("Nama lengkap tidak boleh kosong.");
  }

  return request<UserMutationResponse>(
    `/users/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(cleanPayload),
    }
  );
}


export async function deleteUser(
  id: string
): Promise<UserMutationResponse> {
  if (!id?.trim()) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  return request<UserMutationResponse>(
    `/users/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}


export async function updateUserStatus(
  id: string,
  status: string
): Promise<UserMutationResponse> {
  if (!id?.trim()) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  if (!status?.trim()) {
    throw new Error("Status pengguna wajib diisi.");
  }

  return request<UserMutationResponse>(
    `/users/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({ status: status.trim() }),
    }
  );
}


export async function getGuruById(id: string) {
  if (!id) {
    throw new Error("ID guru tidak ditemukan.");
  }

  const response = await getUsers({
    page: 1,
    limit: 100,
    role: "guru",
  });

  const guru = response?.data?.find(
    (item) => String(item.id) === String(id)
  );

  if (!guru) {
    throw new Error("Data guru tidak ditemukan.");
  }

  return {
    success: true,
    data: guru,
  };
}


export async function resetUserPassword(
  id: string
): Promise<UserMutationResponse> {
  if (!id?.trim()) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  return request<UserMutationResponse>(
    `/users/${encodeURIComponent(id)}/reset-password`,
    {
      method: "PATCH",
    }
  );
}



export interface UpdateProfilePayload {
  namaLengkap?: string;
  noTelepon?: string | null;
  alamat?: string | null;
  avatar?: string | null;
  alamatDomisili?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
}

export async function getProfile() {
  return request<{
    success: boolean;
    message: string;
    data: User;
  }>("/users/profile");
}

export async function updateProfile(
  payload: UpdateProfilePayload
) {
  return request<{
    success: boolean;
    message: string;
    data: User;
  }>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}


export interface WaliKelasGuru {
  id: string;
  nama: string;
  nip: string;
  email: string;
  telp: string;
  jabatan: string;
  status: string;
}

function extractUserList(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function extractUserDetail(response: any): any {
  if (!response) return null;
  if (response.data !== undefined) {
    return response.data?.data ?? response.data;
  }
  return response;
}

function normalizeGuru(user: any): WaliKelasGuru {
  return {
    id: String(user?.id ?? ""),
    nama: String(
      user?.namaLengkap ?? user?.nama ?? ""
    ),
    nip: String(user?.nip ?? ""),
    email: String(user?.email ?? ""),
    telp: String(user?.noTelepon ?? ""),
    jabatan: String(user?.jabatan ?? ""),
    status: String(user?.status ?? ""),
  };
}

export async function getGuruWaliKelasList(): Promise<
  WaliKelasGuru[]
> {
  const rows: any[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getUsers({
      page,
      limit: 100,
      role: "guru",
      sortBy: "namaLengkap",
      sortOrder: "asc",
    });

    rows.push(...extractUserList(response));

    const nextTotal = Number(
      response?.pagination?.totalPages ??
        (response as any)?.meta?.totalPages ??
        1
    );

    totalPages =
      Number.isFinite(nextTotal) && nextTotal > 0
        ? nextTotal
        : 1;

    page += 1;
  } while (page <= totalPages && page <= 50);

  return rows
    .map(normalizeGuru)
    .filter((guru) => guru.id && guru.nama)
    .sort((a, b) => {
      const statusA = a.status === "nonaktif" ? 1 : 0;
      const statusB = b.status === "nonaktif" ? 1 : 0;
      return statusA - statusB;
    });
}

export async function getGuruWaliKelasDetail(
  id: string
): Promise<WaliKelasGuru> {
  if (!id) {
    throw new Error("ID guru wajib diisi.");
  }

  const response = await getUserById(id);
  const data = extractUserDetail(response);

  if (!data?.id) {
    throw new Error("Data guru tidak ditemukan.");
  }

  return normalizeGuru(data);
}

