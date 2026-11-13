"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getPengaturan,
  upsertPengaturan,
} from "@/services/pengaturan.service";

const IDENTITAS_KUNCI = "cms_identitas_website";
const IDENTITAS_KELOMPOK = "cms_identitas";

const EMPTY_FORM = {
  siteTitle: "",
  tagline: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  logoUrl: "",
  faviconUrl: "",
};

function getErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.data?.message ||
    err?.message ||
    fallback
  );
}

function parseIdentitasNilai(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

export default function IdentitasWebsitePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadIdentitas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getPengaturan();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      const record = list.find((item) => item?.kunci === IDENTITAS_KUNCI);
      const parsed = parseIdentitasNilai(record?.nilai);

      if (parsed) {
        setForm({
          siteTitle: parsed.siteTitle || "",
          tagline: parsed.tagline || "",
          description: parsed.description || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          address: parsed.address || "",
          logoUrl: parsed.logoUrl || "",
          faviconUrl: parsed.faviconUrl || "",
        });
        setLastUpdated(record?.diperbaruiPada || record?.dibuatPada || "");
      } else {
        setForm(EMPTY_FORM);
        setLastUpdated("");
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Gagal memuat konfigurasi identitas website.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadIdentitas();
    });
  }, [loadIdentitas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.siteTitle.trim()) {
      setError("Judul situs wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const payloadNilai = {
        siteTitle: form.siteTitle.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        logoUrl: form.logoUrl.trim(),
        faviconUrl: form.faviconUrl.trim(),
      };

      const res = await upsertPengaturan({
        kunci: IDENTITAS_KUNCI,
        nilai: payloadNilai,
        tipeData: "json",
        kelompok: IDENTITAS_KELOMPOK,
        keterangan: "Identitas & metadata website publik CMS sekolah",
      });

      const saved = res?.data;
      setLastUpdated(saved?.diperbaruiPada || new Date().toISOString());
      setSuccess("Identitas website berhasil disimpan ke server backend.");
    } catch (err) {
      setError(
        getErrorMessage(err, "Gagal menyimpan identitas website ke backend.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-page theme-text flex h-screen overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Pengaturan Identitas Website"
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="theme-text flex items-center gap-2 text-xl font-bold sm:text-2xl">
                <Globe className="text-[var(--color-primary)]" size={22} />
                Identitas Website CMS
              </h1>
              <p className="theme-text-muted mt-1 text-sm">
                Konfigurasi judul situs, deskripsi SEO, kontak resmi, dan URL aset branding website sekolah.
              </p>
            </div>

            <button
              type="button"
              onClick={loadIdentitas}
              disabled={loading}
              className="theme-card theme-border theme-text inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition hover:opacity-85 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Muat Ulang
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-danger)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-success)]">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">{success}</div>
            </div>
          )}

          {loading ? (
            <div className="theme-card theme-border flex min-h-[260px] flex-col items-center justify-center rounded-2xl border p-8">
              <Loader2
                size={28}
                className="animate-spin text-[var(--color-primary)]"
              />
              <p className="theme-text-muted mt-2 text-xs">
                Mengambil konfigurasi identitas website dari backend...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="theme-card theme-border rounded-2xl border p-5">
                <h2 className="theme-text mb-4 text-sm font-bold">
                  Informasi Umum & SEO
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-1.5 block text-xs font-semibold">
                      Judul Website *
                    </label>
                    <input
                      type="text"
                      name="siteTitle"
                      value={form.siteTitle}
                      onChange={handleChange}
                      placeholder="Masukkan nama atau judul resmi website sekolah"
                      required
                      className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="theme-text mb-1.5 block text-xs font-semibold">
                      Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      value={form.tagline}
                      onChange={handleChange}
                      placeholder="Contoh: Unggul dalam Prestasi, Berkarakter Mulia"
                      className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="theme-text mb-1.5 block text-xs font-semibold">
                    Deskripsi Meta / Tentang Website
                  </label>
                  <textarea
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Ringkasan profil sekolah untuk metadata mesin pencari"
                    className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="theme-card theme-border rounded-2xl border p-5">
                <h2 className="theme-text mb-4 text-sm font-bold">
                  Kontak Publik Website
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                      <Mail size={13} />
                      Email Kontak Resmi
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="info@sekolah.sch.id"
                      className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="theme-text mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                      <Phone size={13} />
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(021) 000-0000"
                      className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="theme-text mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                    <MapPin size={13} />
                    Alamat Lengkap
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Alamat fisik sekolah"
                    className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="theme-card theme-border rounded-2xl border p-5">
                <h2 className="theme-text mb-2 flex items-center gap-1.5 text-sm font-bold">
                  <ImageIcon size={15} className="text-[var(--color-primary)]" />
                  Logo & Favicon (URL)
                </h2>
                <p className="theme-text-muted mb-4 text-xs">
                  Endpoint unggah file biner CMS identitas belum tersedia pada backend; gunakan URL gambar langsung atau unggah logo utama melalui Pengaturan Tema / Profil Sekolah.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-1.5 block text-xs font-semibold">
                      URL Logo Website
                    </label>
                    <input
                      type="url"
                      name="logoUrl"
                      value={form.logoUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    {form.logoUrl && (
                      <div className="theme-border mt-2 inline-flex rounded-lg border p-2">
                        <img
                          src={form.logoUrl}
                          alt="Pratinjau logo website"
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="theme-text mb-1.5 block text-xs font-semibold">
                      URL Favicon
                    </label>
                    <input
                      type="url"
                      name="faviconUrl"
                      value={form.faviconUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    {form.faviconUrl && (
                      <div className="theme-border mt-2 inline-flex rounded-lg border p-2">
                        <img
                          src={form.faviconUrl}
                          alt="Pratinjau favicon"
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p className="theme-text-muted text-xs">
                  {lastUpdated
                    ? `Terakhir diperbarui: ${new Date(lastUpdated).toLocaleString("id-ID")}`
                    : "Belum ada data tersimpan sebelumnya untuk tenant ini."}
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-xs font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? "Menyimpan..." : "Simpan Identitas"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
