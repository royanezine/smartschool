"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { createFasilitas } from "@/services/sarpras.service";

import {
  ArrowLeft,
  Building2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Image as ImageIcon,
  Users,
  FileText,
  Tag,
  Activity,
} from "lucide-react";

const initialForm = {
  nama: "",
  lokasi: "",
  kategori: "",
  kondisi: "Baik",
  kapasitas: "",
  deskripsi: "",
  foto: "",
};

const inputClass =
  "theme-input theme-text w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const labelClass =
  "theme-text mb-2 block text-sm font-medium";

export default function TambahFasilitasPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.nama.trim()) {
      setError("Nama fasilitas wajib diisi.");
      return;
    }

    if (!form.lokasi.trim()) {
      setError("Lokasi fasilitas wajib diisi.");
      return;
    }

    if (!form.kategori.trim()) {
      setError("Kategori fasilitas wajib dipilih.");
      return;
    }

    if (
      form.kapasitas !== "" &&
      (!Number.isInteger(Number(form.kapasitas)) ||
        Number(form.kapasitas) < 0)
    ) {
      setError("Kapasitas harus berupa bilangan bulat minimal 0.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nama: form.nama.trim(),
        lokasi: form.lokasi.trim(),
        kategori: form.kategori.trim(),
        kondisi: form.kondisi,
        kapasitas:
          form.kapasitas === ""
            ? null
            : Number(form.kapasitas),
        deskripsi: form.deskripsi.trim() || null,
        foto: form.foto.trim() || null,
      };

      const response = await createFasilitas(payload);

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal menambahkan fasilitas."
        );
      }

      setSuccess(
        response?.message || "Fasilitas berhasil ditambahkan."
      );

      router.push("/admin/sarpras/fasilitas");
      router.refresh();
    } catch (err) {
      console.error("Tambah fasilitas:", err);

      setError(
        err?.message || "Terjadi kesalahan saat menyimpan fasilitas."
      );
    } finally {
      setLoading(false);
    }
  };

  const notifications = [];

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="adminSarpras"
        active="fasilitas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setSidebarOpen((prev) => !prev)
            }
            notifications={notifications}
            user={{
              name: "Admin Sarpras",
              email: "adminsarpras@smartschool.com",
              avatar: "SP",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/sarpras/fasilitas")
                  }
                  className="theme-card theme-border theme-text rounded-xl border p-2.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                >
                  <ArrowLeft size={19} />
                </button>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                    Sarana &amp; Prasarana
                  </p>

                  <h1 className="theme-text mt-1 text-2xl font-bold">
                    Tambah Fasilitas
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Masukkan informasi fasilitas sekolah.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="theme-card theme-border space-y-6 rounded-2xl border p-5 sm:p-7">
                  <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
                    <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-3">
                      <Building2
                        size={22}
                        className="theme-primary"
                      />
                    </div>

                    <div>
                      <h2 className="theme-text font-semibold">
                        Informasi Fasilitas
                      </h2>
                      <p className="theme-text-secondary text-xs">
                        Lengkapi data utama fasilitas.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-3">
                      <AlertCircle
                        size={18}
                        className="theme-danger mt-0.5 shrink-0"
                      />
                      <p className="theme-danger text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] p-3">
                      <CheckCircle2
                        size={18}
                        className="theme-success"
                      />
                      <p className="theme-success text-sm">
                        {success}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        Nama Fasilitas{" "}
                        <span className="theme-danger">*</span>
                      </label>

                      <div className="relative">
                        <Building2
                          size={17}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          name="nama"
                          value={form.nama}
                          onChange={handleChange}
                          placeholder="Contoh: Laboratorium Komputer"
                          className={`${inputClass} pl-10`}
                          required
                          maxLength={150}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Lokasi{" "}
                        <span className="theme-danger">*</span>
                      </label>

                      <div className="relative">
                        <MapPin
                          size={17}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          name="lokasi"
                          value={form.lokasi}
                          onChange={handleChange}
                          placeholder="Contoh: Gedung B Lantai 2"
                          className={`${inputClass} pl-10`}
                          required
                          maxLength={255}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Kategori{" "}
                        <span className="theme-danger">*</span>
                      </label>

                      <div className="relative">
                        <Tag
                          size={17}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <select
                          name="kategori"
                          value={form.kategori}
                          onChange={handleChange}
                          className={`${inputClass} appearance-none pl-10`}
                          required
                        >
                          <option value="">Pilih kategori</option>
                          <option value="Umum">Umum</option>
                          <option value="Olahraga">Olahraga</option>
                          <option value="Laboratorium">
                            Laboratorium
                          </option>
                          <option value="Ibadah">Ibadah</option>
                          <option value="Kesehatan">Kesehatan</option>
                          <option value="Akademik">Akademik</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Kondisi Fasilitas
                      </label>

                      <div className="relative">
                        <Activity
                          size={17}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <select
                          name="kondisi"
                          value={form.kondisi}
                          onChange={handleChange}
                          className={`${inputClass} appearance-none pl-10`}
                        >
                          <option value="Baik">Baik</option>
                          <option value="Rusak Ringan">
                            Rusak Ringan
                          </option>
                          <option value="Rusak Berat">
                            Rusak Berat
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Kapasitas
                      </label>

                      <div className="relative">
                        <Users
                          size={17}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="number"
                          name="kapasitas"
                          value={form.kapasitas}
                          onChange={handleChange}
                          placeholder="Contoh: 40"
                          min="0"
                          step="1"
                          className={`${inputClass} pl-10`}
                        />
                      </div>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Masukkan kapasitas dalam jumlah orang.
                      </p>
                    </div>

                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        URL Foto Fasilitas
                      </label>

                      <div className="relative">
                        <ImageIcon
                          size={17}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="url"
                          name="foto"
                          value={form.foto}
                          onChange={handleChange}
                          placeholder="https://contoh.com/foto.jpg"
                          className={`${inputClass} pl-10`}
                        />
                      </div>

                      {form.foto && (
                        <div className="mt-3">
                          <img
                            src={form.foto}
                            alt="Preview fasilitas"
                            className="h-40 w-full rounded-xl border border-[var(--color-border)] object-cover sm:w-64"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        Deskripsi
                      </label>

                      <div className="relative">
                        <FileText
                          size={17}
                          className="theme-text-muted absolute left-3.5 top-4"
                        />

                        <textarea
                          name="deskripsi"
                          value={form.deskripsi}
                          onChange={handleChange}
                          placeholder="Tuliskan keterangan fasilitas..."
                          rows={4}
                          maxLength={2000}
                          className={`${inputClass} resize-y pl-10`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        router.push("/admin/sarpras/fasilitas")
                      }
                      className="theme-border theme-text rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Save size={17} />
                      )}
                      {loading ? "Menyimpan..." : "Simpan Fasilitas"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}