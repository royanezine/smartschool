import {
  School,
  BookOpen,
  GraduationCap,
  BriefcaseBusiness,
  ArrowRight,
} from "lucide-react";

const levels = [
  {
    title: "Sekolah Dasar (SD)",
    icon: School,
    description:
      "Mendukung pengelolaan administrasi, absensi, nilai, dan komunikasi sekolah dasar.",
  },
  {
    title: "Sekolah Menengah Pertama (SMP)",
    icon: BookOpen,
    description:
      "Membantu proses pembelajaran, jadwal, penilaian, hingga monitoring akademik siswa.",
  },
  {
    title: "Sekolah Menengah Atas (SMA)",
    icon: GraduationCap,
    description:
      "Kelola seluruh aktivitas akademik dan administrasi sekolah dengan sistem yang terintegrasi.",
  },
  {
    title: "Sekolah Menengah Kejuruan (SMK)",
    icon: BriefcaseBusiness,
    description:
      "Mendukung pengelolaan kompetensi keahlian, praktik industri, dan administrasi sekolah.",
  },
];

export default function EducationLevel() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            <span className="h-px w-8 bg-blue-600" />
            Jenjang Pendidikan
            <span className="h-px w-8 bg-blue-600" />
          </p>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Solusi untuk Semua{" "}
            <span className="text-blue-600">Jenjang Pendidikan</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Smart School dirancang untuk memenuhi kebutuhan setiap jenjang
            pendidikan, mulai dari Sekolah Dasar hingga Sekolah Menengah
            Kejuruan.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {levels.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-600/40 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <span className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-blue-600 transition-transform duration-300 group-hover:scale-y-100" />

                <span className="absolute right-8 top-7 text-sm font-semibold tabular-nums text-slate-300">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    <Icon size={26} strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 pr-6">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-[15px] leading-7 text-slate-600">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      className="mt-6 inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-sm font-semibold text-slate-900 transition-all duration-300 hover:border-blue-600 hover:text-blue-600 group-hover:gap-3"
                    >
                      Pelajari Selengkapnya
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}