"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

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
} from "../../../../services/infrastruktur.service";

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
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500">
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
      <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center justify-center text-slate-400">
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
    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
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

            /*
             * Backend Prisma menggunakan:
             * fotoGedung
             *
             * fotoUrl dijadikan fallback supaya
             * response lama tetap bisa dibaca.
             */
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
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /'/g,
          "&#039;"
        );
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
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
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

              {/* HEADER */}

              <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-50/70 blur-3xl" />

                <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">

                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] sm:h-14 sm:w-14">
                      <Building
                        size={22}
                        strokeWidth={1.9}
                        className="sm:h-[25px] sm:w-[25px]"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl lg:text-[26px]">
                          Pengelolaan Gedung
                        </h1>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 sm:px-3 sm:py-1 sm:text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Sarana & Prasarana
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                        <Layers
                          size={13}
                          className="shrink-0 text-blue-400 sm:h-[14px] sm:w-[14px]"
                          strokeWidth={2}
                        />

                        <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                          Kelola data gedung dan lantai sekolah.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:flex-row lg:w-auto">

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
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-5"
                      >
                        <Download size={16} />
                        Export
                      </button>

                      {showExport && (
                        <div className="absolute right-0 top-12 z-40 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-[0_10px_40px_rgba(15,23,42,0.12)]">

                          <button
                            onClick={
                              exportExcel
                            }
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <FileSpreadsheet
                              size={16}
                              className="text-emerald-600"
                            />

                            Export Excel
                          </button>

                          <button
                            onClick={
                              exportCSV
                            }
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <FileSpreadsheet
                              size={16}
                              className="text-blue-600"
                            />

                            Export CSV
                          </button>

                        </div>
                      )}
                    </div>

                    <button
                      onClick={
                        handleRefresh
                      }
                      disabled={loading}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
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

                    <button
                      onClick={
                        handleAdd
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.16)] transition-all hover:bg-slate-800 hover:shadow-[0_9px_22px_rgba(15,23,42,0.20)] active:scale-[0.98] sm:h-11 sm:px-5"
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

              {/* ERROR */}

              {error && (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* STATS */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                <StatCard
                  icon={Building}
                  label="Total Gedung"
                  value={
                    data.length
                  }
                  description="Seluruh gedung"
                  iconClass="bg-blue-50 text-blue-600"
                  valueClass="text-slate-800"
                />

                <StatCard
                  icon={Layers}
                  label="Total Lantai"
                  value={
                    totalLantai
                  }
                  description="Seluruh lantai"
                  iconClass="bg-indigo-50 text-indigo-600"
                  valueClass="text-indigo-700"
                />

                <StatCard
                  icon={ImageIcon}
                  label="Gedung Berfoto"
                  value={
                    totalFoto
                  }
                  description="Memiliki URL foto"
                  iconClass="bg-emerald-50 text-emerald-600"
                  valueClass="text-emerald-700"
                />

              </div>

              {/* SEARCH */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-5">

                <div className="mb-4 flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 sm:h-9 sm:w-9">
                    <Filter
                      size={14}
                      className="sm:h-[16px] sm:w-[16px]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Filter & Pencarian
                    </p>

                    <p className="text-xs text-slate-400">
                      Cari dan urutkan data gedung
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none transition-all hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                  <button
                    onClick={() => {
                      setSearch("");
                      setSortBy(
                        "nama_asc"
                      );
                    }}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                  >
                    Reset
                  </button>

                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-600">
                      {totalItems}
                    </span>{" "}
                    data gedung
                  </p>
                </div>

              </section>

              {/* TABLE */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.05)]">

                <div className="border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Daftar Gedung
                      </h2>

                      <p className="text-xs text-slate-500">
                        Data gedung sekolah dari database
                      </p>
                    </div>

                    <div className="text-xs text-slate-500">
                      {totalItems} data
                    </div>

                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse">

                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">

                        <th className="w-14 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          No
                        </th>

                        <th className="w-28 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Foto
                        </th>

                        <th className="min-w-[250px] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Nama Gedung
                        </th>

                        <th className="w-28 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Kode
                        </th>

                        <th className="w-32 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Lantai
                        </th>

                        <th className="w-32 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          Aksi
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {loading && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-16 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">

                              <RefreshCw
                                size={24}
                                className="animate-spin text-blue-500"
                              />

                              <p className="mt-3 text-sm font-medium text-slate-600">
                                Memuat data gedung...
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Mengambil data dari server
                              </p>

                            </div>
                          </td>
                        </tr>
                      )}

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

                            /*
                             * Backend:
                             * fotoGedung
                             *
                             * fallback:
                             * fotoUrl
                             */
                            const fotoGedung =
                              item?.fotoGedung ??
                              item?.fotoUrl ??
                              "";

                            return (
                              <tr
                                key={
                                  item.id
                                }
                                className="group transition-colors hover:bg-blue-50/30"
                              >

                                <td className="px-4 py-3.5 text-center text-sm text-slate-400">
                                  {rowNumber}
                                </td>

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

                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                                        className="block max-w-[320px] truncate text-left text-sm font-semibold text-slate-800 transition hover:text-blue-600"
                                      >
                                        {item?.nama ||
                                          "-"}
                                      </button>

                                      <p className="max-w-[320px] truncate text-xs text-slate-400">
                                        ID #
                                        {item?.id}
                                      </p>

                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3.5">
                                  {item?.kode ? (
                                    <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                                      {
                                        item.kode
                                      }
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      -
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-3.5">
                                  <button
                                    onClick={() =>
                                      handleDetail(
                                        item.id
                                      )
                                    }
                                    className="flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-blue-600"
                                    title="Lihat lantai"
                                  >
                                    <Layers
                                      size={
                                        15
                                      }
                                      className="text-slate-400"
                                    />

                                    {
                                      jumlahLantai
                                    }{" "}
                                    Lantai
                                  </button>
                                </td>

                                <td className="px-4 py-3.5">
                                  <div className="flex items-center justify-center gap-1">

                                    <button
                                      onClick={() =>
                                        handleDetail(
                                          item.id
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                                      title="Detail"
                                    >
                                      <Eye
                                        size={
                                          16
                                        }
                                      />
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleEdit(
                                          item.id
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600"
                                      title="Edit"
                                    >
                                      <Edit
                                        size={
                                          16
                                        }
                                      />
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleDelete(
                                          item.id,
                                          item.nama
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
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

                {!loading &&
                  currentItems.length ===
                    0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Building
                          size={24}
                        />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-slate-700">
                        Tidak ada data
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {search
                          ? "Tidak ditemukan gedung yang sesuai dengan pencarian."
                          : "Belum ada data gedung."}
                      </p>

                      {!search && (
                        <button
                          onClick={
                            handleAdd
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          <Plus
                            size={14}
                          />
                          Tambah Gedung
                        </button>
                      )}

                    </div>
                  )}

                {!loading &&
                  totalItems > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">

                        <span>
                          Menampilkan{" "}
                          <span className="font-semibold text-slate-700">
                            {startIndex +
                              1}
                          </span>{" "}
                          -{" "}
                          <span className="font-semibold text-slate-700">
                            {endIndex}
                          </span>{" "}
                          dari{" "}
                          <span className="font-semibold text-slate-700">
                            {
                              totalItems
                            }
                          </span>{" "}
                          data
                        </span>

                        <div className="hidden h-4 w-px bg-slate-300 sm:block" />

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
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-slate-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronsLeft
                            size={14}
                          />
                        </button>

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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-slate-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft
                            size={14}
                          />
                        </button>

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
                                  ? "bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {
                                page
                              }
                            </button>
                          )
                        )}

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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-slate-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRight
                            size={14}
                          />
                        </button>

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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-slate-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronsRight
                            size={14}
                          />
                        </button>

                      </div>
                    </div>
                  )}

              </section>

              <footer className="border-t border-slate-200/70 pt-4 text-center sm:pt-5">
                <p className="text-xs text-slate-400">
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