"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Clock3,
  Pencil,
  Save,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Info,
  Sun,
  Sunset,
  Timer,
  CalendarClock,
  BookOpen,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getShiftSiswa, updateShiftSiswa } from "@/services/shiftSiswa.service";

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getArray(response, keys = []) {
  let current = response;

  for (let i = 0; i < 10 && current != null; i++) {
    if (Array.isArray(current)) return current;
    if (!isObject(current)) return [];

    for (const key of keys) {
      if (Array.isArray(current[key])) return current[key];
    }

    for (const key of ["items", "results", "rows"]) {
      if (Array.isArray(current[key])) return current[key];
    }

    if (!("data" in current)) return [];
    current = current.data;
  }

  return Array.isArray(current) ? current : [];
}

function getErrorMessage(error, fallback) {
  if (typeof error === "string" && error.trim()) return error;

  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.data?.message ||
    fallback
  );
}

function formatJam(value) {
  if (value === null || value === undefined || value === "") return "-";

  const text = String(value).trim();

  const timeMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
  }

  const isoMatch = text.match(/[T ](\d{2}):(\d{2})(?::\d{2})?/);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`;
  }

  return text;
}

function normalizeShiftSiswaResponse(response) {
  const rows = getArray(response, ["shiftSiswa", "shift_siswa", "shifts"]);
  if (!Array.isArray(rows)) return [];

  return rows
    .filter(
      (item) =>
        isObject(item) &&
        typeof item.kode === "string" &&
        item.kode.trim() !== ""
    )
    .map((item) => ({
      ...item,
      kode: normalizeText(item.kode),
      nama:
        item.nama ??
        (normalizeText(item.kode) === "pagi"
          ? "Pagi"
          : normalizeText(item.kode) === "siang"
            ? "Siang"
            : normalizeText(item.kode)),
      jamMasuk: item.jamMasuk ?? item.jam_masuk ?? null,
      jamKeluar: item.jamKeluar ?? item.jam_keluar ?? null,
      toleransiTerlambatMenit:
        item.toleransiTerlambatMenit ?? item.toleransi_terlambat_menit ?? 15,
    }))
    .filter((item) => ["pagi", "siang"].includes(item.kode));
}

function buildFallbackShiftSiswa() {
  return [
    {
      kode: "pagi",
      nama: "Pagi",
      jamMasuk: "07:00",
      jamKeluar: "14:00",
      toleransiTerlambatMenit: 15,
      __fallback: true,
    },
    {
      kode: "siang",
      nama: "Siang",
      jamMasuk: "12:00",
      jamKeluar: "18:00",
      toleransiTerlambatMenit: 15,
      __fallback: true,
    },
  ];
}

function StatCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  };

  return (
    <div className="theme-card flex flex-col justify-between rounded-xl border theme-border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3 border-b theme-border pb-3">
        <p className="text-xs font-bold uppercase tracking-wider theme-text-muted">
          {title}
        </p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            tones[tone] || tones.blue
          }`}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight theme-text">
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
        <p className="mt-1 text-xs leading-relaxed theme-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

function ShiftIcon({ kode, size = 20 }) {
  return normalizeText(kode) === "pagi" ? (
    <Sun size={size} />
  ) : (
    <Sunset size={size} />
  );
}

function ShiftCard({
  shiftItem,
  form,
  isEditing,
  isSaving,
  error,
  onChange,
  onEdit,
  onCancel,
  onSave,
}) {
  const isPagi = normalizeText(shiftItem.kode) === "pagi";

  return (
    <div className="theme-card flex flex-col rounded-xl border theme-border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b theme-border pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
              isPagi
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"
                : "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300"
            }`}
          >
            <ShiftIcon kode={shiftItem.kode} />
          </div>
          <div>
            <p className="text-base font-bold theme-text">
              Shift {shiftItem.nama || shiftItem.kode}
            </p>
            <p className="text-xs uppercase tracking-wide theme-text-muted">
              Kode: {shiftItem.kode}
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border theme-border px-3 py-1.5 text-xs font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
          >
            <Pencil size={13} />
            Ubah
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span className="flex-1 break-words">{error}</span>
        </div>
      )}

      {isEditing ? (
        <div className="mt-4 flex flex-1 flex-col">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold theme-text">
                Jam Masuk <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={form.jamMasuk}
                onChange={(e) => onChange("jamMasuk", e.target.value)}
                className="w-full rounded-lg border theme-border bg-[var(--color-surface)] px-3 py-2 text-sm font-mono theme-text outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold theme-text">
                Jam Keluar <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={form.jamKeluar}
                onChange={(e) => onChange("jamKeluar", e.target.value)}
                className="w-full rounded-lg border theme-border bg-[var(--color-surface)] px-3 py-2 text-sm font-mono theme-text outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-semibold theme-text">
              Toleransi Keterlambatan (Menit)
            </label>
            <input
              type="number"
              min="0"
              max="240"
              value={form.toleransiTerlambatMenit}
              onChange={(e) =>
                onChange("toleransiTerlambatMenit", e.target.value)
              }
              className="w-full rounded-lg border theme-border bg-[var(--color-surface)] px-3 py-2 text-sm theme-text outline-none focus:border-[var(--color-primary)]"
              placeholder="Contoh: 15"
            />
          </div>

          <div className="mt-auto flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border theme-border px-3 py-1.5 text-xs font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-40"
            >
              <X size={13} />
              Batal
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={onSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <LoaderCircle size={13} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between theme-text-muted">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} />
              Jam Belajar
            </span>
            <span className="font-mono font-semibold theme-text">
              {formatJam(shiftItem.jamMasuk)} – {formatJam(shiftItem.jamKeluar)}
            </span>
          </div>

          <div className="flex items-center justify-between theme-text-muted">
            <span>Toleransi Keterlambatan</span>
            <span className="font-medium theme-text">
              {shiftItem.toleransiTerlambatMenit ?? 15} menit
            </span>
          </div>

          {shiftItem.__fallback && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span className="flex-1">
                Menampilkan nilai default. Konfigurasi dari server belum
                tersedia.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function KonfigurasiShiftPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [shiftSiswaList, setShiftSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [warnings, setWarnings] = useState([]);

  const [editingKode, setEditingKode] = useState(null);
  const [editForm, setEditForm] = useState({
    jamMasuk: "",
    jamKeluar: "",
    toleransiTerlambatMenit: 15,
  });
  const [savingKode, setSavingKode] = useState(null);
  const [editError, setEditError] = useState("");

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    setWarnings([]);

    try {
      const response = await getShiftSiswa();
      const normalized = normalizeShiftSiswaResponse(response);

      if (normalized.length === 0) {
        setShiftSiswaList(buildFallbackShiftSiswa());
        setWarnings([
          "Konfigurasi jam shift siswa tidak tersedia dari server. Menampilkan jam default (Pagi 07:00–14:00, Siang 12:00–18:00).",
        ]);
      } else {
        setShiftSiswaList(normalized);
      }
    } catch (loadError) {
      console.error("[KONFIGURASI SHIFT] Gagal memuat:", loadError);
      setShiftSiswaList(buildFallbackShiftSiswa());
      setWarnings([
        `Konfigurasi jam shift siswa gagal dimuat: ${getErrorMessage(
          loadError,
          "Permintaan gagal."
        )}. Menampilkan jam default.`,
      ]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  function handleStartEdit(shiftItem) {
    setEditingKode(shiftItem.kode);
    setEditForm({
      jamMasuk:
        formatJam(shiftItem.jamMasuk) === "-"
          ? "07:00"
          : formatJam(shiftItem.jamMasuk),
      jamKeluar:
        formatJam(shiftItem.jamKeluar) === "-"
          ? "14:00"
          : formatJam(shiftItem.jamKeluar),
      toleransiTerlambatMenit: shiftItem.toleransiTerlambatMenit ?? 15,
    });
    setEditError("");
  }

  function handleCancelEdit() {
    setEditingKode(null);
    setEditError("");
  }

  function handleChange(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(shiftItem) {
    const { jamMasuk, jamKeluar, toleransiTerlambatMenit } = editForm;

    if (!jamMasuk || !jamKeluar) {
      setEditError("Jam masuk dan jam keluar wajib diisi.");
      return;
    }

    if (jamKeluar <= jamMasuk) {
      setEditError("Jam keluar harus lebih besar dari jam masuk.");
      return;
    }

    setSavingKode(shiftItem.kode);
    setEditError("");

    try {
      const updated = await updateShiftSiswa(shiftItem.kode, {
        jamMasuk,
        jamKeluar,
        toleransiTerlambatMenit: Number(toleransiTerlambatMenit) || 0,
      });

      setShiftSiswaList((prev) =>
        prev.map((item) =>
          normalizeText(item.kode) === normalizeText(shiftItem.kode)
            ? { ...item, ...updated, __fallback: false }
            : item
        )
      );

      setNotice(
        `Konfigurasi Shift ${shiftItem.nama || shiftItem.kode} berhasil diperbarui.`
      );
      setEditingKode(null);

      router.push("/admin/presensi/penugasan-shift");
    } catch (saveError) {
      console.error("[KONFIGURASI SHIFT] Gagal menyimpan:", saveError);
      setEditError(
        getErrorMessage(saveError, "Gagal memperbarui konfigurasi shift siswa.")
      );
    } finally {
      setSavingKode(null);
    }
  }

  const pagiItem = shiftSiswaList.find((s) => normalizeText(s.kode) === "pagi");
  const siangItem = shiftSiswaList.find(
    (s) => normalizeText(s.kode) === "siang"
  );

  const totalConfigured = [pagiItem, siangItem].filter(Boolean).length;
  const totalFallback = [pagiItem, siangItem].filter(
    (item) => item?.__fallback
  ).length;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={14} />
                  Kembali
                </button>

                <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                  Konfigurasi Shift Belajar
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 theme-text-secondary">
                  Atur jam masuk, jam keluar, dan toleransi keterlambatan untuk
                  shift belajar siswa (Pagi dan Siang).
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadData()}
                disabled={loading || savingKode !== null}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
              <StatCard
                title="Total Shift"
                value={loading ? "—" : 2}
                description="Shift belajar yang dikonfigurasi"
                icon={CalendarClock}
                tone="blue"
              />
              <StatCard
                title="Terkonfigurasi"
                value={loading ? "—" : totalConfigured}
                description="Shift dengan data dari server"
                icon={CheckCircle2}
                tone="emerald"
              />
              <StatCard
                title="Menggunakan Default"
                value={loading ? "—" : totalFallback}
                description="Shift yang memakai nilai fallback"
                icon={Timer}
                tone="amber"
              />
            </div>

            <div className="theme-card mb-6 flex items-start gap-3 rounded-lg border theme-border p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <Info size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold theme-text">
                  Tentang Konfigurasi Shift
                </p>
                <p className="mt-1 text-xs leading-5 theme-text-muted">
                  Perubahan jam shift akan mempengaruhi perhitungan presensi
                  siswa. Pastikan jam keluar lebih besar dari jam masuk.
                  Toleransi keterlambatan adalah batas waktu sebelum siswa
                  dinyatakan terlambat.
                </p>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Informasi</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5">
                    {warnings.map((warning, index) => (
                      <li key={`${index}-${warning}`}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Permintaan gagal</p>
                  <p className="mt-1 break-words">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan kesalahan"
                  className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                <p className="min-w-0 flex-1">{notice}</p>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Tutup notifikasi"
                  className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {loading ? (
              <div className="theme-card flex min-h-[300px] flex-col items-center justify-center rounded-xl border theme-border">
                <LoaderCircle
                  size={30}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="mt-3 text-sm font-medium theme-text-muted">
                  Memuat konfigurasi shift...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {["pagi", "siang"].map((kode) => {
                  const shiftItem =
                    shiftSiswaList.find(
                      (s) => normalizeText(s.kode) === kode
                    ) ||
                    (kode === "pagi"
                      ? {
                          kode: "pagi",
                          nama: "Pagi",
                          jamMasuk: "07:00",
                          jamKeluar: "14:00",
                          toleransiTerlambatMenit: 15,
                          __fallback: true,
                        }
                      : {
                          kode: "siang",
                          nama: "Siang",
                          jamMasuk: "12:00",
                          jamKeluar: "18:00",
                          toleransiTerlambatMenit: 15,
                          __fallback: true,
                        });

                  return (
                    <ShiftCard
                      key={kode}
                      shiftItem={shiftItem}
                      form={editForm}
                      isEditing={editingKode === kode}
                      isSaving={savingKode === kode}
                      error={editingKode === kode ? editError : ""}
                      onChange={handleChange}
                      onEdit={() => handleStartEdit(shiftItem)}
                      onCancel={handleCancelEdit}
                      onSave={() => handleSave(shiftItem)}
                    />
                  );
                })}
              </div>
            )}

            <div className="theme-card mt-6 flex items-start gap-3 rounded-lg border theme-border p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <BookOpen size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold theme-text">
                  Catatan Penggunaan
                </p>
                <p className="mt-1 text-xs leading-5 theme-text-muted">
                  Konfigurasi ini berlaku global untuk seluruh kelas dengan
                  shift terkait. Untuk mengubah shift per kelas, buka halaman
                  Penugasan Shift dan pilih tab Siswa (Per Kelas).
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}