"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileBarChart,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  CalendarDays,
  Layers3,
  FileText,
  Filter,
  Download,
  Printer,
} from "lucide-react";
import { getAkunKas, getLaporanKas } from "@/services/jurnalKas.service";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const rupiahPlain = (value) => Number(value) || 0;

function tanggalHariIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}

function awalBulanIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");

  return `${tahun}-${bulan}-01`;
}

function getNumber(object, keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) {
      const value = Number(object[key]);
      if (Number.isFinite(value)) return value;
    }
  }

  return 0;
}

export default function LaporanKasPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [laporan, setLaporan] = useState(null);
  const [dari, setDari] = useState(awalBulanIni);
  const [sampai, setSampai] = useState(tanggalHariIni);
  const [akunKasId, setAkunKasId] = useState("");
  const [akunList, setAkunList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sudahMemuat, setSudahMemuat] = useState(false);

  const loadAkun = useCallback(async () => {
    try {
      const response = await getAkunKas();

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      setAkunList(data);
    } catch (err) {
      console.error("Gagal mengambil akun kas:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!dari || !sampai) {
      setError("Tanggal awal dan tanggal akhir wajib diisi.");
      return;
    }

    if (dari > sampai) {
      setError("Tanggal awal tidak boleh melebihi tanggal akhir.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getLaporanKas({
        dari,
        sampai,
        akunKasId: akunKasId || undefined,
      });

      const data = response?.data ?? response;

      if (data?.success === false || response?.success === false) {
        throw new Error(
          response?.message || data?.message || "Gagal mengambil laporan kas."
        );
      }

      setLaporan(data);
      setSudahMemuat(true);
    } catch (err) {
      setLaporan(null);
      setError(err?.message || "Gagal mengambil laporan kas.");
    } finally {
      setLoading(false);
    }
  }, [dari, sampai, akunKasId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAkun();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAkun]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const totalMasuk = getNumber(laporan, ["totalMasuk"]);
  const totalKeluar = getNumber(laporan, ["totalKeluar"]);
  const saldoAwal = getNumber(laporan, ["saldoAwal"]);
  const saldoAkhir = getNumber(laporan, ["saldoAkhir"]);

  const perKategori = Array.isArray(laporan?.perKategori)
    ? laporan.perKategori
    : [];

  const totalKategori = perKategori.length;

  const totalTransaksi = perKategori.reduce(
    (sum, item) => sum + (Number(item.jumlah) || 0),
    0
  );

  const selisih = totalMasuk - totalKeluar;

  const akunTerpilih = akunList.find(
    (akun) => String(akun.id) === String(akunKasId)
  );

  async function handleSubmit(event) {
    event.preventDefault();
    await loadData();
  }

  const handleReset = () => {
    setDari(awalBulanIni());
    setSampai(tanggalHariIni());
    setAkunKasId("");
    setError("");
  };


  const handleExport = () => {
    if (!laporan && perKategori.length === 0) {
      setError("Tidak ada data laporan untuk diekspor.");
      return;
    }

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const namaAkun = akunTerpilih
      ? akunTerpilih.nama || akunTerpilih.kode
      : "Semua Akun Kas";

    const summaryRows = [
      ["LAPORAN KAS SEKOLAH"],
      ["Periode", `${dari} s.d. ${sampai}`],
      ["Akun Kas", namaAkun],
      ["Dicetak", new Date().toLocaleString("id-ID")],
      [],
      ["RINGKASAN"],
      ["Saldo Awal", rupiahPlain(saldoAwal)],
      ["Total Pemasukan", rupiahPlain(totalMasuk)],
      ["Total Pengeluaran", rupiahPlain(totalKeluar)],
      ["Saldo Akhir", rupiahPlain(saldoAkhir)],
      ["Selisih", rupiahPlain(selisih)],
      [],
    ];

    const kategoriHeaders = [
      "No",
      "Kategori",
      "Jenis",
      "Jumlah Transaksi",
      "Total",
    ];

    const kategoriRows = perKategori.map((item, index) => {
      const jenisMasuk =
        String(item.jenis || "").toLowerCase() === "masuk";

      return [
        index + 1,
        item.kategori || "-",
        jenisMasuk ? "Pemasukan" : "Pengeluaran",
        Number(item.jumlah) || 0,
        rupiahPlain(item.total),
      ];
    });

    const csvLines = [
      ...summaryRows.map((row) => row.map(escapeCsv).join(",")),
      kategoriHeaders.map(escapeCsv).join(","),
      ...kategoriRows.map((row) => row.map(escapeCsv).join(",")),
    ];

    const csv = csvLines.join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const akunSuffix = akunKasId
      ? `_akun-${akunKasId}`
      : "";

    link.href = url;
    link.download = `laporan-kas_${dari}_${sampai}${akunSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="laporanKeuangan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed((previous) => !previous)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="theme-page min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">


              <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="theme-info flex h-12 w-12 items-center justify-center rounded-xl border">
                      <FileBarChart size={23} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                        KEUANGAN SEKOLAH
                      </p>

                      <h1 className="theme-text mt-0.5 text-[25px] font-bold tracking-tight sm:text-[29px]">
                        Laporan Kas
                      </h1>
                    </div>
                  </div>

                  <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-6">
                    Rekap saldo, pemasukan, dan pengeluaran berdasarkan periode
                    yang dipilih.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                 

                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={loading || perKategori.length === 0}
                    className="theme-input inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold disabled:opacity-50"
                  >
                    <Download size={16} />
                    Ekspor CSV
                  </button>

                  <button
                    type="button"
                    onClick={loadData}
                    disabled={loading}
                    className="theme-input inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "animate-spin" : ""}
                    />
                    Muat Ulang
                  </button>
                </div>
              </section>


              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)] p-4 text-sm">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="theme-text font-semibold">
                      Laporan gagal dimuat
                    </p>
                    <p className="theme-text-secondary mt-1 break-words">
                      {error}
                    </p>
                  </div>
                </div>
              )}


              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm print:hidden">
                <div className="theme-border flex items-center gap-2 border-b px-5 py-4">
                  <Filter
                    size={16}
                    className="text-[var(--color-primary)]"
                  />
                  <h2 className="theme-text text-sm font-bold">
                    Filter Laporan
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="akunKasId"
                        className="theme-text-secondary text-xs font-semibold"
                      >
                        Akun Kas
                      </label>
                      <select
                        id="akunKasId"
                        value={akunKasId}
                        onChange={(event) =>
                          setAkunKasId(event.target.value)
                        }
                        className="theme-input h-11 min-w-0 rounded-xl border px-3 text-sm outline-none"
                      >
                        <option value="">Semua akun kas</option>
                        {akunList.map((akun) => (
                          <option key={akun.id} value={akun.id}>
                            {akun.nama || akun.kode || akun.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="tanggalDari"
                        className="theme-text-secondary text-xs font-semibold"
                      >
                        Tanggal Dari
                      </label>
                      <input
                        id="tanggalDari"
                        type="date"
                        value={dari}
                        max={sampai || undefined}
                        onChange={(event) =>
                          setDari(event.target.value)
                        }
                        required
                        className="theme-input h-11 min-w-0 rounded-xl border px-3 text-sm outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="tanggalSampai"
                        className="theme-text-secondary text-xs font-semibold"
                      >
                        Tanggal Sampai
                      </label>
                      <input
                        id="tanggalSampai"
                        type="date"
                        value={sampai}
                        min={dari || undefined}
                        onChange={(event) =>
                          setSampai(event.target.value)
                        }
                        required
                        className="theme-input h-11 min-w-0 rounded-xl border px-3 text-sm outline-none"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="theme-primary inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw
                              size={15}
                              className="animate-spin"
                            />
                            Memuat...
                          </>
                        ) : (
                          <>
                            <CalendarDays size={15} />
                            Terapkan
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="theme-input inline-flex h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold disabled:opacity-50"
                        title="Reset filter"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <p className="theme-text-muted mt-3 text-xs">
                    Periode:{" "}
                    <span className="theme-text font-semibold">
                      {dari}
                    </span>{" "}
                    s.d.{" "}
                    <span className="theme-text font-semibold">
                      {sampai}
                    </span>
                    {akunTerpilih && (
                      <>
                        {" "}· Akun:{" "}
                        <span className="theme-text font-semibold">
                          {akunTerpilih.nama || akunTerpilih.kode}
                        </span>
                      </>
                    )}
                  </p>
                </form>
              </section>


              <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                <MetricCard
                  title="Saldo Awal"
                  value={rupiah(saldoAwal)}
                  icon={Wallet}
                  description="Saldo sebelum periode"
                  tone="primary"
                />

                <MetricCard
                  title="Total Pemasukan"
                  value={rupiah(totalMasuk)}
                  icon={TrendingUp}
                  description="Akumulasi pemasukan"
                  tone="success"
                />

                <MetricCard
                  title="Total Pengeluaran"
                  value={rupiah(totalKeluar)}
                  icon={TrendingDown}
                  description="Akumulasi pengeluaran"
                  tone="danger"
                />

                <MetricCard
                  title="Saldo Akhir"
                  value={rupiah(saldoAkhir)}
                  icon={Wallet}
                  description="Saldo setelah periode"
                  tone="info"
                />

                <MetricCard
                  title="Selisih"
                  value={rupiah(selisih)}
                  icon={TrendingUp}
                  description="Masuk dikurangi keluar"
                  tone={selisih >= 0 ? "success" : "danger"}
                />

                <MetricCard
                  title="Kategori"
                  value={totalKategori}
                  icon={Layers3}
                  description={`${totalTransaksi} transaksi tercatat`}
                  tone="primary"
                />
              </section>


              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="theme-info flex h-8 w-8 items-center justify-center rounded-lg border">
                        <FileText size={15} />
                      </div>
                      <h2 className="theme-text text-sm font-bold">
                        Rincian per Kategori
                      </h2>
                    </div>

                    <p className="theme-text-muted ml-10 mt-1 text-xs">
                      Periode {dari} sampai {sampai}
                      {akunTerpilih && (
                        <> · {akunTerpilih.nama || akunTerpilih.kode}</>
                      )}
                    </p>
                  </div>

                  <span className="theme-text-muted text-xs">
                    {perKategori.length} kategori
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="theme-table-header">
                      <tr className="theme-border border-b">
                        <th className="w-14 whitespace-nowrap px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.1em]">
                          No
                        </th>
                        <th className="whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em]">
                          Kategori
                        </th>
                        <th className="whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em]">
                          Jenis
                        </th>
                        <th className="whitespace-nowrap px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.1em]">
                          Jumlah Transaksi
                        </th>
                        <th className="whitespace-nowrap px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.1em]">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <RefreshCw
                              size={22}
                              className="mx-auto animate-spin text-[var(--color-primary)]"
                            />
                            <p className="theme-text-muted mt-3 text-sm">
                              Memuat laporan...
                            </p>
                          </td>
                        </tr>
                      ) : perKategori.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <FileBarChart
                              size={28}
                              className="theme-text-muted mx-auto"
                            />
                            <p className="theme-text mt-3 text-sm font-semibold">
                              {sudahMemuat && !error
                                ? "Belum ada transaksi"
                                : "Pilih periode lalu tampilkan laporan"}
                            </p>
                            <p className="theme-text-muted mt-1 text-xs">
                              {sudahMemuat && !error
                                ? "Tidak ada transaksi pada periode ini."
                                : "Gunakan filter di atas untuk menampilkan data."}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        perKategori.map((item, index) => {
                          const jenisMasuk =
                            String(item.jenis || "").toLowerCase() ===
                            "masuk";

                          return (
                            <tr
                              key={`${item.kategori}-${item.jenis}-${index}`}
                              className="theme-table-hover transition"
                            >
                              <td className="px-4 py-4 text-center text-xs font-semibold tabular-nums theme-text-secondary">
                                {index + 1}
                              </td>

                              <td className="px-4 py-4">
                                <p className="theme-text text-sm font-semibold">
                                  {item.kategori || "-"}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    whitespace-nowrap
                                    rounded-md
                                    px-2
                                    py-1
                                    text-[10px]
                                    font-bold
                                    ${
                                      jenisMasuk
                                        ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
                                        : "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]"
                                    }
                                  `}
                                >
                                  {jenisMasuk ? (
                                    <TrendingUp size={11} />
                                  ) : (
                                    <TrendingDown size={11} />
                                  )}
                                  {jenisMasuk ? "Pemasukan" : "Pengeluaran"}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-right text-xs tabular-nums theme-text-secondary">
                                {Number(item.jumlah) || 0}
                              </td>

                              <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold tabular-nums theme-text">
                                {rupiah(item.total)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="h-8" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  tone = "primary",
}) {
  const toneMap = {
    primary: {
      surface: "bg-[var(--color-primary-background)]",
      text: "text-[var(--color-primary)]",
    },
    success: {
      surface: "bg-[var(--color-success-background)]",
      text: "text-[var(--color-success)]",
    },
    warning: {
      surface: "bg-[var(--color-warning-background)]",
      text: "text-[var(--color-warning)]",
    },
    danger: {
      surface: "bg-[var(--color-danger-background)]",
      text: "text-[var(--color-danger)]",
    },
    info: {
      surface: "bg-[var(--color-info-background)]",
      text: "text-[var(--color-info)]",
    },
  };

  const current = toneMap[tone] || toneMap.primary;

  return (
    <div className="theme-card rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-secondary text-xs font-semibold">
            {title}
          </p>
          <p className="theme-text mt-2 truncate text-xl font-bold tabular-nums sm:text-2xl">
            {value}
          </p>
          <p className="theme-text-muted mt-2 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`
            ${current.surface}
            ${current.text}
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
          `}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}