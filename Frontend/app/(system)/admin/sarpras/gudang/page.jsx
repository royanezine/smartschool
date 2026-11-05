"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Warehouse,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  Loader2,
  Package,
  X,
  ArrowUpDown,
} from "lucide-react";

import {
  getAset,
  getGudang,
} from "@/services/sarpras.service";

const primaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const primarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const primaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const primaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const primaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const cardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const neutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const neutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const neutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const focusStyle =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function extractData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function StatCard({ icon: Icon, label, value, description, tone = "primary" }) {
  const toneMap = {
    primary: { bg: primarySoft, icon: "text-[var(--color-primary)]" },
    info: {
      bg: "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]",
      icon: "text-[var(--color-info)]",
    },
    warning: {
      bg: "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
      icon: "text-[var(--color-warning)]",
    },
    danger: {
      bg: "bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)]",
      icon: "text-[var(--color-danger)]",
    },
    success: {
      bg: "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
      icon: "text-[var(--color-success)]",
    },
  };

  const style = toneMap[tone] || toneMap.primary;

  return (
    <div
      className={`theme-card rounded-xl border ${neutralBorder} p-4 ${cardShadow} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
            {label}
          </p>
          <p className="theme-text mt-1.5 text-2xl font-bold tabular-nums">
            {formatNumber(value)}
          </p>
          <p className="theme-text-muted mt-1 text-xs">{description}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.icon}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function MasterGudangPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [gudangList, setGudangList] = useState([]);
  const [asetList, setAsetList] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [gudangRes, asetRes] = await Promise.all([
        getGudang(),
        getAset(),
      ]);

      setGudangList(extractData(gudangRes));
      setAsetList(extractData(asetRes));
    } catch (err) {
      console.error("Gagal mengambil data gudang:", err);
      setError(err?.message || "Gagal mengambil data gudang.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredGudang = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return gudangList
      .filter((item) => {
        const nama = String(item?.nama || "").toLowerCase();
        const lokasi = String(item?.lokasi || "").toLowerCase();

        const matchSearch =
          !keyword || nama.includes(keyword) || lokasi.includes(keyword);

        const matchStatus =
          statusFilter === "Semua" ||
          String(item?.status).toLowerCase() === statusFilter.toLowerCase();

        return matchSearch && matchStatus;
      })
      .sort((a, b) =>
        String(a?.nama || "").localeCompare(String(b?.nama || ""))
      );
  }, [gudangList, search, statusFilter]);

  const totalGudang = gudangList.length;

  const gudangAktif = gudangList.filter(
    (item) => String(item?.status).toLowerCase() === "aktif"
  ).length;

  const gudangNonaktif = gudangList.filter(
    (item) => String(item?.status).toLowerCase() !== "aktif"
  ).length;

  const activeFilterCount = [statusFilter !== "Semua"].filter(Boolean).length;

  const handleResetFilter = () => {
    setSearch("");
    setStatusFilter("Semua");
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus gudang "${nama}"?`)) return;

    try {
      setDeletingId(id);
      setGudangList((curr) => curr.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gagal menghapus gudang:", err);
      window.alert(err?.message || "Gagal menghapus gudang.");
    } finally {
      setDeletingId(null);
    }
  };

  const getAsetCount = (gudangId) => {
    return asetList.filter(
      (aset) =>
        String(aset?.gudangId) === String(gudangId) ||
        String(aset?.gudang?.id) === String(gudangId)
    ).length;
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="gudang"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setIsCollapsed((v) => !v)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full px-4 py-5 sm:px-6 lg:px-8 2xl:px-12 space-y-5">
              
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
                  >
                    <Warehouse size={23} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                        Master Gudang
                      </h1>
                      <span
                        className={`rounded-full ${primarySoft} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]`}
                      >
                        Sarpras
                      </span>
                    </div>
                    <p className="theme-text-muted mt-1 max-w-2xl text-sm">
                      Kelola data gudang penyimpanan sarana dan prasarana sekolah.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className={`theme-card inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${neutralBorder} px-3.5 text-sm font-semibold theme-text-secondary ${neutralHover} transition disabled:opacity-60`}
                  >
                    <RefreshCw
                      size={16}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/admin/sarpras/gudang/tambah")}
                    className={`${primaryGradient} ${primaryShadow} inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-95`}
                  >
                    <Plus size={17} />
                    Tambah Gudang
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className={`flex items-start gap-3 rounded-xl border ${neutralBorder} ${neutralSurface} p-4`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-danger">
                    <XCircle size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="theme-text text-sm font-bold">
                      Gagal memuat data
                    </p>
                    <p className="theme-text-secondary mt-1 text-sm">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadData()}
                    className="shrink-0 rounded-lg border theme-border px-2.5 py-1 text-xs font-semibold theme-text-secondary transition hover:theme-card-soft"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                <StatCard
                  icon={Warehouse}
                  label="Total Gudang"
                  value={totalGudang}
                  description="Semua gudang"
                  tone="primary"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Gudang Aktif"
                  value={gudangAktif}
                  description="Siap digunakan"
                  tone="success"
                />
                <StatCard
                  icon={XCircle}
                  label="Gudang Nonaktif"
                  value={gudangNonaktif}
                  description="Tidak digunakan"
                  tone="danger"
                />
              </div>

              <div
                className={`theme-card rounded-2xl border ${neutralBorder} ${cardShadow}`}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={16}
                      className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama atau lokasi gudang..."
                      className={`theme-input h-10 w-full rounded-xl border ${neutralBorder} pl-10 pr-4 text-sm outline-none transition ${focusStyle}`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFilter((v) => !v)}
                      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${
                        showFilter || activeFilterCount > 0
                          ? `${primaryBorder} ${primarySoft} text-[var(--color-primary)]`
                          : `theme-card ${neutralBorder} theme-text-secondary ${neutralHover}`
                      }`}
                    >
                      <Filter size={16} />
                      Filter
                      {activeFilterCount > 0 && (
                        <span
                          className={`${primaryGradient} flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-[var(--color-card)]`}
                        >
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    {(search || activeFilterCount > 0) && (
                      <button
                        type="button"
                        onClick={handleResetFilter}
                        className={`inline-flex h-10 items-center gap-1.5 rounded-xl border ${neutralBorder} theme-card px-3 text-sm font-semibold theme-text-muted transition ${neutralHover}`}
                      >
                        <X size={14} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {showFilter && (
                  <div
                    className={`grid grid-cols-1 gap-3 border-t ${neutralBorder} p-4 sm:grid-cols-2`}
                  >
                    <div>
                      <label className="theme-text-muted mb-1.5 block text-xs font-semibold">
                        Status Gudang
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`theme-input h-10 w-full rounded-xl border ${neutralBorder} px-3 text-sm outline-none ${focusStyle}`}
                      >
                        <option value="Semua">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`theme-card overflow-hidden rounded-2xl border ${neutralBorder} ${cardShadow}`}
              >
                <div
                  className={`flex flex-col gap-2 border-b ${neutralBorder} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="theme-text text-sm font-bold">
                        Daftar Gudang
                      </h2>
                      <span
                        className={`${neutralSurface} theme-text-muted rounded-full px-2 py-0.5 text-[10px] font-bold`}
                      >
                        {filteredGudang.length}
                      </span>
                    </div>
                    <p className="theme-text-muted mt-0.5 text-xs">
                      Data diambil langsung dari sistem database.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${primarySoft} text-[var(--color-primary)]`}
                      >
                        <Loader2 size={25} className="animate-spin" />
                      </div>
                      <p className="theme-text mt-4 text-sm font-semibold">
                        Memuat data gudang...
                      </p>
                      <p className="theme-text-muted mt-1 text-xs">
                        Mengambil data dari server
                      </p>
                    </div>
                  </div>
                ) : filteredGudang.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${neutralSurface} theme-text-muted`}
                    >
                      <Warehouse size={27} />
                    </div>
                    <h3 className="theme-text mt-5 text-base font-bold">
                      Tidak ada data gudang
                    </h3>
                    <p className="theme-text-secondary mt-1.5 max-w-md text-sm">
                      Tidak ditemukan gudang yang sesuai dengan pencarian atau filter.
                    </p>
                    {(search || activeFilterCount > 0) && (
                      <button
                        type="button"
                        onClick={handleResetFilter}
                        className={`mt-5 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] ${primaryGradient} ${primaryShadow}`}
                      >
                        Reset Pencarian
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                      <thead>
                        <tr
                          className={`border-b ${neutralBorder} ${neutralSurface}`}
                        >
                          <th className="theme-text-muted px-5 py-3 text-[10px] font-bold uppercase tracking-wider">
                            Nama Gudang
                          </th>
                          <th className="theme-text-muted px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                            Lokasi
                          </th>
                          <th className="theme-text-muted px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                            Jumlah Aset
                          </th>
                          <th className="theme-text-muted px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                            Status
                          </th>
                          <th className="theme-text-muted px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {filteredGudang.map((item) => {
                          const isDeleting = deletingId === item.id;
                          const isAktif = String(item?.status).toLowerCase() === "aktif";
                          const asetCount = getAsetCount(item.id);

                          return (
                            <tr
                              key={item.id}
                              className="transition theme-table-hover"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
                                  >
                                    <Warehouse size={17} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="theme-text truncate text-sm font-semibold">
                                      {item?.nama || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <span className="theme-text-secondary text-xs">
                                  {item?.lokasi || "-"}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5 text-xs theme-text-secondary">
                                  <Package size={14} className="theme-text-muted" />
                                  <span className="font-semibold">{formatNumber(asetCount)}</span>
                                  <span>Aset</span>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                                    isAktif
                                      ? "border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
                                      : "border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]"
                                  }`}
                                >
                                  {isAktif ? (
                                    <CheckCircle size={12} />
                                  ) : (
                                    <XCircle size={12} />
                                  )}
                                  {isAktif ? "Aktif" : "Nonaktif"}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() =>
                                      router.push(
                                        `/admin/sarpras/gudang/edit/${item.id}`
                                      )
                                    }
                                    title="Edit"
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition hover:theme-warning disabled:opacity-40`}
                                  >
                                    <Edit size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() =>
                                      handleDelete(item.id, item?.nama || "gudang")
                                    }
                                    title="Hapus"
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition hover:theme-danger disabled:opacity-40`}
                                  >
                                    {isDeleting ? (
                                      <Loader2
                                        size={15}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={15} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div
                  className={`flex flex-col gap-1 border-t ${neutralBorder} ${neutralSurface} px-5 py-3 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between`}
                >
                  <span>
                    Menampilkan{" "}
                    <strong className="theme-text">
                      {filteredGudang.length}
                    </strong>{" "}
                    dari{" "}
                    <strong className="theme-text">{gudangList.length}</strong>{" "}
                    gudang
                  </span>
                  <span>Data tersinkronisasi</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="theme-text-muted text-[11px]">
                  © 2026 SmartSchool • Master Gudang
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}