// app/cmsAdmin/website/galeri/page.jsx
"use client";

import { useState } from "react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Image as ImageIcon,
  Plus,
  Folder,
  Tags,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  X,
} from "lucide-react";

export default function GaleriPage() {
  // =====================================================
  // SIDEBAR
  // =====================================================

  const [active, setActive] = useState("galeri");
  const [collapsed, setCollapsed] = useState(false);

  // =====================================================
  // SEARCH & FILTER
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [filterAlbum, setFilterAlbum] = useState("Semua");

  // =====================================================
  // DATA GALERI
  // =====================================================

  const [galeri] = useState([
    {
      id: 1,
      judul: "Upacara 17 Agustus",
      foto:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
      album: "Kegiatan",
      kategori: "Dokumentasi",
    },
    {
      id: 2,
      judul: "Kunjungan Industri",
      foto:
        "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&h=600&fit=crop",
      album: "Kegiatan",
      kategori: "Dokumentasi",
    },
    {
      id: 3,
      judul: "Gedung Baru",
      foto:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
      album: "Infrastruktur",
      kategori: "Bangunan",
    },
    {
      id: 4,
      judul: "Perpustakaan Digital",
      foto:
        "https://images.unsplash.com/photo-1507842217121-9e1f7eb122b2?w=800&h=600&fit=crop",
      album: "Infrastruktur",
      kategori: "Fasilitas",
    },
    {
      id: 5,
      judul: "Rapat Tahunan",
      foto:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
      album: "Kegiatan",
      kategori: "Rapat",
    },
    {
      id: 6,
      judul: "Penghargaan Pegawai",
      foto:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
      album: "Penghargaan",
      kategori: "Apresiasi",
    },
    {
      id: 7,
      judul: "Kegiatan Siswa",
      foto:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
      album: "Kegiatan",
      kategori: "Dokumentasi",
    },
    {
      id: 8,
      judul: "Laboratorium Komputer",
      foto:
        "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=800&h=600&fit=crop",
      album: "Fasilitas",
      kategori: "Laboratorium",
    },
  ]);

  // =====================================================
  // FILTER DATA
  // =====================================================

  const filteredGaleri = galeri.filter((item) => {
    const matchSearch = item.judul
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchAlbum =
      filterAlbum === "Semua" || item.album === filterAlbum;

    return matchSearch && matchAlbum;
  });

  // =====================================================
  // ALBUM LIST
  // =====================================================

  const albumList = [
    "Semua",
    ...new Set(galeri.map((item) => item.album)),
  ];

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="flex min-h-screen w-full theme-page overflow-x-hidden">
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="flex-1 min-w-0 w-full theme-page">
        {/* =================================================
            HEADER
        ================================================= */}

        <Header
          title="Galeri"
          user={{ name: "Admin" }}
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="w-full min-w-0 theme-page">
          <div
            className="
              w-full
              px-3
              sm:px-4
              md:px-5
              lg:px-6
              xl:px-8
              2xl:px-10
              py-4
              sm:py-6
              lg:py-8
            "
          >
            {/* =================================================
                BREADCRUMB
            ================================================= */}

            <nav
              className="
                flex
                items-center
                flex-wrap
                gap-1
                text-xs
                sm:text-sm
                theme-text-muted
                mb-5
                sm:mb-6
              "
              aria-label="Breadcrumb"
            >
              <a
                href="/cmsAdmin"
                className="
                  theme-text-muted
                  hover:text-[var(--color-primary)]
                  transition
                "
              >
                Dashboard
              </a>

              <span className="mx-1 theme-text-placeholder">
                /
              </span>

              <a
                href="/cmsAdmin/website"
                className="
                  theme-text-muted
                  hover:text-[var(--color-primary)]
                  transition
                "
              >
                Website
              </a>

              <span className="mx-1 theme-text-placeholder">
                /
              </span>

              <span className="theme-sidebar-text-active font-medium">
                Galeri
              </span>
            </nav>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-4
                mb-6
              "
            >
              {/* TITLE */}

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="
                    w-10
                    h-10
                    sm:w-11
                    sm:h-11
                    rounded-xl
                    theme-info
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      text-xl
                      sm:text-2xl
                      lg:text-3xl
                      font-bold
                      theme-text
                    "
                  >
                    Manajemen Galeri
                  </h1>

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      theme-text-muted
                      mt-1
                    "
                  >
                    Kelola semua foto, album, dan kategori website
                  </p>
                </div>
              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-3
                  lg:flex
                  gap-2
                  w-full
                  lg:w-auto
                "
              >
                <a
                  href="/cmsAdmin/website/galeri/tambah"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    theme-primary
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    shadow-sm
                    hover:shadow-md
                    transition-all
                  "
                >
                  <Plus className="w-4 h-4" />
                  Tambah Foto
                </a>

                <a
                  href="/cmsAdmin/website/galeri/album"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    theme-border
                    theme-card
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    theme-text-secondary
                    shadow-sm
                    theme-header-hover
                    transition
                  "
                >
                  <Folder className="w-4 h-4" />
                  Album
                </a>

                <a
                  href="/cmsAdmin/website/galeri/kategori"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    theme-border
                    theme-card
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    theme-text-secondary
                    shadow-sm
                    theme-header-hover
                    transition
                  "
                >
                  <Tags className="w-4 h-4" />
                  Kategori
                </a>
              </div>
            </div>

            {/* =================================================
                STATISTIK
            ================================================= */}

            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-2
                lg:grid-cols-4
                gap-3
                sm:gap-4
                mb-6
              "
            >
              <StatCard
                icon={
                  <ImageIcon className="w-5 h-5 text-[var(--color-info)]" />
                }
                label="Total Foto"
                value={galeri.length}
                bg="theme-info"
              />

              <StatCard
                icon={
                  <Folder className="w-5 h-5 text-[var(--color-primary)]" />
                }
                label="Total Album"
                value="4"
                bg="theme-card-soft"
              />

              <StatCard
                icon={
                  <Tags className="w-5 h-5 text-[var(--color-warning)]" />
                }
                label="Kategori"
                value="5"
                bg="theme-warning"
              />

              <StatCard
                icon={
                  <LayoutGrid className="w-5 h-5 text-[var(--color-success)]" />
                }
                label="Terbaru"
                value="Hari ini"
                bg="theme-success"
              />
            </div>

            {/* =================================================
                SEARCH & FILTER
            ================================================= */}

            <div
              className="
                w-full
                theme-card
                rounded-2xl
                border
                theme-border
                shadow-sm
                p-3
                sm:p-4
                mb-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  gap-3
                  md:items-center
                  md:justify-between
                "
              >
                {/* SEARCH */}

                <div
                  className="
                    relative
                    w-full
                    md:flex-1
                    md:max-w-xl
                  "
                >
                  <Search
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
                    placeholder="Cari foto atau judul..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="
                      w-full
                      pl-10
                      pr-10
                      py-2.5
                      border
                      theme-input
                      rounded-xl
                      text-sm
                      focus:outline-none
                      focus:border-[var(--color-primary)]
                      transition
                    "
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-muted
                        hover:text-[var(--color-text)]
                      "
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* FILTER */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    w-full
                    md:w-auto
                  "
                >
                  <Filter
                    className="
                      w-4
                      h-4
                      theme-text-muted
                      shrink-0
                    "
                  />

                  <select
                    value={filterAlbum}
                    onChange={(e) =>
                      setFilterAlbum(e.target.value)
                    }
                    className="
                      w-full
                      md:w-48
                      px-3
                      py-2.5
                      border
                      theme-input
                      rounded-xl
                      text-sm
                      focus:outline-none
                      focus:border-[var(--color-primary)]
                    "
                  >
                    {albumList.map((album) => (
                      <option
                        key={album}
                        value={album}
                      >
                        {album}
                      </option>
                    ))}
                  </select>

                  <span
                    className="
                      hidden
                      lg:block
                      text-xs
                      theme-text-muted
                      whitespace-nowrap
                    "
                  >
                    {filteredGaleri.length} data
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                RESULT INFO
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                mb-4
              "
            >
              <div>
                <h2
                  className="
                    text-base
                    sm:text-lg
                    font-semibold
                    theme-text
                  "
                >
                  Semua Galeri
                </h2>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    theme-text-muted
                    mt-0.5
                  "
                >
                  Menampilkan {filteredGaleri.length} foto
                </p>
              </div>

              <div
                className="
                  text-xs
                  theme-text-muted
                  hidden
                  sm:block
                "
              >
                {filterAlbum === "Semua"
                  ? "Semua album"
                  : filterAlbum}
              </div>
            </div>

            {/* =================================================
                GALLERY GRID
            ================================================= */}

            {filteredGaleri.length > 0 ? (
              <div
                className="
                  grid
                  grid-cols-1
                  min-[480px]:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                  2xl:grid-cols-5
                  gap-3
                  sm:gap-4
                  lg:gap-5
                "
              >
                {filteredGaleri.map((item) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            ) : (
              /* =================================================
                  EMPTY STATE
              ================================================= */

              <div
                className="
                  w-full
                  theme-card
                  rounded-2xl
                  border
                  theme-border
                  shadow-sm
                  p-8
                  sm:p-12
                  text-center
                "
              >
                <div
                  className="
                    inline-flex
                    items-center
                    justify-center
                    w-16
                    h-16
                    theme-card-soft
                    rounded-full
                    mb-4
                  "
                >
                  <ImageIcon
                    className="w-8 h-8 theme-text-muted"
                  />
                </div>

                <h3
                  className="
                    text-lg
                    font-semibold
                    theme-text
                  "
                >
                  Tidak ada foto ditemukan
                </h3>

                <p
                  className="
                    text-sm
                    theme-text-muted
                    mt-1
                  "
                >
                  Coba ubah kata kunci pencarian atau filter
                  album.
                </p>

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="
                      mt-4
                      text-sm
                      font-medium
                      text-[var(--color-primary)]
                      hover:text-[var(--color-primary-hover)]
                    "
                  >
                    Reset pencarian
                  </button>
                )}
              </div>
            )}

            {/* =================================================
                FOOTER
            ================================================= */}

            <div
              className="
                mt-8
                sm:mt-10
                pt-5
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

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  label,
  value,
  bg,
}) {
  return (
    <div
      className={`
        ${bg}
        w-full
        min-w-0
        rounded-2xl
        border
        theme-border
        p-3
        sm:p-4
        shadow-sm
        hover:shadow-md
        transition
      `}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-xl
            theme-card
            flex
            items-center
            justify-center
            shadow-sm
            shrink-0
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p
            className="
              text-[10px]
              sm:text-xs
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
              sm:text-xl
              font-bold
              theme-text
              truncate
            "
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// GALLERY CARD
// =====================================================

function GalleryCard({ item }) {
  return (
    <div
      className="
        group
        relative
        w-full
        min-w-0
        theme-card
        rounded-2xl
        shadow-sm
        border
        theme-border
        overflow-hidden
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >
      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="
          relative
          w-full
          aspect-[4/3]
          overflow-hidden
          theme-card-soft
        "
      >
        <img
          src={item.foto}
          alt={item.judul}
          loading="lazy"
          className="
            w-full
            h-full
            object-cover
            group-hover:scale-105
            transition-transform
            duration-500
          "
        />

        {/* ALBUM BADGE */}

        <div
          className="
            absolute
            top-2.5
            left-2.5
            sm:top-3
            sm:left-3
            px-2
            py-1
            bg-black/60
            backdrop-blur-sm
            text-white
            text-[9px]
            sm:text-[10px]
            font-medium
            rounded-full
            max-w-[70%]
            truncate
          "
        >
          {item.album}
        </div>

        {/* =================================================
            HOVER OVERLAY
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/70
            via-black/10
            to-transparent
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-300
            flex
            items-end
            p-3
            gap-2
          "
        >
          <button
            type="button"
            title="Lihat Detail"
            className="
              w-9
              h-9
              flex
              items-center
              justify-center
              bg-white/90
              backdrop-blur-sm
              rounded-full
              hover:bg-white
              hover:scale-105
              transition
              text-gray-700
            "
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Edit"
            className="
              w-9
              h-9
              flex
              items-center
              justify-center
              bg-[var(--color-primary)]
              rounded-full
              hover:bg-[var(--color-primary-hover)]
              hover:scale-105
              transition
              text-white
            "
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Hapus"
            className="
              w-9
              h-9
              flex
              items-center
              justify-center
              bg-[var(--color-danger)]
              rounded-full
              hover:opacity-90
              hover:scale-105
              transition
              text-white
            "
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =================================================
          CARD BODY
      ================================================= */}

      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="
                font-semibold
                theme-text
                text-sm
                truncate
                mb-1
              "
              title={item.judul}
            >
              {item.judul}
            </h3>

            <p
              className="
                text-[9px]
                sm:text-[10px]
                theme-text-muted
                uppercase
                tracking-wider
                font-medium
                truncate
              "
            >
              {item.kategori}
            </p>
          </div>

          <button
            type="button"
            title="Menu"
            className="
              w-7
              h-7
              flex
              items-center
              justify-center
              rounded-lg
              theme-text-muted
              theme-header-hover
              hover:text-[var(--color-text)]
              transition
              shrink-0
            "
          >
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}