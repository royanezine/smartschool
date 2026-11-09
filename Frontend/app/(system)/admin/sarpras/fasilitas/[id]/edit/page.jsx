"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getFasilitasById,
  updateFasilitas,
} from "@/services/sarpras.service";

import {
  ArrowLeft,
  Building2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Image,
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

function extractData(response) {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

export default function EditFasilitasPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await getFasilitasById(id);

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal mengambil data fasilitas."
        );
      }

      const data = extractData(response);

      if (!data || !data.id) {
        throw new Error("Data fasilitas tidak ditemukan.");
      }

      setForm({
        nama: data.nama || "",
        lokasi: data.lokasi || "",
        kategori: data.kategori || "",
        kondisi: data.kondisi || "Baik",
        kapasitas:
          data.kapasitas === null ||
          data.kapasitas === undefined
            ? ""
            : String(data.kapasitas),
        deskripsi: data.deskripsi || "",
        foto: data.foto || "",
      });
    } catch (err) {
      console.error("Ambil data edit fasilitas:", err);

      setError(
        err.message || "Terjadi kesalahan saat mengambil data fasilitas."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

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

    try {
      setSaving(true);

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

      const response = await updateFasilitas(id, payload);

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal memperbarui fasilitas."
        );
      }

      setSuccess(
        response?.message || "Data fasilitas berhasil diperbarui."
      );

      router.push(`/admin/sarpras/fasilitas/${id}`);
      router.refresh();
    } catch (err) {
      console.error("Update fasilitas:", err);

      setError(
        err.message || "Terjadi kesalahan saat memperbarui fasilitas."
      );
    } finally {
      setSaving(false);
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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="theme-page w-full p-4 sm:p-6 lg:p-8">
            <div className="w-full space-y-6">

              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/sarpras/fasilitas/${id}`)
                  }
                  className="theme-card theme-border theme-text rounded-xl border p-2.5"
                >
                  <ArrowLeft size={19} />
                </button>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                    Sarana & Prasarana
                  </p>

                  <h1 className="theme-text mt-1 text-2xl font-bold">
                    Edit Fasilitas
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Perbarui informasi fasilitas sekolah.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="theme-card theme-border flex min-h-[350px] flex-col items-center justify-center rounded-2xl border">
                  <Loader2
                    size={35}
                    className="theme-primary animate-spin"
                  />
                  <p className="theme-text-secondary mt-3 text-sm">
                    Mengambil data fasilitas...
                  </p>
                </div>
              ) : error && !form.nama ? (
                <div className="theme-card theme-border rounded-2xl border p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={22}
                      className="theme-danger shrink-0"
                    />
                    <div className="flex-1">
                      <p className="theme-text font-semibold">
                        Gagal memuat fasilitas
                      </p>
                      <p className="theme-text-secondary mt-1 text-sm">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={fetchDetail}
                        className="theme-primary mt-4 text-sm font-semibold"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="theme-card theme-border w-full space-y-6 rounded-2xl border p-5 sm:p-7 lg:p-8">

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
                          Perbarui informasi fasilitas yang tersimpan.
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

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                      <div className="sm:col-span-2 xl:col-span-3 2xl:col-span-4">
                        <label className={labelClass}>
                          Nama Fasilitas <span className="theme-danger">*</span>
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
                            placeholder="Nama fasilitas"
                            className={`${inputClass} pl-10`}
                            required
                            maxLength={150}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-1 xl:col-span-1 2xl:col-span-2">
                        <label className={labelClass}>
                          Lokasi <span className="theme-danger">*</span>
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
                            placeholder="Lokasi fasilitas"
                            className={`${inputClass} pl-10`}
                            required
                            maxLength={255}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-1 xl:col-span-1 2xl:col-span-1">
                        <label className={labelClass}>
                          Kategori <span className="theme-danger">*</span>
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
                            <option value="Laboratorium">Laboratorium</option>
                            <option value="Ibadah">Ibadah</option>
                            <option value="Kesehatan">Kesehatan</option>
                            <option value="Akademik">Akademik</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-1 xl:col-span-1 2xl:col-span-1">
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

                      <div className="sm:col-span-1 xl:col-span-1 2xl:col-span-1">
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
                            placeholder="Kapasitas orang"
                            min="0"
                            step="1"
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 xl:col-span-3 2xl:col-span-4">
                        <label className={labelClass}>
                          URL Foto Fasilitas
                        </label>

                        <div className="relative">
                          <Image
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
                          <img
                            src={form.foto}
                            alt="Preview fasilitas"
                            className="mt-3 h-40 w-full rounded-xl border border-[var(--color-border)] object-cover sm:w-64"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>

                      <div className="sm:col-span-2 xl:col-span-3 2xl:col-span-4">
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
                            placeholder="Deskripsi fasilitas..."
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
                        disabled={saving}
                        onClick={() =>
                          router.push(`/admin/sarpras/fasilitas/${id}`)
                        }
                        className="theme-border theme-text rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}

                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}