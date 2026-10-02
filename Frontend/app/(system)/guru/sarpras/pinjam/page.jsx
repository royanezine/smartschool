"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Package,
  Sparkles,
  Search,
  Projector,
  Speaker,
  Dumbbell,
  DoorOpen,
  Laptop,
  Wrench,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  MapPin,
  Warehouse,
  RefreshCw,
} from "lucide-react";

import { getAset } from "@/services/sarpras.service";

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

/* =========================================================
   KATEGORI
========================================================= */

const getKategoriIcon = (kategori = "") => {
  const nama = kategori.toLowerCase();

  if (nama.includes("elektronik")) {
    if (nama.includes("sound") || nama.includes("speaker")) {
      return Speaker;
    }

    if (nama.includes("laptop") || nama.includes("komputer")) {
      return Laptop;
    }

    return Projector;
  }

  if (nama.includes("ruangan") || nama.includes("ruang")) {
    return DoorOpen;
  }

  if (nama.includes("olahraga") || nama.includes("sport")) {
    return Dumbbell;
  }

  return Wrench;
};

/* =========================================================
   KATEGORI THEME
========================================================= */

const getKategoriTheme = (kategori = "") => {
  const nama = kategori.toLowerCase();

  if (nama.includes("elektronik")) {
    return {
      tone: "info",
      iconSurface: themeInfoSurface,
      iconBorder: themeInfoBorder,
      iconText: "text-[var(--color-info)]",
      accent:
        "before:bg-[linear-gradient(to_bottom,var(--color-info),color-mix(in_srgb,var(--color-info)_72%,var(--color-primary)))]",
      active:
        `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`,
      inactive:
        `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder} hover:border-[color-mix(in_srgb,var(--color-info)_38%,transparent)]`,
      dot: "bg-[var(--color-info)]",
    };
  }

  if (nama.includes("ruangan") || nama.includes("ruang")) {
    return {
      tone: "primary",
      iconSurface: themePrimarySoft,
      iconBorder: themePrimarySoftBorder,
      iconText: themePrimaryText,
      accent:
        "before:bg-[linear-gradient(to_bottom,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]",
      active:
        `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`,
      inactive:
        `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder} hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`,
      dot: "bg-[var(--color-primary)]",
    };
  }

  if (nama.includes("olahraga") || nama.includes("sport")) {
    return {
      tone: "success",
      iconSurface: themeSuccessSurface,
      iconBorder: themeSuccessBorder,
      iconText: "text-[var(--color-success)]",
      accent:
        "before:bg-[linear-gradient(to_bottom,var(--color-success),color-mix(in_srgb,var(--color-success)_72%,var(--color-primary)))]",
      active:
        `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder} shadow-[0_4px_14px_color-mix(in_srgb,var(--color-success)_15%,transparent)]`,
      inactive:
        `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder} hover:bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)]`,
      dot: "bg-[var(--color-success)]",
    };
  }

  return {
    tone: "neutral",
    iconSurface: themeNeutralSurface,
    iconBorder: themeNeutralBorder,
    iconText: "theme-text-secondary",
    accent:
      "before:bg-[linear-gradient(to_bottom,var(--color-text-muted),var(--color-text-placeholder))]",
    active:
      `${themeNeutralSurface} theme-text ${themeNeutralBorder} shadow-[0_4px_14px_color-mix(in_srgb,var(--color-text)_8%,transparent)]`,
    inactive:
      `theme-card theme-text-secondary ${themeNeutralBorder} ${themeNeutralHover}`,
    dot: "bg-[var(--color-text-muted)]",
  };
};

/* =========================================================
   PAGE
========================================================= */

export default function GuruSarprasPinjamPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [daftarItem, setDaftarItem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [pencarian, setPencarian] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  /* =======================================================
     LOAD ASET
  ======================================================= */

  const loadAset = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAset();

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setDaftarItem(data);
    } catch (err) {
      console.error("Gagal mengambil data aset:", err);

      setError(
        err?.message || "Gagal mengambil data sarana prasarana."
      );

      setDaftarItem([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* LOAD PERTAMA */
  useEffect(() => {
    loadAset(false);
  }, [loadAset]);

  /* REFRESH */
  const handleRefresh = () => {
    if (loading || refreshing) return;
    loadAset(true);
  };

  const notifications = [
    {
      id: 1,
      title: "Informasi Peminjaman",
      desc: "Cek status pengajuan peminjaman Anda",
      read: false,
    },
  ];

  /* =======================================================
     KATEGORI
  ======================================================= */

  const kategori = useMemo(() => {
    const kategoriBackend = daftarItem
      .map((item) => item?.kategoriAset?.nama)
      .filter(Boolean);

    const kategoriUnik = [...new Set(kategoriBackend)];

    return ["Semua", ...kategoriUnik];
  }, [daftarItem]);

  /* =======================================================
     FILTER
  ======================================================= */

  const itemTersaring = useMemo(() => {
    return daftarItem.filter((item) => {
      const namaKategori = item?.kategoriAset?.nama || "";
      const nama = item?.nama || "";
      const kode = item?.kode || "";

      const cocokKategori =
        kategoriAktif === "Semua" ||
        namaKategori.toLowerCase() ===
          kategoriAktif.toLowerCase();

      const keyword = pencarian.trim().toLowerCase();

      const cocokPencarian =
        !keyword ||
        nama.toLowerCase().includes(keyword) ||
        kode.toLowerCase().includes(keyword) ||
        namaKategori.toLowerCase().includes(keyword);

      return cocokKategori && cocokPencarian;
    });
  }, [daftarItem, kategoriAktif, pencarian]);

  const getSisaStok = (item) =>
    Number(item?.jumlahStok ?? 0);

  const getJumlahTotal = (item) =>
    Number(item?.jumlah ?? 0);

  const toggleExpand = (id) => {
    setExpandedId((current) =>
      current === id ? null : id
    );
  };

  /* =======================================================
     NAVIGATE
  ======================================================= */

  const bukaForm = (item) => {
    if (!item?.id) return;

    router.push(
      `/guru/sarpras/pinjam/ajukan?asetId=${item.id}`
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((v) => !v)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen((v) => !v)
          }
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="theme-page relative flex-1 overflow-y-auto">

          {/* BACKGROUND DECORATION */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div
              className="absolute -right-20 -top-32 h-[320px] w-[320px] rounded-full blur-3xl"
              style={{
                background:
                  "color-mix(in srgb, var(--color-primary) 8%, transparent)",
              }}
            />

            <div
              className="absolute -left-40 top-1/3 h-[280px] w-[280px] rounded-full blur-3xl"
              style={{
                background:
                  "color-mix(in srgb, var(--color-info) 6%, transparent)",
              }}
            />
          </div>

          <div className="relative mx-auto w-full max-w-[1700px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:max-w-[1900px]">

            {/* =================================================
                HEADER + REFRESH
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">

                <div
                  className={`${themePrimaryGradient} ${themePrimaryShadow} flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[var(--color-card)]`}
                >
                  <Package size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          "var(--color-primary)",
                      }}
                    />

                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                      Sarana & Prasarana
                    </p>
                  </div>

                  <h1 className="theme-text text-2xl font-bold tracking-tight md:text-[28px]">
                    Pinjam Sarana Prasarana
                  </h1>

                  <p className="theme-text-secondary mt-1 flex max-w-2xl items-center gap-1.5 text-sm">
                    <Sparkles
                      size={14}
                      className="theme-text-muted flex-shrink-0"
                    />

                    <span className="truncate">
                      Pilih aset yang tersedia dan ajukan peminjaman.
                    </span>
                  </p>
                </div>
              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className={`theme-card theme-text-secondary inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold ${themeNeutralBorder} ${themeNeutralHover} transition-all disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <RefreshCw
                  size={15}
                  className={
                    loading || refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                {refreshing ? "Memuat..." : "Refresh"}
              </button>
            </div>

            {/* =================================================
                SEARCH + KATEGORI
            ================================================= */}

            <div
              className={`theme-card space-y-3 rounded-2xl border p-4 ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="relative">
                <Search
                  size={16}
                  className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) =>
                    setPencarian(e.target.value)
                  }
                  placeholder="Cari aset berdasarkan nama, kode, atau kategori..."
                  className={`theme-input h-11 w-full rounded-xl border pl-10 pr-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] placeholder:text-[var(--color-text-placeholder)]`}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {kategori.map((item) => {
                  const aktif =
                    kategoriAktif === item;

                  const categoryTheme =
                    item === "Semua"
                      ? {
                          active: `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`,
                          inactive: `theme-card ${themePrimaryText} ${themePrimarySoftBorder} hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]`,
                          dot: "bg-[var(--color-primary)]",
                        }
                      : getKategoriTheme(item);

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setKategoriAktif(item)
                      }
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                        aktif
                          ? categoryTheme.active
                          : categoryTheme.inactive
                      }`}
                    >
                      {item !== "Semua" && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            aktif
                              ? "bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)]"
                              : categoryTheme.dot
                          }`}
                        />
                      )}

                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${themeDangerSurface} ${themeDangerBorder}`}
              >
                <div
                  className={`theme-card theme-danger flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder}`}
                >
                  <AlertCircle size={16} />
                </div>

                <div>
                  <p className="theme-danger text-sm font-bold">
                    Gagal memuat data aset
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                LIST
            ================================================= */}

            {loading ? (
              <div
                className={`theme-card flex flex-col items-center justify-center rounded-2xl border py-16 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <Loader2
                  size={28}
                  className="animate-spin text-[var(--color-primary)]"
                />

                <p className="theme-text-secondary mt-3 text-sm">
                  Memuat data aset...
                </p>
              </div>
            ) : (
              <div
                className={`space-y-3 transition-opacity duration-200 ${
                  refreshing
                    ? "pointer-events-none opacity-60"
                    : "opacity-100"
                }`}
              >
                {itemTersaring.map((item) => {
                  const namaKategori =
                    item?.kategoriAset?.nama ||
                    "Lainnya";

                  const Icon =
                    getKategoriIcon(namaKategori);

                  const categoryTheme =
                    getKategoriTheme(namaKategori);

                  const sisa =
                    getSisaStok(item);

                  const total =
                    getJumlahTotal(item);

                  const tersedia =
                    item?.isTersedia ??
                    (sisa > 0 &&
                      item?.status === "aktif");

                  const expanded =
                    expandedId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:content-[''] ${categoryTheme.accent} transition-all duration-300`}
                    >
                      <div className="flex items-center gap-3 p-4 sm:p-5">

                        {/* ICON */}

                        <div
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${categoryTheme.iconSurface} ${categoryTheme.iconBorder} ${categoryTheme.iconText}`}
                        >
                          <Icon size={19} />
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="theme-text truncate text-sm font-bold">
                              {item?.nama || "-"}
                            </h2>

                            {item?.kode && (
                              <span
                                className={`theme-text-muted rounded border px-1.5 py-0.5 text-[10px] font-mono font-semibold ${themeNeutralBorder} ${themeNeutralSurface}`}
                              >
                                {item.kode}
                              </span>
                            )}
                          </div>

                          <p className="theme-text-secondary mt-1 text-xs">
                            {namaKategori}
                          </p>

                          {item?.lokasi && (
                            <p className="theme-text-muted mt-1 flex items-center gap-1 truncate text-[11px]">
                              <MapPin size={10} />
                              {item.lokasi}
                            </p>
                          )}
                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-shrink-0 items-center gap-2">

                          {/* STATUS */}

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                              !tersedia
                                ? `${themeDangerSurface} theme-danger ${themeDangerBorder}`
                                : `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                !tersedia
                                  ? "bg-[var(--color-text-muted)]"
                                  : "bg-[var(--color-success)]"
                              }`}
                            />

                            {!tersedia
                              ? "Tidak tersedia"
                              : `Sisa ${sisa}/${total}`}
                          </span>

                          {/* DETAIL */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleExpand(item.id)
                            }
                            className={`theme-text-secondary hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:text-[var(--color-primary)] sm:inline-flex ${themeNeutralHover}`}
                          >
                            Detail

                            {expanded ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                          </button>

                          {/* AJUKAN */}

                          <button
                            type="button"
                            onClick={() =>
                              bukaForm(item)
                            }
                            disabled={!tersedia}
                            className={`flex-shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                              !tersedia
                                ? "theme-text-muted cursor-not-allowed bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                                : `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} hover:-translate-y-0.5`
                            }`}
                          >
                            Ajukan
                          </button>
                        </div>
                      </div>

                      {/* MOBILE DETAIL */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleExpand(item.id)
                        }
                        className="theme-text-secondary flex items-center gap-1 px-4 pb-3 text-[11px] font-semibold transition-colors hover:text-[var(--color-primary)] sm:hidden"
                      >
                        Detail

                        {expanded ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                      </button>

                      {/* EXPANDED */}

                      {expanded && (
                        <div
                          className={`border-t px-4 py-4 sm:px-5 ${themeDivider} ${themeNeutralSurface}`}
                        >
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                            <DetailRow
                              label="Kode aset"
                              value={
                                item?.kode || "-"
                              }
                            />

                            <DetailRow
                              label="Kondisi"
                              value={
                                item?.kondisi || "-"
                              }
                              capitalize
                            />

                            <DetailRow
                              label="Status"
                              value={
                                item?.status || "-"
                              }
                              capitalize
                            />

                            <DetailRow
                              label="Total aset"
                              value={total}
                            />

                            <DetailRow
                              label="Stok tersedia"
                              value={sisa}
                            />

                            {item?.lokasi && (
                              <DetailRow
                                label="Lokasi"
                                value={
                                  item.lokasi
                                }
                                icon={
                                  <MapPin size={11} />
                                }
                              />
                            )}

                            {item?.gudang?.nama && (
                              <DetailRow
                                label="Gudang"
                                value={
                                  item.gudang.nama
                                }
                                icon={
                                  <Warehouse
                                    size={11}
                                  />
                                }
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* EMPTY */}

                {itemTersaring.length === 0 && (
                  <div
                    className={`theme-card rounded-2xl border border-dashed text-center py-16 ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${themeNeutralSurface} ${themeNeutralBorder}`}
                    >
                      <Package
                        size={22}
                        className="theme-text-muted"
                      />
                    </div>

                    <p className="theme-text mt-4 text-sm font-bold">
                      Tidak ada aset ditemukan
                    </p>

                    <p className="theme-text-muted mt-1 text-xs">
                      Coba ubah kata kunci atau kategori.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
  icon,
  capitalize,
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="theme-text-secondary flex flex-shrink-0 items-center gap-1.5">
        {icon}
        {label}
      </span>

      <span
        className={`theme-text truncate text-right font-semibold ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}