"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Package,
  ClipboardList,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Ban,
  HandCoins,
  Undo2,
  Hash,
} from "lucide-react";

import {
  getDetailPeminjaman,
  verifikasiPeminjaman,
  serahkanPeminjaman,
  kembalikanPeminjaman,
} from "@/services/sarpras.service";

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryBorderStrong =
  "border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryButton =
  "bg-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]";

const themePrimaryFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText =
  "text-[var(--color-warning)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeSuccessText =
  "text-[var(--color-success)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

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

const ACTION_CONFIG = {
  setujui: {
    title: "Setujui Pengajuan",
    subtitle: "Konfirmasi persetujuan peminjaman aset",
    icon: CheckCircle2,
    primaryLabel: "Setujui Pengajuan",
    primaryClass: themePrimaryButton,
  },

  tolak: {
    title: "Tolak Pengajuan",
    subtitle: "Berikan alasan penolakan pengajuan",
    icon: Ban,
    primaryLabel: "Tolak Pengajuan",
    primaryClass:
      "bg-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-text)_88%,var(--color-primary))]",
  },

  serahkan: {
    title: "Serahkan Aset",
    subtitle: "Catat siswa pengambil dan kondisi aset",
    icon: HandCoins,
    primaryLabel: "Konfirmasi Penyerahan",
    primaryClass: themePrimaryButton,
  },

  kembalikan: {
    title: "Proses Pengembalian",
    subtitle: "Catat siswa pengembali dan kondisi aset",
    icon: Undo2,
    primaryLabel: "Konfirmasi Pengembalian",
    primaryClass:
      "bg-[var(--color-success)] hover:bg-[color-mix(in_srgb,var(--color-success)_88%,var(--color-text))]",
  },
};

/* =========================================================
   PAGE
========================================================= */

function AksiContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.id;
  const type = searchParams.get("type") || "setujui";

  const config =
    ACTION_CONFIG[type] || ACTION_CONFIG.setujui;

  const HeaderIcon = config.icon;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  /* Form state */
  const [catatanPenolakan, setCatatanPenolakan] = useState("");
  const [siswaPengambilId, setSiswaPengambilId] = useState("");
  const [namaSiswaPengambil, setNamaSiswaPengambil] = useState("");
  const [kondisiSaatPinjam, setKondisiSaatPinjam] =
    useState("baik");

  const [siswaPengembaliId, setSiswaPengembaliId] =
    useState("");

  const [namaSiswaPengembali, setNamaSiswaPengembali] =
    useState("");

  const [kondisiKembali, setKondisiKembali] = useState({});
  const [catatanKembali, setCatatanKembali] = useState({});

  const notifications = [
    {
      id: 1,
      title: config.title,
      desc: config.subtitle,
      read: false,
    },
  ];

  /* =========================================================
     LOAD DETAIL
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function load() {
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

        setError(
          err?.message ||
            "Gagal mengambil detail peminjaman."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBack = () =>
    router.push(`/admin/sarpras/peminjaman/${id}`);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    if (!detail) return;

    setActionError("");

    try {
      setSubmitting(true);

      if (type === "setujui") {
        await verifikasiPeminjaman(detail.id, {
          status: STATUS.DISETUJUI,
          catatanPenolakan: null,
        });
      } else if (type === "tolak") {
        if (!catatanPenolakan.trim()) {
          setActionError(
            "Alasan penolakan wajib diisi."
          );

          setSubmitting(false);
          return;
        }

        await verifikasiPeminjaman(detail.id, {
          status: STATUS.DITOLAK,
          catatanPenolakan:
            catatanPenolakan.trim(),
        });
      } else if (type === "serahkan") {
        if (
          !siswaPengambilId &&
          !namaSiswaPengambil.trim()
        ) {
          setActionError(
            "Isi siswa pengambil atau nama siswa pengambil."
          );

          setSubmitting(false);
          return;
        }

        await serahkanPeminjaman(detail.id, {
          siswaPengambilId:
            siswaPengambilId || null,

          namaSiswaPengambil:
            namaSiswaPengambil.trim() || null,

          kondisiSaatPinjam,
        });
      } else if (type === "kembalikan") {
        if (
          !siswaPengembaliId &&
          !namaSiswaPengembali.trim()
        ) {
          setActionError(
            "Isi siswa pengembali atau nama siswa pengembali."
          );

          setSubmitting(false);
          return;
        }

        const items =
          detail.detailPeminjaman?.map((item) => ({
            asetId: item.asetId,

            kondisiSaatKembali:
              kondisiKembali[item.asetId] ||
              "baik",

            catatanKembali:
              catatanKembali[item.asetId]?.trim() ||
              null,
          })) || [];

        if (items.length === 0) {
          setActionError(
            "Detail aset tidak ditemukan."
          );

          setSubmitting(false);
          return;
        }

        await kembalikanPeminjaman(detail.id, {
          siswaPengembaliId:
            siswaPengembaliId || null,

          namaSiswaPengembali:
            namaSiswaPengembali.trim() || null,

          items,
        });
      }

      router.push("/admin/sarpras/peminjaman");
    } catch (err) {
      console.error(
        "Gagal memproses aksi:",
        err
      );

      setActionError(
        err?.message ||
          "Gagal memproses aksi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden theme-page">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((v) => !v)
        }
      />

      <div className="flex flex-1 min-w-0 flex-col">
        {/* ===================================================
            HEADER
        =================================================== */}

        <Header
          toggleSidebar={() =>
            setSidebarOpen((v) => !v)
          }
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="mx-auto w-full max-w-[900px] space-y-5 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                BACK
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className={`
                inline-flex
                items-center
                gap-2
                text-xs
                font-semibold
                ${themePrimaryText}
                transition-colors
                hover:text-[var(--color-text)]
                disabled:opacity-50
              `}
            >
              <span
                className={`
                  flex
                  h-8 w-8
                  items-center justify-center
                  rounded-lg
                  border
                  ${themePrimaryBorder}
                  theme-card
                  transition-colors
                  hover:border-[var(--color-primary)]
                `}
              >
                <ArrowLeft size={14} />
              </span>

              Kembali ke Detail Peminjaman
            </button>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-start gap-4">
              <div
                className={`
                  flex
                  h-12 w-12
                  shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-[var(--color-primary)]
                  text-[var(--color-card)]
                  shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                `}
              >
                <HeaderIcon size={20} />
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className="
                      w-1.5 h-1.5
                      rounded-full
                      bg-[var(--color-primary)]
                    "
                  />

                  <p
                    className={`
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      ${themePrimaryText}
                    `}
                  >
                    Aksi Peminjaman
                  </p>
                </div>

                <h1
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    theme-text
                    sm:text-[28px]
                  "
                >
                  {config.title}
                </h1>

                <p className="mt-1 text-sm theme-text-secondary">
                  {config.subtitle}
                </p>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div
                className={`
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border
                  ${themePrimaryBorder}
                  theme-card
                  py-16
                  ${themeCardShadow}
                `}
              >
                <Loader2
                  size={26}
                  className={`
                    animate-spin
                    ${themePrimaryText}
                  `}
                />

                <p className="mt-3 text-sm theme-text-secondary">
                  Memuat detail peminjaman...
                </p>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (
              <div
                className={`
                  rounded-xl
                  border
                  ${themeDangerBorder}
                  ${themeDangerSurface}
                  p-4
                `}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={16}
                    className={`
                      mt-0.5
                      shrink-0
                      theme-danger
                    `}
                  />

                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        theme-danger
                      "
                    >
                      Gagal memuat data
                    </p>

                    <p className="mt-1 text-xs theme-text-secondary">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            {!loading &&
              !error &&
              detail && (
                <div className="space-y-5">

                  {/* ===========================================
                      INFO ITEM
                  =========================================== */}

                  <div
                    className={`
                      overflow-hidden
                      rounded-xl
                      border
                      theme-border
                      theme-card
                      ${themeCardShadow}
                    `}
                  >
                    <div
                      className={`
                        flex
                        items-center
                        gap-3
                        border-b
                        ${themeDivider.replace(
                          "bg-",
                          "border-"
                        )}
                        ${themeNeutralSurface}
                        px-5 py-4
                      `}
                    >
                      <div
                        className={`
                          flex
                          h-8 w-8
                          items-center
                          justify-center
                          rounded-lg
                          ${themePrimarySurface}
                          border
                          ${themePrimaryBorder}
                          ${themePrimaryText}
                        `}
                      >
                        <ClipboardList size={14} />
                      </div>

                      <p className="text-sm font-bold theme-text">
                        Informasi Peminjaman
                      </p>
                    </div>

                    <div className="space-y-3 p-5">
                      <InfoRow
                        label="Nomor Peminjaman"
                        value={
                          detail.nomorPeminjaman ||
                          "-"
                        }
                        mono
                      />

                      <Divider />

                      <InfoRow
                        label="Peminjam"
                        value={
                          detail.peminjam
                            ?.namaLengkap || "-"
                        }
                      />

                      <Divider />

                      <InfoRow
                        label="Keperluan"
                        value={
                          detail.keperluan || "-"
                        }
                      />

                      <Divider />

                      <InfoRow
                        label="Total Aset"
                        value={`${
                          detail.detailPeminjaman
                            ?.length || 0
                        } jenis`}
                      />
                    </div>
                  </div>

                  {/* =========================================
                      FORM SETUJUI
                  ========================================= */}

                  {type === "setujui" && (
                    <div
                      className={`
                        rounded-xl
                        border
                        ${themePrimaryBorderStrong}
                        ${themePrimarySurface}
                        p-4
                      `}
                    >
                      <div className="flex gap-3">
                        <CheckCircle2
                          size={18}
                          className={`
                            mt-0.5
                            shrink-0
                            ${themePrimaryText}
                          `}
                        />

                        <div>
                          <p
                            className={`
                              text-xs
                              font-bold
                              ${themePrimaryText}
                            `}
                          >
                            Konfirmasi Persetujuan
                          </p>

                          <p
                            className={`
                              mt-1
                              text-[11px]
                              leading-5
                              theme-text-secondary
                            `}
                          >
                            Setelah disetujui, pengajuan
                            dapat diproses untuk penyerahan
                            aset kepada siswa.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================
                      FORM TOLAK
                  ========================================= */}

                  {type === "tolak" && (
                    <div
                      className={`
                        overflow-hidden
                        rounded-xl
                        border
                        theme-border
                        theme-card
                        ${themeCardShadow}
                      `}
                    >
                      <div
                        className={`
                          flex
                          items-center
                          gap-3
                          border-b
                          border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                          ${themeNeutralSurface}
                          px-5 py-4
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8 w-8
                            items-center
                            justify-center
                            rounded-lg
                            ${themeDangerSurface}
                            border
                            ${themeDangerBorder}
                            theme-danger
                          `}
                        >
                          <XCircle size={14} />
                        </div>

                        <p className="text-sm font-bold theme-text">
                          Alasan Penolakan
                        </p>
                      </div>

                      <div className="p-5">
                        <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                          Alasan{" "}
                          <span className="theme-danger">
                            *
                          </span>
                        </label>

                        <textarea
                          rows={4}
                          value={catatanPenolakan}
                          onChange={(e) =>
                            setCatatanPenolakan(
                              e.target.value
                            )
                          }
                          placeholder="Tuliskan alasan pengajuan ditolak..."
                          className={`
                            w-full
                            resize-none
                            rounded-lg
                            theme-input
                            px-3.5 py-2.5
                            text-xs
                            theme-text
                            outline-none
                            transition
                            placeholder:theme-text-placeholder
                            focus:border-[var(--color-primary)]
                            focus:ring-2
                            focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]
                          `}
                        />
                      </div>
                    </div>
                  )}

                  {/* =========================================
                      FORM SERAHKAN
                  ========================================= */}

                  {type === "serahkan" && (
                    <div
                      className={`
                        overflow-hidden
                        rounded-xl
                        border
                        theme-border
                        theme-card
                        ${themeCardShadow}
                      `}
                    >
                      <div
                        className={`
                          flex
                          items-center
                          gap-3
                          border-b
                          border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                          ${themeNeutralSurface}
                          px-5 py-4
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8 w-8
                            items-center
                            justify-center
                            rounded-lg
                            ${themePrimarySurface}
                            border
                            ${themePrimaryBorder}
                            ${themePrimaryText}
                          `}
                        >
                          <HandCoins size={14} />
                        </div>

                        <p className="text-sm font-bold theme-text">
                          Data Penyerahan
                        </p>
                      </div>

                      <div className="space-y-4 p-5">

                        {/* INFO */}
                        <div
                          className={`
                            rounded-lg
                            border
                            ${themeWarningBorder}
                            ${themeWarningSurface}
                            p-3
                          `}
                        >
                          <p
                            className={`
                              text-[11px]
                              leading-5
                              ${themeWarningText}
                            `}
                          >
                            Saat aset diserahkan, backend
                            akan mengurangi stok aset dan
                            mengubah status menjadi{" "}
                            <strong>Dipinjam</strong>.
                          </p>
                        </div>

                        {/* ID SISWA */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                            ID Siswa Pengambil
                          </label>

                          <input
                            type="text"
                            value={siswaPengambilId}
                            onChange={(e) =>
                              setSiswaPengambilId(
                                e.target.value
                              )
                            }
                            placeholder="Masukkan ID siswa jika tersedia"
                            className={`
                              w-full
                              rounded-lg
                              theme-input
                              px-3.5 py-2.5
                              text-xs
                              theme-text
                              outline-none
                              transition
                              placeholder:theme-text-placeholder
                              ${themePrimaryFocus}
                            `}
                          />
                        </div>

                        {/* ATAU */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              h-px flex-1
                              ${themeDivider}
                            `}
                          />

                          <span className="text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                            atau
                          </span>

                          <div
                            className={`
                              h-px flex-1
                              ${themeDivider}
                            `}
                          />
                        </div>

                        {/* NAMA SISWA */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                            Nama Siswa Pengambil
                          </label>

                          <input
                            type="text"
                            value={namaSiswaPengambil}
                            onChange={(e) =>
                              setNamaSiswaPengambil(
                                e.target.value
                              )
                            }
                            placeholder="Nama lengkap siswa"
                            className={`
                              w-full
                              rounded-lg
                              theme-input
                              px-3.5 py-2.5
                              text-xs
                              theme-text
                              outline-none
                              transition
                              placeholder:theme-text-placeholder
                              ${themePrimaryFocus}
                            `}
                          />
                        </div>

                        {/* KONDISI */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                            Kondisi Saat Pinjam
                          </label>

                          <select
                            value={kondisiSaatPinjam}
                            onChange={(e) =>
                              setKondisiSaatPinjam(
                                e.target.value
                              )
                            }
                            className={`
                              w-full
                              rounded-lg
                              theme-input
                              px-3.5 py-2.5
                              text-xs
                              theme-text
                              outline-none
                              transition
                              ${themePrimaryFocus}
                            `}
                          >
                            <option value="baik">
                              Baik
                            </option>

                            <option value="rusak_ringan">
                              Rusak Ringan
                            </option>

                            <option value="rusak_berat">
                              Rusak Berat
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================
                      FORM KEMBALIKAN
                  ========================================= */}

                  {type === "kembalikan" && (
                    <div
                      className={`
                        overflow-hidden
                        rounded-xl
                        border
                        theme-border
                        theme-card
                        ${themeCardShadow}
                      `}
                    >
                      <div
                        className={`
                          flex
                          items-center
                          gap-3
                          border-b
                          border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                          ${themeNeutralSurface}
                          px-5 py-4
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8 w-8
                            items-center
                            justify-center
                            rounded-lg
                            ${themeSuccessSurface}
                            border
                            ${themeSuccessBorder}
                            ${themeSuccessText}
                          `}
                        >
                          <Undo2 size={14} />
                        </div>

                        <p className="text-sm font-bold theme-text">
                          Data Pengembalian
                        </p>
                      </div>

                      <div className="space-y-4 p-5">

                        {/* INFO */}
                        <div
                          className={`
                            rounded-lg
                            border
                            ${themeSuccessBorder}
                            ${themeSuccessSurface}
                            p-3
                          `}
                        >
                          <p
                            className={`
                              text-[11px]
                              leading-5
                              ${themeSuccessText}
                            `}
                          >
                            Saat pengembalian diproses,
                            stok aset akan dikembalikan oleh
                            backend dan status berubah menjadi{" "}
                            <strong>Dikembalikan</strong>.
                          </p>
                        </div>

                        {/* ID SISWA */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                            ID Siswa Pengembali
                          </label>

                          <input
                            type="text"
                            value={siswaPengembaliId}
                            onChange={(e) =>
                              setSiswaPengembaliId(
                                e.target.value
                              )
                            }
                            placeholder="Masukkan ID siswa jika tersedia"
                            className={`
                              w-full
                              rounded-lg
                              theme-input
                              px-3.5 py-2.5
                              text-xs
                              theme-text
                              outline-none
                              transition
                              placeholder:theme-text-placeholder
                              ${themePrimaryFocus}
                            `}
                          />
                        </div>

                        {/* ATAU */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              h-px flex-1
                              ${themeDivider}
                            `}
                          />

                          <span className="text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                            atau
                          </span>

                          <div
                            className={`
                              h-px flex-1
                              ${themeDivider}
                            `}
                          />
                        </div>

                        {/* NAMA SISWA */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                            Nama Siswa Pengembali
                          </label>

                          <input
                            type="text"
                            value={namaSiswaPengembali}
                            onChange={(e) =>
                              setNamaSiswaPengembali(
                                e.target.value
                              )
                            }
                            placeholder="Nama lengkap siswa"
                            className={`
                              w-full
                              rounded-lg
                              theme-input
                              px-3.5 py-2.5
                              text-xs
                              theme-text
                              outline-none
                              transition
                              placeholder:theme-text-placeholder
                              ${themePrimaryFocus}
                            `}
                          />
                        </div>

                        {/* KONDISI ASET */}
                        <div className="space-y-3 pt-2">
                          <p className="text-xs font-bold theme-text">
                            Kondisi Aset Saat Kembali
                          </p>

                          {detail.detailPeminjaman?.map(
                            (item) => (
                              <div
                                key={item.id}
                                className={`
                                  rounded-lg
                                  border
                                  theme-border
                                  ${themeNeutralSurface}
                                  p-3.5
                                `}
                              >
                                <div className="mb-3 flex items-center gap-3">
                                  <div
                                    className={`
                                      flex
                                      h-9 w-9
                                      items-center
                                      justify-center
                                      rounded-lg
                                      ${themePrimarySurface}
                                      border
                                      ${themePrimaryBorder}
                                      ${themePrimaryText}
                                    `}
                                  >
                                    <Package size={14} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold theme-text">
                                      {item.aset?.nama ||
                                        "-"}
                                    </p>

                                    <p className="mt-0.5 flex items-center gap-1 text-[10px] theme-text-muted">
                                      <Hash size={10} />

                                      {item.aset?.kode ||
                                        "-"}{" "}
                                      • ×{item.jumlah}
                                    </p>
                                  </div>
                                </div>

                                {/* SELECT KONDISI */}
                                <select
                                  value={
                                    kondisiKembali[
                                      item.asetId
                                    ] || "baik"
                                  }
                                  onChange={(e) =>
                                    setKondisiKembali(
                                      (c) => ({
                                        ...c,
                                        [item.asetId]:
                                          e.target.value,
                                      })
                                    )
                                  }
                                  className={`
                                    mb-2
                                    w-full
                                    rounded-lg
                                    theme-input
                                    px-3 py-2
                                    text-xs
                                    theme-text
                                    outline-none
                                    ${themePrimaryFocus}
                                  `}
                                >
                                  <option value="baik">
                                    Baik
                                  </option>

                                  <option value="rusak_ringan">
                                    Rusak Ringan
                                  </option>

                                  <option value="rusak_berat">
                                    Rusak Berat
                                  </option>

                                  <option value="hilang">
                                    Hilang
                                  </option>
                                </select>

                                {/* CATATAN */}
                                <textarea
                                  rows={2}
                                  value={
                                    catatanKembali[
                                      item.asetId
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    setCatatanKembali(
                                      (c) => ({
                                        ...c,
                                        [item.asetId]:
                                          e.target.value,
                                      })
                                    )
                                  }
                                  placeholder="Catatan kondisi / pengembalian..."
                                  className={`
                                    w-full
                                    resize-none
                                    rounded-lg
                                    theme-input
                                    px-3 py-2
                                    text-[11px]
                                    theme-text
                                    outline-none
                                    placeholder:theme-text-placeholder
                                    ${themePrimaryFocus}
                                  `}
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================
                      ACTION ERROR
                  ========================================= */}

                  {actionError && (
                    <div
                      className={`
                        flex
                        items-start
                        gap-2.5
                        rounded-xl
                        border
                        ${themeDangerBorder}
                        ${themeDangerSurface}
                        p-3.5
                      `}
                    >
                      <AlertCircle
                        size={15}
                        className="
                          mt-0.5
                          shrink-0
                          theme-danger
                        "
                      />

                      <p
                        className="
                          text-xs
                          leading-5
                          theme-danger
                        "
                      >
                        {actionError}
                      </p>
                    </div>
                  )}

                  {/* =========================================
                      BUTTONS
                  ========================================= */}

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={submitting}
                      className={`
                        h-11
                        rounded-xl
                        border
                        theme-border
                        theme-card
                        px-5
                        text-sm
                        font-semibold
                        theme-text-secondary
                        transition-colors
                        hover:border-[var(--color-primary)]
                        hover:text-[var(--color-primary)]
                        disabled:opacity-50
                        sm:order-1
                      `}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className={`
                        inline-flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        px-5
                        text-sm
                        font-semibold
                        text-[var(--color-card)]
                        transition-all
                        disabled:opacity-60
                        sm:order-2
                        ${config.primaryClass}
                      `}
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Check size={15} />
                          {config.primaryLabel}
                        </>
                      )}
                    </button>
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

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="flex-shrink-0 theme-text-muted">
        {label}
      </span>

      <span
        className={`
          text-right
          font-semibold
          theme-text
          break-all
          ${mono ? "font-mono" : ""}
        `}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="
        h-px
        bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
      "
    />
  );
}

/* =========================================================
   WRAPPER
========================================================= */

export default function AksiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center theme-page">
          <div className="flex flex-col items-center gap-2">
            <Loader2
              size={24}
              className={`
                animate-spin
                ${themePrimaryText}
              `}
            />

            <p className="text-sm theme-text-muted">
              Memuat...
            </p>
          </div>
        </div>
      }
    >
      <AksiContent />
    </Suspense>
  );
}