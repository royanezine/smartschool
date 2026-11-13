"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getSiswaPrestasi,
  getKelasPrestasi,
  createPrestasi,
} from "@/services/prestasi.service";

import {
  ArrowLeft,
  Trophy,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Info,
  UserRound,
  GraduationCap,
  CalendarDays,
  Building2,
  FileText,
  Link2,
  Award,
} from "lucide-react";

const TINGKAT_OPTIONS = [
  "Kabupaten/Kota",
  "Provinsi",
  "Nasional",
  "Internasional",
];

const BULAN_OPTIONS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const JUARA_OPTIONS = [
  "Juara 1",
  "Juara 2",
  "Juara 3",
  "Harapan 1",
  "Harapan 2",
  "Harapan 3",
  "Peserta Terbaik",
  "Finalis",
  "Peserta",
];

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";
const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";
const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";
const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";
const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";
const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";
const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const getResponseData = (response) => {
  let result = response;
  for (let i = 0; i < 4; i++) {
    if (
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      Object.prototype.hasOwnProperty.call(result, "data")
    ) {
      result = result.data;
    } else break;
  }
  return result;
};

const getArrayData = (response) => {
  const result = getResponseData(response);
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object") {
    for (const key of ["items", "users", "pengguna", "siswa", "kelas", "results"]) {
      if (Array.isArray(result[key])) return result[key];
    }
  }
  return [];
};

const emptyForm = {
  siswaId: "",
  kelasId: "",
  namaLomba: "",
  tingkat: "Kabupaten/Kota",
  juara: "Juara 1",
  bulan: "Januari",
  tahun: new Date().getFullYear(),
  penyelenggara: "",
  keterangan: "",
  sertifikatUrl: "",
};

export default function TambahPrestasiPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [siswaList, setSiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [siswaRes, kelasRes] = await Promise.all([
          getSiswaPrestasi(),
          getKelasPrestasi(),
        ]);
        if (!active) return;
        setSiswaList(getArrayData(siswaRes));
        setKelasList(getArrayData(kelasRes));
      } catch (err) {
        if (active) {
          setError(err?.message || "Gagal memuat data siswa/kelas.");
        }
      } finally {
        if (active) setLoadingMeta(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (saved) setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError("");

    if (!form.siswaId) return setError("Silakan pilih siswa terlebih dahulu.");
    if (!form.namaLomba.trim()) return setError("Nama lomba wajib diisi.");
    if (!form.penyelenggara.trim()) return setError("Penyelenggara wajib diisi.");

    const tahun = Number(form.tahun);
    if (!Number.isInteger(tahun) || tahun < 1900 || tahun > 2100) {
      return setError("Tahun prestasi tidak valid.");
    }

    const payload = {
      siswaId: form.siswaId,
      kelasId: form.kelasId || null,
      namaLomba: form.namaLomba.trim(),
      tingkat: form.tingkat,
      juara: form.juara,
      bulan: form.bulan || null,
      tahun,
      penyelenggara: form.penyelenggara.trim(),
      keterangan: form.keterangan.trim() || null,
      sertifikatUrl: form.sertifikatUrl.trim() || null,
    };

    try {
      setSaving(true);
      await createPrestasi(payload);
      setSaved(true);
      setTimeout(() => {
        router.push("/admin/akademik/prestasi");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err?.message || "Gagal menyimpan prestasi.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (saving) return;
    router.push("/admin/akademik/prestasi");
  };

  const selectedSiswa = siswaList.find((s) => s.id === form.siswaId);
  const selectedKelas = kelasList.find((k) => k.id === form.kelasId);

  const inputBase = `w-full h-11 rounded-xl border px-4 text-sm font-medium outline-none transition ${themeNeutralBorder} ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60 theme-input`;
  const labelClass = "theme-text-secondary mb-2 block text-sm font-semibold";

  return (
    <div className="theme-page h-screen w-full overflow-hidden">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="akademikPrestasi"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />
      </div>

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 pb-12 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7 xl:px-10 2xl:px-12">
            <div className="mb-6">
              <Link
                href="/admin/akademik/prestasi"
                className="theme-text-secondary group mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:text-[var(--color-primary)]"
              >
                <ArrowLeft
                  size={17}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                Kembali ke Prestasi
              </Link>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                    Tambah Prestasi
                  </h1>
                  <p className="theme-text-secondary mt-1.5 max-w-2xl text-sm leading-6">
                    Catat prestasi baru siswa dari berbagai tingkat perlombaan.
                  </p>
                </div>

                <div
                  className={`theme-card ${themeDivider} ${themeSmallShadow} hidden shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 sm:flex`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} theme-primary`}
                  >
                    <Trophy size={19} />
                  </div>
                  <div>
                    <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                      Modul
                    </p>
                    <p className="theme-text mt-0.5 text-sm font-semibold">
                      Prestasi Siswa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} theme-danger ${themeSmallShadow}`}
                >
                  <AlertCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="theme-text text-sm font-bold">Gagal menyimpan</p>
                  <p className="theme-text-secondary mt-1 text-sm leading-5">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="theme-text-muted rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] hover:text-[var(--color-text)]"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {saved && (
              <div
                className={`mb-5 flex items-center gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeSuccessSurface} theme-success ${themeSmallShadow}`}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="theme-success text-sm font-bold">
                    Prestasi berhasil ditambahkan
                  </p>
                  <p className="theme-success mt-0.5 text-xs">
                    Mengalihkan ke daftar prestasi...
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
              <form onSubmit={handleSubmit} className="min-w-0">
                <div
                  className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-3xl border`}
                >
                  <div
                    className={`border-b ${themeDivider} ${themeInfoSurface} px-5 py-5 sm:px-7`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                        >
                          <Trophy size={20} />
                        </div>
                        <div className="min-w-0">
                          <h2 className="theme-text text-sm font-bold">
                            Informasi Prestasi
                          </h2>
                          <p className="theme-text-secondary mt-0.5 text-xs">
                            Lengkapi data prestasi siswa.
                          </p>
                        </div>
                      </div>
                      <span className="hidden rounded-full border border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] px-3 py-1.5 text-[10px] font-bold tracking-wide theme-primary sm:inline-flex">
                        DATA PRESTASI
                      </span>
                    </div>
                  </div>

                  <div className="space-y-7 p-5 sm:p-7">
                    <section>
                      <div className="mb-5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                          <h3 className="theme-text text-sm font-bold">
                            Identitas Siswa
                          </h3>
                        </div>
                        <p className="theme-text-muted mt-1.5 text-xs">
                          Pilih siswa yang meraih prestasi.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="siswaId" className={labelClass}>
                            Nama Siswa <span className="theme-danger">*</span>
                          </label>
                          <div className="relative">
                            <UserRound
                              size={18}
                              className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                            />
                            <select
                              id="siswaId"
                              value={form.siswaId}
                              onChange={(e) => handleChange("siswaId", e.target.value)}
                              disabled={saving || loadingMeta}
                              className={`${inputBase} appearance-none pl-11`}
                            >
                              <option value="">
                                {loadingMeta ? "Memuat siswa..." : "Pilih siswa"}
                              </option>
                              {siswaList.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.namaLengkap}
                                  {s.nisn ? ` - ${s.nisn}` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="kelasId" className={labelClass}>
                            Kelas <span className="theme-text-muted font-normal">(opsional)</span>
                          </label>
                          <div className="relative">
                            <GraduationCap
                              size={18}
                              className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                            />
                            <select
                              id="kelasId"
                              value={form.kelasId}
                              onChange={(e) => handleChange("kelasId", e.target.value)}
                              disabled={saving || loadingMeta}
                              className={`${inputBase} appearance-none pl-11`}
                            >
                              <option value="">Pilih kelas</option>
                              {kelasList.map((k) => (
                                <option key={k.id} value={k.id}>
                                  {k.nama}
                                  {k.tingkat ? ` - Tingkat ${k.tingkat}` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className={`border-t ${themeDivider} pt-7`}>
                      <div className="mb-5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                          <h3 className="theme-text text-sm font-bold">
                            Detail Perlombaan
                          </h3>
                        </div>
                        <p className="theme-text-muted mt-1.5 text-xs">
                          Informasi lomba dan pencapaian siswa.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="namaLomba" className={labelClass}>
                            Nama Lomba <span className="theme-danger">*</span>
                          </label>
                          <input
                            id="namaLomba"
                            type="text"
                            maxLength={200}
                            value={form.namaLomba}
                            onChange={(e) => handleChange("namaLomba", e.target.value)}
                            disabled={saving}
                            placeholder="Contoh: LKS Web Technology"
                            className={inputBase}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="tingkat" className={labelClass}>
                              Tingkat <span className="theme-danger">*</span>
                            </label>
                            <select
                              id="tingkat"
                              value={form.tingkat}
                              onChange={(e) => handleChange("tingkat", e.target.value)}
                              disabled={saving}
                              className={`${inputBase} appearance-none`}
                            >
                              {TINGKAT_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="juara" className={labelClass}>
                              Juara <span className="theme-danger">*</span>
                            </label>
                            <select
                              id="juara"
                              value={form.juara}
                              onChange={(e) => handleChange("juara", e.target.value)}
                              disabled={saving}
                              className={`${inputBase} appearance-none`}
                            >
                              {JUARA_OPTIONS.map((j) => (
                                <option key={j} value={j}>
                                  {j}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="bulan" className={labelClass}>
                              Bulan
                            </label>
                            <div className="relative">
                              <CalendarDays
                                size={18}
                                className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                              />
                              <select
                                id="bulan"
                                value={form.bulan}
                                onChange={(e) => handleChange("bulan", e.target.value)}
                                disabled={saving}
                                className={`${inputBase} appearance-none pl-11`}
                              >
                                {BULAN_OPTIONS.map((b) => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label htmlFor="tahun" className={labelClass}>
                              Tahun <span className="theme-danger">*</span>
                            </label>
                            <input
                              id="tahun"
                              type="number"
                              min="1900"
                              max="2100"
                              value={form.tahun}
                              onChange={(e) => handleChange("tahun", e.target.value)}
                              disabled={saving}
                              className={inputBase}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="penyelenggara" className={labelClass}>
                            Penyelenggara <span className="theme-danger">*</span>
                          </label>
                          <div className="relative">
                            <Building2
                              size={18}
                              className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                            />
                            <input
                              id="penyelenggara"
                              type="text"
                              maxLength={200}
                              value={form.penyelenggara}
                              onChange={(e) => handleChange("penyelenggara", e.target.value)}
                              disabled={saving}
                              placeholder="Contoh: Dinas Pendidikan"
                              className={`${inputBase} pl-11`}
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className={`border-t ${themeDivider} pt-7`}>
                      <div className="mb-5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                          <h3 className="theme-text text-sm font-bold">
                            Keterangan Tambahan
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="keterangan" className={labelClass}>
                            Keterangan
                          </label>
                          <textarea
                            id="keterangan"
                            rows={3}
                            value={form.keterangan}
                            onChange={(e) => handleChange("keterangan", e.target.value)}
                            disabled={saving}
                            placeholder="Tambahkan keterangan prestasi..."
                            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition resize-none ${themeNeutralBorder} ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60 theme-input`}
                          />
                        </div>

                        <div>
                          <label htmlFor="sertifikatUrl" className={labelClass}>
                            URL Sertifikat
                          </label>
                          <div className="relative">
                            <Link2
                              size={18}
                              className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                            />
                            <input
                              id="sertifikatUrl"
                              type="url"
                              maxLength={255}
                              value={form.sertifikatUrl}
                              onChange={(e) => handleChange("sertifikatUrl", e.target.value)}
                              disabled={saving}
                              placeholder="https://..."
                              className={`${inputBase} pl-11`}
                            />
                          </div>
                          <p className="theme-text-muted mt-2 text-xs">
                            Masukkan tautan sertifikat yang dapat diakses.
                          </p>
                        </div>
                      </div>
                    </section>

                    <div
                      className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeCardShadow} theme-primary`}
                        >
                          <Info size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="theme-text text-sm font-bold">Informasi</p>
                          <p className="theme-text-secondary mt-1 text-xs leading-5">
                            Pastikan data prestasi yang diisi sudah benar sebelum disimpan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex flex-col-reverse gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-4 sm:flex-row sm:justify-end sm:px-7`}
                  >
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className={`theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-5 text-sm font-semibold transition ${themeNeutralHover} hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <X size={17} /> Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving || loadingMeta || siswaList.length === 0}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-[var(--color-card)] transition-all ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-[1.04] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={17} className="animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={17} /> Simpan Prestasi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <aside className="min-w-0 xl:sticky xl:top-6">
                <div
                  className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-3xl border`}
                >
                  <div className={`border-b ${themeDivider} px-5 py-5`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)]`}
                      >
                        <Award size={18} />
                      </div>
                      <div>
                        <h2 className="theme-text text-sm font-bold">
                          Preview Prestasi
                        </h2>
                        <p className="theme-text-muted mt-0.5 text-xs">
                          Ringkasan data sebelum disimpan
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div
                      className={`relative overflow-hidden rounded-2xl p-5 ${themePrimaryGradient}`}
                    >
                      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] blur-3xl" />
                      <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-[color-mix(in_srgb,var(--color-info)_18%,transparent)] blur-3xl" />

                      <div className="relative">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] text-[var(--color-card)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_14%,transparent)]">
                            <Trophy size={20} />
                          </div>
                          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--color-card)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_14%,transparent)]">
                            {form.juara}
                          </span>
                        </div>

                        <div className="mt-6">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--color-card)_78%,var(--color-primary))]">
                            Prestasi Siswa
                          </p>
                          <h3 className="mt-2 min-h-[56px] break-words text-lg font-bold leading-6 text-[var(--color-card)]">
                            {form.namaLomba.trim() || "Nama Lomba"}
                          </h3>
                          <div className="mt-3 flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-card)_68%,transparent)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-card)]" />
                            <span>{form.tingkat}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-4 overflow-hidden rounded-2xl border ${themeNeutralBorder}`}
                    >
                      <div
                        className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-4`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} theme-primary`}
                        >
                          <UserRound size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Siswa
                          </p>
                          <p className="theme-text mt-0.5 break-words text-sm font-semibold">
                            {selectedSiswa?.namaLengkap || "Belum dipilih"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-4`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} theme-primary`}
                        >
                          <GraduationCap size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Kelas
                          </p>
                          <p className="theme-text mt-0.5 break-words text-sm font-semibold">
                            {selectedKelas?.nama || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 px-4 py-4">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} theme-primary`}
                        >
                          <CalendarDays size={15} />
                        </div>
                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Waktu
                          </p>
                          <p className="theme-text mt-0.5 text-sm font-semibold">
                            {form.bulan} {form.tahun}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-4 rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Info size={15} className="theme-primary-text mt-0.5 shrink-0" />
                        <p className="theme-text-secondary text-[11px] leading-5">
                          Preview mengikuti perubahan data secara otomatis.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border-t ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={15} className="theme-success shrink-0" />
                      <p className="theme-text-secondary text-[11px] leading-4">
                        Data siap disimpan ke daftar prestasi.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <div className={`mt-7 border-t ${themeDivider} pt-5 text-center`}>
              <p className="theme-text-muted text-xs">
                © 2026 SmartSchool • Modul Prestasi Siswa
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}