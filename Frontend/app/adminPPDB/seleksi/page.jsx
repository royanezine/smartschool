"use client";

import { useState, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
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

// ================= DATA AWAL =================

const initialPendaftar = [
  { id: 1, noPendaftaran: "PPDB001", nama: "Andi Saputra", asalSekolah: "SMP Negeri 1", jurusan: "RPL", nilai: 88.5, statusManual: null },
  { id: 2, noPendaftaran: "PPDB002", nama: "Budi Hartono", asalSekolah: "SMP Negeri 2", jurusan: "TKJ", nilai: 86.2, statusManual: null },
  { id: 3, noPendaftaran: "PPDB003", nama: "Citra Ayu Lestari", asalSekolah: "SMP Negeri 3", jurusan: "RPL", nilai: 79.5, statusManual: null },
  { id: 4, noPendaftaran: "PPDB004", nama: "Deni Firmansyah", asalSekolah: "SMP Islam Al-Amin", jurusan: "Akuntansi", nilai: 74.0, statusManual: null },
  { id: 5, noPendaftaran: "PPDB005", nama: "Eka Putri Wulandari", asalSekolah: "SMP Negeri 4", jurusan: "RPL", nilai: 91.2, statusManual: null },
  { id: 6, noPendaftaran: "PPDB006", nama: "Fajar Nugroho", asalSekolah: "SMP Negeri 1", jurusan: "TKJ", nilai: 82.7, statusManual: null },
  { id: 7, noPendaftaran: "PPDB007", nama: "Gita Lestari", asalSekolah: "SMP Kristen Harapan", jurusan: "Multimedia", nilai: 85.0, statusManual: null },
  { id: 8, noPendaftaran: "PPDB008", nama: "Hendra Wijaya", asalSekolah: "SMP Negeri 5", jurusan: "Akuntansi", nilai: 88.9, statusManual: null },
  { id: 9, noPendaftaran: "PPDB009", nama: "Indah Permatasari", asalSekolah: "SMP Negeri 2", jurusan: "RPL", nilai: 84.4, statusManual: null },
  { id: 10, noPendaftaran: "PPDB010", nama: "Joko Prasetyo", asalSekolah: "SMP Negeri 3", jurusan: "TKJ", nilai: 90.1, statusManual: null },
  { id: 11, noPendaftaran: "PPDB011", nama: "Kartika Sari", asalSekolah: "SMP Negeri 4", jurusan: "Multimedia", nilai: 77.3, statusManual: null },
  { id: 12, noPendaftaran: "PPDB012", nama: "Luthfi Rahman", asalSekolah: "SMP Islam Al-Amin", jurusan: "Akuntansi", nilai: 69.8, statusManual: null },
  { id: 13, noPendaftaran: "PPDB013", nama: "Maya Anggraini", asalSekolah: "SMP Negeri 1", jurusan: "RPL", nilai: 76.6, statusManual: null },
  { id: 14, noPendaftaran: "PPDB014", nama: "Naufal Ardiansyah", asalSekolah: "SMP Negeri 5", jurusan: "TKJ", nilai: 73.5, statusManual: null },
  { id: 15, noPendaftaran: "PPDB015", nama: "Olivia Zahra", asalSekolah: "SMP Kristen Harapan", jurusan: "Multimedia", nilai: 92.4, statusManual: null },
  { id: 16, noPendaftaran: "PPDB016", nama: "Putra Wibowo", asalSekolah: "SMP Negeri 2", jurusan: "Akuntansi", nilai: 81.2, statusManual: null },
];

const JURUSAN_LIST = ["RPL", "TKJ", "Multimedia", "Akuntansi"];

const DEFAULT_KUOTA = { RPL: 3, TKJ: 3, Multimedia: 2, Akuntansi: 2 };
const DEFAULT_CADANGAN = { RPL: 1, TKJ: 1, Multimedia: 1, Akuntansi: 1 };

const STATUS_STYLES = {
  Lulus: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Cadangan: "bg-amber-50 text-amber-600 border-amber-100",
  "Tidak Lulus": "bg-rose-50 text-rose-600 border-rose-100",
};

const STATUS_ICON = {
  Lulus: CheckCircle2,
  Cadangan: Clock3,
  "Tidak Lulus": XCircle,
};

const JURUSAN_FILTER_OPTIONS = ["Semua Jurusan", ...JURUSAN_LIST];
const STATUS_FILTER_OPTIONS = ["Semua Status", "Lulus", "Cadangan", "Tidak Lulus"];

// ================= UTIL SELEKSI =================

// Menghitung ranking per jurusan berdasarkan nilai (tertinggi = ranking 1),
// lalu menetapkan status berdasarkan kuota + kuota cadangan jurusan tsb,
// kecuali admin sudah menetapkan status secara manual (override).
function hitungSeleksi(pendaftar, kuota, cadangan) {
  const byJurusan = {};
  pendaftar.forEach((p) => {
    if (!byJurusan[p.jurusan]) byJurusan[p.jurusan] = [];
    byJurusan[p.jurusan].push(p);
  });

  const hasil = [];
  Object.entries(byJurusan).forEach(([jurusan, list]) => {
    const sorted = [...list].sort((a, b) => b.nilai - a.nilai);
    const kuotaJurusan = kuota[jurusan] ?? 0;
    const cadanganJurusan = cadangan[jurusan] ?? 0;

    sorted.forEach((p, idx) => {
      const ranking = idx + 1;
      let statusOtomatis;
      if (ranking <= kuotaJurusan) statusOtomatis = "Lulus";
      else if (ranking <= kuotaJurusan + cadanganJurusan) statusOtomatis = "Cadangan";
      else statusOtomatis = "Tidak Lulus";

      hasil.push({
        ...p,
        ranking,
        statusOtomatis,
        status: p.statusManual ?? statusOtomatis,
      });
    });
  });

  return hasil.sort((a, b) => a.jurusan.localeCompare(b.jurusan) || a.ranking - b.ranking);
}

const ROWS_PER_PAGE = 10;

export default function SeleksiPPDBPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendaftar, setPendaftar] = useState(initialPendaftar);
  const [kuota, setKuota] = useState(DEFAULT_KUOTA);
  const [cadangan, setCadangan] = useState(DEFAULT_CADANGAN);
  const [kuotaDraft, setKuotaDraft] = useState(DEFAULT_KUOTA);
  const [cadanganDraft, setCadanganDraft] = useState(DEFAULT_CADANGAN);
  const [showKuotaPanel, setShowKuotaPanel] = useState(true);

  const [search, setSearch] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("Semua Jurusan");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const hasilSeleksi = useMemo(
    () => hitungSeleksi(pendaftar, kuota, cadangan),
    [pendaftar, kuota, cadangan]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hasilSeleksi.filter((p) => {
      const matchSearch =
        !q || p.nama.toLowerCase().includes(q) || p.noPendaftaran.toLowerCase().includes(q);
      const matchJurusan = filterJurusan === "Semua Jurusan" || p.jurusan === filterJurusan;
      const matchStatus = filterStatus === "Semua Status" || p.status === filterStatus;
      return matchSearch && matchJurusan && matchStatus;
    });
  }, [hasilSeleksi, search, filterJurusan, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const updateFilter = (setter) => (val) => {
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
    (filterJurusan !== "Semua Jurusan" ? 1 : 0) +
    (filterStatus !== "Semua Status" ? 1 : 0) +
    (search ? 1 : 0);

  // Terapkan draft kuota & cadangan ke seleksi yang berjalan
  const terapkanKuota = () => {
    setKuota(kuotaDraft);
    setCadangan(cadanganDraft);
  };

  // Admin menetapkan status manual (override hasil otomatis) untuk satu pendaftar
  const setStatusManual = (id, status) => {
    setPendaftar((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statusManual: status } : p))
    );
    setDetailTarget((prev) => (prev && prev.id === id ? { ...prev, status, statusManual: status } : prev));
  };

  // Kembalikan pendaftar ke hasil ranking otomatis
  const resetStatusManual = (id) => {
    setPendaftar((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statusManual: null } : p))
    );
    setDetailTarget((prev) =>
      prev && prev.id === id ? { ...prev, statusManual: null, status: prev.statusOtomatis } : prev
    );
  };

  const ringkasan = useMemo(() => {
    const total = hasilSeleksi.length;
    const lulus = hasilSeleksi.filter((p) => p.status === "Lulus").length;
    const cadanganCount = hasilSeleksi.filter((p) => p.status === "Cadangan").length;
    const tidakLulus = hasilSeleksi.filter((p) => p.status === "Tidak Lulus").length;
    const totalKuota = Object.values(kuota).reduce((a, b) => a + (Number(b) || 0), 0);
    return { total, lulus, cadanganCount, tidakLulus, totalKuota };
  }, [hasilSeleksi, kuota]);

  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="seleksi"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin PPDB", email: "adminppdb@smartschool.com", avatar: "PP" }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5 max-w-[1320px] mx-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>PPDB</span>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-medium">Seleksi Pendaftar</span>
              </div>

              {/* ===== KARTU RINGKASAN ===== */}
              <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Total Peserta</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{ringkasan.total}</p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Total Kuota</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{ringkasan.totalKuota}</p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Lulus</p>
                  <p className="text-2xl font-bold text-emerald-500 mt-2">{ringkasan.lulus}</p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Cadangan</p>
                  <p className="text-2xl font-bold text-amber-500 mt-2">{ringkasan.cadanganCount}</p>
                </div>
                <div className="bg-[#F6F7F8] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-slate-400">Tidak Lulus</p>
                  <p className="text-3xl font-bold text-rose-400 mt-3">{ringkasan.tidakLulus}</p>
                </div>
              </section>

              {/* ===== PANEL KUOTA JURUSAN ===== */}
              <section className="bg-white rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowKuotaPanel((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 size={15} className="text-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">Pengaturan Kuota Jurusan</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`text-slate-400 transition-transform ${showKuotaPanel ? "rotate-90" : ""}`}
                  />
                </button>

                {showKuotaPanel && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {JURUSAN_LIST.map((j) => (
                        <div key={j} className="border border-slate-100 rounded-lg p-4">
                          <p className="text-xs font-semibold text-slate-600 mb-3">{j}</p>
                          <div className="space-y-2.5">
                            <div>
                              <label className="text-[11px] text-slate-400">Kuota Lulus</label>
                              <input
                                type="number"
                                min={0}
                                value={kuotaDraft[j]}
                                onChange={(e) =>
                                  setKuotaDraft((prev) => ({ ...prev, [j]: Number(e.target.value) }))
                                }
                                className="mt-1 w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-400">Kuota Cadangan</label>
                              <input
                                type="number"
                                min={0}
                                value={cadanganDraft[j]}
                                onChange={(e) =>
                                  setCadanganDraft((prev) => ({ ...prev, [j]: Number(e.target.value) }))
                                }
                                className="mt-1 w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-slate-400">
                        Ranking dihitung otomatis dari nilai tertinggi ke terendah pada masing-masing jurusan.
                        Peringkat di dalam kuota lulus akan berstatus <span className="font-medium text-emerald-600">Lulus</span>,
                        selanjutnya masuk kuota cadangan akan berstatus <span className="font-medium text-amber-600">Cadangan</span>,
                        sisanya <span className="font-medium text-rose-500">Tidak Lulus</span>.
                      </p>
                      <button
                        onClick={terapkanKuota}
                        className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex-shrink-0 ml-4"
                      >
                        <RefreshCcw size={13} />
                        Proses Seleksi
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* ===== PANEL TABEL HASIL SELEKSI ===== */}
              <section className="bg-white rounded-xl overflow-hidden">
                {/* Search & Filter */}
                <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-md px-3 py-2 flex-1 min-w-[200px]">
                    <Search size={13} className="text-slate-400 flex-shrink-0" />
                    <input
                      value={search}
                      onChange={(e) => updateFilter(setSearch)(e.target.value)}
                      placeholder="Cari nama atau no. pendaftaran..."
                      className="outline-none bg-transparent placeholder:text-slate-400 w-full"
                    />
                  </div>

                  <select
                    value={filterJurusan}
                    onChange={(e) => updateFilter(setFilterJurusan)(e.target.value)}
                    className="text-xs text-slate-600 border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  >
                    {JURUSAN_FILTER_OPTIONS.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => updateFilter(setFilterStatus)(e.target.value)}
                    className="text-xs text-slate-600 border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  >
                    {STATUS_FILTER_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X size={12} />
                      Reset ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* Tabel */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                        <th className="px-5 py-3 font-medium">Ranking</th>
                        <th className="px-5 py-3 font-medium">No. Pendaftaran</th>
                        <th className="px-5 py-3 font-medium">Nama</th>
                        <th className="px-5 py-3 font-medium">Jurusan</th>
                        <th className="px-5 py-3 font-medium">Nilai</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                            Tidak ada peserta yang cocok dengan pencarian/filter.
                          </td>
                        </tr>
                      )}
                      {paged.map((p) => {
                        const StatusIcon = STATUS_ICON[p.status];
                        return (
                          <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                                <Trophy size={12} className="text-slate-300" />
                                {p.ranking}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-600">{p.noPendaftaran}</td>
                            <td className="px-5 py-3.5 font-medium text-slate-700">{p.nama}</td>
                            <td className="px-5 py-3.5 text-slate-500">{p.jurusan}</td>
                            <td className="px-5 py-3.5 text-slate-600 font-medium">{p.nilai.toFixed(1)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[p.status]}`}>
                                <StatusIcon size={11} />
                                {p.status}
                                {p.statusManual && <span className="opacity-60">(manual)</span>}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => setDetailTarget(p)}
                                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors"
                                >
                                  <Eye size={13} />
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

                {/* Pagination */}
                {filtered.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      Menampilkan {(currentPage - 1) * ROWS_PER_PAGE + 1}
                      –{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} peserta
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      >
                        Sebelumnya
                      </button>
                      <span className="text-xs text-slate-500 px-2">
                        Hal. {currentPage} / {totalPages}
                      </span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <footer className="text-center text-[11px] text-slate-400 py-3">
                © 2026 SmartSchool &middot; Dashboard Admin PPDB &middot; All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* ===== MODAL KELOLA STATUS PESERTA ===== */}
      {detailTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Kelola Status Seleksi</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{detailTarget.noPendaftaran}</p>
              </div>
              <button
                onClick={() => setDetailTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{detailTarget.nama}</p>
                <span className={`inline-block mt-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[detailTarget.status]}`}>
                  {detailTarget.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="flex items-start gap-2.5">
                <School size={14} className="text-slate-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400">Asal Sekolah</p>
                  <p className="text-sm text-slate-700 mt-0.5">{detailTarget.asalSekolah}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <BookOpen size={14} className="text-slate-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400">Jurusan Pilihan</p>
                  <p className="text-sm text-slate-700 mt-0.5">{detailTarget.jurusan}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Trophy size={14} className="text-slate-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400">Ranking di Jurusan</p>
                  <p className="text-sm text-slate-700 mt-0.5">Peringkat {detailTarget.ranking}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Trophy size={14} className="text-slate-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400">Nilai Seleksi</p>
                  <p className="text-sm text-slate-700 mt-0.5">{detailTarget.nilai.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-600 mb-2.5">Tetapkan Status Kelulusan</p>
              <div className="grid grid-cols-3 gap-2">
                {["Lulus", "Cadangan", "Tidak Lulus"].map((s) => {
                  const StatusIcon = STATUS_ICON[s];
                  const active = detailTarget.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusManual(detailTarget.id, s)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-[11px] font-medium transition-colors ${
                        active
                          ? STATUS_STYLES[s]
                          : "border-slate-200 text-slate-400 hover:bg-slate-50"
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
                  onClick={() => resetStatusManual(detailTarget.id)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-600 mt-3 transition-colors"
                >
                  <RefreshCcw size={11} />
                  Kembalikan ke hasil ranking otomatis ({detailTarget.statusOtomatis})
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-slate-100">
              <button
                onClick={() => setDetailTarget(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Tutup
              </button>
              <button
                onClick={() => setDetailTarget(null)}
                className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
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