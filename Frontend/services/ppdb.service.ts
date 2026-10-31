import { apiFetch } from "../lib/api";
import { clearSession, getToken } from "../lib/auth";

const ENDPOINT = "/api/ppdb";

export interface DaftarPpdbPayload {
  sekolahId: string;
  jalurPpdbId: string;
  jurusanId?: string;
  gelombangPpdbId?: string;
  nik: string;
  namaLengkap: string;
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  telepon?: string;
  email: string;
  namaAyah?: string;
  namaIbu?: string;
  asalSekolah?: string;
  nilaiRapor?: number;
  lintang?: number;
  bujur?: number;
}

export interface PendaftaranPpdb {
  id: string;
  sekolahId: string;
  jalurPpdbId: string;
  gelombangPpdbId?: string | null;
  gelombang?: string | null;
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
  | "IJAZAH"
  | "SERTIFIKAT"
  | "SKTM"
  | "KIP"
  | "SURAT_TUGAS";

export const BERKAS_PPDB_LIST: readonly NamaBerkasPpdb[] = [
  "KK",
  "AKTE",
  "IJAZAH",
  "SERTIFIKAT",
  "SKTM",
  "KIP",
  "SURAT_TUGAS",
] as const;

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

export interface HasilSeleksiPpdb {
  id?: string;
  pendaftaranPpdbId?: string;
  nilaiTes?: number | string | null;
  peringkat?: number | null;
  statusKelulusan?: string | null;
  catatan?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}

export interface EntriRanking {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  jarakKm: number | null;
  nilaiRapor: number | null;
  status: string | null;
  berkasLengkap: boolean;
  berkasKurang: string[];
  memenuhiKriteria: boolean;
  alasanTidakMemenuhi: string[];
  peringkat: number;
  masukKuota: boolean;
}

export interface HasilRanking {
  jalurId: string;
  namaJalur: string;
  kategori: string;
  metodeRanking: string;
  kuota: number;
  berkasWajib: string[];
  totalPendaftar: number;
  daftar: EntriRanking[];
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
  gelombangPpdb?: {
    id: string;
    nama: string;
    tanggalMulai?: string | null;
    tanggalSelesai?: string | null;
    kuota?: number | null;
    status?: string | null;
  } | null;
  berkasPpdb?: BerkasPpdb[];
  hasilSeleksiPpdb?: HasilSeleksiPpdb | null;
  pengguna?: {
    id: string;
    namaPengguna?: string;
    namaLengkap?: string;
    email?: string;
    nisn?: string;
    status?: string | null;
  } | null;
  sekolah?: {
    id: string;
    nama?: string;
    jenjang?: string | null;
  } | null;
}

export interface PpdbPagination {
  page: number;
  limit: number;
  total: number;
  totalData: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PpdbStatistik {
  total: number;
  menunggu: number;
  lulus: number;
  ditolak: number;
}

export interface GetPendaftarPpdbResponse {
  success: boolean;
  message?: string;
  data: PendaftarPpdb[];
  meta?: Partial<PpdbPagination>;
  pagination?: Partial<PpdbPagination>;
  statistik?: Partial<PpdbStatistik>;
}

export interface GetPendaftarPpdbDetailResponse {
  success: boolean;
  message?: string;
  data: PendaftarPpdb;
}

export interface GetAllPendaftarPpdbResult {
  data: PendaftarPpdb[];
  total: number;
  statistik?: PpdbStatistik;
  jumlahHalaman: number;
  terpotong: boolean;
}

export interface UploadBerkasPpdbResponse {
  success: boolean;
  message?: string;
  data: BerkasPpdb;
}

export interface VerifikasiPpdbPayload {
  status: "lulus" | "ditolak" | "diverifikasi";
  kelasId?: string;
  abaikanKuota?: boolean;
  catatan?: string;
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

export interface OpsiPpdbSekolah {
  sekolah: {
    id: string;
    nama: string;
    jenjang: string | null;
    koordinatTersedia: boolean;
  };
  wajibJurusan: boolean;
  pendaftaranDibuka: boolean;
  rankingTerbuka: boolean;
  jurusan: Array<{
    id: string;
    kode: string;
    nama: string;
    deskripsi: string | null;
  }>;
  gelombang: Array<{
    id: string;
    nama: string;
    jalurPpdbId: string | null;
    tanggalMulai: string | null;
    tanggalSelesai: string | null;
    kuota: number | null;
  }>;
  jalur: Array<{
    id: string;
    sekolahId: string;
    nama: string;
    deskripsi: string | null;
    kategori: string;
    kuota: number;
    metodeRanking: string;
    jarakMaksimalKm: number | null;
    nilaiMinimal: number | null;
    berkasWajib: string[];
    tanggalMulai: string | null;
    tanggalSelesai: string | null;
    status: string;
    jumlahPendaftar: number;
    pendaftaranBuka: boolean;
  }>;
}

export async function getOpsiPpdbSekolah(
  sekolahId: string
): Promise<{ success: boolean; data: OpsiPpdbSekolah; message?: string }> {
  if (!sekolahId) {
    throw new Error("ID sekolah wajib disertakan.");
  }
  return apiFetch(`${ENDPOINT}/sekolah/${encodeURIComponent(sekolahId)}/opsi`, {
    method: "GET",
  });
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

  if (!payload?.nik || !/^\d{16}$/.test(payload.nik)) {
    throw new Error("NIK wajib diisi dengan 16 digit angka.");
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

  if (!payload?.email?.trim()) {
    throw new Error("Email wajib diisi.");
  }

  return apiFetch(`${ENDPOINT}/daftar`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface PendaftarPpdbFilters {
  search?: string;
  jalurPpdbId?: string;
  gelombangPpdbId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getPendaftarPpdb(
  filterOrJalurId?: string | PendaftarPpdbFilters
): Promise<GetPendaftarPpdbResponse> {
  const query = new URLSearchParams();

  if (typeof filterOrJalurId === "string") {
    if (filterOrJalurId) query.set("jalurPpdbId", filterOrJalurId);
  } else if (filterOrJalurId && typeof filterOrJalurId === "object") {
    if (filterOrJalurId.search?.trim()) {
      query.set("search", filterOrJalurId.search.trim());
    }
    if (filterOrJalurId.jalurPpdbId) {
      query.set("jalurPpdbId", filterOrJalurId.jalurPpdbId);
    }
    if (filterOrJalurId.gelombangPpdbId) {
      query.set("gelombangPpdbId", filterOrJalurId.gelombangPpdbId);
    }
    if (filterOrJalurId.status) {
      query.set("status", filterOrJalurId.status);
    }
    if (filterOrJalurId.page) {
      query.set("page", String(filterOrJalurId.page));
    }
    if (filterOrJalurId.limit) {
      query.set("limit", String(filterOrJalurId.limit));
    }
  }

  const qs = query.toString();
  const endpoint = `${ENDPOINT}/pendaftar${qs ? `?${qs}` : ""}`;

  return apiFetch(endpoint, {
    method: "GET",
  });
}

const LIMIT_PENDAFTAR_MAKS = 100;
const MAKS_HALAMAN_LAPORAN = 50;

function bacaAngka(
  value: unknown,
  fallback: number
): number {
  const angka = Number(value);
  return Number.isFinite(angka) && angka >= 0
    ? angka
    : fallback;
}

function normalisasiStatistik(
  statistik?: Partial<PpdbStatistik>
): PpdbStatistik | undefined {
  if (!statistik) {
    return undefined;
  }

  return {
    total: bacaAngka(statistik.total, 0),
    menunggu: bacaAngka(statistik.menunggu, 0),
    lulus: bacaAngka(statistik.lulus, 0),
    ditolak: bacaAngka(statistik.ditolak, 0),
  };
}

/**
 * Mengambil seluruh halaman daftar pendaftar dari endpoint resmi
 * GET /api/ppdb/pendaftar. Dipakai untuk rekap dashboard/laporan yang
 * membutuhkan data lengkap, bukan hanya satu halaman.
 */
export async function getAllPendaftarPpdb(
  filters: Omit<PendaftarPpdbFilters, "page" | "limit"> = {},
  maxPages = MAKS_HALAMAN_LAPORAN
): Promise<GetAllPendaftarPpdbResult> {
  const first = await getPendaftarPpdb({
    ...filters,
    page: 1,
    limit: LIMIT_PENDAFTAR_MAKS,
  });

  const dataPertama = Array.isArray(first?.data)
    ? first.data
    : [];
  const meta: Partial<PpdbPagination> =
    first?.meta || first?.pagination || {};
  const total = bacaAngka(
    meta.totalData ?? meta.total,
    dataPertama.length
  );
  const limitServer = Math.max(
    1,
    bacaAngka(meta.limit, LIMIT_PENDAFTAR_MAKS)
  );
  const totalHalaman = Math.max(
    1,
    bacaAngka(
      meta.totalPages,
      Math.ceil(total / limitServer)
    )
  );
  const batasHalaman = Math.min(
    totalHalaman,
    Math.max(1, maxPages)
  );

  const data = [...dataPertama];

  for (let halaman = 2; halaman <= batasHalaman; halaman += 1) {
    const response = await getPendaftarPpdb({
      ...filters,
      page: halaman,
      limit: limitServer,
    });

    if (Array.isArray(response?.data)) {
      data.push(...response.data);
    }
  }

  return {
    data,
    total: Math.max(total, data.length),
    statistik: normalisasiStatistik(first?.statistik),
    jumlahHalaman: batasHalaman,
    terpotong: totalHalaman > batasHalaman,
  };
}

export async function getStatistikPpdb(
  filters: Omit<PendaftarPpdbFilters, "page" | "limit"> = {}
): Promise<{ success: boolean; message?: string; data: PpdbStatistik }> {
  const query = new URLSearchParams();
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.jalurPpdbId) query.set("jalurPpdbId", filters.jalurPpdbId);
  if (filters.gelombangPpdbId) query.set("gelombangPpdbId", filters.gelombangPpdbId);
  if (filters.status) query.set("status", filters.status);
  const qs = query.toString();
  return apiFetch(`${ENDPOINT}/pendaftar/statistik${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
}

export async function getPendaftarPpdbById(
  id: string
): Promise<GetPendaftarPpdbDetailResponse> {
  if (!id) {
    throw new Error("ID pendaftaran tidak ditemukan.");
  }

  return apiFetch(`${ENDPOINT}/pendaftar/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export interface MuatDetailPendaftarPpdbResult {
  data: PendaftarPpdb[];
  gagal: Array<{
    id: string;
    message: string;
  }>;
}

/**
 * Memuat detail beberapa pendaftar dengan batas paralel.
 *
 * Dipakai bila respons daftar tidak menyertakan `hasilSeleksiPpdb`
 * (varian `pagination`), sedangkan endpoint detail menyertakannya.
 */
export async function muatDetailPendaftarPpdb(
  ids: string[],
  opsi: {
    batasParalel?: number;
    onProgress?: (selesai: number, total: number) => void;
  } = {}
): Promise<MuatDetailPendaftarPpdbResult> {
  const unik = Array.from(
    new Set(
      (Array.isArray(ids) ? ids : [])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  );

  const batas = Math.max(
    1,
    Math.min(10, Number(opsi.batasParalel) || 4)
  );

  const data: PendaftarPpdb[] = [];
  const gagal: MuatDetailPendaftarPpdbResult["gagal"] = [];

  let indeks = 0;
  let selesai = 0;

  async function pekerja() {
    while (indeks < unik.length) {
      const posisi = indeks;
      indeks += 1;

      const id = unik[posisi];

      try {
        const response = await getPendaftarPpdbById(id);

        if (response?.data) {
          data.push(response.data);
        } else {
          gagal.push({
            id,
            message: "Detail pendaftar tidak ditemukan.",
          });
        }
      } catch (err) {
        gagal.push({
          id,
          message:
            err instanceof Error
              ? err.message
              : "Gagal memuat detail pendaftar.",
        });
      } finally {
        selesai += 1;
        opsi.onProgress?.(selesai, unik.length);
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(batas, unik.length) },
      () => pekerja()
    )
  );

  return { data, gagal };
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

export interface PengaturanSpmb {
  id?: string;
  sekolahId?: string;
  pendaftaranDibuka: boolean;
  wajibLokasi: boolean;
  batasiPendaftarSesuaiKuota: boolean;
  rankingTerbuka: boolean;
  kirimEmailKonfirmasi: boolean;
  jenjang?: string | null;
  lintangSekolah?: number | null;
  bujurSekolah?: number | null;
}

export interface PengaturanSpmbPayload {
  pendaftaranDibuka?: boolean;
  wajibLokasi?: boolean;
  batasiPendaftarSesuaiKuota?: boolean;
  rankingTerbuka?: boolean;
  kirimEmailKonfirmasi?: boolean;
  lintangSekolah?: number | null;
  bujurSekolah?: number | null;
}

export async function getPengaturanSpmb(): Promise<{
  success: boolean;
  message?: string;
  data: PengaturanSpmb;
}> {
  return apiFetch("/api/ppdb/pengaturan", { method: "GET" });
}

export async function updatePengaturanSpmb(
  payload: PengaturanSpmbPayload
): Promise<{
  success: boolean;
  message?: string;
  data: PengaturanSpmb;
}> {
  const cleanPayload: Record<string, unknown> = {};

  if (payload.pendaftaranDibuka !== undefined) {
    cleanPayload.pendaftaranDibuka = Boolean(payload.pendaftaranDibuka);
  }
  if (payload.wajibLokasi !== undefined) {
    cleanPayload.wajibLokasi = Boolean(payload.wajibLokasi);
  }
  if (payload.batasiPendaftarSesuaiKuota !== undefined) {
    cleanPayload.batasiPendaftarSesuaiKuota = Boolean(
      payload.batasiPendaftarSesuaiKuota
    );
  }
  if (payload.rankingTerbuka !== undefined) {
    cleanPayload.rankingTerbuka = Boolean(payload.rankingTerbuka);
  }
  if (payload.kirimEmailKonfirmasi !== undefined) {
    cleanPayload.kirimEmailKonfirmasi = Boolean(payload.kirimEmailKonfirmasi);
  }

  // Jika lintang dan bujur diisi bersamaan
  if (
    payload.lintangSekolah !== undefined &&
    payload.lintangSekolah !== null &&
    payload.bujurSekolah !== undefined &&
    payload.bujurSekolah !== null
  ) {
    cleanPayload.lintangSekolah = Number(payload.lintangSekolah);
    cleanPayload.bujurSekolah = Number(payload.bujurSekolah);
  }

  return apiFetch("/api/ppdb/pengaturan", {
    method: "PATCH",
    body: JSON.stringify(cleanPayload),
  });
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
    !BERKAS_PPDB_LIST.includes(
      namaBerkas
    )
  ) {
    throw new Error(
      `Jenis berkas harus salah satu dari: ${BERKAS_PPDB_LIST.join(", ")}.`
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
  formData.append("jenis", namaBerkas);

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

  const normalizedStatus =
    payload.status === "diverifikasi" ? "lulus" : payload.status;

  if (
    normalizedStatus !== "lulus" &&
    normalizedStatus !== "ditolak"
  ) {
    throw new Error(
      "Status hanya boleh diverifikasi/lulus atau ditolak."
    );
  }

  if (
    normalizedStatus === "lulus" &&
    !payload.kelasId
  ) {
    throw new Error(
      "Kelas wajib dipilih untuk pendaftar yang lulus/diverifikasi."
    );
  }

  const body: Record<string, unknown> = {
    status: normalizedStatus,
    ...(payload.kelasId ? { kelasId: payload.kelasId } : {}),
    ...(payload.abaikanKuota !== undefined ? { abaikanKuota: payload.abaikanKuota } : {}),
    ...(payload.catatan ? { catatan: payload.catatan } : {}),
  };

  return apiFetch(
    `${ENDPOINT}/${encodeURIComponent(
      id
    )}/verifikasi`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

export async function getRankingJalur(
  jalurId: string
): Promise<{ success: boolean; data: HasilRanking; message?: string }> {
  if (!jalurId) {
    throw new Error("ID jalur wajib disertakan.");
  }
  return apiFetch(`${ENDPOINT}/jalur/${encodeURIComponent(jalurId)}/ranking`, {
    method: "GET",
  });
}

export async function getDetailSaya(
  tokenPendaftar?: string
): Promise<{
  success: boolean;
  data: {
    pendaftar: PendaftaranPpdb;
    sekolah: any;
    jalur: {
      id: string;
      nama: string;
      kategori: string;
      berkasWajib: string[];
      [key: string]: any;
    };
    jurusan: any;
    gelombang: any;
    berkas: {
      wajib: string[];
      terunggah: Array<{
        id: string;
        namaBerkas: string;
        urlFile: string;
        status: string;
        keterangan?: string;
        dibuatPada: string;
      }>;
      kurang: string[];
    };
    ranking: any;
    hasilSeleksi: any;
  };
  message?: string;
}> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";
  const baseUrl = API_URL.replace(/\/+$/, "").replace(/\/api(?:\/v\d+)?$/, "");
  const headers = new Headers();
  headers.set("Accept", "application/json");

  let token = tokenPendaftar ? String(tokenPendaftar).trim() : "";
  if (!token && typeof window !== "undefined") {
    token = String(sessionStorage.getItem("ppdb_token_pendaftaran") || "").trim();
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}/api/ppdb/saya`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return response.json();
}

export interface PengumumanPpdb {
  id: string;
  sekolahId: string;
  judul: string;
  konten: string;
  status: "draft" | "dipublikasikan";
  dipublikasikanPada?: string | null;
  dibuatOleh?: string | null;
  diperbaruiOleh?: string | null;
  dihapusPada?: string | null;
  dihapusOleh?: string | null;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface CreatePengumumanPayload {
  judul: string;
  konten: string;
  status?: "draft" | "dipublikasikan";
  dipublikasikanPada?: string | null;
}

export interface UpdatePengumumanPayload {
  judul?: string;
  konten?: string;
  status?: "draft" | "dipublikasikan";
  dipublikasikanPada?: string | null;
}

export async function getPengumumanPpdb(params?: {
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: PengumumanPpdb[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalData: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`${ENDPOINT}/pengumuman${qs}`);
}

export async function getPengumumanPpdbById(id: string): Promise<{
  success: boolean;
  data: PengumumanPpdb;
  message?: string;
}> {
  return apiFetch(`${ENDPOINT}/pengumuman/${id}`);
}

export async function createPengumumanPpdb(
  payload: CreatePengumumanPayload
): Promise<{
  success: boolean;
  data: PengumumanPpdb;
  message?: string;
}> {
  return apiFetch(`${ENDPOINT}/pengumuman`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePengumumanPpdb(
  id: string,
  payload: UpdatePengumumanPayload
): Promise<{
  success: boolean;
  data: PengumumanPpdb;
  message?: string;
}> {
  return apiFetch(`${ENDPOINT}/pengumuman/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePengumumanPpdb(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  return apiFetch(`${ENDPOINT}/pengumuman/${id}`, {
    method: "DELETE",
  });
}

const ppdbService = {
  daftarPpdb,
  getOpsiPpdbSekolah,
  getPendaftarPpdb,
  getStatistikPpdb,
  getAllPendaftarPpdb,
  getPendaftarPpdbById,
  muatDetailPendaftarPpdb,
  uploadBerkasPpdb,
  verifikasiPpdb,
  getPengaturanSpmb,
  updatePengaturanSpmb,
  getProfilSekolahPublik,
  getRankingJalur,
  getDetailSaya,
  getPengumumanPpdb,
  getPengumumanPpdbById,
  createPengumumanPpdb,
  updatePengumumanPpdb,
  deletePengumumanPpdb,
};

export default ppdbService;