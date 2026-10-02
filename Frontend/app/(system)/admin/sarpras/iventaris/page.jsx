"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  Package,
  Search,
  Plus,
  ChevronRight,
  SlidersHorizontal,
  Boxes,
} from "lucide-react";

// ============================================================
// DUMMY DATA INVENTARIS
// ============================================================

const iventarisList = [
  {
    id: "inv-001",
    nama: "Kursi Kayu",
    kategori: "Furnitur",
    lokasi: "Gudang A",
    stok: 120,
    kondisi: "Baik",
  },
  {
    id: "inv-002",
    nama: "Proyektor Epson",
    kategori: "Elektronik",
    lokasi: "Lab Komputer",
    stok: 5,
    kondisi: "Baik",
  },
  {
    id: "inv-003",
    nama: "Meja Guru",
    kategori: "Furnitur",
    lokasi: "Ruang Guru",
    stok: 30,
    kondisi: "Rusak Ringan",
  },
  {
    id: "inv-004",
    nama: "AC Split 1PK",
    kategori: "Elektronik",
    lokasi: "Ruang Kepala Sekolah",
    stok: 8,
    kondisi: "Baik",
  },
  {
    id: "inv-005",
    nama: "Papan Tulis",
    kategori: "Alat Belajar",
    lokasi: "Gudang B",
    stok: 15,
    kondisi: "Rusak Berat",
  },
  {
    id: "inv-006",
    nama: "Mikroskop",
    kategori: "Laboratorium",
    lokasi: "Lab IPA",
    stok: 20,
    kondisi: "Baik",
  },
  {
    id: "inv-007",
    nama: "Sound System",
    kategori: "Elektronik",
    lokasi: "Aula",
    stok: 2,
    kondisi: "Baik",
  },
  {
    id: "inv-008",
    nama: "Lemari Arsip",
    kategori: "Furnitur",
    lokasi: "Ruang TU",
    stok: 10,
    kondisi: "Rusak Ringan",
  },
];

// ============================================================
// GLOBAL THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

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
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// KONDISI STYLE
// ============================================================

const kondisiStyle = {
  Baik: [
    "theme-success",
    "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
    "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
  ].join(" "),

  "Rusak Ringan": [
    "theme-warning",
    "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
    "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
  ].join(" "),

  "Rusak Berat": [
    "theme-danger",
    "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]",
    "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]",
  ].join(" "),
};

const kategoriOptions = [
  "Semua",
  "Furnitur",
  "Elektronik",
  "Alat Belajar",
  "Laboratorium",
];

// ============================================================
// PAGE
// ============================================================

export default function IventarisPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");

  const notifications = [
    {
      id: 1,
      title: "Stok papan tulis menipis",
      desc: "Dikirim 3 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // FILTER DATA
  // ============================================================

  const filteredList = iventarisList.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(search.toLowerCase());

    const matchKategori =
      kategoriFilter === "Semua" ||
      item.kategori === kategoriFilter;

    return matchSearch && matchKategori;
  });

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleOpenDetail = (id) => {
    router.push(`/adminSarpras/iventaris/${id}`);
  };

  const handleTambah = () => {
    router.push("/adminSarpras/iventaris/tambah");
  };

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

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
                  Inventaris
                </h1>

                <p className="theme-text-secondary mt-1 text-sm">
                  Kelola data barang inventaris, stok, dan kondisinya.
                </p>
              </div>

              {/* TAMBAH INVENTARIS */}
              <button
                onClick={handleTambah}
                className={`inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-card)] transition-all ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-[1.04]`}
              >
                <Plus size={16} />
                Tambah Inventaris
              </button>
            </div>

            {/* ==================================================
                SEARCH & FILTER
            ================================================== */}

            <div
              className={`theme-card ${themeDivider} ${themeCardShadow} flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row`}
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau lokasi barang..."
                  className={`theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm transition-colors ${themeFocus}`}
                />
              </div>

              {/* FILTER KATEGORI */}
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
                  className={`theme-input appearance-none rounded-xl py-2.5 pl-9 pr-8 text-sm transition-colors ${themeFocus}`}
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
                TABLE INVENTARIS
            ================================================== */}

            <div
              className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-2xl border`}
            >
              {/* TABLE HEADER */}
              <div
                className={`flex items-center justify-between gap-2 border-b ${themeDivider} px-5 py-4`}
              >
                <div className="flex min-w-0 items-center gap-2.5">

                  {/* ICON */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} theme-primary`}
                  >
                    <Boxes size={16} />
                  </div>

                  {/* TITLE */}
                  <div className="min-w-0">
                    <h3 className="theme-text truncate text-sm font-semibold">
                      Daftar Barang
                    </h3>

                    <p className="theme-text-muted text-xs">
                      {filteredList.length} barang ditemukan
                    </p>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`theme-text-muted border-b ${themeDivider} text-left text-xs`}
                    >
                      <th className="px-5 py-3 font-medium">
                        Nama Barang
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Kategori
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Lokasi
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Stok
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Kondisi
                      </th>

                      <th className="w-8 px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredList.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() =>
                          handleOpenDetail(item.id)
                        }
                        className={`group cursor-pointer border-b ${themeDivider} transition-colors last:border-b-0 hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]`}
                      >
                        {/* NAMA BARANG */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">

                            {/* ICON BARANG */}
                            <div
                              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} theme-primary`}
                            >
                              <Package size={16} />
                            </div>

                            <span className="theme-text font-medium">
                              {item.nama}
                            </span>
                          </div>
                        </td>

                        {/* KATEGORI */}
                        <td className="theme-text-secondary px-5 py-3.5">
                          {item.kategori}
                        </td>

                        {/* LOKASI */}
                        <td className="theme-text-secondary px-5 py-3.5">
                          {item.lokasi}
                        </td>

                        {/* STOK */}
                        <td className="theme-text-secondary px-5 py-3.5">
                          {item.stok} unit
                        </td>

                        {/* KONDISI */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${kondisiStyle[item.kondisi]}`}
                          >
                            {item.kondisi}
                          </span>
                        </td>

                        {/* DETAIL ARROW */}
                        <td className="px-5 py-3.5">
                          <ChevronRight
                            size={16}
                            className="theme-text-placeholder transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                          />
                        </td>
                      </tr>
                    ))}

                    {/* EMPTY STATE */}
                    {filteredList.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="theme-text-muted py-12 text-center text-sm"
                        >
                          Tidak ada barang yang cocok dengan
                          pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}