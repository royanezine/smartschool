"use client";

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Users,
  ClipboardCheck,
  Award,
  FileBarChart,
  CalendarDays,
  CalendarRange,
  UserCheck,
  ShieldCheck,
  Library,
  Package,
  Settings,
  User,
   Wallet,
} from "lucide-react";

export const guruSidebarConfig = {
  role: "guru",

  brandName: "Guru",

  menuSections: [
    {
      type: "item",
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/guru",
    },

    {
      type: "header",
      key: "proses-belajar-header",
      label: "Proses Belajar",
    },

    {
      type: "item",
      key: "kelas-saya",
      label: "Kelas Saya",
      icon: Users,
      path: "/guru/kelas-saya",
      permission: "akademik.view",
    },

    {
      type: "item",
      key: "materi",
      label: "Materi",
      icon: BookOpen,
      path: "/guru/materi",
      permission: "akademik.view",
    },

    {
      type: "item",
      key: "tugas",
      label: "Tugas",
      icon: ClipboardList,
      path: "/guru/tugas",
      permission: "akademik.view",
    },

    {
      type: "item",
      key: "ujian",
      label: "Ujian",
      icon: FileCheck2,
      path: "/guru/ujian",
      permission: "akademik.view",
    },

    {
      type: "header",
      key: "akademik-header",
      label: "Akademik",
    },

    {
      type: "item",
      key: "absensi-siswa",
      label: "Absensi Siswa",
      icon: ClipboardCheck,
      path: "/guru/absensi",
      permission: "akademik.view",
    },

    {
      type: "item",
      key: "input nilai",
      label: "Input Nilai",
      icon: FileBarChart,
      path: "/guru/nilaiUjian",
      permission: "akademik.view",
    },

    {
      type: "dropdown",
      key: "rapor",
      label: "Rapor",
      icon: Award,
      path: "/guru/nilai/rapor",
      permission: "akademik.view",

      children: [
        {
          type: "item",
          key: "rapor-kelas",
          label: "Rapor Kelas (Wali)",
          icon: Award,
          path: "/guru/rapor",
          permission: "akademik.view",
        },
        {
          type: "item",
          key: "nilai-bobot",
          label: "Setup Bobot",
          icon: Award,
          path: "/guru/nilai/setup-bobot",
          permission: "akademik.view",
        },
        {
          type: "item",
          key: "nilai-finalisasi",
          label: "Finalisasi",
          icon: FileCheck2,
          path: "/guru/nilai/finalisasi",
          permission: "akademik.view",
        },
      ],
    },

    

    {
      type: "item",
      key: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      path: "/guru/jadwal",
      permission: "akademik.view",
    },

    {
      type: "item",
      key: "kalender",
      label: "Kalender",
      icon: CalendarRange,  
      path: "/guru/jadwal/kalender",
      permission: "akademik.view",
    },

    {
      type: "header",
      key: "kehadiran-header",
      label: "Kehadiran",
    },

    {
      type: "item",
      key: "presensi-saya",
      label: "Presensi Saya",
      icon: UserCheck,
      path: "/guru/presensi-saya",
      permission: "akademik.view",
    },

    {
      type: "item",
      key: "izin-saya",
      label: "Izin Saya",
      icon: ShieldCheck,
      path: "/guru/jadwal/izin",
      permission: "akademik.view",
    },

    {
      type: "header",
      key: "lainnya-header",
      label: "Lainnya",
    },

    {
      type: "item",
      key: "sarpras",
      label: "Sarpras",
      icon: Package,
      path: "/guru/sarpras",
      permission: "akademik.view",
    },

    {
      type: "header",
      key: "keuangan-header",
      label: "Keuangan",
    },

    {
      type: "item",
      key: "slip-gaji",
      label: "Slip Gaji",
      icon: Wallet,
      path: "/guru/slip-gaji",
      permission: "akademik.view",
    },

    {
      type: "header",
      key: "akun-header",
      label: "Akun",
    },

  
  ],
};