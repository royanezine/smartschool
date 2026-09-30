"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

// ============================================================
// DUMMY DATA FASILITAS
// ============================================================
const fasilitasList = [
  {
    id: "fs-001",
    nama: "Lapangan Basket",
    lokasi: "Area Belakang",
    kategori: "Olahraga",
    kondisi: "Baik",
    kapasitas: "30 orang",
    foto: null,
  },
  {
    id: "fs-002",
    nama: "Aula Sekolah",
    lokasi: "Gedung Utama Lt. 1",
    kategori: "Umum",
    kondisi: "Baik",
    kapasitas: "300 orang",
    foto: null,
  },
  {
    id: "fs-003",
    nama: "Lab Komputer",
    lokasi: "Gedung B Lt. 2",
    kategori: "Laboratorium",
    kondisi: "Rusak Ringan",
    kapasitas: "40 orang",
    foto: null,
  },
  {
    id: "fs-004",
    nama: "Perpustakaan",
    lokasi: "Gedung A Lt. 1",
    kategori: "Umum",
    kondisi: "Baik",
    kapasitas: "60 orang",
    foto: null,
  },
  {
    id: "fs-005",
    nama: "Lab IPA",
    lokasi: "Gedung B Lt. 1",
    kategori: "Laboratorium",
    kondisi: "Rusak Berat",
    kapasitas: "35 orang",
    foto: null,
  },
  {
    id: "fs-006",
    nama: "Musala",
    lokasi: "Area Tengah",
    kategori: "Ibadah",
    kondisi: "Baik",
    kapasitas: "100 orang",
    foto: null,
  },
];

// ============================================================
// THEME CONFIG KONDISI
// ============================================================
const kondisiStyle = {
  Baik: {
    text: "theme-success",
    background:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
  },

  "Rusak Ringan": {
    text: "theme-warning",
    background:
      "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
  },

  "Rusak Berat": {
    text: "theme-danger",
    background:
      "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]",
  },
};

// ============================================================
// KATEGORI
// ============================================================
const kategoriOptions = [
  "Semua",
  "Olahraga",
  "Umum",
  "Laboratorium",
  "Ibadah",
];

// ============================================================
// THEME HELPERS
// ============================================================
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimarySoftHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorderHover =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryGradientHover =
  "hover:brightness-95";

const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

// ============================================================
// PAGE
// ============================================================
export default function FasilitasPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] =
    useState("Semua");

  const notifications = [
    {
      id: 1,
      title: "Lab IPA dilaporkan rusak berat",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // FILTER
  // ============================================================
  const filteredList = fasilitasList.filter((f) => {
    const matchSearch =
      f.nama
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      f.lokasi
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchKategori =
      kategoriFilter === "Semua" ||
      f.kategori === kategoriFilter;

    return matchSearch && matchKategori;
  });

  // ============================================================
  // DETAIL
  // ============================================================
  const handleOpenDetail = (id) => {
    router.push(`/adminSarpras/fasilitas/${id}`);
  };

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        role="adminSarpras"
        active="fasilitas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Admin Sarpras",
            email: "adminsarpras@smartschool.com",
            avatar: "SP",
          }}
        />

        <main className="theme-page flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

              <div className="min-w-0">
                <p className="theme-primary text-xs font-medium uppercase tracking-wide">
                  Sarana & Prasarana
                </p>

                <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">
                  Fasilitas
                </h1>

                <p className="theme-text-secondary mt-1 text-sm">
                  Kelola data fasilitas sekolah beserta kondisi dan lokasinya.
                </p>
              </div>

              {/* TAMBAH */}
              <button
                onClick={() =>
                  router.push(
                    "/adminSarpras/fasilitas/tambah"
                  )
                }
                className={`inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${themePrimaryGradient} ${themePrimaryGradientHover} ${themePrimaryShadow}`}
              >
                <Plus
                  size={16}
                  className="text-[var(--color-card)]"
                />

                <span className="text-[var(--color-card)]">
                  Tambah Fasilitas
                </span>
              </button>
            </div>

            {/* ==================================================
                SEARCH & FILTER
            ================================================== */}
            <div
              className={`theme-card theme-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row ${themeCardShadow}`}
            >

              {/* SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari nama atau lokasi fasilitas..."
                  className={`theme-input theme-text w-full rounded-xl border px-10 py-2.5 text-sm outline-none transition-colors ${themeFocus}`}
                />
              </div>

              {/* FILTER */}
              <div className="relative">
                <SlidersHorizontal
                  size={14}
                  className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <select
                  value={kategoriFilter}
                  onChange={(e) =>
                    setKategoriFilter(e.target.value)
                  }
                  className={`theme-input theme-text min-w-[160px] appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-sm outline-none transition-colors ${themeFocus}`}
                >
                  {kategoriOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ==================================================
                GRID FASILITAS
            ================================================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {filteredList.map((f) => {
                const kondisi =
                  kondisiStyle[f.kondisi] ||
                  kondisiStyle.Baik;

                return (
                  <button
                    key={f.id}
                    onClick={() =>
                      handleOpenDetail(f.id)
                    }
                    className={`theme-card theme-border group overflow-hidden rounded-2xl border text-left transition-all duration-300 ${themePrimaryBorderHover} ${themeCardShadow} ${themeCardHoverShadow}`}
                  >

                    {/* ==================================================
                        IMAGE / COVER
                    ================================================== */}
                    <div
                      className={`flex h-32 items-center justify-center transition-colors ${themePrimarySoft} ${themePrimarySoftHover}`}
                    >
                      <div
                        className={`rounded-2xl p-3 ${themeSoftSurface}`}
                      >
                        <Building2
                          size={32}
                          className="theme-primary"
                        />
                      </div>
                    </div>

                    {/* ==================================================
                        CONTENT
                    ================================================== */}
                    <div className="p-4">

                      <div className="flex items-start justify-between gap-2">

                        <h3 className="theme-text truncate text-sm font-semibold">
                          {f.nama}
                        </h3>

                        <ChevronRight
                          size={16}
                          className="theme-text-muted mt-0.5 flex-shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                        />
                      </div>

                      {/* LOKASI */}
                      <div className="theme-text-secondary mt-1.5 flex items-center gap-1.5 text-xs">
                        <MapPin
                          size={12}
                          className="flex-shrink-0"
                        />

                        <span className="truncate">
                          {f.lokasi}
                        </span>
                      </div>

                      {/* FOOTER CARD */}
                      <div className="mt-3 flex items-center justify-between">

                        <span className="theme-text-muted text-[11px]">
                          {f.kapasitas}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${kondisi.text} ${kondisi.background} ${kondisi.border}`}
                        >
                          {f.kondisi}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* ==================================================
                  EMPTY STATE
              ================================================== */}
              {filteredList.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <div
                    className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft}`}
                  >
                    <Building2
                      size={22}
                      className="theme-primary"
                    />
                  </div>

                  <p className="theme-text-secondary text-sm">
                    Tidak ada fasilitas yang cocok dengan pencarian.
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}