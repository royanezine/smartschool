
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { getPaketById } from "@/services/paket.service";
import {
  registerTenant,
  isTenantApiError,
  isOtpEmailFailureAfterSave,
} from "@/services/tenant.service";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  required = false,
  autoComplete,
  hint,
  suffix,
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 ${
            Icon ? "pl-10" : "pl-4"
          } ${suffix ? "pr-32" : "pr-4"} text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10`}
        />

        {suffix && (
          <div className="absolute right-0 top-0 flex h-full items-center rounded-r-xl border-l border-slate-200 bg-slate-100/80 px-3 text-xs text-slate-500">
            {suffix}
          </div>
        )}
      </div>

      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function ProgressStep({ number, title, description, active, completed }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            completed
              ? "bg-blue-600 text-white"
              : active
              ? "border-2 border-blue-600 bg-blue-50 text-blue-600"
              : "border border-slate-200 bg-white text-slate-400"
          }`}
        >
          {completed ? <Check size={15} /> : number}
        </div>

        <div
          className={`mt-1 h-8 w-px ${
            completed ? "bg-blue-600" : "bg-slate-200"
          }`}
        />
      </div>

      <div className="pb-4">
        <p
          className={`text-sm font-semibold ${
            active || completed ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default function SchoolOnboardingPage() {
  const [paket, setPaket] = useState(null);
  const [loadingPaket, setLoadingPaket] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submittingRef = useRef(false);

  const [form, setForm] = useState({
    nama: "",
    email: "",
    namaSekolah: "",
    jenjang: "",
    subdomain: "",
    alamatSekolah: "",
    teleponSekolah: "",
    kataSandi: "",
    konfirmasiKataSandi: "",
    logo: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadPaket() {
      try {
        const params = new URLSearchParams(window.location.search);
        let paketId = params.get("paketId");
        let storedPaket = null;

        if (!paketId) {
          try {
            const raw = sessionStorage.getItem("selected_paket");
            if (raw) {
              storedPaket = JSON.parse(raw);
              paketId =
                storedPaket?.id ||
                storedPaket?.paketId ||
                storedPaket?._id;
            }
          } catch {
            storedPaket = null;
          }
        }

        if (!paketId) {
          paketId = sessionStorage.getItem("selected_paket_id");
        }

        if (paketId) {
          const response = await getPaketById(paketId);

          const result =
            response?.data?.data ??
            response?.data ??
            response?.paket ??
            response;

          const normalized =
            result?.success && result?.data ? result.data : result;

          if (
            isMounted &&
            normalized &&
            normalized.success !== false
          ) {
            setPaket(normalized);
            sessionStorage.setItem(
              "selected_paket",
              JSON.stringify(normalized)
            );
            sessionStorage.setItem("selected_paket_id", String(paketId));
            return;
          }
        }

        if (isMounted && storedPaket) {
          setPaket(storedPaket);
        }
      } catch (err) {
        console.error("Gagal mengambil detail paket:", err);
      } finally {
        if (isMounted) setLoadingPaket(false);
      }
    }

    loadPaket();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "subdomain") {
      const sanitized = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

      setForm((prev) => ({ ...prev, [name]: sanitized }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const nama = form.nama.trim();
    const email = form.email.trim();
    const namaSekolah = form.namaSekolah.trim();
    const subdomain = form.subdomain.trim();
    const alamatSekolah = form.alamatSekolah.trim();
    const teleponSekolah = form.teleponSekolah.replace(/[^\d+]/g, "");
    const logo = form.logo.trim();

    if (
      !nama ||
      !email ||
      !namaSekolah ||
      !form.jenjang ||
      !subdomain ||
      !alamatSekolah ||
      !teleponSekolah ||
      !form.kataSandi ||
      !form.konfirmasiKataSandi
    ) {
      setError("Mohon lengkapi semua data yang wajib diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain)) {
      setError(
        "Subdomain hanya boleh menggunakan huruf kecil, angka, dan tanda hubung."
      );
      return;
    }

    if (form.kataSandi.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (form.kataSandi !== form.konfirmasiKataSandi) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }

    if (!paket) {
      setError("Paket belum ditemukan. Silakan pilih paket terlebih dahulu.");
      return;
    }

    const paketId = paket.id || paket.paketId || paket._id;

    if (!paketId) {
      setError("ID paket tidak ditemukan. Silakan pilih ulang paket.");
      return;
    }

    if (logo) {
      try {
        const parsedUrl = new URL(logo);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("URL tidak valid");
        }
      } catch {
        setError("URL logo harus berupa alamat URL yang valid.");
        return;
      }
    }

    if (submittingRef.current) return;
    submittingRef.current = true;

    setLoading(true);

    try {
      const payload = {
        paketId,
        nama,
        namaSekolah,
        jenjang: form.jenjang,
        subdomain,
        email,
        teleponSekolah,
        alamatSekolah,
        kataSandi: form.kataSandi,
        ...(logo ? { logo } : {}),
      };

      const response = await registerTenant(payload);

      if (response?.success !== true) {
        throw new Error(
          response?.message ||
            "Server belum mengonfirmasi bahwa pendaftaran dapat dilanjutkan. Silakan coba lagi."
        );
      }

      sessionStorage.setItem("onboarding_email", email.trim().toLowerCase());
      sessionStorage.setItem("onboarding_paket_id", String(paketId));

      window.location.assign("/onboarding/verify");
    } catch (err) {
      console.warn(
        "[ONBOARDING] Registrasi sekolah gagal:",
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );

      if (isOtpEmailFailureAfterSave(err)) {
        setError(
          "Data pendaftaran sekolah Anda sudah tersimpan di server, tetapi email OTP gagal dikirim karena gangguan layanan email (SMTP) di sisi server — ini bukan kesalahan data yang Anda isi. " +
            "Perbaikan pengiriman email hanya dapat dilakukan di sisi server; mengulang dari halaman ini tidak akan mengubah penyebabnya selama layanan email masih bermasalah. " +
            "Silakan coba lagi beberapa saat kemudian dengan menekan \"Lanjutkan Pendaftaran\", lalu masukkan kode OTP yang dikirim ke email Anda. " +
            "Jika email tetap tidak diterima, hubungi dukungan SmartSchool."
        );
        return;
      }

      if (isTenantApiError(err) && err.status === 0) {
        setError(
          "Tidak dapat terhubung ke server SmartSchool. Periksa koneksi internet Anda, lalu coba lagi."
        );
        return;
      }

      setError(
        err?.message ||
          "Terjadi kesalahan saat mendaftarkan sekolah. Silakan coba kembali."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  const namaPaket = paket?.nama || paket?.namaPaket || "Paket SmartSchool";
  const hargaPaket = Number(paket?.harga ?? 0);
  const fiturPaket = Array.isArray(paket?.fitur) ? paket.fitur : [];
  const durasi = paket?.durasi ?? paket?.durasiHari;

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9">
              <Image
                src="/logo/logoSS.png"
                alt="SmartSchool Logo"
                fill
                priority
                sizes="36px"
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Smart<span className="text-blue-600">School</span>
            </span>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Kembali</span>
          </a>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[#0f172a]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-32 left-[-80px] h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-blue-200">
            <Sparkles size={13} />
            Onboarding Sekolah
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Daftarkan sekolah Anda
            <br />
            bersama <span className="text-blue-400">SmartSchool</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Lengkapi informasi sekolah untuk mulai menggunakan platform
            manajemen sekolah terintegrasi.
          </p>
        </div>
      </section>

      <section className="pb-16 pt-8 sm:pb-20 sm:pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)_340px] lg:gap-8">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Langkah Pendaftaran
                </p>

                <ProgressStep
                  number="1"
                  title="Data Sekolah"
                  description="Informasi pendaftaran"
                  active
                />
                <ProgressStep
                  number="2"
                  title="Verifikasi"
                  description="Konfirmasi email"
                />
                <ProgressStep
                  number="3"
                  title="Pembayaran"
                  description="Aktivasi layanan"
                />

                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck
                      size={15}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                    <p className="text-[11px] leading-5 text-slate-600">
                      Data digunakan untuk proses pendaftaran SmartSchool.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-transparent px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Building2 size={19} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold sm:text-lg">
                      Informasi Pendaftaran
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                      Isi data dengan benar agar proses verifikasi berjalan
                      lancar.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 p-5 sm:p-7">
                <div>
                  <SectionHeading
                    icon={User}
                    title="Data Penanggung Jawab"
                    description="Informasi orang yang mengelola pendaftaran."
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="Nama Lengkap"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      placeholder="Nama penanggung jawab"
                      icon={User}
                      required
                      autoComplete="name"
                    />

                    <InputField
                      label="Email Aktif"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="nama@email.com"
                      icon={Mail}
                      type="email"
                      required
                      autoComplete="email"
                      hint="Gunakan email yang bisa Anda akses untuk OTP."
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionHeading
                    icon={Building2}
                    title="Informasi Sekolah"
                    description="Identitas dan alamat sekolah yang didaftarkan."
                  />

                  <div className="space-y-5">
                    <InputField
                      label="Nama Sekolah atau Yayasan"
                      name="namaSekolah"
                      value={form.namaSekolah}
                      onChange={handleChange}
                      placeholder="Contoh: SMA Nusantara"
                      icon={Building2}
                      required
                    />

                    <div className="space-y-1.5">
                      <label
                        htmlFor="jenjang"
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Jenjang Pendidikan
                        <span className="ml-1 text-blue-600">*</span>
                      </label>

                      <div className="relative">
                        <GraduationCap
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          id="jenjang"
                          name="jenjang"
                          value={form.jenjang}
                          onChange={handleChange}
                          required
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        >
                          <option value="">Pilih jenjang pendidikan</option>
                          <option value="SD">SD / MI</option>
                          <option value="SMP">SMP / MTs</option>
                          <option value="SMA">SMA / MA</option>
                          <option value="SMK">SMK</option>
                          <option value="Yayasan">Yayasan</option>
                        </select>
                      </div>
                    </div>

                    <InputField
                      label="Alamat Lengkap Sekolah"
                      name="alamatSekolah"
                      value={form.alamatSekolah}
                      onChange={handleChange}
                      placeholder="Jalan, kecamatan, kota, dan provinsi"
                      icon={MapPin}
                      required
                    />

                    <InputField
                      label="Nomor Telepon Sekolah"
                      name="teleponSekolah"
                      value={form.teleponSekolah}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      icon={Phone}
                      type="tel"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionHeading
                    icon={Globe}
                    title="Alamat Website Sekolah"
                    description="Tentukan alamat unik untuk website sekolah."
                  />

                  <InputField
                    label="Subdomain"
                    name="subdomain"
                    value={form.subdomain}
                    onChange={handleChange}
                    placeholder="nama-sekolah"
                    icon={Globe}
                    required
                    suffix=".smartschool.id"
                    hint="Gunakan huruf kecil, angka, dan tanda hubung."
                  />

                  {form.subdomain && (
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                      <p className="text-xs font-semibold text-slate-700">
                        Pratinjau alamat website
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-blue-600">
                        https://{form.subdomain}.smartschool.id
                      </p>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionHeading
                    icon={Globe}
                    title="Logo Sekolah"
                    description="Opsional. Masukkan URL logo yang dapat diakses publik."
                  />

                  <InputField
                    label="URL Logo"
                    name="logo"
                    value={form.logo}
                    onChange={handleChange}
                    placeholder="https://contoh.com/logo.png"
                    icon={Globe}
                    type="url"
                    hint="BE menerima URL logo, bukan unggahan file langsung."
                  />
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <SectionHeading
                    icon={Lock}
                    title="Keamanan Akun"
                    description="Buat kata sandi untuk akun pengelola sekolah."
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="kataSandi"
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Kata Sandi *
                      </label>

                      <div className="relative">
                        <Lock
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="kataSandi"
                          name="kataSandi"
                          type={showPassword ? "text" : "password"}
                          value={form.kataSandi}
                          onChange={handleChange}
                          placeholder="Minimal 8 karakter"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>

                      {form.kataSandi && (
                        <p className="text-xs text-slate-400">
                          {form.kataSandi.length < 8
                            ? "Kata sandi terlalu pendek"
                            : form.kataSandi.length < 12
                            ? "Kata sandi cukup kuat"
                            : "Kata sandi sangat kuat"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="konfirmasiKataSandi"
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Konfirmasi Kata Sandi *
                      </label>

                      <div className="relative">
                        <Lock
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="konfirmasiKataSandi"
                          name="konfirmasiKataSandi"
                          type={showConfirmPassword ? "text" : "password"}
                          value={form.konfirmasiKataSandi}
                          onChange={handleChange}
                          placeholder="Ulangi kata sandi"
                          required
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Sembunyikan konfirmasi kata sandi"
                              : "Tampilkan konfirmasi kata sandi"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>

                      {form.konfirmasiKataSandi && (
                        <div className="flex items-center gap-1.5">
                          {form.kataSandi === form.konfirmasiKataSandi ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-500" />
                              <p className="text-xs text-emerald-600">
                                Kata sandi sudah cocok
                              </p>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={13} className="text-rose-500" />
                              <p className="text-xs text-rose-600">
                                Kata sandi belum cocok
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                  >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p className="leading-6">{error}</p>
                  </div>
                )}

                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex items-start gap-2 text-xs leading-5 text-slate-400">
                    <ShieldCheck size={15} className="mt-0.5 shrink-0 text-blue-500" />
                    <p>
                      Dengan melanjutkan, kamu menyatakan bahwa data yang
                      diberikan benar dan dapat digunakan untuk proses
                      pendaftaran SmartSchool.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || loadingPaket}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0D47C9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading || loadingPaket ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {loadingPaket
                          ? "Memuat paket..."
                          : "Memproses pendaftaran..."}
                      </>
                    ) : (
                      <>
                        Lanjutkan Pendaftaran
                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Pastikan data yang dimasukkan sudah benar.
                  </p>
                </div>
              </form>
            </section>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

                <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/50 to-transparent px-6 py-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <GraduationCap size={22} />
                    </div>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                      Paket Pilihan
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-500">
                    Paket SmartSchool Anda
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {loadingPaket ? "Memuat paket..." : namaPaket}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {paket?.deskripsi ||
                      "Solusi terintegrasi untuk membantu pengelolaan sekolah secara digital."}
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Biaya Berlangganan
                  </p>

                  {loadingPaket ? (
                    <div className="mt-3 h-9 w-40 animate-pulse rounded-lg bg-slate-100" />
                  ) : (
                    <p className="mt-2 break-words text-3xl font-extrabold tracking-tight text-blue-700">
                      {formatRupiah(hargaPaket)}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={15} />
                    <span>
                      Durasi: {durasi ?? "-"}
                      {typeof durasi === "number" ? " hari" : ""}
                    </span>
                  </div>

                  {hargaPaket <= 0 && !loadingPaket && (
                    <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-700">
                      Paket ini akan diproses sebagai trial sesuai aturan Backend.
                    </p>
                  )}

                  <div className="my-6 h-px bg-slate-100" />

                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <CheckCircle2 size={16} className="text-blue-600" />
                    Fitur yang Tersedia
                  </h3>

                  {fiturPaket.length > 0 ? (
                    <ul className="mt-4 space-y-3">
                      {fiturPaket.map((fitur, index) => {
                        const namaFitur =
                          typeof fitur === "string"
                            ? fitur
                            : fitur?.nama ||
                              fitur?.namaFitur ||
                              fitur?.fitur ||
                              fitur?.judul ||
                              "Fitur SmartSchool";

                        return (
                          <li
                            key={`${namaFitur}-${index}`}
                            className="flex items-start gap-2.5 text-sm leading-5 text-slate-600"
                          >
                            <CheckCircle2
                              size={16}
                              className="mt-0.5 shrink-0 text-blue-600"
                            />
                            <span>{namaFitur}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {[
                        "Pengelolaan data sekolah",
                        "Manajemen akademik",
                        "Akses sistem terintegrasi",
                      ].map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-slate-600"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-blue-600"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Proses pendaftaran aman
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Lengkapi data dan ikuti verifikasi email sebelum
                      melanjutkan ke proses berikutnya.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} SmartSchool. All rights reserved.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
