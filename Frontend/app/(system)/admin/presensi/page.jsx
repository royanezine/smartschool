"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  Search,
  CalendarDays,
  Users,
  UserCheck,
  Clock3,
  UserX,
  ClipboardCheck,
  Eye,
  Edit3,
  X,
  Check,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  UserRound,
  BookOpen,
  AlertCircle,
  Loader2,
  Database,
} from "lucide-react";

import { getAbsensiKelas } from "../../../../services/absensi.service";
import { getKelas } from "../../../../services/kelas.service";

/* =========================================================
   DATE HELPERS
========================================================= */

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const raw = String(tanggal);

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [yyyy, mm, dd] = raw.split("-");

    return new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return String(tanggal);
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayInputValue() {
  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
}

/* =========================================================
   ROLE HELPERS
========================================================= */

function normalizeRole(value) {
  if (!value) return null;

  const text = String(value)
    .trim()
    .toLowerCase();

  if (
    text.includes("guru") ||
    text.includes("teacher") ||
    text === "pengajar"
  ) {
    return "Guru";
  }

  if (
    text.includes("staff") ||
    text.includes("staf") ||
    text.includes("tenaga kependidikan")
  ) {
    return "Staff";
  }

  if (
    text.includes("siswa") ||
    text.includes("student") ||
    text.includes("peserta didik")
  ) {
    return "Siswa";
  }

  return null;
}

/*
 * ROLE HARUS DIAMBIL DARI DATA PENGGUNA.
 * Jangan menentukan Guru/Siswa berdasarkan kelas.
 */
function getRoleFromUser(user) {
  if (!user) return null;

  const candidates = [
    user?.peran?.nama,
    user?.peran?.namaTampilan,
    user?.role?.nama,
    user?.role?.namaTampilan,
    user?.role,
    user?.peran,
    user?.jabatan,
  ];

  for (const candidate of candidates) {
    const role = normalizeRole(candidate);

    if (role) {
      return role;
    }
  }

  return null;
}

/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (value === "hadir") {
    return "Hadir";
  }

  if (
    value === "terlambat" ||
    value === "late"
  ) {
    return "Terlambat";
  }

  if (value === "izin") {
    return "Izin";
  }

  if (value === "sakit") {
    return "Sakit";
  }

  if (
    value === "alpha" ||
    value === "alpa" ||
    value === "tidak hadir"
  ) {
    return "Tidak Hadir";
  }

  return "Tidak Hadir";
}

/* =========================================================
   METHOD
========================================================= */

function normalizeMetode(metode) {
  const value = String(metode || "")
    .trim()
    .toLowerCase();

  if (value === "face") {
    return "Face";
  }

  if (value === "lokasi") {
    return "Lokasi";
  }

  if (value === "barcode") {
    return "Barcode";
  }

  if (value === "manual") {
    return "Manual";
  }

  return metode || "-";
}

/* =========================================================
   AUTH FETCH
========================================================= */

async function fetchUserById(userId) {
  if (!userId) return null;

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/users/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.warn(
        `Gagal mengambil user ${userId}:`,
        response.status,
      );

      return null;
    }

    const result = await response.json();

    return (
      result?.data ||
      result?.data?.data ||
      result?.user ||
      result?.result ||
      null
    );
  } catch (error) {
    console.error(
      `Error mengambil detail user ${userId}:`,
      error,
    );

    return null;
  }
}

/* =========================================================
   NORMALIZE ABSENSI
========================================================= */

function normalizeAbsensiItem(
  item,
  fallbackKelas = null,
  authoritativeUser = null,
) {
  const pengguna =
    authoritativeUser ||
    item?.pengguna ||
    item?.siswa ||
    {};

  const role =
    getRoleFromUser(authoritativeUser) ||
    getRoleFromUser(item?.pengguna) ||
    normalizeRole(item?.role) ||
    normalizeRole(item?.peran) ||
    normalizeRole(item?.jabatan) ||
    "Siswa";

  const nama =
    pengguna?.namaLengkap ||
    pengguna?.nama ||
    item?.namaLengkap ||
    item?.nama ||
    "Pengguna";

  const nomorInduk =
    pengguna?.nip ||
    pengguna?.nipd ||
    pengguna?.nisn ||
    pengguna?.nik ||
    item?.nip ||
    item?.nisn ||
    item?.nomorInduk ||
    "-";

  const kelas =
    item?.kelas?.nama ||
    item?.kelasNama ||
    pengguna?.kelas?.nama ||
    fallbackKelas?.nama ||
    "-";

  const status = normalizeStatus(item?.status);

  const metode = normalizeMetode(item?.metode);

  const initials =
    nama
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "-";

  return {
    ...item,

    id:
      item?.id ||
      item?.absensiId ||
      `${pengguna?.id || "user"}-${item?.dibuatPada || Date.now()}`,

    penggunaId:
      item?.penggunaId ||
      item?.pengguna?.id ||
      authoritativeUser?.id ||
      null,

    _kelasId:
      item?.kelasId ||
      item?.kelas?.id ||
      fallbackKelas?.id ||
      null,

    nama,
    nomorInduk,
    kelas,
    role,

    tanggal:
      item?.tanggal ||
      item?.dibuatPada ||
      null,

    jamMasuk:
      item?.dibuatPada
        ? formatJam(item.dibuatPada)
        : "-",

    jamPulang: "-",

    status,
    metode,

    lokasi:
      item?.lintang != null &&
      item?.bujur != null
        ? "Sekolah / GPS"
        : "-",

    keterangan:
      item?.keterangan || "-",

    avatar: initials,

    penggunaDetail:
      authoritativeUser || pengguna,
  };
}

/* =========================================================
   STATUS CONFIG
   SEMUA MENGIKUTI GLOBAL THEME
========================================================= */

const STATUS_CONFIG = {
  Hadir: {
    className: "theme-success",
    dot: "bg-[var(--color-success)]",
    icon: UserCheck,
  },

  Terlambat: {
    className: "theme-warning",
    dot: "bg-[var(--color-warning)]",
    icon: Clock3,
  },

  Izin: {
    className: "theme-info",
    dot: "bg-[var(--color-info)]",
    icon: AlertCircle,
  },

  Sakit: {
    className: "theme-card-soft theme-text-secondary",
    dot: "bg-[var(--color-text-muted)]",
    icon: AlertCircle,
  },

  "Tidak Hadir": {
    className: "theme-danger",
    dot: "bg-[var(--color-danger)]",
    icon: UserX,
  },
};

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG["Tidak Hadir"];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${config.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  let className =
    "theme-card-soft theme-text-secondary theme-border";

  if (role === "Guru") {
    className =
      "theme-info";
  }

  if (role === "Siswa") {
    className =
      "theme-primary";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {role}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  loading,
}) {
  return (
    <div className="theme-card rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[11px] sm:text-xs font-medium">
            {title}
          </p>

          {loading ? (
            <div className="theme-card-soft mt-2 h-8 w-16 animate-pulse rounded-lg" />
          ) : (
            <p className="theme-text mt-1.5 text-2xl sm:text-3xl font-bold">
              {value}
            </p>
          )}

          <p className="theme-text-placeholder mt-1 text-[10px] sm:text-xs truncate">
            {description}
          </p>
        </div>

        <div className="theme-card-soft theme-border flex h-10 w-10 items-center justify-center rounded-xl border shrink-0">
          <Icon
            size={18}
            className={iconClass}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="theme-card-soft theme-border rounded-xl border p-3">
      <div className="flex items-start gap-2.5">
        <div className="theme-card theme-border flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
          <Icon
            size={14}
            className="theme-text-muted"
          />
        </div>

        <div className="min-w-0">
          <p className="theme-text-placeholder text-[10px] font-medium uppercase tracking-wide">
            {label}
          </p>

          <p className="theme-text-secondary mt-0.5 break-words text-xs font-semibold">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI SUMMARY
========================================================= */

function MiniSummary({
  label,
  value,
}) {
  return (
    <div>
      <p className="theme-text-placeholder text-[10px]">
        {label}
      </p>

      <p className="theme-text-secondary text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function PresensiPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("Semua");

  const [statusFilter, setStatusFilter] =
    useState("Semua");

  const [classFilter, setClassFilter] =
    useState("Semua");

  const [dateFilter, setDateFilter] =
    useState(getTodayInputValue());

  const [kelas, setKelas] = useState([]);

  const [absensi, setAbsensi] =
    useState([]);

  const [loadingKelas, setLoadingKelas] =
    useState(true);

  const [loadingAbsensi, setLoadingAbsensi] =
    useState(false);

  const [errorKelas, setErrorKelas] =
    useState("");

  const [errorAbsensi, setErrorAbsensi] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedPresensi, setSelectedPresensi] =
    useState(null);

  const [editPresensi, setEditPresensi] =
    useState(null);

  const [editStatus, setEditStatus] =
    useState("");

  const [editKeterangan, setEditKeterangan] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const itemsPerPage = 7;

  /* =======================================================
     FETCH KELAS
  ======================================================= */

  const fetchKelas = useCallback(
    async () => {
      try {
        setLoadingKelas(true);
        setErrorKelas("");

        const response = await getKelas({
          page: 1,
          limit: 100,
          sortBy: "tingkat",
          sortOrder: "asc",
        });

        const data =
          normalizeListResponse(response);

        setKelas(data);
      } catch (err) {
        console.error(
          "Error fetch kelas:",
          err,
        );

        setKelas([]);

        setErrorKelas(
          err?.message ||
            "Gagal mengambil data kelas.",
        );
      } finally {
        setLoadingKelas(false);
      }
    },
    [],
  );

  /* =======================================================
     FETCH ABSENSI
  ======================================================= */

  const fetchAbsensi = useCallback(
    async () => {
      if (kelas.length === 0) {
        setAbsensi([]);
        return;
      }

      try {
        setLoadingAbsensi(true);
        setErrorAbsensi("");

        const selectedClasses =
          classFilter === "Semua"
            ? kelas
            : kelas.filter(
                (item) =>
                  item?.id === classFilter,
              );

        const responses =
          await Promise.all(
            selectedClasses.map(
              async (kelasItem) => {
                try {
                  const response =
                    await getAbsensiKelas(
                      kelasItem.id,
                      dateFilter || null,
                    );

                  const records =
                    normalizeListResponse(
                      response,
                    );

                  const normalized =
                    await Promise.all(
                      records.map(
                        async (item) => {
                          const userId =
                            item?.penggunaId ||
                            item?.pengguna?.id ||
                            item?.siswa?.id ||
                            null;

                          let userDetail = null;

                          if (userId) {
                            userDetail =
                              await fetchUserById(
                                userId,
                              );
                          }

                          return normalizeAbsensiItem(
                            item,
                            kelasItem,
                            userDetail,
                          );
                        },
                      ),
                    );

                  return normalized;
                } catch (err) {
                  console.error(
                    `Error absensi kelas ${
                      kelasItem?.nama ||
                      kelasItem?.id
                    }:`,
                    err,
                  );

                  throw err;
                }
              },
            ),
          );

        const finalData =
          responses.flat();

        console.log(
          "=== DATA PRESENSI ADMIN ===",
          finalData,
        );

        const siti =
          finalData.find((item) =>
            String(item.nama)
              .toLowerCase()
              .includes("siti rahayu"),
          );

        if (siti) {
          console.log(
            "=== DATA SITI RAHAYU ===",
            {
              id: siti.id,
              penggunaId:
                siti.penggunaId,
              nama: siti.nama,
              role: siti.role,
              nomorInduk:
                siti.nomorInduk,
              status: siti.status,
              metode: siti.metode,
              pengguna:
                siti.penggunaDetail,
            },
          );
        }

        setAbsensi(finalData);
      } catch (err) {
        console.error(
          "Error fetch absensi:",
          err,
        );

        setAbsensi([]);

        setErrorAbsensi(
          err?.message ||
            "Gagal mengambil data absensi dari backend.",
        );
      } finally {
        setLoadingAbsensi(false);
      }
    },
    [
      kelas,
      classFilter,
      dateFilter,
    ],
  );

  /* =======================================================
     EFFECT
  ======================================================= */

  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  useEffect(() => {
    fetchAbsensi();
  }, [fetchAbsensi]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredData = useMemo(() => {
    return absensi.filter((item) => {
      const search =
        searchQuery
          .toLowerCase()
          .trim();

      const matchesSearch =
        !search ||
        String(item.nama)
          .toLowerCase()
          .includes(search) ||
        String(item.nomorInduk)
          .toLowerCase()
          .includes(search) ||
        String(item.kelas)
          .toLowerCase()
          .includes(search);

      const matchesRole =
        roleFilter === "Semua" ||
        item.role === roleFilter;

      const matchesStatus =
        statusFilter === "Semua" ||
        item.status === statusFilter;

      const matchesClass =
        classFilter === "Semua" ||
        item._kelasId === classFilter ||
        item.kelasId === classFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesClass
      );
    });
  }, [
    absensi,
    searchQuery,
    roleFilter,
    statusFilter,
    classFilter,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length /
        itemsPerPage,
    ),
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedData =
    filteredData.slice(
      (safeCurrentPage - 1) *
        itemsPerPage,
      safeCurrentPage *
        itemsPerPage,
    );

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalPresensi =
    absensi.length;

  const totalHadir =
    absensi.filter(
      (item) =>
        item.status === "Hadir",
    ).length;

  const totalTerlambat =
    absensi.filter(
      (item) =>
        item.status ===
        "Terlambat",
    ).length;

  const totalTidakHadir =
    absensi.filter(
      (item) =>
        item.status ===
          "Tidak Hadir" ||
        item.status === "Izin" ||
        item.status === "Sakit",
    ).length;

  const attendancePercentage =
    totalPresensi
      ? Math.round(
          (totalHadir /
            totalPresensi) *
            100,
        )
      : 0;

  /* =======================================================
     RESET
  ======================================================= */

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("Semua");
    setStatusFilter("Semua");
    setClassFilter("Semua");
    setDateFilter(
      getTodayInputValue(),
    );
    setCurrentPage(1);
  };

  /* =======================================================
     DETAIL
  ======================================================= */

  const handleOpenDetail = (item) => {
    if (
      item.role === "Guru" &&
      item.penggunaId
    ) {
      router.push(
        `/admin/presensi/guru/${item.penggunaId}`,
      );

      return;
    }

    setSelectedPresensi(item);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleOpenEdit = (item) => {
    setSelectedPresensi(null);

    setEditPresensi(item);

    setEditStatus(item.status);

    setEditKeterangan(
      item.keterangan === "-"
        ? ""
        : item.keterangan,
    );
  };

  /* =======================================================
     SAVE EDIT
  ======================================================= */

  const handleSaveEdit = async () => {
    if (!editPresensi) return;

    setIsSaving(true);

    setErrorAbsensi(
      "Backend saat ini belum menyediakan endpoint update absensi admin, jadi perubahan tidak disimpan.",
    );

    setIsSaving(false);

    setEditPresensi(null);
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const handleExport = () => {
    if (
      filteredData.length === 0
    ) {
      setErrorAbsensi(
        "Tidak ada data absensi untuk diekspor.",
      );

      return;
    }

    const headers = [
      "Nama",
      "Nomor Induk",
      "Kelas",
      "Peran",
      "Tanggal",
      "Jam Masuk",
      "Status",
      "Metode",
      "Lokasi",
      "Keterangan",
    ];

    const rows =
      filteredData.map(
        (item) => [
          item.nama,
          item.nomorInduk,
          item.kelas,
          item.role,
          formatTanggal(
            item.tanggal,
          ),
          item.jamMasuk,
          item.status,
          item.metode,
          item.lokasi,
          item.keterangan,
        ],
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? "",
              ).replace(
                /"/g,
                '""',
              )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob(
      ["\ufeff" + csv],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `presensi-${dateFilter || "semua"}.csv`;

    document.body.appendChild(
      link,
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        activeMenu="presensi"
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(
            !sidebarOpen,
          )
        }
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title="Presensi & Kehadiran"
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen,
            )
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">

            {/* HEADER */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm">
                  <ClipboardCheck size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text truncate text-xl font-bold sm:text-2xl">
                    Presensi & Kehadiran
                  </h1>

                  <p className="theme-text-secondary mt-1 text-xs sm:text-sm">
                    Kelola dan pantau kehadiran siswa, guru, dan staff sekolah.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={
                  filteredData.length === 0
                }
                className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download size={15} />
                Export Data
              </button>
            </div>

            {/* ERROR */}

            {(errorKelas ||
              errorAbsensi) && (
              <div className="theme-danger flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm">
                    {errorKelas ||
                      errorAbsensi}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorKelas("");
                    setErrorAbsensi("");
                  }}
                  className="transition hover:opacity-70"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* DATE */}

            <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                      <CalendarDays size={17} />
                    </div>

                    <div>
                      <p className="theme-text-placeholder text-[10px] font-semibold uppercase tracking-wide">
                        Rekap Tanggal
                      </p>

                      <p className="theme-text text-sm font-bold">
                        {formatTanggal(
                          dateFilter,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <MiniSummary
                      label="Kehadiran"
                      value={`${attendancePercentage}%`}
                    />

                    <MiniSummary
                      label="Hadir"
                      value={totalHadir}
                    />

                    <MiniSummary
                      label="Terlambat"
                      value={totalTerlambat}
                    />

                    <MiniSummary
                      label="Tidak Hadir"
                      value={
                        totalTidakHadir
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* STAT */}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard
                title="Total Presensi"
                value={totalPresensi}
                description="Data presensi hari ini"
                icon={Users}
                iconClass="theme-text"
                loading={loadingAbsensi}
              />

              <StatCard
                title="Hadir"
                value={totalHadir}
                description="Kehadiran tercatat"
                icon={UserCheck}
                iconClass="text-[var(--color-success)]"
                loading={loadingAbsensi}
              />

              <StatCard
                title="Terlambat"
                value={totalTerlambat}
                description="Masuk setelah jam"
                icon={Clock3}
                iconClass="text-[var(--color-warning)]"
                loading={loadingAbsensi}
              />

              <StatCard
                title="Tidak Hadir"
                value={totalTidakHadir}
                description="Izin, sakit, atau alpa"
                icon={UserX}
                iconClass="text-[var(--color-danger)]"
                loading={loadingAbsensi}
              />
            </div>

            {/* FILTER */}

            <section className="theme-card rounded-2xl border p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={16}
                    className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(
                        e.target.value,
                      );
                      setCurrentPage(1);
                    }}
                    placeholder="Cari nama, NIS/NIP, atau kelas..."
                    className="theme-input w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(
                        e.target.value,
                      );
                      setCurrentPage(1);
                    }}
                    className="theme-input h-11 min-w-[130px] rounded-xl border px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    <option value="Semua">
                      Semua Pengguna
                    </option>

                    <option value="Siswa">
                      Siswa
                    </option>

                    <option value="Guru">
                      Guru
                    </option>

                    <option value="Staff">
                      Staff
                    </option>
                  </select>

                  <select
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(
                        e.target.value,
                      );
                      setCurrentPage(1);
                    }}
                    className="theme-input h-11 min-w-[140px] rounded-xl border px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    <option value="Semua">
                      Semua Kelas
                    </option>

                    {kelas.map(
                      (item) => (
                        <option
                          key={item?.id}
                          value={item?.id}
                        >
                          {item?.nama ||
                            `Kelas ${
                              item?.tingkat ||
                              "-"
                            }`}
                        </option>
                      ),
                    )}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(
                        e.target.value,
                      );
                      setCurrentPage(1);
                    }}
                    className="theme-input h-11 min-w-[140px] rounded-xl border px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    <option value="Semua">
                      Semua Status
                    </option>

                    <option value="Hadir">
                      Hadir
                    </option>

                    <option value="Terlambat">
                      Terlambat
                    </option>

                    <option value="Izin">
                      Izin
                    </option>

                    <option value="Sakit">
                      Sakit
                    </option>

                    <option value="Tidak Hadir">
                      Tidak Hadir
                    </option>
                  </select>

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(
                        e.target.value,
                      );
                      setCurrentPage(1);
                    }}
                    className="theme-input h-11 min-w-[150px] rounded-xl border px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="theme-card-soft theme-text-secondary theme-border inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition hover:opacity-80"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>
              </div>
            </section>

            {/* TABLE */}

            <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
              <div className="theme-border flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="theme-info flex h-8 w-8 items-center justify-center rounded-lg border">
                      <Database size={15} />
                    </div>

                    <h2 className="theme-text text-sm font-bold">
                      Data Presensi
                    </h2>
                  </div>

                  <p className="theme-text-muted mt-1 text-xs">
                    Daftar kehadiran siswa, guru, dan staff.
                  </p>
                </div>

                {loadingAbsensi && (
                  <div className="theme-text-secondary flex items-center gap-2 text-xs">
                    <Loader2
                      size={14}
                      className="animate-spin text-[var(--color-primary)]"
                    />
                    Memuat data...
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse text-sm">
                  <thead>
                    <tr className="theme-primary">
                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Pengguna
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Kelas / Jabatan
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Jam Masuk
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Jam Pulang
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Metode
                      </th>

                      <th className="px-4 py-3 text-center text-xs font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingAbsensi ? (
                      Array.from({
                        length:
                          itemsPerPage,
                      }).map(
                        (_, index) => (
                          <tr
                            key={index}
                            className="theme-border border-b"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="theme-card-soft h-9 w-9 animate-pulse rounded-lg" />

                                <div className="space-y-2">
                                  <div className="theme-card-soft h-4 w-32 animate-pulse rounded" />

                                  <div className="theme-card-soft h-3 w-20 animate-pulse rounded" />
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <div className="theme-card-soft h-3 w-24 animate-pulse rounded" />

                                <div className="theme-card-soft h-3 w-20 animate-pulse rounded" />
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="theme-card-soft h-4 w-16 animate-pulse rounded" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="theme-card-soft h-4 w-16 animate-pulse rounded" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="theme-card-soft h-6 w-20 animate-pulse rounded-full" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="theme-card-soft h-4 w-20 animate-pulse rounded" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-1">
                                <div className="theme-card-soft h-8 w-8 animate-pulse rounded-lg" />
                                <div className="theme-card-soft h-8 w-8 animate-pulse rounded-lg" />
                              </div>
                            </td>
                          </tr>
                        ),
                      )
                    ) : paginatedData.length >
                      0 ? (
                      paginatedData.map(
                        (item) => (
                          <tr
                            key={item.id}
                            className="theme-border theme-table-hover border-b transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="theme-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                                  {item.avatar}
                                </div>

                                <div className="min-w-0">
                                  <p className="theme-text max-w-[180px] truncate text-sm font-semibold">
                                    {item.nama}
                                  </p>

                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="theme-text-muted text-[11px]">
                                      {
                                        item.nomorInduk
                                      }
                                    </span>

                                    <RoleBadge
                                      role={
                                        item.role
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <p className="theme-text-secondary text-xs font-medium">
                                {item.role ===
                                "Guru"
                                  ? item
                                      .penggunaDetail
                                      ?.jabatan ||
                                    "Guru"
                                  : item.kelas}
                              </p>

                              <p className="theme-text-muted mt-0.5 text-[11px]">
                                {item.role ===
                                "Guru"
                                  ? "Tenaga Pendidik"
                                  : item.role ===
                                    "Staff"
                                  ? "Tenaga Kependidikan"
                                  : "Peserta Didik"}
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Clock3
                                  size={13}
                                  className={
                                    item.jamMasuk ===
                                    "-"
                                      ? "theme-text-placeholder"
                                      : "text-[var(--color-primary)]"
                                  }
                                />

                                <span
                                  className={
                                    item.jamMasuk ===
                                    "-"
                                      ? "theme-text-placeholder text-xs font-semibold"
                                      : "theme-text-secondary text-xs font-semibold"
                                  }
                                >
                                  {
                                    item.jamMasuk
                                  }
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Clock3
                                  size={13}
                                  className="theme-text-placeholder"
                                />

                                <span className="theme-text-placeholder text-xs font-semibold">
                                  -
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <StatusBadge
                                status={
                                  item.status
                                }
                              />

                              {item.keterangan !==
                                "-" && (
                                <p className="theme-text-muted mt-1 max-w-[160px] truncate text-[10px]">
                                  {
                                    item.keterangan
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span className="theme-text-secondary text-xs font-medium">
                                {
                                  item.metode
                                }
                              </span>

                              {item.lokasi !==
                                "-" && (
                                <p className="theme-text-muted mt-0.5 flex items-center gap-1 text-[10px]">
                                  <MapPin
                                    size={10}
                                  />
                                  {
                                    item.lokasi
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenDetail(
                                      item,
                                    )
                                  }
                                  title="Lihat detail"
                                  className="theme-card-soft theme-text-secondary theme-border flex h-8 w-8 items-center justify-center rounded-lg border transition hover:text-[var(--color-primary)]"
                                >
                                  <Eye
                                    size={14}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEdit(
                                      item,
                                    )
                                  }
                                  title="Ubah presensi"
                                  className="theme-card-soft theme-text-secondary theme-border flex h-8 w-8 items-center justify-center rounded-lg border transition hover:text-[var(--color-primary)]"
                                >
                                  <Edit3
                                    size={14}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-16"
                        >
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="theme-info flex h-14 w-14 items-center justify-center rounded-full border">
                              <Search
                                size={24}
                              />
                            </div>

                            <p className="theme-text mt-4 text-base font-bold">
                              Data presensi tidak ditemukan
                            </p>

                            <p className="theme-text-secondary mt-1 text-xs">
                              Coba ubah pencarian atau filter yang digunakan.
                            </p>

                            <button
                              type="button"
                              onClick={
                                resetFilters
                              }
                              className="mt-4 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                            >
                              Reset Filter
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}

              {!loadingAbsensi &&
                filteredData.length >
                  0 && (
                  <div className="theme-card-soft theme-border flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="theme-text-secondary text-xs">
                      Menampilkan{" "}
                      <span className="theme-text font-semibold">
                        {(safeCurrentPage - 1) *
                          itemsPerPage +
                          1}
                      </span>{" "}
                      -{" "}
                      <span className="theme-text font-semibold">
                        {Math.min(
                          safeCurrentPage *
                            itemsPerPage,
                          filteredData.length,
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="theme-text font-semibold">
                        {
                          filteredData.length
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
                            (prev) =>
                              Math.max(
                                1,
                                prev - 1,
                              ),
                          )
                        }
                        className="theme-card theme-text-secondary theme-border flex h-8 w-8 items-center justify-center rounded-lg border transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft
                          size={15}
                        />
                      </button>

                      {Array.from(
                        {
                          length:
                            totalPages,
                        },
                        (_, index) =>
                          index + 1,
                      ).map(
                        (page) => (
                          <button
                            type="button"
                            key={page}
                            onClick={() =>
                              setCurrentPage(
                                page,
                              )
                            }
                            className={
                              safeCurrentPage ===
                              page
                                ? "theme-primary flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold shadow-sm"
                                : "theme-card theme-text-secondary theme-border flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition hover:opacity-80"
                            }
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
                        type="button"
                        disabled={
                          safeCurrentPage ===
                          totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (prev) =>
                              Math.min(
                                totalPages,
                                prev + 1,
                              ),
                          )
                        }
                        className="theme-card theme-text-secondary theme-border flex h-8 w-8 items-center justify-center rounded-lg border transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight
                          size={15}
                        />
                      </button>
                    </div>
                  </div>
                )}
            </section>
          </div>
        </main>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedPresensi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="theme-card w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl">
            <div className="theme-border flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg border">
                  <Eye size={17} />
                </div>

                <div>
                  <h2 className="theme-text text-sm font-bold">
                    Detail Presensi
                  </h2>

                  <p className="theme-text-muted mt-0.5 text-[11px]">
                    Informasi kehadiran pengguna
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPresensi(null)
                }
                className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="theme-info mb-5 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm">
                    {
                      selectedPresensi.avatar
                    }
                  </div>

                  <div className="min-w-0">
                    <h3 className="theme-text truncate text-base font-bold">
                      {
                        selectedPresensi.nama
                      }
                    </h3>

                    <p className="theme-text-secondary mt-0.5 text-xs">
                      {
                        selectedPresensi.nomorInduk
                      }
                    </p>
                  </div>
                </div>

                <StatusBadge
                  status={
                    selectedPresensi.status
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={CalendarDays}
                  label="Tanggal"
                  value={formatTanggal(
                    selectedPresensi.tanggal,
                  )}
                />

                <InfoItem
                  icon={UserRound}
                  label="Peran"
                  value={
                    selectedPresensi.role
                  }
                />

                <InfoItem
                  icon={BookOpen}
                  label="Kelas / Jabatan"
                  value={
                    selectedPresensi.role ===
                    "Guru"
                      ? selectedPresensi
                          .penggunaDetail
                          ?.jabatan ||
                        "Guru"
                      : selectedPresensi.kelas
                  }
                />

                <InfoItem
                  icon={Clock3}
                  label="Jam Masuk"
                  value={
                    selectedPresensi.jamMasuk
                  }
                />

                <InfoItem
                  icon={Clock}
                  label="Jam Pulang"
                  value={
                    selectedPresensi.jamPulang
                  }
                />

                <InfoItem
                  icon={ClipboardCheck}
                  label="Metode"
                  value={
                    selectedPresensi.metode
                  }
                />

                <InfoItem
                  icon={MapPin}
                  label="Lokasi"
                  value={
                    selectedPresensi.lokasi
                  }
                />

                <InfoItem
                  icon={AlertCircle}
                  label="Keterangan"
                  value={
                    selectedPresensi.keterangan
                  }
                />
              </div>
            </div>

            <div className="theme-card-soft theme-border flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setSelectedPresensi(null)
                }
                className="theme-card theme-text-secondary theme-border rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editPresensi && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="theme-card w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl">
            <div className="theme-border flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg border">
                  <Edit3 size={17} />
                </div>

                <div>
                  <h2 className="theme-text text-sm font-bold">
                    Ubah Status Presensi
                  </h2>

                  <p className="theme-text-muted mt-0.5 text-[11px]">
                    Perbarui data kehadiran pengguna
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditPresensi(null)
                }
                className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="theme-card-soft theme-border mb-5 flex items-center gap-3 rounded-xl border p-4">
                <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  {
                    editPresensi.avatar
                  }
                </div>

                <div className="min-w-0">
                  <p className="theme-text truncate text-sm font-bold">
                    {
                      editPresensi.nama
                    }
                  </p>

                  <p className="theme-text-secondary mt-0.5 text-xs">
                    {
                      editPresensi.nomorInduk
                    }{" "}
                    ·{" "}
                    {editPresensi.role ===
                    "Guru"
                      ? editPresensi
                          .penggunaDetail
                          ?.jabatan ||
                        "Guru"
                      : editPresensi.kelas}
                  </p>
                </div>
              </div>

              <div>
                <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                  Status Kehadiran
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    "Hadir",
                    "Terlambat",
                    "Izin",
                    "Sakit",
                    "Tidak Hadir",
                  ].map(
                    (status) => {
                      const config =
                        STATUS_CONFIG[
                          status
                        ];

                      const active =
                        editStatus ===
                        status;

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setEditStatus(
                              status,
                            )
                          }
                          className={
                            active
                              ? `rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition ${config.className}`
                              : "theme-card-soft theme-text-secondary theme-border rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition hover:opacity-80"
                          }
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                active
                                  ? config.dot
                                  : "bg-[var(--color-text-placeholder)]"
                              }`}
                            />

                            {status}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Jam Masuk
                  </label>

                  <input
                    type="time"
                    defaultValue={
                      editPresensi.jamMasuk !==
                      "-"
                        ? editPresensi.jamMasuk
                        : ""
                    }
                    className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Jam Pulang
                  </label>

                  <input
                    type="time"
                    defaultValue=""
                    className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                  Keterangan
                </label>

                <textarea
                  value={
                    editKeterangan
                  }
                  onChange={(e) =>
                    setEditKeterangan(
                      e.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Tambahkan keterangan jika diperlukan..."
                  className="theme-input w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div className="theme-info mt-4 flex gap-2 rounded-xl border p-3">
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0"
                />

                <p className="theme-text-secondary text-[11px] leading-relaxed">
                  Backend saat ini belum menyediakan endpoint update presensi dari halaman admin.
                </p>
              </div>
            </div>

            <div className="theme-card-soft theme-border flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setEditPresensi(null)
                }
                className="theme-card theme-text-secondary theme-border rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleSaveEdit
                }
                disabled={isSaving}
                className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}