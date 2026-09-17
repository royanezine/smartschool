export const generateNomorPeminjaman = () => {
  const now = new Date();

  const tanggal = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const waktu = Date.now().toString().slice(-6);

  return `PJM-${tanggal}-${waktu}`;
};