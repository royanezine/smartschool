import axios from "axios";
import FormData from "form-data";
import { AppError } from "../utils/appError";

export async function postToFaceAi<T>(
  endpoint: "/extract-embedding" | "/verify-face",
  formData: FormData,
) {
  const baseUrl = (
    process.env.AI_SERVICE_URL?.trim() || "http://127.0.0.1:8032"
  ).replace(/\/+$/, "");

  try {
    return await axios.post<T>(`${baseUrl}${endpoint}`, formData, {
      headers: formData.getHeaders(),
      timeout: 30_000,
    });
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) throw error;

    if (!error.response) {
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
