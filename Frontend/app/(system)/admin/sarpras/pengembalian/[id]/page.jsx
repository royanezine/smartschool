"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Save,
} from "lucide-react";

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

// ============================================================
// DUMMY DATA
// ============================================================

const pengembalianData = {
  "pjm-001": {
    nama: "Proyektor Epson",
    tipe: "Inventaris",
    peminjam: "Pak Budi",
    kontak: "0812-3456-7890",
    tanggalPinjam: "18 Agu 2026",
    tanggalKembali: "22 Agu 2026",
    status: "Belum Dikembalikan",
    kondisiKembali: "",
    catatan: "",
  },

  "pjm-004": {
    nama: "Lapangan Basket",
    tipe: "Fasilitas",
    peminjam: "Pak Rudi",
    kontak: "0857-3344-5566",
    tanggalPinjam: "19 Agu 2026",
    tanggalKembali: "19 Agu 2026",
    status: "Belum Dikembalikan",
    kondisiKembali: "",
    catatan: "",
  },

  "pjm-005": {
    nama: "Mikroskop",
    tipe: "Inventaris",
    peminjam: "Bu Dewi",
    kontak: "0878-1122-3344",
    tanggalPinjam: "5 Agu 2026",
    tanggalKembali: "6 Agu 2026",
    status: "Terlambat",
    kondisiKembali: "",
    catatan: "",
  },

  "pjm-003": {
    nama: "Sound System",
    tipe: "Inventaris",
    peminjam: "Bu Sari",
    kontak: "0821-9988-1122",
    tanggalPinjam: "10 Agu 2026",
    tanggalKembali: "12 Agu 2026",
    status: "Sudah Dikembalikan",
    kondisiKembali: "Baik",
    catatan: "Dikembalikan tepat waktu, kondisi lengkap.",
  },

  "pjm-006": {
    nama: "Lab Komputer",
    tipe: "Fasilitas",
    peminjam: "Pak Anwar",
    kontak: "0896-7788-9900",
    tanggalPinjam: "1 Agu 2026",
    tanggalKembali: "1 Agu 2026",
    status: "Sudah Dikembalikan",
    kondisiKembali: "Baik",
    catatan: "Ruangan bersih dan rapi.",
  },

  "pjm-007": {
    nama: "Kursi Kayu (10 unit)",
    tipe: "Inventaris",
    peminjam: "Panitia 17-an",
    kontak: "0811-2233-4455",
    tanggalPinjam: "16 Agu 2026",
    tanggalKembali: "17 Agu 2026",
    status: "Sudah Dikembalikan",
    kondisiKembali: "Rusak Ringan",
    catatan: "2 unit kursi retak, sudah diperbaiki.",
  },
};

const statusStyle = {
  "Belum Dikembalikan": `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,

  Terlambat: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,

  "Sudah Dikembalikan": `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
};

const statusIcon = {
  "Belum Dikembalikan": {
    icon: Clock,
    tone: `${themeInfoSurface} text-[var(--color-info)]`,
  },

  Terlambat: {
    icon: AlertTriangle,
    tone: `${themeWarningSurface} text-[var(--color-warning)]`,
  },

  "Sudah Dikembalikan": {
    icon: CheckCircle2,
    tone: `${themeSuccessSurface} text-[var(--color-success)]`,
  },
};

const tipeIcon = {
  Inventaris: Package,
  Fasilitas: Building2,
};

const kondisiOptions = [
  "Baik",
  "Rusak Ringan",
  "Rusak Berat",
];

// ============================================================
// COMPONENT
// ============================================================

export default function PengembalianDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const id = params?.id;
  const data = pengembalianData[id];

  const [kondisiKembali, setKondisiKembali] = useState(
    data?.kondisiKembali || kondisiOptions[0]
  );

  const [catatan, setCatatan] = useState(
    data?.catatan || ""
  );

  const [saving, setSaving] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Peminjaman Mikroskop terlambat dikembalikan",
      desc: "Dikirim 1 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // DATA NOT FOUND
  // ============================================================

  if (!data) {
    return (
      <div className="theme-page flex min-h-screen">
        <Sidebar
          role="adminSarpras"
          active="pengembalian"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            notifications={notifications}
            user={{
              name: "Admin Sarpras",
              email: "adminsarpras@smartschool.com",
              avatar: "SP",
            }}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div
                className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
              >
                <Package size={21} />
              </div>

              <p className="text-sm theme-text-secondary">
                Data pengembalian dengan id "{id}" tidak ditemukan.
              </p>

              <button
                onClick={() =>
                  router.push("/adminSarpras/pengembalian")
                }
                className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${themePrimaryText} hover:opacity-80 transition-opacity`}
              >
                <ArrowLeft size={14} />
                Kembali ke daftar pengembalian
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============================================================
  // STATUS
  // ============================================================

  const s = statusIcon[data.status];
  const StatusIcon = s.icon;

  const TipeIcon = tipeIcon[data.tipe];

  const sudahDikembalikan =
    data.status === "Sudah Dikembalikan";

  // ============================================================
  // HANDLE CONFIRM
  // ============================================================

  const handleKonfirmasi = async (e) => {
    e.preventDefault();

    setSaving(true);

    // TODO:
    // ganti dengan pemanggilan API asli
    // POST /api/pengembalian/:id

    await new Promise((resolve) =>
      setTimeout(resolve, 600)
    );

    setSaving(false);

    router.push("/adminSarpras/pengembalian");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        role="adminSarpras"
        active="pengembalian"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Admin Sarpras",
            email: "adminsarpras@smartschool.com",
            avatar: "SP",
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-3xl mx-auto space-y-6">

            {/* ==================================================
                BACK + PAGE HEADER
            ================================================== */}

            <div>
              <button
                onClick={() =>
                  router.push("/adminSarpras/pengembalian")
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium theme-text-muted hover:opacity-80 transition-opacity mb-3"
              >
                <ArrowLeft size={14} />
                Kembali ke Pengembalian
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">

                  <p
                    className={`text-xs font-medium ${themePrimaryText} uppercase tracking-wide`}
                  >
                    Detail Pengembalian
                  </p>

                  <h1 className="text-2xl sm:text-[28px] font-bold theme-text mt-1 tracking-tight truncate">
                    {data.nama}
                  </h1>

                  <div className="flex items-center gap-1.5 mt-1.5 text-sm theme-text-muted">
                    <TipeIcon
                      size={14}
                      className="flex-shrink-0"
                    />
                    <span>{data.tipe}</span>
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
                    ${statusStyle[data.status]}
                  `}
                >
                  {data.status}
                </span>
              </div>
            </div>

            {/* ==================================================
                INFO PEMINJAMAN
            ================================================== */}

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

                  {/* PEMINJAM */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`
                        w-9
                        h-9
                        rounded-lg
                        ${themeNeutralSurface}
                        theme-text-muted
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      `}
                    >
                      <User size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] theme-text-muted">
                        Peminjam
                      </p>

                      <p className="text-sm font-medium theme-text truncate">
                        {data.peminjam}
                      </p>
                    </div>
                  </div>

                  {/* KONTAK */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`
                        w-9
                        h-9
                        rounded-lg
                        ${themeNeutralSurface}
                        theme-text-muted
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      `}
                    >
                      <Phone size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] theme-text-muted">
                        Kontak
                      </p>

                      <p className="text-sm font-medium theme-text truncate">
                        {data.kontak}
                      </p>
                    </div>
                  </div>

                  {/* TANGGAL PINJAM */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`
                        w-9
                        h-9
                        rounded-lg
                        ${themeNeutralSurface}
                        theme-text-muted
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      `}
                    >
                      <Calendar size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] theme-text-muted">
                        Tgl Pinjam
                      </p>

                      <p className="text-sm font-medium theme-text truncate">
                        {data.tanggalPinjam}
                      </p>
                    </div>
                  </div>

                  {/* JATUH TEMPO */}
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
                        ${s.tone}
                      `}
                    >
                      <StatusIcon size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] theme-text-muted">
                        Jatuh Tempo
                      </p>

                      <p className="text-sm font-medium theme-text truncate">
                        {data.tanggalKembali}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ==================================================
                FORM KONFIRMASI PENGEMBALIAN
            ================================================== */}

            <form
              onSubmit={handleKonfirmasi}
              className={`
                theme-card
                rounded-2xl
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
                overflow-hidden
              `}
            >

              {/* HEADER FORM */}
              <div
                className={`
                  px-5
                  py-4
                  border-b
                  ${themeDivider}
                `}
              >
                <h3 className="text-sm font-semibold theme-text">
                  {sudahDikembalikan
                    ? "Detail Pengembalian"
                    : "Konfirmasi Pengembalian"}
                </h3>

                <p className="text-xs theme-text-muted mt-0.5">
                  {sudahDikembalikan
                    ? "Barang/ruangan ini sudah dikembalikan."
                    : "Catat kondisi barang/ruangan saat dikembalikan."}
                </p>
              </div>

              {/* FORM CONTENT */}
              <div className="p-5 space-y-5">

                {/* KONDISI */}
                <div>
                  <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                    Kondisi Saat Kembali
                  </label>

                  <select
                    value={kondisiKembali}
                    onChange={(e) =>
                      setKondisiKembali(e.target.value)
                    }
                    disabled={sudahDikembalikan}
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
                    {kondisiOptions.map((k) => (
                      <option
                        key={k}
                        value={k}
                      >
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CATATAN */}
                <div>
                  <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                    Catatan (opsional)
                  </label>

                  <textarea
                    value={catatan}
                    onChange={(e) =>
                      setCatatan(e.target.value)
                    }
                    disabled={sudahDikembalikan}
                    placeholder="Catatan tambahan tentang kondisi barang/ruangan..."
                    rows={3}
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
                      resize-none
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    `}
                  />
                </div>

              </div>

              {/* ACTIONS */}
              {!sudahDikembalikan && (
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
                  {/* BATAL */}
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/adminSarpras/pengembalian")
                    }
                    className={`
                      px-4
                      py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      theme-text-secondary
                      ${themeNeutralHover}
                      transition-colors
                    `}
                  >
                    Batal
                  </button>

                  {/* SIMPAN */}
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
                    <Save size={16} />

                    {saving
                      ? "Menyimpan..."
                      : "Konfirmasi Dikembalikan"}
                  </button>
                </div>
              )}

            </form>

          </div>
        </main>
      </div>
    </div>
  );
}