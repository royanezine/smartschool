import { ArrowRight, PhoneCall } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-16 md:px-16">

          {/* Background Decoration */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10"></div>

          <div className="relative z-10 max-w-3xl">

            <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
              🚀 Mulai Digitalisasi Sekolah
            </span>

            <h2 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl">
              Wujudkan Sekolah Digital
              <br />
              Bersama <span className="text-blue-200">Smart School</span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-blue-100">
              Tingkatkan efisiensi administrasi, akademik, dan komunikasi
              sekolah melalui satu platform yang modern, aman, dan mudah
              digunakan.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <button className="flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-semibold text-blue-700 transition hover:scale-105">
                Mulai Sekarang
                <ArrowRight size={18} />
              </button>

              <button className="flex items-center gap-2 rounded-xl border border-white/40 px-7 py-4 font-semibold text-white transition hover:bg-white/10">
                <PhoneCall size={18} />
                Hubungi Kami
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}