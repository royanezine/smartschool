"use client";

import { useState, useMemo } from "react";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import {
  ChevronRight,
  Search,
  X,
  Eye,
  User,
  School,
  BookOpen,
  Trophy,
  Settings2,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock3,
  Save,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

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

// ================= DATA AWAL =================

const initialPendaftar = [
  {
    id: 1,
    noPendaftaran: "PPDB001",
    nama: "Andi Saputra",
    asalSekolah: "SMP Negeri 1",
    jurusan: "RPL",
    nilai: 88.5,
    statusManual: null,
  },
  {
    id: 2,
    noPendaftaran: "PPDB002",
    nama: "Budi Hartono",
    asalSekolah: "SMP Negeri 2",
    jurusan: "TKJ",
    nilai: 86.2,
    statusManual: null,
  },
  {
    id: 3,
    noPendaftaran: "PPDB003",
    nama: "Citra Ayu Lestari",
    asalSekolah: "SMP Negeri 3",
    jurusan: "RPL",
    nilai: 79.5,
    statusManual: null,
  },
  {
    id: 4,
    noPendaftaran: "PPDB004",
    nama: "Deni Firmansyah",
    asalSekolah: "SMP Islam Al-Amin",
    jurusan: "Akuntansi",
    nilai: 74.0,
    statusManual: null,
  },
  {
    id: 5,
    noPendaftaran: "PPDB005",
    nama: "Eka Putri Wulandari",
    asalSekolah: "SMP Negeri 4",
    jurusan: "RPL",
    nilai: 91.2,
    statusManual: null,
  },
  {
    id: 6,
    noPendaftaran: "PPDB006",
    nama: "Fajar Nugroho",
    asalSekolah: "SMP Negeri 1",
    jurusan: "TKJ",
    nilai: 82.7,
    statusManual: null,
  },
  {
    id: 7,
    noPendaftaran: "PPDB007",
    nama: "Gita Lestari",
    asalSekolah: "SMP Kristen Harapan",
    jurusan: "Multimedia",
    nilai: 85.0,
    statusManual: null,
  },
  {
    id: 8,
    noPendaftaran: "PPDB008",
    nama: "Hendra Wijaya",
    asalSekolah: "SMP Negeri 5",
    jurusan: "Akuntansi",
    nilai: 88.9,
    statusManual: null,
  },
  {
    id: 9,
    noPendaftaran: "PPDB009",
    nama: "Indah Permatasari",
    asalSekolah: "SMP Negeri 2",
    jurusan: "RPL",
    nilai: 84.4,
    statusManual: null,
  },
  {
    id: 10,
    noPendaftaran: "PPDB010",
    nama: "Joko Prasetyo",
    asalSekolah: "SMP Negeri 3",
    jurusan: "TKJ",
    nilai: 90.1,
    statusManual: null,
  },
  {
    id: 11,
    noPendaftaran: "PPDB011",
    nama: "Kartika Sari",
    asalSekolah: "SMP Negeri 4",
    jurusan: "Multimedia",
    nilai: 77.3,
    statusManual: null,
  },
  {
    id: 12,
    noPendaftaran: "PPDB012",
    nama: "Luthfi Rahman",
    asalSekolah: "SMP Islam Al-Amin",
    jurusan: "Akuntansi",
    nilai: 69.8,
    statusManual: null,
  },
  {
    id: 13,
    noPendaftaran: "PPDB013",
    nama: "Maya Anggraini",
    asalSekolah: "SMP Negeri 1",
    jurusan: "RPL",
    nilai: 76.6,
    statusManual: null,
  },
  {
    id: 14,
    noPendaftaran: "PPDB014",
    nama: "Naufal Ardiansyah",
    asalSekolah: "SMP Negeri 5",
    jurusan: "TKJ",
    nilai: 73.5,
    statusManual: null,
  },
  {
    id: 15,
    noPendaftaran: "PPDB015",
    nama: "Olivia Zahra",
    asalSekolah: "SMP Kristen Harapan",
    jurusan: "Multimedia",
    nilai: 92.4,
    statusManual: null,
  },
  {
    id: 16,
    noPendaftaran: "PPDB016",
    nama: "Putra Wibowo",
    asalSekolah: "SMP Negeri 2",
    jurusan: "Akuntansi",
    nilai: 81.2,
    statusManual: null,
  },
];

const JURUSAN_LIST = ["RPL", "TKJ", "Multimedia", "Akuntansi"];

const DEFAULT_KUOTA = {
  RPL: 3,
  TKJ: 3,
  Multimedia: 2,
  Akuntansi: 2,
};

const DEFAULT_CADANGAN = {
  RPL: 1,
  TKJ: 1,
  Multimedia: 1,
  Akuntansi: 1,
};

// ============================================================
// STATUS THEME
// ============================================================

const STATUS_STYLES = {
  Lulus: `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`,
  Cadangan: `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`,
  "Tidak Lulus": `${themeDangerSurface} ${themeDangerBorder} theme-danger`,
};

const STATUS_ICON = {
  Lulus: CheckCircle2,
  Cadangan: Clock3,
  "Tidak Lulus": XCircle,
};

const JURUSAN_FILTER_OPTIONS = [
  "Semua Jurusan",
  ...JURUSAN_LIST,
];

const STATUS_FILTER_OPTIONS = [
  "Semua Status",
  "Lulus",
  "Cadangan",
  "Tidak Lulus",
];

// ============================================================
// UTIL SELEKSI
// ============================================================

function hitungSeleksi(pendaftar, kuota, cadangan) {
  const byJurusan = {};

  pendaftar.forEach((p) => {
    if (!byJurusan[p.jurusan]) {
      byJurusan[p.jurusan] = [];
    }

    byJurusan[p.jurusan].push(p);
  });

  const hasil = [];

  Object.entries(byJurusan).forEach(([jurusan, list]) => {
    const sorted = [...list].sort(
      (a, b) => b.nilai - a.nilai
    );

    const kuotaJurusan = kuota[jurusan] ?? 0;
    const cadanganJurusan = cadangan[jurusan] ?? 0;

    sorted.forEach((p, idx) => {
      const ranking = idx + 1;

      let statusOtomatis;

      if (ranking <= kuotaJurusan) {
        statusOtomatis = "Lulus";
      } else if (
        ranking <=
        kuotaJurusan + cadanganJurusan
      ) {
        statusOtomatis = "Cadangan";
      } else {
        statusOtomatis = "Tidak Lulus";
      }

      hasil.push({
        ...p,
        ranking,
        statusOtomatis,
        status: p.statusManual ?? statusOtomatis,
      });
    });
  });

  return hasil.sort(
    (a, b) =>
      a.jurusan.localeCompare(b.jurusan) ||
      a.ranking - b.ranking
  );
}

const ROWS_PER_PAGE = 10;

// ============================================================
// PAGE
// ============================================================

export default function SeleksiPPDBPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [pendaftar, setPendaftar] =
    useState(initialPendaftar);

  const [kuota, setKuota] =
    useState(DEFAULT_KUOTA);

  const [cadangan, setCadangan] =
    useState(DEFAULT_CADANGAN);

  const [kuotaDraft, setKuotaDraft] =
    useState(DEFAULT_KUOTA);

  const [cadanganDraft, setCadanganDraft] =
    useState(DEFAULT_CADANGAN);

  const [showKuotaPanel, setShowKuotaPanel] =
    useState(true);

  const [search, setSearch] = useState("");

  const [filterJurusan, setFilterJurusan] =
    useState("Semua Jurusan");

  const [filterStatus, setFilterStatus] =
    useState("Semua Status");

  const [page, setPage] = useState(1);

  const [detailTarget, setDetailTarget] =
    useState(null);

  const toggleSidebar = () =>
    setIsCollapsed(!isCollapsed);

  const hasilSeleksi = useMemo(
    () =>
      hitungSeleksi(
        pendaftar,
        kuota,
        cadangan
      ),
    [pendaftar, kuota, cadangan]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return hasilSeleksi.filter((p) => {
      const matchSearch =
        !q ||
        p.nama.toLowerCase().includes(q) ||
        p.noPendaftaran
          .toLowerCase()
          .includes(q);

      const matchJurusan =
        filterJurusan === "Semua Jurusan" ||
        p.jurusan === filterJurusan;

      const matchStatus =
        filterStatus === "Semua Status" ||
        p.status === filterStatus;

      return (
        matchSearch &&
        matchJurusan &&
        matchStatus
      );
    });
  }, [
    hasilSeleksi,
    search,
    filterJurusan,
    filterStatus,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / ROWS_PER_PAGE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paged = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const updateFilter =
    (setter) => (val) => {
      setter(val);
      setPage(1);
    };

  const resetFilters = () => {
    setSearch("");
    setFilterJurusan("Semua Jurusan");
    setFilterStatus("Semua Status");
    setPage(1);
  };

  const activeFilterCount =
    (filterJurusan !== "Semua Jurusan"
      ? 1
      : 0) +
    (filterStatus !== "Semua Status"
      ? 1
      : 0) +
    (search ? 1 : 0);

  // Terapkan draft kuota & cadangan
  const terapkanKuota = () => {
    setKuota(kuotaDraft);
    setCadangan(cadanganDraft);
  };

  // Override manual
  const setStatusManual = (id, status) => {
    setPendaftar((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              statusManual: status,
            }
          : p
      )
    );

    setDetailTarget((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status,
            statusManual: status,
          }
        : prev
    );
  };

  // Reset ke ranking otomatis
  const resetStatusManual = (id) => {
    setPendaftar((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              statusManual: null,
            }
          : p
      )
    );

    setDetailTarget((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            statusManual: null,
            status: prev.statusOtomatis,
          }
        : prev
    );
  };

  const ringkasan = useMemo(() => {
    const total = hasilSeleksi.length;

    const lulus = hasilSeleksi.filter(
      (p) => p.status === "Lulus"
    ).length;

    const cadanganCount =
      hasilSeleksi.filter(
        (p) => p.status === "Cadangan"
      ).length;

    const tidakLulus =
      hasilSeleksi.filter(
        (p) => p.status === "Tidak Lulus"
      ).length;

    const totalKuota = Object.values(
      kuota
    ).reduce(
      (a, b) => a + (Number(b) || 0),
      0
    );

    return {
      total,
      lulus,
      cadanganCount,
      tidakLulus,
      totalKuota,
    };
  }, [hasilSeleksi, kuota]);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="seleksi"
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
                  className="theme-text-muted"
                />

                <span className="font-medium theme-text-secondary">
                  Seleksi Pendaftar
                </span>
              </div>

              {/* =====================================================
                  RINGKASAN
              ====================================================== */}

              <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">

                <SummaryCard
                  label="Total Peserta"
                  value={ringkasan.total}
                />

                <SummaryCard
                  label="Total Kuota"
                  value={ringkasan.totalKuota}
                  valueClass={themePrimaryText}
                />

                <SummaryCard
                  label="Lulus"
                  value={ringkasan.lulus}
                  valueClass="text-[var(--color-success)]"
                />

                <SummaryCard
                  label="Cadangan"
                  value={ringkasan.cadanganCount}
                  valueClass="text-[var(--color-warning)]"
                />

                <SummaryCard
                  label="Tidak Lulus"
                  value={ringkasan.tidakLulus}
                  valueClass="theme-danger"
                  centered
                  soft
                />

              </section>

              {/* =====================================================
                  PANEL KUOTA
              ====================================================== */}

              <section
                className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <button
                  onClick={() =>
                    setShowKuotaPanel(
                      (v) => !v
                    )
                  }
                  className={`flex w-full items-center justify-between border-b ${themeDivider} px-5 py-4 text-left transition-colors ${themeNeutralHover}`}
                >
                  <div className="flex items-center gap-2">
                    <Settings2
                      size={15}
                      className={themePrimaryText}
                    />

                    <span className="text-sm font-semibold theme-text">
                      Pengaturan Kuota Jurusan
                    </span>
                  </div>

                  <ChevronRight
                    size={14}
                    className={`theme-text-muted transition-transform ${
                      showKuotaPanel
                        ? "rotate-90"
                        : ""
                    }`}
                  />
                </button>

                {showKuotaPanel && (
                  <div className="space-y-4 p-5">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {JURUSAN_LIST.map(
                        (j) => (
                          <div
                            key={j}
                            className={`rounded-lg border ${themeNeutralBorder} theme-card-soft p-4`}
                          >
                            <p className="mb-3 text-xs font-semibold theme-text">
                              {j}
                            </p>

                            <div className="space-y-2.5">

                              <div>
                                <label className="text-[11px] theme-text-muted">
                                  Kuota Lulus
                                </label>

                                <input
                                  type="number"
                                  min={0}
                                  value={
                                    kuotaDraft[j]
                                  }
                                  onChange={(e) =>
                                    setKuotaDraft(
                                      (prev) => ({
                                        ...prev,
                                        [j]: Number(
                                          e.target
                                            .value
                                        ),
                                      })
                                    )
                                  }
                                  className={`mt-1 w-full rounded-md border px-2.5 py-1.5 text-sm outline-none theme-input ${themeFocus}`}
                                />
                              </div>

                              <div>
                                <label className="text-[11px] theme-text-muted">
                                  Kuota Cadangan
                                </label>

                                <input
                                  type="number"
                                  min={0}
                                  value={
                                    cadanganDraft[
                                      j
                                    ]
                                  }
                                  onChange={(e) =>
                                    setCadanganDraft(
                                      (prev) => ({
                                        ...prev,
                                        [j]: Number(
                                          e.target
                                            .value
                                        ),
                                      })
                                    )
                                  }
                                  className={`mt-1 w-full rounded-md border px-2.5 py-1.5 text-sm outline-none theme-input ${themeFocus}`}
                                />
                              </div>

                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] leading-relaxed theme-text-muted">
                        Ranking dihitung otomatis
                        dari nilai tertinggi ke
                        terendah pada masing-masing
                        jurusan. Peringkat di dalam
                        kuota lulus akan berstatus{" "}
                        <span className="font-medium text-[var(--color-success)]">
                          Lulus
                        </span>
                        , selanjutnya masuk kuota
                        cadangan akan berstatus{" "}
                        <span className="font-medium text-[var(--color-warning)]">
                          Cadangan
                        </span>
                        , sisanya{" "}
                        <span className="font-medium theme-danger">
                          Tidak Lulus
                        </span>
                        .
                      </p>

                      <button
                        onClick={terapkanKuota}
                        className={`flex flex-shrink-0 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium ${themePrimaryGradient} text-[var(--color-card)] shadow-sm transition-opacity hover:opacity-90`}
                      >
                        <RefreshCcw size={13} />
                        Proses Seleksi
                      </button>
                    </div>

                  </div>
                )}
              </section>

              {/* =====================================================
                  TABLE
              ====================================================== */}

              <section
                className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >

                {/* SEARCH + FILTER */}
                <div
                  className={`flex flex-wrap items-center gap-3 border-b ${themeDivider} px-5 pb-4 pt-4`}
                >

                  <div
                    className={`flex min-w-[200px] flex-1 items-center gap-2 rounded-md border px-3 py-2 text-xs ${themeNeutralBorder} theme-input`}
                  >
                    <Search
                      size={13}
                      className="theme-text-muted flex-shrink-0"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        updateFilter(
                          setSearch
                        )(
                          e.target.value
                        )
                      }
                      placeholder="Cari nama atau no. pendaftaran..."
                      className="w-full bg-transparent outline-none theme-text placeholder:text-[var(--color-text-placeholder)]"
                    />
                  </div>

                  <select
                    value={filterJurusan}
                    onChange={(e) =>
                      updateFilter(
                        setFilterJurusan
                      )(e.target.value)
                    }
                    className={`rounded-md border px-3 py-2 text-xs outline-none theme-input ${themeFocus}`}
                  >
                    {JURUSAN_FILTER_OPTIONS.map(
                      (j) => (
                        <option
                          key={j}
                          value={j}
                        >
                          {j}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      updateFilter(
                        setFilterStatus
                      )(e.target.value)
                    }
                    className={`rounded-md border px-3 py-2 text-xs outline-none theme-input ${themeFocus}`}
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

                  {activeFilterCount >
                    0 && (
                    <button
                      onClick={
                        resetFilters
                      }
                      className="flex items-center gap-1 text-xs theme-text-muted transition-colors hover:text-[var(--color-primary)]"
                    >
                      <X size={12} />
                      Reset (
                      {
                        activeFilterCount
                      }
                      )
                    </button>
                  )}
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={`border-b ${themeDivider} text-left text-xs theme-text-muted`}
                      >
                        <th className="px-5 py-3 font-medium">
                          Ranking
                        </th>

                        <th className="px-5 py-3 font-medium">
                          No. Pendaftaran
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Nama
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Jurusan
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Nilai
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Status
                        </th>

                        <th className="px-5 py-3 text-right font-medium">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paged.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-10 text-center text-sm theme-text-muted"
                          >
                            Tidak ada peserta
                            yang cocok dengan
                            pencarian/filter.
                          </td>
                        </tr>
                      )}

                      {paged.map((p) => {
                        const StatusIcon =
                          STATUS_ICON[
                            p.status
                          ];

                        return (
                          <tr
                            key={p.id}
                            className={`border-b ${themeDivider} transition-colors ${themeNeutralHover}`}
                          >
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1 font-medium theme-text-secondary">
                                <Trophy
                                  size={12}
                                  className="theme-text-muted"
                                />
                                {p.ranking}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 font-mono theme-text-secondary">
                              {p.noPendaftaran}
                            </td>

                            <td className="px-5 py-3.5 font-medium theme-text">
                              {p.nama}
                            </td>

                            <td className="px-5 py-3.5 theme-text-secondary">
                              {p.jurusan}
                            </td>

                            <td className="px-5 py-3.5 font-medium theme-text-secondary">
                              {p.nilai.toFixed(
                                1
                              )}
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[p.status]}`}
                              >
                                <StatusIcon
                                  size={11}
                                />

                                {p.status}

                                {p.statusManual && (
                                  <span className="opacity-60">
                                    (manual)
                                  </span>
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() =>
                                    setDetailTarget(
                                      p
                                    )
                                  }
                                  className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium theme-text-secondary transition-colors ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                                >
                                  <Eye
                                    size={13}
                                  />
                                  Kelola
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {filtered.length >
                  0 && (
                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 border-t ${themeDivider} px-5 py-4`}
                  >
                    <p className="text-xs theme-text-muted">
                      Menampilkan{" "}
                      {(currentPage - 1) *
                        ROWS_PER_PAGE +
                        1}
                      –
                      {Math.min(
                        currentPage *
                          ROWS_PER_PAGE,
                        filtered.length
                      )}{" "}
                      dari{" "}
                      {filtered.length}{" "}
                      peserta
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={
                          currentPage ===
                          1
                        }
                        onClick={() =>
                          setPage((p) =>
                            Math.max(
                              1,
                              p - 1
                            )
                          )
                        }
                        className={`rounded-md border px-3 py-1.5 text-xs theme-text-secondary ${themeNeutralBorder} ${themeNeutralHover} transition-colors disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        Sebelumnya
                      </button>

                      <span className="px-2 text-xs theme-text-secondary">
                        Hal.{" "}
                        {currentPage} /{" "}
                        {totalPages}
                      </span>

                      <button
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        onClick={() =>
                          setPage((p) =>
                            Math.min(
                              totalPages,
                              p + 1
                            )
                          )
                        }
                        className={`rounded-md border px-3 py-1.5 text-xs theme-text-secondary ${themeNeutralBorder} ${themeNeutralHover} transition-colors disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <footer className="py-3 text-center text-[11px] theme-text-muted">
                © 2026 SmartSchool
                &middot; Dashboard Admin
                PPDB &middot; All rights
                reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================
          MODAL KELOLA STATUS
      ============================================================ */}

      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_42%,transparent)] p-4 backdrop-blur-[1px]">
          <div
            className={`theme-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border ${themeNeutralBorder} p-6 ${themeCardShadow}`}
          >

            {/* HEADER */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold theme-text">
                  Kelola Status Seleksi
                </h3>

                <p className="mt-0.5 font-mono text-xs theme-text-muted">
                  {detailTarget.noPendaftaran}
                </p>
              </div>

              <button
                onClick={() =>
                  setDetailTarget(null)
                }
                className={`rounded-md p-1 theme-text-muted transition-colors ${themeNeutralHover}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* USER */}
            <div
              className={`mb-5 flex items-center gap-3 border-b ${themeDivider} pb-5`}
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${themePrimarySoft}`}
              >
                <User
                  size={20}
                  className={themePrimaryText}
                />
              </div>

              <div>
                <p className="text-sm font-semibold theme-text">
                  {detailTarget.nama}
                </p>

                <span
                  className={`mt-1 inline-block rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[detailTarget.status]}`}
                >
                  {detailTarget.status}
                </span>
              </div>
            </div>

            {/* DETAIL */}
            <div className="mb-5 grid grid-cols-2 gap-4">

              <DetailItem
                icon={School}
                label="Asal Sekolah"
                value={
                  detailTarget.asalSekolah
                }
              />

              <DetailItem
                icon={BookOpen}
                label="Jurusan Pilihan"
                value={
                  detailTarget.jurusan
                }
              />

              <DetailItem
                icon={Trophy}
                label="Ranking di Jurusan"
                value={`Peringkat ${detailTarget.ranking}`}
              />

              <DetailItem
                icon={Trophy}
                label="Nilai Seleksi"
                value={detailTarget.nilai.toFixed(
                  1
                )}
              />

            </div>

            {/* STATUS */}
            <div
              className={`border-t ${themeDivider} pt-4`}
            >
              <p className="mb-2.5 text-xs font-semibold theme-text">
                Tetapkan Status
                Kelulusan
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  "Lulus",
                  "Cadangan",
                  "Tidak Lulus",
                ].map((s) => {
                  const StatusIcon =
                    STATUS_ICON[s];

                  const active =
                    detailTarget.status ===
                    s;

                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setStatusManual(
                          detailTarget.id,
                          s
                        )
                      }
                      className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-[11px] font-medium transition-colors ${
                        active
                          ? STATUS_STYLES[
                              s
                            ]
                          : `${themeNeutralBorder} theme-text-muted ${themeNeutralHover}`
                      }`}
                    >
                      <StatusIcon size={15} />
                      {s}
                    </button>
                  );
                })}
              </div>

              {detailTarget.statusManual && (
                <button
                  onClick={() =>
                    resetStatusManual(
                      detailTarget.id
                    )
                  }
                  className="mt-3 flex items-center gap-1.5 text-[11px] theme-text-muted transition-colors hover:text-[var(--color-primary)]"
                >
                  <RefreshCcw
                    size={11}
                  />
                  Kembalikan ke hasil
                  ranking otomatis (
                  {
                    detailTarget.statusOtomatis
                  }
                  )
                </button>
              )}
            </div>

            {/* FOOTER */}
            <div
              className={`mt-5 flex items-center justify-end gap-2 border-t ${themeDivider} pt-5`}
            >
              <button
                onClick={() =>
                  setDetailTarget(null)
                }
                className={`rounded-md px-4 py-2 text-xs font-medium theme-text-secondary ${themeNeutralHover} transition-colors`}
              >
                Tutup
              </button>

              <button
                onClick={() =>
                  setDetailTarget(null)
                }
                className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium ${themePrimaryGradient} text-[var(--color-card)] shadow-sm transition-opacity hover:opacity-90`}
              >
                <Save size={13} />
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  valueClass = "theme-text",
  centered = false,
  soft = false,
}) {
  return (
    <div
      className={`${
        soft
          ? "theme-card-soft"
          : "theme-card"
      } rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow} ${
        centered
          ? "flex flex-col items-center justify-center text-center"
          : ""
      }`}
    >
      <p className="text-xs theme-text-muted">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClass} ${
          centered ? "mt-3 text-3xl" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        size={14}
        className="mt-0.5 flex-shrink-0 theme-text-muted"
      />

      <div>
        <p className="text-[11px] theme-text-muted">
          {label}
        </p>

        <p className="mt-0.5 text-sm theme-text">
          {value}
        </p>
      </div>
    </div>
  );
}