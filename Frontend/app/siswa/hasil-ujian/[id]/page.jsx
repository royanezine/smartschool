"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MinusCircle,
  Trophy,
  XCircle,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

async function getUjianById(id) {
  if (!id) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const response = await fetch(
    `${API_URL}/api/v1/ujian/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      cache: "no-store",
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Server mengembalikan response yang tidak valid."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Gagal mengambil hasil ujian."
    );
  }

  return data;
}

/* =========================================================
   NORMALIZER RESPONSE UTAMA
========================================================= */

function normalizeObjectResponse(response) {
  if (!response) {
    return null;
  }

  if (
    response?.data?.data !== undefined &&
    response?.data?.data !== null
  ) {
    return response.data.data;
  }

  if (
    response?.data !== undefined &&
    response?.data !== null &&
    typeof response.data === "object"
  ) {
    return response.data;
  }

  if (
    response?.result?.data !== undefined &&
    response?.result?.data !== null
  ) {
    return response.result.data;
  }

  if (
    response?.result !== undefined &&
    response?.result !== null &&
    typeof response.result === "object"
  ) {
    return response.result;
  }

  return response;
}

/* =========================================================
   NORMALIZE HASIL UJIAN
========================================================= */

function normalizeHasilUjian(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }

    return normalizeHasilUjian(value[0]);
  }

  if (
    value?.data?.data &&
    typeof value.data.data === "object"
  ) {
    return normalizeHasilUjian(
      value.data.data
    );
  }

  if (
    value?.data &&
    typeof value.data === "object" &&
    !Array.isArray(value.data)
  ) {
    return normalizeHasilUjian(
      value.data
    );
  }

  if (
    value?.hasilAsesmen &&
    typeof value.hasilAsesmen === "object"
  ) {
    return normalizeHasilUjian(
      value.hasilAsesmen
    );
  }

  if (
    value?.hasilUjian &&
    typeof value.hasilUjian === "object"
  ) {
    return normalizeHasilUjian(
      value.hasilUjian
    );
  }

  if (
    value?.hasil_ujian &&
    typeof value.hasil_ujian === "object"
  ) {
    return normalizeHasilUjian(
      value.hasil_ujian
    );
  }

  if (
    value?.hasil &&
    typeof value.hasil === "object"
  ) {
    return normalizeHasilUjian(
      value.hasil
    );
  }

  if (
    value?.result &&
    typeof value.result === "object"
  ) {
    return normalizeHasilUjian(
      value.result
    );
  }

  return value;
}

/* =========================================================
   CEK APAKAH OBJECT MERUPAKAN HASIL UJIAN
========================================================= */

function isValidHasilUjian(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  return (
    value.totalNilai !== undefined ||
    value.total_nilai !== undefined ||
    value.nilai !== undefined ||
    value.jumlahBenar !== undefined ||
    value.jumlah_benar !== undefined ||
    value.jumlahSalah !== undefined ||
    value.jumlah_salah !== undefined ||
    value.jumlahLewati !== undefined ||
    value.jumlah_lewati !== undefined
  );
}

/* =========================================================
   CARI HASIL UJIAN DARI BERBAGAI STRUKTUR RESPONSE
========================================================= */

function getResultData(ujian, percobaan) {
  const candidates = [
    percobaan?.hasilAsesmen,
    percobaan?.hasilUjian,
    percobaan?.hasil_ujian,
    percobaan?.hasil,
    percobaan?.result,

    ujian?.hasilAsesmen,
    ujian?.hasilUjian,
    ujian?.hasil_ujian,
    ujian?.hasil,
    ujian?.result,

    percobaan?.data?.hasilAsesmen,
    percobaan?.data?.hasilUjian,
    percobaan?.data?.hasil,
    percobaan?.data?.result,

    ujian?.data?.hasilAsesmen,
    ujian?.data?.hasilUjian,
    ujian?.data?.hasil,
    ujian?.data?.result,
  ];

  for (const candidate of candidates) {
    const normalized =
      normalizeHasilUjian(candidate);

    if (
      isValidHasilUjian(normalized)
    ) {
      return normalized;
    }
  }

  if (
    isValidHasilUjian(percobaan)
  ) {
    return percobaan;
  }

  if (
    isValidHasilUjian(ujian)
  ) {
    return ujian;
  }

  return null;
}

/* =========================================================
   AMBIL HASIL DARI LOCAL STORAGE
========================================================= */

function getSavedHasilUjian(id) {
  if (
    typeof window === "undefined" ||
    !id
  ) {
    return null;
  }

  const keys = [
    `hasil-ujian-${id}`,
    `hasil-asesmen-${id}`,
  ];

  const storages = [
    window.sessionStorage,
    window.localStorage,
  ];

  for (const storage of storages) {
    for (const key of keys) {
      try {
        const raw =
          storage.getItem(key);

        if (!raw) {
          continue;
        }

        const parsed =
          JSON.parse(raw);

        if (!parsed) {
          continue;
        }

        if (
          parsed?.ujianId &&
          String(parsed.ujianId) !==
            String(id)
        ) {
          continue;
        }

        const hasil =
          normalizeHasilUjian(
            parsed?.hasilAsesmen ??
              parsed?.hasilUjian ??
              parsed?.hasil ??
              parsed
          );

        if (
          isValidHasilUjian(hasil)
        ) {
          return {
            ...parsed,
            hasil,
          };
        }
      } catch {
        // ignore
      }
    }
  }

  try {
    const raw =
      localStorage.getItem(
        "hasil-ujian-last"
      );

    if (raw) {
      const parsed =
        JSON.parse(raw);

      if (
        parsed?.ujianId &&
        String(parsed.ujianId) ===
          String(id)
      ) {
        const hasil =
          normalizeHasilUjian(
            parsed?.hasilAsesmen ??
              parsed?.hasilUjian ??
              parsed?.hasil ??
              parsed
          );

        if (
          isValidHasilUjian(hasil)
        ) {
          return {
            ...parsed,
            hasil,
          };
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/* =========================================================
   GET VALUE HELPER
========================================================= */

function firstValidNumber(...values) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      const number =
        Number(value);

      if (
        !Number.isNaN(number)
      ) {
        return number;
      }
    }
  }

  return 0;
}

/* =========================================================
   GET SCORE
========================================================= */

function getScore(ujian, percobaan) {
  const hasil =
    getResultData(
      ujian,
      percobaan
    );

  return firstValidNumber(
    hasil?.totalNilai,
    hasil?.total_nilai,
    hasil?.nilai,

    percobaan?.nilai,
    percobaan?.totalNilai,
    percobaan?.total_nilai,

    ujian?.totalNilai,
    ujian?.total_nilai,
    ujian?.nilai
  );
}

/* =========================================================
   JUMLAH BENAR
========================================================= */

function getJumlahBenar(
  ujian,
  percobaan
) {
  const hasil =
    getResultData(
      ujian,
      percobaan
    );

  return firstValidNumber(
    hasil?.jumlahBenar,
    hasil?.jumlah_benar,

    percobaan?.jumlahBenar,
    percobaan?.jumlah_benar
  );
}

/* =========================================================
   JUMLAH SALAH
========================================================= */

function getJumlahSalah(
  ujian,
  percobaan
) {
  const hasil =
    getResultData(
      ujian,
      percobaan
    );

  return firstValidNumber(
    hasil?.jumlahSalah,
    hasil?.jumlah_salah,

    percobaan?.jumlahSalah,
    percobaan?.jumlah_salah
  );
}

/* =========================================================
   JUMLAH LEWATI
========================================================= */

function getJumlahLewati(
  ujian,
  percobaan
) {
  const hasil =
    getResultData(
      ujian,
      percobaan
    );

  return firstValidNumber(
    hasil?.jumlahLewati,
    hasil?.jumlah_lewati,

    percobaan?.jumlahLewati,
    percobaan?.jumlah_lewati
  );
}

/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {
  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return "0";
  }

  if (
    Number.isInteger(number)
  ) {
    return String(number);
  }

  return number.toFixed(2);
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateTime(
  dateString
) {
  if (!dateString) {
    return "-";
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* =========================================================
   STATUS
========================================================= */

function getStatusLabel(
  status
) {
  const normalized =
    String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "_");

  if (
    normalized === "selesai" ||
    normalized === "dikumpulkan" ||
    normalized === "completed" ||
    normalized === "finished"
  ) {
    return "Selesai";
  }

  if (
    normalized === "berlangsung" ||
    normalized ===
      "sedang_mengerjakan" ||
    normalized === "in_progress" ||
    normalized === "ongoing"
  ) {
    return "Sedang Mengerjakan";
  }

  return "Belum Selesai";
}

/* =========================================================
   CARI PERCOBAAN DARI DETAIL UJIAN
========================================================= */

function getPercobaanFromUjian(
  ujian
) {
  if (!ujian) {
    return null;
  }

  const daftarPercobaan =
    Array.isArray(
      ujian?.percobaanUjian
    )
      ? ujian.percobaanUjian
      : Array.isArray(
          ujian?.percobaanAsesmen
        )
      ? ujian.percobaanAsesmen
      : [];

  if (
    daftarPercobaan.length === 0
  ) {
    return null;
  }

  const selesai =
    daftarPercobaan.find(
      (item) => {
        const status =
          String(
            item?.status || ""
          )
            .toLowerCase()
            .replace(/\s+/g, "_");

        return (
          status === "selesai" ||
          status ===
            "dikumpulkan" ||
          status === "completed" ||
          status === "finished"
        );
      }
    );

  return (
    selesai ||
    daftarPercobaan[0]
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function HasilUjianPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(
    params?.id
  )
    ? params.id[0]
    : params?.id;

  /* =======================================================
     STATE
  ======================================================= */

  const [ujian, setUjian] =
    useState(null);

  const [savedHasil, setSavedHasil] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadHasil =
    useCallback(
      async () => {
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

          const localHasil =
            getSavedHasilUjian(id);

          if (localHasil) {
            setSavedHasil(
              localHasil
            );
          }

          const response =
            await getUjianById(id);

          const data =
            normalizeObjectResponse(
              response
            );

          if (!data?.id) {
            throw new Error(
              "Data ujian tidak ditemukan."
            );
          }

          setUjian(data);

          if (!localHasil) {
            const percobaan =
              getPercobaanFromUjian(
                data
              );

            const hasilApi =
              getResultData(
                data,
                percobaan
              );

            if (hasilApi) {
              setSavedHasil({
                ujianId: id,
                sesiId:
                  percobaan?.id ||
                  percobaan?.percobaanUjianId ||
                  percobaan?.percobaanAsesmenId ||
                  null,
                submittedAt:
                  percobaan?.selesaiPada ||
                  percobaan?.diperbaruiPada ||
                  null,
                hasil: hasilApi,
                response: response,
              });
            }
          }
        } catch (err) {
          console.error(
            "LOAD HASIL UJIAN ERROR:",
            err
          );

          setError(
            err?.message ||
              "Gagal mengambil hasil ujian."
          );
        } finally {
          setLoading(false);
        }
      },
      [id]
    );

  useEffect(() => {
    loadHasil();
  }, [loadHasil]);

  /* =======================================================
     PERCOBAAN SISWA
  ======================================================= */

  const percobaanSaya =
    useMemo(() => {
      if (
        savedHasil?.sesiId
      ) {
        const dariApi =
          getPercobaanFromUjian(
            ujian
          );

        if (
          dariApi &&
          String(
            dariApi?.id
          ) ===
            String(
              savedHasil.sesiId
            )
        ) {
          return dariApi;
        }

        return {
          id: savedHasil.sesiId,
          percobaanUjianId:
            savedHasil.sesiId,
          status: "selesai",
          nilai:
            savedHasil?.hasil
              ?.totalNilai ??
            savedHasil?.hasil
              ?.total_nilai ??
            savedHasil?.hasil
              ?.nilai ??
            0,
          dimulaiPada: null,
          selesaiPada:
            savedHasil?.submittedAt ||
            null,
          hasilAsesmen:
            savedHasil?.hasil,
          hasilUjian:
            savedHasil?.hasil,
        };
      }

      return getPercobaanFromUjian(
        ujian
      );
    }, [
      ujian,
      savedHasil,
    ]);

  /* =======================================================
     HASIL UJIAN
  ======================================================= */

  const hasilUjian =
    useMemo(() => {
      if (
        savedHasil?.hasil &&
        isValidHasilUjian(
          savedHasil.hasil
        )
      ) {
        return savedHasil.hasil;
      }

      return getResultData(
        ujian,
        percobaanSaya
      );
    }, [
      ujian,
      percobaanSaya,
      savedHasil,
    ]);

  /* =======================================================
     NILAI
  ======================================================= */

  const nilaiNumber =
    useMemo(() => {
      return firstValidNumber(
        hasilUjian?.totalNilai,
        hasilUjian?.total_nilai,
        hasilUjian?.nilai,

        savedHasil?.hasil
          ?.totalNilai,
        savedHasil?.hasil
          ?.total_nilai,
        savedHasil?.hasil
          ?.nilai,

        percobaanSaya?.nilai
      );
    }, [
      hasilUjian,
      savedHasil,
      percobaanSaya,
    ]);

  /* =======================================================
     JUMLAH BENAR
  ======================================================= */

  const jumlahBenar =
    useMemo(() => {
      return firstValidNumber(
        hasilUjian?.jumlahBenar,
        hasilUjian?.jumlah_benar,

        savedHasil?.hasil
          ?.jumlahBenar,
        savedHasil?.hasil
          ?.jumlah_benar,

        percobaanSaya?.jumlahBenar,
        percobaanSaya?.jumlah_benar
      );
    }, [
      hasilUjian,
      savedHasil,
      percobaanSaya,
    ]);

  /* =======================================================
     JUMLAH SALAH
  ======================================================= */

  const jumlahSalah =
    useMemo(() => {
      return firstValidNumber(
        hasilUjian?.jumlahSalah,
        hasilUjian?.jumlah_salah,

        savedHasil?.hasil
          ?.jumlahSalah,
        savedHasil?.hasil
          ?.jumlah_salah,

        percobaanSaya?.jumlahSalah,
        percobaanSaya?.jumlah_salah
      );
    }, [
      hasilUjian,
      savedHasil,
      percobaanSaya,
    ]);

  /* =======================================================
     JUMLAH LEWATI
  ======================================================= */

  const jumlahLewati =
    useMemo(() => {
      return firstValidNumber(
        hasilUjian?.jumlahLewati,
        hasilUjian?.jumlah_lewati,

        savedHasil?.hasil
          ?.jumlahLewati,
        savedHasil?.hasil
          ?.jumlah_lewati,

        percobaanSaya?.jumlahLewati,
        percobaanSaya?.jumlah_lewati
      );
    }, [
      hasilUjian,
      savedHasil,
      percobaanSaya,
    ]);

  /* =======================================================
     TOTAL SOAL
  ======================================================= */

  const totalSoal =
    useMemo(() => {
      const dariSoal =
        Array.isArray(
          ujian?.soalUjian
        )
          ? ujian.soalUjian.length
          : Array.isArray(
              ujian?.soalAsesmen
            )
          ? ujian.soalAsesmen.length
          : 0;

      if (dariSoal > 0) {
        return dariSoal;
      }

      const dariBackend =
        firstValidNumber(
          hasilUjian?.totalSoal,
          hasilUjian?.total_soal,

          percobaanSaya?.totalSoal,
          percobaanSaya?.total_soal
        );

      if (dariBackend > 0) {
        return dariBackend;
      }

      return (
        jumlahBenar +
        jumlahSalah +
        jumlahLewati
      );
    }, [
      ujian,
      hasilUjian,
      percobaanSaya,
      jumlahBenar,
      jumlahSalah,
      jumlahLewati,
    ]);

  /* =======================================================
     NILAI KELULUSAN
  ======================================================= */

  const nilaiKelulusan =
    firstValidNumber(
      ujian?.nilaiKelulusan,
      ujian?.nilai_kelulusan
    );

  const lulus =
    nilaiNumber >=
    nilaiKelulusan;

  /* =======================================================
     STATUS
  ======================================================= */

  const status =
    getStatusLabel(
      percobaanSaya?.status ||
        savedHasil?.status ||
        "selesai"
    );

  /* =======================================================
     TANGGAL SELESAI
  ======================================================= */

  const tanggalSelesai =
    savedHasil?.submittedAt ||
    hasilUjian?.dibuatPada ||
    hasilUjian?.dibuat_pada ||
    percobaanSaya?.selesaiPada ||
    percobaanSaya?.selesai_pada ||
    percobaanSaya?.diperbaruiPada ||
    null;

  /* =======================================================
     PERSENTASE NILAI
  ======================================================= */

  const progressNilai =
    Math.min(
      Math.max(
        Number(nilaiNumber) || 0,
        0
      ),
      100
    );

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
              name: "Siswa",
              email:
                "siswa@smartschool.com",
              avatar: "S",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <Loader2
                  size={28}
                  className="animate-spin text-[#155DFC]"
                />
              </div>

              <h2 className="mt-5 text-base font-bold text-slate-800">
                Memuat hasil ujian
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sedang mengambil data hasil
                pengerjaan kamu.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
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
              name: "Siswa",
              email:
                "siswa@smartschool.com",
              avatar: "S",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <AlertCircle
                  size={28}
                />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-800">
                Hasil belum dapat dimuat
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/siswa/ujian"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={
                    loadHasil
                  }
                  className="rounded-xl bg-[#155DFC] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D47C9]"
                >
                  Coba Lagi
                </button>
              </div>
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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsSidebarCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Siswa",
            email:
              "siswa@smartschool.com",
            avatar: "S",
          }}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

            {/* =================================================
                BACK
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/siswa/ujian"
                )
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#155DFC]"
            >
              <ArrowLeft size={17} />
              Kembali ke Daftar Ujian
            </button>

            {/* =================================================
                HERO RESULT
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* top accent */}
              <div className="h-1.5 bg-gradient-to-r from-[#155DFC] via-[#3B82F6] to-[#60A5FA]" />

              <div className="relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

                {/* decorative background */}
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-50/80 blur-2xl" />

                <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-indigo-50/70 blur-2xl" />

                <div className="relative">

                  <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                    {/* title */}
                    <div className="min-w-0">

                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#155DFC]">
                        <CheckCircle2
                          size={14}
                        />
                        Ujian Selesai
                      </div>

                      <h1 className="max-w-2xl text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-[34px]">
                        {ujian?.judul ||
                          "Hasil Ujian"}
                      </h1>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        Pengerjaan ujian kamu
                        telah selesai. Berikut
                        adalah ringkasan hasil yang
                        berhasil diperoleh.
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                          <BookOpen
                            size={14}
                            className="text-[#155DFC]"
                          />
                          {ujian
                            ?.kelasMapel
                            ?.mataPelajaran
                            ?.nama ||
                            "Mata Pelajaran"}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                          <FileText
                            size={14}
                            className="text-slate-400"
                          />
                          {ujian
                            ?.kelasMapel
                            ?.kelas
                            ?.nama ||
                            "Kelas"}
                        </span>
                      </div>
                    </div>

                    {/* score */}
                    <div className="shrink-0 lg:w-[250px]">

                      <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#155DFC] shadow-sm">
                          {lulus ? (
                            <Trophy
                              size={23}
                            />
                          ) : (
                            <Award
                              size={23}
                            />
                          )}
                        </div>

                        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Nilai Akhir
                        </p>

                        <div className="mt-1 flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-black tracking-tight text-[#155DFC]">
                            {formatNumber(
                              nilaiNumber
                            )}
                          </span>

                          <span className="text-sm font-bold text-slate-400">
                            /100
                          </span>
                        </div>

                        <div className="mx-auto mt-4 h-2 max-w-[180px] overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#155DFC] transition-all duration-700"
                            style={{
                              width: `${progressNilai}%`,
                            }}
                          />
                        </div>

                        <div className="mt-4">
                          {lulus ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2
                                size={14}
                              />
                              Lulus
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-700">
                              <XCircle
                                size={14}
                              />
                              Belum Lulus
                            </span>
                          )}
                        </div>

                        {nilaiKelulusan > 0 && (
                          <p className="mt-3 text-[11px] text-slate-400">
                            Minimal kelulusan{" "}
                            <span className="font-bold text-slate-600">
                              {formatNumber(
                                nilaiKelulusan
                              )}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="mt-5 grid gap-4 sm:grid-cols-3">

              <ResultStat
                icon={
                  <CheckCircle2
                    size={19}
                  />
                }
                label="Jawaban Benar"
                value={jumlahBenar}
                description={
                  totalSoal > 0
                    ? `${Math.round(
                        (jumlahBenar /
                          totalSoal) *
                          100
                      )}% dari total soal`
                    : "Tidak tersedia"
                }
                tone="emerald"
              />

              <ResultStat
                icon={
                  <XCircle
                    size={19}
                  />
                }
                label="Jawaban Salah"
                value={jumlahSalah}
                description={
                  totalSoal > 0
                    ? `${Math.round(
                        (jumlahSalah /
                          totalSoal) *
                          100
                      )}% dari total soal`
                    : "Tidak tersedia"
                }
                tone="rose"
              />

              <ResultStat
                icon={
                  <MinusCircle
                    size={19}
                  />
                }
                label="Tidak Dijawab"
                value={jumlahLewati}
                description={
                  totalSoal > 0
                    ? `${Math.round(
                        (jumlahLewati /
                          totalSoal) *
                          100
                      )}% dari total soal`
                    : "Tidak tersedia"
                }
                tone="amber"
              />

            </section>

            {/* =================================================
                CONTENT GRID
            ================================================= */}

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">

              {/* =================================================
                  DETAIL UJIAN
              ================================================= */}

              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={
                    <BookOpen
                      size={19}
                    />
                  }
                  title="Detail Ujian"
                  description="Informasi mengenai ujian yang kamu kerjakan"
                />

                <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">

                  <InfoCard
                    icon={
                      <BookOpen
                        size={17}
                      />
                    }
                    label="Mata Pelajaran"
                    value={
                      ujian
                        ?.kelasMapel
                        ?.mataPelajaran
                        ?.nama || "-"
                    }
                    tone="blue"
                  />

                  <InfoCard
                    icon={
                      <FileText
                        size={17}
                      />
                    }
                    label="Kelas"
                    value={
                      ujian
                        ?.kelasMapel
                        ?.kelas
                        ?.nama || "-"
                    }
                    tone="indigo"
                  />

                  <InfoCard
                    icon={
                      <FileText
                        size={17}
                      />
                    }
                    label="Jumlah Soal"
                    value={`${totalSoal} soal`}
                    tone="emerald"
                  />

                  <InfoCard
                    icon={
                      <Clock3
                        size={17}
                      />
                    }
                    label="Durasi"
                    value={`${ujian?.durasi || 0} menit`}
                    tone="amber"
                  />

                </div>
              </section>

              {/* =================================================
                  RINGKASAN
              ================================================= */}

              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={
                    <Award
                      size={19}
                    />
                  }
                  title="Ringkasan Nilai"
                  description="Performa pengerjaan kamu"
                />

                <div className="p-5 sm:p-6">

                  <div className="rounded-2xl bg-slate-50 p-4">

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Nilai diperoleh
                      </span>

                      <span className="text-sm font-black text-[#155DFC]">
                        {formatNumber(
                          nilaiNumber
                        )}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#155DFC]"
                        style={{
                          width: `${progressNilai}%`,
                        }}
                      />
                    </div>

                    {nilaiKelulusan > 0 && (
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Nilai kelulusan
                        </span>

                        <span className="font-bold text-slate-600">
                          {formatNumber(
                            nilaiKelulusan
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">

                    <MiniResultRow
                      icon={
                        <CheckCircle2
                          size={15}
                        />
                      }
                      label="Benar"
                      value={jumlahBenar}
                      tone="emerald"
                    />

                    <MiniResultRow
                      icon={
                        <XCircle
                          size={15}
                        />
                      }
                      label="Salah"
                      value={jumlahSalah}
                      tone="rose"
                    />

                    <MiniResultRow
                      icon={
                        <MinusCircle
                          size={15}
                        />
                      }
                      label="Tidak dijawab"
                      value={jumlahLewati}
                      tone="amber"
                    />

                  </div>
                </div>
              </section>
            </div>

            {/* =================================================
                WAKTU PENGERJAAN
            ================================================= */}

            {percobaanSaya && (
              <section className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-sm">

                <SectionHeader
                  icon={
                    <CalendarDays
                      size={19}
                    />
                  }
                  title="Waktu Pengerjaan"
                  description="Informasi sesi pengerjaan ujian"
                />

                <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                  <TimeInfo
                    label="Mulai"
                    value={formatDateTime(
                      percobaanSaya?.dimulaiPada
                    )}
                  />

                  <TimeInfo
                    label="Selesai"
                    value={formatDateTime(
                      percobaanSaya?.selesaiPada ||
                        tanggalSelesai
                    )}
                  />

                  <div className="p-5 sm:p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </p>

                    <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {status}
                    </span>
                  </div>

                </div>
              </section>
            )}

            {/* =================================================
                RESULT NOT FOUND
            ================================================= */}

            {!percobaanSaya &&
              !hasilUjian && (
                <section className="mt-5 rounded-3xl border border-amber-200 bg-amber-50/70 p-5">

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                      <AlertCircle
                        size={18}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-amber-800">
                        Data hasil belum ditemukan
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        Backend belum mengirim data
                        percobaan atau hasil ujian
                        untuk sesi ini.
                      </p>
                    </div>

                  </div>
                </section>
              )}

            {/* =================================================
                DATA STATUS
            ================================================= */}

            {percobaanSaya && (
              <section className="mt-5 rounded-3xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#155DFC] shadow-sm">
                      <CheckCircle2
                        size={17}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#155DFC]">
                        Hasil berhasil ditemukan
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Data hasil pengerjaan tersedia
                        untuk sesi ujian ini.
                      </p>
                    </div>

                  </div>

                  <div className="rounded-xl bg-white px-3 py-2 sm:text-right">

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Percobaan ID
                    </p>

                    <p className="mt-0.5 max-w-[230px] truncate text-[11px] font-bold text-slate-600">
                      {percobaanSaya?.id ||
                        percobaanSaya?.percobaanUjianId ||
                        "-"}
                    </p>

                  </div>

                </div>
              </section>
            )}

            {/* =================================================
                ACTION
            ================================================= */}

            <div className="mt-6 flex justify-center">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/siswa/ujian"
                  )
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#155DFC] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0D47C9] hover:shadow-md sm:w-auto"
              >
                <ArrowLeft
                  size={17}
                />
                Kembali ke Daftar Ujian
              </button>

            </div>

            <footer className="py-7 text-center text-[11px] text-slate-400">
              © 2026 SmartSchool
              <span className="mx-1.5">
                •
              </span>
              Hasil Ujian
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   RESULT STAT
========================================================= */

function ResultStat({
  icon,
  label,
  value,
  description,
  tone,
}) {
  const styles = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
    },
    rose: {
      icon: "bg-rose-50 text-rose-600",
      value: "text-rose-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      value: "text-amber-700",
    },
  };

  const current =
    styles[tone] ||
    styles.emerald;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-xs font-semibold text-slate-400">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-black ${current.value}`}
          >
            {formatNumber(value)}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {description}
        </p>
      </div>

    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon,
  label,
  value,
  tone = "blue",
}) {
  const tones = {
    blue: {
      icon: "bg-blue-50 text-[#155DFC]",
    },
    indigo: {
      icon: "bg-indigo-50 text-indigo-600",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
    },
  };

  const current =
    tones[tone] ||
    tones.blue;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-100 hover:bg-blue-50/30">

      <div className="flex items-center gap-2.5">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-700">
            {value}
          </p>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MINI RESULT ROW
========================================================= */

function MiniResultRow({
  icon,
  label,
  value,
  tone,
}) {
  const styles = {
    emerald:
      "bg-emerald-50 text-emerald-600",
    rose:
      "bg-rose-50 text-rose-600",
    amber:
      "bg-amber-50 text-amber-600",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2.5">

      <div className="flex items-center gap-2">

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            styles[tone] ||
            styles.emerald
          }`}
        >
          {icon}
        </div>

        <span className="text-xs font-semibold text-slate-600">
          {label}
        </span>

      </div>

      <span className="text-sm font-black text-slate-800">
        {formatNumber(value)}
      </span>

    </div>
  );
}

/* =========================================================
   TIME INFO
========================================================= */

function TimeInfo({
  label,
  value,
}) {
  return (
    <div className="p-5 sm:p-6">

      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
        {value}
      </p>

    </div>
  );
}