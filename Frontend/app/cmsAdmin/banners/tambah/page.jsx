// app/cmsAdmin/banners/tambah/page.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
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
    <div className="flex min-h-screen w-full bg-slate-50">

      {/* =====================================================
          SIDEBAR
          TIDAK DIUBAH
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

      <main
        className="
          min-w-0
          flex-1
          bg-slate-50
        "
      >
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
                className="text-slate-400 transition hover:text-blue-600"
              >
                Dashboard
              </Link>

              <span className="text-slate-300">/</span>

              <Link
                href="/cmsAdmin/banners"
                className="text-slate-400 transition hover:text-blue-600"
              >
                Banner
              </Link>

              <span className="text-slate-300">/</span>

              <span className="font-medium text-slate-700">
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
                    border-blue-100
                    bg-blue-50
                    sm:h-12
                    sm:w-12
                  "
                >
                  <LayoutPanelTop className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1
                      className="
                        text-xl
                        font-bold
                        tracking-tight
                        text-slate-900
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
                        bg-blue-50
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        text-blue-600
                        sm:flex
                      "
                    >
                      <Sparkles className="h-3 w-3" />
                      CMS
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
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
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-600
                  sm:w-fit
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Link>
            </div>

            {/* =================================================
                CONTENT GRID

                PENTING:
                Tidak menggunakan max-w yang mengunci lebar.
                Jadi ketika zoom out, content ikut melebar.
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
                  border-slate-200
                  bg-white
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
                    border-slate-100
                    bg-slate-50/60
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
                        bg-blue-100
                      "
                    >
                      <LayoutPanelTop className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Informasi Banner
                      </h2>

                      <p className="text-xs text-slate-400">
                        Isi informasi banner dengan lengkap
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    <span className="text-red-500">*</span> wajib diisi
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
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Judul Banner{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={bannerData.title}
                        onChange={handleChange}
                        placeholder="Contoh: Pendaftaran Siswa Baru"
                        className={`
                          w-full
                          rounded-xl
                          border
                          bg-white
                          px-4
                          py-3
                          text-sm
                          text-slate-800
                          outline-none
                          transition
                          placeholder:text-slate-400
                          ${
                            errors.title
                              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                              : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                          }
                        `}
                      />

                      {errors.title && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
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
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        URL Gambar{" "}
                        <span className="text-red-500">*</span>
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
                            text-slate-400
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
                            w-full
                            rounded-xl
                            border
                            bg-white
                            py-3
                            pl-11
                            pr-4
                            text-sm
                            text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            ${
                              errors.image
                                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                            }
                          `}
                        />
                      </div>

                      {errors.image ? (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.image}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">
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
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Link Tujuan{" "}
                        <span className="text-red-500">*</span>
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
                            text-slate-400
                          "
                        />

                        <input
                          id="link"
                          name="link"
                          type="text"
                          value={bannerData.link}
                          onChange={handleChange}
                          placeholder="/halaman-tujuan"
                          className={`
                            w-full
                            rounded-xl
                            border
                            bg-white
                            py-3
                            pl-11
                            pr-4
                            text-sm
                            text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            ${
                              errors.link
                                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                            }
                          `}
                        />
                      </div>

                      {errors.link ? (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.link}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">
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
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Posisi Banner
                        </label>

                        <select
                          id="position"
                          name="position"
                          value={bannerData.position}
                          onChange={handleChange}
                          className="
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            text-slate-800
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-50
                          "
                        >
                          <option value="hero">Hero</option>
                          <option value="promo">Promo</option>
                          <option value="sidebar">Sidebar</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="status"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Status
                        </label>

                        <select
                          id="status"
                          name="status"
                          value={bannerData.status}
                          onChange={handleChange}
                          className="
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            text-slate-800
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-50
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
                            <h3 className="text-sm font-semibold text-slate-800">
                              Preview Banner
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Preview akan mengikuti gambar yang kamu masukkan
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
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
                            border-slate-200
                            bg-slate-100
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
                        border-slate-100
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
                          border-slate-200
                          bg-white
                          px-5
                          py-3
                          text-sm
                          font-medium
                          text-slate-700
                          transition
                          hover:bg-slate-50
                        "
                      >
                        <X className="h-4 w-4" />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-6
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          shadow-sm
                          transition
                          hover:bg-blue-700
                          hover:shadow-md
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
                    border-blue-100
                    bg-blue-50
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
                        bg-blue-100
                      "
                    >
                      <span>💡</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Tips Banner
                      </h3>

                      <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
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
                    border-slate-200
                    bg-white
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
                        bg-slate-100
                      "
                    >
                      <Image className="h-4 w-4 text-slate-500" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Rekomendasi
                      </h3>

                      <p className="text-xs text-slate-400">
                        Ukuran banner
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                      <span className="text-xs text-slate-500">
                        Hero
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
                        1200 × 600
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                      <span className="text-xs text-slate-500">
                        Promo
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
                        1000 × 500
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                      <span className="text-xs text-slate-500">
                        Format
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
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
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                  "
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Status Banner
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className={`
                        h-2.5
                        w-2.5
                        rounded-full
                        ${
                          bannerData.status === "active"
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }
                      `}
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {bannerData.status === "active"
                          ? "Aktif"
                          : "Draft"}
                      </p>

                      <p className="text-xs text-slate-400">
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
              <p className="text-[11px] text-slate-400">
                CMS SmartSchool • Manajemen Banner
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}