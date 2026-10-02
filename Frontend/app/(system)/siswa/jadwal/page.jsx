"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import { getJadwalMengajar } from "../../../../services/jadwalMengajar.service";

/* =========================================================
   THEME HELPERS
   Menggunakan global theme yang sudah ada.
========================================================= */

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
   HARI
========================================================= */

const hariList = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggalHari(hari) {
  const sekarang = new Date();

  const namaHari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  const targetIndex = namaHari.indexOf(hari);
  const sekarangIndex = sekarang.getDay();

  if (targetIndex === -1) {
    return "";
  }

  let selisih = targetIndex - sekarangIndex;

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

/* =========================================================
   HARI SEKARANG
========================================================= */

function getHariSekarang() {
  const namaHari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  return namaHari[new Date().getDay()];
}

/* =========================================================
   FORMAT JAM
========================================================= */

function formatJam(jam) {
  if (!jam) return "-";

  const value = String(jam);

  if (value.length >= 5) {
    return value.substring(0, 5);
  }

  return value;
}

/* =========================================================
   HELPER NAMA KELAS
   Menghindari [object Object]
========================================================= */

function getNamaKelas(kelas) {
  if (!kelas) {
    return "-";
  }

  /* Kalau API langsung mengirim string */
  if (typeof kelas === "string") {
    return kelas;
  }

  /* Kalau API mengirim object */
  if (typeof kelas === "object") {
    return (
      kelas?.nama ||
      kelas?.namaKelas ||
      kelas?.nama_kelas ||
      kelas?.kode ||
      kelas?.kodeKelas ||
      kelas?.kode_kelas ||
      kelas?.tingkat ||
      kelas?.namaTingkat ||
      kelas?.nama_tingkat ||
      "-"
    );
  }

  return String(kelas);
}

/* =========================================================
   HELPER NAMA RUANGAN
   Menghindari [object Object]
========================================================= */

function getNamaRuangan(ruangan) {
  if (!ruangan) {
    return "-";
  }

  /* Kalau API langsung mengirim string */
  if (typeof ruangan === "string") {
    return ruangan;
  }

  /* Kalau API mengirim object */
  if (typeof ruangan === "object") {
    return (
      ruangan?.nama ||
      ruangan?.namaRuangan ||
      ruangan?.nama_ruangan ||
      ruangan?.kode ||
      ruangan?.kodeRuangan ||
      ruangan?.kode_ruangan ||
      "-"
    );
  }

  return String(ruangan);
}

/* =========================================================
   ACCENT PALETTE
   Semuanya mengikuti global theme.
========================================================= */

const accentPalette = [
  {
    bg: themePrimarySoft,
    border: themePrimarySoftBorder,
    text: themePrimaryText,
    dot: "bg-[var(--color-primary)]",
    ring:
      "ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
  },
  {
    bg: themeInfoSurface,
    border: themeInfoBorder,
    text: "text-[var(--color-info)]",
    dot: "bg-[var(--color-info)]",
    ring:
      "ring-[color-mix(in_srgb,var(--color-info)_18%,transparent)]",
  },
  {
    bg: themeSuccessSurface,
    border: themeSuccessBorder,
    text: "text-[var(--color-success)]",
    dot: "bg-[var(--color-success)]",
    ring:
      "ring-[color-mix(in_srgb,var(--color-success)_18%,transparent)]",
  },
  {
    bg: themeWarningSurface,
    border: themeWarningBorder,
    text: "text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)]",
    ring:
      "ring-[color-mix(in_srgb,var(--color-warning)_18%,transparent)]",
  },
  {
    bg: themeNeutralSurface,
    border: themeNeutralBorder,
    text: "theme-text-secondary",
    dot: "bg-[var(--color-text-muted)]",
    ring:
      "ring-[color-mix(in_srgb,var(--color-text)_12%,transparent)]",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function JadwalSiswaPage() {
  const [hariAktif, setHariAktif] = useState(getHariSekarang());

  const [jadwalData, setJadwalData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD JADWAL
  ======================================================= */

  const loadJadwal = async () => {
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
        err?.message ||
          "Terjadi kesalahan saat mengambil data jadwal."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJadwal();
  }, []);

  /* =======================================================
     JADWAL HARI AKTIF
  ======================================================= */

  const jadwalHariIni = useMemo(() => {
    return jadwalData
      .filter((item) => {
        return (
          String(item?.hari || "").toLowerCase() ===
          String(hariAktif || "").toLowerCase()
        );
      })
      .sort((a, b) => {
        const jamA = String(a?.jamMulai || "");
        const jamB = String(b?.jamMulai || "");

        return jamA.localeCompare(jamB);
      });
  }, [jadwalData, hariAktif]);

  /* =======================================================
     KELAS SISWA
     FIX [object Object]
  ======================================================= */

  const kelasSiswa = useMemo(() => {
    const daftarKelas = jadwalData
      .map((item) => {
        const kelas = item?.kelasMapel?.kelas;

        if (!kelas) {
          return null;
        }

        return getNamaKelas(kelas);
      })
      .filter(
        (namaKelasItem) =>
          namaKelasItem &&
          namaKelasItem !== "-"
      );

    return [...new Set(daftarKelas)];
  }, [jadwalData]);

  /* =======================================================
     NAMA KELAS
  ======================================================= */

  const namaKelas = useMemo(() => {
    if (kelasSiswa.length === 0) {
      return "Kelas";
    }

    return kelasSiswa.join(", ");
  }, [kelasSiswa]);

  /* =======================================================
     PINDAH HARI
  ======================================================= */

  const pindahHari = (direction) => {
    const currentIndex = hariList.indexOf(hariAktif);

    if (currentIndex === -1) {
      setHariAktif(hariList[0]);
      return;
    }

    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
      nextIndex = hariList.length - 1;
    }

    if (nextIndex >= hariList.length) {
      nextIndex = 0;
    }

    setHariAktif(hariList[nextIndex]);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page min-h-full">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="mb-5 flex items-center gap-2 text-xs">
          <span className="theme-text-muted">
            Siswa
          </span>

          <span className="theme-text-placeholder">
            /
          </span>

          <span className="theme-text-secondary">
            Jadwal Pelajaran
          </span>
        </div>

        {/* =================================================
            HERO
        ================================================= */}

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

          <div className="relative px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              {/* LEFT */}

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
                    Lihat jadwal pelajaran dan guru yang
                    mengajar setiap hari.
                  </p>
                </div>
              </div>

              {/* RIGHT */}

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
                    Total Mapel
                  </p>

                  <p className="text-lg font-bold text-[var(--color-card)]">
                    {jadwalData.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

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

                <p className="mt-1 text-xs theme-text-secondary">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadJadwal}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border ${themeDangerBorder} theme-card px-3.5 py-2 text-xs font-semibold theme-danger transition-colors ${themeNeutralHover}`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Coba Lagi
            </button>
          </div>
        )}

        {/* =================================================
            DAY SELECTOR
        ================================================= */}

        <section
          className={`mb-6 theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
            <div>
              <p className="text-sm font-semibold theme-text">
                Pilih Hari
              </p>

              <p className="mt-0.5 text-xs theme-text-muted">
                Pilih hari untuk melihat jadwal.
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

          <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-6 sm:p-4">
            {hariList.map((hari) => {
              const active = hariAktif === hari;

              return (
                <button
                  key={hari}
                  type="button"
                  onClick={() => setHariAktif(hari)}
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
        </section>

        {/* =================================================
            DAY INFO
        ================================================= */}

        <section
          className={`mb-6 flex flex-col gap-4 rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border`}
            >
              <CalendarDays
                className={`h-5 w-5 ${themePrimaryText}`}
              />
            </div>

            <div>
              <p className="text-sm font-bold theme-text">
                {hariAktif}
              </p>

              <p className="text-xs theme-text-muted">
                {formatTanggalHari(hariAktif)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] theme-text-muted">
                Kelas
              </p>

              <p className="text-sm font-semibold theme-text-secondary">
                {namaKelas}
              </p>
            </div>

            <div className="h-8 w-px bg-[var(--color-border)]" />

            <div>
              <p className="text-[11px] theme-text-muted">
                Jadwal
              </p>

              <p className="text-sm font-semibold theme-text-secondary">
                {jadwalHariIni.length} Pelajaran
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            LOADING
        ================================================= */}

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
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <section
              className={`hidden overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} md:block`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr
                      className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                    >
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

                      const namaMapel =
                        item?.kelasMapel?.mapel?.nama ||
                        item?.kelasMapel?.mapel?.namaMapel ||
                        item?.mapel?.nama ||
                        item?.mapel?.namaMapel ||
                        "Mata Pelajaran";

                      const namaGuru =
                        item?.guru?.namaLengkap ||
                        item?.guru?.nama ||
                        item?.guru?.user?.namaLengkap ||
                        item?.guru?.user?.name ||
                        "-";

                      const namaKelasItem = getNamaKelas(
                        item?.kelasMapel?.kelas
                      );

                      const namaRuangan = getNamaRuangan(
                        item?.ruangan
                      );

                      return (
                        <tr
                          key={
                            item?.id ||
                            `${hariAktif}-${index}`
                          }
                          className={`border-b ${themeDivider} last:border-b-0 transition-colors ${themeNeutralHover}`}
                        >
                          {/* TIME */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent.bg} ${accent.border} border`}
                              >
                                <Clock3
                                  className={`h-4 w-4 ${accent.text}`}
                                />
                              </div>

                              <div>
                                <p className="text-sm font-semibold theme-text">
                                  {formatJam(item?.jamMulai)}
                                </p>

                                <p className="mt-0.5 text-[11px] theme-text-muted">
                                  sampai{" "}
                                  {formatJam(item?.jamSelesai)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* MAPEL */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot} ring-4 ${accent.ring}`}
                              />

                              <div>
                                <p className="text-sm font-semibold theme-text">
                                  {namaMapel}
                                </p>

                                {namaKelasItem !== "-" && (
                                  <p className="mt-0.5 text-[11px] theme-text-muted">
                                    {namaKelasItem}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* GURU */}

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

                          {/* RUANGAN */}

                          <td className="px-5 py-4">
                            <div
                              className={`inline-flex items-center gap-1.5 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1.5`}
                            >
                              <MapPin className="h-3.5 w-3.5 theme-text-muted" />

                              <span className="text-xs font-medium theme-text-secondary">
                                {namaRuangan}
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

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <section className="space-y-3 md:hidden">
              {jadwalHariIni.map((item, index) => {
                const accent =
                  accentPalette[index % accentPalette.length];

                const namaMapel =
                  item?.kelasMapel?.mapel?.nama ||
                  item?.kelasMapel?.mapel?.namaMapel ||
                  item?.mapel?.nama ||
                  item?.mapel?.namaMapel ||
                  "Mata Pelajaran";

                const namaGuru =
                  item?.guru?.namaLengkap ||
                  item?.guru?.nama ||
                  item?.guru?.user?.namaLengkap ||
                  item?.guru?.user?.name ||
                  "-";

                const namaKelasItem = getNamaKelas(
                  item?.kelasMapel?.kelas
                );

                const namaRuangan = getNamaRuangan(
                  item?.ruangan
                );

                return (
                  <article
                    key={
                      item?.id ||
                      `${hariAktif}-mobile-${index}`
                    }
                    className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.border} border`}
                        >
                          <BookOpen
                            className={`h-5 w-5 ${accent.text}`}
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold theme-text">
                            {namaMapel}
                          </h3>

                          {namaKelasItem !== "-" && (
                            <p className="mt-1 text-[11px] theme-text-muted">
                              {namaKelasItem}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        className={`shrink-0 rounded-lg ${accent.bg} px-2.5 py-1.5`}
                      >
                        <span
                          className={`text-xs font-bold ${accent.text}`}
                        >
                          {formatJam(item?.jamMulai)}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mt-4 grid grid-cols-2 gap-2 border-t ${themeDivider} pt-4`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 theme-text-muted" />

                        <div>
                          <p className="text-[10px] theme-text-muted">
                            Waktu
                          </p>

                          <p className="text-xs font-semibold theme-text-secondary">
                            {formatJam(item?.jamMulai)} -{" "}
                            {formatJam(item?.jamSelesai)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 theme-text-muted" />

                        <div className="min-w-0">
                          <p className="text-[10px] theme-text-muted">
                            Guru
                          </p>

                          <p className="truncate text-xs font-semibold theme-text-secondary">
                            {namaGuru}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 theme-text-muted" />

                        <div>
                          <p className="text-[10px] theme-text-muted">
                            Ruangan
                          </p>

                          <p className="text-xs font-semibold theme-text-secondary">
                            {namaRuangan}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */

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
              className={`mt-5 inline-flex items-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:shadow-[0_10px_24px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Jadwal
            </button>
          </section>
        )}

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div
          className={`mt-6 flex items-start gap-3 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} px-4 py-3.5`}
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-info)]" />

          <p className="text-xs leading-5 theme-text-secondary">
            Jadwal dapat berubah sesuai dengan pengaturan
            akademik sekolah. Pastikan kamu selalu melihat
            jadwal terbaru sebelum mengikuti pelajaran.
          </p>
        </div>
      </div>
    </div>
  );
}