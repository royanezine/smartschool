"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  Activity,
  Search,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Users,
  Settings,
  Database,
  CheckCircle,
  XCircle,
  GraduationCap,
  Shield,
  DollarSign,
  BookOpen,
  Lock,
  BarChart,
  Building2,
  UserCog,
  FileText,
  Globe,
  Link,
  ChevronDown,
  X,
} from "lucide-react";

// ============================================================
// OPTIONS
// ============================================================

const statusOptions = [
  { value: "Semua", label: "Semua Status" },
  { value: "success", label: "Berhasil" },
  { value: "failed", label: "Gagal" },
];

const timeOptions = [
  { value: "today", label: "Hari Ini" },
  { value: "yesterday", label: "Kemarin" },
  { value: "week", label: "7 Hari Terakhir" },
  { value: "month", label: "30 Hari Terakhir" },
  { value: "custom", label: "Kustom" },
];

// ============================================================
// SMART FILTER SELECT
// ============================================================

function SmartFilterSelect({
  value,
  onChange,
  options = [],
  placeholder = "Cari...",
  allLabel = "Semua",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const useDropdown = options.length <= 5;

  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;

    return options.filter((option) =>
      option.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSearchText("");
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    const value = event.target.value;

    setSearchText(value);

    if (!value.trim()) {
      onChange("Semua");
    }
  };

  const handleInputBlur = () => {
    if (
      searchText.trim() &&
      !options.some(
        (option) =>
          option.toLowerCase() === searchText.toLowerCase()
      )
    ) {
      setSearchText("");
      onChange("Semua");
    }
  };

  // ==========================================================
  // DROPDOWN
  // ==========================================================

  if (useDropdown) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-10 w-full rounded-xl
          border border-slate-200
          bg-slate-50
          px-3
          text-sm text-slate-600
          outline-none
          transition-all
          hover:border-slate-300
          focus:border-blue-400
          focus:bg-white
          focus:ring-4
          focus:ring-blue-500/10
        "
      >
        <option value="Semua">{allLabel}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  // ==========================================================
  // SEARCHABLE SELECT
  // ==========================================================

  return (
    <div
      ref={dropdownRef}
      className="relative w-full"
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={
            searchText ||
            (value !== "Semua" ? value : "")
          }
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="
            h-10 w-full rounded-xl
            border border-slate-200
            bg-slate-50
            px-3 pr-8
            text-sm text-slate-700
            outline-none
            transition-all
            placeholder:text-slate-400
            focus:border-blue-400
            focus:bg-white
            focus:ring-4
            focus:ring-blue-500/10
          "
        />

        {searchText && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setSearchText("");
              onChange("Semua");
              inputRef.current?.focus();
            }}
            className="
              absolute right-8 top-1/2
              -translate-y-1/2
              text-slate-400
              transition
              hover:text-slate-600
            "
          >
            <X size={14} />
          </button>
        )}

        <ChevronDown
          size={14}
          className={`
            absolute right-2 top-1/2
            -translate-y-1/2
            text-slate-400
            transition-transform
            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </div>

      {isOpen && (
        <div
          className="
            absolute z-50 mt-1
            max-h-48 w-full
            overflow-auto
            rounded-xl
            border border-slate-200
            bg-white
            py-1
            shadow-lg
          "
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">
              Tidak ada hasil
            </div>
          ) : (
            <>
              <button
                type="button"
                onMouseDown={(event) =>
                  event.preventDefault()
                }
                onClick={() =>
                  handleSelect("Semua")
                }
                className="
                  w-full px-3 py-2
                  text-left text-sm
                  transition-colors
                  hover:bg-slate-50
                "
              >
                {allLabel}
              </button>

              {filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(event) =>
                    event.preventDefault()
                  }
                  onClick={() =>
                    handleSelect(option)
                  }
                  className="
                    w-full px-3 py-2
                    text-left text-sm
                    transition-colors
                    hover:bg-slate-50
                  "
                >
                  {option}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function LogAktivitasPage() {
  const [activeMenu, setActiveMenu] =
    useState("log-aktivitas");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [isMobile, setIsMobile] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedRole, setSelectedRole] =
    useState("Semua");

  const [selectedModule, setSelectedModule] =
    useState("Semua");

  const [selectedStatus, setSelectedStatus] =
    useState("Semua");

  const [selectedTime, setSelectedTime] =
    useState("week");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [sortField, setSortField] =
    useState("timestamp");

  const [sortOrder, setSortOrder] =
    useState("desc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [isLoading, setIsLoading] =
    useState(false);

  const itemsPerPage = 10;

  // ==========================================================
  // DATA API
  // ==========================================================

  // Sengaja kosong.
  // Nanti data backend tinggal dimasukkan ke state ini.
  const [logs, setLogs] = useState([]);

  // ==========================================================
  // MOBILE CHECK
  // ==========================================================

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

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const notifications = [];

  // ==========================================================
  // OPTIONS DARI DATA API
  // ==========================================================

  const roleOptions = useMemo(() => {
    return [
      ...new Set(
        logs
          .map((log) => log?.role)
          .filter(Boolean)
      ),
    ].sort();
  }, [logs]);

  const moduleOptions = useMemo(() => {
    return [
      ...new Set(
        logs
          .map((log) => log?.module)
          .filter(Boolean)
      ),
    ].sort();
  }, [logs]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => {
    const total = logs.length;

    const success = logs.filter(
      (log) => log.status === "success"
    ).length;

    const failed = logs.filter(
      (log) => log.status === "failed"
    ).length;

    const users = new Set(
      logs.map((log) => log.user)
    ).size;

    const modules = new Set(
      logs.map((log) => log.module)
    ).size;

    return {
      total,
      success,
      failed,
      users,
      modules,
    };
  }, [logs]);

  // ==========================================================
  // STATUS COLOR
  // ==========================================================

  const getStatusColor = (status) => {
    return status === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  };

  // ==========================================================
  // STATUS ICON
  // ==========================================================

  const getStatusIcon = (status) => {
    return status === "success" ? (
      <CheckCircle
        size={12}
        className="text-emerald-500"
      />
    ) : (
      <XCircle
        size={12}
        className="text-rose-500"
      />
    );
  };

  // ==========================================================
  // MODULE ICON
  // ==========================================================

  const getModuleIcon = (module) => {
    const icons = {
      Pengaturan: Settings,
      "Manajemen Siswa": GraduationCap,
      "Manajemen Guru": Users,
      "Manajemen Akses": Shield,
      Keuangan: DollarSign,
      Akademik: BookOpen,
      Keamanan: Lock,
      Laporan: BarChart,
      Presensi: Clock,
      "Sarana Prasarana": Building2,
      "Bimbingan Konseling": UserCog,
      PPDB: Users,
      Administrasi: FileText,
      CMS: Globe,
      Pembelajaran: GraduationCap,
      "Manajemen Pengguna": Users,
      "Manajemen SDM": Users,
      Integrasi: Link,
    };

    const Icon =
      icons[module] || Activity;

    return (
      <Icon
        size={14}
        className="text-slate-500"
      />
    );
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredData = useMemo(() => {
    return logs.filter((log) => {
      const keyword =
        searchQuery.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        log.user
          ?.toLowerCase()
          .includes(keyword) ||
        log.action
          ?.toLowerCase()
          .includes(keyword) ||
        log.ip
          ?.toLowerCase()
          .includes(keyword) ||
        log.module
          ?.toLowerCase()
          .includes(keyword) ||
        log.role
          ?.toLowerCase()
          .includes(keyword);

      const matchRole =
        selectedRole === "Semua" ||
        log.role === selectedRole;

      const matchModule =
        selectedModule === "Semua" ||
        log.module === selectedModule;

      const matchStatus =
        selectedStatus === "Semua" ||
        log.status === selectedStatus;

      let matchTime = true;

      if (log.timestamp) {
        const logDate =
          new Date(log.timestamp);

        const now = new Date();

        if (
          selectedTime === "today"
        ) {
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );

          matchTime =
            logDate >= today;
        }

        if (
          selectedTime === "yesterday"
        ) {
          const yesterday =
            new Date(now);

          yesterday.setDate(
            yesterday.getDate() - 1
          );

          const start =
            new Date(
              yesterday.getFullYear(),
              yesterday.getMonth(),
              yesterday.getDate()
            );

          const end =
            new Date(start);

          end.setDate(
            end.getDate() + 1
          );

          matchTime =
            logDate >= start &&
            logDate < end;
        }

        if (
          selectedTime === "week"
        ) {
          const weekAgo =
            new Date(now);

          weekAgo.setDate(
            weekAgo.getDate() - 7
          );

          matchTime =
            logDate >= weekAgo;
        }

        if (
          selectedTime === "month"
        ) {
          const monthAgo =
            new Date(now);

          monthAgo.setDate(
            monthAgo.getDate() - 30
          );

          matchTime =
            logDate >= monthAgo;
        }

        if (
          selectedTime === "custom" &&
          startDate &&
          endDate
        ) {
          const start =
            new Date(startDate);

          const end =
            new Date(endDate);

          end.setHours(
            23,
            59,
            59,
            999
          );

          matchTime =
            logDate >= start &&
            logDate <= end;
        }
      }

      return (
        matchSearch &&
        matchRole &&
        matchModule &&
        matchStatus &&
        matchTime
      );
    });
  }, [
    logs,
    searchQuery,
    selectedRole,
    selectedModule,
    selectedStatus,
    selectedTime,
    startDate,
    endDate,
  ]);

  // ==========================================================
  // SORT
  // ==========================================================

  const sortedData = useMemo(() => {
    return [...filteredData].sort(
      (a, b) => {
        if (
          sortField === "timestamp"
        ) {
          const dateA =
            new Date(
              a.timestamp || 0
            );

          const dateB =
            new Date(
              b.timestamp || 0
            );

          return sortOrder === "asc"
            ? dateA - dateB
            : dateB - dateA;
        }

        const valA =
          a[sortField]
            ?.toString()
            .toLowerCase() || "";

        const valB =
          b[sortField]
            ?.toString()
            .toLowerCase() || "";

        if (valA < valB) {
          return sortOrder === "asc"
            ? -1
            : 1;
        }

        if (valA > valB) {
          return sortOrder === "asc"
            ? 1
            : -1;
        }

        return 0;
      }
    );
  }, [
    filteredData,
    sortField,
    sortOrder,
  ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedData.length /
        itemsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const paginatedData =
    sortedData.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // ==========================================================
  // SORT HANDLER
  // ==========================================================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(
        sortOrder === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  // ==========================================================
  // SORT ICON
  // ==========================================================

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <span className="text-slate-300">
          <ArrowUp
            size={12}
            className="
              opacity-0
              transition
              group-hover:opacity-100
            "
          />
        </span>
      );
    }

    return sortOrder === "asc" ? (
      <ArrowUp
        size={12}
        className="text-blue-600"
      />
    ) : (
      <ArrowDown
        size={12}
        className="text-blue-600"
      />
    );
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRole("Semua");
    setSelectedModule("Semua");
    setSelectedStatus("Semua");
    setSelectedTime("week");
    setStartDate("");
    setEndDate("");
    setSortField("timestamp");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // ==========================================================
  // EXPORT
  // ==========================================================

  const handleExport = () => {
    if (!sortedData.length) {
      return;
    }

    console.log(
      "Export data:",
      sortedData
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          notifications={notifications}
          user={{
            name: "Super Admin",
            email:
              "admin@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-7 xl:p-8">
          <div
            className="
              mx-auto w-full
              max-w-[1600px]
              space-y-4
              sm:space-y-5
              lg:space-y-6
            "
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <section
              className="
                relative overflow-hidden
                rounded-2xl
                border border-slate-200
                bg-white
                shadow-[0_2px_10px_rgba(15,23,42,0.05)]
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute -right-20 -top-24
                  h-64 w-64
                  rounded-full
                  bg-blue-50/70
                  blur-3xl
                "
              />

              <div
                className="
                  relative flex flex-col
                  gap-4 p-5
                  sm:p-6
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  lg:px-8
                  lg:py-6
                "
              >
                <div
                  className="
                    flex min-w-0
                    items-start
                    gap-3 sm:gap-4
                  "
                >
                  <div
                    className="
                      flex h-11 w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-blue-600
                      to-indigo-600
                      text-white
                      shadow-[0_8px_20px_rgba(37,99,235,0.25)]
                      sm:h-14
                      sm:w-14
                    "
                  >
                    <Activity
                      size={22}
                      strokeWidth={1.9}
                      className="
                        sm:h-[25px]
                        sm:w-[25px]
                      "
                    />
                  </div>

                  <div className="min-w-0">
                    <div
                      className="
                        flex flex-wrap
                        items-center gap-2
                      "
                    >
                      <h1
                        className="
                          text-xl
                          font-semibold
                          tracking-[-0.025em]
                          text-slate-900
                          sm:text-2xl
                          lg:text-[26px]
                        "
                      >
                        Log Aktivitas
                      </h1>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-blue-100
                          bg-blue-50
                          px-2.5 py-0.5
                          text-[10px]
                          font-semibold
                          text-blue-600
                          sm:px-3
                          sm:py-1
                          sm:text-[11px]
                        "
                      >
                        <span
                          className="
                            h-1.5 w-1.5
                            rounded-full
                            bg-blue-500
                          "
                        />

                        Monitoring
                      </span>
                    </div>

                    <div
                      className="
                        mt-1 flex
                        items-center
                        gap-1.5 sm:gap-2
                      "
                    >
                      <Clock
                        size={13}
                        className="
                          shrink-0
                          text-blue-400
                          sm:h-[14px]
                          sm:w-[14px]
                        "
                      />

                      <p
                        className="
                          text-xs
                          leading-5
                          text-slate-500
                          sm:text-sm
                        "
                      >
                        Pantau seluruh
                        aktivitas pengguna
                        di sistem SmartSchool.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    flex w-full
                    flex-wrap gap-2
                    lg:w-auto
                  "
                >
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="
                      inline-flex
                      h-10
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-600
                      shadow-[0_2px_5px_rgba(15,23,42,0.05)]
                      transition-all
                      hover:border-slate-300
                      hover:bg-slate-50
                      hover:text-slate-800
                      active:scale-[0.98]
                      disabled:opacity-60
                      sm:h-11
                      sm:flex-none
                      sm:px-5
                    "
                  >
                    <RefreshCw
                      size={16}
                      className={
                        isLoading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    {isLoading
                      ? "Memuat..."
                      : "Refresh"}
                  </button>

                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={!sortedData.length}
                    className="
                      inline-flex
                      h-10
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-600
                      shadow-[0_2px_5px_rgba(15,23,42,0.05)]
                      transition-all
                      hover:border-slate-300
                      hover:bg-slate-50
                      hover:text-slate-800
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      sm:h-11
                      sm:flex-none
                      sm:px-5
                    "
                  >
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>
            </section>

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div
              className="
                grid grid-cols-2
                gap-3
                sm:grid-cols-3
                lg:grid-cols-5
              "
            >
              <StatCard
                label="Total Aktivitas"
                value={stats.total}
                icon={Activity}
                color="blue"
              />

              <StatCard
                label="Berhasil"
                value={stats.success}
                icon={CheckCircle}
                color="emerald"
              />

              <StatCard
                label="Gagal"
                value={stats.failed}
                icon={XCircle}
                color="rose"
              />

              <StatCard
                label="Pengguna Aktif"
                value={stats.users}
                icon={Users}
                color="indigo"
              />

              <StatCard
                label="Modul Terakses"
                value={stats.modules}
                icon={Database}
                color="amber"
              />
            </div>

            {/* ==================================================
                FILTER
            ================================================== */}

            <section
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-4
                shadow-[0_2px_10px_rgba(15,23,42,0.04)]
                sm:p-5
              "
            >
              <div
                className="
                  mb-4 flex
                  items-center
                  gap-2 sm:gap-3
                "
              >
                <div
                  className="
                    flex h-8 w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-100
                    text-blue-600
                    sm:h-9 sm:w-9
                  "
                >
                  <Filter
                    size={14}
                    className="
                      sm:h-[16px]
                      sm:w-[16px]
                    "
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >
                    Filter & Pencarian
                  </p>

                  <p
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    Filter dan cari aktivitas
                    berdasarkan kriteria
                  </p>
                </div>
              </div>

              <div
                className="
                  grid gap-3
                  sm:grid-cols-2
                  lg:grid-cols-4
                  xl:grid-cols-5
                "
              >
                {/* SEARCH */}

                <div className="relative">
                  <Search
                    size={15}
                    className="
                      absolute left-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="text"
                    placeholder="Cari aktivitas..."
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(
                        event.target.value
                      );
                      setCurrentPage(1);
                    }}
                    className="
                      h-10 w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-9 pr-3
                      text-sm
                      text-slate-700
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* ROLE */}

                <SmartFilterSelect
                  value={selectedRole}
                  onChange={(value) => {
                    setSelectedRole(value);
                    setCurrentPage(1);
                  }}
                  options={roleOptions}
                  placeholder="Cari role..."
                  allLabel="Semua Role"
                />

                {/* MODULE */}

                <SmartFilterSelect
                  value={selectedModule}
                  onChange={(value) => {
                    setSelectedModule(value);
                    setCurrentPage(1);
                  }}
                  options={moduleOptions}
                  placeholder="Cari modul..."
                  allLabel="Semua Modul"
                />

                {/* STATUS */}

                <select
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="
                    h-10 w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    text-sm
                    text-slate-600
                    outline-none
                    transition-all
                    hover:border-slate-300
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                >
                  {statusOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>

                {/* TIME */}

                <select
                  value={selectedTime}
                  onChange={(event) => {
                    setSelectedTime(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="
                    h-10 w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    text-sm
                    text-slate-600
                    outline-none
                    transition-all
                    hover:border-slate-300
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                >
                  {timeOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* CUSTOM DATE */}

              {selectedTime ===
                "custom" && (
                <div
                  className="
                    mt-3 grid
                    grid-cols-1
                    gap-3
                    border-t
                    border-slate-100
                    pt-3
                    sm:grid-cols-2
                  "
                >
                  <div>
                    <label
                      className="
                        mb-1 block
                        text-xs
                        font-medium
                        text-slate-600
                      "
                    >
                      Tanggal Mulai
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(
                          event.target.value
                        )
                      }
                      className="
                        h-10 w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        text-sm
                        text-slate-700
                        outline-none
                        transition-all
                        focus:border-blue-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  <div>
                    <label
                      className="
                        mb-1 block
                        text-xs
                        font-medium
                        text-slate-600
                      "
                    >
                      Tanggal Akhir
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(
                          event.target.value
                        )
                      }
                      className="
                        h-10 w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-3
                        text-sm
                        text-slate-700
                        outline-none
                        transition-all
                        focus:border-blue-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>
                </div>
              )}

              {/* FILTER FOOTER */}

              <div
                className="
                  mt-3 flex
                  flex-col gap-2
                  border-t
                  border-slate-100
                  pt-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  Menampilkan{" "}
                  <span
                    className="
                      font-semibold
                      text-slate-600
                    "
                  >
                    {filteredData.length}
                  </span>{" "}
                  aktivitas
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    self-start
                    rounded-lg
                    px-3 py-1.5
                    text-xs
                    font-medium
                    text-slate-500
                    transition-colors
                    hover:bg-slate-100
                    hover:text-slate-700
                    sm:self-auto
                  "
                >
                  Reset Semua
                </button>
              </div>
            </section>

            {/* ==================================================
                TABLE
            ================================================== */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border border-slate-200
                bg-white
                shadow-[0_3px_14px_rgba(15,23,42,0.05)]
              "
            >
              {isMobile ? (
                <div className="divide-y divide-slate-100">
                  {paginatedData.length ===
                  0 ? (
                    <EmptyState />
                  ) : (
                    paginatedData.map(
                      (log) => (
                        <MobileLogCard
                          key={log.id}
                          log={log}
                        />
                      )
                    )
                  )}
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse">
                    <thead>
                      <tr
                        className="
                          border-b
                          border-slate-200
                          bg-slate-50/80
                        "
                      >
                        <TableHead
                          sortable
                          onClick={() =>
                            handleSort("user")
                          }
                        >
                          <span className="group flex cursor-pointer items-center gap-1">
                            Pengguna
                            {renderSortIcon(
                              "user"
                            )}
                          </span>
                        </TableHead>

                        <TableHead
                          sortable
                          onClick={() =>
                            handleSort("role")
                          }
                        >
                          <span className="group flex cursor-pointer items-center gap-1">
                            Role
                            {renderSortIcon(
                              "role"
                            )}
                          </span>
                        </TableHead>

                        <TableHead
                          sortable
                          onClick={() =>
                            handleSort(
                              "module"
                            )
                          }
                        >
                          <span className="group flex cursor-pointer items-center gap-1">
                            Modul
                            {renderSortIcon(
                              "module"
                            )}
                          </span>
                        </TableHead>

                        <TableHead
                          sortable
                          onClick={() =>
                            handleSort(
                              "action"
                            )
                          }
                        >
                          <span className="group flex cursor-pointer items-center gap-1">
                            Aktivitas
                            {renderSortIcon(
                              "action"
                            )}
                          </span>
                        </TableHead>

                        <TableHead
                          sortable
                          onClick={() =>
                            handleSort(
                              "status"
                            )
                          }
                        >
                          <span className="group flex cursor-pointer items-center gap-1">
                            Status
                            {renderSortIcon(
                              "status"
                            )}
                          </span>
                        </TableHead>

                        <TableHead
                          sortable
                          onClick={() =>
                            handleSort(
                              "timestamp"
                            )
                          }
                        >
                          <span className="group flex cursor-pointer items-center gap-1">
                            Waktu
                            {renderSortIcon(
                              "timestamp"
                            )}
                          </span>
                        </TableHead>

                        <TableHead>
                          IP
                        </TableHead>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paginatedData.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-16"
                          >
                            <EmptyState />
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map(
                          (log) => {
                            const statusClass =
                              getStatusColor(
                                log.status
                              );

                            return (
                              <tr
                                key={log.id}
                                className="
                                  transition-colors
                                  hover:bg-slate-50/70
                                "
                              >
                                <td className="px-4 py-3.5">
                                  <span className="text-sm font-medium text-slate-800">
                                    {log.user}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                                    {log.role}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                                    {getModuleIcon(
                                      log.module
                                    )}

                                    {log.module}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="text-sm text-slate-700">
                                    {log.action}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span
                                    className={`
                                      inline-flex
                                      items-center
                                      gap-1.5
                                      rounded-full
                                      border
                                      px-2.5 py-1
                                      text-xs
                                      font-medium
                                      ${statusClass}
                                    `}
                                  >
                                    {getStatusIcon(
                                      log.status
                                    )}

                                    {log.status ===
                                    "success"
                                      ? "Berhasil"
                                      : "Gagal"}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="text-sm text-slate-500">
                                    {log.timestamp}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="font-mono text-xs text-slate-400">
                                    {log.ip}
                                  </span>
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

              <div
                className="
                  flex flex-col
                  gap-3
                  border-t
                  border-slate-200
                  px-4 py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-5
                "
              >
                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-700">
                    {paginatedData.length ===
                    0
                      ? 0
                      : startIndex + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      startIndex +
                        paginatedData.length,
                      sortedData.length
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-700">
                    {sortedData.length}
                  </span>{" "}
                  data
                </p>

                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        Math.max(
                          1,
                          currentPage - 1
                        )
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                    className="
                      flex h-9 w-9
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      text-slate-400
                      transition-all
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ArrowUp
                      size={14}
                      className="-rotate-90"
                    />
                  </button>

                  {sortedData.length >
                    0 &&
                    [...Array(
                      Math.min(
                        totalPages,
                        5
                      )
                    )].map(
                      (_, index) => {
                        const page =
                          index + 1;

                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() =>
                              setCurrentPage(
                                page
                              )
                            }
                            className={`
                              flex h-9 w-9
                              items-center
                              justify-center
                              rounded-lg
                              text-xs
                              font-semibold
                              transition-all
                              ${
                                currentPage ===
                                page
                                  ? "bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]"
                                  : "text-slate-500 hover:bg-slate-100"
                              }
                            `}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                  {sortedData.length >
                    0 &&
                    totalPages > 5 && (
                      <>
                        <span className="px-0.5 text-slate-400">
                          …
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              totalPages
                            )
                          }
                          className={`
                            flex h-9 w-9
                            items-center
                            justify-center
                            rounded-lg
                            text-xs
                            font-semibold
                            transition-all
                            ${
                              currentPage ===
                              totalPages
                                ? "bg-blue-600 text-white"
                                : "text-slate-500 hover:bg-slate-100"
                            }
                          `}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                  <button
                    type="button"
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
                      totalPages === 0 ||
                      sortedData.length === 0
                    }
                    className="
                      flex h-9 w-9
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      text-slate-400
                      transition-all
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ArrowDown
                      size={14}
                      className="-rotate-90"
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div
              className="
                border-t
                border-slate-200/70
                pt-4
                text-center
                sm:pt-5
              "
            >
              <p
                className="
                  text-xs
                  text-slate-400
                "
              >
                © 2026 SmartSchool •
                Log Aktivitas
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
    },

    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },

    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
    },

    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },

    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
  };

  const styles =
    colorMap[color] ||
    colorMap.blue;

  return (
    <div
      className="
        group rounded-2xl
        border border-slate-200
        bg-white
        p-3.5
        shadow-[0_2px_10px_rgba(15,23,42,0.04)]
        transition-all
        hover:-translate-y-0.5
        hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)]
        sm:p-4
      "
    >
      <div
        className="
          flex items-center
          gap-2 sm:gap-3
        "
      >
        <div
          className={`
            flex h-8 w-8
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${styles.bg}
            ${styles.text}
            sm:h-9 sm:w-9
          `}
        >
          <Icon
            size={14}
            className="
              sm:h-[16px]
              sm:w-[16px]
            "
          />
        </div>

        <div className="min-w-0">
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.06em]
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className="
              text-base
              font-semibold
              tracking-tight
              text-slate-800
              sm:text-lg
            "
          >
            {typeof value ===
            "number"
              ? value.toLocaleString(
                  "id-ID"
                )
              : value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TABLE HEAD
// ============================================================

function TableHead({
  children,
  sortable = false,
  onClick,
}) {
  return (
    <th
      className="
        px-4 py-3
        text-left
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-slate-400
      "
    >
      {sortable ? (
        <button
          type="button"
          onClick={onClick}
          className="
            group flex
            items-center
            gap-1
            transition-colors
            hover:text-blue-600
          "
        >
          {children}
        </button>
      ) : (
        children
      )}
    </th>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {
  return (
    <div
      className="
        flex flex-col
        items-center
        justify-center
        py-12
        text-center
      "
    >
      <div
        className="
          flex h-14 w-14
          items-center
          justify-center
          rounded-2xl
          bg-slate-100
          text-slate-400
        "
      >
        <Activity size={24} />
      </div>

      <p
        className="
          mt-4
          text-sm
          font-semibold
          text-slate-700
        "
      >
        Belum ada aktivitas
      </p>

      <p
        className="
          mt-1
          text-xs
          text-slate-400
        "
      >
        Data aktivitas pengguna
        akan muncul setelah
        tersedia.
      </p>
    </div>
  );
}

// ============================================================
// MOBILE LOG CARD
// ============================================================

function MobileLogCard({ log }) {
  const statusClass =
    log.status === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div
      className="
        p-4
        transition-colors
        hover:bg-slate-50/50
      "
    >
      <div
        className="
          flex items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0 flex-1">
          <div
            className="
              flex flex-wrap
              items-center
              gap-2
            "
          >
            <span
              className="
                text-sm
                font-semibold
                text-slate-800
              "
            >
              {log.user}
            </span>

            <span
              className="
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                px-2 py-0.5
                text-[10px]
                font-medium
                text-slate-600
              "
            >
              {log.role}
            </span>
          </div>

          <p
            className="
              mt-1
              text-sm
              text-slate-700
            "
          >
            {log.action}
          </p>

          <div
            className="
              mt-2
              flex flex-wrap
              items-center
              gap-1.5
            "
          >
            <span
              className="
                text-xs
                text-slate-500
              "
            >
              {log.module}
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span
              className="
                text-xs
                text-slate-400
              "
            >
              {log.timestamp}
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span
              className="
                font-mono
                text-xs
                text-slate-400
              "
            >
              {log.ip}
            </span>
          </div>
        </div>

        <span
          className={`
            inline-flex
            shrink-0
            items-center
            gap-1
            rounded-full
            border
            px-2 py-0.5
            text-[10px]
            font-medium
            ${statusClass}
          `}
        >
          {log.status ===
          "success" ? (
            <CheckCircle size={10} />
          ) : (
            <XCircle size={10} />
          )}

          {log.status ===
          "success"
            ? "Berhasil"
            : "Gagal"}
        </span>
      </div>
    </div>
  );
}

