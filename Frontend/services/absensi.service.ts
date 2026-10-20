import { apiFetch } from "../lib/api";

/* =========================================================
   TYPES ABSENSI
========================================================= */

export type AbsensiStatus = "hadir" | "izin" | "sakit" | "alpha";

export type AbsensiMetode = "lokasi" | "barcode" | "face" | "manual";

export type StatusCheckInShift = "hadir" | "izin" | "sakit";

export type StatusShiftKerjaAbsensi =
  | "tepat_waktu"
  | "terlambat"
  | "pulang_cepat"
  | "terlambat_dan_pulang_cepat";

export interface AbsensiPengguna {
  id?: string;
  namaLengkap?: string;
  nisn?: string | null;
  nis?: string | null;
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

/* =========================================================
   TYPES SHIFT KERJA
========================================================= */

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

/* =========================================================
   HELPER RESPONSE
========================================================= */

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

/* =========================================================
   GET ABSENSI SAYA
   GET /api/absensi/saya
========================================================= */

export async function getAbsensiSaya(): Promise<Absensi[]> {
  const response = await apiFetch("/api/absensi/saya", {
    method: "GET",
  });

  return unwrapArray<Absensi>(response);
}

/* =========================================================
   GET ABSENSI KELAS
   GET /api/absensi/kelas/:kelasId
========================================================= */

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

/* =========================================================
   CREATE ABSENSI
   POST /api/absensi
========================================================= */

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

/* =========================================================
   ABSEN DENGAN LOKASI
========================================================= */

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

/* =========================================================
   ABSEN DENGAN BARCODE
========================================================= */

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

/* =========================================================
   ABSEN DENGAN FACE
========================================================= */

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

/* =========================================================
   ABSEN MANUAL
========================================================= */

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

/* =========================================================
   KELAS SAYA
   GET /api/siswa/me
========================================================= */

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

/* =========================================================
   ABSENSI SISWA
   GET /api/absensi/siswa/:siswaId

   Gunakan hanya jika route ini tersedia di backend.
========================================================= */

export async function getAbsensiSiswa(
  siswaId: string,
): Promise<Absensi[]> {
  if (!siswaId) {
    throw new Error("ID siswa wajib diisi.");
  }

  const response = await apiFetch(
    `/api/absensi/siswa/${encodeURIComponent(siswaId)}`,
    { method: "GET" },
  );

  return unwrapArray<Absensi>(response);
}

/* =========================================================
   CHECK-IN SHIFT
   POST /api/absensi/check-in
========================================================= */

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

/* =========================================================
   CHECK-OUT SHIFT
   POST /api/absensi/check-out
========================================================= */

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

/* =========================================================
   RIWAYAT SHIFT SAYA
   GET /api/absensi/shift-saya
========================================================= */


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

  // Mendukung response dengan atau tanpa pembungkus data.
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



/* =========================================================
   MONITORING KEHADIRAN GURU
   GET /api/absensi/monitoring-guru?tanggal=YYYY-MM-DD
========================================================= */

export interface MonitoringKehadiranGuru {
  id: string;
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

export async function getMonitoringKehadiranGuru(
  tanggal: string,
): Promise<MonitoringGuruResponse> {
  if (!tanggal) {
    throw new Error("Tanggal monitoring wajib diisi.");
  }

  const response = await apiFetch(
    `/api/absensi/monitoring-guru?tanggal=${encodeURIComponent(tanggal)}`,
    { method: "GET" },
  );

  const result = unwrapObject(response);
  const payload = unwrapObject(result.data);

  // Menyesuaikan struktur response successResponse.
  const data = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(result.data)
      ? result.data
      : [];

  return {
    tanggal: String(payload.tanggal ?? tanggal),
    totalGuru: Number(payload.totalGuru ?? data.length),
    sudahAbsen: Number(payload.sudahAbsen ?? 0),
    belumAbsen: Number(payload.belumAbsen ?? 0),
    data: data as MonitoringKehadiranGuru[],
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


/* =========================================================
   DEFAULT EXPORT
========================================================= */

const absensiService = {
  getAbsensiSaya,
  getAbsensiKelas,
  createAbsensi,
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
};

export default absensiService;