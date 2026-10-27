"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getAkunKas,
  getJurnalKas,
  getLaporanKas,
  createJurnalKas,
} from "@/services/jurnalKas.service";
import {
  getRingkasanTagihan,
  getTunggakan,
} from "@/services/tagihan.service";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Search,
  RefreshCw,
  Download,
  Plus,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Printer,
  Loader2,
} from "lucide-react";


const themeCardShadow =
  "shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";


function formatRupiah(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}


function formatKategori(value) {
  return String(value || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function todayISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function awalBulanIni() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function isSameMonth(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) return error.message;
  return `Gagal memuat ${fallback}.`;
}

function formatRupiahOrUnavailable(value) {
  return value === null || value === undefined
    ? "Tidak tersedia"
    : formatRupiah(value);
}

function formatNumberOrUnavailable(value) {
  return value === null || value === undefined
    ? "Tidak tersedia"
    : Number(value).toLocaleString("id-ID");
}


export default function KeuanganPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [kategoriFilter, setKategoriFilter] = useState("semua");
  const [bulanIniOnly, setBulanIniOnly] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 5;

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState("pemasukan");
  const [form, setForm] = useState({
    tanggal: todayISO(),
    kategori: "",
    jumlah: "",
    keterangan: "",
    akunKasId: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [akunKas, setAkunKas] = useState([]);
  const [akunTotalSaldo, setAkunTotalSaldo] = useState(null);

  const [jurnal, setJurnal] = useState([]);
  const [jurnalRingkasan, setJurnalRingkasan] = useState(null);
  const [jurnalTotal, setJurnalTotal] = useState(null);

  const [tagihanRingkasan, setTagihanRingkasan] = useState(null);
  const [tunggakanRingkasan, setTunggakanRingkasan] = useState(null);
  const [bulanIni, setBulanIni] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getAkunKas(),
        getJurnalKas({ page: 1, limit: 100 }),
        getRingkasanTagihan(),
        getTunggakan({ page: 1, limit: 1 }),
        getLaporanKas({
          dari: awalBulanIni(),
          sampai: todayISO(),
        }),
      ]);

      if (!active) return;

      const messages = [];
      const [akunRes, jurnalRes, tagihanRes, tunggakanRes, bulanRes] =
        results;

      if (akunRes.status === "fulfilled") {
        setAkunKas(akunRes.value.data || []);
        setAkunTotalSaldo(
          akunRes.value.ringkasan?.totalSaldo === undefined ||
            akunRes.value.ringkasan?.totalSaldo === null
            ? null
            : Number(akunRes.value.ringkasan.totalSaldo)
        );
      } else {
        setAkunKas([]);
        setAkunTotalSaldo(null);
        messages.push(getErrorMessage(akunRes.reason, "akun kas"));
      }

      if (jurnalRes.status === "fulfilled") {
        setJurnal(jurnalRes.value.data || []);
        setJurnalRingkasan(jurnalRes.value.ringkasan || null);
        setJurnalTotal(
          typeof jurnalRes.value.meta?.total === "number"
            ? jurnalRes.value.meta.total
            : null
        );
      } else {
        setJurnal([]);
        setJurnalRingkasan(null);
        setJurnalTotal(null);
        messages.push(getErrorMessage(jurnalRes.reason, "jurnal kas"));
      }

      if (tagihanRes.status === "fulfilled") {
        setTagihanRingkasan(tagihanRes.value.data || null);
      } else {
        setTagihanRingkasan(null);
        messages.push(getErrorMessage(tagihanRes.reason, "ringkasan tagihan"));
      }

      if (tunggakanRes.status === "fulfilled") {
        setTunggakanRingkasan(tunggakanRes.value.ringkasan || null);
      } else {
        setTunggakanRingkasan(null);
        messages.push(getErrorMessage(tunggakanRes.reason, "tunggakan"));
      }

      if (bulanRes.status === "fulfilled") {
        setBulanIni(bulanRes.value.data || null);
      } else {
        setBulanIni(null);
        messages.push(getErrorMessage(bulanRes.reason, "laporan bulan ini"));
      }

      setError(messages.join(" "));
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const transactions = useMemo(
    () =>
      jurnal.map((item) => ({
        id: item.id,
        tanggal: item.tanggal,
        nomor: item.nomorJurnal || "-",
        kategori: formatKategori(item.kategori),
        kategoriKey: item.kategori,
        keterangan: item.keterangan || "-",
        jenis: item.jenis === "masuk" ? "pemasukan" : "pengeluaran",
        jumlah: Number(item.jumlah) || 0,
        status: item.status || "aktif",
        akun: item.akunKas?.nama || "-",
        sumber: item.sumber || "-",
      })),
    [jurnal]
  );

  const kategoriOptions = useMemo(() => {
    const map = new Map();

    transactions.forEach((item) => {
      if (item.kategoriKey) {
        map.set(item.kategoriKey, item.kategori);
      }
    });

    return [...map.entries()].map(([value, label]) => ({
      value,
      label,
    }));
  }, [transactions]);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchSearch =
        !keyword ||
        item.keterangan.toLowerCase().includes(keyword) ||
        item.nomor.toLowerCase().includes(keyword);

      const matchJenis =
        jenisFilter === "semua" || item.jenis === jenisFilter;

      const matchKategori =
        kategoriFilter === "semua" ||
        item.kategoriKey === kategoriFilter;

      const matchBulan = !bulanIniOnly || isSameMonth(item.tanggal);

      return matchSearch && matchJenis && matchKategori && matchBulan;
    });
  }, [transactions, search, jenisFilter, kategoriFilter, bulanIniOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const activeAkun = useMemo(
    () =>
      akunKas.filter(
        (akun) => (akun.status || "aktif") === "aktif"
      ),
    [akunKas]
  );

  const saldoAkhir = akunTotalSaldo;
  const totalMasuk =
    jurnalRingkasan === null
      ? null
      : Number(jurnalRingkasan.totalMasuk || 0);
  const totalKeluar =
    jurnalRingkasan === null
      ? null
      : Number(jurnalRingkasan.totalKeluar || 0);
  const pemasukanBulanIni =
    bulanIni === null ? null : Number(bulanIni.totalMasuk || 0);
  const pengeluaranBulanIni =
    bulanIni === null ? null : Number(bulanIni.totalKeluar || 0);

  const openDetail = (item) => {
    setSelectedTransaksi(item);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedTransaksi(null);
  };

  const openForm = (type) => {
    setFormType(type);
    setFormError("");
    setForm({
      tanggal: todayISO(),
      kategori: "",
      jumlah: "",
      keterangan: "",
      akunKasId: activeAkun[0]?.id || "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError("");
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError("");
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.akunKasId) {
      setFormError("Pilih akun kas terlebih dahulu.");
      return;
    }

    if (!form.tanggal) {
      setFormError("Tanggal transaksi wajib diisi.");
      return;
    }

    if (!form.kategori.trim()) {
      setFormError("Kategori transaksi wajib diisi.");
      return;
    }

    if (!form.jumlah || Number(form.jumlah) <= 0) {
      setFormError("Jumlah transaksi harus lebih dari 0.");
      return;
    }

    setSaving(true);

    try {
      const response = await createJurnalKas({
        akunKasId: form.akunKasId,
        tanggal: form.tanggal,
        jenis: formType === "pemasukan" ? "masuk" : "keluar",
        kategori: form.kategori.trim(),
        jumlah: Number(form.jumlah),
        keterangan: form.keterangan.trim() || undefined,
      });

      if (response?.success === false) {
        throw new Error(response.message || "Transaksi gagal disimpan.");
      }

      closeForm();
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setFormError(getErrorMessage(err, "transaksi"));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (filteredData.length === 0) return;

    const headers = [
      "Tanggal",
      "Nomor Jurnal",
      "Kategori",
      "Keterangan",
      "Akun Kas",
      "Jenis",
      "Jumlah",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      item.tanggal,
      item.nomor,
      item.kategori,
      item.keterangan,
      item.akun,
      item.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran",
      item.jumlah,
      item.status,
    ]);

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "keuangan-smartschool.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toggleSidebar = () => setIsCollapsed((v) => !v);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="keuangan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Bendahara Sekolah",
              email: "bendahara@smartschool.com",
              avatar: "BD",
            }}
          />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-5 p-4 sm:p-6 lg:p-8">


            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_70%,var(--color-info)))] text-[var(--color-card)] shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]">
                  <Wallet size={20} />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                    Keuangan / Bendahara
                  </p>

                  <h1 className="mt-0.5 text-xl font-bold theme-text sm:text-2xl">
                    Manajemen Keuangan
                  </h1>

                  <p className="mt-1 text-xs leading-relaxed theme-text-secondary sm:text-sm">
                    Kelola pemasukan, pengeluaran, dan laporan keuangan sekolah.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Download size={15} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => openForm("pengeluaran")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 text-sm font-semibold text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_18%,transparent)]"
                >
                  <ArrowUpCircle size={15} />
                  Pengeluaran
                </button>

                <button
                  type="button"
                  onClick={() => openForm("pemasukan")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_75%,var(--color-success)))] px-4 text-sm font-semibold text-[var(--color-card)] shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] transition hover:opacity-90"
                >
                  <Plus size={15} />
                  Pemasukan
                </button>
              </div>
            </div>


            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)] p-4 text-sm">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold theme-text">
                    Sebagian data gagal dimuat
                  </p>
                  <p className="mt-1 break-words theme-text-secondary">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold theme-text-secondary"
                >
                  <RefreshCw size={13} />
                  Coba lagi
                </button>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 rounded-xl border theme-border theme-card p-4 text-sm theme-text-muted">
                <Loader2 size={16} className="animate-spin" />
                Memuat data keuangan dari server...
              </div>
            )}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard
                icon={Wallet}
                label="Saldo Akhir"
                value={formatRupiahOrUnavailable(saldoAkhir)}
                description="Saldo semua akun kas"
                accent="primary"
              />

              <StatCard
                icon={TrendingUp}
                label="Total Pemasukan"
                value={formatRupiahOrUnavailable(totalMasuk)}
                description="Ringkasan jurnal kas"
                accent="success"
              />

              <StatCard
                icon={TrendingDown}
                label="Total Pengeluaran"
                value={formatRupiahOrUnavailable(totalKeluar)}
                description="Ringkasan jurnal kas"
                accent="danger"
              />

              <StatCard
                icon={Receipt}
                label="Jumlah Transaksi"
                value={formatNumberOrUnavailable(jurnalTotal)}
                description="Total jurnal tercatat"
                accent="info"
              />

              <StatCard
                icon={ArrowDownCircle}
                label="Pemasukan Bulan Ini"
                value={formatRupiahOrUnavailable(pemasukanBulanIni)}
                description="Dari laporan kas periode ini"
                accent="success"
              />

              <StatCard
                icon={ArrowUpCircle}
                label="Pengeluaran Bulan Ini"
                value={formatRupiahOrUnavailable(pengeluaranBulanIni)}
                description="Dari laporan kas periode ini"
                accent="warning"
              />
            </section>


            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {akunKas.map((akun) => {
                const isBank = akun.tipe === "bank";

                return (
                  <div
                    key={akun.id}
                    className={`group relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card p-4 ${themeCardShadow} transition hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-0.5 ${
                        isBank
                          ? "bg-[var(--color-info)]"
                          : "bg-[var(--color-primary)]"
                      }`}
                    />

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            isBank
                              ? "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]"
                              : `${themePrimarySurface} ${themePrimaryText}`
                          }`}
                        >
                          {isBank ? (
                            <CreditCard size={18} />
                          ) : (
                            <Wallet size={18} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold theme-text">
                            {akun.nama}
                          </p>

                          <p className="mt-0.5 text-xs theme-text-muted">
                            {akun.kode} •{" "}
                            {isBank ? "Bank" : "Kas tunai"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-3 border-t ${themeDivider} pt-3`}>
                      <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                        Saldo
                      </p>

                      <p className="mt-1 text-lg font-bold theme-text">
                        {formatRupiah(akun.saldo)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {!loading && akunKas.length === 0 && (
                <div
                  className={`flex items-center justify-center rounded-2xl border border-dashed ${themeNeutralBorder} p-4`}
                >
                  <p className="text-center text-xs theme-text-muted">
                    Belum ada akun kas yang dapat ditampilkan.
                  </p>
                </div>
              )}

              <Link
                href="/admin/keuangan/akunKas/tambah"
                className={`flex items-center justify-center rounded-2xl border border-dashed ${themeNeutralBorder} p-4 transition ${themeNeutralHover} hover:border-[var(--color-primary)]`}
              >
                <div className="text-center">
                  <div
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySurface} ${themePrimaryText}`}
                  >
                    <Plus size={18} />
                  </div>

                  <p className="mt-2 text-xs font-semibold theme-text-secondary">
                    Tambah Akun
                  </p>
                </div>
              </Link>
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div
                className={`rounded-2xl border ${themeNeutralBorder} theme-card p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySurface} ${themePrimaryText}`}
                  >
                    <FileText size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Ringkasan Tagihan Siswa
                    </h3>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Agregat seluruh tagihan yang tercatat.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {tagihanRingkasan ? (
                    <>
                      <ReportRow
                        label="Jumlah Tagihan"
                        value={Number(
                          tagihanRingkasan.jumlahTagihan || 0
                        ).toLocaleString("id-ID")}
                        variant="neutral"
                      />
                      <ReportRow
                        label="Total Tagihan"
                        value={formatRupiah(
                          tagihanRingkasan.totalTagihan
                        )}
                        variant="neutral"
                      />
                      <ReportRow
                        label="Total Dibayar"
                        value={formatRupiah(
                          tagihanRingkasan.totalDibayar
                        )}
                        variant="success"
                      />
                      <ReportRow
                        label="Sisa Tagihan"
                        value={formatRupiah(
                          tagihanRingkasan.totalSisa
                        )}
                        variant="danger"
                      />
                    </>
                  ) : (
                    <p className="text-sm theme-text-muted">
                      Tidak tersedia.
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`rounded-2xl border ${themeNeutralBorder} theme-card p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]">
                    <AlertCircle size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Ringkasan Tunggakan
                    </h3>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Tagihan yang sudah melewati jatuh tempo.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {tunggakanRingkasan ? (
                    <>
                      <ReportRow
                        label="Jumlah Tagihan Menunggak"
                        value={Number(
                          tunggakanRingkasan.jumlahTagihan || 0
                        ).toLocaleString("id-ID")}
                        variant="neutral"
                      />
                      <ReportRow
                        label="Total Tunggakan"
                        value={formatRupiah(
                          tunggakanRingkasan.totalTunggakan
                        )}
                        variant="danger"
                        bold
                      />
                    </>
                  ) : (
                    <p className="text-sm theme-text-muted">
                      Tidak tersedia.
                    </p>
                  )}
                </div>
              </div>
            </section>


            <section
              className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
            >
              <div
                className={`flex flex-col gap-4 border-b ${themeDivider} p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}
              >
                <div>
                  <h2 className="text-sm font-bold theme-text sm:text-base">
                    Riwayat Transaksi
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Daftar pemasukan dan pengeluaran terbaru.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBulanIniOnly((value) => !value);
                      setPage(1);
                    }}
                    aria-pressed={bulanIniOnly}
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                      bulanIniOnly
                        ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)]"
                        : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                    }`}
                  >
                    <Calendar size={14} />
                    Bulan Ini
                  </button>

                  <button
                    type="button"
                    onClick={() => setRefreshKey((value) => value + 1)}
                    disabled={loading}
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <RefreshCw
                      size={14}
                      className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              <div
                className={`flex flex-col gap-3 border-b ${themeDivider} p-4 sm:flex-row sm:items-center`}
              >
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari nomor transaksi atau keterangan..."
                    className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-card pl-9 pr-3 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Filter
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <select
                      value={jenisFilter}
                      onChange={(e) => {
                        setJenisFilter(e.target.value);
                        setPage(1);
                      }}
                      className={`h-10 cursor-pointer appearance-none rounded-xl border ${themeNeutralBorder} theme-card pl-9 pr-8 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                    >
                      <option value="semua">Semua Jenis</option>
                      <option value="pemasukan">Pemasukan</option>
                      <option value="pengeluaran">Pengeluaran</option>
                    </select>
                  </div>

                  <select
                    value={kategoriFilter}
                    onChange={(e) => {
                      setKategoriFilter(e.target.value);
                      setPage(1);
                    }}
                    className={`h-10 cursor-pointer rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                  >
                    <option value="semua">Semua Kategori</option>
                    {kategoriOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                    >
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Nomor
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Keterangan
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-14 text-center">
                          <Loader2
                            size={24}
                            className="mx-auto animate-spin text-[var(--color-primary)]"
                          />
                          <p className="mt-3 text-sm font-semibold theme-text">
                            Memuat transaksi
                          </p>
                          <p className="mt-1 text-xs theme-text-muted">
                            Mengambil data jurnal kas dari server.
                          </p>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-14 text-center">
                          <div
                            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themeNeutralSurface}`}
                          >
                            <Receipt
                              size={20}
                              className="theme-text-muted"
                            />
                          </div>

                          <p className="mt-3 text-sm font-semibold theme-text">
                            Tidak ada transaksi
                          </p>

                          <p className="mt-1 text-xs theme-text-muted">
                            Coba ubah filter atau kata kunci pencarian.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => {
                        const isPemasukan =
                          item.jenis === "pemasukan";

                        return (
                          <tr
                            key={item.id}
                            className={`border-b ${themeDivider} transition ${themeNeutralHover}`}
                          >
                            <td className="px-4 py-3 text-xs theme-text-secondary">
                              {formatTanggal(item.tanggal)}
                            </td>

                            <td className="px-4 py-3 text-xs font-medium theme-text">
                              {item.nomor}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${getKategoriStyle(
                                  item.kategori
                                )}`}
                              >
                                {item.kategori}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-xs theme-text-secondary">
                              {item.keterangan}
                            </td>

                            <td
                              className={`px-4 py-3 text-right text-xs font-bold ${
                                isPemasukan
                                  ? "text-[var(--color-success)]"
                                  : "text-[var(--color-danger)]"
                              }`}
                            >
                              {isPemasukan ? "+" : "-"}
                              {formatRupiah(item.jumlah)}
                            </td>

                            <td className="px-4 py-3">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => openDetail(item)}
                                title="Lihat detail"
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-card theme-text-muted transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className={`flex flex-col gap-3 border-t ${themeDivider} px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
              >
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text-secondary">
                    {paginatedData.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text-secondary">
                    {filteredData.length}
                  </span>{" "}
                  transaksi
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    className={`inline-flex h-8 items-center gap-1 rounded-lg border ${themeNeutralBorder} theme-card px-2.5 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <ChevronLeft size={14} />
                    Sebelumnya
                  </button>

                  <span className="px-2 text-xs font-semibold theme-text-secondary">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                    className={`inline-flex h-8 items-center gap-1 rounded-lg border ${themeNeutralBorder} theme-card px-2.5 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    Berikutnya
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </section>


            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div
                className={`relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card p-5 ${themeCardShadow}`}
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--color-primary)]" />

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySurface} ${themePrimaryText}`}
                  >
                    <FileText size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Laporan Bulanan
                    </h3>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Rangkuman keuangan bulan ini.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <ReportRow
                    label="Pemasukan"
                    value={formatRupiahOrUnavailable(pemasukanBulanIni)}
                    variant="success"
                  />

                  <ReportRow
                    label="Pengeluaran"
                    value={formatRupiahOrUnavailable(pengeluaranBulanIni)}
                    variant="danger"
                  />

                  <div
                    className={`border-t ${themeDivider} pt-2.5`}
                  >
                    <ReportRow
                      label="Selisih"
                      value={
                        pemasukanBulanIni === null ||
                        pengeluaranBulanIni === null
                          ? "Tidak tersedia"
                          : formatRupiah(
                              pemasukanBulanIni - pengeluaranBulanIni
                            )
                      }
                      variant="primary"
                      bold
                    />
                  </div>

                  {bulanIni === null && (
                    <p className="text-[11px] theme-text-muted">
                      Agregat laporan kas bulan ini tidak tersedia.
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card p-5 ${themeCardShadow}`}
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--color-info)]" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]">
                    <Building2 size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Ringkasan Akun
                    </h3>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Total saldo dari semua akun.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {akunKas.length === 0 ? (
                    <p className="text-sm theme-text-muted">
                      {loading
                        ? "Memuat akun kas..."
                        : "Belum ada akun kas."}
                    </p>
                  ) : (
                    akunKas.map((akun) => (
                      <ReportRow
                        key={akun.id}
                        label={akun.nama}
                        value={formatRupiah(akun.saldo)}
                        variant="neutral"
                      />
                    ))
                  )}

                  <div
                    className={`border-t ${themeDivider} pt-2.5`}
                  >
                    <ReportRow
                      label="Total"
                      value={formatRupiahOrUnavailable(saldoAkhir)}
                      variant="primary"
                      bold
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>


      {detailOpen && selectedTransaksi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div
            className={`theme-card w-full max-w-lg overflow-hidden rounded-2xl ${themeCardShadow}`}
          >
            <div
              className={`relative flex items-start justify-between gap-4 border-b ${themeDivider} p-5`}
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--color-primary)]" />

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySurface} ${themePrimaryText}`}
                >
                  <Receipt size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold theme-text">
                    Detail Transaksi
                  </h2>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    {selectedTransaksi.nomor}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition ${themeNeutralHover}`}
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem
                  icon={Calendar}
                  label="Tanggal"
                  value={formatTanggal(selectedTransaksi.tanggal)}
                />

                <DetailItem
                  icon={Receipt}
                  label="Kategori"
                  value={selectedTransaksi.kategori}
                />

                <DetailItem
                  icon={Wallet}
                  label="Akun"
                  value={selectedTransaksi.akun}
                />

                <DetailItem
                  icon={FileText}
                  label="Status"
                  value={selectedTransaksi.status}
                />
              </div>

              <div
                className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
              >
                <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                  Keterangan
                </p>

                <p className="mt-1.5 text-sm theme-text-secondary">
                  {selectedTransaksi.keterangan}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  selectedTransaksi.jenis === "pemasukan"
                    ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)]"
                    : "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
                }`}
              >
                <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                  Jumlah
                </p>

                <p
                  className={`mt-1.5 text-2xl font-bold ${
                    selectedTransaksi.jenis === "pemasukan"
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {selectedTransaksi.jenis === "pemasukan" ? "+" : "-"}
                  {formatRupiah(selectedTransaksi.jumlah)}
                </p>
              </div>
            </div>

            <div
              className={`flex justify-end gap-2 border-t ${themeDivider} px-5 py-4`}
            >
              <button
                type="button"
                onClick={() => window.print()}
                className={`inline-flex h-10 items-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover}`}
              >
                <Printer size={15} />
                Cetak
              </button>

              <button
                type="button"
                onClick={closeDetail}
                className="inline-flex h-10 items-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}


      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div
            className={`theme-card w-full max-w-lg overflow-hidden rounded-2xl ${themeCardShadow}`}
          >
            <div
              className={`relative flex items-start justify-between gap-4 border-b ${themeDivider} p-5`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-0.5 ${
                  formType === "pemasukan"
                    ? "bg-[var(--color-success)]"
                    : "bg-[var(--color-danger)]"
                }`}
              />

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    formType === "pemasukan"
                      ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]"
                      : "bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]"
                  }`}
                >
                  {formType === "pemasukan" ? (
                    <ArrowDownCircle size={18} />
                  ) : (
                    <ArrowUpCircle size={18} />
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold theme-text">
                    {formType === "pemasukan"
                      ? "Tambah Pemasukan"
                      : "Tambah Pengeluaran"}
                  </h2>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    Catat transaksi baru ke sistem keuangan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition ${themeNeutralHover}`}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Tanggal
                </label>

                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    updateForm("tanggal", e.target.value)
                  }
                  className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text outline-none transition ${themeFocus}`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Kategori
                </label>

                <input
                  type="text"
                  value={form.kategori}
                  onChange={(e) =>
                    updateForm("kategori", e.target.value)
                  }
                  placeholder="Contoh: SPP, Gaji, Operasional"
                  className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Jumlah (Rp)
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.jumlah}
                  onChange={(e) =>
                    updateForm("jumlah", e.target.value)
                  }
                  placeholder="Contoh: 750000"
                  className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Akun
                </label>

                <select
                  value={form.akunKasId}
                  onChange={(e) =>
                    updateForm("akunKasId", e.target.value)
                  }
                  disabled={saving || activeAkun.length === 0}
                  className={`h-10 w-full cursor-pointer rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <option value="">
                    {activeAkun.length === 0
                      ? "Belum ada akun kas aktif"
                      : "Pilih akun kas"}
                  </option>
                  {activeAkun.map((akun) => (
                    <option key={akun.id} value={akun.id}>
                      {akun.kode} - {akun.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Keterangan
                </label>

                <textarea
                  rows={3}
                  value={form.keterangan}
                  onChange={(e) =>
                    updateForm("keterangan", e.target.value)
                  }
                  placeholder="Keterangan transaksi..."
                  className={`w-full resize-none rounded-xl border ${themeNeutralBorder} theme-card px-3 py-2.5 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>

              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)] p-3 text-xs text-[var(--color-danger)]">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div
                className={`flex justify-end gap-2 border-t ${themeDivider} pt-4`}
              >
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className={`inline-flex h-10 items-center rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:opacity-60`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving || activeAkun.length === 0}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                    formType === "pemasukan"
                      ? "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_75%,var(--color-success)))] shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]"
                      : "bg-[var(--color-danger)] shadow-[0_4px_14px_color-mix(in_srgb,var(--color-danger)_25%,transparent)]"
                  }`}
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


function StatCard({ icon: Icon, label, value, description, accent = "primary" }) {
  const accentConfig = {
    primary: {
      iconBg: themePrimarySurface,
      iconText: themePrimaryText,
      bar: "bg-[var(--color-primary)]",
    },
    success: {
      iconBg: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
      iconText: "text-[var(--color-success)]",
      bar: "bg-[var(--color-success)]",
    },
    danger: {
      iconBg: "bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]",
      iconText: "text-[var(--color-danger)]",
      bar: "bg-[var(--color-danger)]",
    },
    warning: {
      iconBg: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
      iconText: "text-[var(--color-warning)]",
      bar: "bg-[var(--color-warning)]",
    },
    info: {
      iconBg: "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
      iconText: "text-[var(--color-info)]",
      bar: "bg-[var(--color-info)]",
    },
  };

  const cfg = accentConfig[accent] || accentConfig.primary;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card p-4 ${themeCardShadow} transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${cfg.bar}`} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
            {label}
          </p>

          <p className="mt-2 truncate text-lg font-bold theme-text">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[11px] theme-text-muted">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${cfg.iconBg} ${cfg.iconText}`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function getKategoriStyle(kategori) {
  const map = {
    SPP: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    Gaji: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]",
    Operasional:
      "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]",
    Pemeliharaan:
      "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
    Lainnya:
      "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-secondary",
  };

  return map[kategori] || map.Lainnya;
}

function StatusBadge({ status }) {
  const config = {
    aktif: {
      className:
        "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
      icon: CheckCircle2,
      label: "Aktif",
    },
    lunas: {
      className:
        "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
      icon: CheckCircle2,
      label: "Lunas",
    },
    menunggu: {
      className:
        "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]",
      icon: Clock,
      label: "Menunggu",
    },
    dibatalkan: {
      className:
        "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
      icon: AlertCircle,
      label: "Dibatalkan",
    },
    gagal: {
      className:
        "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
      icon: AlertCircle,
      label: "Gagal",
    },
  };

  const item = config[status] || {
    className: `${themeNeutralSurface} theme-text-muted border theme-border`,
    icon: AlertCircle,
    label: formatKategori(status),
  };

  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${item.className}`}
    >
      <Icon size={11} />
      {item.label}
    </span>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div
      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className="theme-text-muted" />

        <p className="text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
          {label}
        </p>
      </div>

      <p className="mt-1.5 text-sm font-semibold capitalize theme-text">
        {value || "-"}
      </p>
    </div>
  );
}

function ReportRow({ label, value, variant = "neutral", bold = false }) {
  const valueColor = {
    success: "text-[var(--color-success)]",
    danger: "text-[var(--color-danger)]",
    primary: themePrimaryText,
    neutral: "theme-text-secondary",
  }[variant];

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`text-xs ${
          bold ? "font-semibold theme-text" : "theme-text-muted"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-sm ${valueColor} ${
          bold ? "font-bold" : "font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}