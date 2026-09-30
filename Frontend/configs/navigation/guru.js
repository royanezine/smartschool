"use client";

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  ClipboardCheck,
  History,
  Award,
  CalendarDays,
  CalendarCheck,
  UserCheck,
  Package,
  HandCoins,
  Clock3,
  Settings,
  User,
} from "lucide-react";

export const guruSidebarConfig = {
  role: "guru",

  brandName: "Guru",

  menuSections: [
    // =====================================================
    // DASHBOARD
    // =====================================================
    {
      type: "item",
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/guru",
    },

    // =====================================================
    // PROSES BELAJAR
    // =====================================================
    {
      type: "header",
      key: "proses-belajar-header",
      label: "Proses Belajar",
    },

    // =====================================================
    // MATERI
    // =====================================================
    {
      type: "dropdown",
      key: "materi",
      label: "Materi",
      icon: BookOpen,
      path: "/guru/materi",

      children: [
        // -------------------------------------------------
        // TUGAS
        // -------------------------------------------------
        {
          type: "item",
          key: "tugas",
          label: "Tugas",
          icon: ClipboardList,
          path: "/guru/tugas",

          // BE:
          // tugas.view
          // tugas.create
          // tugas.update
          permission: "tugas.view",
        },

        // -------------------------------------------------
        // UJIAN
        // -------------------------------------------------
        {
          type: "item",
          key: "ujian",
          label: "Ujian",
          icon: FileCheck2,
          path: "/guru/ujian",

          // BE:
          // ujian.view
          // ujian.create
          // ujian.update
          permission: "ujian.view",
        },
      ],
    },

    // =====================================================
    // AKADEMIK
    // =====================================================
    {
      type: "header",
      key: "akademik-header",
      label: "Akademik",
    },

    // -----------------------------------------------------
    // ABSENSI
    // -----------------------------------------------------
    {
      type: "item",
      key: "absensi",
      label: "Absensi",
      icon: ClipboardCheck,
      path: "/guru/absensi",

      // BE:
      // akademik.view
      // akademik.create
      // akademik.update
      permission: "akademik.view",
    },

    // -----------------------------------------------------
    // HISTORI ABSENSI
    // -----------------------------------------------------
    {
      type: "item",
      key: "histori-absensi",
      label: "Histori Absensi",
      icon: History,
      path: "/guru/histori-absensi",

      permission: "akademik.view",
    },

    // =====================================================
    // NILAI
    // =====================================================
    {
      type: "dropdown",
      key: "nilai",
      label: "Nilai",
      icon: Award,
      path: "/guru/nilai",

      // Nilai termasuk bagian akademik
      permission: "akademik.view",

      children: [
        // -------------------------------------------------
        // NILAI TUGAS
        // -------------------------------------------------
        {
          type: "item",
          key: "nilai-tugas",
          label: "Nilai Tugas",
          icon: ClipboardList,
          path: "/guru/nilai/nilaiTugas",

          permission: "akademik.view",
        },

        // -------------------------------------------------
        // NILAI UJIAN
        // -------------------------------------------------
        {
          type: "item",
          key: "nilai-ujian",
          label: "Nilai Ujian",
          icon: FileCheck2,
          path: "/guru/nilaiUjian",

          permission: "akademik.view",
        },

        // -------------------------------------------------
        // RAPOR
        // -------------------------------------------------
        {
          type: "item",
          key: "rapor",
          label: "Rapor",
          icon: Award,
          path: "/guru/nilai/rapor",

          permission: "akademik.view",
        },
      ],
    },

    // =====================================================
    // JADWAL
    // =====================================================
    {
      type: "header",
      key: "jadwal-header",
      label: "Jadwal",
    },

    // -----------------------------------------------------
    // JADWAL
    // -----------------------------------------------------
    {
      type: "dropdown",
      key: "jadwal",
      label: "Jadwal",
      icon: CalendarDays,
      path: "/guru/jadwal",

      // Jadwal menggunakan akses akademik
      permission: "akademik.view",

      children: [
        // -------------------------------------------------
        // KALENDER
        // -------------------------------------------------
        {
          type: "item",
          key: "kalender",
          label: "Kalender",
          icon: CalendarDays,
          path: "/guru/jadwal/kalender",

          permission: "akademik.view",
        },

        // -------------------------------------------------
        // PRESENSI
        // -------------------------------------------------
        {
          type: "item",
          key: "presensi-jadwal",
          label: "Presensi",
          icon: CalendarCheck,
          path: "/guru/jadwal/presensi",

          permission: "akademik.view",
        },

        // -------------------------------------------------
        // IZIN
        // -------------------------------------------------
        {
          type: "item",
          key: "izin",
          label: "Izin",
          icon: UserCheck,
          path: "/guru/jadwal/izin",

          permission: "akademik.view",
        },
      ],
    },

    // =====================================================
    // SARANA PRASARANA
    // =====================================================
    {
      type: "header",
      key: "sarpras-header",
      label: "Sarana Prasarana",
    },

    // -----------------------------------------------------
    // SARPRAS
    // -----------------------------------------------------
    {
      type: "dropdown",
      key: "sarpras",
      label: "Sarpras",
      icon: Package,
      path: "/guru/sarpras",

      // BE guru TIDAK diberikan manajemen_aset.view
      // Jadi seluruh Sarpras akan hilang.
      permission: "manajemen_aset.view",

      children: [
        // -------------------------------------------------
        // PINJAM
        // -------------------------------------------------
        {
          type: "item",
          key: "pinjam",
          label: "Pinjam",
          icon: HandCoins,
          path: "/guru/sarpras/pinjam",

          permission: "manajemen_aset.view",
        },

        // -------------------------------------------------
        // PEMINJAMAN
        // -------------------------------------------------
        {
          type: "item",
          key: "peminjaman",
          label: "Peminjaman",
          icon: Package,
          path: "/guru/sarpras/peminjaman",

          permission: "manajemen_aset.view",
        },

        // -------------------------------------------------
        // RIWAYAT
        // -------------------------------------------------
        {
          type: "item",
          key: "riwayat-peminjaman",
          label: "Riwayat",
          icon: Clock3,
          path: "/guru/sarpras/riwayat",

          permission: "manajemen_aset.view",
        },
      ],
    },

    // =====================================================
    // AKUN
    // =====================================================
    {
      type: "header",
      key: "akun-header",
      label: "Akun",
    },

    // -----------------------------------------------------
    // PENGATURAN
    // -----------------------------------------------------
    {
      type: "item",
      key: "pengaturan",
      label: "Pengaturan",
      icon: Settings,
      path: "/guru/pengaturan",
    },

    // -----------------------------------------------------
    // PROFILE
    // -----------------------------------------------------
    {
      type: "item",
      key: "profile",
      label: "Profile",
      icon: User,
      path: "/guru/profile",
    },
  ],
};