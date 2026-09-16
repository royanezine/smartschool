"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  CalendarDays,
  CreditCard,
  Banknote,
  FileText,
  Edit,
  Trash2,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

const STORAGE_KEY = "smartschool_jurnal_kas";

export default function DetailJurnalKasPage() {
  const router = useRouter();
  const params = useParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    if (!params?.id) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const data = JSON.parse(saved);

      if (!Array.isArray(data)) return;

      const found = data.find(
        (item) =>
          String(item.id) === String(params.id)
      );

      setTransaction(found || null);
    } catch (error) {
      console.error(error);
    }
  }, [params?.id]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const handleDelete = () => {
    if (!transaction) return;

    const confirmed = window.confirm(
      `Hapus transaksi "${transaction.keterangan}"?`
    );

    if (!confirmed) return;

    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      const data = saved
        ? JSON.parse(saved)
        : [];

      const newData = data.filter(
        (item) =>
          String(item.id) !==
          String(transaction.id)
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newData)
      );

      router.push("/admin/keuangan/jurnalKas");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus transaksi.");
    }
  };

  if (!transaction) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F4F6F8]">
        <Sidebar
          active="jurnalKas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
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

          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <FileText size={24} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-800">
                Transaksi tidak ditemukan
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Data transaksi mungkin sudah dihapus.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/admin/keuangan/jurnalKas"
                  )
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isIncome =
    transaction.jenis === "Pemasukan";

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
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">

            {/* TOP */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  onClick={() =>
                    router.push(
                      "/admin/keuangan/jurnalKas"
                    )
                  }
                  className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#2563EB]"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Jurnal Kas
                </button>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isIncome
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight size={22} />
                    ) : (
                      <ArrowDownRight size={22} />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                      DETAIL TRANSAKSI
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                      {transaction.keterangan}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <Printer size={16} />
                  Cetak
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/admin/keuangan/jurnalKas/edit/${transaction.id}`
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#2563EB] transition hover:bg-blue-100"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            </div>

            {/* HERO AMOUNT */}
            <div
              className={`mb-5 overflow-hidden rounded-2xl border ${
                isIncome
                  ? "border-emerald-200 bg-emerald-50/70"
                  : "border-rose-200 bg-rose-50/70"
              }`}
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {transaction.jenis}
                    </p>

                    <p
                      className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
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

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={14} />
                      {formatDate(transaction.tanggal)}
                    </div>
                  </div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Wallet
                      size={30}
                      className={
                        isIncome
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">

              {/* DETAIL */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Informasi Transaksi
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">

                  <DetailRow
                    icon={<FileText size={17} />}
                    label="Keterangan"
                    value={transaction.keterangan}
                  />

                  <DetailRow
                    icon={<CalendarDays size={17} />}
                    label="Tanggal"
                    value={formatDate(
                      transaction.tanggal
                    )}
                  />

                  <DetailRow
                    icon={
                      transaction.metode ===
                      "Transfer" ? (
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
                    label="Saldo Setelah Transaksi"
                    value={formatCurrency(
                      transaction.saldo
                    )}
                    valueClass={
                      transaction.saldo >= 0
                        ? "text-slate-800"
                        : "text-rose-600"
                    }
                  />

                  <DetailRow
                    icon={<User size={17} />}
                    label="Dibuat Oleh"
                    value={
                      transaction.dibuatOleh ||
                      "Admin"
                    }
                  />

                  <DetailRow
                    icon={<Clock3 size={17} />}
                    label="Tanggal Dibuat"
                    value={
                      transaction.tanggalDibuat ||
                      "-"
                    }
                  />
                </div>
              </div>

              {/* SIDE */}
              <div className="space-y-5">

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      Rincian Keuangan
                    </h3>
                  </div>

                  <div className="space-y-4 p-5">
                    <MoneyRow
                      label="Debit"
                      value={transaction.debit}
                      color="text-rose-600"
                    />

                    <MoneyRow
                      label="Kredit"
                      value={transaction.kredit}
                      color="text-emerald-600"
                    />

                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          Saldo
                        </span>

                        <span
                          className={`text-lg font-bold ${
                            transaction.saldo >= 0
                              ? "text-[#1E3A8A]"
                              : "text-rose-600"
                          }`}
                        >
                          {formatCurrency(
                            transaction.saldo
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Transaksi Tercatat
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Data transaksi ini tersimpan di
                        jurnal kas sekolah.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#0F172A] p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300">
                    SMARTSCHOOL
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    Jurnal & Kas Sekolah
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Catatan transaksi keuangan resmi
                    sekolah.
                  </p>
                </div>
              </div>
            </div>

            {/* CATATAN */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Catatan Transaksi
                </h2>
              </div>

              <div className="p-5">
                <p className="text-sm leading-7 text-slate-600">
                  {transaction.catatan ||
                    "Tidak ada catatan untuk transaksi ini."}
                </p>
              </div>
            </div>

            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueClass = "text-slate-800",
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 truncate text-sm font-semibold ${valueClass}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function MoneyRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-400">
        {label}
      </span>

      <span className={`text-sm font-bold ${color}`}>
        Rp{" "}
        {Number(value || 0).toLocaleString("id-ID")}
      </span>
    </div>
  );
}