"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

// Data dummy (sama dengan data di halaman utama)
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
      const newId =
        DUMMY_DATA.length > 0
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

      setSuccess("Transaksi berhasil ditambahkan!");
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
    <div className="theme-page flex h-screen w-full overflow-hidden">
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

        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">

            {/* HEADER */}
            <div
              className="
                mb-6 flex flex-col gap-4 rounded-2xl p-6
                sm:p-8
              "
              style={{
                background:
                  "linear-gradient(135deg, var(--color-sidebar), var(--color-card-soft))",
                border: "1px solid var(--color-sidebar-border)",
              }}
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-xl
                    transition
                  "
                  style={{
                    background: "var(--color-sidebar-hover)",
                    color: "var(--color-sidebar-text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-sidebar-active)";
                    e.currentTarget.style.color =
                      "var(--color-sidebar-text-active)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-sidebar-hover)";
                    e.currentTarget.style.color =
                      "var(--color-sidebar-text)";
                  }}
                  aria-label="Kembali"
                >
                  <ArrowLeft size={24} />
                </button>

                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-sidebar-text-active)" }}
                  >
                    Tambah Transaksi
                  </p>

                  <h1
                    className="text-2xl font-bold tracking-tight sm:text-3xl"
                    style={{ color: "var(--color-sidebar-text)" }}
                  >
                    Tambah Transaksi Baru
                  </h1>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--color-sidebar-text-muted)" }}
                  >
                    Masukkan data transaksi keuangan baru
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ERROR */}
              {error && (
                <div
                  className="
                    flex items-start gap-3 rounded-xl
                    border p-4
                  "
                  style={{
                    color: "var(--color-danger)",
                    background: "var(--color-danger-background)",
                    borderColor: "var(--color-danger)",
                  }}
                >
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div
                  className="
                    flex items-start gap-3 rounded-xl
                    border p-4
                  "
                  style={{
                    color: "var(--color-success)",
                    background: "var(--color-success-background)",
                    borderColor: "var(--color-success)",
                  }}
                >
                  <CheckCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm">{success}</p>
                </div>
              )}

              {/* FORM CARD */}
              <div className="theme-card grid grid-cols-1 gap-5 rounded-2xl border p-6 shadow-sm sm:p-8">

                {/* TANGGAL */}
                <div>
                  <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
                    Tanggal Transaksi{" "}
                    <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="
                        absolute left-3.5 top-1/2
                        -translate-y-1/2
                      "
                      style={{ color: "var(--color-text-muted)" }}
                    />

                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      className="
                        theme-input
                        w-full rounded-xl border
                        py-2.5 pl-10 pr-4 text-sm
                        outline-none transition
                        focus:border-[var(--color-primary)]
                        focus:ring-4
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      "
                      required
                    />
                  </div>
                </div>

                {/* DESKRIPSI */}
                <div>
                  <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
                    Deskripsi{" "}
                    <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={18}
                      className="
                        absolute left-3.5 top-1/2
                        -translate-y-1/2
                      "
                      style={{ color: "var(--color-text-muted)" }}
                    />

                    <input
                      type="text"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      placeholder="Masukkan deskripsi transaksi"
                      className="
                        theme-input
                        w-full rounded-xl border
                        py-2.5 pl-10 pr-4 text-sm
                        outline-none transition
                        placeholder:text-[var(--color-text-placeholder)]
                        focus:border-[var(--color-primary)]
                        focus:ring-4
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      "
                      required
                    />
                  </div>
                </div>

                {/* KATEGORI & JUMLAH */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* KATEGORI */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
                      Kategori{" "}
                      <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>

                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      className="
                        theme-input
                        w-full rounded-xl border
                        px-4 py-2.5 text-sm
                        outline-none transition
                        focus:border-[var(--color-primary)]
                        focus:ring-4
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      "
                    >
                      <option value="Pemasukan">
                        📈 Pemasukan
                      </option>
                      <option value="Pengeluaran">
                        📉 Pengeluaran
                      </option>
                    </select>
                  </div>

                  {/* JUMLAH */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
                      Jumlah (Rp){" "}
                      <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>

                    <div className="relative">
                      <span
                        className="
                          absolute left-3.5 top-1/2
                          -translate-y-1/2
                          text-sm
                        "
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Rp
                      </span>

                      <input
                        type="number"
                        name="jumlah"
                        value={formData.jumlah}
                        onChange={handleChange}
                        placeholder="0"
                        className="
                          theme-input
                          w-full rounded-xl border
                          py-2.5 pl-10 pr-4 text-sm
                          outline-none transition
                          placeholder:text-[var(--color-text-placeholder)]
                          focus:border-[var(--color-primary)]
                          focus:ring-4
                          focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                        "
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* METODE & STATUS */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* METODE */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
                      Metode Pembayaran
                    </label>

                    <div className="relative">
                      <CreditCard
                        size={18}
                        className="
                          absolute left-3.5 top-1/2
                          -translate-y-1/2
                        "
                        style={{ color: "var(--color-text-muted)" }}
                      />

                      <select
                        name="metode"
                        value={formData.metode}
                        onChange={handleChange}
                        className="
                          theme-input
                          w-full rounded-xl border
                          py-2.5 pl-10 pr-4 text-sm
                          outline-none transition
                          focus:border-[var(--color-primary)]
                          focus:ring-4
                          focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                        "
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

                  {/* STATUS */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
                      Status
                    </label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="
                        theme-input
                        w-full rounded-xl border
                        px-4 py-2.5 text-sm
                        outline-none transition
                        focus:border-[var(--color-primary)]
                        focus:ring-4
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      "
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

                {/* INFO FIELD */}
                <div className="theme-card-soft rounded-xl p-4">
                  <p className="theme-text-muted text-xs">
                    * Field bertanda wajib diisi
                  </p>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-3">

                  {/* BATAL */}
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="
                      theme-card
                      inline-flex items-center gap-2
                      rounded-xl border
                      px-6 py-2.5 text-sm font-medium
                      transition
                      hover:bg-[var(--color-input-hover)]
                    "
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <XCircle size={18} />
                    Batal
                  </button>

                  {/* SIMPAN */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      theme-primary
                      inline-flex items-center gap-2
                      rounded-xl
                      px-6 py-2.5
                      text-sm font-medium
                      shadow-lg
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {saving ? (
                      <>
                        <div
                          className="
                            h-4 w-4 animate-spin
                            rounded-full border-2
                          "
                          style={{
                            borderColor: "#ffffff",
                            borderTopColor: "transparent",
                          }}
                        />
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

            {/* FOOTER */}
            <footer
              className="
                mt-8 border-t
                pt-6 text-center text-xs
              "
              style={{
                borderColor: "var(--color-border-soft)",
                color: "var(--color-text-placeholder)",
              }}
            >
              © 2026 SmartSchool • Tambah Laporan Keuangan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

