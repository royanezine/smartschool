import { apiFetch } from "../lib/api";



export type SiklusPenagihan =
  | "monthly"
  | "annual";

export interface CreatePaymentData {
  paketId: string;
  siklusPenagihan: SiklusPenagihan;
}



export interface LanggananData {
  id: string;

  sekolahId?: string | null;
  paketId?: string | null;
  dibuatOleh?: string | null;

  hargaSaatBerlangganan?: number | null;

  siklusPenagihan?: string | null;

  statusPembayaran?: string | null;
  statusLangganan?: string | null;

  tanggalMulai?: string | null;
  tanggalBerakhir?: string | null;

  dibuatPada?: string | null;
  diperbaruiPada?: string | null;

  midtransOrderId?: string | null;
  midtransPaymentLink?: string | null;

  sekolah?: {
    id?: string;
    nama?: string;
    kode?: string;
    subdomain?: string;
    status?: string;
  } | null;

  paket?: {
    id?: string;
    nama?: string;
    harga?: number;
  } | null;
}



export async function createPayment(
  data: CreatePaymentData
) {
  if (!data?.paketId) {
    throw new Error(
      "Paket langganan belum dipilih."
    );
  }

  if (
    data.siklusPenagihan !==
      "monthly" &&
    data.siklusPenagihan !==
      "annual"
  ) {
    throw new Error(
      "Siklus penagihan tidak valid."
    );
  }

  const response = await apiFetch(
    "/api/v1/langganan/sekolah/bayar",
    {
      method: "POST",

      body: JSON.stringify({
        paketId: data.paketId,
        siklusPenagihan:
          data.siklusPenagihan,
      }),
    }
  );

  console.log(
    "========== CREATE PAYMENT =========="
  );

  console.log(
    "PAYMENT RESPONSE:",
    response
  );

  console.log(
    "===================================="
  );

  return response;
}



export async function getPendingPayments() {
  const response = await apiFetch(
    "/api/v1/langganan/sekolah/pending",
    {
      method: "GET",
    }
  );

  console.log(
    "========== PENDING PAYMENTS =========="
  );

  console.log(
    "PENDING RESPONSE:",
    response
  );

  console.log(
    "======================================"
  );

  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  return [];
}



export async function getAllLangganan(): Promise<
  LanggananData[]
> {
  const response = await apiFetch(
    "/api/v1/langganan/sekolah",
    {
      method: "GET",
    }
  );

  console.log(
    "========== ALL LANGGANAN =========="
  );

  console.log(
    "ALL LANGGANAN RESPONSE:",
    response
  );

  console.log(
    "==================================="
  );

  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  return [];
}