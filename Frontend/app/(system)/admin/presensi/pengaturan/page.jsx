"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getHariAktif,
  updateHariAktif,
  getPengaturanPresensiSekolah,
  updatePengaturanPresensiSekolah,
} from "@/services/pengaturan.service";
import {
  Settings2,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  Info,
  Camera,
  Navigation,
  Loader2,
  Fingerprint,
  LocateFixed,
  Building2,
  MapPinned,
  CircleCheck,
  CircleX,
  CalendarDays,
  QrCode,
} from "lucide-react";

const METODE = [
  {
    value: "barcode",
    title: "Barcode / QR Code",
    description: "Presensi menggunakan pemindaian QR Code identitas siswa.",
    Icon: QrCode,
  },
  {
    value: "face",
    title: "Face Recognition",
    description: "Presensi menggunakan kamera dan verifikasi wajah.",
    Icon: Camera,
  },
  {
    value: "lokasi",
    title: "Presensi Lokasi (GPS)",
    description:
      "Presensi menggunakan koordinat perangkat dan validasi jarak dari sekolah.",
    Icon: Navigation,
  },
];

const DAFTAR_HARI = [
  { id: 1, nama: "Senin", singkat: "Sen", kerja: true },
  { id: 2, nama: "Selasa", singkat: "Sel", kerja: true },
  { id: 3, nama: "Rabu", singkat: "Rab", kerja: true },
  { id: 4, nama: "Kamis", singkat: "Kam", kerja: true },
  { id: 5, nama: "Jumat", singkat: "Jum", kerja: true },
  { id: 6, nama: "Sabtu", singkat: "Sab", kerja: false },
  { id: 0, nama: "Minggu", singkat: "Min", kerja: false },
];

function unwrapResponse(response) {
  let result = response;

  for (let i = 0; i < 5; i += 1) {
    if (
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      Object.prototype.hasOwnProperty.call(result, "data")
    ) {
      result = result.data;
    } else {
      break;
    }
  }

  return result;
}

function normalizeMethods(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function extractSettings(response) {
  const data = unwrapResponse(response);

  const source =
    data?.pengaturanPresensi ??
    data?.sekolah ??
    data?.pengaturan ??
    data;

  return {
    lintang: source?.lintang ?? "",
    bujur: source?.bujur ?? "",
    radiusAbsensi: source?.radiusAbsensi ?? "",
    metodeAbsensiAktif: normalizeMethods(
      source?.metodeAbsensiAktif ?? source?.metodeAktif
    ),
  };
}

function StatusMessage({ status }) {
  if (!status) return null;

  const success = status.type === "success";

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
      }`}
    >
      {success ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}
      <span className="leading-6">{status.message}</span>
    </div>
  );
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
      <div className="flex items-start gap-3 border-b theme-border px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-semibold theme-text">{title}</h2>
          <p className="mt-1 text-sm leading-5 theme-text-muted">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, suffix, step = "any" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold theme-text">
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="theme-input w-full rounded-lg border theme-border bg-[var(--color-surface)] px-3.5 py-3 text-sm theme-text outline-none transition placeholder:theme-text-muted focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm theme-text-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PengaturanPresensiPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const [form, setForm] = useState({
    lintang: "",
    bujur: "",
    radiusAbsensi: "",
    metodeAbsensiAktif: [],
  });

  const [original, setOriginal] = useState(null);

  const [hariAktifList, setHariAktifList] = useState([]);
  const [originalHariAktif, setOriginalHariAktif] = useState(null);
  const [hariAktifLoading, setHariAktifLoading] = useState(true);
  const [hariAktifSaving, setHariAktifSaving] = useState(false);
  const [hariAktifStatus, setHariAktifStatus] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await getPengaturanPresensiSekolah();
      const settings = extractSettings(response);

      setForm(settings);
      setOriginal(JSON.stringify(settings));
    } catch (error) {
      console.error("Gagal memuat pengaturan presensi:", error);

      setStatus({
        type: "error",
        message:
          error?.message ||
          "Pengaturan presensi gagal dimuat. Periksa endpoint dan izin akun admin.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHariAktif = useCallback(async () => {
    setHariAktifLoading(true);
    setHariAktifStatus(null);

    try {
      const response = await getHariAktif();
      const days = Array.isArray(response?.data?.hariAktif)
        ? response.data.hariAktif
        : [];

      setHariAktifList(days);
      setOriginalHariAktif(JSON.stringify(days));
    } catch (error) {
      console.error("Gagal memuat hari aktif presensi:", error);
      setHariAktifStatus({
        type: "error",
        message:
          error?.message ||
          "Pengaturan hari aktif presensi gagal dimuat dari Sistem.",
      });
      setHariAktifList([]);
      setOriginalHariAktif(null);
    } finally {
      setHariAktifLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSettings();
      loadHariAktif();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSettings, loadHariAktif]);

  const handleSaveHariAktif = async (event) => {
    if (event) event.preventDefault();
    setHariAktifStatus(null);

    if (!hariAktifList.length) {
      setHariAktifStatus({
        type: "error",
        message: "Pilih minimal satu hari aktif presensi.",
      });
      return;
    }

    setHariAktifSaving(true);

    try {
      const sortedDays = [...hariAktifList].sort((a, b) => a - b);
      const response = await updateHariAktif({
        hariAktif: sortedDays,
      });

      const savedDays = Array.isArray(response?.data?.hariAktif)
        ? response.data.hariAktif
        : sortedDays;

      setHariAktifList(savedDays);
      setOriginalHariAktif(JSON.stringify(savedDays));

      setHariAktifStatus({
        type: "success",
        message:
          response?.message ||
          "Hari aktif presensi berhasil disimpan ke Sistem.",
      });
    } catch (error) {
      console.error("Gagal menyimpan hari aktif presensi:", error);
      setHariAktifStatus({
        type: "error",
        message:
          error?.message ||
          "Gagal menyimpan hari aktif. Periksa izin akun Anda.",
      });
    } finally {
      setHariAktifSaving(false);
    }
  };

  const toggleHari = (id) => {
    setHariAktifStatus(null);
    setHariAktifList((prev) => {
      const active = prev.includes(id);
      return active
        ? prev.filter((item) => item !== id)
        : [...prev, id].sort((a, b) => a - b);
    });
  };

  const applyPresetHari = (presetDays) => {
    setHariAktifStatus(null);
    setHariAktifList([...presetDays].sort((a, b) => a - b));
  };

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const toggleMethod = (method) => {
    setForm((previous) => {
      const active = previous.metodeAbsensiAktif.includes(method);

      return {
        ...previous,
        metodeAbsensiAktif: active
          ? previous.metodeAbsensiAktif.filter((item) => item !== method)
          : [...previous.metodeAbsensiAktif, method],
      };
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus({
        type: "error",
        message: "Browser ini tidak mendukung fitur lokasi GPS.",
      });
      return;
    }

    setStatus(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          lintang: String(position.coords.latitude),
          bujur: String(position.coords.longitude),
        }));

        setStatus({
          type: "success",
          message:
            "Koordinat perangkat berhasil diambil. Pastikan posisi perangkat berada di lokasi sekolah sebelum menyimpan.",
        });
      },
      (error) => {
        const messages = {
          1: "Izin lokasi ditolak. Izinkan akses lokasi pada browser.",
          2: "Lokasi tidak tersedia. Periksa GPS atau koneksi perangkat.",
          3: "Pengambilan lokasi melewati batas waktu. Silakan coba lagi.",
        };

        setStatus({
          type: "error",
          message: messages[error.code] || "Gagal mendapatkan koordinat GPS.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setStatus(null);

    const membutuhkanGPS =
      form.metodeAbsensiAktif.includes("lokasi") ||
      form.metodeAbsensiAktif.includes("face");

    let lintang = null;
    let bujur = null;
    let radius = null;

    if (membutuhkanGPS) {
      lintang = Number(form.lintang);
      bujur = Number(form.bujur);
      radius = Number(form.radiusAbsensi);

      if (
        form.lintang === "" ||
        !Number.isFinite(lintang) ||
        lintang < -90 ||
        lintang > 90
      ) {
        setStatus({
          type: "error",
          message: "Lintang harus berupa angka antara -90 dan 90.",
        });
        return;
      }

      if (
        form.bujur === "" ||
        !Number.isFinite(bujur) ||
        bujur < -180 ||
        bujur > 180
      ) {
        setStatus({
          type: "error",
          message: "Bujur harus berupa angka antara -180 dan 180.",
        });
        return;
      }

      if (
        form.radiusAbsensi === "" ||
        !Number.isInteger(radius) ||
        radius <= 0 ||
        radius > 100000
      ) {
        setStatus({
          type: "error",
          message:
            "Radius harus berupa bilangan bulat antara 1 sampai 100.000 meter.",
        });
        return;
      }
    }

    if (!form.metodeAbsensiAktif.length) {
      setStatus({
        type: "error",
        message: "Aktifkan minimal satu metode presensi.",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        metodeAbsensiAktif: form.metodeAbsensiAktif,
        ...(membutuhkanGPS
          ? {
              lintang,
              bujur,
              radiusAbsensi: radius,
            }
          : {}),
      };

      const response = await updatePengaturanPresensiSekolah(payload);

      const refreshedResponse = await getPengaturanPresensiSekolah();
      const saved = extractSettings(refreshedResponse);

      setForm(saved);
      setOriginal(JSON.stringify(saved));

      setStatus({
        type: "success",
        message:
          response?.message || "Pengaturan presensi berhasil disimpan.",
      });
    } catch (error) {
      console.error("Gagal menyimpan pengaturan presensi:", error);

      setStatus({
        type: "error",
        message:
          error?.message ||
          "Pengaturan presensi gagal disimpan. Periksa kembali data dan izin akun.",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanged = original !== null && JSON.stringify(form) !== original;

  const hariAktifChanged =
    originalHariAktif !== null &&
    JSON.stringify([...hariAktifList].sort((a, b) => a - b)) !==
      originalHariAktif;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                  <Settings2 size={25} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                  Pengaturan Presensi
                </h1>

                <p className="mt-2 text-sm leading-6 theme-text-secondary sm:text-base">
                  Atur lokasi sekolah, jarak maksimal presensi, metode absensi,
                  dan hari operasional aktif sekolah.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  loadSettings();
                  loadHariAktif();
                }}
                disabled={loading || saving || hariAktifLoading || hariAktifSaving}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border theme-border theme-card px-4 py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading || hariAktifLoading ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>
            </div>

            {status && (
              <div className="mb-6">
                <StatusMessage status={status} />
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border theme-border theme-card">
                <Loader2 size={30} className="animate-spin text-[var(--color-primary)]" />
                <p className="mt-3 text-sm theme-text-muted">
                  Mengambil pengaturan presensi dari Sistem...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="theme-card rounded-xl border theme-border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm theme-text-muted">Latitude Sekolah</p>
                        <p className="mt-2 break-all text-lg font-semibold theme-text">
                          {form.lintang !== "" ? form.lintang : "Belum diatur"}
                        </p>
                      </div>
                      <MapPin className="theme-primary-text" size={22} />
                    </div>
                  </div>

                  <div className="theme-card rounded-xl border theme-border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm theme-text-muted">Longitude Sekolah</p>
                        <p className="mt-2 break-all text-lg font-semibold theme-text">
                          {form.bujur !== "" ? form.bujur : "Belum diatur"}
                        </p>
                      </div>
                      <MapPinned className="theme-primary-text" size={22} />
                    </div>
                  </div>

                  <div className="theme-card rounded-xl border theme-border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm theme-text-muted">Radius Maksimal</p>
                        <p className="mt-2 text-lg font-semibold theme-text">
                          {form.radiusAbsensi !== ""
                            ? `${form.radiusAbsensi} meter`
                            : "Belum diatur"}
                        </p>
                      </div>
                      <LocateFixed className="theme-primary-text" size={22} />
                    </div>
                  </div>

                  <div className="theme-card rounded-xl border theme-border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm theme-text-muted">Hari Aktif Presensi</p>
                        <p className="mt-2 text-lg font-semibold theme-text">
                          {hariAktifLoading
                            ? "Memuat..."
                            : `${hariAktifList.length} Hari / Pekan`}
                        </p>
                      </div>
                      <CalendarDays className="theme-primary-text" size={22} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
                  <div className="space-y-6 xl:col-span-2">
                    <SectionCard
                      icon={Building2}
                      title="Lokasi dan Radius Sekolah"
                      description="Koordinat ini menjadi titik referensi perhitungan jarak presensi GPS."
                    >
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field
                          label="Lintang (Latitude)"
                          value={form.lintang}
                          onChange={(value) => updateField("lintang", value)}
                          placeholder="Contoh: -6.200000"
                        />

                        <Field
                          label="Bujur (Longitude)"
                          value={form.bujur}
                          onChange={(value) => updateField("bujur", value)}
                          placeholder="Contoh: 106.816666"
                        />
                      </div>

                      <div className="mt-5">
                        <Field
                          label="Jarak Maksimal Presensi"
                          value={form.radiusAbsensi}
                          onChange={(value) =>
                            updateField("radiusAbsensi", value)
                          }
                          placeholder="Contoh: 100"
                          suffix="meter"
                          step="1"
                        />
                        <p className="mt-2 text-xs leading-5 theme-text-muted">
                          Pengguna yang berada di luar radius ini akan ditolak
                          saat melakukan presensi dengan validasi GPS.
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2.5">
                          <Info
                            size={18}
                            className="mt-0.5 shrink-0 theme-primary-text"
                          />
                          <p className="text-sm leading-6 theme-text-secondary">
                            Koordinat harus menunjuk ke lokasi sekolah. 
                            Gunakan GPS ketika berada di
                            sekolah atau masukkan koordinat sekolah secara manual.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={saving}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[var(--color-card)] px-3.5 py-2.5 text-sm font-semibold theme-primary-text transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] disabled:opacity-50"
                        >
                          <LocateFixed size={16} />
                          Ambil Koordinat
                        </button>
                      </div>
                    </SectionCard>

                    <SectionCard
                      icon={Fingerprint}
                      title="Metode Presensi Aktif"
                      description="Pilih metode yang boleh digunakan untuk mencatat kehadiran."
                    >
                      <div className="space-y-3">
                        {METODE.map(({ value, title, description, Icon }) => {
                          const active =
                            form.metodeAbsensiAktif.includes(value);

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => toggleMethod(value)}
                              disabled={saving}
                              aria-pressed={active}
                              className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
                                active
                                  ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                                  : "theme-border theme-card hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                                  active
                                    ? "bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] theme-primary-text"
                                    : "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted"
                                }`}
                              >
                                <Icon size={23} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-semibold theme-text">
                                    {title}
                                  </h3>

                                  <span
                                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                                      active
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                        : "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted"
                                    }`}
                                  >
                                    {active ? "Aktif" : "Nonaktif"}
                                  </span>
                                </div>

                                <p className="mt-1 text-sm leading-5 theme-text-muted">
                                  {description}
                                </p>

                                {value === "barcode" && active && (
                                  <p className="mt-2 text-xs leading-5 theme-primary-text">
                                    Membutuhkan QR Code identitas siswa yang sesuai dengan NISN.
                                  </p>
                                )}

                                {value === "face" && active && (
                                  <p className="mt-2 text-xs leading-5 theme-primary-text">
                                    Membutuhkan kamera, foto wajah, dan data
                                    Face ID yang telah didaftarkan.
                                  </p>
                                )}

                                {value === "lokasi" && active && (
                                  <p className="mt-2 text-xs leading-5 theme-primary-text">
                                    Membutuhkan izin GPS serta koordinat sekolah
                                    dan radius yang valid.
                                  </p>
                                )}
                              </div>

                              <div
                                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                  active
                                    ? "border-[var(--color-primary)] theme-primary"
                                    : "border-[color-mix(in_srgb,var(--color-text)_20%,transparent)] bg-[var(--color-surface)]"
                                }`}
                              >
                                {active && <CheckCircle2 size={15} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {form.metodeAbsensiAktif.length === 0 && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                          Pilih minimal satu metode presensi sebelum menyimpan.
                        </p>
                      )}
                    </SectionCard>

                    <SectionCard
                      icon={CalendarDays}
                      title="Hari Aktif Presensi Sekolah"
                      description="Tentukan hari-hari operasional dalam sepekan yang diizinkan untuk pencatatan presensi kehadiran siswa dan guru."
                    >
                      {hariAktifStatus && (
                        <div className="mb-4">
                          <StatusMessage status={hariAktifStatus} />
                        </div>
                      )}

                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold theme-text-muted">
                          Pilihan Cepat:
                        </span>
                        <button
                          type="button"
                          onClick={() => applyPresetHari([1, 2, 3, 4, 5])}
                          disabled={hariAktifSaving || hariAktifLoading}
                          className="rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-2.5 py-1 text-xs font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                        >
                          5 Hari (Senin - Jumat)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetHari([1, 2, 3, 4, 5, 6])}
                          disabled={hariAktifSaving || hariAktifLoading}
                          className="rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-2.5 py-1 text-xs font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                        >
                          6 Hari (Senin - Sabtu)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetHari([0, 1, 2, 3, 4, 5, 6])}
                          disabled={hariAktifSaving || hariAktifLoading}
                          className="rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-2.5 py-1 text-xs font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                        >
                          Semua Hari (7 Hari)
                        </button>
                      </div>

                      {hariAktifLoading ? (
                        <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-6">
                          <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
                          <p className="mt-2 text-xs theme-text-muted">
                            Mengambil data hari aktif dari server...
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {DAFTAR_HARI.map(({ id, nama, singkat }) => {
                            const active = hariAktifList.includes(id);

                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => toggleHari(id)}
                                disabled={hariAktifSaving}
                                aria-pressed={active}
                                className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition ${
                                  active
                                    ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                                    : "theme-border theme-card hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                                      active
                                        ? "theme-primary"
                                        : "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted"
                                    }`}
                                  >
                                    {singkat}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold theme-text">
                                      {nama}
                                    </p>
                                    <span
                                      className={`text-[11px] font-medium ${
                                        active
                                          ? "text-emerald-700 dark:text-emerald-400"
                                          : "theme-text-muted"
                                      }`}
                                    >
                                      {active ? "Hari Aktif" : "Libur"}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                    active
                                      ? "border-[var(--color-primary)] theme-primary"
                                      : "border-[color-mix(in_srgb,var(--color-text)_20%,transparent)] bg-[var(--color-surface)]"
                                  }`}
                                >
                                  {active && <CheckCircle2 size={15} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {hariAktifList.length === 0 && !hariAktifLoading && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                          Pilih minimal satu hari aktif presensi sebelum menyimpan.
                        </p>
                      )}

                      <div className="mt-5 flex flex-col-reverse gap-3 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (originalHariAktif) {
                              setHariAktifList(JSON.parse(originalHariAktif));
                              setHariAktifStatus(null);
                            }
                          }}
                          disabled={hariAktifSaving || !hariAktifChanged || !originalHariAktif}
                          className="rounded-lg border theme-border theme-card px-4 py-2 text-xs font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Batalkan Perubahan Hari
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveHariAktif}
                          disabled={hariAktifSaving || !hariAktifChanged || hariAktifList.length === 0}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {hariAktifSaving ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Save size={15} />
                          )}
                          {hariAktifSaving ? "Menyimpan Hari..." : "Simpan Hari Aktif"}
                        </button>
                      </div>
                    </SectionCard>

                    <div className="flex flex-col-reverse gap-3 rounded-xl border theme-border theme-card p-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (original) {
                            setForm(JSON.parse(original));
                            setStatus(null);
                          }
                        }}
                        disabled={saving || !hasChanged || !original}
                        className="rounded-lg border theme-border px-4 py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Batalkan Perubahan
                      </button>

                      <button
                        type="submit"
                        disabled={saving || !hasChanged}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}
                        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                      </button>
                    </div>
                  </div>

                  <aside className="space-y-6">
                    <div className="theme-card rounded-xl border theme-border p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <CalendarDays size={21} />
                      </div>

                      <h2 className="mt-4 text-base font-semibold theme-text">
                        Status Hari Aktif
                      </h2>

                      <p className="mt-2 text-sm leading-6 theme-text-muted">
                        Presensi hanya dapat dilakukan pada hari-hari yang diaktifkan di bawah ini.
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="theme-text-muted">Total Hari:</span>
                          <span className="font-semibold theme-text">
                            {hariAktifLoading
                              ? "Memuat..."
                              : `${hariAktifList.length} dari 7 hari`}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {DAFTAR_HARI.map(({ id, singkat }) => {
                            const active = hariAktifList.includes(id);
                            return (
                              <span
                                key={id}
                                className={`rounded-md px-2 py-1 text-xs font-medium ${
                                  active
                                    ? "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-semibold theme-primary-text"
                                    : "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted"
                                }`}
                              >
                                {singkat}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="theme-card rounded-xl border theme-border p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <ShieldCheck size={21} />
                      </div>

                      <h2 className="mt-4 text-base font-semibold theme-text">
                        Integrasi Presensi
                      </h2>

                      <p className="mt-2 text-sm leading-6 theme-text-muted">
                        Pengaturan lokasi, radius, dan metode dikirim melalui
                        endpoint pengaturan presensi Sistem.
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-2.5 text-sm theme-text-secondary">
                          <CircleCheck
                            size={17}
                            className="mt-0.5 shrink-0 theme-primary-text"
                          />
                          <span>Koordinat sekolah dapat diedit.</span>
                        </div>

                        <div className="flex items-start gap-2.5 text-sm theme-text-secondary">
                          <CircleCheck
                            size={17}
                            className="mt-0.5 shrink-0 theme-primary-text"
                          />
                          <span>Radius maksimal dapat diubah.</span>
                        </div>

                        <div className="flex items-start gap-2.5 text-sm theme-text-secondary">
                          <CircleCheck
                            size={17}
                            className="mt-0.5 shrink-0 theme-primary-text"
                          />
                          <span>Metode Barcode, Face, dan GPS dapat dipilih.</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
                      <div className="flex items-center gap-2">
                        <Info size={19} className="theme-primary-text" />
                        <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                          Catatan Validasi
                        </h2>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-amber-900 dark:text-amber-200">
                        Face Recognition tetap memerlukan kamera dan verifikasi
                        wajah. Jika metode face diaktifkan, Sistem juga
                        memerlukan koordinat GPS sesuai implementasi validasi
                        absensi saat ini.
                      </p>

                      <p className="mt-3 text-sm leading-6 text-amber-900 dark:text-amber-200">
                        Pastikan metode yang diaktifkan sesuai dengan metode
                        yang dikirim oleh halaman presensi siswa dan guru.
                      </p>
                    </div>

                    <div className="theme-card rounded-xl border theme-border p-5">
                      <h2 className="text-sm font-semibold theme-text">
                        Status Metode
                      </h2>

                      <div className="mt-4 space-y-3">
                        {METODE.map(({ value, title, Icon }) => {
                          const active =
                            form.metodeAbsensiAktif.includes(value);

                          return (
                            <div
                              key={value}
                              className="flex items-center gap-3"
                            >
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-secondary">
                                <Icon size={18} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium theme-text">
                                  {title}
                                </p>
                              </div>

                              {active ? (
                                <CheckCircle2
                                  size={18}
                                  className="theme-primary-text"
                                />
                              ) : (
                                <CircleX
                                  size={18}
                                  className="opacity-30 theme-text-muted"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </aside>
                </div>
              </form>
            )}

            <footer className="mt-8 border-t theme-border py-5 text-center text-xs theme-text-muted">
              SmartSchool · Pengaturan Presensi
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}