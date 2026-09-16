"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  BookOpen,
  Users,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Eye,
  GraduationCap,
  Search,
} from "lucide-react";

import { getKelasMapel } from "../../../../../services/kelasMapel.service";
import { createJadwalMengajar } from "../../../../../services/jadwalMengajar.service";

const DAYS = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

function formatDay(day) {
  const found = DAYS.find(
    (item) =>
      item.value.toLowerCase() === String(day || "").toLowerCase()
  );
  return found?.label || day || "-";
}

function getErrorMessage(error) {
  if (!error) return "Terjadi kesalahan.";
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  return "Terjadi kesalahan saat memproses data.";
}

/* =========================================================
   LAYOUT SHELL — sidebar full-height (sesuai komponen kamu)
   ┌─────────┬───────────────────────────┐
   │ LOGO    │  HEADER                   │
   ├─────────┼───────────────────────────┤
   │ SIDEBAR │  CONTENT                  │
   │ (nav)   │                           │
   └─────────┴───────────────────────────┘
========================================================= */
const HEADER_HEIGHT = 88;   // samakan dengan tinggi header kamu
const SIDEBAR_WIDTH = 280;

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar full-height (desktop) */}
      <aside
        className="fixed inset-y-0 left-0 z-50 hidden lg:block"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Sidebar role="guru" />
      </aside>

      {/* Sidebar mobile */}
      <div className="lg:hidden">
        <Sidebar role="guru" />
      </div>

      {/* Header — mulai setelah sidebar, tidak nutupin sidebar */}
      <header
        className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white lg:left-[280px]"
        style={{ height: HEADER_HEIGHT }}
      >
        <Header />
      </header>

      {/* Konten */}
      <main
        className="lg:ml-[280px]"
        style={{ paddingTop: HEADER_HEIGHT }}
      >
        {children}
      </main>
    </div>
  );
}

/* =========================================================
   SEARCHABLE DROPDOWN — kelas + mapel
========================================================= */
function SearchableKelasMapelSelect({
  value,
  onChange,
  options,
  loading,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const selected = useMemo(
    () => options.find((item) => String(item.id) === String(value)),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((item) => {
      const kelas = String(item?.kelas?.nama || "").toLowerCase();
      const mapel = String(item?.mataPelajaran?.nama || "").toLowerCase();
      const kode = String(item?.mataPelajaran?.kode || "").toLowerCase();
      const guru = String(item?.guruPengajar?.namaLengkap || "").toLowerCase();
      return (
        kelas.includes(q) ||
        mapel.includes(q) ||
        kode.includes(q) ||
        guru.includes(q)
      );
    });
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item) {
    onChange(item.id);
    setOpen(false);
    setQuery("");
  }

  const placeholder = loading
    ? "Memuat data..."
    : options.length === 0
    ? "Belum ada data kelas & mapel"
    : "Pilih kelas & mata pelajaran";

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BookOpen size={16} />
          </span>

          <span className="min-w-0">
            {selected ? (
              <>
                <span className="block truncate font-semibold text-slate-800">
                  {selected?.kelas?.nama || "Kelas tidak diketahui"} —{" "}
                  {selected?.mataPelajaran?.nama || "Mapel tidak diketahui"}
                </span>
                {selected?.guruPengajar?.namaLengkap && (
                  <span className="block truncate text-xs text-slate-500">
                    Guru: {selected.guruPengajar.namaLengkap}
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !loading && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kelas, mapel, atau guru..."
                autoFocus
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BookOpen className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">
                  Data tidak ditemukan
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = String(item.id) === String(value);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition ${
                      isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <BookOpen size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">
                        {item?.kelas?.nama || "Kelas tidak diketahui"} —{" "}
                        {item?.mataPelajaran?.nama ||
                          "Mata pelajaran tidak diketahui"}
                      </span>
                      {item?.guruPengajar?.namaLengkap && (
                        <span className="block truncate text-xs text-slate-500">
                          Guru: {item.guruPengajar.namaLengkap}
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-blue-600"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function BuatJadwalGuruPage() {
  const router = useRouter();

  const [kelasMapel, setKelasMapel] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    kelasMapelId: "",
    hari: "senin",
    jamMulai: "07:00",
    jamSelesai: "08:30",
    ruangan: "",
  });

  useEffect(() => {
    loadKelasMapel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadKelasMapel() {
    try {
      setLoadingData(true);
      setError("");

      const data = await getKelasMapel();

      if (!Array.isArray(data)) {
        throw new Error("Data kelas dan mata pelajaran tidak valid.");
      }

      setKelasMapel(data);

      if (data.length === 0) {
        setError(
          "Belum ada data kelas dan mata pelajaran yang tersedia. Silakan atur Guru + Mapel + Kelas terlebih dahulu."
        );
      }
    } catch (err) {
      console.error("Gagal mengambil data kelas mapel:", err);
      setError(
        `Gagal mengambil data kelas & mata pelajaran. ${getErrorMessage(err)}`
      );
    } finally {
      setLoadingData(false);
    }
  }

  const selectedKelasMapel = useMemo(() => {
    if (!form.kelasMapelId) return null;
    return kelasMapel.find((item) => item.id === form.kelasMapelId) || null;
  }, [kelasMapel, form.kelasMapelId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (!form.kelasMapelId) return "Silakan pilih kelas dan mata pelajaran.";
    if (!form.hari) return "Silakan pilih hari.";
    if (!form.jamMulai) return "Silakan pilih jam mulai.";
    if (!form.jamSelesai) return "Silakan pilih jam selesai.";
    if (form.jamMulai >= form.jamSelesai)
      return "Jam selesai harus lebih besar dari jam mulai.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        kelasMapelId: form.kelasMapelId,
        hari: form.hari,
        jamMulai: form.jamMulai,
        jamSelesai: form.jamSelesai,
        ruangan: form.ruangan.trim() || null,
      };

      await createJadwalMengajar(payload);

      setSuccess("Jadwal mengajar berhasil dibuat.");

      setTimeout(() => {
        router.push("/guru/jadwal/kalender");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("Gagal membuat jadwal:", err);
      setError(`Gagal menyimpan jadwal. ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* ============ PAGE HEADER ============ */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Link
                  href="/guru/jadwal/kalender"
                  className="transition hover:text-blue-600"
                >
                  Jadwal Mengajar
                </Link>
                <span>/</span>
                <span className="text-slate-700">Buat Jadwal</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Buat Jadwal Mengajar
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Tambahkan jadwal mengajar berdasarkan kelas dan mata pelajaran
                yang sudah ditentukan.
              </p>
            </div>

            <Link
              href="/guru/jadwal/kalender"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Kembali
            </Link>
          </div>

          {/* ============ ERROR ============ */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Terjadi kesalahan</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* ============ SUCCESS ============ */}
          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Berhasil</p>
                <p className="mt-1 text-sm">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              {/* ============ FORM ============ */}
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <CalendarDays size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Informasi Jadwal
                      </h2>
                      <p className="text-sm text-slate-500">
                        Lengkapi informasi jadwal mengajar
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {/* KELAS + MAPEL */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Kelas & Mata Pelajaran
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <SearchableKelasMapelSelect
                      value={form.kelasMapelId}
                      onChange={(val) => {
                        setForm((prev) => ({ ...prev, kelasMapelId: val }));
                        setError("");
                        setSuccess("");
                      }}
                      options={kelasMapel}
                      loading={loadingData}
                      disabled={saving}
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Data kelas, mata pelajaran, dan guru diambil langsung
                      dari backend. Ketik untuk mencari.
                    </p>
                  </div>

                  {/* DETAIL KELAS MAPEL */}
                  {selectedKelasMapel && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">
                        Detail Pengaturan
                      </p>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-blue-600">
                            <GraduationCap size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">Kelas</p>
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {selectedKelasMapel.kelas?.nama || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-blue-600">
                            <BookOpen size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">
                              Mata Pelajaran
                            </p>
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {selectedKelasMapel.mataPelajaran?.nama || "-"}
                            </p>
                            {selectedKelasMapel.mataPelajaran?.kode && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                Kode: {selectedKelasMapel.mataPelajaran.kode}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-blue-600">
                            <Users size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">Guru</p>
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {selectedKelasMapel.guruPengajar?.namaLengkap ||
                                "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HARI */}
                  <div>
                    <label
                      htmlFor="hari"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Hari
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <select
                        id="hari"
                        name="hari"
                        value={form.hari}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        {DAYS.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  {/* JAM */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="jamMulai"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Jam Mulai
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock3
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="jamMulai"
                          name="jamMulai"
                          type="time"
                          value={form.jamMulai}
                          onChange={handleChange}
                          disabled={saving}
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="jamSelesai"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Jam Selesai
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock3
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="jamSelesai"
                          name="jamSelesai"
                          type="time"
                          value={form.jamSelesai}
                          onChange={handleChange}
                          disabled={saving}
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RUANGAN */}
                  <div>
                    <label
                      htmlFor="ruangan"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Ruangan
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        Opsional
                      </span>
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="ruangan"
                        name="ruangan"
                        type="text"
                        value={form.ruangan}
                        onChange={handleChange}
                        disabled={saving}
                        placeholder="Contoh: Ruang 12, Lab Fisika"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* ACTION */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
                  <Link
                    href="/guru/jadwal/kalender"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Batal
                  </Link>

                  <button
                    type="submit"
                    disabled={
                      saving || loadingData || kelasMapel.length === 0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Simpan Jadwal
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ============ PREVIEW ============ */}
              <div className="h-fit min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Eye size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Preview Jadwal
                      </h2>
                      <p className="text-sm text-slate-500">
                        Tampilan sebelum disimpan
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="bg-slate-900 px-5 py-4 text-white">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-300">
                        Hari
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {formatDay(form.hari)}
                      </p>
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Clock3 size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Waktu</p>
                          <p className="mt-0.5 font-semibold text-slate-800">
                            {form.jamMulai || "--:--"} -{" "}
                            {form.jamSelesai || "--:--"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <BookOpen size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">
                            Mata Pelajaran
                          </p>
                          <p className="mt-0.5 font-semibold text-slate-800">
                            {selectedKelasMapel?.mataPelajaran?.nama ||
                              "Belum dipilih"}
                          </p>
                          {selectedKelasMapel?.mataPelajaran?.kode && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              Kode: {selectedKelasMapel.mataPelajaran.kode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <GraduationCap size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Kelas</p>
                          <p className="mt-0.5 font-semibold text-slate-800">
                            {selectedKelasMapel?.kelas?.nama || "Belum dipilih"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                          <Users size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">
                            Guru Pengajar
                          </p>
                          <p className="mt-0.5 font-semibold text-slate-800">
                            {selectedKelasMapel?.guruPengajar?.namaLengkap ||
                              "Belum dipilih"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                          <MapPin size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Ruangan</p>
                          <p className="mt-0.5 font-semibold text-slate-800">
                            {form.ruangan || "Belum ditentukan"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs leading-5 text-slate-500">
                      Setelah disimpan, jadwal akan dikirim ke backend dan
                      ditampilkan pada kalender jadwal mengajar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}