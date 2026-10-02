"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";

// =========================================================
// HELPERS
// =========================================================
const STORAGE_KEY = "sarpras_aset_data";

const getDefaultAset = () => [
  // ===== KATEGORI: ELEKTRONIK =====
  {
    id: 1,
    nama: "Proyektor Epson EB-X500",
    kategori: "Elektronik",
    kode_aset: "SPR-ELK-001",
    lokasi: "R. 101",
    jumlah: 1,
    kondisi: "baik",
    penanggung_jawab: "Budi Santoso, S.Si.",
    tanggal_pengadaan: "2024-07-12",
    status: "tersedia",
  },
  {
    id: 2,
    nama: "AC Split Daikin 1 PK",
    kategori: "Elektronik",
    kode_aset: "SPR-ELK-002",
    lokasi: "R. 102",
    jumlah: 2,
    kondisi: "baik",
    penanggung_jawab: "Siti Rahma, S.Pd.",
    tanggal_pengadaan: "2023-03-05",
    status: "tersedia",
  },
  {
    id: 3,
    nama: "Komputer PC Rakitan i5",
    kategori: "Elektronik",
    kode_aset: "SPR-ELK-003",
    lokasi: "Lab. Komputer 1",
    jumlah: 30,
    kondisi: "rusak_ringan",
    penanggung_jawab: "Eko Prasetyo, S.Pd.",
    tanggal_pengadaan: "2022-01-18",
    status: "dipinjam",
  },
  {
    id: 4,
    nama: "Printer Canon MP287",
    kategori: "Elektronik",
    kode_aset: "SPR-ELK-004",
    lokasi: "R. Tata Usaha",
    jumlah: 3,
    kondisi: "rusak_berat",
    penanggung_jawab: "Maya Sari, S.Pd.",
    tanggal_pengadaan: "2021-09-09",
    status: "perbaikan",
  },

  // ===== KATEGORI: FURNITURE =====
  {
    id: 5,
    nama: "Meja Siswa Kayu",
    kategori: "Furniture",
    kode_aset: "SPR-FUR-001",
    lokasi: "R. 103",
    jumlah: 32,
    kondisi: "baik",
    penanggung_jawab: "Dewi Lestari, S.Pd.",
    tanggal_pengadaan: "2023-06-20",
    status: "tersedia",
  },
  {
    id: 6,
    nama: "Kursi Siswa Plastik",
    kategori: "Furniture",
    kode_aset: "SPR-FUR-002",
    lokasi: "R. 104",
    jumlah: 32,
    kondisi: "baik",
    penanggung_jawab: "Agus Setiawan, S.Pd.",
    tanggal_pengadaan: "2023-06-20",
    status: "tersedia",
  },
  {
    id: 7,
    nama: "Lemari Arsip Besi",
    kategori: "Furniture",
    kode_aset: "SPR-FUR-003",
    lokasi: "R. Perpustakaan",
    jumlah: 5,
    kondisi: "rusak_ringan",
    penanggung_jawab: "Rina Sari, S.Pd.",
    tanggal_pengadaan: "2020-11-02",
    status: "tersedia",
  },

  // ===== KATEGORI: ALAT PRAKTIK =====
  {
    id: 8,
    nama: "Router Cisco 2911",
    kategori: "Alat Praktik",
    kode_aset: "SPR-PRK-001",
    lokasi: "Lab. TKJ",
    jumlah: 10,
    kondisi: "baik",
    penanggung_jawab: "Hendra Gunawan, S.Pd.",
    tanggal_pengadaan: "2024-02-14",
    status: "tersedia",
  },
  {
    id: 9,
    nama: "Mesin Jahit Portable",
    kategori: "Alat Praktik",
    kode_aset: "SPR-PRK-002",
    lokasi: "R. Praktik Tata Busana",
    jumlah: 15,
    kondisi: "rusak_ringan",
    penanggung_jawab: "Sri Wahyuni, S.Pd.",
    tanggal_pengadaan: "2022-08-30",
    status: "tersedia",
  },
  {
    id: 10,
    nama: "Kalkulator Akuntansi",
    kategori: "Alat Praktik",
    kode_aset: "SPR-PRK-003",
    lokasi: "R. 105",
    jumlah: 25,
    kondisi: "baik",
    penanggung_jawab: "Eko Prasetyo, S.Pd.",
    tanggal_pengadaan: "2024-01-10",
    status: "dipinjam",
  },

  // ===== KATEGORI: BANGUNAN & FASILITAS =====
  {
    id: 11,
    nama: "Lapangan Basket",
    kategori: "Bangunan",
    kode_aset: "SPR-BGN-001",
    lokasi: "Area Olahraga",
    jumlah: 1,
    kondisi: "baik",
    penanggung_jawab: "Agus Setiawan, S.Pd.",
    tanggal_pengadaan: "2019-05-01",
    status: "tersedia",
  },
  {
    id: 12,
    nama: "Toilet Siswa Lantai 2",
    kategori: "Bangunan",
    kode_aset: "SPR-BGN-002",
    lokasi: "Lantai 2",
    jumlah: 4,
    kondisi: "rusak_berat",
    penanggung_jawab: "Hendra Gunawan, S.Pd.",
    tanggal_pengadaan: "2018-03-15",
    status: "perbaikan",
  },
  {
    id: 13,
    nama: "Musala Sekolah",
    kategori: "Bangunan",
    kode_aset: "SPR-BGN-003",
    lokasi: "Gedung Utama",
    jumlah: 1,
    kondisi: "baik",
    penanggung_jawab: "Dr. Ahmad Fauzi, M.Pd.",
    tanggal_pengadaan: "2017-08-17",
    status: "tersedia",
  },

  // ===== KATEGORI: KENDARAAN =====
  {
    id: 14,
    nama: "Bus Sekolah Isuzu Elf",
    kategori: "Kendaraan",
    kode_aset: "SPR-KND-001",
    lokasi: "Garasi Sekolah",
    jumlah: 2,
    kondisi: "baik",
    penanggung_jawab: "Dr. Ahmad Fauzi, M.Pd.",
    tanggal_pengadaan: "2021-04-22",
    status: "tersedia",
  },
  {
    id: 15,
    nama: "Motor Dinas Operasional",
    kategori: "Kendaraan",
    kode_aset: "SPR-KND-002",
    lokasi: "Garasi Sekolah",
    jumlah: 3,
    kondisi: "rusak_ringan",
    penanggung_jawab: "Budi Santoso, S.Si.",
    tanggal_pengadaan: "2020-10-11",
    status: "dipinjam",
  },
];

const loadAset = () => {
  if (typeof window === "undefined") return getDefaultAset();

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(getDefaultAset())
    );

    return getDefaultAset();
  }

  return JSON.parse(stored);
};

const saveAset = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const kondisiConfig = {
  baik: {
    label: "Baik",
    icon: CheckCircle,
    textClassName: "theme-success",
  },
  rusak_ringan: {
    label: "Rusak Ringan",
    icon: AlertTriangle,
    textClassName: "theme-warning",
  },
  rusak_berat: {
    label: "Rusak Berat",
    icon: XCircle,
    textClassName: "theme-danger",
  },
};

const statusConfig = {
  tersedia: {
    label: "Tersedia",
    textClassName: "theme-info",
  },
  dipinjam: {
    label: "Dipinjam",
    textClassName: "theme-primary",
  },
  perbaikan: {
    label: "Perbaikan",
    textClassName: "theme-text-muted",
  },
};

const kategoriKeys = [
  "Elektronik",
  "Furniture",
  "Alat Praktik",
  "Bangunan",
  "Kendaraan",
];

// =========================================================
// THEME HELPERS
// =========================================================
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimarySoftHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeWarningHover =
  "hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] hover:text-[var(--color-warning)]";

const themeDangerHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryGradientHover =
  "hover:brightness-95";

const themeRowSoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]";

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function AdminSarprasAsetPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aset, setAset] = useState([]);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [kondisiFilter, setKondisiFilter] = useState("Semua");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    setAset(loadAset());
  }, []);

  const handleDelete = (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus aset "${nama}"?`)) {
      return;
    }

    const updated = aset.filter((item) => item.id !== id);

    setAset(updated);
    saveAset(updated);

    alert(`Aset "${nama}" berhasil dihapus!`);
  };

  const filtered = useMemo(() => {
    return aset
      .filter((item) => {
        const matchSearch =
          item.nama.toLowerCase().includes(search.toLowerCase()) ||
          item.kode_aset
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.lokasi
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchKategori =
          kategoriFilter === "Semua" ||
          item.kategori === kategoriFilter;

        const matchKondisi =
          kondisiFilter === "Semua" ||
          item.kondisi === kondisiFilter;

        return (
          matchSearch &&
          matchKategori &&
          matchKondisi
        );
      })
      .sort(
        (a, b) =>
          a.kategori.localeCompare(b.kategori) ||
          a.nama.localeCompare(b.nama)
      );
  }, [
    aset,
    search,
    kategoriFilter,
    kondisiFilter,
  ]);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarprasAset"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5">

              {/* HEADER */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-xl p-2.5 ${themePrimaryGradient} ${themePrimaryShadow}`}
                  >
                    <Boxes
                      size={20}
                      className="text-[var(--color-card)]"
                    />
                  </div>

                  <div>
                    <h1 className="theme-text text-xl font-semibold">
                      Aset Sarana & Prasarana
                    </h1>

                    <p className="theme-text-secondary text-sm">
                      Kelola aset tetap, fasilitas, dan kondisi barang sekolah
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  {/* REFRESH */}
                  <button
                    onClick={() => {
                      setAset(loadAset());
                      window.location.reload();
                    }}
                    className={`theme-card theme-border ${themeNeutralHover} rounded-xl border p-2.5 transition-all ${themeCardShadow} ${themeCardHoverShadow}`}
                    title="Refresh"
                  >
                    <RefreshCw
                      size={17}
                      className="theme-text-secondary"
                    />
                  </button>

                  {/* TAMBAH ASET */}
                  <button
                    onClick={() =>
                      router.push(
                        "/admin/sarpras/aset/tambah"
                      )
                    }
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-all ${themePrimaryGradient} ${themePrimaryGradientHover} ${themePrimaryShadow}`}
                  >
                    <Plus
                      size={18}
                      className="text-[var(--color-card)]"
                    />

                    <span className="text-[var(--color-card)]">
                      Tambah Aset
                    </span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTER */}
              <div
                className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row">

                  {/* SEARCH */}
                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      placeholder="Cari nama aset, kode, atau lokasi..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      className={`theme-input theme-text w-full rounded-xl border px-10 py-2.5 text-sm outline-none transition ${themeFocus}`}
                    />
                  </div>

                  {/* FILTER */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Filter
                      size={17}
                      className="theme-text-muted"
                    />

                    <select
                      value={kategoriFilter}
                      onChange={(e) =>
                        setKategoriFilter(e.target.value)
                      }
                      className={`theme-input theme-text min-w-[140px] cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium outline-none transition ${themeFocus}`}
                    >
                      <option value="Semua">
                        Semua Kategori
                      </option>

                      {kategoriKeys.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>

                    <select
                      value={kondisiFilter}
                      onChange={(e) =>
                        setKondisiFilter(e.target.value)
                      }
                      className={`theme-input theme-text min-w-[140px] cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium outline-none transition ${themeFocus}`}
                    >
                      <option value="Semua">
                        Semua Kondisi
                      </option>

                      <option value="baik">
                        Baik
                      </option>

                      <option value="rusak_ringan">
                        Rusak Ringan
                      </option>

                      <option value="rusak_berat">
                        Rusak Berat
                      </option>
                    </select>

                    <button
                      onClick={() => {
                        setSearch("");
                        setKategoriFilter("Semua");
                        setKondisiFilter("Semua");
                      }}
                      className={`theme-text-secondary ${themeNeutralHover} rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors`}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* TABEL ASET */}
              <div
                className={`theme-card theme-border overflow-hidden rounded-xl border ${themeCardShadow}`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">

                    <thead>
                      <tr
                        className={`text-[var(--color-card)] ${themePrimaryGradient}`}
                      >
                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          No.
                        </th>

                        <th className="min-w-[200px] px-4 py-3 text-left font-semibold">
                          Nama Aset
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Kategori
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Kode Aset
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Lokasi
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                          Jumlah
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Kondisi
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Status
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Penanggung Jawab
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Tgl. Pengadaan
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((item, idx) => {
                        const kondisi =
                          kondisiConfig[item.kondisi];

                        const status =
                          statusConfig[item.status];

                        const KondisiIcon =
                          kondisi.icon;

                        return (
                          <tr
                            key={item.id}
                            className={`theme-border border-b last:border-0 transition-colors ${themePrimarySoftHover} ${
                              idx % 2 === 0
                                ? themeRowSoft
                                : ""
                            }`}
                          >
                            <td className="theme-text-secondary px-4 py-2.5 font-medium">
                              {idx + 1}
                            </td>

                            <td className="theme-text px-4 py-2.5 font-semibold">
                              {item.nama}
                            </td>

                            <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                              {item.kategori}
                            </td>

                            <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                              {item.kode_aset}
                            </td>

                            <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                              {item.lokasi}
                            </td>

                            <td className="theme-text whitespace-nowrap px-4 py-2.5 text-center font-medium">
                              {item.jumlah} unit
                            </td>

                            <td className="whitespace-nowrap px-4 py-2.5">
                              <span
                                className={`inline-flex items-center gap-1.5 text-sm font-medium ${kondisi.textClassName}`}
                              >
                                <KondisiIcon size={14} />
                                {kondisi.label}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-2.5">
                              <span
                                className={`text-sm font-medium ${status.textClassName}`}
                              >
                                {status.label}
                              </span>
                            </td>

                            <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                              {item.penanggung_jawab}
                            </td>

                            <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                              {item.tanggal_pengadaan}
                            </td>

                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-center gap-1.5">

                                {/* EDIT */}
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/sarpras/aset/edit/${item.id}`
                                    )
                                  }
                                  className={`theme-text-muted rounded-lg p-2 transition-all ${themeWarningHover}`}
                                  title="Edit Aset"
                                >
                                  <Edit size={16} />
                                </button>

                                {/* DELETE */}
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      item.id,
                                      item.nama
                                    )
                                  }
                                  className={`theme-text-muted rounded-lg p-2 transition-all ${themeDangerHover}`}
                                  title="Hapus Aset"
                                >
                                  <Trash2 size={16} />
                                </button>

                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* EMPTY STATE */}
                      {filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={11}
                            className="px-4 py-12 text-center"
                          >
                            <div className="mb-3 flex justify-center">
                              <div
                                className={`rounded-full p-3 ${themePrimarySoft}`}
                              >
                                <Boxes
                                  size={36}
                                  className="theme-primary"
                                />
                              </div>
                            </div>

                            <p className="theme-text-secondary text-sm font-medium">
                              Tidak ada data aset
                            </p>

                            <p className="theme-text-muted mt-1 text-xs">
                              {search ||
                              kategoriFilter !== "Semua" ||
                              kondisiFilter !== "Semua"
                                ? "Coba ubah filter pencarian"
                                : "Silakan tambahkan aset baru"}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER */}
              <footer className="theme-border theme-text-muted border-t py-3 text-center text-[11px]">
                © 2026 SmartSchool • Aset Sarana & Prasarana
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}