"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";
import { THEME_CLASSES } from "../../../../../../lib/constants/theme";

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

  const [formData, setFormData] = useState({
    tanggal: "",
    deskripsi: "",
    kategori: "Pemasukan",
    jumlah: "",
    metode: "Transfer",
    status: "Lunas",
  });

  const [originalData, setOriginalData] = useState(null);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // =============================================================
  // LOAD DATA
  // =============================================================
  useEffect(() => {
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
      setSuccess("Transaksi berhasil diperbarui!");

      const index = DUMMY_DATA.findIndex(
        (item) => item.id === id
      );

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

      setTimeout(() => {
        router.push("/laporan-keuangan");
      }, 1500);
    }, 1000);
  };

  // =============================================================
  // HANDLER: Hapus transaksi
  // =============================================================
  const handleDelete = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus transaksi ini?"
      )
    ) {
      const index = DUMMY_DATA.findIndex(
        (item) => item.id === id
      );

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
      <div className={`${THEME_CLASSES.page} flex h-screen w-full items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">

          <div className="theme-loading-spinner h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />

          <p className={`${THEME_CLASSES.textMuted} text-sm`}>
            Memuat data transaksi...
          </p>

        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: Error
  // =============================================================
  if (error && !originalData) {
    return (
      <div className={`${THEME_CLASSES.page} flex h-screen w-full items-center justify-center`}>
        <div className={`${THEME_CLASSES.danger} max-w-md rounded-2xl border p-8 text-center`}>

          <AlertCircle
            size={48}
            className="mx-auto"
          />

          <h2 className={`${THEME_CLASSES.text} mt-4 text-xl font-bold`}>
            Transaksi Tidak Ditemukan
          </h2>

          <p className={`${THEME_CLASSES.textSecondary} mt-2 text-sm`}>
            Data transaksi dengan ID #{id} tidak ditemukan.
          </p>

          <button
            onClick={() =>
              router.push("/keuangan/laporan")
            }
            className={`${THEME_CLASSES.primary} mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition`}
          >
            <ArrowLeft size={16} />
            Kembali ke Laporan
          </button>

        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: FORM EDIT
  // =============================================================
  return (
    <div className={`${THEME_CLASSES.page} flex h-screen w-full overflow-hidden`}>

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

        <main className={`${THEME_CLASSES.page} min-h-0 flex-1 overflow-y-auto overflow-x-hidden`}>

          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">

            {/* =========================================================
                HEADER
            ========================================================= */}
            <div className="theme-header-panel mb-6 flex flex-col gap-4 rounded-2xl p-6 sm:p-8">

              <div className="flex items-center gap-4">

                <button
                  onClick={handleCancel}
                  className="theme-header-action flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition"
                >
                  <ArrowLeft size={24} />
                </button>

                <div>

                  <p className="theme-text-primary text-xs font-semibold uppercase tracking-wider">
                    Edit Transaksi
                  </p>

                  <h1 className="theme-header-title text-2xl font-bold tracking-tight sm:text-3xl">
                    Edit Detail Transaksi
                  </h1>

                  <p className="theme-header-description mt-1 text-sm">
                    ID #{id} • {originalData?.deskripsi}
                  </p>

                </div>

              </div>
            </div>

            {/* =========================================================
                FORM
            ========================================================= */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* NOTIFIKASI ERROR */}
              {error && (
                <div className={`${THEME_CLASSES.danger} flex items-start gap-3 rounded-xl border p-4`}>

                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm">
                    {error}
                  </p>

                </div>
              )}

              {/* NOTIFIKASI SUCCESS */}
              {success && (
                <div className={`${THEME_CLASSES.success} flex items-start gap-3 rounded-xl border p-4`}>

                  <CheckCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm">
                    {success}
                  </p>

                </div>
              )}

              {/* =========================================================
                  GRID FORM
              ========================================================= */}
              <div className={`${THEME_CLASSES.card} grid grid-cols-1 gap-5 rounded-2xl border p-6 shadow-sm sm:p-8`}>

                {/* TANGGAL */}
                <div>

                  <label className={`${THEME_CLASSES.textSecondary} mb-1.5 block text-sm font-medium`}>
                    Tanggal Transaksi{" "}
                    <span className="theme-text-danger">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <Calendar
                      size={18}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      className={`${THEME_CLASSES.input} theme-focus-primary w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition`}
                      required
                    />

                  </div>
                </div>

                {/* DESKRIPSI */}
                <div>

                  <label className={`${THEME_CLASSES.textSecondary} mb-1.5 block text-sm font-medium`}>
                    Deskripsi{" "}
                    <span className="theme-text-danger">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <FileText
                      size={18}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      placeholder="Masukkan deskripsi transaksi"
                      className={`${THEME_CLASSES.input} theme-focus-primary w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition`}
                      required
                    />

                  </div>
                </div>

                {/* KATEGORI & JUMLAH */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>

                    <label className={`${THEME_CLASSES.textSecondary} mb-1.5 block text-sm font-medium`}>
                      Kategori{" "}
                      <span className="theme-text-danger">
                        *
                      </span>
                    </label>

                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      className={`${THEME_CLASSES.input} theme-focus-primary w-full rounded-xl px-4 py-2.5 text-sm outline-none transition`}
                    >
                      <option value="Pemasukan">
                        📈 Pemasukan
                      </option>

                      <option value="Pengeluaran">
                        📉 Pengeluaran
                      </option>
                    </select>

                  </div>

                  <div>

                    <label className={`${THEME_CLASSES.textSecondary} mb-1.5 block text-sm font-medium`}>
                      Jumlah (Rp){" "}
                      <span className="theme-text-danger">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <span className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2">
                        Rp
                      </span>

                      <input
                        type="number"
                        name="jumlah"
                        value={formData.jumlah}
                        onChange={handleChange}
                        placeholder="0"
                        className={`${THEME_CLASSES.input} theme-focus-primary w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition`}
                        required
                        min="1"
                      />

                    </div>
                  </div>

                </div>

                {/* METODE & STATUS */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>

                    <label className={`${THEME_CLASSES.textSecondary} mb-1.5 block text-sm font-medium`}>
                      Metode Pembayaran
                    </label>

                    <div className="relative">

                      <CreditCard
                        size={18}
                        className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                      />

                      <select
                        name="metode"
                        value={formData.metode}
                        onChange={handleChange}
                        className={`${THEME_CLASSES.input} theme-focus-primary w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition`}
                      >
                        <option value="Transfer">
                          💳 Transfer
                        </option>

                        <option value="Tunai">
                          💵 Tunai
                        </option>

                        <option value="Kartu Kredit">
                          💳 Kartu Kredit
                        </option>

                        <option value="E-Wallet">
                          📱 E-Wallet
                        </option>
                      </select>

                    </div>
                  </div>

                  <div>

                    <label className={`${THEME_CLASSES.textSecondary} mb-1.5 block text-sm font-medium`}>
                      Status
                    </label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`${THEME_CLASSES.input} theme-focus-primary w-full rounded-xl px-4 py-2.5 text-sm outline-none transition`}
                    >
                      <option value="Lunas">
                        ✅ Lunas
                      </option>

                      <option value="Pending">
                        ⏳ Pending
                      </option>

                      <option value="Batal">
                        ❌ Batal
                      </option>
                    </select>

                  </div>

                </div>

                {/* INFORMASI TAMBAHAN */}
                <div className={`${THEME_CLASSES.cardSoft} rounded-xl border p-4 text-sm`}>

                  <p className={THEME_CLASSES.textSecondary}>
                    <span className="font-medium">
                      ID Transaksi:
                    </span>{" "}
                    #{id}
                  </p>

                  <p className={`${THEME_CLASSES.textMuted} mt-1 text-xs`}>
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
                    className={`${THEME_CLASSES.input} theme-input-hover inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition`}
                  >
                    <XCircle size={18} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="theme-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <div className="theme-spinner h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
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
                  className="theme-danger theme-hover-danger inline-flex items-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-medium transition"
                >
                  <Trash2 size={18} />
                  Hapus Transaksi
                </button>

              </div>
            </form>

            {/* =========================================================
                FOOTER
            ========================================================= */}
            <footer className="theme-border mt-8 border-t pt-6 text-center text-xs">
              <span className="theme-text-muted">
                © 2026 SmartSchool • Edit Laporan Keuangan
              </span>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}

