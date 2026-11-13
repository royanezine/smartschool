
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getRuangan, updateRuangan } from "@/services/sarpras.service";
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
  ShieldCheck,
  Eye,
  LayoutGrid,
  Layers3,
  MapPin,
  ChevronDown,
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
    "Terjadi kesalahan."
  );
}

export default function EditRuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const lantaiRequestRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [loadingLantai, setLoadingLantai] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [gedungList, setGedungList] = useState([]);
  const [lantaiList, setLantaiList] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [originalData, setOriginalData] = useState(null);

  // Memuat lantai berdasarkan gedung yang dipilih.
  const loadLantai = useCallback(async (gedungId) => {
    const requestId = ++lantaiRequestRef.current;

    if (!gedungId) {
      setLantaiList([]);
      setLoadingLantai(false);
      return;
    }

    try {
      setLoadingLantai(true);

      const response = await getLantaiByGedung(gedungId);
      const data = extractData(response);

      // Mencegah response request lama menimpa pilihan gedung terbaru.
      if (requestId !== lantaiRequestRef.current) return;

      setLantaiList(data);
    } catch (error) {
      if (requestId !== lantaiRequestRef.current) return;

      console.error("Gagal memuat lantai:", error);
      setLantaiList([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      if (requestId === lantaiRequestRef.current) {
        setLoadingLantai(false);
      }
    }
  }, []);

  // Memuat data ruangan dan master gedung.
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingMaster(true);
      setErrorMessage("");

      const [responseGedung, responseRuangan] = await Promise.all([
        getGedung(),
        getRuangan(),
      ]);

      const gedungData = extractData(responseGedung);
      const ruanganData = extractData(responseRuangan);

      setGedungList(gedungData);

      const data = ruanganData.find(
        (item) => String(item.id) === String(id)
      );

      if (!data) {
        throw new Error("Data ruangan tidak ditemukan.");
      }

      setOriginalData(data);

      const gedungId = data.gedungId || data.gedung?.id || "";
      const lantaiId = data.lantaiId || data.lantai?.id || "";

      setForm({
        nama: data.nama || "",
        gedungId,
        lantaiId,
        lokasi: data.lokasi || "",
        kapasitas:
          data.kapasitas !== null && data.kapasitas !== undefined
            ? String(data.kapasitas)
            : "",
        keterangan: data.keterangan || "",
      });

      // Setelah data ruangan didapat, muat lantai gedung yang sudah tersimpan.
      if (gedungId) {
        setLoadingMaster(false);
        await loadLantai(gedungId);
      } else {
        setLantaiList([]);
      }
    } catch (error) {
      console.error("Gagal memuat data ruangan:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingMaster(false);
    }
  }, [id, loadLantai]);

  useEffect(() => {
    if (id) {
      loadInitialData();
    }

    return () => {
      lantaiRequestRef.current += 1;
    };
  }, [id, loadInitialData]);

  // Perubahan input biasa.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Perubahan gedung sekaligus reset lantai sebelumnya.
  const handleGedungChange = async (event) => {
    const gedungId = event.target.value;

    setForm((prev) => ({
      ...prev,
      gedungId,
      lantaiId: "",
    }));

    setLantaiList([]);
    setErrorMessage("");

    if (gedungId) {
      await loadLantai(gedungId);
    } else {
      lantaiRequestRef.current += 1;
      setLoadingLantai(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!form.nama.trim()) {
      setErrorMessage("Nama ruangan wajib diisi.");
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

    if (form.lantaiId && !form.gedungId) {
      setErrorMessage("Pilih gedung terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        nama: form.nama.trim(),
        gedungId: form.gedungId || null,
        lantaiId: form.lantaiId || null,
        lokasi: form.lokasi.trim() || null,
        kapasitas: kapasitasValue,
        keterangan: form.keterangan.trim() || null,
      };

      const response = await updateRuangan(id, payload);

      if (response?.success === false) {
        throw new Error(response.message || "Gagal memperbarui ruangan.");
      }

      router.push("/admin/sarpras/ruangan");
      router.refresh();
    } catch (error) {
      console.error("Gagal memperbarui ruangan:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedGedung = gedungList.find(
    (item) => String(item.id) === String(form.gedungId)
  );

  const selectedLantai = lantaiList.find(
    (item) => String(item.id) === String(form.lantaiId)
  );

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="animate-spin text-[var(--color-primary)]"
            size={32}
          />
          <p className="theme-text-muted text-sm font-medium">
            Memuat data ruangan...
          </p>
        </div>
      </div>
    );
  }

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
            <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 2xl:px-12">

              {/* Header halaman */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/sarpras/ruangan")}
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Daftar Ruangan
                  </button>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] theme-primary-text">
                      <Building2 size={24} />
                    </div>

                    <div>
                      <h1 className="theme-text text-2xl font-bold">
                        Edit Ruangan
                      </h1>
                      <p className="theme-text-muted mt-1 text-sm">
                        Perbarui informasi dan lokasi ruangan.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/admin/sarpras/ruangan/${id}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                >
                  <Eye size={16} />
                  Lihat Detail Ruangan
                </button>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">

                {/* Form */}
                <div className="min-w-0">
                  <form
                    onSubmit={handleSubmit}
                    className="theme-card space-y-5 rounded-2xl border theme-border p-6 shadow-sm"
                  >
                    <div className="mb-5 border-b theme-border pb-4">
                      <h2 className="theme-text flex items-center gap-2 text-lg font-bold">
                        <LayoutGrid
                          size={18}
                          className="text-[var(--color-primary)]"
                        />
                        Informasi Ruangan
                      </h2>
                      <p className="theme-text-muted mt-1 text-xs">
                        Ubah data di bawah ini sesuai kebutuhan.
                      </p>
                    </div>

                    {/* Nama */}
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
                        placeholder="Contoh: Lab Komputer 1"
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
                          className="theme-input w-full appearance-none rounded-xl border theme-border bg-transparent py-3 pl-10 pr-10 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                        >
                          <option value="">Tidak memilih gedung</option>

                          {gedungList.map((gedung) => (
                            <option key={gedung.id} value={gedung.id}>
                              {gedung.nama}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                        />
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
                          className="theme-input w-full appearance-none rounded-xl border theme-border bg-transparent py-3 pl-10 pr-10 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                        >
                          <option value="">
                            {!form.gedungId
                              ? "Pilih gedung terlebih dahulu"
                              : loadingLantai
                                ? "Memuat lantai..."
                                : "Tidak memilih lantai"}
                          </option>

                          {lantaiList.map((lantai) => (
                            <option key={lantai.id} value={lantai.id}>
                              {lantai.nama}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                        />
                      </div>

                      {form.gedungId && !loadingLantai && lantaiList.length === 0 && (
                        <p className="mt-1.5 text-xs text-amber-600">
                          Belum ada lantai pada gedung ini.
                        </p>
                      )}
                    </div>

                    {/* Lokasi */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Keterangan Lokasi
                      </label>

                      <div className="relative">
                        <MapPin
                          size={18}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          name="lokasi"
                          value={form.lokasi}
                          onChange={handleChange}
                          maxLength={255}
                          placeholder="Contoh: Sebelah ruang guru"
                          className="theme-input w-full rounded-xl border theme-border py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
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
                        onClick={() => router.push("/admin/sarpras/ruangan")}
                        disabled={submitting}
                        className="rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
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
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}

                        {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Panel informasi */}
                <aside className="flex min-w-0 flex-col gap-5">

                  <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex items-start gap-3 rounded-2xl border p-4">
                    <Info size={17} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Perhatian</p>
                      <p className="mt-1 text-xs leading-5">
                        Mengubah gedung atau lantai ruangan tidak akan
                        memindahkan aset secara otomatis. Penyesuaian aset
                        dilakukan secara manual pada menu Manajemen Aset.
                      </p>
                    </div>
                  </div>

                  {/* Ringkasan lokasi */}
                  <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <MapPin
                        size={17}
                        className="text-[var(--color-primary)]"
                      />
                      <h2 className="text-sm font-bold">
                        Lokasi Ruangan
                      </h2>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="theme-text-muted mb-1">
                          Gedung
                        </p>
                        <p className="theme-text font-semibold">
                          {selectedGedung?.nama || "Belum dipilih"}
                        </p>
                      </div>

                      <div className="theme-border-soft h-px" />

                      <div>
                        <p className="theme-text-muted mb-1">
                          Lantai
                        </p>
                        <p className="theme-text font-semibold">
                          {selectedLantai?.nama || "Belum dipilih"}
                        </p>
                      </div>

                      <div className="theme-border-soft h-px" />

                      <div>
                        <p className="theme-text-muted mb-1">
                          Keterangan Lokasi
                        </p>
                        <p className="theme-text font-semibold">
                          {form.lokasi || "-"}
                        </p>
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
                      <h2 className="text-sm font-bold">
                        Panduan Edit
                      </h2>
                    </div>

                    <ul className="theme-text-secondary space-y-3 text-xs leading-relaxed">
                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--color-success)]"
                        />
                        Pastikan nama ruangan sesuai dengan kondisi sebenarnya.
                      </li>

                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--color-success)]"
                        />
                        Kapasitas diisi dengan jumlah maksimal orang.
                      </li>

                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-[var(--color-success)]"
                        />
                        Pilihan lantai mengikuti gedung yang dipilih.
                      </li>
                    </ul>
                  </div>

                  {/* Data lama */}
                  <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <ShieldCheck
                        size={17}
                        className="text-[var(--color-primary)]"
                      />
                      <h2 className="text-sm font-bold">
                        Data Saat Ini
                      </h2>
                    </div>

                    <div className="theme-text-secondary mt-3 space-y-3 text-xs">
                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Nama Lama
                        </p>
                        <p className="theme-text mt-0.5 font-semibold">
                          {originalData?.nama || "-"}
                        </p>
                      </div>

                      <div className="theme-border-soft h-px" />

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Gedung Lama
                        </p>
                        <p className="theme-text mt-0.5 font-semibold">
                          {originalData?.gedung?.nama || "-"}
                        </p>
                      </div>

                      <div className="theme-border-soft h-px" />

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Lantai Lama
                        </p>
                        <p className="theme-text mt-0.5 font-semibold">
                          {originalData?.lantai?.nama || "-"}
                        </p>
                      </div>

                      <div className="theme-border-soft h-px" />

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Keterangan Lokasi Lama
                        </p>
                        <p className="theme-text mt-0.5 font-semibold">
                          {originalData?.lokasi || "-"}
                        </p>
                      </div>

                      <div className="theme-border-soft h-px" />

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Kapasitas Lama
                        </p>
                        <p className="theme-text mt-0.5 font-semibold">
                          {originalData?.kapasitas !== null &&
                          originalData?.kapasitas !== undefined
                            ? `${originalData.kapasitas} Orang`
                            : "-"}
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
    </div>
  );
}
