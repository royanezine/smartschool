"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import { apiFetch } from "../../../../lib/api";

import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Grid3X3,
  Info,
  List,
  Loader2,
  LockKeyhole,
  Send,
  Timer,
  X,
} from "lucide-react";

/* =========================================================
   RESPONSE HELPER
========================================================= */

function normalizeObjectResponse(response) {
  if (!response) {
    return null;
  }

  if (response?.data?.data !== undefined) {
    return response.data.data;
  }

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
}

function normalizeArrayResponse(response) {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

/* =========================================================
   OPTION HELPER
========================================================= */

function getOptionValue(option) {
  if (typeof option === "string") {
    return option;
  }

  if (!option || typeof option !== "object") {
    return "";
  }

  return String(
    option?.value ??
      option?.text ??
      option?.label ??
      option?.answer ??
      ""
  );
}

/* =========================================================
   FORMAT
========================================================= */

function formatTime(seconds) {
  const safeSeconds = Math.max(
    0,
    Number(seconds) || 0
  );

  const hours = Math.floor(
    safeSeconds / 3600
  );

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60
  );

  const secs = safeSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(secs).padStart(2, "0"),
  ].join(":");
}

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatDecimal(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? 0
    : number;
}

/* =========================================================
   API
========================================================= */

async function getUjianById(id) {
  if (!id) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/v1/ujian/${id}`,
    {
      method: "GET",
    }
  );
}

async function getSoalByUjian(ujianId) {
  if (!ujianId) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/v1/soal-ujian/ujian/${ujianId}`,
    {
      method: "GET",
    }
  );
}

async function mulaiUjian(
  ujianId,
  token
) {
  if (!ujianId) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  if (!token?.trim()) {
    throw new Error(
      "Token ujian wajib diisi."
    );
  }

  return apiFetch(
    `/api/v1/ujian/${ujianId}/mulai`,
    {
      method: "POST",
      body: JSON.stringify({
        token: token
          .trim()
          .toUpperCase(),
      }),
    }
  );
}

async function submitUjian(
  sesiId,
  jawaban
) {
  if (!sesiId) {
    throw new Error(
      "ID sesi ujian tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/v1/ujian/sesi/${sesiId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({
        jawaban,
      }),
    }
  );
}

/* =========================================================
   SIMPAN HASIL UJIAN
========================================================= */

function saveHasilUjian(
  ujianId,
  submitResponse,
  sesiData,
  ujianData
) {
  if (typeof window === "undefined") {
    return null;
  }

  if (!ujianId) {
    throw new Error(
      "ID ujian tidak ditemukan saat menyimpan hasil."
    );
  }

  const normalizedResponse =
    normalizeObjectResponse(
      submitResponse
    );

  /*
    Backend submit mengembalikan hasilAsesmen
    secara langsung melalui successResponse.

    Tapi kita buat fallback supaya tetap aman
    kalau response dibungkus dalam beberapa level.
  */

  let hasil = null;

  if (
    normalizedResponse?.hasil
  ) {
    hasil =
      normalizedResponse.hasil;
  } else if (
    normalizedResponse?.hasilUjian
  ) {
    hasil =
      normalizedResponse.hasilUjian;
  } else if (
    normalizedResponse?.hasilAsesmen
  ) {
    hasil =
      normalizedResponse.hasilAsesmen;
  } else if (
    normalizedResponse?.data?.hasil
  ) {
    hasil =
      normalizedResponse.data.hasil;
  } else if (
    normalizedResponse?.data?.hasilUjian
  ) {
    hasil =
      normalizedResponse.data.hasilUjian;
  } else if (
    normalizedResponse?.data?.hasilAsesmen
  ) {
    hasil =
      normalizedResponse.data.hasilAsesmen;
  } else {
    /*
      Karena endpoint backend memang mengembalikan
      object hasilAsesmen secara langsung, fallback
      terakhir menggunakan normalizedResponse.
    */
    hasil =
      normalizedResponse;
  }

  const payload = {
    ujianId: String(ujianId),

    sesiId:
      sesiData?.id
        ? String(sesiData.id)
        : null,

    submittedAt:
      new Date().toISOString(),

    hasil,

    response: submitResponse,

    ujian: ujianData
      ? {
          id: ujianData?.id ?? null,
          judul:
            ujianData?.judul ?? null,
          jenis:
            ujianData?.jenis ?? null,
          durasi:
            ujianData?.durasi ?? null,
          kelasMapel:
            ujianData?.kelasMapel
              ? {
                  id:
                    ujianData
                      .kelasMapel
                      ?.id ?? null,

                  kelasId:
                    ujianData
                      .kelasMapel
                      ?.kelasId ?? null,

                  mataPelajaran:
                    ujianData
                      .kelasMapel
                      ?.mataPelajaran
                      ? {
                          id:
                            ujianData
                              .kelasMapel
                              .mataPelajaran
                              ?.id ??
                            null,

                          nama:
                            ujianData
                              .kelasMapel
                              .mataPelajaran
                              ?.nama ??
                            null,
                        }
                      : null,

                  kelas:
                    ujianData
                      .kelasMapel
                      ?.kelas
                      ? {
                          id:
                            ujianData
                              .kelasMapel
                              .kelas
                              ?.id ??
                            null,

                          nama:
                            ujianData
                              .kelasMapel
                              .kelas
                              ?.nama ??
                            null,
                        }
                      : null,
                }
              : null,
        }
      : null,
  };

  const serialized =
    JSON.stringify(payload);

  /*
    Penyimpanan utama.
  */
  localStorage.setItem(
    `hasil-ujian-${String(ujianId)}`,
    serialized
  );

  /*
    Backup menggunakan sessionStorage.
  */
  try {
    sessionStorage.setItem(
      `hasil-ujian-${String(ujianId)}`,
      serialized
    );
  } catch (storageError) {
    console.warn(
      "SessionStorage tidak dapat digunakan:",
      storageError
    );
  }

  /*
    Simpan hasil terakhir juga.
  */
  localStorage.setItem(
    "hasil-ujian-last",
    serialized
  );

  try {
    sessionStorage.setItem(
      "hasil-ujian-last",
      serialized
    );
  } catch (storageError) {
    console.warn(
      "SessionStorage hasil terakhir tidak dapat digunakan:",
      storageError
    );
  }

  console.log(
    "=========================================="
  );

  console.log(
    "HASIL UJIAN BERHASIL DISIMPAN"
  );

  console.log(
    "ID UJIAN:",
    ujianId
  );

  console.log(
    "ID SESI:",
    sesiData?.id
  );

  console.log(
    "RESPONSE SUBMIT:",
    submitResponse
  );

  console.log(
    "HASIL:",
    hasil
  );

  console.log(
    "STORAGE KEY:",
    `hasil-ujian-${String(ujianId)}`
  );

  console.log(
    "=========================================="
  );

  return payload;
}

/* =========================================================
   PAGE
========================================================= */

export default function UjianPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  /* =======================================================
     STATE
  ======================================================= */

  const [ujian, setUjian] =
    useState(null);

  const [soal, setSoal] =
    useState([]);

  const [jawaban, setJawaban] =
    useState({});

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [waktu, setWaktu] =
    useState(0);

  const [sesi, setSesi] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showTokenModal, setShowTokenModal] =
    useState(false);

  const [token, setToken] =
    useState("");

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [showTimeWarning, setShowTimeWarning] =
    useState(false);

  const [isFinished, setIsFinished] =
    useState(false);

  const [viewMode, setViewMode] =
    useState("grid");

  const [
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ] = useState(false);

  /* =======================================================
     REFS
  ======================================================= */

  const timerRef =
    useRef(null);

  const autoSubmitRef =
    useRef(false);

  /* =======================================================
     LOAD UJIAN
  ======================================================= */

  const loadUjian =
    useCallback(async () => {
      if (!id) {
        setError(
          "ID ujian tidak ditemukan."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        /* -----------------------------------------------
           DETAIL UJIAN
        ------------------------------------------------ */

        const ujianResponse =
          await getUjianById(id);

        const ujianData =
          normalizeObjectResponse(
            ujianResponse
          );

        console.log(
          "=========================================="
        );

        console.log(
          "DETAIL UJIAN SISWA"
        );

        console.log(
          "ID UJIAN:",
          id
        );

        console.log(
          "RESPONSE UJIAN:",
          ujianResponse
        );

        console.log(
          "DATA UJIAN:",
          ujianData
        );

        /* -----------------------------------------------
           VALIDASI DATA UJIAN
        ------------------------------------------------ */

        if (!ujianData?.id) {
          throw new Error(
            "Data ujian tidak ditemukan."
          );
        }

        /* -----------------------------------------------
           SOAL UJIAN
        ------------------------------------------------ */

        const soalResponse =
          await getSoalByUjian(id);

        const soalData =
          normalizeArrayResponse(
            soalResponse
          );

        console.log(
          "RESPONSE SOAL:",
          soalResponse
        );

        console.log(
          "DATA SOAL:",
          soalData
        );

        /* -----------------------------------------------
           SORT SOAL
        ------------------------------------------------ */

        const sortedSoal =
          [...soalData].sort(
            (a, b) =>
              Number(
                a?.nomorUrut || 0
              ) -
              Number(
                b?.nomorUrut || 0
              )
          );

        /* -----------------------------------------------
           SET DATA
        ------------------------------------------------ */

        setUjian(ujianData);
        setSoal(sortedSoal);

        /* -----------------------------------------------
           RESET JAWABAN
        ------------------------------------------------ */

        const initialJawaban = {};

        sortedSoal.forEach(
          (item) => {
            if (item?.id) {
              initialJawaban[
                item.id
              ] = null;
            }
          }
        );

        setJawaban(
          initialJawaban
        );

        /* -----------------------------------------------
           RESET TIMER
        ------------------------------------------------ */

        setWaktu(
          Number(
            ujianData?.durasi || 0
          ) * 60
        );

        /* -----------------------------------------------
           RESET STATUS
        ------------------------------------------------ */

        setSesi(null);
        setCurrentIndex(0);
        setIsFinished(false);
        setShowTimeWarning(false);

        /* -----------------------------------------------
           FIX AUTO SUBMIT REF
        ------------------------------------------------ */

        autoSubmitRef.current = false;

        console.log(
          "=========================================="
        );
      } catch (err) {
        console.error(
          "LOAD UJIAN ERROR:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data ujian."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadUjian();

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }
    };
  }, [loadUjian]);

  /* =======================================================
     OPEN TOKEN MODAL
  ======================================================= */

  const handleOpenStart = () => {
    setToken("");
    setError("");
    setShowTokenModal(true);
  };

  /* =======================================================
     START UJIAN
  ======================================================= */

  const handleStartUjian =
    async () => {
      if (!id) {
        return;
      }

      if (!token.trim()) {
        setError(
          "Token ujian wajib diisi."
        );

        return;
      }

      try {
        setStarting(true);
        setError("");

        const response =
          await mulaiUjian(
            id,
            token.trim()
          );

        console.log(
          "RESPONSE MULAI UJIAN:",
          response
        );

        const sesiData =
          normalizeObjectResponse(
            response
          );

        console.log(
          "SESI UJIAN:",
          sesiData
        );

        if (!sesiData?.id) {
          throw new Error(
            "Sesi ujian gagal dibuat."
          );
        }

        /* -----------------------------------------------
           SIMPAN SESI
        ------------------------------------------------ */

        setSesi(sesiData);

        /* -----------------------------------------------
           TUTUP MODAL
        ------------------------------------------------ */

        setShowTokenModal(false);

        /* -----------------------------------------------
           RESET TIMER
        ------------------------------------------------ */

        setWaktu(
          Number(
            ujian?.durasi || 0
          ) * 60
        );

        /* -----------------------------------------------
           RESET STATUS
        ------------------------------------------------ */

        setIsFinished(false);
        setCurrentIndex(0);
        setShowTimeWarning(false);

        /* -----------------------------------------------
           RESET AUTO SUBMIT
        ------------------------------------------------ */

        autoSubmitRef.current = false;

        console.log(
          "UJIAN BERHASIL DIMULAI"
        );
      } catch (err) {
        console.error(
          "MULAI UJIAN ERROR:",
          err
        );

        setError(
          err?.message ||
            "Token ujian tidak valid atau ujian gagal dimulai."
        );
      } finally {
        setStarting(false);
      }
    };

  /* =======================================================
     BUILD SUBMIT PAYLOAD
  ======================================================= */

  const buildSubmitPayload =
    useCallback(() => {
      const payload =
        soal.map((item) => {
          const value =
            jawaban?.[item.id];

          return {
            soalId: item.id,

            jawaban:
              value === null ||
              value === undefined
                ? ""
                : String(value).trim(),
          };
        });

      console.log(
        "=========================================="
      );

      console.log(
        "PAYLOAD JAWABAN FINAL"
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        "=========================================="
      );

      return payload;
    }, [soal, jawaban]);

  /* =======================================================
     AUTO SUBMIT
  ======================================================= */

  const handleAutoSubmit =
    useCallback(async () => {
      if (
        autoSubmitRef.current
      ) {
        return;
      }

      if (!sesi?.id) {
        return;
      }

      if (isFinished) {
        return;
      }

      autoSubmitRef.current = true;

      try {
        setSubmitting(true);
        setError("");

        const payloadJawaban =
          buildSubmitPayload();

        console.log(
          "=========================================="
        );

        console.log(
          "AUTO SUBMIT UJIAN"
        );

        console.log(
          "SESI ID:",
          sesi.id
        );

        console.log(
          "JAWABAN:",
          payloadJawaban
        );

        console.log(
          "=========================================="
        );

        /*
          PENTING:
          Response submit disimpan.
        */

        const submitResponse =
          await submitUjian(
            sesi.id,
            payloadJawaban
          );

        console.log(
          "RESPONSE AUTO SUBMIT:",
          submitResponse
        );

        /*
          Simpan hasil SEBELUM redirect.
        */

        saveHasilUjian(
          id,
          submitResponse,
          sesi,
          ujian
        );

        setIsFinished(true);

        if (timerRef.current) {
          clearInterval(
            timerRef.current
          );

          timerRef.current = null;
        }

        /*
          Beri sedikit waktu agar state/storage
          benar-benar selesai sebelum pindah.
        */

        router.push(
          `/siswa/hasil-ujian/${id}`
        );
      } catch (err) {
        console.error(
          "AUTO SUBMIT ERROR:",
          err
        );

        autoSubmitRef.current =
          false;

        setSubmitting(false);

        setError(
          err?.message ||
            "Ujian otomatis gagal dikirim."
        );
      }
    }, [
      sesi,
      buildSubmitPayload,
      router,
      id,
      ujian,
      isFinished,
    ]);

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (
      !sesi?.id ||
      isFinished ||
      submitting
    ) {
      return;
    }

    if (waktu <= 0) {
      handleAutoSubmit();

      return;
    }

    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );
    }

    timerRef.current =
      setInterval(() => {
        setWaktu((prev) => {
          if (prev <= 1) {
            clearInterval(
              timerRef.current
            );

            timerRef.current = null;

            return 0;
          }

          const next =
            prev - 1;

          if (
            next === 300
          ) {
            setShowTimeWarning(
              true
            );
          }

          return next;
        });
      }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current = null;
      }
    };
  }, [
    sesi?.id,
    isFinished,
    submitting,
    waktu,
    handleAutoSubmit,
  ]);

  /* =======================================================
     HANDLE WAKTU HABIS
  ======================================================= */

  useEffect(() => {
    if (
      sesi?.id &&
      waktu === 0 &&
      !isFinished &&
      !submitting
    ) {
      handleAutoSubmit();
    }
  }, [
    waktu,
    sesi?.id,
    isFinished,
    submitting,
    handleAutoSubmit,
  ]);

  /* =======================================================
     PILIH JAWABAN
  ======================================================= */

  const pilihJawaban = (
    soalId,
    value
  ) => {
    if (
      !sesi ||
      isFinished ||
      submitting
    ) {
      return;
    }

    const normalizedValue =
      value === null ||
      value === undefined
        ? ""
        : String(value);

    setJawaban((prev) => ({
      ...prev,
      [soalId]:
        normalizedValue,
    }));
  };

  /* =======================================================
     NAVIGASI SOAL
  ======================================================= */

  const goToSoal = (
    index
  ) => {
    if (
      index < 0 ||
      index >= soal.length
    ) {
      return;
    }

    setCurrentIndex(index);

    setTimeout(() => {
      document
        .querySelector(
          ".soal-container"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /* =======================================================
     SUBMIT BUTTON
  ======================================================= */

  const handleSubmit = () => {
    if (!sesi?.id) {
      return;
    }

    if (
      isFinished ||
      submitting
    ) {
      return;
    }

    setShowConfirm(true);
  };

  /* =======================================================
     CONFIRM SUBMIT
  ======================================================= */

  const confirmSubmit =
    async () => {
      if (!sesi?.id) {
        return;
      }

      if (submitting) {
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        autoSubmitRef.current = true;

        if (timerRef.current) {
          clearInterval(
            timerRef.current
          );

          timerRef.current = null;
        }

        setShowConfirm(false);

        const payloadJawaban =
          buildSubmitPayload();

        console.log(
          "=========================================="
        );

        console.log(
          "SUBMIT UJIAN MANUAL"
        );

        console.log(
          "SESI ID:",
          sesi.id
        );

        console.log(
          "JUMLAH SOAL:",
          soal.length
        );

        console.log(
          "JUMLAH TERJAWAB:",
          Object.values(
            jawaban
          ).filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              String(
                value
              ).trim() !== ""
          ).length
        );

        console.log(
          "PAYLOAD:",
          payloadJawaban
        );

        console.log(
          "=========================================="
        );

        /*
          PENTING:
          Jangan langsung router.push setelah submit.

          Tunggu response backend terlebih dahulu.
        */

        const submitResponse =
          await submitUjian(
            sesi.id,
            payloadJawaban
          );

        console.log(
          "SUBMIT BERHASIL"
        );

        console.log(
          "RESPONSE HASIL UJIAN:",
          submitResponse
        );

        /*
          PENTING:
          Simpan hasil backend sebelum redirect.
        */

        const savedResult =
          saveHasilUjian(
            id,
            submitResponse,
            sesi,
            ujian
          );

        console.log(
          "HASIL YANG DISIMPAN:",
          savedResult
        );

        /*
          Tandai selesai setelah response
          berhasil diterima dan disimpan.
        */

        setIsFinished(true);

        /*
          Redirect ke halaman hasil.
        */

        router.push(
          `/siswa/hasil-ujian/${id}`
        );
      } catch (err) {
        console.error(
          "SUBMIT UJIAN ERROR:",
          err
        );

        autoSubmitRef.current =
          false;

        setSubmitting(false);

        setError(
          err?.message ||
            "Gagal mengirim jawaban ujian."
        );
      }
    };

  /* =======================================================
     STATISTICS
  ======================================================= */

  const answeredCount =
    useMemo(() => {
      return Object.values(
        jawaban
      ).filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).trim() !==
            ""
      ).length;
    }, [jawaban]);

  const unansweredCount =
    Math.max(
      0,
      soal.length -
        answeredCount
    );

  const progress =
    soal.length > 0
      ? (answeredCount /
          soal.length) *
        100
      : 0;

  const timerColor =
    waktu <= 300
      ? "text-rose-600"
      : waktu <= 600
      ? "text-amber-600"
      : "text-emerald-600";

  /* =======================================================
     CURRENT SOAL
  ======================================================= */

  const currentSoal =
    soal[currentIndex] ||
    null;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          role="siswa"
          active="ujian"
          collapsed={
            isSidebarCollapsed
          }
          setCollapsed={
            setIsSidebarCollapsed
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() =>
              setIsSidebarCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Andi Saputra",
              email:
                "siswa@smartschool.com",
              avatar: "AS",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Loader2
                  size={28}
                  className="animate-spin text-indigo-600"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Memuat ujian...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Mengambil data ujian
                dan soal
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR PAGE
  ======================================================= */

  if (
    error &&
    !ujian
  ) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          role="siswa"
          active="ujian"
          collapsed={
            isSidebarCollapsed
          }
          setCollapsed={
            setIsSidebarCollapsed
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() =>
              setIsSidebarCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Andi Saputra",
              email:
                "siswa@smartschool.com",
              avatar: "AS",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle
                  size={28}
                />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-800">
                Gagal Memuat Ujian
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  loadUjian
                }
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Coba Lagi
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        role="siswa"
        active="ujian"
        collapsed={
          isSidebarCollapsed
        }
        setCollapsed={
          setIsSidebarCollapsed
        }
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsSidebarCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Andi Saputra",
            email:
              "siswa@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="space-y-4">

              {/* =================================================
                  GLOBAL ERROR
              ================================================= */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="shrink-0 text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* =================================================
                  HEADER UJIAN
              ================================================= */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex min-w-0 items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                      <BookOpen
                        size={21}
                      />
                    </div>

                    <div className="min-w-0">

                      <h1 className="text-base font-bold text-slate-800 sm:text-lg">
                        {ujian?.judul ||
                          "Ujian"}
                      </h1>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm">

                        <span>
                          {ujian
                            ?.kelasMapel
                            ?.mataPelajaran
                            ?.nama ||
                            "-"}
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        <span>
                          {ujian
                            ?.kelasMapel
                            ?.kelas
                            ?.nama ||
                            "-"}
                        </span>

                        {ujian
                          ?.kelasMapel
                          ?.guruPengajar
                          ?.namaLengkap && (
                          <>
                            <span className="text-slate-300">
                              •
                            </span>

                            <span>
                              {
                                ujian
                                  .kelasMapel
                                  .guruPengajar
                                  .namaLengkap
                              }
                            </span>
                          </>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* INFO */}

                  <div className="flex flex-wrap items-center gap-2">

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <FileText
                        size={16}
                        className="text-indigo-500"
                      />

                      <div>
                        <p className="text-[10px] text-slate-400">
                          Soal
                        </p>

                        <p className="text-xs font-bold text-slate-700">
                          {soal.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <Clock
                        size={16}
                        className="text-amber-500"
                      />

                      <div>
                        <p className="text-[10px] text-slate-400">
                          Durasi
                        </p>

                        <p className="text-xs font-bold text-slate-700">
                          {ujian?.durasi ||
                            0}{" "}
                          menit
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <Info
                        size={16}
                        className="text-emerald-500"
                      />

                      <div>
                        <p className="text-[10px] text-slate-400">
                          Jenis
                        </p>

                        <p className="text-xs font-bold text-slate-700">
                          {ujian?.jenis ||
                            "-"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* =================================================
                  BEFORE START
              ================================================= */}

              {!sesi && (
                <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">

                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white sm:p-8">

                    <div className="mx-auto max-w-2xl text-center">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                        <LockKeyhole
                          size={30}
                        />
                      </div>

                      <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                        Siap Mengerjakan Ujian?
                      </h2>

                      <p className="mt-2 text-sm text-indigo-100">
                        Pastikan kamu sudah
                        siap sebelum
                        memulai. Setelah
                        ujian dimulai,
                        waktu akan
                        berjalan sesuai
                        durasi yang
                        ditentukan.
                      </p>

                    </div>
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2">
                        <Timer
                          size={18}
                          className="text-indigo-500"
                        />

                        <span className="text-xs font-semibold text-slate-500">
                          Durasi
                        </span>
                      </div>

                      <p className="mt-2 text-lg font-bold text-slate-800">
                        {ujian?.durasi ||
                          0}{" "}
                        menit
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2">
                        <FileText
                          size={18}
                          className="text-purple-500"
                        />

                        <span className="text-xs font-semibold text-slate-500">
                          Jumlah Soal
                        </span>
                      </div>

                      <p className="mt-2 text-lg font-bold text-slate-800">
                        {soal.length}{" "}
                        soal
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon />

                        <span className="text-xs font-semibold text-slate-500">
                          Jadwal
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm font-bold text-slate-800">
                        {formatDate(
                          ujian?.waktuMulai
                        )}
                      </p>
                    </div>

                  </div>

                  <div className="border-t border-slate-100 p-4 sm:p-6">

                    <button
                      type="button"
                      onClick={
                        handleOpenStart
                      }
                      disabled={
                        soal.length === 0
                      }
                      className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <BookOpen
                        size={18}
                      />

                      Mulai Ujian
                    </button>

                  </div>
                </section>
              )}

              {/* =================================================
                  UJIAN BERLANGSUNG
              ================================================= */}

              {sesi &&
                !isFinished && (
                  <>
                    {/* TIMER */}

                    <section className="sticky top-0 z-30 rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <BookOpen
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">

                            <h2 className="truncate text-sm font-bold text-slate-800">
                              {ujian?.judul}
                            </h2>

                            <p className="text-xs text-slate-400">
                              {answeredCount}{" "}
                              dari{" "}
                              {soal.length}{" "}
                              soal terjawab
                            </p>

                          </div>
                        </div>

                        <div className="flex items-center gap-2">

                          <div
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${timerColor} ${
                              waktu <= 300
                                ? "border-rose-200 bg-rose-50"
                                : waktu <= 600
                                ? "border-amber-200 bg-amber-50"
                                : "border-emerald-200 bg-emerald-50"
                            }`}
                          >

                            <Clock
                              size={18}
                            />

                            <div>
                              <p className="text-[9px] font-medium opacity-70">
                                Waktu
                              </p>

                              <p className="font-mono text-sm font-bold">
                                {formatTime(
                                  waktu
                                )}
                              </p>
                            </div>

                          </div>

                          <button
                            type="button"
                            onClick={
                              handleSubmit
                            }
                            disabled={
                              submitting
                            }
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                          >
                            {submitting ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Send
                                size={16}
                              />
                            )}

                            <span className="hidden sm:inline">
                              Kirim
                            </span>
                          </button>

                        </div>
                      </div>

                      {/* PROGRESS */}

                      <div className="px-3 pb-3 sm:px-4 sm:pb-4">

                        <div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-500">

                          <span>
                            Progress
                            pengerjaan
                          </span>

                          <span className="font-semibold text-indigo-600">
                            {Math.round(
                              progress
                            )}
                            %
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>
                    </section>

                    {/* WARNING */}

                    {showTimeWarning && (
                      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700">

                        <AlertTriangle
                          size={18}
                          className="shrink-0"
                        />

                        <p className="text-xs font-medium sm:text-sm">
                          Waktu ujian
                          tersisa kurang
                          dari 5 menit.
                          Pastikan semua
                          jawaban sudah
                          diperiksa.
                        </p>

                      </div>
                    )}

                    {/* CONTENT */}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

                      {/* SOAL */}

                      <div className="min-w-0 lg:col-span-4">

                        {currentSoal && (
                          <section className="soal-container rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

                            {/* HEADER */}

                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                              <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                                  {currentIndex +
                                    1}
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    Soal{" "}
                                    {currentIndex +
                                      1}
                                  </p>

                                  <p className="text-[10px] text-slate-400">
                                    dari{" "}
                                    {soal.length}{" "}
                                    soal
                                  </p>
                                </div>

                              </div>

                              <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewMode(
                                      "list"
                                    )
                                  }
                                  className={`rounded-md p-1.5 transition ${
                                    viewMode ===
                                    "list"
                                      ? "bg-indigo-100 text-indigo-600"
                                      : "text-slate-400 hover:bg-slate-100"
                                  }`}
                                >
                                  <List
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewMode(
                                      "grid"
                                    )
                                  }
                                  className={`rounded-md p-1.5 transition ${
                                    viewMode ===
                                    "grid"
                                      ? "bg-indigo-100 text-indigo-600"
                                      : "text-slate-400 hover:bg-slate-100"
                                  }`}
                                >
                                  <Grid3X3
                                    size={16}
                                  />
                                </button>

                              </div>

                            </div>

                            {/* TEKS SOAL */}

                            <div className="mb-6">

                              <div className="mb-2 flex flex-wrap items-center gap-2">

                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                  Pertanyaan
                                </span>

                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  {currentSoal?.jenisSoal ===
                                  "pilihan_ganda"
                                    ? "Pilihan Ganda"
                                    : currentSoal?.jenisSoal ===
                                      "benar_salah"
                                    ? "Benar / Salah"
                                    : "Esai"}
                                </span>

                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                                  {formatDecimal(
                                    currentSoal?.poin
                                  )}{" "}
                                  poin
                                </span>

                              </div>

                              <p className="text-sm font-medium leading-7 text-slate-800 sm:text-base">
                                {currentSoal?.teksSoal ||
                                  "-"}
                              </p>

                            </div>

                            {/* PILIHAN GANDA */}

                            {currentSoal?.jenisSoal ===
                              "pilihan_ganda" && (
                              <div className="space-y-2.5">

                                {Array.isArray(
                                  currentSoal?.pilihan
                                ) &&
                                  currentSoal.pilihan.map(
                                    (
                                      option,
                                      optionIndex
                                    ) => {

                                      const value =
                                        getOptionValue(
                                          option
                                        );

                                      const label =
                                        String.fromCharCode(
                                          65 +
                                            optionIndex
                                        );

                                      const selectedValue =
                                        jawaban[
                                          currentSoal
                                            .id
                                        ];

                                      const isSelected =
                                        String(
                                          selectedValue ??
                                            ""
                                        ) ===
                                        String(
                                          value
                                        );

                                      return (
                                        <button
                                          key={`${currentSoal.id}-${optionIndex}`}
                                          type="button"
                                          onClick={() =>
                                            pilihJawaban(
                                              currentSoal.id,
                                              value
                                            )
                                          }
                                          disabled={
                                            submitting
                                          }
                                          className={`w-full rounded-xl border p-3 text-left transition-all sm:p-4 ${
                                            isSelected
                                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                                              : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                                          }`}
                                        >

                                          <div className="flex items-center gap-3">

                                            <span
                                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                isSelected
                                                  ? "bg-indigo-600 text-white"
                                                  : "bg-slate-100 text-slate-600"
                                              }`}
                                            >
                                              {
                                                label
                                              }
                                            </span>

                                            <span
                                              className={`min-w-0 flex-1 text-sm ${
                                                isSelected
                                                  ? "font-semibold text-indigo-700"
                                                  : "text-slate-700"
                                              }`}
                                            >
                                              {
                                                value
                                              }
                                            </span>

                                            {isSelected && (
                                              <CheckCircle
                                                size={
                                                  18
                                                }
                                                className="shrink-0 text-indigo-600"
                                              />
                                            )}

                                          </div>

                                        </button>
                                      );
                                    }
                                  )}

                              </div>
                            )}

                            {/* BENAR SALAH */}

                            {currentSoal?.jenisSoal ===
                              "benar_salah" && (
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                {[
                                  "Benar",
                                  "Salah",
                                ].map(
                                  (
                                    value
                                  ) => {
                                    const isSelected =
                                      String(
                                        jawaban[
                                          currentSoal
                                            .id
                                        ] ??
                                          ""
                                      ).toLowerCase() ===
                                      value.toLowerCase();

                                    return (
                                      <button
                                        key={
                                          value
                                        }
                                        type="button"
                                        onClick={() =>
                                          pilihJawaban(
                                            currentSoal.id,
                                            value
                                          )
                                        }
                                        disabled={
                                          submitting
                                        }
                                        className={`rounded-xl border p-4 text-left transition ${
                                          isSelected
                                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                                            : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-3">

                                          <span
                                            className={`text-sm font-semibold ${
                                              isSelected
                                                ? "text-indigo-700"
                                                : "text-slate-700"
                                            }`}
                                          >
                                            {
                                              value
                                            }
                                          </span>

                                          {isSelected && (
                                            <CheckCircle
                                              size={
                                                18
                                              }
                                              className="text-indigo-600"
                                            />
                                          )}

                                        </div>
                                      </button>
                                    );
                                  }
                                )}

                              </div>
                            )}

                            {/* ESAI */}

                            {currentSoal?.jenisSoal ===
                              "esai" && (
                              <div>

                                <textarea
                                  value={
                                    jawaban[
                                      currentSoal
                                        .id
                                    ] || ""
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    pilihJawaban(
                                      currentSoal.id,
                                      e.target
                                        .value
                                    )
                                  }
                                  disabled={
                                    submitting
                                  }
                                  rows={8}
                                  placeholder="Tuliskan jawaban kamu di sini..."
                                  className="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                />

                                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">

                                  <span>
                                    Jawaban akan
                                    dinilai oleh
                                    guru.
                                  </span>

                                  <span>
                                    {String(
                                      jawaban[
                                        currentSoal
                                          .id
                                      ] || ""
                                    ).length}{" "}
                                    karakter
                                  </span>

                                </div>

                              </div>
                            )}

                            {/* NAVIGASI */}

                            <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">

                              <button
                                type="button"
                                onClick={() =>
                                  goToSoal(
                                    currentIndex -
                                      1
                                  )
                                }
                                disabled={
                                  currentIndex ===
                                  0
                                }
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                              >
                                <ChevronLeft
                                  size={16}
                                />

                                <span>
                                  Sebelumnya
                                </span>
                              </button>

                              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                                {currentIndex +
                                  1}{" "}
                                /{" "}
                                {
                                  soal.length
                                }
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  goToSoal(
                                    currentIndex +
                                      1
                                  )
                                }
                                disabled={
                                  currentIndex ===
                                  soal.length -
                                    1
                                }
                                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:px-4 sm:text-sm"
                              >
                                <span>
                                  Selanjutnya
                                </span>

                                <ChevronRight
                                  size={16}
                                />
                              </button>

                            </div>

                          </section>
                        )}

                      </div>

                      {/* =================================================
                          NAVIGASI SOAL
                      ================================================= */}

                      <aside className="min-w-0 lg:col-span-1">

                        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">

                          <div className="mb-3 flex items-center justify-between">

                            <div>
                              <h3 className="text-sm font-bold text-slate-700">
                                Daftar Soal
                              </h3>

                              <p className="text-[10px] text-slate-400">
                                Pilih nomor
                                soal
                              </p>
                            </div>

                            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                              {
                                answeredCount
                              }
                              /
                              {
                                soal.length
                              }
                            </span>

                          </div>

                          <div
                            className={`grid gap-1.5 ${
                              viewMode ===
                              "grid"
                                ? "grid-cols-5"
                                : "grid-cols-4"
                            }`}
                          >

                            {soal.map(
                              (
                                item,
                                index
                              ) => {

                                const value =
                                  jawaban[
                                    item.id
                                  ];

                                const isAnswered =
                                  value !==
                                    null &&
                                  value !==
                                    undefined &&
                                  String(
                                    value
                                  ).trim() !==
                                    "";

                                const isActive =
                                  index ===
                                  currentIndex;

                                return (
                                  <button
                                    key={
                                      item.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      goToSoal(
                                        index
                                      )
                                    }
                                    className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-semibold transition ${
                                      isActive
                                        ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200"
                                        : isAnswered
                                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    }`}
                                  >
                                    {index +
                                      1}

                                    {isAnswered &&
                                      !isActive && (
                                        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                                          <CheckCircle
                                            size={
                                              8
                                            }
                                            className="text-white"
                                          />
                                        </span>
                                      )}
                                  </button>
                                );
                              }
                            )}

                          </div>

                          {/* LEGEND */}

                          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">

                            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-2">

                              <span className="flex items-center gap-2 text-[11px] text-emerald-700">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                Terjawab
                              </span>

                              <span className="text-xs font-bold text-emerald-700">
                                {
                                  answeredCount
                                }
                              </span>

                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-2.5 py-2">

                              <span className="flex items-center gap-2 text-[11px] text-amber-700">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                Belum
                              </span>

                              <span className="text-xs font-bold text-amber-700">
                                {
                                  unansweredCount
                                }
                              </span>

                            </div>

                          </div>

                          {/* SUBMIT */}

                          <button
                            type="button"
                            onClick={
                              handleSubmit
                            }
                            disabled={
                              submitting
                            }
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {submitting ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Send
                                size={15}
                              />
                            )}

                            Kirim Ujian
                          </button>

                        </div>
                      </aside>

                    </div>
                  </>
                )}

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="border-t border-slate-200 py-4 text-center text-[10px] text-slate-400 sm:text-xs">
                © 2026 SmartSchool •{" "}
                {ujian?.judul ||
                  "Ujian Siswa"}
              </footer>

            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          MODAL TOKEN
      ===================================================== */}

      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <LockKeyhole
                    size={20}
                  />
                </div>

                <div>

                  <h3 className="text-base font-bold text-slate-800">
                    Masukkan Token Ujian
                  </h3>

                  <p className="text-xs text-slate-400">
                    Token diberikan
                    oleh guru
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowTokenModal(
                    false
                  );

                  setError("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

            </div>

            <div className="p-5">

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Token Ujian
              </label>

              <input
                type="text"
                value={token}
                onChange={(e) => {
                  setToken(
                    e.target.value
                      .toUpperCase()
                      .replace(
                        /\s/g,
                        ""
                      )
                  );

                  if (error) {
                    setError("");
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    handleStartUjian();
                  }
                }}
                maxLength={20}
                autoFocus
                placeholder="Masukkan token..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center font-mono text-lg font-bold uppercase tracking-[0.25em] text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">

                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {error}
                  </span>

                </div>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3">

                <Info
                  size={16}
                  className="mt-0.5 shrink-0 text-blue-500"
                />

                <p className="text-[11px] leading-5 text-blue-700">
                  Masukkan token
                  yang diberikan
                  oleh guru untuk
                  memulai ujian.
                </p>

              </div>

            </div>

            <div className="flex gap-2 border-t border-slate-100 p-5">

              <button
                type="button"
                onClick={() => {
                  setShowTokenModal(
                    false
                  );

                  setError("");
                }}
                disabled={
                  starting
                }
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleStartUjian
                }
                disabled={
                  starting ||
                  !token.trim()
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >

                {starting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Memulai...
                  </>
                ) : (
                  <>
                    <BookOpen
                      size={16}
                    />

                    Mulai Ujian
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          MODAL KONFIRMASI
      ===================================================== */}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <AlertTriangle
                  size={27}
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                Kirim Ujian?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kamu sudah menjawab{" "}
                <span className="font-bold text-emerald-600">
                  {answeredCount}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-700">
                  {soal.length}
                </span>{" "}
                soal.
              </p>

              {unansweredCount >
                0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-700">
                    Masih ada{" "}
                    {
                      unansweredCount
                    }{" "}
                    soal yang
                    belum dijawab.
                  </p>
                </div>
              )}

              {unansweredCount ===
                0 && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-semibold text-emerald-700">
                    Semua soal sudah
                    dijawab.
                  </p>
                </div>
              )}

              <p className="mt-4 text-[11px] text-slate-400">
                Setelah dikirim,
                jawaban tidak dapat
                diubah kembali.
              </p>

            </div>

            <div className="mt-6 flex gap-2">

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(
                    false
                  )
                }
                disabled={
                  submitting
                }
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Periksa Lagi
              </button>

              <button
                type="button"
                onClick={
                  confirmSubmit
                }
                disabled={
                  submitting
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >

                {submitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={16} />

                    Kirim Sekarang
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================
   CALENDAR ICON
========================================================= */

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-emerald-500"
    >
      <rect
        width="18"
        height="18"
        x="3"
        y="4"
        rx="2"
      />

      <line
        x1="16"
        x2="16"
        y1="2"
        y2="6"
      />

      <line
        x1="8"
        x2="8"
        y1="2"
        y2="6"
      />

      <line
        x1="3"
        x2="21"
        y1="10"
        y2="10"
      />
    </svg>
  );
}