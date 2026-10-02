// app/cmsAdmin/banners/tambah/page.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";
import {
  LayoutPanelTop,
  ArrowLeft,
  Image,
  Link2,
  X,
  AlertCircle,
  Check,
  Eye,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function CreateBannerPage() {
  const router = useRouter();

  const [active, setActive] = useState("banners");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [bannerData, setBannerData] = useState({
    title: "",
    image: "",
    link: "",
    position: "hero",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  // =========================================================
  // CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBannerData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validate = () => {
    const newErrors = {};

    if (!bannerData.title.trim()) {
      newErrors.title = "Judul banner wajib diisi";
    }

    if (!bannerData.image.trim()) {
      newErrors.image = "URL gambar wajib diisi";
    }

    if (!bannerData.link.trim()) {
      newErrors.link = "Link tujuan wajib diisi";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      alert(
        `Banner berhasil ditambahkan (dummy)\n\n${JSON.stringify(
          bannerData,
          null,
          2
        )}`
      );

      setLoading(false);

      router.push("/cmsAdmin/banners");
    }, 1200);
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="flex min-h-screen w-full theme-page">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="min-w-0 flex-1 theme-page">
        <div
          className="
            w-full
            px-4
            py-5
            sm:px-6
            sm:py-6
            md:px-8
            md:py-8
            lg:px-10
            xl:px-12
          "
        >
          <div className="w-full">
            {/* =================================================
                BREADCRUMB
            ================================================= */}

            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <Link
                href="/cmsAdmin"
                className="theme-text-muted transition hover:opacity-80"
              >
                Dashboard
              </Link>

              <span className="theme-text-placeholder">/</span>

              <Link
                href="/cmsAdmin/banners"
                className="theme-text-muted transition hover:opacity-80"
              >
                Banner
              </Link>

              <span className="theme-text-placeholder">/</span>

              <span className="font-medium theme-text">
                Tambah Banner
              </span>
            </div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                mb-6
                flex
                flex-col
                gap-4
                sm:mb-7
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              {/* TITLE */}

              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    theme-border
                    theme-info
                    sm:h-12
                    sm:w-12
                  "
                >
                  <LayoutPanelTop className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1
                      className="
                        text-xl
                        font-bold
                        tracking-tight
                        theme-text
                        sm:text-2xl
                        lg:text-3xl
                      "
                    >
                      Tambah Banner Baru
                    </h1>

                    <span
                      className="
                        hidden
                        items-center
                        gap-1
                        rounded-full
                        border
                        theme-border
                        theme-info
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        sm:flex
                      "
                    >
                      <Sparkles className="h-3 w-3" />
                      CMS
                    </span>
                  </div>

                  <p className="mt-1 text-xs theme-text-secondary sm:text-sm">
                    Buat dan kelola banner website Anda.
                  </p>
                </div>
              </div>

              {/* BACK */}

              <Link
                href="/cmsAdmin/banners"
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  theme-border
                  theme-card
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  theme-text-secondary
                  shadow-sm
                  transition
                  theme-table-hover
                  sm:w-fit
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Link>
            </div>

            {/* =================================================
                CONTENT GRID
            ================================================= */}

            <div
              className="
                grid
                w-full
                grid-cols-1
                gap-6
                xl:grid-cols-[minmax(0,1fr)_280px]
                2xl:grid-cols-[minmax(0,1fr)_320px]
              "
            >
              {/* =================================================
                  FORM
              ================================================= */}

              <div
                className="
                  min-w-0
                  rounded-2xl
                  border
                  theme-border
                  theme-card
                  shadow-sm
                "
              >
                {/* FORM HEADER */}

                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    border-b
                    theme-border-soft
                    theme-card-soft
                    px-5
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-6
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        theme-info
                      "
                    >
                      <LayoutPanelTop className="h-4 w-4" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Informasi Banner
                      </h2>

                      <p className="text-xs theme-text-muted">
                        Isi informasi banner dengan lengkap
                      </p>
                    </div>
                  </div>

                  <span className="text-xs theme-text-muted">
                    <span
                      style={{
                        color: "var(--color-danger)",
                      }}
                    >
                      *
                    </span>{" "}
                    wajib diisi
                  </span>
                </div>

                {/* FORM BODY */}

                <div className="p-5 sm:p-6 lg:p-8">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* =================================================
                        TITLE
                    ================================================= */}

                    <div>
                      <label
                        htmlFor="title"
                        className="mb-2 block text-sm font-semibold theme-text"
                      >
                        Judul Banner{" "}
                        <span
                          style={{
                            color: "var(--color-danger)",
                          }}
                        >
                          *
                        </span>
                      </label>

                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={bannerData.title}
                        onChange={handleChange}
                        placeholder="Contoh: Pendaftaran Siswa Baru"
                        className={`
                          theme-input
                          w-full
                          rounded-xl
                          border
                          px-4
                          py-3
                          text-sm
                          outline-none
                          transition
                          placeholder:theme-text-placeholder
                          ${
                            errors.title
                              ? "border-[var(--color-danger)]"
                              : ""
                          }
                        `}
                        style={
                          errors.title
                            ? {
                                borderColor:
                                  "var(--color-danger)",
                              }
                            : undefined
                        }
                      />

                      {errors.title && (
                        <p
                          className="mt-2 flex items-center gap-1.5 text-xs"
                          style={{
                            color:
                              "var(--color-danger)",
                          }}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <div>
                      <label
                        htmlFor="image"
                        className="mb-2 block text-sm font-semibold theme-text"
                      >
                        URL Gambar{" "}
                        <span
                          style={{
                            color: "var(--color-danger)",
                          }}
                        >
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Image
                          className="
                            absolute
                            left-4
                            top-1/2
                            h-4
                            w-4
                            -translate-y-1/2
                            theme-text-muted
                          "
                        />

                        <input
                          id="image"
                          name="image"
                          type="text"
                          value={bannerData.image}
                          onChange={handleChange}
                          placeholder="https://example.com/banner.jpg"
                          className={`
                            theme-input
                            w-full
                            rounded-xl
                            border
                            py-3
                            pl-11
                            pr-4
                            text-sm
                            outline-none
                            transition
                            placeholder:theme-text-placeholder
                          `}
                          style={
                            errors.image
                              ? {
                                  borderColor:
                                    "var(--color-danger)",
                                }
                              : undefined
                          }
                        />
                      </div>

                      {errors.image ? (
                        <p
                          className="mt-2 flex items-center gap-1.5 text-xs"
                          style={{
                            color:
                              "var(--color-danger)",
                          }}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.image}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs theme-text-muted">
                          Masukkan URL gambar banner yang valid.
                        </p>
                      )}
                    </div>

                    {/* =================================================
                        LINK
                    ================================================= */}

                    <div>
                      <label
                        htmlFor="link"
                        className="mb-2 block text-sm font-semibold theme-text"
                      >
                        Link Tujuan{" "}
                        <span
                          style={{
                            color: "var(--color-danger)",
                          }}
                        >
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Link2
                          className="
                            absolute
                            left-4
                            top-1/2
                            h-4
                            w-4
                            -translate-y-1/2
                            theme-text-muted
                          "
                        />

                        <input
                          id="link"
                          name="link"
                          type="text"
                          value={bannerData.link}
                          onChange={handleChange}
                          placeholder="/halaman-tujuan"
                          className="
                            theme-input
                            w-full
                            rounded-xl
                            border
                            py-3
                            pl-11
                            pr-4
                            text-sm
                            outline-none
                            transition
                            placeholder:theme-text-placeholder
                          "
                          style={
                            errors.link
                              ? {
                                  borderColor:
                                    "var(--color-danger)",
                                }
                              : undefined
                          }
                        />
                      </div>

                      {errors.link ? (
                        <p
                          className="mt-2 flex items-center gap-1.5 text-xs"
                          style={{
                            color:
                              "var(--color-danger)",
                          }}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.link}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs theme-text-muted">
                          Contoh: /ppdb atau https://website.com/ppdb
                        </p>
                      )}
                    </div>

                    {/* =================================================
                        POSITION + STATUS
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="position"
                          className="mb-2 block text-sm font-semibold theme-text"
                        >
                          Posisi Banner
                        </label>

                        <select
                          id="position"
                          name="position"
                          value={bannerData.position}
                          onChange={handleChange}
                          className="
                            theme-input
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition
                          "
                        >
                          <option value="hero">
                            Hero
                          </option>

                          <option value="promo">
                            Promo
                          </option>

                          <option value="sidebar">
                            Sidebar
                          </option>

                          <option value="bottom">
                            Bottom
                          </option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="status"
                          className="mb-2 block text-sm font-semibold theme-text"
                        >
                          Status
                        </label>

                        <select
                          id="status"
                          name="status"
                          value={bannerData.status}
                          onChange={handleChange}
                          className="
                            theme-input
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition
                          "
                        >
                          <option value="active">
                            Aktif
                          </option>

                          <option value="draft">
                            Draft
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* =================================================
                        PREVIEW
                    ================================================= */}

                    {bannerData.image && (
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold theme-text">
                              Preview Banner
                            </h3>

                            <p className="mt-0.5 text-xs theme-text-muted">
                              Preview akan mengikuti gambar yang kamu masukkan
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs theme-text-muted">
                            <Eye className="h-4 w-4" />
                            Preview
                          </div>
                        </div>

                        <div
                          className="
                            relative
                            aspect-[2.4/1]
                            w-full
                            overflow-hidden
                            rounded-2xl
                            border
                            theme-border
                            theme-card-soft
                          "
                        >
                          <img
                            src={bannerData.image}
                            alt={
                              bannerData.title ||
                              "Preview banner"
                            }
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://picsum.photos/1200/500";
                            }}
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          {bannerData.title && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                              <p className="truncate text-base font-semibold text-white sm:text-xl">
                                {bannerData.title}
                              </p>

                              {bannerData.link && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
                                  <ExternalLink className="h-3 w-3" />
                                  {bannerData.link}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* =================================================
                        ACTION
                    ================================================= */}

                    <div
                      className="
                        flex
                        flex-col-reverse
                        gap-3
                        border-t
                        theme-border-soft
                        pt-6
                        sm:flex-row
                        sm:justify-end
                      "
                    >
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          theme-border
                          theme-card
                          px-5
                          py-3
                          text-sm
                          font-medium
                          theme-text-secondary
                          transition
                          theme-table-hover
                        "
                      >
                        <X className="h-4 w-4" />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="
                          theme-primary
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          px-6
                          py-3
                          text-sm
                          font-semibold
                          shadow-sm
                          transition
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {loading ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="opacity-25"
                              />

                              <path
                                d="M4 12a8 8 0 018-8"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                              />
                            </svg>

                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Simpan Banner
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* =================================================
                  RIGHT INFO
              ================================================= */}

              <div className="min-w-0 space-y-5">
                {/* TIPS */}

                <div
                  className="
                    rounded-2xl
                    border
                    theme-border
                    theme-info
                    p-5
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        theme-card
                      "
                    >
                      <span>💡</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        Tips Banner
                      </h3>

                      <ul className="mt-3 space-y-2 text-xs leading-5">
                        <li>
                          • Gunakan gambar beresolusi tinggi.
                        </li>

                        <li>
                          • Rekomendasi minimal 1200 × 600px.
                        </li>

                        <li>
                          • Gunakan judul yang singkat.
                        </li>

                        <li>
                          • Pastikan link tujuan aktif.
                        </li>

                        <li>
                          • Banner aktif akan ditampilkan.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* RECOMMENDATION */}

                <div
                  className="
                    rounded-2xl
                    border
                    theme-border
                    theme-card
                    p-5
                    shadow-sm
                  "
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        theme-card-soft
                      "
                    >
                      <Image className="h-4 w-4 theme-text-muted" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold theme-text">
                        Rekomendasi
                      </h3>

                      <p className="text-xs theme-text-muted">
                        Ukuran banner
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        theme-card-soft
                        px-3
                        py-2.5
                      "
                    >
                      <span className="text-xs theme-text-muted">
                        Hero
                      </span>

                      <span className="text-xs font-semibold theme-text-secondary">
                        1200 × 600
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        theme-card-soft
                        px-3
                        py-2.5
                      "
                    >
                      <span className="text-xs theme-text-muted">
                        Promo
                      </span>

                      <span className="text-xs font-semibold theme-text-secondary">
                        1000 × 500
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        theme-card-soft
                        px-3
                        py-2.5
                      "
                    >
                      <span className="text-xs theme-text-muted">
                        Format
                      </span>

                      <span className="text-xs font-semibold theme-text-secondary">
                        JPG / PNG / WebP
                      </span>
                    </div>
                  </div>
                </div>

                {/* STATUS */}

                <div
                  className="
                    rounded-2xl
                    border
                    theme-border
                    theme-card
                    p-5
                    shadow-sm
                  "
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                    Status Banner
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          bannerData.status === "active"
                            ? "var(--color-success)"
                            : "var(--color-text-placeholder)",
                      }}
                    />

                    <div>
                      <p className="text-sm font-semibold theme-text">
                        {bannerData.status === "active"
                          ? "Aktif"
                          : "Draft"}
                      </p>

                      <p className="text-xs theme-text-muted">
                        {bannerData.status === "active"
                          ? "Banner siap ditampilkan"
                          : "Banner belum ditampilkan"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="py-6 text-center">
              <p className="text-[11px] theme-text-muted">
                CMS SmartSchool • Manajemen Banner
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}