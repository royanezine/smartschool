"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  History,
  Search,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Undo2,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  User,
  X,
} from "lucide-react";

import { getDaftarPeminjaman } from "@/services/sarpras.service";


const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryBorderHover =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_42%,transparent)]";

const themePrimaryRing =
  "focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

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


const STATUS_DIKEMBALIKAN = "dikembalikan";
const LIMIT = 10;

const KONDISI_LABEL = {
  baik: "Baik",
  rusak_ringan: "Rusak Ringan",
  rusak_berat: "Rusak Berat",
};


const formatTanggal = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const formatTanggalWaktu = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const getStatusKembali = (item) => {
  if (item?.tanggalKembaliAktual) {
    return "Dikembalikan";
  }

  return "Dipinjam";
};

const getDaftarAset = (item) =>
  Array.isArray(item?.detailPeminjaman)
    ? item.detailPeminjaman
    : [];

const getTotalUnit = (item) =>
  getDaftarAset(item).reduce(
    (total, detail) => total + (Number(detail?.jumlah) || 0),
    0
  );

const getNamaAset = (item) => {
  const daftar = getDaftarAset(item);

  return {
    nama: daftar[0]?.aset?.nama || "-",
    sisa: Math.max(0, daftar.length - 1),
  };
};

const getKondisiRingkas = (item) => {
  const daftarKondisi = getDaftarAset(item)
    .map((detail) => detail?.kondisiSaatKembali)
    .filter(Boolean);

  if (daftarKondisi.length === 0) {
    return {
      label: "-",
      className: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
    };
  }

  const unik = [...new Set(daftarKondisi)];

  if (unik.length === 1) {
    const kondisi = unik[0];

    if (kondisi === "baik") {
      return {
        label: KONDISI_LABEL[kondisi] || kondisi,
        className: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
      };
    }

    return {
      label: KONDISI_LABEL[kondisi] || kondisi,
      className: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    };
  }

  return {
    label: `${KONDISI_LABEL[unik[0]] || unik[0]} +${
      unik.length - 1
    } kondisi`,
    className: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
  };
};

const normalisasiDaftar = (
  response,
  limit = LIMIT,
  page = 1
) => {
  const items = Array.isArray(response?.data)
    ? response.data
    : [];

  const meta = response?.meta || {};
  const total =
    Number(meta.total ?? meta.totalData ?? items.length) || 0;
  const totalPages =
    Number(meta.totalPages) ||
    Math.max(
      1,
      Math.ceil(total / (limit > 0 ? limit : LIMIT))
    );

  return {
    items,
    total,
    totalPages,
    hasNext:
      typeof meta.hasNext === "boolean"
        ? meta.hasNext
        : page < totalPages,
  };
};


export default function RiwayatPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [pencarian, setPencarian] = useState("");
  const [pencarianAktif, setPencarianAktif] = useState("");
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPencarianAktif(pencarian.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [pencarian]);


  const loadRiwayat = useCallback(
    async (isRefresh = false) => {
      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getDaftarPeminjaman({
          page,
          limit: LIMIT,
          status: STATUS_DIKEMBALIKAN,
          search: pencarianAktif,
        });

        if (requestId !== requestIdRef.current) return;

        const hasil = normalisasiDaftar(
          response,
          LIMIT,
          page
        );

        setRiwayat(hasil.items);
        setTotalData(hasil.total);
        setTotalPages(hasil.totalPages);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        console.error("Gagal mengambil riwayat pengembalian:", err);

        setError(
          err?.message ||
            "Gagal mengambil riwayat pengembalian."
        );

        setRiwayat([]);
        setTotalData(0);
        setTotalPages(1);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [page, pencarianAktif]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRiwayat(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [loadRiwayat]);


  const handleRefresh = () => {
    if (loading || refreshing) return;

    loadRiwayat(true);
  };

  const bukaDetail = (id) => {
    if (!id) return;

    router.push(`/admin/sarpras/pengembalian/${id}`);
  };


  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        role="admin"
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`
                    text-xs
                    font-medium
                    ${themePrimaryText}
                    uppercase
                    tracking-wide
                  `}
                >
                  Sarana & Prasarana
                </p>

                <h1 className="text-2xl sm:text-[28px] font-bold theme-text mt-1 tracking-tight">
                  Riwayat Pengembalian
                </h1>

                <p className="text-sm theme-text-secondary mt-1">
                  Riwayat peminjaman sarpras yang sudah
                  dikembalikan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className={`
                  theme-card
                  theme-text
                  inline-flex
                  h-11
                  flex-shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  ${themePrimaryBorder}
                  px-4
                  text-sm
                  font-semibold
                  transition-all
                  ${themePrimaryBorderHover}
                  ${themePrimarySoft}
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `}
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


            <div
              className={`
                theme-card
                rounded-2xl
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
                p-4
                flex
                flex-col
                lg:flex-row
                gap-3
                lg:items-center
              `}
            >
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    theme-text-muted
                  "
                />

                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) =>
                    setPencarian(e.target.value)
                  }
                  placeholder="Cari nomor peminjaman, keperluan, atau nama siswa..."
                  className={`
                    theme-input
                    w-full
                    pl-10
                    pr-4
                    py-2.5
                    rounded-xl
                    border
                    text-sm
                    theme-text
                    placeholder:theme-text-placeholder
                    focus:outline-none
                    ${themePrimaryRing}
                    focus:border-[var(--color-primary)]
                    transition-colors
                  `}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    whitespace-nowrap
                    rounded-full
                    border
                    ${themeSuccessBorder}
                    ${themeSuccessSurface}
                    px-3
                    py-1.5
                    text-[11px]
                    font-semibold
                    text-[var(--color-success)]
                  `}
                >
                  <CheckCircle2 size={12} />
                  Sudah Dikembalikan
                </span>

                {pencarian && (
                  <button
                    type="button"
                    onClick={() => setPencarian("")}
                    className={`
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      border
                      ${themeNeutralBorder}
                      ${themeNeutralSurface}
                      px-3
                      py-1.5
                      text-[11px]
                      font-semibold
                      theme-text-secondary
                      transition-colors
                      ${themeNeutralHover}
                    `}
                  >
                    <X size={12} />
                    Hapus pencarian
                  </button>
                )}
              </div>
            </div>


            {error && (
              <div
                className={`
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  ${themeDangerBorder}
                  ${themeDangerSurface}
                  p-4
                `}
              >
                <div
                  className={`
                    theme-card
                    theme-text
                    flex
                    h-9 w-9
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    ${themeDangerBorder}
                  `}
                >
                  <AlertCircle size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="theme-text text-sm font-bold">
                    Gagal memuat riwayat
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => loadRiwayat(false)}
                    className={`
                      mt-2
                      text-xs
                      font-semibold
                      ${themePrimaryText}
                      hover:opacity-80
                      transition-opacity
                    `}
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            )}


            <div
              className={`
                theme-card
                rounded-2xl
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
                overflow-hidden
                transition-opacity
                duration-200
                ${refreshing ? "opacity-60" : "opacity-100"}
              `}
            >
              <div
                className={`
                  flex
                  items-center
                  justify-between
                  gap-2
                  px-5
                  py-4
                  border-b
                  ${themeDivider}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`
                      p-1.5
                      rounded-lg
                      ${themePrimarySoft}
                      ${themePrimaryText}
                      flex-shrink-0
                    `}
                  >
                    <History size={16} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold theme-text truncate">
                      Riwayat Pengembalian
                    </h3>

                    <p className="text-xs theme-text-muted">
                      {loading
                        ? "Memuat data..."
                        : `${totalData} pengembalian ditemukan`}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  divide-y
                  divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                "
              >
                {loading &&
                  Array.from({ length: 5 }).map(
                    (_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="px-5 py-4"
                      >
                        <div
                          className={`
                            h-12
                            animate-pulse
                            rounded-xl
                            ${themeNeutralSurface}
                          `}
                        />
                      </div>
                    )
                  )}

                {!loading &&
                  riwayat.map((item) => {
                    const { nama, sisa } = getNamaAset(item);
                    const kondisi = getKondisiRingkas(item);
                    const totalUnit = getTotalUnit(item);

                    const status = getStatusKembali(item);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => bukaDetail(item.id)}
                        className={`
                          flex
                          w-full
                          items-center
                          gap-3.5
                          px-5
                          py-3.5
                          text-left
                          ${themeNeutralHover}
                          transition-colors
                          group
                        `}
                      >

                        <div
                          className={`
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                            ${themePrimarySoft}
                            ${themePrimaryText}
                          `}
                        >
                          <Undo2 size={16} />
                        </div>


                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`
                                text-[11px]
                                font-medium
                                px-2
                                py-0.5
                                rounded-full
                                border
                                ${themeInfoSurface}
                                text-[var(--color-info)]
                                ${themeInfoBorder}
                              `}
                            >
                              Pengembalian
                            </span>

                            <p className="text-sm font-medium theme-text truncate">
                              {nama}
                            </p>

                            {sisa > 0 && (
                              <span className="text-[11px] theme-text-muted">
                                +{sisa} aset lainnya
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs theme-text-secondary">
                            <span className="flex items-center gap-1">
                              <Package
                                size={12}
                                className="theme-text-muted"
                              />
                              {totalUnit} unit
                            </span>

                            <span className="flex items-center gap-1">
                              <User
                                size={12}
                                className="theme-text-muted"
                              />
                              {item.peminjam?.namaLengkap ||
                                "-"}
                            </span>

                            <span className="flex items-center gap-1">
                              <Calendar
                                size={12}
                                className="theme-text-muted"
                              />
                              {formatTanggalWaktu(
                                item.tanggalKembaliAktual
                              )}
                            </span>

                            <span className="hidden sm:inline theme-text-muted">
                              Rencana:{" "}
                              {formatTanggal(
                                item.tanggalKembaliRencana
                              )}
                            </span>
                          </div>
                        </div>


                        <span
                          className={`
                            hidden
                            sm:inline-flex
                            items-center
                            whitespace-nowrap
                            rounded-full
                            border
                            px-2
                            py-0.5
                            text-[10px]
                            font-semibold
                            flex-shrink-0
                            ${kondisi.className}
                          `}
                        >
                          {kondisi.label}
                        </span>


                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1
                            whitespace-nowrap
                            rounded-full
                            border
                            px-2
                            py-0.5
                            text-[11px]
                            font-medium
                            flex-shrink-0
                            ${themeSuccessSurface}
                            text-[var(--color-success)]
                            ${themeSuccessBorder}
                          `}
                        >
                          <CheckCircle2 size={11} />
                          {status}
                        </span>

                        <ChevronRightIcon
                          size={16}
                          className="
                            theme-text-muted
                            opacity-50
                            group-hover:opacity-100
                            group-hover:translate-x-0.5
                            transition-all
                            duration-300
                            flex-shrink-0
                          "
                        />
                      </button>
                    );
                  })}

                {!loading && riwayat.length === 0 && (
                  <div className="px-6 py-14">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`
                          flex
                          h-14 w-14
                          items-center
                          justify-center
                          rounded-xl
                          border
                          ${themePrimaryBorder}
                          ${themePrimarySoft}
                          ${themePrimaryText}
                        `}
                      >
                        {pencarianAktif ? (
                          <Search size={22} />
                        ) : (
                          <History size={22} />
                        )}
                      </div>

                      <p className="theme-text mt-4 text-sm font-bold">
                        {pencarianAktif
                          ? "Riwayat tidak ditemukan"
                          : "Belum ada riwayat pengembalian"}
                      </p>

                      <p className="theme-text-secondary mt-1 max-w-md text-xs">
                        {pencarianAktif
                          ? "Coba gunakan kata kunci nomor peminjaman, keperluan, atau nama siswa yang berbeda."
                          : "Peminjaman yang sudah diproses pengembaliannya akan muncul di halaman ini."}
                      </p>

                      {pencarianAktif && (
                        <button
                          type="button"
                          onClick={() => setPencarian("")}
                          className={`
                            mt-4
                            inline-flex
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            ${themePrimaryText}
                            hover:opacity-80
                            transition-opacity
                          `}
                        >
                          <X size={13} />
                          Hapus pencarian
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>


              {!loading && riwayat.length > 0 && (
                <div
                  className={`
                    flex
                    flex-col
                    gap-3
                    border-t
                    ${themeDivider}
                    px-4
                    py-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  `}
                >
                  <p className="theme-text-muted text-[11px]">
                    Menampilkan{" "}
                    <span className="theme-text-secondary font-semibold">
                      {(page - 1) * LIMIT + 1}
                    </span>{" "}
                    -{" "}
                    <span className="theme-text-secondary font-semibold">
                      {Math.min(page * LIMIT, totalData)}
                    </span>{" "}
                    dari{" "}
                    <span className="theme-text-secondary font-semibold">
                      {totalData}
                    </span>{" "}
                    data
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={page <= 1 || loading}
                      onClick={() =>
                        setPage((value) =>
                          Math.max(1, value - 1)
                        )
                      }
                      className={`
                        theme-card
                        theme-text-muted
                        flex
                        h-8 w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        ${themePrimaryBorder}
                        transition-all
                        ${themePrimaryBorderHover}
                        ${themePrimarySoft}
                        hover:text-[var(--color-primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      `}
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <span className="theme-text-secondary px-3 text-xs font-semibold">
                      {page} / {Math.max(1, totalPages)}
                    </span>

                    <button
                      type="button"
                      disabled={
                        page >= totalPages || loading
                      }
                      onClick={() =>
                        setPage((value) =>
                          Math.min(
                            Math.max(1, totalPages),
                            value + 1
                          )
                        )
                      }
                      className={`
                        theme-card
                        theme-text-muted
                        flex
                        h-8 w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        ${themePrimaryBorder}
                        transition-all
                        ${themePrimaryBorderHover}
                        ${themePrimarySoft}
                        hover:text-[var(--color-primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      `}
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
