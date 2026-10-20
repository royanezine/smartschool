import { apiFetch } from "../lib/api";

const BASE_PATH = "/api/perpustakaan";

/* =========================================================
   TYPES
========================================================= */

export type BukuParams = {
  search?: string;
  tipe?: string;
  kategori?: string;
  status?: string;
};

export type PeminjamanParams = {
  status?: string;
  penggunaId?: string;
};

export type BukuPayload = {
  kodeBuku: string;
  judul: string;
  penulis?: string;
  penerbit?: string;
  tahunTerbit?: number;
  isbn?: string;
  tipe: "FISIK" | "EBOOK";
  kategori?: string;
  deskripsi?: string;
  coverUrl?: string;
  urlEbook?: string;
  jumlah?: number;
  status?: string;
};


export type PeminjamanPayload = {
  bukuId: string;
  tanggalJatuhTempo: string; // Format YYYY-MM-DD
  catatan?: string;
};



/* =========================================================
   HELPER
========================================================= */

function unwrap(response: any) {
  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
}

function unwrapList(response: any) {
  const data = unwrap(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  return [];
}

/* =========================================================
   BUKU
========================================================= */

export async function getBuku(params: BukuParams = {}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.tipe) query.set("tipe", params.tipe);
  if (params.kategori) query.set("kategori", params.kategori);
  if (params.status) query.set("status", params.status);

  const queryString = query.toString();

  const response = await apiFetch(
    `${BASE_PATH}/buku${queryString ? `?${queryString}` : ""}`,
  );

  return unwrapList(response);
}

export async function getBukuById(id: string) {
  const response = await apiFetch(
    `${BASE_PATH}/buku/${encodeURIComponent(id)}`,
  );

  return unwrap(response);
}


export async function createBuku(payload: BukuPayload) {
  const cleanPayload = { ...payload };

  if (!cleanPayload.coverUrl?.trim()) {
    delete cleanPayload.coverUrl;
  }

  if (!cleanPayload.urlEbook?.trim()) {
    delete cleanPayload.urlEbook;
  }

  const response = await apiFetch(`${BASE_PATH}/buku`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanPayload),
  });

  return unwrap(response);
}


export async function updateBuku(
  id: string,
  payload: Partial<BukuPayload>,
) {
  const response = await apiFetch(
    `${BASE_PATH}/buku/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return unwrap(response);
}

export async function deleteBuku(id: string) {
  return apiFetch(`${BASE_PATH}/buku/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/* =========================================================
   PEMINJAMAN
========================================================= */

export async function getPeminjaman(
  params: PeminjamanParams = {},
) {
  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.penggunaId) {
    query.set("penggunaId", params.penggunaId);
  }

  const queryString = query.toString();

  const response = await apiFetch(
    `${BASE_PATH}/peminjaman${queryString ? `?${queryString}` : ""}`,
  );

  return unwrapList(response);
}

export async function pinjamBuku(payload: PeminjamanPayload) {
  if (!payload.tanggalJatuhTempo) {
    throw new Error("Tanggal jatuh tempo wajib diisi.");
  }

  const response = await apiFetch(`${BASE_PATH}/peminjaman`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bukuId: payload.bukuId,
      tanggalJatuhTempo: payload.tanggalJatuhTempo,
      catatan: payload.catatan || "",
    }),
  });

  return unwrap(response);
}




export async function kembalikanBuku(id: string) {
  const response = await apiFetch(
    `${BASE_PATH}/peminjaman/${encodeURIComponent(id)}/kembali`,
    {
      method: "PUT",
    }
  );

  return unwrap(response);
}

