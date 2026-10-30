"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import AuthGuard from "@/app/components/auth/AuthGuard";


function getActiveMenu(pathname) {
  if (!pathname || pathname === "/super-admin") {
    return "dashboard";
  }

  if (pathname.startsWith("/super-admin/sekolah")) {
    return "sekolah";
  }

  if (pathname.startsWith("/super-admin/yayasan")) {
    return "yayasan";
  }

  if (pathname.startsWith("/super-admin/kelola-user")) {
    return "kelola-user";
  }

  if (pathname.startsWith("/super-admin/langgananSekolah")) {
    return "langgananSekolah";
  }

  if (pathname.startsWith("/super-admin/laporanAnalitik")) {
    return "laporanAnalitik";
  }

  if (pathname.startsWith("/super-admin/logAktivitas")) {
    return "logAktivitas";
  }

  if (pathname.startsWith("/super-admin/manajemenAkses")) {
    return "manajemenAkses";
  }

  if (pathname.startsWith("/super-admin/notifikasiPengumuman")) {
    return "notifikasiPengumuman";
  }

  if (pathname.startsWith("/super-admin/paketModul")) {
    return "paketModul";
  }

  if (pathname.startsWith("/super-admin/pengaturanSistem")) {
    return "pengaturanSistem";
  }

  if (pathname.startsWith("/super-admin/profilLogout")) {
    return "profilLogout";
  }

  return "dashboard";
}


export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeMenu = useMemo(
    () => getActiveMenu(pathname),
    [pathname]
  );



  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <div className="theme-page flex h-screen w-full overflow-hidden">

        <Sidebar
          active={activeMenu}
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen((prev) => !prev)
          }
        />


        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() =>
              setSidebarOpen((prev) => !prev)
            }
            user={{
              name: "Super Admin",
              email: "admin@smartschool.com",
              avatar: "SA",
            }}
          />


          <main className="theme-page theme-text min-h-0 min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}