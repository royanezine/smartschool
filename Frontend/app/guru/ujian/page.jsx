"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ClipboardList,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Clock3,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ListChecks,
  ChevronDown,
  GraduationCap,
  FileQuestion,
} from "lucide-react";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import { getKelasMapel } from "../../../services/kelasMapel.service";

import {
  getUjianByKelasMapel,
  deleteUjian,
} from "../../../services/ujian.service";

/* =========================================================
   HELPER
========================================================= */

function parseData(response) {
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

function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function getCurrentUserId() {
  const user = getCurrentUser();

  return (
    user?.id ||
    user?.userId ||
    user?.penggunaId ||
    null
  );
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getJenisLabel(jenis) {
  const map = {
    UTS: "UTS",
    UAS: "UAS",
    Kuis: "Kuis",
    Harian: "Harian",
    Lainnya: "Lainnya",

    uts: "UTS",
    uas: "UAS",
    kuis: "Kuis",
    harian: "Harian",
    lainnya: "Lainnya",
  };

  return map[jenis] || jenis || "-";
}

/* =========================================================
   PAGE
========================================================= */

export default function UjianGuruPage() {
  const router = useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [kelasMapel, setKelasMapel] = useState([]);

  const [selectedKelasMapel, setSelectedKelasMapel] =
    useState("");

  const [ujian, setUjian] = useState([]);

  const [search, setSearch] = useState("");

  const [loadingKelasMapel, setLoadingKelasMapel] =
    useState(true);

  const [loadingUjian, setLoadingUjian] =
    useState(false);

  const [error, setError] = useState("");

  const [deleteLoading, setDeleteLoading] =
    useState(null);

  /* =======================================================
     LOAD KELAS MAPEL
  ======================================================= */

  useEffect(() => {
    loadKelasMapel();
  }, []);

  async function loadKelasMapel() {
    try {
      setLoadingKelasMapel(true);
      setError("");

      setSelectedKelasMapel("");
      setUjian([]);

      const response = await getKelasMapel();

      const data = parseData(response);

      const userId = getCurrentUserId();

      const filtered = userId
        ? data.filter((item) => {
            const guruId =
              item?.guruPengajarId ||
              item?.guruPengajar?.id ||
              "";

            return (
              String(guruId) ===
              String(userId)
            );
          })
        : [];

      setKelasMapel(filtered);

      if (filtered.length > 0) {
        setSelectedKelasMapel(
          String(filtered[0].id)
        );
      }
    } catch (err) {
      console.error(
        "LOAD KELAS MAPEL ERROR:",
        err
      );

      setKelasMapel([]);
      setSelectedKelasMapel("");
      setUjian([]);

      setError(
        err?.message ||
          "Gagal mengambil data kelas dan mata pelajaran."
      );
    } finally {
      setLoadingKelasMapel(false);
    }
  }

  /* =======================================================
     LOAD UJIAN
  ======================================================= */

  useEffect(() => {
    if (!selectedKelasMapel) {
      setUjian([]);
      return;
    }

    loadUjian(selectedKelasMapel);
  }, [selectedKelasMapel]);

  async function loadUjian(kelasMapelId) {
    if (!kelasMapelId) {
      setUjian([]);
      return;
    }

    try {
      setLoadingUjian(true);
      setError("");

      const response =
        await getUjianByKelasMapel(
          kelasMapelId
        );

      const data = parseData(response);

      /*
       * Backend mengirim:
       *
       * _count: {
       *   soalAsesmen: 2,
       *   percobaanAsesmen: 1
       * }
       *
       * Jadi kita pertahankan response BE
       * dan gunakan nama field tersebut di FE.
       */

      setUjian(data);
    } catch (err) {
      console.error(
        "LOAD UJIAN ERROR:",
        err
      );

      setUjian([]);

      setError(
        err?.message ||
          "Gagal mengambil data ujian."
      );
    } finally {
      setLoadingUjian(false);
    }
  }

  /* =======================================================
     SELECTED KELAS MAPEL
  ======================================================= */

  const selectedData = useMemo(() => {
    return kelasMapel.find(
      (item) =>
        String(item?.id) ===
        String(selectedKelasMapel)
    );
  }, [
    kelasMapel,
    selectedKelasMapel,
  ]);

  /* =======================================================
     FILTER SEARCH
  ======================================================= */

  const filteredUjian = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return ujian;
    }

    return ujian.filter((item) => {
      const judul = String(
        item?.judul || ""
      ).toLowerCase();

      const jenis = String(
        item?.jenis || ""
      ).toLowerCase();

      const deskripsi = String(
        item?.deskripsi || ""
      ).toLowerCase();

      return (
        judul.includes(keyword) ||
        jenis.includes(keyword) ||
        deskripsi.includes(keyword)
      );
    });
  }, [ujian, search]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const total = ujian.length;

    const published = ujian.filter(
      (item) =>
        item?.dipublikasikan === true
    ).length;

    const draft = total - published;

    /*
     * FIX:
     * Backend menggunakan soalAsesmen,
     * bukan soalUjian.
     */
    const totalQuestions =
      ujian.reduce(
        (sum, item) =>
          sum +
          Number(
            item?._count?.soalAsesmen || 0
          ),
        0
      );

    /*
     * FIX:
     * Backend menggunakan percobaanAsesmen,
     * bukan percobaanUjian.
     */
    const totalAttempts =
      ujian.reduce(
        (sum, item) =>
          sum +
          Number(
            item?._count?.percobaanAsesmen || 0
          ),
        0
      );

    return {
      total,
      published,
      draft,
      totalQuestions,
      totalAttempts,
    };
  }, [ujian]);

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(item) {
    const confirmed =
      window.confirm(
        `Hapus ujian "${item?.judul}"?\n\nData ujian yang sudah dihapus tidak akan tampil lagi.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(item.id);
      setError("");

      await deleteUjian(item.id);

      await loadUjian(
        selectedKelasMapel
      );
    } catch (err) {
      console.error(
        "DELETE UJIAN ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal menghapus ujian."
      );
    } finally {
      setDeleteLoading(null);
    }
  }

  /* =======================================================
     RETRY
  ======================================================= */

  async function handleRetry() {
    setError("");

    await loadKelasMapel();
  }

  /* =======================================================
     STAT CARD
  ======================================================= */

  function StatCard({
    icon: Icon,
    label,
    value,
    description,
    iconClass,
    bgClass,
  }) {
    return (
      <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">
              {label}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              {description}
            </p>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgClass}`}
          >
            <Icon
              size={18}
              className={iconClass}
            />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        active="ujian"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="guru"
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}

        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Guru",
            email:
              "guru@smartschool.com",
            avatar: "GR",
          }}
        />

        {/* MAIN */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-blue-100/50 blur-3xl" />

                <div className="absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-indigo-100/40 blur-3xl" />
              </div>

              <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex min-w-0 items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <ClipboardList
                      size={22}
                    />
                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Ujian
                      </h1>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                        Guru
                      </span>
                    </div>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                      Kelola ujian, soal, jadwal,
                      dan publikasi berdasarkan
                      kelas serta mata pelajaran
                      yang kamu ajar.
                    </p>

                    {selectedData && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">

                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/70 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                          <GraduationCap
                            size={13}
                          />

                          {selectedData?.kelas
                            ?.nama ||
                            "Kelas"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700">
                          <BookOpen
                            size={13}
                          />

                          {selectedData
                            ?.mataPelajaran
                            ?.nama ||
                            "Mata Pelajaran"}
                        </span>

                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/guru/ujian/tambah"
                    )
                  }
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
                >
                  <Plus size={17} />

                  Tambah Ujian
                </button>

              </div>
            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex min-w-0 items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm">
                    <AlertCircle
                      size={18}
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-bold text-rose-800">
                      Terjadi masalah
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 text-rose-700">
                      {error}
                    </p>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={
                    loadingKelasMapel
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={
                      loadingKelasMapel
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Coba lagi
                </button>

              </div>
            )}

            {/* =================================================
                KELAS MAPEL
            ================================================= */}

            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen
                      size={17}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Kelas & Mata Pelajaran
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Pilih penugasan guru untuk
                      melihat daftar ujian.
                    </p>
                  </div>

                </div>
              </div>

              <div className="p-5 sm:p-6">

                {loadingKelasMapel ? (
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                ) : kelasMapel.length === 0 ? (

                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <BookOpen
                        size={24}
                      />
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      Belum ada penugasan
                    </p>

                    <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                      Tidak ditemukan kelas dan mata
                      pelajaran yang ditugaskan kepada
                      akun guru ini.
                    </p>

                    <button
                      type="button"
                      onClick={
                        loadKelasMapel
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50"
                    >
                      <RefreshCw
                        size={13}
                      />

                      Muat ulang
                    </button>

                  </div>

                ) : (

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">

                    <div>
                      <label
                        htmlFor="kelasMapel"
                        className="mb-2 block text-xs font-semibold text-slate-600"
                      >
                        Penugasan Guru
                      </label>

                      <div className="relative">

                        <select
                          id="kelasMapel"
                          value={
                            selectedKelasMapel
                          }
                          onChange={(e) =>
                            setSelectedKelasMapel(
                              e.target.value
                            )
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        >
                          {kelasMapel.map(
                            (item) => (
                              <option
                                key={
                                  item.id
                                }
                                value={
                                  item.id
                                }
                              >
                                {item?.kelas
                                  ?.nama ||
                                  "Kelas"}{" "}
                                —{" "}
                                {item
                                  ?.mataPelajaran
                                  ?.nama ||
                                  "Mata Pelajaran"}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                      </div>
                    </div>

                    {selectedData && (
                      <div className="flex flex-wrap gap-2 lg:justify-end">

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          <Users
                            size={13}
                          />

                          {selectedData
                            ?.kelas
                            ?.nama ||
                            "Kelas"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                          <BookOpen
                            size={13}
                          />

                          {selectedData
                            ?.mataPelajaran
                            ?.nama ||
                            "Mata Pelajaran"}
                        </span>

                      </div>
                    )}

                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section>

              <div className="mb-3">
                <h2 className="text-sm font-bold text-slate-800">
                  Ringkasan Ujian
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Statistik ujian pada penugasan
                  yang dipilih.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

                <StatCard
                  icon={ClipboardList}
                  label="Total Ujian"
                  value={stats.total}
                  description="Semua ujian"
                  iconClass="text-blue-600"
                  bgClass="bg-blue-50"
                />

                <StatCard
                  icon={CheckCircle2}
                  label="Dipublikasikan"
                  value={stats.published}
                  description="Ujian aktif"
                  iconClass="text-emerald-600"
                  bgClass="bg-emerald-50"
                />

                <StatCard
                  icon={XCircle}
                  label="Draft"
                  value={stats.draft}
                  description="Belum dipublikasi"
                  iconClass="text-amber-600"
                  bgClass="bg-amber-50"
                />

                <StatCard
                  icon={FileQuestion}
                  label="Total Soal"
                  value={stats.totalQuestions}
                  description="Semua soal ujian"
                  iconClass="text-indigo-600"
                  bgClass="bg-indigo-50"
                />

                <StatCard
                  icon={Users}
                  label="Percobaan"
                  value={stats.totalAttempts}
                  description="Total pengerjaan"
                  iconClass="text-violet-600"
                  bgClass="bg-violet-50"
                />

              </div>
            </section>

            {/* =================================================
                SEARCH
            ================================================= */}

            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Daftar Ujian
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Cari dan kelola ujian yang
                    tersedia.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

                  <div className="relative w-full sm:w-[360px]">

                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Cari judul, jenis, atau deskripsi..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                  <div className="flex shrink-0 items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 ring-1 ring-slate-200">

                    <span>
                      Menampilkan
                    </span>

                    <span className="ml-1.5 font-bold text-slate-800">
                      {filteredUjian.length}
                    </span>

                    <span className="mx-1">
                      /
                    </span>

                    <span className="font-semibold text-slate-700">
                      {ujian.length}
                    </span>

                  </div>

                </div>

              </div>
            </section>

            {/* =================================================
                TABLE
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

              {/* TABLE TOP */}

              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <ListChecks
                      size={17}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Data Ujian
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Kelola soal, detail, edit,
                      dan hapus ujian.
                    </p>
                  </div>

                </div>

                {selectedData && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">

                    <span className="hidden sm:inline">
                      Penugasan:
                    </span>

                    <span className="font-semibold text-slate-700">
                      {selectedData?.kelas
                        ?.nama ||
                        "Kelas"}{" "}
                      ·{" "}
                      {selectedData
                        ?.mataPelajaran
                        ?.nama ||
                        "Mapel"}
                    </span>

                  </div>
                )}

              </div>

              {loadingUjian ? (

                <div className="px-6 py-16 text-center">

                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <RefreshCw
                      size={20}
                      className="animate-spin text-blue-600"
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Mengambil data ujian...
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Mohon tunggu sebentar.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1180px] text-sm">

                    {/* =================================================
                        THEAD
                    ================================================= */}

                    <thead>

                      <tr className="border-b border-slate-200 bg-slate-50">

                        <th className="w-14 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          No
                        </th>

                        <th className="min-w-[300px] px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Judul Ujian
                        </th>

                        <th className="w-28 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Jenis
                        </th>

                        <th className="w-32 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Durasi
                        </th>

                        <th className="min-w-[240px] px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Jadwal
                        </th>

                        <th className="w-32 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="w-24 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Soal
                        </th>

                        <th className="w-48 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    {/* =================================================
                        TBODY
                    ================================================= */}

                    <tbody>

                      {filteredUjian.map(
                        (
                          item,
                          index
                        ) => {

                          /*
                           * FIX UTAMA:
                           *
                           * Backend:
                           * _count.soalAsesmen
                           *
                           * BUKAN:
                           * _count.soalUjian
                           */
                          const jumlahSoal =
                            Number(
                              item?._count
                                ?.soalAsesmen ||
                                0
                            );

                          const isPublished =
                            item?.dipublikasikan ===
                            true;

                          return (

                            <tr
                              key={
                                item.id
                              }
                              className={`group relative border-b border-slate-100 transition hover:bg-blue-50/30 ${
                                isPublished
                                  ? "bg-white"
                                  : "bg-amber-50/[0.18]"
                              }`}
                            >

                              {/* =================================================
                                  NUMBER
                              ================================================= */}

                              <td className="relative px-4 py-4">

                                <div
                                  className={`absolute bottom-0 left-0 top-0 w-0.5 ${
                                    isPublished
                                      ? "bg-emerald-400"
                                      : "bg-amber-400"
                                  }`}
                                />

                                <span className="text-xs font-semibold text-slate-400">
                                  {String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>

                              </td>

                              {/* =================================================
                                  TITLE
                              ================================================= */}

                              <td className="px-4 py-4">

                                <div className="flex min-w-0 items-start gap-3">

                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                      isPublished
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-amber-50 text-amber-600"
                                    }`}
                                  >
                                    <ClipboardList
                                      size={
                                        16
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">

                                    <p className="truncate font-semibold text-slate-900">
                                      {item?.judul ||
                                        "Tanpa judul"}
                                    </p>

                                    {item?.deskripsi && (
                                      <p className="mt-1 max-w-[390px] truncate text-xs leading-5 text-slate-500">
                                        {
                                          item.deskripsi
                                        }
                                      </p>
                                    )}

                                    {item?.modeUjian && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                          Mode{" "}
                                          <span className="mx-1 text-slate-300">
                                            ·
                                          </span>
                                          {
                                            item.modeUjian
                                          }
                                        </span>
                                      </div>
                                    )}

                                  </div>
                                </div>

                              </td>

                              {/* =================================================
                                  TYPE
                              ================================================= */}

                              <td className="px-4 py-4">

                                <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                                  {getJenisLabel(
                                    item?.jenis
                                  )}
                                </span>

                              </td>

                              {/* =================================================
                                  DURATION
                              ================================================= */}

                              <td className="px-4 py-4 text-center">

                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">

                                  <Clock3
                                    size={
                                      14
                                    }
                                    className="text-slate-400"
                                  />

                                  {Number(
                                    item?.durasi ||
                                      0
                                  )}{" "}
                                  menit

                                </span>

                              </td>

                              {/* =================================================
                                  SCHEDULE
                              ================================================= */}

                              <td className="px-4 py-4">

                                {item?.waktuMulai ? (

                                  <div className="space-y-1.5">

                                    <div className="flex items-start gap-2 text-xs">

                                      <span className="w-12 shrink-0 rounded-md bg-blue-50 px-1.5 py-1 text-center text-[10px] font-bold text-blue-600">
                                        MULAI
                                      </span>

                                      <span className="pt-0.5 text-slate-700">
                                        {formatTanggal(
                                          item.waktuMulai
                                        )}
                                      </span>

                                    </div>

                                    {item?.waktuSelesai && (
                                      <div className="flex items-start gap-2 text-xs">

                                        <span className="w-12 shrink-0 rounded-md bg-slate-100 px-1.5 py-1 text-center text-[10px] font-bold text-slate-500">
                                          SELESAI
                                        </span>

                                        <span className="pt-0.5 text-slate-600">
                                          {formatTanggal(
                                            item.waktuSelesai
                                          )}
                                        </span>

                                      </div>
                                    )}

                                  </div>

                                ) : (

                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-400">
                                    <Clock3
                                      size={
                                        13
                                      }
                                    />

                                    Tidak dijadwalkan
                                  </span>

                                )}

                              </td>

                              {/* =================================================
                                  STATUS
                              ================================================= */}

                              <td className="px-4 py-4 text-center">

                                {isPublished ? (

                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">

                                    <CheckCircle2
                                      size={
                                        13
                                      }
                                    />

                                    Publikasi

                                  </span>

                                ) : (

                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">

                                    <XCircle
                                      size={
                                        13
                                      }
                                    />

                                    Draft

                                  </span>

                                )}

                              </td>

                              {/* =================================================
                                  QUESTIONS
                              ================================================= */}

                              <td className="px-4 py-4 text-center">

                                <span
                                  className={`inline-flex min-w-9 items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                                    jumlahSoal > 0
                                      ? "border border-indigo-100 bg-indigo-50 text-indigo-700"
                                      : "bg-slate-50 text-slate-400"
                                  }`}
                                >
                                  {jumlahSoal}
                                </span>

                              </td>

                              {/* =================================================
                                  ACTIONS
                              ================================================= */}

                              <td className="px-4 py-4">

                                <div className="flex items-center justify-center gap-1.5">

                                  {/* SOAL */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/guru/ujian/${item.id}/soal`
                                      )
                                    }
                                    title="Kelola soal"
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-100"
                                  >
                                    <ListChecks
                                      size={
                                        15
                                      }
                                    />

                                    <span className="hidden 2xl:inline text-xs font-semibold">
                                      Soal
                                    </span>
                                  </button>

                                  {/* EDIT */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/guru/ujian/edit/${item.id}`
                                      )
                                    }
                                    title="Edit ujian"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                                  >
                                    <Pencil
                                      size={
                                        15
                                      }
                                    />
                                  </button>

                                  {/* DETAIL */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/guru/ujian/${item.id}`
                                      )
                                    }
                                    title="Lihat detail"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-100"
                                  >
                                    <Eye
                                      size={
                                        15
                                      }
                                    />
                                  </button>

                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(
                                        item
                                      )
                                    }
                                    disabled={
                                      deleteLoading ===
                                      item.id
                                    }
                                    title="Hapus ujian"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:border-rose-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {deleteLoading ===
                                    item.id ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                                    ) : (
                                      <Trash2
                                        size={
                                          15
                                        }
                                      />
                                    )}
                                  </button>

                                </div>

                              </td>

                            </tr>

                          );
                        }
                      )}

                      {/* =================================================
                          EMPTY STATE
                      ================================================= */}

                      {filteredUjian.length ===
                        0 && (

                        <tr>

                          <td
                            colSpan={8}
                            className="px-6 py-16 text-center"
                          >

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                              {search.trim() ? (
                                <Search
                                  size={
                                    25
                                  }
                                />
                              ) : (
                                <ClipboardList
                                  size={
                                    27
                                  }
                                />
                              )}
                            </div>

                            <p className="mt-4 text-sm font-bold text-slate-700">
                              {search.trim()
                                ? "Ujian tidak ditemukan"
                                : "Belum ada ujian"}
                            </p>

                            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                              {search.trim()
                                ? "Coba gunakan kata kunci pencarian yang berbeda."
                                : "Belum ada ujian untuk kelas dan mata pelajaran yang dipilih."}
                            </p>

                            {search.trim() && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSearch(
                                    ""
                                  )
                                }
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                              >
                                <RefreshCw
                                  size={
                                    13
                                  }
                                />

                                Reset pencarian
                              </button>
                            )}

                            {!search.trim() &&
                              selectedKelasMapel && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      "/guru/ujian/tambah"
                                    )
                                  }
                                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                  <Plus
                                    size={
                                      14
                                    }
                                  />

                                  Buat Ujian
                                </button>
                              )}

                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>
              )}

              {/* =================================================
                  TABLE FOOTER
              ================================================= */}

              {!loadingUjian &&
                filteredUjian.length > 0 && (

                  <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                    <span>
                      Menampilkan{" "}
                      <strong className="font-semibold text-slate-700">
                        {filteredUjian.length}
                      </strong>{" "}
                      ujian
                    </span>

                    <div className="flex items-center gap-3">

                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        {stats.published} dipublikasikan
                      </span>

                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        {stats.draft} draft
                      </span>

                    </div>

                  </div>

                )}

            </section>

          </div>
        </main>
      </div>
    </div>
  );
}