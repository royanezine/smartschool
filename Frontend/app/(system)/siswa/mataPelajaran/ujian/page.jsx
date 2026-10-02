"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  BookOpen,
  Palette,
  Music,
  Dumbbell,
  CalendarClock,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Award,
} from "lucide-react";

/* =========================================================
   DATA MATA PELAJARAN
========================================================= */

const mataPelajaranList = [
  {
    id: "matematika",
    nama: "Matematika",
    guru: "Bu Sari",
    icon: Calculator,
  },
  {
    id: "bindo",
    nama: "Bahasa Indonesia",
    guru: "Pak Budi",
    icon: Languages,
  },
  {
    id: "ipa",
    nama: "IPA",
    guru: "Bu Dewi",
    icon: FlaskConical,
  },
  {
    id: "ips",
    nama: "IPS",
    guru: "Pak Anwar",
    icon: Globe2,
  },
  {
    id: "binggris",
    nama: "Bahasa Inggris",
    guru: "Bu Rina",
    icon: BookOpen,
  },
  {
    id: "seni",
    nama: "Seni Budaya",
    guru: "Bu Wulan",
    icon: Palette,
  },
  {
    id: "musik",
    nama: "Seni Musik",
    guru: "Pak Doni",
    icon: Music,
  },
  {
    id: "penjas",
    nama: "Penjaskes",
    guru: "Pak Rudi",
    icon: Dumbbell,
  },
];

/* =========================================================
   THEME HELPERS
   Mengikuti token global theme
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralSurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeInfoText =
  "text-[var(--color-info)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeSuccessText =
  "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText =
  "text-[var(--color-warning)]";

const themeTextOnPrimary =
  "text-[var(--color-card)]";

const themeCard =
  "theme-card";

const themeText =
  "theme-text";

const themeTextSecondary =
  "theme-text-secondary";

const themeTextMuted =
  "theme-text-muted";

/* =========================================================
   STATUS UJIAN
========================================================= */

const STATUS_STYLE = {
  mendatang: {
    label: "Mendatang",
    surface: themeInfoSurface,
    border: themeInfoBorder,
    text: themeInfoText,
    icon: CalendarClock,
  },

  berlangsung: {
    label: "Bisa Dikerjakan",
    surface: themeWarningSurface,
    border: themeWarningBorder,
    text: themeWarningText,
    icon: PlayCircle,
  },

  selesai: {
    label: "Selesai",
    surface: themeSuccessSurface,
    border: themeSuccessBorder,
    text: themeSuccessText,
    icon: CheckCircle2,
  },
};

/* =========================================================
   DATA UJIAN
========================================================= */

const ujianList = [
  {
    id: 1,
    mapelId: "matematika",
    judul: "Ulangan Harian Bab 4 - Operasi Pecahan",
    tipe: "Ulangan Harian",
    guru: "Bu Sari",
    tanggal: "25 Agu 2026, 08:00",
    durasi: "60 menit",
    status: "mendatang",
    nilai: null,
  },
  {
    id: 2,
    mapelId: "bindo",
    judul: "Ujian Tengah Semester",
    tipe: "UTS",
    guru: "Pak Budi",
    tanggal: "28 Agu 2026, 09:00",
    durasi: "90 menit",
    status: "mendatang",
    nilai: null,
  },
  {
    id: 3,
    mapelId: "binggris",
    judul: "Quiz Grammar Unit 4",
    tipe: "Kuis",
    guru: "Bu Rina",
    tanggal: "20 Agu 2026, 07:30",
    durasi: "30 menit",
    status: "berlangsung",
    nilai: null,
  },
  {
    id: 4,
    mapelId: "ipa",
    judul: "Ulangan Harian Bab 3 - Ekosistem",
    tipe: "Ulangan Harian",
    guru: "Bu Dewi",
    tanggal: "10 Agu 2026, 08:00",
    durasi: "45 menit",
    status: "selesai",
    nilai: 88,
  },
  {
    id: 5,
    mapelId: "matematika",
    judul: "Ulangan Harian Bab 3 - Aljabar",
    tipe: "Ulangan Harian",
    guru: "Bu Sari",
    tanggal: "5 Agu 2026, 08:00",
    durasi: "60 menit",
    status: "selesai",
    nilai: 76,
  },
  {
    id: 6,
    mapelId: "ips",
    judul: "Kuis Sumber Daya Alam",
    tipe: "Kuis",
    guru: "Pak Anwar",
    tanggal: "2 Agu 2026, 10:00",
    durasi: "20 menit",
    status: "selesai",
    nilai: 95,
  },
];

/* =========================================================
   HALAMAN UJIAN
========================================================= */

function UjianPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mapelParam = searchParams.get("mapel");

  const [activeMapel, setActiveMapel] = useState(
    mapelParam || "semua"
  );

  const [activeFilter, setActiveFilter] =
    useState("semua");

  /* =======================================================
     MAPEL TERPILIH
  ======================================================= */

  const selectedMapel = mataPelajaranList.find(
    (m) => m.id === activeMapel
  );

  /* =======================================================
     FILTER UJIAN
  ======================================================= */

  const filteredUjian = useMemo(() => {
    return ujianList
      .filter((u) =>
        activeMapel === "semua"
          ? true
          : u.mapelId === activeMapel
      )
      .filter((u) =>
        activeFilter === "semua"
          ? true
          : u.status === activeFilter
      );
  }, [activeMapel, activeFilter]);

  /* =======================================================
     STATISTIK
  ======================================================= */

  const ujianSelesai = ujianList.filter(
    (u) =>
      u.status === "selesai" &&
      u.nilai !== null
  );

  const rataRata =
    ujianSelesai.length > 0
      ? Math.round(
          ujianSelesai.reduce(
            (sum, u) => sum + u.nilai,
            0
          ) / ujianSelesai.length
        )
      : null;

  const jumlahMendatang = ujianList.filter(
    (u) =>
      u.status === "mendatang" ||
      u.status === "berlangsung"
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className={`${themeText} theme-page min-h-full`}>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/siswa/mataPelajaran")
            }
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeCard} ${themeTextSecondary} ${themeSmallShadow} transition hover:${themePrimaryText} hover:${themePrimarySurface}`}
            aria-label="Kembali ke mata pelajaran"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="min-w-0">
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${themePrimaryText}`}
            >
              {selectedMapel
                ? selectedMapel.nama
                : "Semua Mata Pelajaran"}
            </p>

            <h1
              className={`mt-1 text-2xl font-bold tracking-tight ${themeText} sm:text-[28px]`}
            >
              Quiz
            </h1>

            <p
              className={`mt-1 text-sm ${themeTextSecondary}`}
            >
              Jadwal ujian, kuis, dan hasil yang
              sudah dinilai.
            </p>
          </div>
        </div>

        {/* =================================================
            STATISTIK
        ================================================= */}

        <div className="grid grid-cols-2 gap-4">
          {/* UJIAN MENDATANG */}

          <div
            className={`flex items-center gap-3.5 rounded-2xl border ${themeNeutralBorder} ${themeCard} ${themeCardShadow} p-4`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} ${themeInfoText}`}
            >
              <CalendarClock size={20} />
            </div>

            <div className="min-w-0">
              <p
                className={`text-xl font-bold leading-none ${themeText}`}
              >
                {jumlahMendatang}
              </p>

              <p
                className={`mt-1 text-xs ${themeTextMuted}`}
              >
                Ujian mendatang
              </p>
            </div>
          </div>

          {/* RATA-RATA */}

          <div
            className={`flex items-center gap-3.5 rounded-2xl border ${themeNeutralBorder} ${themeCard} ${themeCardShadow} p-4`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySurface} ${themePrimaryText}`}
            >
              <Award size={20} />
            </div>

            <div className="min-w-0">
              <p
                className={`text-xl font-bold leading-none ${themeText}`}
              >
                {rataRata !== null
                  ? rataRata
                  : "-"}
              </p>

              <p
                className={`mt-1 text-xs ${themeTextMuted}`}
              >
                Rata-rata nilai
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTER MAPEL
        ================================================= */}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* SEMUA MAPEL */}

          <button
            type="button"
            onClick={() =>
              setActiveMapel("semua")
            }
            className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              activeMapel === "semua"
                ? `${themePrimaryGradient} ${themeTextOnPrimary} ${themePrimaryBorder} ${themePrimaryShadow}`
                : `${themeCard} ${themeNeutralBorder} ${themeTextSecondary} hover:${themePrimaryText} hover:${themePrimarySurface}`
            }`}
          >
            Semua Mapel
          </button>

          {mataPelajaranList.map((mapel) => {
            const isActive =
              activeMapel === mapel.id;

            return (
              <button
                key={mapel.id}
                type="button"
                onClick={() =>
                  setActiveMapel(mapel.id)
                }
                className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? `${themePrimaryGradient} ${themeTextOnPrimary} ${themePrimaryBorder} ${themePrimaryShadow}`
                    : `${themeCard} ${themeNeutralBorder} ${themeTextSecondary} hover:${themePrimaryText} hover:${themePrimarySurface}`
                }`}
              >
                {mapel.nama}
              </button>
            );
          })}
        </div>

        {/* =================================================
            FILTER STATUS
        ================================================= */}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            "semua",
            "mendatang",
            "berlangsung",
            "selesai",
          ].map((filter) => {
            const isActive =
              activeFilter === filter;

            const status =
              filter !== "semua"
                ? STATUS_STYLE[filter]
                : null;

            return (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setActiveFilter(filter)
                }
                className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? status
                      ? `${status.surface} ${status.border} ${status.text}`
                      : `${themePrimarySurface} ${themePrimaryBorder} ${themePrimaryText}`
                    : `border-transparent ${themeTextSecondary} hover:${themeNeutralSurface}`
                }`}
              >
                {filter === "semua"
                  ? "Semua Status"
                  : STATUS_STYLE[filter].label}
              </button>
            );
          })}
        </div>

        {/* =================================================
            LIST UJIAN
        ================================================= */}

        <div className="space-y-3">
          {filteredUjian.length > 0 ? (
            filteredUjian.map((ujian) => {
              const mapel =
                mataPelajaranList.find(
                  (m) =>
                    m.id === ujian.mapelId
                );

              const status =
                STATUS_STYLE[ujian.status];

              const StatusIcon =
                status.icon;

              return (
                <div
                  key={ujian.id}
                  className={`rounded-2xl border ${themeNeutralBorder} ${themeCard} ${themeCardShadow} p-4 transition hover:${themePrimaryBorder} sm:p-5`}
                >
                  <div className="flex items-start gap-3.5">

                    {/* ICON */}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${status.surface} ${status.text}`}
                    >
                      <GraduationCap
                        size={19}
                      />
                    </div>

                    {/* INFORMASI */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">

                        {/* STATUS */}

                        <span
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${status.surface} ${status.border} ${status.text}`}
                        >
                          <StatusIcon size={10} />
                          {status.label}
                        </span>

                        {/* TIPE */}

                        <span
                          className={`rounded border ${themeNeutralBorder} ${themeNeutralSurface} px-1.5 py-0.5 text-[10px] font-medium ${themeTextMuted}`}
                        >
                          {ujian.tipe}
                        </span>

                        {/* MAPEL */}

                        {activeMapel === "semua" &&
                        mapel ? (
                          <span
                            className={`text-[11px] font-medium ${themeTextMuted}`}
                          >
                            {mapel.nama}
                          </span>
                        ) : null}
                      </div>

                      <p
                        className={`mt-1.5 text-sm font-semibold ${themeText}`}
                      >
                        {ujian.judul}
                      </p>

                      <p
                        className={`mt-0.5 text-xs ${themeTextMuted}`}
                      >
                        {ujian.guru}
                        {" • "}
                        {ujian.tanggal}
                        {" • "}
                        {ujian.durasi}
                      </p>
                    </div>

                    {/* AKSI / NILAI */}

                    {ujian.status ===
                    "selesai" ? (
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-2xl font-bold ${themeSuccessText}`}
                        >
                          {ujian.nilai}
                        </p>

                        <p
                          className={`text-[11px] ${themeTextMuted}`}
                        >
                          Nilai
                        </p>
                      </div>
                    ) : ujian.status ===
                      "berlangsung" ? (
                      <button
                        type="button"
                        className={`flex shrink-0 items-center gap-1 rounded-lg border ${themeWarningBorder} ${themeWarningSurface} ${themeWarningText} px-3 py-2 text-xs font-semibold transition hover:brightness-95`}
                      >
                        Kerjakan

                        <ChevronRight
                          size={13}
                        />
                      </button>
                    ) : (
                      <div className="mt-1 flex shrink-0 items-center justify-center">
                        <ChevronRight
                          size={16}
                          className={themeTextMuted}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div
              className={`rounded-2xl border ${themeNeutralBorder} ${themeCard} ${themeCardShadow} px-5 py-14 text-center`}
            >
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${themeNeutralSurfaceStrong} ${themeTextMuted}`}
              >
                <GraduationCap
                  size={22}
                />
              </div>

              <p
                className={`text-sm font-semibold ${themeText}`}
              >
                Tidak ada ujian
              </p>

              <p
                className={`mt-1 text-xs ${themeTextMuted}`}
              >
                Tidak ada ujian yang cocok
                dengan filter ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default function UjianPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page min-h-full" />
      }
    >
      <UjianPageInner />
    </Suspense>
  );
}