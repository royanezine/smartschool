"use client";

import { useState } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  ShieldCheck,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function BantuanSiswaPage() {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Bagaimana cara mengubah kata sandi akun saya?",
      a: "Buka halaman Pengaturan, lalu pilih bagian Keamanan Akun. Masukkan kata sandi saat ini, kata sandi baru (minimal 8 karakter), dan konfirmasi kata sandi baru. Setelah itu klik tombol Ubah Kata Sandi.",
    },
    {
      q: "Saya lupa kata sandi, apa yang harus dilakukan?",
      a: "Gunakan fitur 'Lupa Kata Sandi' di halaman login. Kamu akan menerima tautan reset melalui email terdaftar. Jika masih bermasalah, hubungi guru atau admin sekolah.",
    },
    {
      q: "Bagaimana cara mengumpulkan tugas?",
      a: "Buka menu Tugas, pilih tugas yang ingin dikumpulkan, lalu unggah file atau isi jawaban sesuai instruksi guru. Pastikan kamu mengumpulkan sebelum batas waktu yang ditentukan.",
    },
    {
      q: "Mengapa materi pembelajaran tidak bisa dibuka?",
      a: "Pastikan koneksi internet stabil dan kamu sudah login dengan akun yang benar. Jika materi masih tidak bisa dibuka, coba muat ulang halaman atau hubungi guru pengampu.",
    },
    {
      q: "Bagaimana cara melihat nilai dan rapor saya?",
      a: "Buka menu Nilai atau Rapor pada dasbor. Di sana kamu bisa melihat nilai per mata pelajaran, nilai tugas, dan rekap hasil ujian.",
    },
    {
      q: "Apakah data akun saya aman?",
      a: "Ya. Kami menjaga keamanan data kamu dengan enkripsi dan akses terbatas. Jangan pernah membagikan kata sandi kepada siapa pun, termasuk pihak yang mengaku sebagai admin.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="theme-page min-h-full flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1000px] p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Pusat Bantuan
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text sm:text-[28px]">
            Bantuan
          </h1>

          <p className="mt-1 text-sm theme-text-muted">
            Temukan jawaban atas pertanyaanmu atau hubungi tim dukungan.
          </p>
        </header>

        <div className="relative mb-6">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari bantuan atau pertanyaan..."
            className="theme-input h-11 w-full rounded-xl pl-10 pr-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HelpCard
              icon={BookOpen}
              title="Panduan Pengguna"
              desc="Langkah demi langkah menggunakan fitur pembelajaran."
            />
            <HelpCard
              icon={Video}
              title="Tutorial Video"
              desc="Tonton video singkat cara memakai aplikasi."
            />
            <HelpCard
              icon={FileText}
              title="Kebijakan & Privasi"
              desc="Informasi tentang aturan dan perlindungan data."
            />
          </section>

          <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="flex items-center gap-3 border-b theme-border-soft px-5 py-4 sm:px-6">
              <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <HelpCircle size={17} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold theme-text">
                  Pertanyaan yang Sering Diajukan
                </h2>
                <p className="mt-0.5 text-xs leading-5 theme-text-muted">
                  Klik pertanyaan untuk melihat jawabannya.
                </p>
              </div>
            </div>

            <div className="divide-y theme-border-soft">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((item, index) => (
                  <FaqItem
                    key={index}
                    question={item.q}
                    answer={item.a}
                    isOpen={openFaq === index}
                    onToggle={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                  />
                ))
              ) : (
                <div className="px-5 py-8 text-center sm:px-6">
                  <p className="text-sm theme-text-muted">
                    Tidak ada hasil untuk &ldquo;{query}&rdquo;.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="flex items-center gap-3 border-b theme-border-soft px-5 py-4 sm:px-6">
              <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <MessageCircle size={17} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold theme-text">
                  Masih Butuh Bantuan?
                </h2>
                <p className="mt-0.5 text-xs leading-5 theme-text-muted">
                  Hubungi tim dukungan kami melalui salah satu kanal berikut.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <ContactCard
                icon={Mail}
                title="Email Dukungan"
                value="support@sekolah.sch.id"
                href="mailto:support@sekolah.sch.id"
              />
              <ContactCard
                icon={MessageCircle}
                title="Chat Guru / Admin"
                value="Buka menu pesan di dasbor"
                href="#"
              />
            </div>
          </section>

          <div className="theme-info flex items-start gap-3 rounded-2xl p-4">
            <Clock
              size={19}
              className="mt-0.5 shrink-0 text-[var(--color-info)]"
            />
            <div>
              <p className="text-sm font-semibold theme-text">
                Jam layanan dukungan
              </p>
              <p className="mt-1 text-xs leading-5 theme-text-muted">
                Senin – Jumat, pukul 07.00 – 16.00 WIB. Di luar jam tersebut,
                pesanmu akan dibalas pada hari kerja berikutnya.
              </p>
            </div>
          </div>

          <div className="theme-info flex items-start gap-3 rounded-2xl p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[var(--color-info)]"
            />
            <div>
              <p className="text-sm font-semibold theme-text">
                Tips keamanan akun
              </p>
              <p className="mt-1 text-xs leading-5 theme-text-muted">
                Jangan bagikan kata sandi kepada siapa pun. Tim dukungan tidak
                akan pernah meminta kata sandi atau kode OTP milikmu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


function HelpCard({ icon: Icon, title, desc }) {
  return (
    <button
      type="button"
      className="theme-card group flex items-start gap-3 rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold theme-text">{title}</p>
        <p className="mt-1 text-xs leading-5 theme-text-muted">{desc}</p>
      </div>
    </button>
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
        <span className="text-sm font-semibold theme-text-secondary">
          {question}
        </span>

        <span className="shrink-0 theme-text-muted">
          {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </span>
      </button>

      {isOpen && (
        <div className="px-5 pb-4 sm:px-6">
          <p className="text-xs leading-6 theme-text-muted">{answer}</p>
        </div>
      )}
    </div>
  );
}

function ContactCard({ icon: Icon, title, value, href }) {
  return (
    <a
      href={href}
      className="theme-card group flex items-center gap-3 rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold theme-text">{title}</p>
        <p className="mt-0.5 truncate text-xs theme-text-muted">{value}</p>
      </div>

      <ExternalLink size={15} className="shrink-0 theme-text-muted" />
    </a>
  );
}