import {
  Clock,
  Layers,
  FileWarning,
  EyeOff,
  CopyX,
  MessageSquareOff,
  ArrowUpRight,
} from "lucide-react";

const problems = [
  {
    number: "01",
    icon: Clock,
    title: "Administrasi Manual",
    desc: "Proses administrasi masih dilakukan secara manual dan memakan waktu.",
    span: "lg:col-span-2",
    featured: true,
  },
  {
    number: "02",
    icon: Layers,
    title: "Data Terpisah di Berbagai Aplikasi",
    desc: "Data siswa, guru, dan akademik tersebar di berbagai aplikasi dan file.",
    span: "lg:col-span-1",
  },
  {
    number: "03",
    icon: FileWarning,
    title: "Penyusunan Laporan Lama",
    desc: "Penyusunan laporan membutuhkan waktu yang lama dan proses rumit.",
    span: "lg:col-span-1",
  },
  {
    number: "04",
    icon: EyeOff,
    title: "Monitoring Sulit Dilakukan",
    desc: "Sulit memantau perkembangan sekolah secara real-time dan akurat.",
    span: "lg:col-span-1",
  },
  {
    number: "05",
    icon: CopyX,
    title: "Risiko Kesalahan & Duplikasi Data",
    desc: "Kesalahan pencatatan dan duplikasi data masih sering terjadi.",
    span: "lg:col-span-1",
  },
  {
    number: "06",
    icon: MessageSquareOff,
    title: "Komunikasi Belum Terintegrasi",
    desc: "Komunikasi antar guru, siswa dan pihak sekolah belum terintegrasi.",
    span: "lg:col-span-3",
    wide: true,
  },
];

const stats = [
  { value: "6", label: "Kendala utama" },
  { value: "3+", label: "Aplikasi terpisah" },
  { value: "Jam", label: "Waktu terbuang" },
];

const bars = [90, 75, 85, 60, 70, 45, 55];

export default function Problems() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(148 163 184 / 0.35) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 55%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-px w-8 bg-blue-600" />
              Masalah
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Tantangan yang dihadapi sekolah{" "}
              <span className="text-blue-600">saat ini.</span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Berbagai kendala operasional masih menjadi hambatan dalam
              pengelolaan sekolah secara efektif dan efisien.
            </p>
          </div>

          <dl className="flex shrink-0 divide-x divide-slate-200">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 first:pl-0 last:pr-0">
                <dt className="text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs text-slate-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {problems.map((item) => {
            const Icon = item.icon;

            if (item.featured) {
              return (
                <li
                  key={item.number}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-blue-600 p-7 text-white md:col-span-2 ${item.span}`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                      maskImage:
                        "linear-gradient(135deg, transparent 30%, black 100%)",
                      WebkitMaskImage:
                        "linear-gradient(135deg, transparent 30%, black 100%)",
                    }}
                  />

                  <div className="relative flex items-start justify-between gap-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-white/60">
                      {item.number}
                    </span>
                  </div>

                  <div className="relative mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
                    <div>
                      <h3 className="text-xl font-semibold leading-7 sm:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-7 text-blue-50/90">
                        {item.desc}
                      </p>
                    </div>

                    <div
                      className="flex h-24 items-end gap-2"
                      aria-hidden="true"
                    >
                      {bars.map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t-md ${
                            i === 0 ? "bg-white" : "bg-white/30"
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={item.number}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-7 transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-lg hover:shadow-blue-600/5 ${
                  item.wide ? "md:col-span-2" : ""
                } ${item.span}`}
              >
                <span
                  className="pointer-events-none absolute -right-2 -top-4 select-none text-8xl font-black tabular-nums text-slate-100 transition-colors duration-300 group-hover:text-blue-50"
                  aria-hidden="true"
                >
                  {item.number}
                </span>

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-blue-100 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  <Icon size={20} />
                </div>

                <div className="relative mt-10">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold leading-7 text-slate-900">
                      {item.title}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="mt-1 shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600"
                    />
                  </div>
                  <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-600">
                    {item.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}