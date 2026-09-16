"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  Package,
  MapPin,
  ArrowLeft,
  Pencil,
  Trash2,
  Tag,
  Boxes,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

// Dummy data inventaris — biasanya di-fetch dari API pakai id.
const iventarisData = {
  "inv-001": { nama: "Kursi Kayu", kategori: "Furnitur", lokasi: "Gudang A", stok: 120, kondisi: "Baik", dibuat: "10 Jan 2022", deskripsi: "Kursi kayu standar untuk ruang kelas, cukup kokoh dan mudah dirawat." },
  "inv-002": { nama: "Proyektor Epson", kategori: "Elektronik", lokasi: "Lab Komputer", stok: 5, kondisi: "Baik", dibuat: "2 Mar 2023", deskripsi: "Proyektor Epson EB-X05, digunakan untuk presentasi dan pembelajaran di lab komputer." },
  "inv-003": { nama: "Meja Guru", kategori: "Furnitur", lokasi: "Ruang Guru", stok: 30, kondisi: "Rusak Ringan", dibuat: "15 Jun 2021", deskripsi: "Meja kerja guru, beberapa unit mengalami keretakan pada permukaan." },
  "inv-004": { nama: "AC Split 1PK", kategori: "Elektronik", lokasi: "Ruang Kepala Sekolah", stok: 8, kondisi: "Baik", dibuat: "20 Aug 2022", deskripsi: "AC split 1PK untuk ruangan kecil-menengah, kondisi terawat baik." },
  "inv-005": { nama: "Papan Tulis", kategori: "Alat Belajar", lokasi: "Gudang B", stok: 15, kondisi: "Rusak Berat", dibuat: "5 Feb 2019", deskripsi: "Papan tulis whiteboard, sebagian besar permukaan sudah menguning dan sulit dihapus." },
  "inv-006": { nama: "Mikroskop", kategori: "Laboratorium", lokasi: "Lab IPA", stok: 20, kondisi: "Baik", dibuat: "18 Sep 2021", deskripsi: "Mikroskop untuk praktikum biologi, lensa masih jernih dan berfungsi normal." },
  "inv-007": { nama: "Sound System", kategori: "Elektronik", lokasi: "Aula", stok: 2, kondisi: "Baik", dibuat: "8 Nov 2022", deskripsi: "Sistem tata suara untuk acara di aula, mencakup speaker dan mixer." },
  "inv-008": { nama: "Lemari Arsip", kategori: "Furnitur", lokasi: "Ruang TU", stok: 10, kondisi: "Rusak Ringan", dibuat: "12 Dec 2020", deskripsi: "Lemari penyimpanan arsip administrasi, engsel pintu beberapa unit sudah longgar." },
};

const kondisiStyle = {
  Baik: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Rusak Ringan": "text-amber-700 bg-amber-50 border-amber-200",
  "Rusak Berat": "text-rose-700 bg-rose-50 border-rose-200",
};

const riwayatBarang = [
  { id: 1, title: "Pemeriksaan stok rutin", desc: "Diperiksa oleh Admin Sarpras • 2 bulan lalu", status: "done" },
  { id: 2, title: "5 unit dipinjam oleh Pak Budi", desc: "Ruang Lab Komputer • 3 bulan lalu", status: "pending" },
  { id: 3, title: "Laporan kondisi diperbarui", desc: "Ditindaklanjuti oleh Admin Sarpras • 4 bulan lalu", status: "warning" },
];

const statusIcon = {
  pending: { icon: Clock, tone: "text-amber-600 bg-amber-50" },
  done: { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
  warning: { icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
};

export default function IventarisDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const id = params?.id;
  const item = iventarisData[id];

  const notifications = [
    { id: 1, title: "Stok papan tulis menipis", desc: "Dikirim 3 jam lalu", read: false },
  ];

  if (!item) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          role="adminSarpras"
          active="iventaris"
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
              <p className="text-sm text-slate-500">Barang dengan id "{id}" tidak ditemukan.</p>
              <button
                onClick={() => router.push("/adminSarpras/iventaris")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={14} />
                Kembali ke daftar inventaris
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
        active="iventaris"
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
                onClick={() => router.push("/adminSarpras/iventaris")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-3"
              >
                <ArrowLeft size={14} />
                Kembali ke Inventaris
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Detail Inventaris</p>
                  <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 mt-1 tracking-tight truncate">
                    {item.nama}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{item.lokasi}</span>
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
                <Package size={48} className="text-blue-300" />
              </div>
              <div className="p-5 space-y-5">
                <p className="text-sm text-slate-600 leading-relaxed">{item.deskripsi}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Tag size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Kategori</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{item.kategori}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Boxes size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Stok</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{item.stok} unit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Calendar size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Terdaftar</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{item.dibuat}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Kondisi</p>
                      <span className={`inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${kondisiStyle[item.kondisi]}`}>
                        {item.kondisi}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIWAYAT BARANG */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Riwayat Barang</h3>
                <p className="text-xs text-slate-400 mt-0.5">Aktivitas pemeriksaan & peminjaman barang ini</p>
              </div>
              <div className="divide-y divide-slate-100">
                {riwayatBarang.map((r) => {
                  const s = statusIcon[r.status];
                  const StatusIcon = s.icon;
                  return (
                    <div key={r.id} className="flex items-center gap-3.5 px-5 py-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                        <StatusIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{r.desc}</p>
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