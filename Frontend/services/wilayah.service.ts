import { apiFetch } from "../lib/api";

/**
 * Kontrak Backend (origin/main: Backend/src/controllers/wilayah.controller.ts):
 *   GET /api/wilayah/provinsi
 *     -> { success, data: [{ id: "31", name: "..." }] }
 *   GET /api/wilayah/kota?provinsi_id=31   (provinsi_id = 2 digit)
 *     -> { success, data: [{ id: "31.74", name: "...", provinsi_id: "31" }] }
 */
export interface Provinsi {
  id: string;
  name: string;
}

export interface KotaKabupaten {
  id: string;
  name: string;
  provinsi_id: string;
}

type WilayahResponse<T> = {
  success?: boolean;
  data?: T[];
};

function toList<T extends { id: unknown; name: unknown }>(
  response: WilayahResponse<T> | T[] | null | undefined
): T[] {
  const list = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
    ? response.data
    : [];
  return list.filter(
    (item) =>
      item &&
      typeof item.id === "string" &&
      item.id.length > 0 &&
      typeof item.name === "string" &&
      item.name.length > 0
  );
}

export async function getProvinsi(): Promise<Provinsi[]> {
  const response = await apiFetch("/api/wilayah/provinsi", { method: "GET" });
  return toList<Provinsi>(response);
}

export async function getKotaByProvinsi(
  provinsiId: string
): Promise<KotaKabupaten[]> {
  const response = await apiFetch(
    `/api/wilayah/kota?provinsi_id=${encodeURIComponent(provinsiId)}`,
    { method: "GET" }
  );
  return toList<KotaKabupaten>(response);
}
