"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

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

import { getAbsensiKelas } from "../../../services/absensi.service";
import { getKelas } from "../../../services/kelas.service";

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

  /*
   * PRIORITAS ROLE:
   * 1. /api/users/:id
   * 2. item.pengguna.peran
   * 3. item.role
   * 4. jabatan
   *
   * TIDAK berdasarkan kelas.
   */

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

  const status = normalizeStatus(
    item?.status,
  );

  const metode = normalizeMetode(
    item?.metode,
  );

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

    /*
     * Data user asli disimpan untuk halaman detail.
     */
    penggunaDetail: authoritativeUser || pengguna,
  };
}

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  Hadir: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: UserCheck,
  },

  Terlambat: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: Clock3,
  },

  Izin: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    icon: AlertCircle,
  },

  Sakit: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
    icon: AlertCircle,
  },

  "Tidak Hadir": {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${config.bg} ${config.text} ${config.border}`}
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
  const config = {
    Guru:
      "border-blue-200 bg-blue-50 text-blue-700",

    Siswa:
      "border-indigo-200 bg-indigo-50 text-indigo-700",

    Staff:
      "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        config[role] || config.Staff
      }`}
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">
              {value}
            </p>
          )}

          <p className="mt-1 text-[10px] sm:text-xs text-slate-400 truncate">
            {description}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
          <Icon
            size={14}
            className="text-slate-400"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 break-words text-xs font-semibold text-slate-700">
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
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="text-sm font-bold text-slate-700">
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

                  /*
                   * Ambil user ID dari setiap
                   * record lalu ambil data user
                   * sebenarnya.
                   */
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

        /*
         * Debug supaya mudah mengecek
         * Siti Rahayu.
         */
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
    /*
     * Kalau Guru → halaman detail Guru.
     */
    if (
      item.role === "Guru" &&
      item.penggunaId
    ) {
      router.push(
        `/admin/presensi/guru/${item.penggunaId}`,
      );

      return;
    }

    /*
     * Untuk role lain tetap menggunakan
     * modal detail.
     */
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
      document.createElement(
        "a",
      );

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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
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

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          title="Presensi & Kehadiran"
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen,
            )
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">

            {/* HEADER */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center shadow-lg shadow-[#155DFC]/20 shrink-0">
                  <ClipboardCheck size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                    Presensi & Kehadiran
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-sm hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download size={15} />
                Export Data
              </button>
            </div>

            {/* ERROR */}

            {(errorKelas ||
              errorAbsensi) && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm text-red-700">
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
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* DATE */}

            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] border border-[#c7dbff]">
                      <CalendarDays
                        size={17}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Rekap Tanggal
                      </p>

                      <p className="text-sm font-bold text-slate-800">
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Total Presensi"
                value={totalPresensi}
                description="Data presensi hari ini"
                icon={Users}
                iconClass="text-[#155DFC]"
                loading={loadingAbsensi}
              />

              <StatCard
                title="Hadir"
                value={totalHadir}
                description="Kehadiran tercatat"
                icon={UserCheck}
                iconClass="text-emerald-500"
                loading={loadingAbsensi}
              />

              <StatCard
                title="Terlambat"
                value={totalTerlambat}
                description="Masuk setelah jam"
                icon={Clock3}
                iconClass="text-amber-500"
                loading={loadingAbsensi}
              />

              <StatCard
                title="Tidak Hadir"
                value={totalTidakHadir}
                description="Izin, sakit, atau alpa"
                icon={UserX}
                iconClass="text-red-500"
                loading={loadingAbsensi}
              />
            </div>

            {/* FILTER */}

            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50 transition"
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
                    className="h-11 min-w-[130px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#155DFC]/50 focus:ring-2 focus:ring-[#155DFC]/20"
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
                    className="h-11 min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#155DFC]/50 focus:ring-2 focus:ring-[#155DFC]/20"
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
                    className="h-11 min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#155DFC]/50 focus:ring-2 focus:ring-[#155DFC]/20"
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
                    className="h-11 min-w-[150px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#155DFC]/50 focus:ring-2 focus:ring-[#155DFC]/20"
                  />

                  <button
                    onClick={
                      resetFilters
                    }
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>
              </div>
            </section>

            {/* TABLE */}

            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                      <Database
                        size={15}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <h2 className="text-sm font-bold text-slate-800">
                      Data Presensi
                    </h2>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Daftar kehadiran siswa, guru, dan staff.
                  </p>
                </div>

                {loadingAbsensi && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2
                      size={14}
                      className="animate-spin text-[#155DFC]"
                    />
                    Memuat data...
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white">
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
                            className="border-b border-slate-100"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />

                                <div className="space-y-2">
                                  <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />

                                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />

                                <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-1">
                                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
                                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
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
                            className="border-b border-slate-100 last:border-0 hover:bg-[#eaf1ff] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white text-xs font-bold">
                                  {item.avatar}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate max-w-[180px] text-sm font-semibold text-slate-800">
                                    {item.nama}
                                  </p>

                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400">
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
                              <p className="text-xs font-medium text-slate-700">
                                {item.role ===
                                "Guru"
                                  ? item.penggunaDetail
                                      ?.jabatan ||
                                    "Guru"
                                  : item.kelas}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
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
                                      ? "text-slate-300"
                                      : "text-[#155DFC]"
                                  }
                                />

                                <span
                                  className={`text-xs font-semibold ${
                                    item.jamMasuk ===
                                    "-"
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }`}
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
                                  className="text-slate-300"
                                />

                                <span className="text-xs font-semibold text-slate-300">
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
                                <p className="mt-1 max-w-[160px] truncate text-[10px] text-slate-400">
                                  {
                                    item.keterangan
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-xs font-medium text-slate-600">
                                {
                                  item.metode
                                }
                              </span>

                              {item.lokasi !==
                                "-" && (
                                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                                  <MapPin
                                    size={
                                      10
                                    }
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
                                  onClick={() =>
                                    handleOpenDetail(
                                      item,
                                    )
                                  }
                                  title="Lihat detail"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#c7dbff] hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                >
                                  <Eye
                                    size={
                                      14
                                    }
                                  />
                                </button>

                                <button
                                  onClick={() =>
                                    handleOpenEdit(
                                      item,
                                    )
                                  }
                                  title="Ubah presensi"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#c7dbff] hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                >
                                  <Edit3
                                    size={
                                      14
                                    }
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
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf1ff] border border-[#c7dbff]">
                              <Search
                                size={24}
                                className="text-[#155DFC]"
                              />
                            </div>

                            <p className="mt-4 text-base font-bold text-slate-800">
                              Data presensi tidak ditemukan
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Coba ubah pencarian atau filter yang digunakan.
                            </p>

                            <button
                              onClick={
                                resetFilters
                              }
                              className="mt-4 text-xs font-semibold text-[#155DFC] hover:underline"
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
                  <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-700">
                        {(safeCurrentPage -
                          1) *
                          itemsPerPage +
                          1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold text-slate-700">
                        {Math.min(
                          safeCurrentPage *
                            itemsPerPage,
                          filteredData.length,
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-slate-700">
                        {
                          filteredData.length
                        }
                      </span>{" "}
                      data
                    </p>

                    <div className="flex items-center gap-1">
                      <button
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
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                            key={page}
                            onClick={() =>
                              setCurrentPage(
                                page,
                              )
                            }
                            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                              safeCurrentPage ===
                              page
                                ? "bg-[#155DFC] text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
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
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
          DETAIL MODAL NON-GURU
      ===================================================== */}

      {selectedPresensi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                  <Eye
                    size={17}
                    className="text-[#155DFC]"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Detail Presensi
                  </h2>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Informasi kehadiran pengguna
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedPresensi(
                    null,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="mb-5 flex flex-col gap-4 rounded-xl border border-[#c7dbff] bg-[#f5f8ff] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white text-sm font-bold shadow-sm">
                    {
                      selectedPresensi.avatar
                    }
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-slate-800">
                      {
                        selectedPresensi.nama
                      }
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
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

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  setSelectedPresensi(
                    null,
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                  <Edit3
                    size={17}
                    className="text-[#155DFC]"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Ubah Status Presensi
                  </h2>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Perbarui data kehadiran pengguna
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setEditPresensi(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white text-xs font-bold">
                  {
                    editPresensi.avatar
                  }
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {
                      editPresensi.nama
                    }
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
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
                <label className="mb-2 block text-xs font-semibold text-slate-600">
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
                          className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition ${
                            active
                              ? `${config.bg} ${config.text} ${config.border} ring-2 ring-[#155DFC]/10`
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                active
                                  ? config.dot
                                  : "bg-slate-300"
                              }`}
                            />

                            {
                              status
                            }
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Jam Pulang
                  </label>

                  <input
                    type="time"
                    defaultValue=""
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-slate-600">
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
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                />
              </div>

              <div className="mt-4 flex gap-2 rounded-xl border border-blue-200 bg-[#f5f8ff] p-3">
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-[#155DFC]"
                />

                <p className="text-[11px] leading-relaxed text-slate-600">
                  Backend saat ini belum menyediakan endpoint update presensi dari halaman admin.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  setEditPresensi(null)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                onClick={
                  handleSaveEdit
                }
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
                    <Check
                      size={15}
                    />
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