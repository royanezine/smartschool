import {
  School,
  BookOpen,
  GraduationCap,
  BriefcaseBusiness,
  ArrowRight,
} from "lucide-react";

export default function EducationLevel() {
  const levels = [
    {
      title: "Sekolah Dasar (SD)",
      color: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
      icon: <School size={28} />,
      description:
        "Mendukung pengelolaan administrasi, absensi, nilai, dan komunikasi sekolah dasar.",
    },
    {
      title: "Sekolah Menengah Pertama (SMP)",
      color: "bg-green-500",
      bg: "bg-green-50",
      text: "text-green-600",
      icon: <BookOpen size={28} />,
      description:
        "Membantu proses pembelajaran, jadwal, penilaian, hingga monitoring akademik siswa.",
    },
    {
      title: "Sekolah Menengah Atas (SMA)",
      color: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
      icon: <GraduationCap size={28} />,
      description:
        "Kelola seluruh aktivitas akademik dan administrasi sekolah dengan sistem yang terintegrasi.",
    },
    {
      title: "Sekolah Menengah Kejuruan (SMK)",
      color: "bg-orange-500",
      bg: "bg-orange-50",
      text: "text-orange-600",
      icon: <BriefcaseBusiness size={28} />,
      description:
        "Mendukung pengelolaan kompetensi keahlian, praktik industri, dan administrasi sekolah.",
    },
  ];

  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Jenjang Pendidikan
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Solusi untuk Semua
            <span className="text-blue-600">
              {" "}Jenjang Pendidikan
            </span>
          </h2>

          <p className="mt-5 text-gray-500 leading-8">
            Smart School dirancang untuk memenuhi kebutuhan setiap
            jenjang pendidikan, mulai dari Sekolah Dasar hingga
            Sekolah Menengah Kejuruan.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">

          {levels.map((item, index) => (
            <div
              key={index}
              className="group rounded-3xl bg-white border border-slate-200 p-8 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-5">

                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg} ${item.text}`}
                >
                  {item.icon}
                </div>

                <div className="flex-1">

                  <div
                    className={`mb-4 h-1 w-16 rounded-full ${item.color}`}
                  />

                  <h3 className="text-2xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-gray-500 leading-7">
                    {item.description}
                  </p>

                  <button
                    className={`mt-6 flex items-center gap-2 font-semibold ${item.text} group-hover:gap-3 transition-all`}
                  >
                    Pelajari Selengkapnya
                    <ArrowRight size={18} />
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}