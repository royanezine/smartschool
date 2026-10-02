"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  Layers3,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Hash,
  Sparkles,
  Info,
} from "lucide-react";

import Header from "../../../../../../../components/Header";
import Sidebar from "../../../../../../../components/Sidebar";

import {
  getGedung,
  getLantaiByGedung,
  updateLantai,
} from "../../../../../../../../services/infrastruktur.service";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_2px_12px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_8px_22px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeButtonShadow =
  "shadow-[0_5px_14px_color-mix(in_srgb,var(--color-text)_12%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeSoftSurfaceHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralDivider =
  "border-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

export default function EditLantaiPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [gedung, setGedung] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    gedungId: "",
    nama: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const gedungResult = await getGedung();

      if (!gedungResult?.success) {
        throw new Error(
          gedungResult?.message ||
            "Gagal mengambil data gedung."
        );
      }

      const gedungList = Array.isArray(gedungResult.data)
        ? gedungResult.data
        : [];

      setGedung(gedungList);

      let foundLantai = null;
      let foundGedungId = "";

      for (const item of gedungList) {
        try {
          const result = await getLantaiByGedung(item.id);

          if (!result?.success) {
            continue;
          }

          const lantaiList = Array.isArray(result.data)
            ? result.data
            : [];

          const found = lantaiList.find(
            (lantai) =>
              String(lantai.id) === String(id)
          );

          if (found) {
            foundLantai = found;
            foundGedungId =
              found?.gedungId || item.id;
            break;
          }
        } catch (err) {
          console.error(
            `Gagal mengambil lantai gedung ${item.id}:`,
            err
          );
        }
      }

      if (!foundLantai) {
        throw new Error(
          "Data lantai tidak ditemukan."
        );
      }

      setForm({
        gedungId:
          foundLantai?.gedungId ||
          foundGedungId ||
          "",
        nama: foundLantai?.nama || "",
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Gagal mengambil data lantai."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     SELECTED GEDUNG
  ========================================================= */

  const selectedGedung = useMemo(() => {
    return (
      gedung.find(
        (item) =>
          String(item?.id) ===
          String(form.gedungId)
      ) || null
    );
  }, [gedung, form.gedungId]);

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.gedungId) {
      setError("Silakan pilih gedung.");
      return;
    }

    if (!form.nama.trim()) {
      setError("Nama lantai wajib diisi.");
      return;
    }

    if (form.nama.trim().length > 50) {
      setError(
        "Nama lantai maksimal 50 karakter."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await updateLantai(id, {
        gedungId: form.gedungId,
        nama: form.nama.trim(),
      });

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Gagal memperbarui lantai."
        );
      }

      setSuccess(
        "Data lantai berhasil diperbarui."
      );

      setTimeout(() => {
        router.push(
          "/admin/sarpras/gedung/lantai"
        );
      }, 900);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat memperbarui data."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <div className="shrink-0">
          <Sidebar
            active="sarpras"
            setActive={() => {}}
            collapsed={false}
            setCollapsed={() => {}}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() => {}}
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email: "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="theme-page flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themeCardShadow}`}
              >
                <Loader2
                  size={25}
                  className="animate-spin text-[var(--color-primary)]"
                />
              </div>

              <div className="text-center">
                <p className="theme-text text-sm font-semibold">
                  Memuat data lantai
                </p>

                <p className="theme-text-muted mt-1 text-xs">
                  Mohon tunggu sebentar...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="shrink-0">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={false}
          setCollapsed={() => {}}
        />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10">
            <div className="mx-auto w-full max-w-[1280px]">

              {/* =================================================
                  TOP NAVIGATION
              ================================================= */}

              <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/sarpras/gedung/lantai"
                      )
                    }
                    className="group theme-text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft
                      size={17}
                      className="transition-transform duration-200 group-hover:-translate-x-1"
                    />

                    Kembali ke Data Lantai
                  </button>

                  <div className="mt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        Edit Lantai
                      </h1>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                        Edit Data
                      </span>
                    </div>

                    <p className="theme-text-muted mt-1.5 text-sm">
                      Perbarui informasi lantai yang
                      tersimpan di sistem SmartSchool.
                    </p>
                  </div>
                </div>

                {/* ID */}

                <div
                  className={`theme-card ${themeNeutralBorder} hidden items-center gap-2 rounded-xl border px-3.5 py-2.5 ${themeCardShadow} sm:flex`}
                >
                  <Hash
                    size={15}
                    className="theme-text-muted"
                  />

                  <div>
                    <p className="theme-text-muted text-[9px] font-semibold uppercase tracking-wider">
                      ID Lantai
                    </p>

                    <p className="theme-text-secondary mt-0.5 max-w-[160px] truncate font-mono text-[11px] font-medium">
                      {id}
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ERROR / SUCCESS
              ================================================= */}

              {error && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3.5 ${themeCardShadow}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeSoftSurface}`}
                  >
                    <AlertCircle
                      size={17}
                      className="theme-danger"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="theme-danger text-sm font-semibold">
                      Terjadi kesalahan
                    </p>

                    <p className="theme-text-secondary mt-0.5 text-xs leading-5">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {success && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} px-4 py-3.5 ${themeCardShadow}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeSoftSurface}`}
                  >
                    <CheckCircle2
                      size={17}
                      className="theme-success"
                    />
                  </div>

                  <div>
                    <p className="theme-success text-sm font-semibold">
                      Berhasil disimpan
                    </p>

                    <p className="theme-text-secondary mt-0.5 text-xs">
                      {success} Mengalihkan ke data
                      lantai...
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  MAIN GRID
              ================================================= */}

              <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">

                {/* =================================================
                    LEFT — FORM
                ================================================= */}

                <section
                  className={`theme-card ${themeNeutralBorder} overflow-hidden rounded-2xl border ${themeCardShadow}`}
                >

                  {/* FORM HEADER */}

                  <div
                    className={`border-b ${themeNeutralDivider} ${themeSoftSurface} px-5 py-5 sm:px-7`}
                  >
                    <div className="flex items-center justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3.5">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                        >
                          <Layers3
                            size={21}
                            strokeWidth={2}
                          />
                        </div>

                        <div className="min-w-0">
                          <h2 className="theme-text text-base font-bold">
                            Informasi Lantai
                          </h2>

                          <p className="theme-text-muted mt-0.5 text-xs">
                            Perbarui data sesuai kondisi
                            terbaru.
                          </p>
                        </div>
                      </div>

                      <div
                        className={`theme-text-muted ${themeNeutralBorder} hidden rounded-lg border ${themeSoftSurface} px-2.5 py-1.5 text-[10px] font-semibold sm:block`}
                      >
                        DATA LANTAI
                      </div>
                    </div>
                  </div>

                  {/* FORM */}

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6 p-5 sm:p-7">

                      {/* GEDUNG */}

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="gedungId"
                            className="theme-text-secondary text-sm font-semibold"
                          >
                            Gedung{" "}
                            <span className="theme-danger">
                              *
                            </span>
                          </label>

                          <span className="theme-text-muted text-[10px] font-medium">
                            Pilih lokasi gedung
                          </span>
                        </div>

                        <div className="relative">
                          <Building2
                            size={18}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                          />

                          <select
                            id="gedungId"
                            name="gedungId"
                            value={form.gedungId}
                            onChange={handleChange}
                            disabled={saving}
                            className={`theme-input theme-text theme-border h-12 w-full appearance-none rounded-xl border pl-11 pr-10 text-sm font-medium outline-none transition-all hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <option value="">
                              Pilih gedung
                            </option>

                            {gedung.map((item) => (
                              <option
                                key={item.id}
                                value={item.id}
                              >
                                {item.nama}
                                {item.kode
                                  ? ` (${item.kode})`
                                  : ""}
                              </option>
                            ))}
                          </select>

                          {/* CUSTOM ARROW */}

                          <div className="theme-text-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>

                        <p className="theme-text-muted mt-1.5 text-xs">
                          Gedung tempat lantai ini berada.
                        </p>
                      </div>

                      {/* NAMA LANTAI */}

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="nama"
                            className="theme-text-secondary text-sm font-semibold"
                          >
                            Nama Lantai{" "}
                            <span className="theme-danger">
                              *
                            </span>
                          </label>

                          <span className="theme-text-muted text-[10px] font-medium">
                            {form.nama.length}/50
                          </span>
                        </div>

                        <div className="relative">
                          <Layers3
                            size={18}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />

                          <input
                            id="nama"
                            type="text"
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            disabled={saving}
                            maxLength={50}
                            placeholder="Contoh: Lantai 1"
                            className={`theme-input theme-text theme-border h-12 w-full rounded-xl border pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[var(--color-text-placeholder)] hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>

                        <p className="theme-text-muted mt-1.5 text-xs">
                          Gunakan nama yang mudah
                          dikenali, misalnya Lantai 1
                          atau Lantai Dasar.
                        </p>
                      </div>

                      {/* INFORMATION BOX */}

                      <div
                        className={`rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`theme-card theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeButtonShadow}`}
                          >
                            <Info size={16} />
                          </div>

                          <div>
                            <p className="theme-info text-xs font-bold">
                              Informasi Pengelolaan
                            </p>

                            <p className="theme-text-secondary mt-1 text-xs leading-5">
                              Data yang dapat diperbarui
                              pada halaman ini adalah
                              gedung dan nama lantai.
                              Pengelolaan kelas dilakukan
                              melalui fitur terkait.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FORM FOOTER */}

                    <div
                      className={`flex flex-col-reverse gap-3 border-t ${themeNeutralDivider} ${themeSoftSurface} px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/sarpras/gedung/lantai"
                          )
                        }
                        disabled={saving}
                        className={`theme-card theme-text-secondary ${themeNeutralBorder} inline-flex h-11 items-center justify-center rounded-xl border px-6 text-sm font-semibold ${themeCardShadow} transition-all ${themeSoftSurfaceHover} active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {saving ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save
                              size={17}
                              strokeWidth={2.2}
                            />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </section>

                {/* =================================================
                    RIGHT — PREVIEW CARD
                ================================================= */}

                <aside className="xl:sticky xl:top-5">
                  <div
                    className={`theme-card ${themeNeutralBorder} overflow-hidden rounded-2xl border ${themeCardShadow}`}
                  >

                    {/* PREVIEW HEADER */}

                    <div
                      className={`border-b ${themeNeutralDivider} px-5 py-4.5`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-text)] text-[var(--color-card)] ${themeButtonShadow}`}
                          >
                            <Layers3
                              size={19}
                              strokeWidth={2}
                            />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Preview
                            </h2>

                            <p className="theme-text-muted text-[11px]">
                              Tampilan data lantai
                            </p>
                          </div>
                        </div>

                        <Sparkles
                          size={17}
                          className="text-[var(--color-primary)]"
                        />
                      </div>
                    </div>

                    {/* PREVIEW CONTENT */}

                    <div className="p-5">

                      {/* VISUAL */}

                      <div
                        className={`relative overflow-hidden rounded-2xl p-5 text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow}`}
                      >
                        <div
                          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]"
                        />

                        <div
                          className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--color-info)_20%,transparent)] blur-2xl"
                        />

                        <div className="relative">
                          <div className="mb-8 flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-card)_15%,transparent)]">
                              <Layers3 size={22} />
                            </div>

                            <span className="rounded-full border border-[color-mix(in_srgb,var(--color-card)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[color-mix(in_srgb,var(--color-card)_90%,transparent)]">
                              Lantai
                            </span>
                          </div>

                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]">
                            Nama Lantai
                          </p>

                          <h3 className="mt-1.5 truncate text-xl font-bold tracking-tight">
                            {form.nama.trim() ||
                              "Nama Lantai"}
                          </h3>

                          <div className="mt-3 flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]">
                            <Building2 size={14} />

                            <span className="truncate">
                              {selectedGedung?.nama ||
                                "Belum memilih gedung"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DETAIL */}

                      <div
                        className={`theme-border mt-4 overflow-hidden rounded-xl border ${themeSoftSurface}`}
                      >

                        {/* GEDUNG */}

                        <div
                          className={`flex items-center gap-3 border-b ${themeNeutralDivider} px-4 py-3.5`}
                        >
                          <div
                            className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-primary)] ${themeButtonShadow}`}
                          >
                            <Building2 size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                              Gedung
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {selectedGedung?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>
                        </div>

                        {/* KODE GEDUNG */}

                        <div
                          className={`flex items-center gap-3 border-b ${themeNeutralDivider} px-4 py-3.5`}
                        >
                          <div
                            className={`theme-card theme-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeButtonShadow}`}
                          >
                            <Hash size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                              Kode Gedung
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {selectedGedung?.kode ||
                                "Tidak ada kode"}
                            </p>
                          </div>
                        </div>

                        {/* ID */}

                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div
                            className={`theme-card theme-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeButtonShadow}`}
                          >
                            <Hash size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                              ID Lantai
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate font-mono text-[10px] font-medium">
                              {id}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* STATUS */}

                      <div
                        className={`mt-4 flex items-start gap-2.5 rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} px-3.5 py-3`}
                      >
                        <CheckCircle2
                          size={16}
                          className="theme-success mt-0.5 shrink-0"
                        />

                        <div>
                          <p className="theme-success text-[11px] font-semibold">
                            Data siap diperbarui
                          </p>

                          <p className="theme-text-secondary mt-0.5 text-[10px] leading-4">
                            Preview akan mengikuti
                            perubahan yang kamu masukkan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QUICK INFO */}

                  <div
                    className={`theme-card ${themeNeutralBorder} mt-4 rounded-2xl border p-4 ${themeCardShadow}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
                      >
                        <Info size={15} />
                      </div>

                      <div>
                        <p className="theme-text-secondary text-xs font-semibold">
                          Tentang Data Lantai
                        </p>

                        <p className="theme-text-muted mt-1 text-[11px] leading-5">
                          Satu lantai terhubung dengan
                          satu gedung. Pastikan gedung
                          yang dipilih sudah sesuai.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div
                className={`mt-7 border-t ${themeNeutralDivider} py-5 text-center`}
              >
                <p className="theme-text-muted text-[11px]">
                  © 2026 SmartSchool • Edit Lantai •
                  Sarana & Prasarana
                </p>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}