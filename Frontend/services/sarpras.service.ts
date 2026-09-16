import { apiFetch } from "../lib/api";

const API_ENDPOINT = "/api/v1/sarpras";

// =====================================================
// GUDANG
// =====================================================

export async function getGudang() {
  return apiFetch(`${API_ENDPOINT}/gudang`, {
    method: "GET",
  });
}

export async function createGudang(data) {
  return apiFetch(`${API_ENDPOINT}/gudang`, {
    method: "POST",
    body: JSON.stringify({
      nama: data.nama,
      lokasi: data.lokasi ?? null,
      status: data.status ?? "aktif",
    }),
  });
}

export async function updateGudang(id, data) {
  return apiFetch(`${API_ENDPOINT}/gudang/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      nama: data.nama,
      lokasi: data.lokasi ?? null,
      status: data.status ?? "aktif",
    }),
  });
}

export async function deleteGudang(id) {
  return apiFetch(`${API_ENDPOINT}/gudang/${id}`, {
    method: "DELETE",
  });
}

// =====================================================
// KATEGORI ASET
// =====================================================

export async function getKategoriAset() {
  return apiFetch(`${API_ENDPOINT}/kategori`, {
    method: "GET",
  });
}

export async function createKategoriAset(data) {
  return apiFetch(`${API_ENDPOINT}/kategori`, {
    method: "POST",
    body: JSON.stringify({
      nama: data.nama,
      status: data.status ?? "aktif",
    }),
  });
}

export async function updateKategoriAset(id, data) {
  return apiFetch(`${API_ENDPOINT}/kategori/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      nama: data.nama,
      status: data.status ?? "aktif",
    }),
  });
}

export async function deleteKategoriAset(id) {
  return apiFetch(`${API_ENDPOINT}/kategori/${id}`, {
    method: "DELETE",
  });
}

// =====================================================
// ASET / BARANG
// =====================================================

export async function getAset() {
  return apiFetch(`${API_ENDPOINT}/aset`, {
    method: "GET",
  });
}

export async function createAset(data) {
  return apiFetch(`${API_ENDPOINT}/aset`, {
    method: "POST",
    body: JSON.stringify({
      // =========================
      // IDENTITAS ASET
      // =========================
      kode: data.kode,
      nama: data.nama,

      // =========================
      // KONDISI & STOK
      // =========================
      kondisi: data.kondisi ?? "baik",

      jumlah: Number(data.jumlah),
      jumlahStok: Number(data.jumlahStok),
      stokMinimum: Number(data.stokMinimum),

      // =========================
      // LOKASI & RELASI
      // =========================
      lokasi: data.lokasi ?? null,
      kategoriAsetId: data.kategoriAsetId,
      gudangId: data.gudangId,

      // =========================
      // STATUS
      // =========================
      status: data.status ?? "aktif",

      // =========================
      // INFORMASI TANGGAL ASET
      // =========================
      tanggalPembelian: data.tanggalPembelian
        ? data.tanggalPembelian
        : null,

      perawatanTerakhir: data.perawatanTerakhir
        ? data.perawatanTerakhir
        : null,

      tanggalRusak: data.tanggalRusak
        ? data.tanggalRusak
        : null,

      // =========================
      // INFORMASI KERUSAKAN
      // =========================
      deskripsiKerusakan: data.deskripsiKerusakan ?? null,

      statusPerbaikan: data.statusPerbaikan ?? null,

      // =========================
      // CATATAN
      // =========================
      catatan: data.catatan ?? null,

      /*
       * Field berikut TIDAK dikirim dari frontend:
       *
       * dibuatOleh
       * diperbaruiOleh
       * dihapusOleh
       * dibuatPada
       * diperbaruiPada
       * dihapusPada
       *
       * Field tersebut sebaiknya dikelola oleh backend.
       */
    }),
  });
}

export async function updateAset(id, data) {
  return apiFetch(`${API_ENDPOINT}/aset/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      // =========================
      // IDENTITAS ASET
      // =========================
      kode: data.kode,
      nama: data.nama,

      // =========================
      // KONDISI & STOK
      // =========================
      kondisi: data.kondisi ?? "baik",

      jumlah: Number(data.jumlah),
      jumlahStok: Number(data.jumlahStok),
      stokMinimum: Number(data.stokMinimum),

      // =========================
      // LOKASI & RELASI
      // =========================
      lokasi: data.lokasi ?? null,
      kategoriAsetId: data.kategoriAsetId,
      gudangId: data.gudangId,

      // =========================
      // STATUS
      // =========================
      status: data.status ?? "aktif",

      // =========================
      // INFORMASI TANGGAL ASET
      // =========================
      tanggalPembelian: data.tanggalPembelian
        ? data.tanggalPembelian
        : null,

      perawatanTerakhir: data.perawatanTerakhir
        ? data.perawatanTerakhir
        : null,

      tanggalRusak: data.tanggalRusak
        ? data.tanggalRusak
        : null,

      // =========================
      // INFORMASI KERUSAKAN
      // =========================
      deskripsiKerusakan: data.deskripsiKerusakan ?? null,

      statusPerbaikan: data.statusPerbaikan ?? null,

      // =========================
      // CATATAN
      // =========================
      catatan: data.catatan ?? null,

      /*
       * Field audit jangan dikirim manual dari frontend:
       *
       * dibuatOleh
       * diperbaruiOleh
       * dihapusOleh
       * dibuatPada
       * diperbaruiPada
       * dihapusPada
       *
       * Backend yang menangani field tersebut.
       */
    }),
  });
}

export async function deleteAset(id) {
  return apiFetch(`${API_ENDPOINT}/aset/${id}`, {
    method: "DELETE",
  });
}