import {
  Search,
  Settings,
  MonitorSmartphone,
  GraduationCap,
} from "lucide-react";

export default function Implementation() {
  const steps = [
    {
      icon: <Search size={32} />,
      step: "01",
      title: "Analisis Kebutuhan",
      description:
        "Kami melakukan diskusi bersama sekolah untuk memahami kebutuhan sistem yang akan digunakan.",
    },
    {
      icon: <Settings size={32} />,
      step: "02",
      title: "Konfigurasi Sistem",
      description:
        "Tim kami menyesuaikan fitur, data sekolah, dan hak akses agar sesuai dengan kebutuhan institusi.",
    },
    {
      icon: <MonitorSmartphone size={32} />,
      step: "03",
      title: "Implementasi",
      description:
        "Sistem mulai diterapkan dan seluruh data sekolah dimigrasikan secara aman ke platform Smart School.",
    },
    {
      icon: <GraduationCap size={32} />,
      step: "04",
      title: "Training & Pendampingan",
      description:
        "Guru dan staf mendapatkan pelatihan penggunaan sistem serta pendampingan hingga siap digunakan.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center">

          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Tahapan Implementasi
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Proses Implementasi
            <span className="text-blue-600"> Smart School</span>
          </h2>

          <p className="mt-5 max-w-3xl mx-auto text-gray-500 leading-8">
            Kami memastikan proses implementasi berjalan cepat,
            terstruktur, dan didampingi oleh tim profesional agar
            sekolah dapat langsung menggunakan Smart School tanpa
            kendala.
          </p>

        </div>

        {/* Timeline */}
        <div className="relative mt-20">

          {/* Line */}
          <div className="hidden lg:block absolute left-0 right-0 top-12 h-1 bg-blue-100"></div>

          <div className="grid gap-8 lg:grid-cols-4 relative">

            {steps.map((item, index) => (
              <div
                key={index}
                className="relative bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition duration-300"
              >
                {/* Circle */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">

                  {item.icon}

                </div>

                {/* Step */}
                <div className="mt-6 text-center">

                  <span className="text-blue-600 font-bold text-sm">
                    STEP {item.step}
                  </span>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-gray-500 leading-7">
                    {item.description}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}