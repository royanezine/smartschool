"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  User,
  Upload,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getUsers,
  deleteUser,
} from "../../../services/user.service";

/**
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function AdminGuruPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // DATA ASLI DARI API
  const [guru, setGuru] = useState([]);

  // LOADING
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ERROR
  const [error, setError] = useState("");

  // FILTER
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  // SORT
  const [sortBy, setSortBy] = useState("namaLengkap");
  const [sortOrder, setSortOrder] = useState("asc");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // SERVER PAGINATION
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 0,
  });

  // MODAL
  const [showModal, setShowModal] = useState(false);

  /**
   * =======================================================
   * FETCH DATA GURU
   * =======================================================
   */

  const fetchGuru = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const response = await getUsers({
          page: currentPage,
          limit: itemsPerPage,
          search: search.trim(),
          status: filterStatus,
          role: "guru",
          sortBy,
          sortOrder,
        });

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Gagal mengambil data guru."
          );
        }

        setGuru(
          Array.isArray(response.data)
            ? response.data
            : []
        );

        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination({
            page: currentPage,
            limit: itemsPerPage,
            totalData: response.data?.length || 0,
            totalPages: 1,
          });
        }
      } catch (err) {
        console.error(
          "[browser] Error fetch guru:",
          err
        );

        setGuru([]);

        setError(
          err?.message ||
            "Gagal mengambil data guru."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [
      currentPage,
      itemsPerPage,
      search,
      filterStatus,
      sortBy,
      sortOrder,
    ]
  );

  /**
   * =======================================================
   * LOAD DATA
   * =======================================================
   */

  useEffect(() => {
    fetchGuru();
  }, [fetchGuru]);

  /**
   * =======================================================
   * REFRESH
   * =======================================================
   */

  const handleRefresh = async () => {
    await fetchGuru();
  };

  /**
   * =======================================================
   * SEARCH
   * =======================================================
   */

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  /**
   * =======================================================
   * FILTER STATUS
   * =======================================================
   */

  const handleStatusChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  /**
   * =======================================================
   * SORT
   * =======================================================
   */

  const handleSortChange = (value) => {
    setCurrentPage(1);

    if (value === "nama_asc") {
      setSortBy("namaLengkap");
      setSortOrder("asc");
      return;
    }

    if (value === "nama_desc") {
      setSortBy("namaLengkap");
      setSortOrder("desc");
      return;
    }

    if (value === "nip_asc") {
      setSortBy("nip");
      setSortOrder("asc");
      return;
    }

    if (value === "nip_desc") {
      setSortBy("nip");
      setSortOrder("desc");
      return;
    }

    if (value === "status_asc") {
      setSortBy("status");
      setSortOrder("asc");
      return;
    }

    if (value === "status_desc") {
      setSortBy("status");
      setSortOrder("desc");
    }
  };

  const sortValue = useMemo(() => {
    if (
      sortBy === "namaLengkap" &&
      sortOrder === "asc"
    ) {
      return "nama_asc";
    }

    if (
      sortBy === "namaLengkap" &&
      sortOrder === "desc"
    ) {
      return "nama_desc";
    }

    if (
      sortBy === "nip" &&
      sortOrder === "asc"
    ) {
      return "nip_asc";
    }

    if (
      sortBy === "nip" &&
      sortOrder === "desc"
    ) {
      return "nip_desc";
    }

    if (
      sortBy === "status" &&
      sortOrder === "asc"
    ) {
      return "status_asc";
    }

    return "status_desc";
  }, [sortBy, sortOrder]);

  /**
   * =======================================================
   * DELETE
   * =======================================================
   */

  const handleDelete = async (id, nama) => {
    if (!id) return;

    const confirmed = window.confirm(
      `Yakin ingin menonaktifkan guru "${nama}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await deleteUser(id);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal menghapus guru."
        );
      }

      // Jika halaman terakhir hanya berisi 1 data,
      // kembali ke halaman sebelumnya.
      if (
        guru.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage(
          currentPage - 1
        );
      } else {
        await fetchGuru(false);
      }

      window.alert(
        response.message ||
          `Guru "${nama}" berhasil dinonaktifkan.`
      );
    } catch (err) {
      console.error(
        "Error delete guru:",
        err
      );

      window.alert(
        err?.message ||
          "Gagal menonaktifkan guru."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * =======================================================
   * PAGINATION
   * =======================================================
   */

  const totalPages =
    pagination?.totalPages || 0;

  const totalData =
    pagination?.totalData || 0;

  const startIndex =
    totalData === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const endIndex =
    totalData === 0
      ? 0
      : Math.min(
          currentPage *
            itemsPerPage,
          totalData
        );

  const goToPage = (page) => {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 0) {
      return [];
    }

    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (
      currentPage >=
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
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }, [currentPage, totalPages]);

  /**
   * =======================================================
   * STATISTICS
   * =======================================================
   *
   * Karena endpoint /users sekarang menggunakan pagination,
   * statistik total dihitung dari totalData.
   *
   * Untuk Aktif/Nonaktif secara keseluruhan, backend saat ini
   * belum menyediakan endpoint statistik khusus.
   *
   * Jadi kita TIDAK membuat angka dummy.
   */

  const totalGuru = totalData;

  const totalAktif =
    guru.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() === "aktif"
    ).length;

  const totalNonaktif =
    guru.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() !== "aktif"
    ).length;

  const totalMapel = "-";

  /**
   * =======================================================
   * INITIALS
   * =======================================================
   */

  const getInitials = (nama) => {
    if (!nama) return "GU";

    const cleanName = String(nama)
      .replace(/,.*$/, "")
      .trim();

    const parts = cleanName
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return cleanName
      .substring(0, 2)
      .toUpperCase();
  };

  /**
   * =======================================================
   * AVATAR
   * =======================================================
   */

  const getAvatarColor = (nama = "") => {
    const colors = [
      "bg-blue-600",
      "bg-indigo-600",
      "bg-sky-600",
      "bg-violet-600",
      "bg-cyan-600",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-slate-600",
    ];

    return colors[
      nama.length %
        colors.length
    ];
  };

  /**
   * =======================================================
   * STATUS
   * =======================================================
   */

  const normalizeStatus = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (
      value === "aktif" ||
      value === "active"
    ) {
      return "Aktif";
    }

    return "Nonaktif";
  };

  /**
   * =======================================================
   * EXPORT CSV
   * =======================================================
   *
   * Export berdasarkan data yang sedang tampil.
   * Tidak membuat data dummy.
   */

  const exportCSV = () => {
    if (!guru.length) {
      window.alert(
        "Tidak ada data guru untuk diekspor."
      );
      return;
    }

    const headers = [
      "No",
      "Nama",
      "Username",
      "NIP",
      "NUPTK",
      "Email",
      "Telepon",
      "Status",
      "Jabatan",
      "Golongan",
      "Jenis Kelamin",
      "Sekolah",
    ];

    const rows = guru.map(
      (item, index) => [
        startIndex + index,
        item.namaLengkap || "",
        item.namaPengguna || "",
        item.nip || "",
        item.nuptk || "",
        item.email || "",
        "",
        normalizeStatus(
          item.status
        ),
        item.jabatan || "",
        item.golongan || "",
        item.jenisKelamin || "",
        item.sekolah?.nama || "",
      ]
    );

    const escapeCSV = (value) => {
      return `"${String(
        value ?? ""
      ).replace(/"/g, '""')}"`;
    };

    const csv =
      [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map(escapeCSV)
            .join(",")
        )
        .join("\n") +
      "\n";

    const blob = new Blob(
      ["\ufeff", csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `data_guru_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  /**
   * =======================================================
   * EXPORT EXCEL
   * =======================================================
   */

  const exportExcel = () => {
    if (!guru.length) {
      window.alert(
        "Tidak ada data guru untuk diekspor."
      );
      return;
    }

    const headers = [
      "No",
      "Nama",
      "Username",
      "NIP",
      "NUPTK",
      "Email",
      "Status",
      "Jabatan",
      "Golongan",
      "Jenis Kelamin",
      "Sekolah",
    ];

    let html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table {
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #cccccc;
              padding: 8px;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }

            th {
              background: #2563eb;
              color: white;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <h2>Data Guru SmartSchool</h2>

          <table>
            <thead>
              <tr>
                ${headers
                  .map(
                    (header) =>
                      `<th>${header}</th>`
                  )
                  .join("")}
              </tr>
            </thead>

            <tbody>
    `;

    guru.forEach(
      (item, index) => {
        html += `
          <tr>
            <td>${startIndex + index}</td>
            <td>${item.namaLengkap || ""}</td>
            <td>${item.namaPengguna || ""}</td>
            <td>${item.nip || ""}</td>
            <td>${item.nuptk || ""}</td>
            <td>${item.email || ""}</td>
            <td>${normalizeStatus(
              item.status
            )}</td>
            <td>${item.jabatan || ""}</td>
            <td>${item.golongan || ""}</td>
            <td>${item.jenisKelamin || ""}</td>
            <td>${item.sekolah?.nama || ""}</td>
          </tr>
        `;
      }
    );

    html += `
            </tbody>
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

    link.download = `data_guru_${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  /**
   * =======================================================
   * PRINT / PDF
   * =======================================================
   */

  const exportPDF = () => {
    if (!guru.length) {
      window.alert(
        "Tidak ada data guru untuk dicetak."
      );
      return;
    }

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1200,height=800"
      );

    if (!printWindow) {
      window.alert(
        "Mohon izinkan popup pada browser untuk mencetak."
      );
      return;
    }

    let rows = "";

    guru.forEach(
      (item, index) => {
        rows += `
          <tr>
            <td>${startIndex + index}</td>
            <td>${item.namaLengkap || "-"}</td>
            <td>${item.nip || "-"}</td>
            <td>${item.nuptk || "-"}</td>
            <td>${item.email || "-"}</td>
            <td>${normalizeStatus(
              item.status
            )}</td>
          </tr>
        `;
      }
    );

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">

          <title>Data Guru SmartSchool</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #0f172a;
            }

            h1 {
              margin: 0 0 6px;
              font-size: 22px;
            }

            p {
              margin: 0 0 20px;
              color: #64748b;
              font-size: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th {
              background: #2563eb;
              color: white;
              padding: 8px;
              text-align: left;
            }

            td {
              border: 1px solid #cbd5e1;
              padding: 7px 8px;
            }

            tr:nth-child(even) {
              background: #f8fafc;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <h1>Data Guru</h1>

          <p>
            SmartSchool •
            Total data: ${totalData} guru •
            ${new Date().toLocaleDateString(
              "id-ID"
            )}
          </p>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIP</th>
                <th>NUPTK</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="guru"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* CONTENT */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              !isCollapsed
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                    <Users size={21} />
                  </div>

                  <div>
                    <h1 className="text-xl font-semibold text-slate-800">
                      Data Guru
                    </h1>

                    <p className="text-sm text-slate-600">
                      Data induk tenaga pendidik
                    </p>
                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-2">

                  {/* EXPORT */}

                  <div className="relative group">

                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all text-sm font-medium"
                    >
                      <Download size={17} />

                      <span>
                        Export
                      </span>
                    </button>

                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-300 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">

                      <button
                        type="button"
                        onClick={exportPDF}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-t-xl"
                      >
                        <Printer size={16} />
                        PDF / Print
                      </button>

                      <button
                        type="button"
                        onClick={exportExcel}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FileSpreadsheet size={16} />
                        Excel
                      </button>

                      <button
                        type="button"
                        onClick={exportCSV}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-b-xl"
                      >
                        <FileText size={16} />
                        CSV
                      </button>

                    </div>
                  </div>

                  {/* REFRESH */}

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-all"
                    title="Refresh data"
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
                    type="button"
                    onClick={() =>
                      setShowModal(true)
                    }
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-blue-200 font-medium"
                  >
                    <Plus size={18} />
                    Tambah Guru
                  </button>

                </div>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50">

                  <AlertCircle
                    size={20}
                    className="text-rose-600 mt-0.5 shrink-0"
                  />

                  <div className="flex-1">

                    <p className="text-sm font-semibold text-rose-800">
                      Gagal mengambil data guru
                    </p>

                    <p className="text-sm text-rose-700 mt-1">
                      {error}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="text-sm font-medium text-rose-700 hover:text-rose-900"
                  >
                    Coba lagi
                  </button>

                </div>
              )}

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {/* TOTAL */}

                <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm">

                  <div className="flex items-center gap-2">

                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                      <Users size={16} />
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Total Guru
                    </p>

                  </div>

                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {loading
                      ? "—"
                      : totalGuru}
                  </p>

                </div>

                {/* AKTIF */}

                <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm">

                  <div className="flex items-center gap-2">

                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle size={16} />
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Aktif
                    </p>

                  </div>

                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {loading
                      ? "—"
                      : totalAktif}
                  </p>

                </div>

                {/* NONAKTIF */}

                <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm">

                  <div className="flex items-center gap-2">

                    <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                      <XCircle size={16} />
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Nonaktif
                    </p>

                  </div>

                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {loading
                      ? "—"
                      : totalNonaktif}
                  </p>

                  {!loading &&
                    totalGuru >
                      guru.length && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        dari halaman aktif
                      </p>
                    )}

                </div>

                {/* MAPEL */}

                <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm">

                  <div className="flex items-center gap-2">

                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                      <Users size={16} />
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Mapel
                    </p>

                  </div>

                  <p className="text-2xl font-bold text-indigo-700 mt-1">
                    {totalMapel}
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    Belum tersedia dari API pengguna
                  </p>

                </div>

              </div>

              {/* =================================================
                  FILTER
              ================================================= */}

              <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm">

                <div className="flex flex-col sm:flex-row gap-3">

                  {/* SEARCH */}

                  <div className="relative flex-1">

                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="text"
                      placeholder="Cari nama, NIP, email, atau username..."
                      value={search}
                      onChange={(e) =>
                        handleSearchChange(
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                    />

                  </div>

                  {/* STATUS */}

                  <div className="flex items-center gap-2">

                    <Filter
                      size={17}
                      className="text-slate-500 shrink-0"
                    />

                    <select
                      value={filterStatus}
                      onChange={(e) =>
                        handleStatusChange(
                          e.target.value
                        )
                      }
                      className="py-2.5 px-3 pr-8 text-sm text-slate-700 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition appearance-none cursor-pointer"
                    >
                      <option value="semua">
                        Semua Status
                      </option>

                      <option value="aktif">
                        Aktif
                      </option>

                      <option value="nonaktif">
                        Nonaktif
                      </option>
                    </select>

                  </div>

                  {/* SORT */}

                  <div className="flex items-center gap-2">

                    <ArrowUpDown
                      size={17}
                      className="text-slate-500 shrink-0"
                    />

                    <select
                      value={sortValue}
                      onChange={(e) =>
                        handleSortChange(
                          e.target.value
                        )
                      }
                      className="py-2.5 px-3 pr-8 text-sm text-slate-700 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition appearance-none cursor-pointer"
                    >
                      <option value="nama_asc">
                        Nama A-Z
                      </option>

                      <option value="nama_desc">
                        Nama Z-A
                      </option>

                      <option value="nip_asc">
                        NIP A-Z
                      </option>

                      <option value="nip_desc">
                        NIP Z-A
                      </option>

                      <option value="status_asc">
                        Status A-Z
                      </option>

                      <option value="status_desc">
                        Status Z-A
                      </option>
                    </select>

                  </div>

                </div>

              </div>

              {/* =================================================
                  TABLE
              ================================================= */}

              <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1000px]">

                    <colgroup>
                      <col className="w-[6%]" />
                      <col className="w-[27%]" />
                      <col className="w-[15%]" />
                      <col className="w-[18%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[10%]" />
                    </colgroup>

                    <thead>

                      <tr className="border-b border-blue-700 bg-gradient-to-r from-blue-600 to-blue-700">

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">
                          No
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          Profil
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          NIP
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          Email
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          Jabatan
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          Status
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-200">

                      {/* LOADING */}

                      {loading && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-14 text-center"
                          >
                            <div className="flex flex-col items-center">

                              <Loader2
                                size={28}
                                className="animate-spin text-blue-600"
                              />

                              <p className="text-sm font-medium text-slate-700 mt-3">
                                Mengambil data guru...
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                Menghubungkan ke server
                              </p>

                            </div>
                          </td>
                        </tr>
                      )}

                      {/* DATA */}

                      {!loading &&
                        guru.map(
                          (
                            item,
                            index
                          ) => {
                            const rowNumber =
                              startIndex +
                              index;

                            const status =
                              normalizeStatus(
                                item.status
                              );

                            return (
                              <tr
                                key={
                                  item.id
                                }
                                className="transition-colors hover:bg-blue-50"
                              >

                                {/* NO */}

                                <td className="px-4 py-4 text-center align-middle text-sm font-medium text-slate-700">
                                  {rowNumber}
                                </td>

                                {/* PROFIL */}

                                <td className="px-4 py-4 align-middle">

                                  <div className="flex items-center gap-3 min-w-0">

                                    {item.avatar ? (
                                      <img
                                        src={
                                          item.avatar
                                        }
                                        alt={
                                          item.namaLengkap ||
                                          "Guru"
                                        }
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div
                                        className={`w-10 h-10 rounded-full ${getAvatarColor(
                                          item.namaLengkap
                                        )} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
                                      >
                                        {getInitials(
                                          item.namaLengkap
                                        )}
                                      </div>
                                    )}

                                    <div className="min-w-0">

                                      <p className="font-semibold text-slate-800 text-sm truncate">
                                        {item.namaLengkap ||
                                          "-"}
                                      </p>

                                      <p className="text-xs text-slate-500 truncate">
                                        {item.namaPengguna ||
                                          "-"}
                                      </p>

                                    </div>

                                  </div>

                                </td>

                                {/* NIP */}

                                <td className="px-4 py-4 align-middle">

                                  <span className="text-sm text-slate-700 whitespace-nowrap">
                                    {item.nip ||
                                      "-"}
                                  </span>

                                </td>

                                {/* EMAIL */}

                                <td className="px-4 py-4 align-middle">

                                  <span className="text-sm text-slate-600 break-all">
                                    {item.email ||
                                      "-"}
                                  </span>

                                </td>

                                {/* JABATAN */}

                                <td className="px-4 py-4 align-middle">

                                  <span className="text-sm text-slate-700">
                                    {item.jabatan ||
                                      item.peran
                                        ?.namaTampilan ||
                                      "Guru"}
                                  </span>

                                </td>

                                {/* STATUS */}

                                <td className="px-4 py-4 align-middle">

                                  <span
                                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${
                                      status ===
                                      "Aktif"
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                        : "bg-rose-100 text-rose-700 border-rose-300"
                                    }`}
                                  >

                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />

                                    {status}

                                  </span>

                                </td>

                                {/* AKSI */}

                                <td className="px-4 py-4 align-middle">

                                  <div className="flex justify-center gap-1.5">

                                    {/* VIEW */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/guru/${item.id}`
                                        )
                                      }
                                      className="p-2 rounded-lg text-slate-500 hover:bg-blue-100 hover:text-blue-700 transition-all"
                                      title="Lihat Profil"
                                    >
                                      <Eye
                                        size={
                                          17
                                        }
                                      />
                                    </button>

                                    {/* EDIT */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/guru/edit/${item.id}`
                                        )
                                      }
                                      className="p-2 rounded-lg text-slate-500 hover:bg-amber-100 hover:text-amber-700 transition-all"
                                      title="Edit Guru"
                                    >
                                      <Edit
                                        size={
                                          17
                                        }
                                      />
                                    </button>

                                    {/* DELETE */}

                                    <button
                                      type="button"
                                      disabled={
                                        deletingId ===
                                        item.id
                                      }
                                      onClick={() =>
                                        handleDelete(
                                          item.id,
                                          item.namaLengkap
                                        )
                                      }
                                      className="p-2 rounded-lg text-slate-500 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                      title="Nonaktifkan Guru"
                                    >
                                      {deletingId ===
                                      item.id ? (
                                        <Loader2
                                          size={
                                            17
                                          }
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Trash2
                                          size={
                                            17
                                          }
                                        />
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

                {/* EMPTY */}

                {!loading &&
                  guru.length ===
                    0 && (
                    <div className="p-12 text-center">

                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mx-auto mb-3">
                        <Users size={24} />
                      </div>

                      <p className="text-sm font-medium text-slate-700">
                        {error
                          ? "Data guru tidak dapat dimuat"
                          : "Tidak ada data guru"}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {error
                          ? "Periksa koneksi API dan sesi login."
                          : search
                          ? "Coba ubah kata pencarian."
                          : "Belum terdapat data guru pada server."}
                      </p>

                      {error && (
                        <button
                          type="button"
                          onClick={
                            handleRefresh
                          }
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                        >
                          <RefreshCw
                            size={15}
                          />
                          Coba Lagi
                        </button>
                      )}

                    </div>
                  )}

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {!loading &&
                  totalData >
                    0 && (
                    <div className="flex flex-col lg:flex-row items-center justify-between px-4 py-3 border-t border-slate-300 bg-slate-50 gap-3">

                      {/* INFO */}

                      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">

                        <span>
                          Menampilkan{" "}
                          <strong className="font-semibold text-slate-700">
                            {startIndex}
                          </strong>{" "}
                          -{" "}
                          <strong className="font-semibold text-slate-700">
                            {endIndex}
                          </strong>{" "}
                          dari{" "}
                          <strong className="font-semibold text-slate-700">
                            {totalData}
                          </strong>{" "}
                          data
                        </span>

                        <div className="flex items-center gap-1.5">

                          <span>
                            Tampil
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
                                  e.target
                                    .value
                                )
                              );

                              setCurrentPage(
                                1
                              );
                            }}
                            className="py-1 px-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700 cursor-pointer"
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

                        </div>

                      </div>

                      {/* BUTTONS */}

                      {totalPages >
                        1 && (
                        <div className="flex items-center gap-1">

                          {/* FIRST */}

                          <button
                            type="button"
                            onClick={() =>
                              goToPage(
                                1
                              )
                            }
                            disabled={
                              currentPage ===
                              1
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <ChevronsLeft
                              size={16}
                            />
                          </button>

                          {/* PREV */}

                          <button
                            type="button"
                            onClick={() =>
                              goToPage(
                                currentPage -
                                  1
                              )
                            }
                            disabled={
                              currentPage ===
                              1
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <ChevronLeft
                              size={16}
                            />
                          </button>

                          {/* PAGE */}

                          {pageNumbers.map(
                            (
                              page
                            ) => (
                              <button
                                key={
                                  page
                                }
                                type="button"
                                onClick={() =>
                                  goToPage(
                                    page
                                  )
                                }
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                                  currentPage ===
                                  page
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-700 hover:bg-slate-200"
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
                            type="button"
                            onClick={() =>
                              goToPage(
                                currentPage +
                                  1
                              )
                            }
                            disabled={
                              currentPage ===
                              totalPages
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <ChevronRight
                              size={16}
                            />
                          </button>

                          {/* LAST */}

                          <button
                            type="button"
                            onClick={() =>
                              goToPage(
                                totalPages
                              )
                            }
                            disabled={
                              currentPage ===
                              totalPages
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <ChevronsRight
                              size={16}
                            />
                          </button>

                        </div>
                      )}

                    </div>
                  )}

              </div>

              {/* FOOTER */}

              <footer className="text-center text-sm text-slate-500 py-3 border-t border-slate-300">
                © 2026 SmartSchool •
                Data Guru
              </footer>

            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          MODAL TAMBAH GURU
      ===================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="text-center mb-6">

              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                <UserPlus size={28} />
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Tambah Guru
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Pilih metode penambahan guru
              </p>

            </div>

            <div className="space-y-3">

              {/* FORM */}

              <button
                type="button"
                onClick={() => {
                  setShowModal(
                    false
                  );

                  router.push(
                    "/admin/guru/tambah?mode=form"
                  );
                }}
                className="w-full flex items-center gap-4 p-4 border border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
              >

                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-200">
                  <User size={20} />
                </div>

                <div className="flex-1 text-left">

                  <p className="font-semibold text-slate-700">
                    Form Biasa
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Isi data guru secara manual
                  </p>

                </div>

                <ChevronRight
                  size={18}
                  className="text-slate-400 group-hover:text-blue-600"
                />

              </button>

              {/* IMPORT */}

              <button
                type="button"
                onClick={() => {
                  setShowModal(
                    false
                  );

                  router.push(
                    "/admin/guru/tambah?mode=import"
                  );
                }}
                className="w-full flex items-center gap-4 p-4 border border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
              >

                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200">
                  <Upload size={20} />
                </div>

                <div className="flex-1 text-left">

                  <p className="font-semibold text-slate-700">
                    Import Data
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload file Excel atau CSV
                  </p>

                </div>

                <ChevronRight
                  size={18}
                  className="text-slate-400 group-hover:text-indigo-600"
                />

              </button>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowModal(false)
              }
              className="mt-4 w-full py-2.5 text-sm text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>

          </div>

        </div>
      )}

    </div>
  );
}