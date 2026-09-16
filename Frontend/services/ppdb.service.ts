import { apiFetch } from "../lib/api";

const ENDPOINT = "/api/v1/ppdb";

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
  jalurPpdbId?: string
): Promise<GetPendaftarPpdbResponse> {
  const query = jalurPpdbId
    ? `?jalurPpdbId=${encodeURIComponent(jalurPpdbId)}`
    : "";

  return apiFetch(
    `${ENDPOINT}/pendaftar${query}`,
    {
      method: "GET",
    }
  );
}

export async function uploadBerkasPpdb(
  id: string,
  file: File,
  namaBerkas: NamaBerkasPpdb
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

  const baseUrl = API_URL.replace(/\/+$/, "");

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
      ? localStorage.getItem("token")
      : null;

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";

    throw new Error(
      data?.message ||
        "Sesi login telah berakhir. Silakan login kembali."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Gagal mengupload berkas. Status: ${response.status}`
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
  uploadBerkasPpdb,
  verifikasiPpdb,
};

export default ppdbService;