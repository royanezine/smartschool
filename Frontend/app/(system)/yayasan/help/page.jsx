"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  HelpCircle,
  BookOpen,
  Building2,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  FileText,
  GraduationCap,
  ClipboardList,
  Lightbulb,
  CircleHelp,
  LifeBuoy,
  X,
} from "lucide-react";

const CATEGORIES = [
  { id: "semua", label: "Semua bantuan", icon: BookOpen },
  { id: "akun", label: "Akun & Profil", icon: Users },
  { id: "sekolah", label: "Sekolah Binaan", icon: Building2 },
  { id: "monitoring", label: "Monitoring", icon: BarChart3 },
  { id: "laporan", label: "Laporan", icon: FileText },
  { id: "pengaturan", label: "Pengaturan", icon: Settings },
];

const FAQS = [
  {
    id: 1,
    category: "akun",
    question: "Bagaimana cara mengubah profil yayasan?",
    answer:
      "Buka menu Profil Yayasan melalui sidebar. Tekan tombol Edit Profil, lalu ubah informasi yang ingin diperbarui seperti nama yayasan, NPYP, alamat, nomor telepon, atau email yayasan. Setelah selesai, tekan Simpan Perubahan. Pastikan perubahan berhasil disimpan sebelum meninggalkan halaman.",
    tags: ["profil", "edit", "yayasan", "npyp", "telepon", "email"],
  },
  {
    id: 2,
    category: "akun",
    question: "Mengapa email akun admin tidak dapat diubah?",
    answer:
      "Email akun merupakan identitas login yang dikelola oleh sistem. Pada halaman Profil Yayasan, email akun ditampilkan sebagai informasi dan tidak dapat diubah melalui formulir profil tersebut. Jika perlu mengganti email login, hubungi administrator yang memiliki kewenangan untuk mengelola akun.",
    tags: ["email", "login", "akun", "admin"],
  },
  {
    id: 3,
    category: "sekolah",
    question: "Bagaimana cara melihat sekolah binaan yayasan?",
    answer:
      "Buka menu Sekolah pada sidebar yayasan. Halaman tersebut digunakan untuk melihat daftar sekolah yang terhubung dengan yayasan. Pilih sekolah yang ingin diperiksa untuk melihat informasi yang tersedia sesuai dengan hak akses akun Anda.",
    tags: ["sekolah", "binaan", "daftar", "cabang"],
  },
  {
    id: 4,
    category: "sekolah",
    question: "Apa yang harus dilakukan jika sekolah binaan tidak muncul?",
    answer:
      "Pastikan Anda masuk menggunakan akun yayasan yang benar. Periksa kembali daftar sekolah dan gunakan fitur pencarian atau filter jika tersedia. Jika sekolah tetap tidak muncul, mintalah administrator untuk memeriksa hubungan sekolah dengan yayasan serta status akses akun Anda.",
    tags: ["sekolah", "tidak muncul", "akses", "yayasan"],
  },
  {
    id: 5,
    category: "monitoring",
    question: "Bagaimana cara memantau aktivitas pengguna?",
    answer:
      "Gunakan menu Monitoring yang tersedia pada sidebar. Pilih informasi monitoring yang ingin dilihat, kemudian periksa data yang ditampilkan. Data yang dapat diakses mengikuti cakupan yayasan, ketersediaan data, dan hak akses akun Anda.",
    tags: ["monitoring", "pengguna", "aktivitas", "user"],
  },
  {
    id: 6,
    category: "monitoring",
    question: "Bagaimana cara melihat monitoring akademik?",
    answer:
      "Buka menu Monitoring Akademik pada sidebar yayasan. Pilih informasi akademik yang tersedia dan gunakan filter yang disediakan apabila ada. Pastikan sekolah yang ingin diperiksa sudah terhubung dengan yayasan dan memiliki data akademik pada sistem.",
    tags: ["akademik", "nilai", "monitoring", "sekolah"],
  },
  {
    id: 7,
    category: "laporan",
    question: "Bagaimana cara melihat laporan yayasan?",
    answer:
      "Buka menu Laporan pada sidebar. Pilih laporan yang dibutuhkan dan tentukan filter periode atau sekolah apabila tersedia. Periksa kembali cakupan data sebelum menggunakan hasil laporan untuk keperluan administrasi yayasan.",
    tags: ["laporan", "rekap", "data", "periode"],
  },
  {
    id: 8,
    category: "pengaturan",
    question: "Bagaimana cara mengubah pengaturan yayasan?",
    answer:
      "Buka menu Pengaturan melalui sidebar. Periksa opsi yang tersedia, kemudian lakukan perubahan sesuai kebutuhan. Beberapa pengaturan mungkin hanya dapat diubah oleh akun dengan kewenangan tertentu. Jika opsi tidak tersedia, hubungi administrator sistem.",
    tags: ["pengaturan", "konfigurasi", "sistem"],
  },
  {
    id: 9,
    category: "akun",
    question: "Mengapa saya tidak dapat membuka menu tertentu?",
    answer:
      "Menu yang tersedia bergantung pada peran akun dan hak akses yang diberikan. Pastikan Anda masuk menggunakan akun yang sesuai. Jika menu seharusnya tersedia tetapi tidak muncul, muat ulang halaman dan hubungi administrator untuk memeriksa hak akses akun Anda.",
    tags: ["akses", "menu", "role", "izin", "permission"],
  },
  {
    id: 10,
    category: "akun",
    question: "Apa yang harus dilakukan jika sesi login berakhir?",
    answer:
      "Masuk kembali menggunakan akun yayasan Anda. Jika masalah berulang, periksa koneksi internet dan pastikan Anda menggunakan alamat aplikasi yang benar. Jangan membagikan kata sandi atau kode autentikasi kepada orang lain.",
    tags: ["login", "sesi", "logout", "password"],
  },
  {
    id: 11,
    category: "sekolah",
    question: "Mengapa data sekolah belum diperbarui?",
    answer:
      "Pastikan perubahan data sudah berhasil disimpan. Jika informasi berasal dari sekolah binaan, pembaruan dapat bergantung pada data yang tersedia dari sekolah tersebut. Muat ulang halaman untuk memeriksa data terbaru. Jika masih tidak sesuai, mintalah administrator memeriksa sumber data dan sinkronisasi sistem.",
    tags: ["data", "sekolah", "update", "sinkronisasi"],
  },
  {
    id: 12,
    category: "laporan",
    question: "Mengapa laporan tidak menampilkan data?",
    answer:
      "Periksa kembali filter periode, sekolah, dan kriteria lain yang digunakan. Pastikan data yang dicari sudah tersedia pada sistem. Jika laporan tetap kosong, periksa apakah akun Anda memiliki akses ke data tersebut atau mintalah administrator memeriksa sumber datanya.",
    tags: ["laporan", "kosong", "data", "filter"],
  },
];

const QUICK_LINKS = [
  {
    title: "Profil Yayasan",
    description: "Perbarui identitas dan informasi yayasan.",
    href: "/yayasan/profil",
    icon: Building2,
  },
  {
    title: "Sekolah Binaan",
    description: "Lihat dan kelola informasi sekolah binaan.",
    href: "/yayasan/sekolah",
    icon: GraduationCap,
  },
  {
    title: "Monitoring Akademik",
    description: "Periksa informasi akademik sekolah.",
    href: "/yayasan/monitoringAkademik",
    icon: BarChart3,
  },
  {
    title: "Laporan Yayasan",
    description: "Akses laporan yang tersedia untuk yayasan.",
    href: "/yayasan/laporan",
    icon: ClipboardList,
  },
];

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function HelpCard({ icon: Icon, title, description, children }) {
  return (
    <div className="theme-border theme-card h-full rounded-xl border p-5 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
          <Icon size={20} className="theme-primary-text" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="theme-text text-sm font-bold">{title}</h3>
          <p className="theme-text-muted mt-1 text-sm leading-6">
            {description}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}

function FAQItem({ item, open, onToggle }) {
  return (
    <article className="theme-border theme-card overflow-hidden rounded-xl border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] sm:p-5"
      >
        <span className="flex min-w-0 items-start gap-3">
          <span className="theme-primary-text mt-0.5 shrink-0">
            <CircleHelp size={19} />
          </span>

          <span className="theme-text text-sm font-semibold leading-6">
            {item.question}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`theme-text-muted shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="theme-border border-t px-4 pb-5 pt-4 sm:px-5">
          <p className="theme-text-muted pl-8 text-sm leading-7">
            {item.answer}
          </p>
        </div>
      )}
    </article>
  );
}

export default function BantuanYayasanPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("semua");
  const [openFAQ, setOpenFAQ] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const filteredFAQs = useMemo(() => {
    const keyword = normalizeText(search);

    return FAQS.filter((item) => {
      const matchesCategory =
        activeCategory === "semua" || item.category === activeCategory;

      const searchableText = normalizeText(
        [
          item.question,
          item.answer,
          ...(item.tags || []),
          CATEGORIES.find((category) => category.id === item.category)?.label,
        ].join(" ")
      );

      const matchesSearch = !keyword || searchableText.includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const displayedFAQs = showAll ? filteredFAQs : filteredFAQs.slice(0, 6);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setOpenFAQ(null);
    setShowAll(false);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setOpenFAQ(null);
    setShowAll(false);
  };

  const clearSearch = () => {
    setSearch("");
    setActiveCategory("semua");
    setOpenFAQ(1);
    setShowAll(false);
  };

  return (
    <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
            <LifeBuoy size={25} className="theme-primary-text" />
          </div>

          <div>
            <h1 className="theme-text text-2xl font-bold tracking-tight">
              Pusat Bantuan
            </h1>
            <p className="theme-text-muted mt-1 max-w-2xl text-sm leading-6">
              Temukan panduan dan jawaban untuk membantu Anda mengelola yayasan
              dan sekolah binaan melalui SmartSchool.
            </p>
          </div>
        </div>

        <span className="theme-primary-text inline-flex w-fit items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 text-xs font-medium">
          <ShieldCheck size={15} />
          Bantuan Pengguna Yayasan
        </span>
      </header>

      {/* SEARCH HERO */}
      <section className="theme-border theme-card relative overflow-hidden rounded-2xl border p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
            <HelpCircle size={26} className="theme-primary-text" />
          </div>

          <h2 className="theme-text mt-4 text-xl font-bold sm:text-2xl">
            Ada yang bisa kami bantu?
          </h2>

          <p className="theme-text-muted mt-2 text-sm leading-6">
            Cari panduan berdasarkan pertanyaan atau kendala yang sedang Anda
            alami.
          </p>

          <div className="relative mt-6">
            <Search
              size={19}
              className="theme-text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            />

            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari bantuan, misalnya profil, sekolah, laporan..."
              aria-label="Cari bantuan"
              className="theme-border theme-text w-full rounded-xl border bg-[var(--color-card)] py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="theme-text-muted absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <p className="theme-text-muted mt-3 text-xs">
            Contoh pencarian: sekolah binaan, ubah profil, monitoring akademik.
          </p>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section>
        <div className="mb-4">
          <h2 className="theme-text text-lg font-bold">Akses Cepat</h2>
          <p className="theme-text-muted mt-1 text-sm">
            Langsung menuju menu yang sering digunakan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group theme-border theme-card flex min-w-0 items-start gap-3 rounded-xl border p-4 transition hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] transition group-hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]">
                  <Icon size={20} className="theme-primary-text" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="theme-text text-sm font-semibold">
                    {item.title}
                  </h3>
                  <p className="theme-text-muted mt-1 text-xs leading-5">
                    {item.description}
                  </p>
                  <span className="theme-primary-text mt-3 inline-flex items-center gap-1 text-xs font-semibold">
                    Buka halaman
                    <ChevronRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="theme-border theme-card rounded-xl border p-4 sm:p-6">
        <div className="theme-border flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
              <BookOpen size={20} className="theme-primary-text" />
            </div>

            <div>
              <h2 className="theme-text text-lg font-bold">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="theme-text-muted mt-1 text-sm">
                Temukan jawaban untuk kendala umum penggunaan SmartSchool.
              </p>
            </div>
          </div>

          <span className="theme-border theme-text-muted w-fit rounded-full border px-3 py-1 text-xs">
            {filteredFAQs.length} panduan
          </span>
        </div>

        {/* CATEGORY FILTER */}
        <div className="mt-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  aria-pressed={active}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text"
                      : "theme-border theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                  }`}
                >
                  <Icon size={15} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ LIST */}
        <div className="mt-4 space-y-3">
          {displayedFAQs.length > 0 ? (
            displayedFAQs.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                open={openFAQ === item.id}
                onToggle={() =>
                  setOpenFAQ((previous) =>
                    previous === item.id ? null : item.id
                  )
                }
              />
            ))
          ) : (
            <div className="theme-border rounded-xl border border-dashed px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                <Search size={22} className="theme-primary-text" />
              </div>

              <h3 className="theme-text mt-4 text-sm font-bold">
                Bantuan tidak ditemukan
              </h3>

              <p className="theme-text-muted mx-auto mt-2 max-w-md text-sm leading-6">
                Kami belum menemukan panduan yang sesuai dengan pencarian
                Anda. Coba gunakan kata kunci yang lebih sederhana atau pilih
                kategori lainnya.
              </p>

              <button
                type="button"
                onClick={clearSearch}
                className="theme-primary mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              >
                Tampilkan semua bantuan
              </button>
            </div>
          )}
        </div>

        {filteredFAQs.length > 6 && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((previous) => !previous)}
              className="theme-border theme-text inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
            >
              {showAll ? "Tampilkan lebih sedikit" : "Lihat semua panduan"}
              <ChevronDown
                size={16}
                className={`transition-transform ${showAll ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
      </section>

      {/* HOW TO GET HELP */}
      <section>
        <div className="mb-4">
          <h2 className="theme-text text-lg font-bold">
            Masih Membutuhkan Bantuan?
          </h2>
          <p className="theme-text-muted mt-1 text-sm">
            Ikuti langkah berikut jika jawaban yang dicari belum tersedia.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HelpCard
            icon={Lightbulb}
            title="1. Periksa kembali data"
            description="Pastikan filter, periode, sekolah, dan informasi akun yang dipilih sudah sesuai."
          />

          <HelpCard
            icon={Settings}
            title="2. Muat ulang halaman"
            description="Jika informasi belum berubah, coba muat ulang halaman dan periksa koneksi internet."
          />

          <HelpCard
            icon={MessageCircle}
            title="3. Hubungi administrator"
            description="Jika kendala tetap terjadi, sampaikan detail masalah kepada administrator SmartSchool."
          />
        </div>
      </section>

      {/* SUPPORT INFORMATION */}
      <section className="rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
              <LifeBuoy size={23} className="theme-primary-text" />
            </div>

            <div>
              <h2 className="theme-text text-base font-bold">
                Butuh bantuan lebih lanjut?
              </h2>
              <p className="theme-text-muted mt-1 max-w-2xl text-sm leading-6">
                Siapkan nama menu, waktu kejadian, pesan kesalahan, dan langkah
                yang sudah dilakukan agar administrator dapat membantu
                memeriksa kendala Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const message = [
                "Halo, saya membutuhkan bantuan SmartSchool.",
                "",
                "Peran: Admin Yayasan",
                "Menu yang bermasalah: ",
                "Kendala: ",
                "Waktu kejadian: ",
                "Pesan kesalahan: ",
              ].join("\n");

              if (
                typeof navigator !== "undefined" &&
                navigator.clipboard?.writeText
              ) {
                navigator.clipboard
                  .writeText(message)
                  .then(() => {
                    window.alert(
                      "Template laporan bantuan berhasil disalin. Silakan kirim kepada administrator SmartSchool."
                    );
                  })
                  .catch(() => {
                    window.alert(message);
                  });
              } else {
                window.alert(message);
              }
            }}
            className="theme-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition hover:opacity-90"
          >
            <MessageCircle size={17} />
            Siapkan Laporan Kendala
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="theme-border border-t py-4">
        <div className="theme-text-muted flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>SmartSchool · Pusat Bantuan Yayasan</p>
          <p>Tidak menemukan jawaban? Hubungi administrator sistem Anda.</p>
        </div>
      </footer>
    </div>
  );
}