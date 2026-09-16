const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * ============================================================
 * GET API URL
 * ============================================================
 */
function getApiUrl() {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  return API_URL.replace(/\/$/, "");
}

/**
 * ============================================================
 * PARSE API RESPONSE
 * ============================================================
 */
async function parseResponse(response: Response) {
  const text = await response.text();

  let result: any = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Server mengembalikan response yang tidak valid. Status: ${response.status}`
    );
  }

  console.log(
    "========== API RESPONSE =========="
  );

  console.log(
    "STATUS:",
    response.status
  );

  console.log(
    "OK:",
    response.ok
  );

  console.log(
    "RESULT:",
    result
  );

  console.log(
    "================================="
  );

  /**
   * Jika HTTP status bukan 2xx
   */
  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        result?.errors?.[0]?.message ||
        `Request gagal. Status: ${response.status}`
    );
  }

  return result;
}

/**
 * ============================================================
 * REGISTER TENANT
 * ============================================================
 */
export interface RegisterTenantData {
  paketId: string;
  nama: string;
  namaSekolah: string;
  jenjang: string;
  subdomain: string;
  email: string;
  teleponSekolah: string;
  alamatSekolah: string;
  kataSandi: string;
  logo?: string;
  yayasanId?: string;
}

export interface RegisterTenantResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * POST /api/v1/tenant/register
 */
export async function registerTenant(
  data: RegisterTenantData
): Promise<RegisterTenantResponse> {
  const response = await fetch(
    `${getApiUrl()}/api/v1/tenant/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        paketId: data.paketId,

        nama: data.nama
          .trim(),

        namaSekolah:
          data.namaSekolah.trim(),

        jenjang:
          data.jenjang,

        subdomain:
          data.subdomain
            .trim()
            .toLowerCase(),

        email:
          data.email
            .trim()
            .toLowerCase(),

        teleponSekolah:
          data.teleponSekolah.trim(),

        alamatSekolah:
          data.alamatSekolah.trim(),

        kataSandi:
          data.kataSandi,

        ...(data.logo?.trim()
          ? {
              logo:
                data.logo.trim(),
            }
          : {}),

        ...(data.yayasanId
          ? {
              yayasanId:
                data.yayasanId,
            }
          : {}),
      }),
    }
  );

  return parseResponse(
    response
  );
}

/**
 * ============================================================
 * VERIFY TENANT RESPONSE
 * ============================================================
 */
export interface VerifyTenantResponse {
  success: boolean;

  message: string;

  data?: {
    payment_url?: string;

    is_trial?: boolean;

    order_id?: string;

    bank?: string;

    va_number?: string;

    gross_amount?: number;
  };
}

/**
 * ============================================================
 * VERIFY TENANT
 * ============================================================
 *
 * POST /api/v1/tenant/verify
 *
 * Paket berbayar:
 * {
 *   success: true,
 *   message: "...",
 *   data: {
 *     payment_url: "...",
 *     is_trial: false,
 *     order_id: "..."
 *   }
 * }
 *
 * Paket trial:
 * {
 *   success: true,
 *   message: "...",
 *   data: {
 *     is_trial: true
 *   }
 * }
 */
export async function verifyTenant(
  email: string,
  kodeOtp: string,
  bank?: "bca" | "bni" | "bri"
): Promise<VerifyTenantResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = kodeOtp.trim();

  console.log(
    "========== VERIFY REQUEST =========="
  );

  console.log(
    "EMAIL:",
    normalizedEmail
  );

  console.log(
    "OTP LENGTH:",
    normalizedOtp.length
  );

  console.log(
    "BANK:",
    bank || "tidak ada"
  );

  console.log(
    "===================================="
  );

  const response = await fetch(
    `${getApiUrl()}/api/v1/tenant/verify`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        email: normalizedEmail,
        kodeOtp: normalizedOtp,

        ...(bank
          ? {
              bank: bank.toLowerCase(),
            }
          : {}),
      }),
    }
  );

  const result = await parseResponse(response);

  console.log(
    "========== VERIFY RESPONSE =========="
  );

  console.log(
    "SUCCESS:",
    result?.success
  );

  console.log(
    "MESSAGE:",
    result?.message
  );

  console.log(
    "IS TRIAL:",
    result?.data?.is_trial
  );

  console.log(
    "PAYMENT URL:",
    result?.data?.payment_url
  );

  console.log(
    "ORDER ID:",
    result?.data?.order_id
  );

  console.log(
    "VA NUMBER:",
    result?.data?.va_number
  );

  console.log(
    "BANK:",
    result?.data?.bank
  );

  console.log(
    "GROSS AMOUNT:",
    result?.data?.gross_amount
  );

  console.log(
    "====================================="
  );

  return result;
}