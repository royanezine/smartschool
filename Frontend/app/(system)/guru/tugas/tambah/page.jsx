"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Users,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  getKelasMapelGuru,
  createTugas,
} from "../../../../services/tugas.service";

export default function TambahTugasPage() {
  const router = useRouter();

  const [kelasMapel, setKelasMapel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    kelasMapelId: "",
    judul: "",
    deskripsi: "",
    tanggal: "",
    waktu: "23:59",
  });

  // ======================================================
  // LOAD KELAS MAPEL
  // ======================================================

  useEffect(() => {
    loadKelasMapel();
  }, []);

  const loadKelasMapel = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      let currentUser = null;

      try {
        currentUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        currentUser = null;
      }

      console.log("USER LOGIN:", {
        userId: currentUser?.userId,
        email: currentUser?.email,
        role: currentUser?.role,
      });

      const currentUserId = currentUser?.userId;

      if (!currentUserId) {
        throw new Error("Data pengguna tidak ditemukan. Silakan login kembali.");
      }

      const response = await getKelasMapelGuru();
      console.log("RESPONSE KELAS MAPEL:", response);

      const data = Array.isArray(response?.data) ? response.data : [];
      console.log("SEMUA KELAS MAPEL:", data);

      const kelasMapelGuru = data.filter((item) => {
        const guruId = item?.guruPengajarId ?? item?.guruPengajar?.id ?? null;
        return guruId === currentUserId;
      });

      console.log("KELAS MAPEL GURU LOGIN:", kelasMapelGuru);
      setKelasMapel(kelasMapelGuru);
    } catch (err) {
      console.error("Gagal mengambil kelas mapel:", err);
      setError(err?.message || "Gagal mengambil data kelas dan mata pelajaran.");
      setKelasMapel([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.kelasMapelId) {
      setError("Silakan pilih kelas dan mata pelajaran.");
      return;
    }

    if (!form.judul.trim()) {
      setError("Judul tugas wajib diisi.");
      return;
    }

    if (form.judul.trim().length < 3) {
      setError("Judul tugas minimal 3 karakter.");
      return;
    }

    if (!form.tanggal) {
      setError("Tanggal deadline wajib diisi.");
      return;
    }

    if (!form.waktu) {
      setError("Waktu deadline wajib diisi.");
      return;
    }

    const selected = kelasMapel.find((item) => item.id === form.kelasMapelId);
    if (!selected) {
      setError("Kelas dan mata pelajaran yang dipilih tidak valid.");
      return;
    }

    try {
      setSaving(true);

      const batasWaktu = new Date(`${form.tanggal}T${form.waktu}:00`).toISOString();

      const payload = {
        kelasMapelId: form.kelasMapelId,
        judul: form.judul.trim(),
        deskripsi: form.deskripsi.trim() || null,
        batasWaktu,
      };

      const storedUser = localStorage.getItem("user");
      let currentUser = null;
      try {
        currentUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        currentUser = null;
      }

      console.log("========== DEBUG CREATE TUGAS ==========");
      console.log("USER LOGIN:", {
        userId: currentUser?.userId,
        email: currentUser?.email,
        role: currentUser?.role,
      });
      console.log("PAYLOAD:", payload);
      console.log("KELAS MAPEL TERPILIH:", selected);
      console.log("GURU PENGAJAR ID:", selected?.guruPengajarId ?? selected?.guruPengajar?.id);
      console.log("========================================");

      await createTugas(payload);
      setSuccess("Tugas berhasil dibuat.");

      setTimeout(() => {
        router.push("/guru/tugas");
      }, 800);
    } catch (err) {
      console.error("Gagal membuat tugas:", err);
      setError(err?.message || "Gagal membuat tugas. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DATA TERPILIH
  // ======================================================

  const selectedKelasMapel = kelasMapel.find((item) => item.id === form.kelasMapelId);
  const namaKelas = selectedKelasMapel?.kelas?.namaKelas || selectedKelasMapel?.kelas?.nama || "-";
  const namaMapel =
    selectedKelasMapel?.mataPelajaran?.nama ||
    selectedKelasMapel?.mataPelajaran?.namaMapel ||
    selectedKelasMapel?.mataPelajaran?.nama_mata_pelajaran ||
    "-";

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      {/* SIDEBAR - fixed di kiri */}
      <div className="h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* MAIN CONTENT - flex column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER - fixed di atas */}
        <div className="flex-shrink-0">
          <Header
            title="Tambah Tugas"
            userName="Guru"
            userEmail="guru@smartschool.com"
            userInitial="GU"
          />
        </div>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-5xl">
            {/* HEADER */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.push("/guru/tugas")}
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft size={18} />
                Kembali ke Tugas
              </button>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Tambah Tugas</h1>
              <p className="mt-1 text-sm text-slate-500">Buat tugas baru untuk siswa.</p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Terjadi kesalahan</p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Berhasil</p>
                  <p className="mt-1 text-sm">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* FORM */}
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h2 className="font-semibold text-slate-900">Informasi Tugas</h2>
                          <p className="text-sm text-slate-500">Lengkapi informasi tugas.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                      {/* KELAS MAPEL */}
                      <div>
                        <label htmlFor="kelasMapelId" className="mb-2 block text-sm font-semibold text-slate-700">
                          Kelas & Mata Pelajaran
                          <span className="ml-1 text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <BookOpen
                            size={18}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <select
                            id="kelasMapelId"
                            name="kelasMapelId"
                            value={form.kelasMapelId}
                            onChange={handleChange}
                            disabled={loading || saving}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                          >
                            <option value="">
                              {loading ? "Memuat data..." : "Pilih kelas dan mata pelajaran"}
                            </option>
                            {kelasMapel.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.kelas?.namaKelas || item.kelas?.nama || "Kelas"} -{" "}
                                {item.mataPelajaran?.nama ||
                                  item.mataPelajaran?.namaMapel ||
                                  item.mataPelajaran?.nama_mata_pelajaran ||
                                  "Mata Pelajaran"}
                              </option>
                            ))}
                          </select>
                        </div>
                        {loading && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <Loader2 size={14} className="animate-spin" />
                            Mengambil data...
                          </div>
                        )}
                        {!loading && kelasMapel.length === 0 && (
                          <p className="mt-2 text-xs text-amber-600">
                            Belum ada kelas dan mata pelajaran yang kamu ampu.
                          </p>
                        )}
                      </div>

                      {/* JUDUL */}
                      <div>
                        <label htmlFor="judul" className="mb-2 block text-sm font-semibold text-slate-700">
                          Judul Tugas
                          <span className="ml-1 text-red-500">*</span>
                        </label>
                        <input
                          id="judul"
                          name="judul"
                          type="text"
                          value={form.judul}
                          onChange={handleChange}
                          disabled={saving}
                          maxLength={100}
                          placeholder="Contoh: Membuat Website Sederhana"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                        />
                        <div className="mt-1 flex justify-end">
                          <span className="text-xs text-slate-400">{form.judul.length}/100</span>
                        </div>
                      </div>

                      {/* DESKRIPSI */}
                      <div>
                        <label htmlFor="deskripsi" className="mb-2 block text-sm font-semibold text-slate-700">
                          Deskripsi Tugas
                        </label>
                        <textarea
                          id="deskripsi"
                          name="deskripsi"
                          value={form.deskripsi}
                          onChange={handleChange}
                          disabled={saving}
                          rows={6}
                          placeholder="Jelaskan tugas yang harus dikerjakan siswa..."
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                        />
                        <p className="mt-2 text-xs text-slate-400">
                          Jelaskan instruksi tugas dengan jelas.
                        </p>
                      </div>

                      {/* DEADLINE */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Deadline
                          <span className="ml-1 text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="tanggal" className="mb-2 block text-xs font-medium text-slate-500">
                              Tanggal
                            </label>
                            <div className="relative">
                              <Calendar
                                size={18}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                id="tanggal"
                                name="tanggal"
                                type="date"
                                value={form.tanggal}
                                onChange={handleChange}
                                disabled={saving}
                                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="waktu" className="mb-2 block text-xs font-medium text-slate-500">
                              Waktu
                            </label>
                            <div className="relative">
                              <Clock
                                size={18}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                id="waktu"
                                name="waktu"
                                type="time"
                                value={form.waktu}
                                onChange={handleChange}
                                disabled={saving}
                                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RINGKASAN */}
                <div className="lg:col-span-1">
                  <div className="space-y-5 lg:sticky lg:top-6">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">Ringkasan</h2>
                        <p className="mt-1 text-xs text-slate-500">Preview tugas</p>
                      </div>

                      <div className="space-y-5 p-5">
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <BookOpen size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">Kelas</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">{namaKelas}</p>
                            <p className="text-xs text-slate-500">{namaMapel}</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <FileText size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">Judul</p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                              {form.judul || "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <Clock size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">Deadline</p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                              {form.tanggal
                                ? new Date(`${form.tanggal}T${form.waktu}`).toLocaleString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-4">
                          <div className="flex gap-3">
                            <Users size={18} className="mt-0.5 shrink-0 text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-blue-900">Tugas untuk siswa</p>
                              <p className="mt-1 text-xs leading-5 text-blue-700">
                                Tugas akan diberikan kepada siswa pada kelas yang dipilih.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={saving || loading || kelasMapel.length === 0}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Simpan Tugas
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => router.push("/guru/tugas")}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}