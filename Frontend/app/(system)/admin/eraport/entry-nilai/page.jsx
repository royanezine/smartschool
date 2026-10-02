"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  GraduationCap,
  Search,
  RefreshCw,
  ChevronDown,
  Save,
  Users,
  BookOpen,
  ClipboardCheck,
  CircleCheck,
  CircleAlert,
  Eye,
  X,
  Award,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const initialStudents = [
  {
    id: 1,
    nis: "2024001",
    nisn: "0061234567",
    nama: "Andi Pratama",
    tugas: 88,
    uts: 84,
    uas: 90,
    praktik: 89,
  },
  {
    id: 2,
    nis: "2024002",
    nisn: "0061234568",
    nama: "Budi Santoso",
    tugas: 82,
    uts: 80,
    uas: 85,
    praktik: 84,
  },
  {
    id: 3,
    nis: "2024003",
    nisn: "0061234569",
    nama: "Citra Lestari",
    tugas: 94,
    uts: 92,
    uas: 95,
    praktik: 93,
  },
  {
    id: 4,
    nis: "2024004",
    nisn: "0061234570",
    nama: "Dimas Saputra",
    tugas: 78,
    uts: 76,
    uas: 80,
    praktik: 82,
  },
  {
    id: 5,
    nis: "2024005",
    nisn: "0061234571",
    nama: "Eka Ramadhani",
    tugas: 91,
    uts: 89,
    uas: 92,
    praktik: 90,
  },
  {
    id: 6,
    nis: "2024006",
    nisn: "0061234572",
    nama: "Fajar Nugroho",
    tugas: 75,
    uts: 78,
    uas: 77,
    praktik: 80,
  },
  {
    id: 7,
    nis: "2024007",
    nisn: "0061234573",
    nama: "Gilang Maulana",
    tugas: 86,
    uts: 84,
    uas: 88,
    praktik: 87,
  },
  {
    id: 8,
    nis: "2024008",
    nisn: "0061234574",
    nama: "Hana Putri",
    tugas: 96,
    uts: 94,
    uas: 97,
    praktik: 95,
  },
  {
    id: 9,
    nis: "2024009",
    nisn: "0061234575",
    nama: "Irfan Hakim",
    tugas: 80,
    uts: 82,
    uas: 79,
    praktik: 81,
  },
  {
    id: 10,
    nis: "2024010",
    nisn: "0061234576",
    nama: "Jihan Aulia",
    tugas: 89,
    uts: 91,
    uas: 90,
    praktik: 92,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function calculateFinal(student) {
  const tugas = Number(student.tugas) || 0;
  const uts = Number(student.uts) || 0;
  const uas = Number(student.uas) || 0;
  const praktik = Number(student.praktik) || 0;

  return Math.round(
    tugas * 0.25 +
      uts * 0.25 +
      uas * 0.3 +
      praktik * 0.2
  );
}

function getGrade(finalScore) {
  if (finalScore >= 90) return "A";
  if (finalScore >= 80) return "B";
  if (finalScore >= 70) return "C";
  if (finalScore >= 60) return "D";
  return "E";
}

function getGradeStyle(grade) {
  if (grade === "A") {
    return "theme-success";
  }

  if (grade === "B") {
    return "theme-info";
  }

  if (grade === "C") {
    return "theme-warning";
  }

  return "theme-danger";
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  type = "blue",
}) {
  const styles = {
    blue: {
      box: "theme-info",
      icon: "text-[var(--color-info)]",
      value: "theme-text",
    },
    green: {
      box: "theme-success",
      icon: "text-[var(--color-success)]",
      value: "text-[var(--color-success)]",
    },
    orange: {
      box: "theme-warning",
      icon: "text-[var(--color-warning)]",
      value: "text-[var(--color-warning)]",
    },
    purple: {
      box: "theme-card-soft",
      icon: "text-[var(--color-primary)]",
      value: "text-[var(--color-primary)]",
    },
  };

  const style = styles[type];

  return (
    <div className="theme-card theme-border min-w-0 rounded-xl border px-4 py-4 theme-shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SCORE INPUT
========================================================= */

function ScoreInput({
  value,
  onChange,
}) {
  return (
    <input
      type="number"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="theme-input h-9 w-20 rounded-md px-2 text-center text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
    />
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function EntryNilaiPage() {
  const [students, setStudents] =
    useState(initialStudents);

  const [search, setSearch] = useState("");

  const [tahunAjaran, setTahunAjaran] =
    useState("2025/2026");

  const [semester, setSemester] =
    useState("Ganjil");

  const [kelas, setKelas] =
    useState("XII PPLG 1");

  const [mapel, setMapel] =
    useState("Pemrograman Web");

  const [modalStudent, setModalStudent] =
    useState(null);

  const [saved, setSaved] = useState(false);

  /* =========================================================
     FILTER STUDENTS
  ========================================================= */

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return students;

    return students.filter(
      (student) =>
        student.nama.toLowerCase().includes(q) ||
        student.nis.toLowerCase().includes(q) ||
        student.nisn.toLowerCase().includes(q)
    );
  }, [students, search]);

  /* =========================================================
     UPDATE SCORE
  ========================================================= */

  const updateScore = (
    studentId,
    field,
    value
  ) => {
    let score = value;

    if (score !== "") {
      score = Math.max(
        0,
        Math.min(100, Number(score))
      );
    }

    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              [field]: score,
            }
          : student
      )
    );

    setSaved(false);
  };

  /* =========================================================
     STATISTIC
  ========================================================= */

  const totalStudents = students.length;

  const completedStudents =
    students.filter((student) => {
      return (
        student.tugas !== "" &&
        student.uts !== "" &&
        student.uas !== "" &&
        student.praktik !== ""
      );
    }).length;

  const incompleteStudents =
    totalStudents - completedStudents;

  const averageScore =
    students.length > 0
      ? Math.round(
          students.reduce(
            (total, student) =>
              total + calculateFinal(student),
            0
          ) / students.length
        )
      : 0;

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setTahunAjaran("2025/2026");
    setSemester("Ganjil");
    setKelas("XII PPLG 1");
    setMapel("Pemrograman Web");
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex min-h-screen w-full">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl theme-shadow-sm">
                  <GraduationCap
                    size={23}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text text-[24px] font-bold tracking-tight sm:text-[27px]">
                    Entry Nilai
                  </h1>

                  <p className="theme-text-muted text-sm">
                    Kelola dan input nilai siswa untuk e-Rapor
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilter}
                  className="theme-card theme-border theme-text-secondary theme-sidebar-hover flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition"
                >
                  <RefreshCw size={16} />

                  <span className="hidden sm:inline">
                    Reset
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="theme-primary flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold theme-shadow-sm transition"
                >
                  <Save size={17} />
                  Simpan Nilai
                </button>
              </div>
            </div>

            {/* =================================================
                SUCCESS
            ================================================= */}

            {saved && (
              <div className="theme-success mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
                <CircleCheck size={18} />

                <div>
                  <p className="font-semibold">
                    Nilai berhasil disimpan
                  </p>

                  <p className="text-xs opacity-80">
                    Data nilai sementara berhasil diperbarui.
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total Siswa"
                value={totalStudents}
                type="blue"
              />

              <StatCard
                icon={CircleCheck}
                label="Nilai Lengkap"
                value={completedStudents}
                type="green"
              />

              <StatCard
                icon={CircleAlert}
                label="Belum Lengkap"
                value={incompleteStudents}
                type="orange"
              />

              <StatCard
                icon={Award}
                label="Rata-rata Nilai"
                value={averageScore}
                type="purple"
              />
            </div>

            {/* =================================================
                FILTER CARD
            ================================================= */}

            <div className="theme-card theme-border mt-5 rounded-xl border p-4 theme-shadow-sm sm:p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

                {/* TAHUN AJARAN */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Tahun Ajaran
                  </label>

                  <div className="relative">
                    <select
                      value={tahunAjaran}
                      onChange={(e) =>
                        setTahunAjaran(e.target.value)
                      }
                      className="theme-input h-10 w-full appearance-none rounded-lg px-3.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    >
                      <option value="2025/2026">
                        2025/2026
                      </option>

                      <option value="2024/2025">
                        2024/2025
                      </option>

                      <option value="2023/2024">
                        2023/2024
                      </option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* SEMESTER */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Semester
                  </label>

                  <div className="relative">
                    <select
                      value={semester}
                      onChange={(e) =>
                        setSemester(e.target.value)
                      }
                      className="theme-input h-10 w-full appearance-none rounded-lg px-3.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    >
                      <option value="Ganjil">
                        Semester Ganjil
                      </option>

                      <option value="Genap">
                        Semester Genap
                      </option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* KELAS */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Kelas
                  </label>

                  <div className="relative">
                    <select
                      value={kelas}
                      onChange={(e) =>
                        setKelas(e.target.value)
                      }
                      className="theme-input h-10 w-full appearance-none rounded-lg px-3.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    >
                      <option value="XII PPLG 1">
                        XII PPLG 1
                      </option>

                      <option value="XII PPLG 2">
                        XII PPLG 2
                      </option>

                      <option value="XI PPLG 1">
                        XI PPLG 1
                      </option>

                      <option value="XI PPLG 2">
                        XI PPLG 2
                      </option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* MAPEL */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Mata Pelajaran
                  </label>

                  <div className="relative">
                    <select
                      value={mapel}
                      onChange={(e) =>
                        setMapel(e.target.value)
                      }
                      className="theme-input h-10 w-full appearance-none rounded-lg px-3.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    >
                      <option value="Pemrograman Web">
                        Pemrograman Web
                      </option>

                      <option value="Basis Data">
                        Basis Data
                      </option>

                      <option value="Pemrograman Dasar">
                        Pemrograman Dasar
                      </option>

                      <option value="Jaringan Komputer">
                        Jaringan Komputer
                      </option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
              </div>

              {/* SEARCH */}

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari nama siswa, NIS, atau NISN..."
                    className="theme-input h-11 w-full rounded-lg pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                <div className="shrink-0">
                  <span className="theme-text-muted text-sm font-medium">
                    {filteredStudents.length} siswa ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                SUBJECT INFO
            ================================================= */}

            <div className="theme-info theme-border mt-5 rounded-xl border px-5 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-lg theme-shadow-sm">
                    <BookOpen
                      size={19}
                      className="text-[var(--color-info)]"
                    />
                  </div>

                  <div>
                    <p className="theme-text text-xs font-medium">
                      {semester} • {tahunAjaran}
                    </p>

                    <h2 className="theme-text mt-0.5 text-sm font-bold">
                      {mapel}
                    </h2>

                    <p className="theme-text-muted mt-0.5 text-xs">
                      Kelas {kelas} • Pengisian nilai e-Rapor
                    </p>
                  </div>
                </div>

                <div className="theme-card theme-border flex items-center gap-2 rounded-lg border px-3 py-2">
                  <ClipboardCheck
                    size={17}
                    className="text-[var(--color-info)]"
                  />

                  <div>
                    <p className="theme-text-muted text-[11px]">
                      Bobot Nilai
                    </p>

                    <p className="theme-text-secondary text-xs font-semibold">
                      Tugas 25% • UTS 25% • UAS 30% • Praktik 20%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="theme-card theme-border mt-5 overflow-hidden rounded-xl border theme-shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] border-collapse text-left">
                  <thead>
                    <tr className="theme-table-header text-xs font-semibold uppercase tracking-wide">
                      <th className="w-16 px-4 py-3.5 text-center">
                        No
                      </th>

                      <th className="px-4 py-3.5">
                        Siswa
                      </th>

                      <th className="px-4 py-3.5">
                        NIS
                      </th>

                      <th className="px-4 py-3.5 text-center">
                        Tugas
                      </th>

                      <th className="px-4 py-3.5 text-center">
                        UTS
                      </th>

                      <th className="px-4 py-3.5 text-center">
                        UAS
                      </th>

                      <th className="px-4 py-3.5 text-center">
                        Praktik
                      </th>

                      <th className="px-4 py-3.5 text-center">
                        Nilai Akhir
                      </th>

                      <th className="px-4 py-3.5 text-center">
                        Predikat
                      </th>

                      <th className="px-4 py-3.5 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map(
                      (student, index) => {
                        const finalScore =
                          calculateFinal(student);

                        const grade =
                          getGrade(finalScore);

                        return (
                          <tr
                            key={student.id}
                            className="theme-table-hover border-b border-[var(--color-border-soft)] transition last:border-0"
                          >
                            {/* NO */}

                            <td className="theme-text-muted px-4 py-4 text-center text-sm font-medium">
                              {index + 1}
                            </td>

                            {/* SISWA */}

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                                  {student.nama
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="theme-text truncate text-sm font-semibold">
                                    {student.nama}
                                  </p>

                                  <p className="theme-text-muted mt-0.5 text-xs">
                                    NISN {student.nisn}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* NIS */}

                            <td className="theme-text-secondary px-4 py-4 text-sm">
                              {student.nis}
                            </td>

                            {/* TUGAS */}

                            <td className="px-4 py-4 text-center">
                              <ScoreInput
                                value={student.tugas}
                                onChange={(value) =>
                                  updateScore(
                                    student.id,
                                    "tugas",
                                    value
                                  )
                                }
                              />
                            </td>

                            {/* UTS */}

                            <td className="px-4 py-4 text-center">
                              <ScoreInput
                                value={student.uts}
                                onChange={(value) =>
                                  updateScore(
                                    student.id,
                                    "uts",
                                    value
                                  )
                                }
                              />
                            </td>

                            {/* UAS */}

                            <td className="px-4 py-4 text-center">
                              <ScoreInput
                                value={student.uas}
                                onChange={(value) =>
                                  updateScore(
                                    student.id,
                                    "uas",
                                    value
                                  )
                                }
                              />
                            </td>

                            {/* PRAKTIK */}

                            <td className="px-4 py-4 text-center">
                              <ScoreInput
                                value={student.praktik}
                                onChange={(value) =>
                                  updateScore(
                                    student.id,
                                    "praktik",
                                    value
                                  )
                                }
                              />
                            </td>

                            {/* NILAI AKHIR */}

                            <td className="px-4 py-4 text-center">
                              <span className="theme-text text-sm font-bold">
                                {finalScore}
                              </span>
                            </td>

                            {/* PREDIKAT */}

                            <td className="px-4 py-4 text-center">
                              <span
                                className={`inline-flex min-w-[36px] items-center justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${getGradeStyle(
                                  grade
                                )}`}
                              >
                                {grade}
                              </span>
                            </td>

                            {/* AKSI */}

                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end">
                                <button
                                  type="button"
                                  title="Lihat detail nilai"
                                  onClick={() =>
                                    setModalStudent(
                                      student
                                    )
                                  }
                                  className="theme-text-muted theme-sidebar-hover flex h-8 w-8 items-center justify-center rounded-md transition hover:text-[var(--color-primary)]"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}

                    {/* EMPTY */}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-5 py-16 text-center"
                        >
                          <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <Search size={21} />
                          </div>

                          <p className="theme-text-secondary mt-3 text-sm font-semibold">
                            Siswa tidak ditemukan
                          </p>

                          <p className="theme-text-muted mt-1 text-xs">
                            Coba ubah kata kunci pencarian.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}

              <div className="theme-border-soft flex flex-col gap-2 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-muted text-xs">
                  Menampilkan{" "}
                  <span className="theme-text-secondary font-medium">
                    {filteredStudents.length}
                  </span>{" "}
                  dari{" "}
                  <span className="theme-text-secondary font-medium">
                    {students.length}
                  </span>{" "}
                  siswa
                </p>

                <p className="theme-text-muted text-xs">
                  Nilai akhir dihitung otomatis berdasarkan bobot.
                </p>
              </div>
            </div>

            {/* =================================================
                INFO
            ================================================= */}

            <div className="theme-card theme-border mt-5 rounded-xl border px-5 py-4">
              <div className="flex gap-3">
                <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <GraduationCap size={18} />
                </div>

                <div>
                  <p className="theme-text text-sm font-semibold">
                    Informasi Entry Nilai
                  </p>

                  <p className="theme-text-muted mt-1 text-xs leading-5">
                    Masukkan nilai Tugas, UTS, UAS, dan Praktik.
                    Nilai akhir akan dihitung otomatis sesuai
                    bobot penilaian yang telah ditentukan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          DETAIL NILAI MODAL
      ===================================================== */}

      {modalStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-text) 40%, transparent)",
          }}
        >
          <div className="theme-card w-full max-w-lg overflow-hidden rounded-2xl theme-shadow-lg">

            {/* HEADER */}

            <div className="theme-border flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  Detail Nilai Siswa
                </h2>

                <p className="theme-text-muted mt-0.5 text-xs">
                  {modalStudent.nama}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalStudent(null)
                }
                className="theme-text-muted theme-sidebar-hover flex h-9 w-9 items-center justify-center rounded-lg transition hover:text-[var(--color-text)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}

            <div className="p-5 sm:p-6">
              <div className="theme-card-soft mb-5 flex items-center gap-3 rounded-xl p-4">
                <div className="theme-primary flex h-11 w-11 items-center justify-center rounded-lg">
                  <GraduationCap size={20} />
                </div>

                <div>
                  <p className="theme-text text-sm font-semibold">
                    {modalStudent.nama}
                  </p>

                  <p className="theme-text-muted mt-0.5 text-xs">
                    NIS {modalStudent.nis} • {kelas}
                  </p>
                </div>
              </div>

              {/* SCORE GRID */}

              <div className="grid grid-cols-2 gap-3">
                <ScoreDetail
                  label="Tugas"
                  value={modalStudent.tugas}
                  weight="25%"
                />

                <ScoreDetail
                  label="UTS"
                  value={modalStudent.uts}
                  weight="25%"
                />

                <ScoreDetail
                  label="UAS"
                  value={modalStudent.uas}
                  weight="30%"
                />

                <ScoreDetail
                  label="Praktik"
                  value={modalStudent.praktik}
                  weight="20%"
                />
              </div>

              {/* FINAL */}

              <div className="theme-info theme-border mt-4 flex items-center justify-between rounded-xl border px-4 py-4">
                <div>
                  <p className="theme-text text-xs">
                    Nilai Akhir
                  </p>

                  <p className="theme-text mt-1 text-2xl font-bold">
                    {calculateFinal(modalStudent)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="theme-text-muted text-xs">
                    Predikat
                  </p>

                  <span
                    className={`mt-1 inline-flex min-w-[40px] justify-center rounded-md border px-3 py-1 text-sm font-bold ${getGradeStyle(
                      getGrade(
                        calculateFinal(
                          modalStudent
                        )
                      )
                    )}`}
                  >
                    {getGrade(
                      calculateFinal(
                        modalStudent
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="theme-border flex justify-end border-t px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setModalStudent(null)
                }
                className="theme-card theme-border theme-text-secondary theme-sidebar-hover h-10 rounded-lg border px-5 text-sm font-medium transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* =====================================================
           THEME SHADOWS
           Shadows intentionally derive their color from the
           active theme token instead of a fixed light/dark color.
        ===================================================== */
        .theme-shadow-sm {
          box-shadow:
            0 1px 3px 0 color-mix(
              in srgb,
              var(--color-text) 8%,
              transparent
            );
        }

        .theme-shadow-lg {
          box-shadow:
            0 20px 45px 0 color-mix(
              in srgb,
              var(--color-text) 18%,
              transparent
            );
        }

        @media (prefers-reduced-motion: reduce) {
          .theme-shadow-sm,
          .theme-shadow-lg {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   SCORE DETAIL
========================================================= */

function ScoreDetail({
  label,
  value,
  weight,
}) {
  return (
    <div className="theme-card theme-border rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="theme-text-muted text-xs font-medium">
          {label}
        </p>

        <span className="theme-text-placeholder text-[10px] font-medium">
          {weight}
        </span>
      </div>

      <p className="theme-text mt-2 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}