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

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  getGedung,
  getLantaiByGedung,
  updateLantai,
} from "../../../../../../../services/infrastruktur.service";

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
      <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
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

          <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm">
                <Loader2
                  size={25}
                  className="animate-spin text-blue-600"
                />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Memuat data lantai
                </p>

                <p className="mt-1 text-xs text-slate-400">
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
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
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

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
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
                    className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
                  >
                    <ArrowLeft
                      size={17}
                      className="transition-transform duration-200 group-hover:-translate-x-1"
                    />

                    Kembali ke Data Lantai
                  </button>

                  <div className="mt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Edit Lantai
                      </h1>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Edit Data
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm text-slate-500">
                      Perbarui informasi lantai yang
                      tersimpan di sistem SmartSchool.
                    </p>
                  </div>
                </div>

                {/* ID */}

                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm sm:flex">
                  <Hash
                    size={15}
                    className="text-slate-400"
                  />

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      ID Lantai
                    </p>

                    <p className="mt-0.5 max-w-[160px] truncate font-mono text-[11px] font-medium text-slate-600">
                      {id}
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ERROR / SUCCESS
              ================================================= */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm">
                    <AlertCircle size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-rose-800">
                      Terjadi kesalahan
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-rose-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Berhasil disimpan
                    </p>

                    <p className="mt-0.5 text-xs text-emerald-700">
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

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.045)]">

                  {/* FORM HEADER */}

                  <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:px-7">
                    <div className="flex items-center justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_7px_18px_rgba(37,99,235,0.20)]">
                          <Layers3
                            size={21}
                            strokeWidth={2}
                          />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-base font-bold text-slate-900">
                            Informasi Lantai
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Perbarui data sesuai kondisi
                            terbaru.
                          </p>
                        </div>
                      </div>

                      <div className="hidden rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 sm:block">
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
                            className="text-sm font-semibold text-slate-700"
                          >
                            Gedung{" "}
                            <span className="text-rose-500">
                              *
                            </span>
                          </label>

                          <span className="text-[10px] font-medium text-slate-400">
                            Pilih lokasi gedung
                          </span>
                        </div>

                        <div className="relative">
                          <Building2
                            size={18}
                            className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                          />

                          <select
                            id="gedungId"
                            name="gedungId"
                            value={form.gedungId}
                            onChange={handleChange}
                            disabled={saving}
                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-medium text-slate-800 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              color: "#1e293b",
                              colorScheme: "light",
                            }}
                          >
                            <option value="">
                              Pilih gedung
                            </option>

                            {gedung.map((item) => (
                              <option
                                key={item.id}
                                value={item.id}
                                style={{
                                  color: "#1e293b",
                                  backgroundColor:
                                    "#ffffff",
                                }}
                              >
                                {item.nama}
                                {item.kode
                                  ? ` (${item.kode})`
                                  : ""}
                              </option>
                            ))}
                          </select>

                          {/* CUSTOM ARROW */}

                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
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

                        <p className="mt-1.5 text-xs text-slate-400">
                          Gedung tempat lantai ini berada.
                        </p>
                      </div>

                      {/* NAMA LANTAI */}

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="nama"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Nama Lantai{" "}
                            <span className="text-rose-500">
                              *
                            </span>
                          </label>

                          <span className="text-[10px] font-medium text-slate-400">
                            {form.nama.length}/50
                          </span>
                        </div>

                        <div className="relative">
                          <Layers3
                            size={18}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              color: "#0f172a",
                              WebkitTextFillColor:
                                "#0f172a",
                            }}
                          />
                        </div>

                        <p className="mt-1.5 text-xs text-slate-400">
                          Gunakan nama yang mudah
                          dikenali, misalnya Lantai 1
                          atau Lantai Dasar.
                        </p>
                      </div>

                      {/* INFORMATION BOX */}

                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <Info size={16} />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-blue-800">
                              Informasi Pengelolaan
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-700">
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

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/sarpras/gedung/lantai"
                          )
                        }
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-[0_10px_25px_rgba(37,99,235,0.28)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.045)]">

                    {/* PREVIEW HEADER */}

                    <div className="border-b border-slate-100 px-5 py-4.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                            <Layers3
                              size={19}
                              strokeWidth={2}
                            />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              Preview
                            </h2>

                            <p className="text-[11px] text-slate-400">
                              Tampilan data lantai
                            </p>
                          </div>
                        </div>

                        <Sparkles
                          size={17}
                          className="text-blue-500"
                        />
                      </div>
                    </div>

                    {/* PREVIEW CONTENT */}

                    <div className="p-5">

                      {/* VISUAL */}

                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white shadow-[0_12px_28px_rgba(37,99,235,0.20)]">
                        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />

                        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />

                        <div className="relative">
                          <div className="mb-8 flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                              <Layers3 size={22} />
                            </div>

                            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-blue-50">
                              Lantai
                            </span>
                          </div>

                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-100">
                            Nama Lantai
                          </p>

                          <h3 className="mt-1.5 truncate text-xl font-bold tracking-tight">
                            {form.nama.trim() ||
                              "Nama Lantai"}
                          </h3>

                          <div className="mt-3 flex items-center gap-2 text-xs text-blue-100">
                            <Building2 size={14} />

                            <span className="truncate">
                              {selectedGedung?.nama ||
                                "Belum memilih gedung"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DETAIL */}

                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">

                        {/* GEDUNG */}

                        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <Building2 size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              Gedung
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {selectedGedung?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>
                        </div>

                        {/* KODE GEDUNG */}

                        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                            <Hash size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              Kode Gedung
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {selectedGedung?.kode ||
                                "Tidak ada kode"}
                            </p>
                          </div>
                        </div>

                        {/* ID */}

                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                            <Hash size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              ID Lantai
                            </p>

                            <p className="mt-0.5 truncate font-mono text-[10px] font-medium text-slate-600">
                              {id}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* STATUS */}

                      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />

                        <div>
                          <p className="text-[11px] font-semibold text-emerald-700">
                            Data siap diperbarui
                          </p>

                          <p className="mt-0.5 text-[10px] leading-4 text-emerald-600">
                            Preview akan mengikuti
                            perubahan yang kamu masukkan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QUICK INFO */}

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Info size={15} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Tentang Data Lantai
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-slate-400">
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

              <div className="mt-7 border-t border-slate-200/80 py-5 text-center">
                <p className="text-[11px] text-slate-400">
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