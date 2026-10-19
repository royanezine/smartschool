
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * ============================================================
 * API URL
 * Mendukung:
 * http://localhost:5000
 * http://localhost:5000/api
 * ============================================================
 */
function getApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  return API_URL.trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");
}

function getTenantEndpoint(path: string): string {
  return `${getApiUrl()}/api/tenant/${path.replace(/^\/+/, "")}`;
}

/**
 * Error khusus pemanggilan API tenant.
 * Menyimpan status HTTP dan errorCode dari server agar pemanggil
 * (mis. halaman onboarding) dapat mengklasifikasikan kegagalan dengan benar
 * tanpa menebak dari teks pesan.
 */
export class TenantApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;
  readonly payload?: unknown;

  constructor(
    message: string,
    status: number,
    errorCode?: string,
    payload?: unknown,
  ) {
    super(message);
    this.name = "TenantApiError";
    this.status = status;
    this.errorCode = errorCode;
    this.payload = payload;
  }
}

/**
 * Pemeriksa tipe yang aman meskipun instance Error melewati batas bundel.
 */
export function isTenantApiError(error: unknown): error is TenantApiError {
  if (error instanceof TenantApiError) {
    return true;
  }

  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "TenantApiError" &&
    typeof (error as { status?: unknown }).status === "number"
  );
}

/**
 * Klasifikasi kegagalan OTP SETELAH data pendaftaran tersimpan.
 *
 * Backend (POST /api/tenant/register) menyimpan pendaftaran lebih dahulu,
 * lalu — bila pengiriman email OTP gagal — membalas HTTP 502 dengan body
 * JSON: { success: false, message, errorCode }. Karena status 502 untuk
 * kasus ini dipetakan Backend ke errorCode generik "INTERNAL_SERVER_ERROR"
 * (tidak ada kode khusus SMTP), satu-satunya sinyal yang benar-benar
 * mengonfirmasi kondisi ini adalah pesan resmi Backend yang menyatakan
 * bahwa pendaftaran tersimpan namun email OTP gagal dikirim.
 *
 * Fungsi ini SENGAJA tidak hanya mengandalkan status HTTP 502: proxy/gateway
 * yang membalas 502 JSON generik tidak boleh dianggap sebagai konfirmasi
 * bahwa data pendaftaran sudah tersimpan.
 */
export function isOtpEmailFailureAfterSave(
  error: unknown,
): error is TenantApiError {
  if (!isTenantApiError(error)) {
    return false;
  }

  // 502 "UPSTREAM_UNAVAILABLE" dibuat parseResponse untuk respons non-JSON
  // dari proxy/gateway, bukan dari handler Backend, sehingga bukan konfirmasi.
  if (error.status !== 502 || error.errorCode === "UPSTREAM_UNAVAILABLE") {
    return false;
  }

  const payload = error.payload;

  if (!payload || typeof payload !== "object") {
    return false;
  }

  if ((payload as { success?: unknown }).success !== false) {
    return false;
  }

  const message = String(
    (payload as { message?: unknown }).message ?? error.message ?? "",
  );

  // Konfirmasi Backend: "Pendaftaran tersimpan, tetapi email OTP gagal dikirim..."
  const menyebutOtp = /\botp\b/i.test(message);
  const menyebutTersimpanAtauGagalKirim =
    /tersimpan/i.test(message) || /gagal\s+dikirim/i.test(message);

  return menyebutOtp && menyebutTersimpanAtauGagalKirim;
}

const NETWORK_ERROR_MESSAGE =
  "Tidak dapat terhubung ke server SmartSchool. Periksa koneksi internet Anda, lalu coba lagi.";

/**
 * Membungkus fetch agar kegagalan jaringan (koneksi ditolak, offline, DNS,
 * timeout) tidak bocor sebagai TypeError tanpa status. Server yang benar-benar
 * tidak dapat dijangkau dibedakan dari respons HTTP berstatus.
 */
async function requestTenant(
  path: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(getTenantEndpoint(path), init);
  } catch {
    throw new TenantApiError(NETWORK_ERROR_MESSAGE, 0, "NETWORK_ERROR");
  }
}

/**
 * ============================================================
 * PARSE API RESPONSE
 * ============================================================
 */

async function parseResponse<T = unknown>(
  response: Response
): Promise<T> {
  const text = await response.text();

  let result: any = null;
  let safePath = "endpoint";
  try {
    if (response.url) {
      safePath = new URL(response.url).pathname;
    }
  } catch {
    safePath = "endpoint";
  }

  if (text.trim()) {
    try {
      result = JSON.parse(text);
    } catch {
      // Tangani respons non-JSON (misal proxy HTML 502/504) dengan aman tanpa mencetak body
      console.warn("[TENANT API] Respons non-JSON diterima:", {
        endpoint: safePath,
        status: response.status,
      });

      if (!response.ok) {
        if (response.status === 502 || response.status === 504) {
          throw new TenantApiError(
            "Layanan server sementara tidak dapat dihubungi (HTTP " +
              response.status +
              "). Silakan coba lagi nanti.",
            response.status,
            "UPSTREAM_UNAVAILABLE"
          );
        }
        throw new TenantApiError(
          `Terjadi kesalahan pada server (HTTP ${response.status}).`,
          response.status,
          "HTTP_ERROR"
        );
      }

      throw new TenantApiError(
        `Respons backend tidak valid (HTTP ${response.status}).`,
        response.status,
        "INVALID_RESPONSE"
      );
    }
  }

  if (!response.ok || result?.success === false) {
    // Ekstraksi dan sanitasi pesan error tanpa mengekspos stack trace atau data sensitif
    const rawMessage =
      result?.message ||
      result?.error ||
      (Array.isArray(result?.errors)
        ? result.errors
            .map((item: any) =>
              typeof item === "string" ? item : item?.message ?? String(item)
            )
            .filter(Boolean)
            .join(", ")
        : undefined) ||
      `Request gagal (HTTP ${response.status}).`;

    // Hilangkan informasi stack trace jika ada
    const sanitizedMessage = String(rawMessage)
      .split("\n")[0]
      ?.replace(/^Error:\s*/i, "")
      ?.trim() || `Request gagal (HTTP ${response.status}).`;

    // Catat hanya informasi diagnostik yang aman: endpoint, status, dan pesan tersanitasi
    console.warn("[TENANT API] Request gagal:", {
      endpoint: safePath,
      status: response.status,
      message: sanitizedMessage,
    });

    throw new TenantApiError(
      sanitizedMessage,
      response.status,
      result?.errorCode,
      result
    );
  }

  if (result === null) {
    if (response.ok) {
      return {} as T;
    }
    throw new TenantApiError(
      `Backend mengembalikan respons kosong (HTTP ${response.status}).`,
      response.status,
      "EMPTY_RESPONSE"
    );
  }

  return result as T;
}


/**
 * ============================================================
 * TIPE DATA
 * ============================================================
 */
export type TenantBank =
  | "bca"
  | "bni"
  | "bri"
  | "mandiri"
  | "permata";

export type JenisPendaftaran =
  | "sekolah"
  | "yayasan";

export type JenjangSekolah =
  | "SD"
  | "SMP"
  | "SMA"
  | "SMK"
  | "SLB"
  | "Lainnya";

/**
 * ============================================================
 * REGISTER TENANT REQUEST
 * ============================================================
 */
export interface RegisterTenantData {
  jenisPendaftaran?: JenisPendaftaran;

  paketId: string;
  nama: string;
  email: string;
  kataSandi: string;

  // Data sekolah
  namaSekolah?: string;
  jenjang?: JenjangSekolah;
  subdomain?: string;
  alamatSekolah?: string;
  teleponSekolah?: string;
  logo?: string;

  // Data yayasan
  namaYayasan?: string;
  alamatYayasan?: string;
  teleponYayasan?: string;
  emailYayasan?: string;
  npypYayasan?: string;

  // Kompatibilitas kode pemanggil lama.
  // Tidak dikirim ke backend.
  yayasanId?: string;
}

/**
 * ============================================================
 * REGISTER TENANT RESPONSE
 * ============================================================
 */
export interface RegisterTenantResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * ============================================================
 * REGISTER TENANT
 *
 * POST /api/tenant/register
 * ============================================================
 */
export async function registerTenant(
  data: RegisterTenantData
): Promise<RegisterTenantResponse> {
  const jenisPendaftaran =
    data.jenisPendaftaran ?? "sekolah";

  const payload: Record<string, unknown> = {
    jenisPendaftaran,
    paketId: data.paketId,
    nama: data.nama.trim(),
    email: data.email.trim().toLowerCase(),
    kataSandi: data.kataSandi,
  };

  if (jenisPendaftaran === "sekolah") {
    payload.namaSekolah = data.namaSekolah?.trim();
    payload.jenjang = data.jenjang;
    payload.subdomain = data.subdomain
      ?.trim()
      .toLowerCase();
    payload.alamatSekolah = data.alamatSekolah?.trim();
    payload.teleponSekolah = data.teleponSekolah?.trim();

    if (data.logo?.trim()) {
      payload.logo = data.logo.trim();
    }
  } else {
    payload.namaYayasan = data.namaYayasan?.trim();
    payload.alamatYayasan = data.alamatYayasan?.trim();
    payload.teleponYayasan = data.teleponYayasan?.trim();
    payload.emailYayasan = data.emailYayasan
      ?.trim()
      .toLowerCase();
    payload.npypYayasan = data.npypYayasan?.trim();
  }

  console.log("[REGISTER TENANT] Mengirim permintaan registrasi:", {
    jenisPendaftaran,
    paketId: data.paketId,
  });

  const response = await requestTenant("register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result =
    await parseResponse<RegisterTenantResponse>(response);

  console.log("[REGISTER TENANT] Response:", {
    success: result.success,
    message: result.message,
  });

  return result;
}

/**
 * ============================================================
 * VERIFY TENANT RESPONSE
 *
 * Sesuai respons verifyAndPay pada backend.
 * ============================================================
 */
export interface VerifyTenantResponse {
  success: boolean;
  message: string;
  data?: {
    order_id?: string;
    gross_amount?: number;
    bank?: TenantBank;
    va_number?: string | null;
    biller_code?: string | null;
    bill_key?: string | null;
    expiry_time?: string | null;
    is_trial?: boolean;
    jenis_pendaftaran?: JenisPendaftaran;
  };
}

/**
 * ============================================================
 * VERIFY TENANT / OTP
 *
 * POST /api/tenant/verify
 * ============================================================
 */
export async function verifyTenant(
  email: string,
  kodeOtp: string,
  bank?: TenantBank
): Promise<VerifyTenantResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = kodeOtp.replace(/\s+/g, "");

  if (!normalizedEmail) {
    throw new Error("Email wajib diisi.");
  }

  if (!/^\d{6}$/.test(normalizedOtp)) {
    throw new Error("Kode OTP harus terdiri dari 6 digit.");
  }

  const allowedBanks: TenantBank[] = [
    "bca",
    "bni",
    "bri",
    "mandiri",
    "permata",
  ];

  if (bank && !allowedBanks.includes(bank)) {
    throw new Error("Pilihan bank tidak valid.");
  }

  const payload = {
    email: normalizedEmail,
    kodeOtp: normalizedOtp,
    ...(bank ? { bank } : {}),
  };

  console.log("[VERIFY TENANT] Mengirim verifikasi OTP:", {
    otpLength: normalizedOtp.length,
    bank: bank ?? "tidak ada",
  });

  const response = await requestTenant("verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result =
    await parseResponse<VerifyTenantResponse>(response);

  console.log("[VERIFY TENANT] Response:", {
    success: result.success,
    message: result.message,
    isTrial: result.data?.is_trial,
    orderId: result.data?.order_id,
    bank: result.data?.bank,
    grossAmount: result.data?.gross_amount,
    hasVaNumber: Boolean(result.data?.va_number),
  });

  return result;
}

/**
 * ============================================================
 * CATATAN AUDIT — ENDPOINT YANG TIDAK TERSEDIA DI BACKEND
 * ============================================================
 * Kontrak Backend saat ini (Backend/src/routes/tenant.routes.ts)
 * HANYA mendefinisikan:
 *
 *   POST /api/tenant/register   (registerTenant)
 *   POST /api/tenant/verify     (verifyAndPay)
 *
 * Dua fungsi berikut dahulunya ada di layanan ini dan memanggil rute
 * yang TIDAK tersedia, sehingga dihapus agar Frontend tidak pernah
 * memanggil endpoint yang tidak ada:
 *
 *   1. POST /api/tenant/create-va
 *      Virtual Account sebenarnya sudah dibuat di dalam
 *      POST /api/tenant/verify (bank dikirim saat verifikasi OTP).
 *      Rute terpisah tidak ada, jadi memanggilnya akan menghasilkan 404.
 *
 *   2. GET /api/tenant/status?order_id=...&email=...
 *      Tidak ada rute status tenant di Backend. Status pembayaran dan
 *      aktivasi sekolah hanya diproses melalui webhook Midtrans
 *      (POST /api/webhooks/midtrans). Tanpa rute ini, Frontend tidak
 *      dapat memverifikasi status pembayaran sendiri, sehingga tidak
 *      boleh menampilkan status "berhasil" tanpa konfirmasi server.
 *
 * Kedua rute di atas harus ditambahkan di Backend terlebih dahulu
 * (tanpa mengubah Backend dari sisi Frontend) agar pemeriksaan status
 * pembayaran onboarding dapat diintegrasikan sepenuhnya.
 * ============================================================
 */
