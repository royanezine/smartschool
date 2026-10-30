"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  GraduationCap,
  Plus,
  Save,
  X,
  School,
  Users,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  Info,
  Building2,
  Layers3,
  Loader2,
  AlertCircle,
  UserCheck,
} from "lucide-react";

import { createKelas } from "@/services/kelas.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";
import { getUsers } from "@/services/user.service";
import {
  getGedung,
  getLantaiByGedung,
} from "@/services/infrastruktur.service";

const TINGKAT_OPTIONS = [
  { value: 10, label: "X (Sepuluh)" },
  { value: 11, label: "XI (Sebelas)" },
  { value: 12, label: "XII (Dua Belas)" },
];

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  type = "text",
  min,
  className = "",
}) {
  return (
    <div className={`min-w-0 w-full ${className}`}>
      <label className="flex items-center gap-1.5 text-sm font-medium theme-text-secondary mb-1.5">
        {Icon && <Icon size={14} className="theme-text-muted shrink-0" />}
        <span>{label}</span>
        {required && (
          <span className="text-[var(--color-danger)]">*</span>
        )}
      </label>

      <div className="relative w-full min-w-0">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          className="
            w-full px-3.5 py-2.5 text-sm rounded-lg
            theme-input border
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--color-primary)]
            focus:ring-opacity-25
            focus:border-[var(--color-primary)]
            disabled:opacity-60
            disabled:cursor-not-allowed
            transition-all
            min-w-0
          "
        />
      </div>
    </div>
  );
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  children,
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`min-w-0 w-full ${className}`}>
      <label className="flex items-center gap-1.5 text-sm font-medium theme-text-secondary mb-1.5">
        {Icon && <Icon size={14} className="theme-text-muted shrink-0" />}
        <span>{label}</span>
        {required && (
          <span className="text-[var(--color-danger)]">*</span>
        )}
      </label>

      <div className="relative w-full min-w-0">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="
            w-full px-3.5 py-2.5 pr-9 text-sm rounded-lg appearance-none
            theme-input border
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--color-primary)]
            focus:ring-opacity-25
            focus:border-[var(--color-primary)]
            disabled:opacity-60
            disabled:cursor-not-allowed
            transition-all
            min-w-0
          "
        >
          {children}
        </select>

        <ChevronDown
          size={16}
          className="theme-text-placeholder pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
}

function unwrapData(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
}

export default function AdminKelasTambahPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingTahun, setLoadingTahun] = useState(true);
  const [loadingGedung, setLoadingGedung] = useState(true);
  const [loadingLantai, setLoadingLantai] = useState(false);
  const [loadingGuru, setLoadingGuru] = useState(true);

  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [gedungList, setGedungList] = useState([]);
  const [lantaiList, setLantaiList] = useState([]);
  const [guruList, setGuruList] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    tingkat: "",
    tahunAjaranId: "",
    kapasitas: "30",
    waliKelasId: "",
    gedungId: "",
    lantaiId: "",
  });

  async function loadGuru() {
    try {
      setLoadingGuru(true);

      const response = await getUsers({
        page: 1,
        limit: 200,
        role: "guru",
        status: "aktif",
      });

      const list = unwrapData(response);

      setGuruList(list);
    } catch (err) {
      console.error(
        "Gagal mengambil data guru:",
        err
      );

      setGuruList([]);

      setError(
        err?.message ||
          "Gagal mengambil data guru."
      );
    } finally {
      setLoadingGuru(false);
    }
  }

  async function loadTahunAjaran() {
    try {
      setLoadingTahun(true);

      const response = await getTahunAjaran();
      const list = unwrapData(response);

      setTahunAjaranList(list);

      const tahunAktif = list.find(
        (item) => item.status === "aktif"
      );

      if (tahunAktif) {
        setForm((prev) => ({
          ...prev,
          tahunAjaranId: tahunAktif.id,
        }));
      }
    } catch (err) {
      console.error(
        "Gagal mengambil tahun ajaran:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data tahun ajaran."
      );
    } finally {
      setLoadingTahun(false);
    }
  }

  async function loadGedung() {
    try {
      setLoadingGedung(true);

      const response = await getGedung();
      const list = unwrapData(response);

      setGedungList(list);
    } catch (err) {
      console.error(
        "Gagal mengambil gedung:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data gedung."
      );
    } finally {
      setLoadingGedung(false);
    }
  }

  async function loadLantai(gedungId) {
    if (!gedungId) {
      setLantaiList([]);

      setForm((prev) => ({
        ...prev,
        gedungId: "",
        lantaiId: "",
      }));

      return;
    }

    try {
      setLoadingLantai(true);
      setLantaiList([]);

      setForm((prev) => ({
        ...prev,
        gedungId,
        lantaiId: "",
      }));

      const response =
        await getLantaiByGedung(gedungId);

      const list = unwrapData(response);

      setLantaiList(list);
    } catch (err) {
      console.error(
        "Gagal mengambil lantai:",
        err
      );

      setLantaiList([]);

      setError(
        err?.message ||
          "Gagal mengambil data lantai."
      );
    } finally {
      setLoadingLantai(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTahunAjaran();
      loadGedung();
      loadGuru();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "gedungId") {
      setError("");
      setSuccess("");

      loadLantai(value);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.nama.trim()) {
      setError("Nama kelas wajib diisi.");
      return;
    }

    if (!form.tingkat) {
      setError("Tingkat kelas wajib dipilih.");
      return;
    }

    if (!form.tahunAjaranId) {
      setError("Tahun ajaran wajib dipilih.");
      return;
    }

    if (!form.kapasitas) {
      setError("Kapasitas kelas wajib diisi.");
      return;
    }

    const kapasitas = Number(form.kapasitas);

    if (!Number.isFinite(kapasitas)) {
      setError("Kapasitas harus berupa angka.");
      return;
    }

    if (kapasitas < 1) {
      setError(
        "Kapasitas kelas minimal 1 siswa."
      );
      return;
    }

    if (form.gedungId && !form.lantaiId) {
      setError(
        "Silakan pilih lantai kelas."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nama: form.nama.trim(),
        tingkat: Number(form.tingkat),
        tahunAjaranId: form.tahunAjaranId,
        kapasitas,
        waliKelasId: form.waliKelasId || null,
        lantaiId: form.lantaiId || null,
        fotoKelasUrl: null,
      };

      console.log(
        "========== CREATE KELAS =========="
      );

      console.log(
        "PAYLOAD CREATE KELAS:",
        payload
      );

      const response =
        await createKelas(payload);

      console.log(
        "CREATE RESPONSE:",
        response
      );

      console.log(
        "================================="
      );

      setSuccess(
        "Kelas berhasil ditambahkan."
      );

      setTimeout(() => {
        router.push("/admin/akademik/kelas");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error(
        "Gagal menambahkan kelas:",
        err
      );

      setError(
        err?.message ||
          "Gagal menambahkan kelas."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedTahunAjaran = tahunAjaranList.find(
    (item) => item.id === form.tahunAjaranId
  );
  const selectedGuru = guruList.find(
    (guru) => guru.id === form.waliKelasId
  );
  const selectedGedung = gedungList.find(
    (item) => item.id === form.gedungId
  );
  const selectedLantai = lantaiList.find(
    (item) => item.id === form.lantaiId
  );
  const selectedTingkat = TINGKAT_OPTIONS.find(
    (item) => item.value === Number(form.tingkat)
  );

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="kelas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed((prev) => !prev)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header & Back Navigation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push("/admin/akademik/kelas")
                }
                className="
                  p-2.5 rounded-xl
                  theme-card theme-border theme-text-muted
                  theme-header-hover
                  transition-colors shrink-0
                "
                title="Kembali ke daftar kelas"
              >
                <ArrowLeft size={20} />
              </button>

              <div
                className="
                  p-2.5 rounded-xl
                  bg-[image:var(--color-brand-logo-bg)]
                  text-white
                  shadow-lg
                  shrink-0
                "
              >
                <GraduationCap size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Tambah Kelas
                </h1>

                <p className="text-sm theme-text-muted">
                  Tambahkan data kelas baru beserta lokasi ruangannya.
                </p>
              </div>
            </div>

            {/* Success Alert */}
            {success && (
              <div className="flex items-center gap-3 p-4 rounded-xl theme-success">
                <CheckCircle
                  size={20}
                  className="shrink-0"
                />

                <p className="text-sm font-medium">
                  {success} Mengalihkan...
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl theme-danger">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Gagal menambahkan kelas
                  </p>

                  <p className="text-sm mt-1 leading-relaxed break-words">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="theme-header-hover rounded-lg p-1 transition shrink-0"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* Main Responsive Grid Layout (matches Tambah Wali Kelas pattern) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Form Card (lg:col-span-2) */}
              <form
                onSubmit={handleSubmit}
                className="
                  lg:col-span-2
                  theme-card
                  rounded-xl
                  border
                  shadow-sm
                  overflow-hidden
                "
              >
                <div
                  className="
                    px-6 py-4
                    border-b
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <h2 className="text-sm font-semibold theme-text-secondary">
                    Informasi Kelas
                  </h2>

                  <p className="text-xs theme-text-muted mt-0.5">
                    Lengkapi data kelas dan lokasi ruangannya.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormInput
                      label="Nama Kelas"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      placeholder="Contoh: X RPL 1"
                      icon={GraduationCap}
                      required
                    />

                    <FormSelect
                      label="Tingkat"
                      name="tingkat"
                      value={form.tingkat}
                      onChange={handleChange}
                      icon={School}
                      required
                    >
                      <option value="">
                        Pilih tingkat
                      </option>

                      {TINGKAT_OPTIONS.map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ))}
                    </FormSelect>

                    <FormSelect
                      label="Tahun Ajaran"
                      name="tahunAjaranId"
                      value={form.tahunAjaranId}
                      onChange={handleChange}
                      icon={CalendarDays}
                      required
                      disabled={loadingTahun}
                    >
                      <option value="">
                        {loadingTahun
                          ? "Memuat tahun ajaran..."
                          : "Pilih tahun ajaran"}
                      </option>

                      {tahunAjaranList.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.nama} - {item.semester}
                          {item.status === "aktif"
                            ? " (Aktif)"
                            : ""}
                        </option>
                      ))}
                    </FormSelect>

                    <FormInput
                      label="Kapasitas Kelas"
                      name="kapasitas"
                      value={form.kapasitas}
                      onChange={handleChange}
                      placeholder="Contoh: 36"
                      icon={Users}
                      type="number"
                      min="1"
                      required
                    />

                    <FormSelect
                      label="Wali Kelas"
                      name="waliKelasId"
                      value={form.waliKelasId}
                      onChange={handleChange}
                      icon={UserCheck}
                      disabled={loadingGuru}
                      className="sm:col-span-2"
                    >
                      <option value="">
                        {loadingGuru
                          ? "Memuat data guru..."
                          : "Belum ditentukan / Tanpa wali kelas"}
                      </option>

                      {guruList.map((guru) => (
                        <option
                          key={guru.id}
                          value={guru.id}
                        >
                          {guru.namaLengkap ||
                            guru.namaPengguna ||
                            guru.email}
                          {guru.nip
                            ? ` (NIP ${guru.nip})`
                            : ""}
                        </option>
                      ))}
                    </FormSelect>

                    <FormSelect
                      label="Gedung"
                      name="gedungId"
                      value={form.gedungId}
                      onChange={handleChange}
                      icon={Building2}
                      disabled={loadingGedung}
                    >
                      <option value="">
                        {loadingGedung
                          ? "Memuat gedung..."
                          : "Pilih gedung"}
                      </option>

                      {gedungList.map((gedung) => (
                        <option
                          key={gedung.id}
                          value={gedung.id}
                        >
                          {gedung.nama}
                          {gedung.kode
                            ? ` (${gedung.kode})`
                            : ""}
                        </option>
                      ))}
                    </FormSelect>

                    <FormSelect
                      label="Lantai"
                      name="lantaiId"
                      value={form.lantaiId}
                      onChange={handleChange}
                      icon={Layers3}
                      disabled={
                        !form.gedungId || loadingLantai
                      }
                    >
                      <option value="">
                        {loadingLantai
                          ? "Memuat lantai..."
                          : !form.gedungId
                          ? "Pilih gedung terlebih dahulu"
                          : lantaiList.length === 0
                          ? "Belum ada lantai"
                          : "Pilih lantai"}
                      </option>

                      {lantaiList.map((lantai) => (
                        <option
                          key={lantai.id}
                          value={lantai.id}
                        >
                          {lantai.nama}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div
                  className="
                    flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3
                    px-6 py-4
                    border-t
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/akademik/kelas")
                    }
                    disabled={loading}
                    className="
                      w-full sm:w-auto
                      px-5 py-2.5
                      rounded-xl
                      border
                      theme-border
                      theme-text-secondary
                      theme-header-hover
                      transition-all
                      font-medium
                      text-sm
                      disabled:opacity-60
                      flex items-center justify-center gap-2
                    "
                  >
                    <X size={17} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      loadingTahun ||
                      loadingGedung
                    }
                    className="
                      w-full sm:w-auto
                      flex items-center justify-center gap-2
                      px-6 py-2.5
                      theme-primary
                      rounded-xl
                      transition-all
                      shadow-sm
                      font-medium
                      text-sm
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Simpan Kelas
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Side Preview & Information (1 Column in lg:grid-cols-3) */}
              <div className="space-y-6">
                {/* Pratinjau Card */}
                <div
                  className="
                    theme-card
                    rounded-xl
                    border
                    shadow-sm
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      px-5 py-4
                      border-b
                      theme-border-soft
                      theme-card-soft
                    "
                  >
                    <h2 className="text-sm font-semibold theme-text-secondary">
                      Pratinjau
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Tampilan data ini di daftar kelas.
                    </p>
                  </div>

                  <div
                    className="
                      bg-[image:var(--color-brand-logo-bg)]
                      px-5 py-5
                      flex items-center gap-3
                    "
                  >
                    <div
                      className="
                        w-12 h-12 rounded-full
                        flex items-center justify-center
                        font-bold text-sm shrink-0
                        bg-[color:color-mix(in_srgb,var(--color-card)_20%,transparent)]
                        text-[var(--color-card)]
                      "
                    >
                      <GraduationCap size={22} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-xs
                          text-[color:color-mix(in_srgb,var(--color-card)_80%,transparent)]
                        "
                      >
                        Kelas {selectedTingkat?.label || "-"}
                      </p>

                      <p className="font-bold text-[var(--color-card)] text-sm leading-tight truncate">
                        {form.nama || "Nama Kelas"}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Tingkat
                      </span>

                      <span className="font-medium text-xs theme-text-secondary">
                        {selectedTingkat?.label || "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Tahun Ajaran
                      </span>

                      <span className="theme-text-secondary font-medium text-xs">
                        {selectedTahunAjaran
                          ? `${selectedTahunAjaran.nama} (${selectedTahunAjaran.semester})`
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Kapasitas
                      </span>

                      <span className="theme-text-secondary font-medium inline-flex items-center gap-1.5 text-xs">
                        <Users size={12} />
                        {form.kapasitas ? `${form.kapasitas} siswa` : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Wali Kelas
                      </span>

                      <span className="theme-text-secondary font-medium text-xs truncate max-w-[180px] text-right">
                        {selectedGuru?.namaLengkap ||
                          selectedGuru?.namaPengguna ||
                          selectedGuru?.email ||
                          "Belum ditentukan"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Lokasi Ruangan
                      </span>

                      <span className="theme-text-secondary font-medium text-xs truncate max-w-[180px] text-right">
                        {selectedGedung
                          ? `${selectedGedung.nama}${
                              selectedLantai
                                ? ` • ${selectedLantai.nama}`
                                : ""
                            }`
                          : "Belum dipilih"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informasi Box */}
                <div className="theme-info rounded-xl border p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Info
                      size={16}
                      className="shrink-0"
                    />

                    <h2 className="text-sm font-semibold">
                      Informasi Kelas
                    </h2>
                  </div>

                  <ul
                    className="
                      space-y-2
                      text-xs
                      theme-text-secondary
                      list-disc
                      list-inside
                    "
                  >
                    <li>
                      Nama kelas dan tingkat wajib diisi untuk penataan rombongan belajar.
                    </li>
                    <li>
                      Wali kelas bersifat opsional dan dapat disesuaikan kemudian.
                    </li>
                    <li>
                      Pemilihan gedung dan lantai akan menyimpan relasi lokasi ke lantaiId.
                    </li>
                    <li>
                      Kapasitas kelas minimal 1 siswa.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
