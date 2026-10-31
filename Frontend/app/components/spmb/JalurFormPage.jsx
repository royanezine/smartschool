"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  FileCheck2,
  FileText,
  Loader2,
  MapPin,
  Route,
  Save,
  Sliders,
  Sparkles,
  Users,
} from "lucide-react";

import {
  hasPermission,
  subscribeAuth,
} from "@/lib/auth";
import {
  BERKAS_PPDB_OPTIONS,
  KATEGORI_JALUR_OPTIONS,
  METODE_RANKING_OPTIONS,
  createJalurPpdb,
  getJalurPpdbById,
  updateJalurPpdb,
} from "@/services/jalurPpdb.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryText = "text-[var(--color-primary)]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const NAMA_MIN = 2;
const NAMA_MAX = 50;
const DESKRIPSI_MAX = 2000;

function toDateInput(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

const FORM_KOSONG = {
  nama: "",
  deskripsi: "",
  kategori: "reguler",
  kuota: "",
  metodeRanking: "jarak",
  jarakMaksimalKm: "",
  nilaiMinimal: "",
  berkasWajib: ["KK", "AKTE", "IJAZAH"],
  tanggalMulai: "",
  tanggalSelesai: "",
  status: "aktif",
};

export default function JalurFormPage({ jalurId }) {
  const router = useRouter();
  const modeEdit = Boolean(jalurId);

  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState(FORM_KOSONG);
  const [loading, setLoading] = useState(modeEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [detailLoaded, setDetailLoaded] = useState(!modeEdit);

  const auth = useSyncExternalStore(
    subscribeAuth,
    () => {
      try {
        const raw = localStorage.getItem("auth");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    () => null
  );

  const canCreate = hasPermission(auth, "ppdb.create");
  const canUpdate = hasPermission(auth, "ppdb.update");

  const loadDetail = useCallback(async () => {
    if (!modeEdit || !jalurId) {
      setForm(FORM_KOSONG);
      setDetailLoaded(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setDetailLoaded(false);

      const response = await getJalurPpdbById(jalurId);
      const data = response?.data;

      if (!data) {
        throw new Error(
          response?.message || "Data jalur PPDB tidak ditemukan."
        );
      }

      setForm({
        nama: data.nama || "",
        deskripsi: data.deskripsi || "",
        kategori: data.kategori || "reguler",
        kuota:
          data.kuota === null || data.kuota === undefined
            ? ""
            : String(data.kuota),
        metodeRanking: data.metodeRanking || "jarak",
        jarakMaksimalKm:
          data.jarakMaksimalKm !== null && data.jarakMaksimalKm !== undefined
            ? String(data.jarakMaksimalKm)
            : "",
        nilaiMinimal:
          data.nilaiMinimal !== null && data.nilaiMinimal !== undefined
            ? String(data.nilaiMinimal)
            : "",
        berkasWajib:
          Array.isArray(data.berkasWajib) && data.berkasWajib.length > 0
            ? data.berkasWajib
            : ["KK", "AKTE", "IJAZAH"],
        tanggalMulai: toDateInput(data.tanggalMulai),
        tanggalSelesai: toDateInput(data.tanggalSelesai),
        status: String(data.status || "aktif").toLowerCase(),
      });

      setDetailLoaded(true);
    } catch (err) {
      console.error("GET DETAIL JALUR ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat detail jalur pendaftaran."
      );
    } finally {
      setLoading(false);
    }
  }, [jalurId, modeEdit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDetail();
  }, [loadDetail]);

  function ubah(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleBerkas(kode) {
    setForm((current) => {
      const exists = current.berkasWajib.includes(kode);
      let updated;
      if (exists) {
        updated = current.berkasWajib.filter((b) => b !== kode);
      } else {
        updated = [...current.berkasWajib, kode];
      }
      return {
        ...current,
        berkasWajib: updated,
      };
    });
  }

  function validateForm(f) {
    const nama = String(f.nama || "").trim();
    if (nama.length < NAMA_MIN) {
      return `Nama jalur minimal ${NAMA_MIN} karakter.`;
    }
    if (nama.length > NAMA_MAX) {
      return `Nama jalur maksimal ${NAMA_MAX} karakter.`;
    }

    if (!String(f.kuota).trim()) {
      return "Kuota jalur wajib diisi.";
    }
    const kuotaNum = Number(f.kuota);
    if (!Number.isFinite(kuotaNum) || kuotaNum <= 0) {
      return "Kuota harus berupa angka positif minimal 1.";
    }

    if (String(f.deskripsi || "").length > DESKRIPSI_MAX) {
      return `Deskripsi maksimal ${DESKRIPSI_MAX} karakter.`;
    }

    if (f.jarakMaksimalKm !== "" && f.jarakMaksimalKm !== null) {
      const jarakNum = Number(f.jarakMaksimalKm);
      if (Number.isNaN(jarakNum) || jarakNum < 0 || jarakNum > 1000) {
        return "Jarak maksimal radius harus berupa angka antara 0 dan 1000 km.";
      }
    }

    if (f.nilaiMinimal !== "" && f.nilaiMinimal !== null) {
      const nilaiNum = Number(f.nilaiMinimal);
      if (Number.isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
        return "Nilai minimal harus berupa angka antara 0 dan 100.";
      }
    }

    if (!Array.isArray(f.berkasWajib) || f.berkasWajib.length === 0) {
      return "Pilih minimal 1 berkas wajib yang harus diunggah calon siswa.";
    }

    if (f.tanggalMulai && f.tanggalSelesai) {
      const d1 = new Date(f.tanggalMulai);
      const d2 = new Date(f.tanggalSelesai);
      if (d2 < d1) {
        return "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
      }
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (modeEdit && !canUpdate) {
      setError(
        "Akses ditolak: akun ini tidak memiliki izin ppdb.update untuk mengubah jalur PPDB."
      );
      return;
    }

    if (!modeEdit && !canCreate) {
      setError(
        "Akses ditolak: akun ini tidak memiliki izin ppdb.create untuk menambah jalur PPDB."
      );
      return;
    }

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nama: form.nama.trim(),
        deskripsi: form.deskripsi.trim() || undefined,
        kategori: form.kategori,
        kuota: Math.floor(Number(form.kuota)),
        metodeRanking: form.metodeRanking,
        jarakMaksimalKm:
          form.jarakMaksimalKm !== "" && form.jarakMaksimalKm !== null
            ? Number(form.jarakMaksimalKm)
            : null,
        nilaiMinimal:
          form.nilaiMinimal !== "" && form.nilaiMinimal !== null
            ? Number(form.nilaiMinimal)
            : null,
        berkasWajib: form.berkasWajib,
        tanggalMulai: form.tanggalMulai || null,
        tanggalSelesai: form.tanggalSelesai || null,
        status: form.status || "aktif",
      };

      if (modeEdit) {
        await updateJalurPpdb(jalurId, payload);
      } else {
        await createJalurPpdb(payload);
      }

      router.push("/admin/spmb/jalur");
    } catch (err) {
      console.error("SIMPAN JALUR ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan jalur PPDB."
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((v) => !v)}
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
            <Link
              href="/admin/spmb/jalur"
              className="theme-text-muted mb-4 inline-flex items-center gap-2 text-xs font-semibold transition hover:opacity-70"
            >
              <ArrowLeft size={14} />
              Kembali ke Daftar Jalur
            </Link>

            <div className="mb-6 flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]`}
              >
                <Route size={22} />
              </div>
              <div>
                <h1 className="theme-text text-xl font-bold sm:text-2xl">
                  {modeEdit ? "Edit Jalur Pendaftaran" : "Tambah Jalur Pendaftaran"}
                </h1>
                <p className="theme-text-muted mt-1 text-xs sm:text-sm">
                  {modeEdit
                    ? "Perbarui konfigurasi kategori, kuota, metode seleksi, dan berkas wajib jalur PPDB."
                    : "Konfigurasikan jalur seleksi penerimaan peserta didik baru terintegrasi backend."}
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

            {loading ? (
              <div className="theme-card theme-border flex min-h-[350px] items-center justify-center rounded-2xl border">
                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
                  <span>Memuat data jalur dari server...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informasi Pokok Jalur */}
                <div className="theme-card theme-border rounded-2xl border p-5 sm:p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b theme-border pb-3">
                    <Sliders size={18} className="text-[var(--color-primary)]" />
                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Informasi Utama Jalur
                      </h2>
                      <p className="text-xs theme-text-muted">
                        Nama, kategori penerimaan, daya tampung kuota, dan status
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Nama Jalur */}
                    <div>
                      <label
                        htmlFor="nama"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Nama Jalur <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <input
                        id="nama"
                        type="text"
                        value={form.nama}
                        onChange={(e) => ubah("nama", e.target.value)}
                        placeholder="Contoh: Jalur Zonasi Domisili"
                        maxLength={NAMA_MAX}
                        required
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none`}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* Kategori Jalur */}
                      <div>
                        <label
                          htmlFor="kategori"
                          className="text-xs font-semibold theme-text mb-1 block"
                        >
                          Kategori Seleksi <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <select
                          id="kategori"
                          value={form.kategori}
                          onChange={(e) => ubah("kategori", e.target.value)}
                          className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none cursor-pointer`}
                        >
                          {KATEGORI_JALUR_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Kuota Penerimaan */}
                      <div>
                        <label
                          htmlFor="kuota"
                          className="text-xs font-semibold theme-text mb-1 block"
                        >
                          Kuota Siswa <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                          id="kuota"
                          type="number"
                          min="1"
                          value={form.kuota}
                          onChange={(e) => ubah("kuota", e.target.value)}
                          placeholder="Contoh: 100"
                          required
                          className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none`}
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label
                          htmlFor="status"
                          className="text-xs font-semibold theme-text mb-1 block"
                        >
                          Status Operasional <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <select
                          id="status"
                          value={form.status}
                          onChange={(e) => ubah("status", e.target.value)}
                          className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none cursor-pointer`}
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <label
                        htmlFor="deskripsi"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Deskripsi / Keterangan Jalur
                      </label>
                      <textarea
                        id="deskripsi"
                        rows={3}
                        value={form.deskripsi}
                        onChange={(e) => ubah("deskripsi", e.target.value)}
                        placeholder="Uraian kriteria, petunjuk singkat pendaftaran, atau keterangan lainnya..."
                        maxLength={DESKRIPSI_MAX}
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none`}
                      />
                    </div>
                  </div>
                </div>

                {/* Metode Seleksi & Parameter Ranking */}
                <div className="theme-card theme-border rounded-2xl border p-5 sm:p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b theme-border pb-3">
                    <Sparkles size={18} className="text-[var(--color-primary)]" />
                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Metode Seleksi & Ranking
                      </h2>
                      <p className="text-xs theme-text-muted">
                        Aturan penentuan urutan kelulusan seleksi dan ambang batas
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Metode Ranking */}
                    <div>
                      <label
                        htmlFor="metodeRanking"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Metode Pemeringkatan
                      </label>
                      <select
                        id="metodeRanking"
                        value={form.metodeRanking}
                        onChange={(e) => ubah("metodeRanking", e.target.value)}
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none cursor-pointer`}
                      >
                        {METODE_RANKING_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] theme-text-muted">
                        Dasar pengurutan calon siswa
                      </p>
                    </div>

                    {/* Jarak Maksimal (Km) */}
                    <div>
                      <label
                        htmlFor="jarakMaksimalKm"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Radius Maksimal (Km)
                      </label>
                      <input
                        id="jarakMaksimalKm"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1000"
                        value={form.jarakMaksimalKm}
                        onChange={(e) => ubah("jarakMaksimalKm", e.target.value)}
                        placeholder="Contoh: 5 (opsional)"
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none`}
                      />
                      <p className="mt-1 text-[11px] theme-text-muted">
                        Kosongkan jika tidak dibatasi radius
                      </p>
                    </div>

                    {/* Nilai Minimal */}
                    <div>
                      <label
                        htmlFor="nilaiMinimal"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Ambang Nilai Minimal
                      </label>
                      <input
                        id="nilaiMinimal"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={form.nilaiMinimal}
                        onChange={(e) => ubah("nilaiMinimal", e.target.value)}
                        placeholder="Contoh: 75.0 (opsional)"
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none`}
                      />
                      <p className="mt-1 text-[11px] theme-text-muted">
                        Syarat nilai minimal rapor / prestasi
                      </p>
                    </div>
                  </div>
                </div>

                {/* Berkas Wajib */}
                <div className="theme-card theme-border rounded-2xl border p-5 sm:p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b theme-border pb-3">
                    <FileCheck2 size={18} className="text-[var(--color-primary)]" />
                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Persyaratan Berkas Wajib <span className="text-[var(--color-danger)]">*</span>
                      </h2>
                      <p className="text-xs theme-text-muted">
                        Dokumen yang harus diunggah pendaftar untuk verifikasi kelulusan
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {BERKAS_PPDB_OPTIONS.map((item) => {
                      const isChecked = form.berkasWajib.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleBerkas(item.value)}
                          className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                            isChecked
                              ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                              : "theme-border hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // dikontrol oleh onClick button
                            className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer pointer-events-none"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold theme-text block truncate">
                              {item.label}
                            </span>
                            <span className="text-[11px] theme-text-muted block font-mono">
                              Kode: {item.value}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Periode Pendaftaran */}
                <div className="theme-card theme-border rounded-2xl border p-5 sm:p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b theme-border pb-3">
                    <CalendarDays size={18} className="text-[var(--color-primary)]" />
                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Jadwal & Periode Pendaftaran
                      </h2>
                      <p className="text-xs theme-text-muted">
                        Rentang tanggal buka dan penutupan pendaftaran jalur ini (opsional)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="tanggalMulai"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Tanggal Mulai
                      </label>
                      <input
                        id="tanggalMulai"
                        type="date"
                        value={form.tanggalMulai}
                        onChange={(e) => ubah("tanggalMulai", e.target.value)}
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none cursor-pointer`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="tanggalSelesai"
                        className="text-xs font-semibold theme-text mb-1 block"
                      >
                        Tanggal Selesai
                      </label>
                      <input
                        id="tanggalSelesai"
                        type="date"
                        value={form.tanggalSelesai}
                        onChange={(e) => ubah("tanggalSelesai", e.target.value)}
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 text-xs theme-text ${themeFocus} outline-none cursor-pointer`}
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Simpan */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link
                    href="/admin/spmb/jalur"
                    className="rounded-xl border theme-border px-4 py-2.5 text-xs font-semibold theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition"
                  >
                    Batal
                  </Link>

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
                        <span>{modeEdit ? "Perbarui Jalur" : "Buat Jalur PPDB"}</span>
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
