// =========================================================
// BK SERVICE
// =========================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const BK_BASE_PATH = "/api/bk";

// =========================================================
// TYPES - SESI KONSELING
// =========================================================

export interface SesiKonseling {
  id: string;
  sekolahId: string;

  siswaId: string;
  konselorId?: string | null;

  tanggal: string;

  waktuMulai?: string | null;
  waktuSelesai?: string | null;

  topik: string;
  masalah?: string | null;
  hasil?: string | null;
  tindakLanjut?: string | null;

  status?: string | null;
  catatan?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;

  siswa?: {
    id: string;
    namaLengkap?: string | null;
    nis?: string | null;
    nisn?: string | null;
  } | null;

  konselor?: {
    id: string;
    namaLengkap?: string | null;
    nip?: string | null;
  } | null;
}

// =========================================================
// TYPES - KATEGORI PELANGGARAN
// =========================================================

export interface KategoriPelanggaran {
  id: string;
  sekolahId: string;

  nama: string;
  deskripsi?: string | null;

  poin: number;

  status?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}

// =========================================================
// TYPES - PELANGGARAN SISWA
// =========================================================

export interface PelanggaranSiswa {
  id: string;
  sekolahId: string;

  siswaId: string;
  kategoriPelanggaranId: string;

  tanggal: string;

  kronologi?: string | null;

  poin?: number | null;

  status?: string | null;

  tindakLanjut?: string | null;

  catatan?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;

  siswa?: {
    id: string;
    namaLengkap?: string | null;
    nis?: string | null;
    nisn?: string | null;
  } | null;

  kategoriPelanggaran?: {
    id: string;
    nama: string;
    deskripsi?: string | null;
    poin: number;
    status?: string | null;
  } | null;
}

// =========================================================
// TYPES - ASESMEN MINAT BAKAT
// =========================================================

export interface AsesmenMinatBakat {
  id: string;
  sekolahId: string;

  siswaId: string;

  tanggal: string;

  jenis: string;

  minat?: string | null;

  bakat?: string | null;

  hasil?: string | null;

  rekomendasi?: string | null;

  skor?: number | null;

  status?: string | null;

  catatan?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;

  siswa?: {
    id: string;
    namaLengkap?: string | null;
    nis?: string | null;
    nisn?: string | null;
  } | null;
}

// =========================================================
// REQUEST TYPES - KONSELING
// =========================================================

export interface CreateSesiKonselingPayload {
  siswaId: string;
  konselorId?: string | null;

  tanggal: string;

  waktuMulai?: string | null;
  waktuSelesai?: string | null;

  topik: string;

  masalah?: string | null;
  hasil?: string | null;
  tindakLanjut?: string | null;

  status?: string | null;

  catatan?: string | null;
}

export interface UpdateSesiKonselingPayload {
  siswaId?: string;
  konselorId?: string | null;

  tanggal?: string;

  waktuMulai?: string | null;
  waktuSelesai?: string | null;

  topik?: string;

  masalah?: string | null;
  hasil?: string | null;
  tindakLanjut?: string | null;

  status?: string | null;

  catatan?: string | null;
}

// =========================================================
// REQUEST TYPES - KATEGORI
// =========================================================

export interface CreateKategoriPelanggaranPayload {
  nama: string;
  deskripsi?: string | null;
  poin: number;
  status?: string | null;
}

export interface UpdateKategoriPelanggaranPayload {
  nama?: string;
  deskripsi?: string | null;
  poin?: number;
  status?: string | null;
}

// =========================================================
// REQUEST TYPES - PELANGGARAN
// =========================================================

export interface CreatePelanggaranSiswaPayload {
  siswaId: string;
  kategoriPelanggaranId: string;

  tanggal: string;

  kronologi?: string | null;

  poin?: number | null;

  status?: string | null;

  tindakLanjut?: string | null;

  catatan?: string | null;
}

export interface UpdatePelanggaranSiswaPayload {
  kategoriPelanggaranId?: string;

  tanggal?: string;

  kronologi?: string | null;

  poin?: number | null;

  status?: string | null;

  tindakLanjut?: string | null;

  catatan?: string | null;
}

// =========================================================
// REQUEST TYPES - ASESMEN
// =========================================================

export interface CreateAsesmenMinatBakatPayload {
  siswaId: string;

  tanggal: string;

  jenis: string;

  minat?: string | null;

  bakat?: string | null;

  hasil?: string | null;

  rekomendasi?: string | null;

  skor?: number | null;

  status?: string | null;

  catatan?: string | null;
}

export interface UpdateAsesmenMinatBakatPayload {
  siswaId?: string;

  tanggal?: string;

  jenis?: string;

  minat?: string | null;

  bakat?: string | null;

  hasil?: string | null;

  rekomendasi?: string | null;

  skor?: number | null;

  status?: string | null;

  catatan?: string | null;
}

// =========================================================
// HELPER
// =========================================================

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

function getHeaders(): HeadersInit {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function handleResponse<T>(
  response: Response
): Promise<T> {
  let result: any = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    const message =
      result?.message ||
      result?.error ||
      `Request gagal dengan status ${response.status}`;

    throw new Error(message);
  }

  if (
    result &&
    typeof result === "object" &&
    "data" in result
  ) {
    return result.data as T;
  }

  if (
    result &&
    typeof result === "object" &&
    "result" in result
  ) {
    return result.result as T;
  }

  return result as T;
}

// =========================================================
// 1. SESI KONSELING
// =========================================================

const KONSELING_PATH =
  `${BK_BASE_PATH}/konseling`;

export async function getSesiKonseling(): Promise<
  SesiKonseling[]
> {
  const response = await fetch(
    `${API_URL}${KONSELING_PATH}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse<SesiKonseling[]>(response);
}

export async function getSesiKonselingById(
  id: string
): Promise<SesiKonseling> {
  if (!id) {
    throw new Error("ID sesi konseling wajib diisi");
  }

  const response = await fetch(
    `${API_URL}${KONSELING_PATH}/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse<SesiKonseling>(response);
}

export async function createSesiKonseling(
  payload: CreateSesiKonselingPayload
): Promise<SesiKonseling> {
  if (!payload.siswaId) {
    throw new Error("Siswa wajib dipilih");
  }

  if (!payload.tanggal) {
    throw new Error("Tanggal wajib diisi");
  }

  if (!payload.topik) {
    throw new Error("Topik wajib diisi");
  }

  const response = await fetch(
    `${API_URL}${KONSELING_PATH}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<SesiKonseling>(response);
}

export async function updateSesiKonseling(
  id: string,
  payload: UpdateSesiKonselingPayload
): Promise<SesiKonseling> {
  if (!id) {
    throw new Error("ID sesi konseling wajib diisi");
  }

  const response = await fetch(
    `${API_URL}${KONSELING_PATH}/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<SesiKonseling>(response);
}

export async function deleteSesiKonseling(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error("ID sesi konseling wajib diisi");
  }

  const response = await fetch(
    `${API_URL}${KONSELING_PATH}/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  await handleResponse<any>(response);
}

// =========================================================
// 2. KATEGORI PELANGGARAN
// =========================================================

const KATEGORI_PATH =
  `${BK_BASE_PATH}/kategori-pelanggaran`;

export async function getKategoriPelanggaran(): Promise<
  KategoriPelanggaran[]
> {
  const response = await fetch(
    `${API_URL}${KATEGORI_PATH}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse<KategoriPelanggaran[]>(response);
}

export async function createKategoriPelanggaran(
  payload: CreateKategoriPelanggaranPayload
): Promise<KategoriPelanggaran> {
  if (!payload.nama) {
    throw new Error("Nama kategori wajib diisi");
  }

  if (
    payload.poin === undefined ||
    payload.poin === null
  ) {
    throw new Error("Poin wajib diisi");
  }

  const response = await fetch(
    `${API_URL}${KATEGORI_PATH}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<KategoriPelanggaran>(
    response
  );
}

export async function updateKategoriPelanggaran(
  id: string,
  payload: UpdateKategoriPelanggaranPayload
): Promise<KategoriPelanggaran> {
  if (!id) {
    throw new Error(
      "ID kategori pelanggaran wajib diisi"
    );
  }

  const response = await fetch(
    `${API_URL}${KATEGORI_PATH}/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<KategoriPelanggaran>(
    response
  );
}

export async function deleteKategoriPelanggaran(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID kategori pelanggaran wajib diisi"
    );
  }

  const response = await fetch(
    `${API_URL}${KATEGORI_PATH}/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  await handleResponse<any>(response);
}

// =========================================================
// 3. PELANGGARAN SISWA
// =========================================================

const PELANGGARAN_PATH =
  `${BK_BASE_PATH}/pelanggaran`;

export async function getPelanggaranSiswa(): Promise<
  PelanggaranSiswa[]
> {
  const response = await fetch(
    `${API_URL}${PELANGGARAN_PATH}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse<PelanggaranSiswa[]>(response);
}

export async function createPelanggaranSiswa(
  payload: CreatePelanggaranSiswaPayload
): Promise<PelanggaranSiswa> {
  if (!payload.siswaId) {
    throw new Error("Siswa wajib dipilih");
  }

  if (!payload.kategoriPelanggaranId) {
    throw new Error(
      "Kategori pelanggaran wajib dipilih"
    );
  }

  if (!payload.tanggal) {
    throw new Error("Tanggal wajib diisi");
  }

  const response = await fetch(
    `${API_URL}${PELANGGARAN_PATH}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<PelanggaranSiswa>(
    response
  );
}

export async function updatePelanggaranSiswa(
  id: string,
  payload: UpdatePelanggaranSiswaPayload
): Promise<PelanggaranSiswa> {
  if (!id) {
    throw new Error(
      "ID pelanggaran wajib diisi"
    );
  }

  const response = await fetch(
    `${API_URL}${PELANGGARAN_PATH}/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<PelanggaranSiswa>(
    response
  );
}

export async function deletePelanggaranSiswa(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID pelanggaran wajib diisi"
    );
  }

  const response = await fetch(
    `${API_URL}${PELANGGARAN_PATH}/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  await handleResponse<any>(response);
}

// =========================================================
// 4. ASESMEN MINAT BAKAT
// =========================================================

const ASESMEN_PATH =
  `${BK_BASE_PATH}/asesmen-minat-bakat`;

export async function getAsesmenMinatBakat(): Promise<
  AsesmenMinatBakat[]
> {
  const response = await fetch(
    `${API_URL}${ASESMEN_PATH}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse<AsesmenMinatBakat[]>(
    response
  );
}

export async function createAsesmenMinatBakat(
  payload: CreateAsesmenMinatBakatPayload
): Promise<AsesmenMinatBakat> {
  if (!payload.siswaId) {
    throw new Error("Siswa wajib dipilih");
  }

  if (!payload.tanggal) {
    throw new Error("Tanggal wajib diisi");
  }

  if (!payload.jenis) {
    throw new Error("Jenis asesmen wajib diisi");
  }

  const response = await fetch(
    `${API_URL}${ASESMEN_PATH}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<AsesmenMinatBakat>(
    response
  );
}

export async function updateAsesmenMinatBakat(
  id: string,
  payload: UpdateAsesmenMinatBakatPayload
): Promise<AsesmenMinatBakat> {
  if (!id) {
    throw new Error(
      "ID asesmen wajib diisi"
    );
  }

  const response = await fetch(
    `${API_URL}${ASESMEN_PATH}/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<AsesmenMinatBakat>(
    response
  );
}

export async function deleteAsesmenMinatBakat(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID asesmen wajib diisi"
    );
  }

  const response = await fetch(
    `${API_URL}${ASESMEN_PATH}/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  await handleResponse<any>(response);
}