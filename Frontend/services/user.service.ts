const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  nipd?: string | null;
  nisn?: string | null;

  jenisKelamin?: string | null;

  status?: string | null;

  jabatan?: string | null;
  golongan?: string | null;

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
  nipd?: string | null;
  nisn?: string | null;

  jabatan?: string | null;
  golongan?: string | null;

  status?: string;
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
  nipd?: string | null;
  nisn?: string | null;

  jabatan?: string | null;
  golongan?: string | null;

  status?: string;
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

    if (value && value.trim()) {
      return value
        .trim()
        .replace(/^Bearer\s+/i, "");
    }
  }

  return null;
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

  if (!headers.has("Content-Type")) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  headers.set(
    "Accept",
    "application/json"
  );

  headers.set(
    "Authorization",
    `Bearer ${token}`
  );

  const url = `${API_URL}/api${endpoint}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error(
      "User service network error:",
      error
    );

    throw new Error(
      "Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000."
    );
  }

  const rawText = await response.text();

  let result: any = null;

  if (rawText.trim()) {
    try {
      result = JSON.parse(rawText);
    } catch {
      console.error(
        "Response user bukan JSON:",
        {
          url,
          status: response.status,
          body: rawText,
        }
      );

      throw new Error(
        `Server mengembalikan response tidak valid (${response.status}).`
      );
    }
  }

  /* =====================================================
     401 - UNAUTHORIZED
  ===================================================== */

  if (response.status === 401) {
    throw new Error(
      result?.message ||
        "Sesi login sudah tidak valid. Silakan login kembali."
    );
  }

  /* =====================================================
     403 - FORBIDDEN
  ===================================================== */

  if (response.status === 403) {
    throw new Error(
      result?.message ||
        "Akses ditolak. Anda tidak memiliki izin untuk mengelola pengguna."
    );
  }

  /* =====================================================
     404 - NOT FOUND
  ===================================================== */

  if (response.status === 404) {
    throw new Error(
      result?.message ||
        "Endpoint pengguna tidak ditemukan."
    );
  }

  /* =====================================================
     409 - CONFLICT
  ===================================================== */

  if (response.status === 409) {
    throw new Error(
      result?.message ||
        "Data pengguna sudah digunakan."
    );
  }

  /* =====================================================
     OTHER ERROR
  ===================================================== */

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `Request gagal (${response.status})`
    );
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
  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "page",
    String(params.page ?? 1)
  );

  searchParams.set(
    "limit",
    String(params.limit ?? 10)
  );

  if (params.search?.trim()) {
    searchParams.set(
      "search",
      params.search.trim()
    );
  }

  if (
    params.status &&
    params.status !== "semua"
  ) {
    searchParams.set(
      "status",
      params.status
    );
  }

  if (params.role) {
    searchParams.set(
      "role",
      params.role
    );
  }

  if (params.sortBy) {
    searchParams.set(
      "sortBy",
      params.sortBy
    );
  }

  if (params.sortOrder) {
    searchParams.set(
      "sortOrder",
      params.sortOrder
    );
  }

  const query =
    searchParams.toString();

  return request<GetUsersResponse>(
    `/users${query ? `?${query}` : ""}`
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
    throw new Error(
      "ID pengguna tidak ditemukan."
    );
  }

  return request<GetUserResponse>(
    `/users/${id}`
  );
}

/* =========================================================
   CREATE USER
   POST /api/users
========================================================= */

export async function createUser(
  payload: CreateUserPayload
): Promise<UserMutationResponse> {
  if (!payload.email?.trim()) {
    throw new Error(
      "Email pengguna wajib diisi."
    );
  }

  if (!payload.namaLengkap?.trim()) {
    throw new Error(
      "Nama lengkap pengguna wajib diisi."
    );
  }

  if (!payload.kataSandi?.trim()) {
    throw new Error(
      "Kata sandi pengguna wajib diisi."
    );
  }

  return request<UserMutationResponse>(
    "/users",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
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
    throw new Error(
      "ID pengguna tidak ditemukan."
    );
  }

  return request<UserMutationResponse>(
    `/users/${id}`,
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
    throw new Error(
      "ID pengguna tidak ditemukan."
    );
  }

  return request<UserMutationResponse>(
    `/users/${id}`,
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
    throw new Error(
      "ID pengguna tidak ditemukan."
    );
  }

  if (!status?.trim()) {
    throw new Error(
      "Status pengguna wajib diisi."
    );
  }

  return request<UserMutationResponse>(
    `/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
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
(item: any) => String(item.id) === String(id)
);

if (!guru) {
throw new Error("Data guru tidak ditemukan.");
}

return {
success: true,
data: guru,
};
}
