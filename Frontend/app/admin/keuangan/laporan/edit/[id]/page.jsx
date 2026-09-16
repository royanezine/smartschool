"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Calendar,
  CreditCard,
  Wallet,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

// Data dummy (sama dengan data di halaman utama)
// Dalam aplikasi nyata, ini akan diambil dari API / database
const DUMMY_DATA = [
  {
    id: 1,
    tanggal: "2026-09-01",
    deskripsi: "Pembayaran SPP Siswa",
    kategori: "Pemasukan",
    jumlah: 12500000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 2,
    tanggal: "2026-09-02",
    deskripsi: "Pembelian Alat Tulis",
    kategori: "Pengeluaran",
    jumlah: 2350000,
    metode: "Tunai",
    status: "Lunas",
  },
  {
    id: 3,
    tanggal: "2026-09-03",
    deskripsi: "Gaji Guru Bulan Agustus",
    kategori: "Pengeluaran",
    jumlah: 35000000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 4,
    tanggal: "2026-09-05",
    deskripsi: "Donasi BOS",
    kategori: "Pemasukan",
    jumlah: 5000000,
    metode: "Transfer",
    status: "Pending",
  },
  {
    id: 5,
    tanggal: "2026-09-06",
    deskripsi: "Biaya Listrik",
    kategori: "Pengeluaran",
    jumlah: 1800000,
    metode: "Tunai",
    status: "Lunas",
  },
  {
    id: 6,
    tanggal: "2026-09-07",
    deskripsi: "SPP Siswa",
    kategori: "Pemasukan",
    jumlah: 8000000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 7,
    tanggal: "2026-09-08",
    deskripsi: "Pembelian Komputer",
    kategori: "Pengeluaran",
    jumlah: 12000000,
    metode: "Transfer",
    status: "Pending",
  },
];

export default function EditLaporanPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    tanggal: "",
    deskripsi: "",
    kategori: "Pemasukan",
    jumlah: "",
    metode: "Transfer",
    status: "Lunas",
  });

  // Data transaksi asli (untuk referensi)
  const [originalData, setOriginalData] = useState(null);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // =============================================================
  // LOAD DATA
  // =============================================================
  useEffect(() => {
    // Cari data berdasarkan ID
    const found = DUMMY_DATA.find((item) => item.id === id);

    if (found) {
      setOriginalData(found);
      setFormData({
        tanggal: found.tanggal,
        deskripsi: found.deskripsi,
        kategori: found.kategori,
        jumlah: found.jumlah.toString(),
        metode: found.metode,
        status: found.status,
      });
      setLoading(false);
    } else {
      // Data tidak ditemukan
      setError("Transaksi tidak ditemukan");
      setLoading(false);
    }
  }, [id]);

  // =============================================================
  // HANDLER: Perubahan form
  // =============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Hapus pesan error/success saat user mengetik
    setError("");
    setSuccess("");
  };

  // =============================================================
  // HANDLER: Submit / Update
  // =============================================================
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

    // Simulasi proses update (delay 1 detik)
    setTimeout(() => {
      // Di sini Anda bisa update state global, panggil API, atau simpan ke database
      // Untuk demo, kita hanya tampilkan pesan sukses

      setSuccess("✅ Transaksi berhasil diperbarui!");

      // Update data di DUMMY_DATA (sebagai simulasi)
      const index = DUMMY_DATA.findIndex((item) => item.id === id);
      if (index !== -1) {
        DUMMY_DATA[index] = {
          ...DUMMY_DATA[index],
          tanggal: formData.tanggal,
          deskripsi: formData.deskripsi,
          kategori: formData.kategori,
          jumlah: parseInt(formData.jumlah),
          metode: formData.metode,
          status: formData.status,
        };
      }

      setSaving(false);

      // Redirect ke halaman utama setelah 1.5 detik
      setTimeout(() => {
        router.push("/laporan-keuangan");
      }, 1500);
    }, 1000);
  };

  // =============================================================
  // HANDLER: Hapus transaksi
  // =============================================================
  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      // Hapus dari DUMMY_DATA
      const index = DUMMY_DATA.findIndex((item) => item.id === id);
      if (index !== -1) {
        DUMMY_DATA.splice(index, 1);
      }
      router.push("/laporan-keuangan");
    }
  };

  // =============================================================
  // HANDLER: Batal / Kembali
  // =============================================================
  const handleCancel = () => {
    router.push("/keuangan");
  };

  // =============================================================
  // RENDER: Loading
  // =============================================================
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#155DFC] border-t-transparent"></div>
          <p className="text-sm text-slate-500">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: Error (data tidak ditemukan)
  // =============================================================
  if (error && !originalData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-red-700">
            Transaksi Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm text-red-600">
            Data transaksi dengan ID #{id} tidak ditemukan.
          </p>
          <button
            onClick={() => router.push("/keuangan/laporan")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d47c9]"
          >
            <ArrowLeft size={16} />
            Kembali ke Laporan
          </button>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: Form Edit
  // =============================================================
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
            {/* =========================================================
                HEADER
            ========================================================= */}
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
                    Edit Transaksi
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Edit Detail Transaksi
                  </h1>
                  <p className="mt-1 text-sm text-slate-300">
                    ID #{id} • {originalData?.deskripsi}
                  </p>
                </div>
              </div>
            </div>

            {/* =========================================================
                FORM
            ========================================================= */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notifikasi */}
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

              {/* Grid Form */}
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
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
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

                {/* Kategori & Jumlah (2 kolom) */}
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

                {/* Metode & Status (2 kolom) */}
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

                {/* Informasi tambahan */}
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  <p>
                    <span className="font-medium text-slate-700">ID Transaksi:</span> #{id}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    * Field bertanda wajib diisi
                  </p>
                </div>
              </div>

              {/* =========================================================
                  BUTTONS
              ========================================================= */}
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
                    className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0d47c9] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={18} />
                  Hapus Transaksi
                </button>
              </div>
            </form>

            {/* =========================================================
                FOOTER
            ========================================================= */}
            <footer className="mt-8 border-t border-slate-200/50 pt-6 text-center text-xs text-slate-400">
              © 2026 SmartSchool • Edit Laporan Keuangan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}