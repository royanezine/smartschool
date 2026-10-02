"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

import {
  Landmark,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  School,
  Clock3,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  ArrowDownAZ,
  Users,
  Plus,
} from "lucide-react";

import {
  getYayasanSummary,
  getSekolahBinaan,
} from "@/services/yayasan.service";

// =========================================================
// CONSTANT
// =========================================================

const ITEMS_PER_PAGE = 5;

// =========================================================
// THEME HELPERS
// =========================================================

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeInfoSoft =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

// =========================================================
// STATUS STYLE
// =========================================================

const statusColorMap = {
  Aktif: {
    bg: themeSuccessSoft,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    dot: "bg-[var(--color-success)]",
  },

  Trial: {
    bg: themeWarningSoft,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    dot: "bg-[var(--color-warning)]",
  },

  Nonaktif: {
    bg: themeDangerSoft,
    text: "text-[var(--color-warning)]",
    border: themeDangerBorder,
    dot: "bg-[var(--color-warning)]",
  },
};

// =========================================================
// SORT OPTIONS
// =========================================================

const sortOptions = [
  {
    value: "nama-asc",
    label: "Nama Sekolah — A → Z",
    field: "nama",
    order: "asc",
  },
  {
    value: "nama-desc",
    label: "Nama Sekolah — Z → A",
    field: "nama",
    order: "desc",
  },
  {
    value: "kode-asc",
    label: "Kode Sekolah — A → Z",
    field: "kode",
    order: "asc",
  },
  {
    value: "kode-desc",
    label: "Kode Sekolah — Z → A",
    field: "kode",
    order: "desc",
  },
  {
    value: "status-asc",
    label: "Status — A → Z",
    field: "status",
    order: "asc",
  },
  {
    value: "status-desc",
    label: "Status — Z → A",
    field: "status",
    order: "desc",
  },
];

// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(status) {
  const value = String(status ?? "")
    .trim()
    .toLowerCase();

  if (
    value === "aktif" ||
    value === "active" ||
    value === "berlangganan aktif"
  ) {
    return "Aktif";
  }

  if (
    value === "trial" ||
    value === "uji coba" ||
    value === "masa trial"
  ) {
    return "Trial";
  }

  if (
    value === "nonaktif" ||
    value === "inactive" ||
    value === "non-active"
  ) {
    return "Nonaktif";
  }

  return status ? String(status) : "Nonaktif";
}

// =========================================================
// NORMALIZE SEKOLAH
// =========================================================

function normalizeSekolah(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const subscription =
    Array.isArray(item.langgananSekolah) &&
    item.langgananSekolah.length > 0
      ? item.langgananSekolah[0]
      : null;

  return {
    ...item,

    id: item.id ?? null,

    nama: item.nama ?? "-",

    kode: item.subdomain ?? "-",

    subdomain: item.subdomain ?? "-",

    status: normalizeStatus(item.status),

    telepon: item.telepon ?? "",

    email: item.email ?? "",

    logo: item.logo ?? null,

    paket: subscription?.paket?.nama ?? "-",

    statusLangganan:
      subscription?.statusLangganan ?? null,

    tanggalBerakhir:
      subscription?.tanggalBerakhir ?? null,
  };
}

// =========================================================
// EXTRACT DATA
// =========================================================

function extractData(response) {
  if (!response) {
    return null;
  }

  if (response.data !== undefined) {
    return response.data;
  }

  return response;
}

// =========================================================
// EXTRACT LIST
// =========================================================

function extractSekolahList(response) {
  const data = extractData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  return [];
}

// =========================================================
// EXTRACT SUMMARY
// =========================================================

function extractSummary(response) {
  const data = extractData(response);

  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data)
  ) {
    return data;
  }

  return {};
}

// =========================================================
// ERROR MESSAGE
// =========================================================

function extractErrorMessage(error) {
  if (!error) {
    return "Terjadi kesalahan pada server.";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Terjadi kesalahan pada server."
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function DataYayasanPage() {
  const router = useRouter();

  // =====================================================
  // DATA
  // =====================================================

  const [sekolahList, setSekolahList] =
    useState([]);

  const [summary, setSummary] =
    useState({
      totalSekolah: 0,
      sekolahAktif: 0,
      sekolahUjiCoba: 0,
      totalPenggunaAktif: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // FILTER
  // =====================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("Semua");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [isMobile, setIsMobile] =
    useState(false);

  // =====================================================
  // SORT
  // =====================================================

  const [sortField, setSortField] =
    useState("nama");

  const [sortOrder, setSortOrder] =
    useState("asc");

  const [sortValue, setSortValue] =
    useState("nama-asc");

  // =====================================================
  // RESPONSIVE
  // =====================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  // =====================================================
  // FETCH BACKEND
  // =====================================================

  const fetchYayasan = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          sekolahResponse,
        ] = await Promise.all([
          getYayasanSummary(),
          getSekolahBinaan(),
        ]);

        const summaryData =
          extractSummary(
            summaryResponse
          );

        const sekolahData =
          extractSekolahList(
            sekolahResponse
          )
            .map(normalizeSekolah)
            .filter(Boolean);

        setSummary({
          totalSekolah:
            Number(
              summaryData.totalSekolah
            ) || 0,

          sekolahAktif:
            Number(
              summaryData.sekolahAktif
            ) || 0,

          sekolahUjiCoba:
            Number(
              summaryData.sekolahUjiCoba
            ) || 0,

          totalPenggunaAktif:
            Number(
              summaryData.totalPenggunaAktif
            ) || 0,
        });

        setSekolahList(
          sekolahData
        );

        setCurrentPage(1);
      } catch (err) {
        console.error(
          "Error fetch data sekolah binaan:",
          err
        );

        setError(
          extractErrorMessage(err)
        );

        setSekolahList([]);

        setSummary({
          totalSekolah: 0,
          sekolahAktif: 0,
          sekolahUjiCoba: 0,
          totalPenggunaAktif: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchYayasan();
  }, [fetchYayasan]);

  // =====================================================
  // RESET PAGE
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedStatus,
    sortValue,
  ]);

  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  const statusOptions = useMemo(
    () => [
      "Semua",
      "Aktif",
      "Nonaktif",
      "Trial",
    ],
    []
  );

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    const total =
      Number(
        summary.totalSekolah
      ) || 0;

    const aktif =
      Number(
        summary.sekolahAktif
      ) || 0;

    const trial =
      Number(
        summary.sekolahUjiCoba
      ) || 0;

    const nonaktif =
      Math.max(
        total - aktif - trial,
        0
      );

    return {
      total,
      aktif,
      trial,
      nonaktif,

      totalPengguna:
        Number(
          summary.totalPenggunaAktif
        ) || 0,

      ditampilkan:
        sekolahList.length,
    };
  }, [
    summary,
    sekolahList.length,
  ]);

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const sortedData = useMemo(() => {
    const search =
      searchQuery
        .toLowerCase()
        .trim();

    const filtered =
      sekolahList.filter(
        (item) => {
          const matchSearch =
            !search ||
            String(
              item.nama ?? ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              item.kode ?? ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              item.subdomain ?? ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              item.email ?? ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              item.paket ?? ""
            )
              .toLowerCase()
              .includes(search);

          const matchStatus =
            selectedStatus ===
              "Semua" ||
            item.status ===
              selectedStatus;

          return (
            matchSearch &&
            matchStatus
          );
        }
      );

    return [...filtered].sort(
      (a, b) => {
        let valA =
          a[sortField];

        let valB =
          b[sortField];

        valA = String(
          valA ?? ""
        )
          .toLowerCase()
          .trim();

        valB = String(
          valB ?? ""
        )
          .toLowerCase()
          .trim();

        const result =
          valA.localeCompare(
            valB,
            "id",
            {
              numeric: true,
              sensitivity:
                "base",
            }
          );

        return sortOrder ===
          "asc"
          ? result
          : -result;
      }
    );
  }, [
    sekolahList,
    searchQuery,
    selectedStatus,
    sortField,
    sortOrder,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    sortedData.length /
      ITEMS_PER_PAGE
  );

  const safeCurrentPage =
    totalPages > 0
      ? Math.min(
          currentPage,
          totalPages
        )
      : 1;

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedData =
    sortedData.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );

  // =====================================================
  // SORT HANDLER
  // =====================================================

  const handleSort = (field) => {
    if (
      sortField === field
    ) {
      const newOrder =
        sortOrder === "asc"
          ? "desc"
          : "asc";

      setSortOrder(
        newOrder
      );

      setSortValue(
        `${field}-${newOrder}`
      );
    } else {
      setSortField(field);
      setSortOrder("asc");

      setSortValue(
        `${field}-asc`
      );
    }
  };

  // =====================================================
  // SORT SELECT
  // =====================================================

  const handleSortChange = (
    value
  ) => {
    const selected =
      sortOptions.find(
        (option) =>
          option.value ===
          value
      );

    if (!selected) return;

    setSortValue(value);

    setSortField(
      selected.field
    );

    setSortOrder(
      selected.order
    );
  };

  // =====================================================
  // SORT ICON
  // =====================================================

  const renderSortIcon = (
    field
  ) => {
    if (
      sortField !== field
    ) {
      return (
        <ArrowUp
          size={12}
          className="ml-1.5 theme-text-placeholder"
        />
      );
    }

    return sortOrder ===
      "asc" ? (
      <ArrowUp
        size={12}
        className="ml-1.5 text-[var(--color-primary)]"
      />
    ) : (
      <ArrowDown
        size={12}
        className="ml-1.5 text-[var(--color-primary)]"
      />
    );
  };

  // =====================================================
  // VIEW DETAIL
  // =====================================================

  const handleViewDetail = (
    id
  ) => {
    if (!id) return;

    router.push(
      `/super-admin/yayasan/${id}`
    );
  };

  // =====================================================
  // TAMBAH YAYASAN
  // =====================================================

  const handleTambahYayasan = () => {
    router.push(
      "/super-admin/yayasan/tambah"
    );
  };

  // =====================================================
  // RESET FILTER
  // =====================================================

  const resetFilters = () => {
    setSearchQuery("");

    setSelectedStatus(
      "Semua"
    );

    setSortField("nama");
    setSortOrder("asc");
    setSortValue(
      "nama-asc"
    );

    setCurrentPage(1);
  };

  // =====================================================
  // ACTIVE FILTER COUNT
  // =====================================================

  const activeFilterCount =
    selectedStatus !==
    "Semua"
      ? 1
      : 0;

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const handleExport = () => {
    if (
      sortedData.length === 0
    ) {
      window.alert(
        "Tidak ada data sekolah untuk diekspor."
      );

      return;
    }

    const headers = [
      "No",
      "Nama Sekolah",
      "Subdomain",
      "Email",
      "Telepon",
      "Paket",
      "Status Langganan",
      "Tanggal Berakhir",
      "Status Sekolah",
    ];

    const rows =
      sortedData.map(
        (item, index) => [
          index + 1,
          item.nama,
          item.subdomain,
          item.email,
          item.telepon,
          item.paket,
          item.statusLangganan,
          item.tanggalBerakhir
            ? formatDate(
                item.tanggalBerakhir
              )
            : "-",
          item.status,
        ]
      );

    const escapeCSV = (
      value
    ) => {
      const text =
        String(
          value ?? ""
        );

      return `"${text.replace(
        /"/g,
        '""'
      )}"`;
    };

    const csv = [
      headers
        .map(escapeCSV)
        .join(","),

      ...rows.map(
        (row) =>
          row
            .map(
              escapeCSV
            )
            .join(",")
      ),
    ].join("\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
            csv,
        ],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "data-sekolah-binaan.csv";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <main className="w-full">
        <div className="mx-auto w-full max-w-[1800px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section
            className={`relative overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div
              className={`pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full ${themePrimarySoft} opacity-70 blur-3xl`}
            />

            <div
              className={`pointer-events-none absolute bottom-0 right-24 h-40 w-40 rounded-full ${themeInfoSoft} opacity-60 blur-3xl`}
            />

            <div className="relative p-5 sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                {/* TITLE */}

                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--color-card)] sm:h-12 sm:w-12 ${themePrimaryGradient} ${themeSmallShadow}`}
                    >
                      <Landmark
                        size={22}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight theme-text sm:text-2xl">
                          Sekolah Binaan
                        </h1>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                          Yayasan
                        </span>
                      </div>

                      <p className="mt-1 text-xs theme-text-secondary sm:text-sm">
                        Kelola dan pantau seluruh sekolah yang berada di bawah naungan yayasan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTION */}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={
                      handleTambahYayasan
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themeSmallShadow} transition-all hover:opacity-90`}
                  >
                    <Plus
                      size={16}
                      strokeWidth={2}
                    />

                    <span>
                      Tambah Yayasan
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleExport
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary ${themeSmallShadow} transition-all ${themeNeutralHover}`}
                  >
                    <FileSpreadsheet
                      size={16}
                      strokeWidth={1.8}
                    />

                    <span className="hidden sm:inline">
                      Export
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <section
              className={`rounded-2xl border px-4 py-3 ${themeDangerSoft} ${themeDangerBorder}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeDangerSoft} text-[var(--color-warning)]`}
                  >
                    <XCircle size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text">
                      Gagal memuat data sekolah
                    </p>

                    <p className="mt-0.5 text-xs theme-text-secondary">
                      {error}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    fetchYayasan
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border ${themeDangerBorder} theme-card px-3 py-2 text-xs font-semibold text-[var(--color-warning)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)]`}
                >
                  <RotateCcw size={14} />
                  Coba Lagi
                </button>
              </div>
            </section>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Total Sekolah"
              value={
                loading
                  ? "..."
                  : stats.total
              }
              icon={School}
              color="primary"
            />

            <StatCard
              label="Sekolah Aktif"
              value={
                loading
                  ? "..."
                  : stats.aktif
              }
              icon={CheckCircle2}
              color="success"
            />

            <StatCard
              label="Masa Trial"
              value={
                loading
                  ? "..."
                  : stats.trial
              }
              icon={Clock3}
              color="warning"
            />

            <StatCard
              label="Nonaktif"
              value={
                loading
                  ? "..."
                  : stats.nonaktif
              }
              icon={XCircle}
              color="danger"
            />

            <StatCard
              label="Pengguna Aktif"
              value={
                loading
                  ? "..."
                  : stats.totalPengguna
              }
              icon={Users}
              color="info"
            />
          </section>

          {/* =================================================
              FILTER
          ================================================= */}

          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div
              className={`border-b ${themeDivider} px-4 py-4 sm:px-5`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                  >
                    <SlidersHorizontal size={16} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold theme-text">
                      Filter & Urutkan Data
                    </h2>

                    <p className="text-[11px] theme-text-muted">
                      Gunakan pencarian, filter, dan urutan sekolah binaan
                    </p>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                  >
                    {activeFilterCount} filter aktif
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.8fr)_1fr_auto]">

                {/* SEARCH */}

                <div className="relative">
                  <Search
                    size={17}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                  />

                  <input
                    type="text"
                    placeholder="Cari nama sekolah, kode, subdomain, email, atau paket..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>

                {/* STATUS */}

                <FilterSelect
                  value={
                    selectedStatus
                  }
                  onChange={
                    setSelectedStatus
                  }
                  options={
                    statusOptions
                  }
                  icon={
                    CheckCircle2
                  }
                  label="Status"
                />

                {/* SORT */}

                <SortSelect
                  value={sortValue}
                  onChange={
                    handleSortChange
                  }
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text-secondary">
                    {
                      paginatedData.length
                    }
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text-secondary">
                    {
                      sortedData.length
                    }
                  </span>{" "}
                  sekolah
                </p>

                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <span>
                    Diurutkan:
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                  >
                    {sortOrder ===
                    "asc" ? (
                      <ArrowUp
                        size={12}
                      />
                    ) : (
                      <ArrowDown
                        size={12}
                      />
                    )}

                    {
                      sortOptions.find(
                        (
                          option
                        ) =>
                          option.value ===
                          sortValue
                      )?.label
                    }
                  </span>

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border theme-border theme-card px-3 theme-text-secondary transition-colors ${themeNeutralHover}`}
                  >
                    <RotateCcw
                      size={13}
                    />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              DATA TABLE
          ================================================= */}

          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            {/* HEADER */}

            <div
              className={`flex flex-col gap-3 border-b ${themeDivider} px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <School
                    size={17}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h2 className="text-sm font-semibold theme-text">
                    Daftar Sekolah Binaan
                  </h2>

                  <p className="text-[11px] theme-text-muted">
                    Data sekolah yang berada di bawah yayasan
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-xs theme-text-muted">
                <Users size={14} />

                <span>
                  {sortedData.length} data
                </span>
              </div>
            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            {isMobile ? (
              <div className={`divide-y ${themeDivider}`}>
                {loading ? (
                  <LoadingMobile />
                ) : paginatedData.length ===
                  0 ? (
                  <EmptyState />
                ) : (
                  paginatedData.map(
                    (
                      item,
                      index
                    ) => {
                      const rowNumber =
                        startIndex +
                        index +
                        1;

                      return (
                        <div
                          key={
                            item.id ||
                            `${item.nama}-${index}`
                          }
                          className={`p-4 transition-colors ${themeNeutralHover}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 pt-2 text-center text-xs font-medium theme-text-muted">
                              {rowNumber}
                            </div>

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                            >
                              <School
                                size={20}
                                strokeWidth={1.7}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold theme-text">
                                    {
                                      item.nama
                                    }
                                  </p>

                                  <p className="mt-0.5 truncate font-mono text-[11px] theme-text-muted">
                                    {
                                      item.subdomain
                                    }
                                  </p>
                                </div>

                                <StatusBadge
                                  status={
                                    item.status
                                  }
                                />
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                                >
                                  <School
                                    size={12}
                                  />

                                  {item.paket !==
                                  "-" ? (
                                    item.paket
                                  ) : (
                                    "Belum ada paket"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-9 mt-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetail(
                                  item.id
                                )
                              }
                              className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} text-xs font-medium text-[var(--color-primary)] transition-colors ${themePrimaryHover}`}
                            >
                              <Eye
                                size={14}
                              />
                              Detail
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            ) : (
              /* =================================================
                  DESKTOP
              ================================================= */

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr
                      className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                    >
                      <TableHeader>
                        No
                      </TableHeader>

                      <TableHeader
                        sortable
                        onClick={() =>
                          handleSort(
                            "nama"
                          )
                        }
                      >
                        <span className="inline-flex items-center">
                          Sekolah
                          {
                            renderSortIcon(
                              "nama"
                            )
                          }
                        </span>
                      </TableHeader>

                      <TableHeader
                        sortable
                        onClick={() =>
                          handleSort(
                            "kode"
                          )
                        }
                      >
                        <span className="inline-flex items-center">
                          Kode Sekolah
                          {
                            renderSortIcon(
                              "kode"
                            )
                          }
                        </span>
                      </TableHeader>

                      <TableHeader>
                        Paket
                      </TableHeader>

                      <TableHeader
                        sortable
                        onClick={() =>
                          handleSort(
                            "status"
                          )
                        }
                      >
                        <span className="inline-flex items-center">
                          Status
                          {
                            renderSortIcon(
                              "status"
                            )
                          }
                        </span>
                      </TableHeader>

                      <TableHeader>
                        Kontak
                      </TableHeader>

                      <TableHeader align="right">
                        Aksi
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody
                    className={`divide-y ${themeDivider}`}
                  >
                    {loading ? (
                      <LoadingTable />
                    ) : paginatedData.length ===
                      0 ? (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState />
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map(
                        (
                          item,
                          index
                        ) => {
                          const rowNumber =
                            startIndex +
                            index +
                            1;

                          return (
                            <tr
                              key={
                                item.id ||
                                `${item.nama}-${index}`
                              }
                              className={`group transition-colors ${themeNeutralHover}`}
                            >
                              {/* NO */}

                              <td className="w-14 px-5 py-4 text-xs theme-text-muted">
                                {rowNumber
                                  .toString()
                                  .padStart(
                                    2,
                                    "0"
                                  )}
                              </td>

                              {/* SEKOLAH */}

                              <td className="px-5 py-4">
                                <div className="flex min-w-[250px] items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                                  >
                                    <School
                                      size={19}
                                      strokeWidth={
                                        1.7
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[260px] truncate font-semibold theme-text">
                                      {
                                        item.nama
                                      }
                                    </p>

                                    <p className="mt-0.5 max-w-[260px] truncate text-[11px] theme-text-muted">
                                      {
                                        item.subdomain
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* KODE */}

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1 font-mono text-xs theme-text-secondary`}
                                >
                                  {
                                    item.kode
                                  }
                                </span>
                              </td>

                              {/* PAKET */}

                              <td className="px-5 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium theme-text-secondary">
                                    {
                                      item.paket
                                    }
                                  </span>

                                  {item.tanggalBerakhir && (
                                    <span className="text-[10px] theme-text-muted">
                                      Berakhir:{" "}
                                      {formatDate(
                                        item.tanggalBerakhir
                                      )}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* STATUS */}

                              <td className="px-5 py-4">
                                <StatusBadge
                                  status={
                                    item.status
                                  }
                                />
                              </td>

                              {/* KONTAK */}

                              <td className="px-5 py-4">
                                <div className="min-w-[170px]">
                                  <p className="max-w-[190px] truncate text-xs theme-text-secondary">
                                    {
                                      item.email ||
                                      "-"
                                    }
                                  </p>

                                  <p className="mt-0.5 text-[10px] theme-text-muted">
                                    {
                                      item.telepon ||
                                      "-"
                                    }
                                  </p>
                                </div>
                              </td>

                              {/* ACTION */}

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                                  <ActionButton
                                    icon={
                                      Eye
                                    }
                                    title="Lihat detail sekolah"
                                    color="primary"
                                    onClick={() =>
                                      handleViewDetail(
                                        item.id
                                      )
                                    }
                                  />
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
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div
              className={`flex flex-col items-center justify-between gap-3 border-t ${themeDivider} px-4 py-4 sm:flex-row sm:px-5`}
            >
              <p className="text-xs theme-text-muted">
                Menampilkan{" "}
                <span className="font-semibold theme-text-secondary">
                  {sortedData.length ===
                  0
                    ? 0
                    : startIndex +
                      1}
                </span>{" "}
                –{" "}
                <span className="font-semibold theme-text-secondary">
                  {Math.min(
                    startIndex +
                      paginatedData.length,
                    sortedData.length
                  )}
                </span>{" "}
                dari{" "}
                <span className="font-semibold theme-text-secondary">
                  {
                    sortedData.length
                  }
                </span>{" "}
                data
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  onClick={() =>
                    setCurrentPage(
                      Math.max(
                        1,
                        safeCurrentPage -
                          1
                      )
                    )
                  }
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary transition-colors ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                {totalPages >
                  0 &&
                  getPaginationPages(
                    safeCurrentPage,
                    totalPages
                  ).map(
                    (
                      page,
                      index
                    ) =>
                      page ===
                      "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="w-8 text-center text-xs theme-text-muted"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={
                            page
                          }
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                          className={
                            safeCurrentPage ===
                            page
                              ? "h-9 w-9 rounded-lg bg-[var(--color-primary)] text-xs font-medium text-[var(--color-card)] transition-all"
                              : `h-9 w-9 rounded-lg text-xs font-medium theme-text-secondary transition-all ${themeNeutralHover}`
                          }
                        >
                          {
                            page
                          }
                        </button>
                      )
                  )}

                <button
                  type="button"
                  disabled={
                    totalPages ===
                      0 ||
                    safeCurrentPage ===
                      totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        totalPages,
                        safeCurrentPage +
                          1
                      )
                    )
                  }
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary transition-colors ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className={`flex flex-col items-center justify-between gap-2 border-t ${themeDivider} py-2 sm:flex-row`}
          >
            <p className="text-[11px] theme-text-muted">
              SmartSchool Management System
            </p>

            <div className="flex items-center gap-1.5 text-[11px] theme-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />

              Sistem berjalan normal
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
  if (!value) {
    return "-";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  } catch {
    return "-";
  }
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  const colorClasses = {
    primary: {
      icon: `${themePrimarySoft} text-[var(--color-primary)]`,
      accent:
        "bg-[var(--color-primary)]",
    },

    success: {
      icon: `${themeSuccessSoft} text-[var(--color-success)]`,
      accent:
        "bg-[var(--color-success)]",
    },

    warning: {
      icon: `${themeWarningSoft} text-[var(--color-warning)]`,
      accent:
        "bg-[var(--color-warning)]",
    },

    danger: {
      icon: `${themeDangerSoft} text-[var(--color-warning)]`,
      accent:
        "bg-[var(--color-warning)]",
    },

    info: {
      icon: `${themeInfoSoft} text-[var(--color-info)]`,
      accent:
        "bg-[var(--color-info)]",
    },
  };

  const current =
    colorClasses[color] ||
    colorClasses.primary;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border theme-border theme-card p-4 ${themeSmallShadow} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div
        className={`absolute left-0 right-0 top-0 h-[2px] ${current.accent} opacity-70`}
      />

      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide theme-text-muted sm:text-[11px]">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-bold tracking-tight theme-text sm:text-xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// FILTER SELECT
// =========================================================

function FilterSelect({
  value,
  onChange,
  options,
  icon: Icon,
  label,
}) {
  return (
    <div className="relative">
      <Icon
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
      />

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        aria-label={label}
        className={selectClass}
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>

      <ChevronRight
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 theme-text-muted"
      />
    </div>
  );
}

// =========================================================
// SORT SELECT
// =========================================================

function SortSelect({
  value,
  onChange,
}) {
  return (
    <div className="relative">
      <ArrowDownAZ
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
      />

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        aria-label="Urutkan data"
        className={selectClass}
      >
        {sortOptions.map(
          (option) => (
            <option
              key={option.value}
              value={
                option.value
              }
            >
              {option.label}
            </option>
          )
        )}
      </select>

      <ChevronRight
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 theme-text-muted"
      />
    </div>
  );
}

// =========================================================
// TABLE HEADER
// =========================================================

function TableHeader({
  children,
  sortable = false,
  onClick,
  align = "left",
}) {
  const alignClass =
    align === "right"
      ? "text-right"
      : "text-left";

  return (
    <th
      onClick={onClick}
      className={`px-5 py-3.5 ${alignClass} text-[10px] font-semibold uppercase tracking-[0.08em] theme-text-muted ${
        sortable
          ? "cursor-pointer select-none hover:text-[var(--color-primary)]"
          : ""
      }`}
    >
      {children}
    </th>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  status,
}) {
  const style =
    statusColorMap[
      status
    ] ||
    statusColorMap.Nonaktif;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${style.bg} ${style.text} ${style.border}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {status}
    </span>
  );
}

// =========================================================
// ACTION BUTTON
// =========================================================

function ActionButton({
  icon: Icon,
  title,
  color,
  onClick,
}) {
  const colors = {
    primary:
      "hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)]",

    warning:
      "hover:bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] hover:text-[var(--color-warning)]",

    danger:
      "hover:bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] hover:text-[var(--color-warning)]",
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition-all ${
        colors[color] ||
        colors.primary
      }`}
    >
      <Icon
        size={15}
        strokeWidth={1.8}
      />
    </button>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16">
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
      >
        <Search
          size={24}
          strokeWidth={1.7}
        />
      </div>

      <h3 className="text-sm font-semibold theme-text">
        Data tidak ditemukan
      </h3>

      <p className="mt-1 max-w-sm text-center text-xs theme-text-muted">
        Tidak ada sekolah yang sesuai dengan pencarian atau filter yang dipilih.
      </p>
    </div>
  );
}

// =========================================================
// LOADING MOBILE
// =========================================================

function LoadingMobile() {
  return (
    <div
      className={`divide-y ${themeDivider}`}
    >
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="animate-pulse p-4"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-2 h-4 w-6 rounded ${themeNeutralSurface}`}
              />

              <div
                className={`h-11 w-11 rounded-xl ${themeNeutralSurface}`}
              />

              <div className="flex-1">
                <div
                  className={`h-4 w-2/3 rounded ${themeNeutralSurface}`}
                />

                <div
                  className={`mt-2 h-3 w-1/3 rounded ${themeNeutralSurface}`}
                />

                <div
                  className={`mt-3 h-6 w-24 rounded ${themeNeutralSurface}`}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// =========================================================
// LOADING TABLE
// =========================================================

function LoadingTable() {
  return (
    <>
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <tr
            key={index}
            className="animate-pulse"
          >
            <td className="px-5 py-4">
              <div
                className={`h-3 w-5 rounded ${themeNeutralSurface}`}
              />
            </td>

            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl ${themeNeutralSurface}`}
                />

                <div className="space-y-2">
                  <div
                    className={`h-4 w-36 rounded ${themeNeutralSurface}`}
                  />

                  <div
                    className={`h-3 w-20 rounded ${themeNeutralSurface}`}
                  />
                </div>
              </div>
            </td>

            <td className="px-5 py-4">
              <div
                className={`h-6 w-24 rounded-lg ${themeNeutralSurface}`}
              />
            </td>

            <td className="px-5 py-4">
              <div
                className={`h-4 w-28 rounded ${themeNeutralSurface}`}
              />
            </td>

            <td className="px-5 py-4">
              <div
                className={`h-6 w-16 rounded-full ${themeNeutralSurface}`}
              />
            </td>

            <td className="px-5 py-4">
              <div
                className={`h-4 w-32 rounded ${themeNeutralSurface}`}
              />
            </td>

            <td className="px-5 py-4">
              <div className="flex justify-end">
                <div
                  className={`h-8 w-10 rounded-lg ${themeNeutralSurface}`}
                />
              </div>
            </td>
          </tr>
        )
      )}
    </>
  );
}

// =========================================================
// INPUT STYLE
// =========================================================

const inputClass = `
  h-10
  w-full
  rounded-xl
  border
  theme-border
  ${themeNeutralSurface}
  px-3
  text-sm
  theme-text
  outline-none
  transition-all
  placeholder:text-[var(--color-text-placeholder)]
  hover:border-[color-mix(in_srgb,var(--color-primary)_25%,var(--color-border))]
  ${themeFocus}
`.replace(/\s+/g, " ").trim();

// =========================================================
// SELECT STYLE
// =========================================================

const selectClass = `
  h-10
  w-full
  cursor-pointer
  appearance-none
  rounded-xl
  border
  theme-border
  ${themeNeutralSurface}
  pl-9
  pr-8
  text-sm
  theme-text-secondary
  outline-none
  transition-all
  ${themeFocus}
`.replace(/\s+/g, " ").trim();

// =========================================================
// PAGINATION
// =========================================================

function getPaginationPages(
  currentPage,
  totalPages
) {
  if (
    totalPages <= 5
  ) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (_, i) =>
        i + 1
    );
  }

  if (
    currentPage <= 3
  ) {
    return [
      1,
      2,
      3,
      4,
      "...",
      totalPages,
    ];
  }

  if (
    currentPage >=
    totalPages - 2
  ) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}