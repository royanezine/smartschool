"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import {
  ArrowLeft,
  IdCard,
  Save,
  X,
} from "lucide-react";

/**
 * app/admin/siswa/kartu-identitas/tambah/page.jsx
 *
 * Halaman tambah siswa baru.
 *
 * Data baru dititipkan sementara ke localStorage menggunakan
 * key "ki_new_siswa_queue", kemudian diarahkan kembali ke
 * halaman daftar kartu identitas siswa.
 */

const QUEUE_KEY = "ki_new_siswa_queue";

const JENIS_KELAMIN_OPTIONS = [
  "Laki-laki",
  "Perempuan",
];

const AGAMA_OPTIONS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];

const HUBUNGAN_OPTIONS = [
  "Ayah",
  "Ibu",
  "Wali",
];

const STATUS_OPTIONS = [
  "aktif",
  "nonaktif",
];

const KELAS_OPTIONS = [
  "7A",
  "7B",
  "8A",
  "8B",
  "9A",
  "9B",
];

const EMPTY_FORM = {
  nama: "",
  nisn: "",
  nik: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  agama: "",

  kelas: "",
  tahunMasuk: "",
  status: "aktif",

  noTelepon: "",
  email: "",
  alamat: "",

  namaOrtu: "",
  hubunganOrtu: "",
  teleponOrtu: "",
  alamatOrtu: "",
};

const REQUIRED_FIELDS = [
  "nama",
  "nisn",
  "jenisKelamin",
  "kelas",
  "namaOrtu",
];

function Field({ label, children, required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800";

export default function TambahSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!String(form[field] || "").trim()) {
        nextErrors[field] = "Wajib diisi";
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const raw =
        window.localStorage.getItem(QUEUE_KEY);

      const queue = raw
        ? JSON.parse(raw)
        : [];

      const newSiswa = {
        ...form,

        // Tambahkan ID sementara
        id: `siswa-${Date.now()}`,

        // Waktu dibuat
        createdAt: new Date().toISOString(),
      };

      queue.push(newSiswa);

      window.localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify(queue)
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan data siswa baru:",
        error
      );
    }

    router.push(
      "/admin/siswa/kartu-identitas"
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="siswaKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">

        {/* HEADER */}

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="flex-1 w-full overflow-y-auto">

          <div className="w-full max-w-none p-4 sm:p-6 lg:p-8 space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  router.push(
                    "/admin/siswa/kartu-identitas"
                  )
                }
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 flex-shrink-0"
                title="Kembali ke daftar"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-slate-900/10">
                <IdCard size={20} />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-800">
                  Tambah Siswa
                </h1>

                <p className="text-sm text-slate-500">
                  Isi data identitas siswa baru.
                </p>

              </div>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* =================================================
                    DATA IDENTITAS
                ================================================= */}

                <div>

                  <div className="mb-4">

                    <h2 className="text-sm font-bold text-slate-800">
                      Data Identitas Siswa
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Informasi dasar dan identitas siswa.
                    </p>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                    {/* NAMA */}

                    <Field
                      label="Nama lengkap"
                      required
                    >

                      <input
                        type="text"
                        value={form.nama}
                        onChange={handleChange("nama")}
                        placeholder="cth. Alya Ramadhani"
                        className={inputClass}
                      />

                      {errors.nama && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.nama}
                        </p>
                      )}

                    </Field>

                    {/* NISN */}

                    <Field
                      label="NISN"
                      required
                    >

                      <input
                        type="text"
                        value={form.nisn}
                        onChange={handleChange("nisn")}
                        placeholder="cth. 0051234567"
                        className={`${inputClass} font-mono`}
                      />

                      {errors.nisn && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.nisn}
                        </p>
                      )}

                    </Field>

                    {/* NIK */}

                    <Field label="NIK">

                      <input
                        type="text"
                        value={form.nik}
                        onChange={handleChange("nik")}
                        placeholder="cth. 3278123456780001"
                        className={`${inputClass} font-mono`}
                      />

                    </Field>

                    {/* JENIS KELAMIN */}

                    <Field
                      label="Jenis kelamin"
                      required
                    >

                      <select
                        value={form.jenisKelamin}
                        onChange={handleChange(
                          "jenisKelamin"
                        )}
                        className={`${inputClass} bg-white`}
                      >

                        <option value="">
                          Pilih jenis kelamin
                        </option>

                        {JENIS_KELAMIN_OPTIONS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}

                      </select>

                      {errors.jenisKelamin && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.jenisKelamin}
                        </p>
                      )}

                    </Field>

                    {/* TEMPAT LAHIR */}

                    <Field label="Tempat lahir">

                      <input
                        type="text"
                        value={form.tempatLahir}
                        onChange={handleChange(
                          "tempatLahir"
                        )}
                        placeholder="cth. Tasikmalaya"
                        className={inputClass}
                      />

                    </Field>

                    {/* TANGGAL LAHIR */}

                    <Field label="Tanggal lahir">

                      <input
                        type="date"
                        value={form.tanggalLahir}
                        onChange={handleChange(
                          "tanggalLahir"
                        )}
                        className={inputClass}
                      />

                    </Field>

                    {/* AGAMA */}

                    <Field label="Agama">

                      <select
                        value={form.agama}
                        onChange={handleChange("agama")}
                        className={`${inputClass} bg-white`}
                      >

                        <option value="">
                          Pilih agama
                        </option>

                        {AGAMA_OPTIONS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}

                      </select>

                    </Field>

                    {/* TELEPON */}

                    <Field label="Nomor telepon">

                      <input
                        type="text"
                        value={form.noTelepon}
                        onChange={handleChange(
                          "noTelepon"
                        )}
                        placeholder="cth. 0812-3456-7890"
                        className={inputClass}
                      />

                    </Field>

                    {/* EMAIL */}

                    <Field label="Email">

                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="cth. siswa@smartschool.sch.id"
                        className={inputClass}
                      />

                    </Field>

                    {/* ALAMAT */}

                    <div className="sm:col-span-2 xl:col-span-3">

                      <Field label="Alamat">

                        <textarea
                          value={form.alamat}
                          onChange={handleChange(
                            "alamat"
                          )}
                          placeholder="cth. Jl. Merdeka No. 12, Tasikmalaya"
                          rows={2}
                          className={`${inputClass} resize-none`}
                        />

                      </Field>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    DATA AKADEMIK
                ================================================= */}

                <div className="border-t border-slate-100 pt-5">

                  <div className="mb-4">

                    <h2 className="text-sm font-bold text-slate-800">
                      Data Akademik
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Informasi kelas dan status siswa.
                    </p>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                    {/* KELAS */}

                    <Field
                      label="Kelas"
                      required
                    >

                      <select
                        value={form.kelas}
                        onChange={handleChange("kelas")}
                        className={`${inputClass} bg-white`}
                      >

                        <option value="">
                          Pilih kelas
                        </option>

                        {KELAS_OPTIONS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}

                      </select>

                      {errors.kelas && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.kelas}
                        </p>
                      )}

                    </Field>

                    {/* TAHUN MASUK */}

                    <Field label="Tahun masuk">

                      <input
                        type="text"
                        value={form.tahunMasuk}
                        onChange={handleChange(
                          "tahunMasuk"
                        )}
                        placeholder="cth. 2025"
                        className={inputClass}
                      />

                    </Field>

                    {/* STATUS */}

                    <Field label="Status">

                      <select
                        value={form.status}
                        onChange={handleChange("status")}
                        className={`${inputClass} bg-white`}
                      >

                        {STATUS_OPTIONS.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status === "aktif"
                                ? "Aktif"
                                : "Nonaktif"}
                            </option>
                          )
                        )}

                      </select>

                    </Field>

                  </div>

                </div>


                {/* =================================================
                    DATA ORANG TUA
                ================================================= */}

                <div className="border-t border-slate-100 pt-5">

                  <div className="mb-4">

                    <h2 className="text-sm font-bold text-slate-800">
                      Data Orang Tua / Wali
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Informasi orang tua atau wali siswa.
                    </p>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                    {/* NAMA ORTU */}

                    <Field
                      label="Nama orang tua / wali"
                      required
                    >

                      <input
                        type="text"
                        value={form.namaOrtu}
                        onChange={handleChange(
                          "namaOrtu"
                        )}
                        placeholder="cth. Hendra Ramadhani"
                        className={inputClass}
                      />

                      {errors.namaOrtu && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.namaOrtu}
                        </p>
                      )}

                    </Field>

                    {/* HUBUNGAN */}

                    <Field label="Hubungan">

                      <select
                        value={form.hubunganOrtu}
                        onChange={handleChange(
                          "hubunganOrtu"
                        )}
                        className={`${inputClass} bg-white`}
                      >

                        <option value="">
                          Pilih hubungan
                        </option>

                        {HUBUNGAN_OPTIONS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}

                      </select>

                    </Field>

                    {/* TELEPON ORTU */}

                    <Field label="Nomor telepon orang tua / wali">

                      <input
                        type="text"
                        value={form.teleponOrtu}
                        onChange={handleChange(
                          "teleponOrtu"
                        )}
                        placeholder="cth. 0812-9988-7766"
                        className={inputClass}
                      />

                    </Field>

                    {/* ALAMAT ORTU */}

                    <div className="sm:col-span-2 xl:col-span-3">

                      <Field label="Alamat orang tua / wali">

                        <textarea
                          value={form.alamatOrtu}
                          onChange={handleChange(
                            "alamatOrtu"
                          )}
                          placeholder="cth. Jl. Merdeka No. 12, Tasikmalaya"
                          rows={2}
                          className={`${inputClass} resize-none`}
                        />

                      </Field>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    BUTTON
                ================================================= */}

                <div className="flex items-center gap-2 pt-2 max-w-md ml-auto">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/siswa/kartu-identitas"
                      )
                    }
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >

                    <X size={15} />

                    Batal

                  </button>

                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold hover:brightness-110 transition-all"
                  >

                    <Save size={15} />

                    Simpan Siswa

                  </button>

                </div>

              </form>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}