"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers3,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  getGedung,
  createLantai,
} from "../../../../../../../services/infrastruktur.service";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeButtonShadow =
  "shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeButtonHoverShadow =
  "hover:shadow-[0_9px_22px_color-mix(in_srgb,var(--color-primary)_28%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryGradientHover =
  "hover:brightness-95";

const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

// ============================================================
// COMPONENT
// ============================================================

export default function TambahLantaiPage() {
  const router = useRouter();

  const [gedung, setGedung] = useState([]);
  const [loadingGedung, setLoadingGedung] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    gedungId: "",
    nama: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD GEDUNG
  // ============================================================

  useEffect(() => {
    loadGedung();
  }, []);

  async function loadGedung() {
    try {
      setLoadingGedung(true);
      setError("");

      const result = await getGedung();

      if (!result?.success) {
        throw new Error(
          result?.message || "Gagal mengambil data gedung."
        );
      }

      setGedung(result.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.message || "Gagal mengambil data gedung."
      );
    } finally {
      setLoadingGedung(false);
    }
  }

  // ============================================================
  // HANDLE CHANGE
  // ============================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.gedungId) {
      setError("Silakan pilih gedung terlebih dahulu.");
      return;
    }

    if (!form.nama.trim()) {
      setError("Nama lantai wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await createLantai({
        gedungId: form.gedungId,
        nama: form.nama.trim(),
      });

      if (!result?.success) {
        throw new Error(
          result?.message || "Gagal menambahkan lantai."
        );
      }

      setSuccess("Lantai berhasil ditambahkan.");

      setTimeout(() => {
        router.push("/admin/sarpras/gedung/lantai");
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <Header
          toggleSidebar={() => {}}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* ====================================================
            MAIN
        ==================================================== */}

        <main className="theme-page min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-4xl space-y-6">

              {/* =================================================
                  HEADER SECTION
              ================================================= */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    onClick={() =>
                      router.push(
                        "/admin/sarpras/gedung/lantai"
                      )
                    }
                    className={`mb-3 inline-flex items-center gap-2 text-sm font-medium theme-text-muted transition ${themePrimaryHover}`}
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Data Lantai
                  </button>

                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                    Tambah Lantai
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Tambahkan data lantai baru pada gedung sekolah.
                  </p>
                </div>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div
                  className="
                    flex items-start gap-3 rounded-xl
                    border
                    border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                    px-4 py-3.5
                    text-sm
                    shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  "
                >
                  <div
                    className="
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-lg
                      bg-[var(--color-card)]
                      theme-danger
                    "
                  >
                    <AlertCircle
                      size={18}
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

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (
                <div
                  className="
                    flex items-start gap-3 rounded-xl
                    border
                    border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]
                    px-4 py-3.5
                    text-sm
                    shadow-[0_2px_8px_color-mix(in_srgb,var(--color-success)_6%,transparent)]
                  "
                >
                  <div
                    className="
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-lg
                      bg-[var(--color-card)]
                      theme-success
                    "
                  >
                    <CheckCircle2
                      size={18}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="theme-success text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="theme-text-secondary mt-0.5 text-xs leading-5">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleSubmit}>
                <div
                  className={`
                    theme-card
                    overflow-hidden
                    rounded-2xl
                    border theme-border
                    ${themeCardShadow}
                  `}
                >
                  {/* =================================================
                      FORM HEADER
                  ================================================= */}

                  <div
                    className="
                      border-b theme-border
                      bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-card))]
                      px-6 py-5
                      sm:px-8
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-xl
                          ${themePrimaryGradient}
                          text-[var(--color-card)]
                          shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        `}
                      >
                        <Layers3 size={22} />
                      </div>

                      <div>
                        <h2 className="theme-text text-base font-semibold">
                          Informasi Lantai
                        </h2>

                        <p className="theme-text-secondary text-sm">
                          Isi informasi lantai dengan lengkap.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      FORM BODY
                  ================================================= */}

                  <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">

                    {/* =================================================
                        GEDUNG
                    ================================================= */}

                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Gedung{" "}
                        <span className="theme-danger">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Building2
                          size={18}
                          className="
                            theme-text-muted
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            -translate-y-1/2
                          "
                        />

                        <select
                          name="gedungId"
                          value={form.gedungId}
                          onChange={handleChange}
                          disabled={
                            loadingGedung || saving
                          }
                          className={`
                            theme-input
                            theme-text
                            h-12 w-full
                            appearance-none
                            rounded-xl
                            border theme-border
                            pl-11 pr-4
                            text-sm
                            outline-none
                            transition-all
                            hover:border-[color-mix(in_srgb,var(--color-text)_20%,transparent)]
                            ${themeFocus}
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          `}
                        >
                          <option value="">
                            {loadingGedung
                              ? "Memuat gedung..."
                              : "Pilih gedung"}
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

                        <div
                          className="
                            theme-text-muted
                            pointer-events-none
                            absolute right-4 top-1/2
                            -translate-y-1/2
                          "
                        >
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

                      {!loadingGedung &&
                        gedung.length === 0 && (
                          <p
                            className="
                              theme-warning
                              mt-2 flex items-center gap-1.5
                              text-xs
                            "
                          >
                            <AlertCircle size={13} />

                            Belum ada gedung.
                            Tambahkan gedung terlebih
                            dahulu.
                          </p>
                        )}
                    </div>

                    {/* =================================================
                        NAMA LANTAI
                    ================================================= */}

                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Nama Lantai{" "}
                        <span className="theme-danger">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Layers3
                          size={18}
                          className="
                            theme-text-muted
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            -translate-y-1/2
                          "
                        />

                        <input
                          type="text"
                          name="nama"
                          value={form.nama}
                          onChange={handleChange}
                          disabled={saving}
                          placeholder="Contoh: Lantai 1"
                          maxLength={50}
                          className={`
                            theme-input
                            theme-text
                            h-12 w-full
                            rounded-xl
                            border theme-border
                            pl-11 pr-4
                            text-sm
                            outline-none
                            transition-all
                            placeholder:theme-text-placeholder
                            hover:border-[color-mix(in_srgb,var(--color-text)_20%,transparent)]
                            ${themeFocus}
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          `}
                        />
                      </div>

                      <p className="theme-text-muted mt-2 text-xs">
                        Maksimal 50 karakter.
                      </p>
                    </div>
                  </div>

                  {/* =================================================
                      FORM FOOTER
                  ================================================= */}

                  <div
                    className="
                      flex flex-col-reverse gap-3
                      border-t theme-border
                      bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
                      px-6 py-4
                      sm:flex-row
                      sm:justify-end
                      sm:px-8
                    "
                  >
                    {/* BATAL */}

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/sarpras/gedung/lantai"
                        )
                      }
                      disabled={saving}
                      className="
                        theme-card
                        theme-text-secondary
                        inline-flex h-11
                        items-center justify-center
                        gap-2
                        rounded-xl
                        border theme-border
                        px-6
                        text-sm font-medium
                        shadow-[0_2px_5px_color-mix(in_srgb,var(--color-text)_5%,transparent)]
                        transition-all
                        hover:border-[color-mix(in_srgb,var(--color-text)_20%,transparent)]
                        hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                        hover:text-[var(--color-text)]
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      Batal
                    </button>

                    {/* SIMPAN */}

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        loadingGedung ||
                        gedung.length === 0
                      }
                      className={`
                        inline-flex h-11
                        items-center justify-center
                        gap-2
                        rounded-xl
                        px-6
                        text-sm font-semibold
                        text-[var(--color-card)]
                        ${themePrimaryGradient}
                        ${themeButtonShadow}
                        ${themeButtonHoverShadow}
                        ${themePrimaryGradientHover}
                        transition-all
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      `}
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
                          <Save size={17} />

                          Simpan Lantai
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}