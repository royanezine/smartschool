"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExcelJS from "exceljs";
import {
  ArrowLeft,
  Save,
  UserRound,
  Mail,
  LockKeyhole,
  Hash,
  IdCard,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  School,
  MapPin,
  Phone,
  CalendarDays,
  BriefcaseBusiness,
  RefreshCw,
  Info,
  FileSpreadsheet,
  Upload,
  Download,
  X,
  FilePenLine,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  createSiswa,
  importSiswaExcel,
} from "@/services/siswa.service";
import { getKelas } from "@/services/kelas.service";

const initialForm = {
  namaLengkap: "",
  namaPengguna: "",
  email: "",
  kataSandi: "",
  nisn: "",
  nis: "",
  nipd: "",
  jenisKelamin: "",
  kelasId: "",
  nik: "",
  tempatLahir: "",
  tanggalLahir: "",
  noTelepon: "",
  alamat: "",
  alamatKtp: "",
  alamatDomisili: "",
  alamatSesuaiDomisili: true,
  provinsi: "",
  kotaKabupaten: "",
  kecamatan: "",
  kelurahan: "",
  kodePos: "",
  namaAyah: "",
  nikAyah: "",
  pekerjaanAyah: "",
  noHpAyah: "",
  namaIbu: "",
  nikIbu: "",
  pekerjaanIbu: "",
  noHpIbu: "",
  namaWaliPesertaDidik: "",
};

function extractRows(response) {
  const candidates = [
    response?.data?.data,
    response?.data?.items,
    response?.data,
    response?.items,
  ];

  return candidates.find(Array.isArray) ?? [];
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength,
  icon: Icon,
  inputMode,
  disabled = false,
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`${inputClass} ${Icon ? "pl-9" : ""}`}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          inputMode={inputMode}
          disabled={disabled}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  return (
    <div className="sm:col-span-2">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputClass} min-h-24 resize-y`}
        placeholder={placeholder}
        rows={3}
        disabled={disabled}
      />
    </div>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
            <Icon size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function TabButton({ active, icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
        active
          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`rounded-lg p-2 ${
          active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p
          className={`text-sm font-semibold ${
            active ? "text-blue-900" : "text-slate-900"
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-0.5 text-xs leading-5 ${
            active ? "text-blue-800/80" : "text-slate-500"
          }`}
        >
          {description}
        </p>
      </div>
    </button>
  );
}

export default function TambahSiswaPage() {
  const router = useRouter();

  const [mode, setMode] = useState("import"); // "import" | "manual"

  const [form, setForm] = useState(initialForm);
  const [kelasList, setKelasList] = useState([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State import Excel
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  const loadKelas = useCallback(async () => {
    setLoadingKelas(true);
    setError("");

    try {
      const response = await getKelas({
        page: 1,
        limit: 100,
        sortBy: "tingkat",
        sortOrder: "asc",
      });

      const rows = extractRows(response);

      const sorted = [...rows].sort((a, b) => {
        const levelA = Number(a?.tingkat) || 0;
        const levelB = Number(b?.tingkat) || 0;

        if (levelA !== levelB) return levelA - levelB;

        return String(a?.nama ?? "").localeCompare(
          String(b?.nama ?? ""),
          "id"
        );
      });

      setKelasList(sorted);
    } catch (err) {
      console.error("Gagal mengambil master kelas:", err);

      setError(
        err?.message ||
          "Daftar kelas gagal dimuat. Periksa koneksi atau izin akses akun."
      );
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadKelas();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadKelas]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const selectedKelas = kelasList.find(
    (kelas) => String(kelas.id) === String(form.kelasId)
  );

 

  const handleDownloadTemplate = async () => {
    setImportError("");
    setImportSuccess("");

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Siswa");

      worksheet.columns = [
        { header: "Nama Lengkap", key: "namaLengkap", width: 30 },
        { header: "NISN", key: "nisn", width: 20 },
        { header: "NIS", key: "nis", width: 20 },
        { header: "Email", key: "email", width: 32 },
        { header: "Jenis Kelamin", key: "jenisKelamin", width: 20 },
      ];

      worksheet.addRow({
        namaLengkap: "Contoh Nama Siswa",
        nisn: "0012345678",
        nis: "12345",
        email: "siswa@example.com",
        jenisKelamin: "laki-laki",
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "template-import-siswa.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setImportError(
        err?.message || "Gagal mengunduh template Excel."
      );
    }
  };

  const handleImportFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    setImportError("");
    setImportSuccess("");

    if (!file) {
      setImportFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setImportFile(null);
      event.target.value = "";
      setImportError("Format file harus Excel .xlsx.");
      return;
    }

    if (file.size === 0) {
      setImportFile(null);
      event.target.value = "";
      setImportError("File yang dipilih kosong.");
      return;
    }

    setImportFile(file);
  };

  const handleRemoveImportFile = () => {
    setImportFile(null);
    setImportError("");
    setImportSuccess("");

    const input = document.getElementById("fileImportSiswa");

    if (input) {
      input.value = "";
    }
  };



const handleImportSiswa = async () => {
  setImportError("");
  setImportSuccess("");

  if (!importFile) {
    setImportError("Pilih file Excel terlebih dahulu.");
    return;
  }

  setImporting(true);

  try {
    const response = await importSiswaExcel(importFile);

    const message =
      response?.message ||
      response?.data?.message ||
      "Import selesai. Silakan periksa daftar siswa.";

    setImportSuccess(message);
    setImportFile(null);

    const input = document.getElementById("fileImportSiswa");
    if (input) input.value = "";

    // Beri waktu agar pesan sukses terlihat.
    window.setTimeout(() => {
      router.push("/admin/siswa");
      router.refresh();
    }, 1200);
  } catch (err) {
    console.error("Gagal mengimport siswa:", err);

    setImportError(
      err?.message || "Gagal mengimport data siswa."
    );
  } finally {
    setImporting(false);
  }
};




const handleSubmit = async (event) => {
  event.preventDefault();
  setError("");
  setSuccess("");

  if (
    !form.namaLengkap.trim() ||
    !form.namaPengguna.trim() ||
    !form.email.trim() ||
    !form.kataSandi
  ) {
    setError(
      "Nama lengkap, username, email, dan kata sandi wajib diisi."
    );
    return;
  }

  if (form.kataSandi.length < 8) {
    setError("Kata sandi minimal 8 karakter.");
    return;
  }

  if (
    form.jenisKelamin &&
    !["laki-laki", "perempuan"].includes(form.jenisKelamin)
  ) {
    setError("Jenis kelamin tidak valid.");
    return;
  }

  if (form.nisn.trim() && !/^\d+$/.test(form.nisn.trim())) {
    setError("NISN harus berisi angka saja.");
    return;
  }

  const validasiNIK = [
    ["NIK", form.nik],
    ["NIK ayah", form.nikAyah],
    ["NIK ibu", form.nikIbu],
  ];

  for (const [label, value] of validasiNIK) {
    if (value.trim() && !/^\d{16}$/.test(value.trim())) {
      setError(`${label} harus terdiri dari tepat 16 angka.`);
      return;
    }
  }

  const validasiTelepon = [
    ["Nomor telepon", form.noTelepon],
    ["Nomor HP ayah", form.noHpAyah],
    ["Nomor HP ibu", form.noHpIbu],
  ];

  for (const [label, value] of validasiTelepon) {
    if (value.trim() && !/^[0-9+\-\s()]+$/.test(value.trim())) {
      setError(`${label} tidak valid.`);
      return;
    }
  }

  setLoading(true);

  const optionalText = (value) => {
    const normalized = String(value ?? "").trim();
    return normalized || null;
  };

  try {
    const payload = {
      namaLengkap: form.namaLengkap.trim(),
      namaPengguna: form.namaPengguna.trim(),
      email: form.email.trim(),
      kataSandi: form.kataSandi,

      nisn: optionalText(form.nisn),
      nis: optionalText(form.nis),
      nipd: optionalText(form.nipd),

      // Jangan kirim null saat belum memilih kelas.
      ...(form.kelasId ? { kelasId: form.kelasId } : {}),

      nik: optionalText(form.nik),
      jenisKelamin: optionalText(form.jenisKelamin),
      tempatLahir: optionalText(form.tempatLahir),
      tanggalLahir: form.tanggalLahir || null,
      noTelepon: optionalText(form.noTelepon),

      alamat: optionalText(form.alamat),
      alamatKtp: optionalText(form.alamatKtp),
      alamatDomisili: form.alamatSesuaiDomisili
        ? optionalText(form.alamatKtp || form.alamat)
        : optionalText(form.alamatDomisili),
      alamatSesuaiDomisili: Boolean(form.alamatSesuaiDomisili),

      provinsi: optionalText(form.provinsi),
      kotaKabupaten: optionalText(form.kotaKabupaten),
      kecamatan: optionalText(form.kecamatan),
      kelurahan: optionalText(form.kelurahan),
      kodePos: optionalText(form.kodePos),

      namaAyah: optionalText(form.namaAyah),
      nikAyah: optionalText(form.nikAyah),
      pekerjaanAyah: optionalText(form.pekerjaanAyah),
      noHpAyah: optionalText(form.noHpAyah),

      namaIbu: optionalText(form.namaIbu),
      nikIbu: optionalText(form.nikIbu),
      pekerjaanIbu: optionalText(form.pekerjaanIbu),
      noHpIbu: optionalText(form.noHpIbu),

      namaWaliPesertaDidik: optionalText(
        form.namaWaliPesertaDidik
      ),
    };

    await createSiswa(payload);

    setSuccess("Data siswa berhasil disimpan.");

    window.setTimeout(() => {
      router.push("/admin/siswa");
      router.refresh();
    }, 1200);
  } catch (err) {
    console.error("Gagal menambahkan siswa:", err);

    setError(
      err?.message ||
        "Gagal menambahkan data siswa. Silakan coba kembali."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar role="admin" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/admin/siswa")}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"
            >
              <ArrowLeft size={18} />
              Kembali ke Data Siswa
            </button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Tambah Siswa
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Pilih cara menambahkan siswa: import banyak data sekaligus dari
                Excel, atau isi satu siswa secara manual.
              </p>
            </div>

            {/* TAB PILIHAN */}
            <div
              role="tablist"
              aria-label="Pilih cara menambah siswa"
              className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <TabButton
                active={mode === "import"}
                icon={FileSpreadsheet}
                title="Import dari Excel"
                description="Cocok untuk menambah banyak siswa sekaligus."
                onClick={() => {
                  setMode("import");
                  setError("");
                  setSuccess("");
                }}
              />

              <TabButton
                active={mode === "manual"}
                icon={FilePenLine}
                title="Isi Manual"
                description="Cocok untuk menambah satu siswa saja."
                onClick={() => {
                  setMode("manual");
                  setImportError("");
                  setImportSuccess("");
                }}
              />
            </div>

            {/* PANEL IMPORT */}
            {mode === "import" && (
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                      <FileSpreadsheet size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Import Siswa dari Excel
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Tambahkan banyak siswa sekaligus menggunakan file
                        Excel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    <div className="flex items-start gap-2">
                      <Info size={18} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Langkah import</p>
                        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs leading-5">
                          <li>Isi data siswa sesuai kolom template.</li>
                          <li>Pilih file yang sudah diisi, lalu klik Import.</li>
                        </ol>
                        <p className="mt-2 text-xs leading-5">
                          Jangan mengubah urutan lima kolom template. NISN
                          wajib diisi agar baris diproses.
                        </p>
                      </div>
                    </div>
                  </div>

                  {importError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <p>{importError}</p>
                    </div>
                  )}

                  {importSuccess && (
                    <div
                      role="status"
                      className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                    >
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                      <p>{importSuccess}</p>
                    </div>
                  )}

                 

                  {/* STEP 2 */}
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        1
                      </span>
                      <p className="text-sm font-semibold text-slate-900">
                        Pilih file Excel yang sudah diisi
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <label
                        htmlFor="fileImportSiswa"
                        className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${
                          importing ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        <Upload size={17} />
                        Pilih File Excel
                      </label>

                      <input
                        id="fileImportSiswa"
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleImportFileChange}
                        disabled={importing}
                      />
                    </div>

                    {importFile && (
                      <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <FileSpreadsheet
                            size={24}
                            className="shrink-0 text-emerald-700"
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {importFile.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(importFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveImportFile}
                          disabled={importing}
                          className="inline-flex items-center justify-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <X size={16} />
                          Hapus file
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 3 */}
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        2
                      </span>
                      <p className="text-sm font-semibold text-slate-900">
                        Jalankan import
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleImportSiswa}
                      disabled={!importFile || importing}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {importing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Mengimport Siswa...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Import Siswa
                        </>
                      )}
                    </button>

                    {!importFile && (
                      <p className="mt-2 text-xs text-slate-500">
                        Tombol aktif setelah file Excel dipilih.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* PANEL MANUAL */}
            {mode === "manual" && (
              <>
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <Info size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Catatan</p>
                   <p className="mt-1 leading-6">
  Lengkapi informasi akun dan data siswa sesuai kebutuhan.
  Field yang tidak wajib boleh dikosongkan. Pastikan NIK
  berisi 16 angka jika diisi, dan pilih kelas jika siswa
  akan langsung ditempatkan ke kelas.
</p>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                  >
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                    <p>{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Section
                    icon={UserRound}
                    title="Informasi Akun"
                    description="Informasi untuk login siswa."
                  >
                    <div className="sm:col-span-2">
                      <Field
                        label="Nama Lengkap"
                        name="namaLengkap"
                        value={form.namaLengkap}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap siswa"
                        icon={UserRound}
                        maxLength={100}
                        required
                        disabled={loading}
                      />
                    </div>

                    <Field
                      label="Username"
                      name="namaPengguna"
                      value={form.namaPengguna}
                      onChange={handleChange}
                      placeholder="Username untuk login"
                      icon={Users}
                      maxLength={50}
                      required
                      disabled={loading}
                    />

                    <Field
                      label="Email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="nama@email.com"
                      icon={Mail}
                      maxLength={100}
                      required
                      disabled={loading}
                    />

                    <div className="sm:col-span-2">
                      <Field
                        label="Kata Sandi"
                        name="kataSandi"
                        value={form.kataSandi}
                        onChange={handleChange}
                        type="password"
                        placeholder="Minimal 8 karakter"
                        icon={LockKeyhole}
                        maxLength={100}
                        required
                        disabled={loading}
                      />

                      <p className="mt-1.5 text-xs text-slate-500">
                        Gunakan kata sandi awal yang aman dan sampaikan kepada
                        siswa melalui cara yang aman.
                      </p>
                    </div>
                  </Section>

                  <Section
                    icon={School}
                    title="Data Akademik"
                    description="Nomor identitas sekolah dan kelas siswa."
                  >
                    <Field
                      label="NISN"
                      name="nisn"
                      value={form.nisn}
                      onChange={handleChange}
                      placeholder="Masukkan NISN"
                      icon={Hash}
                      maxLength={20}
                      inputMode="numeric"
                      disabled={loading}
                    />

                    <Field
                      label="NIS"
                      name="nis"
                      value={form.nis}
                      onChange={handleChange}
                      placeholder="Masukkan NIS"
                      icon={IdCard}
                      maxLength={20}
                      disabled={loading}
                    />

                    <Field
                      label="NIPD"
                      name="nipd"
                      value={form.nipd}
                      onChange={handleChange}
                      placeholder="Masukkan NIPD jika tersedia"
                      maxLength={20}
                      disabled={loading}
                    />

                    <div>
                      <label htmlFor="jenisKelamin" className={labelClass}>
                        Jenis Kelamin
                      </label>

                      <select
                        id="jenisKelamin"
                        name="jenisKelamin"
                        value={form.jenisKelamin}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={loading}
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="kelasId" className={labelClass}>
                        Kelas
                      </label>

                      <div className="flex gap-2">
                        <select
                          id="kelasId"
                          name="kelasId"
                          value={form.kelasId}
                          onChange={handleChange}
                          className={inputClass}
                          disabled={loading || loadingKelas}
                        >
                          <option value="">
                            {loadingKelas
                              ? "Memuat master kelas..."
                              : "Pilih kelas"}
                          </option>

                          {kelasList.map((kelas) => (
                            <option key={kelas.id} value={kelas.id}>
                              {kelas.nama} — Tingkat {kelas.tingkat}
                              {kelas.tahunAjaran?.nama
                                ? ` — ${kelas.tahunAjaran.nama}`
                                : ""}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={loadKelas}
                          disabled={loadingKelas || loading}
                          title="Muat ulang kelas"
                          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <RefreshCw
                            size={17}
                            className={loadingKelas ? "animate-spin" : ""}
                          />
                        </button>
                      </div>

                      {selectedKelas && (
                        <p className="mt-2 text-xs text-slate-500">
                          Dipilih: {selectedKelas.nama}, tingkat{" "}
                          {selectedKelas.tingkat}
                          {selectedKelas.tahunAjaran?.nama
                            ? `, tahun ajaran ${selectedKelas.tahunAjaran.nama}`
                            : ""}
                          .
                        </p>
                      )}

                      {!loadingKelas && kelasList.length === 0 && (
                        <p className="mt-2 text-xs text-amber-700">
                          Belum ada kelas yang berhasil dimuat.
                        </p>
                      )}
                    </div>
                  </Section>

                  <Section
                    icon={IdCard}
                    title="Identitas Pribadi"
                    description="Informasi identitas siswa."
                  >
                    <Field
                      label="NIK"
                      name="nik"
                      value={form.nik}
                      onChange={handleChange}
                      placeholder="Masukkan NIK"
                      icon={IdCard}
                      maxLength={20}
                      inputMode="numeric"
                      disabled={loading}
                    />

                    <Field
                      label="Nomor Telepon"
                      name="noTelepon"
                      value={form.noTelepon}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      icon={Phone}
                      maxLength={20}
                      inputMode="tel"
                      disabled={loading}
                    />

                    <Field
                      label="Tempat Lahir"
                      name="tempatLahir"
                      value={form.tempatLahir}
                      onChange={handleChange}
                      placeholder="Kota tempat lahir"
                      maxLength={50}
                      disabled={loading}
                    />

                    <div>
                      <label htmlFor="tanggalLahir" className={labelClass}>
                        Tanggal Lahir
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={17}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          id="tanggalLahir"
                          name="tanggalLahir"
                          type="date"
                          value={form.tanggalLahir}
                          onChange={handleChange}
                          className={`${inputClass} pl-9`}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </Section>

                  <Section
                    icon={MapPin}
                    title="Data Alamat"
                    description="Alamat tempat tinggal dan alamat identitas."
                  >
                    <TextAreaField
                      label="Alamat"
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      placeholder="Masukkan alamat lengkap"
                      disabled={loading}
                    />

                    <TextAreaField
                      label="Alamat KTP"
                      name="alamatKtp"
                      value={form.alamatKtp}
                      onChange={handleChange}
                      placeholder="Masukkan alamat sesuai KTP"
                      disabled={loading}
                    />

                    <div className="sm:col-span-2">
                      <label className="flex items-start gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          name="alamatSesuaiDomisili"
                          checked={form.alamatSesuaiDomisili}
                          onChange={handleChange}
                          className="mt-1 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                          disabled={loading}
                        />
                        Alamat domisili sama dengan alamat KTP
                      </label>
                    </div>

                    {!form.alamatSesuaiDomisili && (
                      <TextAreaField
                        label="Alamat Domisili"
                        name="alamatDomisili"
                        value={form.alamatDomisili}
                        onChange={handleChange}
                        placeholder="Masukkan alamat domisili saat ini"
                        disabled={loading}
                      />
                    )}

                    <Field
                      label="Provinsi"
                      name="provinsi"
                      value={form.provinsi}
                      onChange={handleChange}
                      placeholder="Masukkan provinsi"
                      maxLength={50}
                      disabled={loading}
                    />

                    <Field
                      label="Kota/Kabupaten"
                      name="kotaKabupaten"
                      value={form.kotaKabupaten}
                      onChange={handleChange}
                      placeholder="Masukkan kota/kabupaten"
                      maxLength={50}
                      disabled={loading}
                    />

                    <Field
                      label="Kecamatan"
                      name="kecamatan"
                      value={form.kecamatan}
                      onChange={handleChange}
                      placeholder="Masukkan kecamatan"
                      maxLength={50}
                      disabled={loading}
                    />

                    <Field
                      label="Kelurahan"
                      name="kelurahan"
                      value={form.kelurahan}
                      onChange={handleChange}
                      placeholder="Masukkan kelurahan"
                      maxLength={50}
                      disabled={loading}
                    />

                    <Field
                      label="Kode Pos"
                      name="kodePos"
                      value={form.kodePos}
                      onChange={handleChange}
                      placeholder="Masukkan kode pos"
                      maxLength={10}
                      inputMode="numeric"
                      disabled={loading}
                    />
                  </Section>

                  <Section
                    icon={Users}
                    title="Data Orang Tua / Wali"
                    description="Informasi orang tua atau wali siswa."
                  >
                    <Field
                      label="Nama Ayah"
                      name="namaAyah"
                      value={form.namaAyah}
                      onChange={handleChange}
                      placeholder="Nama lengkap ayah"
                      maxLength={100}
                      disabled={loading}
                    />

                    <Field
                      label="NIK Ayah"
                      name="nikAyah"
                      value={form.nikAyah}
                      onChange={handleChange}
                      placeholder="NIK ayah"
                      maxLength={20}
                      inputMode="numeric"
                      disabled={loading}
                    />

                    <Field
                      label="Pekerjaan Ayah"
                      name="pekerjaanAyah"
                      value={form.pekerjaanAyah}
                      onChange={handleChange}
                      placeholder="Pekerjaan ayah"
                      icon={BriefcaseBusiness}
                      maxLength={50}
                      disabled={loading}
                    />

                    <Field
                      label="Nomor HP Ayah"
                      name="noHpAyah"
                      value={form.noHpAyah}
                      onChange={handleChange}
                      placeholder="Nomor HP ayah"
                      icon={Phone}
                      maxLength={20}
                      inputMode="tel"
                      disabled={loading}
                    />

                    <Field
                      label="Nama Ibu"
                      name="namaIbu"
                      value={form.namaIbu}
                      onChange={handleChange}
                      placeholder="Nama lengkap ibu"
                      maxLength={100}
                      disabled={loading}
                    />

                    <Field
                      label="NIK Ibu"
                      name="nikIbu"
                      value={form.nikIbu}
                      onChange={handleChange}
                      placeholder="NIK ibu"
                      maxLength={20}
                      inputMode="numeric"
                      disabled={loading}
                    />

                    <Field
                      label="Pekerjaan Ibu"
                      name="pekerjaanIbu"
                      value={form.pekerjaanIbu}
                      onChange={handleChange}
                      placeholder="Pekerjaan ibu"
                      icon={BriefcaseBusiness}
                      maxLength={50}
                      disabled={loading}
                    />

                    <Field
                      label="Nomor HP Ibu"
                      name="noHpIbu"
                      value={form.noHpIbu}
                      onChange={handleChange}
                      placeholder="Nomor HP ibu"
                      icon={Phone}
                      maxLength={20}
                      inputMode="tel"
                      disabled={loading}
                    />

                    <div className="sm:col-span-2">
                     <Field
  label="Nama Wali Peserta Didik"
  name="namaWaliPesertaDidik"
  value={form.namaWaliPesertaDidik}
  onChange={handleChange}
  placeholder="Isi jika siswa memiliki wali"
  maxLength={20}
  disabled={loading}
/>
                    </div>
                  </Section>

                  <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => router.push("/admin/siswa")}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={loading || loadingKelas}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Simpan Siswa
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}