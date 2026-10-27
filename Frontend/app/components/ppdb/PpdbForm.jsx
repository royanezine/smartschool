"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  User,
  Users,
  School,
  ClipboardList,
  Loader2,
} from "lucide-react";

import PpdbHeader from "@/app/components/ppdb/PpdbHeader";
import PpdbStepper from "@/app/components/ppdb/PpdbStepper";
import PpdbFooter from "@/app/components/ppdb/PpdbFooter";

import {
  daftarPpdb,
  getProfilSekolahPublik,
} from "@/services/ppdb.service";


const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const SESI_SEKOLAH = "ppdb_sekolah_id";
const SESI_JALUR = "ppdb_jalur_id";
const SESI_PENDAFTARAN = "ppdb_pendaftaran_id";
const SESI_SUBMISSION = "ppdb_last_submission";

function isUuid(value) {
  const normalized = String(value || "").trim();

  return (
    UUID_REGEX.test(normalized) &&
    normalized.toLowerCase() !== NIL_UUID
  );
}

function sanitizeErrorMessage(rawMessage, fallback = "Terjadi kesalahan.") {
  if (!rawMessage || typeof rawMessage !== "string") return fallback;
  return (
    rawMessage
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
      .replace(/(?:token|tokenPendaftaran)\s*[:=]\s*[^\s,]+/gi, "token: [REDACTED]")
      .replace(/ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "[REDACTED]")
      .trim() || fallback
  );
}

function pesanKesalahan(error, fallback) {
  const message = String(error?.message || "").trim();

  if (
    /failed to fetch|networkerror|load failed|network request failed/i.test(
      message
    )
  ) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba kembali.";
  }

  return sanitizeErrorMessage(message || fallback);
}

function inputClass(hasError) {
  return `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 ${
    hasError ? "border-rose-300" : "border-slate-200"
  }`;
}

function Field({ label, required = false, error, children }) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || inputId,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": error ? errorId : undefined,
      })
    : children;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-xs font-medium text-slate-600"
      >
        {label}

        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      {control}

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}

function InfoBox({ icon: Icon, title, value, description, error }) {
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
            error ? "mt-0.5 text-rose-500" : "mt-0.5 text-blue-600"
          }
        />

        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-700">{title}</p>

          <p className="mt-1 break-words text-xs text-slate-500">{value}</p>

          {description && (
            <p className="mt-1 break-words text-[11px] leading-4 text-slate-400">
              {description}
            </p>
          )}

          {error && (
            <p className="mt-1 text-xs text-rose-500">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PpdbForm({
  basePath = "",
  tenantSubdomain = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const submittingRef = useRef(false);

  const [sekolahId, setSekolahId] = useState("");
  const [sekolahNama, setSekolahNama] = useState("");
  const [jalurPpdbId, setJalurPpdbId] = useState("");
  const [memuatSekolah, setMemuatSekolah] = useState(false);
  const [galatSekolah, setGalatSekolah] = useState("");
  const [galatParameter, setGalatParameter] = useState("");
  const [sekolahTidakCocok, setSekolahTidakCocok] = useState(false);
  const [parameterSiap, setParameterSiap] = useState(false);

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
    nilaiRapor: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const masalah = [];

    const bacaSesi = (kunci) => {
      try {
        return String(
          sessionStorage.getItem(kunci) || ""
        ).trim();
      } catch {
        return "";
      }
    };

    const hapusSesi = (kunci) => {
      try {
        sessionStorage.removeItem(kunci);
      } catch {
      }
    };

    const simpanSesi = (kunci, nilai) => {
      try {
        sessionStorage.setItem(kunci, nilai);
      } catch {
      }
    };

    const adaParameterUrl =
      searchParams.has("sekolahId") ||
      searchParams.has("sekolah_id") ||
      searchParams.has("jalurPpdbId") ||
      searchParams.has("jalurId");

    const pilihId = (
      dariUrl,
      kunciSesi,
      namaParameter,
      izinkanSesi
    ) => {
      const nilaiUrl = String(dariUrl || "").trim();

      if (nilaiUrl) {
        if (isUuid(nilaiUrl)) {
          return nilaiUrl;
        }

        masalah.push(namaParameter);
        return "";
      }

      if (!izinkanSesi) {
        return "";
      }

      const dariSesi = bacaSesi(kunciSesi);

      if (dariSesi) {
        if (isUuid(dariSesi)) {
          return dariSesi;
        }

        hapusSesi(kunciSesi);
      }

      return "";
    };

    const rawUrlSekolah =
      searchParams.get("sekolahId") || searchParams.get("sekolah_id");
    const rawUrlJalur =
      searchParams.get("jalurPpdbId") || searchParams.get("jalurId");

    const finalSekolahId = pilihId(
      rawUrlSekolah,
      SESI_SEKOLAH,
      "sekolahId",
      !adaParameterUrl
    );

    const finalJalurPpdbId = pilihId(
      rawUrlJalur,
      SESI_JALUR,
      "jalurPpdbId",
      !adaParameterUrl
    );

    Promise.resolve().then(() => {
      setGalatParameter(
        masalah.length > 0
          ? `Tautan pendaftaran memuat ${[
              ...new Set(masalah),
            ].join(
              " dan "
            )} yang tidak valid. Minta tautan resmi terbaru kepada panitia PPDB sekolah.`
          : ""
      );

      setSekolahId(finalSekolahId);
      setJalurPpdbId(finalJalurPpdbId);
      setParameterSiap(true);
    });

    if (finalSekolahId) {
      simpanSesi(SESI_SEKOLAH, finalSekolahId);
    }

    if (finalJalurPpdbId) {
      simpanSesi(SESI_JALUR, finalJalurPpdbId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!tenantSubdomain || typeof window === "undefined") {
      return;
    }

    if (!parameterSiap || galatParameter) {
      return;
    }

    let aktif = true;

    async function muatSekolah() {
      try {
        setMemuatSekolah(true);
        setGalatSekolah("");

        const response = await getProfilSekolahPublik(tenantSubdomain);
        const sekolah = response?.data;

        if (!aktif) {
          return;
        }

        if (!isUuid(sekolah?.id)) {
          throw new Error(
            "Profil sekolah tidak dapat dibaca dari server."
          );
        }

        const rawUrlSekolahId = String(
          searchParams.get("sekolahId") ||
            searchParams.get("sekolah_id") ||
            ""
        ).trim();

        if (
          rawUrlSekolahId &&
          isUuid(rawUrlSekolahId) &&
          rawUrlSekolahId !== sekolah.id
        ) {
          setSekolahTidakCocok(true);
          setGalatSekolah(
            "Sekolah pada tautan tidak sama dengan sekolah halaman ini. Gunakan tautan pendaftaran resmi dari sekolah yang bersangkutan."
          );
          return;
        }

        setSekolahTidakCocok(false);
        setSekolahNama(sekolah.nama || "");
        setSekolahId(sekolah.id);

        try {
          sessionStorage.setItem(SESI_SEKOLAH, sekolah.id);
        } catch {
        }
      } catch (error) {
        if (!aktif) {
          return;
        }

        setGalatSekolah(
          pesanKesalahan(
            error,
            "Profil sekolah tidak dapat dimuat. Silakan muat ulang halaman atau hubungi panitia PPDB."
          )
        );
      } finally {
        if (aktif) {
          setMemuatSekolah(false);
        }
      }
    }

    muatSekolah();

    return () => {
      aktif = false;
    };
  }, [
    tenantSubdomain,
    parameterSiap,
    galatParameter,
    searchParams,
  ]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  };

  const validateForm = () => {
    const newErrors = {};

    const namaLengkap = form.namaLengkap.trim();
    if (!namaLengkap) {
      newErrors.namaLengkap = "Nama lengkap wajib diisi";
    } else if (namaLengkap.length < 2) {
      newErrors.namaLengkap = "Nama lengkap minimal 2 karakter";
    } else if (namaLengkap.length > 100) {
      newErrors.namaLengkap = "Nama lengkap maksimal 100 karakter";
    }

    const nisn = form.nisn.trim();
    if (!nisn) {
      newErrors.nisn = "NISN wajib diisi";
    } else if (!/^\d+$/.test(nisn)) {
      newErrors.nisn = "NISN hanya boleh berisi angka";
    } else if (nisn.length < 10) {
      newErrors.nisn = "NISN minimal 10 karakter";
    } else if (nisn.length > 20) {
      newErrors.nisn = "NISN maksimal 20 karakter";
    }

    const tempatLahir = form.tempatLahir.trim();
    if (!tempatLahir) {
      newErrors.tempatLahir = "Tempat lahir wajib diisi";
    } else if (tempatLahir.length < 2) {
      newErrors.tempatLahir = "Tempat lahir minimal 2 karakter";
    } else if (tempatLahir.length > 50) {
      newErrors.tempatLahir = "Tempat lahir maksimal 50 karakter";
    }

    if (!form.tanggalLahir) {
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi";
    } else {
      const tanggal = new Date(form.tanggalLahir);

      if (Number.isNaN(tanggal.getTime())) {
        newErrors.tanggalLahir = "Tanggal lahir tidak valid";
      } else if (tanggal.getTime() > Date.now()) {
        newErrors.tanggalLahir =
          "Tanggal lahir tidak boleh di masa depan";
      }
    }

    if (!form.jenisKelamin) {
      newErrors.jenisKelamin = "Jenis kelamin wajib dipilih";
    }

    const alamat = form.alamat.trim();
    if (!alamat) {
      newErrors.alamat = "Alamat wajib diisi";
    } else if (alamat.length < 5) {
      newErrors.alamat = "Alamat minimal 5 karakter";
    }

    const telepon = form.telepon.trim();
    if (telepon && telepon.length > 20) {
      newErrors.telepon = "Nomor telepon maksimal 20 karakter";
    }

    const email = form.email.trim();
    if (email && !EMAIL_REGEX.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (form.namaAyah.trim().length > 100) {
      newErrors.namaAyah = "Nama ayah maksimal 100 karakter";
    }

    if (form.namaIbu.trim().length > 100) {
      newErrors.namaIbu = "Nama ibu maksimal 100 karakter";
    }

    if (form.asalSekolah.trim().length > 100) {
      newErrors.asalSekolah = "Asal sekolah maksimal 100 karakter";
    }

    if (form.nilaiRapor !== "" && form.nilaiRapor !== undefined) {
      const nr = Number(form.nilaiRapor);
      if (Number.isNaN(nr) || nr < 0 || nr > 100) {
        newErrors.nilaiRapor = "Nilai rapor harus berupa angka antara 0 hingga 100";
      }
    }

    if (!sekolahId) {
      newErrors.sekolahId =
        "Sekolah tujuan belum terhubung. Gunakan tautan pendaftaran resmi dari sekolah.";
    } else if (!isUuid(sekolahId)) {
      newErrors.sekolahId = "Referensi sekolah pada tautan tidak valid.";
    } else if (sekolahTidakCocok) {
      newErrors.sekolahId =
        "Sekolah pada tautan tidak sesuai dengan halaman ini.";
    } else if (galatSekolah) {
      newErrors.sekolahId = galatSekolah;
    }

    if (!jalurPpdbId) {
      newErrors.jalurPpdbId =
        "Jalur pendaftaran belum terhubung. Gunakan tautan pendaftaran resmi dari sekolah.";
    } else if (!isUuid(jalurPpdbId)) {
      newErrors.jalurPpdbId = "Referensi jalur pada tautan tidak valid.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submittingRef.current) {
      return;
    }

    if (!parameterSiap) {
      setSubmitError(
        "Tautan pendaftaran masih diperiksa. Tunggu sebentar lalu coba lagi."
      );

      return;
    }

    if (galatParameter) {
      setSubmitError(galatParameter);
      return;
    }

    if (galatSekolah || sekolahTidakCocok) {
      setSubmitError(
        galatSekolah ||
          "Sekolah pada tautan tidak sesuai dengan halaman ini."
      );

      return;
    }

    if (!validateForm()) {
      setSubmitError(
        "Masih ada data yang belum lengkap atau tautan pendaftaran tidak valid."
      );
      return;
    }

    const payload = {
      sekolahId,
      jalurPpdbId,
      namaLengkap: form.namaLengkap.trim(),
      nisn: form.nisn.trim(),
      tempatLahir: form.tempatLahir.trim(),
      tanggalLahir: form.tanggalLahir,
      jenisKelamin: form.jenisKelamin,
      alamat: form.alamat.trim(),
      telepon: form.telepon.trim() || undefined,
      email: form.email.trim() || undefined,
      namaAyah: form.namaAyah.trim() || undefined,
      namaIbu: form.namaIbu.trim() || undefined,
      asalSekolah: form.asalSekolah.trim() || undefined,
      nilaiRapor:
        form.nilaiRapor !== "" && form.nilaiRapor !== undefined
          ? Number(form.nilaiRapor)
          : undefined,
    };

    try {
      submittingRef.current = true;
      setSubmitting(true);
      setSubmitError("");

      const response = await daftarPpdb(payload);

      if (!response?.success || !response?.data?.id) {
        throw new Error(
          response?.message ||
            "Pendaftaran gagal diproses oleh server."
        );
      }

      const pendaftaranId = String(response.data.id);
      const nomorPendaftaran = response.data.nomorPendaftaran
        ? String(response.data.nomorPendaftaran)
        : "";
      const tokenPendaftaran = response?.data?.tokenPendaftaran
        ? String(response.data.tokenPendaftaran)
        : response?.data?.token
          ? String(response.data.token)
          : response?.tokenPendaftaran
            ? String(response.tokenPendaftaran)
            : "";

      sessionStorage.setItem(SESI_PENDAFTARAN, pendaftaranId);

      if (tokenPendaftaran) {
        sessionStorage.setItem("ppdb_token_pendaftaran", tokenPendaftaran);
      }

      sessionStorage.setItem(SESI_SEKOLAH, sekolahId);
      sessionStorage.setItem(SESI_JALUR, jalurPpdbId);

      sessionStorage.setItem(
        SESI_SUBMISSION,
        JSON.stringify({
          pendaftaranId,
          nomorPendaftaran: nomorPendaftaran || null,
          tokenPendaftaran: tokenPendaftaran || null,
          namaLengkap:
            response.data.namaLengkap || payload.namaLengkap,
          status: response.data.status || null,
          sekolahId,
          jalurPpdbId,
          diterimaPada: new Date().toISOString(),
          berkas: [],
        })
      );

      sessionStorage.removeItem("ppdb_berkas_uploaded");

      const queryUpload = new URLSearchParams({
        id: pendaftaranId,
        sekolahId,
        jalurPpdbId,
        ...(tokenPendaftaran ? { token: tokenPendaftaran } : {}),
      });

      router.push(
        `${basePath}/PPDB/daftar/uploadBerkas?${queryUpload.toString()}`
      );
    } catch (error) {
      setSubmitError(
        pesanKesalahan(
          error,
          "Terjadi kesalahan saat mengirim pendaftaran."
        )
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const parameterKurang = [
    ...(!sekolahId ? ["sekolahId"] : []),
    ...(!jalurPpdbId ? ["jalurPpdbId"] : []),
  ];

  const sekolahBelumTerhubung =
    parameterKurang.includes("sekolahId");

  const jalurBelumTerhubung =
    parameterKurang.includes("jalurPpdbId");

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push(`${basePath}/PPDB`)}
          disabled={submitting}
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={15} />
          Kembali ke PPDB
        </button>

        <PpdbHeader
          eyebrow="PPDB Online"
          title="Pendaftaran Peserta Didik Baru"
          description="Lengkapi data calon peserta didik dengan benar untuk melanjutkan ke tahap upload dokumen."
        />

        <div className="mt-6">
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

          {galatParameter && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-rose-500"
              />

              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Tautan pendaftaran tidak valid
                </p>

                <p className="mt-1 text-xs leading-5 text-rose-600">
                  {galatParameter}
                </p>
              </div>
            </div>
          )}

          {parameterSiap &&
            parameterKurang.length > 0 &&
            !galatParameter && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {sekolahBelumTerhubung &&
                    jalurBelumTerhubung
                      ? "Formulir belum terhubung ke sekolah dan jalur pendaftaran"
                      : sekolahBelumTerhubung
                        ? "Formulir belum terhubung ke sekolah"
                        : "Formulir belum terhubung ke jalur pendaftaran"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    URL formulir ini tidak memuat parameter{" "}
                    <code>{parameterKurang.join(" dan ")}</code>{" "}
                    yang valid. Gunakan tautan pendaftaran
                    resmi yang dibagikan oleh sekolah. Tautan
                    tersebut sudah memuat sekolah dan jalur
                    yang dibuka, sehingga Anda tidak perlu
                    mengetik ID apa pun. Jika belum memiliki
                    tautannya, silakan hubungi panitia PPDB
                    sekolah.
                  </p>
                </div>
              </div>
            )}

          {!parameterSiap && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
              <Loader2 size={15} className="animate-spin" />
              Memeriksa parameter tautan pendaftaran...
            </div>
          )}

          {galatSekolah && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-rose-500"
              />

              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Sekolah tidak dapat diverifikasi
                </p>

                <p className="mt-1 text-xs leading-5 text-rose-600">
                  {galatSekolah}
                </p>
              </div>
            </div>
          )}

          <PpdbStepper currentStep={1} />

          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
            <section>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <User size={19} className="text-blue-600" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                    Data Calon Siswa
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Masukkan data calon siswa sesuai dokumen resmi.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Nama Lengkap" required error={errors.namaLengkap}>
                  <input
                    type="text"
                    value={form.namaLengkap}
                    onChange={(e) => update("namaLengkap", e.target.value)}
                    maxLength={100}
                    placeholder="Nama lengkap calon siswa"
                    disabled={submitting}
                    className={inputClass(errors.namaLengkap)}
                  />
                </Field>

                <Field label="NISN" required error={errors.nisn}>
                  <input
                    type="text"
                    value={form.nisn}
                    onChange={(e) =>
                      update("nisn", e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={20}
                    inputMode="numeric"
                    placeholder="Nomor Induk Siswa Nasional"
                    disabled={submitting}
                    className={inputClass(errors.nisn)}
                  />
                </Field>

                <Field
                  label="Tempat Lahir"
                  required
                  error={errors.tempatLahir}
                >
                  <input
                    type="text"
                    value={form.tempatLahir}
                    onChange={(e) => update("tempatLahir", e.target.value)}
                    maxLength={50}
                    placeholder="Kota tempat lahir"
                    disabled={submitting}
                    className={inputClass(errors.tempatLahir)}
                  />
                </Field>

                <Field
                  label="Tanggal Lahir"
                  required
                  error={errors.tanggalLahir}
                >
                  <input
                    type="date"
                    value={form.tanggalLahir}
                    onChange={(e) => update("tanggalLahir", e.target.value)}
                    disabled={submitting}
                    className={inputClass(errors.tanggalLahir)}
                  />
                </Field>

                <Field
                  label="Jenis Kelamin"
                  required
                  error={errors.jenisKelamin}
                >
                  <select
                    value={form.jenisKelamin}
                    onChange={(e) => update("jenisKelamin", e.target.value)}
                    disabled={submitting}
                    className={inputClass(errors.jenisKelamin)}
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </Field>

                <Field label="Nomor Telepon" error={errors.telepon}>
                  <input
                    type="text"
                    value={form.telepon}
                    onChange={(e) =>
                      update("telepon", e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={20}
                    inputMode="tel"
                    placeholder="08xxxxxxxxxx"
                    disabled={submitting}
                    className={inputClass(errors.telepon)}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Alamat" required error={errors.alamat}>
                    <textarea
                      value={form.alamat}
                      onChange={(e) => update("alamat", e.target.value)}
                      rows={4}
                      placeholder="Alamat lengkap calon siswa"
                      disabled={submitting}
                      className={inputClass(errors.alamat)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Users size={19} className="text-blue-600" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                    Data Orang Tua / Wali
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Lengkapi informasi orang tua/wali dan kontak.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Nama Ayah" error={errors.namaAyah}>
                  <input
                    type="text"
                    value={form.namaAyah}
                    onChange={(e) => update("namaAyah", e.target.value)}
                    maxLength={100}
                    placeholder="Nama lengkap ayah"
                    disabled={submitting}
                    className={inputClass(errors.namaAyah)}
                  />
                </Field>

                <Field label="Nama Ibu" error={errors.namaIbu}>
                  <input
                    type="text"
                    value={form.namaIbu}
                    onChange={(e) => update("namaIbu", e.target.value)}
                    maxLength={100}
                    placeholder="Nama lengkap ibu"
                    disabled={submitting}
                    className={inputClass(errors.namaIbu)}
                  />
                </Field>

                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="nama@email.com"
                    disabled={submitting}
                    className={inputClass(errors.email)}
                  />
                </Field>
              </div>
            </section>

            <section className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <ClipboardList size={19} className="text-blue-600" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                    Data PPDB
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Sekolah tujuan dan jalur pendaftaran.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <InfoBox
                  icon={School}
                  title="Sekolah Tujuan"
                  value={
                    memuatSekolah
                      ? "Memuat profil sekolah..."
                      : sekolahNama ||
                        (sekolahId
                          ? "Sekolah sudah terhubung"
                          : "Belum terhubung")
                  }
                  description={
                    sekolahId
                      ? "Sekolah tujuan mengikuti tautan pendaftaran yang Anda gunakan."
                      : "Tautan pendaftaran resmi dari sekolah akan mengisi bagian ini otomatis."
                  }
                  error={errors.sekolahId}
                />

                <InfoBox
                  icon={ClipboardList}
                  title="Jalur PPDB"
                  value={
                    jalurPpdbId
                      ? "Jalur pendaftaran sudah terhubung"
                      : "Belum terhubung"
                  }
                  description={
                    jalurPpdbId
                      ? "Jalur mengikuti tautan resmi yang dibagikan sekolah."
                      : "Daftar jalur tidak tersedia untuk umum. Gunakan tautan resmi dari sekolah."
                  }
                  error={errors.jalurPpdbId}
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Asal Sekolah" error={errors.asalSekolah}>
                    <input
                      type="text"
                      value={form.asalSekolah}
                      onChange={(e) => update("asalSekolah", e.target.value)}
                      maxLength={100}
                      placeholder="Nama sekolah asal"
                      disabled={submitting}
                      className={inputClass(errors.asalSekolah)}
                    />
                  </Field>

                  <Field label="Nilai Rapor (Opsional)" error={errors.nilaiRapor}>
                    <input
                      type="number"
                      value={form.nilaiRapor}
                      onChange={(e) => update("nilaiRapor", e.target.value)}
                      min={0}
                      max={100}
                      step="0.01"
                      placeholder="0 - 100"
                      disabled={submitting}
                      className={inputClass(errors.nilaiRapor)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => router.push(`${basePath}/PPDB`)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={15} />
                Kembali
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !parameterSiap ||
                  memuatSekolah ||
                  !sekolahId ||
                  !jalurPpdbId ||
                  Boolean(galatParameter) ||
                  Boolean(galatSekolah) ||
                  sekolahTidakCocok
                }
                aria-busy={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Selanjutnya
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <PpdbFooter />
    </div>
  );
}
