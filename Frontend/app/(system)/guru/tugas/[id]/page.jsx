"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import { getDetailTugas } from "../../../../services/tugas.service";

import {
  CalendarDays,
  ClipboardList,
  Users,
  ArrowLeft,
  Pencil,
  AlertCircle,
  Loader2,
  BookOpen,
  Clock,
} from "lucide-react";

// ======================================================
// HELPERS
// ======================================================

function formatTanggalWaktu(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTanggal(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusTugas(tugas) {
  if (!tugas?.batasWaktu) return "Terkirim";

  const deadline = new Date(tugas.batasWaktu);

  if (isNaN(deadline.getTime())) return "Terkirim";

  return new Date() > deadline ? "Berakhir" : "Terkirim";
}

const statusBadgeStyle = {
  Terkirim: "bg-blue-50 text-blue-600 border-blue-200",
  Berakhir: "bg-rose-50 text-rose-600 border-rose-200",
};

const statusIcon = {
  Terkirim: ClipboardList,
  Berakhir: AlertCircle,
};

// ======================================================
// MAIN
// ======================================================

export default function DetailTugasPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tugas, setTugas] = useState(null);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ======================================================
  // NOTIFICATION
  // ======================================================

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

  // ======================================================
  // LOAD DETAIL TUGAS
  // ======================================================

  useEffect(() => {
    if (!params?.id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("ID TUGAS:", params.id);

        const response = await getDetailTugas(params.id);

        console.log("RESPONSE DETAIL TUGAS:", response);

        const data =
          response?.data?.data ??
          response?.data ??
          response;

        if (!data) {
          throw new Error("Data tugas tidak ditemukan");
        }

        setTugas(data);
      } catch (err) {
        console.error("ERROR DETAIL TUGAS:", err);

        setError(
          err?.message || "Gagal mengambil detail tugas"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  // ======================================================
  // STATUS
  // ======================================================

  const status = tugas
    ? getStatusTugas(tugas)
    : null;

  const StatusIcon = status
    ? statusIcon[status] || ClipboardList
    : ClipboardList;

  // ======================================================
  // DATA KELAS & MAPEL
  // ======================================================

  const kelasNama =
    tugas?.kelasMapel?.kelas?.nama ||
    "-";

  const mapelNama =
    tugas?.kelasMapel?.mataPelajaran?.nama ||
    "-";

  const guruNama =
    tugas?.kelasMapel?.guruPengajar?.namaLengkap ||
    "-";

  const jumlahPengumpulan =
    tugas?._count?.pengumpulanTugasSiswa ?? 0;

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(!sidebarOpen)
            }
            notifications={notifications}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-4">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-500" />

              <p className="text-sm text-slate-500">
                Memuat data tugas...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(!sidebarOpen)
            }
            notifications={notifications}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                <AlertCircle className="h-6 w-6 text-rose-500" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                Gagal Memuat Tugas
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                onClick={() =>
                  router.push("/guru/tugas")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
              >
                <ArrowLeft size={16} />
                Kembali ke Tugas
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // DATA TIDAK ADA
  // ======================================================

  if (!tugas) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(!sidebarOpen)
            }
            notifications={notifications}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-4">
            <div className="text-center">
              <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />

              <p className="text-sm text-slate-500">
                Data tugas tidak ditemukan.
              </p>

              <button
                onClick={() =>
                  router.push("/guru/tugas")
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* SIDEBAR */}
      <Sidebar
        active="tugas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}
        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(!sidebarOpen)
            }
            notifications={notifications}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />
        </div>

        {/* MAIN */}
        <main className="min-h-0 flex-1 overflow-y-auto">

          <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

            {/* ==================================================
                BACK
            ================================================== */}

            <button
              onClick={() => router.back()}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>

            {/* ==================================================
                TITLE CARD
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="p-5 sm:p-6 lg:p-7">

                {/* TOP */}
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  {/* TITLE */}
                  <div className="flex min-w-0 items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ClipboardList size={21} />
                    </div>

                    <div className="min-w-0">

                      <h1 className="break-words text-xl font-semibold leading-tight text-slate-800 sm:text-2xl">
                        {tugas.judul || "Tanpa judul"}
                      </h1>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">

                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen
                            size={14}
                            className="text-slate-400"
                          />

                          {mapelNama}
                        </span>

                        <span className="hidden text-slate-300 sm:inline">
                          •
                        </span>

                        <span>
                          {kelasNama}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                      statusBadgeStyle[status] ||
                      "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    <StatusIcon size={13} />

                    {status}
                  </span>
                </div>

                {/* ==================================================
                    INFO GRID
                ================================================== */}

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {/* KELAS */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <div className="flex items-center gap-2">
                      <Users
                        size={16}
                        className="text-blue-500"
                      />

                      <span className="text-xs font-medium text-slate-400">
                        Kelas
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm font-semibold text-slate-700">
                      {kelasNama}
                    </p>
                  </div>

                  {/* MAPEL */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <div className="flex items-center gap-2">
                      <BookOpen
                        size={16}
                        className="text-blue-500"
                      />

                      <span className="text-xs font-medium text-slate-400">
                        Mata Pelajaran
                      </span>
                    </div>

                    <p className="mt-2 break-words text-sm font-semibold text-slate-700">
                      {mapelNama}
                    </p>
                  </div>

                  {/* PENGUMPULAN */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <div className="flex items-center gap-2">
                      <ClipboardList
                        size={16}
                        className="text-blue-500"
                      />

                      <span className="text-xs font-medium text-slate-400">
                        Pengumpulan
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {jumlahPengumpulan} siswa
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* ==================================================
                CONTENT GRID
            ================================================== */}

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

              {/* ==================================================
                  DESKRIPSI
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

                  <div className="flex items-center gap-2">
                    <ClipboardList
                      size={18}
                      className="text-blue-500"
                    />

                    <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
                      Deskripsi Tugas
                    </h2>
                  </div>

                </div>

                <div className="p-5 sm:p-6">

                  <div className="min-h-[140px] rounded-xl bg-slate-50 p-4 sm:p-5">

                    <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                      {tugas.deskripsi ||
                        "Tidak ada deskripsi tugas."}
                    </p>

                  </div>

                </div>
              </section>

              {/* ==================================================
                  INFORMASI
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4">

                  <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
                    Informasi Tugas
                  </h2>

                </div>

                <div className="divide-y divide-slate-100">

                  {/* KELAS */}
                  <div className="flex items-start gap-3 px-5 py-4">

                    <Users
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-xs text-slate-400">
                        Kelas
                      </p>

                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {kelasNama}
                      </p>

                    </div>
                  </div>

                  {/* MAPEL */}
                  <div className="flex items-start gap-3 px-5 py-4">

                    <BookOpen
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-xs text-slate-400">
                        Mata Pelajaran
                      </p>

                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {mapelNama}
                      </p>

                    </div>
                  </div>

                  {/* DEADLINE */}
                  <div className="flex items-start gap-3 px-5 py-4">

                    <CalendarDays
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-xs text-slate-400">
                        Batas Pengumpulan
                      </p>

                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {formatTanggal(
                          tugas.batasWaktu
                        )}
                      </p>

                    </div>
                  </div>

                  {/* JAM */}
                  <div className="flex items-start gap-3 px-5 py-4">

                    <Clock
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-xs text-slate-400">
                        Waktu
                      </p>

                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {formatJam(
                          tugas.batasWaktu
                        )}{" "}
                        WIB
                      </p>

                    </div>
                  </div>

                  {/* GURU */}
                  <div className="flex items-start gap-3 px-5 py-4">

                    <Users
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-xs text-slate-400">
                        Guru Pengajar
                      </p>

                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {guruNama}
                      </p>

                    </div>
                  </div>

                </div>
              </section>
            </div>

            {/* ==================================================
                ACTION
            ================================================== */}

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Kelola Tugas
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Ubah informasi tugas atau lihat hasil
                    pengumpulan siswa.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">

                  {/* EDIT */}
                  <button
                    onClick={() =>
                      router.push(
                        `/guru/tugas/${tugas.id}/edit`
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
                  >
                    <Pencil size={16} />
                    Edit Tugas
                  </button>

                  {/* NILAI */}
                  <button
                    onClick={() =>
                      router.push(
                        `/guru/tugas/${tugas.id}/nilai`
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Users size={16} />
                    Lihat Nilai
                  </button>

                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}