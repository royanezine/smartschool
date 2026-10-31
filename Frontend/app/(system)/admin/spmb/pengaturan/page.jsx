"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Save,
  Settings2,
  Sliders,
  Users,
} from "lucide-react";

import {
  getPengaturanSpmb,
  updatePengaturanSpmb,
} from "@/services/ppdb.service";

const themePrimaryText = "text-[var(--color-primary)]";
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const DEFAULT_FORM = {
  pendaftaranDibuka: true,
  wajibLokasi: false,
  batasiPendaftarSesuaiKuota: false,
  rankingTerbuka: false,
  kirimEmailKonfirmasi: false,
  lintangSekolah: "",
  bujurSekolah: "",
};

export default function PengaturanSpmbPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPengaturan = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await getPengaturanSpmb();
      const data = response?.data;

      setForm({
        pendaftaranDibuka: Boolean(data?.pendaftaranDibuka),
        wajibLokasi: Boolean(data?.wajibLokasi),
        batasiPendaftarSesuaiKuota: Boolean(data?.batasiPendaftarSesuaiKuota),
        rankingTerbuka: Boolean(data?.rankingTerbuka),
        kirimEmailKonfirmasi: Boolean(data?.kirimEmailKonfirmasi),
        lintangSekolah:
          data?.lintangSekolah !== null && data?.lintangSekolah !== undefined
            ? String(data.lintangSekolah)
            : "",
        bujurSekolah:
          data?.bujurSekolah !== null && data?.bujurSekolah !== undefined
            ? String(data.bujurSekolah)
            : "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat pengaturan SPMB dari server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPengaturan();
  }, [loadPengaturan]);

  function handleToggle(field) {
    setForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }

  function handleLocationDetect() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Browser tidak mendukung deteksi lokasi otomatis.");
      return;
    }

    setDetectingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          lintangSekolah: String(Number(position.coords.latitude.toFixed(6))),
          bujurSekolah: String(Number(position.coords.longitude.toFixed(6))),
        }));
        setDetectingLocation(false);
      },
      (err) => {
        setDetectingLocation(false);
        setError(
          `Gagal mendeteksi lokasi GPS: ${err.message || "Izin lokasi ditolak"}. Silakan masukkan koordinat secara manual.`
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Validasi koordinat sekolah: jika salah satu diisi, keduanya harus diisi bersamaan
    const latStr = String(form.lintangSekolah || "").trim();
    const lngStr = String(form.bujurSekolah || "").trim();

    if ((latStr && !lngStr) || (!latStr && lngStr)) {
      setError("Lintang dan bujur sekolah harus diisi bersamaan.");
      return;
    }

    let lintangVal = null;
    let bujurVal = null;

    if (latStr && lngStr) {
      lintangVal = Number(latStr);
      bujurVal = Number(lngStr);

      if (Number.isNaN(lintangVal) || lintangVal < -90 || lintangVal > 90) {
        setError("Lintang (Latitude) sekolah harus berupa angka antara -90 dan 90.");
        return;
      }

      if (Number.isNaN(bujurVal) || bujurVal < -180 || bujurVal > 180) {
        setError("Bujur (Longitude) sekolah harus berupa angka antara -180 dan 180.");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        pendaftaranDibuka: form.pendaftaranDibuka,
        wajibLokasi: form.wajibLokasi,
        batasiPendaftarSesuaiKuota: form.batasiPendaftarSesuaiKuota,
        rankingTerbuka: form.rankingTerbuka,
        kirimEmailKonfirmasi: form.kirimEmailKonfirmasi,
      };

      if (lintangVal !== null && bujurVal !== null) {
        payload.lintangSekolah = lintangVal;
        payload.bujurSekolah = bujurVal;
      }

      const response = await updatePengaturanSpmb(payload);
      const data = response?.data;

      if (data) {
        setForm({
          pendaftaranDibuka: Boolean(data.pendaftaranDibuka),
          wajibLokasi: Boolean(data.wajibLokasi),
          batasiPendaftarSesuaiKuota: Boolean(data.batasiPendaftarSesuaiKuota),
          rankingTerbuka: Boolean(data.rankingTerbuka),
          kirimEmailKonfirmasi: Boolean(data.kirimEmailKonfirmasi),
          lintangSekolah:
            data.lintangSekolah !== null && data.lintangSekolah !== undefined
              ? String(data.lintangSekolah)
              : "",
          bujurSekolah:
            data.bujurSekolah !== null && data.bujurSekolah !== undefined
              ? String(data.bujurSekolah)
              : "",
        });
      }

      setSuccess("Pengaturan SPMB berhasil disimpan ke server.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan SPMB."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((value) => !value)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/admin/spmb")}
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={15} />
              Kembali ke SPMB
            </button>

            <div className="mb-6 flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
              >
                <Settings2 size={21} />
              </div>

              <div>
                <h1 className="theme-text text-xl font-bold sm:text-2xl">
                  Pengaturan SPMB
                </h1>
                <p className="theme-text-secondary mt-1 text-sm leading-6">
                  Konfigurasi aturan seleksi, status penerimaan, validasi kuota, koordinat sekolah, dan notifikasi calon peserta didik.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <p className="text-xs text-[var(--color-danger)]">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-4 py-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />
                <p className="text-xs text-[var(--color-success)]">{success}</p>
              </div>
            )}

            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border theme-border theme-card">
                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
                  <span>Memuat pengaturan dari server...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bagian 1: Status dan Aturan SPMB */}
                <div className="rounded-2xl border theme-border theme-card p-5 sm:p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2.5 border-b theme-border pb-3">
                    <Sliders size={18} className="text-[var(--color-primary)]" />
                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Status & Kebijakan Seleksi
                      </h2>
                      <p className="text-xs theme-text-muted">
                        Kontrol utama pembukaan pendaftaran dan aturan seleksi penerimaan
                      </p>
                    </div>
                  </div>

                  <div className="divide-y theme-border">
                    {/* pendaftaranDibuka */}
                    <div className="flex items-center justify-between py-4">
                      <div className="max-w-[75%]">
                        <label
                          htmlFor="toggle-pendaftaranDibuka"
                          className="text-xs font-semibold theme-text block cursor-pointer"
                        >
                          Pendaftaran PPDB Dibuka
                        </label>
                        <p className="mt-0.5 text-xs theme-text-muted leading-relaxed">
                          Izinkan calon peserta didik mengakses form registrasi online publik untuk sekolah ini.
                        </p>
                      </div>
                      <input
                        id="toggle-pendaftaranDibuka"
                        type="checkbox"
                        checked={form.pendaftaranDibuka}
                        onChange={() => handleToggle("pendaftaranDibuka")}
                        className="h-5 w-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                    </div>

                    {/* wajibLokasi */}
                    <div className="flex items-center justify-between py-4">
                      <div className="max-w-[75%]">
                        <label
                          htmlFor="toggle-wajibLokasi"
                          className="text-xs font-semibold theme-text block cursor-pointer"
                        >
                          Wajibkan Lokasi / Koordinat Peserta
                        </label>
                        <p className="mt-0.5 text-xs theme-text-muted leading-relaxed">
                          Mengharuskan calon siswa mencantumkan titik koordinat tempat tinggal (lintang dan bujur) untuk seluruh jalur seleksi.
                        </p>
                      </div>
                      <input
                        id="toggle-wajibLokasi"
                        type="checkbox"
                        checked={form.wajibLokasi}
                        onChange={() => handleToggle("wajibLokasi")}
                        className="h-5 w-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                    </div>

                    {/* batasiPendaftarSesuaiKuota */}
                    <div className="flex items-center justify-between py-4">
                      <div className="max-w-[75%]">
                        <label
                          htmlFor="toggle-batasiPendaftarSesuaiKuota"
                          className="text-xs font-semibold theme-text block cursor-pointer"
                        >
                          Batasi Pendaftar Sesuai Kuota
                        </label>
                        <p className="mt-0.5 text-xs theme-text-muted leading-relaxed">
                          Otomatis menolak pendaftar baru jika total calon siswa yang mendaftar pada jalur terkait telah mencapai kapasitas kuota.
                        </p>
                      </div>
                      <input
                        id="toggle-batasiPendaftarSesuaiKuota"
                        type="checkbox"
                        checked={form.batasiPendaftarSesuaiKuota}
                        onChange={() => handleToggle("batasiPendaftarSesuaiKuota")}
                        className="h-5 w-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                    </div>

                    {/* rankingTerbuka */}
                    <div className="flex items-center justify-between py-4">
                      <div className="max-w-[75%]">
                        <label
                          htmlFor="toggle-rankingTerbuka"
                          className="text-xs font-semibold theme-text block cursor-pointer"
                        >
                          Publikasi Ranking Terbuka
                        </label>
                        <p className="mt-0.5 text-xs theme-text-muted leading-relaxed">
                          Memungkinkan calon siswa dan masyarakat umum melihat posisi pemeringkatan sementara secara transparan.
                        </p>
                      </div>
                      <input
                        id="toggle-rankingTerbuka"
                        type="checkbox"
                        checked={form.rankingTerbuka}
                        onChange={() => handleToggle("rankingTerbuka")}
                        className="h-5 w-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                    </div>

                    {/* kirimEmailKonfirmasi */}
                    <div className="flex items-center justify-between py-4">
                      <div className="max-w-[75%]">
                        <label
                          htmlFor="toggle-kirimEmailKonfirmasi"
                          className="text-xs font-semibold theme-text block cursor-pointer"
                        >
                          Kirim Email Konfirmasi Pendaftaran
                        </label>
                        <p className="mt-0.5 text-xs theme-text-muted leading-relaxed">
                          Kirimkan email otomatis berisi tanda bukti nomor registrasi dan instruksi langkah berikutnya ke alamat email pendaftar.
                        </p>
                      </div>
                      <input
                        id="toggle-kirimEmailKonfirmasi"
                        type="checkbox"
                        checked={form.kirimEmailKonfirmasi}
                        onChange={() => handleToggle("kirimEmailKonfirmasi")}
                        className="h-5 w-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Titik Koordinat Lokasi Sekolah */}
                <div className="rounded-2xl border theme-border theme-card p-5 sm:p-6 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b theme-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <MapPin size={18} className="text-[var(--color-primary)]" />
                      <div>
                        <h2 className="text-sm font-semibold theme-text">
                          Koordinat Lokasi Sekolah
                        </h2>
                        <p className="text-xs theme-text-muted">
                          Titik acuan untuk perhitungan jarak radius pada jalur zonasi
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLocationDetect}
                      disabled={detectingLocation}
                      className="inline-flex items-center gap-1.5 rounded-lg border theme-border px-3 py-1.5 text-xs font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition disabled:opacity-50"
                    >
                      {detectingLocation ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-[var(--color-primary)]" />
                          <span>Mendeteksi...</span>
                        </>
                      ) : (
                        <>
                          <Compass size={13} className="text-[var(--color-primary)]" />
                          <span>Ambil Lokasi Saat Ini</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="input-lintangSekolah"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Lintang (Latitude) Sekolah
                      </label>
                      <input
                        id="input-lintangSekolah"
                        type="number"
                        step="any"
                        min="-90"
                        max="90"
                        value={form.lintangSekolah}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            lintangSekolah: e.target.value,
                          }))
                        }
                        placeholder="-6.2088"
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none`}
                      />
                      <p className="mt-1 text-[11px] theme-text-muted">
                        Rentang nilai: -90.0 s/d 90.0
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="input-bujurSekolah"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Bujur (Longitude) Sekolah
                      </label>
                      <input
                        id="input-bujurSekolah"
                        type="number"
                        step="any"
                        min="-180"
                        max="180"
                        value={form.bujurSekolah}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            bujurSekolah: e.target.value,
                          }))
                        }
                        placeholder="106.8456"
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none`}
                      />
                      <p className="mt-1 text-[11px] theme-text-muted">
                        Rentang nilai: -180.0 s/d 180.0
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Simpan */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`${themePrimaryGradient} inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-[var(--color-card)] shadow-sm transition hover:brightness-95 disabled:opacity-50`}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Simpan Pengaturan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
