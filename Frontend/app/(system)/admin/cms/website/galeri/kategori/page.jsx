"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Tags,
  Plus,
  Search,
  Pencil,
  Trash2,
  Image as ImageIcon,
  LayoutGrid,
} from "lucide-react";

export default function KategoriPage() {
  const router = useRouter();

  // State Sidebar
  const [active, setActive] = useState("galeri");
  const [collapsed, setCollapsed] = useState(false);

  // State Data & Pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriList, setKategoriList] = useState([
    { id: 1, name: "Dokumentasi", count: 15, color: "blue" },
    { id: 2, name: "Bangunan", count: 8, color: "indigo" },
    { id: 3, name: "Fasilitas", count: 6, color: "purple" },
    { id: 4, name: "Apresiasi", count: 4, color: "pink" },
    { id: 5, name: "Kegiatan Sosial", count: 3, color: "orange" },
  ]);

  // Filter Logic
  const filteredKategori = kategoriList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Warna kategori
  const colorMap = {
    blue: {
      wrapper: "theme-info",
      icon: "text-[var(--color-info)]",
      border: "border-[var(--color-info)]/20",
    },
    indigo: {
      wrapper: "theme-info",
      icon: "text-[var(--color-info)]",
      border: "border-[var(--color-info)]/20",
    },
    purple: {
      wrapper:
        "bg-[color:var(--color-primary)]/10",
      icon: "text-[var(--color-primary)]",
      border: "border-[var(--color-primary)]/20",
    },
    pink: {
      wrapper:
        "bg-[color:var(--color-danger)]/10",
      icon: "text-[var(--color-danger)]",
      border: "border-[var(--color-danger)]/20",
    },
    orange: {
      wrapper: "theme-warning",
      icon: "text-[var(--color-warning)]",
      border: "border-[var(--color-warning)]/20",
    },
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden theme-page">
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN CONTENT */}
      <main
        className="
          flex-1
          min-w-0
          w-0
          overflow-y-auto
          theme-page
          transition-all
          duration-300
        "
      >
        {/* HEADER */}
        <Header title="Kategori Galeri" user={{ name: "Admin" }} />

        {/* KONTEN UTAMA */}
        <div className="w-full min-w-0 px-4 py-8 md:px-8 lg:px-10 lg:py-10">
          <div className="w-full max-w-7xl mx-auto min-w-0 space-y-8">
            {/* 1. BREADCRUMB */}
            <nav
              className="flex text-sm font-medium theme-text-muted"
              aria-label="Breadcrumb"
            >
              <ol className="inline-flex items-center space-x-2 md:space-x-3 tracking-wide">
                <li className="inline-flex items-center">
                  <a
                    href="/cmsAdmin"
                    className="hover:text-[var(--color-primary)] transition-colors"
                  >
                    Dashboard
                  </a>
                </li>

                <li className="theme-text-placeholder">/</li>

                <li className="inline-flex items-center">
                  <a
                    href="/cmsAdmin/website/galeri"
                    className="hover:text-[var(--color-primary)] transition-colors"
                  >
                    Galeri
                  </a>
                </li>

                <li className="theme-text-placeholder">/</li>

                <li
                  className="inline-flex items-center text-[var(--color-primary)]"
                  aria-current="page"
                >
                  Kategori
                </li>
              </ol>
            </nav>

            {/* 2. HEADER & ACTION BUTTONS */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 theme-info rounded-2xl shadow-sm">
                  <Tags className="w-6 h-6" />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight theme-text">
                    Manajemen Kategori
                  </h1>

                  <p className="text-sm theme-text-muted mt-1 leading-relaxed hidden sm:block">
                    Kelola label kategori untuk mengelompokkan foto di galeri Anda
                  </p>
                </div>
              </div>

              {/* Tombol Tambah Kategori */}
              <button
                onClick={() =>
                  alert("Fitur Tambah Kategori dibuka! (Mockup)")
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  theme-primary
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  shadow-lg
                  hover:shadow-xl
                  active:scale-95
                  transition-all
                  duration-200
                "
              >
                <Plus className="h-4 w-4" />
                Tambah Kategori Baru
              </button>
            </div>

            {/* 3. STATISTIK RINGKASAN */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* TOTAL KATEGORI */}
              <div
                className="
                  theme-card
                  p-4
                  rounded-2xl
                  shadow-sm
                  border theme-border
                  border-l-4
                  border-l-[var(--color-primary)]
                  hover:shadow-md
                  transition-shadow
                "
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 theme-info rounded-lg">
                    <Tags className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Total Kategori
                    </p>

                    <p className="text-2xl font-bold tracking-tight theme-text">
                      {kategoriList.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* TOTAL FOTO */}
              <div
                className="
                  theme-card
                  p-4
                  rounded-2xl
                  shadow-sm
                  border theme-border
                  border-l-4
                  border-l-[var(--color-info)]
                  hover:shadow-md
                  transition-shadow
                "
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 theme-info rounded-lg">
                    <ImageIcon className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Total Foto
                    </p>

                    <p className="text-2xl font-bold tracking-tight theme-text">
                      36
                    </p>
                  </div>
                </div>
              </div>

              {/* KATEGORI UTAMA */}
              <div
                className="
                  theme-card
                  p-4
                  rounded-2xl
                  shadow-sm
                  border theme-border
                  border-l-4
                  border-l-[var(--color-primary)]
                  hover:shadow-md
                  transition-shadow
                  hidden sm:block
                "
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 theme-info rounded-lg">
                    <LayoutGrid className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Kategori Utama
                    </p>

                    <p className="text-2xl font-bold tracking-tight theme-text">
                      3
                    </p>
                  </div>
                </div>
              </div>

              {/* TERAKHIR EDIT */}
              <div
                className="
                  theme-card
                  p-4
                  rounded-2xl
                  shadow-sm
                  border theme-border
                  border-l-4
                  border-l-[var(--color-success)]
                  hover:shadow-md
                  transition-shadow
                  hidden md:block
                "
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 theme-success rounded-lg">
                    <Pencil className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Terakhir Edit
                    </p>

                    <p className="text-2xl font-bold tracking-tight theme-text text-sm">
                      Kemarin
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. SEARCH BAR */}
            <div
              className="
                theme-card
                p-4
                rounded-2xl
                shadow-sm
                border theme-border
                flex
                items-center
              "
            >
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 theme-text-muted" />

                <input
                  type="text"
                  placeholder="Cari nama kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    theme-input
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    border
                    text-sm
                    font-medium
                    outline-none
                    focus:border-[var(--color-primary)]
                    transition-all
                  "
                />
              </div>
            </div>

            {/* 5. GRID KATEGORI INTERAKTIF */}
            {filteredKategori.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredKategori.map((item) => {
                  const colors =
                    colorMap[item.color] || colorMap.blue;

                  return (
                    <div
                      key={item.id}
                      className="
                        group
                        relative
                        theme-card
                        rounded-2xl
                        shadow-sm
                        border theme-border
                        overflow-hidden
                        hover:shadow-xl
                        hover:-translate-y-1.5
                        transition-all
                        duration-300
                        flex
                        items-center
                        p-5
                      "
                    >
                      {/* Icon Kategori */}
                      <div
                        className={`
                          flex-shrink-0
                          w-14
                          h-14
                          rounded-2xl
                          ${colors.wrapper}
                          ${colors.border}
                          border
                          flex
                          items-center
                          justify-center
                          mr-5
                        `}
                      >
                        <Tags
                          className={`w-6 h-6 ${colors.icon}`}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Detail Kategori */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold theme-text text-base truncate">
                              {item.name}
                            </h3>

                            <p className="text-sm font-medium theme-text-muted mt-0.5">
                              {item.count} Foto
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              className="
                                p-2
                                theme-text-muted
                                hover:text-[var(--color-primary)]
                                hover:bg-[var(--color-sidebar-active)]
                                rounded-full
                                transition-all
                                duration-200
                              "
                              title="Edit Kategori"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              className="
                                p-2
                                theme-text-muted
                                hover:text-[var(--color-danger)]
                                hover:bg-[var(--color-danger-background)]
                                rounded-full
                                transition-all
                                duration-200
                              "
                              title="Hapus Kategori"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t theme-border">
                          <a
                            href={`/cmsAdmin/website/galeri?kategori=${item.name}`}
                            className="
                              text-xs
                              font-semibold
                              text-[var(--color-primary)]
                              hover:text-[var(--color-primary-hover)]
                              flex
                              items-center
                              gap-1
                              transition-colors
                              group-hover:underline
                            "
                          >
                            Lihat Foto

                            <span className="theme-text-muted group-hover:translate-x-1 transition-transform">
                              →
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div
                className="
                  theme-card
                  rounded-2xl
                  shadow-sm
                  border theme-border
                  p-16
                  text-center
                "
              >
                <div className="inline-flex p-5 theme-card-soft rounded-full mb-5">
                  <Tags className="w-10 h-10 theme-text-muted" />
                </div>

                <h3 className="text-xl font-bold theme-text">
                  Kategori tidak ditemukan
                </h3>

                <p className="theme-text-muted mt-2 text-sm max-w-sm mx-auto">
                  Coba ubah kata kunci pencarian atau buat kategori baru untuk melabeli foto Anda.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}