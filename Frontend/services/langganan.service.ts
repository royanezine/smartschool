import { apiFetch } from "../lib/api";

// ============================================================
// TYPES
// ============================================================

export type SiklusPenagihan = "monthly" | "annual";

export interface PaketRingkas {
  id: string;
  nama: string;
  deskripsi?: string | null;
  harga: number;
  durasi: number;
}

export interface CreatePaymentData {
  paketId: string;
  siklusPenagihan: SiklusPenagihan;
}

export interface CreatePaymentResult {
  /**
   * Backend saat ini TIDAK mengembalikan order_id pada respons
   * POST /api/langganan/sekolah/bayar. Nilai ini opsional dan bisa
   * diresolusi dari endpoint /pending (lihat getPendingPayments).
   */
  order_id?: string | null;
  payment_url: string | null;
  token?: string | null;
  jumlah: number;
  paket: PaketRingkas | null;
  paketId?: string | null;
  siklusPenagihan: SiklusPenagihan;
  langgananId?: string | null;
  riwayatId?: string | null;
  tanggalMulai?: string | null;
  tanggalBerakhir?: string | null;
}

export interface LanggananData {
  id: string;
  sekolahId?: string | null;
  paketId?: string | null;
  statusPembayaran?: string | null;
  statusLangganan?: string | null;
  hargaSaatBerlangganan?: number | null;
  siklusPenagihan?: string | null;
  tanggalMulai?: string | null;
  tanggalBerakhir?: string | null;
  dibuatPada?: string | null;
  midtransInvoiceId?: string | null;
  midtransPaymentLink?: string | null;
  sekolah?: {
    id?: string;
    nama?: string;
    subdomain?: string | null;
    status?: string | null;
  } | null;
  paket?: PaketRingkas | null;
}

export interface RiwayatPembayaranData {
  id: string;
  langgananSekolahId?: string | null;
  sekolahId?: string | null;
  jumlah: number;
  metode?: string | null;
  status?: string | null;
  midtransPaymentId?: string | null;
  midtransInvoiceId?: string | null;
  dibuatPada?: string | null;
  langgananSekolah?: LanggananData | null;
}

export interface PaymentStatusData {
  order_id: string;
  status: string | null;
  jumlah: number;
  metode?: string | null;
  midtransPaymentId?: string | null;
  dibuatPada?: string | null;
  payment_url?: string | null;
  siklusPenagihan?: string | null;
  statusPembayaran?: string | null;
  statusLangganan?: string | null;
  tanggalMulai?: string | null;
  tanggalBerakhir?: string | null;
  paket?: PaketRingkas | null;
}

// ============================================================
// NORMALIZERS
// ============================================================

function unwrapData(response: any) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }

  return response;
}

function normalizePaketRingkas(paket: any): PaketRingkas | null {
  if (!paket || typeof paket !== "object") {
    return null;
  }

  return {
    id: String(paket.id ?? ""),
    nama: paket.nama ?? "Paket",
    deskripsi: paket.deskripsi ?? null,
    harga: Number(paket.harga ?? 0),
    durasi: Number(paket.durasi ?? 1),
  };
}

export function normalizeLangganan(item: any): LanggananData {
  return {
    id: String(item?.id ?? ""),
    sekolahId: item?.sekolahId ?? null,
    paketId: item?.paketId ?? null,
    statusPembayaran: item?.statusPembayaran ?? null,
    statusLangganan: item?.statusLangganan ?? null,
    hargaSaatBerlangganan:
      item?.hargaSaatBerlangganan !== undefined &&
      item?.hargaSaatBerlangganan !== null
        ? Number(item.hargaSaatBerlangganan)
        : null,
    siklusPenagihan: item?.siklusPenagihan ?? null,
    tanggalMulai: item?.tanggalMulai ?? null,
    tanggalBerakhir: item?.tanggalBerakhir ?? null,
    dibuatPada: item?.dibuatPada ?? null,
    midtransInvoiceId:
      item?.midtransInvoiceId ?? item?.midtransOrderId ?? null,
    midtransPaymentLink: item?.midtransPaymentLink ?? null,
    sekolah: item?.sekolah
      ? {
          id: item.sekolah.id,
          nama: item.sekolah.nama,
          subdomain: item.sekolah.subdomain ?? null,
          status: item.sekolah.status ?? null,
        }
      : null,
    paket: normalizePaketRingkas(item?.paket),
  };
}

function normalizeRiwayat(item: any): RiwayatPembayaranData {
  return {
    id: String(item?.id ?? ""),
    langgananSekolahId: item?.langgananSekolahId ?? null,
    sekolahId: item?.sekolahId ?? null,
    jumlah: Number(item?.jumlah ?? 0),
    metode: item?.metode ?? null,
    status: item?.status ?? null,
    midtransPaymentId: item?.midtransPaymentId ?? null,
    midtransInvoiceId: item?.midtransInvoiceId ?? null,
    dibuatPada: item?.dibuatPada ?? null,
    langgananSekolah: item?.langgananSekolah
      ? normalizeLangganan(item.langgananSekolah)
      : null,
  };
}

/**
 * Memetakan status pembayaran pada tabel langganan_sekolah
 * (pending | success | expired) ke status transaksi
 * (pending | success | failed) yang dipakai UI.
 */
export function mapStatusPembayaran(
  status?: string | null
): "pending" | "success" | "failed" {
  switch (status) {
    case "success":
      return "success";
    case "expired":
    case "failed":
    case "cancel":
    case "deny":
      return "failed";
    default:
      return "pending";
  }
}

/**
 * Menyusun satu baris riwayat/transaksi dari data langganan sekolah.
 * Dipakai karena backend tidak memiliki endpoint riwayat pembayaran.
 */
function toRiwayatFromLangganan(
  item: LanggananData
): RiwayatPembayaranData {
  const jumlah =
    item.hargaSaatBerlangganan !== undefined &&
    item.hargaSaatBerlangganan !== null
      ? Number(item.hargaSaatBerlangganan)
      : Number(item.paket?.harga ?? 0);

  return {
    id: item.id,
    langgananSekolahId: item.id,
    sekolahId: item.sekolahId ?? null,
    jumlah,
    metode: "Midtrans",
    status: mapStatusPembayaran(item.statusPembayaran),
    midtransPaymentId: null,
    midtransInvoiceId: item.midtransInvoiceId ?? null,
    dibuatPada: item.dibuatPada ?? null,
    langgananSekolah: item,
  };
}

function toArray(response: any): any[] {
  const data = unwrapData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

// ============================================================
// CREATE PAYMENT (Pembelian paket baru)
// POST /api/langganan/sekolah/bayar
// ============================================================

export async function createPayment(
  data: CreatePaymentData
): Promise<CreatePaymentResult> {
  if (!data?.paketId) {
    throw new Error("Paket langganan belum dipilih.");
  }

  if (
    data.siklusPenagihan !== "monthly" &&
    data.siklusPenagihan !== "annual"
  ) {
    throw new Error("Siklus penagihan tidak valid.");
  }

  const response = await apiFetch("/api/langganan/sekolah/bayar", {
    method: "POST",
    body: JSON.stringify({
      paketId: data.paketId,
      siklusPenagihan: data.siklusPenagihan,
    }),
  });

  const payload = unwrapData(response) ?? {};

  // Backend (POST /api/langganan/sekolah/bayar) hanya mengembalikan
  // { payment_url, token }. Tautan pembayaran adalah artefak yang
  // benar-benar dibutuhkan untuk melanjutkan transaksi.
  const paymentUrl = payload.payment_url ?? null;

  if (!paymentUrl) {
    throw new Error("Backend tidak mengembalikan tautan pembayaran.");
  }

  return {
    order_id: payload.order_id ?? null,
    payment_url: paymentUrl,
    token: payload.token ?? null,
    jumlah: Number(payload.jumlah ?? 0),
    paket: normalizePaketRingkas(payload.paket),
    paketId: data.paketId,
    siklusPenagihan: data.siklusPenagihan,
    langgananId: payload.langgananId ?? null,
    riwayatId: payload.riwayatId ?? null,
    tanggalMulai: payload.tanggalMulai ?? null,
    tanggalBerakhir: payload.tanggalBerakhir ?? null,
  };
}

// ============================================================
// EXTEND SUBSCRIPTION (Perpanjangan)
// POST /api/langganan/sekolah/perpanjang
// ============================================================

export async function extendSubscription(
  data: CreatePaymentData
): Promise<CreatePaymentResult> {
  if (!data?.paketId) {
    throw new Error("Paket langganan belum dipilih.");
  }

  if (
    data.siklusPenagihan !== "monthly" &&
    data.siklusPenagihan !== "annual"
  ) {
    throw new Error("Siklus penagihan tidak valid.");
  }

  const response = await apiFetch("/api/langganan/sekolah/perpanjang", {
    method: "POST",
    body: JSON.stringify({
      paketId: data.paketId,
      siklusPenagihan: data.siklusPenagihan,
    }),
  });

  const payload = unwrapData(response) ?? {};

  // Backend (POST /api/langganan/sekolah/perpanjang) hanya
  // mengembalikan { payment_url, token, langganan, pembayaran, ... }.
  const paymentUrl = payload.payment_url ?? null;

  if (!paymentUrl) {
    throw new Error(
      "Backend tidak mengembalikan tautan pembayaran perpanjangan."
    );
  }

  const langganan = payload.langganan ?? null;

  return {
    order_id:
      langganan?.midtransInvoiceId ??
      payload.order_id ??
      null,
    payment_url: paymentUrl,
    token: payload.token ?? null,
    jumlah: Number(
      payload.pembayaran?.jumlah ??
        langganan?.hargaSaatBerlangganan ??
        0
    ),
    paket: normalizePaketRingkas(langganan?.paket),
    paketId: data.paketId,
    siklusPenagihan: data.siklusPenagihan,
    langgananId: langganan?.id ?? null,
    riwayatId: payload.pembayaran?.id ?? null,
    tanggalMulai: payload.tanggalMulai ?? null,
    tanggalBerakhir: payload.tanggalBerakhir ?? null,
  };
}

// ============================================================
// GET PENDING PAYMENTS
// GET /api/langganan/sekolah/pending
// ============================================================

export async function getPendingPayments(): Promise<
  RiwayatPembayaranData[]
> {
  const response = await apiFetch("/api/langganan/sekolah/pending", {
    method: "GET",
    cache: "no-store",
  });

  return toArray(response).map(normalizeRiwayat);
}

// ============================================================
// GET RIWAYAT PEMBAYARAN (semua transaksi sekolah)
//
// CATATAN: Backend tidak menyediakan GET /api/langganan/sekolah/riwayat.
// Data riwayat diturunkan dari endpoint yang benar-benar tersedia:
//   GET /api/langganan/sekolah  (satu baris per transaksi langganan)
// ============================================================

export async function getRiwayatPembayaran(): Promise<
  RiwayatPembayaranData[]
> {
  const langganan = await getAllLangganan();

  return langganan.map(toRiwayatFromLangganan);
}

// ============================================================
// GET ALL LANGGANAN
// GET /api/langganan/sekolah
// ============================================================

export async function getAllLangganan(): Promise<LanggananData[]> {
  const response = await apiFetch("/api/langganan/sekolah", {
    method: "GET",
    cache: "no-store",
  });

  return toArray(response).map(normalizeLangganan);
}

// ============================================================
// GET PAYMENT STATUS
//
// CATATAN: Backend tidak menyediakan
// GET /api/langganan/sekolah/status/:orderId. Status transaksi
// diresolusi dari endpoint yang benar-benar tersedia:
//   1. GET /api/langganan/sekolah/pending  (transaksi yang masih pending)
//   2. GET /api/langganan/sekolah          (status pembayaran tersimpan)
// Verifikasi pembayaran sebenarnya terjadi lewat webhook Midtrans
// yang memperbarui database di backend.
// ============================================================

export async function getPaymentStatus(
  orderId: string
): Promise<PaymentStatusData> {
  if (!orderId) {
    throw new Error("Order ID tidak ditemukan.");
  }

  // 1. Coba dari daftar pembayaran pending.
  try {
    const pending = await getPendingPayments();
    const pembayaran = pending.find(
      (item) =>
        item.midtransInvoiceId === orderId ||
        item.langgananSekolah?.midtransInvoiceId === orderId
    );

    if (pembayaran) {
      return buildStatusFromRiwayat(pembayaran);
    }
  } catch {
    // Endpoint pending bisa ditolak izin/tenant; lanjut ke sumber berikutnya.
  }

  // 2. Coba dari data langganan sekolah.
  try {
    const langganan = await getAllLangganan();
    const cocok = langganan.find(
      (item) => item.midtransInvoiceId === orderId
    );

    if (cocok) {
      return buildStatusFromLangganan(cocok);
    }
  } catch {
    // Abaikan, lempar error di bawah.
  }

  throw new Error("Status pembayaran tidak ditemukan.");
}

function buildStatusFromRiwayat(
  item: RiwayatPembayaranData
): PaymentStatusData {
  const langganan = item.langgananSekolah ?? null;

  return {
    order_id: String(item.midtransInvoiceId ?? ""),
    status: item.status ?? "pending",
    jumlah: Number(item.jumlah ?? 0),
    metode: item.metode ?? null,
    midtransPaymentId: item.midtransPaymentId ?? null,
    dibuatPada: item.dibuatPada ?? null,
    payment_url: langganan?.midtransPaymentLink ?? null,
    siklusPenagihan: langganan?.siklusPenagihan ?? null,
    statusPembayaran: langganan?.statusPembayaran ?? null,
    statusLangganan: langganan?.statusLangganan ?? null,
    tanggalMulai: langganan?.tanggalMulai ?? null,
    tanggalBerakhir: langganan?.tanggalBerakhir ?? null,
    paket: langganan?.paket ?? null,
  };
}

function buildStatusFromLangganan(
  item: LanggananData
): PaymentStatusData {
  const jumlah =
    item.hargaSaatBerlangganan !== undefined &&
    item.hargaSaatBerlangganan !== null
      ? Number(item.hargaSaatBerlangganan)
      : Number(item.paket?.harga ?? 0);

  return {
    order_id: String(item.midtransInvoiceId ?? ""),
    status: mapStatusPembayaran(item.statusPembayaran),
    jumlah,
    metode: "Midtrans",
    midtransPaymentId: null,
    dibuatPada: item.dibuatPada ?? null,
    payment_url: item.midtransPaymentLink ?? null,
    siklusPenagihan: item.siklusPenagihan ?? null,
    statusPembayaran: item.statusPembayaran ?? null,
    statusLangganan: item.statusLangganan ?? null,
    tanggalMulai: item.tanggalMulai ?? null,
    tanggalBerakhir: item.tanggalBerakhir ?? null,
    paket: item.paket ?? null,
  };
}

// ============================================================
// HELPERS
// ============================================================

export function findActiveLangganan(
  list: LanggananData[]
): LanggananData | null {
  const now = Date.now();

  const aktif = list.filter(
    (item) =>
      item.statusLangganan === "active" &&
      (!item.tanggalBerakhir ||
        new Date(item.tanggalBerakhir).getTime() >= now)
  );

  if (aktif.length === 0) {
    // Fallback: langganan aktif terbaru walaupun periode belum terisi.
    return (
      list.find((item) => item.statusLangganan === "active") ?? null
    );
  }

  return aktif.sort(
    (a, b) =>
      new Date(b.tanggalBerakhir ?? 0).getTime() -
      new Date(a.tanggalBerakhir ?? 0).getTime()
  )[0];
}

export function sisaHari(tanggalBerakhir?: string | null): number | null {
  if (!tanggalBerakhir) {
    return null;
  }

  const end = new Date(tanggalBerakhir).getTime();

  if (Number.isNaN(end)) {
    return null;
  }

  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}
