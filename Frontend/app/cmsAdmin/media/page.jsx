// app/cmsAdmin/media/page.jsx

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { dummyMedia } from "../../../lib/dummyData";

import {
  Image as ImageIcon,
  Search,
  X,
  Upload,
  File,
  FileText,
  Video,
  FolderOpen,
  Eye,
  Download,
  Trash2,
  LayoutGrid,
  List,
  HardDrive,
  Images,
  Film,
  FileType2,
  ChevronRight,
} from "lucide-react";

export default function MediaPage() {
  const pathname = usePathname();
  const [active, setActive] = useState("media");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [media, setMedia] = useState(dummyMedia);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredMedia = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return media;

    return media.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.folder?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query)
    );
  }, [media, searchQuery]);

  /* =========================================================
     STATISTIK
  ========================================================= */

  const totalMedia = media.length;

  const totalImages = media.filter((m) =>
    m.type?.startsWith("image/")
  ).length;

  const totalVideos = media.filter((m) =>
    m.type?.startsWith("video/")
  ).length;

  const totalPdf = media.filter(
    (m) => m.type === "application/pdf"
  ).length;

  /* =========================================================
     ACTION
  ========================================================= */

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus file ini? Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmed) return;

    setMedia((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  /* =========================================================
     FILE TYPE
  ========================================================= */

  const getFileType = (type = "") => {
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type === "application/pdf") return "pdf";

    return "default";
  };

  const getTypeConfig = (type) => {
    const configs = {
      image: {
        label: "Gambar",
        icon: ImageIcon,
        badge:
          "bg-indigo-50 text-indigo-600 border-indigo-100",
        iconBg:
          "bg-indigo-50 text-indigo-600",
      },

      video: {
        label: "Video",
        icon: Video,
        badge:
          "bg-violet-50 text-violet-600 border-violet-100",
        iconBg:
          "bg-violet-50 text-violet-600",
      },

      pdf: {
        label: "PDF",
        icon: FileText,
        badge:
          "bg-rose-50 text-rose-600 border-rose-100",
        iconBg:
          "bg-rose-50 text-rose-600",
      },

      default: {
        label: "File",
        icon: File,
        badge:
          "bg-slate-50 text-slate-600 border-slate-200",
        iconBg:
          "bg-slate-100 text-slate-500",
      },
    };

    return configs[type] || configs.default;
  };

  /* =========================================================
     FILE SIZE
  ========================================================= */

  const formatFileSize = (size) => {
    if (!size) return "-";

    if (typeof size === "string") {
      return size;
    }

    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (size >= 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${size} B`;
  };

  /* =========================================================
     STAT CARD
  ========================================================= */

  const stats = [
    {
      label: "Total Media",
      value: totalMedia,
      icon: HardDrive,
      gradient: "from-slate-900 to-slate-700",
      light: "bg-slate-50",
      text: "text-slate-700",
    },

    {
      label: "Gambar",
      value: totalImages,
      icon: Images,
      gradient: "from-indigo-500 to-blue-500",
      light: "bg-indigo-50",
      text: "text-indigo-600",
    },

    {
      label: "Video",
      value: totalVideos,
      icon: Film,
      gradient: "from-violet-500 to-purple-500",
      light: "bg-violet-50",
      text: "text-violet-600",
    },

    {
      label: "Dokumen PDF",
      value: totalPdf,
      icon: FileType2,
      gradient: "from-rose-500 to-pink-500",
      light: "bg-rose-50",
      text: "text-rose-600",
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex min-h-screen w-full bg-slate-50">

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
          CONTENT AREA
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* ===================================================
            HEADER - akan menampilkan CMS Admin otomatis
        =================================================== */}

        <Header
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="min-w-0 flex-1">

          <div className="w-full px-3 py-4 sm:px-5 sm:py-5 md:px-7 md:py-7 lg:px-8 lg:py-8 xl:px-10">

            <div className="mx-auto w-full max-w-[1700px]">

              {/* =================================================
                  BREADCRUMB
              ================================================= */}

              <div className="mb-5 flex items-center gap-2 overflow-hidden text-xs text-slate-400 sm:text-sm">

                <Link
                  href="/cmsAdmin"
                  className="shrink-0 transition-colors hover:text-indigo-600"
                >
                  Dashboard
                </Link>

                <ChevronRight className="h-3.5 w-3.5 shrink-0" />

                <span className="truncate font-medium text-slate-600">
                  Media
                </span>

              </div>

              {/* =================================================
                  HERO
              ================================================= */}

              <section className="relative mb-6 overflow-hidden rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 shadow-xl shadow-indigo-900/10">

                {/* Decorative */}
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-400/15 blur-2xl" />

                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="relative p-5 sm:p-6 md:p-8 lg:p-9">

                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                    {/* TITLE */}

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner backdrop-blur-md sm:h-14 sm:w-14">

                        <ImageIcon className="h-6 w-6 text-white sm:h-7 sm:w-7" />

                      </div>

                      <div className="min-w-0">

                        <div className="mb-1 flex items-center gap-2">

                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200 sm:text-xs">
                            CMS Management
                          </span>

                          <span className="h-1 w-1 rounded-full bg-indigo-300" />

                          <span className="text-[10px] font-medium text-indigo-200 sm:text-xs">
                            Media Library
                          </span>

                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                          Media
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-indigo-100 sm:text-sm">
                          Kelola gambar, video, dokumen, dan seluruh aset
                          digital website sekolah dalam satu tempat.
                        </p>

                      </div>
                    </div>

                    {/* UPLOAD */}

                    <Link
                      href="/cmsAdmin/media/upload"
                      className="
                        inline-flex
                        w-full
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-white
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-indigo-700
                        shadow-lg
                        shadow-black/10
                        transition-all
                        hover:-translate-y-0.5
                        hover:bg-indigo-50
                        hover:shadow-xl
                        sm:w-fit
                      "
                    >
                      <Upload className="h-4 w-4" />
                      Upload Media
                    </Link>

                  </div>
                </div>
              </section>

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="mb-6 grid w-full grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">

                {stats.map((stat) => {

                  const StatIcon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="
                        group
                        relative
                        min-w-0
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200/80
                        bg-white
                        p-4
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:shadow-lg
                        sm:p-5
                      "
                    >

                      <div
                        className={`absolute right-0 top-0 h-20 w-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.04] blur-xl`}
                      />

                      <div className="relative flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.light} ${stat.text}`}
                        >
                          <StatIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                            {stat.label}
                          </p>

                          <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                            {stat.value}
                          </p>

                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>

              {/* =================================================
                  TOOLBAR
              ================================================= */}

              <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                  {/* SEARCH */}

                  <div className="relative w-full min-w-0 lg:max-w-xl">

                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      placeholder="Cari nama file, folder, atau tipe..."
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50/60
                        py-2.5
                        pl-10
                        pr-10
                        text-sm
                        text-slate-700
                        outline-none
                        transition-all
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-indigo-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-indigo-500/10
                      "
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          rounded-md
                          p-1
                          text-slate-400
                          transition
                          hover:bg-slate-100
                          hover:text-slate-600
                        "
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                  </div>

                  {/* RIGHT TOOLBAR */}

                  <div className="flex items-center justify-between gap-3 lg:justify-end">

                    <p className="text-xs text-slate-400">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-700">
                        {filteredMedia.length}
                      </span>{" "}
                      file
                    </p>

                    <div className="inline-flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">

                      <button
                        type="button"
                        onClick={() => setViewMode("table")}
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          transition-all
                          ${
                            viewMode === "table"
                              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                          }
                        `}
                      >
                        <List className="h-3.5 w-3.5" />

                        <span className="hidden sm:inline">
                          List
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          transition-all
                          ${
                            viewMode === "grid"
                              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                          }
                        `}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />

                        <span className="hidden sm:inline">
                          Grid
                        </span>
                      </button>

                    </div>
                  </div>

                </div>
              </section>

              {/* =================================================
                  EMPTY STATE
              ================================================= */}

              {filteredMedia.length === 0 ? (

                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">

                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <File className="h-7 w-7 text-slate-400" />
                  </div>

                  <h3 className="text-base font-bold text-slate-800">
                    {searchQuery
                      ? "Media tidak ditemukan"
                      : "Belum ada file media"}
                  </h3>

                  <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-400">
                    {searchQuery
                      ? "Coba gunakan kata kunci pencarian yang berbeda."
                      : "Upload gambar, video, atau dokumen pertama Anda ke media library."}
                  </p>

                  {searchQuery ? (

                    <button
                      type="button"
                      onClick={clearSearch}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      <X className="h-4 w-4" />
                      Reset Pencarian
                    </button>

                  ) : (

                    <Link
                      href="/cmsAdmin/media/upload"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Media
                    </Link>

                  )}

                </div>

              ) : viewMode === "grid" ? (

                /* =================================================
                    GRID VIEW
                ================================================= */

                <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">

                  {filteredMedia.map((item) => {

                    const type = getFileType(item.type);
                    const config = getTypeConfig(type);
                    const TypeIcon = config.icon;

                    return (

                      <div
                        key={item.id}
                        className="
                          group
                          min-w-0
                          overflow-hidden
                          rounded-2xl
                          border
                          border-slate-200
                          bg-white
                          shadow-sm
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:border-indigo-200
                          hover:shadow-xl
                        "
                      >

                        {/* PREVIEW */}

                        <div className="relative aspect-square overflow-hidden bg-slate-100">

                          {type === "image" && item.url ? (

                            <img
                              src={item.url}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                          ) : (

                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">

                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconBg}`}
                              >
                                <TypeIcon className="h-7 w-7" />
                              </div>

                            </div>

                          )}

                          {/* OVERLAY */}

                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/30 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-lg transition hover:scale-105 hover:text-indigo-600"
                              title="Lihat"
                            >
                              <Eye className="h-4 w-4" />
                            </a>

                            <a
                              href={item.url}
                              download
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-lg transition hover:scale-105 hover:text-blue-600"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-lg transition hover:scale-105 hover:text-rose-600"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>

                          {/* FOLDER */}

                          <div className="absolute left-2 top-2 max-w-[calc(100%-1rem)]">

                            <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-white/60 bg-white/85 px-2 py-1 text-[9px] font-semibold text-slate-600 shadow-sm backdrop-blur-md">

                              <FolderOpen className="h-3 w-3 shrink-0" />

                              <span className="truncate">
                                {item.folder || "Media"}
                              </span>

                            </span>

                          </div>

                        </div>

                        {/* INFO */}

                        <div className="min-w-0 p-3">

                          <p
                            title={item.name}
                            className="truncate text-xs font-semibold text-slate-800 sm:text-sm"
                          >
                            {item.name}
                          </p>

                          <div className="mt-2 flex min-w-0 items-center justify-between gap-2">

                            <span className="truncate text-[10px] font-medium text-slate-400">
                              {formatFileSize(item.size)}
                            </span>

                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${config.badge}`}
                            >
                              {config.label}
                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

              ) : (

                /* =================================================
                    TABLE VIEW
                ================================================= */

                <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  <div className="w-full overflow-x-auto">

                    <table className="w-full min-w-[680px] text-left">

                      <thead>

                        <tr className="border-b border-slate-100 bg-slate-50/80">

                          <th className="px-4 py-4 sm:px-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              File
                            </span>
                          </th>

                          <th className="hidden px-5 py-4 md:table-cell">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Tipe
                            </span>
                          </th>

                          <th className="hidden px-5 py-4 lg:table-cell">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Ukuran
                            </span>
                          </th>

                          <th className="hidden px-5 py-4 lg:table-cell">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Folder
                            </span>
                          </th>

                          <th className="px-4 py-4 text-right sm:px-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Aksi
                            </span>
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {filteredMedia.map((item) => {

                          const type = getFileType(item.type);
                          const config = getTypeConfig(type);
                          const TypeIcon = config.icon;

                          return (

                            <tr
                              key={item.id}
                              className="group transition-colors hover:bg-indigo-50/30"
                            >

                              {/* FILE */}

                              <td className="px-4 py-4 sm:px-5">

                                <div className="flex min-w-0 items-center gap-3">

                                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">

                                    {type === "image" &&
                                    item.url ? (

                                      <img
                                        src={item.url}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                      />

                                    ) : (

                                      <div className="flex h-full w-full items-center justify-center">
                                        <TypeIcon className="h-5 w-5 text-slate-400" />
                                      </div>

                                    )}

                                  </div>

                                  <div className="min-w-0">

                                    <p
                                      title={item.name}
                                      className="max-w-[260px] truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-600"
                                    >
                                      {item.name}
                                    </p>

                                    <div className="mt-1 flex flex-wrap items-center gap-2 md:hidden">

                                      <span
                                        className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${config.badge}`}
                                      >
                                        {config.label}
                                      </span>

                                      <span className="text-[10px] text-slate-400">
                                        {formatFileSize(item.size)}
                                      </span>

                                    </div>

                                  </div>

                                </div>

                              </td>

                              {/* TYPE */}

                              <td className="hidden px-5 py-4 md:table-cell">

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.badge}`}
                                >
                                  <TypeIcon className="h-3 w-3" />
                                  {config.label}
                                </span>

                              </td>

                              {/* SIZE */}

                              <td className="hidden px-5 py-4 text-xs font-medium text-slate-500 lg:table-cell">
                                {formatFileSize(item.size)}
                              </td>

                              {/* FOLDER */}

                              <td className="hidden px-5 py-4 lg:table-cell">

                                <span className="inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">

                                  <FolderOpen className="h-3 w-3 shrink-0 text-slate-400" />

                                  <span className="truncate">
                                    {item.folder || "Media"}
                                  </span>

                                </span>

                              </td>

                              {/* ACTION */}

                              <td className="px-4 py-4 text-right sm:px-5">

                                <div className="flex items-center justify-end gap-1">

                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Lihat"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </a>

                                  <a
                                    href={item.url}
                                    download
                                    title="Download"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(item.id)
                                    }
                                    title="Hapus"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        })}

                      </tbody>

                    </table>

                  </div>

                  {/* FOOTER */}

                  <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                    <span className="text-[10px] font-medium text-slate-400">
                      Menampilkan {filteredMedia.length} dari{" "}
                      {totalMedia} media
                    </span>

                    <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-[9px] font-semibold text-slate-400">
                      Data simulasi
                    </span>

                  </div>

                </div>
              )}

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="py-8 text-center">

                <p className="text-[11px] font-medium text-slate-400">
                  © 2026 SmartSchool • CMS Media Management
                </p>

              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}