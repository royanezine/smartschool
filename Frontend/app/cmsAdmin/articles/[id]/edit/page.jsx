"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import { apiFetch } from "../../../../../lib/api";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categories, setCategories] = useState([]);

  /*
   * State sidebar.
   * Default true (expanded).
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    judul: "",
    kategoriArtikelId: "",
    ringkasan: "",
    konten: "",
    gambarUtama: "",
    status: "draft",
  });

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      /* =====================================================
         AMBIL ARTIKEL
      ===================================================== */

      const artikelResponse = await apiFetch(
        "/api/v1/cms/artikel"
      );

      let artikelList = [];

      if (Array.isArray(artikelResponse)) {
        artikelList = artikelResponse;
      } else if (Array.isArray(artikelResponse?.data)) {
        artikelList = artikelResponse.data;
      } else if (
        Array.isArray(artikelResponse?.data?.data)
      ) {
        artikelList = artikelResponse.data.data;
      } else if (
        Array.isArray(artikelResponse?.result)
      ) {
        artikelList = artikelResponse.result;
      } else if (
        Array.isArray(artikelResponse?.result?.data)
      ) {
        artikelList = artikelResponse.result.data;
      }

      const selectedArticle = artikelList.find(
        (item) => String(item?.id) === String(id)
      );

      if (!selectedArticle) {
        throw new Error(
          "Artikel yang ingin diedit tidak ditemukan."
        );
      }

      /* =====================================================
         AMBIL KATEGORI
      ===================================================== */

      const kategoriResponse = await apiFetch(
        "/api/v1/cms/kategori-artikel"
      );

      let kategoriList = [];

      if (Array.isArray(kategoriResponse)) {
        kategoriList = kategoriResponse;
      } else if (
        Array.isArray(kategoriResponse?.data)
      ) {
        kategoriList = kategoriResponse.data;
      } else if (
        Array.isArray(kategoriResponse?.data?.data)
      ) {
        kategoriList = kategoriResponse.data.data;
      } else if (
        Array.isArray(kategoriResponse?.result)
      ) {
        kategoriList = kategoriResponse.result;
      } else if (
        Array.isArray(kategoriResponse?.result?.data)
      ) {
        kategoriList = kategoriResponse.result.data;
      }

      setCategories(kategoriList);

      /* =====================================================
         SET FORM
      ===================================================== */

      setForm({
        judul: selectedArticle?.judul || "",
        kategoriArtikelId:
          selectedArticle?.kategoriArtikelId ||
          selectedArticle?.kategoriArtikel?.id ||
          "",
        ringkasan:
          selectedArticle?.ringkasan ||
          selectedArticle?.excerpt ||
          "",
        konten:
          selectedArticle?.konten ||
          selectedArticle?.isi ||
          "",
        gambarUtama:
          selectedArticle?.gambarUtama ||
          selectedArticle?.gambar ||
          "",
        status:
          selectedArticle?.status ||
          "draft",
      });
    } catch (err) {
      console.error("LOAD EDIT ARTIKEL ERROR:", err);

      setError(
        err?.message ||
          "Gagal mengambil data artikel."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      setError("ID artikel tidak ditemukan.");
      return;
    }

    if (!form.judul.trim()) {
      setError("Judul artikel wajib diisi.");
      return;
    }

    if (!form.kategoriArtikelId) {
      setError("Kategori artikel wajib dipilih.");
      return;
    }

    if (!form.konten.trim()) {
      setError("Konten artikel wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        judul: form.judul.trim(),
        kategoriArtikelId:
          form.kategoriArtikelId,
        ringkasan: form.ringkasan.trim(),
        konten: form.konten,
        gambarUtama:
          form.gambarUtama.trim() || null,
        status: form.status,
      };

      await apiFetch(
        `/api/v1/cms/artikel/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      setSuccess(
        "Artikel berhasil diperbarui."
      );

      setTimeout(() => {
        router.push("/cmsAdmin/articles");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(
        "UPDATE ARTIKEL ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui artikel."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar
          role="cms"
          collapsed={!sidebarOpen}
          setCollapsed={(value) => {
            const next =
              typeof value === "function"
                ? value(!sidebarOpen)
                : value;

            setSidebarOpen(!next);
          }}
        />

        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-30 shrink-0">
            <Header
              onMenuClick={() =>
                setSidebarOpen((prev) => !prev)
              }
            />
          </div>

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

              <p className="text-sm">
                Memuat data artikel...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="cms"
        collapsed={!sidebarOpen}
        setCollapsed={(value) => {
          const next =
            typeof value === "function"
              ? value(!sidebarOpen)
              : value;

          setSidebarOpen(!next);
        }}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* ===================================================
            HEADER (STICKY)
        =================================================== */}

        <div className="sticky top-0 z-30 shrink-0">
          <Header
            onMenuClick={() =>
              setSidebarOpen((prev) => !prev)
            }
          />
        </div>

        {/* ===================================================
            MAIN (SCROLL INTERNAL)
        =================================================== */}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">
            {/* =================================================
                TOP BAR
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Link
                    href="/cmsAdmin/articles"
                    className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-blue-600"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                  </Link>
                </div>

                <h1 className="text-2xl font-bold text-slate-900">
                  Edit Artikel
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Perbarui informasi dan isi artikel.
                </p>
              </div>
            </div>

            {/* =================================================
                ALERT ERROR
            ================================================= */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                ALERT SUCCESS
            ================================================= */}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-semibold">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* =================================================
                  INFORMASI ARTIKEL
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Informasi Artikel
                      </h2>

                      <p className="text-sm text-slate-500">
                        Informasi utama artikel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  {/* JUDUL */}

                  <div>
                    <label
                      htmlFor="judul"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Judul Artikel
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="judul"
                      name="judul"
                      type="text"
                      value={form.judul}
                      onChange={handleChange}
                      placeholder="Masukkan judul artikel"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* KATEGORI */}

                  <div>
                    <label
                      htmlFor="kategoriArtikelId"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Kategori
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      id="kategoriArtikelId"
                      name="kategoriArtikelId"
                      value={form.kategoriArtikelId}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Pilih kategori
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* RINGKASAN */}

                  <div>
                    <label
                      htmlFor="ringkasan"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Ringkasan
                    </label>

                    <textarea
                      id="ringkasan"
                      name="ringkasan"
                      value={form.ringkasan}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Masukkan ringkasan singkat artikel"
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* GAMBAR */}

                  <div>
                    <label
                      htmlFor="gambarUtama"
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
                    >
                      <ImageIcon className="h-4 w-4" />
                      URL Gambar Utama
                    </label>

                    <input
                      id="gambarUtama"
                      name="gambarUtama"
                      type="text"
                      value={form.gambarUtama}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {form.gambarUtama && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={form.gambarUtama}
                          alt="Preview gambar utama"
                          className="max-h-64 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  KONTEN
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="font-semibold text-slate-900">
                    Konten Artikel
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Tulis isi artikel yang akan ditampilkan.
                  </p>
                </div>

                <div className="p-6">
                  <label
                    htmlFor="konten"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Konten
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    id="konten"
                    name="konten"
                    value={form.konten}
                    onChange={handleChange}
                    rows={18}
                    placeholder="Tulis konten artikel..."
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Kamu bisa memasukkan teks atau HTML
                    sesuai format yang digunakan CMS kamu.
                  </p>
                </div>
              </section>

              {/* =================================================
                  STATUS
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="font-semibold text-slate-900">
                    Status Publikasi
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Tentukan apakah artikel disimpan sebagai
                    draft atau langsung dipublikasikan.
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* DRAFT */}

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          status: "draft",
                        }))
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        form.status === "draft"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Draft
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Artikel belum ditampilkan ke
                            publik.
                          </p>
                        </div>

                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            form.status === "draft"
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300"
                          }`}
                        />
                      </div>
                    </button>

                    {/* PUBLISHED */}

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          status: "dipublikasikan",
                        }))
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        form.status ===
                        "dipublikasikan"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Publikasikan
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Artikel dapat ditampilkan ke
                            publik.
                          </p>
                        </div>

                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            form.status ===
                            "dipublikasikan"
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================
                  BUTTON
              ================================================= */}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/cmsAdmin/articles"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}