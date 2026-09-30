"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  Building,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  Eye,
  Download,
  FileSpreadsheet,
  Filter,
  Image as ImageIcon,
} from "lucide-react";

import {
  getGedung,
  deleteGedung,
} from "../../../../../services/infrastruktur.service";

/* =========================================================
   GLOBAL THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_3px_14px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeButtonShadow =
  "shadow-[0_5px_15px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeButtonHoverShadow =
  "hover:shadow-[0_8px_22px_color-mix(in_srgb,var(--color-text)_15%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralStrongBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeNeutralDivider =
  "border-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

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
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  valueClass,
}) {
  return (
    <div
      className={`group rounded-2xl border theme-border theme-card p-4 ${themeCardShadow} transition-all hover:-translate-y-0.5 ${themeCardHoverShadow} sm:p-5`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          <p className="theme-text-secondary mt-0.5 truncate text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   IMAGE COMPONENT
========================================================= */

function GedungImage({ src, nama }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    typeof src === "string" ? src.trim() : "";

  const hasImage = imageUrl !== "" && !imageError;

  if (!hasImage) {
    return (
      <div
        className={`flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface}`}
      >
        <div className="theme-text-muted flex flex-col items-center justify-center">
          <Building
            size={21}
            strokeWidth={1.7}
          />

          <span className="mt-0.5 text-[8px] font-medium">
            Tidak ada foto
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-14 w-20 shrink-0 overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} ${themeButtonShadow}`}
    >
      <img
        src={imageUrl}
        alt={`Foto ${nama || "gedung"}`}
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function SarprasGedungPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("nama_asc");

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showExport, setShowExport] = useState(false);

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchGedung = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getGedung();

      console.log("Response get gedung:", response);

      const result =
        response?.data ??
        response?.result ??
        response ??
        [];

      const normalizedData = Array.isArray(result)
        ? result.map((item) => ({
            ...item,

            fotoGedung:
              item?.fotoGedung ??
              item?.fotoUrl ??
              null,
          }))
        : [];

      setData(normalizedData);
    } catch (err) {
      console.error("Error fetch gedung:", err);

      setError(
        err?.message ||
          "Gagal mengambil data gedung. Silakan coba lagi."
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGedung();
  }, [fetchGedung]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {
    fetchGedung();
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleAdd = () => {
    router.push("/admin/sarpras/gedung/tambah");
  };

  const handleEdit = (id) => {
    router.push(`/admin/sarpras/gedung/edit/${id}`);
  };

  const handleDetail = (id) => {
    router.push(`/admin/sarpras/gedung/detail/${id}`);
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (id, nama) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus gedung "${nama}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteGedung(id);

      await fetchGedung();
    } catch (err) {
      console.error("Error delete gedung:", err);

      setError(
        err?.message ||
          "Gedung gagal dihapus. Pastikan gedung tidak memiliki lantai."
      );
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((item) => {
      const nama = String(
        item?.nama ?? ""
      ).toLowerCase();

      const kode = String(
        item?.kode ?? ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        kode.includes(keyword)
      );
    });
  }, [data, search]);

  /* =========================================================
     SORT
  ========================================================= */

  const sortedData = useMemo(() => {
    const result = [...filteredData];

    switch (sortBy) {
      case "nama_asc":
        result.sort((a, b) =>
          String(a?.nama ?? "").localeCompare(
            String(b?.nama ?? "")
          )
        );
        break;

      case "nama_desc":
        result.sort((a, b) =>
          String(b?.nama ?? "").localeCompare(
            String(a?.nama ?? "")
          )
        );
        break;

      case "kode_asc":
        result.sort((a, b) =>
          String(a?.kode ?? "").localeCompare(
            String(b?.kode ?? "")
          )
        );
        break;

      case "kode_desc":
        result.sort((a, b) =>
          String(b?.kode ?? "").localeCompare(
            String(a?.kode ?? "")
          )
        );
        break;

      case "lantai_desc":
        result.sort(
          (a, b) =>
            (b?.lantai?.length ?? 0) -
            (a?.lantai?.length ?? 0)
        );
        break;

      case "lantai_asc":
        result.sort(
          (a, b) =>
            (a?.lantai?.length ?? 0) -
            (b?.lantai?.length ?? 0)
        );
        break;

      default:
        break;
    }

    return result;
  }, [filteredData, sortBy]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalItems = sortedData.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / itemsPerPage)
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * itemsPerPage;

  const endIndex = Math.min(
    startIndex + itemsPerPage,
    totalItems
  );

  const currentItems = sortedData.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, itemsPerPage]);

  const goToPage = (page) => {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }

    if (safePage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (
      safePage >=
      totalPages - 2
    ) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      safePage - 2,
      safePage - 1,
      safePage,
      safePage + 1,
      safePage + 2,
    ];
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalLantai = useMemo(() => {
    return data.reduce(
      (total, gedung) =>
        total +
        (gedung?.lantai?.length ?? 0),
      0
    );
  }, [data]);

  const totalFoto = useMemo(() => {
    return data.filter((item) => {
      const foto =
        item?.fotoGedung ??
        item?.fotoUrl ??
        "";

      return (
        typeof foto === "string" &&
        foto.trim() !== ""
      );
    }).length;
  }, [data]);

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const exportCSV = () => {
    if (!data.length) return;

    const headers = [
      "No",
      "Nama Gedung",
      "Kode",
      "URL Foto",
      "Jumlah Lantai",
    ];

    const rows = data.map(
      (item, index) => [
        index + 1,
        item?.nama ?? "",
        item?.kode ?? "",
        item?.fotoGedung ??
          item?.fotoUrl ??
          "",
        item?.lantai?.length ?? 0,
      ]
    );

    const escapeCSV = (value) => {
      const text = String(
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

      ...rows.map((row) =>
        row
          .map(escapeCSV)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `data_gedung_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setShowExport(false);
  };

  /* =========================================================
     EXPORT EXCEL
  ========================================================= */

  const exportExcel = () => {
    if (!data.length) return;

    const escapeHTML = (value) => {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const headers = [
      "No",
      "Nama Gedung",
      "Kode",
      "URL Foto",
      "Jumlah Lantai",
    ];

    let html = `
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <table border="1">
            <tr>
              ${headers
                .map(
                  (header) =>
                    `<th>${escapeHTML(
                      header
                    )}</th>`
                )
                .join("")}
            </tr>
    `;

    data.forEach(
      (item, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(
              item?.nama
            )}</td>
            <td>${escapeHTML(
              item?.kode
            )}</td>
            <td>${escapeHTML(
              item?.fotoGedung ??
                item?.fotoUrl ??
                ""
            )}</td>
            <td>${
              item?.lantai?.length ??
              0
            }</td>
          </tr>
        `;
      }
    );

    html += `
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(
      [html],
      {
        type:
          "application/vnd.ms-excel",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `data_gedung_${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setShowExport(false);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              !isCollapsed
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-3 sm:p-5 lg:p-7 xl:p-8">
            <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5 lg:space-y-6">

              {/* =====================================================
                  HEADER
              ===================================================== */}

              <section
                className={`relative overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
              >
                <div
                  className={`pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl ${themePrimarySoft}`}
                />

                <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">

                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} sm:h-14 sm:w-14`}
                    >
                      <Building
                        size={22}
                        strokeWidth={1.9}
                        className="sm:h-[25px] sm:w-[25px]"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="theme-text text-xl font-semibold tracking-[-0.025em] sm:text-2xl lg:text-[26px]">
                          Pengelolaan Gedung
                        </h1>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-2.5 py-0.5 text-[10px] font-semibold text-[var(--color-primary)] sm:px-3 sm:py-1 sm:text-[11px]`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />

                          Sarana & Prasarana
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                        <Layers
                          size={13}
                          className="shrink-0 text-[var(--color-primary)] sm:h-[14px] sm:w-[14px]"
                          strokeWidth={2}
                        />

                        <p className="theme-text-secondary text-xs leading-5 sm:text-sm">
                          Kelola data gedung dan lantai sekolah.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:flex-row lg:w-auto">

                    {/* EXPORT */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowExport(
                            !showExport
                          )
                        }
                        disabled={
                          data.length === 0
                        }
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-medium theme-text-secondary ${themeButtonShadow} transition-all ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-5`}
                      >
                        <Download size={16} />
                        Export
                      </button>

                      {showExport && (
                        <div
                          className={`absolute right-0 top-12 z-40 w-48 rounded-xl border ${themeNeutralBorder} theme-card py-1 shadow-[0_10px_40px_color-mix(in_srgb,var(--color-text)_12%,transparent)]`}
                        >
                          <button
                            onClick={
                              exportExcel
                            }
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm theme-text-secondary transition ${themeNeutralHover}`}
                          >
                            <FileSpreadsheet
                              size={16}
                              className="text-[var(--color-success)]"
                            />

                            Export Excel
                          </button>

                          <button
                            onClick={
                              exportCSV
                            }
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm theme-text-secondary transition ${themeNeutralHover}`}
                          >
                            <FileSpreadsheet
                              size={16}
                              className="text-[var(--color-primary)]"
                            />

                            Export CSV
                          </button>
                        </div>
                      )}
                    </div>

                    {/* REFRESH */}
                    <button
                      onClick={
                        handleRefresh
                      }
                      disabled={loading}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${themeNeutralBorder} theme-card theme-text-secondary ${themeButtonShadow} transition-all ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11`}
                      title="Refresh data"
                    >
                      <RefreshCw
                        size={16}
                        className={
                          loading
                            ? "animate-spin"
                            : ""
                        }
                      />
                    </button>

                    {/* ADD */}
                    <button
                      onClick={
                        handleAdd
                      }
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-4 text-sm font-semibold text-[var(--color-card)] ${themeButtonShadow} transition-all ${themeButtonHoverShadow} active:scale-[0.98] sm:h-11 sm:px-5`}
                    >
                      <Plus
                        size={16}
                        strokeWidth={2.3}
                      />

                      Tambah Gedung
                    </button>
                  </div>
                </div>
              </section>

              {/* =====================================================
                  ERROR
              ===================================================== */}

              {error && (
                <div
                  className={`flex items-start justify-between gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3 text-sm theme-danger`}
                >
                  <div>
                    <p className="font-semibold">
                      Terjadi kesalahan
                    </p>

                    <p className="mt-0.5 text-xs">
                      {error}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setError("")
                    }
                    className="theme-danger text-xs font-semibold opacity-80 transition hover:opacity-100"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* =====================================================
                  STATS
              ===================================================== */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                <StatCard
                  icon={Building}
                  label="Total Gedung"
                  value={
                    data.length
                  }
                  description="Seluruh gedung"
                  iconClass={`${themePrimarySoft} text-[var(--color-primary)]`}
                  valueClass="theme-text"
                />

                <StatCard
                  icon={Layers}
                  label="Total Lantai"
                  value={
                    totalLantai
                  }
                  description="Seluruh lantai"
                  iconClass={`${themeInfoSurface} text-[var(--color-info)]`}
                  valueClass="text-[var(--color-info)]"
                />

                <StatCard
                  icon={ImageIcon}
                  label="Gedung Berfoto"
                  value={
                    totalFoto
                  }
                  description="Memiliki URL foto"
                  iconClass={`${themeSuccessSurface} text-[var(--color-success)]`}
                  valueClass="text-[var(--color-success)]"
                />
              </div>

              {/* =====================================================
                  SEARCH
              ===================================================== */}

              <section
                className={`rounded-2xl border theme-border theme-card p-4 ${themeCardShadow} sm:p-5`}
              >
                <div className="mb-4 flex items-center gap-2 sm:gap-3">

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)] sm:h-9 sm:w-9`}
                  >
                    <Filter
                      size={14}
                      className="sm:h-[16px] sm:w-[16px]"
                    />
                  </div>

                  <div>
                    <p className="theme-text text-sm font-semibold">
                      Filter & Pencarian
                    </p>

                    <p className="theme-text-muted text-xs">
                      Cari dan urutkan data gedung
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                  {/* SEARCH INPUT */}
                  <div className="relative">
                    <Search
                      size={15}
                      className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Cari nama atau kode..."
                      className={`theme-input h-10 w-full rounded-xl border ${themeNeutralBorder} pl-9 pr-3 text-sm outline-none transition-all placeholder:theme-text-placeholder ${themeFocus}`}
                    />
                  </div>

                  {/* SORT */}
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value
                      )
                    }
                    className={`theme-input h-10 w-full rounded-xl border ${themeNeutralBorder} px-3 text-sm outline-none transition-all ${themeFocus}`}
                  >
                    <option value="nama_asc">
                      Nama A-Z
                    </option>

                    <option value="nama_desc">
                      Nama Z-A
                    </option>

                    <option value="kode_asc">
                      Kode A-Z
                    </option>

                    <option value="kode_desc">
                      Kode Z-A
                    </option>

                    <option value="lantai_desc">
                      Lantai Terbanyak
                    </option>

                    <option value="lantai_asc">
                      Lantai Tersedikit
                    </option>
                  </select>

                  {/* RESET */}
                  <button
                    onClick={() => {
                      setSearch("");
                      setSortBy(
                        "nama_asc"
                      );
                    }}
                    className={`h-10 rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-medium theme-text-secondary transition-all ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] hover:text-[var(--color-text)]`}
                  >
                    Reset
                  </button>
                </div>

                <div
                  className={`mt-3 flex flex-wrap items-center justify-between gap-2 border-t ${themeNeutralDivider} pt-3`}
                >
                  <p className="theme-text-muted text-xs">
                    Menampilkan{" "}
                    <span className="theme-text-secondary font-semibold">
                      {totalItems}
                    </span>{" "}
                    data gedung
                  </p>
                </div>
              </section>

              {/* =====================================================
                  TABLE
              ===================================================== */}

              <section
                className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
              >
                <div
                  className={`border-b ${themeNeutralDivider} px-5 py-4 sm:px-6 sm:py-5`}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h2 className="theme-text text-sm font-semibold">
                        Daftar Gedung
                      </h2>

                      <p className="theme-text-secondary text-xs">
                        Data gedung sekolah dari database
                      </p>
                    </div>

                    <div className="theme-text-secondary text-xs">
                      {totalItems} data
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse">

                    <thead>
                      <tr
                        className={`border-b ${themeNeutralStrongBorder} ${themeNeutralSurface}`}
                      >
                        <th className="theme-text-muted w-14 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em]">
                          No
                        </th>

                        <th className="theme-text-muted w-28 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">
                          Foto
                        </th>

                        <th className="theme-text-muted min-w-[250px] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">
                          Nama Gedung
                        </th>

                        <th className="theme-text-muted w-28 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">
                          Kode
                        </th>

                        <th className="theme-text-muted w-32 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">
                          Lantai
                        </th>

                        <th className="theme-text-muted w-32 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em]">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody
                      className={`divide-y ${themeNeutralDivider}`}
                    >
                      {/* LOADING */}
                      {loading && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-16 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">

                              <RefreshCw
                                size={24}
                                className="animate-spin text-[var(--color-primary)]"
                              />

                              <p className="theme-text-secondary mt-3 text-sm font-medium">
                                Memuat data gedung...
                              </p>

                              <p className="theme-text-muted mt-1 text-xs">
                                Mengambil data dari server
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* DATA */}
                      {!loading &&
                        currentItems.map(
                          (
                            item,
                            index
                          ) => {
                            const rowNumber =
                              startIndex +
                              index +
                              1;

                            const jumlahLantai =
                              item?.lantai
                                ?.length ??
                              0;

                            const fotoGedung =
                              item?.fotoGedung ??
                              item?.fotoUrl ??
                              "";

                            return (
                              <tr
                                key={
                                  item.id
                                }
                                className={`group transition-colors ${themePrimaryHover}`}
                              >
                                {/* NO */}
                                <td className="theme-text-muted px-4 py-3.5 text-center text-sm">
                                  {rowNumber}
                                </td>

                                {/* FOTO */}
                                <td className="px-4 py-3.5">
                                  <GedungImage
                                    src={
                                      fotoGedung
                                    }
                                    nama={
                                      item?.nama
                                    }
                                  />
                                </td>

                                {/* NAMA */}
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-3">

                                    <div
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                                    >
                                      <Building
                                        size={
                                          17
                                        }
                                      />
                                    </div>

                                    <div className="min-w-0">

                                      <button
                                        onClick={() =>
                                          handleDetail(
                                            item.id
                                          )
                                        }
                                        className="theme-text block max-w-[320px] truncate text-left text-sm font-semibold transition hover:text-[var(--color-primary)]"
                                      >
                                        {item?.nama ||
                                          "-"}
                                      </button>

                                      <p className="theme-text-muted max-w-[320px] truncate text-xs">
                                        ID #
                                        {item?.id}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* KODE */}
                                <td className="px-4 py-3.5">
                                  {item?.kode ? (
                                    <span
                                      className={`inline-flex rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary px-2.5 py-1 text-xs font-medium`}
                                    >
                                      {
                                        item.kode
                                      }
                                    </span>
                                  ) : (
                                    <span className="theme-text-muted text-xs">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* LANTAI */}
                                <td className="px-4 py-3.5">
                                  <button
                                    onClick={() =>
                                      handleDetail(
                                        item.id
                                      )
                                    }
                                    className="theme-text-secondary flex items-center gap-1.5 text-sm transition hover:text-[var(--color-primary)]"
                                    title="Lihat lantai"
                                  >
                                    <Layers
                                      size={
                                        15
                                      }
                                      className="theme-text-muted"
                                    />

                                    {
                                      jumlahLantai
                                    }{" "}
                                    Lantai
                                  </button>
                                </td>

                                {/* ACTION */}
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center justify-center gap-1">

                                    {/* DETAIL */}
                                    <button
                                      onClick={() =>
                                        handleDetail(
                                          item.id
                                        )
                                      }
                                      className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition-all ${themePrimarySoft} hover:text-[var(--color-primary)]`}
                                      title="Detail"
                                    >
                                      <Eye
                                        size={
                                          16
                                        }
                                      />
                                    </button>

                                    {/* EDIT */}
                                    <button
                                      onClick={() =>
                                        handleEdit(
                                          item.id
                                        )
                                      }
                                      className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition-all ${themeWarningSurface} hover:text-[var(--color-warning)]`}
                                      title="Edit"
                                    >
                                      <Edit
                                        size={
                                          16
                                        }
                                      />
                                    </button>

                                    {/* DELETE */}
                                    <button
                                      onClick={() =>
                                        handleDelete(
                                          item.id,
                                          item.nama
                                        )
                                      }
                                      className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition-all ${themeDangerSurface} hover:text-[var(--color-text)]`}
                                      title="Hapus"
                                    >
                                      <Trash2
                                        size={
                                          16
                                        }
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        )}
                    </tbody>
                  </table>
                </div>

                {/* EMPTY */}
                {!loading &&
                  currentItems.length ===
                    0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">

                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                      >
                        <Building
                          size={24}
                        />
                      </div>

                      <h3 className="theme-text mt-4 text-sm font-semibold">
                        Tidak ada data
                      </h3>

                      <p className="theme-text-muted mt-1 text-xs">
                        {search
                          ? "Tidak ditemukan gedung yang sesuai dengan pencarian."
                          : "Belum ada data gedung."}
                      </p>

                      {!search && (
                        <button
                          onClick={
                            handleAdd
                          }
                          className={`mt-4 inline-flex items-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-2 text-xs font-semibold text-[var(--color-card)] ${themeButtonShadow} transition-all ${themeButtonHoverShadow}`}
                        >
                          <Plus
                            size={14}
                          />

                          Tambah Gedung
                        </button>
                      )}
                    </div>
                  )}

                {/* PAGINATION */}
                {!loading &&
                  totalItems > 0 && (
                    <div
                      className={`flex flex-col gap-3 border-t ${themeNeutralStrongBorder} px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
                    >
                      <div className="flex flex-wrap items-center gap-3 text-xs theme-text-secondary">

                        <span>
                          Menampilkan{" "}
                          <span className="theme-text font-semibold">
                            {startIndex +
                              1}
                          </span>{" "}
                          -{" "}
                          <span className="theme-text font-semibold">
                            {endIndex}
                          </span>{" "}
                          dari{" "}
                          <span className="theme-text font-semibold">
                            {
                              totalItems
                            }
                          </span>{" "}
                          data
                        </span>

                        <div
                          className={`hidden h-4 w-px ${themeNeutralSurface} sm:block`}
                        />

                        <label className="flex items-center gap-2">
                          <span>
                            Tampilkan
                          </span>

                          <select
                            value={
                              itemsPerPage
                            }
                            onChange={(
                              e
                            ) => {
                              setItemsPerPage(
                                Number(
                                  e
                                    .target
                                    .value
                                )
                              );

                              setCurrentPage(
                                1
                              );
                            }}
                            className={`theme-input h-8 rounded-lg border ${themeNeutralBorder} px-2 text-xs font-medium outline-none transition-all ${themeFocus}`}
                          >
                            <option value={10}>
                              10
                            </option>

                            <option value={20}>
                              20
                            </option>

                            <option value={40}>
                              40
                            </option>
                          </select>
                        </label>
                      </div>

                      <div className="flex items-center gap-1">

                        {/* FIRST */}
                        <button
                          onClick={() =>
                            goToPage(
                              1
                            )
                          }
                          disabled={
                            safePage ===
                            1
                          }
                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all ${themeNeutralHover} hover:${themeNeutralStrongBorder} disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <ChevronsLeft
                            size={14}
                          />
                        </button>

                        {/* PREVIOUS */}
                        <button
                          onClick={() =>
                            goToPage(
                              safePage -
                                1
                            )
                          }
                          disabled={
                            safePage ===
                            1
                          }
                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all ${themeNeutralHover} hover:${themeNeutralStrongBorder} disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <ChevronLeft
                            size={14}
                          />
                        </button>

                        {/* PAGE NUMBERS */}
                        {getPageNumbers().map(
                          (page) => (
                            <button
                              key={
                                page
                              }
                              onClick={() =>
                                goToPage(
                                  page
                                )
                              }
                              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all ${
                                safePage ===
                                page
                                  ? `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`
                                  : `theme-text-secondary ${themeNeutralHover}`
                              }`}
                            >
                              {
                                page
                              }
                            </button>
                          )
                        )}

                        {/* NEXT */}
                        <button
                          onClick={() =>
                            goToPage(
                              safePage +
                                1
                            )
                          }
                          disabled={
                            safePage ===
                            totalPages
                          }
                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <ChevronRight
                            size={14}
                          />
                        </button>

                        {/* LAST */}
                        <button
                          onClick={() =>
                            goToPage(
                              totalPages
                            )
                          }
                          disabled={
                            safePage ===
                            totalPages
                          }
                          className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <ChevronsRight
                            size={14}
                          />
                        </button>
                      </div>
                    </div>
                  )}
              </section>

              {/* FOOTER */}

              <footer
                className={`border-t ${themeNeutralDivider} pt-4 text-center sm:pt-5`}
              >
                <p className="theme-text-muted text-xs">
                  © 2026 SmartSchool • Pengelolaan
                  Gedung - Sarana & Prasarana
                </p>
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}