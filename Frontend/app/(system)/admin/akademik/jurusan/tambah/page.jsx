"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { createJurusan } from "@/services/jurusan.service";
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
  Sparkles,
  FileText,
  Tag,
  ToggleLeft,
  Shapes,
  Lightbulb,
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

export default function TambahJurusanPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    kode: "",
    nama: "",
    deskripsi: "",
    status: "Aktif",
    icon: "Code2",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) =>
    setForm((c) => ({ ...c, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const kodeTrim = form.kode.trim();
    const namaTrim = form.nama.trim();

    if (!kodeTrim) return setError("Kode jurusan wajib diisi.");
    if (kodeTrim.length > 20)
      return setError("Kode jurusan maksimal 20 karakter.");
    if (!namaTrim) return setError("Nama jurusan wajib diisi.");
    if (namaTrim.length > 100)
      return setError("Nama jurusan maksimal 100 karakter.");

    try {
      setSaving(true);
      await createJurusan({
        kode: kodeTrim.toUpperCase(),
        nama: namaTrim,
        deskripsi: form.deskripsi ? form.deskripsi.trim() : null,
        status: form.status.toLowerCase() === "nonaktif" ? "nonaktif" : "aktif",
      });
      router.push("/admin/akademik/jurusan");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Gagal menyimpan jurusan ke backend.");
    } finally {
      setSaving(false);
    }
  };

  const SelectedIcon = ICONS[form.icon] || GraduationCap;

  return (
    <div className="flex h-screen overflow-hidden theme-page">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-3 py-5 sm:px-5 lg:px-6 xl:px-8">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <button
                  onClick={() => router.push("/admin/akademik/jurusan")}
                  className="theme-card theme-border flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border theme-text-muted transition hover:shadow-md"
                  title="Kembali"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 sm:h-14 sm:w-14">
                  <GraduationCap size={24} strokeWidth={2} />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[var(--color-bg)]">
                    <Sparkles size={10} className="text-white" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl font-extrabold tracking-tight theme-text sm:text-2xl xl:text-3xl">
                      Tambah Jurusan
                    </h1>
                    <span className="hidden rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 sm:inline-block">
                      Program Baru
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs theme-text-muted sm:text-sm">
                    Lengkapi informasi program keahlian baru untuk disimpan ke
                    server
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => router.push("/admin/akademik/jurusan")}
                  className="theme-card theme-border theme-text-secondary flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold shadow-sm transition hover:shadow-md disabled:opacity-50"
                >
                  <ArrowLeft size={15} />
                  <span>Kembali</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-600 dark:text-red-400">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="rounded p-1 hover:bg-red-500/20"
                >
                  <ArrowLeft size={15} className="rotate-45" />
                </button>
              </div>
            )}

            <form onSubmit={submit}>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="space-y-4 xl:col-span-2">
                  <div className="theme-card theme-border rounded-2xl border p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        <Tag size={16} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold theme-text">
                          Informasi Jurusan
                        </h2>
                        <p className="text-[11px] theme-text-muted">
                          Data utama program keahlian
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider theme-text-secondary">
                          Kode Jurusan{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          maxLength={20}
                          value={form.kode}
                          onChange={update("kode")}
                          placeholder="Contoh: RPL, TKJ, IPA"
                          className="theme-input h-11 w-full rounded-xl px-3.5 text-sm uppercase outline-none transition focus:ring-2 focus:ring-blue-500/30"
                        />
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] theme-text-muted">
                          <Info size={11} /> Maksimal 20 karakter, unik per
                          sekolah
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider theme-text-secondary">
                          Status
                        </label>
                        <div className="relative">
                          <ToggleLeft
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                          />
                          <select
                            value={form.status}
                            onChange={update("status")}
                            className="theme-input h-11 w-full appearance-none rounded-xl pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="Nonaktif">Nonaktif</option>
                          </select>
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider theme-text-secondary">
                        Nama Jurusan / Program Keahlian{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        maxLength={100}
                        value={form.nama}
                        onChange={update("nama")}
                        placeholder="Contoh: Rekayasa Perangkat Lunak"
                        className="theme-input h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30"
                      />
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] theme-text-muted">
                        <Info size={11} /> Maksimal 100 karakter
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider theme-text-secondary">
                        <FileText size={13} className="text-emerald-500" />
                        Deskripsi (Opsional)
                      </label>
                      <textarea
                        rows={4}
                        value={form.deskripsi}
                        onChange={update("deskripsi")}
                        placeholder="Ringkasan kompetensi keahlian atau keterangan jurusan..."
                        className="theme-input w-full resize-none rounded-xl p-3.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30"
                      />
                      <p className="mt-1.5 text-[11px] theme-text-muted">
                        {form.deskripsi.length} karakter
                      </p>
                    </div>
                  </div>

                  <div className="theme-card theme-border rounded-2xl border p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
                        <Shapes size={16} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold theme-text">
                          Ikon Jurusan
                        </h2>
                        <p className="text-[11px] theme-text-muted">
                          Pilih ikon representatif untuk jurusan
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
                      {Object.entries(ICONS).map(([name, Icon]) => {
                        const selected = form.icon === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() =>
                              setForm((c) => ({ ...c, icon: name }))
                            }
                            className={`flex aspect-square items-center justify-center rounded-xl border-2 transition ${
                              selected
                                ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                : "theme-border theme-card theme-text-muted hover:border-blue-400 hover:text-blue-500"
                            }`}
                            title={name}
                          >
                            <Icon size={19} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white blur-2xl" />
                        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white blur-2xl" />
                      </div>
                      <div className="relative flex flex-col items-center gap-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                          <SelectedIcon size={26} strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Preview Ikon
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest theme-text-muted">
                        Preview Jurusan
                      </p>
                      <h3 className="mt-1.5 truncate text-lg font-extrabold theme-text">
                        {form.nama || "Nama Jurusan Baru"}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-block rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {form.kode || "KODE"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            form.status === "Aktif"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-slate-400/30 bg-slate-500/10 theme-text-muted"
                          }`}
                        >
                          {form.status}
                        </span>
                      </div>
                      <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed theme-text-muted">
                        {form.deskripsi || "Deskripsi jurusan akan tampil di sini."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-4">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        <Lightbulb size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold theme-text">
                          Tips Pengisian
                        </h4>
                        <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed theme-text-muted">
                          <li>• Gunakan kode singkat & mudah diingat</li>
                          <li>• Nama jurusan sesuai kurikulum resmi</li>
                          <li>• Deskripsi jelaskan kompetensi utama</li>
                          <li>• Pilih ikon yang merepresentasikan bidang</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="theme-card theme-border rounded-2xl border p-4 shadow-sm">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-xl disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {saving ? "Menyimpan..." : "Simpan Jurusan"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        router.push("/admin/akademik/jurusan")
                      }
                      className="theme-card theme-border theme-text-secondary mt-2 h-11 w-full rounded-xl border text-sm font-semibold transition hover:shadow-md disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="h-4" />
          </div>
        </main>
      </div>
    </div>
  );
}