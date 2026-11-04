"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { getHariAktif, updateHariAktif } from "@/services/pengaturan.service";
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
} from "lucide-react";

const ENDPOINT = "/api/sekolah/pengaturan-presensi";
const METODE = [
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
      // Backend juga mungkin mengirim string biasa.
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

  // Mendukung respons berupa objek sekolah maupun objek konfigurasi.
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
      source?.metodeAbsensiAktif ?? source?.metodeAktif,
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
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
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
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
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
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
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

  // State khusus Hari Aktif Presensi (GET/PUT /api/pengaturan/hari-aktif)
  const [hariAktifList, setHariAktifList] = useState([]);
  const [originalHariAktif, setOriginalHariAktif] = useState(null);
  const [hariAktifLoading, setHariAktifLoading] = useState(true);
  const [hariAktifSaving, setHariAktifSaving] = useState(false);
  const [hariAktifStatus, setHariAktifStatus] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await apiFetch(ENDPOINT, {
        method: "GET",
      });

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
          "Pengaturan hari aktif presensi gagal dimuat dari backend.",
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
          "Hari aktif presensi berhasil disimpan ke Backend.",
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
      },
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setStatus(null);

    const lintang = Number(form.lintang);
    const bujur = Number(form.bujur);
    const radius = Number(form.radiusAbsensi);

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
      !Number.isFinite(radius) ||
      !Number.isInteger(radius) ||
      radius <= 0
    ) {
      setStatus({
        type: "error",
        message: "Radius maksimal harus berupa bilangan bulat lebih besar dari 0 meter.",
      });
      return;
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
        lintang,
        bujur,
        radiusAbsensi: radius,
        metodeAbsensiAktif: form.metodeAbsensiAktif,
      };

      const response = await apiFetch(ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Muat ulang dari Backend agar nilai yang ditampilkan sesuai
      // dengan data yang benar-benar tersimpan.
      const refreshedResponse = await apiFetch(ENDPOINT, {
        method: "GET",
      });

      const saved = extractSettings(refreshedResponse);

      setForm(saved);
      setOriginal(JSON.stringify(saved));

      setStatus({
        type: "success",
        message:
          unwrapResponse(response)?.message ||
          "Pengaturan presensi berhasil disimpan dan dimuat ulang dari Backend.",
      });
    } catch (error) {
      console.error("Gagal menyimpan pengaturan presensi:", error);

      setStatus({
        type: "error",
        message:
          error?.message ||
          "Pengaturan gagal disimpan. Pastikan Backend menerima format data yang dikirim.",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanged =
    original !== null && JSON.stringify(form) !== original;

  const hariAktifChanged =
    originalHariAktif !== null &&
    JSON.stringify([...hariAktifList].sort((a, b) => a - b)) !==
      originalHariAktif;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Settings2 size={25} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Pengaturan Presensi
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Atur lokasi sekolah, jarak maksimal presensi, metode
                  absensi, dan hari operasional aktif sekolah.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  loadSettings();
                  loadHariAktif();
                }}
                disabled={loading || saving || hariAktifLoading || hariAktifSaving}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
                <Loader2 size={30} className="animate-spin text-blue-600" />
                <p className="mt-3 text-sm text-slate-500">
                  Mengambil pengaturan presensi dari Backend...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">Latitude Sekolah</p>
                        <p className="mt-2 break-all text-lg font-semibold text-slate-900">
                          {form.lintang !== "" ? form.lintang : "Belum diatur"}
                        </p>
                      </div>
                      <MapPin className="text-blue-600" size={22} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">Longitude Sekolah</p>
                        <p className="mt-2 break-all text-lg font-semibold text-slate-900">
                          {form.bujur !== "" ? form.bujur : "Belum diatur"}
                        </p>
                      </div>
                      <MapPinned className="text-indigo-600" size={22} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">Radius Maksimal</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {form.radiusAbsensi !== ""
                            ? `${form.radiusAbsensi} meter`
                            : "Belum diatur"}
                        </p>
                      </div>
                      <LocateFixed className="text-emerald-600" size={22} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">Hari Aktif Presensi</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {hariAktifLoading
                            ? "Memuat..."
                            : `${hariAktifList.length} Hari / Pekan`}
                        </p>
                      </div>
                      <CalendarDays className="text-amber-600" size={22} />
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
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Pengguna yang berada di luar radius ini akan ditolak
                          saat melakukan presensi dengan validasi GPS.
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2.5">
                          <Info
                            size={18}
                            className="mt-0.5 shrink-0 text-blue-700"
                          />
                          <p className="text-sm leading-6 text-blue-900">
                            Koordinat harus menunjuk ke lokasi sekolah, bukan
                            lokasi rumah admin. Gunakan GPS ketika berada di
                            sekolah atau masukkan koordinat sekolah secara manual.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={saving}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
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
                                  ? "border-blue-300 bg-blue-50/70"
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                                  active
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <Icon size={23} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-semibold text-slate-900">
                                    {title}
                                  </h3>

                                  <span
                                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                                      active
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {active ? "Aktif" : "Nonaktif"}
                                  </span>
                                </div>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                  {description}
                                </p>

                                {value === "face" && active && (
                                  <p className="mt-2 text-xs leading-5 text-blue-700">
                                    Membutuhkan kamera, foto wajah, dan data
                                    Face ID yang telah didaftarkan.
                                  </p>
                                )}

                                {value === "lokasi" && active && (
                                  <p className="mt-2 text-xs leading-5 text-blue-700">
                                    Membutuhkan izin GPS serta koordinat sekolah
                                    dan radius yang valid.
                                  </p>
                                )}
                              </div>

                              <div
                                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                  active
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {active && <CheckCircle2 size={15} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {form.metodeAbsensiAktif.length === 0 && (
                        <p className="mt-3 text-sm text-red-600">
                          Pilih minimal satu metode presensi sebelum menyimpan.
                        </p>
                      )}
                    </SectionCard>

                    {/* Section Card Hari Aktif Presensi (GET / PUT /api/pengaturan/hari-aktif) */}
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

                      {/* Presets */}
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          Pilihan Cepat:
                        </span>
                        <button
                          type="button"
                          onClick={() => applyPresetHari([1, 2, 3, 4, 5])}
                          disabled={hariAktifSaving || hariAktifLoading}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          5 Hari (Senin - Jumat)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetHari([1, 2, 3, 4, 5, 6])}
                          disabled={hariAktifSaving || hariAktifLoading}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          6 Hari (Senin - Sabtu)
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetHari([0, 1, 2, 3, 4, 5, 6])}
                          disabled={hariAktifSaving || hariAktifLoading}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          Semua Hari (7 Hari)
                        </button>
                      </div>

                      {hariAktifLoading ? (
                        <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
                          <Loader2 size={24} className="animate-spin text-blue-600" />
                          <p className="mt-2 text-xs text-slate-500">
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
                                    ? "border-blue-400 bg-blue-50/70"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                                      active
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {singkat}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {nama}
                                    </p>
                                    <span
                                      className={`text-[11px] font-medium ${
                                        active
                                          ? "text-emerald-700"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      {active ? "Hari Aktif" : "Libur"}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                    active
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-300 bg-white"
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
                        <p className="mt-3 text-sm text-red-600">
                          Pilih minimal satu hari aktif presensi sebelum menyimpan.
                        </p>
                      )}

                      {/* Footer Actions for Hari Aktif */}
                      <div className="mt-5 flex flex-col-reverse gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (originalHariAktif) {
                              setHariAktifList(JSON.parse(originalHariAktif));
                              setHariAktifStatus(null);
                            }
                          }}
                          disabled={hariAktifSaving || !hariAktifChanged || !originalHariAktif}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Batalkan Perubahan Hari
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveHariAktif}
                          disabled={hariAktifSaving || !hariAktifChanged || hariAktifList.length === 0}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
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

                    <div className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (original) {
                            setForm(JSON.parse(original));
                            setStatus(null);
                          }
                        }}
                        disabled={saving || !hasChanged || !original}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Batalkan Perubahan
                      </button>

                      <button
                        type="submit"
                        disabled={saving || !hasChanged}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                        <CalendarDays size={21} />
                      </div>

                      <h2 className="mt-4 text-base font-semibold text-slate-900">
                        Status Hari Aktif
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Presensi hanya dapat dilakukan pada hari-hari yang diaktifkan di bawah ini.
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Total Hari:</span>
                          <span className="font-semibold text-slate-900">
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
                                    ? "bg-blue-100 font-semibold text-blue-700"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {singkat}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <ShieldCheck size={21} />
                      </div>

                      <h2 className="mt-4 text-base font-semibold text-slate-900">
                        Integrasi Presensi
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Pengaturan lokasi, radius, dan metode dikirim melalui
                        endpoint pengaturan presensi Backend.
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CircleCheck
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <span>Koordinat sekolah dapat diedit.</span>
                        </div>

                        <div className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CircleCheck
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <span>Radius maksimal dapat diubah.</span>
                        </div>

                        <div className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CircleCheck
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <span>Face Recognition dan GPS dapat dipilih.</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                      <div className="flex items-center gap-2">
                        <Info size={19} className="text-amber-700" />
                        <h2 className="text-sm font-semibold text-amber-900">
                          Catatan Validasi
                        </h2>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-amber-900">
                        Face Recognition tetap memerlukan kamera dan verifikasi
                        wajah. Jika metode face diaktifkan, Backend juga
                        memerlukan koordinat GPS sesuai implementasi validasi
                        absensi saat ini.
                      </p>

                      <p className="mt-3 text-sm leading-6 text-amber-900">
                        Pastikan metode yang diaktifkan sesuai dengan metode
                        yang dikirim oleh halaman presensi siswa dan guru.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h2 className="text-sm font-semibold text-slate-900">
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
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Icon size={18} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800">
                                  {title}
                                </p>
                              </div>

                              {active ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-emerald-600"
                                />
                              ) : (
                                <CircleX
                                  size={18}
                                  className="text-slate-300"
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

            <footer className="mt-8 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
              SmartSchool · Pengaturan Presensi
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}