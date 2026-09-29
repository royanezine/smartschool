"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Download,
  FileCheck2,
  HelpCircle,
  NotebookPen,
  Sparkles,
  Users,
  AlertTriangle,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";

import {
  exportRekapNilai,
  downloadRekapNilai,
} from "../../../services/nilai.service";

/* =========================================================
   CONFIG
========================================================= */

const MATA_PELAJARAN = "Matematika";

/* =========================================================
   MODULE UI
   Backend Nilai saat ini belum menyediakan endpoint
   untuk tugas, quiz, dan rapor.
========================================================= */

const subHalaman = [
  {
    key: "nilaiTugas",
    icon: ClipboardList,
    label: "Nilai Tugas",
    description:
      "Kelola nilai tugas, ulangan harian, UTS, dan UAS.",
    color: "blue",
    tag: "Segera tersedia",
  },
  {
    key: "nilaiQuiz",
    icon: HelpCircle,
    label: "Nilai Quiz",
    description:
      "Kelola dan lihat hasil quiz siswa.",
    color: "amber",
    tag: "Segera tersedia",
  },
  {
    key: "rapor",
    icon: FileCheck2,
    label: "Rapor",
    description:
      "Kelola nilai akhir dan persiapan rapor.",
    color: "emerald",
    tag: "Segera tersedia",
  },
];

/* =========================================================
   COLOR CONFIG
========================================================= */

const colorConfig = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    line: "bg-blue-600",
    badge: "bg-blue-50 text-blue-600 border-blue-100",
  },

  amber: {
    icon: "bg-amber-50 text-amber-600",
    line: "bg-amber-500",
    badge: "bg-amber-50 text-amber-600 border-amber-100",
  },

  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    line: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function GuruNilaiIndexPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Rapat Wali Kelas",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Batas Input Nilai Rapor",
      desc: "Dikirim 5 jam lalu",
      read: false,
    },
  ];

  /* =======================================================
     EXPORT REKAP NILAI
  ======================================================= */

  const handleExportNilai = async () => {
    try {
      setIsExporting(true);
      setExportError("");
      setExportSuccess("");

      const blob = await exportRekapNilai();

      downloadRekapNilai(blob, "rekap-nilai.xlsx");

      setExportSuccess(
        "Rekap nilai berhasil disiapkan dan diunduh."
      );
    } catch (error) {
      console.error(
        "Export rekap nilai gagal:",
        error
      );

      setExportError(
        error?.message ||
          "Gagal mengekspor rekap nilai."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active="nilai"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">

        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto">

          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

            <div className="space-y-6">

              {/* =================================================
                  HERO
              ================================================== */}

              <section className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-[#0B1736] shadow-[0_20px_55px_rgba(15,23,42,0.12)]">

                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

                <div className="relative px-6 py-7 sm:px-8 lg:px-10 lg:py-8">

                  <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                    {/* LEFT */}

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold text-blue-100">

                          <NotebookPen size={12} />

                          PENILAIAN AKADEMIK

                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                          Semester aktif

                        </span>

                      </div>

                      <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[36px]">
                        Nilai {MATA_PELAJARAN}
                      </h1>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/70">
                        Pusat pengelolaan penilaian siswa.
                        Saat ini tersedia fitur export rekap
                        nilai dari backend SmartSchool.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">

                        <button
                          type="button"
                          onClick={handleExportNilai}
                          disabled={isExporting}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#1454D9] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isExporting ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                          ) : (
                            <Download size={15} />
                          )}

                          {isExporting
                            ? "Menyiapkan..."
                            : "Export Rekap Nilai"}
                        </button>

                        <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-blue-100/70">

                          <Users size={14} />

                          Backend Nilai aktif

                        </span>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[430px]">

                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                          <BarChart3 size={17} />
                        </div>

                        <p className="mt-4 text-[10px] font-medium text-blue-100/45">
                          Rekap
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          Excel
                        </p>

                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                          <NotebookPen size={17} />
                        </div>

                        <p className="mt-4 text-[10px] font-medium text-blue-100/45">
                          Sumber
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          BE
                        </p>

                      </div>

                      <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:col-span-1">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                          <LockKeyhole size={17} />
                        </div>

                        <p className="mt-4 text-[10px] font-medium text-blue-100/45">
                          Modul
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          Bertahap
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              </section>

              {/* =================================================
                  SUCCESS
              ================================================== */}

              {exportSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">

                  <p className="text-xs font-bold text-emerald-700">
                    Export berhasil
                  </p>

                  <p className="mt-0.5 text-[11px] leading-5 text-emerald-600">
                    {exportSuccess}
                  </p>

                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================== */}

              {exportError && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600">
                    <AlertTriangle size={15} />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-rose-700">
                      Export gagal
                    </p>

                    <p className="mt-0.5 text-[11px] leading-5 text-rose-600">
                      {exportError}
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  MENU PENILAIAN
              ================================================== */}

              <section>

                <div className="mb-4 flex items-end justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      Pengelolaan
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Kelola penilaian
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Modul penilaian akan tersedia sesuai
                      endpoint backend yang aktif.
                    </p>

                  </div>

                  <span className="hidden text-[10px] font-medium text-slate-400 sm:block">
                    3 modul dirancang
                  </span>

                </div>

                <div className="grid gap-4 md:grid-cols-3">

                  {subHalaman.map((item) => {

                    const Icon = item.icon;
                    const colors =
                      colorConfig[item.color];

                    return (
                      <div
                        key={item.key}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                      >

                        <div
                          className={`absolute inset-x-0 top-0 h-1 ${colors.line}`}
                        />

                        <div className="flex items-start justify-between">

                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon}`}
                          >
                            <Icon size={19} />
                          </div>

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
                            <LockKeyhole size={14} />
                          </div>

                        </div>

                        <div className="mt-5">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-sm font-bold text-slate-900">
                              {item.label}
                            </h3>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${colors.badge}`}
                            >
                              {item.tag}
                            </span>

                          </div>

                          <p className="mt-2 min-h-[38px] text-xs leading-5 text-slate-500">
                            {item.description}
                          </p>

                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                            <LockKeyhole size={11} />
                            Belum tersedia di BE
                          </span>

                        </div>

                      </div>
                    );
                  })}

                </div>

              </section>

              {/* =================================================
                  BACKEND STATUS
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <NotebookPen size={18} />
                    </div>

                    <div>

                      <h2 className="text-sm font-bold text-slate-900">
                        Status backend Nilai
                      </h2>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Fitur yang tersedia pada backend saat ini.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">

                  {/* EXPORT */}

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Download size={16} />
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-xs font-bold text-slate-900">
                            Export Rekap Nilai
                          </h3>

                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                            Aktif
                          </span>

                        </div>

                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                          Mengambil data nilai dan hasil asesmen
                          dari backend dan mengunduhnya dalam
                          format Excel.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* ENDPOINT */}

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <BarChart3 size={16} />
                      </div>

                      <div>

                        <h3 className="text-xs font-bold text-slate-900">
                          Endpoint aktif
                        </h3>

                        <code className="mt-2 block break-all rounded-lg bg-white px-3 py-2 text-[10px] font-medium text-blue-700">
                          GET /api/v1/nilai/export
                        </code>

                      </div>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  EXPORT CARD
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50">

                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                      <Download size={18} />
                    </div>

                    <div>

                      <h3 className="text-sm font-bold text-slate-900">
                        Export rekap nilai
                      </h3>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                        Unduh rekap nilai dan hasil asesmen
                        dari backend dalam format Excel.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={handleExportNilai}
                    disabled={isExporting}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {isExporting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                    ) : (
                      <Download size={14} />
                    )}

                    {isExporting
                      ? "Memproses..."
                      : "Download Excel"}

                  </button>

                </div>

              </section>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <div className="flex flex-col gap-2 border-t border-slate-200/70 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                <span>
                  SmartSchool · Penilaian Akademik
                </span>

                <span>
                  {MATA_PELAJARAN} · Backend Export Aktif
                </span>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}