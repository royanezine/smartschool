"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Package,
  CalendarDays,
  Clock3,
  CheckCircle2,
  Sparkles,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

import {
  getAllLangganan,
  findActiveLangganan,
} from "@/services/langganan.service";
import { getPaket, getPaketById } from "@/services/paket.service";
import {
  formatRupiah,
  formatTanggal,
  sisaHari,
  statusLanggananInfo,
} from "@/lib/langganan";


const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";


function StatusBadge({ status }) {
  const info = statusLanggananInfo(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border ${info.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {info.label}
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="theme-card theme-border rounded-xl border p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium theme-text-muted tracking-wide">
            {title}
          </p>

          <p className="mt-1.5 text-xl sm:text-2xl font-bold theme-text truncate">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[10px] sm:text-xs theme-text-placeholder">
              {description}
            </p>
          )}
        </div>

        <div
          className={`w-9 h-9 shrink-0 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
        >
          <Icon size={17} className={iconClass} />
        </div>
      </div>
    </div>
  );
}


export default function PaketSayaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [langgananError, setLanggananError] = useState("");

  const [langgananList, setLanggananList] = useState([]);
  const [paketTersedia, setPaketTersedia] = useState([]);
  const [detailAktif, setDetailAktif] = useState(null);

  const [billingCycle, setBillingCycle] = useState("bulanan");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setLanggananError("");

    const [langgananRes, paketRes] = await Promise.allSettled([
      getAllLangganan(),
      getPaket(),
    ]);

    if (paketRes.status === "rejected") {
      setPaketTersedia([]);
      setLanggananList([]);
      setDetailAktif(null);
      setError(
        paketRes.reason?.message || "Gagal memuat daftar paket."
      );
      setLoading(false);
      return;
    }

    setPaketTersedia(paketRes.value?.data ?? []);

    if (langgananRes.status === "rejected") {
      setLanggananList([]);
      setDetailAktif(null);
      setLanggananError(
        langgananRes.reason?.message ||
          "Gagal memuat data langganan sekolah."
      );
      setLoading(false);
      return;
    }

    const langganan = langgananRes.value ?? [];

    setLanggananList(langganan);

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

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const aktif = useMemo(
    () => findActiveLangganan(langgananList),
    [langgananList]
  );

  const hariTersisa = sisaHari(aktif?.tanggalBerakhir);

  const hargaTampil = useMemo(() => {
    const hargaBulanan = Number(
      detailAktif?.harga ?? aktif?.hargaSaatBerlangganan ?? 0
    );

    return billingCycle === "tahunan" ? hargaBulanan * 12 : hargaBulanan;
  }, [billingCycle, detailAktif, aktif]);

  const namaPaket = detailAktif?.nama ?? aktif?.paket?.nama ?? "-";

  const fitur = Array.isArray(detailAktif?.fitur) ? detailAktif.fitur : [];

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="paketLangganan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header notifications={[]} />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] ${themePrimaryShadow}`}
                >
                  <Package size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Paket Saya
                  </h1>

                  <p className="text-sm theme-text-secondary">
                    Informasi paket langganan sekolah Anda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadData}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition-colors`}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {loading && (
              <div className="theme-card theme-border rounded-xl border p-14 flex flex-col items-center gap-3">
                <Loader2
                  size={26}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="text-sm theme-text-secondary">
                  Memuat data langganan...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="theme-danger rounded-xl border p-5 flex items-start gap-3">
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
                {langgananError && (
                  <div className="theme-warning rounded-xl border p-4 flex items-start gap-3">
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">
                        Data langganan tidak dapat dimuat
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        {langgananError} Daftar paket tetap dapat dilihat di
                        bawah.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard
                    title="Paket Aktif"
                    value={namaPaket}
                    description={
                      aktif ? "Paket yang sedang digunakan" : "Belum ada paket"
                    }
                    icon={Package}
                  />

                  <StatCard
                    title="Status"
                    value={
                      aktif
                        ? statusLanggananInfo(aktif.statusLangganan).label
                        : "Belum Berlangganan"
                    }
                    description="Status langganan sekolah"
                    icon={CheckCircle2}
                    iconClass="text-[var(--color-success)]"
                  />

                  <StatCard
                    title="Sisa Masa Aktif"
                    value={
                      hariTersisa !== null ? `${hariTersisa} Hari` : "-"
                    }
                    description="Sebelum masa paket berakhir"
                    icon={CalendarDays}
                  />

                  <StatCard
                    title="Tagihan"
                    value={
                      aktif
                        ? formatRupiah(
                            aktif.hargaSaatBerlangganan ?? detailAktif?.harga
                          )
                        : "-"
                    }
                    description={`Per ${(
                      aktif?.siklusPenagihan ?? "monthly"
                    ) === "annual" ? "tahun" : "bulan"}`}
                    icon={CreditCard}
                  />
                </div>

                {!aktif && (
                  <section className="theme-card theme-border rounded-xl border p-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg theme-warning flex items-center justify-center shrink-0">
                        <AlertCircle
                          size={18}
                          className="text-[var(--color-warning)]"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold theme-text">
                          Sekolah belum memiliki langganan aktif
                        </p>
                        <p className="text-xs theme-text-secondary mt-1 leading-5">
                          Pilih salah satu paket di bawah untuk mulai
                          berlangganan. Akses fitur akan aktif setelah
                          pembayaran terverifikasi.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {aktif && (
                  <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] overflow-hidden">
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-14 h-14 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] flex items-center justify-center ${themePrimaryShadow} shrink-0`}
                          >
                            <Sparkles size={27} />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-xl font-bold theme-text">
                                {namaPaket}
                              </h2>
                              <StatusBadge status={aktif.statusLangganan} />
                            </div>

                            {detailAktif?.deskripsi && (
                              <p className="text-sm theme-text-secondary mt-1.5 max-w-2xl">
                                {detailAktif.deskripsi}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/admin/langganan/checkout/${aktif.paketId}`
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition"
                          >
                            <Wallet size={15} />
                            Perpanjang
                          </button>

                          <a
                            href="#paket-tersedia"
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                          >
                            <ArrowUpRight size={15} />
                            Ganti Paket
                          </a>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="theme-card-soft theme-border rounded-xl border p-4">
                          <div className="flex items-center gap-2 theme-text-secondary">
                            <Wallet
                              size={15}
                              className="text-[var(--color-primary)]"
                            />
                            <span className="text-xs font-medium">
                              Harga Langganan
                            </span>
                          </div>

                          <p className="text-xl font-bold theme-text mt-2">
                            {formatRupiah(hargaTampil)}
                          </p>

                          <div className="mt-3 inline-flex items-center gap-1 theme-card-soft theme-border border rounded-lg p-1">
                            {["bulanan", "tahunan"].map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setBillingCycle(item)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                                  billingCycle === item
                                    ? `${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder} border shadow-sm`
                                    : `theme-text-muted ${themeTextHover}`
                                }`}
                              >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="theme-card-soft theme-border rounded-xl border p-4">
                          <div className="flex items-center gap-2 theme-text-secondary">
                            <CalendarDays
                              size={15}
                              className="text-[var(--color-primary)]"
                            />
                            <span className="text-xs font-medium">
                              Periode Aktif
                            </span>
                          </div>

                          <p className="text-sm font-bold theme-text mt-2">
                            {formatTanggal(aktif.tanggalMulai)}
                          </p>

                          <p className="text-xs theme-text-placeholder mt-1">
                            sampai
                          </p>

                          <p className="text-sm font-bold theme-text">
                            {formatTanggal(aktif.tanggalBerakhir)}
                          </p>
                        </div>

                        <div className="theme-card-soft theme-border rounded-xl border p-4">
                          <div className="flex items-center gap-2 theme-text-secondary">
                            <Clock3
                              size={15}
                              className="text-[var(--color-primary)]"
                            />
                            <span className="text-xs font-medium">
                              Masa Aktif
                            </span>
                          </div>

                          <p className="text-xl font-bold theme-text mt-2">
                            {hariTersisa !== null ? `${hariTersisa} Hari` : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-7 theme-border-soft border-t pt-6">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-bold theme-text">
                            Fitur yang Tersedia
                          </h3>

                          <ShieldCheck
                            size={18}
                            className="text-[var(--color-primary)]"
                          />
                        </div>

                        {fitur.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                            {fitur.map((item) => (
                              <div
                                key={item.id || item.kode || item.nama}
                                className={`flex items-start gap-3 p-3 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border`}
                              >
                                <div className="w-5 h-5 rounded-full theme-success flex items-center justify-center shrink-0 mt-0.5">
                                  <Check
                                    size={12}
                                    className="text-[var(--color-success)]"
                                  />
                                </div>

                                <span className="text-sm theme-text-secondary">
                                  {item.nama}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs theme-text-placeholder mt-3">
                            Daftar fitur paket belum tersedia.
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                <section id="paket-tersedia" className="scroll-mt-24">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold theme-text">
                      Paket yang Tersedia
                    </h2>
                    <p className="text-sm theme-text-secondary mt-1">
                      Harga dan fitur sesuai data paket sekolah dari sistem.
                    </p>
                  </div>

                  {paketTersedia.length === 0 ? (
                    <div className="theme-card theme-border rounded-xl border p-8 text-center">
                      <p className="text-sm theme-text-secondary">
                        Belum ada paket aktif yang tersedia.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {paketTersedia.map((item) => {
                        const sedangDipakai =
                          aktif?.paketId === item.id;

                        return (
                          <div
                            key={item.id}
                            className={`theme-card theme-border rounded-xl border p-5 flex flex-col ${
                              sedangDipakai
                                ? "ring-1 ring-[var(--color-primary)]"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div
                                className={`w-11 h-11 rounded-xl ${themePrimarySoft} text-[var(--color-primary)] flex items-center justify-center`}
                              >
                                <Package size={20} />
                              </div>

                              {sedangDipakai && (
                                <span className="theme-success rounded-full px-2 py-1 text-[9px] font-bold">
                                  AKTIF
                                </span>
                              )}
                            </div>

                            <h3 className="mt-4 text-lg font-bold theme-text">
                              {item.nama}
                            </h3>

                            {item.deskripsi && (
                              <p className="mt-1.5 text-xs leading-5 theme-text-secondary min-h-[40px]">
                                {item.deskripsi}
                              </p>
                            )}

                            <div className="mt-4">
                              <span className="text-2xl font-bold theme-text">
                                {formatRupiah(item.harga)}
                              </span>
                              <span className="ml-1 text-xs theme-text-placeholder">
                                / bulan
                              </span>
                            </div>

                            <p className="text-[11px] theme-text-placeholder mt-1">
                              {item.fitur?.length ?? 0} fitur termasuk
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/langganan/checkout/${item.id}`
                                )
                              }
                              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                                sedangDipakai
                                  ? "border theme-border theme-card theme-text-secondary hover:text-[var(--color-primary)]"
                                  : "bg-[var(--color-primary)] text-white hover:opacity-90"
                              }`}
                            >
                              {sedangDipakai
                                ? "Perpanjang Paket"
                                : "Pilih Paket"}
                              <ArrowUpRight size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="theme-card theme-border rounded-xl border p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg theme-warning flex items-center justify-center shrink-0">
                      <AlertCircle
                        size={17}
                        className="text-[var(--color-warning)]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold theme-text">
                        Informasi langganan
                      </p>

                      <p className="text-xs theme-text-secondary mt-1 leading-5">
                        Langganan hanya aktif setelah pembayaran terverifikasi
                        oleh sistem. Pastikan perpanjangan dilakukan sebelum
                        masa aktif berakhir.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
