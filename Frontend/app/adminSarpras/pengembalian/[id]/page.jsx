"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  Undo2,
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Save,
} from "lucide-react";

// Dummy data pengembalian — biasanya di-fetch dari API pakai id (sumber sama dengan peminjaman).
const pengembalianData = {
  "pjm-001": { nama: "Proyektor Epson", tipe: "Inventaris", peminjam: "Pak Budi", kontak: "0812-3456-7890", tanggalPinjam: "18 Agu 2026", tanggalKembali: "22 Agu 2026", status: "Belum Dikembalikan", kondisiKembali: "", catatan: "" },
  "pjm-004": { nama: "Lapangan Basket", tipe: "Fasilitas", peminjam: "Pak Rudi", kontak: "0857-3344-5566", tanggalPinjam: "19 Agu 2026", tanggalKembali: "19 Agu 2026", status: "Belum Dikembalikan", kondisiKembali: "", catatan: "" },
  "pjm-005": { nama: "Mikroskop", tipe: "Inventaris", peminjam: "Bu Dewi", kontak: "0878-1122-3344", tanggalPinjam: "5 Agu 2026", tanggalKembali: "6 Agu 2026", status: "Terlambat", kondisiKembali: "", catatan: "" },
  "pjm-003": { nama: "Sound System", tipe: "Inventaris", peminjam: "Bu Sari", kontak: "0821-9988-1122", tanggalPinjam: "10 Agu 2026", tanggalKembali: "12 Agu 2026", status: "Sudah Dikembalikan", kondisiKembali: "Baik", catatan: "Dikembalikan tepat waktu, kondisi lengkap." },
  "pjm-006": { nama: "Lab Komputer", tipe: "Fasilitas", peminjam: "Pak Anwar", kontak: "0896-7788-9900", tanggalPinjam: "1 Agu 2026", tanggalKembali: "1 Agu 2026", status: "Sudah Dikembalikan", kondisiKembali: "Baik", catatan: "Ruangan bersih dan rapi." },
  "pjm-007": { nama: "Kursi Kayu (10 unit)", tipe: "Inventaris", peminjam: "Panitia 17-an", kontak: "0811-2233-4455", tanggalPinjam: "16 Agu 2026", tanggalKembali: "17 Agu 2026", status: "Sudah Dikembalikan", kondisiKembali: "Rusak Ringan", catatan: "2 unit kursi retak, sudah diperbaiki." },
};

const statusStyle = {
  "Belum Dikembalikan": "text-blue-700 bg-blue-50 border-blue-200",
  Terlambat: "text-rose-700 bg-rose-50 border-rose-200",
  "Sudah Dikembalikan": "text-emerald-700 bg-emerald-50 border-emerald-200",
};

const statusIcon = {
  "Belum Dikembalikan": { icon: Clock, tone: "text-blue-600 bg-blue-50" },
  Terlambat: { icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
  "Sudah Dikembalikan": { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
};

const tipeIcon = {
  Inventaris: Package,
  Fasilitas: Building2,
};

const kondisiOptions = ["Baik", "Rusak Ringan", "Rusak Berat"];

export default function PengembalianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const id = params?.id;
  const data = pengembalianData[id];

  const [kondisiKembali, setKondisiKembali] = useState(data?.kondisiKembali || kondisiOptions[0]);
  const [catatan, setCatatan] = useState(data?.catatan || "");
  const [saving, setSaving] = useState(false);

  const notifications = [
    { id: 1, title: "Peminjaman Mikroskop terlambat dikembalikan", desc: "Dikirim 1 jam lalu", read: false },
  ];

  if (!data) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          role="adminSarpras"
          active="pengembalian"
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
              <p className="text-sm text-slate-500">Data pengembalian dengan id "{id}" tidak ditemukan.</p>
              <button
                onClick={() => router.push("/adminSarpras/pengembalian")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={14} />
                Kembali ke daftar pengembalian
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const s = statusIcon[data.status];
  const StatusIcon = s.icon;
  const TipeIcon = tipeIcon[data.tipe];
  const sudahDikembalikan = data.status === "Sudah Dikembalikan";

  const handleKonfirmasi = async (e) => {
    e.preventDefault();
    setSaving(true);

    // TODO: ganti dengan pemanggilan API asli (POST /api/pengembalian/:id)
    await new Promise((resolve) => setTimeout(resolve, 600));

    setSaving(false);
    router.push("/adminSarpras/pengembalian");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="pengembalian"
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
          <div className="w-full max-w-3xl mx-auto space-y-6">

            {/* BACK + PAGE HEADER */}
            <div>
              <button
                onClick={() => router.push("/adminSarpras/pengembalian")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-3"
              >
                <ArrowLeft size={14} />
                Kembali ke Pengembalian
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Detail Pengembalian</p>
                  <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 mt-1 tracking-tight truncate">
                    {data.nama}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                    <TipeIcon size={14} className="flex-shrink-0" />
                    <span>{data.tipe}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full border flex-shrink-0 ${statusStyle[data.status]}`}>
                  {data.status}
                </span>
              </div>
            </div>

            {/* INFO PEMINJAMAN */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Informasi Peminjaman</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <User size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Peminjam</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{data.peminjam}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Phone size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Kontak</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{data.kontak}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Calendar size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Tgl Pinjam</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{data.tanggalPinjam}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                      <StatusIcon size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Jatuh Tempo</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{data.tanggalKembali}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM KONFIRMASI PENGEMBALIAN */}
            <form onSubmit={handleKonfirmasi} className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">
                  {sudahDikembalikan ? "Detail Pengembalian" : "Konfirmasi Pengembalian"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {sudahDikembalikan
                    ? "Barang/ruangan ini sudah dikembalikan."
                    : "Catat kondisi barang/ruangan saat dikembalikan."}
                </p>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Kondisi Saat Kembali</label>
                  <select
                    value={kondisiKembali}
                    onChange={(e) => setKondisiKembali(e.target.value)}
                    disabled={sudahDikembalikan}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    {kondisiOptions.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Catatan (opsional)</label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    disabled={sudahDikembalikan}
                    placeholder="Catatan tambahan tentang kondisi barang/ruangan..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              {!sudahDikembalikan && (
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => router.push("/adminSarpras/pengembalian")}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium shadow-sm transition-colors"
                  >
                    <Save size={16} />
                    {saving ? "Menyimpan..." : "Konfirmasi Dikembalikan"}
                  </button>
                </div>
              )}
            </form>

          </div>
        </main>
      </div>
    </div>
  );
}