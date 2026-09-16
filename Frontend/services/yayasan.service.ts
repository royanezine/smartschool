import { apiFetch } from "../lib/api";

// ============================================================
// GET SUMMARY YAYASAN
// GET /api/v1/yayasan/summary
// ============================================================
export const getYayasanSummary = async () => {
  const result = await apiFetch("/api/v1/yayasan/summary", {
    method: "GET",
    cache: "no-store",
  });

  console.log("GET YAYASAN SUMMARY RESPONSE:", result);

  return result;
};

// ============================================================
// GET SEKOLAH BINAAN
// GET /api/v1/yayasan/sekolah
// ============================================================
export const getSekolahBinaan = async () => {
  const result = await apiFetch("/api/v1/yayasan/sekolah", {
    method: "GET",
    cache: "no-store",
  });

  console.log("GET SEKOLAH BINAAN RESPONSE:", result);

  return result;
};

// ============================================================
// GET DETAIL SEKOLAH BINAAN
// GET /api/v1/yayasan/sekolah/:id
// ============================================================
export const getDetailSekolahBinaan = async (id: string) => {
  if (!id) {
    throw new Error("ID sekolah tidak ditemukan.");
  }

  const result = await apiFetch(`/api/v1/yayasan/sekolah/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  console.log("GET DETAIL SEKOLAH BINAAN RESPONSE:", result);

  return result;
};