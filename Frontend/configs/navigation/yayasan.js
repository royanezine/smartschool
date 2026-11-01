import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  Settings,
} from "lucide-react";

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
    { type: "item", key: "monitoringUsers", icon: Users, label: "Monitoring Pengguna", path: "/yayasan/monitoring/users" },

    { type: "header", label: "SISTEM" },
    { type: "item", key: "pengaturan", icon: Settings, label: "Pengaturan", path: "/yayasan/pengaturan" },
  ],
};