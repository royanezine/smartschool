/**
 * Helper navigasi PPDB.
 *
 * Tujuan utama: parameter sekolahId dan jalurPpdbId yang sudah ada pada URL
 * tidak hilang ketika pengguna berpindah halaman (mis. dari panduan jalur ke
 * formulir pendaftaran). Tanpa parameter tersebut, formulir tidak dapat
 * mengetahui sekolah/jalur tujuan.
 */

const PARAMETER_PENDAFTARAN = [
  "sekolahId",
  "jalurPpdbId",
];

/**
 * Mengambil hanya parameter pendaftaran dari query string.
 *
 * @param {string} search query string, mis. "?sekolahId=...&jalurPpdbId=..."
 * @returns {string} query string terfilter (diawali "?") atau string kosong
 */
export function parameterPendaftaranDariUrl(search) {
  if (typeof search !== "string" || !search) {
    return "";
  }

  const sumber = new URLSearchParams(search);
  const params = new URLSearchParams();

  const sekolahId = String(
    sumber.get("sekolahId") || sumber.get("sekolah_id") || ""
  ).trim();

  const jalurPpdbId = String(
    sumber.get("jalurPpdbId") || sumber.get("jalurId") || ""
  ).trim();

  if (sekolahId) {
    params.set("sekolahId", sekolahId);
  }

  if (jalurPpdbId) {
    params.set("jalurPpdbId", jalurPpdbId);
  }

  const hasil = params.toString();

  return hasil ? `?${hasil}` : "";
}

/**
 * URL formulir pendaftaran dengan mempertahankan parameter yang sedang
 * aktif di address bar.
 *
 * @param {string} basePath prefix tenant, mis. "/sekolah-a"
 */
export function urlFormulirPendaftaran(basePath = "") {
  const search =
    typeof window !== "undefined"
      ? window.location.search
      : "";

  return `${basePath}/PPDB/daftar${parameterPendaftaranDariUrl(search)}`;
}
