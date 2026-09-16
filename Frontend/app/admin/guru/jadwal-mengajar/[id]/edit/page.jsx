"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  ArrowLeft,
  CalendarDays,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  UserRound,
  BookOpen,
  School,
  Loader2,
  Search,
} from "lucide-react";

import {
  getJadwalMengajarById,
  updateJadwalMengajar,
} from "../../../../../../services/jadwalMengajar.service";

import { getKelasMapel } from "../../../../../../services/kelasMapel.service";

const HARI = [
  { value: "senin", label: "Senin" },
  { value: "selasa", label: "Selasa" },
  { value: "rabu", label: "Rabu" },
  { value: "kamis", label: "Kamis" },
  { value: "jumat", label: "Jumat" },
  { value: "sabtu", label: "Sabtu" },
];

/* =========================================================
   LAYOUT SHELL
========================================================= */
const HEADER_HEIGHT = 88;
const SIDEBAR_WIDTH = 280;

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className="fixed inset-y-0 left-0 z-50 hidden lg:block"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Sidebar role="admin" />
      </aside>

      <div className="lg:hidden">
        <Sidebar role="admin" />
      </div>

      <header
        className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white lg:left-[280px]"
        style={{ height: HEADER_HEIGHT }}
      >
        <Header />
      </header>

      <main className="lg:ml-[280px]" style={{ paddingTop: HEADER_HEIGHT }}>
        {children}
      </main>
    </div>
  );
}

/* =========================================================
   HELPERS (dipakai di luar komponen supaya stabil)
========================================================= */
function getKelasName(item) {
  return item?.kelas?.nama || "-";
}
function getMapelName(item) {
  return item?.mataPelajaran?.nama || "-";
}
function getMapelKode(item) {
  return item?.mataPelajaran?.kode || "";
}
function getGuruName(item) {
  return item?.guruPengajar?.namaLengkap || "-";
}
function getGuruNip(item) {
  return item?.guruPengajar?.nip || "";
}
function formatKelasMapel(item) {
  if (!item) return "";
  return `${getKelasName(item)} • ${getMapelName(item)} • ${getGuruName(item)}`;
}

/* =========================================================
   SEARCHABLE DROPDOWN (Kelas / Mapel / Guru)
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
      const kelas = getKelasName(item).toLowerCase();
      const mapel = getMapelName(item).toLowerCase();
      const kode = getMapelKode(item).toLowerCase();
      const guru = getGuruName(item).toLowerCase();
      return (
        kelas.includes(q) ||
        mapel.includes(q) ||
        kode.includes(q) ||
        guru.includes(q)
      );
    });
  }, [options, query]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
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

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <School size={16} />
          </span>

          <span className="min-w-0">
            {loading ? (
              <span className="text-slate-400">
                Memuat data kelas mapel...
              </span>
            ) : selected ? (
              <>
                <span className="block truncate font-semibold text-slate-800">
                  {getKelasName(selected)} • {getMapelName(selected)}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {getGuruName(selected)}
                </span>
              </>
            ) : (
              <span className="text-slate-400">
                Pilih kelas, mata pelajaran, dan guru
              </span>
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
                <School className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">
                  Data tidak ditemukan
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected =
                  String(item.id) === String(value);
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
                      <School size={15} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">
                        {getKelasName(item)} • {getMapelName(item)}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {getGuruName(item)}
                        {getGuruNip(item) ? ` • ${getGuruNip(item)}` : ""}
                      </span>
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
export default function EditJadwalMengajarPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingKelasMapel, setLoadingKelasMapel] = useState(true);

  const [kelasMapelList, setKelasMapelList] = useState([]);

  const [form, setForm] = useState({
    kelasMapelId: "",
    hari: "",
    jamMulai: "",
    jamSelesai: "",
    ruangan: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [jadwal, kelasMapel] = await Promise.all([
        getJadwalMengajarById(id),
        getKelasMapel(),
      ]);

      setKelasMapelList(
        Array.isArray(kelasMapel)
          ? kelasMapel.filter((item) => item.status !== "tidak_aktif")
          : []
      );

      setForm({
        kelasMapelId: jadwal?.kelasMapelId || "",
        hari: jadwal?.hari || "",
        jamMulai: jadwal?.jamMulai || "",
        jamSelesai: jadwal?.jamSelesai || "",
        ruangan: jadwal?.ruangan || "",
      });
    } catch (err) {
      console.error("Gagal mengambil data edit jadwal:", err);
      setError(
        err?.message ||
          "Gagal mengambil data jadwal mengajar. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
      setLoadingKelasMapel(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  }

  const selectedKelasMapel = useMemo(
    () =>
      kelasMapelList.find(
        (item) => String(item.id) === String(form.kelasMapelId)
      ),
    [kelasMapelList, form.kelasMapelId]
  );

  function validateForm() {
    if (!form.kelasMapelId)
      return "Silakan pilih kelas, mata pelajaran, dan guru.";
    if (!form.hari) return "Silakan pilih hari.";
    if (!form.jamMulai) return "Silakan isi jam mulai.";
    if (!form.jamSelesai) return "Silakan isi jam selesai.";
    if (form.jamSelesai <= form.jamMulai)
      return "Jam selesai harus lebih besar dari jam mulai.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
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

      await updateJadwalMengajar(id, payload);

      setSuccess("Jadwal mengajar berhasil diperbarui.");

      setTimeout(() => {
        router.push("/admin/jadwal-mengajar");
      }, 800);
    } catch (err) {
      console.error("Gagal update jadwal:", err);

      if (err?.status === 409) {
        setError(
          err?.message || "Jadwal guru bentrok dengan jadwal lain."
        );
      } else if (err?.status === 404) {
        setError(
          err?.message || "Jadwal atau kelas mapel tidak ditemukan."
        );
      } else if (err?.status === 403) {
        setError(err?.message || "Anda tidak memiliki akses ke jadwal ini.");
      } else {
        setError(err?.message || "Gagal memperbarui jadwal mengajar.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push("/admin/jadwal-mengajar");
  }

  /* LOADING */
  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-600">
              Memuat data jadwal...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* PAGE HEADER */}
          <div className="mb-6">
            <Link
              href="/admin/guru/jadwal-mengajar"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Kembali ke Jadwal Mengajar
            </Link>

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <CalendarDays size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Edit Jadwal Mengajar
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Perbarui informasi jadwal mengajar sesuai kebutuhan.
                </p>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Terjadi kesalahan</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 transition hover:bg-red-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Berhasil</p>
                <p className="mt-1 text-sm">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              {/* FORM UTAMA */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <CalendarDays size={19} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Informasi Jadwal
                      </h2>
                      <p className="text-xs text-slate-500">
                        Isi data jadwal yang ingin diperbarui.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {/* KELAS MAPEL (searchable) */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Kelas / Mata Pelajaran / Guru
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <SearchableKelasMapelSelect
                      value={form.kelasMapelId}
                      onChange={(val) => {
                        setForm((prev) => ({
                          ...prev,
                          kelasMapelId: val,
                        }));
                        setError("");
                        setSuccess("");
                      }}
                      options={kelasMapelList}
                      loading={loadingKelasMapel}
                      disabled={saving}
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Data ini berasal dari Kelas Mapel yang sudah terdaftar
                      pada sekolah. Ketik untuk mencari.
                    </p>
                  </div>

                  {/* DETAIL SELECTED */}
                  {selectedKelasMapel && (
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-500">
                          <School size={17} />
                          <span className="text-xs font-semibold uppercase">
                            Kelas
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {getKelasName(selectedKelasMapel)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-500">
                          <BookOpen size={17} />
                          <span className="text-xs font-semibold uppercase">
                            Mata Pelajaran
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {getMapelName(selectedKelasMapel)}
                        </p>
                        {getMapelKode(selectedKelasMapel) && (
                          <p className="mt-1 text-xs text-slate-500">
                            Kode: {getMapelKode(selectedKelasMapel)}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-500">
                          <UserRound size={17} />
                          <span className="text-xs font-semibold uppercase">
                            Guru
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {getGuruName(selectedKelasMapel)}
                        </p>
                        {getGuruNip(selectedKelasMapel) && (
                          <p className="mt-1 text-xs text-slate-500">
                            NIP: {getGuruNip(selectedKelasMapel)}
                          </p>
                        )}
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
                        className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        <option value="">Pilih hari</option>
                        {HARI.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
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
                  <div className="grid gap-5 md:grid-cols-2">
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
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="jamMulai"
                          name="jamMulai"
                          type="time"
                          value={form.jamMulai}
                          onChange={handleChange}
                          disabled={saving}
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="jamSelesai"
                          name="jamSelesai"
                          type="time"
                          value={form.jamSelesai}
                          onChange={handleChange}
                          disabled={saving}
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                        (opsional)
                      </span>
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="ruangan"
                        name="ruangan"
                        type="text"
                        value={form.ruangan}
                        onChange={handleChange}
                        disabled={saving}
                        placeholder="Contoh: Lab Fisika / Ruang XI IPA 1"
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* FOOTER FORM */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={18} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
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
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SIDEBAR INFO */}
              <div className="space-y-5">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <CalendarDays size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900">
                      Data yang Diedit
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Kelas
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedKelasMapel
                          ? getKelasName(selectedKelasMapel)
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Mata Pelajaran
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedKelasMapel
                          ? getMapelName(selectedKelasMapel)
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Guru
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedKelasMapel
                          ? getGuruName(selectedKelasMapel)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <AlertCircle size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900">Perhatian</h3>
                  </div>

                  <ul className="space-y-3 text-sm leading-6 text-slate-600">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      Pastikan jam selesai lebih besar dari jam mulai.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      Guru tidak boleh memiliki jadwal yang bentrok.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      Perubahan akan langsung disimpan ke server.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}