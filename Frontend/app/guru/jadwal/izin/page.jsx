"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  FileText,
  Sparkles,
  Plus,
  X,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const JENIS_IZIN = ["Sakit", "Izin Pribadi", "Dinas Luar", "Cuti"];

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

const statusStyle = {
  disetujui: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", icon: CheckCircle2, label: "Disetujui" },
  menunggu: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: Hourglass, label: "Menunggu" },
  ditolak: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", icon: XCircle, label: "Ditolak" },
};

// ===== MAIN COMPONENT =====

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
    { id: 1, title: "Rapat Wali Kelas", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Batas Input Nilai Rapor", desc: "Dikirim 5 jam lalu", read: false },
  ];

  const summary = {
    total: riwayatIzin.length,
    disetujui: riwayatIzin.filter((r) => r.status === "disetujui").length,
    menunggu: riwayatIzin.filter((r) => r.status === "menunggu").length,
  };

  const formatTanggal = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!form.tanggalMulai) newErrors.tanggalMulai = "Pilih tanggal mulai izin.";
    if (!form.tanggalSelesai) newErrors.tanggalSelesai = "Pilih tanggal selesai izin.";
    if (form.tanggalMulai && form.tanggalSelesai && form.tanggalSelesai < form.tanggalMulai) {
      newErrors.tanggalSelesai = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    }
    if (!form.alasan.trim()) newErrors.alasan = "Isi alasan pengajuan izin.";

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
    setForm({ jenis: JENIS_IZIN[0], tanggalMulai: "", tanggalSelesai: "", alasan: "" });
    setErrors({});
    setShowForm(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="izin"
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
                    <FileText size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Pengajuan Izin
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Ajukan izin tidak hadir mengajar dan pantau statusnya.</span>
                </p>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
              >
                <Plus size={16} />
                Ajukan Izin
              </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Pengajuan</p>
                  <p className="text-lg font-bold text-slate-800">{summary.total}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Disetujui</p>
                  <p className="text-lg font-bold text-slate-800">{summary.disetujui}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
                  <Hourglass size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Menunggu</p>
                  <p className="text-lg font-bold text-slate-800">{summary.menunggu}</p>
                </div>
              </div>
            </div>

            {/* FORM PENGAJUAN */}
            {showForm && (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-200/60 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Form Pengajuan Izin</h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setErrors({});
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Jenis Izin</label>
                    <select
                      value={form.jenis}
                      onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                      className="w-full appearance-none px-3 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      {JENIS_IZIN.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={form.tanggalMulai}
                        onChange={(e) => {
                          setForm({ ...form, tanggalMulai: e.target.value });
                          setErrors({ ...errors, tanggalMulai: undefined });
                        }}
                        className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                      />
                      {errors.tanggalMulai && (
                        <p className="text-xs text-rose-500 mt-1.5">{errors.tanggalMulai}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={form.tanggalSelesai}
                        onChange={(e) => {
                          setForm({ ...form, tanggalSelesai: e.target.value });
                          setErrors({ ...errors, tanggalSelesai: undefined });
                        }}
                        className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                      />
                      {errors.tanggalSelesai && (
                        <p className="text-xs text-rose-500 mt-1.5">{errors.tanggalSelesai}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Alasan</label>
                    <textarea
                      value={form.alasan}
                      onChange={(e) => {
                        setForm({ ...form, alasan: e.target.value });
                        setErrors({ ...errors, alasan: undefined });
                      }}
                      rows={3}
                      placeholder="Jelaskan alasan pengajuan izin Anda..."
                      className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors resize-none"
                    />
                    {errors.alasan && (
                      <p className="text-xs text-rose-500 mt-1.5">{errors.alasan}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setErrors({});
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      Kirim Pengajuan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RIWAYAT IZIN */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 truncate">Riwayat Pengajuan</h3>
                <span className="text-xs text-slate-400 flex-shrink-0">{riwayatIzin.length} pengajuan</span>
              </div>

              <div className="divide-y divide-slate-100">
                {riwayatIzin.length === 0 && (
                  <div className="p-10 text-center">
                    <FileText size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">Belum ada pengajuan izin.</p>
                  </div>
                )}

                {riwayatIzin.map((r) => {
                  const s = statusStyle[r.status];
                  const StatusIcon = s.icon;
                  return (
                    <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800">{r.jenis}</span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border} flex items-center gap-1`}>
                            <StatusIcon size={11} />
                            {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <CalendarDays size={13} className="flex-shrink-0" />
                          {r.tanggalMulai === r.tanggalSelesai
                            ? r.tanggalMulai
                            : `${r.tanggalMulai} - ${r.tanggalSelesai}`}
                        </p>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.alasan}</p>
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