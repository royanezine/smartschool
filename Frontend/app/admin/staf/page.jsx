"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  FileText,
  Printer,
} from "lucide-react";

// ===== DATA DUMMY =====
const generateDummyData = () => {
  const names = [
    { nama: "Dr. Ahmad Fauzi, M.Pd.", role: "Super Admin", avatar: "AF" },
    { nama: "Dewi Lestari, S.Kom.", role: "Admin Sekolah", avatar: "DL" },
    { nama: "Budi Santoso, S.E.", role: "Admin Yayasan", avatar: "BS" },
    { nama: "Siti Rahayu, S.Pd.", role: "Guru", avatar: "SR" },
    { nama: "M. Rizki Firmansyah, S.Si.", role: "Staf TU", avatar: "RF" },
    { nama: "Nina Susanti, S.Pd.", role: "Guru", avatar: "NS" },
    { nama: "Agus Salim, S.Pd.I.", role: "Guru", avatar: "AS" },
    { nama: "Rina Marlina, S.E.", role: "Staf TU", avatar: "RM" },
    { nama: "Dodi Saputra, S.Kom.", role: "Admin Sekolah", avatar: "DS" },
    { nama: "Tuti Rahayu, S.Pd.", role: "Guru", avatar: "TR" },
    { nama: "Hendra Gunawan, S.Si.", role: "Guru", avatar: "HG" },
    { nama: "Maya Sari, S.Pd.", role: "Guru", avatar: "MS" },
    { nama: "Rahmat Hidayat, S.Pd.", role: "Guru", avatar: "RH" },
    { nama: "Yuli Astuti, S.Pd.", role: "Guru", avatar: "YA" },
    { nama: "Anton Budiman, S.Kom.", role: "Staf TU", avatar: "AB" },
    { nama: "Diana Kusuma, S.Pd.", role: "Guru", avatar: "DK" },
    { nama: "Rudi Hartono, S.Pd.", role: "Guru", avatar: "RH" },
    { nama: "Sari Wulandari, S.Pd.", role: "Guru", avatar: "SW" },
    { nama: "Irwan Setiawan, S.Pd.", role: "Guru", avatar: "IS" },
    { nama: "Nurul Hikmah, S.Pd.", role: "Guru", avatar: "NH" },
  ];

  const statuses = ["Aktif", "Trial", "Nonaktif"];

  const phones = [
    "0812-3456-7890",
    "0813-4567-8901",
    "0814-5678-9012",
    "0815-6789-0123",
    "0816-7890-1234",
  ];

  return names.map((item, index) => {
    const statusIdx = index % 10 < 7 ? 0 : index % 3;

    return {
      id: index + 1,
      nama: item.nama,
      email: `${item.nama.split(" ")[0].toLowerCase()}.${item.nama.split(" ")[1]?.toLowerCase() || "staf"}@smartschool.com`,
      telepon: phones[index % phones.length],
      role: item.role,
      status: statuses[statusIdx],
      terakhirLogin: `2026-08-${String(20 - (index % 5)).padStart(
        2,
        "0"
      )}T${String(8 + (index % 8)).padStart(2, "0")}:${String(
        30 + (index % 30)
      ).padStart(2, "0")}:00Z`,
      bergabung: `202${String(4 + (index % 3))}-${String(
        1 + (index % 12)
      ).padStart(2, "0")}-${String(1 + (index % 28)).padStart(2, "0")}`,
      avatar: item.avatar,
    };
  });
};

const stafData = generateDummyData();

const stats = {
  total: stafData.length,
  aktif: stafData.filter((s) => s.status === "Aktif").length,
  nonaktif: stafData.filter((s) => s.status === "Nonaktif").length,
  trial: stafData.filter((s) => s.status === "Trial").length,
};

const roleOptions = [
  "Semua",
  "Super Admin",
  "Admin Sekolah",
  "Admin Yayasan",
  "Guru",
  "Staf TU",
];

const statusOptions = ["Semua", "Aktif", "Nonaktif", "Trial"];

const statusColorMap = {
  Aktif: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Trial: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  Nonaktif: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

const roleColorMap = {
  "Super Admin": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  "Admin Sekolah": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "Admin Yayasan": {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  Guru: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "Staf TU": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
};

// ===== UTILITY =====
const formatTanggal = (dateString) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);

  const diffMs = now - past;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return formatTanggal(dateString);
};

// ===== KOMPONEN UTAMA =====
export default function StafPage() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState("staf");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [sortField, setSortField] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredData = stafData.filter((item) => {
    const query = searchQuery.toLowerCase();

    const matchSearch =
      item.nama.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.role.toLowerCase().includes(query);

    const matchRole =
      filterRole === "Semua" || item.role === filterRole;

    const matchStatus =
      filterStatus === "Semua" || item.status === filterStatus;

    return matchSearch && matchRole && matchStatus;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const valA = a[sortField]?.toString().toLowerCase() || "";
    const valB = b[sortField]?.toString().toLowerCase() || "";

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;

    return 0;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;

    return sortOrder === "asc" ? (
      <ArrowUp size={13} className="ml-1 inline text-white" />
    ) : (
      <ArrowDown size={13} className="ml-1 inline text-white" />
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterRole("Semua");
    setFilterStatus("Semua");
    setCurrentPage(1);
  };

  const handleDelete = (staf) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${staf.nama}?`)) {
      console.log("Hapus:", staf.id);
    }
  };

  // =======================================================
  // EXPORT CSV
  // =======================================================

  const exportCSV = () => {
    const headers = [
      "Nama",
      "Email",
      "Telepon",
      "Role",
      "Status",
      "Terakhir Login",
      "Bergabung",
    ];

    const rows = sortedData.map((s) => [
      s.nama,
      s.email,
      s.telepon,
      s.role,
      s.status,
      formatTanggal(s.terakhirLogin),
      formatTanggal(s.bergabung),
    ]);

    let csv = headers.join(",") + "\n";

    rows.forEach((row) => {
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `data_staf_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // =======================================================
  // EXPORT EXCEL
  // =======================================================

  const exportExcel = () => {
    const headers = [
      "Nama",
      "Email",
      "Telepon",
      "Role",
      "Status",
      "Terakhir Login",
      "Bergabung",
    ];

    let tableHtml = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          th,td {
            border:1px solid #ccc;
            padding:6px 10px;
            font-size:12px;
            font-family:Arial,sans-serif;
          }

          th {
            background:#2563eb;
            color:white;
            font-weight:bold;
          }

          tr:nth-child(even) {
            background:#eff6ff;
          }
        </style>
      </head>
      <body>
        <table>
          <tr>
            ${headers.map((h) => `<th>${h}</th>`).join("")}
          </tr>
    `;

    sortedData.forEach((s) => {
      tableHtml += `
        <tr>
          <td>${s.nama}</td>
          <td>${s.email}</td>
          <td>${s.telepon}</td>
          <td>${s.role}</td>
          <td>${s.status}</td>
          <td>${formatTanggal(s.terakhirLogin)}</td>
          <td>${formatTanggal(s.bergabung)}</td>
        </tr>
      `;
    });

    tableHtml += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], {
      type: "application/vnd.ms-excel",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `data_staf_${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // =======================================================
  // EXPORT PDF
  // =======================================================

  const exportPDF = () => {
    const printWindow = window.open(
      "",
      "_blank",
      "width=1024,height=768"
    );

    if (!printWindow) {
      alert("Mohon izinkan popup untuk mencetak PDF");
      return;
    }

    const headers = ["Nama", "Email", "Role", "Status"];

    let tableHtml = `
      <html>
      <head>
        <title>Data Staf</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }

          h1 {
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 10px;
          }

          p {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          th {
            background: #2563eb;
            color: white;
            padding: 8px 10px;
            text-align: left;
          }

          td {
            border: 1px solid #bfdbfe;
            padding: 6px 10px;
          }

          tr:nth-child(even) {
            background: #eff6ff;
          }

          .total {
            margin-top: 15px;
            font-size: 12px;
            color: #475569;
          }
        </style>
      </head>

      <body>
        <h1>📋 Data Staf</h1>

        <p>
          Total: ${sortedData.length} staf |
          ${new Date().toLocaleDateString("id-ID")}
        </p>

        <table>
          <tr>
            ${headers.map((h) => `<th>${h}</th>`).join("")}
          </tr>
    `;

    sortedData.forEach((s) => {
      tableHtml += `
        <tr>
          <td>${s.nama}</td>
          <td>${s.email}</td>
          <td>${s.role}</td>
          <td>${s.status}</td>
        </tr>
      `;
    });

    tableHtml += `
        </table>

        <p class="total">
          Dicetak dari SmartSchool -
          ${new Date().toLocaleString("id-ID")}
        </p>

      </body>
      </html>
    `;

    printWindow.document.write(tableHtml);
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Super Admin",
            email: "admin@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-5 sm:space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.22)]">
                  <Users size={20} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-bold leading-none text-slate-800 sm:text-3xl">
                      Manajemen Staf
                    </h1>

                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                      Admin
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm leading-5 text-slate-500">
                    Kelola seluruh staf dan administrator sistem.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">

                {/* EXPORT */}
                <div className="relative group">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Download size={16} />
                    <span>Export</span>
                  </button>

                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={exportPDF}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-t-xl"
                    >
                      <Printer size={16} />
                      PDF
                    </button>

                    <button
                      onClick={exportExcel}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <FileSpreadsheet size={16} />
                      Excel
                    </button>

                    <button
                      onClick={exportCSV}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-b-xl"
                    >
                      <FileText size={16} />
                      CSV
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => router.push("/admin/staf/tambah")}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  <span>Tambah Staf</span>
                </button>
              </div>
            </div>

            {/* STATISTIK */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Total Staf"
                value={stats.total}
                icon={Users}
                color="blue"
              />

              <StatCard
                label="Aktif"
                value={stats.aktif}
                icon={CheckCircle}
                color="emerald"
              />

              <StatCard
                label="Trial"
                value={stats.trial}
                icon={Clock}
                color="amber"
              />

              <StatCard
                label="Nonaktif"
                value={stats.nonaktif}
                icon={XCircle}
                color="rose"
              />
            </div>

            {/* FILTER */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex flex-col gap-3">

                <div className="relative w-full">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Cari nama, email, atau role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 min-w-[120px]"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 min-w-[120px]"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Reset
                  </button>

                  <span className="ml-auto text-xs text-slate-400 hidden sm:inline">
                    {filteredData.length} staf ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* =====================================================
                TABLE BIRU
            ===================================================== */}
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">

              {isMobile && paginatedData.length > 0 ? (

                <div className="divide-y divide-blue-100 p-3 bg-blue-50/30">

                  {paginatedData.map((item, index) => {
                    const statusStyle =
                      statusColorMap[item.status] ||
                      statusColorMap.Aktif;

                    const roleStyle =
                      roleColorMap[item.role] ||
                      roleColorMap["Staf TU"];

                    const rowNumber = startIndex + index + 1;

                    return (
                      <div
                        key={item.id}
                        className="py-3 space-y-2 hover:bg-blue-50 transition"
                      >
                        <div className="flex items-center gap-3">

                          <span className="text-xs font-semibold text-blue-600 w-6 text-right">
                            {rowNumber}
                          </span>

                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {item.avatar}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">
                              {item.nama}
                            </p>

                            <p className="text-xs text-slate-500 truncate">
                              {item.email}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              router.push(`/admin/staf/${item.id}`)
                            }
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 ml-9">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                          >
                            {item.role}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1`}
                            />
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    {/* HEADER BIRU */}
                    <thead>
                      <tr className="bg-blue-600 border-b border-blue-700">

                        <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wider w-16">
                          No
                        </th>

                        <th
                          onClick={() => handleSort("nama")}
                          className="px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 select-none"
                        >
                          <span className="flex items-center">
                            Nama
                            {renderSortIcon("nama")}
                          </span>
                        </th>

                        <th className="hidden md:table-cell px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">
                          Email
                        </th>

                        <th className="hidden sm:table-cell px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">
                          Telepon
                        </th>

                        <th
                          onClick={() => handleSort("role")}
                          className="px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 select-none"
                        >
                          <span className="flex items-center">
                            Role
                            {renderSortIcon("role")}
                          </span>
                        </th>

                        <th
                          onClick={() => handleSort("status")}
                          className="px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 select-none"
                        >
                          <span className="flex items-center">
                            Status
                            {renderSortIcon("status")}
                          </span>
                        </th>

                        <th className="hidden lg:table-cell px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">
                          Terakhir Login
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-bold text-white uppercase tracking-wider">
                          Aksi
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-blue-100">

                      {paginatedData.length === 0 ? (

                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-12 text-center text-slate-500"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Search
                                size={32}
                                className="text-blue-200"
                              />

                              <p className="text-sm font-medium">
                                Tidak ada staf ditemukan
                              </p>

                              <p className="text-xs text-slate-400">
                                Coba ubah filter atau kata kunci pencarian
                              </p>
                            </div>
                          </td>
                        </tr>

                      ) : (

                        paginatedData.map((item, index) => {

                          const statusStyle =
                            statusColorMap[item.status] ||
                            statusColorMap.Aktif;

                          const roleStyle =
                            roleColorMap[item.role] ||
                            roleColorMap["Staf TU"];

                          const rowNumber =
                            startIndex + index + 1;

                          return (

                            <tr
                              key={item.id}
                              className={`
                                transition-colors
                                ${
                                  index % 2 === 0
                                    ? "bg-white"
                                    : "bg-blue-50/60"
                                }
                                hover:bg-blue-100/70
                              `}
                            >

                              {/* NO */}
                              <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-center">
                                {rowNumber}
                              </td>

                              {/* NAMA */}
                              <td className="px-4 py-3">

                                <div className="flex items-center gap-3">

                                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm flex-shrink-0">
                                    {item.avatar}
                                  </div>

                                  <span className="font-semibold text-slate-800 truncate max-w-[120px] sm:max-w-none">
                                    {item.nama}
                                  </span>

                                </div>

                              </td>

                              {/* EMAIL */}
                              <td className="hidden md:table-cell px-4 py-3 text-slate-600 text-sm truncate max-w-[150px]">
                                {item.email}
                              </td>

                              {/* TELEPON */}
                              <td className="hidden sm:table-cell px-4 py-3 text-slate-600 text-sm">
                                {item.telepon}
                              </td>

                              {/* ROLE */}
                              <td className="px-4 py-3">

                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                                >
                                  {item.role}
                                </span>

                              </td>

                              {/* STATUS */}
                              <td className="px-4 py-3">

                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                >
                                  <span
                                    className={`inline-block w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1`}
                                  />

                                  {item.status}
                                </span>

                              </td>

                              {/* LOGIN */}
                              <td className="hidden lg:table-cell px-4 py-3 text-xs text-slate-600">
                                {timeAgo(item.terakhirLogin)}
                              </td>

                              {/* AKSI */}
                              <td className="px-4 py-3 text-right">

                                <div className="flex items-center justify-end gap-0.5">

                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/admin/staf/${item.id}`
                                      )
                                    }
                                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-colors"
                                    title="Detail"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/admin/staf/edit/${item.id}`
                                      )
                                    }
                                    className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 hover:text-amber-700 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit size={15} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDelete(item)
                                    }
                                    className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 size={15} />
                                  </button>

                                </div>

                              </td>

                            </tr>

                          );
                        })
                      )}

                    </tbody>
                  </table>

                </div>
              )}

              {/* PAGINATION */}
              {sortedData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-blue-100 bg-blue-50/50 gap-3">

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">

                    <span>
                      Menampilkan {startIndex + 1} -{" "}
                      {Math.min(
                        startIndex + paginatedData.length,
                        sortedData.length
                      )}{" "}
                      dari {sortedData.length} staf
                    </span>

                    <div className="flex items-center gap-1">

                      <span>Tampil</span>

                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="py-1 px-2 text-xs border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={40}>40</option>
                      </select>

                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">

                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.max(1, currentPage - 1)
                        )
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden xs:inline">
                        Previous
                      </span>

                      <span className="xs:hidden">‹</span>
                    </button>

                    {[...Array(Math.min(totalPages, 5))].map(
                      (_, i) => {
                        const page = i + 1;

                        return (
                          <button
                            key={page}
                            onClick={() =>
                              setCurrentPage(page)
                            }
                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-blue-600 hover:bg-blue-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    {totalPages > 5 && (
                      <>
                        <span className="text-slate-400 px-0.5">
                          …
                        </span>

                        <button
                          onClick={() =>
                            setCurrentPage(totalPages)
                          }
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            currentPage === totalPages
                              ? "bg-blue-600 text-white"
                              : "text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(
                            totalPages,
                            currentPage + 1
                          )
                        )
                      }
                      disabled={
                        currentPage === totalPages ||
                        totalPages === 0
                      }
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden xs:inline">
                        Next
                      </span>

                      <span className="xs:hidden">›</span>
                    </button>

                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="text-center text-xs text-slate-400/80 py-2 border-t border-blue-100">
              © 2026 SmartSchool • Data staf terakhir diperbaruhi hari ini
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

// ===== STAT CARD =====
function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  const iconBg = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition-shadow">

      <div className="flex items-center gap-3">

        <div
          className={`p-2 rounded-lg ${iconBg} flex-shrink-0`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">
            {label}
          </p>

          <p className="text-lg font-semibold text-slate-800">
            {value}
          </p>

        </div>

      </div>
    </div>
  );
}