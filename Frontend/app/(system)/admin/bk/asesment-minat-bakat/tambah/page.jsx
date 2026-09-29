"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import { createAsesmenMinatBakat } from "../../../../../../services/bk.service";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60";

export default function CreateAsesmenPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    siswaId: "",
    tanggal: "",
    jenis: "",
    minat: "",
    bakat: "",
    hasil: "",
    rekomendasi: "",
    skor: "",
    status: "selesai",
    catatan: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      await createAsesmenMinatBakat({
        siswaId: form.siswaId,
        tanggal: form.tanggal,
        jenis: form.jenis,
        minat: form.minat || null,
        bakat: form.bakat || null,
        hasil: form.hasil || null,
        rekomendasi: form.rekomendasi || null,
        skor: form.skor === "" ? null : Number(form.skor),
        status: form.status || "selesai",
        catatan: form.catatan || null,
      });
      router.push("/admin/bk/asesment-minat-bakat");
    } catch (err) {
      setError(err?.message || "Gagal menyimpan asesmen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* PAGE HEADER */}
            <div className="mb-7 flex items-start gap-4">
              <button
                onClick={() => router.back()}
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-start gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                  </span>
                </div>
                <div>
                  <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">
                    Tambah Asesmen
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Isi hasil asesmen minat &amp; bakat siswa
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700 shadow-sm">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Informasi Asesmen</h2>
                    <p className="text-xs font-medium text-slate-500">Lengkapi data berikut dengan benar</p>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <Field label="Siswa ID" required>
                    <input
                      required
                      value={form.siswaId}
                      onChange={(e) => setForm({ ...form, siswaId: e.target.value })}
                      placeholder="Contoh: SIS-001"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Tanggal" required>
                    <input
                      required
                      type="date"
                      value={form.tanggal}
                      onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Jenis Asesmen" required>
                    <input
                      required
                      value={form.jenis}
                      onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                      placeholder="Contoh: Minat Bakat"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Skor">
                    <input
                      type="number"
                      value={form.skor}
                      onChange={(e) => setForm({ ...form, skor: e.target.value })}
                      placeholder="Contoh: 85"
                      className={inputClass}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Minat">
                      <textarea
                        rows="3"
                        value={form.minat}
                        onChange={(e) => setForm({ ...form, minat: e.target.value })}
                        placeholder="Minat yang teridentifikasi..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Bakat">
                      <textarea
                        rows="3"
                        value={form.bakat}
                        onChange={(e) => setForm({ ...form, bakat: e.target.value })}
                        placeholder="Bakat yang teridentifikasi..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Hasil">
                      <textarea
                        rows="3"
                        value={form.hasil}
                        onChange={(e) => setForm({ ...form, hasil: e.target.value })}
                        placeholder="Hasil asesmen..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Rekomendasi">
                      <textarea
                        rows="3"
                        value={form.rekomendasi}
                        onChange={(e) => setForm({ ...form, rekomendasi: e.target.value })}
                        placeholder="Rekomendasi untuk siswa..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={inputClass}
                    >
                      <option value="selesai">Selesai</option>
                      <option value="proses">Proses</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Catatan">
                      <textarea
                        rows="3"
                        value={form.catatan}
                        onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                        placeholder="Catatan tambahan..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* SIDE */}
              <aside className="space-y-5">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-60" />

                  <div className="relative">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Live Preview
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-bold text-white shadow-md shadow-blue-500/25">
                        {form.siswaId?.slice(0, 2).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {form.siswaId || "Siswa belum dipilih"}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-500">
                          {form.jenis || "Jenis belum diisi"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <PreviewRow label="Tanggal" value={form.tanggal || "-"} />
                      <PreviewRow label="Skor" value={form.skor || "-"} />
                      <PreviewRow label="Status" value={form.status || "-"} badge />
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-50/40 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">Tips</h4>
                      <p className="mt-1 text-xs leading-5 text-blue-800/80">
                        Isi minat &amp; bakat dengan jelas agar rekomendasi bisa
                        lebih tepat sasaran.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function PreviewRow({ label, value, badge }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="font-medium text-slate-500">{label}</span>
      {badge ? (
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
          {value}
        </span>
      ) : (
        <span className="truncate text-right font-semibold text-slate-900">{value}</span>
      )}
    </div>
  );
}