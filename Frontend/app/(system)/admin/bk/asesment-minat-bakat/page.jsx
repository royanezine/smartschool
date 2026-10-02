"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  getAsesmenMinatBakat,
  deleteAsesmenMinatBakat,
} from "../../../../../services/bk.service";

export default function AsesmenMinatBakatPage() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("tanggal_desc");

  const [page, setPage] = useState(1);
  const perPage = 7;

  /* =========================================================
     LOAD DATA
  ========================================================= */

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const result = await getAsesmenMinatBakat();

      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err?.message ||
          "Gagal mengambil data asesmen."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     REFRESH
  ========================================================= */

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");

      const result =
        await getAsesmenMinatBakat();

      setData(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Gagal memuat ulang data."
      );
    } finally {
      setRefreshing(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filteredData = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    const filtered = data.filter(
      (item) =>
        item.siswa?.namaLengkap
          ?.toLowerCase()
          .includes(keyword) ||
        item.jenis
          ?.toLowerCase()
          .includes(keyword)
    );

    const sorted = [...filtered];

    const compareTanggal = (a, b) => {
      const ta = a.tanggal
        ? new Date(a.tanggal).getTime()
        : 0;

      const tb = b.tanggal
        ? new Date(b.tanggal).getTime()
        : 0;

      return ta - tb;
    };

    const compareNama = (a, b) => {
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

    const compareSkor = (a, b) =>
      (Number(a.skor) || 0) -
      (Number(b.skor) || 0);

    if (sortBy === "tanggal_desc") {
      sorted.sort((a, b) =>
        compareTanggal(b, a)
      );
    } else if (sortBy === "tanggal_asc") {
      sorted.sort(compareTanggal);
    } else if (sortBy === "nama_asc") {
      sorted.sort(compareNama);
    } else if (sortBy === "nama_desc") {
      sorted.sort((a, b) =>
        compareNama(b, a)
      );
    } else if (sortBy === "skor_desc") {
      sorted.sort((a, b) =>
        compareSkor(b, a)
      );
    } else if (sortBy === "skor_asc") {
      sorted.sort(compareSkor);
    }

    return sorted;
  }, [data, search, sortBy]);

  /* =========================================================
     RESET PAGE
  ========================================================= */

  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPage = Math.max(
    1,
    Math.ceil(
      filteredData.length / perPage
    )
  );

  const startIndex =
    (page - 1) * perPage;

  const paginatedData =
    filteredData.slice(
      startIndex,
      startIndex + perPage
    );

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const totalSiswa = new Set(
      data
        .map(
          (item) =>
            item.siswa?.id ||
            item.siswaId
        )
        .filter(Boolean)
    ).size;

    const selesai = data.filter(
      (item) =>
        (item.status || "").toLowerCase() ===
        "selesai"
    ).length;

    const rataSkor =
      data.length > 0
        ? Math.round(
            data.reduce(
              (sum, item) =>
                sum +
                (Number(item.skor) || 0),
              0
            ) / data.length
          )
        : 0;

    return {
      total: data.length,
      siswa: totalSiswa,
      selesai,
      rataSkor,
    };
  }, [data]);

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Yakin ingin menghapus asesmen ini?"
      )
    ) {
      return;
    }

    try {
      await deleteAsesmenMinatBakat(id);
      await loadData();
    } catch (err) {
      setError(
        err?.message ||
          "Gagal menghapus asesmen."
      );
    }
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  function formatTanggal(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function initials(name) {
    if (!name) return "?";

    const parts = name
      .trim()
      .split(" ");

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[1][0]
    ).toUpperCase();
  }

  function resetFilter() {
    setSearch("");
    setSortBy("tanggal_desc");
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="admin"
        active="bk"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="theme-page flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div className="flex items-start gap-4">

                {/* ICON */}

                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="theme-text text-[26px] font-bold leading-tight tracking-tight">
                    Asesmen Minat &amp; Bakat
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm font-medium">
                    Kelola hasil asesmen minat dan bakat siswa
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                {/* REFRESH */}

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Muat ulang data"
                  className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg
                    className={`h-4 w-4 ${
                      refreshing
                        ? "animate-spin"
                        : ""
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

                  {refreshing
                    ? "Memuat..."
                    : "Refresh"}
                </button>

                {/* TAMBAH */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/bk/asesment-minat-bakat/tambah"
                    )
                  }
                  className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition"
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

                  Tambah Asesmen
                </button>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="theme-danger theme-border mb-6 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm">
                {error}
              </div>
            )}

            {/* =================================================
                STATS
            ================================================= */}

            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <Stat
                label="Total Asesmen"
                value={stats.total}
                subtitle="Semua asesmen"
                icon="note"
                tone="blue"
              />

              <Stat
                label="Siswa Terlibat"
                value={stats.siswa}
                subtitle="Siswa unik"
                icon="user"
                tone="sky"
              />

              <Stat
                label="Selesai"
                value={stats.selesai}
                subtitle="Asesmen tuntas"
                icon="check"
                tone="emerald"
              />

              <Stat
                label="Rata-rata Skor"
                value={stats.rataSkor}
                subtitle="Rata-rata"
                icon="star"
                tone="amber"
              />
            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="theme-card theme-border mb-5 rounded-2xl border p-4 shadow-sm">

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
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Cari nama siswa atau jenis asesmen..."
                    className="theme-input w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm font-medium shadow-sm outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>

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
                      setSortBy(
                        e.target.value
                      )
                    }
                    className="theme-input rounded-xl border py-2.5 pl-9 pr-4 text-sm font-semibold shadow-sm outline-none transition focus:border-[var(--color-primary)]"
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

                    <option value="skor_desc">
                      Skor Tertinggi
                    </option>

                    <option value="skor_asc">
                      Skor Terendah
                    </option>
                  </select>
                </div>

                {/* RESET */}

                <button
                  type="button"
                  onClick={resetFilter}
                  className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-sm transition"
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

              {/* ACTIVE SORT */}

              <div className="theme-border-soft mt-3 flex flex-wrap items-center gap-2 border-t pt-3">

                <span className="theme-text-muted text-xs font-medium">
                  Urutan:
                </span>

                <span className="theme-info inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold">

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

                  {sortBy ===
                    "tanggal_desc" &&
                    "Tanggal Terbaru"}

                  {sortBy ===
                    "tanggal_asc" &&
                    "Tanggal Terlama"}

                  {sortBy ===
                    "nama_asc" &&
                    "Nama Siswa A → Z"}

                  {sortBy ===
                    "nama_desc" &&
                    "Nama Siswa Z → A"}

                  {sortBy ===
                    "skor_desc" &&
                    "Skor Tertinggi"}

                  {sortBy ===
                    "skor_asc" &&
                    "Skor Terendah"}
                </span>
              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-xl">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] text-left text-sm">

                  {/* TABLE HEADER */}

                  <thead className="theme-table-header theme-border-soft border-b">
                    <tr>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Siswa
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Tanggal
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Jenis
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Minat
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Bakat
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Skor
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="theme-border-soft border-b px-5 py-12 text-center"
                        >
                          <div className="theme-text-muted flex items-center justify-center gap-2 text-sm font-medium">

                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />

                            Memuat data...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="theme-text-muted theme-border-soft border-b px-5 py-12 text-center text-sm font-medium"
                        >
                          Belum ada asesmen.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map(
                        (item) => (
                          <tr
                            key={item.id}
                            className="theme-table-hover theme-border-soft border-b transition"
                          >

                            {/* SISWA */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">

                                <div className="theme-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-md">
                                  {initials(
                                    item.siswa
                                      ?.namaLengkap ||
                                      item.siswaId
                                  )}
                                </div>

                                <div className="min-w-0">

                                  <div className="theme-text truncate text-sm font-bold">
                                    {item.siswa
                                      ?.namaLengkap ||
                                      item.siswaId}
                                  </div>

                                  <div className="theme-text-muted text-xs font-medium">
                                    {item.siswa
                                      ?.nis
                                      ? `NIS ${item.siswa.nis}`
                                      : "—"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* TANGGAL */}

                            <td className="theme-text-secondary px-5 py-4 font-medium">
                              {formatTanggal(
                                item.tanggal
                              )}
                            </td>

                            {/* JENIS */}

                            <td className="theme-text px-5 py-4 font-semibold">
                              {item.jenis ||
                                "-"}
                            </td>

                            {/* MINAT */}

                            <td className="theme-text-secondary px-5 py-4 font-medium">
                              <div className="max-w-[150px] truncate">
                                {item.minat ||
                                  "-"}
                              </div>
                            </td>

                            {/* BAKAT */}

                            <td className="theme-text-secondary px-5 py-4 font-medium">
                              <div className="max-w-[150px] truncate">
                                {item.bakat ||
                                  "-"}
                              </div>
                            </td>

                            {/* SKOR */}

                            <td className="px-5 py-4">
                              <span className="theme-card-soft theme-text inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold">
                                {item.skor ??
                                  "-"}
                              </span>
                            </td>

                            {/* AKSI */}

                            <td className="px-5 py-4">

                              <div className="flex items-center justify-end gap-1">

                                {/* DETAIL */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/admin/bk/asesment-minat-bakat/${item.id}`
                                    )
                                  }
                                  title="Detail"
                                  className="theme-text-muted theme-header-hover rounded-lg p-2 transition hover:text-[var(--color-primary)]"
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
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/admin/bk/asesment-minat-bakat/${item.id}/edit`
                                    )
                                  }
                                  title="Edit"
                                  className="theme-text-muted theme-header-hover rounded-lg p-2 transition hover:text-[var(--color-primary)]"
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

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      item.id
                                    )
                                  }
                                  title="Hapus"
                                  className="theme-text-muted theme-header-hover rounded-lg p-2 transition hover:text-[var(--color-danger)]"
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
                  <div className="theme-border-soft flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row">

                    <p className="theme-text-secondary text-sm font-medium">
                      Menampilkan{" "}
                      <span className="theme-text font-bold">
                        {startIndex + 1} -{" "}
                        {Math.min(
                          startIndex +
                            perPage,
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
                        type="button"
                        onClick={() =>
                          setPage((p) =>
                            Math.max(
                              1,
                              p - 1
                            )
                          )
                        }
                        disabled={page === 1}
                        className="theme-card theme-border theme-text-secondary theme-header-hover flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40"
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
                        const active =
                          p === page;

                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() =>
                              setPage(p)
                            }
                            className={
                              active
                                ? "theme-primary flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold shadow-lg transition"
                                : "theme-card theme-border theme-text-secondary theme-header-hover flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-bold transition"
                            }
                          >
                            {p}
                          </button>
                        );
                      })}

                      {/* NEXT */}

                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) =>
                            Math.min(
                              totalPage,
                              p + 1
                            )
                          )
                        }
                        disabled={
                          page === totalPage
                        }
                        className="theme-card theme-border theme-text-secondary theme-header-hover flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40"
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

/* =========================================================
   STAT CARD
========================================================= */

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
  };

  const toneClass =
    tones[tone] || tones.blue;

  const icons = {
    note: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),

    user: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),

    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),

    star: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    ),
  };

  return (
    <div className="theme-card theme-border rounded-2xl border p-5 shadow-xl transition hover:shadow-lg">

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
          className={`${toneClass} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border`}
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