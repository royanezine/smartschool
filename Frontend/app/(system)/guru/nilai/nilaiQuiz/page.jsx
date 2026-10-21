"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Download,
  HelpCircle,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import {
  getKomponenNilai,
  getNilaiKelasSaya,
  tarikSumberNilai,
} from "@/services/nilai.service";
import { getUjianByKelasMapel } from "@/services/ujian.service";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

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

function isQuiz(ujian) {
  const jenis = String(ujian?.tipe || ujian?.jenis || "").toLowerCase();
  return jenis === "kuis";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GuruNilaiQuizPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [komponenData, setKomponenData] = useState({
    komponen: [],
    totalBobot: 0,
    sisaBobot: 100,
    status: "draft",
  });

  const [selectedKomponenId, setSelectedKomponenId] = useState("");

  const [quizzes, setQuizzes] = useState([]);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);

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

  const loadData = useCallback(async (kelasMapelId) => {
    if (!kelasMapelId) {
      setKomponenData({
        komponen: [],
        totalBobot: 0,
        sisaBobot: 100,
        status: "draft",
      });
      setQuizzes([]);
      setSelectedKomponenId("");
      return;
    }

    setLoadingData(true);
    setError("");

    try {
      const [komponenResult, ujianResult] = await Promise.all([
        getKomponenNilai(kelasMapelId),
        getUjianByKelasMapel(kelasMapelId),
      ]);

      setKomponenData(komponenResult);

      const daftarUjian = Array.isArray(ujianResult) ? ujianResult : [];
      const daftarQuiz = daftarUjian.filter(isQuiz);

      setQuizzes(daftarQuiz);

      setSelectedKomponenId((current) => {
        if (
          current &&
          komponenResult.komponen.some((item) => item.id === current)
        ) {
          return current;
        }

        return komponenResult.komponen[0]?.id || "";
      });
    } catch (err) {
      console.error("Gagal mengambil data nilai quiz:", err);
      setKomponenData({
        komponen: [],
        totalBobot: 0,
        sisaBobot: 100,
        status: "draft",
      });
      setQuizzes([]);
      setError(
        err?.message ||
          "Gagal mengambil komponen nilai atau daftar kuis. Pastikan kelas ini masih diampu oleh akun Anda."
      );
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(selectedClassId);
  }, [selectedClassId, loadData]);

  const selectedClass = classes.find(
    (item) => item.kelasMapelId === selectedClassId
  );

  const komponen = komponenData.komponen;

  const isFinalized =
    komponenData.status === "final" || selectedClass?.status === "final";

  const selectedKomponen = komponen.find(
    (item) => item.id === selectedKomponenId
  );

  const statistik = useMemo(() => {
    const totalPercobaan = quizzes.reduce(
      (total, item) => total + Number(item._count?.percobaanAsesmen || 0),
      0
    );

    const dipublikasikan = quizzes.filter(
      (item) => item.dipublikasikan
    ).length;

    return {
      totalQuiz: quizzes.length,
      dipublikasikan,
      totalPercobaan,
    };
  }, [quizzes]);

  const handleTarik = async (quiz) => {
    if (!selectedClassId) {
      setFeedback({
        type: "error",
        message: "Pilih kelas dan mata pelajaran terlebih dahulu.",
      });
      return;
    }

    if (!selectedKomponenId) {
      setFeedback({
        type: "error",
        message:
          "Pilih komponen nilai tujuan sebelum menarik nilai quiz.",
      });
      return;
    }

    if (isFinalized) {
      setFeedback({
        type: "error",
        message:
          "Nilai kelas ini sudah difinalisasi sehingga tidak dapat diubah.",
      });
      return;
    }

    setSyncingId(quiz.id);
    setFeedback(null);

    try {
      const result = await tarikSumberNilai({
        kelasMapelId: selectedClassId,
        komponenNilaiId: selectedKomponenId,
        jenisSumber: "asesmen",
        sumberId: quiz.id,
      });

      if (result.jumlahDisimpan === 0) {
        setFeedback({
          type: "error",
          message:
            result.jumlahDilewati > 0
              ? `Tidak ada nilai valid yang dapat disinkronkan dari "${quiz.judul}". Pastikan siswa sudah mengerjakan kuis ini.`
              : `Tidak ada nilai yang dapat disinkronkan dari "${quiz.judul}".`,
        });
      } else {
        setFeedback({
          type: "success",
          message: `Berhasil menyinkronkan ${result.jumlahDisimpan} nilai dari "${quiz.judul}" ke komponen "${selectedKomponen?.nama}". ${
            result.jumlahDilewati > 0
              ? `${result.jumlahDilewati} siswa tidak memiliki nilai valid.`
              : ""
          }`,
        });
      }
    } catch (err) {
      console.error("Gagal menarik nilai quiz:", err);
      setFeedback({
        type: "error",
        message:
          err?.message ||
          "Gagal menarik nilai quiz. Periksa kembali kelas, komponen, dan kuis yang dipilih.",
      });
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      {/* =====================================================
          SIDEBAR GURU
      ===================================================== */}

      <Sidebar
        active="nilaiQuiz"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ===================================================
            HEADER GURU
        =================================================== */}

        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Guru",
            email: "guru@smartschool.com",
            avatar: "GR",
          }}
        />

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="theme-page flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <HelpCircle size={18} />
                  </div>

                  <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                    Nilai Quiz
                  </h1>
                </div>

                <p className="theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5 text-sm">
                  <Sparkles
                    size={14}
                    className="theme-text-muted flex-shrink-0"
                  />

                  <span className="truncate">
                    Sinkronkan hasil kuis ke komponen nilai kelas-mapel.
                  </span>
                </p>
              </div>
            </div>

            {/* =================================================
                API ERROR
            ================================================= */}

            {error && (
              <div
                className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${themeDangerBorder} ${themeDangerSurface}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 theme-danger"
                  />
                  <p className="text-sm leading-6 theme-danger">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={loadClasses}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold theme-danger ${themeDangerBorder} transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]`}
                >
                  <RefreshCw size={14} />
                  Muat ulang
                </button>
              </div>
            )}

            {/* =================================================
                FEEDBACK
            ================================================= */}

            {feedback && (
              <div
                role="status"
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  feedback.type === "success"
                    ? `${themeSuccessBorder} ${themeSuccessSurface}`
                    : `${themeDangerBorder} ${themeDangerSurface}`
                }`}
              >
                {feedback.type === "success" ? (
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  />
                ) : (
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 theme-danger"
                  />
                )}

                <p
                  className={`text-sm leading-6 ${
                    feedback.type === "success"
                      ? "text-[var(--color-success)]"
                      : "theme-danger"
                  }`}
                >
                  {feedback.message}
                </p>
              </div>
            )}

            {/* =================================================
                SELECTOR
            ================================================= */}

            <div
              className={`theme-card rounded-xl border p-4 ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                {/* KELAS */}

                <div className="w-full sm:w-56">
                  <label
                    htmlFor="kelas-mapel"
                    className="theme-text-muted mb-1.5 block text-[11px] font-medium uppercase tracking-wider"
                  >
                    Kelas & mapel
                  </label>

                  <div className="relative">
                    <select
                      id="kelas-mapel"
                      value={selectedClassId}
                      onChange={(event) => {
                        setSelectedClassId(event.target.value);
                        setFeedback(null);
                      }}
                      disabled={loadingClasses || classes.length === 0}
                      className={`theme-input ${themeFocus} theme-text w-full cursor-pointer appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
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
                      size={14}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* KOMPONEN */}

                <div className="w-full sm:w-56">
                  <label
                    htmlFor="komponen"
                    className="theme-text-muted mb-1.5 block text-[11px] font-medium uppercase tracking-wider"
                  >
                    Komponen tujuan
                  </label>

                  <div className="relative">
                    <select
                      id="komponen"
                      value={selectedKomponenId}
                      onChange={(event) => {
                        setSelectedKomponenId(event.target.value);
                        setFeedback(null);
                      }}
                      disabled={komponen.length === 0}
                      className={`theme-input ${themeFocus} theme-text w-full cursor-pointer appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {komponen.length === 0 && (
                        <option value="">
                          Belum ada komponen nilai
                        </option>
                      )}

                      {komponen.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nama} ({Number(item.bobot)}%)
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={14}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* STATUS */}

                <span
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-2 text-[11px] font-medium ${
                    isFinalized
                      ? `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`
                      : `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`
                  }`}
                >
                  {isFinalized
                    ? "Nilai sudah difinalisasi"
                    : "Nilai masih dapat diubah"}
                </span>
              </div>
            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
                >
                  <HelpCircle size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Total Kuis
                  </p>
                  <p className="theme-text text-lg font-bold">
                    {loadingData ? "—" : statistik.totalQuiz}
                  </p>
                </div>
              </div>

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`}
                >
                  <Users size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Dipublikasikan
                  </p>
                  <p className="theme-text text-lg font-bold">
                    {loadingData ? "—" : statistik.dipublikasikan}
                  </p>
                </div>
              </div>

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`}
                >
                  <BarChart3 size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Percobaan
                  </p>
                  <p className="theme-text text-lg font-bold">
                    {loadingData ? "—" : statistik.totalPercobaan}
                  </p>
                </div>
              </div>

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`}
                >
                  <Download size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Bobot komponen
                  </p>
                  <p className="theme-text text-lg font-bold">
                    {selectedKomponen
                      ? `${Number(selectedKomponen.bobot)}%`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              {/* DAFTAR KUIS */}

              <div
                className={`theme-card overflow-hidden rounded-xl border lg:col-span-2 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${themeDivider}`}
                >
                  <div className="min-w-0">
                    <h2 className="theme-text truncate text-sm font-semibold">
                      Daftar Kuis
                    </h2>

                    <p className="theme-text-muted mt-0.5 text-xs">
                      {selectedClass
                        ? `${selectedClass.mataPelajaran?.nama || "-"} · ${
                            selectedClass.kelas?.nama || "-"
                          }`
                        : "Pilih kelas terlebih dahulu"}
                    </p>
                  </div>
                </div>

                {loadingData && (
                  <div className="flex flex-col items-center justify-center p-12">
                    <Loader2
                      size={24}
                      className="theme-text-muted animate-spin"
                    />
                    <p className="theme-text-muted mt-3 text-sm">
                      Memuat daftar kuis...
                    </p>
                  </div>
                )}

                {!loadingData && quizzes.length === 0 && (
                  <div className="p-10 text-center">
                    <Info size={24} className="theme-text-muted mx-auto" />
                    <p className="theme-text mt-3 text-sm font-semibold">
                      Belum ada kuis
                    </p>
                    <p className="theme-text-muted mt-1 text-xs leading-5">
                      Kuis adalah ujian dengan jenis &quot;Kuis&quot;. Buat
                      kuis melalui halaman Ujian terlebih dahulu.
                    </p>
                  </div>
                )}

                {!loadingData && quizzes.length > 0 && (
                  <div>
                    {quizzes.map((quiz) => {
                      const jumlahSoal = Number(
                        quiz._count?.soalAsesmen || 0
                      );
                      const jumlahPercobaan = Number(
                        quiz._count?.percobaanAsesmen || 0
                      );

                      const isSyncing = syncingId === quiz.id;

                      return (
                        <div
                          key={quiz.id}
                          className={`flex flex-col gap-3 border-b p-4 transition-colors last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 ${themeDivider} ${themeNeutralHover}`}
                        >
                          <div className="min-w-0">
                            <p className="theme-text truncate text-sm font-medium">
                              {quiz.judul || "Kuis tanpa judul"}
                            </p>

                            <p className="theme-text-muted mt-1 text-[11px]">
                              {formatDate(quiz.waktuMulai)} · {jumlahSoal} soal
                              · {jumlahPercobaan} percobaan
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                  quiz.dipublikasikan
                                    ? `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`
                                    : `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`
                                }`}
                              >
                                {quiz.dipublikasikan
                                  ? "Dipublikasikan"
                                  : "Draf"}
                              </span>

                              {quiz.tipe && (
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`}
                                >
                                  {quiz.tipe}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTarik(quiz)}
                            disabled={
                              isSyncing ||
                              isFinalized ||
                              !selectedKomponenId
                            }
                            className={`flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText} hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {isSyncing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Download size={13} />
                            )}
                            {isSyncing ? "Menyinkronkan..." : "Tarik nilai"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PANEL KANAN */}

              <div className="space-y-6 lg:col-span-1">
                <div
                  className={`theme-card rounded-xl border p-4 sm:p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Info size={16} className="theme-text-muted" />

                    <h2 className="theme-text text-sm font-semibold">
                      Cara kerja nilai quiz
                    </h2>
                  </div>

                  <ul className="theme-text-secondary space-y-3 text-xs leading-5">
                    <li className="flex gap-2">
                      <span className="theme-primary-text mt-0.5 font-bold">
                        1.
                      </span>
                      Pilih kelas-mapel dan komponen nilai tujuan.
                    </li>
                    <li className="flex gap-2">
                      <span className="theme-primary-text mt-0.5 font-bold">
                        2.
                      </span>
                      Klik &quot;Tarik nilai&quot; pada kuis untuk menyinkronkan
                      nilai hasil asesmen ke komponen.
                    </li>
                    <li className="flex gap-2">
                      <span className="theme-primary-text mt-0.5 font-bold">
                        3.
                      </span>
                      Backend memilih nilai terbaik setiap siswa dan
                      menyimpannya sebagai sumber &quot;otomatis&quot;.
                    </li>
                  </ul>

                  <div
                    className={`mt-4 rounded-lg border p-3 ${themeWarningBorder} ${themeWarningSurface}`}
                  >
                    <p className="text-[11px] leading-5 text-[var(--color-warning)]">
                      Rincian nilai per siswa untuk kuis tidak tersedia melalui
                      endpoint backend saat ini (detail ujian hanya
                      mengembalikan soal). Buka komponen pada halaman Nilai
                      Tugas/Finalisasi untuk melihat nilai yang sudah
                      tersinkron.
                    </p>
                  </div>
                </div>

                {selectedKomponen && (
                  <div
                    className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div
                      className={`flex items-center gap-2 border-b p-4 sm:p-5 ${themeDivider}`}
                    >
                      <Download size={16} className="theme-text-muted" />

                      <h2 className="theme-text text-sm font-semibold">
                        Komponen tujuan
                      </h2>
                    </div>

                    <div className="p-4 sm:p-5">
                      <p className="theme-text text-sm font-semibold">
                        {selectedKomponen.nama}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`}
                        >
                          {selectedKomponen.jenis || "lainnya"}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
                        >
                          Bobot {Number(selectedKomponen.bobot)}%
                        </span>
                      </div>

                      <p className="theme-text-muted mt-3 text-[11px] leading-5">
                        Total bobot kelas ini: {komponenData.totalBobot}%
                        {komponenData.totalBobot !== 100
                          ? ` · sisa ${komponenData.sisaBobot}%`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
