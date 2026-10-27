
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

export interface SiswaQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateSiswaData {
  namaLengkap?: string;
  email?: string;
  nis?: string;
  nisn?: string;
  status?: string;
  jenisKelamin?: string;
  noTelepon?: string;
}

export async function getSemuaSiswa(params: SiswaQuery = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  query.set("limit", String(params.limit ?? 1000));
  if (params.search) query.set("search", params.search);
  const qStr = query.toString();
  return apiFetch(`/api/siswa${qStr ? `?${qStr}` : ""}`, {
    method: "GET",
  });
}

export async function updateSiswa(id: string, data: UpdateSiswaData) {
  if (!id) throw new Error("ID siswa wajib diisi.");
  return apiFetch(`/api/siswa/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export async function adminResetPin(userId: string) {
  if (!userId) throw new Error("ID pengguna wajib diisi.");
  return apiFetch(`/api/auth/pin/admin-reset/${encodeURIComponent(userId)}`, {
    method: "POST",
  });
}

export async function getSiswaMe(): Promise<any> {
  return apiFetch("/api/siswa/me", { method: "GET" });
}
