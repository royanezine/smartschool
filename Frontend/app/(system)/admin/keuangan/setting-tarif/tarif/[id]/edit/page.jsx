"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  CircleDollarSign,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { getTarif, updateTarif } from "@/services/tarif.service";

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

export default function EditTarifTagihanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [active, setActive] = useState("tarif");
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [tarifData, setTarifData] = useState(null);

  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [status, setStatus] = useState("aktif");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadTarifDetail() {
      if (!id) return;
      setLoading(true);
      setError("");

      try {
        const res = await getTarif({ page: 1, limit: 300 });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const item = list.find((t) => String(t.id) === String(id));

        if (mounted) {
          if (!item) {
            setError("Data tarif tidak ditemukan.");
          } else {
            setTarifData(item);
            setNominal(String(Number(item.nominal) || ""));
            setKeterangan(item.keterangan || "");
            setStatus(isAktif(item.status) ? "aktif" : "tidak_aktif");
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Gagal memuat tarif:", err);
          setError(err?.message || "Gagal memuat data tarif tagihan.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTarifDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nominal || Number(nominal) <= 0) {
      setError("Nominal tarif harus lebih dari 0.");
      return;
    }

    setSubmitting(true);

    try {
      await updateTarif(id, {
        nominal: Number(nominal),
        keterangan: keterangan.trim() || undefined,
        status,
      });

      setSuccess("Tarif tagihan berhasil diperbarui.");
      setTimeout(() => {
        router.push("/admin/keuangan/setting-tarif");
      }, 1000);
    } catch (err) {
      console.error("Gagal memperbarui tarif:", err);
      setError(err?.message || "Gagal memperbarui tarif tagihan.");
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
                Edit Tarif Tagihan
              </h1>
              <p className="theme-text-secondary mt-1 text-sm">
                Perbarui besaran nominal, keterangan, atau status keaktifan tarif.
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
                  Memuat data tarif...
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="theme-card theme-border rounded-2xl border p-6 shadow-sm sm:p-8"
              >
                {tarifData && (
                  <div className="theme-card-soft mb-6 rounded-xl border border-[var(--color-border)] p-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="theme-text-muted">Kategori Tagihan:</span>
                        <p className="theme-text font-semibold">
                          {tarifData.kategoriTagihan?.nama || "-"} ({tarifData.kategoriTagihan?.kode || "-"})
                        </p>
                      </div>
                      <div>
                        <span className="theme-text-muted">Tahun Ajaran:</span>
                        <p className="theme-text font-semibold">
                          {tarifData.tahunAjaran?.tahun || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="theme-text-muted">Sasaran Siswa:</span>
                        <p className="theme-text font-semibold">
                          {tarifData.kelas?.nama
                            ? `Kelas ${tarifData.kelas.nama}`
                            : tarifData.tingkat
                            ? `Tingkat ${tarifData.tingkat}`
                            : "Semua Siswa"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Nominal Tarif (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={nominal}
                      onChange={(e) => setNominal(e.target.value)}
                      placeholder="Contoh: 350000"
                      disabled={submitting}
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Status Keaktifan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
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
                      Keterangan
                    </label>
                    <textarea
                      rows={3}
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
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
