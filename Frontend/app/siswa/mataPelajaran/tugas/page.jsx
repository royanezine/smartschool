"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Send,
  User,
  AlertCircle,
  RefreshCw,
  Award,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

/* =========================================================
   API
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TASK_BASE_URL = `${API_URL}/api/v1/tugas`;

/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(endpoint, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers = {
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType =
    response.headers.get("content-type") || "";

  let result;

  if (contentType.includes("application/json")) {
    result = await response.json();
  } else {
    const text = await response.text();

    result = {
      success: response.ok,
      message: text || "Terjadi kesalahan",
    };
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Request gagal (${response.status})`
    );
  }

  return result;
}

/* =========================================================
   GET DATA RESPONSE
========================================================= */

function getData(response) {
  if (!response) return null;

  if (response.data !== undefined) {
    return response.data;
  }

  return response;
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   DEADLINE
========================================================= */

function isDeadlinePassed(dateString) {
  if (!dateString) return false;

  const deadline = new Date(dateString);

  if (Number.isNaN(deadline.getTime())) {
    return false;
  }

  return new Date() > deadline;
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(submission, batasWaktu) {
  if (submission?.status) {
    return submission.status;
  }

  if (isDeadlinePassed(batasWaktu)) {
    return "terlambat";
  }

  return "belum";
}

/* =========================================================
   STATUS LABEL
========================================================= */

function statusLabel(status) {
  switch (status) {
    case "dikumpulkan":
      return "Sudah Dikumpulkan";

    case "dinilai":
      return "Sudah Dinilai";

    case "terlambat":
      return "Terlambat";

    default:
      return "Belum Dikumpulkan";
  }
}

/* =========================================================
   STATUS CLASS
========================================================= */

function statusClass(status) {
  switch (status) {
    case "dikumpulkan":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "dinilai":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "terlambat":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function TugasSiswaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const kelasMapelId = searchParams.get("kelasMapelId");

  /* =======================================================
     STATE
  ======================================================= */

  const [tugasList, setTugasList] = useState([]);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [submissionMap, setSubmissionMap] = useState({});

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [urlFile, setUrlFile] = useState("");
  const [keterangan, setKeterangan] = useState("");

  /*
   * Sidebar state.
   *
   * Default true (expanded).
   * Di mobile, Sidebar sendiri yang menangani mode collapsed.
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* =======================================================
     GET DETAIL TUGAS
  ======================================================= */

  const loadDetailTugas = useCallback(
    async (tugasId, options = {}) => {
      if (!tugasId) return null;

      const {
        showLoading = true,
        clearMessages = true,
      } = options;

      try {
        if (showLoading) {
          setLoadingDetail(true);
        }

        setError("");

        if (clearMessages) {
          setSuccessMessage("");
        }

        const response = await apiRequest(
          `${TASK_BASE_URL}/${tugasId}`
        );

        const data = getData(response);

        if (!data) {
          throw new Error(
            "Data detail tugas tidak ditemukan."
          );
        }

        const submission =
          data?.pengumpulanTugasSiswa?.[0] || null;

        setSubmissionMap((prev) => ({
          ...prev,
          [tugasId]: submission,
        }));

        setSelectedTugas(data);
        setUrlFile(submission?.urlFile || "");
        setKeterangan(submission?.keterangan || "");

        return data;
      } catch (err) {
        console.error(
          "Gagal mengambil detail tugas:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil detail tugas."
        );

        return null;
      } finally {
        if (showLoading) {
          setLoadingDetail(false);
        }
      }
    },
    []
  );

  /* =======================================================
     GET DAFTAR TUGAS
  ======================================================= */

  const loadTugas = useCallback(async () => {
    if (!kelasMapelId) {
      setError("kelasMapelId tidak ditemukan.");
      setLoadingList(false);
      return;
    }

    try {
      setLoadingList(true);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(
        `${TASK_BASE_URL}/kelas-mapel/${kelasMapelId}`
      );

      const data = getData(response);

      const tasks = Array.isArray(data) ? data : [];

      setTugasList(tasks);

      if (tasks.length > 0) {
        const detailResults = await Promise.all(
          tasks.map(async (task) => {
            try {
              const detailResponse = await apiRequest(
                `${TASK_BASE_URL}/${task.id}`
              );

              const detailData = getData(detailResponse);

              const submission =
                detailData?.pengumpulanTugasSiswa?.[0] ||
                null;

              return {
                tugasId: task.id,
                submission,
              };
            } catch (err) {
              console.error(
                `Gagal mengambil status tugas ${task.id}:`,
                err
              );

              return {
                tugasId: task.id,
                submission: null,
              };
            }
          })
        );

        const newSubmissionMap = {};

        detailResults.forEach((item) => {
          newSubmissionMap[item.tugasId] = item.submission;
        });

        setSubmissionMap(newSubmissionMap);
      } else {
        setSubmissionMap({});
        setSelectedTugas(null);
      }
    } catch (err) {
      console.error(
        "Gagal mengambil daftar tugas:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil daftar tugas dari backend."
      );
    } finally {
      setLoadingList(false);
    }
  }, [kelasMapelId]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadTugas();
  }, [loadTugas]);

  /* =======================================================
     PILIH TUGAS PERTAMA
  ======================================================= */

  useEffect(() => {
    if (tugasList.length > 0 && !selectedTugas) {
      loadDetailTugas(tugasList[0].id, {
        showLoading: true,
        clearMessages: false,
      });
    }
  }, [tugasList, selectedTugas, loadDetailTugas]);

  /* =======================================================
     CURRENT SUBMISSION
  ======================================================= */

  const currentSubmission = useMemo(() => {
    if (!selectedTugas) {
      return null;
    }

    return (
      selectedTugas?.pengumpulanTugasSiswa?.[0] || null
    );
  }, [selectedTugas]);

  /* =======================================================
     CURRENT STATUS
  ======================================================= */

  const currentStatus = useMemo(() => {
    return normalizeStatus(
      currentSubmission,
      selectedTugas?.batasWaktu
    );
  }, [currentSubmission, selectedTugas]);

  /* =======================================================
     SUDAH DINILAI
  ======================================================= */

  const isGraded = useMemo(() => {
    return currentSubmission?.status === "dinilai";
  }, [currentSubmission]);

  /* =======================================================
     DEADLINE PASSED
  ======================================================= */

  const deadlinePassed = useMemo(() => {
    return isDeadlinePassed(selectedTugas?.batasWaktu);
  }, [selectedTugas]);

  /* =======================================================
     SELECT TASK
  ======================================================= */

  const handleSelectTugas = async (tugasId) => {
    if (!tugasId) return;

    if (tugasId === selectedTugas?.id) {
      return;
    }

    await loadDetailTugas(tugasId);
  };

  /* =======================================================
     SUBMIT TUGAS
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTugas?.id) {
      setError("Tugas belum dipilih.");
      return;
    }

    if (currentSubmission?.status === "dinilai") {
      setError(
        "Tugas sudah dinilai oleh guru sehingga tidak dapat dikirim ulang."
      );
      return;
    }

    const cleanUrl = urlFile.trim();
    const cleanKeterangan = keterangan.trim();

    if (!cleanUrl) {
      setError("URL file wajib diisi.");
      return;
    }

    try {
      const parsedUrl = new URL(cleanUrl);

      if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
      ) {
        throw new Error();
      }
    } catch {
      setError(
        "URL file tidak valid. Gunakan URL yang diawali http:// atau https://"
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(
        `${TASK_BASE_URL}/${selectedTugas.id}/submit`,
        {
          method: "POST",
          body: JSON.stringify({
            urlFile: cleanUrl,
            keterangan: cleanKeterangan || null,
          }),
        }
      );

      const submission = getData(response);

      setSuccessMessage(
        response?.message ||
          "Tugas berhasil dikumpulkan."
      );

      if (submission) {
        setSubmissionMap((prev) => ({
          ...prev,
          [selectedTugas.id]: submission,
        }));

        setSelectedTugas((prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            pengumpulanTugasSiswa: [submission],
          };
        });
      }

      const refreshedResponse = await apiRequest(
        `${TASK_BASE_URL}/${selectedTugas.id}`
      );

      const refreshedData = getData(refreshedResponse);

      const refreshedSubmission =
        refreshedData?.pengumpulanTugasSiswa?.[0] || null;

      setSelectedTugas(refreshedData);

      setSubmissionMap((prev) => ({
        ...prev,
        [selectedTugas.id]: refreshedSubmission,
      }));

      setUrlFile(refreshedSubmission?.urlFile || "");
      setKeterangan(
        refreshedSubmission?.keterangan || ""
      );
    } catch (err) {
      console.error("Gagal submit tugas:", err);

      setError(
        err?.message || "Tugas gagal dikumpulkan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setSelectedTugas(null);
    setSubmissionMap({});
    setUrlFile("");
    setKeterangan("");

    await loadTugas();
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800">
      {/* =====================================================
          SIDEBAR
          
          Sidebar dirender apa adanya, tanpa marginLeft.
          Lebar sidebar (w-64 / w-[72px]) sudah diatur
          dari dalam komponen Sidebar sendiri.
      ===================================================== */}

      <Sidebar
        role="siswa"
        collapsed={!sidebarOpen}
        setCollapsed={(value) => {
          const next =
            typeof value === "function"
              ? value(!sidebarOpen)
              : value;

          setSidebarOpen(!next);
        }}
      />

      {/* =====================================================
          CONTENT
          
          flex-1 + min-w-0 → otomatis mengisi sisa lebar
          setelah sidebar. Tidak perlu ml-[270px] lagi.
      ===================================================== */}

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* ===================================================
            HEADER (STICKY)
        =================================================== */}

        <div className="sticky top-0 z-30 shrink-0">
          <Header
            onMenuClick={() =>
              setSidebarOpen((prev) => !prev)
            }
          />
        </div>

        {/* ===================================================
            MAIN (SCROLL INTERNAL)
        =================================================== */}

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft size={18} />
                Kembali
              </button>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                      <FileText size={22} />
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">
                        Tugas
                      </h1>

                      <p className="text-sm text-slate-500">
                        Lihat dan kumpulkan tugas dari guru.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loadingList || loadingDetail}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={
                      loadingList || loadingDetail
                        ? "animate-spin"
                        : ""
                    }
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Berhasil
                  </p>

                  <p className="mt-0.5">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                MAIN GRID
                
                Kolom kiri (daftar tugas) proporsional.
                Kolom kanan (detail) fleksibel, tapi tidak
                memaksa melebar full sampai bikin gap.
            ================================================= */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.6fr)] xl:items-start">
              {/* =================================================
                  DAFTAR TUGAS
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Daftar Tugas
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {tugasList.length} tugas
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <BookOpen size={18} />
                    </div>
                  </div>
                </div>

                {loadingList ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <Loader2
                        size={28}
                        className="animate-spin text-blue-600"
                      />

                      <span className="text-sm">
                        Memuat tugas...
                      </span>
                    </div>
                  </div>
                ) : tugasList.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FileText size={26} />
                    </div>

                    <h3 className="font-semibold text-slate-800">
                      Belum ada tugas
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Guru belum memberikan tugas untuk
                      kelas mapel ini.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-3">
                    <div className="space-y-2">
                      {tugasList.map((tugas) => {
                        const isSelected =
                          selectedTugas?.id === tugas.id;

                        const submission =
                          submissionMap[tugas.id] || null;

                        const status = normalizeStatus(
                          submission,
                          tugas.batasWaktu
                        );

                        return (
                          <button
                            key={tugas.id}
                            type="button"
                            onClick={() =>
                              handleSelectTugas(tugas.id)
                            }
                            className={`w-full rounded-xl border p-4 text-left transition ${
                              isSelected
                                ? "border-blue-200 bg-blue-50"
                                : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <FileText size={18} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-slate-900">
                                  {tugas.judul ||
                                    "Tugas Tanpa Judul"}
                                </h3>

                                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock3 size={14} />

                                  <span>
                                    {formatDate(
                                      tugas.batasWaktu
                                    )}
                                  </span>
                                </div>

                                <div className="mt-2">
                                  <span
                                    className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(
                                      status
                                    )}`}
                                  >
                                    {statusLabel(status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* =================================================
                  DETAIL TUGAS
              ================================================= */}

              <section className="min-w-0">
                {loadingDetail ? (
                  <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <Loader2
                        size={32}
                        className="animate-spin text-blue-600"
                      />

                      <span className="text-sm">
                        Memuat detail tugas...
                      </span>
                    </div>
                  </div>
                ) : !selectedTugas ? (
                  <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FileText size={28} />
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Pilih tugas
                    </h2>

                    <p className="mt-1 max-w-md text-sm text-slate-500">
                      Pilih salah satu tugas dari daftar
                      untuk melihat detail dan
                      mengumpulkannya.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      {/* HEADER DETAIL */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                              <BookOpen size={16} />

                              <span>
                                Tugas Pembelajaran
                              </span>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                              {selectedTugas.judul ||
                                "Tugas Tanpa Judul"}
                            </h2>
                          </div>

                          <span
                            className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass(
                              currentStatus
                            )}`}
                          >
                            {statusLabel(currentStatus)}
                          </span>
                        </div>
                      </div>

                      {/* DETAIL BODY */}

                      <div className="px-5 py-6 sm:px-6">
                        {/* INFO */}

                        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                              <CalendarDays size={15} />
                              Batas Waktu
                            </div>

                            <p className="text-sm font-semibold text-slate-800">
                              {formatDate(
                                selectedTugas.batasWaktu
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                              <User size={15} />
                              Status
                            </div>

                            <p className="text-sm font-semibold text-slate-800">
                              {statusLabel(currentStatus)}
                            </p>
                          </div>
                        </div>

                        {/* DESKRIPSI */}

                        <div className="mb-7">
                          <h3 className="mb-3 text-sm font-bold text-slate-900">
                            Deskripsi Tugas
                          </h3>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                              {selectedTugas.deskripsi ||
                                "Tidak ada deskripsi tugas."}
                            </p>
                          </div>
                        </div>

                        {/* DEADLINE WARNING */}

                        {deadlinePassed &&
                          currentStatus !== "dikumpulkan" &&
                          currentStatus !== "dinilai" && (
                            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                              <AlertCircle
                                size={20}
                                className="mt-0.5 shrink-0 text-red-600"
                              />

                              <div>
                                <p className="text-sm font-semibold text-red-800">
                                  Batas waktu sudah lewat
                                </p>

                                <p className="mt-1 text-xs leading-5 text-red-700">
                                  Jika kamu tetap mengumpulkan
                                  tugas, backend akan mencatat
                                  status pengumpulan sebagai{" "}
                                  <strong>terlambat</strong>.
                                </p>
                              </div>
                            </div>
                          )}

                        {/* SUDAH DINILAI */}

                        {isGraded && (
                          <div className="mb-7 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <Award
                              size={21}
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />

                            <div>
                              <p className="text-sm font-bold text-emerald-800">
                                Tugas sudah dinilai
                              </p>

                              <p className="mt-1 text-xs leading-5 text-emerald-700">
                                Tugas ini sudah diperiksa dan
                                dinilai oleh guru. Pengumpulan
                                tidak dapat dikirim ulang.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* SUBMISSION EXISTING */}

                        {currentSubmission && (
                          <div
                            className={`mb-7 rounded-xl border p-4 ${
                              isGraded
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-blue-200 bg-blue-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <CheckCircle2
                                size={21}
                                className={`mt-0.5 shrink-0 ${
                                  isGraded
                                    ? "text-emerald-600"
                                    : "text-blue-600"
                                }`}
                              />

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-sm font-bold ${
                                    isGraded
                                      ? "text-emerald-800"
                                      : "text-blue-800"
                                  }`}
                                >
                                  Tugas sudah dikumpulkan
                                </p>

                                <p
                                  className={`mt-1 text-xs ${
                                    isGraded
                                      ? "text-emerald-700"
                                      : "text-blue-700"
                                  }`}
                                >
                                  Status:{" "}
                                  <strong>
                                    {statusLabel(
                                      currentSubmission.status
                                    )}
                                  </strong>
                                </p>

                                {currentSubmission.urlFile && (
                                  <a
                                    href={
                                      currentSubmission.urlFile
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                  >
                                    <ExternalLink size={14} />

                                    <span className="truncate">
                                      Buka file pengumpulan
                                    </span>
                                  </a>
                                )}

                                {currentSubmission.keterangan && (
                                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                      Keterangan
                                    </p>

                                    <p className="whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                      {
                                        currentSubmission.keterangan
                                      }
                                    </p>
                                  </div>
                                )}

                                {currentSubmission.nilai !==
                                  null &&
                                  currentSubmission.nilai !==
                                    undefined && (
                                    <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3">
                                      <div className="flex items-center gap-2">
                                        <Award
                                          size={16}
                                          className="text-emerald-600"
                                        />

                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                          Nilai
                                        </p>
                                      </div>

                                      <p className="mt-1 text-2xl font-bold text-emerald-700">
                                        {currentSubmission.nilai}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* FORM SUBMISSION */}

                        <form
                          onSubmit={handleSubmit}
                          className="space-y-5"
                        >
                          {/* URL FILE */}

                          <div>
                            <label
                              htmlFor="urlFile"
                              className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                              URL File Pengumpulan
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Link2
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />

                              <input
                                id="urlFile"
                                type="url"
                                value={urlFile}
                                onChange={(event) =>
                                  setUrlFile(event.target.value)
                                }
                                placeholder="https://drive.google.com/..."
                                disabled={submitting || isGraded}
                                required={!isGraded}
                                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
                                  isGraded
                                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                                    : "border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                }`}
                              />
                            </div>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {isGraded
                                ? "Tugas sudah dinilai sehingga URL file tidak dapat diubah."
                                : "Masukkan URL file yang dapat diakses guru. Contoh: Google Drive, OneDrive, atau URL file lainnya."}
                            </p>
                          </div>

                          {/* KETERANGAN */}

                          <div>
                            <label
                              htmlFor="keterangan"
                              className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                              Keterangan
                            </label>

                            <textarea
                              id="keterangan"
                              value={keterangan}
                              onChange={(event) =>
                                setKeterangan(event.target.value)
                              }
                              placeholder="Tambahkan keterangan jika diperlukan..."
                              rows={4}
                              disabled={submitting || isGraded}
                              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
                                isGraded
                                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                                  : "border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                              }`}
                            />
                          </div>

                          {/* SUBMIT FOOTER */}

                          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-500">
                              {isGraded
                                ? "Tugas sudah dinilai oleh guru dan tidak dapat dikirim ulang."
                                : currentSubmission
                                ? "Mengirim ulang akan memperbarui pengumpulan sebelumnya."
                                : "Pastikan URL file sudah benar sebelum mengumpulkan."}
                            </p>

                            <button
                              type="submit"
                              disabled={
                                submitting ||
                                isGraded ||
                                !urlFile.trim()
                              }
                              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition ${
                                isGraded
                                  ? "cursor-not-allowed bg-slate-400"
                                  : "bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              }`}
                            >
                              {isGraded ? (
                                <>
                                  <CheckCircle2 size={18} />
                                  Sudah Dinilai
                                </>
                              ) : submitting ? (
                                <>
                                  <Loader2
                                    size={18}
                                    className="animate-spin"
                                  />
                                  Mengirim...
                                </>
                              ) : (
                                <>
                                  <Send size={18} />

                                  {currentSubmission
                                    ? "Kirim Ulang Tugas"
                                    : "Kumpulkan Tugas"}
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}