"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  BarChart3,
  ClipboardList,
  Download,
  FileCheck2,
  HelpCircle,
  NotebookPen,
  Users,
  AlertTriangle,
  LockKeyhole,
} from "lucide-react";

import {
  exportRekapNilai,
  downloadRekapNilai,
} from "../../../../services/nilai.service";

/* =========================================================
   CONFIG
========================================================= */

const MATA_PELAJARAN = "Matematika";

/* =========================================================
   MODULE UI
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
   THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

/* =========================================================
   COLOR CONFIG
========================================================= */

const colorConfig = {
  blue: {
    icon: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
    line: "bg-[var(--color-info)]",
    badge: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
  },

  amber: {
    icon: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    line: "bg-[var(--color-warning)]",
    badge: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
  },

  emerald: {
    icon: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    line: "bg-[var(--color-success)]",
    badge: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
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
    <div className="flex h-screen overflow-hidden theme-page">

      {/* =====================================================
          SIDEBAR GURU
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

      <div className="flex min-w-0 flex-1 flex-col theme-page">

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

        <main className="flex-1 overflow-y-auto theme-page">

          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

            <div className="space-y-6">

              {/* =================================================
                  HERO
              ================================================== */}

              <section
                className={`
                  relative overflow-hidden rounded-[26px]
                  border ${themePrimarySoftBorder}
                  ${themePrimaryGradient}
                  ${themePrimaryShadow}
                `}
              >

                {/* Decorative surfaces */}

                <div
                  className="
                    pointer-events-none absolute
                    -right-20 -top-24
                    h-72 w-72 rounded-full
                    bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)]
                    blur-3xl
                  "
                />

                <div
                  className="
                    pointer-events-none absolute
                    -bottom-28 left-1/3
                    h-72 w-72 rounded-full
                    bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]
                    blur-3xl
                  "
                />

                <div className="relative px-6 py-7 sm:px-8 lg:px-10 lg:py-8">

                  <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                    {/* LEFT */}

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className="
                            inline-flex items-center gap-2
                            rounded-full
                            border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)]
                            bg-[color-mix(in_srgb,var(--color-card)_8%,transparent)]
                            px-3 py-1.5
                            text-[10px] font-semibold
                            text-[var(--color-card)]
                          "
                        >
                          <NotebookPen size={12} />
                          PENILAIAN AKADEMIK
                        </span>

                        <span
                          className="
                            inline-flex items-center gap-1.5
                            rounded-full
                            border border-[color-mix(in_srgb,var(--color-success)_22%,transparent)]
                            bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
                            px-3 py-1.5
                            text-[10px] font-semibold
                            text-[var(--color-success)]
                          "
                        >
                          <span
                            className="
                              h-1.5 w-1.5 rounded-full
                              bg-[var(--color-success)]
                            "
                          />

                          Semester aktif
                        </span>

                      </div>

                      <h1
                        className="
                          mt-4
                          text-2xl font-bold tracking-tight
                          text-[var(--color-card)]
                          sm:text-3xl lg:text-[36px]
                        "
                      >
                        Nilai {MATA_PELAJARAN}
                      </h1>

                      <p
                        className="
                          mt-2 max-w-2xl
                          text-sm leading-6
                          text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]
                        "
                      >
                        Pusat pengelolaan penilaian siswa.
                        Saat ini tersedia fitur export rekap
                        nilai dari backend SmartSchool.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">

                        <button
                          type="button"
                          onClick={handleExportNilai}
                          disabled={isExporting}
                          className="
                            inline-flex items-center gap-2
                            rounded-xl
                            bg-[var(--color-card)]
                            px-4 py-2.5
                            text-xs font-bold
                            text-[var(--color-primary)]
                            shadow-[0_8px_18px_color-mix(in_srgb,var(--color-text)_12%,transparent)]
                            transition
                            hover:bg-[color-mix(in_srgb,var(--color-card)_92%,var(--color-primary))]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {isExporting ? (
                            <span
                              className="
                                h-4 w-4 animate-spin
                                rounded-full
                                border-2
                                border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]
                                border-t-[var(--color-primary)]
                              "
                            />
                          ) : (
                            <Download size={15} />
                          )}

                          {isExporting
                            ? "Menyiapkan..."
                            : "Export Rekap Nilai"}
                        </button>

                        <span
                          className="
                            inline-flex items-center gap-2
                            rounded-xl
                            border
                            border-[color-mix(in_srgb,var(--color-card)_16%,transparent)]
                            bg-[color-mix(in_srgb,var(--color-card)_6%,transparent)]
                            px-4 py-2.5
                            text-xs font-medium
                            text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]
                          "
                        >
                          <Users size={14} />
                          Backend Nilai aktif
                        </span>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[430px]">

                      {/* REKAP */}

                      <div
                        className="
                          rounded-2xl
                          border
                          border-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
                          bg-[color-mix(in_srgb,var(--color-card)_7%,transparent)]
                          p-4 backdrop-blur-sm
                        "
                      >

                        <div
                          className="
                            flex h-9 w-9 items-center
                            justify-center rounded-xl
                            bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]
                            text-[var(--color-info)]
                          "
                        >
                          <BarChart3 size={17} />
                        </div>

                        <p
                          className="
                            mt-4 text-[10px] font-medium
                            text-[color-mix(in_srgb,var(--color-card)_48%,transparent)]
                          "
                        >
                          Rekap
                        </p>

                        <p
                          className="
                            mt-1 text-xl font-bold
                            text-[var(--color-card)]
                          "
                        >
                          Excel
                        </p>

                      </div>

                      {/* SUMBER */}

                      <div
                        className="
                          rounded-2xl
                          border
                          border-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
                          bg-[color-mix(in_srgb,var(--color-card)_7%,transparent)]
                          p-4 backdrop-blur-sm
                        "
                      >

                        <div
                          className="
                            flex h-9 w-9 items-center
                            justify-center rounded-xl
                            bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]
                            text-[var(--color-success)]
                          "
                        >
                          <NotebookPen size={17} />
                        </div>

                        <p
                          className="
                            mt-4 text-[10px] font-medium
                            text-[color-mix(in_srgb,var(--color-card)_48%,transparent)]
                          "
                        >
                          Sumber
                        </p>

                        <p
                          className="
                            mt-1 text-xl font-bold
                            text-[var(--color-card)]
                          "
                        >
                          BE
                        </p>

                      </div>

                      {/* MODUL */}

                      <div
                        className="
                          col-span-2 rounded-2xl
                          border
                          border-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
                          bg-[color-mix(in_srgb,var(--color-card)_7%,transparent)]
                          p-4 backdrop-blur-sm
                          sm:col-span-1
                        "
                      >

                        <div
                          className="
                            flex h-9 w-9 items-center
                            justify-center rounded-xl
                            bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]
                            text-[var(--color-warning)]
                          "
                        >
                          <LockKeyhole size={17} />
                        </div>

                        <p
                          className="
                            mt-4 text-[10px] font-medium
                            text-[color-mix(in_srgb,var(--color-card)_48%,transparent)]
                          "
                        >
                          Modul
                        </p>

                        <p
                          className="
                            mt-1 text-xl font-bold
                            text-[var(--color-card)]
                          "
                        >
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
                <div
                  className={`
                    rounded-2xl border
                    ${themeSuccessBorder}
                    ${themeSuccessSurface}
                    px-4 py-3.5
                  `}
                >

                  <p
                    className="
                      text-xs font-bold
                      text-[var(--color-success)]
                    "
                  >
                    Export berhasil
                  </p>

                  <p
                    className="
                      mt-0.5 text-[11px] leading-5
                      text-[var(--color-success)]
                    "
                  >
                    {exportSuccess}
                  </p>

                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================== */}

              {exportError && (
                <div
                  className={`
                    flex items-start gap-3
                    rounded-2xl border
                    ${themeDangerBorder}
                    ${themeDangerSurface}
                    px-4 py-3.5
                  `}
                >

                  <div
                    className={`
                      flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-lg border
                      ${themeNeutralBorder}
                      theme-card
                      theme-danger
                    `}
                  >
                    <AlertTriangle size={15} />
                  </div>

                  <div>

                    <p className="text-xs font-bold theme-danger">
                      Export gagal
                    </p>

                    <p className="mt-0.5 text-[11px] leading-5 theme-danger">
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

                    <p
                      className="
                        text-[10px] font-bold
                        uppercase tracking-[0.18em]
                        text-[var(--color-primary)]
                      "
                    >
                      Pengelolaan
                    </p>

                    <h2 className="mt-1 text-lg font-bold theme-text">
                      Kelola penilaian
                    </h2>

                    <p className="mt-1 text-xs theme-text-secondary">
                      Modul penilaian akan tersedia sesuai
                      endpoint backend yang aktif.
                    </p>

                  </div>

                  <span
                    className="
                      hidden text-[10px] font-medium
                      theme-text-muted
                      sm:block
                    "
                  >
                    3 modul dirancang
                  </span>

                </div>

                <div className="grid gap-4 md:grid-cols-3">

                  {subHalaman.map((item) => {

                    const Icon = item.icon;
                    const colors = colorConfig[item.color];

                    return (
                      <div
                        key={item.key}
                        className={`
                          group relative overflow-hidden
                          rounded-2xl border
                          ${themeNeutralBorder}
                          theme-card
                          p-5
                          ${themeCardShadow}
                          transition-all
                          ${themeNeutralHover}
                        `}
                      >

                        <div
                          className={`
                            absolute inset-x-0 top-0 h-1
                            ${colors.line}
                          `}
                        />

                        <div className="flex items-start justify-between">

                          <div
                            className={`
                              flex h-11 w-11
                              items-center justify-center
                              rounded-xl border
                              ${colors.icon}
                            `}
                          >
                            <Icon size={19} />
                          </div>

                          <div
                            className={`
                              flex h-8 w-8
                              items-center justify-center
                              rounded-lg border
                              ${themeNeutralBorder}
                              ${themeNeutralSurface}
                              theme-text-muted
                            `}
                          >
                            <LockKeyhole size={14} />
                          </div>

                        </div>

                        <div className="mt-5">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-sm font-bold theme-text">
                              {item.label}
                            </h3>

                            <span
                              className={`
                                rounded-full border
                                px-2 py-0.5
                                text-[9px] font-semibold
                                ${colors.badge}
                              `}
                            >
                              {item.tag}
                            </span>

                          </div>

                          <p
                            className="
                              mt-2 min-h-[38px]
                              text-xs leading-5
                              theme-text-secondary
                            "
                          >
                            {item.description}
                          </p>

                        </div>

                        <div
                          className={`
                            mt-5 flex items-center
                            justify-between
                            border-t ${themeDivider}
                            pt-4
                          `}
                        >

                          <span
                            className="
                              inline-flex items-center gap-1.5
                              text-[10px] font-medium
                              theme-text-muted
                            "
                          >
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

              <section
                className={`
                  overflow-hidden rounded-2xl
                  border ${themeNeutralBorder}
                  theme-card
                  ${themeCardShadow}
                `}
              >

                <div
                  className={`
                    border-b ${themeDivider}
                    px-5 py-5 sm:px-6
                  `}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl border
                        ${themeInfoBorder}
                        ${themeInfoSurface}
                        text-[var(--color-info)]
                      `}
                    >
                      <NotebookPen size={18} />
                    </div>

                    <div>

                      <h2 className="text-sm font-bold theme-text">
                        Status backend Nilai
                      </h2>

                      <p className="mt-0.5 text-[10px] theme-text-muted">
                        Fitur yang tersedia pada backend saat ini.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">

                  {/* EXPORT */}

                  <div
                    className={`
                      rounded-2xl border
                      ${themeSuccessBorder}
                      ${themeSuccessSurface}
                      p-4
                    `}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-xl border
                          ${themeSuccessBorder}
                          bg-[color-mix(in_srgb,var(--color-success)_13%,transparent)]
                          text-[var(--color-success)]
                        `}
                      >
                        <Download size={16} />
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-xs font-bold theme-text">
                            Export Rekap Nilai
                          </h3>

                          <span
                            className={`
                              rounded-full border
                              ${themeSuccessBorder}
                              ${themeSuccessSurface}
                              px-2 py-0.5
                              text-[9px] font-bold
                              text-[var(--color-success)]
                            `}
                          >
                            Aktif
                          </span>

                        </div>

                        <p
                          className="
                            mt-1 text-[10px]
                            leading-5 theme-text-secondary
                          "
                        >
                          Mengambil data nilai dan hasil asesmen
                          dari backend dan mengunduhnya dalam
                          format Excel.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* ENDPOINT */}

                  <div
                    className={`
                      rounded-2xl border
                      ${themeInfoBorder}
                      ${themeInfoSurface}
                      p-4
                    `}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-xl border
                          ${themeInfoBorder}
                          bg-[color-mix(in_srgb,var(--color-info)_13%,transparent)]
                          text-[var(--color-info)]
                        `}
                      >
                        <BarChart3 size={16} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="text-xs font-bold theme-text">
                          Endpoint aktif
                        </h3>

                        <code
                          className={`
                            mt-2 block break-all
                            rounded-lg border
                            ${themeNeutralBorder}
                            theme-card
                            px-3 py-2
                            text-[10px] font-medium
                            text-[var(--color-info)]
                          `}
                        >
                          GET /api/nilai/export
                        </code>

                      </div>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  EXPORT CARD
              ================================================== */}

              <section
                className={`
                  overflow-hidden rounded-2xl
                  border ${themePrimarySoftBorder}
                  ${themePrimarySoft}
                `}
              >

                <div
                  className="
                    flex flex-col gap-5
                    p-5 sm:flex-row
                    sm:items-center sm:justify-between
                    sm:p-6
                  "
                >

                  <div className="flex items-start gap-4">

                    <div
                      className={`
                        flex h-11 w-11 shrink-0
                        items-center justify-center
                        rounded-xl
                        ${themePrimaryGradient}
                        text-[var(--color-card)]
                        ${themePrimaryShadow}
                      `}
                    >
                      <Download size={18} />
                    </div>

                    <div>

                      <h3 className="text-sm font-bold theme-text">
                        Export rekap nilai
                      </h3>

                      <p
                        className="
                          mt-1 max-w-xl
                          text-xs leading-5
                          theme-text-secondary
                        "
                      >
                        Unduh rekap nilai dan hasil asesmen
                        dari backend dalam format Excel.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={handleExportNilai}
                    disabled={isExporting}
                    className={`
                      inline-flex shrink-0
                      items-center justify-center
                      gap-2 rounded-xl
                      ${themePrimaryGradient}
                      px-4 py-2.5
                      text-xs font-bold
                      text-[var(--color-card)]
                      ${themePrimaryShadow}
                      transition-all
                      hover:opacity-90
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    `}
                  >

                    {isExporting ? (
                      <span
                        className="
                          h-4 w-4 animate-spin
                          rounded-full
                          border-2
                          border-[color-mix(in_srgb,var(--color-card)_35%,transparent)]
                          border-t-[var(--color-card)]
                        "
                      />
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

              <div
                className={`
                  flex flex-col gap-2
                  border-t ${themeDivider}
                  pt-5
                  text-[10px]
                  theme-text-muted
                  sm:flex-row sm:items-center
                  sm:justify-between
                `}
              >

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