"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  BookOpen,
  Search,
  Plus,
  Eye,
  X,
  RefreshCw,
  ChevronDown,
  Library,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserRound,
  Loader2,
} from "lucide-react";

import {
  getPeminjaman,
  kembalikanBuku,
} from "@/services/perpustakaan.service";

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";
const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";
const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";
const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";
const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

/* =========================================================
   HELPERS
========================================================= */

function unwrapValue(response) {
  if (response?.data !== undefined) return response.data;
  return response;
}

function toArray(value) {
  const first = unwrapValue(value);
  if (Array.isArray(first)) return first;
  if (Array.isArray(first?.data)) return first.data;
  if (Array.isArray(first?.rows)) return first.rows;
  return [];
}

function asString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function formatDate(value) {
  if (!value) return "-";
  const raw = asString(value);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 10) || raw;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRupiah(value) {
  const numeric = Number(value) || 0;
  return `Rp ${numeric.toLocaleString("id-ID")}`;
}

function normalizeStatus(value, loan) {
  const raw = asString(value).trim().toLowerCase();
  if (["dikembalikan", "returned", "kembali", "selesai"].includes(raw))
    return "Dikembalikan";
  if (["terlambat", "overdue", "late"].includes(raw)) return "Terlambat";
  if (["dipinjam", "borrowed", "aktif"].includes(raw)) return "Dipinjam";

  const due = loan?.jatuhTempo;
  if (due && !loan?.tanggalKembali) {
    const dueDate = new Date(due);
    if (!Number.isNaN(dueDate.getTime())) {
      const dueEnd = new Date(dueDate);
      dueEnd.setHours(23, 59, 59, 999);
      if (dueEnd.getTime() < Date.now()) return "Terlambat";
    }
  }
  return loan?.tanggalKembali ? "Dikembalikan" : "Dipinjam";
}

function normalizeLoan(item) {
  const raw = item || {};
  const buku = raw?.buku || raw?.book || raw?.bukuDetail || {};
  const pengguna =
    raw?.pengguna ||
    raw?.user ||
    raw?.peminjam ||
    raw?.siswa ||
    raw?.anggota ||
    {};

  const kelas =
    pengguna?.kelas?.nama ||
    pengguna?.kelas?.namaKelas ||
    pengguna?.kelas?.kode ||
    pengguna?.namaKelas ||
    pengguna?.kelasNama ||
    raw?.kelas?.nama ||
    raw?.kelas ||
    "-";

  const tanggalPinjam =
    raw?.tanggalPinjam ||
    raw?.tanggalPeminjaman ||
    raw?.createdAt ||
    raw?.created_at ||
    null;
  const jatuhTempo =
    raw?.jatuhTempo ||
    raw?.tanggalJatuhTempo ||
    raw?.dueDate ||
    raw?.tanggalHarusKembali ||
    null;
  const tanggalKembali =
    raw?.tanggalKembali ||
    raw?.returnedAt ||
    raw?.tanggalPengembalian ||
    null;

  return {
    id: raw?.id ?? raw?.peminjamanId ?? null,
    kode:
      raw?.kode ||
      raw?.kodePeminjaman ||
      raw?.nomorPeminjaman ||
      raw?.noPeminjaman ||
      "-",
    penggunaId:
      raw?.penggunaId ||
      pengguna?.id ||
      pengguna?.penggunaId ||
      "",
    siswa:
      pengguna?.nama ||
      pengguna?.namaLengkap ||
      pengguna?.name ||
      raw?.namaSiswa ||
      raw?.siswaNama ||
      "-",
    nis:
      pengguna?.nis ||
      pengguna?.nomorInduk ||
      pengguna?.nisn ||
      raw?.nis ||
      raw?.nomorInduk ||
      "-",
    kelas,
    bukuId: raw?.bukuId || buku?.id || buku?.bukuId || "",
    buku:
      buku?.judul ||
      buku?.title ||
      raw?.judulBuku ||
      raw?.namaBuku ||
      "-",
    kodeBuku: buku?.kodeBuku || buku?.kode || raw?.kodeBuku || "-",
    tanggalPinjam,
    jatuhTempo,
    tanggalKembali,
    status: normalizeStatus(raw?.status, { jatuhTempo, tanggalKembali }),
    denda: Number(raw?.denda ?? raw?.fine ?? 0) || 0,
    petugas:
      raw?.petugas?.nama ||
      raw?.petugas?.namaLengkap ||
      raw?.petugas ||
      raw?.admin?.nama ||
      "-",
    raw,
  };
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error?.message || error?.error || fallback;
}

/* =========================================================
   BADGES
========================================================= */

function StatusBadge({ status }) {
  if (status === "Dipinjam") {
    return (
      <span className="theme-primary-soft inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-xs font-medium">
        <Clock3 size={13} />
        Dipinjam
      </span>
    );
  }
  if (status === "Terlambat") {
    return (
      <span className="theme-danger inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-xs font-medium">
        <AlertTriangle size={13} />
        Terlambat
      </span>
    );
  }
  return (
    <span className="theme-success inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-xs font-medium">
      <CheckCircle2 size={13} />
      Dikembalikan
    </span>
  );
}

function StatCard({ icon: Icon, label, value, tone = "primary" }) {
  const toneMap = {
    primary: "theme-primary-soft",
    warning: "theme-warning",
    danger: "theme-danger",
    success: "theme-success",
  };
  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            toneMap[tone] || toneMap.primary
          }`}
        >
          <Icon size={19} />
        </div>
        <div>
          <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="theme-text mt-1 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RETURN CONFIRMATION — tetap modal
========================================================= */

function ReturnModal({ loan, onClose, onConfirm, saving }) {
  if (!loan) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="theme-card w-full max-w-md rounded-2xl border theme-border p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="theme-danger flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
            <RotateCcw size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="theme-text text-lg font-bold">
              Kembalikan buku?
            </h2>
            <p className="theme-text-secondary mt-1.5 text-sm leading-6">
              Transaksi untuk{" "}
              <span className="theme-text font-semibold">{loan.siswa}</span>{" "}
              dengan buku{" "}
              <span className="theme-text font-semibold">{loan.buku}</span>{" "}
              akan diproses sebagai pengembalian melalui backend.
            </p>
          </div>
        </div>

        <div className="theme-success mt-5 rounded-xl border theme-border p-4">
          <p className="text-xs leading-5">
            Backend akan menangani perubahan stok dan data pengembalian.
            Tidak ada perubahan stok secara manual dari frontend.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition hover:theme-card-soft disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="theme-primary h-10 rounded-lg px-5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Memproses..." : "Ya, Kembalikan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PeminjamanPage() {
  const router = useRouter();

  const [loans, setLoans] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [classFilter, setClassFilter] = useState("Semua");

  const [returnLoan, setReturnLoan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const loanResponse = await getPeminjaman();
      setLoans(toArray(loanResponse).map(normalizeLoan));
    } catch (err) {
      setError(
        getErrorMessage(err, "Gagal mengambil data peminjaman dari backend.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classOptions = useMemo(() => {
    const values = loans
      .map((loan) => loan.kelas)
      .filter((value) => value && value !== "-");
    return Array.from(new Set(values)).sort((a, b) =>
      a.localeCompare(b, "id-ID", { numeric: true })
    );
  }, [loans]);

  const filteredLoans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const matchSearch =
        !query ||
        asString(loan.kode).toLowerCase().includes(query) ||
        asString(loan.id).toLowerCase().includes(query) ||
        asString(loan.siswa).toLowerCase().includes(query) ||
        asString(loan.nis).toLowerCase().includes(query) ||
        asString(loan.penggunaId).toLowerCase().includes(query) ||
        asString(loan.buku).toLowerCase().includes(query) ||
        asString(loan.kodeBuku).toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "Semua" || loan.status === statusFilter;

      const matchClass =
        classFilter === "Semua" || loan.kelas === classFilter;

      return matchSearch && matchStatus && matchClass;
    });
  }, [loans, search, statusFilter, classFilter]);

  const totalPeminjaman = loans.length;
  const sedangDipinjam = loans.filter((l) => l.status === "Dipinjam").length;
  const terlambat = loans.filter((l) => l.status === "Terlambat").length;
  const dikembalikan = loans.filter(
    (l) => l.status === "Dikembalikan"
  ).length;

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("Semua");
    setClassFilter("Semua");
  };

  const confirmReturn = async () => {
    if (!returnLoan?.id) return;

    setSaving(true);
    setError("");

    try {
      await kembalikanBuku(String(returnLoan.id));
      setReturnLoan(null);
      await loadData(true);
    } catch (err) {
      setError(
        getErrorMessage(err, "Gagal memproses pengembalian buku.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
            {/* HEADER */}
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="theme-primary flex h-12 w-12 items-center justify-center rounded-xl">
                  <BookOpen size={23} />
                </div>
                <div>
                  <h1 className="theme-text text-[25px] font-bold tracking-tight">
                    Peminjaman Buku
                  </h1>
                  <p className="theme-text-secondary mt-0.5 text-sm">
                    Kelola transaksi peminjaman dan pengembalian buku
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={loading || refreshing}
                  className="theme-card theme-border theme-text-secondary flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition hover:theme-card-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/perpustakaan/peminjaman/pinjam")
                  }
                  disabled={loading}
                  className="theme-primary flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={17} />
                  Pinjam Buku
                </button>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Terjadi kesalahan</p>
                  <p className="mt-1 break-words text-xs leading-5">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition hover:opacity-70"
                  aria-label="Tutup pesan error"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* STATISTIK */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Library}
                label="Total Transaksi"
                value={totalPeminjaman}
                tone="primary"
              />
              <StatCard
                icon={Clock3}
                label="Sedang Dipinjam"
                value={sedangDipinjam}
                tone="warning"
              />
              <StatCard
                icon={AlertTriangle}
                label="Terlambat"
                value={terlambat}
                tone="danger"
              />
              <StatCard
                icon={CheckCircle2}
                label="Dikembalikan"
                value={dikembalikan}
                tone="success"
              />
            </div>

            {/* FILTER */}
            <div className="theme-card mt-5 rounded-xl border theme-border p-4 shadow-sm">
              <div className="relative">
                <Search
                  size={18}
                  className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari siswa, NIS, ID pengguna, judul, atau kode buku..."
                  className={`theme-input theme-border theme-text ${themeFocus} h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)]`}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:flex">
                <div className="relative xl:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`theme-input theme-border theme-text ${themeFocus} h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none`}
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Dikembalikan">Dikembalikan</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <div className="relative xl:w-48">
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className={`theme-input theme-border theme-text ${themeFocus} h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none`}
                  >
                    <option value="Semua">Semua Kelas</option>
                    {classOptions.map((kelas) => (
                      <option key={kelas} value={kelas}>
                        {kelas}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <button
                  type="button"
                  onClick={resetFilter}
                  className={`h-10 rounded-lg px-3 text-left text-sm font-medium theme-primary-text ${themePrimaryHover} transition xl:text-center`}
                >
                  Reset Filter
                </button>

                <div className="flex items-center xl:ml-auto">
                  <span className="theme-text-muted text-sm">
                    {filteredLoans.length} transaksi ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="theme-card mt-5 overflow-hidden rounded-xl border theme-border shadow-sm">
              <div className="flex flex-col gap-1 border-b theme-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="theme-text text-sm font-bold">
                    Daftar Peminjaman
                  </h2>
                  <p className="theme-text-muted mt-0.5 text-xs">
                    Riwayat transaksi peminjaman buku dari backend
                  </p>
                </div>
                <div className="theme-text-secondary flex items-center gap-2 text-xs">
                  <Library size={14} />
                  {filteredLoans.length} transaksi
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] text-left">
                  <thead>
                    <tr className="border-b theme-border theme-card-soft">
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Peminjam
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Buku
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Tanggal Pinjam
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Jatuh Tempo
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Kembali
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Status
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Denda
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-border)]">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center">
                          <div className="theme-text-muted inline-flex items-center gap-2 text-sm">
                            <Loader2 size={18} className="animate-spin" />
                            Mengambil data peminjaman...
                          </div>
                        </td>
                      </tr>
                    ) : filteredLoans.length > 0 ? (
                      filteredLoans.map((loan) => (
                        <tr
                          key={String(loan.id)}
                          className="transition hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="theme-primary-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                                <UserRound size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="theme-text truncate text-sm font-semibold">
                                  {loan.siswa}
                                </p>
                                <p className="theme-text-muted mt-0.5 text-xs">
                                  {loan.nis} • Kelas {loan.kelas}
                                </p>
                                <p className="mt-0.5 break-all text-[11px] font-medium theme-primary-text">
                                  {loan.penggunaId ||
                                    loan.kode ||
                                    `ID ${asString(loan.id).slice(0, 8)}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="theme-card-soft theme-border theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                                <BookOpen size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="theme-text-secondary max-w-[250px] truncate text-sm font-medium">
                                  {loan.buku}
                                </p>
                                <p className="theme-text-muted mt-0.5 text-[11px]">
                                  {loan.kodeBuku}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="theme-text-secondary text-xs">
                              {formatDate(loan.tanggalPinjam)}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`text-xs font-medium ${
                                loan.status === "Terlambat"
                                  ? "theme-danger"
                                  : "theme-text-secondary"
                              }`}
                            >
                              {formatDate(loan.jatuhTempo)}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span className="theme-text-muted text-xs">
                              {formatDate(loan.tanggalKembali)}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge status={loan.status} />
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`text-xs font-semibold ${
                                loan.denda > 0
                                  ? "theme-danger"
                                  : "theme-text-muted"
                              }`}
                            >
                              {formatRupiah(loan.denda)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Detail"
                                onClick={() =>
                                  router.push(
                                    `/admin/perpustakaan/peminjaman/${loan.id}`
                                  )
                                }
                                className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                              >
                                <Eye size={16} />
                              </button>

                              {loan.status !== "Dikembalikan" && loan.id && (
                                <button
                                  type="button"
                                  title="Kembalikan Buku"
                                  onClick={() => setReturnLoan(loan)}
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition hover:theme-success"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center">
                          <div className="theme-card-soft theme-border theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full border">
                            <Search size={20} />
                          </div>
                          <p className="theme-text-secondary mt-3 text-sm font-semibold">
                            Data peminjaman tidak ditemukan
                          </p>
                          <p className="theme-text-muted mt-1 text-xs">
                            Coba ubah kata kunci atau filter.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t theme-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-muted text-xs">
                  Menampilkan{" "}
                  <span className="theme-text-secondary font-medium">
                    {filteredLoans.length}
                  </span>{" "}
                  dari{" "}
                  <span className="theme-text-secondary font-medium">
                    {loans.length}
                  </span>{" "}
                  transaksi
                </p>
                <p className="theme-text-muted text-xs">
                  Terlambat:{" "}
                  <span className="theme-danger font-medium">{terlambat}</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* KONFIRMASI PENGEMBALIAN — tetap modal */}
      <ReturnModal
        loan={returnLoan}
        onClose={() => {
          if (!saving) setReturnLoan(null);
        }}
        onConfirm={confirmReturn}
        saving={saving}
      />
    </div>
  );
}