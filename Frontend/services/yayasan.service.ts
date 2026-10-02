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