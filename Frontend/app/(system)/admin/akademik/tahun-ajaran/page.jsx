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

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
} from "@/services/tahunAjaran.service";

import { getKelas } from "@/services/kelas.service";


const extractArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const normalizeTahunAjaran = (item) => {
  if (!item) return null;
  return {
    ...item,
    tahunAjaran: item?.tahunAjaran ?? item?.nama ?? item?.tahun_ajaran ?? "",
    semester: item?.semester ?? "",
    status: item?.status ?? "tidak_aktif",
    sekolahId: item?.sekolahId ?? item?.sekolah_id ?? "",
  };
};


export default function AdminTahunAjaranPage() {
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


  const loadData = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [tahunResponse, kelasResponse] = await Promise.all([
        getTahunAjaran(),
        getKelas({
          page: 1,
          limit: 1000,
          sortBy: "nama",
          sortOrder: "asc",
        }),
      ]);

      const tahunData = extractArray(tahunResponse);
      const kelasData = extractArray(kelasResponse);

      const normalizedTahun = tahunData
        .map(normalizeTahunAjaran)
        .filter(Boolean);

      setTahunAjaran(normalizedTahun);
      setKelas(kelasData);
    } catch (err) {
      console.error("Gagal mengambil data tahun ajaran:", err);
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
    const timer = setTimeout(() => {
      loadData(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);


  const kelasByTahunAjaran = useMemo(() => {
    const grouped = {};
    kelas.forEach((item) => {
      const tahunAjaranId =
        item?.tahunAjaranId ??
        item?.tahun_ajaran_id ??
        item?.tahunAjaran?.id;

      if (!tahunAjaranId) return;

      if (!grouped[tahunAjaranId]) grouped[tahunAjaranId] = [];
      grouped[tahunAjaranId].push(item);
    });
    return grouped;
  }, [kelas]);


  const filteredData = useMemo(() => {
    let result = [...tahunAjaran];

    if (filterStatus !== "semua") {
      result = result.filter(
        (item) =>
          String(item?.status ?? "").toLowerCase() ===
          filterStatus.toLowerCase()
      );
    }

    if (filterSemester !== "semua") {
      result = result.filter(
        (item) =>
          String(item?.semester ?? "").toLowerCase() ===
          filterSemester.toLowerCase()
      );
    }

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((item) => {
        const namaTahun = String(item?.tahunAjaran ?? "").toLowerCase();
        const semester = String(item?.semester ?? "").toLowerCase();
        const status = String(item?.status ?? "").toLowerCase();
        const daftarKelas = kelasByTahunAjaran[item?.id] || [];
        const kelasMatch = daftarKelas.some((k) =>
          String(k?.nama ?? "").toLowerCase().includes(keyword)
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


  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      const timer = setTimeout(() => {
        setCurrentPage(totalPages);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentPage, totalPages]);


  const activeYear = tahunAjaran.find((item) => item?.status === "aktif");
  const activeCount = tahunAjaran.filter(
    (item) => item?.status === "aktif"
  ).length;
  const inactiveCount = tahunAjaran.filter(
    (item) => item?.status === "tidak_aktif"
  ).length;
  const totalKelas = kelas.length;


  const toggleRow = (id) =>
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSetActive = async (item) => {
    if (!item?.id || item?.status === "aktif") return;

    if (
      !window.confirm(
        `Aktifkan tahun ajaran "${item?.tahunAjaran}" semester ${item?.semester}?`
      )
    )
      return;

    try {
      setError("");
      await updateTahunAjaran(item.id, { status: "aktif" });
      await loadData(true);
    } catch (err) {
      console.error("Gagal mengaktifkan tahun ajaran:", err);
      setError(
        err instanceof Error ? err.message : "Gagal mengaktifkan tahun ajaran."
      );
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;

    const message =
      item?.status === "aktif"
        ? `Tahun ajaran "${item?.tahunAjaran}" sedang aktif. Yakin ingin menghapusnya?`
        : `Yakin ingin menghapus tahun ajaran "${item?.tahunAjaran}" semester ${item?.semester}?`;

    if (!window.confirm(message)) return;

    try {
      setError("");
      await deleteTahunAjaran(item.id);
      setTahunAjaran((prev) => prev.filter((row) => row.id !== item.id));
    } catch (err) {
      console.error("Gagal menghapus tahun ajaran:", err);
      setError(
        err instanceof Error ? err.message : "Gagal menghapus tahun ajaran."
      );
    }
  };

  const handleResetSearch = () => {
    setSearch("");
    setFilterStatus("semua");
    setFilterSemester("semua");
    setCurrentPage(1);
  };


  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="tahunAjaran"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() => setIsCollapsed((prev) => !prev)}
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email: "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>
          <main className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="theme-primary-soft flex h-12 w-12 items-center justify-center rounded-xl">
                <RefreshCw size={24} className="animate-spin" />
              </div>
              <p className="theme-text-muted text-sm font-medium">
                Memuat data tahun ajaran...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="tahunAjaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setIsCollapsed((prev) => !prev)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-5">

              <section className="theme-card relative overflow-hidden rounded-2xl border theme-border p-5 shadow-sm sm:p-6">
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]" />

                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="theme-primary-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14">
                      <CalendarDays size={24} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="theme-text text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                          Tahun Ajaran
                        </h1>
                        <span className="theme-info inline-flex items-center rounded-full border theme-border px-2.5 py-0.5 text-[10px] font-semibold sm:text-[11px]">
                          Admin
                        </span>
                      </div>
                      <p className="theme-text-muted mt-1 max-w-2xl text-xs leading-5 sm:text-sm">
                        Kelola periode akademik, semester, dan kelas sekolah
                        dalam satu tempat.
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      onClick={() => loadData(true)}
                      disabled={refreshing}
                      className="theme-card theme-border inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium theme-text-secondary transition hover:theme-card-soft disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                      />
                      Refresh
                    </button>

                    <Link
                      href="/admin/akademik/tahun-ajaran/tambah"
                      className="theme-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition hover:opacity-90"
                    >
                      <Plus size={17} />
                      Tambah Tahun Ajaran
                    </Link>
                  </div>
                </div>
              </section>


              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Periode"
                  value={tahunAjaran.length}
                  icon={Layers3}
                  tone="primary"
                />
                <StatCard
                  label="Periode Aktif"
                  value={activeCount}
                  icon={CheckCircle}
                  tone="success"
                />
                <StatCard
                  label="Tidak Aktif"
                  value={inactiveCount}
                  icon={Clock3}
                  tone="warning"
                />
                <StatCard
                  label="Total Kelas"
                  value={totalKelas}
                  icon={Users}
                  tone="info"
                />
              </div>


              {error && (
                <div className="theme-danger flex items-start gap-3 rounded-xl border theme-border p-4">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Terjadi kesalahan</p>
                    <p className="mt-0.5 break-words text-xs">{error}</p>
                  </div>
                  <button
                    onClick={() => setError("")}
                    className="rounded-lg p-1 transition hover:opacity-70"
                    aria-label="Tutup pesan error"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}


              <section className="theme-card rounded-2xl border theme-border p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="theme-info flex h-9 w-9 items-center justify-center rounded-xl">
                        <Filter size={16} />
                      </div>
                      <div>
                        <p className="theme-text text-sm font-semibold">
                          Filter Data
                        </p>
                        <p className="theme-text-muted text-xs">
                          Saring periode akademik
                        </p>
                      </div>
                    </div>

                    <div className="hidden h-8 w-px border-l theme-border sm:block" />

                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="theme-input h-10 rounded-xl border theme-border px-3.5 text-sm font-medium outline-none transition"
                    >
                      <option value="semua">Semua Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="tidak_aktif">Tidak Aktif</option>
                    </select>

                    <select
                      value={filterSemester}
                      onChange={(e) => {
                        setFilterSemester(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="theme-input h-10 rounded-xl border theme-border px-3.5 text-sm font-medium outline-none transition"
                    >
                      <option value="semua">Semua Semester</option>
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>

                  <div className="relative w-full xl:max-w-[380px]">
                    <Search
                      size={17}
                      className="theme-text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Cari tahun ajaran atau kelas..."
                      className="theme-input h-10 w-full rounded-xl border theme-border pl-10 pr-10 text-sm outline-none transition"
                    />
                    {search && (
                      <button
                        onClick={handleResetSearch}
                        className="theme-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition hover:theme-card-soft"
                        aria-label="Reset pencarian"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </section>


              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="theme-text text-lg font-semibold">
                    Daftar Tahun Ajaran
                  </h2>
                  <p className="theme-text-muted mt-1 text-sm">
                    {filteredData.length} periode ditampilkan
                    {tahunAjaran.length !== filteredData.length &&
                      ` dari ${tahunAjaran.length} data`}
                  </p>
                </div>
                {(search ||
                  filterStatus !== "semua" ||
                  filterSemester !== "semua") && (
                  <button
                    onClick={handleResetSearch}
                    className="theme-primary-text self-start text-sm font-medium transition hover:opacity-80 sm:self-auto"
                  >
                    Reset filter
                  </button>
                )}
              </div>


              <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] border-collapse">
                    <thead>
                      <tr className="theme-card-soft border-b theme-border">
                        {[
                          { label: "No", align: "center", width: "w-16" },
                          { label: "Tahun Ajaran", align: "left" },
                          { label: "Semester", align: "left" },
                          { label: "Kelas", align: "left" },
                          { label: "Status", align: "left" },
                          { label: "Aksi", align: "right" },
                        ].map((col) => (
                          <th
                            key={col.label}
                            className={`${col.width || ""} px-5 py-3.5 text-[${col.align}] text-[11px] font-bold uppercase tracking-wide theme-text-muted`}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border)]">
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-20 text-center">
                            <div className="mx-auto max-w-sm">
                              <div className="theme-card-soft theme-text-muted mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border theme-border">
                                <CalendarDays size={28} />
                              </div>
                              <p className="theme-text mt-4 text-base font-semibold">
                                {search ||
                                filterStatus !== "semua" ||
                                filterSemester !== "semua"
                                  ? "Data tidak ditemukan"
                                  : "Belum ada tahun ajaran"}
                              </p>
                              <p className="theme-text-muted mt-1 text-sm leading-6">
                                {search ||
                                filterStatus !== "semua" ||
                                filterSemester !== "semua"
                                  ? "Coba ubah filter atau kata kunci pencarian."
                                  : "Tambahkan tahun ajaran baru untuk memulai."}
                              </p>
                              {(search ||
                                filterStatus !== "semua" ||
                                filterSemester !== "semua") && (
                                <button
                                  onClick={handleResetSearch}
                                  className="theme-primary mt-5 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90"
                                >
                                  Reset Filter
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((item, index) => {
                          const isActive = item?.status === "aktif";
                          const daftarKelas =
                            kelasByTahunAjaran[item?.id] || [];
                          const isExpanded = Boolean(expandedRows[item?.id]);

                          return (
                            <tr
                              key={item.id}
                              className={`theme-table-hover transition ${
                                isActive
                                  ? "bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]"
                                  : ""
                              }`}
                            >
                              <td className="theme-text-muted px-5 py-4 text-center text-sm font-medium">
                                {startIndex + index + 1}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={
                                      isActive
                                        ? "theme-primary-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                        : "theme-card-soft theme-text-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                    }
                                  >
                                    <CalendarDays size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="theme-text font-semibold">
                                      {item?.tahunAjaran || "-"}
                                    </p>
                                    {item?.id && (
                                      <p className="theme-text-muted mt-0.5 text-[11px]">
                                        ID: {item.id.slice(0, 8)}...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={
                                    item?.semester === "Ganjil"
                                      ? "theme-info inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
                                      : "theme-primary-soft inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
                                  }
                                >
                                  {item?.semester || "-"}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                {daftarKelas.length === 0 ? (
                                  <span className="theme-text-muted text-xs">
                                    Belum ada kelas
                                  </span>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="theme-info inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold">
                                        <Users size={13} />
                                        {daftarKelas.length} kelas
                                      </span>
                                      <button
                                        onClick={() => toggleRow(item.id)}
                                        className="theme-text-muted inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition hover:theme-card-soft"
                                      >
                                        {isExpanded
                                          ? "Sembunyikan"
                                          : "Lihat"}
                                        {isExpanded ? (
                                          <ChevronUp size={14} />
                                        ) : (
                                          <ChevronDown size={14} />
                                        )}
                                      </button>
                                    </div>

                                    {isExpanded && (
                                      <div className="flex max-w-[360px] flex-wrap gap-1.5 pt-1">
                                        {daftarKelas.map((kelasItem) => (
                                          <Link
                                            key={kelasItem.id}
                                            href={`/admin/kelas/${kelasItem.id}`}
                                            className="theme-card-soft rounded-lg border theme-border px-2.5 py-1.5 text-xs font-medium theme-text-secondary transition hover:theme-info"
                                          >
                                            {kelasItem?.nama || "Kelas"}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={
                                    isActive
                                      ? "theme-success inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                                      : "theme-card-soft theme-text-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                                  }
                                >
                                  {isActive ? (
                                    <CheckCircle size={13} />
                                  ) : (
                                    <XCircle size={13} />
                                  )}
                                  {isActive ? "Aktif" : "Tidak Aktif"}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    href={`/admin/akademik/tahun-ajaran/${item.id}`}
                                    title="Detail"
                                    className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:theme-info"
                                  >
                                    <Eye size={16} />
                                  </Link>

                                  {!isActive && (
                                    <button
                                      onClick={() => handleSetActive(item)}
                                      title="Set Aktif"
                                      className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:theme-success"
                                    >
                                      <Check size={17} />
                                    </button>
                                  )}

                                  <Link
                                    href={`/admin/akademik/tahun-ajaran/edit/${item.id}`}
                                    title="Edit"
                                    className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:theme-warning"
                                  >
                                    <Edit size={16} />
                                  </Link>

                                  <button
                                    onClick={() => handleDelete(item)}
                                    title="Hapus"
                                    className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:theme-danger"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredData.length > 0 && (
                  <div className="theme-card-soft flex flex-col gap-3 border-t theme-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="theme-text-muted text-xs sm:text-sm">
                      Menampilkan{" "}
                      <span className="theme-text font-semibold">
                        {startIndex + 1}
                      </span>
                      {" - "}
                      <span className="theme-text font-semibold">
                        {Math.min(
                          startIndex + currentItems.length,
                          filteredData.length
                        )}
                      </span>
                      {" dari "}
                      <span className="theme-text font-semibold">
                        {filteredData.length}
                      </span>
                      {" data"}
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={safeCurrentPage === 1}
                        className="theme-card theme-border theme-text-secondary rounded-lg border px-3 py-2 text-xs font-medium transition hover:theme-card-soft disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Sebelumnya
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(
                          Math.max(0, safeCurrentPage - 3),
                          Math.min(totalPages, safeCurrentPage + 2)
                        )
                        .map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={
                              safeCurrentPage === page
                                ? "theme-primary h-9 w-9 rounded-lg text-xs font-semibold shadow-sm"
                                : "theme-text-muted h-9 w-9 rounded-lg text-xs font-semibold transition hover:theme-card-soft"
                            }
                          >
                            {page}
                          </button>
                        ))}

                      <button
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(totalPages, p + 1)
                          )
                        }
                        disabled={safeCurrentPage === totalPages}
                        className="theme-card theme-border theme-text-secondary rounded-lg border px-3 py-2 text-xs font-medium transition hover:theme-card-soft disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                )}
              </section>


              <section className="theme-info rounded-2xl border theme-border p-5">
                <div className="flex items-start gap-3">
                  <div className="theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border theme-border shadow-sm">
                    <Database size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="theme-text text-sm font-semibold">
                      Informasi Periode Aktif
                    </p>
                    <p className="theme-text-secondary mt-1 text-sm leading-6">
                      {activeYear
                        ? `${activeYear.tahunAjaran} · ${activeYear.semester} adalah periode akademik yang sedang aktif dan digunakan oleh sekolah.`
                        : "Belum ada tahun ajaran yang ditetapkan sebagai periode aktif."}
                    </p>
                  </div>
                </div>
              </section>

              <footer className="border-t theme-border py-3 text-center text-xs theme-text-muted">
                © 2026 SmartSchool • Tahun Ajaran
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const toneMap = {
    primary: "theme-primary-soft",
    success: "theme-success",
    warning: "theme-warning",
    info: "theme-info",
    danger: "theme-danger",
  };
  const styles = toneMap[tone] || toneMap.primary;

  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="theme-text mt-1.5 text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}