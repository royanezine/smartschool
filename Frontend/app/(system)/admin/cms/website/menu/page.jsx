// app/cmsAdmin/website/menu/page.jsx
"use client";

import { useState } from "react";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  Plus,
  Layout,
  Footprints,
  List,
  Monitor,
  Smartphone,
  Settings,
  ChevronRight,
  Menu as MenuIcon,
  GripVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

// =========================================================
// DUMMY DATA MENU
// =========================================================
const dummyMenus = [
  {
    id: 1,
    title: "Beranda",
    type: "header",
    url: "/",
    order: 1,
    status: "aktif",
  },
  {
    id: 2,
    title: "Profil",
    type: "header",
    url: "/profil",
    order: 2,
    status: "aktif",
  },
  {
    id: 3,
    title: "Layanan",
    type: "header",
    url: "/layanan",
    order: 3,
    status: "aktif",
  },
  {
    id: 4,
    title: "Syarat & Ketentuan",
    type: "footer",
    url: "/syarat",
    order: 1,
    status: "aktif",
  },
  {
    id: 5,
    title: "Kebijakan Privasi",
    type: "footer",
    url: "/privasi",
    order: 2,
    status: "aktif",
  },
  {
    id: 6,
    title: "Kontak Kami",
    type: "footer",
    url: "/kontak",
    order: 3,
    status: "aktif",
  },
  {
    id: 7,
    title: "Berita",
    type: "header",
    url: "/berita",
    order: 4,
    status: "nonaktif",
  },
  {
    id: 8,
    title: "Galeri",
    type: "header",
    url: "/galeri",
    order: 5,
    status: "nonaktif",
  },
];

export default function MenuPage() {
  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("semua");

  const filteredMenus = dummyMenus
    .filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((m) =>
      filterType === "semua" ? true : m.type === filterType
    );

  const totalMenus = dummyMenus.length;
  const headerCount = dummyMenus.filter(
    (m) => m.type === "header"
  ).length;
  const footerCount = dummyMenus.filter(
    (m) => m.type === "footer"
  ).length;
  const activeCount = dummyMenus.filter(
    (m) => m.status === "aktif"
  ).length;

  return (
    <div className="theme-page flex min-h-screen w-full">
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN AREA */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Menu Website"
          user={{ name: "Admin" }}
          notifications={[]}
        />

        <main className="theme-page flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-full min-w-0 space-y-6">
            {/* BREADCRUMB */}
            <nav
              className="
                flex
                items-center
                flex-wrap
                gap-1
                text-xs
                sm:text-sm
                theme-text-muted
              "
            >
              <a
                href="/cmsAdmin"
                className="
                  hover:text-[var(--color-primary)]
                  transition
                "
              >
                Dashboard
              </a>

              <ChevronRight className="w-3.5 h-3.5 theme-text-placeholder" />

              <a
                href="/cmsAdmin/website"
                className="
                  hover:text-[var(--color-primary)]
                  transition
                "
              >
                Website
              </a>

              <ChevronRight className="w-3.5 h-3.5 theme-text-placeholder" />

              <span className="text-[var(--color-primary)] font-semibold">
                Manajemen Menu
              </span>
            </nav>

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="
                    shrink-0
                    p-2.5
                    theme-info
                    rounded-xl
                  "
                >
                  <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-info)]" />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      text-xl
                      sm:text-2xl
                      lg:text-3xl
                      font-bold
                      theme-text
                      truncate
                    "
                  >
                    Manajemen Menu
                  </h1>

                  <p className="text-xs sm:text-sm theme-text-muted mt-0.5">
                    Atur navigasi header, footer, dan struktur menu website
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="/cmsAdmin/website/menu/tambah"
                  className="
                    theme-primary
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    transition
                    shadow-sm
                    font-semibold
                    text-sm
                  "
                >
                  <Plus className="w-4 h-4" />
                  Tambah Menu
                </a>

                <a
                  href="/cmsAdmin/website/menu/pengaturan"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2.5
                    border
                    theme-border
                    theme-card
                    theme-text-secondary
                    rounded-xl
                    theme-sidebar-hover
                    transition
                    text-sm
                    font-medium
                  "
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </a>
              </div>
            </div>

            {/* STATISTIK */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                icon={<List className="w-5 h-5" />}
                iconBg="theme-info"
                iconColor="text-[var(--color-info)]"
                label="Total Menu"
                value={totalMenus}
              />

              <StatCard
                icon={<Monitor className="w-5 h-5" />}
                iconBg="theme-card-soft"
                iconColor="text-[var(--color-primary)]"
                label="Menu Header"
                value={headerCount}
              />

              <StatCard
                icon={<Footprints className="w-5 h-5" />}
                iconBg="theme-warning"
                iconColor="text-[var(--color-warning)]"
                label="Menu Footer"
                value={footerCount}
              />

              <StatCard
                icon={<CheckCircle className="w-5 h-5" />}
                iconBg="theme-success"
                iconColor="text-[var(--color-success)]"
                label="Menu Aktif"
                value={activeCount}
              />
            </div>

            {/* SEARCH & FILTER */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-3
                theme-card
                rounded-xl
                border
                theme-border
                p-4
                shadow-sm
              "
            >
              <div className="relative flex-1">
                <MenuIcon
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    theme-text-muted
                  "
                />

                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="
                    theme-input
                    w-full
                    pl-9
                    pr-3
                    py-2
                    text-sm
                    border
                    rounded-lg
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500/20
                    focus:border-[var(--color-primary)]
                    transition
                  "
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="
                  theme-input
                  px-3
                  py-2
                  text-sm
                  border
                  rounded-lg
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500/20
                  focus:border-[var(--color-primary)]
                  cursor-pointer
                "
              >
                <option value="semua">Semua Tipe</option>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </select>

              <button
                onClick={() => {
                  setSearch("");
                  setFilterType("semua");
                }}
                className="
                  px-4
                  py-2
                  text-sm
                  theme-text-muted
                  hover:text-[var(--color-text)]
                  theme-sidebar-hover
                  rounded-lg
                  transition
                "
              >
                Reset
              </button>
            </div>

            {/* MENU LIST - TABEL */}
            <div
              className="
                theme-card
                rounded-xl
                border
                theme-border
                shadow-sm
                overflow-hidden
              "
            >
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr
                      className="
                        border-b
                        theme-border
                        theme-table-header
                      "
                    >
                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          theme-text-muted
                          w-10
                        "
                      >
                        <GripVertical className="w-4 h-4 theme-text-placeholder" />
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          theme-text-muted
                        "
                      >
                        Judul Menu
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          theme-text-muted
                        "
                      >
                        Tipe
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          theme-text-muted
                        "
                      >
                        URL
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          theme-text-muted
                        "
                      >
                        Status
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-right
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          theme-text-muted
                        "
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {filteredMenus.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <MenuIcon className="w-10 h-10 theme-text-placeholder mx-auto mb-2" />

                          <p className="text-sm theme-text-muted">
                            Tidak ada menu ditemukan
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredMenus.map((menu) => (
                        <tr
                          key={menu.id}
                          className="
                            theme-table-hover
                            transition-colors
                          "
                        >
                          <td className="px-4 py-3">
                            <GripVertical
                              className="
                                w-4
                                h-4
                                theme-text-placeholder
                                cursor-grab
                              "
                            />
                          </td>

                          <td
                            className="
                              px-4
                              py-3
                              font-medium
                              theme-text
                              text-sm
                            "
                          >
                            {menu.title}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1.5
                                text-xs
                                font-medium
                                px-2.5
                                py-1
                                rounded-full
                                ${
                                  menu.type === "header"
                                    ? "theme-card-soft text-[var(--color-primary)]"
                                    : "theme-warning"
                                }
                              `}
                            >
                              {menu.type === "header" ? (
                                <Monitor className="w-3 h-3" />
                              ) : (
                                <Footprints className="w-3 h-3" />
                              )}

                              {menu.type === "header"
                                ? "Header"
                                : "Footer"}
                            </span>
                          </td>

                          <td
                            className="
                              px-4
                              py-3
                              text-sm
                              theme-text-muted
                              truncate
                              max-w-[150px]
                            "
                          >
                            {menu.url}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1.5
                                text-xs
                                font-medium
                                px-2.5
                                py-1
                                rounded-full
                                border
                                theme-border
                                ${
                                  menu.status === "aktif"
                                    ? "theme-success"
                                    : "theme-card-soft theme-text-placeholder"
                                }
                              `}
                            >
                              {menu.status === "aktif" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}

                              {menu.status === "aktif"
                                ? "Aktif"
                                : "Nonaktif"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1.5">
                              <button
                                className="
                                  p-1.5
                                  rounded-lg
                                  theme-text-muted
                                  hover:text-[var(--color-warning)]
                                  hover:bg-[var(--color-warning-background)]
                                  transition
                                "
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                className="
                                  p-1.5
                                  rounded-lg
                                  theme-text-muted
                                  hover:text-[var(--color-danger)]
                                  hover:bg-[var(--color-danger-background)]
                                  transition
                                "
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TIPS */}
            <div
              className="
                theme-info
                border
                theme-border
                rounded-2xl
                p-4
                sm:p-5
                flex
                items-start
                gap-3
              "
            >
              <Smartphone
                className="
                  w-5
                  h-5
                  text-[var(--color-info)]
                  shrink-0
                  mt-0.5
                "
              />

              <div>
                <h4
                  className="
                    text-sm
                    font-semibold
                    text-[var(--color-info)]
                  "
                >
                  Tips Manajemen Menu
                </h4>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    theme-text-secondary
                    leading-relaxed
                    mt-0.5
                  "
                >
                  Atur urutan menu dengan drag-and-drop, dan pastikan
                  semua menu utama terlihat dengan baik di perangkat
                  desktop maupun mobile.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="
                pt-4
                border-t
                theme-border
                text-center
                text-xs
                theme-text-muted
              "
            >
              © 2026 SmartSchool CMS. All rights reserved.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */
function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}) {
  return (
    <div
      className="
        theme-card
        p-4
        rounded-xl
        border
        theme-border
        shadow-sm
        hover:shadow-md
        transition
        flex
        items-center
        gap-3
      "
    >
      <div
        className={`
          p-2.5
          rounded-xl
          ${iconBg}
          ${iconColor}
        `}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className="
            text-xs
            theme-text-muted
            font-medium
            truncate
          "
        >
          {label}
        </p>

        <p
          className="
            text-lg
            font-bold
            theme-text
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}