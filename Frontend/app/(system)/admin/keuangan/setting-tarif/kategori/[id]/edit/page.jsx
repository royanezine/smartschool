"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  Tag,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  CalendarClock,
  FileText,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { getKategoriTagihan, updateKategoriTagihan } from "@/services/tarif.service";

const SIKLUS_OPTIONS = [
  { value: "bulanan", label: "Bulanan" },
  { value: "tahunan", label: "Tahunan" },
  { value: "sekali", label: "Sekali" },
];

const STATUS_OPTIONS = [
  { value: "aktif", label: "Aktif" },
  { value: "tidak_aktif", label: "Tidak Aktif" },
];

function isAktif(val) {
  if (val === true || val === 1) return true;
  if (typeof val === "string") {
    const s = val.toLowerCase();
    return s === "aktif" || s === "true" || s === "active";
  }
  return false;
}

export default function EditKategoriTagihanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [active, setActive] = useState("tarif");
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    siklus: "bulanan",
    deskripsi: "",
    status: "aktif",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadDetail() {
      if (!id) return;
      setLoading(true);
      setError("");

      try {
        const res = await getKategoriTagihan({ page: 1, limit: 200 });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const item = list.find((k) => String(k.id) === String(id));

        if (mounted) {
          if (!item) {
            setError("Data kategori tagihan tidak ditemukan.");
          } else {
            setFormData({
              kode: item.kode || "",
              nama: item.nama || "",
              siklus: item.siklus || "bulanan",
              deskripsi: item.deskripsi || "",
              status: isAktif(item.status) ? "aktif" : "tidak_aktif",
            });
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Gagal memuat kategori:", err);
          setError(err?.message || "Gagal memuat data kategori tagihan.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.kode.trim() || !formData.nama.trim()) {
      setError("Kode dan Nama kategori wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      await updateKategoriTagihan(id, {
        kode: formData.kode.trim(),
        nama: formData.nama.trim(),
        siklus: formData.siklus,
        deskripsi: formData.deskripsi.trim() || undefined,
        status: formData.status,
      });

      setSuccess("Kategori tagihan berhasil diperbarui.");
      setTimeout(() => {
        router.push("/admin/keuangan/setting-tarif");
      }, 1000);
    } catch (err) {
      console.error("Gagal memperbarui kategori:", err);
      setError(err?.message || "Gagal memperbarui kategori tagihan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b theme-border">
          <Header active={active} />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="w-full space-y-6">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <Link
                    href="/admin/keuangan/setting-tarif"
                    className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                    aria-label="Kembali"
                  >
                    <ArrowLeft size={17} />
                  </Link>

                  <div>
                    <h1 className="mt-1 text-2xl font-bold theme-text sm:text-3xl">
                      Edit Kategori Tagihan
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                      Perbarui kode, nama, siklus, atau status keaktifan kategori tagihan.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <p className="flex-1 break-words">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                  <p className="flex-1 break-words">{success}</p>
                </div>
              )}

              {loading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 theme-card rounded-2xl border theme-border">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                  <p className="text-sm font-medium theme-text">Memuat data...</p>
                  <p className="text-xs theme-text-muted">Mengambil informasi kategori tagihan</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
                    
                    <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                      <div className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                            <Tag size={16} />
                          </div>
                          <h2 className="text-sm font-bold theme-text">Informasi Kategori</h2>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                        <div className="sm:col-span-2">
                          <label className="theme-text mb-2 block text-sm font-semibold">
                            Kode Kategori <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="kode"
                            value={formData.kode}
                            onChange={handleChange}
                            placeholder="Contoh: SPP, DSP, SERAGAM"
                            disabled={submitting}
                            className="theme-input h-11 w-full rounded-xl border px-3.5 text-sm uppercase outline-none transition focus:border-[var(--color-primary)]"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="theme-text mb-2 block text-sm font-semibold">
                            Nama Kategori <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            placeholder="Contoh: Sumbangan Pembinaan Pendidikan"
                            disabled={submitting}
                            className="theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            required
                          />
                        </div>

                        <div>
                          <label className="theme-text mb-2 block text-sm font-semibold">
                            Siklus Pembayaran <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="siklus"
                            value={formData.siklus}
                            onChange={handleChange}
                            disabled={submitting}
                            className="theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          >
                            {SIKLUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="theme-text mb-2 block text-sm font-semibold">
                            Status Keaktifan <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={submitting}
                            className="theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="theme-text mb-2 block text-sm font-semibold">
                            Deskripsi / Keterangan
                          </label>
                          <textarea
                            rows={4}
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            placeholder="Keterangan tambahan..."
                            disabled={submitting}
                            className="theme-input w-full resize-y rounded-xl border p-3.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col-reverse gap-3 border-t theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-5 py-4 sm:flex-row sm:justify-end">
                        <Link
                          href="/admin/keuangan/setting-tarif"
                          className="theme-card theme-border theme-text-secondary inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                        >
                          Batal
                        </Link>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Simpan Perubahan
                            </>
                          )}
                        </button>
                      </div>
                    </section>

                    <aside className="space-y-5">
                      <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                        <div className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Info size={16} className="theme-text-muted" />
                            <h2 className="text-sm font-bold theme-text">Panduan Edit</h2>
                          </div>
                        </div>
                        <div className="p-5 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                              <FileText size={15} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold theme-text">Kode Unik</p>
                              <p className="mt-0.5 text-[11px] leading-relaxed theme-text-muted">
                                Pastikan kode belum digunakan oleh kategori lain untuk menghindari konflik data.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]">
                              <CalendarClock size={15} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold theme-text">Siklus Tagihan</p>
                              <p className="mt-0.5 text-[11px] leading-relaxed theme-text-muted">
                                Mengubah siklus akan mempengaruhi cara tagihan dibuat ke depannya.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]">
                              <ShieldCheck size={15} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold theme-text">Status Keaktifan</p>
                              <p className="mt-0.5 text-[11px] leading-relaxed theme-text-muted">
                                Menonaktifkan kategori tidak akan menghapus data tagihan yang sudah ada.
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                        <div className="flex items-start gap-3">
                          <Sparkles size={18} className="mt-0.5 shrink-0" />
                          <div>
                            <h3 className="text-xs font-bold">Informasi</h3>
                            <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                              Perubahan akan langsung diterapkan ke seluruh modul keuangan yang menggunakan kategori ini.
                            </p>
                          </div>
                        </div>
                      </div>
                    </aside>
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