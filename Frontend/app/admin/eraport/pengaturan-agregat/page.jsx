"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  Settings2,
  Save,
  RefreshCw,
  ChevronDown,
  BookOpen,
  Calculator,
  Percent,
  CircleCheck,
  CircleAlert,
  Info,
  Plus,
  Trash2,
  Edit3,
  X,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const initialSubjects = [
  {
    id: 1,
    mapel: "Pemrograman Web",
    kategori: "Produktif",
    tugas: 25,
    uts: 25,
    uas: 30,
    praktik: 20,
    kkm: 75,
    status: "Aktif",
  },
  {
    id: 2,
    mapel: "Basis Data",
    kategori: "Produktif",
    tugas: 25,
    uts: 25,
    uas: 30,
    praktik: 20,
    kkm: 75,
    status: "Aktif",
  },
  {
    id: 3,
    mapel: "Pemrograman Dasar",
    kategori: "Produktif",
    tugas: 30,
    uts: 25,
    uas: 25,
    praktik: 20,
    kkm: 75,
    status: "Aktif",
  },
  {
    id: 4,
    mapel: "Jaringan Komputer",
    kategori: "Produktif",
    tugas: 25,
    uts: 25,
    uas: 30,
    praktik: 20,
    kkm: 75,
    status: "Aktif",
  },
  {
    id: 5,
    mapel: "Matematika",
    kategori: "Umum",
    tugas: 30,
    uts: 20,
    uas: 30,
    praktik: 20,
    kkm: 70,
    status: "Aktif",
  },
  {
    id: 6,
    mapel: "Bahasa Indonesia",
    kategori: "Umum",
    tugas: 30,
    uts: 20,
    uas: 30,
    praktik: 20,
    kkm: 70,
    status: "Aktif",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getTotalWeight(subject) {
  return (
    Number(subject.tugas) +
    Number(subject.uts) +
    Number(subject.uas) +
    Number(subject.praktik)
  );
}

function getStatusStyle(status) {
  if (status === "Aktif") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
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
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:px-5">
      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div>
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
   INPUT BOBOT
========================================================= */

function WeightInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">

        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <Percent
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PengaturanAgregatPage() {
  const [subjects, setSubjects] =
    useState(initialSubjects);

  const [tahunAjaran, setTahunAjaran] =
    useState("2025/2026");

  const [semester, setSemester] =
    useState("Ganjil");

  const [kategori, setKategori] =
    useState("Semua");

  const [search, setSearch] =
    useState("");

  const [editingSubject, setEditingSubject] =
    useState(null);

  const [saved, setSaved] =
    useState(false);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredSubjects = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        !query ||
        subject.mapel
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        kategori === "Semua" ||
        subject.kategori === kategori;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    subjects,
    search,
    kategori,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalSubjects =
    subjects.length;

  const activeSubjects =
    subjects.filter(
      (subject) =>
        subject.status === "Aktif"
    ).length;

  const validSubjects =
    subjects.filter(
      (subject) =>
        getTotalWeight(subject) === 100
    ).length;

  const invalidSubjects =
    totalSubjects - validSubjects;

  /* =========================================================
     UPDATE SUBJECT
  ========================================================= */

  const updateSubject = (
    id,
    field,
    value
  ) => {
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === id
          ? {
              ...subject,
              [field]: value,
            }
          : subject
      )
    );

    setSaved(false);
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
     RESET
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setKategori("Semua");
    setTahunAjaran("2025/2026");
    setSemester("Ganjil");
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteSubject = (id) => {
    setSubjects((current) =>
      current.filter(
        (subject) =>
          subject.id !== id
      )
    );
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

            {/* PAGE HEADER */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Settings2
                    size={23}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">

                  <h1 className="text-[24px] font-bold tracking-tight text-slate-900 sm:text-[27px]">
                    Pengaturan Agregat
                  </h1>

                  <p className="text-sm text-slate-500">
                    Atur bobot penilaian dan KKM untuk e-Rapor
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
                  Simpan Pengaturan
                </button>

              </div>

            </div>

            {/* SUCCESS */}

            {saved && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

                <CircleCheck size={18} />

                <div>
                  <p className="font-semibold">
                    Pengaturan berhasil disimpan
                  </p>

                  <p className="text-xs text-emerald-600">
                    Konfigurasi bobot nilai telah diperbarui.
                  </p>
                </div>

              </div>
            )}

            {/* STAT CARDS */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                icon={BookOpen}
                label="Total Mata Pelajaran"
                value={totalSubjects}
                type="blue"
              />

              <StatCard
                icon={CircleCheck}
                label="Mapel Aktif"
                value={activeSubjects}
                type="green"
              />

              <StatCard
                icon={Calculator}
                label="Konfigurasi Valid"
                value={validSubjects}
                type="purple"
              />

              <StatCard
                icon={CircleAlert}
                label="Bobot Tidak Valid"
                value={invalidSubjects}
                type="orange"
              />

            </div>

            {/* FILTER */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:p-5">

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                {/* TAHUN AJARAN */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Tahun Ajaran
                  </label>

                  <div className="relative">

                    <select
                      value={tahunAjaran}
                      onChange={(e) =>
                        setTahunAjaran(
                          e.target.value
                        )
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
                        setSemester(
                          e.target.value
                        )
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

                {/* KATEGORI */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Kategori Mata Pelajaran
                  </label>

                  <div className="relative">

                    <select
                      value={kategori}
                      onChange={(e) =>
                        setKategori(
                          e.target.value
                        )
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Semua">
                        Semua Kategori
                      </option>

                      <option value="Produktif">
                        Produktif
                      </option>

                      <option value="Umum">
                        Umum
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

              <div className="mt-4">

                <div className="relative">

                  <BookOpen
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari mata pelajaran..."
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

            </div>

            {/* CONFIGURATION INFO */}

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4">

              <div className="flex gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <Calculator size={19} />
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    Konfigurasi Agregat Nilai
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Total bobot setiap mata pelajaran harus
                    berjumlah tepat <strong>100%</strong>.
                    Bobot ini digunakan untuk menghitung
                    nilai akhir pada proses Entry Nilai.
                  </p>

                </div>

              </div>

            </div>

            {/* TABLE */}

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] border-collapse text-left">

                  <thead>

                    <tr className="bg-blue-600 text-xs font-semibold uppercase tracking-wide text-white">

                      <th className="w-16 px-4 py-3.5 text-center">
                        No
                      </th>

                      <th className="px-4 py-3.5">
                        Mata Pelajaran
                      </th>

                      <th className="px-4 py-3.5">
                        Kategori
                      </th>

                      <th className="px-3 py-3.5 text-center">
                        Tugas
                      </th>

                      <th className="px-3 py-3.5 text-center">
                        UTS
                      </th>

                      <th className="px-3 py-3.5 text-center">
                        UAS
                      </th>

                      <th className="px-3 py-3.5 text-center">
                        Praktik
                      </th>

                      <th className="px-3 py-3.5 text-center">
                        Total
                      </th>

                      <th className="px-3 py-3.5 text-center">
                        KKM
                      </th>

                      <th className="px-4 py-3.5 text-center">
                        Status
                      </th>

                      <th className="px-4 py-3.5 text-right">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredSubjects.map(
                      (subject, index) => {

                        const total =
                          getTotalWeight(
                            subject
                          );

                        const valid =
                          total === 100;

                        return (
                          <tr
                            key={subject.id}
                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                          >

                            <td className="px-4 py-4 text-center text-sm font-medium text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-4 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                  <BookOpen size={17} />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {subject.mapel}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    Tahun {tahunAjaran}
                                  </p>
                                </div>

                              </div>

                            </td>

                            <td className="px-4 py-4">

                              <span className="text-sm text-slate-600">
                                {subject.kategori}
                              </span>

                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="text-sm font-medium text-slate-700">
                                {subject.tugas}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="text-sm font-medium text-slate-700">
                                {subject.uts}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="text-sm font-medium text-slate-700">
                                {subject.uas}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="text-sm font-medium text-slate-700">
                                {subject.praktik}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">

                              <span
                                className={`text-sm font-bold ${
                                  valid
                                    ? "text-emerald-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {total}%
                              </span>

                            </td>

                            <td className="px-3 py-4 text-center">

                              <span className="inline-flex min-w-[40px] items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                                {subject.kkm}
                              </span>

                            </td>

                            <td className="px-4 py-4 text-center">

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                  subject.status
                                )}`}
                              >
                                {valid ? (
                                  <CircleCheck
                                    size={13}
                                  />
                                ) : (
                                  <CircleAlert
                                    size={13}
                                  />
                                )}

                                {valid
                                  ? "Valid"
                                  : "Periksa Bobot"}
                              </span>

                            </td>

                            <td className="px-4 py-4">

                              <div className="flex items-center justify-end gap-1">

                                <button
                                  type="button"
                                  title="Edit konfigurasi"
                                  onClick={() =>
                                    setEditingSubject(
                                      subject
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit3 size={16} />
                                </button>

                                <button
                                  type="button"
                                  title="Hapus konfigurasi"
                                  onClick={() =>
                                    deleteSubject(
                                      subject.id
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <Trash2 size={16} />
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                    {filteredSubjects.length === 0 && (
                      <tr>

                        <td
                          colSpan={11}
                          className="px-5 py-16 text-center"
                        >

                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <BookOpen size={21} />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Mata pelajaran tidak ditemukan
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Coba ubah filter atau kata pencarian.
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
                    {filteredSubjects.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-slate-600">
                    {totalSubjects}
                  </span>{" "}
                  mata pelajaran
                </p>

                <p className="text-xs text-slate-400">
                  Bobot wajib berjumlah 100%
                </p>

              </div>

            </div>

            {/* DETAIL RULES */}

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Calculator size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Rumus Nilai Akhir
                    </h3>

                    <p className="text-xs text-slate-400">
                      Perhitungan otomatis e-Rapor
                    </p>
                  </div>

                </div>

                <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">

                  <p className="text-sm font-semibold text-slate-700">
                    Nilai Akhir =
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    (Nilai Tugas × Bobot Tugas) +
                    (Nilai UTS × Bobot UTS) +
                    (Nilai UAS × Bobot UAS) +
                    (Nilai Praktik × Bobot Praktik)
                  </p>

                </div>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Info size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Catatan Pengaturan
                    </h3>

                    <p className="text-xs text-slate-400">
                      Perhatikan konfigurasi sebelum disimpan
                    </p>
                  </div>

                </div>

                <ul className="mt-4 space-y-2 text-xs leading-5 text-slate-500">

                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    Total bobot setiap mata pelajaran harus 100%.
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    KKM menjadi batas minimal ketuntasan siswa.
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    Perubahan bobot akan memengaruhi nilai akhir.
                  </li>

                </ul>

              </div>

            </div>

          </div>

        </main>

      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editingSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Edit Pengaturan
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {editingSubject.mapel}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingSubject(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <div className="p-5 sm:p-6">

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-xs text-slate-500">
                  Mata Pelajaran
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {editingSubject.mapel}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {editingSubject.kategori}
                </p>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <WeightInput
                  label="Bobot Tugas"
                  value={editingSubject.tugas}
                  onChange={(value) =>
                    setEditingSubject({
                      ...editingSubject,
                      tugas: value,
                    })
                  }
                />

                <WeightInput
                  label="Bobot UTS"
                  value={editingSubject.uts}
                  onChange={(value) =>
                    setEditingSubject({
                      ...editingSubject,
                      uts: value,
                    })
                  }
                />

                <WeightInput
                  label="Bobot UAS"
                  value={editingSubject.uas}
                  onChange={(value) =>
                    setEditingSubject({
                      ...editingSubject,
                      uas: value,
                    })
                  }
                />

                <WeightInput
                  label="Bobot Praktik"
                  value={editingSubject.praktik}
                  onChange={(value) =>
                    setEditingSubject({
                      ...editingSubject,
                      praktik: value,
                    })
                  }
                />

              </div>

              {/* TOTAL */}

              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">

                <div>

                  <p className="text-xs text-slate-500">
                    Total Bobot
                  </p>

                  <p
                    className={`mt-1 text-xl font-bold ${
                      getTotalWeight(
                        editingSubject
                      ) === 100
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {getTotalWeight(
                      editingSubject
                    )}%
                  </p>

                </div>

                {getTotalWeight(
                  editingSubject
                ) === 100 ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CircleCheck size={16} />
                    Valid
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                    <CircleAlert size={16} />
                    Harus 100%
                  </span>
                )}

              </div>

              {/* KKM */}

              <div className="mt-4">

                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  KKM
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingSubject.kkm}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      kkm: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 sm:px-6">

              <button
                type="button"
                onClick={() =>
                  setEditingSubject(null)
                }
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {

                  updateSubject(
                    editingSubject.id,
                    "tugas",
                    editingSubject.tugas
                  );

                  updateSubject(
                    editingSubject.id,
                    "uts",
                    editingSubject.uts
                  );

                  updateSubject(
                    editingSubject.id,
                    "uas",
                    editingSubject.uas
                  );

                  updateSubject(
                    editingSubject.id,
                    "praktik",
                    editingSubject.praktik
                  );

                  updateSubject(
                    editingSubject.id,
                    "kkm",
                    editingSubject.kkm
                  );

                  setEditingSubject(null);
                  setSaved(false);

                }}
                disabled={
                  getTotalWeight(
                    editingSubject
                  ) !== 100
                }
                className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />
                Simpan
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}