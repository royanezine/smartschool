"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  ClipboardList,
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
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

// ===== DUMMY DATA =====
// Daftar pengajuan peminjaman milik guru yang sedang login.
// Ganti dengan data asli dari API/DB begitu tersedia.

const STATUS_FILTER = ["Semua", "Menunggu", "Disetujui", "Berlangsung", "Ditolak"];

const iconByKategori = {
  Elektronik: Projector,
  Ruangan: DoorOpen,
  Olahraga: Dumbbell,
  Lainnya: Wrench,
};

const daftarPengajuan = [
  {
    id: "PJ-0231",
    item: "Sound System Portable",
    kategori: "Elektronik",
    icon: Speaker,
    tanggal: "18 Agu 2026",
    jamMulai: "09:00",
    jamSelesai: "12:00",
    jumlah: 1,
    keperluan: "Acara perpisahan kelas 9",
    status: "menunggu",
    diajukan: "1 jam lalu",
  },
  {
    id: "PJ-0229",
    item: "Proyektor Epson EB-X05",
    kategori: "Elektronik",
    icon: Projector,
    tanggal: "17 Agu 2026",
    jamMulai: "08:00",
    jamSelesai: "09:30",
    jumlah: 1,
    keperluan: "Presentasi materi Bab 3 kelas 9A",
    status: "berlangsung",
    diajukan: "kemarin",
  },
  {
    id: "PJ-0225",
    item: "Ruang Lab Komputer 2",
    kategori: "Ruangan",
    icon: DoorOpen,
    tanggal: "19 Agu 2026",
    jamMulai: "10:00",
    jamSelesai: "11:30",
    jumlah: 1,
    keperluan: "Praktik simulasi ujian online",
    status: "disetujui",
    diajukan: "2 hari lalu",
  },
  {
    id: "PJ-0218",
    item: "Laptop Lenovo ThinkPad",
    kategori: "Elektronik",
    icon: Laptop,
    tanggal: "15 Agu 2026",
    jamMulai: "07:30",
    jamSelesai: "09:00",
    jumlah: 2,
    keperluan: "Input nilai UTS bersama tim",
    status: "ditolak",
    diajukan: "4 hari lalu",
    alasanTolak: "Stok sedang dipakai kegiatan lain di jam yang sama",
  },
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
    status: "selesai",
    diajukan: "5 hari lalu",
  },
];

const statusConfig = {
  menunggu: {
    label: "Menunggu",
    icon: Hourglass,
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  disetujui: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "text-blue-600 bg-blue-50 border-blue-200",
  },
  berlangsung: {
    label: "Berlangsung",
    icon: Clock,
    className: "text-violet-600 bg-violet-50 border-violet-200",
  },
  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    className: "text-red-600 bg-red-50 border-red-200",
  },
  selesai: {
    label: "Selesai",
    icon: CheckCircle2,
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
};

// filter tab -> key status data (bisa lebih dari satu status per tab)
const filterToStatus = {
  Semua: null,
  Menunggu: ["menunggu"],
  Disetujui: ["disetujui"],
  Berlangsung: ["berlangsung"],
  Ditolak: ["ditolak"],
};

export default function GuruSarprasPeminjamanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterAktif, setFilterAktif] = useState("Semua");
  const [pencarian, setPencarian] = useState("");
  const [detailDipilih, setDetailDipilih] = useState(null);

  const notifications = [
    { id: 1, title: "Pengajuan Disetujui", desc: "Dikirim 1 jam lalu", read: false },
    { id: 2, title: "Batas Pengembalian Alat", desc: "Dikirim 4 jam lalu", read: false },
  ];

  const dataTersaring = useMemo(() => {
    return daftarPengajuan.filter((p) => {
      const statusYangDicari = filterToStatus[filterAktif];
      const cocokStatus = !statusYangDicari || statusYangDicari.includes(p.status);
      const cocokPencarian =
        p.item.toLowerCase().includes(pencarian.toLowerCase()) ||
        p.id.toLowerCase().includes(pencarian.toLowerCase());
      return cocokStatus && cocokPencarian;
    });
  }, [filterAktif, pencarian]);

  const jumlahPerStatus = (key) => {
    const statusYangDicari = filterToStatus[key];
    if (!statusYangDicari) return daftarPengajuan.length;
    return daftarPengajuan.filter((p) => statusYangDicari.includes(p.status)).length;
  };

  const batalkanPengajuan = (id) => {
    // TODO: panggil API untuk membatalkan pengajuan
    setDetailDipilih(null);
  };

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
                    <ClipboardList size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Peminjaman
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Pantau status pengajuan peminjaman kamu, dari menunggu sampai selesai.</span>
                </p>
              </div>
            </div>

            {/* SEARCH + FILTER STATUS */}
            <div className="flex flex-col sm:flex-row gap-3">
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
              <div className="flex gap-1.5 overflow-x-auto sm:overflow-visible">
                {STATUS_FILTER.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterAktif(f)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      filterAktif === f
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {f}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        filterAktif === f ? "bg-white/20" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {jumlahPerStatus(f)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* DAFTAR PENGAJUAN */}
            <div className="space-y-3">
              {dataTersaring.map((p) => {
                const cfg = statusConfig[p.status];
                const ItemIcon = p.icon;

                return (
                  <button
                    key={p.id}
                    onClick={() => setDetailDipilih(p)}
                    className="w-full text-left bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4"
                  >
                    <div className="p-2.5 rounded-lg text-white shadow-sm flex-shrink-0 bg-slate-600">
                      <ItemIcon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-800 truncate">{p.item}</h2>
                        <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">{p.id}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} className="text-slate-400" />
                          {p.tanggal}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          {p.jamMulai} – {p.jamSelesai}
                        </span>
                      </div>
                    </div>

                    <span className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.className}`}>
                      <cfg.icon size={11} />
                      {cfg.label}
                    </span>
                  </button>
                );
              })}

              {dataTersaring.length === 0 && (
                <div className="text-center py-12 text-sm text-slate-400">
                  Tidak ada pengajuan yang cocok.
                </div>
              )}
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
                <p className="text-xs text-slate-500 mt-0.5">{detailDipilih.id} · diajukan {detailDipilih.diajukan}</p>
              </div>
              <button
                onClick={() => setDetailDipilih(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusConfig[detailDipilih.status].className}`}>
                {(() => {
                  const Icon = statusConfig[detailDipilih.status].icon;
                  return <Icon size={11} />;
                })()}
                {statusConfig[detailDipilih.status].label}
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                  <p className="text-slate-400 mb-1">Tanggal</p>
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

              {detailDipilih.status === "ditolak" && detailDipilih.alasanTolak && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{detailDipilih.alasanTolak}</p>
                </div>
              )}

              {(detailDipilih.status === "menunggu" || detailDipilih.status === "disetujui") && (
                <button
                  onClick={() => batalkanPengajuan(detailDipilih.id)}
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Batalkan Pengajuan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}