import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "Gratis",
      description: "Cocok untuk sekolah yang ingin mencoba Smart School.",
      button: "Mulai Gratis",
      popular: false,
      features: [
        "Dashboard Sekolah",
        "Data Guru & Siswa",
        "Absensi",
        "Jadwal Pelajaran",
        "Support Email",
      ],
    },
    {
      name: "Professional",
      price: "Hubungi Kami",
      description: "Pilihan terbaik untuk sekolah yang ingin digitalisasi penuh.",
      button: "Konsultasi Sekarang",
      popular: true,
      features: [
        "Semua fitur Basic",
        "Keuangan Sekolah",
        "Rapor Digital",
        "PPDB Online",
        "E-Learning",
        "Notifikasi WhatsApp",
        "Laporan Lengkap",
        "Support Prioritas",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Untuk yayasan atau sekolah dengan kebutuhan khusus.",
      button: "Hubungi Sales",
      popular: false,
      features: [
        "Semua fitur Professional",
        "Multi Sekolah",
        "API Integration",
        "Cloud Dedicated",
        "Training",
        "Pendampingan",
      ],
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Harga
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Pilih Paket Sesuai
            <span className="text-blue-600"> Kebutuhan Sekolah</span>
          </h2>

          <p className="mt-5 text-gray-500 leading-8">
            Fleksibel untuk sekolah kecil hingga yayasan besar.
            Konsultasikan kebutuhanmu bersama tim Smart School.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">

          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                plan.popular
                  ? "border-blue-600 shadow-xl scale-105"
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white">
                  ⭐ Paling Populer
                </div>
              )}

              <h3 className="text-2xl font-bold text-slate-900">
                {plan.name}
              </h3>

              <p className="mt-3 text-gray-500">
                {plan.description}
              </p>

              <div className="mt-8 text-4xl font-bold text-blue-600">
                {plan.price}
              </div>

              <button
                className={`mt-8 w-full rounded-xl py-3 font-semibold transition ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
              >
                {plan.button}
              </button>

              <div className="mt-8 space-y-4">

                {plan.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Check size={14} />
                    </div>

                    <span className="text-gray-600">
                      {feature}
                    </span>
                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}