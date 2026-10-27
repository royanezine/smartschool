"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import AuthGuard from "@/app/components/auth/AuthGuard";

export default function YayasanLayout({ children }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);


  const getActiveMenu = () => {
    if (!pathname || pathname === "/yayasan") {
      return "dashboard";
    }

    if (pathname.startsWith("/yayasan/sekolah")) {
      return "sekolah";
    }

    if (pathname.startsWith("/yayasan/laporan")) {
      return "laporan";
    }

    if (pathname.startsWith("/yayasan/monitoringAkademik")) {
      return "monitoringAkademik";
    }

    if (pathname.startsWith("/yayasan/pengaturan")) {
      return "pengaturan";
    }

    if (pathname.startsWith("/yayasan/guru")) {
      return "guru";
    }

    if (pathname.startsWith("/yayasan/siswa")) {
      return "siswa";
    }

    return "dashboard";
  };

  const activeMenu = getActiveMenu();


  return (
    <AuthGuard
      allowedRoles={["admin_yayasan", "yayasan", "super_admin"]}
    >
      <div className="theme-page theme-text min-h-screen flex overflow-hidden">

        <Sidebar
          role="yayasan"
          active={activeMenu}
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen((prev) => !prev)}
        />


        <div className="flex-1 flex flex-col min-w-0 min-h-screen">

          <Header
            toggleSidebar={() => setSidebarOpen((prev) => !prev)}
            user={{
              name: "Admin Yayasan",
              email: "admin@smartschool.com",
              avatar: "Y",
            }}
          />


          <main className="flex-1 min-w-0 overflow-y-auto theme-page">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}