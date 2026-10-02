"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

/* =========================================================
   USER HELPER
========================================================= */

function getUsername(user) {
  if (!user) {
    return "Siswa";
  }

  const username =
    user.username ||
    user.userName ||
    user.nama ||
    user.namaLengkap ||
    user.namalengkap ||
    user.name ||
    user.fullName ||
    user.full_name ||
    user.nama_pengguna ||
    user.namaPengguna ||
    user.siswa?.nama ||
    user.siswa?.namaLengkap ||
    user.data?.nama ||
    user.data?.namaLengkap;

  if (
    typeof username === "string" &&
    username.trim() !== ""
  ) {
    return username.trim();
  }

  return "Siswa";
}

/* =========================================================
   INITIAL AVATAR
========================================================= */

function getInitials(name) {
  if (!name) {
    return "S";
  }

  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "S";
  }

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}

/* =========================================================
   ACTIVE MENU
========================================================= */

function getActiveMenu(pathname = "") {
  const path = pathname.toLowerCase();

  if (
    path === "/siswa" ||
    path === "/siswa/"
  ) {
    return "dashboard";
  }

  if (path.startsWith("/siswa/absensi")) {
    return "absensi";
  }

  if (
    path.startsWith("/siswa/hasil-ujian") ||
    path.startsWith("/siswa/hasilujian")
  ) {
    return "hasilUjian";
  }

  if (path.startsWith("/siswa/jadwal")) {
    return "jadwal";
  }

  if (
    path.startsWith("/siswa/kode-pelajaran") ||
    path.startsWith("/siswa/kodePelajaran")
  ) {
    return "kodePelajaran";
  }

  if (
    path.startsWith("/siswa/mata-pelajaran") ||
    path.startsWith("/siswa/mataPelajaran")
  ) {
    return "mataPelajaran";
  }

  if (path.startsWith("/siswa/pengaturan")) {
    return "pengaturan";
  }

  if (path.startsWith("/siswa/ujian")) {
    return "ujian";
  }

  return "dashboard";
}

/* =========================================================
   LAYOUT
========================================================= */

export default function SiswaLayout({
  children,
}) {
  const pathname = usePathname();

  const [mounted, setMounted] =
    useState(false);

  const [user, setUser] = useState({
    username: "Siswa",
    email: "Akun siswa",
  });

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    setMounted(true);

    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      const username =
        getUsername(parsedUser);

      const email =
        parsedUser?.email ||
        parsedUser?.emailPengguna ||
        parsedUser?.data?.email ||
        "Akun siswa";

      setUser({
        username,
        email:
          typeof email === "string" &&
          email.trim() !== ""
            ? email.trim()
            : "Akun siswa",
      });
    } catch (error) {
      console.error(
        "Gagal membaca user siswa:",
        error
      );
    }
  }, []);

  /* =======================================================
     ACTIVE MENU
  ======================================================= */

  const activeMenu = useMemo(
    () => getActiveMenu(pathname),
    [pathname]
  );

  /* =======================================================
     AVATAR
  ======================================================= */

  const avatar = getInitials(
    user.username
  );

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        role="siswa"
        activeMenu={activeMenu}
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0">
          <Header
            user={{
              name: user.username,
              email: user.email,
              avatar,
            }}
          />
        </div>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          className={`
            theme-page
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            transition-opacity
            duration-300
            ${
              mounted
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}