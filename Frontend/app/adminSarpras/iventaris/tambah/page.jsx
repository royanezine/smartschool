"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  Package,
  ArrowLeft,
  Save,
  Tag,
  MapPin,
  Boxes,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  X,
} from "lucide-react";

const kategoriOptions = ["Furnitur", "Elektronik", "Alat Belajar", "Laboratorium"];
const kondisiOptions = ["Baik", "Rusak Ringan", "Rusak Berat"];

export default function TambahIventarisPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");

  const [form, setForm] = useState({
    nama: "",
    kategori: kategoriOptions[0],
    lokasi: "",
    stok: "",
    kondisi: kondisiOptions[0],
    deskripsi: "",
  });

  const notifications = [
    { id: 1, title: "Stok papan tulis menipis", desc: "Dikirim 3 jam lalu", read: false },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setFileName("");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // TODO: ganti dengan pemanggilan API asli (POST /api/iventaris)
    await new Promise((resolve) => setTimeout(resolve, 600));

    setSaving(false);
    router.push("/adminSarpras/iventaris");
  };

  const isValid = form.nama.trim() !== "" && form.lokasi.trim() !== "" && form.stok !== "";

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
        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <div className="w-full space-y-4 sm:space-y-6">

            {/* BACK + PAGE HEADER */}
            <div>
              <button
                onClick={() => router.push("/adminSarpras/iventaris")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-3"
              >
                <ArrowLeft size={14} />
                Kembali ke Inventaris
              </button>

              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Sarana & Prasarana</p>
              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-slate-900 mt-1 tracking-tight leading-snug">
                Tambah Inventaris
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Lengkapi form berikut untuk menambahkan barang inventaris baru.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              {/* Upload foto */}
                <div className="p-4 sm:p-5 border-b border-slate-100">
                <label className="block text-xs font-medium text-slate-500 mb-2">Foto Barang (opsional)</label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="foto-barang"
                />

                {previewUrl ? (
                    <div className="relative h-32 sm:h-40 lg:h-48 rounded-xl overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview barang" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                        <X size={14} />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[11px] px-2.5 py-1 truncate">
                        {fileName}
                    </span>
                    </div>
                ) : (
                    <label
                    htmlFor="foto-barang"
                    className="h-28 sm:h-36 lg:h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1.5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer"
                    >
                    <ImageIcon size={20} className="text-slate-300 sm:w-[22px] sm:h-[22px]" />
                    <span className="text-xs text-slate-400 text-center px-4">
                        Ketuk untuk pilih gambar
                    </span>
                    </label>
                )}
                </div>

              <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                {/* Nama Barang */}
                <div className="max-w-xl">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Nama Barang <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Package size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.nama}
                      onChange={(e) => handleChange("nama", e.target.value)}
                      placeholder="Contoh: Kursi Kayu"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Kategori + Kondisi + Lokasi -> 1 kolom di HP, 2 di tablet, 3 di desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {/* Kategori */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Kategori</label>
                    <div className="relative">
                      <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        value={form.kategori}
                        onChange={(e) => handleChange("kategori", e.target.value)}
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                      >
                        {kategoriOptions.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Kondisi */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Kondisi</label>
                    <div className="relative">
                      <select
                        value={form.kondisi}
                        onChange={(e) => handleChange("kondisi", e.target.value)}
                        className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                      >
                        {kondisiOptions.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Lokasi */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Lokasi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={form.lokasi}
                        onChange={(e) => handleChange("lokasi", e.target.value)}
                        placeholder="Contoh: Gudang A"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Stok -> field tunggal, dibatasi lebar supaya tidak melebar penuh di desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Jumlah Stok <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Boxes size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={form.stok}
                        onChange={(e) => handleChange("stok", e.target.value)}
                        placeholder="Contoh: 20"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Deskripsi (opsional)</label>
                <div className="relative">
                    <FileText size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <textarea
                    value={form.deskripsi}
                    onChange={(e) => handleChange("deskripsi", e.target.value)}
                    placeholder="Catatan tambahan tentang barang ini..."
                    rows={4}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none"
                    />
                </div>
                </div>
              </div>

              {/* ACTIONS — tombol full-width & ditumpuk di HP, sejajar mulai sm */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => router.push("/adminSarpras/iventaris")}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isValid || saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium shadow-sm transition-colors"
                >
                  <Save size={16} />
                  {saving ? "Menyimpan..." : "Simpan Barang"}
                </button>
              </div>
            </form>

          </div>
        </main>
      </div>
    </div>
  );
}