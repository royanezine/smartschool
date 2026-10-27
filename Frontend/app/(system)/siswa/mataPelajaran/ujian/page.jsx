"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  CalendarClock,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getKelasMapelSiswa } from "@/services/kelasMapel.service";
import { getUjianByKelasMapel } from "@/services/ujian.service";


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


function parseList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function getStatusUjian(ujian) {
  const now = new Date();

  const mulai = ujian?.waktuMulai
    ? new Date(ujian.waktuMulai)
    : null;

  const selesai = ujian?.waktuSelesai
    ? new Date(ujian.waktuSelesai)
    : null;

  if (mulai && !Number.isNaN(mulai.getTime()) && now < mulai) {
    return "mendatang";
  }

  if (
    selesai &&
    !Number.isNaN(selesai.getTime()) &&
    now > selesai
  ) {
    return "selesai";
  }

  return "berlangsung";
}

function formatTanggal(value) {
  if (!value) return "Jadwal belum ditentukan";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Jadwal belum ditentukan";
  }

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function UjianPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mapelParam = searchParams.get("mapel");

  const [activeMapel, setActiveMapel] = useState(
    mapelParam || "semua"
  );

  const [activeFilter, setActiveFilter] = useState("semua");
  const [kelasMapelList, setKelasMapelList] = useState([]);
  const [ujianList, setUjianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const kelasMapel = await getKelasMapelSiswa();

      setKelasMapelList(kelasMapel);

      if (kelasMapel.length === 0) {
        setUjianList([]);
        return;
      }

      const hasil = await Promise.allSettled(
        kelasMapel.map(async (km) => {
          const response = await getUjianByKelasMapel(
            String(km.id)
          );

          return parseList(response)
            .filter((ujian) => ujian?.id)
            .map((ujian) => ({
              id: ujian.id,
              mapelId: String(km.id),
              mapelNama:
                km?.mataPelajaran?.nama ||
                "Mata pelajaran",
              judul:
                ujian?.judul || "Ujian tanpa judul",
              tipe:
                ujian?.tipe ||
                ujian?.jenis ||
                "Ujian",
              guru:
                km?.guruPengajar?.namaLengkap || "-",
              tanggal: formatTanggal(
                ujian?.waktuMulai || ujian?.dibuatPada
              ),
              waktuMulai: ujian?.waktuMulai || null,
              waktuSelesai: ujian?.waktuSelesai || null,
              durasi: ujian?.durasi
                ? `${ujian.durasi} menit`
                : "-",
              status: getStatusUjian(ujian),

              nilai: null,
            }));
        })
      );

      const gabungan = [];

      hasil.forEach((result) => {
        if (
          result.status === "fulfilled" &&
          Array.isArray(result.value)
        ) {
          gabungan.push(...result.value);
        }
      });

      const unik = Array.from(
        new Map(
          gabungan.map((item) => [String(item.id), item])
        ).values()
      );

      setUjianList(unik);
    } catch (err) {
      console.error("Gagal memuat ujian siswa:", err);
      setUjianList([]);
      setError(
        err?.message ||
          "Gagal mengambil data ujian. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);


  const daftarMapel = useMemo(() => {
    return kelasMapelList
      .filter((km) => km?.id)
      .map((km) => ({
        id: String(km.id),
        nama:
          km?.mataPelajaran?.nama ||
          "Mata pelajaran",
      }));
  }, [kelasMapelList]);

  const selectedMapel = daftarMapel.find(
    (m) => m.id === activeMapel
  );


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
  }, [ujianList, activeMapel, activeFilter]);


  const jumlahMendatang = ujianList.filter(
    (u) =>
      u.status === "mendatang" ||
      u.status === "berlangsung"
  ).length;

  const jumlahSelesai = ujianList.filter(
    (u) => u.status === "selesai"
  ).length;


  function bukaUjian(ujianId) {
    if (!ujianId) return;
    router.push(`/siswa/ujian/${encodeURIComponent(ujianId)}`);
  }


  return (
    <div className={`${themeText} theme-page min-h-full`}>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">


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
              Ujian & Kuis
            </h1>

            <p
              className={`mt-1 text-sm ${themeTextSecondary}`}
            >
              Jadwal ujian, kuis, dan hasil yang
              sudah dinilai.
            </p>
          </div>
        </div>


        <div className="grid grid-cols-2 gap-4">
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
                {jumlahSelesai}
              </p>

              <p
                className={`mt-1 text-xs ${themeTextMuted}`}
              >
                Ujian selesai
              </p>
            </div>
          </div>
        </div>


        <div className="flex gap-2 overflow-x-auto pb-1">
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

          {daftarMapel.map((mapel) => {
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


        {error && (
          <div
            role="alert"
            className={`flex items-start gap-3 rounded-2xl border ${themeWarningBorder} ${themeWarningSurface} p-4`}
          >
            <AlertCircle
              size={18}
              className={`mt-0.5 shrink-0 ${themeWarningText}`}
            />

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-bold ${themeWarningText}`}
              >
                Data ujian belum dapat dimuat
              </p>

              <p
                className={`mt-1 text-xs leading-5 ${themeTextSecondary}`}
              >
                {error}
              </p>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className={`mt-3 inline-flex items-center gap-2 rounded-lg border ${themeWarningBorder} px-3 py-2 text-xs font-semibold ${themeWarningText} transition disabled:opacity-60`}
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                Coba lagi
              </button>
            </div>
          </div>
        )}


        <div className="space-y-3">
          {loading ? (
            <div
              className={`flex items-center justify-center gap-2 rounded-2xl border ${themeNeutralBorder} ${themeCard} ${themeCardShadow} px-5 py-14`}
            >
              <Loader2
                size={18}
                className={`animate-spin ${themePrimaryText}`}
              />

              <p
                className={`text-sm ${themeTextSecondary}`}
              >
                Memuat ujian...
              </p>
            </div>
          ) : filteredUjian.length > 0 ? (
            filteredUjian.map((ujian) => {
              const mapel = daftarMapel.find(
                (m) => m.id === ujian.mapelId
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


                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${status.surface} ${status.text}`}
                    >
                      <GraduationCap size={19} />
                    </div>


                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${status.surface} ${status.border} ${status.text}`}
                        >
                          <StatusIcon size={10} />
                          {status.label}
                        </span>

                        <span
                          className={`rounded border ${themeNeutralBorder} ${themeNeutralSurface} px-1.5 py-0.5 text-[10px] font-medium ${themeTextMuted}`}
                        >
                          {ujian.tipe}
                        </span>

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


                    {ujian.status ===
                    "selesai" ? (
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-bold ${themeTextMuted}`}
                          title="Nilai per siswa belum tersedia dari endpoint daftar ujian"
                        >
                          -
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
                        onClick={() =>
                          bukaUjian(ujian.id)
                        }
                        className={`flex shrink-0 items-center gap-1 rounded-lg border ${themeWarningBorder} ${themeWarningSurface} ${themeWarningText} px-3 py-2 text-xs font-semibold transition hover:brightness-95`}
                      >
                        Kerjakan

                        <ChevronRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          bukaUjian(ujian.id)
                        }
                        className={`mt-1 flex shrink-0 items-center justify-center rounded-lg p-1 ${themeTextMuted} transition hover:${themePrimaryText}`}
                        aria-label="Lihat detail ujian"
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className={`rounded-2xl border ${themeNeutralBorder} ${themeCard} ${themeCardShadow} px-5 py-14 text-center`}
            >
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${themeNeutralSurfaceStrong} ${themeTextMuted}`}
              >
                <GraduationCap size={22} />
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
