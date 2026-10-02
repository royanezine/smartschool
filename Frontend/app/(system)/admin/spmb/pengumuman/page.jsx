"use client";

import { useState, useMemo } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  ChevronRight,
  Search,
  X,
  Plus,
  Megaphone,
  Eye,
  Pencil,
  Send,
  Archive,
  Trash2,
  Calendar,
  FileText,
  Paperclip,
  Printer,
  Download,
  CheckCircle2,
  Clock3,
  School,
  Layers,
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

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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
// DATA AWAL
// ============================================================

const TAHUN_AJARAN_AKTIF = "2026/2027";
const NAMA_SEKOLAH = "SMK SmartSchool";
const ALAMAT_SEKOLAH =
  "Jl. Pendidikan No. 17, Kota Bandung, Jawa Barat";

const JURUSAN_LIST = [
  "RPL",
  "TKJ",
  "Multimedia",
  "Akuntansi",
];

const GELOMBANG_LIST = [
  "Gelombang 1",
  "Gelombang 2",
];

const JALUR_LIST = [
  "Reguler",
  "Prestasi",
  "Afirmasi",
];

const initialPengumuman = [
  {
    id: 1,
    judul: "Pengumuman Hasil Seleksi PPDB Gelombang 1",
    tahunAjaran: "2026/2027",
    gelombang: "Gelombang 1",
    jalur: "Reguler",
    status: "Dipublikasikan",
    tanggalDibuat: "2026-06-10",
    tanggalPublikasi: "2026-06-12",
    dibuatOleh: "Admin PPDB",
    lampiran: "SK-Hasil-Seleksi-Gel1.pdf",
    konten:
      "Sehubungan dengan telah selesainya proses seleksi Penerimaan Peserta Didik Baru (PPDB) Gelombang 1 Tahun Ajaran 2026/2027, dengan ini kami umumkan bahwa peserta yang dinyatakan LULUS, CADANGAN, dan TIDAK LULUS dapat dilihat pada rincian di bawah ini.\n\nBagi peserta yang dinyatakan LULUS, diwajibkan melakukan daftar ulang paling lambat 5 (lima) hari kerja setelah tanggal pengumuman ini diterbitkan. Kelalaian melakukan daftar ulang pada batas waktu yang ditentukan dapat mengakibatkan pengunduran status kelulusan dan digantikan oleh peserta cadangan sesuai urutan ranking.\n\nBagi peserta yang dinyatakan CADANGAN, dimohon untuk tetap memantau informasi lebih lanjut melalui laman resmi maupun kontak panitia PPDB.",
    ringkasan: {
      RPL: {
        lulus: 3,
        cadangan: 1,
        tidakLulus: 2,
      },
      TKJ: {
        lulus: 3,
        cadangan: 1,
        tidakLulus: 1,
      },
      Multimedia: {
        lulus: 2,
        cadangan: 1,
        tidakLulus: 1,
      },
      Akuntansi: {
        lulus: 2,
        cadangan: 1,
        tidakLulus: 1,
      },
    },
  },
  {
    id: 2,
    judul: "Jadwal Daftar Ulang Peserta Lulus Gelombang 1",
    tahunAjaran: "2026/2027",
    gelombang: "Gelombang 1",
    jalur: "Reguler",
    status: "Dipublikasikan",
    tanggalDibuat: "2026-06-13",
    tanggalPublikasi: "2026-06-13",
    dibuatOleh: "Admin PPDB",
    lampiran: null,
    konten:
      "Menindaklanjuti pengumuman hasil seleksi PPDB Gelombang 1, berikut kami sampaikan jadwal daftar ulang bagi peserta yang dinyatakan LULUS. Daftar ulang dilaksanakan mulai 15 Juni 2026 sampai dengan 19 Juni 2026 bertempat di ruang Tata Usaha sekolah pada jam kerja.\n\nBerkas yang perlu dibawa saat daftar ulang akan diinformasikan menyusul melalui grup resmi wali peserta didik.",
    ringkasan: null,
  },
  {
    id: 3,
    judul:
      "Pengumuman Hasil Seleksi PPDB Gelombang 2 (Jalur Prestasi)",
    tahunAjaran: "2026/2027",
    gelombang: "Gelombang 2",
    jalur: "Prestasi",
    status: "Draft",
    tanggalDibuat: "2026-08-20",
    tanggalPublikasi: null,
    dibuatOleh: "Admin PPDB",
    lampiran: null,
    konten:
      "Draf pengumuman hasil seleksi PPDB Gelombang 2 jalur prestasi. Dokumen ini masih dalam proses verifikasi data oleh panitia dan belum dapat dipublikasikan kepada peserta.",
    ringkasan: {
      RPL: {
        lulus: 2,
        cadangan: 1,
        tidakLulus: 0,
      },
      TKJ: {
        lulus: 1,
        cadangan: 1,
        tidakLulus: 0,
      },
      Multimedia: {
        lulus: 1,
        cadangan: 0,
        tidakLulus: 0,
      },
      Akuntansi: {
        lulus: 1,
        cadangan: 1,
        tidakLulus: 0,
      },
    },
  },
];

const STATUS_STYLES = {
  Dipublikasikan: `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`,
  Draft: `${themeNeutralSurface} ${themeNeutralBorder} theme-text-secondary`,
};

const STATUS_ICON = {
  Dipublikasikan: CheckCircle2,
  Draft: Clock3,
};

const GELOMBANG_FILTER_OPTIONS = [
  "Semua Gelombang",
  ...GELOMBANG_LIST,
];

const STATUS_FILTER_OPTIONS = [
  "Semua Status",
  "Dipublikasikan",
  "Draft",
];

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const HARI_INI_ISO = "2026-08-26";

function formatTanggal(iso) {
  if (!iso) return "-";

  const d = new Date(iso + "T00:00:00");

  if (Number.isNaN(d.getTime())) return "-";

  return `${d.getDate()} ${
    BULAN[d.getMonth()]
  } ${d.getFullYear()}`;
}

const emptyForm = {
  judul: "",
  tahunAjaran: TAHUN_AJARAN_AKTIF,
  gelombang: GELOMBANG_LIST[0],
  jalur: JALUR_LIST[0],
  konten: "",
  lampiran: "",
};

// ============================================================
// PAGE
// ============================================================

export default function PengumumanPPDBPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [pengumumanList, setPengumumanList] =
    useState(initialPengumuman);

  const [search, setSearch] = useState("");
  const [filterGelombang, setFilterGelombang] =
    useState("Semua Gelombang");

  const [filterStatus, setFilterStatus] =
    useState("Semua Status");

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [previewTarget, setPreviewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toggleSidebar = () =>
    setIsCollapsed(!isCollapsed);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return pengumumanList
      .filter((p) => {
        const matchSearch =
          !q || p.judul.toLowerCase().includes(q);

        const matchGelombang =
          filterGelombang === "Semua Gelombang" ||
          p.gelombang === filterGelombang;

        const matchStatus =
          filterStatus === "Semua Status" ||
          p.status === filterStatus;

        return (
          matchSearch &&
          matchGelombang &&
          matchStatus
        );
      })
      .sort(
        (a, b) =>
          new Date(b.tanggalDibuat) -
          new Date(a.tanggalDibuat)
      );
  }, [
    pengumumanList,
    search,
    filterGelombang,
    filterStatus,
  ]);

  const activeFilterCount =
    (filterGelombang !== "Semua Gelombang"
      ? 1
      : 0) +
    (filterStatus !== "Semua Status" ? 1 : 0) +
    (search ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setFilterGelombang("Semua Gelombang");
    setFilterStatus("Semua Status");
  };

  // ==========================================================
  // RINGKASAN
  // ==========================================================

  const ringkasanAtas = useMemo(() => {
    const total = pengumumanList.length;

    const dipublikasikan =
      pengumumanList.filter(
        (p) => p.status === "Dipublikasikan"
      ).length;

    const draft =
      pengumumanList.filter(
        (p) => p.status === "Draft"
      ).length;

    const tanggalTerakhir = pengumumanList
      .filter((p) => p.tanggalPublikasi)
      .map((p) => p.tanggalPublikasi)
      .sort(
        (a, b) =>
          new Date(b) - new Date(a)
      )[0];

    return {
      total,
      dipublikasikan,
      draft,
      tanggalTerakhir,
    };
  }, [pengumumanList]);

  // ==========================================================
  // EDITOR
  // ==========================================================

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowEditor(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      judul: item.judul,
      tahunAjaran: item.tahunAjaran,
      gelombang: item.gelombang,
      jalur: item.jalur,
      konten: item.konten,
      lampiran: item.lampiran ?? "",
    });

    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSimpan = (publish) => {
    if (!formData.judul.trim()) return;

    if (editingId) {
      setPengumumanList((prev) =>
        prev.map((p) => {
          if (p.id !== editingId) return p;

          const statusBaru = publish
            ? "Dipublikasikan"
            : p.status;

          return {
            ...p,
            ...formData,
            lampiran:
              formData.lampiran.trim() || null,
            status: statusBaru,
            tanggalPublikasi:
              statusBaru === "Dipublikasikan"
                ? p.tanggalPublikasi ??
                  HARI_INI_ISO
                : p.tanggalPublikasi,
          };
        })
      );
    } else {
      const baru = {
        id: Date.now(),
        ...formData,
        lampiran:
          formData.lampiran.trim() || null,
        status: publish
          ? "Dipublikasikan"
          : "Draft",
        tanggalDibuat: HARI_INI_ISO,
        tanggalPublikasi: publish
          ? HARI_INI_ISO
          : null,
        dibuatOleh: "Admin PPDB",
        ringkasan: null,
      };

      setPengumumanList((prev) => [
        baru,
        ...prev,
      ]);
    }

    closeEditor();
  };

  // ==========================================================
  // AKSI STATUS
  // ==========================================================

  const togglePublish = (item) => {
    setPengumumanList((prev) =>
      prev.map((p) => {
        if (p.id !== item.id) return p;

        if (p.status === "Dipublikasikan") {
          return {
            ...p,
            status: "Draft",
          };
        }

        return {
          ...p,
          status: "Dipublikasikan",
          tanggalPublikasi:
            p.tanggalPublikasi ??
            HARI_INI_ISO,
        };
      })
    );

    setPreviewTarget((prev) =>
      prev && prev.id === item.id
        ? {
            ...prev,
            status:
              prev.status === "Dipublikasikan"
                ? "Draft"
                : "Dipublikasikan",
            tanggalPublikasi:
              prev.tanggalPublikasi ??
              HARI_INI_ISO,
          }
        : prev
    );
  };

  const handleHapus = () => {
    setPengumumanList((prev) =>
      prev.filter(
        (p) => p.id !== deleteTarget.id
      )
    );

    setDeleteTarget(null);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="pengumuman"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin PPDB",
            email: "adminppdb@smartschool.com",
            avatar: "PP",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1320px] space-y-5">
              {/* BREADCRUMB */}

              <div className="flex items-center gap-1.5 text-xs">
                <span className="theme-text-muted">
                  PPDB
                </span>

                <ChevronRight
                  size={12}
                  className="theme-text-placeholder"
                />

                <span
                  className={`font-medium ${themePrimaryText}`}
                >
                  Pengumuman
                </span>
              </div>

              {/* ================================================= */}
              {/* KARTU RINGKASAN */}
              {/* ================================================= */}

              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <SummaryCard
                  label="Total Pengumuman"
                  value={ringkasanAtas.total}
                />

                <SummaryCard
                  label="Dipublikasikan"
                  value={ringkasanAtas.dipublikasikan}
                  valueClass="text-[var(--color-success)]"
                />

                <SummaryCard
                  label="Draft"
                  value={ringkasanAtas.draft}
                  valueClass="theme-text-secondary"
                />

                <SummaryCard
                  label="Publikasi Terakhir"
                  value={formatTanggal(
                    ringkasanAtas.tanggalTerakhir
                  )}
                  valueClass={themePrimaryText}
                  compact
                />
              </section>

              {/* ================================================= */}
              {/* TOOLBAR */}
              {/* ================================================= */}

              <section
                className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-wrap items-center gap-3 border-b ${themeDivider} px-5 py-4`}
                >
                  {/* SEARCH */}

                  <div
                    className={`theme-input flex min-w-[200px] flex-1 items-center gap-2 rounded-md border px-3 py-2 text-xs ${themeFocus}`}
                  >
                    <Search
                      size={13}
                      className="theme-text-muted shrink-0"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari judul pengumuman..."
                      className="theme-text w-full bg-transparent text-xs outline-none placeholder:text-[var(--color-text-placeholder)]"
                    />
                  </div>

                  {/* FILTER GELOMBANG */}

                  <select
                    value={filterGelombang}
                    onChange={(e) =>
                      setFilterGelombang(
                        e.target.value
                      )
                    }
                    className={`theme-input rounded-md border px-3 py-2 text-xs outline-none ${themeFocus}`}
                  >
                    {GELOMBANG_FILTER_OPTIONS.map(
                      (g) => (
                        <option
                          key={g}
                          value={g}
                        >
                          {g}
                        </option>
                      )
                    )}
                  </select>

                  {/* FILTER STATUS */}

                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(
                        e.target.value
                      )
                    }
                    className={`theme-input rounded-md border px-3 py-2 text-xs outline-none ${themeFocus}`}
                  >
                    {STATUS_FILTER_OPTIONS.map(
                      (s) => (
                        <option
                          key={s}
                          value={s}
                        >
                          {s}
                        </option>
                      )
                    )}
                  </select>

                  {/* RESET */}

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className={`flex items-center gap-1 text-xs theme-text-muted transition-colors hover:${themePrimaryText}`}
                    >
                      <X size={12} />
                      Reset ({activeFilterCount})
                    </button>
                  )}

                  {/* CREATE */}

                  <button
                    type="button"
                    onClick={openCreate}
                    className={`ml-auto flex items-center gap-1.5 rounded-md ${themePrimaryGradient} px-4 py-2 text-xs font-medium text-[var(--color-card)] ${themePrimaryShadow} transition-opacity hover:opacity-90`}
                  >
                    <Plus size={13} />
                    Buat Pengumuman
                  </button>
                </div>

                {/* ================================================= */}
                {/* DAFTAR */}
                {/* ================================================= */}

                <div>
                  {filtered.length === 0 && (
                    <div className="px-5 py-14 text-center">
                      <Megaphone
                        size={22}
                        className="theme-text-placeholder mx-auto mb-2"
                      />

                      <p className="theme-text-muted text-sm">
                        Belum ada pengumuman yang cocok
                        dengan pencarian/filter.
                      </p>
                    </div>
                  )}

                  {filtered.map((p) => {
                    const StatusIcon =
                      STATUS_ICON[p.status];

                    return (
                      <div
                        key={p.id}
                        className={`border-b ${themeDivider} px-5 py-4 transition-colors last:border-b-0 ${themeNeutralHover}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft}`}
                            >
                              <Megaphone
                                size={16}
                                className={themePrimaryText}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="theme-text truncate text-sm font-semibold">
                                {p.judul}
                              </p>

                              <div className="theme-text-muted mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                                <span className="flex items-center gap-1">
                                  <School size={11} />
                                  T.A.{" "}
                                  {p.tahunAjaran}
                                </span>

                                <span className="flex items-center gap-1">
                                  <Layers size={11} />
                                  {p.gelombang}{" "}
                                  &middot;{" "}
                                  {p.jalur}
                                </span>

                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />

                                  {p.status ===
                                  "Dipublikasikan"
                                    ? `Dipublikasikan ${formatTanggal(
                                        p.tanggalPublikasi
                                      )}`
                                    : `Dibuat ${formatTanggal(
                                        p.tanggalDibuat
                                      )}`}
                                </span>

                                {p.lampiran && (
                                  <span className="theme-text-muted flex items-center gap-1">
                                    <Paperclip
                                      size={11}
                                    />
                                    {p.lampiran}
                                  </span>
                                )}
                              </div>

                              <p className="theme-text-secondary mt-2 line-clamp-2 text-xs">
                                {p.konten}
                              </p>
                            </div>
                          </div>

                          {/* STATUS */}

                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[p.status]}`}
                          >
                            <StatusIcon size={11} />
                            {p.status}
                          </span>
                        </div>

                        {/* ACTIONS */}

                        <div className="mt-3 flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewTarget(p)
                            }
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium theme-text-secondary transition-colors ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                          >
                            <Eye size={13} />
                            Preview
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(p)
                            }
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium ${themePrimaryText} ${themePrimarySoft} transition-colors hover:opacity-80`}
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              togglePublish(p)
                            }
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              p.status ===
                              "Dipublikasikan"
                                ? `text-[var(--color-warning)] ${themeWarningSurface}`
                                : `text-[var(--color-success)] ${themeSuccessSurface}`
                            }`}
                          >
                            {p.status ===
                            "Dipublikasikan" ? (
                              <>
                                <Archive
                                  size={13}
                                />
                                Jadikan Draft
                              </>
                            ) : (
                              <>
                                <Send
                                  size={13}
                                />
                                Publikasikan
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget(p)
                            }
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium theme-text-muted transition-colors ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* FOOTER */}

              <footer className="theme-text-muted py-3 text-center text-[11px]">
                © 2026 SmartSchool &middot;
                Dashboard Admin PPDB &middot; All
                rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* ====================================================== */}
      {/* MODAL EDITOR */}
      {/* ====================================================== */}

      {showEditor && (
        <ModalOverlay>
          <div
            className={`theme-card max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border ${themeNeutralBorder} p-6 ${themeCardShadow}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="theme-text text-sm font-semibold">
                {editingId
                  ? "Edit Pengumuman"
                  : "Buat Pengumuman Baru"}
              </h3>

              <button
                type="button"
                onClick={closeEditor}
                className={`theme-text-muted rounded-md p-1 transition-colors ${themeNeutralHover} hover:text-[var(--color-primary)]`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* JUDUL */}

              <div>
                <label className="theme-text-muted text-[11px]">
                  Judul Pengumuman
                </label>

                <input
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      judul: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Pengumuman Hasil Seleksi PPDB Gelombang 1"
                  className={`theme-input mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none ${themeFocus}`}
                />
              </div>

              {/* META */}

              <div className="grid grid-cols-3 gap-3">
                <FormInput
                  label="Tahun Ajaran"
                  value={formData.tahunAjaran}
                  onChange={(value) =>
                    setFormData((f) => ({
                      ...f,
                      tahunAjaran: value,
                    }))
                  }
                />

                <FormSelect
                  label="Gelombang"
                  value={formData.gelombang}
                  options={GELOMBANG_LIST}
                  onChange={(value) =>
                    setFormData((f) => ({
                      ...f,
                      gelombang: value,
                    }))
                  }
                />

                <FormSelect
                  label="Jalur"
                  value={formData.jalur}
                  options={JALUR_LIST}
                  onChange={(value) =>
                    setFormData((f) => ({
                      ...f,
                      jalur: value,
                    }))
                  }
                />
              </div>

              {/* KONTEN */}

              <div>
                <label className="theme-text-muted text-[11px]">
                  Isi Pengumuman
                </label>

                <textarea
                  value={formData.konten}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      konten: e.target.value,
                    }))
                  }
                  rows={7}
                  placeholder="Tuliskan isi pengumuman secara lengkap di sini..."
                  className={`theme-input mt-1 w-full resize-none rounded-md border px-3 py-2 text-sm outline-none ${themeFocus}`}
                />
              </div>

              {/* LAMPIRAN */}

              <div>
                <label className="theme-text-muted text-[11px]">
                  Lampiran (opsional)
                </label>

                <div
                  className={`theme-input mt-1 flex items-center gap-2 rounded-md border px-3 py-2 ${themeFocus}`}
                >
                  <Paperclip
                    size={13}
                    className="theme-text-muted shrink-0"
                  />

                  <input
                    value={formData.lampiran}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        lampiran:
                          e.target.value,
                      }))
                    }
                    placeholder="nama-file-lampiran.pdf"
                    className="theme-text w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-placeholder)]"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER MODAL */}

            <div
              className={`mt-5 flex items-center justify-end gap-2 border-t ${themeDivider} pt-5`}
            >
              <button
                type="button"
                onClick={closeEditor}
                className="theme-text-secondary px-4 py-2 text-xs font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSimpan(false)
                }
                disabled={!formData.judul.trim()}
                className={`flex items-center gap-1.5 rounded-md border ${themeNeutralBorder} theme-card theme-text-secondary px-4 py-2 text-xs font-medium transition-colors ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <FileText size={13} />
                Simpan sebagai Draft
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSimpan(true)
                }
                disabled={!formData.judul.trim()}
                className={`flex items-center gap-1.5 rounded-md ${themePrimaryGradient} px-4 py-2 text-xs font-medium text-[var(--color-card)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <Send size={13} />
                Simpan &amp; Publikasikan
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ====================================================== */}
      {/* MODAL PREVIEW */}
      {/* ====================================================== */}

      {previewTarget && (
        <ModalOverlay>
          <div
            className={`theme-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
          >
            {/* HEADER */}

            <div
              className={`theme-card sticky top-0 z-10 flex items-center justify-between border-b ${themeDivider} px-6 py-4`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[previewTarget.status]}`}
                >
                  {previewTarget.status}
                </span>

                <span className="theme-text-muted text-xs">
                  Pratinjau Pengumuman
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    window.print()
                  }
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium theme-text-secondary transition-colors ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                >
                  <Printer size={13} />
                  Cetak
                </button>

                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium theme-text-secondary transition-colors ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                >
                  <Download size={13} />
                  Unduh PDF
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewTarget(null)
                  }
                  className={`theme-text-muted ml-1 rounded-md p-1 transition-colors ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* CONTENT */}

            <div className="p-8">
              {/* KOP */}

              <div
                className={`mb-6 border-b-4 border-double ${themeDivider} pb-4 text-center`}
              >
                <p className="theme-text text-base font-bold tracking-wide">
                  {NAMA_SEKOLAH}
                </p>

                <p className="theme-text-secondary mt-0.5 text-xs">
                  {ALAMAT_SEKOLAH}
                </p>
              </div>

              {/* JUDUL */}

              <div className="mb-6 text-center">
                <p className="theme-text text-sm font-bold uppercase tracking-wide">
                  Pengumuman Hasil Seleksi
                </p>

                <p className="theme-text text-sm font-bold uppercase tracking-wide">
                  Penerimaan Peserta Didik Baru
                  (PPDB)
                </p>

                <p className="theme-text-muted mt-1 text-xs">
                  Nomor: 421.7/
                  {String(
                    previewTarget.id
                  ).padStart(3, "0")}
                  /PPDB/2026
                </p>
              </div>

              {/* INFORMASI */}

              <div
                className={`mb-5 grid grid-cols-2 gap-3 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-4 text-xs`}
              >
                <PreviewInfo
                  label="Judul"
                  value={previewTarget.judul}
                />

                <PreviewInfo
                  label="Tahun Ajaran"
                  value={
                    previewTarget.tahunAjaran
                  }
                />

                <PreviewInfo
                  label="Gelombang / Jalur"
                  value={`${previewTarget.gelombang} · ${previewTarget.jalur}`}
                />

                <PreviewInfo
                  label="Tanggal Publikasi"
                  value={formatTanggal(
                    previewTarget.tanggalPublikasi
                  )}
                />
              </div>

              {/* KONTEN */}

              <div className="theme-text-secondary mb-6 whitespace-pre-line text-sm leading-relaxed">
                {previewTarget.konten}
              </div>

              {/* RINGKASAN */}

              {previewTarget.ringkasan && (
                <div className="mb-6">
                  <p className="theme-text-secondary mb-2 text-xs font-semibold">
                    Rekapitulasi Hasil Seleksi
                    per Jurusan
                  </p>

                  <div
                    className={`overflow-hidden rounded-lg border ${themeNeutralBorder}`}
                  >
                    <table className="w-full text-xs">
                      <thead>
                        <tr
                          className={`${themeNeutralSurface} theme-text-secondary`}
                        >
                          <th className="px-3 py-2 text-left font-medium">
                            Jurusan
                          </th>

                          <th className="px-3 py-2 text-center font-medium">
                            Lulus
                          </th>

                          <th className="px-3 py-2 text-center font-medium">
                            Cadangan
                          </th>

                          <th className="px-3 py-2 text-center font-medium">
                            Tidak Lulus
                          </th>

                          <th className="px-3 py-2 text-center font-medium">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {JURUSAN_LIST.map(
                          (j) => {
                            const r =
                              previewTarget
                                .ringkasan[
                                j
                              ] ?? {
                                lulus: 0,
                                cadangan: 0,
                                tidakLulus: 0,
                              };

                            const total =
                              r.lulus +
                              r.cadangan +
                              r.tidakLulus;

                            return (
                              <tr
                                key={j}
                                className={`border-t ${themeDivider}`}
                              >
                                <td className="theme-text px-3 py-2 font-medium">
                                  {j}
                                </td>

                                <td className="px-3 py-2 text-center text-[var(--color-success)]">
                                  {r.lulus}
                                </td>

                                <td className="px-3 py-2 text-center text-[var(--color-warning)]">
                                  {r.cadangan}
                                </td>

                                <td className="theme-danger px-3 py-2 text-center">
                                  {r.tidakLulus}
                                </td>

                                <td className="theme-text-muted px-3 py-2 text-center">
                                  {total}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* LAMPIRAN */}

              {previewTarget.lampiran && (
                <div
                  className={`mb-6 flex w-fit items-center gap-2 rounded-md border ${themePrimarySoftBorder} ${themePrimarySoft} px-3 py-2 text-xs ${themePrimaryText}`}
                >
                  <Paperclip size={13} />
                  {previewTarget.lampiran}
                </div>
              )}

              {/* TANDA TANGAN */}

              <div className="flex justify-end">
                <div className="theme-text-secondary w-48 text-center text-xs">
                  <p>
                    Bandung,{" "}
                    {formatTanggal(
                      previewTarget.tanggalPublikasi ??
                        previewTarget.tanggalDibuat
                    )}
                  </p>

                  <p className="mt-1">
                    Kepala Sekolah
                  </p>

                  <div className="h-16" />

                  <p
                    className={`theme-text border-t ${themeDivider} pt-1 font-medium`}
                  >
                    Nama Kepala Sekolah
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className={`flex items-center justify-end gap-2 border-t ${themeDivider} px-6 py-4`}
            >
              <button
                type="button"
                onClick={() =>
                  togglePublish(
                    previewTarget
                  )
                }
                className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                  previewTarget.status ===
                  "Dipublikasikan"
                    ? `${themeWarningSurface} ${themeWarningBorder} border text-[var(--color-warning)]`
                    : `${themePrimaryGradient} text-[var(--color-card)]`
                }`}
              >
                {previewTarget.status ===
                "Dipublikasikan" ? (
                  <>
                    <Archive size={13} />
                    Jadikan Draft
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Publikasikan Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ====================================================== */}
      {/* MODAL HAPUS */}
      {/* ====================================================== */}

      {deleteTarget && (
        <ModalOverlay>
          <div
            className={`theme-card w-full max-w-sm rounded-xl border ${themeNeutralBorder} p-6 ${themeCardShadow}`}
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${themeDangerSurface} ${themeDangerBorder} border`}
            >
              <Trash2
                size={17}
                className="theme-danger"
              />
            </div>

            <h3 className="theme-text text-sm font-semibold">
              Hapus pengumuman ini?
            </h3>

            <p className="theme-text-secondary mt-1.5 text-xs">
              &ldquo;{deleteTarget.judul}
              &rdquo; akan dihapus permanen dan
              tidak dapat dikembalikan.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="theme-text-secondary px-4 py-2 text-xs font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleHapus}
                className={`flex items-center gap-1.5 rounded-md ${themeDangerSurface} ${themeDangerBorder} border px-4 py-2 text-xs font-medium theme-danger transition-colors`}
              >
                <Trash2 size={13} />
                Hapus
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ============================================================
// COMPONENT: SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  valueClass = "theme-text",
  compact = false,
}) {
  return (
    <div
      className={`theme-card rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
    >
      <p className="theme-text-muted text-xs">
        {label}
      </p>

      <p
        className={`mt-2 font-bold ${
          compact
            ? "text-lg"
            : "text-2xl"
        } ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// COMPONENT: MODAL OVERLAY
// ============================================================

function ModalOverlay({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_42%,transparent)] p-4 backdrop-blur-[1px]">
      {children}
    </div>
  );
}

// ============================================================
// COMPONENT: FORM INPUT
// ============================================================

function FormInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="theme-text-muted text-[11px]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`theme-input mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none ${themeFocus}`}
      />
    </div>
  );
}

// ============================================================
// COMPONENT: FORM SELECT
// ============================================================

function FormSelect({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <div>
      <label className="theme-text-muted text-[11px]">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`theme-input mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none ${themeFocus}`}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================
// COMPONENT: PREVIEW INFO
// ============================================================

function PreviewInfo({
  label,
  value,
}) {
  return (
    <p>
      <span className="theme-text-muted">
        {label}
      </span>

      <br />

      <span className="theme-text font-medium">
        {value}
      </span>
    </p>
  );
}