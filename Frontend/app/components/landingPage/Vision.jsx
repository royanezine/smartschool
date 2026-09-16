import {
  Monitor,
  ChartColumn,
  Users,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function Vision() {
  const items = [
    {
      icon: <Monitor size={26} />,
      title: "Digitalisasi Sekolah",
      desc: "Mengubah proses manual menjadi digital untuk meningkatkan efisiensi dan produktivitas.",
    },
    {
      icon: <ChartColumn size={26} />,
      title: "Data Terintegrasi",
      desc: "Semua data sekolah terpusat dalam satu sistem yang akurat, aman, dan mudah diakses.",
    },
    {
      icon: <Users size={26} />,
      title: "Kolaborasi Efektif",
      desc: "Mempermudah komunikasi dan kolaborasi antara guru, siswa, orang tua, dan pihak sekolah.",
    },
    {
      icon: <ShieldCheck size={26} />,
      title: "Keamanan Terjamin",
      desc: "Menjaga keamanan data dengan sistem yang terpercaya dan sesuai standar perlindungan data.",
    },
    {
      icon: <Star size={26} />,
      title: "Mendukung Prestasi",
      desc: "Memberikan informasi yang akurat untuk membantu pengambilan keputusan yang lebih baik.",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900">
            Tujuan Hadirnya Smart School
          </h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">

          {items.map((item, index) => (
            <div
              key={index}
              className={`px-6 text-center ${
                index !== items.length - 1
                  ? "lg:border-r border-gray-200"
                  : ""
              }`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm">
                {item.icon}
              </div>

              <h3 className="mt-6 text-lg font-bold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}