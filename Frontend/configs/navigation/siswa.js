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


export const siswaSidebarConfig = {
  role: "siswa",

  brandName: "Portal Siswa",

  menuSections: [
    {
      type: "item",
      key: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/siswa",
    },

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

    {
      type: "header",
      key: "akademik-header",
      label: "Akademik",
    },

    {
      type: "item",
      key: "absensi",
      label: "Absensi",
      icon: ClipboardCheck,
      path: "/siswa/absensi",
    },

    {
      type: "item",
      key: "raport",
      label: "Raport",
      icon: FileBarChart,
      path: "/siswa/raport",
    },

   

    {
      type: "item",
      key: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      path: "/siswa/jadwal",
    },

    {
      type: "item",
      key: "konseling",
      label: "Konseling",
      icon: MessageCircle,
      path: "/siswa/konseling",
    },

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

    {
      type: "header",
      key: "akun-header",
      label: "Akun",
    },

    
  ],
};