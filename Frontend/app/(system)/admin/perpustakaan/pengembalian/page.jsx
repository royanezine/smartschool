
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  RotateCcw,
  BookOpen,
  UserRound,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

function toArray(response) {
  const data = unwrapValue(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;

  return [];
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function hitungTerlambat(value) {
  if (!value) return 0;

  const jatuhTempo = new Date(value);

  if (Number.isNaN(jatuhTempo.getTime())) return 0;

  jatuhTempo.setHours(0, 0, 0, 0);

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor(
      (hariIni.getTime() - jatuhTempo.getTime()) / 86400000
    )
  );
}

function namaPeminjam(item) {
  const pengguna =
    item?.pengguna ??
    item?.peminjam ??
    item?.user ??
    null;

  return (
    pengguna?.namaLengkap ||
    pengguna?.nama ||
    pengguna?.name ||
    pengguna?.email ||
    "Pengguna"
  );
}

function identitasPeminjam(item) {
  const pengguna =
    item?.pengguna ??
    item?.peminjam ??
    item?.user ??
    null;

  return (
    pengguna?.nisn ||
    pengguna?.nis ||
    pengguna?.email ||
    item?.penggunaId ||
    "-"
  );
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  return error?.message || error?.error || fallback;
}


export default function PengembalianBukuPage() {
  const router = useRouter();

  const [peminjaman, setPeminjaman] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const loadPeminjaman = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getPeminjaman({
        status: "dipinjam",
      });

      const rows = toArray(response);

      setPeminjaman(
        rows.filter(
          (item) =>
            String(item?.status || "").toLowerCase() === "dipinjam"
        )
      );
    } catch (err) {
      console.error("Gagal memuat peminjaman:", err);

      setError(
        getErrorMessage(
          err,
          "Gagal memuat daftar peminjaman. Silakan coba lagi."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPeminjaman();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPeminjaman]);


  const daftarPeminjaman = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return peminjaman.filter((item) => {
      const judul = String(
        item?.buku?.judul || item?.judulBuku || ""
      ).toLowerCase();

      const kodeBuku = String(
        item?.buku?.kodeBuku || item?.kodeBuku || ""
      ).toLowerCase();

      const nomor = String(
        item?.nomorPeminjaman || ""
      ).toLowerCase();

      const nama = namaPeminjam(item).toLowerCase();
      const identitas = identitasPeminjam(item).toLowerCase();

      const cocokSearch =
        !keyword ||
        judul.includes(keyword) ||
        kodeBuku.includes(keyword) ||
        nomor.includes(keyword) ||
        nama.includes(keyword) ||
        identitas.includes(keyword);

      const terlambat =
        hitungTerlambat(item?.tanggalJatuhTempo) > 0;

      const cocokStatus =
        filterStatus === "semua" ||
        (filterStatus === "terlambat" && terlambat) ||
        (filterStatus === "belum" && !terlambat);

      return cocokSearch && cocokStatus;
    });
  }, [peminjaman, search, filterStatus]);

  const jumlahTerlambat = useMemo(
    () =>
      peminjaman.filter(
        (item) => hitungTerlambat(item?.tanggalJatuhTempo) > 0
      ).length,
    [peminjaman]
  );



const handlePengembalian = async () => {
  const id = selectedItem?.id;

  if (!id) {
    setError("ID peminjaman tidak ditemukan.");
    return;
  }

  if (processingId) return;

  setProcessingId(id);
  setError("");
  setSuccess("");

  try {
    await kembalikanBuku(id);

    setSuccess("Buku berhasil dikembalikan.");

    await loadPeminjaman(true);

    setSelectedItem(null);
  } catch (err) {
    console.error("Gagal mengembalikan buku:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Gagal mengembalikan buku."
    );
  } finally {
    setProcessingId(null);
  }
};



  const inputClass =
    "theme-input theme-border theme-text h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  const selectClass =
    "theme-input theme-border theme-text h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] sm:w-48";


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
           

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="theme-primary-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <RotateCcw size={23} />
                </div>

                <div>
                  <h1 className="theme-text text-2xl font-bold tracking-tight">
                    Pengembalian Buku
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Kelola transaksi peminjaman yang belum dikembalikan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadPeminjaman(true)}
                disabled={loading || refreshing}
                className="theme-card theme-border theme-text inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition hover:theme-card-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p className="min-w-0 flex-1 break-words text-sm">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                  className="rounded p-1 hover:opacity-70"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p className="min-w-0 flex-1 text-sm">
                  {success}
                </p>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  aria-label="Tutup pesan berhasil"
                  className="rounded p-1 hover:bg-emerald-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <section className="theme-card rounded-xl border theme-border p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Peminjaman Aktif
                    </p>

                    <p className="theme-text mt-2 text-3xl font-bold">
                      {loading ? "—" : peminjaman.length}
                    </p>

                    <p className="theme-text-muted mt-1 text-xs">
                      Transaksi belum dikembalikan
                    </p>
                  </div>

                  <div className="theme-primary-soft rounded-xl p-3">
                    <BookOpen size={24} />
                  </div>
                </div>
              </section>

              <section className="theme-card rounded-xl border theme-border p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Terlambat
                    </p>

                    <p className="theme-text mt-2 text-3xl font-bold">
                      {loading ? "—" : jumlahTerlambat}
                    </p>

                    <p className="theme-text-muted mt-1 text-xs">
                      Melewati tanggal jatuh tempo
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                    <Clock3 size={24} />
                  </div>
                </div>
              </section>
            </div>

            <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
              <div className="border-b theme-border p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="theme-text text-base font-semibold">
                      Daftar Peminjaman
                    </h2>

                    <p className="theme-text-secondary mt-1 text-xs">
                      Pilih transaksi untuk mengonfirmasi buku yang telah
                      diterima kembali.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 flex-1 sm:w-72">
                      <Search
                        size={17}
                        className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Cari buku atau peminjam..."
                        className={`${inputClass} pl-9`}
                      />
                    </div>

                    <select
                      value={filterStatus}
                      onChange={(event) =>
                        setFilterStatus(event.target.value)
                      }
                      className={selectClass}
                      aria-label="Filter keterlambatan"
                    >
                      <option value="semua">
                        Semua peminjaman
                      </option>
                      <option value="terlambat">
                        Terlambat
                      </option>
                      <option value="belum">
                        Belum terlambat
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                  <Loader2
                    size={30}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="theme-text-secondary text-sm">
                    Memuat data peminjaman...
                  </p>
                </div>
              ) : daftarPeminjaman.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="theme-card-soft rounded-full p-4">
                    <BookOpen
                      size={30}
                      className="theme-text-muted"
                    />
                  </div>

                  <h3 className="theme-text mt-4 font-semibold">
                    {peminjaman.length === 0
                      ? "Tidak ada peminjaman aktif"
                      : "Data tidak ditemukan"}
                  </h3>

                  <p className="theme-text-secondary mt-2 max-w-md text-sm leading-6">
                    {peminjaman.length === 0
                      ? "Belum ada transaksi yang perlu diproses pengembaliannya."
                      : "Coba gunakan kata kunci atau filter yang berbeda."}
                  </p>

                  {(search || filterStatus !== "semua") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setFilterStatus("semua");
                      }}
                      className="theme-primary-text mt-4 text-sm font-semibold hover:underline"
                    >
                      Reset filter
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px] text-left text-sm">
                      <thead className="theme-card-soft theme-text-secondary text-xs">
                        <tr>
                          <th className="px-5 py-4 font-semibold">
                            Buku
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Peminjam
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Tanggal Pinjam
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Jatuh Tempo
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Status
                          </th>
                          <th className="px-5 py-4 text-right font-semibold">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y theme-border">
                        {daftarPeminjaman.map((item) => {
                          const terlambat = hitungTerlambat(
                            item?.tanggalJatuhTempo
                          );

                          return (
                            <tr
                              key={item.id}
                              className="transition hover:theme-card-soft"
                            >
                              <td className="px-5 py-4">
                                <p className="theme-text font-semibold">
                                  {item?.buku?.judul ||
                                    item?.judulBuku ||
                                    "Buku tanpa judul"}
                                </p>

                                <p className="theme-text-muted mt-1 text-xs">
                                  Kode:{" "}
                                  {item?.buku?.kodeBuku ||
                                    item?.kodeBuku ||
                                    "-"}
                                </p>

                                <p className="theme-text-muted mt-1 text-xs">
                                  No. peminjaman:{" "}
                                  {item?.nomorPeminjaman || "-"}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="theme-card-soft rounded-full p-2">
                                    <UserRound
                                      size={16}
                                      className="theme-text-secondary"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="theme-text font-medium">
                                      {namaPeminjam(item)}
                                    </p>

                                    <p className="theme-text-muted mt-1 break-all text-xs">
                                      {identitasPeminjam(item)}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="theme-text-secondary whitespace-nowrap px-5 py-4">
                                {formatTanggal(item?.tanggalPinjam)}
                              </td>

                              <td className="px-5 py-4">
                                <p className="theme-text whitespace-nowrap">
                                  {formatTanggal(
                                    item?.tanggalJatuhTempo
                                  )}
                                </p>

                                {terlambat > 0 && (
                                  <p className="mt-1 text-xs font-medium text-red-600">
                                    Terlambat {terlambat} hari
                                  </p>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                {terlambat > 0 ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                    <AlertCircle size={13} />
                                    Terlambat
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                    <Clock3 size={13} />
                                    Dipinjam
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedItem(item)
                                  }
                                  disabled={Boolean(processingId)}
                                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-90 disabled:opacity-50"
                                >
                                  <RotateCcw size={14} />
                                  Proses Kembali
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y theme-border md:hidden">
                    {daftarPeminjaman.map((item) => {
                      const terlambat = hitungTerlambat(
                        item?.tanggalJatuhTempo
                      );

                      return (
                        <article
                          key={item.id}
                          className="space-y-4 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="theme-text font-semibold">
                                {item?.buku?.judul ||
                                  item?.judulBuku ||
                                  "Buku tanpa judul"}
                              </h3>

                              <p className="theme-text-muted mt-1 text-xs">
                                Kode:{" "}
                                {item?.buku?.kodeBuku ||
                                  item?.kodeBuku ||
                                  "-"}
                              </p>

                              <p className="theme-text-muted mt-1 break-all text-xs">
                                No. peminjaman:{" "}
                                {item?.nomorPeminjaman || "-"}
                              </p>
                            </div>

                            {terlambat > 0 ? (
                              <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                Terlambat
                              </span>
                            ) : (
                              <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                Dipinjam
                              </span>
                            )}
                          </div>

                          <div className="flex items-start gap-2">
                            <UserRound
                              size={16}
                              className="theme-text-muted mt-0.5 shrink-0"
                            />

                            <div className="min-w-0">
                              <p className="theme-text text-sm font-medium">
                                {namaPeminjam(item)}
                              </p>

                              <p className="theme-text-muted mt-1 break-all text-xs">
                                {identitasPeminjam(item)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="theme-text-muted text-xs">
                                Tanggal Pinjam
                              </p>

                              <p className="theme-text mt-1 text-sm">
                                {formatTanggal(item?.tanggalPinjam)}
                              </p>
                            </div>

                            <div>
                              <p className="theme-text-muted text-xs">
                                Jatuh Tempo
                              </p>

                              <p className="theme-text mt-1 text-sm">
                                {formatTanggal(
                                  item?.tanggalJatuhTempo
                                )}
                              </p>
                            </div>
                          </div>

                          {terlambat > 0 && (
                            <p className="text-xs font-medium text-red-600">
                              Terlambat {terlambat} hari
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            disabled={Boolean(processingId)}
                            className="theme-primary inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                          >
                            <RotateCcw size={16} />
                            Proses Pengembalian
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}

              {!loading && daftarPeminjaman.length > 0 && (
                <div className="theme-card-soft theme-text-muted border-t theme-border px-5 py-3 text-xs">
                  Menampilkan {daftarPeminjaman.length} dari{" "}
                  {peminjaman.length} peminjaman aktif.
                </div>
              )}
            </section>

            <p className="theme-text-muted mt-4 text-xs leading-5">
              Status peminjaman dan penambahan stok dilakukan oleh
              backend setelah pengembalian berhasil diproses.
            </p>
          </div>
        </main>
      </div>


      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !processingId
            ) {
              setSelectedItem(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className="theme-card w-full max-w-md rounded-2xl border theme-border p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="theme-primary-soft rounded-xl p-3">
                <RotateCcw size={23} />
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                disabled={Boolean(processingId)}
                aria-label="Tutup konfirmasi"
                className="theme-text-muted rounded-lg p-2 transition hover:theme-card-soft disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <h2
              id="dialog-title"
              className="theme-text mt-4 text-xl font-bold"
            >
              Konfirmasi Pengembalian
            </h2>

            <p className="theme-text-secondary mt-2 text-sm leading-6">
              Pastikan buku sudah diterima sebelum kamu memproses
              pengembaliannya.
            </p>

            <div className="theme-card-soft mt-5 space-y-4 rounded-xl border theme-border p-4">
              <div>
                <p className="theme-text-muted text-xs">
                  Judul Buku
                </p>

                <p className="theme-text mt-1 text-sm font-semibold">
                  {selectedItem?.buku?.judul ||
                    selectedItem?.judulBuku ||
                    "Buku tanpa judul"}
                </p>
              </div>

              <div>
                <p className="theme-text-muted text-xs">
                  Peminjam
                </p>

                <p className="theme-text mt-1 text-sm font-medium">
                  {namaPeminjam(selectedItem)}
                </p>
              </div>

              <div>
                <p className="theme-text-muted text-xs">
                  Nomor Peminjaman
                </p>

                <p className="theme-text mt-1 break-all text-sm font-medium">
                  {selectedItem?.nomorPeminjaman || "-"}
                </p>
              </div>

              <div>
                <p className="theme-text-muted text-xs">
                  Tanggal Jatuh Tempo
                </p>

                <p className="theme-text mt-1 text-sm font-medium">
                  {formatTanggal(
                    selectedItem?.tanggalJatuhTempo
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                disabled={Boolean(processingId)}
                className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-4 text-sm font-semibold transition hover:theme-card-soft disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handlePengembalian}
                disabled={Boolean(processingId)}
                className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingId ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Konfirmasi Kembali
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
