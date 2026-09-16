"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Save,
  X,
  ArrowLeft,
  Megaphone,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  Send,
  CalendarClock,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function TambahPengumumanPage() {
  const router = useRouter();

  const [active, setActive] = useState("pengumuman");
  const [collapsed, setCollapsed] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    kategori: "",
    konten: "",
    status: "draft",
    tanggal: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.judul.trim()) newErrors.judul = "Judul wajib diisi";
    if (!form.konten.trim()) newErrors.konten = "Konten wajib diisi";
    if (form.status === "scheduled" && !form.tanggal) {
      newErrors.tanggal = "Waktu terbit wajib diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Pengumuman berhasil disimpan!");
      router.push("/cmsAdmin/pengumuman");
    }, 1500);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4" />;
      case "scheduled":
        return <CalendarClock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published":
        return "Publikasikan Sekarang";
      case "scheduled":
        return "Jadwalkan Nanti";
      default:
        return "Draft";
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Tambah Pengumuman"
          user={{ name: "Admin" }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 bg-white">
          <div className="w-full min-w-0 max-w-6xl mx-auto space-y-6">

            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <a href="/cmsAdmin" className="hover:text-blue-700 transition">Dashboard</a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <a href="/cmsAdmin/pengumuman" className="hover:text-blue-700 transition">Pengumuman</a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-blue-700 font-semibold truncate">Tambah Baru</span>
            </nav>

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700 transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="shrink-0 p-3 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-800 text-white shadow-lg shadow-blue-200/50">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                    <Sparkles className="w-3 h-3" />
                    CMS Website
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Buat Pengumuman Baru</h1>
                  <p className="text-sm text-slate-500 mt-1">Isi informasi pengumuman yang akan ditampilkan</p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="w-full min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* MAIN FORM - 2/3 width */}
                <div className="lg:col-span-2 w-full min-w-0 space-y-5">
                  {/* JUDUL */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Judul Pengumuman <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Megaphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={form.judul}
                        onChange={(e) => setForm({ ...form, judul: e.target.value })}
                        placeholder="Contoh: Libur Akhir Semester Ganjil"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                          errors.judul
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        }`}
                      />
                    </div>
                    {errors.judul && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.judul}
                      </p>
                    )}
                  </div>

                  {/* KONTEN */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Konten Pengumuman <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={8}
                        value={form.konten}
                        onChange={(e) => setForm({ ...form, konten: e.target.value })}
                        placeholder="Tulis isi pengumuman di sini..."
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-y min-h-[180px] ${
                          errors.konten
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        }`}
                      />
                    </div>
                    {errors.konten && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.konten}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      {form.konten.length} karakter
                    </p>
                  </div>
                </div>

                {/* SIDEBAR FORM - 1/3 width */}
                <div className="lg:col-span-1 w-full min-w-0 space-y-5">
                  {/* KATEGORI */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Kategori
                    </label>
                    <select
                      value={form.kategori}
                      onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394758B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_12px_center] bg-no-repeat pr-10"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Akademik">Akademik</option>
                      <option value="Kegiatan">Kegiatan</option>
                      <option value="PPDB">PPDB</option>
                      <option value="Lomba">Lomba</option>
                      <option value="Info">Info Sekolah</option>
                    </select>
                  </div>

                  {/* STATUS */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Status
                    </label>
                    <div className="space-y-2">
                      {["draft", "published", "scheduled"].map((status) => (
                        <label
                          key={status}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            form.status === status
                              ? "border-blue-500 bg-blue-50/50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={form.status === status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-4 h-4 text-blue-700 focus:ring-blue-500 focus:ring-offset-0 accent-blue-700"
                          />
                          <div className="flex items-center gap-2 min-w-0">
                            {getStatusIcon(status)}
                            <span className="text-sm font-medium text-slate-700">
                              {getStatusLabel(status)}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* TANGGAL (jika scheduled) */}
                  {form.status === "scheduled" && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Waktu Terbit
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="datetime-local"
                          value={form.tanggal}
                          onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-slate-800 outline-none transition-all ${
                            errors.tanggal
                              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                              : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          }`}
                        />
                      </div>
                      {errors.tanggal && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.tanggal}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="w-full min-w-0 mt-6 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 text-white text-sm font-semibold shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Pengumuman
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* FOOTER */}
            <footer className="pt-4 border-t border-slate-200/60 text-center text-xs text-slate-400">
              © 2026 SmartSchool CMS • Pengumuman
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}