
const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/+$/,
    ""
  );

/* =========================================================
   TYPES
========================================================= */

export interface User {
  id: string;

  email?: string | null;
  namaPengguna?: string | null;
  username?: string | null;
  namaLengkap?: string | null;
  nama?: string | null;

  avatar?: string | null;
  fotoProfil?: string | null;

  nip?: string | null;
  nuptk?: string | null;
  nipd?: string | null;
  nisn?: string | null;
  nik?: string | null;

  jenisKelamin?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  noTelepon?: string | null;

  alamat?: string | null;
  alamatKtp?: string | null;
  alamatDomisili?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  kota?: string | null;

  status?: string | null;
  jabatan?: string | null;
  golongan?: string | null;
  shiftKerja?: string | null;

  sekolahId?: string | null;
  yayasanId?: string | null;
  peranId?: string | null;

  sekolah?: {
    id: string;
    nama?: string | null;
    kode?: string | null;
  } | null;

  yayasan?: {
    id: string;
    nama?: string | null;
  } | null;

  peran?: {
    id: string;
    nama?: string | null;
    namaTampilan?: string | null;
  } | null;

  dibuatPada?: string | null;
  diperbaruiPada?: string | null;

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
  totalData: number;
  totalPages: number;
}

export interface GetUsersResponse {
  success: boolean;
  message?: string;
  data: User[];
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

/* =========================================================
   TOKEN
========================================================= */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
  ];

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);

    if (value?.trim()) {
      return value
        .trim()
        .replace(/^Bearer\s+/i, "");
    }
  }

  return null;
}

/* =========================================================
   RESPONSE PARSER
========================================================= */

async function parseResponse(response: Response): Promise<any> {
  const rawText = await response.text();

  if (!rawText.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    console.error("Response server bukan JSON:", {
      status: response.status,
      body: rawText,
    });

    if (!response.ok) {
      return {
        message: rawText.slice(0, 500),
      };
    }

    throw new Error(
      `Server mengembalikan response tidak valid (${response.status}).`
    );
  }
}

/* =========================================================
   REQUEST
========================================================= */

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

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_URL}/api${normalizedEndpoint}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("User service network error:", error);

    throw new Error(
      `Tidak dapat terhubung ke server (${API_URL}). Pastikan backend berjalan dan alamat API benar.`
    );
  }

  const result = await parseResponse(response);

  if (!response.ok) {
    console.error("GAGAL REQUEST USER:", {
      url,
      method: options.method || "GET",
      status: response.status,
      response: result,
    });

    const message =
      result?.message ||
      result?.error ||
      result?.detail ||
      (response.status === 401
        ? "Sesi login tidak valid. Silakan login kembali."
        : response.status === 403
          ? "Akses ditolak. Anda tidak memiliki izin."
          : response.status === 404
            ? "Endpoint pengguna tidak ditemukan."
            : response.status === 409
              ? "Data pengguna sudah digunakan."
              : `Request gagal (${response.status})`);

    throw new Error(message);
  }

  return result as T;
}

/* =========================================================
   GET USERS
   GET /api/users
========================================================= */

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

/* =========================================================
   GET USER BY ID
   GET /api/users/:id
========================================================= */

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

/* =========================================================
   CREATE USER
   POST /api/users
========================================================= */



export async function createUser(
  payload: CreateUserPayload
): Promise<UserMutationResponse> {
  const cleanPayload = {
    ...payload,
    namaPengguna: payload.namaPengguna?.trim(),
    email: payload.email.trim(),
    namaLengkap: payload.namaLengkap.trim(),
    kataSandi: payload.kataSandi,
    peranId: payload.peranId,
    sekolahId: payload.sekolahId || null,

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

/* =========================================================
   UPDATE USER
   PUT /api/users/:id
========================================================= */

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<UserMutationResponse> {
  if (!id) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  return request<UserMutationResponse>(
    `/users/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

/* =========================================================
   DELETE USER
   DELETE /api/users/:id
========================================================= */

export async function deleteUser(
  id: string
): Promise<UserMutationResponse> {
  if (!id) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  return request<UserMutationResponse>(
    `/users/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================================================
   UPDATE USER STATUS
   PUT /api/users/:id
========================================================= */

export async function updateUserStatus(
  id: string,
  status: string
): Promise<UserMutationResponse> {
  if (!id) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  if (!status?.trim()) {
    throw new Error("Status pengguna wajib diisi.");
  }

  return request<UserMutationResponse>(
    `/users/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    }
  );
}

/* =========================================================
   GET GURU BY ID
========================================================= */

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

/* =========================================================
   RESET PASSWORD
   PATCH /api/users/:id/reset-password
========================================================= */

export async function resetUserPassword(
  id: string
): Promise<UserMutationResponse> {
  if (!id) {
    throw new Error("ID pengguna tidak ditemukan.");
  }

  return request<UserMutationResponse>(
    `/users/${encodeURIComponent(id)}/reset-password`,
    {
      method: "PATCH",
    }
  );
}