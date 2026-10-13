"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  Info,
  LockKeyhole,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

const INITIAL_CLASSES = [
  {
    id: "xipa1",
    name: "X IPA 1",
    subject: "Matematika",
    semester: "Ganjil",
    year: "2026/2027",
    finalized: false,
    students: [
      { id: "s1", name: "Aditya Pratama", nis: "102401", tugas: 85, uts: 82, uas: 88 },
      { id: "s2", name: "Anisa Putri", nis: "102402", tugas: 90, uts: 86, uas: 91 },
      { id: "s3", name: "Bima Saputra", nis: "102403", tugas: 78, uts: 80, uas: 83 },
      { id: "s4", name: "Citra Maharani", nis: "102404", tugas: 92, uts: 89, uas: 94 },
      { id: "s5", name: "Dimas Ramadhan", nis: "102405", tugas: 75, uts: 77, uas: 80 },
    ],
  },
  {
    id: "xipa2",
    name: "X IPA 2",
    subject: "Matematika",
    semester: "Ganjil",
    year: "2026/2027",
    finalized: false,
    students: [
      { id: "s6", name: "Farhan Akbar", nis: "102406", tugas: 82, uts: 84, uas: 86 },
      { id: "s7", name: "Gita Lestari", nis: "102407", tugas: 88, uts: 90, uas: 92 },
      { id: "s8", name: "Hendra Wijaya", nis: "102408", tugas: 79, uts: null, uas: 81 },
    ],
  },
  {
    id: "xib1",
    name: "XI IPA 1",
    subject: "Matematika",
    semester: "Ganjil",
    year: "2026/2027",
    finalized: false,
    students: [
      { id: "s9", name: "Intan Permata", nis: "112401", tugas: 91, uts: 87, uas: 90 },
      { id: "s10", name: "Joko Santoso", nis: "112402", tugas: 84, uts: 82, uas: 85 },
    ],
  },
];

const WEIGHTS = {
  tugas: 30,
  uts: 30,
  uas: 40,
};

function calculateFinalScore(student) {
  const values = [student.tugas, student.uts, student.uas];

  if (values.some((value) => value === null || value === undefined || value === "")) {
    return null;
  }

  return (
    Number(student.tugas) * WEIGHTS.tugas / 100 +
    Number(student.uts) * WEIGHTS.uts / 100 +
    Number(student.uas) * WEIGHTS.uas / 100
  );
}

function formatScore(value) {
  return value === null || value === undefined
    ? "—"
    : Number(value).toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
}

export default function FinalisasiNilaiPage() {
  const router = useRouter();

  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [selectedClassId, setSelectedClassId] = useState("xipa1");
  const [search, setSearch] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedClass = classes.find(
    (item) => item.id === selectedClassId
  );

  const students = selectedClass?.students || [];

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter((student) =>
      [student.name, student.nis].some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      )
    );
  }, [students, search]);

  const completedStudents = students.filter(
    (student) => calculateFinalScore(student) !== null
  );

  const incompleteStudents = students.filter(
    (student) => calculateFinalScore(student) === null
  );

  const average = completedStudents.length
    ? completedStudents.reduce(
        (total, student) => total + calculateFinalScore(student),
        0
      ) / completedStudents.length
    : null;

  const allComplete =
    students.length > 0 && incompleteStudents.length === 0;

  const finalizedCount = classes.filter((item) => item.finalized).length;

  const handleFinalize = () => {
    if (!selectedClass || !allComplete) {
      setNotice("Lengkapi semua nilai siswa sebelum melakukan finalisasi.");
      setShowConfirmation(false);
      return;
    }

    setClasses((current) =>
      current.map((item) =>
        item.id === selectedClassId
          ? { ...item, finalized: true }
          : item
      )
    );

    setShowConfirmation(false);
    setNotice(
      "Status finalisasi diperbarui pada tampilan ini. Hubungkan endpoint backend agar perubahan tersimpan permanen."
    );
  };

  return (
    <div className="theme-page flex min-h-screen w-full">
      <Sidebar role="guru" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={{ name: "Guru" }} />

        <main className="theme-page flex-1">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
            {/* Page heading */}
            <div className="mb-7 border-b border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] pb-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                      <FileCheck2 size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                        PENILAIAN / TAHAP AKHIR
                      </p>
                      <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        Finalisasi Nilai
                      </h1>
                    </div>
                  </div>

                  <p className="theme-text-secondary mt-3 max-w-2xl text-sm leading-6">
                    Periksa kelengkapan nilai sebelum menetapkan hasil
                    penilaian untuk kelas yang kamu ajar.
                  </p>
                </div>

                <div className="theme-text-secondary flex items-center gap-2 text-sm">
                  <ShieldCheck size={17} className="text-[var(--color-primary)]" />
                  Pemeriksaan sebelum finalisasi
                </div>
              </div>
            </div>

            {/* Overview */}
            <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Kelas ditugaskan
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {classes.length}
                    </p>
                  </div>
                  <Users size={19} className="text-[var(--color-primary)]" />
                </div>
                <p className="theme-text-secondary mt-3 text-xs">
                  Kelas pada data contoh halaman ini
                </p>
              </article>

              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Siswa lengkap
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {completedStudents.length}
                      <span className="theme-text-secondary ml-2 text-sm font-medium">
                        / {students.length}
                      </span>
                    </p>
                  </div>
                  <ClipboardCheck size={19} className="text-teal-600" />
                </div>
                <p className="theme-text-secondary mt-3 text-xs">
                  Berdasarkan kelengkapan komponen nilai
                </p>
              </article>

              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Rata-rata nilai akhir
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {average === null ? "—" : formatScore(average)}
                    </p>
                  </div>
                  <FileSpreadsheet
                    size={19}
                    className="text-[var(--color-primary)]"
                  />
                </div>
                <p className="theme-text-secondary mt-3 text-xs">
                  Hanya siswa dengan nilai lengkap
                </p>
              </article>
            </section>

            {/* Main content */}
            <section className="theme-card overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
              <div className="flex flex-col gap-4 border-b border-[color-mix(in_srgb,var(--color-text)_9%,transparent)] p-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="theme-text font-bold">
                    Pemeriksaan nilai
                  </h2>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Pilih kelas, lalu periksa status nilai setiap siswa.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="theme-text-secondary text-xs">
                    Sudah difinalisasi: {finalizedCount}/{classes.length} kelas
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 gap-4 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
                <div>
                  <label
                    htmlFor="class-select"
                    className="theme-text mb-2 block text-sm font-semibold"
                  >
                    Kelas dan mata pelajaran
                  </label>

                  <div className="relative">
                    <SlidersHorizontal
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                    />

                    <select
                      id="class-select"
                      value={selectedClassId}
                      onChange={(event) => {
                        setSelectedClassId(event.target.value);
                        setNotice("");
                      }}
                      className="theme-input w-full appearance-none rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] py-3 pl-10 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      {classes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} — {item.subject}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="search-student"
                    className="theme-text mb-2 block text-sm font-semibold"
                  >
                    Cari siswa
                  </label>

                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                    />

                    <input
                      id="search-student"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Nama atau NIS siswa..."
                      className="theme-input w-full rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] py-3 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Class summary */}
              {selectedClass && (
                <div className="flex flex-col gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      {selectedClass.name} · {selectedClass.subject}
                    </p>
                    <p className="theme-text-secondary mt-1 text-xs">
                      Tahun ajaran {selectedClass.year} · Semester{" "}
                      {selectedClass.semester}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                      selectedClass.finalized
                        ? "bg-teal-500/10 text-teal-700"
                        : allComplete
                          ? "bg-blue-500/10 text-blue-700"
                          : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {selectedClass.finalized ? (
                      <CheckCircle2 size={14} />
                    ) : allComplete ? (
                      <Check size={14} />
                    ) : (
                      <Info size={14} />
                    )}

                    {selectedClass.finalized
                      ? "Sudah difinalisasi"
                      : allComplete
                        ? "Siap difinalisasi"
                        : `${incompleteStudents.length} siswa belum lengkap`}
                  </span>
                </div>
              )}

              {/* Score table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                      <th className="theme-text-secondary px-5 py-3.5 font-semibold sm:px-6">
                        Siswa
                      </th>
                      <th className="theme-text-secondary px-4 py-3.5 font-semibold">
                        Tugas
                        <span className="mt-1 block text-xs font-normal">30%</span>
                      </th>
                      <th className="theme-text-secondary px-4 py-3.5 font-semibold">
                        UTS
                        <span className="mt-1 block text-xs font-normal">30%</span>
                      </th>
                      <th className="theme-text-secondary px-4 py-3.5 font-semibold">
                        UAS
                        <span className="mt-1 block text-xs font-normal">40%</span>
                      </th>
                      <th className="theme-text-secondary px-4 py-3.5 font-semibold">
                        Nilai akhir
                      </th>
                      <th className="theme-text-secondary px-4 py-3.5 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student) => {
                      const finalScore = calculateFinalScore(student);
                      const complete = finalScore !== null;

                      return (
                        <tr
                          key={student.id}
                          className="border-b border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] last:border-0"
                        >
                          <td className="px-5 py-4 sm:px-6">
                            <p className="theme-text font-semibold">
                              {student.name}
                            </p>
                            <p className="theme-text-secondary mt-1 text-xs">
                              NIS {student.nis}
                            </p>
                          </td>

                          <td className="theme-text px-4 py-4 tabular-nums">
                            {formatScore(student.tugas)}
                          </td>
                          <td className="theme-text px-4 py-4 tabular-nums">
                            {formatScore(student.uts)}
                          </td>
                          <td className="theme-text px-4 py-4 tabular-nums">
                            {formatScore(student.uas)}
                          </td>
                          <td className="theme-text px-4 py-4 font-bold tabular-nums">
                            {formatScore(finalScore)}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                complete
                                  ? "text-teal-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {complete ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <Info size={14} />
                              )}
                              {complete ? "Lengkap" : "Belum lengkap"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center">
                          <Search
                            size={24}
                            className="theme-text-secondary mx-auto"
                          />
                          <p className="theme-text mt-3 text-sm font-semibold">
                            Siswa tidak ditemukan
                          </p>
                          <p className="theme-text-secondary mt-1 text-xs">
                            Coba gunakan nama atau NIS yang berbeda.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Finalize footer */}
              <div className="flex flex-col gap-4 border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-2">
                  <LockKeyhole
                    size={16}
                    className="theme-text-secondary mt-0.5 shrink-0"
                  />
                  <p className="theme-text-secondary max-w-xl text-xs leading-5">
                    Periksa kembali seluruh nilai. Finalisasi idealnya
                    mengunci perubahan nilai sesuai kebijakan sekolah.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotice("");

                    if (!selectedClass) return;

                    if (selectedClass.finalized) {
                      setNotice("Kelas ini sudah difinalisasi pada tampilan ini.");
                      return;
                    }

                    if (!allComplete) {
                      setNotice(
                        "Finalisasi belum bisa dilakukan. Lengkapi seluruh nilai siswa terlebih dahulu."
                      );
                      return;
                    }

                    setShowConfirmation(true);
                  }}
                  disabled={!selectedClass || selectedClass.finalized}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selectedClass?.finalized ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  {selectedClass?.finalized
                    ? "Sudah difinalisasi"
                    : "Finalisasi nilai"}
                </button>
              </div>

              {notice && (
                <div
                  role="status"
                  className="border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-5 py-4 sm:px-6"
                >
                  <p className="theme-text-secondary text-sm leading-6">
                    {notice}
                  </p>
                </div>
              )}
            </section>

            <p className="theme-text-secondary mt-4 text-xs leading-5">
              Tampilan contoh menggunakan data lokal. Pastikan data nilai,
              bobot, dan status finalisasi dihubungkan ke backend sebelum
              digunakan untuk penilaian resmi.
            </p>
          </div>
        </main>
      </div>

      {/* Confirmation dialog */}
      {showConfirmation && selectedClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowConfirmation(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="theme-card w-full max-w-md rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                <ShieldCheck size={22} />
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                aria-label="Tutup dialog"
                className="theme-text-secondary rounded-lg p-2 hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="confirm-title"
              className="theme-text mt-5 text-xl font-bold"
            >
              Finalisasi nilai?
            </h2>

            <p className="theme-text-secondary mt-2 text-sm leading-6">
              Kamu akan memfinalisasi nilai{" "}
              <strong className="theme-text">
                {selectedClass.subject} — {selectedClass.name}
              </strong>
              . Pastikan seluruh nilai sudah diperiksa karena pada sistem
              sebenarnya tindakan ini dapat membatasi perubahan nilai.
            </p>

            <div className="mt-4 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="theme-text-secondary">Jumlah siswa</span>
                <span className="theme-text font-semibold">
                  {students.length}
                </span>
              </div>
              <div className="mt-3 flex justify-between gap-3 text-sm">
                <span className="theme-text-secondary">Nilai lengkap</span>
                <span className="font-semibold text-teal-600">
                  {completedStudents.length}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] px-4 py-2.5 text-sm font-semibold"
              >
                Periksa lagi
              </button>

              <button
                type="button"
                onClick={handleFinalize}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                <Check size={16} />
                Ya, finalisasi
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}