"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  CalendarDays,
  FileText,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  X,
  Info,
  CheckCircle2,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

const STORAGE_KEY = "smartschool_jurnal_kas";

export default function TambahJurnalKasPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    jenis: "Pemasukan",
    keterangan: "",
    nominal: "",
    metode: "Transfer",
    catatan: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const nominalNumber = Number(form.nominal) || 0;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.tanggal) {
      newErrors.tanggal = "Tanggal transaksi wajib diisi.";
    }

    if (!form.keterangan.trim()) {
      newErrors.keterangan = "Keterangan transaksi wajib diisi.";
    }

    if (!form.nominal || nominalNumber <= 0) {
      newErrors.nominal = "Nominal harus lebih dari Rp0.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const currentBalance = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return 0;

      const data = JSON.parse(saved);

      if (!Array.isArray(data)) return 0;

      return data.reduce(
        (total, item) =>
          total +
          Number(item.kredit || 0) -
          Number(item.debit || 0),
        0
      );
    } catch {
      return 0;
    }
  }, []);

  const estimatedBalance =
    form.jenis === "Pemasukan"
      ? currentBalance + nominalNumber
      : currentBalance - nominalNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      let data = [];

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          data = parsed;
        }
      }

      const now = new Date();

      const newEntry = {
        id: Date.now().toString(),

        tanggal: form.tanggal,

        keterangan: form.keterangan.trim(),

        debit:
          form.jenis === "Pengeluaran"
            ? nominalNumber
            : 0,

        kredit:
          form.jenis === "Pemasukan"
            ? nominalNumber
            : 0,

        saldo: estimatedBalance,

        jenis: form.jenis,

        metode: form.metode,

        catatan: form.catatan.trim(),

        dibuatOleh: "Admin",

        tanggalDibuat: now
          .toISOString()
          .slice(0, 16)
          .replace("T", " "),
      };

      const newData = [...data, newEntry];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newData)
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      router.push("/admin/keuangan/jurnalKas");
    } catch (error) {
      console.error(
        "Gagal menyimpan transaksi:",
        error
      );

      alert(
        "Terjadi kesalahan saat menyimpan transaksi."
      );
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
          toggleSidebar={() =>
            setIsCollapsed((prev) => !prev)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="theme-page min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1200px]">

              {/* PAGE HEADER */}
              <div className="mb-7">
                <Link
                  href="/admin/keuangan/jurnalKas"
                  className="theme-text-muted mb-5 inline-flex items-center gap-2 text-xs font-semibold transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={15} />
                  Kembali ke Jurnal Kas
                </Link>

                <div className="flex items-start gap-3">
                  <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg">
                    <Wallet size={21} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      KEUANGAN SEKOLAH
                    </p>

                    <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                      Tambah Transaksi
                    </h1>

                    <p className="theme-text-muted mt-2 text-sm">
                      Catat transaksi pemasukan atau pengeluaran
                      kas sekolah.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">

                  {/* FORM */}
                  <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-border border-b px-6 py-5">
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Transaksi
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        Lengkapi informasi transaksi dengan benar.
                      </p>
                    </div>

                    <div className="space-y-6 p-6">

                      {/* JENIS */}
                      <div>
                        <label className="theme-text-secondary mb-2.5 block text-xs font-bold">
                          Jenis Transaksi
                        </label>

                        <div className="grid grid-cols-2 gap-3">

                          {/* PEMASUKAN */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChange(
                                "jenis",
                                "Pemasukan"
                              )
                            }
                            className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                              form.jenis === "Pemasukan"
                                ? "border-[var(--color-success)] bg-[var(--color-success-background)]"
                                : "theme-card theme-border theme-header-hover"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                form.jenis === "Pemasukan"
                                  ? "bg-[var(--color-success)] text-white"
                                  : "theme-card-soft theme-text-muted"
                              }`}
                            >
                              <ArrowUpRight size={18} />
                            </div>

                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  form.jenis === "Pemasukan"
                                    ? "text-[var(--color-success)]"
                                    : "theme-text-secondary"
                                }`}
                              >
                                Pemasukan
                              </p>

                              <p className="theme-text-muted mt-0.5 text-[11px]">
                                Kas masuk
                              </p>
                            </div>

                            {form.jenis ===
                              "Pemasukan" && (
                              <CheckCircle2
                                size={17}
                                className="absolute right-3 top-3 text-[var(--color-success)]"
                              />
                            )}
                          </button>

                          {/* PENGELUARAN */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChange(
                                "jenis",
                                "Pengeluaran"
                              )
                            }
                            className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                              form.jenis === "Pengeluaran"
                                ? "border-[var(--color-danger)] bg-[var(--color-danger-background)]"
                                : "theme-card theme-border theme-header-hover"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                form.jenis === "Pengeluaran"
                                  ? "bg-[var(--color-danger)] text-white"
                                  : "theme-card-soft theme-text-muted"
                              }`}
                            >
                              <ArrowDownRight size={18} />
                            </div>

                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  form.jenis === "Pengeluaran"
                                    ? "text-[var(--color-danger)]"
                                    : "theme-text-secondary"
                                }`}
                              >
                                Pengeluaran
                              </p>

                              <p className="theme-text-muted mt-0.5 text-[11px]">
                                Kas keluar
                              </p>
                            </div>

                            {form.jenis ===
                              "Pengeluaran" && (
                              <CheckCircle2
                                size={17}
                                className="absolute right-3 top-3 text-[var(--color-danger)]"
                              />
                            )}
                          </button>

                        </div>
                      </div>

                      {/* TANGGAL */}
                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Tanggal Transaksi
                          <span className="ml-1 text-[var(--color-danger)]">
                            *
                          </span>
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
                              handleChange(
                                "tanggal",
                                e.target.value
                              )
                            }
                            className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 ${
                              errors.tanggal
                                ? "border-[var(--color-danger)]"
                                : ""
                            }`}
                          />
                        </div>

                        {errors.tanggal && (
                          <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                            {errors.tanggal}
                          </p>
                        )}
                      </div>

                      {/* KETERANGAN */}
                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Keterangan Transaksi
                          <span className="ml-1 text-[var(--color-danger)]">
                            *
                          </span>
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
                              handleChange(
                                "keterangan",
                                e.target.value
                              )
                            }
                            placeholder="Contoh: Pembayaran SPP September"
                            className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 ${
                              errors.keterangan
                                ? "border-[var(--color-danger)]"
                                : ""
                            }`}
                          />
                        </div>

                        {errors.keterangan && (
                          <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                            {errors.keterangan}
                          </p>
                        )}
                      </div>

                      {/* NOMINAL */}
                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Nominal
                          <span className="ml-1 text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <span className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold">
                            Rp
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={form.nominal}
                            onChange={(e) =>
                              handleChange(
                                "nominal",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className={`theme-input h-12 w-full rounded-xl border pl-10 pr-4 text-lg font-bold outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 ${
                              errors.nominal
                                ? "border-[var(--color-danger)]"
                                : ""
                            }`}
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

                      {/* METODE */}
                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Metode Pembayaran
                        </label>

                        <div className="grid grid-cols-2 gap-3">

                          {/* TRANSFER */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChange(
                                "metode",
                                "Transfer"
                              )
                            }
                            className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                              form.metode === "Transfer"
                                ? "border-[var(--color-primary)] bg-[var(--color-sidebar-active)]"
                                : "theme-card theme-border theme-header-hover"
                            }`}
                          >
                            <CreditCard
                              size={18}
                              className={
                                form.metode === "Transfer"
                                  ? "text-[var(--color-primary)]"
                                  : "theme-text-muted"
                              }
                            />

                            <div>
                              <p
                                className={`text-xs font-semibold ${
                                  form.metode === "Transfer"
                                    ? "text-[var(--color-primary)]"
                                    : "theme-text-secondary"
                                }`}
                              >
                                Transfer
                              </p>

                              <p className="theme-text-muted mt-0.5 text-[10px]">
                                Bank / rekening
                              </p>
                            </div>
                          </button>

                          {/* TUNAI */}
                          <button
                            type="button"
                            onClick={() =>
                              handleChange(
                                "metode",
                                "Tunai"
                              )
                            }
                            className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                              form.metode === "Tunai"
                                ? "border-[var(--color-primary)] bg-[var(--color-sidebar-active)]"
                                : "theme-card theme-border theme-header-hover"
                            }`}
                          >
                            <Banknote
                              size={18}
                              className={
                                form.metode === "Tunai"
                                  ? "text-[var(--color-primary)]"
                                  : "theme-text-muted"
                              }
                            />

                            <div>
                              <p
                                className={`text-xs font-semibold ${
                                  form.metode === "Tunai"
                                    ? "text-[var(--color-primary)]"
                                    : "theme-text-secondary"
                                }`}
                              >
                                Tunai
                              </p>

                              <p className="theme-text-muted mt-0.5 text-[10px]">
                                Kas fisik
                              </p>
                            </div>
                          </button>

                        </div>
                      </div>

                      {/* CATATAN */}
                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-bold">
                          Catatan
                          <span className="theme-text-muted ml-1 font-normal">
                            (Opsional)
                          </span>
                        </label>

                        <textarea
                          rows={4}
                          value={form.catatan}
                          onChange={(e) =>
                            handleChange(
                              "catatan",
                              e.target.value
                            )
                          }
                          placeholder="Tambahkan informasi tambahan mengenai transaksi..."
                          className="theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                        />
                      </div>

                    </div>
                  </div>

                  {/* SIDEBAR SUMMARY */}
                  <div className="space-y-5">

                    {/* PREVIEW */}
                    <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-border border-b px-5 py-4">
                        <p className="theme-text-secondary text-xs font-bold">
                          Ringkasan Transaksi
                        </p>

                        <p className="theme-text-muted mt-1 text-[11px]">
                          Preview sebelum disimpan
                        </p>
                      </div>

                      <div className="p-5">
                        <div
                          className={`mb-5 flex items-center gap-3 rounded-xl p-4 ${
                            form.jenis === "Pemasukan"
                              ? "theme-success"
                              : "theme-danger"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              form.jenis === "Pemasukan"
                                ? "bg-[var(--color-success)] text-white"
                                : "bg-[var(--color-danger)] text-white"
                            }`}
                          >
                            {form.jenis === "Pemasukan" ? (
                              <ArrowUpRight size={20} />
                            ) : (
                              <ArrowDownRight size={20} />
                            )}
                          </div>

                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Jenis
                            </p>

                            <p className="theme-text mt-0.5 text-sm font-bold">
                              {form.jenis}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <SummaryRow
                            label="Tanggal"
                            value={
                              form.tanggal
                                ? new Date(
                                    form.tanggal
                                  ).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "-"
                            }
                          />

                          <SummaryRow
                            label="Keterangan"
                            value={
                              form.keterangan ||
                              "Belum diisi"
                            }
                          />

                          <SummaryRow
                            label="Metode"
                            value={form.metode}
                          />

                          <div className="theme-border border-t pt-4">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Nominal
                            </p>

                            <p
                              className={`mt-1 text-xl font-bold ${
                                form.jenis === "Pemasukan"
                                  ? "text-[var(--color-success)]"
                                  : "text-[var(--color-danger)]"
                              }`}
                            >
                              {form.jenis ===
                              "Pemasukan"
                                ? "+"
                                : "-"}{" "}
                              {formatCurrency(
                                nominalNumber
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BALANCE */}
                    <div className="theme-card-soft theme-border rounded-2xl border p-5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-[0.15em]">
                            Saldo Setelah Transaksi
                          </p>

                          <p className="theme-text mt-2 text-2xl font-bold tracking-tight">
                            {formatCurrency(
                              estimatedBalance
                            )}
                          </p>
                        </div>

                        <div className="theme-info flex h-10 w-10 items-center justify-center rounded-xl">
                          <Wallet size={19} />
                        </div>
                      </div>

                      <div className="theme-border mt-5 border-t pt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="theme-text-muted">
                            Saldo saat ini
                          </span>

                          <span className="theme-text font-semibold">
                            {formatCurrency(
                              currentBalance
                            )}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="theme-text-muted">
                            Perubahan
                          </span>

                          <span
                            className={`font-semibold ${
                              form.jenis === "Pemasukan"
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-danger)]"
                            }`}
                          >
                            {form.jenis ===
                            "Pemasukan"
                              ? "+"
                              : "-"}{" "}
                            {formatCurrency(
                              nominalNumber
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="theme-info flex gap-3 rounded-2xl border p-4">
                      <Info
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-xs font-bold">
                          Informasi
                        </p>

                        <p className="mt-1 text-[11px] leading-5 opacity-80">
                          Pastikan nominal, jenis transaksi,
                          dan tanggal sudah sesuai sebelum
                          menyimpan data.
                        </p>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-md transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={16} />

                        {isSaving
                          ? "Menyimpan..."
                          : "Simpan Transaksi"}
                      </button>

                      <Link
                        href="/admin/keuangan/jurnalKas"
                        className="theme-input theme-header-hover inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition"
                      >
                        <X size={16} />
                        Batal
                      </Link>
                    </div>
                  </div>
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
