import { apiFetch } from "../lib/api";


export const getYayasanSummary = async () => {
  const result = await apiFetch("/api/yayasan/summary", {
    method: "GET",
    cache: "no-store",
  });

  console.log("GET YAYASAN SUMMARY RESPONSE:", result);

  return result;
};


export const getSekolahBinaan = async () => {
  const result = await apiFetch("/api/yayasan/sekolah", {
    method: "GET",
    cache: "no-store",
  });

  console.log("GET SEKOLAH BINAAN RESPONSE:", result);

  return result;
};


export const getDetailSekolahBinaan = async (id: string) => {
  if (!id) {
    throw new Error("ID sekolah tidak ditemukan.");
  }

  const result = await apiFetch(`/api/yayasan/sekolah/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  console.log("GET DETAIL SEKOLAH BINAAN RESPONSE:", result);

  return result;
};

export const getLaporanOverview = async () => {
  const result = await apiFetch("/api/yayasan/laporan/overview", {
    method: "GET",
    cache: "no-store",
  });
  return result;
};

export const getLaporanSiswa = async () => {
  const result = await apiFetch("/api/yayasan/laporan/siswa", {
    method: "GET",
    cache: "no-store",
  });
  return result;
};

export const getLaporanGuru = async (params?: { unitId?: string; search?: string; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.unitId) query.append("unitId", params.unitId);
  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "Semua") query.append("status", params.status);

  const qs = query.toString();
  const url = `/api/yayasan/laporan/guru${qs ? `?${qs}` : ""}`;
  const result = await apiFetch(url, {
    method: "GET",
    cache: "no-store",
  });
  return result;
};

export const getLaporanInventaris = async (params?: {
  unitId?: string;
  kategoriId?: string;
  kondisi?: string;
  search?: string;
}) => {
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
};

export const getLaporanAkademik = async () => {
  const result = await apiFetch("/api/yayasan/laporan/akademik", {
    method: "GET",
    cache: "no-store",
  });
  return result;
};

export const getMonitoringAkademik = async () => {
  const result = await apiFetch("/api/yayasan/monitoring/akademik", {
    method: "GET",
    cache: "no-store",
  });
  return result;
};

export const getMonitoringKehadiran = async () => {
  const result = await apiFetch("/api/yayasan/monitoring/kehadiran", {
    method: "GET",
    cache: "no-store",
  });
  return result;
};

export const getMonitoringLMS = async () => {
  const result = await apiFetch("/api/yayasan/monitoring/lms", {
    method: "GET",
    cache: "no-store",
  });
  return result;
};