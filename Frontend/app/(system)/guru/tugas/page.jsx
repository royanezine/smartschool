"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  ClipboardList,
  Eye,
  FileCheck2,
  Filter,
  GraduationCap,
  Inbox,
  ListChecks,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { getTugasGuru } from "@/services/tugas.service";

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

/* =========================================================
   HELPERS
========================================================= */

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";

  try {
    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
};

const formatTanggalLengkap = (tanggal) => {
  if (!tanggal) return "-";

  try {
    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
};

const getKelasNama = (tugas) => {
  return (
    tugas?.kelas?.nama ||
    tugas?.kelas?.namaKelas ||
    tugas?.kelas?.nama_kelas ||
    tugas?.namaKelas ||
    tugas?.nama_kelas ||
    tugas?.kelasNama ||
    tugas?.kelas_nama ||
    "Kelas belum ditentukan"
  );
};

const getMapelNama = (tugas) => {
  return (
    tugas?.mataPelajaran?.nama ||
    tugas?.mataPelajaran?.namaMapel ||
    tugas?.mataPelajaran?.nama_mata_pelajaran ||
    tugas?.mata_pelajaran?.nama ||
    tugas?.mapel?.nama ||
    tugas?.mapel?.namaMapel ||
    tugas?.mapel?.nama_mapel ||
    tugas?.namaMapel ||
    tugas?.nama_mapel ||
    "Mata pelajaran"
  );
};

const getJudulTugas = (tugas) => {
  return (
    tugas?.judul ||
    tugas?.judulTugas ||
    tugas?.judul_tugas ||
    tugas?.nama ||
    tugas?.namaTugas ||
    tugas?.nama_tugas ||
    "Tugas tanpa judul"
  );
};

const getDeskripsiTugas = (tugas) => {
  return (
    tugas?.deskripsi ||
    tugas?.description ||
    tugas?.keterangan ||
    tugas?.detail ||
    ""
  );
};

const getDeadline = (tugas) => {
  return (
    tugas?.deadline ||
    tugas?.batasWaktu ||
    tugas?.batas_waktu ||
    tugas?.tanggalDeadline ||
    tugas?.tanggal_deadline ||
    tugas?.dueDate ||
    tugas?.due_date ||
    tugas?.tanggalPengumpulan ||
    tugas?.tanggal_pengumpulan ||
    null
  );
};

const getJumlahPengumpulan = (tugas) => {
  const value =
    tugas?.jumlahPengumpulan ??
    tugas?.jumlah_pengumpulan ??
    tugas?.jumlahDikumpulkan ??
    tugas?.jumlah_dikumpulkan ??
    tugas?.totalPengumpulan ??
    tugas?.total_pengumpulan ??
    tugas?.pengumpulan ??
    tugas?.submissionCount ??
    tugas?.submission_count ??
    tugas?._count?.pengumpulan ??
    tugas?._count?.pengumpulanTugas ??
    tugas?._count?.submissions ??
    tugas?.stats?.jumlahPengumpulan ??
    tugas?.stats?.jumlah_pengumpulan ??
    0;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const getTotalSiswa = (tugas) => {
  const value =
    tugas?.totalSiswa ??
    tugas?.total_siswa ??
    tugas?.jumlahSiswa ??
    tugas?.jumlah_siswa ??
    tugas?.kelas?.jumlahSiswa ??
    tugas?.kelas?.jumlah_siswa ??
    tugas?.kelas?._count?.anggota ??
    tugas?.kelas?._count?.siswa ??
    tugas?.kelas?._count?.siswaKelas ??
    tugas?.stats?.totalSiswa ??
    tugas?.stats?.total_siswa ??
    0;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const getStatusTugas = (tugas) => {
  const deadline = getDeadline(tugas);

  if (!deadline) {
    return "Terkirim";
  }

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return "Terkirim";
  }

  return new Date() > date ? "Berakhir" : "Terkirim";
};

const getProgress = (tugas) => {
  const submitted = getJumlahPengumpulan(tugas);
  const total = getTotalSiswa(tugas);

  if (!total || total <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((submitted / total) * 100)
  );
};

const getDeadlineState = (tugas) => {
  const deadline = getDeadline(tugas);

  if (!deadline) {
    return {
      type: "normal",
      label: "Tidak ada deadline",
    };
  }

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return {
      type: "normal",
      label: "Deadline belum tersedia",
    };
  }

  const now = new Date();

  if (date < now) {
    return {
      type: "expired",
      label: "Deadline terlewati",
    };
  }

  const diff = date.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days <= 1) {
    return {
      type: "urgent",
      label: "Deadline hari ini",
    };
  }

  if (days <= 3) {
    return {
      type: "soon",
      label: "Segera berakhir",
    };
  }

  return {
    type: "normal",
    label: "Masih aktif",
  };
};

const getTugasId = (tugas) => {
  return (
    tugas?.id ||
    tugas?.tugasId ||
    tugas?.tugas_id ||
    tugas?.uuid ||
    tugas?._id
  );
};

/* =========================================================
   SEARCHABLE CLASS DROPDOWN
========================================================= */

function KelasSearchDropdown({
  value,
  options,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return options;
    }

    return options.filter((item) =>
      item.toLowerCase().includes(keyword)
    );
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(
          "[data-kelas-dropdown]"
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const selectValue = (item) => {
    onChange(item === value ? "" : item);
    setOpen(false);
    setSearch("");
  };

  return (
    <div
      className="relative"
      data-kelas-dropdown
    >
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className={`theme-input flex h-11 w-full items-center justify-between rounded-xl border px-3.5 text-left text-sm transition-all duration-200 ${themeNeutralBorder} ${themeFocus}`}
      >
        <span
          className={
            value
              ? "theme-text truncate"
              : "theme-text-placeholder truncate"
          }
        >
          {value || "Semua Kelas"}
        </span>

        <ChevronDown
          size={17}
          className={`theme-text-muted shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`theme-card absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div
            className={`border-b p-2 ${themeDivider}`}
          >
            <div className="relative">
              <Search
                size={15}
                className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cari kelas..."
                autoFocus
                className={`theme-input h-9 w-full rounded-lg border pl-9 pr-3 text-sm outline-none ${themeNeutralBorder} ${themeFocus}`}
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5">
            <button
              type="button"
              onClick={() => selectValue("")}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                !value
                  ? `${themePrimarySoft} font-medium ${themePrimaryText}`
                  : `theme-text-secondary ${themeNeutralHover}`
              }`}
            >
              Semua Kelas
            </button>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    selectValue(item)
                  }
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    value === item
                      ? `${themePrimarySoft} font-medium ${themePrimaryText}`
                      : `theme-text-secondary ${themeNeutralHover}`
                  }`}
                >
                  {item}
                </button>
              ))
            ) : (
              <div className="theme-text-muted px-3 py-5 text-center text-sm">
                Kelas tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function TaskSkeleton() {
  return (
    <div
      className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder}`}
    >
      <div className="animate-pulse p-5">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-11 w-11 rounded-xl ${themeNeutralSurface}`}
            />

            <div>
              <div
                className={`h-3 w-24 rounded ${themeNeutralSurface}`}
              />

              <div
                className={`mt-2 h-4 w-32 rounded ${themeNeutralSurface}`}
              />
            </div>
          </div>

          <div
            className={`h-6 w-20 rounded-full ${themeNeutralSurface}`}
          />
        </div>

        <div
          className={`h-5 w-4/5 rounded ${themeNeutralSurface}`}
        />

        <div className="mt-3 space-y-2">
          <div
            className={`h-3 w-full rounded ${themeNeutralSurface}`}
          />

          <div
            className={`h-3 w-3/4 rounded ${themeNeutralSurface}`}
          />
        </div>

        <div
          className={`mt-5 h-16 rounded-xl ${themeNeutralSurface}`}
        />

        <div className="mt-5 flex gap-2">
          <div
            className={`h-10 flex-1 rounded-lg ${themeNeutralSurface}`}
          />

          <div
            className={`h-10 w-20 rounded-lg ${themeNeutralSurface}`}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function GuruTugasPage() {
  const router = useRouter();

  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] =
    useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadTugas = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getTugasGuru();

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.result)
          ? response.result
          : Array.isArray(
              response?.data?.result
            )
          ? response.data.result
          : [];

        setTugas(data);
      } catch (err) {
        console.error(
          "Gagal mengambil data tugas:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data tugas. Silakan coba lagi."
        );

        setTugas([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadTugas();
  }, [loadTugas]);

  /* =======================================================
     AUTO HIDE MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!success) return;

    const timeout = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timeout);
  }, [success]);

  /* =======================================================
     KELAS OPTIONS
  ======================================================= */

  const kelasOptions = useMemo(() => {
    const unique = new Set();

    tugas.forEach((item) => {
      const kelas = getKelasNama(item);

      if (
        kelas &&
        kelas !== "Kelas belum ditentukan"
      ) {
        unique.add(kelas);
      }
    });

    return Array.from(unique).sort((a, b) =>
      a.localeCompare(b, "id")
    );
  }, [tugas]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredTugas = useMemo(() => {
    const keyword = searchQuery
      .toLowerCase()
      .trim();

    return tugas.filter((item) => {
      const judul =
        getJudulTugas(item).toLowerCase();

      const deskripsi =
        getDeskripsiTugas(item).toLowerCase();

      const mapel =
        getMapelNama(item).toLowerCase();

      const kelas = getKelasNama(item);

      const status = getStatusTugas(item);

      const matchesSearch =
        !keyword ||
        judul.includes(keyword) ||
        deskripsi.includes(keyword) ||
        mapel.includes(keyword) ||
        kelas
          .toLowerCase()
          .includes(keyword);

      const matchesKelas =
        !selectedKelas ||
        kelas === selectedKelas;

      const matchesStatus =
        !selectedStatus ||
        status === selectedStatus;

      return (
        matchesSearch &&
        matchesKelas &&
        matchesStatus
      );
    });
  }, [
    tugas,
    searchQuery,
    selectedKelas,
    selectedStatus,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const total = tugas.length;

    const berjalan = tugas.filter(
      (item) =>
        getStatusTugas(item) === "Terkirim"
    ).length;

    const berakhir = tugas.filter(
      (item) =>
        getStatusTugas(item) === "Berakhir"
    ).length;

    const totalPengumpulan = tugas.reduce(
      (sum, item) =>
        sum + getJumlahPengumpulan(item),
      0
    );

    const totalSiswa = tugas.reduce(
      (sum, item) =>
        sum + getTotalSiswa(item),
      0
    );

    const progress =
      totalSiswa > 0
        ? Math.round(
            (totalPengumpulan / totalSiswa) *
              100
          )
        : 0;

    return {
      total,
      berjalan,
      berakhir,
      totalPengumpulan,
      totalSiswa,
      progress: Math.min(100, progress),
    };
  }, [tugas]);

  /* =======================================================
     RESET FILTER
  ======================================================= */

  const resetFilter = () => {
    setSearchQuery("");
    setSelectedKelas("");
    setSelectedStatus("");
  };

  const hasFilter =
    searchQuery ||
    selectedKelas ||
    selectedStatus;

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleView = (item) => {
    const id = getTugasId(item);

    if (!id) return;

    router.push(`/guru/tugas/${id}`);
  };

  const handleEdit = (item) => {
    const id = getTugasId(item);

    if (!id) return;

    router.push(`/guru/tugas/${id}/edit`);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="tugas"
        role="guru"
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "BS",
          }}
          notifications={[]}
        />

        <main className="theme-page flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                HERO
            ================================================== */}

            <section
              className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 ${themePrimaryGradient} ${themePrimaryShadow} ${themePrimarySoftBorder}`}
            >
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--color-info)_18%,transparent)] blur-3xl]"
              />

              <div
                className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] blur-3xl]"
              />

              <div
                className="pointer-events-none absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--color-card)_8%,transparent)] blur-2xl]"
              />

              <div className="relative z-10">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                  {/* TITLE */}

                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] text-[var(--color-card)] backdrop-blur">
                        <ClipboardList size={25} />
                      </div>

                      <span className="rounded-full border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-card)]">
                        GURU
                      </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl">
                      Tugas & Pengumpulan
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] sm:text-base">
                      Buat tugas, pantau deadline,
                      dan lihat progres pengumpulan
                      siswa dalam satu halaman.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-card)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] px-3 py-2 text-xs text-[color-mix(in_srgb,var(--color-card)_82%,transparent)] backdrop-blur">
                        <ListChecks size={14} />
                        {summary.total} tugas
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-card)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] px-3 py-2 text-xs text-[color-mix(in_srgb,var(--color-card)_82%,transparent)] backdrop-blur">
                        <BarChart3 size={14} />
                        {summary.progress}% progres
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadTugas(true)}
                      disabled={refreshing}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-card)_16%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-4 text-sm font-medium text-[var(--color-card)] backdrop-blur transition-all hover:bg-[color-mix(in_srgb,var(--color-card)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw
                        size={16}
                        className={
                          refreshing
                            ? "animate-spin"
                            : ""
                        }
                      />

                      <span className="hidden sm:inline">
                        Refresh
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/guru/tugas/tambah"
                        )
                      }
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition-all active:scale-[0.98] ${themePrimaryGradient} ${themePrimaryShadow}`}
                    >
                      <Plus size={17} />
                      Buat Tugas
                    </button>
                  </div>
                </div>

                {/* STATISTICS */}

                <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-card)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[color-mix(in_srgb,var(--color-card)_70%,transparent)]">
                      <ClipboardList size={15} />
                      <span className="text-xs font-medium">
                        Total Tugas
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-[var(--color-card)]">
                      {summary.total}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-card)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[color-mix(in_srgb,var(--color-card)_70%,transparent)]">
                      <Clock size={15} />
                      <span className="text-xs font-medium">
                        Sedang Berjalan
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-[var(--color-card)]">
                      {summary.berjalan}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-card)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[color-mix(in_srgb,var(--color-card)_70%,transparent)]">
                      <CalendarDays size={15} />
                      <span className="text-xs font-medium">
                        Berakhir
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-[var(--color-card)]">
                      {summary.berakhir}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-card)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[color-mix(in_srgb,var(--color-card)_70%,transparent)]">
                      <CheckCircle2 size={15} />
                      <span className="text-xs font-medium">
                        Pengumpulan
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-[var(--color-card)]">
                      {summary.totalPengumpulan}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 ${themeDangerSurface} ${themeDangerBorder} theme-danger`}
              >
                <div
                  className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder}`}
                >
                  <AlertCircle size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm leading-5 opacity-80">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className={`rounded-lg p-1 transition ${themeNeutralHover}`}
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`}
              >
                <div
                  className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeSuccessBorder}`}
                >
                  <CheckCircle2 size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm opacity-80">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                FILTER
            ================================================== */}

            <section
              className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div
                className={`border-b p-5 sm:p-6 ${themeDivider}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                    >
                      <Filter size={18} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-semibold">
                        Filter Tugas
                      </h2>

                      <p className="theme-text-secondary mt-0.5 text-xs">
                        Cari dan saring tugas berdasarkan
                        kelas atau status.
                      </p>
                    </div>
                  </div>

                  {hasFilter && (
                    <button
                      type="button"
                      onClick={resetFilter}
                      className={`theme-text-secondary inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:self-auto ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                    >
                      <X size={14} />
                      Reset filter
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {/* KELAS */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                      Kelas
                    </label>

                    <KelasSearchDropdown
                      value={selectedKelas}
                      options={kelasOptions}
                      onChange={setSelectedKelas}
                    />
                  </div>

                  {/* STATUS */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                      Status
                    </label>

                    <div className="relative">
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(
                            e.target.value
                          )
                        }
                        className={`theme-input h-11 w-full appearance-none rounded-xl border px-3.5 pr-10 text-sm outline-none transition ${themeNeutralBorder} ${themeFocus}`}
                      >
                        <option value="">
                          Semua Status
                        </option>

                        <option value="Terkirim">
                          Sedang Berjalan
                        </option>

                        <option value="Berakhir">
                          Berakhir
                        </option>
                      </select>

                      <ChevronDown
                        size={17}
                        className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>

                  {/* SEARCH */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                      Pencarian
                    </label>

                    <div className="relative">
                      <Search
                        size={17}
                        className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) =>
                          setSearchQuery(
                            e.target.value
                          )
                        }
                        placeholder="Cari judul atau mata pelajaran..."
                        className={`theme-input h-11 w-full rounded-xl border pl-10 pr-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeNeutralBorder} ${themeFocus}`}
                      />
                    </div>
                  </div>
                </div>

                {/* FILTER RESULT */}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="theme-text-muted text-xs">
                    Menampilkan
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                  >
                    {filteredTugas.length} tugas
                  </span>

                  {selectedKelas && (
                    <span
                      className={`theme-text-secondary rounded-full border px-2.5 py-1 text-xs ${themeNeutralSurface} ${themeNeutralBorder}`}
                    >
                      {selectedKelas}
                    </span>
                  )}

                  {selectedStatus && (
                    <span
                      className={`theme-text-secondary rounded-full border px-2.5 py-1 text-xs ${themeNeutralSurface} ${themeNeutralBorder}`}
                    >
                      {selectedStatus}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                LIST HEADER
            ================================================== */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="theme-text text-lg font-bold">
                    Daftar Tugas
                  </h2>

                  {!loading && (
                    <span
                      className={`theme-text-secondary rounded-full px-2 py-0.5 text-xs font-medium ${themeNeutralSurface}`}
                    >
                      {filteredTugas.length}
                    </span>
                  )}
                </div>

                <p className="theme-text-secondary mt-1 text-sm">
                  Kelola tugas dan pantau pengumpulan
                  siswa.
                </p>
              </div>

              {!loading &&
                filteredTugas.length > 0 && (
                  <div className="theme-text-secondary inline-flex items-center gap-2 text-xs">
                    <BarChart3 size={14} />

                    Rata-rata pengumpulan{" "}

                    <span className="theme-text font-semibold">
                      {summary.progress}%
                    </span>
                  </div>
                )}
            </div>

            {/* =================================================
                LOADING
            ================================================== */}

            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <TaskSkeleton
                      key={index}
                    />
                  )
                )}
              </div>
            ) : filteredTugas.length === 0 ? (
              /* =================================================
                 EMPTY
              ================================================== */

              <section
                className={`theme-card rounded-2xl border border-dashed px-6 py-14 text-center ${themeNeutralBorder}`}
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                >
                  {hasFilter ? (
                    <Search size={27} />
                  ) : (
                    <Inbox size={27} />
                  )}
                </div>

                <h3 className="theme-text mt-5 text-base font-semibold">
                  {hasFilter
                    ? "Tugas tidak ditemukan"
                    : "Belum ada tugas"}
                </h3>

                <p className="theme-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                  {hasFilter
                    ? "Tidak ada tugas yang sesuai dengan filter atau pencarian yang digunakan."
                    : "Belum ada tugas yang dibuat. Mulai buat tugas pertama untuk siswa."}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {hasFilter && (
                    <button
                      type="button"
                      onClick={resetFilter}
                      className={`theme-card theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${themeNeutralBorder} ${themeNeutralHover}`}
                    >
                      <RefreshCw size={15} />
                      Reset Filter
                    </button>
                  )}

                  {!hasFilter && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/guru/tugas/tambah"
                        )
                      }
                      className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} ${themePrimaryShadow}`}
                    >
                      <Plus size={16} />
                      Buat Tugas
                    </button>
                  )}
                </div>
              </section>
            ) : (
              /* =================================================
                 TASK GRID
              ================================================== */

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredTugas.map(
                  (item, index) => {
                    const id = getTugasId(item);

                    const judul =
                      getJudulTugas(item);

                    const mapel =
                      getMapelNama(item);

                    const kelas =
                      getKelasNama(item);

                    const deskripsi =
                      getDeskripsiTugas(item);

                    const deadline =
                      getDeadline(item);

                    const status =
                      getStatusTugas(item);

                    const submitted =
                      getJumlahPengumpulan(item);

                    const totalSiswa =
                      getTotalSiswa(item);

                    const progress =
                      getProgress(item);

                    const deadlineState =
                      getDeadlineState(item);

                    const statusClass =
                      status === "Berakhir"
                        ? `${themeDangerSurface} theme-danger ${themeDangerBorder}`
                        : `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`;

                    const deadlineSurface =
                      deadlineState.type ===
                      "expired"
                        ? `${themeDangerSurface} ${themeDangerBorder} theme-danger`
                        : deadlineState.type ===
                          "urgent"
                        ? `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                        : deadlineState.type ===
                          "soon"
                        ? `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                        : `${themeNeutralSurface} ${themeNeutralBorder}`;

                    const deadlineText =
                      deadlineState.type ===
                      "expired"
                        ? "theme-danger"
                        : deadlineState.type ===
                            "urgent" ||
                          deadlineState.type ===
                            "soon"
                        ? "text-[var(--color-warning)]"
                        : "theme-text";

                    const deadlineIcon =
                      deadlineState.type ===
                      "expired"
                        ? "theme-danger"
                        : deadlineState.type ===
                            "urgent" ||
                          deadlineState.type ===
                            "soon"
                        ? "text-[var(--color-warning)]"
                        : "theme-text-muted";

                    return (
                      <article
                        key={
                          id ||
                          `tugas-${index}`
                        }
                        className={`theme-card group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${themeNeutralBorder} ${themeCardShadow}`}
                      >
                        {/* CARD TOP */}

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                              >
                                <ClipboardList
                                  size={20}
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="theme-text-muted flex items-center gap-1.5 text-xs">
                                  <GraduationCap
                                    size={13}
                                  />

                                  <span className="truncate">
                                    {mapel}
                                  </span>
                                </div>

                                <div className="mt-1 flex items-center gap-1.5">
                                  <Users
                                    size={12}
                                    className="theme-text-muted"
                                  />

                                  <span className="theme-text-secondary truncate text-xs font-medium">
                                    {kelas}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* STATUS */}

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
                            >
                              {status ===
                              "Berakhir"
                                ? "Berakhir"
                                : "Berjalan"}
                            </span>
                          </div>

                          {/* TITLE */}

                          <h3 className={`theme-text mt-5 line-clamp-2 min-h-[48px] text-base font-bold leading-6 transition-colors group-hover:text-[var(--color-primary)]`}>
                            {judul}
                          </h3>

                          {/* DESCRIPTION */}

                          <p className="theme-text-secondary mt-2 line-clamp-2 min-h-[40px] text-sm leading-5">
                            {deskripsi ||
                              "Tidak ada deskripsi tugas."}
                          </p>

                          {/* DEADLINE */}

                          <div
                            className={`mt-5 rounded-xl border p-3 ${deadlineSurface}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <CalendarDays
                                  size={15}
                                  className={`shrink-0 ${deadlineIcon}`}
                                />

                                <div className="min-w-0">
                                  <p className="theme-text-muted text-[11px] font-medium">
                                    Deadline
                                  </p>

                                  <p
                                    className={`mt-0.5 truncate text-xs font-semibold ${deadlineText}`}
                                  >
                                    {formatTanggal(
                                      deadline
                                    )}
                                  </p>
                                </div>
                              </div>

                              {deadline && (
                                <span
                                  className={`shrink-0 text-[10px] font-medium ${deadlineText}`}
                                >
                                  {
                                    deadlineState.label
                                  }
                                </span>
                              )}
                            </div>

                            {deadline && (
                              <p className="theme-text-muted mt-2 pl-[23px] text-[10px]">
                                {formatTanggalLengkap(
                                  deadline
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* SUBMISSION */}

                        <div
                          className={`mt-auto border-t px-5 py-4 ${themeDivider} ${themeNeutralSurface}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`theme-card flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimaryText} ${themeSmallShadow}`}
                              >
                                <FileCheck2
                                  size={15}
                                />
                              </div>

                              <div>
                                <p className="theme-text-muted text-[11px]">
                                  Pengumpulan
                                </p>

                                <p className="theme-text text-xs font-semibold">
                                  {submitted}

                                  {totalSiswa >
                                  0
                                    ? ` / ${totalSiswa}`
                                    : ""}{" "}
                                  siswa
                                </p>
                              </div>
                            </div>

                            <span className={`text-sm font-bold ${themePrimaryText}`}>
                              {progress}%
                            </span>
                          </div>

                          {/* PROGRESS */}

                          <div
                            className={`mt-3 h-1.5 overflow-hidden rounded-full ${themeNeutralSurface}`}
                          >
                            <div
                              className={`h-full rounded-full ${themePrimaryGradient} transition-all`}
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          {totalSiswa === 0 && (
                            <p className="theme-text-muted mt-2 text-[10px]">
                              Data jumlah siswa
                              belum tersedia.
                            </p>
                          )}

                          {/* ACTIONS */}

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleView(
                                  item
                                )
                              }
                              disabled={!id}
                              className={`theme-card theme-text-secondary inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition ${themeNeutralBorder} ${themeNeutralHover} hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <Eye size={14} />
                              Lihat
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  item
                                )
                              }
                              disabled={!id}
                              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-4 text-xs font-semibold transition ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText} hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}

            {/* =================================================
                FOOTER SUMMARY
            ================================================== */}

            {!loading && tugas.length > 0 && (
              <section
                className={`theme-card rounded-2xl border p-5 sm:p-6 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                    >
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <p className="theme-text text-sm font-semibold">
                        Ringkasan aktivitas tugas
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs">
                        Pantau perkembangan tugas yang
                        sedang diberikan kepada siswa.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div
                      className={`min-w-[100px] rounded-xl px-4 py-3 ${themeNeutralSurface}`}
                    >
                      <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wide">
                        Aktif
                      </p>

                      <p className="theme-text mt-1 text-lg font-bold">
                        {summary.berjalan}
                      </p>
                    </div>

                    <div
                      className={`min-w-[100px] rounded-xl px-4 py-3 ${themeNeutralSurface}`}
                    >
                      <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wide">
                        Berakhir
                      </p>

                      <p className="theme-text mt-1 text-lg font-bold">
                        {summary.berakhir}
                      </p>
                    </div>

                    <div
                      className={`col-span-2 min-w-[100px] rounded-xl px-4 py-3 sm:col-span-1 ${themePrimarySoft} ${themePrimarySoftBorder} border`}
                    >
                      <p className={`${themePrimaryText} text-[10px] font-medium uppercase tracking-wide`}>
                        Pengumpulan
                      </p>

                      <p
                        className={`mt-1 text-lg font-bold ${themePrimaryText}`}
                      >
                        {summary.totalPengumpulan}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="h-2" />
          </div>
        </main>
      </div>
    </div>
  );
}