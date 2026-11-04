
import { apiFetch } from "../lib/api";

export interface ShiftSiswa {
  id: string;
  sekolahId?: string;
  kode: string;
  nama: string;
  jamMasuk: string;
  jamKeluar: string;
  toleransiTerlambatMenit: number;
  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface UpdateShiftSiswaPayload {
  jamMasuk?: string;
  jamKeluar?: string;
  toleransiTerlambatMenit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


export async function getShiftSiswa(): Promise<ShiftSiswa[]> {
  const response = (await apiFetch("/api/shift-siswa", {
    method: "GET",
  })) as ApiResponse<ShiftSiswa[]>;

  return response.data;
}

/**
 * Memperbarui jam masuk, jam keluar, atau toleransi keterlambatan.
 * Backend: PUT /api/shift-siswa/:kode
 */
export async function updateShiftSiswa(
  kode: string,
  payload: UpdateShiftSiswaPayload
): Promise<ShiftSiswa> {
  if (!kode?.trim()) {
    throw new Error("Kode shift siswa wajib diisi.");
  }

  const normalizedKode = kode.trim().toLowerCase();

  if (Object.keys(payload).length === 0) {
    throw new Error("Minimal satu data shift harus diperbarui.");
  }

  if (
    payload.toleransiTerlambatMenit !== undefined &&
    (!Number.isInteger(payload.toleransiTerlambatMenit) ||
      payload.toleransiTerlambatMenit < 0)
  ) {
    throw new Error(
      "Toleransi keterlambatan harus berupa bilangan bulat nonnegatif."
    );
  }

  const response = (await apiFetch(
    `/api/shift-siswa/${encodeURIComponent(normalizedKode)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  )) as ApiResponse<ShiftSiswa>;

  return response.data;
}
