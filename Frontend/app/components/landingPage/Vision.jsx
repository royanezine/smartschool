import Link from "next/link";
import {
  Monitor,
  ChartColumn,
  Users,
  ShieldCheck,
  Star,
  ArrowUpRight,
} from "lucide-react";

const items = [
  {
    number: "01",
    icon: Monitor,
    title: "Digitalisasi Sekolah",
    desc: "Mengubah proses manual menjadi digital untuk meningkatkan efisiensi dan produktivitas.",
  },
  {
    number: "02",
    icon: ChartColumn,
    title: "Data Terintegrasi",
    desc: "Semua data sekolah terpusat dalam satu sistem yang akurat, aman, dan mudah diakses.",
  },
  {
    number: "03",
    icon: Users,
    title: "Kolaborasi Efektif",
    desc: "Mempermudah komunikasi dan kolaborasi antara guru, siswa dan pihak sekolah.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Keamanan Terjamin",
    desc: "Menjaga keamanan data dengan sistem yang terpercaya dan sesuai standar perlindungan data.",
  },
  {
    number: "05",
    icon: Star,
    title: "Mendukung Prestasi",
    desc: "Memberikan informasi yang akurat untuk membantu pengambilan keputusan yang lebih baik.",
  },
];

export default function Vision() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgb(148 163 184 / 0.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 50%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 50%)",
          }}
        />
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-blue-100" />
        <div className="absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full border border-blue-100" />
        <div className="absolute -right-8 -top-8 h-[200px] w-[200px] rounded-full border border-blue-200/70" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-px w-10 bg-blue-600" />
              Visi & Tujuan
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Tujuan hadirnya
              <br />
              <span className="text-blue-600">Smart School.</span>
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-base leading-8 text-slate-600">
              Lima komitmen utama kami untuk membantu sekolah bergerak lebih
              cepat, lebih rapi, dan lebih terhubung.
            </p>
          </div>
        </div>

        <ol className="mt-16 border-t border-slate-200 sm:mt-20">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <li
                key={item.number}
                className="group relative grid items-center gap-x-8 gap-y-4 border-b border-slate-200 px-2 py-8 transition-colors duration-300 hover:bg-slate-50 md:grid-cols-[110px_56px_1fr_1.5fr_24px] md:px-6 md:py-10"
              >
                <span className="absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 bg-blue-600 transition-transform duration-300 group-hover:scale-y-100" />

                <span
                  className="select-none text-6xl font-extrabold leading-none tabular-nums text-transparent transition-colors duration-300 group-hover:text-blue-600/10 md:text-7xl"
                  style={{ WebkitTextStroke: "1.5px rgb(37 99 235 / 0.45)" }}
                  aria-hidden="true"
                >
                  {item.number}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  <Icon size={22} />
                </div>

                <h3 className="text-xl font-semibold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-blue-700 sm:text-2xl">
                  {item.title}
                </h3>

                <p className="max-w-xl text-[15px] leading-7 text-slate-600">
                  {item.desc}
                </p>

                <ArrowUpRight
                  size={20}
                  className="hidden text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600 md:block"
                />
              </li>
            );
          })}
        </ol>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-md text-sm leading-7 text-slate-600">
            Satu platform untuk seluruh kebutuhan sekolah. Mulai digitalisasi
            sekolahmu hari ini.
          </p>

          <Link
            href="/daftar-sekolah"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Daftar sekarang
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}