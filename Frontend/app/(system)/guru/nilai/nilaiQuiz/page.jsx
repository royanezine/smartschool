"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  Pencil,
  Save,
  PlusCircle,
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
// ============================================================

const MATA_PELAJARAN = "Matematika";

const KELAS_OPTIONS = ["9A", "9B", "8A", "8B"];

const KKM = 75;

const siswaPerKelas = {
  "9A": [
    { id: "9a-01", nis: "2409001", nama: "Ahmad Fauzi" },
    { id: "9a-02", nis: "2409002", nama: "Bunga Citra Lestari" },
    { id: "9a-03", nis: "2409003", nama: "Dewi Anggraini" },
    { id: "9a-04", nis: "2409004", nama: "Farhan Maulana" },
    { id: "9a-05", nis: "2409005", nama: "Gita Permatasari" },
    { id: "9a-06", nis: "2409006", nama: "Hendra Saputra" },
    { id: "9a-07", nis: "2409007", nama: "Indah Wulandari" },
    { id: "9a-08", nis: "2409008", nama: "Joko Prasetyo" },
    { id: "9a-09", nis: "2409009", nama: "Kirana Salsabila" },
    { id: "9a-10", nis: "2409010", nama: "Lukman Hakim" },
  ],

  "9B": [
    { id: "9b-01", nis: "2409011", nama: "Muhammad Rizki" },
    { id: "9b-02", nis: "2409012", nama: "Nadia Ramadhani" },
    { id: "9b-03", nis: "2409013", nama: "Oscar Pratama" },
    { id: "9b-04", nis: "2409014", nama: "Putri Ayu Ningsih" },
    { id: "9b-05", nis: "2409015", nama: "Qori Ramadhan" },
    { id: "9b-06", nis: "2409016", nama: "Rina Amelia" },
    { id: "9b-07", nis: "2409017", nama: "Satria Nugraha" },
    { id: "9b-08", nis: "2409018", nama: "Tania Putri" },
  ],

  "8A": [
    { id: "8a-01", nis: "2408001", nama: "Umar Abdullah" },
    { id: "8a-02", nis: "2408002", nama: "Vina Anggreini" },
    { id: "8a-03", nis: "2408003", nama: "Wahyu Setiawan" },
    { id: "8a-04", nis: "2408004", nama: "Xena Meilani" },
    { id: "8a-05", nis: "2408005", nama: "Yusuf Ibrahim" },
    { id: "8a-06", nis: "2408006", nama: "Zahra Amalia" },
    { id: "8a-07", nis: "2408007", nama: "Agus Setiadi" },
    { id: "8a-08", nis: "2408008", nama: "Bella Safitri" },
  ],

  "8B": [
    { id: "8b-01", nis: "2408011", nama: "Chandra Wijaya" },
    { id: "8b-02", nis: "2408012", nama: "Dinda Puspita" },
    { id: "8b-03", nis: "2408013", nama: "Eko Firmansyah" },
    { id: "8b-04", nis: "2408014", nama: "Fitri Handayani" },
    { id: "8b-05", nis: "2408015", nama: "Galih Pratama" },
    { id: "8b-06", nis: "2408016", nama: "Hana Nuraini" },
  ],
};

// ============================================================
// HELPERS
// ============================================================

function getPredikat(nilai) {
  if (nilai === null || nilai === undefined || nilai === "") {
    return null;
  }

  const n = Number(nilai);

  if (n >= 90) {
    return {
      label: "A",
      type: "success",
    };
  }

  if (n >= KKM) {
    return {
      label: "B",
      type: "primary",
    };
  }

  if (n >= 60) {
    return {
      label: "C",
      type: "warning",
    };
  }

  return {
    label: "D",
    type: "danger",
  };
}

const predicateClasses = {
  success: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,

  primary: `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`,

  warning: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,

  danger: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,

  neutral: `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`,
};

function hitungNilai(benar, jumlahSoal) {
  if (
    benar === "" ||
    benar === null ||
    benar === undefined ||
    !jumlahSoal
  ) {
    return "";
  }

  return (
    Math.round(
      (Number(benar) / Number(jumlahSoal)) * 100 * 10
    ) / 10
  );
}

function buatJawabanKosong(daftarSiswa) {
  const obj = {};

  daftarSiswa.forEach((s) => {
    obj[s.id] = {
      benar: "",
    };
  });

  return obj;
}

// ============================================================
// RIWAYAT QUIZ DUMMY
// ============================================================

const initialQuiz = [
  {
    id: "q1",
    kelas: "9A",
    judul: "Quiz Bab 3 - Persamaan Linear",
    tanggal: "11 Agustus 2026",
    jumlahSoal: 10,
    jawaban: {
      "9a-01": { benar: 9 },
      "9a-02": { benar: 10 },
      "9a-03": { benar: 6 },
      "9a-04": { benar: 8 },
      "9a-05": { benar: 9 },
      "9a-06": { benar: 7 },
      "9a-07": { benar: 8 },
      "9a-08": { benar: 5 },
      "9a-09": { benar: 10 },
      "9a-10": { benar: 7 },
    },
  },

  {
    id: "q2",
    kelas: "9B",
    judul: "Quiz Bab 3 - Persamaan Linear",
    tanggal: "12 Agustus 2026",
    jumlahSoal: 10,
    jawaban: {
      "9b-01": { benar: 8 },
      "9b-02": { benar: 6 },
      "9b-03": { benar: 5 },
      "9b-04": { benar: 9 },
      "9b-05": { benar: 10 },
      "9b-06": { benar: 7 },
      "9b-07": { benar: 6 },
      "9b-08": { benar: 9 },
    },
  },
];

const TANGGAL_HARI_INI = "17 Agustus 2026";

// ============================================================
// PAGE
// ============================================================

export default function GuruNilaiQuizPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [kelas, setKelas] = useState(KELAS_OPTIONS[0]);

  const [daftarQuiz, setDaftarQuiz] =
    useState(initialQuiz);

  const [selectedId, setSelectedId] = useState(null);

  const [judul, setJudul] = useState("");

  const [tanggal, setTanggal] =
    useState(TANGGAL_HARI_INI);

  const [jumlahSoal, setJumlahSoal] =
    useState(10);

  const [jawaban, setJawaban] =
    useState({});

  const [savedFlash, setSavedFlash] =
    useState(false);

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

  const daftarSiswa =
    siswaPerKelas[kelas] || [];

  const quizKelasIni = useMemo(() => {
    return daftarQuiz
      .filter((q) => q.kelas === kelas)
      .sort((a, b) =>
        a.tanggal < b.tanggal ? 1 : -1
      );
  }, [daftarQuiz, kelas]);

  useEffect(() => {
    const daftar = daftarQuiz.filter(
      (q) => q.kelas === kelas
    );

    if (daftar.length > 0) {
      bukaQuiz(daftar[0]);
    } else {
      quizBaru();
    }

    setSavedFlash(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelas]);

  const bukaQuiz = (q) => {
    setSelectedId(q.id);
    setJudul(q.judul);
    setTanggal(q.tanggal);
    setJumlahSoal(q.jumlahSoal);

    const isi = {};

    (siswaPerKelas[q.kelas] || []).forEach((s) => {
      isi[s.id] =
        q.jawaban[s.id] || {
          benar: "",
        };
    });

    setJawaban(isi);
    setSavedFlash(false);
  };

  const quizBaru = () => {
    setSelectedId(null);
    setJudul("");
    setTanggal(TANGGAL_HARI_INI);
    setJumlahSoal(10);

    setJawaban(
      buatJawabanKosong(
        siswaPerKelas[kelas] || []
      )
    );

    setSavedFlash(false);
  };

  const setBenarSiswa = (
    siswaId,
    value
  ) => {
    if (
      value !== "" &&
      (
        Number.isNaN(Number(value)) ||
        Number(value) < 0 ||
        Number(value) > jumlahSoal
      )
    ) {
      return;
    }

    setJawaban((prev) => ({
      ...prev,
      [siswaId]: {
        benar: value,
      },
    }));
  };

  const rekap = useMemo(() => {
    const nilaiSemua = Object.values(jawaban)
      .map((j) =>
        hitungNilai(
          j.benar,
          jumlahSoal
        )
      )
      .filter((n) => n !== "");

    const dikerjakan =
      nilaiSemua.length;

    const rataRata = dikerjakan
      ? Math.round(
          (
            nilaiSemua.reduce(
              (a, b) => a + b,
              0
            ) / dikerjakan
          ) * 10
        ) / 10
      : 0;

    const tertinggi = dikerjakan
      ? Math.max(...nilaiSemua)
      : 0;

    const terendah = dikerjakan
      ? Math.min(...nilaiSemua)
      : 0;

    return {
      dikerjakan,
      rataRata,
      tertinggi,
      terendah,
    };
  }, [jawaban, jumlahSoal]);

  const totalSiswa =
    daftarSiswa.length;

  const statistikKelas = useMemo(() => {
    if (quizKelasIni.length === 0) {
      return {
        rataRata: null,
        perluPerhatian: [],
      };
    }

    let totalRata = 0;
    let jumlahRata = 0;

    const rekapSiswa = {};

    quizKelasIni.forEach((q) => {
      const nilaiValid = Object.entries(
        q.jawaban
      )
        .map(([sid, j]) => [
          sid,
          hitungNilai(
            j.benar,
            q.jumlahSoal
          ),
        ])
        .filter(([, n]) => n !== "");

      if (nilaiValid.length) {
        totalRata +=
          nilaiValid.reduce(
            (a, [, n]) => a + n,
            0
          ) / nilaiValid.length;

        jumlahRata += 1;
      }

      nilaiValid.forEach(
        ([sid, n]) => {
          if (!rekapSiswa[sid]) {
            rekapSiswa[sid] = [];
          }

          rekapSiswa[sid].push(n);
        }
      );
    });

    const rataRata = jumlahRata
      ? Math.round(
          (totalRata / jumlahRata) * 10
        ) / 10
      : null;

    const perluPerhatian =
      Object.entries(rekapSiswa)
        .map(([sid, arr]) => ({
          sid,
          rata:
            arr.reduce(
              (a, b) => a + b,
              0
            ) / arr.length,
        }))
        .filter((x) => x.rata < KKM)
        .sort(
          (a, b) => a.rata - b.rata
        )
        .slice(0, 3)
        .map((x) => {
          const siswa =
            daftarSiswa.find(
              (s) => s.id === x.sid
            );

          return {
            nama: siswa
              ? siswa.nama
              : x.sid,
            rata:
              Math.round(
                x.rata * 10
              ) / 10,
          };
        });

    return {
      rataRata,
      perluPerhatian,
    };
  }, [
    quizKelasIni,
    daftarSiswa,
  ]);

  const simpanQuiz = () => {
    setDaftarQuiz((prev) => {
      const idx = selectedId
        ? prev.findIndex(
            (q) => q.id === selectedId
          )
        : -1;

      const entry = {
        id:
          selectedId ||
          `q-${Date.now()}`,
        kelas,
        judul:
          judul.trim() ||
          "Quiz Tanpa Judul",
        tanggal,
        jumlahSoal:
          Number(jumlahSoal) || 10,
        jawaban,
      };

      if (idx >= 0) {
        const copy = [...prev];

        copy[idx] = entry;

        return copy;
      }

      setSelectedId(entry.id);

      return [entry, ...prev];
    });

    setSavedFlash(true);

    setTimeout(
      () => setSavedFlash(false),
      2500
    );
  };

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      {/* =====================================================
          SIDEBAR GURU
      ===================================================== */}

      <Sidebar
        active="nilaiQuiz"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ===================================================
            HEADER GURU
        =================================================== */}

        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="theme-page flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <HelpCircle size={18} />
                  </div>

                  <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                    Nilai Quiz
                  </h1>
                </div>

                <p className="theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5 text-sm">
                  <Sparkles
                    size={14}
                    className="theme-text-muted flex-shrink-0"
                  />

                  <span className="truncate">
                    Rekap hasil quiz mata
                    pelajaran{" "}
                    {MATA_PELAJARAN} berdasarkan
                    jumlah jawaban benar.
                  </span>
                </p>
              </div>
            </div>

            {/* =================================================
                SELECTOR
            ================================================= */}

            <div
              className={`theme-card rounded-xl border p-4 ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">

                {/* KELAS */}

                <div className="relative w-full sm:w-40">
                  <select
                    value={kelas}
                    onChange={(e) =>
                      setKelas(e.target.value)
                    }
                    className={`theme-input ${themeFocus} theme-text w-full cursor-pointer appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm font-medium transition-colors`}
                  >
                    {KELAS_OPTIONS.map(
                      (k) => (
                        <option
                          key={k}
                          value={k}
                        >
                          Kelas {k}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={14}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                {/* JUDUL */}

                <input
                  type="text"
                  value={judul}
                  onChange={(e) =>
                    setJudul(
                      e.target.value
                    )
                  }
                  placeholder="Judul quiz (mis. Quiz Bab 3)"
                  className={`theme-input ${themeFocus} theme-text placeholder:text-[var(--color-text-placeholder)] min-w-[200px] flex-1 rounded-lg border px-3 py-2.5 text-sm transition-colors`}
                />

                {/* TANGGAL */}

                <input
                  type="text"
                  value={tanggal}
                  onChange={(e) =>
                    setTanggal(
                      e.target.value
                    )
                  }
                  placeholder="Tanggal"
                  className={`theme-input ${themeFocus} theme-text placeholder:text-[var(--color-text-placeholder)] w-full rounded-lg border px-3 py-2.5 text-sm transition-colors sm:w-40`}
                />

                {/* JUMLAH SOAL */}

                <div className="flex items-center gap-1.5">
                  <span className="theme-text-muted whitespace-nowrap text-xs">
                    Jumlah soal
                  </span>

                  <input
                    type="number"
                    min={1}
                    value={jumlahSoal}
                    onChange={(e) =>
                      setJumlahSoal(
                        e.target.value
                      )
                    }
                    className={`theme-input ${themeFocus} theme-text w-16 rounded-lg border px-3 py-2.5 text-sm transition-colors`}
                  />
                </div>

                {/* QUIZ BARU */}

                <button
                  onClick={quizBaru}
                  className={`flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText} hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                >
                  <PlusCircle size={14} />

                  Quiz Baru
                </button>

                {/* STATUS */}

                <span
                  className={`flex flex-shrink-0 items-center rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${
                    selectedId
                      ? `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`
                      : `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`
                  }`}
                >
                  {selectedId
                    ? "Sudah tersimpan · bisa diedit"
                    : "Belum disimpan"}
                </span>
              </div>
            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">

              {/* TOTAL SISWA */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`}
                >
                  <Users size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Total Siswa
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {totalSiswa}
                  </p>
                </div>
              </div>

              {/* SUDAH KERJAKAN */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
                >
                  <HelpCircle size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Sudah Kerjakan
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {rekap.dikerjakan}
                  </p>
                </div>
              </div>

              {/* TERTINGGI */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`}
                >
                  <TrendingUp size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Tertinggi
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {rekap.tertinggi || "-"}
                  </p>
                </div>
              </div>

              {/* TERENDAH */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themeDangerSurface} theme-danger ${themeDangerBorder}`}
                >
                  <TrendingDown size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Terendah
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {rekap.terendah || "-"}
                  </p>
                </div>
              </div>

              {/* RATA-RATA */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-shrink-0 items-center justify-center rounded-lg border p-2 ${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`}
                >
                  <BarChart3 size={16} />
                </div>

                <div className="min-w-0">
                  <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                    Rata-rata
                  </p>

                  <p className="theme-text text-lg font-bold">
                    {rekap.rataRata || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

              {/* =================================================
                  FORM NILAI QUIZ
              ================================================= */}

              <div
                className={`theme-card overflow-hidden rounded-xl border lg:col-span-2 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                {/* HEADER */}

                <div
                  className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${themeDivider}`}
                >
                  <div className="min-w-0">
                    <h2 className="theme-text truncate text-sm font-semibold">
                      {judul.trim() ||
                        "Quiz Baru"}{" "}
                      · Kelas {kelas}
                    </h2>

                    <p className="theme-text-muted mt-0.5 text-xs">
                      {rekap.dikerjakan} dari{" "}
                      {totalSiswa} siswa sudah
                      mengerjakan ·{" "}
                      {jumlahSoal} soal
                    </p>
                  </div>
                </div>

                {/* DAFTAR SISWA */}

                <div>
                  {daftarSiswa.map(
                    (siswa, idx) => {
                      const benar =
                        jawaban[siswa.id]
                          ?.benar ?? "";

                      const nilai =
                        hitungNilai(
                          benar,
                          jumlahSoal
                        );

                      const predikat =
                        getPredikat(
                          nilai
                        );

                      return (
                        <div
                          key={siswa.id}
                          className={`flex flex-col gap-3 border-b p-4 transition-colors sm:px-5 sm:py-3.5 ${themeDivider} ${themeNeutralHover}`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                            {/* SISWA */}

                            <div className="flex min-w-0 flex-shrink-0 items-center gap-3 sm:w-56">
                              <span className="theme-text-muted w-6 flex-shrink-0 text-xs font-medium">
                                {idx + 1}.
                              </span>

                              <div className="min-w-0">
                                <p className="theme-text truncate text-sm font-medium">
                                  {siswa.nama}
                                </p>

                                <p className="theme-text-muted text-[11px]">
                                  NIS{" "}
                                  {siswa.nis}
                                </p>
                              </div>
                            </div>

                            {/* JAWABAN BENAR */}

                            <div className="flex flex-shrink-0 items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={
                                  jumlahSoal
                                }
                                value={benar}
                                onChange={(
                                  e
                                ) =>
                                  setBenarSiswa(
                                    siswa.id,
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="Benar"
                                className={`theme-input ${themeFocus} theme-text placeholder:text-[var(--color-text-placeholder)] w-20 rounded-lg border px-3 py-1.5 text-sm transition-colors`}
                              />

                              <span className="theme-text-muted whitespace-nowrap text-xs">
                                /{" "}
                                {jumlahSoal}{" "}
                                soal
                              </span>
                            </div>

                            {/* NILAI + PREDIKAT */}

                            <div className="flex flex-shrink-0 items-center gap-2 sm:ml-auto">
                              <span className="theme-text w-12 text-right text-sm font-semibold">
                                {nilai === ""
                                  ? "-"
                                  : nilai}
                              </span>

                              <span
                                className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${
                                  predikat
                                    ? predicateClasses[
                                        predikat
                                          .type
                                      ]
                                    : predicateClasses.neutral
                                }`}
                              >
                                {predikat
                                  ? predikat.label
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* FOOTER */}

                <div
                  className={`flex flex-col items-center justify-end gap-3 border-t p-4 sm:flex-row sm:p-5 ${themeDivider} ${themeNeutralSurface}`}
                >
                  {savedFlash && (
                    <span className="text-xs font-medium text-[var(--color-success)]">
                      Nilai quiz
                      tersimpan.
                    </span>
                  )}

                  <button
                    onClick={simpanQuiz}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all sm:w-auto ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} hover:opacity-90`}
                  >
                    <Save size={15} />

                    {selectedId
                      ? "Simpan Perubahan"
                      : "Simpan Quiz"}
                  </button>
                </div>
              </div>

              {/* =================================================
                  PANEL KANAN
              ================================================= */}

              <div className="space-y-6 lg:col-span-1">

                {/* =================================================
                    STATISTIK KELAS
                ================================================= */}

                <div
                  className={`theme-card rounded-xl border p-4 sm:p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3
                      size={16}
                      className="theme-text-muted"
                    />

                    <h2 className="theme-text text-sm font-semibold">
                      Statistik Kelas{" "}
                      {kelas}
                    </h2>
                  </div>

                  {statistikKelas.rataRata ===
                  null ? (
                    <p className="theme-text-muted text-xs">
                      Belum ada data cukup
                      untuk statistik.
                    </p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="mb-1.5 flex items-baseline justify-between">
                          <span className="theme-text-muted text-xs">
                            Rata-rata seluruh
                            quiz
                          </span>

                          <span className="theme-text text-lg font-bold">
                            {
                              statistikKelas.rataRata
                            }
                          </span>
                        </div>

                        {/* PROGRESS */}

                        <div
                          className={`h-2 w-full overflow-hidden rounded-full ${themeNeutralSurface}`}
                        >
                          <div
                            className={`h-full rounded-full ${themePrimaryGradient}`}
                            style={{
                              width: `${Math.min(
                                statistikKelas.rataRata,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="theme-text-muted mt-1.5 text-[11px]">
                          dari{" "}
                          {
                            quizKelasIni.length
                          }{" "}
                          quiz tercatat
                        </p>
                      </div>

                      {/* PERLU PERHATIAN */}

                      {statistikKelas
                        .perluPerhatian
                        .length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center gap-1.5">
                            <AlertTriangle
                              size={13}
                              className="text-[var(--color-warning)]"
                            />

                            <span className="theme-text-secondary text-xs font-medium">
                              Perlu perhatian
                              (di bawah
                              KKM)
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {statistikKelas.perluPerhatian.map(
                              (p) => (
                                <div
                                  key={p.nama}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="theme-text-secondary truncate pr-2">
                                    {p.nama}
                                  </span>

                                  <span className="flex-shrink-0 font-medium text-[var(--color-warning)]">
                                    rata-rata{" "}
                                    {p.rata}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* =================================================
                    DAFTAR QUIZ
                ================================================= */}

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
                      Daftar Quiz
                    </h2>
                  </div>

                  {quizKelasIni.length ===
                  0 ? (
                    <div className="p-6 text-center">
                      <p className="theme-text-muted text-xs">
                        Belum ada quiz untuk
                        kelas ini.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {quizKelasIni.map(
                        (q) => {
                          const nilaiValid =
                            Object.values(
                              q.jawaban
                            )
                              .map((j) =>
                                hitungNilai(
                                  j.benar,
                                  q.jumlahSoal
                                )
                              )
                              .filter(
                                (n) =>
                                  n !== ""
                              );

                          const rataItem =
                            nilaiValid.length
                              ? Math.round(
                                  (nilaiValid.reduce(
                                    (a, b) =>
                                      a + b,
                                    0
                                  ) /
                                    nilaiValid.length) *
                                    10
                                ) / 10
                              : 0;

                          return (
                            <div
                              key={q.id}
                              className={`border-b p-4 sm:p-5 ${themeDivider}`}
                            >
                              <div className="mb-1.5 flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="theme-text-secondary truncate text-xs font-medium">
                                    {q.judul}
                                  </p>

                                  <p className="theme-text-muted mt-0.5 text-[11px]">
                                    {q.tanggal}{" "}
                                    ·{" "}
                                    {
                                      q.jumlahSoal
                                    }{" "}
                                    soal
                                  </p>
                                </div>

                                {q.id ===
                                  selectedId && (
                                  <span
                                    className={`flex-shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                                  >
                                    Dibuka
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-1.5">

                                {/* RATA-RATA */}

                                <span
                                  className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${themeInfoSurface} ${themeInfoBorder} text-[var(--color-info)]`}
                                >
                                  Rata-rata{" "}
                                  {rataItem}
                                </span>

                                {/* EDIT */}

                                <button
                                  onClick={() =>
                                    bukaQuiz(
                                      q
                                    )
                                  }
                                  className={`ml-auto flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText} hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                                >
                                  <Pencil
                                    size={
                                      11
                                    }
                                  />

                                  Edit
                                </button>
                              </div>
                            </div>
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