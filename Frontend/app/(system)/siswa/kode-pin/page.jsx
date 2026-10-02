"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Delete,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

const DUMMY_PIN = "123456";

// ============================================================
// GLOBAL THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_22px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryHoverBorder =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]";

const themeCardShadow =
  "shadow-[0_18px_55px_color-mix(in_srgb,var(--color-text)_12%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralSurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralBorderStrong =
  "border-[color-mix(in_srgb,var(--color-text)_16%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeInfoText =
  "text-[var(--color-info)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]";

const themeSuccessText =
  "text-[var(--color-success)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeTextOnCard =
  "text-[var(--color-card)]";

const themeDisabledSurface =
  "disabled:bg-[var(--color-border)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// PAGE
// ============================================================

export default function KodePinSiswaPage() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  // ==========================================================
  // AUTO FOCUS
  // ==========================================================

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ==========================================================
  // NUMBER
  // ==========================================================

  const handleNumber = (number) => {
    if (loading || success) {
      return;
    }

    setError("");

    if (pin.length < 6) {
      setPin((prev) => prev + number);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = () => {
    if (loading || success) {
      return;
    }

    setError("");

    setPin((prev) => prev.slice(0, -1));
  };

  // ==========================================================
  // CLEAR
  // ==========================================================

  const handleClear = () => {
    if (loading || success) {
      return;
    }

    setError("");
    setPin("");
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = () => {
    if (pin.length !== 6) {
      setError(
        "Masukkan 6 digit kode PIN terlebih dahulu."
      );

      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      if (pin === DUMMY_PIN) {
        setSuccess(true);

        setTimeout(() => {
          router.push("/siswa");
        }, 900);
      } else {
        setLoading(false);
        setError(
          "Kode PIN yang kamu masukkan tidak sesuai."
        );
        setPin("");
      }
    }, 700);
  };

  // ==========================================================
  // AUTO SUBMIT
  // ==========================================================

  useEffect(() => {
    if (
      pin.length === 6 &&
      !loading &&
      !success
    ) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 180);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [pin]);

  // ==========================================================
  // KEYBOARD
  // ==========================================================

  const handleKeyboard = (event) => {
    if (
      event.key >= "0" &&
      event.key <= "9"
    ) {
      handleNumber(event.key);
    }

    if (event.key === "Backspace") {
      handleDelete();
    }

    if (event.key === "Escape") {
      handleClear();
    }

    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [pin, loading, success]);

  // ==========================================================
  // NUMBER PAD
  // ==========================================================

  const numbers = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main
      className="
        min-h-screen
        theme-page
        theme-text
        overflow-hidden
      "
    >
      {/* ====================================================
          BACKGROUND
      ==================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="
            absolute
            -top-40
            -right-40
            h-[420px]
            w-[420px]
            rounded-full
            blur-3xl
            bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
          "
        />

        <div
          className="
            absolute
            -bottom-48
            -left-40
            h-[420px]
            w-[420px]
            rounded-full
            blur-3xl
            bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]
          "
        />

        {/* Theme-aware grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
          "
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in srgb, var(--color-primary) 45%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 45%, transparent) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative min-h-screen flex flex-col">

        {/* ==================================================
            TOP BAR
        ================================================== */}

        <header
          className={`
            h-[72px]
            shrink-0
            border-b
            ${themeDivider}
            bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)]
            backdrop-blur-xl
          `}
        >
          <div
            className="
              mx-auto
              flex
              h-full
              w-full
              max-w-7xl
              items-center
              justify-between
              px-5
              sm:px-8
            "
          >
            {/* LOGO */}

            <div className="flex items-center gap-3">
              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  ${themePrimaryGradient}
                  ${themePrimaryShadow}
                `}
              >
                <GraduationCap
                  className={`h-5 w-5 ${themeTextOnCard}`}
                />
              </div>

              <div>
                <p className="text-[15px] font-bold tracking-tight theme-text">
                  SmartSchool
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.18em] theme-text-placeholder">
                  Student Portal
                </p>
              </div>
            </div>

            {/* SECURE BADGE */}

            <div
              className={`
                hidden
                items-center
                gap-2
                rounded-full
                border
                ${themeNeutralBorder}
                ${themeNeutralSurface}
                px-3.5
                py-2
                sm:flex
              `}
            >
              <ShieldCheck
                className={`h-4 w-4 ${themeSuccessText}`}
              />

              <span className="text-xs font-semibold theme-text-secondary">
                Akses Aman
              </span>
            </div>
          </div>
        </header>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <section
          className="
            flex
            flex-1
            items-center
            justify-center
            px-4
            py-8
            sm:px-6
          "
        >
          <div className="w-full max-w-[430px]">

            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div
              className={`
                overflow-hidden
                rounded-[28px]
                border
                ${themeNeutralBorder}
                ${themeCardSurface}
                ${themeCardShadow}
              `}
            >

              {/* ===============================================
                  HERO HEADER
              =============================================== */}

              <div
                className={`
                  relative
                  overflow-hidden
                  ${themePrimaryGradient}
                  px-6
                  pb-8
                  pt-7
                  sm:px-8
                `}
              >
                <div
                  className="
                    absolute
                    -right-12
                    -top-16
                    h-40
                    w-40
                    rounded-full
                    bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]
                    blur-xl
                  "
                />

                <div
                  className="
                    absolute
                    -bottom-20
                    -left-10
                    h-44
                    w-44
                    rounded-full
                    bg-[color-mix(in_srgb,var(--color-info)_16%,transparent)]
                    blur-2xl
                  "
                />

                <div className="relative">

                  {/* HERO TOP */}

                  <div className="mb-5 flex items-center justify-between">

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-[color-mix(in_srgb,var(--color-card)_15%,transparent)]
                        ring-1
                        ring-[color-mix(in_srgb,var(--color-card)_20%,transparent)]
                        backdrop-blur-sm
                      "
                    >
                      <LockKeyhole
                        className={`h-6 w-6 ${themeTextOnCard}`}
                      />
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]
                        px-3
                        py-1.5
                        ring-1
                        ring-[color-mix(in_srgb,var(--color-card)_15%,transparent)]
                      "
                    >
                      <Sparkles
                        className="
                          h-3.5
                          w-3.5
                          text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]
                        "
                      />

                      <span
                        className="
                          text-[11px]
                          font-semibold
                          text-[var(--color-card)]
                        "
                      >
                        Verifikasi
                      </span>
                    </div>
                  </div>

                  <p
                    className="
                      mb-1
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-[color-mix(in_srgb,var(--color-card)_76%,transparent)]
                    "
                  >
                    Selamat datang kembali
                  </p>

                  <h1
                    className="
                      text-2xl
                      font-bold
                      tracking-tight
                      text-[var(--color-card)]
                      sm:text-[28px]
                    "
                  >
                    Masukkan Kode PIN
                  </h1>

                  <p
                    className="
                      mt-2
                      max-w-sm
                      text-sm
                      leading-6
                      text-[color-mix(in_srgb,var(--color-card)_76%,transparent)]
                    "
                  >
                    Masukkan 6 digit PIN siswa
                    untuk melanjutkan ke dashboard
                    SmartSchool.
                  </p>
                </div>
              </div>

              {/* ===============================================
                  PIN AREA
              =============================================== */}

              <div className="px-6 pb-7 pt-7 sm:px-8">

                {/* PIN INDICATORS */}

                <div className="mb-3 flex justify-center gap-2.5">
                  {Array.from({
                    length: 6,
                  }).map(
                    (_, index) => {
                      const filled =
                        index <
                        pin.length;

                      return (
                        <div
                          key={index}
                          className={`
                            flex
                            h-12
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            border-2
                            transition-all
                            duration-200
                            sm:h-14
                            sm:w-11

                            ${
                              filled
                                ? `${themePrimaryBorder} ${themePrimarySurface} ${themeSmallShadow}`
                                : `${themeNeutralBorderStrong} ${themeNeutralSurface}`
                            }

                            ${
                              error
                                ? `${themeDangerBorder} ${themeDangerSurface}`
                                : ""
                            }

                            ${
                              success
                                ? `${themeSuccessBorder} ${themeSuccessSurface}`
                                : ""
                            }
                          `}
                        >
                          {filled && (
                            <div
                              className={`
                                h-3
                                w-3
                                rounded-full
                                ${
                                  success
                                    ? "bg-[var(--color-success)]"
                                    : "bg-[var(--color-primary)]"
                                }
                              `}
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>

                {/* STATUS */}

                <div className="mb-6 min-h-[38px] text-center">
                  {error ? (
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        text-xs
                        font-medium
                        theme-text
                      "
                    >
                      <XCircle
                        className={`h-4 w-4 ${themeInfoText}`}
                      />

                      {error}
                    </div>
                  ) : success ? (
                    <div
                      className={`
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        text-xs
                        font-semibold
                        ${themeSuccessText}
                      `}
                    >
                      <CheckCircle2 className="h-4 w-4" />

                      PIN benar, membuka dashboard...
                    </div>
                  ) : (
                    <p className="text-xs theme-text-muted">
                      {pin.length}/6 digit
                    </p>
                  )}
                </div>

                {/* ===========================================
                    NUMBER PAD
                =========================================== */}

                <div
                  className="
                    mx-auto
                    grid
                    max-w-[310px]
                    grid-cols-3
                    gap-2.5
                    sm:gap-3
                  "
                >
                  {numbers.map(
                    (number) => (
                      <button
                        key={number}
                        type="button"
                        disabled={
                          loading ||
                          success
                        }
                        onClick={() =>
                          handleNumber(
                            number
                          )
                        }
                        className={`
                          group
                          flex
                          h-14
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          ${themeNeutralBorderStrong}
                          ${themeCardSurface}
                          text-lg
                          font-semibold
                          theme-text-secondary
                          ${themeSmallShadow}
                          transition-all
                          duration-200
                          hover:-translate-y-0.5
                          ${themePrimaryHoverBorder}
                          ${themePrimaryHover}
                          ${themePrimaryText}
                          hover:${themePrimaryText}
                          hover:shadow-[0_8px_18px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                          active:translate-y-0
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          sm:h-16
                        `}
                      >
                        {number}
                      </button>
                    )
                  )}

                  {/* CLEAR */}

                  <button
                    type="button"
                    disabled={
                      loading ||
                      success
                    }
                    onClick={handleClear}
                    className={`
                      flex
                      h-14
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      ${themeNeutralSurface}
                      text-xs
                      font-semibold
                      theme-text-secondary
                      transition-all
                      hover:${themeNeutralSurfaceStrong}
                      ${themePrimaryHoverBorder}
                      disabled:opacity-50
                      sm:h-16
                    `}
                  >
                    Bersihkan
                  </button>

                  {/* ZERO */}

                  <button
                    type="button"
                    disabled={
                      loading ||
                      success
                    }
                    onClick={() =>
                      handleNumber("0")
                    }
                    className={`
                      group
                      flex
                      h-14
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      ${themeNeutralBorderStrong}
                      ${themeCardSurface}
                      text-lg
                      font-semibold
                      theme-text-secondary
                      ${themeSmallShadow}
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      ${themePrimaryHoverBorder}
                      ${themePrimaryHover}
                      ${themePrimaryText}
                      hover:${themePrimaryText}
                      hover:shadow-[0_8px_18px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      active:translate-y-0
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      sm:h-16
                    `}
                  >
                    0
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    disabled={
                      loading ||
                      success ||
                      pin.length === 0
                    }
                    onClick={
                      handleDelete
                    }
                    className={`
                      flex
                      h-14
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      ${themeNeutralSurface}
                      theme-text-secondary
                      transition-all
                      hover:border-[color-mix(in_srgb,var(--color-text)_22%,transparent)]
                      hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                      disabled:opacity-40
                      sm:h-16
                    `}
                  >
                    <Delete className="h-5 w-5" />
                  </button>
                </div>

                {/* ===========================================
                    SUBMIT
                =========================================== */}

                <button
                  type="button"
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    loading ||
                    success ||
                    pin.length !== 6
                  }
                  className={`
                    mt-5
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    ${themePrimaryGradient}
                    ${themeTextOnCard}
                    text-sm
                    font-semibold
                    ${themePrimaryShadow}
                    transition-all
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:bg-[var(--color-border)]
                    disabled:bg-none
                    disabled:text-[var(--color-text-muted)]
                    disabled:shadow-none
                  `}
                >
                  {loading ? (
                    <>
                      <div
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-[color-mix(in_srgb,var(--color-card)_30%,transparent)]
                          border-t-[var(--color-card)]
                        "
                      />

                      Memverifikasi...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />

                      Berhasil
                    </>
                  ) : (
                    <>
                      Lanjut ke Dashboard

                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* ===========================================
                    SECURITY INFO
                =========================================== */}

                <div
                  className={`
                    mt-5
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    ${themeNeutralBorder}
                    ${themeNeutralSurface}
                    px-4
                    py-3.5
                  `}
                >
                  <div
                    className={`
                      mt-0.5
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      ${themePrimarySurface}
                    `}
                  >
                    <ShieldCheck
                      className={`h-4 w-4 ${themePrimaryText}`}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold theme-text-secondary">
                      Akses terlindungi
                    </p>

                    <p className="mt-0.5 text-[11px] leading-5 theme-text-muted">
                      Gunakan PIN pribadi kamu
                      dan jangan membagikannya
                      kepada orang lain.
                    </p>
                  </div>
                </div>

                {/* ===========================================
                    BACK
                =========================================== */}

                <button
                  type="button"
                  onClick={() =>
                    router.push("/login")
                  }
                  className={`
                    mx-auto
                    mt-5
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-semibold
                    theme-text-muted
                    transition-colors
                    hover:text-[var(--color-primary)]
                  `}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />

                  Kembali ke halaman login
                </button>
              </div>
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="mt-5 text-center">
              <p className="text-[11px] font-medium theme-text-muted">
                SmartSchool Student Portal
              </p>

              <p className="mt-1 text-[10px] theme-text-placeholder">
                Sistem informasi sekolah terpadu
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ====================================================
          HIDDEN INPUT
      ==================================================== */}

      <input
        ref={inputRef}
        value={pin}
        onChange={() => {}}
        inputMode="numeric"
        autoComplete="one-time-code"
        className="
          pointer-events-none
          absolute
          h-0
          w-0
          opacity-0
        "
        aria-hidden="true"
      />
    </main>
  );
}