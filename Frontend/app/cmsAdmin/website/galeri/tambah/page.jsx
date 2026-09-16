"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import {
  UploadCloud,
  X,
  ArrowLeft,
  Folder,
  Tags,
  Save,
  Image as ImageIcon,
} from "lucide-react";

export default function TambahGaleri() {
  const router = useRouter();

  const [active, setActive] = useState("galeri");
  const [collapsed, setCollapsed] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    album: "",
    kategori: "",
    deskripsi: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Validasi ukuran maksimal 2MB
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB.");
      return;
    }

    // Hapus object URL sebelumnya jika ada
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const clearImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan pilih foto terlebih dahulu.");
      return;
    }

    console.log("Data yang akan disimpan:", {
      ...form,
      file,
    });

    alert("Data berhasil disimpan! (Mockup sukses)");
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 overflow-x-hidden">
      {/* ================= SIDEBAR ================= */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ================= MAIN ================= */}
      <main
        className="
          flex-1
          min-w-0
          w-full
          overflow-x-hidden
          overflow-y-auto
          bg-slate-50
          transition-all
          duration-300
        "
      >
        {/* ================= HEADER ================= */}
        <Header title="Tambah Galeri" user={{ name: "Admin" }} />

        {/* ================= CONTENT ================= */}
        <div
          className="
            w-full
            px-3
            py-4
            sm:px-4
            sm:py-5
            md:px-6
            md:py-6
            lg:px-8
            lg:py-8
            xl:px-10
          "
        >
          {/* CONTAINER */}
          <div
            className="
              w-full
              max-w-6xl
              mx-auto
              space-y-5
              sm:space-y-6
            "
          >
            {/* ================= BREADCRUMB ================= */}
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* Breadcrumb */}
              <nav
                className="min-w-0 overflow-x-auto"
                aria-label="Breadcrumb"
              >
                <ol
                  className="
                    flex
                    items-center
                    gap-1.5
                    sm:gap-2
                    whitespace-nowrap
                    text-xs
                    sm:text-sm
                    text-gray-500
                  "
                >
                  <li>
                    <a
                      href="/cmsAdmin"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      Dashboard
                    </a>
                  </li>

                  <li className="text-gray-300">/</li>

                  <li>
                    <a
                      href="/cmsAdmin/website/galeri"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      Galeri
                    </a>
                  </li>

                  <li className="text-gray-300">/</li>

                  <li className="font-medium text-indigo-600">
                    Tambah Baru
                  </li>
                </ol>
              </nav>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => router.back()}
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  text-xs
                  sm:text-sm
                  font-medium
                  text-gray-600
                  hover:text-indigo-600
                  transition-colors
                "
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                Kembali
              </button>
            </div>

            {/* ================= FORM CARD ================= */}
            <div
              className="
                w-full
                bg-white
                rounded-xl
                sm:rounded-2xl
                border
                border-gray-100
                shadow-sm
                overflow-hidden
              "
            >
              {/* ================= FORM HEADER ================= */}
              <div
                className="
                  border-b
                  border-gray-100
                  bg-gray-50/70
                  px-4
                  py-4
                  sm:px-6
                  sm:py-5
                  lg:px-7
                  lg:py-6
                "
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="
                      shrink-0
                      p-2
                      sm:p-2.5
                      bg-indigo-50
                      text-indigo-600
                      rounded-lg
                      sm:rounded-xl
                    "
                  >
                    <UploadCloud className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h2
                      className="
                        text-base
                        sm:text-lg
                        font-bold
                        text-gray-900
                      "
                    >
                      Form Tambah Foto
                    </h2>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        sm:text-sm
                        text-gray-500
                        leading-relaxed
                      "
                    >
                      Upload foto baru ke dalam galeri website
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= FORM ================= */}
              <form
                onSubmit={handleSubmit}
                className="
                  p-4
                  sm:p-6
                  lg:p-7
                  space-y-6
                "
              >
                {/* ================= MAIN GRID ================= */}
                <div
                  className="
                    grid
                    grid-cols-1
                    xl:grid-cols-5
                    gap-6
                    lg:gap-8
                  "
                >
                  {/* ================= UPLOAD ================= */}
                  <div
                    className="
                      xl:col-span-2
                      min-w-0
                      space-y-3
                    "
                  >
                    <div>
                      <label
                        htmlFor="file-upload"
                        className="
                          block
                          text-sm
                          font-medium
                          text-gray-700
                        "
                      >
                        Upload Foto{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <p className="mt-1 text-xs text-gray-400">
                        Pilih gambar untuk ditampilkan di galeri
                      </p>
                    </div>

                    {/* Upload Box */}
                    <div
                      className={`
                        relative
                        w-full
                        min-h-[240px]
                        sm:min-h-[260px]
                        lg:min-h-[280px]
                        xl:min-h-[300px]
                        border-2
                        border-dashed
                        rounded-xl
                        sm:rounded-2xl
                        overflow-hidden
                        transition-all
                        ${
                          preview
                            ? "border-indigo-300 bg-indigo-50/30"
                            : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30"
                        }
                      `}
                    >
                      {preview ? (
                        <div className="relative w-full h-full min-h-[240px] sm:min-h-[260px] lg:min-h-[280px] xl:min-h-[300px] group">
                          <img
                            src={preview}
                            alt="Preview"
                            className="
                              absolute
                              inset-0
                              w-full
                              h-full
                              object-cover
                            "
                          />

                          {/* Overlay */}
                          <div
                            className="
                              absolute
                              inset-0
                              bg-black/40
                              opacity-0
                              group-hover:opacity-100
                              transition-opacity
                              flex
                              items-center
                              justify-center
                            "
                          >
                            <button
                              type="button"
                              onClick={clearImage}
                              className="
                                p-3
                                bg-white
                                rounded-full
                                hover:bg-red-50
                                text-red-500
                                transition-colors
                                shadow-lg
                              "
                              aria-label="Hapus gambar"
                            >
                              <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="file-upload"
                          className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            w-full
                            min-h-[240px]
                            sm:min-h-[260px]
                            lg:min-h-[280px]
                            xl:min-h-[300px]
                            cursor-pointer
                            p-5
                            text-center
                          "
                        >
                          <div
                            className="
                              p-3
                              sm:p-4
                              bg-indigo-50
                              rounded-full
                              mb-3
                            "
                          >
                            <UploadCloud
                              className="
                                w-7
                                h-7
                                sm:w-8
                                sm:h-8
                                text-indigo-600
                              "
                            />
                          </div>

                          <p
                            className="
                              text-sm
                              font-semibold
                              text-gray-700
                            "
                          >
                            Klik untuk upload gambar
                          </p>

                          <p
                            className="
                              text-xs
                              text-gray-400
                              mt-1
                              max-w-[220px]
                              leading-relaxed
                            "
                          >
                            PNG, JPG, atau WEBP
                            <br />
                            Maksimal 2MB
                          </p>

                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileChange}
                          />
                        </label>
                      )}
                    </div>

                    {/* File Information */}
                    {file && (
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          p-3
                          bg-gray-50
                          border
                          border-gray-100
                          rounded-xl
                          min-w-0
                        "
                      >
                        <ImageIcon
                          className="
                            w-4
                            h-4
                            text-indigo-500
                            shrink-0
                          "
                        />

                        <span
                          className="
                            text-xs
                            text-gray-600
                            truncate
                            min-w-0
                          "
                        >
                          {file.name}
                        </span>

                        <button
                          type="button"
                          onClick={clearImage}
                          className="
                            ml-auto
                            shrink-0
                            text-gray-400
                            hover:text-red-500
                          "
                          aria-label="Hapus file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ================= DETAIL ================= */}
                  <div
                    className="
                      xl:col-span-3
                      min-w-0
                      space-y-5
                    "
                  >
                    <div
                      className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                      "
                    >
                      {/* Judul */}
                      <div className="sm:col-span-2 min-w-0">
                        <label
                          htmlFor="judul"
                          className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            mb-1.5
                          "
                        >
                          Judul Foto{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          id="judul"
                          name="judul"
                          required
                          value={form.judul}
                          onChange={handleInputChange}
                          placeholder="Contoh: Upacara HUT RI ke-79"
                          className="
                            w-full
                            min-w-0
                            px-3.5
                            sm:px-4
                            py-2.5
                            border
                            text-gray-900
                            border-gray-200
                            rounded-lg
                            sm:rounded-xl
                            bg-gray-50/50
                            text-sm
                            placeholder:text-gray-400
                            focus:outline-none
                            focus:ring-2
                            focus:ring-indigo-500/20
                            focus:border-indigo-500
                            transition-all
                          "
                        />
                      </div>

                      {/* Album */}
                      <div className="min-w-0">
                        <label
                          htmlFor="album"
                          className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            mb-1.5
                          "
                        >
                          Album{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Folder
                            className="
                              absolute
                              left-3
                              top-1/2
                              -translate-y-1/2
                              w-4
                              h-4
                              text-gray-400
                              pointer-events-none
                            "
                          />

                          <select
                            id="album"
                            name="album"
                            required
                            value={form.album}
                            onChange={handleInputChange}
                            className="
                              w-full
                              min-w-0
                              pl-10
                              pr-8
                              py-2.5
                              border
                              text-gray-900
                              border-gray-200
                              rounded-lg
                              sm:rounded-xl
                              bg-gray-50/50
                              text-sm
                              focus:outline-none
                              focus:ring-2
                              focus:ring-indigo-500/20
                              focus:border-indigo-500
                              transition-all
                              appearance-none
                            "
                          >
                            <option value="">Pilih Album</option>
                            <option value="Kegiatan">
                              Kegiatan
                            </option>
                            <option value="Infrastruktur">
                              Infrastruktur
                            </option>
                            <option value="Penghargaan">
                              Penghargaan
                            </option>
                            <option value="Lainnya">
                              Lainnya
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Kategori */}
                      <div className="min-w-0">
                        <label
                          htmlFor="kategori"
                          className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            mb-1.5
                          "
                        >
                          Kategori
                        </label>

                        <div className="relative">
                          <Tags
                            className="
                              absolute
                              left-3
                              top-1/2
                              -translate-y-1/2
                              w-4
                              h-4
                              text-gray-400
                              pointer-events-none
                            "
                          />

                          <select
                            id="kategori"
                            name="kategori"
                            value={form.kategori}
                            onChange={handleInputChange}
                            className="
                              w-full
                              min-w-0
                              pl-10
                              pr-8
                              py-2.5
                              border
                              text-gray-900
                              border-gray-200
                              rounded-lg
                              sm:rounded-xl
                              bg-gray-50/50
                              text-sm
                              focus:outline-none
                              focus:ring-2
                              focus:ring-indigo-500/20
                              focus:border-indigo-500
                              transition-all
                              appearance-none
                            "
                          >
                            <option value="">
                              Pilih Kategori
                            </option>
                            <option value="Dokumentasi">
                              Dokumentasi
                            </option>
                            <option value="Bangunan">
                              Bangunan
                            </option>
                            <option value="Fasilitas">
                              Fasilitas
                            </option>
                            <option value="Apresiasi">
                              Apresiasi
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Deskripsi */}
                      <div className="sm:col-span-2 min-w-0">
                        <label
                          htmlFor="deskripsi"
                          className="
                            block
                            text-sm
                            font-medium
                            text-gray-700
                            mb-1.5
                          "
                        >
                          Deskripsi
                        </label>

                        <textarea
                          id="deskripsi"
                          name="deskripsi"
                          rows={5}
                          value={form.deskripsi}
                          onChange={handleInputChange}
                          placeholder="Tambahkan deskripsi singkat mengenai foto ini..."
                          className="
                            w-full
                            min-w-0
                            px-3.5
                            sm:px-4
                            py-2.5
                            border
                            text-gray-900
                            border-gray-200
                            rounded-lg
                            sm:rounded-xl
                            bg-gray-50/50
                            text-sm
                            placeholder:text-gray-400
                            focus:outline-none
                            focus:ring-2
                            focus:ring-indigo-500/20
                            focus:border-indigo-500
                            transition-all
                            resize-none
                          "
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= FOOTER ================= */}
                <div
                  className="
                    border-t
                    border-gray-100
                    pt-5
                    sm:pt-6
                    flex
                    flex-col-reverse
                    sm:flex-row
                    gap-3
                    sm:justify-end
                  "
                >
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="
                      w-full
                      sm:w-auto
                      px-5
                      sm:px-6
                      py-2.5
                      rounded-lg
                      sm:rounded-xl
                      border
                      border-gray-200
                      bg-white
                      text-gray-700
                      font-medium
                      text-sm
                      hover:bg-gray-50
                      transition-colors
                    "
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="
                      w-full
                      sm:w-auto
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      sm:px-6
                      py-2.5
                      rounded-lg
                      sm:rounded-xl
                      bg-indigo-600
                      text-white
                      font-medium
                      text-sm
                      shadow-sm
                      hover:bg-indigo-700
                      hover:shadow-md
                      transition-all
                      duration-200
                    "
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    Simpan Galeri
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}