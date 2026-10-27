"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import AuthGuard from "@/app/components/auth/AuthGuard";
import { getSessionUser, subscribeAuth } from "@/lib/auth";


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


  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    const loadUser = () => {
      const sessionUser = getSessionUser();

      if (!sessionUser) {
        setUser({
          username: "Siswa",
          email: "Akun siswa",
        });
        return;
      }

      const username = getUsername(sessionUser);

      const email = sessionUser.email || "Akun siswa";

      setUser({
        username,
        email:
          typeof email === "string" && email.trim() !== ""
            ? email.trim()
            : "Akun siswa",
      });
    };

    loadUser();

    const unsubscribe = subscribeAuth(loadUser);

    return () => {
      unsubscribe();
    };
  }, []);


  const activeMenu = useMemo(
    () => getActiveMenu(pathname),
    [pathname]
  );


  const avatar = getInitials(
    user.username
  );

  return (
    <AuthGuard allowedRoles={["siswa"]}>
      <div className="theme-page flex h-screen w-full overflow-hidden">

        <Sidebar
          role="siswa"
          activeMenu={activeMenu}
        />


        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          <div className="shrink-0">
            <Header
              user={{
                name: user.username,
                email: user.email,
                avatar,
              }}
            />
          </div>


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
    </AuthGuard>
  );
}