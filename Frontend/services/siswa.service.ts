
import { apiFetch } from "../lib/api";

export interface CreateSiswaData {
  namaLengkap: string;
  email: string;
  nisn: string;
  nis?: string;
  kelasId: string;
  nik?: string;
  namaAyah?: string;
  pekerjaanAyah?: string;
  namaIbu?: string;
  pekerjaanIbu?: string;
  alamatKtp?: string;
  alamatDomisili?: string;
  kecamatan?: string;
  kelurahan?: string;
  kota?: string;
}

export interface KelasSaya {
  kelasId: string;
  nama: string;
  tingkat: string;
  tahunAjaranId: string;
}

export async function createSiswa(data: CreateSiswaData) {
  if (!data.kelasId?.trim()) {
    throw new Error("Kelas wajib dipilih.");
  }

  return apiFetch("/api/siswa", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      namaLengkap: data.namaLengkap.trim(),
      email: data.email.trim(),
      nisn: data.nisn.trim(),
      kelasId: data.kelasId.trim(),
    }),
  });
}

/**
 * Mengambil kelas siswa yang sedang login.
 */
export async function getKelasSaya(): Promise<KelasSaya> {
  const response = await apiFetch("/api/siswa/me", {
    method: "GET",
  });

  return {
    kelasId: response.data?.kelasId ?? "",
    nama: response.data?.kelas?.nama ?? "",
    tingkat: response.data?.kelas?.tingkat ?? "",
    tahunAjaranId: response.data?.tahunAjaranId ?? "",
  };
}