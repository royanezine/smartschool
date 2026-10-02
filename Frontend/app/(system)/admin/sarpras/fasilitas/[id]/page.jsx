"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";
import {
  Building2,
  MapPin,
  ArrowLeft,
  Pencil,
  Trash2,
  Users,
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// ============================================================
// DUMMY DATA FASILITAS
// ============================================================
const fasilitasData = {
  "fs-001": {
    nama: "Lapangan Basket",
    lokasi: "Area Belakang",
    kategori: "Olahraga",
    kondisi: "Baik",
    kapasitas: "30 orang",
    dibuat: "12 Jan 2023",
    deskripsi:
      "Lapangan basket outdoor dengan permukaan aspal, dilengkapi 2 ring standar pertandingan.",
  },

  "fs-002": {
    nama: "Aula Sekolah",
    lokasi: "Gedung Utama Lt. 1",
    kategori: "Umum",
    kondisi: "Baik",
    kapasitas: "300 orang",
    dibuat: "5 Mar 2022",
    deskripsi:
      "Aula serbaguna untuk acara sekolah, dilengkapi panggung dan sistem tata suara.",
  },

  "fs-003": {
    nama: "Lab Komputer",
    lokasi: "Gedung B Lt. 2",
    kategori: "Laboratorium",
    kondisi: "Rusak Ringan",
    kapasitas: "40 orang",
    dibuat: "20 Jul 2021",
    deskripsi:
      "Lab komputer dengan 40 unit PC, beberapa unit AC mengalami gangguan ringan.",
  },

  "fs-004": {
    nama: "Perpustakaan",
    lokasi: "Gedung A Lt. 1",
    kategori: "Umum",
    kondisi: "Baik",
    kapasitas: "60 orang",
    dibuat: "18 Aug 2020",
    deskripsi:
      "Perpustakaan dengan koleksi lebih dari 5000 judul buku dan ruang baca ber-AC.",
  },

  "fs-005": {
    nama: "Lab IPA",
    lokasi: "Gedung B Lt. 1",
    kategori: "Laboratorium",
    kondisi: "Rusak Berat",
    kapasitas: "35 orang",
    dibuat: "10 Feb 2019",
    deskripsi:
      "Lab IPA untuk praktikum fisika, kimia, biologi. Atap mengalami kebocoran cukup parah.",
  },

  "fs-006": {
    nama: "Musala",
    lokasi: "Area Tengah",
    kategori: "Ibadah",
    kondisi: "Baik",
    kapasitas: "100 orang",
    dibuat: "2 Jun 2020",
    deskripsi:
      "Musala sekolah dengan kapasitas 100 jamaah, dilengkapi tempat wudhu terpisah.",
  },
};

// ============================================================
// THEME CONFIG
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

const riwayatKondisi = [
  {
    id: 1,
    title: "Kondisi diperbarui menjadi Baik",
    desc: "Diperiksa oleh Admin Sarpras • 3 bulan lalu",
    status: "done",
  },

  {
    id: 2,
    title: "Pengajuan perbaikan disetujui",
    desc: "Ditindaklanjuti oleh Kepala Sarpras • 4 bulan lalu",
    status: "warning",
  },

  {
    id: 3,
    title: "Laporan kerusakan diterima",
    desc: "Dilaporkan oleh guru piket • 4 bulan lalu",
    status: "pending",
  },
];

// ============================================================
// RIWAYAT STATUS
// ============================================================
const statusIcon = {
  pending: {
    icon: AlertTriangle,
    tone: "theme-warning",
    background:
      "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
  },

  done: {
    icon: CheckCircle2,
    tone: "theme-success",
    background:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
  },

  warning: {
    icon: AlertTriangle,
    tone: "theme-danger",
    background:
      "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]",
  },
};

// ============================================================
// THEME HELPERS
// ============================================================
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimarySoftHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themeDangerHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

// ============================================================
// PAGE
// ============================================================
export default function FasilitasDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const id = params?.id;
  const fasilitas = fasilitasData[id];

  const notifications = [
    {
      id: 1,
      title: "Lab IPA dilaporkan rusak berat",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // NOT FOUND
  // ============================================================
  if (!fasilitas) {
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

          <main className="theme-page flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <p className="theme-text-muted text-sm">
                Fasilitas dengan id "{id}" tidak ditemukan.
              </p>

              <button
                onClick={() =>
                  router.push("/adminSarpras/fasilitas")
                }
                className={`theme-primary mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${themePrimarySoftHover}`}
              >
                <ArrowLeft size={14} />
                Kembali ke daftar fasilitas
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const kondisi =
    kondisiStyle[fasilitas.kondisi] ||
    kondisiStyle.Baik;

  // ============================================================
  // MAIN
  // ============================================================
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

            {/* ====================================================
                BACK + PAGE HEADER
            ==================================================== */}
            <div>
              <button
                onClick={() =>
                  router.push("/adminSarpras/fasilitas")
                }
                className={`theme-text-muted mb-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${themeNeutralHover}`}
              >
                <ArrowLeft size={14} />
                Kembali ke Fasilitas
              </button>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                <div className="min-w-0">
                  <p className="theme-primary text-xs font-medium uppercase tracking-wide">
                    Detail Fasilitas
                  </p>

                  <h1 className="theme-text mt-1 truncate text-2xl font-bold tracking-tight sm:text-[28px]">
                    {fasilitas.nama}
                  </h1>

                  <div className="theme-text-secondary mt-1.5 flex items-center gap-1.5 text-sm">
                    <MapPin
                      size={14}
                      className="flex-shrink-0"
                    />

                    <span>
                      {fasilitas.lokasi}
                    </span>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">

                  {/* EDIT */}
                  <button
                    className={`theme-text-secondary theme-border ${themeNeutralHover} inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors`}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  {/* HAPUS */}
                  <button
                    className={`theme-danger border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] ${themeDangerHover} inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors`}
                  >
                    <Trash2 size={15} />
                    Hapus
                  </button>

                </div>
              </div>
            </div>

            {/* ====================================================
                INFO CARD
            ==================================================== */}
            <div
              className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}
            >

              {/* COVER */}
              <div
                className={`flex h-40 items-center justify-center sm:h-52 ${themePrimarySoft}`}
              >
                <div
                  className={`flex items-center justify-center rounded-2xl p-4 ${themePrimarySoft} ${themePrimaryShadow}`}
                >
                  <Building2
                    size={48}
                    className="theme-primary"
                  />
                </div>
              </div>

              {/* CONTENT */}
              <div className="space-y-5 p-5">

                <p className="theme-text-secondary text-sm leading-relaxed">
                  {fasilitas.deskripsi}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-1 sm:grid-cols-4">

                  {/* KATEGORI */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`theme-text-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeSoftSurface}`}
                    >
                      <Tag size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted text-[11px]">
                        Kategori
                      </p>

                      <p className="theme-text truncate text-sm font-medium">
                        {fasilitas.kategori}
                      </p>
                    </div>
                  </div>

                  {/* KAPASITAS */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`theme-text-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeSoftSurface}`}
                    >
                      <Users size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted text-[11px]">
                        Kapasitas
                      </p>

                      <p className="theme-text truncate text-sm font-medium">
                        {fasilitas.kapasitas}
                      </p>
                    </div>
                  </div>

                  {/* TERDAFTAR */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`theme-text-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeSoftSurface}`}
                    >
                      <Calendar size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted text-[11px]">
                        Terdaftar
                      </p>

                      <p className="theme-text truncate text-sm font-medium">
                        {fasilitas.dibuat}
                      </p>
                    </div>
                  </div>

                  {/* KONDISI */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`theme-text-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeSoftSurface}`}
                    >
                      <CheckCircle2 size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted text-[11px]">
                        Kondisi
                      </p>

                      <span
                        className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${kondisi.text} ${kondisi.background} ${kondisi.border}`}
                      >
                        {fasilitas.kondisi}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ====================================================
                RIWAYAT KONDISI
            ==================================================== */}
            <div
              className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}
            >

              {/* HEADER */}
              <div className="theme-border border-b px-5 py-4">
                <h3 className="theme-text text-sm font-semibold">
                  Riwayat Kondisi
                </h3>

                <p className="theme-text-muted mt-0.5 text-xs">
                  Aktivitas pemeriksaan & perbaikan fasilitas ini
                </p>
              </div>

              {/* LIST */}
              <div className="divide-y divide-[var(--color-border-soft)]">
                {riwayatKondisi.map((item) => {
                  const s =
                    statusIcon[item.status];

                  const StatusIcon = s.icon;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors ${themeNeutralHover}`}
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${s.background} ${s.tone}`}
                      >
                        <StatusIcon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text truncate text-sm font-medium">
                          {item.title}
                        </p>

                        <p className="theme-text-secondary mt-0.5 truncate text-xs">
                          {item.desc}
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