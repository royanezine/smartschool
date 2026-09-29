"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  Edit,
  RefreshCw,
  Printer,
  Layers,
  Crown,
  Zap,
  Star,
  CircleDollarSign,
  User,
  MoreHorizontal,
} from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { dummyLangganan } from "../../../../lib/data";
import { useState } from "react";

export default function DetailLanggananPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const langganan = dummyLangganan.find((item) => item.id === id);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu] = useState("langganan");
  const notifications = [
    { id: 1, title: "Pembaruan Sistem v2.0", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Pengingat: Backup Data", desc: "Dikirim 1 hari lalu", read: false },
  ];

  if (!langganan) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="p-4 rounded-full bg-slate-100 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <Package size={32} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-700">Langganan tidak ditemukan</h2>
          <p className="text-sm text-slate-400 mt-1">Data langganan yang Anda cari tidak tersedia</p>
          <button
            onClick={() => router.push("/super-admin/langgananSekolah")}
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
          >
            Kembali ke Daftar Langganan
          </button>
        </div>
      </div>
    );
  }

  const statusLanggananColorMap = {
    aktif: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    trial: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
    nonaktif: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  };
  const statusPembayaranColorMap = {
    lunas: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    gagal: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  };

  const statusStyle = statusLanggananColorMap[langganan.statusLangganan] || statusLanggananColorMap.nonaktif;
  const paymentStyle = statusPembayaranColorMap[langganan.statusPembayaran] || statusPembayaranColorMap.pending;
  const PaketIcon = langganan.paket.icon || Package;

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRupiah = (angka) => {
    if (!angka) return "Rp0";
    return "Rp" + angka.toLocaleString("id-ID");
  };

  const getStatusLanggananLabel = (status) => {
    const map = { aktif: "Aktif", trial: "Trial", nonaktif: "Nonaktif" };
    return map[status] || status;
  };

  const getStatusPembayaranLabel = (status) => {
    const map = { lunas: "Lunas", pending: "Pending", gagal: "Gagal" };
    return map[status] || status;
  };

  // Hitung sisa hari
  const sisaHari = Math.ceil((new Date(langganan.tanggalBerakhir) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    // Pola wrapper disamakan persis dengan halaman Profil/Pengumuman/Dashboard/Langganan Sekolah:
    // min-h-screen (bukan h-screen + overflow-hidden) di wrapper luar,
    // dan main tanpa overflow-y-auto (p-4 sm:p-6 lg:p-8) supaya sidebar mengikuti
    // tinggi konten halaman dan konsisten saat responsive/zoom.
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        active={activeMenu}
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Sarah", email: "sarah@smartschool.com", avatar: "SA" }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-5 sm:space-y-6">

            {/* Tombol Kembali */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>

            {/* Header Detail */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                    {langganan.sekolah.logo}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">{langganan.sekolah.nama}</h1>
                    <p className="text-sm text-slate-500 font-mono">ID: {langganan.id}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1.5`} />
                    {getStatusLanggananLabel(langganan.statusLangganan)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${paymentStyle.bg} ${paymentStyle.text} ${paymentStyle.border}`}>
                    {getStatusPembayaranLabel(langganan.statusPembayaran)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-slate-600">Paket: <span className="font-medium text-slate-800">{langganan.paket.nama}</span></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">Siklus: <span className="font-medium text-slate-800">{langganan.siklusPenagihan === "bulan" ? "Bulanan" : "Tahunan"}</span></span>
                {sisaHari > 0 && sisaHari <= 30 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    ⚠ Akan berakhir dalam {sisaHari} hari
                  </span>
                )}
              </div>
            </div>

            {/* Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informasi Sekolah */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Building2 size={16} />
                  </span>
                  Informasi Sekolah
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{langganan.sekolah.alamat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600">{langganan.sekolah.telepon || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600">{langganan.sekolah.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-slate-600">Subdomain: <span className="font-mono">{langganan.sekolah.subdomain}</span></span>
                  </div>
                </div>
              </div>

              {/* Detail Paket */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <Package size={16} />
                  </span>
                  Paket Langganan
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                      <PaketIcon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{langganan.paket.nama}</p>
                      <p className="text-slate-600">{formatRupiah(langganan.hargaSaatBerlangganan)} / {langganan.siklusPenagihan === "bulan" ? "bulan" : "tahun"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400">Mulai</span>
                      <p className="font-medium text-slate-700">{formatTanggal(langganan.tanggalMulai)}</p>
                    </div>
                    <span className="text-slate-300">→</span>
                    <div>
                      <span className="text-xs text-slate-400">Berakhir</span>
                      <p className="font-medium text-slate-700">{formatTanggal(langganan.tanggalBerakhir)}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-xs text-slate-400">Sisa</span>
                      <p className="font-medium text-slate-700">{sisaHari > 0 ? `${sisaHari} hari` : "Expired"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fitur Aktif */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Layers size={16} />
                </span>
                Fitur Aktif
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {langganan.fiturAktif && langganan.fiturAktif.length > 0 ? (
                  langganan.fiturAktif.map((fitur, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                      {fitur}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">Tidak ada fitur aktif</span>
                )}
              </div>
            </div>

            {/* Riwayat Pembayaran */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <CreditCard size={16} />
                </span>
                Riwayat Pembayaran
              </h3>
              {langganan.riwayatPembayaran && langganan.riwayatPembayaran.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200/60">
                        <th className="py-2 text-left font-medium">Invoice</th>
                        <th className="py-2 text-left font-medium">Tanggal</th>
                        <th className="py-2 text-left font-medium">Jumlah</th>
                        <th className="py-2 text-left font-medium">Metode</th>
                        <th className="py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {langganan.riwayatPembayaran.map((pay, idx) => (
                        <tr key={pay.id} className="border-b border-slate-100/80 last:border-0">
                          <td className="py-2 font-mono text-slate-600">INV-{String(idx + 1).padStart(3, '0')}</td>
                          <td className="py-2 text-slate-600">{formatTanggal(pay.dibuatPada)}</td>
                          <td className="py-2 font-medium text-slate-700">{formatRupiah(pay.jumlah)}</td>
                          <td className="py-2 text-slate-500">{pay.metode || "-"}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              pay.status === "sukses" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                              pay.status === "gagal" ? "bg-rose-50 text-rose-600 border border-rose-200" :
                              "bg-amber-50 text-amber-600 border border-amber-200"
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">Belum ada riwayat pembayaran</p>
              )}
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
              <button
                onClick={() => router.back()}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => router.push(`/super-admin/langgananSekolah/edit/${langganan.id}`)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
              >
                <Edit size={16} />
                Edit Langganan
              </button>
              <button
                onClick={() => alert("Fitur perpanjangan akan segera hadir")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm hover:shadow"
              >
                <RefreshCw size={16} />
                Perpanjang
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}