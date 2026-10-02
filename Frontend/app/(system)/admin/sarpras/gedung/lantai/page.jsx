"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  Building2,
  Layers3,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Download,
  FileSpreadsheet,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  LayoutGrid,
  ArrowUpDown,
} from "lucide-react";

import {
  getGedung,
  getLantaiByGedung,
  deleteLantai,
} from "../../../../../../services/infrastruktur.service";

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themePrimaryButtonHover =
  "hover:shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_28%,transparent)]";

const themeCardShadow =
  "shadow-[0_3px_14px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_9%,transparent)]";

const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeSoftSurfaceHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeSoftBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorderHover =
  "hover:border-[color-mix(in_srgb,var(--color-text)_20%,transparent)]";

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
      className={`
        theme-card
        group relative overflow-hidden
        rounded-2xl border theme-border
        p-5
        ${themeCardShadow}
        transition-all duration-200
        hover:-translate-y-0.5
        ${themeCardHoverShadow}
      `}
    >
      <div
        className="
          absolute -right-8 -top-8
          h-24 w-24 rounded-full
          bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
          opacity-0 blur-2xl
          transition-opacity
          group-hover:opacity-100
        "
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-[0.12em]">
            {label}
          </p>

          <p
            className={`theme-text mt-1 text-2xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          <p className="theme-text-muted mt-1 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`
            flex h-12 w-12 shrink-0 items-center
            justify-center rounded-2xl
            ${iconClass}
          `}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TOAST
========================================================= */

function Toast({ toast, onClose }) {
  if (!toast) return null;

  const success = toast.type === "success";

  return (
    <div className="fixed right-4 top-20 z-[100] w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`
          theme-card
          flex items-start gap-3
          rounded-2xl border theme-border
          p-4
          shadow-[0_15px_50px_color-mix(in_srgb,var(--color-text)_15%,transparent)]
        `}
      >
        <div
          className={`
            flex h-9 w-9 shrink-0 items-center
            justify-center rounded-xl
            ${
              success
                ? "theme-success bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]"
                : "theme-danger bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
            }
          `}
        >
          {success ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`
              text-sm font-semibold
              ${success ? "theme-success" : "theme-danger"}
            `}
          >
            {success ? "Berhasil" : "Terjadi kesalahan"}
          </p>

          <p className="theme-text-secondary mt-0.5 text-xs leading-5">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            theme-text-muted
            transition
            hover:text-[var(--color-text)]
          "
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function SarprasLantaiPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  /* DATA */
  const [data, setData] = useState([]);
  const [gedungList, setGedungList] = useState([]);

  /* STATE */
  const [loading, setLoading] = useState(true);
  const [loadingGedung, setLoadingGedung] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  /* FILTER */
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nama_asc");
  const [selectedGedung, setSelectedGedung] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* EXPORT */
  const [showExport, setShowExport] = useState(false);

  /* TOAST */
  const [toast, setToast] = useState(null);

  /* =========================================================
     TOAST HELPER
  ========================================================= */

  const showToast = useCallback((type, message) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  /* =========================================================
     FETCH GEDUNG
  ========================================================= */

  const fetchGedungList = useCallback(async () => {
    try {
      setLoadingGedung(true);

      const response = await getGedung();

      if (!response?.success) {
        throw new Error(
          response?.message || "Gagal mengambil data gedung."
        );
      }

      const gedungData = Array.isArray(response.data)
        ? response.data
        : [];

      setGedungList(gedungData);

      return gedungData;
    } catch (error) {
      console.error("Error fetch gedung:", error);

      showToast(
        "error",
        error?.message || "Gagal mengambil data gedung."
      );

      setGedungList([]);
      return [];
    } finally {
      setLoadingGedung(false);
    }
  }, [showToast]);

  /* =========================================================
     FETCH LANTAI
  ========================================================= */

  const fetchLantai = useCallback(
    async (gedungId = selectedGedung) => {
      try {
        setLoading(true);

        let result = [];

        if (gedungId) {
          const response = await getLantaiByGedung(gedungId);

          if (!response?.success) {
            throw new Error(
              response?.message || "Gagal mengambil data lantai."
            );
          }

          result = Array.isArray(response.data)
            ? response.data
            : [];

          const selected = gedungList.find(
            (g) => g.id === gedungId
          );

          result = result.map((lantai) => ({
            ...lantai,
            gedung:
              lantai.gedung ||
              selected || {
                id: gedungId,
                nama: "-",
              },
          }));
        } else {
          const gedungResponse = await getGedung();

          if (!gedungResponse?.success) {
            throw new Error(
              gedungResponse?.message ||
                "Gagal mengambil data gedung."
            );
          }

          const gedungs = Array.isArray(gedungResponse.data)
            ? gedungResponse.data
            : [];

          setGedungList(gedungs);

          const responses = await Promise.all(
            gedungs.map(async (gedung) => {
              try {
                const response = await getLantaiByGedung(
                  gedung.id
                );

                if (!response?.success) {
                  return [];
                }

                const lantai = Array.isArray(response.data)
                  ? response.data
                  : [];

                return lantai.map((item) => ({
                  ...item,
                  gedung:
                    item.gedung || {
                      id: gedung.id,
                      nama: gedung.nama,
                      kode: gedung.kode,
                    },
                }));
              } catch (error) {
                console.error(
                  `Gagal mengambil lantai gedung ${gedung.id}:`,
                  error
                );

                return [];
              }
            })
          );

          result = responses.flat();
        }

        setData(result);
      } catch (error) {
        console.error("Error fetch lantai:", error);

        setData([]);

        showToast(
          "error",
          error?.message || "Gagal memuat data lantai."
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedGedung, gedungList, showToast]
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    const load = async () => {
      const gedungs = await fetchGedungList();

      if (gedungs.length > 0) {
        await fetchLantai("");
      } else {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    setShowExport(false);

    await fetchGedungList();
    await fetchLantai(selectedGedung);

    showToast("success", "Data berhasil diperbarui.");
  };

  /* =========================================================
     FILTER GEDUNG
  ========================================================= */

  const handleGedungChange = async (value) => {
    setSelectedGedung(value);
    setCurrentPage(1);

    await fetchLantai(value);
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleAdd = () => {
    router.push("/admin/sarpras/gedung/lantai/tambah");
  };

  const handleEdit = (id) => {
    router.push(`/admin/sarpras/gedung/lantai/edit/${id}`);
  };

  const handleDetail = (id) => {
    router.push(`/admin/sarpras/gedung/lantai/detail/${id}`);
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (id, nama) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus lantai "${nama}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await deleteLantai(id);

      if (!response?.success) {
        throw new Error(
          response?.message || "Gagal menghapus lantai."
        );
      }

      setData((prev) =>
        prev.filter((item) => item.id !== id)
      );

      showToast(
        "success",
        response?.message || "Lantai berhasil dihapus."
      );
    } catch (error) {
      console.error("Error delete lantai:", error);

      showToast(
        "error",
        error?.message ||
          "Gagal menghapus lantai. Pastikan lantai tidak sedang digunakan kelas."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     FILTER & SEARCH
  ========================================================= */

  const filteredData = useMemo(() => {
    let result = [...data];

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((item) => {
        const nama = String(
          item.nama ?? ""
        ).toLowerCase();

        const gedung = String(
          item.gedung?.nama ?? ""
        ).toLowerCase();

        const id = String(
          item.id ?? ""
        ).toLowerCase();

        return (
          nama.includes(keyword) ||
          gedung.includes(keyword) ||
          id.includes(keyword)
        );
      });
    }

    return result;
  }, [data, search]);

  /* =========================================================
     SORT
  ========================================================= */

  const sortedData = useMemo(() => {
    const result = [...filteredData];

    switch (sortBy) {
      case "nama_asc":
        result.sort((a, b) =>
          String(a.nama ?? "").localeCompare(
            String(b.nama ?? ""),
            "id"
          )
        );
        break;

      case "nama_desc":
        result.sort((a, b) =>
          String(b.nama ?? "").localeCompare(
            String(a.nama ?? ""),
            "id"
          )
        );
        break;

      case "gedung_asc":
        result.sort((a, b) =>
          String(a.gedung?.nama ?? "").localeCompare(
            String(b.gedung?.nama ?? ""),
            "id"
          )
        );
        break;

      case "gedung_desc":
        result.sort((a, b) =>
          String(b.gedung?.nama ?? "").localeCompare(
            String(a.gedung?.nama ?? ""),
            "id"
          )
        );
        break;

      case "tanggal_desc":
        result.sort(
          (a, b) =>
            new Date(b.dibuatPada || 0) -
            new Date(a.dibuatPada || 0)
        );
        break;

      case "tanggal_asc":
        result.sort(
          (a, b) =>
            new Date(a.dibuatPada || 0) -
            new Date(b.dibuatPada || 0)
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
  }, [
    search,
    sortBy,
    itemsPerPage,
    selectedGedung,
  ]);

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

    if (safePage >= totalPages - 2) {
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

  const totalGedungTerpakai = useMemo(() => {
    return new Set(
      data
        .map((item) => item.gedungId)
        .filter(Boolean)
    ).size;
  }, [data]);

  const totalKelas = useMemo(() => {
    return data.reduce(
      (total, item) =>
        total +
        (Array.isArray(item.kelas)
          ? item.kelas.length
          : 0),
      0
    );
  }, [data]);

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  const exportCSV = () => {
    if (!sortedData.length) return;

    const headers = [
      "No",
      "Nama Lantai",
      "Gedung",
      "Jumlah Kelas",
      "Dibuat Pada",
    ];

    const rows = sortedData.map(
      (item, index) => [
        index + 1,
        item.nama ?? "",
        item.gedung?.nama ?? "",
        item.kelas?.length ?? 0,
        item.dibuatPada
          ? new Date(
              item.dibuatPada
            ).toLocaleDateString("id-ID")
          : "",
      ]
    );

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
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
    link.download = `data_lantai_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setShowExport(false);

    showToast(
      "success",
      "Data lantai berhasil diekspor ke CSV."
    );
  };

  /* =========================================================
     EXCEL EXPORT
  ========================================================= */

  const exportExcel = () => {
    if (!sortedData.length) return;

    const escapeHTML = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const headers = [
      "No",
      "Nama Lantai",
      "Gedung",
      "Jumlah Kelas",
      "Dibuat Pada",
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
                  (h) =>
                    `<th>${escapeHTML(h)}</th>`
                )
                .join("")}
            </tr>
    `;

    sortedData.forEach((item, index) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(item.nama)}</td>
          <td>${escapeHTML(item.gedung?.nama)}</td>
          <td>${item.kelas?.length ?? 0}</td>
          <td>${escapeHTML(
            item.dibuatPada
              ? new Date(
                  item.dibuatPada
                ).toLocaleDateString("id-ID")
              : ""
          )}</td>
        </tr>
      `;
    });

    html += `
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(
      [html],
      {
        type: "application/vnd.ms-excel",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `data_lantai_${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setShowExport(false);

    showToast(
      "success",
      "Data lantai berhasil diekspor ke Excel."
    );
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
            setIsCollapsed(!isCollapsed)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <Toast
          toast={toast}
          onClose={() => setToast(null)}
        />

        <main className="theme-page min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-3 sm:p-5 lg:p-7">
            <div className="mx-auto w-full max-w-[1600px] space-y-5">

              {/* =================================================
                  HERO
              ================================================= */}

              <section
                className={`
                  theme-card
                  relative overflow-hidden
                  rounded-3xl border theme-border
                  ${themeCardShadow}
                `}
              >
                <div
                  className="
                    absolute inset-0
                    bg-[radial-gradient(circle_at_85%_15%,color-mix(in_srgb,var(--color-primary)_9%,transparent),transparent_30%)]
                  "
                />

                <div className="relative p-5 sm:p-7 lg:p-8">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className={`
                          flex h-14 w-14 shrink-0
                          items-center justify-center
                          rounded-2xl
                          ${themePrimaryGradient}
                          text-[var(--color-card)]
                          ${themePrimaryShadow}
                          sm:h-16 sm:w-16
                        `}
                      >
                        <Layers3
                          size={27}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="theme-text text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                            Pengelolaan Lantai
                          </h1>

                          <span
                            className={`
                              ${themePrimarySoft}
                              ${themePrimaryBorder}
                              ${themePrimaryText}
                              inline-flex items-center gap-1.5
                              rounded-full border
                              px-3 py-1
                              text-[10px] font-bold
                              uppercase tracking-wide
                            `}
                          >
                            <span
                              className="
                                h-1.5 w-1.5 rounded-full
                                bg-[var(--color-primary)]
                              "
                            />

                            Sarana & Prasarana
                          </span>
                        </div>

                        <p className="theme-text-secondary mt-2 max-w-2xl text-sm leading-6">
                          Kelola struktur lantai sekolah
                          berdasarkan gedung, pantau
                          penggunaan kelas, dan
                          lakukan pengelolaan data
                          secara terpusat.
                        </p>

                        <div className="theme-text-muted mt-3 flex flex-wrap items-center gap-3 text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <Database size={13} />
                            Terhubung ke database
                          </span>

                          <span
                            className="
                              h-1 w-1 rounded-full
                              bg-[color-mix(in_srgb,var(--color-text)_18%,transparent)]
                            "
                          />

                          <span className="inline-flex items-center gap-1.5">
                            <LayoutGrid size={13} />
                            {data.length} lantai
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      {/* EXPORT */}

                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowExport(!showExport)
                          }
                          disabled={
                            sortedData.length === 0
                          }
                          className={`
                            theme-card
                            theme-text-secondary
                            inline-flex h-11
                            items-center justify-center
                            gap-2 rounded-xl
                            border theme-border
                            px-4
                            text-sm font-semibold
                            transition
                            ${themeNeutralHover}
                            ${themeNeutralBorderHover}
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          `}
                        >
                          <Download size={16} />
                          Export
                        </button>

                        {showExport && (
                          <div
                            className="
                              theme-card
                              absolute right-0 top-13 z-50
                              w-52 overflow-hidden
                              rounded-2xl
                              border theme-border
                              p-1.5
                              shadow-[0_15px_45px_color-mix(in_srgb,var(--color-text)_14%,transparent)]
                            "
                          >
                            <button
                              onClick={exportExcel}
                              className={`
                                theme-text-secondary
                                flex w-full items-center gap-3
                                rounded-xl px-3 py-2.5
                                text-sm font-medium
                                transition
                                ${themeNeutralHover}
                              `}
                            >
                              <FileSpreadsheet
                                size={16}
                                className="theme-success"
                              />
                              Export Excel
                            </button>

                            <button
                              onClick={exportCSV}
                              className={`
                                theme-text-secondary
                                flex w-full items-center gap-3
                                rounded-xl px-3 py-2.5
                                text-sm font-medium
                                transition
                                ${themeNeutralHover}
                              `}
                            >
                              <FileSpreadsheet
                                size={16}
                                className={themePrimaryText}
                              />
                              Export CSV
                            </button>
                          </div>
                        )}
                      </div>

                      {/* REFRESH */}

                      <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className={`
                          theme-card
                          theme-text-secondary
                          inline-flex h-11 w-11
                          items-center justify-center
                          rounded-xl
                          border theme-border
                          transition
                          ${themeNeutralHover}
                          ${themeNeutralBorderHover}
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        `}
                        title="Refresh"
                      >
                        <RefreshCw
                          size={17}
                          className={
                            loading
                              ? "animate-spin"
                              : ""
                          }
                        />
                      </button>

                      {/* ADD */}

                      <button
                        onClick={handleAdd}
                        className={`
                          inline-flex h-11
                          items-center justify-center
                          gap-2
                          rounded-xl
                          px-5
                          text-sm font-semibold
                          text-[var(--color-card)]
                          ${themePrimaryGradient}
                          ${themePrimaryShadow}
                          ${themePrimaryButtonHover}
                          transition
                          active:scale-[0.98]
                        `}
                      >
                        <Plus
                          size={17}
                          strokeWidth={2.4}
                        />
                        Tambah Lantai
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <StatCard
                  icon={Layers3}
                  label="Total Lantai"
                  value={data.length}
                  description="Seluruh lantai sekolah"
                  iconClass={`${themePrimarySoft} ${themePrimaryText}`}
                  valueClass="theme-text"
                />

                <StatCard
                  icon={Building2}
                  label="Gedung Terpakai"
                  value={totalGedungTerpakai}
                  description="Gedung memiliki lantai"
                  iconClass="bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)] text-[var(--color-info)]"
                  valueClass="text-[var(--color-info)]"
                />

                <div className="hidden lg:block">
                  <StatCard
                    icon={LayoutGrid}
                    label="Total Kelas"
                    value={totalKelas}
                    description="Kelas pada lantai"
                    iconClass="bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]"
                    valueClass="theme-success"
                  />
                </div>
              </div>

              {/* =================================================
                  FILTER
              ================================================= */}

              <section
                className={`
                  theme-card
                  rounded-2xl border theme-border
                  p-4 sm:p-5
                  ${themeCardShadow}
                `}
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        flex h-9 w-9
                        items-center justify-center
                        rounded-xl
                        ${themePrimarySoft}
                        ${themePrimaryText}
                      `}
                    >
                      <Filter size={16} />
                    </div>

                    <div>
                      <p className="theme-text text-sm font-bold">
                        Filter & Pencarian
                      </p>

                      <p className="theme-text-muted text-xs">
                        Temukan data lantai dengan cepat
                      </p>
                    </div>
                  </div>

                  {(search || selectedGedung) && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setSelectedGedung("");
                        setSortBy("nama_asc");
                        setCurrentPage(1);
                        fetchLantai("");
                      }}
                      className={`
                        ${themePrimaryText}
                        inline-flex items-center
                        gap-1.5
                        text-xs font-semibold
                        transition
                        hover:opacity-80
                      `}
                    >
                      <X size={14} />
                      Reset filter
                    </button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                  {/* SEARCH */}

                  <div className="relative">
                    <Search
                      size={16}
                      className="
                        theme-text-muted
                        absolute left-3.5 top-1/2
                        -translate-y-1/2
                      "
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari nama lantai..."
                      className={`
                        theme-input
                        theme-text
                        h-11 w-full
                        rounded-xl
                        border theme-border
                        pl-10 pr-3
                        text-sm
                        outline-none
                        transition
                        placeholder:theme-text-placeholder
                        ${themeFocus}
                      `}
                    />
                  </div>

                  {/* GEDUNG */}

                  <select
                    value={selectedGedung}
                    onChange={(e) =>
                      handleGedungChange(
                        e.target.value
                      )
                    }
                    disabled={loadingGedung}
                    className={`
                      theme-input
                      theme-text
                      h-11 w-full
                      rounded-xl
                      border theme-border
                      px-3
                      text-sm
                      outline-none
                      transition
                      ${themeFocus}
                      disabled:opacity-60
                    `}
                  >
                    <option value="">
                      {loadingGedung
                        ? "Memuat gedung..."
                        : "Semua Gedung"}
                    </option>

                    {gedungList.map((gedung) => (
                      <option
                        key={gedung.id}
                        value={gedung.id}
                      >
                        {gedung.nama}
                        {gedung.kode
                          ? ` (${gedung.kode})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {/* SORT */}

                  <div className="relative">
                    <ArrowUpDown
                      size={15}
                      className="
                        theme-text-muted
                        pointer-events-none
                        absolute left-3.5 top-1/2
                        -translate-y-1/2
                      "
                    />

                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value
                        )
                      }
                      className={`
                        theme-input
                        theme-text
                        h-11 w-full
                        appearance-none
                        rounded-xl
                        border theme-border
                        pl-10 pr-3
                        text-sm
                        outline-none
                        transition
                        ${themeFocus}
                      `}
                    >
                      <option value="nama_asc">
                        Nama A-Z
                      </option>

                      <option value="nama_desc">
                        Nama Z-A
                      </option>

                      <option value="gedung_asc">
                        Gedung A-Z
                      </option>

                      <option value="gedung_desc">
                        Gedung Z-A
                      </option>

                      <option value="tanggal_desc">
                        Terbaru
                      </option>

                      <option value="tanggal_asc">
                        Terlama
                      </option>
                    </select>
                  </div>

                  {/* TOTAL */}

                  <div
                    className={`
                      flex h-11
                      items-center justify-between
                      rounded-xl
                      border theme-border
                      ${themeSoftSurface}
                      px-4
                    `}
                  >
                    <span className="theme-text-muted text-xs font-medium">
                      Data ditemukan
                    </span>

                    <span className="theme-text text-sm font-bold">
                      {totalItems}
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================================
                  TABLE
              ================================================= */}

              <section
                className={`
                  theme-card
                  overflow-hidden
                  rounded-2xl
                  border theme-border
                  ${themeCardShadow}
                `}
              >
                <div className="flex flex-col gap-2 border-b theme-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="theme-text text-sm font-bold">
                        Daftar Lantai
                      </h2>

                      <span
                        className={`
                          ${themeSoftSurface}
                          theme-text-muted
                          rounded-full
                          px-2 py-0.5
                          text-[10px] font-bold
                        `}
                      >
                        {totalItems}
                      </span>
                    </div>

                    <p className="theme-text-muted mt-0.5 text-xs">
                      Data aktual dari database sekolah
                    </p>
                  </div>

                  <div className="theme-text-muted flex items-center gap-2 text-xs">
                    <Database size={13} />
                    Live database
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                      <tr
                        className={`
                          border-b theme-border
                          ${themeSoftSurface}
                        `}
                      >
                        <th className="theme-text-muted w-16 px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em]">
                          No
                        </th>

                        <th className="theme-text-muted min-w-[240px] px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em]">
                          Lantai
                        </th>

                        <th className="theme-text-muted min-w-[200px] px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em]">
                          Gedung
                        </th>

                        <th className="theme-text-muted w-40 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em]">
                          Kelas
                        </th>

                        <th className="theme-text-muted w-44 px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em]">
                          Dibuat
                        </th>

                        <th className="theme-text-muted w-36 px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em]">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">

                      {/* LOADING */}

                      {loading && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-20 text-center"
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className={`
                                  flex h-12 w-12
                                  items-center justify-center
                                  rounded-2xl
                                  ${themePrimarySoft}
                                `}
                              >
                                <RefreshCw
                                  size={22}
                                  className={`
                                    animate-spin
                                    ${themePrimaryText}
                                  `}
                                />
                              </div>

                              <p className="theme-text mt-4 text-sm font-semibold">
                                Memuat data lantai
                              </p>

                              <p className="theme-text-muted mt-1 text-xs">
                                Mengambil data terbaru
                                dari server...
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* DATA */}

                      {!loading &&
                        currentItems.map(
                          (item, index) => {
                            const rowNumber =
                              startIndex +
                              index +
                              1;

                            const jumlahKelas =
                              Array.isArray(
                                item.kelas
                              )
                                ? item.kelas.length
                                : 0;

                            return (
                              <tr
                                key={item.id}
                                className={`
                                  group
                                  transition-colors
                                  ${themeNeutralHover}
                                `}
                              >
                                <td className="theme-text-muted px-4 py-4 text-center text-xs font-medium">
                                  {rowNumber}
                                </td>

                                {/* LANTAI */}

                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`
                                        flex h-10 w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        ${themePrimarySoft}
                                        ${themePrimaryText}
                                        transition
                                        ${themePrimarySoftHover}
                                      `}
                                    >
                                      <Layers3 size={18} />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="theme-text truncate text-sm font-bold">
                                        {item.nama || "-"}
                                      </p>

                                      <p className="theme-text-muted mt-0.5 truncate text-[10px] font-medium">
                                        ID: {item.id}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* GEDUNG */}

                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={`
                                        flex h-8 w-8
                                        items-center
                                        justify-center
                                        rounded-lg
                                        ${themeSoftSurface}
                                        theme-text-muted
                                      `}
                                    >
                                      <Building2 size={15} />
                                    </div>

                                    <div>
                                      <p className="theme-text-secondary text-sm font-semibold">
                                        {item.gedung?.nama ||
                                          "-"}
                                      </p>

                                      {item.gedung?.kode && (
                                        <p className="theme-text-muted text-[10px]">
                                          {item.gedung.kode}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* KELAS */}

                                <td className="px-4 py-4">
                                  <button
                                    onClick={() =>
                                      handleDetail(
                                        item.id
                                      )
                                    }
                                    className={`
                                      ${themeSoftSurface}
                                      theme-text-secondary
                                      inline-flex items-center
                                      gap-2 rounded-lg
                                      px-2.5 py-1.5
                                      text-xs font-semibold
                                      transition
                                      ${themePrimarySoftHover}
                                      hover:text-[var(--color-primary)]
                                    `}
                                  >
                                    <LayoutGrid size={14} />

                                    {jumlahKelas} Kelas
                                  </button>
                                </td>

                                {/* CREATED */}

                                <td className="px-4 py-4">
                                  <span className="theme-text-secondary text-xs font-medium">
                                    {item.dibuatPada
                                      ? new Date(
                                          item.dibuatPada
                                        ).toLocaleDateString(
                                          "id-ID",
                                          {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          }
                                        )
                                      : "-"}
                                  </span>
                                </td>

                                {/* ACTION */}

                                <td className="px-4 py-4">
                                  <div className="flex items-center justify-center gap-1">

                                    {/* DETAIL */}

                                    <button
                                      onClick={() =>
                                        handleDetail(
                                          item.id
                                        )
                                      }
                                      className={`
                                        theme-text-muted
                                        flex h-8 w-8
                                        items-center
                                        justify-center
                                        rounded-lg
                                        transition
                                        ${themePrimarySoftHover}
                                        hover:text-[var(--color-primary)]
                                      `}
                                      title="Detail"
                                    >
                                      <Eye size={16} />
                                    </button>

                                    {/* EDIT */}

                                    <button
                                      onClick={() =>
                                        handleEdit(
                                          item.id
                                        )
                                      }
                                      className="
                                        theme-text-muted
                                        flex h-8 w-8
                                        items-center
                                        justify-center
                                        rounded-lg
                                        transition
                                        hover:bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]
                                        hover:text-[var(--color-warning)]
                                      "
                                      title="Edit"
                                    >
                                      <Pencil size={16} />
                                    </button>

                                    {/* DELETE */}

                                    <button
                                      onClick={() =>
                                        handleDelete(
                                          item.id,
                                          item.nama
                                        )
                                      }
                                      disabled={
                                        deletingId ===
                                        item.id
                                      }
                                      className="
                                        theme-text-muted
                                        flex h-8 w-8
                                        items-center
                                        justify-center
                                        rounded-lg
                                        transition
                                        hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]
                                        hover:text-[var(--color-text)]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                      "
                                      title="Hapus"
                                    >
                                      {deletingId ===
                                      item.id ? (
                                        <RefreshCw
                                          size={15}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Trash2 size={16} />
                                      )}
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

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                  currentItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
                      <div
                        className={`
                          flex h-16 w-16
                          items-center justify-center
                          rounded-2xl
                          ${themeSoftSurface}
                          theme-text-muted
                        `}
                      >
                        <Layers3 size={27} />
                      </div>

                      <h3 className="theme-text mt-4 text-sm font-bold">
                        Belum ada data lantai
                      </h3>

                      <p className="theme-text-muted mt-1 max-w-sm text-xs leading-5">
                        {search || selectedGedung
                          ? "Tidak ditemukan data yang sesuai dengan filter."
                          : "Belum terdapat data lantai pada sekolah ini."}
                      </p>

                      {!search &&
                        !selectedGedung && (
                          <button
                            onClick={handleAdd}
                            className={`
                              mt-5
                              inline-flex
                              items-center gap-2
                              rounded-xl
                              px-4 py-2.5
                              text-xs font-semibold
                              text-[var(--color-card)]
                              ${themePrimaryGradient}
                              transition
                              ${themePrimaryButtonHover}
                            `}
                          >
                            <Plus size={14} />
                            Tambah Lantai
                          </button>
                        )}
                    </div>
                  )}

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {!loading &&
                  totalItems > 0 && (
                    <div className="flex flex-col gap-3 border-t theme-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                      <div className="theme-text-secondary flex flex-wrap items-center gap-3 text-xs">
                        <span>
                          Menampilkan{" "}
                          <b className="theme-text">
                            {startIndex + 1}
                          </b>{" "}
                          -{" "}
                          <b className="theme-text">
                            {endIndex}
                          </b>{" "}
                          dari{" "}
                          <b className="theme-text">
                            {totalItems}
                          </b>
                        </span>

                        <span
                          className="
                            hidden h-4 w-px
                            bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                            sm:block
                          "
                        />

                        <label className="flex items-center gap-2">
                          <span>
                            Tampilkan
                          </span>

                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(
                                Number(
                                  e.target.value
                                )
                              );
                              setCurrentPage(1);
                            }}
                            className={`
                              theme-input
                              theme-text
                              h-8 rounded-lg
                              border theme-border
                              px-2
                              text-xs font-semibold
                              outline-none
                              ${themeFocus}
                            `}
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
                            goToPage(1)
                          }
                          disabled={safePage === 1}
                          className={`
                            theme-text-muted
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            transition
                            ${themeNeutralHover}
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                          `}
                        >
                          <ChevronsLeft size={14} />
                        </button>

                        {/* PREVIOUS */}

                        <button
                          onClick={() =>
                            goToPage(
                              safePage - 1
                            )
                          }
                          disabled={safePage === 1}
                          className={`
                            theme-text-muted
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            transition
                            ${themeNeutralHover}
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                          `}
                        >
                          <ChevronLeft size={14} />
                        </button>

                        {/* PAGE NUMBERS */}

                        {getPageNumbers().map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() =>
                                goToPage(page)
                              }
                              className={`
                                flex h-8 min-w-8
                                items-center justify-center
                                rounded-lg
                                px-2
                                text-xs font-bold
                                transition
                                ${
                                  safePage === page
                                    ? `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`
                                    : `theme-text-secondary ${themeNeutralHover}`
                                }
                              `}
                            >
                              {page}
                            </button>
                          )
                        )}

                        {/* NEXT */}

                        <button
                          onClick={() =>
                            goToPage(
                              safePage + 1
                            )
                          }
                          disabled={
                            safePage ===
                            totalPages
                          }
                          className={`
                            theme-text-muted
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            transition
                            ${themeNeutralHover}
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                          `}
                        >
                          <ChevronRight size={14} />
                        </button>

                        {/* LAST */}

                        <button
                          onClick={() =>
                            goToPage(totalPages)
                          }
                          disabled={
                            safePage ===
                            totalPages
                          }
                          className={`
                            theme-text-muted
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            transition
                            ${themeNeutralHover}
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                          `}
                        >
                          <ChevronsRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
              </section>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="border-t theme-border py-2 text-center">
                <p className="theme-text-muted text-[11px]">
                  © 2026 SmartSchool • Pengelolaan Lantai •
                  Sarana & Prasarana
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}