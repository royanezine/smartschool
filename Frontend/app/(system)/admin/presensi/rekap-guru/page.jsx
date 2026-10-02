"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Search,
  RefreshCw,
  CalendarDays,
  Users,
  Clock3,
  CircleAlert,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Database,
  UserCheck,
  Loader2,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/+$/, "");

const GURU_ENDPOINT = `${API_URL}/api/users/`;

/* =========================================================
   HELPER
========================================================= */

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTanggalIndonesia(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(`${tanggal}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return tanggal;
  }

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt")
  );
}

/* =========================================================
   NORMALIZE RESPONSE USER
========================================================= */

function extractUserData(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  if (Array.isArray(result?.rows)) {
    return result.rows;
  }

  if (Array.isArray(result?.results)) {
    return result.results;
  }

  if (Array.isArray(result?.users)) {
    return result.users;
  }

  return [];
}

/* =========================================================
   NORMALIZE GURU
========================================================= */

function normalizeGuru(item, index) {
  const pengguna = item?.pengguna || item?.user || {};

  const id =
    item?.id ??
    pengguna?.id ??
    `guru-${index}`;

  const nama =
    item?.namaLengkap ??
    item?.nama ??
    pengguna?.namaLengkap ??
    pengguna?.nama ??
    "-";

  const nip =
    item?.nip ??
    pengguna?.nip ??
    "-";

  const jabatan =
    item?.jabatan ??
    pengguna?.jabatan ??
    "Guru";

  return {
    id,
    nama,
    nip,
    jabatan,

    status: "belum_tersedia",
    jamMasuk: "-",
    jamPulang: "-",

    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,

    original: item,
  };
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge() {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        border-theme-border
        bg-theme-card-soft
        px-2.5
        py-1
        text-[11px]
        font-semibold
        text-theme-text-muted
        whitespace-nowrap
      "
    >
      <CircleAlert size={12} />
      Belum tersedia
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function RekapGuruPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [tanggal, setTanggal] = useState(() =>
    getTodayDate()
  );

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedGuru, setSelectedGuru] = useState(null);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  /* =======================================================
     FETCH GURU
  ======================================================= */

  const fetchGuru = useCallback(
    async (showLoading = true) => {
      const token = getToken();

      if (!token) {
        setError(
          "Sesi login tidak ditemukan. Silakan login kembali."
        );

        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const url = `${GURU_ENDPOINT}?role=guru`;

        const response = await fetch(url, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },

          cache: "no-store",
        });

        const text = await response.text();

        let result = null;

        try {
          result = text ? JSON.parse(text) : null;
        } catch {
          console.error(
            "Response mentah dari server:",
            text
          );

          throw new Error(
            `Response dari server bukan JSON yang valid: ${text.slice(
              0,
              300
            )}`
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              result?.detail ||
              `Gagal mengambil data guru (${response.status})`
          );
        }

        const rawData = extractUserData(result);

        const normalized = rawData.map(
          normalizeGuru
        );

        setData(normalized);
        setPage(1);
      } catch (err) {
        console.error(
          "ERROR FETCH DATA GURU:",
          err
        );

        setData([]);

        setError(
          err?.message ||
            "Gagal mengambil data guru."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchGuru();
  }, [fetchGuru]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredData = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    if (!keyword) {
      return data;
    }

    return data.filter((guru) => {
      return (
        guru.nama
          .toLowerCase()
          .includes(keyword) ||
        guru.nip
          .toLowerCase()
          .includes(keyword) ||
        guru.jabatan
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [data, search]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length / limit
    )
  );

  const paginatedData = useMemo(() => {
    const start =
      (page - 1) * limit;

    const end = start + limit;

    return filteredData.slice(
      start,
      end
    );
  }, [
    filteredData,
    page,
    limit,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [
    page,
    totalPages,
  ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    return {
      total: data.length,
      hadir: 0,
      terlambat: 0,
      izin: 0,
      alpha: 0,
    };
  }, [data]);

  /* =======================================================
     HANDLER
  ======================================================= */

  const handleTanggalChange = (
    event
  ) => {
    setTanggal(
      event.target.value
    );

    setPage(1);
  };

  const handleRefresh = () => {
    fetchGuru(true);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        flex
        h-screen
        w-full
        overflow-hidden
        theme-page
      "
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        activeMenu="rekap-guru"
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className="
          flex
          flex-1
          min-w-0
          h-full
          flex-col
          overflow-hidden
          theme-page
        "
      >
        <Header
          title="Rekap Absensi Guru"
          onMenuClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <main
          className="
            flex-1
            overflow-y-auto
            theme-page
          "
        >
          <div
            className="
              space-y-5
              p-4
              sm:space-y-6
              sm:p-6
              lg:p-8
            "
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                flex
                flex-col
                gap-4
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--school-primary,#155DFC)]
                    text-white
                    shadow-lg
                    shadow-black/10
                  "
                >
                  <Users size={20} />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      text-xl
                      font-bold
                      sm:text-2xl
                      theme-text
                    "
                  >
                    Rekap Absensi Guru
                  </h1>

                  <p
                    className="
                      mt-1
                      text-xs
                      sm:text-sm
                      theme-text-muted
                    "
                  >
                    Daftar guru berdasarkan data
                    pengguna yang tersedia.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-theme-border
                  bg-theme-card
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  theme-text-secondary
                  transition
                  hover:bg-theme-card-soft
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* =================================================
                INFO
            ================================================= */}

            <div
              className="
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-theme-border
                p-4
                theme-info
              "
            >
              <CircleAlert
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-semibold">
                  Data absensi guru belum tersedia
                  dari backend
                </p>

                <p className="mt-1 text-xs leading-5 opacity-90">
                  Halaman ini menggunakan data guru
                  dari endpoint pengguna yang tersedia.
                  Status, jam masuk, dan jam pulang belum
                  ditampilkan karena backend saat ini
                  belum menyediakan endpoint rekap
                  absensi guru.
                </p>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-theme-border
                  p-4
                  theme-danger
                "
              >
                <CircleAlert
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="
                    opacity-70
                    transition
                    hover:opacity-100
                  "
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* =================================================
                FILTER TANGGAL
            ================================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-theme-border
                shadow-sm
                theme-card
              "
            >
              <div className="p-4 sm:p-5 lg:p-6">
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-end
                  "
                >
                  <div className="w-full lg:max-w-xs">
                    <label
                      htmlFor="tanggal"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        theme-text-secondary
                      "
                    >
                      Tanggal Absensi
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          theme-text-muted
                        "
                      />

                      <input
                        id="tanggal"
                        type="date"
                        value={tanggal}
                        onChange={
                          handleTanggalChange
                        }
                        className="
                          theme-input
                          h-11
                          w-full
                          rounded-xl
                          border
                          pl-9
                          pr-3
                          text-sm
                          font-medium
                          outline-none
                          transition
                          focus:border-[var(--school-primary,#155DFC)]
                          focus:ring-2
                          focus:ring-[var(--school-primary,#155DFC)]/20
                        "
                      />
                    </div>
                  </div>

                  <div
                    className="
                      pb-2
                      text-xs
                      sm:text-sm
                      theme-text-muted
                    "
                  >
                    Tanggal yang dipilih:{" "}
                    <span
                      className="
                        font-semibold
                        theme-text
                      "
                    >
                      {formatTanggalIndonesia(
                        tanggal
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div
              className="
                grid
                grid-cols-2
                gap-3
                lg:grid-cols-5
                sm:gap-4
              "
            >
              <StatCard
                title="Total Guru"
                value={statistics.total}
                description="Data guru"
                icon={Users}
                iconClass="text-[var(--school-primary,#155DFC)]"
                loading={loading}
              />

              <StatCard
                title="Hadir"
                value="-"
                description="Belum tersedia"
                icon={UserCheck}
                iconClass="text-emerald-500"
                loading={false}
              />

              <StatCard
                title="Terlambat"
                value="-"
                description="Belum tersedia"
                icon={Clock3}
                iconClass="text-amber-500"
                loading={false}
              />

              <StatCard
                title="Izin"
                value="-"
                description="Belum tersedia"
                icon={CircleAlert}
                iconClass="text-sky-500"
                loading={false}
              />

              <StatCard
                title="Alpha"
                value="-"
                description="Belum tersedia"
                icon={CircleAlert}
                iconClass="text-red-500"
                loading={false}
              />
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <section
              className="
                rounded-2xl
                border
                border-theme-border
                p-4
                shadow-sm
                theme-card
              "
            >
              <div className="relative">
                <Search
                  size={16}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    theme-text-muted
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );

                    setPage(1);
                  }}
                  placeholder="Cari nama guru, NIP, atau jabatan..."
                  className="
                    theme-input
                    w-full
                    rounded-xl
                    border
                    py-2.5
                    pl-9
                    pr-10
                    text-sm
                    outline-none
                    transition
                    focus:border-[var(--school-primary,#155DFC)]
                    focus:ring-2
                    focus:ring-[var(--school-primary,#155DFC)]/20
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      theme-text-muted
                      transition
                      hover:opacity-70
                    "
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </section>

            {/* =================================================
                TABLE
            ================================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-theme-border
                shadow-sm
                theme-card
              "
            >
              {/* TABLE HEADER */}

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-b
                  border-theme-border
                  px-4
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-5
                  lg:px-6
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-theme-border
                        bg-theme-card-soft
                      "
                    >
                      <Database
                        size={15}
                        className="
                          text-[var(--school-primary,#155DFC)]
                        "
                      />
                    </div>

                    <h2
                      className="
                        text-sm
                        font-bold
                        theme-text
                      "
                    >
                      Data Guru
                    </h2>
                  </div>

                  <p
                    className="
                      mt-1
                      text-xs
                      theme-text-muted
                    "
                  >
                    Data guru yang tersedia dari
                    backend.
                  </p>
                </div>

                <div
                  className="
                    text-xs
                    theme-text-muted
                  "
                >
                  {filteredData.length} guru
                </div>
              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">
                <table
                  className="
                    w-full
                    min-w-[900px]
                    border-collapse
                    text-sm
                  "
                >
                  <thead>
                    <tr
                      className="
                        bg-[var(--school-primary,#155DFC)]
                        text-white
                      "
                    >
                      <th className="w-[65px] px-4 py-3 text-center font-semibold">
                        No
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Guru
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        NIP
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Jabatan
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Jam Masuk
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Jam Pulang
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({
                        length: limit,
                      }).map(
                        (_, index) => (
                          <tr
                            key={index}
                            className="
                              border-b
                              border-theme-border-soft
                            "
                          >
                            <td className="px-4 py-3 text-center">
                              <div
                                className="
                                  mx-auto
                                  h-7
                                  w-7
                                  animate-pulse
                                  rounded-lg
                                  bg-theme-card-soft
                                "
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <div
                                  className="
                                    h-4
                                    w-36
                                    animate-pulse
                                    rounded
                                    bg-theme-card-soft
                                  "
                                />

                                <div
                                  className="
                                    h-3
                                    w-24
                                    animate-pulse
                                    rounded
                                    bg-theme-card-soft
                                  "
                                />
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div
                                className="
                                  h-4
                                  w-24
                                  animate-pulse
                                  rounded
                                  bg-theme-card-soft
                                "
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div
                                className="
                                  h-4
                                  w-28
                                  animate-pulse
                                  rounded
                                  bg-theme-card-soft
                                "
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div
                                className="
                                  h-6
                                  w-24
                                  animate-pulse
                                  rounded-full
                                  bg-theme-card-soft
                                "
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div
                                className="
                                  h-4
                                  w-16
                                  animate-pulse
                                  rounded
                                  bg-theme-card-soft
                                "
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div
                                className="
                                  h-4
                                  w-16
                                  animate-pulse
                                  rounded
                                  bg-theme-card-soft
                                "
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div
                                className="
                                  mx-auto
                                  h-8
                                  w-20
                                  animate-pulse
                                  rounded-lg
                                  bg-theme-card-soft
                                "
                              />
                            </td>
                          </tr>
                        )
                      )
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-16 text-center"
                        >
                          <div className="mx-auto flex max-w-md flex-col items-center">
                            <div
                              className="
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-theme-border
                                bg-theme-card-soft
                              "
                            >
                              <Users
                                size={24}
                                className="
                                  text-[var(--school-primary,#155DFC)]
                                "
                              />
                            </div>

                            <h3
                              className="
                                mt-4
                                text-base
                                font-bold
                                theme-text
                              "
                            >
                              Data guru tidak ditemukan
                            </h3>

                            <p
                              className="
                                mt-1
                                text-xs
                                theme-text-muted
                              "
                            >
                              Tidak ada guru yang sesuai
                              dengan pencarian.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map(
                        (guru, index) => (
                          <tr
                            key={guru.id}
                            className="
                              border-b
                              border-theme-border-soft
                              last:border-0
                              theme-table-hover
                              transition-colors
                            "
                          >
                            {/* NO */}

                            <td className="px-4 py-3 text-center">
                              <span
                                className="
                                  inline-flex
                                  h-7
                                  w-7
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-theme-border
                                  bg-theme-card-soft
                                  text-xs
                                  font-bold
                                  text-[var(--school-primary,#155DFC)]
                                "
                              >
                                {(page - 1) *
                                  limit +
                                  index +
                                  1}
                              </span>
                            </td>

                            {/* GURU */}

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[var(--school-primary,#155DFC)]
                                    text-xs
                                    font-bold
                                    text-white
                                  "
                                >
                                  {guru.nama
                                    .split(" ")
                                    .slice(0, 2)
                                    .map(
                                      (word) =>
                                        word[0]
                                    )
                                    .join("")
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p
                                    className="
                                      max-w-[200px]
                                      truncate
                                      font-semibold
                                      theme-text
                                    "
                                  >
                                    {guru.nama}
                                  </p>

                                  <p
                                    className="
                                      mt-0.5
                                      max-w-[200px]
                                      truncate
                                      text-[11px]
                                      theme-text-muted
                                    "
                                  >
                                    {guru.jabatan}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* NIP */}

                            <td
                              className="
                                px-4
                                py-3
                                text-xs
                                font-medium
                                theme-text-secondary
                              "
                            >
                              {guru.nip}
                            </td>

                            {/* JABATAN */}

                            <td
                              className="
                                px-4
                                py-3
                                text-xs
                                theme-text-secondary
                              "
                            >
                              {guru.jabatan}
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-3">
                              <StatusBadge />
                            </td>

                            {/* JAM MASUK */}

                            <td className="px-4 py-3">
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  text-xs
                                  font-semibold
                                  theme-text-muted
                                "
                              >
                                <Clock3 size={12} />
                                -
                              </span>
                            </td>

                            {/* JAM PULANG */}

                            <td className="px-4 py-3">
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  text-xs
                                  font-semibold
                                  theme-text-muted
                                "
                              >
                                <Clock3 size={12} />
                                -
                              </span>
                            </td>

                            {/* DETAIL */}

                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedGuru(
                                    guru
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-theme-border
                                  bg-theme-card
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  theme-text-secondary
                                  transition
                                  hover:bg-theme-card-soft
                                  hover:text-[var(--school-primary,#155DFC)]
                                "
                              >
                                <Eye size={13} />
                                Detail
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {!loading &&
                filteredData.length > 0 && (
                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      border-t
                      border-theme-border
                      bg-theme-card-soft
                      px-4
                      py-3
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      sm:px-5
                    "
                  >
                    <p
                      className="
                        text-xs
                        theme-text-muted
                      "
                    >
                      Menampilkan{" "}
                      <span className="font-semibold theme-text">
                        {(page - 1) *
                          limit +
                          1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold theme-text">
                        {Math.min(
                          page * limit,
                          filteredData.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text">
                        {filteredData.length}
                      </span>{" "}
                      guru
                    </p>

                    <div className="flex items-center gap-2">
                      <select
                        value={limit}
                        onChange={(event) => {
                          setLimit(
                            Number(
                              event.target.value
                            )
                          );

                          setPage(1);
                        }}
                        className="
                          theme-input
                          rounded-lg
                          border
                          px-3
                          py-2
                          text-xs
                          outline-none
                          focus:border-[var(--school-primary,#155DFC)]
                          focus:ring-2
                          focus:ring-[var(--school-primary,#155DFC)]/20
                        "
                      >
                        <option value={10}>
                          10 / halaman
                        </option>

                        <option value={20}>
                          20 / halaman
                        </option>

                        <option value={50}>
                          50 / halaman
                        </option>
                      </select>

                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage(
                            (current) =>
                              current - 1
                          )
                        }
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-theme-border
                          bg-theme-card
                          theme-text-muted
                          transition
                          hover:bg-theme-card-soft
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <span
                        className="
                          min-w-[60px]
                          text-center
                          text-xs
                          font-semibold
                          theme-text-secondary
                        "
                      >
                        {page} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={
                          page >= totalPages
                        }
                        onClick={() =>
                          setPage(
                            (current) =>
                              current + 1
                          )
                        }
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-theme-border
                          bg-theme-card
                          theme-text-muted
                          transition
                          hover:bg-theme-card-soft
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >
                        <ChevronRight size={15} />
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

      {selectedGuru && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/60
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedGuru(null);
            }
          }}
        >
          <div
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              border
              border-theme-border
              shadow-2xl
              theme-card
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-theme-border
                px-6
                py-5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-theme-border
                    bg-theme-card-soft
                  "
                >
                  <Eye
                    size={17}
                    className="
                      text-[var(--school-primary,#155DFC)]
                    "
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-sm
                      font-bold
                      theme-text
                    "
                  >
                    Detail Guru
                  </h2>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      theme-text-muted
                    "
                  >
                    {formatTanggalIndonesia(
                      tanggal
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedGuru(null)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  theme-text-muted
                  transition
                  hover:bg-theme-card-soft
                  hover:text-[var(--school-primary,#155DFC)]
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}

            <div
              className="
                space-y-5
                px-6
                py-5
              "
            >
              {/* PROFIL */}

              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  border
                  border-theme-border
                  bg-theme-card-soft
                  p-4
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--school-primary,#155DFC)]
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  {selectedGuru.nama
                    .split(" ")
                    .slice(0, 2)
                    .map(
                      (word) =>
                        word[0]
                    )
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-base
                      font-bold
                      theme-text
                    "
                  >
                    {selectedGuru.nama}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      theme-text-secondary
                    "
                  >
                    {selectedGuru.jabatan}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      theme-text-muted
                    "
                  >
                    NIP: {selectedGuru.nip}
                  </p>
                </div>
              </div>

              {/* INFO ABSENSI */}

              <div
                className="
                  rounded-xl
                  border
                  border-theme-border
                  p-4
                  theme-info
                "
              >
                <div className="flex items-start gap-3">
                  <CircleAlert
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Data absensi belum tersedia
                    </p>

                    <p className="mt-1 text-xs leading-5 opacity-90">
                      Backend saat ini belum
                      menyediakan endpoint rekap
                      absensi guru. Karena itu
                      status, jam masuk, dan jam
                      pulang tidak dibuat secara
                      dummy.
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS */}

              <div>
                <p
                  className="
                    mb-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wide
                    theme-text-muted
                  "
                >
                  Status Kehadiran
                </p>

                <StatusBadge />
              </div>

              {/* JAM */}

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="
                    rounded-xl
                    border
                    border-theme-border
                    bg-theme-card
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      theme-text-muted
                    "
                  >
                    <Clock3 size={14} />

                    <p
                      className="
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                      "
                    >
                      Jam Masuk
                    </p>
                  </div>

                  <p
                    className="
                      mt-2
                      text-lg
                      font-bold
                      theme-text
                    "
                  >
                    -
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-theme-border
                    bg-theme-card
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      theme-text-muted
                    "
                  >
                    <Clock3 size={14} />

                    <p
                      className="
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                      "
                    >
                      Jam Pulang
                    </p>
                  </div>

                  <p
                    className="
                      mt-2
                      text-lg
                      font-bold
                      theme-text
                    "
                  >
                    -
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="
                border-t
                border-theme-border
                bg-theme-card-soft
                px-6
                py-4
              "
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedGuru(null)
                }
                className="
                  w-full
                  rounded-xl
                  bg-[var(--school-primary,#155DFC)]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:brightness-110
                "
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
    <div
      className="
        rounded-2xl
        border
        border-theme-border
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        theme-card
        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="
              text-[11px]
              font-medium
              sm:text-xs
              theme-text-muted
            "
          >
            {title}
          </p>

          {loading ? (
            <div
              className="
                mt-2
                h-8
                w-16
                animate-pulse
                rounded-lg
                bg-theme-card-soft
              "
            />
          ) : (
            <p
              className="
                mt-1.5
                text-2xl
                font-bold
                sm:text-3xl
                theme-text
              "
            >
              {value}
            </p>
          )}

          <p
            className="
              mt-1
              text-[10px]
              sm:text-xs
              theme-text-muted
            "
          >
            {description}
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-theme-border
            bg-theme-card-soft
          "
        >
          {loading ? (
            <Loader2
              size={18}
              className="
                animate-spin
                theme-text-muted
              "
            />
          ) : (
            <Icon
              size={18}
              className={iconClass}
            />
          )}
        </div>
      </div>
    </div>
  );
}