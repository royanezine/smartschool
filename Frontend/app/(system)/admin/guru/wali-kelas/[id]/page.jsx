"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import {
  ArrowLeft,
  UserCheck,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Phone,
  Mail,
  ClipboardList,
  School,
  Hash,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

/**
 * app/admin/guru/wali-kelas/[id]/page.jsx
 *
 * Halaman Detail Wali Kelas — dibuka lewat klik "Detail" dari daftar.
 * Menampilkan data lengkap satu wali kelas berdasarkan [id] di URL, dengan
 * aksi Ubah (ke /wali-kelas/[id]/edit), Nonaktifkan/Aktifkan, dan Hapus.
 *
 * CATATAN DATA:
 * MOCK_WALIKELAS di sini masih salinan dummy yang sama dengan halaman
 * daftar, supaya halaman ini bisa langsung dibuka lewat URL tanpa lewat
 * klik dari daftar dulu. Begitu backend API tersedia, ganti dengan fetch
 * detail wali kelas berdasarkan id (mis. getWaliKelasById(id)), dan
 * sambungkan toggle status / hapus ke endpoint terkait.
 */

const MOCK_WALIKELAS = [
  {
    id: 1,
    kelas: "7A",
    jenjang: "VII",
    waliKelas: "Siti Rahayu, S.Pd",
    nip: "198501152010012001",
    telp: "0812-3456-7890",
    email: "sarah.amelia@smartschool.sch.id",
    jumlahSiswa: 32,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Alya Ramadhani", "Bunga Citra Lestari", "Cahyo Nugroho", "Dimas Prasetyo"],
  },
  {
    id: 2,
    kelas: "7B",
    jenjang: "VII",
    waliKelas: "Andi Prasetyo, S.Pd",
    nip: "198712052012011002",
    telp: "0857-1122-3344",
    email: "andi.prasetyo@smartschool.sch.id",
    jumlahSiswa: 30,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Eka Wulandari", "Fajar Setiawan", "Gilang Ramadhan", "Hana Permatasari"],
  },
  {
    id: 3,
    kelas: "8A",
    jenjang: "VIII",
    waliKelas: "Dewi Anggraini, S.Si",
    nip: "199002202015022004",
    telp: "0821-9988-7766",
    email: "dewi.anggraini@smartschool.sch.id",
    jumlahSiswa: 31,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Indra Kusuma", "Julia Anggraeni", "Krisna Aditya", "Larasati Dewi"],
  },
  {
    id: 4,
    kelas: "8B",
    jenjang: "VIII",
    waliKelas: "Nina Kartika, S.Sn",
    nip: "199105182018022005",
    telp: "0878-5566-7788",
    email: "nina.kartika@smartschool.sch.id",
    jumlahSiswa: 29,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Muhammad Fadli", "Naila Zahra", "Oka Wijaya", "Putri Ayuningtyas"],
  },
  {
    id: 5,
    kelas: "9A",
    jenjang: "IX",
    waliKelas: "Budi Santoso, S.Pd",
    nip: "197803102005011003",
    telp: "0813-2233-4455",
    email: "budi.santoso@smartschool.sch.id",
    jumlahSiswa: 28,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Reza Firmansyah", "Salsabila Putri", "Taufik Hidayat", "Umi Kalsum"],
  },
  {
    id: 6,
    kelas: "9B",
    jenjang: "IX",
    waliKelas: "Rudi Hartono, S.Pd",
    nip: "198309252008011006",
    telp: "0896-4433-2211",
    email: "rudi.hartono@smartschool.sch.id",
    jumlahSiswa: 27,
    tahunAjaran: "2024/2025",
    status: "nonaktif",
    siswa: ["Vino Bastian", "Wulan Sari", "Yoga Pratama", "Zahra Aulia"],
  },
];

function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }) {
  const isActive = status === "aktif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export default function DetailWaliKelasPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Data lokal supaya toggle status langsung terlihat di halaman ini.
  const [wali, setWali] = useState(MOCK_WALIKELAS);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const data = useMemo(() => wali.find((w) => String(w.id) === id) || null, [wali, id]);

  function handleToggleStatus() {
    setWali((prev) =>
      prev.map((w) => (String(w.id) === id ? { ...w, status: w.status === "aktif" ? "nonaktif" : "aktif" } : w))
    );
  }

  function handleDelete() {
    // TODO: sambungkan ke endpoint deleteWaliKelas(id) kalau API sudah ada.
    console.log("Hapus wali kelas id:", id);
    setConfirmDelete(false);
    router.push("/admin/guru/wali-kelas");
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar
        active="guruWaliKelas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/guru/wali-kelas")}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
                title="Kembali ke daftar wali kelas"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-slate-900/10 shrink-0">
                <UserCheck size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">Detail Wali Kelas</h1>
                <p className="text-sm text-slate-500">
                  Informasi lengkap penugasan wali kelas{data ? ` untuk kelas ${data.kelas}` : ""}.
                </p>
              </div>
            </div>

            {/* NOT FOUND */}
            {!data && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50">
                <AlertCircle size={20} className="text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-800">Data wali kelas tidak ditemukan</p>
                  <p className="text-sm text-rose-700 mt-1">
                    Wali kelas dengan id "{id}" tidak ada atau sudah dihapus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/guru/wali-kelas")}
                  className="text-sm font-medium text-rose-700 hover:text-rose-900"
                >
                  Kembali ke daftar
                </button>
              </div>
            )}

            {data && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* KARTU UTAMA */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] px-6 py-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      {getInitials(data.waliKelas)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/80 text-xs">Wali Kelas {data.kelas}</p>
                      <p className="font-bold text-white text-xl leading-tight truncate">{data.waliKelas}</p>
                      <div className="mt-1.5">
                        <StatusBadge status={data.status} />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* INFO DASAR */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                          <Hash size={12} />
                          NIP
                        </p>
                        <p className="font-mono text-sm text-slate-800 mt-1">{data.nip}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                          <School size={12} />
                          Jenjang
                        </p>
                        <p className="text-sm text-slate-800 mt-1">Kelas {data.jenjang}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                          <School size={12} />
                          Tahun Ajaran
                        </p>
                        <p className="text-sm text-slate-800 mt-1">{data.tahunAjaran}</p>
                      </div>
                    </div>

                    {/* KONTAK */}
                    <div className="border-t border-slate-100 pt-5 space-y-2.5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Kontak</p>
                      <div className="flex items-center gap-2.5 text-sm text-slate-700">
                        <Phone size={14} className="text-[#155DFC] flex-shrink-0" />
                        {data.telp}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-700">
                        <Mail size={14} className="text-[#155DFC] flex-shrink-0" />
                        {data.email}
                      </div>
                    </div>

                    {/* SISWA BINAAN */}
                    <div className="border-t border-slate-100 pt-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          <ClipboardList size={14} className="text-[#155DFC]" />
                          Siswa Binaan
                        </p>
                        <span className="text-xs font-medium text-slate-400">{data.jumlahSiswa} siswa</span>
                      </div>
                      <div className="space-y-1.5">
                        {data.siswa.map((nama, i) => (
                          <div
                            key={nama}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#f5f8ff] border border-slate-100 text-sm text-slate-700"
                          >
                            <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-400 flex-shrink-0">
                              {i + 1}
                            </span>
                            {nama}
                          </div>
                        ))}
                        {data.siswa.length === 0 && (
                          <p className="text-xs text-slate-400 text-center py-2">Belum ada data siswa binaan.</p>
                        )}
                        {data.jumlahSiswa > data.siswa.length && (
                          <p className="text-xs text-slate-400 text-center pt-1">
                            +{data.jumlahSiswa - data.siswa.length} siswa lainnya
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/guru/wali-kelas/${data.id}/edit`)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#155DFC] hover:bg-[#0d47c9] text-white rounded-xl transition-all shadow-sm font-medium text-sm"
                    >
                      <Pencil size={16} />
                      Ubah Data
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        data.status === "aktif"
                          ? "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200"
                          : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                      }`}
                    >
                      {data.status === "aktif" ? <PowerOff size={16} /> : <Power size={16} />}
                      {data.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>

                {/* PANEL KANAN: RINGKASAN */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ringkasan</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">Kelas</span>
                        <span className="font-semibold text-slate-800">{data.kelas}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">Jumlah Siswa</span>
                        <span className="font-semibold text-slate-800">{data.jumlahSiswa} siswa</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">Status</span>
                        <StatusBadge status={data.status} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {confirmDelete && data && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} />
              </div>
              <p className="font-bold text-slate-800">Hapus Wali Kelas?</p>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Data wali kelas <span className="font-semibold text-slate-700">{data.waliKelas}</span> untuk kelas{" "}
              <span className="font-semibold text-slate-700">{data.kelas}</span> akan dihapus secara permanen.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}