"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "Apa itu Smart School?",
      answer:
        "Smart School adalah platform manajemen sekolah yang membantu mengelola akademik, administrasi, keuangan, absensi, hingga komunikasi dalam satu sistem terintegrasi.",
    },
    {
      question: "Apakah Smart School dapat digunakan untuk semua jenjang?",
      answer:
        "Ya. Smart School dapat digunakan untuk SD, SMP, SMA, maupun SMK dengan fitur yang disesuaikan pada setiap jenjang pendidikan.",
    },
    {
      question: "Apakah data sekolah aman?",
      answer:
        "Tentu. Seluruh data disimpan menggunakan sistem keamanan modern dengan backup berkala sehingga keamanan data tetap terjaga.",
    },
    {
      question: "Apakah tersedia pelatihan penggunaan sistem?",
      answer:
        "Ya. Tim kami akan memberikan pelatihan kepada guru, staf administrasi, dan operator sekolah sebelum sistem digunakan.",
    },
    {
      question: "Bagaimana cara mendapatkan demo?",
      answer:
        "Silakan klik tombol 'Hubungi Kami' atau 'Minta Demo'. Tim kami akan segera menghubungi sekolah Anda.",
    },
  ];

  const [open, setOpen] = useState(0);

  return (
    <section className="relative bg-white overflow-hidden py-24">
      {/* 🌟 Background Dekoratif Premium (Sama seperti komponen lain) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute -top-16 -right-16 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 border border-blue-200/60 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm mb-4">
            <HelpCircle size={15} className="text-blue-500" />
            FAQ
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Pertanyaan yang{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Sering Ditanyakan
            </span>
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-slate-500 text-sm md:text-base leading-7">
            Temukan jawaban atas pertanyaan yang paling sering diajukan mengenai Smart School.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <motion.div
                key={index}
                layout
                className={`
                  relative group rounded-2xl border transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden
                  ${isOpen 
                    ? 'border-blue-300 shadow-xl shadow-blue-100/40' 
                    : 'border-slate-200/70 hover:border-slate-300 hover:shadow-md'
                  }
                `}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className="flex w-full items-center gap-4 p-4 md:p-6 text-left"
                >
                  {/* Nomor urut dengan animasi */}
                  <motion.div
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                      ${isOpen 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30' 
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                      }
                    `}
                  >
                    {index + 1}
                  </motion.div>

                  <span className={`
                    flex-1 text-sm md:text-base font-semibold transition-colors duration-300
                    ${isOpen ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'}
                  `}>
                    {faq.question}
                  </span>

                  {/* Animasi Chevron Halus */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronDown
                      className={`
                        flex-shrink-0 w-4 h-4 transition-colors duration-300
                        ${isOpen ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                      `}
                    />
                  </motion.div>
                </button>

                {/* Jawaban dengan Smooth Height Transition */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-6 pb-4 md:pb-6 pl-12 md:pl-[4.5rem]">
                        <div className="border-l-4 border-blue-500/50 pl-4 py-1 rounded-r-lg bg-blue-50/30">
                          <p className="text-sm text-slate-600 leading-7">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Footer dengan sentuhan lebih interaktif */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 p-6 rounded-2xl bg-slate-50/80 border border-slate-200/60 max-w-xl mx-auto backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <MessageCircle size={18} className="text-blue-500" />
            <p className="text-sm text-slate-600">
              Masih ada pertanyaan?{" "}
              <a href="#" className="text-blue-600 font-semibold hover:underline transition-colors">
                Hubungi Kami
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}