import {
  Search,
  Settings,
  MonitorSmartphone,
  GraduationCap,
  Zap,
} from "lucide-react";

/*
  Siklus animasi total = 8 detik (lihat @keyframes di bawah).
  Arus butuh ±1.6 detik untuk sampai dari satu titik ke titik berikutnya.
  Kalau STEP_INTERVAL diubah, ubah juga durasi 8s di CSS agar tetap sinkron.
*/
const STEP_INTERVAL = 1.6;

// Benang menjuntai dari titik 1 -> 4 (x = 0, 333, 667, 1000 di viewBox)
const WIRE_PATH =
  "M0 40 C 95 80, 238 80, 333.33 40 C 428 80, 571 80, 666.67 40 C 762 80, 905 80, 1000 40";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Analisis Kebutuhan",
    description:
      "Kami melakukan diskusi bersama sekolah untuk memahami kebutuhan sistem yang akan digunakan.",
  },
  {
    icon: Settings,
    step: "02",
    title: "Konfigurasi Sistem",
    description:
      "Tim kami menyesuaikan fitur, data sekolah, dan hak akses agar sesuai dengan kebutuhan institusi.",
  },
  {
    icon: MonitorSmartphone,
    step: "03",
    title: "Implementasi",
    description:
      "Sistem mulai diterapkan dan seluruh data sekolah dimigrasikan secara aman ke platform Smart School.",
  },
  {
    icon: GraduationCap,
    step: "04",
    title: "Training & Pendampingan",
    description:
      "Guru dan staf mendapatkan pelatihan penggunaan sistem serta pendampingan hingga siap digunakan.",
  },
];

export default function Implementation() {
  return (
    <section className="bg-white py-24">
      <style>{`
        /* ---------- Arus di benang (desktop) ---------- */
        .impl-fill {
          fill: none;
          stroke: #2563eb;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-dasharray: 0 2000;
          opacity: 0;
          animation: impl-fill 8s linear infinite;
        }

        .impl-glow,
        .impl-mid,
        .impl-core,
        .impl-head {
          fill: none;
          opacity: 0;
        }

        .impl-glow {
          stroke: #60a5fa;
          stroke-opacity: 0.3;
          stroke-width: 10;
          stroke-dasharray: 170 2000;
          animation: impl-glow 8s linear infinite;
        }

        .impl-mid {
          stroke: #3b82f6;
          stroke-opacity: 0.65;
          stroke-width: 5;
          stroke-dasharray: 110 2000;
          animation: impl-mid 8s linear infinite;
        }

        .impl-core {
          stroke: #1d4ed8;
          stroke-width: 2.8;
          stroke-dasharray: 50 2000;
          animation: impl-core 8s linear infinite;
        }

        .impl-head {
          stroke: #ffffff;
          stroke-width: 3.5;
          stroke-linecap: round;
          stroke-dasharray: 5 2000;
          filter: drop-shadow(0 0 5px #2563eb) drop-shadow(0 0 10px #3b82f6);
          animation: impl-head 8s linear infinite;
        }

        @keyframes impl-fill {
          0%   { stroke-dasharray: 0 2000; opacity: 0.9; }
          70%  { stroke-dasharray: 1170 2000; opacity: 0.9; }
          88%  { stroke-dasharray: 1170 2000; opacity: 0; }
          100% { stroke-dasharray: 1170 2000; opacity: 0; }
        }

        @keyframes impl-glow {
          0%   { stroke-dashoffset: 170; opacity: 0; }
          2%   { opacity: 1; }
          66%  { opacity: 1; }
          70%  { stroke-dashoffset: -1000; opacity: 0; }
          100% { stroke-dashoffset: -1000; opacity: 0; }
        }

        @keyframes impl-mid {
          0%   { stroke-dashoffset: 110; opacity: 0; }
          2%   { opacity: 1; }
          66%  { opacity: 1; }
          70%  { stroke-dashoffset: -1060; opacity: 0; }
          100% { stroke-dashoffset: -1060; opacity: 0; }
        }

        @keyframes impl-core {
          0%   { stroke-dashoffset: 50; opacity: 0; }
          2%   { opacity: 1; }
          66%  { opacity: 1; }
          70%  { stroke-dashoffset: -1120; opacity: 0; }
          100% { stroke-dashoffset: -1120; opacity: 0; }
        }

        @keyframes impl-head {
          0%   { stroke-dashoffset: 5; opacity: 0; }
          2%   { opacity: 1; }
          66%  { opacity: 1; }
          70%  { stroke-dashoffset: -1165; opacity: 0; }
          100% { stroke-dashoffset: -1165; opacity: 0; }
        }

        /* ---------- Titik & kartu menyala saat dialiri ---------- */
        .impl-node {
          animation: impl-node 8s ease-in-out infinite;
        }

        @keyframes impl-node {
          0% {
            background-color: #ffffff;
            border-color: #e2e8f0;
            color: #64748b;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
            transform: scale(1);
          }
          3% {
            background-color: #2563eb;
            border-color: #2563eb;
            color: #ffffff;
            box-shadow: 0 0 0 7px rgba(37, 99, 235, 0.18),
              0 0 30px rgba(37, 99, 235, 0.55);
            transform: scale(1.08);
          }
          10% {
            background-color: #2563eb;
            border-color: #2563eb;
            color: #ffffff;
            box-shadow: 0 0 0 12px rgba(37, 99, 235, 0),
              0 0 20px rgba(37, 99, 235, 0.35);
            transform: scale(1);
          }
          38% {
            background-color: #2563eb;
            border-color: #2563eb;
            color: #ffffff;
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0),
              0 8px 20px rgba(37, 99, 235, 0.25);
            transform: scale(1);
          }
          52%, 100% {
            background-color: #ffffff;
            border-color: #e2e8f0;
            color: #64748b;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
            transform: scale(1);
          }
        }

        .impl-card {
          animation: impl-card 8s ease-in-out infinite;
        }

        @keyframes impl-card {
          0%, 52%, 100% {
            border-color: #e2e8f0;
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
          6%, 30% {
            border-color: #93c5fd;
            box-shadow: 0 14px 34px -14px rgba(37, 99, 235, 0.35);
          }
        }

        /* ---------- Arus di benang (mobile, vertikal) ---------- */
        .impl-seg-spark {
          position: absolute;
          left: 50%;
          top: 0;
          height: 44px;
          width: 3px;
          border-radius: 9999px;
          transform: translateX(-50%);
          background: linear-gradient(to bottom, transparent, #3b82f6 60%, #1d4ed8);
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);
          opacity: 0;
          animation: impl-seg 8s linear infinite;
        }

        @keyframes impl-seg {
          0%    { top: -44px; opacity: 0; }
          1.5%  { opacity: 1; }
          17%   { top: 100%; opacity: 1; }
          19%   { top: 100%; opacity: 0; }
          100%  { top: 100%; opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .impl-fill,
          .impl-glow,
          .impl-mid,
          .impl-core,
          .impl-head,
          .impl-node,
          .impl-card,
          .impl-seg-spark {
            animation: none !important;
          }

          .impl-node {
            background-color: #2563eb;
            border-color: #2563eb;
            color: #ffffff;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            <span className="h-px w-8 bg-blue-600" />
            <Zap size={14} fill="currentColor" />
            Tahapan Implementasi
            <span className="h-px w-8 bg-blue-600" />
          </p>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Proses Implementasi{" "}
            <span className="text-blue-600">Smart School</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Kami memastikan proses implementasi berjalan cepat, terstruktur,
            dan didampingi oleh tim profesional agar sekolah dapat langsung
            menggunakan Smart School tanpa kendala.
          </p>
        </div>

        <div className="relative mt-20">
          {/* Benang + arus listrik (desktop) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 80"
            preserveAspectRatio="none"
            className="pointer-events-none absolute top-0 hidden h-20 overflow-visible lg:block"
            style={{ left: "calc(12.5% - 12px)", width: "calc(75% + 24px)" }}
          >
            {/* benang dasar */}
            <path
              d={WIRE_PATH}
              pathLength="1000"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* jejak yang teraliri */}
            <path d={WIRE_PATH} pathLength="1000" className="impl-fill" />
            {/* percikan arus */}
            <path d={WIRE_PATH} pathLength="1000" className="impl-glow" />
            <path d={WIRE_PATH} pathLength="1000" className="impl-mid" />
            <path d={WIRE_PATH} pathLength="1000" className="impl-core" />
            <path d={WIRE_PATH} pathLength="1000" className="impl-head" />
          </svg>

          <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-8">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === steps.length - 1;
              const nodeDelay = `${(index * STEP_INTERVAL - 0.2).toFixed(2)}s`;
              const segDelay = `${(index * STEP_INTERVAL).toFixed(2)}s`;

              return (
                <li
                  key={item.step}
                  className="relative flex items-start gap-5 lg:flex-col lg:items-center lg:gap-0"
                >
                  {/* Benang vertikal (mobile) */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-10 left-8 top-16 w-px -translate-x-1/2 bg-slate-200 lg:hidden"
                    >
                      <span
                        className="impl-seg-spark"
                        style={{ animationDelay: segDelay }}
                      />
                    </span>
                  )}

                  {/* Titik */}
                  <div
                    className="impl-node relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-500 shadow-sm lg:h-20 lg:w-20"
                    style={{ animationDelay: nodeDelay }}
                  >
                    <Icon size={28} strokeWidth={1.75} />
                  </div>

                  {/* Kabel kecil penghubung titik -> kartu (desktop) */}
                  <span
                    aria-hidden="true"
                    className="hidden h-8 w-px bg-slate-200 lg:block"
                  />

                  {/* Kartu */}
                  <div
                    className="impl-card relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 lg:w-full lg:flex-none lg:p-7 lg:text-center"
                    style={{ animationDelay: nodeDelay }}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-5 -right-1 select-none text-8xl font-black leading-none text-slate-50"
                    >
                      {item.step}
                    </span>

                    <div className="relative">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                        Langkah {item.step}
                      </span>

                      <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-[15px] leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}