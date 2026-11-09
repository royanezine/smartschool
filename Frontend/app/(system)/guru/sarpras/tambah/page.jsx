"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FilePlus2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  CalendarDays,
  FileText,
  Hash,
  Tag,
  MapPin,
  Building2,
  Info,
  ListChecks,
  Clock,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getAset,
  createLaporanKerusakan,
} from "@/services/sarpras.service";

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  return [];
}

function getTanggalHariIni() {
  const tanggal = new Date();
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}

function formatTanggalPanjang(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] disabled:opacity-60";

const labelClass =
  "mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

export default function TambahLaporanKerusakanPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [asetList, setAsetList] = useState([]);
  const [loadingAset, setLoadingAset] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    asetId: "",
    tanggalLaporan: getTanggalHariIni(),
    deskripsi: "",
  });

  useEffect(() => {
    let active = true;

    const loadAset = async () => {
      try {
        setLoadingAset(true);
        setError("");

        const response = await getAset();

        if (active) {
          setAsetList(extractList(response));
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Gagal mengambil data aset.");
        }
      } finally {
        if (active) {
          setLoadingAset(false);
        }
      }
    };

    loadAset();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.asetId) {
      setError("Silakan pilih aset yang mengalami kerusakan.");
      return;
    }

    if (!form.tanggalLaporan) {
      setError("Tanggal laporan wajib diisi.");
      return;
    }

    if (!form.deskripsi.trim()) {
      setError("Deskripsi kerusakan wajib diisi.");
      return;
    }

    const payload = {
      asetId: form.asetId,
      tanggalLaporan: form.tanggalLaporan,
      deskripsi: form.deskripsi.trim(),
    };

    try {
      setLoadingSubmit(true);

      await createLaporanKerusakan(payload);

      setSuccess("Laporan kerusakan berhasil ditambahkan.");

      setTimeout(() => {
        router.push("/guru/sarpras");
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err?.message || "Gagal menambahkan laporan kerusakan."
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const asetTerpilih = useMemo(() => {
    return asetList.find(
      (item) => String(item.id) === String(form.asetId)
    );
  }, [asetList, form.asetId]);

  const jumlahKarakter = form.deskripsi.length;

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header toggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Link
                    href="/guru/sarpras"
                    className="theme-card theme-border theme-text rounded-xl border p-2.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                  >
                    <ArrowLeft size={19} />
                  </Link>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                      Sarana &amp; Prasarana
                    </p>

                    <h1 className="theme-text mt-1 text-2xl font-bold">
                      Tambah Laporan Kerusakan
                    </h1>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Isi informasi aset dan kerusakan yang ditemukan.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="theme-text-secondary rounded-full border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-3 py-1.5 text-xs font-medium">
                    {loadingAset
                      ? "Memuat aset..."
                      : `${asetList.length} aset tersedia`}
                  </span>

                  <span className="theme-warning rounded-full border border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] px-3 py-1.5 text-xs font-semibold">
                    Status awal: Menunggu
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <div className="space-y-5 xl:col-span-2">
                  <form
                    onSubmit={handleSubmit}
                    className={`theme-card theme-border space-y-6 rounded-2xl border p-5 sm:p-7 ${themeCardShadow}`}
                  >
                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4 text-sm theme-danger">
                        <AlertCircle
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                        <span>{error}</span>
                      </div>
                    )}

                    {success && (
                      <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] p-4 text-sm theme-success">
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                        <span>{success}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
                      <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-3">
                        <FilePlus2
                          size={20}
                          className="theme-primary"
                        />
                      </div>
                      <div>
                        <h2 className="theme-text font-semibold">
                          Formulir Laporan
                        </h2>
                        <p className="theme-text-secondary text-xs">
                          Lengkapi data aset dan deskripsi kerusakan.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="asetId" className={labelClass}>
                          <Package size={14} />
                          Aset yang Mengalami Kerusakan
                          <span className="theme-danger">*</span>
                        </label>

                        <select
                          id="asetId"
                          name="asetId"
                          value={form.asetId}
                          onChange={handleChange}
                          disabled={loadingAset || loadingSubmit}
                          className={inputClass}
                          required
                        >
                          <option value="">
                            {loadingAset
                              ? "Memuat data aset..."
                              : "Pilih aset"}
                          </option>

                          {asetList.map((aset) => (
                            <option key={aset.id} value={aset.id}>
                              {aset.nama}
                              {aset.kode ? ` (${aset.kode})` : ""}
                            </option>
                          ))}
                        </select>

                        {!loadingAset && asetList.length === 0 && (
                          <p className="theme-danger mt-2 text-xs">
                            Data aset tidak tersedia.
                          </p>
                        )}

                        {!loadingAset && asetList.length > 0 && (
                          <p className="theme-text-secondary mt-2 text-xs">
                            Pilih aset sekolah yang mengalami kerusakan.
                          </p>
                        )}

                        {asetTerpilih && (
                          <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3 text-xs sm:grid-cols-3">
                            <div className="flex items-center gap-1.5">
                              <Hash
                                size={12}
                                className="theme-text-muted"
                              />
                              <span className="theme-text-secondary">
                                Kode:
                              </span>
                              <span className="theme-text font-medium">
                                {asetTerpilih.kode || "-"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Tag
                                size={12}
                                className="theme-text-muted"
                              />
                              <span className="theme-text-secondary">
                                Kategori:
                              </span>
                              <span className="theme-text font-medium">
                                {asetTerpilih.kategoriAset?.nama || "-"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <MapPin
                                size={12}
                                className="theme-text-muted"
                              />
                              <span className="theme-text-secondary">
                                Ruangan:
                              </span>
                              <span className="theme-text font-medium">
                                {asetTerpilih.ruangan?.nama || "-"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="tanggalLaporan"
                          className={labelClass}
                        >
                          <CalendarDays size={14} />
                          Tanggal Laporan
                          <span className="theme-danger">*</span>
                        </label>

                        <input
                          id="tanggalLaporan"
                          type="date"
                          name="tanggalLaporan"
                          value={form.tanggalLaporan}
                          onChange={handleChange}
                          disabled={loadingSubmit}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          <Clock size={14} />
                          Status Awal
                        </label>

                        <div className="theme-warning flex h-[46px] items-center rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] px-4 text-sm font-semibold">
                          Menunggu
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="deskripsi" className={labelClass}>
                          <FileText size={14} />
                          Deskripsi Kerusakan
                          <span className="theme-danger">*</span>
                        </label>

                        <textarea
                          id="deskripsi"
                          name="deskripsi"
                          value={form.deskripsi}
                          onChange={handleChange}
                          rows={6}
                          maxLength={5000}
                          disabled={loadingSubmit}
                          placeholder="Jelaskan kerusakan aset secara lengkap, termasuk kondisi dan bagian yang mengalami kerusakan..."
                          className={`${inputClass} resize-y`}
                          required
                        />

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="theme-text-secondary">
                            Semakin detail, semakin mudah ditindaklanjuti.
                          </span>
                          <span
                            className={
                              jumlahKarakter > 4800
                                ? "theme-danger font-semibold"
                                : "theme-text-secondary"
                            }
                          >
                            {jumlahKarakter}/5000 karakter
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] p-4">
                      <div className="flex items-start gap-2">
                        <Info
                          size={16}
                          className="theme-primary mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="theme-text text-sm font-semibold">
                            Informasi Status Laporan
                          </p>
                          <p className="theme-text-secondary mt-1 text-sm">
                            Setelah laporan dikirim, status akan
                            otomatis menjadi{" "}
                            <span className="theme-warning font-semibold">
                              Menunggu
                            </span>
                            . Admin Sarana Prasarana akan memeriksa dan
                            memperbarui status penanganan laporan.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
                      <Link
                        href="/guru/sarpras"
                        className="theme-border theme-text inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                      >
                        Batal
                      </Link>

                      <button
                        type="submit"
                        disabled={
                          loadingSubmit ||
                          loadingAset ||
                          asetList.length === 0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loadingSubmit ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Save size={17} />
                        )}

                        {loadingSubmit
                          ? "Menyimpan..."
                          : "Simpan Laporan"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-5 xl:col-span-1">
                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <ListChecks size={16} className="theme-primary" />
                      <h3 className="theme-text text-sm font-semibold">
                        Ringkasan Laporan
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                        <p className="theme-text-muted text-xs">
                          Aset
                        </p>
                        <p className="theme-text mt-1 text-sm font-semibold">
                          {asetTerpilih?.nama || "Belum dipilih"}
                        </p>
                        {asetTerpilih?.kode && (
                          <p className="theme-text-secondary mt-1 text-xs">
                            Kode: {asetTerpilih.kode}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                        <p className="theme-text-muted text-xs">
                          Tanggal Laporan
                        </p>
                        <p className="theme-text mt-1 text-sm font-semibold">
                          {formatTanggalPanjang(form.tanggalLaporan)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                        <p className="theme-text-muted text-xs">
                          Status
                        </p>
                        <span className="theme-warning mt-1.5 inline-block rounded-full border border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] px-2.5 py-1 text-xs font-semibold">
                          Menunggu
                        </span>
                      </div>

                      {asetTerpilih?.kategoriAset?.nama && (
                        <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                          <p className="theme-text-muted text-xs">
                            Kategori Aset
                          </p>
                          <p className="theme-text mt-1 flex items-center gap-1.5 text-sm font-semibold">
                            <Tag size={13} />
                            {asetTerpilih.kategoriAset.nama}
                          </p>
                        </div>
                      )}

                      {asetTerpilih?.ruangan?.nama && (
                        <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                          <p className="theme-text-muted text-xs">
                            Ruangan
                          </p>
                          <p className="theme-text mt-1 flex items-center gap-1.5 text-sm font-semibold">
                            <MapPin size={13} />
                            {asetTerpilih.ruangan.nama}
                          </p>
                        </div>
                      )}

                      {asetTerpilih?.gudang?.nama && (
                        <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                          <p className="theme-text-muted text-xs">
                            Gudang
                          </p>
                          <p className="theme-text mt-1 flex items-center gap-1.5 text-sm font-semibold">
                            <Building2 size={13} />
                            {asetTerpilih.gudang.nama}
                          </p>
                        </div>
                      )}

                      <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                        <p className="theme-text-muted text-xs">
                          Deskripsi
                        </p>
                        <p className="theme-text-secondary mt-1 line-clamp-4 text-xs leading-relaxed">
                          {form.deskripsi.trim() ||
                            "Belum ada deskripsi kerusakan."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Info size={16} className="theme-primary" />
                      <h3 className="theme-text text-sm font-semibold">
                        Panduan Pengisian
                      </h3>
                    </div>

                    <ul className="theme-text-secondary space-y-2 text-xs leading-relaxed">
                      <li className="flex gap-2">
                        <span className="theme-primary">•</span>
                        Pilih aset yang benar-benar mengalami kerusakan.
                      </li>
                      <li className="flex gap-2">
                        <span className="theme-primary">•</span>
                        Tuliskan bagian aset yang rusak dan tingkat
                        kerusakannya.
                      </li>
                      <li className="flex gap-2">
                        <span className="theme-primary">•</span>
                        Sertakan tanggal kejadian atau penemuan kerusakan.
                      </li>
                      <li className="flex gap-2">
                        <span className="theme-primary">•</span>
                        Laporan akan diteruskan ke Admin Sarana
                        Prasarana untuk ditindaklanjuti.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}