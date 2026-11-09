/**
 * Daftar jenjang sekolah resmi yang didukung platform SaaS Multi-Tenant
 */
export const DAFTAR_JENJANG_SEKOLAH = ["SD", "SMP", "SMA", "SMK"] as const;
export type JenjangSekolah = (typeof DAFTAR_JENJANG_SEKOLAH)[number];

export const SEMUA_JENJANG: readonly JenjangSekolah[] = [
  "SD",
  "SMP",
  "SMA",
  "SMK",
] as const;

/**
 * Daftar seluruh menu baku sistem
 */
export const DAFTAR_MENU_BAKU = [
  "absen saya",
  "monitoring absensi",
  "shift",
  "keuangan dan kas",
  "manajemen pengguna",
  "akademik",
  "LMS dan CBT",
  "sarpras",
  "perpustakaan",
  "bimbingan konseling",
  "CMS",
  "Dashboard (siswa, guru, admin utama)",
  "penerimaan spmb",
  "jurusan",
  "prakerin",
] as const;

export type MenuBaku = (typeof DAFTAR_MENU_BAKU)[number];

export const DAFTAR_AKSI_MENU = ["view", "create", "update", "delete"] as const;
export type AksiMenu = (typeof DAFTAR_AKSI_MENU)[number];

export interface ItemAksesMenu {
  menu: string;
  permissions: AksiMenu[];
}

/**
 * Konfigurasi pemetaan jenjang sekolah yang diizinkan untuk setiap menu baku (Feature Toggling per Jenjang)
 */
export const KONFIGURASI_MENU_JENJANG: Record<MenuBaku, readonly JenjangSekolah[]> = {
  "absen saya": SEMUA_JENJANG,
  "monitoring absensi": SEMUA_JENJANG,
  "shift": SEMUA_JENJANG,
  "keuangan dan kas": SEMUA_JENJANG,
  "manajemen pengguna": SEMUA_JENJANG,
  "akademik": SEMUA_JENJANG,
  "LMS dan CBT": SEMUA_JENJANG,
  "sarpras": SEMUA_JENJANG,
  "perpustakaan": SEMUA_JENJANG,
  "bimbingan konseling": SEMUA_JENJANG,
  "CMS": SEMUA_JENJANG,
  "Dashboard (siswa, guru, admin utama)": SEMUA_JENJANG,
  "penerimaan spmb": SEMUA_JENJANG,
  // Khusus jenjang atas / kejuruan
  "jurusan": ["SMA", "SMK"],
  "prakerin": ["SMK"],
};

export interface DetailKonfigurasiMenu {
  menu: MenuBaku;
  allowedJenjang: readonly JenjangSekolah[];
}

/**
 * Array konfigurasi lengkap menu beserta allowedJenjang-nya
 */
export const KONFIGURASI_MENU: readonly DetailKonfigurasiMenu[] =
  DAFTAR_MENU_BAKU.map((menu) => ({
    menu,
    allowedJenjang: KONFIGURASI_MENU_JENJANG[menu],
  }));

/**
 * Helper untuk mengambil daftar menu yang diizinkan berdasarkan jenjang sekolah (case-insensitive)
 * Jika jenjang tidak ditentukan (null / undefined), mengembalikan seluruh menu baku.
 */
export const getMenusByJenjang = (jenjang?: string | null): MenuBaku[] => {
  if (!jenjang) {
    return [...DAFTAR_MENU_BAKU];
  }

  const normalized = jenjang.trim().toUpperCase() as JenjangSekolah;
  if (!DAFTAR_JENJANG_SEKOLAH.includes(normalized)) {
    return [...DAFTAR_MENU_BAKU];
  }

  return DAFTAR_MENU_BAKU.filter((menu) =>
    KONFIGURASI_MENU_JENJANG[menu].includes(normalized),
  );
};
