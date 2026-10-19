"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Crown,
  FileText,
  History,
  Info,
  Loader2,
  Package,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import {
  findActiveLangganan,
  getAllLangganan,
  getRiwayatPembayaran,
} from "@/services/langganan.service";
import { getPaket, getPaketById } from "@/services/paket.service";
import {
  formatRupiah,
  formatTanggal,
  sisaHari,
  siklusLabel,
  statusLanggananInfo,
  statusPembayaranInfo,
} from "@/lib/langganan";

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeCardShadow =
  "shadow-[0_8px_30px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_15px_40px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const info = statusLanggananInfo(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${info.className}`}
    >
      <CheckCircle2 size={12} />
      {info.label}
    </span>
  );
}

function RiwayatStatusBadge({ status }) {
  const info = statusPembayaranInfo(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${info.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LanggananPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [langgananList, setLanggananList] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [paketTersedia, setPaketTersedia] = useState([]);
  const [detailAktif, setDetailAktif] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [langganan, riwayatData, paket] = await Promise.all([
        getAllLangganan(),
        getRiwayatPembayaran(),
        getPaket(),
      ]);

      setLanggananList(langganan);
      setRiwayat(riwayatData);
      setPaketTersedia(paket?.data ?? []);

      const aktif = findActiveLangganan(langganan);

      if (aktif?.paketId) {
        try {
          const detail = await getPaketById(aktif.paketId);
          setDetailAktif(detail?.data ?? null);
        } catch (err) {
          setDetailAktif(null);
        }
      } else {
        setDetailAktif(null);
      }
    } catch (err) {
      setError(err?.message || "Gagal memuat data langganan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const aktif = useMemo(
    () => findActiveLangganan(langgananList),
    [langgananList]
  );

  const hariTersisa = sisaHari(aktif?.tanggalBerakhir);

  const fitur = Array.isArray(detailAktif?.fitur) ? detailAktif.fitur : [];

  const riwayatTerbaru = riwayat.slice(0, 3);

  return (
    <div className="flex h-screen min-h-0 overflow-hidden theme-page">
      <Sidebar role="admin" active="langganan" setActive={() => {}} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header notifications={[]} />

        <main className="min-h-0 flex-1 overflow-y-auto theme-page">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {/* LOADING */}
            {loading && (
              <div className="theme-card theme-border rounded-2xl border p-16 flex flex-col items-center gap-3">
                <Loader2
                  size={28}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="text-sm theme-text-secondary">
                  Memuat data langganan...
                </p>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="theme-danger rounded-2xl border p-5 flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Gagal memuat langganan
                  </p>
                  <p className="text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* HERO */}
                <section className="relative mb-6 overflow-hidden rounded-[28px] bg-[var(--color-primary)] shadow-[0_20px_55px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
                  <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

                  <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_400px] lg:px-10 lg:py-9">
                    <div className="flex flex-col justify-center">
                      <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                        <Crown size={13} />
                        SmartSchool Subscription
                      </div>

                      <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[38px] lg:leading-tight">
                        Langganan SmartSchool
                      </h1>

                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
                        Kelola paket sekolah, masa berlangganan, pembayaran,
                        dan invoice dalam satu tempat.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href="/admin/langganan/paket"
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/90"
                        >
                          <Package size={17} />
                          Lihat Paket
                        </Link>

                        <Link
                          href="/admin/langganan/riwayat-pembayaran"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                        >
                          <History size={17} />
                          Riwayat Pembayaran
                        </Link>
                      </div>
                    </div>

                    {/* CURRENT PLAN */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-white/55">
                            Paket {aktif ? "aktif" : "belum dipilih"}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white">
                              {detailAktif?.nama ??
                                aktif?.paket?.nama ??
                                "Belum Berlangganan"}
                            </h2>

                            {aktif && (
                              <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold text-white">
                                {statusLanggananInfo(
                                  aktif.statusLangganan
                                ).label.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                          <Crown size={20} />
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-2xl font-bold text-white">
                          {aktif
                            ? formatRupiah(
                                aktif.hargaSaatBerlangganan ??
                                  detailAktif?.harga
                              )
                            : "-"}
                          {aktif && (
                            <span className="ml-1 text-xs font-medium text-white/45">
                              /{" "}
                              {aktif.siklusPenagihan === "annual"
                                ? "tahun"
                                : "bulan"}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/[0.06] p-3">
                          <p className="text-[10px] text-white/45">
                            Berlaku sampai
                          </p>
                          <p className="mt-1 text-xs font-semibold text-white">
                            {aktif
                              ? formatTanggal(aktif.tanggalBerakhir)
                              : "-"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/[0.06] p-3">
                          <p className="text-[10px] text-white/45">
                            Sisa masa aktif
                          </p>
                          <p className="mt-1 text-xs font-semibold text-white">
                            {hariTersisa !== null
                              ? `${hariTersisa} hari`
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* QUICK NAVIGATION */}
                <section className="mb-7 grid gap-4 sm:grid-cols-3">
                  <Link
                    href="/admin/langganan/paket"
                    className={`group theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} transition ${themeCardHoverShadow} hover:-translate-y-0.5`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                      >
                        <Package size={19} />
                      </div>
                      <ArrowUpRight
                        size={17}
                        className="theme-text-placeholder transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                      />
                    </div>
                    <p className="mt-4 text-sm font-bold theme-text">
                      Paket Langganan
                    </p>
                    <p className="mt-1 text-xs leading-5 theme-text-secondary">
                      Bandingkan paket dan fitur SmartSchool.
                    </p>
                  </Link>

                  <Link
                    href="/admin/langganan/riwayat-pembayaran"
                    className={`group theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} transition ${themeCardHoverShadow} hover:-translate-y-0.5`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                      >
                        <History size={19} />
                      </div>
                      <ArrowUpRight
                        size={17}
                        className="theme-text-placeholder transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                      />
                    </div>
                    <p className="mt-4 text-sm font-bold theme-text">
                      Riwayat Pembayaran
                    </p>
                    <p className="mt-1 text-xs leading-5 theme-text-secondary">
                      Lihat seluruh transaksi pembayaran sekolah.
                    </p>
                  </Link>

                  <Link
                    href="/admin/langganan/invoice"
                    className={`group theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} transition ${themeCardHoverShadow} hover:-translate-y-0.5`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                      >
                        <Receipt size={19} />
                      </div>
                      <ArrowUpRight
                        size={17}
                        className="theme-text-placeholder transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                      />
                    </div>
                    <p className="mt-4 text-sm font-bold theme-text">
                      Tagihan / Invoice
                    </p>
                    <p className="mt-1 text-xs leading-5 theme-text-secondary">
                      Kelola tagihan dan unduh invoice pembayaran.
                    </p>
                  </Link>
                </section>

                {/* PLAN STATUS */}
                <section className="mb-7">
                  <div
                    className={`overflow-hidden theme-card theme-border rounded-2xl border ${themeCardShadow}`}
                  >
                    <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                            Paket aktif
                          </p>

                          <h2 className="mt-1 text-lg font-bold theme-text">
                            {detailAktif?.nama ??
                              aktif?.paket?.nama ??
                              "Belum Berlangganan"}
                          </h2>

                          {(detailAktif?.deskripsi ||
                            aktif?.paket?.deskripsi) && (
                            <p className="mt-1 text-sm theme-text-secondary">
                              {detailAktif?.deskripsi ??
                                aktif?.paket?.deskripsi}
                            </p>
                          )}
                        </div>

                        {aktif ? (
                          <StatusBadge status={aktif.statusLangganan} />
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border theme-text-muted theme-border">
                            <AlertCircle size={12} />
                            Belum Berlangganan
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                      <div className="theme-card-soft rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={16}
                            className="text-[var(--color-primary)]"
                          />
                          <span className="text-xs font-semibold theme-text-secondary">
                            Periode Langganan
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-bold theme-text">
                          {aktif ? formatTanggal(aktif.tanggalMulai) : "-"}
                        </p>

                        <p className="mt-1 text-xs theme-text-placeholder">
                          sampai {aktif ? formatTanggal(aktif.tanggalBerakhir) : "-"}
                        </p>
                      </div>

                      <div className="theme-card-soft rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard
                            size={16}
                            className="text-[var(--color-primary)]"
                          />
                          <span className="text-xs font-semibold theme-text-secondary">
                            Biaya Langganan
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-bold theme-text">
                          {aktif
                            ? formatRupiah(
                                aktif.hargaSaatBerlangganan ??
                                  detailAktif?.harga
                              )
                            : "-"}
                        </p>

                        <p className="mt-1 text-xs theme-text-placeholder">
                          {aktif
                            ? `Pembayaran setiap ${siklusLabel(
                                aktif.siklusPenagihan
                              ).toLowerCase()}`
                            : "Belum ada tagihan"}
                        </p>
                      </div>
                    </div>

                    {aktif &&
                      hariTersisa !== null &&
                      hariTersisa <= 30 && (
                        <div
                          className={`mx-5 mb-5 rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-4 sm:mx-6 sm:mb-6`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-card text-[var(--color-primary)]">
                              <BellRing size={15} />
                            </div>
                            <div>
                              <p className="text-xs font-bold theme-text">
                                Langganan akan segera berakhir
                              </p>
                              <p className="mt-1 text-[11px] leading-5 theme-text-secondary">
                                Masa aktif berakhir dalam{" "}
                                <strong className="text-[var(--color-primary)]">
                                  {hariTersisa} hari
                                </strong>
                                . Perpanjang agar seluruh fitur tetap dapat
                                digunakan.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="theme-border-soft flex flex-col gap-2 border-t p-5 sm:flex-row sm:justify-end sm:px-6">
                      <Link
                        href="/admin/langganan/paket"
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-xs font-semibold theme-text-secondary transition ${themeTextHover} hover:text-[var(--color-primary)]`}
                      >
                        Lihat Paket
                      </Link>

                      <Link
                        href={
                          aktif?.paketId
                            ? `/admin/langganan/checkout/${aktif.paketId}`
                            : "/admin/langganan/paket"
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-95"
                      >
                        <CreditCard size={15} />
                        {aktif ? "Perpanjang Langganan" : "Pilih Paket"}
                      </Link>
                    </div>
                  </div>
                </section>

                {/* FITUR */}
                <section className="mb-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
                  <div className="relative overflow-hidden rounded-2xl bg-[var(--color-primary)] p-6 text-white shadow-[0_16px_45px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]">
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Sparkles size={19} />
                      </div>

                      <h2 className="mt-5 text-xl font-bold">
                        Fitur{" "}
                        {detailAktif?.nama ??
                          aktif?.paket?.nama ??
                          "Langganan"}
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-white/75">
                        Modul yang tersedia sesuai paket langganan sekolah.
                      </p>

                      <div className="mt-6 flex items-end gap-2">
                        <span className="text-3xl font-bold">
                          {fitur.length}
                        </span>
                        <span className="pb-1 text-xs text-white/60">
                          modul aktif
                        </span>
                      </div>

                      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.08] p-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck
                            size={17}
                            className="mt-0.5 shrink-0 text-white/80"
                          />
                          <p className="text-[11px] leading-5 text-white/75">
                            Paket aktif memberikan akses ke modul akademik dan
                            operasional sekolah.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} sm:p-6`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                          Modul tersedia
                        </p>
                        <h2 className="mt-1 text-lg font-bold theme-text">
                          Fitur yang termasuk
                        </h2>
                      </div>

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                      >
                        <Sparkles size={18} />
                      </div>
                    </div>

                    {fitur.length > 0 ? (
                      <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                        {fitur.map((feature) => (
                          <div
                            key={feature.id || feature.kode || feature.nama}
                            className="flex items-center gap-2.5"
                          >
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full theme-success">
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="text-xs font-medium theme-text-secondary">
                              {feature.nama}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-6 text-xs theme-text-placeholder">
                        {aktif
                          ? "Daftar fitur paket belum tersedia."
                          : "Pilih paket untuk melihat fitur yang tersedia."}
                      </p>
                    )}

                    <div className="theme-border-soft mt-6 border-t pt-5">
                      <Link
                        href="/admin/langganan/paket"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
                      >
                        Bandingkan semua paket
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </section>

                {/* PAYMENT HISTORY */}
                <section
                  className={`mb-7 theme-card theme-border rounded-2xl border ${themeCardShadow}`}
                >
                  <div className="theme-border-soft flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                        Pembayaran
                      </p>
                      <h2 className="mt-1 text-lg font-bold theme-text">
                        Riwayat pembayaran
                      </h2>
                      <p className="mt-1 text-sm theme-text-secondary">
                        Beberapa transaksi pembayaran terakhir.
                      </p>
                    </div>

                    <Link
                      href="/admin/langganan/riwayat-pembayaran"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
                    >
                      Lihat semua
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                  {riwayatTerbaru.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div
                        className={`mx-auto w-12 h-12 rounded-full ${themePrimarySoft} flex items-center justify-center`}
                      >
                        <Receipt
                          size={20}
                          className="text-[var(--color-primary)]"
                        />
                      </div>
                      <p className="text-sm font-semibold theme-text-secondary mt-3">
                        Belum ada transaksi
                      </p>
                      <p className="text-xs theme-text-placeholder mt-1">
                        Riwayat pembayaran akan muncul setelah Anda
                        berlangganan.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* DESKTOP */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[700px]">
                          <thead>
                            <tr className="theme-card-soft theme-border-soft border-b">
                              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                                Invoice
                              </th>
                              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                                Tanggal
                              </th>
                              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                                Paket
                              </th>
                              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                                Jumlah
                              </th>
                              <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                                Status
                              </th>
                              <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                                Aksi
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {riwayatTerbaru.map((item) => (
                              <tr
                                key={item.id}
                                className={`theme-border-soft border-b last:border-0 transition ${themeTextHover}`}
                              >
                                <td className="px-6 py-4">
                                  <span className="text-xs font-bold text-[var(--color-primary)] break-all">
                                    {item.midtransInvoiceId ?? "-"}
                                  </span>
                                </td>

                                <td className="px-6 py-4 text-xs theme-text-secondary">
                                  {formatTanggal(item.dibuatPada)}
                                </td>

                                <td className="px-6 py-4">
                                  <span className="text-xs font-semibold theme-text-secondary">
                                    {item.langgananSekolah?.paket?.nama ?? "-"}
                                  </span>
                                </td>

                                <td className="px-6 py-4 text-right text-xs font-bold theme-text">
                                  {formatRupiah(item.jumlah)}
                                </td>

                                <td className="px-6 py-4 text-center">
                                  <RiwayatStatusBadge status={item.status} />
                                </td>

                                <td className="px-6 py-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/admin/langganan/riwayat-pembayaran/${item.id}`
                                      )
                                    }
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg theme-text-placeholder transition ${themePrimarySoft} hover:text-[var(--color-primary)]`}
                                    title="Lihat detail"
                                  >
                                    <FileText size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* MOBILE */}
                      <div className="theme-border-soft divide-y md:hidden">
                        {riwayatTerbaru.map((item) => (
                          <div key={item.id} className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[var(--color-primary)] break-all">
                                  {item.midtransInvoiceId ?? "-"}
                                </p>
                                <p className="mt-1 text-[11px] theme-text-placeholder">
                                  {formatTanggal(item.dibuatPada)}
                                </p>
                              </div>

                              <RiwayatStatusBadge status={item.status} />
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <p className="text-[10px] theme-text-placeholder">
                                  Paket
                                </p>
                                <p className="mt-1 text-xs font-semibold theme-text-secondary">
                                  {item.langgananSekolah?.paket?.nama ?? "-"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-[10px] theme-text-placeholder">
                                  Jumlah
                                </p>
                                <p className="mt-1 text-xs font-bold theme-text">
                                  {formatRupiah(item.jumlah)}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/langganan/riwayat-pembayaran/${item.id}`
                                )
                              }
                              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border theme-border theme-card px-3 py-2.5 text-xs font-semibold theme-text-secondary transition ${themeTextHover} hover:text-[var(--color-primary)]`}
                            >
                              <FileText size={14} />
                              Lihat Detail
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>

                {/* PLAN COMPARISON */}
                <section className="mb-7">
                  <div className="mb-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Paket
                    </p>
                    <h2 className="mt-1 text-lg font-bold theme-text">
                      Pilihan paket SmartSchool
                    </h2>
                    <p className="mt-1 text-sm theme-text-secondary">
                      Pilih paket yang paling sesuai dengan kebutuhan sekolah.
                    </p>
                  </div>

                  {paketTersedia.length === 0 ? (
                    <div className="theme-card theme-border rounded-2xl border p-8 text-center">
                      <p className="text-sm theme-text-secondary">
                        Belum ada paket aktif yang tersedia.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-5 lg:grid-cols-3">
                      {paketTersedia.map((plan) => {
                        const isCurrent = aktif?.paketId === plan.id;

                        return (
                          <div
                            key={plan.id}
                            className={`relative overflow-hidden rounded-2xl border theme-card p-6 ${themeCardShadow} transition-all duration-300 hover:-translate-y-1 ${themeCardHoverShadow} ${
                              isCurrent
                                ? "border-[var(--color-primary)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                                : "theme-border"
                            }`}
                          >
                            {isCurrent && (
                              <div
                                className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full ${themePrimarySoft} px-2.5 py-1 text-[9px] font-bold text-[var(--color-primary)]`}
                              >
                                <CheckCircle2 size={10} />
                                AKTIF
                              </div>
                            )}

                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                            >
                              <Package size={20} />
                            </div>

                            <div className="mt-5">
                              <h3 className="text-lg font-bold theme-text">
                                {plan.nama}
                              </h3>

                              {plan.deskripsi && (
                                <p className="mt-2 min-h-[40px] text-xs leading-5 theme-text-secondary">
                                  {plan.deskripsi}
                                </p>
                              )}

                              <div className="mt-5">
                                <span className="text-2xl font-bold theme-text">
                                  {formatRupiah(plan.harga)}
                                </span>
                                <span className="ml-1 text-xs theme-text-placeholder">
                                  / bulan
                                </span>
                              </div>
                            </div>

                            <div className="theme-border-soft my-6 border-t" />

                            <div className="space-y-3">
                              {(plan.fitur ?? []).slice(0, 6).map((feature) => (
                                <div
                                  key={feature.id || feature.kode || feature.nama}
                                  className="flex items-start gap-2.5"
                                >
                                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full theme-success">
                                    <Check size={10} strokeWidth={3} />
                                  </div>
                                  <span className="text-xs theme-text-secondary">
                                    {feature.nama}
                                  </span>
                                </div>
                              ))}

                              {(plan.fitur?.length ?? 0) > 6 && (
                                <p className="text-[11px] theme-text-placeholder">
                                  +{(plan.fitur?.length ?? 0) - 6} fitur lainnya
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/langganan/checkout/${plan.id}`
                                )
                              }
                              className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                                isCurrent
                                  ? "bg-[var(--color-primary)] text-white hover:brightness-95"
                                  : "border theme-border theme-card theme-text-secondary hover:text-[var(--color-primary)]"
                              }`}
                            >
                              {isCurrent ? "Perpanjang Paket" : "Pilih Paket"}
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* INFORMATION */}
                <section className="mb-7 grid gap-5 md:grid-cols-3">
                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                    >
                      <ShieldCheck size={19} />
                    </div>
                    <h3 className="mt-4 text-sm font-bold theme-text">
                      Data tetap aman
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 theme-text-secondary">
                      Data sekolah dan aktivitas pengguna dikelola dalam sistem
                      yang terintegrasi.
                    </p>
                  </div>

                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                    >
                      <RefreshCw size={19} />
                    </div>
                    <h3 className="mt-4 text-sm font-bold theme-text">
                      Perpanjangan mudah
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 theme-text-secondary">
                      Perpanjang paket kapan saja tanpa perlu mengatur ulang
                      data sekolah.
                    </p>
                  </div>

                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                    >
                      <Info size={19} />
                    </div>
                    <h3 className="mt-4 text-sm font-bold theme-text">
                      Butuh bantuan?
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 theme-text-secondary">
                      Hubungi administrator SmartSchool jika ada masalah terkait
                      paket atau pembayaran.
                    </p>
                  </div>
                </section>

                {/* FOOTER */}
                <div className="theme-border-soft flex flex-col gap-3 border-t py-5 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <WalletCards size={15} />
                    <span>SmartSchool · Manajemen Langganan</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {aktif ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2
                          size={13}
                          className="text-[var(--color-success)]"
                        />
                        Langganan aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3
                          size={13}
                          className="text-[var(--color-warning)]"
                        />
                        Belum berlangganan
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
