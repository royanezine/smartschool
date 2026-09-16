import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserPlus,
  ScanFace,
  GraduationCap,
  Split,
  Globe2,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  BookOpen,
  BookMarked,
  BookOpenCheck,
  BookUp,
  BookDown,
  Library,
  UserRoundCog,
  Boxes,
  Package,
  Settings,
  Settings2,
  NotebookPen,
  School,
  Layers,
  PenLine,
  Printer,
  Award,
  FileSpreadsheet,
  CreditCard,
  History,
  Receipt,
  MonitorPlay,
  FileText,
  ClipboardList,
  ClipboardCheck,
  FileCheck2,
  FileSignature,
  Server,
  HeartHandshake,
  AlertTriangle,
  AlertCircle,
  Tags,
  Brain,
  FileInput,
  PiggyBank,
  DollarSign,
  WalletCards,
} from "lucide-react";

export const adminSidebarConfig = {
  basePath: "/admin",
  brandName: "Admin Sekolah",
  initials: "AS",
  email: "admin@smartschool.com",

  menuSections: [
    {
      type: "item",
      key: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
    },

    {
      type: "item",
      key: "presensi",
      icon: CalendarCheck,
      label: "Presensi & Kehadiran",
      path: "/admin/presensi",

      children: [
        {
          key: "rekapPresensiSiswa",
          icon: ClipboardCheck,
          label: "Rekap Presensi Siswa",
          path: "/admin/siswa/absen",
        },
        {
          key: "permohonanIzinSiswa",
          icon: FileText,
          label: "Permohonan Izin Siswa",
          path: "/admin/presensi/izin-siswa",
        },
        {
          key: "rekapPresensiGuru",
          icon: CalendarCheck,
          label: "Rekap Presensi Guru",
          path: "/admin/presensi/rekap-guru",
        },
        {
          key: "permohonanIzinGuru",
          icon: FileSignature,
          label: "Permohonan Izin Guru",
          path: "/admin/presensi/izin-guru",
        },
        {
          key: "pengaturanPresensi",
          icon: Settings,
          label: "Pengaturan Presensi",
          path: "/admin/presensi/pengaturan",
        },
      ],
    },

    {
      type: "item",
      key: "keuangan",
      icon: WalletCards,
      label: "Keuangan & Kas",
      path: "/admin/keuangan",

      children: [
        {
          key: "laporanKeuangan",
          icon: FileSpreadsheet,
          label: "Laporan Keuangan",
          path: "/admin/keuangan/laporan",
        },
        {
          key: "tabunganSiswa",
          icon: PiggyBank,
          label: "Tabungan Siswa",
          path: "/admin/keuangan/tabunganSiswa",
        },
        {
          key: "spp",
          icon: DollarSign,
          label: "SPP",
          path: "/admin/keuangan/SPP",
        },
        {
          key: "jurnalKasSekolah",
          icon: NotebookPen,
          label: "Jurnal & Kas Sekolah",
          path: "/admin/keuangan/jurnalKas",
        },
        {
          key: "settingTarifTagihan",
          icon: Settings2,
          label: "Setting Tarif Tagihan",
          path: "/admin/keuangan/setting-tarif",
        },
        {
          key: "trackingTunggakan",
          icon: AlertCircle,
          label: "Tracking Tunggakan",
          path: "/admin/keuangan/tunggakan",
        },
      ],
    },

    {
      type: "header",
      label: "MASTER DATA",
    },

    {
      type: "item",
      key: "pengguna",
      icon: Users,
      label: "Pengguna",
      path: "/admin/pengguna",

      children: [
        {
          key: "dataGuruStaff",
          icon: UserCheck,
          label: "Data Guru & Staff",
          path: "/admin/guru",
        },
        {
          key: "dataSiswa",
          icon: GraduationCap,
          label: "Data Siswa",
          path: "/admin/siswa",
        },
        {
          key: "faceId",
          icon: ScanFace,
          label: "Face ID",
          path: "/admin/pengguna/face-id",
        },
        {
          key: "kelolaUserPermission",
          icon: UserRoundCog,
          label: "Kelola User & Izin",
          path: "/admin/kelola-user",
        },
      ],
    },

    {
      type: "item",
      key: "akademik",
      icon: GraduationCap,
      label: "Akademik",
      path: "/admin/akademik",

      children: [
        {
          key: "tahunAjaran",
          icon: CalendarDays,
          label: "Tahun Ajaran",
          path: "/admin/tahun-ajaran",
        },
        {
          key: "kelas",
          icon: School,
          label: "Kelas",
          path: "/admin/kelas",
        },
        {
          key: "jurusan",
          icon: Split,
          label: "Jurusan",
          path: "/admin/jurusan",
        },
        {
          key: "mataPelajaran",
          icon: BookOpen,
          label: "Mata Pelajaran",
          path: "/admin/guru/mapel",
        },
        {
          key: "jadwalPelajaran",
          icon: CalendarClock,
          label: "Jadwal Pelajaran",
          path: "/admin/guru/jadwal-mengajar",
        },
      ],
    },

    {
      type: "item",
      key: "lmsCbt",
      icon: MonitorPlay,
      label: "LMS & CBT",
      path: "/admin/lms-cbt",

      children: [
        {
          key: "modulLmsClass",
          icon: MonitorPlay,
          label: "Modul LMS & Class",
          path: "/admin/lms-cbt/modul-class",
        },
        {
          key: "materiModulAjar",
          icon: BookOpenCheck,
          label: "Materi dan Modul Ajar",
          path: "/admin/lms-cbt/materi-modul-ajar",
        },
        {
          key: "tugasSiswa",
          icon: ClipboardList,
          label: "Tugas Siswa",
          path: "/admin/lms-cbt/tugas-siswa",
        },
        {
          key: "ujianCbtOnline",
          icon: FileCheck2,
          label: "Ujian CBT Online",
          path: "/admin/lms-cbt/ujian",
        },
        {
          key: "kapasitasServerCbt",
          icon: Server,
          label: "Kapasitas & Server CBT",
          path: "/admin/lms-cbt/server",
        },
      ],
    },

    {
      type: "item",
      key: "eraport",
      icon: FileSpreadsheet,
      label: "E-Raport",
      path: "/admin/eraport",

      children: [
        {
          key: "entryNilai",
          icon: PenLine,
          label: "Entry Nilai",
          path: "/admin/eraport/entry-nilai",
        },
        {
          key: "cetakRaport",
          icon: Printer,
          label: "Cetak Raport",
          path: "/admin/eraport/cetak-raport",
        },
        {
          key: "pengaturanAgregat",
          icon: Settings2,
          label: "Pengaturan Agregat Nilai A-B-C-D",
          path: "/admin/eraport/pengaturan-agregat",
        },
      ],
    },

    {
      type: "item",
      key: "bk",
      icon: HeartHandshake,
      label: "Bimbingan Konseling",
      path: "/admin/bk",

      children: [
        {
          key: "sesiKonselingSiswa",
          icon: HeartHandshake,
          label: "Sesi Konseling Siswa",
          path: "/admin/bk/sesi-konseling",
        },
        {
          key: "prestasiSiswa",
          icon: Award,
          label: "Prestasi Siswa",
          path: "/admin/bk/prestasi",
        },
        {
          key: "pelanggaranSiswa",
          icon: AlertTriangle,
          label: "Pelanggaran Siswa",
          path: "/admin/bk/pelanggaran",
        },
        {
          key: "kategoriPointPelanggaran",
          icon: Tags,
          label: "Kategori & Point Pelanggaran",
          path: "/admin/bk/kategori-point",
        },
        {
          key: "asesmenMinatBakat",
          icon: Brain,
          label: "Asesmen & Minat Bakat Siswa",
          path: "/admin/bk/asesmen-minat-bakat",
        },
      ],
    },

    {
      type: "item",
      key: "perpustakaan",
      icon: Library,
      label: "Perpustakaan Digital",
      path: "/admin/perpustakaan",

      children: [
        {
          key: "bukuDigital",
          icon: BookOpen,
          label: "Buku Digital",
          path: "/admin/perpustakaan/buku-digital",
        },
        {
          key: "dataBukuPerpustakaan",
          icon: Library,
          label: "Data Buku Perpustakaan",
          path: "/admin/perpustakaan/data-buku",
        },
        {
          key: "peminjaman",
          icon: BookUp,
          label: "Peminjaman",
          path: "/admin/perpustakaan/pinjam",
        },
        {
          key: "pengembalian",
          icon: BookDown,
          label: "Pengembalian",
          path: "/admin/perpustakaan/pengembalian",
        },
      ],
    },

    {
      type: "item",
      key: "sarpras",
      icon: Boxes,
      label: "Sarpras",
      path: "/admin/sarpras",

      children: [
        {
          key: "gedung",
          icon: School,
          label: "Gedung",
          path: "/admin/sarpras/gedung",
        },
        {
          key: "lantai",
          icon: Layers,
          label: "Lantai",
          path: "/admin/sarpras/gedung/lantai",
        },
        {
          key: "gudang",
          icon: Boxes,
          label: "Gudang",
          path: "/admin/sarpras/gudang/master",
        },
        {
          key: "kategoriAset",
          icon: Tags,
          label: "Kategori Aset",
          path: "/admin/sarpras/kategori",
        },
        {
          key: "daftarAset",
          icon: Package,
          label: "Daftar Aset",
          path: "/admin/sarpras/gudang",
        },
      ],
    },

    {
      type: "item",
      key: "spmb",
      icon: UserPlus,
      label: "Penerimaan (SPMB)",
      path: "/admin/spmb",

      children: [
        {
          key: "dataPendaftaran",
          icon: FileInput,
          label: "Data Pendaftaran",
          path: "/admin/spmb/data-pendaftaran",
        },
        {
          key: "gelombang",
          icon: Layers,
          label: "Gelombang",
          path: "/admin/spmb/gelombang",
        },
        {
          key: "pengaturanSpmb",
          icon: Settings,
          label: "Pengaturan",
          path: "/admin/spmb/pengaturan",
        },
      ],
    },

    {
      type: "item",
      key: "cms",
      icon: Globe2,
      label: "CMS",
      path: "/cmsAdmin",

      children: [
        {
          key: "cmsPages",
          icon: FileText,
          label: "Halaman Website",
          path: "/cmsAdmin/pages",
        },
        {
          key: "cmsMedia",
          icon: FileInput,
          label: "Media, Files, Banner & Slider",
          path: "/cmsAdmin/media",
        },
        {
          key: "cmsSettings",
          icon: Settings2,
          label: "Sistem & Pengaturan",
          path: "/cmsAdmin/settings",
        },
      ],
    },

    {
      type: "item",
      key: "langganan",
      icon: CreditCard,
      label: "Langganan",
      path: "/admin/langganan",

      children: [
        {
          key: "paketLangganan",
          icon: CreditCard,
          label: "Paket Langganan",
          path: "/admin/langganan/paket",
        },
        {
          key: "riwayatPembayaran",
          icon: History,
          label: "Riwayat Pembayaran",
          path: "/admin/langganan/riwayat-pembayaran",
        },
        {
          key: "invoice",
          icon: Receipt,
          label: "Tagihan / Invoice",
          path: "/admin/langganan/invoice",
        },
      ],
    },
  ],
};