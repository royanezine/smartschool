import { apiFetch } from "../lib/api";

export type AbsensiStatus =
  | "hadir"
  | "izin"
  | "sakit"
  | "alpha";

export type AbsensiMetode =
  | "lokasi"
  | "barcode"
  | "face"
  | "manual";

export interface AbsensiPengguna {
  id?: string;
  namaLengkap?: string;
  nisn?: string;
}

export interface Absensi {
  id: string;
  penggunaId?: string;
  kelasId?: string;
  tanggal?: string;
  status?: AbsensiStatus;
  keterangan?: string;
  metode?: AbsensiMetode;
  lintang?: number | null;
  bujur?: number | null;
  urlFoto?: string | null;
  dibuatOleh?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  pengguna?: AbsensiPengguna | null;
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

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const API_URL = (() => {
  const base = RAW_API_URL.replace(/\/+$/, "");

  if (/\/api\/v1$/i.test(base)) {
    return base;
  }

  if (/\/api$/i.test(base)) {
    return `${base}/v1`;
  }

  return `${base}/api/v1`;
})();

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt")
  );
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers);

  const isFormData =
    options.body instanceof FormData;

  if (!isFormData) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await response.text();

  let result: any = null;

  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = null;
    }
  }

  if (!response.ok) {
    let message =
      "Terjadi kesalahan pada server.";

    if (result?.message) {
      message = result.message;
    } else if (text) {
      message = text;
    }

    if (response.status === 401) {
      throw new Error(
        "Sesi login sudah habis. Silakan login kembali."
      );
    }

    if (response.status === 403) {
      throw new Error(
        message ||
          "Kamu tidak memiliki akses."
      );
    }

    if (response.status === 404) {
      throw new Error(
        `Endpoint tidak ditemukan.\nURL: ${url}`
      );
    }

    throw new Error(message);
  }

  if (
    result &&
    typeof result === "object" &&
    "data" in result
  ) {
    return result.data as T;
  }

  return result as T;
}

/* =========================================================
   GET ABSENSI SAYA
========================================================= */

export async function getAbsensiSaya(): Promise<
  Absensi[]
> {
  return request<Absensi[]>(
    "/absensi/saya",
    {
      method: "GET",
    }
  );
}

/* =========================================================
   GET ABSENSI KELAS
========================================================= */

export async function getAbsensiKelas(
  kelasId: string,
  tanggal?: string
): Promise<Absensi[]> {
  if (!kelasId) {
    throw new Error(
      "Kelas ID wajib diisi."
    );
  }

  let endpoint =
    `/absensi/kelas/${encodeURIComponent(
      kelasId
    )}`;

  if (tanggal) {
    endpoint += `?tanggal=${encodeURIComponent(
      tanggal
    )}`;
  }

  return request<Absensi[]>(
    endpoint,
    {
      method: "GET",
    }
  );
}

/* =========================================================
   CREATE ABSENSI
========================================================= */

export async function createAbsensi(
  data: CreateAbsensiData
): Promise<Absensi> {
  if (!data.kelasId) {
    throw new Error(
      "Kelas ID wajib diisi."
    );
  }

  if (!data.status) {
    throw new Error(
      "Status absensi wajib diisi."
    );
  }

  /* =========================
     FACE
  ========================= */

  if (data.metode === "face") {
    if (!data.snapshot) {
      throw new Error(
        "Foto wajah wajib diisi."
      );
    }

    if (
      data.lintang === undefined ||
      data.bujur === undefined
    ) {
      throw new Error(
        "Lokasi GPS wajib diaktifkan."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "kelasId",
      data.kelasId
    );

    formData.append(
      "status",
      data.status
    );

    formData.append(
      "metode",
      "face"
    );

    if (data.keterangan) {
      formData.append(
        "keterangan",
        data.keterangan
      );
    }

    formData.append(
      "lintang",
      String(data.lintang)
    );

    formData.append(
      "bujur",
      String(data.bujur)
    );

    if (data.snapshot instanceof File) {
      formData.append(
        "snapshot",
        data.snapshot,
        data.snapshot.name ||
          "snapshot.jpg"
      );
    } else {
      const file = new File(
        [data.snapshot],
        "snapshot.jpg",
        {
          type:
            data.snapshot.type ||
            "image/jpeg",
        }
      );

      formData.append(
        "snapshot",
        file
      );
    }

    return request<Absensi>(
      "/absensi",
      {
        method: "POST",
        body: formData,
      }
    );
  }

  /* =========================
     NON FACE
  ========================= */

  const body: Record<
    string,
    unknown
  > = {
    kelasId: data.kelasId,
    status: data.status,
    metode:
      data.metode || "manual",
  };

  if (data.keterangan) {
    body.keterangan =
      data.keterangan;
  }

  if (
    data.lintang !== undefined
  ) {
    body.lintang =
      data.lintang;
  }

  if (
    data.bujur !== undefined
  ) {
    body.bujur =
      data.bujur;
  }

  if (data.barcodeData) {
    body.barcodeData =
      data.barcodeData;
  }

  return request<Absensi>(
    "/absensi",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/* =========================================================
   ABSEN LOKASI
========================================================= */

export async function absenDenganLokasi(
  data: {
    kelasId: string;
    status?: AbsensiStatus;
    keterangan?: string;
  }
): Promise<Absensi> {
  if (
    typeof navigator ===
      "undefined" ||
    !navigator.geolocation
  ) {
    throw new Error(
      "Browser tidak mendukung GPS."
    );
  }

  const position =
    await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      }
    );

  return createAbsensi({
    kelasId: data.kelasId,
    status:
      data.status || "hadir",
    metode: "lokasi",
    keterangan:
      data.keterangan,
    lintang:
      position.coords.latitude,
    bujur:
      position.coords.longitude,
  });
}

/* =========================================================
   ABSEN BARCODE
========================================================= */

export async function absenDenganBarcode(
  data: {
    kelasId: string;
    barcodeData: string;
    status?: AbsensiStatus;
    keterangan?: string;
  }
): Promise<Absensi> {
  if (!data.kelasId) {
    throw new Error(
      "Kelas ID wajib diisi."
    );
  }

  if (!data.barcodeData) {
    throw new Error(
      "Data barcode wajib diisi."
    );
  }

  return createAbsensi({
    kelasId: data.kelasId,
    status:
      data.status || "hadir",
    metode: "barcode",
    barcodeData:
      data.barcodeData,
    keterangan:
      data.keterangan,
  });
}

/* =========================================================
   ABSEN FACE
========================================================= */

export async function absenDenganFace(
  data: {
    kelasId: string;
    snapshot: Blob | File;
    status?: AbsensiStatus;
    keterangan?: string;
    lintang: number;
    bujur: number;
  }
): Promise<Absensi> {
  if (!data.kelasId) {
    throw new Error(
      "Kelas ID wajib diisi."
    );
  }

  if (!data.snapshot) {
    throw new Error(
      "Foto wajah wajib diisi."
    );
  }

  if (
    data.lintang === undefined ||
    data.bujur === undefined
  ) {
    throw new Error(
      "Lokasi GPS wajib diaktifkan."
    );
  }

  return createAbsensi({
    kelasId: data.kelasId,
    status:
      data.status || "hadir",
    metode: "face",
    keterangan:
      data.keterangan,
    lintang:
      data.lintang,
    bujur:
      data.bujur,
    snapshot:
      data.snapshot,
  });
}

/* =========================================================
   ABSEN MANUAL
========================================================= */

export async function absenManual(
  data: {
    kelasId: string;
    status:
      | "izin"
      | "sakit"
      | "alpha"
      | "hadir";
    keterangan?: string;
  }
): Promise<Absensi> {
  if (!data.kelasId) {
    throw new Error(
      "Kelas ID wajib diisi."
    );
  }

  if (!data.status) {
    throw new Error(
      "Status wajib diisi."
    );
  }

  return createAbsensi({
    kelasId: data.kelasId,
    status: data.status,
    metode: "manual",
    keterangan:
      data.keterangan,
  });
}

const absensiService = {
  getAbsensiSaya,
  getAbsensiKelas,
  createAbsensi,
  absenDenganLokasi,
  absenDenganBarcode,
  absenDenganFace,
  absenManual,
};

export interface KelasSaya {
  kelasId: string;
  nama: string;
  tingkat: string;
  tahunAjaranId: string;
}

export async function getKelasSaya(): Promise<KelasSaya> {
  const response = await apiFetch(
    "/api/v1/siswa/kelas-saya",
    {
      method: "GET",
    },
  );

  console.log(
    "========== KELAS SAYA ==========",
  );

  console.log(
    "RESPONSE:",
    response,
  );

  console.log(
    "================================",
  );

  return response.data;
}

export default absensiService;