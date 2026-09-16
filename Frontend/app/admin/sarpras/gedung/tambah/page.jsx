"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  Building,
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

import { createGedung } from "../../../../../services/infrastruktur.service";

export default function TambahGedungPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    fotoUrl: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    const nama = formData.nama.trim();
    const kode = formData.kode.trim();
    const fotoUrl = formData.fotoUrl.trim();

    if (!nama) {
      newErrors.nama = "Nama gedung wajib diisi";
    } else if (nama.length > 100) {
      newErrors.nama = "Nama gedung maksimal 100 karakter";
    }

    if (!kode) {
      newErrors.kode = "Kode gedung wajib diisi";
    } else if (kode.length > 50) {
      newErrors.kode = "Kode gedung maksimal 50 karakter";
    }

    if (fotoUrl) {
      try {
        new URL(fotoUrl);
      } catch {
        newErrors.fotoUrl = "URL foto tidak valid";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setSaved(false);
    setSubmitError("");

    try {
      const payload = {
        nama: formData.nama.trim(),
        kode: formData.kode.trim(),
        fotoUrl: formData.fotoUrl.trim() || null,
      };

      console.log("Payload create gedung:", payload);

      const response = await createGedung(payload);

      console.log("Response create gedung:", response);

      setSaved(true);

      setTimeout(() => {
        router.push("/admin/sarpras/gedung");
      }, 1200);
    } catch (error) {
      console.error("Error create gedung:", error);

      setSubmitError(
        error?.message ||
          "Gagal menambahkan gedung. Silakan coba lagi."
      );

      setSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (isSaving) return;

    router.push("/admin/sarpras/gedung");
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-7 xl:p-8">
          <div className="mx-auto w-full max-w-[1200px] space-y-4 sm:space-y-5 lg:space-y-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSaving}
              className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Kembali ke Daftar Gedung
            </button>

            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-50/70 blur-3xl" />

              <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] sm:h-14 sm:w-14">
                    <Plus
                      size={22}
                      strokeWidth={1.9}
                      className="sm:h-[25px] sm:w-[25px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl lg:text-[26px]">
                        Tambah Gedung
                      </h1>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 sm:px-3 sm:py-1 sm:text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Sarana & Prasarana
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                      <Building
                        size={13}
                        className="shrink-0 text-blue-400 sm:h-[14px] sm:w-[14px]"
                        strokeWidth={2}
                      />

                      <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                        Lengkapi informasi gedung untuk
                        ditambahkan ke sistem.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:flex-row lg:w-auto">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:px-5"
                  >
                    <X
                      size={16}
                      className="sm:h-[17px] sm:w-[17px]"
                    />
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.16)] transition-all hover:bg-slate-800 hover:shadow-[0_9px_22px_rgba(15,23,42,0.20)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:px-5"
                  >
                    <Save
                      size={16}
                      strokeWidth={2.3}
                      className="sm:h-[17px] sm:w-[17px]"
                    />

                    {isSaving ? "Menyimpan..." : "Simpan Gedung"}
                  </button>
                </div>
              </div>
            </section>

            {saved && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle
                  size={18}
                  className="shrink-0 text-emerald-600"
                />

                <span>
                  Gedung berhasil ditambahkan! Mengalihkan ke
                  daftar gedung...
                </span>
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-rose-600"
                />

                <div className="min-w-0">
                  <p className="font-semibold">
                    Gagal menambahkan gedung
                  </p>

                  <p className="mt-0.5 break-words">
                    {submitError}
                  </p>
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6 lg:p-7">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Info size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Informasi Gedung
                  </p>

                  <p className="text-xs text-slate-400">
                    Masukkan data gedung yang tersedia pada
                    sistem
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Nama Gedung{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) =>
                        handleChange(
                          "nama",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: Gedung Utama"
                      maxLength={100}
                      disabled={isSaving}
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.nama
                          ? "border-rose-300"
                          : "border-slate-200"
                      }`}
                    />

                    <div className="mt-1 flex items-center justify-between">
                      {errors.nama ? (
                        <p className="flex items-center gap-1 text-xs text-rose-600">
                          <AlertCircle size={12} />
                          {errors.nama}
                        </p>
                      ) : (
                        <span />
                      )}

                      <span className="text-[10px] text-slate-400">
                        {formData.nama.length}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      Kode Gedung{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.kode}
                      onChange={(e) =>
                        handleChange(
                          "kode",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: A, B, C"
                      maxLength={50}
                      disabled={isSaving}
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.kode
                          ? "border-rose-300"
                          : "border-slate-200"
                      }`}
                    />

                    <div className="mt-1 flex items-center justify-between">
                      {errors.kode ? (
                        <p className="flex items-center gap-1 text-xs text-rose-600">
                          <AlertCircle size={12} />
                          {errors.kode}
                        </p>
                      ) : (
                        <span />
                      )}

                      <span className="text-[10px] text-slate-400">
                        {formData.kode.length}/50
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      URL Foto Gedung
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        (opsional)
                      </span>
                    </label>

                    <div className="relative">
                      <ImageIcon
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="url"
                        value={formData.fotoUrl}
                        onChange={(e) =>
                          handleChange(
                            "fotoUrl",
                            e.target.value
                          )
                        }
                        placeholder="https://contoh.com/foto-gedung.jpg"
                        disabled={isSaving}
                        className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                          errors.fotoUrl
                            ? "border-rose-300"
                            : "border-slate-200"
                        }`}
                      />
                    </div>

                    {errors.fotoUrl && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                        <AlertCircle size={12} />
                        {errors.fotoUrl}
                      </p>
                    )}

                    <p className="mt-1.5 text-xs text-slate-400">
                      Masukkan URL gambar jika gedung memiliki
                      foto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <Info
                    size={17}
                    className="mt-0.5 shrink-0 text-blue-500"
                  />

                  <div>
                    <p className="text-xs font-semibold text-blue-700">
                      Informasi
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-blue-600">
                      Data yang dikirim adalah nama, kode, dan
                      URL foto. Foto akan disimpan oleh backend
                      pada field yang sesuai dengan struktur
                      database.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-600 shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.16)] transition-all hover:bg-slate-800 hover:shadow-[0_9px_22px_rgba(15,23,42,0.20)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save
                      size={17}
                      strokeWidth={2.3}
                    />

                    {isSaving
                      ? "Menyimpan..."
                      : "Simpan Gedung"}
                  </button>
                </div>
              </form>
            </section>

            <div className="border-t border-slate-200/70 pt-4 text-center sm:pt-5">
              <p className="text-xs text-slate-400">
                © 2026 SmartSchool • Tambah Gedung - Sarana &
                Prasarana
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}