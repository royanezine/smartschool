import { apiFetch } from "../lib/api";

// ============================================================
// TYPES
// ============================================================

export interface PaketFitur {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string | null;
  ikon?: string | null;
}

export interface Modul {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string | null;
  ikon?: string | null;
  sistem?: boolean | null;
}

export interface Paket {
  id: string;
  nama: string;
  deskripsi?: string | null;
  harga: number;
  durasi: number;
  status?: string | null;
  fitur: PaketFitur[];
}

export interface PaketResponse {
  success: boolean;
  message?: string;
  data: Paket[];
}

export interface PaketByIdResponse {
  success: boolean;
  message?: string;
  data: Paket;
}

export interface ModulResponse {
  success: boolean;
  message?: string;
  data: Modul[];
}

export interface CreatePaketPayload {
  nama: string;
  deskripsi?: string;
  harga: number;
  durasi: number;
  modulIds: string[];
}

export interface UpdatePaketPayload {
  nama: string;
  deskripsi?: string;
  harga: number;
  durasi: number;
  modulIds?: string[];
  status?: string;
}

// ============================================================
// HELPER
// ============================================================

function normalizeArray<T = any>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
}

function normalizeObject<T = any>(response: any): T | null {
  if (!response) {
    return null;
  }

  if (
    response?.data &&
    !Array.isArray(response.data)
  ) {
    if (
      response.data?.data &&
      !Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    return response.data;
  }

  return response;
}

// ============================================================
// GET SEMUA PAKET
// GET /api/v1/paket
// ============================================================

export async function getPaket(): Promise<PaketResponse> {
  const response = await apiFetch("/api/v1/paket", {
    method: "GET",
    cache: "no-store",
  });

  const rawData = normalizeArray(response);

  const data = rawData.map((item) =>
    normalizePaket(item)
  );

  return {
    success: response?.success !== false,
    message: response?.message || "",
    data,
  };
}

// ============================================================
// GET PAKET BY ID
// GET /api/v1/paket/:id
// ============================================================

export async function getPaketById(
  id: string
): Promise<PaketByIdResponse> {
  if (!id) {
    throw new Error("ID paket tidak ditemukan.");
  }

  const response = await apiFetch(
    `/api/v1/paket/${id}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const rawData = normalizeObject(response);

  if (!rawData) {
    throw new Error("Data paket tidak ditemukan.");
  }

  return {
    success: response?.success !== false,
    message: response?.message || "",
    data: normalizePaket(rawData),
  };
}

// ============================================================
// GET SEMUA MODUL / FITUR
// GET /api/v1/paket/fitur/list
// ============================================================

export async function getFitur(): Promise<ModulResponse> {
  const response = await apiFetch(
    "/api/v1/paket/fitur/list",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const rawData = normalizeArray(response);

  const data = rawData.map((item) =>
    normalizeModul(item)
  );

  return {
    success: response?.success !== false,
    message: response?.message || "",
    data,
  };
}

// ============================================================
// CREATE PAKET
// POST /api/v1/paket
// ============================================================

export async function createPaket(
  data: CreatePaketPayload
) {
  if (!data.nama?.trim()) {
    throw new Error("Nama paket wajib diisi.");
  }

  const harga = Number(data.harga);
  const durasi = Number(data.durasi);

  if (!Number.isFinite(harga)) {
    throw new Error("Harga paket tidak valid.");
  }

  if (!Number.isInteger(durasi) || durasi <= 0) {
    throw new Error(
      "Durasi paket harus berupa angka lebih dari 0."
    );
  }

  const modulIds = Array.isArray(data.modulIds)
    ? [
        ...new Set(
          data.modulIds.filter(
            (id): id is string =>
              typeof id === "string" &&
              id.trim().length > 0
          )
        ),
      ]
    : [];

  const response = await apiFetch(
    "/api/v1/paket",
    {
      method: "POST",
      body: JSON.stringify({
        nama: data.nama.trim(),
        deskripsi: data.deskripsi?.trim() || "",
        harga,
        durasi,
        modulIds,
      }),
    }
  );

  return response;
}

// ============================================================
// UPDATE PAKET
// PUT /api/v1/paket/:id
// ============================================================

export async function updatePaket(
  id: string,
  data: UpdatePaketPayload
) {
  if (!id) {
    throw new Error("ID paket tidak ditemukan.");
  }

  if (!data.nama?.trim()) {
    throw new Error("Nama paket wajib diisi.");
  }

  const harga = Number(data.harga);
  const durasi = Number(data.durasi);

  if (!Number.isFinite(harga)) {
    throw new Error("Harga paket tidak valid.");
  }

  if (!Number.isInteger(durasi) || durasi <= 0) {
    throw new Error(
      "Durasi paket harus berupa angka lebih dari 0."
    );
  }

  const body: Record<string, any> = {
    nama: data.nama.trim(),
    deskripsi: data.deskripsi?.trim() || "",
    harga,
    durasi,
  };

  if (Array.isArray(data.modulIds)) {
    body.modulIds = [
      ...new Set(
        data.modulIds.filter(
          (id): id is string =>
            typeof id === "string" &&
            id.trim().length > 0
        )
      ),
    ];
  }

  if (data.status !== undefined) {
    body.status = data.status;
  }

  const response = await apiFetch(
    `/api/v1/paket/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );

  return response;
}

// ============================================================
// DELETE PAKET
// DELETE /api/v1/paket/:id
// ============================================================

export async function deletePaket(id: string) {
  if (!id) {
    throw new Error("ID paket tidak ditemukan.");
  }

  const response = await apiFetch(
    `/api/v1/paket/${id}`,
    {
      method: "DELETE",
    }
  );

  return response;
}

// ============================================================
// NORMALIZE PAKET
// ============================================================

function normalizePaket(
  paket: any
): Paket {
  /**
   * Backend mengirim:
   *
   * {
   *   id,
   *   nama,
   *   deskripsi,
   *   harga,
   *   durasi,
   *   fitur: [
   *     {
   *       id,
   *       kode,
   *       nama,
   *       deskripsi,
   *       ikon
   *     }
   *   ]
   * }
   */

  const rawFitur =
    Array.isArray(paket?.fitur)
      ? paket.fitur
      : Array.isArray(paket?.features)
      ? paket.features
      : Array.isArray(paket?.modul)
      ? paket.modul
      : Array.isArray(paket?.paketModul)
      ? paket.paketModul
      : [];

  const fitur: PaketFitur[] = rawFitur
    .filter(Boolean)
    .map((item: any) => {
      // Kalau backend mengirim:
      // paketModul -> modul
      const modul =
        item?.modul ?? item;

      return {
        id: String(
          modul?.id ??
            item?.modulId ??
            item?.modul_id ??
            modul?.kode ??
            ""
        ),

        kode: String(
          modul?.kode ?? ""
        ),

        nama:
          modul?.nama ??
          "Fitur",

        deskripsi:
          modul?.deskripsi ??
          null,

        ikon:
          modul?.ikon ??
          null,
      };
    })
    .filter(
      (item: PaketFitur) =>
        item.id &&
        item.nama
    );

  return {
    id: String(
      paket?.id ?? ""
    ),

    nama:
      paket?.nama ??
      "Tanpa Nama",

    deskripsi:
      paket?.deskripsi ??
      null,

    harga: Number(
      paket?.harga ?? 0
    ),

    durasi: Number(
      paket?.durasi ?? 1
    ),

    status:
      paket?.status ??
      "aktif",

    fitur,
  };
}

// ============================================================
// NORMALIZE MODUL
// ============================================================

function normalizeModul(
  modul: any
): Modul {
  return {
    id: String(
      modul?.id ?? ""
    ),

    kode: String(
      modul?.kode ?? ""
    ),

    nama:
      modul?.nama ??
      "Modul",

    deskripsi:
      modul?.deskripsi ??
      null,

    ikon:
      modul?.ikon ??
      null,

    sistem:
      modul?.sistem ??
      null,
  };
}