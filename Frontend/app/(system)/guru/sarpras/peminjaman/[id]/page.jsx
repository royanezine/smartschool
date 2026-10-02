"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ClipboardList,
  Package,
  Projector,
  Dumbbell,
  DoorOpen,
  Laptop,
  Wrench,
  CalendarDays,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Info,
  User,
  FileText,
  MessageSquare,
  ArrowRightLeft,
} from "lucide-react";

import { getDetailPeminjaman } from "@/services/sarpras.service";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// =========================================================
// STATUS CONFIG
// =========================================================

const statusConfig = {
  menunggu_persetujuan: {
    label: "Menunggu Persetujuan",
    icon: Hourglass,
    pill: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    dot: "bg-[var(--color-warning)]",
    desc: "Pengajuan sedang menunggu persetujuan admin sarana prasarana.",
  },

  disetujui: {
    label: "Disetujui",
    icon: CheckCircle2,
    pill: `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`,
    dot: "bg-[var(--color-primary)]",
    desc: "Pengajuan telah disetujui. Silakan ambil aset sesuai jadwal.",
  },

  dipinjam: {
    label: "Sedang Berlangsung",
    icon: Clock,
    pill: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
    dot: "bg-[var(--color-info)]",
    desc: "Aset sedang dipinjam. Pastikan dikembalikan sesuai jadwal.",
  },

  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    pill: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
    dot: "bg-[var(--color-text-muted)]",
    desc: "Pengajuan ditolak. Silakan lihat alasan penolakan di bawah.",
  },

  dikembalikan: {
    label: "Selesai",
    icon: CheckCircle2,
    pill: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    dot: "bg-[var(--color-success)]",
    desc: "Peminjaman telah selesai. Terima kasih sudah mengembalikan aset.",
  },
};

function getStatusConfig(status) {
  return (
    statusConfig[status] || {
      label: status || "Tidak diketahui",
      icon: AlertTriangle,
      pill: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
      dot: "bg-[var(--color-text-muted)]",
      desc: "Status peminjaman tidak dikenali.",
    }
  );
}

// =========================================================
// HELPERS
// =========================================================

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTanggalLengkap(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getAssetIcon(nama = "") {
  const value = nama.toLowerCase();

  if (
    value.includes("proyektor") ||
    value.includes("projector")
  ) {
    return Projector;
  }

  if (
    value.includes("speaker") ||
    value.includes("sound")
  ) {
    return Package;
  }

  if (
    value.includes("laptop") ||
    value.includes("komputer")
  ) {
    return Laptop;
  }

  if (
    value.includes("ruang") ||
    value.includes("kelas") ||
    value.includes("lab")
  ) {
    return DoorOpen;
  }

  if (
    value.includes("olahraga") ||
    value.includes("matras") ||
    value.includes("bola")
  ) {
    return Dumbbell;
  }

  return Wrench;
}

// =========================================================
// PAGE
// =========================================================

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
      title: "Peminjaman Sarpras",
      desc: "Pantau status pengajuan peminjaman",
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

        const data =
          response?.data ??
          response?.data?.data ??
          response;

        setDetail(data || null);
      } catch (err) {
        if (!mounted) return;

        console.error(
          "Gagal mengambil detail peminjaman:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil detail peminjaman."
        );

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
    router.push("/guru/sarpras/peminjaman");
  };

  const status = detail
    ? getStatusConfig(detail.status)
    : null;

  const StatusIcon = status?.icon;

  const totalUnit =
    (detail?.detailPeminjaman || []).reduce(
      (total, item) =>
        total + Number(item?.jumlah || 0),
      0
    ) || 0;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
          notifications={notifications}
          user={{
            name: "Guru",
            email: "guru@smartschool.com",
            avatar: "GU",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              className={`theme-text-secondary inline-flex items-center gap-2 text-xs font-semibold transition-colors hover:text-[var(--color-primary)]`}
            >
              <span
                className={`theme-card ${themeNeutralBorder} flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:border-[var(--color-primary)]`}
              >
                <ArrowLeft size={14} />
              </span>

              Kembali ke Peminjaman Saya
            </button>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div
                className={`theme-card ${themeNeutralBorder} ${themeCardShadow} flex flex-col items-center justify-center rounded-xl border py-16`}
              >
                <Loader2
                  size={24}
                  className={`${themePrimaryText} animate-spin`}
                />

                <p className="theme-text-secondary mt-3 text-sm">
                  Memuat detail peminjaman...
                </p>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (
              <div
                className={`theme-card ${themeNeutralBorder} ${themeCardShadow} rounded-xl border p-6`}
              >
                <div
                  className={`flex items-start gap-3 rounded-lg border ${themeDangerBorder} ${themeDangerSurface} p-4`}
                >
                  <div
                    className={`theme-card theme-danger flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder}`}
                  >
                    <AlertTriangle size={15} />
                  </div>

                  <div className="flex-1">
                    <p className="theme-danger text-sm font-bold">
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
                  className={`mt-5 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  Kembali ke Daftar
                </button>
              </div>
            )}

            {/* =================================================
                NOT FOUND
            ================================================= */}

            {!loading && !error && !detail && (
              <div
                className={`theme-card ${themeNeutralBorder} flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <ClipboardList size={20} />
                </div>

                <p className="theme-text mt-4 text-sm font-bold">
                  Detail tidak ditemukan
                </p>

                <p className="theme-text-secondary mt-1 text-xs">
                  Data peminjaman tidak tersedia atau
                  sudah dihapus.
                </p>

                <button
                  type="button"
                  onClick={handleBack}
                  className={`mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  Kembali ke Daftar
                </button>
              </div>
            )}

            {/* =================================================
                DETAIL CONTENT
            ================================================= */}

            {!loading && !error && detail && (
              <div className="space-y-5">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div
                  className={`relative overflow-hidden rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  <div
                    className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] blur-2xl"
                  />

                  <div
                    className="absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--color-card)_8%,transparent)] blur-2xl"
                  />

                  <div className="relative p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-card)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]"
                        >
                          <ClipboardList size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] opacity-75">
                            Nomor Peminjaman
                          </p>

                          <h1 className="mt-1 break-all font-mono text-lg font-bold sm:text-xl">
                            {detail.nomorPeminjaman || "-"}
                          </h1>

                          <p className="mt-1.5 text-xs opacity-80">
                            Diajukan pada{" "}
                            {formatTanggalLengkap(
                              detail.tanggalPengajuan
                            )}
                          </p>
                        </div>
                      </div>

                      {status && StatusIcon && (
                        <span
                          className="inline-flex flex-shrink-0 items-center gap-1.5 self-start rounded-md border border-[color-mix(in_srgb,var(--color-card)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm"
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      )}
                    </div>

                    {/* STATUS NOTE */}

                    {status?.desc && (
                      <div
                        className="mt-4 flex items-start gap-2.5 rounded-lg border border-[color-mix(in_srgb,var(--color-card)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-3.5 py-2.5 backdrop-blur-sm"
                      >
                        <Info
                          size={13}
                          className="mt-0.5 flex-shrink-0 opacity-80"
                        />

                        <p className="text-xs leading-relaxed opacity-90">
                          {status.desc}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ==========================================
                    QUICK STATS
                ========================================== */}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Tanggal Pinjam"
                    value={formatTanggal(
                      detail.tanggalPinjam
                    )}
                  />

                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Rencana Kembali"
                    value={formatTanggal(
                      detail.tanggalKembaliRencana
                    )}
                  />

                  <StatCard
                    icon={<Package size={15} />}
                    label="Total Unit"
                    value={`${totalUnit} unit`}
                  />

                  <StatCard
                    icon={<User size={15} />}
                    label="Petugas"
                    value={
                      detail.petugas?.namaLengkap || "-"
                    }
                  />
                </div>

                {/* ==========================================
                    MAIN GRID
                ========================================== */}

                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

                  {/* LEFT COLUMN */}

                  <div className="space-y-5">

                    {/* DAFTAR ASET */}

                    <div
                      className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                    >
                      <div
                        className={`flex items-center justify-between gap-4 border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                          >
                            <Package size={15} />
                          </div>

                          <div>
                            <p className="theme-text text-sm font-bold">
                              Aset yang Dipinjam
                            </p>

                            <p className="theme-text-muted mt-0.5 text-[11px]">
                              {
                                (
                                  detail.detailPeminjaman ||
                                  []
                                ).length
                              }{" "}
                              jenis aset • {totalUnit} total
                              unit
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        {(
                          detail.detailPeminjaman || []
                        ).length > 0 ? (
                          <div className="space-y-2">
                            {(
                              detail.detailPeminjaman || []
                            ).map((item) => {
                              const ItemIcon =
                                getAssetIcon(
                                  item?.aset?.nama
                                );

                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-center gap-3 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5 transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]`}
                                >
                                  <div
                                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                                  >
                                    <ItemIcon size={16} />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="theme-text truncate text-sm font-semibold">
                                      {item?.aset?.nama ||
                                        "Aset"}
                                    </p>

                                    <p className="theme-text-muted mt-0.5 font-mono text-[11px]">
                                      {item?.aset?.kode ||
                                        "-"}
                                    </p>
                                  </div>

                                  <span
                                    className={`flex-shrink-0 rounded-md border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-2.5 py-1 text-xs font-semibold`}
                                  >
                                    {item.jumlah} unit
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            className={`rounded-lg border border-dashed ${themePrimarySoftBorder} px-4 py-10 text-center`}
                          >
                            <Info
                              size={18}
                              className={`${themePrimaryText} mx-auto`}
                            />

                            <p className="theme-text-secondary mt-2 text-xs">
                              Detail aset tidak tersedia.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KEPERLUAN */}

                    <InfoBlock
                      icon={<FileText size={15} />}
                      title="Keperluan Peminjaman"
                      content={
                        detail.keperluan || "-"
                      }
                    />

                    {/* CATATAN */}

                    {detail.catatanPeminjaman && (
                      <InfoBlock
                        icon={
                          <MessageSquare size={15} />
                        }
                        title="Catatan"
                        content={
                          detail.catatanPeminjaman
                        }
                      />
                    )}

                    {/* ALASAN PENOLAKAN */}

                    {detail.status === "ditolak" &&
                      detail.catatanPenolakan && (
                        <div
                          className={`theme-card ${themeDangerBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                        >
                          <div className="flex items-stretch">
                            <div className="w-1 flex-shrink-0 bg-[var(--color-text-muted)]" />

                            <div className="flex-1 px-5 py-4">
                              <div className="mb-3 flex items-center gap-3">
                                <div
                                  className={`theme-danger flex h-9 w-9 items-center justify-center rounded-lg border ${themeDangerBorder} ${themeDangerSurface}`}
                                >
                                  <XCircle size={15} />
                                </div>

                                <div>
                                  <p className="theme-text text-sm font-bold">
                                    Alasan Penolakan
                                  </p>

                                  <p className="theme-text-muted text-[11px]">
                                    Pengajuan ini tidak
                                    dapat disetujui
                                  </p>
                                </div>
                              </div>

                              <p className="theme-text-secondary text-sm leading-relaxed">
                                {
                                  detail.catatanPenolakan
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* RIGHT COLUMN */}

                  <aside className="space-y-5 lg:sticky lg:top-6">

                    {/* INFORMASI PEMINJAMAN */}

                    <div
                      className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                    >
                      <div
                        className={`flex items-center gap-3 border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <Clock size={14} />
                        </div>

                        <div>
                          <p className="theme-text text-sm font-bold">
                            Informasi Peminjaman
                          </p>

                          <p className="theme-text-muted mt-0.5 text-[11px]">
                            Detail waktu dan petugas
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3.5 px-5 py-4">
                        <InfoRow
                          label="Tanggal Pengajuan"
                          value={formatTanggalLengkap(
                            detail.tanggalPengajuan
                          )}
                        />

                        <Divider />

                        <InfoRow
                          label="Tanggal Pinjam"
                          value={formatTanggal(
                            detail.tanggalPinjam
                          )}
                        />

                        <Divider />

                        <InfoRow
                          label="Rencana Kembali"
                          value={formatTanggal(
                            detail.tanggalKembaliRencana
                          )}
                        />

                        <Divider />

                        <InfoRow
                          label="Petugas"
                          value={
                            detail.petugas
                              ?.namaLengkap || "-"
                          }
                        />
                      </div>
                    </div>

                    {/* SISWA TERKAIT */}

                    {(detail.siswaPengambilId ||
                      detail.siswaPengembaliId) && (
                      <div
                        className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                      >
                        <div
                          className={`flex items-center gap-3 border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                          >
                            <ArrowRightLeft
                              size={14}
                            />
                          </div>

                          <div>
                            <p className="theme-text text-sm font-bold">
                              Siswa Terkait
                            </p>

                            <p className="theme-text-muted mt-0.5 text-[11px]">
                              Yang mengambil &
                              mengembalikan
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 px-5 py-4">
                          {detail.siswaPengambilId && (
                            <InfoRow
                              label="Siswa Pengambil"
                              value={
                                detail.namaSiswaPengambil ||
                                "-"
                              }
                            />
                          )}

                          {detail.siswaPengambilId &&
                            detail.siswaPengembaliId && (
                              <Divider />
                            )}

                          {detail.siswaPengembaliId && (
                            <InfoRow
                              label="Siswa Pengembali"
                              value={
                                detail.namaSiswaPengembali ||
                                "-"
                              }
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* ACTION BUTTON */}

                    <button
                      type="button"
                      onClick={handleBack}
                      className={`theme-card ${themeNeutralBorder} theme-text-secondary w-full rounded-lg border px-4 py-2.5 text-xs font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
                    >
                      Kembali ke Peminjaman Saya
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

// =========================================================
// SUB COMPONENTS
// =========================================================

function StatCard({ icon, label, value }) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4 transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)]`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted truncate text-[10px] font-semibold uppercase tracking-wider">
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

function InfoBlock({
  icon,
  title,
  content,
}) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
    >
      <div
        className={`flex items-center gap-3 border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
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

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="theme-text-secondary flex-shrink-0">
        {label}
      </span>

      <span className="theme-text text-right font-semibold">
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      className={`h-px w-full ${themeDivider.replace(
        "border-",
        "bg-"
      )}`}
    />
  );
}