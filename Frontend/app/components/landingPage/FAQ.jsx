"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

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
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 border border-blue-100">
            <HelpCircle size={15} />
            FAQ
          </span>

          <h2 className="mt-5 text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Pertanyaan yang{" "}
            <span className="text-blue-600">Sering Ditanyakan</span>
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-gray-500 text-sm leading-7">
            Temukan jawaban atas pertanyaan yang paling sering diajukan
            mengenai Smart School.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">

          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div
                key={index}
                className={`
                  rounded-xl border transition-all duration-300 bg-white
                  ${isOpen 
                    ? 'border-blue-200 shadow-md shadow-blue-100/50' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }
                `}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  {/* Nomor urut */}
                  <span className={`
                    flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${isOpen 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-400'
                    }
                  `}>
                    {index + 1}
                  </span>

                  <span className={`
                    flex-1 text-sm md:text-base font-semibold transition-colors duration-300
                    ${isOpen ? 'text-slate-900' : 'text-slate-700'}
                  `}>
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`
                      flex-shrink-0 w-4 h-4 transition-transform duration-300
                      ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}
                    `}
                  />
                </button>

                {/* Answer */}
                <div
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? 'max-h-96' : 'max-h-0'}
                  `}
                >
                  <div className="px-5 pb-5 pl-14 pr-5">
                    <p className="text-sm text-gray-500 leading-7 border-l-2 border-blue-200 pl-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-sm text-slate-500">
            Masih ada pertanyaan?{" "}
            <a href="#" className="text-blue-600 font-semibold hover:underline">
              Hubungi Kami
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}