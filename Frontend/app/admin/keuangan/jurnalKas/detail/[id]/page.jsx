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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1E3A8A]" />
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
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#0F172A]">
              Transaksi tidak ditemukan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Data transaksi yang kamu cari tidak tersedia.
            </p>

            <Link
              href="/admin/keuangan/jurnalKas"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172F70]"
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
            className="text-slate-400 transition hover:text-[#1E3A8A]"
          >
            Jurnal & Kas
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-medium text-slate-600">
            Detail Transaksi
          </span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                isIncome
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {isIncome ? (
                <ArrowUpRight size={24} />
              ) : (
                <ArrowDownRight size={24} />
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                DETAIL TRANSAKSI
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                {transaction.keterangan}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>ID #{transaction.id}</span>
                <span>•</span>
                <span>{formatDate(transaction.tanggal)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/keuangan/jurnalKas"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>

            <Link
              href={`/admin/keuangan/jurnalKas/edit/${transaction.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172F70]"
            >
              <Edit size={16} />
              Edit Transaksi
            </Link>
          </div>
        </div>

        {/* STATUS + AMOUNT */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div
            className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm ${
              isIncome
                ? "border-emerald-100"
                : "border-rose-100"
            }`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                isIncome
                  ? "bg-emerald-500"
                  : "bg-rose-500"
              }`}
            />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nilai Transaksi
                </p>

                <p
                  className={`mt-2 text-3xl font-bold tracking-tight ${
                    isIncome
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {formatCurrency(
                    isIncome
                      ? transaction.kredit
                      : transaction.debit
                  )}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {isIncome
                    ? "Dana masuk ke kas sekolah"
                    : "Dana keluar dari kas sekolah"}
                </p>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                  isIncome
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isIncome
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  }`}
                />

                {transaction.jenis}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#0F172A] p-6 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Wallet size={19} />
              </div>

              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  Saldo Setelah Transaksi
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    Number(transaction.saldo) >= 0
                      ? "text-white"
                      : "text-rose-300"
                  }`}
                >
                  {formatCurrency(transaction.saldo)}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Status pencatatan
                </span>

                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
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
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                  <ReceiptText size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Informasi Transaksi
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Detail pencatatan transaksi kas sekolah
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
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
                    ? "text-emerald-600"
                    : "text-rose-600"
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
                valueClass="text-rose-600"
              />

              <DetailRow
                icon={<Wallet size={17} />}
                label="Kredit"
                value={
                  transaction.kredit > 0
                    ? formatCurrency(transaction.kredit)
                    : "-"
                }
                valueClass="text-emerald-600"
              />

              <DetailRow
                icon={<Wallet size={17} />}
                label="Saldo"
                value={formatCurrency(transaction.saldo)}
                valueClass={
                  Number(transaction.saldo) >= 0
                    ? "text-[#0F172A]"
                    : "text-rose-600"
                }
              />
            </div>
          </div>

          {/* SIDEBAR DETAIL */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-bold text-[#0F172A]">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileText size={17} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#0F172A]">
                    Catatan
                  </p>

                  <p className="text-xs text-slate-400">
                    Keterangan tambahan
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  {transaction.catatan ||
                    "Tidak ada catatan tambahan untuk transaksi ini."}
                </p>
              </div>
            </div>

            {/* DANGER ACTION */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5">
              <p className="text-sm font-bold text-rose-700">
                Zona Tindakan
              </p>

              <p className="mt-1 text-xs leading-5 text-rose-600/70">
                Penghapusan transaksi akan menghilangkan data
                dari jurnal kas.
              </p>

              <button
                onClick={handleDelete}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
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

function DetailRow({
  icon,
  label,
  value,
  valueClass = "text-slate-700",
}) {
  return (
    <div className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center">
      <div className="flex w-full items-center gap-3 text-slate-400 sm:w-[210px]">
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

function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}