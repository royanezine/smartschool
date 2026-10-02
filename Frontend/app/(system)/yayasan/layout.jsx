"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function YayasanLayout({ children }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ============================================================
  // ACTIVE MENU
  // ============================================================

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

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  // Sementara masih dummy.
  // Nanti bisa diganti API notifikasi yayasan tanpa mengubah layout.

  const notifications = [
    {
      id: 1,
      title: "Pengumuman Libur Semester",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Deadline Input Nilai",
      desc: "Dikirim 5 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-screen flex overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        role="yayasan"
        active={activeMenu}
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((prev) => !prev)}
      />

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <Header
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          notifications={notifications}
          user={{
            name: "Admin Yayasan",
            email: "admin@smartschool.com",
            avatar: "Y",
          }}
        />

        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="flex-1 min-w-0 overflow-y-auto theme-page">
          {children}
        </main>
      </div>
    </div>
  );
}