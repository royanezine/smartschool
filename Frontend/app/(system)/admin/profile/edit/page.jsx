"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getProfile, updateProfile } from "@/services/user.service";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";


export default function EditProfilePage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    namaLengkap: "",
    noTelepon: "",
    alamat: "",
    alamatDomisili: "",
    tempatLahir: "",
    tanggalLahir: "",
  });

  const [initialData, setInitialData] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getProfile();
      const user = response?.data;
      if (!user || !user.id) {
        throw new Error(response?.message || "Data profil tidak ditemukan.");
      }

      setInitialData(user);
      setForm({
        namaLengkap: user.namaLengkap || "",
        noTelepon: user.noTelepon || "",
        alamat: user.alamat || "",
        alamatDomisili: user.alamatDomisili || "",
        tempatLahir: user.tempatLahir || "",
        tanggalLahir: user.tanggalLahir
          ? new Date(user.tanggalLahir).toISOString().split("T")[0]
          : "",
      });
    } catch (err) {
      console.error("Gagal mengambil data profil:", err);
      setError(err?.message || "Gagal mengambil data profil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaLengkap.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        noTelepon: form.noTelepon.trim() || null,
        alamat: form.alamat.trim() || null,
        alamatDomisili: form.alamatDomisili.trim() || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
      };

      const response = await updateProfile(payload);
      if (!response?.success) {
        throw new Error(response?.message || "Gagal memperbarui profil.");
      }

      setSuccess("Profil berhasil diperbarui!");
      setTimeout(() => {
        router.push("/admin/profile");
      }, 1200);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      setError(err?.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setSubmitting(false);
    }
  };

  const nama = initialData?.namaLengkap || initialData?.namaPengguna || "Admin";

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="profile"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((v) => !v)}
          notifications={[]}
          user={{
            name: nama,
            email: initialData?.email || "",
            avatar: initialData?.avatar || nama.slice(0, 2).toUpperCase(),
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1000px] space-y-5 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/profile")}
                className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-black/5"
              >
                <ArrowLeft size={16} />
                Kembali ke Profil
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <section className="theme-card theme-border rounded-2xl border p-5 sm:p-7">
              <h1 className="text-xl font-bold theme-text">Edit Profil</h1>
              <p className="mt-1 text-sm theme-text-secondary">
                Perbarui informasi akun dan data kontak pribadi Anda.
              </p>

              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="namaLengkap"
                          value={form.namaLengkap}
                          onChange={handleChange}
                          required
                          className="theme-card theme-border theme-text w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="noTelepon"
                          value={form.noTelepon}
                          onChange={handleChange}
                          className="theme-card theme-border theme-text w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
                        Tempat Lahir
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          name="tempatLahir"
                          value={form.tempatLahir}
                          onChange={handleChange}
                          className="theme-card theme-border theme-text w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                          placeholder="Kota kelahiran"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
                        Tanggal Lahir
                      </label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="date"
                          name="tanggalLahir"
                          value={form.tanggalLahir}
                          onChange={handleChange}
                          className="theme-card theme-border theme-text w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
                        Alamat KTP / Asal
                      </label>
                      <textarea
                        name="alamat"
                        rows={2}
                        value={form.alamat}
                        onChange={handleChange}
                        className="theme-card theme-border theme-text w-full rounded-xl border p-3 text-sm outline-none focus:border-primary"
                        placeholder="Alamat lengkap sesuai identitas"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
                        Alamat Domisili
                      </label>
                      <textarea
                        name="alamatDomisili"
                        rows={2}
                        value={form.alamatDomisili}
                        onChange={handleChange}
                        className="theme-card theme-border theme-text w-full rounded-xl border p-3 text-sm outline-none focus:border-primary"
                        placeholder="Alamat domisili saat ini"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t theme-border">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => router.push("/admin/profile")}
                      className="theme-card theme-border theme-text-secondary rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-black/5"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="theme-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
