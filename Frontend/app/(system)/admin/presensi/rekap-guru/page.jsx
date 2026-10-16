
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  CalendarDays,
  Users,
  Clock3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Filter,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const PAGE_SIZE = 10;

function getToken() {
  if (typeof window === "undefined") return "";

  for (const key of [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
  ]) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return "";
}

async function apiRequest(path) {
  const token = getToken();
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const raw = await response.text();
  let body;

  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = { message: raw };
  }

  if (!response.ok) {
    const serverMessage =
      body?.message ||
      body?.error ||
      (typeof body === "string" ? body : "");

    if (
      response.status === 404 &&
      typeof serverMessage === "string" &&
      serverMessage.toLowerCase().includes("cannot get")
    ) {
      throw new Error(
        `Endpoint tidak ditemukan: ${url}. Periksa route backend.`
      );
    }

    throw new Error(
      serverMessage || `Request gagal (${response.status}): ${url}`
    );
  }

  if (typeof body === "string" && body.trim().startsWith("<")) {
    throw new Error(
      `Server mengembalikan HTML, bukan JSON: ${url}. Periksa URL API.`
    );
  }

  return body;
}

function unwrapList(response) {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.data,
    response?.data?.data,
    response?.data?.users,
    response?.data?.pengguna,
    response?.data?.items,
    response?.data?.results,
    response?.data?.shiftKerja,
    response?.users,
    response?.pengguna,
    response?.results,
    response?.items,
    response?.shiftKerja,
  ];

  return candidates.find(Array.isArray) || [];
}

function getUserId(user) {
  return (
    user?.id ??
    user?.penggunaId ??
    user?.userId ??
    user?.pengguna?.id ??
    user?.user?.id ??
    null
  );
}

function getUserName(user) {
  return (
    user?.namaLengkap ||
    user?.nama ||
    user?.name ||
    user?.pengguna?.namaLengkap ||
    user?.user?.namaLengkap ||
    user?.email ||
    "Nama guru belum tersedia"
  );
}

function getUserEmail(user) {
  return (
    user?.email ||
    user?.pengguna?.email ||
    user?.user?.email ||
    "-"
  );
}

function getUserNip(user) {
  return (
    user?.nip ||
    user?.NIP ||
    user?.nomorIndukPegawai ||
    user?.pengguna?.nip ||
    "-"
  );
}

function normalizeShift(shift) {
  return {
    ...shift,
    id: shift?.id ?? shift?.shiftKerjaId ?? null,
    nama: shift?.nama ?? shift?.namaShift ?? "Shift tanpa nama",
    jamMasuk:
      shift?.jamMasuk ??
      shift?.jam_masuk ??
      null,
    jamKeluar:
      shift?.jamKeluar ??
      shift?.jam_keluar ??
      null,
    toleransiTerlambatMenit:
      shift?.toleransiTerlambatMenit ?? null,
  };
}

function isActiveShift(shift) {
  if (shift?.dihapusPada || shift?.deletedAt) return false;

  if (typeof shift?.status === "boolean") {
    return shift.status;
  }

  if (typeof shift?.status === "string") {
    return ![
      "nonaktif",
      "tidak aktif",
      "inactive",
      "deleted",
    ].includes(shift.status.toLowerCase());
  }

  return true;
}

function formatTime(value) {
  if (!value) return "-";

  const match = String(value).match(/(\d{1,2}):(\d{2})/);

  if (!match) return String(value);

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function todayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {detail}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 rounded-xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Users size={26} />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function RekapGuruPage() {
  const [teachers, setTeachers] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedShift, setSelectedShift] = useState("semua");
  const [selectedDate, setSelectedDate] = useState(todayLocal());
  const [page, setPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [usersResponse, shiftsResponse] = await Promise.all([
        apiRequest("/api/users?limit=100&role=guru"),
        apiRequest("/api/shift-kerja?page=1&limit=100"),
      ]);

      const rawUsers = unwrapList(usersResponse);
      const rawShifts = unwrapList(shiftsResponse);

      const normalizedShifts = rawShifts
        .map(normalizeShift)
        .filter((shift) => shift.id != null);

      const activeShifts = normalizedShifts.filter(isActiveShift);

const normalizedTeachers = rawUsers.map((user, index) => {
  const userId = getUserId(user);

  // Field dari controller pengguna BE.
  const shiftKerja = String(user?.shiftKerja || "")
    .trim()
    .toLowerCase();

  // Cocokkan nilai shift pengguna dengan master shift.
  const matchedShift = activeShifts.find((shift) => {
    const nama = String(shift?.nama || "").trim().toLowerCase();
    const kode = String(shift?.kode || "").trim().toLowerCase();

    return nama === shiftKerja || kode === shiftKerja;
  });

  return {
    id: userId != null ? String(userId) : `teacher-${index}`,
    nama: getUserName(user),
    email: getUserEmail(user),
    nip: getUserNip(user),
    shiftKerja,
    shifts: matchedShift ? [matchedShift] : [],
  };
});

      setTeachers(normalizedTeachers);
      setShifts(activeShifts);
      setPage(1);
    } catch (err) {
      console.error("Gagal memuat rekap guru:", err);

      setError(
        err?.message ||
          "Data guru dan shift kerja gagal dimuat. Periksa endpoint backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTeachers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesSearch =
        !keyword ||
        teacher.nama.toLowerCase().includes(keyword) ||
        teacher.email.toLowerCase().includes(keyword) ||
        teacher.nip.toLowerCase().includes(keyword);

      const matchesShift =
        selectedShift === "semua" ||
        teacher.shifts.some(
          (shift) => String(shift.id) === String(selectedShift)
        );

      return matchesSearch && matchesShift;
    });
  }, [teachers, search, selectedShift]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTeachers.length / PAGE_SIZE)
  );

  const safePage = Math.min(page, totalPages);

  const paginatedTeachers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTeachers.slice(start, start + PAGE_SIZE);
  }, [filteredTeachers, safePage]);

  const teachersWithShift = useMemo(
    () => teachers.filter((teacher) => teacher.shifts.length > 0).length,
    [teachers]
  );

  const teachersWithoutShift = teachers.length - teachersWithShift;

  function changeSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function changeShift(value) {
    setSelectedShift(value);
    setPage(1);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* SIDEBAR */}
      <aside className="relative z-30 h-full shrink-0">
        <Sidebar role="admin_sekolah" />
      </aside>

      {/* AREA UTAMA */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER TETAP DI ATAS */}
        <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <Header />
        </header>

        {/* HANYA BAGIAN KONTEN INI YANG SCROLL */}
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {/* JUDUL HALAMAN */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>Manajemen Guru</span>
                  <span>/</span>
                  <span className="text-blue-700 dark:text-blue-400">
                    Rekap Guru
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Rekap Guru
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Lihat data guru dan pembagian shift kerja berdasarkan
                  data yang tersedia di backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={loading || refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
              >
                {refreshing ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <RefreshCw size={17} />
                )}
                Perbarui data
              </button>
            </div>

            {/* TANGGAL REKAP */}
            <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/60 dark:bg-blue-950/30">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-white p-2 text-blue-700 dark:bg-slate-900 dark:text-blue-300">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Tanggal rekap
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="rekap-date"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  Pilih tanggal
                </label>

                <input
                  id="rekap-date"
                  type="date"
                  value={selectedDate}
                  onChange={(event) =>
                    setSelectedDate(event.target.value)
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-blue-950"
                />
              </div>
            </div>

            {/* INFORMASI KETERSEDIAAN REKAP */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
              />

              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  Rekap kehadiran belum tersedia dari endpoint yang
                  terkonfirmasi
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-200/80">
                  Halaman ini menampilkan data guru dan shift yang berhasil
                  diambil. Status hadir, terlambat, dan jam check-in tidak
                  dibuat sendiri karena endpoint rekap seluruh guru
                  berdasarkan tanggal belum terkonfirmasi.
                </p>
              </div>
            </div>

            {/* STATISTIK */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon={Users}
                label="Total guru"
                value={loading ? "—" : teachers.length}
                detail="Data dari endpoint pengguna"
              />

              <StatCard
                icon={CheckCircle2}
                label="Guru dengan shift"
                value={loading ? "—" : teachersWithShift}
                detail="Berdasarkan relasi shift dari backend"
              />

              <StatCard
                icon={Clock3}
                label="Guru tanpa shift terdeteksi"
                value={loading ? "—" : teachersWithoutShift}
                detail="Relasi shift tidak ditemukan pada respons API"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/20">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Gagal memuat data
                  </p>

                  <p className="mt-1 break-words text-sm text-red-700 dark:text-red-300/80">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-4 dark:text-red-300"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            )}

            {/* TABEL GURU */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Data guru dan shift
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Informasi penugasan shift yang berhasil dibaca
                      dari API.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <Search
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                          changeSearch(event.target.value)
                        }
                        placeholder="Cari nama, email, atau NIP..."
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-blue-950 sm:w-72"
                      />
                    </div>

                    <div className="relative">
                      <Filter
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        value={selectedShift}
                        onChange={(event) =>
                          changeShift(event.target.value)
                        }
                        className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-blue-950 sm:w-56"
                      >
                        <option value="semua">Semua shift</option>

                        {shifts.map((shift) => (
                          <option
                            key={shift.id}
                            value={String(shift.id)}
                          >
                            {shift.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                  <LoaderCircle
                    size={28}
                    className="animate-spin text-blue-600"
                  />

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Mengambil data guru dan shift...
                  </p>
                </div>
              ) : error ? (
                <EmptyState
                  title="Data belum dapat ditampilkan"
                  description="Periksa pesan error di atas dan pastikan URL endpoint sesuai dengan route backend."
                />
              ) : paginatedTeachers.length === 0 ? (
                <EmptyState
                  title="Data guru tidak ditemukan"
                  description="Coba ubah kata kunci pencarian atau filter shift yang dipilih."
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
                          {[
                            "Guru",
                            "NIP",
                            "Shift kerja",
                            "Jam shift",
                            "Kehadiran",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                            >
                              {heading}
                            </th>
                          ))}

                          <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Detail
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedTeachers.map((teacher) => (
                          <tr
                            key={teacher.id}
                            className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                  {teacher.nama
                                    .split(" ")
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((word) => word[0])
                                    .join("")
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-xs truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {teacher.nama}
                                  </p>

                                  <p className="mt-1 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                                    {teacher.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                              {teacher.nip}
                            </td>

                            <td className="px-5 py-4">
                              {teacher.shifts.length > 0 ? (
                                <div className="flex max-w-xs flex-wrap gap-2">
                                  {teacher.shifts.map((shift) => (
                                    <span
                                      key={shift.id}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                                    >
                                      <BriefcaseBusiness size={13} />
                                      {shift.nama}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                  Belum terdeteksi
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {teacher.shifts.length > 0 ? (
                                <div className="space-y-1.5">
                                  {teacher.shifts.map((shift) => (
                                    <p
                                      key={shift.id}
                                      className="whitespace-nowrap text-sm text-slate-700 dark:text-slate-300"
                                    >
                                      <Clock3
                                        size={14}
                                        className="mr-1.5 inline"
                                      />
                                      {formatTime(shift.jamMasuk)} –{" "}
                                      {formatTime(shift.jamKeluar)}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  -
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                <AlertCircle size={13} />
                                Belum tersedia
                              </span>

                              <p className="mt-1 text-xs text-slate-400">
                                Rekap tanggal {selectedDate}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedTeacher(teacher)}
                                aria-label={`Lihat detail ${teacher.nama}`}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                              >
                                <Eye size={15} />
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}
                  <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {filteredTeachers.length === 0
                          ? 0
                          : (safePage - 1) * PAGE_SIZE + 1}
                        {"–"}
                        {Math.min(
                          safePage * PAGE_SIZE,
                          filteredTeachers.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {filteredTeachers.length}
                      </span>{" "}
                      guru
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) => Math.max(1, current - 1))
                        }
                        disabled={safePage <= 1}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft size={16} />
                        Sebelumnya
                      </button>

                      <span className="px-2 text-sm text-slate-500 dark:text-slate-400">
                        {safePage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setPage((current) =>
                            Math.min(totalPages, current + 1)
                          )
                        }
                        disabled={safePage >= totalPages}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Berikutnya
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* MODAL DETAIL GURU */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTeacher(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-detail-title"
            className="my-auto max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Detail guru
                </p>

                <h2
                  id="teacher-detail-title"
                  className="mt-2 text-xl font-bold text-slate-900 dark:text-white"
                >
                  {selectedTeacher.nama}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                  {selectedTeacher.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                aria-label="Tutup detail"
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    NIP
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedTeacher.nip}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Tanggal rekap
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Shift kerja
                </h3>

                {selectedTeacher.shifts.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {selectedTeacher.shifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                            <Clock3 size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {shift.nama}
                            </p>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                              {formatTime(shift.jamMasuk)} –{" "}
                              {formatTime(shift.jamKeluar)}
                            </p>

                            {shift.toleransiTerlambatMenit != null && (
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Toleransi keterlambatan:{" "}
                                {shift.toleransiTerlambatMenit} menit
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Relasi shift untuk guru ini tidak ditemukan dalam
                    respons backend.
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  Rekap kehadiran belum tersedia
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-200/80">
                  Data kehadiran guru pada {formatDate(selectedDate)} tidak
                  ditampilkan karena endpoint rekap semua guru belum
                  terkonfirmasi. Jam shift adalah jadwal, bukan jam
                  check-in atau check-out aktual.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="h-10 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
