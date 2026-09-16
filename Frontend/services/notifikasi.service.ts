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

export async function getNotifikasi(): Promise<NotifikasiResponse> {
  const result = await apiFetch("/api/v1/notifikasi", {
    method: "GET",
  });

  return {
    unreadCount: result?.data?.unreadCount ?? 0,
    list: Array.isArray(result?.data?.list) ? result.data.list : [],
  };
}

export async function markNotifikasiAsRead(id: string) {
  return apiFetch(`/api/v1/notifikasi/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotifikasiAsRead() {
  return apiFetch("/api/v1/notifikasi/read-all", {
    method: "PATCH",
  });
}