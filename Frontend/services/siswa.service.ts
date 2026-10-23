
import { apiFetch } from "../lib/api";

export interface CreateSiswaData {
  namaPengguna: string;
  email: string;
  kataSandi: string;
  namaLengkap: string;
  nisn?: string;
  nis?: string;
  jenisKelamin?: string;
}

export interface KelasSaya {
  kelasId: string;
  nama: string;
  tingkat: string;
  tahunAjaranId: string;
}

export async function createSiswa(data: CreateSiswaData) {
  if (!data.namaPengguna.trim()) {
    throw new Error("Username wajib diisi.");
  }

  if (!data.email.trim()) {
    throw new Error("Email wajib diisi.");
  }

  if (!data.kataSandi) {
    throw new Error("Kata sandi wajib diisi.");
  }

  if (!data.namaLengkap.trim()) {
    throw new Error("Nama lengkap wajib diisi.");
  }

  return apiFetch("/api/siswa", {
    method: "POST",
    body: JSON.stringify({
      namaPengguna: data.namaPengguna.trim(),
      email: data.email.trim(),
      kataSandi: data.kataSandi,
      namaLengkap: data.namaLengkap.trim(),
      nisn: data.nisn?.trim() || undefined,
      nis: data.nis?.trim() || undefined,
      jenisKelamin: data.jenisKelamin || undefined,
    }),
  });
}

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