import {
  BookOpen,
  Users,
  ClipboardCheck,
  CreditCard,
  BellRing,
  BarChart3,
} from "lucide-react";

export default function FeaturedModule() {
  const modules = [
    {
      title: "Akademik",
      icon: <BookOpen size={30} />,
      desc: "Mengelola kurikulum, jadwal, nilai, dan rapor siswa secara digital.",
    },
    {
      title: "Data Guru & Siswa",
      icon: <Users size={30} />,
      desc: "Seluruh data guru dan siswa tersimpan dalam satu sistem terintegrasi.",
    },
    {
      title: "Absensi Digital",
      icon: <ClipboardCheck size={30} />,
      desc: "Absensi guru maupun siswa dilakukan secara cepat dan real-time.",
    },
    {
      title: "Keuangan",
      icon: <CreditCard size={30} />,
      desc: "Pembayaran SPP, tagihan, dan laporan keuangan menjadi lebih mudah.",
    },
    {
      title: "Notifikasi",
      icon: <BellRing size={30} />,
      desc: "Informasi penting langsung dikirim ke guru, siswa, maupun orang tua.",
    },
    {
      title: "Dashboard Analitik",
      icon: <BarChart3 size={30} />,
      desc: "Monitoring perkembangan sekolah melalui dashboard interaktif.",
    },
  ];

  return (
    <section className="bg-blue-50 py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow">
            Modul Unggulan
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Modul Smart School yang
            <span className="text-blue-600"> Paling Banyak Digunakan</span>
          </h2>

          <p className="mt-5 text-gray-600 leading-8">
            Pilihan modul lengkap untuk membantu sekolah mengelola
            administrasi, akademik, komunikasi, dan keuangan
            dalam satu platform.
          </p>
        </div>

        {/* Module Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {modules.map((module, index) => (
            <div
              key={index}
              className="group rounded-3xl bg-white border border-slate-200 p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">

                {module.icon}

              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900">
                {module.title}
              </h3>

              <p className="mt-4 text-gray-500 leading-7">
                {module.desc}
              </p>

              <button className="mt-6 text-blue-600 font-semibold hover:underline">
                Pelajari Modul →
              </button>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}