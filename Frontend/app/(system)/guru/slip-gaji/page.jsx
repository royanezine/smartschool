
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  WalletCards,
  CalendarDays,
  Clock3,
  BriefcaseBusiness,
  Search,
  RefreshCw,
  Printer,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Building2,
  UserRound,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import { getSlipGajiSaya } from "@/services/penggajian.service";

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const STATUS_CONFIG = {
  dibekukan: {
    label: "Dibekukan",
    className: "theme-warning",
  },
  disetujui: {
    label: "Disetujui",
    className: "theme-success",
  },
  dibayar: {
    label: "Dibayar",
    className: "theme-info",
  },
};

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatJam(value) {
  return `${Number(value || 0).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })} jam`;
}

function unwrapSlipResponse(response) {
  let value = response;

  for (let i = 0; i < 5; i += 1) {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    if (Array.isArray(value.data)) {
      return value.data;
    }

    if (Array.isArray(value.items)) {
      return value.items;
    }

    if (value.data && typeof value.data === "object") {
      value = value.data;
      continue;
    }

    return [];
  }

  return Array.isArray(value) ? value : [];
}

function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();

  const config = STATUS_CONFIG[key] || {
    label: status || "Belum tersedia",
    className: "theme-card-soft theme-text-secondary",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon, loading }) {
  return (
    <div className="theme-card rounded-2xl border p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-xs font-medium">{title}</p>

          {loading ? (
            <div className="theme-card-soft mt-3 h-7 w-24 animate-pulse rounded-lg" />
          ) : (
            <p className="theme-text mt-2 break-words text-xl font-bold sm:text-2xl">
              {value}
            </p>
          )}

          <p className="theme-text-placeholder mt-1 text-[11px]">
            {description}
          </p>
        </div>

        <div className="theme-card-soft theme-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
          <Icon size={18} className="theme-text-secondary" />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="theme-card-soft theme-border rounded-xl border p-3">
      <div className="flex items-start gap-2.5">
        <div className="theme-card theme-border flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
          <Icon size={14} className="theme-text-muted" />
        </div>

        <div className="min-w-0">
          <p className="theme-text-placeholder text-[10px] font-semibold uppercase tracking-wide">
            {label}
          </p>

          <p className="theme-text-secondary mt-1 break-words text-xs font-semibold">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SlipGajiPage() {
  const today = new Date();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [slips, setSlips] = useState([]);
  const [bulan, setBulan] = useState(String(today.getMonth() + 1));
  const [tahun, setTahun] = useState(String(today.getFullYear()));
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadSlips = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await getSlipGajiSaya({
        bulan: Number(bulan),
        tahun: Number(tahun),
      });

      const data = unwrapSlipResponse(response);

      setSlips(data);
    } catch (err) {
      console.error("Gagal memuat slip gaji:", err);

      setSlips([]);
      setError(err?.message || "Gagal mengambil data slip gaji.");
    } finally {
      setLoading(false);
    }
  }, [bulan, tahun]);

  useEffect(() => {
    loadSlips();
  }, [loadSlips]);

  // Tutup detail saat periode berubah agar tidak menampilkan
  // slip dari periode sebelumnya.
  useEffect(() => {
    setSelected(null);
    setDetailOpen(false);
  }, [bulan, tahun]);

  const filteredSlips = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return slips.filter((item) => {
      const nomorBulan = Number(item.bulan || 1);
      const namaBulan = BULAN[nomorBulan - 1] || "";
      const period = `${namaBulan} ${item.tahun || ""}`;
      const status = String(item.status || "").toLowerCase();

      return (
        !keyword ||
        period.toLowerCase().includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [slips, search]);

  // Detail hanya muncul setelah pengguna menekan tombol Lihat.
  const selectedSlip = detailOpen ? selected : null;

  const totalGaji = filteredSlips.reduce(
    (total, item) => total + (Number(item.totalGaji) || 0),
    0
  );

  const totalJamKerja = filteredSlips.reduce(
    (total, item) => total + (Number(item.totalJamKerja) || 0),
    0
  );

  const handlePrint = () => {
    if (!selectedSlip) {
      setError("Pilih slip gaji yang ingin dicetak terlebih dahulu.");
      return;
    }

    setError("");
    window.print();
  };

  const handleSelectSlip = (item) => {
    setSelected(item);
    setDetailOpen(true);
    setError("");
    setNotice("");
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelected(null);
  };

  const namaPegawai =
    selectedSlip?.pengguna?.namaLengkap || "Pegawai";

  const namaSekolah =
    selectedSlip?.sekolah?.nama || "Sekolah";

  const nomorBulanTerpilih = Number(bulan);
  const periodeTerpilih =
    `${BULAN[nomorBulanTerpilih - 1] || "-"} ${tahun}`;

  const periode = selectedSlip
    ? `${BULAN[Number(selectedSlip.bulan || 1) - 1] || "-"} ${selectedSlip.tahun || "-"}`
    : periodeTerpilih;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <div className="print:hidden">
        <Sidebar
          role="guru"
          activeMenu="slip-gaji"
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((value) => !value)}
        />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="print:hidden">
          <Header
            title="Slip Gaji"
            onMenuClick={() => setSidebarOpen((value) => !value)}
          />
        </div>

        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6 lg:p-8 print:p-0">
            {/* Header halaman */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
              <div className="flex items-center gap-3">
                <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <WalletCards size={20} />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Slip Gaji
                  </h1>

                  <p className="theme-text-secondary mt-1 text-xs sm:text-sm">
                    Lihat rincian penggajian berdasarkan periode.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                disabled={!selectedSlip || loading}
                className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                <Printer size={16} />
                Cetak Slip
              </button>
            </div>

            {/* Notifikasi */}
            {(error || notice) && (
              <div
                className={`print:hidden flex items-start gap-3 rounded-xl border p-4 ${
                  error ? "theme-danger" : "theme-success"
                }`}
              >
                {error ? (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                )}

                <p className="flex-1 text-sm">{error || notice}</p>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setNotice("");
                  }}
                  aria-label="Tutup notifikasi"
                  className="hover:opacity-70"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* Filter periode */}
            <section className="theme-card rounded-2xl border p-4 shadow-sm sm:p-5 print:hidden">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="theme-text-placeholder text-[10px] font-semibold uppercase tracking-wide">
                    Periode Slip Gaji
                  </p>

                  <p className="theme-text mt-2 text-sm font-bold">
                    {periodeTerpilih}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <select
                    value={bulan}
                    onChange={(event) => setBulan(event.target.value)}
                    className="theme-input h-11 min-w-[150px] rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    {BULAN.map((nama, index) => (
                      <option key={nama} value={String(index + 1)}>
                        {nama}
                      </option>
                    ))}
                  </select>

                  <select
                    value={tahun}
                    onChange={(event) => setTahun(event.target.value)}
                    className="theme-input h-11 min-w-[100px] rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    {Array.from(
                      { length: 6 },
                      (_, index) => today.getFullYear() - 2 + index
                    ).map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={loadSlips}
                    disabled={loading}
                    className="theme-card-soft theme-text-secondary theme-border inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={15}
                      className={loading ? "animate-spin" : ""}
                    />
                    Muat Ulang
                  </button>
                </div>
              </div>
            </section>

            {/* Statistik */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 print:hidden">
              <StatCard
                title="Total Gaji Periode"
                value={rupiah(totalGaji)}
                description="Total slip pada periode terpilih"
                icon={WalletCards}
                loading={loading}
              />

              <StatCard
                title="Total Jam Kerja"
                value={formatJam(totalJamKerja)}
                description="Akumulasi jam kerja pada slip"
                icon={Clock3}
                loading={loading}
              />

              <StatCard
                title="Jumlah Slip"
                value={filteredSlips.length}
                description="Slip yang tersedia pada periode ini"
                icon={FileText}
                loading={loading}
              />
            </div>

            {/* Riwayat slip */}
            <section className="theme-card overflow-hidden rounded-2xl border shadow-sm print:hidden">
              <div className="theme-border flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <h2 className="theme-text text-sm font-bold">
                    Riwayat Slip Gaji
                  </h2>

                  <p className="theme-text-muted mt-1 text-xs">
                    Slip yang sudah tersedia sesuai status dari backend.
                  </p>
                </div>

                {loading && (
                  <span className="theme-text-secondary flex items-center gap-2 text-xs">
                    <Loader2 size={14} className="animate-spin" />
                    Memuat data...
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search
                    size={16}
                    className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari periode atau status..."
                    className="theme-input h-11 w-full rounded-xl border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-sm">
                  <thead>
                    <tr className="theme-primary">
                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Periode
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Total Jam Kerja
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Total Gaji
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-center text-xs font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr
                          key={index}
                          className="theme-border border-b"
                        >
                          {Array.from({ length: 5 }).map((__, cell) => (
                            <td key={cell} className="px-4 py-4">
                              <div className="theme-card-soft h-4 w-24 animate-pulse rounded" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredSlips.length > 0 ? (
                      filteredSlips.map((item, index) => (
                        <tr
                          key={
                            item.id ||
                            `${item.bulan}-${item.tahun}-${index}`
                          }
                          className="theme-border theme-table-hover border-b transition-colors"
                        >
                          <td className="px-4 py-4">
                            <p className="theme-text font-semibold">
                              {BULAN[Number(item.bulan || 1) - 1] || "-"}{" "}
                              {item.tahun || "-"}
                            </p>
                          </td>

                          <td className="theme-text-secondary px-4 py-4 text-xs">
                            {formatJam(item.totalJamKerja)}
                          </td>

                          <td className="theme-text px-4 py-4 text-xs font-bold">
                            {rupiah(item.totalGaji)}
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleSelectSlip(item)}
                              className="theme-card-soft theme-text-secondary theme-border inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition hover:opacity-80"
                            >
                              <Eye size={14} />
                              Lihat
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-14 text-center">
                          <div className="theme-card-soft mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <FileText
                              size={21}
                              className="theme-text-muted"
                            />
                          </div>

                          <p className="theme-text mt-3 text-sm font-bold">
                            {error
                              ? "Data slip gaji gagal dimuat"
                              : "Slip gaji belum tersedia"}
                          </p>

                          <p className="theme-text-secondary mt-1 text-xs">
                            {error
                              ? "Periksa koneksi dan akses akun, lalu coba muat ulang."
                              : "Pastikan periode yang dipilih benar dan slip telah diproses sesuai ketentuan backend."}
                          </p>

                          {error && (
                            <button
                              type="button"
                              onClick={loadSlips}
                              disabled={loading}
                              className="theme-primary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-50"
                            >
                              <RefreshCw size={14} />
                              Coba Lagi
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Detail slip yang dipilih */}
            {selectedSlip && (
              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
                <div className="theme-border flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
                  <div className="flex items-start gap-3">
                    <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl print:hidden">
                      <FileText size={20} />
                    </div>

                    <div>
                      <p className="theme-text-placeholder text-[10px] font-semibold uppercase tracking-wider">
                        Slip Penggajian
                      </p>

                      <h2 className="theme-text mt-1 text-lg font-bold">
                        {namaSekolah}
                      </h2>

                      <p className="theme-text-secondary mt-1 text-xs">
                        Periode {periode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedSlip.status} />

                    <button
                      type="button"
                      onClick={handleCloseDetail}
                      className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg hover:opacity-70 print:hidden"
                      aria-label="Tutup detail slip"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-7">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailItem
                      icon={UserRound}
                      label="Nama Pegawai"
                      value={namaPegawai}
                    />

                    <DetailItem
                      icon={BriefcaseBusiness}
                      label="Kategori Jabatan"
                      value={
                        selectedSlip.pengguna?.kategoriJabatan?.nama
                      }
                    />

                    <DetailItem
                      icon={FileText}
                      label="Nomor Induk Pegawai"
                      value={selectedSlip.pengguna?.nip}
                    />

                    <DetailItem
                      icon={CalendarDays}
                      label="Periode Penggajian"
                      value={periode}
                    />
                  </div>

                  <div className="theme-border rounded-xl border p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <WalletCards
                        size={17}
                        className="theme-text-secondary"
                      />

                      <h3 className="theme-text text-sm font-bold">
                        Rincian Penghasilan
                      </h3>
                    </div>

                    <div className="theme-border flex items-center justify-between gap-3 border-b py-3">
                      <span className="theme-text-secondary text-sm">
                        Total jam kerja
                      </span>

                      <span className="theme-text text-sm font-semibold">
                        {formatJam(selectedSlip.totalJamKerja)}
                      </span>
                    </div>

                    <div className="theme-border flex items-center justify-between gap-3 border-b py-3">
                      <span className="theme-text-secondary text-sm">
                        Periode
                      </span>

                      <span className="theme-text text-sm font-semibold">
                        {periode}
                      </span>
                    </div>

                    <div className="theme-info mt-4 flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="theme-text-secondary text-xs font-semibold">
                          Total Gaji
                        </p>

                        <p className="theme-text-placeholder mt-1 text-[10px]">
                          Berdasarkan nominal yang dikembalikan backend
                        </p>
                      </div>

                      <p className="theme-text text-xl font-bold sm:text-2xl">
                        {rupiah(selectedSlip.totalGaji)}
                      </p>
                    </div>
                  </div>

                  <div className="theme-card-soft theme-border rounded-xl border p-4">
                    <div className="flex items-start gap-3">
                      <Building2
                        size={17}
                        className="theme-text-secondary mt-0.5"
                      />

                      <div>
                        <p className="theme-text text-xs font-bold">
                          Informasi Sekolah
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs">
                          {selectedSlip.sekolah?.alamat ||
                            "Alamat sekolah tidak tersedia."}
                        </p>

                        {selectedSlip.sekolah?.telepon && (
                          <p className="theme-text-secondary mt-1 text-xs">
                            Telepon: {selectedSlip.sekolah.telepon}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="theme-text-muted text-[10px] leading-relaxed">
                    Dokumen ini menampilkan data penggajian yang tersedia
                    dari sistem. Jika terdapat perbedaan nominal atau
                    informasi, hubungi administrator sekolah.
                  </div>

                  <div className="flex justify-end print:hidden">
                    <button
                      type="button"
                      onClick={handlePrint}
                      disabled={loading}
                      className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Printer size={15} />
                      Cetak Slip Ini
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: #111827 !important;
          }

          body * {
            visibility: hidden !important;
          }

          .theme-page,
          .theme-page * {
            visibility: visible !important;
          }

          .theme-page {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: #111827 !important;
          }

          .theme-page > div,
          main {
            overflow: visible !important;
          }

          main {
            height: auto !important;
          }

          .theme-card,
          .theme-card-soft,
          .theme-info {
            background: white !important;
            color: #111827 !important;
            box-shadow: none !important;
          }

          .theme-text,
          .theme-text-secondary,
          .theme-text-muted,
          .theme-text-placeholder {
            color: #111827 !important;
          }

          .theme-border {
            border-color: #d1d5db !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}
