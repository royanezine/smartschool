"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Boxes,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Loader2,
  Building2,
  Database,
  Info,
  FileText,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getDetailGudang,
  updateGudang,
} from "@/services/sarpras.service";

const themePrimaryGradient = "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themePrimarySoft = "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimarySoftBorder = "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";
const themePrimaryText = "text-[var(--color-primary)]";
const themePrimaryShadow = "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";
const themeNeutralSurface = "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeNeutralHover = "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";
const themeDivider = "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";
const themeNeutralBorder = "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeSuccessSurface = "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";
const themeSuccessBorder = "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";
const themeDangerSurface = "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeDangerBorder = "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";
const themeFocus = "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";
const themeBorderClass = "theme-border";

function extractGudang(response) {
  if (!response) return null;

  if (
    typeof response === "object" &&
    !Array.isArray(response) &&
    response.id &&
    typeof response.nama === "string"
  ) {
    return response;
  }

  const possibleKeys = ["data", "result", "gudang"];

  for (const key of possibleKeys) {
    const value = response?.[key];

    if (!value) continue;

    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.id &&
      typeof value.nama === "string"
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value[0] || null;
    }

    if (typeof value === "object") {
      const nested = extractGudang(value);
      if (nested) return nested;
    }
  }

  return null;
}

function getErrorMessage(error, fallback) {
  if (typeof error?.message === "string") {
    return error.message;
  }
  return fallback;
}

export default function EditGudangPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    keterangan: "",
  });

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID gudang tidak ditemukan.");
      return;
    }

    let active = true;

    async function loadGudang() {
      try {
        setLoading(true);
        setError("");

        const response = await getDetailGudang(String(id));

        if (!active) return;

        if (response?.success === false) {
          throw new Error(response.message || "Gagal mengambil detail gudang.");
        }

        const gudang = extractGudang(response);

        if (!gudang) {
          throw new Error("Data gudang tidak ditemukan.");
        }

        setForm({
          nama: gudang.nama || "",
          lokasi: gudang.lokasi || "",
          keterangan: gudang.keterangan || "",
        });
      } catch (err) {
        console.error("Gagal mengambil detail gudang:", err);
        if (active) {
          setError(getErrorMessage(err, "Gagal mengambil data gudang dari server."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadGudang();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const nama = form.nama.trim();
    const lokasi = form.lokasi.trim();
    const keterangan = form.keterangan.trim();

    if (!nama) {
      setError("Nama gudang wajib diisi.");
      return;
    }

    if (nama.length < 3) {
      setError("Nama gudang minimal 3 karakter.");
      return;
    }

    if (nama.length > 100) {
      setError("Nama gudang maksimal 100 karakter.");
      return;
    }

    if (lokasi.length > 255) {
      setError("Lokasi gudang maksimal 255 karakter.");
      return;
    }

    if (!id) {
      setError("ID gudang tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        nama,
        lokasi: lokasi || null,
        keterangan: keterangan || null,
      };

      const response = await updateGudang(String(id), payload);

      if (response?.success === false) {
        throw new Error(response.message || "Gagal memperbarui data gudang.");
      }

      setSuccess(response?.message || "Data gudang berhasil diperbarui.");

      setTimeout(() => {
        router.push("/admin/sarpras/gudang/master");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Gagal memperbarui gudang:", err);
      setError(getErrorMessage(err, "Gagal memperbarui data gudang."));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (saving) return;
    router.push("/admin/sarpras/gudang/master");
  };

  const isValid = form.nama.trim().length >= 3;

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <div className="shrink-0">
          <Sidebar active="sarpras" setActive={() => {}} collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b theme-border">
            <Header toggleSidebar={() => setCollapsed((prev) => !prev)} notifications={[]} user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }} />
          </div>
          <main className="theme-page flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-y-auto p-4">
            <div className={`theme-card w-full max-w-md rounded-3xl border ${themeBorderClass} p-8 shadow-lg`}>
              <div className="flex flex-col items-center text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}>
                  <Loader2 size={27} className="animate-spin" />
                </div>
                <h2 className="theme-text mt-5 text-base font-bold">Memuat Data Gudang</h2>
                <p className="theme-text-muted mt-1.5 text-sm">Mengambil detail gudang dari server...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <div className="shrink-0">
        <Sidebar active="sarpras" setActive={() => {}} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header toggleSidebar={() => setCollapsed((prev) => !prev)} notifications={[]} user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full p-4 sm:p-5 lg:p-7 xl:p-8 2xl:px-12">
            <div className="w-full">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className={`group mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium theme-text-secondary transition-all ${themeNeutralHover}`}
              >
                <ArrowLeft size={17} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                Kembali ke Daftar Gudang
              </button>

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} sm:h-14 sm:w-14`}>
                    <Boxes size={25} strokeWidth={1.9} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-[28px]">
                        Edit Gudang
                      </h1>
                      <span className={`rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-2.5 py-1 text-[10px] font-semibold`}>
                        ID #{id}
                      </span>
                    </div>
                    <p className="theme-text-muted mt-1 text-sm">
                      Perbarui informasi gudang yang tersimpan di sistem.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}>
                  <div className="theme-card theme-danger flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                    <AlertCircle size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="theme-danger text-sm font-semibold">Terjadi Kesalahan</p>
                    <p className="theme-danger mt-1 text-sm leading-5">{error}</p>
                  </div>
                  <button type="button" onClick={() => setError("")} className="theme-danger rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">
                    <X size={17} />
                  </button>
                </div>
              )}

              {success && (
                <div className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}>
                  <div className="theme-card theme-success flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="theme-success text-sm font-semibold">Berhasil</p>
                    <p className="theme-success mt-1 text-sm">{success}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 2xl:grid-cols-4">
                <form onSubmit={handleSubmit} className="min-w-0 lg:col-span-2 2xl:col-span-3">
                  <div className={`theme-card overflow-hidden rounded-3xl border ${themeBorderClass} shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]`}>
                    <div className={`border-b ${themeDivider} px-5 py-5 sm:px-7`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}>
                          <Database size={19} strokeWidth={1.9} />
                        </div>
                        <div>
                          <h2 className="theme-text text-sm font-bold">Informasi Gudang</h2>
                          <p className="theme-text-muted mt-0.5 text-xs">Perbarui data dasar gudang.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-7">
                      <div>
                        <label htmlFor="nama" className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Nama Gudang <span className="theme-danger ml-1">*</span>
                        </label>
                        <div className="relative">
                          <Boxes size={18} strokeWidth={1.8} className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="nama"
                            name="nama"
                            type="text"
                            value={form.nama}
                            onChange={handleChange}
                            disabled={saving}
                            maxLength={100}
                            required
                            placeholder="Contoh: Gudang Sarpras Utama"
                            className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[var(--color-text-placeholder)] ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="lokasi" className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Lokasi Gudang
                        </label>
                        <div className="relative">
                          <MapPin size={18} strokeWidth={1.8} className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="lokasi"
                            name="lokasi"
                            type="text"
                            value={form.lokasi}
                            onChange={handleChange}
                            disabled={saving}
                            maxLength={255}
                            placeholder="Contoh: Gedung A Lantai 1"
                            className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[var(--color-text-placeholder)] ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="keterangan" className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Keterangan
                        </label>
                        <div className="relative">
                          <FileText size={18} className="theme-text-muted pointer-events-none absolute left-3.5 top-4" />
                          <textarea
                            id="keterangan"
                            name="keterangan"
                            rows={4}
                            value={form.keterangan}
                            onChange={handleChange}
                            disabled={saving}
                            placeholder="Masukkan keterangan tambahan mengenai gudang..."
                            className={`theme-input w-full resize-y rounded-xl border ${themeBorderClass} py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[var(--color-text-placeholder)] ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--color-info)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_5%,transparent)] p-4">
                        <div className="flex items-start gap-3">
<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text shadow-sm">
                            <Info size={16} className="theme-primary-text" />
                          </div>
                          <div>
                            <p className="theme-text text-sm font-semibold">Informasi Pengelolaan</p>
                            <p className="theme-text-secondary mt-1 text-xs leading-relaxed">
                              Perubahan informasi gudang akan disimpan ke database sekolah. Data aset yang memiliki relasi dengan gudang ini tetap menggunakan ID gudang yang sama.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`flex flex-col-reverse gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7`}>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className={`theme-card theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border ${themeBorderClass} px-5 text-sm font-semibold shadow-sm transition-all ${themeNeutralHover} active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <X size={17} /> Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving || !isValid}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-6 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {saving ? (
                          <><Loader2 size={17} className="animate-spin" /> Menyimpan...</>
                        ) : (
                          <><Save size={17} /> Simpan Perubahan</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                <aside className="min-w-0">
                  <div className={`sticky top-5 overflow-hidden rounded-3xl border ${themeBorderClass} theme-card shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]`}>
                    <div className={`border-b ${themeDivider} px-5 py-5`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)]`}>
                            <Building2 size={19} strokeWidth={1.9} />
                          </div>
                          <div>
                            <h2 className="theme-text text-sm font-bold">Preview</h2>
                            <p className="theme-text-muted mt-0.5 text-xs">Ringkasan data gudang</p>
                          </div>
                        </div>
                        <div className={`h-2.5 w-2.5 rounded-full ${isValid ? "bg-[var(--color-success)]" : "bg-[color-mix(in_srgb,var(--color-text)_35%,transparent)]"}`} />
                      </div>
                    </div>

                    <div className="p-5">
                      <div className={`relative overflow-hidden rounded-2xl ${themePrimaryGradient} p-5`}>
                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-info)_16%,transparent)] blur-2xl" />

                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] text-[var(--color-card)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_15%,transparent)]">
                            <Boxes size={24} strokeWidth={1.8} />
                          </div>
                          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                            Gudang
                          </p>
                          <h3 className="mt-1 break-words text-lg font-bold leading-6 text-[var(--color-card)]">
                            {form.nama.trim() || "Nama Gudang"}
                          </h3>
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-[color-mix(in_srgb,var(--color-card)_75%,transparent)]">
                            <MapPin size={13} />
                            <span className="truncate">{form.lokasi.trim() || "Lokasi belum diisi"}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`theme-card mt-4 divide-y ${themeDivider} overflow-hidden rounded-2xl border ${themeBorderClass}`}>
                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="theme-text-muted" />
                            <span className="theme-text-muted text-xs font-medium">Kelengkapan</span>
                          </div>
                          <span className={`text-xs font-bold ${isValid ? "theme-success" : "theme-text-muted"}`}>
                            {isValid ? "Valid" : "Belum lengkap"}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <MapPin size={16} className="theme-text-muted shrink-0" />
                            <span className="theme-text-muted text-xs font-medium">Lokasi</span>
                          </div>
                          <span className="theme-text-secondary max-w-[170px] break-words text-right text-xs font-semibold">
                            {form.lokasi.trim() || "Belum diisi"}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <FileText size={16} className="theme-text-muted shrink-0" />
                            <span className="theme-text-muted text-xs font-medium">Keterangan</span>
                          </div>
                          <span className="theme-text-secondary max-w-[170px] break-words text-right text-xs font-semibold">
                            {form.keterangan.trim() || "Belum diisi"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Database size={16} className="theme-text-muted" />
                            <span className="theme-text-muted text-xs font-medium">ID Gudang</span>
                          </div>
                          <span className={`theme-card theme-text-secondary max-w-[150px] truncate rounded-lg border ${themeBorderClass} px-2 py-1 font-mono text-[10px] font-semibold`}>
                            {id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`border-t ${themeDivider} ${themeNeutralSurface} px-5 py-3.5`}>
                      <div className="flex items-center gap-2 theme-text-muted text-[11px]">
                        <CheckCircle2 size={14} className="theme-success" />
                        <span>Preview diperbarui otomatis</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              <div className={`mt-6 border-t ${themeDivider} pt-5 text-center`}>
                <p className="theme-text-muted text-xs">© 2026 SmartSchool • Modul Sarana & Prasarana</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}