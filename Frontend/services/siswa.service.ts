
import { apiFetch } from "../lib/api";

export interface CreateSiswaData {
  namaPengguna: string;
  email: string;
  kataSandi: string;
  namaLengkap: string;

  nisn?: string | null;
  nis?: string | null;
  nipd?: string | null;
  kelasId?: string | null;
  tahunAjaranId?: string;
  jurusanId?: string | null;

  nik?: string | null;
  jenisKelamin?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  noTelepon?: string | null;

  alamat?: string | null;
  alamatKtp?: string | null;
  alamatDomisili?: string | null;
  alamatSesuaiDomisili?: boolean;
  provinsi?: string | null;
  kotaKabupaten?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  kodePos?: string | null;

  namaAyah?: string | null;
  nikAyah?: string | null;
  pekerjaanAyah?: string | null;
  noHpAyah?: string | null;
  namaIbu?: string | null;
  nikIbu?: string | null;
  pekerjaanIbu?: string | null;
  noHpIbu?: string | null;
  namaWaliPesertaDidik?: string | null;
  status?: "aktif" | "nonaktif";
}

export interface KelasSaya {
  kelasId: string;
  nama: string;
  tingkat: string;
  tahunAjaranId: string;
}

export interface SiswaQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateSiswaData {
  namaLengkap?: string;
  namaPengguna?: string;
  email?: string;

  nis?: string | null;
  nisn?: string | null;
  nipd?: string | null;
  kelasId?: string | null;
  tahunAjaranId?: string;
  jurusanId?: string | null;

  nik?: string | null;
  jenisKelamin?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  noTelepon?: string | null;

  alamat?: string | null;
  alamatKtp?: string | null;
  alamatDomisili?: string | null;
  alamatSesuaiDomisili?: boolean;
  provinsi?: string | null;
  kotaKabupaten?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  kodePos?: string | null;

  namaAyah?: string | null;
  nikAyah?: string | null;
  pekerjaanAyah?: string | null;
  noHpAyah?: string | null;
  namaIbu?: string | null;
  nikIbu?: string | null;
  pekerjaanIbu?: string | null;
  noHpIbu?: string | null;
  namaWaliPesertaDidik?: string | null;

  status?: "aktif" | "nonaktif";
}

export async function createSiswa(data: CreateSiswaData) {
  if (!data.namaPengguna?.trim()) {
    throw new Error("Username wajib diisi.");
  }

  if (!data.email?.trim()) {
    throw new Error("Email wajib diisi.");
  }

  if (!data.kataSandi) {
    throw new Error("Kata sandi wajib diisi.");
  }

  if (!data.namaLengkap?.trim()) {
    throw new Error("Nama lengkap wajib diisi.");
  }

  if (data.kataSandi.length < 8) {
    throw new Error("Kata sandi minimal 8 karakter.");
  }

  // Pertahankan field profil yang dikirim oleh page.
  // Jangan mengirim kelasId: null saat siswa belum dipilihkan kelas.
  const payload: CreateSiswaData = {
    ...data,
    namaPengguna: data.namaPengguna.trim(),
    email: data.email.trim(),
    namaLengkap: data.namaLengkap.trim(),
    ...(data.kelasId ? { kelasId: data.kelasId } : { kelasId: undefined }),
  };

  return apiFetch("/api/siswa", {
    method: "POST",
    body: JSON.stringify(payload),
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

export async function getSiswaById(id: string) {
  if (!id?.trim()) {
    throw new Error("ID siswa wajib diisi.");
  }

  return apiFetch(`/api/siswa/${encodeURIComponent(id.trim())}`, {
    method: "GET",
  });
}

export async function updateSiswa(
  id: string,
  data: UpdateSiswaData
) {
  if (!id?.trim()) {
    throw new Error("ID siswa wajib diisi.");
  }

  return apiFetch(`/api/siswa/${encodeURIComponent(id.trim())}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminResetPin(userId: string) {
  if (!userId) {
    throw new Error("ID pengguna wajib diisi.");
  }

  return apiFetch(
    `/api/auth/pin/admin-reset/${encodeURIComponent(userId)}`,
    {
      method: "POST",
    }
  );
}

export async function getSiswaMe(): Promise<any> {
  return apiFetch("/api/siswa/me", {
    method: "GET",
  });
}

export async function importSiswaExcel(file: File) {
  if (!file) {
    throw new Error("File Excel wajib dipilih.");
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Format file harus Excel .xlsx.");
  }

  if (file.size === 0) {
    throw new Error("File Excel yang dipilih kosong.");
  }

  const formData = new FormData();
  formData.append("file", file);

  return apiFetch("/api/siswa/bulk-import", {
    method: "POST",
    body: formData,
  });
}
