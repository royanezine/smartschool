"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  FileText,
  Sparkles,
  Search,
  Projector,
  Speaker,
  Dumbbell,
  DoorOpen,
  Laptop,
  Wrench,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  RotateCcw,
} from "lucide-react";

// ===== DUMMY DATA =====
// Catatan lengkap peminjaman yang sudah selesai (dikembalikan tepat waktu, terlambat, atau ditolak).
// Ganti dengan data asli dari API/DB begitu tersedia.

const KATEGORI_FILTER = ["Semua", "Elektronik", "Ruangan", "Olahraga", "Lainnya"];
const RENTANG_FILTER = ["30 Hari Terakhir", "3 Bulan Terakhir", "Semester Ini", "Semua"];

const daftarRiwayat = [
  {
    id: "PJ-0212",
    item: "Matras Olahraga",
    kategori: "Olahraga",
    icon: Dumbbell,
    tanggal: "14 Agu 2026",
    jamMulai: "08:00",
    jamSelesai: "09:30",
    jumlah: 10,
    keperluan: "Praktik senam lantai kelas 8A",
    hasil: "dikembalikan",
    tanggalKembali: "14 Agu 2026, 09:35",
  },
  {
    id: "PJ-0205",
    item: "Proyektor Epson EB-X05",
    kategori: "Elektronik",
    icon: Projector,
    tanggal: "10 Agu 2026",
    jamMulai: "10:00",
    jamSelesai: "11:30",
    jumlah: 1,
    keperluan: "Presentasi tugas akhir kelas 9B",
    hasil: "terlambat",
    tanggalKembali: "10 Agu 2026, 13:10",
    keterlambatan: "1 jam 40 menit",
  },
  {
    id: "PJ-0198",
    item: "Ruang Rapat Guru",
    kategori: "Ruangan",
    icon: DoorOpen,
    tanggal: "5 Agu 2026",
    jamMulai: "13:00",
    jamSelesai: "14:30",
    jumlah: 1,
    keperluan: "Rapat koordinasi MGMP Matematika",
    hasil: "dikembalikan",
    tanggalKembali: "5 Agu 2026, 14:25",
  },
  {
    id: "PJ-0187",
    item: "Laptop Lenovo ThinkPad",
    kategori: "Elektronik",
    icon: Laptop,
    tanggal: "1 Agu 2026",
    jamMulai: "07:30",
    jamSelesai: "09:00",
    jumlah: 2,
    keperluan: "Input nilai UTS bersama tim",
    hasil: "ditolak",
    alasanTolak: "Stok sedang dipakai kegiatan lain di jam yang sama",
  },
  {
    id: "PJ-0175",
    item: "Sound System Portable",
    kategori: "Elektronik",
    icon: Speaker,
    tanggal: "28 Jul 2026",
    jamMulai: "09:00",
    jamSelesai: "12:00",
    jumlah: 1,
    keperluan: "Acara pentas seni kelas 7C",
    hasil: "dikembalikan",
    tanggalKembali: "28 Jul 2026, 11:50",
  },
  {
    id: "PJ-0163",
    item: "Bola Basket",
    kategori: "Olahraga",
    icon: Dumbbell,
    tanggal: "22 Jul 2026",
    jamMulai: "08:00",
    jamSelesai: "09:30",
    jumlah: 6,
    keperluan: "Praktik olahraga kelas 8B",
    hasil: "terlambat",
    tanggalKembali: "22 Jul 2026, 10:15",
    keterlambatan: "45 menit",
  },
  {
    id: "PJ-0150",
    item: "Kotak P3K Lapangan",
    kategori: "Lainnya",
    icon: Wrench,
    tanggal: "15 Jul 2026",
    jamMulai: "08:00",
    jamSelesai: "10:00",
    jumlah: 1,
    keperluan: "Persiapan lomba lari 17 Agustus",
    hasil: "dikembalikan",
    tanggalKembali: "15 Jul 2026, 09:55",
  },
];

const hasilConfig = {
  dikembalikan: {
    label: "Dikembalikan Tepat Waktu",
    icon: CheckCircle2,
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  terlambat: {
    label: "Terlambat",
    icon: AlertTriangle,
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    className: "text-red-600 bg-red-50 border-red-200",
  },
};

export default function GuruSarprasRiwayatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [rentangAktif, setRentangAktif] = useState("30 Hari Terakhir");
  const [pencarian, setPencarian] = useState("");
  const [detailDipilih, setDetailDipilih] = useState(null);

  const notifications = [
    { id: 1, title: "Pengajuan Disetujui", desc: "Dikirim 1 jam lalu", read: false },
    { id: 2, title: "Batas Pengembalian Alat", desc: "Dikirim 4 jam lalu", read: false },
  ];

  const dataTersaring = useMemo(() => {
    return daftarRiwayat.filter((r) => {
      const cocokKategori = kategoriAktif === "Semua" || r.kategori === kategoriAktif;
      const cocokPencarian =
        r.item.toLowerCase().includes(pencarian.toLowerCase()) ||
        r.id.toLowerCase().includes(pencarian.toLowerCase());
      return cocokKategori && cocokPencarian;
    });
  }, [kategoriAktif, pencarian]);

  const ringkasan = useMemo(() => {
    const total = daftarRiwayat.length;
    const tepatWaktu = daftarRiwayat.filter((r) => r.hasil === "dikembalikan").length;
    const terlambat = daftarRiwayat.filter((r) => r.hasil === "terlambat").length;
    const ditolak = daftarRiwayat.filter((r) => r.hasil === "ditolak").length;
    return { total, tepatWaktu, terlambat, ditolak };
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="sarpras"
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
                    Riwayat Peminjaman
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Catatan lengkap peminjaman yang telah selesai atau dikembalikan.</span>
                </p>
              </div>
            </div>

            {/* RINGKASAN */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <p className="text-xs text-slate-400">Total Riwayat</p>
                <p className="text-xl font-semibold text-slate-800 mt-1">{ringkasan.total}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <p className="text-xs text-slate-400">Tepat Waktu</p>
                <p className="text-xl font-semibold text-emerald-600 mt-1">{ringkasan.tepatWaktu}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <p className="text-xs text-slate-400">Terlambat</p>
                <p className="text-xl font-semibold text-amber-600 mt-1">{ringkasan.terlambat}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <p className="text-xs text-slate-400">Ditolak</p>
                <p className="text-xl font-semibold text-red-600 mt-1">{ringkasan.ditolak}</p>
              </div>
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex flex-col gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) => setPencarian(e.target.value)}
                  placeholder="Cari nama item atau nomor pengajuan..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex gap-1.5 overflow-x-auto">
                  {KATEGORI_FILTER.map((k) => (
                    <button
                      key={k}
                      onClick={() => setKategoriAktif(k)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors ${
                        kategoriAktif === k
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <select
                  value={rentangAktif}
                  onChange={(e) => setRentangAktif(e.target.value)}
                  className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 flex-shrink-0"
                >
                  {RENTANG_FILTER.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DAFTAR RIWAYAT */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {dataTersaring.map((r) => {
                  const cfg = hasilConfig[r.hasil];
                  const ItemIcon = r.icon;

                  return (
                    <button
                      key={r.id}
                      onClick={() => setDetailDipilih(r)}
                      className="w-full text-left flex items-center gap-4 p-4 sm:px-5 sm:py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="p-2.5 rounded-lg text-white shadow-sm flex-shrink-0 bg-slate-500">
                        <ItemIcon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-slate-800 truncate">{r.item}</h2>
                          <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">{r.id}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} className="text-slate-400" />
                            {r.tanggal}
                          </span>
                          <span className="hidden sm:flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {r.jamMulai} – {r.jamSelesai}
                          </span>
                        </div>
                      </div>

                      <span className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.className}`}>
                        <cfg.icon size={11} />
                        <span className="hidden sm:inline">{cfg.label}</span>
                      </span>
                    </button>
                  );
                })}

                {dataTersaring.length === 0 && (
                  <div className="text-center py-12 text-sm text-slate-400">
                    Tidak ada riwayat yang cocok.
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* MODAL DETAIL */}
      {detailDipilih && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{detailDipilih.item}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{detailDipilih.id}</p>
              </div>
              <button
                onClick={() => setDetailDipilih(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${hasilConfig[detailDipilih.hasil].className}`}>
                {(() => {
                  const Icon = hasilConfig[detailDipilih.hasil].icon;
                  return <Icon size={11} />;
                })()}
                {hasilConfig[detailDipilih.hasil].label}
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                  <p className="text-slate-400 mb-1">Tanggal Pinjam</p>
                  <p className="font-medium text-slate-700">{detailDipilih.tanggal}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                  <p className="text-slate-400 mb-1">Jam</p>
                  <p className="font-medium text-slate-700">{detailDipilih.jamMulai} – {detailDipilih.jamSelesai}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                  <p className="text-slate-400 mb-1">Jumlah</p>
                  <p className="font-medium text-slate-700">{detailDipilih.jumlah} unit</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                  <p className="text-slate-400 mb-1">Kategori</p>
                  <p className="font-medium text-slate-700">{detailDipilih.kategori}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Keperluan</p>
                <p className="text-sm text-slate-700">{detailDipilih.keperluan}</p>
              </div>

              {detailDipilih.hasil === "dikembalikan" && (
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                  <RotateCcw size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700">
                    Dikembalikan pada {detailDipilih.tanggalKembali}
                  </p>
                </div>
              )}

              {detailDipilih.hasil === "terlambat" && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <p>Dikembalikan pada {detailDipilih.tanggalKembali}</p>
                    <p className="mt-0.5 font-medium">Terlambat {detailDipilih.keterlambatan}</p>
                  </div>
                </div>
              )}

              {detailDipilih.hasil === "ditolak" && detailDipilih.alasanTolak && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{detailDipilih.alasanTolak}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}