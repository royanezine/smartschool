import { apiFetch } from "../lib/api";

export interface Notifikasi {
  id: string;
  penggunaId: string;
  pengirimId?: string | null;
  judul: string;
  isi: string;
  tipe?: string | null;
  kategori?: string | null;
  targetUrl?: string | null;
  dibaca: boolean;
  dibacaPada?: string | null;
  dikirimEmail?: boolean;
  dibuatPada: string;
}

export interface NotifikasiResponse {
  unreadCount: number;
  list: Notifikasi[];
}

/**
 * ============================================================
 * GET NOTIFIKASI
 * GET /api/notifikasi
 * ============================================================
 */
export async function getNotifikasi(): Promise<NotifikasiResponse> {
  const result = await apiFetch("/api/notifikasi", {
    method: "GET",
  });

  return {
    unreadCount:
      result?.data?.unreadCount ?? 0,

    list:
      Array.isArray(result?.data?.list)
        ? result.data.list
        : [],
  };
}

/**
 * ============================================================
 * MARK NOTIFIKASI AS READ
 * PATCH /api/notifikasi/:id/read
 * ============================================================
 */
export async function markNotifikasiAsRead(
  id: string
) {
  if (!id) {
    throw new Error(
      "ID notifikasi wajib diisi."
    );
  }

  return apiFetch(
    `/api/notifikasi/${id}/read`,
    {
      method: "PATCH",
    }
  );
}

/**
 * ============================================================
 * MARK ALL NOTIFIKASI AS READ
 * PATCH /api/notifikasi/read-all
 * ============================================================
 */
export async function markAllNotifikasiAsRead() {
  return apiFetch(
    "/api/notifikasi/read-all",
    {
      method: "PATCH",
    }
  );
}