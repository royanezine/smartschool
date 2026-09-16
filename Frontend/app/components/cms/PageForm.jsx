"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import RichTextEditor from "./RichTextEditor";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  Home,
  AlertCircle,
} from "lucide-react";

const pageSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),

  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya huruf kecil, angka, dan strip"
    ),

  content: z.string().min(10, "Konten minimal 10 karakter"),

  is_homepage: z.boolean().optional(),
});

const PageForm = ({
  initialData = null,
  isEdit = false,
}) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [content, setContent] = useState(
    initialData?.content || ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pageSchema),

    defaultValues: initialData || {
      title: "",
      slug: "",
      content: "",
      is_homepage: false,
    },
  });

  const isHomepageChecked = watch("is_homepage");

  const handleContentChange = (html) => {
    setContent(html);
    setValue("content", html, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data) => {
    setLoading(true);

    // Simulasi proses simpan
    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    alert(
      `Halaman ${
        isEdit ? "diperbarui" : "ditambahkan"
      } (dummy)\n` +
        JSON.stringify(data, null, 2)
    );

    setLoading(false);

    router.push("/cmsAdmin/pages");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full min-w-0 space-y-6 sm:space-y-7"
    >

      {/* ================================================= */}
      {/* JUDUL */}
      {/* ================================================= */}
      <div className="w-full">

        <label
          htmlFor="title"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-gray-700
            sm:text-base
          "
        >
          Judul Halaman{" "}
          <span className="text-red-500">*</span>
        </label>

        <input
          id="title"
          {...register("title")}
          type="text"
          autoComplete="off"
          className={`
            w-full
            rounded-xl
            border
            bg-gray-50/50
            px-4
            py-3
            text-base
            text-gray-800
            outline-none
            transition-all
            duration-200
            placeholder:text-gray-400
            focus:bg-white
            focus:ring-2
            focus:ring-purple-100
            ${
              errors.title
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-purple-500"
            }
          `}
          placeholder="Masukkan judul halaman"
        />

        {errors.title && (
          <p
            className="
              mt-2
              flex
              items-center
              gap-1.5
              text-sm
              leading-relaxed
              text-red-500
            "
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.title.message}
          </p>
        )}

      </div>

      {/* ================================================= */}
      {/* SLUG */}
      {/* ================================================= */}
      <div className="w-full">

        <label
          htmlFor="slug"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-gray-700
            sm:text-base
          "
        >
          Slug{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="relative w-full">

          {/* PREFIX / */}
          <span
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-sm
              font-medium
              text-gray-400
              sm:text-base
            "
          >
            /
          </span>

          <input
            id="slug"
            {...register("slug")}
            type="text"
            autoComplete="off"
            className={`
              w-full
              rounded-xl
              border
              bg-gray-50/50
              py-3
              pl-8
              pr-4
              font-mono
              text-base
              text-gray-800
              outline-none
              transition-all
              duration-200
              placeholder:text-gray-400
              focus:bg-white
              focus:ring-2
              focus:ring-purple-100
              ${
                errors.slug
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-purple-500"
              }
            `}
            placeholder="tentang-kami"
          />

        </div>

        {errors.slug ? (
          <p
            className="
              mt-2
              flex
              items-center
              gap-1.5
              text-sm
              leading-relaxed
              text-red-500
            "
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.slug.message}
          </p>
        ) : (
          <p
            className="
              mt-2
              text-sm
              leading-relaxed
              text-gray-400
            "
          >
            Gunakan huruf kecil, angka, dan strip (-)
          </p>
        )}

      </div>

      {/* ================================================= */}
      {/* KONTEN */}
      {/* ================================================= */}
      <div className="w-full min-w-0">

        <label
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-gray-700
            sm:text-base
          "
        >
          Konten{" "}
          <span className="text-red-500">*</span>
        </label>

        <div
          className="
            w-full
            min-w-0
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-gray-50/50
            transition-all
            duration-200
            focus-within:border-purple-500
            focus-within:bg-white
            focus-within:ring-2
            focus-within:ring-purple-100
          "
        >
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
          />
        </div>

        {errors.content && (
          <p
            className="
              mt-2
              flex
              items-center
              gap-1.5
              text-sm
              leading-relaxed
              text-red-500
            "
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.content.message}
          </p>
        )}

      </div>

      {/* ================================================= */}
      {/* HOMEPAGE */}
      {/* ================================================= */}
      <div
        className="
          w-full
          rounded-xl
          border
          border-purple-100
          bg-gradient-to-r
          from-purple-50/70
          to-blue-50/70
          p-4
          sm:p-5
        "
      >
        <div className="flex items-start gap-3">

          {/* CHECKBOX */}
          <div className="flex shrink-0 items-center pt-1">

            <input
              type="checkbox"
              {...register("is_homepage")}
              id="is_homepage"
              className="
                h-5
                w-5
                cursor-pointer
                rounded
                border-gray-300
                text-purple-600
                focus:ring-2
                focus:ring-purple-500
              "
            />

          </div>

          {/* TEXT */}
          <div className="min-w-0">

            <label
              htmlFor="is_homepage"
              className="
                flex
                cursor-pointer
                items-center
                gap-2
                text-sm
                font-semibold
                leading-relaxed
                text-gray-700
                sm:text-base
              "
            >
              <Home
                className="
                  h-4
                  w-4
                  shrink-0
                  text-purple-500
                  sm:h-5
                  sm:w-5
                "
              />

              <span>
                Jadikan sebagai halaman beranda
              </span>
            </label>

            <p
              className="
                mt-1
                text-sm
                leading-relaxed
                text-gray-500
              "
            >
              {isHomepageChecked
                ? "Halaman ini akan menjadi halaman utama website Anda"
                : "Centang jika halaman ini ingin dijadikan beranda"}
            </p>

          </div>

        </div>
      </div>

      {/* ================================================= */}
      {/* ACTION BUTTON */}
      {/* ================================================= */}
      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-gray-100
          pt-5
          sm:flex-row
          sm:justify-end
          sm:pt-6
        "
      >

        {/* SIMPAN */}
        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-purple-600
            to-purple-700
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all
            duration-200
            hover:from-purple-700
            hover:to-purple-800
            hover:shadow-md
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
          "
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>

              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />

              {isEdit
                ? "Update Halaman"
                : "Simpan Halaman"}
            </>
          )}
        </button>

        {/* BATAL */}
        <button
          type="button"
          onClick={() => router.back()}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gray-100
            px-6
            py-3
            text-sm
            font-semibold
            text-gray-700
            transition-all
            duration-200
            hover:bg-gray-200
            sm:w-auto
          "
        >
          <X className="h-4 w-4" />

          Batal
        </button>

      </div>
    </form>
  );
};

export default PageForm;