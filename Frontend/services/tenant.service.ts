
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
 * ============================================================
 * PARSE API RESPONSE
 * ============================================================
 */

async function parseResponse<T = unknown>(
  response: Response
): Promise<T> {
  const text = await response.text();

  let result: any = null;

  if (text.trim()) {
    try {
      result = JSON.parse(text);
    } catch {
      console.error("[TENANT API] Response bukan JSON:", {
        url: response.url,
        status: response.status,
        body: text.slice(0, 1000),
      });

      throw new Error(
        `Respons backend tidak valid (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok || result?.success === false) {
    // Tampilkan informasi untuk debugging.
    // Jangan mencetak kata sandi atau kode OTP.
    console.error("[TENANT API] Request gagal:", {
      url: response.url,
      status: response.status,
      message: result?.message,
      error: result?.error,
      details: result?.details,
      errors: result?.errors,
    });

    throw new Error(
      result?.message ||
        result?.error ||
        (Array.isArray(result?.errors)
          ? result.errors
              .map((item: any) => item?.message ?? String(item))
              .join(", ")
          : undefined) ||
        `Request gagal (HTTP ${response.status}).`
    );
  }

  if (result === null) {
    throw new Error("Backend mengembalikan respons kosong.");
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

  const endpoint = getTenantEndpoint("register");

  console.log("[REGISTER TENANT] Request:", {
    endpoint,
    jenisPendaftaran,
    paketId: data.paketId,
    email: data.email.trim().toLowerCase(),
  });

  const response = await fetch(endpoint, {
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

  const endpoint = getTenantEndpoint("verify");

  console.log("[VERIFY TENANT] Request:", {
    endpoint,
    email: normalizedEmail,
    otpLength: normalizedOtp.length,
    bank: bank ?? "tidak ada",
  });

  const response = await fetch(endpoint, {
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
 * GET TENANT STATUS
 *
 * GET /api/tenant/status
 *
 * Gunakan hanya jika route ini sudah tersedia di backend.
 * Fungsi ini tidak menganggap pembayaran berhasil apabila
 * endpoint status gagal diakses.
 * ============================================================
 */
export interface GetTenantStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    status?: string;
    is_trial?: boolean;
    order_id?: string;
    [key: string]: unknown;
  };
}

export async function getTenantStatus(): Promise<GetTenantStatusResponse> {
  const endpoint = getTenantEndpoint("status");

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const result =
      await parseResponse<GetTenantStatusResponse>(response);

    return result;
  } catch (error) {
    console.error("[GET TENANT STATUS] Error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengecek status tenant.",
      data: {
        status: "waiting",
      },
    };
  }
}
