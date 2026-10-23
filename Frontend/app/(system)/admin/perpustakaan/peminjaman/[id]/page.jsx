"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RotateCcw,
  UserRound,
  AlertTriangle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getPeminjaman,
  kembalikanBuku,
} from "@/services/perpustakaan.service";


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


export default function DetailPeminjamanPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showReturn, setShowReturn] = useState(false);
  const [returning, setReturning] = useState(false);

  const loadLoan = useCallback(async () => {
    if (!id) {
      setError("ID peminjaman tidak ditemukan.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await getPeminjaman();
      const rows = toArray(response).map(normalizeLoan);
      const found = rows.find((r) => String(r.id) === String(id));
      if (!found) {
        throw new Error("Data peminjaman tidak ditemukan.");
      }
      setLoan(found);
    } catch (err) {
      console.error("Gagal memuat detail peminjaman:", err);
      setError(
        getErrorMessage(err, "Gagal memuat detail peminjaman.")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLoan();
  }, [loadLoan]);

  const confirmReturn = async () => {
    if (!loan?.id) return;
    try {
      setReturning(true);
      setError("");
      await kembalikanBuku(String(loan.id));
      setShowReturn(false);
      await loadLoan();
    } catch (err) {
      console.error("Gagal memproses pengembalian:", err);
      setError(
        getErrorMessage(err, "Gagal memproses pengembalian buku.")
      );
    } finally {
      setReturning(false);
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
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/admin/perpustakaan/peminjaman")}
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium theme-text-secondary transition hover:theme-card-soft"
            >
              <ArrowLeft size={17} />
              Kembali ke Peminjaman
            </button>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="theme-primary-soft flex h-12 w-12 items-center justify-center rounded-xl">
                  <BookOpen size={23} />
                </div>
                <div>
                  <h1 className="theme-text text-2xl font-bold tracking-tight">
                    Detail Peminjaman
                  </h1>
                  <p className="theme-text-secondary mt-0.5 text-sm">
                    Data transaksi dari backend perpustakaan.
                  </p>
                </div>
              </div>

              {!loading && loan && loan.status !== "Dikembalikan" && (
                <button
                  type="button"
                  onClick={() => setShowReturn(true)}
                  className="theme-success inline-flex items-center justify-center gap-2 rounded-xl border theme-border px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                >
                  <RotateCcw size={17} />
                  Kembalikan Buku
                </button>
              )}
            </div>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm">{error}</p>
                {!loading && (
                  <button
                    onClick={loadLoan}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold"
                  >
                    <RefreshCw size={14} />
                    Coba lagi
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="theme-card flex min-h-64 items-center justify-center rounded-2xl border theme-border">
                <Loader2
                  size={20}
                  className="animate-spin theme-primary-text"
                />
                <span className="ml-3 text-sm theme-text-muted">
                  Memuat detail peminjaman...
                </span>
              </div>
            ) : loan ? (
              <div className="space-y-5">
                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
                    <div className="theme-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-xl">
                      <BookOpen size={27} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="theme-primary-soft rounded-md border theme-border px-2.5 py-1 text-xs font-semibold">
                          {loan.kode !== "-"
                            ? loan.kode
                            : `ID ${asString(loan.id).slice(0, 8)}`}
                        </span>
                        <StatusBadge status={loan.status} />
                      </div>
                      <h2 className="theme-text mt-2 text-lg font-bold">
                        {loan.buku}
                      </h2>
                      <p className="theme-text-muted mt-0.5 text-xs">
                        {loan.kodeBuku}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="border-b theme-border px-5 py-4 sm:px-6">
                    <h3 className="theme-text text-sm font-semibold">
                      Data Peminjam
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 p-5 sm:p-6">
                    <div className="theme-primary-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                      <UserRound size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="theme-text text-sm font-semibold">
                        {loan.siswa}
                      </p>
                      <p className="theme-text-muted mt-0.5 text-xs">
                        NIS {loan.nis} • Kelas {loan.kelas}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="theme-card rounded-xl border theme-border p-4">
                    <div className="theme-text-muted flex items-center gap-2">
                      <CalendarDays size={15} />
                      <span className="text-xs">Tanggal Pinjam</span>
                    </div>
                    <p className="theme-text-secondary mt-2 text-sm font-semibold">
                      {formatDate(loan.tanggalPinjam)}
                    </p>
                  </div>

                  <div className="theme-warning rounded-xl border theme-border p-4">
                    <div className="flex items-center gap-2">
                      <Clock3 size={15} />
                      <span className="text-xs">Jatuh Tempo</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {formatDate(loan.jatuhTempo)}
                    </p>
                  </div>

                  <div className="theme-success rounded-xl border theme-border p-4">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={15} />
                      <span className="text-xs">Dikembalikan</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {formatDate(loan.tanggalKembali)}
                    </p>
                  </div>
                </section>

                <section className="theme-card flex items-center justify-between rounded-2xl border theme-border px-5 py-4 shadow-sm">
                  <span className="theme-text-secondary text-sm">
                    Total Denda
                  </span>
                  <span className="theme-text text-sm font-bold">
                    {formatRupiah(loan.denda)}
                  </span>
                </section>

                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="border-b theme-border px-5 py-4 sm:px-6">
                    <h3 className="theme-text text-sm font-semibold">
                      Informasi Sistem
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2 sm:p-6">
                    <div>
                      <p className="theme-text-muted text-xs">Peminjaman ID</p>
                      <p className="theme-text-secondary mt-1 break-all text-xs font-medium">
                        {asString(loan.id, "-")}
                      </p>
                    </div>
                    <div>
                      <p className="theme-text-muted text-xs">Pengguna ID</p>
                      <p className="theme-text-secondary mt-1 break-all text-xs font-medium">
                        {asString(loan.penggunaId, "-")}
                      </p>
                    </div>
                    <div>
                      <p className="theme-text-muted text-xs">Buku ID</p>
                      <p className="theme-text-secondary mt-1 break-all text-xs font-medium">
                        {asString(loan.bukuId, "-")}
                      </p>
                    </div>
                    <div>
                      <p className="theme-text-muted text-xs">Petugas</p>
                      <p className="theme-text-secondary mt-1 text-xs font-medium">
                        {loan.petugas}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {showReturn && loan && (
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
                  <span className="theme-text font-semibold">
                    {loan.siswa}
                  </span>{" "}
                  dengan buku{" "}
                  <span className="theme-text font-semibold">
                    {loan.buku}
                  </span>{" "}
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
                onClick={() => setShowReturn(false)}
                disabled={returning}
                className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition hover:theme-card-soft disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReturn}
                disabled={returning}
                className="theme-primary h-10 rounded-lg px-5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
              >
                {returning ? "Memproses..." : "Ya, Kembalikan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}