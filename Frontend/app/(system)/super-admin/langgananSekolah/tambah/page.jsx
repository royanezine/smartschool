"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Building2,
  Package,
  CalendarDays,
  CreditCard,
  FileText,
} from "lucide-react";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

export default function TambahLanggananPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    sekolah: "",
    paket: "",
    tanggalMulai: "",
    tanggalBerakhir: "",
    metodePembayaran: "",
    catatan: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Data langganan:", form);

    alert("Langganan berhasil ditambahkan!");
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* BACK */}
          <button
            type="button"
            onClick={() => router.back()}
            className={`mb-5 inline-flex items-center gap-2 rounded border ${themeNeutralBorder} ${themeNeutralSurface} px-4 py-2.5 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          {/* TITLE */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold theme-text">
              Tambah Langganan
            </h1>

            <p className="mt-1 text-sm theme-text-muted">
              Tambahkan langganan baru untuk sekolah.
            </p>
          </div>

          {/* CARD */}
          <div
            className={`w-full overflow-hidden rounded-xl border theme-border theme-card ${themeCardShadow}`}
          >
            {/* CARD HEADER */}
            <div className={`border-b ${themeDivider} px-5 py-5 sm:px-7`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${themeInfoBorder} ${themeInfoSurface} text-[var(--color-info)]`}
                >
                  <CreditCard size={20} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-semibold theme-text">
                    Informasi Langganan
                  </h2>

                  <p className="text-sm theme-text-muted">
                    Lengkapi informasi langganan di bawah ini.
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-2">
                {/* SEKOLAH */}
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-medium theme-text-secondary">
                    Sekolah
                  </label>

                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />

                    <select
                      name="sekolah"
                      value={form.sekolah}
                      onChange={handleChange}
                      required
                      className={`box-border w-full min-w-0 appearance-none rounded border theme-border theme-input py-3 pl-10 pr-4 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                    >
                      <option value="">Pilih sekolah</option>
                      <option value="SMK Taruna Bhakti">
                        SMK Taruna Bhakti
                      </option>
                      <option value="SMA SmartSchool">
                        SMA SmartSchool
                      </option>
                      <option value="SMP SmartSchool">
                        SMP SmartSchool
                      </option>
                    </select>
                  </div>
                </div>

                {/* PAKET */}
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-medium theme-text-secondary">
                    Paket Langganan
                  </label>

                  <div className="relative">
                    <Package
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />

                    <select
                      name="paket"
                      value={form.paket}
                      onChange={handleChange}
                      required
                      className={`box-border w-full min-w-0 appearance-none rounded border theme-border theme-input py-3 pl-10 pr-4 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                    >
                      <option value="">Pilih paket</option>
                      <option value="Basic">Basic</option>
                      <option value="Professional">
                        Professional
                      </option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                {/* TANGGAL MULAI */}
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-medium theme-text-secondary">
                    Tanggal Mulai
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />

                    <input
                      type="date"
                      name="tanggalMulai"
                      value={form.tanggalMulai}
                      onChange={handleChange}
                      required
                      className={`box-border w-full min-w-0 rounded border theme-border theme-input py-3 pl-10 pr-4 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                    />
                  </div>
                </div>

                {/* TANGGAL BERAKHIR */}
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-medium theme-text-secondary">
                    Tanggal Berakhir
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />

                    <input
                      type="date"
                      name="tanggalBerakhir"
                      value={form.tanggalBerakhir}
                      onChange={handleChange}
                      required
                      className={`box-border w-full min-w-0 rounded border theme-border theme-input py-3 pl-10 pr-4 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                    />
                  </div>
                </div>

                {/* METODE PEMBAYARAN */}
                <div className="min-w-0 lg:col-span-2">
                  <label className="mb-2 block text-sm font-medium theme-text-secondary">
                    Metode Pembayaran
                  </label>

                  <div className="relative">
                    <CreditCard
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />

                    <select
                      name="metodePembayaran"
                      value={form.metodePembayaran}
                      onChange={handleChange}
                      required
                      className={`box-border w-full min-w-0 appearance-none rounded border theme-border theme-input py-3 pl-10 pr-4 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                    >
                      <option value="">
                        Pilih metode pembayaran
                      </option>

                      <option value="Transfer Bank">
                        Transfer Bank
                      </option>

                      <option value="Virtual Account">
                        Virtual Account
                      </option>

                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                {/* CATATAN */}
                <div className="min-w-0 lg:col-span-2">
                  <label className="mb-2 block text-sm font-medium theme-text-secondary">
                    Catatan{" "}
                    <span className="font-normal theme-text-placeholder">
                      (Opsional)
                    </span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-3 top-3.5 theme-text-placeholder"
                    />

                    <textarea
                      name="catatan"
                      value={form.catatan}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tambahkan catatan jika diperlukan..."
                      className={`box-border w-full min-w-0 resize-none rounded border theme-border theme-input py-3 pl-10 pr-4 text-sm theme-text-secondary outline-none transition placeholder:theme-text-placeholder ${themeFocus}`}
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div
                className={`flex flex-col gap-3 border-t ${themeDivider} px-5 py-5 sm:flex-row sm:justify-end sm:px-7`}
              >
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={`w-full rounded border ${themeNeutralBorder} ${themeNeutralSurface} px-5 py-2.5 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} sm:w-auto`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded px-5 py-2.5 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 sm:w-auto`}
                >
                  <Save size={18} />
                  Simpan Langganan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}