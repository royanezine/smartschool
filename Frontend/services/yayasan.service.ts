import { apiFetch } from "../lib/api";

// ==========================================
// DASHBOARD & SUMMARY
// ==========================================

export const getYayasanSummary = async () =>
  apiFetch("/api/yayasan/summary", { method: "GET", cache: "no-store" });

export const getYayasanDashboardAgregat = async () =>
  apiFetch("/api/yayasan/summary", { method: "GET", cache: "no-store" });

export const getSekolahBinaan = async (params?: Record<string, any>) => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const searchTerm = params?.search || params?.q;
  if (searchTerm) query.append("search", String(searchTerm));
  if (params?.status) query.append("status", String(params.status));
  const qs = query.toString();
  return apiFetch(`/api/yayasan/sekolah${qs ? `?${qs}` : ""}`, { method: "GET", cache: "no-store" });
};

export const getDetailSekolahBinaan = async (id: string) => {
  if (!id) throw new Error("ID sekolah tidak ditemukan.");
  return apiFetch(`/api/yayasan/sekolah/${id}`, { method: "GET", cache: "no-store" });
};

export const createSekolahBinaan = async (data: any) => {
  return await apiFetch("/api/yayasan/sekolah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};



export const getPengaturanSekolahBinaan = async (id: string) => {
  if (!id) throw new Error("ID sekolah tidak ditemukan.");
  return apiFetch(`/api/yayasan/monitoring/sekolah/${id}/pengaturan`, { method: "GET", cache: "no-store" });
};

export const getMonitoringUsers = async (params?: {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  peran?: string;
  sekolahId?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  const searchTerm = params?.search || params?.q;
  if (searchTerm) query.append("q", String(searchTerm));
  if (params?.peran) query.append("peran", String(params.peran));
  if (params?.sekolahId) query.append("sekolahId", String(params.sekolahId));
  const qs = query.toString();
  return apiFetch(`/api/yayasan/monitoring/users${qs ? `?${qs}` : ""}`, { method: "GET", cache: "no-store" });
};

export const getLaporanOverview = async () => {
  const [summary, sekolah] = await Promise.all([getYayasanSummary(), getSekolahBinaan()]);
  return { success: true, data: { ...(summary?.data || summary), sekolah: sekolah?.data || sekolah } };
};

export const getLaporanSiswa = async () =>
  apiFetch("/api/yayasan/laporan/siswa", { method: "GET", cache: "no-store" });

export const getLaporanGuru = async (params?: { unitId?: string; search?: string; status?: string }) =>
  getMonitoringUsers({ peran: "guru", q: params?.search, sekolahId: params?.unitId });

export const getLaporanInventaris = async (params?: Record<string, string>) => {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => query.append(key, value));
  const qs = query.toString();
  return apiFetch(`/api/yayasan/laporan/inventaris${qs ? `?${qs}` : ""}`, { method: "GET", cache: "no-store" });
};

export const getLaporanAkademik = async () =>
  apiFetch("/api/yayasan/laporan/akademik", { method: "GET", cache: "no-store" });

export const getMonitoringAkademik = async () =>
  apiFetch("/api/yayasan/laporan/akademik", { method: "GET", cache: "no-store" });

export const getMonitoringKehadiran = async () =>
  apiFetch("/api/yayasan/monitoring/kehadiran", { method: "GET", cache: "no-store" });

export const getMonitoringLMS = async () =>
  apiFetch("/api/yayasan/monitoring/lms", { method: "GET", cache: "no-store" });

export const getMonitoringNilai = async () =>
  apiFetch("/api/yayasan/monitoring/nilai", { method: "GET", cache: "no-store" });

// ==========================================
// PROFIL YAYASAN
// ==========================================

export const getProfilYayasan = async () =>
  apiFetch("/api/yayasan/profil", { method: "GET", cache: "no-store" });

export const updateProfilYayasan = async (data: any) =>
  apiFetch("/api/yayasan/profil", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const getProfilLengkapYayasan = async () =>
  apiFetch("/api/yayasan/profil-lengkap", { method: "GET", cache: "no-store" });

export const updateProfilLengkapYayasan = async (data: any) =>
  apiFetch("/api/yayasan/profil-lengkap", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });


// ==========================================
// ENDPOINT BACKEND TERBARU (CRUD YAYASAN, SEKOLAH NAUNGAN & ADMIN YAYASAN)
// ==========================================

export interface ListYayasanParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  berlangganan?: boolean | string;
}

export const listYayasan = async (params?: ListYayasanParams) => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  if (params?.berlangganan !== undefined && params?.berlangganan !== null && params?.berlangganan !== "") {
    query.append("berlangganan", String(params.berlangganan));
  }

  const qs = query.toString();
  const url = `/api/yayasan${qs ? `?${qs}` : ""}`;
  return await apiFetch(url, {
    method: "GET",
    cache: "no-store",
  });
};

export const getYayasanById = async (yayasanId: string) => {
  if (!yayasanId) throw new Error("ID Yayasan wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}`, {
    method: "GET",
    cache: "no-store",
  });
};

export interface CreateYayasanPayload {
  nama: string;
  npyp: string;
  alamat?: string | null;
  telepon?: string | null;
  email?: string | null;
  status?: "aktif" | "nonaktif";
}

export const createYayasan = async (data: CreateYayasanPayload) => {
  return await apiFetch("/api/yayasan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export interface UpdateYayasanPayload {
  nama?: string;
  npyp?: string;
  alamat?: string | null;
  telepon?: string | null;
  email?: string | null;
  status?: "aktif" | "nonaktif";
}

export const updateYayasan = async (yayasanId: string, data: UpdateYayasanPayload) => {
  if (!yayasanId) throw new Error("ID Yayasan wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteYayasan = async (yayasanId: string) => {
  if (!yayasanId) throw new Error("ID Yayasan wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}`, {
    method: "DELETE",
  });
};

export const getDetailYayasanLangganan = async (yayasanId: string) => {
  if (!yayasanId) throw new Error("ID Yayasan wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}/langganan`, {
    method: "GET",
    cache: "no-store",
  });
};

export const getSekolahYayasan = async (yayasanId: string) => {
  if (!yayasanId) throw new Error("ID Yayasan wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}/sekolah`, {
    method: "GET",
    cache: "no-store",
  });
};

export const updateSekolahYayasan = async (yayasanId: string, sekolahId: string) => {
  if (!yayasanId || !sekolahId) throw new Error("ID Yayasan dan ID Sekolah wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}/sekolah/${sekolahId}`, {
    method: "PUT",
  });
};

export const deleteSekolahYayasan = async (yayasanId: string, sekolahId: string) => {
  if (!yayasanId || !sekolahId) throw new Error("ID Yayasan dan ID Sekolah wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}/sekolah/${sekolahId}`, {
    method: "DELETE",
  });
};

export const getAdminYayasan = async (yayasanId: string) => {
  if (!yayasanId) throw new Error("ID Yayasan wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}/admin`, {
    method: "GET",
    cache: "no-store",
  });
};

export interface CreateAdminYayasanPayload {
  namaPengguna: string;
  namaLengkap: string;
  email: string;
  kataSandi: string;
  status?: "aktif" | "nonaktif";
}

export const createAdminYayasan = async (yayasanId: string, data: CreateAdminYayasanPayload) => {
  if (!yayasanId) throw new Error("ID Yayasan wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export interface UpdateAdminYayasanPayload {
  namaPengguna?: string;
  namaLengkap?: string;
  email?: string;
  status?: "aktif" | "nonaktif";
}

export const updateAdminYayasan = async (
  yayasanId: string,
  adminId: string,
  data: UpdateAdminYayasanPayload
) => {
  if (!yayasanId || !adminId) throw new Error("ID Yayasan dan ID Admin wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}/admin/${adminId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteAdminYayasan = async (yayasanId: string, adminId: string) => {
  if (!yayasanId || !adminId) throw new Error("ID Yayasan dan ID Admin wajib disediakan.");
  return await apiFetch(`/api/yayasan/${yayasanId}/admin/${adminId}`, {
    method: "DELETE",
  });
};

export const getSekolahNaunganYayasan = getSekolahYayasan;
export const assignSekolahKeYayasan = updateSekolahYayasan;
export const removeSekolahDariYayasan = deleteSekolahYayasan;
export const getAllYayasan = listYayasan;
