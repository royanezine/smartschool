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

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  createGudang,
} from "../../../../../../services/sarpras.service";

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

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const nama = form.nama.trim();
    const lokasi = form.lokasi.trim();

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

    try {
      setSaving(true);

      const payload = {
        nama,
        lokasi: lokasi || null,
        status: form.status,
      };

      console.log("Payload create gudang:", payload);

      await createGudang(payload);

      setSaved(true);

      setTimeout(() => {
        router.push("/admin/sarpras/gudang/master");
      }, 1000);
    } catch (err) {
      console.error("Gagal membuat gudang:", err);

      setError(
        err?.message ||
          "Gagal menyimpan gudang. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleSidebar() {
    setIsCollapsed((current) => !current);
  }

  const isFormComplete =
    form.nama.trim().length >= 3;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* SIDEBAR */}
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* CONTENT */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* BACK */}
            <Link
              href="/admin/sarpras/gudang/master"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              <ArrowLeft size={18} />
              Kembali ke Master Gudang
            </Link>

            {/* PAGE HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    SARPRAS
                  </span>

                  <span className="text-xs text-slate-400">
                    Master Gudang
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Tambah Gudang
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Tambahkan data gudang baru untuk mengelola
                  penyimpanan sarana dan prasarana sekolah.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                <Warehouse size={27} />
              </div>
            </div>

            {/* ALERT ERROR */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">

                <AlertCircle
                  className="mt-0.5 shrink-0"
                  size={19}
                />

                <div className="flex-1 font-medium">
                  {error}
                </div>
              </div>
            )}

            {/* ALERT SUCCESS */}
            {saved && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-700 shadow-sm">

                <CheckCircle2 size={19} />

                <span>
                  Gudang berhasil ditambahkan. Mengalihkan...
                </span>
              </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

              {/* =========================
                  LEFT - FORM
              ========================== */}
              <form onSubmit={handleSubmit}>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  {/* FORM HEADER */}
                  <div className="border-b border-slate-200 px-5 py-5 sm:px-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Warehouse size={21} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                          Informasi Gudang
                        </h2>

                        <p className="mt-0.5 text-sm text-slate-500">
                          Lengkapi informasi utama gudang.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* FORM BODY */}
                  <div className="space-y-6 px-5 py-6 sm:px-7">

                    {/* =========================
                        NAMA GUDANG
                    ========================== */}
                    <div>

                      <label
                        htmlFor="nama"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Nama Gudang
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <Warehouse
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="nama"
                          type="text"
                          name="nama"
                          value={form.nama}
                          onChange={handleChange}
                          maxLength={100}
                          autoComplete="off"
                          placeholder="Contoh: Gudang Utama"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 caret-blue-600 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          style={{
                            color: "#0f172a",
                            WebkitTextFillColor: "#0f172a",
                          }}
                        />

                      </div>

                      <div className="mt-1.5 flex items-center justify-between gap-3">

                        <p className="text-xs text-slate-400">
                          Minimal 3 karakter, maksimal 100 karakter.
                        </p>

                        <span className="shrink-0 text-xs font-medium text-slate-400">
                          {form.nama.length}/100
                        </span>

                      </div>

                    </div>

                    {/* =========================
                        LOKASI
                    ========================== */}
                    <div>

                      <label
                        htmlFor="lokasi"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Lokasi Gudang
                      </label>

                      <div className="relative">

                        <MapPin
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="lokasi"
                          type="text"
                          name="lokasi"
                          value={form.lokasi}
                          onChange={handleChange}
                          maxLength={255}
                          autoComplete="off"
                          placeholder="Contoh: Gedung A Lantai 1"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 caret-blue-600 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          style={{
                            color: "#0f172a",
                            WebkitTextFillColor: "#0f172a",
                          }}
                        />

                      </div>

                      <p className="mt-1.5 text-xs text-slate-400">
                        Lokasi bersifat opsional.
                      </p>

                    </div>

                    {/* =========================
                        STATUS
                    ========================== */}
                    <div>

                      <label
                        htmlFor="status"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Status
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <ShieldCheck
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          id="status"
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          style={{
                            color: "#0f172a",
                            colorScheme: "light",
                          }}
                        >
                          <option
                            value="aktif"
                            className="bg-white text-slate-900"
                          >
                            Aktif
                          </option>

                          <option
                            value="nonaktif"
                            className="bg-white text-slate-900"
                          >
                            Nonaktif
                          </option>
                        </select>

                        {/* CUSTOM ARROW */}
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
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

                      <p className="mt-1.5 text-xs text-slate-400">
                        Gudang aktif dapat digunakan untuk penyimpanan aset.
                      </p>

                    </div>

                  </div>

                  {/* FORM FOOTER */}
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">

                    <Link
                      href="/admin/sarpras/gudang/master"
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      Batal
                    </Link>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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

              {/* =========================
                  RIGHT - PREVIEW
              ========================== */}
              <aside className="space-y-5">

                {/* PREVIEW CARD */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6">

                  {/* CARD HEADER */}
                  <div className="border-b border-slate-200 bg-gradient-to-br from-blue-50 to-white px-5 py-5">

                    <div className="flex items-center justify-between gap-3">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Preview
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          Data Gudang
                        </h3>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                        <Building2 size={21} />
                      </div>

                    </div>

                  </div>

                  {/* PREVIEW BODY */}
                  <div className="p-5">

                    {/* NAME PREVIEW */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Nama Gudang
                      </p>

                      <p
                        className={`break-words text-base font-bold ${
                          form.nama.trim()
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {form.nama.trim() || "Nama gudang belum diisi"}
                      </p>

                    </div>

                    {/* INFO LIST */}
                    <div className="mt-4 space-y-3">

                      {/* LOCATION */}
                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <MapPin size={17} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-xs font-medium text-slate-400">
                            Lokasi
                          </p>

                          <p
                            className={`mt-0.5 break-words text-sm font-semibold ${
                              form.lokasi.trim()
                                ? "text-slate-800"
                                : "text-slate-400"
                            }`}
                          >
                            {form.lokasi.trim() || "Belum ditentukan"}
                          </p>

                        </div>

                      </div>

                      {/* STATUS */}
                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <ShieldCheck size={17} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-xs font-medium text-slate-400">
                            Status
                          </p>

                          <div className="mt-1">

                            {form.status === "aktif" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                Nonaktif
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* DIVIDER */}
                    <div className="my-5 border-t border-slate-200" />

                    {/* COMPLETION */}
                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <p className="text-sm font-semibold text-slate-700">
                          Kelengkapan Data
                        </p>

                        <span
                          className={`text-xs font-bold ${
                            isFormComplete
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {isFormComplete ? "Lengkap" : "Belum lengkap"}
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFormComplete
                              ? "w-full bg-emerald-500"
                              : form.nama.length > 0
                              ? "w-1/2 bg-blue-500"
                              : "w-0"
                          }`}
                        />

                      </div>

                    </div>

                    {/* CHECKLIST */}
                    <div className="mt-5 space-y-2.5">

                      <div className="flex items-center gap-2.5">

                        {form.nama.trim().length >= 3 ? (
                          <CircleCheck
                            size={17}
                            className="shrink-0 text-emerald-500"
                          />
                        ) : (
                          <CircleAlert
                            size={17}
                            className="shrink-0 text-slate-300"
                          />
                        )}

                        <span
                          className={`text-xs ${
                            form.nama.trim().length >= 3
                              ? "font-medium text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          Nama gudang sudah valid
                        </span>

                      </div>

                      <div className="flex items-center gap-2.5">

                        {form.lokasi.trim() ? (
                          <CircleCheck
                            size={17}
                            className="shrink-0 text-emerald-500"
                          />
                        ) : (
                          <CircleAlert
                            size={17}
                            className="shrink-0 text-slate-300"
                          />
                        )}

                        <span
                          className={`text-xs ${
                            form.lokasi.trim()
                              ? "font-medium text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          Lokasi gudang ditambahkan
                        </span>

                      </div>

                      <div className="flex items-center gap-2.5">

                        <CircleCheck
                          size={17}
                          className="shrink-0 text-emerald-500"
                        />

                        <span className="text-xs font-medium text-slate-700">
                          Status gudang dipilih
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

                {/* INFORMATION CARD */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <Info size={18} />
                    </div>

                    <div>

                      <h4 className="text-sm font-bold text-slate-900">
                        Informasi
                      </h4>

                      <p className="mt-1.5 text-xs leading-5 text-slate-600">
                        Gunakan nama gudang yang mudah dikenali,
                        misalnya berdasarkan fungsi atau lokasi
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