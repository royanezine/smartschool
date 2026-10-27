"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  Undo2,
  Search,
  ChevronRight,
  ChevronLeft,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  RefreshCw,
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


const STATUS_DIPINJAM = "dipinjam";
const LIMIT = 10;

const RINGKASAN_LIMIT = 100;
const RINGKASAN_MAX_HALAMAN = 10;
const RINGKASAN_MAX_DATA =
  RINGKASAN_LIMIT * RINGKASAN_MAX_HALAMAN;


const statusStyle = {
  Dipinjam: `
    text-[var(--color-info)]
    ${themeInfoSurface}
    ${themeInfoBorder}
  `,

  Terlambat: `
    text-[var(--color-warning)]
    ${themeWarningSurface}
    ${themeWarningBorder}
  `,
};

const statusIcon = {
  Dipinjam: {
    icon: Clock,
    tone: `
      text-[var(--color-info)]
      ${themeInfoSurface}
    `,
  },

  Terlambat: {
    icon: AlertTriangle,
    tone: `
      text-[var(--color-warning)]
      ${themeWarningSurface}
    `,
  },
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

const awalHariIni = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const hitungHariTerlambat = (tanggalRencana) => {
  if (!tanggalRencana) return 0;

  const rencana = new Date(tanggalRencana);

  if (Number.isNaN(rencana.getTime())) return 0;

  const target = new Date(
    rencana.getFullYear(),
    rencana.getMonth(),
    rencana.getDate()
  );

  const selisih = awalHariIni().getTime() - target.getTime();

  return selisih > 0 ? Math.floor(selisih / 86400000) : 0;
};

const isTerlambat = (item) =>
  item?.status === STATUS_DIPINJAM &&
  hitungHariTerlambat(item?.tanggalKembaliRencana) > 0;

const getDaftarAset = (item) =>
  Array.isArray(item?.detailPeminjaman)
    ? item.detailPeminjaman
    : [];

const getTotalUnit = (item) =>
  getDaftarAset(item).reduce(
    (total, detail) => total + (Number(detail?.jumlah) || 0),
    0
  );

const getNamaAsetUtama = (item) => {
  const daftar = getDaftarAset(item);
  const utama = daftar[0]?.aset?.nama || "-";
  const sisa = daftar.length - 1;

  return {
    nama: utama,
    sisa: sisa > 0 ? sisa : 0,
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

const hitungRingkasanAktif = async () => {
  const semua = [];
  let halaman = 1;
  let totalAktif = 0;
  let totalHalaman = 1;
  let adaHalamanBerikutnya = true;

  while (
    adaHalamanBerikutnya &&
    halaman <= RINGKASAN_MAX_HALAMAN
  ) {
    const response = await getDaftarPeminjaman({
      page: halaman,
      limit: RINGKASAN_LIMIT,
      status: STATUS_DIPINJAM,
      search: "",
    });

    const hasil = normalisasiDaftar(
      response,
      RINGKASAN_LIMIT,
      halaman
    );

    if (halaman === 1) {
      totalAktif = hasil.total;
      totalHalaman = hasil.totalPages;
    }

    semua.push(...hasil.items);

    adaHalamanBerikutnya =
      hasil.hasNext &&
      hasil.items.length > 0 &&
      halaman < totalHalaman;

    halaman += 1;
  }

  const terbatas =
    totalAktif > semua.length ||
    totalHalaman > RINGKASAN_MAX_HALAMAN;

  return {
    terlambat: semua.filter(isTerlambat).length,
    jatuhTempoHariIni: semua.filter(
      (item) =>
        hitungHariTerlambat(
          item?.tanggalKembaliRencana
        ) === 0 &&
        new Date(
          item?.tanggalKembaliRencana
        ).toDateString() ===
          new Date().toDateString()
    ).length,
    totalDipindai: semua.length,
    totalAktif,
    terbatas,
    batasData: RINGKASAN_MAX_DATA,
  };
};


function PengembalianContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const berhasil = searchParams.get("berhasil") === "1";

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [daftarPeminjaman, setDaftarPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [pencarian, setPencarian] = useState("");
  const [pencarianAktif, setPencarianAktif] = useState("");
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [ringkasan, setRingkasan] = useState({
    siap: false,
    gagal: false,
    terlambat: 0,
    jatuhTempoHariIni: 0,
    totalDipindai: 0,
    totalAktif: 0,
    terbatas: false,
    batasData: RINGKASAN_MAX_DATA,
  });

  const requestIdRef = useRef(0);
  const ringkasanRequestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPencarianAktif(pencarian.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [pencarian]);


  const loadPeminjaman = useCallback(
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
          status: STATUS_DIPINJAM,
          search: pencarianAktif,
        });

        if (requestId !== requestIdRef.current) return;

        const hasil = normalisasiDaftar(
          response,
          LIMIT,
          page
        );

        setDaftarPeminjaman(hasil.items);
        setTotalData(hasil.total);
        setTotalPages(hasil.totalPages);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        console.error("Gagal mengambil peminjaman aktif:", err);

        setError(
          err?.message ||
            "Gagal mengambil data peminjaman aktif."
        );

        setDaftarPeminjaman([]);
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
      loadPeminjaman(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [loadPeminjaman]);


  const muatRingkasan = useCallback(async () => {
    const requestId = ringkasanRequestIdRef.current + 1;

    ringkasanRequestIdRef.current = requestId;

    setRingkasan((prev) => ({
      ...prev,
      siap: false,
      gagal: false,
    }));

    try {
      const hasil = await hitungRingkasanAktif();

      if (requestId !== ringkasanRequestIdRef.current) return;

      setRingkasan({
        siap: true,
        gagal: false,
        ...hasil,
      });
    } catch (err) {
      if (requestId !== ringkasanRequestIdRef.current) return;

      console.error(
        "Gagal mengambil ringkasan pengembalian:",
        err
      );

      setRingkasan((prev) => ({
        ...prev,
        siap: true,
        gagal: true,
      }));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      muatRingkasan();
    }, 0);

    return () => clearTimeout(timer);
  }, [muatRingkasan]);


  const handleRefresh = () => {
    if (loading || refreshing) return;

    loadPeminjaman(true);
    muatRingkasan();
  };

  const handleOpenDetail = (id) => {
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
                  Pengembalian
                </h1>

                <p className="text-sm theme-text-secondary mt-1">
                  Pantau peminjaman aktif dan proses
                  pengembalian aset sekolah.
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


            {berhasil && (
              <div
                className={`
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  ${themeSuccessBorder}
                  ${themeSuccessSurface}
                  p-4
                `}
              >
                <div
                  className={`
                    flex
                    h-9 w-9
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-[var(--color-success)]
                  `}
                >
                  <CheckCircle2 size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--color-success)]">
                    Pengembalian berhasil diproses
                  </p>

                  <p className="text-xs theme-text-secondary mt-1">
                    Daftar peminjaman aktif telah dimuat
                    ulang dari API. Riwayat pengembalian
                    juga akan dimuat ulang saat halaman
                    riwayat dibuka.
                  </p>
                </div>
              </div>
            )}


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className={`
                  theme-card
                  rounded-2xl
                  border
                  ${themeNeutralBorder}
                  ${themeCardShadow}
                  p-4
                  flex
                  items-center
                  gap-3.5
                `}
              >
                <div
                  className={`
                    w-11
                    h-11
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    text-[var(--color-primary)]
                    ${themePrimarySoft}
                  `}
                >
                  <Package size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold theme-text leading-none">
                    {loading
                      ? "..."
                      : ringkasan.siap && !ringkasan.gagal
                        ? ringkasan.totalAktif
                        : totalData}
                  </p>

                  <p className="text-xs theme-text-muted mt-1 truncate">
                    Peminjaman Aktif
                  </p>
                </div>
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
                  items-center
                  gap-3.5
                `}
              >
                <div
                  className={`
                    w-11
                    h-11
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    text-[var(--color-warning)]
                    ${themeWarningSurface}
                  `}
                >
                  <AlertTriangle size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold theme-text leading-none">
                    {!ringkasan.siap
                      ? "..."
                      : ringkasan.gagal
                        ? "-"
                        : ringkasan.terbatas
                          ? `≥ ${ringkasan.terlambat}`
                          : ringkasan.terlambat}
                  </p>

                  <p className="text-xs theme-text-muted mt-1 truncate">
                    Terlambat
                  </p>
                </div>
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
                  items-center
                  gap-3.5
                `}
              >
                <div
                  className={`
                    w-11
                    h-11
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    text-[var(--color-info)]
                    ${themeInfoSurface}
                  `}
                >
                  <Clock size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold theme-text leading-none">
                    {!ringkasan.siap
                      ? "..."
                      : ringkasan.gagal
                        ? "-"
                        : ringkasan.terbatas
                          ? `≥ ${ringkasan.jatuhTempoHariIni}`
                          : ringkasan.jatuhTempoHariIni}
                  </p>

                  <p className="text-xs theme-text-muted mt-1 truncate">
                    Jatuh Tempo Hari Ini
                  </p>
                </div>
              </div>
            </div>


            {ringkasan.siap && ringkasan.gagal && (
              <p className="px-1 text-xs theme-text-muted">
                Ringkasan gagal dimuat. Angka terlambat dan
                jatuh tempo ditampilkan sebagai &quot;-&quot;.
                Coba tekan Refresh.
              </p>
            )}

            {ringkasan.siap &&
              !ringkasan.gagal &&
              ringkasan.terbatas && (
                <p className="px-1 text-xs leading-relaxed theme-text-muted">
                  Ringkasan dihitung dari{" "}
                  {ringkasan.totalDipindai.toLocaleString(
                    "id-ID"
                  )}{" "}
                  dari{" "}
                  {ringkasan.totalAktif.toLocaleString(
                    "id-ID"
                  )}{" "}
                  peminjaman aktif (batas{" "}
                  {ringkasan.batasData.toLocaleString(
                    "id-ID"
                  )}{" "}
                  data). Angka terlambat dan jatuh tempo
                  ditampilkan sebagai batas bawah (≥), bukan
                  total seluruh data.
                </p>
              )}


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
                    ${themeInfoBorder}
                    ${themeInfoSurface}
                    px-3
                    py-1.5
                    text-[11px]
                    font-semibold
                    text-[var(--color-info)]
                  `}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-info)]" />
                  Status: Dipinjam
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
                    Gagal memuat data
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => loadPeminjaman(false)}
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
                    <Undo2 size={16} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold theme-text truncate">
                      Daftar Peminjaman Aktif
                    </h3>

                    <p className="text-xs theme-text-muted">
                      {loading
                        ? "Memuat data..."
                        : `${totalData} peminjaman ditemukan`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`
                        text-left
                        text-xs
                        theme-text-muted
                        border-b
                        ${themeDivider}
                      `}
                    >
                      <th className="px-5 py-3 font-medium">
                        Aset
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Peminjam
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Jumlah
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Jatuh Tempo
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-3 font-medium w-8" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                    {loading &&
                      Array.from({ length: 5 }).map(
                        (_, index) => (
                          <tr key={`skeleton-${index}`}>
                            <td
                              colSpan={6}
                              className="px-5 py-4"
                            >
                              <div
                                className={`
                                  h-10
                                  animate-pulse
                                  rounded-lg
                                  ${themeNeutralSurface}
                                `}
                              />
                            </td>
                          </tr>
                        )
                      )}

                    {!loading &&
                      daftarPeminjaman.map((item) => {
                        const terlambat = isTerlambat(item);
                        const status = terlambat
                          ? "Terlambat"
                          : "Dipinjam";

                        const s = statusIcon[status];
                        const StatusIcon = s.icon;

                        const { nama, sisa } =
                          getNamaAsetUtama(item);

                        const totalUnit = getTotalUnit(item);
                        const hariTerlambat =
                          hitungHariTerlambat(
                            item.tanggalKembaliRencana
                          );

                        return (
                          <tr
                            key={item.id}
                            onClick={() =>
                              handleOpenDetail(item.id)
                            }
                            className={`
                              cursor-pointer
                              ${themeNeutralHover}
                              transition-colors
                              group
                            `}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`
                                    w-9
                                    h-9
                                    rounded-lg
                                    flex
                                    items-center
                                    justify-center
                                    flex-shrink-0
                                    ${s.tone}
                                  `}
                                >
                                  <StatusIcon size={16} />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium theme-text">
                                    {nama}
                                  </p>

                                  <p className="text-[11px] theme-text-muted mt-0.5">
                                    {sisa > 0
                                      ? `+${sisa} aset lainnya`
                                      : item.nomorPeminjaman ||
                                        "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <p className="theme-text-secondary">
                                {item.peminjam?.namaLengkap ||
                                  "-"}
                              </p>

                              <p className="text-[11px] theme-text-muted mt-0.5 max-w-[220px] truncate">
                                {item.keperluan || "-"}
                              </p>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 theme-text-secondary">
                                <Package
                                  size={14}
                                  className="theme-text-muted"
                                />
                                {totalUnit} unit
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 theme-text-secondary">
                                <Calendar
                                  size={13}
                                  className="theme-text-muted"
                                />

                                {formatTanggal(
                                  item.tanggalKembaliRencana
                                )}
                              </div>

                              {hariTerlambat > 0 && (
                                <p className="text-[11px] text-[var(--color-warning)] mt-0.5">
                                  {hariTerlambat} hari terlambat
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`
                                  text-[11px]
                                  font-medium
                                  px-2
                                  py-0.5
                                  rounded-full
                                  border
                                  ${statusStyle[status]}
                                `}
                              >
                                {status}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <ChevronRight
                                size={16}
                                className="
                                  theme-text-muted
                                  opacity-50
                                  group-hover:opacity-100
                                  group-hover:translate-x-0.5
                                  transition-all
                                  duration-300
                                "
                              />
                            </td>
                          </tr>
                        );
                      })}

                    {!loading &&
                      daftarPeminjaman.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-14"
                          >
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
                                  <CheckCircle2 size={22} />
                                )}
                              </div>

                              <p className="theme-text mt-4 text-sm font-bold">
                                {pencarianAktif
                                  ? "Peminjaman tidak ditemukan"
                                  : "Tidak ada peminjaman aktif"}
                              </p>

                              <p className="theme-text-secondary mt-1 max-w-md text-xs">
                                {pencarianAktif
                                  ? "Coba gunakan kata kunci nomor peminjaman, keperluan, atau nama siswa yang berbeda."
                                  : "Semua aset sudah dikembalikan. Peminjaman yang sedang berjalan akan muncul di halaman ini."}
                              </p>

                              {pencarianAktif && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPencarian("")
                                  }
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
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>


              {!loading && daftarPeminjaman.length > 0 && (
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


export default function PengembalianPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2
              size={24}
              className={`animate-spin ${themePrimaryText}`}
            />

            <p className="text-sm theme-text-muted">
              Memuat...
            </p>
          </div>
        </div>
      }
    >
      <PengembalianContent />
    </Suspense>
  );
}
