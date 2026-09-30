"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  getSesiKonseling,
  deleteSesiKonseling,
} from "../../../../../services/bk.service";

export default function SesiKonselingPage() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [sortBy, setSortBy] = useState("tanggal_desc");

  const [page, setPage] = useState(1);
  const perPage = 7;

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const result = await getSesiKonseling();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err?.message || "Gagal mengambil data sesi konseling.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");

      const result = await getSesiKonseling();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat ulang data.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    const filtered = data.filter((item) => {
      const namaSiswa = item.siswa?.namaLengkap || "";
      const namaKonselor = item.konselor?.namaLengkap || "";

      const cocokSearch =
        !keyword ||
        namaSiswa.toLowerCase().includes(keyword) ||
        namaKonselor.toLowerCase().includes(keyword) ||
        item.topik?.toLowerCase().includes(keyword);

      const cocokStatus =
        statusFilter === "semua" || item.status === statusFilter;

      return cocokSearch && cocokStatus;
    });

    const sorted = [...filtered];

    const compareTanggal = (a, b) => {
      const ta = a.tanggal ? new Date(a.tanggal).getTime() : 0;
      const tb = b.tanggal ? new Date(b.tanggal).getTime() : 0;

      return ta - tb;
    };

    const compareNamaSiswa = (a, b) => {
      const na = (
        a.siswa?.namaLengkap ||
        a.siswaId ||
        ""
      ).toLowerCase();

      const nb = (
        b.siswa?.namaLengkap ||
        b.siswaId ||
        ""
      ).toLowerCase();

      return na.localeCompare(nb, "id");
    };

    if (sortBy === "tanggal_asc") {
      sorted.sort(compareTanggal);
    } else if (sortBy === "tanggal_desc") {
      sorted.sort((a, b) => compareTanggal(b, a));
    } else if (sortBy === "nama_asc") {
      sorted.sort(compareNamaSiswa);
    } else if (sortBy === "nama_desc") {
      sorted.sort((a, b) => compareNamaSiswa(b, a));
    }

    return sorted;
  }, [data, search, statusFilter, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  const totalPage = Math.max(
    1,
    Math.ceil(filteredData.length / perPage)
  );

  const startIndex = (page - 1) * perPage;

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + perPage
  );

  const stats = {
    total: data.length,
    dijadwalkan: data.filter(
      (i) => i.status === "dijadwalkan"
    ).length,
    berlangsung: data.filter(
      (i) => i.status === "berlangsung"
    ).length,
    selesai: data.filter(
      (i) => i.status === "selesai"
    ).length,
    dibatalkan: data.filter(
      (i) => i.status === "dibatalkan"
    ).length,
  };

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Yakin ingin menghapus sesi konseling ini?"
      )
    ) {
      return;
    }

    try {
      setError("");

      await deleteSesiKonseling(id);
      await loadData();
    } catch (err) {
      setError(
        err?.message || "Gagal menghapus sesi konseling."
      );
    }
  }

  function formatTanggal(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function statusLabel(status) {
    const map = {
      dijadwalkan: "Dijadwalkan",
      berlangsung: "Berlangsung",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };

    return map[status] || status || "-";
  }

  function statusClass(status) {
    if (status === "selesai") {
      return "theme-success";
    }

    if (status === "berlangsung") {
      return "theme-info";
    }

    if (status === "dibatalkan") {
      return "theme-danger";
    }

    return "theme-warning";
  }

  function initials(name) {
    if (!name) return "?";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0][0] + parts[1][0]
    ).toUpperCase();
  }

  function resetFilter() {
    setSearch("");
    setStatusFilter("semua");
    setSortBy("tanggal_desc");
  }

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-7">
          <div className="mx-auto w-full max-w-[1600px]">

            {/* PAGE HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-current/10">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="theme-text text-2xl font-bold tracking-tight">
                    Sesi Konseling
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm font-medium">
                    Kelola data sesi konseling siswa
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Muat ulang data"
                  className="
                    theme-card theme-text-secondary theme-header-hover
                    inline-flex items-center justify-center gap-2
                    rounded-lg border px-4 py-2.5 text-sm font-bold
                    shadow-sm transition
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  <svg
                    className={`h-4 w-4 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>

                  {refreshing ? "Memuat..." : "Refresh"}
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/admin/bk/sesi-konseling/tambah"
                    )
                  }
                  className="
                    theme-primary
                    inline-flex items-center gap-2 rounded-lg
                    px-4 py-2.5 text-sm font-bold shadow-sm
                    transition focus:outline-none
                  "
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>

                  Tambah Sesi
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="theme-danger mb-5 rounded-lg border px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}

            {/* STATS */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat
                label="Total Sesi"
                value={stats.total}
                subtitle="Seluruh sesi"
                icon="chat"
                tone="blue"
              />

              <Stat
                label="Dijadwalkan"
                value={stats.dijadwalkan}
                subtitle="Akan datang"
                icon="clock"
                tone="amber"
              />

              <Stat
                label="Berlangsung"
                value={stats.berlangsung}
                subtitle="Sedang berjalan"
                icon="play"
                tone="sky"
              />

              <Stat
                label="Selesai"
                value={stats.selesai}
                subtitle="Sudah selesai"
                icon="check"
                tone="emerald"
              />

              <Stat
                label="Dibatalkan"
                value={stats.dibatalkan}
                subtitle="Tidak jadi"
                icon="x"
                tone="red"
              />
            </div>

            {/* FILTER */}
            <div className="theme-card mb-5 rounded-xl border p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                {/* SEARCH */}
                <div className="relative w-full lg:flex-1">
                  <svg
                    className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari nama siswa, konselor, atau topik..."
                    className="
                      theme-input w-full rounded-lg border
                      py-2.5 pl-9 pr-4 text-sm font-medium
                      outline-none transition
                      focus:border-[var(--color-primary)]
                    "
                  />
                </div>

                {/* STATUS */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="
                    theme-input rounded-lg border
                    px-4 py-2.5 text-sm font-semibold
                    outline-none transition
                    focus:border-[var(--color-primary)]
                  "
                >
                  <option value="semua">
                    Semua Status
                  </option>
                  <option value="dijadwalkan">
                    Dijadwalkan
                  </option>
                  <option value="berlangsung">
                    Berlangsung
                  </option>
                  <option value="selesai">
                    Selesai
                  </option>
                  <option value="dibatalkan">
                    Dibatalkan
                  </option>
                </select>

                {/* SORT */}
                <div className="relative">
                  <svg
                    className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value)
                    }
                    className="
                      theme-input rounded-lg border
                      py-2.5 pl-9 pr-4 text-sm font-semibold
                      outline-none transition
                      focus:border-[var(--color-primary)]
                    "
                  >
                    <option value="tanggal_desc">
                      Tanggal Terbaru
                    </option>
                    <option value="tanggal_asc">
                      Tanggal Terlama
                    </option>
                    <option value="nama_asc">
                      Nama Siswa A → Z
                    </option>
                    <option value="nama_desc">
                      Nama Siswa Z → A
                    </option>
                  </select>
                </div>

                {/* RESET */}
                <button
                  onClick={resetFilter}
                  className="
                    theme-card theme-text-secondary theme-header-hover
                    inline-flex items-center justify-center gap-2
                    rounded-lg border px-4 py-2.5
                    text-sm font-semibold transition
                  "
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>

                  Reset
                </button>
              </div>

              {/* INFO SORT */}
              <div className="theme-border-soft mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                <span className="theme-text-muted text-xs font-medium">
                  Urutan:
                </span>

                <span className="theme-info inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-current/10">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>

                  {sortBy === "tanggal_desc" &&
                    "Tanggal Terbaru"}

                  {sortBy === "tanggal_asc" &&
                    "Tanggal Terlama"}

                  {sortBy === "nama_asc" &&
                    "Nama Siswa A → Z"}

                  {sortBy === "nama_desc" &&
                    "Nama Siswa Z → A"}
                </span>
              </div>
            </div>

            {/* TABLE */}
            <div className="theme-card overflow-hidden rounded-xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="theme-table-header border-b">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Siswa
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Konselor
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Tanggal
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Topik
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-5 py-12 text-center"
                        >
                          <div className="theme-text-muted flex items-center justify-center gap-2 text-sm font-medium">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Memuat data...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="theme-text-muted px-5 py-12 text-center text-sm font-medium"
                        >
                          Belum ada data sesi konseling.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                        <tr
                          key={item.id}
                          className="theme-table-hover border-b last:border-b-0 transition"
                        >
                          {/* SISWA */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-current/10">
                                {initials(
                                  item.siswa?.namaLengkap ||
                                    item.siswaId
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="theme-text truncate text-sm font-bold">
                                  {item.siswa?.namaLengkap ||
                                    item.siswaId}
                                </div>

                                <div className="theme-text-muted text-xs font-medium">
                                  {item.siswa?.nis
                                    ? `NIS ${item.siswa.nis}`
                                    : "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* KONSELOR */}
                          <td className="theme-text-secondary px-5 py-4 text-sm font-semibold">
                            {item.konselor?.namaLengkap ||
                              item.konselorId ||
                              "-"}
                          </td>

                          {/* TANGGAL */}
                          <td className="px-5 py-4">
                            <div className="theme-text-secondary text-sm font-semibold">
                              {formatTanggal(item.tanggal)}
                            </div>

                            {item.waktuMulai && (
                              <div className="theme-text-muted text-xs font-medium">
                                {item.waktuMulai}

                                {item.waktuSelesai
                                  ? ` - ${item.waktuSelesai}`
                                  : ""}
                              </div>
                            )}
                          </td>

                          {/* TOPIK */}
                          <td className="px-5 py-4">
                            <div className="theme-text-secondary max-w-[220px] truncate text-sm font-semibold">
                              {item.topik}
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                                item.status
                              )}`}
                            >
                              {statusLabel(item.status)}
                            </span>
                          </td>

                          {/* AKSI */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">

                              {/* DETAIL */}
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/bk/sesi-konseling/${item.id}`
                                  )
                                }
                                title="Detail"
                                className="
                                  theme-text-muted
                                  theme-header-hover
                                  rounded-lg p-2 transition
                                "
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />

                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>

                              {/* EDIT */}
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/bk/sesi-konseling/${item.id}/edit`
                                  )
                                }
                                title="Edit"
                                className="
                                  theme-text-muted
                                  rounded-lg p-2 transition
                                  hover:bg-[var(--color-info-background)]
                                  hover:text-[var(--color-info)]
                                "
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                  />
                                </svg>
                              </button>

                              {/* HAPUS */}
                              <button
                                onClick={() =>
                                  handleDelete(item.id)
                                }
                                title="Hapus"
                                className="
                                  theme-text-muted
                                  rounded-lg p-2 transition
                                  hover:bg-[var(--color-danger-background)]
                                  hover:text-[var(--color-danger)]
                                "
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {!loading && filteredData.length > 0 && (
                <div className="theme-card flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row">
                  <p className="theme-text-secondary text-sm font-medium">
                    Menampilkan{" "}
                    <span className="theme-text font-bold">
                      {startIndex + 1} -{" "}
                      {Math.min(
                        startIndex + perPage,
                        filteredData.length
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="theme-text font-bold">
                      {filteredData.length}
                    </span>{" "}
                    data
                  </p>

                  <div className="flex items-center gap-1.5">

                    {/* PREVIOUS */}
                    <button
                      onClick={() =>
                        setPage((p) => Math.max(1, p - 1))
                      }
                      disabled={page === 1}
                      className="
                        theme-card theme-text-secondary
                        theme-header-hover
                        flex h-9 w-9 items-center justify-center
                        rounded-lg border transition
                        disabled:cursor-not-allowed disabled:opacity-40
                      "
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* PAGE NUMBERS */}
                    {Array.from({
                      length: totalPage,
                    }).map((_, i) => {
                      const p = i + 1;
                      const active = p === page;

                      if (
                        totalPage > 7 &&
                        p !== 1 &&
                        p !== totalPage &&
                        Math.abs(p - page) > 1
                      ) {
                        if (
                          p === 2 &&
                          page > 3
                        ) {
                          return (
                            <span
                              key={p}
                              className="theme-text-muted px-1"
                            >
                              …
                            </span>
                          );
                        }

                        if (
                          p === totalPage - 1 &&
                          page < totalPage - 2
                        ) {
                          return (
                            <span
                              key={p}
                              className="theme-text-muted px-1"
                            >
                              …
                            </span>
                          );
                        }

                        return null;
                      }

                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={
                            active
                              ? "theme-primary flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-bold shadow-sm transition"
                              : "theme-card theme-text-secondary theme-header-hover flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-bold transition"
                          }
                        >
                          {p}
                        </button>
                      );
                    })}

                    {/* NEXT */}
                    <button
                      onClick={() =>
                        setPage((p) =>
                          Math.min(totalPage, p + 1)
                        )
                      }
                      disabled={page === totalPage}
                      className="
                        theme-card theme-text-secondary
                        theme-header-hover
                        flex h-9 w-9 items-center justify-center
                        rounded-lg border transition
                        disabled:cursor-not-allowed disabled:opacity-40
                      "
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function Stat({
  label,
  value,
  subtitle,
  icon,
  tone = "blue",
}) {
  const tones = {
    blue: "theme-info",
    sky: "theme-info",
    emerald: "theme-success",
    amber: "theme-warning",
    red: "theme-danger",
  };

  const toneClass =
    tones[tone] || tones.blue;

  const icons = {
    chat: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),

    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),

    play: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),

    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),

    x: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div className="theme-card rounded-xl border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="theme-text-muted text-xs font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass} ring-1 ring-current/10`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {icons[icon]}
          </svg>
        </div>
      </div>

      {subtitle && (
        <p className="theme-text-muted mt-3 text-xs font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}