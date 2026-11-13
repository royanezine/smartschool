import { apiFetch } from "@/lib/api";

export type KonfigurasiKategori = "INTEGRASI" | "KEAMANAN" | "NOTIFIKASI";
export type TemplateKanal = "email" | "whatsapp" | "sms" | "push" | "in_app";

export type KonfigurasiListParams = {
  kategori?: KonfigurasiKategori | "";
  search?: string;
};

export type UpsertKonfigurasiPayload = {
  kategori?: KonfigurasiKategori;
  nilaiText?: string | null;
  nilaiBoolean?: boolean | null;
  nilaiAngka?: number | null;
  isRahasia?: boolean;
  keterangan?: string | null;
};

export type TemplateNotifikasiListParams = {
  kanal?: TemplateKanal | "";
  eventTarget?: string;
  isActive?: boolean | "";
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateTemplateNotifikasiPayload = {
  eventTarget: string;
  kanal: TemplateKanal;
  subjek?: string | null;
  isiTemplate: string;
  variabel?: Record<string, string> | null;
  isActive?: boolean;
};

export type UpdateTemplateNotifikasiPayload = {
  subjek?: string | null;
  isiTemplate?: string;
  variabel?: Record<string, string> | null;
  isActive?: boolean;
};

const KEY_REGEX = /^[a-z0-9_.]+$/i;

function buildQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, String(v));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export async function getKonfigurasiSistem(params: KonfigurasiListParams = {}) {
  const query = buildQuery({
    kategori: params.kategori || undefined,
    search: params.search?.trim() || undefined,
  });
  return apiFetch(`/super-admin/konfigurasi${query}`);
}

export async function getKonfigurasiSistemByKunci(kunci: string) {
  const cleanKey = String(kunci || "").trim();
  if (!KEY_REGEX.test(cleanKey)) {
    throw new Error("Format kunci konfigurasi tidak valid.");
  }
  return apiFetch(`/super-admin/konfigurasi/${encodeURIComponent(cleanKey)}`);
}

export async function upsertKonfigurasiSistem(
  kunci: string,
  payload: UpsertKonfigurasiPayload
) {
  const cleanKey = String(kunci || "").trim();
  if (!cleanKey || !KEY_REGEX.test(cleanKey)) {
    throw new Error(
      "Kunci konfigurasi wajib diisi (hanya huruf, angka, titik, dan garis bawah)."
    );
  }

  const body: Record<string, unknown> = {};
  if (payload.kategori !== undefined) body.kategori = payload.kategori;
  if (payload.isRahasia !== undefined) body.isRahasia = Boolean(payload.isRahasia);
  if (payload.keterangan !== undefined) body.keterangan = payload.keterangan;

  if (payload.nilaiText !== undefined) {
    if (
      payload.nilaiText !== null &&
      /^\*{3,}$/.test(String(payload.nilaiText).trim())
    ) {
      throw new Error(
        "Jangan kirim nilai masking '***'. Kosongkan field nilai baru untuk mempertahankan kredensial lama."
      );
    }
    body.nilaiText = payload.nilaiText;
    body.nilaiBoolean = null;
    body.nilaiAngka = null;
  } else if (payload.nilaiBoolean !== undefined) {
    body.nilaiText = null;
    body.nilaiBoolean = payload.nilaiBoolean;
    body.nilaiAngka = null;
  } else if (payload.nilaiAngka !== undefined) {
    body.nilaiText = null;
    body.nilaiBoolean = null;
    body.nilaiAngka = payload.nilaiAngka;
  }

  return apiFetch(`/super-admin/konfigurasi/${encodeURIComponent(cleanKey)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteKonfigurasiSistem(kunci: string) {
  const cleanKey = String(kunci || "").trim();
  if (!KEY_REGEX.test(cleanKey)) {
    throw new Error("Format kunci konfigurasi tidak valid.");
  }
  return apiFetch(`/super-admin/konfigurasi/${encodeURIComponent(cleanKey)}`, {
    method: "DELETE",
  });
}

export async function getTemplateNotifikasi(
  params: TemplateNotifikasiListParams = {}
) {
  const query = buildQuery({
    kanal: params.kanal || undefined,
    eventTarget: params.eventTarget?.trim() || undefined,
    isActive:
      typeof params.isActive === "boolean" ? String(params.isActive) : undefined,
    search: params.search?.trim() || undefined,
    page: params.page || 1,
    limit: params.limit || 20,
  });
  return apiFetch(`/super-admin/template-notifikasi${query}`);
}

export async function getTemplateNotifikasiById(id: string) {
  return apiFetch(`/super-admin/template-notifikasi/${encodeURIComponent(id)}`);
}

export async function createTemplateNotifikasi(
  payload: CreateTemplateNotifikasiPayload
) {
  const eventTarget = String(payload.eventTarget || "").trim();
  if (!eventTarget || !KEY_REGEX.test(eventTarget)) {
    throw new Error(
      "Event target wajib diisi (hanya huruf, angka, titik, dan garis bawah)."
    );
  }
  const body: Record<string, unknown> = {
    eventTarget,
    kanal: payload.kanal,
    isiTemplate: String(payload.isiTemplate || "").trim(),
  };
  if (payload.subjek !== undefined) body.subjek = payload.subjek;
  if (payload.variabel !== undefined) body.variabel = payload.variabel;
  if (payload.isActive !== undefined) body.isActive = Boolean(payload.isActive);

  return apiFetch("/super-admin/template-notifikasi", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateTemplateNotifikasi(
  id: string,
  payload: UpdateTemplateNotifikasiPayload
) {
  const body: Record<string, unknown> = {};
  if (payload.subjek !== undefined) body.subjek = payload.subjek;
  if (payload.isiTemplate !== undefined) {
    body.isiTemplate = String(payload.isiTemplate).trim();
  }
  if (payload.variabel !== undefined) body.variabel = payload.variabel;
  if (payload.isActive !== undefined) body.isActive = Boolean(payload.isActive);

  return apiFetch(`/super-admin/template-notifikasi/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteTemplateNotifikasi(id: string) {
  return apiFetch(`/super-admin/template-notifikasi/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function toggleTemplateNotifikasi(id: string) {
  return apiFetch(
    `/super-admin/template-notifikasi/${encodeURIComponent(id)}/toggle`,
    {
      method: "PATCH",
    }
  );
}
