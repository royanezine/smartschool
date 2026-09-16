"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Save, Building2, Package, Calendar, CreditCard } from "lucide-react";

export default function LanggananForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const [formData, setFormData] = useState(
    initialData || {
      sekolahId: "",
      paketId: "",
      statusPembayaran: "pending",
      statusLangganan: "trial",
      tanggalMulai: "",
      tanggalBerakhir: "",
      hargaSaatBerlangganan: 0,
      siklusPenagihan: "bulan",
      fiturAktif: [],
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit data:", formData);
    router.push("/super-admin/langgananSekolah");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Form */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
              <Package size={18} />
            </span>
            {isEdit ? "Edit Langganan" : "Tambah Langganan"}
          </h1>
          <p className="text-sm text-slate-500 ml-[52px] mt-0.5">
            {isEdit ? "Perbarui data langganan sekolah" : "Buat langganan baru untuk sekolah"}
          </p>
        </div>
        <button
          onClick={() => router.push("/super-admin/langgananSekolah")}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Informasi Utama */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Building2 size={16} />
            </span>
            Informasi Langganan
          </h3>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Sekolah <span className="text-rose-500">*</span>
                </label>
                <select
                  name="sekolahId"
                  value={formData.sekolahId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                  required
                >
                  <option value="">Pilih Sekolah</option>
                  <option value="sklh-01">SMA Negeri 1 Jakarta</option>
                  <option value="sklh-02">SMA Al-Azhar Kelapa Gading</option>
                  <option value="sklh-03">SMP BPK Penabur</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Paket <span className="text-rose-500">*</span>
                </label>
                <select
                  name="paketId"
                  value={formData.paketId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                  required
                >
                  <option value="">Pilih Paket</option>
                  <option value="pkt-01">Professional (Rp550.000/bulan)</option>
                  <option value="pkt-02">Enterprise (Rp1.200.000/bulan)</option>
                  <option value="pkt-03">Starter (Rp250.000/bulan)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="tanggalMulai"
                  value={formData.tanggalMulai}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Tanggal Berakhir
                </label>
                <input
                  type="date"
                  name="tanggalBerakhir"
                  value={formData.tanggalBerakhir}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Status & Pembayaran */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <CreditCard size={16} />
            </span>
            Status & Pembayaran
          </h3>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Status Langganan
                </label>
                <select
                  name="statusLangganan"
                  value={formData.statusLangganan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                >
                  <option value="aktif">Aktif</option>
                  <option value="trial">Trial</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Status Pembayaran
                </label>
                <select
                  name="statusPembayaran"
                  value={formData.statusPembayaran}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                >
                  <option value="lunas">Lunas</option>
                  <option value="pending">Pending</option>
                  <option value="gagal">Gagal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Harga Saat Berlangganan (Rp)
                </label>
                <input
                  type="number"
                  name="hargaSaatBerlangganan"
                  value={formData.hargaSaatBerlangganan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                  placeholder="550000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Siklus Penagihan
                </label>
                <select
                  name="siklusPenagihan"
                  value={formData.siklusPenagihan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                >
                  <option value="bulan">Bulanan</option>
                  <option value="tahun">Tahunan</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Fitur Aktif (Opsional) */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Package size={16} />
            </span>
            Fitur Aktif (Opsional)
          </h3>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["akademik", "presensi", "keuangan", "perpustakaan", "kepegawaian", "komunikasi"].map((fitur) => (
                <label key={fitur} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name="fiturAktif"
                    value={fitur}
                    checked={formData.fiturAktif.includes(fitur)}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      setFormData((prev) => ({
                        ...prev,
                        fiturAktif: checked
                          ? [...prev.fiturAktif, value]
                          : prev.fiturAktif.filter((f) => f !== value),
                      }));
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {fitur.charAt(0).toUpperCase() + fitur.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Tombol Aksi */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={() => router.push("/super-admin/langgananSekolah")}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
          >
            <Save size={16} />
            {isEdit ? "Update Langganan" : "Simpan Langganan"}
          </button>
        </div>
      </form>
    </div>
  );
}