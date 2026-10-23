
import { apiFetch } from "@/lib/api";

const BASE = "/cms";

export type KategoriArtikel = {
  id: string;
  nama: string;
  slug: string;
  [key: string]: any;
};

export type ArtikelCms = {
  id: string;
  judul: string;
  slug: string;
  konten?: string;
  status?: string;
  kategoriArtikel?: KategoriArtikel | null;
  [key: string]: any;
};

export type HalamanCms = {
  id: string;
  judul: string;
  slug: string;
  konten?: string;
  status?: string;
  [key: string]: any;
};

export type MenuKonfigurasi = {
  id: string;
  halaman: string;
  section: string;
  judul?: string | null;
  subJudul?: string | null;
  konten?: string | null;
  gambarUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  urutan?: number;
  status?: string;
  [key: string]: any;
};

export type TemaWarna = Record<string, any>;

export const cmsService = {
 

  getKategoriArtikel() {
    return apiFetch(`${BASE}/kategori-artikel`);
  },

  createKategoriArtikel(data: Record<string, any>) {
    return apiFetch(`${BASE}/kategori-artikel`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateKategoriArtikel(
    id: string,
    data: Record<string, any>
  ) {
    return apiFetch(
      `${BASE}/kategori-artikel/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  deleteKategoriArtikel(id: string) {
    return apiFetch(
      `${BASE}/kategori-artikel/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
  },


  getArtikel() {
    return apiFetch(`${BASE}/artikel`);
  },

  createArtikel(data: Record<string, any>) {
    return apiFetch(`${BASE}/artikel`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateArtikel(
    id: string,
    data: Record<string, any>
  ) {
    return apiFetch(
      `${BASE}/artikel/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  deleteArtikel(id: string) {
    return apiFetch(
      `${BASE}/artikel/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
  },


  getHalaman() {
    return apiFetch(`${BASE}/halaman`);
  },

  createHalaman(data: Record<string, any>) {
    return apiFetch(`${BASE}/halaman`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateHalaman(
    id: string,
    data: Record<string, any>
  ) {
    return apiFetch(
      `${BASE}/halaman/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  deleteHalaman(id: string) {
    return apiFetch(
      `${BASE}/halaman/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
  },


  getTema() {
    return apiFetch(`${BASE}/tema`);
  },

  updateTema(data: Record<string, any>) {
    return apiFetch(`${BASE}/tema`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  resetTema() {
    return apiFetch(`${BASE}/tema`, {
      method: "DELETE",
    });
  },


  getMenuKonfigurasi() {
    return apiFetch(`${BASE}/menu-konfigurasi`);
  },

  createMenuKonfigurasi(data: Record<string, any>) {
    return apiFetch(`${BASE}/menu-konfigurasi`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateMenuKonfigurasi(
    id: string,
    data: Record<string, any>
  ) {
    return apiFetch(
      `${BASE}/menu-konfigurasi/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  deleteMenuKonfigurasi(id: string) {
    return apiFetch(
      `${BASE}/menu-konfigurasi/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
  },
};
