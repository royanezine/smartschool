"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap,
  Sparkles,
  Crown,
  Gem,
  Building2,
  Users,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CircleCheck,
  AlertCircle,
} from "lucide-react";

import { getPaket } from "@/services/paket.service";

export default function PricingSection() {
  const router = useRouter();
  const carouselRef = useRef(null);

  const [paket, setPaket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPaket() {
      try {
        setLoading(true);
        setError("");

        const response = await getPaket();

        if (!mounted) return;

        let data = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (Array.isArray(response?.data)) {
          data = response.data;
        }

        const normalizedData = data.map((item) => {
          let fitur = [];

          if (Array.isArray(item?.fitur)) {
            fitur = item.fitur;
          } else if (Array.isArray(item?.paketModul)) {
            fitur = item.paketModul
              .map((paketModul) => {
                if (paketModul?.modul) {
                  return {
                    id: paketModul.modul.id,
                    nama:
                      paketModul.modul.nama ||
                      paketModul.modul.name ||
                      "Fitur",
                  };
                }

                if (paketModul?.nama) {
                  return {
                    id: paketModul.id,
                    nama: paketModul.nama,
                  };
                }

                return null;
              })
              .filter(Boolean);
          }

          return {
            ...item,
            fitur,
          };
        });

        setPaket(normalizedData);

        if (normalizedData.length === 0) {
          setError("Belum ada paket yang tersedia saat ini.");
        }
      } catch (err) {
        console.error("Gagal mengambil data paket:", err);

        if (!mounted) return;

        setPaket([]);
        setError(
          err?.message ||
            "Paket belum dapat dimuat. Silakan coba beberapa saat lagi."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPaket();

    return () => {
      mounted = false;
    };
  }, []);

  function formatRupiah(value) {
    if (value === undefined || value === null || value === "") {
      return "Rp0";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) return "Rp0";
    if (number === 0) return "Gratis";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  }

  function handlePilihPaket(item) {
    if (!item?.id) return;

    router.push(
      `/daftar-sekolah?paketId=${encodeURIComponent(String(item.id))}`
    );
  }

  function scrollCarousel(direction) {
    const el = carouselRef.current;
    if (!el) return;

    const firstCard = el.querySelector("[data-pricing-card]");
    const cardWidth = firstCard?.getBoundingClientRect().width || 320;
    const gap = 20; // Gap disesuaikan dengan class gap-5

    el.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  }

  const cardThemes = [
    {
      icon: "bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700",
      button:
        "border border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
    },
    {
      icon: "bg-blue-100 text-blue-700 group-hover:scale-110",
      button: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100",
    },
    {
      icon: "bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 group-hover:text-indigo-800",
      button:
        "border border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
    },
    {
      icon: "bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700",
      button:
        "border border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
    },
  ];

  return (
    <section
      id="paket"
      className="relative overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-24"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm">
            <Sparkles size={14} />
            Solusi manajemen sekolah
          </div>

          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Semua kebutuhan sekolah,
            <span className="mt-2 block text-blue-600">
              dalam satu platform.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Kelola administrasi, data siswa, pembelajaran, dan aktivitas
            sekolah dengan lebih terstruktur. Pilih paket yang sesuai dengan
            kebutuhan sekolahmu.
          </p>
        </div>

        {/* Value propositions */}
        <div className="mx-auto mt-9 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Data terorganisir",
              description: "Informasi sekolah dalam satu sistem",
            },
            {
              icon: Zap,
              title: "Alur kerja efisien",
              description: "Kurangi pekerjaan administratif berulang",
            },
            {
              icon: Gem,
              title: "Pilihan fleksibel",
              description: "Paket sesuai kebutuhan sekolah",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Icon size={19} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section heading */}
        <div className="mt-14 flex flex-col gap-4 sm:mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              Pilihan paket
            </p>
           
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="mt-5 h-6 w-40 rounded bg-slate-100" />
                <div className="mt-6 h-10 w-36 rounded bg-slate-100" />
                <div className="mt-5 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-7 h-11 rounded-lg bg-slate-100" />
                <div className="mt-7 space-y-3">
                  {[1, 2, 3].map((feature) => (
                    <div
                      key={feature}
                      className="h-4 w-full rounded bg-slate-100"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error / empty state */}
        {!loading && error && (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle size={23} />
            </div>
            <h4 className="mt-4 font-semibold text-slate-900">
              Paket belum tersedia
            </h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          </div>
        )}

        {/* Pricing cards & Panah Kiri Kanan */}
        {!loading && !error && paket.length > 0 && (
          <div className="relative mt-7 group/carousel">
            
            {/* Tombol Panah Kiri (Mengapung) */}
            {paket.length > 1 && (
              <button
                type="button"
                onClick={() => scrollCarousel(-1)}
                aria-label="Paket sebelumnya"
                className="absolute -left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition-all duration-300 hover:scale-110 hover:border-blue-200 hover:text-blue-700 active:scale-95 md:flex lg:-left-5"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
            )}

            {/* Tombol Panah Kanan (Mengapung) */}
            {paket.length > 1 && (
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                aria-label="Paket berikutnya"
                className="absolute -right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition-all duration-300 hover:scale-110 hover:border-blue-200 hover:text-blue-700 active:scale-95 md:flex lg:-right-5"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            )}

            {/* Track Scroll */}
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-5 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {paket.map((item, index) => {
                const theme = cardThemes[index % cardThemes.length];
                const featuredIndex = paket.length >= 3 ? 1 : 0;
                const isFeatured = index === featuredIndex;
                const fitur = Array.isArray(item.fitur) ? item.fitur : [];
                const Icon = isFeatured ? Crown : index === 0 ? Building2 : Gem;

                return (
                  <article
                    key={item.id || index}
                    data-pricing-card
                    className={`group relative flex w-[min(88vw,350px)] shrink-0 snap-start flex-col rounded-2xl border bg-white p-6 transition-all duration-500 ease-out sm:w-[340px] sm:p-7 ${
                      isFeatured
                        ? "border-blue-300 shadow-lg shadow-blue-100/70 ring-1 ring-blue-100 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200/50"
                        : "border-slate-200 shadow-sm hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                    }`}
                  >
                    {/* Garis aksen atas saat dihover */}
                    <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 rounded-t-2xl bg-blue-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />

                    {isFeatured && (
                      <div className="absolute -top-3 left-6 z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
                          <Crown size={12} />
                          PAKET UNGGULAN
                        </span>
                      </div>
                    )}

                    {/* Package identity */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          <Building2 size={12} />
                          SmartSchool
                        </div>
                        <h4 className="mt-3 break-words text-xl font-bold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-blue-700">
                          {item.nama || "Paket SmartSchool"}
                        </h4>
                      </div>

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ease-out ${theme.icon}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-7 border-b border-slate-100 pb-6">
                      <p className="text-xs font-medium text-slate-500">
                        Harga paket
                      </p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                          {formatRupiah(item.harga)}
                        </span>
                      </div>

                      {item.durasi && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-300 group-hover:bg-blue-50 group-hover:text-blue-700">
                          <Zap size={13} className="text-blue-600 transition-transform duration-300 group-hover:scale-110" />
                          Masa aktif {item.durasi} hari
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mt-5 min-h-[60px] text-sm leading-6 text-slate-600">
                      {item.deskripsi ||
                        "Solusi praktis untuk membantu pengelolaan kegiatan dan administrasi sekolah."}
                    </p>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={() => handlePilihPaket(item)}
                      className={`group/btn mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition duration-200 active:scale-[0.98] ${theme.button}`}
                    >
                      {Number(item.harga) === 0
                        ? "Mulai secara gratis"
                        : "Pilih paket"}
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>

                    {/* Features */}
                    <div className="mt-7 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Fasilitas paket
                        </h5>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                          {fitur.length} fitur
                        </span>
                      </div>

                      {fitur.length > 0 ? (
                        <ul className="mt-4 space-y-3">
                          {fitur.map((fiturItem, fiturIndex) => (
                            <li
                              key={
                                fiturItem?.id || `${item.id}-${fiturIndex}`
                              }
                              className="flex items-start gap-2.5 transition-transform duration-300 hover:translate-x-1"
                            >
                              <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                <Check size={12} strokeWidth={2.8} />
                              </span>
                              <span className="break-words text-sm leading-5 text-slate-600">
                                {fiturItem?.nama ||
                                  fiturItem?.name ||
                                  "Fitur tersedia"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                          Informasi fasilitas untuk paket ini belum tersedia.
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-7 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck
                          size={15}
                          className="shrink-0 text-emerald-600"
                        />
                        Informasi paket ditampilkan secara transparan
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Trust information */}
        {!loading && !error && paket.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-200 pt-7 sm:grid-cols-3 sm:gap-5">
            {[
              {
                icon: Users,
                title: "Untuk seluruh tim sekolah",
                description: "Mendukung kebutuhan admin, guru, dan siswa.",
              },
              {
                icon: BookOpen,
                title: "Aktivitas lebih terstruktur",
                description: "Informasi dan pekerjaan sekolah lebih terorganisir.",
              },
              {
                icon: ShieldCheck,
                title: "Akses sesuai kewenangan",
                description: "Pengelolaan akses berdasarkan peran pengguna.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex items-start gap-3 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-slate-200">
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

       
      </div>
    </section>
  );
}