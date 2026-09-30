"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

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
  X,
  CalendarDays,
  ClipboardList,
  Wrench,
  Database,
  Tag,
  Package,
  FileText,
  User,
  Clock3,
} from "lucide-react";

import {
  getAset,
  getKategoriAset,
  getGudang,
  updateAset,
  deleteAset,
} from "../../../../../services/sarpras.service";

// =====================================================
// THEME HELPERS
// =====================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

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

// =====================================================
// HELPER
// =====================================================

function extractData(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
}

function getStokStatus(stok, minimum) {
  const currentStock = Number(stok) || 0;
  const minStock = Number(minimum) || 0;

  if (currentStock <= 0) {
    return "habis";
  }

  if (currentStock <= minStock) {
    return "menipis";
  }

  return "aman";
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatText(value) {
  if (!value) {
    return "-";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// =====================================================
// STATUS CONFIG
// =====================================================

const stokStatusConfig = {
  aman: {
    label: "Aman",
    icon: CheckCircle,
    textClassName: "theme-success",
    bgClassName: themeSuccessSurface,
    borderClassName: themeSuccessBorder,
    barClassName: "bg-[var(--color-success)]",
  },

  menipis: {
    label: "Menipis",
    icon: AlertTriangle,
    textClassName: "theme-warning",
    bgClassName: themeWarningSurface,
    borderClassName: themeWarningBorder,
    barClassName: "bg-[var(--color-warning)]",
  },

  habis: {
    label: "Habis",
    icon: XCircle,
    textClassName: "theme-danger",
    bgClassName: themeDangerSurface,
    borderClassName: themeDangerBorder,
    barClassName:
      "bg-[color-mix(in_srgb,var(--color-text)_55%,transparent)]",
  },
};

// =====================================================
// MAIN
// =====================================================

export default function AdminSarprasGudangPage() {
  const router = useRouter();

  // ===================================================
  // SIDEBAR
  // ===================================================

  const [isCollapsed, setIsCollapsed] = useState(false);

  // ===================================================
  // DATA
  // ===================================================

  const [aset, setAset] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [gudangList, setGudangList] = useState([]);

  // ===================================================
  // FILTER
  // ===================================================

  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [gudangFilter, setGudangFilter] = useState("Semua");
  const [stokFilter, setStokFilter] = useState("Semua");
  const [kondisiFilter, setKondisiFilter] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);

  // ===================================================
  // STATE
  // ===================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [updatingStockId, setUpdatingStockId] = useState(null);

  // ===================================================
  // DETAIL
  // ===================================================

  const [selectedAset, setSelectedAset] = useState(null);

  // ===================================================
  // LOAD DATA
  // ===================================================

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        asetResponse,
        kategoriResponse,
        gudangResponse,
      ] = await Promise.all([
        getAset(),
        getKategoriAset(),
        getGudang(),
      ]);

      setAset(extractData(asetResponse));
      setKategori(extractData(kategoriResponse));
      setGudangList(extractData(gudangResponse));
    } catch (err) {
      console.error("Gagal mengambil data sarpras:", err);

      setError(
        err?.message ||
          "Gagal mengambil data sarana dan prasarana dari server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===================================================
  // FILTER DATA
  // ===================================================

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

        const namaGudang = String(
          item?.gudang?.nama || ""
        ).toLowerCase();

        const matchSearch =
          !keyword ||
          nama.includes(keyword) ||
          kode.includes(keyword) ||
          lokasi.includes(keyword) ||
          namaKategori.includes(keyword) ||
          namaGudang.includes(keyword);

        const kategoriNama = item?.kategoriAset?.nama || "";

        const matchKategori =
          kategoriFilter === "Semua" ||
          kategoriNama === kategoriFilter;

        const gudangNama = item?.gudang?.nama || "";

        const matchGudang =
          gudangFilter === "Semua" ||
          gudangNama === gudangFilter;

        const stokStatus = getStokStatus(
          item?.jumlahStok,
          item?.stokMinimum
        );

        const matchStok =
          stokFilter === "Semua" ||
          stokStatus === stokFilter;

        const kondisi = String(
          item?.kondisi || ""
        ).toLowerCase();

        const matchKondisi =
          kondisiFilter === "Semua" ||
          kondisi === kondisiFilter;

        return (
          matchSearch &&
          matchKategori &&
          matchGudang &&
          matchStok &&
          matchKondisi
        );
      })
      .sort((a, b) =>
        String(a?.nama || "").localeCompare(
          String(b?.nama || "")
        )
      );
  }, [
    aset,
    search,
    kategoriFilter,
    gudangFilter,
    stokFilter,
    kondisiFilter,
  ]);

  // ===================================================
  // STATISTICS
  // ===================================================

  const totalBarang = aset.length;

  const totalUnit = aset.reduce(
    (total, item) =>
      total + (Number(item?.jumlah) || 0),
    0
  );

  const totalStok = aset.reduce(
    (total, item) =>
      total + (Number(item?.jumlahStok) || 0),
    0
  );

  const stokAman = aset.filter(
    (item) =>
      getStokStatus(
        item?.jumlahStok,
        item?.stokMinimum
      ) === "aman"
  ).length;

  const stokMenipis = aset.filter(
    (item) =>
      getStokStatus(
        item?.jumlahStok,
        item?.stokMinimum
      ) === "menipis"
  ).length;

  const stokHabis = aset.filter(
    (item) =>
      getStokStatus(
        item?.jumlahStok,
        item?.stokMinimum
      ) === "habis"
  ).length;

  const perluPerbaikan = aset.filter((item) => {
    const kondisi = String(
      item?.kondisi || ""
    ).toLowerCase();

    const statusPerbaikan = String(
      item?.statusPerbaikan || ""
    ).toLowerCase();

    return (
      kondisi === "rusak" ||
      kondisi === "rusak_ringan" ||
      kondisi === "rusak_berat" ||
      statusPerbaikan === "diproses" ||
      statusPerbaikan === "perbaikan"
    );
  }).length;

  // ===================================================
  // FILTER COUNT
  // ===================================================

  const activeFilterCount = [
    kategoriFilter !== "Semua",
    gudangFilter !== "Semua",
    stokFilter !== "Semua",
    kondisiFilter !== "Semua",
  ].filter(Boolean).length;

  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async (id, nama) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus aset "${nama}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteAset(id);

      setAset((current) =>
        current.filter((item) => item.id !== id)
      );

      if (selectedAset?.id === id) {
        setSelectedAset(null);
      }

      window.alert(
        `Aset "${nama}" berhasil dihapus.`
      );
    } catch (err) {
      console.error(
        "Gagal menghapus aset:",
        err
      );

      window.alert(
        err?.message ||
          "Gagal menghapus aset."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===================================================
  // UPDATE STOK
  // ===================================================

  const handleStokChange = async (item, delta) => {
    if (!item?.id) return;

    const currentStock =
      Number(item?.jumlahStok) || 0;

    const totalJumlah =
      Number(item?.jumlah) ||
      currentStock ||
      1;

    let nextStock =
      currentStock + delta;

    if (nextStock < 0) {
      nextStock = 0;
    }

    if (nextStock > totalJumlah) {
      nextStock = totalJumlah;
    }

    if (nextStock === currentStock) {
      return;
    }

    const kategoriAsetId =
      item?.kategoriAsetId ||
      item?.kategoriAset?.id;

    const gudangId =
      item?.gudangId ||
      item?.gudang?.id;

    if (!kategoriAsetId) {
      window.alert(
        "Kategori aset tidak ditemukan."
      );
      return;
    }

    if (!gudangId) {
      window.alert(
        "Gudang aset tidak ditemukan."
      );
      return;
    }

    try {
      setUpdatingStockId(item.id);

      const payload = {
        kode: String(item?.kode || ""),
        nama: String(item?.nama || ""),
        kondisi: String(
          item?.kondisi || "baik"
        ),
        jumlah: totalJumlah,
        jumlahStok: nextStock,
        stokMinimum:
          Number(item?.stokMinimum) || 0,
        lokasi: item?.lokasi ?? null,
        kategoriAsetId,
        gudangId,
        status:
          item?.status || "aktif",
        tanggalPembelian:
          item?.tanggalPembelian ?? null,
        perawatanTerakhir:
          item?.perawatanTerakhir ?? null,
        tanggalRusak:
          item?.tanggalRusak ?? null,
        deskripsiKerusakan:
          item?.deskripsiKerusakan ?? null,
        statusPerbaikan:
          item?.statusPerbaikan ?? null,
        catatan:
          item?.catatan ?? null,
      };

      const response =
        await updateAset(
          item.id,
          payload
        );

      const updatedData =
        response?.data &&
        !Array.isArray(response.data)
          ? response.data
          : response;

      setAset((current) =>
        current.map((currentItem) => {
          if (
            currentItem.id !== item.id
          ) {
            return currentItem;
          }

          return {
            ...currentItem,
            ...(updatedData || {}),
            jumlahStok: nextStock,
            jumlah: totalJumlah,
            kategoriAsetId,
            gudangId,
          };
        })
      );

      setSelectedAset((current) => {
        if (
          !current ||
          current.id !== item.id
        ) {
          return current;
        }

        return {
          ...current,
          jumlahStok: nextStock,
          jumlah: totalJumlah,
        };
      });
    } catch (err) {
      console.error(
        "Gagal mengubah stok:",
        err
      );

      window.alert(
        err?.message ||
          "Gagal mengubah stok barang."
      );
    } finally {
      setUpdatingStockId(null);
    }
  };

  // ===================================================
  // RESET FILTER
  // ===================================================

  const handleResetFilter = () => {
    setSearch("");
    setKategoriFilter("Semua");
    setGudangFilter("Semua");
    setStokFilter("Semua");
    setKondisiFilter("Semua");
  };

  // ===================================================
  // SIDEBAR
  // ===================================================

  const toggleSidebar = () => {
    setIsCollapsed(
      (current) => !current
    );
  };

  // ===================================================
  // DETAIL ITEM
  // ===================================================

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    full = false,
  }) => (
    <div
      className={
        full ? "md:col-span-2" : ""
      }
    >
      <div className="mb-1.5 flex items-center gap-2">
        <Icon
          size={14}
          className="theme-text-muted"
        />

        <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <div
        className={`theme-card min-h-[42px] rounded-lg border ${themeNeutralBorder} px-3 py-2.5 text-sm leading-5 theme-text`}
      >
        {value || "-"}
      </div>
    </div>
  );

  // ===================================================
  // RENDER
  // =====================================================

  return (
    <div className="theme-page h-screen overflow-hidden">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <div className="fixed inset-y-0 left-0 z-[60]">
        <Sidebar
          active="gudang"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* =================================================
          CONTENT WRAPPER
      ================================================= */}

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="theme-header relative z-50 flex h-[72px] flex-shrink-0 border-b theme-divider">
          <div className="w-full min-w-0">
            <Header
              toggleSidebar={toggleSidebar}
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email:
                  "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>
        </header>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden">

            <div className="w-full px-4 py-5 md:px-6 md:py-6 xl:px-8">

              <div className="mx-auto w-full max-w-[1800px] space-y-5">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <section
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow} md:p-6`}
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div className="flex min-w-0 items-center gap-4">

                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} ring-1 ${themePrimarySoftBorder}`}
                      >
                        <Boxes size={23} />
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h1 className="theme-text text-xl font-bold tracking-tight md:text-2xl">
                            Data Aset
                          </h1>

                          <span
                            className={`rounded-full ${themePrimarySoft} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${themePrimaryText}`}
                          >
                            Sarpras
                          </span>

                        </div>

                        <p className="theme-text-secondary mt-1 max-w-2xl text-sm leading-5">
                          Kelola data aset, stok,
                          kondisi, lokasi,
                          perawatan, dan informasi
                          kerusakan.
                        </p>

                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          loadData(true)
                        }
                        disabled={refreshing}
                        className={`theme-card inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-4 text-sm font-semibold theme-text-secondary ${themeNeutralHover} ${themeSmallShadow} transition disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <RefreshCw
                          size={16}
                          className={
                            refreshing
                              ? "animate-spin"
                              : ""
                          }
                        />

                        <span>
                          Refresh
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/sarpras/gudang/tambah"
                          )
                        }
                        className={`${themePrimaryGradient} inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95`}
                      >
                        <Plus size={17} />
                        Tambah Aset
                      </button>

                    </div>

                  </div>
                </section>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                  <div
                    className={`flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
                  >
                    <XCircle
                      size={19}
                      className="theme-danger mt-0.5 flex-shrink-0"
                    />

                    <div className="min-w-0">

                      <p className="theme-danger text-sm font-semibold">
                        Gagal memuat data
                      </p>

                      <p className="theme-text-secondary mt-1 text-sm">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          loadData()
                        }
                        className="theme-danger mt-2 text-sm font-semibold underline underline-offset-2"
                      >
                        Coba lagi
                      </button>

                    </div>
                  </div>
                )}

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">

                  {/* TOTAL ASET */}

                  <div
                    className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                          Total Aset
                        </p>

                        <p className="theme-text mt-2 text-2xl font-bold">
                          {formatNumber(
                            totalBarang
                          )}
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          Jenis barang
                        </p>

                      </div>

                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <Boxes size={19} />
                      </div>

                    </div>
                  </div>

                  {/* TOTAL UNIT */}

                  <div
                    className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                          Total Unit
                        </p>

                        <p className="theme-text mt-2 text-2xl font-bold">
                          {formatNumber(
                            totalUnit
                          )}
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          Jumlah keseluruhan
                        </p>

                      </div>

                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)]`}
                      >
                        <Package size={19} />
                      </div>

                    </div>
                  </div>

                  {/* STOK AMAN */}

                  <div
                    className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                          Stok Aman
                        </p>

                        <p className="theme-success mt-2 text-2xl font-bold">
                          {formatNumber(
                            stokAman
                          )}
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          Di atas minimum
                        </p>

                      </div>

                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${themeSuccessSurface} theme-success`}
                      >
                        <CheckCircle size={19} />
                      </div>

                    </div>
                  </div>

                  {/* STOK MENIPIS */}

                  <div
                    className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                          Stok Menipis
                        </p>

                        <p className="theme-warning mt-2 text-2xl font-bold">
                          {formatNumber(
                            stokMenipis
                          )}
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          Perlu restok
                        </p>

                      </div>

                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${themeWarningSurface} theme-warning`}
                      >
                        <AlertTriangle size={19} />
                      </div>

                    </div>
                  </div>

                  {/* PERBAIKAN */}

                  <div
                    className={`theme-card col-span-2 rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} lg:col-span-1`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                          Perlu Perbaikan
                        </p>

                        <p className="theme-danger mt-2 text-2xl font-bold">
                          {formatNumber(
                            perluPerbaikan
                          )}
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          Rusak / perbaikan
                        </p>

                      </div>

                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${themeDangerSurface} theme-danger`}
                      >
                        <Wrench size={19} />
                      </div>

                    </div>
                  </div>

                </section>

                {/* =================================================
                    SEARCH + FILTER
                ================================================= */}

                <section
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                >
                  <div className="flex flex-col gap-3">

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                      <div className="relative min-w-0 flex-1">

                        <Search
                          size={17}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setSearch(
                              e.target.value
                            )
                          }
                          placeholder="Cari nama, kode, kategori, gudang, atau lokasi..."
                          className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition ${themeFocus}`}
                        />

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowFilter(
                            (current) =>
                              !current
                          )
                        }
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                          showFilter ||
                          activeFilterCount >
                            0
                            ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`
                            : `theme-card ${themeNeutralBorder} theme-text-secondary ${themeNeutralHover}`
                        }`}
                      >
                        <Filter size={17} />

                        Filter

                        {activeFilterCount >
                          0 && (
                          <span
                            className={`${themePrimaryGradient} flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-[var(--color-card)]`}
                          >
                            {
                              activeFilterCount
                            }
                          </span>
                        )}
                      </button>

                    </div>

                    {showFilter && (
                      <div
                        className={`grid grid-cols-1 gap-3 border-t ${themeDivider} pt-3 sm:grid-cols-2 xl:grid-cols-4`}
                      >

                        {/* KATEGORI */}

                        <div>

                          <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                            Kategori Aset
                          </label>

                          <select
                            value={
                              kategoriFilter
                            }
                            onChange={(e) =>
                              setKategoriFilter(
                                e.target.value
                              )
                            }
                            className={`theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none ${themeFocus}`}
                          >
                            <option value="Semua">
                              Semua Kategori
                            </option>

                            {kategori.map(
                              (item) => (
                                <option
                                  key={
                                    item.id
                                  }
                                  value={
                                    item.nama
                                  }
                                >
                                  {item.nama}
                                </option>
                              )
                            )}
                          </select>

                        </div>

                        {/* GUDANG */}

                        <div>

                          <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                            Gudang
                          </label>

                          <select
                            value={
                              gudangFilter
                            }
                            onChange={(e) =>
                              setGudangFilter(
                                e.target.value
                              )
                            }
                            className={`theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none ${themeFocus}`}
                          >
                            <option value="Semua">
                              Semua Gudang
                            </option>

                            {gudangList.map(
                              (item) => (
                                <option
                                  key={
                                    item.id
                                  }
                                  value={
                                    item.nama
                                  }
                                >
                                  {item.nama}
                                </option>
                              )
                            )}
                          </select>

                        </div>

                        {/* STOK */}

                        <div>

                          <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                            Status Stok
                          </label>

                          <select
                            value={
                              stokFilter
                            }
                            onChange={(e) =>
                              setStokFilter(
                                e.target.value
                              )
                            }
                            className={`theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none ${themeFocus}`}
                          >
                            <option value="Semua">
                              Semua Status
                            </option>

                            <option value="aman">
                              Aman
                            </option>

                            <option value="menipis">
                              Menipis
                            </option>

                            <option value="habis">
                              Habis
                            </option>
                          </select>

                        </div>

                        {/* KONDISI */}

                        <div>

                          <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                            Kondisi
                          </label>

                          <select
                            value={
                              kondisiFilter
                            }
                            onChange={(e) =>
                              setKondisiFilter(
                                e.target.value
                              )
                            }
                            className={`theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none ${themeFocus}`}
                          >
                            <option value="Semua">
                              Semua Kondisi
                            </option>

                            <option value="baik">
                              Baik
                            </option>

                            <option value="rusak">
                              Rusak
                            </option>

                            <option value="rusak_ringan">
                              Rusak Ringan
                            </option>

                            <option value="rusak_berat">
                              Rusak Berat
                            </option>
                          </select>

                        </div>

                        <div className="flex items-end sm:col-span-2 xl:col-span-4">

                          <button
                            type="button"
                            onClick={
                              handleResetFilter
                            }
                            className={`theme-text-muted text-sm font-semibold transition hover:text-[var(--color-primary)]`}
                          >
                            Reset semua filter
                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                </section>

                {/* =================================================
                    TABLE
                ================================================= */}

                <section
                  className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >

                  {/* TABLE HEADER */}

                  <div
                    className={`flex flex-col gap-3 border-b ${themeDivider} px-5 py-4 md:flex-row md:items-center md:justify-between`}
                  >

                    <div>

                      <div className="flex items-center gap-2">

                        <h2 className="theme-text text-base font-bold">
                          Daftar Aset
                        </h2>

                        <span
                          className={`${themeNeutralSurface} theme-text-muted rounded-full px-2 py-0.5 text-[10px] font-bold`}
                        >
                          {filtered.length}
                        </span>

                      </div>

                      <p className="theme-text-secondary mt-1 text-xs">
                        Data aset sarana dan
                        prasarana sekolah
                      </p>

                    </div>

                    <div className="theme-text-muted flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">

                      <span className="inline-flex items-center gap-1.5">
                        <Warehouse size={14} />
                        {gudangList.length} gudang
                      </span>

                      <span
                        className={`${themeNeutralSurface} hidden h-1 w-1 rounded-full sm:block`}
                      />

                      <span className="inline-flex items-center gap-1.5">
                        <Tag size={14} />
                        {kategori.length} kategori
                      </span>

                      <span
                        className={`${themeNeutralSurface} hidden h-1 w-1 rounded-full sm:block`}
                      />

                      <span>
                        {formatNumber(
                          totalStok
                        )}{" "}
                        stok tersedia
                      </span>

                    </div>

                  </div>

                  {/* TABLE WRAPPER */}

                  <div className="overflow-x-auto">

                    <div className="max-h-[calc(100vh-410px)] min-h-[360px] overflow-y-auto">

                      <table className="w-full min-w-[1120px] border-collapse text-sm">

                        {/* THEAD */}

                        <thead className="sticky top-0 z-30">

                          <tr
                            className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                          >

                            <th
                              className={`sticky left-0 z-40 w-[280px] min-w-[280px] border-r ${themeDivider} ${themeNeutralSurface} px-5 py-3.5 text-left`}
                            >
                              <span className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                                Aset
                              </span>
                            </th>

                            <th className="w-[220px] min-w-[220px] px-4 py-3.5 text-left">
                              <span className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                                Kategori & Gudang
                              </span>
                            </th>

                            <th className="w-[150px] min-w-[150px] px-4 py-3.5 text-left">
                              <span className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                                Lokasi
                              </span>
                            </th>

                            <th className="w-[125px] min-w-[125px] px-4 py-3.5 text-left">
                              <span className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                                Kondisi
                              </span>
                            </th>

                            <th className="w-[210px] min-w-[210px] px-4 py-3.5 text-left">
                              <span className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                                Stok
                              </span>
                            </th>

                            <th className="w-[180px] min-w-[180px] px-4 py-3.5 text-left">
                              <span className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                                Informasi
                              </span>
                            </th>

                            <th
                              className={`sticky right-0 z-40 w-[180px] min-w-[180px] border-l ${themeDivider} ${themeNeutralSurface} px-4 py-3.5 text-center`}
                            >
                              <span className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                                Aksi
                              </span>
                            </th>

                          </tr>

                        </thead>

                        {/* TBODY */}

                        <tbody>

                          {/* LOADING */}

                          {loading ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-4 py-24 text-center"
                              >
                                <div className="flex flex-col items-center">

                                  <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${themePrimarySoft}`}
                                  >
                                    <Loader2
                                      size={24}
                                      className={`animate-spin ${themePrimaryText}`}
                                    />
                                  </div>

                                  <p className="theme-text mt-4 text-sm font-semibold">
                                    Memuat data aset...
                                  </p>

                                  <p className="theme-text-muted mt-1 text-xs">
                                    Mengambil data dari server
                                  </p>

                                </div>
                              </td>
                            </tr>
                          ) : filtered.length === 0 ? (

                            /* EMPTY */

                            <tr>
                              <td
                                colSpan={7}
                                className="px-4 py-24 text-center"
                              >
                                <div className="flex flex-col items-center">

                                  <div
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                                  >
                                    <Warehouse
                                      size={25}
                                    />
                                  </div>

                                  <p className="theme-text mt-4 text-sm font-bold">
                                    Tidak ada data aset
                                  </p>

                                  <p className="theme-text-muted mt-1 max-w-sm text-xs leading-5">
                                    Tidak ditemukan
                                    aset yang sesuai
                                    dengan pencarian
                                    atau filter.
                                  </p>

                                  {(search ||
                                    activeFilterCount >
                                      0) && (
                                    <button
                                      type="button"
                                      onClick={
                                        handleResetFilter
                                      }
                                      className={`${themePrimarySoft} ${themePrimaryText} mt-4 rounded-lg px-3 py-2 text-xs font-semibold transition ${themePrimaryHover}`}
                                    >
                                      Reset pencarian
                                    </button>
                                  )}

                                </div>
                              </td>
                            </tr>

                          ) : (

                            /* DATA */

                            filtered.map(
                              (
                                item,
                                index
                              ) => {

                                const status =
                                  getStokStatus(
                                    item?.jumlahStok,
                                    item?.stokMinimum
                                  );

                                const config =
                                  stokStatusConfig[
                                    status
                                  ];

                                const StatusIcon =
                                  config.icon;

                                const currentStock =
                                  Number(
                                    item?.jumlahStok
                                  ) || 0;

                                const totalJumlah =
                                  Number(
                                    item?.jumlah
                                  ) ||
                                  currentStock ||
                                  1;

                                const minimumStock =
                                  Number(
                                    item?.stokMinimum
                                  ) || 0;

                                const stockPercentage =
                                  totalJumlah >
                                  0
                                    ? Math.min(
                                        100,
                                        (currentStock /
                                          totalJumlah) *
                                          100
                                      )
                                    : 0;

                                const isUpdatingStock =
                                  updatingStockId ===
                                  item.id;

                                const isDeleting =
                                  deletingId ===
                                  item.id;

                                const kondisi =
                                  String(
                                    item?.kondisi ||
                                      ""
                                  ).toLowerCase();

                                const kondisiBaik =
                                  kondisi ===
                                  "baik";

                                return (
                                  <tr
                                    key={
                                      item.id
                                    }
                                    className={`group border-b ${themeDivider} transition last:border-b-0 hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)] ${
                                      index % 2 ===
                                      0
                                        ? "theme-card"
                                        : themeNeutralSurface
                                    }`}
                                  >

                                    {/* ASET */}

                                    <td
                                      className={`sticky left-0 z-20 border-r ${themeDivider} theme-card px-5 py-4 group-hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]`}
                                    >

                                      <div className="flex items-center gap-3">

                                        <div
                                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} ring-1 ${themePrimarySoftBorder}`}
                                        >
                                          <Package
                                            size={18}
                                          />
                                        </div>

                                        <div className="min-w-0">

                                          <p
                                            className="theme-text truncate text-sm font-bold"
                                            title={
                                              item?.nama
                                            }
                                          >
                                            {item?.nama ||
                                              "-"}
                                          </p>

                                          <div className="mt-1 flex items-center gap-2">

                                            <span
                                              className={`${themeNeutralSurface} theme-text-muted rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold`}
                                            >
                                              {item?.kode ||
                                                "-"}
                                            </span>

                                          </div>

                                        </div>

                                      </div>

                                    </td>

                                    {/* KATEGORI + GUDANG */}

                                    <td className="px-4 py-4">

                                      <div className="space-y-2">

                                        <div className="flex min-w-0 items-center gap-2">

                                          <div
                                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                                          >
                                            <Tag
                                              size={
                                                13
                                              }
                                            />
                                          </div>

                                          <span
                                            className="theme-text truncate text-xs font-semibold"
                                            title={
                                              item
                                                ?.kategoriAset
                                                ?.nama
                                            }
                                          >
                                            {item
                                              ?.kategoriAset
                                              ?.nama ||
                                              "-"}
                                          </span>

                                        </div>

                                        <div className="flex min-w-0 items-center gap-2">

                                          <div
                                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}
                                          >
                                            <Warehouse
                                              size={
                                                13
                                              }
                                            />
                                          </div>

                                          <span
                                            className="theme-text-secondary truncate text-xs"
                                            title={
                                              item
                                                ?.gudang
                                                ?.nama
                                            }
                                          >
                                            {item
                                              ?.gudang
                                              ?.nama ||
                                              "-"}
                                          </span>

                                        </div>

                                      </div>

                                    </td>

                                    {/* LOKASI */}

                                    <td className="px-4 py-4">

                                      <div className="flex min-w-0 items-center gap-2">

                                        <MapPin
                                          size={15}
                                          className="theme-text-muted flex-shrink-0"
                                        />

                                        <span
                                          className="theme-text-secondary truncate text-xs font-medium"
                                          title={
                                            item?.lokasi
                                          }
                                        >
                                          {item?.lokasi ||
                                            "-"}
                                        </span>

                                      </div>

                                    </td>

                                    {/* KONDISI */}

                                    <td className="px-4 py-4">

                                      <div className="flex flex-col items-start gap-2">

                                        <span
                                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                                            kondisiBaik
                                              ? `${themeSuccessBorder} ${themeSuccessSurface} theme-success`
                                              : `${themeDangerBorder} ${themeDangerSurface} theme-danger`
                                          }`}
                                        >
                                          {kondisiBaik ? (
                                            <CheckCircle
                                              size={
                                                13
                                              }
                                            />
                                          ) : (
                                            <AlertTriangle
                                              size={
                                                13
                                              }
                                            />
                                          )}

                                          {formatText(
                                            item?.kondisi
                                          )}
                                        </span>

                                        {item?.status && (
                                          <span className="theme-text-muted text-[10px]">
                                            Status:{" "}
                                            <span className="theme-text-secondary font-medium">
                                              {formatText(
                                                item.status
                                              )}
                                            </span>
                                          </span>
                                        )}

                                      </div>

                                    </td>

                                    {/* STOK */}

                                    <td className="px-4 py-4">

                                      <div className="w-full max-w-[190px]">

                                        <div className="flex items-center justify-between gap-3">

                                          <div className="flex items-baseline gap-1.5">

                                            <span className="theme-text text-base font-bold">
                                              {formatNumber(
                                                currentStock
                                              )}
                                            </span>

                                            <span className="theme-text-muted text-[10px]">
                                              /{" "}
                                              {formatNumber(
                                                totalJumlah
                                              )}
                                            </span>

                                          </div>

                                          <span
                                            className={`text-[10px] font-bold ${config.textClassName}`}
                                          >
                                            {config.label}
                                          </span>

                                        </div>

                                        <div
                                          className={`theme-neutral-surface mt-2 h-1.5 overflow-hidden rounded-full ${themeNeutralSurface}`}
                                        >
                                          <div
                                            className={`h-full rounded-full transition-all ${config.barClassName}`}
                                            style={{
                                              width: `${stockPercentage}%`,
                                            }}
                                          />
                                        </div>

                                        <div className="mt-1.5 flex items-center justify-between">

                                          <span className="theme-text-muted text-[10px]">
                                            Minimum{" "}
                                            {formatNumber(
                                              minimumStock
                                            )}
                                          </span>

                                          <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-semibold ${config.textClassName}`}
                                          >
                                            <StatusIcon
                                              size={
                                                11
                                              }
                                            />
                                            {
                                              config.label
                                            }
                                          </span>

                                        </div>

                                      </div>

                                    </td>

                                    {/* INFORMASI */}

                                    <td className="px-4 py-4">

                                      <div className="space-y-2.5">

                                        <div className="flex items-center gap-2">

                                          <CalendarDays
                                            size={
                                              14
                                            }
                                            className="theme-text-muted flex-shrink-0"
                                          />

                                          <div className="min-w-0">

                                            <p className="theme-text-muted text-[10px]">
                                              Pembelian
                                            </p>

                                            <p className="theme-text-secondary text-xs font-medium">
                                              {formatDate(
                                                item?.tanggalPembelian
                                              )}
                                            </p>

                                          </div>

                                        </div>

                                        <div className="flex items-center gap-2">

                                          <Wrench
                                            size={
                                              14
                                            }
                                            className="theme-text-muted flex-shrink-0"
                                          />

                                          <div className="min-w-0">

                                            <p className="theme-text-muted text-[10px]">
                                              Perawatan
                                            </p>

                                            <p className="theme-text-secondary text-xs font-medium">
                                              {formatDate(
                                                item?.perawatanTerakhir
                                              )}
                                            </p>

                                          </div>

                                        </div>

                                        {item?.statusPerbaikan && (
                                          <span
                                            className={`inline-flex max-w-full items-center rounded-md px-2 py-1 text-[10px] font-semibold ${
                                              String(
                                                item.statusPerbaikan
                                              ).toLowerCase() ===
                                              "selesai"
                                                ? `${themeSuccessSurface} theme-success`
                                                : `${themeWarningSurface} theme-warning`
                                            }`}
                                          >
                                            <span className="truncate">
                                              {formatText(
                                                item.statusPerbaikan
                                              )}
                                            </span>
                                          </span>
                                        )}

                                      </div>

                                    </td>

                                    {/* AKSI */}

                                    <td
                                      className={`sticky right-0 z-20 border-l ${themeDivider} theme-card px-3 py-4 group-hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]`}
                                    >

                                      <div className="flex items-center justify-center gap-1">

                                        {/* KURANG */}

                                        <button
                                          type="button"
                                          disabled={
                                            isUpdatingStock ||
                                            currentStock <=
                                              0
                                          }
                                          onClick={() =>
                                            handleStokChange(
                                              item,
                                              -1
                                            )
                                          }
                                          title="Kurangi stok"
                                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition ${themeDangerSurface} hover:theme-danger disabled:cursor-not-allowed disabled:opacity-30`}
                                        >
                                          {isUpdatingStock ? (
                                            <Loader2
                                              size={
                                                15
                                              }
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <PackageMinus
                                              size={
                                                15
                                              }
                                            />
                                          )}
                                        </button>

                                        {/* TAMBAH */}

                                        <button
                                          type="button"
                                          disabled={
                                            isUpdatingStock ||
                                            currentStock >=
                                              totalJumlah
                                          }
                                          onClick={() =>
                                            handleStokChange(
                                              item,
                                              1
                                            )
                                          }
                                          title="Tambah stok"
                                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition ${themeSuccessSurface} hover:theme-success disabled:cursor-not-allowed disabled:opacity-30`}
                                        >
                                          <PackagePlus
                                            size={
                                              15
                                            }
                                          />
                                        </button>

                                        <div
                                          className={`mx-0.5 h-5 w-px ${themeNeutralSurface}`}
                                        />

                                        {/* DETAIL */}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedAset(
                                              item
                                            )
                                          }
                                          title="Lihat detail"
                                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                                        >
                                          <Eye
                                            size={
                                              15
                                            }
                                          />
                                        </button>

                                        {/* EDIT */}

                                        <button
                                          type="button"
                                          disabled={
                                            isDeleting
                                          }
                                          onClick={() =>
                                            router.push(
                                              `/admin/sarpras/gudang/edit/${item.id}`
                                            )
                                          }
                                          title="Edit aset"
                                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition ${themeWarningSurface} hover:theme-warning disabled:cursor-not-allowed disabled:opacity-40`}
                                        >
                                          <Edit
                                            size={
                                              15
                                            }
                                          />
                                        </button>

                                        {/* DELETE */}

                                        <button
                                          type="button"
                                          disabled={
                                            isDeleting
                                          }
                                          onClick={() =>
                                            handleDelete(
                                              item.id,
                                              item?.nama ||
                                                "aset"
                                            )
                                          }
                                          title="Hapus aset"
                                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition ${themeDangerSurface} hover:theme-danger disabled:cursor-not-allowed disabled:opacity-40`}
                                        >
                                          {isDeleting ? (
                                            <Loader2
                                              size={
                                                15
                                              }
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <Trash2
                                              size={
                                                15
                                              }
                                            />
                                          )}
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

                  </div>

                  {/* TABLE FOOTER */}

                  {!loading &&
                    filtered.length >
                      0 && (
                      <div
                        className={`flex flex-col gap-2 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-3 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between`}
                      >

                        <span>
                          Menampilkan{" "}
                          <strong className="theme-text-secondary">
                            {filtered.length}
                          </strong>{" "}
                          dari{" "}
                          <strong className="theme-text-secondary">
                            {aset.length}
                          </strong>{" "}
                          aset
                        </span>

                        <div className="flex items-center gap-4">

                          <span>
                            Total unit:{" "}
                            <strong className="theme-text-secondary">
                              {formatNumber(
                                totalUnit
                              )}
                            </strong>
                          </span>

                          <span>
                            Stok tersedia:{" "}
                            <strong className="theme-text-secondary">
                              {formatNumber(
                                totalStok
                              )}
                            </strong>
                          </span>

                        </div>

                      </div>
                    )}

                </section>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="theme-text-muted pb-4 text-center text-[11px]">
                  © 2026 SmartSchool • Sarana &
                  Prasarana
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedAset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_42%,transparent)] p-4 backdrop-blur-sm">

          <div
            className={`theme-card flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl ${themeCardShadow}`}
          >

            {/* MODAL HEADER */}

            <div
              className={`flex flex-shrink-0 items-center justify-between border-b ${themeDivider} px-5 py-4`}
            >

              <div className="flex min-w-0 items-center gap-3">

                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <Package size={19} />
                </div>

                <div className="min-w-0">

                  <h3 className="theme-text truncate text-base font-bold">
                    Detail Aset
                  </h3>

                  <p className="theme-text-muted truncate text-xs">
                    Informasi lengkap aset
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAset(null)
                }
                className={`theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition ${themeNeutralHover} hover:text-[var(--color-text)]`}
              >
                <X size={18} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto p-5">

              <div className="space-y-5">

                {/* IDENTITAS */}

                <section>

                  <div className="mb-3 flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Database size={14} />
                    </div>

                    <h4 className="theme-text text-sm font-bold">
                      Identitas Aset
                    </h4>

                  </div>

                  <div className="grid gap-3 md:grid-cols-2">

                    <DetailItem
                      icon={Package}
                      label="Nama"
                      value={
                        selectedAset.nama
                      }
                    />

                    <DetailItem
                      icon={ClipboardList}
                      label="Kode"
                      value={
                        selectedAset.kode
                      }
                    />

                    <DetailItem
                      icon={Tag}
                      label="Kategori Aset"
                      value={
                        selectedAset
                          ?.kategoriAset
                          ?.nama ||
                        selectedAset.kategoriAsetId
                      }
                    />

                    <DetailItem
                      icon={Warehouse}
                      label="Gudang"
                      value={
                        selectedAset
                          ?.gudang
                          ?.nama ||
                        selectedAset.gudangId
                      }
                    />

                    <DetailItem
                      icon={MapPin}
                      label="Lokasi"
                      value={
                        selectedAset.lokasi
                      }
                    />

                    <DetailItem
                      icon={CheckCircle}
                      label="Status"
                      value={formatText(
                        selectedAset.status
                      )}
                    />

                  </div>

                </section>

                {/* STOK */}

                <section>

                  <div className="mb-3 flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${themeSuccessSurface} theme-success`}
                    >
                      <Boxes size={14} />
                    </div>

                    <h4 className="theme-text text-sm font-bold">
                      Stok & Kondisi
                    </h4>

                  </div>

                  <div className="grid gap-3 md:grid-cols-4">

                    <DetailItem
                      icon={Package}
                      label="Jumlah"
                      value={`${formatNumber(
                        selectedAset.jumlah
                      )} unit`}
                    />

                    <DetailItem
                      icon={Boxes}
                      label="Jumlah Stok"
                      value={`${formatNumber(
                        selectedAset.jumlahStok
                      )} unit`}
                    />

                    <DetailItem
                      icon={AlertTriangle}
                      label="Stok Minimum"
                      value={`${formatNumber(
                        selectedAset.stokMinimum
                      )} unit`}
                    />

                    <DetailItem
                      icon={CheckCircle}
                      label="Kondisi"
                      value={formatText(
                        selectedAset.kondisi
                      )}
                    />

                  </div>

                </section>

                {/* TANGGAL */}

                <section>

                  <div className="mb-3 flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}
                    >
                      <CalendarDays size={14} />
                    </div>

                    <h4 className="theme-text text-sm font-bold">
                      Informasi Tanggal
                    </h4>

                  </div>

                  <div className="grid gap-3 md:grid-cols-3">

                    <DetailItem
                      icon={CalendarDays}
                      label="Tanggal Pembelian"
                      value={formatDate(
                        selectedAset.tanggalPembelian
                      )}
                    />

                    <DetailItem
                      icon={Wrench}
                      label="Perawatan Terakhir"
                      value={formatDate(
                        selectedAset.perawatanTerakhir
                      )}
                    />

                    <DetailItem
                      icon={AlertTriangle}
                      label="Tanggal Rusak"
                      value={formatDate(
                        selectedAset.tanggalRusak
                      )}
                    />

                  </div>

                </section>

                {/* KERUSAKAN */}

                <section>

                  <div className="mb-3 flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${themeWarningSurface} theme-warning`}
                    >
                      <Wrench size={14} />
                    </div>

                    <h4 className="theme-text text-sm font-bold">
                      Kerusakan & Perbaikan
                    </h4>

                  </div>

                  <div className="grid gap-3 md:grid-cols-2">

                    <DetailItem
                      icon={Wrench}
                      label="Status Perbaikan"
                      value={formatText(
                        selectedAset.statusPerbaikan
                      )}
                    />

                    <DetailItem
                      icon={AlertTriangle}
                      label="Tanggal Rusak"
                      value={formatDate(
                        selectedAset.tanggalRusak
                      )}
                    />

                    <DetailItem
                      icon={FileText}
                      label="Deskripsi Kerusakan"
                      value={
                        selectedAset.deskripsiKerusakan
                      }
                      full
                    />

                  </div>

                </section>

                {/* CATATAN */}

                <section>

                  <div className="mb-3 flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                    >
                      <FileText size={14} />
                    </div>

                    <h4 className="theme-text text-sm font-bold">
                      Catatan
                    </h4>

                  </div>

                  <div
                    className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 text-sm leading-6 theme-text-secondary`}
                  >
                    {selectedAset.catatan ||
                      "Tidak ada catatan."}
                  </div>

                </section>

                {/* AUDIT */}

                <section>

                  <div className="mb-3 flex items-center gap-2">

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                    >
                      <Clock3 size={14} />
                    </div>

                    <h4 className="theme-text text-sm font-bold">
                      Audit Data
                    </h4>

                  </div>

                  <div className="grid gap-3 md:grid-cols-2">

                    <DetailItem
                      icon={User}
                      label="Dibuat Oleh"
                      value={
                        selectedAset.dibuatOleh
                      }
                    />

                    <DetailItem
                      icon={User}
                      label="Diperbarui Oleh"
                      value={
                        selectedAset.diperbaruiOleh
                      }
                    />

                    <DetailItem
                      icon={CalendarDays}
                      label="Dibuat Pada"
                      value={formatDateTime(
                        selectedAset.dibuatPada
                      )}
                    />

                    <DetailItem
                      icon={Clock3}
                      label="Diperbarui Pada"
                      value={formatDateTime(
                        selectedAset.diperbaruiPada
                      )}
                    />

                  </div>

                </section>

                {/* DATABASE */}

                <section>

                  <div
                    className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                  >

                    <div className="flex items-center gap-2">

                      <Database
                        size={15}
                        className="theme-text-muted"
                      />

                      <span className="theme-text-muted text-xs font-bold uppercase tracking-wide">
                        Database ID
                      </span>

                    </div>

                    <p className="theme-text-secondary mt-2 break-all font-mono text-xs">
                      {selectedAset.id ||
                        "-"}
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase">
                          Sekolah ID
                        </p>

                        <p className="theme-text-secondary mt-1 break-all font-mono text-xs">
                          {selectedAset.sekolahId ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase">
                          Kategori Aset ID
                        </p>

                        <p className="theme-text-secondary mt-1 break-all font-mono text-xs">
                          {selectedAset.kategoriAsetId ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase">
                          Gudang ID
                        </p>

                        <p className="theme-text-secondary mt-1 break-all font-mono text-xs">
                          {selectedAset.gudangId ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase">
                          Dihapus Oleh
                        </p>

                        <p className="theme-text-secondary mt-1 break-all font-mono text-xs">
                          {selectedAset.dihapusOleh ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase">
                          Dihapus Pada
                        </p>

                        <p className="theme-text-secondary mt-1 font-mono text-xs">
                          {formatDateTime(
                            selectedAset.dihapusPada
                          )}
                        </p>
                      </div>

                    </div>

                  </div>

                </section>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div
              className={`flex flex-shrink-0 items-center justify-end gap-2 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-3`}
            >

              <button
                type="button"
                onClick={() =>
                  setSelectedAset(null)
                }
                className={`theme-card theme-text-secondary rounded-xl border ${themeNeutralBorder} px-4 py-2 text-sm font-semibold transition ${themeNeutralHover}`}
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  const id =
                    selectedAset.id;

                  setSelectedAset(null);

                  router.push(
                    `/admin/sarpras/gudang/edit/${id}`
                  );
                }}
                className={`${themePrimaryGradient} inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-95`}
              >
                <Edit size={15} />
                Edit Aset
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}