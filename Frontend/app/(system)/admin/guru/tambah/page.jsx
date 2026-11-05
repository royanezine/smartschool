
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { createUser, getUsers } from "@/services/user.service";
import { getKategoriJabatan } from "@/services/kategoriJabatan.service";
import { getShiftKerja } from "@/services/shiftKerja.service";

import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  GraduationCap,
  Hash,
  ShieldCheck,
  Clock,
  Lightbulb,
  Tags,
} from "lucide-react";

const INITIAL_FORM = {
  namaLengkap: "",
  namaPengguna: "",
  email: "",
  kataSandi: "",
  nip: "",
  nuptk: "",
  jenisKelamin: "L",
  tempatLahir: "",
  tanggalLahir: "",
  noTelepon: "",
  alamat: "",
  jabatan: "",
  kategoriJabatanId: "",
  golongan: "",
  nik: "",
  alamatKtp: "",
  alamatDomisili: "",
  kecamatan: "",
  kelurahan: "",
  kota: "",
  shiftKerjaId: "",
};

function generateUsername(nama) {
  return String(nama || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".");
}

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "";

  for (let i = 0; i < 10; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
}

function extractArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }
  if (Array.isArray(response?.data?.data?.items)) {
    return response.data.data.items;
  }

  return [];
}

/**
 * Mengubah data shift master menjadi nilai enum
 * yang diminta backend: "pagi" atau "siang".
 *
 * Contoh:
 * nama: "Shift Pagi" -> "pagi"
 * kode: "PAGI"       -> "pagi"
 * nama: "Shift Siang" -> "siang"
 */
function getShiftValue(shift) {
  if (!shift) return "";

  const nama = String(shift.nama || "").toLowerCase().trim();
  const kode = String(shift.kode || "").toLowerCase().trim();

  const nilai = `${nama} ${kode}`;

  if (/\bpagi\b/.test(nilai)) return "pagi";
  if (/\bsiang\b/.test(nilai)) return "siang";

  return "";
}

function FieldError({ name, touched, validation }) {
  if (!touched[name] || !validation[name]) {
    return null;
  }

  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-danger)]">
      <AlertCircle size={13} />
      {validation[name]}
    </p>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] pb-4">
      <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-base font-bold theme-text">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm theme-text-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TambahGuruPage() {
  const router = useRouter();
  const namaInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [loadingShift, setLoadingShift] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [guruRoleId, setGuruRoleId] = useState("");
  const [daftarKategoriJabatan, setDaftarKategoriJabatan] = useState([]);
  const [daftarShiftKerja, setDaftarShiftKerja] = useState([]);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [touched, setTouched] = useState({});

  // =========================================================
  // AMBIL ROLE GURU
  // =========================================================
  useEffect(() => {
    let mounted = true;

    async function loadGuruRole() {
      try {
        setLoadingRole(true);
        setError("");

        const response = await getUsers({
          page: 1,
          limit: 1,
          role: "guru",
        });

        if (!mounted) return;

        const guru = extractArray(response)[0] || null;

        const roleId = guru?.peran?.id || guru?.peranId || "";

        if (roleId) {
          setGuruRoleId(roleId);
        } else {
          setError(
            "Role Guru belum dapat ditemukan. Endpoint pengguna belum memberikan ID role Guru. Gunakan endpoint daftar role dari backend jika belum ada pengguna Guru."
          );
        }
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil role guru:", err);
        setError(err?.message || "Gagal mengambil data role Guru.");
      } finally {
        if (mounted) setLoadingRole(false);
      }
    }

    loadGuruRole();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // AMBIL KATEGORI JABATAN
  // =========================================================
  useEffect(() => {
    let mounted = true;

    async function loadKategoriJabatan() {
      try {
        setLoadingKategori(true);

        const response = await getKategoriJabatan({
          page: 1,
          limit: 100,
          status: "aktif",
        });

        if (!mounted) return;

        const data = extractArray(response);

        const kategoriAktif = data.filter(
          (item) =>
            item?.id &&
            item?.nama &&
            String(item?.status || "aktif").toLowerCase() === "aktif"
        );

        setDaftarKategoriJabatan(kategoriAktif);

        if (kategoriAktif.length === 0) {
          console.warn("Belum ada kategori jabatan aktif dari backend.");
        }
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil kategori jabatan:", err);

        setError(
          err?.message || "Gagal mengambil daftar kategori jabatan."
        );
      } finally {
        if (mounted) setLoadingKategori(false);
      }
    }

    loadKategoriJabatan();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // AMBIL SHIFT KERJA
  // =========================================================
  useEffect(() => {
    let mounted = true;

    async function loadShiftKerja() {
      try {
        setLoadingShift(true);

        const response = await getShiftKerja({
          page: 1,
          limit: 100,
          status: "aktif",
        });

        if (!mounted) return;

        const data = extractArray(response);

        const shiftAktif = data.filter(
          (item) =>
            item?.id &&
            String(item?.status || "aktif").toLowerCase() === "aktif"
        );

        setDaftarShiftKerja(shiftAktif);

        if (shiftAktif.length === 0) {
          console.warn("Belum ada shift kerja aktif dari backend.");
        }
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil shift kerja:", err);

        setError(
          err?.message || "Gagal mengambil daftar shift kerja."
        );
      } finally {
        if (mounted) setLoadingShift(false);
      }
    }

    loadShiftKerja();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // FOCUS INPUT NAMA
  // =========================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      namaInputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // =========================================================
  // HANDLER INPUT
  // =========================================================
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setError("");
    setSuccess("");
  }

  function handleNamaChange(event) {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      namaLengkap: value,
      namaPengguna:
        prev.namaPengguna || generateUsername(value),
    }));

    setTouched((prev) => ({
      ...prev,
      namaLengkap: true,
    }));

    setError("");
    setSuccess("");
  }

  function handleUsernameChange(event) {
    const value = event.target.value
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9._-]/g, "");

    setForm((prev) => ({
      ...prev,
      namaPengguna: value,
    }));

    setTouched((prev) => ({
      ...prev,
      namaPengguna: true,
    }));

    setError("");
    setSuccess("");
  }

  function handleKategoriJabatanChange(event) {
    const kategoriId = event.target.value;

    const kategoriTerpilih = daftarKategoriJabatan.find(
      (item) => String(item.id) === String(kategoriId)
    );

    setForm((prev) => ({
      ...prev,
      kategoriJabatanId: kategoriId,
      jabatan: kategoriTerpilih?.nama || "",
    }));

    setTouched((prev) => ({
      ...prev,
      kategoriJabatanId: true,
    }));

    setError("");
    setSuccess("");
  }

  function handleGeneratePassword() {
    setForm((prev) => ({
      ...prev,
      kataSandi: generatePassword(),
    }));

    setTouched((prev) => ({
      ...prev,
      kataSandi: true,
    }));

    setShowPassword(true);
    setError("");
    setSuccess("");
  }

  // =========================================================
  // KATEGORI & SHIFT TERPILIH
  // =========================================================
  const selectedKategoriJabatan = useMemo(() => {
    return daftarKategoriJabatan.find(
      (item) =>
        String(item.id) === String(form.kategoriJabatanId)
    );
  }, [daftarKategoriJabatan, form.kategoriJabatanId]);

  const selectedShiftKerja = useMemo(() => {
    return daftarShiftKerja.find(
      (item) =>
        String(item.id) === String(form.shiftKerjaId)
    );
  }, [daftarShiftKerja, form.shiftKerjaId]);

  // Nilai shift yang akan dikirim ke backend.
  const shiftKerjaValue = useMemo(() => {
    return getShiftValue(selectedShiftKerja);
  }, [selectedShiftKerja]);

  // =========================================================
  // VALIDASI
  // =========================================================
  const validation = useMemo(() => {
    const result = {};

    if (!form.namaLengkap.trim()) {
      result.namaLengkap = "Nama lengkap wajib diisi.";
    }

    if (!form.namaPengguna.trim()) {
      result.namaPengguna = "Username wajib diisi.";
    }

    if (!form.email.trim()) {
      result.email = "Email wajib diisi.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      result.email = "Format email tidak valid.";
    }

    if (!form.kataSandi.trim()) {
      result.kataSandi = "Kata sandi wajib diisi.";
    } else if (form.kataSandi.length < 6) {
      result.kataSandi = "Kata sandi minimal 6 karakter.";
    }

    if (!guruRoleId) {
      result.role = "Role Guru belum tersedia.";
    }

    if (!form.kategoriJabatanId) {
      result.kategoriJabatanId =
        "Kategori jabatan wajib dipilih.";
    } else if (!selectedKategoriJabatan) {
      result.kategoriJabatanId =
        "Kategori jabatan yang dipilih tidak valid.";
    }

    if (!form.shiftKerjaId) {
      result.shiftKerjaId = "Shift kerja wajib dipilih.";
    } else if (!selectedShiftKerja) {
      result.shiftKerjaId =
        "Shift kerja yang dipilih tidak valid.";
    } else if (!shiftKerjaValue) {
      result.shiftKerjaId =
        "Shift kerja harus memiliki nama atau kode Pagi atau Siang agar dapat dikirim ke backend.";
    }

    return result;
  }, [
    form,
    guruRoleId,
    selectedKategoriJabatan,
    selectedShiftKerja,
    shiftKerjaValue,
  ]);

  const isValid = Object.keys(validation).length === 0;

  // =========================================================
  // SIMPAN GURU
  // =========================================================
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    setTouched({
      namaLengkap: true,
      namaPengguna: true,
      email: true,
      kataSandi: true,
      kategoriJabatanId: true,
      shiftKerjaId: true,
    });

    if (!isValid) {
      setError(Object.values(validation)[0]);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),
        namaLengkap: form.namaLengkap.trim(),
        kataSandi: form.kataSandi,
        peranId: guruRoleId,

        nip: form.nip.trim() || null,
        nuptk: form.nuptk.trim() || null,
        jenisKelamin: form.jenisKelamin || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
        noTelepon: form.noTelepon.trim() || null,
        alamat: form.alamat.trim() || null,

        // KATEGORI JABATAN
        kategoriJabatanId: form.kategoriJabatanId,
        jabatan: selectedKategoriJabatan?.nama || null,

        golongan: form.golongan.trim() || null,
        nik: form.nik.trim() || null,

        alamatKtp: form.alamatKtp.trim() || null,
        alamatDomisili: form.alamatDomisili.trim() || null,
        kecamatan: form.kecamatan.trim() || null,
        kelurahan: form.kelurahan.trim() || null,
        kota: form.kota.trim() || null,

        // SHIFT KERJA
        // ID untuk relasi master shift jika didukung backend.
        shiftKerjaId: form.shiftKerjaId,

        // Enum yang diwajibkan backend: "pagi" atau "siang".
        shiftKerja: shiftKerjaValue,
      };

      console.log("PAYLOAD TAMBAH GURU:", payload);

      const response = await createUser(payload);

      if (!response?.success) {
        throw new Error(
          response?.message || "Gagal menambahkan Guru."
        );
      }

      setSuccess(
        response.message || "Guru berhasil ditambahkan."
      );

      setTimeout(() => {
        router.push("/admin/guru");
      }, 1000);
    } catch (err) {
      console.error("ERROR TAMBAH GURU:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat menambahkan Guru."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // RESET FORM
  // =========================================================
  function handleReset() {
    setForm({ ...INITIAL_FORM });
    setTouched({});
    setError("");
    setSuccess("");
    setShowPassword(false);

    setTimeout(() => {
      namaInputRef.current?.focus();
    }, 100);
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar role="admin" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">

              {/* HEADER HALAMAN */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/guru")}
                    className="mb-3 inline-flex items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Data Guru
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="theme-primary flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg">
                      <UserPlus size={24} />
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold tracking-tight theme-text">
                        Tambah Guru
                      </h1>
                      <p className="mt-1 text-sm theme-text-muted">
                        Tambahkan data guru baru ke sistem SmartSchool.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={17} />
                    Reset
                  </button>

                  <button
                    type="submit"
                    form="form-tambah-guru"
                    disabled={
                      loading ||
                      loadingRole ||
                      loadingKategori ||
                      loadingShift ||
                      !guruRoleId
                    }
                    className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Simpan Guru
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="theme-danger theme-border mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      Terjadi kesalahan
                    </p>
                    <p className="mt-0.5 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="theme-success theme-border mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Berhasil</p>
                    <p className="mt-0.5 text-sm">{success}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">

                {/* KOLOM FORM */}
                <div className="min-w-0">
                  <form
                    id="form-tambah-guru"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >

                    {/* AKUN PENGGUNA */}
                    <section className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                      <SectionTitle
                        icon={Lock}
                        title="Akun Pengguna"
                        description="Data ini digunakan guru untuk login ke SmartSchool."
                      />

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Nama Lengkap <span className="text-[var(--color-danger)]">*</span>
                          </label>

                          <div className="relative">
                            <User
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              ref={namaInputRef}
                              type="text"
                              name="namaLengkap"
                              value={form.namaLengkap}
                              onChange={handleNamaChange}
                              placeholder="Contoh: Budi Santoso"
                              className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-4 ${
                                touched.namaLengkap && validation.namaLengkap
                                  ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                                  : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                              }`}
                            />
                          </div>

                          <FieldError
                            name="namaLengkap"
                            touched={touched}
                            validation={validation}
                          />
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Username <span className="text-[var(--color-danger)]">*</span>
                          </label>

                          <div className="relative">
                            <User
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              type="text"
                              name="namaPengguna"
                              value={form.namaPengguna}
                              onChange={handleUsernameChange}
                              placeholder="Contoh: budi.santoso"
                              className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-4 ${
                                touched.namaPengguna && validation.namaPengguna
                                  ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                                  : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                              }`}
                            />
                          </div>

                          <p className="theme-text-placeholder mt-1.5 text-xs">
                            Username digunakan saat login.
                          </p>

                          <FieldError
                            name="namaPengguna"
                            touched={touched}
                            validation={validation}
                          />
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Email <span className="text-[var(--color-danger)]">*</span>
                          </label>

                          <div className="relative">
                            <Mail
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              placeholder="guru@smartschool.com"
                              className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-4 ${
                                touched.email && validation.email
                                  ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                                  : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                              }`}
                            />
                          </div>

                          <FieldError
                            name="email"
                            touched={touched}
                            validation={validation}
                          />
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Kata Sandi <span className="text-[var(--color-danger)]">*</span>
                          </label>

                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Lock
                                size={18}
                                className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                              />

                              <input
                                type={showPassword ? "text" : "password"}
                                name="kataSandi"
                                value={form.kataSandi}
                                onChange={handleChange}
                                placeholder="Minimal 6 karakter"
                                className={`theme-input h-11 w-full rounded-xl border pl-10 pr-11 text-sm outline-none transition focus:ring-4 ${
                                  touched.kataSandi && validation.kataSandi
                                    ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                                    : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                                }`}
                              />

                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={
                                  showPassword
                                    ? "Sembunyikan kata sandi"
                                    : "Tampilkan kata sandi"
                                }
                                className="theme-text-placeholder absolute right-3 top-1/2 -translate-y-1/2 transition hover:text-[var(--color-text)]"
                              >
                                {showPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={handleGeneratePassword}
                              className="theme-info theme-border h-11 shrink-0 rounded-xl border px-3 text-xs font-semibold transition hover:opacity-90"
                            >
                              Generate
                            </button>
                          </div>

                          <FieldError
                            name="kataSandi"
                            touched={touched}
                            validation={validation}
                          />
                        </div>
                      </div>
                    </section>

                    {/* DATA KEPEGAWAIAN */}
                    <section className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                      <SectionTitle
                        icon={BriefcaseBusiness}
                        title="Data Kepegawaian"
                        description="Informasi identitas dan data kepegawaian guru."
                      />

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                        {/* NIP */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            NIP
                          </label>

                          <div className="relative">
                            <Hash
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              type="text"
                              name="nip"
                              value={form.nip}
                              onChange={handleChange}
                              placeholder="Contoh: 198501012010011001"
                              className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>
                        </div>

                        {/* NUPTK */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            NUPTK
                          </label>

                          <div className="relative">
                            <Hash
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              type="text"
                              name="nuptk"
                              value={form.nuptk}
                              onChange={handleChange}
                              placeholder="Masukkan NUPTK"
                              className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>
                        </div>

                        {/* KATEGORI JABATAN */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Kategori Jabatan{" "}
                            <span className="text-[var(--color-danger)]">*</span>
                          </label>

                          <div className="relative">
                            <Tags
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />

                            <select
                              name="kategoriJabatanId"
                              value={form.kategoriJabatanId}
                              onChange={handleKategoriJabatanChange}
                              disabled={
                                loadingKategori ||
                                daftarKategoriJabatan.length === 0
                              }
                              className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                                touched.kategoriJabatanId &&
                                validation.kategoriJabatanId
                                  ? "border-[var(--color-danger)]"
                                  : ""
                              }`}
                            >
                              <option value="">
                                {loadingKategori
                                  ? "Memuat kategori jabatan..."
                                  : daftarKategoriJabatan.length === 0
                                    ? "Belum ada kategori jabatan aktif"
                                    : "Pilih kategori jabatan"}
                              </option>

                              {daftarKategoriJabatan.map((kategori) => (
                                <option
                                  key={kategori.id}
                                  value={kategori.id}
                                >
                                  {kategori.nama}
                                  {kategori.kode
                                    ? ` (${kategori.kode})`
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <FieldError
                            name="kategoriJabatanId"
                            touched={touched}
                            validation={validation}
                          />

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Pilih kategori jabatan yang sudah diatur pada menu Kategori Jabatan.
                          </p>
                        </div>

                        {/* JABATAN OTOMATIS */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Jabatan
                          </label>

                          <input
                            type="text"
                            name="jabatan"
                            value={form.jabatan}
                            readOnly
                            placeholder="Otomatis dari kategori jabatan"
                            className="theme-input h-11 w-full cursor-not-allowed rounded-xl border px-4 text-sm outline-none opacity-80"
                          />

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Jabatan mengikuti kategori yang dipilih.
                          </p>
                        </div>

                        {/* SHIFT KERJA */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Shift Kerja{" "}
                            <span className="text-[var(--color-danger)]">*</span>
                          </label>

                          <div className="relative">
                            <Clock
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />

                            <select
                              name="shiftKerjaId"
                              value={form.shiftKerjaId}
                              onChange={handleChange}
                              disabled={
                                loadingShift ||
                                daftarShiftKerja.length === 0
                              }
                              className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                                touched.shiftKerjaId &&
                                validation.shiftKerjaId
                                  ? "border-[var(--color-danger)]"
                                  : ""
                              }`}
                            >
                              <option value="">
                                {loadingShift
                                  ? "Memuat shift kerja..."
                                  : daftarShiftKerja.length === 0
                                    ? "Belum ada shift kerja aktif"
                                    : "Pilih shift kerja"}
                              </option>

                              {daftarShiftKerja.map((shift) => (
                                <option
                                  key={shift.id}
                                  value={shift.id}
                                >
                                  {shift.nama}
                                  {shift.kode ? ` (${shift.kode})` : ""}
                                  {shift.jamMasuk && shift.jamKeluar
                                    ? ` - ${shift.jamMasuk} s/d ${shift.jamKeluar}`
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <FieldError
                            name="shiftKerjaId"
                            touched={touched}
                            validation={validation}
                          />

                          {selectedShiftKerja && (
                            <p className="theme-text-muted mt-1.5 text-xs">
                              Nilai yang dikirim ke backend:{" "}
                              <b className="theme-text">
                                {shiftKerjaValue || "Tidak dikenali"}
                              </b>
                            </p>
                          )}

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Pilih jadwal kerja guru dari master shift kerja.
                          </p>
                        </div>

                        {/* GOLONGAN */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Golongan
                          </label>

                          <select
                            name="golongan"
                            value={form.golongan}
                            onChange={handleChange}
                            className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                          >
                            <option value="">Pilih golongan</option>
                            <option value="III/a">III/a</option>
                            <option value="III/b">III/b</option>
                            <option value="III/c">III/c</option>
                            <option value="III/d">III/d</option>
                            <option value="IV/a">IV/a</option>
                            <option value="IV/b">IV/b</option>
                            <option value="IV/c">IV/c</option>
                            <option value="IV/d">IV/d</option>
                            <option value="IV/e">IV/e</option>
                          </select>
                        </div>

                        {/* JENIS KELAMIN */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Jenis Kelamin
                          </label>

                          <select
                            name="jenisKelamin"
                            value={form.jenisKelamin}
                            onChange={handleChange}
                            className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                          >
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                          </select>
                        </div>

                        {/* NIK */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            NIK
                          </label>

                          <div className="relative">
                            <Hash
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              type="text"
                              name="nik"
                              value={form.nik}
                              onChange={handleChange}
                              placeholder="16 digit NIK"
                              maxLength={16}
                              className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* DATA PRIBADI */}
                    <section className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                      <SectionTitle
                        icon={User}
                        title="Data Pribadi"
                        description="Informasi pribadi guru."
                      />

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Tempat Lahir
                          </label>
                          <input
                            type="text"
                            name="tempatLahir"
                            value={form.tempatLahir}
                            onChange={handleChange}
                            placeholder="Contoh: Jakarta"
                            className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                          />
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Tanggal Lahir
                          </label>

                          <div className="relative">
                            <CalendarDays
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              type="date"
                              name="tanggalLahir"
                              value={form.tanggalLahir}
                              onChange={handleChange}
                              className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            No. Telepon
                          </label>

                          <div className="relative">
                            <Phone
                              size={18}
                              className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              type="tel"
                              name="noTelepon"
                              value={form.noTelepon}
                              onChange={handleChange}
                              placeholder="08xxxxxxxxxx"
                              className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* ALAMAT */}
                    <section className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                      <SectionTitle
                        icon={MapPin}
                        title="Alamat"
                        description="Informasi alamat tempat tinggal guru."
                      />

                      <div className="space-y-5">
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Alamat
                          </label>

                          <textarea
                            name="alamat"
                            value={form.alamat}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Masukkan alamat lengkap..."
                            className="theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div>
                            <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                              Alamat KTP
                            </label>

                            <textarea
                              name="alamatKtp"
                              value={form.alamatKtp}
                              onChange={handleChange}
                              rows={3}
                              placeholder="Alamat sesuai KTP..."
                              className="theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>

                          <div>
                            <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                              Alamat Domisili
                            </label>

                            <textarea
                              name="alamatDomisili"
                              value={form.alamatDomisili}
                              onChange={handleChange}
                              rows={3}
                              placeholder="Alamat tempat tinggal saat ini..."
                              className="theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                              Kecamatan
                            </label>

                            <input
                              type="text"
                              name="kecamatan"
                              value={form.kecamatan}
                              onChange={handleChange}
                              placeholder="Kecamatan"
                              className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>

                          <div>
                            <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                              Kelurahan
                            </label>

                            <input
                              type="text"
                              name="kelurahan"
                              value={form.kelurahan}
                              onChange={handleChange}
                              placeholder="Kelurahan"
                              className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>

                          <div>
                            <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                              Kota / Kabupaten
                            </label>

                            <input
                              type="text"
                              name="kota"
                              value={form.kota}
                              onChange={handleChange}
                              placeholder="Kota / Kabupaten"
                              className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                            />
                          </div>

                          <div>
                            <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                              Status
                            </label>

                            <div className="theme-card-soft theme-border flex h-11 items-center gap-2 rounded-xl border px-4">
                              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
                              <span className="theme-text-secondary text-sm font-medium">
                                Aktif
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* TOMBOL FORM */}
                    <div className="theme-border flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => router.push("/admin/guru")}
                        disabled={loading}
                        className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={17} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={
                          loading ||
                          loadingRole ||
                          loadingKategori ||
                          loadingShift ||
                          !guruRoleId
                        }
                        className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={17} className="animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <GraduationCap size={18} />
                            Simpan Guru
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* KOLOM INFORMASI */}
                <aside className="flex min-w-0 flex-col gap-6">

                  {/* STATUS ROLE */}
                  <div className="theme-info theme-border rounded-2xl border p-4">
                    <div className="flex items-start gap-3">
                      <div className="theme-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        {loadingRole ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <ShieldCheck size={18} />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[var(--color-info)]">
                          Role pengguna
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-[var(--color-info)]">
                          {loadingRole
                            ? "Sedang mengambil role Guru dari backend..."
                            : guruRoleId
                              ? "Guru akan dibuat menggunakan role Guru yang tersimpan di database."
                              : "Role Guru belum ditemukan. Periksa endpoint role atau data pengguna Guru di database."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* STATUS KATEGORI */}
                  <div className="theme-info theme-border rounded-2xl border p-4">
                    <div className="flex items-start gap-3">
                      <div className="theme-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        {loadingKategori ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Tags size={18} />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[var(--color-info)]">
                          Kategori Jabatan
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-[var(--color-info)]">
                          {loadingKategori
                            ? "Sedang mengambil kategori jabatan..."
                            : daftarKategoriJabatan.length > 0
                              ? `${daftarKategoriJabatan.length} kategori jabatan aktif tersedia.`
                              : "Belum ada kategori jabatan aktif. Silakan atur kategori jabatan terlebih dahulu."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* STATUS SHIFT */}
                  <div className="theme-info theme-border rounded-2xl border p-4">
                    <div className="flex items-start gap-3">
                      <div className="theme-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        {loadingShift ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Clock size={18} />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[var(--color-info)]">
                          Master Shift Kerja
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-[var(--color-info)]">
                          {loadingShift
                            ? "Sedang mengambil shift kerja..."
                            : daftarShiftKerja.length > 0
                              ? `${daftarShiftKerja.length} shift kerja aktif tersedia.`
                              : "Belum ada shift kerja aktif. Silakan atur master shift kerja terlebih dahulu."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW */}
                  <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                      <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Eye className="h-4 w-4" />
                      </div>

                      <h2 className="theme-text text-sm font-bold">
                        Preview Data
                      </h2>
                    </div>

                    <div className="p-5">
                      <div className="space-y-4 text-xs">

                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Nama Lengkap
                          </p>

                          <p className="theme-text mt-1 break-words text-sm font-semibold">
                            {form.namaLengkap || "Belum diisi"}
                          </p>
                        </div>

                        <div className="theme-border-soft h-px" />

                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Username
                          </p>

                          <p className="theme-text mt-1 break-all text-sm font-semibold">
                            {form.namaPengguna || "-"}
                          </p>
                        </div>

                        <div className="theme-border-soft h-px" />

                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Kategori Jabatan
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <Tags
                              size={14}
                              className="text-[var(--color-primary)]"
                            />

                            <span className="theme-text text-sm font-semibold">
                              {selectedKategoriJabatan?.nama ||
                                "Belum dipilih"}
                            </span>
                          </div>
                        </div>

                        <div className="theme-border-soft h-px" />

                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Jabatan
                          </p>

                          <p className="theme-text mt-1 text-sm font-semibold">
                            {form.jabatan || "-"}
                          </p>
                        </div>

                        <div className="theme-border-soft h-px" />

                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Shift Kerja
                          </p>

                          <div className="mt-1 flex items-center gap-1.5">
                            <Clock
                              size={14}
                              className="text-[var(--color-primary)]"
                            />
                            <span className="theme-text text-sm font-semibold">
                              {selectedShiftKerja?.nama || "Belum dipilih"}
                            </span>
                          </div>

                          {selectedShiftKerja && (
                            <p className="theme-text-muted mt-1 text-xs">
                              {selectedShiftKerja.jamMasuk || "--:--"} s/d{" "}
                              {selectedShiftKerja.jamKeluar || "--:--"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PANDUAN */}
                  <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                      <div className="theme-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Lightbulb size={17} />
                      </div>

                      <h2 className="theme-text text-sm font-bold">
                        Panduan
                      </h2>
                    </div>

                    <div className="p-5">
                      <ul className="space-y-3 text-xs leading-5">
                        <li className="flex items-start gap-2">
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 shrink-0 text-[var(--color-success)]"
                          />
                          <span className="theme-text-secondary">
                            Gunakan tombol <b>Generate</b> untuk membuat password otomatis.
                          </span>
                        </li>

                        <li className="flex items-start gap-2">
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 shrink-0 text-[var(--color-success)]"
                          />
                          <span className="theme-text-secondary">
                            Username otomatis diisi dari nama lengkap, bisa diubah manual.
                          </span>
                        </li>

                        <li className="flex items-start gap-2">
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 shrink-0 text-[var(--color-success)]"
                          />
                          <span className="theme-text-secondary">
                            Pilih kategori jabatan dan shift kerja dari data master.
                          </span>
                        </li>

                        <li className="flex items-start gap-2">
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 shrink-0 text-[var(--color-success)]"
                          />
                          <span className="theme-text-secondary">
                            Email harus aktif untuk proses pemulihan akun.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* PENUGASAN MAPEL */}
                  <div className="theme-warning theme-border rounded-2xl border p-5">
                    <div className="flex items-start gap-3">
                      <div className="theme-warning theme-border flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                        <BookOpen size={18} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-[var(--color-warning)]">
                          Penugasan Mata Pelajaran
                        </h3>

                        <p className="mt-1 text-[11px] leading-5 text-[var(--color-warning)]">
                          Penugasan guru ke mata pelajaran dilakukan melalui relasi <b>KelasMapel</b>, bukan langsung dari formulir ini.
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
    </div>
  );
}
