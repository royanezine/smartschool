"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  CircleDollarSign,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { getKategoriTagihan, createTarif } from "@/services/tarif.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";
import { getKelas } from "@/services/kelas.service";

const TINGKAT_OPTIONS = [
  { value: "1", label: "Tingkat 1 / Kelas 1" },
  { value: "2", label: "Tingkat 2 / Kelas 2" },
  { value: "3", label: "Tingkat 3 / Kelas 3" },
  { value: "4", label: "Tingkat 4 / Kelas 4" },
  { value: "5", label: "Tingkat 5 / Kelas 5" },
  { value: "6", label: "Tingkat 6 / Kelas 6" },
  { value: "7", label: "Tingkat 7 / Kelas 7 (SMP)" },
  { value: "8", label: "Tingkat 8 / Kelas 8 (SMP)" },
  { value: "9", label: "Tingkat 9 / Kelas 9 (SMP)" },
  { value: "10", label: "Tingkat 10 / Kelas 10 (SMA/SMK)" },
  { value: "11", label: "Tingkat 11 / Kelas 11 (SMA/SMK)" },
  { value: "12", label: "Tingkat 12 / Kelas 12 (SMA/SMK)" },
];

export default function TambahTarifTagihanPage() {
  const router = useRouter();

  const [active, setActive] = useState("tarif");
  const [collapsed, setCollapsed] = useState(false);

  const [kategoriList, setKategoriList] = useState([]);
  const [tahunList, setTahunList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    kategoriTagihanId: "",
    tahunAjaranId: "",
    cakupan: "semua",
    tingkat: "",
    kelasId: "",
    nominal: "",
    keterangan: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchOptions() {
      setLoadingOptions(true);
      try {
        const [katRes, thnRes, klsRes] = await Promise.allSettled([
          getKategoriTagihan({ page: 1, limit: 100 }),
          getTahunAjaran(),
          getKelas({ limit: 200 }),
        ]);

        if (mounted) {
          if (katRes.status === "fulfilled") {
            const list = Array.isArray(katRes.value?.data)
              ? katRes.value.data
              : Array.isArray(katRes.value)
              ? katRes.value
              : [];
            setKategoriList(list);
            if (list.length > 0 && !formData.kategoriTagihanId) {
              setFormData((prev) => ({ ...prev, kategoriTagihanId: list[0].id }));
            }
          }

          if (thnRes.status === "fulfilled") {
            const list = Array.isArray(thnRes.value?.data)
              ? thnRes.value.data
              : Array.isArray(thnRes.value)
              ? thnRes.value
              : [];
            setTahunList(list);
            const activeThn = list.find((t) => t.status === "aktif" || t.status === true);
            if (activeThn && !formData.tahunAjaranId) {
              setFormData((prev) => ({ ...prev, tahunAjaranId: activeThn.id }));
            } else if (list.length > 0 && !formData.tahunAjaranId) {
              setFormData((prev) => ({ ...prev, tahunAjaranId: list[0].id }));
            }
          }

          if (klsRes.status === "fulfilled") {
            const list = Array.isArray(klsRes.value?.data)
              ? klsRes.value.data
              : Array.isArray(klsRes.value)
              ? klsRes.value
              : [];
            setKelasList(list);
          }
        }
      } catch (err) {
        if (mounted) console.error("Gagal memuat opsi form:", err);
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    }

    fetchOptions();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.kategoriTagihanId) {
      setError("Pilih kategori tagihan terlebih dahulu.");
      return;
    }
    if (!formData.tahunAjaranId) {
      setError("Pilih tahun ajaran terlebih dahulu.");
      return;
    }
    if (!formData.nominal || Number(formData.nominal) <= 0) {
      setError("Nominal tarif harus lebih dari 0.");
      return;
    }
    if (formData.cakupan === "tingkat" && !formData.tingkat) {
      setError("Silakan pilih tingkat kelas.");
      return;
    }
    if (formData.cakupan === "kelas" && !formData.kelasId) {
      setError("Silakan pilih rombel / kelas.");
      return;
    }

    setSubmitting(true);

    try {
      await createTarif({
        kategoriTagihanId: formData.kategoriTagihanId,
        tahunAjaranId: formData.tahunAjaranId,
        kelasId: formData.cakupan === "kelas" ? formData.kelasId || undefined : undefined,
        tingkat: formData.cakupan === "tingkat" ? formData.tingkat || undefined : undefined,
        nominal: Number(formData.nominal),
        keterangan: formData.keterangan.trim() || undefined,
      });

      setSuccess("Tarif tagihan berhasil ditambahkan.");
      setTimeout(() => {
        router.push("/admin/keuangan/setting-tarif");
      }, 1000);
    } catch (err) {
      console.error("Gagal menambah tarif:", err);
      setError(err?.message || "Gagal menambahkan tarif tagihan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header active={active} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <Link
                href="/admin/keuangan/setting-tarif"
                className="theme-text-muted inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Setting Tarif
              </Link>
              <h1 className="theme-text mt-2 text-2xl font-bold">
                Tambah Tarif Tagihan
              </h1>
              <p className="theme-text-secondary mt-1 text-sm">
                Atur besaran biaya tagihan untuk seluruh siswa, per tingkat, atau per rombel kelas tertentu.
              </p>
            </div>

            {error && (
              <div className="theme-danger flex items-start gap-3 rounded-xl border p-4 text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {success && (
              <div className="theme-success flex items-start gap-3 rounded-xl border p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">{success}</div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="theme-card theme-border rounded-2xl border p-6 shadow-sm sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Kategori Tagihan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="kategoriTagihanId"
                    value={formData.kategoriTagihanId}
                    onChange={handleChange}
                    disabled={loadingOptions || submitting}
                    className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriList.map((kat) => (
                      <option key={kat.id} value={kat.id}>
                        {kat.kode} - {kat.nama} ({kat.siklus})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Tahun Ajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tahunAjaranId"
                    value={formData.tahunAjaranId}
                    onChange={handleChange}
                    disabled={loadingOptions || submitting}
                    className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                    required
                  >
                    <option value="">-- Pilih Tahun Ajaran --</option>
                    {tahunList.map((thn) => (
                      <option key={thn.id} value={thn.id}>
                        {thn.tahun} ({thn.semester || "-"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Cakupan Target Penerima <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: "semua", label: "Semua Siswa" },
                      { value: "tingkat", label: "Per Tingkat" },
                      { value: "kelas", label: "Per Kelas" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            cakupan: item.value,
                            tingkat: "",
                            kelasId: "",
                          }))
                        }
                        className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                          formData.cakupan === item.value
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : "theme-card theme-border theme-text hover:bg-[var(--color-sidebar-active)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.cakupan === "tingkat" && (
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Tingkat Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tingkat"
                      value={formData.tingkat}
                      onChange={handleChange}
                      disabled={submitting}
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                      required
                    >
                      <option value="">-- Pilih Tingkat --</option>
                      {TINGKAT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.cakupan === "kelas" && (
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Rombel / Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="kelasId"
                      value={formData.kelasId}
                      onChange={handleChange}
                      disabled={submitting}
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                      required
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {kelasList.map((kls) => (
                        <option key={kls.id} value={kls.id}>
                          {kls.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Nominal Tarif (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="nominal"
                    value={formData.nominal}
                    onChange={handleChange}
                    placeholder="Contoh: 350000"
                    disabled={submitting}
                    className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Keterangan
                  </label>
                  <textarea
                    rows={3}
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    placeholder="Keterangan tambahan mengenai tarif ini..."
                    disabled={submitting}
                    className="theme-input w-full rounded-xl border p-3.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="theme-border mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/keuangan/setting-tarif"
                  className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--color-sidebar-active)]"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Tarif
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
