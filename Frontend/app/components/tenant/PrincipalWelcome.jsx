"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const theme = {
  primary: "var(--school-primary, #2563EB)",
  secondary: "var(--school-secondary, #64748B)",
  surface: "var(--school-surface, #FFFFFF)",
  background: "var(--school-background, #F8FAFC)",
  text: "var(--school-text, #0F172A)",
  border: "var(--school-border, #E2E8F0)",
};

function text(value) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function getField(item, ...keys) {
  for (const key of keys) {
    const value = text(item?.[key]);
    if (value) return value;
  }
  return "";
}

// Hook animasi scroll dengan Intersection Observer
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

export default function PrincipalWelcome({ item }) {
  const [ref, visible] = useReveal();

  if (!item) return null;

  const title = getField(item, "judul", "title", "nama", "heading");
  let subtitle = getField(item, "subJudul", "subjudul", "subtitle");
  const content = getField(item, "konten", "content", "deskripsi", "isi");
  const image = getField(item, "gambarUrl", "gambar", "gambarUtama", "imageUrl");
  const ctaText = getField(item, "ctaText", "teksTombol", "buttonText");
  const ctaLink = getField(item, "ctaLink", "tautan", "buttonLink");

  if (!(title || subtitle || content || image || ctaText)) {
    return null;
  }

  // Membersihkan subtitle ganda
  if (subtitle) {
    subtitle = subtitle.split(" — ")[0]; 
  }

  // Menggunakan inline style untuk mengatur delay animasi yang berurutan
  const getDelay = (ms) => ({
    transitionDelay: visible ? `${ms}ms` : "0ms",
  });

  return (
    <section
      ref={ref}
      id="sambutan-kepala-sekolah"
      className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      style={{ backgroundColor: theme.background }}
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* KARTU UTAMA (Floating Card dengan Drop Shadow Lebih Tebal) */}
        <div
          className={`group relative overflow-hidden rounded-2xl border bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-1000 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgb(0,0,0,0.12)] ${
            visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ borderColor: theme.border }}
        >
          {/* Efek Pantulan Cahaya (Shine) saat di hover */}
          <div className="pointer-events-none absolute inset-0 z-20 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />

          <div className="relative z-10 flex flex-col md:flex-row">
            
            {/* FOTO KEPALA SEKOLAH (Dengan Drop Shadow di bagian dalam) */}
            {image && (
              <div className="relative w-full shrink-0 overflow-hidden bg-slate-100 md:w-[320px] lg:w-[360px]">
                {/* Drop shadow di dalam gambar agar terkesan ada kedalaman */}
                <div className="absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-black/10 to-transparent hidden md:block" />
                
                <div 
                  className={`aspect-[4/3] h-full w-full md:absolute md:inset-0 md:aspect-auto transition-all duration-1000 ease-out ${
                    visible ? "scale-100 opacity-100" : "scale-105 opacity-0"
                  }`}
                  style={getDelay(100)}
                >
                  <img
                    src={image}
                    alt={title || "Kepala Sekolah"}
                    className="h-full w-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* TEKS SAMBUTAN (Staggered Animation) */}
            <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
              
              {/* Badge */}
              <div 
                className={`mb-3 transition-all duration-700 ease-out ${
                  visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={getDelay(200)}
              >
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700 sm:text-[11px] shadow-sm border border-blue-100/50">
                  Sambutan Kepala Sekolah
                </span>
              </div>

              {/* Judul */}
              {title && (
                <h2 
                  className={`break-words text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl lg:text-[28px] transition-all duration-700 ease-out ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={getDelay(300)}
                >
                  {title}
                </h2>
              )}

              {/* Subtitle / Nama */}
              {subtitle && (
                <div 
                  className={`mt-3 flex items-center gap-2 transition-all duration-700 ease-out ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={getDelay(400)}
                >
                  <span className="h-px w-6 shrink-0 bg-slate-300" />
                  <p className="break-words text-sm font-semibold text-slate-500">
                    {subtitle}
                  </p>
                </div>
              )}

              {/* Konten / Isi Sambutan */}
              {content && (
                <div 
                  className={`mt-5 max-h-[250px] overflow-y-auto pr-2 text-[14px] leading-relaxed text-slate-600 sm:max-h-none sm:overflow-visible sm:pr-0 sm:text-[15px] transition-all duration-700 ease-out ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={getDelay(500)}
                >
                  {content}
                </div>
              )}

              {/* Tombol CTA (Drop shadow lebih terlihat) */}
              {ctaText && ctaLink && (
                <div 
                  className={`mt-6 pt-2 transition-all duration-700 ease-out ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={getDelay(600)}
                >
                  <Link
                    href={ctaLink}
                    className="group/btn inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_8px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-blue-700 hover:shadow-[0_4px_12px_rgb(0,0,0,0.1)]"
                  >
                    {ctaText}
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    />
                  </Link>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}