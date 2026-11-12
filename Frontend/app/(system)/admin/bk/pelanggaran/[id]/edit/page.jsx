"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import CanAccess from "@/app/components/auth/CanAccess";

import {
  getPelanggaranSiswa,
  updatePelanggaranSiswa,
  getKategoriPelanggaran,
} from "@/services/bk.service";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  Plus,
} from "lucide-react";

const inputClass =
  "theme-input w-full rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm outline-none transition placeholder:text-theme-text-placeholder hover:bg-[var(--color-input-hover)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10";

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
          (data) => String(data.id) === String(id),
        );

        if (!item) {
          throw new Error("Data pelanggaran tidak ditemukan.");
        }

        setForm({
          siswaId: item.siswaId || "",
          siswaNama: item.siswa?.namaLengkap || "",
          siswaNis: item.siswa?.nis || "",
          kategoriPelanggaranId: item.kategoriPelanggaranId || "",
          tanggal: item.tanggal ? String(item.tanggal).slice(0, 10) : "",
          kronologi: item.kronologi || "",
          poin: item.poin ?? "",
          status: item.status || "tercatat",
          tindakLanjut: item.tindakLanjut || "",
          catatan: item.catatan || "",
        });
      } catch (err) {
        console.error("Gagal memuat data pelanggaran:", err);

        setError(err?.message || "Gagal memuat data pelanggaran.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleKategoriChange(value) {
    const selectedKategori = kategori.find(
      (item) => String(item.id) === String(value),
    );

    setForm((prev) => ({
      ...prev,
      kategoriPelanggaranId: value,

      poin:
        selectedKategori?.poin !== undefined &&
        selectedKategori?.poin !== null
          ? selectedKategori.poin
          : prev.poin,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!id) {
        throw new Error("ID pelanggaran tidak ditemukan.");
      }

      if (!form.kategoriPelanggaranId) {
        throw new Error("Kategori pelanggaran wajib dipilih.");
      }

      if (!form.tanggal) {
        throw new Error("Tanggal pelanggaran wajib diisi.");
      }

      const payload = {
        kategoriPelanggaranId: form.kategoriPelanggaranId,

        tanggal: form.tanggal,

        kronologi:
          form.kronologi.trim() !== "" ? form.kronologi.trim() : null,

        poin:
          form.poin === "" ||
          form.poin === null ||
          form.poin === undefined
            ? null
            : Number(form.poin),

        status:
          form.status.trim() !== "" ? form.status.trim() : "tercatat",

        tindakLanjut:
          form.tindakLanjut.trim() !== ""
            ? form.tindakLanjut.trim()
            : null,

        catatan:
          form.catatan.trim() !== "" ? form.catatan.trim() : null,
      };

      console.log("UPDATE PELANGGARAN:", {
        id,
        payload,
      });

      await updatePelanggaranSiswa(id, payload);

      router.push("/admin/bk/pelanggaran");
    } catch (err) {
      console.error("Gagal update pelanggaran:", err);

      setError(err?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  const selectedKategori = kategori.find(
    (item) => String(item.id) === String(form.kategoriPelanggaranId),
  );

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-12">
            <div className="w-full space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/bk/pelanggaran")}
                    className="theme-card theme-text-secondary theme-border mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition hover:bg-[var(--color-header-hover)] hover:text-theme-text"
                    title="Kembali"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="flex items-start gap-4">
                    <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-blue-500/20">
                      <Pencil size={22} />
                    </div>

                    <div>
                      <h1 className="theme-text text-2xl font-bold leading-tight tracking-tight">
                        Edit Pelanggaran
                      </h1>

                      <p className="theme-text-muted mt-1 text-sm font-medium">
                        Perbarui data pelanggaran siswa
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <CanAccess menu="bimbingan konseling" action="create">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/bk/pelanggaran/tambah")
                      }
                      className="theme-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition hover:opacity-90"
                    >
                      <Plus size={16} />
                      Tambah Pelanggaran
                    </button>
                  </CanAccess>
                </div>
              </div>

              {error && (
                <div className="theme-danger flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {loading ? (
                <div className="theme-card theme-border rounded-2xl border p-12 text-center shadow-xl">
                  <div className="theme-text-muted inline-flex items-center gap-2 text-sm font-medium">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                    Memuat data pelanggaran...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
                  <form
                    onSubmit={handleSubmit}
                    className="theme-card theme-border min-w-0 overflow-hidden rounded-2xl border shadow-xl"
                  >
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-4 sm:px-6 sm:py-5">
                      <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
                        <FileText size={16} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="theme-text text-sm font-bold">
                          Informasi Pelanggaran
                        </h2>

                        <p className="theme-text-muted text-xs font-medium">
                          Perbarui data berikut dengan benar
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Field label="Siswa" required>
                          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                            <input
                              value={
                                form.siswaNama || form.siswaId || "-"
                              }
                              readOnly
                              className={`${inputClass} cursor-not-allowed opacity-80`}
                            />

                            <input
                              value={
                                form.siswaNis
                                  ? `NIS ${form.siswaNis}`
                                  : "NIS -"
                              }
                              readOnly
                              className={`${inputClass} cursor-not-allowed opacity-70`}
                            />
                          </div>

                          <p className="theme-text-placeholder mt-2 text-xs font-medium">
                            Siswa tidak dapat diubah pada proses edit karena
                            endpoint BE hanya memperbarui data pelanggaran
                            selain siswa.
                          </p>
                        </Field>
                      </div>

                      <Field label="Kategori Pelanggaran" required>
                        <select
                          required
                          value={form.kategoriPelanggaranId}
                          onChange={(e) =>
                            handleKategoriChange(e.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="">Pilih kategori</option>

                          {kategori.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nama} - {item.poin} poin
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Tanggal" required>
                        <input
                          required
                          type="date"
                          value={form.tanggal}
                          onChange={(e) =>
                            handleChange("tanggal", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Poin">
                        <input
                          type="number"
                          min="0"
                          value={form.poin}
                          onChange={(e) =>
                            handleChange("poin", e.target.value)
                          }
                          placeholder="Masukkan poin"
                          className={inputClass}
                        />

                        {selectedKategori && (
                          <p className="theme-text-muted mt-1.5 text-xs font-medium">
                            Poin kategori:{" "}
                            <span className="theme-text-secondary font-bold">
                              {selectedKategori.poin}
                            </span>
                          </p>
                        )}
                      </Field>

                      <Field label="Status">
                        <select
                          value={form.status}
                          onChange={(e) =>
                            handleChange("status", e.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="tercatat">Tercatat</option>
                          <option value="proses">Proses</option>
                          <option value="ditindaklanjuti">
                            Ditindaklanjuti
                          </option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </Field>

                      <div className="md:col-span-2">
                        <Field label="Kronologi">
                          <textarea
                            rows="5"
                            value={form.kronologi}
                            onChange={(e) =>
                              handleChange("kronologi", e.target.value)
                            }
                            placeholder="Jelaskan kronologi kejadian..."
                            className={`${inputClass} resize-none`}
                          />
                        </Field>
                      </div>

                      <div className="md:col-span-2">
                        <Field label="Tindak Lanjut">
                          <textarea
                            rows="4"
                            value={form.tindakLanjut}
                            onChange={(e) =>
                              handleChange(
                                "tindakLanjut",
                                e.target.value,
                              )
                            }
                            placeholder="Jelaskan tindak lanjut yang dilakukan..."
                            className={`${inputClass} resize-none`}
                          />
                        </Field>
                      </div>

                      <div className="md:col-span-2">
                        <Field label="Catatan">
                          <textarea
                            rows="4"
                            value={form.catatan}
                            onChange={(e) =>
                              handleChange("catatan", e.target.value)
                            }
                            placeholder="Tambahkan catatan jika diperlukan..."
                            className={`${inputClass} resize-none`}
                          />
                        </Field>
                      </div>
                    </div>

                    <div className="theme-card-soft theme-border flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <p className="theme-text-muted text-xs">
                        Perubahan akan langsung memengaruhi riwayat pelanggaran siswa.
                      </p>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            router.push("/admin/bk/pelanggaran")
                          }
                          disabled={saving}
                          className="theme-card theme-text-secondary theme-border rounded-xl border px-5 py-2.5 text-sm font-bold shadow-sm transition hover:bg-[var(--color-header-hover)] hover:text-theme-text disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="theme-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg shadow-blue-500/20 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              Simpan Perubahan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
                    <div className="theme-card theme-border relative overflow-hidden rounded-2xl border p-6 shadow-xl">
                      <div className="theme-info absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30" />

                      <div className="relative">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-7 w-7 items-center justify-center rounded-lg">
                            <Eye size={14} />
                          </div>

                          <h3 className="theme-text-muted text-xs font-bold uppercase tracking-wider">
                            Live Preview
                          </h3>
                        </div>

                        <div className="theme-border flex items-center gap-3 border-b pb-4">
                          <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-md shadow-blue-500/20">
                            {getInitials(form.siswaNama || form.siswaId)}
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text truncate text-sm font-bold">
                              {form.siswaNama || form.siswaId || "Siswa"}
                            </p>

                            <p className="theme-text-muted truncate text-xs font-medium">
                              {selectedKategori?.nama ||
                                "Kategori belum dipilih"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4">
                          <PreviewRow
                            label="Tanggal"
                            value={form.tanggal || "-"}
                          />

                          <PreviewRow
                            label="Kategori"
                            value={selectedKategori?.nama || "-"}
                          />

                          <PreviewRow
                            label="Poin"
                            value={
                              form.poin !== "" && form.poin !== null
                                ? `${form.poin} poin`
                                : "-"
                            }
                          />

                          <PreviewRow
                            label="Status"
                            value={form.status || "-"}
                            badge
                          />
                        </div>
                      </div>
                    </div>

                    <div className="theme-warning relative overflow-hidden rounded-2xl border p-5">
                      <div className="flex items-start gap-3">
                        <div className="theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
                          <AlertTriangle
                            size={16}
                            className="text-[var(--color-warning)]"
                          />
                        </div>

                        <div>
                          <h4 className="theme-text text-sm font-bold">
                            Perhatian
                          </h4>

                          <p className="theme-text-secondary mt-1 text-xs leading-5">
                            Perubahan akan langsung dikirim ke backend dan
                            memperbarui riwayat pelanggaran siswa.
                          </p>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children, required = false }) {
  return (
    <div>
      <label className="theme-text mb-2 block text-sm font-semibold">
        {label}

        {required && (
          <span className="ml-1 text-[var(--color-danger)]" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function PreviewRow({ label, value, badge = false }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="theme-text-muted font-medium">{label}</span>

      {badge ? (
        <span className="theme-info inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
          {value}
        </span>
      ) : (
        <span className="theme-text max-w-[190px] truncate text-right font-semibold">
          {value}
        </span>
      )}
    </div>
  );
}

function getInitials(value) {
  if (!value) return "?";

  const text = String(value).trim();

  if (!text) return "?";

  const parts = text.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}