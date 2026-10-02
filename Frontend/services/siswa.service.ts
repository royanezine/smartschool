import { apiFetch } from "../lib/api";

export interface CreateSiswaData {
  namaLengkap: string;
  email: string;
  nisn: string;
  nis?: string;
  kelasId?: string;
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

export async function createSiswa(
  data: CreateSiswaData
) {
  return apiFetch("/api/v1/siswa", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Mengambil kelas siswa yang sedang login.
 */
export async function getKelasSaya() {
  const response = await apiFetch("/api/v1/siswa/me", {
    method: "GET",
  });

  return {
    kelasId: response.data?.kelasId ?? null,
    nama: response.data?.kelas?.nama ?? "",
    tingkat: response.data?.kelas?.tingkat ?? "",
    tahunAjaranId: response.data?.tahunAjaranId ?? "",
  };
}