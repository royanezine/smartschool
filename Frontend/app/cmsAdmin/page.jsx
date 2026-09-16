// app/cmsAdmin/page.jsx

"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
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
  ChevronRight,
  PenLine,
  ExternalLink,
  BarChart3,
  Clock3,
} from "lucide-react";

import { dummyStats, dummyArticles } from "../../lib/dummyData";

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
      color: "indigo",
    },
    {
      title: "Artikel Terbit",
      value: publishedArticles,
      subtitle: "artikel aktif",
      icon: CheckCircle,
      color: "emerald",
    },
    {
      title: "Halaman Statis",
      value: totalPages,
      subtitle: "halaman aktif",
      icon: File,
      color: "violet",
    },
    {
      title: "Total Dilihat",
      value: totalViews,
      subtitle: "views sepanjang waktu",
      icon: Eye,
      color: "amber",
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
    indigo: {
      icon: "text-indigo-600",
      iconBg: "bg-indigo-50",
      border: "border-indigo-100",
      accent: "bg-indigo-600",
    },
    emerald: {
      icon: "text-emerald-600",
      iconBg: "bg-emerald-50",
      border: "border-emerald-100",
      accent: "bg-emerald-600",
    },
    violet: {
      icon: "text-violet-600",
      iconBg: "bg-violet-50",
      border: "border-violet-100",
      accent: "bg-violet-600",
    },
    amber: {
      icon: "text-amber-600",
      iconBg: "bg-amber-50",
      border: "border-amber-100",
      accent: "bg-amber-600",
    },
  };

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
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

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-[1600px] mx-auto">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <section className="mb-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                {/* LEFT */}
                <div className="min-w-0">
                  {/* Breadcrumb */}

                 

                  {/* Title */}

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                      <LayoutDashboard
                        size={21}
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800">
                          Dashboard CMS
                        </h1>

                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-600">
                          Admin
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
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
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm"
                  >
                    <ExternalLink size={16} />

                    <span>Preview Website</span>
                  </a>

                  <a
                    href="/cmsAdmin/articles/create"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    <Plus size={17} />

                    <span>Buat Artikel</span>
                  </a>
                </div>
              </div>

              {/* Divider */}

              <div className="mt-6 border-b border-slate-200" />
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
                    className={`relative overflow-hidden bg-white border ${color.border} rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200`}
                  >
                    {/* Small accent */}

                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${color.accent}`}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {stat.title}
                        </p>

                        <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800">
                          {stat.value}
                        </p>

                        <p className="mt-1 text-xs text-slate-400 truncate">
                          {stat.subtitle}
                        </p>
                      </div>

                      <div
                        className={`w-10 h-10 shrink-0 rounded-lg ${color.iconBg} ${color.icon} flex items-center justify-center`}
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

              <section className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {/* Card Header */}

                <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText size={18} />
                      </div>

                      <div>
                        <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                          Artikel Terbaru
                        </h2>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Konten yang baru ditambahkan
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-500">
                      <FileText size={12} />

                      {latestArticles.length} artikel
                    </span>
                  </div>
                </div>

                {/* Article List */}

                <div className="px-5 sm:px-6">
                  {latestArticles.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {latestArticles.map((article) => (
                        <div
                          key={article.id}
                          className="group py-4 flex items-center gap-4"
                        >
                          {/* Icon */}

                          <div className="hidden sm:flex w-9 h-9 shrink-0 rounded-lg bg-slate-50 border border-slate-100 items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                            <PenLine size={16} />
                          </div>

                          {/* Content */}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                              {article.title}
                            </p>

                            <div className="flex items-center flex-wrap gap-2 mt-1.5">
                              {/* Status */}

                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                  article.status === "published"
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-amber-50 text-amber-600 border border-amber-100"
                                }`}
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

                              <span className="text-[11px] text-slate-400">
                                {article.category || "Uncategorized"}
                              </span>
                            </div>
                          </div>

                          {/* Date */}

                          <div className="hidden md:flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
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
                            className="shrink-0 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <FileText
                        size={30}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-medium text-slate-600">
                        Belum ada artikel
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Mulai buat artikel pertama Anda.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}

                <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <a
                    href="/cmsAdmin/articles"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Lihat semua artikel

                    <ArrowRight size={15} />
                  </a>
                </div>
              </section>

              {/* =================================================
                  CONTENT OVERVIEW
              ================================================= */}

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {/* Header */}

                <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                      <BarChart3 size={18} />
                    </div>

                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                        Ringkasan Konten
                      </h2>

                      <p className="text-xs text-slate-400 mt-0.5">
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
                      <span className="text-xs font-medium text-slate-500">
                        Artikel Terbit
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
                        {publishedArticles}/{totalArticles}
                      </span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
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

                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-violet-600">
                        <File size={15} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Halaman Statis
                        </p>

                        <p className="text-[11px] text-slate-400">
                          Halaman aktif
                        </p>
                      </div>
                    </div>

                    <span className="text-lg font-semibold text-slate-800">
                      {totalPages}
                    </span>
                  </div>

                  {/* Views */}

                  <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-600">
                        <Eye size={15} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Total Views
                        </p>

                        <p className="text-[11px] text-slate-400">
                          Semua konten
                        </p>
                      </div>
                    </div>

                    <span className="text-lg font-semibold text-slate-800">
                      {totalViews}
                    </span>
                  </div>

                  {/* Create Button */}

                  <a
                    href="/cmsAdmin/articles/create"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-all"
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

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Lightbulb size={18} />
                    </div>

                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-slate-800">
                        Panduan Menulis Konten
                      </h2>

                      <p className="text-xs text-slate-400 mt-0.5">
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
                        className="flex gap-3.5 p-4 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all"
                      >
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <span className="text-[11px] font-bold text-indigo-600">
                            {tip.number}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-700">
                            {tip.title}
                          </h3>

                          <p className="mt-1 text-xs leading-relaxed text-slate-400">
                            {tip.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Action */}

              <div className="bg-slate-800 rounded-xl shadow-sm overflow-hidden">

                <div className="p-5 sm:p-6">
                  <div className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center mb-4">
                    <TrendingUp size={18} />
                  </div>

                  <h2 className="text-base font-semibold text-white">
                    Kelola Konten
                  </h2>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Kelola artikel, halaman statis, dan seluruh konten
                    website dari satu tempat.
                  </p>

                  <div className="mt-5 space-y-2">
                    <a
                      href="/cmsAdmin/articles"
                      className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <FileText size={15} />
                        Kelola Artikel
                      </span>

                      <ArrowRight size={15} />
                    </a>

                    <a
                      href="/cmsAdmin/pages"
                      className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-all"
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

            <footer className="pt-5 pb-2 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-400">
                © 2026 SmartSchool • CMS Dashboard
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}