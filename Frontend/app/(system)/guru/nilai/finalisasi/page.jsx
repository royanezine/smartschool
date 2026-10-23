"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  Info,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  finalisasiNilai,
  getGridNilai,
  getKomponenNilai,
  getNilaiKelasSaya,
} from "@/services/nilai.service";

function formatScore(value) {
  return value === null || value === undefined
    ? "—"
    : Number(value).toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
}

function hitungNilaiAkhir(siswa, komponen) {
  if (!siswa || komponen.length === 0) {
    return null;
  }

  let total = 0;

  for (const item of komponen) {
    const nilai = siswa.nilai?.[item.id];

    if (nilai === null || nilai === undefined || nilai === "") {
      return null;
    }

    total += (Number(nilai) * Number(item.bobot)) / 100;
  }

  return Math.round(total * 100) / 100;
}

export default function FinalisasiNilaiPage() {
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [komponenData, setKomponenData] = useState({
    komponen: [],
    totalBobot: 0,
    sisaBobot: 100,
    status: "draft",
  });
  const [grid, setGrid] = useState({
    siswa: [],
    status: "draft",
  });

  const [search, setSearch] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const loadClasses = useCallback(async () => {
    setLoadingClasses(true);
    setError("");

    try {
      const data = await getNilaiKelasSaya();

      setClasses(data);

      setSelectedClassId((current) => {
        if (current && data.some((item) => item.kelasMapelId === current)) {
          return current;
        }

        return data[0]?.kelasMapelId || "";
      });
    } catch (err) {
      console.error("Gagal mengambil kelas nilai:", err);
      setClasses([]);
      setSelectedClassId("");
      setError(
        err?.message ||
          "Gagal mengambil daftar kelas yang diampu. Pastikan backend berjalan dan akun memiliki akses guru."
      );
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClasses();
  }, [loadClasses]);

  const loadDetail = useCallback(async (kelasMapelId) => {
    if (!kelasMapelId) {
      setKomponenData({
        komponen: [],
        totalBobot: 0,
        sisaBobot: 100,
        status: "draft",
      });
      setGrid({ siswa: [], status: "draft" });
      return;
    }

    setLoadingDetail(true);
    setError("");

    try {
      const [komponenResult, gridResult] = await Promise.all([
        getKomponenNilai(kelasMapelId),
        getGridNilai(kelasMapelId),
      ]);

      setKomponenData(komponenResult);
      setGrid(gridResult);
    } catch (err) {
      console.error("Gagal mengambil detail nilai:", err);
      setKomponenData({
        komponen: [],
        totalBobot: 0,
        sisaBobot: 100,
        status: "draft",
      });
      setGrid({ siswa: [], status: "draft" });
      setError(
        err?.message ||
          "Gagal mengambil komponen dan nilai kelas. Pastikan kelas ini masih diampu oleh akun Anda."
      );
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDetail(selectedClassId);
  }, [selectedClassId, loadDetail]);

  const selectedClass = classes.find(
    (item) => item.kelasMapelId === selectedClassId
  );

  const komponen = komponenData.komponen;
  const students = grid.siswa;

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter((student) =>
      [student.namaLengkap, student.nis, student.nisn].some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      )
    );
  }, [students, search]);

  const completedStudents = useMemo(
    () =>
      students.filter(
        (student) => hitungNilaiAkhir(student, komponen) !== null
      ),
    [students, komponen]
  );

  const incompleteStudents = useMemo(
    () =>
      students.filter(
        (student) => hitungNilaiAkhir(student, komponen) === null
      ),
    [students, komponen]
  );

  const average = completedStudents.length
    ? completedStudents.reduce(
        (total, student) =>
          total + hitungNilaiAkhir(student, komponen),
        0
      ) / completedStudents.length
    : null;

  const allComplete =
    students.length > 0 &&
    komponen.length > 0 &&
    incompleteStudents.length === 0;

  const bobotValid = komponenData.totalBobot === 100;

  const isFinalized =
    grid.status === "final" ||
    komponenData.status === "final" ||
    selectedClass?.status === "final";

  const readyToFinalize = allComplete && bobotValid && !isFinalized;

  const finalizedCount = classes.filter((item) => item.status === "final")
    .length;

  const handleFinalize = async () => {
    if (!selectedClass || !readyToFinalize) {
      setNotice(
        "Finalisasi belum bisa dilakukan. Periksa kelengkapan nilai dan total bobot."
      );
      setShowConfirmation(false);
      return;
    }

    setFinalizing(true);
    setNotice("");

    try {
      const result = await finalisasiNilai(selectedClass.kelasMapelId);

      setClasses((current) =>
        current.map((item) =>
          item.kelasMapelId === selectedClass.kelasMapelId
            ? { ...item, status: "final" }
            : item
        )
      );
      setKomponenData((current) => ({ ...current, status: "final" }));
      setGrid((current) => ({ ...current, status: "final" }));
      setShowConfirmation(false);
      setNotice(
        `Nilai ${result.mataPelajaran} berhasil difinalisasi untuk ${result.jumlahSiswa} siswa (KKM ${result.kkm}).`
      );
    } catch (err) {
      console.error("Finalisasi nilai gagal:", err);
      setShowConfirmation(false);
      setNotice(
        err?.message ||
          "Finalisasi nilai gagal. Pastikan seluruh nilai komponen sudah lengkap dan total bobot 100%."
      );
    } finally {
      setFinalizing(false);
    }
  };

  const showLoading = loadingClasses || loadingDetail;

  return (
    <div className="theme-page flex min-h-screen w-full">
      <Sidebar role="guru" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={{ name: "Guru" }} />

        <main className="theme-page flex-1">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
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

            {error && (
              <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <p className="text-sm leading-6 text-[var(--color-danger)]">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadClasses}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
                >
                  <RefreshCw size={14} />
                  Muat ulang
                </button>
              </div>
            )}

            <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Kelas ditugaskan
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {loadingClasses ? "—" : classes.length}
                    </p>
                  </div>
                  <Users size={19} className="text-[var(--color-primary)]" />
                </div>
                <p className="theme-text-secondary mt-3 text-xs">
                  Kelas-mapel yang diampu akun ini
                </p>
              </article>

              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Siswa lengkap
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {showLoading ? "—" : completedStudents.length}
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
                        setShowConfirmation(false);
                      }}
                      disabled={loadingClasses || classes.length === 0}
                      className="theme-input w-full appearance-none rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] py-3 pl-10 pr-10 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {classes.length === 0 && (
                        <option value="">
                          {loadingClasses
                            ? "Memuat kelas..."
                            : "Belum ada kelas yang diampu"}
                        </option>
                      )}

                      {classes.map((item) => (
                        <option
                          key={item.kelasMapelId}
                          value={item.kelasMapelId}
                        >
                          {item.kelas?.nama || "-"} —{" "}
                          {item.mataPelajaran?.nama || "-"}
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
                      placeholder="Nama, NIS, atau NISN siswa..."
                      disabled={students.length === 0}
                      className="theme-input w-full rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] py-3 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {selectedClass && (
                <div className="flex flex-col gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      {selectedClass.kelas?.nama || "-"} ·{" "}
                      {selectedClass.mataPelajaran?.nama || "-"}
                    </p>
                    <p className="theme-text-secondary mt-1 text-xs">
                      {komponen.length} komponen · total bobot{" "}
                      {komponenData.totalBobot}% ·{" "}
                      {komponenData.sisaBobot >= 0
                        ? `sisa ${komponenData.sisaBobot}%`
                        : `kelebihan ${Math.abs(komponenData.sisaBobot)}%`}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                      isFinalized
                        ? "bg-teal-500/10 text-teal-700"
                        : readyToFinalize
                          ? "bg-blue-500/10 text-blue-700"
                          : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {isFinalized ? (
                      <CheckCircle2 size={14} />
                    ) : readyToFinalize ? (
                      <Check size={14} />
                    ) : (
                      <Info size={14} />
                    )}

                    {isFinalized
                      ? "Sudah difinalisasi"
                      : !bobotValid
                        ? "Total bobot belum 100%"
                        : readyToFinalize
                          ? "Siap difinalisasi"
                          : `${incompleteStudents.length} siswa belum lengkap`}
                  </span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                      <th className="theme-text-secondary px-5 py-3.5 font-semibold sm:px-6">
                        Siswa
                      </th>

                      {komponen.map((item) => (
                        <th
                          key={item.id}
                          className="theme-text-secondary px-4 py-3.5 font-semibold"
                        >
                          {item.nama}
                          <span className="mt-1 block text-xs font-normal">
                            {Number(item.bobot)}%
                          </span>
                        </th>
                      ))}

                      <th className="theme-text-secondary px-4 py-3.5 font-semibold">
                        Nilai akhir
                      </th>
                      <th className="theme-text-secondary px-4 py-3.5 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {showLoading && (
                      <tr>
                        <td
                          colSpan={Math.max(komponen.length, 1) + 3}
                          className="px-5 py-12 text-center"
                        >
                          <Loader2
                            size={24}
                            className="theme-text-secondary mx-auto animate-spin"
                          />
                          <p className="theme-text-secondary mt-3 text-sm">
                            Memuat data nilai...
                          </p>
                        </td>
                      </tr>
                    )}

                    {!showLoading &&
                      filteredStudents.map((student) => {
                        const finalScore = hitungNilaiAkhir(
                          student,
                          komponen
                        );
                        const complete = finalScore !== null;

                        return (
                          <tr
                            key={student.penggunaId}
                            className="border-b border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] last:border-0"
                          >
                            <td className="px-5 py-4 sm:px-6">
                              <p className="theme-text font-semibold">
                                {student.namaLengkap}
                              </p>
                              <p className="theme-text-secondary mt-1 text-xs">
                                NIS {student.nis || "—"}
                                {student.nisn
                                  ? ` · NISN ${student.nisn}`
                                  : ""}
                              </p>
                            </td>

                            {komponen.map((item) => (
                              <td
                                key={item.id}
                                className="theme-text px-4 py-4 tabular-nums"
                              >
                                {formatScore(student.nilai?.[item.id])}
                              </td>
                            ))}

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

                    {!showLoading &&
                      !error &&
                      (students.length === 0 || komponen.length === 0) && (
                        <tr>
                          <td colSpan={Math.max(komponen.length, 1) + 3} className="px-5 py-12 text-center">
                            <Info
                              size={24}
                              className="theme-text-secondary mx-auto"
                            />
                            <p className="theme-text mt-3 text-sm font-semibold">
                              {komponen.length === 0
                                ? "Belum ada komponen nilai"
                                : "Belum ada siswa di kelas ini"}
                            </p>
                            <p className="theme-text-secondary mt-1 text-xs">
                              {komponen.length === 0
                                ? "Tambahkan komponen penilaian terlebih dahulu melalui halaman Setup Bobot."
                                : "Pastikan siswa sudah terdaftar sebagai anggota kelas."}
                            </p>

                            {komponen.length === 0 && selectedClassId && (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push("/guru/nilai/setup-bobot")
                                }
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"
                              >
                                <SlidersHorizontal size={14} />
                                Buka Setup Bobot
                              </button>
                            )}
                          </td>
                        </tr>
                      )}

                    {!showLoading &&
                      students.length > 0 &&
                      komponen.length > 0 &&
                      filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={komponen.length + 3} className="px-5 py-12 text-center">
                            <Search
                              size={24}
                              className="theme-text-secondary mx-auto"
                            />
                            <p className="theme-text mt-3 text-sm font-semibold">
                              Siswa tidak ditemukan
                            </p>
                            <p className="theme-text-secondary mt-1 text-xs">
                              Coba gunakan nama, NIS, atau NISN yang berbeda.
                            </p>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-2">
                  <LockKeyhole
                    size={16}
                    className="theme-text-secondary mt-0.5 shrink-0"
                  />
                  <p className="theme-text-secondary max-w-xl text-xs leading-5">
                    Finalisasi akan mengunci perubahan nilai pada kelas-mapel
                    ini. Pastikan seluruh komponen sudah diisi dan total bobot
                    tepat 100%.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotice("");

                    if (!selectedClass) return;

                    if (isFinalized) {
                      setNotice("Nilai kelas ini sudah difinalisasi.");
                      return;
                    }

                    if (!bobotValid) {
                      setNotice(
                        `Total bobot komponen harus tepat 100%. Total saat ini ${komponenData.totalBobot}%.`
                      );
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
                  disabled={!selectedClass || isFinalized || finalizing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFinalized ? (
                    <CheckCircle2 size={16} />
                  ) : finalizing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  {isFinalized
                    ? "Sudah difinalisasi"
                    : finalizing
                      ? "Memproses..."
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
              Data kelas, komponen, dan nilai dimuat langsung dari backend
              melalui endpoint <code>/api/nilai/*</code>. Nilai akhir dihitung
              dari bobot komponen yang tersimpan.
            </p>
          </div>
        </main>
      </div>

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
                disabled={finalizing}
                className="theme-text-secondary rounded-lg p-2 hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] disabled:opacity-50"
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
                {selectedClass.mataPelajaran?.nama || "-"} —{" "}
                {selectedClass.kelas?.nama || "-"}
              </strong>
              . Setelah difinalisasi, perubahan nilai pada kelas-mapel ini
              tidak dapat dilakukan.
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
              <div className="mt-3 flex justify-between gap-3 text-sm">
                <span className="theme-text-secondary">Total bobot</span>
                <span className="theme-text font-semibold">
                  {komponenData.totalBobot}%
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={finalizing}
                className="rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Periksa lagi
              </button>

              <button
                type="button"
                onClick={handleFinalize}
                disabled={finalizing}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {finalizing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {finalizing ? "Memproses..." : "Ya, finalisasi"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
