const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const cleanBase = API_BASE.endsWith("/api")
  ? API_BASE.slice(0, -4)
  : API_BASE;

export type PublicTemaResponse = {
  warna: {
    primer: Record<string, string>;
    sekunder: Record<string, string>;
    netral: Record<string, string>;
    status?: Record<string, string>;
  };
  hex: {
    primer: Record<string, string>;
    sekunder: Record<string, string>;
    netral: Record<string, string>;
    status?: Record<string, string>;
  };
  rgb: {
    primer: Record<string, string>;
    sekunder: Record<string, string>;
    netral: Record<string, string>;
    status?: Record<string, string>;
  };
  [key: string]: any;
};

export type HalamanRingkas = {
  id: string;
  judul: string;
  slug: string;
};

export type PublicProfil = {
  id: string;
  nama: string;
  subdomain: string;
  npsn: string | null;
  jenjang: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  kode: string | null;
  logoBesarUrl: string | null;
  logoKecilUrl: string | null;
  faviconUrl: string | null;
  status: string;
  daftarCms: HalamanRingkas[];
};

export type PublicArtikel = {
  id: string;
  judul: string;
  slug: string;
  konten?: string;
  ringkasan?: string | null;
  gambarUtama?: string | null;
  gambarUrl?: string | null;
  status?: string;
  dibuatPada: string;
  kategoriArtikel?: {
    id: string;
    nama: string;
  } | null;
};

export type PublicHalaman = {
  id: string;
  judul: string;
  slug: string;
  konten?: string;
  status?: string;
  dibuatPada?: string;
};

type ApiError = Error & {
  status?: number;
};

function unwrapResponse(value: any): any {
  let result = value;

  for (let i = 0; i < 5; i++) {
    if (
      result === null ||
      typeof result !== "object" ||
      Array.isArray(result) ||
      !("data" in result)
    ) {
      break;
    }

    result = result.data;
  }

  return result;
}

function normalizeArticles(value: any): PublicArtikel[] {
  let result = unwrapResponse(value);

  for (let i = 0; i < 3; i++) {
    if (Array.isArray(result)) {
      return result;
    }

    if (!result || typeof result !== "object") {
      return [];
    }

    if (Array.isArray(result.artikel)) {
      return result.artikel;
    }

    if (Array.isArray(result.articles)) {
      return result.articles;
    }

    if (Array.isArray(result.items)) {
      return result.items;
    }

    if ("data" in result) {
      result = result.data;
      continue;
    }

    return [];
  }

  return Array.isArray(result) ? result : [];
}

async function pubFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    noStore?: boolean;
  } = {}
): Promise<T> {
  const url = `${cleanBase}/api/publik${path}`;

  const isJsonBody = options.body && typeof options.body === "object";

  const res = await fetch(url, {
    method: options.method || "GET",
    ...(options.body
      ? {
          body: isJsonBody
            ? JSON.stringify(options.body)
            : options.body,
        }
      : {}),
    ...(options.noStore
      ? { cache: "no-store" as const }
      : { next: { revalidate: 60 } }),
    headers: {
      Accept: "application/json",
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const contentType = res.headers.get("content-type") || "";

  let responseData: any = null;

  if (contentType.includes("application/json")) {
    responseData = await res.json();
  }

  if (!res.ok) {
    const data = unwrapResponse(responseData);

    const message =
      data?.message ||
      data?.error ||
      `Request gagal dengan status ${res.status}`;

    const error = new Error(message) as ApiError;
    error.status = res.status;

    console.error("[PUBLIK API] Request gagal:", {
      url,
      status: res.status,
      message,
    });

    throw error;
  }

  if (responseData === null) {
    throw new Error(
      `Respons API bukan JSON yang valid: ${url}`
    );
  }

  return unwrapResponse(responseData) as T;
}

export const publikService = {
  getProfil: (subdomain: string) =>
    pubFetch<PublicProfil>(
      `/${encodeURIComponent(subdomain)}/profil`
    ),

  getTema: (subdomain: string) =>
    pubFetch<PublicTemaResponse>(
      `/${encodeURIComponent(subdomain)}/tema`
    ),

  getArtikel: async (subdomain: string): Promise<PublicArtikel[]> => {
    const response = await pubFetch<any>(
      `/${encodeURIComponent(subdomain)}/artikel`
    );

    const articles = normalizeArticles(response);

    console.log("[PUBLIK API] Daftar artikel:", {
      subdomain,
      jumlah: articles.length,
    });

    return articles;
  },

  getHalamanBySlug: (subdomain: string, slug: string) =>
    pubFetch<PublicHalaman>(
      `/${encodeURIComponent(subdomain)}/halaman/${encodeURIComponent(slug)}`
    ),

  getDaftarHalaman: (subdomain: string) =>
    pubFetch<HalamanRingkas[]>(
      `/${encodeURIComponent(subdomain)}/halaman`
    ),

      getKonfigurasi: (subdomain: string) =>
        pubFetch<Record<string, any>>(
          `/${encodeURIComponent(subdomain)}/konfigurasi`
        ),

      getPpdbOptions: (subdomain: string) =>
        pubFetch<any>(
          `/${encodeURIComponent(subdomain)}/ppdb`,
          { noStore: true }
        ),

      getPpdbPengumuman: (
        subdomain: string,
        query: { page?: number; limit?: number } = {}
      ) => {
        const qs = new URLSearchParams();
        if (query.page) qs.set("page", String(query.page));
        if (query.limit) qs.set("limit", String(query.limit));
        const qsStr = qs.toString();
        return pubFetch<any>(
          `/${encodeURIComponent(subdomain)}/ppdb/pengumuman${qsStr ? `?${qsStr}` : ""}`,
          { noStore: true }
        );
      },

      cekPendaftaran: (
        subdomain: string,
        payload: { nomorPendaftaran: string; nik: string }
      ) =>
        pubFetch<any>(
          `/${encodeURIComponent(subdomain)}/ppdb/cek-pendaftaran`,
          {
            method: "POST",
            body: payload,
            noStore: true,
          }
        ),
      };


