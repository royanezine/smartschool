"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Wallet,
  X,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  bayarTagihan,
  getDetailTagihan,
  getAkunKas,
} from "@/services/tagihan.service";

const METODE_OPTIONS = [
  { value: "tunai", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "QRIS" },
  { value: "lainnya", label: "Lainnya" },
];

function unwrapItem(result) {
  if (result?.data?.data) return result.data.data;
  return result?.data ?? result ?? null;
}

function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  return [];
}

function formatRupiah(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "Rp 0";
  return `Rp ${number.toLocaleString("id-ID")}`;
}

const INITIAL_FORM = {
  akunKasId: "",
  metode: "tunai",
  jumlah: "",
  tanggalBayar: new Date().toISOString().slice(0, 10),
  referensi: "",
  catatan: "",
};

export default function BayarTagihanPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tagihan, setTagihan] = useState(null);
  const [akunKasList, setAkunKasList] = useState([]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("ID tagihan tidak valid.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [detailRes, akunRes] = await Promise.allSettled([
        getDetailTagihan(id),
        getAkunKas({ status: "aktif" }),
      ]);

      if (detailRes.status === "fulfilled") {
        const detail = unwrapItem(detailRes.value);
        setTagihan(detail);

        if (detail?.sisa) {
          setForm((prev) => ({
            ...prev,
            jumlah: String(Number(detail.sisa) || ""),
          }));
        }
      } else {
        throw detailRes.reason;
      }

      if (akunRes.status === "fulfilled") {
        const list = unwrapList(akunRes.value);
        setAkunKasList(list);

        if (list[0]?.id) {
          setForm((prev) => ({
            ...prev,
            akunKasId: prev.akunKasId || String(list[0].id),
          }));
        }
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
      setError(
        err?.message || "Gagal memuat data tagihan atau akun kas."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tagihan) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await bayarTagihan({
        tagihanId: tagihan.id,
        akunKasId: form.akunKasId,
        metode: form.metode,
        jumlah: Number(form.jumlah),
        tanggalBayar: form.tanggalBayar || undefined,
        referensi: form.referensi,
        catatan: form.catatan,
      });

      setSuccess(
        result?.message || "Pembayaran berhasil dicatat."
      );

      setTimeout(() => {
        router.push(`/admin/keuangan/SPP/${id}`);
      }, 1200);
    } catch (err) {
      console.error("Gagal menyimpan pembayaran:", err);
      setError(err?.message || "Gagal menyimpan pembayaran.");
    } finally {
      setSubmitting(false);
    }
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/keuangan/SPP/${id}`)
                  }
                  disabled={submitting}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:opacity-50"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <CreditCard size={23} />
                  </div>

                  <div className="min-w-0">
                  

                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Catat Pembayaran
                    </h1>

                    <p className="mt-1 text-sm theme-text-secondary">
                      {tagihan?.nomorTagihan || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="flex-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError("")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="flex-1">{success}</p>
                </div>
              )}

              {loading ? (
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border theme-border">
                  <Loader2
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="text-sm font-medium theme-text">
                    Memuat data tagihan...
                  </p>
                </div>
              ) : !tagihan ? (
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center rounded-xl border theme-border">
                  <AlertCircle size={28} className="text-red-500" />
                  <p className="mt-4 font-semibold theme-text">
                    Tagihan tidak ditemukan
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="theme-card space-y-6 rounded-xl border theme-border p-5 shadow-sm sm:p-6"
                >
                  <div className="theme-card-soft rounded-xl px-4 py-3 text-sm">
                    <p className="theme-text font-semibold">
                      {tagihan.siswa?.namaLengkap}
                    </p>
                    <p className="theme-text-muted mt-0.5 text-xs">
                      {tagihan.nomorTagihan} • Sisa{" "}
                      {formatRupiah(tagihan.sisa)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-6">
                    <div className="2xl:col-span-3">
                      <FormSelect
                        label="Akun Kas"
                        name="akunKasId"
                        value={form.akunKasId}
                        onChange={handleChange}
                        placeholder="Pilih akun kas"
                        required
                        options={akunKasList.map((item) => ({
                          value: item.id,
                          label: `${item.nama} (${item.kode})`,
                        }))}
                      />
                    </div>

                    <div className="2xl:col-span-3">
                      <FormSelect
                        label="Metode"
                        name="metode"
                        value={form.metode}
                        onChange={handleChange}
                        required
                        options={METODE_OPTIONS}
                      />
                    </div>

                    <div className="2xl:col-span-3">
                      <FormInput
                        label="Jumlah"
                        name="jumlah"
                        type="number"
                        value={form.jumlah}
                        onChange={handleChange}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="2xl:col-span-3">
                      <FormInput
                        label="Tanggal Bayar"
                        name="tanggalBayar"
                        type="date"
                        value={form.tanggalBayar}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 2xl:col-span-3">
                      <FormInput
                        label="Referensi (opsional)"
                        name="referensi"
                        value={form.referensi}
                        onChange={handleChange}
                        placeholder="No. referensi / bukti"
                      />
                    </div>

                    <div className="sm:col-span-2 2xl:col-span-3">
                      <FormInput
                        label="Catatan (opsional)"
                        name="catatan"
                        value={form.catatan}
                        onChange={handleChange}
                        placeholder="Catatan pembayaran"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/keuangan/SPP/${id}`
                        )
                      }
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
                        !form.akunKasId ||
                        !form.jumlah
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <CreditCard size={16} />
                      )}
                      {submitting
                        ? "Menyimpan..."
                        : "Simpan Pembayaran"}
                    </button>
                  </div>
                </form>
              )}
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