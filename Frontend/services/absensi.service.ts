import { apiFetch } from "../lib/api";
import { getToken } from "../lib/auth";


export type AbsensiStatus = "hadir" | "izin" | "sakit" | "alpha";

export type AbsensiMetode = "lokasi" | "barcode" | "face" | "manual";

export type StatusCheckInShift = "hadir" | "izin" | "sakit";

export type StatusShiftKerjaAbsensi =
  | "tepat_waktu"
  | "terlambat"
  | "pulang_cepat"
  | "terlambat_dan_pulang_cepat";

export interface AbsensiPeraan {
  id?: string;
  nama?: string | null;
  namaTampilan?: string | null;
}

export interface AbsensiPengguna {
  id?: string;
  namaLengkap?: string;
  namaPengguna?: string | null;
  nisn?: string | null;
  nis?: string | null;
  nip?: string | null;
  nipd?: string | null;
  nuptk?: string | null;
  jabatan?: string | null;
  avatar?: string | null;
  peran?: AbsensiPeraan | null;
}

export interface AbsensiShiftKerja {
  id: string;
  nama: string;
  kode?: string | null;
  jamMasuk: string;
  jamKeluar: string;
  toleransiTerlambatMenit?: number;
  status?: string;
}

export interface Absensi {
  id: string;
  sekolahId?: string;
  penggunaId?: string;
  kelasId?: string | null;
  shiftKerjaId?: string | null;

  tanggal?: string;
  waktuMasuk?: string | null;
  waktuKeluar?: string | null;

  status?: AbsensiStatus;
  statusShift?: StatusShiftKerjaAbsensi | string | null;
  terlambatMenit?: number | null;
  durasiKerjaMenit?: number | null;
  durasiJamKerja?: number | string | null;

  keterangan?: string | null;
  metode?: AbsensiMetode;

  lintang?: number | null;
  bujur?: number | null;
  urlFoto?: string | null;

  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;

  pengguna?: AbsensiPengguna | null;
  shiftKerja?: AbsensiShiftKerja | null;
  kelas?: { id: string; nama?: string | null; tingkat?: string | number | null } | null;
}

export interface CreateAbsensiData {
  kelasId: string;
  status: AbsensiStatus;
  metode?: AbsensiMetode;
  keterangan?: string;
  lintang?: number;
  bujur?: number;
  barcodeData?: string;
  snapshot?: Blob | File | null;
}


export interface CheckInShiftPayload {
  shiftKerjaId?: string;
  status?: StatusCheckInShift;
  keterangan?: string;
  metode?: AbsensiMetode;
  lintang?: number;
  bujur?: number;
  barcodeData?: string;
}

export interface CheckOutShiftPayload {
  keterangan?: string;
  metode?: AbsensiMetode;
  lintang?: number;
  bujur?: number;
  barcodeData?: string;
}

export interface RiwayatShiftResponse {
  data: Absensi[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


export type AbsensiFilterStatus =
  | "hadir"
  | "izin"
  | "sakit"
  | "alpha"
  | "terlambat";

export type AbsensiFilterRole =
  | "siswa"
  | "guru"
  | "staff"
  | "staf"
  | "pegawai"
  | "karyawan"
  | "admin_sekolah";

export interface AbsensiListParams {
  page?: number;
  limit?: number;
  sekolahId?: string;
  kelasId?: string;
  penggunaId?: string;
  shiftKerjaId?: string;
  tanggal?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  search?: string;
  role?: AbsensiFilterRole;
  status?: AbsensiFilterStatus;
}

export interface StatistikAbsensi {
  total: number;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export interface AbsensiSekolahResponse {
  data: Absensi[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    [key: string]: unknown;
  };
  statistik: StatistikAbsensi;
}

export async function getAbsensiSekolah(
  params: AbsensiListParams = {},
): Promise<AbsensiSekolahResponse> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  const response = await apiFetch(
    `/api/absensi?${query.toString()}`,
    { method: "GET" },
  );

  const result = unwrapObject(response);
  const payload = unwrapObject(result.data);

  // Backend getAbsensiSekolah mengembalikan:
  // { success, message, data, meta, statistik }
  const records = Array.isArray(result.data)
    ? result.data
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(result.items)
        ? result.items
        : [];

  const meta = unwrapObject(result.meta ?? payload.meta);
  const statistikRaw = unwrapObject(
    result.statistik ?? payload.statistik,
  );

  const page = Number(meta.page ?? params.page ?? 1);
  const limit = Number(meta.limit ?? params.limit ?? 10);
  const total = Number(meta.total ?? records.length);

  return {
    data: records as Absensi[],
    meta: {
      ...meta,
      page,
      limit,
      total,
      totalPages: Number(
        meta.totalPages ??
          Math.ceil(total / Math.max(limit, 1)),
      ),
    },
    statistik: {
      total: Number(statistikRaw.total ?? total),
      hadir: Number(statistikRaw.hadir ?? 0),
      terlambat: Number(statistikRaw.terlambat ?? 0),
      izin: Number(statistikRaw.izin ?? 0),
      sakit: Number(statistikRaw.sakit ?? 0),
      alpha: Number(statistikRaw.alpha ?? 0),
    },
  };
}



export interface UpdateAbsensiPayload {
  status?: AbsensiFilterStatus;
  keterangan?: string | null;
}

/**
 * PATCH /api/absensi/:id — hanya `status` dan `keterangan` yang boleh dikirim
 * (lihat Backend/src/validations/absensi.validation.ts).
 */
export async function updateAbsensi(
  id: string,
  payload: UpdateAbsensiPayload,
): Promise<Absensi> {
  if (!id) {
    throw new Error("ID absensi tidak ditemukan.");
  }

  const body: Record<string, unknown> = {};

  if (payload?.status !== undefined) {
    body.status = payload.status;
  }

  if (payload?.keterangan !== undefined) {
    body.keterangan = payload.keterangan;
  }

  if (Object.keys(body).length === 0) {
    throw new Error("Tidak ada perubahan yang perlu disimpan.");
  }

  const response = await apiFetch(
    `/api/absensi/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );

  const result = unwrapObject(response);
  const data = unwrapObject(result.data);

  return (Object.keys(data).length > 0 ? data : result) as Absensi;
}


function unwrapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const result = value as Record<string, unknown>;

  if (Array.isArray(result.items)) {
    return result.items as T[];
  }

  if (Array.isArray(result.data)) {
    return result.data as T[];
  }

  return [];
}

function unwrapObject(value: unknown): Record<string, any> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value as Record<string, any>;
}


export async function getAbsensiSaya(): Promise<Absensi[]> {
  const response = await apiFetch("/api/absensi/saya", {
    method: "GET",
  });

  return unwrapArray<Absensi>(response);
}


export async function getAbsensiKelas(
  kelasId: string,
  tanggal?: string,
): Promise<Absensi[]> {
  if (!kelasId) {
    throw new Error("Kelas ID wajib diisi.");
  }

  const params = new URLSearchParams();

  if (tanggal) {
    params.set("tanggal", tanggal);
  }

  const query = params.toString();

  const endpoint =
    `/api/absensi/kelas/${encodeURIComponent(kelasId)}` +
    (query ? `?${query}` : "");

  const response = await apiFetch(endpoint, {
    method: "GET",
  });

  return unwrapArray<Absensi>(response);
}


export async function createAbsensi(
  data: CreateAbsensiData,
): Promise<Absensi> {
  if (!data.kelasId) {
    throw new Error("Kelas ID wajib diisi.");
  }

  if (!data.status) {
    throw new Error("Status absensi wajib diisi.");
  }

  if (data.metode === "face") {
    if (!data.snapshot) {
      throw new Error("Foto wajah wajib diisi.");
    }

    if (data.lintang === undefined || data.bujur === undefined) {
      throw new Error("Lokasi GPS wajib diaktifkan.");
    }

    const formData = new FormData();

    formData.append("kelasId", data.kelasId);
    formData.append("status", data.status);
    formData.append("metode", "face");
    formData.append("lintang", String(data.lintang));
    formData.append("bujur", String(data.bujur));

    if (data.keterangan) {
      formData.append("keterangan", data.keterangan);
    }

    if (data.snapshot instanceof File) {
      formData.append("snapshot", data.snapshot);
    } else {
      formData.append(
        "snapshot",
        new File([data.snapshot], "snapshot.jpg", {
          type: data.snapshot.type || "image/jpeg",
        }),
      );
    }

    return apiFetch("/api/absensi", {
      method: "POST",
      body: formData,
    }) as Promise<Absensi>;
  }

  const body: Record<string, unknown> = {
    kelasId: data.kelasId,
    status: data.status,
    metode: data.metode || "manual",
  };

  if (data.keterangan) body.keterangan = data.keterangan;
  if (data.lintang !== undefined) body.lintang = data.lintang;
  if (data.bujur !== undefined) body.bujur = data.bujur;
  if (data.barcodeData) body.barcodeData = data.barcodeData;

  return apiFetch("/api/absensi", {
    method: "POST",
    body: JSON.stringify(body),
  }) as Promise<Absensi>;
}


function getCurrentPosition(): Promise<GeolocationPosition> {
  if (
    typeof navigator === "undefined" ||
    !navigator.geolocation
  ) {
    throw new Error("Browser tidak mendukung GPS.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      () =>
        reject(
          new Error(
            "Lokasi tidak dapat diakses. Periksa izin GPS browser.",
          ),
        ),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}

export async function absenDenganLokasi(data: {
  kelasId: string;
  status?: AbsensiStatus;
  keterangan?: string;
}): Promise<Absensi> {
  const position = await getCurrentPosition();

  return createAbsensi({
    kelasId: data.kelasId,
    status: data.status || "hadir",
    metode: "lokasi",
    keterangan: data.keterangan,
    lintang: position.coords.latitude,
    bujur: position.coords.longitude,
  });
}


export async function absenDenganBarcode(data: {
  kelasId: string;
  barcodeData: string;
  status?: AbsensiStatus;
  keterangan?: string;
}): Promise<Absensi> {
  if (!data.barcodeData) {
    throw new Error("Data barcode wajib diisi.");
  }

  return createAbsensi({
    kelasId: data.kelasId,
    status: data.status || "hadir",
    metode: "barcode",
    barcodeData: data.barcodeData,
    keterangan: data.keterangan,
  });
}


export async function absenDenganFace(data: {
  kelasId: string;
  snapshot: Blob | File;
  status?: AbsensiStatus;
  keterangan?: string;
  lintang: number;
  bujur: number;
}): Promise<Absensi> {
  return createAbsensi({
    kelasId: data.kelasId,
    status: data.status || "hadir",
    metode: "face",
    keterangan: data.keterangan,
    lintang: data.lintang,
    bujur: data.bujur,
    snapshot: data.snapshot,
  });
}


export async function absenManual(data: {
  kelasId: string;
  status: AbsensiStatus;
  keterangan?: string;
}): Promise<Absensi> {
  return createAbsensi({
    kelasId: data.kelasId,
    status: data.status,
    metode: "manual",
    keterangan: data.keterangan,
  });
}


export interface KelasSaya {
  kelasId: string;
  nama: string;
  tingkat: string;
  tahunAjaranId: string;
}

export async function getKelasSaya(): Promise<KelasSaya> {
  const response = await apiFetch("/api/siswa/me", {
    method: "GET",
  });

  const result = unwrapObject(response);

  return {
    kelasId: result.kelasId ?? result.kelas?.id ?? "",
    nama: result.kelas?.nama ?? "",
    tingkat: result.kelas?.tingkat ?? "",
    tahunAjaranId: result.tahunAjaranId ?? "",
  };
}


export async function getAbsensiSiswa(
  siswaId: string,
): Promise<Absensi[]> {
  throw new Error(
    "Backend tidak menyediakan riwayat absensi per siswa. " +
      `Gunakan getAbsensiKelas(kelasId) lalu filter penggunaId = ${siswaId}.`
  );
}


export async function checkInShift(
  data: CheckInShiftPayload = {},
): Promise<Absensi> {
  const body: Record<string, unknown> = {
    status: data.status ?? "hadir",
    metode: data.metode ?? "lokasi",
  };

  if (data.shiftKerjaId) body.shiftKerjaId = data.shiftKerjaId;
  if (data.keterangan) body.keterangan = data.keterangan;
  if (data.lintang !== undefined) body.lintang = data.lintang;
  if (data.bujur !== undefined) body.bujur = data.bujur;
  if (data.barcodeData) body.barcodeData = data.barcodeData;

  return apiFetch("/api/absensi/check-in", {
    method: "POST",
    body: JSON.stringify(body),
  }) as Promise<Absensi>;
}


export async function checkOutShift(
  data: CheckOutShiftPayload = {},
): Promise<Absensi> {
  const body: Record<string, unknown> = {
    metode: data.metode ?? "lokasi",
  };

  if (data.keterangan) body.keterangan = data.keterangan;
  if (data.lintang !== undefined) body.lintang = data.lintang;
  if (data.bujur !== undefined) body.bujur = data.bujur;
  if (data.barcodeData) body.barcodeData = data.barcodeData;

  return apiFetch("/api/absensi/check-out", {
    method: "POST",
    body: JSON.stringify(body),
  }) as Promise<Absensi>;
}



export async function getRiwayatShiftSaya(
  page = 1,
  limit = 20,
): Promise<RiwayatShiftResponse> {
  const params = new URLSearchParams({
    page: String(Math.max(1, Math.floor(page))),
    limit: String(Math.max(1, Math.floor(limit))),
  });

  const response = await apiFetch(
    `/api/absensi/shift-saya?${params.toString()}`,
    { method: "GET" },
  );

  const result = unwrapObject(response);

  const payload = unwrapObject(result.data);

  const candidates = [
    result.data,
    payload.data,
    payload.items,
    result.items,
  ];

  const records = candidates.find(Array.isArray);
  const data = (records ?? []) as Absensi[];

  const pagination = Object.keys(payload).length > 0
    ? payload
    : result;

  const total = Number(pagination.total ?? data.length);
  const responseLimit = Number(pagination.limit ?? limit);
  const currentPage = Number(pagination.page ?? page);

  return {
    data,
    page: currentPage,
    limit: responseLimit,
    total,
    totalPages: Number(
      pagination.totalPages ??
        Math.ceil(total / Math.max(responseLimit, 1)),
    ),
  };
}




export interface MonitoringKehadiranGuru {
  id: string;
  penggunaId?: string | null;
  absensiId?: string | null;
  namaLengkap: string;
  nip?: string | null;
  email?: string | null;

  shiftKerja?: AbsensiShiftKerja | null;

  absensi?: Absensi | null;
  statusMonitoring: string;
}

export interface MonitoringGuruResponse {
  tanggal: string;
  totalGuru: number;
  sudahAbsen: number;
  belumAbsen: number;
  data: MonitoringKehadiranGuru[];
}

export interface MonitoringGuruParams {
  tanggal: string;
  status?: string;
  search?: string;
  shiftKerjaId?: string;
}

/**
 * Endpoint `GET /api/absensi/monitoring-guru` mengembalikan baris `Absensi`
 * mentah (relasi `pengguna`, `shiftKerja`, `kelas`). Struct di sini
 * menormalkannya agar `id` = penggunaId, sehingga rekap per guru tidak lagi
 * mencocokkan penggunaId dengan id baris absensi.
 *
 * Endpoint ini hanya berisi guru yang SUDAH punya catatan absensi; daftar guru
 * yang belum absen tidak dapat diturunkan dari respons ini.
 */
export async function getMonitoringKehadiranGuru(
  params: string | MonitoringGuruParams,
): Promise<MonitoringGuruResponse> {
  const queryParams = typeof params === "string" ? { tanggal: params } : params;
  const { tanggal, status, search, shiftKerjaId } = queryParams || {};

  if (!tanggal) {
    throw new Error("Tanggal monitoring wajib diisi.");
  }

  const query = new URLSearchParams();
  query.set("tanggal", tanggal);

  if (status && status !== "semua") {
    query.set("status", status);
  }

  if (search?.trim()) {
    query.set("search", search.trim());
  }

  if (shiftKerjaId && shiftKerjaId !== "semua") {
    query.set("shiftKerjaId", shiftKerjaId);
  }

  const response = await apiFetch(
    `/api/absensi/monitoring-guru?${query.toString()}`,
    { method: "GET" },
  );

  const result = unwrapObject(response);
  const payload = unwrapObject(result.data);

  const rows = [
    result.data,
    payload.data,
    payload.items,
    result.items,
  ].find(Array.isArray) as Record<string, any>[] | undefined;

  const data: MonitoringKehadiranGuru[] = (rows ?? []).map((item) => {
    const record = unwrapObject(item);
    const pengguna = unwrapObject(record.pengguna);

    const penggunaId =
      record.penggunaId ?? pengguna.id ?? record.pengguna?.id ?? null;

    return {
      // Pertahankan field mentah agar konsumen lama tetap membaca
      // waktuMasuk/status/metode apa adanya.
      ...record,
      id: String(penggunaId ?? record.id ?? ""),
      absensiId: record.id ?? null,
      penggunaId,
      namaLengkap:
        pengguna.namaLengkap ?? record.namaLengkap ?? "-",
      nip: pengguna.nip ?? pengguna.nuptk ?? record.nip ?? null,
      email: pengguna.email ?? record.email ?? null,
      shiftKerja:
        record.shiftKerja ?? pengguna.shiftKerjaMaster ?? null,
      absensi: record as unknown as Absensi,
      statusMonitoring: String(
        record.statusShift ?? record.status ?? "hadir",
      ),
    };
  });

  return {
    tanggal: String(payload.tanggal ?? tanggal),
    // Hanya baris yang benar-benar dikembalikan Backend yang dihitung.
    totalGuru: data.length,
    sudahAbsen: data.length,
    belumAbsen: 0,
    data,
  };
}


export async function getMetodeAbsensiAktif(): Promise<string[]> {
  const response = await apiFetch("/api/absensi/metode-aktif", {
    method: "GET",
  });

  const result = unwrapObject(response);
  const payload = unwrapObject(result.data);

  const metodeAktif = payload.metodeAktif;

  return Array.isArray(metodeAktif)
    ? metodeAktif.map((metode) => String(metode).toLowerCase())
    : [];
}



export interface AbsensiExportResult {
  blob: Blob;
  fileName: string;
}

function resolveExportBaseUrl(): string {
  const base = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");

  return base.endsWith("/api") ? base : `${base}/api`;
}

function buildAbsensiQuery(params: AbsensiListParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

/**
 * GET /api/absensi/export — rekap absensi (XLSX) memakai filter yang sama
 * dengan daftar absensi. Dipakai agar export tetap mencakup seluruh baris
 * yang cocok dengan filter, bukan hanya halaman yang sedang tampil.
 */
export async function exportAbsensiFile(
  params: AbsensiListParams = {},
): Promise<AbsensiExportResult> {
  const token = typeof window !== "undefined" ? getToken() : null;

  if (!token) {
    throw new Error("Token login tidak ditemukan. Silakan login kembali.");
  }

  const query = buildAbsensiQuery(params);
  const url = `${resolveExportBaseUrl()}/absensi/export${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Gagal export rekap absensi (${response.status})`;

    try {
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const json = await response.json();
        message = json?.message || json?.error || message;
      }
    } catch {
      // Gunakan pesan default.
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  if (!blob.size) {
    throw new Error("File rekap absensi dari backend kosong.");
  }

  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);

  return {
    blob,
    fileName: match?.[1] || `rekap-absensi-${new Date().toISOString().slice(0, 10)}.xlsx`,
  };
}

const absensiService = {
  getAbsensiSaya,
  getAbsensiKelas,
  getAbsensiSekolah,
  createAbsensi,
  updateAbsensi,
  absenDenganLokasi,
  absenDenganBarcode,
  absenDenganFace,
  absenManual,
  getKelasSaya,
  getAbsensiSiswa,
  checkInShift,
  checkOutShift,
  getRiwayatShiftSaya,
  getMonitoringKehadiranGuru,
  getMetodeAbsensiAktif,
  exportAbsensiFile,
};

export default absensiService;