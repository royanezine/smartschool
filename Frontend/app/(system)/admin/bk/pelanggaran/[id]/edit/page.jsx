"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  getPelanggaranSiswa,
  updatePelanggaranSiswa,
  getKategoriPelanggaran,
} from "../../../../../../../services/bk.service";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60";

export default function EditPelanggaranPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [kategori, setKategori] = useState([]);

  const [form, setForm] = useState({
    siswaId: "",
    siswaNama: "",
    siswaNis: "",
    kategoriPelanggaranId: "",
    tanggal: "",
    kronologi: "",
    poin: "",
    status: "tercatat",
    tindakLanjut: "",
    catatan: "",
  });

  // =========================================================
  // LOAD DATA
  // =========================================================
  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [pelanggaranResult, kategoriResult] = await Promise.all([
          getPelanggaranSiswa(),
          getKategoriPelanggaran(),
        ]);

        const pelanggaranList = Array.isArray(pelanggaranResult)
          ? pelanggaranResult
          : [];

        const kategoriList = Array.isArray(kategoriResult)
          ? kategoriResult
          : [];

        setKategori(kategoriList);

        const item = pelanggaranList.find(
          (data) => String(data.id) === String(id)
        );

        if (!item) {
          throw new Error("Data pelanggaran tidak ditemukan.");
        }

        setForm({
          siswaId: item.siswaId || "",
          siswaNama: item.siswa?.namaLengkap || "",
          siswaNis: item.siswa?.nis || "",
          kategoriPelanggaranId: item.kategoriPelanggaranId || "",
          tanggal: item.tanggal
            ? String(item.tanggal).slice(0, 10)
            : "",
          kronologi: item.kronologi || "",
          poin: item.poin ?? "",
          status: item.status || "tercatat",
          tindakLanjut: item.tindakLanjut || "",
          catatan: item.catatan || "",
        });
      } catch (err) {
        console.error("Gagal memuat data pelanggaran:", err);

        setError(
          err?.message || "Gagal memuat data pelanggaran."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // =========================================================
  // CHANGE FORM
  // =========================================================
  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // =========================================================
  // CHANGE KATEGORI
  // =========================================================
  function handleKategoriChange(value) {
    const selectedKategori = kategori.find(
      (item) => String(item.id) === String(value)
    );

    setForm((prev) => ({
      ...prev,
      kategoriPelanggaranId: value,

      // Sesuai halaman tambah:
      // ketika kategori berubah, poin mengikuti kategori.
      poin:
        selectedKategori?.poin !== undefined &&
        selectedKategori?.poin !== null
          ? selectedKategori.poin
          : prev.poin,
    }));
  }

  // =========================================================
  // SUBMIT
  // =========================================================
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      // Validasi frontend
      if (!id) {
        throw new Error("ID pelanggaran tidak ditemukan.");
      }

      if (!form.kategoriPelanggaranId) {
        throw new Error("Kategori pelanggaran wajib dipilih.");
      }

      if (!form.tanggal) {
        throw new Error("Tanggal pelanggaran wajib diisi.");
      }

      // =====================================================
      // PENTING:
      // BE UPDATE TIDAK MENERIMA siswaId
      // =====================================================
      const payload = {
        kategoriPelanggaranId: form.kategoriPelanggaranId,

        tanggal: form.tanggal,

        kronologi:
          form.kronologi.trim() !== ""
            ? form.kronologi.trim()
            : null,

        poin:
          form.poin === "" ||
          form.poin === null ||
          form.poin === undefined
            ? null
            : Number(form.poin),

        status:
          form.status.trim() !== ""
            ? form.status.trim()
            : "tercatat",

        tindakLanjut:
          form.tindakLanjut.trim() !== ""
            ? form.tindakLanjut.trim()
            : null,

        catatan:
          form.catatan.trim() !== ""
            ? form.catatan.trim()
            : null,
      };

      console.log("UPDATE PELANGGARAN:", {
        id,
        payload,
      });

      await updatePelanggaranSiswa(id, payload);

      router.push("/admin/bk/pelanggaran");
    } catch (err) {
      console.error("Gagal update pelanggaran:", err);

      setError(
        err?.message || "Gagal menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // SELECTED CATEGORY
  // =========================================================
  const selectedKategori = kategori.find(
    (item) =>
      String(item.id) === String(form.kategoriPelanggaranId)
  );

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* =====================================================
                HEADER
            ===================================================== */}
            <div className="mb-7 flex items-start gap-4">
              <button
                type="button"
                onClick={() =>
                  router.push("/admin/bk/pelanggaran")
                }
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">
                    Edit Pelanggaran
                  </h1>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Perbarui data pelanggaran siswa
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700 shadow-sm">
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

            {/* =====================================================
                LOADING
            ===================================================== */}
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/40">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  Memuat data pelanggaran...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

                {/* =================================================
                    FORM
                ================================================= */}
                <form
                  onSubmit={handleSubmit}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40"
                >
                  {/* FORM HEADER */}
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
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
                      <h2 className="text-sm font-bold text-slate-900">
                        Informasi Pelanggaran
                      </h2>

                      <p className="text-xs font-medium text-slate-500">
                        Perbarui data berikut dengan benar
                      </p>
                    </div>
                  </div>

                  {/* FORM CONTENT */}
                  <div className="grid gap-5 p-6 md:grid-cols-2">

                    {/* =================================================
                        SISWA
                    ================================================= */}
                    <div className="md:col-span-2">
                      <Field
                        label="Siswa"
                        required
                      >
                        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                          <input
                            value={
                              form.siswaNama ||
                              form.siswaId ||
                              "-"
                            }
                            readOnly
                            className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-600`}
                          />

                          <input
                            value={
                              form.siswaNis
                                ? `NIS ${form.siswaNis}`
                                : "NIS -"
                            }
                            readOnly
                            className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                          />
                        </div>

                        <p className="mt-2 text-xs font-medium text-slate-400">
                          Siswa tidak dapat diubah pada proses edit
                          karena endpoint BE hanya memperbarui data
                          pelanggaran selain siswa.
                        </p>
                      </Field>
                    </div>

                    {/* =================================================
                        KATEGORI
                    ================================================= */}
                    <Field
                      label="Kategori Pelanggaran"
                      required
                    >
                      <select
                        required
                        value={form.kategoriPelanggaranId}
                        onChange={(e) =>
                          handleKategoriChange(e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">
                          Pilih kategori
                        </option>

                        {kategori.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.nama} - {item.poin} poin
                          </option>
                        ))}
                      </select>
                    </Field>

                    {/* =================================================
                        TANGGAL
                    ================================================= */}
                    <Field
                      label="Tanggal"
                      required
                    >
                      <input
                        required
                        type="date"
                        value={form.tanggal}
                        onChange={(e) =>
                          handleChange(
                            "tanggal",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </Field>

                    {/* =================================================
                        POIN
                    ================================================= */}
                    <Field label="Poin">
                      <input
                        type="number"
                        min="0"
                        value={form.poin}
                        onChange={(e) =>
                          handleChange(
                            "poin",
                            e.target.value
                          )
                        }
                        placeholder="Masukkan poin"
                        className={inputClass}
                      />

                      {selectedKategori && (
                        <p className="mt-1.5 text-xs font-medium text-slate-400">
                          Poin kategori:{" "}
                          <span className="font-bold text-slate-600">
                            {selectedKategori.poin}
                          </span>
                        </p>
                      )}
                    </Field>

                    {/* =================================================
                        STATUS
                    ================================================= */}
                    <Field label="Status">
                      <select
                        value={form.status}
                        onChange={(e) =>
                          handleChange(
                            "status",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="tercatat">
                          Tercatat
                        </option>

                        <option value="proses">
                          Proses
                        </option>

                        <option value="ditindaklanjuti">
                          Ditindaklanjuti
                        </option>

                        <option value="selesai">
                          Selesai
                        </option>
                      </select>
                    </Field>

                    {/* =================================================
                        KRONOLOGI
                    ================================================= */}
                    <div className="md:col-span-2">
                      <Field label="Kronologi">
                        <textarea
                          rows="5"
                          value={form.kronologi}
                          onChange={(e) =>
                            handleChange(
                              "kronologi",
                              e.target.value
                            )
                          }
                          placeholder="Jelaskan kronologi kejadian..."
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                    {/* =================================================
                        TINDAK LANJUT
                    ================================================= */}
                    <div className="md:col-span-2">
                      <Field label="Tindak Lanjut">
                        <textarea
                          rows="4"
                          value={form.tindakLanjut}
                          onChange={(e) =>
                            handleChange(
                              "tindakLanjut",
                              e.target.value
                            )
                          }
                          placeholder="Jelaskan tindak lanjut yang dilakukan..."
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                    {/* =================================================
                        CATATAN
                    ================================================= */}
                    <div className="md:col-span-2">
                      <Field label="Catatan">
                        <textarea
                          rows="4"
                          value={form.catatan}
                          onChange={(e) =>
                            handleChange(
                              "catatan",
                              e.target.value
                            )
                          }
                          placeholder="Tambahkan catatan jika diperlukan..."
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* =================================================
                      FOOTER
                  ================================================= */}
                  <div className="flex justify-end gap-3 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/bk/pelanggaran"
                        )
                      }
                      disabled={saving}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    SIDE PREVIEW
                ================================================= */}
                <aside className="space-y-5">

                  {/* PREVIEW */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-60" />

                    <div className="relative">

                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
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

                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Live Preview
                        </h3>
                      </div>

                      {/* SISWA PREVIEW */}
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-bold text-white shadow-md shadow-blue-500/25">
                          {getInitials(
                            form.siswaNama ||
                              form.siswaId
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {form.siswaNama ||
                              form.siswaId ||
                              "Siswa"}
                          </p>

                          <p className="truncate text-xs font-medium text-slate-500">
                            {selectedKategori?.nama ||
                              "Kategori belum dipilih"}
                          </p>
                        </div>
                      </div>

                      {/* PREVIEW ROWS */}
                      <div className="space-y-3 pt-4">

                        <PreviewRow
                          label="Tanggal"
                          value={
                            form.tanggal || "-"
                          }
                        />

                        <PreviewRow
                          label="Kategori"
                          value={
                            selectedKategori?.nama ||
                            "-"
                          }
                        />

                        <PreviewRow
                          label="Poin"
                          value={
                            form.poin !== "" &&
                            form.poin !== null
                              ? `${form.poin} poin`
                              : "-"
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

                  {/* INFO */}
                  <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-50/40 p-5">
                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
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
                        <h4 className="text-sm font-bold text-amber-900">
                          Perhatian
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-amber-800/80">
                          Perubahan akan langsung dikirim
                          ke backend dan memperbarui
                          riwayat pelanggaran siswa.
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

// =========================================================
// FIELD
// =========================================================

function Field({
  label,
  children,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// =========================================================
// PREVIEW ROW
// =========================================================

function PreviewRow({
  label,
  value,
  badge = false,
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="font-medium text-slate-500">
        {label}
      </span>

      {badge ? (
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
          {value}
        </span>
      ) : (
        <span className="max-w-[190px] truncate text-right font-semibold text-slate-900">
          {value}
        </span>
      )}
    </div>
  );
}

// =========================================================
// INITIALS
// =========================================================

function getInitials(value) {
  if (!value) return "?";

  const text = String(value).trim();

  if (!text) return "?";

  const parts = text.split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[1][0]
  ).toUpperCase();
}