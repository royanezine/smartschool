"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import { dummyBanners } from "../../../../../lib/dummyData";

import {
  LayoutPanelTop,
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  CheckCircle2,
  FileEdit,
  Image as ImageIcon,
} from "lucide-react";

export default function BannersPage() {
  const [active, setActive] = useState("banners");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [banners, setBanners] = useState(dummyBanners);

  const filteredBanners = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return banners;

    return banners.filter((banner) =>
      banner.title?.toLowerCase().includes(query)
    );
  }, [banners, searchQuery]);

  const totalBanners = banners.length;

  const activeBanners = banners.filter(
    (banner) => banner.status === "active"
  ).length;

  const draftBanners = banners.filter(
    (banner) => banner.status === "draft"
  ).length;

  const handleDelete = (id) => {
    if (
      !confirm(
        "Yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }

    setBanners((prev) => prev.filter((banner) => banner.id !== id));
  };

  const getPositionStyle = (position) => {
    const normalizedPosition = position?.toLowerCase();

    if (normalizedPosition === "hero") {
      return "theme-info";
    }

    if (normalizedPosition === "promo") {
      return "theme-warning";
    }

    if (normalizedPosition === "news") {
      return "theme-success";
    }

    return "theme-card-soft theme-text-muted";
  };

  const getStatusStyle = (status) => {
    if (status === "active") {
      return "theme-success";
    }

    return "theme-card-soft theme-text-muted";
  };

  return (
    <div className="flex min-h-screen w-full theme-page">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col theme-page">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Header
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        <main className="min-w-0 flex-1 theme-page">
          <div
            className="
              w-full
              min-w-0
              px-3
              py-4
              sm:px-5
              sm:py-5
              md:px-7
              md:py-7
              lg:px-8
              lg:py-8
            "
          >
            <div className="mx-auto w-full max-w-[1800px]">
              {/* =================================================
                  TOP BAR
              ================================================= */}

              <div
                className="
                  mb-6
                  flex
                  flex-col
                  gap-4
                  xl:mb-8
                  xl:flex-row
                  xl:items-center
                  xl:justify-between
                "
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      theme-info
                      sm:h-12
                      sm:w-12
                    "
                  >
                    <LayoutPanelTop className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.18em]
                          theme-text-active
                          sm:text-xs
                        "
                        style={{
                          color: "var(--color-primary)",
                        }}
                      >
                        CMS Management
                      </span>

                      <span
                        className="h-1 w-1 rounded-full"
                        style={{
                          backgroundColor:
                            "var(--color-text-placeholder)",
                        }}
                      />

                      <span className="text-[10px] font-medium theme-text-muted sm:text-xs">
                        Banner
                      </span>
                    </div>

                    <h1 className="truncate text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                      Daftar Banner
                    </h1>

                    <p className="mt-1 text-xs leading-relaxed theme-text-secondary sm:text-sm">
                      Kelola banner website sekolah dengan mudah dan
                      terorganisir.
                    </p>
                  </div>
                </div>

                <Link
                  href="/cmsAdmin/banners/tambah"
                  className="
                    theme-primary
                    inline-flex
                    w-full
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    shadow-sm
                    transition
                    sm:w-fit
                  "
                >
                  <Plus className="h-4 w-4" />
                  Tambah Banner
                </Link>
              </div>

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mb-8">
                {/* TOTAL */}

                <div
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    theme-border
                    theme-card
                    p-4
                    shadow-sm
                    transition-all
                    hover:-translate-y-0.5
                    sm:p-5
                  "
                >
                  <div
                    className="
                      absolute
                      -right-5
                      -top-5
                      h-20
                      w-20
                      rounded-full
                      blur-2xl
                    "
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-primary) 5%, transparent)",
                    }}
                  />

                  <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-info">
                      <LayoutGrid className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted sm:text-xs">
                        Total Banner
                      </p>

                      <p className="mt-0.5 text-2xl font-bold theme-text">
                        {totalBanners}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIVE */}

                <div
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    theme-border
                    theme-card
                    p-4
                    shadow-sm
                    transition-all
                    hover:-translate-y-0.5
                    sm:p-5
                  "
                >
                  <div
                    className="
                      absolute
                      -right-5
                      -top-5
                      h-20
                      w-20
                      rounded-full
                      blur-2xl
                    "
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-success) 5%, transparent)",
                    }}
                  />

                  <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-success">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted sm:text-xs">
                        Active
                      </p>

                      <p
                        className="mt-0.5 text-2xl font-bold"
                        style={{
                          color: "var(--color-success)",
                        }}
                      >
                        {activeBanners}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DRAFT */}

                <div
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    theme-border
                    theme-card
                    p-4
                    shadow-sm
                    transition-all
                    hover:-translate-y-0.5
                    sm:p-5
                  "
                >
                  <div
                    className="
                      absolute
                      -right-5
                      -top-5
                      h-20
                      w-20
                      rounded-full
                      blur-2xl
                    "
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-text-muted) 5%, transparent)",
                    }}
                  />

                  <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-card-soft theme-text-muted">
                      <FileEdit className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted sm:text-xs">
                        Draft
                      </p>

                      <p className="mt-0.5 text-2xl font-bold theme-text-secondary">
                        {draftBanners}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SEARCH
              ================================================= */}

              <section
                className="
                  mb-5
                  rounded-2xl
                  border
                  theme-border
                  theme-card
                  p-3
                  shadow-sm
                  sm:p-4
                "
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full min-w-0 lg:max-w-xl">
                    <Search
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        theme-text-muted
                      "
                    />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari berdasarkan judul banner..."
                      className="
                        theme-input
                        w-full
                        rounded-xl
                        border
                        py-2.5
                        pl-10
                        pr-10
                        text-sm
                        outline-none
                        transition
                        placeholder:theme-text-placeholder
                      "
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="
                          absolute
                          right-3
                          top-1/2
                          flex
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-md
                          p-1
                          theme-text-muted
                          transition
                          theme-table-hover
                        "
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs theme-text-muted">
                      Menampilkan{" "}
                      <span className="font-semibold theme-text-secondary">
                        {filteredBanners.length}
                      </span>{" "}
                      banner
                    </p>

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="
                          text-xs
                          font-semibold
                          transition
                        "
                        style={{
                          color: "var(--color-primary)",
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  BANNER LIST
              ================================================= */}

              {filteredBanners.length === 0 ? (
                <div
                  className="
                    rounded-2xl
                    border
                    theme-border
                    theme-card
                    px-5
                    py-16
                    text-center
                    shadow-sm
                  "
                >
                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      theme-card-soft
                    "
                  >
                    <LayoutPanelTop className="h-7 w-7 theme-text-muted" />
                  </div>

                  <h3 className="text-base font-bold theme-text sm:text-lg">
                    {searchQuery
                      ? "Banner tidak ditemukan"
                      : "Belum ada banner"}
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed theme-text-muted">
                    {searchQuery
                      ? "Coba gunakan kata kunci pencarian yang berbeda."
                      : "Tambahkan banner pertama untuk mempercantik tampilan website sekolah."}
                  </p>

                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        theme-card-soft
                        px-4
                        py-2.5
                        text-xs
                        font-semibold
                        theme-text-secondary
                        transition
                        theme-table-hover
                      "
                    >
                      <X className="h-4 w-4" />
                      Reset Pencarian
                    </button>
                  ) : (
                    <Link
                      href="/cmsAdmin/banners/tambah"
                      className="
                        theme-primary
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        px-4
                        py-2.5
                        text-xs
                        font-semibold
                        shadow-sm
                        transition
                      "
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Banner
                    </Link>
                  )}
                </div>
              ) : (
                <section
                  className="
                    w-full
                    min-w-0
                    overflow-hidden
                    rounded-2xl
                    border
                    theme-border
                    theme-card
                    shadow-sm
                  "
                >
                  {/* =================================================
                      DESKTOP TABLE
                  ================================================= */}

                  <div className="hidden w-full overflow-x-auto sm:block">
                    <table className="w-full min-w-[720px] text-left">
                      <thead>
                        <tr className="border-b theme-border theme-table-header">
                          <th className="px-5 py-4 sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                              Banner
                            </span>
                          </th>

                          <th className="px-5 py-4 sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                              Judul
                            </span>
                          </th>

                          <th className="hidden px-5 py-4 md:table-cell sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                              Posisi
                            </span>
                          </th>

                          <th className="hidden px-5 py-4 lg:table-cell sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                              Status
                            </span>
                          </th>

                          <th className="px-5 py-4 text-right sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                              Aksi
                            </span>
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {filteredBanners.map((banner) => (
                          <tr
                            key={banner.id}
                            className="group transition-colors theme-table-hover"
                          >
                            {/* IMAGE */}

                            <td className="px-5 py-4 sm:px-6">
                              <div
                                className="
                                  h-14
                                  w-24
                                  shrink-0
                                  overflow-hidden
                                  rounded-xl
                                  border
                                  theme-border
                                  theme-card-soft
                                  shadow-sm
                                "
                              >
                                {banner.image ? (
                                  <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="
                                      h-full
                                      w-full
                                      object-cover
                                      transition-transform
                                      duration-300
                                      group-hover:scale-105
                                    "
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImageIcon className="h-5 w-5 theme-text-muted" />
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* TITLE */}

                            <td className="px-5 py-4 sm:px-6">
                              <div className="min-w-0">
                                <p
                                  title={banner.title}
                                  className="
                                    max-w-[300px]
                                    truncate
                                    text-sm
                                    font-semibold
                                    theme-text
                                    transition-colors
                                  "
                                >
                                  {banner.title}
                                </p>

                                <p className="mt-1 text-[10px] theme-text-muted">
                                  Banner Website
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
                                  <span
                                    className={`
                                      inline-flex
                                      items-center
                                      gap-1.5
                                      rounded-full
                                      px-2.5
                                      py-1
                                      text-[9px]
                                      font-semibold
                                      ${getStatusStyle(
                                        banner.status
                                      )}
                                    `}
                                  >
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{
                                        backgroundColor:
                                          banner.status ===
                                          "active"
                                            ? "var(--color-success)"
                                            : "var(--color-text-placeholder)",
                                      }}
                                    />

                                    {banner.status === "active"
                                      ? "Active"
                                      : "Draft"}
                                  </span>

                                  <span
                                    className={`
                                      rounded-full
                                      px-2.5
                                      py-1
                                      text-[9px]
                                      font-semibold
                                      capitalize
                                      ${getPositionStyle(
                                        banner.position
                                      )}
                                    `}
                                  >
                                    {banner.position}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* POSITION */}

                            <td className="hidden px-5 py-4 md:table-cell sm:px-6">
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-semibold
                                  capitalize
                                  ${getPositionStyle(
                                    banner.position
                                  )}
                                `}
                              >
                                <LayoutPanelTop className="h-3 w-3" />
                                {banner.position}
                              </span>
                            </td>

                            {/* STATUS */}

                            <td className="hidden px-5 py-4 lg:table-cell sm:px-6">
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-semibold
                                  ${getStatusStyle(
                                    banner.status
                                  )}
                                `}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      banner.status === "active"
                                        ? "var(--color-success)"
                                        : "var(--color-text-placeholder)",
                                  }}
                                />

                                {banner.status === "active"
                                  ? "Active"
                                  : "Draft"}
                              </span>
                            </td>

                            {/* ACTION */}

                            <td className="px-5 py-4 text-right sm:px-6">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/cmsAdmin/banners/${banner.id}/preview`}
                                  target="_blank"
                                  title="Preview"
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    theme-text-muted
                                    transition
                                    theme-table-hover
                                  "
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>

                                <Link
                                  href={`/cmsAdmin/banners/${banner.id}/edit`}
                                  title="Edit"
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    theme-text-muted
                                    transition
                                    theme-table-hover
                                  "
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(banner.id)
                                  }
                                  title="Hapus"
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    theme-text-muted
                                    transition
                                    theme-danger
                                  "
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* =================================================
                      MOBILE VIEW
                  ================================================= */}

                  <div className="divide-y sm:hidden">
                    {filteredBanners.map((banner) => (
                      <div
                        key={banner.id}
                        className="
                          p-4
                          transition-colors
                          theme-table-hover
                        "
                      >
                        <div className="flex items-start gap-3">
                          {/* IMAGE */}

                          <div
                            className="
                              h-12
                              w-20
                              shrink-0
                              overflow-hidden
                              rounded-xl
                              border
                              theme-border
                              theme-card-soft
                            "
                          >
                            {banner.image ? (
                              <img
                                src={banner.image}
                                alt={banner.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-4 w-4 theme-text-muted" />
                              </div>
                            )}
                          </div>

                          {/* INFO */}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold theme-text">
                              {banner.title}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  px-2
                                  py-1
                                  text-[9px]
                                  font-semibold
                                  ${getStatusStyle(
                                    banner.status
                                  )}
                                `}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      banner.status === "active"
                                        ? "var(--color-success)"
                                        : "var(--color-text-placeholder)",
                                  }}
                                />

                                {banner.status === "active"
                                  ? "Active"
                                  : "Draft"}
                              </span>

                              <span
                                className={`
                                  rounded-full
                                  px-2
                                  py-1
                                  text-[9px]
                                  font-semibold
                                  capitalize
                                  ${getPositionStyle(
                                    banner.position
                                  )}
                                `}
                              >
                                {banner.position}
                              </span>
                            </div>
                          </div>

                          {/* ACTION */}

                          <div className="flex shrink-0 items-center gap-1">
                            <Link
                              href={`/cmsAdmin/banners/${banner.id}/edit`}
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                theme-text-muted
                                transition
                                theme-table-hover
                              "
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(banner.id)
                              }
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                theme-text-muted
                                transition
                                theme-danger
                              "
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* =================================================
                      TABLE FOOTER
                  ================================================= */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-2
                      border-t
                      theme-border
                      theme-card-soft
                      px-4
                      py-3
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      sm:px-6
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        text-[10px]
                        font-medium
                        theme-text-muted
                        sm:text-xs
                      "
                    >
                      <span className="flex items-center gap-1.5">
                        <LayoutGrid className="h-3.5 w-3.5" />

                        Total{" "}
                        <strong className="theme-text-secondary">
                          {filteredBanners.length}
                        </strong>
                      </span>

                      <span className="theme-text-placeholder">
                        •
                      </span>

                      <span
                        style={{
                          color: "var(--color-success)",
                        }}
                      >
                        {
                          filteredBanners.filter(
                            (b) => b.status === "active"
                          ).length
                        }{" "}
                        active
                      </span>

                      <span className="theme-text-placeholder">
                        •
                      </span>

                      <span className="theme-text-secondary">
                        {
                          filteredBanners.filter(
                            (b) => b.status === "draft"
                          ).length
                        }{" "}
                        draft
                      </span>
                    </div>

                    <span
                      className="
                        w-fit
                        rounded-full
                        theme-card-soft
                        px-3
                        py-1
                        text-[9px]
                        font-semibold
                        theme-text-muted
                      "
                    >
                      Data simulasi
                    </span>
                  </div>
                </section>
              )}

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="py-8 text-center">
                <p className="text-[10px] font-medium theme-text-muted sm:text-xs">
                  © 2026 SmartSchool • CMS Banner Management
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}