import {
  Home,
  Building2,
  Package,
  Tags,
  FileBarChart,
  HandCoins,
  Undo2,
  History,
  DoorOpen,
} from "lucide-react";

/**
 * Konfigurasi menu untuk role "adminSarpras".
 *
 * Struktur folder aktual (app/adminSarpras):
 * - page.jsx                          -> Beranda (/adminSarpras)
 * - fasilitas/page.jsx                -> Fasilitas (/adminSarpras/fasilitas)
 *   - [id]/page.jsx                   -> Detail Fasilitas (dinamis, tidak masuk menu)
 * - iventaris/page.jsx                -> Inventaris (/adminSarpras/iventaris)
 *   - tambah/page.jsx                 -> Tambah Inventaris (/adminSarpras/iventaris/tambah)
 *   - [id]/page.jsx                   -> Detail Inventaris (dinamis, tidak masuk menu)
 * - kategori/page.jsx                 -> Kategori (/adminSarpras/kategori)
 * - laporan/page.jsx                  -> Laporan (/adminSarpras/laporan)
 * - peminjaman/page.jsx               -> Peminjaman (/adminSarpras/peminjaman)
 *   - [id]/page.jsx                   -> Detail Peminjaman (dinamis, tidak masuk menu)
 * - pengembalian/page.jsx             -> Pengembalian (/adminSarpras/pengembalian)
 *   - [id]/page.jsx                   -> Detail Pengembalian (dinamis, tidak masuk menu)
 * - riwayat/page.jsx                  -> Riwayat (/adminSarpras/riwayat)
 * - ruangan/page.jsx                  -> Ruangan (/adminSarpras/ruangan)
 *   - tambah/page.jsx                 -> Tambah Ruangan (/adminSarpras/ruangan/tambah)
 *     - [id]/page.jsx                 -> Edit Ruangan (dinamis, tidak masuk menu)
 */
export const adminSarprasSidebarConfig = {
  basePath: "/adminSarpras",
  brandName: "Portal Sarpras",
  initials: "SP",
  email: "adminsarpras@smartschool.com",
  menuSections: [
    { type: "item", key: "dashboard", icon: Home, label: "Dashboard", path: "/adminSarpras" },
    { type: "item", key: "fasilitas", icon: Building2, label: "Fasilitas", path: "/adminSarpras/fasilitas" },
    {
      type: "item",
      key: "iventaris",
      icon: Package,
      label: "Inventaris",
      path: "/adminSarpras/iventaris",
      children: [
        { key: "tambahIventaris", icon: Package, label: "Tambah Inventaris", path: "/adminSarpras/iventaris/tambah" },
      ],
    },
    { type: "item", key: "kategori", icon: Tags, label: "Kategori", path: "/adminSarpras/kategori" },
    { type: "item", key: "laporan", icon: FileBarChart, label: "Laporan", path: "/adminSarpras/laporan" },
    { type: "item", key: "peminjaman", icon: HandCoins, label: "Peminjaman", path: "/adminSarpras/peminjaman" },
    { type: "item", key: "pengembalian", icon: Undo2, label: "Pengembalian", path: "/adminSarpras/pengembalian" },
    { type: "item", key: "riwayat", icon: History, label: "Riwayat", path: "/adminSarpras/riwayat" },
  ],
};