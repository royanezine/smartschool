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
] as const;

export type MenuBaku = (typeof DAFTAR_MENU_BAKU)[number];

export const DAFTAR_AKSI_MENU = ["view", "create", "update", "delete"] as const;
export type AksiMenu = (typeof DAFTAR_AKSI_MENU)[number];

export interface ItemAksesMenu {
  menu: string;
  permissions: AksiMenu[];
}

