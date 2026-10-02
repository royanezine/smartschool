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

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

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
      <div className="theme-page flex h-screen w-full overflow-hidden">
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

          <main className="theme-page flex flex-1 items-center justify-center">
            <div className="text-center">

              <div className="theme-card-soft theme-text-muted mx-auto flex h-14 w-14 items-center justify-center rounded-xl border">
                <FileText size={24} />
              </div>

              <h2 className="theme-text mt-4 text-lg font-bold">
                Transaksi tidak ditemukan
              </h2>

              <p className="theme-text-muted mt-1 text-sm">
                Data transaksi mungkin sudah dihapus.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/admin/keuangan/jurnalKas"
                  )
                }
                className="theme-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
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
                  className="theme-text-muted mb-4 inline-flex items-center gap-2 text-sm font-semibold transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Jurnal Kas
                </button>

                <div className="flex items-center gap-3">

                  <div
                    className={
                      isIncome
                        ? "theme-success flex h-11 w-11 items-center justify-center rounded-xl"
                        : "theme-danger flex h-11 w-11 items-center justify-center rounded-xl"
                    }
                  >
                    {isIncome ? (
                      <ArrowUpRight size={22} />
                    ) : (
                      <ArrowDownRight size={22} />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      DETAIL TRANSAKSI
                    </p>

                    <h1 className="theme-text text-2xl font-bold tracking-tight">
                      {transaction.keterangan}
                    </h1>
                  </div>

                </div>
              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  onClick={() => window.print()}
                  className="theme-input inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-[var(--color-input-hover)]"
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
                  className="theme-primary-outline inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-sidebar-active)]"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="theme-input inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>

              </div>
            </div>

            {/* HERO AMOUNT */}
            <div
              className={
                isIncome
                  ? "theme-success mb-5 overflow-hidden rounded-2xl border"
                  : "theme-danger mb-5 overflow-hidden rounded-2xl border"
              }
            >
              <div className="p-6 sm:p-8">

                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="theme-text-secondary text-xs font-bold uppercase tracking-wider">
                      {transaction.jenis}
                    </p>

                    <p
                      className={
                        isIncome
                          ? "mt-2 text-3xl font-bold tracking-tight text-[var(--color-success)] sm:text-4xl"
                          : "mt-2 text-3xl font-bold tracking-tight text-[var(--color-danger)] sm:text-4xl"
                      }
                    >
                      {formatCurrency(
                        isIncome
                          ? transaction.kredit
                          : transaction.debit
                      )}
                    </p>

                    <div className="theme-text-secondary mt-3 flex items-center gap-2 text-xs">
                      <CalendarDays size={14} />
                      {formatDate(transaction.tanggal)}
                    </div>

                  </div>

                  <div className="theme-card flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm">

                    <Wallet
                      size={30}
                      className={
                        isIncome
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-danger)]"
                      }
                    />

                  </div>

                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">

              {/* DETAIL */}
              <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">

                <div className="theme-border border-b px-5 py-4 sm:px-6">
                  <h2 className="theme-text text-sm font-bold">
                    Informasi Transaksi
                  </h2>
                </div>

                <div className="divide-y divide-[var(--color-border-soft)]">

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
                        ? "theme-text"
                        : "text-[var(--color-danger)]"
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

                <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">

                  <div className="theme-border border-b px-5 py-4">
                    <h3 className="theme-text text-sm font-bold">
                      Rincian Keuangan
                    </h3>
                  </div>

                  <div className="space-y-4 p-5">

                    <MoneyRow
                      label="Debit"
                      value={transaction.debit}
                      color="text-[var(--color-danger)]"
                    />

                    <MoneyRow
                      label="Kredit"
                      value={transaction.kredit}
                      color="text-[var(--color-success)]"
                    />

                    <div className="theme-border border-t pt-4">

                      <div className="flex items-center justify-between">

                        <span className="theme-text-secondary text-xs font-semibold">
                          Saldo
                        </span>

                        <span
                          className={
                            transaction.saldo >= 0
                              ? "text-lg font-bold text-[var(--color-primary)]"
                              : "text-lg font-bold text-[var(--color-danger)]"
                          }
                        >
                          {formatCurrency(
                            transaction.saldo
                          )}
                        </span>

                      </div>
                    </div>

                  </div>
                </div>

                <div className="theme-card overflow-hidden rounded-2xl border p-5 shadow-sm">

                  <div className="flex items-start gap-3">

                    <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <p className="theme-text text-sm font-bold">
                        Transaksi Tercatat
                      </p>

                      <p className="theme-text-muted mt-1 text-xs leading-5">
                        Data transaksi ini tersimpan di
                        jurnal kas sekolah.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="theme-card-soft rounded-xl border p-5">

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-primary)]">
                    SMARTSCHOOL
                  </p>

                  <p className="theme-text mt-2 text-sm font-semibold">
                    Jurnal & Kas Sekolah
                  </p>

                  <p className="theme-text-muted mt-1 text-xs leading-5">
                    Catatan transaksi keuangan resmi
                    sekolah.
                  </p>

                </div>

              </div>
            </div>

            {/* CATATAN */}
            <div className="theme-card mt-5 overflow-hidden rounded-2xl border shadow-sm">

              <div className="theme-border border-b px-5 py-4">
                <h2 className="theme-text text-sm font-bold">
                  Catatan Transaksi
                </h2>
              </div>

              <div className="p-5">
                <p className="theme-text-secondary text-sm leading-7">
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
  valueClass = "theme-text",
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 sm:px-6">

      <div className="theme-card-soft theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="theme-text-muted text-xs">
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

      <span className="theme-text-muted text-xs font-medium">
        {label}
      </span>

      <span className={`text-sm font-bold ${color}`}>
        Rp{" "}
        {Number(value || 0).toLocaleString("id-ID")}
      </span>

    </div>
  );
}
