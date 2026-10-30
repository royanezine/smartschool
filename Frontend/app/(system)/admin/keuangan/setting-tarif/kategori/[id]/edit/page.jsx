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
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header active={active} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <Link
                href="/admin/keuangan/setting-tarif"
                className="theme-text-muted inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Setting Tarif
              </Link>
              <h1 className="theme-text mt-2 text-2xl font-bold">
                Edit Kategori Tagihan
              </h1>
              <p className="theme-text-secondary mt-1 text-sm">
                Perbarui kode, nama, siklus, atau status keaktifan kategori tagihan.
              </p>
            </div>

            {error && (
              <div className="theme-danger flex items-start gap-3 rounded-xl border p-4 text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {success && (
              <div className="theme-success flex items-start gap-3 rounded-xl border p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">{success}</div>
              </div>
            )}

            {loading ? (
              <div className="theme-card theme-border flex flex-col items-center justify-center rounded-2xl border p-12 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                <p className="theme-text-muted mt-3 text-sm">
                  Memuat data kategori tagihan...
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="theme-card theme-border rounded-2xl border p-6 shadow-sm sm:p-8"
              >
                <div className="space-y-5">
                  <div>
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
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm uppercase outline-none"
                      required
                    />
                  </div>

                  <div>
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
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
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
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
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
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Deskripsi / Keterangan
                    </label>
                    <textarea
                      rows={3}
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      placeholder="Keterangan tambahan..."
                      disabled={submitting}
                      className="theme-input w-full rounded-xl border p-3.5 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="theme-border mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                  <Link
                    href="/admin/keuangan/setting-tarif"
                    className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--color-sidebar-active)]"
                  >
                    Batal
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
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
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
