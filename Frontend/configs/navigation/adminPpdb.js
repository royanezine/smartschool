import {
  Home,
  Waves,
  Route,
  Percent,
  FileBarChart,
  Users,
  Megaphone,
  ClipboardCheck,
} from "lucide-react";

export const adminPPDBSidebarConfig = {
  basePath: "/adminPPDB",
  brandName: "Portal PPDB",
  initials: "PP",
  email: "adminppdb@smartschool.com",
  menuSections: [
    { type: "item", key: "dashboard", icon: Home, label: "Dashboard", path: "/adminPPDB" },
    { type: "item", key: "gelombang", icon: Waves, label: "Gelombang", path: "/adminPPDB/gelombang" },
    { type: "item", key: "jalur", icon: Route, label: "Jalur Pendaftaran", path: "/adminPPDB/jalur" },
    { type: "item", key: "kuota", icon: Percent, label: "Kuota", path: "/adminPPDB/kuota" },
    { type: "item", key: "pendaftar", icon: Users, label: "Data Pendaftar", path: "/adminPPDB/pendaftar" },
    { type: "item", key: "seleksi", icon: ClipboardCheck, label: "Seleksi", path: "/adminPPDB/seleksi" },
    { type: "item", key: "pengumuman", icon: Megaphone, label: "Pengumuman", path: "/adminPPDB/pengumuman" },
    { type: "item", key: "laporan", icon: FileBarChart, label: "Laporan", path: "/adminPPDB/laporan" },
  ],
};