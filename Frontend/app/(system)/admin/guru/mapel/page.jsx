"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Search,
  BookMarked,
  Pencil,
  Trash2,
  Layers,
  RefreshCw,
  AlertCircle,
  Loader2,
  Plus,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
  BookOpen,
  UserRound,
} from "lucide-react";

import {
  getMataPelajaran,
  deleteMataPelajaran,
} from "@/services/mataPelajaran.service";

import { getKelasMapel } from "@/services/kelasMapel.service";

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const isActive =
    String(status || "").toLowerCase() === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border ${
        isActive
          ? "theme-success"
          : "theme-card-soft theme-text-muted theme-border"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive
            ? "bg-[var(--color-success)]"
            : "bg-[var(--color-text-muted)]"
        }`}
      />

      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconWrapper,
}) {
  return (
    <div className="relative overflow-hidden theme-card border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium theme-text-muted">
            {label}
          </p>

          <p className="mt-2 text-2xl sm:text-[28px] leading-none font-bold tracking-tight theme-text">
            {value}
          </p>

          <p className="mt-2 text-[11px] theme-text-muted">
            {description}
          </p>
        </div>

        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconWrapper}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ search, onReset }) {
  return (
    <div className="py-16 px-5 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl theme-info flex items-center justify-center">
        <BookOpen size={25} />
      </div>

      <h3 className="mt-4 text-sm sm:text-base font-semibold theme-text">
        {search
          ? "Data tidak ditemukan"
          : "Belum ada mata pelajaran"}
      </h3>

      <p className="mt-1.5 max-w-md text-xs sm:text-sm leading-relaxed theme-text-secondary">
        {search
          ? "Tidak ada mata pelajaran, guru, atau kelas yang sesuai dengan pencarian."
          : "Belum terdapat data mata pelajaran yang tersimpan pada sistem."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 px-4 py-2 rounded-lg theme-info hover:opacity-80 text-xs font-semibold transition-colors"
        >
          Reset pencarian
        </button>
      )}
    </div>
  );
}

/* =========================================================
   GURU LIST
========================================================= */

function GuruList({ assignments = [] }) {
  const guruMap = new Map();

  assignments.forEach((assignment) => {
    const guru = assignment?.guruPengajar;

    if (!guru?.id) return;

    if (!guruMap.has(guru.id)) {
      guruMap.set(guru.id, guru);
    }
  });

  const guruList = Array.from(guruMap.values());

  if (guruList.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg theme-card-soft theme-border border text-[11px] theme-text-muted">
        <UserRound size={12} />
        Belum ada guru
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {guruList.map((guru) => (
        <div
          key={guru.id}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="w-8 h-8 rounded-lg theme-info flex items-center justify-center shrink-0">
            <UserRound size={14} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold theme-text-secondary truncate">
              {guru.namaLengkap || "Nama guru tidak tersedia"}
            </p>

            {(guru.nip || guru.nuptk || guru.email) && (
              <p className="mt-0.5 text-[10px] theme-text-muted truncate">
                {guru.nip ||
                  guru.nuptk ||
                  guru.email ||
                  "-"}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MapelPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [mapel, setMapel] = useState([]);
  const [kelasMapel, setKelasMapel] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const [
          mapelResponse,
          kelasMapelResponse,
        ] = await Promise.all([
          getMataPelajaran(),
          getKelasMapel(),
        ]);

        if (!mapelResponse?.success) {
          throw new Error(
            mapelResponse?.message ||
              "Gagal mengambil data mata pelajaran."
          );
        }

        const mapelData = Array.isArray(
          mapelResponse?.data
        )
          ? mapelResponse.data
          : [];

        const kelasMapelData = Array.isArray(
          kelasMapelResponse
        )
          ? kelasMapelResponse
          : [];

        setMapel(mapelData);
        setKelasMapel(kelasMapelData);

        console.log(
          "[Mapel] Data mata pelajaran:",
          mapelData
        );

        console.log(
          "[Mapel] Data kelas mapel:",
          kelasMapelData
        );
      } catch (err) {
        console.error(
          "[Mapel] Error fetch:",
          err
        );

        setMapel([]);
        setKelasMapel([]);

        setError(
          err?.message ||
            "Gagal mengambil data mata pelajaran."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    await fetchData();
  };

  /* =========================================================
     TAMBAH
  ========================================================= */

  const handleTambah = () => {
    router.push("/admin/guru/mapel/tambah");
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (item) => {
    if (!item?.id) {
      window.alert(
        "ID mata pelajaran tidak ditemukan."
      );
      return;
    }

    router.push(
      `/admin/guru/mapel/edit/${item.id}`
    );
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (item) => {
    if (!item?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus mata pelajaran "${item.nama}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);
      setError("");

      const response =
        await deleteMataPelajaran(item.id);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal menghapus mata pelajaran."
        );
      }

      await fetchData(false);

      window.alert(
        response.message ||
          `Mata pelajaran "${item.nama}" berhasil dihapus.`
      );
    } catch (err) {
      console.error(
        "Error delete mapel:",
        err
      );

      window.alert(
        err?.message ||
          "Gagal menghapus mata pelajaran."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     GABUNGKAN MAPEL + KELAS + GURU
  ========================================================= */

  const mapelWithKelas = useMemo(() => {
    return mapel.map((item) => {
      const assignments =
        kelasMapel.filter(
          (km) =>
            String(km?.mataPelajaranId) ===
            String(item?.id)
        );

      const kelasMap = new Map();

      assignments.forEach((assignment) => {
        if (assignment?.kelas?.id) {
          kelasMap.set(
            assignment.kelas.id,
            assignment.kelas
          );
        }
      });

      const guruMap = new Map();

      assignments.forEach((assignment) => {
        if (assignment?.guruPengajar?.id) {
          guruMap.set(
            assignment.guruPengajar.id,
            assignment.guruPengajar
          );
        }
      });

      return {
        ...item,
        kelas: Array.from(
          kelasMap.values()
        ),
        guruPengajar: Array.from(
          guruMap.values()
        ),
        assignments,
      };
    });
  }, [mapel, kelasMapel]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredMapel = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return mapelWithKelas.filter((item) => {
      const namaMapel = String(
        item.nama || ""
      ).toLowerCase();

      const kodeMapel = String(
        item.kode || ""
      ).toLowerCase();

      const namaKelas =
        item.kelas
          ?.map((kelas) =>
            String(
              kelas?.nama || ""
            ).toLowerCase()
          )
          .join(" ") || "";

      const namaGuru =
        item.guruPengajar
          ?.map((guru) =>
            String(
              guru?.namaLengkap || ""
            ).toLowerCase()
          )
          .join(" ") || "";

      const nipGuru =
        item.guruPengajar
          ?.map((guru) =>
            String(
              guru?.nip ||
                guru?.nuptk ||
                ""
            ).toLowerCase()
          )
          .join(" ") || "";

      const matchSearch =
        !keyword ||
        namaMapel.includes(keyword) ||
        kodeMapel.includes(keyword) ||
        namaKelas.includes(keyword) ||
        namaGuru.includes(keyword) ||
        nipGuru.includes(keyword);

      const currentStatus = String(
        item.status || ""
      ).toLowerCase();

      const matchStatus =
        statusFilter === "semua" ||
        currentStatus === statusFilter;

      return (
        matchSearch &&
        matchStatus
      );
    });
  }, [
    search,
    statusFilter,
    mapelWithKelas,
  ]);

  /* =========================================================
     STATISTIK
  ========================================================= */

  const totalMapel = mapel.length;

  const totalAktif = mapel.filter(
    (m) =>
      String(
        m.status || ""
      ).toLowerCase() === "aktif"
  ).length;

  const totalNonaktif =
    totalMapel - totalAktif;

  const totalAssignment =
    kelasMapel.length;

  const totalGuru = useMemo(() => {
    const guruMap = new Map();

    kelasMapel.forEach((item) => {
      const guru = item?.guruPengajar;

      if (guru?.id) {
        guruMap.set(guru.id, guru);
      }
    });

    return guruMap.size;
  }, [kelasMapel]);

  /* =========================================================
     RESET FILTER
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("semua");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="guruMapel"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 min-w-0 overflow-y-auto">

          <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 lg:p-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="mb-6">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div className="flex items-start gap-3.5 min-w-0">

                  <div className="relative shrink-0">

                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-white flex items-center justify-center shadow-lg"
                      style={{
                        background:
                          "var(--color-brand-logo-bg)",
                      }}
                    >
                      <BookMarked size={21} />
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full theme-card flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                    </div>

                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h1 className="text-xl sm:text-2xl lg:text-[27px] font-bold tracking-tight theme-text">
                        Kelola Mata Pelajaran
                      </h1>

                      <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md theme-info text-[9px] font-bold tracking-wide">
                        AKADEMIK
                      </span>

                    </div>

                    <p className="mt-1.5 text-xs sm:text-sm theme-text-secondary max-w-2xl">
                      Kelola mata pelajaran, guru pengajar,
                      dan distribusi kelas yang menggunakan
                      mata pelajaran.
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2 shrink-0">

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="h-10 px-3 rounded-xl theme-card theme-border border theme-text-secondary hover:theme-sidebar-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-sm"
                  >
                    <RefreshCw
                      size={15}
                      className={
                        loading
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
                    onClick={handleTambah}
                    className="h-10 px-3.5 sm:px-4 rounded-xl theme-primary transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    <Plus size={16} />
                    Tambah Mapel
                  </button>

                </div>

              </div>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl theme-danger border">

                <div className="w-9 h-9 rounded-xl theme-card flex items-center justify-center shrink-0">
                  <AlertCircle
                    size={18}
                  />
                </div>

                <div className="flex-1 min-w-0">

                  <p className="text-sm font-semibold">
                    Gagal memuat data
                  </p>

                  <p className="mt-1 text-xs sm:text-sm break-words">
                    {error}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="text-xs font-semibold hover:opacity-70 whitespace-nowrap"
                >
                  Coba lagi
                </button>

              </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="grid grid-cols-2 xl:grid-cols-5 gap-3.5 mb-6">

              <StatCard
                icon={Layers}
                label="Total Mata Pelajaran"
                value={
                  loading
                    ? "—"
                    : totalMapel
                }
                description="Seluruh data mata pelajaran"
                iconWrapper="theme-info"
              />

              <StatCard
                icon={CheckCircle2}
                label="Mata Pelajaran Aktif"
                value={
                  loading
                    ? "—"
                    : totalAktif
                }
                description="Aktif digunakan sekolah"
                iconWrapper="theme-success"
              />

              <StatCard
                icon={XCircle}
                label="Mata Pelajaran Nonaktif"
                value={
                  loading
                    ? "—"
                    : totalNonaktif
                }
                description="Tidak aktif digunakan"
                iconWrapper="theme-card-soft theme-text-muted"
              />

              <StatCard
                icon={Users}
                label="Guru Pengajar"
                value={
                  loading
                    ? "—"
                    : totalGuru
                }
                description="Guru yang memiliki penempatan"
                iconWrapper="theme-info"
              />

              <StatCard
                icon={GraduationCap}
                label="Penempatan Kelas"
                value={
                  loading
                    ? "—"
                    : totalAssignment
                }
                description="Relasi mapel dengan kelas"
                iconWrapper="theme-info"
              />

            </section>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <section className="theme-card rounded-2xl border shadow-sm overflow-hidden">

              {/* =================================================
                  CARD HEADER
              ================================================= */}

              <div className="px-4 sm:px-5 lg:px-6 py-4 sm:py-5 theme-border border-b">

                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="w-8 h-8 rounded-lg theme-info flex items-center justify-center">
                        <BookOpen size={15} />
                      </div>

                      <h2 className="text-sm sm:text-base font-bold theme-text">
                        Daftar Mata Pelajaran
                      </h2>

                    </div>

                    <p className="mt-1.5 ml-0 sm:ml-10 text-[11px] sm:text-xs theme-text-secondary">
                      Menampilkan informasi lengkap
                      mata pelajaran, guru pengajar,
                      dan kelas.
                    </p>

                  </div>

                  {/* FILTER */}

                  <div className="flex flex-col sm:flex-row gap-2">

                    <div className="relative sm:w-[300px]">

                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />

                      <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                        placeholder="Cari mapel, guru, atau kelas..."
                        className="w-full h-10 pl-9 pr-3 rounded-xl theme-input border text-xs sm:text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all"
                      />

                    </div>

                    <div className="relative">

                      <Filter
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                      />

                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value
                          )
                        }
                        className="appearance-none w-full sm:w-[145px] h-10 pl-8 pr-8 rounded-xl theme-input border text-xs sm:text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 cursor-pointer"
                      >
                        <option value="semua">
                          Semua Status
                        </option>

                        <option value="aktif">
                          Aktif
                        </option>

                        <option value="nonaktif">
                          Nonaktif
                        </option>
                      </select>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  RESULT BAR
              ================================================= */}

              {!loading && !error && (
                <div className="px-4 sm:px-5 lg:px-6 py-2.5 theme-card-soft theme-border border-b flex items-center justify-between gap-3">

                  <p className="text-[11px] sm:text-xs theme-text-secondary">
                    Menampilkan{" "}
                    <span className="font-bold theme-text">
                      {filteredMapel.length}
                    </span>{" "}
                    mata pelajaran
                  </p>

                  {(search ||
                    statusFilter !==
                      "semua") && (
                    <button
                      type="button"
                      onClick={resetFilter}
                      className="text-[11px] sm:text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                    >
                      Reset filter
                    </button>
                  )}

                </div>
              )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">

                  <div className="w-12 h-12 rounded-2xl theme-info flex items-center justify-center">
                    <Loader2
                      size={22}
                      className="animate-spin"
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold theme-text-secondary">
                    Memuat data mata pelajaran
                  </p>

                  <p className="mt-1 text-xs theme-text-muted">
                    Mengambil mapel, guru,
                    dan kelas...
                  </p>

                </div>
              ) : filteredMapel.length === 0 ? (
                <EmptyState
                  search={
                    search ||
                    statusFilter !==
                      "semua"
                  }
                  onReset={resetFilter}
                />
              ) : (
                <>

                  {/* =================================================
                      DESKTOP TABLE
                  ================================================= */}

                  <div className="hidden lg:block overflow-x-auto">

                    <table className="w-full border-collapse min-w-[1100px]">

                      <thead>

                        <tr className="theme-table-header border-b">

                          <th className="px-5 lg:px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] w-[120px]">
                            Kode
                          </th>

                          <th className="px-5 lg:px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] min-w-[220px]">
                            Mata Pelajaran
                          </th>

                          <th className="px-5 lg:px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] min-w-[230px]">
                            Guru Pengajar
                          </th>

                          <th className="px-5 lg:px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] min-w-[300px]">
                            Kelas
                          </th>

                          <th className="px-5 lg:px-6 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em] w-[130px]">
                            Status
                          </th>

                          <th className="px-5 lg:px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] w-[120px]">
                            Aksi
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredMapel.map(
                          (m) => (
                            <tr
                              key={m.id}
                              className="group border-b last:border-0 theme-table-hover transition-colors"
                            >

                              {/* KODE */}

                              <td className="px-5 lg:px-6 py-5 align-top">

                                <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg theme-info border font-mono text-[11px] font-bold">
                                  {m.kode || "-"}
                                </span>

                              </td>

                              {/* MAPEL */}

                              <td className="px-5 lg:px-6 py-5 align-top">

                                <div className="flex items-start gap-3">

                                  <div className="w-9 h-9 rounded-xl theme-info flex items-center justify-center shrink-0 group-hover:theme-primary transition-all">
                                    <BookMarked
                                      size={16}
                                    />
                                  </div>

                                  <div className="min-w-0">

                                    <p className="text-sm font-semibold theme-text-secondary">
                                      {m.nama ||
                                        "-"}
                                    </p>

                                    <p className="mt-1 text-[11px] theme-text-muted">
                                      {m.assignments
                                        ?.length ||
                                        0}{" "}
                                      penempatan
                                      kelas
                                    </p>

                                  </div>

                                </div>

                              </td>

                              {/* GURU */}

                              <td className="px-5 lg:px-6 py-5 align-top">

                                <GuruList
                                  assignments={
                                    m.assignments
                                  }
                                />

                              </td>

                              {/* KELAS */}

                              <td className="px-5 lg:px-6 py-5 align-top">

                                {m.kelas?.length >
                                0 ? (
                                  <div className="flex flex-wrap items-center gap-1.5 max-w-[500px]">

                                    {m.kelas
                                      .map(
                                        (
                                          kelas
                                        ) => (
                                          <span
                                            key={
                                              kelas.id
                                            }
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg theme-card border text-[11px] font-medium theme-text-secondary"
                                          >
                                            <GraduationCap
                                              size={
                                                12
                                              }
                                              className="text-[var(--color-primary)]"
                                            />

                                            {
                                              kelas.nama
                                            }
                                          </span>
                                        )
                                      )}

                                  </div>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg theme-card-soft border text-[11px] theme-text-muted">
                                    Belum diassign
                                  </span>
                                )}

                              </td>

                              {/* STATUS */}

                              <td className="px-5 lg:px-6 py-5 text-center align-top">

                                <StatusBadge
                                  status={
                                    m.status
                                  }
                                />

                              </td>

                              {/* AKSI */}

                              <td className="px-5 lg:px-6 py-5 align-top">

                                <div className="flex items-center justify-end gap-1.5">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEdit(
                                        m
                                      )
                                    }
                                    title="Ubah mata pelajaran"
                                    className="w-8 h-8 rounded-lg theme-card border theme-text-muted hover:text-[var(--color-primary)] hover:theme-info flex items-center justify-center transition-all"
                                  >
                                    <Pencil
                                      size={14}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(
                                        m
                                      )
                                    }
                                    disabled={
                                      deletingId ===
                                      m.id
                                    }
                                    title="Hapus mata pelajaran"
                                    className="w-8 h-8 rounded-lg theme-card border theme-text-muted hover:theme-danger disabled:opacity-40 flex items-center justify-center transition-all"
                                  >
                                    {deletingId ===
                                    m.id ? (
                                      <Loader2
                                        size={
                                          14
                                        }
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2
                                        size={
                                          14
                                        }
                                      />
                                    )}
                                  </button>

                                </div>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* =================================================
                      TABLE MEDIUM
                  ================================================= */}

                  <div className="hidden md:block lg:hidden overflow-x-auto">

                    <table className="w-full border-collapse min-w-[900px]">

                      <thead>

                        <tr className="theme-table-header border-b">

                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wide">
                            Mata Pelajaran
                          </th>

                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wide">
                            Guru
                          </th>

                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wide">
                            Kelas
                          </th>

                          <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wide">
                            Status
                          </th>

                          <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wide">
                            Aksi
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredMapel.map(
                          (m) => (
                            <tr
                              key={m.id}
                              className="border-b theme-table-hover"
                            >

                              <td className="px-5 py-4 align-top">

                                <div className="flex items-start gap-3">

                                  <div className="w-9 h-9 rounded-xl theme-info flex items-center justify-center shrink-0">
                                    <BookMarked
                                      size={16}
                                    />
                                  </div>

                                  <div>

                                    <p className="text-sm font-semibold theme-text-secondary">
                                      {m.nama}
                                    </p>

                                    <span className="inline-flex mt-1.5 px-2 py-1 rounded-md theme-info font-mono text-[10px] font-bold">
                                      {m.kode ||
                                        "-"}
                                    </span>

                                  </div>

                                </div>

                              </td>

                              <td className="px-5 py-4 align-top">

                                <GuruList
                                  assignments={
                                    m.assignments
                                  }
                                />

                              </td>

                              <td className="px-5 py-4 align-top">

                                <div className="flex flex-wrap gap-1.5 max-w-[300px]">

                                  {m.kelas?.map(
                                    (
                                      kelas
                                    ) => (
                                      <span
                                        key={
                                          kelas.id
                                        }
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg theme-card border text-[10px] theme-text-secondary"
                                      >
                                        <GraduationCap
                                          size={
                                            11
                                          }
                                          className="text-[var(--color-primary)]"
                                        />

                                        {
                                          kelas.nama
                                        }
                                      </span>
                                    )
                                  )}

                                </div>

                              </td>

                              <td className="px-5 py-4 text-center align-top">

                                <StatusBadge
                                  status={
                                    m.status
                                  }
                                />

                              </td>

                              <td className="px-5 py-4 align-top">

                                <div className="flex items-center justify-end gap-1.5">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEdit(
                                        m
                                      )
                                    }
                                    className="w-8 h-8 rounded-lg theme-card border theme-text-muted hover:text-[var(--color-primary)] hover:theme-info flex items-center justify-center"
                                  >
                                    <Pencil
                                      size={14}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(
                                        m
                                      )
                                    }
                                    disabled={
                                      deletingId ===
                                      m.id
                                    }
                                    className="w-8 h-8 rounded-lg theme-card border theme-text-muted hover:theme-danger flex items-center justify-center"
                                  >
                                    {deletingId ===
                                    m.id ? (
                                      <Loader2
                                        size={
                                          14
                                        }
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2
                                        size={
                                          14
                                        }
                                      />
                                    )}
                                  </button>

                                </div>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* =================================================
                      MOBILE
                  ================================================= */}

                  <div className="md:hidden divide-y theme-border">

                    {filteredMapel.map(
                      (m) => (
                        <div
                          key={m.id}
                          className="p-4"
                        >

                          <div className="flex items-start gap-3">

                            <div className="w-10 h-10 rounded-xl theme-info flex items-center justify-center shrink-0">
                              <BookMarked
                                size={17}
                              />
                            </div>

                            <div className="flex-1 min-w-0">

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <h3 className="text-sm font-semibold theme-text">
                                    {m.nama ||
                                      "-"}
                                  </h3>

                                  <span className="inline-flex mt-1.5 px-2 py-1 rounded-md theme-card-soft theme-text-secondary font-mono text-[10px] font-bold">
                                    {m.kode ||
                                      "-"}
                                  </span>

                                </div>

                                <StatusBadge
                                  status={
                                    m.status
                                  }
                                />

                              </div>

                              {/* GURU */}

                              <div className="mt-4">

                                <p className="text-[10px] font-bold uppercase tracking-wide theme-text-muted mb-2">
                                  Guru Pengajar
                                </p>

                                <GuruList
                                  assignments={
                                    m.assignments
                                  }
                                />

                              </div>

                              {/* KELAS */}

                              <div className="mt-4">

                                <div className="flex items-center justify-between mb-2">

                                  <p className="text-[10px] font-bold uppercase tracking-wide theme-text-muted">
                                    Kelas
                                  </p>

                                  <span className="text-[10px] theme-text-muted">
                                    {m.kelas?.length ||
                                      0}{" "}
                                    kelas
                                  </span>

                                </div>

                                {m.kelas?.length >
                                0 ? (
                                  <div className="flex flex-wrap gap-1.5">

                                    {m.kelas.map(
                                      (
                                        kelas
                                      ) => (
                                        <span
                                          key={
                                            kelas.id
                                          }
                                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border theme-card text-[10px] font-medium theme-text-secondary"
                                        >
                                          <GraduationCap
                                            size={
                                              11
                                            }
                                            className="text-[var(--color-primary)]"
                                          />

                                          {
                                            kelas.nama
                                          }
                                        </span>
                                      )
                                    )}

                                  </div>
                                ) : (
                                  <span className="text-[11px] theme-text-muted">
                                    Belum diassign ke kelas
                                  </span>
                                )}

                              </div>

                              {/* SUMMARY */}

                              <div className="mt-4 p-3 rounded-xl theme-card-soft border">

                                <div className="grid grid-cols-2 gap-3">

                                  <div>

                                    <p className="text-[9px] uppercase tracking-wide font-bold theme-text-muted">
                                      Kode
                                    </p>

                                    <p className="mt-1 text-xs font-semibold theme-text-secondary">
                                      {m.kode ||
                                        "-"}
                                    </p>

                                  </div>

                                  <div>

                                    <p className="text-[9px] uppercase tracking-wide font-bold theme-text-muted">
                                      Penempatan
                                    </p>

                                    <p className="mt-1 text-xs font-semibold theme-text-secondary">
                                      {m.assignments
                                        ?.length ||
                                        0}{" "}
                                      kelas
                                    </p>

                                  </div>

                                </div>

                              </div>

                              {/* ACTION */}

                              <div className="flex items-center justify-end gap-2 mt-4">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      m
                                    )
                                  }
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg theme-card border text-[11px] font-semibold theme-text-secondary hover:text-[var(--color-primary)] hover:theme-info transition-all"
                                >
                                  <Pencil
                                    size={13}
                                  />
                                  Ubah
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      m
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    m.id
                                  }
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg theme-card border text-[11px] font-semibold theme-text-secondary hover:theme-danger transition-all disabled:opacity-40"
                                >
                                  {deletingId ===
                                  m.id ? (
                                    <Loader2
                                      size={
                                        13
                                      }
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={
                                        13
                                      }
                                    />
                                  )}

                                  Hapus
                                </button>

                              </div>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </>
              )}

              {/* =================================================
                  BOTTOM SUMMARY
              ================================================= */}

              {!loading &&
                filteredMapel.length >
                  0 && (
                  <div className="px-4 sm:px-5 lg:px-6 py-3.5 border-t theme-card-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    <div className="flex items-center gap-2">

                      <div className="w-6 h-6 rounded-md theme-info flex items-center justify-center">
                        <Layers size={12} />
                      </div>

                      <p className="text-[11px] theme-text-secondary">
                        Total{" "}
                        <span className="font-semibold theme-text">
                          {filteredMapel.length}
                        </span>{" "}
                        mata pelajaran ditampilkan
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={handleTambah}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                    >
                      Tambah mata pelajaran
                      <ChevronRight size={13} />
                    </button>

                  </div>
                )}

            </section>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex items-center justify-between px-1 mt-4">

              <p className="text-[10px] sm:text-[11px] theme-text-muted">
                SmartSchool • Manajemen Akademik
              </p>

              <p className="hidden sm:block text-[10px] theme-text-muted">
                Admin Sekolah
              </p>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}