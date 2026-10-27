"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  Package,
  Sparkles,
  ClipboardList,
  FileText,
  ArrowRight,
  Boxes,
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  getKetersediaanAset,
  getDaftarPeminjaman,
} from "@/services/sarpras.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const colorClasses = {
  primary: {
    badge: `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`,
    iconBg: themePrimaryGradient,
  },
  warning: {
    badge: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    iconBg:
      "bg-[linear-gradient(135deg,var(--color-warning),color-mix(in_srgb,var(--color-warning)_72%,var(--color-primary)))]",
  },
  success: {
    badge: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    iconBg:
      "bg-[linear-gradient(135deg,var(--color-success),color-mix(in_srgb,var(--color-success)_72%,var(--color-primary)))]",
  },
};

const statusClasses = {
  dipinjam: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
  sedang_dipinjam: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
  menunggu: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
  menunggu_persetujuan: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
  disetujui: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
  terlambat: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
  ditolak: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
  selesai: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
};

const statusLabel = {
  dipinjam: "Dipinjam",
  sedang_dipinjam: "Sedang Dipinjam",
  menunggu: "Menunggu",
  menunggu_persetujuan: "Menunggu Persetujuan",
  disetujui: "Disetujui",
  terlambat: "Terlambat",
  ditolak: "Ditolak",
  selesai: "Selesai",
};

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

export default function GuruSarprasIndexPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    tersedia: 0,
    aktif: 0,
    riwayat: 0,
  });
  const [peminjamanAktif, setPeminjamanAktif] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [asetRes, pinjamRes] = await Promise.allSettled([
        getKetersediaanAset(),
        getDaftarPeminjaman({ limit: 50 }),
      ]);

      let countTersedia = 0;
      if (asetRes.status === "fulfilled") {
        const asets = extractList(asetRes.value);
        countTersedia = asets.reduce((acc, curr) => {
          const stok = Number(curr?.jumlahStok ?? curr?.jumlah ?? 0);
          return acc + (stok > 0 ? 1 : 0);
        }, 0);
        if (countTersedia === 0 && asets.length > 0) {
          countTersedia = asets.length;
        }
      }

      let activeItems = [];
      let countAktif = 0;
      let countRiwayat = 0;

      if (pinjamRes.status === "fulfilled") {
        const allLoans = extractList(pinjamRes.value);
        activeItems = allLoans.filter((item) => {
          const st = String(item?.status || "").toLowerCase();
          return (
            st === "menunggu_persetujuan" ||
            st === "menunggu" ||
            st === "disetujui" ||
            st === "sedang_dipinjam" ||
            st === "dipinjam"
          );
        });

        const completedItems = allLoans.filter((item) => {
          const st = String(item?.status || "").toLowerCase();
          return st === "selesai" || st === "ditolak";
        });

        countAktif = activeItems.length;
        countRiwayat = completedItems.length;
      }

      setStats({
        tersedia: countTersedia,
        aktif: countAktif,
        riwayat: countRiwayat,
      });

      setPeminjamanAktif(activeItems.slice(0, 5));
    } catch (err) {
      console.error("Gagal memuat data dashboard sarpras guru:", err);
      setError(
        err?.message || "Gagal memuat ringkasan sarana dan prasarana."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const subHalaman = [
    {
      key: "pinjam",
      href: "/guru/sarpras/pinjam",
      icon: Package,
      color: "primary",
      label: "Pinjam",
      deskripsi:
        "Ajukan peminjaman alat, ruangan, atau fasilitas sekolah untuk kebutuhan mengajar.",
      info: loading
        ? "Memuat..."
        : `${stats.tersedia} item tersedia`,
    },
    {
      key: "peminjaman",
      href: "/guru/sarpras/peminjaman",
      icon: ClipboardList,
      color: "warning",
      label: "Peminjaman",
      deskripsi:
        "Pantau status pengajuan peminjaman yang sedang berjalan atau menunggu persetujuan.",
      info: loading
        ? "Memuat..."
        : `${stats.aktif} pengajuan aktif`,
    },
    {
      key: "riwayat",
      href: "/guru/sarpras/riwayat",
      icon: FileText,
      color: "success",
      label: "Riwayat",
      deskripsi:
        "Lihat catatan lengkap seluruh peminjaman yang telah selesai atau dikembalikan.",
      info: loading
        ? "Memuat..."
        : `${stats.riwayat} riwayat selesai`,
    },
  ];

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="theme-page flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex flex-shrink-0 items-center justify-center rounded-lg p-2 text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow}`}
                  >
                    <Package size={18} />
                  </div>

                  <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                    Sarana Prasarana
                  </h1>
                </div>

                <p className="theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5 text-sm">
                  <Sparkles
                    size={14}
                    className="theme-text-muted flex-shrink-0"
                  />

                  <span className="truncate">
                    Kelola peminjaman alat, ruangan, dan fasilitas sekolah —
                    pilih menu di bawah.
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="theme-input inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-medium transition hover:border-[var(--color-primary)] disabled:opacity-50 sm:self-auto"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Segarkan
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] p-4 text-xs text-[var(--color-danger)]">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={loadData}
                    className="underline hover:opacity-80"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {subHalaman.map((s) => {
                const theme = colorClasses[s.color];

                return (
                  <Link
                    key={s.key}
                    href={s.href}
                    className={`theme-card group flex flex-col gap-3 rounded-xl border p-5 ${themeNeutralBorder} ${themeCardShadow} transition-all hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_9%,transparent)]`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex flex-shrink-0 items-center justify-center rounded-lg p-2.5 text-[var(--color-card)] ${theme.iconBg} ${themeSmallShadow}`}
                      >
                        <s.icon size={18} />
                      </div>

                      <ArrowRight
                        size={16}
                        className="theme-text-muted flex-shrink-0 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-semibold">
                        {s.label}
                      </h2>

                      <p className="theme-text-secondary mt-1 text-xs leading-relaxed">
                        {s.deskripsi}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium ${theme.badge}`}
                    >
                      {s.info}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div
              className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div
                className={`flex items-center justify-between border-b p-4 sm:p-5 ${themeDivider}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralSurface} ${themeNeutralBorder}`}
                  >
                    <Boxes size={16} className="theme-text-secondary" />
                  </div>

                  <h2 className="theme-text text-sm font-semibold">
                    Peminjaman Aktif
                  </h2>
                </div>

                <Link
                  href="/guru/sarpras/peminjaman"
                  className="theme-text-muted inline-flex items-center gap-1 text-xs hover:text-[var(--color-primary)]"
                >
                  Lihat Semua
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div>
                {loading ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-xs text-[var(--color-text-muted)]">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memuat daftar peminjaman aktif...</span>
                  </div>
                ) : peminjamanAktif.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="theme-text-muted text-xs">
                      Belum ada peminjaman aktif saat ini.
                    </p>
                    <Link
                      href="/guru/sarpras/pinjam"
                      className="theme-primary mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition"
                    >
                      <Package size={14} />
                      Ajukan Peminjaman Baru
                    </Link>
                  </div>
                ) : (
                  peminjamanAktif.map((p, idx) => {
                    const isLast = idx === peminjamanAktif.length - 1;
                    const namaAset =
                      p?.detailPeminjaman?.[0]?.aset?.nama ||
                      p?.nomorPeminjaman ||
                      "Peminjaman Sarpras";
                    const kategori =
                      p?.detailPeminjaman?.[0]?.aset?.kategoriAset?.nama ||
                      p?.keperluan ||
                      "Keperluan Mengajar";
                    const statusKey = String(p?.status || "").toLowerCase();
                    const batasWaktu = p?.tanggalRencanaKembali
                      ? `Kembali: ${new Date(
                          p.tanggalRencanaKembali
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}`
                      : p?.tanggalPinjam
                      ? `Pinjam: ${new Date(
                          p.tanggalPinjam
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}`
                      : "-";

                    return (
                      <Link
                        key={p.id || idx}
                        href={`/guru/sarpras/peminjaman/${p.id}`}
                        className={`flex items-center gap-4 p-4 sm:px-5 sm:py-3.5 ${
                          !isLast ? `border-b ${themeDivider}` : ""
                        } ${themeNeutralHover} transition-colors`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="theme-text truncate text-sm font-medium">
                            {namaAset}
                          </p>

                          <p className="theme-text-muted mt-0.5 text-xs truncate">
                            {kategori}
                          </p>
                        </div>

                        <div className="theme-text-secondary flex flex-shrink-0 items-center gap-1.5 text-xs">
                          {statusKey === "terlambat" ? (
                            <AlertTriangle
                              size={12}
                              className="theme-danger"
                            />
                          ) : (
                            <Clock
                              size={12}
                              className="theme-text-muted"
                            />
                          )}

                          <span className="hidden sm:inline">
                            {batasWaktu}
                          </span>
                        </div>

                        <span
                          className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                            statusClasses[statusKey] || statusClasses.menunggu
                          }`}
                        >
                          {statusLabel[statusKey] || statusKey || "Diproses"}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
