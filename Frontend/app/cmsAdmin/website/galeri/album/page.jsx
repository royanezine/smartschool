"use client";

import { useState } from "react";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import {
  Folder,
  Plus,
  Search,
  Pencil,
  Trash2,
  Image as ImageIcon,
  LayoutGrid,
} from "lucide-react";

export default function AlbumPage() {
  // ==============================
  // SIDEBAR STATE
  // ==============================
  const [active, setActive] = useState("galeri");
  const [collapsed, setCollapsed] = useState(false);

  // ==============================
  // SEARCH STATE
  // ==============================
  const [searchTerm, setSearchTerm] = useState("");

  // ==============================
  // ALBUM DATA
  // ==============================
  const [albums] = useState([
    {
      id: 1,
      name: "Kegiatan",
      count: 12,
      color: "blue",
    },
    {
      id: 2,
      name: "Infrastruktur",
      count: 8,
      color: "indigo",
    },
    {
      id: 3,
      name: "Penghargaan",
      count: 5,
      color: "purple",
    },
    {
      id: 4,
      name: "Lainnya",
      count: 3,
      color: "green",
    },
  ]);

  // ==============================
  // FILTER
  // ==============================
  const filteredAlbums = albums.filter((album) =>
    album.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==============================
  // COLOR MAP
  // ==============================
  const colorMap = {
    blue: {
      wrapper: "bg-blue-50 border-blue-100",
      icon: "text-blue-600",
    },
    indigo: {
      wrapper: "bg-indigo-50 border-indigo-100",
      icon: "text-indigo-600",
    },
    purple: {
      wrapper: "bg-purple-50 border-purple-100",
      icon: "text-purple-600",
    },
    green: {
      wrapper: "bg-green-50 border-green-100",
      icon: "text-green-600",
    },
  };

  // ==============================
  // TOTAL FOTO
  // ==============================
  const totalPhotos = albums.reduce(
    (total, album) => total + album.count,
    0
  );

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main
        className="
          min-w-0
          flex-1
          w-full
          overflow-x-hidden
          overflow-y-auto
          bg-slate-50
          transition-all
          duration-300
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}
        <Header
          title="Album Galeri"
          user={{ name: "Admin" }}
        />

        {/* ===================================================
            CONTENT WRAPPER
        =================================================== */}
        <div
          className="
            w-full
            px-3
            py-5
            sm:px-4
            sm:py-6
            md:px-5
            lg:px-6
            lg:py-7
            xl:px-8
            2xl:px-10
          "
        >
          <div className="w-full min-w-0 space-y-5 sm:space-y-6">
            {/* =================================================
                BREADCRUMB
            ================================================= */}
            <nav
              className="
                w-full
                overflow-x-auto
                scrollbar-hide
              "
              aria-label="Breadcrumb"
            >
              <ol
                className="
                  inline-flex
                  min-w-max
                  items-center
                  gap-1.5
                  text-xs
                  text-gray-500
                  sm:text-sm
                "
              >
                <li>
                  <a
                    href="/cmsAdmin"
                    className="
                      whitespace-nowrap
                      transition-colors
                      hover:text-indigo-600
                    "
                  >
                    Dashboard
                  </a>
                </li>

                <li className="text-gray-300">/</li>

                <li>
                  <a
                    href="/cmsAdmin/website/galeri"
                    className="
                      whitespace-nowrap
                      transition-colors
                      hover:text-indigo-600
                    "
                  >
                    Galeri
                  </a>
                </li>

                <li className="text-gray-300">/</li>

                <li
                  className="
                    whitespace-nowrap
                    font-medium
                    text-indigo-600
                  "
                  aria-current="page"
                >
                  Album
                </li>
              </ol>
            </nav>

            {/* =================================================
                PAGE HEADER
            ================================================= */}
            <div
              className="
                flex
                w-full
                min-w-0
                flex-col
                gap-4
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              {/* LEFT */}
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-indigo-50
                    text-indigo-600
                    sm:h-12
                    sm:w-12
                  "
                >
                  <Folder className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      truncate
                      text-xl
                      font-bold
                      tracking-tight
                      text-gray-900
                      sm:text-2xl
                      lg:text-3xl
                    "
                  >
                    Manajemen Album
                  </h1>

                  <p
                    className="
                      mt-0.5
                      hidden
                      truncate
                      text-sm
                      text-gray-500
                      sm:block
                    "
                  >
                    Kelola folder album foto di galeri website Anda
                  </p>
                </div>
              </div>

              {/* BUTTON */}
              <button
                onClick={() =>
                  alert("Fitur Tambah Album dibuka! (Mockup)")
                }
                className="
                  inline-flex
                  w-full
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-indigo-700
                  hover:shadow-md
                  active:scale-[0.98]
                  sm:w-auto
                  sm:rounded-xl
                  sm:px-5
                "
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Album Baru</span>
              </button>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}
            <div
              className="
                grid
                w-full
                grid-cols-1
                gap-3
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {/* TOTAL ALBUM */}
              <div
                className="
                  min-w-0
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-4
                  shadow-sm
                  transition-shadow
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <Folder className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-500">
                      Total Album
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      {albums.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* TOTAL FOTO */}
              <div
                className="
                  min-w-0
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-4
                  shadow-sm
                  transition-shadow
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-indigo-50
                      text-indigo-600
                    "
                  >
                    <ImageIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-500">
                      Total Foto
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      {totalPhotos}
                    </p>
                  </div>
                </div>
              </div>

              {/* ALBUM UTAMA */}
              <div
                className="
                  min-w-0
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-4
                  shadow-sm
                  transition-shadow
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-purple-50
                      text-purple-600
                    "
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-500">
                      Album Utama
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      2
                    </p>
                  </div>
                </div>
              </div>

              {/* LAST EDIT */}
              <div
                className="
                  min-w-0
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-4
                  shadow-sm
                  transition-shadow
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-green-50
                      text-green-600
                    "
                  >
                    <Pencil className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-500">
                      Terakhir Edit
                    </p>

                    <p className="truncate text-sm font-bold text-gray-900">
                      Hari ini
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}
            <div
              className="
                w-full
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-3
                shadow-sm
                sm:p-4
              "
            >
              <div className="relative w-full sm:max-w-md">
                <Search
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  type="text"
                  placeholder="Cari nama album..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50/70
                    pl-10
                    pr-4
                    text-sm
                    text-gray-900
                    outline-none
                    transition-all
                    placeholder:text-gray-400
                    focus:border-indigo-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-500/10
                  "
                />
              </div>
            </div>

            {/* =================================================
                ALBUM GRID
            ================================================= */}
            {filteredAlbums.length > 0 ? (
              <div
                className="
                  grid
                  w-full
                  min-w-0
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                  2xl:grid-cols-5
                "
              >
                {filteredAlbums.map((album) => {
                  const colors =
                    colorMap[album.color] || colorMap.blue;

                  return (
                    <div
                      key={album.id}
                      className="
                        group
                        min-w-0
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-lg
                      "
                    >
                      {/* FOLDER HEADER */}
                      <div
                        className={`
                          flex
                          h-24
                          items-center
                          justify-center
                          border-b
                          ${colors.wrapper}
                        `}
                      >
                        <Folder
                          className={`
                            h-11
                            w-11
                            ${colors.icon}
                            opacity-90
                            transition-transform
                            duration-300
                            group-hover:scale-110
                          `}
                          strokeWidth={1.5}
                        />
                      </div>

                      {/* CARD BODY */}
                      <div className="p-4 sm:p-5">
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          {/* INFO */}
                          <div className="min-w-0 flex-1">
                            <h3
                              className="
                                truncate
                                text-base
                                font-semibold
                                text-gray-900
                              "
                            >
                              {album.name}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-gray-400">
                              {album.count} Foto
                            </p>
                          </div>

                          {/* ACTION */}
                          <div
                            className="
                              flex
                              shrink-0
                              items-center
                              gap-0.5
                            "
                          >
                            <button
                              type="button"
                              className="
                                rounded-lg
                                p-1.5
                                text-gray-400
                                transition-colors
                                hover:bg-indigo-50
                                hover:text-indigo-600
                              "
                              title="Edit Album"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              className="
                                rounded-lg
                                p-1.5
                                text-gray-400
                                transition-colors
                                hover:bg-red-50
                                hover:text-red-600
                              "
                              title="Hapus Album"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* FOOTER */}
                        <div
                          className="
                            mt-4
                            flex
                            items-center
                            justify-between
                            border-t
                            border-gray-100
                            pt-3
                          "
                        >
                          <a
                            href={`/cmsAdmin/website/galeri?album=${encodeURIComponent(
                              album.name
                            )}`}
                            className="
                              inline-flex
                              items-center
                              gap-1
                              text-xs
                              font-semibold
                              text-indigo-600
                              transition-colors
                              hover:text-indigo-800
                            "
                          >
                            Lihat Foto
                            <span className="transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </a>

                          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-300">
                            Album
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* =================================================
                  EMPTY STATE
              ================================================= */
              <div
                className="
                  flex
                  min-h-[280px]
                  w-full
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  px-5
                  py-12
                  text-center
                  shadow-sm
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                  "
                >
                  <Folder className="h-8 w-8 text-gray-400" />
                </div>

                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                  Album tidak ditemukan
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Coba ubah kata kunci pencarian Anda.
                </p>

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="
                      mt-4
                      text-sm
                      font-semibold
                      text-indigo-600
                      hover:text-indigo-800
                    "
                  >
                    Reset pencarian
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}