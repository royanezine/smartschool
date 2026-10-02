import {
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  ClipboardCheck,
  User,
  CalendarDays,
  GraduationCap,
  Library,
  BookOpenCheck,
  MonitorPlay,
} from "lucide-react";

/**
 * Konfigurasi Sidebar untuk role "siswa"
 *
 * Struktur halaman:
 *
 * /siswa
 * ├── page.jsx
 * │
 * ├── absensi
 * │   └── page.jsx
 * │
 * ├── jadwal
 * │   └── page.jsx
 * │
 * ├── kode-pin
 * │   └── page.jsx
 * │
 * ├── mataPelajaran
 * │   ├── page.jsx
 * │   │
 * │   ├── materi
 * │   │   └── page.jsx
 * │   │
 * │   ├── tugas
 * │   │   └── page.jsx
 * │   │
 * │   └── ujian
 * │       └── page.jsx
 * │
 * ├── ujian
 * │   ├── page.jsx
 * │   └── [id]
 * │       └── page.jsx
 * │
 * ├── perpustakaan
 * │   ├── page.jsx
 * │   ├── buku
 * │   │   └── [id]
 * │   │       └── page.jsx
 * │   ├── buku-digital
 * │   │   └── page.jsx
 * │   └── peminjaman
 * │       └── page.jsx
 * │
 * ├── hasil-ujian
 * │   └── [id]
 * │       └── page.jsx
 * │
 * └── pengaturan
 *     └── page.jsx
 *
 * Halaman [id] merupakan halaman detail,
 * bukan menu utama Sidebar.
 */

export const siswaSidebarConfig = {
  basePath: "/siswa",

  brandName: "Portal Siswa",
  initials: "SW",
  email: "siswa@smartschool.com",

  menuSections: [
    // ============================================================
    // DASHBOARD
    // ============================================================
    {
      type: "item",
      key: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/siswa",
    },

    // ============================================================
    // ABSENSI
    // ============================================================
    {
      type: "item",
      key: "absensi",
      icon: ClipboardCheck,
      label: "Absensi",
      path: "/siswa/absensi",
    },

    // ============================================================
    // JADWAL
    // ============================================================
    {
      type: "item",
      key: "jadwal",
      icon: CalendarDays,
      label: "Jadwal",
      path: "/siswa/jadwal",
    },

    // ============================================================
    // UJIAN
    // ============================================================
    {
      type: "item",
      key: "ujian",
      icon: GraduationCap,
      label: "Ujian",
      path: "/siswa/ujian",
    },

    // ============================================================
    // MATA PELAJARAN
    // ============================================================
    {
      type: "item",
      key: "mataPelajaran",
      icon: BookOpen,
      label: "Mata Pelajaran",
      path: "/siswa/mataPelajaran",

      children: [
        {
          key: "materi",
          icon: FileText,
          label: "Materi",
          path: "/siswa/mataPelajaran/materi",
        },

        {
          key: "tugas",
          icon: ClipboardList,
          label: "Tugas",
          path: "/siswa/mataPelajaran/tugas",
        },

        {
          key: "ujianMataPelajaran",
          icon: ClipboardCheck,
          label: "Quiz",
          path: "/siswa/mataPelajaran/ujian",
        },
      ],
    },

    // ============================================================
    // PERPUSTAKAAN
    // ============================================================
    {
      type: "item",
      key: "perpustakaan",
      icon: Library,
      label: "Perpustakaan",
      path: "/siswa/perpustakaan",

      children: [
        {
          key: "katalogBuku",
          icon: BookOpen,
          label: "Katalog Buku",
          path: "/siswa/perpustakaan",
        },

        {
          key: "bukuDigital",
          icon: MonitorPlay,
          label: "Buku Digital",
          path: "/siswa/perpustakaan/buku-digital",
        },

        {
          key: "peminjamanSaya",
          icon: BookOpenCheck,
          label: "Peminjaman Saya",
          path: "/siswa/perpustakaan/peminjaman",
        },
      ],
    },

    // ============================================================
    // PENGATURAN
    // ============================================================
    {
      type: "item",
      key: "pengaturan",
      icon: User,
      label: "Pengaturan",
      path: "/siswa/pengaturan",
    },
  ],
};