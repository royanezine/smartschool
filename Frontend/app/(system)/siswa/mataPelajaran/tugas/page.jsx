"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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

/* =========================================================
   API
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const KELAS_BASE_URL = `${API_URL}/api/kelas`;
const TASK_BASE_URL = `${API_URL}/api/tugas`;

/* =========================================================
   THEME HELPERS
   Mengikuti token global SmartSchool
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_24px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralSurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralBorderStrong =
  "border-[color-mix(in_srgb,var(--color-text)_16%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

const themeInfoText =
  "text-[var(--color-info)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeSuccessText =
  "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText =
  "text-[var(--color-warning)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeCardText =
  "text-[var(--color-card)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themeDisabled =
  "disabled:cursor-not-allowed disabled:opacity-60";

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
   GET RESPONSE DATA
========================================================= */

function getData(response) {
  if (!response) return null;

  if (response.data !== undefined) {
    return response.data;
  }

  return response;
}

/* =========================================================
   GET USER ID
========================================================= */

function getLoggedInUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      const userId =
        user?.id ||
        user?.userId ||
        user?.penggunaId ||
        user?.siswa?.id ||
        user?.data?.id ||
        user?.data?.userId ||
        user?.data?.penggunaId;

      if (userId) {
        return userId;
      }
    }
  } catch (error) {
    console.error(
      "Gagal membaca user dari localStorage:",
      error
    );
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    return (
      payload?.userId ||
      payload?.id ||
      payload?.penggunaId ||
      null
    );
  } catch (error) {
    console.error(
      "Gagal membaca userId dari token:",
      error
    );

    return null;
  }
}

/* =========================================================
   GET ARRAY FROM RESPONSE
========================================================= */

function getArrayData(response) {
  const data = getData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  return [];
}

/* =========================================================
   GET KELAS ID SISWA
========================================================= */

async function getKelasSiswaId() {
  const userId = getLoggedInUserId();

  if (!userId) {
    throw new Error(
      "Data pengguna tidak ditemukan. Silakan login ulang."
    );
  }

  const kelasResponse = await apiRequest(
    KELAS_BASE_URL
  );

  const kelasList = getArrayData(kelasResponse);

  if (kelasList.length === 0) {
    throw new Error(
      "Belum ada data kelas yang tersedia."
    );
  }

  for (const kelas of kelasList) {
    if (!kelas?.id) {
      continue;
    }

    try {
      const detailResponse = await apiRequest(
        `${KELAS_BASE_URL}/${kelas.id}`
      );

      const detailData = getData(detailResponse);

      const anggota = Array.isArray(
        detailData?.anggota
      )
        ? detailData.anggota
        : [];

      const ditemukan = anggota.some((item) => {
        const siswaId =
          item?.siswa?.id ||
          item?.siswaId ||
          item?.penggunaId ||
          item?.userId;

        return (
          String(siswaId) === String(userId)
        );
      });

      if (ditemukan) {
        return kelas.id;
      }
    } catch (error) {
      console.error(
        `Gagal mengambil detail kelas ${kelas.id}:`,
        error
      );
    }
  }

  throw new Error(
    "Kelas siswa tidak ditemukan."
  );
}

/* =========================================================
   GET KELAS MAPEL SISWA
========================================================= */

async function getKelasMapelSiswa() {
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(
          window.location.search
        )
      : null;

  const queryKelasMapelId =
    params?.get("kelasMapelId");

  if (queryKelasMapelId) {
    return [queryKelasMapelId];
  }

  const kelasId = await getKelasSiswaId();

  const response = await apiRequest(
    `${KELAS_BASE_URL}/${kelasId}`
  );

  const data = getData(response);

  const kelasMapel = Array.isArray(
    data?.kelasMapel
  )
    ? data.kelasMapel
    : [];

  return kelasMapel
    .map((item) => item?.id)
    .filter(Boolean);
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

function normalizeStatus(
  submission,
  batasWaktu
) {
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
   Semua mengikuti global theme
========================================================= */

function statusClass(status) {
  switch (status) {
    case "dikumpulkan":
      return `${themeInfoSurface} ${themeInfoBorder} ${themeInfoText}`;

    case "dinilai":
      return `${themeSuccessSurface} ${themeSuccessBorder} ${themeSuccessText}`;

    case "terlambat":
      return `${themeDangerSurface} ${themeDangerBorder} theme-text`;

    default:
      return `${themeWarningSurface} ${themeWarningBorder} ${themeWarningText}`;
  }
}

/* =========================================================
   PAGE CONTENT
========================================================= */

function TugasSiswaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const kelasMapelId =
    searchParams.get("kelasMapelId");

  const [tugasList, setTugasList] = useState([]);
  const [selectedTugas, setSelectedTugas] =
    useState(null);

  const [submissionMap, setSubmissionMap] =
    useState({});

  const [loadingList, setLoadingList] =
    useState(true);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [urlFile, setUrlFile] =
    useState("");

  const [keterangan, setKeterangan] =
    useState("");

  /* =======================================================
     GET DETAIL TUGAS
  ======================================================= */

  const loadDetailTugas = useCallback(
    async (
      tugasId,
      options = {}
    ) => {
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
          data?.pengumpulanTugasSiswa?.[0] ||
          null;

        setSubmissionMap((prev) => ({
          ...prev,
          [tugasId]: submission,
        }));

        setSelectedTugas(data);

        setUrlFile(
          submission?.urlFile || ""
        );

        setKeterangan(
          submission?.keterangan || ""
        );

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

  const loadTugas = useCallback(
    async () => {
      try {
        setLoadingList(true);
        setError("");
        setSuccessMessage("");

        const kelasMapelIds =
          kelasMapelId
            ? [kelasMapelId]
            : await getKelasMapelSiswa();

        if (
          !kelasMapelIds ||
          kelasMapelIds.length === 0
        ) {
          setTugasList([]);
          setSubmissionMap({});
          setSelectedTugas(null);
          return;
        }

        const taskResponses =
          await Promise.all(
            kelasMapelIds.map(
              async (id) => {
                try {
                  const response =
                    await apiRequest(
                      `${TASK_BASE_URL}/kelas-mapel/${id}`
                    );

                  const data =
                    getData(response);

                  return Array.isArray(data)
                    ? data
                    : [];
                } catch (err) {
                  console.error(
                    `Gagal mengambil tugas kelas-mapel ${id}:`,
                    err
                  );

                  return [];
                }
              }
            )
          );

        const allTasks =
          taskResponses.flat();

        const uniqueTasks =
          Array.from(
            new Map(
              allTasks
                .filter(
                  (task) => task?.id
                )
                .map((task) => [
                  task.id,
                  task,
                ])
            ).values()
          );

        uniqueTasks.sort(
          (a, b) => {
            const dateA =
              a?.dibuatPada
                ? new Date(
                    a.dibuatPada
                  ).getTime()
                : 0;

            const dateB =
              b?.dibuatPada
                ? new Date(
                    b.dibuatPada
                  ).getTime()
                : 0;

            return dateB - dateA;
          }
        );

        setTugasList(uniqueTasks);

        if (uniqueTasks.length === 0) {
          setSubmissionMap({});
          setSelectedTugas(null);
          return;
        }

        const detailResults =
          await Promise.all(
            uniqueTasks.map(
              async (task) => {
                try {
                  const detailResponse =
                    await apiRequest(
                      `${TASK_BASE_URL}/${task.id}`
                    );

                  const detailData =
                    getData(
                      detailResponse
                    );

                  const submission =
                    detailData
                      ?.pengumpulanTugasSiswa?.[0] ||
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
              }
            )
          );

        const newSubmissionMap =
          {};

        detailResults.forEach(
          (item) => {
            newSubmissionMap[
              item.tugasId
            ] = item.submission;
          }
        );

        setSubmissionMap(
          newSubmissionMap
        );
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
    },
    [kelasMapelId]
  );

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
    if (
      tugasList.length > 0 &&
      !selectedTugas
    ) {
      loadDetailTugas(
        tugasList[0].id,
        {
          showLoading: true,
          clearMessages: false,
        }
      );
    }
  }, [
    tugasList,
    selectedTugas,
    loadDetailTugas,
  ]);

  /* =======================================================
     CURRENT SUBMISSION
  ======================================================= */

  const currentSubmission =
    useMemo(() => {
      if (!selectedTugas) {
        return null;
      }

      return (
        selectedTugas
          ?.pengumpulanTugasSiswa?.[0] ||
        submissionMap[selectedTugas.id] ||
        null
      );
    }, [
      selectedTugas,
      submissionMap,
    ]);

  /* =======================================================
     CURRENT STATUS
  ======================================================= */

  const currentStatus =
    useMemo(() => {
      return normalizeStatus(
        currentSubmission,
        selectedTugas?.batasWaktu
      );
    }, [
      currentSubmission,
      selectedTugas,
    ]);

  /* =======================================================
     SUDAH DINILAI
  ======================================================= */

  const isGraded = useMemo(() => {
    return (
      currentSubmission?.status ===
      "dinilai"
    );
  }, [currentSubmission]);

  /* =======================================================
     DEADLINE PASSED
  ======================================================= */

  const deadlinePassed =
    useMemo(() => {
      return isDeadlinePassed(
        selectedTugas?.batasWaktu
      );
    }, [selectedTugas]);

  /* =======================================================
     SELECT TASK
  ======================================================= */

  const handleSelectTugas = async (
    tugasId
  ) => {
    if (!tugasId) return;

    if (
      tugasId === selectedTugas?.id
    ) {
      return;
    }

    await loadDetailTugas(tugasId);
  };

  /* =======================================================
     SUBMIT TUGAS
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedTugas?.id) {
      setError(
        "Tugas belum dipilih."
      );
      return;
    }

    if (
      currentSubmission?.status ===
      "dinilai"
    ) {
      setError(
        "Tugas sudah dinilai oleh guru sehingga tidak dapat dikirim ulang."
      );
      return;
    }

    const cleanUrl =
      urlFile.trim();

    const cleanKeterangan =
      keterangan.trim();

    if (!cleanUrl) {
      setError(
        "URL file wajib diisi."
      );
      return;
    }

    try {
      const parsedUrl =
        new URL(cleanUrl);

      if (
        parsedUrl.protocol !==
          "http:" &&
        parsedUrl.protocol !==
          "https:"
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

      const response =
        await apiRequest(
          `${TASK_BASE_URL}/${selectedTugas.id}/submit`,
          {
            method: "POST",
            body: JSON.stringify({
              urlFile: cleanUrl,
              keterangan:
                cleanKeterangan ||
                null,
            }),
          }
        );

      const submission =
        getData(response);

      setSuccessMessage(
        response?.message ||
          "Tugas berhasil dikumpulkan."
      );

      if (submission) {
        setSubmissionMap(
          (prev) => ({
            ...prev,
            [selectedTugas.id]:
              submission,
          })
        );

        setSelectedTugas(
          (prev) => {
            if (!prev) {
              return prev;
            }

            return {
              ...prev,
              pengumpulanTugasSiswa:
                [submission],
            };
          }
        );
      }

      const refreshedResponse =
        await apiRequest(
          `${TASK_BASE_URL}/${selectedTugas.id}`
        );

      const refreshedData =
        getData(
          refreshedResponse
        );

      const refreshedSubmission =
        refreshedData
          ?.pengumpulanTugasSiswa?.[0] ||
        null;

      setSelectedTugas(
        refreshedData
      );

      setSubmissionMap(
        (prev) => ({
          ...prev,
          [selectedTugas.id]:
            refreshedSubmission,
        })
      );

      setUrlFile(
        refreshedSubmission
          ?.urlFile || ""
      );

      setKeterangan(
        refreshedSubmission
          ?.keterangan || ""
      );
    } catch (err) {
      console.error(
        "Gagal submit tugas:",
        err
      );

      setError(
        err?.message ||
          "Tugas gagal dikumpulkan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      setSelectedTugas(null);
      setSubmissionMap({});
      setUrlFile("");
      setKeterangan("");
      setError("");
      setSuccessMessage("");

      await loadTugas();
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className={`mb-4 inline-flex items-center gap-2 text-sm font-medium theme-text-secondary transition hover:text-[var(--color-primary)]`}
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimaryGradient} ${themeCardText} ${themePrimaryShadow}`}
                >
                  <FileText size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Tugas
                  </h1>

                  <p className="text-sm theme-text-secondary">
                    Lihat dan kumpulkan
                    tugas dari guru.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={
                loadingList ||
                loadingDetail
              }
              className={`inline-flex items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 py-2.5 text-sm font-semibold theme-text transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] ${themeSmallShadow} ${themeDisabled}`}
            >
              <RefreshCw
                size={16}
                className={
                  loadingList ||
                  loadingDetail
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
          <div
            className={`mb-5 flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3 text-sm theme-text`}
          >
            <AlertCircle
              size={20}
              className={`mt-0.5 shrink-0 ${themeInfoText}`}
            />

            <div>
              <p className="font-semibold theme-text">
                Terjadi kesalahan
              </p>

              <p className="mt-0.5 theme-text-secondary">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {successMessage && (
          <div
            className={`mb-5 flex items-start gap-3 rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} px-4 py-3 text-sm ${themeSuccessText}`}
          >
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Berhasil
              </p>

              <p className="mt-0.5 opacity-80">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.6fr)] xl:items-start">
          {/* =================================================
              DAFTAR TUGAS
          ================================================= */}

          <section
            className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
          >
            <div
              className={`border-b ${themeDivider} px-5 py-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold theme-text">
                    Daftar Tugas
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    {tugasList.length}{" "}
                    tugas
                  </p>
                </div>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySurface} ${themePrimaryText}`}
                >
                  <BookOpen size={18} />
                </div>
              </div>
            </div>

            {loadingList ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-3 theme-text-secondary">
                  <Loader2
                    size={28}
                    className={`animate-spin ${themePrimaryText}`}
                  />

                  <span className="text-sm">
                    Memuat tugas...
                  </span>
                </div>
              </div>
            ) : tugasList.length ===
              0 ? (
              <div className="px-6 py-12 text-center">
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${themeNeutralSurfaceStrong} theme-text-muted`}
                >
                  <FileText size={26} />
                </div>

                <h3 className="font-semibold theme-text">
                  Belum ada tugas
                </h3>

                <p className="mt-1 text-sm theme-text-secondary">
                  Guru belum memberikan
                  tugas untuk kelas
                  mapel ini.
                </p>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-3">
                <div className="space-y-2">
                  {tugasList.map(
                    (tugas) => {
                      const isSelected =
                        selectedTugas?.id ===
                        tugas.id;

                      const submission =
                        submissionMap[
                          tugas.id
                        ] || null;

                      const status =
                        normalizeStatus(
                          submission,
                          tugas.batasWaktu
                        );

                      return (
                        <button
                          key={tugas.id}
                          type="button"
                          onClick={() =>
                            handleSelectTugas(
                              tugas.id
                            )
                          }
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            isSelected
                              ? `${themePrimaryBorder} ${themePrimarySurface}`
                              : `border-transparent hover:${themeNeutralSurface}`
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? `${themePrimaryGradient} ${themeCardText}`
                                  : `${themeNeutralSurfaceStrong} theme-text-muted`
                              }`}
                            >
                              <FileText size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-semibold theme-text">
                                {tugas.judul ||
                                  "Tugas Tanpa Judul"}
                              </h3>

                              <div className="mt-2 flex items-center gap-1.5 text-xs theme-text-muted">
                                <Clock3
                                  size={14}
                                />

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
                                  {statusLabel(
                                    status
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              DETAIL TUGAS
          ================================================= */}

          <section className="min-w-0">
            {loadingDetail ? (
              <div
                className={`theme-card flex min-h-[500px] items-center justify-center rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div className="flex flex-col items-center gap-3 theme-text-secondary">
                  <Loader2
                    size={32}
                    className={`animate-spin ${themePrimaryText}`}
                  />

                  <span className="text-sm">
                    Memuat detail tugas...
                  </span>
                </div>
              </div>
            ) : !selectedTugas ? (
              <div
                className={`theme-card flex min-h-[500px] flex-col items-center justify-center rounded-2xl border ${themeNeutralBorder} px-6 text-center ${themeCardShadow}`}
              >
                <div
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${themeNeutralSurfaceStrong} theme-text-muted`}
                >
                  <FileText size={28} />
                </div>

                <h2 className="text-lg font-bold theme-text">
                  Pilih tugas
                </h2>

                <p className="mt-1 max-w-md text-sm theme-text-secondary">
                  Pilih salah satu tugas
                  dari daftar untuk
                  melihat detail dan
                  mengumpulkannya.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  {/* HEADER DETAIL */}

                  <div
                    className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div
                          className={`mb-2 flex items-center gap-2 text-sm font-medium ${themePrimaryText}`}
                        >
                          <BookOpen size={16} />

                          <span>
                            Tugas
                            Pembelajaran
                          </span>
                        </div>

                        <h2 className="text-xl font-bold theme-text sm:text-2xl">
                          {selectedTugas.judul ||
                            "Tugas Tanpa Judul"}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass(
                          currentStatus
                        )}`}
                      >
                        {statusLabel(
                          currentStatus
                        )}
                      </span>
                    </div>
                  </div>

                  {/* DETAIL BODY */}

                  <div className="px-5 py-6 sm:px-6">
                    {/* INFO */}

                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div
                        className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium theme-text-muted">
                          <CalendarDays
                            size={15}
                          />

                          Batas Waktu
                        </div>

                        <p className="text-sm font-semibold theme-text">
                          {formatDate(
                            selectedTugas.batasWaktu
                          )}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium theme-text-muted">
                          <User size={15} />

                          Status
                        </div>

                        <p className="text-sm font-semibold theme-text">
                          {statusLabel(
                            currentStatus
                          )}
                        </p>
                      </div>
                    </div>

                    {/* DESKRIPSI */}

                    <div className="mb-7">
                      <h3 className="mb-3 text-sm font-bold theme-text">
                        Deskripsi Tugas
                      </h3>

                      <div
                        className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-7 theme-text-secondary">
                          {selectedTugas.deskripsi ||
                            "Tidak ada deskripsi tugas."}
                        </p>
                      </div>
                    </div>

                    {/* DEADLINE WARNING */}

                    {deadlinePassed &&
                      currentStatus !==
                        "dikumpulkan" &&
                      currentStatus !==
                        "dinilai" && (
                        <div
                          className={`mb-6 flex items-start gap-3 rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-4`}
                        >
                          <AlertCircle
                            size={20}
                            className={`mt-0.5 shrink-0 ${themeWarningText}`}
                          />

                          <div>
                            <p
                              className={`text-sm font-semibold ${themeWarningText}`}
                            >
                              Batas waktu
                              sudah lewat
                            </p>

                            <p className="mt-1 text-xs leading-5 theme-text-secondary">
                              Jika kamu
                              tetap
                              mengumpulkan
                              tugas,
                              backend
                              akan
                              mencatat
                              status
                              pengumpulan
                              sebagai{" "}
                              <strong className="theme-text">
                                terlambat
                              </strong>
                              .
                            </p>
                          </div>
                        </div>
                      )}

                    {/* SUDAH DINILAI */}

                    {isGraded && (
                      <div
                        className={`mb-7 flex items-start gap-3 rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
                      >
                        <Award
                          size={21}
                          className={`mt-0.5 shrink-0 ${themeSuccessText}`}
                        />

                        <div>
                          <p
                            className={`text-sm font-bold ${themeSuccessText}`}
                          >
                            Tugas sudah
                            dinilai
                          </p>

                          <p className="mt-1 text-xs leading-5 theme-text-secondary">
                            Tugas ini
                            sudah
                            diperiksa
                            dan dinilai
                            oleh guru.
                            Pengumpulan
                            tidak dapat
                            dikirim
                            ulang.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SUBMISSION EXISTING */}

                    {currentSubmission && (
                      <div
                        className={`mb-7 rounded-xl border p-4 ${
                          isGraded
                            ? `${themeSuccessBorder} ${themeSuccessSurface}`
                            : `${themeInfoBorder} ${themeInfoSurface}`
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2
                            size={21}
                            className={`mt-0.5 shrink-0 ${
                              isGraded
                                ? themeSuccessText
                                : themeInfoText
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-bold ${
                                isGraded
                                  ? themeSuccessText
                                  : themeInfoText
                              }`}
                            >
                              Tugas sudah
                              dikumpulkan
                            </p>

                            <p className="mt-1 text-xs theme-text-secondary">
                              Status:{" "}
                              <strong className="theme-text">
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
                                className={`mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-2 text-xs font-semibold theme-text transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] ${themeSmallShadow}`}
                              >
                                <ExternalLink
                                  size={14}
                                />

                                <span className="truncate">
                                  Buka file
                                  pengumpulan
                                </span>
                              </a>
                            )}

                            {currentSubmission.keterangan && (
                              <div
                                className={`mt-3 rounded-lg border ${themeNeutralBorder} theme-card p-3`}
                              >
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide theme-text-muted">
                                  Keterangan
                                </p>

                                <p className="whitespace-pre-wrap text-xs leading-5 theme-text-secondary">
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
                                <div
                                  className={`mt-3 rounded-lg border ${themeSuccessBorder} theme-card p-3`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Award
                                      size={16}
                                      className={themeSuccessText}
                                    />

                                    <p className="text-[11px] font-semibold uppercase tracking-wide theme-text-muted">
                                      Nilai
                                    </p>
                                  </div>

                                  <p
                                    className={`mt-1 text-2xl font-bold ${themeSuccessText}`}
                                  >
                                    {
                                      currentSubmission.nilai
                                    }
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FORM SUBMISSION */}

                    <form
                      onSubmit={
                        handleSubmit
                      }
                      className="space-y-5"
                    >
                      {/* URL FILE */}

                      <div>
                        <label
                          htmlFor="urlFile"
                          className="mb-2 block text-sm font-semibold theme-text"
                        >
                          URL File
                          Pengumpulan
                          <span
                            className={`ml-1 ${themeInfoText}`}
                          >
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <Link2
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                          />

                          <input
                            id="urlFile"
                            type="url"
                            value={urlFile}
                            onChange={(event) =>
                              setUrlFile(
                                event.target
                                  .value
                              )
                            }
                            placeholder="https://drive.google.com/..."
                            disabled={
                              submitting ||
                              isGraded
                            }
                            required={!isGraded}
                            className={`theme-input w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition placeholder:theme-text-placeholder ${
                              isGraded
                                ? `${themeNeutralBorder} ${themeNeutralSurface} cursor-not-allowed theme-text-muted`
                                : `${themeNeutralBorder} ${themeFocus}`
                            }`}
                          />
                        </div>

                        <p className="mt-2 text-xs leading-5 theme-text-muted">
                          {isGraded
                            ? "Tugas sudah dinilai sehingga URL file tidak dapat diubah."
                            : "Masukkan URL file yang dapat diakses guru. Contoh: Google Drive, OneDrive, atau URL file lainnya."}
                        </p>
                      </div>

                      {/* KETERANGAN */}

                      <div>
                        <label
                          htmlFor="keterangan"
                          className="mb-2 block text-sm font-semibold theme-text"
                        >
                          Keterangan
                        </label>

                        <textarea
                          id="keterangan"
                          value={keterangan}
                          onChange={(event) =>
                            setKeterangan(
                              event.target
                                .value
                            )
                          }
                          placeholder="Tambahkan keterangan jika diperlukan..."
                          rows={4}
                          disabled={
                            submitting ||
                            isGraded
                          }
                          className={`theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:theme-text-placeholder ${
                            isGraded
                              ? `${themeNeutralBorder} ${themeNeutralSurface} cursor-not-allowed theme-text-muted`
                              : `${themeNeutralBorder} ${themeFocus}`
                          }`}
                        />
                      </div>

                      {/* SUBMIT FOOTER */}

                      <div
                        className={`flex flex-col gap-3 border-t ${themeDivider} pt-5 sm:flex-row sm:items-center sm:justify-between`}
                      >
                        <p className="text-xs theme-text-muted">
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
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${themeCardText} ${themePrimaryGradient} ${themePrimaryShadow} transition hover:brightness-95 ${themeDisabled}`}
                        >
                          {isGraded ? (
                            <>
                              <CheckCircle2
                                size={18}
                              />

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
                              <Send
                                size={18}
                              />

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
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default function TugasSiswaPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page min-h-full" />
      }
    >
      <TugasSiswaPageContent />
    </Suspense>
  );
}