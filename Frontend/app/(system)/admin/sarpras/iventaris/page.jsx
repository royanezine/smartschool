"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  deleteAset,
  getAset,
  getGudang,
  getKategoriAset,
} from "@/services/sarpras.service";
import {
  extractData,
  formatKondisi,
  formatNumber,
  getStokStatus,
  kondisiBadgeClass,
} from "./_utils";

const PAGE_SIZE = 8;


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function StatCard({ title, value, description, icon: Icon, tone }) {
  const tones = {
    primary: `${themePrimarySoft} ${themePrimaryText}`,
    success:
      "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]",
    warning:
      "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]",
    info: "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)] text-[var(--color-info)]",
  };

  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-2xl border p-4 ${themeCardShadow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs theme-text-muted">{title}</p>
          <p className="mt-1 text-2xl font-bold theme-text">{value}</p>
          <p className="mt-0.5 text-[11px] theme-text-muted">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            tones[tone] || tones.primary
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function InventarisPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aset, setAset] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [gudangList, setGudangList] = useState([]);

  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [gudangFilter, setGudangFilter] = useState("Semua");
  const [kondisiFilter, setKondisiFilter] = useState("Semua");
  const [stokFilter, setStokFilter] = useState("Semua");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [asetResponse, kategoriResponse, gudangResponse] =
        await Promise.all([
          getAset(),
          getKategoriAset(),
          getGudang(),
        ]);

      setAset(extractData(asetResponse));
      setKategori(extractData(kategoriResponse));
      setGudangList(extractData(gudangResponse));
    } catch (err) {
      console.error("Gagal memuat inventaris:", err);
      setAset([]);
      setKategori([]);
      setGudangList([]);
      setError(
        err?.message || "Gagal memuat data inventaris dari server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, [loadData]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return aset.filter((item) => {
      const text = [
        item?.nama,
        item?.kode,
        item?.lokasi,
        item?.kategoriAset?.nama,
        item?.gudang?.nama,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      if (keyword && !text.includes(keyword)) return false;

      if (
        kategoriFilter !== "Semua" &&
        String(item?.kategoriAsetId) !== String(kategoriFilter)
      ) {
        return false;
      }

      if (
        gudangFilter !== "Semua" &&
        String(item?.gudangId) !== String(gudangFilter)
      ) {
        return false;
      }

      if (
        kondisiFilter !== "Semua" &&
        String(item?.kondisi || "").toLowerCase() !== kondisiFilter
      ) {
        return false;
      }

      if (
        stokFilter !== "Semua" &&
        getStokStatus(item).key !== stokFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    aset,
    search,
    kategoriFilter,
    gudangFilter,
    kondisiFilter,
    stokFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const resetFilter = () => {
    setSearch("");
    setKategoriFilter("Semua");
    setGudangFilter("Semua");
    setKondisiFilter("Semua");
    setStokFilter("Semua");
    setPage(1);
  };

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
    setNotice("");
  }

  const ringkasan = useMemo(() => {
    const totalUnit = aset.reduce(
      (total, item) => total + (Number(item?.jumlah) || 0),
      0
    );
    const totalStok = aset.reduce(
      (total, item) => total + (Number(item?.jumlahStok) || 0),
      0
    );
    const perluPerhatian = aset.filter(
      (item) => getStokStatus(item).key !== "aman"
    ).length;

    return {
      totalAset: aset.length,
      totalUnit,
      totalStok,
      perluPerhatian,
    };
  }, [aset]);

  async function handleDelete(item) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Hapus inventaris "${item.nama}" (${item.kode})? Data akan dinonaktifkan.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(item.id);
      setError("");
      setNotice("");

      await deleteAset(item.id);

      setNotice(`Inventaris "${item.nama}" berhasil dihapus.`);
      await loadData(true);
    } catch (err) {
      setError(
        err?.message || "Gagal menghapus data inventaris."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const hasFilter =
    search.trim() !== "" ||
    kategoriFilter !== "Semua" ||
    gudangFilter !== "Semua" ||
    kondisiFilter !== "Semua" ||
    stokFilter !== "Semua";

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((value) => !value)}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen((value) => !value)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px] space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className={`text-xs font-medium uppercase tracking-wide ${themePrimaryText}`}>
                  Sarana &amp; Prasarana
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text sm:text-[28px]">
                  Inventaris
                </h1>

                <p className="mt-1 text-sm theme-text-secondary">
                  Kelola data barang inventaris, stok, kondisi, dan
                  lokasinya.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing || loading}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {refreshing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/sarpras/iventaris/tambah")
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition hover:brightness-95`}
                >
                  <Plus size={16} />
                  Tambah Inventaris
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-3"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-danger)]">
                    Gagal memuat data inventaris
                  </p>
                  <p className="mt-0.5 text-xs theme-text-secondary">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadData()}
                  className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] px-2.5 py-1 text-xs font-semibold text-[var(--color-danger)]"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-4 py-3 text-sm text-[var(--color-success)]"
              >
                <CheckCircle2 size={17} />
                {notice}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Jenis Barang"
                value={loading ? "..." : formatNumber(ringkasan.totalAset)}
                description="Barang aktif terdaftar"
                icon={Package}
                tone="primary"
              />
              <StatCard
                title="Total Unit"
                value={loading ? "..." : formatNumber(ringkasan.totalUnit)}
                description="Jumlah unit keseluruhan"
                icon={Boxes}
                tone="info"
              />
              <StatCard
                title="Stok Tersedia"
                value={loading ? "..." : formatNumber(ringkasan.totalStok)}
                description="Akumulasi stok saat ini"
                icon={CheckCircle2}
                tone="success"
              />
              <StatCard
                title="Perlu Perhatian"
                value={
                  loading ? "..." : formatNumber(ringkasan.perluPerhatian)
                }
                description="Stok menipis atau habis"
                icon={AlertCircle}
                tone="warning"
              />
            </div>

            <div
              className={`theme-card ${themeNeutralBorder} rounded-2xl border p-4 ${themeCardShadow}`}
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={16}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      changeFilter(setSearch, event.target.value)
                    }
                    disabled={loading}
                    placeholder="Cari nama, kode, kategori, gudang, atau lokasi..."
                    className={`h-10 w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} pl-10 pr-9 text-sm theme-text outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => changeFilter(setSearch, "")}
                      aria-label="Hapus pencarian"
                      className="theme-text-muted absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <select
                    value={kategoriFilter}
                    onChange={(event) =>
                      changeFilter(setKategoriFilter, event.target.value)
                    }
                    disabled={loading}
                    aria-label="Filter kategori"
                    className={`h-10 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3 text-xs theme-text outline-none transition ${themeFocus} disabled:opacity-60`}
                  >
                    <option value="Semua">Semua Kategori</option>
                    {kategori.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama}
                      </option>
                    ))}
                  </select>

                  <select
                    value={gudangFilter}
                    onChange={(event) =>
                      changeFilter(setGudangFilter, event.target.value)
                    }
                    disabled={loading}
                    aria-label="Filter gudang"
                    className={`h-10 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3 text-xs theme-text outline-none transition ${themeFocus} disabled:opacity-60`}
                  >
                    <option value="Semua">Semua Gudang</option>
                    {gudangList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama}
                      </option>
                    ))}
                  </select>

                  <select
                    value={kondisiFilter}
                    onChange={(event) =>
                      changeFilter(setKondisiFilter, event.target.value)
                    }
                    disabled={loading}
                    aria-label="Filter kondisi"
                    className={`h-10 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3 text-xs theme-text outline-none transition ${themeFocus} disabled:opacity-60`}
                  >
                    <option value="Semua">Semua Kondisi</option>
                    <option value="baik">Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                  </select>

                  <select
                    value={stokFilter}
                    onChange={(event) =>
                      changeFilter(setStokFilter, event.target.value)
                    }
                    disabled={loading}
                    aria-label="Filter status stok"
                    className={`h-10 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3 text-xs theme-text outline-none transition ${themeFocus} disabled:opacity-60`}
                  >
                    <option value="Semua">Semua Stok</option>
                    <option value="aman">Stok Aman</option>
                    <option value="menipis">Stok Menipis</option>
                    <option value="habis">Stok Habis</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={resetFilter}
                  disabled={!hasFilter || loading}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-3 text-xs font-medium theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <SlidersHorizontal size={14} />
                  Reset
                </button>
              </div>
            </div>

            <div
              className={`theme-card ${themeNeutralBorder} overflow-hidden rounded-2xl border ${themeCardShadow}`}
            >
              <div
                className={`flex flex-wrap items-center justify-between gap-2 border-b ${themeDivider} px-5 py-4`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <Boxes size={16} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold theme-text">
                      Daftar Inventaris
                    </h2>
                    <p className="text-xs theme-text-muted">
                      {loading
                        ? "Memuat data..."
                        : `${formatNumber(filtered.length)} dari ${formatNumber(
                            aset.length
                          )} barang ditampilkan`}
                    </p>
                  </div>
                </div>

                {!loading && (
                  <span
                    className={`rounded-full ${themeNeutralSurface} px-3 py-1 text-xs font-medium theme-text-secondary`}
                  >
                    Halaman {safePage}/{totalPages}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex min-h-[320px] items-center justify-center">
                    <div className="text-center">
                      <Loader2
                        size={28}
                        className={`${themePrimaryText} mx-auto animate-spin`}
                      />
                      <p className="mt-3 text-xs font-medium theme-text-muted">
                        Memuat inventaris dari server...
                      </p>
                    </div>
                  </div>
                ) : aset.length === 0 ? (
                  <div className="flex min-h-[320px] items-center justify-center px-6">
                    <div className="max-w-md text-center">
                      <div
                        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                      >
                        <Package size={26} />
                      </div>
                      <h3 className="mt-4 text-sm font-bold theme-text">
                        Belum ada data inventaris
                      </h3>
                      <p className="mt-1 text-xs theme-text-muted">
                        Tambahkan barang inventaris pertama untuk mulai
                        mengelola stok dan kondisinya.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          router.push("/admin/sarpras/iventaris/tambah")
                        }
                        className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-[var(--color-card)] ${themePrimaryGradient}`}
                      >
                        <Plus size={14} />
                        Tambah Inventaris
                      </button>
                    </div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex min-h-[280px] items-center justify-center px-6">
                    <div className="max-w-md text-center">
                      <div
                        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                      >
                        <Search size={25} />
                      </div>
                      <h3 className="mt-4 text-sm font-bold theme-text">
                        Tidak ada barang yang cocok
                      </h3>
                      <p className="mt-1 text-xs theme-text-muted">
                        Ubah kata kunci atau filter untuk melihat barang
                        lainnya.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilter}
                        className={`mt-4 rounded-xl border ${themeNeutralBorder} px-4 py-2 text-xs font-semibold theme-text-secondary ${themeNeutralHover}`}
                      >
                        Reset filter
                      </button>
                    </div>
                  </div>
                ) : (
                  <table className="w-full min-w-[980px] text-sm">
                    <thead>
                      <tr
                        className={`border-b ${themeDivider} ${themeNeutralSurface} text-left text-[11px] uppercase tracking-wide theme-text-muted`}
                      >
                        <th className="px-5 py-3 font-semibold">Barang</th>
                        <th className="px-4 py-3 font-semibold">Kategori</th>
                        <th className="px-4 py-3 font-semibold">Gudang / Lokasi</th>
                        <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                        <th className="px-4 py-3 text-right font-semibold">Stok</th>
                        <th className="px-4 py-3 font-semibold">Kondisi</th>
                        <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pageItems.map((item) => {
                        const stok = getStokStatus(item);

                        return (
                          <tr
                            key={item.id}
                            className={`border-b ${themeDivider} transition last:border-b-0 ${themeNeutralHover}`}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                                >
                                  <Package size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold theme-text">
                                    {item.nama}
                                  </p>
                                  <p className="text-[11px] theme-text-muted">
                                    {item.kode}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 theme-text-secondary">
                              {item.kategoriAset?.nama || "-"}
                            </td>

                            <td className="px-4 py-3.5">
                              <p className="theme-text-secondary">
                                {item.gudang?.nama || "-"}
                              </p>
                              <p className="flex items-center gap-1 text-[11px] theme-text-muted">
                                <MapPin size={11} />
                                {item.lokasi ||
                                  item.gudang?.lokasi ||
                                  "-"}
                              </p>
                            </td>

                            <td className="px-4 py-3.5 text-right font-medium theme-text">
                              {formatNumber(item.jumlah)}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <p className="font-medium theme-text">
                                {formatNumber(item.jumlahStok)}
                              </p>
                              <span
                                className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stok.className}`}
                              >
                                {stok.label}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${kondisiBadgeClass(
                                  item.kondisi
                                )}`}
                              >
                                {formatKondisi(item.kondisi)}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  title="Lihat detail"
                                  aria-label={`Lihat detail ${item.nama}`}
                                  onClick={() =>
                                    router.push(
                                      `/admin/sarpras/iventaris/${encodeURIComponent(
                                        item.id
                                      )}`
                                    )
                                  }
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-secondary transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                                >
                                  <Eye size={14} />
                                </button>

                                <button
                                  type="button"
                                  title="Edit inventaris"
                                  aria-label={`Edit ${item.nama}`}
                                  onClick={() =>
                                    router.push(
                                      `/admin/sarpras/iventaris/${encodeURIComponent(
                                        item.id
                                      )}/edit`
                                    )
                                  }
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-secondary transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                                >
                                  <Edit size={14} />
                                </button>

                                <button
                                  type="button"
                                  title="Hapus inventaris"
                                  aria-label={`Hapus ${item.nama}`}
                                  onClick={() => handleDelete(item)}
                                  disabled={deletingId === item.id}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {deletingId === item.id ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {!loading && aset.length > 0 && (
                <div
                  className={`flex flex-col gap-2 border-t ${themeDivider} px-5 py-3 sm:flex-row sm:items-center sm:justify-between`}
                >
                  <p className="text-xs theme-text-muted">
                    Menampilkan{" "}
                    {filtered.length === 0
                      ? 0
                      : startIndex + 1}
                    –{Math.min(startIndex + PAGE_SIZE, filtered.length)}{" "}
                    dari {formatNumber(filtered.length)} barang
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPage(Math.max(1, safePage - 1))
                      }
                      disabled={safePage <= 1}
                      aria-label="Halaman sebelumnya"
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <span
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold text-[var(--color-card)] ${themePrimaryGradient}`}
                    >
                      {safePage}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPage(Math.min(totalPages, safePage + 1))
                      }
                      disabled={safePage >= totalPages}
                      aria-label="Halaman berikutnya"
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
