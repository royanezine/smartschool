"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  Package,
  Sparkles,
  ClipboardList,
  FileText,
  ArrowRight,
  Boxes,
  AlertTriangle,
  Clock,
} from "lucide-react";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

// =========================================================
// DUMMY DATA
// =========================================================

// Ringkasan peminjaman sarana-prasarana untuk ditampilkan
// di halaman index Sarpras.
// Ganti dengan data asli dari API/DB begitu tersedia.

const subHalaman = [
  {
    key: "pinjam",
    href: "/guru/sarpras/pinjam",
    icon: Package,
    color: "primary",
    label: "Pinjam",
    deskripsi:
      "Ajukan peminjaman alat, ruangan, atau fasilitas sekolah untuk kebutuhan mengajar.",
    info: "12 item tersedia",
  },
  {
    key: "peminjaman",
    href: "/guru/sarpras/peminjaman",
    icon: ClipboardList,
    color: "warning",
    label: "Peminjaman",
    deskripsi:
      "Pantau status pengajuan peminjaman yang sedang berjalan atau menunggu persetujuan.",
    info: "3 pengajuan aktif",
  },
  {
    key: "riwayat",
    href: "/guru/sarpras/riwayat",
    icon: FileText,
    color: "success",
    label: "Riwayat",
    deskripsi:
      "Lihat catatan lengkap seluruh peminjaman yang telah selesai atau dikembalikan.",
    info: "28 riwayat bulan ini",
  },
];

const colorClasses = {
  primary: {
    badge: `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`,
    iconBg: themePrimaryGradient,
  },

  warning: {
    badge: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    iconBg:
      "bg-[linear-gradient(135deg,var(--color-warning),color-mix(in_srgb,var(--color-warning)_72%,var(--color-primary)))]",
  },

  success: {
    badge: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    iconBg:
      "bg-[linear-gradient(135deg,var(--color-success),color-mix(in_srgb,var(--color-success)_72%,var(--color-primary)))]",
  },
};

const ringkasanPeminjaman = [
  {
    item: "Proyektor Epson EB-X05",
    kategori: "Elektronik",
    status: "dipinjam",
    batasWaktu: "Kembali hari ini",
  },
  {
    item: "Ruang Lab Komputer 2",
    kategori: "Ruangan",
    status: "menunggu",
    batasWaktu: "Menunggu persetujuan",
  },
  {
    item: "Sound System Portable",
    kategori: "Elektronik",
    status: "dipinjam",
    batasWaktu: "Kembali 2 hari lagi",
  },
  {
    item: "Matras Olahraga (10 pcs)",
    kategori: "Olahraga",
    status: "terlambat",
    batasWaktu: "Terlambat 1 hari",
  },
];

const statusClasses = {
  dipinjam: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,

  menunggu: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,

  terlambat: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
};

const statusLabel = {
  dipinjam: "Dipinjam",
  menunggu: "Menunggu",
  terlambat: "Terlambat",
};

// =========================================================
// PAGE
// =========================================================

export default function GuruSarprasIndexPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notifications = [
    {
      id: 1,
      title: "Pengajuan Disetujui",
      desc: "Dikirim 1 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Batas Pengembalian Alat",
      desc: "Dikirim 4 jam lalu",
      read: false,
    },
  ];

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        {/* MAIN */}
        <main className="theme-page flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex flex-shrink-0 items-center justify-center rounded-lg p-2 text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow}`}
                  >
                    <Package size={18} />
                  </div>

                  <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                    Sarana Prasarana
                  </h1>
                </div>

                <p className="theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5 text-sm">
                  <Sparkles
                    size={14}
                    className="theme-text-muted flex-shrink-0"
                  />

                  <span className="truncate">
                    Kelola peminjaman alat, ruangan, dan fasilitas sekolah —
                    pilih menu di bawah.
                  </span>
                </p>
              </div>
            </div>

            {/* =====================================================
                SUB-HALAMAN CARDS
            ===================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {subHalaman.map((s) => {
                const theme = colorClasses[s.color];

                return (
                  <Link
                    key={s.key}
                    href={s.href}
                    className={`theme-card group flex flex-col gap-3 rounded-xl border p-5 ${themeNeutralBorder} ${themeCardShadow} transition-all hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_9%,transparent)]`}
                  >
                    {/* ICON + ARROW */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex flex-shrink-0 items-center justify-center rounded-lg p-2.5 text-[var(--color-card)] ${theme.iconBg} ${themeSmallShadow}`}
                      >
                        <s.icon size={18} />
                      </div>

                      <ArrowRight
                        size={16}
                        className="theme-text-muted flex-shrink-0 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                      />
                    </div>

                    {/* CONTENT */}
                    <div>
                      <h2 className="theme-text text-sm font-semibold">
                        {s.label}
                      </h2>

                      <p className="theme-text-secondary mt-1 text-xs leading-relaxed">
                        {s.deskripsi}
                      </p>
                    </div>

                    {/* INFO BADGE */}
                    <span
                      className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium ${theme.badge}`}
                    >
                      {s.info}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* =====================================================
                RINGKASAN PEMINJAMAN AKTIF
            ===================================================== */}

            <div
              className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              {/* HEADER */}
              <div
                className={`flex items-center gap-2 border-b p-4 sm:p-5 ${themeDivider}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralSurface} ${themeNeutralBorder}`}
                >
                  <Boxes size={16} className="theme-text-secondary" />
                </div>

                <h2 className="theme-text text-sm font-semibold">
                  Peminjaman Aktif
                </h2>
              </div>

              {/* LIST */}
              <div>
                {ringkasanPeminjaman.map((p, idx) => {
                  const isLast = idx === ringkasanPeminjaman.length - 1;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-4 sm:px-5 sm:py-3.5 ${
                        !isLast ? `border-b ${themeDivider}` : ""
                      } ${themeNeutralHover} transition-colors`}
                    >
                      {/* ITEM */}
                      <div className="min-w-0 flex-1">
                        <p className="theme-text truncate text-sm font-medium">
                          {p.item}
                        </p>

                        <p className="theme-text-muted mt-0.5 text-xs">
                          {p.kategori}
                        </p>
                      </div>

                      {/* DEADLINE */}
                      <div className="theme-text-secondary flex flex-shrink-0 items-center gap-1.5 text-xs">
                        {p.status === "terlambat" ? (
                          <AlertTriangle
                            size={12}
                            className="theme-danger"
                          />
                        ) : (
                          <Clock
                            size={12}
                            className="theme-text-muted"
                          />
                        )}

                        <span className="hidden sm:inline">
                          {p.batasWaktu}
                        </span>
                      </div>

                      {/* STATUS */}
                      <span
                        className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClasses[p.status]}`}
                      >
                        {statusLabel[p.status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}