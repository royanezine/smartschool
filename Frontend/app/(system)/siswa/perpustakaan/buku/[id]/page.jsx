"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Hash,
  Library,
  Loader2,
  MonitorPlay,
  RotateCcw,
  Sparkles,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  getBukuById,
  getPeminjaman,
  pinjamBuku,
  kembalikanBuku,
} from "../../../../services/perpustakaan.service";

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
    month: "long",
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

function getDateValue(value) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}

function normalizeBook(item) {
  const raw = item || {};

  return {
    ...raw,
    id:
      raw?.id ??
      raw?.bukuId ??
      "",
    kodeBuku:
      raw?.kodeBuku ??
      raw?.kode ??
      "-",
    judul:
      raw?.judul ??
      raw?.title ??
      "Tanpa Judul",
    penulis:
      raw?.penulis ??
      raw?.author ??
      "-",
    penerbit:
      raw?.penerbit ??
      "",
    tahunTerbit:
      raw?.tahunTerbit ??
      "",
    isbn:
      raw?.isbn ??
      "",
    tipe:
      asString(
        raw?.tipe || "FISIK",
      ).toUpperCase(),
    kategori:
      raw?.kategori ??
      "Umum",
    deskripsi:
      raw?.deskripsi ??
      "",
    coverUrl:
      raw?.coverUrl ??
      "",
    urlEbook:
      raw?.urlEbook ??
      "",
    jumlah:
      Number(
        raw?.jumlah ?? 0,
      ) || 0,
    jumlahTersedia:
      Number(
        raw?.jumlahTersedia ??
          raw?.tersedia ??
          raw?.jumlah ??
          0,
      ) || 0,
    status:
      asString(
        raw?.status || "aktif",
      ).toLowerCase(),
    dibuatPada:
      raw?.dibuatPada ??
      raw?.createdAt ??
      raw?.created_at ??
      null,
    diperbaruiPada:
      raw?.diperbaruiPada ??
      raw?.updatedAt ??
      raw?.updated_at ??
      null,
  };
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

  const rawStatus = asString(
    raw?.status,
  )
    .trim()
    .toLowerCase();

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
  } else if (
    rawStatus === "dipinjam" ||
    rawStatus === "borrowed" ||
    rawStatus === "aktif"
  ) {
    status = "Dipinjam";
  } else if (tanggalKembali) {
    status = "Dikembalikan";
  } else if (jatuhTempo) {
    const due = getDateValue(jatuhTempo);

    if (due) {
      const dueDate = new Date(due);
      dueDate.setHours(23, 59, 59, 999);

      if (dueDate.getTime() < Date.now()) {
        status = "Terlambat";
      }
    }
  }

  return {
    ...raw,
    id:
      raw?.id ??
      raw?.peminjamanId ??
      "",
    nomorPeminjaman:
      raw?.nomorPeminjaman ??
      raw?.nomor ??
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
    bukuId:
      raw?.bukuId ||
      buku?.id ||
      buku?.bukuId ||
      "",
    buku:
      buku?.judul ||
      buku?.title ||
      raw?.judulBuku ||
      raw?.namaBuku ||
      "-",
    kodeBuku:
      buku?.kodeBuku ||
      buku?.kode ||
      raw?.kodeBuku ||
      "-",
    tanggalPinjam,
    jatuhTempo,
    tanggalKembali,
    catatan:
      raw?.catatan ??
      "",
    status,
    denda:
      Number(
        raw?.denda ??
          raw?.fine ??
          0,
      ) || 0,
  };
}

function isOverdue(loan) {
  if (!loan) {
    return false;
  }

  if (loan.tanggalKembali) {
    return false;
  }

  if (
    loan.status === "Dikembalikan"
  ) {
    return false;
  }

  const due = getDateValue(
    loan.jatuhTempo,
  );

  if (!due) {
    return false;
  }

  const dueDate = new Date(due);

  dueDate.setHours(
    23,
    59,
    59,
    999,
  );

  return (
    dueDate.getTime() <
    Date.now()
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function LoanStatusBadge({
  loan,
}) {
  if (!loan) {
    return null;
  }

  if (
    loan.status ===
    "Dikembalikan"
  ) {
    return (
      <span className="theme-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold">
        <CheckCircle2 size={12} />
        Dikembalikan
      </span>
    );
  }

  if (
    loan.status ===
    "Terlambat"
  ) {
    return (
      <span className="theme-danger inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold">
        <Clock3 size={12} />
        Terlambat
      </span>
    );
  }

  return (
    <span className="theme-info inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold">
      <BookOpenCheck size={12} />
      Dipinjam
    </span>
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
    <div
      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted text-[10px]">
            {label}
          </p>

          <p className="theme-text mt-1 break-words text-sm font-semibold">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function BukuDetailSiswaPage() {
  const params = useParams();
  const router = useRouter();

  const bukuId = useMemo(() => {
    const value = params?.id;

    if (Array.isArray(value)) {
      return value[0] || "";
    }

    return value
      ? String(value)
      : "";
  }, [params]);

  const [mounted, setMounted] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [book, setBook] =
    useState(null);

  const [myLoans, setMyLoans] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [returning, setReturning] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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

  const activeLoan = useMemo(() => {
    if (!book?.id) {
      return null;
    }

    const bookIdString =
      String(book.id);

    return (
      myLoans.find(
        (loan) =>
          String(
            loan.bukuId || "",
          ) ===
            bookIdString &&
          !loan.tanggalKembali &&
          loan.status !==
            "Dikembalikan",
      ) || null
    );
  }, [book, myLoans]);

  const overdue = useMemo(
    () =>
      activeLoan
        ? isOverdue(activeLoan)
        : false,
    [activeLoan],
  );

  const isEbook =
    book?.tipe === "EBOOK";

  const isAvailable =
    Boolean(
      book &&
        book.status ===
          "aktif" &&
        Number(
          book.jumlahTersedia ||
            0,
        ) > 0,
    );

  const loadData = async (
    showRefresh = false,
  ) => {
    if (!bukuId) {
      setLoading(false);
      setError(
        "ID buku tidak ditemukan.",
      );
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setSuccess("");

    try {
      const bookResponse =
        await getBukuById(
          bukuId,
        );

      const rawBook =
        unwrapValue(
          bookResponse,
        );

      let normalizedBook =
        rawBook;

      if (
        rawBook &&
        typeof rawBook ===
          "object" &&
        rawBook.data &&
        typeof rawBook.data ===
          "object" &&
        !Array.isArray(
          rawBook.data,
        )
      ) {
        normalizedBook =
          rawBook.data;
      }

      if (
        Array.isArray(
          normalizedBook,
        )
      ) {
        normalizedBook =
          normalizedBook[0] ||
          null;
      }

      if (
        !normalizedBook ||
        typeof normalizedBook !==
          "object"
      ) {
        throw new Error(
          "Data buku tidak ditemukan dari server.",
        );
      }

      setBook(
        normalizeBook(
          normalizedBook,
        ),
      );

      if (userId) {
        const loanResponse =
          await getPeminjaman({
            penggunaId:
              userId,
          });

        const normalizedLoans =
          toArray(
            loanResponse,
          ).map(
            normalizeLoan,
          );

        setMyLoans(
          normalizedLoans,
        );
      } else {
        setMyLoans([]);
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Gagal mengambil detail buku dari server.",
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

    const token =
      getToken();

    if (!token) {
      setLoading(false);
      setError(
        "Token login tidak ditemukan. Silakan login kembali.",
      );
      return;
    }

    if (!bukuId) {
      setLoading(false);
      setError(
        "ID buku tidak ditemukan.",
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
  }, [
    mounted,
    bukuId,
    userId,
  ]);

  const handleBorrow =
    async () => {
      if (!book?.id) {
        setError(
          "ID buku tidak ditemukan.",
        );
        return;
      }

      if (!userId) {
        setError(
          "ID siswa tidak ditemukan.",
        );
        return;
      }

      if (isEbook) {
        return;
      }

      if (
        book.status !==
        "aktif"
      ) {
        setError(
          "Buku sedang tidak aktif.",
        );
        return;
      }

      if (
        Number(
          book.jumlahTersedia ||
            0,
        ) <= 0
      ) {
        setError(
          "Stok buku sedang habis.",
        );
        return;
      }

      if (activeLoan) {
        setError(
          "Kamu masih memiliki peminjaman aktif untuk buku ini.",
        );
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {
        await pinjamBuku({
          bukuId: String(
            book.id,
          ),
          penggunaId:
            String(userId),
        });

        setSuccess(
          "Buku berhasil dipinjam. Data peminjaman sudah diperbarui.",
        );

        await loadData(
          true,
        );
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Gagal membuat transaksi peminjaman.",
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  const handleReturn =
    async () => {
      if (!activeLoan?.id) {
        setError(
          "ID transaksi peminjaman tidak ditemukan.",
        );
        return;
      }

      setReturning(true);
      setError("");
      setSuccess("");

      try {
        await kembalikanBuku(
          String(
            activeLoan.id,
          ),
        );

        setSuccess(
          "Buku berhasil dikembalikan.",
        );

        await loadData(
          true,
        );
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Gagal memproses pengembalian buku.",
          ),
        );
      } finally {
        setReturning(false);
      }
    };

  if (loading) {
    return (
      <div className="theme-page min-h-full w-full">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1400px] items-center justify-center p-6">
          <div className="text-center">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
            >
              <Loader2
                size={24}
                className="animate-spin"
              />
            </div>

            <p className="theme-text mt-5 text-sm font-semibold">
              Memuat detail buku...
            </p>

            <p className="theme-text-muted mt-1 text-xs">
              Mengambil data buku dari server.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="theme-page min-h-full w-full">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1000px] items-center justify-center p-6">
          <div
            className={`theme-card w-full max-w-xl rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-6 text-center`}
          >
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${themeDangerSoft} text-[var(--color-danger)]`}
            >
              <XCircle size={26} />
            </div>

            <h1 className="theme-text mt-5 text-lg font-bold">
              Gagal memuat buku
            </h1>

            <p className="theme-text-muted mx-auto mt-2 max-w-md text-sm leading-6">
              {error}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  loadData(
                    true,
                  )
                }
                className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold"
              >
                Coba Lagi
              </button>

              <Link
                href="/siswa/perpustakaan"
                className={`theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center rounded-lg border px-5 text-sm font-medium ${themePrimarySoftHover}`}
              >
                Kembali ke Perpustakaan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="theme-page min-h-full w-full">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* =====================================================
            TOP NAVIGATION
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/siswa/perpustakaan"
            className={`theme-text-secondary inline-flex w-fit items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
          >
            <ArrowLeft size={17} />
            Kembali ke Perpustakaan
          </Link>

          <button
            type="button"
            onClick={() =>
              loadData(true)
            }
            disabled={
              refreshing
            }
            className={`theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${themePrimarySoftHover} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <RotateCcw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="theme-danger flex items-start gap-3 rounded-xl border p-4">
            <XCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Terjadi masalah
              </p>

              <p className="mt-1 text-xs leading-5">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="theme-success flex items-start gap-3 rounded-xl border p-4">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Berhasil
              </p>

              <p className="mt-1 text-xs leading-5">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            BREADCRUMB
        ====================================================== */}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/siswa/perpustakaan"
            className="theme-text-muted transition hover:text-[var(--color-primary)]"
          >
            Perpustakaan
          </Link>

          <ChevronRight
            size={13}
            className="theme-text-muted"
          />

          <span className="theme-text-secondary font-medium">
            Detail Buku
          </span>

          <ChevronRight
            size={13}
            className="theme-text-muted"
          />

          <span className="theme-text truncate font-semibold">
            {book.judul}
          </span>
        </div>

        {/* =====================================================
            MAIN BOOK DETAIL
        ====================================================== */}

        <section
          className={`theme-card overflow-hidden rounded-[28px] border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div
            className={`relative overflow-hidden border-b ${themeDivider} bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-card))]`}
          >
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] blur-3xl" />

            <div className="absolute -bottom-32 left-[30%] h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] blur-3xl" />

            <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[300px_1fr] lg:p-10">
              {/* COVER */}

              <div className="flex justify-center lg:justify-start">
                <div
                  className={`relative flex aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} ${themePrimarySoft}`}
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={`Cover ${book.judul}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      {isEbook ? (
                        <MonitorPlay
                          size={62}
                          className="text-[var(--color-info)]"
                        />
                      ) : (
                        <BookOpen
                          size={62}
                          className="text-[var(--color-primary)]"
                        />
                      )}

                      <p className="theme-text-muted mt-4 text-xs font-medium">
                        Cover belum tersedia
                      </p>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border ${themePrimaryBorder} ${themePrimarySoft} px-3 py-1.5 text-[10px] font-bold text-[var(--color-primary)]`}
                    >
                      {isEbook
                        ? "E-BOOK"
                        : "BUKU FISIK"}
                    </span>

                    {book.status ===
                      "aktif" && (
                      <span className="theme-success rounded-full border px-3 py-1.5 text-[10px] font-bold">
                        Aktif
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* INFORMATION */}

              <div className="flex min-w-0 flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border ${themePrimaryBorder} ${themePrimarySoft} px-2.5 py-1.5 text-[10px] font-bold text-[var(--color-primary)]`}
                  >
                    <Hash size={12} />
                    {book.kodeBuku}
                  </span>

                  <span className="theme-card theme-border-soft theme-text-muted inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold">
                    <Library size={12} />
                    {book.kategori}
                  </span>
                </div>

                <h1 className="theme-text mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-tight">
                  {book.judul}
                </h1>

                <p className="theme-text-secondary mt-3 flex items-center gap-2 text-sm">
                  <UserRound size={16} />
                  {book.penulis ||
                    "Penulis belum tersedia"}
                </p>

                <p className="theme-text-muted mt-4 max-w-3xl text-sm leading-6">
                  {book.deskripsi ||
                    "Tidak ada deskripsi buku yang tersedia."}
                </p>

                {/* ACTION AREA */}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {isEbook ? (
                    book.urlEbook ? (
                      <a
                        href={
                          book.urlEbook
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition hover:brightness-110"
                      >
                        <MonitorPlay
                          size={17}
                        />
                        Baca E-Book
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="theme-card theme-border theme-text-muted inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold opacity-70"
                      >
                        <MonitorPlay
                          size={17}
                        />
                        E-Book Belum Tersedia
                      </button>
                    )
                  ) : activeLoan ? (
                    <button
                      type="button"
                      onClick={
                        handleReturn
                      }
                      disabled={
                        returning
                      }
                      className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {returning ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <RotateCcw
                          size={17}
                        />
                      )}

                      {returning
                        ? "Memproses..."
                        : "Kembalikan Buku"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        handleBorrow
                      }
                      disabled={
                        saving ||
                        !isAvailable ||
                        book.status !==
                          "aktif"
                      }
                      className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <BookOpenCheck
                          size={17}
                        />
                      )}

                      {saving
                        ? "Memproses..."
                        : book.status !==
                            "aktif"
                          ? "Buku Tidak Aktif"
                          : isAvailable
                            ? "Pinjam Buku"
                            : "Stok Habis"}
                    </button>
                  )}

                  <Link
                    href="/siswa/perpustakaan"
                    className={`theme-card theme-border theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${themePrimarySoftHover}`}
                  >
                    <Library
                      size={17}
                    />
                    Lihat Katalog
                  </Link>
                </div>

                {/* ACTIVE LOAN NOTICE */}

                {activeLoan && (
                  <div
                    className={`mt-5 rounded-xl border p-4 ${
                      overdue
                        ? "theme-danger"
                        : "theme-info"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {overdue ? (
                        <CalendarClock
                          size={19}
                          className="mt-0.5 shrink-0"
                        />
                      ) : (
                        <BookOpenCheck
                          size={19}
                          className="mt-0.5 shrink-0"
                        />
                      )}

                      <div className="min-w-0">
                        <p className="text-sm font-bold">
                          {overdue
                            ? "Peminjaman melewati jatuh tempo"
                            : "Buku sedang kamu pinjam"}
                        </p>

                        <p className="mt-1 text-xs leading-5">
                          Dipinjam pada{" "}
                          <strong>
                            {formatDate(
                              activeLoan.tanggalPinjam,
                            )}
                          </strong>
                          {" · "}
                          jatuh tempo{" "}
                          <strong>
                            {formatDate(
                              activeLoan.jatuhTempo,
                            )}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              BOOK INFORMATION
          ====================================================== */}

          <div className="p-5 sm:p-7 lg:p-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoItem
                icon={BookMarked}
                label="Penerbit"
                value={
                  book.penerbit ||
                  "-"
                }
              />

              <InfoItem
                icon={Calendar}
                label="Tahun Terbit"
                value={
                  book.tahunTerbit ||
                  "-"
                }
              />

              <InfoItem
                icon={Hash}
                label="ISBN"
                value={
                  book.isbn ||
                  "-"
                }
              />

              <InfoItem
                icon={BookOpen}
                label={
                  isEbook
                    ? "Akses"
                    : "Stok Tersedia"
                }
                value={
                  isEbook
                    ? "Digital"
                    : `${book.jumlahTersedia} dari ${book.jumlah} eksemplar`
                }
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            LOAN INFORMATION
        ====================================================== */}

        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div
            className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
          >
            <div
              className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <BookOpenCheck
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="theme-text text-lg font-bold">
                    Aktivitas Buku Ini
                  </h2>

                  <p className="theme-text-muted mt-1 text-xs">
                    Riwayat peminjaman buku yang terkait dengan akunmu.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {myLoans.length ===
              0 ? (
                <div
                  className={`rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-5 py-12 text-center`}
                >
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                  >
                    <BookOpen
                      size={21}
                    />
                  </div>

                  <p className="theme-text mt-4 text-sm font-semibold">
                    Belum ada riwayat peminjaman
                  </p>

                  <p className="theme-text-muted mx-auto mt-1 max-w-md text-xs leading-5">
                    Jika kamu meminjam buku ini, transaksi akan muncul
                    di bagian ini setelah berhasil diproses backend.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myLoans
                    .slice()
                    .sort(
                      (a, b) =>
                        getDateValue(
                          b.tanggalPinjam,
                        ) -
                        getDateValue(
                          a.tanggalPinjam,
                        ),
                    )
                    .map(
                      (
                        loan,
                      ) => {
                        const loanOverdue =
                          isOverdue(
                            loan,
                          );

                        return (
                          <div
                            key={String(
                              loan.id,
                            )}
                            className={`rounded-xl border p-4 ${
                              loanOverdue
                                ? "theme-danger"
                                : themeNeutralBorder
                            }`}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="theme-text text-sm font-bold">
                                    {loan.nomorPeminjaman ||
                                      `Peminjaman #${loan.id}`}
                                  </p>

                                  <LoanStatusBadge
                                    loan={
                                      loan
                                    }
                                  />
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                  <div>
                                    <p className="theme-text-muted text-[10px]">
                                      Tanggal pinjam
                                    </p>

                                    <p className="theme-text mt-1 text-xs font-semibold">
                                      {formatDate(
                                        loan.tanggalPinjam,
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="theme-text-muted text-[10px]">
                                      Jatuh tempo
                                    </p>

                                    <p
                                      className={`mt-1 text-xs font-semibold ${
                                        loanOverdue
                                          ? "text-[var(--color-danger)]"
                                          : "theme-text"
                                      }`}
                                    >
                                      {formatDate(
                                        loan.jatuhTempo,
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="theme-text-muted text-[10px]">
                                      Dikembalikan
                                    </p>

                                    <p className="theme-text mt-1 text-xs font-semibold">
                                      {formatDate(
                                        loan.tanggalKembali,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {loan.id ===
                                activeLoan?.id && (
                                <button
                                  type="button"
                                  onClick={
                                    handleReturn
                                  }
                                  disabled={
                                    returning
                                  }
                                  className="theme-primary inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {returning ? (
                                    <Loader2
                                      size={
                                        14
                                      }
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <RotateCcw
                                      size={
                                        14
                                      }
                                    />
                                  )}

                                  {returning
                                    ? "Memproses..."
                                    : "Kembalikan"}
                                </button>
                              )}
                            </div>

                            {loan.catatan && (
                              <div
                                className={`mt-4 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                              >
                                <p className="theme-text-muted text-[10px]">
                                  Catatan
                                </p>

                                <p className="theme-text-secondary mt-1 text-xs leading-5">
                                  {loan.catatan}
                                </p>
                              </div>
                            )}

                            {Number(
                              loan.denda ||
                                0,
                            ) > 0 && (
                              <div
                                className={`mt-3 rounded-lg border ${themeWarningSoft} border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] p-3`}
                              >
                                <p className="text-[10px] font-semibold text-[var(--color-warning)]">
                                  Denda
                                </p>

                                <p className="mt-1 text-sm font-bold text-[var(--color-warning)]">
                                  Rp{" "}
                                  {Number(
                                    loan.denda,
                                  ).toLocaleString(
                                    "id-ID",
                                  )}
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
          </div>

          {/* =====================================================
              QUICK SUMMARY
          ====================================================== */}

          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5 sm:p-6`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <Sparkles
                  size={19}
                />
              </div>

              <div>
                <h2 className="theme-text text-sm font-bold">
                  Ringkasan Buku
                </h2>

                <p className="theme-text-muted mt-1 text-[10px]">
                  Informasi dari backend.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div
                className={`flex items-center justify-between gap-3 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
              >
                <div className="flex items-center gap-2.5">
                  <Library
                    size={15}
                    className="text-[var(--color-primary)]"
                  />

                  <span className="theme-text-secondary text-xs">
                    Kategori
                  </span>
                </div>

                <span className="theme-text text-xs font-semibold">
                  {book.kategori}
                </span>
              </div>

              <div
                className={`flex items-center justify-between gap-3 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen
                    size={15}
                    className="text-[var(--color-primary)]"
                  />

                  <span className="theme-text-secondary text-xs">
                    Tipe
                  </span>
                </div>

                <span className="theme-text text-xs font-semibold">
                  {isEbook
                    ? "E-Book"
                    : "Fisik"}
                </span>
              </div>

              <div
                className={`flex items-center justify-between gap-3 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
              >
                <div className="flex items-center gap-2.5">
                  <BookMarked
                    size={15}
                    className="text-[var(--color-success)]"
                  />

                  <span className="theme-text-secondary text-xs">
                    Ketersediaan
                  </span>
                </div>

                <span
                  className={`text-xs font-semibold ${
                    isEbook ||
                    isAvailable
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {isEbook
                    ? "Digital"
                    : isAvailable
                      ? `${book.jumlahTersedia} tersedia`
                      : "Stok habis"}
                </span>
              </div>

              <div
                className={`flex items-center justify-between gap-3 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
              >
                <div className="flex items-center gap-2.5">
                  <UserRound
                    size={15}
                    className="text-[var(--color-primary)]"
                  />

                  <span className="theme-text-secondary text-xs">
                    Pengguna
                  </span>
                </div>

                <span className="theme-text max-w-[150px] truncate text-right text-xs font-semibold">
                  {username}
                </span>
              </div>
            </div>

            <div
              className={`mt-5 rounded-xl border ${themePrimaryBorder} ${themePrimarySoft} p-4`}
            >
              <div className="flex items-start gap-3">
                <CalendarClock
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                />

                <div>
                  <p className="theme-text text-xs font-semibold">
                    Perhatikan jatuh tempo
                  </p>

                  <p className="theme-text-muted mt-1 text-[10px] leading-5">
                    Jika buku sedang dipinjam, tanggal jatuh tempo
                    akan mengikuti data transaksi yang dikirim oleh
                    backend.
                  </p>
                </div>
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
              SmartSchool · Detail Buku
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2
              size={13}
              className="text-[var(--color-success)]"
            />

            <span>
              Data tersinkron dengan server
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}