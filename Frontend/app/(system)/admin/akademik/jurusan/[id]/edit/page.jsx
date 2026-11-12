"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getJurusan, updateJurusan } from "@/services/jurusan.service";
import {
  GraduationCap,
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
  ChevronDown,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Save,
  Info,
  Pencil,
  FileText,
  Layers3,
} from "lucide-react";

const ICONS = {
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
};

export default function EditJurusanPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [form, setForm] = useState({
    kode: "",
    nama: "",
    deskripsi: "",
    status: "Aktif",
    icon: "Code2",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getJurusan({ limit: 100 });
        const list = res?.data && Array.isArray(res.data) ? res.data : res || [];
        const found = list.find((j) => String(j.id) === String(id));
        if (!found) {
          setError("Jurusan tidak ditemukan.");
          return;
        }
        setForm({
          kode: found.kode || "",
          nama: found.nama || "",
          deskripsi: found.deskripsi || "",
          status:
            (found.status || "").toLowerCase() === "nonaktif"
              ? "Nonaktif"
              : "Aktif",
          icon: found.icon || "Code2",
        });
      } catch (err) {
        setError(err?.message || "Gagal memuat data jurusan.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const update = (key) => (e) =>
    setForm((c) => ({ ...c, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const kodeTrim = form.kode.trim();
    const namaTrim = form.nama.trim();
    
    if (!kodeTrim) return setError("Kode jurusan wajib diisi.");
    if (kodeTrim.length > 20) return setError("Kode jurusan maksimal 20 karakter.");
    if (!namaTrim) return setError("Nama jurusan wajib diisi.");
    if (namaTrim.length > 100) return setError("Nama jurusan maksimal 100 karakter.");

    try {
      setSaving(true);
      await updateJurusan(id, {
        kode: kodeTrim.toUpperCase(),
        nama: namaTrim,
        deskripsi: form.deskripsi ? form.deskripsi.trim() : null,
        status: form.status.toLowerCase() === "nonaktif" ? "nonaktif" : "aktif",
      });
      router.push("/admin/akademik/jurusan");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Gagal memperbarui jurusan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            {/* Header Navigasi */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/admin/akademik/jurusan")}
                  className="theme-card theme-border theme-text-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition hover:shadow-md hover:theme-text"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
                    <Pencil size={24} />
                  </div>
                  <div>
                    <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                      Edit Jurusan
                    </h1>
                    <p className="theme-text-muted text-sm">
                      Perbarui informasi dan pengaturan program keahlian.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="theme-card theme-border flex min-h-[400px] items-center justify-center rounded-2xl border">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin theme-primary-text" size={32} />
                  <p className="theme-text-muted text-sm font-medium">
                    Memuat data jurusan...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.35fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.3fr)]">
                {/* KOLOM KIRI: FORM UTAMA */}
                <div className="space-y-6">
                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle size={20} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Terjadi Kesalahan</p>
                        <p className="mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="theme-card theme-border rounded-2xl border p-6 shadow-sm sm:p-8">
                    <div className="mb-6 flex items-center gap-3 border-b border-[var(--color-border-soft)] pb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h2 className="theme-text text-base font-semibold">
                          Informasi Utama
                        </h2>
                        <p className="theme-text-muted text-xs">
                          Lengkapi data dasar program keahlian di bawah ini.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label className="theme-text-secondary mb-2 block text-xs font-semibold uppercase tracking-wider">
                            Kode Jurusan <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            maxLength={20}
                            value={form.kode}
                            onChange={update("kode")}
                            placeholder="Contoh: RPL"
                            className="theme-input h-11 w-full rounded-xl px-4 text-sm font-medium uppercase outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]"
                          />
                        </div>
                        
                        <div>
                          <label className="theme-text-secondary mb-2 block text-xs font-semibold uppercase tracking-wider">
                            Status Publikasi
                          </label>
                          <div className="relative">
                            <select
                              value={form.status}
                              onChange={update("status")}
                              className="theme-input h-11 w-full cursor-pointer appearance-none rounded-xl px-4 pr-10 text-sm font-medium outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]"
                            >
                              <option value="Aktif">Aktif</option>
                              <option value="Nonaktif">Nonaktif</option>
                            </select>
                            <ChevronDown
                              size={16}
                              className="theme-text-placeholder pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-semibold uppercase tracking-wider">
                          Nama Jurusan <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          maxLength={100}
                          value={form.nama}
                          onChange={update("nama")}
                          placeholder="Contoh: Rekayasa Perangkat Lunak"
                          className="theme-input h-11 w-full rounded-xl px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]"
                        />
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                          <span>Deskripsi</span>
                          <span className="theme-text-placeholder font-normal normal-case tracking-normal">
                            Opsional
                          </span>
                        </label>
                        <textarea
                          rows={5}
                          value={form.deskripsi}
                          onChange={update("deskripsi")}
                          placeholder="Jelaskan secara singkat mengenai jurusan ini..."
                          className="theme-input w-full resize-y rounded-xl p-4 text-sm leading-relaxed outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: IKON & AKSI */}
                <div className="space-y-6">
                  <div className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3 border-b border-[var(--color-border-soft)] pb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <Layers3 size={20} />
                      </div>
                      <div>
                        <h2 className="theme-text text-sm font-semibold">
                          Ikon Jurusan
                        </h2>
                        <p className="theme-text-muted text-xs">
                          Pilih ikon representatif.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(ICONS).map(([name, Icon]) => {
                        const selected = form.icon === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setForm((c) => ({ ...c, icon: name }))}
                            title={name}
                            className={`flex aspect-square items-center justify-center rounded-xl border-2 transition-all ${
                              selected
                                ? "theme-primary shadow-lg"
                                : "theme-border theme-card theme-text-muted hover:border-[var(--color-primary)] hover:theme-primary-text"
                            }`}
                          >
                            <Icon size={22} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <Info size={18} className="theme-primary-text" />
                      <h3 className="theme-text text-sm font-bold">Panduan</h3>
                    </div>
                    <ul className="theme-text-muted space-y-3 text-xs leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                        <span>Pastikan <strong>Kode Jurusan</strong> unik dan belum digunakan oleh jurusan lain.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                        <span>Status <strong>Aktif</strong> akan membuat jurusan ini muncul di daftar pendaftaran siswa.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                        <span>Deskripsi yang baik akan membantu calon siswa memahami jurusan ini.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* ACTION BAR (FULL WIDTH DI BAWAH) */}
                <div className="xl:col-span-2 2xl:col-span-2">
                  <div className="theme-card theme-border sticky bottom-0 z-10 flex flex-col-reverse gap-3 rounded-2xl border bg-[var(--color-card)]/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                    <p className="theme-text-muted text-xs text-center sm:text-left">
                      Pastikan data sudah benar sebelum menyimpan perubahan.
                    </p>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => router.push("/admin/akademik/jurusan")}
                        className="theme-card theme-border theme-text-secondary h-11 rounded-xl border px-6 text-sm font-semibold transition hover:shadow-md disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="theme-primary flex h-10 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-md transition hover:opacity-90 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Save size={18} />
                        )}
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}