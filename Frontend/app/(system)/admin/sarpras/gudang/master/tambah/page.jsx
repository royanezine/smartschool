
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Warehouse,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  CircleCheck,
  CircleAlert,
  Building2,
  FileText,
  X,
  Layers,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { createGudang } from "@/services/sarpras.service";
import {
  getGedung,
  getLantaiByGedung,
} from "@/services/infrastruktur.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-danger)_7%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger)_22%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

function extractList(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

export default function TambahMasterGudangPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [gedungList, setGedungList] = useState([]);
  const [lantaiList, setLantaiList] = useState([]);

  const [selectedGedung, setSelectedGedung] = useState("");
  const [selectedLantai, setSelectedLantai] = useState("");

  const [loadingGedung, setLoadingGedung] = useState(true);
  const [loadingLantai, setLoadingLantai] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    keterangan: "",
  });

  useEffect(() => {
    let active = true;

    async function loadGedung() {
      try {
        setLoadingGedung(true);

        const response = await getGedung();

        if (!active) return;

        setGedungList(extractList(response));
      } catch (err) {
        console.error("Gagal mengambil data gedung:", err);

        if (active) {
          setError(
            err?.message || "Gagal mengambil data gedung."
          );
        }
      } finally {
        if (active) {
          setLoadingGedung(false);
        }
      }
    }

    loadGedung();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadLantai() {
      if (!selectedGedung) {
        setLantaiList([]);
        setSelectedLantai("");
        return;
      }

      try {
        setLoadingLantai(true);
        setLantaiList([]);
        setSelectedLantai("");

        const response = await getLantaiByGedung(selectedGedung);

        if (!active) return;

        setLantaiList(extractList(response));
      } catch (err) {
        console.error("Gagal mengambil data lantai:", err);

        if (active) {
          setLantaiList([]);
          setError(
            err?.message || "Gagal mengambil data lantai."
          );
        }
      } finally {
        if (active) {
          setLoadingLantai(false);
        }
      }
    }

    loadLantai();

    return () => {
      active = false;
    };
  }, [selectedGedung]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  }

  function handleGedungChange(e) {
    setSelectedGedung(e.target.value);
    setSelectedLantai("");
    setError("");
  }

  function handleLantaiChange(e) {
    setSelectedLantai(e.target.value);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving || saved) return;

    setError("");

    const nama = form.nama.trim();
    const keterangan = form.keterangan.trim();

    const gedungTerpilih = gedungList.find(
      (item) => String(item.id) === String(selectedGedung)
    );

    const lantaiTerpilih = lantaiList.find(
      (item) => String(item.id) === String(selectedLantai)
    );

    if (!nama) {
      setError("Nama gudang wajib diisi.");
      return;
    }

    if (nama.length > 100) {
      setError("Nama gudang maksimal 100 karakter.");
      return;
    }

    if (!selectedGedung || !gedungTerpilih) {
      setError("Gedung wajib dipilih.");
      return;
    }

    if (!selectedLantai || !lantaiTerpilih) {
      setError("Lantai wajib dipilih.");
      return;
    }

    if (loadingLantai) {
      setError("Mohon tunggu hingga data lantai selesai dimuat.");
      return;
    }

    const lokasi = [
      gedungTerpilih.nama,
      lantaiTerpilih.nama,
    ]
      .filter(Boolean)
      .join(" - ");

    try {
      setSaving(true);

      await createGudang({
        nama,
        lokasi,
        keterangan: keterangan || null,
      });

      setSaved(true);

      setTimeout(() => {
        router.push("/admin/sarpras/gudang/master");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Gagal membuat gudang:", err);

      setError(
        err?.message || "Gagal menyimpan gudang. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleSidebar() {
    setIsCollapsed((current) => !current);
  }

  const gedungTerpilih = gedungList.find(
    (item) => String(item.id) === String(selectedGedung)
  );

  const lantaiTerpilih = lantaiList.find(
    (item) => String(item.id) === String(selectedLantai)
  );

  const lokasiPreview = [
    gedungTerpilih?.nama,
    lantaiTerpilih?.nama,
  ]
    .filter(Boolean)
    .join(" - ");

  const isFormComplete = Boolean(
    form.nama.trim() &&
    selectedGedung &&
    selectedLantai
  );

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
            <Link
              href="/admin/sarpras/gudang/master"
              className={`inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} ${themePrimaryText}`}
            >
              <ArrowLeft size={18} />
              Kembali ke Master Gudang
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-3 py-1 text-xs font-semibold`}
                  >
                    SARPRAS
                  </span>

                  <span className="theme-text-muted text-xs">
                    Master Gudang
                  </span>
                </div>

                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                  Tambah Gudang
                </h1>

                <p className="theme-text-muted mt-1 max-w-2xl text-sm leading-6">
                  Tambahkan data gudang untuk mengelola lokasi penyimpanan
                  aset dan perlengkapan sekolah.
                </p>
              </div>

              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} ${themeSmallShadow}`}
              >
                <Warehouse size={27} />
              </div>
            </div>

            {error && (
              <div
                className={`flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3.5 text-sm`}
              >
                <AlertCircle
                  size={20}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="theme-danger font-semibold">
                    Gagal Menyimpan Gudang
                  </p>
                  <p className="theme-danger mt-0.5">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="theme-danger rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"
                  aria-label="Tutup pesan kesalahan"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {saved && (
              <div
                className={`flex items-center gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} px-4 py-3.5 text-sm font-semibold theme-success`}
              >
                <CheckCircle2 size={21} />
                Gudang berhasil ditambahkan. Mengalihkan ke daftar gudang...
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <form onSubmit={handleSubmit}>
                <div
                  className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div className={`border-b ${themeDivider} px-5 py-5 sm:px-7`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <Warehouse size={21} />
                      </div>

                      <div>
                        <h2 className="theme-text text-base font-bold sm:text-lg">
                          Informasi Gudang
                        </h2>
                        <p className="theme-text-muted mt-0.5 text-sm">
                          Isi informasi sesuai data gudang sekolah.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 px-5 py-6 sm:px-7">
                    <div>
                      <label
                        htmlFor="nama"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Nama Gudang
                        <span className="theme-danger ml-1">*</span>
                      </label>

                      <div className="relative">
                        <Warehouse
                          size={18}
                          className="theme-text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                        />

                        <input
                          id="nama"
                          type="text"
                          name="nama"
                          value={form.nama}
                          onChange={handleChange}
                          maxLength={100}
                          autoComplete="off"
                          required
                          placeholder="Contoh: Gudang Utama"
                          className={`theme-input h-12 w-full rounded-xl border ${themeNeutralBorder} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                        />
                      </div>

                      <div className="mt-1.5 flex items-center justify-between gap-3">
                        <p className="theme-text-muted text-xs">
                          Nama gudang wajib diisi.
                        </p>
                        <span className="theme-text-muted shrink-0 text-xs font-medium">
                          {form.nama.length}/100
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="gedung"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Gedung
                        <span className="theme-danger ml-1">*</span>
                      </label>

                      <div className="relative">
                        <Building2
                          size={18}
                          className="theme-text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                        />

                        <select
                          id="gedung"
                          value={selectedGedung}
                          onChange={handleGedungChange}
                          disabled={loadingGedung || saving || saved}
                          required
                          className={`theme-input h-12 w-full appearance-none rounded-xl border ${themeNeutralBorder} pl-11 pr-10 text-sm font-medium outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <option value="">
                            {loadingGedung
                              ? "Memuat data gedung..."
                              : gedungList.length === 0
                                ? "Belum ada data gedung"
                                : "Pilih Gedung"}
                          </option>

                          {gedungList.map((gedung) => (
                            <option key={gedung.id} value={gedung.id}>
                              {gedung.nama}
                              {gedung.kode ? ` (${gedung.kode})` : ""}
                            </option>
                          ))}
                        </select>

                        <span className="theme-text-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                          <icon-placeholder />
                        </span>
                      </div>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Pilih gedung tempat gudang berada.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="lantai"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Lantai
                        <span className="theme-danger ml-1">*</span>
                      </label>

                      <div className="relative">
                        <Layers
                          size={18}
                          className="theme-text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                        />

                        <select
                          id="lantai"
                          value={selectedLantai}
                          onChange={handleLantaiChange}
                          disabled={
                            !selectedGedung ||
                            loadingLantai ||
                            lantaiList.length === 0 ||
                            saving ||
                            saved
                          }
                          required
                          className={`theme-input h-12 w-full appearance-none rounded-xl border ${themeNeutralBorder} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <option value="">
                            {!selectedGedung
                              ? "Pilih gedung terlebih dahulu"
                              : loadingLantai
                                ? "Memuat data lantai..."
                                : lantaiList.length === 0
                                  ? "Belum ada lantai pada gedung ini"
                                  : "Pilih Lantai"}
                          </option>

                          {lantaiList.map((lantai) => (
                            <option key={lantai.id} value={lantai.id}>
                              {lantai.nama}
                              {lantai.kode ? ` (${lantai.kode})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Daftar lantai menyesuaikan gedung yang dipilih.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="keterangan"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Keterangan
                      </label>

                      <div className="relative">
                        <FileText
                          size={18}
                          className="theme-text-muted pointer-events-none absolute left-4 top-4"
                        />

                        <textarea
                          id="keterangan"
                          name="keterangan"
                          value={form.keterangan}
                          onChange={handleChange}
                          rows={4}
                          maxLength={1000}
                          placeholder="Contoh: Digunakan untuk menyimpan perlengkapan belajar dan alat tulis."
                          className={`theme-input w-full resize-y rounded-xl border ${themeNeutralBorder} py-3 pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                        />
                      </div>

                      <div className="mt-1.5 flex items-center justify-between gap-3">
                        <p className="theme-text-muted text-xs">
                          Keterangan tambahan mengenai gudang.
                        </p>
                        <span className="theme-text-muted shrink-0 text-xs font-medium">
                          {form.keterangan.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex flex-col-reverse gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-5 sm:flex-row sm:justify-end sm:px-7`}
                  >
                    <Link
                      href="/admin/sarpras/gudang/master"
                      className={`theme-card theme-text-secondary inline-flex h-11 items-center justify-center rounded-xl border ${themeNeutralBorder} px-5 text-sm font-semibold transition ${themeNeutralHover}`}
                    >
                      Batal
                    </Link>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        saved ||
                        loadingGedung ||
                        loadingLantai ||
                        !isFormComplete
                      }
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none`}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Simpan Gudang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <aside className="space-y-5">
                <div
                  className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} xl:sticky xl:top-6`}
                >
                  <div
                    className={`border-b ${themeDivider} ${themePrimarySoft} px-5 py-5`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${themePrimaryText}`}>
                          Preview
                        </p>
                        <h3 className="theme-text mt-1 text-lg font-bold">
                          Data Gudang
                        </h3>
                      </div>

                      <div
                        className={`theme-card flex h-11 w-11 items-center justify-center rounded-xl ${themePrimaryText} ${themeCardShadow}`}
                      >
                        <Building2 size={21} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div
                      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                    >
                      <p className="theme-text-muted mb-1 text-xs font-semibold uppercase tracking-wide">
                        Nama Gudang
                      </p>
                      <p
                        className={`break-words text-base font-bold ${
                          form.nama.trim()
                            ? "theme-text"
                            : "theme-text-placeholder"
                        }`}
                      >
                        {form.nama.trim() || "Nama gudang belum diisi"}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                      >
                        <MapPin size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="theme-text-muted text-xs font-medium">
                          Lokasi Gudang
                        </p>
                        <p
                          className={`mt-0.5 break-words text-sm font-semibold ${
                            lokasiPreview
                              ? "theme-text-secondary"
                              : "theme-text-placeholder"
                          }`}
                        >
                          {lokasiPreview || "Belum ditentukan"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                      >
                        <FileText size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="theme-text-muted text-xs font-medium">
                          Keterangan
                        </p>
                        <p
                          className={`mt-0.5 break-words text-sm ${
                            form.keterangan.trim()
                              ? "theme-text-secondary"
                              : "theme-text-placeholder"
                          }`}
                        >
                          {form.keterangan.trim() || "Belum ada keterangan"}
                        </p>
                      </div>
                    </div>

                    <div className={`border-t ${themeDivider}`} />

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="theme-text-secondary text-sm font-semibold">
                          Kelengkapan Data
                        </p>
                        <span
                          className={`text-xs font-bold ${
                            isFormComplete
                              ? "theme-success"
                              : "theme-text-muted"
                          }`}
                        >
                          {isFormComplete ? "Lengkap" : "Belum lengkap"}
                        </span>
                      </div>

                      <div
                        className={`h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFormComplete
                              ? "w-full bg-[var(--color-success)]"
                              : "w-0"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        {form.nama.trim() ? (
                          <CircleCheck size={17} className="theme-success shrink-0" />
                        ) : (
                          <CircleAlert size={17} className="theme-text-placeholder shrink-0" />
                        )}
                        <span className={`text-xs ${form.nama.trim() ? "theme-text-secondary font-medium" : "theme-text-muted"}`}>
                          Nama gudang wajib diisi
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {selectedGedung ? (
                          <CircleCheck size={17} className="theme-success shrink-0" />
                        ) : (
                          <CircleAlert size={17} className="theme-text-placeholder shrink-0" />
                        )}
                        <span className="theme-text-muted text-xs">
                          Gedung wajib dipilih
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {selectedLantai ? (
                          <CircleCheck size={17} className="theme-success shrink-0" />
                        ) : (
                          <CircleAlert size={17} className="theme-text-placeholder shrink-0" />
                        )}
                        <span className="theme-text-muted text-xs">
                          Lantai wajib dipilih
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {form.keterangan.trim() ? (
                          <CircleCheck size={17} className="theme-success shrink-0" />
                        ) : (
                          <CircleAlert size={17} className="theme-text-placeholder shrink-0" />
                        )}
                        <span className="theme-text-muted text-xs">
                          Keterangan bersifat opsional
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-5`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info ${themeSmallShadow}`}
                    >
                      <Info size={18} />
                    </div>
                    <div>
                      <h4 className="theme-text text-sm font-bold">
                        Informasi
                      </h4>
                      <p className="theme-text-secondary mt-1.5 text-xs leading-5">
                        Lokasi gudang dipilih berdasarkan data gedung dan
                        lantai yang sudah terdaftar pada infrastruktur
                        sekolah. Pilih gedung terlebih dahulu agar daftar
                        lantai dapat ditampilkan.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
