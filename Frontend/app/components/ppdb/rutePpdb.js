
const PARAMETER_PENDAFTARAN = [
  "sekolahId",
  "jalurPpdbId",
];

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

export function urlFormulirPendaftaran(basePath = "") {
  const search =
    typeof window !== "undefined"
      ? window.location.search
      : "";

  return `${basePath}/PPDB/daftar${parameterPendaftaranDariUrl(search)}`;
}
