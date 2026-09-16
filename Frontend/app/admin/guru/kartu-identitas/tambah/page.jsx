"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import { ArrowLeft, IdCard, Save, X } from "lucide-react";

/**
 * app/admin/guru/kartu-identitas/tambah/page.jsx
 *
 * Halaman tambah pegawai (guru/staff) baru. Setelah disimpan, data
 * dititipkan sebentar lewat localStorage (key "ki_new_pegawai_queue") lalu
 * admin diarahkan kembali ke daftar — di sana data baru ini otomatis
 * digabung ke tabel. Lihat catatan di page.jsx daftar untuk detailnya.
 */

const QUEUE_KEY = "ki_new_pegawai_queue";

const TIPE_OPTIONS = ["Guru", "Staff"];
const STATUS_OPTIONS = ["aktif", "nonaktif"];

const EMPTY_FORM = {
  nama: "",
  nip: "",
  tipe: "Guru",
  jabatan: "",
  level: "Guru",
  status: "aktif",
  unit: "",
  telp: "",
  email: "",
  alamat: "",
  tglMasuk: "",
  golongan: "",
};

const REQUIRED_FIELDS = ["nama", "nip", "jabatan", "unit"];

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800";

export default function TambahPegawaiPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!String(form[field] || "").trim()) nextErrors[field] = "Wajib diisi";
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const raw = window.localStorage.getItem(QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push(form);
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error("Gagal menitipkan data pegawai baru:", err);
    }

    router.push("/admin/guru/kartu-identitas");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar
        active="guruKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />
      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
        />
        <main className="flex-1 w-full overflow-y-auto">
          <div className="w-full max-w-none p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/admin/guru/kartu-identitas")}
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 flex-shrink-0"
                title="Kembali ke daftar"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-slate-900/10">
                <IdCard size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Tambah Pegawai</h1>
                <p className="text-sm text-slate-500">Isi data identitas guru atau staff baru.</p>
              </div>
            </div>

            {/* FORM */}
            <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Field label="Nama lengkap & gelar">
                    <input
                      type="text"
                      value={form.nama}
                      onChange={handleChange("nama")}
                      placeholder="cth. Sarah Amelia, S.Pd"
                      className={inputClass}
                    />
                    {errors.nama && <p className="text-[11px] text-red-500 mt-1">{errors.nama}</p>}
                  </Field>

                  <Field label="NIP">
                    <input
                      type="text"
                      value={form.nip}
                      onChange={handleChange("nip")}
                      placeholder="cth. 198501152010012001"
                      className={`${inputClass} font-mono`}
                    />
                    {errors.nip && <p className="text-[11px] text-red-500 mt-1">{errors.nip}</p>}
                  </Field>

                  <Field label="Tipe">
                    <select value={form.tipe} onChange={handleChange("tipe")} className={`${inputClass} bg-white`}>
                      {TIPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Status">
                    <select value={form.status} onChange={handleChange("status")} className={`${inputClass} bg-white`}>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s === "aktif" ? "Aktif" : "Nonaktif"}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Jabatan">
                    <input
                      type="text"
                      value={form.jabatan}
                      onChange={handleChange("jabatan")}
                      placeholder="cth. Guru Matematika"
                      className={inputClass}
                    />
                    {errors.jabatan && <p className="text-[11px] text-red-500 mt-1">{errors.jabatan}</p>}
                  </Field>

                  <Field label="Level">
                    <input
                      type="text"
                      value={form.level}
                      onChange={handleChange("level")}
                      placeholder="cth. Guru / Staff"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Unit / Bidang">
                    <input
                      type="text"
                      value={form.unit}
                      onChange={handleChange("unit")}
                      placeholder="cth. Mata Pelajaran Matematika"
                      className={inputClass}
                    />
                    {errors.unit && <p className="text-[11px] text-red-500 mt-1">{errors.unit}</p>}
                  </Field>

                  <Field label="Golongan">
                    <input
                      type="text"
                      value={form.golongan}
                      onChange={handleChange("golongan")}
                      placeholder="cth. III/c"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Nomor telepon">
                    <input
                      type="text"
                      value={form.telp}
                      onChange={handleChange("telp")}
                      placeholder="cth. 0812-3456-7890"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="cth. nama@smartschool.sch.id"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Tanggal masuk">
                    <input
                      type="text"
                      value={form.tglMasuk}
                      onChange={handleChange("tglMasuk")}
                      placeholder="cth. 15 Jan 2010"
                      className={inputClass}
                    />
                  </Field>

                  <div className="sm:col-span-2 xl:col-span-3">
                    <Field label="Alamat">
                      <textarea
                        value={form.alamat}
                        onChange={handleChange("alamat")}
                        placeholder="cth. Jl. Merdeka No. 12, Tasikmalaya"
                        rows={2}
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 max-w-md ml-auto">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/guru/kartu-identitas")}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <X size={15} />
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    <Save size={15} />
                    Simpan Pegawai
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}