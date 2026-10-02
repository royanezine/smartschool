"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ClipboardList,
  NotebookPen,
  Award,
  FileSpreadsheet,
  Smile,
  GraduationCap,
  Search,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

const STORAGE_KEY = "siswa_data";

const FALLBACK_SISWA = [
  {
    id: 1,
    nama: "Ahmad Fauzan",
    kelas: "X RPL 1",
  },
  {
    id: 2,
    nama: "Bella Safira",
    kelas: "X RPL 1",
  },
  {
    id: 4,
    nama: "Dinda Maharani",
    kelas: "X RPL 2",
  },
  {
    id: 7,
    nama: "Galang Ramadhan",
    kelas: "X TKJ 1",
  },
  {
    id: 10,
    nama: "Jihan Anastasya",
    kelas: "X TKJ 2",
  },
  {
    id: 13,
    nama: "Muhammad Rizky",
    kelas: "X AK 1",
  },
  {
    id: 16,
    nama: "Putri Maharani",
    kelas: "XI RPL 1",
  },
  {
    id: 19,
    nama: "Tegar Pratama",
    kelas: "XI RPL 2",
  },
  {
    id: 22,
    nama: "Wulan Sari",
    kelas: "XI TKJ 1",
  },
  {
    id: 25,
    nama: "Ardiansyah Putra",
    kelas: "XII RPL 1",
  },
];

// =========================================================
// LOAD SISWA
// =========================================================

const loadSiswaList = () => {
  if (typeof window === "undefined") {
    return FALLBACK_SISWA;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    const data = stored ? JSON.parse(stored) : null;

    return Array.isArray(data) && data.length > 0
      ? data
      : FALLBACK_SISWA;
  } catch {
    return FALLBACK_SISWA;
  }
};

// =========================================================
// DETERMINISTIC SUMMARY
// =========================================================

const seedFromId = (id) => {
  const str = String(id);

  let h = 0;

  for (const ch of str) {
    h = (h * 31 + ch.charCodeAt(0)) % 1000000;
  }

  return h + 1;
};

const pseudoRandom = (seed, min, max) => {
  const x = Math.sin(seed) * 10000;

  const frac = x - Math.floor(x);

  return Math.floor(frac * (max - min + 1)) + min;
};

const PRESTASI_POOL = [
  "Juara 1 Lomba Debat Bahasa Inggris",
  "Juara 2 LKS Tingkat Provinsi",
  "Medali Emas OSN Matematika",
  "Juara Harapan Lomba Fotografi",
  "Best Presenter Seminar Nasional",
];

// =========================================================
// BUILD SUMMARY
// =========================================================

const buildRingkasan = (siswaList) => {
  return siswaList.map((s) => {
    const seed = seedFromId(s.id);

    const nilai = pseudoRandom(seed, 68, 98);

    const prestasi =
      pseudoRandom(seed + 1, 0, 100) < 25
        ? 1 + pseudoRandom(seed + 5, 0, 1)
        : 0;

    const sikapRoll = pseudoRandom(seed + 2, 0, 99);

    const sikap =
      sikapRoll < 6
        ? "Perlu Perhatian"
        : sikapRoll < 22
        ? "Cukup"
        : sikapRoll < 65
        ? "Baik"
        : "Sangat Baik";

    const raporSelesai =
      pseudoRandom(seed + 3, 0, 99) < 78;

    const prestasiLabel =
      prestasi > 0
        ? PRESTASI_POOL[
            seedFromId(s.id + "p") % PRESTASI_POOL.length
          ]
        : null;

    return {
      ...s,
      nilai,
      prestasi,
      sikap,
      raporSelesai,
      prestasiLabel,
    };
  });
};

// =========================================================
// HELPER
// =========================================================

const getInitials = (nama = "") => {
  const parts = nama.trim().split(" ");

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return nama.substring(0, 2).toUpperCase();
};

const getAvatarColor = (nama = "") => {
  const colors = [
    "bg-blue-600",
    "bg-slate-600",
    "bg-cyan-600",
    "bg-indigo-600",
    "bg-sky-600",
    "bg-teal-600",
  ];

  return colors[nama.length % colors.length];
};

// =========================================================
// SIKAP STYLE
// =========================================================

const SIKAP_STYLE = {
  "Sangat Baik": "theme-success",
  Baik: "theme-info",
  Cukup: "theme-warning",
  "Perlu Perhatian": "theme-danger",
};

// =========================================================
// SCORE COLOR
// =========================================================

const getScoreStyle = (nilai) => {
  if (nilai >= 90) {
    return "text-[var(--color-success)]";
  }

  if (nilai >= 80) {
    return "theme-sidebar-text-active";
  }

  if (nilai >= 70) {
    return "text-[var(--color-warning)]";
  }

  return "text-[var(--color-danger)]";
};

// =========================================================
// COMPONENT
// =========================================================

export default function AkademikPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ringkasan, setRingkasan] = useState([]);
  const [search, setSearch] = useState("");

  // =======================================================
  // LOAD
  // =======================================================

  useEffect(() => {
    setRingkasan(buildRingkasan(loadSiswaList()));
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // =======================================================
  // SUMMARY
  // =======================================================

  const totalSiswa = ringkasan.length;

  const rataRata = totalSiswa
    ? Math.round(
        ringkasan.reduce(
          (total, item) => total + item.nilai,
          0
        ) / totalSiswa
      )
    : 0;

  const totalPrestasi = ringkasan.reduce(
    (total, item) => total + item.prestasi,
    0
  );

  const perluPerhatian = ringkasan.filter(
    (item) => item.sikap === "Perlu Perhatian"
  ).length;

  const raporSelesai = totalSiswa
    ? ringkasan.filter((item) => item.raporSelesai).length
    : 0;

  const raporPercent = totalSiswa
    ? Math.round((raporSelesai / totalSiswa) * 100)
    : 0;

  // =======================================================
  // CLASS SUMMARY
  // =======================================================

  const ringkasanKelas = useMemo(() => {
    const map = {};

    ringkasan.forEach((siswa) => {
      if (!map[siswa.kelas]) {
        map[siswa.kelas] = [];
      }

      map[siswa.kelas].push(siswa);
    });

    return Object.entries(map)
      .map(([kelas, arr]) => ({
        kelas,

        jumlah: arr.length,

        rataRata: Math.round(
          arr.reduce(
            (total, item) => total + item.nilai,
            0
          ) / arr.length
        ),

        prestasi: arr.reduce(
          (total, item) => total + item.prestasi,
          0
        ),

        perluPerhatian: arr.filter(
          (item) => item.sikap === "Perlu Perhatian"
        ).length,

        raporPercent: Math.round(
          (arr.filter(
            (item) => item.raporSelesai
          ).length /
            arr.length) *
            100
        ),
      }))
      .sort((a, b) =>
        a.kelas.localeCompare(b.kelas)
      );
  }, [ringkasan]);

  // =======================================================
  // SEARCH
  // =======================================================

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return ringkasan;
    }

    return ringkasan.filter(
      (item) =>
        item.nama.toLowerCase().includes(keyword) ||
        item.kelas.toLowerCase().includes(keyword)
    );
  }, [ringkasan, search]);

  // =======================================================
  // QUICK LINKS
  // =======================================================

  const quickLinks = [
    {
      label: "Monitoring Siswa",
      icon: ClipboardList,
      path: "/admin/akademik/monitoringSiswa",
    },
    {
      label: "Nilai",
      icon: NotebookPen,
      path: "/admin/akademik/nilai",
    },
    {
      label: "Prestasi",
      icon: Award,
      path: "/admin/akademik/prestasi",
    },
    {
      label: "Rapor",
      icon: FileSpreadsheet,
      path: "/admin/akademik/rapor",
    },
    {
      label: "Sikap & Perilaku",
      icon: Smile,
      path: "/admin/akademik/sikapPerilaku",
    },
  ];

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="akademik"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* CONTENT */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
            <div className="space-y-6">

              {/* PAGE HEADER */}

              <section>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-3">

                    <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm">
                      <GraduationCap size={21} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                          Akademik
                        </h1>

                        <span className="theme-info inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold">
                          Tahun Aktif
                        </span>

                      </div>

                      <p className="theme-text-muted mt-1 max-w-2xl text-xs leading-5 sm:text-sm">
                        Pantau perkembangan akademik siswa melalui nilai,
                        prestasi, sikap, dan status rapor.
                      </p>
                    </div>
                  </div>

                  {/* QUICK ACTION */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/akademik/monitoringSiswa"
                      )
                    }
                    className="theme-primary inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg px-4 text-xs font-semibold shadow-sm transition xl:self-center"
                  >
                    <ClipboardList size={15} />

                    Monitoring Siswa

                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </section>

              {/* SUMMARY BAR */}

              <section className="theme-card overflow-hidden rounded-xl border shadow-sm">
                <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-5">

                  {/* TOTAL */}

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Users size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Total Siswa
                        </p>

                        <p className="theme-text mt-1 text-xl font-bold">
                          {totalSiswa}
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Siswa terdata
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* NILAI */}

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <TrendingUp size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Rata-rata Nilai
                        </p>

                        <p className="theme-text mt-1 text-xl font-bold">
                          {rataRata}
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Nilai akademik
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* PRESTASI */}

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Award size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Prestasi
                        </p>

                        <p className="theme-text mt-1 text-xl font-bold">
                          {totalPrestasi}
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Total capaian
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* ATTENTION */}

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-danger flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <AlertCircle size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Perlu Perhatian
                        </p>

                        <p className="theme-text mt-1 text-xl font-bold">
                          {perluPerhatian}
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Siswa perlu ditinjau
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* RAPOR */}

                  <div className="col-span-2 min-w-0 p-4 sm:col-span-1 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-success flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <FileSpreadsheet size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">

                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                            Rapor Selesai
                          </p>

                          <p className="theme-text text-sm font-bold">
                            {raporPercent}%
                          </p>

                        </div>

                        <div className="theme-card-soft mt-2 h-1.5 overflow-hidden rounded-full">
                          <div
                            className="theme-primary h-full rounded-full transition-all"
                            style={{
                              width: `${raporPercent}%`,
                            }}
                          />
                        </div>

                        <p className="theme-text-muted mt-1.5 text-[10px]">
                          {raporSelesai} dari {totalSiswa} siswa
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </section>

              {/* NAVIGATION */}

              <section className="flex flex-col gap-3">
                <div>
                  <p className="theme-text text-sm font-bold">
                    Modul Akademik
                  </p>

                  <p className="theme-text-muted mt-1 text-xs">
                    Akses cepat ke pengelolaan akademik.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() =>
                          router.push(item.path)
                        }
                        className="theme-card theme-border theme-text-secondary theme-header-hover group inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-semibold shadow-sm transition"
                      >
                        <Icon
                          size={14}
                          className="theme-text-muted transition group-hover:theme-sidebar-text-active"
                        />

                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* CLASS SUMMARY */}

              <section className="theme-card overflow-hidden rounded-xl border shadow-sm">

                <div className="theme-border-soft border-b px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-1">

                    <h2 className="theme-text text-sm font-bold">
                      Ringkasan Per Kelas
                    </h2>

                    <p className="theme-text-muted text-xs">
                      Perbandingan capaian akademik setiap kelas.
                    </p>

                  </div>
                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[780px] border-collapse">

                    <thead>
                      <tr className="theme-table-header">

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Kelas
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Siswa
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Rata-rata
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Prestasi
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Perhatian
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Rapor
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {ringkasanKelas.map((item) => (
                        <tr
                          key={item.kelas}
                          className="theme-table-hover transition"
                        >

                          <td className="theme-border-soft border-b px-5 py-3.5">
                            <div className="flex items-center gap-2.5">

                              <div className="theme-info flex h-8 w-8 items-center justify-center rounded-lg">
                                <GraduationCap size={15} />
                              </div>

                              <span className="theme-text-secondary text-xs font-bold">
                                {item.kelas}
                              </span>

                            </div>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5 text-center text-xs font-medium">
                            <span className="theme-text-secondary">
                              {item.jumlah}
                            </span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5 text-center">

                            <span
                              className={`text-sm font-bold ${getScoreStyle(
                                item.rataRata
                              )}`}
                            >
                              {item.rataRata}
                            </span>

                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5 text-center text-xs">
                            <span className="theme-text-muted">
                              {item.prestasi}
                            </span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5 text-center">

                            <span
                              className={
                                item.perluPerhatian > 0
                                  ? "text-[var(--color-danger)] text-xs font-bold"
                                  : "theme-text-muted text-xs font-medium"
                              }
                            >
                              {item.perluPerhatian}
                            </span>

                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5">

                            <div className="flex items-center gap-3">

                              <div className="theme-card-soft h-1.5 w-20 overflow-hidden rounded-full">
                                <div
                                  className="theme-primary h-full rounded-full"
                                  style={{
                                    width: `${item.raporPercent}%`,
                                  }}
                                />
                              </div>

                              <span className="theme-text-secondary text-[11px] font-semibold">
                                {item.raporPercent}%
                              </span>

                            </div>

                          </td>

                        </tr>
                      ))}

                      {ringkasanKelas.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-12 text-center"
                          >
                            <p className="theme-text-secondary text-sm font-semibold">
                              Belum ada data kelas
                            </p>

                            <p className="theme-text-muted mt-1 text-xs">
                              Data akan tampil setelah siswa tersedia.
                            </p>
                          </td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>
              </section>

              {/* STUDENT TABLE */}

              <section className="theme-card overflow-hidden rounded-xl border shadow-sm">

                {/* HEADER */}

                <div className="theme-border-soft border-b px-4 py-4 sm:px-5">

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Data Akademik Siswa
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        Ringkasan kondisi akademik setiap siswa.
                      </p>
                    </div>

                    <div className="w-full lg:w-[320px]">

                      <div className="relative">

                        <Search
                          size={16}
                          className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                          placeholder="Cari nama atau kelas..."
                          className="theme-input h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition"
                        />

                      </div>
                    </div>

                  </div>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[900px] border-collapse">

                    <thead>
                      <tr className="theme-table-header">

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Siswa
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Kelas
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Nilai
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Prestasi
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Sikap
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Rapor
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filtered.map((student) => (
                        <tr
                          key={student.id}
                          className="theme-table-hover transition"
                        >

                          {/* SISWA */}

                          <td className="theme-border-soft border-b px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getAvatarColor(
                                  student.nama
                                )} text-[11px] font-bold text-white`}
                              >
                                {getInitials(student.nama)}
                              </div>

                              <div className="min-w-0">

                                <p className="theme-text-secondary truncate text-xs font-bold sm:text-sm">
                                  {student.nama}
                                </p>

                                <p className="theme-text-muted mt-0.5 text-[10px]">
                                  ID Siswa: {student.id}
                                </p>

                              </div>

                            </div>
                          </td>

                          {/* KELAS */}

                          <td className="theme-border-soft border-b px-5 py-4">

                            <span className="theme-info inline-flex rounded-md px-2.5 py-1 text-[10px] font-semibold">
                              {student.kelas}
                            </span>

                          </td>

                          {/* NILAI */}

                          <td className="theme-border-soft border-b px-5 py-4 text-center">

                            <span
                              className={`text-sm font-bold ${getScoreStyle(
                                student.nilai
                              )}`}
                            >
                              {student.nilai}
                            </span>

                          </td>

                          {/* PRESTASI */}

                          <td className="theme-border-soft border-b px-5 py-4 text-center">

                            {student.prestasi > 0 ? (
                              <span
                                title={student.prestasiLabel}
                                className="theme-warning inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold"
                              >
                                <Award size={12} />

                                {student.prestasi}
                              </span>
                            ) : (
                              <span className="theme-text-placeholder text-xs">
                                -
                              </span>
                            )}

                          </td>

                          {/* SIKAP */}

                          <td className="theme-border-soft border-b px-5 py-4 text-center">

                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${SIKAP_STYLE[
                                student.sikap
                              ]}`}
                            >
                              {student.sikap}
                            </span>

                          </td>

                          {/* RAPOR */}

                          <td className="theme-border-soft border-b px-5 py-4">

                            <div className="flex items-center gap-2">

                              {student.raporSelesai ? (
                                <>
                                  <CheckCircle2
                                    size={14}
                                    className="text-[var(--color-success)]"
                                  />

                                  <span className="theme-success rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
                                    Selesai
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />

                                  <span className="theme-warning rounded-md px-1.5 py-0.5 text-[11px] font-semibold">
                                    Proses
                                  </span>
                                </>
                              )}

                            </div>
                          </td>

                        </tr>
                      ))}

                      {filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-14 text-center"
                          >
                            <div className="flex flex-col items-center">

                              <div className="theme-card-soft theme-text-muted flex h-12 w-12 items-center justify-center rounded-xl">
                                <Search size={20} />
                              </div>

                              <p className="theme-text-secondary mt-3 text-sm font-semibold">
                                Data tidak ditemukan
                              </p>

                              <p className="theme-text-muted mt-1 text-xs">
                                Tidak ada siswa yang sesuai dengan pencarian.
                              </p>

                            </div>
                          </td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>

                {/* FOOTER */}

                {filtered.length > 0 && (
                  <div className="theme-card-soft theme-border-soft flex items-center justify-between border-t px-4 py-3 sm:px-5">

                    <p className="theme-text-muted text-[10px] sm:text-xs">
                      Menampilkan{" "}
                      <span className="theme-text-secondary font-semibold">
                        {filtered.length}
                      </span>{" "}
                      dari{" "}
                      <span className="theme-text-secondary font-semibold">
                        {totalSiswa}
                      </span>{" "}
                      siswa
                    </p>

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="theme-sidebar-text-active text-[10px] font-semibold hover:underline sm:text-xs"
                      >
                        Hapus pencarian
                      </button>
                    )}

                  </div>
                )}
              </section>

              {/* FOOTER */}

              <footer className="pb-5 pt-1 text-center">
                <p className="theme-text-muted text-[10px]">
                  © 2026 SmartSchool • Akademik
                </p>
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}