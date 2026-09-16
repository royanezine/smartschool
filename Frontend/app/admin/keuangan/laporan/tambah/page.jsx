"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

// Import data dummy untuk ditambahkan
import { DUMMY_DATA } from "../page"; // atau definisikan ulang

export default function TambahLaporanPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    deskripsi: "",
    kategori: "Pemasukan",
    jumlah: "",
    metode: "Transfer",
    status: "Lunas",
  });

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Validasi
    if (!formData.tanggal) {
      setError("Tanggal harus diisi");
      setSaving(false);
      return;
    }
    if (!formData.deskripsi.trim()) {
      setError("Deskripsi harus diisi");
      setSaving(false);
      return;
    }
    if (!formData.jumlah || parseInt(formData.jumlah) <= 0) {
      setError("Jumlah harus diisi dengan angka positif");
      setSaving(false);
      return;
    }

    setTimeout(() => {
      // Tambahkan ke DUMMY_DATA
      const newId = DUMMY_DATA.length > 0
        ? Math.max(...DUMMY_DATA.map((d) => d.id)) + 1
        : 1;

      DUMMY_DATA.push({
        id: newId,
        tanggal: formData.tanggal,
        deskripsi: formData.deskripsi,
        kategori: formData.kategori,
        jumlah: parseInt(formData.jumlah),
        metode: formData.metode,
        status: formData.status,
      });

      setSuccess("✅ Transaksi berhasil ditambahkan!");
      setSaving(false);

      setTimeout(() => {
        router.push("/laporan-keuangan");
      }, 1500);
    }, 1000);
  };

  const handleCancel = () => {
    router.push("/laporan-keuangan");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="laporanKeuangan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCancel}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                    Tambah Transaksi
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Tambah Transaksi Baru
                  </h1>
                  <p className="mt-1 text-sm text-slate-300">
                    Masukkan data transaksi keuangan baru
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                  <CheckCircle size={20} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                {/* Tanggal */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Tanggal Transaksi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                      required
                    />
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      placeholder="Masukkan deskripsi transaksi"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                      required
                    />
                  </div>
                </div>

                {/* Kategori & Jumlah */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                    >
                      <option value="Pemasukan">📈 Pemasukan</option>
                      <option value="Pengeluaran">📉 Pengeluaran</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Jumlah (Rp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        name="jumlah"
                        value={formData.jumlah}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Metode & Status */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Metode Pembayaran
                    </label>
                    <div className="relative">
                      <CreditCard
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <select
                        name="metode"
                        value={formData.metode}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                      >
                        <option value="Transfer">💳 Transfer</option>
                        <option value="Tunai">💵 Tunai</option>
                        <option value="Kartu Kredit">💳 Kartu Kredit</option>
                        <option value="E-Wallet">📱 E-Wallet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                    >
                      <option value="Lunas">✅ Lunas</option>
                      <option value="Pending">⏳ Pending</option>
                      <option value="Batal">❌ Batal</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  <p className="text-xs text-slate-400">
                    * Field bertanda wajib diisi
                  </p>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <XCircle size={18} />
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0d47c9] disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Tambah Transaksi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <footer className="mt-8 border-t border-slate-200/50 pt-6 text-center text-xs text-slate-400">
              © 2026 SmartSchool • Tambah Laporan Keuangan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}