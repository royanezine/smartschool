"use client";

import {
  Home,
  BookOpen,
  ClipboardList,
  FileCheck2,
  ClipboardCheck,
  FileBarChart,
  CalendarDays,
  Library,
  BookOpenCheck,
   MessageCircle,
  MonitorPlay,
  User,
} from "lucide-react";

/**
 * Konfigurasi Sidebar untuk role "siswa"
 *
 * Struktur halaman:
 *
 * /siswa
 * ├── page.jsx                      (Dashboard)
 * │
 * ├── materi
 * │   └── page.jsx
 * │
 * ├── tugas
 * │   └── page.jsx
 * │
 * ├── ujian
 * │   ├── page.jsx
 * │   └── [id]/page.jsx             (detail — bukan menu)
 * │
 * ├── absensi
 * │   └── page.jsx                  (tab: Absen Hari Ini, Histori, Ajukan Izin)
 * │
 * ├── rapor
 * │   └── page.jsx
 * │
 * ├── jadwal
 * │   └── page.jsx
 * │
 * └── perpustakaan
 *     ├── page.jsx                  (Katalog Buku)
 *     ├── buku-digital
 *     │   └── page.jsx
 *     ├── peminjaman
 *     │   └── page.jsx
 *     └── buku/[id]/page.jsx        (detail — bukan menu)
 *
 * Halaman [id] merupakan halaman detail,
 * bukan menu utama Sidebar.
 */

export const siswaSidebarConfig = {
  role: "siswa",

  brandName: "Portal Siswa",

  menuSections: [
    // ============================================================
    // DASHBOARD
    // ============================================================
    {
      type: "item",
      key: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/siswa",
    },

    // ============================================================
    // PROSES BELAJAR
    // ============================================================
    {
      type: "header",
      key: "proses-belajar-header",
      label: "Proses Belajar",
    },

    {
      type: "item",
      key: "materi",
      label: "Materi",
      icon: BookOpen,
      path: "/siswa/mataPelajaran/materi",
    },

    {
      type: "item",
      key: "tugas",
      label: "Tugas",
      icon: ClipboardList,
      path: "/siswa/mataPelajaran/tugas",
    },

    {
      type: "item",
      key: "ujian",
      label: "Ujian",
      icon: FileCheck2,
      path: "/siswa/ujian",
    },

    // ============================================================
    // AKADEMIK
    // ============================================================
    {
      type: "header",
      key: "akademik-header",
      label: "Akademik",
    },

    // Absensi (tab: Absen Hari Ini, Histori, Ajukan Izin)
    {
      type: "item",
      key: "absensi",
      label: "Absensi",
      icon: ClipboardCheck,
      path: "/siswa/absensi",
    },

    // Raport
    {
      type: "item",
      key: "raport",
      label: "Raport",
      icon: FileBarChart,
      path: "/siswa/raport",
    },

   

    // Jadwal
    {
      type: "item",
      key: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      path: "/siswa/jadwal",
    },

       // Konseling BK
    {
      type: "item",
      key: "konseling",
      label: "Konseling",
      icon: MessageCircle,
      path: "/siswa/konseling",
    },

    // ============================================================
    // PERPUSTAKAAN
    // ============================================================
    {
      type: "header",
      key: "perpustakaan-header",
      label: "Perpustakaan",
    },

    {
      type: "dropdown",
      key: "perpustakaan",
      label: "Perpustakaan",
      icon: Library,
      path: "/siswa/perpustakaan",

      children: [
        {
          type: "item",
          key: "katalogBuku",
          label: "Katalog Buku",
          icon: BookOpen,
          path: "/siswa/perpustakaan",
        },

        {
          type: "item",
          key: "bukuDigital",
          label: "Buku Digital",
          icon: MonitorPlay,
          path: "/siswa/perpustakaan/buku-digital",
        },

        {
          type: "item",
          key: "peminjamanSaya",
          label: "Peminjaman Saya",
          icon: BookOpenCheck,
          path: "/siswa/perpustakaan/peminjaman",
        },
      ],
    },

    // ============================================================
    // AKUN
    // ============================================================
    {
      type: "header",
      key: "akun-header",
      label: "Akun",
    },

    
  ],
};