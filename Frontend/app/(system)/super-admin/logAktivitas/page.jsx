"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getAuditLogs } from "@/services/auditLog.service";

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
  BarChart3,
  Building2,
  UserCog,
  FileText,
  Globe,
  ChevronDown,
  X,
} from "lucide-react";

/* ============================================================
   THEME HELPERS
============================================================ */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* ============================================================
   SMART FILTER SELECT
============================================================ */

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
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;

    return options.filter((option) =>
      String(option.label || option.value || "")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setSearchText("");
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    setSearchText(event.target.value);
    setIsOpen(true);
  };

  if (useDropdown) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`
          h-10 w-full rounded-xl
          border theme-border
          ${themeNeutralSurface}
          px-3
          text-sm theme-text-secondary
          outline-none
          transition-all
          hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]
          ${themeFocus}
        `}
      >
        <option value="all">
          {allLabel}
        </option>

        {options
          .filter((option) => option.value !== "all")
          .map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
      </select>
    );
  }

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
            (value !== "all"
              ? selectedOption?.label || value
              : "")
          }
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`
            h-10 w-full rounded-xl
            border theme-border
            ${themeNeutralSurface}
            px-3 pr-8
            text-sm theme-text
            outline-none
            transition-all
            placeholder:theme-text-placeholder
            ${themeFocus}
          `}
        />

        {searchText && (
          <button
            type="button"
            onClick={() => {
              setSearchText("");
              onChange("all");
              inputRef.current?.focus();
            }}
            className="
              absolute right-8 top-1/2
              -translate-y-1/2
              theme-text-muted
              transition
              hover:text-[var(--color-text)]
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
            theme-text-muted
            transition-transform
            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-1
            max-h-48 w-full
            overflow-auto
            rounded-xl
            border theme-border
            bg-[var(--color-card)]
            py-1
            ${themeCardShadow}
          `}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm theme-text-muted">
              Tidak ada hasil
            </div>
          ) : (
            filteredOptions.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleSelect(option.value)
                  }
                  className={`
                    flex w-full
                    items-center
                    justify-between
                    px-3 py-2
                    text-left text-sm
                    theme-text-secondary
                    transition-colors
                    ${themeNeutralHover}
                  `}
                >
                  <span>{option.label}</span>

                  {active && (
                    <CheckCircle
                      size={14}
                      className={themePrimaryText}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function LogAktivitasPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRole, setSelectedRole] =
    useState("all");

  const [selectedModule, setSelectedModule] =
    useState("all");

  const [selectedStatus, setSelectedStatus] =
    useState("all");

  const [selectedTime, setSelectedTime] =
    useState("week");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sortField, setSortField] =
    useState("timestamp");

  const [sortOrder, setSortOrder] =
    useState("desc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [isLoading, setIsLoading] =
    useState(false);

  const [logs, setLogs] = useState([]);

  const itemsPerPage = 10;

  /* ============================================================
     LOAD AUDIT LOG
  ============================================================ */

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);

      const response = await getAuditLogs({
        page: 1,
        limit: 100,
      });

      const responseData = response?.data;

      const data = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
        ? responseData.data
        : [];

      const mappedLogs = data.map((item) => ({
        id: item?.id || "-",
        user:
          item?.pengguna?.namaLengkap ||
          item?.penggunaId ||
          "-",
        role:
          item?.pengguna?.peran?.nama ||
          "-",
        module: item?.modul || "-",
        action: item?.aksi || "-",
        status: item?.status || "success",
        timestamp: item?.waktu || null,
        ip:
          item?.ipAddress ||
          item?.ip ||
          "-",
      }));

      setLogs(mappedLogs);
      setCurrentPage(1);
    } catch (error) {
      console.error(
        "Gagal mengambil audit log:",
        error
      );

      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  /* ============================================================
     OPTIONS
  ============================================================ */

  const roleOptions = useMemo(() => {
    const roles = [
      ...new Set(
        logs
          .map((log) => log.role)
          .filter(Boolean)
      ),
    ];

    return [
      {
        value: "all",
        label: "Semua Role",
      },
      ...roles.map((role) => ({
        value: role,
        label: role,
      })),
    ];
  }, [logs]);

  const moduleOptions = useMemo(() => {
    const modules = [
      ...new Set(
        logs
          .map((log) => log.module)
          .filter(Boolean)
      ),
    ];

    return [
      {
        value: "all",
        label: "Semua Modul",
      },
      ...modules.map((module) => ({
        value: module,
        label: module,
      })),
    ];
  }, [logs]);

  const statusOptions = [
    {
      value: "all",
      label: "Semua Status",
    },
    {
      value: "success",
      label: "Berhasil",
    },
    {
      value: "failed",
      label: "Gagal",
    },
  ];

  const timeOptions = [
    {
      value: "all",
      label: "Semua Waktu",
    },
    {
      value: "today",
      label: "Hari Ini",
    },
    {
      value: "week",
      label: "7 Hari Terakhir",
    },
    {
      value: "month",
      label: "30 Hari Terakhir",
    },
    {
      value: "custom",
      label: "Rentang Custom",
    },
  ];

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredLogs = useMemo(() => {
    const now = new Date();

    return logs.filter((log) => {
      const search =
        searchQuery.trim().toLowerCase();

      const matchesSearch =
        !search ||
        String(log.user || "")
          .toLowerCase()
          .includes(search) ||
        String(log.role || "")
          .toLowerCase()
          .includes(search) ||
        String(log.module || "")
          .toLowerCase()
          .includes(search) ||
        String(log.action || "")
          .toLowerCase()
          .includes(search) ||
        String(log.ip || "")
          .toLowerCase()
          .includes(search);

      if (!matchesSearch) return false;

      if (
        selectedRole !== "all" &&
        log.role !== selectedRole
      ) {
        return false;
      }

      if (
        selectedModule !== "all" &&
        log.module !== selectedModule
      ) {
        return false;
      }

      if (
        selectedStatus !== "all" &&
        log.status !== selectedStatus
      ) {
        return false;
      }

      if (
        selectedTime !== "all" &&
        log.timestamp
      ) {
        const logDate = new Date(
          log.timestamp
        );

        if (
          Number.isNaN(
            logDate.getTime()
          )
        ) {
          return true;
        }

        if (selectedTime === "today") {
          if (
            logDate.toDateString() !==
            now.toDateString()
          ) {
            return false;
          }
        }

        if (selectedTime === "week") {
          const sevenDaysAgo = new Date(
            now
          );

          sevenDaysAgo.setDate(
            now.getDate() - 7
          );

          if (logDate < sevenDaysAgo) {
            return false;
          }
        }

        if (selectedTime === "month") {
          const thirtyDaysAgo = new Date(
            now
          );

          thirtyDaysAgo.setDate(
            now.getDate() - 30
          );

          if (
            logDate < thirtyDaysAgo
          ) {
            return false;
          }
        }

        if (
          selectedTime === "custom" &&
          startDate &&
          endDate
        ) {
          const start = new Date(
            startDate
          );

          const end = new Date(endDate);

          end.setHours(
            23,
            59,
            59,
            999
          );

          if (
            logDate < start ||
            logDate > end
          ) {
            return false;
          }
        }
      }

      return true;
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

  /* ============================================================
     SORT
  ============================================================ */

  const sortedLogs = useMemo(() => {
    const result = [...filteredLogs];

    result.sort((a, b) => {
      let valueA = a?.[sortField];
      let valueB = b?.[sortField];

      if (sortField === "timestamp") {
        valueA = valueA
          ? new Date(valueA).getTime()
          : 0;

        valueB = valueB
          ? new Date(valueB).getTime()
          : 0;
      } else {
        valueA = String(
          valueA ?? ""
        ).toLowerCase();

        valueB = String(
          valueB ?? ""
        ).toLowerCase();
      }

      if (valueA < valueB) {
        return sortOrder === "asc"
          ? -1
          : 1;
      }

      if (valueA > valueB) {
        return sortOrder === "asc"
          ? 1
          : -1;
      }

      return 0;
    });

    return result;
  }, [
    filteredLogs,
    sortField,
    sortOrder,
  ]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedLogs.length /
        itemsPerPage
    )
  );

  const paginatedLogs = useMemo(() => {
    const start =
      (currentPage - 1) *
      itemsPerPage;

    return sortedLogs.slice(
      start,
      start + itemsPerPage
    );
  }, [
    sortedLogs,
    currentPage,
  ]);

  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* ============================================================
     STATISTICS
  ============================================================ */

  const stats = useMemo(() => {
    return {
      total: logs.length,

      success: logs.filter(
        (log) =>
          log.status === "success"
      ).length,

      failed: logs.filter(
        (log) =>
          log.status === "failed"
      ).length,

      users: new Set(
        logs
          .map((log) => log.user)
          .filter(Boolean)
      ).size,

      modules: new Set(
        logs
          .map((log) => log.module)
          .filter(Boolean)
      ).size,
    };
  }, [logs]);

  /* ============================================================
     HELPERS
  ============================================================ */

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return new Intl.DateTimeFormat(
      "id-ID",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  };

  const getModuleIcon = (module) => {
    const value = String(
      module || ""
    ).toLowerCase();

    if (value.includes("siswa"))
      return Users;

    if (value.includes("guru"))
      return GraduationCap;

    if (
      value.includes("presensi") ||
      value.includes("absen")
    )
      return Clock;

    if (
      value.includes("keuangan")
    )
      return DollarSign;

    if (
      value.includes("akademik") ||
      value.includes("nilai")
    )
      return BookOpen;

    if (
      value.includes("akses") ||
      value.includes("role") ||
      value.includes("permission")
    )
      return Shield;

    if (
      value.includes("pengguna") ||
      value.includes("user")
    )
      return UserCog;

    if (
      value.includes("pengaturan")
    )
      return Settings;

    if (
      value.includes("keamanan")
    )
      return Lock;

    if (
      value.includes("laporan")
    )
      return BarChart3;

    if (
      value.includes("sekolah")
    )
      return Building2;

    if (
      value.includes("database")
    )
      return Database;

    if (
      value.includes("dokumen") ||
      value.includes("administrasi")
    )
      return FileText;

    return Activity;
  };

  const getStatusStyle = (status) => {
    if (status === "success") {
      return {
        surface:
          themeSuccessSurface,
        text:
          "text-[var(--color-success)]",
        border:
          themeSuccessBorder,
      };
    }

    return {
      surface:
        themeDangerSurface,
      text:
        "theme-text-secondary",
      border:
        themeDangerBorder,
    };
  };

  const getStatusIcon = (status) => {
    return status === "success" ? (
      <CheckCircle
        size={12}
        className="text-[var(--color-success)]"
      />
    ) : (
      <XCircle
        size={12}
        className="theme-text-muted"
      />
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) =>
        prev === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <span className="theme-text-muted opacity-50">
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
        className={themePrimaryText}
      />
    ) : (
      <ArrowDown
        size={12}
        className={themePrimaryText}
      />
    );
  };

  const handleRefresh = async () => {
    await loadAuditLogs();
  };

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedModule("all");
    setSelectedStatus("all");
    setSelectedTime("week");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!sortedLogs.length) return;

    const headers = [
      "User",
      "Role",
      "Modul",
      "Aksi",
      "Status",
      "Waktu",
      "IP Address",
    ];

    const rows = sortedLogs.map(
      (log) => [
        log.user,
        log.role,
        log.module,
        log.action,
        log.status,
        formatDateTime(
          log.timestamp
        ),
        log.ip,
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(
              value ?? ""
            ).replace(
              /"/g,
              '""'
            );

            return `"${text}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `audit-log-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="theme-page theme-text min-h-full">
      <div
        className="
          mx-auto w-full
          max-w-[1600px]
          space-y-4
          px-4 py-5
          sm:space-y-5
          sm:px-6 sm:py-6
          lg:space-y-6
          lg:px-8 lg:py-8
        "
      >
        {/* HEADER */}

        <section
          className={`
            relative overflow-hidden
            rounded-2xl
            border theme-border
            theme-card
            ${themeCardShadow}
          `}
        >
          <div
            className="
              pointer-events-none
              absolute -right-20 -top-24
              h-64 w-64
              rounded-full
              bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
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
                className={`
                  flex h-11 w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${themePrimaryGradient}
                  text-[var(--color-card)]
                  ${themePrimaryShadow}
                  sm:h-14
                  sm:w-14
                `}
              >
                <Activity
                  size={22}
                  strokeWidth={1.9}
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
                      theme-text
                      sm:text-2xl
                      lg:text-[26px]
                    "
                  >
                    Log Aktivitas
                  </h1>

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      ${themePrimarySoftBorder}
                      ${themePrimarySoft}
                      px-2.5 py-0.5
                      text-[10px]
                      font-semibold
                      ${themePrimaryText}
                      sm:px-3
                      sm:py-1
                      sm:text-[11px]
                    `}
                  >
                    <span
                      className="
                        h-1.5 w-1.5
                        rounded-full
                        bg-[var(--color-primary)]
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
                    className={`
                      shrink-0
                      ${themePrimaryText}
                      opacity-70
                    `}
                  />

                  <p
                    className="
                      text-xs
                      leading-5
                      theme-text-muted
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
                className={`
                  inline-flex
                  h-10
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border theme-border
                  ${themeNeutralSurface}
                  px-4
                  text-sm
                  font-medium
                  theme-text-secondary
                  ${themeSmallShadow}
                  transition-all
                  ${themeNeutralHover}
                  hover:text-[var(--color-text)]
                  active:scale-[0.98]
                  disabled:opacity-60
                  sm:h-11
                  sm:flex-none
                  sm:px-5
                `}
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
                disabled={
                  !sortedLogs.length
                }
                className={`
                  inline-flex
                  h-10
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border theme-border
                  ${themeNeutralSurface}
                  px-4
                  text-sm
                  font-medium
                  theme-text-secondary
                  ${themeSmallShadow}
                  transition-all
                  ${themeNeutralHover}
                  hover:text-[var(--color-text)]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  sm:h-11
                  sm:flex-none
                  sm:px-5
                `}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </section>

        {/* STATISTICS */}

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
            color="primary"
          />

          <StatCard
            label="Berhasil"
            value={stats.success}
            icon={CheckCircle}
            color="success"
          />

          <StatCard
            label="Gagal"
            value={stats.failed}
            icon={XCircle}
            color="danger"
          />

          <StatCard
            label="Pengguna Aktif"
            value={stats.users}
            icon={Users}
            color="info"
          />

          <StatCard
            label="Modul Terakses"
            value={stats.modules}
            icon={Database}
            color="warning"
          />
        </div>

        {/* FILTER */}

        <section
          className={`
            rounded-2xl
            border theme-border
            theme-card
            p-4
            ${themeCardShadow}
            sm:p-5
          `}
        >
          <div
            className="
              mb-4 flex
              items-center
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
                ${themePrimarySoft}
                ${themePrimaryText}
                sm:h-9 sm:w-9
              `}
            >
              <Filter size={15} />
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  theme-text
                "
              >
                Filter & Pencarian
              </p>

              <p
                className="
                  text-xs
                  theme-text-muted
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
                  theme-text-muted
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
                className={`
                  h-10 w-full
                  rounded-xl
                  border theme-border
                  ${themeNeutralSurface}
                  pl-9 pr-3
                  text-sm
                  theme-text
                  outline-none
                  transition-all
                  placeholder:theme-text-placeholder
                  ${themeFocus}
                `}
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
              className={`
                h-10 w-full
                rounded-xl
                border theme-border
                ${themeNeutralSurface}
                px-3
                text-sm
                theme-text-secondary
                outline-none
                transition-all
                ${themeFocus}
              `}
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
              className={`
                h-10 w-full
                rounded-xl
                border theme-border
                ${themeNeutralSurface}
                px-3
                text-sm
                theme-text-secondary
                outline-none
                transition-all
                ${themeFocus}
              `}
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

          {selectedTime === "custom" && (
            <div
              className={`
                mt-3 grid
                grid-cols-1
                gap-3
                border-t
                ${themeDivider}
                pt-3
                sm:grid-cols-2
              `}
            >
              <div>
                <label
                  className="
                    mb-1 block
                    text-xs
                    font-medium
                    theme-text-secondary
                  "
                >
                  Tanggal Mulai
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className={`
                    h-10 w-full
                    rounded-xl
                    border theme-border
                    ${themeNeutralSurface}
                    px-3
                    text-sm
                    theme-text
                    outline-none
                    transition-all
                    ${themeFocus}
                  `}
                />
              </div>

              <div>
                <label
                  className="
                    mb-1 block
                    text-xs
                    font-medium
                    theme-text-secondary
                  "
                >
                  Tanggal Akhir
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className={`
                    h-10 w-full
                    rounded-xl
                    border theme-border
                    ${themeNeutralSurface}
                    px-3
                    text-sm
                    theme-text
                    outline-none
                    transition-all
                    ${themeFocus}
                  `}
                />
              </div>
            </div>
          )}

          {/* FILTER FOOTER */}

          <div
            className={`
              mt-3 flex
              flex-col gap-2
              border-t
              ${themeDivider}
              pt-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            `}
          >
            <p
              className="
                text-xs
                theme-text-muted
              "
            >
              Menampilkan{" "}
              <span
                className="
                  font-semibold
                  theme-text-secondary
                "
              >
                {filteredLogs.length}
              </span>{" "}
              aktivitas
            </p>

            <button
              type="button"
              onClick={handleResetFilter}
              className={`
                self-start
                rounded-lg
                px-3 py-1.5
                text-xs
                font-medium
                theme-text-muted
                transition-colors
                ${themeNeutralHover}
                hover:text-[var(--color-text)]
                sm:self-auto
              `}
            >
              Reset Semua
            </button>
          </div>
        </section>

        {/* TABLE */}

        <section
          className={`
            overflow-hidden
            rounded-2xl
            border theme-border
            theme-card
            ${themeCardShadow}
          `}
        >
          {/* DESKTOP */}

          <div className="hidden w-full overflow-x-auto lg:block">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr
                  className={`
                    border-b
                    ${themeDivider}
                    ${themeNeutralSurface}
                  `}
                >
                  <TableHead
                    sortable
                    onClick={() =>
                      handleSort("user")
                    }
                  >
                    <span className="group flex cursor-pointer items-center gap-1">
                      Pengguna
                      {renderSortIcon("user")}
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
                      {renderSortIcon("role")}
                    </span>
                  </TableHead>

                  <TableHead
                    sortable
                    onClick={() =>
                      handleSort("module")
                    }
                  >
                    <span className="group flex cursor-pointer items-center gap-1">
                      Modul
                      {renderSortIcon("module")}
                    </span>
                  </TableHead>

                  <TableHead
                    sortable
                    onClick={() =>
                      handleSort("action")
                    }
                  >
                    <span className="group flex cursor-pointer items-center gap-1">
                      Aktivitas
                      {renderSortIcon("action")}
                    </span>
                  </TableHead>

                  <TableHead
                    sortable
                    onClick={() =>
                      handleSort("status")
                    }
                  >
                    <span className="group flex cursor-pointer items-center gap-1">
                      Status
                      {renderSortIcon("status")}
                    </span>
                  </TableHead>

                  <TableHead
                    sortable
                    onClick={() =>
                      handleSort("timestamp")
                    }
                  >
                    <span className="group flex cursor-pointer items-center gap-1">
                      Waktu
                      {renderSortIcon("timestamp")}
                    </span>
                  </TableHead>

                  <TableHead>
                    IP
                  </TableHead>
                </tr>
              </thead>

              <tbody
                className={`
                  divide-y
                  ${themeDivider}
                `}
              >
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16"
                    >
                      <LoadingState />
                    </td>
                  </tr>
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16"
                    >
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => {
                    const statusStyle =
                      getStatusStyle(
                        log.status
                      );

                    const ModuleIcon =
                      getModuleIcon(
                        log.module
                      );

                    return (
                      <tr
                        key={log.id}
                        className="
                          transition-colors
                          hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]
                        "
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                                flex h-9 w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                ${themePrimarySoft}
                                ${themePrimaryText}
                                text-xs
                                font-semibold
                              `}
                            >
                              {String(
                                log.user || "-"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <span
                                className="
                                  block
                                  truncate
                                  text-sm
                                  font-medium
                                  theme-text
                                "
                              >
                                {log.user}
                              </span>

                              <span
                                className="
                                  block
                                  truncate
                                  text-[11px]
                                  theme-text-muted
                                "
                              >
                                ID: {log.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`
                              rounded-lg
                              border
                              ${themeNeutralBorder}
                              ${themeNeutralSurface}
                              px-2.5 py-1
                              text-xs
                              font-medium
                              theme-text-secondary
                            `}
                          >
                            {log.role}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className="
                              flex items-center
                              gap-1.5
                              text-sm
                              theme-text-secondary
                            "
                          >
                            <ModuleIcon
                              size={14}
                              className="theme-text-muted"
                            />

                            {log.module}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className="
                              text-sm
                              theme-text-secondary
                            "
                          >
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
                              ${statusStyle.surface}
                              ${statusStyle.text}
                              ${statusStyle.border}
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
                          <span
                            className="
                              text-sm
                              theme-text-muted
                            "
                          >
                            {formatDateTime(
                              log.timestamp
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className="
                              flex items-center
                              gap-1.5
                              font-mono
                              text-xs
                              theme-text-muted
                            "
                          >
                            <Globe size={13} />
                            {log.ip}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}

          <div
            className={`
              divide-y
              ${themeDivider}
              lg:hidden
            `}
          >
            {isLoading ? (
              <div className="px-5 py-12">
                <LoadingState />
              </div>
            ) : paginatedLogs.length === 0 ? (
              <div className="px-5 py-12">
                <EmptyState />
              </div>
            ) : (
              paginatedLogs.map((log) => (
                <MobileLogCard
                  key={log.id}
                  log={log}
                />
              ))
            )}
          </div>

          {/* PAGINATION */}

          <div
            className={`
              flex flex-col
              gap-3
              border-t
              ${themeDivider}
              px-4 py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
            `}
          >
            <p
              className="
                text-xs
                theme-text-muted
              "
            >
              Menampilkan{" "}
              <span
                className="
                  font-semibold
                  theme-text-secondary
                "
              >
                {sortedLogs.length === 0
                  ? 0
                  : (currentPage - 1) *
                      itemsPerPage +
                    1}
              </span>{" "}
              –{" "}
              <span
                className="
                  font-semibold
                  theme-text-secondary
                "
              >
                {Math.min(
                  currentPage *
                    itemsPerPage,
                  sortedLogs.length
                )}
              </span>{" "}
              dari{" "}
              <span
                className="
                  font-semibold
                  theme-text-secondary
                "
              >
                {sortedLogs.length}
              </span>{" "}
              data
            </p>

            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.max(
                        1,
                        prev - 1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className={`
                  flex h-9
                  items-center
                  justify-center
                  rounded-lg
                  border theme-border
                  ${themeNeutralSurface}
                  px-3
                  theme-text-muted
                  transition-all
                  ${themeNeutralHover}
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                `}
              >
                <ArrowUp
                  size={14}
                  className="-rotate-90"
                />
              </button>

              {sortedLogs.length > 0 &&
                Array.from(
                  {
                    length: Math.min(
                      totalPages,
                      5
                    ),
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
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
                          ? `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`
                          : `theme-text-muted ${themeNeutralHover}`
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}

              {sortedLogs.length > 0 &&
                totalPages > 5 && (
                  <>
                    <span className="px-0.5 theme-text-muted">
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
                            ? `${themePrimaryGradient} text-[var(--color-card)]`
                            : `theme-text-muted ${themeNeutralHover}`
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
                    (prev) =>
                      Math.min(
                        totalPages,
                        prev + 1
                      )
                  )
                }
                disabled={
                  currentPage ===
                    totalPages ||
                  sortedLogs.length === 0
                }
                className={`
                  flex h-9
                  items-center
                  justify-center
                  rounded-lg
                  border theme-border
                  ${themeNeutralSurface}
                  px-3
                  theme-text-muted
                  transition-all
                  ${themeNeutralHover}
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                `}
              >
                <ArrowDown
                  size={14}
                  className="-rotate-90"
                />
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <div
          className={`
            border-t
            ${themeDivider}
            pt-4
            text-center
            sm:pt-5
          `}
        >
          <p
            className="
              text-xs
              theme-text-muted
            "
          >
            © 2026 SmartSchool •
            Log Aktivitas
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

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
      border:
        themePrimarySoftBorder,
    },

    success: {
      bg: themeSuccessSurface,
      text:
        "text-[var(--color-success)]",
      border:
        themeSuccessBorder,
    },

    danger: {
      bg: themeDangerSurface,
      text:
        "theme-text-secondary",
      border:
        themeDangerBorder,
    },

    info: {
      bg: themeInfoSurface,
      text:
        "text-[var(--color-info)]",
      border:
        themeInfoBorder,
    },

    warning: {
      bg: themeWarningSurface,
      text:
        "text-[var(--color-warning)]",
      border:
        themeWarningBorder,
    },
  };

  const styles =
    colorMap[color] ||
    colorMap.primary;

  return (
    <div
      className={`
        group rounded-2xl
        border theme-border
        theme-card
        p-3.5
        ${themeSmallShadow}
        transition-all
        hover:-translate-y-0.5
        hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
        sm:p-4
      `}
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
              theme-text-muted
            "
          >
            {label}
          </p>

          <p
            className="
              text-base
              font-semibold
              tracking-tight
              theme-text
              sm:text-lg
            "
          >
            {typeof value === "number"
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

/* ============================================================
   TABLE HEAD
============================================================ */

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
        theme-text-muted
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
            hover:text-[var(--color-primary)]
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

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <div
      className="
        flex flex-col
        items-center
        justify-center
        text-center
      "
    >
      <RefreshCw
        size={26}
        className={`
          animate-spin
          ${themePrimaryText}
        `}
      />

      <p
        className="
          mt-3
          text-sm
          theme-text-muted
        "
      >
        Mengambil data audit log...
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div
      className="
        flex flex-col
        items-center
        justify-center
        py-8
        text-center
      "
    >
      <div
        className={`
          flex h-14 w-14
          items-center
          justify-center
          rounded-2xl
          ${themeNeutralSurface}
          theme-text-muted
        `}
      >
        <Activity size={24} />
      </div>

      <p
        className="
          mt-4
          text-sm
          font-semibold
          theme-text
        "
      >
        Belum ada aktivitas
      </p>

      <p
        className="
          mt-1
          text-xs
          theme-text-muted
        "
      >
        Data aktivitas pengguna
        akan muncul setelah
        tersedia.
      </p>
    </div>
  );
}

/* ============================================================
   MOBILE LOG CARD
============================================================ */

function MobileLogCard({ log }) {
  const statusStyle =
    getMobileStatusStyle(
      log.status
    );

  const ModuleIcon =
    getMobileModuleIcon(
      log.module
    );

  return (
    <div
      className="
        p-4
        transition-colors
        hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]
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
                theme-text
              "
            >
              {log.user}
            </span>

            <span
              className={`
                rounded-lg
                border
                ${themeNeutralBorder}
                ${themeNeutralSurface}
                px-2 py-0.5
                text-[10px]
                font-medium
                theme-text-secondary
              `}
            >
              {log.role}
            </span>
          </div>

          <p
            className="
              mt-1
              text-sm
              theme-text-secondary
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
                flex items-center
                gap-1
                text-xs
                theme-text-muted
              "
            >
              <ModuleIcon size={12} />
              {log.module}
            </span>

            <span className="theme-text-muted">
              •
            </span>

            <span
              className="
                text-xs
                theme-text-muted
              "
            >
              {formatMobileDateTime(
                log.timestamp
              )}
            </span>

            <span className="theme-text-muted">
              •
            </span>

            <span
              className="
                font-mono
                text-xs
                theme-text-muted
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
            ${statusStyle.surface}
            ${statusStyle.text}
            ${statusStyle.border}
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

/* ============================================================
   MOBILE HELPERS
============================================================ */

function getMobileStatusStyle(status) {
  if (status === "success") {
    return {
      surface:
        themeSuccessSurface,
      text:
        "text-[var(--color-success)]",
      border:
        themeSuccessBorder,
    };
  }

  return {
    surface:
      themeDangerSurface,
    text:
      "theme-text-secondary",
    border:
      themeDangerBorder,
  };
}

function getMobileModuleIcon(module) {
  const value = String(
    module || ""
  ).toLowerCase();

  if (value.includes("siswa"))
    return Users;

  if (value.includes("guru"))
    return GraduationCap;

  if (
    value.includes("presensi") ||
    value.includes("absen")
  )
    return Clock;

  if (
    value.includes("keuangan")
  )
    return DollarSign;

  if (
    value.includes("akademik") ||
    value.includes("nilai")
  )
    return BookOpen;

  if (
    value.includes("akses") ||
    value.includes("role") ||
    value.includes("permission")
  )
    return Shield;

  if (
    value.includes("pengguna") ||
    value.includes("user")
  )
    return UserCog;

  if (
    value.includes("pengaturan")
  )
    return Settings;

  if (
    value.includes("keamanan")
  )
    return Lock;

  if (
    value.includes("laporan")
  )
    return BarChart3;

  if (
    value.includes("sekolah")
  )
    return Building2;

  if (
    value.includes("database")
  )
    return Database;

  if (
    value.includes("dokumen") ||
    value.includes("administrasi")
  )
    return FileText;

  return Activity;
}

function formatMobileDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(date);
}