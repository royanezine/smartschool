
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Package,
  X,
  Filter,
  Loader2,
  XCircle,
  CheckCircle,
  MapPin,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

import {
  getAset,
  getGudang,
  deleteGudang,
} from "@/services/sarpras.service";

const primaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const primarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const primaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

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

function extractData(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function StatCard({ icon: Icon, label, value, description, tone }) {
  const style = {
    bg: "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
    color: "theme-primary-text",
  };

  return (
    <div
      className={`theme-card rounded-xl border ${neutralBorder} p-4 ${cardShadow} transition hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-2 text-2xl font-bold tabular-nums">
            {formatNumber(value)}
          </p>

          <p className="theme-text-muted mt-1 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.color}`}
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
  const [showFilter, setShowFilter] = useState(false);
  const [lokasiFilter, setLokasiFilter] = useState("Semua");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [gudangRes, asetRes] = await Promise.all([
        getGudang(),
        getAset(),
      ]);

      setGudangList(extractData(gudangRes));
      setAsetList(extractData(asetRes));
    } catch (err) {
      console.error("Gagal mengambil data gudang:", err);

      setError(
        err?.message || "Gagal mengambil data gudang."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lokasiList = useMemo(() => {
    const locations = gudangList
      .map((item) => item.lokasi?.trim())
      .filter(Boolean);

    return [...new Set(locations)];
  }, [gudangList]);

  const filteredGudang = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return gudangList
      .filter((item) => {
        const nama = String(item.nama || "").toLowerCase();
        const lokasi = String(item.lokasi || "").toLowerCase();
        const keterangan = String(item.keterangan || "").toLowerCase();

        const matchSearch =
          !keyword ||
          nama.includes(keyword) ||
          lokasi.includes(keyword) ||
          keterangan.includes(keyword);

        const matchLokasi =
          lokasiFilter === "Semua" ||
          item.lokasi === lokasiFilter;

        return matchSearch && matchLokasi;
      })
      .sort((a, b) =>
        String(a.nama || "").localeCompare(String(b.nama || ""))
      );
  }, [gudangList, search, lokasiFilter]);

  const totalAset = asetList.reduce(
    (total, item) => total + Number(item.jumlah || 0),
    0
  );

  const getAsetCount = (gudangId) => {
    return asetList
      .filter(
        (aset) =>
          String(aset.gudangId || aset.gudang?.id) ===
          String(gudangId)
      )
      .reduce(
        (total, aset) => total + Number(aset.jumlah || 0),
        0
      );
  };

  const handleResetFilter = () => {
    setSearch("");
    setLokasiFilter("Semua");
  };

  const handleDelete = async (id, nama) => {
    const jumlahAset = getAsetCount(id);

    if (jumlahAset > 0) {
      window.alert(
        `Gudang "${nama}" masih memiliki ${formatNumber(jumlahAset)} aset. Pindahkan aset terlebih dahulu sebelum menghapus gudang.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus gudang "${nama}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await deleteGudang(id);

      setGudangList((current) =>
        current.filter((item) => item.id !== id)
      );

      window.alert("Gudang berhasil dihapus.");
    } catch (err) {
      console.error("Gagal menghapus gudang:", err);

      window.alert(
        err?.message || "Gagal menghapus gudang."
      );

      await loadData(true);
    } finally {
      setDeletingId(null);
    }
  };

  const activeFilterCount = lokasiFilter !== "Semua" ? 1 : 0;

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
            toggleSidebar={() => setIsCollapsed((value) => !value)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-5 px-4 py-5 sm:px-6 lg:px-8 2xl:px-12">

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
                      className={`${primarySoft} rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]`}
                    >
                      Sarpras
                    </span>
                  </div>

                  <p className="theme-text-muted mt-1 text-sm">
                    Kelola data gudang penyimpanan aset sekolah.
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
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/sarpras/gudang/tambah")
                  }
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
                <AlertCircle
                  size={19}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="theme-text text-sm font-bold">
                    Gagal memuat data
                  </p>

                  <p className="theme-text-secondary mt-1 text-sm">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadData()}
                  className="theme-text-secondary text-xs font-semibold"
                >
                  Coba lagi
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={Warehouse}
                label="Total Gudang"
                value={gudangList.length}
                description="Gudang terdaftar"
                tone="primary"
              />

              <StatCard
                icon={Package}
                label="Total Jenis Aset"
                value={asetList.length}
                description="Data aset terdaftar"
                tone="info"
              />

              <StatCard
                icon={ClipboardList}
                label="Total Unit Aset"
                value={totalAset}
                description="Jumlah seluruh unit aset"
                tone="success"
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
                    placeholder="Cari nama, lokasi, atau keterangan gudang..."
                    className={`theme-input h-10 w-full rounded-xl border ${neutralBorder} pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilter((value) => !value)}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${
                      showFilter || activeFilterCount > 0
                        ? `${primaryBorder} ${primarySoft} text-[var(--color-primary)]`
                        : `theme-card ${neutralBorder} theme-text-secondary ${neutralHover}`
                    }`}
                  >
                    <Filter size={16} />
                    Filter

                    {activeFilterCount > 0 && (
                      <span className={`${primaryGradient} flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white`}>
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {(search || activeFilterCount > 0) && (
                    <button
                      type="button"
                      onClick={handleResetFilter}
                      className={`inline-flex h-10 items-center gap-1.5 rounded-xl border ${neutralBorder} theme-card px-3 text-sm font-semibold theme-text-muted ${neutralHover}`}
                    >
                      <X size={14} />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {showFilter && (
                <div className={`border-t ${neutralBorder} p-4`}>
                  <label className="theme-text-muted mb-1.5 block text-xs font-semibold">
                    Lokasi Gudang
                  </label>

                  <select
                    value={lokasiFilter}
                    onChange={(e) => setLokasiFilter(e.target.value)}
                    className={`theme-input h-10 w-full max-w-sm rounded-xl border ${neutralBorder} px-3 text-sm outline-none focus:border-[var(--color-primary)]`}
                  >
                    <option value="Semua">Semua Lokasi</option>

                    {lokasiList.map((lokasi) => (
                      <option key={lokasi} value={lokasi}>
                        {lokasi}
                      </option>
                    ))}
                  </select>
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
                    Data gudang berdasarkan sekolah yang sedang login.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center">
                  <Loader2
                    size={30}
                    className="animate-spin text-[var(--color-primary)]"
                  />

                  <p className="theme-text mt-4 text-sm font-semibold">
                    Memuat data gudang...
                  </p>

                  <p className="theme-text-muted mt-1 text-xs">
                    Mengambil data dari server.
                  </p>
                </div>
              ) : filteredGudang.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${neutralSurface} theme-text-muted`}
                  >
                    <Warehouse size={27} />
                  </div>

                  <h3 className="theme-text mt-5 text-base font-bold">
                    {gudangList.length === 0
                      ? "Belum ada gudang"
                      : "Gudang tidak ditemukan"}
                  </h3>

                  <p className="theme-text-secondary mt-1.5 max-w-md text-sm">
                    {gudangList.length === 0
                      ? "Tambahkan gudang pertama untuk mulai mengelola penyimpanan aset sekolah."
                      : "Tidak ditemukan gudang yang sesuai dengan pencarian atau filter."}
                  </p>

                  {gudangList.length === 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/sarpras/gudang/tambah")
                      }
                      className={`${primaryGradient} mt-5 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white`}
                    >
                      <Plus size={16} />
                      Tambah Gudang
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetFilter}
                      className={`${primaryGradient} mt-5 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white`}
                    >
                      Reset Pencarian
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left text-sm">
                    <thead>
                      <tr className={`border-b ${neutralBorder} ${neutralSurface}`}>
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
                          Keterangan
                        </th>

                        <th className="theme-text-muted px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border)]">
                      {filteredGudang.map((item) => {
                        const isDeleting = deletingId === item.id;
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
                                    {item.nama || "-"}
                                  </p>

                                  <p className="theme-text-muted mt-0.5 text-[10px]">
                                    ID: {item.id?.slice(0, 8) || "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <MapPin
                                  size={14}
                                  className="theme-text-muted shrink-0"
                                />

                                <span className="theme-text-secondary text-xs">
                                  {item.lokasi || "-"}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Package
                                  size={14}
                                  className="theme-text-muted"
                                />

                                <span className="theme-text text-xs font-semibold">
                                  {formatNumber(asetCount)}
                                </span>

                                <span className="theme-text-muted text-xs">
                                  Unit
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="theme-text-secondary line-clamp-2 text-xs">
                                {item.keterangan || "-"}
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
                                  title="Edit gudang"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:theme-warning disabled:opacity-40"
                                >
                                  <Edit size={15} />
                                </button>

                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() =>
                                    handleDelete(item.id, item.nama)
                                  }
                                  title="Hapus gudang"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:theme-danger disabled:opacity-40"
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
                  <strong className="theme-text">
                    {gudangList.length}
                  </strong>{" "}
                  gudang
                </span>

                <span>Data tersinkronisasi dengan server</span>
              </div>
            </div>

            <div className="py-3 text-center">
              <p className="theme-text-muted text-[11px]">
                © 2026 SmartSchool • Master Gudang
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
