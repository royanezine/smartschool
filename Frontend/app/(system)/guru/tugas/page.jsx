"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

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
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { getTugasGuru } from "../../../services/tugas.service";

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

  return Math.min(100, Math.round((submitted / total) * 100));
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
      if (!event.target.closest("[data-kelas-dropdown]")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

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
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex h-11 w-full items-center justify-between
          rounded-xl border border-slate-200 bg-white
          px-3.5 text-left text-sm
          transition-all duration-200
          hover:border-blue-300
          focus:outline-none focus:ring-2 focus:ring-blue-100
        "
      >
        <span
          className={
            value
              ? "truncate text-slate-700"
              : "text-slate-400"
          }
        >
          {value || "Semua Kelas"}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="
            absolute left-0 right-0 z-50 mt-2
            overflow-hidden rounded-xl border border-slate-200
            bg-white shadow-xl shadow-slate-200/60
          "
        >
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search
                size={15}
                className="
                  pointer-events-none absolute left-3
                  top-1/2 -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kelas..."
                autoFocus
                className="
                  h-9 w-full rounded-lg
                  border border-slate-200
                  bg-slate-50 pl-9 pr-3
                  text-sm text-slate-700
                  outline-none
                  focus:border-blue-400
                  focus:bg-white
                "
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5">
            <button
              type="button"
              onClick={() => selectValue("")}
              className={`
                flex w-full items-center rounded-lg
                px-3 py-2.5 text-left text-sm
                transition
                ${
                  !value
                    ? "bg-blue-50 font-medium text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              Semua Kelas
            </button>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => selectValue(item)}
                  className={`
                    flex w-full items-center rounded-lg
                    px-3 py-2.5 text-left text-sm
                    transition
                    ${
                      value === item
                        ? "bg-blue-50 font-medium text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  {item}
                </button>
              ))
            ) : (
              <div className="px-3 py-5 text-center text-sm text-slate-400">
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="animate-pulse p-5">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-200" />

            <div>
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-32 rounded bg-slate-200" />
            </div>
          </div>

          <div className="h-6 w-20 rounded-full bg-slate-200" />
        </div>

        <div className="h-5 w-4/5 rounded bg-slate-200" />

        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-3/4 rounded bg-slate-200" />
        </div>

        <div className="mt-5 h-16 rounded-xl bg-slate-100" />

        <div className="mt-5 flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-slate-200" />
          <div className="h-10 w-20 rounded-lg bg-slate-200" />
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
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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
          : Array.isArray(response?.data?.result)
          ? response.data.result
          : [];

        setTugas(data);
      } catch (err) {
        console.error("Gagal mengambil data tugas:", err);

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
      const judul = getJudulTugas(item)
        .toLowerCase();

      const deskripsi = getDeskripsiTugas(item)
        .toLowerCase();

      const mapel = getMapelNama(item)
        .toLowerCase();

      const kelas = getKelasNama(item);

      const status = getStatusTugas(item);

      const matchesSearch =
        !keyword ||
        judul.includes(keyword) ||
        deskripsi.includes(keyword) ||
        mapel.includes(keyword) ||
        kelas.toLowerCase().includes(keyword);

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
            (totalPengumpulan / totalSiswa) * 100
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
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

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                HERO
            ================================================== */}

            <section
              className="
                relative overflow-hidden rounded-2xl
                border border-white/10
                bg-gradient-to-br
                from-slate-950
                via-[#182a4e]
                to-[#0a1e47]
                p-6 shadow-xl
                sm:p-8
              "
            >
              {/* Background decoration */}

              <div
                className="
                  pointer-events-none absolute
                  -right-20 -top-24
                  h-72 w-72 rounded-full
                  bg-blue-400/20 blur-3xl
                "
              />

              <div
                className="
                  pointer-events-none absolute
                  -bottom-32 left-1/3
                  h-80 w-80 rounded-full
                  bg-indigo-500/20 blur-3xl
                "
              />

              <div
                className="
                  pointer-events-none absolute
                  right-1/4 top-1/2
                  h-32 w-32 rounded-full
                  bg-white/5 blur-2xl
                "
              />

              <div className="relative z-10">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                  {/* Hero title */}

                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <div
                        className="
                          flex h-12 w-12 shrink-0
                          items-center justify-center
                          rounded-xl border
                          border-white/15
                          bg-white/10
                          backdrop-blur
                        "
                      >
                        <ClipboardList
                          size={25}
                          className="text-white"
                        />
                      </div>

                      <span
                        className="
                          rounded-full border
                          border-blue-200/20
                          bg-blue-400/10
                          px-3 py-1
                          text-xs font-semibold
                          tracking-wide
                          text-blue-100
                        "
                      >
                        GURU
                      </span>
                    </div>

                    <h1
                      className="
                        text-2xl font-bold
                        tracking-tight text-white
                        sm:text-3xl
                      "
                    >
                      Tugas & Pengumpulan
                    </h1>

                    <p
                      className="
                        mt-2 max-w-2xl
                        text-sm leading-6
                        text-blue-100/80
                        sm:text-base
                      "
                    >
                      Buat tugas, pantau deadline,
                      dan lihat progres pengumpulan
                      siswa dalam satu halaman.
                    </p>

                    {/* Mini info */}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <div
                        className="
                          inline-flex items-center gap-2
                          rounded-lg border
                          border-white/10
                          bg-white/10
                          px-3 py-2
                          text-xs text-white/80
                          backdrop-blur
                        "
                      >
                        <ListChecks size={14} />
                        {summary.total} tugas
                      </div>

                      <div
                        className="
                          inline-flex items-center gap-2
                          rounded-lg border
                          border-white/10
                          bg-white/10
                          px-3 py-2
                          text-xs text-white/80
                          backdrop-blur
                        "
                      >
                        <BarChart3 size={14} />
                        {summary.progress}% progres
                      </div>
                    </div>
                  </div>

                  {/* Hero actions */}

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadTugas(true)}
                      disabled={refreshing}
                      className="
                        inline-flex h-10
                        items-center justify-center
                        gap-2 rounded-xl
                        border border-white/15
                        bg-white/10
                        px-4 text-sm font-medium
                        text-white
                        backdrop-blur
                        transition-all
                        hover:bg-white/15
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
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
                      className="
                        inline-flex h-10
                        items-center justify-center
                        gap-2 rounded-xl
                        bg-white px-4
                        text-sm font-semibold
                        text-[#155DFC]
                        shadow-lg shadow-blue-950/20
                        transition-all
                        hover:bg-blue-50
                        active:scale-[0.98]
                      "
                    >
                      <Plus size={17} />
                      Buat Tugas
                    </button>
                  </div>
                </div>

                {/* Hero statistics */}

                <div
                  className="
                    mt-8 grid grid-cols-2
                    gap-3 lg:grid-cols-4
                  "
                >
                  <div
                    className="
                      rounded-xl border
                      border-white/10
                      bg-white/10
                      p-4 backdrop-blur-sm
                    "
                  >
                    <div className="flex items-center gap-2 text-blue-100/70">
                      <ClipboardList size={15} />
                      <span className="text-xs font-medium">
                        Total Tugas
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {summary.total}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-xl border
                      border-white/10
                      bg-white/10
                      p-4 backdrop-blur-sm
                    "
                  >
                    <div className="flex items-center gap-2 text-blue-100/70">
                      <Clock size={15} />
                      <span className="text-xs font-medium">
                        Sedang Berjalan
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {summary.berjalan}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-xl border
                      border-white/10
                      bg-white/10
                      p-4 backdrop-blur-sm
                    "
                  >
                    <div className="flex items-center gap-2 text-blue-100/70">
                      <CalendarDays size={15} />
                      <span className="text-xs font-medium">
                        Berakhir
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {summary.berakhir}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-xl border
                      border-white/10
                      bg-white/10
                      p-4 backdrop-blur-sm
                    "
                  >
                    <div className="flex items-center gap-2 text-blue-100/70">
                      <CheckCircle2 size={15} />
                      <span className="text-xs font-medium">
                        Pengumpulan
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {summary.totalPengumpulan}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                ALERT ERROR
            ================================================== */}

            {error && (
              <div
                className="
                  flex items-start gap-3
                  rounded-xl border
                  border-rose-200
                  bg-rose-50
                  p-4
                "
              >
                <div
                  className="
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-lg bg-rose-100
                    text-rose-600
                  "
                >
                  <AlertCircle size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-rose-700">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm leading-5 text-rose-600">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="
                    shrink-0 rounded-lg p-1
                    text-rose-400
                    transition
                    hover:bg-rose-100
                    hover:text-rose-600
                  "
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
                className="
                  flex items-start gap-3
                  rounded-xl border
                  border-emerald-200
                  bg-emerald-50
                  p-4
                "
              >
                <div
                  className="
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-lg bg-emerald-100
                    text-emerald-600
                  "
                >
                  <CheckCircle2 size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-emerald-700">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm text-emerald-600">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                FILTER
            ================================================== */}

            <section
              className="
                rounded-2xl
                border border-slate-200/80
                bg-white
                shadow-sm
              "
            >
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl bg-blue-50
                        text-[#155DFC]
                      "
                    >
                      <Filter size={18} />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Filter Tugas
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Cari dan saring tugas berdasarkan
                        kelas atau status.
                      </p>
                    </div>
                  </div>

                  {hasFilter && (
                    <button
                      type="button"
                      onClick={resetFilter}
                      className="
                        inline-flex items-center
                        gap-1.5 self-start
                        rounded-lg px-2.5 py-1.5
                        text-xs font-medium
                        text-slate-500
                        transition
                        hover:bg-slate-100
                        hover:text-slate-700
                        sm:self-auto
                      "
                    >
                      <X size={14} />
                      Reset filter
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div
                  className="
                    grid grid-cols-1 gap-4
                    md:grid-cols-2
                    xl:grid-cols-3
                  "
                >
                  {/* Kelas */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                      Kelas
                    </label>

                    <KelasSearchDropdown
                      value={selectedKelas}
                      options={kelasOptions}
                      onChange={setSelectedKelas}
                    />
                  </div>

                  {/* Status */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">
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
                        className="
                          h-11 w-full appearance-none
                          rounded-xl border
                          border-slate-200
                          bg-white px-3.5 pr-10
                          text-sm text-slate-700
                          outline-none
                          transition
                          hover:border-blue-300
                          focus:border-blue-400
                          focus:ring-2
                          focus:ring-blue-100
                        "
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
                        className="
                          pointer-events-none
                          absolute right-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />
                    </div>
                  </div>

                  {/* Search */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                      Pencarian
                    </label>

                    <div className="relative">
                      <Search
                        size={17}
                        className="
                          pointer-events-none
                          absolute left-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
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
                        className="
                          h-11 w-full
                          rounded-xl border
                          border-slate-200
                          bg-white
                          pl-10 pr-3
                          text-sm text-slate-700
                          outline-none
                          transition
                          placeholder:text-slate-400
                          hover:border-blue-300
                          focus:border-blue-400
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* Filter result */}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Menampilkan
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-blue-50
                      px-2.5 py-1
                      text-xs font-semibold
                      text-blue-600
                    "
                  >
                    {filteredTugas.length} tugas
                  </span>

                  {selectedKelas && (
                    <span
                      className="
                        rounded-full
                        border border-slate-200
                        bg-slate-50
                        px-2.5 py-1
                        text-xs text-slate-600
                      "
                    >
                      {selectedKelas}
                    </span>
                  )}

                  {selectedStatus && (
                    <span
                      className="
                        rounded-full
                        border border-slate-200
                        bg-slate-50
                        px-2.5 py-1
                        text-xs text-slate-600
                      "
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
                  <h2 className="text-lg font-bold text-slate-800">
                    Daftar Tugas
                  </h2>

                  {!loading && (
                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-2 py-0.5
                        text-xs font-medium
                        text-slate-500
                      "
                    >
                      {filteredTugas.length}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Kelola tugas dan pantau pengumpulan
                  siswa.
                </p>
              </div>

              {!loading && filteredTugas.length > 0 && (
                <div
                  className="
                    inline-flex items-center gap-2
                    text-xs text-slate-500
                  "
                >
                  <BarChart3 size={14} />
                  Rata-rata pengumpulan{" "}
                  <span className="font-semibold text-slate-700">
                    {summary.progress}%
                  </span>
                </div>
              )}
            </div>

            {/* =================================================
                LOADING
            ================================================== */}

            {loading ? (
              <div
                className="
                  grid grid-cols-1 gap-5
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
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
                  EMPTY STATE
              ================================================== */

              <section
                className="
                  rounded-2xl
                  border border-dashed
                  border-slate-300
                  bg-white
                  px-6 py-14
                  text-center
                "
              >
                <div
                  className="
                    mx-auto flex h-16 w-16
                    items-center justify-center
                    rounded-2xl bg-slate-100
                    text-slate-400
                  "
                >
                  {hasFilter ? (
                    <Search size={27} />
                  ) : (
                    <Inbox size={27} />
                  )}
                </div>

                <h3 className="mt-5 text-base font-semibold text-slate-800">
                  {hasFilter
                    ? "Tugas tidak ditemukan"
                    : "Belum ada tugas"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {hasFilter
                    ? "Tidak ada tugas yang sesuai dengan filter atau pencarian yang digunakan."
                    : "Belum ada tugas yang dibuat. Mulai buat tugas pertama untuk siswa."}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {hasFilter && (
                    <button
                      type="button"
                      onClick={resetFilter}
                      className="
                        inline-flex h-10
                        items-center gap-2
                        rounded-xl
                        border border-slate-200
                        bg-white px-4
                        text-sm font-medium
                        text-slate-600
                        transition
                        hover:bg-slate-50
                      "
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
                      className="
                        inline-flex h-10
                        items-center gap-2
                        rounded-xl
                        bg-[#155DFC]
                        px-4
                        text-sm font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#0d47c9]
                      "
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

              <div
                className="
                  grid grid-cols-1 gap-5
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {filteredTugas.map((item, index) => {
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

                  return (
                    <article
                      key={id || `tugas-${index}`}
                      className="
                        group flex h-full
                        flex-col overflow-hidden
                        rounded-2xl
                        border border-slate-200/80
                        bg-white
                        shadow-sm
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:border-blue-200
                        hover:shadow-lg
                        hover:shadow-slate-200/60
                      "
                    >
                      {/* Card top */}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="
                                flex h-11 w-11
                                shrink-0 items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-[#155DFC]
                                transition
                                group-hover:bg-blue-100
                              "
                            >
                              <ClipboardList
                                size={20}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
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
                                  className="text-slate-400"
                                />

                                <span className="truncate text-xs font-medium text-slate-600">
                                  {kelas}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status */}

                          <span
                            className={`
                              shrink-0 rounded-full
                              border px-2.5 py-1
                              text-[11px] font-semibold
                              ${
                                status ===
                                "Berakhir"
                                  ? "border-rose-200 bg-rose-50 text-rose-600"
                                  : "border-blue-200 bg-blue-50 text-blue-600"
                              }
                            `}
                          >
                            {status === "Berakhir"
                              ? "Berakhir"
                              : "Berjalan"}
                          </span>
                        </div>

                        {/* Title */}

                        <h3
                          className="
                            mt-5 line-clamp-2
                            min-h-[48px]
                            text-base font-bold
                            leading-6
                            text-slate-800
                            transition
                            group-hover:text-[#155DFC]
                          "
                        >
                          {judul}
                        </h3>

                        {/* Description */}

                        <p
                          className="
                            mt-2 line-clamp-2
                            min-h-[40px]
                            text-sm leading-5
                            text-slate-500
                          "
                        >
                          {deskripsi ||
                            "Tidak ada deskripsi tugas."}
                        </p>

                        {/* Deadline */}

                        <div
                          className={`
                            mt-5 rounded-xl
                            border p-3
                            ${
                              deadlineState.type ===
                              "expired"
                                ? "border-rose-100 bg-rose-50/60"
                                : deadlineState.type ===
                                  "urgent"
                                ? "border-amber-100 bg-amber-50/70"
                                : deadlineState.type ===
                                  "soon"
                                ? "border-amber-100 bg-amber-50/50"
                                : "border-slate-100 bg-slate-50"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <CalendarDays
                                size={15}
                                className={
                                  deadlineState.type ===
                                  "expired"
                                    ? "shrink-0 text-rose-500"
                                    : deadlineState.type ===
                                      "urgent"
                                    ? "shrink-0 text-amber-600"
                                    : "shrink-0 text-slate-400"
                                }
                              />

                              <div className="min-w-0">
                                <p className="text-[11px] font-medium text-slate-400">
                                  Deadline
                                </p>

                                <p
                                  className={`
                                    mt-0.5 truncate
                                    text-xs font-semibold
                                    ${
                                      deadlineState.type ===
                                      "expired"
                                        ? "text-rose-600"
                                        : deadlineState.type ===
                                          "urgent"
                                        ? "text-amber-700"
                                        : "text-slate-700"
                                    }
                                  `}
                                >
                                  {formatTanggal(
                                    deadline
                                  )}
                                </p>
                              </div>
                            </div>

                            {deadline && (
                              <span
                                className={`
                                  shrink-0 text-[10px]
                                  font-medium
                                  ${
                                    deadlineState.type ===
                                    "expired"
                                      ? "text-rose-500"
                                      : deadlineState.type ===
                                        "urgent"
                                      ? "text-amber-600"
                                      : deadlineState.type ===
                                        "soon"
                                      ? "text-amber-600"
                                      : "text-slate-400"
                                  }
                                `}
                              >
                                {
                                  deadlineState.label
                                }
                              </span>
                            )}
                          </div>

                          {deadline && (
                            <p className="mt-2 pl-[23px] text-[10px] text-slate-400">
                              {formatTanggalLengkap(
                                deadline
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Submission section */}

                      <div
                        className="
                          mt-auto
                          border-t border-slate-100
                          bg-slate-50/50
                          px-5 py-4
                        "
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="
                                flex h-8 w-8
                                items-center justify-center
                                rounded-lg
                                bg-white
                                text-[#155DFC]
                                shadow-sm
                              "
                            >
                              <FileCheck2
                                size={15}
                              />
                            </div>

                            <div>
                              <p className="text-[11px] text-slate-400">
                                Pengumpulan
                              </p>

                              <p className="text-xs font-semibold text-slate-700">
                                {submitted}
                                {totalSiswa > 0
                                  ? ` / ${totalSiswa}`
                                  : ""}{" "}
                                siswa
                              </p>
                            </div>
                          </div>

                          <span className="text-sm font-bold text-[#155DFC]">
                            {progress}%
                          </span>
                        </div>

                        {/* Progress bar */}

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="
                              h-full rounded-full
                              bg-gradient-to-r
                              from-[#155DFC]
                              to-blue-400
                              transition-all
                            "
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        {totalSiswa === 0 && (
                          <p className="mt-2 text-[10px] text-slate-400">
                            Data jumlah siswa belum
                            tersedia.
                          </p>
                        )}

                        {/* Actions */}

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleView(item)
                            }
                            disabled={!id}
                            className="
                              inline-flex h-9
                              flex-1 items-center
                              justify-center gap-1.5
                              rounded-lg
                              border border-slate-200
                              bg-white
                              text-xs font-semibold
                              text-slate-600
                              transition
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-[#155DFC]
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            <Eye size={14} />
                            Lihat
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(item)
                            }
                            disabled={!id}
                            className="
                              inline-flex h-9
                              items-center
                              justify-center gap-1.5
                              rounded-lg
                              bg-blue-50
                              px-4
                              text-xs font-semibold
                              text-[#155DFC]
                              transition
                              hover:bg-blue-100
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* =================================================
                FOOTER SUMMARY
            ================================================== */}

            {!loading && tugas.length > 0 && (
              <section
                className="
                  rounded-2xl
                  border border-slate-200/80
                  bg-white
                  p-5
                  shadow-sm
                  sm:p-6
                "
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        bg-blue-50
                        text-[#155DFC]
                      "
                    >
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Ringkasan aktivitas tugas
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pantau perkembangan tugas yang
                        sedang diberikan kepada siswa.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="min-w-[100px] rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Aktif
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-800">
                        {summary.berjalan}
                      </p>
                    </div>

                    <div className="min-w-[100px] rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Berakhir
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-800">
                        {summary.berakhir}
                      </p>
                    </div>

                    <div className="col-span-2 min-w-[100px] rounded-xl bg-blue-50 px-4 py-3 sm:col-span-1">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-blue-400">
                        Pengumpulan
                      </p>

                      <p className="mt-1 text-lg font-bold text-[#155DFC]">
                        {summary.totalPengumpulan}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Bottom spacing */}
            <div className="h-2" />
          </div>
        </main>
      </div>
    </div>
  );
}