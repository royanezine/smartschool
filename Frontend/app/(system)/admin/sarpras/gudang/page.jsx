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
  PackageMinus,
  PackagePlus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  Loader2,
  MapPin,
  Boxes,
  Eye,
  CalendarDays,
  Wrench,
  Tag,
  Package,
  X,
} from "lucide-react";

import {
  getAset,
  getKategoriAset,
  getGudang,
  updateAset,
  deleteAset,
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

const successSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const warningSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const focusStyle =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


function extractData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function getStokStatus(stok, minimum) {
  const current = Number(stok) || 0;
  const min = Number(minimum) || 0;
  if (current <= 0) return "habis";
  if (current <= min) return "menipis";
  return "aman";
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatText(value) {
  if (!value) return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}


const stokConfig = {
  aman: {
    label: "Aman",
    icon: CheckCircle,
    iconColor: "text-[var(--color-success)]",
    barClass: "bg-[var(--color-success)]",
  },
  menipis: {
    label: "Menipis",
    icon: AlertTriangle,
    iconColor: "text-[var(--color-warning)]",
    barClass: "bg-[var(--color-warning)]",
  },
  habis: {
    label: "Habis",
    icon: XCircle,
    iconColor: "text-[var(--color-danger)]",
    barClass: "bg-[var(--color-danger)]",
  },
};


export default function DataAsetPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [aset, setAset] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [gudangList, setGudangList] = useState([]);

  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [gudangFilter, setGudangFilter] = useState("Semua");
  const [stokFilter, setStokFilter] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [updatingStockId, setUpdatingStockId] = useState(null);


  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [asetRes, kategoriRes, gudangRes] = await Promise.all([
        getAset(),
        getKategoriAset(),
        getGudang(),
      ]);

      setAset(extractData(asetRes));
      setKategori(extractData(kategoriRes));
      setGudangList(extractData(gudangRes));
    } catch (err) {
      console.error("Gagal mengambil data sarpras:", err);
      setError(
        err?.message || "Gagal mengambil data sarana dan prasarana."
      );
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


  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return aset
      .filter((item) => {
        const nama = String(item?.nama || "").toLowerCase();
        const kode = String(item?.kode || "").toLowerCase();
        const lokasi = String(item?.lokasi || "").toLowerCase();
        const namaKategori = String(
          item?.kategoriAset?.nama || ""
        ).toLowerCase();
        const namaGudang = String(item?.gudang?.nama || "").toLowerCase();

        const matchSearch =
          !keyword ||
          nama.includes(keyword) ||
          kode.includes(keyword) ||
          lokasi.includes(keyword) ||
          namaKategori.includes(keyword) ||
          namaGudang.includes(keyword);

        const matchKategori =
          kategoriFilter === "Semua" ||
          item?.kategoriAset?.nama === kategoriFilter;

        const matchGudang =
          gudangFilter === "Semua" ||
          item?.gudang?.nama === gudangFilter;

        const matchStok =
          stokFilter === "Semua" ||
          getStokStatus(item?.jumlahStok, item?.stokMinimum) === stokFilter;

        return matchSearch && matchKategori && matchGudang && matchStok;
      })
      .sort((a, b) =>
        String(a?.nama || "").localeCompare(String(b?.nama || ""))
      );
  }, [aset, search, kategoriFilter, gudangFilter, stokFilter]);


  const totalAset = aset.length;
  const totalUnit = aset.reduce(
    (t, i) => t + (Number(i?.jumlah) || 0),
    0
  );
  const stokMenipis = aset.filter(
    (i) => getStokStatus(i?.jumlahStok, i?.stokMinimum) === "menipis"
  ).length;
  const perluPerbaikan = aset.filter((i) => {
    const k = String(i?.kondisi || "").toLowerCase();
    return k === "rusak" || k === "rusak_ringan" || k === "rusak_berat";
  }).length;

  const activeFilterCount = [
    kategoriFilter !== "Semua",
    gudangFilter !== "Semua",
    stokFilter !== "Semua",
  ].filter(Boolean).length;


  const handleResetFilter = () => {
    setSearch("");
    setKategoriFilter("Semua");
    setGudangFilter("Semua");
    setStokFilter("Semua");
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus aset "${nama}"?`)) return;

    try {
      setDeletingId(id);
      await deleteAset(id);
      setAset((curr) => curr.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gagal menghapus aset:", err);
      window.alert(err?.message || "Gagal menghapus aset.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStokChange = async (item, delta) => {
    if (!item?.id) return;

    const currentStock = Number(item?.jumlahStok) || 0;
    const totalJumlah =
      Number(item?.jumlah) || currentStock || 1;

    let nextStock = currentStock + delta;
    if (nextStock < 0) nextStock = 0;
    if (nextStock > totalJumlah) nextStock = totalJumlah;
    if (nextStock === currentStock) return;

    const kategoriAsetId =
      item?.kategoriAsetId || item?.kategoriAset?.id;
    const gudangId = item?.gudangId || item?.gudang?.id;

    if (!kategoriAsetId || !gudangId) {
      window.alert("Kategori atau gudang aset tidak ditemukan.");
      return;
    }

    try {
      setUpdatingStockId(item.id);

      const payload = {
        kode: String(item?.kode || ""),
        nama: String(item?.nama || ""),
        kondisi: String(item?.kondisi || "baik"),
        jumlah: totalJumlah,
        jumlahStok: nextStock,
        stokMinimum: Number(item?.stokMinimum) || 0,
        lokasi: item?.lokasi ?? null,
        kategoriAsetId,
        gudangId,
        status: item?.status || "aktif",
        tanggalPembelian: item?.tanggalPembelian ?? null,
        perawatanTerakhir: item?.perawatanTerakhir ?? null,
        tanggalRusak: item?.tanggalRusak ?? null,
        deskripsiKerusakan: item?.deskripsiKerusakan ?? null,
        statusPerbaikan: item?.statusPerbaikan ?? null,
        catatan: item?.catatan ?? null,
      };

      const response = await updateAset(item.id, payload);
      const updated =
        response?.data && !Array.isArray(response.data)
          ? response.data
          : response;

      setAset((curr) =>
        curr.map((c) =>
          c.id === item.id
            ? {
                ...c,
                ...(updated || {}),
                jumlahStok: nextStock,
                jumlah: totalJumlah,
                kategoriAsetId,
                gudangId,
              }
            : c
        )
      );
    } catch (err) {
      console.error("Gagal mengubah stok:", err);
      window.alert(err?.message || "Gagal mengubah stok barang.");
    } finally {
      setUpdatingStockId(null);
    }
  };


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="gudang"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
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

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
                >
                  <Boxes size={23} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                      Data Aset
                    </h1>
                    <span
                      className={`rounded-full ${primarySoft} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]`}
                    >
                      Sarpras
                    </span>
                  </div>
                  <p className="theme-text-muted mt-1 max-w-2xl text-sm">
                    Kelola aset, stok, kondisi, dan perawatan barang
                    inventaris.
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
                  onClick={() =>
                    router.push("/admin/sarpras/gudang/tambah")
                  }
                  className={`${primaryGradient} ${primaryShadow} inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-95`}
                >
                  <Plus size={17} />
                  Tambah Aset
                </button>
              </div>
            </div>

            {error && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border ${neutralBorder} ${neutralSurface} p-4`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-danger">
                  <XCircle size={18} />
                </div>
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
                  className="shrink-0 rounded-lg border theme-border px-2.5 py-1 text-xs font-semibold theme-text-secondary transition hover:theme-card-soft"
                >
                  Coba lagi
                </button>
              </div>
            )}

            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                icon={Boxes}
                label="Total Aset"
                value={totalAset}
                description="Jenis barang"
                tone="primary"
              />
              <StatCard
                icon={Package}
                label="Total Unit"
                value={totalUnit}
                description="Jumlah keseluruhan"
                tone="info"
              />
              <StatCard
                icon={AlertTriangle}
                label="Stok Menipis"
                value={stokMenipis}
                description="Perlu restok"
                tone="warning"
              />
              <StatCard
                icon={Wrench}
                label="Perlu Perbaikan"
                value={perluPerbaikan}
                description="Rusak"
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
                    placeholder="Cari nama, kode, kategori, gudang, atau lokasi..."
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
                  className={`grid grid-cols-1 gap-3 border-t ${neutralBorder} p-4 sm:grid-cols-3`}
                >
                  <div>
                    <label className="theme-text-muted mb-1.5 block text-xs font-semibold">
                      Kategori
                    </label>
                    <select
                      value={kategoriFilter}
                      onChange={(e) => setKategoriFilter(e.target.value)}
                      className={`theme-input h-10 w-full rounded-xl border ${neutralBorder} px-3 text-sm outline-none ${focusStyle}`}
                    >
                      <option value="Semua">Semua Kategori</option>
                      {kategori.map((k) => (
                        <option key={k.id} value={k.nama}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="theme-text-muted mb-1.5 block text-xs font-semibold">
                      Gudang
                    </label>
                    <select
                      value={gudangFilter}
                      onChange={(e) => setGudangFilter(e.target.value)}
                      className={`theme-input h-10 w-full rounded-xl border ${neutralBorder} px-3 text-sm outline-none ${focusStyle}`}
                    >
                      <option value="Semua">Semua Gudang</option>
                      {gudangList.map((g) => (
                        <option key={g.id} value={g.nama}>
                          {g.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="theme-text-muted mb-1.5 block text-xs font-semibold">
                      Status Stok
                    </label>
                    <select
                      value={stokFilter}
                      onChange={(e) => setStokFilter(e.target.value)}
                      className={`theme-input h-10 w-full rounded-xl border ${neutralBorder} px-3 text-sm outline-none ${focusStyle}`}
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="aman">Aman</option>
                      <option value="menipis">Menipis</option>
                      <option value="habis">Habis</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`theme-card mt-4 overflow-hidden rounded-2xl border ${neutralBorder} ${cardShadow}`}
            >
              <div
                className={`flex flex-col gap-2 border-b ${neutralBorder} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="theme-text text-sm font-bold">
                      Daftar Aset
                    </h2>
                    <span
                      className={`${neutralSurface} theme-text-muted rounded-full px-2 py-0.5 text-[10px] font-bold`}
                    >
                      {filtered.length}
                    </span>
                  </div>
                  <p className="theme-text-muted mt-0.5 text-xs">
                    {kategori.length} kategori · {gudangList.length} gudang
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${primarySoft} text-[var(--color-primary)]`}
                    >
                      <Loader2 size={25} className="animate-spin" />
                    </div>
                    <p className="theme-text mt-4 text-sm font-semibold">
                      Memuat data aset...
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Mengambil data dari server
                    </p>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${neutralSurface} theme-text-muted`}
                  >
                    <Warehouse size={27} />
                  </div>
                  <h3 className="theme-text mt-5 text-base font-bold">
                    Tidak ada data aset
                  </h3>
                  <p className="theme-text-secondary mt-1.5 max-w-md text-sm">
                    Tidak ditemukan aset yang sesuai dengan pencarian atau
                    filter.
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
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead>
                        <tr
                          className={`border-b ${neutralBorder} ${neutralSurface}`}
                        >
                          <th className="theme-text-muted px-5 py-3 text-[10px] font-bold uppercase tracking-wider">
                            Aset
                          </th>
                          <th className="theme-text-muted px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                            Kategori / Gudang
                          </th>
                          <th className="theme-text-muted px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                            Kondisi
                          </th>
                          <th className="theme-text-muted px-4 py-3 text-[10px] font-bold uppercase tracking-wider">
                            Stok
                          </th>
                          <th className="theme-text-muted px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {filtered.map((item) => {
                          const status = getStokStatus(
                            item?.jumlahStok,
                            item?.stokMinimum
                          );
                          const config = stokConfig[status];
                          const StatusIcon = config.icon;

                          const currentStock =
                            Number(item?.jumlahStok) || 0;
                          const totalJumlah =
                            Number(item?.jumlah) || currentStock || 1;

                          const pct =
                            totalJumlah > 0
                              ? Math.min(
                                  100,
                                  (currentStock / totalJumlah) * 100
                                )
                              : 0;

                          const kondisi = String(
                            item?.kondisi || ""
                          ).toLowerCase();
                          const kondisiBaik = kondisi === "baik";

                          const isUpdating =
                            updatingStockId === item.id;
                          const isDeleting = deletingId === item.id;

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
                                    <Package size={17} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="theme-text truncate text-sm font-semibold">
                                      {item?.nama || "-"}
                                    </p>
                                    <p className="theme-text-muted mt-0.5 font-mono text-[11px]">
                                      {item?.kode || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <Tag
                                      size={13}
                                      className="shrink-0 text-[var(--color-primary)]"
                                    />
                                    <span className="theme-text truncate text-xs font-medium">
                                      {item?.kategoriAset?.nama || "-"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Warehouse
                                      size={13}
                                      className="theme-text-muted shrink-0"
                                    />
                                    <span className="theme-text-muted truncate text-xs">
                                      {item?.gudang?.nama || "-"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                                    kondisiBaik
                                      ? "theme-success theme-border"
                                      : "theme-danger theme-border"
                                  }`}
                                >
                                  {kondisiBaik ? (
                                    <CheckCircle size={12} />
                                  ) : (
                                    <AlertTriangle size={12} />
                                  )}
                                  {formatText(item?.kondisi)}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <div className="w-full max-w-[180px]">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <div className="flex items-baseline gap-1">
                                      <span className="theme-text text-sm font-bold tabular-nums">
                                        {formatNumber(currentStock)}
                                      </span>
                                      <span className="theme-text-muted text-[10px]">
                                        / {formatNumber(totalJumlah)}
                                      </span>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-bold ${config.iconColor}`}
                                    >
                                      <StatusIcon size={11} />
                                      {config.label}
                                    </span>
                                  </div>
                                  <div
                                    className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${neutralSurface}`}
                                  >
                                    <div
                                      className={`h-full rounded-full transition-all ${config.barClass}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <p className="theme-text-muted mt-1 text-[10px]">
                                    Min {formatNumber(item?.stokMinimum)}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    disabled={
                                      isUpdating || currentStock <= 0
                                    }
                                    onClick={() =>
                                      handleStokChange(item, -1)
                                    }
                                    title="Kurangi stok"
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition hover:theme-danger disabled:cursor-not-allowed disabled:opacity-30`}
                                  >
                                    {isUpdating ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <PackageMinus size={15} />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      isUpdating ||
                                      currentStock >= totalJumlah
                                    }
                                    onClick={() =>
                                      handleStokChange(item, 1)
                                    }
                                    title="Tambah stok"
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition hover:theme-success disabled:cursor-not-allowed disabled:opacity-30`}
                                  >
                                    <PackagePlus size={15} />
                                  </button>

                                  <div
                                    className={`mx-1 h-5 w-px ${neutralBorder}`}
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/admin/sarpras/gudang/detail/${encodeURIComponent(
                                          item.id
                                        )}`
                                      )
                                    }
                                    title="Detail"
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition ${primaryHover} hover:text-[var(--color-primary)]`}
                                  >
                                    <Eye size={15} />
                                  </button>

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
                                      handleDelete(
                                        item.id,
                                        item?.nama || "aset"
                                      )
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

                  <div className="divide-y divide-[var(--color-border)] md:hidden">
                    {filtered.map((item) => {
                      const status = getStokStatus(
                        item?.jumlahStok,
                        item?.stokMinimum
                      );
                      const config = stokConfig[status];
                      const StatusIcon = config.icon;

                      const currentStock =
                        Number(item?.jumlahStok) || 0;
                      const totalJumlah =
                        Number(item?.jumlah) || currentStock || 1;

                      const pct =
                        totalJumlah > 0
                          ? Math.min(
                              100,
                              (currentStock / totalJumlah) * 100
                            )
                          : 0;

                      return (
                        <div key={item.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
                            >
                              <Package size={17} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="theme-text truncate text-sm font-semibold">
                                    {item?.nama || "-"}
                                  </p>
                                  <p className="theme-text-muted mt-0.5 font-mono text-[11px]">
                                    {item?.kode || "-"}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${
                                    String(item?.kondisi).toLowerCase() ===
                                    "baik"
                                      ? "theme-success theme-border"
                                      : "theme-danger theme-border"
                                  }`}
                                >
                                  {formatText(item?.kondisi)}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center gap-3 text-xs">
                                <span className="theme-text-muted inline-flex items-center gap-1">
                                  <Tag
                                    size={11}
                                    className="text-[var(--color-primary)]"
                                  />
                                  {item?.kategoriAset?.nama || "-"}
                                </span>
                                <span className="theme-text-muted inline-flex items-center gap-1">
                                  <Warehouse size={11} />
                                  {item?.gudang?.nama || "-"}
                                </span>
                              </div>

                              <div className="mt-3">
                                <div className="flex items-baseline justify-between gap-2">
                                  <div className="flex items-baseline gap-1">
                                    <span className="theme-text text-sm font-bold tabular-nums">
                                      {formatNumber(currentStock)}
                                    </span>
                                    <span className="theme-text-muted text-[10px]">
                                      / {formatNumber(totalJumlah)}
                                    </span>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold ${config.iconColor}`}
                                  >
                                    <StatusIcon size={11} />
                                    {config.label}
                                  </span>
                                </div>
                                <div
                                  className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${neutralSurface}`}
                                >
                                  <div
                                    className={`h-full rounded-full transition-all ${config.barClass}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStokChange(item, -1)}
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:theme-danger"
                                  title="Kurangi stok"
                                >
                                  <PackageMinus size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStokChange(item, 1)}
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:theme-success"
                                  title="Tambah stok"
                                >
                                  <PackagePlus size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/admin/sarpras/gudang/detail/${encodeURIComponent(
                                        item.id
                                      )}`
                                    )
                                  }
                                  className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition ${primaryHover} hover:text-[var(--color-primary)]`}
                                  title="Detail"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/admin/sarpras/gudang/edit/${item.id}`
                                    )
                                  }
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:theme-warning"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(item.id, item?.nama || "aset")
                                  }
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:theme-danger"
                                  title="Hapus"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`flex flex-col gap-1 border-t ${neutralBorder} ${neutralSurface} px-5 py-3 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <span>
                      Menampilkan{" "}
                      <strong className="theme-text">
                        {filtered.length}
                      </strong>{" "}
                      dari{" "}
                      <strong className="theme-text">{aset.length}</strong>{" "}
                      aset
                    </span>
                    <span>
                      Total unit:{" "}
                      <strong className="theme-text">
                        {formatNumber(totalUnit)}
                      </strong>
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="theme-text-muted text-[11px]">
                © 2026 SmartSchool • Sarana & Prasarana
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function StatCard({ icon: Icon, label, value, description, tone = "primary" }) {
  const toneMap = {
    primary: { bg: primarySoft, icon: "text-[var(--color-primary)]" },
    info: {
      bg: "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]",
      icon: "text-[var(--color-info)]",
    },
    warning: { bg: warningSoft, icon: "text-[var(--color-warning)]" },
    danger: {
      bg: "bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)]",
      icon: "text-[var(--color-danger)]",
    },
    success: { bg: successSoft, icon: "text-[var(--color-success)]" },
  };

  const style = toneMap[tone] || toneMap.primary;

  return (
    <div
      className={`theme-card rounded-xl border ${neutralBorder} p-4 ${cardShadow} transition hover:-translate-y-0.5 hover:shadow-md`}
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