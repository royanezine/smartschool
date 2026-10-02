"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getSesiKonseling,
  updateSesiKonseling,
} from "@/services/bk.service";

const inputClass =
  "theme-input w-full rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm outline-none transition focus:border-[var(--color-primary)]";

export default function EditSesiKonselingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    siswaId: "",
    konselorId: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
    topik: "",
    masalah: "",
    hasil: "",
    tindakLanjut: "",
    status: "dijadwalkan",
    catatan: "",
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const result = await getSesiKonseling();
        const list = Array.isArray(result) ? result : [];

        const item = list.find(
          (x) => String(x.id) === String(id)
        );

        if (!item) {
          throw new Error("Data sesi konseling tidak ditemukan.");
        }

        setForm({
          siswaId: item.siswaId || "",
          konselorId: item.konselorId || "",
          tanggal: item.tanggal
            ? item.tanggal.slice(0, 10)
            : "",
          waktuMulai: item.waktuMulai || "",
          waktuSelesai: item.waktuSelesai || "",
          topik: item.topik || "",
          masalah: item.masalah || "",
          hasil: item.hasil || "",
          tindakLanjut: item.tindakLanjut || "",
          status: item.status || "dijadwalkan",
          catatan: item.catatan || "",
        });
      } catch (err) {
        setError(err?.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateSesiKonseling(id, {
        siswaId: form.siswaId,
        konselorId: form.konselorId || null,
        tanggal: form.tanggal,
        waktuMulai: form.waktuMulai || null,
        waktuSelesai: form.waktuSelesai || null,
        topik: form.topik,
        masalah: form.masalah || null,
        hasil: form.hasil || null,
        tindakLanjut: form.tindakLanjut || null,
        status: form.status || "dijadwalkan",
        catatan: form.catatan || null,
      });

      router.push("/admin/bk/sesi-konseling");
    } catch (err) {
      setError(
        err?.message || "Gagal menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* HEADER */}
            <div className="mb-7 flex items-start gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="
                  theme-card theme-border theme-text-muted
                  mt-1 flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl border
                  shadow-sm
                  transition
                  hover:opacity-80
                "
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
                    Edit Sesi Konseling
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm font-medium">
                    Perbarui data sesi konseling
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm">
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

            {/* LOADING */}
            {loading ? (
              <div className="theme-card theme-border rounded-2xl border p-12 text-center shadow-xl">
                <div className="theme-text-muted inline-flex items-center gap-2 text-sm font-medium">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                  Memuat data...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

                {/* FORM */}
                <form
                  onSubmit={handleSubmit}
                  className="theme-card theme-border overflow-hidden rounded-2xl border shadow-xl"
                >
                  {/* FORM HEADER */}
                  <div className="theme-card-soft theme-border-soft flex items-center gap-3 border-b px-6 py-5">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Sesi
                      </h2>

                      <p className="theme-text-muted text-xs font-medium">
                        Perbarui data berikut dengan benar
                      </p>
                    </div>
                  </div>

                  {/* FORM CONTENT */}
                  <div className="grid gap-5 p-6 md:grid-cols-2">

                    <Field label="Siswa ID" required>
                      <input
                        required
                        value={form.siswaId}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            siswaId: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Konselor ID">
                      <input
                        value={form.konselorId}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            konselorId: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Tanggal" required>
                      <input
                        required
                        type="date"
                        value={form.tanggal}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tanggal: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Status">
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            status: e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        <option value="dijadwalkan">
                          Dijadwalkan
                        </option>
                        <option value="berlangsung">
                          Berlangsung
                        </option>
                        <option value="selesai">
                          Selesai
                        </option>
                        <option value="dibatalkan">
                          Dibatalkan
                        </option>
                      </select>
                    </Field>

                    <Field label="Waktu Mulai">
                      <input
                        type="time"
                        value={form.waktuMulai}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            waktuMulai: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Waktu Selesai">
                      <input
                        type="time"
                        value={form.waktuSelesai}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            waktuSelesai: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Topik" required>
                        <input
                          required
                          value={form.topik}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              topik: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Masalah">
                        <textarea
                          rows="3"
                          value={form.masalah}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              masalah: e.target.value,
                            })
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Hasil">
                        <textarea
                          rows="3"
                          value={form.hasil}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              hasil: e.target.value,
                            })
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Tindak Lanjut">
                        <textarea
                          rows="3"
                          value={form.tindakLanjut}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              tindakLanjut: e.target.value,
                            })
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Catatan">
                        <textarea
                          rows="3"
                          value={form.catatan}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              catatan: e.target.value,
                            })
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* FORM ACTION */}
                  <div className="theme-card-soft theme-border-soft flex justify-end gap-3 border-t px-6 py-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="
                        theme-card theme-border theme-text-secondary
                        rounded-xl border
                        px-5 py-2.5
                        text-sm font-bold
                        shadow-sm
                        transition
                        hover:opacity-80
                      "
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="
                        theme-primary
                        inline-flex items-center gap-2
                        rounded-xl
                        px-5 py-2.5
                        text-sm font-bold
                        shadow-lg
                        transition
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
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

                {/* SIDEBAR */}
                <aside className="space-y-5">

                  {/* LIVE PREVIEW */}
                  <div className="theme-card theme-border relative overflow-hidden rounded-2xl border p-6 shadow-xl">
                    <div className="theme-info absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30" />

                    <div className="relative">
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

                      <div className="theme-border-soft flex items-center gap-3 border-b pb-4">
                        <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-md">
                          {form.siswaId?.slice(0, 2).toUpperCase() ||
                            "?"}
                        </div>

                        <div className="min-w-0">
                          <p className="theme-text truncate text-sm font-bold">
                            {form.siswaId || "-"}
                          </p>

                          <p className="theme-text-muted truncate text-xs font-medium">
                            {form.konselorId
                              ? `Konselor: ${form.konselorId}`
                              : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <PreviewRow
                          label="Topik"
                          value={form.topik || "-"}
                        />

                        <PreviewRow
                          label="Tanggal"
                          value={form.tanggal || "-"}
                        />

                        <PreviewRow
                          label="Waktu"
                          value={
                            form.waktuMulai
                              ? `${form.waktuMulai}${
                                  form.waktuSelesai
                                    ? ` - ${form.waktuSelesai}`
                                    : ""
                                }`
                              : "-"
                          }
                        />

                        <PreviewRow
                          label="Status"
                          value={
                            form.status.charAt(0).toUpperCase() +
                            form.status.slice(1)
                          }
                          badge
                        />
                      </div>
                    </div>
                  </div>

                  {/* PERHATIAN */}
                  <div className="theme-warning relative overflow-hidden rounded-2xl border p-5 shadow-sm">
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
                        <h4 className="text-sm font-bold">
                          Perhatian
                        </h4>

                        <p className="mt-1 text-xs leading-5 opacity-80">
                          Perubahan data akan langsung tersimpan dan
                          memengaruhi riwayat sesi konseling siswa.
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

function Field({ label, children, required }) {
  return (
    <div>
      <label className="theme-text mb-2 block text-sm font-semibold">
        {label}

        {required && (
          <span className="theme-text-danger ml-1 text-[var(--color-danger)]">
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

function PreviewRow({ label, value, badge }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="theme-text-muted font-medium">
        {label}
      </span>

      {badge ? (
        <span className="theme-info inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold">
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