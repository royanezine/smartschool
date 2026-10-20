
"use client";

import { useCallback, useEffect, useState } from "react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";

import {
  Settings2,
  Clock3,
  CalendarDays,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  Info,
  Fingerprint,
  Loader2,
  ClipboardCheck,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

const KEYS = {
  radius: "radiusAbsensi",
};

const ENDPOINTS = {
  metodeAktif: "/api/absensi/metode-aktif",
  pengaturan: "/api/pengaturan",
};

function getData(response) {
  let result = response;

  for (let i = 0; i < 3; i += 1) {
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

function formatMetode(value) {
  if (value == null || value === "") {
    return "Belum dikonfigurasi";
  }

  const methods = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  if (!methods.length) {
    return String(value);
  }

  return methods
    .map((item) =>
      String(item)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    )
    .join(", ");
}

function getSettingValue(settings, key) {
  const item = settings.find((setting) => setting?.kunci === key);
  return item?.nilai == null ? "" : String(item.nilai);
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
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

      <span>{status.message}</span>
    </div>
  );
}

export default function PengaturanPresensiPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [metodeAktif, setMetodeAktif] = useState(null);
  const [settings, setSettings] = useState([]);
  const [radius, setRadius] = useState("");
  const [originalRadius, setOriginalRadius] = useState("");
  const [status, setStatus] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setStatus(null);

    try {
      const [metodeResponse, settingsResponse] = await Promise.all([
        apiFetch(ENDPOINTS.metodeAktif),
        apiFetch(ENDPOINTS.pengaturan),
      ]);

      const metodeData = getData(metodeResponse);
      const settingsData = getData(settingsResponse);

      const metode =
        metodeData?.metodeAktif ??
        metodeData?.data?.metodeAktif ??
        null;

      const list = Array.isArray(settingsData)
        ? settingsData
        : Array.isArray(settingsData?.data)
          ? settingsData.data
          : Array.isArray(settingsData?.items)
            ? settingsData.items
            : [];

      setMetodeAktif(metode);
      setSettings(list);

      const savedRadius = getSettingValue(list, KEYS.radius);

      setRadius(savedRadius);
      setOriginalRadius(savedRadius);
    } catch (error) {
      console.error("Gagal mengambil pengaturan presensi:", error);

      setStatus({
        type: "error",
        message:
          error?.message ||
          "Pengaturan gagal dimuat. Periksa URL API, koneksi Backend, dan izin akun.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveRadius = async (event) => {
    event.preventDefault();
    setStatus(null);

    const parsedRadius = Number(radius);

    if (
      !radius.trim() ||
      !Number.isFinite(parsedRadius) ||
      parsedRadius <= 0
    ) {
      setStatus({
        type: "error",
        message: "Masukkan radius berupa angka yang lebih besar dari 0.",
      });
      return;
    }

    if (!Number.isInteger(parsedRadius)) {
      setStatus({
        type: "error",
        message: "Radius harus berupa bilangan bulat dalam satuan meter.",
      });
      return;
    }

    setSaving(true);

    try {
      await apiFetch(ENDPOINTS.pengaturan, {
        method: "POST",
        body: JSON.stringify({
          kunci: KEYS.radius,
          nilai: String(parsedRadius),
          tipeData: "number",
          kelompok: "presensi",
          keterangan: "Radius lokasi presensi dalam meter",
        }),
      });

      const savedValue = String(parsedRadius);

      setOriginalRadius(savedValue);
      setRadius(savedValue);

      setSettings((previous) => {
        const exists = previous.some(
          (item) => item.kunci === KEYS.radius,
        );

        if (exists) {
          return previous.map((item) =>
            item.kunci === KEYS.radius
              ? { ...item, nilai: savedValue }
              : item,
          );
        }

        return [
          ...previous,
          {
            kunci: KEYS.radius,
            nilai: savedValue,
            tipeData: "number",
            kelompok: "presensi",
            keterangan: "Radius lokasi presensi dalam meter",
          },
        ];
      });

      setStatus({
        type: "success",
        message:
          "Nilai radius berhasil disimpan ke pengaturan sistem. Nilai ini belum mengubah radius validasi GPS karena Backend membaca radius dari data sekolah.",
      });
    } catch (error) {
      console.error("Gagal menyimpan radius presensi:", error);

      setStatus({
        type: "error",
        message:
          error?.message ||
          "Pengaturan gagal disimpan. Silakan coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasRadiusChanged = radius !== originalRadius;

  const hasMetode =
    metodeAktif != null &&
    metodeAktif !== "" &&
    (!Array.isArray(metodeAktif) || metodeAktif.length > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
              <span>Pengaturan</span>
              <ChevronRight size={15} />
              <span className="font-medium text-slate-800">
                Presensi
              </span>
            </div>

            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <Settings2 size={25} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Pengaturan Presensi
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Lihat metode presensi aktif dan kelola konfigurasi
                  tambahan yang tersimpan pada sistem sekolah.
                </p>
              </div>

              <button
                type="button"
                onClick={loadSettings}
                disabled={loading || saving}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
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
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <Loader2 size={30} className="animate-spin text-blue-600" />
                <p className="mt-3 text-sm text-slate-500">
                  Mengambil konfigurasi dari Backend...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
                  <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Metode Presensi
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {hasMetode ? "Data tersedia" : "Belum tersedia"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Konfigurasi sekolah dari Backend
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Fingerprint size={23} />
                      </div>
                    </div>
                  </div>

                  <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Konfigurasi Tambahan
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {settings.length} pengaturan
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Data pengaturan sistem
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                        <SlidersHorizontal size={23} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
                  <div className="space-y-6 xl:col-span-2">
                    <SectionCard
                      icon={ClipboardCheck}
                      title="Metode Presensi Aktif"
                      description="Metode yang dikembalikan Backend melalui endpoint absensi."
                    >
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                            <Fingerprint size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              Konfigurasi metode sekolah
                            </p>
                            <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                              {formatMetode(metodeAktif)}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                            {hasMetode ? "Tersedia" : "Kosong"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-start gap-2.5 text-sm leading-6 text-slate-500">
                        <Info
                          size={17}
                          className="mt-0.5 shrink-0 text-blue-600"
                        />
                        <p>
                          Endpoint{" "}
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                            GET /api/absensi/metode-aktif
                          </code>{" "}
                          digunakan untuk membaca metode presensi yang
                          tersimpan pada data sekolah. Backend yang tersedia
                          belum menyediakan endpoint untuk mengubah daftar
                          metode melalui halaman ini.
                        </p>
                      </div>
                    </SectionCard>

                    <SectionCard
                      icon={MapPin}
                      title="Konfigurasi Radius Presensi"
                      description="Menyimpan nilai radius sebagai pengaturan tambahan sistem. Nilai validasi GPS tetap mengikuti konfigurasi pada data sekolah."
                    >
                      <form onSubmit={handleSaveRadius} className="space-y-5">
                        <div>
                          <label
                            htmlFor="radius"
                            className="mb-2 block text-sm font-semibold text-slate-800"
                          >
                            Radius lokasi (meter)
                          </label>

                          <div className="relative">
                            <input
                              id="radius"
                              name="radius"
                              type="number"
                              min="1"
                              step="1"
                              value={radius}
                              onChange={(event) =>
                                setRadius(event.target.value)
                              }
                              placeholder="Contoh: 100"
                              disabled={saving}
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                            />

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                              meter
                            </span>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Kunci konfigurasi:{" "}
                            <code className="rounded bg-slate-100 px-1">
                              radiusAbsensi
                            </code>
                          </p>
                        </div>

                        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm leading-6 text-amber-900">
                          <AlertCircle size={18} className="mt-0.5 shrink-0" />
                          <p>
                            Nilai ini disimpan pada tabel{" "}
                            <code>pengaturanSistem</code>. Sementara itu,
                            validasi GPS pada Backend membaca{" "}
                            <code>sekolah.radiusAbsensi</code>. Karena itu,
                            perubahan di halaman ini belum mengubah radius
                            validasi presensi.
                          </p>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={() => setRadius(originalRadius)}
                            disabled={saving || !hasRadiusChanged}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Batalkan Perubahan
                          </button>

                          <button
                            type="submit"
                            disabled={saving || !hasRadiusChanged}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {saving ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <Save size={17} />
                            )}
                            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                          </button>
                        </div>
                      </form>
                    </SectionCard>

                    <SectionCard
                      icon={Settings2}
                      title="Pengaturan Sistem Tersimpan"
                      description="Daftar konfigurasi yang dikembalikan Backend."
                    >
                      {settings.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
                          <Settings2
                            size={25}
                            className="mx-auto text-slate-400"
                          />
                          <p className="mt-3 text-sm font-medium text-slate-700">
                            Belum ada pengaturan yang ditemukan
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Tidak ada data yang dikembalikan untuk akun sekolah
                            ini.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[420px] text-left text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                <th className="pb-3 pr-4 font-semibold">
                                  Kunci
                                </th>
                                <th className="pb-3 pr-4 font-semibold">
                                  Nilai
                                </th>
                                <th className="pb-3 font-semibold">
                                  Kelompok
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {settings.map((item) => (
                                <tr
                                  key={item.id || item.kunci}
                                  className="border-b border-slate-100 last:border-0"
                                >
                                  <td className="py-3 pr-4 font-medium text-slate-800">
                                    <span className="break-all">
                                      {item.kunci || "-"}
                                    </span>
                                    {item.keterangan && (
                                      <p className="mt-1 max-w-xs text-xs font-normal leading-5 text-slate-500">
                                        {item.keterangan}
                                      </p>
                                    )}
                                  </td>

                                  <td className="max-w-56 break-words py-3 pr-4 text-slate-600">
                                    {item.kunci === KEYS.radius
                                      ? `${item.nilai ?? "-"} meter`
                                      : String(item.nilai ?? "-")}
                                  </td>

                                  <td className="py-3 text-slate-500">
                                    {item.kelompok || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </SectionCard>
                  </div>

                  <aside className="space-y-6">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700">
                        <ShieldCheck size={21} />
                      </div>

                      <h2 className="mt-4 text-base font-semibold text-slate-900">
                        Integrasi Backend
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Halaman membaca metode presensi dan konfigurasi sistem
                        melalui endpoint yang tersedia pada aplikasi Express.
                      </p>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <span>
                            Metode presensi dibaca dari API absensi.
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <span>
                            Pengaturan sistem dibaca dan disimpan melalui API
                            pengaturan.
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-slate-700">
                          <Info
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-600"
                          />
                          <span>
                            Jam masuk, jam keluar, dan toleransi keterlambatan
                            mengikuti konfigurasi Shift Kerja.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                          <Clock3 size={20} />
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            Shift Kerja
                          </h2>
                          <p className="text-xs text-slate-500">
                            Konfigurasi jam kerja
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Ubah jam masuk, jam keluar, dan toleransi keterlambatan
                        melalui halaman Shift Kerja.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                          <CalendarDays size={20} />
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            Hari Aktif
                          </h2>
                          <p className="text-xs text-slate-500">
                            Jadwal presensi
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Pengaturan hari aktif belum tersedia pada endpoint
                        Backend yang diperiksa. Untuk saat ini, bagian ini
                        hanya memberikan informasi.
                      </p>
                    </div>
                  </aside>
                </div>
              </>
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
