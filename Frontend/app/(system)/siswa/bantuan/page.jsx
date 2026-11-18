"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getPengaturanGlobalPublik } from "@/services/pengaturan.service";

import {
  AlertCircle,
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  ShieldCheck,
  Clock,
  ExternalLink,
  RefreshCw,
  Loader2,
  LifeBuoy,
  CircleHelp,
  SearchX,
} from "lucide-react";

const FAQS = [
  {
    id: 1,
    q: "Bagaimana cara mengubah kata sandi akun saya?",
    a: "Buka halaman Pengaturan, lalu pilih bagian Keamanan Akun. Masukkan kata sandi saat ini, kata sandi baru (minimal 8 karakter), dan konfirmasi kata sandi baru. Setelah itu klik tombol Ubah Kata Sandi.",
  },
  {
    id: 2,
    q: "Saya lupa kata sandi, apa yang harus dilakukan?",
    a: "Gunakan fitur Lupa Kata Sandi di halaman login. Kamu akan menerima tautan reset melalui email terdaftar. Jika masih bermasalah, hubungi guru atau admin sekolah.",
  },
  {
    id: 3,
    q: "Bagaimana cara mengumpulkan tugas?",
    a: "Buka menu Tugas, pilih tugas yang ingin dikumpulkan, lalu unggah file atau isi jawaban sesuai instruksi guru. Pastikan kamu mengumpulkan sebelum batas waktu yang ditentukan.",
  },
  {
    id: 4,
    q: "Mengapa materi pembelajaran tidak bisa dibuka?",
    a: "Pastikan koneksi internet stabil dan kamu sudah login dengan akun yang benar. Jika materi masih tidak bisa dibuka, coba muat ulang halaman atau hubungi guru pengampu.",
  },
  {
    id: 5,
    q: "Bagaimana cara melihat nilai dan rapor saya?",
    a: "Buka menu Nilai atau Rapor pada dasbor. Di sana kamu bisa melihat nilai per mata pelajaran, nilai tugas, dan rekap hasil ujian.",
  },
  {
    id: 6,
    q: "Apakah data akun saya aman?",
    a: "Ya. Kami menjaga keamanan data dengan enkripsi dan akses terbatas. Jangan pernah membagikan kata sandi kepada siapa pun, termasuk pihak yang mengaku sebagai admin.",
  },
];

function normalizePhone(phone) {
  if (!phone) return "";

  const cleaned = String(phone).replace(/[^\d+]/g, "");

  if (cleaned.startsWith("0")) {
    return `62${cleaned.substring(1)}`;
  }

  if (cleaned.startsWith("+")) {
    return cleaned.substring(1);
  }

  return cleaned;
}

export default function BantuanSiswaPage() {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const [globalInfo, setGlobalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGlobalInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getPengaturanGlobalPublik();

      if (!res?.success || !res?.data) {
        throw new Error(
          res?.message || "Gagal mengambil informasi pengaturan platform."
        );
      }

      setGlobalInfo(res.data);
    } catch (err) {
      console.error("GET GLOBAL SETTINGS ERROR:", err);

      setError(
        err?.message ||
          "Tidak dapat mengambil informasi bantuan dari server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalInfo();
  }, [fetchGlobalInfo]);

  const identitas = globalInfo?.identitas || {};
  const pemeliharaan = globalInfo?.pemeliharaan || {};

  const namaAplikasi = identitas.namaAplikasi || "SmartSchool";
  const emailDukungan = identitas.emailDukungan || "";
  const teleponDukungan = identitas.teleponDukungan || "";

  const phoneNumber = normalizePhone(teleponDukungan);

  const filteredFaqs = FAQS.filter((item) => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return true;

    return (
      item.q.toLowerCase().includes(keyword) ||
      item.a.toLowerCase().includes(keyword)
    );
  });

  const toggleFaq = (id) => {
    setOpenFaq((previous) => (previous === id ? null : id));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b theme-border-soft bg-[var(--color-surface,transparent)]/80 backdrop-blur">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="flex items-center gap-3">
              <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                <LifeBuoy size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                  Pusat Bantuan
                </p>

                <h1 className="mt-1 text-xl font-bold tracking-tight theme-text sm:text-2xl">
                  Bantuan
                </h1>

                <p className="mt-1 text-xs theme-text-muted sm:text-sm">
                  Temukan jawaban atas pertanyaanmu atau hubungi tim dukungan.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="w-full space-y-6">
              {pemeliharaan.aktif && (
                <div className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold theme-text">
                      Pemberitahuan Sistem
                    </p>

                    <p className="mt-1 text-xs leading-5 theme-text-secondary">
                      {pemeliharaan.pesan ||
                        "Sistem sedang dalam pemeliharaan terjadwal."}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <div>
                      <p className="text-sm font-semibold theme-text">
                        Gagal memuat informasi bantuan
                      </p>

                      <p className="mt-1 text-xs leading-5 theme-text-muted">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fetchGlobalInfo}
                    disabled={loading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border theme-border-soft px-4 py-2.5 text-xs font-semibold theme-text transition hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={loading ? "animate-spin" : ""}
                    />
                    Coba Lagi
                  </button>
                </div>
              )}

              <section>
                <div className="mb-3">
                  <h2 className="text-sm font-bold theme-text">
                    Ada yang bisa kami bantu?
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Cari informasi berdasarkan pertanyaan atau kendala yang kamu alami.
                  </p>
                </div>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-muted"
                  />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setOpenFaq(null);
                    }}
                    placeholder="Cari bantuan atau pertanyaan..."
                    className="theme-input h-12 w-full rounded-xl border px-11 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setOpenFaq(null);
                      }}
                      aria-label="Hapus pencarian"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                <HelpCard
                  icon={BookOpen}
                  title="Panduan Pengguna"
                  desc="Pelajari langkah-langkah menggunakan fitur pembelajaran SmartSchool."
                />

                <HelpCard
                  icon={Video}
                  title="Tutorial Video"
                  desc="Panduan visual untuk membantu memahami penggunaan aplikasi."
                />

                <HelpCard
                  icon={FileText}
                  title="Kebijakan & Privasi"
                  desc="Informasi mengenai aturan penggunaan dan perlindungan data."
                />
              </section>

              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="flex items-center gap-3 border-b theme-border-soft px-5 py-4 sm:px-6">
                  <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <HelpCircle size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold theme-text">
                      Pertanyaan yang Sering Diajukan
                    </h2>

                    <p className="mt-1 text-xs theme-text-muted">
                      Temukan jawaban dari pertanyaan umum seputar SmartSchool.
                    </p>
                  </div>

                  <span className="hidden rounded-lg bg-[var(--color-hover)] px-3 py-1.5 text-xs font-semibold theme-text-secondary sm:block">
                    {filteredFaqs.length} Pertanyaan
                  </span>
                </div>

                <div className="divide-y theme-border-soft">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((item) => (
                      <FaqItem
                        key={item.id}
                        question={item.q}
                        answer={item.a}
                        isOpen={openFaq === item.id}
                        onToggle={() => toggleFaq(item.id)}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                      <div className="theme-info flex h-14 w-14 items-center justify-center rounded-2xl">
                        <SearchX size={24} />
                      </div>

                      <h3 className="mt-4 text-sm font-bold theme-text">
                        Tidak ditemukan
                      </h3>

                      <p className="mt-2 max-w-sm text-xs leading-5 theme-text-muted">
                        Tidak ada pertanyaan yang cocok dengan pencarian &quot;
                        {query}&quot;. Coba gunakan kata kunci lainnya.
                      </p>

                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="mt-4 rounded-xl px-4 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-hover)]"
                      >
                        Hapus Pencarian
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="flex items-center gap-3 border-b theme-border-soft px-5 py-4 sm:px-6">
                  <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <MessageCircle size={19} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-bold theme-text">
                      Masih Butuh Bantuan?
                    </h2>

                    <p className="mt-1 text-xs leading-5 theme-text-muted">
                      Hubungi tim dukungan melalui informasi kontak resmi platform.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                  {emailDukungan ? (
                    <ContactCard
                      icon={Mail}
                      title="Email Dukungan"
                      value={emailDukungan}
                      href={`mailto:${emailDukungan}`}
                    />
                  ) : (
                    <ContactUnavailable
                      icon={Mail}
                      title="Email Dukungan"
                      loading={loading}
                    />
                  )}

                  {teleponDukungan ? (
                    <ContactCard
                      icon={Phone}
                      title="Telepon / WhatsApp Dukungan"
                      value={teleponDukungan}
                      href={
                        phoneNumber
                          ? `https://wa.me/${phoneNumber}`
                          : `tel:${teleponDukungan}`
                      }
                    />
                  ) : (
                    <ContactUnavailable
                      icon={Phone}
                      title="Telepon / WhatsApp Dukungan"
                      loading={loading}
                    />
                  )}
                </div>
              </section>

              <InfoCard
                icon={Clock}
                title="Jam Layanan Dukungan"
                description="Senin – Jumat, pukul 07.00 – 16.00 WIB. Di luar jam tersebut, pesanmu akan dibalas pada hari kerja berikutnya."
              />

              <InfoCard
                icon={ShieldCheck}
                title="Tips Keamanan Akun"
                description="Jangan bagikan kata sandi kepada siapa pun. Tim dukungan tidak akan pernah meminta kata sandi atau kode OTP milikmu."
              />

              <div className="border-t theme-border-soft pt-5">
                <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <div>
                    <p className="text-xs font-semibold theme-text">
                      {namaAplikasi}
                    </p>

                    <p className="mt-1 text-[11px] theme-text-muted">
                      Pusat bantuan dan dukungan pengguna.
                    </p>
                  </div>

                  <p className="text-[11px] theme-text-muted">
                    Butuh bantuan? Hubungi tim dukungan kami.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function HelpCard({ icon: Icon, title, desc }) {
  return (
    <div className="theme-card flex items-start gap-4 rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold theme-text">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 theme-text-muted">
          {desc}
        </p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-hover)] sm:px-6"
      >
        <span
          className={`text-sm font-semibold transition ${
            isOpen
              ? "text-[var(--color-primary)]"
              : "theme-text-secondary"
          }`}
        >
          {question}
        </span>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
            isOpen
              ? "bg-[var(--color-hover)] text-[var(--color-primary)]"
              : "theme-text-muted"
          }`}
        >
          {isOpen ? (
            <ChevronUp size={17} />
          ) : (
            <ChevronDown size={17} />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 sm:px-6">
          <div className="rounded-xl bg-[var(--color-hover)] px-4 py-3">
            <p className="text-xs leading-6 theme-text-muted">
              {answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactCard({ icon: Icon, title, value, href }) {
  return (
    <a
      href={href}
      target={href.startsWith("https://") ? "_blank" : undefined}
      rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
      className="theme-card group flex min-w-0 items-center gap-3 rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold theme-text">
          {title}
        </p>

        <p className="mt-1 break-all text-xs theme-text-muted">
          {value}
        </p>
      </div>

      <ExternalLink
        size={15}
        className="shrink-0 theme-text-muted transition group-hover:text-[var(--color-primary)]"
      />
    </a>
  );
}

function ContactUnavailable({ icon: Icon, title, loading }) {
  return (
    <div className="theme-card flex min-w-0 items-center gap-3 rounded-xl border p-4">
      <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold theme-text">
          {title}
        </p>

        <p className="mt-1 text-xs theme-text-muted">
          {loading
            ? "Memuat informasi..."
            : "Belum dikonfigurasi oleh admin platform."}
        </p>
      </div>

      {loading && (
        <Loader2
          size={16}
          className="shrink-0 animate-spin theme-text-muted"
        />
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="theme-info flex items-start gap-3 rounded-2xl p-4 sm:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]">
        <Icon
          size={19}
          className="text-[var(--color-info)]"
        />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold theme-text">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-6 theme-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}