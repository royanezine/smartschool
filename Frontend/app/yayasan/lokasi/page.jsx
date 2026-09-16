"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Search,
  MapPin,
  Phone,
  Users,
  ExternalLink,
  Building2,
  GraduationCap,
} from "lucide-react";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const dummySekolah = [
  {
    id: 1,
    nama: "SMA Harapan 1",
    alamat: "Jl. Kemerdekaan No. 45, Jakarta Pusat",
    telp: "021-5551234",
    jumlahSiswa: 480,
    jumlahGuru: 32,
    lat: -6.1751,
    lng: 106.865,
  },
  {
    id: 2,
    nama: "SMA Harapan 2",
    alamat: "Jl. Sudirman No. 88, Jakarta Selatan",
    telp: "021-5555678",
    jumlahSiswa: 512,
    jumlahGuru: 35,
    lat: -6.2088,
    lng: 106.8228,
  },
  {
    id: 3,
    nama: "SMP Harapan Bangsa",
    alamat: "Jl. Diponegoro No. 12, Jakarta Timur",
    telp: "021-5559012",
    jumlahSiswa: 390,
    jumlahGuru: 28,
    lat: -6.2251,
    lng: 106.9004,
  },
  {
    id: 4,
    nama: "SD Harapan Ceria",
    alamat: "Jl. Cendrawasih No. 7, Jakarta Barat",
    telp: "021-5553456",
    jumlahSiswa: 350,
    jumlahGuru: 24,
    lat: -6.1683,
    lng: 106.7588,
  },
];

export default function LokasiSekolahPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(dummySekolah[0]);

  const notifications = [
    { id: 1, title: "Pengumuman Libur Semester", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Deadline Input Nilai", desc: "Dikirim 5 jam lalu", read: false },
  ];

  const filtered = dummySekolah.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.alamat.toLowerCase().includes(search.toLowerCase())
  );

  const mapSrc = `https://www.google.com/maps?q=${selected.lat},${selected.lng}&z=15&output=embed`;
  const mapLink = `https://www.google.com/maps?q=${selected.lat},${selected.lng}`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="lokasi"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Admin Yayasan", email: "admin@smartschool.com", avatar: "Y" }}
        />
        <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">
            {/* PAGE HEADER */}
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Lokasi Sekolah</h1>
              <p className="text-sm text-slate-500 mt-1">
                Peta lokasi seluruh sekolah yang dinaungi yayasan
              </p>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Total Sekolah</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">{dummySekolah.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Total Siswa</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {dummySekolah.reduce((a, s) => a + s.jumlahSiswa, 0)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Total Guru</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {dummySekolah.reduce((a, s) => a + s.jumlahGuru, 0)}
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* LIST SEKOLAH */}
              <div className="lg:w-80 shrink-0 space-y-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau alamat sekolah..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {filtered.map((s) => {
                    const isActive = selected.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className={`w-full text-left rounded-xl border p-3 transition-colors ${
                          isActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200/80 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isActive ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Building2 size={16} />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isActive ? "text-blue-700" : "text-slate-800"
                              }`}
                            >
                              {s.nama}
                            </p>
                            <p className="text-xs text-slate-400 line-clamp-2">{s.alamat}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 text-center">
                      <p className="text-sm text-slate-400">Tidak ada sekolah yang cocok.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* MAP & DETAIL */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                  <iframe
                    title="Peta Lokasi Sekolah"
                    src={mapSrc}
                    className="h-80 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">{selected.nama}</h2>
                      <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                        {selected.alamat}
                      </p>
                    </div>
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink size={14} />
                      Buka di Google Maps
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 p-3">
                      <Phone size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Telepon</p>
                        <p className="text-sm font-medium text-slate-800">{selected.telp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 p-3">
                      <Users size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Jumlah Siswa</p>
                        <p className="text-sm font-medium text-slate-800">{selected.jumlahSiswa}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 p-3">
                      <GraduationCap size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Jumlah Guru</p>
                        <p className="text-sm font-medium text-slate-800">{selected.jumlahGuru}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}