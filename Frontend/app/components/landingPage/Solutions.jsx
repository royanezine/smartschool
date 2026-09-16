import {
  FileText,
  Database,
  FileCheck,
  MonitorSmartphone,
  ShieldCheck,
  MessagesSquare,
} from "lucide-react";

export default function Solutions() {
  const solutions = [
    {
      number: "01",
      color: "text-blue-600",
      bg: "bg-blue-50",
      line: "bg-blue-600",
      icon: <FileText size={34} />,
      title: "Administrasi Digital",
      desc: "Semua proses administrasi dikelola secara digital, lebih cepat, mudah, dan efisien.",
    },
    {
      number: "02",
      color: "text-violet-600",
      bg: "bg-violet-50",
      line: "bg-violet-600",
      icon: <Database size={34} />,
      title: "Data Terintegrasi dalam Satu Sistem",
      desc: "Seluruh data siswa, guru, dan akademik terpusat dalam satu sistem yang aman dan mudah diakses.",
    },
    {
      number: "03",
      color: "text-green-600",
      bg: "bg-green-50",
      line: "bg-green-600",
      icon: <FileCheck size={34} />,
      title: "Laporan Otomatis & Cepat",
      desc: "Pembuatan laporan otomatis dalam hitungan menit dengan data yang akurat dan real-time.",
    },
    {
      number: "04",
      color: "text-orange-500",
      bg: "bg-orange-50",
      line: "bg-orange-500",
      icon: <MonitorSmartphone size={34} />,
      title: "Monitoring Real-time",
      desc: "Pantau perkembangan sekolah secara real-time melalui dashboard interaktif yang informatif.",
    },
    {
      number: "05",
      color: "text-red-500",
      bg: "bg-red-50",
      line: "bg-red-500",
      icon: <ShieldCheck size={34} />,
      title: "Data Akurat & Aman",
      desc: "Validasi data otomatis mengurangi kesalahan dan duplikasi serta menjaga keamanan data sekolah.",
    },
    {
      number: "06",
      color: "text-blue-500",
      bg: "bg-blue-50",
      line: "bg-blue-500",
      icon: <MessagesSquare size={34} />,
      title: "Komunikasi Terintegrasi",
      desc: "Guru, siswa, orang tua, dan pihak sekolah terhubung dalam satu platform komunikasi yang efektif.",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center">

          <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            🔷 Solusi Smart School
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Solusi Smart School untuk Pengelolaan yang Lebih Baik
          </h2>

          <p className="mt-4 max-w-3xl mx-auto text-gray-500 leading-7">
            Smart School hadir dengan solusi digital terintegrasi
            untuk mengatasi berbagai tantangan pengelolaan sekolah.
          </p>

        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-7 md:grid-cols-2 lg:grid-cols-3">

          {solutions.map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Number */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${item.bg} ${item.color} text-sm font-bold`}
              >
                {item.number}
              </div>

              {/* Icon */}
              <div className={`mt-6 ${item.color}`}>
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-bold leading-7 text-slate-900">
                {item.title}
              </h3>

              {/* Line */}
              <div className={`mt-3 h-1 w-12 rounded-full ${item.line}`}></div>

              {/* Description */}
              <p className="mt-5 text-sm leading-7 text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}