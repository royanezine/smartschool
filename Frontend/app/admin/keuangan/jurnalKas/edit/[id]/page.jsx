"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  CalendarDays,
  CreditCard,
  Banknote,
  FileText,
  Save,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  CircleCheck,
  AlertCircle,
} from "lucide-react";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

const STORAGE_KEY = "smartschool_jurnal_kas";

const defaultData = [
  {
    id: "1",
    tanggal: "2026-09-01",
    keterangan: "Setoran SPP Siswa",
    debit: 0,
    kredit: 12500000,
    saldo: 12500000,
    jenis: "Pemasukan",
    metode: "Transfer",
    catatan: "Pembayaran SPP bulan September dari 50 siswa",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-01 08:00",
  },
  {
    id: "2",
    tanggal: "2026-09-02",
    keterangan: "Pembelian ATK",
    debit: 2350000,
    kredit: 0,
    saldo: 10150000,
    jenis: "Pengeluaran",
    metode: "Tunai",
    catatan: "Pembelian alat tulis kantor untuk 1 bulan",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-02 10:30",
  },
  {
    id: "3",
    tanggal: "2026-09-03",
    keterangan: "Gaji Guru Bulan Agustus",
    debit: 35000000,
    kredit: 0,
    saldo: -24850000,
    jenis: "Pengeluaran",
    metode: "Transfer",
    catatan: "Pembayaran gaji untuk 25 guru",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-03 14:00",
  },
  {
    id: "4",
    tanggal: "2026-09-05",
    keterangan: "Donasi BOS",
    debit: 0,
    kredit: 5000000,
    saldo: -19850000,
    jenis: "Pemasukan",
    metode: "Transfer",
    catatan: "Bantuan Operasional Sekolah dari pemerintah",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-05 09:15",
  },
  {
    id: "5",
    tanggal: "2026-09-06",
    keterangan: "Pembayaran Listrik",
    debit: 1800000,
    kredit: 0,
    saldo: -21650000,
    jenis: "Pengeluaran",
    metode: "Tunai",
    catatan: "Tagihan listrik bulan Agustus",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-06 11:00",
  },
  {
    id: "6",
    tanggal: "2026-09-07",
    keterangan: "Setoran SPP",
    debit: 0,
    kredit: 8000000,
    saldo: -13650000,
    jenis: "Pemasukan",
    metode: "Transfer",
    catatan: "Pembayaran SPP dari 32 siswa",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-07 08:45",
  },
  {
    id: "7",
    tanggal: "2026-09-08",
    keterangan: "Biaya Maintenance",
    debit: 2500000,
    kredit: 0,
    saldo: -16150000,
    jenis: "Pengeluaran",
    metode: "Tunai",
    catatan: "Perbaikan AC dan komputer lab",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-08 13:20",
  },
];

export default function EditJurnalKasPage() {
  const params = useParams();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tanggal: "",
    keterangan: "",
    jenis: "Pemasukan",
    metode: "Transfer",
    nominal: "",
    catatan: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const data = saved ? JSON.parse(saved) : defaultData;

      const selected = Array.isArray(data)
        ? data.find(
            (item) => String(item.id) === String(params.id)
          )
        : null;

      if (selected) {
        setForm({
          tanggal: selected.tanggal || "",
          keterangan: selected.keterangan || "",
          jenis: selected.jenis || "Pemasukan",
          metode: selected.metode || "Transfer",
          nominal:
            selected.jenis === "Pemasukan"
              ? String(selected.kredit || "")
              : String(selected.debit || ""),
          catatan: selected.catatan || "",
        });
      }
    } catch (err) {
      console.error("Gagal membaca transaksi:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) setError("");
  };

  const handleNominalChange = (value) => {
    const numeric = value.replace(/\D/g, "");

    updateField("nominal", numeric);
  };

  const handleJenisChange = (jenis) => {
    updateField("jenis", jenis);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!form.tanggal) {
      setError("Tanggal transaksi wajib diisi.");
      return;
    }

    if (!form.keterangan.trim()) {
      setError("Keterangan transaksi wajib diisi.");
      return;
    }

    if (!form.nominal || Number(form.nominal) <= 0) {
      setError("Nominal transaksi harus lebih dari 0.");
      return;
    }

    setSaving(true);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const data = saved ? JSON.parse(saved) : defaultData;

      const numericNominal = Number(form.nominal);

      const updated = data.map((item) => {
        if (String(item.id) !== String(params.id)) {
          return item;
        }

        return {
          ...item,
          tanggal: form.tanggal,
          keterangan: form.keterangan.trim(),
          jenis: form.jenis,
          metode: form.metode,
          debit:
            form.jenis === "Pengeluaran"
              ? numericNominal
              : 0,
          kredit:
            form.jenis === "Pemasukan"
              ? numericNominal
              : 0,
          catatan: form.catatan.trim(),
        };
      });

      /*
       * Hitung ulang saldo berjalan berdasarkan
       * urutan tanggal transaksi.
       */
      const sorted = [...updated].sort(
        (a, b) =>
          new Date(a.tanggal) - new Date(b.tanggal)
      );

      let saldo = 0;

      const recalculated = sorted.map((item) => {
        saldo +=
          Number(item.kredit || 0) -
          Number(item.debit || 0);

        return {
          ...item,
          saldo,
        };
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(recalculated)
      );

      router.push(
        `/admin/keuangan/jurnalKas/detail/${params.id}`
      );
    } catch (err) {
      console.error("Gagal menyimpan transaksi:", err);
      setError("Terjadi kesalahan saat menyimpan data.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      >
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1E3A8A]" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <div className="mx-auto max-w-[1100px]">
        {/* BREADCRUMB */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/admin/keuangan/jurnalKas"
            className="text-slate-400 transition hover:text-[#1E3A8A]"
          >
            Jurnal & Kas
          </Link>

          <span className="text-slate-300">/</span>

          <Link
            href={`/admin/keuangan/jurnalKas/detail/${params.id}`}
            className="text-slate-400 transition hover:text-[#1E3A8A]"
          >
            Detail
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-medium text-slate-600">
            Edit
          </span>
        </div>

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-sm">
              <Wallet size={22} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                KEUANGAN SEKOLAH
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                Edit Transaksi
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Perbarui informasi transaksi kas sekolah.
              </p>
            </div>
          </div>

          <Link
            href={`/admin/keuangan/jurnalKas/detail/${params.id}`}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            {/* LEFT */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                    <FileText size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-[#0F172A]">
                      Informasi Transaksi
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Lengkapi data transaksi dengan benar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {/* TANGGAL */}
                <FormField
                  label="Tanggal Transaksi"
                  required
                >
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={form.tanggal}
                      onChange={(e) =>
                        updateField(
                          "tanggal",
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </FormField>

                {/* KETERANGAN */}
                <FormField
                  label="Keterangan Transaksi"
                  required
                  hint="Tuliskan nama atau tujuan transaksi."
                >
                  <input
                    type="text"
                    value={form.keterangan}
                    onChange={(e) =>
                      updateField(
                        "keterangan",
                        e.target.value
                      )
                    }
                    placeholder="Contoh: Pembayaran listrik sekolah"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                  />
                </FormField>

                {/* JENIS */}
                <FormField
                  label="Jenis Transaksi"
                  required
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TypeButton
                      active={form.jenis === "Pemasukan"}
                      type="Pemasukan"
                      icon={<ArrowUpRight size={19} />}
                      onClick={() =>
                        handleJenisChange("Pemasukan")
                      }
                    />

                    <TypeButton
                      active={form.jenis === "Pengeluaran"}
                      type="Pengeluaran"
                      icon={<ArrowDownRight size={19} />}
                      onClick={() =>
                        handleJenisChange("Pengeluaran")
                      }
                    />
                  </div>
                </FormField>

                {/* METODE */}
                <FormField
                  label="Metode Pembayaran"
                  required
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <MethodButton
                      active={form.metode === "Transfer"}
                      icon={<CreditCard size={18} />}
                      label="Transfer"
                      description="Transfer bank"
                      onClick={() =>
                        updateField(
                          "metode",
                          "Transfer"
                        )
                      }
                    />

                    <MethodButton
                      active={form.metode === "Tunai"}
                      icon={<Banknote size={18} />}
                      label="Tunai"
                      description="Pembayaran tunai"
                      onClick={() =>
                        updateField("metode", "Tunai")
                      }
                    />
                  </div>
                </FormField>

                {/* NOMINAL */}
                <FormField
                  label="Nominal Transaksi"
                  required
                  hint="Masukkan nominal tanpa titik atau simbol."
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      Rp
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.nominal
                        ? new Intl.NumberFormat(
                            "id-ID"
                          ).format(
                            Number(form.nominal)
                          )
                        : ""}
                      onChange={(e) =>
                        handleNominalChange(
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className={`h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-lg font-bold outline-none transition ${
                        form.jenis === "Pemasukan"
                          ? "border-emerald-200 text-emerald-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          : "border-rose-200 text-rose-700 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                      }`}
                    />
                  </div>
                </FormField>

                {/* CATATAN */}
                <FormField
                  label="Catatan"
                  hint="Opsional. Tambahkan informasi pendukung transaksi."
                >
                  <textarea
                    rows={5}
                    value={form.catatan}
                    onChange={(e) =>
                      updateField(
                        "catatan",
                        e.target.value
                      )
                    }
                    placeholder="Contoh: Pembayaran dilakukan melalui rekening sekolah..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                  />
                </FormField>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {/* PREVIEW */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Ringkasan Perubahan
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Preview transaksi sebelum disimpan.
                  </p>
                </div>

                <div className="p-5">
                  <div
                    className={`rounded-xl border p-4 ${
                      form.jenis === "Pemasukan"
                        ? "border-emerald-100 bg-emerald-50/60"
                        : "border-rose-100 bg-rose-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                          form.jenis === "Pemasukan"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {form.jenis === "Pemasukan" ? (
                          <ArrowUpRight size={15} />
                        ) : (
                          <ArrowDownRight size={15} />
                        )}

                        {form.jenis}
                      </span>

                      {form.metode === "Transfer" ? (
                        <CreditCard
                          size={17}
                          className="text-slate-400"
                        />
                      ) : (
                        <Banknote
                          size={17}
                          className="text-slate-400"
                        />
                      )}
                    </div>

                    <p className="mt-4 truncate text-sm font-bold text-[#0F172A]">
                      {form.keterangan ||
                        "Nama transaksi"}
                    </p>

                    <p
                      className={`mt-2 text-xl font-bold ${
                        form.jenis === "Pemasukan"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(form.nominal)}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={13} />

                      {form.tanggal
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
                        : "Tanggal belum dipilih"}
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTICE */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A]">
                    <AlertCircle size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#1E3A8A]">
                      Perhatian
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-800/70">
                      Perubahan nominal atau jenis transaksi
                      akan memengaruhi saldo berjalan pada
                      jurnal kas.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172F70] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Simpan Perubahan
                    </>
                  )}
                </button>

                <Link
                  href={`/admin/keuangan/jurnalKas/detail/${params.id}`}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RotateCcw size={16} />
                  Batalkan
                </Link>

                {error && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-600">
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                <CircleCheck size={13} />
                Perubahan akan tersimpan pada data jurnal kas.
              </div>
            </div>
          </div>
        </form>

        <div className="h-10" />
      </div>
    </PageShell>
  );
}

function PageShell({
  children,
  isCollapsed,
  setIsCollapsed,
}) {
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

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  hint,
  children,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-700">
          {label}

          {required && (
            <span className="ml-1 text-rose-500">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="hidden text-[11px] text-slate-400 sm:block">
            {hint}
          </span>
        )}
      </div>

      {children}

      {hint && (
        <p className="mt-1.5 text-[11px] text-slate-400 sm:hidden">
          {hint}
        </p>
      )}
    </div>
  );
}

function TypeButton({
  active,
  type,
  icon,
  onClick,
}) {
  const isIncome = type === "Pemasukan";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        active
          ? isIncome
            ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/10"
            : "border-rose-400 bg-rose-50 ring-2 ring-rose-500/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active
            ? isIncome
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div>
        <p
          className={`text-sm font-bold ${
            active
              ? isIncome
                ? "text-emerald-700"
                : "text-rose-700"
              : "text-slate-700"
          }`}
        >
          {type}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {isIncome
            ? "Dana masuk ke kas"
            : "Dana keluar dari kas"}
        </p>
      </div>

      {active && (
        <CircleCheck
          size={17}
          className={`ml-auto ${
            isIncome
              ? "text-emerald-500"
              : "text-rose-500"
          }`}
        />
      )}
    </button>
  );
}

function MethodButton({
  active,
  icon,
  label,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        active
          ? "border-[#2563EB] bg-blue-50 ring-2 ring-blue-500/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "bg-[#1E3A8A] text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div>
        <p
          className={`text-sm font-bold ${
            active
              ? "text-[#1E3A8A]"
              : "text-slate-700"
          }`}
        >
          {label}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {description}
        </p>
      </div>

      {active && (
        <CircleCheck
          size={17}
          className="ml-auto text-[#2563EB]"
        />
      )}
    </button>
  );
}