"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote, Star } from "lucide-react";

export default function Testimonial() {
  const testimonials = [
    {
      name: "Dr. Andi Pratama",
      role: "Kepala Sekolah",
      image: "/testimonial/user1.jpg",
      text: "Smart School membuat pengelolaan administrasi sekolah menjadi jauh lebih cepat. Guru dan staf kini bekerja lebih efisien karena seluruh data sudah terintegrasi.",
      featured: true,
    },
    {
      name: "Siti Rahma",
      role: "Guru",
      image: "/testimonial/user2.jpg",
      text: "Penilaian, absensi, dan jadwal sekarang jauh lebih mudah dikelola. Sistemnya sangat membantu kegiatan belajar mengajar.",
    },
    {
      name: "Budi Santoso",
      role: "Orang Tua",
      image: "/testimonial/user3.jpg",
      text: "Saya bisa memantau perkembangan anak secara langsung tanpa harus datang ke sekolah. Sangat praktis.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section className="relative bg-white overflow-hidden py-24">
      
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute -top-16 -right-16 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 border border-blue-200/60 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Testimoni
          </span>

          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Apa Kata Pengguna{" "}
            <span className="text-blue-600">
              Smart School?
            </span>
          </h2>

          <p className="mt-4 text-slate-500 leading-7 max-w-xl mx-auto">
            Ribuan guru, kepala sekolah, dan orang tua telah merasakan kemudahan menggunakan Smart School.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-8 lg:grid-cols-3 items-stretch"
        >
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative lg:col-span-2 rounded-3xl p-10 bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.01] transition-all duration-300 overflow-hidden group"
          >
            <Quote
              size={140}
              className="absolute -top-4 -right-4 text-white/10 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700"
            />

            <div className="relative z-10 flex flex-col h-full">
              <p className="text-lg md:text-xl leading-9 font-light mb-8 flex-1">
                &ldquo;{testimonials[0].text}&rdquo;
              </p>

              <div className="flex gap-1 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Star size={20} fill="white" className="text-white drop-shadow-md" />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4 border-t border-white/20 pt-8">
                <div className="relative">
                  <Image
                    src={testimonials[0].image}
                    alt={testimonials[0].name}
                    width={60}
                    height={60}
                    className="rounded-full object-cover border-2 border-white/50 shadow-lg ring-2 ring-blue-500/30"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{testimonials[0].name}</h4>
                  <p className="text-blue-100/80 text-sm">{testimonials[0].role}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            {testimonials.slice(1).map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * (index + 1) }}
                className="group relative flex-1 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-blue-500 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="currentColor" className="group-hover:scale-110 transition-transform duration-200" />
                    ))}
                  </div>

                  <p className="text-sm leading-7 text-slate-600 flex-1">
                    &ldquo;{item.text}&rdquo;
                  </p>

                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100/80">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all"
                    />
                    <div>
                      <h5 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h5>
                      <p className="text-xs text-slate-400">{item.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}