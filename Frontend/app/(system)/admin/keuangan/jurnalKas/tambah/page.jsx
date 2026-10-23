"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  CalendarDays,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  X,
  Info,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Layers3,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getAkunKas,
  createJurnalKas,
} from "@/services/jurnalKas.service";

const KATEGORI = [
  "SPP",
  "Operasional",
  "Sumbangan",
  "Gaji",
  "Perlengkapan",
  "Pemeliharaan",
  "Lainnya",
];

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getErrorMessage = (error) =>
  error?.message || "Terjadi kesalahan. Silakan coba lagi.";

export default function TambahJurnalKasPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [akunKas, setAkunKas] = useState([]);
  const [loadingAkun, setLoadingAkun] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    akunKasId: "",
    tanggal: today(),
    jenis: "masuk",
    kategori: "Lainnya",
    keterangan: "",
    nominal: "",
  });

  const [errors, setErrors] = useState({});

  const nominalNumber = Number(form.nominal) || 0;

  const selectedAccount = useMemo(
    () => akunKas.find((akun) => akun.id === form.akunKasId),
    [akunKas, form.akunKasId]
  );

  const currentBalance = Number(
    selectedAccount?.saldo ??
      selectedAccount?.saldoAkhir ??
      selectedAccount?.saldoAwal ??
      0
  );

  const estimatedBalance =
    form.jenis === "masuk"
      ? currentBalance + nominalNumber
      : currentBalance - nominalNumber;

  const activeAccounts = useMemo(
    () =>
      akunKas.filter((akun) => {
        const status = String(akun.status || "").toLowerCase();
        return !["nonaktif", "tidak aktif", "disabled", "deleted"].includes(
          status
        );
      }),
    [akunKas]
  );

  const loadAccounts = async () => {
    setLoadingAkun(true);
    setPageError("");

    try {
      const response = await getAkunKas();

      if (response?.success === false) {
        throw new Error(response.message || "Gagal mengambil akun kas.");
      }

      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      setAkunKas(rows);

      setForm((prev) => {
        const currentStillExists = rows.some(
          (akun) => akun.id === prev.akunKasId
        );

        return {
          ...prev,
          akunKasId: currentStillExists
            ? prev.akunKasId
            : rows.find((akun) => {
                const status = String(akun.status || "").toLowerCase();
                return ![
                  "nonaktif",
                  "tidak aktif",
                  "disabled",
                  "deleted",
                ].includes(status);
              })?.id || "",
        };
      });
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoadingAkun(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setPageError("");
    setSuccessMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.akunKasId) {
      nextErrors.akunKasId = "Pilih akun kas terlebih dahulu.";
    }

    if (!form.tanggal) {
      nextErrors.tanggal = "Tanggal transaksi wajib diisi.";
    }

    if (!form.kategori.trim()) {
      nextErrors.kategori = "Kategori transaksi wajib diisi.";
    }

    if (!form.keterangan.trim()) {
      nextErrors.keterangan = "Keterangan transaksi wajib diisi.";
    }

    if (!form.nominal || !Number.isFinite(nominalNumber) || nominalNumber <= 0) {
      nextErrors.nominal = "Nominal harus lebih dari Rp0.";
    }

    if (
      form.jenis === "keluar" &&
      selectedAccount &&
      nominalNumber > currentBalance
    ) {
      nextErrors.nominal = "Saldo akun kas tidak mencukupi.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setIsSaving(true);
    setPageError("");
    setSuccessMessage("");

    try {
      const response = await createJurnalKas({
        akunKasId: form.akunKasId,
        jenis: form.jenis,
        kategori: form.kategori.trim(),
        jumlah: nominalNumber,
        tanggal: form.tanggal,
        keterangan: form.keterangan.trim(),
      });

      if (response?.success === false) {
        throw new Error(response.message || "Transaksi gagal disimpan.");
      }

      setSuccessMessage("Transaksi berhasil disimpan ke server.");

      window.location.assign("/admin/keuangan/jurnalKas");
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="jurnalKas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
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


              <section>
                <Link
                  href="/admin/keuangan/jurnalKas"
                  className="theme-text-muted mb-4 inline-flex items-center gap-2 text-xs font-semibold hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={15} />
                  Kembali ke Jurnal Kas
                </Link>

                <div className="flex items-start gap-3">
                  <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                    <Wallet size={21} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      KEUANGAN SEKOLAH
                    </p>
                    <h1 className="theme-text mt-1 text-2xl font-bold sm:text-3xl">
                      Tambah Transaksi
                    </h1>
                    <p className="theme-text-muted mt-2 text-sm">
                      Catat pemasukan atau pengeluaran melalui akun kas sekolah.
                    </p>
                  </div>
                </div>
              </section>


              {pageError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)] p-4 text-sm"
                >
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold theme-text">
                      Transaksi belum berhasil diproses
                    </p>
                    <p className="theme-text-secondary mt-1">{pageError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadAccounts}
                    className="theme-text-muted inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    <RefreshCw size={14} />
                    Muat ulang akun
                  </button>
                </div>
              )}


              {successMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--color-success)] p-4 text-sm">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  />
                  <div>
                    <p className="font-semibold theme-text">Berhasil</p>
                    <p className="theme-text-secondary mt-1">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}


              <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                <SummaryCard
                  title="Jenis Transaksi"
                  value={form.jenis === "masuk" ? "Pemasukan" : "Pengeluaran"}
                  icon={form.jenis === "masuk" ? ArrowUpRight : ArrowDownRight}
                  description={
                    form.jenis === "masuk"
                      ? "Kas masuk ke akun"
                      : "Kas keluar dari akun"
                  }
                  tone={form.jenis === "masuk" ? "success" : "danger"}
                />

                <SummaryCard
                  title="Nominal"
                  value={formatCurrency(nominalNumber)}
                  icon={Wallet}
                  description="Jumlah yang dicatat"
                  tone="primary"
                />

                <SummaryCard
                  title="Saldo Akun"
                  value={formatCurrency(currentBalance)}
                  icon={Layers3}
                  description={
                    selectedAccount?.nama ||
                    selectedAccount?.namaAkun ||
                    selectedAccount?.namaKas ||
                    "Belum dipilih"
                  }
                  tone="info"
                />

                <SummaryCard
                  title="Estimasi Saldo"
                  value={formatCurrency(estimatedBalance)}
                  icon={Wallet}
                  description="Setelah transaksi"
                  tone={estimatedBalance >= 0 ? "success" : "danger"}
                />

                <SummaryCard
                  title="Tanggal"
                  value={form.tanggal || "-"}
                  icon={CalendarDays}
                  description="Tanggal transaksi"
                  tone="primary"
                />

                <SummaryCard
                  title="Kategori"
                  value={form.kategori || "-"}
                  icon={FileText}
                  description="Kategori transaksi"
                  tone="warning"
                />
              </section>


              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
                  <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-border border-b px-6 py-5">
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Transaksi
                      </h2>
                      <p className="theme-text-muted mt-1 text-xs">
                        Lengkapi informasi transaksi sesuai data keuangan
                        sekolah.
                      </p>
                    </div>

                    <div className="space-y-6 p-6">
                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Akun Kas{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <select
                          value={form.akunKasId}
                          onChange={(e) =>
                            handleChange("akunKasId", e.target.value)
                          }
                          disabled={loadingAkun || isSaving}
                          className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        >
                          <option value="">
                            {loadingAkun
                              ? "Memuat akun kas..."
                              : "Pilih akun kas"}
                          </option>
                          {activeAccounts.map((akun) => (
                            <option key={akun.id} value={akun.id}>
                              {akun.nama ||
                                akun.namaAkun ||
                                akun.namaKas ||
                                "Akun kas"}{" "}
                              —{" "}
                              {formatCurrency(
                                akun.saldo ??
                                  akun.saldoAkhir ??
                                  akun.saldoAwal ??
                                  0
                              )}
                            </option>
                          ))}
                        </select>
                        {errors.akunKasId && (
                          <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                            {errors.akunKasId}
                          </p>
                        )}
                        {!loadingAkun && activeAccounts.length === 0 && (
                          <p className="theme-text-muted mt-2 text-xs">
                            Belum ada akun kas yang tersedia. Buat akun kas
                            terlebih dahulu.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2.5 block text-xs font-bold">
                          Jenis Transaksi
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              value: "masuk",
                              label: "Pemasukan",
                              desc: "Kas masuk",
                              Icon: ArrowUpRight,
                            },
                            {
                              value: "keluar",
                              label: "Pengeluaran",
                              desc: "Kas keluar",
                              Icon: ArrowDownRight,
                            },
                          ].map(({ value, label, desc, Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleChange("jenis", value)}
                              className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                form.jenis === value
                                  ? value === "masuk"
                                    ? "border-[var(--color-success)] bg-[var(--color-success-background)]"
                                    : "border-[var(--color-danger)] bg-[var(--color-danger-background)]"
                                  : "theme-card theme-border theme-header-hover"
                              }`}
                            >
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                  form.jenis === value
                                    ? value === "masuk"
                                      ? "bg-[var(--color-success)] text-white"
                                      : "bg-[var(--color-danger)] text-white"
                                    : "theme-card-soft theme-text-muted"
                                }`}
                              >
                                <Icon size={18} />
                              </div>
                              <div>
                                <p className="theme-text-secondary text-sm font-semibold">
                                  {label}
                                </p>
                                <p className="theme-text-muted mt-0.5 text-[11px]">
                                  {desc}
                                </p>
                              </div>
                              {form.jenis === value && (
                                <CheckCircle2
                                  size={17}
                                  className="absolute right-3 top-3 text-[var(--color-primary)]"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Tanggal Transaksi{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <div className="relative">
                          <CalendarDays
                            size={17}
                            className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="date"
                            value={form.tanggal}
                            onChange={(e) =>
                              handleChange("tanggal", e.target.value)
                            }
                            disabled={isSaving}
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        {errors.tanggal && (
                          <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                            {errors.tanggal}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Kategori{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <select
                          value={form.kategori}
                          onChange={(e) =>
                            handleChange("kategori", e.target.value)
                          }
                          disabled={isSaving}
                          className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        >
                          {KATEGORI.map((kategori) => (
                            <option key={kategori} value={kategori}>
                              {kategori}
                            </option>
                          ))}
                        </select>
                        {errors.kategori && (
                          <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                            {errors.kategori}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Keterangan Transaksi{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <div className="relative">
                          <FileText
                            size={17}
                            className="theme-text-muted absolute left-3.5 top-3"
                          />
                          <input
                            type="text"
                            value={form.keterangan}
                            onChange={(e) =>
                              handleChange("keterangan", e.target.value)
                            }
                            placeholder="Contoh: Pembayaran SPP September"
                            disabled={isSaving}
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        {errors.keterangan && (
                          <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                            {errors.keterangan}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Nominal{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <div className="relative">
                          <span className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold">
                            Rp
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={form.nominal}
                            onChange={(e) =>
                              handleChange("nominal", e.target.value)
                            }
                            placeholder="0"
                            disabled={isSaving}
                            className="theme-input h-12 w-full rounded-xl border pl-10 pr-4 text-lg font-bold outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        {form.nominal && (
                          <p className="theme-text-muted mt-2 text-xs">
                            {formatCurrency(nominalNumber)}
                          </p>
                        )}
                        {errors.nominal && (
                          <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                            {errors.nominal}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <aside className="space-y-5">
                    <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-border border-b px-5 py-4">
                        <p className="theme-text-secondary text-xs font-bold">
                          Ringkasan Transaksi
                        </p>
                        <p className="theme-text-muted mt-1 text-[11px]">
                          Periksa sebelum disimpan
                        </p>
                      </div>

                      <div className="space-y-4 p-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${
                              form.jenis === "masuk"
                                ? "bg-[var(--color-success)]"
                                : "bg-[var(--color-danger)]"
                            }`}
                          >
                            {form.jenis === "masuk" ? (
                              <ArrowUpRight size={20} />
                            ) : (
                              <ArrowDownRight size={20} />
                            )}
                          </div>
                          <div>
                            <p className="theme-text-muted text-[10px] uppercase">
                              Jenis transaksi
                            </p>
                            <p className="theme-text text-sm font-bold">
                              {form.jenis === "masuk"
                                ? "Pemasukan"
                                : "Pengeluaran"}
                            </p>
                          </div>
                        </div>

                        <SummaryRow
                          label="Akun kas"
                          value={
                            selectedAccount?.nama ||
                            selectedAccount?.namaAkun ||
                            selectedAccount?.namaKas ||
                            "Belum dipilih"
                          }
                        />
                        <SummaryRow
                          label="Tanggal"
                          value={form.tanggal || "-"}
                        />
                        <SummaryRow label="Kategori" value={form.kategori} />
                        <SummaryRow
                          label="Keterangan"
                          value={form.keterangan || "Belum diisi"}
                        />

                        <div className="theme-border border-t pt-4">
                          <p className="theme-text-muted text-[10px] font-semibold uppercase">
                            Nominal transaksi
                          </p>
                          <p
                            className={`mt-1 text-xl font-bold ${
                              form.jenis === "masuk"
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-danger)]"
                            }`}
                          >
                            {form.jenis === "masuk" ? "+" : "−"}{" "}
                            {formatCurrency(nominalNumber)}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="theme-card-soft theme-border rounded-2xl border p-5">
                      <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                        Estimasi saldo setelah transaksi
                      </p>
                      <p className="theme-text mt-2 text-2xl font-bold">
                        {formatCurrency(estimatedBalance)}
                      </p>
                      <div className="theme-border mt-4 border-t pt-3">
                        <div className="flex justify-between gap-3 text-xs">
                          <span className="theme-text-muted">
                            Saldo akun saat ini
                          </span>
                          <span className="theme-text font-semibold">
                            {formatCurrency(currentBalance)}
                          </span>
                        </div>
                      </div>
                      <p className="theme-text-muted mt-3 text-[11px] leading-5">
                        Estimasi ini berdasarkan saldo akun yang dipilih. Saldo
                        final ditentukan oleh backend.
                      </p>
                    </section>

                    <div className="theme-info flex gap-3 rounded-2xl border p-4">
                      <Info size={17} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Informasi</p>
                        <p className="mt-1 text-[11px] leading-5 opacity-80">
                          Transaksi akan disimpan ke server SmartSchool. Untuk
                          pengeluaran, backend akan memvalidasi saldo akun kas.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={
                          isSaving ||
                          loadingAkun ||
                          activeAccounts.length === 0
                        }
                        className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        {isSaving ? "Menyimpan..." : "Simpan Transaksi"}
                      </button>

                      <Link
                        href="/admin/keuangan/jurnalKas"
                        className="theme-input theme-header-hover inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold"
                      >
                        <X size={16} />
                        Batal
                      </Link>
                    </div>
                  </aside>
                </div>
              </form>

              <div className="h-10" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function SummaryCard({
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
          <p className="theme-text mt-2 truncate text-base font-bold tabular-nums sm:text-lg">
            {value}
          </p>
          <p className="theme-text-muted mt-2 truncate text-xs">
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


function SummaryRow({ label, value }) {
  return (
    <div>
      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="theme-text-secondary mt-1 break-words text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}