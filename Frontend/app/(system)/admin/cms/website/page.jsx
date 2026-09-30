// app/cmsAdmin/website/page.jsx

"use client";

import { useState } from "react";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  FileText,
  Image as ImageIcon,
  Menu,
  Folder,
  Tags,
  LayoutDashboard,
  Plus,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Activity,
} from "lucide-react";

// =====================================================
// DUMMY DATA
// =====================================================

const stats = {
  totalDokumen: 24,
  totalGaleri: 48,
  totalAlbum: 12,
  totalKategori: 8,
};

// =====================================================
// PAGE
// =====================================================

export default function WebsitePage() {
  const [active, setActive] = useState("website");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR - TETAP DI KIRI */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* =================================================
          CONTENT AREA - MENYESUAIKAN SISA LEBAR
      ================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          title="Dashboard Website"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        {/* =================================================
            MAIN CONTENT - SCROLLABLE
        ================================================= */}
        <main className="theme-page flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* ===== BREADCRUMB ===== */}
            <nav className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm">
              <span className="font-medium theme-text-muted">
                Dashboard
              </span>

              <ChevronRight className="w-3.5 h-3.5 theme-text-placeholder" />

              <span className="font-semibold theme-text">
                Website
              </span>
            </nav>

            {/* ===== HERO ===== */}
            <section
              className="
                relative
                w-full
                overflow-hidden
                rounded-2xl
                sm:rounded-3xl
                border
                theme-border
                theme-card
                shadow-sm
              "
            >
              {/* Decoration */}
              <div
                className="
                  absolute
                  -right-20
                  -top-20
                  w-64
                  h-64
                  rounded-full
                  bg-[color:var(--color-primary)]/10
                  blur-3xl
                  pointer-events-none
                "
              />

              <div
                className="
                  absolute
                  -left-20
                  -bottom-24
                  w-56
                  h-56
                  rounded-full
                  bg-[color:var(--color-info)]/10
                  blur-3xl
                  pointer-events-none
                "
              />

              <div className="relative z-10 p-5 sm:p-6 lg:p-7 xl:p-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                  {/* Left */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className="
                        w-11
                        h-11
                        sm:w-13
                        sm:h-13
                        lg:w-14
                        lg:h-14
                        rounded-2xl
                        theme-primary
                        flex
                        items-center
                        justify-center
                        shrink-0
                        shadow-lg
                      "
                    >
                      <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            text-[9px]
                            sm:text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-[var(--color-primary)]
                            theme-card-soft
                            border
                            theme-border
                            px-2
                            py-1
                            rounded-full
                          "
                        >
                          <Sparkles className="w-3 h-3" />
                          CMS Website
                        </span>
                      </div>

                      <h1
                        className="
                          text-xl
                          sm:text-2xl
                          lg:text-3xl
                          font-bold
                          tracking-tight
                          theme-text
                        "
                      >
                        Manajemen Website
                      </h1>

                      <p
                        className="
                          mt-1
                          text-xs
                          sm:text-sm
                          theme-text-muted
                          leading-relaxed
                          max-w-2xl
                        "
                      >
                        Kelola konten, media, menu, dan informasi
                        website sekolah dari satu tempat.
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col sm:flex-row gap-2.5 xl:shrink-0">
                    <div
                      className="
                        flex
                        items-center
                        gap-2.5
                        px-3.5
                        py-2.5
                        rounded-xl
                        theme-card-soft
                        border
                        theme-border
                      "
                    >
                      <div
                        className="
                          w-8
                          h-8
                          rounded-lg
                          theme-card
                          border
                          theme-border
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Activity className="w-4 h-4 text-[var(--color-success)]" />
                      </div>

                      <div>
                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-wider
                            font-semibold
                            theme-text-muted
                          "
                        >
                          Status
                        </p>

                        <p
                          className="
                            text-xs
                            sm:text-sm
                            font-semibold
                            theme-text-secondary
                          "
                        >
                          Website Aktif
                        </p>
                      </div>

                      <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                    </div>

                    <button
                      type="button"
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        theme-primary
                        text-xs
                        sm:text-sm
                        font-semibold
                        transition-all
                        duration-200
                        shadow-sm
                      "
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Cepat
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== STATISTIK ===== */}
            <section>
              <div className="flex items-end justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h2
                    className="
                      text-base
                      sm:text-lg
                      font-bold
                      theme-text
                    "
                  >
                    Ringkasan Website
                  </h2>

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      theme-text-muted
                      mt-0.5
                    "
                  >
                    Statistik konten website saat ini
                  </p>
                </div>

                <div
                  className="
                    hidden
                    md:flex
                    items-center
                    gap-1.5
                    shrink-0
                    text-xs
                    theme-text-muted
                  "
                >
                  <Activity className="w-3.5 h-3.5" />
                  Data terbaru
                </div>
              </div>

              <div className="w-full grid grid-cols-1 min-[460px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  icon={
                    <FileText className="w-5 h-5 text-[var(--color-info)]" />
                  }
                  label="Total Dokumen"
                  value={stats.totalDokumen}
                  change="3"
                  description="dokumen baru"
                  iconBg="theme-info"
                />

                <StatCard
                  icon={
                    <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  }
                  label="Total Galeri"
                  value={stats.totalGaleri}
                  change="12"
                  description="media baru"
                  iconBg="theme-card-soft"
                />

                <StatCard
                  icon={
                    <Folder className="w-5 h-5 text-[var(--color-warning)]" />
                  }
                  label="Total Album"
                  value={stats.totalAlbum}
                  change="2"
                  description="album baru"
                  iconBg="theme-warning"
                />

                <StatCard
                  icon={
                    <Tags className="w-5 h-5 text-[var(--color-danger)]" />
                  }
                  label="Total Kategori"
                  value={stats.totalKategori}
                  change="1"
                  description="kategori baru"
                  iconBg="theme-danger"
                />
              </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section>
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <h2
                    className="
                      text-lg
                      sm:text-xl
                      font-bold
                      theme-text
                    "
                  >
                    Kelola Website
                  </h2>

                  <span
                    className="
                      hidden
                      sm:inline-flex
                      text-[10px]
                      font-semibold
                      px-2
                      py-1
                      rounded-full
                      theme-card-soft
                      theme-text-muted
                    "
                  >
                    5 Modul
                  </span>
                </div>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    theme-text-muted
                    mt-1
                  "
                >
                  Pilih modul yang ingin kamu kelola.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                <FeatureCard
                  icon={
                    <FileText className="w-6 h-6 text-[var(--color-info)]" />
                  }
                  title="Dokumen"
                  description="Kelola dokumen dan file sekolah."
                  link="/cmsAdmin/website/dokumen"
                  badge="24"
                  badgeLabel="File"
                  iconBg="theme-info"
                  iconBorder="theme-border"
                />

                <FeatureCard
                  icon={
                    <ImageIcon className="w-6 h-6 text-[var(--color-primary)]" />
                  }
                  title="Galeri"
                  description="Kelola foto dan video sekolah."
                  link="/cmsAdmin/website/galeri"
                  badge="48"
                  badgeLabel="Media"
                  iconBg="theme-card-soft"
                  iconBorder="theme-border"
                />

                <FeatureCard
                  icon={
                    <Menu className="w-6 h-6 text-[var(--color-success)]" />
                  }
                  title="Menu Website"
                  description="Atur menu utama dan submenu."
                  link="/cmsAdmin/website/menu"
                  badge="6"
                  badgeLabel="Menu"
                  iconBg="theme-success"
                  iconBorder="theme-border"
                />

                <FeatureCard
                  icon={
                    <Folder className="w-6 h-6 text-[var(--color-warning)]" />
                  }
                  title="Album"
                  description="Organisasi album untuk galeri."
                  link="/cmsAdmin/website/galeri/album"
                  badge="12"
                  badgeLabel="Album"
                  iconBg="theme-warning"
                  iconBorder="theme-border"
                />

                <FeatureCard
                  icon={
                    <Tags className="w-6 h-6 text-[var(--color-danger)]" />
                  }
                  title="Kategori"
                  description="Kelola kategori konten galeri."
                  link="/cmsAdmin/website/galeri/kategori"
                  badge="8"
                  badgeLabel="Kategori"
                  iconBg="theme-danger"
                  iconBorder="theme-border"
                />
              </div>
            </section>

            {/* ===== INFO BANNER ===== */}
            <section
              className="
                relative
                w-full
                overflow-hidden
                rounded-2xl
                border
                theme-border
                theme-info
                p-5
                sm:p-6
              "
            >
              <div
                className="
                  absolute
                  -right-10
                  -top-16
                  w-44
                  h-44
                  rounded-full
                  bg-[color:var(--color-info)]/10
                  blur-2xl
                  pointer-events-none
                "
              />

              <div className="relative flex items-start gap-4">
                <div
                  className="
                    w-10
                    h-10
                    sm:w-11
                    sm:h-11
                    rounded-xl
                    theme-card
                    border
                    theme-border
                    shadow-sm
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <LayoutDashboard className="w-5 h-5 text-[var(--color-info)]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className="
                        text-sm
                        sm:text-base
                        font-bold
                        theme-text
                      "
                    >
                      Manajemen Website Sekolah
                    </h3>

                    <span
                      className="
                        text-[9px]
                        font-semibold
                        text-[var(--color-info)]
                        theme-card
                        border
                        theme-border
                        px-2
                        py-1
                        rounded-full
                      "
                    >
                      CMS
                    </span>
                  </div>

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      theme-text-secondary
                      mt-1.5
                      leading-relaxed
                    "
                  >
                    Gunakan modul di atas atau menu pada sidebar
                    untuk mengelola artikel, halaman statis, media,
                    banner, menu website, pengumuman, agenda, dan
                    pengaturan CMS sekolah.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <InfoTag text="Konten" />
                    <InfoTag text="Media" />
                    <InfoTag text="Navigasi" />
                    <InfoTag text="Publikasi" />
                  </div>
                </div>
              </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer
              className="
                w-full
                pt-5
                pb-5
                border-t
                theme-border
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-2
                text-xs
                theme-text-muted
              "
            >
              <p>© 2026 SmartSchool CMS. All rights reserved.</p>
              <p className="font-medium">Website Management</p>
            </footer>
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
  change,
  description,
  iconBg,
}) {
  return (
    <div
      className="
        group
        relative
        w-full
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        theme-border
        theme-card
        p-4
        sm:p-5
        shadow-sm
        hover:-translate-y-0.5
        hover:shadow-lg
        transition-all
        duration-300
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`
            w-10
            h-10
            sm:w-11
            sm:h-11
            rounded-xl
            ${iconBg}
            flex
            items-center
            justify-center
            shrink-0
          `}
        >
          {icon}
        </div>

        <span
          className="
            inline-flex
            items-center
            gap-1
            text-[10px]
            sm:text-xs
            font-semibold
            theme-success
            border
            theme-border
            px-2
            py-1
            rounded-full
          "
        >
          <ArrowUpRight className="w-3 h-3" />
          +{change}
        </span>
      </div>

      <div className="mt-4">
        <p
          className="
            text-2xl
            sm:text-3xl
            font-bold
            tracking-tight
            theme-text
          "
        >
          {value}
        </p>

        <p
          className="
            text-xs
            sm:text-sm
            font-semibold
            theme-text-secondary
            mt-1
          "
        >
          {label}
        </p>

        <p
          className="
            text-[10px]
            sm:text-xs
            theme-text-muted
            mt-0.5
          "
        >
          +{change} {description}
        </p>
      </div>

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          h-[2px]
          bg-[var(--color-primary)]
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
      />
    </div>
  );
}

// =====================================================
// FEATURE CARD
// =====================================================

function FeatureCard({
  icon,
  title,
  description,
  link,
  badge,
  badgeLabel,
  iconBg,
  iconBorder,
}) {
  return (
    <a
      href={link}
      className="
        group
        relative
        block
        w-full
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        theme-border
        theme-card
        p-4
        sm:p-5
        shadow-sm
        hover:-translate-y-1
        hover:border-[var(--color-primary)]
        hover:shadow-xl
        transition-all
        duration-300
      "
    >
      {/* Glow */}
      <div
        className="
          absolute
          -right-10
          -top-10
          w-28
          h-28
          rounded-full
          bg-[color:var(--color-primary)]/10
          opacity-0
          group-hover:opacity-100
          blur-2xl
          transition-opacity
          pointer-events-none
        "
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`
            w-11
            h-11
            rounded-xl
            ${iconBg}
            border
            ${iconBorder}
            flex
            items-center
            justify-center
            shrink-0
            group-hover:scale-105
            transition-transform
            duration-300
          `}
        >
          {icon}
        </div>

        <div
          className="
            inline-flex
            items-center
            gap-1.5
            px-2
            py-1
            rounded-lg
            theme-card-soft
            border
            theme-border
            shrink-0
          "
        >
          <span
            className="
              text-sm
              font-bold
              theme-text-secondary
            "
          >
            {badge}
          </span>

          <span
            className="
              text-[9px]
              uppercase
              tracking-wide
              font-medium
              theme-text-muted
            "
          >
            {badgeLabel}
          </span>
        </div>
      </div>

      <div className="relative mt-5">
        <h3
          className="
            text-base
            sm:text-lg
            font-bold
            theme-text
            group-hover:text-[var(--color-primary)]
            transition-colors
          "
        >
          {title}
        </h3>

        <p
          className="
            text-xs
            sm:text-sm
            theme-text-muted
            mt-1
            leading-relaxed
            min-h-[40px]
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          relative
          mt-5
          pt-4
          border-t
          theme-border-soft
          flex
          items-center
          justify-between
          gap-2
        "
      >
        <span
          className="
            text-xs
            sm:text-sm
            font-semibold
            theme-text-secondary
            group-hover:text-[var(--color-primary)]
            transition-colors
          "
        >
          Kelola sekarang
        </span>

        <span
          className="
            w-7
            h-7
            rounded-lg
            theme-card-soft
            group-hover:bg-[var(--color-sidebar-active)]
            flex
            items-center
            justify-center
            shrink-0
            transition-colors
          "
        >
          <ChevronRight
            className="
              w-4
              h-4
              theme-text-muted
              group-hover:text-[var(--color-primary)]
              group-hover:translate-x-0.5
              transition-all
            "
          />
        </span>
      </div>
    </a>
  );
}

// =====================================================
// INFO TAG
// =====================================================

function InfoTag({ text }) {
  return (
    <span
      className="
        inline-flex
        items-center
        text-[10px]
        sm:text-xs
        font-medium
        theme-text-secondary
        theme-card
        border
        theme-border
        px-2.5
        py-1.5
        rounded-lg
      "
    >
      {text}
    </span>
  );
}