"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Tag,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers3,
  RefreshCw,
  X,
  Hash,
  Eye,
  Check,
  CircleSlash,
  Sparkles,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getKategoriAset,
  updateKategoriAset,
} from "@/services/sarpras.service";


function extractArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.result?.data)) return response.result.data;
  return [];
}


const primaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const primarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const primaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const primaryBorderHover =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]";

const primaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const primaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const neutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_12%,transparent)]";

const neutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const neutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const successSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const successBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const cardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const focusStyle =
  "focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";


export default function EditKategoriPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    status: "aktif",
  });

  const [originalData, setOriginalData] = useState(null);


  const loadKategori = useCallback(async () => {
    if (!id) {
      setError("ID kategori tidak ditemukan pada URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await getKategoriAset();
      const list = extractArray(response);

      const kategori = list.find((item) => String(item?.id) === String(id));

      if (!kategori) {
        setOriginalData(null);
        setError("Kategori aset tidak ditemukan.");
        return;
      }

      setOriginalData(kategori);

      setForm({
        nama: kategori.nama ?? "",
        status: String(kategori.status ?? "aktif").toLowerCase(),
      });
    } catch (err) {
      console.error("Gagal mengambil detail kategori:", err);
      setError(err?.message || "Gagal mengambil detail kategori aset.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadKategori();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadKategori]);


  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  }

  function handleStatusChange(status) {
    setForm((prev) => ({ ...prev, status }));
    setError("");
    setSuccess("");
  }


  async function handleSubmit(event) {
    event.preventDefault();

    if (!id || !originalData) {
      setError("Data kategori belum tersedia.");
      return;
    }

    const nama = form.nama.trim();

    if (!nama) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    if (nama.length > 100) {
      setError("Nama kategori maksimal 100 karakter.");
      return;
    }

    if (!["aktif", "nonaktif"].includes(form.status)) {
      setError("Status kategori tidak valid.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateKategoriAset(id, { nama, status: form.status });

      setSuccess("Kategori aset berhasil diperbarui.");

      window.setTimeout(() => {
        router.push("/admin/sarpras/kategori");
        router.refresh();
      }, 900);
    } catch (err) {
      console.error("Gagal memperbarui kategori:", err);
      setError(err?.message || "Gagal memperbarui kategori aset.");
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setIsCollapsed((v) => !v)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">

            <div className="theme-text-muted mb-4 flex items-center gap-2 text-xs">
              <Link
                href="/admin/sarpras/kategori"
                className="transition hover:text-[var(--color-primary)]"
              >
                Kategori Aset
              </Link>
              <span>/</span>
              <span className="theme-text-secondary font-semibold">
                Edit Kategori
              </span>
            </div>


            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${primaryGradient} text-[var(--color-card)] ${primaryShadow} sm:h-14 sm:w-14`}
              >
                <Tag size={24} strokeWidth={1.9} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Sarana & Prasarana
                </p>
                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-[26px]">
                  Edit Kategori Aset
                </h1>
                <p className="theme-text-secondary mt-1 text-sm leading-6">
                  Perbarui informasi kategori inventaris sesuai data
                  yang tersimpan pada sistem.
                </p>
              </div>

              <Link
                href="/admin/sarpras/kategori"
                className={`theme-card theme-text-secondary inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border ${neutralBorder} px-4 text-sm font-semibold transition ${neutralHover}`}
              >
                <ArrowLeft size={16} />
                Kembali
              </Link>
            </div>


            {error && (
              <div
                role="alert"
                className={`mb-5 flex items-start gap-3 rounded-xl border ${neutralBorder} ${neutralSurface} p-4`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${neutralSurface} theme-danger`}
                >
                  <AlertCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="theme-text text-sm font-bold">
                    Gagal memproses data
                  </p>
                  <p className="theme-text-secondary mt-1 break-words text-sm leading-5">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadKategori}
                  disabled={loading || saving}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border theme-border px-2.5 py-1 text-xs font-semibold theme-text-secondary transition hover:theme-card-soft disabled:opacity-50"
                >
                  <RefreshCw size={13} />
                  Muat ulang
                </button>
              </div>
            )}

            {success && (
              <div
                role="status"
                className={`mb-5 flex items-center gap-3 rounded-xl border ${successBorder} ${successSoft} p-4`}
              >
                <div className="theme-success flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <CheckCircle2 size={18} />
                </div>
                <p className="theme-success text-sm font-semibold">
                  {success}
                </p>
              </div>
            )}


            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

              <section
                className={`theme-card overflow-hidden rounded-2xl border ${primaryBorder} ${cardShadow}`}
              >
                <div
                  className={`flex items-center gap-3 border-b ${neutralBorder} px-5 py-4 sm:px-6`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
                  >
                    <Layers3 size={19} />
                  </div>
                  <div>
                    <h2 className="theme-text text-sm font-bold">
                      Informasi Kategori
                    </h2>
                    <p className="theme-text-muted mt-0.5 text-xs">
                      Ubah nama dan status kategori aset.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${primarySoft} text-[var(--color-primary)]`}
                    >
                      <Loader2 size={26} className="animate-spin" />
                    </div>
                    <p className="theme-text mt-4 text-sm font-semibold">
                      Memuat data kategori...
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Mohon tunggu sebentar.
                    </p>
                  </div>
                ) : !originalData ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${neutralSurface} theme-text-muted`}
                    >
                      <AlertCircle size={26} />
                    </div>
                    <p className="theme-text mt-3 text-sm font-bold">
                      Data kategori tidak tersedia
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Periksa ID kategori atau muat ulang data.
                    </p>
                    <button
                      type="button"
                      onClick={loadKategori}
                      className={`mt-5 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] ${primaryGradient} ${primaryShadow}`}
                    >
                      <RefreshCw size={15} />
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-5 px-5 py-6 sm:px-6 sm:py-7">
                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                          ID Kategori
                        </label>
                        <div
                          className={`flex min-h-11 items-center gap-2 rounded-xl border ${neutralBorder} ${neutralSurface} px-3.5 font-mono text-xs theme-text-muted`}
                        >
                          <Hash size={14} className="shrink-0" />
                          <span className="break-all">{originalData.id}</span>
                        </div>
                        <p className="theme-text-muted mt-1.5 text-[11px]">
                          ID tidak dapat diubah melalui form ini.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="nama"
                          className="theme-text-secondary mb-2 block text-xs font-semibold"
                        >
                          Nama Kategori{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>

                        <div className="relative">
                          <Tag
                            size={16}
                            className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <input
                            id="nama"
                            name="nama"
                            type="text"
                            value={form.nama}
                            onChange={handleChange}
                            placeholder="Contoh: Elektronik"
                            maxLength={100}
                            required
                            disabled={saving}
                            autoComplete="off"
                            className={`theme-input h-11 w-full rounded-xl border ${neutralBorder} pl-10 pr-3.5 text-sm font-medium outline-none transition ${focusStyle} disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>

                        <div className="mt-1.5 flex items-center justify-between gap-3">
                          <p className="theme-text-muted text-[11px]">
                            Gunakan nama yang jelas dan mudah dikenali.
                          </p>
                          <span className="theme-text-muted shrink-0 text-[11px]">
                            {form.nama.length}/100
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                          Status Kategori{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <StatusOption
                            active={form.status === "aktif"}
                            onClick={() => handleStatusChange("aktif")}
                            icon={Check}
                            label="Aktif"
                            description="Kategori siap digunakan"
                            tone="success"
                            disabled={saving}
                          />
                          <StatusOption
                            active={form.status === "nonaktif"}
                            onClick={() => handleStatusChange("nonaktif")}
                            icon={CircleSlash}
                            label="Nonaktif"
                            description="Sementara tidak dipakai"
                            tone="neutral"
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`flex flex-col-reverse gap-2 border-t ${neutralBorder} ${neutralSurface} px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
                    >
                      <p className="theme-text-muted text-[11px] leading-5">
                        Periksa kembali data sebelum menyimpan.
                      </p>

                      <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <Link
                          href="/admin/sarpras/kategori"
                          className={`theme-card theme-text-secondary inline-flex h-10 items-center justify-center rounded-xl border ${neutralBorder} px-5 text-sm font-semibold transition ${neutralHover}`}
                        >
                          Batal
                        </Link>

                        <button
                          type="submit"
                          disabled={saving || loading}
                          className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 ${primaryGradient} ${primaryShadow}`}
                        >
                          {saving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Menyimpan...
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
              </section>


              <aside className="min-w-0">
                <div
                  className={`theme-card overflow-hidden rounded-2xl border ${neutralBorder} ${cardShadow} xl:sticky xl:top-5`}
                >
                  <div
                    className={`flex items-center justify-between border-b ${neutralBorder} px-5 py-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${primaryGradient} text-[var(--color-card)]`}
                      >
                        <Eye size={16} />
                      </div>
                      <div>
                        <h2 className="theme-text text-sm font-bold">
                          Preview
                        </h2>
                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Tampilan kartu kategori
                        </p>
                      </div>
                    </div>
                    <Sparkles
                      size={15}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div className="p-4">
                    <div
                      className={`rounded-xl border ${neutralBorder} ${neutralSurface} p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${primarySoft} text-[var(--color-primary)]`}
                        >
                          <Tag size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                            Kategori Aset
                          </p>
                          <p className="theme-text mt-1 break-words text-sm font-bold">
                            {form.nama.trim() || "Nama Kategori"}
                          </p>
                          <p className="theme-text-muted mt-1 text-[11px]">
                            {form.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </p>
                        </div>
                      </div>

                      <div className={`my-4 h-px border-t ${neutralBorder}`} />

                      <div className="flex items-center justify-between gap-2">
                        <span className="theme-text-muted text-[11px]">
                          Status
                        </span>
                        {form.status === "aktif" ? (
                          <span className="theme-success inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            Aktif
                          </span>
                        ) : (
                          <span className="theme-text-secondary inline-flex items-center gap-1.5 rounded-full border theme-border theme-card-soft px-2.5 py-1 text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            Nonaktif
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="theme-text-muted text-[11px]">
                          ID
                        </span>
                        <span className="theme-text-muted max-w-[150px] truncate font-mono text-[10px]">
                          {originalData?.id || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border-t ${neutralBorder} ${neutralSurface} px-5 py-3.5`}
                  >
                    <p className="theme-text-muted text-[10px] leading-4">
                      Preview diperbarui otomatis mengikuti data yang
                      kamu masukkan.
                    </p>
                  </div>
                </div>
              </aside>
            </div>


            <div className="mt-6 text-center">
              <p className="theme-text-muted text-[11px]">
                SmartSchool • Modul Sarana & Prasarana
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function StatusOption({
  active,
  onClick,
  icon: Icon,
  label,
  description,
  tone = "neutral",
  disabled,
}) {
  const toneActive = {
    success: {
      border: "border-[color-mix(in_srgb,var(--color-success)_35%,transparent)]",
      bg: "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
      icon: "text-[var(--color-success)]",
    },
    neutral: {
      border: neutralBorder,
      bg: neutralSurface,
      icon: "theme-text-secondary",
    },
  };

  const style = toneActive[tone] || toneActive.neutral;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`group flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
        active
          ? `${style.border} ${style.bg} shadow-sm`
          : `theme-card ${neutralBorder} ${neutralHover}`
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active ? style.bg : neutralSurface
        } ${active ? style.icon : "theme-text-muted"}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="theme-text text-xs font-bold">{label}</p>
        <p className="theme-text-muted mt-0.5 text-[11px] leading-4">
          {description}
        </p>
      </div>

      {active && (
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${style.bg}`}
        >
          <Check size={12} className={style.icon} />
        </div>
      )}
    </button>
  );
}