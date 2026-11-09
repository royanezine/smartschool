import axios from "axios";
import FormData from "form-data";
import { AppError } from "../utils/appError";

let failureCount = 0;
let circuitOpenUntil = 0;
const MAX_FAILURES = 3;
const RESET_TIMEOUT_MS = 60_000; // 1 menit
const REQUEST_TIMEOUT_MS = 5_000; // 5 detik

export async function postToFaceAi<T>(
  endpoint: "/extract-embedding" | "/verify-face",
  formData: FormData,
) {
  const now = Date.now();
  if (circuitOpenUntil > now) {
    throw new AppError(
      "Layanan AI Face sedang gangguan. Silakan coba lagi beberapa saat lagi.",
      503,
      "AI_FACE_CIRCUIT_OPEN",
    );
  }

  const baseUrl = (
    process.env.AI_SERVICE_URL?.trim() || "http://127.0.0.1:8032"
  ).replace(/\/+$/, "");

  try {
    const response = await axios.post<T>(`${baseUrl}${endpoint}`, formData, {
      headers: formData.getHeaders(),
      timeout: REQUEST_TIMEOUT_MS,
    });
    
    failureCount = 0; // reset kalau sukses
    return response;
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) throw error;

    // Kalau timeout atau network error, tambah counter
    if (!error.response || error.code === "ECONNABORTED") {
      failureCount++;
      if (failureCount >= MAX_FAILURES) {
        circuitOpenUntil = Date.now() + RESET_TIMEOUT_MS;
        console.warn(`[CIRCUIT BREAKER] AI Face Server mati ${failureCount}x. Membuka circuit selama ${RESET_TIMEOUT_MS / 1000} detik.`);
      }

      if (error.code === "ECONNABORTED") {
        throw new AppError(
          "Layanan AI Face terlalu lama merespons. Silakan coba lagi.",
          504,
          "AI_FACE_TIMEOUT",
        );
      }

      throw new AppError(
        `AI Face Server tidak dapat dihubungi di ${baseUrl}. Pastikan server Python sudah berjalan dan AI_SERVICE_URL sesuai dengan host serta port server Python.`,
        503,
        "AI_FACE_UNAVAILABLE",
      );
    }

    if (error.response.status === 400 || error.response.status === 422) {
      const data = error.response.data;
      const message =
        typeof data?.message === "string"
          ? data.message
          : typeof data?.detail === "string"
            ? data.detail
            : "Foto wajah tidak valid atau wajah tidak terdeteksi.";
      throw new AppError(message, 400, "AI_FACE_INVALID_IMAGE");
    }

    if (error.response.status === 404) {
      throw new AppError(
        `Endpoint ${endpoint} tidak ditemukan di AI Face Server. Pastikan versi aiservices sudah diperbarui dan AI_SERVICE_URL mengarah ke server yang benar.`,
        502,
        "AI_FACE_ENDPOINT_NOT_FOUND",
      );
    }

    throw new AppError(
      "AI Face Server gagal memproses foto. Periksa log server Python.",
      502,
      "AI_FACE_ERROR",
    );
  }
}