
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Package,
  CalendarDays,
  FileText,
  Hash,
  Tag,
  MapPin,
  Info,
  Activity,
  Warehouse,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getAset,
  getLaporanKerusakanById,
  updateLaporanKerusakan,
} from "@/services/sarpras.service";

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function extractObject(response) {
  let result = response;

  while (
    result?.data &&
    !Array.isArray(result.data) &&
    typeof result.data === "object"
  ) {
    result = result.data;
  }

  return result;
}

function formatDateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLong(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getDisplayValue(...values) {
  const value = values.find(
    (item) =>
      item !== null &&
      item !== undefined &&
      String(item).trim() !== ""
  );

  return value ? String(value).trim() : "-";
}

function getLokasiAset(aset) {
  if (!aset) return "-";

  const values = [
    aset.lokasi,
    aset.ruangan?.nama,
    aset.ruangan?.lokasi,
    aset.ruangan?.gedung?.nama,
    aset.ruangan?.lantai?.nama,
    aset.gudang?.lokasi,
    aset.gudang?.nama,
  ];

  const lokasi = values
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    )
    .map((value) => String(value).trim());

  return [...new Set(lokasi)].join(" • ") || "-";
}

function getStatusStyle(status) {
  const value = String(status || "").toLowerCase();

  if (value === "selesai") {
    return {
      label: "Selesai",
      className:
        "theme-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
    };
  }

  if (value === "diproses") {
    return {
      label: "Diproses",
      className:
        "theme-warning bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
    };
  }

  if (value === "ditolak") {
    return {
      label: "Ditolak",
      className:
        "theme-danger bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)]",
    };
  }

  return {
    label: status || "Menunggu",
    className:
      "theme-text-secondary bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] border-[var(--color-border)]",
  };
}

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] disabled:opacity-60";

const labelClass =
  "mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

export default function EditLaporanKerusakanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [asetList, setAsetList] = useState([]);
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    asetId: "",
    tanggalLaporan: "",
    deskripsi: "",
  });

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [laporanRes, asetRes] = await Promise.all([
        getLaporanKerusakanById(id),
        getAset(),
      ]);

      const laporanData = extractObject(laporanRes);
      const daftarAset = extractList(asetRes);

      if (!laporanData?.id) {
        throw new Error("Data laporan kerusakan tidak ditemukan.");
      }

      setLaporan(laporanData);
      setAsetList(daftarAset);

      setForm({
        asetId: laporanData.asetId || laporanData.aset?.id || "",
        tanggalLaporan: formatDateInput(laporanData.tanggalLaporan),
        deskripsi: laporanData.deskripsi || "",
      });
    } catch (err) {
      setError(
        err?.message || "Gagal mengambil data laporan kerusakan."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      setError("Aset wajib dipilih.");
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

      await updateLaporanKerusakan(id, payload);

      setSuccess("Laporan kerusakan berhasil diperbarui.");

      setTimeout(() => {
        router.push(`/guru/sarpras/${id}`);
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err?.message || "Gagal memperbarui laporan kerusakan."
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

  const asetLaporan = laporan?.aset || null;

  const asetInformasi = asetTerpilih || asetLaporan;
  const statusInfo = getStatusStyle(laporan?.status);

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
                    href={`/guru/sarpras/${id}`}
                    className="theme-card theme-border theme-text rounded-xl border p-2.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                  >
                    <ArrowLeft size={19} />
                  </Link>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                      Sarana &amp; Prasarana
                    </p>

                    <h1 className="theme-text mt-1 text-2xl font-bold">
                      Edit Laporan Kerusakan
                    </h1>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Perbarui informasi laporan kerusakan aset.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={loadData}
                    disabled={loading || loadingSubmit}
                    className="theme-card theme-border theme-text inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                  >
                    <RefreshCw
                      size={15}
                      className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>

                  {laporan && (
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusInfo.className}`}
                    >
                      Status: {statusInfo.label}
                    </span>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="theme-card theme-border flex min-h-[350px] flex-col items-center justify-center rounded-2xl border">
                  <Loader2
                    size={35}
                    className="theme-primary animate-spin"
                  />

                  <p className="theme-text-secondary mt-3 text-sm">
                    Memuat data laporan...
                  </p>
                </div>
              ) : error && !laporan ? (
                <div className="theme-card theme-border rounded-2xl border p-6 text-center">
                  <AlertCircle
                    size={32}
                    className="theme-danger mx-auto"
                  />

                  <p className="theme-danger mt-3 text-sm">{error}</p>

                  <button
                    type="button"
                    onClick={loadData}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <RefreshCw size={16} />
                    Coba Lagi
                  </button>
                </div>
              ) : (
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
                          <Package
                            size={20}
                            className="theme-primary"
                          />
                        </div>

                        <div>
                          <h2 className="theme-text font-semibold">
                            Informasi Laporan
                          </h2>

                          <p className="theme-text-secondary text-xs">
                            Perbarui informasi pengaduan kerusakan.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className={labelClass}>
                            <Package size={14} />
                            Aset yang Mengalami Kerusakan
                            <span className="theme-danger">*</span>
                          </label>

                          <select
                            name="asetId"
                            value={form.asetId}
                            onChange={handleChange}
                            disabled={loadingSubmit}
                            className={inputClass}
                            required
                          >
                            <option value="">Pilih aset</option>

                            {asetList.map((aset) => (
                              <option key={aset.id} value={aset.id}>
                                {aset.nama}
                                {aset.kode ? ` (${aset.kode})` : ""}
                              </option>
                            ))}
                          </select>

                          {asetTerpilih && (
                            <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3 text-xs sm:grid-cols-3">
                              <div className="flex items-center gap-1.5">
                                <Hash
                                  size={13}
                                  className="theme-text-muted shrink-0"
                                />

                                <span className="theme-text-secondary">
                                  Kode:
                                </span>

                                <span className="theme-text font-medium">
                                  {getDisplayValue(asetTerpilih.kode)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Tag
                                  size={13}
                                  className="theme-text-muted shrink-0"
                                />

                                <span className="theme-text-secondary">
                                  Kategori:
                                </span>

                                <span className="theme-text font-medium">
                                  {getDisplayValue(
                                    asetTerpilih.kategoriAset?.nama
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <MapPin
                                  size={13}
                                  className="theme-text-muted shrink-0"
                                />

                                <span className="theme-text-secondary">
                                  Ruangan:
                                </span>

                                <span className="theme-text font-medium">
                                  {getDisplayValue(
                                    asetTerpilih.ruangan?.nama
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelClass}>
                            <CalendarDays size={14} />
                            Tanggal Laporan
                            <span className="theme-danger">*</span>
                          </label>

                          <input
                            type="date"
                            name="tanggalLaporan"
                            value={form.tanggalLaporan}
                            onChange={handleChange}
                            disabled={loadingSubmit}
                            className={inputClass}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelClass}>
                            <FileText size={14} />
                            Deskripsi Kerusakan
                            <span className="theme-danger">*</span>
                          </label>

                          <textarea
                            name="deskripsi"
                            value={form.deskripsi}
                            onChange={handleChange}
                            rows={5}
                            maxLength={5000}
                            disabled={loadingSubmit}
                            placeholder="Jelaskan kerusakan yang terjadi..."
                            className={`${inputClass} resize-y`}
                            required
                          />

                          <p className="theme-text-muted mt-1 text-right text-xs">
                            {form.deskripsi.length}/5000 karakter
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-4">
                        <div className="flex items-start gap-3">
                          <Info
                            size={18}
                            className="theme-primary mt-0.5 shrink-0"
                          />

                          <div>
                            <p className="theme-text text-sm font-semibold">
                              Informasi Penanganan
                            </p>

                            <p className="theme-text-secondary mt-1 text-xs leading-relaxed">
                              Status laporan dan catatan perbaikan dikelola
                              oleh petugas atau admin sekolah. Pelapor hanya
                              dapat memperbarui informasi pengaduan.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
                        <Link
                          href={`/guru/sarpras/${id}`}
                          className="theme-border theme-text inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                        >
                          Batal
                        </Link>

                        <button
                          type="submit"
                          disabled={loadingSubmit || asetList.length === 0}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
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
                            : "Simpan Perubahan"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="space-y-5 xl:col-span-1">
                    <div
                      className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <Info size={16} className="theme-primary" />

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
                            {getDisplayValue(asetInformasi?.nama)}
                          </p>

                          {asetInformasi?.kode && (
                            <p className="theme-text-secondary mt-1 text-xs">
                              Kode: {asetInformasi.kode}
                            </p>
                          )}
                        </div>

                        <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                          <p className="theme-text-muted text-xs">
                            Tanggal Laporan
                          </p>

                          <p className="theme-text mt-1 text-sm font-semibold">
                            {formatDateLong(form.tanggalLaporan)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                          <p className="theme-text-muted text-xs">
                            Lokasi Aset
                          </p>

                          <p className="theme-text mt-1 flex items-start gap-2 text-sm font-semibold">
                            <MapPin
                              size={15}
                              className="theme-primary mt-0.5 shrink-0"
                            />
                            {getLokasiAset(asetInformasi)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                          <p className="theme-text-muted text-xs">
                            Status Penanganan
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <Activity
                              size={15}
                              className="theme-text-secondary"
                            />

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <p className="theme-text-muted mt-2 text-xs">
                            Status hanya dapat diubah oleh petugas/admin.
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                          <p className="theme-text-muted text-xs">
                            Gudang
                          </p>

                          <p className="theme-text mt-1 flex items-center gap-2 text-sm font-semibold">
                            <Warehouse
                              size={15}
                              className="theme-primary shrink-0"
                            />
                            {getDisplayValue(asetInformasi?.gudang?.nama)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                          <p className="theme-text-muted text-xs">
                            Kategori Aset
                          </p>

                          <p className="theme-text mt-1 flex items-center gap-2 text-sm font-semibold">
                            <Tag
                              size={15}
                              className="theme-primary shrink-0"
                            />
                            {getDisplayValue(
                              asetInformasi?.kategoriAset?.nama
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <FileText size={16} className="theme-primary" />

                        <h3 className="theme-text text-sm font-semibold">
                          Panduan
                        </h3>
                      </div>

                      <ul className="theme-text-secondary space-y-2 text-xs leading-relaxed">
                        <li className="flex gap-2">
                          <span className="theme-primary">•</span>
                          Pastikan aset yang dipilih sesuai dengan laporan
                          kerusakan.
                        </li>

                        <li className="flex gap-2">
                          <span className="theme-primary">•</span>
                          Jelaskan kerusakan secara rinci agar petugas
                          memahami permasalahan.
                        </li>

                        <li className="flex gap-2">
                          <span className="theme-primary">•</span>
                          Periksa kembali informasi sebelum menyimpan
                          perubahan.
                        </li>

                        <li className="flex gap-2">
                          <span className="theme-primary">•</span>
                          Pantau status penanganan melalui halaman detail
                          laporan.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
