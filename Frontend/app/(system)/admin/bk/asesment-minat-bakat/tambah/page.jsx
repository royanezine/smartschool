"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { createAsesmenMinatBakat } from "@/services/bk.service";

/* =========================================================
   GLOBAL THEME INPUT
========================================================= */

const inputClass =
  "theme-input w-full rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.12]";

/* =========================================================
   PAGE
========================================================= */

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

  /* =========================================================
     SUBMIT
  ========================================================= */

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
        skor:
          form.skor === ""
            ? null
            : Number(form.skor),
        status: form.status || "selesai",
        catatan: form.catatan || null,
      });

      router.push(
        "/admin/bk/asesment-minat-bakat"
      );
    } catch (err) {
      setError(
        err?.message ||
          "Gagal menyimpan asesmen."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="admin"
        active="bk"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="theme-page flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-7 flex items-start gap-4">

              {/* BACK BUTTON */}

              <button
                type="button"
                onClick={() => router.back()}
                className="theme-card theme-border theme-text-secondary theme-header-hover mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-start gap-4">

                {/* PAGE ICON */}

                <div className="theme-primary relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>

                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75" />
                    <span className="theme-primary relative inline-flex h-3 w-3 rounded-full" />
                  </span>
                </div>

                <div>
                  <h1 className="theme-text text-[26px] font-bold leading-tight tracking-tight">
                    Tambah Asesmen
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm font-medium">
                    Isi hasil asesmen minat &amp; bakat siswa
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="theme-danger theme-border mb-6 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                {error}
              </div>
            )}

            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="theme-card theme-border overflow-hidden rounded-2xl border shadow-xl"
              >

                {/* FORM HEADER */}

                <div className="theme-table-header theme-border-soft flex items-center gap-3 border-b px-6 py-5">

                  <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="theme-text text-sm font-bold">
                      Informasi Asesmen
                    </h2>

                    <p className="theme-text-muted text-xs font-medium">
                      Lengkapi data berikut dengan benar
                    </p>
                  </div>
                </div>

                {/* FORM BODY */}

                <div className="grid gap-5 p-6 md:grid-cols-2">

                  {/* SISWA ID */}

                  <Field
                    label="Siswa ID"
                    required
                  >
                    <input
                      required
                      value={form.siswaId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          siswaId:
                            e.target.value,
                        })
                      }
                      placeholder="Contoh: SIS-001"
                      className={inputClass}
                    />
                  </Field>

                  {/* TANGGAL */}

                  <Field
                    label="Tanggal"
                    required
                  >
                    <input
                      required
                      type="date"
                      value={form.tanggal}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tanggal:
                            e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  {/* JENIS */}

                  <Field
                    label="Jenis Asesmen"
                    required
                  >
                    <input
                      required
                      value={form.jenis}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          jenis:
                            e.target.value,
                        })
                      }
                      placeholder="Contoh: Minat Bakat"
                      className={inputClass}
                    />
                  </Field>

                  {/* SKOR */}

                  <Field label="Skor">
                    <input
                      type="number"
                      value={form.skor}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          skor:
                            e.target.value,
                        })
                      }
                      placeholder="Contoh: 85"
                      className={inputClass}
                    />
                  </Field>

                  {/* MINAT */}

                  <div className="md:col-span-2">
                    <Field label="Minat">
                      <textarea
                        rows="3"
                        value={form.minat}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            minat:
                              e.target.value,
                          })
                        }
                        placeholder="Minat yang teridentifikasi..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  {/* BAKAT */}

                  <div className="md:col-span-2">
                    <Field label="Bakat">
                      <textarea
                        rows="3"
                        value={form.bakat}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bakat:
                              e.target.value,
                          })
                        }
                        placeholder="Bakat yang teridentifikasi..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  {/* HASIL */}

                  <div className="md:col-span-2">
                    <Field label="Hasil">
                      <textarea
                        rows="3"
                        value={form.hasil}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            hasil:
                              e.target.value,
                          })
                        }
                        placeholder="Hasil asesmen..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  {/* REKOMENDASI */}

                  <div className="md:col-span-2">
                    <Field label="Rekomendasi">
                      <textarea
                        rows="3"
                        value={form.rekomendasi}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            rekomendasi:
                              e.target.value,
                          })
                        }
                        placeholder="Rekomendasi untuk siswa..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  {/* STATUS */}

                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status:
                            e.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="selesai">
                        Selesai
                      </option>

                      <option value="proses">
                        Proses
                      </option>

                      <option value="dibatalkan">
                        Dibatalkan
                      </option>
                    </select>
                  </Field>

                  {/* CATATAN */}

                  <div className="md:col-span-2">
                    <Field label="Catatan">
                      <textarea
                        rows="3"
                        value={form.catatan}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            catatan:
                              e.target.value,
                          })
                        }
                        placeholder="Catatan tambahan..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </div>

                {/* =================================================
                    FORM FOOTER
                ================================================= */}

                <div className="theme-table-header theme-border-soft flex justify-end gap-3 border-t px-6 py-4">

                  {/* BATAL */}

                  <button
                    type="button"
                    onClick={() =>
                      router.back()
                    }
                    className="theme-card theme-border theme-text-secondary theme-header-hover rounded-xl border px-5 py-2.5 text-sm font-bold shadow-sm transition"
                  >
                    Batal
                  </button>

                  {/* SIMPAN */}

                  <button
                    type="submit"
                    disabled={saving}
                    className="theme-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>

                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* =================================================
                  SIDE PANEL
              ================================================= */}

              <aside className="space-y-5">

                {/* =================================================
                    LIVE PREVIEW
                ================================================= */}

                <div className="theme-card theme-border relative overflow-hidden rounded-2xl border p-6 shadow-xl">

                  {/* DECORATION */}

                  <div className="theme-info absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60" />

                  <div className="relative">

                    {/* TITLE */}

                    <div className="mb-4 flex items-center gap-2">

                      <div className="theme-info flex h-7 w-7 items-center justify-center rounded-lg">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>

                      <h3 className="theme-text-muted text-xs font-bold uppercase tracking-wider">
                        Live Preview
                      </h3>
                    </div>

                    {/* STUDENT PREVIEW */}

                    <div className="theme-border-soft flex items-center gap-3 border-b pb-4">

                      <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-md">
                        {form.siswaId
                          ?.slice(0, 2)
                          .toUpperCase() ||
                          "?"}
                      </div>

                      <div className="min-w-0">

                        <p className="theme-text truncate text-sm font-bold">
                          {form.siswaId ||
                            "Siswa belum dipilih"}
                        </p>

                        <p className="theme-text-muted truncate text-xs font-medium">
                          {form.jenis ||
                            "Jenis belum diisi"}
                        </p>
                      </div>
                    </div>

                    {/* PREVIEW DATA */}

                    <div className="space-y-3 pt-4">

                      <PreviewRow
                        label="Tanggal"
                        value={
                          form.tanggal ||
                          "-"
                        }
                      />

                      <PreviewRow
                        label="Skor"
                        value={
                          form.skor || "-"
                        }
                      />

                      <PreviewRow
                        label="Status"
                        value={
                          form.status || "-"
                        }
                        badge
                      />
                    </div>
                  </div>
                </div>

                {/* =================================================
                    TIPS
                ================================================= */}

                <div className="theme-info relative overflow-hidden rounded-2xl border p-5">

                  <div className="flex items-start gap-3">

                    <div className="theme-card theme-text flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>

                    <div>
                      <h4 className="theme-text text-sm font-bold">
                        Tips
                      </h4>

                      <p className="theme-text-secondary mt-1 text-xs leading-5">
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

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
  required,
}) {
  return (
    <div>
      <label className="theme-text mb-2 block text-sm font-semibold">
        {label}

        {required && (
          <span className="theme-danger ml-1 rounded px-1 text-xs">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   PREVIEW ROW
========================================================= */

function PreviewRow({
  label,
  value,
  badge,
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">

      <span className="theme-text-muted font-medium">
        {label}
      </span>

      {badge ? (
        <span className="theme-info inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold">
          {value}
        </span>
      ) : (
        <span className="theme-text truncate text-right font-semibold">
          {value}
        </span>
      )}
    </div>
  );
}