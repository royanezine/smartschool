
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  UserRound,
  Layers3,
  CalendarRange,
  GraduationCap,
  Building2,
} from "lucide-react";

import { getJadwalMengajar } from "@/services/jadwalMengajar.service";

const hariList = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const namaHari = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

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

const themeInfoText = "text-[var(--color-info)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessText = "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningText = "text-[var(--color-warning)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const accentPalette = [
  {
    bg: themePrimarySoft,
    border: themePrimarySoftBorder,
    text: themePrimaryText,
    dot: "bg-[var(--color-primary)]",
    ring: "ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
  },
  {
    bg: themeInfoSurface,
    border: themeInfoBorder,
    text: themeInfoText,
    dot: "bg-[var(--color-info)]",
    ring: "ring-[color-mix(in_srgb,var(--color-info)_18%,transparent)]",
  },
  {
    bg: themeSuccessSurface,
    border: "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
    text: themeSuccessText,
    dot: "bg-[var(--color-success)]",
    ring: "ring-[color-mix(in_srgb,var(--color-success)_18%,transparent)]",
  },
  {
    bg: themeWarningSurface,
    border: "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
    text: themeWarningText,
    dot: "bg-[var(--color-warning)]",
    ring: "ring-[color-mix(in_srgb,var(--color-warning)_18%,transparent)]",
  },
  {
    bg: themeNeutralSurface,
    border: themeNeutralBorder,
    text: "theme-text-secondary",
    dot: "bg-[var(--color-text-muted)]",
    ring: "ring-[color-mix(in_srgb,var(--color-text)_12%,transparent)]",
  },
];

function getHariAwal() {
  const hariIni = namaHari[new Date().getDay()];

  // Daftar jadwal sekolah ditampilkan Senin–Sabtu.
  // Jika hari ini Minggu, mulai dari Senin.
  return hariList.includes(hariIni) ? hariIni : "Senin";
}

function normalisasiHari(hari) {
  return String(hari || "")
    .trim()
    .toLowerCase();
}

function formatTanggalHari(hari) {
  const sekarang = new Date();
  const targetIndex = namaHari.indexOf(hari);

  if (targetIndex === -1) return "";

  let selisih = targetIndex - sekarang.getDay();

  if (selisih < 0) {
    selisih += 7;
  }

  const tanggal = new Date(sekarang);
  tanggal.setDate(sekarang.getDate() + selisih);

  return tanggal.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatJam(jam) {
  if (!jam) return "-";

  const value = String(jam).trim();

  // BE mengirim jam dalam format HH:mm.
  return value.length >= 5 ? value.substring(0, 5) : value;
}

function getNamaKelas(kelas) {
  if (!kelas) return "-";

  if (typeof kelas === "string") {
    return kelas;
  }

  return (
    kelas.nama ||
    kelas.namaKelas ||
    kelas.nama_kelas ||
    kelas.kode ||
    kelas.kodeKelas ||
    kelas.kode_kelas ||
    kelas.tingkat ||
    "-"
  );
}

function getNamaMapel(item) {
  // Mengikuti struktur response BE:
  // kelasMapel.mataPelajaran.nama
  return (
    item?.kelasMapel?.mataPelajaran?.nama ||
    item?.kelasMapel?.mapel?.nama ||
    item?.kelasMapel?.mapel?.namaMapel ||
    item?.mataPelajaran?.nama ||
    item?.mapel?.nama ||
    "Mata Pelajaran belum tersedia"
  );
}

function getNamaGuru(item) {
  // Mengikuti struktur response BE:
  // kelasMapel.guruPengajar.namaLengkap
  return (
    item?.kelasMapel?.guruPengajar?.namaLengkap ||
    item?.kelasMapel?.guruPengajar?.nama ||
    item?.kelasMapel?.guru?.namaLengkap ||
    item?.kelasMapel?.guru?.nama ||
    item?.guru?.namaLengkap ||
    item?.guru?.nama ||
    "Nama guru belum tersedia"
  );
}

function getNamaRuangan(ruangan) {
  if (!ruangan) return "-";

  if (typeof ruangan === "string") {
    return ruangan;
  }

  if (typeof ruangan === "object") {
    return (
      ruangan.nama ||
      ruangan.namaRuangan ||
      ruangan.nama_ruangan ||
      ruangan.kode ||
      "-"
    );
  }

  return String(ruangan);
}

function StatCard({ label, value, icon: Icon, iconClass, loading }) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border px-4 py-4`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs theme-text-muted">{label}</p>
          <p className="mt-1 truncate text-xl font-bold theme-text">
            {loading ? "—" : value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function JadwalCard({ item, index, hariAktif }) {
  const accent = accentPalette[index % accentPalette.length];

  const namaMapel = getNamaMapel(item);
  const namaGuru = getNamaGuru(item);
  const namaKelas = getNamaKelas(item?.kelasMapel?.kelas);
  const namaRuangan = getNamaRuangan(item?.ruangan);

  return (
    <article
      className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b ${themeDivider} ${themeNeutralSurface} px-4 py-3`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accent.bg} ${accent.border}`}
          >
            <Clock3 className={`h-5 w-5 ${accent.text}`} />
          </div>

          <div>
            <p className="text-sm font-bold theme-text">
              {formatJam(item?.jamMulai)} - {formatJam(item?.jamSelesai)}
            </p>
            <p className="mt-0.5 text-[11px] theme-text-muted">
              Jam pelajaran
            </p>
          </div>
        </div>

        <span
          className={`rounded-lg border ${accent.border} ${accent.bg} px-2.5 py-1 text-xs font-semibold ${accent.text}`}
        >
          {hariAktif}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.bg}`}
          >
            <BookOpen className={`h-5 w-5 ${accent.text}`} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] theme-text-muted">Mata Pelajaran</p>
            <p className="mt-1 break-words text-sm font-semibold theme-text">
              {namaMapel}
            </p>

            {namaKelas !== "-" && (
              <p className="mt-1 text-xs theme-text-muted">
                Kelas {namaKelas}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface}`}
          >
            <UserRound className="h-5 w-5 theme-text-muted" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] theme-text-muted">Guru Pengajar</p>
            <p className="mt-1 break-words text-sm font-semibold theme-text">
              {namaGuru}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface}`}
          >
            <MapPin className="h-5 w-5 theme-text-muted" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] theme-text-muted">Ruangan</p>
            <p className="mt-1 break-words text-sm font-medium theme-text-secondary">
              {namaRuangan}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function JadwalSiswaPage() {
  const [hariAktif, setHariAktif] = useState(getHariAwal);
  const [jadwalData, setJadwalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJadwal = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getJadwalMengajar();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            response?.error ||
            "Gagal mengambil data jadwal."
        );
      }

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      setJadwalData(data);
    } catch (err) {
      console.error("Gagal mengambil jadwal:", err);
      setJadwalData([]);
      setError(
        err?.message || "Terjadi kesalahan saat mengambil data jadwal."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJadwal();
  }, [loadJadwal]);

  const jadwalHariIni = useMemo(() => {
    return jadwalData
      .filter(
        (item) =>
          normalisasiHari(item?.hari) === normalisasiHari(hariAktif)
      )
      .sort((a, b) =>
        String(a?.jamMulai || "").localeCompare(
          String(b?.jamMulai || "")
        )
      );
  }, [jadwalData, hariAktif]);

  const kelasSiswa = useMemo(() => {
    const daftarKelas = jadwalData
      .map((item) => getNamaKelas(item?.kelasMapel?.kelas))
      .filter((nama) => nama && nama !== "-");

    return [...new Set(daftarKelas)];
  }, [jadwalData]);

  const namaKelas = useMemo(() => {
    return kelasSiswa.length > 0 ? kelasSiswa.join(", ") : "Kelas";
  }, [kelasSiswa]);

  const statistik = useMemo(() => {
    const mapelUnik = new Set();
    const guruUnik = new Set();
    const ruanganUnik = new Set();

    jadwalData.forEach((item) => {
      const mapel = getNamaMapel(item);
      const guru = getNamaGuru(item);
      const ruangan = getNamaRuangan(item?.ruangan);

      if (mapel && mapel !== "Mata Pelajaran belum tersedia") {
        mapelUnik.add(mapel);
      }

      if (guru && guru !== "Nama guru belum tersedia") {
        guruUnik.add(guru);
      }

      if (ruangan && ruangan !== "-") {
        ruanganUnik.add(ruangan);
      }
    });

    return {
      totalJadwal: jadwalData.length,
      totalHariIni: jadwalHariIni.length,
      totalMapel: mapelUnik.size,
      totalGuru: guruUnik.size,
      totalRuangan: ruanganUnik.size,
      totalKelas: kelasSiswa.length,
    };
  }, [jadwalData, jadwalHariIni, kelasSiswa]);

  const pindahHari = (direction) => {
    const currentIndex = hariList.indexOf(hariAktif);
    const indexAwal = currentIndex === -1 ? 0 : currentIndex;

    const nextIndex =
      (indexAwal + direction + hariList.length) % hariList.length;

    setHariAktif(hariList[nextIndex]);
  };

  return (
    <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <section
          className={`relative mb-6 overflow-hidden rounded-2xl ${themePrimaryGradient} ${themePrimaryShadow}`}
        >
          <div
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full blur-2xl"
            style={{
              background:
                "color-mix(in srgb, var(--color-card) 10%, transparent)",
            }}
          />

          <div
            className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full blur-2xl"
            style={{
              background:
                "color-mix(in srgb, var(--color-info) 18%, transparent)",
            }}
          />

          <div className="relative flex flex-col gap-5 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-card) 14%, transparent)",
                  boxShadow:
                    "inset 0 0 0 1px color-mix(in srgb, var(--color-card) 20%, transparent)",
                }}
              >
                <CalendarDays className="h-6 w-6 text-[var(--color-card)]" />
              </div>

              <div>
                <p
                  className="mb-1 text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{
                    color:
                      "color-mix(in srgb, var(--color-card) 76%, transparent)",
                  }}
                >
                  Akademik
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl">
                  Jadwal Pelajaran
                </h1>

                <p
                  className="mt-1.5 max-w-2xl text-sm"
                  style={{
                    color:
                      "color-mix(in srgb, var(--color-card) 78%, transparent)",
                  }}
                >
                  Lihat jadwal pelajaran, guru, dan ruangan setiap hari.
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background:
                  "color-mix(in srgb, var(--color-card) 10%, transparent)",
                boxShadow:
                  "inset 0 0 0 1px color-mix(in srgb, var(--color-card) 16%, transparent)",
              }}
            >
              <BookOpen className="h-5 w-5 text-[var(--color-card)]" />
              <div>
                <p
                  className="text-[11px]"
                  style={{
                    color:
                      "color-mix(in srgb, var(--color-card) 68%, transparent)",
                  }}
                >
                  Mata Pelajaran
                </p>
                <p className="text-lg font-bold text-[var(--color-card)]">
                  {loading ? "—" : statistik.totalMapel}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistik */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          <StatCard
            label="Total jadwal"
            value={statistik.totalJadwal}
            icon={Layers3}
            iconClass={`${themePrimarySoft} ${themePrimaryText}`}
            loading={loading}
          />

          <StatCard
            label={`Jadwal ${hariAktif}`}
            value={statistik.totalHariIni}
            icon={CalendarRange}
            iconClass={`${themeInfoSurface} ${themeInfoText}`}
            loading={loading}
          />

          <StatCard
            label="Mata pelajaran"
            value={statistik.totalMapel}
            icon={BookOpen}
            iconClass={`${themeSuccessSurface} ${themeSuccessText}`}
            loading={loading}
          />

          <StatCard
            label="Guru pengajar"
            value={statistik.totalGuru}
            icon={GraduationCap}
            iconClass={`${themeWarningSurface} ${themeWarningText}`}
            loading={loading}
          />

          <StatCard
            label="Ruangan"
            value={statistik.totalRuangan}
            icon={Building2}
            iconClass={`${themeNeutralSurface} theme-text-secondary`}
            loading={loading}
          />

          <StatCard
            label="Kelas"
            value={namaKelas}
            icon={GraduationCap}
            iconClass={`${themePrimarySoft} ${themePrimaryText}`}
            loading={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className={`mb-6 flex flex-col gap-4 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 theme-danger" />
              <div>
                <p className="text-sm font-semibold theme-danger">
                  Gagal memuat jadwal
                </p>
                <p className="mt-1 text-xs theme-text-secondary">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadJadwal}
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border ${themeDangerBorder} theme-card px-3.5 py-2 text-xs font-semibold theme-danger transition-colors ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Pilih hari */}
        <section
          className={`mb-6 theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
            <div>
              <p className="text-sm font-semibold theme-text">Pilih Hari</p>
              <p className="mt-0.5 text-xs theme-text-muted">
                Pilih hari untuk melihat jadwal pelajaran.
              </p>
            </div>

            <div className="flex gap-1.5 sm:hidden">
              <button
                type="button"
                onClick={() => pindahHari(-1)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary transition-colors ${themeNeutralHover}`}
                aria-label="Hari sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => pindahHari(1)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary transition-colors ${themeNeutralHover}`}
                aria-label="Hari berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto p-3 sm:p-4">
            <div className="grid min-w-[420px] grid-cols-3 gap-2 sm:min-w-0 sm:grid-cols-6">
              {hariList.map((hari) => {
                const active = hariAktif === hari;

                return (
                  <button
                    key={hari}
                    type="button"
                    onClick={() => setHariAktif(hari)}
                    aria-pressed={active}
                    className={
                      active
                        ? `rounded-xl ${themePrimaryGradient} px-3 py-3 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow}`
                        : `rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-3 text-sm font-semibold theme-text-secondary transition-all ${themeNeutralHover} hover:text-[var(--color-primary)]`
                    }
                  >
                    {hari}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Informasi hari aktif */}
        <section
          className={`mb-6 flex flex-col gap-4 rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft}`}
            >
              <CalendarDays className={`h-5 w-5 ${themePrimaryText}`} />
            </div>

            <div>
              <p className="text-sm font-bold theme-text">{hariAktif}</p>
              <p className="text-xs theme-text-muted">
                {formatTanggalHari(hariAktif)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] theme-text-muted">Kelas</p>
              <p className="text-sm font-semibold theme-text-secondary">
                {namaKelas}
              </p>
            </div>

            <div className="h-8 w-px bg-[var(--color-border)]" />

            <div>
              <p className="text-[11px] theme-text-muted">Jadwal</p>
              <p className="text-sm font-semibold theme-text-secondary">
                {loading ? "—" : `${jadwalHariIni.length} Pelajaran`}
              </p>
            </div>
          </div>
        </section>

        {/* Daftar jadwal */}
        {loading ? (
          <section
            className={`theme-card flex min-h-[300px] items-center justify-center rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
          >
            <div className="flex flex-col items-center">
              <Loader2
                className={`h-8 w-8 animate-spin ${themePrimaryText}`}
              />
              <p className="mt-3 text-sm font-medium theme-text-secondary">
                Memuat jadwal...
              </p>
              <p className="mt-1 text-xs theme-text-muted">
                Mohon tunggu sebentar.
              </p>
            </div>
          </section>
        ) : jadwalHariIni.length > 0 ? (
          <>
            {/* Desktop */}
            <section
              className={`hidden overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} md:block`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className={`border-b ${themeDivider} ${themeNeutralSurface}`}>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Waktu
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Mata Pelajaran
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Guru
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Ruangan
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {jadwalHariIni.map((item, index) => {
                      const accent =
                        accentPalette[index % accentPalette.length];

                      const namaMapel = getNamaMapel(item);
                      const namaGuru = getNamaGuru(item);
                      const kelas = getNamaKelas(item?.kelasMapel?.kelas);
                      const ruangan = getNamaRuangan(item?.ruangan);

                      return (
                        <tr
                          key={item?.id || `${hariAktif}-${index}`}
                          className={`border-b ${themeDivider} last:border-b-0 transition-colors ${themeNeutralHover}`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${accent.bg} ${accent.border}`}
                              >
                                <Clock3 className={`h-4 w-4 ${accent.text}`} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold theme-text">
                                  {formatJam(item?.jamMulai)}
                                </p>
                                <p className="mt-0.5 text-[11px] theme-text-muted">
                                  sampai {formatJam(item?.jamSelesai)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot} ring-4 ${accent.ring}`}
                              />
                              <div>
                                <p className="text-sm font-semibold theme-text">
                                  {namaMapel}
                                </p>
                                {kelas !== "-" && (
                                  <p className="mt-0.5 text-[11px] theme-text-muted">
                                    {kelas}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${themeNeutralSurface}`}
                              >
                                <UserRound className="h-4 w-4 theme-text-muted" />
                              </div>
                              <span className="text-sm theme-text-secondary">
                                {namaGuru}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className={`inline-flex items-center gap-1.5 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1.5`}
                            >
                              <MapPin className="h-3.5 w-3.5 theme-text-muted" />
                              <span className="text-xs font-medium theme-text-secondary">
                                {ruangan}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile */}
            <section className="space-y-3 md:hidden">
              {jadwalHariIni.map((item, index) => (
                <JadwalCard
                  key={item?.id || `${hariAktif}-${index}`}
                  item={item}
                  index={index}
                  hariAktif={hariAktif}
                />
              ))}
            </section>
          </>
        ) : (
          <section
            className={`theme-card flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-dashed ${themeNeutralBorder} px-6 text-center ${themeCardShadow}`}
          >
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${themeNeutralSurface}`}
            >
              <CalendarDays className="h-7 w-7 theme-text-placeholder" />
            </div>

            <h3 className="mt-5 text-base font-bold theme-text">
              Tidak ada jadwal
            </h3>

            <p className="mt-1.5 max-w-md text-sm leading-6 theme-text-muted">
              Belum ada jadwal pelajaran untuk{" "}
              <span className="font-semibold theme-text-secondary">
                {hariAktif}
              </span>
              .
            </p>

            <button
              type="button"
              onClick={loadJadwal}
              disabled={loading}
              className={`mt-5 inline-flex items-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themePrimaryShadow} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Jadwal
            </button>
          </section>
        )}

        {/* Catatan */}
        <div
          className={`mt-6 flex items-start gap-3 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} px-4 py-3.5`}
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-info)]" />
          <p className="text-xs leading-5 theme-text-secondary">
            Jadwal dapat berubah sesuai pengaturan akademik sekolah. Pastikan
            kamu selalu melihat jadwal terbaru sebelum mengikuti pelajaran.
          </p>
        </div>
      </div>
    </main>
  );
}
