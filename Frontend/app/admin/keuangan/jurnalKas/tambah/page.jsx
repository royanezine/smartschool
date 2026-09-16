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

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

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
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F6F8]">
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

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1200px]">

              {/* PAGE HEADER */}
              <div className="mb-7">
                <Link
                  href="/admin/keuangan/jurnalKas"
                  className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-[#1E3A8A]"
                >
                  <ArrowLeft size={15} />
                  Kembali ke Jurnal Kas
                </Link>

                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-lg">
                    <Wallet size={21} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                      KEUANGAN SEKOLAH
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                      Tambah Transaksi
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                      Catat transaksi pemasukan atau pengeluaran
                      kas sekolah.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">

                  {/* FORM */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h2 className="text-sm font-bold text-[#0F172A]">
                        Informasi Transaksi
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Lengkapi informasi transaksi dengan benar.
                      </p>
                    </div>

                    <div className="space-y-6 p-6">

                      {/* JENIS */}
                      <div>
                        <label className="mb-2.5 block text-xs font-bold text-slate-700">
                          Jenis Transaksi
                        </label>

                        <div className="grid grid-cols-2 gap-3">
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
                                ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                form.jenis === "Pemasukan"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <ArrowUpRight size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                Pemasukan
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                Kas masuk
                              </p>
                            </div>

                            {form.jenis ===
                              "Pemasukan" && (
                              <CheckCircle2
                                size={17}
                                className="absolute right-3 top-3 text-emerald-500"
                              />
                            )}
                          </button>

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
                                ? "border-rose-500 bg-rose-50 ring-2 ring-rose-500/10"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                form.jenis === "Pengeluaran"
                                  ? "bg-rose-500 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <ArrowDownRight size={18} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                Pengeluaran
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                Kas keluar
                              </p>
                            </div>

                            {form.jenis ===
                              "Pengeluaran" && (
                              <CheckCircle2
                                size={17}
                                className="absolute right-3 top-3 text-rose-500"
                              />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* TANGGAL */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                          Tanggal Transaksi
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <CalendarDays
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                            className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 ${
                              errors.tanggal
                                ? "border-rose-400"
                                : "border-slate-200"
                            }`}
                          />
                        </div>

                        {errors.tanggal && (
                          <p className="mt-1.5 text-xs text-rose-500">
                            {errors.tanggal}
                          </p>
                        )}
                      </div>

                      {/* KETERANGAN */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                          Keterangan Transaksi
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <FileText
                            size={17}
                            className="absolute left-3.5 top-3 text-slate-400"
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
                            className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 ${
                              errors.keterangan
                                ? "border-rose-400"
                                : "border-slate-200"
                            }`}
                          />
                        </div>

                        {errors.keterangan && (
                          <p className="mt-1.5 text-xs text-rose-500">
                            {errors.keterangan}
                          </p>
                        )}
                      </div>

                      {/* NOMINAL */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                          Nominal
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
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
                            className={`h-12 w-full rounded-xl border bg-white pl-10 pr-4 text-lg font-bold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 ${
                              errors.nominal
                                ? "border-rose-400"
                                : "border-slate-200"
                            }`}
                          />
                        </div>

                        {form.nominal && (
                          <p className="mt-2 text-xs text-slate-400">
                            {formatCurrency(nominalNumber)}
                          </p>
                        )}

                        {errors.nominal && (
                          <p className="mt-1.5 text-xs text-rose-500">
                            {errors.nominal}
                          </p>
                        )}
                      </div>

                      {/* METODE */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                          Metode Pembayaran
                        </label>

                        <div className="grid grid-cols-2 gap-3">
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
                                ? "border-[#2563EB] bg-blue-50"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <CreditCard
                              size={18}
                              className={
                                form.metode === "Transfer"
                                  ? "text-[#2563EB]"
                                  : "text-slate-400"
                              }
                            />

                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                Transfer
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Bank / rekening
                              </p>
                            </div>
                          </button>

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
                                ? "border-[#2563EB] bg-blue-50"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <Banknote
                              size={18}
                              className={
                                form.metode === "Tunai"
                                  ? "text-[#2563EB]"
                                  : "text-slate-400"
                              }
                            />

                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                Tunai
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Kas fisik
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* CATATAN */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                          Catatan
                          <span className="ml-1 font-normal text-slate-400">
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
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SIDEBAR SUMMARY */}
                  <div className="space-y-5">

                    {/* PREVIEW */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-200 px-5 py-4">
                        <p className="text-xs font-bold text-slate-700">
                          Ringkasan Transaksi
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Preview sebelum disimpan
                        </p>
                      </div>

                      <div className="p-5">
                        <div
                          className={`mb-5 flex items-center gap-3 rounded-xl p-4 ${
                            form.jenis === "Pemasukan"
                              ? "bg-emerald-50"
                              : "bg-rose-50"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${
                              form.jenis === "Pemasukan"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          >
                            {form.jenis === "Pemasukan" ? (
                              <ArrowUpRight size={20} />
                            ) : (
                              <ArrowDownRight size={20} />
                            )}
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Jenis
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-slate-800">
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

                          <div className="border-t border-slate-100 pt-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Nominal
                            </p>

                            <p
                              className={`mt-1 text-xl font-bold ${
                                form.jenis === "Pemasukan"
                                  ? "text-emerald-600"
                                  : "text-rose-600"
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
                    <div className="overflow-hidden rounded-2xl bg-[#0F172A] p-5 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Saldo Setelah Transaksi
                          </p>

                          <p className="mt-2 text-2xl font-bold tracking-tight">
                            {formatCurrency(
                              estimatedBalance
                            )}
                          </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                          <Wallet size={19} />
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            Saldo saat ini
                          </span>

                          <span className="font-semibold text-white">
                            {formatCurrency(
                              currentBalance
                            )}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            Perubahan
                          </span>

                          <span
                            className={`font-semibold ${
                              form.jenis ===
                              "Pemasukan"
                                ? "text-emerald-400"
                                : "text-rose-400"
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
                    <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <Info
                        size={17}
                        className="mt-0.5 shrink-0 text-[#2563EB]"
                      />

                      <div>
                        <p className="text-xs font-bold text-[#1E3A8A]">
                          Informasi
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-blue-700/70">
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
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-5 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition hover:bg-[#172F70] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={16} />

                        {isSaving
                          ? "Menyimpan..."
                          : "Simpan Transaksi"}
                      </button>

                      <Link
                        href="/admin/keuangan/jurnalKas"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}