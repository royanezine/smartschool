"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Quote,
  Star,
  MessageSquareQuote,
  AlertCircle,
  BadgeCheck,
  Sparkles,
  Users,
  ThumbsUp,
} from "lucide-react";
import { getPublicReviews } from "@/services/review.service";

const HEADER_SPACE = "px-6 sm:px-10 lg:px-16 xl:px-20";

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

function getInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StarRating({ rating = 5, featured = false, size = 15 }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating ${value} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(value) ? "currentColor" : "none"}
          className={
            star <= Math.round(value)
              ? "text-amber-400"
              : featured
                ? "text-white/30"
                : "text-slate-300"
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ item, featured = false }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const px = useMotionValue(-200);
  const py = useMotionValue(-200);

  const sx = useSpring(x, { stiffness: 260, damping: 24 });
  const sy = useSpring(y, { stiffness: 260, damping: 24 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-6, 6]);

  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${px}px ${py}px, ${
    featured ? "rgba(255,255,255,0.22)" : "rgba(37,99,235,0.10)"
  }, transparent 70%)`;

  const handleMouseMove = (event) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    x.set(mx / rect.width - 0.5);
    y.set(my / rect.height - 0.5);
    px.set(mx);
    py.set(my);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    px.set(-200);
    py.set(-200);
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
      className={`group relative flex h-full min-h-[260px] w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border p-6 transition-shadow duration-300 sm:w-[360px] sm:p-7 ${
        featured
          ? "border-blue-500/40 bg-blue-600 text-white shadow-lg shadow-blue-600/15 hover:shadow-2xl hover:shadow-blue-600/30"
          : "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
      }`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />

      {featured && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "linear-gradient(135deg, transparent 40%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(135deg, transparent 40%, black 100%)",
          }}
        />
      )}

      <Quote
        size={featured ? 64 : 52}
        aria-hidden="true"
        className={`absolute -right-1 -top-1 rotate-6 ${
          featured ? "text-white/10" : "text-blue-50"
        }`}
      />

      <div className="relative z-10 flex items-center justify-between">
        <StarRating rating={item.rating} featured={featured} />
        <span
          className={`text-xs font-semibold tabular-nums ${
            featured ? "text-white/70" : "text-slate-400"
          }`}
        >
          {item.rating.toFixed(1)}
        </span>
      </div>

      <p
        className={`relative z-10 mt-5 line-clamp-5 flex-1 break-words text-[15px] leading-7 ${
          featured ? "text-blue-50" : "text-slate-600"
        }`}
      >
        &ldquo;{item.text}&rdquo;
      </p>

      <div
        className={`relative z-10 mt-6 flex items-center gap-3 border-t pt-5 ${
          featured ? "border-white/20" : "border-slate-100"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            featured
              ? "bg-white/15 text-white ring-1 ring-white/30"
              : "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
          }`}
        >
          {getInitials(item.name)}
        </div>

        <div className="min-w-0">
          <h3
            className={`flex items-center gap-1.5 truncate text-sm font-semibold ${
              featured ? "text-white" : "text-slate-900"
            }`}
          >
            <span className="truncate">{item.name}</span>
            <BadgeCheck
              size={15}
              className={`shrink-0 ${
                featured ? "text-blue-100" : "text-blue-600"
              }`}
            />
          </h3>
          <p
            className={`mt-0.5 truncate text-xs ${
              featured ? "text-blue-100/80" : "text-slate-500"
            }`}
          >
            {item.role}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function ReviewMarquee({
  items,
  direction = "left",
  duration = 40,
  featured = false,
}) {
  if (!items.length) return null;

  let base = items;
  while (base.length < 8) {
    base = [...base, ...items];
  }

  const repeatedItems = [...base, ...base];
  const animationClass =
    direction === "right" ? "review-marquee-right" : "review-marquee-left";

  return (
    <div className="review-marquee-wrapper relative w-full overflow-hidden py-6">
      <div
        className={`review-marquee-track ${animationClass}`}
        style={{ "--marquee-duration": `${duration}s` }}
      >
        {repeatedItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className="shrink-0 px-3">
            <ReviewCard item={item} featured={featured} />
          </div>
        ))}
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 16 },
  },
};

function RatingSummary({ testimonials, averageRating }) {
  const total = testimonials.length;
  const satisfied = testimonials.filter((item) => item.rating >= 4).length;
  const satisfiedPercent =
    total > 0 ? Math.round((satisfied / total) * 100) : 0;
  const avatars = testimonials.slice(0, 5);

  const stats = [
    {
      icon: Star,
      value: averageRating.toFixed(1),
      label: "Rata-rata rating",
      iconBox: "bg-amber-50 text-amber-500 ring-amber-100",
      fill: true,
    },
    {
      icon: Users,
      value: total,
      label: "Ulasan terverifikasi",
      iconBox: "bg-blue-50 text-blue-600 ring-blue-100",
      fill: false,
    },
    {
      icon: ThumbsUp,
      value: `${satisfiedPercent}%`,
      label: "Pengguna puas",
      iconBox: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      fill: false,
    },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <motion.div
        variants={popIn}
        initial="hidden"
        animate="visible"
        className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-5 shadow-sm"
      >
        <div className="flex -space-x-2">
          {avatars.map((item) => (
            <div
              key={item.id}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-700 ring-2 ring-white"
            >
              {getInitials(item.name)}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start leading-tight">
          <StarRating rating={averageRating} size={13} />
          <span className="mt-0.5 text-[11px] font-medium text-slate-500">
            Dipercaya oleh {total} pengguna
          </span>
        </div>
      </motion.div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, value, label, iconBox, fill }) => (
          <motion.div
            key={label}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 ${iconBox}`}
            >
              <Icon size={22} fill={fill ? "currentColor" : "none"} />
            </div>

            <div>
              <p className="text-2xl font-bold leading-none tracking-tight text-slate-900 tabular-nums">
                {value}
              </p>
              <p className="mt-1.5 text-xs text-slate-500">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Testimonial() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

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

      if (mountedRef.current) {
        setTestimonials(normalizedReviews);
      }
    } catch (err) {
      console.error("Gagal memuat testimoni publik:", err);

      if (mountedRef.current) {
        setTestimonials([]);
        setError(
          err?.message || "Testimoni gagal dimuat. Silakan coba lagi."
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadReviews();

    return () => {
      mountedRef.current = false;
    };
  }, [loadReviews]);

  const firstRow = testimonials.filter((_, index) => index % 2 === 0);
  const secondRow = testimonials.filter((_, index) => index % 2 !== 0);
  const rowTwo = secondRow.length > 0 ? secondRow : firstRow;

  const hasData = !loading && !error && testimonials.length > 0;

  const averageRating =
    testimonials.length > 0
      ? testimonials.reduce((total, item) => total + item.rating, 0) /
        testimonials.length
      : 0;

  return (
    <section className="relative isolate w-full overflow-hidden bg-white py-20 sm:py-24">
      <style>{`
        .review-marquee-wrapper {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }

        .review-marquee-track {
          display: flex;
          width: max-content;
          animation-duration: var(--marquee-duration, 40s);
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

        @keyframes review-scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes review-scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        .review-float {
          animation: review-float 5s ease-in-out infinite;
        }

        .review-float-delay {
          animation-delay: -2.5s;
        }

        @keyframes review-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .review-marquee-track,
          .review-float {
            animation: none !important;
          }
        }
      `}</style>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.05 },
          },
        }}
        className={`relative mx-auto mb-4 flex max-w-7xl flex-col items-center gap-9 text-center sm:mb-6 ${HEADER_SPACE}`}
      >
        {/* Floating decorative chips (desktop only) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-6 top-2 hidden -rotate-6 xl:block 2xl:left-16"
        >
          <motion.div variants={popIn}>
            <div className="review-float flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-blue-600/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Quote size={18} fill="currentColor" />
              </div>
              <div className="text-left">
                <StarRating rating={5} size={12} />
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Ulasan nyata
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-24 hidden rotate-6 xl:block 2xl:right-16"
        >
          <motion.div variants={popIn}>
            <div className="review-float review-float-delay flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-blue-600/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <BadgeCheck size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold leading-none text-slate-900">
                  Terverifikasi
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Disetujui Super Admin
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-24 top-64 hidden xl:block 2xl:left-48"
        >
          <motion.div variants={popIn}>
            <div className="review-float review-float-delay flex h-12 w-12 items-center justify-center rounded-full border border-amber-100 bg-white text-amber-400 shadow-lg shadow-amber-500/10">
              <Star size={20} fill="currentColor" />
            </div>
          </motion.div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-28 top-3 hidden xl:block 2xl:right-52"
        >
          <motion.div variants={popIn}>
            <div className="review-float flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-500 shadow-lg shadow-blue-600/10">
              <Sparkles size={18} />
            </div>
          </motion.div>
        </div>

        {/* Title block */}
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            Testimoni Pengguna
            <Sparkles size={14} className="text-blue-500" />
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="mt-7 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Apa kata pengguna{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="text-blue-600">SmartSchool?</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-blue-500/60"
              >
                <path
                  d="M2 8 C 40 2, 70 2, 110 7 S 190 12, 230 6 S 280 3, 298 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-8 max-w-xl text-base leading-8 text-slate-600 sm:text-lg"
          >
            Pengalaman nyata dari para pengguna yang telah berbagi{" "}
            <span className="font-semibold text-slate-800">ulasan</span>{" "}
            tentang penggunaan SmartSchool.
          </motion.p>
        </div>

        {hasData && (
          <RatingSummary
            testimonials={testimonials}
            averageRating={averageRating}
          />
        )}
      </motion.div>

      {loading ? (
        <div
          className="relative flex min-h-48 items-center justify-center gap-3 px-5 text-sm text-slate-500"
          role="status"
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Memuat testimoni pengguna...
        </div>
      ) : error ? (
        <div
          className="relative mx-auto flex max-w-xl items-start justify-center gap-3 px-5 py-10 text-center text-sm text-red-700"
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
        <div className="relative flex w-full flex-col gap-2">
          <ReviewMarquee
            items={firstRow}
            direction="left"
            duration={45}
            featured
          />
          <ReviewMarquee items={rowTwo} direction="right" duration={50} />
        </div>
      ) : (
        <div className="relative mx-auto max-w-xl px-5 py-12 text-center">
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