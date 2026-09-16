"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
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

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
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

function getPredikat(nilai) {
  if (nilai === null || nilai === undefined || nilai === "") return null;
  const n = Number(nilai);
  if (n >= 90) return { label: "A", color: "emerald" };
  if (n >= KKM) return { label: "B", color: "blue" };
  if (n >= 60) return { label: "C", color: "amber" };
  return { label: "D", color: "rose" };
}

const colorClasses = {
  emerald: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  blue: { badge: "bg-blue-50 text-blue-600 border-blue-200" },
  amber: { badge: "bg-amber-50 text-amber-600 border-amber-200" },
  rose: { badge: "bg-rose-50 text-rose-600 border-rose-200" },
  slate: { badge: "bg-slate-100 text-slate-500 border-slate-200" },
};

function hitungNilai(benar, jumlahSoal) {
  if (benar === "" || benar === null || benar === undefined || !jumlahSoal) return "";
  return Math.round((Number(benar) / Number(jumlahSoal)) * 100 * 10) / 10;
}

function buatJawabanKosong(daftarSiswa) {
  const obj = {};
  daftarSiswa.forEach((s) => {
    obj[s.id] = { benar: "" };
  });
  return obj;
}

// Riwayat quiz yang sudah pernah dibuat guru sebelumnya (dummy)
const initialQuiz = [
  {
    id: "q1",
    kelas: "9A",
    judul: "Quiz Bab 3 - Persamaan Linear",
    tanggal: "11 Agustus 2026",
    jumlahSoal: 10,
    jawaban: {
      "9a-01": { benar: 9 }, "9a-02": { benar: 10 }, "9a-03": { benar: 6 }, "9a-04": { benar: 8 },
      "9a-05": { benar: 9 }, "9a-06": { benar: 7 }, "9a-07": { benar: 8 }, "9a-08": { benar: 5 },
      "9a-09": { benar: 10 }, "9a-10": { benar: 7 },
    },
  },
  {
    id: "q2",
    kelas: "9B",
    judul: "Quiz Bab 3 - Persamaan Linear",
    tanggal: "12 Agustus 2026",
    jumlahSoal: 10,
    jawaban: {
      "9b-01": { benar: 8 }, "9b-02": { benar: 6 }, "9b-03": { benar: 5 }, "9b-04": { benar: 9 },
      "9b-05": { benar: 10 }, "9b-06": { benar: 7 }, "9b-07": { benar: 6 }, "9b-08": { benar: 9 },
    },
  },
];

const TANGGAL_HARI_INI = "17 Agustus 2026";

export default function GuruNilaiQuizPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kelas, setKelas] = useState(KELAS_OPTIONS[0]);
  const [daftarQuiz, setDaftarQuiz] = useState(initialQuiz);
  const [selectedId, setSelectedId] = useState(null); // null = quiz baru
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState(TANGGAL_HARI_INI);
  const [jumlahSoal, setJumlahSoal] = useState(10);
  const [jawaban, setJawaban] = useState({});
  const [savedFlash, setSavedFlash] = useState(false);

  const notifications = [
    { id: 1, title: "Rapat Wali Kelas", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Batas Input Nilai Rapor", desc: "Dikirim 5 jam lalu", read: false },
  ];

  const daftarSiswa = siswaPerKelas[kelas] || [];

  const quizKelasIni = useMemo(() => {
    return daftarQuiz
      .filter((q) => q.kelas === kelas)
      .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
  }, [daftarQuiz, kelas]);

  useEffect(() => {
    const daftar = daftarQuiz.filter((q) => q.kelas === kelas);
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
      isi[s.id] = q.jawaban[s.id] || { benar: "" };
    });
    setJawaban(isi);
    setSavedFlash(false);
  };

  const quizBaru = () => {
    setSelectedId(null);
    setJudul("");
    setTanggal(TANGGAL_HARI_INI);
    setJumlahSoal(10);
    setJawaban(buatJawabanKosong(siswaPerKelas[kelas] || []));
    setSavedFlash(false);
  };

  const setBenarSiswa = (siswaId, value) => {
    if (value !== "" && (Number.isNaN(Number(value)) || Number(value) < 0 || Number(value) > jumlahSoal)) return;
    setJawaban((prev) => ({ ...prev, [siswaId]: { benar: value } }));
  };

  const rekap = useMemo(() => {
    const nilaiSemua = Object.values(jawaban)
      .map((j) => hitungNilai(j.benar, jumlahSoal))
      .filter((n) => n !== "");
    const dikerjakan = nilaiSemua.length;
    const rataRata = dikerjakan ? Math.round((nilaiSemua.reduce((a, b) => a + b, 0) / dikerjakan) * 10) / 10 : 0;
    const tertinggi = dikerjakan ? Math.max(...nilaiSemua) : 0;
    const terendah = dikerjakan ? Math.min(...nilaiSemua) : 0;
    return { dikerjakan, rataRata, tertinggi, terendah };
  }, [jawaban, jumlahSoal]);

  const totalSiswa = daftarSiswa.length;

  const statistikKelas = useMemo(() => {
    if (quizKelasIni.length === 0) return { rataRata: null, perluPerhatian: [] };
    let totalRata = 0;
    let jumlahRata = 0;
    const rekapSiswa = {};
    quizKelasIni.forEach((q) => {
      const nilaiValid = Object.entries(q.jawaban)
        .map(([sid, j]) => [sid, hitungNilai(j.benar, q.jumlahSoal)])
        .filter(([, n]) => n !== "");
      if (nilaiValid.length) {
        totalRata += nilaiValid.reduce((a, [, n]) => a + n, 0) / nilaiValid.length;
        jumlahRata += 1;
      }
      nilaiValid.forEach(([sid, n]) => {
        if (!rekapSiswa[sid]) rekapSiswa[sid] = [];
        rekapSiswa[sid].push(n);
      });
    });
    const rataRata = jumlahRata ? Math.round((totalRata / jumlahRata) * 10) / 10 : null;
    const perluPerhatian = Object.entries(rekapSiswa)
      .map(([sid, arr]) => ({ sid, rata: arr.reduce((a, b) => a + b, 0) / arr.length }))
      .filter((x) => x.rata < KKM)
      .sort((a, b) => a.rata - b.rata)
      .slice(0, 3)
      .map((x) => {
        const siswa = daftarSiswa.find((s) => s.id === x.sid);
        return { nama: siswa ? siswa.nama : x.sid, rata: Math.round(x.rata * 10) / 10 };
      });
    return { rataRata, perluPerhatian };
  }, [quizKelasIni, daftarSiswa]);

  const simpanQuiz = () => {
    setDaftarQuiz((prev) => {
      const idx = selectedId ? prev.findIndex((q) => q.id === selectedId) : -1;
      const entry = {
        id: selectedId || `q-${Date.now()}`,
        kelas,
        judul: judul.trim() || "Quiz Tanpa Judul",
        tanggal,
        jumlahSoal: Number(jumlahSoal) || 10,
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
    setTimeout(() => setSavedFlash(false), 2500);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="nilaiQuiz"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Bu Sari", email: "guru@smartschool.com", avatar: "AS" }}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm flex-shrink-0">
                    <HelpCircle size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Nilai Quiz
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Rekap hasil quiz mata pelajaran {MATA_PELAJARAN} berdasarkan jumlah jawaban benar.</span>
                </p>
              </div>
            </div>

            {/* KELAS, JUDUL, TANGGAL & JUMLAH SOAL SELECTOR */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:w-40">
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {KELAS_OPTIONS.map((k) => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Judul quiz (mis. Quiz Bab 3)"
                  className="flex-1 min-w-[200px] px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                />

                <input
                  type="text"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  placeholder="Tanggal"
                  className="w-full sm:w-40 px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Jumlah soal</span>
                  <input
                    type="number"
                    min={1}
                    value={jumlahSoal}
                    onChange={(e) => setJumlahSoal(e.target.value)}
                    className="w-16 px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  onClick={quizBaru}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <PlusCircle size={14} />
                  Quiz Baru
                </button>

                <span className={`text-[11px] font-medium px-2.5 py-1.5 rounded-full border flex-shrink-0 ${
                  selectedId ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {selectedId ? "Sudah tersimpan · bisa diedit" : "Belum disimpan"}
                </span>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-slate-100 text-slate-500 border-slate-200 flex-shrink-0">
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Siswa</p>
                  <p className="text-lg font-bold text-slate-800">{totalSiswa}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0">
                  <HelpCircle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Sudah Kerjakan</p>
                  <p className="text-lg font-bold text-slate-800">{rekap.dikerjakan}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Tertinggi</p>
                  <p className="text-lg font-bold text-slate-800">{rekap.tertinggi || "-"}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 flex-shrink-0">
                  <TrendingDown size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Terendah</p>
                  <p className="text-lg font-bold text-slate-800">{rekap.terendah || "-"}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
                  <BarChart3 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Rata-rata</p>
                  <p className="text-lg font-bold text-slate-800">{rekap.rataRata || "-"}</p>
                </div>
              </div>
            </div>

            {/* KONTEN UTAMA: form nilai quiz (kiri, lebih lebar) + panel statistik & daftar quiz (kanan) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* FORM NILAI QUIZ */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b border-slate-100">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-800 truncate">
                      {judul.trim() || "Quiz Baru"} · Kelas {kelas}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {rekap.dikerjakan} dari {totalSiswa} siswa sudah mengerjakan · {jumlahSoal} soal
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {daftarSiswa.map((siswa, idx) => {
                    const benar = jawaban[siswa.id]?.benar ?? "";
                    const nilai = hitungNilai(benar, jumlahSoal);
                    const predikat = getPredikat(nilai);
                    return (
                      <div
                        key={siswa.id}
                        className="flex flex-col gap-3 p-4 sm:px-5 sm:py-3.5 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 min-w-0 sm:w-56 flex-shrink-0">
                            <span className="w-6 text-xs font-medium text-slate-400 flex-shrink-0">{idx + 1}.</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{siswa.nama}</p>
                              <p className="text-[11px] text-slate-400">NIS {siswa.nis}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <input
                              type="number"
                              min={0}
                              max={jumlahSoal}
                              value={benar}
                              onChange={(e) => setBenarSiswa(siswa.id, e.target.value)}
                              placeholder="Benar"
                              className="w-20 px-3 py-1.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                            />
                            <span className="text-xs text-slate-400 whitespace-nowrap">/ {jumlahSoal} soal</span>
                          </div>

                          <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0">
                            <span className="text-sm font-semibold text-slate-700 w-12 text-right">
                              {nilai === "" ? "-" : nilai}
                            </span>
                            <span className={`inline-flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-lg border flex-shrink-0 ${
                              predikat ? colorClasses[predikat.color].badge : colorClasses.slate.badge
                            }`}>
                              {predikat ? predikat.label : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60">
                  {savedFlash && (
                    <span className="text-xs font-medium text-emerald-600">Nilai quiz tersimpan.</span>
                  )}
                  <button
                    onClick={simpanQuiz}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    <Save size={15} />
                    {selectedId ? "Simpan Perubahan" : "Simpan Quiz"}
                  </button>
                </div>
              </div>

              {/* PANEL KANAN: statistik + daftar quiz */}
              <div className="lg:col-span-1 space-y-6">

                {/* STATISTIK KELAS */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={16} className="text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-800">Statistik Kelas {kelas}</h2>
                  </div>

                  {statistikKelas.rataRata === null ? (
                    <p className="text-xs text-slate-400">Belum ada data cukup untuk statistik.</p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-xs text-slate-400">Rata-rata seluruh quiz</span>
                          <span className="text-lg font-bold text-slate-800">{statistikKelas.rataRata}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.min(statistikKelas.rataRata, 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">
                          dari {quizKelasIni.length} quiz tercatat
                        </p>
                      </div>

                      {statistikKelas.perluPerhatian.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <AlertTriangle size={13} className="text-amber-500" />
                            <span className="text-xs font-medium text-slate-600">Perlu perhatian (di bawah KKM)</span>
                          </div>
                          <div className="space-y-1.5">
                            {statistikKelas.perluPerhatian.map((p) => (
                              <div key={p.nama} className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 truncate pr-2">{p.nama}</span>
                                <span className="text-amber-600 font-medium flex-shrink-0">rata-rata {p.rata}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* DAFTAR QUIZ KELAS INI */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-slate-100">
                    <History size={16} className="text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-800">Daftar Quiz</h2>
                  </div>

                  {quizKelasIni.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-slate-400">Belum ada quiz untuk kelas ini.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {quizKelasIni.map((q) => {
                        const nilaiValid = Object.values(q.jawaban)
                          .map((j) => hitungNilai(j.benar, q.jumlahSoal))
                          .filter((n) => n !== "");
                        const rataItem = nilaiValid.length
                          ? Math.round((nilaiValid.reduce((a, b) => a + b, 0) / nilaiValid.length) * 10) / 10
                          : 0;
                        return (
                          <div key={q.id} className="p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-700 truncate">{q.judul}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{q.tanggal} · {q.jumlahSoal} soal</p>
                              </div>
                              {q.id === selectedId && (
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  Dibuka
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap mt-2">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                                Rata-rata {rataItem}
                              </span>
                              <button
                                onClick={() => bukaQuiz(q)}
                                className="ml-auto flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <Pencil size={11} />
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
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