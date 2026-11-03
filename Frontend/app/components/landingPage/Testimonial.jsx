"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Quote, Star, MessageSquareQuote, AlertCircle } from "lucide-react";
import { getPublicReviews } from "@/services/review.service";

function normalizeReview(review) {
  if (!review || !review.id) return null;

  const komentar =
    typeof review.komentar === "string" ? review.komentar.trim() : "";

  if (!komentar) return null;

  const pengguna = review.pengguna ?? {};

  const nama =
    pengguna.namaLengkap?.trim?.() ||
    pengguna.nama?.trim?.() ||
    "Pengguna SmartSchool";

  const role =
    pengguna.jabatan?.trim?.() ||
    pengguna.peran?.namaTampilan?.trim?.() ||
    pengguna.peran?.nama?.trim?.() ||
    "Pengguna SmartSchool";

  const ratingNumber = Number(review.rating);
  const rating = Number.isFinite(ratingNumber)
    ? Math.max(1, Math.min(5, ratingNumber))
    : 5;

  return {
    id: review.id,
    name: nama,
    role,
    rating,
    text: komentar,
    createdAt: review.dibuatPada ?? null,
  };
}

function StarRating({ rating = 5 }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${value} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= value ? "currentColor" : "none"}
          className={
            star <= value ? "text-amber-400" : "text-slate-300"
          }
        />
      ))}
    </div>
  );
}

function PremiumCard({ item, featured = false }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, {
    stiffness: 400,
    damping: 40,
  });

  const mouseYSpring = useSpring(y, {
    stiffness: 400,
    damping: 40,
  });

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["5deg", "-5deg"]
  );

  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-5deg", "5deg"]
  );

  const handleMouseMove = (event) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative flex h-full min-h-[250px] flex-col overflow-hidden border transition-shadow duration-300 ${
        featured
          ? "w-[310px] shrink-0 rounded-2xl border-blue-500/30 bg-blue-600 p-6 text-white shadow-lg shadow-blue-900/10 sm:w-[390px] sm:p-8"
          : "w-[280px] shrink-0 rounded-xl border-slate-200 bg-white p-5 shadow-sm hover:shadow-md sm:w-[340px] sm:p-6"
      }`}
    >
      <Quote
        size={featured ? 58 : 42}
        aria-hidden="true"
        className={`absolute right-4 top-4 ${
          featured ? "text-white/10" : "text-blue-50"
        }`}
        style={{ transform: "translateZ(15px)" }}
      />

      <div
        className="relative z-10"
        style={{ transform: "translateZ(25px)" }}
      >
        <StarRating rating={item.rating} />
      </div>

      <p
        className={`relative z-10 mt-5 flex-1 break-words text-sm leading-7 ${
          featured ? "text-blue-50 sm:text-base" : "text-slate-600"
        }`}
        style={{ transform: "translateZ(15px)" }}
      >
        &ldquo;{item.text}&rdquo;
      </p>

      <div
        className={`relative z-10 mt-6 border-t pt-4 ${
          featured ? "border-white/20" : "border-slate-100"
        }`}
        style={{ transform: "translateZ(20px)" }}
      >
        <h3
          className={`break-words text-sm font-semibold ${
            featured ? "text-white" : "text-slate-900"
          }`}
        >
          {item.name}
        </h3>

        <p
          className={`mt-1 text-xs ${
            featured ? "text-blue-200" : "text-slate-500"
          }`}
        >
          {item.role}
        </p>
      </div>
    </motion.article>
  );
}

function ReviewMarquee({
  items,
  direction = "left",
  duration = 25,
  featured = false,
}) {
  if (!items.length) return null;

  // Menggandakan item agar loop animasi tidak putus
  const repeatedItems = [...items, ...items, ...items, ...items];
  const animationClass =
    direction === "right"
      ? "review-marquee-right"
      : "review-marquee-left";

  return (
    <div className="review-marquee-wrapper group relative w-full overflow-hidden py-4">
      <div
        className={`review-marquee-track ${animationClass}`}
        style={{ "--marquee-duration": `${duration}s` }}
      >
        {repeatedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="shrink-0 px-3 [transform-style:preserve-3d]"
          >
            <PremiumCard item={item} featured={featured} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Testimonial() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPublicReviews({
        page: 1,
        limit: 100,
      });

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal mengambil data testimoni."
        );
      }

      const rawReviews = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      const normalizedReviews = rawReviews
        .map(normalizeReview)
        .filter(Boolean);

      setTestimonials(normalizedReviews);
    } catch (err) {
      console.error("Gagal memuat testimoni publik:", err);
      setTestimonials([]);
      setError(
        err?.message || "Testimoni gagal dimuat. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchReviews() {
      setLoading(true);
      setError("");

      try {
        const response = await getPublicReviews({
          page: 1,
          limit: 100,
        });

        if (response?.success === false) {
          throw new Error(
            response.message || "Gagal mengambil data testimoni."
          );
        }

        const rawReviews = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

        const normalizedReviews = rawReviews
          .map(normalizeReview)
          .filter(Boolean);

        if (active) {
          setTestimonials(normalizedReviews);
        }
      } catch (err) {
        console.error("Gagal memuat testimoni publik:", err);

        if (active) {
          setTestimonials([]);
          setError(
            err?.message || "Testimoni gagal dimuat. Silakan coba lagi."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchReviews();

    return () => {
      active = false;
    };
  }, []);

  const firstRow = testimonials.filter((_, index) => index % 2 === 0);
  const secondRow = testimonials.filter((_, index) => index % 2 !== 0);

  const rowTwo =
    secondRow.length > 0
      ? secondRow
      : firstRow.length > 0
        ? firstRow
        : [];

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
      <style>{`
        .review-marquee-wrapper {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 8%,
            black 92%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 8%,
            black 92%,
            transparent
          );
        }

        .review-marquee-track {
          display: flex;
          width: max-content;
          animation-duration: var(--marquee-duration, 25s);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        .review-marquee-left {
          animation-name: review-scroll-left;
        }

        .review-marquee-right {
          animation-name: review-scroll-right;
        }

        /* Berhenti saat di-hover agar pengguna bisa membaca */
        .review-marquee-wrapper:hover .review-marquee-track {
          animation-play-state: paused;
        }

        @keyframes review-scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes review-scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .review-marquee-track {
            animation-play-state: paused !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(#2563eb 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.1,
            },
          },
        }}
        className="relative z-10 mx-auto mb-10 max-w-7xl px-5 text-center sm:mb-14 sm:px-6"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5 },
            },
          }}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
            <MessageSquareQuote size={14} />
            Testimoni Pengguna
          </span>
        </motion.div>

        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5 },
            },
          }}
          className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
        >
          Apa Kata Pengguna{" "}
          <span className="text-blue-600">SmartSchool?</span>
        </motion.h2>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5 },
            },
          }}
          className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base"
        >
          Pengalaman nyata pengguna yang telah berbagi ulasan tentang
          penggunaan SmartSchool.
        </motion.p>
      </motion.div>

      {loading ? (
        <div
          className="relative z-10 flex min-h-48 items-center justify-center gap-3 px-5 text-sm text-slate-500"
          role="status"
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Memuat testimoni pengguna...
        </div>
      ) : error ? (
        <div
          className="relative z-10 mx-auto flex max-w-xl items-start justify-center gap-3 px-5 py-10 text-center text-sm text-red-700"
          role="alert"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p>{error}</p>
            <button
              type="button"
              onClick={loadReviews}
              className="mt-3 font-semibold underline underline-offset-4"
            >
              Coba lagi
            </button>
          </div>
        </div>
      ) : testimonials.length > 0 ? (
        <div
          className="relative z-10 flex flex-col gap-2"
          style={{ perspective: "1200px" }}
        >
          {/* Durasi dipercepat dari 45s menjadi 22s */}
          <ReviewMarquee
            items={firstRow}
            direction="left"
            duration={22}
            featured
          />

          {/* Durasi dipercepat dari 50s menjadi 26s */}
          <ReviewMarquee
            items={rowTwo}
            direction="right"
            duration={26}
          />
        </div>
      ) : (
        <div className="relative z-10 mx-auto max-w-xl px-5 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <MessageSquareQuote size={26} className="text-slate-400" />
          </div>

          <h3 className="font-semibold text-slate-800">
            Belum ada testimoni yang disetujui
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review dari pengguna akan ditampilkan setelah disetujui oleh
            Super Admin.
          </p>
        </div>
      )}
    </section>
  );
}