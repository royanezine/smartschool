"use client";

import { motion } from "framer-motion";

const features = [
  {
    tag: "Pembelajaran",
    title: "Akademik",
    desc: "Kelola kurikulum, nilai, dan proses belajar mengajar.",
  },
  {
    tag: "Pembelajaran",
    title: "Jadwal Pelajaran",
    desc: "Penyusunan jadwal otomatis dan mudah diakses.",
  },
  {
    tag: "Operasional",
    title: "Absensi",
    desc: "Absensi guru dan siswa secara real-time.",
  },
  {
    tag: "Operasional",
    title: "Keuangan",
    desc: "Kelola pembayaran dan laporan keuangan sekolah.",
  },
  {
    tag: "Data",
    title: "Guru",
    desc: "Manajemen data guru, tugas, dan jadwal mengajar.",
  },
  {
    tag: "Data",
    title: "Siswa",
    desc: "Data siswa terintegrasi dalam satu sistem.",
  },
  {
    tag: "Komunikasi",
    title: "Notifikasi",
    desc: "Pemberitahuan otomatis ke guru dan orang tua.",
  },
  {
    tag: "Komunikasi",
    title: "Komunikasi",
    desc: "Komunikasi sekolah lebih cepat dan terintegrasi.",
  },
  {
    tag: "Operasional",
    title: "Laporan",
    desc: "Laporan akademik dan administrasi secara instan.",
  },
  {
    tag: "Operasional",
    title: "Dokumen",
    desc: "Penyimpanan seluruh dokumen sekolah secara digital.",
  },
  {
    tag: "Sistem",
    title: "Keamanan",
    desc: "Data sekolah terlindungi dengan sistem keamanan.",
  },
  {
    tag: "Sistem",
    title: "Manajemen User",
    desc: "Pengaturan hak akses guru, siswa, dan admin.",
  },
];

export default function Features() {
  return (
    <section id="fitur" className="bg-white">
      {/* ============ PITA BIRU (HEADER) ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 pb-48 pt-24">
        {/* Pola garis halus */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "linear-gradient(to bottom, black 30%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 30%, transparent 100%)",
          }}
        />

        {/* Lingkaran dekoratif di kanan */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full border border-white/10" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                Fitur Lengkap
              </p>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
                Semua Kebutuhan Sekolah dalam Satu Platform
              </h2>
            </div>

            <p className="max-w-sm text-base leading-8 text-blue-100">
              Smart School menyediakan berbagai fitur untuk mendukung
              pengelolaan sekolah yang lebih modern, efisien, dan
              terintegrasi.
            </p>
          </div>
        </div>
      </div>

      {/* ============ KARTU FITUR (MENUMPUK KE ATAS) ============ */}
      <div className="relative mx-auto -mt-28 max-w-7xl px-6 pb-28 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: (index % 4) * 0.07,
              }}
              className="group relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10"
            >
              {/* Chip nomor + kategori */}
              <div className="flex items-center justify-between">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-50 px-2 text-xs font-semibold tabular-nums text-blue-700 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  {item.tag}
                </span>
              </div>

              <h3 className="mt-9 text-xl font-semibold tracking-tight text-slate-900">
                {item.title}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-slate-500">
                {item.desc}
              </p>

              {/* Garis aksen bawah */}
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-blue-600 transition-transform duration-300 group-hover:scale-x-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}