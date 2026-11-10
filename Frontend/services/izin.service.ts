import { apiFetch } from "../lib/api";

export type JenisIzin = "sakit" | "izin";
export type StatusIzin = "menunggu" | "disetujui" | "ditolak";

export interface GuruPenggantiOption {
  id: string;
  namaLengkap: string;
  nip?: string | null;
  jabatan?: string | null;
  sekolahId?: string | null;
}

export interface PermohonanIzin {
  id: string;
  sekolahId?: string;
  penggunaId?: string;
  guruPenggantiId?: string | null;
  jenis: JenisIzin | string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  urlBukti?: string | null;
  status: StatusIzin;
  catatan?: string | null;
  penyetujuId?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;

  pengguna?: {
    id?: string;
    namaLengkap?: string;
    nisn?: string | null;
    nip?: string | null;
    jabatan?: string | null;
    peran?: {
      id?: string;
      nama?: string;
      namaTampilan?: string;
    } | null;
  } | null;

  penyetuju?: {
    id?: string;
    namaLengkap?: string;
  } | null;

  guruPengganti?: {
    id?: string;
    namaLengkap?: string;
    nip?: string | null;
    jabatan?: string | null;
  } | null;
}

export interface AjukanIzinData {
  jenis: JenisIzin | string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  guruPenggantiId?: string | null;
  bukti?: File | null;
}

export interface VerifikasiIzinData {
  status: "disetujui" | "ditolak";
  catatan?: string | null;
  guruPenggantiId?: string | null;
}

export type VerifikasiPengajuanData = VerifikasiIzinData;

export interface GetDaftarIzinOptions {
  mine?: boolean;
  page?: number;
  limit?: number;
  status?: string;
  sekolahId?: string;
}

export function extractIzinFieldErrors(
  error: any,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  const rawErrors =
    error?.errors ||
    error?.raw?.errors ||
    error?.response?.data?.errors;

  if (Array.isArray(rawErrors)) {
    for (const item of rawErrors) {
      const field = String(item?.field || "").trim();
      const message = String(item?.message || "").trim();
      if (field && message && !fieldErrors[field]) {
        fieldErrors[field] = message;
      }
    }
  }

  return fieldErrors;
}

export function formatIzinErrorMessage(
  error: any,
  fallback = "Terjadi kesalahan saat memproses permohonan izin.",
): string {
  const fieldErrors = extractIzinFieldErrors(error);
  const messages = Object.values(fieldErrors);
  if (messages.length > 0) {
    return messages.join(" ");
  }

  const rawMsg =
    error?.raw?.message ||
    error?.response?.data?.message ||
    error?.message;

  if (typeof rawMsg === "string" && rawMsg.trim()) {
    return rawMsg.trim();
  }

  return fallback;
}

function enrichError(error: any, fallback: string): never {
  const fieldErrors = extractIzinFieldErrors(error);
  const message = formatIzinErrorMessage(error, fallback);
  const enhanced: any =
    error instanceof Error ? error : new Error(message);

  enhanced.message = message;
  enhanced.fieldErrors = fieldErrors;
  if (Array.isArray(error?.raw?.errors) && !enhanced.errors) {
    enhanced.errors = error.raw.errors;
  }
  throw enhanced;
}

export async function ajukanIzin(
  data: AjukanIzinData,
): Promise<PermohonanIzin> {
  const formData = new FormData();

  formData.append("jenis", String(data.jenis || "").trim());
  formData.append(
    "tanggalMulai",
    String(data.tanggalMulai || "").trim(),
  );
  formData.append(
    "tanggalSelesai",
    String(data.tanggalSelesai || "").trim(),
  );
  formData.append("alasan", String(data.alasan || "").trim());

  const cleanGuruPenggantiId =
    typeof data.guruPenggantiId === "string"
      ? data.guruPenggantiId.trim()
      : "";

  if (cleanGuruPenggantiId) {
    formData.append("guruPenggantiId", cleanGuruPenggantiId);
  }

  if (data.bukti) {
    formData.append("bukti", data.bukti);
  }

  try {
    const response = await apiFetch("/api/permohonan-izin", {
      method: "POST",
      body: formData,
    });

    return response?.data || response;
  } catch (error) {
    enrichError(error, "Gagal mengajukan permohonan izin.");
  }
}

export async function getDaftarIzin(
  options?: GetDaftarIzinOptions,
): Promise<any> {
  const searchParams = new URLSearchParams();

  if (options?.page) {
    searchParams.set("page", String(options.page));
  }

  if (options?.limit) {
    searchParams.set("limit", String(options.limit));
  }

  if (options?.status && options.status !== "semua") {
    searchParams.set("status", options.status);
  }

  if (options?.sekolahId) {
    searchParams.set("sekolahId", options.sekolahId);
  }

  const query = searchParams.toString();
  const endpoint = query
    ? `/api/permohonan-izin?${query}`
    : "/api/permohonan-izin";

  try {
    return await apiFetch(endpoint, {
      method: "GET",
    });
  } catch (error) {
    enrichError(
      error,
      "Gagal mengambil daftar permohonan izin.",
    );
  }
}

export async function verifikasiIzin(
  id: string,
  data: VerifikasiIzinData,
): Promise<PermohonanIzin> {
  if (!id) {
    throw new Error("ID permohonan izin tidak valid.");
  }

  const catatanValue =
    typeof data.catatan === "string"
      ? data.catatan.trim() || null
      : null;

  const payload: Record<string, any> = {
    status: data.status,
    catatan: catatanValue,
  };

  if (data.guruPenggantiId !== undefined) {
    const cleanGuruPenggantiId =
      typeof data.guruPenggantiId === "string"
        ? data.guruPenggantiId.trim()
        : "";
    payload.guruPenggantiId = cleanGuruPenggantiId
      ? cleanGuruPenggantiId
      : null;
  }

  try {
    const response = await apiFetch(
      `/api/permohonan-izin/${encodeURIComponent(id)}/verifikasi`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return response?.data || response;
  } catch (error) {
    enrichError(
      error,
      "Gagal memverifikasi permohonan izin.",
    );
  }
}

export async function verifikasiPengajuan(
  id: string,
  data: VerifikasiPengajuanData,
): Promise<PermohonanIzin> {
  return verifikasiIzin(id, data);
}

function extractArray(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

export async function getDaftarGuruPengganti(): Promise<
  GuruPenggantiOption[]
> {
  const guruMap = new Map<string, GuruPenggantiOption>();

  const registerGuru = (raw: any) => {
    const id = String(raw?.id || "").trim();
    const namaLengkap = String(
      raw?.namaLengkap || raw?.nama || "",
    ).trim();
    if (!id || !namaLengkap) return;

    if (
      raw?.status &&
      String(raw.status).toLowerCase() !== "aktif"
    ) {
      return;
    }

    const existing = guruMap.get(id);
    guruMap.set(id, {
      id,
      namaLengkap,
      nip: raw?.nip ?? existing?.nip ?? null,
      jabatan: raw?.jabatan ?? existing?.jabatan ?? null,
      sekolahId: raw?.sekolahId ?? existing?.sekolahId ?? null,
    });
  };

  try {
    const response = await apiFetch(
      "/api/users?page=1&limit=200&role=guru&status=aktif",
      { method: "GET" },
    );
    const users = extractArray(response);
    for (const user of users) {
      registerGuru(user);
    }
  } catch (err: any) {
    // Jika peran guru tidak memiliki izin manajemen_pengguna.view (HTTP 403),
    // ambil daftar guru aktif sekolah dari endpoint akademik resmi yang diizinkan (akademik.view).
    if (err?.status === 403 || err?.statusCode === 403) {
      const [kelasMapelRes, kelasRes] =
        await Promise.allSettled([
          apiFetch("/api/kelas-mapel", { method: "GET" }),
          apiFetch("/api/kelas?page=1&limit=200", {
            method: "GET",
          }),
        ]);

      if (kelasMapelRes.status === "fulfilled") {
        const items = extractArray(kelasMapelRes.value);
        for (const item of items) {
          if (item?.guruPengajar) {
            registerGuru(item.guruPengajar);
          }
        }
      }

      if (kelasRes.status === "fulfilled") {
        const items = extractArray(kelasRes.value);
        for (const item of items) {
          if (item?.waliKelas) {
            registerGuru(item.waliKelas);
          }
        }
      }
    } else {
      throw err;
    }
  }

  return Array.from(guruMap.values()).sort((a, b) =>
    a.namaLengkap.localeCompare(b.namaLengkap, "id-ID"),
  );
}

const izinService = {
  ajukanIzin,
  getDaftarIzin,
  verifikasiIzin,
  verifikasiPengajuan,
  getDaftarGuruPengganti,
};

export default izinService;