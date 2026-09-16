import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Users,
  BellRing,
  BarChart3,
  ShieldCheck,
  FileText,
  UserCog,
  MessageSquare,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Akademik",
      desc: "Kelola kurikulum, nilai, dan proses belajar mengajar.",
      icon: <BookOpen size={24} />,
    },
    {
      title: "Jadwal Pelajaran",
      desc: "Penyusunan jadwal otomatis dan mudah diakses.",
      icon: <CalendarDays size={24} />,
    },
    {
      title: "Absensi",
      desc: "Absensi guru dan siswa secara real-time.",
      icon: <ClipboardCheck size={24} />,
    },
    {
      title: "Keuangan",
      desc: "Kelola pembayaran dan laporan keuangan sekolah.",
      icon: <CreditCard size={24} />,
    },
    {
      title: "Guru",
      desc: "Manajemen data guru, tugas, dan jadwal mengajar.",
      icon: <GraduationCap size={24} />,
    },
    {
      title: "Siswa",
      desc: "Data siswa terintegrasi dalam satu sistem.",
      icon: <Users size={24} />,
    },
    {
      title: "Notifikasi",
      desc: "Pemberitahuan otomatis ke guru dan orang tua.",
      icon: <BellRing size={24} />,
    },
    {
      title: "Laporan",
      desc: "Laporan akademik dan administrasi secara instan.",
      icon: <BarChart3 size={24} />,
    },
    {
      title: "Keamanan",
      desc: "Data sekolah terlindungi dengan sistem keamanan.",
      icon: <ShieldCheck size={24} />,
    },
    {
      title: "Dokumen",
      desc: "Penyimpanan seluruh dokumen sekolah secara digital.",
      icon: <FileText size={24} />,
    },
    {
      title: "Manajemen User",
      desc: "Pengaturan hak akses guru, siswa, dan admin.",
      icon: <UserCog size={24} />,
    },
    {
      title: "Komunikasi",
      desc: "Komunikasi sekolah lebih cepat dan terintegrasi.",
      icon: <MessageSquare size={24} />,
    },
  ];

  return (
    <section id="fitur" className="bg-[#F8FAFC] py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Fitur Lengkap
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Semua Kebutuhan Sekolah
            <span className="text-blue-600"> Dalam Satu Platform</span>
          </h2>

          <p className="mt-5 text-gray-500 leading-8">
            Smart School menyediakan berbagai fitur untuk mendukung
            pengelolaan sekolah yang lebih modern, efisien,
            dan terintegrasi.
          </p>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((item, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>

              {/* Desc */}
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