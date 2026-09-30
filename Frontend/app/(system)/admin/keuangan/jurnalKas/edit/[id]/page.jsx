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

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

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
          <div className="h-8 w-8 animate-spin rounded-full border-2 theme-border border-t-[var(--color-primary)]" />
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
            className="theme-text-muted transition hover:text-[var(--color-primary)]"
          >
            Jurnal & Kas
          </Link>

          <span className="theme-text-placeholder">/</span>

          <Link
            href={`/admin/keuangan/jurnalKas/detail/${params.id}`}
            className="theme-text-muted transition hover:text-[var(--color-primary)]"
          >
            Detail
          </Link>

          <span className="theme-text-placeholder">/</span>

          <span className="font-medium theme-text-secondary">
            Edit
          </span>
        </div>

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="theme-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-sm">
              <Wallet size={22} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                KEUANGAN SEKOLAH
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                Edit Transaksi
              </h1>

              <p className="mt-1 text-sm theme-text-muted">
                Perbarui informasi transaksi kas sekolah.
              </p>
            </div>
          </div>

          <Link
            href={`/admin/keuangan/jurnalKas/detail/${params.id}`}
            className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            {/* LEFT */}
            <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">
              <div className="theme-border border-b px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                    <FileText size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold theme-text">
                      Informasi Transaksi
                    </h2>

                    <p className="mt-0.5 text-xs theme-text-muted">
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
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
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
                      className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
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
                    className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
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
                    <span className="theme-text-muted absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold">
                      Rp
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        form.nominal
                          ? new Intl.NumberFormat(
                              "id-ID"
                            ).format(
                              Number(form.nominal)
                            )
                          : ""
                      }
                      onChange={(e) =>
                        handleNominalChange(
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className={`theme-input h-12 w-full rounded-xl border pl-12 pr-4 text-lg font-bold outline-none transition ${
                        form.jenis === "Pemasukan"
                          ? "text-[var(--color-success)] focus:border-[var(--color-success)] focus:ring-4 focus:ring-[var(--color-success)]/10"
                          : "text-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-4 focus:ring-[var(--color-danger)]/10"
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
                    className="theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                  />
                </FormField>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {/* PREVIEW */}
              <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-border border-b px-5 py-4">
                  <h2 className="text-sm font-bold theme-text">
                    Ringkasan Perubahan
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Preview transaksi sebelum disimpan.
                  </p>
                </div>

                <div className="p-5">
                  <div
                    className={`rounded-xl border p-4 ${
                      form.jenis === "Pemasukan"
                        ? "theme-success"
                        : "theme-danger"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                          form.jenis === "Pemasukan"
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]"
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
                          className="theme-text-muted"
                        />
                      ) : (
                        <Banknote
                          size={17}
                          className="theme-text-muted"
                        />
                      )}
                    </div>

                    <p className="theme-text mt-4 truncate text-sm font-bold">
                      {form.keterangan ||
                        "Nama transaksi"}
                    </p>

                    <p
                      className={`mt-2 text-xl font-bold ${
                        form.jenis === "Pemasukan"
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-danger)]"
                      }`}
                    >
                      {formatCurrency(form.nominal)}
                    </p>

                    <div className="theme-text-muted mt-4 flex items-center gap-2 text-xs">
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
              <div className="theme-info rounded-2xl border p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-info-background)]">
                    <AlertCircle size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[var(--color-info)]">
                      Perhatian
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--color-info)] opacity-80">
                      Perubahan nominal atau jenis transaksi
                      akan memengaruhi saldo berjalan pada
                      jurnal kas.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div className="theme-card rounded-2xl border p-5 shadow-sm">
                <button
                  type="submit"
                  disabled={saving}
                  className="theme-primary flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="theme-input theme-header-hover mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition"
                >
                  <RotateCcw size={16} />
                  Batalkan
                </Link>

                {error && (
                  <div className="theme-danger mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs">
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="theme-text-muted flex items-center gap-2 px-1 text-[11px]">
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

        <main className="theme-page min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
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
        <label className="theme-text-secondary text-sm font-semibold">
          {label}

          {required && (
            <span className="ml-1 text-[var(--color-danger)]">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="theme-text-muted hidden text-[11px] sm:block">
            {hint}
          </span>
        )}
      </div>

      {children}

      {hint && (
        <p className="theme-text-muted mt-1.5 text-[11px] sm:hidden">
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
            ? "border-[var(--color-success)] bg-[var(--color-success-background)]"
            : "border-[var(--color-danger)] bg-[var(--color-danger-background)]"
          : "theme-card theme-border theme-header-hover"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active
            ? isIncome
              ? "bg-[var(--color-success)] text-white"
              : "bg-[var(--color-danger)] text-white"
            : "theme-card-soft theme-text-muted"
        }`}
      >
        {icon}
      </div>

      <div>
        <p
          className={`text-sm font-bold ${
            active
              ? isIncome
                ? "text-[var(--color-success)]"
                : "text-[var(--color-danger)]"
              : "theme-text-secondary"
          }`}
        >
          {type}
        </p>

        <p className="theme-text-muted mt-0.5 text-[11px]">
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
              ? "text-[var(--color-success)]"
              : "text-[var(--color-danger)]"
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
          ? "border-[var(--color-primary)] bg-[var(--color-sidebar-active)]"
          : "theme-card theme-border theme-header-hover"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "theme-primary"
            : "theme-card-soft theme-text-muted"
        }`}
      >
        {icon}
      </div>

      <div>
        <p
          className={`text-sm font-bold ${
            active
              ? "text-[var(--color-primary)]"
              : "theme-text-secondary"
          }`}
        >
          {label}
        </p>

        <p className="theme-text-muted mt-0.5 text-[11px]">
          {description}
        </p>
      </div>

      {active && (
        <CircleCheck
          size={17}
          className="ml-auto text-[var(--color-primary)]"
        />
      )}
    </button>
  );
}

