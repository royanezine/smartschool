// app/cmsAdmin/page.jsx

"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  FileText,
  CheckCircle,
  File,
  Eye,
  Plus,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  LayoutDashboard,
  PenLine,
  ExternalLink,
  BarChart3,
  Clock3,
} from "lucide-react";

import { dummyStats, dummyArticles } from "../../../../lib/dummyData";

export default function CmsDashboardPage() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const {
    totalArticles,
    publishedArticles,
    totalPages,
    totalViews,
  } = dummyStats;

  const latestArticles = dummyArticles.slice(0, 5);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statCards = [
    {
      title: "Total Artikel",
      value: totalArticles,
      subtitle: `${publishedArticles} artikel dipublikasikan`,
      icon: FileText,
      color: "info",
    },
    {
      title: "Artikel Terbit",
      value: publishedArticles,
      subtitle: "artikel aktif",
      icon: CheckCircle,
      color: "success",
    },
    {
      title: "Halaman Statis",
      value: totalPages,
      subtitle: "halaman aktif",
      icon: File,
      color: "primary",
    },
    {
      title: "Total Dilihat",
      value: totalViews,
      subtitle: "views sepanjang waktu",
      icon: Eye,
      color: "warning",
    },
  ];

  // ============================================================
  // WRITING TIPS
  // ============================================================

  const tips = [
    {
      number: "01",
      title: "Gunakan judul yang jelas",
      desc: "Buat judul singkat, informatif, dan mudah dipahami pembaca.",
    },
    {
      number: "02",
      title: "Tambahkan visual",
      desc: "Gunakan gambar yang relevan untuk memperkuat isi artikel.",
    },
    {
      number: "03",
      title: "Periksa sebelum terbit",
      desc: "Pastikan ejaan, struktur, dan informasi sudah sesuai.",
    },
    {
      number: "04",
      title: "Gunakan subjudul",
      desc: "Pisahkan konten menjadi beberapa bagian agar lebih nyaman dibaca.",
    },
  ];

  // ============================================================
  // COLOR CONFIG
  // ============================================================

  const colorClasses = {
    info: {
      icon: "text-[var(--color-info)]",
      iconBg: "theme-info",
      border: "theme-border",
      accent: "bg-[var(--color-info)]",
    },
    success: {
      icon: "text-[var(--color-success)]",
      iconBg: "theme-success",
      border: "theme-border",
      accent: "bg-[var(--color-success)]",
    },
    primary: {
      icon: "text-[var(--color-primary)]",
      iconBg: "theme-card-soft",
      border: "theme-border",
      accent: "bg-[var(--color-primary)]",
    },
    warning: {
      icon: "text-[var(--color-warning)]",
      iconBg: "theme-warning",
      border: "theme-border",
      accent: "bg-[var(--color-warning)]",
    },
  };

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="theme-page flex min-h-screen w-full">
      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ========================================================
          MAIN AREA
      ======================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <Header
          user={{
            name: "CMS Admin",
            email: "admin@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <main className="theme-page flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-[1600px] mx-auto">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <section className="mb-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                {/* LEFT */}

                <div className="min-w-0">
                  {/* Title */}

                  <div className="flex items-center gap-3">
                    <div
                      className="
                        w-11
                        h-11
                        shrink-0
                        rounded-xl
                        border
                        theme-border
                        theme-card
                        flex
                        items-center
                        justify-center
                        text-[var(--color-primary)]
                        shadow-sm
                      "
                    >
                      <LayoutDashboard
                        size={21}
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1
                          className="
                            text-2xl
                            sm:text-3xl
                            font-semibold
                            tracking-tight
                            theme-text
                          "
                        >
                          Dashboard CMS
                        </h1>

                        <span
                          className="
                            inline-flex
                            items-center
                            px-2.5
                            py-1
                            rounded-md
                            theme-card-soft
                            border
                            theme-border
                            text-[11px]
                            font-semibold
                            text-[var(--color-primary)]
                          "
                        >
                          Admin
                        </span>
                      </div>

                      <p
                        className="
                          mt-1
                          text-sm
                          theme-text-muted
                        "
                      >
                        Kelola dan pantau konten website SmartSchool.
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-3.5
                      py-2.5
                      rounded-lg
                      border
                      theme-border
                      theme-card
                      text-sm
                      font-medium
                      theme-text-secondary
                      theme-sidebar-hover
                      transition-all
                      shadow-sm
                    "
                  >
                    <ExternalLink size={16} />

                    <span>Preview Website</span>
                  </a>

                  <a
                    href="/cmsAdmin/articles/create"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      py-2.5
                      rounded-lg
                      theme-primary
                      text-white
                      text-sm
                      font-medium
                      transition-all
                      shadow-sm
                    "
                  >
                    <Plus size={17} />

                    <span>Buat Artikel</span>
                  </a>
                </div>
              </div>

              {/* Divider */}

              <div className="mt-6 border-b theme-border" />
            </section>

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const color = colorClasses[stat.color];

                return (
                  <div
                    key={stat.title}
                    className={`
                      relative
                      overflow-hidden
                      theme-card
                      border
                      ${color.border}
                      rounded-xl
                      p-4
                      sm:p-5
                      shadow-sm
                      hover:shadow-md
                      transition-all
                      duration-200
                    `}
                  >
                    {/* Small accent */}

                    <div
                      className={`
                        absolute
                        left-0
                        top-0
                        bottom-0
                        w-1
                        ${color.accent}
                      `}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px]
                            sm:text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            theme-text-muted
                          "
                        >
                          {stat.title}
                        </p>

                        <p
                          className="
                            mt-2
                            text-2xl
                            sm:text-3xl
                            font-semibold
                            tracking-tight
                            theme-text
                          "
                        >
                          {stat.value}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            theme-text-muted
                            truncate
                          "
                        >
                          {stat.subtitle}
                        </p>
                      </div>

                      <div
                        className={`
                          w-10
                          h-10
                          shrink-0
                          rounded-lg
                          ${color.iconBg}
                          ${color.icon}
                          flex
                          items-center
                          justify-center
                        `}
                      >
                        <Icon size={19} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ==================================================
                MAIN CONTENT GRID
            ================================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

              {/* =================================================
                  ARTICLES
              ================================================= */}

              <section
                className="
                  xl:col-span-2
                  theme-card
                  border
                  theme-border
                  rounded-xl
                  shadow-sm
                  overflow-hidden
                "
              >
                {/* Card Header */}

                <div
                  className="
                    px-5
                    sm:px-6
                    py-5
                    border-b
                    theme-border-soft
                  "
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div className="flex items-center gap-3">
                      <div
                        className="
                          w-9
                          h-9
                          rounded-lg
                          theme-info
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <FileText size={18} />
                      </div>

                      <div>
                        <h2
                          className="
                            text-sm
                            sm:text-base
                            font-semibold
                            theme-text
                          "
                        >
                          Artikel Terbaru
                        </h2>

                        <p
                          className="
                            text-xs
                            theme-text-muted
                            mt-0.5
                          "
                        >
                          Konten yang baru ditambahkan
                        </p>
                      </div>
                    </div>

                    <span
                      className="
                        inline-flex
                        w-fit
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        rounded-md
                        theme-card-soft
                        border
                        theme-border
                        text-xs
                        font-medium
                        theme-text-secondary
                      "
                    >
                      <FileText size={12} />

                      {latestArticles.length} artikel
                    </span>
                  </div>
                </div>

                {/* Article List */}

                <div className="px-5 sm:px-6">
                  {latestArticles.length > 0 ? (
                    <div className="divide-y divide-[var(--color-border-soft)]">
                      {latestArticles.map((article) => (
                        <div
                          key={article.id}
                          className="
                            group
                            py-4
                            flex
                            items-center
                            gap-4
                            theme-table-hover
                          "
                        >
                          {/* Icon */}

                          <div
                            className="
                              hidden
                              sm:flex
                              w-9
                              h-9
                              shrink-0
                              rounded-lg
                              theme-card-soft
                              border
                              theme-border
                              items-center
                              justify-center
                              theme-text-muted
                              group-hover:text-[var(--color-primary)]
                              group-hover:bg-[var(--color-sidebar-active)]
                              transition-all
                            "
                          >
                            <PenLine size={16} />
                          </div>

                          {/* Content */}

                          <div className="flex-1 min-w-0">
                            <p
                              className="
                                text-sm
                                font-medium
                                theme-text-secondary
                                group-hover:text-[var(--color-primary)]
                                transition-colors
                                truncate
                              "
                            >
                              {article.title}
                            </p>

                            <div className="flex items-center flex-wrap gap-2 mt-1.5">
                              {/* Status */}

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1
                                  px-2
                                  py-0.5
                                  rounded-md
                                  text-[10px]
                                  font-semibold
                                  border
                                  ${
                                    article.status === "published"
                                      ? "theme-success"
                                      : "theme-warning"
                                  }
                                `}
                              >
                                {article.status === "published" ? (
                                  <CheckCircle size={11} />
                                ) : (
                                  <Clock3 size={11} />
                                )}

                                {article.status === "published"
                                  ? "Published"
                                  : "Draft"}
                              </span>

                              {/* Category */}

                              <span className="text-[11px] theme-text-muted">
                                {article.category || "Uncategorized"}
                              </span>
                            </div>
                          </div>

                          {/* Date */}

                          <div
                            className="
                              hidden
                              md:flex
                              shrink-0
                              items-center
                              gap-1.5
                              text-xs
                              theme-text-muted
                            "
                          >
                            <Clock3 size={13} />

                            {new Date(
                              article.created_at
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>

                          {/* Arrow */}

                          <ArrowRight
                            size={15}
                            className="
                              shrink-0
                              theme-text-placeholder
                              group-hover:text-[var(--color-primary)]
                              group-hover:translate-x-0.5
                              transition-all
                            "
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <FileText
                        size={30}
                        className="mx-auto theme-text-placeholder"
                      />

                      <p
                        className="
                          mt-3
                          text-sm
                          font-medium
                          theme-text-secondary
                        "
                      >
                        Belum ada artikel
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          theme-text-muted
                        "
                      >
                        Mulai buat artikel pertama Anda.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}

                <div
                  className="
                    px-5
                    sm:px-6
                    py-4
                    border-t
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <a
                    href="/cmsAdmin/articles"
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-sm
                      font-medium
                      text-[var(--color-primary)]
                      hover:text-[var(--color-primary-hover)]
                      transition-colors
                    "
                  >
                    Lihat semua artikel

                    <ArrowRight size={15} />
                  </a>
                </div>
              </section>

              {/* =================================================
                  CONTENT OVERVIEW
              ================================================= */}

              <section
                className="
                  theme-card
                  border
                  theme-border
                  rounded-xl
                  shadow-sm
                  overflow-hidden
                "
              >
                {/* Header */}

                <div
                  className="
                    px-5
                    sm:px-6
                    py-5
                    border-b
                    theme-border-soft
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        w-9
                        h-9
                        rounded-lg
                        theme-card-soft
                        text-[var(--color-primary)]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <BarChart3 size={18} />
                    </div>

                    <div>
                      <h2
                        className="
                          text-sm
                          sm:text-base
                          font-semibold
                          theme-text
                        "
                      >
                        Ringkasan Konten
                      </h2>

                      <p
                        className="
                          text-xs
                          theme-text-muted
                          mt-0.5
                        "
                      >
                        Gambaran konten website
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overview */}

                <div className="p-5 sm:p-6 space-y-5">

                  {/* Published */}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="
                          text-xs
                          font-medium
                          theme-text-secondary
                        "
                      >
                        Artikel Terbit
                      </span>

                      <span
                        className="
                          text-xs
                          font-semibold
                          theme-text-secondary
                        "
                      >
                        {publishedArticles}/{totalArticles}
                      </span>
                    </div>

                    <div
                      className="
                        h-2
                        theme-card-soft
                        rounded-full
                        overflow-hidden
                      "
                    >
                      <div
                        className="
                          h-full
                          bg-[var(--color-success)]
                          rounded-full
                          transition-all
                        "
                        style={{
                          width: `${
                            totalArticles > 0
                              ? Math.min(
                                  (publishedArticles /
                                    totalArticles) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pages */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      p-3.5
                      rounded-lg
                      theme-card-soft
                      border
                      theme-border-soft
                    "
                  >
                    <div className="flex items-center gap-3">
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
                          text-[var(--color-primary)]
                        "
                      >
                        <File size={15} />
                      </div>

                      <div>
                        <p
                          className="
                            text-xs
                            font-medium
                            theme-text-secondary
                          "
                        >
                          Halaman Statis
                        </p>

                        <p
                          className="
                            text-[11px]
                            theme-text-muted
                          "
                        >
                          Halaman aktif
                        </p>
                      </div>
                    </div>

                    <span
                      className="
                        text-lg
                        font-semibold
                        theme-text
                      "
                    >
                      {totalPages}
                    </span>
                  </div>

                  {/* Views */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      p-3.5
                      rounded-lg
                      theme-card-soft
                      border
                      theme-border-soft
                    "
                  >
                    <div className="flex items-center gap-3">
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
                          text-[var(--color-warning)]
                        "
                      >
                        <Eye size={15} />
                      </div>

                      <div>
                        <p
                          className="
                            text-xs
                            font-medium
                            theme-text-secondary
                          "
                        >
                          Total Views
                        </p>

                        <p
                          className="
                            text-[11px]
                            theme-text-muted
                          "
                        >
                          Semua konten
                        </p>
                      </div>
                    </div>

                    <span
                      className="
                        text-lg
                        font-semibold
                        theme-text
                      "
                    >
                      {totalViews}
                    </span>
                  </div>

                  {/* Create Button */}

                  <a
                    href="/cmsAdmin/articles/create"
                    className="
                      w-full
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      py-2.5
                      rounded-lg
                      theme-primary
                      text-white
                      text-sm
                      font-medium
                      transition-all
                    "
                  >
                    <PenLine size={16} />

                    Tulis Artikel Baru
                  </a>
                </div>
              </section>
            </div>

            {/* ==================================================
                TIPS SECTION
            ================================================== */}

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Tips */}

              <div
                className="
                  lg:col-span-2
                  theme-card
                  border
                  theme-border
                  rounded-xl
                  shadow-sm
                  overflow-hidden
                "
              >
                <div
                  className="
                    px-5
                    sm:px-6
                    py-5
                    border-b
                    theme-border-soft
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        w-9
                        h-9
                        rounded-lg
                        theme-warning
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Lightbulb size={18} />
                    </div>

                    <div>
                      <h2
                        className="
                          text-sm
                          sm:text-base
                          font-semibold
                          theme-text
                        "
                      >
                        Panduan Menulis Konten
                      </h2>

                      <p
                        className="
                          text-xs
                          theme-text-muted
                          mt-0.5
                        "
                      >
                        Beberapa hal yang perlu diperhatikan
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tips.map((tip) => (
                      <div
                        key={tip.number}
                        className="
                          flex
                          gap-3.5
                          p-4
                          rounded-lg
                          border
                          theme-border-soft
                          theme-card-soft
                          hover:theme-card
                          transition-all
                        "
                      >
                        <div
                          className="
                            w-8
                            h-8
                            shrink-0
                            rounded-lg
                            theme-card
                            border
                            theme-border
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <span
                            className="
                              text-[11px]
                              font-bold
                              text-[var(--color-primary)]
                            "
                          >
                            {tip.number}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="
                              text-sm
                              font-semibold
                              theme-text-secondary
                            "
                          >
                            {tip.title}
                          </h3>

                          <p
                            className="
                              mt-1
                              text-xs
                              leading-relaxed
                              theme-text-muted
                            "
                          >
                            {tip.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Action */}

              <div
                className="
                  rounded-xl
                  shadow-sm
                  overflow-hidden
                  bg-[var(--color-sidebar)]
                  border
                  theme-border
                "
              >
                <div className="p-5 sm:p-6">
                  <div
                    className="
                      w-9
                      h-9
                      rounded-lg
                      theme-card-soft
                      text-[var(--color-primary)]
                      flex
                      items-center
                      justify-center
                      mb-4
                    "
                  >
                    <TrendingUp size={18} />
                  </div>

                  <h2
                    className="
                      text-base
                      font-semibold
                      theme-text
                    "
                  >
                    Kelola Konten
                  </h2>

                  <p
                    className="
                      text-xs
                      theme-text-muted
                      mt-1
                      leading-relaxed
                    "
                  >
                    Kelola artikel, halaman statis, dan seluruh
                    konten website dari satu tempat.
                  </p>

                  <div className="mt-5 space-y-2">
                    <a
                      href="/cmsAdmin/articles"
                      className="
                        flex
                        items-center
                        justify-between
                        w-full
                        px-3.5
                        py-2.5
                        rounded-lg
                        theme-card-soft
                        hover:bg-[var(--color-sidebar-hover)]
                        text-sm
                        theme-text
                        transition-all
                      "
                    >
                      <span className="flex items-center gap-2">
                        <FileText size={15} />
                        Kelola Artikel
                      </span>

                      <ArrowRight size={15} />
                    </a>

                    <a
                      href="/cmsAdmin/pages"
                      className="
                        flex
                        items-center
                        justify-between
                        w-full
                        px-3.5
                        py-2.5
                        rounded-lg
                        theme-card-soft
                        hover:bg-[var(--color-sidebar-hover)]
                        text-sm
                        theme-text
                        transition-all
                      "
                    >
                      <span className="flex items-center gap-2">
                        <File size={15} />
                        Kelola Halaman
                      </span>

                      <ArrowRight size={15} />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer
              className="
                pt-5
                pb-2
                border-t
                theme-border
                text-center
              "
            >
              <p className="text-xs theme-text-muted">
                © 2026 SmartSchool • CMS Dashboard
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}