
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { registerTenant } from "@/services/tenant.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiBaseUrl() {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi di file .env."
    );
  }

  return API_URL.trim().replace(/\/+$/, "").replace(/\/api$/i, "");
}

const initialForm = {
  namaSekolah: "",
  jenjang: "",
  jumlahSiswa: "",
  kota: "",
  provinsi: "",
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

function getPaketArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.paket)) return result.data.paket;
  if (Array.isArray(result?.data?.pakets)) return result.data.pakets;
  if (Array.isArray(result?.paket)) return result.paket;

  return [];
}

function DaftarSekolahContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPaketId = searchParams.get("paketId") || searchParams.get("paket") || "";

  const [formData, setFormData] = useState(initialForm);
  const [paketList, setPaketList] = useState([]);
  const [loadingPaket, setLoadingPaket] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const subdomain = useMemo(
    () => generateSubdomain(formData.namaSekolah),
    [formData.namaSekolah]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPaket() {
      try {
        setLoadingPaket(true);

        const endpoint = `${getApiBaseUrl()}/api/paket`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const responseText = await response.text();

        let result;

        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error(
            `Respons API paket bukan JSON. Periksa endpoint ${endpoint}.`
          );
        }

        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message ||
              `Gagal mengambil daftar paket. HTTP ${response.status}.`
          );
        }

        const data = getPaketArray(result);

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

  useEffect(() => {
    if (!queryPaketId || paketList.length === 0) return;

    const found = paketList.find(
      (p) =>
        String(p.id) === String(queryPaketId) ||
        String(p.nama || "").toLowerCase() === String(queryPaketId).toLowerCase()
    );

    if (found) {
      setFormData((prev) => {
        if (prev.paket === found.id) return prev;
        return {
          ...prev,
          paket: found.id,
        };
      });
    }
  }, [queryPaketId, paketList]);

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

  const namaSekolah = formData.namaSekolah.trim();
  const nama = formData.namaLengkap.trim();
  const email = formData.email.trim().toLowerCase();
  const kataSandi = formData.kataSandi;
  const teleponSekolah = formData.whatsapp.trim();
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

  if (!nama) {
    setError("Nama administrator wajib diisi.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Format email tidak valid.");
    return;
  }

  if (teleponSekolah.length < 8) {
    setError("Nomor WhatsApp minimal 8 karakter.");
    return;
  }

  if (!kota || !provinsi) {
    setError("Kota dan provinsi wajib diisi.");
    return;
  }

  if (!formData.paket) {
    setError("Silakan pilih paket SmartSchool.");
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

  const selectedPaket = paketList.find(
    (paket) => paket.id === formData.paket
  );

  if (!selectedPaket) {
    setError("Paket tidak ditemukan. Silakan muat ulang halaman.");
    return;
  }

  const payload = {
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
    const errorObject =
      err && typeof err === "object"
        ? err
        : null;

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
      error: err,
    });

    setError(errorMessage);
  } finally {
    setLoadingSubmit(false);
  }
}


  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  const fitur = [
    { icon: Building2, text: "Manajemen sekolah terintegrasi" },
    { icon: Users, text: "Pengelolaan pengguna berbasis role" },
    { icon: ShieldCheck, text: "Akses data lebih terkontrol" },
    { icon: Globe2, text: "Platform berbasis cloud" },
  ];

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo/logoSS.png"
                alt="SmartSchool Logo"
                fill
                priority
                sizes="40px"
                className="object-contain"
              />
            </div>

            <span className="text-xl font-bold tracking-tight text-blue-600">
              SmartSchool
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/#fitur" className="text-sm text-slate-500 hover:text-blue-600">Fitur</Link>
            <Link href="/#harga" className="text-sm text-slate-500 hover:text-blue-600">Harga</Link>
            <Link href="/#cara-kerja" className="text-sm text-slate-500 hover:text-blue-600">Cara Kerja</Link>
            <Link href="/#kontak" className="text-sm text-slate-500 hover:text-blue-600">Kontak</Link>
            <Link href="/login" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:border-blue-300 hover:text-blue-600">
              Masuk
            </Link>
          </div>

          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 md:hidden">
            Masuk <ChevronRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[#0f172a]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-48 left-[-100px] h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-blue-200">
              <Sparkles size={14} />
              Pendaftaran Sekolah
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Mulai kelola sekolah
              <br />
              bersama <span className="text-blue-400">SmartSchool</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Lengkapi informasi sekolah dan administrator untuk memulai
              penggunaan platform manajemen sekolah terintegrasi SmartSchool.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {[
                [ShieldCheck, "Sistem terintegrasi"],
                [LockKeyhole, "Akses aman"],
                [Globe2, "Berbasis cloud"],
              ].map(([Icon, text]) => (
                <div key={text} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-xs font-medium text-slate-300">
                  <Icon size={15} className="text-blue-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-7 sm:pb-20 sm:pt-9">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-7 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 size={19} />
                </div>
                <div>
                  <h2 className="text-base font-bold sm:text-lg">Informasi Pendaftaran</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                    Isi data berikut dengan informasi yang benar.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700">
                  <XCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Pendaftaran belum dapat diproses</p>
                    <p className="mt-0.5 text-xs leading-5">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Pendaftaran berhasil</p>
                    <p className="mt-0.5 text-xs leading-5">{success}</p>
                  </div>
                </div>
              )}

              <section>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Data Sekolah</h3>
                    <p className="text-xs text-slate-400">Informasi dasar sekolah</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Nama Sekolah</label>
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
                      <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                        <Globe2 size={14} className="shrink-0 text-blue-600" />
                        <p className="text-xs text-slate-500">
                          Subdomain:
                          <span className="ml-1 font-semibold text-blue-600">
                            {subdomain}.smartschool.id
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Jenjang</label>
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
                  </div>

                  <div>
                    <label className={labelClass}>Jumlah Siswa (opsional)</label>
                    <div className="relative">
                      <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  </div>

                  <div>
                    <label className={labelClass}>Kota</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        name="kota"
                        value={formData.kota}
                        onChange={handleChange}
                        placeholder="Contoh: Depok"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Provinsi</label>
                    <input
                      required
                      name="provinsi"
                      value={formData.provinsi}
                      onChange={handleChange}
                      placeholder="Contoh: Jawa Barat"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <div className="my-8 h-px bg-slate-100" />

              <section>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <UserRound size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Data Administrator</h3>
                    <p className="text-xs text-slate-400">Akun pengelola sekolah</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nama Lengkap</label>
                    <input
                      required
                      name="namaLengkap"
                      value={formData.namaLengkap}
                      onChange={handleChange}
                      placeholder="Nama lengkap administrator"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Jabatan (opsional)</label>
                    <input
                      name="jabatan"
                      value={formData.jabatan}
                      onChange={handleChange}
                      placeholder="Contoh: Kepala Sekolah"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@sekolah.sch.id"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>WhatsApp</label>
                    <div className="relative">
                      <MessageCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="08xxxxxxxxxx"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Kata Sandi</label>
                    <div className="relative">
                      <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        name="kataSandi"
                        value={formData.kataSandi}
                        onChange={handleChange}
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Min. 8 karakter, 1 huruf besar & 1 angka"
                        className={`${inputClass} pl-10 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Konfirmasi Kata Sandi</label>
                    <div className="relative">
                      <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="my-8 h-px bg-slate-100" />

              <section>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Package size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Pilih Paket SmartSchool</h3>
                    <p className="text-xs text-slate-400">Sesuaikan dengan kebutuhan sekolah</p>
                  </div>
                </div>

                {loadingPaket ? (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    <RefreshCw size={17} className="animate-spin text-blue-600" />
                    Memuat daftar paket...
                  </div>
                ) : paketList.length === 0 ? (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                    <XCircle size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Paket belum tersedia</p>
                      <p className="mt-1 text-xs leading-5">
                        Periksa endpoint GET /api/paket dan data paket di backend.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {paketList.map((paket) => {
                      const selected = formData.paket === paket.id;
                      const harga = formatHarga(paket.harga);

                      return (
                        <button
                          key={paket.id}
                          type="button"
                          onClick={() => selectPaket(paket.id)}
                          className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition ${
                            selected
                              ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/10"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                          }`}
                        >
                          {selected && (
                            <div className="absolute right-0 top-0 rounded-bl-xl bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase text-white">
                              Pilihan
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                            }`}>
                              <Package size={18} />
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900">
                                {paket.nama || paket.namaPaket || "Paket SmartSchool"}
                              </h4>
                              {paket.deskripsi && (
                                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                                  {paket.deskripsi}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-200/70 pt-4">
                            <div>
                              {harga && (
                                <p className="text-lg font-bold text-blue-700">
                                  {harga}
                                </p>
                              )}
                              {paket.durasi && (
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  Durasi {paket.durasi}
                                </p>
                              )}
                            </div>

                            <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-transparent"
                            }`}>
                              <Check size={14} />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <div className="my-8 h-px bg-slate-100" />

              <div>
                <label className={labelClass}>
                  Pesan / Kebutuhan Tambahan{" "}
                  <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <textarea
                  name="pesan"
                  value={formData.pesan}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tulis kebutuhan atau pertanyaan mengenai SmartSchool..."
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-xs text-slate-400">
                  Pesan ini belum dikirim ke backend karena tidak ada pada payload registrasi yang diberikan.
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={loadingSubmit || loadingPaket || paketList.length === 0}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-6 text-sm font-bold text-white shadow-lg transition hover:bg-[#0D47C9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingSubmit ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Mengirim pendaftaran...
                    </>
                  ) : (
                    <>
                      Daftar Sekolah
                      <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-start justify-center gap-2 text-center">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-blue-500" />
                  <p className="text-[11px] leading-5 text-slate-400">
                    Setelah pendaftaran tersimpan, kode OTP dikirim ke email administrator.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <aside className="h-fit space-y-5 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-2xl bg-[#0f172a] p-6 text-white shadow-xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-600/20 blur-2xl" />

              <div className="relative">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                  <ShieldCheck size={21} />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                  SmartSchool
                </p>
                <h3 className="mt-2 text-xl font-bold">
                  Satu platform untuk pengelolaan sekolah.
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Kelola aktivitas sekolah secara lebih terstruktur melalui satu sistem terintegrasi.
                </p>

                <div className="mt-6 space-y-3">
                  {fitur.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/15 text-blue-300">
                          <Icon size={14} />
                        </div>
                        <p className="text-xs font-medium text-slate-300">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <CircleHelp size={16} />
                  </div>
                  <h3 className="text-sm font-bold">Butuh bantuan?</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs leading-6 text-slate-500">
                  Hubungi tim SmartSchool untuk informasi paket atau proses pendaftaran.
                </p>
                <a href="mailto:info@smartschool.com" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <Mail size={15} /> info@smartschool.com
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <LockKeyhole size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Data pendaftaran</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Informasi digunakan untuk proses pendaftaran dan verifikasi administrator.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} SmartSchool. Semua hak dilindungi.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={13} className="text-blue-500" />
            Platform Manajemen Sekolah Terintegrasi
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function DaftarSekolahPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f8fc]">
          <RefreshCw className="animate-spin text-blue-600" size={28} />
        </div>
      }
    >
      <DaftarSekolahContent />
    </Suspense>
  );
}
