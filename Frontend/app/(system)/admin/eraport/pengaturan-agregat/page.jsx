"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

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
  Edit3,
  Trash2,
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
    return "theme-success";
  }

  return "theme-card-soft theme-text-secondary";
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
    <div className="theme-card theme-border rounded-xl border px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div>
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
   INPUT BOBOT
========================================================= */

function WeightInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-2 block text-xs font-semibold">
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="theme-input h-10 w-full rounded-lg px-3 pr-9 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />

        <Percent
          size={14}
          className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PengaturanAgregatPage() {
  const [subjects, setSubjects] = useState(initialSubjects);

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
    const query = search.trim().toLowerCase();

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
  }, [subjects, search, kategori]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalSubjects = subjects.length;

  const activeSubjects = subjects.filter(
    (subject) => subject.status === "Aktif"
  ).length;

  const validSubjects = subjects.filter(
    (subject) => getTotalWeight(subject) === 100
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
        (subject) => subject.id !== id
      )
    );
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

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm">
                  <Settings2
                    size={23}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text text-[24px] font-bold tracking-tight sm:text-[27px]">
                    Pengaturan Agregat
                  </h1>

                  <p className="theme-text-muted text-sm">
                    Atur bobot penilaian dan KKM untuk e-Rapor
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
                  className="theme-primary flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition"
                >
                  <Save size={17} />
                  Simpan Pengaturan
                </button>
              </div>
            </div>

            {/* =====================================================
                SUCCESS
            ====================================================== */}

            {saved && (
              <div className="theme-success mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
                <CircleCheck size={18} />

                <div>
                  <p className="font-semibold">
                    Pengaturan berhasil disimpan
                  </p>

                  <p className="text-xs opacity-80">
                    Konfigurasi bobot nilai telah diperbarui.
                  </p>
                </div>
              </div>
            )}

            {/* =====================================================
                STAT CARDS
            ====================================================== */}

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

            {/* =====================================================
                FILTER
            ====================================================== */}

            <div className="theme-card theme-border mt-5 rounded-xl border p-4 shadow-sm sm:p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                {/* TAHUN AJARAN */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
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
                        setSemester(
                          e.target.value
                        )
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

                {/* KATEGORI */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
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
                      className="theme-input h-10 w-full appearance-none rounded-lg px-3.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
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
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
              </div>

              {/* SEARCH */}

              <div className="mt-4">
                <div className="relative">
                  <BookOpen
                    size={18}
                    className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari mata pelajaran..."
                    className="theme-input h-11 w-full rounded-lg pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>
            </div>

            {/* =====================================================
                CONFIGURATION INFO
            ====================================================== */}

            <div className="theme-info theme-border mt-5 rounded-xl border px-5 py-4">
              <div className="flex gap-3">
                <div className="theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm">
                  <Calculator
                    size={19}
                    className="text-[var(--color-info)]"
                  />
                </div>

                <div>
                  <p className="theme-text text-sm font-semibold">
                    Konfigurasi Agregat Nilai
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs leading-5">
                    Total bobot setiap mata pelajaran harus
                    berjumlah tepat <strong>100%</strong>.
                    Bobot ini digunakan untuk menghitung
                    nilai akhir pada proses Entry Nilai.
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                TABLE
            ====================================================== */}

            <div className="theme-card theme-border mt-5 overflow-hidden rounded-xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <thead>
                    <tr className="theme-primary text-xs font-semibold uppercase tracking-wide">
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
                            className="theme-table-hover border-b border-[var(--color-border-soft)] transition last:border-0"
                          >
                            <td className="theme-text-muted px-4 py-4 text-center text-sm font-medium">
                              {index + 1}
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                  <BookOpen size={17} />
                                </div>

                                <div>
                                  <p className="theme-text text-sm font-semibold">
                                    {subject.mapel}
                                  </p>

                                  <p className="theme-text-muted mt-0.5 text-xs">
                                    Tahun {tahunAjaran}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="theme-text-secondary text-sm">
                                {subject.kategori}
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="theme-text-secondary text-sm font-medium">
                                {subject.tugas}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="theme-text-secondary text-sm font-medium">
                                {subject.uts}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="theme-text-secondary text-sm font-medium">
                                {subject.uas}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="theme-text-secondary text-sm font-medium">
                                {subject.praktik}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span
                                className={`text-sm font-bold ${
                                  valid
                                    ? "text-[var(--color-success)]"
                                    : "text-[var(--color-danger)]"
                                }`}
                              >
                                {total}%
                              </span>
                            </td>

                            <td className="px-3 py-4 text-center">
                              <span className="theme-card-soft theme-text-secondary inline-flex min-w-[40px] items-center justify-center rounded-md px-2 py-1 text-sm font-semibold">
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
                                  <CircleCheck size={13} />
                                ) : (
                                  <CircleAlert size={13} />
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
                                  className="theme-text-muted theme-sidebar-hover flex h-8 w-8 items-center justify-center rounded-md transition hover:text-[var(--color-primary)]"
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
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
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
                          <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <BookOpen size={21} />
                          </div>

                          <p className="theme-text-secondary mt-3 text-sm font-semibold">
                            Mata pelajaran tidak ditemukan
                          </p>

                          <p className="theme-text-muted mt-1 text-xs">
                            Coba ubah filter atau kata pencarian.
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
                    {filteredSubjects.length}
                  </span>{" "}
                  dari{" "}
                  <span className="theme-text-secondary font-medium">
                    {totalSubjects}
                  </span>{" "}
                  mata pelajaran
                </p>

                <p className="theme-text-muted text-xs">
                  Bobot wajib berjumlah 100%
                </p>
              </div>
            </div>

            {/* =====================================================
                DETAIL RULES
            ====================================================== */}

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="theme-card theme-border rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                    <Calculator size={18} />
                  </div>

                  <div>
                    <h3 className="theme-text text-sm font-bold">
                      Rumus Nilai Akhir
                    </h3>

                    <p className="theme-text-muted text-xs">
                      Perhitungan otomatis e-Rapor
                    </p>
                  </div>
                </div>

                <div className="theme-card-soft mt-4 rounded-lg px-4 py-3">
                  <p className="theme-text-secondary text-sm font-semibold">
                    Nilai Akhir =
                  </p>

                  <p className="theme-text-muted mt-2 text-xs leading-5">
                    (Nilai Tugas × Bobot Tugas) +
                    (Nilai UTS × Bobot UTS) +
                    (Nilai UAS × Bobot UAS) +
                    (Nilai Praktik × Bobot Praktik)
                  </p>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <div className="theme-warning flex h-9 w-9 items-center justify-center rounded-lg">
                    <Info size={18} />
                  </div>

                  <div>
                    <h3 className="theme-text text-sm font-bold">
                      Catatan Pengaturan
                    </h3>

                    <p className="theme-text-muted text-xs">
                      Perhatikan konfigurasi sebelum disimpan
                    </p>
                  </div>
                </div>

                <ul className="theme-text-muted mt-4 space-y-2 text-xs leading-5">
                  <li className="flex gap-2">
                    <span className="theme-primary mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                    Total bobot setiap mata pelajaran harus 100%.
                  </li>

                  <li className="flex gap-2">
                    <span className="theme-primary mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                    KKM menjadi batas minimal ketuntasan siswa.
                  </li>

                  <li className="flex gap-2">
                    <span className="theme-primary mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
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
      ====================================================== */}

      {editingSubject && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-text) 40%, transparent)",
          }}
        >
          <div className="theme-card w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">

            {/* HEADER */}

            <div className="theme-border flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  Edit Pengaturan
                </h2>

                <p className="theme-text-muted mt-0.5 text-xs">
                  {editingSubject.mapel}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingSubject(null)
                }
                className="theme-text-muted theme-sidebar-hover flex h-9 w-9 items-center justify-center rounded-lg transition hover:text-[var(--color-text)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <div className="p-5 sm:p-6">
              <div className="theme-card-soft rounded-xl p-4">
                <p className="theme-text-muted text-xs">
                  Mata Pelajaran
                </p>

                <p className="theme-text mt-1 text-sm font-bold">
                  {editingSubject.mapel}
                </p>

                <p className="theme-text-muted mt-1 text-xs">
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

              <div className="theme-card theme-border mt-4 flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="theme-text-muted text-xs">
                    Total Bobot
                  </p>

                  <p
                    className={`mt-1 text-xl font-bold ${
                      getTotalWeight(
                        editingSubject
                      ) === 100
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {getTotalWeight(
                      editingSubject
                    )}
                    %
                  </p>
                </div>

                {getTotalWeight(
                  editingSubject
                ) === 100 ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-success)]">
                    <CircleCheck size={16} />
                    Valid
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-danger)]">
                    <CircleAlert size={16} />
                    Harus 100%
                  </span>
                )}
              </div>

              {/* KKM */}

              <div className="mt-4">
                <label className="theme-text-secondary mb-2 block text-xs font-semibold">
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
                  className="theme-input h-10 w-full rounded-lg px-3 text-sm font-medium outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>

            {/* FOOTER */}

            <div className="theme-border flex justify-end gap-2 border-t px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setEditingSubject(null)
                }
                className="theme-card theme-border theme-text-secondary theme-sidebar-hover h-10 rounded-lg border px-4 text-sm font-medium transition"
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
                className="theme-primary flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
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