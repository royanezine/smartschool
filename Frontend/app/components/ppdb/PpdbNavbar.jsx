"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    key: "beranda",
    label: "Beranda",
    href: "/PPDB",
  },
  {
    key: "jalur",
    label: "Jalur Pendaftaran",
    href: "/PPDB/jalurPendaftaran",
  },
  {
    key: "alur",
    label: "Alur Pendaftaran",
    href: "/PPDB/alurPendaftaran",
  },
  {
    key: "pengumuman",
    label: "Pengumuman",
    href: "/PPDB/pengumuman",
  },
];

export default function PpdbNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const getActiveKey = () => {
    if (
      pathname === "/PPDB" ||
      pathname === "/PPDB/"
    ) {
      return "beranda";
    }

    if (
      pathname.startsWith(
        "/PPDB/jalurPendaftaran"
      )
    ) {
      return "jalur";
    }

    if (
      pathname.startsWith(
        "/PPDB/alurPendaftaran"
      )
    ) {
      return "alur";
    }

    if (
      pathname.startsWith(
        "/PPDB/pengumuman"
      )
    ) {
      return "pengumuman";
    }

    return "";
  };

  const activeNav = getActiveKey();

  const handleNavClick = (item) => {
    closeMenu();

    if (
      item.key === "beranda" &&
      (pathname === "/PPDB" ||
        pathname === "/PPDB/")
    ) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    router.push(item.href);
  };

  const goToCekPendaftaran = () => {
    closeMenu();

    router.push(
      "/PPDB/cek-pendaftaran"
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* BRAND */}
        <button
          type="button"
          onClick={() => {
            closeMenu();

            if (
              pathname === "/PPDB" ||
              pathname === "/PPDB/"
            ) {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            } else {
              router.push("/PPDB");
            }
          }}
          className="flex min-w-0 items-center gap-2.5 text-left"
        >
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-blue-600 p-2 text-white">
            <GraduationCap size={18} />
          </div>

          <span className="truncate text-sm font-semibold text-slate-800 sm:text-base">
            PPDB SmartSchool 2026/2027
          </span>
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
          {navItems.map((item) => {
            const isActive =
              activeNav === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  handleNavClick(item)
                }
                className={`relative px-3 py-2 font-medium transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {item.label}

                {isActive && (
                  <span className="absolute -bottom-[1px] left-3 right-3 h-0.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* DESKTOP CTA */}
        <div className="hidden shrink-0 md:flex">
          <button
            type="button"
            onClick={
              goToCekPendaftaran
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Cek Pendaftaran
          </button>
        </div>

        {/* MOBILE */}
        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              (prev) => !prev
            )
          }
          className="flex shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-50 md:hidden"
          aria-label={
            menuOpen
              ? "Tutup menu"
              : "Buka menu"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="space-y-1 border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {navItems.map((item) => {
            const isActive =
              activeNav === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  handleNavClick(item)
                }
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={
                goToCekPendaftaran
              }
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Cek Pendaftaran
            </button>
          </div>
        </div>
      )}
    </header>
  );
}