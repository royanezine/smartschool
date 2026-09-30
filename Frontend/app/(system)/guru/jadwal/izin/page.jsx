"use client";

import { useState } from "react";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import {
  FileText,
  Sparkles,
  Plus,
  X,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Hourglass,
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

// ============================================================
// DUMMY DATA
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================

const JENIS_IZIN = [
  "Sakit",
  "Izin Pribadi",
  "Dinas Luar",
  "Cuti",
];

const riwayatIzinAwal = [
  {
    id: 1,
    jenis: "Sakit",
    tanggalMulai: "13 Agustus 2026",
    tanggalSelesai: "13 Agustus 2026",
    alasan: "Demam, perlu istirahat di rumah",
    status: "disetujui",
  },
  {
    id: 2,
    jenis: "Dinas Luar",
    tanggalMulai: "5 Agustus 2026",
    tanggalSelesai: "5 Agustus 2026",
    alasan: "Menghadiri workshop kurikulum di dinas pendidikan",
    status: "disetujui",
  },
  {
    id: 3,
    jenis: "Izin Pribadi",
    tanggalMulai: "22 Juli 2026",
    tanggalSelesai: "23 Juli 2026",
    alasan: "Urusan keluarga di luar kota",
    status: "ditolak",
  },
];

// ============================================================
// STATUS STYLE
// ============================================================

const statusStyle = {
  disetujui: {
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    icon: CheckCircle2,
    label: "Disetujui",
  },

  menunggu: {
    bg: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    icon: Hourglass,
    label: "Menunggu",
  },

  ditolak: {
    bg: themeDangerSurface,
    text: "theme-danger",
    border: themeDangerBorder,
    icon: XCircle,
    label: "Ditolak",
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function GuruIzinPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [riwayatIzin, setRiwayatIzin] = useState(riwayatIzinAwal);

  const [form, setForm] = useState({
    jenis: JENIS_IZIN[0],
    tanggalMulai: "",
    tanggalSelesai: "",
    alasan: "",
  });

  const [errors, setErrors] = useState({});

  const notifications = [
    {
      id: 1,
      title: "Rapat Wali Kelas",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Batas Input Nilai Rapor",
      desc: "Dikirim 5 jam lalu",
      read: false,
    },
  ];

  const summary = {
    total: riwayatIzin.length,
    disetujui: riwayatIzin.filter(
      (r) => r.status === "disetujui"
    ).length,
    menunggu: riwayatIzin.filter(
      (r) => r.status === "menunggu"
    ).length,
  };

  const formatTanggal = (iso) => {
    if (!iso) return "";

    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!form.tanggalMulai) {
      newErrors.tanggalMulai = "Pilih tanggal mulai izin.";
    }

    if (!form.tanggalSelesai) {
      newErrors.tanggalSelesai = "Pilih tanggal selesai izin.";
    }

    if (
      form.tanggalMulai &&
      form.tanggalSelesai &&
      form.tanggalSelesai < form.tanggalMulai
    ) {
      newErrors.tanggalSelesai =
        "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    }

    if (!form.alasan.trim()) {
      newErrors.alasan = "Isi alasan pengajuan izin.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const izinBaru = {
      id: Date.now(),
      jenis: form.jenis,
      tanggalMulai: formatTanggal(form.tanggalMulai),
      tanggalSelesai: formatTanggal(form.tanggalSelesai),
      alasan: form.alasan.trim(),
      status: "menunggu",
    };

    setRiwayatIzin([izinBaru, ...riwayatIzin]);

    setForm({
      jenis: JENIS_IZIN[0],
      tanggalMulai: "",
      tanggalSelesai: "",
      alasan: "",
    });

    setErrors({});
    setShowForm(false);
  };

  return (
    <div className="flex h-screen theme-page overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active="izin"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ======================================================
          MAIN WRAPPER
      ====================================================== */}

      <div className="flex-1 flex flex-col min-w-0 theme-page">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 theme-page">
          <div className="w-full space-y-6">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} flex-shrink-0`}
                  >
                    <FileText size={18} />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                    Pengajuan Izin
                  </h1>
                </div>

                <p className="text-sm theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles
                    size={14}
                    className="theme-text-muted flex-shrink-0"
                  />

                  <span className="truncate">
                    Ajukan izin tidak hadir mengajar dan pantau statusnya.
                  </span>
                </p>
              </div>

              {/* BUTTON AJUKAN IZIN */}

              <button
                onClick={() => setShowForm(true)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} rounded-lg hover:opacity-90 transition-opacity ${themeSmallShadow} whitespace-nowrap flex-shrink-0`}
              >
                <Plus size={16} />
                Ajukan Izin
              </button>
            </div>

            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="grid grid-cols-3 gap-3">

              {/* TOTAL */}

              <div
                className={`theme-card rounded-xl ${themeNeutralBorder} p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}
              >
                <div
                  className={`p-2 rounded-lg border ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder} flex-shrink-0`}
                >
                  <FileText size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                    Total Pengajuan
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {summary.total}
                  </p>
                </div>
              </div>

              {/* DISETUJUI */}

              <div
                className={`theme-card rounded-xl ${themeNeutralBorder} p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}
              >
                <div
                  className={`p-2 rounded-lg border ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder} flex-shrink-0`}
                >
                  <CheckCircle2 size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                    Disetujui
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {summary.disetujui}
                  </p>
                </div>
              </div>

              {/* MENUNGGU */}

              <div
                className={`theme-card rounded-xl ${themeNeutralBorder} p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}
              >
                <div
                  className={`p-2 rounded-lg border ${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder} flex-shrink-0`}
                >
                  <Hourglass size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                    Menunggu
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {summary.menunggu}
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
                FORM PENGAJUAN
            ================================================== */}

            {showForm && (
              <div
                className={`theme-card rounded-xl ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
              >
                {/* FORM HEADER */}

                <div
                  className={`p-4 sm:p-5 ${themeDivider} border-b flex items-center justify-between`}
                >
                  <h3 className="text-sm font-semibold theme-text">
                    Form Pengajuan Izin
                  </h3>

                  <button
                    onClick={() => {
                      setShowForm(false);
                      setErrors({});
                    }}
                    className="theme-text-muted hover:text-[var(--color-primary)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* FORM BODY */}

                <div className="p-4 sm:p-5 space-y-4">

                  {/* JENIS IZIN */}

                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Jenis Izin
                    </label>

                    <select
                      value={form.jenis}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          jenis: e.target.value,
                        })
                      }
                      className={`w-full appearance-none px-3 py-2.5 text-sm font-medium theme-input rounded-lg ${themeFocus} transition-colors cursor-pointer`}
                    >
                      {JENIS_IZIN.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TANGGAL */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* TANGGAL MULAI */}

                    <div>
                      <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                        Tanggal Mulai
                      </label>

                      <input
                        type="date"
                        value={form.tanggalMulai}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            tanggalMulai: e.target.value,
                          });

                          setErrors({
                            ...errors,
                            tanggalMulai: undefined,
                          });
                        }}
                        className={`w-full px-3 py-2.5 text-sm theme-input rounded-lg ${themeFocus} transition-colors`}
                      />

                      {errors.tanggalMulai && (
                        <p className="text-xs theme-danger mt-1.5">
                          {errors.tanggalMulai}
                        </p>
                      )}
                    </div>

                    {/* TANGGAL SELESAI */}

                    <div>
                      <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                        Tanggal Selesai
                      </label>

                      <input
                        type="date"
                        value={form.tanggalSelesai}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            tanggalSelesai: e.target.value,
                          });

                          setErrors({
                            ...errors,
                            tanggalSelesai: undefined,
                          });
                        }}
                        className={`w-full px-3 py-2.5 text-sm theme-input rounded-lg ${themeFocus} transition-colors`}
                      />

                      {errors.tanggalSelesai && (
                        <p className="text-xs theme-danger mt-1.5">
                          {errors.tanggalSelesai}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ALASAN */}

                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Alasan
                    </label>

                    <textarea
                      value={form.alasan}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          alasan: e.target.value,
                        });

                        setErrors({
                          ...errors,
                          alasan: undefined,
                        });
                      }}
                      rows={3}
                      placeholder="Jelaskan alasan pengajuan izin Anda..."
                      className={`w-full px-3 py-2.5 text-sm theme-input rounded-lg ${themeFocus} transition-colors resize-none placeholder:text-[var(--color-text-placeholder)]`}
                    />

                    {errors.alasan && (
                      <p className="text-xs theme-danger mt-1.5">
                        {errors.alasan}
                      </p>
                    )}
                  </div>

                  {/* FORM ACTION */}

                  <div className="flex items-center justify-end gap-2 pt-1">

                    {/* BATAL */}

                    <button
                      onClick={() => {
                        setShowForm(false);
                        setErrors({});
                      }}
                      className={`px-4 py-2.5 text-sm font-medium theme-text-secondary theme-card border ${themeNeutralBorder} rounded-lg ${themeNeutralHover} transition-colors`}
                    >
                      Batal
                    </button>

                    {/* KIRIM */}

                    <button
                      onClick={handleSubmit}
                      className={`px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} rounded-lg hover:opacity-90 transition-opacity ${themeSmallShadow}`}
                    >
                      Kirim Pengajuan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                RIWAYAT IZIN
            ================================================== */}

            <div
              className={`theme-card rounded-xl ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              {/* HEADER RIWAYAT */}

              <div
                className={`p-4 sm:p-5 ${themeDivider} border-b flex items-center justify-between`}
              >
                <h3 className="text-sm font-semibold theme-text truncate">
                  Riwayat Pengajuan
                </h3>

                <span className="text-xs theme-text-muted flex-shrink-0">
                  {riwayatIzin.length} pengajuan
                </span>
              </div>

              {/* LIST */}

              <div>
                {riwayatIzin.length === 0 && (
                  <div
                    className={`p-10 text-center ${themeNeutralSurface}`}
                  >
                    <FileText
                      size={28}
                      className="mx-auto theme-text-muted mb-2"
                    />

                    <p className="text-sm theme-text-muted">
                      Belum ada pengajuan izin.
                    </p>
                  </div>
                )}

                {riwayatIzin.map((r, index) => {
                  const s = statusStyle[r.status];
                  const StatusIcon = s.icon;

                  return (
                    <div
                      key={r.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 ${
                        index !== riwayatIzin.length - 1
                          ? `border-b ${themeDivider}`
                          : ""
                      } ${themeNeutralHover} transition-colors`}
                    >
                      <div className="min-w-0 flex-1">

                        {/* JENIS + STATUS */}

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold theme-text">
                            {r.jenis}
                          </span>

                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border} flex items-center gap-1`}
                          >
                            <StatusIcon size={11} />
                            {s.label}
                          </span>
                        </div>

                        {/* TANGGAL */}

                        <p className="text-xs theme-text-secondary mt-1.5 flex items-center gap-1.5">
                          <CalendarDays
                            size={13}
                            className="theme-text-muted flex-shrink-0"
                          />

                          {r.tanggalMulai === r.tanggalSelesai
                            ? r.tanggalMulai
                            : `${r.tanggalMulai} - ${r.tanggalSelesai}`}
                        </p>

                        {/* ALASAN */}

                        <p className="text-sm theme-text-secondary mt-2 leading-relaxed">
                          {r.alasan}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}