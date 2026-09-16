"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  Building2,
  MapPin,
  ArrowLeft,
  Pencil,
  Trash2,
  Users,
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// Dummy data fasilitas — sama sumbernya dengan list, biasanya di-fetch dari API pakai id.
// Di sini disimulasikan sebagai object supaya gampang dicari by id.
const fasilitasData = {
  "fs-001": { nama: "Lapangan Basket", lokasi: "Area Belakang", kategori: "Olahraga", kondisi: "Baik", kapasitas: "30 orang", dibuat: "12 Jan 2023", deskripsi: "Lapangan basket outdoor dengan permukaan aspal, dilengkapi 2 ring standar pertandingan." },
  "fs-002": { nama: "Aula Sekolah", lokasi: "Gedung Utama Lt. 1", kategori: "Umum", kondisi: "Baik", kapasitas: "300 orang", dibuat: "5 Mar 2022", deskripsi: "Aula serbaguna untuk acara sekolah, dilengkapi panggung dan sistem tata suara." },
  "fs-003": { nama: "Lab Komputer", lokasi: "Gedung B Lt. 2", kategori: "Laboratorium", kondisi: "Rusak Ringan", kapasitas: "40 orang", dibuat: "20 Jul 2021", deskripsi: "Lab komputer dengan 40 unit PC, beberapa unit AC mengalami gangguan ringan." },
  "fs-004": { nama: "Perpustakaan", lokasi: "Gedung A Lt. 1", kategori: "Umum", kondisi: "Baik", kapasitas: "60 orang", dibuat: "18 Aug 2020", deskripsi: "Perpustakaan dengan koleksi lebih dari 5000 judul buku dan ruang baca ber-AC." },
  "fs-005": { nama: "Lab IPA", lokasi: "Gedung B Lt. 1", kategori: "Laboratorium", kondisi: "Rusak Berat", kapasitas: "35 orang", dibuat: "10 Feb 2019", deskripsi: "Lab IPA untuk praktikum fisika, kimia, biologi. Atap mengalami kebocoran cukup parah." },
  "fs-006": { nama: "Musala", lokasi: "Area Tengah", kategori: "Ibadah", kondisi: "Baik", kapasitas: "100 orang", dibuat: "2 Jun 2020", deskripsi: "Musala sekolah dengan kapasitas 100 jamaah, dilengkapi tempat wudhu terpisah." },
};

const kondisiStyle = {
  Baik: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Rusak Ringan": "text-amber-700 bg-amber-50 border-amber-200",
  "Rusak Berat": "text-rose-700 bg-rose-50 border-rose-200",
};

const riwayatKondisi = [
  { id: 1, title: "Kondisi diperbarui menjadi Baik", desc: "Diperiksa oleh Admin Sarpras • 3 bulan lalu", status: "done" },
  { id: 2, title: "Pengajuan perbaikan disetujui", desc: "Ditindaklanjuti oleh Kepala Sarpras • 4 bulan lalu", status: "warning" },
  { id: 3, title: "Laporan kerusakan diterima", desc: "Dilaporkan oleh guru piket • 4 bulan lalu", status: "pending" },
];

const statusIcon = {
  pending: { icon: AlertTriangle, tone: "text-amber-600 bg-amber-50" },
  done: { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
  warning: { icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
};

export default function FasilitasDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const id = params?.id;
  const fasilitas = fasilitasData[id];

  const notifications = [
    { id: 1, title: "Lab IPA dilaporkan rusak berat", desc: "Dikirim 2 jam lalu", read: false },
  ];

  if (!fasilitas) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          role="adminSarpras"
          active="fasilitas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            notifications={notifications}
            user={{ name: "Admin Sarpras", email: "adminsarpras@smartschool.com", avatar: "SP" }}
          />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">Fasilitas dengan id "{id}" tidak ditemukan.</p>
              <button
                onClick={() => router.push("/adminSarpras/fasilitas")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={14} />
                Kembali ke daftar fasilitas
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="fasilitas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Admin Sarpras", email: "adminsarpras@smartschool.com", avatar: "SP" }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* BACK + PAGE HEADER */}
            <div>
              <button
                onClick={() => router.push("/adminSarpras/fasilitas")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-3"
              >
                <ArrowLeft size={14} />
                Kembali ke Fasilitas
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Detail Fasilitas</p>
                  <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 mt-1 tracking-tight truncate">
                    {fasilitas.nama}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{fasilitas.lokasi}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                    <Pencil size={15} />
                    Edit
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-sm font-medium transition-colors">
                    <Trash2 size={15} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>

            {/* INFO CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="h-40 sm:h-52 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <Building2 size={48} className="text-blue-300" />
              </div>
              <div className="p-5 space-y-5">
                <p className="text-sm text-slate-600 leading-relaxed">{fasilitas.deskripsi}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Tag size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Kategori</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{fasilitas.kategori}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Users size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Kapasitas</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{fasilitas.kapasitas}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Calendar size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Terdaftar</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{fasilitas.dibuat}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Kondisi</p>
                      <span className={`inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${kondisiStyle[fasilitas.kondisi]}`}>
                        {fasilitas.kondisi}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIWAYAT KONDISI */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Riwayat Kondisi</h3>
                <p className="text-xs text-slate-400 mt-0.5">Aktivitas pemeriksaan & perbaikan fasilitas ini</p>
              </div>
              <div className="divide-y divide-slate-100">
                {riwayatKondisi.map((item) => {
                  const s = statusIcon[item.status];
                  const StatusIcon = s.icon;
                  return (
                    <div key={item.id} className="flex items-center gap-3.5 px-5 py-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                        <StatusIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
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