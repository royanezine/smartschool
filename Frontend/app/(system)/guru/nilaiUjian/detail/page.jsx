"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import { getDetailUjian } from "@/services/ujian.service";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  MinusCircle,
  Target,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";

// ============================================================
// THEME HELPERS (sama persis dengan halaman list agar konsisten)
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

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

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

// ============================================================
// HELPERS
// ============================================================

function parseObject(response) {
  if (!response) return null;
  if (
    response?.data?.data &&
    typeof response.data.data === "object" &&
    !Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }
  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }
  return response;
}

function normalizeId(value) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function formatDateTime(date) {
  if (!date) return "-";
  try {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed);
  } catch {
    return "-";
  }
}

function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || minutes === "") return "-";
  const total = Number(minutes);
  if (Number.isNaN(total)) return "-";
  if (total < 60) return `${total} menit`;
  const hours = Math.floor(total / 60);
  const remaining = total % 60;
  if (remaining === 0) return `${hours} jam`;
  return `${hours} jam ${remaining} menit`;
}

function getJenisLabel(jenis) {
  if (!jenis) return "Ujian";
  const value = String(jenis).toLowerCase();
  const labels = {
    uts: "UTS",
    uas: "UAS",
    quiz: "Quiz",
    kuis: "Quiz",
    tugas: "Tugas",
    ujian: "Ujian",
    asesmen: "Asesmen",
  };
  return labels[value] || jenis;
}

function getNilai(item) {
  if (!item) return 0;
  const hasil =
    item.hasilAsesmen ||
    item.hasilUjian ||
    item.hasil ||
    item.result ||
    null;
  const candidates = [
    item.nilai,
    item.totalNilai,
    item.skor,
    item.score,
    hasil?.totalNilai,
    hasil?.nilai,
    hasil?.skor,
  ];
  for (const value of candidates) {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return 0;
}

function getBenar(item) {
  const hasil = item?.hasilAsesmen || item?.hasilUjian || item?.hasil || null;
  return Number(hasil?.jumlahBenar ?? item?.jumlahBenar ?? item?.benar ?? 0);
}

function getSalah(item) {
  const hasil = item?.hasilAsesmen || item?.hasilUjian || item?.hasil || null;
  return Number(hasil?.jumlahSalah ?? item?.jumlahSalah ?? item?.salah ?? 0);
}

function getLewati(item) {
  const hasil = item?.hasilAsesmen || item?.hasilUjian || item?.hasil || null;
  return Number(hasil?.jumlahLewati ?? item?.jumlahLewati ?? item?.lewati ?? 0);
}

function getStatus(item) {
  if (!item) return "belum_mengerjakan";
  const hasil = item.hasilAsesmen || item.hasilUjian || item.hasil || null;
  const raw =
    item.status || item.statusPengerjaan || item.statusUjian || "";
  const value = String(raw).toLowerCase().trim();

  if (
    ["selesai", "completed", "submitted", "dikumpulkan"].includes(value) ||
    hasil ||
    item.selesaiPada ||
    item.waktuSelesai
  ) {
    return "selesai";
  }
  if (["berlangsung", "in_progress", "progress", "mengerjakan"].includes(value)) {
    return "berlangsung";
  }
  if (["dibatalkan", "cancelled"].includes(value)) {
    return "dibatalkan";
  }
  return "belum_mengerjakan";
}

function getStatusLabel(status) {
  switch (status) {
    case "selesai":
      return "Selesai";
    case "berlangsung":
      return "Berlangsung";
    case "dibatalkan":
      return "Dibatalkan";
    default:
      return "Belum Mengerjakan";
  }
}

function getStatusClasses(status) {
  switch (status) {
    case "selesai":
      return `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`;
    case "berlangsung":
      return `${themeInfoSurface} ${themeInfoBorder} text-[var(--color-info)]`;
    case "dibatalkan":
      return `${themeDangerSurface} ${themeDangerBorder} theme-danger`;
    default:
      return `${themeNeutralSurface} ${themeNeutralBorder} theme-text-secondary`;
  }
}

function getScoreClasses(score) {
  if (score >= 85) return "text-[var(--color-success)]";
  if (score >= 70) return "text-[var(--color-info)]";
  if (score >= 60) return "text-[var(--color-warning)]";
  return "theme-danger";
}

function getScoreLabel(score) {
  if (score >= 85) return "Sangat Baik";
  if (score >= 70) return "Baik";
  if (score >= 60) return "Cukup";
  return "Perlu Perbaikan";
}

// ============================================================
// PAGE
// ============================================================

export default function DetailNilaiSiswaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ujianId = searchParams.get("ujianId");
  const siswaId = searchParams.get("siswaId");

  // Ambil data dari sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selectedNilaiDetail");
      if (!raw) {
        setError("Data detail tidak ditemukan. Silakan kembali dan pilih ulang.");
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      setData(parsed);
    } catch {
      setError("Gagal memuat data detail.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fallback: fetch detail ujian kalau tidak ada sessionStorage
  useEffect(() => {
    if (data || !ujianId) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await getDetailUjian(ujianId);
        const detail = parseObject(res);
        if (!cancelled && detail) {
          setData({
            siswa: null,
            ujian: {
              id: ujianId,
              nama: detail.judul || detail.nama || "Ujian",
              jenis: detail.tipe || detail.jenis || "ujian",
              mataPelajaran: detail.kelasMapel?.mataPelajaran?.nama || "-",
              namaKelas: detail.kelasMapel?.kelas?.nama || "-",
              jumlahSoal:
                detail._count?.soalAsesmen ||
                detail.soalAsesmen?.length ||
                detail._count?.soalUjian ||
                0,
              durasi: detail.durasi,
              tanggalMulai: detail.waktuMulai,
            },
          });
        }
      } catch {
        if (!cancelled) setError("Gagal memuat data ujian.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data, ujianId]);

  const siswa = data?.siswa || null;
  const ujian = data?.ujian || null;

  const nilai = useMemo(() => getNilai(siswa), [siswa]);
  const status = useMemo(() => getStatus(siswa), [siswa]);
  const benar = useMemo(() => getBenar(siswa), [siswa]);
  const salah = useMemo(() => getSalah(siswa), [siswa]);
  const lewati = useMemo(() => getLewati(siswa), [siswa]);

  const totalDijawab = benar + salah + lewati;
  const persenBenar =
    totalDijawab > 0 ? Math.round((benar / totalDijawab) * 100) : 0;

  const waktuMulai =
    siswa?.waktuMulai ||
    siswa?.dimulaiPada ||
    siswa?.mulaiPada ||
    siswa?.startedAt ||
    null;

  const waktuSelesai =
    siswa?.waktuSelesai ||
    siswa?.selesaiPada ||
    siswa?.submittedAt ||
    null;

  const durasiPengerjaan = useMemo(() => {
    if (!waktuMulai || !waktuSelesai) return null;
    const start = new Date(waktuMulai).getTime();
    const end = new Date(waktuSelesai).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    return Math.max(0, Math.round((end - start) / 60000));
  }, [waktuMulai, waktuSelesai]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          role="guru"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <Header
            notifications={[]}
            user={{ name: "Guru", email: "guru@smartschool.com", avatar: "GR" }}
          />
          <main className="flex flex-1 items-center justify-center p-6">
            <div
              className={`theme-card w-full max-w-sm rounded-2xl border ${themeNeutralBorder} p-8 text-center ${themeCardShadow}`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
              >
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <h2 className="theme-text mt-5 text-base font-bold">
                Memuat detail nilai
              </h2>
              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Sedang menyiapkan data hasil pengerjaan siswa.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !siswa || !ujian) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          role="guru"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <Header
            notifications={[]}
            user={{ name: "Guru", email: "guru@smartschool.com", avatar: "GR" }}
          />
          <main className="flex flex-1 items-center justify-center p-6">
            <div
              className={`theme-card w-full max-w-md rounded-2xl border ${themeNeutralBorder} p-8 text-center ${themeCardShadow}`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeDangerSurface} theme-danger`}
              >
                <AlertCircle className="h-7 w-7" />
              </div>
              <h2 className="theme-text mt-5 text-base font-bold">
                {!error && ujian && !siswa
                  ? "Hasil pengerjaan belum tersedia"
                  : "Data tidak ditemukan"}
              </h2>
              <p className="theme-text-secondary mt-2 text-sm leading-6">
                {error ||
                  (!siswa && ujian
                    ? "Endpoint detail ujian belum mengirimkan data percobaan atau hasil pengerjaan siswa. Nilai dan rincian jawaban belum dapat ditampilkan."
                    : "Data detail siswa tidak tersedia.")}
              </p>
              <button
                type="button"
                onClick={() => router.back()}
                className={`mt-6 inline-flex items-center gap-2 rounded-xl ${themePrimaryGradient} px-5 py-2.5 text-sm font-bold text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90`}
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="guru"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header
          notifications={[]}
          user={{ name: "Guru", email: "guru@smartschool.com", avatar: "GR" }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">
            {/* =====================================================
                BREADCRUMB
            ====================================================== */}

            <nav className="mb-5 flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => router.push("/guru/nilaiUjian")}
                className="theme-text-secondary font-medium transition hover:text-[var(--color-primary)]"
              >
                Nilai Ujian
              </button>
              <ChevronRight className="theme-text-muted h-3.5 w-3.5" />
              <span className="theme-text font-semibold">Detail Siswa</span>
            </nav>

            {/* =====================================================
                HERO / PROFILE SISWA
            ====================================================== */}

            <section
              className={`relative mb-6 overflow-hidden rounded-3xl ${themePrimaryGradient} ${themePrimaryShadow}`}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
              </div>

              <div className="relative p-6 md:p-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl font-bold text-white backdrop-blur-sm">
                      {String(siswa.namaLengkap || "S")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <User className="h-3.5 w-3.5" />
                        PROFIL SISWA
                      </div>

                      <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                        {siswa.namaLengkap || "Nama siswa belum tersedia"}
                      </h1>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                        <span>NIS: {siswa.nis || "-"}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
                        <span>NISN: {siswa.nisn || "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* SCORE CARD */}
                  <div className="w-full max-w-xs rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:w-auto">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Nilai Akhir
                    </p>

                    <div className="mt-2 flex items-end gap-3">
                      <p className="text-5xl font-bold text-white">
                        {status === "belum_mengerjakan"
                          ? "—"
                          : nilai.toFixed(0)}
                      </p>

                      {status !== "belum_mengerjakan" && (
                        <span className="mb-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                          {getScoreLabel(nilai)}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                      <span className="h-2 w-2 rounded-full bg-white" />
                      {getStatusLabel(status)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                INFO UJIAN
            ====================================================== */}

            <section
              className={`theme-card mb-6 rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="theme-text font-bold">Informasi Ujian</h2>
                  <p className="theme-text-secondary mt-0.5 text-xs">
                    Detail ujian yang dikerjakan siswa
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: FileText,
                    label: "Ujian",
                    value: ujian.nama || "-",
                  },
                  {
                    icon: BookOpen,
                    label: "Mata Pelajaran",
                    value: ujian.mataPelajaran || "-",
                  },
                  {
                    icon: GraduationCap,
                    label: "Kelas",
                    value: ujian.namaKelas || "-",
                  },
                  {
                    icon: Target,
                    label: "Jenis",
                    value: getJenisLabel(ujian.jenis),
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className={`rounded-xl ${themeNeutralSurface} p-4`}
                  >
                    <div className="theme-text-secondary flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                    <p className="theme-text mt-2 truncate text-sm font-bold">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div
                  className={`flex items-center gap-3 rounded-xl border ${themeNeutralBorder} p-4`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}
                  >
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                      Jumlah Soal
                    </p>
                    <p className="theme-text mt-0.5 text-sm font-bold">
                      {ujian.jumlahSoal || 0} soal
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 rounded-xl border ${themeNeutralBorder} p-4`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeWarningSurface} text-[var(--color-warning)]`}
                  >
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                      Durasi
                    </p>
                    <p className="theme-text mt-0.5 text-sm font-bold">
                      {formatDuration(ujian.durasi)}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 rounded-xl border ${themeNeutralBorder} p-4`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                      Tanggal Ujian
                    </p>
                    <p className="theme-text mt-0.5 text-sm font-bold">
                      {ujian.tanggalMulai
                        ? formatDateTime(ujian.tanggalMulai).split(",")[0]
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                RINGKASAN JAWABAN
            ====================================================== */}

            {status !== "belum_mengerjakan" && (
              <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* BENAR */}
                <div
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wider">
                        Jawaban Benar
                      </p>
                      <p className="mt-2 text-3xl font-bold text-[var(--color-success)]">
                        {benar}
                      </p>
                      <p className="theme-text-muted mt-1 text-xs">
                        {persenBenar}% dari total
                      </p>
                    </div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeSuccessSurface} text-[var(--color-success)]`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>

                  <div
                    className={`mt-4 h-1.5 overflow-hidden rounded-full ${themeNeutralSurface}`}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--color-success)] transition-all duration-500"
                      style={{ width: `${persenBenar}%` }}
                    />
                  </div>
                </div>

                {/* SALAH */}
                <div
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wider">
                        Jawaban Salah
                      </p>
                      <p className="mt-2 text-3xl font-bold theme-danger">
                        {salah}
                      </p>
                      <p className="theme-text-muted mt-1 text-xs">
                        Perlu dipelajari ulang
                      </p>
                    </div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeDangerSurface} theme-danger`}
                    >
                      <XCircle className="h-5 w-5" />
                    </div>
                  </div>

                  <div
                    className={`mt-4 h-1.5 overflow-hidden rounded-full ${themeNeutralSurface}`}
                  >
                    <div
                      className="theme-danger h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          totalDijawab > 0
                            ? Math.round((salah / totalDijawab) * 100)
                            : 0
                        }%`,
                        background: "var(--color-danger, #dc2626)",
                      }}
                    />
                  </div>
                </div>

                {/* LEWATI */}
                <div
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wider">
                        Dilewati
                      </p>
                      <p className="theme-text-secondary mt-2 text-3xl font-bold">
                        {lewati}
                      </p>
                      <p className="theme-text-muted mt-1 text-xs">
                        Tidak dijawab
                      </p>
                    </div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeNeutralSurface} theme-text-secondary`}
                    >
                      <MinusCircle className="h-5 w-5" />
                    </div>
                  </div>

                  <div
                    className={`mt-4 h-1.5 overflow-hidden rounded-full ${themeNeutralSurface}`}
                  >
                    <div
                      className={`theme-text-secondary h-full rounded-full transition-all duration-500 ${themeNeutralSurface}`}
                      style={{
                        width: `${
                          totalDijawab > 0
                            ? Math.round((lewati / totalDijawab) * 100)
                            : 0
                        }%`,
                        background: "color-mix(in srgb, var(--color-text) 30%, transparent)",
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* =====================================================
                WAKTU PENGERJAAN
            ====================================================== */}

            <section
              className={`theme-card mb-6 rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)]`}
                >
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="theme-text font-bold">Waktu Pengerjaan</h2>
                  <p className="theme-text-secondary mt-0.5 text-xs">
                    Timeline pengerjaan siswa
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className={`rounded-xl ${themeNeutralSurface} p-4`}>
                  <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                    Waktu Mulai
                  </p>
                  <p className="theme-text mt-2 text-sm font-bold">
                    {waktuMulai ? formatDateTime(waktuMulai) : "Belum mulai"}
                  </p>
                </div>

                <div className={`rounded-xl ${themeNeutralSurface} p-4`}>
                  <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                    Waktu Selesai
                  </p>
                  <p className="theme-text mt-2 text-sm font-bold">
                    {waktuSelesai
                      ? formatDateTime(waktuSelesai)
                      : "Belum selesai"}
                  </p>
                </div>

                <div className={`rounded-xl ${themeNeutralSurface} p-4`}>
                  <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                    Durasi Aktual
                  </p>
                  <p className="theme-text mt-2 text-sm font-bold">
                    {durasiPengerjaan !== null
                      ? formatDuration(durasiPengerjaan)
                      : "-"}
                  </p>
                </div>
              </div>
            </section>

            {/* =====================================================
                ANALISIS NILAI
            ====================================================== */}

            {status !== "belum_mengerjakan" && (
              <section
                className={`theme-card mb-6 rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="theme-text font-bold">Analisis Nilai</h2>
                    <p className="theme-text-secondary mt-0.5 text-xs">
                      Ringkasan performa siswa
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div
                    className={`flex items-center gap-4 rounded-xl border ${themeNeutralBorder} p-5`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Nilai Akhir
                      </p>
                      <p
                        className={`mt-1 text-2xl font-bold ${getScoreClasses(nilai)}`}
                      >
                        {nilai.toFixed(0)}
                      </p>
                      <p className="theme-text-secondary mt-0.5 text-xs">
                        {getScoreLabel(nilai)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-4 rounded-xl border ${themeNeutralBorder} p-5`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${themeSuccessSurface} text-[var(--color-success)]`}
                    >
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Akurasi Jawaban
                      </p>
                      <p className="theme-text mt-1 text-2xl font-bold">
                        {persenBenar}%
                      </p>
                      <p className="theme-text-secondary mt-0.5 text-xs">
                        {benar} dari {totalDijawab} soal
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =====================================================
                HASIL TERSIMPAN
            ====================================================== */}

            {(siswa.hasilAsesmen || siswa.hasilUjian || siswa.hasil) && (
              <section
                className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-5`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)]`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-info)]">
                      Hasil ujian tersimpan
                    </p>
                    <p className="theme-text-secondary mt-1 text-xs leading-5">
                      Nilai yang ditampilkan menggunakan hasil yang dihitung
                      dan dikirim oleh backend.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =====================================================
                ACTION BUTTONS
            ====================================================== */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/guru/nilaiUjian")}
                className={`theme-card inline-flex items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-5 py-2.5 text-sm font-bold theme-text-secondary ${themeSmallShadow} transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]`}
              >
                Kembali ke Daftar Nilai
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}