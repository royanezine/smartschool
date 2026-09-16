import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-white pt-20 lg:pt-24"
    >
      {/* Blur Background */}
      <div className="absolute -left-32 top-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-70"></div>

      <div className="grid lg:grid-cols-2 items-center">

        {/* LEFT */}
        <div className="max-w-2xl mx-auto px-6 lg:pl-16 lg:pr-10 py-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>

            <span className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
              Smart School
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-tight text-slate-900">

            Platform Smart School untuk

            <span className="text-blue-600">
              <br />
              Mengelola Seluruh Aktivitas Sekolah
            </span>

          </h1>

          {/* Description */}
          <p className="mt-5 text-gray-600 leading-7 text-base max-w-xl">
            Smart School membantu sekolah mengelola data siswa,
            guru, akademik, presensi, jadwal, dan administrasi
            dalam satu platform yang terintegrasi, aman, dan
            mudah digunakan.
          </p>

          {/* Button */}
          <div className="mt-8">

            <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-full font-semibold transition duration-300 shadow-lg">

              Mulai Sekarang

              <ArrowRight size={20} />

            </button>

          </div>

        </div>

        {/* RIGHT — full-bleed image with natural blend */}
        <div className="relative h-[320px] md:h-[420px] lg:h-[520px]">

          <Image
            src="/hero/hero.png"
            alt="Hero Smart School"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />

          {/* Fade overlay - blends left edge into white background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, white 0%, rgba(255,255,255,0.6) 8%, rgba(255,255,255,0) 30%)",
            }}
          ></div>

          {/* Soft fade on top edge too, for a more seamless blend */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 15%)",
            }}
          ></div>

        </div>

      </div>
    </section>
  );
}