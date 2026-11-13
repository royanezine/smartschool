
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { createRuangan } from "@/services/sarpras.service";
import {
  getGedung,
  getLantaiByGedung,
} from "@/services/infrastruktur.service";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Building2,
  Info,
  CheckCircle2,
  Lightbulb,
  Layers3,
  MapPin,
} from "lucide-react";

const EMPTY_FORM = {
  nama: "",
  gedungId: "",
  lantaiId: "",
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
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Terjadi kesalahan. Silakan coba lagi."
  );
}

export default function TambahRuanganPage() {
  const router = useRouter();

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [loadingLantai, setLoadingLantai] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [gedungList, setGedungList] = useState([]);
  const [lantaiList, setLantaiList] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadMasterData = useCallback(async () => {
    try {
      setLoadingMaster(true);
      setErrorMessage("");

      const responseGedung = await getGedung();

      if (responseGedung?.success === false) {
        throw new Error(
          responseGedung.message || "Gagal mengambil data gedung."
        );
      }

      setGedungList(extractData(responseGedung));
    } catch (error) {
      console.error("Gagal mengambil data gedung:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  const loadLantai = async (gedungId) => {
    if (!gedungId) {
      setLantaiList([]);
      return;
    }

    try {
      setLoadingLantai(true);
      setErrorMessage("");

      const response = await getLantaiByGedung(gedungId);

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal mengambil data lantai."
        );
      }

      setLantaiList(extractData(response));
    } catch (error) {
      console.error("Gagal mengambil data lantai:", error);
      setLantaiList([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingLantai(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGedungChange = async (event) => {
    const gedungId = event.target.value;

    setForm((prev) => ({
      ...prev,
      gedungId,
      lantaiId: "",
    }));

    setLantaiList([]);

    if (gedungId) {
      await loadLantai(gedungId);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!form.nama.trim()) {
      setErrorMessage("Nama ruangan wajib diisi.");
      return;
    }

    if (form.lantaiId && !form.gedungId) {
      setErrorMessage("Pilih gedung terlebih dahulu.");
      return;
    }

    const kapasitasValue =
      form.kapasitas.trim() === ""
        ? null
        : Number(form.kapasitas);

    if (
      kapasitasValue !== null &&
      (!Number.isInteger(kapasitasValue) || kapasitasValue < 0)
    ) {
      setErrorMessage(
        "Kapasitas harus berupa angka bulat dan tidak boleh negatif."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        nama: form.nama.trim(),

        // Kirim UUID relasi, bukan nama gedung/lantai.
        gedungId: form.gedungId || null,
        lantaiId: form.lantaiId || null,

        // Lokasi tetap berupa keterangan teks.
        lokasi: form.lokasi.trim() || null,

        kapasitas: kapasitasValue,
        keterangan: form.keterangan.trim() || null,
      };

      const response = await createRuangan(payload);

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal menyimpan ruangan."
        );
      }

      router.push("/admin/sarpras/ruangan");
      router.refresh();
    } catch (error) {
      console.error("Gagal membuat ruangan:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
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

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full p-4 sm:p-6 lg:p-8 2xl:px-12">

              {/* Tombol Kembali */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/sarpras/ruangan")
                  }
                  className="inline-flex w-fit items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Daftar Ruangan
                </button>
              </div>

              {/* Header Halaman */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                  <Building2 size={24} />
                </div>

                <div>
                  <h1 className="theme-text text-2xl font-bold">
                    Tambah Ruangan
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm">
                    Lengkapi informasi ruangan dan tentukan gedung serta
                    lantai tempat ruangan berada.
                  </p>
                </div>
              </div>

              {/* Pesan Error */}
              {errorMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="flex-1">
                    {errorMessage}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">

                {/* Form */}
                <div className="min-w-0">
                  <form
                    onSubmit={handleSubmit}
                    className="theme-card space-y-5 rounded-2xl border theme-border p-6 shadow-sm"
                  >

                    {/* Nama Ruangan */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Nama Ruangan{" "}
                        <span className="text-red-500">*</span>
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

                    {/* Gedung */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Gedung
                      </label>

                      <div className="relative">
                        <Building2
                          size={18}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <select
                          name="gedungId"
                          value={form.gedungId}
                          onChange={handleGedungChange}
                          disabled={loadingMaster || submitting}
                          className="theme-input w-full appearance-none rounded-xl border theme-border bg-transparent py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                        >
                          <option value="">
                            {loadingMaster
                              ? "Memuat data gedung..."
                              : gedungList.length > 0
                                ? "Pilih gedung"
                                : "Belum ada data gedung"}
                          </option>

                          {gedungList.map((gedung) => (
                            <option
                              key={gedung.id}
                              value={gedung.id}
                            >
                              {gedung.nama}
                              {gedung.kode ? ` (${gedung.kode})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Pilih gedung tempat ruangan berada.
                      </p>
                    </div>

                    {/* Lantai */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Lantai
                      </label>

                      <div className="relative">
                        <Layers3
                          size={18}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <select
                          name="lantaiId"
                          value={form.lantaiId}
                          onChange={handleChange}
                          disabled={
                            !form.gedungId ||
                            loadingLantai ||
                            loadingMaster ||
                            submitting
                          }
                          className="theme-input w-full appearance-none rounded-xl border theme-border bg-transparent py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                        >
                          <option value="">
                            {!form.gedungId
                              ? "Pilih gedung terlebih dahulu"
                              : loadingLantai
                                ? "Memuat data lantai..."
                                : lantaiList.length > 0
                                  ? "Pilih lantai"
                                  : "Belum ada lantai pada gedung ini"}
                          </option>

                          {lantaiList.map((lantai) => (
                            <option
                              key={lantai.id}
                              value={lantai.id}
                            >
                              {lantai.nama}
                              {lantai.nomorLantai !== null &&
                              lantai.nomorLantai !== undefined
                                ? ` (Lantai ${lantai.nomorLantai})`
                                : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Pilihan lantai mengikuti gedung yang dipilih.
                      </p>
                    </div>

                    {/* Lokasi */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Keterangan Lokasi
                      </label>

                      <div className="relative">
                        <MapPin
                          size={18}
                          className="theme-text-muted absolute left-3.5 top-3.5"
                        />

                        <input
                          type="text"
                          name="lokasi"
                          value={form.lokasi}
                          onChange={handleChange}
                          maxLength={255}
                          placeholder="Contoh: Dekat perpustakaan atau sebelah ruang guru"
                          className="theme-input w-full rounded-xl border theme-border py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Isi keterangan tambahan lokasi jika diperlukan.
                      </p>
                    </div>

                    {/* Kapasitas */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Kapasitas
                      </label>

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

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Jumlah maksimal orang yang dapat menggunakan
                        ruangan.
                      </p>
                    </div>

                    {/* Keterangan */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Keterangan
                      </label>

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

                    {/* Tombol */}
                    <div className="flex justify-end gap-3 border-t theme-border pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          router.push("/admin/sarpras/ruangan")
                        }
                        disabled={submitting}
                        className="rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={
                          submitting ||
                          loadingMaster ||
                          loadingLantai
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
                      >
                        {submitting ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Save size={17} />
                        )}

                        {submitting
                          ? "Menyimpan..."
                          : "Simpan Ruangan"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Informasi Samping */}
                <aside className="flex min-w-0 flex-col gap-5">

                  <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex items-start gap-3 rounded-2xl border p-4">
                    <Info
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        Informasi Lokasi
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        Data gedung dan lantai diambil dari master
                        Infrastruktur sekolah. Pilihan lantai akan
                        menyesuaikan gedung yang dipilih.
                      </p>
                    </div>
                  </div>

                  {/* Ringkasan Lokasi */}
                  <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                    <h2 className="theme-text mb-4 text-sm font-bold">
                      Ringkasan Lokasi
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-2 text-[var(--color-primary)]">
                          <Building2 size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="theme-text-muted text-xs">
                            Gedung
                          </p>

                          <p className="theme-text mt-0.5 break-words text-sm font-semibold">
                            {gedungList.find(
                              (item) => item.id === form.gedungId
                            )?.nama || "Belum dipilih"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] p-2 theme-primary-text">
                          <Layers3 size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="theme-text-muted text-xs">
                            Lantai
                          </p>

                          <p className="theme-text mt-0.5 break-words text-sm font-semibold">
                            {lantaiList.find(
                              (item) => item.id === form.lantaiId
                            )?.nama || "Belum dipilih"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panduan */}
                  <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Lightbulb
                        size={17}
                        className="theme-primary-text"
                      />

                      <h2 className="theme-text text-sm font-bold">
                        Panduan
                      </h2>
                    </div>

                    <ul className="theme-text-secondary space-y-3 text-xs leading-relaxed">
                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--color-success)]"
                        />
                        Isi nama ruangan dengan spesifik, misalnya Lab
                        Komputer 1.
                      </li>

                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--color-success)]"
                        />
                        Pilih gedung terlebih dahulu sebelum memilih
                        lantai.
                      </li>

                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--color-success)]"
                        />
                        Kapasitas menunjukkan jumlah maksimal orang
                        dalam ruangan.
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
