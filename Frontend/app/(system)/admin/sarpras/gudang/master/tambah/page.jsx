"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Warehouse,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  CircleCheck,
  CircleAlert,
  Building2,
  ShieldCheck,
} from "lucide-react";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  createGudang,
} from "../../../../../../../services/sarpras.service";

/* =========================================================
   GLOBAL THEME
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

/* =========================================================
   PAGE
========================================================= */

export default function TambahMasterGudangPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    status: "aktif",
  });

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const nama = form.nama.trim();
    const lokasi = form.lokasi.trim();

    if (!nama) {
      setError(
        "Nama gudang wajib diisi."
      );
      return;
    }

    if (nama.length < 3) {
      setError(
        "Nama gudang minimal 3 karakter."
      );
      return;
    }

    if (nama.length > 100) {
      setError(
        "Nama gudang maksimal 100 karakter."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nama,
        lokasi: lokasi || null,
        status: form.status,
      };

      console.log(
        "Payload create gudang:",
        payload
      );

      await createGudang(payload);

      setSaved(true);

      setTimeout(() => {
        router.push(
          "/admin/sarpras/gudang/master"
        );
      }, 1000);
    } catch (err) {
      console.error(
        "Gagal membuat gudang:",
        err
      );

      setError(
        err?.message ||
          "Gagal menyimpan gudang. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     SIDEBAR
  ========================================================= */

  function toggleSidebar() {
    setIsCollapsed(
      (current) => !current
    );
  }

  /* =========================================================
     FORM STATUS
  ========================================================= */

  const isFormComplete =
    form.nama.trim().length >= 3;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">

        {/* ===================================================
            HEADER
        =================================================== */}

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* =================================================
                BACK
            ================================================= */}

            <Link
              href="/admin/sarpras/gudang/master"
              className={`mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} ${themePrimaryText}`}
            >
              <ArrowLeft size={18} />

              Kembali ke Master Gudang
            </Link>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <span
                    className={`rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-3 py-1 text-xs font-semibold`}
                  >
                    SARPRAS
                  </span>

                  <span className="theme-text-muted text-xs">
                    Master Gudang
                  </span>

                </div>

                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                  Tambah Gudang
                </h1>

                <p className="theme-text-muted mt-1 max-w-2xl text-sm leading-6">
                  Tambahkan data gudang baru
                  untuk mengelola penyimpanan
                  sarana dan prasarana sekolah.
                </p>

              </div>

              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} ${themeSmallShadow}`}
              >
                <Warehouse size={27} />
              </div>

            </div>

            {/* =================================================
                ALERT ERROR
            ================================================= */}

            {error && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3.5 text-sm shadow-sm`}
              >

                <div
                  className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-danger ${themeSmallShadow}`}
                >
                  <AlertCircle
                    size={19}
                  />
                </div>

                <div className="flex-1">
                  <p className="theme-danger text-sm font-semibold">
                    Terjadi Kesalahan
                  </p>

                  <p className="theme-danger mt-0.5 text-sm">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="theme-danger rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"
                >
                  <span className="sr-only">
                    Tutup
                  </span>

                  ×
                </button>

              </div>
            )}

            {/* =================================================
                ALERT SUCCESS
            ================================================= */}

            {saved && (
              <div
                className={`mb-5 flex items-center gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} px-4 py-3.5 text-sm font-semibold theme-success shadow-sm`}
              >

                <div
                  className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-success ${themeSmallShadow}`}
                >
                  <CheckCircle2 size={19} />
                </div>

                <span>
                  Gudang berhasil ditambahkan.
                  Mengalihkan...
                </span>

              </div>
            )}

            {/* =================================================
                GRID
            ================================================= */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

              {/* =================================================
                  LEFT - FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
              >

                <div
                  className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >

                  {/* =================================================
                      FORM HEADER
                  ================================================= */}

                  <div
                    className={`border-b ${themeDivider} px-5 py-5 sm:px-7`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <Warehouse size={21} />
                      </div>

                      <div className="min-w-0">

                        <h2 className="theme-text text-base font-bold sm:text-lg">
                          Informasi Gudang
                        </h2>

                        <p className="theme-text-muted mt-0.5 text-sm">
                          Lengkapi informasi utama
                          gudang.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      FORM BODY
                  ================================================= */}

                  <div className="space-y-6 px-5 py-6 sm:px-7">

                    {/* =================================================
                        NAMA GUDANG
                    ================================================= */}

                    <div>

                      <label
                        htmlFor="nama"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Nama Gudang

                        <span className="theme-danger ml-1">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <Warehouse
                          size={18}
                          className="theme-text-muted pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2"
                        />

                        <input
                          id="nama"
                          type="text"
                          name="nama"
                          value={form.nama}
                          onChange={
                            handleChange
                          }
                          maxLength={100}
                          autoComplete="off"
                          placeholder="Contoh: Gudang Utama"
                          className={`theme-input h-12 w-full rounded-xl border ${themeNeutralBorder} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                        />

                      </div>

                      <div className="mt-1.5 flex items-center justify-between gap-3">

                        <p className="theme-text-muted text-xs">
                          Minimal 3 karakter,
                          maksimal 100 karakter.
                        </p>

                        <span className="theme-text-muted shrink-0 text-xs font-medium">
                          {form.nama.length}/100
                        </span>

                      </div>

                    </div>

                    {/* =================================================
                        LOKASI
                    ================================================= */}

                    <div>

                      <label
                        htmlFor="lokasi"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Lokasi Gudang
                      </label>

                      <div className="relative">

                        <MapPin
                          size={18}
                          className="theme-text-muted pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2"
                        />

                        <input
                          id="lokasi"
                          type="text"
                          name="lokasi"
                          value={form.lokasi}
                          onChange={
                            handleChange
                          }
                          maxLength={255}
                          autoComplete="off"
                          placeholder="Contoh: Gedung A Lantai 1"
                          className={`theme-input h-12 w-full rounded-xl border ${themeNeutralBorder} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                        />

                      </div>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Lokasi bersifat opsional.
                      </p>

                    </div>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <div>

                      <label
                        htmlFor="status"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Status

                        <span className="theme-danger ml-1">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <ShieldCheck
                          size={18}
                          className="theme-text-muted pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2"
                        />

                        <select
                          id="status"
                          name="status"
                          value={form.status}
                          onChange={
                            handleChange
                          }
                          className={`theme-input h-12 w-full cursor-pointer appearance-none rounded-xl border ${themeNeutralBorder} pl-11 pr-10 text-sm font-semibold outline-none transition ${themeFocus}`}
                        >

                          <option value="aktif">
                            Aktif
                          </option>

                          <option value="nonaktif">
                            Nonaktif
                          </option>

                        </select>

                        {/* CUSTOM ARROW */}

                        <div className="theme-text-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">

                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>

                        </div>

                      </div>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Gudang aktif dapat digunakan
                        untuk penyimpanan aset.
                      </p>

                    </div>

                  </div>

                  {/* =================================================
                      FORM FOOTER
                  ================================================= */}

                  <div
                    className={`flex flex-col-reverse gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-5 sm:flex-row sm:justify-end sm:px-7`}
                  >

                    <Link
                      href="/admin/sarpras/gudang/master"
                      className={`theme-card theme-text-secondary inline-flex h-11 items-center justify-center rounded-xl border ${themeNeutralBorder} px-5 text-sm font-semibold transition ${themeNeutralHover}`}
                    >
                      Batal
                    </Link>

                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none`}
                    >

                      {saving ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />

                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={18} />

                          Simpan Gudang
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </form>

              {/* =================================================
                  RIGHT - PREVIEW
              ================================================= */}

              <aside className="space-y-5">

                {/* =================================================
                    PREVIEW CARD
                ================================================= */}

                <div
                  className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} xl:sticky xl:top-6`}
                >

                  {/* CARD HEADER */}

                  <div
                    className={`border-b ${themeDivider} ${themePrimarySoft} px-5 py-5`}
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p
                          className={`text-xs font-bold uppercase tracking-wider ${themePrimaryText}`}
                        >
                          Preview
                        </p>

                        <h3 className="theme-text mt-1 text-lg font-bold">
                          Data Gudang
                        </h3>

                      </div>

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeCardShadow} theme-card ${themePrimaryText} ring-1 ${themePrimarySoftBorder}`}
                      >
                        <Building2 size={21} />
                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      PREVIEW BODY
                  ================================================= */}

                  <div className="p-5">

                    {/* NAME PREVIEW */}

                    <div
                      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                    >

                      <p className="theme-text-muted mb-1 text-xs font-semibold uppercase tracking-wide">
                        Nama Gudang
                      </p>

                      <p
                        className={`break-words text-base font-bold ${
                          form.nama.trim()
                            ? "theme-text"
                            : "theme-text-placeholder"
                        }`}
                      >
                        {form.nama.trim() ||
                          "Nama gudang belum diisi"}
                      </p>

                    </div>

                    {/* =================================================
                        INFO LIST
                    ================================================= */}

                    <div className="mt-4 space-y-3">

                      {/* LOCATION */}

                      <div className="flex items-start gap-3">

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                        >
                          <MapPin size={17} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="theme-text-muted text-xs font-medium">
                            Lokasi
                          </p>

                          <p
                            className={`mt-0.5 break-words text-sm font-semibold ${
                              form.lokasi.trim()
                                ? "theme-text-secondary"
                                : "theme-text-placeholder"
                            }`}
                          >
                            {form.lokasi.trim() ||
                              "Belum ditentukan"}
                          </p>

                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="flex items-start gap-3">

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeSuccessSurface} theme-success`}
                        >
                          <ShieldCheck size={17} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="theme-text-muted text-xs font-medium">
                            Status
                          </p>

                          <div className="mt-1">

                            {form.status ===
                            "aktif" ? (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full ${themeSuccessSurface} px-2.5 py-1 text-xs font-bold theme-success`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />

                                Aktif
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full ${themeNeutralSurface} px-2.5 py-1 text-xs font-bold theme-text-muted`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-text)_40%,transparent)]" />

                                Nonaktif
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div
                      className={`my-5 border-t ${themeDivider}`}
                    />

                    {/* =================================================
                        COMPLETION
                    ================================================= */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <p className="theme-text-secondary text-sm font-semibold">
                          Kelengkapan Data
                        </p>

                        <span
                          className={`text-xs font-bold ${
                            isFormComplete
                              ? "theme-success"
                              : "theme-text-muted"
                          }`}
                        >
                          {isFormComplete
                            ? "Lengkap"
                            : "Belum lengkap"}
                        </span>

                      </div>

                      <div
                        className={`h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                      >

                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFormComplete
                              ? "w-full bg-[var(--color-success)]"
                              : form.nama.length > 0
                              ? "w-1/2 bg-[var(--color-primary)]"
                              : "w-0"
                          }`}
                        />

                      </div>

                    </div>

                    {/* =================================================
                        CHECKLIST
                    ================================================= */}

                    <div className="mt-5 space-y-2.5">

                      {/* NAMA */}

                      <div className="flex items-center gap-2.5">

                        {form.nama.trim()
                          .length >= 3 ? (
                          <CircleCheck
                            size={17}
                            className="theme-success shrink-0"
                          />
                        ) : (
                          <CircleAlert
                            size={17}
                            className="theme-text-placeholder shrink-0"
                          />
                        )}

                        <span
                          className={`text-xs ${
                            form.nama.trim()
                              .length >= 3
                              ? "theme-text-secondary font-medium"
                              : "theme-text-muted"
                          }`}
                        >
                          Nama gudang sudah
                          valid
                        </span>

                      </div>

                      {/* LOKASI */}

                      <div className="flex items-center gap-2.5">

                        {form.lokasi.trim() ? (
                          <CircleCheck
                            size={17}
                            className="theme-success shrink-0"
                          />
                        ) : (
                          <CircleAlert
                            size={17}
                            className="theme-text-placeholder shrink-0"
                          />
                        )}

                        <span
                          className={`text-xs ${
                            form.lokasi.trim()
                              ? "theme-text-secondary font-medium"
                              : "theme-text-muted"
                          }`}
                        >
                          Lokasi gudang
                          ditambahkan
                        </span>

                      </div>

                      {/* STATUS */}

                      <div className="flex items-center gap-2.5">

                        <CircleCheck
                          size={17}
                          className="theme-success shrink-0"
                        />

                        <span className="theme-text-secondary text-xs font-medium">
                          Status gudang dipilih
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    INFORMATION CARD
                ================================================= */}

                <div
                  className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-5`}
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info ${themeSmallShadow}`}
                    >
                      <Info size={18} />
                    </div>

                    <div>

                      <h4 className="theme-text text-sm font-bold">
                        Informasi
                      </h4>

                      <p className="theme-text-secondary mt-1.5 text-xs leading-5">
                        Gunakan nama gudang
                        yang mudah dikenali,
                        misalnya berdasarkan
                        fungsi atau lokasi
                        penyimpanannya.
                      </p>

                    </div>

                  </div>

                </div>

              </aside>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}