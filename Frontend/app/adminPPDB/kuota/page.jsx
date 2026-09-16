"use client";

import { useState, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  ChevronRight,
  Pencil,
  X,
  AlertTriangle,
  Search,
  Settings2,
} from "lucide-react";

// =========================================================
// DUMMY DATA — nanti tinggal disambungkan ke API PPDB kamu
// =========================================================

const DAYA_TAMPUNG_AWAL = 1500;

const initialAlokasi = [
  { id: 1, jalur: "Jalur Reguler", gelombang: "Gelombang 1", kuota: 300, terisi: 300, color: "#3B82F6" },
  { id: 2, jalur: "Jalur Reguler", gelombang: "Gelombang 2", kuota: 250, terisi: 210, color: "#3B82F6" },
  { id: 3, jalur: "Jalur Reguler", gelombang: "Gelombang 3", kuota: 150, terisi: 91, color: "#3B82F6" },
  { id: 4, jalur: "Jalur Prestasi", gelombang: "Gelombang 1", kuota: 200, terisi: 200, color: "#D97706" },
  { id: 5, jalur: "Jalur Prestasi", gelombang: "Gelombang 2", kuota: 250, terisi: 212, color: "#D97706" },
  { id: 6, jalur: "Jalur Afirmasi", gelombang: "Gelombang 1", kuota: 100, terisi: 88, color: "#E11D48" },
  { id: 7, jalur: "Jalur Afirmasi", gelombang: "Gelombang 2", kuota: 100, terisi: 90, color: "#E11D48" },
  { id: 8, jalur: "Jalur Mutasi", gelombang: "Gelombang 2", kuota: 60, terisi: 57, color: "#7C3AED" },
];

const JALUR_OPTIONS = ["Jalur Reguler", "Jalur Prestasi", "Jalur Afirmasi", "Jalur Mutasi"];
const JALUR_FILTERS = ["Semua", ...JALUR_OPTIONS];

function formatRupiah(n) {
  return n.toLocaleString("id-ID");
}

export default function KuotaPPDBPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [alokasiList, setAlokasiList] = useState(initialAlokasi);
  const [dayaTampung, setDayaTampung] = useState(DAYA_TAMPUNG_AWAL);
  const [dayaTampungInput, setDayaTampungInput] = useState(String(DAYA_TAMPUNG_AWAL));
  const [activeJalur, setActiveJalur] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [kuotaInput, setKuotaInput] = useState("");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filtered = alokasiList.filter((a) => {
    const matchJalur = activeJalur === "Semua" || a.jalur === activeJalur;
    const matchSearch = a.jalur.toLowerCase().includes(search.toLowerCase()) || a.gelombang.toLowerCase().includes(search.toLowerCase());
    return matchJalur && matchSearch;
  });

  const totalDialokasikan = alokasiList.reduce((a, x) => a + x.kuota, 0);
  const totalTerisi = alokasiList.reduce((a, x) => a + x.terisi, 0);
  const sisaAlokasi = dayaTampung - totalDialokasikan;
  const isOverAllocated = sisaAlokasi < 0;

  const perJalur = useMemo(() => {
    return JALUR_OPTIONS.map((nama) => {
      const rows = alokasiList.filter((a) => a.jalur === nama);
      const kuota = rows.reduce((a, x) => a + x.kuota, 0);
      const terisi = rows.reduce((a, x) => a + x.terisi, 0);
      const color = rows[0]?.color || "#94A3B8";
      return { nama, kuota, terisi, color };
    });
  }, [alokasiList]);

  const openEdit = (a) => {
    setEditTarget(a);
    setKuotaInput(String(a.kuota));
    setShowModal(true);
  };

  const handleSaveKuota = (e) => {
    e.preventDefault();
    const nilai = Number(kuotaInput);
    if (isNaN(nilai) || nilai < 0) return;
    setAlokasiList((prev) =>
      prev.map((a) => (a.id === editTarget.id ? { ...a, kuota: nilai } : a))
    );
    setShowModal(false);
  };

  const handleSaveDayaTampung = () => {
    const nilai = Number(dayaTampungInput);
    if (isNaN(nilai) || nilai < 0) return;
    setDayaTampung(nilai);
  };

  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="kuota"
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
                <span className="text-slate-600 font-medium">Kuota</span>
              </div>

              {/* ===== KARTU RINGKASAN ===== */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Daya Tampung Sekolah</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">
                    {formatRupiah(dayaTampung)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Total Dialokasikan</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">
                    {formatRupiah(totalDialokasikan)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Sisa Alokasi</p>
                  <p className={`text-2xl font-bold mt-2 ${isOverAllocated ? "text-rose-500" : "text-emerald-500"}`}>
                    {isOverAllocated ? "-" : ""}{formatRupiah(Math.abs(sisaAlokasi))}
                  </p>
                </div>
                <div className="bg-[#F6F7F8] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-slate-400">Kuota Terisi</p>
                  <p className="text-3xl font-bold text-slate-500 mt-3">
                    {totalDialokasikan > 0 ? Math.round((totalTerisi / totalDialokasikan) * 100) : 0}%
                  </p>
                </div>
              </section>

              {isOverAllocated && (
                <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl px-4 py-3">
                  <AlertTriangle size={15} className="flex-shrink-0" />
                  Total kuota yang dialokasikan melebihi daya tampung sekolah sebanyak{" "}
                  <span className="font-semibold">{formatRupiah(Math.abs(sisaAlokasi))}</span> siswa. Silakan sesuaikan alokasi.
                </div>
              )}

              {/* ===== PENGATURAN DAYA TAMPUNG ===== */}
              <section className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 size={15} className="text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-700">Pengaturan Daya Tampung Sekolah</h3>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Total Daya Tampung (siswa)</label>
                    <input
                      type="number"
                      min="0"
                      value={dayaTampungInput}
                      onChange={(e) => setDayaTampungInput(e.target.value)}
                      className="text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 w-48"
                    />
                  </div>
                  <button
                    onClick={handleSaveDayaTampung}
                    className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Simpan
                  </button>
                  <p className="text-xs text-slate-400">
                    Total kuota di seluruh jalur & gelombang tidak boleh melebihi angka ini.
                  </p>
                </div>
              </section>

              {/* ===== REKAP PER JALUR ===== */}
              <section className="bg-white rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Rekap Kuota per Jalur</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {perJalur.map((j) => {
                    const persen = j.kuota > 0 ? Math.min(100, Math.round((j.terisi / j.kuota) * 100)) : 0;
                    return (
                      <div key={j.nama} className="border border-slate-100 rounded-lg p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: j.color }} />
                          <p className="text-xs font-medium text-slate-600 truncate">{j.nama}</p>
                        </div>
                        <p className="text-lg font-bold text-slate-800 mt-2 font-mono tabular-nums">
                          {j.terisi}
                          <span className="text-xs font-normal text-slate-400"> / {j.kuota}</span>
                        </p>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${persen}%`, backgroundColor: j.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ===== TABEL ALOKASI DETAIL ===== */}
              <section className="bg-white rounded-xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-5 overflow-x-auto">
                    {JALUR_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveJalur(f)}
                        className={`relative pb-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                          activeJalur === f
                            ? "text-blue-600"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {f}
                        {activeJalur === f && (
                          <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-md px-3 py-1.5">
                    <Search size={13} className="text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari jalur/gelombang..."
                      className="outline-none bg-transparent placeholder:text-slate-400 w-40"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                        <th className="px-5 py-3 font-medium">Jalur</th>
                        <th className="px-5 py-3 font-medium">Gelombang</th>
                        <th className="px-5 py-3 font-medium">Kuota</th>
                        <th className="px-5 py-3 font-medium">Terisi</th>
                        <th className="px-5 py-3 font-medium">Sisa</th>
                        <th className="px-5 py-3 font-medium">Progres</th>
                        <th className="px-5 py-3 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                            Tidak ada alokasi ditemukan.
                          </td>
                        </tr>
                      )}
                      {filtered.map((a) => {
                        const persen = a.kuota > 0 ? Math.min(100, Math.round((a.terisi / a.kuota) * 100)) : 0;
                        const sisa = a.kuota - a.terisi;
                        return (
                          <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                                <span className="font-medium text-slate-700">{a.jalur}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-500">{a.gelombang}</td>
                            <td className="px-5 py-4 text-slate-700 font-mono tabular-nums">{a.kuota}</td>
                            <td className="px-5 py-4 text-slate-700 font-mono tabular-nums">{a.terisi}</td>
                            <td className="px-5 py-4 font-mono tabular-nums">
                              <span className={sisa < 0 ? "text-rose-500 font-semibold" : "text-slate-500"}>
                                {sisa}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${persen}%`, backgroundColor: a.color }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500 font-mono">{persen}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => openEdit(a)}
                                  className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {filtered.length > 0 && (
                      <tfoot>
                        <tr className="border-t border-slate-100 bg-slate-50/50">
                          <td className="px-5 py-3 text-xs font-semibold text-slate-500" colSpan={2}>
                            Total ({filtered.length} alokasi)
                          </td>
                          <td className="px-5 py-3 text-xs font-semibold text-slate-700 font-mono">
                            {filtered.reduce((a, x) => a + x.kuota, 0)}
                          </td>
                          <td className="px-5 py-3 text-xs font-semibold text-slate-700 font-mono">
                            {filtered.reduce((a, x) => a + x.terisi, 0)}
                          </td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </section>

              <footer className="text-center text-[11px] text-slate-400 py-3">
                © 2026 SmartSchool &middot; Dashboard Admin PPDB &middot; All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* ===== MODAL EDIT KUOTA ===== */}
      {showModal && editTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-800">Edit Kuota</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {editTarget.jalur} &middot; {editTarget.gelombang}
            </p>

            <form onSubmit={handleSaveKuota} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Kuota</label>
                <input
                  type="number"
                  min={editTarget.terisi}
                  value={kuotaInput}
                  onChange={(e) => setKuotaInput(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Sudah terisi {editTarget.terisi} siswa, kuota tidak boleh kurang dari angka ini.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}