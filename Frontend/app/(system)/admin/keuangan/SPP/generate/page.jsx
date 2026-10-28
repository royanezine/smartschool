"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { generateTagihan } from "@/services/tagihan.service";
import { getKategoriTagihan } from "@/services/tarif.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";
import { getKelas } from "@/services/kelas.service";

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const INITIAL_FORM = {
  kategoriTagihanId: "",
  tahunAjaranId: "",
  kelasId: "",
  periodeBulan: String(new Date().getMonth() + 1),
  periodeTahun: String(new Date().getFullYear()),
  jatuhTempo: "",
  keterangan: "",
};

function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  return [];
}

export default function GenerateTagihanPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [kategoriList, setKategoriList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMaster = useCallback(async () => {
    const [kategoriRes, tahunRes, kelasRes] =
      await Promise.allSettled([
        getKategoriTagihan({ page: 1, limit: 100 }),
        getTahunAjaran(),
        getKelas({ page: 1, limit: 100 }),
      ]);

    setKategoriList(
      kategoriRes.status === "fulfilled"
        ? unwrapList(kategoriRes.value)
        : []
    );

    const tahunList =
      tahunRes.status === "fulfilled"
        ? unwrapList(tahunRes.value)
        : [];
    setTahunAjaranList(tahunList);

    const aktif =
      tahunList.find(
        (item) =>
          String(item?.status || "")
            .trim()
            .toLowerCase() === "aktif"
      ) || tahunList[0];

    if (aktif?.id) {
      setForm((prev) => ({
        ...prev,
        tahunAjaranId: prev.tahunAjaranId || String(aktif.id),
      }));
    }

    setKelasList(
      kelasRes.status === "fulfilled"
        ? unwrapList(kelasRes.value)
        : []
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMaster();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMaster]);

  const kategoriTerpilih = useMemo(
    () =>
      kategoriList.find(
        (item) =>
          String(item.id) === String(form.kategoriTagihanId)
      ),
    [kategoriList, form.kategoriTagihanId]
  );

  const isBulanan =
    String(kategoriTerpilih?.siklus || "").toLowerCase() ===
    "bulanan";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await generateTagihan({
        kategoriTagihanId: form.kategoriTagihanId,
        tahunAjaranId: form.tahunAjaranId,
        kelasId: form.kelasId || undefined,
        jatuhTempo: form.jatuhTempo,
        periodeBulan: isBulanan
          ? Number(form.periodeBulan)
          : undefined,
        periodeTahun: form.periodeTahun
          ? Number(form.periodeTahun)
          : undefined,
        keterangan: form.keterangan,
      });

      setSuccess(
        result?.message || "Tagihan berhasil digenerate."
      );

      setTimeout(() => {
        router.push("/admin/keuangan/SPP");
      }, 1200);
    } catch (err) {
      console.error("Gagal generate tagihan:", err);
      setError(
        err?.message ||
          "Gagal generate tagihan. Periksa tarif dan periode."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (submitting) return;
    router.push("/admin/keuangan/SPP");
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto theme-page">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="w-full space-y-6">
              {/* HEADER + KEMBALI KIRI ATAS */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:opacity-50"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Plus size={23} />
                  </div>

                  <div className="min-w-0">
                  

                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Generate Tagihan
                    </h1>

                    <p className="mt-1 text-sm theme-text-secondary">
                      Buat tagihan massal berdasarkan kategori, tahun
                      ajaran, dan kelas.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      Permintaan gagal
                    </p>
                    <p className="mt-1 break-words">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="flex-1">{success}</p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="theme-card space-y-6 rounded-xl border theme-border p-5 shadow-sm sm:p-6"
              >
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <FileText size={15} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide theme-text-placeholder">
                      Data Tagihan
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-6">
                    <div className="2xl:col-span-3">
                      <FormSelect
                        label="Kategori Tagihan"
                        name="kategoriTagihanId"
                        value={form.kategoriTagihanId}
                        onChange={handleChange}
                        placeholder="Pilih kategori"
                        required
                        options={kategoriList.map((item) => ({
                          value: item.id,
                          label: `${item.nama} (${
                            item.siklus || "bulanan"
                          })`,
                        }))}
                      />
                    </div>

                    <div className="2xl:col-span-3">
                      <FormSelect
                        label="Tahun Ajaran"
                        name="tahunAjaranId"
                        value={form.tahunAjaranId}
                        onChange={handleChange}
                        placeholder="Pilih tahun ajaran"
                        required
                        options={tahunAjaranList.map((item) => ({
                          value: item.id,
                          label: `${
                            item.nama ||
                            item.tahunAjaran ||
                            item.id
                          }${
                            item.semester
                              ? ` · ${item.semester}`
                              : ""
                          }`,
                        }))}
                      />
                    </div>

                    <div className="2xl:col-span-3">
                      <FormSelect
                        label="Kelas (opsional)"
                        name="kelasId"
                        value={form.kelasId}
                        onChange={handleChange}
                        placeholder="Semua kelas"
                        options={kelasList.map((item) => ({
                          value: item.id,
                          label: item.nama,
                        }))}
                      />
                    </div>

                    <div className="2xl:col-span-3">
                      <FormInput
                        label="Jatuh Tempo"
                        name="jatuhTempo"
                        type="date"
                        value={form.jatuhTempo}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {isBulanan && (
                      <>
                        <div className="2xl:col-span-3">
                          <FormSelect
                            label="Bulan"
                            name="periodeBulan"
                            value={form.periodeBulan}
                            onChange={handleChange}
                            options={NAMA_BULAN.map(
                              (nama, index) => ({
                                value: String(index + 1),
                                label: nama,
                              })
                            )}
                          />
                        </div>

                        <div className="2xl:col-span-3">
                          <FormInput
                            label="Tahun"
                            name="periodeTahun"
                            type="number"
                            value={form.periodeTahun}
                            onChange={handleChange}
                            placeholder="2026"
                          />
                        </div>
                      </>
                    )}

                    <div className="sm:col-span-2 2xl:col-span-6">
                      <FormInput
                        label="Keterangan (opsional)"
                        name="keterangan"
                        value={form.keterangan}
                        onChange={handleChange}
                        placeholder="Catatan tagihan"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:opacity-50"
                  >
                    <ArrowLeft size={16} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !form.kategoriTagihanId ||
                      !form.tahunAjaranId ||
                      !form.jatuhTempo
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Plus size={16} />
                    )}
                    {submitting
                      ? "Memproses..."
                      : "Generate Tagihan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FormInput({ label, name, value, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="theme-input w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options = [], placeholder, required }) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="theme-input w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}