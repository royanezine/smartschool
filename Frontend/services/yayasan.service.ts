import { apiFetch } from "../lib/api";

function isNotFoundError(err: any): boolean {
  return (
    err?.status === 404 ||
    err?.statusCode === 404 ||
    String(err?.message || "").includes("404") ||
    String(err?.message || "").toLowerCase().includes("not found")
  );
}

export const getYayasanSummary = async () => {
  try {
    const result = await apiFetch("/api/yayasan/summary", {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/yayasan/summary 404 Not Found. Returning empty summary safely.");
      return { success: true, data: null };
    }
    throw err;
  }
};

export const getYayasanDashboardAgregat = async () => {
  try {
    const result = await apiFetch("/api/dashboard", {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/dashboard 404 Not Found. Returning null safely.");
      return { success: true, data: null };
    }
    throw err;
  }
};

export const getSekolahBinaan = async (params?: Record<string, any>) => {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const searchTerm = params?.search || params?.q;
    if (searchTerm) query.append("search", String(searchTerm));
    if (params?.status) query.append("status", String(params.status));

    const qs = query.toString();
    const url = `/api/yayasan/sekolah${qs ? `?${qs}` : ""}`;
    const result = await apiFetch(url, {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/yayasan/sekolah 404 Not Found. Returning empty items safely.");
      return { success: true, data: { items: [], total: 0, page: 1, totalPages: 1 } };
    }
    throw err;
  }
};

export const getDetailSekolahBinaan = async (id: string) => {
  if (!id) {
    throw new Error("ID sekolah tidak ditemukan.");
  }
  try {
    const result = await apiFetch(`/api/yayasan/sekolah/${id}`, {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn(`[YayasanService] /api/yayasan/sekolah/${id} 404 Not Found. Returning null safely.`);
      return { success: true, data: null };
    }
    throw err;
  }
};

export const createSekolahBinaan = async (data: any) => {
  return await apiFetch("/api/yayasan/sekolah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const updateSekolahBinaan = async (id: string, data: any) => {
  if (!id) throw new Error("ID sekolah tidak ditemukan.");
  return await apiFetch(`/api/yayasan/sekolah/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteSekolahBinaan = async (id: string) => {
  if (!id) throw new Error("ID sekolah tidak ditemukan.");
  return await apiFetch(`/api/yayasan/sekolah/${id}`, {
    method: "DELETE",
  });
};

export const getPengaturanSekolahBinaan = async (id: string) => {
  if (!id) throw new Error("ID sekolah tidak ditemukan.");
  try {
    return await apiFetch(`/api/yayasan/monitoring/sekolah/${id}/pengaturan`, {
      method: "GET",
      cache: "no-store",
    });
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn(`[YayasanService] /api/yayasan/monitoring/sekolah/${id}/pengaturan 404. Returning null.`);
      return { success: true, data: null };
    }
    throw err;
  }
};

export const getMonitoringUsers = async (params?: {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  peran?: string;
  sekolahId?: string;
}) => {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const searchTerm = params?.search || params?.q;
    if (searchTerm) query.append("q", String(searchTerm));
    if (params?.peran) query.append("peran", String(params.peran));
    if (params?.sekolahId) query.append("sekolahId", String(params.sekolahId));

    const qs = query.toString();
    const url = `/api/yayasan/monitoring/users${qs ? `?${qs}` : ""}`;
    return await apiFetch(url, {
      method: "GET",
      cache: "no-store",
    });
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/yayasan/monitoring/users 404 Not Found. Returning empty users.");
      return { success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } };
    }
    throw err;
  }
};

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
