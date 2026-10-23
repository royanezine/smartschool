import { apiFetch } from "../lib/api";
import { clearSession, getToken } from "../lib/auth";

const ENDPOINT = "/api/ppdb";

export interface DaftarPpdbPayload {
  sekolahId: string;
  jalurPpdbId: string;
  namaLengkap: string;
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  telepon?: string;
  email?: string;
  namaAyah?: string;
  namaIbu?: string;
  asalSekolah?: string;
  nilaiRapor?: number;
}

export interface PendaftaranPpdb {
  id: string;
  sekolahId: string;
  jalurPpdbId: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  telepon?: string | null;
  email?: string | null;
  namaAyah?: string | null;
  namaIbu?: string | null;
  asalSekolah?: string | null;
  nilaiRapor?: number | string | null;
  status?: string | null;
  kelasId?: string | null;
  dikonversiKePenggunaId?: string | null;
  dikonversiPada?: string | null;
  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusOleh?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
  tokenPendaftaran?: string;
}

export interface DaftarPpdbResponse {
  success: boolean;
  message?: string;
  data: PendaftaranPpdb;
}

export type NamaBerkasPpdb =
  | "KK"
  | "AKTE"
  | "IJAZAH";

export interface BerkasPpdb {
  id: string;
  pendaftaranPpdbId: string;
  namaBerkas: NamaBerkasPpdb;
  urlFile: string;
  status?: string | null;
  keterangan?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}

export interface PendaftarPpdb extends PendaftaranPpdb {
  jalurPpdb?: {
    id: string;
    nama: string;
    deskripsi?: string | null;
    kuota?: number;
    tanggalMulai?: string | null;
    tanggalSelesai?: string | null;
    status?: string | null;
  } | null;
  berkasPpdb?: BerkasPpdb[];
}

export interface GetPendaftarPpdbResponse {
  success: boolean;
  message?: string;
  data: PendaftarPpdb[];
}

export interface UploadBerkasPpdbResponse {
  success: boolean;
  message?: string;
  data: BerkasPpdb;
}

export interface VerifikasiPpdbPayload {
  status: "lulus" | "ditolak";
  kelasId?: string;
}

export interface VerifikasiPpdbData {
  pengguna?: {
    id: string;
    namaPengguna: string;
    email: string;
    namaLengkap: string;
    nisn: string;
  };
  kelasId?: string;
  pendaftaranId?: string;
}

export interface VerifikasiPpdbResponse {
  success: boolean;
  message?: string;
  data?: VerifikasiPpdbData;
}

export async function daftarPpdb(
  payload: DaftarPpdbPayload
): Promise<DaftarPpdbResponse> {
  if (!payload?.sekolahId) {
    throw new Error("Sekolah wajib dipilih.");
  }

  if (!payload?.jalurPpdbId) {
    throw new Error("Jalur PPDB wajib dipilih.");
  }

  if (!payload?.namaLengkap?.trim()) {
    throw new Error("Nama lengkap wajib diisi.");
  }

  if (!payload?.nisn?.trim()) {
    throw new Error("NISN wajib diisi.");
  }

  if (!payload?.tanggalLahir) {
    throw new Error("Tanggal lahir wajib diisi.");
  }

  return apiFetch(`${ENDPOINT}/daftar`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPendaftarPpdb(
  filterOrJalurId?:
    | string
    | {
        search?: string;
        jalurPpdbId?: string;
        status?: string;
        page?: number;
        limit?: number;
      }
): Promise<any> {
  const query = new URLSearchParams();

  if (typeof filterOrJalurId === "string") {
    if (filterOrJalurId) query.set("jalurPpdbId", filterOrJalurId);
  } else if (filterOrJalurId && typeof filterOrJalurId === "object") {
    if (filterOrJalurId.search) query.set("search", filterOrJalurId.search);
    if (filterOrJalurId.jalurPpdbId) query.set("jalurPpdbId", filterOrJalurId.jalurPpdbId);
    if (filterOrJalurId.status) query.set("status", filterOrJalurId.status);
    if (filterOrJalurId.page) query.set("page", String(filterOrJalurId.page));
    if (filterOrJalurId.limit) query.set("limit", String(filterOrJalurId.limit));
  }

  const qs = query.toString();
  const endpoint = `${ENDPOINT}/pendaftar${qs ? `?${qs}` : ""}`;

  return apiFetch(endpoint, {
    method: "GET",
  });
}

export async function getPendaftarPpdbById(id: string): Promise<any> {
  if (!id) {
    throw new Error("ID pendaftaran tidak ditemukan.");
  }

  return apiFetch(`${ENDPOINT}/pendaftar/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export function isPpdbEndpointMissing(error: unknown): boolean {
  const err = error as {
    status?: number;
    raw?: unknown;
  };

  if (err?.status !== 404) {
    return false;
  }

  if (typeof err.raw === "string") {
    return true;
  }

  if (
    err.raw &&
    typeof err.raw === "object" &&
    "errorCode" in err.raw
  ) {
    return false;
  }

  return true;
}

export async function getProfilSekolahPublik(subdomain: string): Promise<any> {
  if (!subdomain) {
    throw new Error("Subdomain sekolah tidak ditemukan.");
  }

  return apiFetch(`/api/publik/${encodeURIComponent(subdomain)}/profil`, {
    method: "GET",
  });
}

export async function getPengaturanSpmb(): Promise<{
  success: boolean;
  message?: string;
  data: {
    statusPenerimaan: "buka" | "tutup";
    prefixNomorPendaftaran: string;
    verifikasiBerkasWajib: boolean;
  };
}> {
  const response = await apiFetch("/api/pengaturan", { method: "GET" });

  const list = Array.isArray(response?.data) ? response.data : null;

  if (!list) {
    throw new Error(
      "Format respons GET /api/pengaturan tidak dikenali."
    );
  }

  const map = new Map<string, string>();
  list.forEach((item: any) => {
    if (item?.kunci) map.set(item.kunci, String(item.nilai ?? ""));
  });

  const statusPenerimaan =
    map.get("spmb_status_penerimaan") === "tutup" ? "tutup" : "buka";
  const prefixNomorPendaftaran =
    map.get("spmb_prefix_nomor_pendaftaran") || "PPDB";
  const verifikasiBerkasWajib =
    map.get("spmb_verifikasi_berkas_wajib") === "true";

  return {
    success: true,
    data: {
      statusPenerimaan,
      prefixNomorPendaftaran,
      verifikasiBerkasWajib,
    },
  };
}

export async function updatePengaturanSpmb(payload: {
  statusPenerimaan: "buka" | "tutup";
  prefixNomorPendaftaran: string;
  verifikasiBerkasWajib: boolean;
}): Promise<any> {
  await Promise.all([
    apiFetch("/api/pengaturan", {
      method: "POST",
      body: JSON.stringify({
        kunci: "spmb_status_penerimaan",
        nilai: payload.statusPenerimaan,
        tipeData: "string",
        kelompok: "spmb",
        keterangan: "Status penerimaan PPDB/SPMB (buka/tutup)",
      }),
    }),
    apiFetch("/api/pengaturan", {
      method: "POST",
      body: JSON.stringify({
        kunci: "spmb_prefix_nomor_pendaftaran",
        nilai: payload.prefixNomorPendaftaran,
        tipeData: "string",
        kelompok: "spmb",
        keterangan: "Prefix nomor pendaftaran PPDB/SPMB",
      }),
    }),
    apiFetch("/api/pengaturan", {
      method: "POST",
      body: JSON.stringify({
        kunci: "spmb_verifikasi_berkas_wajib",
        nilai: String(Boolean(payload.verifikasiBerkasWajib)),
        tipeData: "boolean",
        kelompok: "spmb",
        keterangan: "Wajib verifikasi berkas PPDB",
      }),
    }),
  ]);

  return {
    success: true,
    message: "Pengaturan SPMB berhasil disimpan.",
    data: payload,
  };
}

function sanitizeErrorMessage(rawMessage: any, fallback = "Terjadi kesalahan."): string {
  if (!rawMessage || typeof rawMessage !== "string") return fallback;
  return (
    rawMessage
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
      .replace(/(?:token|tokenPendaftaran)\s*[:=]\s*[^\s,]+/gi, "token: [REDACTED]")
      .replace(/ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "[REDACTED]")
      .trim() || fallback
  );
}

export async function uploadBerkasPpdb(
  id: string,
  file: File,
  namaBerkas: NamaBerkasPpdb,
  tokenPendaftaran?: string
): Promise<UploadBerkasPpdbResponse> {
  if (!id) {
    throw new Error(
      "ID pendaftaran tidak ditemukan."
    );
  }

  if (!(file instanceof File)) {
    throw new Error("File belum dipilih.");
  }

  if (!namaBerkas) {
    throw new Error(
      "Jenis berkas belum dipilih."
    );
  }

  if (
    !["KK", "AKTE", "IJAZAH"].includes(
      namaBerkas
    )
  ) {
    throw new Error(
      "Jenis berkas harus KK, AKTE, atau IJAZAH."
    );
  }

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const baseUrl = API_URL.replace(/\/+$/, "").replace(
    /\/api(?:\/v\d+)?$/,
    ""
  );

  const formData = new FormData();

  formData.append("file", file);
  formData.append("namaBerkas", namaBerkas);

  const headers = new Headers();

  headers.set(
    "Accept",
    "application/json"
  );

  const token =
    typeof window !== "undefined"
      ? getToken()
      : null;

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  let uploadToken = tokenPendaftaran ? String(tokenPendaftaran).trim() : "";
  if (!uploadToken && typeof window !== "undefined") {
    try {
      uploadToken = String(sessionStorage.getItem("ppdb_token_pendaftaran") || "").trim();
      if (!uploadToken) {
        const sub = sessionStorage.getItem("ppdb_last_submission");
        if (sub) {
          const parsed = JSON.parse(sub);
          uploadToken = String(parsed?.tokenPendaftaran || "").trim();
        }
      }
      if (!uploadToken && window.location?.search) {
        const sp = new URLSearchParams(window.location.search);
        uploadToken = String(sp.get("token") || sp.get("tokenPendaftaran") || "").trim();
      }
    } catch {
    }
  }

  if (uploadToken) {
    headers.set("x-ppdb-token", uploadToken);
    formData.append("tokenPendaftaran", uploadToken);
    formData.append("token", uploadToken);
  }

  const response = await fetch(
    `${baseUrl}${ENDPOINT}/${encodeURIComponent(
      id
    )}/berkas`,
    {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
    }
  );

  let data: UploadBerkasPpdbResponse | null =
    null;

  const contentType =
    response.headers.get("content-type");

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (response.status === 401) {
    if (!uploadToken) {
      clearSession();
    }

    throw new Error(
      sanitizeErrorMessage(
        data?.message ||
          (uploadToken
            ? "Akses ditolak: Token pendaftaran tidak valid atau telah kedaluwarsa."
            : "Sesi login telah berakhir. Silakan login kembali.")
      )
    );
  }

  if (!response.ok) {
    throw new Error(
      sanitizeErrorMessage(
        data?.message ||
          `Gagal mengupload berkas. Status: ${response.status}`
      )
    );
  }

  if (!data) {
    throw new Error(
      "Response upload berkas tidak valid."
    );
  }

  return data;
}

export async function verifikasiPpdb(
  id: string,
  payload: VerifikasiPpdbPayload
): Promise<VerifikasiPpdbResponse> {
  if (!id) {
    throw new Error(
      "ID pendaftaran tidak ditemukan."
    );
  }

  if (!payload?.status) {
    throw new Error(
      "Status verifikasi belum ditentukan."
    );
  }

  if (
    payload.status !== "lulus" &&
    payload.status !== "ditolak"
  ) {
    throw new Error(
      "Status hanya boleh lulus atau ditolak."
    );
  }

  if (
    payload.status === "lulus" &&
    !payload.kelasId
  ) {
    throw new Error(
      "Kelas wajib dipilih untuk pendaftar yang lulus."
    );
  }

  return apiFetch(
    `${ENDPOINT}/${encodeURIComponent(
      id
    )}/verifikasi`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

const ppdbService = {
  daftarPpdb,
  getPendaftarPpdb,
  getPendaftarPpdbById,
  uploadBerkasPpdb,
  verifikasiPpdb,
  getPengaturanSpmb,
  updatePengaturanSpmb,
  getProfilSekolahPublik,
};

export default ppdbService;