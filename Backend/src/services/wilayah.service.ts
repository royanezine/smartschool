import { z } from "zod";
import { AppError } from "../utils/appError";
import { getRedisClient } from "../config/redis";

const BASE_URL = "https://wilayah.id/api";
const rawRegion = z.object({ code: z.string(), name: z.string().min(1) });
const rawPayload = z.object({ data: z.array(rawRegion).min(1) });
export type Region = { id: string; name: string };

// Fallback in-memory cache jika Redis tidak tersedia
const memoryFallback = new Map<string, { expires: number; data: Region[] }>();
const inFlight = new Map<string, Promise<Region[]>>();

async function fetchRegions(path: string): Promise<Region[]> {
  const cacheKey = `cache:wilayah:${path.replace(/[\/\.]/g, ":")}`;
  const redis = getRedisClient();

  // 1. Cek dari Redis cache terlebih dahulu (multi-instance shared cache)
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as Region[];
      }
    } catch {
      // Abaikan error redis dan fallback ke memory
    }
  } else {
    const saved = memoryFallback.get(path);
    if (saved && saved.expires > Date.now()) return saved.data;
  }

  // 2. Hindari thundering herd problem dengan inFlight promise map
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

      // Simpan ke Redis dengan TTL 24 jam (86400 detik)
      if (redis) {
        try {
          await redis.set(cacheKey, JSON.stringify(data), "EX", 24 * 60 * 60);
        } catch {
          // Abaikan kegagalan cache write
        }
      }

      // Simpan juga ke memory fallback
      memoryFallback.set(path, { data, expires: Date.now() + 24 * 60 * 60 * 1000 });
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

export async function daftarKecamatan(kotaId: string) {
  return fetchRegions(`districts/${kotaId}.json`);
}

export async function daftarKelurahan(kecamatanId: string) {
  return fetchRegions(`villages/${kecamatanId}.json`);
}
