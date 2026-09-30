"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import {
  FileCheck2,
  ChevronDown,
  Sparkles,
  Users,
  BarChart3,
  AlertTriangle,
  Printer,
  Info,
} from "lucide-react";

// ===== THEME HELPERS =====
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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ===== DUMMY DATA =====
// Catatan: ganti dengan agregat asli (dari halaman Nilai Harian, Nilai Quiz, dan Tugas) begitu tersedia.
const MATA_PELAJARAN = "Matematika";
const KELAS_OPTIONS = ["9A", "9B", "8A", "8B"];
const KKM = 75;
const SEMESTER = "Ganjil 2026/2027";

// Bobot komponen nilai akhir.
const BOBOT = {
  tugas: 20,
  quiz: 15,
  harian: 15,
  uts: 25,
  uas: 25,
};

const siswaPerKelas = {
  "9A": [
    {
      id: "9a-01",
      nis: "2409001",
      nama: "Ahmad Fauzi",
      tugas: 85,
      quiz: 90,
      harian: 82,
      uts: 88,
      uas: 90,
    },
    {
      id: "9a-02",
      nis: "2409002",
      nama: "Bunga Citra Lestari",
      tugas: 92,
      quiz: 95,
      harian: 90,
      uts: 94,
      uas: 92,
    },
    {
      id: "9a-03",
      nis: "2409003",
      nama: "Dewi Anggraini",
      tugas: 71,
      quiz: 60,
      harian: 68,
      uts: 65,
      uas: 70,
    },
    {
      id: "9a-04",
      nis: "2409004",
      nama: "Farhan Maulana",
      tugas: 79,
      quiz: 78,
      harian: 80,
      uts: 76,
      uas: 82,
    },
    {
      id: "9a-05",
      nis: "2409005",
      nama: "Gita Permatasari",
      tugas: 90,
      quiz: 88,
      harian: 92,
      uts: 91,
      uas: 89,
    },
    {
      id: "9a-06",
      nis: "2409006",
      nama: "Hendra Saputra",
      tugas: 74,
      quiz: 70,
      harian: 75,
      uts: 72,
      uas: 74,
    },
    {
      id: "9a-07",
      nis: "2409007",
      nama: "Indah Wulandari",
      tugas: 83,
      quiz: 80,
      harian: 84,
      uts: 82,
      uas: 85,
    },
    {
      id: "9a-08",
      nis: "2409008",
      nama: "Joko Prasetyo",
      tugas: 62,
      quiz: 55,
      harian: 60,
      uts: 58,
      uas: 63,
    },
    {
      id: "9a-09",
      nis: "2409009",
      nama: "Kirana Salsabila",
      tugas: 91,
      quiz: 93,
      harian: 89,
      uts: 95,
      uas: 90,
    },
    {
      id: "9a-10",
      nis: "2409010",
      nama: "Lukman Hakim",
      tugas: 73,
      quiz: 71,
      harian: 76,
      uts: 74,
      uas: 77,
    },
  ],

  "9B": [
    {
      id: "9b-01",
      nis: "2409011",
      nama: "Muhammad Rizki",
      tugas: 80,
      quiz: 78,
      harian: 82,
      uts: 79,
      uas: 84,
    },
    {
      id: "9b-02",
      nis: "2409012",
      nama: "Nadia Ramadhani",
      tugas: 76,
      quiz: 68,
      harian: 74,
      uts: 70,
      uas: 75,
    },
    {
      id: "9b-03",
      nis: "2409013",
      nama: "Oscar Pratama",
      tugas: 65,
      quiz: 60,
      harian: 66,
      uts: 62,
      uas: 68,
    },
    {
      id: "9b-04",
      nis: "2409014",
      nama: "Putri Ayu Ningsih",
      tugas: 88,
      quiz: 90,
      harian: 86,
      uts: 89,
      uas: 91,
    },
    {
      id: "9b-05",
      nis: "2409015",
      nama: "Qori Ramadhan",
      tugas: 93,
      quiz: 95,
      harian: 90,
      uts: 94,
      uas: 92,
    },
    {
      id: "9b-06",
      nis: "2409016",
      nama: "Rina Amelia",
      tugas: 78,
      quiz: 74,
      harian: 80,
      uts: 77,
      uas: 79,
    },
    {
      id: "9b-07",
      nis: "2409017",
      nama: "Satria Nugraha",
      tugas: 69,
      quiz: 62,
      harian: 70,
      uts: 65,
      uas: 71,
    },
    {
      id: "9b-08",
      nis: "2409018",
      nama: "Tania Putri",
      tugas: 84,
      quiz: 82,
      harian: 85,
      uts: 83,
      uas: 86,
    },
  ],

  "8A": [
    {
      id: "8a-01",
      nis: "2408001",
      nama: "Umar Abdullah",
      tugas: 82,
      quiz: 80,
      harian: 81,
      uts: 79,
      uas: 83,
    },
    {
      id: "8a-02",
      nis: "2408002",
      nama: "Vina Anggreini",
      tugas: 90,
      quiz: 92,
      harian: 88,
      uts: 91,
      uas: 90,
    },
    {
      id: "8a-03",
      nis: "2408003",
      nama: "Wahyu Setiawan",
      tugas: 75,
      quiz: 70,
      harian: 74,
      uts: 72,
      uas: 76,
    },
    {
      id: "8a-04",
      nis: "2408004",
      nama: "Xena Meilani",
      tugas: 68,
      quiz: 62,
      harian: 70,
      uts: 65,
      uas: 69,
    },
    {
      id: "8a-05",
      nis: "2408005",
      nama: "Yusuf Ibrahim",
      tugas: 85,
      quiz: 84,
      harian: 86,
      uts: 83,
      uas: 87,
    },
    {
      id: "8a-06",
      nis: "2408006",
      nama: "Zahra Amalia",
      tugas: 91,
      quiz: 89,
      harian: 90,
      uts: 92,
      uas: 91,
    },
    {
      id: "8a-07",
      nis: "2408007",
      nama: "Agus Setiadi",
      tugas: 73,
      quiz: 68,
      harian: 72,
      uts: 70,
      uas: 74,
    },
    {
      id: "8a-08",
      nis: "2408008",
      nama: "Bella Safitri",
      tugas: 87,
      quiz: 85,
      harian: 88,
      uts: 86,
      uas: 89,
    },
  ],

  "8B": [
    {
      id: "8b-01",
      nis: "2408011",
      nama: "Chandra Wijaya",
      tugas: 88,
      quiz: 86,
      harian: 87,
      uts: 85,
      uas: 89,
    },
    {
      id: "8b-02",
      nis: "2408012",
      nama: "Dinda Puspita",
      tugas: 92,
      quiz: 94,
      harian: 90,
      uts: 93,
      uas: 91,
    },
    {
      id: "8b-03",
      nis: "2408013",
      nama: "Eko Firmansyah",
      tugas: 80,
      quiz: 76,
      harian: 79,
      uts: 78,
      uas: 81,
    },
    {
      id: "8b-04",
      nis: "2408014",
      nama: "Fitri Handayani",
      tugas: 85,
      quiz: 83,
      harian: 86,
      uts: 84,
      uas: 87,
    },
    {
      id: "8b-05",
      nis: "2408015",
      nama: "Galih Pratama",
      tugas: 90,
      quiz: 88,
      harian: 89,
      uts: 91,
      uas: 90,
    },
    {
      id: "8b-06",
      nis: "2408016",
      nama: "Hana Nuraini",
      tugas: 94,
      quiz: 96,
      harian: 92,
      uts: 95,
      uas: 93,
    },
  ],
};

function hitungNilaiAkhir(s) {
  const total =
    (s.tugas * BOBOT.tugas +
      s.quiz * BOBOT.quiz +
      s.harian * BOBOT.harian +
      s.uts * BOBOT.uts +
      s.uas * BOBOT.uas) /
    100;

  return Math.round(total * 10) / 10;
}

function getPredikat(nilai) {
  if (nilai >= 90) {
    return {
      label: "A",
      color: "emerald",
    };
  }

  if (nilai >= KKM) {
    return {
      label: "B",
      color: "blue",
    };
  }

  if (nilai >= 60) {
    return {
      label: "C",
      color: "amber",
    };
  }

  return {
    label: "D",
    color: "rose",
  };
}

const colorClasses = {
  emerald: {
    badge: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
  },

  blue: {
    badge: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
  },

  amber: {
    badge: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
  },

  rose: {
    badge: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
  },
};

export default function GuruRaporPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [kelas, setKelas] =
    useState(KELAS_OPTIONS[0]);

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

  const daftarSiswa =
    siswaPerKelas[kelas] || [];

  const dataRapor = useMemo(() => {
    return daftarSiswa
      .map((s) => {
        const nilaiAkhir =
          hitungNilaiAkhir(s);

        return {
          ...s,
          nilaiAkhir,
          predikat:
            getPredikat(nilaiAkhir),
        };
      })
      .sort(
        (a, b) =>
          b.nilaiAkhir -
          a.nilaiAkhir
      );
  }, [daftarSiswa]);

  const rekap = useMemo(() => {
    if (dataRapor.length === 0) {
      return {
        rataRata: 0,
        tuntas: 0,
        belumTuntas: 0,
      };
    }

    const total =
      dataRapor.reduce(
        (a, s) =>
          a + s.nilaiAkhir,
        0
      );

    const rataRata =
      Math.round(
        (total / dataRapor.length) *
          10
      ) / 10;

    const tuntas =
      dataRapor.filter(
        (s) =>
          s.nilaiAkhir >= KKM
      ).length;

    const belumTuntas =
      dataRapor.length -
      tuntas;

    return {
      rataRata,
      tuntas,
      belumTuntas,
    };
  }, [dataRapor]);

  return (
    <div className="flex h-screen theme-page overflow-hidden">
      {/* SIDEBAR GURU */}
      <Sidebar
        active="rapor"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      <div className="flex-1 flex flex-col min-w-0 theme-page">
        {/* HEADER GURU */}
        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email:
              "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 theme-page">
          <div className="w-full space-y-6">

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} flex-shrink-0`}
                  >
                    <FileCheck2
                      size={18}
                    />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                    Rapor
                  </h1>
                </div>

                <p className="text-sm theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles
                    size={14}
                    className="theme-text-muted flex-shrink-0"
                  />

                  <span className="truncate">
                    Nilai akhir gabungan{" "}
                    {MATA_PELAJARAN} ·
                    Semester{" "}
                    {SEMESTER}.
                  </span>
                </p>
              </div>

              <button
                onClick={() =>
                  window.print()
                }
                className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} rounded-lg ${themePrimaryShadow} hover:opacity-90 transition-opacity flex-shrink-0`}
              >
                <Printer size={15} />
                Cetak Rapor
              </button>
            </div>

            {/* =====================================================
                KELAS SELECTOR + BOBOT INFO
            ====================================================== */}
            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
            >
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">

                {/* SELECT KELAS */}
                <div className="relative w-full sm:w-44">
                  <select
                    value={kelas}
                    onChange={(e) =>
                      setKelas(
                        e.target.value
                      )
                    }
                    className={`w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium theme-text ${themeNeutralSurface} border ${themeNeutralBorder} rounded-lg ${themeNeutralHover} focus:outline-none ${themeFocus} transition-colors cursor-pointer`}
                  >
                    {KELAS_OPTIONS.map(
                      (k) => (
                        <option
                          key={k}
                          value={k}
                        >
                          Kelas {k}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                  />
                </div>

                {/* INFO BOBOT */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] theme-text-secondary">
                  <Info
                    size={13}
                    className="theme-text-muted flex-shrink-0"
                  />

                  <span>
                    Bobot nilai akhir:
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full ${themeNeutralSurface} border ${themeNeutralBorder}`}
                  >
                    Tugas {BOBOT.tugas}%
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full ${themeNeutralSurface} border ${themeNeutralBorder}`}
                  >
                    Quiz {BOBOT.quiz}%
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full ${themeNeutralSurface} border ${themeNeutralBorder}`}
                  >
                    Harian {BOBOT.harian}%
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full ${themeNeutralSurface} border ${themeNeutralBorder}`}
                  >
                    UTS {BOBOT.uts}%
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full ${themeNeutralSurface} border ${themeNeutralBorder}`}
                  >
                    UAS {BOBOT.uas}%
                  </span>
                </div>
              </div>
            </div>

            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {/* TOTAL SISWA */}
              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}
              >
                <div
                  className={`p-2 rounded-lg border ${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder} flex-shrink-0`}
                >
                  <Users size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                    Total Siswa
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {dataRapor.length}
                  </p>
                </div>
              </div>

              {/* RATA-RATA */}
              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}
              >
                <div
                  className={`p-2 rounded-lg border ${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder} flex-shrink-0`}
                >
                  <BarChart3
                    size={16}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                    Rata-rata Kelas
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {rekap.rataRata}
                  </p>
                </div>
              </div>

              {/* TUNTAS */}
              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}
              >
                <div
                  className={`p-2 rounded-lg border ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder} flex-shrink-0`}
                >
                  <FileCheck2
                    size={16}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                    Tuntas
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {rekap.tuntas}
                  </p>
                </div>
              </div>

              {/* BELUM TUNTAS */}
              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}
              >
                <div
                  className={`p-2 rounded-lg border ${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder} flex-shrink-0`}
                >
                  <AlertTriangle
                    size={16}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                    Belum Tuntas
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {rekap.belumTuntas}
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                TABEL RAPOR
            ====================================================== */}
            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              {/* TABLE HEADER */}
              <div
                className={`flex items-center justify-between gap-3 p-4 sm:p-5 border-b ${themeDivider}`}
              >
                <h2 className="text-sm font-semibold theme-text">
                  Rekap Nilai Akhir ·
                  Kelas {kelas}
                </h2>

                <span className="text-xs theme-text-muted">
                  KKM {KKM}
                </span>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`${themeNeutralSurface} text-left`}
                    >
                      <th className="px-4 sm:px-5 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider">
                        #
                      </th>

                      <th className="px-4 sm:px-5 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider">
                        Siswa
                      </th>

                      <th className="px-3 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider text-center">
                        Tugas
                      </th>

                      <th className="px-3 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider text-center">
                        Quiz
                      </th>

                      <th className="px-3 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider text-center">
                        Harian
                      </th>

                      <th className="px-3 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider text-center">
                        UTS
                      </th>

                      <th className="px-3 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider text-center">
                        UAS
                      </th>

                      <th className="px-3 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider text-center">
                        Nilai Akhir
                      </th>

                      <th className="px-4 sm:px-5 py-3 text-[11px] font-semibold theme-text-secondary uppercase tracking-wider text-center">
                        Predikat
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataRapor.map(
                      (s, idx) => (
                        <tr
                          key={s.id}
                          className={`border-b ${themeDivider} last:border-b-0 ${themeNeutralHover} transition-colors`}
                        >
                          {/* NO */}
                          <td className="px-4 sm:px-5 py-3 text-xs theme-text-muted">
                            {idx + 1}
                          </td>

                          {/* SISWA */}
                          <td className="px-4 sm:px-5 py-3">
                            <p className="text-sm font-medium theme-text">
                              {s.nama}
                            </p>

                            <p className="text-[11px] theme-text-muted">
                              NIS {s.nis}
                            </p>
                          </td>

                          {/* TUGAS */}
                          <td className="px-3 py-3 text-center theme-text-secondary">
                            {s.tugas}
                          </td>

                          {/* QUIZ */}
                          <td className="px-3 py-3 text-center theme-text-secondary">
                            {s.quiz}
                          </td>

                          {/* HARIAN */}
                          <td className="px-3 py-3 text-center theme-text-secondary">
                            {s.harian}
                          </td>

                          {/* UTS */}
                          <td className="px-3 py-3 text-center theme-text-secondary">
                            {s.uts}
                          </td>

                          {/* UAS */}
                          <td className="px-3 py-3 text-center theme-text-secondary">
                            {s.uas}
                          </td>

                          {/* NILAI AKHIR */}
                          <td className="px-3 py-3 text-center font-semibold theme-text">
                            {s.nilaiAkhir}
                          </td>

                          {/* PREDIKAT */}
                          <td className="px-4 sm:px-5 py-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-lg border ${
                                colorClasses[
                                  s.predikat
                                    .color
                                ].badge
                              }`}
                            >
                              {
                                s.predikat
                                  .label
                              }
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}