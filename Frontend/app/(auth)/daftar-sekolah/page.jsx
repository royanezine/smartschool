"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CircleHelp,
  Eye,
  EyeOff,
  Globe2,
  Landmark,
  LockKeyhole,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  School,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { registerTenant } from "@/services/tenant.service";
import { getPaket, isPaketYayasan, isPaketSekolah } from "@/services/paket.service";
import { getProvinsi, getKotaByProvinsi } from "@/services/wilayah.service";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const initialForm = {
  // Mode Sekolah
  namaSekolah: "",
  jenjang: "",
  jumlahSiswa: "",
  kota: "",
  provinsi: "",
  namaYayasanNaungan: "",
  npypYayasanNaungan: "",

  // Mode Yayasan
  namaYayasan: "",
  npypYayasan: "",
  alamatYayasan: "",
  teleponYayasan: "",
  emailYayasan: "",

  // Akun Administrator
  namaLengkap: "",
  jabatan: "",
  email: "",
  whatsapp: "",
  paket: "",
  kataSandi: "",
  konfirmasiKataSandi: "",
  pesan: "",
};

function generateSubdomain(namaSekolah) {
  return namaSekolah
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatHarga(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `Rp ${number.toLocaleString("id-ID")}`;
}

const HERO_FADE =
  "linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.93) 32%, rgba(243,247,255,0.78) 50%, rgba(238,244,255,0.35) 70%, rgba(238,244,255,0.1) 100%)";

/* ---------- Komponen presentasi kecil ---------- */

function SectionHeader({ number, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F6FFF] to-[#0D47C9] text-sm font-extrabold text-white shadow-md shadow-[#155DFC]/25 ring-4 ring-[#EEF4FF]">
        {number}
      </div>
      <div className="pt-0.5">
        <h3 className="text-base font-extrabold text-[#0F172A]">{title}</h3>
        <p className="mt-0.5 text-sm font-medium text-[#475569]/80">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, required, optional, className = "", children }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[13px] font-bold text-[#0F172A]">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
        {optional && (
          <span className="ml-1.5 font-medium text-[#94A3B8]">(opsional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <span className="font-medium text-[#475569]/80">{label}</span>
      <span className="max-w-[58%] break-words text-right font-bold text-[#0F172A]">
        {value || <span className="font-normal text-[#CBD5E1]">—</span>}
      </span>
    </div>
  );
}

function DaftarSekolahContent() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const searchParams = useSearchParams();
  const queryPaketId = searchParams.get("paketId") || searchParams.get("paket") || "";
  const queryJenis = searchParams.get("jenis") || "";

  const [jenisPendaftaran, setJenisPendaftaran] = useState(
    queryJenis === "yayasan" ? "yayasan" : "sekolah"
  );
  const [formData, setFormData] = useState(initialForm);
  const [paketList, setPaketList] = useState([]);
  const [loadingPaket, setLoadingPaket] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Wilayah: formData.provinsi / formData.kota menyimpan NAMA (payload tetap),
  // sedangkan ID dipakai hanya untuk query dropdown berjenjang.
  const [provinsiList, setProvinsiList] = useState([]);
  const [provinsiId, setProvinsiId] = useState("");
  const [loadingProvinsi, setLoadingProvinsi] = useState(true);
  const [errorProvinsi, setErrorProvinsi] = useState("");
  const [kotaList, setKotaList] = useState([]);
  const [kotaId, setKotaId] = useState("");
  const [loadingKota, setLoadingKota] = useState(false);
  const [errorKota, setErrorKota] = useState("");
  const kotaRequestRef = useRef(0);

  const subdomain = useMemo(
    () => generateSubdomain(formData.namaSekolah),
    [formData.namaSekolah]
  );

  const availablePaketList = useMemo(() => {
    // Tidak ada fallback ke paketList: paket yang ditampilkan harus benar-benar
    // sesuai jenis pendaftaran. Jika paket untuk jenis tersebut belum tersedia
    // dari Backend, halaman menampilkan state "Paket belum tersedia".
    return jenisPendaftaran === "yayasan"
      ? paketList.filter((p) => isPaketYayasan(p))
      : paketList.filter((p) => isPaketSekolah(p));
  }, [paketList, jenisPendaftaran]);

  const selectedPaketInfo = useMemo(
    () => paketList.find((p) => p.id === formData.paket) || null,
    [paketList, formData.paket]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPaket() {
      try {
        setLoadingPaket(true);

        // Gunakan service resmi Frontend agar normalisasi data (termasuk
        // field `tipe`) konsisten dengan halaman lain.
        const result = await getPaket();
        const data = Array.isArray(result?.data) ? result.data : [];

        if (!cancelled) {
          setPaketList(data);

          if (queryPaketId) {
            const found = data.find(
              (p) =>
                String(p.id) === String(queryPaketId) ||
                String(p.nama || "").toLowerCase() === String(queryPaketId).toLowerCase()
            );
            if (found) {
              setFormData((prev) => ({
                ...prev,
                paket: found.id,
              }));
              if (isPaketYayasan(found)) {
                setJenisPendaftaran("yayasan");
              } else {
                setJenisPendaftaran("sekolah");
              }
            }
          }

          if (data.length === 0) {
            console.warn(
              "Respons API paket tidak berisi daftar paket:",
              result
            );
          }
        }
      } catch (err) {
        console.error("GET PAKET ERROR:", err);

        if (!cancelled) {
          setPaketList([]);
          setError(err?.message || "Gagal mengambil daftar paket.");
        }
      } finally {
        if (!cancelled) {
          setLoadingPaket(false);
        }
      }
    }

    loadPaket();

    return () => {
      cancelled = true;
    };
  }, [queryPaketId]);

  function handleSelectJenis(nextJenis) {
    if (nextJenis === jenisPendaftaran) return;
    setJenisPendaftaran(nextJenis);
    setError("");

    const targetPakets = paketList.filter((p) =>
      nextJenis === "yayasan" ? isPaketYayasan(p) : isPaketSekolah(p)
    );
    const isCurrentValid = targetPakets.some((p) => p.id === formData.paket);
    if (!isCurrentValid && targetPakets.length > 0) {
      setFormData((prev) => ({
        ...prev,
        paket: targetPakets[0].id,
      }));
    }
  }

  useEffect(() => {
    // loadingProvinsi sudah true sejak state awal; semua setState di bawah
    // terjadi setelah await (async), bukan sinkron di body effect.
    let cancelled = false;

    (async () => {
      try {
        const list = await getProvinsi();
        if (cancelled) return;
        setProvinsiList(list);
        if (list.length === 0) {
          setErrorProvinsi("Daftar provinsi kosong dari server.");
        }
      } catch (err) {
        if (cancelled) return;
        setProvinsiList([]);
        setErrorProvinsi(err?.message || "Gagal memuat daftar provinsi.");
      } finally {
        if (!cancelled) setLoadingProvinsi(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Dipakai tombol "Coba lagi" (handler event, bukan effect).
  async function retryProvinsi() {
    setLoadingProvinsi(true);
    setErrorProvinsi("");

    try {
      const list = await getProvinsi();
      setProvinsiList(list);
      if (list.length === 0) {
        setErrorProvinsi("Daftar provinsi kosong dari server.");
      }
    } catch (err) {
      setProvinsiList([]);
      setErrorProvinsi(err?.message || "Gagal memuat daftar provinsi.");
    } finally {
      setLoadingProvinsi(false);
    }
  }

  async function loadKota(idProvinsi) {
    const requestId = ++kotaRequestRef.current;

    setLoadingKota(true);
    setErrorKota("");

    try {
      const list = await getKotaByProvinsi(idProvinsi);
      if (requestId !== kotaRequestRef.current) return;
      setKotaList(list);
      if (list.length === 0) {
        setErrorKota("Data kota/kabupaten untuk provinsi ini kosong.");
      }
    } catch (err) {
      if (requestId !== kotaRequestRef.current) return;
      setKotaList([]);
      setErrorKota(err?.message || "Gagal memuat daftar kota/kabupaten.");
    } finally {
      if (requestId === kotaRequestRef.current) setLoadingKota(false);
    }
  }

  function handleProvinsiChange(event) {
    const id = event.target.value;
    const selected = provinsiList.find((item) => item.id === id);

    // Ganti provinsi: reset kota lama, batalkan request kota yang masih berjalan.
    kotaRequestRef.current += 1;
    setProvinsiId(id);
    setKotaId("");
    setKotaList([]);
    setErrorKota("");
    setLoadingKota(false);
    setFormData((prev) => ({
      ...prev,
      provinsi: selected ? selected.name : "",
      kota: "",
    }));
    setError("");
    setSuccess("");

    if (id) loadKota(id);
  }

  function handleKotaChange(event) {
    const id = event.target.value;
    const selected = kotaList.find((item) => item.id === id);

    setKotaId(id);
    setFormData((prev) => ({
      ...prev,
      kota: selected ? selected.name : "",
    }));
    setError("");
    setSuccess("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function selectPaket(id) {
    setFormData((prev) => ({
      ...prev,
      paket: id,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const nama = formData.namaLengkap.trim();
    const email = formData.email.trim().toLowerCase();
    const kataSandi = formData.kataSandi;

    if (!nama || nama.length < 3) {
      setError("Nama administrator minimal 3 karakter.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email administrator tidak valid.");
      return;
    }

    if (kataSandi.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (!/[A-Z]/.test(kataSandi)) {
      setError("Kata sandi harus memiliki minimal satu huruf besar.");
      return;
    }

    if (!/\d/.test(kataSandi)) {
      setError("Kata sandi harus memiliki minimal satu angka.");
      return;
    }

    if (kataSandi !== formData.konfirmasiKataSandi) {
      setError("Konfirmasi kata sandi tidak sesuai.");
      return;
    }

    if (!formData.paket) {
      setError("Silakan pilih paket SmartSchool.");
      return;
    }

    const selectedPaket = paketList.find(
      (paket) => paket.id === formData.paket
    );

    if (!selectedPaket) {
      setError("Paket tidak ditemukan. Silakan muat ulang halaman.");
      return;
    }

    // Pastikan paket yang dipilih sesuai jenis pendaftaran yang aktif.
    const tipePaketDipilih = isPaketYayasan(selectedPaket)
      ? "yayasan"
      : "sekolah";

    if (tipePaketDipilih !== jenisPendaftaran) {
      setError(
        jenisPendaftaran === "yayasan"
          ? "Paket yang dipilih bukan paket yayasan. Silakan pilih ulang paket."
          : "Paket yang dipilih bukan paket sekolah. Silakan pilih ulang paket."
      );
      return;
    }

    let payload;

    if (jenisPendaftaran === "sekolah") {
      const namaSekolah = formData.namaSekolah.trim();
      const teleponSekolah = (formData.whatsapp || "").trim();
      const kota = formData.kota.trim();
      const provinsi = formData.provinsi.trim();

      if (namaSekolah.length < 3) {
        setError("Nama sekolah minimal 3 karakter.");
        return;
      }

      if (!formData.jenjang) {
        setError("Jenjang sekolah wajib dipilih.");
        return;
      }

      if (!subdomain || subdomain.length < 3) {
        setError("Subdomain minimal 3 karakter.");
        return;
      }

      if (!/^[a-z0-9-]+$/.test(subdomain)) {
        setError("Subdomain hanya boleh huruf kecil, angka, dan strip.");
        return;
      }

      if (!kota || !provinsi) {
        setError("Kota dan provinsi sekolah wajib diisi.");
        return;
      }

      if (teleponSekolah.length < 8) {
        setError("Nomor telepon/WhatsApp sekolah minimal 8 karakter.");
        return;
      }

      payload = {
        jenisPendaftaran: "sekolah",
        paketId: selectedPaket.id,
        nama,
        email,
        kataSandi,
        namaSekolah,
        jenjang: formData.jenjang,
        subdomain,
        alamatSekolah: `${kota}, ${provinsi}`,
        teleponSekolah,
      };

      if (formData.namaYayasanNaungan?.trim()) {
        payload.namaYayasan = formData.namaYayasanNaungan.trim();
      }
      if (formData.npypYayasanNaungan?.trim()) {
        payload.npypYayasan = formData.npypYayasanNaungan.trim();
      }
    } else if (jenisPendaftaran === "yayasan") {
      const namaYayasan = formData.namaYayasan.trim();
      const npypYayasan = formData.npypYayasan.trim();
      const alamatYayasan = formData.alamatYayasan.trim();
      const teleponYayasan = formData.teleponYayasan.trim();
      const emailYayasan = formData.emailYayasan.trim().toLowerCase();

      if (namaYayasan.length < 3) {
        setError("Nama yayasan minimal 3 karakter.");
        return;
      }

      if (npypYayasan.length < 3) {
        setError("NPYP yayasan minimal 3 karakter.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailYayasan)) {
        setError("Format email resmi yayasan tidak valid.");
        return;
      }

      if (teleponYayasan.length < 8) {
        setError("Nomor telepon yayasan minimal 8 digit.");
        return;
      }

      if (alamatYayasan.length < 5) {
        setError("Alamat lengkap yayasan minimal 5 karakter.");
        return;
      }

      payload = {
        jenisPendaftaran: "yayasan",
        paketId: selectedPaket.id,
        nama,
        email,
        kataSandi,
        namaYayasan,
        npypYayasan,
        alamatYayasan,
        teleponYayasan,
        emailYayasan,
      };
    } else {
      setError("Jenis pendaftaran tidak valid.");
      return;
    }

    try {
      setLoadingSubmit(true);

      const result = await registerTenant(payload);

      // Service tenant sudah memeriksa HTTP error dan success: false.
      // Jangan menganggap gagal hanya karena backend tidak mengirim properti success.
      if (result?.success === false) {
        throw new Error(
          result?.message || "Pendaftaran belum berhasil diproses."
        );
      }

      // Email diteruskan ke halaman verifikasi melalui query URL.
      // Tidak perlu menyimpan data pendaftaran ke localStorage.

      setSuccess(
        result.message || "Pendaftaran berhasil. Silakan verifikasi email."
      );

      router.push(
        `/daftar-sekolah/menunggu?email=${encodeURIComponent(email)}`
      );
    } catch (err) {
      // Ambil pesan error dari Error biasa, TenantApiError, atau object respons
      // yang mungkin dilempar oleh service/backend.
      const errorObject = err && typeof err === "object" ? err : null;

      const isConflict =
        errorObject?.status === 409 ||
        err?.status === 409 ||
        /409/.test(String(err));

      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof errorObject?.message === "string"
            ? errorObject.message
            : typeof errorObject?.error === "string"
              ? errorObject.error
              : typeof errorObject?.payload?.message === "string"
                ? errorObject.payload.message
                : "Pendaftaran gagal. Silakan coba kembali.";

      console.error("REGISTER TENANT ERROR:", {
        message: errorMessage,
        name: err instanceof Error ? err.name : errorObject?.name,
        status: errorObject?.status,
        errorCode: errorObject?.errorCode,
        payload: errorObject?.payload,
        isConflict,
        error: err,
      });

      // Tangani HTTP 409 secara khusus: tampilkan pesan spesifik dari Backend tanpa masking
      setError(errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#DBE5F5] bg-white px-4 py-3 text-sm font-medium text-[#0F172A] outline-none transition placeholder:font-normal placeholder:text-[#94A3B8] hover:border-[#155DFC]/50 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/15 disabled:cursor-not-allowed disabled:bg-[#F5F8FE] disabled:text-[#94A3B8]";

  const iconClass =
    "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]";

  const isYayasan = jenisPendaftaran === "yayasan";

  const fitur = [
    { icon: Building2, text: "Manajemen sekolah terintegrasi" },
    { icon: Users, text: "Pengelolaan pengguna berbasis peran" },
    { icon: ShieldCheck, text: "Akses data yang terkontrol" },
    { icon: Globe2, text: "Platform berbasis cloud" },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.55, ease: "easeOut" },
    },
  };

  return (
    <main className={`${jakarta.className} min-h-screen bg-[#EEF4FF] text-[#0F172A]`}>
      {/* ===== Hero ===== */}
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-30">
          <Image
            src="/hero/hero.png"
            alt="Gedung Smart School"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          style={{ background: HERO_FADE }}
        />
        <div className="absolute inset-0 -z-20 bg-white/45 lg:hidden" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-b from-transparent to-[#EEF4FF]"
        />

        <div className="mx-auto max-w-7xl px-5 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-32">
          {/* Bar atas */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                aria-label="Kembali"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0F172A] shadow-sm ring-1 ring-[#0F172A]/10 transition-all hover:bg-[#0F172A] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>

              <Link
                href="/"
                aria-label="Smart School Beranda"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <Image
                  src="/logo/logoSS.png"
                  alt="Logo Smart School"
                  width={44}
                  height={44}
                  priority
                  className="h-11 w-11 object-contain"
                />
                <span className="text-xl font-extrabold leading-none tracking-tight text-[#0F172A]">
                  SMART <span className="text-[#155DFC]">SCHOOL</span>
                </span>
              </Link>
            </div>

            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0F172A] shadow-sm ring-1 ring-[#0F172A]/10 transition hover:bg-[#0F172A] hover:text-white"
            >
              Masuk
            </Link>
          </div>

          {/* Judul */}
          <motion.div
            key={jenisPendaftaran}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-12 max-w-2xl lg:mt-16"
          >
            <div className="flex items-center gap-3.5">
              <span aria-hidden="true" className="block h-[3px] w-11 rounded-full bg-[#155DFC]" />
              <span className="text-sm font-bold text-[#155DFC] sm:text-base">
                {isYayasan ? "Pendaftaran Yayasan" : "Pendaftaran Sekolah"}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-[#0F172A] sm:text-5xl">
              {isYayasan ? "Kelola Seluruh Unit" : "Mulai Kelola"}
              <br />
              <span className="bg-gradient-to-r from-[#155DFC] to-[#0D47C9] bg-clip-text text-transparent">
                {isYayasan ? "Yayasan Anda" : "Sekolah Anda"}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-[#475569]">
              {isYayasan
                ? "Lengkapi informasi yayasan dan administrator untuk mengelola seluruh unit sekolah binaan dalam satu sistem terpusat."
                : "Lengkapi informasi satuan pendidikan dan administrator untuk mulai menggunakan platform manajemen sekolah SmartSchool."}
            </p>
          </motion.div>
        </div>
      </header>

      {/* ===== Konten ===== */}
      <section className="relative z-10 -mt-16 pb-16 sm:-mt-20 sm:pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
          {/* Form */}
          <div className="rounded-3xl border border-white bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <form onSubmit={handleSubmit} className="p-6 sm:p-9">
              {error && (
                <div
                  role="alert"
                  className="mb-8 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-800"
                >
                  <XCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-bold">Pendaftaran belum dapat diproses</p>
                    <p className="mt-0.5 text-[13px] leading-5">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="mb-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold">Pendaftaran berhasil</p>
                    <p className="mt-0.5 text-[13px] leading-5">{success}</p>
                  </div>
                </div>
              )}

              {/* 1. Jenis pendaftaran */}
              <section>
                <SectionHeader
                  number="1"
                  title="Jenis Pendaftaran"
                  description="Pilih sesuai entitas yang akan didaftarkan."
                />

                <div className="grid gap-3.5 sm:grid-cols-2">
                  {[
                    {
                      key: "sekolah",
                      icon: School,
                      title: "Sekolah",
                      desc: "Satuan pendidikan mandiri atau cabang (SD, SMP, SMA, SMK, SLB).",
                    },
                    {
                      key: "yayasan",
                      icon: Landmark,
                      title: "Yayasan",
                      desc: "Badan pengelola yang menaungi beberapa unit sekolah binaan.",
                    },
                  ].map(({ key, icon: Icon, title, desc }) => {
                    const active = jenisPendaftaran === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleSelectJenis(key)}
                        className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-[#155DFC] bg-[#EEF4FF]/70 ring-2 ring-[#155DFC]/20"
                            : "border-[#DBE5F5] bg-white hover:border-[#155DFC]/50"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                            active
                              ? "bg-gradient-to-br from-[#2F6FFF] to-[#0D47C9] text-white shadow-md shadow-[#155DFC]/30"
                              : "bg-[#EEF4FF] text-[#155DFC]"
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-extrabold text-[#0F172A]">{title}</h4>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                active
                                  ? "border-[#155DFC] bg-[#155DFC] text-white"
                                  : "border-[#CBD5E1] text-transparent"
                              }`}
                            >
                              <Check size={12} strokeWidth={3} />
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] font-medium leading-5 text-[#475569]/80">
                            {desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="my-9 h-px bg-[#E5ECF8]" />

              {/* 2. Data instansi */}
              {!isYayasan ? (
                <section>
                  <SectionHeader
                    number="2"
                    title="Data Sekolah"
                    description="Informasi dasar satuan pendidikan."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Nama Sekolah" required className="md:col-span-2">
                      <input
                        required
                        minLength={3}
                        name="namaSekolah"
                        value={formData.namaSekolah}
                        onChange={handleChange}
                        placeholder="Contoh: SMA SmartSchool"
                        className={inputClass}
                      />
                      {subdomain && (
                        <div className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-[#EEF4FF] px-3.5 py-1.5">
                          <Globe2 size={14} className="shrink-0 text-[#155DFC]" />
                          <p className="text-xs font-medium text-[#475569]">
                            Alamat akses:
                            <span className="ml-1 font-bold text-[#155DFC]">
                              {subdomain}.smartschool.id
                            </span>
                          </p>
                        </div>
                      )}
                    </Field>

                    <Field label="Jenjang" required>
                      <select
                        required
                        name="jenjang"
                        value={formData.jenjang}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="">Pilih jenjang</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA</option>
                        <option value="SMK">SMK</option>
                        <option value="SLB">SLB</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </Field>

                    <Field label="Jumlah Siswa" optional>
                      <div className="relative">
                        <Users size={16} className={iconClass} />
                        <input
                          type="number"
                          min="1"
                          name="jumlahSiswa"
                          value={formData.jumlahSiswa}
                          onChange={handleChange}
                          placeholder="Contoh: 500"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>

                    <Field label="Provinsi" required>
                      <div className="relative">
                        <MapPin size={16} className={iconClass} />
                        <select
                          required
                          name="provinsi"
                          value={provinsiId}
                          onChange={handleProvinsiChange}
                          disabled={loadingProvinsi || provinsiList.length === 0}
                          className={`${inputClass} pl-10`}
                        >
                          <option value="">
                            {loadingProvinsi ? "Memuat provinsi..." : "Pilih provinsi"}
                          </option>
                          {provinsiList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errorProvinsi && (
                        <p className="mt-1.5 text-xs text-rose-600">
                          {errorProvinsi}{" "}
                          <button
                            type="button"
                            onClick={retryProvinsi}
                            className="font-bold underline underline-offset-2"
                          >
                            Coba lagi
                          </button>
                        </p>
                      )}
                    </Field>

                    <Field label="Kota/Kabupaten" required>
                      <div className="relative">
                        <MapPin size={16} className={iconClass} />
                        <select
                          required
                          name="kota"
                          value={kotaId}
                          onChange={handleKotaChange}
                          disabled={!provinsiId || loadingKota || kotaList.length === 0}
                          className={`${inputClass} pl-10`}
                        >
                          <option value="">
                            {!provinsiId
                              ? "Pilih provinsi terlebih dahulu"
                              : loadingKota
                                ? "Memuat kota/kabupaten..."
                                : "Pilih kota/kabupaten"}
                          </option>
                          {kotaList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errorKota && (
                        <p className="mt-1.5 text-xs text-rose-600">
                          {errorKota}{" "}
                          {provinsiId && (
                            <button
                              type="button"
                              onClick={() => loadKota(provinsiId)}
                              className="font-bold underline underline-offset-2"
                            >
                              Coba lagi
                            </button>
                          )}
                        </p>
                      )}
                    </Field>

                    <Field label="Telepon / WhatsApp Sekolah" required>
                      <div className="relative">
                        <Phone size={16} className={iconClass} />
                        <input
                          required
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          placeholder="08xxxxxxxxxx atau 021-xxxxxxx"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>

                    <div className="md:col-span-2">
                      <div className="rounded-2xl border border-[#DBE5F5] bg-[#F5F8FE] p-5">
                        <p className="text-[13px] font-bold text-[#0F172A]">
                          Yayasan Naungan
                          <span className="ml-1.5 font-medium text-[#94A3B8]">(opsional)</span>
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-[#475569]/80">
                          Isi jika sekolah berada di bawah naungan sebuah yayasan.
                        </p>

                        <div className="mt-4 grid gap-5 md:grid-cols-2">
                          <Field label="Nama Yayasan">
                            <input
                              name="namaYayasanNaungan"
                              value={formData.namaYayasanNaungan}
                              onChange={handleChange}
                              placeholder="Contoh: Yayasan Pendidikan Al-Hikmah"
                              className={inputClass}
                            />
                          </Field>

                          <Field label="NPYP Yayasan">
                            <input
                              name="npypYayasanNaungan"
                              value={formData.npypYayasanNaungan}
                              onChange={handleChange}
                              placeholder="Contoh: P-12345678"
                              className={inputClass}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <section>
                  <SectionHeader
                    number="2"
                    title="Data Lembaga Yayasan"
                    description="Informasi identitas dan legalitas yayasan."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Nama Yayasan" required className="md:col-span-2">
                      <input
                        required
                        minLength={3}
                        name="namaYayasan"
                        value={formData.namaYayasan}
                        onChange={handleChange}
                        placeholder="Contoh: Yayasan Pendidikan Al-Hikmah"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="NPYP Yayasan" required>
                      <input
                        required
                        minLength={3}
                        name="npypYayasan"
                        value={formData.npypYayasan}
                        onChange={handleChange}
                        placeholder="Nomor Pokok Yayasan"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Nomor Telepon Yayasan" required>
                      <div className="relative">
                        <Phone size={16} className={iconClass} />
                        <input
                          required
                          type="tel"
                          name="teleponYayasan"
                          value={formData.teleponYayasan}
                          onChange={handleChange}
                          placeholder="022-1234567 atau 08123456789"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>

                    <Field label="Email Resmi Yayasan" required className="md:col-span-2">
                      <div className="relative">
                        <Mail size={16} className={iconClass} />
                        <input
                          required
                          type="email"
                          name="emailYayasan"
                          value={formData.emailYayasan}
                          onChange={handleChange}
                          placeholder="info@yayasan-alhikmah.sch.id"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </Field>

                    <Field label="Alamat Lengkap Yayasan" required className="md:col-span-2">
                      <textarea
                        required
                        minLength={5}
                        rows={3}
                        name="alamatYayasan"
                        value={formData.alamatYayasan}
                        onChange={handleChange}
                        placeholder="Jl. Pendidikan No. 10, Kel. Dago, Kec. Coblong, Kota Bandung, Jawa Barat"
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </section>
              )}

              <div className="my-9 h-px bg-[#E5ECF8]" />

              {/* 3. Administrator */}
              <section>
                <SectionHeader
                  number="3"
                  title={isYayasan ? "Administrator Yayasan" : "Administrator Sekolah"}
                  description="Akun pengelola yang akan menerima kode verifikasi (OTP) melalui email."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Nama Lengkap" required>
                    <div className="relative">
                      <UserRound size={16} className={iconClass} />
                      <input
                        required
                        name="namaLengkap"
                        value={formData.namaLengkap}
                        onChange={handleChange}
                        placeholder={isYayasan ? "Contoh: Ahmad Fauzi" : "Nama lengkap administrator"}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </Field>

                  <Field label="Jabatan" optional>
                    <input
                      name="jabatan"
                      value={formData.jabatan}
                      onChange={handleChange}
                      placeholder={isYayasan ? "Contoh: Ketua Yayasan" : "Contoh: Kepala Sekolah"}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Email Administrator (Penerima OTP)" required className="md:col-span-2">
                    <div className="relative">
                      <Mail size={16} className={iconClass} />
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={isYayasan ? "ahmad@yayasan-alhikmah.sch.id" : "admin@sekolah.sch.id"}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </Field>

                  <Field label="Kata Sandi" required>
                    <div className="relative">
                      <LockKeyhole size={16} className={iconClass} />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        name="kataSandi"
                        value={formData.kataSandi}
                        onChange={handleChange}
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Min. 8 karakter"
                        className={`${inputClass} pl-10 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#155DFC]"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-[#475569]/70">
                      Minimal 8 karakter, mengandung 1 huruf besar dan 1 angka.
                    </p>
                  </Field>

                  <Field label="Konfirmasi Kata Sandi" required>
                    <div className="relative">
                      <LockKeyhole size={16} className={iconClass} />
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        name="konfirmasiKataSandi"
                        value={formData.konfirmasiKataSandi}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Ulangi kata sandi"
                        className={`${inputClass} pl-10 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#155DFC]"
                      >
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </Field>
                </div>
              </section>

              <div className="my-9 h-px bg-[#E5ECF8]" />

              {/* 4. Paket */}
              <section>
                <SectionHeader
                  number="4"
                  title="Paket SmartSchool"
                  description={
                    isYayasan
                      ? "Pilih paket untuk pengelolaan multi-sekolah."
                      : "Sesuaikan dengan skala dan kebutuhan satuan pendidikan."
                  }
                />

                {loadingPaket ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#DBE5F5] bg-[#F5F8FE] px-4 py-5 text-sm font-medium text-[#475569]">
                    <RefreshCw size={16} className="animate-spin text-[#155DFC]" />
                    Memuat daftar paket...
                  </div>
                ) : availablePaketList.length === 0 ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                    <XCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold">Paket belum tersedia</p>
                      <p className="mt-1 text-[13px] leading-5">
                        Belum ada paket aktif untuk pendaftaran {jenisPendaftaran}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {availablePaketList.map((paket) => {
                      const selected = formData.paket === paket.id;
                      const harga = formatHarga(paket.harga);

                      return (
                        <button
                          key={paket.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => selectPaket(paket.id)}
                          className={`flex flex-col rounded-2xl border p-5 text-left transition ${
                            selected
                              ? "border-[#155DFC] bg-[#EEF4FF]/70 ring-2 ring-[#155DFC]/20"
                              : "border-[#DBE5F5] bg-white hover:border-[#155DFC]/50 hover:shadow-md hover:shadow-[#155DFC]/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                  selected
                                    ? "bg-gradient-to-br from-[#2F6FFF] to-[#0D47C9] text-white shadow-md shadow-[#155DFC]/30"
                                    : "bg-[#EEF4FF] text-[#155DFC]"
                                }`}
                              >
                                <Package size={18} />
                              </div>
                              <h4 className="font-extrabold text-[#0F172A]">
                                {paket.nama || paket.namaPaket || "Paket SmartSchool"}
                              </h4>
                            </div>

                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[#155DFC] bg-[#155DFC] text-white"
                                  : "border-[#CBD5E1] text-transparent"
                              }`}
                            >
                              <Check size={12} strokeWidth={3} />
                            </span>
                          </div>

                          {paket.deskripsi && (
                            <p className="mt-3 text-[13px] font-medium leading-5 text-[#475569]/80">
                              {paket.deskripsi}
                            </p>
                          )}

                          {(harga || paket.durasi) && (
                            <div className="mt-4 border-t border-[#E5ECF8] pt-4">
                              {harga && (
                                <p className="text-xl font-extrabold text-[#155DFC]">{harga}</p>
                              )}
                              {paket.durasi && (
                                <p className="mt-0.5 text-xs font-medium text-[#475569]/70">
                                  Durasi {paket.durasi}
                                </p>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <div className="my-9 h-px bg-[#E5ECF8]" />

              {/* 5. Catatan */}
              <section>
                <SectionHeader
                  number="5"
                  title="Catatan Tambahan"
                  description="Sampaikan kebutuhan khusus atau pertanyaan Anda."
                />

                <Field label="Pesan / Kebutuhan Tambahan" optional>
                  <textarea
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tulis kebutuhan atau pertanyaan mengenai SmartSchool..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </section>

              {/* Submit */}
              <div className="mt-9 flex flex-col gap-4 border-t border-[#E5ECF8] pt-7 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2 text-xs font-medium leading-5 text-[#475569]/80 sm:max-w-sm">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#155DFC]" />
                  Setelah pendaftaran tersimpan, kode OTP akan dikirim ke email administrator.
                </p>

                <button
                  type="submit"
                  disabled={loadingSubmit || loadingPaket || availablePaketList.length === 0}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#155DFC] to-[#0D47C9] px-8 text-sm font-bold text-white shadow-lg shadow-[#155DFC]/30 transition hover:shadow-xl hover:shadow-[#155DFC]/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                >
                  {loadingSubmit ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Mengirim pendaftaran...
                    </>
                  ) : (
                    <>
                      {isYayasan ? "Daftarkan Yayasan" : "Daftarkan Sekolah"}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="h-fit space-y-5 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <div className="bg-gradient-to-br from-[#155DFC] to-[#0D47C9] px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                  Ringkasan
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-white">
                  Data Pendaftaran
                </h3>
              </div>
              <div className="divide-y divide-[#E5ECF8] px-6 py-2">
                <SummaryRow label="Jenis" value={isYayasan ? "Yayasan" : "Sekolah"} />
                <SummaryRow
                  label={isYayasan ? "Nama yayasan" : "Nama sekolah"}
                  value={isYayasan ? formData.namaYayasan : formData.namaSekolah}
                />
                {!isYayasan && (
                  <SummaryRow
                    label="Alamat akses"
                    value={subdomain ? `${subdomain}.smartschool.id` : ""}
                  />
                )}
                <SummaryRow
                  label="Paket"
                  value={selectedPaketInfo?.nama || selectedPaketInfo?.namaPaket}
                />
                <SummaryRow
                  label="Harga"
                  value={selectedPaketInfo ? formatHarga(selectedPaketInfo.harga) : ""}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#155DFC]">
                Mengapa SmartSchool
              </p>
              <ul className="mt-5 space-y-4">
                {fitur.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F6FFF] to-[#0D47C9] text-white shadow-md shadow-[#155DFC]/25">
                      <Icon size={16} />
                    </span>
                    <span className="text-sm font-bold text-[#0F172A]">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
              <div className="flex items-center gap-2.5">
                <CircleHelp size={18} className="text-[#155DFC]" />
                <h3 className="text-sm font-extrabold text-[#0F172A]">Butuh bantuan?</h3>
              </div>
              <p className="mt-2.5 text-[13px] font-medium leading-5 text-[#475569]/80">
                Hubungi tim kami untuk informasi paket atau proses pendaftaran.
              </p>
              <a
                href="mailto:info@smartschool.com"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#155DFC] transition hover:text-[#0D47C9]"
              >
                <Mail size={15} /> info@smartschool.com
              </a>
            </div>

            <p className="flex items-start gap-2 px-2 text-xs font-medium leading-5 text-[#475569]/70">
              <LockKeyhole size={14} className="mt-0.5 shrink-0 text-[#155DFC]" />
              Data pendaftaran hanya digunakan untuk proses pendaftaran dan verifikasi administrator.
            </p>
          </aside>
        </div>
      </section>

      <footer className="border-t border-[#DBE5F5] bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <p className="text-xs font-medium text-[#475569]/80">
            © {new Date().getFullYear()} SmartSchool. Semua hak dilindungi.
          </p>
          <p className="text-xs font-medium text-[#94A3B8]">
            Platform Manajemen Sekolah Terintegrasi
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function DaftarSekolahPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#EEF4FF]">
          <RefreshCw className="animate-spin text-[#155DFC]" size={26} />
        </div>
      }
    >
      <DaftarSekolahContent />
    </Suspense>
  );
}