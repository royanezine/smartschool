import {
  ClipboardList,
  FolderOpen,
  Clock3,
  BarChart3,
  Database,
  MessageCircle,
} from "lucide-react";

export default function Problems() {
  const problems = [
    {
      number: "01",
      icon: <ClipboardList size={34} />,
      title: "Administrasi Manual",
      desc: "Proses administrasi masih dilakukan secara manual dan memakan waktu.",
    },
    {
      number: "02",
      icon: <FolderOpen size={34} />,
      title: "Data Terpisah di Berbagai Aplikasi",
      desc: "Data siswa, guru, dan akademik tersebar di berbagai aplikasi dan file.",
    },
    {
      number: "03",
      icon: <Clock3 size={34} />,
      title: "Penyusunan Laporan Lama",
      desc: "Penyusunan laporan membutuhkan waktu yang lama dan proses rumit.",
    },
    {
      number: "04",
      icon: <BarChart3 size={34} />,
      title: "Monitoring Sulit Dilakukan",
      desc: "Sulit memantau perkembangan sekolah secara real-time dan akurat.",
    },
    {
      number: "05",
      icon: <Database size={34} />,
      title: "Risiko Kesalahan & Duplikasi Data",
      desc: "Kesalahan pencatatan dan duplikasi data masih sering terjadi.",
    },
    {
      number: "06",
      icon: <MessageCircle size={34} />,
      title: "Komunikasi Belum Terintegrasi",
      desc: "Komunikasi antar guru, siswa, orang tua, dan pihak sekolah belum terintegrasi.",
    },
  ];

  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Badge */}
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            ⚠️ Masalah
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Tantangan yang Dihadapi Sekolah Saat Ini
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-gray-500 leading-7">
            Berbagai kendala operasional masih menjadi hambatan dalam
            pengelolaan sekolah secara efektif dan efisien.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-7 lg:grid-cols-3 md:grid-cols-2">

          {problems.map((item) => (
            <div
              key={item.number}
              className="relative rounded-2xl bg-white p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Number */}
              <div className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                {item.number}
              </div>

              {/* Icon */}
              <div className="mt-10 text-blue-600">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-bold text-slate-900 leading-7">
                {item.title}
              </h3>

              {/* Blue Line */}
              <div className="mt-3 h-1 w-12 rounded-full bg-blue-600"></div>

              {/* Desc */}
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