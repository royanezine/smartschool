"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../lib/api";

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

  const [loadingCategories, setLoadingCategories] =
    useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const data = await apiFetch(
        "/api/cms/kategori-artikel"
      );

      setCategories(extractList(data));
    } catch (error) {
      console.error(
        "Gagal mengambil kategori:",
        error
      );

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
        "/api/cms/artikel",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      alert("Artikel berhasil dibuat.");

      router.push("/admin/cms/articles");
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
    <div className="theme-page fixed inset-0 overflow-hidden">

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
          theme-page
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
                    theme-text-muted
                    transition
                    hover:opacity-80
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
                      theme-text-placeholder
                    "
                  >
                    CMS ADMIN
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      font-semibold
                      theme-text-secondary
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

                  <span
                    style={{
                      color:
                        "var(--color-primary)",
                    }}
                  >
                    CMS
                  </span>

                  <span className="theme-text-placeholder">
                    /
                  </span>

                  <span className="theme-text-muted">
                    Artikel
                  </span>

                  <span className="theme-text-placeholder">
                    /
                  </span>

                  <span className="theme-text-muted">
                    Tambah
                  </span>

                </div>

                <h1
                  className="
                    text-[26px]
                    font-bold
                    tracking-tight
                    theme-text
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
                    theme-text-secondary
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
                      theme-card
                      theme-border
                      min-w-0
                      overflow-hidden
                      rounded-xl
                      border
                      shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                    "
                  >

                    {/* HEADER CARD */}

                    <div
                      className="
                        theme-card-soft
                        theme-border-soft
                        border-b
                        px-5
                        py-4
                        sm:px-6
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-bold
                          theme-text
                        "
                      >
                        Informasi Artikel
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-xs
                          theme-text-muted
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
                            theme-text-secondary
                          "
                        >
                          Judul Artikel

                          <span
                            className="ml-1"
                            style={{
                              color:
                                "var(--color-danger)",
                            }}
                          >
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
                            theme-input
                            h-12
                            w-full
                            rounded-lg
                            border
                            px-4
                            text-sm
                            font-medium
                            outline-none
                            transition
                            placeholder:theme-text-placeholder
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            focus:border-[var(--color-primary)]
                          "
                        />

                        <p
                          className="
                            mt-2
                            text-[11px]
                            theme-text-muted
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
                              theme-text-secondary
                            "
                          >
                            Ringkasan
                          </label>

                          <span
                            className="
                              text-[10px]
                              theme-text-muted
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
                            theme-input
                            w-full
                            resize-y
                            rounded-lg
                            border
                            p-4
                            text-sm
                            leading-6
                            outline-none
                            transition
                            placeholder:theme-text-placeholder
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            focus:border-[var(--color-primary)]
                          "
                        />

                        <p
                          className="
                            mt-2
                            text-[11px]
                            theme-text-muted
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
                              theme-text-secondary
                            "
                          >
                            Konten Artikel

                            <span
                              className="ml-1"
                              style={{
                                color:
                                  "var(--color-danger)",
                              }}
                            >
                              *
                            </span>
                          </label>

                          <span
                            className="
                              text-[10px]
                              theme-text-muted
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
                            theme-input
                            w-full
                            resize-y
                            rounded-lg
                            border
                            p-4
                            text-sm
                            leading-7
                            outline-none
                            transition
                            placeholder:theme-text-placeholder
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            focus:border-[var(--color-primary)]
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
                              theme-text-muted
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
                              theme-text-muted
                            "
                          >
                            {form.konten.length}{" "}
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
                              theme-text-secondary
                            "
                          >
                            Gambar Utama
                          </label>

                          <span
                            className="
                              text-[10px]
                              theme-text-muted
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
                              theme-text-muted
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
                              theme-input
                              h-11
                              w-full
                              rounded-lg
                              border
                              pl-10
                              pr-10
                              text-sm
                              outline-none
                              transition
                              placeholder:theme-text-placeholder
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                              focus:border-[var(--color-primary)]
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
                                theme-text-muted
                                transition
                                theme-sidebar-hover
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
                            theme-text-muted
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
                              theme-card-soft
                              theme-border
                              mt-4
                              overflow-hidden
                              rounded-lg
                              border
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
                      theme-card
                      theme-border
                      h-fit
                      min-w-0
                      overflow-hidden
                      rounded-xl
                      border
                      shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                      xl:sticky
                      xl:top-5
                    "
                  >

                    {/* HEADER */}

                    <div
                      className="
                        theme-card-soft
                        theme-border-soft
                        border-b
                        px-5
                        py-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-bold
                          theme-text
                        "
                      >
                        Pengaturan
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-xs
                          theme-text-muted
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
                            theme-text-secondary
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
                            theme-input
                            h-11
                            w-full
                            rounded-lg
                            border
                            px-3
                            text-sm
                            outline-none
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            focus:border-[var(--color-primary)]
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
                              theme-text-muted
                            "
                          >
                            Memuat kategori...
                          </p>
                        ) : categories.length ===
                          0 ? (
                          <p
                            className="
                              theme-warning
                              mt-2
                              inline-block
                              rounded-md
                              px-2
                              py-1
                              text-[11px]
                              leading-5
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
                              theme-text-muted
                            "
                          >
                            Pilih kategori yang
                            sesuai dengan isi
                            artikel.
                          </p>
                        )}

                      </div>

                      {/* DIVIDER */}

                      <div className="theme-border-soft my-6 border-t" />

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
                            theme-text-secondary
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
                            theme-input
                            h-11
                            w-full
                            rounded-lg
                            border
                            px-3
                            text-sm
                            font-medium
                            outline-none
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            focus:border-[var(--color-primary)]
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
                            theme-text-muted
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
                          theme-card-soft
                          theme-border
                          mt-6
                          rounded-lg
                          border
                          p-4
                        "
                      >

                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            theme-text-muted
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
                            className="
                              h-2
                              w-2
                              rounded-full
                            "
                            style={{
                              backgroundColor:
                                isPublished
                                  ? "var(--color-success)"
                                  : "var(--color-warning)",
                            }}
                          />

                          <span
                            className="
                              text-sm
                              font-semibold
                              theme-text
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
                            theme-text-muted
                          "
                        >
                          Nilai yang dikirim ke backend:
                        </p>

                        <code
                          className="
                            theme-card
                            theme-border
                            mt-1
                            block
                            break-all
                            rounded-md
                            border
                            px-2
                            py-1
                            text-[11px]
                            font-semibold
                            theme-text-secondary
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
                          theme-border-soft
                          mt-6
                          border-t
                          pt-5
                        "
                      >

                        <button
                          type="submit"
                          disabled={saving}
                          className="
                            theme-primary
                            flex
                            h-11
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            px-4
                            text-sm
                            font-semibold
                            shadow-sm
                            transition
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
                              "/admin/cms/articles"
                            )
                          }
                          disabled={saving}
                          className="
                            theme-card
                            theme-border
                            mt-2
                            h-11
                            w-full
                            rounded-lg
                            border
                            text-sm
                            font-semibold
                            theme-text-secondary
                            transition
                            theme-table-hover
                            disabled:cursor-not-allowed
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
                  theme-border-soft
                  mt-6
                  border-t
                  pt-4
                "
              >

                <p
                  className="
                    text-[11px]
                    theme-text-muted
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