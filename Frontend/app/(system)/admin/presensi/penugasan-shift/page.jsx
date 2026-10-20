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
  Info,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { getUsers } from "@/services/user.service";
import { getShiftKerja } from "@/services/shiftKerja.service";

const PAGE_SIZE = 10;
const JABATAN_ENDPOINT = "/api/kategori-jabatan";
const CACHE_KEY = "smartschool-penugasan-shift-cache";

function getArray(response, keys = []) {
  let current = response;

  for (let i = 0; i < 6 && current != null; i++) {
    if (Array.isArray(current)) return current;

    if (typeof current !== "object") return [];

    for (const key of keys) {
      if (Array.isArray(current[key])) return current[key];
    }

    if (Array.isArray(current.items)) return current.items;

    if (!("data" in current)) return [];
    current = current.data;
  }

  return Array.isArray(current) ? current : [];
}

function getCache() {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    const parsed = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getId(value) {
  return value == null ? "" : String(value);
}

function getNamaJabatan(value) {
  if (typeof value === "string") return value;

  return (
    value?.nama ??
    value?.namaKategori ??
    value?.namaJabatan ??
    value?.namaKategoriJabatan ??
    ""
  );
}

function getJabatanName(item, jabatanList, cache) {
  const id =
    item?.kategoriJabatanId ??
    item?.kategoriJabatan?.id ??
    cache?.kategoriJabatanId;

  const relation = item?.kategoriJabatan;

  if (typeof relation === "string" && relation.trim()) {
    return relation;
  }

  const relationName = getNamaJabatan(relation);
  if (relationName) return relationName;

  if (!id) return "";

  const found = jabatanList.find((x) => getId(x.id) === getId(id));
  return getNamaJabatan(found);
}

function getShiftForPegawai(item, shiftList, cache) {
  if (!item) return null;

  const masterRelation =
    item.shiftKerjaMaster ??
    (typeof item.shiftKerja === "object" ? item.shiftKerja : null);

  const id = item.shiftKerjaId ?? masterRelation?.id;

  if (id) {
    const found = shiftList.find((x) => getId(x.id) === getId(id));
    if (found) return found;

    if (masterRelation) return masterRelation;
  }

  const cachedId = cache?.shiftKerjaId;

  if (cachedId) {
    const found = shiftList.find((x) => getId(x.id) === getId(cachedId));
    if (found) return found;
  }

  const legacy =
    typeof item.shiftKerja === "string" ? item.shiftKerja.trim() : "";

  if (legacy) {
    const found = shiftList.find((shift) => {
      const nama = String(shift.nama ?? "").trim().toLowerCase();
      const kode = String(shift.kode ?? "").trim().toLowerCase();
      const value = legacy.toLowerCase();

      return nama === value || kode === value;
    });

    if (found) return found;

    return {
      nama: legacy,
      kode: "",
      jamMasuk: null,
      jamKeluar: null,
    };
  }

  return null;
}

function formatJam(value) {
  if (!value) return "-";

  const text = String(value);
  const match = text.match(/^(\d{1,2}):(\d{2})/);

  if (match) {
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

function StatCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    slate:
      "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted",
  };

  return (
    <div className="theme-card rounded-xl border theme-border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-muted">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums theme-text">
            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
          </p>
          {description && (
            <p className="mt-1 text-xs theme-text-muted">{description}</p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone] ?? toneClasses.blue}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function PenugasanShiftPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pegawai, setPegawai] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [cache, setCache] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filterShift, setFilterShift] = useState("semua");
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [usersResponse, shiftsResponse, jabatanResponse] =
        await Promise.all([
          getUsers({ page: 1, limit: 100 }),
          getShiftKerja({
            page: 1,
            limit: 100,
            status: "aktif",
          }),
          apiFetch(JABATAN_ENDPOINT, { method: "GET" }),
        ]);

      const users = getArray(usersResponse, [
        "users",
        "pengguna",
        "pegawai",
      ]).filter((x) => x?.id);

      const shifts = getArray(shiftsResponse, ["shifts", "shiftKerja"]);

      const jabatan = getArray(jabatanResponse, [
        "kategoriJabatan",
        "kategoriJabatans",
        "jabatan",
      ]);

      setPegawai(users);
      setShiftList(shifts);
      setJabatanList(jabatan);
      setCache(getCache());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Data penugasan belum bisa dimuat. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    try {
      const savedNotice = sessionStorage.getItem("penugasan-notice");
      if (savedNotice) {
        setNotice(savedNotice);
        sessionStorage.removeItem("penugasan-notice");
      }
    } catch {}
  }, [loadData]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const enrichedPegawai = useMemo(() => {
    return pegawai.map((item) => {
      const saved = cache[getId(item.id)] ?? {};
      return {
        ...item,
        _shift: getShiftForPegawai(item, shiftList, saved),
        _jabatan: getJabatanName(item, jabatanList, saved),
      };
    });
  }, [pegawai, shiftList, jabatanList, cache]);

  const filteredPegawai = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return enrichedPegawai.filter((item) => {
      const matchSearch =
        !keyword ||
        String(item.namaLengkap ?? "").toLowerCase().includes(keyword) ||
        String(item.email ?? "").toLowerCase().includes(keyword);

      let matchShift = true;

      if (filterShift === "belum") {
        matchShift = !item._shift;
      } else if (filterShift !== "semua") {
        matchShift = getId(item._shift?.id) === getId(filterShift);
      }

      return matchSearch && matchShift;
    });
  }, [enrichedPegawai, search, filterShift]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPegawai.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visiblePegawai = filteredPegawai.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalSudahDitugaskan = enrichedPegawai.filter(
    (item) => Boolean(item._shift)
  ).length;

  const totalBelumDitugaskan = pegawai.length - totalSudahDitugaskan;

  function openAssignment(item) {
    if (!item?.id) {
      setError("ID pegawai tidak ditemukan.");
      return;
    }

    router.push(`/admin/presensi/penugasan-shift/${item.id}`);
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {/* ============================================
                PAGE HEADER
            ============================================ */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl theme-text">
                  Penugasan Shift Pegawai
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 theme-text-secondary">
                  Kelola shift kerja dan kategori jabatan pegawai sekolah.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Muat Ulang
                </button>
              </div>
            </div>

            {/* ============================================
                INFO BANNER
            ============================================ */}
            <div className="mb-6 flex items-start gap-3 rounded-lg border theme-border theme-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <Info size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium theme-text">
                  Atur shift dan jabatan pegawai di sini
                </p>
                <p className="mt-1 text-xs leading-5 theme-text-muted">
                  Klik <strong>"Atur shift"</strong> pada baris pegawai untuk
                  menetapkan atau mengubah shift kerja dan kategori jabatannya.
                </p>
              </div>
            </div>

            {/* ============================================
                ALERTS
            ============================================ */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Permintaan gagal</p>
                  <p className="mt-1 break-words">{error}</p>
                </div>
                <button
                  type="button"
                  aria-label="Tutup pesan error"
                  onClick={() => setError("")}
                  className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <CheckCircle2 size={18} />
                <p className="flex-1">{notice}</p>
                <button
                  type="button"
                  aria-label="Tutup notifikasi"
                  onClick={() => setNotice("")}
                  className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* ============================================
                STAT CARDS
            ============================================ */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Pegawai"
                value={loading ? "—" : pegawai.length}
                description="Pegawai terdaftar di sekolah"
                icon={Users}
                tone="blue"
              />
              <StatCard
                title="Sudah Memiliki Shift"
                value={loading ? "—" : totalSudahDitugaskan}
                description="Pegawai yang sudah di-assign shift"
                icon={CheckCircle2}
                tone="emerald"
              />
              <StatCard
                title="Belum Memiliki Shift"
                value={loading ? "—" : totalBelumDitugaskan}
                description="Perlu ditugaskan shift kerja"
                icon={CalendarClock}
                tone="amber"
              />
            </div>

            {/* ============================================
                TABLE SECTION
            ============================================ */}
            <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
              <div className="border-b theme-border p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold theme-text">
                      Daftar Penugasan
                    </h2>
                    <p className="mt-1 text-sm theme-text-muted">
                      Pilih pegawai untuk menetapkan atau mengubah shift.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 sm:w-64">
                      <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Cari nama atau email..."
                        className="theme-input h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none transition"
                      />
                    </div>

                    <select
                      value={filterShift}
                      onChange={(e) => {
                        setFilterShift(e.target.value);
                        setPage(1);
                      }}
                      className="theme-input h-10 rounded-lg border px-3 text-sm outline-none sm:w-52"
                    >
                      <option value="semua">Semua penugasan</option>
                      <option value="belum">Belum memiliki shift</option>
                      {shiftList.map((shift) => (
                        <option key={shift.id} value={getId(shift.id)}>
                          {shift.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <Users size={14} />
                  <span>
                    {filteredPegawai.length} dari {pegawai.length} pegawai
                    ditampilkan
                  </span>
                </div>
              </div>

              {/* TABLE AREA */}
              <div className="relative">
                {loading ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <LoaderCircle
                      size={28}
                      className="animate-spin theme-primary-text"
                    />
                    <p className="mt-3 text-sm font-medium theme-text">
                      Memuat data penugasan...
                    </p>
                    <p className="mt-1 text-xs theme-text-muted">
                      Mengambil data dari sistem
                    </p>
                  </div>
                ) : error && pegawai.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                      <AlertCircle size={23} />
                    </div>
                    <p className="mt-4 font-semibold theme-text">
                      Data penugasan gagal dimuat
                    </p>
                    <p className="mt-1 max-w-md text-sm theme-text-muted">
                      Periksa koneksi internet Anda, lalu coba muat ulang.
                    </p>
                    <button
                      type="button"
                      onClick={loadData}
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg theme-primary px-3 text-sm font-medium text-white hover:opacity-90"
                    >
                      <RefreshCw size={15} />
                      Muat Ulang
                    </button>
                  </div>
                ) : visiblePegawai.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                      <Users size={23} />
                    </div>
                    <p className="mt-4 font-semibold theme-text">
                      {pegawai.length === 0
                        ? "Belum ada data pegawai"
                        : "Data pegawai tidak ditemukan"}
                    </p>
                    <p className="mt-1 max-w-sm text-sm theme-text-muted">
                      {pegawai.length === 0
                        ? "Pastikan data pegawai sudah terdaftar di sistem."
                        : "Coba ubah kata kunci atau filter penugasan."}
                    </p>
                    {(search || filterShift !== "semua") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setFilterShift("semua");
                          setPage(1);
                        }}
                        className="mt-3 text-sm font-semibold theme-primary-text hover:underline"
                      >
                        Hapus filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left text-sm">
                      <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                        <tr>
                          <th className="w-12 px-4 py-4 text-center font-semibold">
                            No
                          </th>
                          <th className="px-5 py-4 font-semibold">Pegawai</th>
                          <th className="px-5 py-4 font-semibold">
                            Kategori Jabatan
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Shift Kerja
                          </th>
                          <th className="px-5 py-4 font-semibold">Jam Kerja</th>
                          <th className="px-5 py-4 text-right font-semibold">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                        {visiblePegawai.map((item, index) => {
                          const shift = item._shift;

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                            >
                              <td className="px-4 py-4 text-center text-sm tabular-nums theme-text-muted">
                                {(currentPage - 1) * PAGE_SIZE + index + 1}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                                    <UserRound size={19} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="max-w-xs truncate font-semibold theme-text">
                                      {item.namaLengkap || "Tanpa nama"}
                                    </p>
                                    <p className="mt-1 max-w-xs truncate text-xs theme-text-muted">
                                      {item.email || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 theme-text">
                                {item._jabatan || (
                                  <span className="theme-text-muted">
                                    Belum ditentukan
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                {shift ? (
                                  <>
                                    <p className="font-medium theme-text">
                                      {shift.nama || "Shift"}
                                    </p>
                                    {shift.kode && (
                                      <p className="mt-1 text-xs theme-text-muted">
                                        {shift.kode}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                    Belum ditugaskan
                                  </span>
                                )}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                {shift ? (
                                  <span className="inline-flex items-center gap-2 theme-text">
                                    <Clock3 size={15} />
                                    {formatJam(shift.jamMasuk)} –{" "}
                                    {formatJam(shift.jamKeluar)}
                                  </span>
                                ) : (
                                  <span className="theme-text-muted">—</span>
                                )}
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => openAssignment(item)}
                                  className="inline-flex h-9 items-center gap-2 rounded-lg theme-primary px-3 text-sm font-semibold text-white hover:opacity-90 transition"
                                >
                                  <BriefcaseBusiness size={15} />
                                  Atur shift
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              {!loading && filteredPegawai.length > 0 && (
                <div className="flex flex-col gap-3 border-t theme-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-sm theme-text-muted">
                    Menampilkan{" "}
                    {filteredPegawai.length === 0
                      ? 0
                      : (currentPage - 1) * PAGE_SIZE + 1}
                    {"–"}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredPegawai.length
                    )}{" "}
                    dari {filteredPegawai.length} pegawai
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((v) => Math.max(1, v - 1))}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border theme-border px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                      <ChevronLeft size={16} />
                      Sebelumnya
                    </button>

                    <span className="min-w-20 text-center text-sm theme-text">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((v) => Math.min(totalPages, v + 1))
                      }
                      className="inline-flex h-9 items-center gap-1 rounded-lg border theme-border px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                      Berikutnya
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t theme-border px-5 py-3 text-xs theme-text-muted">
                Data pegawai dan shift diambil dari sistem.
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}