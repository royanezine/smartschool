"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  Package,
  MapPin,
  ArrowLeft,
  Pencil,
  Trash2,
  Tag,
  Boxes,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

// ============================================================
// DUMMY DATA INVENTARIS
// ============================================================
const iventarisData = {
  "inv-001": {
    nama: "Kursi Kayu",
    kategori: "Furnitur",
    lokasi: "Gudang A",
    stok: 120,
    kondisi: "Baik",
    dibuat: "10 Jan 2022",
    deskripsi:
      "Kursi kayu standar untuk ruang kelas, cukup kokoh dan mudah dirawat.",
  },
  "inv-002": {
    nama: "Proyektor Epson",
    kategori: "Elektronik",
    lokasi: "Lab Komputer",
    stok: 5,
    kondisi: "Baik",
    dibuat: "2 Mar 2023",
    deskripsi:
      "Proyektor Epson EB-X05, digunakan untuk presentasi dan pembelajaran di lab komputer.",
  },
  "inv-003": {
    nama: "Meja Guru",
    kategori: "Furnitur",
    lokasi: "Ruang Guru",
    stok: 30,
    kondisi: "Rusak Ringan",
    dibuat: "15 Jun 2021",
    deskripsi:
      "Meja kerja guru, beberapa unit mengalami keretakan pada permukaan.",
  },
  "inv-004": {
    nama: "AC Split 1PK",
    kategori: "Elektronik",
    lokasi: "Ruang Kepala Sekolah",
    stok: 8,
    kondisi: "Baik",
    dibuat: "20 Aug 2022",
    deskripsi:
      "AC split 1PK untuk ruangan kecil-menengah, kondisi terawat baik.",
  },
  "inv-005": {
    nama: "Papan Tulis",
    kategori: "Alat Belajar",
    lokasi: "Gudang B",
    stok: 15,
    kondisi: "Rusak Berat",
    dibuat: "5 Feb 2019",
    deskripsi:
      "Papan tulis whiteboard, sebagian besar permukaan sudah menguning dan sulit dihapus.",
  },
  "inv-006": {
    nama: "Mikroskop",
    kategori: "Laboratorium",
    lokasi: "Lab IPA",
    stok: 20,
    kondisi: "Baik",
    dibuat: "18 Sep 2021",
    deskripsi:
      "Mikroskop untuk praktikum biologi, lensa masih jernih dan berfungsi normal.",
  },
  "inv-007": {
    nama: "Sound System",
    kategori: "Elektronik",
    lokasi: "Aula",
    stok: 2,
    kondisi: "Baik",
    dibuat: "8 Nov 2022",
    deskripsi:
      "Sistem tata suara untuk acara di aula, mencakup speaker dan mixer.",
  },
  "inv-008": {
    nama: "Lemari Arsip",
    kategori: "Furnitur",
    lokasi: "Ruang TU",
    stok: 10,
    kondisi: "Rusak Ringan",
    dibuat: "12 Dec 2020",
    deskripsi:
      "Lemari penyimpanan arsip administrasi, engsel pintu beberapa unit sudah longgar.",
  },
};

// ============================================================
// GLOBAL THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

// ============================================================
// KONDISI STYLE
// ============================================================

const kondisiStyle = {
  Baik: `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`,
  "Rusak Ringan": `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`,
  "Rusak Berat": `${themeDangerSurface} ${themeDangerBorder} theme-danger`,
};

// ============================================================
// RIWAYAT BARANG
// ============================================================

const riwayatBarang = [
  {
    id: 1,
    title: "Pemeriksaan stok rutin",
    desc: "Diperiksa oleh Admin Sarpras • 2 bulan lalu",
    status: "done",
  },
  {
    id: 2,
    title: "5 unit dipinjam oleh Pak Budi",
    desc: "Ruang Lab Komputer • 3 bulan lalu",
    status: "pending",
  },
  {
    id: 3,
    title: "Laporan kondisi diperbarui",
    desc: "Ditindaklanjuti oleh Admin Sarpras • 4 bulan lalu",
    status: "warning",
  },
];

// ============================================================
// STATUS ICON
// ============================================================

const statusIcon = {
  pending: {
    icon: Clock,
    tone: `${themeWarningSurface} text-[var(--color-warning)]`,
  },
  done: {
    icon: CheckCircle2,
    tone: `${themeSuccessSurface} text-[var(--color-success)]`,
  },
  warning: {
    icon: AlertTriangle,
    tone: `${themeDangerSurface} theme-danger`,
  },
};

// ============================================================
// COMPONENT
// ============================================================

export default function IventarisDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const id = params?.id;
  const item = iventarisData[id];

  const notifications = [
    {
      id: 1,
      title: "Stok papan tulis menipis",
      desc: "Dikirim 3 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // DATA TIDAK DITEMUKAN
  // ============================================================

  if (!item) {
    return (
      <div className="theme-page flex min-h-screen">
        <Sidebar
          role="adminSarpras"
          active="iventaris"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

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

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <p className="theme-text-secondary text-sm">
                Barang dengan id "{id}" tidak ditemukan.
              </p>

              <button
                onClick={() =>
                  router.push("/adminSarpras/iventaris")
                }
                className="theme-primary mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={14} />
                Kembali ke daftar inventaris
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        role="adminSarpras"
        active="iventaris"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="theme-primary text-xs font-medium uppercase tracking-wide">
                    Detail Inventaris
                  </p>

                  <h1 className="theme-text mt-1 truncate text-2xl font-bold tracking-tight sm:text-[28px]">
                    {item.nama}
                  </h1>

                  <div className="theme-text-secondary mt-1.5 flex items-center gap-1.5 text-sm">
                    <MapPin
                      size={14}
                      className="flex-shrink-0"
                    />
                    <span>{item.lokasi}</span>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  {/* EDIT */}
                  <button
                    className={`theme-card ${themeNeutralBorder} ${themeNeutralHover} hover:text-[var(--color-primary)] inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors`}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  {/* HAPUS */}
                  <button
                    className={`theme-card ${themeDangerBorder} ${themeDangerSurface} inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors theme-danger hover:text-[var(--color-text)]`}
                  >
                    <Trash2 size={15} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>

            {/* ==================================================
                INFO CARD
            ================================================== */}

            <div
              className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-2xl border`}
            >
              {/* IMAGE / ICON AREA */}
              <div
                className={`flex h-40 items-center justify-center sm:h-52 ${themePrimarySoft}`}
              >
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl ${themePrimaryGradient} ${themePrimaryShadow}`}
                >
                  <Package
                    size={42}
                    className="text-[var(--color-card)]"
                  />
                </div>
              </div>

              {/* CONTENT */}
              <div className="space-y-5 p-5">
                <p className="theme-text-secondary text-sm leading-relaxed">
                  {item.deskripsi}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-1 sm:grid-cols-4">

                  {/* KATEGORI */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}
                    >
                      <Tag size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-placeholder text-[11px]">
                        Kategori
                      </p>

                      <p className="theme-text mt-0.5 truncate text-sm font-medium">
                        {item.kategori}
                      </p>
                    </div>
                  </div>

                  {/* STOK */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}
                    >
                      <Boxes size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-placeholder text-[11px]">
                        Stok
                      </p>

                      <p className="theme-text mt-0.5 truncate text-sm font-medium">
                        {item.stok} unit
                      </p>
                    </div>
                  </div>

                  {/* TERDAFTAR */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}
                    >
                      <Calendar size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-placeholder text-[11px]">
                        Terdaftar
                      </p>

                      <p className="theme-text mt-0.5 truncate text-sm font-medium">
                        {item.dibuat}
                      </p>
                    </div>
                  </div>

                  {/* KONDISI */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}
                    >
                      <CheckCircle2 size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-placeholder text-[11px]">
                        Kondisi
                      </p>

                      <span
                        className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${kondisiStyle[item.kondisi]}`}
                      >
                        {item.kondisi}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                RIWAYAT BARANG
            ================================================== */}

            <div
              className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-2xl border`}
            >
              {/* HEADER */}
              <div className={`border-b ${themeDivider} px-5 py-4`}>
                <h3 className="theme-text text-sm font-semibold">
                  Riwayat Barang
                </h3>

                <p className="theme-text-muted mt-0.5 text-xs">
                  Aktivitas pemeriksaan & peminjaman barang ini
                </p>
              </div>

              {/* LIST */}
              <div>
                {riwayatBarang.map((r) => {
                  const s = statusIcon[r.status];
                  const StatusIcon = s.icon;

                  return (
                    <div
                      key={r.id}
                      className={`flex items-center gap-3.5 border-b ${themeDivider} px-5 py-3.5 last:border-b-0`}
                    >
                      {/* STATUS ICON */}
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${s.tone}`}
                      >
                        <StatusIcon size={16} />
                      </div>

                      {/* CONTENT */}
                      <div className="min-w-0 flex-1">
                        <p className="theme-text truncate text-sm font-medium">
                          {r.title}
                        </p>

                        <p className="theme-text-secondary mt-0.5 truncate text-xs">
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}