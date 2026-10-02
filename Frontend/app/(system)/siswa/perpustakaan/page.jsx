"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  BookMarked,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Library,
  Loader2,
  MonitorPlay,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  getBuku,
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
  "bg-red-500/10";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

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

function getDateValue(value) {
  if (!value) {
    return 0;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime();
}

function isOverdue(loan) {
  if (!loan || loan.tanggalKembali) {
    return false;
  }

  if (
    loan.status === "Dikembalikan" ||
    loan.status === "Selesai"
  ) {
    return false;
  }

  const due = getDateValue(loan.jatuhTempo);

  if (!due) {
    return false;
  }

  const dueDate = new Date(due);
  dueDate.setHours(23, 59, 59, 999);

  return dueDate.getTime() < Date.now();
}

function normalizeLoanStatus(value, loan) {
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

  if (loan?.jatuhTempo) {
    const due = getDateValue(loan.jatuhTempo);

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

function normalizeBook(item) {
  const raw = item || {};

  return {
    ...raw,
    id: raw?.id ?? raw?.bukuId ?? "",
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
      asString(raw?.tipe || "FISIK").toUpperCase(),
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
      Number(raw?.jumlah ?? 0) || 0,
    jumlahTersedia:
      Number(
        raw?.jumlahTersedia ??
        raw?.tersedia ??
        raw?.jumlah ??
        0,
      ) || 0,
    status:
      asString(raw?.status || "aktif").toLowerCase(),
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

  const normalized = {
    ...raw,
    id:
      raw?.id ??
      raw?.peminjamanId ??
      "",
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
    kelas:
      pengguna?.kelas?.nama ||
      pengguna?.kelas?.namaKelas ||
      pengguna?.kelas?.kode ||
      pengguna?.namaKelas ||
      raw?.kelas?.nama ||
      raw?.kelas ||
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
    status:
      normalizeLoanStatus(
        raw?.status,
        {
          jatuhTempo,
          tanggalKembali,
        },
      ),
    denda:
      Number(raw?.denda ?? raw?.fine ?? 0) || 0,
  };

  return normalized;
}

function getInitials(name) {
  const text = asString(name, "Siswa").trim();

  if (!text) {
    return "SW";
  }

  const parts = text.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    `${parts[0][0] || ""}${parts[1][0] || ""}`
  ).toUpperCase();
}

function getAvailablePhysicalCopies(books) {
  return books.reduce((sum, book) => {
    if (book.tipe === "EBOOK") {
      return sum;
    }

    return sum + Math.max(
      0,
      Number(book.jumlahTersedia || 0),
    );
  }, 0);
}

function getAvailableBooks(books) {
  return books.filter(
    (book) =>
      book.status === "aktif" &&
      book.tipe !== "EBOOK" &&
      Number(book.jumlahTersedia || 0) > 0 &&
      book.id,
  );
}

function getCategoryData(books) {
  const counts = new Map();

  books.forEach((book) => {
    const category =
      asString(book.kategori, "Umum").trim() ||
      "Umum";

    counts.set(
      category,
      (counts.get(category) || 0) + 1,
    );
  });

  const total = books.length || 1;

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], index) => ({
      label,
      value,
      percentage: Math.round((value / total) * 100),
      tone:
        ["blue", "violet", "emerald", "indigo", "amber", "blue"][
          index % 6
        ],
    }));
}

function getPopularBooks(books, loans) {
  const counts = new Map();

  loans.forEach((loan) => {
    if (!loan?.bukuId && !loan?.kodeBuku) {
      return;
    }

    const key =
      loan?.bukuId ||
      loan?.kodeBuku ||
      loan?.buku ||
      "";

    counts.set(
      key,
      (counts.get(key) || 0) + 1,
    );
  });

  return [...books]
    .map((book) => ({
      ...book,
      borrowed:
        counts.get(book.id) ||
        counts.get(book.kodeBuku) ||
        0,
    }))
    .sort((a, b) => b.borrowed - a.borrowed)
    .slice(0, 5);
}

/* =========================================================
   STATUS BADGE
========================================================= */

function LoanStatusBadge({ loan }) {
  const status = loan.status;

  if (status === "Terlambat") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-500">
        <Clock3 size={12} />
        Terlambat
      </span>
    );
  }

  if (status === "Dikembalikan") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] ${themeSuccessSoft} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-success)]`}
      >
        <CheckCircle2 size={12} />
        Dikembalikan
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${themePrimaryBorder} ${themePrimarySoft} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]`}
    >
      <BookOpenCheck size={12} />
      Dipinjam
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  const toneMap = {
    blue: {
      surface: themePrimarySoft,
      text: "text-[var(--color-primary)]",
    },
    green: {
      surface: themeSuccessSoft,
      text: "text-[var(--color-success)]",
    },
    amber: {
      surface: themeWarningSoft,
      text: "text-[var(--color-warning)]",
    },
    red: {
      surface: themeDangerSoft,
      text: "text-red-500",
    },
  };

  const theme = toneMap[tone] || toneMap.blue;

  return (
    <div
      className={`theme-card group relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} ${themeCardHoverShadow} p-5 transition-all duration-300 hover:-translate-y-0.5`}
    >
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${theme.surface} transition-transform duration-500 group-hover:scale-150`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="theme-text-secondary text-sm font-medium">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${theme.text}`}
          >
            {value}
          </p>

          <p className="theme-text-muted mt-1.5 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.surface} ${theme.text}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOOK DETAIL MODAL
========================================================= */

function BookDetailModal({
  book,
  userId,
  savingId,
  onClose,
  onBorrow,
}) {
  if (!book) {
    return null;
  }

  const isEbook = book.tipe === "EBOOK";

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
              Detail buku
            </p>

            <h2 className="theme-text mt-1 text-lg font-bold">
              {book.judul}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
            <div
              className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themePrimarySoft} flex min-h-[190px] items-center justify-center`}
            >
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`Cover ${book.judul}`}
                  className="h-full max-h-[220px] w-full object-cover"
                />
              ) : (
                <BookOpen
                  size={46}
                  className="text-[var(--color-primary)]"
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md border ${themePrimaryBorder} ${themePrimarySoft} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]`}
                >
                  {book.kodeBuku}
                </span>

                <span className="rounded-md border theme-border-soft bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2.5 py-1 text-[10px] font-semibold theme-text-secondary">
                  {isEbook ? "E-Book" : "Buku Fisik"}
                </span>

                <span className="rounded-md border theme-border-soft bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2.5 py-1 text-[10px] font-semibold theme-text-secondary">
                  {book.kategori}
                </span>
              </div>

              <h3 className="theme-text mt-3 text-xl font-bold">
                {book.judul}
              </h3>

              <p className="theme-text-secondary mt-1.5 text-sm">
                {book.penulis || "Penulis belum tersedia"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                >
                  <p className="theme-text-muted text-[10px]">
                    Penerbit
                  </p>
                  <p className="theme-text mt-1 text-xs font-semibold">
                    {book.penerbit || "-"}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                >
                  <p className="theme-text-muted text-[10px]">
                    Tahun terbit
                  </p>
                  <p className="theme-text mt-1 text-xs font-semibold">
                    {book.tahunTerbit || "-"}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                >
                  <p className="theme-text-muted text-[10px]">
                    Tersedia
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-success)]">
                    {isEbook
                      ? "Digital"
                      : book.jumlahTersedia}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                >
                  <p className="theme-text-muted text-[10px]">
                    ISBN
                  </p>
                  <p className="theme-text mt-1 break-all text-xs font-semibold">
                    {book.isbn || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {book.deskripsi && (
            <div
              className={`mt-5 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
            >
              <p className="theme-text text-xs font-semibold">
                Deskripsi
              </p>

              <p className="theme-text-secondary mt-1.5 text-xs leading-6">
                {book.deskripsi}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`theme-card theme-border theme-text-secondary flex h-10 items-center justify-center rounded-lg border px-5 text-sm font-medium transition ${themePrimarySoftHover}`}
            >
              Tutup
            </button>

            {isEbook && book.urlEbook ? (
              <a
                href={book.urlEbook}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110"
              >
                <MonitorPlay size={16} />
                Baca E-Book
              </a>
            ) : (
              <button
                type="button"
                disabled={
                  !userId ||
                  book.status !== "aktif" ||
                  Number(book.jumlahTersedia || 0) <= 0 ||
                  savingId === String(book.id)
                }
                onClick={() => onBorrow(book)}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingId === String(book.id) ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <BookOpenCheck size={16} />
                )}

                {savingId === String(book.id)
                  ? "Memproses..."
                  : Number(book.jumlahTersedia || 0) > 0
                    ? "Pinjam Buku"
                    : "Stok Habis"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PerpustakaanSiswaPage() {
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState(null);

  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("Semua");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [savingId, setSavingId] = useState("");
  const [returningId, setReturningId] =
    useState("");

  const [selectedBook, setSelectedBook] =
    useState(null);

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
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const booksResponse = await getBuku();

      const normalizedBooks = toArray(
        booksResponse,
      ).map(normalizeBook);

      let normalizedLoans = [];

      if (userId) {
        const loanResponse = await getPeminjaman({
          penggunaId: userId,
        });

        normalizedLoans = toArray(
          loanResponse,
        ).map(normalizeLoan);
      }

      setBooks(normalizedBooks);
      setLoans(normalizedLoans);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Gagal mengambil data perpustakaan dari server.",
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

  const categories = useMemo(() => {
    const values = books
      .map((book) =>
        asString(book.kategori, "Umum").trim(),
      )
      .filter(Boolean);

    return Array.from(new Set(values)).sort(
      (a, b) =>
        a.localeCompare(b, "id-ID", {
          sensitivity: "base",
        }),
    );
  }, [books]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesQuery =
        !query ||
        book.judul.toLowerCase().includes(query) ||
        book.penulis.toLowerCase().includes(query) ||
        book.kodeBuku.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "Semua" ||
        book.kategori === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [books, search, categoryFilter]);

  const activeLoans = useMemo(
    () =>
      loans.filter(
        (loan) =>
          !loan.tanggalKembali &&
          loan.status !== "Dikembalikan",
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

  const availablePhysicalCopies = useMemo(
    () => getAvailablePhysicalCopies(books),
    [books],
  );

  const availablePhysicalBooks = useMemo(
    () => getAvailableBooks(books).length,
    [books],
  );

  const digitalBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          book.tipe === "EBOOK" &&
          book.status === "aktif",
      ).length,
    [books],
  );

  const categoryData = useMemo(
    () => getCategoryData(books),
    [books],
  );

  const popularBooks = useMemo(
    () => getPopularBooks(books, loans),
    [books, loans],
  );

  const recentLoans = useMemo(
    () =>
      [...loans]
        .sort(
          (a, b) =>
            getDateValue(b.tanggalPinjam) -
            getDateValue(a.tanggalPinjam),
        )
        .slice(0, 5),
    [loans],
  );

  const totalBorrowedCount = useMemo(
    () =>
      loans.reduce(
        (sum, loan) =>
          sum +
          (loan?.bukuId || loan?.kodeBuku ? 1 : 0),
        0,
      ),
    [loans],
  );

  const recentBooks = useMemo(
    () => filteredBooks.slice(0, 6),
    [filteredBooks],
  );

  const handleBorrow = async (book) => {
    if (!book?.id || !userId) {
      setError(
        "Data siswa atau buku tidak lengkap.",
      );
      return;
    }

    if (
      book.tipe === "EBOOK" ||
      book.status !== "aktif" ||
      Number(book.jumlahTersedia || 0) <= 0
    ) {
      return;
    }

    setSavingId(String(book.id));
    setError("");

    try {
      await pinjamBuku({
        bukuId: String(book.id),
        penggunaId: String(userId),
      });

      setSelectedBook(null);
      await loadData(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Gagal membuat transaksi peminjaman.",
        ),
      );
    } finally {
      setSavingId("");
    }
  };

  const handleReturn = async (loan) => {
    if (!loan?.id) {
      setError(
        "ID transaksi peminjaman tidak ditemukan.",
      );
      return;
    }

    setReturningId(String(loan.id));
    setError("");

    try {
      await kembalikanBuku(String(loan.id));

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

  const resetFilter = () => {
    setSearch("");
    setCategoryFilter("Semua");
  };

  return (
    <div className="theme-page min-h-full w-full">
      <div
        className={`mx-auto w-full max-w-[1600px] space-y-6 p-4 transition-all duration-700 sm:p-6 lg:p-8 ${
          mounted
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className={`relative overflow-hidden rounded-[28px] border ${themePrimaryBorder} ${themeCardShadow} bg-[color-mix(in_srgb,var(--color-primary)_10%,var(--color-card))]`}
        >
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] blur-3xl" />

          <div className="absolute -bottom-36 left-[35%] h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in srgb, var(--color-text) 35%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-text) 35%, transparent) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />

          <div className="relative grid gap-8 px-5 py-7 sm:px-7 sm:py-8 lg:grid-cols-[1fr_380px] lg:px-10 lg:py-10">
            <div>
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-full border ${themePrimaryBorder} ${themePrimarySoft} px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]`}
              >
                <Sparkles size={13} />
                Perpustakaan Siswa
              </div>

              <h1 className="theme-text max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-[38px] lg:leading-tight">
                Temukan buku untuk belajar dan membaca.
              </h1>

              <p className="theme-text-secondary mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]">
                Hai, {username}. Cari koleksi buku sekolah,
                baca e-book, lihat buku yang sedang kamu
                pinjam, dan pantau tanggal pengembaliannya.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#katalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110"
                >
                  <Library size={17} />
                  Jelajahi Katalog
                </Link>

                <Link
                  href="#peminjaman"
                  className={`inline-flex items-center gap-2 rounded-xl border ${themePrimaryBorder} ${themePrimarySoft} px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition ${themePrimarySoftHover}`}
                >
                  <BookOpenCheck size={17} />
                  Peminjaman Saya
                </Link>
              </div>
            </div>

            <div
              className={`rounded-2xl border ${themePrimaryBorder} ${themePrimarySoft} p-5 backdrop-blur-md`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="theme-text-muted text-xs font-medium">
                    Ringkasan perpustakaan
                  </p>

                  <p className="theme-text mt-1 text-lg font-bold">
                    {books.length} koleksi
                  </p>

                  <p className="theme-text-muted mt-1 text-xs">
                    Data mengikuti katalog sekolah.
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themeSuccessSoft} text-[var(--color-success)]`}
                >
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[11px]">
                    Tersedia
                  </p>

                  <p className="theme-text mt-1 text-xl font-bold">
                    {availablePhysicalCopies}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[11px]">
                    Digital
                  </p>

                  <p className="theme-text mt-1 text-xl font-bold">
                    {digitalBooks}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[11px]">
                    Pinjaman saya
                  </p>

                  <p className="theme-text mt-1 text-xl font-bold">
                    {activeLoans.length}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[11px]">
                    Jatuh tempo
                  </p>

                  <p className="mt-1 text-xl font-bold text-[var(--color-warning)]">
                    {overdueLoans.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <RotateCcw size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-500">
                Terjadi masalah
              </p>

              <p className="mt-1 text-xs leading-5 text-red-500/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={loading || refreshing}
              className="shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/15 disabled:opacity-60"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Koleksi"
            value={books.length}
            description="Buku di katalog sekolah"
            icon={Library}
            tone="blue"
          />

          <StatCard
            label="Buku Tersedia"
            value={availablePhysicalBooks}
            description={`${availablePhysicalCopies} eksemplar fisik siap dipinjam`}
            icon={BookMarked}
            tone="green"
          />

          <StatCard
            label="Peminjaman Saya"
            value={activeLoans.length}
            description={`${totalBorrowedCount} transaksi tercatat`}
            icon={BookOpenCheck}
            tone="blue"
          />

          <StatCard
            label="Perlu Perhatian"
            value={overdueLoans.length}
            description="Pinjaman yang melewati jatuh tempo"
            icon={CalendarClock}
            tone={overdueLoans.length > 0 ? "red" : "amber"}
          />
        </section>

        {/* =====================================================
            CATALOG
        ====================================================== */}

        <section
          id="katalog"
          className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div
            className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Koleksi sekolah
                </p>

                <h2 className="theme-text mt-1 text-lg font-bold">
                  Katalog Buku
                </h2>

                <p className="theme-text-muted mt-1 text-sm">
                  Buku fisik dan buku digital yang tersedia untuk
                  siswa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    loadData(true)
                  }
                  disabled={
                    loading || refreshing
                  }
                  className={`theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition ${themePrimarySoftHover} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <RefreshCw
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
                  placeholder="Cari judul, penulis, atau kode buku..."
                  className={`theme-input theme-border theme-text ${themeFocus} h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)]`}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                className={`theme-input theme-border theme-text ${themeFocus} h-11 rounded-lg border px-3.5 text-sm outline-none`}
              >
                <option value="Semua">
                  Semua Kategori
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="theme-text-muted text-xs">
                {filteredBooks.length} buku ditemukan
              </p>

              {(search ||
                categoryFilter !==
                  "Semua") && (
                <button
                  type="button"
                  onClick={
                    resetFilter
                  }
                  className="text-xs font-semibold text-[var(--color-primary)] transition hover:opacity-80"
                >
                  Reset filter
                </button>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                </div>

                <p className="theme-text mt-4 text-sm font-semibold">
                  Memuat katalog...
                </p>

                <p className="theme-text-muted mt-1 text-xs">
                  Mengambil data buku dari server.
                </p>
              </div>
            ) : recentBooks.length === 0 ? (
              <div
                className={`flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-5 text-center`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <Search size={21} />
                </div>

                <p className="theme-text mt-4 text-sm font-semibold">
                  Buku tidak ditemukan
                </p>

                <p className="theme-text-muted mt-1 max-w-md text-xs leading-5">
                  Coba ubah kata kunci atau pilih
                  kategori yang lain.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentBooks.map(
                  (book) => {
                    const isEbook =
                      book.tipe ===
                      "EBOOK";

                    const available =
                      isEbook
                        ? true
                        : Number(
                            book.jumlahTersedia ||
                              0,
                          ) > 0;

                    return (
                      <div
                        key={String(
                          book.id,
                        )}
                        className={`group relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:shadow-[0_14px_36px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]`}
                      >
                        <div className="flex h-40 items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
                          {book.coverUrl ? (
                            <img
                              src={
                                book.coverUrl
                              }
                              alt={`Cover ${book.judul}`}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className={`flex h-full w-full items-center justify-center ${themePrimarySoft}`}
                            >
                              {isEbook ? (
                                <MonitorPlay
                                  size={40}
                                  className="text-[var(--color-info)]"
                                />
                              ) : (
                                <BookOpen
                                  size={40}
                                  className="text-[var(--color-primary)]"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={`rounded-md border ${themePrimaryBorder} ${themePrimarySoft} px-2 py-1 text-[9px] font-semibold text-[var(--color-primary)]`}
                            >
                              {isEbook
                                ? "E-Book"
                                : "Fisik"}
                            </span>

                            <span className="rounded-md border theme-border-soft bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-1 text-[9px] font-semibold theme-text-muted">
                              {book.kategori}
                            </span>
                          </div>

                          <h3 className="theme-text mt-3 line-clamp-2 text-sm font-bold leading-5">
                            {book.judul}
                          </h3>

                          <p className="theme-text-muted mt-1 truncate text-xs">
                            {book.penulis}
                          </p>

                          <p className="theme-text-muted mt-1 text-[10px]">
                            {book.kodeBuku}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-2">
                            <div>
                              <p className="theme-text-muted text-[10px]">
                                {isEbook
                                  ? "Akses"
                                  : "Tersedia"}
                              </p>

                              <p className="theme-text mt-0.5 text-xs font-bold">
                                {isEbook
                                  ? "Digital"
                                  : `${book.jumlahTersedia} eksemplar`}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedBook(
                                  book,
                                )
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-2 text-[11px] font-semibold theme-text-secondary transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
                            >
                              Detail
                              <ArrowUpRight
                                size={13}
                              />
                            </button>
                          </div>

                          <div className="mt-3">
                            {isEbook ? (
                              book.urlEbook ? (
                                <a
                                  href={
                                    book.urlEbook
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-110"
                                >
                                  <MonitorPlay
                                    size={14}
                                  />
                                  Baca Buku
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex w-full items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-3 py-2 text-xs font-semibold theme-text-muted"
                                >
                                  E-Book belum memiliki URL
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedBook(
                                    book,
                                  )
                                }
                                disabled={
                                  !available ||
                                  book.status !==
                                    "aktif"
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <BookOpenCheck
                                  size={14}
                                />
                                {book.status !==
                                "aktif"
                                  ? "Tidak aktif"
                                  : available
                                    ? "Lihat & Pinjam"
                                    : "Stok habis"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            POPULAR + CATEGORY
        ====================================================== */}

        <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
          <div
            className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
          >
            <div
              className={`flex flex-col gap-3 border-b ${themeDivider} px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Paling sering dipinjam
                </p>

                <h2 className="theme-text mt-1 text-lg font-bold">
                  Buku populer
                </h2>

                <p className="theme-text-muted mt-1 text-sm">
                  Perhitungan berdasarkan transaksi peminjaman
                  yang tersedia.
                </p>
              </div>

              <div
                className={`rounded-xl ${themePrimarySoft} px-3 py-2 text-xs font-semibold text-[var(--color-primary)]`}
              >
                {loans.length} transaksi
              </div>
            </div>

            <div className="divide-y divide-[var(--color-border-soft)]">
              {popularBooks.length === 0 ? (
                <div className="px-5 py-10 text-center sm:px-6">
                  <BookMarked
                    size={26}
                    className="mx-auto text-[var(--color-primary)]"
                  />
                  <p className="theme-text mt-3 text-sm font-semibold">
                    Belum ada riwayat peminjaman
                  </p>
                  <p className="theme-text-muted mt-1 text-xs">
                    Data akan muncul setelah transaksi
                    peminjaman tersedia.
                  </p>
                </div>
              ) : (
                popularBooks.map(
                  (book, index) => (
                    <button
                      key={String(
                        book.id,
                      )}
                      type="button"
                      onClick={() =>
                        setSelectedBook(
                          book,
                        )
                      }
                      className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition ${themePrimarySoftHover} sm:px-6`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-muted text-xs font-bold`}
                      >
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </div>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                      >
                        {book.coverUrl ? (
                          <img
                            src={
                              book.coverUrl
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen size={18} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text truncate text-sm font-semibold">
                          {book.judul}
                        </p>

                        <p className="theme-text-muted mt-1 truncate text-xs">
                          {book.penulis} ·{" "}
                          {book.kategori}
                        </p>
                      </div>

                      <div className="hidden min-w-[95px] sm:block">
                        <p className="theme-text-muted text-[10px]">
                          Transaksi
                        </p>

                        <p className="theme-text mt-1 text-xs font-bold">
                          {book.borrowed} kali
                        </p>
                      </div>

                      <ChevronRight
                        size={16}
                        className="theme-text-muted shrink-0 transition group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                      />
                    </button>
                  ),
                )
              )}
            </div>
          </div>

          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5 sm:p-6`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Koleksi
                </p>

                <h2 className="theme-text mt-1 text-lg font-bold">
                  Kategori buku
                </h2>

                <p className="theme-text-muted mt-1 text-sm">
                  Distribusi katalog berdasarkan kategori dari
                  backend.
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <Library size={19} />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {categoryData.length === 0 ? (
                <div className="rounded-xl border border-dashed theme-border-soft p-5 text-center">
                  <p className="theme-text-muted text-xs">
                    Belum ada data kategori.
                  </p>
                </div>
              ) : (
                categoryData.map(
                  (item) => {
                    const barMap = {
                      blue: "var(--color-primary)",
                      violet: "var(--color-info)",
                      emerald:
                        "var(--color-success)",
                      indigo:
                        "var(--color-primary)",
                      amber:
                        "var(--color-warning)",
                    };

                    const bar =
                      barMap[item.tone] ||
                      "var(--color-primary)";

                    return (
                      <div
                        key={item.label}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  bar,
                              }}
                            />

                            <span className="theme-text-secondary truncate text-xs font-medium">
                              {item.label}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="theme-text text-xs font-bold">
                              {item.value}
                            </span>

                            <span className="theme-text-muted text-[10px]">
                              ({item.percentage}%)
                            </span>
                          </div>
                        </div>

                        <div
                          className={`mt-2 h-1.5 overflow-hidden rounded-full ${themeNeutralSurface}`}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                item.percentage,
                              )}%`,
                              backgroundColor:
                                bar,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </div>

            <div
              className={`mt-6 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-card text-[var(--color-primary)]`}
                >
                  <BookOpen size={17} />
                </div>

                <div>
                  <p className="theme-text text-xs font-semibold">
                    Koleksi aktif
                  </p>

                  <p className="theme-text-muted mt-0.5 text-[11px]">
                    {books.filter(
                      (book) =>
                        book.status ===
                        "aktif",
                    ).length}{" "}
                    buku berstatus aktif.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MY LOANS
        ====================================================== */}

        <section
          id="peminjaman"
          className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div
            className={`flex flex-col gap-4 border-b ${themeDivider} px-5 py-5 sm:px-6`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Aktivitas saya
                </p>

                <h2 className="theme-text mt-1 text-lg font-bold">
                  Peminjaman Saya
                </h2>

                <p className="theme-text-muted mt-1 text-sm">
                  Daftar transaksi peminjaman milik akun siswa yang
                  sedang login.
                </p>
              </div>

              <div
                className={`rounded-xl ${themePrimarySoft} px-3 py-2 text-xs font-semibold text-[var(--color-primary)]`}
              >
                {activeLoans.length} aktif
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <Loader2
                  size={22}
                  className="animate-spin text-[var(--color-primary)]"
                />
              </div>
            ) : activeLoans.length === 0 ? (
              <div
                className={`rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-5 py-12 text-center`}
              >
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <BookOpenCheck size={21} />
                </div>

                <p className="theme-text mt-4 text-sm font-semibold">
                  Belum ada buku yang sedang dipinjam
                </p>

                <p className="theme-text-muted mt-1 text-xs">
                  Kamu bisa meminjam buku fisik langsung dari katalog
                  di atas.
                </p>

                <Link
                  href="#katalog"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
                >
                  Lihat katalog
                  <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeLoans.map(
                  (loan) => {
                    const overdue =
                      isOverdue(
                        loan,
                      );

                    return (
                      <div
                        key={String(
                          loan.id,
                        )}
                        className={`rounded-2xl border p-4 transition ${
                          overdue
                            ? "border-red-500/20 bg-red-500/5"
                            : themeNeutralBorder
                        } ${themeCardShadow}`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                              overdue
                                ? "bg-red-500/10 text-red-500"
                                : `${themePrimarySoft} text-[var(--color-primary)]`
                            }`}
                          >
                            <BookOpen size={21} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="theme-text truncate text-sm font-bold">
                                {loan.buku}
                              </h3>

                              <LoanStatusBadge
                                loan={
                                  loan
                                }
                              />
                            </div>

                            <p className="theme-text-muted mt-1 text-xs">
                              {loan.kodeBuku}
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                                  Jatuh tempo
                                </p>

                                <p
                                  className={`mt-1 text-xs font-semibold ${
                                    overdue
                                      ? "text-red-500"
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
                                  Denda
                                </p>

                                <p className="theme-text mt-1 text-xs font-semibold">
                                  Rp{" "}
                                  {Number(
                                    loan.denda ||
                                      0,
                                  ).toLocaleString(
                                    "id-ID",
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 lg:self-center">
                            {overdue && (
                              <span className="hidden items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-semibold text-red-500 sm:inline-flex">
                                <CalendarClock
                                  size={
                                    13
                                  }
                                />
                                Lewat jatuh tempo
                              </span>
                            )}

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

                              {returningId ===
                              String(
                                loan.id,
                              )
                                ? "Memproses..."
                                : "Kembalikan"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            RECENT TRANSACTIONS
        ====================================================== */}

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div
            className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
          >
            <div
              className={`flex flex-col gap-3 border-b ${themeDivider} px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
            >
              <div>
                <p className="theme-text text-sm font-bold">
                  Riwayat terbaru
                </p>

                <p className="theme-text-muted mt-1 text-xs">
                  Transaksi terbaru dari akunmu.
                </p>
              </div>

              <div className="theme-text-muted flex items-center gap-2 text-xs">
                <Clock3 size={14} />
                {recentLoans.length} transaksi
              </div>
            </div>

            <div className="divide-y divide-[var(--color-border-soft)]">
              {recentLoans.length === 0 ? (
                <div className="px-5 py-10 text-center sm:px-6">
                  <p className="theme-text-muted text-xs">
                    Belum ada riwayat transaksi.
                  </p>
                </div>
              ) : (
                recentLoans.map(
                  (loan) => (
                    <div
                      key={String(
                        loan.id,
                      )}
                      className={`flex items-center gap-3 px-5 py-4 transition ${themePrimarySoftHover} sm:px-6`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${themePrimarySoft} text-xs font-bold text-[var(--color-primary)]`}
                      >
                        {getInitials(
                          username,
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text truncate text-sm font-semibold">
                          {loan.buku}
                        </p>

                        <p className="theme-text-muted mt-1 truncate text-[10px]">
                          {loan.kodeBuku}
                        </p>

                        <p className="theme-text-muted mt-1 text-[10px]">
                          {formatDateTime(
                            loan.tanggalPinjam,
                          )}
                        </p>
                      </div>

                      <LoanStatusBadge
                        loan={loan}
                      />
                    </div>
                  ),
                )
              )}
            </div>
          </div>

          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5 sm:p-6`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <UserRound size={19} />
              </div>

              <div>
                <p className="theme-text text-sm font-bold">
                  Tips menggunakan perpustakaan
                </p>

                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Gunakan katalog untuk menemukan koleksi dan cek
                  halaman peminjaman untuk memantau buku yang masih
                  kamu pinjam.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div
                className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen
                    size={16}
                    className="text-[var(--color-primary)]"
                  />

                  <div>
                    <p className="theme-text text-xs font-semibold">
                      Buku fisik
                    </p>

                    <p className="theme-text-muted mt-0.5 text-[10px]">
                      Peminjaman akan mengurangi stok tersedia
                      setelah berhasil diproses backend.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
              >
                <div className="flex items-center gap-3">
                  <MonitorPlay
                    size={16}
                    className="text-[var(--color-info)]"
                  />

                  <div>
                    <p className="theme-text text-xs font-semibold">
                      Buku digital
                    </p>

                    <p className="theme-text-muted mt-0.5 text-[10px]">
                      E-Book dibuka melalui URL yang disediakan pada
                      data buku.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
              >
                <div className="flex items-center gap-3">
                  <CalendarClock
                    size={16}
                    className="text-[var(--color-warning)]"
                  />

                  <div>
                    <p className="theme-text text-xs font-semibold">
                      Perhatikan jatuh tempo
                    </p>

                    <p className="theme-text-muted mt-0.5 text-[10px]">
                      Pantau tanggal kembali agar transaksi
                      peminjaman tetap tertata.
                    </p>
                  </div>
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
              SmartSchool · Perpustakaan Siswa
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2
                size={13}
                className="text-[var(--color-success)]"
              />
              Data tersinkron dengan server
            </span>

            <span>
              {books.length} koleksi
            </span>
          </div>
        </div>
      </div>

      {/* =======================================================
          DETAIL MODAL
      ======================================================= */}

      <BookDetailModal
        book={selectedBook}
        userId={userId}
        savingId={savingId}
        onClose={() =>
          setSelectedBook(null)
        }
        onBorrow={
          handleBorrow
        }
      />
    </div>
  );
}
