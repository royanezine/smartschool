import { apiFetch } from "@/lib/api";

export type JenisSoal = "pilihan_ganda" | "benar_salah" | "esai";

export interface Ujian {
  id: string;
  judul?: string;
  namaUjian?: string;
  deskripsi?: string;
  mataPelajaranId?: string;
  kelasId?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  durasi?: number;
  status?: string;
  [key: string]: unknown;
}

export interface SoalUjian {
  id: string;
  asesmenId?: string;
  ujianId?: string;
  teksSoal: string;
  jenisSoal: JenisSoal;
  pilihan?: string[] | null;
  jawabanBenar?: string | null;
  kunciJawaban?: string | null;
  poin: number;
  nomorUrut: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSoalPayload {
  teksSoal: string;
  jenisSoal: JenisSoal;
  pilihan?: string[] | null;
  jawabanBenar?: string | null;
  poin: number;
  nomorUrut: number;
}

export type UpdateSoalPayload = Partial<CreateSoalPayload>;

// ==================================================
// HELPER: NORMALISASI RESPONSE API
// ==================================================

function getData<T>(response: unknown): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as { data: T }).data;
  }

  return response as T;
}

// ==================================================
// UJIAN: DETAIL BERDASARKAN ID
// Backend: GET /api/ujian/:id
// ==================================================

export async function getUjianById(id: string): Promise<Ujian> {
  if (!id) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  const response = await apiFetch(`/api/ujian/${id}`, {
    method: "GET",
  });

  return getData<Ujian>(response);
}

// Alias untuk halaman yang menggunakan getDetailUjian.
// Endpoint tetap sama dengan getUjianById.
export async function getDetailUjian(id: string): Promise<Ujian> {
  return getUjianById(id);
}

// ==================================================
// DAFTAR SOAL BERDASARKAN UJIAN
// Backend: GET /api/soal-ujian/ujian/:ujianId
// ==================================================

export async function getSoalUjian(
  ujianId: string
): Promise<SoalUjian[]> {
  if (!ujianId) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  const response = await apiFetch(
    `/api/soal-ujian/ujian/${ujianId}`,
    {
      method: "GET",
    }
  );

  const data = getData<unknown>(response);

  if (Array.isArray(data)) {
    return data as SoalUjian[];
  }

  // Mengantisipasi response berbentuk { soal: [...] }
  if (
    data &&
    typeof data === "object" &&
    "soal" in data &&
    Array.isArray((data as { soal: unknown }).soal)
  ) {
    return (data as { soal: SoalUjian[] }).soal;
  }

  return [];
}

// ==================================================
// TAMBAH SOAL
// Backend: POST /api/soal-ujian
// ==================================================

export async function createSoalUjian(
  ujianId: string,
  payload: CreateSoalPayload
): Promise<SoalUjian> {
  if (!ujianId) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  if (!payload.teksSoal?.trim()) {
    throw new Error("Teks soal wajib diisi.");
  }

  const body = {
    ujianId,
    teksSoal: payload.teksSoal.trim(),
    jenisSoal: payload.jenisSoal,
    pilihan: payload.pilihan ?? undefined,
    jawabanBenar: payload.jawabanBenar ?? undefined,
    poin: Number(payload.poin),
    nomorUrut: Number(payload.nomorUrut),
  };

  const response = await apiFetch("/api/soal-ujian", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return getData<SoalUjian>(response);
}

// ==================================================
// DETAIL SOAL
// Backend: GET /api/soal-ujian/:id
// ==================================================

export async function getSoalById(
  soalId: string
): Promise<SoalUjian> {
  if (!soalId) {
    throw new Error("ID soal tidak ditemukan.");
  }

  const response = await apiFetch(`/api/soal-ujian/${soalId}`, {
    method: "GET",
  });

  return getData<SoalUjian>(response);
}

// ==================================================
// EDIT SOAL
// Backend: PUT /api/soal-ujian/:id
// ==================================================

export async function updateSoalUjian(
  soalId: string,
  payload: UpdateSoalPayload
): Promise<SoalUjian> {
  if (!soalId) {
    throw new Error("ID soal tidak ditemukan.");
  }

  const body: Record<string, unknown> = {};

  if (payload.teksSoal !== undefined) {
    body.teksSoal = payload.teksSoal.trim();
  }

  if (payload.jenisSoal !== undefined) {
    body.jenisSoal = payload.jenisSoal;
  }

  if (payload.pilihan !== undefined) {
    body.pilihan = payload.pilihan;
  }

  if (payload.jawabanBenar !== undefined) {
    body.jawabanBenar = payload.jawabanBenar;
  }

  if (payload.poin !== undefined) {
    body.poin = Number(payload.poin);
  }

  if (payload.nomorUrut !== undefined) {
    body.nomorUrut = Number(payload.nomorUrut);
  }

  const response = await apiFetch(`/api/soal-ujian/${soalId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return getData<SoalUjian>(response);
}

// ==================================================
// HAPUS SOAL
// Backend: DELETE /api/soal-ujian/:id
// ==================================================

export async function deleteSoalUjian(
  soalId: string
): Promise<unknown> {
  if (!soalId) {
    throw new Error("ID soal tidak ditemukan.");
  }

  return apiFetch(`/api/soal-ujian/${soalId}`, {
    method: "DELETE",
  });
}

// ==================================================
// HAPUS UJIAN
// Backend: DELETE /api/ujian/:id
// ==================================================

export async function deleteUjian(
  ujianId: string
): Promise<unknown> {
  if (!ujianId) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  return apiFetch(`/api/ujian/${ujianId}`, {
    method: "DELETE",
  });
}

// ==================================================
// DAFTAR UJIAN BERDASARKAN KELAS DAN MAPEL
// Backend: GET /api/ujian/kelas-mapel/:kelasMapelId
// ==================================================

export async function getUjianByKelasMapel(
  kelasMapelId: string
): Promise<unknown> {
  if (!kelasMapelId) {
    throw new Error("ID kelas mata pelajaran tidak ditemukan.");
  }

  const response = await apiFetch(
    `/api/ujian/kelas-mapel/${kelasMapelId}`,
    {
      method: "GET",
    }
  );

  return getData<unknown>(response);
}

// ==================================================
// BUAT UJIAN
// Backend: POST /api/ujian
// ==================================================

export async function createUjian(
  payload: Record<string, unknown>
): Promise<unknown> {
  const response = await apiFetch("/api/ujian", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return getData<unknown>(response);
}

// ==================================================
// VALIDASI NOMOR URUT SOAL
// ==================================================

function validasiNomorUrut(value: number): number {
  const nomorUrut = Number(value);

  if (!Number.isInteger(nomorUrut) || nomorUrut <= 0) {
    throw new Error(
      "Nomor urut harus berupa bilangan bulat positif."
    );
  }

  return nomorUrut;
}

// ==================================================
// EDIT UJIAN
// Backend: PUT /api/ujian/:id
// ==================================================

export async function updateUjian(
  ujianId: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  if (!ujianId) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  const response = await apiFetch(`/api/ujian/${ujianId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return getData<unknown>(response);
}

// ==================================================
// PUBLIKASI UJIAN
// Backend: PUT /api/ujian/:id
// ==================================================

export async function publishUjian(
  ujianId: string,
  dipublikasikan: boolean
): Promise<unknown> {
  return updateUjian(ujianId, { dipublikasikan });
}

export const PESAN_NILAI_UJIAN_TIDAK_TERSEDIA =
  "Nilai ujian untuk kelas ini belum tersedia.";

/*
 * Backend/src belum menyediakan endpoint nilai ujian per kelas-mapel.
 * Route yang ada hanya:
 *   GET  /api/ujian/kelas-mapel/:kelasMapelId  -> daftar ujian (metadata),
 *   GET  /api/ujian/:id                        -> detail ujian + soal.
 * Nilai per siswa tersimpan di percobaanAsesmen.nilai/totalNilai tetapi
 * tidak diekspos oleh route GET mana pun. Karena itu fungsi ini TIDAK
 * boleh mengembalikan daftar ujian sebagai nilai (itu akan dilaporkan
 * sebagai skor siswa yang keliru). Selama endpoint nilai belum ada,
 * kembalikan status tidak tersedia agar pemanggil melewati bagian ini.
 */
export async function getNilaiUjianUntukKelas(
  kelasMapelId: string,
): Promise<{ tersedia: boolean; pesan?: string; data: any[] }> {
  if (!kelasMapelId) {
    return {
      tersedia: false,
      pesan: PESAN_NILAI_UJIAN_TIDAK_TERSEDIA,
      data: [],
    };
  }

  return {
    tersedia: false,
    pesan: PESAN_NILAI_UJIAN_TIDAK_TERSEDIA,
    data: [],
  };
}

// ==================================================
// SISWA: MULAI PERCOBAAN UJIAN
// Backend: POST /api/ujian/:id/mulai
// ==================================================

export async function mulaiPercobaanUjian(
  ujianId: string,
  token: string
): Promise<unknown> {
  if (!ujianId) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  if (!token?.trim()) {
    throw new Error("Token ujian wajib diisi.");
  }

  const response = await apiFetch(`/api/ujian/${ujianId}/mulai`, {
    method: "POST",
    body: JSON.stringify({
      token: token.trim().toUpperCase(),
    }),
  });

  return getData<unknown>(response);
}

export const mulaiUjian = mulaiPercobaanUjian;

// ==================================================
// SISWA: SUBMIT JAWABAN & SELESAIKAN UJIAN
// Backend: POST /api/ujian/sesi/:sesiId/submit
// ==================================================

export interface JawabanItemPayload {
  soalId: string;
  jawaban?: string | null;
}

export async function submitJawabanDanSelesai(
  sesiId: string,
  jawaban: JawabanItemPayload[]
): Promise<unknown> {
  if (!sesiId) {
    throw new Error("ID sesi ujian tidak ditemukan.");
  }

  const response = await apiFetch(`/api/ujian/sesi/${sesiId}/submit`, {
    method: "POST",
    body: JSON.stringify({
      jawaban,
    }),
  });

  return getData<unknown>(response);
}

export const submitUjian = submitJawabanDanSelesai;

// Alias soal ujian agar kompatibel dengan pemanggilan dari berbagai halaman
export const getSoalByUjian = getSoalUjian;
export const createSoal = createSoalUjian;
export const updateSoal = updateSoalUjian;
export const deleteSoal = deleteSoalUjian;