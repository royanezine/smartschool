"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  HandCoins,
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  User,
  Phone,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
} from "lucide-react";

// Dummy data peminjaman — biasanya di-fetch dari API pakai id.
const peminjamanData = {
  "pjm-001": { nama: "Proyektor Epson", tipe: "Inventaris", peminjam: "Pak Budi", kontak: "0812-3456-7890", tanggalPinjam: "18 Agu 2026", tanggalKembali: "22 Agu 2026", status: "Dipinjam", keperluan: "Presentasi rapat wali murid di Aula Sekolah." },
  "pjm-002": { nama: "Aula Sekolah", tipe: "Fasilitas", peminjam: "OSIS", kontak: "0813-2211-4455", tanggalPinjam: "20 Agu 2026", tanggalKembali: "21 Agu 2026", status: "Menunggu", keperluan: "Acara pelantikan pengurus OSIS periode baru." },
  "pjm-003": { nama: "Sound System", tipe: "Inventaris", peminjam: "Bu Sari", kontak: "0821-9988-1122", tanggalPinjam: "10 Agu 2026", tanggalKembali: "12 Agu 2026", status: "Selesai", keperluan: "Acara perpisahan kelas 9." },
  "pjm-004": { nama: "Lapangan Basket", tipe: "Fasilitas", peminjam: "Pak Rudi", kontak: "0857-3344-5566", tanggalPinjam: "19 Agu 2026", tanggalKembali: "19 Agu 2026", status: "Dipinjam", keperluan: "Latihan tim basket untuk pertandingan antar sekolah." },
  "pjm-005": { nama: "Mikroskop", tipe: "Inventaris", peminjam: "Bu Dewi", kontak: "0878-1122-3344", tanggalPinjam: "5 Agu 2026", tanggalKembali: "6 Agu 2026", status: "Terlambat", keperluan: "Praktikum biologi kelas 8." },
  "pjm-006": { nama: "Lab Komputer", tipe: "Fasilitas", peminjam: "Pak Anwar", kontak: "0896-7788-9900", tanggalPinjam: "1 Agu 2026", tanggalKembali: "1 Agu 2026", status: "Selesai", keperluan: "Pelatihan komputer untuk staf TU." },
};

const statusStyle = {
  Menunggu: "text-amber-700 bg-amber-50 border-amber-200",
  Dipinjam: "text-blue-700 bg-blue-50 border-blue-200",
  Terlambat: "text-rose-700 bg-rose-50 border-rose-200",
  Selesai: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

const statusIcon = {
  Menunggu: { icon: Clock, tone: "text-amber-600 bg-amber-50" },
  Dipinjam: { icon: HandCoins, tone: "text-blue-600 bg-blue-50" },
  Terlambat: { icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
  Selesai: { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
};

const tipeIcon = {
  Inventaris: Package,
  Fasilitas: Building2,
};

export default function PeminjamanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const id = params?.id;
  const peminjaman = peminjamanData[id];

  const notifications = [
    { id: 1, title: "Peminjaman Mikroskop terlambat dikembalikan", desc: "Dikirim 1 jam lalu", read: false },
  ];

  if (!peminjaman) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          role="adminSarpras"
          active="peminjaman"
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
              <p className="text-sm text-slate-500">Peminjaman dengan id "{id}" tidak ditemukan.</p>
              <button
                onClick={() => router.push("/adminSarpras/peminjaman")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={14} />
                Kembali ke daftar peminjaman
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const s = statusIcon[peminjaman.status];
  const StatusIcon = s.icon;
  const TipeIcon = tipeIcon[peminjaman.tipe];

  const showApprovalActions = peminjaman.status === "Menunggu";
  const showKembalikanAction = peminjaman.status === "Dipinjam" || peminjaman.status === "Terlambat";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="peminjaman"
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
                onClick={() => router.push("/adminSarpras/peminjaman")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-3"
              >
                <ArrowLeft size={14} />
                Kembali ke Peminjaman
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Detail Peminjaman</p>
                  <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 mt-1 tracking-tight truncate">
                    {peminjaman.nama}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                    <TipeIcon size={14} className="flex-shrink-0" />
                    <span>{peminjaman.tipe}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full border flex-shrink-0 ${statusStyle[peminjaman.status]}`}>
                  {peminjaman.status}
                </span>
              </div>
            </div>

            {/* INFO CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="p-5 space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                    <StatusIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Keperluan</p>
                    <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{peminjaman.keperluan}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <User size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Peminjam</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{peminjaman.peminjam}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Phone size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Kontak</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{peminjaman.kontak}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Calendar size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Tgl Pinjam</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{peminjaman.tanggalPinjam}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Calendar size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Tgl Kembali</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{peminjaman.tanggalKembali}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              {(showApprovalActions || showKembalikanAction) && (
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                  {showApprovalActions && (
                    <>
                      <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-sm font-medium transition-colors">
                        <XCircle size={15} />
                        Tolak
                      </button>
                      <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors">
                        <CheckCircle2 size={15} />
                        Setujui Peminjaman
                      </button>
                    </>
                  )}
                  {showKembalikanAction && (
                    <button
                      onClick={() => router.push(`/adminSarpras/pengembalian/${id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
                    >
                      <CheckCircle2 size={15} />
                      Proses Pengembalian
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}