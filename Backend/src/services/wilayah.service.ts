import { z } from "zod";
import { AppError } from "../utils/appError";

const BASE_URL = "https://wilayah.id/api";
const rawRegion = z.object({ code: z.string(), name: z.string().min(1) });
const rawPayload = z.object({ data: z.array(rawRegion).min(1) });
type Region = { id: string; name: string };

const cache = new Map<string, { expires: number; data: Region[] }>();
const inFlight = new Map<string, Promise<Region[]>>();

async function fetchRegions(path: string): Promise<Region[]> {
  const saved = cache.get(path);
  if (saved && saved.expires > Date.now()) return saved.data;
  const pending = inFlight.get(path);
  if (pending) return pending;

  const request = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/${path}`, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/json" },
      });

      if (response.status === 404) {
        throw new AppError("Data wilayah tidak ditemukan", 404, "WILAYAH_NOT_FOUND");
      }
      if (!response.ok) {
        throw new Error(`Upstream HTTP ${response.status}`);
      }

      const json = await response.json();
      const parsed = rawPayload.parse(json);
      const data: Region[] = parsed.data.map((item) => ({
        id: item.code,
        name: item.name,
      }));

      cache.set(path, { data, expires: Date.now() + 24 * 60 * 60 * 1000 });
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;

      const timeout =
        error instanceof Error &&
        ["TimeoutError", "AbortError"].includes(error.name);

      console.error("[WILAYAH] Penyedia data gagal", {
        path,
        timeout,
        errorName: error instanceof Error ? error.name : "Unknown",
      });

      throw new AppError(
        "Layanan wilayah sedang tidak tersedia. Silakan coba lagi.",
        timeout ? 504 : 502,
        "WILAYAH_UNAVAILABLE",
      );
    } finally {
      inFlight.delete(path);
    }
  })();

  inFlight.set(path, request);
  return request;
}

export const daftarProvinsi = () => fetchRegions("provinces.json");

export async function daftarKota(provinsiId: string) {
  const provinces = await daftarProvinsi();
  if (!provinces.some((item) => item.id === provinsiId)) {
    throw new AppError("Provinsi tidak ditemukan", 404, "PROVINCE_NOT_FOUND");
  }
  return fetchRegions(`regencies/${provinsiId}.json`);
}