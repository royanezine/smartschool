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

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getKelasMapel } from "@/services/kelasMapel.service";

import {
  getUjianByKelasMapel,
  deleteUjian,
} from "@/services/ujian.service";

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

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

    const totalQuestions =
      ujian.reduce(
        (sum, item) =>
          sum +
          Number(
            item?._count?.soalAsesmen || 0
          ),
        0
      );

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
      <div
        className={`theme-card group rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5 sm:p-5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="theme-text-muted text-xs font-semibold">
              {label}
            </p>

            <p className="theme-text mt-2 text-2xl font-bold tracking-tight">
              {value}
            </p>

            <p className="theme-text-muted mt-1 text-[11px] leading-5">
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
    <div className="theme-page flex h-screen w-full overflow-hidden">

      {/* SIDEBAR */}

      <Sidebar
        active="ujian"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="guru"
      />

      {/* MAIN */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

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

        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section
              className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  className={`absolute -right-24 -top-24 h-60 w-60 rounded-full ${themePrimarySoft} blur-3xl`}
                />

                <div className="absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] blur-3xl" />
              </div>

              <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex min-w-0 items-start gap-4">

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <ClipboardList size={22} />
                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        Ujian
                      </h1>

                      <span
                        className={`rounded-full ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder} border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide`}
                      >
                        Guru
                      </span>
                    </div>

                    <p className="theme-text-secondary mt-1.5 max-w-2xl text-sm leading-6">
                      Kelola ujian, soal, jadwal,
                      dan publikasi berdasarkan
                      kelas serta mata pelajaran
                      yang kamu ajar.
                    </p>

                    {selectedData && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-2.5 py-1.5 text-xs font-semibold`}
                        >
                          <GraduationCap size={13} />

                          {selectedData?.kelas
                            ?.nama ||
                            "Kelas"}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border ${themeInfoBorder} ${themeInfoSurface} text-[var(--color-info)] px-2.5 py-1.5 text-xs font-semibold`}
                        >
                          <BookOpen size={13} />

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
                  className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-3 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90 sm:w-auto`}
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
              <div
                className={`flex flex-col gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4 sm:flex-row sm:items-start sm:justify-between`}
              >
                <div className="flex min-w-0 items-start gap-3">

                  <div
                    className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-danger ${themeSmallShadow}`}
                  >
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0">

                    <p className="theme-danger text-sm font-bold">
                      Terjadi masalah
                    </p>

                    <p className="theme-danger mt-1 break-words text-xs leading-5 opacity-80">
                      {error}
                    </p>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={loadingKelasMapel}
                  className={`theme-card inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} px-3 py-2 text-xs font-semibold theme-text-secondary ${themeNeutralHover} transition disabled:cursor-not-allowed disabled:opacity-50`}
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

            <section
              className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div
                className={`border-b ${themeDivider} px-5 py-4 sm:px-6`}
              >
                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <BookOpen size={17} />
                  </div>

                  <div>
                    <h2 className="theme-text text-sm font-bold">
                      Kelas & Mata Pelajaran
                    </h2>

                    <p className="theme-text-secondary mt-0.5 text-xs">
                      Pilih penugasan guru untuk
                      melihat daftar ujian.
                    </p>
                  </div>

                </div>
              </div>

              <div className="p-5 sm:p-6">

                {loadingKelasMapel ? (
                  <div
                    className={`h-12 animate-pulse rounded-xl ${themeNeutralSurface}`}
                  />
                ) : kelasMapel.length === 0 ? (

                  <div
                    className={`rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-5 py-10 text-center`}
                  >
                    <div
                      className={`theme-card mx-auto flex h-12 w-12 items-center justify-center rounded-xl border ${themeNeutralBorder} theme-text-muted ${themeSmallShadow}`}
                    >
                      <BookOpen size={24} />
                    </div>

                    <p className="theme-text mt-3 text-sm font-bold">
                      Belum ada penugasan
                    </p>

                    <p className="theme-text-secondary mx-auto mt-1 max-w-md text-xs leading-5">
                      Tidak ditemukan kelas dan mata
                      pelajaran yang ditugaskan kepada
                      akun guru ini.
                    </p>

                    <button
                      type="button"
                      onClick={loadKelasMapel}
                      className={`theme-card mt-4 inline-flex items-center gap-2 rounded-lg border ${themeNeutralBorder} px-3.5 py-2 text-xs font-semibold ${themePrimaryText} ${themeNeutralHover} transition`}
                    >
                      <RefreshCw size={13} />
                      Muat ulang
                    </button>
                  </div>

                ) : (

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">

                    <div>
                      <label
                        htmlFor="kelasMapel"
                        className="theme-text-secondary mb-2 block text-xs font-semibold"
                      >
                        Penugasan Guru
                      </label>

                      <div className="relative">

                        <select
                          id="kelasMapel"
                          value={selectedKelasMapel}
                          onChange={(e) =>
                            setSelectedKelasMapel(
                              e.target.value
                            )
                          }
                          className={`theme-input w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-medium outline-none transition ${themeNeutralBorder} ${themeFocus}`}
                        >
                          {kelasMapel.map(
                            (item) => (
                              <option
                                key={item.id}
                                value={item.id}
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
                          className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                        />

                      </div>
                    </div>

                    {selectedData && (
                      <div className="flex flex-wrap gap-2 lg:justify-end">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-3 py-1.5 text-xs font-semibold`}
                        >
                          <Users size={13} />

                          {selectedData?.kelas
                            ?.nama ||
                            "Kelas"}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border ${themeInfoBorder} ${themeInfoSurface} text-[var(--color-info)] px-3 py-1.5 text-xs font-semibold`}
                        >
                          <BookOpen size={13} />

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
                <h2 className="theme-text text-sm font-bold">
                  Ringkasan Ujian
                </h2>

                <p className="theme-text-secondary mt-0.5 text-xs">
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
                  iconClass={themePrimaryText}
                  bgClass={themePrimarySoft}
                />

                <StatCard
                  icon={CheckCircle2}
                  label="Dipublikasikan"
                  value={stats.published}
                  description="Ujian aktif"
                  iconClass="text-[var(--color-success)]"
                  bgClass={themeSuccessSurface}
                />

                <StatCard
                  icon={XCircle}
                  label="Draft"
                  value={stats.draft}
                  description="Belum dipublikasi"
                  iconClass="text-[var(--color-warning)]"
                  bgClass={themeWarningSurface}
                />

                <StatCard
                  icon={FileQuestion}
                  label="Total Soal"
                  value={stats.totalQuestions}
                  description="Semua soal ujian"
                  iconClass="text-[var(--color-info)]"
                  bgClass={themeInfoSurface}
                />

                <StatCard
                  icon={Users}
                  label="Percobaan"
                  value={stats.totalAttempts}
                  description="Total pengerjaan"
                  iconClass={themePrimaryText}
                  bgClass={themePrimarySoft}
                />

              </div>
            </section>

            {/* =================================================
                SEARCH
            ================================================= */}

            <section
              className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} sm:p-5`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="theme-text text-sm font-bold">
                    Daftar Ujian
                  </h2>

                  <p className="theme-text-secondary mt-0.5 text-xs">
                    Cari dan kelola ujian yang
                    tersedia.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

                  <div className="relative w-full sm:w-[360px]">

                    <Search
                      size={17}
                      className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
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
                      className={`theme-input w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition ${themeNeutralBorder} ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                    />

                  </div>

                  <div
                    className={`flex shrink-0 items-center justify-between rounded-xl ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text-secondary ring-1 ring-[color-mix(in_srgb,var(--color-text)_10%,transparent)]`}
                  >
                    <span>
                      Menampilkan
                    </span>

                    <span className="theme-text ml-1.5 font-bold">
                      {filteredUjian.length}
                    </span>

                    <span className="mx-1">
                      /
                    </span>

                    <span className="theme-text-secondary font-semibold">
                      {ujian.length}
                    </span>
                  </div>

                </div>

              </div>
            </section>

            {/* =================================================
                TABLE
            ================================================= */}

            <section
              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >

              <div
                className={`flex flex-col gap-3 border-b ${themeDivider} px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
              >

                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                  >
                    <ListChecks size={17} />
                  </div>

                  <div>
                    <p className="theme-text text-sm font-bold">
                      Data Ujian
                    </p>

                    <p className="theme-text-secondary text-[11px]">
                      Kelola soal, detail, edit,
                      dan hapus ujian.
                    </p>
                  </div>

                </div>

                {selectedData && (
                  <div className="flex items-center gap-2 text-xs">

                    <span className="theme-text-muted hidden sm:inline">
                      Penugasan:
                    </span>

                    <span className="theme-text-secondary font-semibold">
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

                  <div
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft}`}
                  >
                    <RefreshCw
                      size={20}
                      className={`animate-spin ${themePrimaryText}`}
                    />
                  </div>

                  <p className="theme-text mt-4 text-sm font-semibold">
                    Mengambil data ujian...
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    Mohon tunggu sebentar.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1180px] text-sm">

                    <thead>

                      <tr
                        className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                      >

                        <th className="theme-text-muted w-14 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide">
                          No
                        </th>

                        <th className="theme-text-muted min-w-[300px] px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide">
                          Judul Ujian
                        </th>

                        <th className="theme-text-muted w-28 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide">
                          Jenis
                        </th>

                        <th className="theme-text-muted w-32 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide">
                          Durasi
                        </th>

                        <th className="theme-text-muted min-w-[240px] px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide">
                          Jadwal
                        </th>

                        <th className="theme-text-muted w-32 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide">
                          Status
                        </th>

                        <th className="theme-text-muted w-24 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide">
                          Soal
                        </th>

                        <th className="theme-text-muted w-48 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredUjian.map(
                        (
                          item,
                          index
                        ) => {

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
                              key={item.id}
                              className={`group relative border-b ${themeDivider} transition ${themeNeutralHover} ${
                                isPublished
                                  ? ""
                                  : themeWarningSurface
                              }`}
                            >

                              {/* NUMBER */}

                              <td className="relative px-4 py-4">

                                <div
                                  className={`absolute bottom-0 left-0 top-0 w-0.5 ${
                                    isPublished
                                      ? "bg-[var(--color-success)]"
                                      : "bg-[var(--color-warning)]"
                                  }`}
                                />

                                <span className="theme-text-muted text-xs font-semibold">
                                  {String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>

                              </td>

                              {/* TITLE */}

                              <td className="px-4 py-4">

                                <div className="flex min-w-0 items-start gap-3">

                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                      isPublished
                                        ? themePrimarySoft
                                        : themeWarningSurface
                                    } ${
                                      isPublished
                                        ? themePrimaryText
                                        : "text-[var(--color-warning)]"
                                    }`}
                                  >
                                    <ClipboardList size={16} />
                                  </div>

                                  <div className="min-w-0">

                                    <p className="theme-text truncate font-semibold">
                                      {item?.judul ||
                                        "Tanpa judul"}
                                    </p>

                                    {item?.deskripsi && (
                                      <p className="theme-text-secondary mt-1 max-w-[390px] truncate text-xs leading-5">
                                        {
                                          item.deskripsi
                                        }
                                      </p>
                                    )}

                                    {item?.modeUjian && (
                                      <div className="mt-2">
                                        <span
                                          className={`inline-flex items-center rounded-md ${themeNeutralSurface} ${themeNeutralBorder} border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide theme-text-muted`}
                                        >
                                          Mode{" "}
                                          <span className="mx-1 theme-text-placeholder">
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

                              {/* TYPE */}

                              <td className="px-4 py-4">

                                <span
                                  className={`inline-flex items-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1.5 text-xs font-semibold theme-text-secondary`}
                                >
                                  {getJenisLabel(
                                    item?.jenis
                                  )}
                                </span>

                              </td>

                              {/* DURATION */}

                              <td className="px-4 py-4 text-center">

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg ${themeNeutralSurface} px-2.5 py-1.5 text-xs font-semibold theme-text-secondary`}
                                >
                                  <Clock3
                                    size={14}
                                    className="theme-text-muted"
                                  />

                                  {Number(
                                    item?.durasi ||
                                      0
                                  )}{" "}
                                  menit
                                </span>

                              </td>

                              {/* SCHEDULE */}

                              <td className="px-4 py-4">

                                {item?.waktuMulai ? (

                                  <div className="space-y-1.5">

                                    <div className="flex items-start gap-2 text-xs">

                                      <span
                                        className={`w-12 shrink-0 rounded-md ${themePrimarySoft} px-1.5 py-1 text-center text-[10px] font-bold ${themePrimaryText}`}
                                      >
                                        MULAI
                                      </span>

                                      <span className="theme-text-secondary pt-0.5">
                                        {formatTanggal(
                                          item.waktuMulai
                                        )}
                                      </span>

                                    </div>

                                    {item?.waktuSelesai && (
                                      <div className="flex items-start gap-2 text-xs">

                                        <span
                                          className={`w-12 shrink-0 rounded-md ${themeNeutralSurface} px-1.5 py-1 text-center text-[10px] font-bold theme-text-muted`}
                                        >
                                          SELESAI
                                        </span>

                                        <span className="theme-text-secondary pt-0.5">
                                          {formatTanggal(
                                            item.waktuSelesai
                                          )}
                                        </span>

                                      </div>
                                    )}

                                  </div>

                                ) : (

                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-lg ${themeNeutralSurface} px-2.5 py-1.5 text-xs font-medium theme-text-muted`}
                                  >
                                    <Clock3 size={13} />
                                    Tidak dijadwalkan
                                  </span>

                                )}

                              </td>

                              {/* STATUS */}

                              <td className="px-4 py-4 text-center">
                                <div className="flex flex-col items-center gap-2">

                                  {isPublished ? (
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-3 py-1.5 text-[11px] font-bold text-[var(--color-success)]`}
                                    >
                                      <CheckCircle2 size={13} />
                                      Publikasi
                                    </span>
                                  ) : (
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border ${themeWarningBorder} ${themeWarningSurface} px-3 py-1.5 text-[11px] font-bold text-[var(--color-warning)]`}
                                    >
                                      <XCircle size={13} />
                                      Draft
                                    </span>
                                  )}

                                  {Number(
                                    item?._count?.percobaanAsesmen || 0
                                  ) > 0 ? (
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border ${themeInfoBorder} ${themeInfoSurface} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-info)]`}
                                    >
                                      <Users size={12} />

                                      {Number(
                                        item?._count?.percobaanAsesmen || 0
                                      )}{" "}
                                      siswa mengerjakan
                                    </span>
                                  ) : (
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1 text-[10px] font-semibold theme-text-muted`}
                                    >
                                      <Clock3 size={12} />

                                      Belum dikerjakan
                                    </span>
                                  )}

                                </div>
                              </td>

                              {/* QUESTIONS */}

                              <td className="px-4 py-4 text-center">

                                <span
                                  className={`inline-flex min-w-9 items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                                    jumlahSoal > 0
                                      ? `${themeInfoBorder} ${themeInfoSurface} border text-[var(--color-info)]`
                                      : `${themeNeutralSurface} theme-text-muted`
                                  }`}
                                >
                                  {jumlahSoal}
                                </span>

                              </td>

                              {/* ACTIONS */}

                              <td className="px-4 py-4">

                                <div className="flex items-center justify-center gap-1.5">

                                  {/* SOAL */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/guru/ujian/${item.id}`
                                      )
                                    }
                                    title="Kelola soal"
                                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg border ${themeSuccessBorder} ${themeSuccessSurface} px-2.5 text-[var(--color-success)] transition hover:brightness-95`}
                                  >
                                    <ListChecks size={15} />

                                    <span className="hidden text-xs font-semibold 2xl:inline">
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
                                    className={`theme-card flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} transition hover:brightness-95`}
                                  >
                                    <Pencil size={15} />
                                  </button>

                                  {/* DETAIL */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/guru/ujian/${item.id}/soal`
                                      )
                                    }
                                    title="Lihat detail"
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themeInfoBorder} ${themeInfoSurface} text-[var(--color-info)] transition hover:brightness-95`}
                                  >
                                    <Eye size={15} />
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
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themeDangerBorder} ${themeDangerSurface} theme-danger transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50`}
                                  >
                                    {deleteLoading ===
                                    item.id ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                      <Trash2 size={15} />
                                    )}
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        }
                      )}

                      {/* EMPTY STATE */}

                      {filteredUjian.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-16 text-center"
                          >

                            <div
                              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                            >
                              {search.trim() ? (
                                <Search size={25} />
                              ) : (
                                <ClipboardList size={27} />
                              )}
                            </div>

                            <p className="theme-text mt-4 text-sm font-bold">
                              {search.trim()
                                ? "Ujian tidak ditemukan"
                                : "Belum ada ujian"}
                            </p>

                            <p className="theme-text-secondary mx-auto mt-1 max-w-md text-xs leading-5">
                              {search.trim()
                                ? "Coba gunakan kata kunci pencarian yang berbeda."
                                : "Belum ada ujian untuk kelas dan mata pelajaran yang dipilih."}
                            </p>

                            {search.trim() && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSearch("")
                                }
                                className={`theme-card mt-4 inline-flex items-center gap-2 rounded-lg border ${themeNeutralBorder} px-3.5 py-2 text-xs font-semibold theme-text-secondary ${themeNeutralHover} transition`}
                              >
                                <RefreshCw size={13} />
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
                                  className={`mt-4 inline-flex items-center gap-2 rounded-lg ${themePrimaryGradient} px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90`}
                                >
                                  <Plus size={14} />
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

              {/* TABLE FOOTER */}

              {!loadingUjian &&
                filteredUjian.length > 0 && (
                  <div
                    className={`flex flex-col gap-2 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-3.5 text-xs theme-text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6`}
                  >

                    <span>
                      Menampilkan{" "}
                      <strong className="theme-text font-semibold">
                        {filteredUjian.length}
                      </strong>{" "}
                      ujian
                    </span>

                    <div className="flex items-center gap-3">

                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                        {stats.published} dipublikasikan
                      </span>

                      <span className="theme-text-placeholder h-1 w-1 rounded-full bg-current" />

                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
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

