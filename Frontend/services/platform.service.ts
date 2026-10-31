import { apiFetch } from "../lib/api";

/**
 * Service untuk resource platform global (khusus role super_admin).
 *
 * Endpoint ini adalah satu-satunya resource global yang disediakan Backend
 * untuk Super Admin. Endpoint yayasan (/api/yayasan/*) TIDAK boleh dipakai
 * dari halaman Super Admin karena mensyaratkan `yayasanId` milik admin_yayasan.
 *
 * Kontrak Backend (Backend/src/routes/platform.routes.ts):
 *   GET /api/platform/sekolah      -> { success, data[], meta }
 *   GET /api/platform/sekolah/:id  -> { success, data }
 *   GET /api/platform/yayasan      -> { success, data[], meta }
 *   GET /api/platform/yayasan/:id  -> { success, data }
 *   GET /api/platform/ringkasan    -> { success, data }
 */

export interface PlatformSekolah {
  id: string;
  nama: string;
  subdomain: string | null;
  kode: string | null;
  npsn: string | null;
  status: string | null;
  jenjang: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  dibuatPada: string | null;
  yayasan?: { id: string; nama: string } | null;
  langgananSekolah?: Array<{
    id: string;
    statusLangganan: string | null;
    tanggalMulai: string | null;
    tanggalBerakhir: string | null;
    paket?: { id: string; nama: string } | null;
  }>;
  _count?: { pengguna?: number; kelas?: number };
}

export interface PlatformYayasan {
  id: string;
  nama: string;
  npyp: string | null;
  status: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  dibuatPada: string | null;
  statusLangganan: string | null;
  tanggalMulaiLangganan: string | null;
  tanggalBerakhirLangganan: string | null;
  paket?: { id: string; nama: string } | null;
  _count?: { sekolah?: number };
}

export interface PlatformRingkasan {
  totalSekolah: number;
  totalYayasan: number;
  totalPengguna: number;
  sekolahAktif: number;
  langgananTrialAktif: number;
  langgananBerbayarAktif: number;
  dihitungPada: string;
}

export interface PlatformMeta {
  page: number;
  limit: number;
  total: number;
  totalData: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PlatformListResponse<T> {
  success: boolean;
  data: T[];
  meta: PlatformMeta;
}

interface PlatformQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

function buildQuery(params?: PlatformQuery) {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);

  const qs = query.toString();

  return qs ? `?${qs}` : "";
}

export const getPlatformSekolah = async (
  params?: PlatformQuery
): Promise<PlatformListResponse<PlatformSekolah>> => {
  return apiFetch(`/api/platform/sekolah${buildQuery(params)}`, {
    method: "GET",
    cache: "no-store",
  });
};

export const getPlatformSekolahDetail = async (id: string) => {
  if (!id) {
    throw new Error("ID sekolah tidak ditemukan.");
  }

  return apiFetch(`/api/platform/sekolah/${id}`, {
    method: "GET",
    cache: "no-store",
  });
};

export const getPlatformYayasan = async (
  params?: PlatformQuery
): Promise<PlatformListResponse<PlatformYayasan>> => {
  return apiFetch(`/api/platform/yayasan${buildQuery(params)}`, {
    method: "GET",
    cache: "no-store",
  });
};

export const getPlatformYayasanDetail = async (id: string) => {
  if (!id) {
    throw new Error("ID yayasan tidak ditemukan.");
  }

  return apiFetch(`/api/platform/yayasan/${id}`, {
    method: "GET",
    cache: "no-store",
  });
};

export const getPlatformRingkasan = async (): Promise<{
  success: boolean;
  data: PlatformRingkasan;
}> => {
  return apiFetch("/api/platform/ringkasan", {
    method: "GET",
    cache: "no-store",
  });
};

/**
 * Mengambil seluruh sekolah platform (lintas halaman) untuk kebutuhan tabel
 * yang memakai pagination di sisi klien.
 */
export const getSemuaSekolahPlatform = async (): Promise<PlatformSekolah[]> => {
  const jumlahPerHalaman = 1000;
  const hasil: PlatformSekolah[] = [];

  const pertama = await getPlatformSekolah({
    page: 1,
    limit: jumlahPerHalaman,
  });

  if (!pertama || !Array.isArray(pertama.data)) {
    return hasil;
  }

  hasil.push(...pertama.data);

  const totalHalaman = Number(pertama.meta?.totalPages) || 1;

  for (let halaman = 2; halaman <= totalHalaman; halaman += 1) {
    const berikutnya = await getPlatformSekolah({
      page: halaman,
      limit: jumlahPerHalaman,
    });

    if (!berikutnya || !Array.isArray(berikutnya.data)) {
      break;
    }

    hasil.push(...berikutnya.data);
  }

  return hasil;
};