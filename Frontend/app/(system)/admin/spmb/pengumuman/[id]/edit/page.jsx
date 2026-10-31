"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Megaphone,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getPengumumanPpdbById,
  updatePengumumanPpdb,
} from "@/services/ppdb.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

export default function EditPengumumanPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [collapsed, setCollapsed] = useState(false);

  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");
  const [status, setStatus] = useState("dipublikasikan");
  const [dipublikasikanPada, setDipublikasikanPada] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const muatPengumuman = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getPengumumanPpdbById(id);
      if (res?.success && res.data) {
        const item = res.data;
        setJudul(item.judul || "");
        setKonten(item.konten || "");
        setStatus(item.status || "draft");
        if (item.dipublikasikanPada) {
          const d = new Date(item.dipublikasikanPada);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setDipublikasikanPada(localIso);
        } else {
          const now = new Date();
          setDipublikasikanPada(
            new Date(now.getTime() - now.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)
          );
        }
      } else {
        setError("Pengumuman tidak ditemukan.");
      }
    } catch (err) {
      setError(
        err?.message || "Gagal memuat detail pengumuman dari server."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancel = false;
    const timer = setTimeout(() => {
      if (!cancel) {
        muatPengumuman();
      }
    }, 0);
    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [muatPengumuman]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanJudul = judul.trim();
    const cleanKonten = konten.trim();

    if (!cleanJudul) {
      setError("Judul pengumuman wajib diisi.");
      return;
    }

    if (!cleanKonten) {
      setError("Konten pengumuman wajib diisi.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        judul: cleanJudul,
        konten: cleanKonten,
        status,
      };

      if (status === "dipublikasikan") {
        if (dipublikasikanPada) {
          payload.dipublikasikanPada = new Date(dipublikasikanPada).toISOString();
        } else {
          payload.dipublikasikanPada = new Date().toISOString();
        }
      } else {
        payload.dipublikasikanPada = null;
      }

      await updatePengumumanPpdb(id, payload);
      router.push("/admin/spmb/pengumuman");
    } catch (err) {
      setError(
        err?.message ||
          "Gagal memperbarui pengumuman. Periksa kembali data yang dimasukkan."
      );
      setSaving(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((v) => !v)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/spmb/pengumuman"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} transition ${themeNeutralHover}`}
                  title="Kembali ke Daftar Pengumuman"
                >
                  <ArrowLeft size={18} className="theme-text-muted" />
                </Link>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft}`}
                >
                  <Megaphone size={20} className={themePrimaryText} />
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                    Edit Pengumuman PPDB
                  </h1>
                  <p className="mt-0.5 text-xs theme-text-muted sm:text-sm">
                    Perbarui informasi pengumuman resmi SPMB/PPDB.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] p-4">
                <AlertCircle size={18} className="shrink-0 theme-danger mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold theme-danger">
                    Terjadi Kendala
                  </h4>
                  <p className="mt-0.5 text-xs theme-danger leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {loading ? (
              <div
                className={`flex min-h-[350px] items-center justify-center rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <Loader2
                    size={28}
                    className={`animate-spin ${themePrimaryText}`}
                  />
                  <p className="text-xs theme-text-muted">
                    Memuat data pengumuman...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div
                  className={`rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} p-6 sm:p-8 space-y-6`}
                >
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider theme-text-muted mb-2">
                      Judul Pengumuman <span className="theme-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        maxLength={200}
                        disabled={saving}
                        placeholder="Contoh: Pengumuman Hasil Seleksi PPDB Jalur Prestasi"
                        className={`h-11 w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-4 text-sm theme-text outline-none ${themeFocus} disabled:opacity-50`}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] theme-text-muted flex justify-between">
                      <span>Maksimal 200 karakter.</span>
                      <span>{judul.length}/200</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider theme-text-muted mb-2">
                        Status Publikasi
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={saving}
                        className={`h-11 w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3 text-xs font-medium theme-text outline-none ${themeFocus} disabled:opacity-50`}
                      >
                        <option value="dipublikasikan">Dipublikasikan (Tampil ke Publik)</option>
                        <option value="draft">Draft (Hanya Admin)</option>
                      </select>
                      <p className="mt-1.5 text-[11px] theme-text-muted">
                        Status dipublikasikan akan langsung memunculkan pengumuman di portal PPDB tenant.
                      </p>
                    </div>

                    {status === "dipublikasikan" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider theme-text-muted mb-2">
                          Tanggal &amp; Waktu Publikasi
                        </label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={dipublikasikanPada}
                            onChange={(e) => setDipublikasikanPada(e.target.value)}
                            disabled={saving}
                            className={`h-11 w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-4 text-xs theme-text outline-none ${themeFocus} disabled:opacity-50`}
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] theme-text-muted">
                          Pengumuman hanya akan tampil di publik jika tanggal publikasi telah tiba.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider theme-text-muted mb-2">
                      Konten / Isi Pengumuman <span className="theme-danger">*</span>
                    </label>
                    <textarea
                      rows={12}
                      value={konten}
                      onChange={(e) => setKonten(e.target.value)}
                      disabled={saving}
                      placeholder="Tuliskan isi pengumuman secara rinci..."
                      className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 text-sm leading-relaxed theme-text outline-none ${themeFocus} disabled:opacity-50`}
                    />
                    <p className="mt-1.5 text-[11px] theme-text-muted flex justify-between">
                      <span>Format paragraf dan baris baru akan dipertahankan.</span>
                      <span>{konten.length} karakter</span>
                    </p>
                  </div>

                  <div className="flex flex-col-reverse gap-3 pt-4 border-t theme-border sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href="/admin/spmb/pengumuman"
                      className={`inline-flex items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-5 py-2.5 text-xs font-semibold theme-text transition ${themeNeutralHover}`}
                    >
                      Batal
                    </Link>

                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-6 py-2.5 text-xs font-semibold text-[var(--color-card)] shadow-sm transition hover:opacity-95 disabled:opacity-50`}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Memperbarui...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
