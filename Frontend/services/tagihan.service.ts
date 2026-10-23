import { apiFetch } from "@/lib/api";


const BASE_PATH = "/api/keuangan";


export type StatusTagihan =
  | "belum_bayar"
  | "sebagian"
  | "lunas"
  | "batal";

export type MetodePembayaran =
  | "tunai"
  | "transfer"
  | "qris"
  | "lainnya";

export interface SiswaRingkas {
  id: string;
  namaLengkap: string;
  nis?: string | null;
  nisn?: string | null;
}

export interface KategoriRingkas {
  id: string;
  kode: string;
  nama: string;
  siklus?: string;
}

export interface TahunAjaranRingkas {
  id: string;
  tahunAjaran?: string;
  semester?: string;
}

export interface PembayaranTagihan {
  id: string;
  sekolahId?: string;
  tagihanId: string;
  siswaId: string;
  akunKasId: string;
  penerimaId?: string | null;
  nomorPembayaran: string;
  jumlah: string | number;
  metode: MetodePembayaran | string;
  tanggalBayar: string;
  referensi?: string | null;
  catatan?: string | null;
  status: string;
  dibatalkanPada?: string | null;
  alasanPembatalan?: string | null;
  dibuatPada?: string;
  penerima?: { id: string; namaLengkap: string } | null;
  akunKas?: { id: string; kode?: string; nama: string } | null;
  siswa?: SiswaRingkas | null;
  tagihan?: {
    id: string;
    nomorTagihan?: string;
    periodeBulan?: number | null;
    periodeTahun?: number | null;
    kategoriTagihan?: { kode: string; nama: string } | null;
  } | null;
}

export interface Tagihan {
  id: string;
  sekolahId?: string;
  siswaId: string;
  kategoriTagihanId: string;
  tarifTagihanId?: string | null;
  tahunAjaranId: string;
  nomorTagihan: string;
  periodeBulan?: number | null;
  periodeTahun?: number | null;
  nominal: string | number;
  diskon: string | number;
  totalTagihan: string | number;
  totalDibayar: string | number;
  sisa: string | number;
  jatuhTempo: string;
  status: StatusTagihan | string;
  keterangan?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  siswa?: SiswaRingkas | null;
  kategoriTagihan?: KategoriRingkas | null;
  tahunAjaran?: TahunAjaranRingkas | null;
  pembayaran?: PembayaranTagihan[];
  hariTerlambat?: number;
}

export interface AkunKas {
  id: string;
  sekolahId?: string;
  kode: string;
  nama: string;
  tipe?: string | null;
  saldoAwal?: string | number;
  saldo?: string | number;
  status?: string | null;
}

export interface RingkasanTagihan {
  jumlahTagihan: number;
  totalTagihan: string | number;
  totalDibayar: string | number;
  totalSisa: string | number;
  jumlahTunggakan: number;
  totalTunggakan: string | number;
  perStatus: Array<{ status: string; jumlah: number }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: PaginationMeta;
}

export interface ItemResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TagihanQuery {
  page?: number;
  limit?: number;
  siswaId?: string;
  kelasId?: string;
  status?: string;
  kategoriTagihanId?: string;
  tahunAjaranId?: string;
  periodeBulan?: number;
  periodeTahun?: number;
  q?: string;
}

export interface TunggakanQuery {
  page?: number;
  limit?: number;
  siswaId?: string;
  kelasId?: string;
  kategoriTagihanId?: string;
  tahunAjaranId?: string;
}

export interface GenerateTagihanPayload {
  kategoriTagihanId: string;
  tahunAjaranId: string;
  jatuhTempo: string;
  kelasId?: string;
  periodeBulan?: number;
  periodeTahun?: number;
  keterangan?: string;
}

export interface BayarTagihanPayload {
  tagihanId: string;
  akunKasId: string;
  metode: MetodePembayaran;
  jumlah: number;
  tanggalBayar?: string;
  referensi?: string;
  catatan?: string;
}


function buildQuery(
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}


export async function getTagihan(
  params: TagihanQuery = {}
): Promise<PageResponse<Tagihan>> {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    siswaId: params.siswaId,
    kelasId: params.kelasId,
    status: params.status,
    kategoriTagihanId: params.kategoriTagihanId,
    tahunAjaranId: params.tahunAjaranId,
    periodeBulan: params.periodeBulan,
    periodeTahun: params.periodeTahun,
    q: params.q,
  });

  return apiFetch(`${BASE_PATH}/tagihan${query}`, { method: "GET" });
}

export async function getRingkasanTagihan(
  params: { tahunAjaranId?: string } = {}
): Promise<ItemResponse<RingkasanTagihan>> {
  const query = buildQuery({ tahunAjaranId: params.tahunAjaranId });

  return apiFetch(`${BASE_PATH}/tagihan/ringkasan${query}`, {
    method: "GET",
  });
}

export async function getDetailTagihan(
  id: string
): Promise<ItemResponse<Tagihan>> {
  if (!id) {
    throw new Error("ID tagihan wajib diisi.");
  }

  return apiFetch(`${BASE_PATH}/tagihan/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function generateTagihan(
  payload: GenerateTagihanPayload
): Promise<
  ItemResponse<{
    totalSiswa: number;
    dibuat: number;
    dilewatiSudahAda: number;
    dilewatiTanpaTarif: number;
  }>
> {
  if (!payload?.kategoriTagihanId) {
    throw new Error("Kategori tagihan wajib dipilih.");
  }

  if (!payload?.tahunAjaranId) {
    throw new Error("Tahun ajaran wajib dipilih.");
  }

  if (!payload?.jatuhTempo) {
    throw new Error("Jatuh tempo wajib diisi.");
  }

  return apiFetch(`${BASE_PATH}/tagihan/generate`, {
    method: "POST",
    body: JSON.stringify({
      kategoriTagihanId: payload.kategoriTagihanId,
      tahunAjaranId: payload.tahunAjaranId,
      kelasId: payload.kelasId || undefined,
      jatuhTempo: payload.jatuhTempo,
      periodeBulan: payload.periodeBulan,
      periodeTahun: payload.periodeTahun,
      keterangan: payload.keterangan?.trim() || undefined,
    }),
  });
}

export async function batalkanTagihan(id: string, alasan: string) {
  if (!id) {
    throw new Error("ID tagihan wajib diisi.");
  }

  if (!alasan?.trim()) {
    throw new Error("Alasan pembatalan wajib diisi.");
  }

  return apiFetch(`${BASE_PATH}/tagihan/${encodeURIComponent(id)}/batal`, {
    method: "POST",
    body: JSON.stringify({ alasan: alasan.trim() }),
  });
}


export async function getTunggakan(
  params: TunggakanQuery = {}
): Promise<
  PageResponse<Tagihan> & {
    ringkasan?: { totalTunggakan: string | number; jumlahTagihan: number };
  }
> {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    siswaId: params.siswaId,
    kelasId: params.kelasId,
    kategoriTagihanId: params.kategoriTagihanId,
    tahunAjaranId: params.tahunAjaranId,
  });

  return apiFetch(`${BASE_PATH}/tunggakan${query}`, { method: "GET" });
}

export async function getRekapTunggakanSiswa(
  params: TunggakanQuery = {}
) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    siswaId: params.siswaId,
    kelasId: params.kelasId,
    kategoriTagihanId: params.kategoriTagihanId,
    tahunAjaranId: params.tahunAjaranId,
  });

  return apiFetch(`${BASE_PATH}/tunggakan/rekap-siswa${query}`, {
    method: "GET",
  });
}


export async function bayarTagihan(
  payload: BayarTagihanPayload
): Promise<ItemResponse<{ pembayaran: PembayaranTagihan; tagihan: unknown }>> {
  if (!payload?.tagihanId) {
    throw new Error("ID tagihan wajib diisi.");
  }

  if (!payload?.akunKasId) {
    throw new Error("Akun kas wajib dipilih.");
  }

  if (!payload?.metode) {
    throw new Error("Metode pembayaran wajib dipilih.");
  }

  if (
    !Number.isFinite(Number(payload.jumlah)) ||
    Number(payload.jumlah) <= 0
  ) {
    throw new Error("Jumlah pembayaran harus lebih dari 0.");
  }

  return apiFetch(`${BASE_PATH}/pembayaran`, {
    method: "POST",
    body: JSON.stringify({
      tagihanId: payload.tagihanId,
      akunKasId: payload.akunKasId,
      metode: payload.metode,
      jumlah: Number(payload.jumlah),
      tanggalBayar: payload.tanggalBayar || undefined,
      referensi: payload.referensi?.trim() || undefined,
      catatan: payload.catatan?.trim() || undefined,
    }),
  });
}

export async function getPembayaran(
  params: {
    page?: number;
    limit?: number;
    siswaId?: string;
    tagihanId?: string;
    metode?: string;
    status?: string;
    akunKasId?: string;
    dari?: string;
    sampai?: string;
    q?: string;
  } = {}
) {
  const query = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    siswaId: params.siswaId,
    tagihanId: params.tagihanId,
    metode: params.metode,
    status: params.status,
    akunKasId: params.akunKasId,
    dari: params.dari,
    sampai: params.sampai,
    q: params.q,
  });

  return apiFetch(`${BASE_PATH}/pembayaran${query}`, { method: "GET" });
}

export async function getDetailPembayaran(id: string) {
  if (!id) {
    throw new Error("ID pembayaran wajib diisi.");
  }

  return apiFetch(`${BASE_PATH}/pembayaran/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function batalkanPembayaran(id: string, alasan: string) {
  if (!id) {
    throw new Error("ID pembayaran wajib diisi.");
  }

  if (!alasan?.trim()) {
    throw new Error("Alasan pembatalan wajib diisi.");
  }

  return apiFetch(
    `${BASE_PATH}/pembayaran/${encodeURIComponent(id)}/batal`,
    {
      method: "POST",
      body: JSON.stringify({ alasan: alasan.trim() }),
    }
  );
}


export async function getAkunKas(
  params: { status?: string } = {}
): Promise<{
  success: boolean;
  message: string;
  data: AkunKas[];
  ringkasan?: { totalSaldo: string | number };
}> {
  const query = buildQuery({ status: params.status });

  return apiFetch(`${BASE_PATH}/akun-kas${query}`, { method: "GET" });
}
