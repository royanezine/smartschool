"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  GraduationCap,
  ChevronDown,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  Save,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

import {
  getTugasGuru,
  getPengumpulanByTugas,
  beriNilaiTugas,
} from "../../../../../services/tugas.service";

const KKM = 75;

// ============================================================
// THEME
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
// PREDIKAT
// ============================================================

const colorClasses = {
  emerald: {
    badge: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    bar: "bg-[var(--color-success)]",
    text: "text-[var(--color-success)]",
  },

  blue: {
    badge: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
    bar: "bg-[var(--color-info)]",
    text: "text-[var(--color-info)]",
  },

  amber: {
    badge: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    bar: "bg-[var(--color-warning)]",
    text: "text-[var(--color-warning)]",
  },

  rose: {
    badge: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
    bar: "bg-[var(--color-text-muted)]",
    text: "theme-danger",
  },

  slate: {
    badge: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
    bar: "bg-[var(--color-text-muted)]",
    text: "theme-text-secondary",
  },
};

// ============================================================
// HELPERS
// ============================================================

function getPredikat(nilai) {
  if (
    nilai === null ||
    nilai === undefined ||
    nilai === ""
  ) {
    return null;
  }

  const n = Number(nilai);

  if (n >= 90) {
    return {
      label: "A",
      color: "emerald",
    };
  }

  if (n >= KKM) {
    return {
      label: "B",
      color: "blue",
    };
  }

  if (n >= 60) {
    return {
      label: "C",
      color: "amber",
    };
  }

  return {
    label: "D",
    color: "rose",
  };
}

function getTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getJam(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
// PAGE
// ============================================================

export default function GuruNilaiTugasPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [loadingPengumpulan, setLoadingPengumpulan] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [tugasList, setTugasList] =
    useState([]);

  const [selectedKelasMapelId, setSelectedKelasMapelId] =
    useState("");

  const [selectedTugasId, setSelectedTugasId] =
    useState("");

  const [pengumpulanList, setPengumpulanList] =
    useState([]);

  const [nilaiForm, setNilaiForm] =
    useState({});

  const [catatanForm, setCatatanForm] =
    useState({});

  const [sidebarNotifications] = useState([
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
  ]);

  // ============================================================
  // AMBIL SEMUA TUGAS GURU
  // ============================================================

  const loadTugas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTugasGuru();

      setTugasList(
        Array.isArray(data) ? data : []
      );

      if (Array.isArray(data) && data.length > 0) {
        setSelectedKelasMapelId(
          data[0].kelasMapelId
        );

        setSelectedTugasId(
          data[0].id
        );
      } else {
        setSelectedKelasMapelId("");
        setSelectedTugasId("");
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Gagal mengambil data tugas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTugas();
  }, []);

  // ============================================================
  // FILTER KELAS MAPEL
  // ============================================================

  const kelasMapelOptions = useMemo(() => {
    const map = new Map();

    tugasList.forEach((tugas) => {
      if (!tugas.kelasMapelId) return;

      if (!map.has(tugas.kelasMapelId)) {
        map.set(tugas.kelasMapelId, {
          id: tugas.kelasMapelId,
          kelasNama:
            tugas.kelasNama || "-",
          mapelNama:
            tugas.mapelNama || "-",
          guruNama:
            tugas.guruNama || "-",
        });
      }
    });

    return Array.from(map.values());
  }, [tugasList]);

  // ============================================================
  // TUGAS KELAS TERPILIH
  // ============================================================

  const tugasKelasIni = useMemo(() => {
    return tugasList
      .filter(
        (tugas) =>
          tugas.kelasMapelId ===
          selectedKelasMapelId
      )
      .sort((a, b) => {
        const dateA =
          new Date(
            a.dibuatPada ||
              a.batasWaktu ||
              0
          ).getTime();

        const dateB =
          new Date(
            b.dibuatPada ||
              b.batasWaktu ||
              0
          ).getTime();

        return dateB - dateA;
      });
  }, [
    tugasList,
    selectedKelasMapelId,
  ]);

  // ============================================================
  // TUGAS TERPILIH
  // ============================================================

  const selectedTugas = useMemo(() => {
    return (
      tugasList.find(
        (tugas) =>
          tugas.id === selectedTugasId
      ) || null
    );
  }, [
    tugasList,
    selectedTugasId,
  ]);

  // ============================================================
  // AMBIL PENGUMPULAN
  // ============================================================

  const loadPengumpulan = async (
    tugasId
  ) => {
    if (!tugasId) {
      setPengumpulanList([]);
      setNilaiForm({});
      setCatatanForm({});
      return;
    }

    try {
      setLoadingPengumpulan(true);
      setError("");
      setSuccess("");

      const response =
        await getPengumpulanByTugas(
          tugasId
        );

      const data =
        response?.data?.data ??
        response?.data ??
        response ??
        [];

      const list =
        Array.isArray(data)
          ? data
          : [];

      setPengumpulanList(list);

      const nilai = {};
      const catatan = {};

      list.forEach((item) => {
        nilai[item.id] =
          item.nilai ?? "";

        catatan[item.id] =
          item.keterangan ?? "";
      });

      setNilaiForm(nilai);
      setCatatanForm(catatan);
    } catch (err) {
      console.error(err);

      setPengumpulanList([]);
      setNilaiForm({});
      setCatatanForm({});

      setError(
        err?.message ||
          "Gagal mengambil pengumpulan siswa."
      );
    } finally {
      setLoadingPengumpulan(false);
    }
  };

  useEffect(() => {
    if (selectedTugasId) {
      loadPengumpulan(
        selectedTugasId
      );
    }
  }, [selectedTugasId]);

  // ============================================================
  // KELAS MAPEL CHANGE
  // ============================================================

  const handleKelasMapelChange = (
    value
  ) => {
    setSelectedKelasMapelId(value);

    const tugasPertama =
      tugasList.find(
        (tugas) =>
          tugas.kelasMapelId === value
      );

    setSelectedTugasId(
      tugasPertama?.id || ""
    );

    setSuccess("");
    setError("");
  };

  // ============================================================
  // TUGAS CHANGE
  // ============================================================

  const handleTugasChange = (
    value
  ) => {
    setSelectedTugasId(value);
    setSuccess("");
    setError("");
  };

  // ============================================================
  // INPUT NILAI
  // ============================================================

  const setNilaiSiswa = (
    pengumpulanId,
    value
  ) => {
    if (value !== "") {
      const number = Number(value);

      if (
        Number.isNaN(number) ||
        number < 0 ||
        number > 100
      ) {
        return;
      }
    }

    setNilaiForm((prev) => ({
      ...prev,
      [pengumpulanId]: value,
    }));
  };

  // ============================================================
  // INPUT CATATAN
  // ============================================================

  const setCatatanSiswa = (
    pengumpulanId,
    value
  ) => {
    setCatatanForm((prev) => ({
      ...prev,
      [pengumpulanId]: value,
    }));
  };

  // ============================================================
  // REKAP
  // ============================================================

  const nilaiTerisi = useMemo(() => {
    return Object.values(
      nilaiForm
    ).filter(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined
    );
  }, [nilaiForm]);

  const rekap = useMemo(() => {
    const angka =
      nilaiTerisi
        .map(Number)
        .filter(
          (value) =>
            !Number.isNaN(value)
        );

    if (angka.length === 0) {
      return {
        rataRata: 0,
        tertinggi: 0,
        terendah: 0,
        belumTuntas: 0,
        sudahDinilai: 0,
      };
    }

    const rataRata =
      Math.round(
        (angka.reduce(
          (a, b) => a + b,
          0
        ) /
          angka.length) *
          10
      ) / 10;

    return {
      rataRata,
      tertinggi:
        Math.max(...angka),
      terendah:
        Math.min(...angka),
      belumTuntas:
        angka.filter(
          (n) => n < KKM
        ).length,
      sudahDinilai:
        angka.length,
    };
  }, [nilaiTerisi]);

  // ============================================================
  // SIMPAN SEMUA NILAI
  // ============================================================

  const simpanSemuaNilai =
    async () => {
      const dataYangDinilai =
        pengumpulanList.filter(
          (item) => {
            const value =
              nilaiForm[item.id];

            return (
              value !== "" &&
              value !== null &&
              value !== undefined
            );
          }
        );

      if (
        dataYangDinilai.length === 0
      ) {
        setError(
          "Belum ada nilai yang diisi."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await Promise.all(
          dataYangDinilai.map(
            (item) =>
              beriNilaiTugas(
                item.id,
                {
                  nilai: Number(
                    nilaiForm[item.id]
                  ),
                  keterangan:
                    catatanForm[
                      item.id
                    ] || null,
                }
              )
          )
        );

        setSuccess(
          "Semua nilai berhasil disimpan."
        );

        await loadPengumpulan(
          selectedTugasId
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
            "Gagal menyimpan nilai."
        );
      } finally {
        setSaving(false);
      }
    };

  // ============================================================
  // REFRESH
  // ============================================================

  const refreshData = async () => {
    setSuccess("");
    setError("");

    await loadTugas();

    if (selectedTugasId) {
      await loadPengumpulan(
        selectedTugasId
      );
    }
  };

  const kelasTerpilih =
    kelasMapelOptions.find(
      (item) =>
        item.id ===
        selectedKelasMapelId
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="nilaiTugas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          notifications={
            sidebarNotifications
          }
          user={{
            name: "Guru",
            email:
              "guru@smartschool.com",
            avatar: "GU",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`rounded-lg p-2 ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <GraduationCap
                      size={18}
                    />
                  </div>

                  <h1 className="theme-text text-xl font-semibold sm:text-2xl">
                    Nilai Tugas
                  </h1>
                </div>

                <p className="theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5 text-sm">
                  <Sparkles
                    size={14}
                    className="theme-text-muted"
                  />

                  <span>
                    Input dan rekap nilai
                    tugas siswa dari
                    tugas yang telah
                    diberikan.
                  </span>
                </p>
              </div>

              <button
                onClick={refreshData}
                disabled={loading}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${themeCardShadow} ${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)]`}
              >
                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 ${themeDangerSurface} ${themeDangerBorder}`}
              >
                <XCircle
                  size={18}
                  className="theme-danger mt-0.5 flex-shrink-0"
                />

                <div>
                  <p className="theme-text text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div
                className={`flex items-center gap-3 rounded-xl border p-4 ${themeSuccessSurface} ${themeSuccessBorder}`}
              >
                <CheckCircle2
                  size={18}
                  className="text-[var(--color-success)]"
                />

                <p className="text-[var(--color-success)] text-sm font-medium">
                  {success}
                </p>
              </div>
            )}

            {/* ==================================================
                SELECTOR
            ================================================== */}

            <div
              className={`theme-card rounded-xl border p-4 ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {/* KELAS MAPEL */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Kelas & Mata Pelajaran
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedKelasMapelId
                      }
                      onChange={(e) =>
                        handleKelasMapelChange(
                          e.target.value
                        )
                      }
                      disabled={
                        loading ||
                        kelasMapelOptions.length ===
                          0
                      }
                      className={`theme-input theme-text w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm font-medium outline-none transition ${themeFocus} ${themeNeutralBorder} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {kelasMapelOptions.length ===
                      0 ? (
                        <option value="">
                          Belum ada kelas-mapel
                        </option>
                      ) : (
                        kelasMapelOptions.map(
                          (item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              Kelas{" "}
                              {
                                item.kelasNama
                              }{" "}
                              ·{" "}
                              {
                                item.mapelNama
                              }
                            </option>
                          )
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={14}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* TUGAS */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Tugas / Penilaian
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedTugasId
                      }
                      onChange={(e) =>
                        handleTugasChange(
                          e.target.value
                        )
                      }
                      disabled={
                        tugasKelasIni.length ===
                        0
                      }
                      className={`theme-input theme-text w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm font-medium outline-none transition ${themeFocus} ${themeNeutralBorder} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {tugasKelasIni.length ===
                      0 ? (
                        <option value="">
                          Belum ada tugas
                        </option>
                      ) : (
                        tugasKelasIni.map(
                          (tugas) => (
                            <option
                              key={tugas.id}
                              value={tugas.id}
                            >
                              {tugas.judul}
                            </option>
                          )
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={14}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                DETAIL TUGAS
            ================================================== */}

            {selectedTugas && (
              <div
                className={`theme-card rounded-xl border p-4 sm:p-5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText
                        size={17}
                        className={themePrimaryText}
                      />

                      <h2 className="theme-text truncate text-sm font-semibold">
                        {selectedTugas.judul}
                      </h2>
                    </div>

                    <div className="theme-text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span>
                        Kelas{" "}
                        {selectedTugas.kelasNama}
                      </span>

                      <span>
                        Mapel{" "}
                        {selectedTugas.mapelNama}
                      </span>

                      <span>
                        Dibuat{" "}
                        {getTanggal(
                          selectedTugas.dibuatPada
                        )}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock
                          size={12}
                        />

                        Batas{" "}
                        {getTanggal(
                          selectedTugas.batasWaktu
                        )}

                        {getJam(
                          selectedTugas.batasWaktu
                        ) &&
                          ` · ${getJam(
                            selectedTugas.batasWaktu
                          )}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1.5 text-xs font-medium ${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`}
                    >
                      {pengumpulanList.length}{" "}
                      pengumpulan
                    </span>

                    {kelasTerpilih && (
                      <span
                        className={`theme-text-secondary rounded-full border px-2.5 py-1.5 text-xs font-medium ${themeNeutralSurface} ${themeNeutralBorder}`}
                      >
                        Kelas{" "}
                        {kelasTerpilih.kelasNama}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">

              {/* Pengumpulan */}

              <div
                className={`theme-card flex items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`theme-text-secondary rounded-lg border p-2 ${themeNeutralSurface} ${themeNeutralBorder}`}
                >
                  <Users size={16} />
                </div>

                <div>
                  <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Pengumpulan
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {pengumpulanList.length}
                  </p>
                </div>
              </div>

              {/* Rata-rata */}

              <div
                className={`theme-card flex items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`rounded-lg border p-2 ${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`}
                >
                  <BarChart3
                    size={16}
                  />
                </div>

                <div>
                  <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Rata-rata
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {rekap.rataRata ||
                      "-"}
                  </p>
                </div>
              </div>

              {/* Tertinggi */}

              <div
                className={`theme-card flex items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`rounded-lg border p-2 ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`}
                >
                  <TrendingUp
                    size={16}
                  />
                </div>

                <div>
                  <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Tertinggi
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {rekap.tertinggi ||
                      "-"}
                  </p>
                </div>
              </div>

              {/* Terendah */}

              <div
                className={`theme-card flex items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`theme-danger rounded-lg border p-2 ${themeDangerSurface} ${themeDangerBorder}`}
                >
                  <TrendingDown
                    size={16}
                  />
                </div>

                <div>
                  <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Terendah
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {rekap.terendah ||
                      "-"}
                  </p>
                </div>
              </div>

              {/* Belum Tuntas */}

              <div
                className={`theme-card flex items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`rounded-lg border p-2 ${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`}
                >
                  <AlertTriangle
                    size={16}
                  />
                </div>

                <div>
                  <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Belum Tuntas
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {rekap.belumTuntas}
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

              {/* ==================================================
                  FORM NILAI
              ================================================== */}

              <div
                className={`theme-card lg:col-span-2 overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`border-b p-4 sm:p-5 ${themeDivider}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="theme-text text-sm font-semibold">
                        Daftar Nilai Siswa
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        Nilai 0–100 · KKM{" "}
                        {KKM}
                      </p>
                    </div>

                    {pengumpulanList.length >
                      0 && (
                      <button
                        onClick={
                          simpanSemuaNilai
                        }
                        disabled={saving}
                        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} hover:opacity-90`}
                      >
                        {saving ? (
                          <RefreshCw
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Save
                            size={15}
                          />
                        )}

                        {saving
                          ? "Menyimpan..."
                          : "Simpan Semua Nilai"}
                      </button>
                    )}
                  </div>
                </div>

                {/* LOADING */}

                {loadingPengumpulan ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <RefreshCw
                      size={24}
                      className={`${themePrimaryText} animate-spin`}
                    />

                    <p className="theme-text-secondary mt-3 text-sm">
                      Mengambil data
                      pengumpulan siswa...
                    </p>
                  </div>
                ) : pengumpulanList.length ===
                  0 ? (

                  /* EMPTY */

                  <div className="p-10 text-center">
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${themeNeutralSurface}`}
                    >
                      <Users
                        size={20}
                        className="theme-text-muted"
                      />
                    </div>

                    <h3 className="theme-text-secondary mt-4 text-sm font-semibold">
                      Belum ada pengumpulan
                    </h3>

                    <p className="theme-text-muted mx-auto mt-1 max-w-sm text-xs">
                      Belum ada siswa yang
                      mengumpulkan tugas
                      ini.
                    </p>
                  </div>
                ) : (

                  /* LIST */

                  <div>
                    {pengumpulanList.map(
                      (
                        item,
                        index
                      ) => {
                        const siswa =
                          item.pengguna ||
                          {};

                        const nilai =
                          nilaiForm[
                            item.id
                          ] ?? "";

                        const predikat =
                          getPredikat(
                            nilai
                          );

                        return (
                          <div
                            key={item.id}
                            className={`border-b p-4 transition-colors last:border-b-0 sm:px-5 sm:py-4 ${themeDivider} ${themeNeutralHover}`}
                          >
                            <div className="flex flex-col gap-3">

                              {/* IDENTITAS + NILAI */}

                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <span className="theme-text-muted w-6 text-xs font-medium">
                                    {index +
                                      1}
                                    .
                                  </span>

                                  <div className="min-w-0">
                                    <p className="theme-text truncate text-sm font-medium">
                                      {siswa.namaLengkap ||
                                        "Nama siswa"}
                                    </p>

                                    <p className="theme-text-muted text-[11px]">
                                      NISN{" "}
                                      {siswa.nisn ||
                                        "-"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={
                                      nilai
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      setNilaiSiswa(
                                        item.id,
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    placeholder="0-100"
                                    className={`theme-input theme-text w-20 rounded-lg border px-3 py-1.5 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus} ${themeNeutralBorder}`}
                                  />

                                  <span
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold ${
                                      predikat
                                        ? colorClasses[
                                            predikat
                                              .color
                                          ].badge
                                        : colorClasses
                                            .slate
                                            .badge
                                    }`}
                                  >
                                    {predikat
                                      ? predikat.label
                                      : "-"}
                                  </span>
                                </div>
                              </div>

                              {/* CATATAN */}

                              <input
                                type="text"
                                value={
                                  catatanForm[
                                    item.id
                                  ] || ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  setCatatanSiswa(
                                    item.id,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Catatan / feedback untuk siswa (opsional)"
                                className={`theme-input theme-text w-full rounded-lg border px-3 py-2 text-xs outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus} ${themeNeutralBorder}`}
                              />

                              {/* STATUS */}

                              <div className="flex flex-wrap items-center gap-2">
                                {item.status ===
                                  "dinilai" ? (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`}
                                  >
                                    <CheckCircle2
                                      size={11}
                                    />
                                    Sudah dinilai
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium ${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`}
                                  >
                                    <Clock
                                      size={11}
                                    />
                                    Belum dinilai
                                  </span>
                                )}

                                {item.urlFile && (
                                  <a
                                    href={
                                      item.urlFile
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`rounded-full border px-2 py-1 text-[10px] font-medium transition-colors ${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder} hover:opacity-80`}
                                  >
                                    Lihat pengumpulan
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* FOOTER FORM */}

                {pengumpulanList.length >
                  0 && (
                  <div
                    className={`flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${themeDivider} ${themeNeutralSurface}`}
                  >
                    <div>
                      <p className="theme-text-secondary text-xs">
                        {rekap.sudahDinilai} dari{" "}
                        {
                          pengumpulanList.length
                        }{" "}
                        pengumpulan sudah
                        memiliki nilai.
                      </p>

                      <p className="theme-text-muted mt-1 text-[11px]">
                        Perubahan akan
                        disimpan ke database
                        SmartSchool.
                      </p>
                    </div>

                    <button
                      onClick={
                        simpanSemuaNilai
                      }
                      disabled={saving}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} hover:opacity-90`}
                    >
                      {saving ? (
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={15}
                        />
                      )}

                      {saving
                        ? "Menyimpan..."
                        : "Simpan Nilai"}
                    </button>
                  </div>
                )}
              </div>

              {/* ==================================================
                  SIDEBAR KANAN
              ================================================== */}

              <div className="space-y-6">

                {/* ==================================================
                    STATISTIK
                ================================================== */}

                <div
                  className={`theme-card rounded-xl border p-4 sm:p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Award
                      size={16}
                      className="theme-text-muted"
                    />

                    <h2 className="theme-text text-sm font-semibold">
                      Statistik
                    </h2>
                  </div>

                  {nilaiTerisi.length ===
                  0 ? (
                    <p className="theme-text-muted text-xs">
                      Belum ada nilai yang
                      diinput.
                    </p>
                  ) : (
                    <div className="space-y-4">

                      {/* RATA-RATA */}

                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="theme-text-muted text-xs">
                            Rata-rata
                          </span>

                          <span className="theme-text text-lg font-bold">
                            {
                              rekap.rataRata
                            }
                          </span>
                        </div>

                        <div
                          className={`h-2 w-full overflow-hidden rounded-full ${themeNeutralSurface}`}
                        >
                          <div
                            className={`h-full rounded-full ${colorClasses.blue.bar} transition-all`}
                            style={{
                              width: `${Math.min(
                                rekap.rataRata,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* MAX MIN */}

                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`rounded-lg border p-3 ${themeSuccessSurface} ${themeSuccessBorder}`}
                        >
                          <p className="text-[var(--color-success)] text-[11px]">
                            Tertinggi
                          </p>

                          <p className="text-[var(--color-success)] mt-1 text-lg font-bold">
                            {
                              rekap.tertinggi
                            }
                          </p>
                        </div>

                        <div
                          className={`theme-danger rounded-lg border p-3 ${themeDangerSurface} ${themeDangerBorder}`}
                        >
                          <p className="text-xs theme-danger">
                            Terendah
                          </p>

                          <p className="theme-danger mt-1 text-lg font-bold">
                            {
                              rekap.terendah
                            }
                          </p>
                        </div>
                      </div>

                      {/* KKM */}

                      <div
                        className={`rounded-lg border p-3 ${themeWarningSurface} ${themeWarningBorder}`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            size={14}
                            className="text-[var(--color-warning)]"
                          />

                          <span className="text-[var(--color-warning)] text-xs font-medium">
                            Di bawah KKM
                          </span>
                        </div>

                        <p className="text-[var(--color-warning)] mt-1 text-lg font-bold">
                          {
                            rekap.belumTuntas
                          }{" "}
                          siswa
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==================================================
                    RIWAYAT TUGAS
                ================================================== */}

                <div
                  className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div
                    className={`flex items-center gap-2 border-b p-4 sm:p-5 ${themeDivider}`}
                  >
                    <History
                      size={16}
                      className="theme-text-muted"
                    />

                    <h2 className="theme-text text-sm font-semibold">
                      Riwayat Tugas
                    </h2>
                  </div>

                  {tugasKelasIni.length ===
                  0 ? (
                    <div className="p-6 text-center">
                      <p className="theme-text-muted text-xs">
                        Belum ada tugas pada
                        kelas ini.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto">
                      {tugasKelasIni.map(
                        (tugas) => {
                          const aktif =
                            tugas.id ===
                            selectedTugasId;

                          return (
                            <button
                              key={
                                tugas.id
                              }
                              onClick={() =>
                                setSelectedTugasId(
                                  tugas.id
                                )
                              }
                              className={`w-full border-b p-4 text-left transition-colors last:border-b-0 ${themeDivider} ${
                                aktif
                                  ? `${themePrimarySoft} border-l-2 border-l-[var(--color-primary)]`
                                  : `${themeNeutralHover}`
                              }`}
                            >
                              <div className="flex items-start gap-3">

                                {/* ICON */}

                                <div
                                  className={`flex-shrink-0 rounded-lg p-2 ${
                                    aktif
                                      ? `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`
                                      : `${themeNeutralSurface} theme-text-secondary`
                                  }`}
                                >
                                  <FileText
                                    size={
                                      15
                                    }
                                  />
                                </div>

                                {/* CONTENT */}

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`truncate text-xs font-medium ${
                                      aktif
                                        ? themePrimaryText
                                        : "theme-text"
                                    }`}
                                  >
                                    {
                                      tugas.judul
                                    }
                                  </p>

                                  <p className="theme-text-muted mt-1 text-[11px]">
                                    {getTanggal(
                                      tugas.batasWaktu
                                    )}
                                  </p>

                                  <div className="mt-2 flex items-center gap-2">
                                    <span
                                      className={`rounded-full border px-1.5 py-0.5 text-[10px] theme-text-secondary ${themeNeutralSurface} ${themeNeutralBorder}`}
                                    >
                                      {
                                        tugas.jumlahPengumpulan ??
                                        0
                                      }{" "}
                                      dikumpulkan
                                    </span>

                                    {aktif && (
                                      <span
                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${themePrimarySoft} ${themePrimaryText}`}
                                      >
                                        Dibuka
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}