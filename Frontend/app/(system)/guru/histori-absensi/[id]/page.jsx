"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  User,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Stethoscope,
  FileText,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  MapPin,
  Clock,
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
   DATA DUMMY – SISWA & ABSENSI
============================================================ */

const SISWA_LIST = [
  {
    id: 1,
    nama: "Ahmad Fauzan",
    nis: "2401001",
    kelas: "X IPA 1",
    email: "ahmad.f@sekolah.com",
    phone: "081234567890",
    alamat: "Jl. Merdeka No. 12, Jakarta",
    tglLahir: "2006-05-10",
    gender: "L",
  },
  {
    id: 2,
    nama: "Bella Safira",
    nis: "2401002",
    kelas: "X IPA 1",
    email: "bella@sekolah.com",
    phone: "081234567891",
    alamat: "Jl. Sudirman No. 8, Jakarta",
    tglLahir: "2006-08-22",
    gender: "P",
  },
  {
    id: 3,
    nama: "Cahyo Nugroho",
    nis: "2401003",
    kelas: "X IPA 1",
    email: "cahyo@sekolah.com",
    phone: "081234567892",
    alamat: "Jl. Diponegoro No. 5, Jakarta",
    tglLahir: "2006-03-15",
    gender: "L",
  },
  {
    id: 4,
    nama: "Dinda Rahmawati",
    nis: "2401004",
    kelas: "X IPA 1",
    email: "dinda@sekolah.com",
    phone: "081234567893",
    alamat: "Jl. Gatot Subroto No. 3, Jakarta",
    tglLahir: "2006-11-02",
    gender: "P",
  },
  {
    id: 5,
    nama: "Eko Prasetyo",
    nis: "2401005",
    kelas: "X IPA 1",
    email: "eko@sekolah.com",
    phone: "081234567894",
    alamat: "Jl. Asia Afrika No. 45, Jakarta",
    tglLahir: "2006-09-12",
    gender: "L",
  },
  {
    id: 6,
    nama: "Fitri Handayani",
    nis: "2402001",
    kelas: "X IPA 2",
    email: "fitri@sekolah.com",
    phone: "081234567895",
    alamat: "Jl. Merdeka No. 20, Jakarta",
    tglLahir: "2006-02-28",
    gender: "P",
  },
  {
    id: 7,
    nama: "Galih Saputra",
    nis: "2402002",
    kelas: "X IPA 2",
    email: "galih@sekolah.com",
    phone: "081234567896",
    alamat: "Jl. Sudirman No. 15, Jakarta",
    tglLahir: "2006-07-19",
    gender: "L",
  },
  {
    id: 8,
    nama: "Hana Nurul",
    nis: "2402003",
    kelas: "X IPA 2",
    email: "hana@sekolah.com",
    phone: "081234567897",
    alamat: "Jl. Diponegoro No. 10, Jakarta",
    tglLahir: "2006-04-05",
    gender: "P",
  },
  {
    id: 9,
    nama: "Iqbal Ramadhan",
    nis: "2402004",
    kelas: "X IPA 2",
    email: "iqbal@sekolah.com",
    phone: "081234567898",
    alamat: "Jl. Gatot Subroto No. 7, Jakarta",
    tglLahir: "2006-12-25",
    gender: "L",
  },
  {
    id: 10,
    nama: "Jihan Syafira",
    nis: "2402005",
    kelas: "X IPA 2",
    email: "jihan@sekolah.com",
    phone: "081234567899",
    alamat: "Jl. Asia Afrika No. 22, Jakarta",
    tglLahir: "2006-06-14",
    gender: "P",
  },
];

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

/* ============================================================
   GENERATE DATA ABSENSI
============================================================ */

const generateAttendanceForStudent = (siswaId) => {
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
    const numRecords =
      4 + Math.floor(Math.random() * 5);

    const shuffledDates = [...dates].sort(
      () => Math.random() - 0.5,
    );

    for (
      let i = 0;
      i < Math.min(numRecords, shuffledDates.length);
      i++
    ) {
      const status =
        statuses[
          Math.floor(
            Math.random() * statuses.length,
          )
        ];

      const hasNote =
        status !== "Hadir" &&
        Math.random() > 0.5;

      data.push({
        id: id++,
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

  return data;
};

/* ============================================================
   PAGE
============================================================ */

export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();

  const id = parseInt(params.id);

  const [siswa, setSiswa] = useState(null);
  const [attendanceData, setAttendanceData] =
    useState([]);

  const [selectedMapel, setSelectedMapel] =
    useState("Semua Mapel");

  /* ==========================================================
     LOAD SISWA
  ========================================================== */

  useEffect(() => {
    const found = SISWA_LIST.find(
      (s) => s.id === id,
    );

    if (found) {
      setSiswa(found);
      setAttendanceData(
        generateAttendanceForStudent(id),
      );
    } else {
      router.push("/guru/histori-absensi");
    }
  }, [id, router]);

  /* ==========================================================
     FILTER DATA PER MAPEL
  ========================================================== */

  const filteredData = useMemo(() => {
    if (selectedMapel === "Semua Mapel") {
      return attendanceData;
    }

    return attendanceData.filter(
      (item) => item.mapel === selectedMapel,
    );
  }, [attendanceData, selectedMapel]);

  /* ==========================================================
     STATISTIK PER MAPEL
  ========================================================== */

  const mapelStats = useMemo(() => {
    const stats = {};

    MAPEL_LIST.forEach((mapel) => {
      const data = attendanceData.filter(
        (item) => item.mapel === mapel,
      );

      const total = data.length;

      const hadir = data.filter(
        (d) => d.status === "Hadir",
      ).length;

      const sakit = data.filter(
        (d) => d.status === "Sakit",
      ).length;

      const izin = data.filter(
        (d) => d.status === "Izin",
      ).length;

      const alpa = data.filter(
        (d) => d.status === "Alpa",
      ).length;

      const persentase =
        total > 0
          ? Math.round((hadir / total) * 100)
          : 0;

      stats[mapel] = {
        total,
        hadir,
        sakit,
        izin,
        alpa,
        persentase,
      };
    });

    return stats;
  }, [attendanceData]);

  /* ==========================================================
     TOTAL STATISTIK
  ========================================================== */

  const totalStats = useMemo(() => {
    const total = attendanceData.length;

    const hadir = attendanceData.filter(
      (d) => d.status === "Hadir",
    ).length;

    const sakit = attendanceData.filter(
      (d) => d.status === "Sakit",
    ).length;

    const izin = attendanceData.filter(
      (d) => d.status === "Izin",
    ).length;

    const alpa = attendanceData.filter(
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
  }, [attendanceData]);

  /* ==========================================================
     UNIQUE MAPEL
  ========================================================== */

  const uniqueMapel = useMemo(() => {
    const set = new Set(
      attendanceData.map(
        (item) => item.mapel,
      ),
    );

    return [
      "Semua Mapel",
      ...Array.from(set),
    ];
  }, [attendanceData]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (!siswa) {
    return (
      <div className="flex h-screen items-center justify-center theme-page">
        <p className="text-sm theme-text-secondary">
          Memuat...
        </p>
      </div>
    );
  }

  /* ==========================================================
     HELPERS
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

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);

    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="flex h-screen theme-page overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto theme-page p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() => router.back()}
              className={`flex items-center gap-2 text-sm theme-text-secondary hover:text-[var(--color-primary)] transition-colors`}
            >
              <ArrowLeft size={16} />

              Kembali ke Histori Absensi
            </button>

            {/* =================================================
                PROFIL SISWA
            ================================================= */}

            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} p-6 sm:p-8`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* AVATAR */}

                <div
                  className={`w-20 h-20 rounded-full ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder} flex items-center justify-center text-3xl font-bold ${themeSmallShadow} flex-shrink-0`}
                >
                  {getInitials(siswa.nama)}
                </div>

                {/* INFO */}

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold theme-text">
                    {siswa.nama}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm theme-text-secondary">
                      {siswa.nis}
                    </span>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder}`}
                    >
                      {siswa.kelas}
                    </span>

                    <span className="text-sm theme-text-secondary">
                      {siswa.gender === "L"
                        ? "Laki-laki"
                        : "Perempuan"}
                    </span>
                  </div>
                </div>

                {/* ACTION */}

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium theme-text-secondary ${themeNeutralSurface} border ${themeNeutralBorder} rounded-lg ${themeNeutralHover} transition-colors`}
                  >
                    <FileText
                      size={16}
                      className="inline mr-1.5"
                    />

                    Laporan
                  </button>
                </div>
              </div>

              {/* DETAIL INFO */}

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t ${themeDivider}`}
              >
                {/* EMAIL */}

                <div className="flex items-center gap-3">
                  <Mail
                    size={16}
                    className="theme-text-muted"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] theme-text-muted font-medium uppercase">
                      Email
                    </p>

                    <p className="text-sm theme-text-secondary break-words">
                      {siswa.email || "-"}
                    </p>
                  </div>
                </div>

                {/* TELEPON */}

                <div className="flex items-center gap-3">
                  <Phone
                    size={16}
                    className="theme-text-muted"
                  />

                  <div>
                    <p className="text-[10px] theme-text-muted font-medium uppercase">
                      Telepon
                    </p>

                    <p className="text-sm theme-text-secondary">
                      {siswa.phone || "-"}
                    </p>
                  </div>
                </div>

                {/* ALAMAT */}

                <div className="flex items-center gap-3">
                  <MapPin
                    size={16}
                    className="theme-text-muted"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] theme-text-muted font-medium uppercase">
                      Alamat
                    </p>

                    <p className="text-sm theme-text-secondary break-words">
                      {siswa.alamat || "-"}
                    </p>
                  </div>
                </div>

                {/* TANGGAL LAHIR */}

                <div className="flex items-center gap-3">
                  <Calendar
                    size={16}
                    className="theme-text-muted"
                  />

                  <div>
                    <p className="text-[10px] theme-text-muted font-medium uppercase">
                      Tanggal Lahir
                    </p>

                    <p className="text-sm theme-text-secondary">
                      {siswa.tglLahir
                        ? formatDate(
                            siswa.tglLahir,
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                STATISTIK TOTAL
            ================================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* TOTAL */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} p-3 text-center ${themeNeutralHover} transition-all`}
              >
                <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider">
                  Total
                </p>

                <p className="text-xl font-bold theme-text">
                  {totalStats.total}
                </p>
              </div>

              {/* HADIR */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} p-3 text-center ${themeNeutralHover} transition-all`}
              >
                <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider">
                  Hadir
                </p>

                <p className="text-xl font-bold text-[var(--color-success)]">
                  {totalStats.hadir}
                </p>
              </div>

              {/* SAKIT */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} p-3 text-center ${themeNeutralHover} transition-all`}
              >
                <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider">
                  Sakit
                </p>

                <p className="text-xl font-bold text-[var(--color-warning)]">
                  {totalStats.sakit}
                </p>
              </div>

              {/* IZIN */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} p-3 text-center ${themeNeutralHover} transition-all`}
              >
                <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider">
                  Izin
                </p>

                <p className="text-xl font-bold text-[var(--color-info)]">
                  {totalStats.izin}
                </p>
              </div>

              {/* ALPA */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} p-3 text-center ${themeNeutralHover} transition-all`}
              >
                <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider">
                  Alpa
                </p>

                <p className="text-xl font-bold theme-danger">
                  {totalStats.alpa}
                </p>
              </div>

              {/* KEHADIRAN */}

              <div
                className={`rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themeCardShadow} p-3 text-center ${themeNeutralHover} transition-all`}
              >
                <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider">
                  Kehadiran
                </p>

                <p
                  className={`text-xl font-bold flex items-center justify-center gap-1 ${
                    totalStats.persentase >= 80
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-warning)]"
                  }`}
                >
                  {totalStats.persentase}%

                  {totalStats.persentase >=
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
                </p>
              </div>
            </div>

            {/* =================================================
                STATISTIK PER MAPEL
            ================================================= */}

            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} p-5`}
            >
              <h2 className="text-sm font-semibold theme-text flex items-center gap-2 mb-4">
                <BookOpen
                  size={16}
                  className={themePrimaryText}
                />

                Statistik Kehadiran per Mata
                Pelajaran
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MAPEL_LIST.map((mapel) => {
                  const stat =
                    mapelStats[mapel];

                  if (
                    !stat ||
                    stat.total === 0
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={mapel}
                      className={`${themeNeutralSurface} rounded-lg p-3 border ${themeNeutralBorder}`}
                    >
                      <p className="font-medium theme-text text-sm">
                        {mapel}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs">
                        <span className="text-[var(--color-success)]">
                          ✓ {stat.hadir}
                        </span>

                        <span className="text-[var(--color-warning)]">
                          🩺 {stat.sakit}
                        </span>

                        <span className="text-[var(--color-info)]">
                          📋 {stat.izin}
                        </span>

                        <span className="theme-danger">
                          ✗ {stat.alpa}
                        </span>

                        <span
                          className={`font-bold ${
                            stat.persentase >=
                            80
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-warning)]"
                          }`}
                        >
                          {stat.persentase}%
                        </span>
                      </div>

                      {/* PROGRESS */}

                      <div
                        className={`w-full h-1.5 ${themeNeutralSurface} rounded-full mt-1.5 overflow-hidden`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${stat.persentase}%`,
                            backgroundColor:
                              stat.persentase >=
                              80
                                ? "var(--color-success)"
                                : "var(--color-warning)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                RIWAYAT ABSENSI DETAIL
            ================================================= */}

            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              {/* HEADER */}

              <div
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b ${themeDivider}`}
              >
                <div className="flex items-center gap-2">
                  <Clock
                    size={16}
                    className="theme-text-muted"
                  />

                  <span className="text-sm font-semibold theme-text">
                    Riwayat Absensi Detail
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedMapel}
                    onChange={(e) =>
                      setSelectedMapel(
                        e.target.value,
                      )
                    }
                    className={`px-3 py-1.5 text-sm theme-input rounded-lg focus:outline-none ${themeFocus} transition`}
                  >
                    {uniqueMapel.map(
                      (mapel) => (
                        <option
                          key={mapel}
                          value={mapel}
                        >
                          {mapel}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr
                      className={`${themeNeutralSurface} border-b ${themeDivider}`}
                    >
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">
                        #
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">
                        Mata Pelajaran
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">
                        Tanggal
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted whitespace-nowrap">
                        Catatan
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm theme-text-muted"
                        >
                          Tidak ada data
                          absensi untuk
                          siswa ini
                        </td>
                      </tr>
                    ) : (
                      filteredData.map(
                        (item, idx) => (
                          <tr
                            key={item.id}
                            className={`border-b ${themeDivider} ${themeNeutralHover} transition-colors duration-150`}
                          >
                            {/* NUMBER */}

                            <td className="px-4 py-3 text-xs theme-text-muted">
                              {idx + 1}
                            </td>

                            {/* MAPEL */}

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder}`}
                              >
                                {item.mapel}
                              </span>
                            </td>

                            {/* TANGGAL */}

                            <td className="px-4 py-3 text-sm theme-text-secondary">
                              {formatDate(
                                item.tanggal,
                              )}
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusBadge(
                                  item.status,
                                )}`}
                              >
                                {getStatusIcon(
                                  item.status,
                                )}

                                {item.status}
                              </span>
                            </td>

                            {/* CATATAN */}

                            <td className="px-4 py-3 text-sm theme-text-secondary">
                              {item.catatan !==
                              "-"
                                ? item.catatan
                                : "—"}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer
              className={`text-center text-xs theme-text-muted py-4 border-t ${themeDivider}`}
            >
              © 2026 SmartSchool • Detail
              Absensi Siswa
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}