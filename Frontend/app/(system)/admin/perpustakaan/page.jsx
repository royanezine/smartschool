"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Library,
  Loader2,
  MonitorPlay,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import {
  getBuku,
  getPeminjaman,
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

const themeSuccessSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]";

const themeWarningSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]";

const themeInfoSoft =
  "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]";

const themeNeutralSoft =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_30px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const dangerSoft =
  "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]";

/* =========================================================
   STATIC NAV MODULES
   Ini bukan data database; hanya shortcut menu.
========================================================= */

const QUICK_MODULES = [
  {
    title: "Buku Digital",
    description:
      "Kelola koleksi buku digital, modul, dan bahan bacaan elektronik.",
    href: "/admin/perpustakaan/buku-digital",
    icon: BookOpen,
    tone: "blue",
  },
  {
    title: "Data Buku Perpustakaan",
    description:
      "Kelola katalog buku fisik, kategori, penulis, dan stok koleksi.",
    href: "/admin/perpustakaan/data-buku",
    icon: Library,
    tone: "violet",
  },
  {
    title: "Peminjaman",
    description:
      "Pantau transaksi peminjaman buku oleh siswa dan warga sekolah.",
    href: "/admin/perpustakaan/pinjam",
    icon: BookOpenCheck,
    tone: "indigo",
  },
  {
    title: "Pengembalian",
    description:
      "Kelola pengembalian buku dan pantau buku yang belum dikembalikan.",
    href: "/admin/perpustakaan/pengembalian",
    icon: RotateCcw,
    tone: "emerald",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function unwrapValue(response) {
  if (response?.data !== undefined) return response.data;
  return response;
}

function toArray(response) {
  const value = unwrapValue(response);

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;

  return [];
}

function asString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getErrorMessage(error, fallback = "Gagal mengambil data perpustakaan dari backend.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error?.message || error?.error || fallback;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return asString(value).slice(0, 10) || "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return asString(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toDateKey(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isToday(value) {
  const dateKey = toDateKey(value);
  const today = toDateKey(new Date());
  return Boolean(dateKey && today && dateKey === today);
}

function isWithinLast7Days(value) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  return date.getTime() >= start.getTime() && date.getTime() <= now.getTime();
}

function normalizeBook(raw) {
  const item = raw || {};

  return {
    ...item,
    id: item?.id ?? item?.bukuId ?? null,
    kodeBuku: item?.kodeBuku ?? item?.kode ?? "-",
    judul: item?.judul ?? item?.title ?? "Tanpa Judul",
    penulis: item?.penulis ?? item?.author ?? "-",
    kategori: item?.kategori ?? item?.category ?? "Lainnya",
    tipe: asString(item?.tipe).toUpperCase(),
    status: asString(item?.status).toLowerCase(),
    jumlah: toNumber(item?.jumlah, 0),
    jumlahTersedia: toNumber(
      item?.jumlahTersedia ?? item?.tersedia ?? item?.jumlah,
      0,
    ),
  };
}

function getBookId(raw) {
  return raw?.bukuId ?? raw?.bookId ?? raw?.buku?.id ?? raw?.buku?.bukuId ?? null;
}

function getBookDetails(raw) {
  return raw?.buku || raw?.book || raw?.bukuDetail || {};
}

function getUserDetails(raw) {
  return (
    raw?.pengguna ||
    raw?.user ||
    raw?.peminjam ||
    raw?.siswa ||
    raw?.anggota ||
    {}
  );
}

function normalizeLoan(raw) {
  const item = raw || {};
  const buku = getBookDetails(item);
  const pengguna = getUserDetails(item);

  const tanggalPinjam =
    item?.tanggalPinjam ||
    item?.tanggalPeminjaman ||
    item?.createdAt ||
    item?.created_at ||
    null;

  const jatuhTempo =
    item?.jatuhTempo ||
    item?.tanggalJatuhTempo ||
    item?.dueDate ||
    item?.tanggalHarusKembali ||
    null;

  const tanggalKembali =
    item?.tanggalKembali ||
    item?.returnedAt ||
    item?.tanggalPengembalian ||
    null;

  const rawStatus = asString(item?.status).trim().toLowerCase();

  let status = "Dipinjam";

  if (
    rawStatus === "dikembalikan" ||
    rawStatus === "returned" ||
    rawStatus === "kembali" ||
    rawStatus === "selesai"
  ) {
    status = "Dikembalikan";
  } else if (
    rawStatus === "terlambat" ||
    rawStatus === "overdue" ||
    rawStatus === "late"
  ) {
    status = "Terlambat";
  } else if (tanggalKembali) {
    status = "Dikembalikan";
  } else if (jatuhTempo) {
    const due = new Date(jatuhTempo);
    if (!Number.isNaN(due.getTime())) {
      const dueEnd = new Date(due);
      dueEnd.setHours(23, 59, 59, 999);
      if (dueEnd.getTime() < Date.now()) status = "Terlambat";
    }
  }

  const nama =
    pengguna?.nama ||
    pengguna?.namaLengkap ||
    pengguna?.name ||
    item?.namaSiswa ||
    item?.siswaNama ||
    "Pengguna";

  const nis =
    pengguna?.nis ||
    pengguna?.nomorInduk ||
    pengguna?.nisn ||
    item?.nis ||
    item?.nomorInduk ||
    "-";

  const kelas =
    pengguna?.kelas?.nama ||
    pengguna?.kelas?.namaKelas ||
    pengguna?.kelas?.kode ||
    pengguna?.namaKelas ||
    pengguna?.kelasNama ||
    item?.kelas?.nama ||
    item?.kelas ||
    "-";

  const bukuId = getBookId(item);

  const bookTitle =
    buku?.judul ||
    buku?.title ||
    item?.judulBuku ||
    item?.namaBuku ||
    "Buku";

  const kodeBuku =
    buku?.kodeBuku ||
    buku?.kode ||
    item?.kodeBuku ||
    "-";

  const activityDate = tanggalKembali || tanggalPinjam || item?.updatedAt || item?.updated_at || null;

  return {
    ...item,
    id: item?.id ?? item?.peminjamanId ?? null,
    bukuId,
    penggunaId: item?.penggunaId ?? pengguna?.id ?? pengguna?.penggunaId ?? null,
    siswa: nama,
    nis,
    kelas,
    buku: bookTitle,
    kodeBuku,
    tanggalPinjam,
    jatuhTempo,
    tanggalKembali,
    status,
    denda: toNumber(item?.denda ?? item?.fine, 0),
    kode:
      item?.kode ||
      item?.kodePeminjaman ||
      item?.nomorPeminjaman ||
      item?.noPeminjaman ||
      null,
    petugas:
      item?.petugas?.nama ||
      item?.petugas?.namaLengkap ||
      item?.petugas ||
      item?.admin?.nama ||
      "-",
    activityDate,
  };
}

function initials(name) {
  const value = asString(name, "P").trim();
  if (!value) return "P";

  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/* =========================================================
   THEME TONE MAP
========================================================= */

const toneMap = {
  blue: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    iconText: "text-[var(--color-primary)]",
    border: "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]",
    bar: "var(--color-primary)",
  },

  violet: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
    iconText: "text-[var(--color-info)]",
    border: "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--color-info)_6%,transparent)]",
    bar: "var(--color-info)",
  },

  indigo: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]",
    iconText: "text-[var(--color-primary)]",
    border: "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]",
    bar: "var(--color-primary)",
  },

  emerald: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    iconText: "text-[var(--color-success)]",
    border: "border-[color-mix(in_srgb,var(--color-success)_22%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)]",
    bar: "var(--color-success)",
  },

  amber: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
    iconText: "text-[var(--color-warning)]",
    border: "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--color-warning)_7%,transparent)]",
    bar: "var(--color-warning)",
  },
};

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({ label, value, description, icon: Icon, tone = "blue", href }) {
  const theme = toneMap[tone] || toneMap.blue;

  const content = (
    <div
      className={`group relative overflow-hidden rounded-2xl border theme-border ${themeCardShadow} ${themeCardHoverShadow} theme-card p-5 transition-all duration-300 hover:-translate-y-0.5`}
    >
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${theme.iconBg} transition-transform duration-500 group-hover:scale-150`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="theme-text-secondary text-sm font-medium">{label}</p>
          <p className="theme-text mt-2 text-3xl font-bold tracking-tight">{value}</p>
          <p className="theme-text-muted mt-1.5 text-xs">{description}</p>

          {href && (
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
              Lihat detail
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionHeader({ eyebrow, title, description, href, action = "Lihat semua" }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        )}

        <h2 className="theme-text text-lg font-bold tracking-tight">{title}</h2>

        {description && (
          <p className="theme-text-muted mt-1 text-sm">{description}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-80"
        >
          {action}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function PerpustakaanPage() {
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);

  const [activePeriod, setActivePeriod] = useState("Minggu ini");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const [bookResponse, loanResponse] = await Promise.all([
        getBuku(),
        getPeminjaman(),
      ]);

      const nextBooks = toArray(bookResponse).map(normalizeBook);
      const nextLoans = toArray(loanResponse).map(normalizeLoan);

      setBooks(nextBooks);
      setLoans(nextLoans);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const physicalBooks = useMemo(
    () => books.filter((book) => book.tipe !== "EBOOK"),
    [books],
  );

  const digitalBooks = useMemo(
    () => books.filter((book) => book.tipe === "EBOOK"),
    [books],
  );

  const activeLoans = useMemo(
    () =>
      loans.filter(
        (loan) => loan.status === "Dipinjam" || loan.status === "Terlambat",
      ),
    [loans],
  );

  const totalBooks = books.length;
  const totalPhysicalCopies = useMemo(
    () => physicalBooks.reduce((sum, book) => sum + book.jumlah, 0),
    [physicalBooks],
  );
  const totalAvailableCopies = useMemo(
    () => physicalBooks.reduce((sum, book) => sum + book.jumlahTersedia, 0),
    [physicalBooks],
  );
  const totalBorrowedCopies = Math.max(0, totalPhysicalCopies - totalAvailableCopies);

  const dueSoonCount = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return activeLoans.filter((loan) => {
      if (!loan.jatuhTempo) return false;
      const due = new Date(loan.jatuhTempo);
      if (Number.isNaN(due.getTime())) return false;
      due.setHours(23, 59, 59, 999);
      return due.getTime() <= today.getTime();
    }).length;
  }, [activeLoans]);

  const totalBorrowedHistory = loans.length;

  const popularBooks = useMemo(() => {
    const byBook = new Map();

    loans.forEach((loan) => {
      const bookId = loan.bukuId;
      const key = bookId || loan.kodeBuku || loan.buku;
      if (!key) return;

      const current = byBook.get(key) || {
        borrowed: 0,
        bookId,
        title: loan.buku,
        code: loan.kodeBuku,
      };

      current.borrowed += 1;
      if (loan.buku && current.title === "Buku") current.title = loan.buku;
      byBook.set(key, current);
    });

    const result = Array.from(byBook.values()).map((item) => {
      const book = books.find(
        (candidate) =>
          (item.bookId && candidate.id === item.bookId) ||
          candidate.kodeBuku === item.code,
      );

      return {
        title: book?.judul || item.title || "Tanpa Judul",
        author: book?.penulis || "-",
        category: book?.kategori || "Lainnya",
        borrowed: item.borrowed,
        available: book ? book.jumlahTersedia : 0,
      };
    });

    return result
      .sort((a, b) => b.borrowed - a.borrowed)
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        tone: ["blue", "emerald", "violet", "amber", "indigo"][index % 5],
      }));
  }, [books, loans]);

  const categoryData = useMemo(() => {
    const counts = new Map();

    books.forEach((book) => {
      const category = asString(book.kategori, "Lainnya").trim() || "Lainnya";
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    const total = books.length;

    return Array.from(counts.entries())
      .map(([label, value]) => ({
        label,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        tone: ["blue", "violet", "emerald", "indigo", "amber"][index % 5],
      }));
  }, [books]);

  const recentTransactions = useMemo(() => {
    let data = [...loans];

    if (activePeriod === "Hari ini") {
      data = data.filter((item) => isToday(item.activityDate));
    } else {
      data = data.filter((item) => isWithinLast7Days(item.activityDate));
    }

    return data
      .sort((a, b) => {
        const aTime = new Date(a.activityDate || 0).getTime();
        const bTime = new Date(b.activityDate || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 5)
      .map((item) => ({
        ...item,
        type: item.status === "Dikembalikan" ? "Pengembalian" : "Peminjaman",
        activityLabel: item.status === "Dikembalikan" ? "Selesai" : item.status,
      }));
  }, [activePeriod, loans]);

  const activityData = useMemo(() => {
    return loans
      .slice()
      .sort((a, b) => {
        const aTime = new Date(a.activityDate || 0).getTime();
        const bTime = new Date(b.activityDate || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 4)
      .map((loan, index) => {
        const returned = loan.status === "Dikembalikan";

        return {
          title: returned ? "Pengembalian selesai" : "Peminjaman tercatat",
          detail: returned
            ? `${loan.siswa} mengembalikan ${loan.buku}.`
            : `${loan.siswa} meminjam ${loan.buku}.`,
          time: formatDateTime(loan.activityDate),
          icon: returned ? RotateCcw : BookOpenCheck,
          tone: returned ? "emerald" : index % 2 === 0 ? "blue" : "violet",
        };
      });
  }, [loans]);

  return (
    <div className="theme-page flex h-screen min-h-0 overflow-hidden">
      <Sidebar role="admin" active="perpustakaan" setActive={() => {}} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {/* HERO */}
            <section
              className={`relative mb-6 overflow-hidden rounded-[28px] border ${themePrimaryBorder} ${themePrimaryShadow} bg-[color-mix(in_srgb,var(--color-primary)_12%,var(--color-card))]`}
            >
              <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] blur-3xl" />
              <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] blur-3xl" />

              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(color-mix(in srgb, var(--color-text) 35%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-text) 35%, transparent) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_390px] lg:px-10 lg:py-9">
                <div className="flex flex-col justify-center">
                  <div
                    className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full border ${themePrimaryBorder} ${themePrimarySoft} px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] backdrop-blur-md`}
                  >
                    <Sparkles size={13} />
                    Literasi · Perpustakaan Digital
                  </div>

                  <h1 className="theme-text max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-[38px] lg:leading-tight">
                    Perpustakaan Sekolah
                  </h1>

                  <p className="theme-text-secondary mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]">
                    Kelola koleksi buku, perpustakaan digital, peminjaman,
                    pengembalian, dan aktivitas literasi siswa dalam satu
                    dashboard.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/perpustakaan/data-buku"
                      className={`inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white ${themePrimaryShadow} transition hover:brightness-110`}
                    >
                      <Library size={17} />
                      Kelola Koleksi
                    </Link>

                    <Link
                      href="/admin/perpustakaan/pinjam"
                      className={`inline-flex items-center gap-2 rounded-xl border ${themePrimaryBorder} ${themePrimarySoft} px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] backdrop-blur-md transition ${themePrimarySoftHover}`}
                    >
                      <BookOpenCheck size={17} />
                      Peminjaman
                    </Link>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border ${themePrimaryBorder} ${themePrimarySoft} p-5 backdrop-blur-md`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="theme-text-muted text-xs font-medium">
                        Kondisi Perpustakaan
                      </p>

                      <p className="theme-text mt-1 text-lg font-bold">
                        {loading ? "Memuat data..." : "Data tersinkron dengan backend"}
                      </p>

                      <p className="theme-text-muted mt-1 text-xs">
                        {loading ? "Mengambil data katalog dan transaksi" : "Update dari API perpustakaan"}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        error ? dangerSoft : themeSuccessSoft
                      } ${error ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}
                    >
                      {error ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ["Koleksi", totalBooks],
                      ["Digital", digitalBooks.length],
                      ["Dipinjam", activeLoans.length],
                      ["Tersedia", totalAvailableCopies],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className={`rounded-xl border theme-border-soft ${themeNeutralSoft} p-3.5`}
                      >
                        <p className="theme-text-muted text-[11px]">{label}</p>
                        <p className="theme-text mt-1 text-xl font-bold">
                          {loading ? "—" : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border theme-border bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 shrink-0 text-[var(--color-warning)]" size={18} />
                  <div>
                    <p className="theme-text text-sm font-semibold">Data perpustakaan belum berhasil dimuat</p>
                    <p className="theme-text-muted mt-1 text-xs leading-5">{error}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadDashboard(true)}
                  disabled={refreshing}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Coba lagi
                </button>
              </div>
            )}

            {/* QUICK MODULES */}
            <section className="mb-7">
              <SectionHeader
                eyebrow="PERPUSTAKAAN"
                title="Modul utama"
                description="Akses cepat untuk pengelolaan perpustakaan sekolah."
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {QUICK_MODULES.map((item) => {
                  const Icon = item.icon;
                  const theme = toneMap[item.tone];

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={`group relative overflow-hidden rounded-2xl border theme-border ${themeCardShadow} ${themeCardHoverShadow} theme-card p-5 transition-all duration-300 hover:-translate-y-1`}
                    >
                      <div
                        className={`absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full ${theme.soft} transition-transform duration-500 group-hover:scale-150`}
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                          >
                            <Icon size={21} strokeWidth={1.8} />
                          </div>

                          <ArrowUpRight
                            size={17}
                            className="theme-text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                          />
                        </div>

                        <h3 className="theme-text mt-5 text-[15px] font-bold">{item.title}</h3>
                        <p className="theme-text-muted mt-1.5 min-h-[40px] text-xs leading-5">{item.description}</p>

                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
                          Buka modul
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* STATISTICS */}
            <section className="mb-7">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => loadDashboard(true)}
                  disabled={loading || refreshing}
                  className="theme-card theme-border theme-text-secondary inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Refresh data
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Koleksi"
                  value={loading ? "—" : totalBooks}
                  description={`${totalPhysicalCopies} eksemplar buku fisik`}
                  icon={Library}
                  tone="blue"
                  href="/admin/perpustakaan/data-buku"
                />

                <StatCard
                  label="Buku Digital"
                  value={loading ? "—" : digitalBooks.length}
                  description="Koleksi E-Book dalam katalog"
                  icon={MonitorPlay}
                  tone="violet"
                  href="/admin/perpustakaan/buku-digital"
                />

                <StatCard
                  label="Sedang Dipinjam"
                  value={loading ? "—" : activeLoans.length}
                  description="Transaksi aktif saat ini"
                  icon={BookOpenCheck}
                  tone="indigo"
                  href="/admin/perpustakaan/pinjam"
                />

                <StatCard
                  label="Jatuh Tempo"
                  value={loading ? "—" : dueSoonCount}
                  description="Jatuh tempo hari ini atau sudah lewat"
                  icon={Clock3}
                  tone="amber"
                  href="/admin/perpustakaan/pinjam"
                />
              </div>
            </section>

            {/* OVERVIEW */}
            <section className="mb-7 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
              {/* POPULAR BOOK */}
              <div className={`theme-card rounded-2xl border theme-border ${themeCardShadow}`}>
                <div className="flex flex-col gap-4 border-b theme-border-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Koleksi populer</p>
                    <h2 className="theme-text mt-1 text-lg font-bold">Buku paling banyak dipinjam</h2>
                    <p className="theme-text-muted mt-1 text-sm">Diurutkan dari histori transaksi yang diterima backend.</p>
                  </div>

                  <div className={`rounded-xl ${themePrimarySoft} px-3 py-2 text-xs font-semibold text-[var(--color-primary)]`}>
                    {loading ? "—" : `${totalBorrowedHistory} transaksi`}
                  </div>
                </div>

                <div className="divide-y divide-[var(--color-border-soft)]">
                  {popularBooks.length > 0 ? (
                    popularBooks.map((book, index) => {
                      const theme = toneMap[book.tone];

                      return (
                        <div
                          key={`${book.title}-${book.code}-${index}`}
                          className={`group flex items-center gap-4 px-5 py-4 transition ${themePrimarySoftHover} sm:px-6`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border theme-border-soft ${themeNeutralSoft} theme-text-muted text-xs font-bold`}>
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}>
                            <BookOpen size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text truncate text-sm font-semibold">{book.title}</p>
                            <p className="theme-text-muted mt-1 text-xs">{book.author} · {book.category}</p>
                          </div>

                          <div className="hidden min-w-[100px] sm:block">
                            <p className="theme-text-muted text-[11px]">Dipinjam</p>
                            <p className="theme-text mt-1 text-sm font-bold">{book.borrowed} kali</p>
                          </div>

                          <div className="hidden min-w-[75px] sm:block">
                            <p className="theme-text-muted text-[11px]">Tersedia</p>
                            <p className="mt-1 text-sm font-bold text-[var(--color-success)]">{book.available}</p>
                          </div>

                          <ChevronRight
                            size={16}
                            className="theme-text-muted shrink-0 transition group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-5 py-12 text-center sm:px-6">
                      <BookOpen size={20} className="theme-text-muted mx-auto" />
                      <p className="theme-text-secondary mt-3 text-sm font-semibold">Belum ada histori peminjaman</p>
                      <p className="theme-text-muted mt-1 text-xs">Data populer akan muncul setelah transaksi tersedia.</p>
                    </div>
                  )}
                </div>

                <div className="border-t theme-border-soft px-5 py-4 sm:px-6">
                  <Link href="/admin/perpustakaan/data-buku" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
                    Lihat seluruh katalog
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* CATEGORY */}
              <div className={`theme-card rounded-2xl border theme-border ${themeCardShadow} p-5 sm:p-6`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Koleksi</p>
                    <h2 className="theme-text mt-1 text-lg font-bold">Kategori buku</h2>
                    <p className="theme-text-muted mt-1 text-sm">Distribusi judul buku berdasarkan kategori dari backend.</p>
                  </div>

                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}>
                    <BarChart3 size={19} />
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {categoryData.length > 0 ? (
                    categoryData.map((item) => {
                      const theme = toneMap[item.tone];

                      return (
                        <div key={item.label}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.bar }} />
                              <span className="theme-text-secondary text-xs font-medium">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="theme-text text-xs font-bold">{item.value}</span>
                              <span className="theme-text-muted text-[10px]">({item.percentage}%)</span>
                            </div>
                          </div>

                          <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${themeNeutralSoft}`}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${item.percentage}%`, backgroundColor: theme.bar }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border theme-border-soft p-4 text-center">
                      <p className="theme-text-secondary text-sm font-semibold">Belum ada kategori</p>
                      <p className="theme-text-muted mt-1 text-xs">Kategori akan terbentuk otomatis dari data buku.</p>
                    </div>
                  )}
                </div>

                <div className={`mt-6 rounded-xl border theme-border-soft ${themeNeutralSoft} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg border theme-border-soft theme-card text-[var(--color-primary)] ${themeCardShadow}`}>
                      <Library size={17} />
                    </div>

                    <div>
                      <p className="theme-text text-xs font-semibold">Total koleksi</p>
                      <p className="theme-text-muted mt-0.5 text-[11px]">
                        {loading ? "Memuat..." : `${totalBooks} judul terdaftar dalam katalog.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* TRANSACTION + ACTIVITY */}
            <section className="mb-7 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
              <div className={`theme-card rounded-2xl border theme-border ${themeCardShadow}`}>
                <div className="flex flex-col gap-4 border-b theme-border-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">Transaksi terbaru</p>
                    <p className="theme-text-muted mt-1 text-xs">Aktivitas peminjaman dan pengembalian dari backend.</p>
                  </div>

                  <div className={`flex items-center gap-1 rounded-xl border theme-border-soft ${themeNeutralSoft} p-1`}>
                    {["Hari ini", "Minggu ini"].map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setActivePeriod(period)}
                        className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                          activePeriod === period
                            ? `${themePrimarySoft} text-[var(--color-primary)] ${themeCardShadow}`
                            : "theme-text-muted hover:text-[var(--color-primary)]"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-[var(--color-border-soft)]">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((item, index) => (
                      <div
                        key={`${item.id || item.kode || "loan"}-${item.siswa}-${index}`}
                        className={`flex items-center gap-3 px-5 py-4 transition ${themePrimarySoftHover} sm:px-6`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${themePrimarySoft} text-xs font-bold text-[var(--color-primary)]`}>
                          {initials(item.siswa)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="theme-text text-sm font-semibold">{item.siswa}</p>

                            {item.kelas !== "-" && (
                              <span className={`rounded-md border theme-border-soft ${themeNeutralSoft} theme-text-muted px-1.5 py-0.5 text-[9px] font-semibold`}>
                                {item.kelas}
                              </span>
                            )}
                          </div>

                          <p className="theme-text-muted mt-1 truncate text-xs">{item.buku}</p>
                          <p className="theme-text-muted mt-1 text-[10px]">{formatDateTime(item.activityDate)}</p>
                        </div>

                        <div className="hidden text-right sm:block">
                          <p className={`text-[10px] font-bold ${item.type === "Peminjaman" ? "text-[var(--color-primary)]" : "text-[var(--color-success)]"}`}>
                            {item.type}
                          </p>

                          <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${
                            item.status === "Dikembalikan"
                              ? `${themeSuccessSoft} text-[var(--color-success)]`
                              : item.status === "Terlambat"
                                ? `${themeWarningSoft} text-[var(--color-warning)]`
                                : `${themePrimarySoft} text-[var(--color-primary)]`
                          }`}>
                            {item.activityLabel}
                          </span>
                        </div>

                        <button
                          type="button"
                          title="Buka peminjaman"
                          onClick={() => {
                            window.location.href = "/admin/perpustakaan/pinjam";
                          }}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-text-muted transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-12 text-center sm:px-6">
                      <Clock3 size={20} className="theme-text-muted mx-auto" />
                      <p className="theme-text-secondary mt-3 text-sm font-semibold">Belum ada transaksi pada periode ini</p>
                      <p className="theme-text-muted mt-1 text-xs">Coba pilih periode lain atau lakukan refresh data.</p>
                    </div>
                  )}
                </div>

                <div className="border-t theme-border-soft px-5 py-4 sm:px-6">
                  <Link href="/admin/perpustakaan/pinjam" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
                    Lihat seluruh transaksi
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              <div className={`theme-card rounded-2xl border theme-border ${themeCardShadow}`}>
                <div className="flex items-center justify-between border-b theme-border-soft px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">Aktivitas perpustakaan</p>
                    <p className="theme-text-muted mt-1 text-xs">Ringkasan aktivitas terbaru dari transaksi.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadDashboard(true)}
                    disabled={refreshing}
                    title="Refresh aktivitas"
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeNeutralSoft} theme-text-muted transition ${themePrimarySoftHover} hover:text-[var(--color-primary)] disabled:opacity-60`}
                  >
                    {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  {activityData.length > 0 ? (
                    <div className="relative">
                      <div className="absolute bottom-5 left-[17px] top-5 w-px bg-[var(--color-border-soft)]" />

                      <div className="space-y-5">
                        {activityData.map((item) => {
                          const Icon = item.icon;
                          const theme = toneMap[item.tone];

                          return (
                            <div key={`${item.title}-${item.time}`} className="relative flex gap-3">
                              <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border theme-border-soft ${theme.iconBg} ${theme.iconText} ring-4 ring-[var(--color-card)]`}>
                                <Icon size={16} />
                              </div>

                              <div className="min-w-0 flex-1 pt-0.5">
                                <p className="theme-text text-xs font-semibold leading-5">{item.title}</p>
                                <p className="theme-text-muted mt-0.5 text-[11px] leading-5">{item.detail}</p>
                                <p className="theme-text-muted mt-1 text-[10px]">{item.time}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <TrendingUp size={20} className="theme-text-muted mx-auto" />
                      <p className="theme-text-secondary mt-3 text-sm font-semibold">Belum ada aktivitas</p>
                      <p className="theme-text-muted mt-1 text-xs">Aktivitas akan terbentuk dari transaksi perpustakaan.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* QUICK ACTION */}
            <section className="mb-7">
              <div className={`relative overflow-hidden rounded-2xl border ${themePrimaryBorder} ${themePrimarySoft} p-5 sm:p-6`}>
                <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] blur-2xl" />

                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}>
                        <Library size={18} />
                      </div>
                      <p className="theme-text text-sm font-bold">Kelola perpustakaan dengan lebih mudah</p>
                    </div>

                    <p className="theme-text-muted mt-2 max-w-2xl text-xs leading-5">
                      Tambahkan koleksi baru, proses peminjaman, atau pantau pengembalian buku dari akses cepat berikut.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/admin/perpustakaan/data-buku/tambah"
                      className={`inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white ${themePrimaryShadow} transition hover:brightness-110`}
                    >
                      <Plus size={15} />
                      Tambah Buku
                    </Link>

                    <Link
                      href="/admin/perpustakaan/pinjam"
                      className={`inline-flex items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-xs font-semibold theme-text-secondary transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
                    >
                      <BookOpenCheck size={15} />
                      Peminjaman
                    </Link>

                    <Link
                      href="/admin/perpustakaan/buku-digital"
                      className={`inline-flex items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-xs font-semibold theme-text-secondary transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
                    >
                      <MonitorPlay size={15} />
                      Buku Digital
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <div className="flex flex-col gap-3 border-t theme-border-soft py-5 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} />
                <span>SmartSchool · Perpustakaan Digital</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[var(--color-success)]" />
                  Sistem aktif
                </span>

                <span>
                  Tahun Ajaran 2026/2027
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
