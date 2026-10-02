"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Library,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  getPeminjaman,
  kembalikanBuku,
} from "@/services/perpustakaan.service";

/* =========================================================
   THEME HELPERS
========================================================= */

const themeCardShadow =
  "shadow-[0_8px_30px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_18px_45px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeSuccessSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]";

const themeWarningSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]";

const themeDangerSoft =
  "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]";

/* =========================================================
   HELPERS
========================================================= */

function unwrapValue(response) {
  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
}

function toArray(response) {
  const data = unwrapValue(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.list)) {
    return data.list;
  }

  return [];
}

function asString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function getErrorMessage(error, fallback) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
}

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem("user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getUserId(user) {
  if (!user) {
    return "";
  }

  const id =
    user?.userId ||
    user?.id ||
    user?.penggunaId ||
    user?.siswaId ||
    user?.siswa?.id ||
    user?.data?.userId ||
    user?.data?.id ||
    user?.data?.penggunaId ||
    user?.data?.siswaId ||
    user?.data?.siswa?.id ||
    "";

  return id ? String(id) : "";
}

function getUsername(user) {
  if (!user) {
    return "Siswa";
  }

  const name =
    user?.nama ||
    user?.namaLengkap ||
    user?.name ||
    user?.username ||
    user?.fullName ||
    user?.full_name ||
    user?.siswa?.nama ||
    user?.siswa?.namaLengkap ||
    user?.data?.nama ||
    user?.data?.namaLengkap ||
    user?.data?.name ||
    "";

  return typeof name === "string" && name.trim()
    ? name.trim()
    : "Siswa";
}

function getDateValue(value) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime();
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const raw = asString(value);
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw.slice(0, 10) || raw;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const raw = asString(value);
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeStatus(value, loan) {
  const raw = asString(value).trim().toLowerCase();

  if (
    raw === "dikembalikan" ||
    raw === "returned" ||
    raw === "kembali" ||
    raw === "selesai"
  ) {
    return "Dikembalikan";
  }

  if (
    raw === "terlambat" ||
    raw === "overdue" ||
    raw === "late"
  ) {
    return "Terlambat";
  }

  if (
    raw === "dipinjam" ||
    raw === "borrowed" ||
    raw === "aktif"
  ) {
    return "Dipinjam";
  }

  if (loan?.tanggalKembali) {
    return "Dikembalikan";
  }

  if (loan?.tanggalJatuhTempo) {
    const due = getDateValue(loan.tanggalJatuhTempo);

    if (due) {
      const dueDate = new Date(due);
      dueDate.setHours(23, 59, 59, 999);

      if (dueDate.getTime() < Date.now()) {
        return "Terlambat";
      }
    }
  }

  return "Dipinjam";
}

function isOverdue(loan) {
  if (!loan) {
    return false;
  }

  if (loan.tanggalKembali) {
    return false;
  }

  if (loan.status === "Dikembalikan") {
    return false;
  }

  const due = getDateValue(loan.tanggalJatuhTempo);

  if (!due) {
    return false;
  }

  const dueDate = new Date(due);
  dueDate.setHours(23, 59, 59, 999);

  return dueDate.getTime() < Date.now();
}

function normalizeLoan(item) {
  const raw = item || {};

  const buku =
    raw?.buku ||
    raw?.book ||
    raw?.bukuDetail ||
    {};

  const pengguna =
    raw?.pengguna ||
    raw?.user ||
    raw?.peminjam ||
    raw?.siswa ||
    raw?.anggota ||
    {};

  const tanggalPinjam =
    raw?.tanggalPinjam ||
    raw?.tanggalPeminjaman ||
    raw?.createdAt ||
    raw?.created_at ||
    null;

  const tanggalJatuhTempo =
    raw?.tanggalJatuhTempo ||
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
    ...raw,

    id:
      raw?.id ||
      raw?.peminjamanId ||
      "",

    nomorPeminjaman:
      raw?.nomorPeminjaman ||
      raw?.nomor ||
      "-",

    bukuId:
      raw?.bukuId ||
      buku?.id ||
      buku?.bukuId ||
      "",

    penggunaId:
      raw?.penggunaId ||
      pengguna?.id ||
      pengguna?.penggunaId ||
      "",

    tanggalPinjam,

    tanggalJatuhTempo,

    tanggalKembali,

    catatan:
      raw?.catatan ||
      "",

    status: normalizeStatus(
      raw?.status,
      {
        tanggalKembali,
        tanggalJatuhTempo,
      },
    ),

    buku: {
      id:
        buku?.id ||
        buku?.bukuId ||
        raw?.bukuId ||
        "",

      kodeBuku:
        buku?.kodeBuku ||
        buku?.kode ||
        raw?.kodeBuku ||
        "-",

      judul:
        buku?.judul ||
        buku?.title ||
        raw?.judulBuku ||
        raw?.namaBuku ||
        "Tanpa Judul",

      tipe:
        asString(
          buku?.tipe ||
            raw?.tipe ||
            "FISIK",
        ).toUpperCase(),

      coverUrl:
        buku?.coverUrl ||
        raw?.coverUrl ||
        "",

      penulis:
        buku?.penulis ||
        buku?.author ||
        raw?.penulis ||
        "-",
    },

    pengguna: {
      id:
        pengguna?.id ||
        pengguna?.penggunaId ||
        raw?.penggunaId ||
        "",

      namaLengkap:
        pengguna?.namaLengkap ||
        pengguna?.nama ||
        pengguna?.name ||
        "-",

      email:
        pengguna?.email ||
        "-",

      nisn:
        pengguna?.nisn ||
        pengguna?.nomorInduk ||
        pengguna?.nis ||
        "-",
    },
  };
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ loan }) {
  const status = loan.status;

  if (status === "Dikembalikan") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${themeSuccessSoft} border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] px-3 py-1.5 text-[10px] font-semibold text-[var(--color-success)]`}
      >
        <CheckCircle2 size={12} />
        Dikembalikan
      </span>
    );
  }

  if (status === "Terlambat") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${themeDangerSoft} border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] px-3 py-1.5 text-[10px] font-semibold text-[var(--color-danger)]`}
      >
        <Clock3 size={12} />
        Terlambat
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${themePrimaryBorder} ${themePrimarySoft} px-3 py-1.5 text-[10px] font-semibold text-[var(--color-primary)]`}
    >
      <BookOpenCheck size={12} />
      Dipinjam
    </span>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function DetailModal({
  loan,
  onClose,
}) {
  if (!loan) {
    return null;
  }

  const overdue = isOverdue(loan);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div
        className={`theme-card theme-border max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${themeCardShadow}`}
      >
        <div
          className={`theme-card sticky top-0 z-10 flex items-center justify-between border-b ${themeDivider} px-5 py-4`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
              Detail peminjaman
            </p>

            <h2 className="theme-text mt-1 text-lg font-bold">
              {loan.buku.judul}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
          >
            <XCircle size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[130px_1fr]">
            <div
              className={`flex min-h-[170px] items-center justify-center overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themePrimarySoft}`}
            >
              {loan.buku.coverUrl ? (
                <img
                  src={loan.buku.coverUrl}
                  alt={`Cover ${loan.buku.judul}`}
                  className="h-full max-h-[190px] w-full object-cover"
                />
              ) : (
                <BookOpen
                  size={44}
                  className="text-[var(--color-primary)]"
                />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md border ${themePrimaryBorder} ${themePrimarySoft} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]`}
                >
                  {loan.buku.kodeBuku}
                </span>

                <span className="theme-card theme-border-soft theme-text-secondary rounded-md border px-2.5 py-1 text-[10px] font-semibold">
                  {loan.buku.tipe === "EBOOK"
                    ? "E-Book"
                    : "Buku Fisik"}
                </span>

                <StatusBadge loan={loan} />
              </div>

              <h3 className="theme-text mt-3 text-xl font-bold">
                {loan.buku.judul}
              </h3>

              <p className="theme-text-secondary mt-1 text-sm">
                {loan.buku.penulis}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[10px]">
                    Nomor peminjaman
                  </p>

                  <p className="theme-text mt-1 break-all text-xs font-semibold">
                    {loan.nomorPeminjaman}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[10px]">
                    Tanggal pinjam
                  </p>

                  <p className="theme-text mt-1 text-xs font-semibold">
                    {formatDateTime(
                      loan.tanggalPinjam,
                    )}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[10px]">
                    Jatuh tempo
                  </p>

                  <p
                    className={`mt-1 text-xs font-semibold ${
                      overdue
                        ? "text-[var(--color-danger)]"
                        : "theme-text"
                    }`}
                  >
                    {formatDate(
                      loan.tanggalJatuhTempo,
                    )}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[10px]">
                    Tanggal kembali
                  </p>

                  <p className="theme-text mt-1 text-xs font-semibold">
                    {loan.tanggalKembali
                      ? formatDateTime(
                          loan.tanggalKembali,
                        )
                      : "Belum dikembalikan"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loan.catatan && (
            <div
              className={`mt-5 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
            >
              <p className="theme-text text-xs font-semibold">
                Catatan
              </p>

              <p className="theme-text-secondary mt-1.5 text-xs leading-6">
                {loan.catatan}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`theme-card theme-border theme-text-secondary flex h-10 items-center justify-center rounded-lg border px-5 text-sm font-medium transition ${themePrimarySoftHover}`}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PeminjamanSiswaPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  const [loans, setLoans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [returningId, setReturningId] =
    useState("");

  const [selectedLoan, setSelectedLoan] =
    useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState("Semua");

  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
  }, []);

  const userId = useMemo(
    () => getUserId(user),
    [user],
  );

  const username = useMemo(
    () => getUsername(user),
    [user],
  );

  const loadData = async (showRefresh = false) => {
    if (!userId) {
      setLoading(false);
      setError(
        "ID siswa tidak ditemukan dari akun yang sedang login.",
      );
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getPeminjaman({
        penggunaId: userId,
      });

      const normalized = toArray(response).map(
        normalizeLoan,
      );

      setLoans(normalized);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Gagal mengambil data peminjaman dari server.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const token = getToken();

    if (!token) {
      setLoading(false);
      setError(
        "Token login tidak ditemukan. Silakan login kembali.",
      );
      return;
    }

    if (!userId) {
      setLoading(false);
      setError(
        "ID siswa tidak ditemukan dari akun yang sedang login.",
      );
      return;
    }

    loadData();
  }, [mounted, userId]);

  const activeLoans = useMemo(
    () =>
      loans.filter(
        (loan) =>
          !loan.tanggalKembali &&
          loan.status !== "Dikembalikan",
      ),
    [loans],
  );

  const returnedLoans = useMemo(
    () =>
      loans.filter(
        (loan) =>
          loan.tanggalKembali ||
          loan.status === "Dikembalikan",
      ),
    [loans],
  );

  const overdueLoans = useMemo(
    () =>
      activeLoans.filter((loan) =>
        isOverdue(loan),
      ),
    [activeLoans],
  );

  const filteredLoans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return loans
      .filter((loan) => {
        const matchesSearch =
          !query ||
          loan.buku.judul
            .toLowerCase()
            .includes(query) ||
          loan.buku.kodeBuku
            .toLowerCase()
            .includes(query) ||
          loan.nomorPeminjaman
            .toLowerCase()
            .includes(query);

        let matchesStatus = true;

        if (filterStatus === "Dipinjam") {
          matchesStatus =
            loan.status === "Dipinjam";
        }

        if (filterStatus === "Terlambat") {
          matchesStatus =
            loan.status === "Terlambat";
        }

        if (filterStatus === "Dikembalikan") {
          matchesStatus =
            loan.status === "Dikembalikan";
        }

        return (
          matchesSearch &&
          matchesStatus
        );
      })
      .sort(
        (a, b) =>
          getDateValue(
            b.tanggalPinjam,
          ) -
          getDateValue(
            a.tanggalPinjam,
          ),
      );
  }, [loans, search, filterStatus]);

  const handleReturn = async (loan) => {
    if (!loan?.id) {
      setError(
        "ID transaksi peminjaman tidak ditemukan.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin mengembalikan buku "${loan.buku.judul}"?`,
    );

    if (!confirmed) {
      return;
    }

    setReturningId(String(loan.id));
    setError("");

    try {
      await kembalikanBuku(
        String(loan.id),
      );

      setSelectedLoan(null);

      await loadData(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Gagal memproses pengembalian buku.",
        ),
      );
    } finally {
      setReturningId("");
    }
  };

  return (
    <div className="theme-page min-h-full w-full">
      <div
        className={`mx-auto w-full max-w-[1500px] space-y-6 p-4 transition-all duration-700 sm:p-6 lg:p-8 ${
          mounted
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <section
          className={`relative overflow-hidden rounded-[28px] border ${themePrimaryBorder} ${themeCardShadow} bg-[color-mix(in_srgb,var(--color-primary)_10%,var(--color-card))]`}
        >
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] blur-3xl" />

          <div className="absolute -bottom-36 left-[35%] h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] blur-3xl" />

          <div className="relative px-5 py-7 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
            <Link
              href="/siswa/perpustakaan"
              className={`inline-flex items-center gap-2 rounded-lg border ${themePrimaryBorder} ${themePrimarySoft} px-3 py-2 text-xs font-semibold text-[var(--color-primary)] transition ${themePrimarySoftHover}`}
            >
              <ArrowLeft size={14} />
              Kembali ke Perpustakaan
            </Link>

            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div
                  className={`mb-3 inline-flex items-center gap-2 rounded-full border ${themePrimaryBorder} ${themePrimarySoft} px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]`}
                >
                  <BookOpenCheck size={13} />
                  Peminjaman Siswa
                </div>

                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl lg:text-[36px]">
                  Peminjaman Saya
                </h1>

                <p className="theme-text-secondary mt-2 max-w-2xl text-sm leading-6">
                  Hai, {username}. Di halaman ini kamu
                  dapat melihat seluruh transaksi peminjaman
                  buku milik akunmu yang diambil langsung dari
                  backend perpustakaan.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadData(true)
                }
                disabled={
                  loading || refreshing
                }
                className={`theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${themePrimarySoftHover} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh Data
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            className={`flex items-start gap-3 rounded-xl border ${themeDangerSoft} border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] p-4`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeDangerSoft} text-[var(--color-danger)]`}
            >
              <XCircle size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-danger)]">
                Terjadi masalah
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-danger)]">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadData(true)
              }
              disabled={
                loading || refreshing
              }
              className={`shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] ${themeDangerSoft} px-3 py-2 text-xs font-semibold text-[var(--color-danger)] transition hover:brightness-95 disabled:opacity-60`}
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div
            className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} ${themeCardHoverShadow} p-5`}
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${themePrimarySoft}`}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="theme-text-secondary text-sm font-medium">
                  Total Transaksi
                </p>

                <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
                  {loans.length}
                </p>

                <p className="theme-text-muted mt-1.5 text-xs">
                  Seluruh riwayat peminjaman
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <Library size={20} />
              </div>
            </div>
          </div>

          <div
            className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} ${themeCardHoverShadow} p-5`}
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${themePrimarySoft}`}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="theme-text-secondary text-sm font-medium">
                  Sedang Dipinjam
                </p>

                <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
                  {activeLoans.length}
                </p>

                <p className="theme-text-muted mt-1.5 text-xs">
                  Buku yang belum dikembalikan
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <BookOpenCheck size={20} />
              </div>
            </div>
          </div>

          <div
            className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} ${themeCardHoverShadow} p-5`}
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${themeWarningSoft}`}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="theme-text-secondary text-sm font-medium">
                  Terlambat
                </p>

                <p className="mt-2 text-3xl font-bold text-[var(--color-warning)]">
                  {overdueLoans.length}
                </p>

                <p className="theme-text-muted mt-1.5 text-xs">
                  Melewati tanggal jatuh tempo
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeWarningSoft} text-[var(--color-warning)]`}
              >
                <CalendarClock size={20} />
              </div>
            </div>
          </div>

          <div
            className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} ${themeCardHoverShadow} p-5`}
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${themeSuccessSoft}`}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="theme-text-secondary text-sm font-medium">
                  Dikembalikan
                </p>

                <p className="mt-2 text-3xl font-bold text-[var(--color-success)]">
                  {returnedLoans.length}
                </p>

                <p className="theme-text-muted mt-1.5 text-xs">
                  Transaksi yang sudah selesai
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeSuccessSoft} text-[var(--color-success)]`}
              >
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TRANSACTIONS
        ====================================================== */}

        <section
          className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div
            className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Data dari backend
                </p>

                <h2 className="theme-text mt-1 text-lg font-bold">
                  Riwayat Peminjaman
                </h2>

                <p className="theme-text-muted mt-1 text-sm">
                  Menampilkan transaksi yang terkait dengan akun
                  siswa yang sedang login.
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-xl ${themePrimarySoft} px-3 py-2 text-xs font-semibold text-[var(--color-primary)]`}
              >
                <UserRound size={14} />
                {username}
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Cari judul buku, kode, atau nomor peminjaman..."
                  className="theme-input theme-border theme-text h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] placeholder:text-[var(--color-text-placeholder)]"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(
                    event.target.value,
                  )
                }
                className="theme-input theme-border theme-text h-11 rounded-lg border px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
              >
                <option value="Semua">
                  Semua Status
                </option>

                <option value="Dipinjam">
                  Dipinjam
                </option>

                <option value="Terlambat">
                  Terlambat
                </option>

                <option value="Dikembalikan">
                  Dikembalikan
                </option>
              </select>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="theme-text-muted text-xs">
                {filteredLoans.length} transaksi ditemukan
              </p>

              {(search ||
                filterStatus !== "Semua") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilterStatus("Semua");
                  }}
                  className="text-xs font-semibold text-[var(--color-primary)] transition hover:opacity-80"
                >
                  Reset filter
                </button>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                </div>

                <p className="theme-text mt-4 text-sm font-semibold">
                  Memuat peminjaman...
                </p>

                <p className="theme-text-muted mt-1 text-xs">
                  Mengambil data transaksi dari server.
                </p>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div
                className={`flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-5 text-center`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <BookOpen size={21} />
                </div>

                <p className="theme-text mt-4 text-sm font-semibold">
                  Tidak ada transaksi
                </p>

                <p className="theme-text-muted mt-1 max-w-md text-xs leading-5">
                  Belum ada data peminjaman yang sesuai dengan
                  pencarian atau filter yang dipilih.
                </p>

                <Link
                  href="/siswa/perpustakaan"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
                >
                  Lihat katalog buku
                  <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLoans.map(
                  (loan) => {
                    const overdue =
                      isOverdue(loan);

                    const isReturned =
                      loan.status ===
                        "Dikembalikan" ||
                      Boolean(
                        loan.tanggalKembali,
                      );

                    return (
                      <div
                        key={String(
                          loan.id,
                        )}
                        className={`group rounded-2xl border p-4 transition-all duration-300 ${
                          overdue
                            ? "border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_4%,transparent)]"
                            : themeNeutralBorder
                        } ${themeCardHoverShadow}`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                              overdue
                                ? themeDangerSoft
                                : isReturned
                                  ? themeSuccessSoft
                                  : themePrimarySoft
                            }`}
                          >
                            {loan.buku
                              .coverUrl ? (
                              <img
                                src={
                                  loan.buku
                                    .coverUrl
                                }
                                alt={`Cover ${loan.buku.judul}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen
                                size={23}
                                className={
                                  overdue
                                    ? "text-[var(--color-danger)]"
                                    : isReturned
                                      ? "text-[var(--color-success)]"
                                      : "text-[var(--color-primary)]"
                                }
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="theme-text text-sm font-bold">
                                {loan.buku.judul}
                              </h3>

                              <StatusBadge
                                loan={
                                  loan
                                }
                              />
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <p className="theme-text-muted text-xs">
                                {loan.buku.kodeBuku}
                              </p>

                              <span className="theme-text-muted text-[10px]">
                                •
                              </span>

                              <p className="theme-text-muted text-xs">
                                {loan.nomorPeminjaman}
                              </p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <div>
                                <p className="theme-text-muted text-[10px]">
                                  Dipinjam
                                </p>

                                <p className="theme-text mt-1 text-xs font-semibold">
                                  {formatDate(
                                    loan.tanggalPinjam,
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="theme-text-muted text-[10px]">
                                  Jatuh Tempo
                                </p>

                                <p
                                  className={`mt-1 text-xs font-semibold ${
                                    overdue
                                      ? "text-[var(--color-danger)]"
                                      : "theme-text"
                                  }`}
                                >
                                  {formatDate(
                                    loan.tanggalJatuhTempo,
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="theme-text-muted text-[10px]">
                                  Dikembalikan
                                </p>

                                <p className="theme-text mt-1 text-xs font-semibold">
                                  {loan.tanggalKembali
                                    ? formatDate(
                                        loan.tanggalKembali,
                                      )
                                    : "-"}
                                </p>
                              </div>

                              <div>
                                <p className="theme-text-muted text-[10px]">
                                  Tipe
                                </p>

                                <p className="theme-text mt-1 text-xs font-semibold">
                                  {loan.buku.tipe ===
                                  "EBOOK"
                                    ? "E-Book"
                                    : "Fisik"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-row items-center gap-2 lg:flex-col lg:items-stretch">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedLoan(
                                  loan,
                                )
                              }
                              className={`theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
                            >
                              Detail
                            </button>

                            {!isReturned && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleReturn(
                                    loan,
                                  )
                                }
                                disabled={
                                  returningId ===
                                  String(
                                    loan.id,
                                  )
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {returningId ===
                                String(
                                  loan.id,
                                ) ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <RotateCcw
                                    size={14}
                                  />
                                )}

                                {returningId ===
                                String(
                                  loan.id,
                                )
                                  ? "Memproses..."
                                  : "Kembalikan"}
                              </button>
                            )}
                          </div>
                        </div>

                        {overdue && (
                          <div
                            className={`mt-4 flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_20%,transparent)] ${themeWarningSoft} px-3 py-2.5`}
                          >
                            <CalendarClock
                              size={15}
                              className="shrink-0 text-[var(--color-warning)]"
                            />

                            <p className="text-[11px] font-medium text-[var(--color-warning)]">
                              Buku ini sudah melewati tanggal
                              jatuh tempo.
                            </p>
                          </div>
                        )}

                        {loan.tanggalKembali && (
                          <div
                            className={`mt-4 flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_20%,transparent)] ${themeSuccessSoft} px-3 py-2.5`}
                          >
                            <CheckCircle2
                              size={15}
                              className="shrink-0 text-[var(--color-success)]"
                            />

                            <p className="text-[11px] font-medium text-[var(--color-success)]">
                              Buku telah dikembalikan pada{" "}
                              {formatDateTime(
                                loan.tanggalKembali,
                              )}
                              .
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            INFO
        ====================================================== */}

        <section className="grid gap-5 lg:grid-cols-3">
          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <BookOpenCheck size={18} />
              </div>

              <div>
                <p className="theme-text text-sm font-bold">
                  Sedang dipinjam
                </p>

                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Data diambil berdasarkan pengguna yang sedang
                  login sehingga transaksi siswa lain tidak
                  ditampilkan.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeWarningSoft} text-[var(--color-warning)]`}
              >
                <CalendarClock size={18} />
              </div>

              <div>
                <p className="theme-text text-sm font-bold">
                  Jatuh tempo
                </p>

                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Perhatikan tanggal jatuh tempo pada setiap
                  transaksi peminjaman.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeSuccessSoft} text-[var(--color-success)]`}
              >
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="theme-text text-sm font-bold">
                  Pengembalian
                </p>

                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Tombol Kembalikan memanggil endpoint pengembalian
                  pada backend perpustakaan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div
          className={`flex flex-col gap-3 border-t ${themeDivider} py-5 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="flex items-center gap-2">
            <Library size={15} />

            <span>
              SmartSchool · Peminjaman Siswa
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2
                size={13}
                className="text-[var(--color-success)]"
              />
              Terhubung dengan server
            </span>

            <span>
              {loans.length} transaksi
            </span>
          </div>
        </div>
      </div>

      <DetailModal
        loan={selectedLoan}
        onClose={() =>
          setSelectedLoan(null)
        }
      />
    </div>
  );
}