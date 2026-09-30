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
  Activity,
  Database,
} from "lucide-react";

import Header from "../../../../../../../components/Header";
import Sidebar from "../../../../../../../components/Sidebar";

import {
  getGudang,
  updateGudang,
} from "../../../../../../../../services/sarpras.service";

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

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

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

const themeBorderClass = "theme-border";

/* =========================================================
   RESPONSE HELPER
========================================================= */

function getResponseData(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  return [];
}

/* =========================================================
   PAGE
========================================================= */

export default function EditGudangPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    status: "aktif",
  });

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    loadGudang();
  }, [id]);

  const loadGudang = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getGudang();

      const list = getResponseData(response);

      const gudang = list.find(
        (item) =>
          String(item?.id) === String(id)
      );

      if (!gudang) {
        setError(
          "Data gudang tidak ditemukan."
        );
        return;
      }

      setForm({
        nama: gudang?.nama || "",
        lokasi: gudang?.lokasi || "",
        status:
          gudang?.status || "aktif",
      });
    } catch (err) {
      console.error(
        "Gagal mengambil data gudang:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data gudang."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nama.trim()) {
      setError(
        "Nama gudang wajib diisi."
      );
      return;
    }

    if (form.nama.trim().length < 3) {
      setError(
        "Nama gudang minimal 3 karakter."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        nama: form.nama.trim(),
        lokasi:
          form.lokasi.trim() || null,
        status:
          form.status || "aktif",
      };

      await updateGudang(id, payload);

      setSuccess(
        "Data gudang berhasil diperbarui."
      );

      setTimeout(() => {
        router.push(
          "/admin/sarpras/gudang/master"
        );
        router.refresh();
      }, 900);
    } catch (err) {
      console.error(
        "Gagal memperbarui gudang:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui data gudang."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    router.push(
      "/admin/sarpras/gudang/master"
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        {/* SIDEBAR */}

        <div className="shrink-0">
          <Sidebar
            active="sarpras"
            setActive={() => {}}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        {/* CONTENT */}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setCollapsed(
                  (prev) => !prev
                )
              }
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email:
                  "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
            <div
              className={`theme-card w-full max-w-md rounded-3xl border ${themeBorderClass} p-8 ${themeCardShadow}`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <Loader2
                    size={27}
                    strokeWidth={2}
                    className="animate-spin"
                  />
                </div>

                <h2 className="theme-text mt-5 text-base font-bold">
                  Memuat Data Gudang
                </h2>

                <p className="theme-text-muted mt-1.5 text-sm">
                  Mengambil informasi
                  gudang...
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
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* PAGE */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full p-4 sm:p-5 lg:p-7 xl:p-8">
            <div className="mx-auto w-full max-w-[1250px]">

              {/* =================================================
                  BACK
              ================================================= */}

              <button
                type="button"
                onClick={handleCancel}
                className={`group mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium theme-text-secondary transition-all ${themeNeutralHover} hover:${themePrimaryText}`}
              >
                <ArrowLeft
                  size={17}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />

                Kembali ke Daftar Gudang
              </button>

              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} sm:h-14 sm:w-14`}
                  >
                    <Boxes
                      size={25}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`text-xs font-bold uppercase tracking-[0.12em] ${themePrimaryText}`}
                      >
                        Sarana & Prasarana
                      </p>

                      <span
                        className={`rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-2.5 py-1 text-[10px] font-semibold`}
                      >
                        EDIT DATA
                      </span>
                    </div>

                    <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">
                      Edit Gudang
                    </h1>

                    <p className="theme-text-muted mt-1 text-sm">
                      Perbarui informasi
                      gudang yang
                      tersimpan di
                      sistem.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
                >
                  <div
                    className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-danger ${themeSmallShadow}`}
                  >
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="theme-danger text-sm font-semibold">
                      Terjadi Kesalahan
                    </p>

                    <p className="theme-danger mt-1 text-sm leading-5">
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
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
                >
                  <div
                    className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-success ${themeSmallShadow}`}
                  >
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="theme-success text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="theme-success mt-1 text-sm">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  MAIN GRID
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

                {/* =================================================
                    LEFT FORM
                ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="min-w-0"
                >
                  <div
                    className={`theme-card overflow-hidden rounded-3xl border ${themeBorderClass} ${themeCardShadow}`}
                  >

                    {/* FORM HEADER */}

                    <div
                      className={`border-b ${themeDivider} px-5 py-5 sm:px-7`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                          >
                            <Database
                              size={19}
                              strokeWidth={1.9}
                            />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Informasi Gudang
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Perbarui data
                              dasar gudang.
                            </p>
                          </div>
                        </div>

                        <span
                          className={`hidden rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-muted px-3 py-1.5 text-[10px] font-semibold sm:inline-flex`}
                        >
                          ID #{id}
                        </span>
                      </div>
                    </div>

                    {/* FORM BODY */}

                    <div className="space-y-6 p-5 sm:p-7">

                      {/* =================================================
                          NAMA
                      ================================================= */}

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="nama"
                            className="theme-text-secondary text-sm font-semibold"
                          >
                            Nama Gudang
                            <span className="theme-danger ml-1">
                              *
                            </span>
                          </label>

                          <span className="theme-text-muted text-[11px]">
                            {form.nama.length}
                            /100
                          </span>
                        </div>

                        <div className="relative">
                          <Boxes
                            size={18}
                            strokeWidth={1.8}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />

                          <input
                            id="nama"
                            name="nama"
                            type="text"
                            value={form.nama}
                            onChange={
                              handleChange
                            }
                            disabled={saving}
                            maxLength={100}
                            placeholder="Contoh: Gudang Sarpras Utama"
                            className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[var(--color-text-placeholder)] ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>

                        <p className="theme-text-muted mt-1.5 text-xs">
                          Gunakan nama yang
                          mudah dikenali.
                        </p>
                      </div>

                      {/* =================================================
                          LOKASI
                      ================================================= */}

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="lokasi"
                            className="theme-text-secondary text-sm font-semibold"
                          >
                            Lokasi Gudang
                          </label>

                          <span className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                            Opsional
                          </span>
                        </div>

                        <div className="relative">
                          <MapPin
                            size={18}
                            strokeWidth={1.8}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />

                          <input
                            id="lokasi"
                            name="lokasi"
                            type="text"
                            value={form.lokasi}
                            onChange={
                              handleChange
                            }
                            disabled={saving}
                            maxLength={255}
                            placeholder="Contoh: Gedung A Lantai 1"
                            className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[var(--color-text-placeholder)] ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>

                        <p className="theme-text-muted mt-1.5 text-xs">
                          Masukkan lokasi fisik
                          gudang di lingkungan
                          sekolah.
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
                          <Activity
                            size={18}
                            strokeWidth={1.8}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                          />

                          <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={
                              handleChange
                            }
                            disabled={saving}
                            className={`theme-input h-12 w-full appearance-none rounded-xl border ${themeBorderClass} pl-11 pr-10 text-sm font-medium outline-none transition-all ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <option value="aktif">
                              Aktif
                            </option>

                            <option value="nonaktif">
                              Nonaktif
                            </option>
                          </select>

                          <div className="theme-text-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                            <svg
                              width="16"
                              height="16"
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
                          Gudang nonaktif tidak
                          digunakan untuk
                          transaksi baru.
                        </p>
                      </div>

                      {/* =================================================
                          INFO
                      ================================================= */}

                      <div
                        className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-info ${themeSmallShadow}`}
                          >
                            <AlertCircle size={18} />
                          </div>

                          <div>
                            <p className="theme-info text-sm font-semibold">
                              Informasi Pengelolaan
                            </p>

                            <p className="theme-info mt-1 text-xs leading-5">
                              Perubahan data
                              gudang akan
                              diterapkan pada
                              data aset yang
                              terhubung dengan
                              gudang ini.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        FORM FOOTER
                    ================================================= */}

                    <div
                      className={`flex flex-col-reverse gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7`}
                    >
                      <button
                        type="button"
                        onClick={
                          handleCancel
                        }
                        disabled={saving}
                        className={`theme-card theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border ${themeBorderClass} px-5 text-sm font-semibold shadow-sm transition-all ${themeNeutralHover} active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <X size={17} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-6 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
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

                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* =================================================
                    RIGHT PREVIEW
                ================================================= */}

                <aside className="min-w-0">
                  <div
                    className={`sticky top-5 overflow-hidden rounded-3xl border ${themeBorderClass} theme-card ${themeCardShadow}`}
                  >

                    {/* CARD HEADER */}

                    <div
                      className={`border-b ${themeDivider} px-5 py-5`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)]`}
                          >
                            <Building2
                              size={19}
                              strokeWidth={1.9}
                            />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Preview
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Ringkasan data
                              gudang
                            </p>
                          </div>
                        </div>

                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            form.status ===
                            "aktif"
                              ? "bg-[var(--color-success)]"
                              : "bg-[color-mix(in_srgb,var(--color-text)_40%,transparent)]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* PREVIEW BODY */}

                    <div className="p-5">

                      {/* VISUAL CARD */}

                      <div
                        className={`relative overflow-hidden rounded-2xl ${themePrimaryGradient} p-5`}
                      >
                        <div
                          className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] blur-2xl`}
                        />

                        <div
                          className={`pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-info)_16%,transparent)] blur-2xl`}
                        />

                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] text-[var(--color-card)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_15%,transparent)]">
                            <Boxes
                              size={24}
                              strokeWidth={1.8}
                            />
                          </div>

                          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                            Gudang
                          </p>

                          <h3 className="mt-1 break-words text-lg font-bold leading-6 text-[var(--color-card)]">
                            {form.nama.trim() ||
                              "Nama Gudang"}
                          </h3>

                          <div className="mt-3 flex items-center gap-1.5 text-xs text-[color-mix(in_srgb,var(--color-card)_75%,transparent)]">
                            <MapPin size={13} />

                            <span className="truncate">
                              {form.lokasi.trim() ||
                                "Lokasi belum diisi"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DETAIL */}

                      <div
                        className={`theme-card mt-4 divide-y ${themeDivider} overflow-hidden rounded-2xl border ${themeBorderClass}`}
                      >

                        {/* STATUS */}

                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Activity
                              size={16}
                              className="theme-text-muted"
                            />

                            <span className="theme-text-muted text-xs font-medium">
                              Status
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              form.status ===
                              "aktif"
                                ? `${themeSuccessSurface} theme-success`
                                : `${themeNeutralSurface} theme-text-muted`
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                form.status ===
                                "aktif"
                                  ? "bg-[var(--color-success)]"
                                  : "bg-[color-mix(in_srgb,var(--color-text)_40%,transparent)]"
                              }`}
                            />

                            {form.status ===
                            "aktif"
                              ? "Aktif"
                              : "Nonaktif"}
                          </span>
                        </div>

                        {/* LOKASI */}

                        <div className="flex items-start justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <MapPin
                              size={16}
                              className="theme-text-muted shrink-0"
                            />

                            <span className="theme-text-muted text-xs font-medium">
                              Lokasi
                            </span>
                          </div>

                          <span className="theme-text-secondary max-w-[170px] break-words text-right text-xs font-semibold">
                            {form.lokasi.trim() ||
                              "Belum diisi"}
                          </span>
                        </div>

                        {/* ID */}

                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Database
                              size={16}
                              className="theme-text-muted"
                            />

                            <span className="theme-text-muted text-xs font-medium">
                              ID Gudang
                            </span>
                          </div>

                          <span
                            className={`theme-card theme-text-secondary max-w-[150px] truncate rounded-lg border ${themeBorderClass} px-2 py-1 font-mono text-[10px] font-semibold`}
                          >
                            {id}
                          </span>
                        </div>
                      </div>

                      {/* TIP */}

                      <div
                        className={`theme-card mt-4 rounded-2xl border ${themeBorderClass} p-4`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]`}
                          />

                          <p className="theme-text-muted text-[11px] leading-5">
                            Pastikan nama dan
                            lokasi gudang sudah
                            sesuai sebelum
                            menyimpan perubahan.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CARD FOOTER */}

                    <div
                      className={`border-t ${themeDivider} ${themeNeutralSurface} px-5 py-3.5`}
                    >
                      <div className="flex items-center gap-2 theme-text-muted text-[11px]">
                        <CheckCircle2
                          size={14}
                          className="theme-success"
                        />

                        <span>
                          Preview diperbarui
                          otomatis
                        </span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div
                className={`mt-6 border-t ${themeDivider} pt-5 text-center`}
              >
                <p className="theme-text-muted text-xs">
                  © 2026 SmartSchool • Modul
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