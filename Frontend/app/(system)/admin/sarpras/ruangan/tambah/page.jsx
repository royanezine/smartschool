"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { createRuangan } from "@/services/sarpras.service";
import { getGedung, getLantaiByGedung } from "@/services/infrastruktur.service";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Building2,
  Info,
  CheckCircle2,
  LayoutGrid,
  Lightbulb,
} from "lucide-react";

const EMPTY_FORM = {
  nama: "",
  lokasi: "",
  kapasitas: "",
  keterangan: "",
};

function extractData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.data?.message || error?.message || "Terjadi kesalahan.";
}

export default function TambahRuanganPage() {
  const router = useRouter();

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [gedungList, setGedungList] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadMasterData = useCallback(async () => {
    try {
      setLoadingMaster(true);
      const responseGedung = await getGedung();
      const gedungData = extractData(responseGedung);
      setGedungList(gedungData);

      if (gedungData.length === 0) {
        setLokasiOptions([]);
        return;
      }

      const hasilLantai = await Promise.allSettled(
        gedungData.map(async (gedung) => {
          if (!gedung.id) return [];
          const responseLantai = await getLantaiByGedung(gedung.id);
          return extractData(responseLantai).map((lantai) => ({
            id: lantai.id,
            gedungId: gedung.id,
            label: `${gedung.nama} - ${lantai.nama}`,
          }));
        })
      );

      const semuaLokasi = hasilLantai.flatMap((hasil) =>
        hasil.status === "fulfilled" ? hasil.value : []
      );
      setLokasiOptions(semuaLokasi);
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!form.nama.trim()) {
      setErrorMessage("Nama ruangan wajib diisi.");
      return;
    }

    const kapasitasValue = form.kapasitas.trim() === "" ? null : Number(form.kapasitas);
    if (kapasitasValue !== null && (!Number.isInteger(kapasitasValue) || kapasitasValue < 0)) {
      setErrorMessage("Kapasitas harus berupa angka bulat dan tidak boleh negatif.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nama: form.nama.trim(),
        lokasi: form.lokasi.trim() || null,
        kapasitas: kapasitasValue,
        keterangan: form.keterangan.trim() || null,
      };

      const response = await createRuangan(payload);
      if (response?.success === false) throw new Error(response.message);

      router.push("/admin/sarpras/ruangan");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active="sarpras" setActive={() => {}} collapsed={false} setCollapsed={() => {}} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header toggleSidebar={() => {}} notifications={[]} user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }} />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full p-4 sm:p-6 lg:p-8 2xl:px-12">
              
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/ruangan")}
                  className="inline-flex w-fit items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Daftar Ruangan
                </button>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                  <Building2 size={24} />
                </div>
                <div>
                  <h1 className="theme-text text-2xl font-bold">Tambah Ruangan</h1>
                  <p className="theme-text-muted mt-1 text-sm">
                    Lengkapi formulir di bawah ini untuk mendaftarkan ruangan baru.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                
                <div className="min-w-0">
                  <form onSubmit={handleSubmit} className="space-y-5 theme-card rounded-2xl border theme-border p-6 shadow-sm">
                    
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Nama Ruangan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={form.nama}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        placeholder="Contoh: Ruang Kelas 7A"
                        className="theme-input w-full rounded-xl border theme-border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">Lokasi</label>
                      <div className="relative">
                        <Building2 size={18} className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          name="lokasi"
                          value={form.lokasi}
                          onChange={handleChange}
                          disabled={loadingMaster}
                          className="theme-input w-full appearance-none rounded-xl border theme-border bg-transparent py-3 pl-10 pr-9 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                        >
                          <option value="">
                            {loadingMaster ? "Memuat data lokasi..." : lokasiOptions.length > 0 ? "Pilih gedung dan lantai" : "Belum ada data gedung/lantai"}
                          </option>
                          {lokasiOptions.map((lokasi) => (
                            <option key={`${lokasi.gedungId}-${lokasi.id}`} value={lokasi.label}>
                              {lokasi.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">Kapasitas</label>
                      <input
                        type="number"
                        name="kapasitas"
                        value={form.kapasitas}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        placeholder="Contoh: 40"
                        className="theme-input w-full rounded-xl border theme-border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">Keterangan</label>
                      <textarea
                        name="keterangan"
                        value={form.keterangan}
                        onChange={handleChange}
                        maxLength={255}
                        rows={4}
                        placeholder="Keterangan tambahan ruangan..."
                        className="theme-input w-full resize-none rounded-xl border theme-border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t theme-border">
                      <button
                        type="button"
                        onClick={() => router.push("/admin/sarpras/ruangan")}
                        disabled={submitting}
                        className="rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || loadingMaster}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
                      >
                        {submitting ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                        {submitting ? "Menyimpan..." : "Simpan Ruangan"}
                      </button>
                    </div>
                  </form>
                </div>

                <aside className="flex min-w-0 flex-col gap-5">
                  <div className="theme-info flex items-start gap-3 rounded-2xl border p-4">
                    <Info size={17} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Informasi</p>
                      <p className="mt-1 text-xs leading-5">
                        Data lokasi diambil otomatis dari master gedung dan lantai. Pastikan master data sudah dibuat sebelumnya.
                      </p>
                    </div>
                  </div>

                  <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={17} className="text-[var(--color-warning)]" />
                      <h2 className="text-sm font-bold">Panduan</h2>
                    </div>
                    <ul className="space-y-3 text-xs leading-relaxed theme-text-secondary">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="mt-0.5 text-[var(--color-success)] shrink-0" />
                        Isi nama ruangan dengan spesifik (contoh: Lab Komputer 1).
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="mt-0.5 text-[var(--color-success)] shrink-0" />
                        Kapasitas mewakili jumlah maksimal orang di dalam ruangan.
                      </li>
                    </ul>
                  </div>
                </aside>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}