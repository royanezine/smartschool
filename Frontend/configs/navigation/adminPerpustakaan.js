import {
  LayoutDashboard,
  Library,
  BookOpen,
  BookOpenCheck,
  BookUp,
  BookDown,
  History,
} from "lucide-react";

export const adminPerpustakaanNavigation = {
  // =====================================================
  // IDENTITAS
  // =====================================================

  basePath: "/admin/perpustakaan",

  brandName: "Admin Perpustakaan",

  initials: "AP",

  email: "perpustakaan@smartschool.com",

  // =====================================================
  // NAVIGASI
  // =====================================================

  menuSections: [
    // ===================================================
    // DASHBOARD
    // ===================================================

    {
      type: "item",
      key: "dashboardPerpustakaan",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/perpustakaan",
    },

    // ===================================================
    // KOLEKSI
    // ===================================================

    {
      type: "header",
      label: "KOLEKSI",
    },

    {
      type: "item",
      key: "dataBuku",
      icon: Library,
      label: "Data Buku",
      path: "/admin/perpustakaan/buku",
    },

    {
      type: "item",
      key: "bukuDigital",
      icon: BookOpenCheck,
      label: "Buku Digital",
      path: "/admin/perpustakaan/buku-digital",
    },

    // ===================================================
    // TRANSAKSI
    // ===================================================

    {
      type: "header",
      label: "TRANSAKSI",
    },

    {
      type: "item",
      key: "peminjaman",
      icon: BookUp,
      label: "Peminjaman",
      path: "/admin/perpustakaan/peminjaman",
    },

    {
      type: "item",
      key: "pengembalian",
      icon: BookDown,
      label: "Pengembalian",
      path: "/admin/perpustakaan/pengembalian",
    },

    // ===================================================
    // LAPORAN
    // ===================================================

    {
      type: "header",
      label: "LAPORAN",
    },

    {
      type: "item",
      key: "riwayatPeminjaman",
      icon: History,
      label: "Riwayat Peminjaman",
      path: "/admin/perpustakaan/riwayat",
    },
  ],
};

export default adminPerpustakaanNavigation;