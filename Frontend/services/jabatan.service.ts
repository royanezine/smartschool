import { apiFetch } from "../lib/api";

const JABATAN_BASE_URL = "/api/jabatan";

export interface ItemAksesMenu {
  menu: string;
  permissions: ("view" | "create" | "update" | "delete" | string)[];
}

export interface Jabatan {
  id: string;
  namaJabatan: string;
  deskripsi?: string | null;
  aksesMenu: ItemAksesMenu[];
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    pengguna: number;
  };
}

export interface MenuBakuResponse {
  menus: string[];
  actions: ("view" | "create" | "update" | "delete")[];
  jenjang?: string | null;
  menuDetails?: Array<{
    menu: string;
    allowedJenjang: string[];
  }>;
}

export interface CreateJabatanPayload {
  namaJabatan: string;
  deskripsi?: string | null;
  aksesMenu: ItemAksesMenu[];
}

export interface UpdateJabatanPayload {
  namaJabatan?: string;
  deskripsi?: string | null;
  aksesMenu?: ItemAksesMenu[];
}

/**
 * Mengambil daftar menu baku dan aksi dari backend (GET /api/jabatan/menu-baku)
 */
export async function getMenuBaku(params?: { sekolahId?: string; jenjang?: string }): Promise<MenuBakuResponse> {
  let query = "";
  if (params) {
    const q = new URLSearchParams();
    if (params.sekolahId) q.append("sekolahId", params.sekolahId);
    if (params.jenjang) q.append("jenjang", params.jenjang);
    const qs = q.toString();
    if (qs) query = `?${qs}`;
  }

  const response = await apiFetch(`${JABATAN_BASE_URL}/menu-baku${query}`, {
    cache: "no-store",
  });

  return response?.data || { menus: [], actions: [] };
}

/**
 * Mengambil seluruh data jabatan (GET /api/jabatan)
 */
export async function getAllJabatan(): Promise<Jabatan[]> {
  const response = await apiFetch(JABATAN_BASE_URL, {
    cache: "no-store",
  });

  return Array.isArray(response?.data) ? response.data : [];
}

/**
 * Mengambil detail satu jabatan berdasarkan ID (GET /api/jabatan/:id)
 */
export async function getJabatanById(id: string): Promise<Jabatan | null> {
  if (!id) {
    throw new Error("ID jabatan wajib diisi.");
  }

  const response = await apiFetch(`${JABATAN_BASE_URL}/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  return response?.data || null;
}

/**
 * Membuat jabatan baru (POST /api/jabatan)
 */
export async function createJabatan(payload: CreateJabatanPayload): Promise<Jabatan> {
  const response = await apiFetch(JABATAN_BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response?.data;
}

/**
 * Memperbarui data jabatan (PUT /api/jabatan/:id)
 */
export async function updateJabatan(id: string, payload: UpdateJabatanPayload): Promise<Jabatan> {
  if (!id) {
    throw new Error("ID jabatan wajib diisi.");
  }

  const response = await apiFetch(`${JABATAN_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response?.data;
}

/**
 * Menghapus jabatan (DELETE /api/jabatan/:id)
 */
export async function deleteJabatan(id: string): Promise<{ id: string; namaJabatan: string }> {
  if (!id) {
    throw new Error("ID jabatan wajib diisi.");
  }

  const response = await apiFetch(`${JABATAN_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return response?.data;
}
