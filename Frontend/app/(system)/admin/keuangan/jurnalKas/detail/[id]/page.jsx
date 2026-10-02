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
  User,
  Clock3,
  FileText,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  CircleCheck,
  ReceiptText,
  Building2,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

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

export default function DetailJurnalKasPage() {
  const params = useParams();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      const data = saved ? JSON.parse(saved) : defaultData;

      const selected = Array.isArray(data)
        ? data.find(
            (item) => String(item.id) === String(params.id)
          )
        : null;

      setTransaction(selected || null);
    } catch (error) {
      console.error("Gagal membaca transaksi:", error);
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

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    if (!transaction) return;

    const confirmed = window.confirm(
      `Hapus transaksi "${transaction.keterangan}"?`
    );

    if (!confirmed) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const data = saved ? JSON.parse(saved) : defaultData;

      const updated = data.filter(
        (item) => String(item.id) !== String(transaction.id)
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      router.push("/admin/keuangan/jurnalKas");
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
    }
  };

  if (loading) {
    return (
      <PageShell
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      >
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
        </div>
      </PageShell>
    );
  }

  if (!transaction) {
    return (
      <PageShell
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      >
        <div className="mx-auto max-w-[900px] py-12">
          <div className="theme-card rounded-2xl border p-10 text-center shadow-sm">
            <div className="theme-card-soft theme-text-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
              <FileText size={25} />
            </div>

            <h2 className="theme-text mt-5 text-lg font-bold">
              Transaksi tidak ditemukan
            </h2>

            <p className="theme-text-muted mt-2 text-sm">
              Data transaksi yang kamu cari tidak tersedia.
            </p>

            <Link
              href="/admin/keuangan/jurnalKas"
              className="theme-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition"
            >
              <ArrowLeft size={16} />
              Kembali ke Jurnal Kas
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const isIncome = transaction.jenis === "Pemasukan";

  return (
    <PageShell
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <div className="mx-auto max-w-[1250px]">

        {/* BREADCRUMB */}
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link
            href="/admin/keuangan/jurnalKas"
            className="theme-text-muted transition hover:text-[var(--color-primary)]"
          >
            Jurnal & Kas
          </Link>

          <span className="theme-text-placeholder">/</span>

          <span className="theme-text-secondary font-medium">
            Detail Transaksi
          </span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">

            <div
              className={
                isIncome
                  ? "theme-success flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  : "theme-danger flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              }
            >
              {isIncome ? (
                <ArrowUpRight size={24} />
              ) : (
                <ArrowDownRight size={24} />
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                DETAIL TRANSAKSI
              </p>

              <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {transaction.keterangan}
              </h1>

              <div className="theme-text-muted mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span>ID #{transaction.id}</span>
                <span>•</span>
                <span>{formatDate(transaction.tanggal)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/keuangan/jurnalKas"
              className="theme-input inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>

            <Link
              href={`/admin/keuangan/jurnalKas/edit/${transaction.id}`}
              className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition"
            >
              <Edit size={16} />
              Edit Transaksi
            </Link>

          </div>
        </div>

        {/* STATUS + AMOUNT */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">

          <div
            className={`theme-card relative overflow-hidden rounded-2xl border p-6 shadow-sm`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                isIncome
                  ? "bg-[var(--color-success)]"
                  : "bg-[var(--color-danger)]"
              }`}
            />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                  Nilai Transaksi
                </p>

                <p
                  className={`mt-2 text-3xl font-bold tracking-tight ${
                    isIncome
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {formatCurrency(
                    isIncome
                      ? transaction.kredit
                      : transaction.debit
                  )}
                </p>

                <p className="theme-text-muted mt-2 text-sm">
                  {isIncome
                    ? "Dana masuk ke kas sekolah"
                    : "Dana keluar dari kas sekolah"}
                </p>
              </div>

              <div
                className={
                  isIncome
                    ? "theme-success inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
                    : "theme-danger inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
                }
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isIncome
                      ? "bg-[var(--color-success)]"
                      : "bg-[var(--color-danger)]"
                  }`}
                />

                {transaction.jenis}
              </div>

            </div>
          </div>

          {/* SALDO */}
          <div className="theme-card rounded-2xl border p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="theme-info flex h-10 w-10 items-center justify-center rounded-xl">
                <Wallet size={19} />
              </div>

              <div>
                <p className="theme-text-muted text-[11px] font-medium">
                  Saldo Setelah Transaksi
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    Number(transaction.saldo) >= 0
                      ? "theme-text"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {formatCurrency(transaction.saldo)}
                </p>
              </div>

            </div>

            <div className="theme-border mt-5 border-t pt-4">

              <div className="flex items-center justify-between text-xs">

                <span className="theme-text-muted">
                  Status pencatatan
                </span>

                <span className="flex items-center gap-1.5 font-semibold text-[var(--color-success)]">
                  <CircleCheck size={13} />
                  Tercatat
                </span>

              </div>

            </div>
          </div>

        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">

          {/* DETAIL */}
          <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">

            <div className="theme-border border-b px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                  <ReceiptText size={18} />
                </div>

                <div>

                  <h2 className="theme-text text-sm font-bold">
                    Informasi Transaksi
                  </h2>

                  <p className="theme-text-muted mt-0.5 text-xs">
                    Detail pencatatan transaksi kas sekolah
                  </p>

                </div>

              </div>
            </div>

            <div className="divide-y divide-[var(--color-border-soft)]">

              <DetailRow
                icon={<CalendarDays size={17} />}
                label="Tanggal Transaksi"
                value={formatDate(transaction.tanggal)}
              />

              <DetailRow
                icon={<FileText size={17} />}
                label="Keterangan"
                value={transaction.keterangan}
              />

              <DetailRow
                icon={
                  isIncome ? (
                    <ArrowUpRight size={17} />
                  ) : (
                    <ArrowDownRight size={17} />
                  )
                }
                label="Jenis Transaksi"
                value={transaction.jenis}
                valueClass={
                  isIncome
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-danger)]"
                }
              />

              <DetailRow
                icon={
                  transaction.metode === "Transfer" ? (
                    <CreditCard size={17} />
                  ) : (
                    <Banknote size={17} />
                  )
                }
                label="Metode Pembayaran"
                value={transaction.metode}
              />

              <DetailRow
                icon={<Wallet size={17} />}
                label="Debit"
                value={
                  transaction.debit > 0
                    ? formatCurrency(transaction.debit)
                    : "-"
                }
                valueClass="text-[var(--color-danger)]"
              />

              <DetailRow
                icon={<Wallet size={17} />}
                label="Kredit"
                value={
                  transaction.kredit > 0
                    ? formatCurrency(transaction.kredit)
                    : "-"
                }
                valueClass="text-[var(--color-success)]"
              />

              <DetailRow
                icon={<Wallet size={17} />}
                label="Saldo"
                value={formatCurrency(transaction.saldo)}
                valueClass={
                  Number(transaction.saldo) >= 0
                    ? "theme-text"
                    : "text-[var(--color-danger)]"
                }
              />

            </div>
          </div>

          {/* SIDEBAR DETAIL */}
          <div className="space-y-5">

            {/* INFORMASI PENCATATAN */}
            <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">

              <div className="theme-border border-b px-5 py-4">
                <h2 className="theme-text text-sm font-bold">
                  Informasi Pencatatan
                </h2>
              </div>

              <div className="space-y-5 p-5">

                <MetaItem
                  icon={<User size={16} />}
                  label="Dibuat Oleh"
                  value={transaction.dibuatOleh || "Admin"}
                />

                <MetaItem
                  icon={<Clock3 size={16} />}
                  label="Tanggal Dibuat"
                  value={transaction.tanggalDibuat || "-"}
                />

                <MetaItem
                  icon={<Hash size={16} />}
                  label="ID Transaksi"
                  value={`TRX-${String(transaction.id).padStart(
                    4,
                    "0"
                  )}`}
                />

                <MetaItem
                  icon={<Building2 size={16} />}
                  label="Unit"
                  value="Kas Sekolah"
                />

              </div>
            </div>

            {/* CATATAN */}
            <div className="theme-card rounded-2xl border p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="theme-card-soft theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg border">
                  <FileText size={17} />
                </div>

                <div>

                  <p className="theme-text text-sm font-bold">
                    Catatan
                  </p>

                  <p className="theme-text-muted text-xs">
                    Keterangan tambahan
                  </p>

                </div>

              </div>

              <div className="theme-card-soft theme-border mt-4 rounded-xl border p-4">

                <p className="theme-text-secondary text-sm leading-6">
                  {transaction.catatan ||
                    "Tidak ada catatan tambahan untuk transaksi ini."}
                </p>

              </div>
            </div>

            {/* DANGER ACTION */}
            <div className="theme-danger rounded-2xl border p-5">

              <p className="text-sm font-bold">
                Zona Tindakan
              </p>

              <p className="mt-1 text-xs leading-5 opacity-80">
                Penghapusan transaksi akan menghilangkan data
                dari jurnal kas.
              </p>

              <button
                onClick={handleDelete}
                className="theme-input mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
              >
                <Trash2 size={16} />
                Hapus Transaksi
              </button>

            </div>

          </div>
        </div>

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

function DetailRow({
  icon,
  label,
  value,
  valueClass = "theme-text-secondary",
}) {
  return (
    <div className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center">

      <div className="theme-text-muted flex w-full items-center gap-3 sm:w-[210px]">
        {icon}

        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <div
        className={`text-sm font-semibold ${valueClass}`}
      >
        {value}
      </div>

    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="theme-card-soft theme-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
          {label}
        </p>

        <p className="theme-text-secondary mt-1 break-words text-sm font-semibold">
          {value}
        </p>

      </div>
    </div>
  );
}