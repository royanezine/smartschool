import {
  LayoutDashboard,
  School,
  Building2,
  Package,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  History,
  Bell,
  User,
  UserCog,
} from "lucide-react";

/**
 * Konfigurasi menu untuk role "super-admin".
 * Tinggal edit array `menuSections` di sini kalau mau nambah/kurang menu,
 * tanpa nyentuh SidebarView.jsx atau Sidebar.jsx sama sekali.
 */
export const superadminSidebarConfig = {
  basePath: "/super-admin",
  brandName: "Super Admin",
  initials: "SA",
  email: "admin@smartschool.com",

  menuSections: [
    {
      type: "item",
      key: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/super-admin",
    },

    {
      type: "header",
      label: "PRODUK",
    },

    {
      type: "item",
      key: "paketModul",
      icon: Package,
      label: "Paket & Modul",
      path: "/super-admin/paketModul",
    },

    {
      type: "item",
      key: "langgananSekolah",
      icon: Users,
      label: "Langganan Sekolah",
      path: "/super-admin/langgananSekolah",
    },

    {
      type: "header",
      label: "DATA MASTER",
    },

    {
      type: "item",
      key: "yayasan",
      icon: School,
      label: "Yayasan",
      path: "/super-admin/yayasan",
    },

    {
      type: "item",
      key: "sekolah",
      icon: Building2,
      label: "Sekolah",
      path: "/super-admin/sekolah",
    },

    {
      type: "header",
      label: "ADMINISTRASI",
    },

    {
      type: "item",
      key: "manajemenAkses",
      icon: ShieldCheck,
      label: "Manajemen Akses",
      path: "/super-admin/manajemenAkses",
    },

    {
      type: "item",
      key: "kelolaUser",
      icon: UserCog,
      label: "Kelola User",
      path: "/super-admin/kelola-user",
    },

    {
      type: "item",
      key: "laporanAnalitik",
      icon: FileText,
      label: "Laporan & Analitik",
      path: "/super-admin/laporanAnalitik",
    },

    {
      type: "header",
      label: "SISTEM",
    },

    {
      type: "item",
      key: "pengaturanSistem",
      icon: Settings,
      label: "Pengaturan Sistem",
      path: "/super-admin/pengaturanSistem",
    },

    {
      type: "item",
      key: "logAktivitas",
      icon: History,
      label: "Log Aktivitas",
      path: "/super-admin/logAktivitas",
    },

    {
      type: "item",
      key: "notifikasiPengumuman",
      icon: Bell,
      label: "Notifikasi & Pengumuman",
      path: "/super-admin/notifikasiPengumuman",
    },

    {
      type: "item",
      key: "profileLogout",
      icon: User,
      label: "Profil & Logout",
      path: "/super-admin/profileLogout",
    },
  ],
};