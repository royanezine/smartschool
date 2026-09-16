"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { apiFetch } from "../../../../lib/api";

import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.result)) return data.result;

  return [];
}

export default function TambahArtikelPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    judul: "",
    konten: "",
    ringkasan: "",
    gambarUtama: "",
    status: "draft",
    kategoriArtikelId: "",
  });

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const data = await apiFetch(
        "/api/v1/cms/kategori-artikel"
      );

      setCategories(extractList(data));
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);

      alert(
        error?.message ||
          "Gagal mengambil kategori artikel."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.judul.trim()) {
      alert("Judul artikel wajib diisi.");
      return;
    }

    if (form.judul.trim().length < 3) {
      alert("Judul artikel minimal 3 karakter.");
      return;
    }

    if (!form.konten.trim()) {
      alert("Konten artikel wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        judul: form.judul.trim(),

        konten: form.konten.trim(),

        ringkasan:
          form.ringkasan.trim() || undefined,

        gambarUtama:
          form.gambarUtama.trim() || undefined,

        /*
         * STATUS MENGIKUTI BACKEND
         *
         * draft
         * dipublikasikan
         */
        status: form.status,

        kategoriArtikelId:
          form.kategoriArtikelId || null,
      };

      console.log(
        "Payload artikel:",
        payload
      );

      await apiFetch(
        "/api/v1/cms/artikel",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      alert("Artikel berhasil dibuat.");

      router.push("/cmsAdmin/articles");
    } catch (error) {
      console.error(
        "Gagal membuat artikel:",
        error
      );

      alert(
        error?.message ||
          "Gagal membuat artikel."
      );
    } finally {
      setSaving(false);
    }
  }

  function clearImage() {
    setForm((prev) => ({
      ...prev,
      gambarUtama: "",
    }));
  }

  const isPublished =
    form.status === "dipublikasikan";

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F8FAFC]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className="
          absolute
          inset-y-0
          left-[60px]
          right-0
          flex
          min-w-0
          flex-col
          overflow-hidden
          bg-[#F8FAFC]
          lg:left-[260px]
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <Header />

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">

            <div
              className="
                mx-auto
                w-full
                max-w-[1440px]
                px-4
                py-5
                sm:px-6
                sm:py-6
                lg:px-8
                lg:py-7
              "
            >

              {/* =================================================
                  TOP NAVIGATION
              ================================================= */}

              <div className="mb-6 flex items-center justify-between">

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-slate-500
                    transition
                    hover:text-[#2563EB]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <ArrowLeft size={16} />

                  Kembali
                </button>

                <div className="hidden text-right sm:block">

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-slate-400
                    "
                  >
                    CMS ADMIN
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      font-semibold
                      text-slate-600
                    "
                  >
                    Artikel / Tambah
                  </p>

                </div>

              </div>

              {/* =================================================
                  PAGE TITLE
              ================================================= */}

              <div className="mb-7">

                <div
                  className="
                    mb-2
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                  "
                >

                  <span className="text-blue-600">
                    CMS
                  </span>

                  <span className="text-slate-300">
                    /
                  </span>

                  <span className="text-slate-400">
                    Artikel
                  </span>

                  <span className="text-slate-300">
                    /
                  </span>

                  <span className="text-slate-400">
                    Tambah
                  </span>

                </div>

                <h1
                  className="
                    text-[26px]
                    font-bold
                    tracking-tight
                    text-[#0F172A]
                    sm:text-[30px]
                  "
                >
                  Tambah Artikel
                </h1>

                <p
                  className="
                    mt-1.5
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Buat dan publikasikan konten
                  informasi sekolah melalui CMS.
                </p>

              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleSubmit}>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-5
                    xl:grid-cols-[minmax(0,1fr)_340px]
                  "
                >

                  {/* =================================================
                      LEFT CONTENT
                  ================================================= */}

                  <div
                    className="
                      min-w-0
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                    "
                  >

                    {/* HEADER CARD */}

                    <div
                      className="
                        border-b
                        border-slate-100
                        px-5
                        py-4
                        sm:px-6
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-bold
                          text-[#0F172A]
                        "
                      >
                        Informasi Artikel
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-xs
                          text-slate-400
                        "
                      >
                        Lengkapi informasi utama
                        artikel.
                      </p>

                    </div>

                    {/* BODY */}

                    <div className="p-5 sm:p-6">

                      {/* =================================================
                          JUDUL
                      ================================================= */}

                      <div className="mb-6">

                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-500
                          "
                        >
                          Judul Artikel

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          type="text"
                          name="judul"
                          value={form.judul}
                          onChange={handleChange}
                          placeholder="Masukkan judul artikel"
                          disabled={saving}
                          className="
                            h-12
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-sm
                            font-medium
                            text-slate-700
                            outline-none
                            transition
                            placeholder:text-slate-400
                            hover:border-slate-300
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-50
                            disabled:bg-slate-50
                          "
                        />

                        <p
                          className="
                            mt-2
                            text-[11px]
                            text-slate-400
                          "
                        >
                          Gunakan judul yang singkat,
                          jelas, dan mudah dipahami.
                        </p>

                      </div>

                      {/* =================================================
                          RINGKASAN
                      ================================================= */}

                      <div className="mb-6">

                        <div
                          className="
                            mb-2
                            flex
                            items-center
                            justify-between
                          "
                        >

                          <label
                            className="
                              block
                              text-xs
                              font-bold
                              uppercase
                              tracking-wide
                              text-slate-500
                            "
                          >
                            Ringkasan
                          </label>

                          <span
                            className="
                              text-[10px]
                              text-slate-400
                            "
                          >
                            Opsional
                          </span>

                        </div>

                        <textarea
                          name="ringkasan"
                          value={form.ringkasan}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Tuliskan ringkasan singkat artikel..."
                          disabled={saving}
                          className="
                            w-full
                            resize-y
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            p-4
                            text-sm
                            leading-6
                            text-slate-700
                            outline-none
                            transition
                            placeholder:text-slate-400
                            hover:border-slate-300
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-50
                            disabled:bg-slate-50
                          "
                        />

                        <p
                          className="
                            mt-2
                            text-[11px]
                            text-slate-400
                          "
                        >
                          Ringkasan digunakan sebagai
                          deskripsi singkat artikel.
                        </p>

                      </div>

                      {/* =================================================
                          KONTEN
                      ================================================= */}

                      <div className="mb-6">

                        <div
                          className="
                            mb-2
                            flex
                            items-center
                            justify-between
                          "
                        >

                          <label
                            className="
                              block
                              text-xs
                              font-bold
                              uppercase
                              tracking-wide
                              text-slate-500
                            "
                          >
                            Konten Artikel

                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <span
                            className="
                              text-[10px]
                              text-slate-400
                            "
                          >
                            Isi utama
                          </span>

                        </div>

                        <textarea
                          name="konten"
                          value={form.konten}
                          onChange={handleChange}
                          rows={18}
                          placeholder="Tulis isi artikel di sini..."
                          disabled={saving}
                          className="
                            w-full
                            resize-y
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            p-4
                            text-sm
                            leading-7
                            text-slate-700
                            outline-none
                            transition
                            placeholder:text-slate-400
                            hover:border-slate-300
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-50
                            disabled:bg-slate-50
                          "
                        />

                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >

                          <p
                            className="
                              text-[11px]
                              text-slate-400
                            "
                          >
                            Konten dikirim sebagai
                            string ke backend.
                          </p>

                          <span
                            className="
                              shrink-0
                              text-[11px]
                              font-medium
                              text-slate-400
                            "
                          >
                            {form.konten.length}
                            {" "}
                            karakter
                          </span>

                        </div>

                      </div>

                      {/* =================================================
                          IMAGE
                      ================================================= */}

                      <div>

                        <div
                          className="
                            mb-2
                            flex
                            items-center
                            justify-between
                          "
                        >

                          <label
                            className="
                              block
                              text-xs
                              font-bold
                              uppercase
                              tracking-wide
                              text-slate-500
                            "
                          >
                            Gambar Utama
                          </label>

                          <span
                            className="
                              text-[10px]
                              text-slate-400
                            "
                          >
                            Opsional
                          </span>

                        </div>

                        <div className="relative">

                          <ImageIcon
                            size={16}
                            className="
                              absolute
                              left-3.5
                              top-1/2
                              -translate-y-1/2
                              text-slate-400
                            "
                          />

                          <input
                            type="text"
                            name="gambarUtama"
                            value={form.gambarUtama}
                            onChange={handleChange}
                            placeholder="https://contoh.com/gambar.jpg"
                            disabled={saving}
                            className="
                              h-11
                              w-full
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              pl-10
                              pr-10
                              text-sm
                              text-slate-700
                              outline-none
                              transition
                              placeholder:text-slate-400
                              hover:border-slate-300
                              focus:border-blue-500
                              focus:ring-4
                              focus:ring-blue-50
                              disabled:bg-slate-50
                            "
                          />

                          {form.gambarUtama && (
                            <button
                              type="button"
                              onClick={clearImage}
                              disabled={saving}
                              className="
                                absolute
                                right-3
                                top-1/2
                                flex
                                h-6
                                w-6
                                -translate-y-1/2
                                items-center
                                justify-center
                                rounded-md
                                text-slate-400
                                transition
                                hover:bg-slate-100
                                hover:text-slate-600
                                disabled:opacity-50
                              "
                              title="Hapus URL gambar"
                            >
                              <X size={14} />
                            </button>
                          )}

                        </div>

                        <p
                          className="
                            mt-2
                            text-[11px]
                            leading-5
                            text-slate-400
                          "
                        >
                          Masukkan URL gambar utama.
                          Backend saat ini belum
                          menyediakan endpoint upload
                          gambar CMS.
                        </p>

                        {/* IMAGE PREVIEW */}

                        {form.gambarUtama && (
                          <div
                            className="
                              mt-4
                              overflow-hidden
                              rounded-lg
                              border
                              border-slate-200
                              bg-slate-50
                            "
                          >

                            <div className="relative">

                              <img
                                src={form.gambarUtama}
                                alt="Preview gambar artikel"
                                className="
                                  h-56
                                  w-full
                                  object-cover
                                "
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />

                              <div
                                className="
                                  absolute
                                  bottom-0
                                  left-0
                                  right-0
                                  bg-gradient-to-t
                                  from-black/40
                                  to-transparent
                                  px-4
                                  pb-3
                                  pt-8
                                "
                              >

                                <p
                                  className="
                                    text-[11px]
                                    font-medium
                                    text-white
                                  "
                                >
                                  Preview gambar utama
                                </p>

                              </div>

                            </div>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      RIGHT SETTINGS
                  ================================================= */}

                  <div
                    className="
                      h-fit
                      min-w-0
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                      xl:sticky
                      xl:top-5
                    "
                  >

                    {/* HEADER */}

                    <div
                      className="
                        border-b
                        border-slate-100
                        px-5
                        py-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-bold
                          text-[#0F172A]
                        "
                      >
                        Pengaturan
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-xs
                          text-slate-400
                        "
                      >
                        Atur kategori dan status
                        artikel.
                      </p>

                    </div>

                    <div className="p-5">

                      {/* =================================================
                          CATEGORY
                      ================================================= */}

                      <div>

                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-500
                          "
                        >
                          Kategori
                        </label>

                        <select
                          name="kategoriArtikelId"
                          value={form.kategoriArtikelId}
                          onChange={handleChange}
                          disabled={
                            loadingCategories ||
                            saving
                          }
                          className="
                            h-11
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            text-slate-700
                            outline-none
                            transition
                            hover:border-slate-300
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-50
                            disabled:bg-slate-50
                            disabled:text-slate-400
                          "
                        >

                          <option value="">
                            Tanpa Kategori
                          </option>

                          {categories.map(
                            (category) => (
                              <option
                                key={category.id}
                                value={category.id}
                              >
                                {category.nama}
                              </option>
                            )
                          )}

                        </select>

                        {loadingCategories ? (
                          <p
                            className="
                              mt-2
                              text-[11px]
                              text-slate-400
                            "
                          >
                            Memuat kategori...
                          </p>
                        ) : categories.length ===
                          0 ? (
                          <p
                            className="
                              mt-2
                              text-[11px]
                              leading-5
                              text-amber-600
                            "
                          >
                            Belum ada kategori
                            artikel.
                          </p>
                        ) : (
                          <p
                            className="
                              mt-2
                              text-[11px]
                              text-slate-400
                            "
                          >
                            Pilih kategori yang
                            sesuai dengan isi
                            artikel.
                          </p>
                        )}

                      </div>

                      {/* DIVIDER */}

                      <div className="my-6 border-t border-slate-100" />

                      {/* =================================================
                          STATUS
                      ================================================= */}

                      <div>

                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-500
                          "
                        >
                          Status Publikasi
                        </label>

                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          disabled={saving}
                          className="
                            h-11
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            font-medium
                            text-slate-700
                            outline-none
                            transition
                            hover:border-slate-300
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-50
                            disabled:bg-slate-50
                          "
                        >

                          {/* STATUS SESUAI BE */}

                          <option value="draft">
                            Draft
                          </option>

                          <option value="dipublikasikan">
                            Published
                          </option>

                        </select>

                        <p
                          className="
                            mt-2
                            text-[11px]
                            leading-5
                            text-slate-400
                          "
                        >
                          Pilih Published agar artikel
                          dapat ditampilkan pada website
                          publik.
                        </p>

                      </div>

                      {/* =================================================
                          STATUS INFO
                      ================================================= */}

                      <div
                        className="
                          mt-6
                          rounded-lg
                          border
                          border-slate-200
                          bg-slate-50
                          p-4
                        "
                      >

                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Status Saat Ini
                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <span
                            className={`
                              h-2
                              w-2
                              rounded-full
                              ${
                                isPublished
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }
                            `}
                          />

                          <span
                            className="
                              text-sm
                              font-semibold
                              text-slate-700
                            "
                          >
                            {isPublished
                              ? "Published"
                              : "Draft"}
                          </span>

                        </div>

                        <p
                          className="
                            mt-2
                            text-[11px]
                            leading-5
                            text-slate-400
                          "
                        >
                          Nilai yang dikirim ke backend:
                        </p>

                        <code
                          className="
                            mt-1
                            block
                            break-all
                            text-[11px]
                            font-semibold
                            text-slate-500
                          "
                        >
                          {form.status}
                        </code>

                      </div>

                      {/* =================================================
                          ACTION
                      ================================================= */}

                      <div
                        className="
                          mt-6
                          border-t
                          border-slate-100
                          pt-5
                        "
                      >

                        <button
                          type="submit"
                          disabled={saving}
                          className="
                            flex
                            h-11
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-[#2563EB]
                            px-4
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-[#1D4ED8]
                            hover:shadow
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >

                          {saving ? (
                            <>
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />

                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save size={16} />

                              Simpan Artikel
                            </>
                          )}

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              "/cmsAdmin/articles"
                            )
                          }
                          disabled={saving}
                          className="
                            mt-2
                            h-11
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-sm
                            font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                            hover:text-slate-700
                            disabled:opacity-50
                          "
                        >
                          Batal
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </form>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div
                className="
                  mt-6
                  border-t
                  border-slate-200
                  pt-4
                "
              >

                <p
                  className="
                    text-[11px]
                    text-slate-400
                  "
                >
                  CMS Admin • Pengelolaan Artikel
                  Sekolah
                </p>

              </div>

            </div>

          </div>
        </main>

      </div>

    </div>
  );
}