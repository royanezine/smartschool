"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Package,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  UserRound,
  CalendarDays,
  FileText,
  Boxes,
  AlertCircle,
  Loader2,
  Hash,
  Check,
  HandCoins,
  Undo2,
} from "lucide-react";

import { getDetailPeminjaman } from "@/services/sarpras.service";

/* =========================================================
   STATUS
========================================================= */

const STATUS = {
  MENUNGGU: "menunggu_persetujuan",
  DISETUJUI: "disetujui",
  DITOLAK: "ditolak",
  DIPINJAM: "dipinjam",
  DIKEMBALIKAN: "dikembalikan",
};

const STATUS_LABEL = {
  menunggu_persetujuan: "Menunggu Persetujuan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  dipinjam: "Dipinjam",
  dikembalikan: "Dikembalikan",
};

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-info))]";

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

const themeDividerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]";

const themePrimaryBorderHover =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_42%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* =========================================================
   STATUS CONFIG
========================================================= */

const getStatusConfig = (status) => {
  switch (status) {
    case STATUS.MENUNGGU:
      return {
        label: "Menunggu",
        className:
          "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
        dot: "bg-[var(--color-warning)]",
        icon: Clock3,
      };

    case STATUS.DISETUJUI:
      return {
        label: "Disetujui",
        className:
          "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)] border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]",
        dot: "bg-[var(--color-info)]",
        icon: CheckCircle2,
      };

    case STATUS.DITOLAK:
      return {
        label: "Ditolak",
        className:
          `${themeDangerSurface} text-[var(--color-text)] ${themeDangerBorder}`,
        dot: "bg-[var(--color-text)]",
        icon: XCircle,
      };

    case STATUS.DIPINJAM:
      return {
        label: "Dipinjam",
        className:
          "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]",
        dot: "bg-[var(--color-primary)]",
        icon: Package,
      };

    case STATUS.DIKEMBALIKAN:
      return {
        label: "Dikembalikan",
        className:
          "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
        dot: "bg-[var(--color-success)]",
        icon: RotateCcw,
      };

    default:
      return {
        label: status || "-",
        className:
          `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
        dot: "bg-[var(--color-text-muted)]",
        icon: ClipboardList,
      };
  }
};

/* =========================================================
   HELPERS
========================================================= */

const formatTanggal = (v) => {
  if (!v) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(v));
  } catch {
    return "-";
  }
};

const formatTanggalWaktu = (v) => {
  if (!v) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(v));
  } catch {
    return "-";
  }
};

/* =========================================================
   PAGE
========================================================= */

export default function DetailPeminjamanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Detail Peminjaman",
      desc: "Detail pengajuan peminjaman",
      read: false,
    },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("ID peminjaman tidak ditemukan.");
          return;
        }

        const response = await getDetailPeminjaman(id);

        if (!mounted) return;

        setDetail(response?.data ?? response);
      } catch (err) {
        if (!mounted) return;

        console.error(err);
        setError(err?.message || "Gagal mengambil detail peminjaman.");
        setDetail(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBack = () => {
    router.push("/admin/sarpras/peminjaman");
  };

  const bukaAksi = (type) => {
    router.push(
      `/admin/sarpras/peminjaman/${id}/aksi?type=${type}`
    );
  };

  const cfg = detail ? getStatusConfig(detail.status) : null;
  const StatusIcon = cfg?.icon;

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen((v) => !v)}
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] space-y-5 p-4 sm:p-6 lg:p-8">

            {/* BACK */}
            <button
              type="button"
              onClick={handleBack}
              className={`theme-text inline-flex items-center gap-2 text-xs font-semibold transition-colors ${themePrimaryText}`}
            >
              <span
                className={`theme-card flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimaryBorder} transition-colors ${themePrimaryBorderHover}`}
              >
                <ArrowLeft size={14} />
              </span>

              Kembali ke Peminjaman
            </button>

            {/* LOADING */}
            {loading && (
              <div
                className={`theme-card flex flex-col items-center justify-center rounded-xl border ${themePrimaryBorder} py-16 ${themeCardShadow}`}
              >
                <Loader2
                  size={26}
                  className={`${themePrimaryText} animate-spin`}
                />

                <p className="theme-text-secondary mt-3 text-sm">
                  Memuat detail peminjaman...
                </p>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div
                className={`theme-card rounded-xl border ${themePrimaryBorder} p-6 ${themeCardShadow}`}
              >
                <div
                  className={`flex items-start gap-3 rounded-lg border ${themeDangerBorder} ${themeDangerSurface} p-4`}
                >
                  <div
                    className={`theme-card flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder} theme-text`}
                  >
                    <AlertCircle size={15} />
                  </div>

                  <div>
                    <p className="theme-text text-sm font-bold">
                      Gagal memuat detail
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      {error}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  className={`mt-5 flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold ${themePrimaryGradient} text-[var(--color-card)] transition-all ${themePrimaryHover} ${themePrimaryShadow}`}
                >
                  Kembali ke Daftar
                </button>
              </div>
            )}

            {/* NOT FOUND */}
            {!loading && !error && !detail && (
              <div
                className={`theme-card rounded-xl border border-dashed ${themePrimaryBorder} py-16 text-center ${themeCardShadow}`}
              >
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <ClipboardList size={20} />
                </div>

                <p className="theme-text mt-4 text-sm font-bold">
                  Detail tidak ditemukan
                </p>

                <p className="theme-text-secondary mt-1 text-xs">
                  Data peminjaman tidak tersedia atau sudah dihapus.
                </p>

                <button
                  type="button"
                  onClick={handleBack}
                  className={`mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${themePrimaryGradient} text-[var(--color-card)] transition-all ${themePrimaryHover} ${themePrimaryShadow}`}
                >
                  Kembali ke Daftar
                </button>
              </div>
            )}

            {/* DETAIL */}
            {!loading && !error && detail && (
              <div className="space-y-5">

                {/* HEADER CARD */}
                <div
                  className={`theme-card overflow-hidden rounded-xl border ${themePrimaryBorder} ${themeCardShadow}`}
                >
                  <div className="flex items-stretch">
                    <div
                      className={`w-1 flex-shrink-0 ${themePrimaryGradient}`}
                    />

                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                          >
                            <ClipboardList size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text-muted text-[10px] font-bold uppercase tracking-[0.15em]">
                              Nomor Peminjaman
                            </p>

                            <h1 className="theme-text mt-1 break-all font-mono text-lg font-bold sm:text-xl">
                              {detail.nomorPeminjaman || "-"}
                            </h1>

                            <p className="theme-text-secondary mt-1.5 text-xs">
                              Diajukan pada{" "}
                              {formatTanggalWaktu(detail.tanggalPengajuan)}
                            </p>
                          </div>
                        </div>

                        {cfg && StatusIcon && (
                          <span
                            className={`inline-flex flex-shrink-0 items-center gap-1.5 self-start rounded-md border px-2.5 py-1 text-[11px] font-semibold ${cfg.className}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                            />

                            {STATUS_LABEL[detail.status] || cfg.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QUICK STATS */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatCard
                    icon={<UserRound size={15} />}
                    label="Peminjam"
                    value={detail.peminjam?.namaLengkap || "-"}
                  />

                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Tgl Pinjam"
                    value={formatTanggal(detail.tanggalPinjam)}
                  />

                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Rencana Kembali"
                    value={formatTanggal(detail.tanggalKembaliRencana)}
                  />

                  <StatCard
                    icon={<RotateCcw size={15} />}
                    label="Aktual Kembali"
                    value={formatTanggalWaktu(detail.tanggalKembaliAktual)}
                  />
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

                  {/* LEFT */}
                  <div className="space-y-5">

                    {/* DAFTAR ASET */}
                    <div
                      className={`theme-card overflow-hidden rounded-xl border ${themePrimaryBorder} ${themeCardShadow}`}
                    >
                      <div
                        className={`flex items-center gap-3 border-b ${themeDividerBorder} ${themeNeutralSurface} px-5 py-4`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <Boxes size={15} />
                        </div>

                        <div>
                          <p className="theme-text text-sm font-bold">
                            Aset yang Dipinjam
                          </p>

                          <p className="theme-text-secondary mt-0.5 text-[11px]">
                            {detail.detailPeminjaman?.length || 0} jenis aset
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 p-4 sm:p-5">
                        {detail.detailPeminjaman?.map((item) => (
                          <div
                            key={item.id}
                            className={`theme-card flex items-center gap-3 rounded-lg border ${themePrimaryBorder} p-3.5 transition-colors ${themePrimaryBorderHover}`}
                          >
                            <div
                              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                            >
                              <Package size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="theme-text truncate text-sm font-semibold">
                                {item.aset?.nama || "-"}
                              </p>

                              <p className="theme-text-muted mt-0.5 flex items-center gap-1 font-mono text-[10px]">
                                <Hash size={10} />
                                {item.aset?.kode || "-"}
                              </p>
                            </div>

                            <span
                              className={`flex-shrink-0 rounded-md border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-2.5 py-1 text-xs font-semibold`}
                            >
                              ×{item.jumlah}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KEPERLUAN */}
                    <InfoBlock
                      icon={<FileText size={15} />}
                      title="Keperluan"
                      content={detail.keperluan || "-"}
                    />

                    {/* CATATAN PEMINJAMAN */}
                    {detail.catatanPeminjaman && (
                      <InfoBlock
                        icon={<ClipboardList size={15} />}
                        title="Catatan Peminjaman"
                        content={detail.catatanPeminjaman}
                      />
                    )}

                    {/* CATATAN PENOLAKAN */}
                    {detail.catatanPenolakan && (
                      <div
                        className={`theme-card overflow-hidden rounded-xl border ${themeDangerBorder} ${themeCardShadow}`}
                      >
                        <div className="flex items-stretch">
                          <div
                            className={`w-1 flex-shrink-0 bg-[var(--color-text)]`}
                          />

                          <div className="flex-1 px-5 py-4">
                            <div className="mb-3 flex items-center gap-3">
                              <div
                                className={`theme-card flex h-9 w-9 items-center justify-center rounded-lg border ${themeDangerBorder} ${themeDangerSurface} theme-text`}
                              >
                                <XCircle size={15} />
                              </div>

                              <div>
                                <p className="theme-text text-sm font-bold">
                                  Alasan Penolakan
                                </p>
                              </div>
                            </div>

                            <p className="theme-text-secondary text-sm leading-relaxed">
                              {detail.catatanPenolakan}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SISWA PENGAMBIL */}
                    {(detail.namaSiswaPengambil ||
                      detail.siswaPengambil) && (
                      <InfoBlock
                        icon={<UserRound size={15} />}
                        title="Siswa Pengambil"
                        content={
                          detail.siswaPengambil?.namaLengkap ||
                          detail.namaSiswaPengambil ||
                          "-"
                        }
                      />
                    )}

                    {/* SISWA PENGEMBALI */}
                    {(detail.namaSiswaPengembali ||
                      detail.siswaPengembali) && (
                      <InfoBlock
                        icon={<Undo2 size={15} />}
                        title="Siswa Pengembali"
                        content={
                          detail.siswaPengembali?.namaLengkap ||
                          detail.namaSiswaPengembali ||
                          "-"
                        }
                      />
                    )}
                  </div>

                  {/* RIGHT — ACTIONS */}
                  <aside className="space-y-5 lg:sticky lg:top-6">
                    <div
                      className={`theme-card overflow-hidden rounded-xl border ${themePrimaryBorder} ${themeCardShadow}`}
                    >
                      <div
                        className={`flex items-center gap-3 border-b ${themeDividerBorder} ${themeNeutralSurface} px-5 py-4`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <CheckCircle2 size={14} />
                        </div>

                        <p className="theme-text text-sm font-bold">
                          Aksi Peminjaman
                        </p>
                      </div>

                      <div className="space-y-2.5 p-4">

                        {/* MENUNGGU */}
                        {detail.status === STATUS.MENUNGGU && (
                          <>
                            <button
                              type="button"
                              onClick={() => bukaAksi("setujui")}
                              className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[var(--color-card)] transition-all ${themePrimaryGradient} ${themePrimaryHover} ${themePrimaryShadow}`}
                            >
                              <Check size={15} />
                              Setujui Pengajuan
                            </button>

                            <button
                              type="button"
                              onClick={() => bukaAksi("tolak")}
                              className={`theme-text flex h-11 w-full items-center justify-center gap-2 rounded-lg border ${themeDangerBorder} ${themeDangerSurface} text-sm font-semibold transition-colors ${themeNeutralHover}`}
                            >
                              <XCircle size={15} />
                              Tolak Pengajuan
                            </button>
                          </>
                        )}

                        {/* DISETUJUI */}
                        {detail.status === STATUS.DISETUJUI && (
                          <button
                            type="button"
                            onClick={() => bukaAksi("serahkan")}
                            className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[var(--color-card)] transition-all ${themePrimaryGradient} ${themePrimaryHover} ${themePrimaryShadow}`}
                          >
                            <HandCoins size={15} />
                            Serahkan Aset
                          </button>
                        )}

                        {/* DIPINJAM */}
                        {detail.status === STATUS.DIPINJAM && (
                          <button
                            type="button"
                            onClick={() => bukaAksi("kembalikan")}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-success)] text-sm font-semibold text-[var(--color-card)] transition-opacity hover:opacity-90"
                          >
                            <Undo2 size={15} />
                            Proses Pengembalian
                          </button>
                        )}

                        {/* NO ACTION */}
                        {[STATUS.DITOLAK, STATUS.DIKEMBALIKAN].includes(
                          detail.status
                        ) && (
                          <div
                            className={`rounded-lg border ${themePrimaryBorder} ${themeNeutralSurface} p-3 text-center`}
                          >
                            <p className="theme-text-secondary text-[11px]">
                              Tidak ada aksi tersedia untuk status ini.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BACK BUTTON */}
                    <button
                      type="button"
                      onClick={handleBack}
                      className={`theme-card theme-text flex h-10 w-full items-center justify-center rounded-lg border ${themePrimaryBorder} text-xs font-semibold transition-colors ${themePrimaryBorderHover} ${themePrimarySoft}`}
                    >
                      Kembali ke Daftar
                    </button>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SUB COMPONENTS
========================================================= */

function StatCard({ icon, label, value }) {
  return (
    <div
      className={`theme-card rounded-xl border ${themePrimaryBorder} p-4 ${themeCardShadow}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted truncate text-[10px] font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-0.5 truncate text-sm font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon, title, content }) {
  return (
    <div
      className={`theme-card overflow-hidden rounded-xl border ${themePrimaryBorder} ${themeCardShadow}`}
    >
      <div
        className={`flex items-center gap-3 border-b ${themeDividerBorder} ${themeNeutralSurface} px-5 py-4`}
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
        >
          {icon}
        </div>

        <p className="theme-text text-sm font-bold">
          {title}
        </p>
      </div>

      <div className="px-5 py-4">
        <p className="theme-text-secondary text-sm leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}