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
  if (!id) {
    throw new Error("ID gudang tidak ditemukan.");
  }

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
  if (!id) {
    throw new Error("ID gudang tidak ditemukan.");
  }

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
  if (!id) {
    throw new Error("ID kategori aset tidak ditemukan.");
  }

  return apiFetch(`${API_ENDPOINT}/kategori/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      nama: data.nama,
      status: data.status ?? "aktif",
    }),
  });
}

export async function deleteKategoriAset(id) {
  if (!id) {
    throw new Error("ID kategori aset tidak ditemukan.");
  }

  return apiFetch(`${API_ENDPOINT}/kategori/${id}`, {
    method: "DELETE",
  });
}

// =====================================================
// ASET
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
      kode: data.kode,
      nama: data.nama,

      kondisi: data.kondisi ?? "baik",

      jumlah: Number(data.jumlah),
      jumlahStok: Number(data.jumlahStok),
      stokMinimum: Number(data.stokMinimum),

      lokasi: data.lokasi ?? null,

      kategoriAsetId: data.kategoriAsetId,
      gudangId: data.gudangId,

      status: data.status ?? "aktif",

      tanggalPembelian:
        data.tanggalPembelian || null,

      perawatanTerakhir:
        data.perawatanTerakhir || null,

      tanggalRusak:
        data.tanggalRusak || null,

      deskripsiKerusakan:
        data.deskripsiKerusakan ?? null,

      statusPerbaikan:
        data.statusPerbaikan ?? null,

      catatan:
        data.catatan ?? null,
    }),
  });
}

export async function updateAset(id, data) {
  if (!id) {
    throw new Error("ID aset tidak ditemukan.");
  }

  return apiFetch(`${API_ENDPOINT}/aset/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      kode: data.kode,
      nama: data.nama,

      kondisi: data.kondisi ?? "baik",

      jumlah: Number(data.jumlah),
      jumlahStok: Number(data.jumlahStok),
      stokMinimum: Number(data.stokMinimum),

      lokasi: data.lokasi ?? null,

      kategoriAsetId: data.kategoriAsetId,
      gudangId: data.gudangId,

      status: data.status ?? "aktif",

      tanggalPembelian:
        data.tanggalPembelian || null,

      perawatanTerakhir:
        data.perawatanTerakhir || null,

      tanggalRusak:
        data.tanggalRusak || null,

      deskripsiKerusakan:
        data.deskripsiKerusakan ?? null,

      statusPerbaikan:
        data.statusPerbaikan ?? null,

      catatan:
        data.catatan ?? null,
    }),
  });
}

export async function deleteAset(id) {
  if (!id) {
    throw new Error("ID aset tidak ditemukan.");
  }

  return apiFetch(`${API_ENDPOINT}/aset/${id}`, {
    method: "DELETE",
  });
}

// =====================================================
// PEMINJAMAN - GURU
// POST /api/v1/sarpras/peminjaman
// =====================================================

export async function ajukanPeminjaman(data) {
  if (!data?.asetId) {
    throw new Error("Aset yang dipinjam belum dipilih.");
  }

  if (!data?.keperluan?.trim()) {
    throw new Error("Keperluan peminjaman wajib diisi.");
  }

  if (!data?.tanggalKembaliRencana) {
    throw new Error(
      "Tanggal rencana pengembalian wajib diisi."
    );
  }

  const jumlah = Number(data.jumlah);

  if (!Number.isFinite(jumlah) || jumlah <= 0) {
    throw new Error(
      "Jumlah aset yang dipinjam harus lebih dari 0."
    );
  }

  return apiFetch(`${API_ENDPOINT}/peminjaman`, {
    method: "POST",

    body: JSON.stringify({
      keperluan:
        data.keperluan.trim(),

      tanggalKembaliRencana:
        data.tanggalKembaliRencana,

      catatanPeminjaman:
        data.catatanPeminjaman?.trim() ||
        null,

      items: [
        {
          asetId: data.asetId,
          jumlah,
        },
      ],
    }),
  });
}

// =====================================================
// PEMINJAMAN
// GET DAFTAR
//
// Dipakai Guru maupun Admin.
// BE menentukan data berdasarkan user/izin.
// =====================================================

export async function getDaftarPeminjaman({
  page = 1,
  limit = 10,
  status = "",
  search = "",
} = {}) {
  const params = new URLSearchParams();

  params.set(
    "page",
    String(page)
  );

  params.set(
    "limit",
    String(limit)
  );

  if (status) {
    params.set(
      "status",
      status
    );
  }

  if (search?.trim()) {
    params.set(
      "search",
      search.trim()
    );
  }

  return apiFetch(
    `${API_ENDPOINT}/peminjaman?${params.toString()}`,
    {
      method: "GET",
    }
  );
}

// =====================================================
// PEMINJAMAN
// GET DETAIL
// =====================================================

export async function getDetailPeminjaman(id) {
  if (!id) {
    throw new Error(
      "ID peminjaman tidak ditemukan."
    );
  }

  return apiFetch(
    `${API_ENDPOINT}/peminjaman/${id}`,
    {
      method: "GET",
    }
  );
}

// =====================================================
// VERIFIKASI / PERSETUJUAN
//
// BE:
// PATCH /api/v1/sarpras/peminjaman/:id/persetujuan
//
// Body:
// {
//   status: "disetujui"
// }
//
// atau:
//
// {
//   status: "ditolak",
//   catatanPenolakan: "..."
// }
// =====================================================

export async function verifikasiPeminjaman(
  id,
  data
) {
  if (!id) {
    throw new Error(
      "ID peminjaman tidak ditemukan."
    );
  }

  if (!data?.status) {
    throw new Error(
      "Status persetujuan wajib diisi."
    );
  }

  return apiFetch(
    `${API_ENDPOINT}/peminjaman/${id}/persetujuan`,
    {
      method: "PATCH",

      body: JSON.stringify({
        status: data.status,

        catatanPenolakan:
          data.status === "ditolak"
            ? data.catatanPenolakan?.trim() ||
              null
            : null,
      }),
    }
  );
}

// =====================================================
// SERAHKAN ASET KE SISWA
//
// BE:
// PATCH /api/v1/sarpras/peminjaman/:id/ambil
//
// Body:
// {
//   siswaPengambilId,
//   namaSiswaPengambil,
//   kondisiSaatPinjam
// }
//
// BE akan:
// - validasi siswa
// - mengurangi stok
// - mengubah status menjadi "dipinjam"
// - menyimpan tanggalPinjam
// =====================================================

export async function serahkanPeminjaman(
  id,
  data
) {
  if (!id) {
    throw new Error(
      "ID peminjaman tidak ditemukan."
    );
  }

  return apiFetch(
    `${API_ENDPOINT}/peminjaman/${id}/ambil`,
    {
      method: "PATCH",

      body: JSON.stringify({
        siswaPengambilId:
          data?.siswaPengambilId || null,

        namaSiswaPengambil:
          data?.namaSiswaPengambil?.trim() ||
          null,

        kondisiSaatPinjam:
          data?.kondisiSaatPinjam ||
          "baik",
      }),
    }
  );
}

// =====================================================
// KEMBALIKAN ASET
//
// BE:
// PATCH /api/v1/sarpras/peminjaman/:id/kembali
//
// Body:
// {
//   siswaPengembaliId,
//   namaSiswaPengembali,
//   items: [
//     {
//       asetId,
//       kondisiSaatKembali,
//       catatanKembali
//     }
//   ]
// }
// =====================================================

export async function kembalikanPeminjaman(
  id,
  data
) {
  if (!id) {
    throw new Error(
      "ID peminjaman tidak ditemukan."
    );
  }

  const items =
    Array.isArray(data?.items)
      ? data.items.map((item) => ({
          asetId: item.asetId,

          kondisiSaatKembali:
            item.kondisiSaatKembali ||
            "baik",

          catatanKembali:
            item.catatanKembali?.trim() ||
            null,
        }))
      : [];

  return apiFetch(
    `${API_ENDPOINT}/peminjaman/${id}/kembali`,
    {
      method: "PATCH",

      body: JSON.stringify({
        siswaPengembaliId:
          data?.siswaPengembaliId ||
          null,

        namaSiswaPengembali:
          data?.namaSiswaPengembali?.trim() ||
          null,

        items,
      }),
    }
  );
}