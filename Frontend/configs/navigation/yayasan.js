import {
  LayoutDashboard,
  Building2,
  FileText,
  GraduationCap,
  UserSquare2,
  ClipboardCheck,
  Package,
  BookOpen,
  Layers,
  Settings,
  User,
  MapPin,
} from "lucide-react";

/**
 * Konfigurasi menu untuk role "yayasan".
 * Persis mengikuti struktur folder app/yayasan/:
 * - laporan/            -> submenu: akademik, guru, iventaris, siswa
 * - lokasi/             -> halaman tunggal (peta lokasi sekolah)
 * - monitoringAkademik/ -> submenu: kehadiran, lms
 * - pengaturan/         -> halaman tunggal
 * - sekolah/            -> halaman tunggal
 */
export const yayasanSidebarConfig = {
  basePath: "/yayasan",
  brandName: "Yayasan",
  initials: "YS",
  email: "admin@smartschool.com",
  menuSections: [
    { type: "item", key: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/yayasan" },

    { type: "header", label: "DATA MASTER" },
    { type: "item", key: "sekolah", icon: Building2, label: "Sekolah", path: "/yayasan/sekolah" },
    { type: "item", key: "lokasi", icon: MapPin, label: "Lokasi Sekolah", path: "/yayasan/lokasi" },

    { type: "header", label: "MONITORING" },
    {
      type: "item",
      key: "monitoringAkademik",
      icon: ClipboardCheck,
      label: "Monitoring Akademik",
      path: "/yayasan/monitoringAkademik",
      children: [
        { key: "monitoringKehadiran", icon: ClipboardCheck, label: "Kehadiran", path: "/yayasan/monitoringAkademik/kehadiran" },
        { key: "monitoringLms", icon: Layers, label: "LMS", path: "/yayasan/monitoringAkademik/lms" },
      ],
    },
    {
      type: "item",
      key: "laporan",
      icon: FileText,
      label: "Laporan & Analitik",
      path: "/yayasan/laporan",
      children: [
        { key: "laporanAkademik", icon: BookOpen, label: "Akademik", path: "/yayasan/laporan/akademik" },
        { key: "laporanGuru", icon: GraduationCap, label: "Guru", path: "/yayasan/laporan/guru" },
        { key: "laporanIventaris", icon: Package, label: "Inventaris", path: "/yayasan/laporan/iventaris" },
        { key: "laporanSiswa", icon: UserSquare2, label: "Siswa", path: "/yayasan/laporan/siswa" },
      ],
    },

    { type: "header", label: "SISTEM" },
    { type: "item", key: "pengaturan", icon: Settings, label: "Pengaturan", path: "/yayasan/pengaturan" },
  ],
};