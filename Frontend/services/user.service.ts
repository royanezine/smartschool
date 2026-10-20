
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

/* =========================================================
   TYPES
========================================================= */


export interface User {
  id: string;

  // Informasi akun
  email: string;
  namaPengguna: string;
  namaLengkap: string;
  avatar?: string | null;

  // Identitas
  nipd?: string | null;
  nip?: string | null;
  nuptk?: string | null;
  nisn?: string | null;
  nik?: string | null;

  // Jabatan dan kepegawaian
  jabatan?: string | null;
  golongan?: string | null;

  // Shift kerja berupa nilai sederhana, misalnya "pagi" atau "siang"
  shiftKerja?: string | null;

  // ID relasi master shift kerja
  shiftKerjaId?: string | null;

  // ID relasi kategori jabatan
  kategoriJabatanId?: string | null;

  // Data master shift kerja dari backend
  shiftKerjaMaster?: {
    id?: string;
    nama?: string | null;
    kode?: string | null;
    jamMasuk?: string | null;
    jamKeluar?: string | null;
  } | null;

  // Data kategori jabatan dari backend
  kategoriJabatan?: {
    id?: string;
    nama?: string | null;
    kode?: string | null;
  } | null;

  // Informasi pribadi
  jenisKelamin?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  alamat?: string | null;
  alamatDomisili?: string | null;
  noTelepon?: string | null;

  // Status dan waktu
  status?: string | null;
  dibuatPada?: string | null;
  diperbaruiPada?: string | null;

  // Sekolah
  sekolah?: {
    id?: string;
    nama?: string | null;
    kode?: string | null;
  } | null;

  // Peran pengguna
  peran?: {
    id?: string;
    nama?: string | null;
    namaTampilan?: string | null;
  } | null;

  // Mendukung properti tambahan dari response backend
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
  if (typeof window === "undefined") return null;

  const keys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value?.trim()) {
      return value.trim().replace(/^Bearer\s+/i, "");
    }
  }

  return null;
}

/* =========================================================
   RESPONSE PARSER
========================================================= */

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

    throw new Error(
      `Tidak dapat terhubung ke server ${API_URL}. Periksa koneksi backend dan konfigurasi API.`
    );
  }

  const result = await parseResponse(response);

  if (!response.ok) {
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

/* =========================================================
   UPDATE USER
   PUT /api/users/:id
========================================================= */



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

  // Validasi hanya untuk field yang memang dikirim.
  // Ini memungkinkan update status saja tanpa mengirim seluruh profil.
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

/* =========================================================
   DELETE USER
   DELETE /api/users/:id
========================================================= */

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

/* =========================================================
   UPDATE USER STATUS
   PUT /api/users/:id
========================================================= */

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

