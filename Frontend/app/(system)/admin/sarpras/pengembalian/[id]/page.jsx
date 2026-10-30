"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Undo2,
  ClipboardList,
  FileText,
  X,
  History,
  Hash,
  Info,
} from "lucide-react";

import {
  getDetailPeminjaman,
  kembalikanPeminjaman,
} from "@/services/sarpras.service";


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

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

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

const KONDISI_OPTIONS = [
  { value: "baik", label: "Baik" },
  { value: "rusak_ringan", label: "Rusak Ringan" },
  { value: "rusak_berat", label: "Rusak Berat" },
];

const getKondisiLabel = (value) =>
  KONDISI_OPTIONS.find((option) => option.value === value)
    ?.label || "-";


const getStatusConfig = (status) => {
  switch (status) {
    case STATUS.MENUNGGU:
      return {
        className: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
        icon: Clock,
        tone: `${themeWarningSurface} text-[var(--color-warning)]`,
      };

    case STATUS.DISETUJUI:
      return {
        className: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
        icon: CheckCircle2,
        tone: `${themeInfoSurface} text-[var(--color-info)]`,
      };

    case STATUS.DITOLAK:
      return {
        className: `${themeDangerSurface} theme-text ${themeDangerBorder}`,
        icon: X,
        tone: `${themeDangerSurface} theme-text`,
      };

    case STATUS.DIPINJAM:
      return {
        className: `${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder}`,
        icon: Package,
        tone: `${themePrimarySoft} text-[var(--color-primary)]`,
      };

    case STATUS.DIKEMBALIKAN:
      return {
        className: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
        icon: CheckCircle2,
        tone: `${themeSuccessSurface} text-[var(--color-success)]`,
      };

    default:
      return {
        className: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
        icon: ClipboardList,
        tone: `${themeNeutralSurface} theme-text-muted`,
      };
  }
};


const formatTanggal = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const formatTanggalWaktu = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const hitungHariTerlambat = (value) => {
  if (!value) return 0;

  const rencana = new Date(value);

  if (Number.isNaN(rencana.getTime())) return 0;

  const now = new Date();

  const target = new Date(
    rencana.getFullYear(),
    rencana.getMonth(),
    rencana.getDate()
  );

  const hariIni = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const selisih = hariIni.getTime() - target.getTime();

  return selisih > 0 ? Math.floor(selisih / 86400000) : 0;
};

const buatFormAwal = (detail) => {
  const form = {};

  (detail?.detailPeminjaman || []).forEach((item) => {
    form[item.id] = {
      kondisiSaatKembali:
        item.kondisiSaatKembali || "baik",
      catatanKembali: item.catatanKembali || "",
    };
  });

  return form;
};


export default function PengembalianDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({});
  const [namaPengembali, setNamaPengembali] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDetail = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        if (!id) {
          setError("ID peminjaman tidak ditemukan.");
          setDetail(null);
          return;
        }

        const response = await getDetailPeminjaman(id);
        const data = response?.data ?? response ?? null;

        setDetail(data);
        setForm(buatFormAwal(data));

        if (data) {
          setNamaPengembali(
            data.namaSiswaPengembali ||
              data.siswaPengembali?.namaLengkap ||
              ""
          );
        }
      } catch (err) {
        console.error("Gagal mengambil detail peminjaman:", err);

        setError(
          err?.message ||
            "Gagal mengambil detail peminjaman."
        );

        setDetail(null);
        setForm({});
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDetail(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [loadDetail]);


  const statusConfig = getStatusConfig(detail?.status);
  const StatusIcon = statusConfig.icon;

  const daftarAset = detail?.detailPeminjaman || [];

  const totalUnit = daftarAset.reduce(
    (total, item) => total + (Number(item?.jumlah) || 0),
    0
  );

  const bisaDikembalikan = detail?.status === STATUS.DIPINJAM;

  const sudahDikembalikan =
    detail?.status === STATUS.DIKEMBALIKAN;

  const hariTerlambat = bisaDikembalikan
    ? hitungHariTerlambat(detail?.tanggalKembaliRencana)
    : 0;


  const handlePerubahanForm = (
    itemId,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: value,
      },
    }));
  };

  const handleMintaKonfirmasi = (e) => {
    e.preventDefault();

    setActionError("");

    if (!detail?.id) {
      setActionError("Data peminjaman tidak ditemukan.");
      return;
    }

    if (daftarAset.length === 0) {
      setActionError(
        "Detail aset yang akan dikembalikan tidak ditemukan."
      );
      return;
    }

    const adaKondisiTidakValid = daftarAset.some(
      (item) =>
        !KONDISI_OPTIONS.some(
          (option) =>
            option.value ===
            form[item.id]?.kondisiSaatKembali
        )
    );

    if (adaKondisiTidakValid) {
      setActionError(
        "Pilih kondisi pengembalian untuk setiap aset."
      );
      return;
    }

    setConfirmOpen(true);
  };

  const handleKonfirmasi = async () => {
    if (!detail?.id || saving) return;

    try {
      setSaving(true);
      setActionError("");

      const items = daftarAset.map((item) => ({
        asetId: item.asetId,
        kondisiSaatKembali:
          form[item.id]?.kondisiSaatKembali || "baik",
        catatanKembali:
          form[item.id]?.catatanKembali?.trim() || null,
      }));

      await kembalikanPeminjaman(detail.id, {
        namaSiswaPengembali:
          namaPengembali.trim() || null,
        items,
      });

      setConfirmOpen(false);
      setSuccess(
        "Pengembalian berhasil diproses. Stok aset telah dipulihkan oleh backend."
      );

      await loadDetail(true);
    } catch (err) {
      console.error("Gagal memproses pengembalian:", err);

      setActionError(
        err?.message ||
          "Gagal memproses pengembalian."
      );

      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        role="admin"
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-3xl mx-auto space-y-6">

            <div>
              <button
                type="button"
                onClick={() =>
                  router.push("/admin/sarpras/pengembalian")
                }
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-xs
                  font-medium
                  theme-text-muted
                  hover:opacity-80
                  transition-opacity
                  mb-3
                "
              >
                <ArrowLeft size={14} />
                Kembali ke Pengembalian
              </button>
            </div>


            {loading && (
              <div
                className={`
                  theme-card
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  ${themeNeutralBorder}
                  py-16
                  ${themeCardShadow}
                `}
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


            {!loading && error && (
              <div
                className={`
                  theme-card
                  rounded-2xl
                  border
                  ${themeNeutralBorder}
                  p-6
                  ${themeCardShadow}
                `}
              >
                <div
                  className={`
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    ${themeDangerBorder}
                    ${themeDangerSurface}
                    p-4
                  `}
                >
                  <div
                    className={`
                      theme-card
                      theme-text
                      flex
                      h-9 w-9
                      flex-shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      ${themeDangerBorder}
                    `}
                  >
                    <AlertCircle size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="theme-text text-sm font-bold">
                      Gagal memuat detail
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      {error}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadDetail(false)}
                    className={`
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      rounded-lg
                      px-4
                      text-sm
                      font-semibold
                      ${themePrimaryGradient}
                      text-[var(--color-card)]
                      transition-all
                      hover:opacity-90
                      ${themePrimaryShadow}
                    `}
                  >
                    Coba Lagi
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/sarpras/pengembalian"
                      )
                    }
                    className={`
                      theme-text-secondary
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      rounded-lg
                      border
                      ${themeNeutralBorder}
                      px-4
                      text-sm
                      font-semibold
                      transition-colors
                      ${themeNeutralHover}
                    `}
                  >
                    Kembali ke Daftar
                  </button>
                </div>
              </div>
            )}


            {!loading && !error && !detail && (
              <div
                className={`
                  theme-card
                  rounded-2xl
                  border
                  border-dashed
                  ${themeNeutralBorder}
                  py-16
                  text-center
                  ${themeCardShadow}
                `}
              >
                <div
                  className={`
                    mx-auto
                    flex
                    h-12 w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    ${themePrimarySoftBorder}
                    ${themePrimarySoft}
                    ${themePrimaryText}
                  `}
                >
                  <ClipboardList size={20} />
                </div>

                <p className="theme-text mt-4 text-sm font-bold">
                  Data peminjaman tidak ditemukan
                </p>

                <p className="theme-text-secondary mt-1 text-xs">
                  Data pengembalian dengan id &quot;{id}&quot;
                  tidak tersedia atau sudah dihapus.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/sarpras/pengembalian"
                    )
                  }
                  className={`
                    mt-5
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-lg
                    px-4
                    text-sm
                    font-semibold
                    ${themePrimaryGradient}
                    text-[var(--color-card)]
                    transition-all
                    hover:opacity-90
                    ${themePrimaryShadow}
                  `}
                >
                  <ArrowLeft size={14} />
                  Kembali ke Daftar
                </button>
              </div>
            )}


            {!loading && !error && detail && (
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={`
                        text-xs
                        font-medium
                        ${themePrimaryText}
                        uppercase
                        tracking-wide
                      `}
                    >
                      Detail Pengembalian
                    </p>

                    <h1 className="text-2xl sm:text-[28px] font-bold theme-text mt-1 tracking-tight break-all">
                      {detail.nomorPeminjaman || "Peminjaman Aset"}
                    </h1>

                    <div className="flex items-center gap-1.5 mt-1.5 text-sm theme-text-muted">
                      <Package size={14} />
                      <span>
                        {daftarAset.length} jenis aset •{" "}
                        {totalUnit} unit
                      </span>
                    </div>
                  </div>

                  <span
                    className={`
                      text-xs
                      font-medium
                      px-3
                      py-1.5
                      rounded-full
                      border
                      flex-shrink-0
                      self-start
                      ${statusConfig.className}
                    `}
                  >
                    {STATUS_LABEL[detail.status] ||
                      detail.status ||
                      "-"}
                  </span>
                </div>


                {success && (
                  <div
                    className={`
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      border
                      ${themeSuccessBorder}
                      ${themeSuccessSurface}
                      p-4
                    `}
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 flex-shrink-0 text-[var(--color-success)]"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--color-success)]">
                        Pengembalian berhasil
                      </p>

                      <p className="text-xs theme-text-secondary mt-1">
                        {success}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              "/admin/sarpras/pengembalian?berhasil=1"
                            )
                          }
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            ${themePrimarySoftBorder}
                            ${themePrimarySoft}
                            px-3
                            py-1.5
                            text-[11px]
                            font-semibold
                            ${themePrimaryText}
                            transition-colors
                            hover:opacity-80
                          `}
                        >
                          <Undo2 size={13} />
                          Daftar Pengembalian
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              "/admin/sarpras/riwayat"
                            )
                          }
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            ${themeNeutralBorder}
                            px-3
                            py-1.5
                            text-[11px]
                            font-semibold
                            theme-text-secondary
                            transition-colors
                            ${themeNeutralHover}
                          `}
                        >
                          <History size={13} />
                          Lihat Riwayat
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                <div
                  className={`
                    theme-card
                    rounded-2xl
                    border
                    ${themeNeutralBorder}
                    ${themeCardShadow}
                    overflow-hidden
                  `}
                >
                  <div
                    className={`
                      px-5
                      py-4
                      border-b
                      ${themeDivider}
                    `}
                  >
                    <h3 className="text-sm font-semibold theme-text">
                      Informasi Peminjaman
                    </h3>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <InfoItem
                        icon={<User size={15} />}
                        label="Peminjam"
                        value={
                          detail.peminjam?.namaLengkap ||
                          "-"
                        }
                      />

                      <InfoItem
                        icon={<Phone size={15} />}
                        label="Kontak"
                        value={
                          detail.peminjam?.noTelepon ||
                          detail.peminjam?.email ||
                          "-"
                        }
                      />

                      <InfoItem
                        icon={<Calendar size={15} />}
                        label="Tgl Pinjam"
                        value={formatTanggal(
                          detail.tanggalPinjam
                        )}
                      />

                      <InfoItem
                        icon={<StatusIcon size={15} />}
                        label="Jatuh Tempo"
                        value={formatTanggal(
                          detail.tanggalKembaliRencana
                        )}
                        tone={
                          hariTerlambat > 0
                            ? `${themeWarningSurface} text-[var(--color-warning)]`
                            : `${themeNeutralSurface} theme-text-muted`
                        }
                        caption={
                          hariTerlambat > 0
                            ? `${hariTerlambat} hari terlambat`
                            : null
                        }
                      />

                      {sudahDikembalikan && (
                        <InfoItem
                          icon={<Undo2 size={15} />}
                          label="Dikembalikan"
                          value={formatTanggalWaktu(
                            detail.tanggalKembaliAktual
                          )}
                          tone={`${themeSuccessSurface} text-[var(--color-success)]`}
                        />
                      )}
                    </div>

                    {detail.keperluan && (
                      <div
                        className={`
                          mt-5
                          flex
                          items-start
                          gap-2.5
                          rounded-xl
                          border
                          ${themeNeutralBorder}
                          ${themeNeutralSurface}
                          p-3.5
                        `}
                      >
                        <FileText
                          size={15}
                          className="theme-text-muted mt-0.5 flex-shrink-0"
                        />

                        <div className="min-w-0">
                          <p className="text-[11px] theme-text-muted">
                            Keperluan
                          </p>

                          <p className="text-sm theme-text-secondary mt-0.5">
                            {detail.keperluan}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                <div
                  className={`
                    theme-card
                    rounded-2xl
                    border
                    ${themeNeutralBorder}
                    ${themeCardShadow}
                    overflow-hidden
                  `}
                >
                  <div
                    className={`
                      px-5
                      py-4
                      border-b
                      ${themeDivider}
                    `}
                  >
                    <h3 className="text-sm font-semibold theme-text">
                      Aset yang Dipinjam
                    </h3>
                  </div>

                  <div className="p-5 space-y-3">
                    {daftarAset.map((item) => (
                      <div
                        key={item.id}
                        className={`
                          theme-card
                          rounded-xl
                          border
                          ${themeNeutralBorder}
                          p-4
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                              flex
                              h-10 w-10
                              flex-shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              border
                              ${themePrimarySoftBorder}
                              ${themePrimarySoft}
                              ${themePrimaryText}
                            `}
                          >
                            <Package size={17} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text text-sm font-semibold truncate">
                              {item.aset?.nama || "-"}
                            </p>

                            <p className="theme-text-muted mt-0.5 flex items-center gap-1 font-mono text-[10px]">
                              <Hash size={10} />
                              {item.aset?.kode || "-"}
                            </p>
                          </div>

                          <span
                            className={`
                              flex-shrink-0
                              rounded-md
                              border
                              ${themePrimarySoftBorder}
                              ${themePrimarySoft}
                              ${themePrimaryText}
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                            `}
                          >
                            ×{item.jumlah}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1
                              rounded-full
                              border
                              ${themeNeutralBorder}
                              ${themeNeutralSurface}
                              px-2.5
                              py-1
                              text-[10px]
                              font-semibold
                              theme-text-secondary
                            `}
                          >
                            Kondisi pinjam:{" "}
                            {getKondisiLabel(
                              item.kondisiSaatPinjam
                            )}
                          </span>

                          {sudahDikembalikan && (
                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                border
                                ${themeSuccessBorder}
                                ${themeSuccessSurface}
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                text-[var(--color-success)]
                              `}
                            >
                              Kondisi kembali:{" "}
                              {getKondisiLabel(
                                item.kondisiSaatKembali
                              )}
                            </span>
                          )}
                        </div>

                        {sudahDikembalikan &&
                          item.catatanKembali && (
                            <p className="theme-text-secondary mt-3 text-xs leading-relaxed">
                              {item.catatanKembali}
                            </p>
                          )}
                      </div>
                    ))}

                    {daftarAset.length === 0 && (
                      <p className="theme-text-muted py-6 text-center text-sm">
                        Detail aset tidak tersedia.
                      </p>
                    )}
                  </div>
                </div>


                {bisaDikembalikan && (
                  <form
                    onSubmit={handleMintaKonfirmasi}
                    className={`
                      theme-card
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      ${themeCardShadow}
                      overflow-hidden
                    `}
                  >
                    <div
                      className={`
                        px-5
                        py-4
                        border-b
                        ${themeDivider}
                      `}
                    >
                      <h3 className="text-sm font-semibold theme-text">
                        Konfirmasi Pengembalian
                      </h3>

                      <p className="text-xs theme-text-muted mt-0.5">
                        Catat kondisi setiap aset saat
                        dikembalikan. Stok akan dipulihkan
                        setelah konfirmasi.
                      </p>
                    </div>

                    <div className="p-5 space-y-5">

                      <div>
                        <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                          Nama Pengembali{" "}
                          <span className="theme-text-muted">
                            (opsional)
                          </span>
                        </label>

                        <input
                          type="text"
                          value={namaPengembali}
                          onChange={(e) =>
                            setNamaPengembali(
                              e.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="Nama siswa/guru yang mengembalikan aset"
                          className={`
                            theme-input
                            w-full
                            px-3.5
                            py-2.5
                            rounded-xl
                            border
                            text-sm
                            theme-text
                            placeholder:theme-text-placeholder
                            ${themeFocus}
                            transition-colors
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                          `}
                        />
                      </div>


                      <div className="space-y-4">
                        {daftarAset.map((item) => (
                          <div
                            key={item.id}
                            className={`
                              rounded-xl
                              border
                              ${themeNeutralBorder}
                              ${themeNeutralSurface}
                              p-4
                            `}
                          >
                            <div className="flex items-center gap-2.5">
                              <Package
                                size={15}
                                className={themePrimaryText}
                              />

                              <p className="theme-text text-sm font-semibold truncate">
                                {item.aset?.nama || "-"}
                              </p>

                              <span className="theme-text-muted text-[10px] font-semibold">
                                ×{item.jumlah}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-medium theme-text-secondary mb-1.5">
                                  Kondisi Saat Kembali
                                </label>

                                <select
                                  value={
                                    form[item.id]
                                      ?.kondisiSaatKembali ||
                                    "baik"
                                  }
                                  onChange={(e) =>
                                    handlePerubahanForm(
                                      item.id,
                                      "kondisiSaatKembali",
                                      e.target.value
                                    )
                                  }
                                  disabled={saving}
                                  className={`
                                    theme-input
                                    w-full
                                    px-3.5
                                    py-2.5
                                    rounded-xl
                                    border
                                    text-sm
                                    theme-text
                                    ${themeFocus}
                                    transition-colors
                                    appearance-none
                                    disabled:opacity-60
                                    disabled:cursor-not-allowed
                                  `}
                                >
                                  {KONDISI_OPTIONS.map(
                                    (option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium theme-text-secondary mb-1.5">
                                  Catatan (opsional)
                                </label>

                                <input
                                  type="text"
                                  value={
                                    form[item.id]
                                      ?.catatanKembali || ""
                                  }
                                  onChange={(e) =>
                                    handlePerubahanForm(
                                      item.id,
                                      "catatanKembali",
                                      e.target.value
                                    )
                                  }
                                  disabled={saving}
                                  placeholder="Catatan kondisi aset..."
                                  className={`
                                    theme-input
                                    w-full
                                    px-3.5
                                    py-2.5
                                    rounded-xl
                                    border
                                    text-sm
                                    theme-text
                                    placeholder:theme-text-placeholder
                                    ${themeFocus}
                                    transition-colors
                                    disabled:opacity-60
                                    disabled:cursor-not-allowed
                                  `}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        className={`
                          flex
                          items-start
                          gap-2.5
                          rounded-xl
                          border
                          ${themeDivider}
                          ${themeNeutralSurface}
                          p-3.5
                        `}
                      >
                        <Info
                          size={15}
                          className="theme-text-muted mt-0.5 flex-shrink-0"
                        />

                        <p className="theme-text-secondary text-xs leading-5">
                          Kondisi saat kembali dicatat pada item peminjaman
                          ini saja. Kondisi pada data master Aset tidak
                          diubah, karena satu aset dapat mewakili banyak
                          unit dengan kondisi yang berbeda. Perbarui
                          kondisi master Aset secara terpisah bila memang
                          seluruh unit berada pada kondisi tersebut.
                        </p>
                      </div>


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
                            className="theme-text mt-0.5 flex-shrink-0"
                          />

                          <p className="theme-text-secondary text-xs leading-5">
                            {actionError}
                          </p>
                        </div>
                      )}
                    </div>

                    <div
                      className={`
                        flex
                        items-center
                        justify-end
                        gap-3
                        px-5
                        py-4
                        border-t
                        ${themeDivider}
                        ${themeNeutralSurface}
                      `}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/sarpras/pengembalian"
                          )
                        }
                        disabled={saving}
                        className={`
                          px-4
                          py-2.5
                          rounded-xl
                          text-sm
                          font-medium
                          theme-text-secondary
                          ${themeNeutralHover}
                          transition-colors
                          disabled:opacity-50
                        `}
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className={`
                          inline-flex
                          items-center
                          gap-2
                          px-5
                          py-2.5
                          rounded-xl
                          ${themePrimaryGradient}
                          text-[var(--color-card)]
                          text-sm
                          font-medium
                          ${themePrimaryShadow}
                          hover:opacity-90
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          transition-all
                        `}
                      >
                        {saving ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            Konfirmasi Dikembalikan
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}


                {!bisaDikembalikan && !sudahDikembalikan && (
                  <div
                    className={`
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      border
                      ${themeWarningBorder}
                      ${themeWarningSurface}
                      p-4
                    `}
                  >
                    <AlertTriangle
                      size={17}
                      className="mt-0.5 flex-shrink-0 text-[var(--color-warning)]"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-warning)]">
                        Pengembalian belum dapat diproses
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs leading-relaxed">
                        Hanya peminjaman berstatus{" "}
                        <strong>Dipinjam</strong> yang dapat
                        dikembalikan. Status saat ini:{" "}
                        <strong>
                          {STATUS_LABEL[detail.status] ||
                            detail.status ||
                            "-"}
                        </strong>
                        .
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/sarpras/peminjaman/${detail.id}`
                          )
                        }
                        className={`
                          mt-3
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          ${themeNeutralBorder}
                          px-3
                          py-1.5
                          text-[11px]
                          font-semibold
                          theme-text-secondary
                          transition-colors
                          ${themeNeutralHover}
                        `}
                      >
                        <ClipboardList size={13} />
                        Buka Detail Peminjaman
                      </button>
                    </div>
                  </div>
                )}


                {sudahDikembalikan && (
                  <div
                    className={`
                      theme-card
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      ${themeCardShadow}
                      overflow-hidden
                    `}
                  >
                    <div
                      className={`
                        px-5
                        py-4
                        border-b
                        ${themeDivider}
                      `}
                    >
                      <h3 className="text-sm font-semibold theme-text">
                        Detail Pengembalian
                      </h3>

                      <p className="text-xs theme-text-muted mt-0.5">
                        Barang/ruangan ini sudah
                        dikembalikan.
                      </p>
                    </div>

                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoItem
                        icon={<CheckCircle2 size={15} />}
                        label="Waktu Pengembalian"
                        value={formatTanggalWaktu(
                          detail.tanggalKembaliAktual
                        )}
                        tone={`${themeSuccessSurface} text-[var(--color-success)]`}
                      />

                      <InfoItem
                        icon={<User size={15} />}
                        label="Pengembali"
                        value={
                          detail.siswaPengembali
                            ?.namaLengkap ||
                          detail.namaSiswaPengembali ||
                          "-"
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>


      {confirmOpen && detail && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup konfirmasi"
            onClick={() => {
              if (!saving) setConfirmOpen(false);
            }}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-konfirmasi-pengembalian"
            className={`
              theme-card
              relative
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              border
              ${themeNeutralBorder}
              ${themeCardShadow}
            `}
          >
            <div
              className={`
                flex
                items-start
                gap-3
                border-b
                ${themeDivider}
                px-5
                py-4
              `}
            >
              <div
                className={`
                  flex
                  h-10 w-10
                  flex-shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${themeSuccessSurface}
                  text-[var(--color-success)]
                `}
              >
                <Undo2 size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  id="judul-konfirmasi-pengembalian"
                  className="theme-text text-sm font-bold"
                >
                  Konfirmasi Pengembalian
                </h3>

                <p className="theme-text-secondary mt-0.5 text-xs">
                  Pastikan data kondisi sudah benar.
                  Tindakan ini akan mengubah status
                  peminjaman menjadi Dikembalikan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!saving) setConfirmOpen(false);
                }}
                disabled={saving}
                className={`
                  theme-text-muted
                  flex
                  h-8 w-8
                  flex-shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  transition-colors
                  ${themeNeutralHover}
                  disabled:opacity-50
                `}
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-5 space-y-2.5">
              <p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wide">
                {daftarAset.length} jenis aset •{" "}
                {totalUnit} unit
              </p>

              {daftarAset.map((item) => (
                <div
                  key={item.id}
                  className={`
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    ${themeNeutralBorder}
                    ${themeNeutralSurface}
                    p-3.5
                  `}
                >
                  <div className="min-w-0">
                    <p className="theme-text truncate text-xs font-semibold">
                      {item.aset?.nama || "-"}
                    </p>

                    <p className="theme-text-muted mt-0.5 text-[10px]">
                      {item.aset?.kode || "-"} • ×
                      {item.jumlah}
                    </p>
                  </div>

                  <span
                    className={`
                      flex-shrink-0
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      ${
                        form[item.id]
                          ?.kondisiSaatKembali === "baik"
                          ? `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`
                          : `${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)]`
                      }
                    `}
                  >
                    {getKondisiLabel(
                      form[item.id]?.kondisiSaatKembali
                    )}
                  </span>
                </div>
              ))}

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
                    p-3
                  `}
                >
                  <AlertCircle
                    size={14}
                    className="theme-text mt-0.5 flex-shrink-0"
                  />

                  <p className="theme-text-secondary text-[11px] leading-5">
                    {actionError}
                  </p>
                </div>
              )}
            </div>

            <div
              className={`
                flex
                items-center
                justify-end
                gap-2.5
                border-t
                ${themeDivider}
                ${themeNeutralSurface}
                px-5
                py-4
              `}
            >
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={saving}
                className={`
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  theme-text-secondary
                  ${themeNeutralHover}
                  transition-colors
                  disabled:opacity-50
                `}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleKonfirmasi}
                disabled={saving}
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[var(--color-success)]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-[var(--color-card)]
                  transition-all
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Ya, Konfirmasi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function InfoItem({ icon, label, value, tone, caption }) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`
          w-9
          h-9
          rounded-lg
          flex
          items-center
          justify-center
          flex-shrink-0
          ${tone || `${themeNeutralSurface} theme-text-muted`}
        `}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] theme-text-muted">
          {label}
        </p>

        <p className="text-sm font-medium theme-text truncate">
          {value || "-"}
        </p>

        {caption && (
          <p className="text-[10px] text-[var(--color-warning)] mt-0.5">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
