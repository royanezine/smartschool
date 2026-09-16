"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  CalendarDays,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Check,
  AlertCircle,
  Layers3,
  Clock3,
  X,
  Database,
  Eye,
  Filter,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  getTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
} from "../../../services/tahunAjaran.service";

import { getKelas } from "../../../services/kelas.service";

export default function AdminTahunAjaranPage() {
  // =========================================================
  // STATE
  // =========================================================

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [tahunAjaran, setTahunAjaran] = useState([]);
  const [kelas, setKelas] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterSemester, setFilterSemester] = useState("semua");

  const [expandedRows, setExpandedRows] = useState({});

  const itemsPerPage = 8;

  // =========================================================
  // HELPER RESPONSE
  // =========================================================

  const extractArray = (response) => {
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
  };

  // =========================================================
  // NORMALIZE TAHUN AJARAN
  // =========================================================

  const normalizeTahunAjaran = (item) => {
    if (!item) return null;

    return {
      ...item,

      // BE menggunakan tahunAjaran
      tahunAjaran:
        item?.tahunAjaran ??
        item?.nama ??
        item?.tahun_ajaran ??
        "",

      semester:
        item?.semester ?? "",

      status:
        item?.status ?? "tidak_aktif",

      sekolahId:
        item?.sekolahId ??
        item?.sekolah_id ??
        "",
    };
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [tahunResponse, kelasResponse] = await Promise.all([
        getTahunAjaran(),

        getKelas({
          page: 1,
          limit: 1000,
          sortBy: "nama",
          sortOrder: "asc",
        }),
      ]);

      console.log(
        "[TAHUN AJARAN] Response:",
        tahunResponse
      );

      console.log(
        "[KELAS] Response:",
        kelasResponse
      );

      const tahunData = extractArray(tahunResponse);
      const kelasData = extractArray(kelasResponse);

      const normalizedTahun = tahunData
        .map(normalizeTahunAjaran)
        .filter(Boolean);

      console.log(
        "[TAHUN AJARAN] Data setelah normalize:",
        normalizedTahun
      );

      setTahunAjaran(normalizedTahun);
      setKelas(kelasData);
    } catch (err) {
      console.error(
        "Gagal mengambil data tahun ajaran:",
        err
      );

      setTahunAjaran([]);
      setKelas([]);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data tahun ajaran dan kelas."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // =========================================================
  // KELOMPOKKAN KELAS BERDASARKAN TAHUN AJARAN
  // =========================================================

  const kelasByTahunAjaran = useMemo(() => {
    const grouped = {};

    kelas.forEach((item) => {
      const tahunAjaranId =
        item?.tahunAjaranId ??
        item?.tahun_ajaran_id ??
        item?.tahunAjaran?.id;

      if (!tahunAjaranId) {
        return;
      }

      if (!grouped[tahunAjaranId]) {
        grouped[tahunAjaranId] = [];
      }

      grouped[tahunAjaranId].push(item);
    });

    return grouped;
  }, [kelas]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredData = useMemo(() => {
    let result = [...tahunAjaran];

    // FILTER STATUS
    if (filterStatus !== "semua") {
      result = result.filter(
        (item) =>
          String(item?.status ?? "").toLowerCase() ===
          filterStatus.toLowerCase()
      );
    }

    // FILTER SEMESTER
    if (filterSemester !== "semua") {
      result = result.filter(
        (item) =>
          String(item?.semester ?? "").toLowerCase() ===
          filterSemester.toLowerCase()
      );
    }

    // SEARCH
    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((item) => {
        const namaTahun = String(
          item?.tahunAjaran ?? ""
        ).toLowerCase();

        const semester = String(
          item?.semester ?? ""
        ).toLowerCase();

        const status = String(
          item?.status ?? ""
        ).toLowerCase();

        const daftarKelas =
          kelasByTahunAjaran[item?.id] || [];

        const kelasMatch = daftarKelas.some(
          (kelasItem) =>
            String(kelasItem?.nama ?? "")
              .toLowerCase()
              .includes(keyword)
        );

        return (
          namaTahun.includes(keyword) ||
          semester.includes(keyword) ||
          status.includes(keyword) ||
          kelasMatch
        );
      });
    }

    return result;
  }, [
    tahunAjaran,
    kelasByTahunAjaran,
    search,
    filterStatus,
    filterSemester,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const currentItems =
    filteredData.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =========================================================
  // STATISTIK
  // =========================================================

  const activeYear = tahunAjaran.find(
    (item) =>
      item?.status === "aktif"
  );

  const activeCount = tahunAjaran.filter(
    (item) =>
      item?.status === "aktif"
  ).length;

  const inactiveCount = tahunAjaran.filter(
    (item) =>
      item?.status === "tidak_aktif"
  ).length;

  const totalKelas = kelas.length;

  // =========================================================
  // TOGGLE ROW
  // =========================================================

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // =========================================================
  // SET ACTIVE
  // =========================================================

  const handleSetActive = async (item) => {
    if (!item?.id) {
      return;
    }

    if (item?.status === "aktif") {
      return;
    }

    const confirmed = window.confirm(
      `Aktifkan tahun ajaran "${item?.tahunAjaran}" semester ${item?.semester}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await updateTahunAjaran(
        item.id,
        {
          status: "aktif",
        }
      );

      await loadData(true);
    } catch (err) {
      console.error(
        "Gagal mengaktifkan tahun ajaran:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengaktifkan tahun ajaran."
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (item) => {
    if (!item?.id) {
      return;
    }

    const message =
      item?.status === "aktif"
        ? `Tahun ajaran "${item?.tahunAjaran}" sedang aktif. Yakin ingin menghapusnya?`
        : `Yakin ingin menghapus tahun ajaran "${item?.tahunAjaran}" semester ${item?.semester}?`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      setError("");

      await deleteTahunAjaran(
        item.id
      );

      setTahunAjaran((prev) =>
        prev.filter(
          (row) =>
            row.id !== item.id
        )
      );
    } catch (err) {
      console.error(
        "Gagal menghapus tahun ajaran:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus tahun ajaran."
      );
    }
  };

  // =========================================================
  // RESET FILTER
  // =========================================================

  const handleResetSearch = () => {
    setSearch("");
    setFilterStatus("semua");
    setFilterSemester("semua");
    setCurrentPage(1);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f4f7fb]">
        <Sidebar
          active="tahunAjaran"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() =>
              setIsCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <RefreshCw
                  size={24}
                  className="animate-spin text-[#2563EB]"
                />
              </div>

              <p className="text-sm font-medium text-slate-500">
                Memuat data tahun ajaran...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f7fb]">
      {/* SIDEBAR */}

      <Sidebar
        active="tahunAjaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
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
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="space-y-6">

              {/* ================================================= */}
              {/* HERO */}
              {/* ================================================= */}

              <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#111827] via-[#050d27] to-[#0c152e] px-6 py-7 shadow-[0_12px_30px_rgba(15,23,42,0.16)] sm:px-8 sm:py-8">

                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative z-10">

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/15 text-blue-300 shadow-inner">
                        <CalendarDays size={27} />
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                            Tahun Ajaran
                          </h1>

                          <span className="rounded-full border border-blue-400/20 bg-blue-500/15 px-3 py-1 text-[11px] font-semibold text-blue-200">
                            Admin
                          </span>

                        </div>

                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-blue-200/80">
                          Kelola periode akademik,
                          semester, dan kelas sekolah
                          dalam satu tempat.
                        </p>

                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">

                      <button
                        onClick={() =>
                          loadData(true)
                        }
                        disabled={refreshing}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshCw
                          size={16}
                          className={
                            refreshing
                              ? "animate-spin"
                              : ""
                          }
                        />

                        Refresh
                      </button>

                      <Link
                        href="/admin/tahun-ajaran/tambah"
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-[#3B82F6]"
                      >
                        <Plus size={18} />
                        Tambah Tahun Ajaran
                      </Link>

                    </div>
                  </div>

                  {/* STATS */}

                  <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                          <Layers3 size={19} />
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Total Periode
                          </p>

                          <p className="mt-0.5 text-xl font-bold text-white">
                            {tahunAjaran.length}
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                          <CheckCircle size={19} />
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Periode Aktif
                          </p>

                          <p className="mt-0.5 text-xl font-bold text-white">
                            {activeCount}
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-400/10 text-slate-300">
                          <Clock3 size={19} />
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Tidak Aktif
                          </p>

                          <p className="mt-0.5 text-xl font-bold text-white">
                            {inactiveCount}
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                          <Users size={19} />
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Total Kelas
                          </p>

                          <p className="mt-0.5 text-xl font-bold text-white">
                            {totalKelas}
                          </p>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* ================================================= */}
              {/* ERROR */}
              {/* ================================================= */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <AlertCircle size={19} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold">
                      Terjadi kesalahan
                    </p>

                    <p className="mt-0.5 text-sm text-red-600">
                      {error}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setError("")
                    }
                    className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
                  >
                    <X size={18} />
                  </button>

                </div>
              )}

              {/* ================================================= */}
              {/* FILTER */}
              {/* ================================================= */}

              <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(15,23,42,0.05)] sm:p-5">

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                        <Filter size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Filter Data
                        </p>

                        <p className="text-xs text-slate-400">
                          Saring periode akademik
                        </p>
                      </div>

                    </div>

                    <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(
                          e.target.value
                        );
                        setCurrentPage(1);
                      }}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="semua">
                        Semua Status
                      </option>

                      <option value="aktif">
                        Aktif
                      </option>

                      <option value="tidak_aktif">
                        Tidak Aktif
                      </option>
                    </select>

                    <select
                      value={filterSemester}
                      onChange={(e) => {
                        setFilterSemester(
                          e.target.value
                        );
                        setCurrentPage(1);
                      }}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="semua">
                        Semua Semester
                      </option>

                      <option value="Ganjil">
                        Ganjil
                      </option>

                      <option value="Genap">
                        Genap
                      </option>
                    </select>

                  </div>

                  {/* SEARCH */}

                  <div className="relative w-full xl:max-w-[380px]">

                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(
                          e.target.value
                        );
                        setCurrentPage(1);
                      }}
                      placeholder="Cari tahun ajaran atau kelas..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    {search && (
                      <button
                        onClick={
                          handleResetSearch
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}

                  </div>

                </div>
              </section>

              {/* ================================================= */}
              {/* TABLE HEADER */}
              {/* ================================================= */}

              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <h2 className="text-xl font-bold text-[#0F172A]">
                    Daftar Tahun Ajaran
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {filteredData.length} periode ditampilkan

                    {tahunAjaran.length !==
                      filteredData.length &&
                      ` dari ${tahunAjaran.length} data`}
                  </p>

                </div>

                {(search ||
                  filterStatus !== "semua" ||
                  filterSemester !==
                    "semua") && (
                  <button
                    onClick={
                      handleResetSearch
                    }
                    className="self-start text-sm font-medium text-[#2563EB] hover:text-blue-700 sm:self-auto"
                  >
                    Reset filter
                  </button>
                )}

              </div>

              {/* ================================================= */}
              {/* TABLE */}
              {/* ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.05)]">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[950px] border-collapse">

                    <thead>

                      <tr className="border-b border-slate-100 bg-slate-50/80">

                        <th className="w-16 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          No
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Tahun Ajaran
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Semester
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Kelas
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Status
                        </th>

                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {currentItems.length ===
                      0 ? (
                        <tr>

                          <td
                            colSpan={6}
                            className="px-5 py-20 text-center"
                          >

                            <div className="mx-auto max-w-sm">

                              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                                <CalendarDays
                                  size={28}
                                />
                              </div>

                              <p className="mt-4 text-base font-semibold text-slate-700">
                                {search ||
                                filterStatus !==
                                  "semua" ||
                                filterSemester !==
                                  "semua"
                                  ? "Data tidak ditemukan"
                                  : "Belum ada tahun ajaran"}
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-400">
                                {search ||
                                filterStatus !==
                                  "semua" ||
                                filterSemester !==
                                  "semua"
                                  ? "Coba ubah filter atau kata kunci pencarian."
                                  : "Tambahkan tahun ajaran baru untuk memulai."}
                              </p>

                              {(search ||
                                filterStatus !==
                                  "semua" ||
                                filterSemester !==
                                  "semua") && (
                                <button
                                  onClick={
                                    handleResetSearch
                                  }
                                  className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                                >
                                  Reset Filter
                                </button>
                              )}

                            </div>

                          </td>

                        </tr>
                      ) : (
                        currentItems.map(
                          (
                            item,
                            index
                          ) => {

                            const isActive =
                              item?.status ===
                              "aktif";

                            const daftarKelas =
                              kelasByTahunAjaran[
                                item?.id
                              ] || [];

                            const isExpanded =
                              Boolean(
                                expandedRows[
                                  item?.id
                                ]
                              );

                            return (
                              <tr
                                key={
                                  item.id
                                }
                                className={`border-b border-slate-100 last:border-0 transition ${
                                  isActive
                                    ? "bg-blue-50/25"
                                    : "hover:bg-slate-50/60"
                                }`}
                              >

                                {/* NO */}

                                <td className="px-5 py-4 text-center text-sm font-medium text-slate-400">
                                  {startIndex +
                                    index +
                                    1}
                                </td>

                                {/* TAHUN AJARAN */}

                                <td className="px-5 py-4">

                                  <div className="flex items-center gap-3">

                                    <div
                                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                        isActive
                                          ? "bg-blue-50 text-[#2563EB]"
                                          : "bg-slate-50 text-slate-500"
                                      }`}
                                    >
                                      <CalendarDays
                                        size={18}
                                      />
                                    </div>

                                    <div className="min-w-0">

                                      <p className="font-semibold text-slate-800">
                                        {item?.tahunAjaran ||
                                          "-"}
                                      </p>

                                      {item?.id && (
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                          ID:{" "}
                                          {item.id.slice(
                                            0,
                                            8
                                          )}
                                          ...
                                        </p>
                                      )}

                                    </div>

                                  </div>

                                </td>

                                {/* SEMESTER */}

                                <td className="px-5 py-4">

                                  <span
                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                      item?.semester ===
                                      "Ganjil"
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "bg-blue-50 text-blue-600"
                                    }`}
                                  >
                                    {item?.semester ||
                                      "-"}
                                  </span>

                                </td>

                                {/* KELAS */}

                                <td className="px-5 py-4">

                                  {daftarKelas.length ===
                                  0 ? (
                                    <span className="text-xs text-slate-400">
                                      Belum ada kelas
                                    </span>
                                  ) : (
                                    <div className="flex flex-col gap-2">

                                      <div className="flex items-center gap-2">

                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-600">

                                          <Users
                                            size={13}
                                          />

                                          {
                                            daftarKelas.length
                                          }{" "}
                                          kelas
                                        </span>

                                        <button
                                          onClick={() =>
                                            toggleRow(
                                              item.id
                                            )
                                          }
                                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        >
                                          {isExpanded
                                            ? "Sembunyikan"
                                            : "Lihat"}

                                          {isExpanded ? (
                                            <ChevronUp
                                              size={
                                                14
                                              }
                                            />
                                          ) : (
                                            <ChevronDown
                                              size={
                                                14
                                              }
                                            />
                                          )}
                                        </button>

                                      </div>

                                      {isExpanded && (
                                        <div className="flex max-w-[360px] flex-wrap gap-1.5 pt-1">

                                          {daftarKelas.map(
                                            (
                                              kelasItem
                                            ) => (
                                              <Link
                                                key={
                                                  kelasItem.id
                                                }
                                                href={`/admin/kelas/${kelasItem.id}`}
                                                className="rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-600 transition hover:border-violet-200 hover:bg-violet-100"
                                              >
                                                {kelasItem?.nama ||
                                                  "Kelas"}
                                              </Link>
                                            )
                                          )}

                                        </div>
                                      )}

                                    </div>
                                  )}

                                </td>

                                {/* STATUS */}

                                <td className="px-5 py-4">

                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                      isActive
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >

                                    {isActive ? (
                                      <CheckCircle
                                        size={
                                          13
                                        }
                                      />
                                    ) : (
                                      <XCircle
                                        size={
                                          13
                                        }
                                      />
                                    )}

                                    {isActive
                                      ? "Aktif"
                                      : "Tidak Aktif"}

                                  </span>

                                </td>

                                {/* AKSI */}

                                <td className="px-5 py-4">

                                  <div className="flex items-center justify-end gap-1">

                                    <Link
                                      href={`/admin/tahun-ajaran/${item.id}`}
                                      title="Detail"
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-[#2563EB]"
                                    >
                                      <Eye
                                        size={
                                          16
                                        }
                                      />
                                    </Link>

                                    {!isActive && (
                                      <button
                                        onClick={() =>
                                          handleSetActive(
                                            item
                                          )
                                        }
                                        title="Set Aktif"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                                      >
                                        <Check
                                          size={
                                            17
                                          }
                                        />
                                      </button>
                                    )}

                                    <Link
                                      href={`/admin/tahun-ajaran/edit/${item.id}`}
                                      title="Edit"
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                    >
                                      <Edit
                                        size={
                                          16
                                        }
                                      />
                                    </Link>

                                    <button
                                      onClick={() =>
                                        handleDelete(
                                          item
                                        )
                                      }
                                      title="Hapus"
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2
                                        size={
                                          16
                                        }
                                      />
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {/* PAGINATION */}

                {filteredData.length >
                  0 && (
                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-400 sm:text-sm">

                      Menampilkan{" "}

                      <span className="font-semibold text-slate-600">
                        {startIndex +
                          1}
                      </span>

                      {" - "}

                      <span className="font-semibold text-slate-600">
                        {Math.min(
                          startIndex +
                            currentItems.length,
                          filteredData.length
                        )}
                      </span>

                      {" dari "}

                      <span className="font-semibold text-slate-600">
                        {
                          filteredData.length
                        }
                      </span>

                      {" data"}

                    </p>

                    <div className="flex items-center gap-1">

                      <button
                        onClick={() =>
                          setCurrentPage(
                            (p) =>
                              Math.max(
                                1,
                                p - 1
                              )
                          )
                        }
                        disabled={
                          safeCurrentPage ===
                          1
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Sebelumnya
                      </button>

                      {Array.from(
                        {
                          length:
                            totalPages,
                        },
                        (_, i) =>
                          i + 1
                      )
                        .slice(
                          Math.max(
                            0,
                            safeCurrentPage -
                              3
                          ),
                          Math.min(
                            totalPages,
                            safeCurrentPage +
                              2
                          )
                        )
                        .map(
                          (page) => (
                            <button
                              key={
                                page
                              }
                              onClick={() =>
                                setCurrentPage(
                                  page
                                )
                              }
                              className={`h-9 w-9 rounded-lg text-xs font-semibold transition ${
                                safeCurrentPage ===
                                page
                                  ? "bg-[#2563EB] text-white shadow-sm"
                                  : "text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              {
                                page
                              }
                            </button>
                          )
                        )}

                      <button
                        onClick={() =>
                          setCurrentPage(
                            (p) =>
                              Math.min(
                                totalPages,
                                p + 1
                              )
                          )
                        }
                        disabled={
                          safeCurrentPage ===
                          totalPages
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Berikutnya
                      </button>

                    </div>

                  </div>
                )}

              </section>

              {/* ================================================= */}
              {/* ACTIVE PERIOD INFO */}
              {/* ================================================= */}

              <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                    <Database size={18} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-slate-700">
                      Informasi Periode Aktif
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">

                      {activeYear
                        ? `${activeYear.tahunAjaran} · ${activeYear.semester} adalah periode akademik yang sedang aktif dan digunakan oleh sekolah.`
                        : "Belum ada tahun ajaran yang ditetapkan sebagai periode aktif."}

                    </p>

                  </div>

                </div>

              </section>

              {/* FOOTER */}

              <footer className="py-2 text-center text-xs text-slate-400">
                © 2026 SmartSchool • Tahun Ajaran
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}