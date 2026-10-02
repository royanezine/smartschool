"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getAsesmenMinatBakat,
  updateAsesmenMinatBakat,
} from "@/services/bk.service";

/* =========================================================
   GLOBAL THEME INPUT
========================================================= */

const inputClass =
  "theme-input w-full rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm outline-none transition hover:border-[var(--color-primary)] focus:border-[var(--color-primary)]";

/* =========================================================
   PAGE
========================================================= */

export default function EditAsesmenPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
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
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const result = await getAsesmenMinatBakat();

        const list = Array.isArray(result)
          ? result
          : [];

        const item = list.find(
          (x) => String(x.id) === String(id)
        );

        if (!item) {
          throw new Error(
            "Data asesmen tidak ditemukan."
          );
        }

        setForm({
          siswaId: item.siswaId || "",
          tanggal: item.tanggal
            ? item.tanggal.slice(0, 10)
            : "",
          jenis: item.jenis || "",
          minat: item.minat || "",
          bakat: item.bakat || "",
          hasil: item.hasil || "",
          rekomendasi: item.rekomendasi || "",
          skor: item.skor ?? "",
          status: item.status || "selesai",
          catatan: item.catatan || "",
        });
      } catch (err) {
        setError(
          err?.message || "Gagal memuat data."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateAsesmenMinatBakat(id, {
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
          "Gagal menyimpan perubahan."
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
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        active="bk"
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="theme-page flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-7 flex items-start gap-4">
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
                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="theme-text text-[26px] font-bold leading-tight tracking-tight">
                    Edit Asesmen
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm font-medium">
                    Perbarui data asesmen minat &amp; bakat
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

                <span>{error}</span>
              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div className="theme-card theme-border rounded-2xl border p-12 text-center shadow-xl">
                <div className="theme-text-muted inline-flex items-center gap-2 text-sm font-medium">
                  <span className="border-theme-border h-4 w-4 animate-spin rounded-full border-2 border-t-[var(--color-primary)]" />

                  Memuat data...
                </div>
              </div>
            ) : (
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
                        Perbarui data berikut dengan benar
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
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* FORM FOOTER */}

                  <div className="theme-table-header theme-border-soft flex justify-end gap-3 border-t px-6 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        router.back()
                      }
                      className="theme-card theme-border theme-text-secondary theme-header-hover rounded-xl border px-5 py-2.5 text-sm font-bold shadow-sm transition"
                    >
                      Batal
                    </button>

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

                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* =================================================
                    SIDE
                ================================================= */}

                <aside className="space-y-5">

                  {/* LIVE PREVIEW */}

                  <div className="theme-card theme-border relative overflow-hidden rounded-2xl border p-6 shadow-xl">
                    <div className="theme-info pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-40" />

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

                      {/* STUDENT */}

                      <div className="theme-border-soft flex items-center gap-3 border-b pb-4">
                        <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-md">
                          {form.siswaId
                            ?.slice(0, 2)
                            .toUpperCase() ||
                            "?"}
                        </div>

                        <div className="min-w-0">
                          <p className="theme-text truncate text-sm font-bold">
                            {form.siswaId || "-"}
                          </p>

                          <p className="theme-text-muted truncate text-xs font-medium">
                            {form.jenis || "-"}
                          </p>
                        </div>
                      </div>

                      {/* PREVIEW DATA */}

                      <div className="space-y-3 pt-4">
                        <PreviewRow
                          label="Tanggal"
                          value={
                            form.tanggal || "-"
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

                  {/* WARNING */}

                  <div className="theme-warning theme-border relative overflow-hidden rounded-2xl border p-5">
                    <div className="flex items-start gap-3">
                      <div className="theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
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
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>

                      <div>
                        <h4 className="theme-text text-sm font-bold">
                          Perhatian
                        </h4>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Perubahan akan langsung
                          tersimpan dan memengaruhi
                          riwayat asesmen siswa.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
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
          <span className="text-[var(--color-danger)] ml-1">
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
        <span className="theme-info theme-border inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold">
          {value}
        </span>
      ) : (
        <span className="theme-text max-w-[180px] truncate text-right font-semibold">
          {value}
        </span>
      )}
    </div>
  );
}