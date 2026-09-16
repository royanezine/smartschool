"use client";

import { Suspense, useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  User,
  Users,
  School,
  ClipboardList,
} from "lucide-react";

import PpdbHeader from "../../components/ppdb/PpdbHeader";
import PpdbStepper from "../../components/ppdb/PpdbStepper";
import PpdbFooter from "../../components/ppdb/PpdbFooter";

import { daftarPpdb } from "../../../services/ppdb.service";

function DaftarPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /*
   * ============================================================
   * ID DATABASE
   * ============================================================
   *
   * Prioritas:
   * 1. URL
   * 2. sessionStorage
   * 3. environment variable
   */

  const [sekolahId, setSekolahId] =
    useState("");

  const [jalurPpdbId, setJalurPpdbId] =
    useState("");

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  const [form, setForm] = useState({
    namaLengkap: "",
    nisn: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    alamat: "",
    telepon: "",
    email: "",
    namaAyah: "",
    namaIbu: "",
    asalSekolah: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  /*
   * ============================================================
   * AMBIL ID PPDB
   * ============================================================
   */

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const sekolahFromUrl =
      searchParams.get("sekolahId") || "";

    const jalurFromUrl =
      searchParams.get("jalurPpdbId") || "";

    const sekolahFromSession =
      sessionStorage.getItem(
        "ppdb_sekolah_id"
      ) || "";

    const jalurFromSession =
      sessionStorage.getItem(
        "ppdb_jalur_id"
      ) || "";

    const sekolahFromEnv =
      process.env
        .NEXT_PUBLIC_PPDB_SEKOLAH_ID || "";

    const jalurFromEnv =
      process.env
        .NEXT_PUBLIC_PPDB_JALUR_ID || "";

    const finalSekolahId =
      sekolahFromUrl ||
      sekolahFromSession ||
      sekolahFromEnv;

    const finalJalurPpdbId =
      jalurFromUrl ||
      jalurFromSession ||
      jalurFromEnv;

    setSekolahId(finalSekolahId);
    setJalurPpdbId(finalJalurPpdbId);

    /*
     * Simpan kembali ke sessionStorage
     * supaya tetap tersedia saat berpindah halaman.
     */

    if (finalSekolahId) {
      sessionStorage.setItem(
        "ppdb_sekolah_id",
        finalSekolahId
      );
    }

    if (finalJalurPpdbId) {
      sessionStorage.setItem(
        "ppdb_jalur_id",
        finalJalurPpdbId
      );
    }

    console.log(
      "=== ID PPDB ==="
    );

    console.log(
      "sekolahId:",
      finalSekolahId
    );

    console.log(
      "jalurPpdbId:",
      finalJalurPpdbId
    );
  }, [searchParams]);

  /*
   * ============================================================
   * UPDATE FIELD
   * ============================================================
   */

  const update = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));

    setSubmitError("");
  };

  /*
   * ============================================================
   * VALIDASI
   * ============================================================
   */

  const validateForm = () => {
    const newErrors = {};

    if (!form.namaLengkap.trim()) {
      newErrors.namaLengkap =
        "Nama lengkap wajib diisi";
    }

    if (!form.nisn.trim()) {
      newErrors.nisn =
        "NISN wajib diisi";
    } else if (
      form.nisn.trim().length < 10
    ) {
      newErrors.nisn =
        "NISN minimal 10 digit";
    }

    if (!form.tempatLahir.trim()) {
      newErrors.tempatLahir =
        "Tempat lahir wajib diisi";
    }

    if (!form.tanggalLahir) {
      newErrors.tanggalLahir =
        "Tanggal lahir wajib diisi";
    }

    if (!form.jenisKelamin) {
      newErrors.jenisKelamin =
        "Jenis kelamin wajib dipilih";
    }

    if (!form.alamat.trim()) {
      newErrors.alamat =
        "Alamat wajib diisi";
    } else if (
      form.alamat.trim().length < 5
    ) {
      newErrors.alamat =
        "Alamat minimal 5 karakter";
    }

    if (
      form.telepon &&
      form.telepon.trim().length > 20
    ) {
      newErrors.telepon =
        "Nomor telepon maksimal 20 karakter";
    }

    if (!form.namaAyah.trim()) {
      newErrors.namaAyah =
        "Nama ayah wajib diisi";
    }

    if (!form.namaIbu.trim()) {
      newErrors.namaIbu =
        "Nama ibu wajib diisi";
    }

    if (!form.email.trim()) {
      newErrors.email =
        "Email wajib diisi";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        form.email.trim()
      )
    ) {
      newErrors.email =
        "Format email tidak valid";
    }

    if (!form.asalSekolah.trim()) {
      newErrors.asalSekolah =
        "Asal sekolah wajib diisi";
    }

    /*
     * ID DATABASE WAJIB
     */

    if (!sekolahId) {
      newErrors.sekolahId =
        "Sekolah tujuan belum ditentukan.";
    }

    if (!jalurPpdbId) {
      newErrors.jalurPpdbId =
        "Jalur PPDB belum ditentukan.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /*
   * ============================================================
   * SUBMIT KE BACKEND
   * ============================================================
   *
   * POST /api/v1/ppdb/daftar
   */

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitError(
        "Masih ada data yang belum lengkap."
      );

      return;
    }

    const payload = {
      sekolahId,
      jalurPpdbId,

      namaLengkap:
        form.namaLengkap.trim(),

      nisn:
        form.nisn.trim(),

      tempatLahir:
        form.tempatLahir.trim(),

      tanggalLahir:
        form.tanggalLahir,

      jenisKelamin:
        form.jenisKelamin,

      alamat:
        form.alamat.trim(),

      telepon:
        form.telepon.trim() ||
        undefined,

      email:
        form.email.trim() ||
        undefined,

      namaAyah:
        form.namaAyah.trim() ||
        undefined,

      namaIbu:
        form.namaIbu.trim() ||
        undefined,

      asalSekolah:
        form.asalSekolah.trim() ||
        undefined,
    };

    try {
      setSubmitting(true);
      setSubmitError("");

      console.log(
        "================================"
      );

      console.log(
        "SUBMIT PPDB"
      );

      console.log(
        "================================"
      );

      console.log(
        "Payload:",
        payload
      );

      /*
       * KIRIM KE BE
       */

      const response =
        await daftarPpdb(payload);

      console.log(
        "Response BE:",
        response
      );

      /*
       * VALIDASI RESPONSE
       */

      if (
        !response?.success ||
        !response?.data?.id
      ) {
        throw new Error(
          response?.message ||
            "Pendaftaran gagal diproses oleh server."
        );
      }

      const pendaftaranId =
        response.data.id;

      console.log(
        "Pendaftaran berhasil."
      );

      console.log(
        "ID:",
        pendaftaranId
      );

      /*
       * SIMPAN ID PENDAFTARAN
       */

      sessionStorage.setItem(
        "ppdb_pendaftaran_id",
        String(pendaftaranId)
      );

      /*
       * SIMPAN NOMOR PENDAFTARAN
       */

      if (
        response.data.nomorPendaftaran
      ) {
        sessionStorage.setItem(
          "ppdb_nomor_pendaftaran",
          String(
            response.data.nomorPendaftaran
          )
        );
      }

      /*
       * SIMPAN ID SEKOLAH & JALUR
       */

      if (sekolahId) {
        sessionStorage.setItem(
          "ppdb_sekolah_id",
          sekolahId
        );
      }

      if (jalurPpdbId) {
        sessionStorage.setItem(
          "ppdb_jalur_id",
          jalurPpdbId
        );
      }

      /*
       * PINDAH KE UPLOAD BERKAS
       */

      const uploadUrl =
        `/PPDB/daftar/uploadBerkas?id=${encodeURIComponent(
          String(pendaftaranId)
        )}`;

      console.log(
        "Redirect:",
        uploadUrl
      );

      router.push(uploadUrl);
    } catch (error) {
      console.error(
        "Error daftar PPDB:",
        error
      );

      setSubmitError(
        error?.message ||
          "Terjadi kesalahan saat mengirim pendaftaran."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ============================================================
            KEMBALI
        ============================================================ */}

        <button
          type="button"
          onClick={() =>
            router.push("/PPDB")
          }
          disabled={submitting}
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={15} />
          Kembali ke PPDB
        </button>

        {/* ============================================================
            HEADER
        ============================================================ */}

        <PpdbHeader
          eyebrow="PPDB Online"
          title="Pendaftaran Peserta Didik Baru"
          description="Lengkapi data calon peserta didik dengan benar untuk melanjutkan ke tahap upload dokumen."
        />

        <div className="mt-6">
          {/* ============================================================
              ERROR
          ============================================================ */}

          {submitError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-rose-500"
              />

              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Pendaftaran gagal
                </p>

                <p className="mt-1 text-xs leading-5 text-rose-600">
                  {submitError}
                </p>
              </div>
            </div>
          )}

          {/* ============================================================
              STEPPER
          ============================================================ */}

          <PpdbStepper currentStep={1} />

          {/* ============================================================
              FORM CARD
          ============================================================ */}

          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
            {/* ==========================================================
                DATA CALON SISWA
            ========================================================== */}

            <section>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <User
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                    Data Calon Siswa
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Masukkan data calon siswa
                    sesuai dokumen resmi.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Nama Lengkap"
                  required
                  error={
                    errors.namaLengkap
                  }
                >
                  <input
                    type="text"
                    value={
                      form.namaLengkap
                    }
                    onChange={(e) =>
                      update(
                        "namaLengkap",
                        e.target.value
                      )
                    }
                    placeholder="Nama lengkap calon siswa"
                    disabled={submitting}
                    className={inputClass(
                      errors.namaLengkap
                    )}
                  />
                </Field>

                <Field
                  label="NISN"
                  required
                  error={errors.nisn}
                >
                  <input
                    type="text"
                    value={form.nisn}
                    onChange={(e) =>
                      update(
                        "nisn",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    maxLength={20}
                    placeholder="Nomor Induk Siswa Nasional"
                    disabled={submitting}
                    className={inputClass(
                      errors.nisn
                    )}
                  />
                </Field>

                <Field
                  label="Tempat Lahir"
                  required
                  error={
                    errors.tempatLahir
                  }
                >
                  <input
                    type="text"
                    value={
                      form.tempatLahir
                    }
                    onChange={(e) =>
                      update(
                        "tempatLahir",
                        e.target.value
                      )
                    }
                    placeholder="Kota tempat lahir"
                    disabled={submitting}
                    className={inputClass(
                      errors.tempatLahir
                    )}
                  />
                </Field>

                <Field
                  label="Tanggal Lahir"
                  required
                  error={
                    errors.tanggalLahir
                  }
                >
                  <input
                    type="date"
                    value={
                      form.tanggalLahir
                    }
                    onChange={(e) =>
                      update(
                        "tanggalLahir",
                        e.target.value
                      )
                    }
                    disabled={submitting}
                    className={inputClass(
                      errors.tanggalLahir
                    )}
                  />
                </Field>

                <Field
                  label="Jenis Kelamin"
                  required
                  error={
                    errors.jenisKelamin
                  }
                >
                  <select
                    value={
                      form.jenisKelamin
                    }
                    onChange={(e) =>
                      update(
                        "jenisKelamin",
                        e.target.value
                      )
                    }
                    disabled={submitting}
                    className={inputClass(
                      errors.jenisKelamin
                    )}
                  >
                    <option value="">
                      Pilih jenis kelamin
                    </option>

                    <option value="L">
                      Laki-laki
                    </option>

                    <option value="P">
                      Perempuan
                    </option>
                  </select>
                </Field>

                <Field
                  label="Nomor Telepon"
                  error={
                    errors.telepon
                  }
                >
                  <input
                    type="text"
                    value={form.telepon}
                    onChange={(e) =>
                      update(
                        "telepon",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    maxLength={20}
                    placeholder="08xxxxxxxxxx"
                    disabled={submitting}
                    className={inputClass(
                      errors.telepon
                    )}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label="Alamat"
                    required
                    error={errors.alamat}
                  >
                    <textarea
                      value={form.alamat}
                      onChange={(e) =>
                        update(
                          "alamat",
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Alamat lengkap calon siswa"
                      disabled={submitting}
                      className={inputClass(
                        errors.alamat
                      )}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* ==========================================================
                DATA ORANG TUA
            ========================================================== */}

            <section className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Users
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                    Data Orang Tua / Wali
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Lengkapi informasi orang
                    tua/wali dan kontak.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Nama Ayah"
                  required
                  error={errors.namaAyah}
                >
                  <input
                    type="text"
                    value={form.namaAyah}
                    onChange={(e) =>
                      update(
                        "namaAyah",
                        e.target.value
                      )
                    }
                    placeholder="Nama lengkap ayah"
                    disabled={submitting}
                    className={inputClass(
                      errors.namaAyah
                    )}
                  />
                </Field>

                <Field
                  label="Nama Ibu"
                  required
                  error={errors.namaIbu}
                >
                  <input
                    type="text"
                    value={form.namaIbu}
                    onChange={(e) =>
                      update(
                        "namaIbu",
                        e.target.value
                      )
                    }
                    placeholder="Nama lengkap ibu"
                    disabled={submitting}
                    className={inputClass(
                      errors.namaIbu
                    )}
                  />
                </Field>

                <Field
                  label="Email"
                  required
                  error={errors.email}
                >
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      update(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="nama@email.com"
                    disabled={submitting}
                    className={inputClass(
                      errors.email
                    )}
                  />
                </Field>

                <Field
                  label="Nomor Telepon"
                  error={errors.telepon}
                >
                  <input
                    type="text"
                    value={form.telepon}
                    onChange={(e) =>
                      update(
                        "telepon",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    maxLength={20}
                    placeholder="08xxxxxxxxxx"
                    disabled={submitting}
                    className={inputClass(
                      errors.telepon
                    )}
                  />
                </Field>
              </div>
            </section>

            {/* ==========================================================
                DATA PPDB
            ========================================================== */}

            <section className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <ClipboardList
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                    Data PPDB
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Sekolah tujuan dan jalur
                    pendaftaran.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <InfoBox
                  icon={School}
                  title="Sekolah Tujuan"
                  value={
                    sekolahId ||
                    "Belum ditentukan"
                  }
                  error={
                    errors.sekolahId
                  }
                />

                <InfoBox
                  icon={ClipboardList}
                  title="Jalur PPDB"
                  value={
                    jalurPpdbId ||
                    "Belum ditentukan"
                  }
                  error={
                    errors.jalurPpdbId
                  }
                />

                <Field
                  label="Asal Sekolah"
                  required
                  error={
                    errors.asalSekolah
                  }
                >
                  <input
                    type="text"
                    value={
                      form.asalSekolah
                    }
                    onChange={(e) =>
                      update(
                        "asalSekolah",
                        e.target.value
                      )
                    }
                    placeholder="Nama sekolah asal"
                    disabled={submitting}
                    className={inputClass(
                      errors.asalSekolah
                    )}
                  />
                </Field>
              </div>
            </section>

            {/* ==========================================================
                ACTION
            ========================================================== */}

            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/PPDB"
                  )
                }
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={15} />
                Kembali
              </button>

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Mengirim..."
                  : "Selanjutnya"}

                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <PpdbFooter />
    </div>
  );
}

/* ========================================================================
   FIELD
======================================================================== */

function Field({
  label,
  required = false,
  error,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* ========================================================================
   INPUT CLASS
======================================================================== */

function inputClass(hasError) {
  return `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 ${
    hasError
      ? "border-rose-300"
      : "border-slate-200"
  }`;
}

/* ========================================================================
   INFO BOX
======================================================================== */

function InfoBox({
  icon: Icon,
  title,
  value,
  error,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        error
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex gap-3">
        <Icon
          size={18}
          className={
            error
              ? "mt-0.5 text-rose-500"
              : "mt-0.5 text-blue-600"
          }
        />

        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-700">
            {title}
          </p>

          <p className="mt-1 break-all text-xs text-slate-500">
            {value}
          </p>

          {error && (
            <p className="mt-1 text-xs text-rose-500">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
export default function DaftarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <DaftarPageContent />
    </Suspense>
  );
}