"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

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

// ======================================================
// THEME HELPERS
// ======================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ======================================================
// DATA DUMMY
// ======================================================

const generateDummyData = () => {
  const names = [
    {
      nama: "Dr. Ahmad Fauzi, M.Pd.",
      role: "Super Admin",
      avatar: "AF",
    },
    {
      nama: "Dewi Lestari, S.Kom.",
      role: "Admin Sekolah",
      avatar: "DL",
    },
    {
      nama: "Budi Santoso, S.E.",
      role: "Admin Yayasan",
      avatar: "BS",
    },
    {
      nama: "Siti Rahayu, S.Pd.",
      role: "Guru",
      avatar: "SR",
    },
    {
      nama: "M. Rizki Firmansyah, S.Si.",
      role: "Staf TU",
      avatar: "RF",
    },
    {
      nama: "Nina Susanti, S.Pd.",
      role: "Guru",
      avatar: "NS",
    },
    {
      nama: "Agus Salim, S.Pd.I.",
      role: "Guru",
      avatar: "AS",
    },
    {
      nama: "Rina Marlina, S.E.",
      role: "Staf TU",
      avatar: "RM",
    },
    {
      nama: "Dodi Saputra, S.Kom.",
      role: "Admin Sekolah",
      avatar: "DS",
    },
    {
      nama: "Tuti Rahayu, S.Pd.",
      role: "Guru",
      avatar: "TR",
    },
    {
      nama: "Hendra Gunawan, S.Si.",
      role: "Guru",
      avatar: "HG",
    },
    {
      nama: "Maya Sari, S.Pd.",
      role: "Guru",
      avatar: "MS",
    },
    {
      nama: "Rahmat Hidayat, S.Pd.",
      role: "Guru",
      avatar: "RH",
    },
    {
      nama: "Yuli Astuti, S.Pd.",
      role: "Guru",
      avatar: "YA",
    },
    {
      nama: "Anton Budiman, S.Kom.",
      role: "Staf TU",
      avatar: "AB",
    },
    {
      nama: "Diana Kusuma, S.Pd.",
      role: "Guru",
      avatar: "DK",
    },
    {
      nama: "Rudi Hartono, S.Pd.",
      role: "Guru",
      avatar: "RH",
    },
    {
      nama: "Sari Wulandari, S.Pd.",
      role: "Guru",
      avatar: "SW",
    },
    {
      nama: "Irwan Setiawan, S.Pd.",
      role: "Guru",
      avatar: "IS",
    },
    {
      nama: "Nurul Hikmah, S.Pd.",
      role: "Guru",
      avatar: "NH",
    },
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
      terakhirLogin: `2026-08-${String(
        20 - (index % 5)
      ).padStart(2, "0")}T${String(
        8 + (index % 8)
      ).padStart(2, "0")}:${String(
        30 + (index % 30)
      ).padStart(2, "0")}:00Z`,
      bergabung: `202${String(
        4 + (index % 3)
      )}-${String(1 + (index % 12)).padStart(
        2,
        "0"
      )}-${String(1 + (index % 28)).padStart(
        2,
        "0"
      )}`,
      avatar: item.avatar,
    };
  });
};

const stafData = generateDummyData();

const stats = {
  total: stafData.length,
  aktif: stafData.filter((s) => s.status === "Aktif").length,
  nonaktif: stafData.filter(
    (s) => s.status === "Nonaktif"
  ).length,
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

const statusOptions = [
  "Semua",
  "Aktif",
  "Nonaktif",
  "Trial",
];

// ======================================================
// STATUS THEME
// ======================================================

const statusColorMap = {
  Aktif: {
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    dot: "bg-[var(--color-success)]",
  },

  Trial: {
    bg: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    dot: "bg-[var(--color-warning)]",
  },

  Nonaktif: {
    bg: themeNeutralSurface,
    text: "theme-text-secondary",
    border: themeNeutralBorder,
    dot: "bg-[color-mix(in_srgb,var(--color-text)_35%,transparent)]",
  },
};

// ======================================================
// ROLE THEME
// ======================================================

const roleColorMap = {
  "Super Admin": {
    bg: themePrimarySoft,
    text: themePrimaryText,
    border: themePrimarySoftBorder,
  },

  "Admin Sekolah": {
    bg: themeInfoSurface,
    text: "text-[var(--color-info)]",
    border: themeInfoBorder,
  },

  "Admin Yayasan": {
    bg: themePrimarySoft,
    text: themePrimaryText,
    border: themePrimarySoftBorder,
  },

  Guru: {
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
  },

  "Staf TU": {
    bg: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
  },
};

// ======================================================
// UTILITY
// ======================================================

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

// ======================================================
// KOMPONEN UTAMA
// ======================================================

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

  // ======================================================
  // MOBILE CHECK
  // ======================================================

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < 768);

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () =>
      window.removeEventListener(
        "resize",
        checkMobile
      );
  }, []);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredData = stafData.filter((item) => {
    const query = searchQuery.toLowerCase();

    const matchSearch =
      item.nama.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.role.toLowerCase().includes(query);

    const matchRole =
      filterRole === "Semua" ||
      item.role === filterRole;

    const matchStatus =
      filterStatus === "Semua" ||
      item.status === filterStatus;

    return matchSearch && matchRole && matchStatus;
  });

  // ======================================================
  // SORT
  // ======================================================

  const sortedData = [...filteredData].sort((a, b) => {
    const valA =
      a[sortField]?.toString().toLowerCase() || "";

    const valB =
      b[sortField]?.toString().toLowerCase() || "";

    if (valA < valB)
      return sortOrder === "asc" ? -1 : 1;

    if (valA > valB)
      return sortOrder === "asc" ? 1 : -1;

    return 0;
  });

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedData.length / itemsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ======================================================
  // ACTION
  // ======================================================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(
        sortOrder === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;

    return sortOrder === "asc" ? (
      <ArrowUp
        size={13}
        className="ml-1 inline"
      />
    ) : (
      <ArrowDown
        size={13}
        className="ml-1 inline"
      />
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterRole("Semua");
    setFilterStatus("Semua");
    setCurrentPage(1);
  };

  const handleDelete = (staf) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus ${staf.nama}?`
      )
    ) {
      console.log("Hapus:", staf.id);
    }
  };

  // ======================================================
  // EXPORT CSV
  // ======================================================

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

  // ======================================================
  // EXPORT EXCEL
  // ======================================================

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
            ${headers
              .map((h) => `<th>${h}</th>`)
              .join("")}
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
          <td>${formatTanggal(
            s.terakhirLogin
          )}</td>
          <td>${formatTanggal(
            s.bergabung
          )}</td>
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

  // ======================================================
  // EXPORT PDF
  // ======================================================

  const exportPDF = () => {
    const printWindow = window.open(
      "",
      "_blank",
      "width=1024,height=768"
    );

    if (!printWindow) {
      alert(
        "Mohon izinkan popup untuk mencetak PDF"
      );
      return;
    }

    const headers = [
      "Nama",
      "Email",
      "Role",
      "Status",
    ];

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
          ${new Date().toLocaleDateString(
            "id-ID"
          )}
        </p>

        <table>
          <tr>
            ${headers
              .map((h) => `<th>${h}</th>`)
              .join("")}
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

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="flex min-h-screen theme-page">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="flex-1 flex flex-col min-w-0">

        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Super Admin",
            email: "admin@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-5 sm:space-y-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="flex items-start gap-3">

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} ${themeSmallShadow}`}
                >
                  <Users
                    size={20}
                    className="text-[var(--color-card)]"
                  />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2.5">

                    <h1 className="text-2xl font-bold leading-none theme-text sm:text-3xl">
                      Manajemen Staf
                    </h1>

                    <span
                      className={`inline-flex items-center rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-1 text-[11px] font-medium theme-text-secondary`}
                    >
                      Admin
                    </span>

                  </div>

                  <p className="mt-1.5 text-sm leading-5 theme-text-muted">
                    Kelola seluruh staf dan administrator sistem.
                  </p>

                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">

                {/* EXPORT */}

                <div className="relative group">

                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${themeNeutralBorder} theme-card text-sm font-medium theme-text-secondary ${themeNeutralHover} hover:text-[var(--color-primary)] transition-all`}
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </button>

                  <div
                    className={`absolute right-0 top-full mt-1 w-44 theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden`}
                  >

                    <button
                      onClick={exportPDF}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm theme-text-secondary ${themeNeutralHover} hover:text-[var(--color-primary)] transition`}
                    >
                      <Printer size={16} />
                      PDF
                    </button>

                    <button
                      onClick={exportExcel}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm theme-text-secondary ${themeNeutralHover} hover:text-[var(--color-primary)] transition`}
                    >
                      <FileSpreadsheet size={16} />
                      Excel
                    </button>

                    <button
                      onClick={exportCSV}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm theme-text-secondary ${themeNeutralHover} hover:text-[var(--color-primary)] transition`}
                    >
                      <FileText size={16} />
                      CSV
                    </button>

                  </div>
                </div>

                {/* REFRESH */}

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium theme-text-secondary theme-card border ${themeNeutralBorder} rounded-lg ${themeNeutralHover} transition-colors`}
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>

                {/* TAMBAH */}

                <button
                  onClick={() =>
                    router.push("/admin/staf/tambah")
                  }
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} rounded-lg hover:opacity-90 transition-all ${themeSmallShadow}`}
                >
                  <Plus size={16} />
                  <span>Tambah Staf</span>
                </button>

              </div>
            </div>

            {/* ==================================================
                STATISTIK
            ================================================== */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              <StatCard
                label="Total Staf"
                value={stats.total}
                icon={Users}
                color="primary"
              />

              <StatCard
                label="Aktif"
                value={stats.aktif}
                icon={CheckCircle}
                color="success"
              />

              <StatCard
                label="Trial"
                value={stats.trial}
                icon={Clock}
                color="warning"
              />

              <StatCard
                label="Nonaktif"
                value={stats.nonaktif}
                icon={XCircle}
                color="neutral"
              />

            </div>

            {/* ==================================================
                FILTER
            ================================================== */}

            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
            >

              <div className="flex flex-col gap-3">

                <div className="relative w-full">

                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                  />

                  <input
                    type="text"
                    placeholder="Cari nama, email, atau role..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className={`w-full pl-9 pr-3 py-2 text-sm theme-input border ${themeNeutralBorder} rounded-lg outline-none themeFocus placeholder:text-[var(--color-text-placeholder)] transition`}
                  />

                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <select
                    value={filterRole}
                    onChange={(e) =>
                      setFilterRole(e.target.value)
                    }
                    className={`px-3 py-1.5 text-sm theme-input border ${themeNeutralBorder} rounded-lg theme-text-secondary min-w-[120px] outline-none ${themeFocus}`}
                  >
                    {roleOptions.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                      >
                        {opt}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value)
                    }
                    className={`px-3 py-1.5 text-sm theme-input border ${themeNeutralBorder} rounded-lg theme-text-secondary min-w-[120px] outline-none ${themeFocus}`}
                  >
                    {statusOptions.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                      >
                        {opt}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={resetFilters}
                    className={`px-3 py-1.5 text-sm theme-text-secondary ${themePrimaryHover} hover:text-[var(--color-primary)] rounded-lg transition-colors`}
                  >
                    Reset
                  </button>

                  <span className="ml-auto text-xs theme-text-muted hidden sm:inline">
                    {filteredData.length} staf ditemukan
                  </span>

                </div>
              </div>
            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >

              {/* MOBILE */}

              {isMobile &&
              paginatedData.length > 0 ? (
                <div className={`divide-y ${themeDivider} p-3 ${themeNeutralSurface}`}>

                  {paginatedData.map(
                    (item, index) => {
                      const statusStyle =
                        statusColorMap[item.status] ||
                        statusColorMap.Aktif;

                      const roleStyle =
                        roleColorMap[item.role] ||
                        roleColorMap["Staf TU"];

                      const rowNumber =
                        startIndex + index + 1;

                      return (
                        <div
                          key={item.id}
                          className={`py-3 space-y-2 ${themeNeutralHover} transition`}
                        >

                          <div className="flex items-center gap-3">

                            <span
                              className={`text-xs font-semibold ${themePrimaryText} w-6 text-right`}
                            >
                              {rowNumber}
                            </span>

                            <div
                              className={`w-10 h-10 rounded-full ${themePrimaryGradient} text-[var(--color-card)] flex items-center justify-center font-semibold text-sm flex-shrink-0`}
                            >
                              {item.avatar}
                            </div>

                            <div className="flex-1 min-w-0">

                              <p className="font-semibold theme-text text-sm truncate">
                                {item.nama}
                              </p>

                              <p className="text-xs theme-text-muted truncate">
                                {item.email}
                              </p>

                            </div>

                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/staf/${item.id}`
                                )
                              }
                              className={`p-1.5 rounded-lg ${themePrimaryHover} ${themePrimaryText} hover:opacity-80 transition-colors`}
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
                    }
                  )}

                </div>
              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    {/* TABLE HEADER */}

                    <thead>
                      <tr
                        className={`${themePrimaryGradient} border-b ${themePrimarySoftBorder}`}
                      >

                        <th className="px-4 py-3 text-center text-[10px] font-bold text-[var(--color-card)] uppercase tracking-wider w-16">
                          No
                        </th>

                        <th
                          onClick={() =>
                            handleSort("nama")
                          }
                          className="px-4 py-3 text-left text-[10px] font-bold text-[var(--color-card)] uppercase tracking-wider cursor-pointer hover:opacity-90 select-none"
                        >
                          <span className="flex items-center">
                            Nama
                            {renderSortIcon("nama")}
                          </span>
                        </th>

                        <th className="hidden md:table-cell px-4 py-3 text-left text-[10px] font-bold text-[var(--color-card)] uppercase tracking-wider">
                          Email
                        </th>

                        <th className="hidden sm:table-cell px-4 py-3 text-left text-[10px] font-bold text-[var(--color-card)] uppercase tracking-wider">
                          Telepon
                        </th>

                        <th
                          onClick={() =>
                            handleSort("role")
                          }
                          className="px-4 py-3 text-left text-[10px] font-bold text-[var(--color-card)] uppercase tracking-wider cursor-pointer hover:opacity-90 select-none"
                        >
                          <span className="flex items-center">
                            Role
                            {renderSortIcon("role")}
                          </span>
                        </th>

                        <th
                          onClick={() =>
                            handleSort("status")
                          }
                          className="px-4 py-3 text-left text-[10px] font-bold text-[var(--color-card)] uppercase tracking-wider cursor-pointer hover:opacity-90 select-none"
                        >
                          <span className="flex items-center">
                            Status
                            {renderSortIcon("status")}
                          </span>
                        </th>

                        <th className="hidden lg:table-cell px-4 py-3 text-left text-[10px] font-bold text-[var(--color-card)] uppercase tracking-wider">
                          Terakhir Login
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-bold text-[var(--color-card)] uppercase tracking-wider">
                          Aksi
                        </th>

                      </tr>
                    </thead>

                    <tbody
                      className={`divide-y ${themeDivider}`}
                    >

                      {/* EMPTY */}

                      {paginatedData.length ===
                      0 ? (
                        <tr>

                          <td
                            colSpan={8}
                            className="px-4 py-12 text-center"
                          >

                            <div className="flex flex-col items-center gap-2">

                              <div
                                className={`w-12 h-12 rounded-full ${themePrimarySoft} flex items-center justify-center`}
                              >
                                <Search
                                  size={24}
                                  className={themePrimaryText}
                                />
                              </div>

                              <p className="text-sm font-medium theme-text">
                                Tidak ada staf ditemukan
                              </p>

                              <p className="text-xs theme-text-muted">
                                Coba ubah filter atau kata kunci pencarian
                              </p>

                            </div>

                          </td>
                        </tr>
                      ) : (

                        paginatedData.map(
                          (item, index) => {
                            const statusStyle =
                              statusColorMap[
                                item.status
                              ] ||
                              statusColorMap.Aktif;

                            const roleStyle =
                              roleColorMap[
                                item.role
                              ] ||
                              roleColorMap["Staf TU"];

                            const rowNumber =
                              startIndex +
                              index +
                              1;

                            return (
                              <tr
                                key={item.id}
                                className={`${themeNeutralHover} transition-colors`}
                              >

                                {/* NO */}

                                <td
                                  className={`px-4 py-3 text-sm font-semibold ${themePrimaryText} text-center`}
                                >
                                  {rowNumber}
                                </td>

                                {/* NAMA */}

                                <td className="px-4 py-3">

                                  <div className="flex items-center gap-3">

                                    <div
                                      className={`w-9 h-9 rounded-full ${themePrimaryGradient} text-[var(--color-card)] flex items-center justify-center font-semibold text-sm ${themeSmallShadow} flex-shrink-0`}
                                    >
                                      {item.avatar}
                                    </div>

                                    <span className="font-semibold theme-text truncate max-w-[120px] sm:max-w-none">
                                      {item.nama}
                                    </span>

                                  </div>

                                </td>

                                {/* EMAIL */}

                                <td className="hidden md:table-cell px-4 py-3 theme-text-secondary text-sm truncate max-w-[150px]">
                                  {item.email}
                                </td>

                                {/* TELEPON */}

                                <td className="hidden sm:table-cell px-4 py-3 theme-text-secondary text-sm">
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

                                <td className="hidden lg:table-cell px-4 py-3 text-xs theme-text-secondary">
                                  {timeAgo(
                                    item.terakhirLogin
                                  )}
                                </td>

                                {/* AKSI */}

                                <td className="px-4 py-3 text-right">

                                  <div className="flex items-center justify-end gap-0.5">

                                    {/* DETAIL */}

                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/admin/staf/${item.id}`
                                        )
                                      }
                                      className={`p-1.5 rounded-lg ${themePrimaryHover} ${themePrimaryText} hover:opacity-80 transition-colors`}
                                      title="Detail"
                                    >
                                      <Eye size={15} />
                                    </button>

                                    {/* EDIT */}

                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/admin/staf/edit/${item.id}`
                                        )
                                      }
                                      className={`p-1.5 rounded-lg ${themeWarningSurface} text-[var(--color-warning)] hover:opacity-80 transition-colors`}
                                      title="Edit"
                                    >
                                      <Edit size={15} />
                                    </button>

                                    {/* DELETE */}

                                    <button
                                      onClick={() =>
                                        handleDelete(
                                          item
                                        )
                                      }
                                      className={`p-1.5 rounded-lg ${themeDangerSurface} theme-danger hover:opacity-80 transition-colors`}
                                      title="Hapus"
                                    >
                                      <Trash2 size={15} />
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
              )}

              {/* ==================================================
                  PAGINATION
              ================================================== */}

              {sortedData.length > 0 && (
                <div
                  className={`flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t ${themeDivider} ${themeNeutralSurface} gap-3`}
                >

                  <div className="flex flex-wrap items-center gap-3 text-xs theme-text-muted">

                    <span>
                      Menampilkan{" "}
                      {startIndex + 1} -{" "}
                      {Math.min(
                        startIndex +
                          paginatedData.length,
                        sortedData.length
                      )}{" "}
                      dari {sortedData.length} staf
                    </span>

                    <div className="flex items-center gap-1">

                      <span>Tampil</span>

                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(
                            Number(e.target.value)
                          );
                          setCurrentPage(1);
                        }}
                        className={`py-1 px-2 text-xs theme-input border ${themeNeutralBorder} rounded-lg theme-text-secondary outline-none ${themeFocus} cursor-pointer`}
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

                  <div className="flex items-center gap-0.5">

                    {/* PREVIOUS */}

                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.max(
                            1,
                            currentPage - 1
                          )
                        )
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-sm ${themePrimaryText} ${themePrimaryHover} rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
                    >
                      <span className="hidden xs:inline">
                        Previous
                      </span>

                      <span className="xs:hidden">
                        ‹
                      </span>
                    </button>

                    {/* PAGE NUMBERS */}

                    {[
                      ...Array(
                        Math.min(
                          totalPages,
                          5
                        )
                      ),
                    ].map((_, i) => {
                      const page = i + 1;

                      return (
                        <button
                          key={page}
                          onClick={() =>
                            setCurrentPage(page)
                          }
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            currentPage ===
                            page
                              ? `${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow}`
                              : `${themePrimaryText} ${themePrimaryHover}`
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {/* LAST PAGE */}

                    {totalPages > 5 && (
                      <>
                        <span className="theme-text-muted px-0.5">
                          …
                        </span>

                        <button
                          onClick={() =>
                            setCurrentPage(
                              totalPages
                            )
                          }
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            currentPage ===
                            totalPages
                              ? `${themePrimaryGradient} text-[var(--color-card)]`
                              : `${themePrimaryText} ${themePrimaryHover}`
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* NEXT */}

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
                        currentPage ===
                          totalPages ||
                        totalPages === 0
                      }
                      className={`px-3 py-1 text-sm ${themePrimaryText} ${themePrimaryHover} rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
                    >
                      <span className="hidden xs:inline">
                        Next
                      </span>

                      <span className="xs:hidden">
                        ›
                      </span>
                    </button>

                  </div>
                </div>
              )}
            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div
              className={`text-center text-xs theme-text-muted py-2 border-t ${themeDivider}`}
            >
              © 2026 SmartSchool • Data staf terakhir
              diperbaruhi hari ini
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  const colorMap = {
    primary: {
      bg: themePrimarySoft,
      text: themePrimaryText,
      border: themePrimarySoftBorder,
    },

    success: {
      bg: themeSuccessSurface,
      text: "text-[var(--color-success)]",
      border: themeSuccessBorder,
    },

    warning: {
      bg: themeWarningSurface,
      text: "text-[var(--color-warning)]",
      border: themeWarningBorder,
    },

    neutral: {
      bg: themeNeutralSurface,
      text: "theme-text-secondary",
      border: themeNeutralBorder,
    },
  };

  const style =
    colorMap[color] || colorMap.primary;

  return (
    <div
      className={`theme-card rounded-lg border ${themeNeutralBorder} p-3.5 ${themeCardShadow} hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition-shadow`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`p-2 rounded-lg ${style.bg} ${style.text} border ${style.border} flex-shrink-0`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider truncate">
            {label}
          </p>

          <p className="text-lg font-semibold theme-text">
            {value}
          </p>

        </div>

      </div>
    </div>
  );
}