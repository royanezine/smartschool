"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  ArrowLeft,
  Save,
  User,
  UserRound,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  getUserById,
  updateUser,
} from "../../../../../../services/user.service";

// =========================================================
// DEFAULT FORM
// =========================================================

const DEFAULT_FORM = {
  nama: "",
  nis: "",
  nisn: "",
  kelas: "",
  status: "aktif",
  gender: "L",
  tglLahir: "",
  joinDate: "",
  tempatLahir: "",

  kecamatan: "",
  kota: "",
  kelurahan: "",
  provinsi: "",

  email: "",
  phone: "",
  alamat: "",

  nikOrtu: "",
  namaOrtu: "",
  pekerjaanOrtu: "",
  alamatKtpOrtu: "",
  alamatDomisiliOrtu: "",
  domisiliSama: true,
};

// =========================================================
// HELPER
// =========================================================

function formatDateForInput(value) {
  if (!value) return "";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function normalizeGender(value) {
  if (!value) return "L";

  const normalized = String(value).toLowerCase();

  if (
    normalized === "p" ||
    normalized === "perempuan" ||
    normalized === "female" ||
    normalized === "wanita"
  ) {
    return "P";
  }

  return "L";
}

function normalizeStatus(value) {
  if (!value) return "aktif";

  const normalized = String(value).toLowerCase();

  if (
    normalized === "nonaktif" ||
    normalized === "inactive" ||
    normalized === "tidak aktif"
  ) {
    return "nonaktif";
  }

  return "aktif";
}

function getErrorMessage(error) {
  if (!error) {
    return "Terjadi kesalahan.";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.response?.data?.message ||
    "Terjadi kesalahan saat memproses data."
  );
}

// =========================================================
// PAGE
// =========================================================

export default function EditSiswaPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id ? String(params.id) : "";

  // =======================================================
  // STATE
  // =======================================================

  const [form, setForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =======================================================
  // LOAD DATA FROM BACKEND
  // =======================================================

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID siswa tidak ditemukan.");
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const response = await getUserById(id);

        if (cancelled) return;

        const user = response?.data;

        if (!user) {
          throw new Error("Data siswa tidak ditemukan.");
        }

        /*
         * Data backend:
         *
         * namaLengkap
         * nipd
         * nisn
         * jenisKelamin
         * tanggalLahir
         * email
         * noTelepon
         * alamat
         * nik
         * namaAyah
         * pekerjaanAyah
         * alamatKtp
         * alamatDomisili
         * kecamatan
         * kelurahan
         * kotaKabupaten
         */

        setForm({
          nama: user.namaLengkap || "",

          // NIS di FE menggunakan nipd dari BE
          nis: user.nipd || "",

          nisn: user.nisn || "",

          /*
           * Backend user.controller yang diberikan belum
           * mengembalikan relasi kelas.
           *
           * Kalau nanti BE mengembalikan user.kelas / user.kelasId,
           * bagian ini bisa langsung digunakan.
           */
          kelas:
            user.kelas?.nama ||
            user.kelasNama ||
            user.kelas?.namaKelas ||
            "",

          status: normalizeStatus(user.status),

          gender: normalizeGender(user.jenisKelamin),

          tglLahir: formatDateForInput(user.tanggalLahir),

          joinDate: formatDateForInput(user.dibuatPada),

          tempatLahir: user.tempatLahir || "",

          kecamatan: user.kecamatan || "",

          kota:
            user.kotaKabupaten ||
            user.kota ||
            "",

          kelurahan: user.kelurahan || "",

          /*
           * Controller BE yang kamu kirim belum mempunyai
           * field provinsi.
           */
          provinsi: user.provinsi || "",

          email: user.email || "",

          phone: user.noTelepon || "",

          alamat: user.alamat || "",

          /*
           * Untuk saat ini menggunakan data ayah sebagai
           * data orang tua utama karena form lama hanya
           * memiliki satu field orang tua.
           */
          nikOrtu: user.nik || "",

          namaOrtu:
            user.namaAyah ||
            user.namaIbu ||
            "",

          pekerjaanOrtu:
            user.pekerjaanAyah ||
            user.pekerjaanIbu ||
            "",

          alamatKtpOrtu: user.alamatKtp || "",

          alamatDomisiliOrtu: user.alamatDomisili || "",

          domisiliSama:
            !user.alamatDomisili ||
            user.alamatDomisili === user.alamatKtp,
        });
      } catch (err) {
        if (cancelled) return;

        console.error("Error load siswa:", err);

        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =======================================================
  // HANDLE INPUT
  // =======================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // =======================================================
  // HANDLE DOMISILI SAMA
  // =======================================================

  const handleDomisiliSamaChange = (event) => {
    const checked = event.target.checked;

    setForm((prev) => ({
      ...prev,
      domisiliSama: checked,
      alamatDomisiliOrtu: checked
        ? prev.alamatKtpOrtu
        : prev.alamatDomisiliOrtu,
    }));
  };

  // =======================================================
  // VALIDATION
  // =======================================================

  const validateForm = () => {
    if (!form.nama.trim()) {
      return "Nama siswa wajib diisi.";
    }

    if (!form.nis.trim()) {
      return "NIS wajib diisi.";
    }

    if (!form.nisn.trim()) {
      return "NISN wajib diisi.";
    }

    if (!form.email.trim()) {
      return "Email wajib diisi.";
    }

    return "";
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    if (!id) {
      setError("ID siswa tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      /*
       * Mapping FE -> BE
       */
      const payload = {
        namaLengkap: form.nama.trim(),

        // NIS FE -> nipd BE
        nipd: form.nis.trim(),

        nisn: form.nisn.trim(),

        email: form.email.trim(),

        jenisKelamin: form.gender,

        tempatLahir: form.tempatLahir.trim() || null,

        tanggalLahir: form.tglLahir || null,

        alamat: form.alamat.trim() || null,

        noTelepon: form.phone.trim() || null,

        status: form.status,

        nik: form.nikOrtu.trim() || null,

        /*
         * Karena form lama hanya menyediakan satu
         * data orang tua, kita simpan ke Ayah.
         */
        namaAyah: form.namaOrtu.trim() || null,

        pekerjaanAyah: form.pekerjaanOrtu.trim() || null,

        alamatKtp: form.alamatKtpOrtu.trim() || null,

        alamatDomisili: form.domisiliSama
          ? form.alamatKtpOrtu.trim() || null
          : form.alamatDomisiliOrtu.trim() || null,

        kecamatan: form.kecamatan.trim() || null,

        kelurahan: form.kelurahan.trim() || null,

        /*
         * Backend updateUser saat ini masih perlu
         * diperbaiki agar kota menggunakan:
         *
         * kotaKabupaten: kota
         *
         * BUKAN:
         * kota: kota
         *
         * Jadi sementara field ini dikirim dengan
         * nama yang sekarang dibaca controller.
         */
        kota: form.kota.trim() || null,
      };

      console.log("========== UPDATE SISWA ==========");
      console.log("ID:", id);
      console.log("PAYLOAD:", payload);
      console.log("==================================");

      const response = await updateUser(id, payload);

      console.log("========== RESPONSE UPDATE ==========");
      console.log(response);
      console.log("=====================================");

      setSuccessMessage(
        response?.message || "Data siswa berhasil diperbarui."
      );

      /*
       * Tunggu sebentar supaya user bisa melihat
       * notifikasi berhasil.
       */
      setTimeout(() => {
        router.push("/admin/siswa");
      }, 700);
    } catch (err) {
      console.error("Error update siswa:", err);

      setError(getErrorMessage(err));

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar role="admin" active="siswa" />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

              <p className="text-sm font-medium">
                Mengambil data siswa...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="admin" active="siswa" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.push("/admin/siswa")}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />

                Kembali ke Data Siswa
              </button>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Edit Data Siswa
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Perbarui informasi data siswa melalui sistem.
                </p>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Gagal
                  </p>

                  <p className="mt-0.5 text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Berhasil
                  </p>

                  <p className="mt-0.5 text-sm text-emerald-700">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>
              {/* =================================================
                  DATA UTAMA
              ================================================= */}

              <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        Data Utama Siswa
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Informasi dasar siswa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  {/* NAMA */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nama Lengkap
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap siswa"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* NIS */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      NIS
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="nis"
                      value={form.nis}
                      onChange={handleChange}
                      placeholder="Masukkan NIS"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* NISN */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      NISN
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="nisn"
                      value={form.nisn}
                      onChange={handleChange}
                      placeholder="Masukkan NISN"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* KELAS */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Kelas
                    </label>

                    <input
                      type="text"
                      name="kelas"
                      value={form.kelas}
                      readOnly
                      placeholder="Kelas belum tersedia dari backend"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Data kelas belum dapat diubah melalui endpoint
                      pengguna saat ini.
                    </p>
                  </div>

                  {/* STATUS */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>

                  {/* GENDER */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Jenis Kelamin
                    </label>

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  {/* TEMPAT LAHIR */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Tempat Lahir
                    </label>

                    <input
                      type="text"
                      name="tempatLahir"
                      value={form.tempatLahir}
                      onChange={handleChange}
                      placeholder="Masukkan tempat lahir"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* TANGGAL LAHIR */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Tanggal Lahir
                    </label>

                    <input
                      type="date"
                      name="tglLahir"
                      value={form.tglLahir}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* JOIN DATE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Tanggal Bergabung
                    </label>

                    <input
                      type="date"
                      name="joinDate"
                      value={form.joinDate}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Diambil dari tanggal data dibuat di backend.
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  ALAMAT
              ================================================= */}

              <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        Alamat Siswa
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Informasi alamat tempat tinggal siswa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  {/* ALAMAT */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Alamat Lengkap
                    </label>

                    <textarea
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Masukkan alamat lengkap siswa"
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* PROVINSI */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Provinsi
                    </label>

                    <input
                      type="text"
                      name="provinsi"
                      value={form.provinsi}
                      onChange={handleChange}
                      placeholder="Masukkan provinsi"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Field ini belum dikirim ke backend karena belum ada
                      pada controller.
                    </p>
                  </div>

                  {/* KOTA */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Kota / Kabupaten
                    </label>

                    <input
                      type="text"
                      name="kota"
                      value={form.kota}
                      onChange={handleChange}
                      placeholder="Masukkan kota/kabupaten"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* KECAMATAN */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Kecamatan
                    </label>

                    <input
                      type="text"
                      name="kecamatan"
                      value={form.kecamatan}
                      onChange={handleChange}
                      placeholder="Masukkan kecamatan"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* KELURAHAN */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Kelurahan
                    </label>

                    <input
                      type="text"
                      name="kelurahan"
                      value={form.kelurahan}
                      onChange={handleChange}
                      placeholder="Masukkan kelurahan"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  KONTAK
              ================================================= */}

              <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <UserRound className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        Informasi Kontak
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Email dan nomor telepon siswa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  {/* EMAIL */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="contoh@email.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nomor Telepon
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="08xxxxxxxxxx"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  ORANG TUA / WALI
              ================================================= */}

              <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        Data Orang Tua / Wali
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Informasi orang tua atau wali siswa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  {/* NIK */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      NIK Orang Tua / Wali
                    </label>

                    <input
                      type="text"
                      name="nikOrtu"
                      value={form.nikOrtu}
                      onChange={handleChange}
                      placeholder="Masukkan NIK"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* NAMA ORTU */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nama Orang Tua / Wali
                    </label>

                    <input
                      type="text"
                      name="namaOrtu"
                      value={form.namaOrtu}
                      onChange={handleChange}
                      placeholder="Masukkan nama orang tua / wali"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* PEKERJAAN */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Pekerjaan Orang Tua / Wali
                    </label>

                    <input
                      type="text"
                      name="pekerjaanOrtu"
                      value={form.pekerjaanOrtu}
                      onChange={handleChange}
                      placeholder="Masukkan pekerjaan"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* ALAMAT KTP */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Alamat KTP Orang Tua / Wali
                    </label>

                    <textarea
                      name="alamatKtpOrtu"
                      value={form.alamatKtpOrtu}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Masukkan alamat sesuai KTP"
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* CHECKBOX */}
                  <div className="md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.domisiliSama}
                        onChange={handleDomisiliSamaChange}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      <span className="text-sm font-medium text-slate-700">
                        Alamat domisili sama dengan alamat KTP
                      </span>
                    </label>
                  </div>

                  {/* ALAMAT DOMISILI */}
                  {!form.domisiliSama && (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Alamat Domisili Orang Tua / Wali
                      </label>

                      <textarea
                        name="alamatDomisiliOrtu"
                        value={form.alamatDomisiliOrtu}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Masukkan alamat domisili"
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  ACTION
              ================================================= */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/admin/siswa")}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Perbarui Data
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}