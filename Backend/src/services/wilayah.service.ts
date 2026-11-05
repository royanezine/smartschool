import { z } from "zod";
import { AppError } from "../utils/appError";

const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/v2";
const region = z.object({ id: z.string(), name: z.string().min(1) });
const payload = z.object({ data: z.array(region).min(1) });
type Region = z.infer<typeof region>;
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
        signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" },
      });
      if (response.status === 404) throw new AppError("Provinsi tidak ditemukan", 404, "PROVINCE_NOT_FOUND");
      if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
      const { data } = payload.parse(await response.json());
      cache.set(path, { data, expires: Date.now() + 24 * 60 * 60 * 1000 });
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const timeout = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
      console.error("[WILAYAH] Penyedia data gagal", { path, timeout, errorName: error instanceof Error ? error.name : "Unknown" });
      throw new AppError("Layanan wilayah sedang tidak tersedia. Silakan coba lagi.", timeout ? 504 : 502, "WILAYAH_UNAVAILABLE");
    } finally {
      inFlight.delete(path);
    }
  })();
  inFlight.set(path, request);
  return request;
}

export const daftarProvinsi = () => fetchRegions("provinces.json");
export async function daftarKota(provinsiId: string) {
  // Validate against the provider's province list, bounding cache keys and URLs.
  const provinces = await daftarProvinsi();
  if (!provinces.some(item => item.id === provinsiId)) {
    throw new AppError("Provinsi tidak ditemukan", 404, "PROVINCE_NOT_FOUND");
  }
  return fetchRegions(`regencies/${provinsiId}.json`);
}
