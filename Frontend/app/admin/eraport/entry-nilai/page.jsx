"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (grade === "B") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (grade === "C") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-rose-50 text-rose-700 border-rose-200";
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
      box: "bg-blue-50",
      icon: "text-blue-600",
      value: "text-slate-900",
    },
    green: {
      box: "bg-emerald-50",
      icon: "text-emerald-600",
      value: "text-emerald-700",
    },
    orange: {
      box: "bg-amber-50",
      icon: "text-amber-600",
      value: "text-amber-700",
    },
    purple: {
      box: "bg-indigo-50",
      icon: "text-indigo-600",
      value: "text-indigo-700",
    },
  };

  const style = styles[type];

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:px-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
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
      className="h-9 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
    <div className="flex min-h-screen bg-[#F5F8FC]">
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <GraduationCap
                    size={23}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="text-[24px] font-bold tracking-tight text-slate-900 sm:text-[27px]">
                    Entry Nilai
                  </h1>

                  <p className="text-sm text-slate-500">
                    Kelola dan input nilai siswa untuk e-Rapor
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilter}
                  className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw size={16} />

                  <span className="hidden sm:inline">
                    Reset
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
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
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CircleCheck size={18} />

                <div>
                  <p className="font-semibold">
                    Nilai berhasil disimpan
                  </p>

                  <p className="text-xs text-emerald-600">
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

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:p-5">

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

                {/* TAHUN AJARAN */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Tahun Ajaran
                  </label>

                  <div className="relative">
                    <select
                      value={tahunAjaran}
                      onChange={(e) =>
                        setTahunAjaran(e.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                {/* SEMESTER */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Semester
                  </label>

                  <div className="relative">
                    <select
                      value={semester}
                      onChange={(e) =>
                        setSemester(e.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                {/* KELAS */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Kelas
                  </label>

                  <div className="relative">
                    <select
                      value={kelas}
                      onChange={(e) =>
                        setKelas(e.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                {/* MAPEL */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Mata Pelajaran
                  </label>

                  <div className="relative">
                    <select
                      value={mapel}
                      onChange={(e) =>
                        setMapel(e.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

              </div>

              {/* SEARCH */}

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari nama siswa, NIS, atau NISN..."
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="shrink-0">
                  <span className="text-sm font-medium text-slate-500">
                    {filteredStudents.length} siswa ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                SUBJECT INFO
            ================================================= */}

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <BookOpen size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-blue-600">
                      {semester} • {tahunAjaran}
                    </p>

                    <h2 className="mt-0.5 text-sm font-bold text-slate-900">
                      {mapel}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Kelas {kelas} • Pengisian nilai e-Rapor
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2">
                  <ClipboardCheck
                    size={17}
                    className="text-blue-600"
                  />

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Bobot Nilai
                    </p>

                    <p className="text-xs font-semibold text-slate-700">
                      Tugas 25% • UTS 25% • UAS 30% • Praktik 20%
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] border-collapse text-left">

                  <thead>
                    <tr className="bg-blue-600 text-xs font-semibold uppercase tracking-wide text-white">

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
                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                          >

                            {/* NO */}

                            <td className="px-4 py-4 text-center text-sm font-medium text-slate-500">
                              {index + 1}
                            </td>

                            {/* SISWA */}

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                                  {student.nama
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {student.nama}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    NISN {student.nisn}
                                  </p>
                                </div>

                              </div>
                            </td>

                            {/* NIS */}

                            <td className="px-4 py-4 text-sm text-slate-600">
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
                              <span className="text-sm font-bold text-slate-900">
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
                                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
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
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Search size={21} />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Siswa tidak ditemukan
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Coba ubah kata kunci pencarian.
                          </p>
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>

              {/* FOOTER */}

              <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-slate-400">
                  Menampilkan{" "}
                  <span className="font-medium text-slate-600">
                    {filteredStudents.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-slate-600">
                    {students.length}
                  </span>{" "}
                  siswa
                </p>

                <p className="text-xs text-slate-400">
                  Nilai akhir dihitung otomatis berdasarkan bobot.
                </p>

              </div>

            </div>

            {/* =================================================
                INFO
            ================================================= */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-4">
              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <GraduationCap size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Informasi Entry Nilai
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Detail Nilai Siswa
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {modalStudent.nama}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalStudent(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>

            </div>

            {/* BODY */}

            <div className="p-5 sm:p-6">

              <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <GraduationCap size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {modalStudent.nama}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
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

              <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">

                <div>
                  <p className="text-xs text-blue-600">
                    Nilai Akhir
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {calculateFinal(modalStudent)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">
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

            <div className="flex justify-end border-t border-slate-200 px-5 py-4 sm:px-6">

              <button
                type="button"
                onClick={() =>
                  setModalStudent(null)
                }
                className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Tutup
              </button>

            </div>

          </div>
        </div>
      )}
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
    <div className="rounded-lg border border-slate-200 bg-white p-4">

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <span className="text-[10px] font-medium text-slate-400">
          {weight}
        </span>
      </div>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}