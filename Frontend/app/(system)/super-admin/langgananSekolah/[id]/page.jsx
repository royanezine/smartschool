"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  Package,
  CheckCircle,
  XCircle,
  ArrowLeft,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Edit,
  RefreshCw,
  Layers,
  User,
} from "lucide-react";
import { dummyLangganan } from "../../../../../lib/data";

// ============================================================
// THEME HELPERS
// ============================================================

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

const themeCard =
  "theme-card";

const themeBorder =
  "theme-border";

const themeText =
  "theme-text";

const themeTextSecondary =
  "theme-text-secondary";

const themeTextMuted =
  "theme-text-muted";

// ============================================================
// PAGE
// ============================================================

export default function DetailLanggananPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const langganan = dummyLangganan.find(
    (item) => item.id === id
  );

  // ============================================================
  // DATA NOT FOUND
  // ============================================================

  if (!langganan) {
    return (
      <div className="theme-page theme-text min-h-full">
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${themeNeutralSurface} ${themeTextMuted}`}
            >
              <Package size={32} />
            </div>

            <h2 className="text-2xl font-semibold theme-text">
              Langganan tidak ditemukan
            </h2>

            <p className={`mt-1 text-sm ${themeTextMuted}`}>
              Data langganan yang Anda cari tidak tersedia
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/super-admin/langgananSekolah")
              }
              className={`mt-4 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90`}
            >
              Kembali ke Daftar Langganan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const statusLanggananStyleMap = {
    aktif: {
      surface: themeSuccessSurface,
      text: "text-[var(--color-success)]",
      border: themeSuccessBorder,
      dot: "bg-[var(--color-success)]",
      icon: CheckCircle,
    },

    trial: {
      surface: themeWarningSurface,
      text: "text-[var(--color-warning)]",
      border: themeWarningBorder,
      dot: "bg-[var(--color-warning)]",
      icon: CheckCircle,
    },

    nonaktif: {
      surface: themeDangerSurface,
      text: themeTextSecondary,
      border: themeDangerBorder,
      dot: "bg-[var(--color-text-muted)]",
      icon: XCircle,
    },
  };

  const statusPembayaranStyleMap = {
    lunas: {
      surface: themeSuccessSurface,
      text: "text-[var(--color-success)]",
      border: themeSuccessBorder,
    },

    pending: {
      surface: themeWarningSurface,
      text: "text-[var(--color-warning)]",
      border: themeWarningBorder,
    },

    gagal: {
      surface: themeDangerSurface,
      text: themeTextSecondary,
      border: themeDangerBorder,
    },
  };

  const statusStyle =
    statusLanggananStyleMap[
      langganan.statusLangganan
    ] || statusLanggananStyleMap.nonaktif;

  const paymentStyle =
    statusPembayaranStyleMap[
      langganan.statusPembayaran
    ] || statusPembayaranStyleMap.pending;

  const PaketIcon =
    langganan.paket?.icon || Package;

  const StatusIcon =
    statusStyle.icon || CheckCircle;

  // ============================================================
  // FORMATTERS
  // ============================================================

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatRupiah = (angka) => {
    if (!angka) return "Rp0";

    return (
      "Rp" +
      angka.toLocaleString("id-ID")
    );
  };

  const getStatusLanggananLabel = (status) => {
    const map = {
      aktif: "Aktif",
      trial: "Trial",
      nonaktif: "Nonaktif",
    };

    return map[status] || status;
  };

  const getStatusPembayaranLabel = (status) => {
    const map = {
      lunas: "Lunas",
      pending: "Pending",
      gagal: "Gagal",
    };

    return map[status] || status;
  };

  // ============================================================
  // SISA HARI
  // ============================================================

  const sisaHari = Math.ceil(
    (new Date(langganan.tanggalBerakhir) -
      new Date()) /
      (1000 * 60 * 60 * 24)
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* ================================================== */}
        {/* KEMBALI */}
        {/* ================================================== */}

        <button
          type="button"
          onClick={() => router.back()}
          className={`group inline-flex items-center gap-2 text-sm ${themeTextSecondary} transition hover:text-[var(--color-primary)]`}
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />

          Kembali
        </button>

        {/* ================================================== */}
        {/* HEADER DETAIL */}
        {/* ================================================== */}

        <section
          className={`overflow-hidden rounded-2xl border ${themeBorder} ${themeCard} ${themeCardShadow}`}
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {/* Logo */}
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} text-3xl ${themeSmallShadow}`}
                >
                  {langganan.sekolah.logo}
                </div>

                {/* School */}
                <div className="min-w-0">
                  <h1
                    className={`truncate text-xl font-semibold sm:text-2xl ${themeText}`}
                  >
                    {langganan.sekolah.nama}
                  </h1>

                  <p
                    className={`mt-1 text-sm font-mono ${themeTextMuted}`}
                  >
                    ID: {langganan.id}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${statusStyle.surface} ${statusStyle.text} ${statusStyle.border}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                  />

                  <StatusIcon
                    size={14}
                  />

                  {getStatusLanggananLabel(
                    langganan.statusLangganan
                  )}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${paymentStyle.surface} ${paymentStyle.text} ${paymentStyle.border}`}
                >
                  {getStatusPembayaranLabel(
                    langganan.statusPembayaran
                  )}
                </span>
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className={themeTextSecondary}>
                Paket:{" "}
                <span
                  className={`font-medium ${themeText}`}
                >
                  {langganan.paket.nama}
                </span>
              </span>

              <span className={themeTextMuted}>
                |
              </span>

              <span className={themeTextSecondary}>
                Siklus:{" "}
                <span
                  className={`font-medium ${themeText}`}
                >
                  {langganan.siklusPenagihan ===
                  "bulan"
                    ? "Bulanan"
                    : "Tahunan"}
                </span>
              </span>

              {sisaHari > 0 && sisaHari <= 30 && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`}
                >
                  Akan berakhir dalam {sisaHari} hari
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* GRID INFORMASI */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* ================================================== */}
          {/* INFORMASI SEKOLAH */}
          {/* ================================================== */}

          <section
            className={`rounded-2xl border ${themeBorder} ${themeCard} p-4 ${themeCardShadow}`}
          >
            <SectionTitle
              icon={Building2}
              title="Informasi Sekolah"
              tone="primary"
            />

            <div className="mt-4 space-y-3 text-sm">
              <InfoRow
                icon={MapPin}
                value={langganan.sekolah.alamat}
              />

              <InfoRow
                icon={Phone}
                value={
                  langganan.sekolah.telepon || "-"
                }
              />

              <InfoRow
                icon={Mail}
                value={
                  langganan.sekolah.email || "-"
                }
              />

              <InfoRow
                icon={User}
                value={
                  <>
                    Subdomain:{" "}
                    <span className="font-mono">
                      {langganan.sekolah.subdomain}
                    </span>
                  </>
                }
              />
            </div>
          </section>

          {/* ================================================== */}
          {/* DETAIL PAKET */}
          {/* ================================================== */}

          <section
            className={`rounded-2xl border ${themeBorder} ${themeCard} p-4 ${themeCardShadow}`}
          >
            <SectionTitle
              icon={Package}
              title="Paket Langganan"
              tone="info"
            />

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)]`}
                >
                  <PaketIcon size={20} />
                </div>

                <div className="min-w-0">
                  <p
                    className={`font-semibold ${themeText}`}
                  >
                    {langganan.paket.nama}
                  </p>

                  <p
                    className={`text-sm ${themeTextSecondary}`}
                  >
                    {formatRupiah(
                      langganan.hargaSaatBerlangganan
                    )}{" "}
                    /{" "}
                    {langganan.siklusPenagihan ===
                    "bulan"
                      ? "bulan"
                      : "tahun"}
                  </p>
                </div>
              </div>

              <div
                className={`flex flex-wrap items-center gap-3 border-t ${themeDivider} pt-3`}
              >
                <div>
                  <span
                    className={`text-xs ${themeTextMuted}`}
                  >
                    Mulai
                  </span>

                  <p
                    className={`font-medium ${themeText}`}
                  >
                    {formatTanggal(
                      langganan.tanggalMulai
                    )}
                  </p>
                </div>

                <span
                  className={themeTextMuted}
                >
                  →
                </span>

                <div>
                  <span
                    className={`text-xs ${themeTextMuted}`}
                  >
                    Berakhir
                  </span>

                  <p
                    className={`font-medium ${themeText}`}
                  >
                    {formatTanggal(
                      langganan.tanggalBerakhir
                    )}
                  </p>
                </div>

                <div className="ml-auto text-right">
                  <span
                    className={`text-xs ${themeTextMuted}`}
                  >
                    Sisa
                  </span>

                  <p
                    className={`font-medium ${
                      sisaHari > 0
                        ? themeText
                        : "text-[var(--color-warning)]"
                    }`}
                  >
                    {sisaHari > 0
                      ? `${sisaHari} hari`
                      : "Expired"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ================================================== */}
        {/* FITUR AKTIF */}
        {/* ================================================== */}

        <section
          className={`rounded-2xl border ${themeBorder} ${themeCard} p-4 ${themeCardShadow}`}
        >
          <SectionTitle
            icon={Layers}
            title="Fitur Aktif"
            tone="success"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {langganan.fiturAktif &&
            langganan.fiturAktif.length > 0 ? (
              langganan.fiturAktif.map(
                (fitur, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
                  >
                    {fitur}
                  </span>
                )
              )
            ) : (
              <span
                className={`text-sm ${themeTextMuted}`}
              >
                Tidak ada fitur aktif
              </span>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* RIWAYAT PEMBAYARAN */}
        {/* ================================================== */}

        <section
          className={`rounded-2xl border ${themeBorder} ${themeCard} p-4 ${themeCardShadow}`}
        >
          <SectionTitle
            icon={CreditCard}
            title="Riwayat Pembayaran"
            tone="warning"
          />

          {langganan.riwayatPembayaran &&
          langganan.riwayatPembayaran.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-xs sm:text-sm">
                <thead>
                  <tr
                    className={`border-b ${themeDivider}`}
                  >
                    <th
                      className={`py-3 text-left font-medium ${themeTextMuted}`}
                    >
                      Invoice
                    </th>

                    <th
                      className={`py-3 text-left font-medium ${themeTextMuted}`}
                    >
                      Tanggal
                    </th>

                    <th
                      className={`py-3 text-left font-medium ${themeTextMuted}`}
                    >
                      Jumlah
                    </th>

                    <th
                      className={`py-3 text-left font-medium ${themeTextMuted}`}
                    >
                      Metode
                    </th>

                    <th
                      className={`py-3 text-left font-medium ${themeTextMuted}`}
                    >
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {langganan.riwayatPembayaran.map(
                    (pay, idx) => (
                      <tr
                        key={pay.id}
                        className={`border-b ${themeDivider} last:border-0`}
                      >
                        <td
                          className={`py-3 font-mono ${themeTextSecondary}`}
                        >
                          INV-
                          {String(idx + 1).padStart(
                            3,
                            "0"
                          )}
                        </td>

                        <td
                          className={`py-3 ${themeTextSecondary}`}
                        >
                          {formatTanggal(
                            pay.dibuatPada
                          )}
                        </td>

                        <td
                          className={`py-3 font-medium ${themeText}`}
                        >
                          {formatRupiah(
                            pay.jumlah
                          )}
                        </td>

                        <td
                          className={`py-3 ${themeTextMuted}`}
                        >
                          {pay.metode || "-"}
                        </td>

                        <td className="py-3">
                          <PaymentStatusBadge
                            status={pay.status}
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p
              className={`py-4 text-center text-sm ${themeTextMuted}`}
            >
              Belum ada riwayat pembayaran
            </p>
          )}
        </section>

        {/* ================================================== */}
        {/* ACTION BUTTONS */}
        {/* ================================================== */}

        <div
          className={`flex flex-col items-center justify-end gap-3 border-t ${themeDivider} pt-5 sm:flex-row`}
        >
          <button
            type="button"
            onClick={() => router.back()}
            className={`w-full rounded-xl px-5 py-2.5 text-sm font-medium ${themeTextSecondary} ${themeNeutralHover} transition-colors sm:w-auto`}
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/super-admin/langgananSekolah/edit/${langganan.id}`
              )
            }
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90 sm:w-auto`}
          >
            <Edit size={16} />
            Edit Langganan
          </button>

          <button
            type="button"
            onClick={() =>
              alert(
                "Fitur perpanjangan akan segera hadir"
              )
            }
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-semibold ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder} transition hover:opacity-85 sm:w-auto`}
          >
            <RefreshCw size={16} />
            Perpanjang
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  icon: Icon,
  title,
  tone = "primary",
}) {
  const toneMap = {
    primary: {
      wrapper: `${themePrimarySoft} ${themePrimarySoftBorder}`,
      icon: `bg-[var(--color-primary)] text-[var(--color-card)]`,
    },

    info: {
      wrapper: `${themeInfoSurface} ${themeInfoBorder}`,
      icon: `bg-[var(--color-info)] text-[var(--color-card)]`,
    },

    success: {
      wrapper: `${themeSuccessSurface} ${themeSuccessBorder}`,
      icon: `bg-[var(--color-success)] text-[var(--color-card)]`,
    },

    warning: {
      wrapper: `${themeWarningSurface} ${themeWarningBorder}`,
      icon: `bg-[var(--color-warning)] text-[var(--color-card)]`,
    },

    neutral: {
      wrapper: `${themeNeutralSurface} ${themeNeutralBorder}`,
      icon: `${themeCard} ${themeText}`,
    },
  };

  const selected =
    toneMap[tone] || toneMap.primary;

  return (
    <h3
      className={`flex items-center gap-2.5 text-sm font-semibold ${themeText}`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${selected.wrapper}`}
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-md ${selected.icon}`}
        >
          <Icon size={15} />
        </span>
      </span>

      {title}
    </h3>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  icon: Icon,
  value,
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        size={15}
        className={`mt-0.5 shrink-0 ${themeTextMuted}`}
      />

      <span className={themeTextSecondary}>
        {value}
      </span>
    </div>
  );
}

// ============================================================
// PAYMENT STATUS
// ============================================================

function PaymentStatusBadge({ status }) {
  const normalized = String(
    status || ""
  ).toLowerCase();

  let style = {
    surface: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
  };

  if (normalized === "sukses") {
    style = {
      surface: themeSuccessSurface,
      text: "text-[var(--color-success)]",
      border: themeSuccessBorder,
    };
  } else if (normalized === "gagal") {
    style = {
      surface: themeDangerSurface,
      text: themeTextSecondary,
      border: themeDangerBorder,
    };
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${style.surface} ${style.text} ${style.border}`}
    >
      {status || "-"}
    </span>
  );
}