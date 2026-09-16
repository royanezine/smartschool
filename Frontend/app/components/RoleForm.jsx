"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  BookOpen,
  DollarSign,
  Users,
  UserCog,
  Key,
  X,
  Save,
} from "lucide-react";

const iconOptions = [
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "ShieldCheck", label: "Shield Check", icon: ShieldCheck },
  { value: "ShieldAlert", label: "Shield Alert", icon: ShieldAlert },
  { value: "UserCheck", label: "User Check", icon: UserCheck },
  { value: "BookOpen", label: "Book Open", icon: BookOpen },
  { value: "DollarSign", label: "Dollar Sign", icon: DollarSign },
  { value: "Users", label: "Users", icon: Users },
  { value: "UserCog", label: "User Cog", icon: UserCog },
  { value: "Key", label: "Key", icon: Key },
];

export default function RoleForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const [formData, setFormData] = useState(
    initialData || {
      nama: "",
      namaTampilan: "",
      deskripsi: "",
      status: "aktif",
      ikon: "Shield",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit data:", formData);
    router.push("/super-admin/manajemenAkses");
  };

  const selectedIcon = iconOptions.find((opt) => opt.value === formData.ikon)?.icon || Shield;
  const IconPreview = selectedIcon;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Form */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
              <Shield size={18} />
            </span>
            {isEdit ? "Edit Role" : "Tambah Role Baru"}
          </h1>
          <p className="text-sm text-slate-500 ml-[52px] mt-0.5">
            {isEdit ? "Perbarui data role pengguna" : "Buat role baru untuk pengguna sistem"}
          </p>
        </div>
        <button
          onClick={() => router.push("/super-admin/manajemenAkses")}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Informasi Role */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Shield size={16} />
            </span>
            Informasi Role
          </h3>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Nama Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder:text-slate-400"
                  placeholder="Contoh: Super Admin"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Nama Tampilan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaTampilan"
                  value={formData.namaTampilan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder:text-slate-400"
                  placeholder="Contoh: Super Admin"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition resize-none placeholder:text-slate-400"
                  placeholder="Deskripsi singkat role ini"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Ikon & Status */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Key size={16} />
            </span>
            Ikon & Status
          </h3>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Pilih Ikon
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                    <IconPreview size={20} />
                  </div>
                  <select
                    name="ikon"
                    value={formData.ikon}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Tombol Aksi */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={() => router.push("/super-admin/manajemenAkses")}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
          >
            <Save size={16} />
            {isEdit ? "Update Role" : "Simpan Role"}
          </button>
        </div>
      </form>
    </div>
  );
}