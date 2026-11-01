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

export const getSekolahBinaan = async (params?: Record<string, any>) => {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.q) query.append("q", String(params.q));
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
  peran?: string;
  sekolahId?: string;
}) => {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.q) query.append("q", String(params.q));
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

export const getLaporanOverview = async () => {
  try {
    const [summaryRes, sekolahRes] = await Promise.all([
      getYayasanSummary(),
      getSekolahBinaan(),
    ]);

    const summary = summaryRes?.data || summaryRes || {};
    const sekolahList = Array.isArray(sekolahRes?.data?.items)
      ? sekolahRes.data.items
      : Array.isArray(sekolahRes?.data)
      ? sekolahRes.data
      : [];

    let totalSiswa = 0;
    let totalGuru = 0;
    for (const s of sekolahList) {
      if (s?.statistik) {
        totalSiswa += Number(s.statistik.totalSiswa || 0);
        totalGuru += Number(s.statistik.totalGuru || 0);
      }
    }

    return {
      success: true,
      data: {
        totalSekolah: Number(summary.totalSekolah || sekolahList.length || 0),
        sekolahAktif: Number(summary.sekolahAktif || 0),
        totalPenggunaAktif: Number(summary.totalPenggunaAktif || 0),
        totalSiswa,
        totalGuru,
        totalAset: 0,
      },
    };
  } catch (error) {
    try {
      return await apiFetch("/api/yayasan/laporan/overview", {
        method: "GET",
        cache: "no-store",
      });
    } catch (err: any) {
      if (isNotFoundError(err)) {
        return {
          success: true,
          data: {
            totalSekolah: 0,
            sekolahAktif: 0,
            totalPenggunaAktif: 0,
            totalSiswa: 0,
            totalGuru: 0,
            totalAset: 0,
          },
        };
      }
      throw err;
    }
  }
};

export const getLaporanSiswa = async () => {
  return await getSekolahBinaan();
};

export const getLaporanGuru = async (params?: { unitId?: string; search?: string; status?: string }) => {
  return await getMonitoringUsers({
    peran: "guru",
    q: params?.search,
    sekolahId: params?.unitId,
  });
};

export const getLaporanInventaris = async (params?: {
  unitId?: string;
  kategoriId?: string;
  kondisi?: string;
  search?: string;
}) => {
  try {
    const query = new URLSearchParams();
    if (params?.unitId) query.append("unitId", params.unitId);
    if (params?.kategoriId) query.append("kategoriId", params.kategoriId);
    if (params?.kondisi && params.kondisi !== "Semua Kondisi") query.append("kondisi", params.kondisi);
    if (params?.search) query.append("search", params.search);

    const qs = query.toString();
    const url = `/api/yayasan/laporan/inventaris${qs ? `?${qs}` : ""}`;
    const result = await apiFetch(url, {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/yayasan/laporan/inventaris 404. Returning empty list safely.");
      return { success: true, backendGap: true, data: { items: [], total: 0 } };
    }
    throw err;
  }
};

export const getLaporanAkademik = async () => {
  try {
    const result = await apiFetch("/api/yayasan/laporan/akademik", {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/yayasan/laporan/akademik 404. Returning empty list safely.");
      return { success: true, backendGap: true, data: { items: [], total: 0 } };
    }
    throw err;
  }
};

export const getMonitoringAkademik = async () => {
  try {
    const result = await apiFetch("/api/yayasan/monitoring/akademik", {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/yayasan/monitoring/akademik 404. Returning empty list safely.");
      return { success: true, backendGap: true, data: { items: [], mapelOverview: [] } };
    }
    throw err;
  }
};

export const getMonitoringKehadiran = async () => {
  try {
    const result = await apiFetch("/api/yayasan/monitoring/kehadiran", {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/yayasan/monitoring/kehadiran 404. Returning empty list safely.");
      return { success: true, backendGap: true, data: { items: [] } };
    }
    throw err;
  }
};

export const getMonitoringLMS = async () => {
  try {
    const result = await apiFetch("/api/yayasan/monitoring/lms", {
      method: "GET",
      cache: "no-store",
    });
    return result;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      console.warn("[YayasanService] /api/yayasan/monitoring/lms 404. Returning empty list safely.");
      return { success: true, backendGap: true, data: { items: [] } };
    }
    throw err;
  }
};
