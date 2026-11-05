"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getRuangan, updateRuangan } from "@/services/sarpras.service";
import { getGedung, getLantaiByGedung } from "@/services/infrastruktur.service";

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

  const [loading, setLoading] = useState(true);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [gedungList, setGedungList] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [originalData, setOriginalData] = useState(null);

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
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  const loadRuanganData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRuangan();
      const data = extractData(response).find(
        (item) => String(item.id) === String(id)
      );

      if (!data) throw new Error("Data ruangan tidak ditemukan.");

      setOriginalData(data);
      setForm({
        nama: data.nama || "",
        lokasi: data.lokasi || "",
        kapasitas:
          data.kapasitas !== null && data.kapasitas !== undefined
            ? String(data.kapasitas)
            : "",
        keterangan: data.keterangan || "",
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRuanganData();
    loadMasterData();
  }, [loadRuanganData, loadMasterData]);

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

    const kapasitasValue =
      form.kapasitas.trim() === "" ? null : Number(form.kapasitas);
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
        lokasi: form.lokasi.trim() || null,
        kapasitas: kapasitasValue,
        keterangan: form.keterangan.trim() || null,
      };

      const response = await updateRuangan(id, payload);
      if (response?.success === false) throw new Error(response.message);

      router.push("/admin/sarpras/ruangan");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
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
            <div className="w-full p-4 sm:p-6 lg:p-8 2xl:px-12 space-y-6">
              
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
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h1 className="theme-text text-2xl font-bold">Edit Ruangan</h1>
                      <p className="theme-text-muted mt-1 text-sm">
                        Perbarui data ruangan yang sudah terdaftar.
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

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                
                <div className="min-w-0">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5 theme-card rounded-2xl border theme-border p-6 shadow-sm"
                  >
                    <div className="border-b theme-border pb-4 mb-5">
                      <h2 className="theme-text font-bold text-lg flex items-center gap-2">
                        <LayoutGrid size={18} className="text-[var(--color-primary)]" />
                        Informasi Ruangan
                      </h2>
                      <p className="theme-text-muted text-xs mt-1">
                        Ubah data di bawah ini sesuai kebutuhan.
                      </p>
                    </div>

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
                        className="theme-input w-full rounded-xl border theme-border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Lokasi
                      </label>
                      <div className="relative">
                        <Building2
                          size={18}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                        <select
                          name="lokasi"
                          value={form.lokasi}
                          onChange={handleChange}
                          disabled={loadingMaster}
                          className="theme-input w-full appearance-none rounded-xl border theme-border bg-transparent py-3 pl-10 pr-9 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                        >
                          <option value="">Pilih gedung dan lantai</option>
                          {lokasiOptions.map((lokasi) => (
                            <option
                              key={`${lokasi.gedungId}-${lokasi.id}`}
                              value={lokasi.label}
                            >
                              {lokasi.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

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

                <aside className="flex min-w-0 flex-col gap-5">
                  <div className="theme-info flex items-start gap-3 rounded-2xl border p-4">
                    <Info size={17} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Perhatian</p>
                      <p className="mt-1 text-xs leading-5">
                        Mengubah lokasi ruangan tidak akan memindahkan aset
                        secara otomatis. Penyesuaian aset dilakukan secara
                        manual pada menu Manajemen Aset.
                      </p>
                    </div>
                  </div>

                  <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={17} className="text-[var(--color-warning)]" />
                      <h2 className="text-sm font-bold">Panduan Edit</h2>
                    </div>
                    <ul className="space-y-3 text-xs leading-relaxed theme-text-secondary">
                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 text-[var(--color-success)] shrink-0"
                        />
                        Pastikan nama ruangan tidak sama dengan ruangan lain.
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 text-[var(--color-success)] shrink-0"
                        />
                        Kapasitas diisi dengan angka realistis (jumlah maksimal
                        orang).
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 text-[var(--color-success)] shrink-0"
                        />
                        Lokasi mengikuti master gedung dan lantai sekolah.
                      </li>
                    </ul>
                  </div>

                  <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={17} className="text-[var(--color-primary)]" />
                      <h2 className="text-sm font-bold">Data Saat Ini</h2>
                    </div>
                    <div className="space-y-3 text-xs theme-text-secondary mt-3">
                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Nama Lama
                        </p>
                        <p className="theme-text font-semibold mt-0.5">
                          {originalData?.nama || "-"}
                        </p>
                      </div>
                      <div className="theme-border-soft h-px" />
                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Lokasi Lama
                        </p>
                        <p className="theme-text font-semibold mt-0.5">
                          {originalData?.lokasi || "-"}
                        </p>
                      </div>
                      <div className="theme-border-soft h-px" />
                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Kapasitas Lama
                        </p>
                        <p className="theme-text font-semibold mt-0.5">
                          {originalData?.kapasitas
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