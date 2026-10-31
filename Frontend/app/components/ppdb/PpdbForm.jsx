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
  CheckCircle2,
  User,
  Users,
  School,
  ClipboardList,
  Loader2,
  MapPin,
  Crosshair,
  Award,
  TrendingUp,
  RotateCcw,
} from "lucide-react";

import PpdbHeader from "@/app/components/ppdb/PpdbHeader";
import PpdbStepper from "@/app/components/ppdb/PpdbStepper";
import PpdbFooter from "@/app/components/ppdb/PpdbFooter";

import {
  daftarPpdb,
  getProfilSekolahPublik,
  getOpsiPpdbSekolah,
} from "@/services/ppdb.service";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIK_REGEX = /^\d{16}$/;

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

function Field({ label, required = false, error, hint, children }) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || inputId,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": error ? errorId : hint ? hintId : undefined,
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

      {hint && !error && (
        <p id={hintId} className="mt-1 text-[11px] text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}

function InfoBox({ icon: Icon, title, value, description, badge, error }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        error
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          className={
            error ? "mt-0.5 text-rose-500" : "mt-0.5 text-blue-600"
          }
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-slate-700">{title}</p>
            {badge && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                {badge}
              </span>
            )}
          </div>

          <p className="mt-1 break-words text-xs text-slate-600 font-medium">
            {value}
          </p>

          {description && (
            <p className="mt-1 break-words text-[11px] leading-4 text-slate-500">
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

  // Parameter dari URL query dihitung secara murni (React 19 derivation - no sync effect setState)
  const rawSekolahId =
    searchParams.get("sekolahId") || searchParams.get("sekolah_id") || "";
  const rawJalurId =
    searchParams.get("jalurPpdbId") || searchParams.get("jalurId") || "";

  const isSekolahValid = isUuid(rawSekolahId);
  const isJalurValid = isUuid(rawJalurId);

  const sekolahId = isSekolahValid ? rawSekolahId : "";
  const jalurPpdbId = isJalurValid ? rawJalurId : "";

  const parameterMasalah = [];
  if (rawSekolahId && !isSekolahValid) parameterMasalah.push("sekolahId");
  if (rawJalurId && !isJalurValid) parameterMasalah.push("jalurPpdbId");

  const galatParameter =
    parameterMasalah.length > 0
      ? `Tautan pendaftaran memuat parameter ${parameterMasalah.join(
          " dan "
        )} yang tidak valid. Gunakan tautan pendaftaran resmi terbaru dari sekolah.`
      : "";

  // Data opsi dari Backend
  const [opsiData, setOpsiData] = useState(null);
  const [memuatOpsi, setMemuatOpsi] = useState(false);
  const [galatOpsi, setGalatOpsi] = useState("");
  const [sekolahTidakCocok, setSekolahTidakCocok] = useState(false);

  // Status Geolocation GPS (Wajib via browser Geolocation API murni)
  const [mencariLokasi, setMencariLokasi] = useState(false);
  const [lokasiSukses, setLokasiSukses] = useState("");
  const [gpsTerdeteksi, setGpsTerdeteksi] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const [form, setForm] = useState({
    namaLengkap: "",
    nik: "",
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
    jurusanId: "",
    gelombangPpdbId: "",
    nilaiRapor: "",
    lintang: "",
    bujur: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Muat opsi pendaftaran dari Backend secara asinkron
  useEffect(() => {
    let active = true;

    if (!sekolahId || galatParameter) {
      return () => {
        active = false;
      };
    }

    async function loadData() {
      try {
        await Promise.resolve();
        if (!active) return;
        setMemuatOpsi(true);
        setGalatOpsi("");

        if (tenantSubdomain) {
          try {
            const resTenant = await getProfilSekolahPublik(tenantSubdomain);
            const sekolahTenant = resTenant?.data;
            if (sekolahTenant?.id && sekolahTenant.id !== sekolahId) {
              if (active) {
                setSekolahTidakCocok(true);
                setGalatOpsi(
                  "Sekolah pada tautan tidak sesuai dengan sekolah halaman subdomain ini. Gunakan tautan pendaftaran resmi dari sekolah bersangkutan."
                );
                setMemuatOpsi(false);
              }
              return;
            }
          } catch {
            // Lanjutkan jika profil publik tenant tidak dapat dimuat
          }
        }

        const resOpsi = await getOpsiPpdbSekolah(sekolahId);
        if (!active) return;

        if (!resOpsi?.success || !resOpsi?.data) {
          throw new Error(
            resOpsi?.message || "Gagal memuat opsi pendaftaran dari server."
          );
        }

        setSekolahTidakCocok(false);
        setOpsiData(resOpsi.data);
      } catch (err) {
        if (!active) return;
        setGalatOpsi(
          pesanKesalahan(
            err,
            "Gagal memuat informasi pendaftaran sekolah dari server. Silakan muat ulang halaman."
          )
        );
      } finally {
        if (active) {
          setMemuatOpsi(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [sekolahId, galatParameter, tenantSubdomain]);

  // Resolusi data jalur yang dipilih dari opsi Backend
  const jalurDipilih = opsiData?.jalur?.find((j) => j.id === jalurPpdbId);

  // Evaluasi aturan bisnis Backend secara dinamis
  const isSmk = Boolean(
    opsiData?.wajibJurusan ||
      (opsiData?.sekolah?.jenjang || "").toUpperCase().trim() === "SMK"
  );

  const butuhLokasi = Boolean(
    jalurDipilih &&
      (jalurDipilih.metodeRanking === "jarak" ||
        jalurDipilih.kategori === "zonasi" ||
        jalurDipilih.jarakMaksimalKm !== null ||
        opsiData?.sekolah?.koordinatTersedia)
  );

  const butuhNilai = Boolean(
    jalurDipilih &&
      (jalurDipilih.metodeRanking === "nilai" ||
        jalurDipilih.nilaiMinimal !== null)
  );

  // Nilai minimal hanya valid jika bernilai numerik 0 - 100 (skala rapor standar).
  // Nilai di luar rentang (seperti 5000 atau threshold dummy) diabaikan agar tidak salah konteks.
  const nilaiMinimal =
    typeof jalurDipilih?.nilaiMinimal === "number" &&
    jalurDipilih.nilaiMinimal >= 0 &&
    jalurDipilih.nilaiMinimal <= 100
      ? jalurDipilih.nilaiMinimal
      : null;

  const jarakMaksimalKm =
    typeof jalurDipilih?.jarakMaksimalKm === "number"
      ? jalurDipilih.jarakMaksimalKm
      : null;

  const berkasWajibList = Array.isArray(jalurDipilih?.berkasWajib)
    ? jalurDipilih.berkasWajib
    : [];

  // Informasi peluang diterima berdasarkan data kuota & pendaftar dari Backend
  let infoPeluang = "Perkiraan belum tersedia";
  if (!jalurDipilih) {
    infoPeluang = "Pilih jalur pendaftaran terlebih dahulu.";
  } else {
    const kuota = jalurDipilih.kuota;
    const pendaftar = jalurDipilih.jumlahPendaftar;

    if (typeof kuota === "number" && typeof pendaftar === "number") {
      const sisa = kuota - pendaftar;
      if (sisa > 0) {
        infoPeluang = `Pendaftar saat ini: ${pendaftar} / Kuota: ${kuota} siswa (Tersedia ${sisa} kursi).`;
      } else {
        infoPeluang = `Pendaftar saat ini: ${pendaftar} / Kuota: ${kuota} siswa (Kuota telah terpenuhi). Penentuan peringkat seleksi mengikuti urutan ${
          jalurDipilih.metodeRanking === "jarak"
            ? "jarak zonasi terdekat"
            : "nilai rapor tertinggi"
        }.`;
      }
    } else if (typeof kuota === "number") {
      infoPeluang = `Kuota jalur: ${kuota} siswa.`;
    }
  }

  const update = (key, value) => {
    // Koordinat lintang dan bujur read-only, dilarang diubah secara manual
    if (key === "lintang" || key === "bujur") {
      return;
    }
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, lokasi: undefined }));
    setSubmitError("");
  };

  // Deteksi lokasi via Geolocation API browser murni
  const deteksiLokasiGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsTerdeteksi(false);
      const pesan =
        "Perangkat atau browser Anda tidak mendukung Geolocation API GPS. Silakan gunakan browser modern yang mendukung GPS.";
      setGpsError(pesan);
      setErrors((prev) => ({
        ...prev,
        lokasi: pesan,
      }));
      return;
    }

    setMencariLokasi(true);
    setLokasiSukses("");
    setGpsError("");
    setErrors((prev) => ({ ...prev, lokasi: undefined, lintang: undefined, bujur: undefined }));

    navigator.geolocation.getCurrentPosition(
      (posisi) => {
        const lat = Number(posisi.coords.latitude.toFixed(7));
        const lng = Number(posisi.coords.longitude.toFixed(7));
        setForm((prev) => ({
          ...prev,
          lintang: String(lat),
          bujur: String(lng),
        }));
        setGpsTerdeteksi(true);
        setGpsError("");
        setLokasiSukses(`Koordinat ${lat}, ${lng} (Akurasi: ±${Math.round(posisi.coords.accuracy || 0)}m)`);
        setMencariLokasi(false);
      },
      (err) => {
        setMencariLokasi(false);
        setGpsTerdeteksi(false);
        setForm((prev) => ({
          ...prev,
          lintang: "",
          bujur: "",
        }));
        let pesan = "Gagal mendeteksi lokasi GPS.";
        if (err.code === 1) {
          pesan =
            "Izin akses lokasi ditolak oleh peramban. Harap izinkan akses lokasi pada browser Anda untuk melanjutkan pendaftaran.";
        } else if (err.code === 2) {
          pesan =
            "Posisi GPS tidak tersedia saat ini. Pastikan GPS/Location perangkat aktif lalu coba lagi.";
        } else if (err.code === 3) {
          pesan =
            "Waktu pencarian lokasi GPS habis (timeout). Silakan periksa koneksi dan coba lagi.";
        }
        setGpsError(pesan);
        setErrors((prev) => ({ ...prev, lokasi: pesan }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Data Calon Siswa
    const namaLengkap = form.namaLengkap.trim();
    if (!namaLengkap) {
      newErrors.namaLengkap = "Nama lengkap wajib diisi";
    } else if (namaLengkap.length < 2) {
      newErrors.namaLengkap = "Nama lengkap minimal 2 karakter";
    } else if (namaLengkap.length > 100) {
      newErrors.namaLengkap = "Nama lengkap maksimal 100 karakter";
    }

    const nik = form.nik.trim();
    if (!nik) {
      newErrors.nik = "NIK wajib diisi";
    } else if (!NIK_REGEX.test(nik)) {
      newErrors.nik = "NIK harus terdiri dari 16 digit angka";
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
        newErrors.tanggalLahir = "Tanggal lahir tidak boleh di masa depan";
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
    if (!email) {
      newErrors.email = "Email wajib diisi";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Format email tidak valid (contoh: nama@email.com)";
    } else if (email.length > 100) {
      newErrors.email = "Email maksimal 100 karakter";
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

    // 2. Pilihan Jurusan (Wajib hanya untuk sekolah SMK)
    if (isSmk && !form.jurusanId) {
      newErrors.jurusanId = "Pilihan jurusan wajib dipilih untuk sekolah jenjang SMK";
    }

    // 3. Nilai Rapor
    if (butuhNilai && (form.nilaiRapor === "" || form.nilaiRapor === undefined)) {
      newErrors.nilaiRapor = "Nilai rapor wajib diisi untuk jalur pendaftaran ini";
    } else if (form.nilaiRapor !== "" && form.nilaiRapor !== undefined) {
      const nr = Number(form.nilaiRapor);
      if (Number.isNaN(nr) || nr < 0 || nr > 100) {
        newErrors.nilaiRapor = "Nilai rapor harus berupa angka antara 0 hingga 100";
      } else if (nilaiMinimal !== null && nr < nilaiMinimal) {
        newErrors.nilaiRapor = `Nilai rapor di bawah batas minimal ${nilaiMinimal} untuk jalur ini`;
      }
    }

    // 4. Koordinat Rumah (Wajib via Geolocation API GPS Browser)
    if (butuhLokasi) {
      if (!gpsTerdeteksi || !form.lintang || !form.bujur) {
        newErrors.lokasi =
          "Lokasi GPS belum terdeteksi. Anda wajib menekan tombol 'Gunakan Lokasi Saat Ini (GPS)' untuk mendeteksi koordinat tempat tinggal.";
      }
    }

    if (form.lintang !== "" && form.lintang !== undefined) {
      const lat = Number(form.lintang);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.lintang = "Lintang harus berada di antara -90 dan 90";
      }
    }

    if (form.bujur !== "" && form.bujur !== undefined) {
      const lng = Number(form.bujur);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.bujur = "Bujur harus berada di antara -180 dan 180";
      }
    }

    // 5. Parameter Tautan
    if (!sekolahId || !isUuid(sekolahId)) {
      newErrors.sekolahId = "Referensi sekolah tujuan belum terhubung atau tidak valid.";
    }

    if (!jalurPpdbId || !isUuid(jalurPpdbId)) {
      newErrors.jalurPpdbId = "Referensi jalur pendaftaran belum terhubung atau tidak valid.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submittingRef.current) {
      return;
    }

    if (galatParameter) {
      setSubmitError(galatParameter);
      return;
    }

    if (galatOpsi || sekolahTidakCocok) {
      setSubmitError(galatOpsi || "Sekolah tidak valid untuk pendaftaran ini.");
      return;
    }

    if (opsiData && opsiData.pendaftaranDibuka === false) {
      setSubmitError("Pendaftaran PPDB di sekolah ini saat ini sedang ditutup.");
      return;
    }

    if (jalurDipilih && jalurDipilih.pendaftaranBuka === false) {
      setSubmitError("Pendaftaran untuk jalur PPDB ini sedang ditutup.");
      return;
    }

    if (butuhLokasi && (!gpsTerdeteksi || !form.lintang || !form.bujur)) {
      setSubmitError(
        "Lokasi GPS belum terdeteksi. Silakan tekan tombol 'Gunakan Lokasi Saat Ini (GPS)' untuk mendeteksi koordinat sebelum mendaftar."
      );
      setErrors((prev) => ({
        ...prev,
        lokasi:
          "Lokasi GPS belum terdeteksi. Anda wajib menekan tombol 'Gunakan Lokasi Saat Ini (GPS)'.",
      }));
      return;
    }

    if (!validateForm()) {
      setSubmitError("Masih ada data yang belum lengkap atau belum valid. Periksa formulir di bawah.");
      return;
    }

    // Bangun payload strictly sesuai kontrak Backend terbaru
    const payload = {
      sekolahId,
      jalurPpdbId,
      nik: form.nik.trim(),
      namaLengkap: form.namaLengkap.trim(),
      nisn: form.nisn.trim(),
      tempatLahir: form.tempatLahir.trim(),
      tanggalLahir: form.tanggalLahir,
      jenisKelamin: form.jenisKelamin,
      alamat: form.alamat.trim(),
      telepon: form.telepon.trim() || undefined,
      email: form.email.trim(),
      namaAyah: form.namaAyah.trim() || undefined,
      namaIbu: form.namaIbu.trim() || undefined,
      asalSekolah: form.asalSekolah.trim() || undefined,
      nilaiRapor:
        form.nilaiRapor !== "" && form.nilaiRapor !== undefined
          ? Number(form.nilaiRapor)
          : undefined,
      // Kirim jurusanId HANYA jika sekolah SMK
      jurusanId: isSmk && form.jurusanId ? form.jurusanId : undefined,
      gelombangPpdbId: form.gelombangPpdbId ? form.gelombangPpdbId : undefined,
      // Kirim koordinat hanya jika diisi angka valid
      lintang:
        form.lintang !== "" && form.lintang !== undefined
          ? Number(form.lintang)
          : undefined,
      bujur:
        form.bujur !== "" && form.bujur !== undefined
          ? Number(form.bujur)
          : undefined,
    };

    try {
      submittingRef.current = true;
      setSubmitting(true);
      setSubmitError("");

      const response = await daftarPpdb(payload);

      if (!response?.success || !response?.data?.id) {
        throw new Error(
          response?.message || "Pendaftaran gagal diproses oleh server."
        );
      }

      const pendaftaranId = String(response.data.id);
      const tokenPendaftaran = response?.data?.tokenPendaftaran
        ? String(response.data.tokenPendaftaran)
        : "";

      // Handoff ke tahap upload berkas secara eksplisit melalui query URL
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
        pesanKesalahan(error, "Terjadi kesalahan saat memproses pendaftaran.")
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
          description="Lengkapi data calon peserta didik sesuai dokumen resmi untuk melanjutkan ke tahap upload berkas."
        />

        <div className="mt-6">
          {submitError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
              <div>
                <p className="text-sm font-semibold text-rose-700">Pendaftaran Gagal</p>
                <p className="mt-1 text-xs leading-5 text-rose-600">{submitError}</p>
              </div>
            </div>
          )}

          {galatParameter && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
              <div>
                <p className="text-sm font-semibold text-rose-700">Tautan Pendaftaran Tidak Valid</p>
                <p className="mt-1 text-xs leading-5 text-rose-600">{galatParameter}</p>
              </div>
            </div>
          )}

          {parameterKurang.length > 0 && !galatParameter && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Formulir Memerlukan Tautan Resmi Sekolah
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  URL pendaftaran tidak memuat parameter <code>{parameterKurang.join(" dan ")}</code> yang valid. Silakan gunakan tautan pendaftaran resmi yang dibagikan oleh panitia PPDB sekolah.
                </p>
              </div>
            </div>
          )}

          {galatOpsi && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
              <div>
                <p className="text-sm font-semibold text-rose-700">Informasi Sekolah Tidak Dapat Diverifikasi</p>
                <p className="mt-1 text-xs leading-5 text-rose-600">{galatOpsi}</p>
              </div>
            </div>
          )}

          {opsiData && opsiData.pendaftaranDibuka === false && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Pendaftaran PPDB Ditutup</p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Panitia PPDB sekolah saat ini sedang menutup penerimaan pendaftaran baru.
                </p>
              </div>
            </div>
          )}

          {jalurDipilih && jalurDipilih.pendaftaranBuka === false && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Jalur PPDB Belum / Sudah Ditutup</p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Jalur <strong>{jalurDipilih.nama}</strong> sedang tidak aktif untuk pendaftaran saat ini.
                </p>
              </div>
            </div>
          )}

          <PpdbStepper currentStep={1} />

          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
            {/* Bagian 1: Data Calon Siswa */}
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
                    Masukkan data calon siswa sesuai Akta Kelahiran dan Kartu Keluarga resmi.
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

                <Field
                  label="Nomor Induk Kependudukan (NIK)"
                  required
                  error={errors.nik}
                  hint="Wajib 16 digit angka sesuai Kartu Keluarga / KTP"
                >
                  <input
                    type="text"
                    value={form.nik}
                    onChange={(e) =>
                      update("nik", e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={16}
                    inputMode="numeric"
                    placeholder="16 digit NIK calon siswa"
                    disabled={submitting}
                    className={inputClass(errors.nik)}
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
                    placeholder="Nomor Induk Siswa Nasional (10-20 digit)"
                    disabled={submitting}
                    className={inputClass(errors.nisn)}
                  />
                </Field>

                <Field label="Tempat Lahir" required error={errors.tempatLahir}>
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

                <Field label="Tanggal Lahir" required error={errors.tanggalLahir}>
                  <input
                    type="date"
                    value={form.tanggalLahir}
                    onChange={(e) => update("tanggalLahir", e.target.value)}
                    disabled={submitting}
                    className={inputClass(errors.tanggalLahir)}
                  />
                </Field>

                <Field label="Jenis Kelamin" required error={errors.jenisKelamin}>
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

                <Field label="Nomor Telepon / WhatsApp" error={errors.telepon}>
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

                <Field
                  label="Email Aktif"
                  required
                  error={errors.email}
                  hint="Bukti pendaftaran dan konfirmasi akan dikirimkan ke email ini"
                >
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="nama@email.com"
                    disabled={submitting}
                    className={inputClass(errors.email)}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Alamat Domisili" required error={errors.alamat}>
                    <textarea
                      value={form.alamat}
                      onChange={(e) => update("alamat", e.target.value)}
                      rows={3}
                      placeholder="Alamat lengkap calon siswa (jalan, RT/RW, kelurahan, kecamatan)"
                      disabled={submitting}
                      className={inputClass(errors.alamat)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Bagian 2: Data Orang Tua / Wali */}
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
                    Informasi orang tua atau wali calon siswa.
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
                    placeholder="Nama lengkap ayah kandung / wali"
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
                    placeholder="Nama lengkap ibu kandung"
                    disabled={submitting}
                    className={inputClass(errors.namaIbu)}
                  />
                </Field>
              </div>
            </section>

            {/* Bagian 3: Data PPDB & Pilihan Akademik */}
            <section className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <ClipboardList size={19} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                    Data PPDB & Pilihan
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Sekolah tujuan, jalur seleksi, dan pilihan jurusan.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <InfoBox
                  icon={School}
                  title="Sekolah Tujuan"
                  badge={opsiData?.sekolah?.jenjang || undefined}
                  value={
                    memuatOpsi
                      ? "Memuat data sekolah..."
                      : opsiData?.sekolah?.nama || (sekolahId ? "Sekolah terhubung" : "Belum terhubung")
                  }
                  description={
                    opsiData?.sekolah
                      ? `Jenjang: ${opsiData.sekolah.jenjang || "Reguler"} | Koordinat sekolah: ${
                          opsiData.sekolah.koordinatTersedia ? "Tersedia" : "Belum diatur"
                        }`
                      : "Sekolah tujuan mengikuti tautan pendaftaran yang digunakan."
                  }
                  error={errors.sekolahId}
                />

                <InfoBox
                  icon={Award}
                  title="Jalur PPDB"
                  badge={jalurDipilih?.kategori ? jalurDipilih.kategori.toUpperCase() : undefined}
                  value={
                    jalurDipilih
                      ? `${jalurDipilih.nama} (Kuota: ${jalurDipilih.kuota ?? "-"})`
                      : jalurPpdbId
                        ? "Jalur terhubung"
                        : "Belum terhubung"
                  }
                  description={
                    jalurDipilih
                      ? `Metode Seleksi: ${
                          jalurDipilih.metodeRanking === "jarak"
                            ? "Prioritas Jarak / Zonasi"
                            : "Prioritas Nilai Rapor"
                        }${
                          jarakMaksimalKm ? ` | Radius Maks: ${jarakMaksimalKm} km` : ""
                        }${
                          nilaiMinimal !== null ? ` | Batas Nilai Rapor Minimal: ${nilaiMinimal}` : ""
                        }${
                          berkasWajibList.length > 0
                            ? ` | Berkas Wajib: ${berkasWajibList.join(", ")}`
                            : ""
                        }`
                      : "Jalur pendaftaran mengikuti tautan pendaftaran resmi dari sekolah."
                  }
                  error={errors.jalurPpdbId}
                />

                <InfoBox
                  icon={TrendingUp}
                  title="Perkiraan Peluang & Kuota Seleksi"
                  value={
                    jalurDipilih && typeof jalurDipilih.kuota === "number"
                      ? `${jalurDipilih.jumlahPendaftar ?? 0} Pendaftar / Kuota ${jalurDipilih.kuota}`
                      : "Perkiraan belum tersedia"
                  }
                  description={infoPeluang}
                />

                {/* Dropdown Jurusan: Tampil HANYA jika sekolah jenjang SMK */}
                {isSmk && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                    <Field
                      label="Pilihan Konsentrasi Keahlian / Jurusan"
                      required
                      error={errors.jurusanId}
                      hint="Sekolah jenjang SMK mewajibkan pemilihan satu konsentrasi keahlian."
                    >
                      <select
                        value={form.jurusanId}
                        onChange={(e) => update("jurusanId", e.target.value)}
                        disabled={submitting}
                        className={inputClass(errors.jurusanId)}
                      >
                        <option value="">-- Pilih Jurusan / Kompetensi Keahlian --</option>
                        {Array.isArray(opsiData?.jurusan) &&
                          opsiData.jurusan.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.kode ? `[${j.kode}] ` : ""}
                              {j.nama}
                              {j.deskripsi ? ` - ${j.deskripsi}` : ""}
                            </option>
                          ))}
                      </select>
                    </Field>
                  </div>
                )}

                {/* Dropdown Gelombang jika ada data gelombang terkait */}
                {Array.isArray(opsiData?.gelombang) && opsiData.gelombang.length > 0 && (
                  <Field label="Pilihan Gelombang (Opsional)" error={errors.gelombangPpdbId}>
                    <select
                      value={form.gelombangPpdbId}
                      onChange={(e) => update("gelombangPpdbId", e.target.value)}
                      disabled={submitting}
                      className={inputClass(errors.gelombangPpdbId)}
                    >
                      <option value="">Gelombang Reguler / Otomatis</option>
                      {opsiData.gelombang.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nama}
                          {g.kuota ? ` (Kuota: ${g.kuota})` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Asal Sekolah" error={errors.asalSekolah}>
                    <input
                      type="text"
                      value={form.asalSekolah}
                      onChange={(e) => update("asalSekolah", e.target.value)}
                      maxLength={100}
                      placeholder="Nama sekolah asal sebelumnya"
                      disabled={submitting}
                      className={inputClass(errors.asalSekolah)}
                    />
                  </Field>

                  <Field
                    label={butuhNilai ? "Nilai Rapor" : "Nilai Rapor (Opsional)"}
                    required={butuhNilai}
                    error={errors.nilaiRapor}
                    hint={
                      nilaiMinimal !== null
                        ? `Batas nilai rapor minimal jalur ini: ${nilaiMinimal}`
                        : "Rentang nilai 0 - 100"
                    }
                  >
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

            {/* Bagian 4: Titik Lokasi Rumah (Zonasi & Geolocation) */}
            <section className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <MapPin size={19} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                    Lokasi Domisili Calon Siswa
                    {butuhLokasi && (
                      <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                        Wajib untuk Jalur Ini
                      </span>
                    )}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Koordinat rumah wajib diperoleh secara presisi melalui GPS peramban untuk verifikasi radius zonasi dan pemeringkatan jarak.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Deteksi Titik Koordinat Rumah Otomatis (GPS)
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Tekan tombol untuk mengambil koordinat presisi. Pengisian koordinat secara manual tidak diizinkan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={deteksiLokasiGps}
                    disabled={mencariLokasi || submitting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                  >
                    {mencariLokasi ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Mendeteksi GPS...
                      </>
                    ) : (
                      <>
                        <Crosshair size={13} />
                        Gunakan Lokasi Saat Ini (GPS)
                      </>
                    )}
                  </button>
                </div>

                {/* Status UX: Sebelum GPS */}
                {!gpsTerdeteksi && !mencariLokasi && !gpsError && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-800">
                    <AlertCircle size={15} className="shrink-0 text-amber-600" />
                    <span>
                      <strong>Lokasi belum terdeteksi.</strong> Silakan tekan tombol &quot;Gunakan Lokasi Saat Ini (GPS)&quot; di atas untuk mendeteksi koordinat tempat tinggal calon siswa.
                    </span>
                  </div>
                )}

                {/* Status UX: Setelah Berhasil */}
                {gpsTerdeteksi && lokasiSukses && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                    <span>
                      <strong>Lokasi GPS terdeteksi:</strong> {lokasiSukses}
                    </span>
                  </div>
                )}

                {/* Status UX: Jika Gagal */}
                {gpsError && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Deteksi GPS Belum Berhasil</p>
                        <p className="text-[11px] text-rose-700">{gpsError}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={deteksiLokasiGps}
                      disabled={mencariLokasi || submitting}
                      className="inline-flex items-center gap-1 self-start sm:self-auto shrink-0 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      <RotateCcw size={12} />
                      Coba Deteksi GPS Lagi
                    </button>
                  </div>
                )}

                {errors.lokasi && !gpsError && (
                  <p role="alert" className="text-xs font-medium text-rose-500">
                    {errors.lokasi}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Lintang (Latitude)"
                    required={butuhLokasi}
                    error={errors.lintang}
                    hint="Koordinat lintang terkunci (read-only) dan hanya diisi via GPS peramban."
                  >
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={form.lintang}
                      placeholder={gpsTerdeteksi ? form.lintang : "Menunggu deteksi GPS..."}
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-700 cursor-not-allowed select-none focus:outline-none"
                    />
                  </Field>

                  <Field
                    label="Bujur (Longitude)"
                    required={butuhLokasi}
                    error={errors.bujur}
                    hint="Koordinat bujur terkunci (read-only) dan hanya diisi via GPS peramban."
                  >
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={form.bujur}
                      placeholder={gpsTerdeteksi ? form.bujur : "Menunggu deteksi GPS..."}
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-700 cursor-not-allowed select-none focus:outline-none"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Tombol Aksi Formulir */}
            <div className="mt-10 border-t border-slate-100 pt-6">
              {butuhLokasi && !gpsTerdeteksi && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
                  <AlertCircle size={14} className="shrink-0 text-amber-600" />
                  <span>
                    Tombol pendaftaran akan aktif setelah Anda menekan tombol &quot;Gunakan Lokasi Saat Ini (GPS)&quot; pada bagian Lokasi Domisili di atas.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
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
                    memuatOpsi ||
                    !sekolahId ||
                    !jalurPpdbId ||
                    Boolean(galatParameter) ||
                    Boolean(galatOpsi) ||
                    sekolahTidakCocok ||
                    (butuhLokasi && !gpsTerdeteksi)
                  }
                  aria-busy={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Memproses Pendaftaran...
                    </>
                  ) : (
                    <>
                      Lanjut ke Upload Dokumen
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PpdbFooter />
    </div>
  );
}
