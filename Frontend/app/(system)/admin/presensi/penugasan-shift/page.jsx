"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  Users,
  Clock3,
  BriefcaseBusiness,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  X,
  UserRound,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { getUsers } from "@/services/user.service";
import { getShiftKerja } from "@/services/shiftKerja.service";

const PAGE_SIZE = 10;

const JABATAN_ENDPOINT = "/api/kategori-jabatan";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function unwrapResponse(response) {
  let result = response;

  for (let i = 0; i < 3; i++) {
    if (
      result &&
      typeof result === "object" &&
      "data" in result
    ) {
      result = result.data;
    } else {
      break;
    }
  }

  return result;
}

function getArray(response) {
  const result = unwrapResponse(response);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.users)) return result.users;
  if (Array.isArray(result?.pengguna)) return result.pengguna;
  if (Array.isArray(result?.kategoriJabatan)) {
    return result.kategoriJabatan;
  }

  return [];
}

function formatJam(value) {
  if (!value) return "-";

  const text = String(value);

  if (/^\d{1,2}:\d{2}/.test(text)) {
    const match = text.match(/^(\d{1,2}):(\d{2})/);

    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  const date = new Date(text);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return text;
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba lagi.";
}

function getJabatanName(item, jabatanList = []) {
  const relation = item?.kategoriJabatan;

  if (typeof relation === "string" && relation.trim()) {
    return relation;
  }

  const relationName =
    relation?.nama ??
    relation?.namaKategori ??
    relation?.namaJabatan;

  if (relationName) return relationName;

  const id = item?.kategoriJabatanId;

  if (id == null) return "";

  const found = jabatanList.find(
    (jabatan) => String(jabatan.id) === String(id)
  );

  return (
    found?.nama ??
    found?.namaKategori ??
    found?.namaJabatan ??
    ""
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
        {icon}
      </div>
    </div>
  );
}

/* =========================================================
   SORTABLE HEADER
========================================================= */

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
  align = "left",
}) {
  const active = sortBy === column;

  return (
    <th
      className={`px-5 py-4 font-semibold ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1.5 transition hover:text-slate-800 dark:hover:text-slate-100 ${
          active ? "text-blue-700 dark:text-blue-300" : ""
        }`}
        title={`Urutkan ${label} ${
          active && sortOrder === "asc" ? "DESC" : "ASC"
        }`}
      >
        {label}
        {active ? (
          sortOrder === "asc" ? (
            <ArrowUp size={13} />
          ) : (
            <ArrowDown size={13} />
          )
        ) : (
          <ArrowUpDown size={13} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function PenugasanShiftPage() {
  const router = useRouter();

  const [pegawai, setPegawai] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [filterShift, setFilterShift] = useState("semua");
  const [page, setPage] = useState(1);

  // ============================================================
  // SORTING
  // ============================================================
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [pegawaiResponse, shiftResponse, jabatanResponse] =
        await Promise.all([
          getUsers({ page: 1, limit: 100 }),
          getShiftKerja({
            page: 1,
            limit: 100,
            status: "aktif",
          }),
          apiFetch(JABATAN_ENDPOINT, { method: "GET" }),
        ]);

      const pegawaiData = Array.isArray(pegawaiResponse?.data)
        ? pegawaiResponse.data
        : [];

      const jabatanData = getArray(jabatanResponse);
      const shifts = Array.isArray(shiftResponse?.data)
        ? shiftResponse.data
        : [];

      setPegawai(pegawaiData);
      setShiftList(shifts);
      setJabatanList(jabatanData);
      setPage(1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ambil notice dari sessionStorage (dari halaman atur shift)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("penugasan-notice");
      if (saved) {
        setNotice(saved);
        sessionStorage.removeItem("penugasan-notice");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const filteredPegawai = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return pegawai.filter((item) => {
      const nama = String(item?.namaLengkap ?? "").toLowerCase();
      const email = String(item?.email ?? "").toLowerCase();
      const shiftId = item?.shiftKerjaId;

      const matchSearch =
        !keyword || nama.includes(keyword) || email.includes(keyword);

      const matchShift =
        filterShift === "semua"
          ? true
          : filterShift === "belum"
            ? shiftId == null || shiftId === ""
            : String(shiftId) === String(filterShift);

      return matchSearch && matchShift;
    });
  }, [pegawai, search, filterShift]);

  // ============================================================
  // SORTED DATA
  // ============================================================
  const sortedPegawai = useMemo(() => {
    const data = [...filteredPegawai];

    data.sort((a, b) => {
      let valA;
      let valB;

      switch (sortBy) {
        case "jabatan": {
          valA = getJabatanName(a, jabatanList).toLowerCase();
          valB = getJabatanName(b, jabatanList).toLowerCase();
          break;
        }
        case "shift": {
          const shiftA = a.shiftKerjaMaster ?? shiftList.find(
            (s) => String(s.id) === String(a.shiftKerjaId)
          );
          const shiftB = b.shiftKerjaMaster ?? shiftList.find(
            (s) => String(s.id) === String(b.shiftKerjaId)
          );
          valA = String(shiftA?.nama ?? "").toLowerCase();
          valB = String(shiftB?.nama ?? "").toLowerCase();
          break;
        }
        case "jamKerja": {
          const shiftA = a.shiftKerjaMaster ?? shiftList.find(
            (s) => String(s.id) === String(a.shiftKerjaId)
          );
          const shiftB = b.shiftKerjaMaster ?? shiftList.find(
            (s) => String(s.id) === String(b.shiftKerjaId)
          );
          valA = String(shiftA?.jamMasuk ?? "");
          valB = String(shiftB?.jamMasuk ?? "");
          break;
        }
        case "email":
          valA = String(a.email ?? "").toLowerCase();
          valB = String(b.email ?? "").toLowerCase();
          break;
        case "nama":
        default:
          valA = String(a.namaLengkap ?? "").toLowerCase();
          valB = String(b.namaLengkap ?? "").toLowerCase();
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [filteredPegawai, sortBy, sortOrder, jabatanList, shiftList]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedPegawai.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visiblePegawai = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedPegawai.slice(start, start + PAGE_SIZE);
  }, [sortedPegawai, currentPage]);

  const totalSudahDitugaskan = pegawai.filter(
    (item) =>
      item?.shiftKerjaId != null && item.shiftKerjaId !== ""
  ).length;

  const totalBelumDitugaskan =
    pegawai.length - totalSudahDitugaskan;

  /* =======================================================
     NAVIGASI KE HALAMAN ATUR SHIFT
  ======================================================= */

  function openAssignment(item) {
    if (!item?.id) {
      setError("ID pegawai tidak ditemukan.");
      return;
    }
    router.push(`/admin/presensi/penugasan-shift/${item.id}`);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="relative z-30 h-full shrink-0">
        <Sidebar role="admin_sekolah" />
      </aside>

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-20 flex h-16 shrink-0 items-center border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="w-full min-w-0">
            <Header />
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
            {/* PAGE TITLE */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <BriefcaseBusiness size={16} />
                  <span>Presensi</span>
                  <span>/</span>
                  <span className="font-medium text-blue-700 dark:text-blue-400">
                    Penugasan Shift
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Penugasan Shift Pegawai
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Kelola penempatan shift kerja dan kategori jabatan
                  untuk guru serta pegawai sekolah.
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 sm:self-center"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Muat ulang
              </button>
            </section>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1 break-words">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                  className="shrink-0 rounded-md p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1">{notice}</p>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Tutup pesan"
                  className="shrink-0 rounded-md p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Total Pegawai"
                value={loading ? "—" : pegawai.length}
                icon={<Users size={20} />}
              />
              <StatCard
                title="Sudah Memiliki Shift"
                value={loading ? "—" : totalSudahDitugaskan}
                icon={<CheckCircle2 size={20} />}
              />
              <StatCard
                title="Belum Memiliki Shift"
                value={loading ? "—" : totalBelumDitugaskan}
                icon={<CalendarClock size={20} />}
              />
            </section>

            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Daftar Penugasan
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Pilih pegawai untuk menetapkan atau mengubah shift.
                    </p>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto">
                    <div className="relative min-w-0">
                      <Search
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                        placeholder="Cari nama atau email..."
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-900/40 xl:w-64"
                      />
                    </div>

                    <select
                      value={filterShift}
                      onChange={(event) => {
                        setFilterShift(event.target.value);
                        setPage(1);
                      }}
                      className="h-10 min-w-0 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-900/40 xl:w-56"
                      aria-label="Filter penugasan shift"
                    >
                      <option value="semua">Semua penugasan</option>
                      <option value="belum">Belum memiliki shift</option>
                      {shiftList.map((shift) => (
                        <option key={shift.id} value={String(shift.id)}>
                          {shift.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-slate-500 dark:text-slate-400">
                  <LoaderCircle
                    size={28}
                    className="animate-spin text-blue-600"
                  />
                  <p className="text-sm">Memuat data penugasan...</p>
                </div>
              ) : (
                <>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                        <tr>
                          <th className="w-16 px-5 py-4 font-semibold">No</th>
                          <SortableHeader
                            label="Pegawai"
                            column="nama"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Kategori Jabatan"
                            column="jabatan"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Shift Kerja"
                            column="shift"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Jam Kerja"
                            column="jamKerja"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <th className="px-5 py-4 text-right font-semibold">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {visiblePegawai.map((item, index) => {
                          const shiftId = item?.shiftKerjaId;
                          const shift =
                            item?.shiftKerjaMaster ??
                            shiftList.find(
                              (entry) =>
                                String(entry.id) === String(shiftId)
                            );
                          const jabatan = getJabatanName(item, jabatanList);

                          return (
                            <tr
                              key={item.id}
                              className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                            >
                              <td className="px-5 py-4">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                    <UserRound size={19} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="max-w-xs truncate font-semibold text-slate-800 dark:text-slate-100">
                                      {item.namaLengkap || "Tanpa nama"}
                                    </p>
                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                                      {item.email || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                {jabatan ? (
                                  <span className="text-slate-700 dark:text-slate-300">
                                    {jabatan}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">
                                    Belum ditentukan
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                {shift ? (
                                  <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">
                                      {shift.nama}
                                    </p>
                                    {shift.kode && (
                                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {shift.kode}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                    Belum ditugaskan
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                {shift ? (
                                  <div className="flex items-center gap-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                    <Clock3
                                      size={15}
                                      className="shrink-0 text-slate-400"
                                    />
                                    <span>
                                      {formatJam(shift.jamMasuk)}
                                      {" – "}
                                      {formatJam(shift.jamKeluar)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => openAssignment(item)}
                                  className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                                >
                                  <BriefcaseBusiness size={15} />
                                  Atur shift
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {visiblePegawai.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-16 text-center"
                            >
                              <Users
                                size={30}
                                className="mx-auto mb-3 text-slate-300 dark:text-slate-600"
                              />
                              <p className="font-medium text-slate-800 dark:text-slate-200">
                                Data pegawai tidak ditemukan
                              </p>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Coba ubah kata kunci atau filter penugasan.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {sortedPegawai.length === 0
                          ? 0
                          : (currentPage - 1) * PAGE_SIZE + 1}
                        {"–"}
                        {Math.min(
                          currentPage * PAGE_SIZE,
                          sortedPegawai.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {sortedPegawai.length}
                      </span>{" "}
                      pegawai
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() =>
                          setPage((value) => Math.max(1, value - 1))
                        }
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft size={16} />
                        Sebelumnya
                      </button>

                      <span className="whitespace-nowrap px-2 text-sm text-slate-600 dark:text-slate-300">
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          setPage((value) =>
                            Math.min(totalPages, value + 1)
                          )
                        }
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Berikutnya
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>

            <div className="h-2 shrink-0" />
          </div>
        </main>
      </div>
    </div>
  );
}