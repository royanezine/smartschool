"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  Calendar,
  Search,
  Download,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Stethoscope,
  FileText,
  TrendingUp,
  TrendingDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BarChart3,
} from "lucide-react";

/* ============================================================
   THEME HELPERS
============================================================ */

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* ============================================================
   DATA DUMMY
============================================================ */

const MAPEL_LIST = [
  "Matematika",
  "Bahasa Indonesia",
  "Fisika",
  "Biologi",
  "Kimia",
  "Bahasa Inggris",
  "Sejarah",
  "PKN",
  "Agama",
  "Seni Budaya",
];

const SISWA_LIST = [
  { id: 1, nama: "Ahmad Fauzan", nis: "2401001", kelas: "X IPA 1" },
  { id: 2, nama: "Bella Safira", nis: "2401002", kelas: "X IPA 1" },
  { id: 3, nama: "Cahyo Nugroho", nis: "2401003", kelas: "X IPA 1" },
  { id: 4, nama: "Dinda Rahmawati", nis: "2401004", kelas: "X IPA 1" },
  { id: 5, nama: "Eko Prasetyo", nis: "2401005", kelas: "X IPA 1" },
  { id: 6, nama: "Fitri Handayani", nis: "2402001", kelas: "X IPA 2" },
  { id: 7, nama: "Galih Saputra", nis: "2402002", kelas: "X IPA 2" },
  { id: 8, nama: "Hana Nurul", nis: "2402003", kelas: "X IPA 2" },
  { id: 9, nama: "Iqbal Ramadhan", nis: "2402004", kelas: "X IPA 2" },
  { id: 10, nama: "Jihan Syafira", nis: "2402005", kelas: "X IPA 2" },
  { id: 11, nama: "Karin Aulia", nis: "2403001", kelas: "X IPS 1" },
  { id: 12, nama: "Lukman Hakim", nis: "2403002", kelas: "X IPS 1" },
  { id: 13, nama: "Mila Kurnia", nis: "2403003", kelas: "X IPS 1" },
  { id: 14, nama: "Nanda Pratama", nis: "2403004", kelas: "X IPS 1" },
  { id: 15, nama: "Oktavia Dewi", nis: "2403005", kelas: "X IPS 1" },
  { id: 16, nama: "Pandu Winata", nis: "2404001", kelas: "X IPS 2" },
  { id: 17, nama: "Qonita Zahra", nis: "2404002", kelas: "X IPS 2" },
  { id: 18, nama: "Rizky Aditya", nis: "2404003", kelas: "X IPS 2" },
  { id: 19, nama: "Salsa Bila", nis: "2405001", kelas: "XI IPA 1" },
  { id: 20, nama: "Taufik Hidayat", nis: "2405002", kelas: "XI IPA 1" },
  { id: 21, nama: "Ulfa Nurhasanah", nis: "2405003", kelas: "XI IPA 1" },
  { id: 22, nama: "Vino Septian", nis: "2405004", kelas: "XI IPA 1" },
  { id: 23, nama: "Winda Lestari", nis: "2406001", kelas: "XI IPS 1" },
  { id: 24, nama: "Xavier Putra", nis: "2406002", kelas: "XI IPS 1" },
  { id: 25, nama: "Yunita Sari", nis: "2406003", kelas: "XI IPS 1" },
  { id: 26, nama: "Zaki Maulana", nis: "2407001", kelas: "XII IPA 1" },
  { id: 27, nama: "Andi Kurniawan", nis: "2407002", kelas: "XII IPA 1" },
  { id: 28, nama: "Putri Anggraini", nis: "2407003", kelas: "XII IPA 1" },
  { id: 29, nama: "Bagas Pratama", nis: "2407004", kelas: "XII IPA 1" },
  { id: 30, nama: "Citra Kirana", nis: "2407005", kelas: "XII IPA 1" },
  { id: 31, nama: "Dani Firmansyah", nis: "2408001", kelas: "XII IPS 1" },
  { id: 32, nama: "Elsa Maharani", nis: "2408002", kelas: "XII IPS 1" },
  { id: 33, nama: "Fajar Nugroho", nis: "2408003", kelas: "XII IPS 1" },
  { id: 34, nama: "Gina Permata", nis: "2408004", kelas: "XII IPS 1" },
  { id: 35, nama: "Hendra Wijaya", nis: "2408005", kelas: "XII IPS 1" },
  { id: 36, nama: "Indah Permatasari", nis: "2409001", kelas: "XI IPA 2" },
  { id: 37, nama: "Joko Susilo", nis: "2409002", kelas: "XI IPA 2" },
  { id: 38, nama: "Kirana Salsabila", nis: "2409003", kelas: "XI IPA 2" },
  { id: 39, nama: "Lina Marlina", nis: "2409004", kelas: "XI IPS 2" },
  { id: 40, nama: "Muhammad Rizki", nis: "2409005", kelas: "XI IPS 2" },
  { id: 41, nama: "Nadia Ramadhani", nis: "2409006", kelas: "XI IPS 2" },
  { id: 42, nama: "Oscar Pratama", nis: "2409007", kelas: "XII IPA 2" },
  { id: 43, nama: "Putri Ayu", nis: "2409008", kelas: "XII IPA 2" },
  { id: 44, nama: "Qori Ramadhan", nis: "2409009", kelas: "XII IPA 2" },
  { id: 45, nama: "Rina Amelia", nis: "2409010", kelas: "XII IPS 2" },
  { id: 46, nama: "Satria Nugraha", nis: "2409011", kelas: "XII IPS 2" },
  { id: 47, nama: "Tania Putri", nis: "2409012", kelas: "XII IPS 2" },
  { id: 48, nama: "Umar Abdullah", nis: "2409013", kelas: "X IPA 1" },
  { id: 49, nama: "Vina Anggreini", nis: "2409014", kelas: "X IPA 1" },
  { id: 50, nama: "Wahyu Setiawan", nis: "2409015", kelas: "X IPA 1" },
];

/* ============================================================
   GENERATE ATTENDANCE DATA
============================================================ */

const generateAttendanceData = () => {
  const data = [];

  const statuses = [
    "Hadir",
    "Hadir",
    "Hadir",
    "Hadir",
    "Sakit",
    "Izin",
    "Alpa",
  ];

  const dates = [
    "2026-08-01",
    "2026-08-08",
    "2026-08-15",
    "2026-08-22",
    "2026-08-29",
    "2026-09-05",
    "2026-09-12",
    "2026-09-19",
    "2026-09-26",
    "2026-10-03",
    "2026-10-10",
    "2026-10-17",
  ];

  const notes = {
    Sakit: [
      "Demam",
      "Flu",
      "Sakit kepala",
      "Batuk",
    ],
    Izin: [
      "Acara keluarga",
      "Keperluan pribadi",
    ],
    Alpa: [
      "Tidak masuk tanpa keterangan",
    ],
  };

  let id = 1;

  MAPEL_LIST.forEach((mapel) => {
    SISWA_LIST.forEach((siswa) => {
      const numRecords =
        5 + Math.floor(Math.random() * 6);

      const shuffledDates = [...dates].sort(
        () => Math.random() - 0.5,
      );

      for (
        let i = 0;
        i <
        Math.min(
          numRecords,
          shuffledDates.length,
        );
        i++
      ) {
        const status =
          statuses[
            Math.floor(
              Math.random() *
                statuses.length,
            )
          ];

        const hasNote =
          status !== "Hadir" &&
          Math.random() > 0.5;

        data.push({
          id: id++,
          siswaId: siswa.id,
          nama: siswa.nama,
          nis: siswa.nis,
          kelas: siswa.kelas,
          mapel,
          tanggal: shuffledDates[i],
          status,
          catatan:
            hasNote && status !== "Hadir"
              ? notes[status]?.[
                  Math.floor(
                    Math.random() *
                      notes[status].length,
                  )
                ] || "-"
              : "-",
          pertemuanKe: i + 1,
        });
      }
    });
  });

  return data;
};

/* ============================================================
   PAGE
============================================================ */

export default function HistoriAbsensiPage() {
  const router = useRouter();

  const [attendanceData, setAttendanceData] =
    useState([]);

  const [selectedMapel, setSelectedMapel] =
    useState("Matematika");

  const [selectedKelas, setSelectedKelas] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 10;

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  useEffect(() => {
    setAttendanceData(
      generateAttendanceData(),
    );
  }, []);

  /* ==========================================================
     FILTER DATA
  ========================================================== */

  const filteredData = useMemo(() => {
    let data = [...attendanceData];

    if (selectedMapel) {
      data = data.filter(
        (item) =>
          item.mapel === selectedMapel,
      );
    }

    if (selectedKelas) {
      data = data.filter(
        (item) =>
          item.kelas === selectedKelas,
      );
    }

    if (searchQuery.trim()) {
      const q =
        searchQuery.toLowerCase();

      data = data.filter(
        (item) =>
          item.nama
            .toLowerCase()
            .includes(q) ||
          item.nis.includes(q),
      );
    }

    if (startDate) {
      data = data.filter(
        (item) =>
          item.tanggal >= startDate,
      );
    }

    if (endDate) {
      data = data.filter(
        (item) =>
          item.tanggal <= endDate,
      );
    }

    data.sort((a, b) =>
      b.tanggal.localeCompare(
        a.tanggal,
      ),
    );

    return data;
  }, [
    attendanceData,
    selectedMapel,
    selectedKelas,
    searchQuery,
    startDate,
    endDate,
  ]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const stats = useMemo(() => {
    const total = filteredData.length;

    const hadir = filteredData.filter(
      (d) => d.status === "Hadir",
    ).length;

    const sakit = filteredData.filter(
      (d) => d.status === "Sakit",
    ).length;

    const izin = filteredData.filter(
      (d) => d.status === "Izin",
    ).length;

    const alpa = filteredData.filter(
      (d) => d.status === "Alpa",
    ).length;

    const persentase =
      total > 0
        ? Math.round((hadir / total) * 100)
        : 0;

    return {
      total,
      hadir,
      sakit,
      izin,
      alpa,
      persentase,
    };
  }, [filteredData]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.ceil(
    filteredData.length / itemsPerPage,
  );

  const paginatedData = useMemo(() => {
    const start =
      (currentPage - 1) *
      itemsPerPage;

    return filteredData.slice(
      start,
      start + itemsPerPage,
    );
  }, [
    filteredData,
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedMapel,
    selectedKelas,
    searchQuery,
    startDate,
    endDate,
  ]);

  /* ==========================================================
     AVAILABLE CLASS
  ========================================================== */

  const availableKelas = useMemo(() => {
    const kelas = new Set();

    attendanceData
      .filter(
        (item) =>
          item.mapel === selectedMapel,
      )
      .forEach((item) =>
        kelas.add(item.kelas),
      );

    return Array.from(kelas).sort();
  }, [
    attendanceData,
    selectedMapel,
  ]);

  /* ==========================================================
     STATUS HELPERS
  ========================================================== */

  const getStatusBadge = (status) => {
    const map = {
      Hadir: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,

      Sakit: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,

      Izin: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,

      Alpa: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
    };

    return (
      map[status] ||
      `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`
    );
  };

  const getStatusIcon = (status) => {
    const map = {
      Hadir: (
        <CheckCircle2
          size={14}
          className="text-[var(--color-success)]"
        />
      ),

      Sakit: (
        <Stethoscope
          size={14}
          className="text-[var(--color-warning)]"
        />
      ),

      Izin: (
        <FileText
          size={14}
          className="text-[var(--color-info)]"
        />
      ),

      Alpa: (
        <XCircle
          size={14}
          className="theme-danger"
        />
      ),
    };

    return map[status] || null;
  };

  /* ==========================================================
     INITIALS
  ========================================================== */

  const getInitials = (nama) => {
    const parts = nama.split(" ");

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return nama
      .substring(0, 2)
      .toUpperCase();
  };

  /* ==========================================================
     AVATAR
  ========================================================== */

  const getAvatarColor = () => {
    return `${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder}`;
  };

  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);

    return d.toLocaleDateString(
      "id-ID",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  };

  /* ==========================================================
     EXPORT
  ========================================================== */

  const handleExport = () =>
    alert(
      "Fitur ekspor akan segera hadir!",
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen w-full theme-page flex">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      {/* =====================================================
          AREA UTAMA
      ====================================================== */}

      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        {/* HEADER */}

        <div className="flex-shrink-0">
          <Header />
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="flex-1 min-w-0 theme-page overflow-x-hidden">
          <div className="w-full min-w-0 px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-8 xl:px-10">
            <div className="w-full max-w-none mx-auto space-y-5 sm:space-y-6">
              {/* =================================================
                  HEADER HALAMAN
              ================================================== */}

              <section className="w-full">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* TITLE */}

                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] flex items-center justify-center ${themePrimaryShadow} flex-shrink-0`}
                      >
                        <BarChart3
                          size={22}
                        />
                      </div>

                      <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold theme-text truncate">
                          Histori Absensi
                          Siswa
                        </h1>

                        <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm theme-text-secondary">
                          <BookOpen
                            size={14}
                            className="theme-text-muted flex-shrink-0"
                          />

                          <span className="truncate">
                            Rekap kehadiran
                            siswa berdasarkan
                            mata pelajaran
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION */}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={
                        handleExport
                      }
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 theme-card border ${themeNeutralBorder} theme-text-secondary rounded-xl text-sm font-medium ${themeCardShadow} ${themeNeutralHover} transition-all whitespace-nowrap`}
                    >
                      <Download
                        size={17}
                      />

                      <span>
                        Ekspor
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================
                  FILTER
              ================================================== */}

              <section
                className={`w-full theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
              >
                <div className="p-4 sm:p-5 lg:p-6">
                  {/* FILTER HEADER */}

                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className={`w-9 h-9 rounded-xl ${themePrimarySoft} ${themePrimaryText} flex items-center justify-center`}
                    >
                      <Filter
                        size={17}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Filter Data
                      </h2>

                      <p className="text-xs theme-text-muted mt-0.5">
                        Gunakan filter
                        untuk mencari
                        data absensi
                      </p>
                    </div>
                  </div>

                  {/* FILTER GRID */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* MAPEL */}

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                        Mata Pelajaran
                      </label>

                      <select
                        value={
                          selectedMapel
                        }
                        onChange={(e) =>
                          setSelectedMapel(
                            e.target.value,
                          )
                        }
                        className={`w-full h-10 px-3 text-sm theme-input rounded-xl focus:outline-none ${themeFocus} transition`}
                      >
                        {MAPEL_LIST.map(
                          (mapel) => (
                            <option
                              key={mapel}
                              value={
                                mapel
                              }
                            >
                              {mapel}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* KELAS */}

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                        Kelas
                      </label>

                      <select
                        value={
                          selectedKelas
                        }
                        onChange={(e) =>
                          setSelectedKelas(
                            e.target.value,
                          )
                        }
                        className={`w-full h-10 px-3 text-sm theme-input rounded-xl focus:outline-none ${themeFocus} transition`}
                      >
                        <option value="">
                          Semua Kelas
                        </option>

                        {availableKelas.map(
                          (kelas) => (
                            <option
                              key={kelas}
                              value={
                                kelas
                              }
                            >
                              {kelas}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* SEARCH */}

                    <div className="min-w-0">
                      <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                        Cari Siswa
                      </label>

                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                        />

                        <input
                          type="text"
                          placeholder="Nama atau NIS..."
                          value={
                            searchQuery
                          }
                          onChange={(e) =>
                            setSearchQuery(
                              e.target
                                .value,
                            )
                          }
                          className={`w-full h-10 pl-9 pr-3 text-sm theme-input rounded-xl focus:outline-none ${themeFocus} placeholder:text-[var(--color-text-placeholder)] transition`}
                        />
                      </div>
                    </div>

                    {/* DATE */}

                    <div className="grid grid-cols-2 gap-2 min-w-0">
                      {/* FROM */}

                      <div className="min-w-0">
                        <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                          Dari
                        </label>

                        <input
                          type="date"
                          value={
                            startDate
                          }
                          onChange={(e) =>
                            setStartDate(
                              e.target
                                .value,
                            )
                          }
                          className={`w-full h-10 px-2 text-xs sm:text-sm theme-input rounded-xl focus:outline-none ${themeFocus}`}
                        />
                      </div>

                      {/* TO */}

                      <div className="min-w-0">
                        <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                          Sampai
                        </label>

                        <input
                          type="date"
                          value={
                            endDate
                          }
                          onChange={(e) =>
                            setEndDate(
                              e.target
                                .value,
                            )
                          }
                          className={`w-full h-10 px-2 text-xs sm:text-sm theme-input rounded-xl focus:outline-none ${themeFocus}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE FILTER */}

                  {(selectedKelas ||
                    searchQuery ||
                    startDate ||
                    endDate) && (
                    <div
                      className={`mt-5 pt-4 border-t ${themeDivider}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs theme-text-muted">
                          Filter aktif:
                        </span>

                        {/* KELAS */}

                        {selectedKelas && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${themePrimarySoft} ${themePrimaryText} rounded-full border ${themePrimarySoftBorder}`}
                          >
                            Kelas:{" "}
                            {
                              selectedKelas
                            }

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedKelas(
                                  "",
                                )
                              }
                              className="hover:opacity-70 transition"
                            >
                              ×
                            </button>
                          </span>
                        )}

                        {/* SEARCH */}

                        {searchQuery && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${themeInfoSurface} text-[var(--color-info)] rounded-full border ${themeInfoBorder}`}
                          >
                            Cari:{" "}
                            {
                              searchQuery
                            }

                            <button
                              type="button"
                              onClick={() =>
                                setSearchQuery(
                                  "",
                                )
                              }
                              className="hover:opacity-70 transition"
                            >
                              ×
                            </button>
                          </span>
                        )}

                        {/* DATE */}

                        {(startDate ||
                          endDate) && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${themeWarningSurface} text-[var(--color-warning)] rounded-full border ${themeWarningBorder}`}
                          >
                            {startDate &&
                              `Dari ${formatDate(
                                startDate,
                              )}`}

                            {startDate &&
                              endDate &&
                              " - "}

                            {endDate &&
                              formatDate(
                                endDate,
                              )}

                            <button
                              type="button"
                              onClick={() => {
                                setStartDate(
                                  "",
                                );
                                setEndDate(
                                  "",
                                );
                              }}
                              className="hover:opacity-70 transition"
                            >
                              ×
                            </button>
                          </span>
                        )}

                        {/* CLEAR */}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedKelas(
                              "",
                            );
                            setSearchQuery(
                              "",
                            );
                            setStartDate(
                              "",
                            );
                            setEndDate("");
                          }}
                          className="text-xs theme-text-muted hover:text-[var(--color-primary)] underline transition"
                        >
                          Hapus semua
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  STATISTIK
              ================================================== */}

              <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* TOTAL */}

                <div
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-4 ${themeNeutralHover} transition-all min-w-0`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${themeNeutralSurface} theme-text-secondary flex items-center justify-center mb-3`}
                  >
                    <BarChart3
                      size={15}
                    />
                  </div>

                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                    Total
                  </p>

                  <p className="text-2xl font-bold mt-0.5 theme-text">
                    {stats.total}
                  </p>
                </div>

                {/* HADIR */}

                <div
                  className={`theme-card rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} ${themeCardShadow} p-4 ${themeNeutralHover} transition-all min-w-0`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] text-[var(--color-success)] flex items-center justify-center mb-3">
                    <CheckCircle2
                      size={15}
                    />
                  </div>

                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                    Hadir
                  </p>

                  <p className="text-2xl font-bold mt-0.5 text-[var(--color-success)]">
                    {stats.hadir}
                  </p>
                </div>

                {/* SAKIT */}

                <div
                  className={`theme-card rounded-2xl border ${themeWarningBorder} ${themeWarningSurface} ${themeCardShadow} p-4 ${themeNeutralHover} transition-all min-w-0`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-warning)_15%,transparent)] text-[var(--color-warning)] flex items-center justify-center mb-3">
                    <Stethoscope
                      size={15}
                    />
                  </div>

                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                    Sakit
                  </p>

                  <p className="text-2xl font-bold mt-0.5 text-[var(--color-warning)]">
                    {stats.sakit}
                  </p>
                </div>

                {/* IZIN */}

                <div
                  className={`theme-card rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} ${themeCardShadow} p-4 ${themeNeutralHover} transition-all min-w-0`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-info)_15%,transparent)] text-[var(--color-info)] flex items-center justify-center mb-3">
                    <FileText
                      size={15}
                    />
                  </div>

                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                    Izin
                  </p>

                  <p className="text-2xl font-bold mt-0.5 text-[var(--color-info)]">
                    {stats.izin}
                  </p>
                </div>

                {/* ALPA */}

                <div
                  className={`theme-card rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} ${themeCardShadow} p-4 ${themeNeutralHover} transition-all min-w-0`}
                >
                  <div className={`w-8 h-8 rounded-lg ${themeNeutralSurface} theme-danger flex items-center justify-center mb-3`}>
                    <XCircle
                      size={15}
                    />
                  </div>

                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                    Alpa
                  </p>

                  <p className="text-2xl font-bold mt-0.5 theme-danger">
                    {stats.alpa}
                  </p>
                </div>

                {/* KEHADIRAN */}

                <div
                  className={`rounded-2xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themeCardShadow} p-4 ${themeNeutralHover} transition-all min-w-0`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-card)_55%,transparent)] ${themePrimaryText} flex items-center justify-center mb-3`}
                  >
                    {stats.persentase >=
                    80 ? (
                      <TrendingUp
                        size={16}
                        className="text-[var(--color-success)]"
                      />
                    ) : (
                      <TrendingDown
                        size={16}
                        className="text-[var(--color-warning)]"
                      />
                    )}
                  </div>

                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                    Kehadiran
                  </p>

                  <div className="flex items-center gap-1">
                    <p
                      className={`text-2xl font-bold ${
                        stats.persentase >=
                        80
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-warning)]"
                      }`}
                    >
                      {stats.persentase}%
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  TABLE
              ================================================== */}

              <section
                className={`w-full theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
              >
                {/* TABLE HEADER */}

                <div
                  className={`p-4 sm:p-5 lg:p-6 border-b ${themeDivider}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl ${themePrimarySoft} ${themePrimaryText} flex items-center justify-center`}
                      >
                        <Clock
                          size={17}
                        />
                      </div>

                      <div>
                        <h2 className="text-sm sm:text-base font-semibold theme-text">
                          Riwayat Absensi
                        </h2>

                        <p className="text-xs theme-text-muted mt-0.5">
                          {
                            filteredData.length
                          }{" "}
                          data ditemukan
                        </p>
                      </div>
                    </div>

                    <div className="text-xs theme-text-muted">
                      Menampilkan{" "}
                      <span className="font-semibold theme-text-secondary">
                        {
                          paginatedData.length
                        }
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text-secondary">
                        {
                          filteredData.length
                        }
                      </span>{" "}
                      data
                    </div>
                  </div>
                </div>

                {/* TABLE WRAPPER */}

                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr
                        className={`${themeNeutralSurface} border-b ${themeDivider}`}
                      >
                        <th className="px-4 py-3 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Siswa
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Kelas
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Mata
                          Pelajaran
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Tanggal
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Status
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Catatan
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-16 text-center"
                          >
                            <div
                              className={`w-16 h-16 mx-auto rounded-2xl ${themeNeutralSurface} theme-text-muted flex items-center justify-center mb-4`}
                            >
                              <Calendar
                                size={28}
                              />
                            </div>

                            <p className="text-sm font-semibold theme-text-secondary">
                              Tidak ada data
                              absensi
                            </p>

                            <p className="text-xs theme-text-muted mt-1">
                              Coba ubah filter
                              atau pilih
                              mata pelajaran
                              lain
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map(
                          (item) => (
                            <tr
                              key={
                                item.id
                              }
                              className={`border-b ${themeDivider} ${themeNeutralHover} transition-colors`}
                            >
                              {/* SISWA */}

                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-xl ${getAvatarColor()} flex items-center justify-center font-bold text-[11px] flex-shrink-0`}
                                  >
                                    {getInitials(
                                      item.nama,
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-semibold theme-text text-sm truncate max-w-[180px]">
                                      {
                                        item.nama
                                      }
                                    </p>

                                    <p className="text-[10px] theme-text-muted mt-0.5">
                                      NIS:{" "}
                                      {
                                        item.nis
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* KELAS */}

                              <td className="px-4 py-3.5">
                                <span className="text-xs theme-text-secondary whitespace-nowrap">
                                  {
                                    item.kelas
                                  }
                                </span>
                              </td>

                              {/* MAPEL */}

                              <td className="px-4 py-3.5">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder} whitespace-nowrap`}
                                >
                                  {
                                    item.mapel
                                  }
                                </span>
                              </td>

                              {/* TANGGAL */}

                              <td className="px-4 py-3.5">
                                <span className="text-xs theme-text-secondary flex items-center gap-1.5 whitespace-nowrap">
                                  <Calendar
                                    size={12}
                                    className="theme-text-muted"
                                  />

                                  {formatDate(
                                    item.tanggal,
                                  )}
                                </span>
                              </td>

                              {/* STATUS */}

                              <td className="px-4 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border whitespace-nowrap ${getStatusBadge(
                                    item.status,
                                  )}`}
                                >
                                  {getStatusIcon(
                                    item.status,
                                  )}

                                  {
                                    item.status
                                  }
                                </span>
                              </td>

                              {/* CATATAN */}

                              <td className="px-4 py-3.5">
                                <span className="text-xs theme-text-secondary">
                                  {item.catatan !==
                                  "-"
                                    ? item.catatan
                                    : "—"}
                                </span>
                              </td>

                              {/* AKSI */}

                              <td className="px-4 py-3.5">
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/guru/siswa/${item.siswaId}`,
                                      )
                                    }
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center theme-text-muted hover:${themePrimaryText} ${themePrimarySoft} transition`}
                                    title="Lihat Detail Siswa"
                                  >
                                    <Eye
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ),
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    PAGINATION
                ================================================== */}

                {totalPages > 1 && (
                  <div
                    className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t ${themeDivider} ${themeNeutralSurface}`}
                  >
                    <span className="text-xs theme-text-muted">
                      Halaman{" "}
                      <span className="font-semibold theme-text-secondary">
                        {currentPage}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text-secondary">
                        {totalPages}
                      </span>
                    </span>

                    <div className="flex items-center gap-1">
                      {/* PREVIOUS */}

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage(
                            (p) =>
                              Math.max(
                                1,
                                p - 1,
                              ),
                          )
                        }
                        disabled={
                          currentPage ===
                          1
                        }
                        className={`w-8 h-8 rounded-lg flex items-center justify-center theme-text-secondary ${themeNeutralHover} disabled:opacity-30 disabled:cursor-not-allowed transition`}
                      >
                        <ChevronLeft
                          size={16}
                        />
                      </button>

                      {/* PAGE NUMBERS */}

                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            totalPages,
                          ),
                        },
                        (_, i) => {
                          let pageNum;

                          if (
                            totalPages <=
                            5
                          ) {
                            pageNum =
                              i + 1;
                          } else if (
                            currentPage <=
                            3
                          ) {
                            pageNum =
                              i + 1;
                          } else if (
                            currentPage >=
                            totalPages -
                              2
                          ) {
                            pageNum =
                              totalPages -
                              4 +
                              i;
                          } else {
                            pageNum =
                              currentPage -
                              2 +
                              i;
                          }

                          return (
                            <button
                              key={
                                pageNum
                              }
                              type="button"
                              onClick={() =>
                                setCurrentPage(
                                  pageNum,
                                )
                              }
                              className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                                currentPage ===
                                pageNum
                                  ? `${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow}`
                                  : `theme-text-secondary ${themeNeutralHover}`
                              }`}
                            >
                              {
                                pageNum
                              }
                            </button>
                          );
                        },
                      )}

                      {/* NEXT */}

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage(
                            (p) =>
                              Math.min(
                                totalPages,
                                p + 1,
                              ),
                          )
                        }
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        className={`w-8 h-8 rounded-lg flex items-center justify-center theme-text-secondary ${themeNeutralHover} disabled:opacity-30 disabled:cursor-not-allowed transition`}
                      >
                        <ChevronRight
                          size={16}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <footer
                className={`text-center text-xs theme-text-muted py-5 border-t ${themeDivider}`}
              >
                © 2026 SmartSchool •
                Histori Absensi Siswa
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}