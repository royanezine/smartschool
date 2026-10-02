"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  Package,
  ArrowLeft,
  Save,
  Tag,
  MapPin,
  Boxes,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  X,
} from "lucide-react";

const kategoriOptions = [
  "Furnitur",
  "Elektronik",
  "Alat Belajar",
  "Laboratorium",
];

const kondisiOptions = [
  "Baik",
  "Rusak Ringan",
  "Rusak Berat",
];

// ============================================================
// GLOBAL THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeDangerText =
  "text-[var(--color-danger)]";

// ============================================================
// PAGE
// ============================================================

export default function TambahIventarisPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");

  const [form, setForm] = useState({
    nama: "",
    kategori: kategoriOptions[0],
    lokasi: "",
    stok: "",
    kondisi: kondisiOptions[0],
    deskripsi: "",
  });

  const notifications = [
    {
      id: 1,
      title: "Stok papan tulis menipis",
      desc: "Dikirim 3 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // FORM HANDLERS
  // ============================================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setFileName("");
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // TODO: ganti dengan pemanggilan API asli (POST /api/iventaris)
    await new Promise((resolve) => setTimeout(resolve, 600));

    setSaving(false);
    router.push("/adminSarpras/iventaris");
  };

  const isValid =
    form.nama.trim() !== "" &&
    form.lokasi.trim() !== "" &&
    form.stok !== "";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page flex min-h-screen">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        role="adminSarpras"
        active="iventaris"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Admin Sarpras",
            email: "adminsarpras@smartschool.com",
            avatar: "SP",
          }}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <div className="w-full space-y-4 sm:space-y-6">

            {/* ==================================================
                BACK + PAGE HEADER
            ================================================== */}

            <div>
              <button
                onClick={() =>
                  router.push("/adminSarpras/iventaris")
                }
                className="theme-text-muted mb-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={14} />
                Kembali ke Inventaris
              </button>

              <p className="theme-primary text-xs font-medium uppercase tracking-wide">
                Sarana & Prasarana
              </p>

              <h1 className="theme-text mt-1 text-xl font-bold tracking-tight leading-snug sm:text-2xl lg:text-[28px]">
                Tambah Inventaris
              </h1>

              <p className="theme-text-secondary mt-1 text-sm">
                Lengkapi form berikut untuk menambahkan barang inventaris
                baru.
              </p>
            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-2xl border`}
            >
              {/* ==================================================
                  UPLOAD FOTO
              ================================================== */}

              <div
                className={`border-b ${themeDivider} p-4 sm:p-5`}
              >
                <label className="theme-text-secondary mb-2 block text-xs font-medium">
                  Foto Barang (opsional)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="foto-barang"
                />

                {/* PREVIEW */}
                {previewUrl ? (
                  <div
                    className={`relative h-32 overflow-hidden rounded-xl border sm:h-40 lg:h-48 ${themeNeutralBorder}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview barang"
                      className="h-full w-full object-cover"
                    />

                    {/* REMOVE IMAGE */}
                    <button
                      type="button"
                      onClick={clearFile}
                      className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full ${themeNeutralSurface} theme-text transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_12%,transparent)]`}
                    >
                      <X size={14} />
                    </button>

                    {/* FILE NAME */}
                    <span className="absolute bottom-0 left-0 right-0 bg-[color-mix(in_srgb,var(--color-text)_55%,transparent)] px-2.5 py-1 text-[11px] text-[var(--color-card)] backdrop-blur-sm">
                      {fileName}
                    </span>
                  </div>
                ) : (
                  <label
                    htmlFor="foto-barang"
                    className={`flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-colors sm:h-36 lg:h-44 ${themeNeutralBorder} ${themeNeutralSurface} hover:border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]`}
                  >
                    <ImageIcon
                      size={20}
                      className="theme-text-placeholder sm:h-[22px] sm:w-[22px]"
                    />

                    <span className="theme-text-placeholder px-4 text-center text-xs">
                      Ketuk untuk pilih gambar
                    </span>
                  </label>
                )}
              </div>

              {/* ==================================================
                  FORM CONTENT
              ================================================== */}

              <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">

                {/* ==================================================
                    NAMA BARANG
                ================================================== */}

                <div className="max-w-xl">
                  <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                    Nama Barang{" "}
                    <span className="theme-danger">*</span>
                  </label>

                  <div className="relative">
                    <Package
                      size={16}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={form.nama}
                      onChange={(e) =>
                        handleChange("nama", e.target.value)
                      }
                      placeholder="Contoh: Kursi Kayu"
                      required
                      className={`theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm transition-colors ${themeFocus}`}
                    />
                  </div>
                </div>

                {/* ==================================================
                    KATEGORI + KONDISI + LOKASI
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">

                  {/* KATEGORI */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                      Kategori
                    </label>

                    <div className="relative">
                      <Tag
                        size={16}
                        className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      />

                      <select
                        value={form.kategori}
                        onChange={(e) =>
                          handleChange(
                            "kategori",
                            e.target.value
                          )
                        }
                        className={`theme-input w-full appearance-none rounded-xl py-2.5 pl-10 pr-9 text-sm transition-colors ${themeFocus}`}
                      >
                        {kategoriOptions.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={15}
                        className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>

                  {/* KONDISI */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                      Kondisi
                    </label>

                    <div className="relative">
                      <select
                        value={form.kondisi}
                        onChange={(e) =>
                          handleChange(
                            "kondisi",
                            e.target.value
                          )
                        }
                        className={`theme-input w-full appearance-none rounded-xl py-2.5 pl-4 pr-9 text-sm transition-colors ${themeFocus}`}
                      >
                        {kondisiOptions.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={15}
                        className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>

                  {/* LOKASI */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                      Lokasi{" "}
                      <span className="theme-danger">*</span>
                    </label>

                    <div className="relative">
                      <MapPin
                        size={16}
                        className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="text"
                        value={form.lokasi}
                        onChange={(e) =>
                          handleChange(
                            "lokasi",
                            e.target.value
                          )
                        }
                        placeholder="Contoh: Gudang A"
                        required
                        className={`theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm transition-colors ${themeFocus}`}
                      />
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    STOK
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                      Jumlah Stok{" "}
                      <span className="theme-danger">*</span>
                    </label>

                    <div className="relative">
                      <Boxes
                        size={16}
                        className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={form.stok}
                        onChange={(e) =>
                          handleChange(
                            "stok",
                            e.target.value
                          )
                        }
                        placeholder="Contoh: 20"
                        required
                        className={`theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm transition-colors ${themeFocus}`}
                      />
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    DESKRIPSI
                ================================================== */}

                <div>
                  <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                    Deskripsi (opsional)
                  </label>

                  <div className="relative">
                    <FileText
                      size={16}
                      className="theme-text-muted absolute left-3.5 top-3"
                    />

                    <textarea
                      value={form.deskripsi}
                      onChange={(e) =>
                        handleChange(
                          "deskripsi",
                          e.target.value
                        )
                      }
                      placeholder="Catatan tambahan tentang barang ini..."
                      rows={4}
                      className={`theme-input w-full resize-none rounded-xl py-2.5 pl-10 pr-4 text-sm transition-colors ${themeFocus}`}
                    />
                  </div>
                </div>
              </div>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div
                className={`flex flex-col-reverse gap-2.5 border-t ${themeDivider} ${themeNeutralSurface} px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-5`}
              >
                {/* BATAL */}
                <button
                  type="button"
                  onClick={() =>
                    router.push("/adminSarpras/iventaris")
                  }
                  className={`theme-text-secondary ${themeNeutralHover} w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto`}
                >
                  Batal
                </button>

                {/* SIMPAN */}
                <button
                  type="submit"
                  disabled={!isValid || saving}
                  className={`w-full rounded-xl px-5 py-2.5 text-sm font-medium transition-all sm:w-auto ${
                    !isValid || saving
                      ? `${themeNeutralSurface} theme-text-placeholder cursor-not-allowed`
                      : `${themePrimaryGradient} ${themePrimaryShadow} text-[var(--color-card)] hover:brightness-[1.04]`
                  } inline-flex items-center justify-center gap-2`}
                >
                  <Save size={16} />

                  {saving
                    ? "Menyimpan..."
                    : "Simpan Barang"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}