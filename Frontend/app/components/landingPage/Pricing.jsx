"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap,
  Rocket,
  Sparkles,
  Crown,
  Star,
  CircleCheck,
  Gem,
  Building2,
  Users,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import { getPaket } from "../../../services/paket.service";

export default function PricingSection() {
  const [paket, setPaket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // AMBIL DATA PAKET
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function loadPaket() {
      try {
        setLoading(true);
        setError("");

        const response = await getPaket();

        console.log("=================================");
        console.log("DATA PAKET DARI BACKEND:");
        console.log(response);
        console.log("=================================");

        if (!mounted) return;

        let data = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (Array.isArray(response?.data)) {
          data = response.data;
        }

        console.log("DATA PAKET SETELAH NORMALISASI:", data);

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

        console.log(
          "DATA PAKET FINAL UNTUK CARD:",
          normalizedData
        );

        setPaket(normalizedData);

        if (normalizedData.length === 0) {
          setError("Belum ada paket yang tersedia.");
        }
      } catch (err) {
        console.error("GAGAL MENGAMBIL PAKET:", err);

        if (!mounted) return;

        setPaket([]);

        setError(
          err?.message ||
            "Gagal mengambil data paket. Pastikan backend sedang berjalan."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPaket();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // FORMAT RUPIAH
  // ============================================================

  function formatRupiah(value) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "Rp0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "Rp0";
    }

    if (number === 0) {
      return "Gratis";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  }

  // ============================================================
  // PILIH PAKET
  // ============================================================

  function handlePilihPaket(item) {
    try {
      sessionStorage.setItem(
        "selected_paket_id",
        String(item.id)
      );

      sessionStorage.setItem(
        "selected_paket",
        JSON.stringify(item)
      );
    } catch (err) {
      console.error("Gagal menyimpan paket:", err);
    }

    window.location.href =
      `/onboarding/school?paketId=${encodeURIComponent(
        item.id
      )}`;
  }

  // ============================================================
  // THEME CARD
  // ============================================================

  const cardThemes = [
    {
      wrapper:
        "from-[#172554] via-[#123b87] to-[#0b1635]",
      border:
        "border-blue-300/20 hover:border-blue-200/50",
      icon:
        "border-blue-200/20 bg-blue-300/10 text-blue-200",
      button:
        "bg-white text-[#123b87] hover:bg-blue-50",
      check:
        "bg-blue-300/10 text-blue-200",
      glow:
        "bg-blue-500/30",
      accent:
        "from-blue-400 to-cyan-300",
    },
    {
      wrapper:
        "from-[#2563eb] via-[#1d4ed8] to-[#172554]",
      border:
        "border-blue-100/40 hover:border-white/70",
      icon:
        "border-white/20 bg-white/15 text-white",
      button:
        "bg-white text-[#1d4ed8] hover:bg-blue-50",
      check:
        "bg-white/15 text-white",
      glow:
        "bg-blue-400/40",
      accent:
        "from-white to-blue-200",
    },
    {
      wrapper:
        "from-[#075985] via-[#0e7490] to-[#083344]",
      border:
        "border-cyan-100/20 hover:border-cyan-100/50",
      icon:
        "border-cyan-100/20 bg-cyan-100/10 text-cyan-100",
      button:
        "bg-white text-[#075985] hover:bg-cyan-50",
      check:
        "bg-cyan-100/10 text-cyan-100",
      glow:
        "bg-cyan-500/30",
      accent:
        "from-cyan-300 to-blue-300",
    },
    {
      wrapper:
        "from-[#1e3a5f] via-[#19345b] to-[#0c1b33]",
      border:
        "border-blue-100/15 hover:border-blue-100/45",
      icon:
        "border-blue-100/15 bg-blue-100/10 text-blue-100",
      button:
        "bg-white text-[#183b68] hover:bg-blue-50",
      check:
        "bg-blue-100/10 text-blue-100",
      glow:
        "bg-blue-800/35",
      accent:
        "from-blue-300 to-indigo-300",
    },
  ];

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#f8fafc]
        py-20
        sm:py-24
        lg:py-32
      "
    >
      {/* ========================================================
          GLOBAL BACKGROUND
          ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main blue glow */}
        <div
          className="
            absolute
            -left-[220px]
            top-[100px]
            h-[620px]
            w-[620px]
            rounded-full
            bg-blue-300/20
            blur-[130px]
            animate-pulse
          "
        />

        <div
          className="
            absolute
            -right-[220px]
            top-[300px]
            h-[620px]
            w-[620px]
            rounded-full
            bg-indigo-300/20
            blur-[140px]
            animate-pulse
          "
        />

        <div
          className="
            absolute
            left-1/2
            top-[40%]
            h-[520px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-blue-100/40
            blur-[150px]
          "
        />

        {/* White top light */}
        <div
          className="
            absolute
            left-1/2
            top-[-150px]
            h-[420px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-white
            blur-[110px]
          "
        />

        {/* Decorative circles */}
        <div
          className="
            absolute
            left-[5%]
            top-[28%]
            h-24
            w-24
            rounded-full
            border
            border-blue-200/50
            bg-white/30
            backdrop-blur
          "
        />

        <div
          className="
            absolute
            right-[7%]
            top-[18%]
            h-16
            w-16
            rounded-full
            border
            border-blue-200/50
            bg-blue-100/20
          "
        />

        <div
          className="
            absolute
            bottom-[10%]
            left-[12%]
            h-10
            w-10
            rounded-full
            bg-blue-400/20
            blur-sm
          "
        />

        <div
          className="
            absolute
            bottom-[18%]
            right-[15%]
            h-20
            w-20
            rounded-full
            border
            border-indigo-200/40
            bg-indigo-100/20
          "
        />

        {/* Grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(#2563eb_1px,transparent_1px),linear-gradient(90deg,#2563eb_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        />
      </div>

      {/* ========================================================
          CONTENT
          ======================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-5
          sm:px-6
          lg:px-8
        "
      >
        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}

          <div className="mb-7 flex justify-center">
            <div
              className="
                group
                inline-flex
                items-center
                gap-2.5
                rounded-full
                border
                border-blue-200
                bg-white/90
                px-5
                py-2.5
                text-xs
                font-black
                text-blue-700
                shadow-[0_10px_35px_rgba(37,99,235,0.10)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-blue-300
                hover:shadow-[0_15px_40px_rgba(37,99,235,0.16)]
              "
            >
              <span
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-600
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                "
              >
                <Sparkles size={12} />
              </span>

              Solusi Digital Sekolah
            </div>
          </div>

          {/* Heading */}

          <h2
            className="
              text-4xl
              font-black
              leading-[1.05]
              tracking-[-0.055em]
              text-[#0b1220]
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Satu Platform.

            <span
              className="
                mt-2
                block
                bg-gradient-to-r
                from-[#172554]
                via-[#2563eb]
                to-[#38bdf8]
                bg-clip-text
                text-transparent
              "
            >
              Banyak Kemungkinan.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-7
              max-w-2xl
              text-sm
              leading-7
              text-slate-500
              sm:text-base
              sm:leading-8
            "
          >
            Pilih paket SmartSchool yang sesuai dengan kebutuhan
            sekolah Anda. Kelola akademik, administrasi,
            operasional, dan layanan sekolah dalam satu ekosistem
            digital yang modern.
          </p>
        </div>

        {/* ======================================================
            MINI FEATURES
            ====================================================== */}

        <div
          className="
            mt-10
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-3
            lg:mx-auto
            lg:max-w-3xl
          "
        >
          {[
            {
              icon: ShieldCheck,
              title: "Data Terintegrasi",
              text: "Terpusat & terkelola",
            },
            {
              icon: Zap,
              title: "Implementasi Mudah",
              text: "Siap digunakan sekolah",
            },
            {
              icon: Gem,
              title: "Paket Fleksibel",
              text: "Sesuaikan kebutuhan",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200/80
                  bg-white/80
                  px-4
                  py-3.5
                  text-left
                  shadow-sm
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-blue-200
                  hover:shadow-xl
                  hover:shadow-blue-100/50
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                    transition-all
                    duration-300
                    group-hover:scale-110
                    group-hover:bg-blue-600
                    group-hover:text-white
                  "
                >
                  <Icon size={18} />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-800">
                    {item.title}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ======================================================
            LOADING
            ====================================================== */}

        {loading && (
          <div className="mt-16 flex justify-center">
            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-7
                py-5
                shadow-[0_20px_60px_rgba(15,23,42,0.08)]
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                "
              >
                <Loader2
                  size={19}
                  className="animate-spin text-blue-600"
                />
              </div>

              <span className="text-sm font-semibold text-slate-500">
                Memuat paket SmartSchool...
              </span>
            </div>
          </div>
        )}

        {/* ======================================================
            ERROR
            ====================================================== */}

        {!loading && error && (
          <div
            className="
              mx-auto
              mt-16
              max-w-xl
              rounded-3xl
              border
              border-red-200
              bg-white
              p-1
              shadow-[0_20px_60px_rgba(15,23,42,0.08)]
            "
          >
            <div
              className="
                rounded-[22px]
                bg-red-50
                px-6
                py-7
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-100
                  text-red-600
                "
              >
                <ShieldCheck size={22} />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-bold
                  text-red-600
                "
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            PRICING CARDS
            ====================================================== */}

        {!loading && !error && paket.length > 0 && (
          <div
            className="
              mt-20
              grid
              grid-cols-1
              gap-8
              md:grid-cols-2
              lg:grid-cols-3
              lg:gap-7
              xl:gap-8
            "
          >
            {paket.map((item, index) => {
              const theme =
                cardThemes[index % cardThemes.length];

              const featuredIndex =
                paket.length >= 3 ? 1 : 0;

              const isFeatured =
                index === featuredIndex;

              const fitur = Array.isArray(item.fitur)
                ? item.fitur
                : [];

              return (
                <div
                  key={item.id || index}
                  className={`
                    group
                    relative
                    ${isFeatured ? "lg:-translate-y-5" : ""}
                  `}
                >
                  {/* ==================================================
                      OUTER GLOW
                      ================================================== */}

                  <div
                    className={`
                      pointer-events-none
                      absolute
                      -inset-4
                      rounded-[40px]
                      ${theme.glow}
                      opacity-20
                      blur-3xl
                      transition-all
                      duration-700
                      group-hover:opacity-60
                      group-hover:-inset-5
                    `}
                  />

                  {/* ==================================================
                      POPULAR BADGE
                      ================================================== */}

                  {isFeatured && (
                    <>
                      <div
                        className="
                          absolute
                          -top-5
                          left-1/2
                          z-40
                          -translate-x-1/2
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-blue-300/40
                            bg-[#0f172a]
                            px-5
                            py-2.5
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.18em]
                            text-white
                            shadow-[0_15px_45px_rgba(15,23,42,0.35)]
                          "
                        >
                          <Crown
                            size={13}
                            className="text-blue-300"
                          />

                          Paling Populer
                        </div>
                      </div>

                      {/* Floating stars */}

                      <Star
                        size={18}
                        className="
                          absolute
                          -right-2
                          top-12
                          z-30
                          animate-pulse
                          fill-blue-400
                          text-blue-400
                        "
                      />

                      <Sparkles
                        size={15}
                        className="
                          absolute
                          -left-3
                          top-24
                          z-30
                          animate-pulse
                          text-blue-400
                        "
                      />
                    </>
                  )}

                  {/* ==================================================
                      CARD
                      ================================================== */}

                  <div
                    className={`
                      relative
                      flex
                      min-h-[650px]
                      h-full
                      flex-col
                      overflow-hidden
                      rounded-[32px]
                      border
                      bg-gradient-to-br
                      ${theme.wrapper}
                      ${theme.border}
                      p-7
                      shadow-[0_25px_80px_rgba(15,23,42,0.20)]
                      transition-all
                      duration-500
                      ease-out
                      hover:-translate-y-3
                      hover:shadow-[0_40px_110px_rgba(15,23,42,0.30)]
                      sm:p-8
                    `}
                  >
                    {/* ==================================================
                        CARD DECORATION
                        ================================================== */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-24
                        -top-24
                        h-64
                        w-64
                        rounded-full
                        border
                        border-white/10
                        bg-white/[0.035]
                        transition-transform
                        duration-1000
                        group-hover:scale-125
                        group-hover:rotate-12
                      "
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-8
                        -top-8
                        h-32
                        w-32
                        rounded-full
                        border
                        border-white/[0.08]
                        transition-transform
                        duration-700
                        group-hover:scale-110
                      "
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -bottom-28
                        -left-28
                        h-64
                        w-64
                        rounded-full
                        border
                        border-white/[0.07]
                        bg-white/[0.02]
                        transition-transform
                        duration-1000
                        group-hover:scale-110
                      "
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-0
                        h-44
                        w-[80%]
                        -translate-x-1/2
                        rounded-full
                        bg-white/[0.08]
                        blur-[80px]
                        transition-all
                        duration-700
                        group-hover:bg-white/[0.14]
                      "
                    />

                    {/* Shine */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -left-[100%]
                        top-0
                        h-full
                        w-1/2
                        rotate-[20deg]
                        bg-gradient-to-r
                        from-transparent
                        via-white/[0.08]
                        to-transparent
                        transition-all
                        duration-1000
                        group-hover:left-[150%]
                      "
                    />

                    {/* ==================================================
                        CARD HEADER
                        ================================================== */}

                    <div
                      className="
                        relative
                        z-10
                        flex
                        items-start
                        justify-between
                      "
                    >
                      <div>
                        <div
                          className="
                            mb-3
                            flex
                            items-center
                            gap-2
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.22em]
                            text-white/40
                          "
                        >
                          <Building2 size={12} />

                          SmartSchool
                        </div>

                        <h3
                          className="
                            text-2xl
                            font-black
                            tracking-tight
                            text-white
                            sm:text-[26px]
                          "
                        >
                          {item.nama || "Paket SmartSchool"}
                        </h3>
                      </div>

                      <div
                        className={`
                          flex
                          h-13
                          w-13
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          backdrop-blur-md
                          transition-all
                          duration-500
                          group-hover:-translate-y-1
                          group-hover:rotate-6
                          group-hover:scale-110
                          ${theme.icon}
                        `}
                      >
                        {isFeatured ? (
                          <Crown size={22} />
                        ) : index === 0 ? (
                          <Rocket size={22} />
                        ) : (
                          <Gem size={22} />
                        )}
                      </div>
                    </div>

                    {/* ==================================================
                        PRICE
                        ================================================== */}

                    <div
                      className="
                        relative
                        z-10
                        mt-9
                      "
                    >
                      <p
                        className="
                          text-4xl
                          font-black
                          tracking-[-0.055em]
                          text-white
                          transition-transform
                          duration-500
                          group-hover:translate-x-1
                          sm:text-5xl
                        "
                      >
                        {formatRupiah(item.harga)}
                      </p>

                      {item.durasi && (
                        <div
                          className="
                            mt-3
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-white/[0.10]
                            bg-white/[0.06]
                            px-3.5
                            py-1.5
                            text-[10px]
                            font-semibold
                            text-white/60
                            backdrop-blur
                          "
                        >
                          <Zap size={11} />

                          Durasi {item.durasi} hari
                        </div>
                      )}
                    </div>

                    {/* ==================================================
                        DESCRIPTION
                        ================================================== */}

                    <p
                      className="
                        relative
                        z-10
                        mt-6
                        min-h-[82px]
                        text-sm
                        leading-6
                        text-white/60
                      "
                    >
                      {item.deskripsi ||
                        "Paket digitalisasi sekolah untuk mendukung kebutuhan akademik dan operasional secara terintegrasi."}
                    </p>

                    {/* ==================================================
                        BUTTON
                        ================================================== */}

                    <button
                      type="button"
                      onClick={() => handlePilihPaket(item)}
                      className={`
                        group/button
                        relative
                        z-10
                        mt-6
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2.5
                        overflow-hidden
                        rounded-2xl
                        px-5
                        py-4
                        text-sm
                        font-black
                        shadow-xl
                        shadow-black/10
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-2xl
                        active:scale-[0.97]
                        ${theme.button}
                      `}
                    >
                      <span className="relative z-10">
                        {Number(item.harga) === 0
                          ? "Mulai Uji Coba"
                          : "Pilih Paket"}
                      </span>

                      <ArrowRight
                        size={17}
                        className="
                          relative
                          z-10
                          transition-transform
                          duration-300
                          group-hover/button:translate-x-1
                        "
                      />

                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          -translate-x-full
                          bg-gradient-to-r
                          from-transparent
                          via-blue-100/40
                          to-transparent
                          transition-transform
                          duration-700
                          group-hover/button:translate-x-full
                        "
                      />
                    </button>

                    {/* ==================================================
                        DIVIDER
                        ================================================== */}

                    <div
                      className="
                        relative
                        z-10
                        my-7
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-white/15
                        to-transparent
                      "
                    />

                    {/* ==================================================
                        FEATURES HEADER
                        ================================================== */}

                    <div className="relative z-10">
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.2em]
                            text-white/40
                          "
                        >
                          Fitur yang tersedia
                        </p>

                        <div
                          className="
                            flex
                            items-center
                            gap-1
                            rounded-full
                            border
                            border-white/10
                            bg-white/[0.05]
                            px-2.5
                            py-1
                            text-[9px]
                            font-bold
                            text-white/40
                          "
                        >
                          <CircleCheck size={11} />

                          {fitur.length} fitur
                        </div>
                      </div>

                      {/* ==================================================
                          FEATURES
                          ================================================== */}

                      <div className="mt-5 space-y-3.5">
                        {fitur.length > 0 ? (
                          fitur.map(
                            (fiturItem, fiturIndex) => (
                              <div
                                key={
                                  fiturItem?.id ||
                                  `${item.id}-${fiturIndex}`
                                }
                                className="
                                  group/feature
                                  flex
                                  items-start
                                  gap-3
                                  transition-all
                                  duration-300
                                  hover:translate-x-1
                                "
                              >
                                <div
                                  className={`
                                    mt-0.5
                                    flex
                                    h-5
                                    w-5
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    ${theme.check}
                                    transition-all
                                    duration-300
                                    group-hover/feature:scale-110
                                  `}
                                >
                                  <Check
                                    size={11}
                                    strokeWidth={3}
                                  />
                                </div>

                                <span
                                  className="
                                    text-sm
                                    leading-5
                                    text-white/70
                                    transition-colors
                                    duration-300
                                    group-hover/feature:text-white
                                  "
                                >
                                  {fiturItem?.nama ||
                                    fiturItem?.name ||
                                    "Fitur tersedia"}
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-sm text-white/35">
                            Fitur paket belum tersedia.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ==================================================
                        BOTTOM INFO
                        ================================================== */}

                    <div
                      className="
                        relative
                        z-10
                        mt-auto
                        pt-7
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          border-t
                          border-white/[0.08]
                          pt-5
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            text-[10px]
                            font-semibold
                            text-white/35
                          "
                        >
                          <ShieldCheck size={14} />

                          Sistem aman
                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-1
                            text-[10px]
                            font-semibold
                            text-white/35
                          "
                        >
                          Terintegrasi

                          <ChevronRight size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================
            BOTTOM TRUST STRIP
            ====================================================== */}

        {!loading && !error && paket.length > 0 && (
          <div
            className="
              mx-auto
              mt-16
              max-w-5xl
              overflow-hidden
              rounded-[28px]
              border
              border-blue-100
              bg-white/85
              shadow-[0_20px_70px_rgba(37,99,235,0.08)]
              backdrop-blur-xl
            "
          >
            <div
              className="
                grid
                grid-cols-1
                divide-y
                divide-slate-100
                sm:grid-cols-3
                sm:divide-x
                sm:divide-y-0
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-4
                  px-6
                  py-5
                  sm:px-7
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <Users size={19} />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-800">
                    Multi Role
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Admin, guru & siswa
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-4
                  px-6
                  py-5
                  sm:px-7
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <BookOpen size={19} />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-800">
                    Akademik Terpusat
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Semua kebutuhan sekolah
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-4
                  px-6
                  py-5
                  sm:px-7
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-800">
                    Aman & Terintegrasi
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Data tersimpan terstruktur
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            CONSULTATION
            ====================================================== */}

        <div className="mt-16 text-center sm:mt-20">
          <p className="text-sm text-slate-500">
            Masih bingung menentukan paket yang tepat?
          </p>

          <button
            type="button"
            className="
              group
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-slate-200
              bg-white
              px-6
              py-3
              text-sm
              font-bold
              text-slate-700
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-blue-200
              hover:text-blue-700
              hover:shadow-xl
              hover:shadow-blue-100
              active:scale-95
            "
          >
            Konsultasi dengan tim kami

            <ArrowRight
              size={15}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>
        </div>
      </div>
    </section>
  );
}