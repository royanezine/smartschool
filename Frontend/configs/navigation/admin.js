import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserPlus,
  LayoutTemplate,
  ScanFace,
  GraduationCap,
  FolderOpen,
  WalletCards,
  Landmark,
  KeyRound,
  BriefcaseBusiness,
  Globe2,
  PackageCheck,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  BookOpen,
  Clock3,
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
  DoorOpen,
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
  Clock,
  Activity,
  Route,
  Undo2,
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
      key: "manajemenShift",
      icon: Clock3,
      label: "Manajemen Shift",
      path: "/admin/presensi/master-shift",

      children: [
        {
          key: "masterShift",
          icon: CalendarClock,
          label: "Master Shift",
          path: "/admin/presensi/master-shift",
        },
        {
          key: "penugasanShift",
          icon: UserRoundCog,
          label: "Penugasan Shift",
          path: "/admin/presensi/penugasan-shift",
        },
      ],
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
          key: "permohonanIzin",
          icon: FileSignature,
          label: "Daftar Permohonan Izin",
          path: "/admin/presensi/izin-guru",
        },

        {
          key: "rekapAbsensiShift",
          icon: Clock,
          label: "Rekap Absensi Shift",
          path: "/admin/presensi/rekap-absensi-shift",
        },

        {
          key: "monitoringKehadiranGuru",
          icon: Activity,
          label: "Monitoring Kehadiran Guru",
          path: "/admin/presensi/monitoring-kehadiran-guru",
        },

        {
          key: "pengaturanPresensi",
          icon: Settings,
          label: "Pengaturan Presensi",
          path: "/admin/presensi/pengaturan",
        },
        {
          key: "kategoriJabatan",
          icon: BriefcaseBusiness,
          label: "Kategori Jabatan",
          path: "/admin/presensi/kategori-jabatan",
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
          key: "laporanKas",
          icon: FileSpreadsheet,
          label: "Laporan Kas",
          path: "/admin/keuangan/laporanKas",
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
          key: "akunKas",
          icon: Landmark,
          label: "Akun Kas",
          path: "/admin/keuangan/akunKas",
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
        {
          key: "penggajian",
          icon: WalletCards,
          label: "Penggajian",
          path: "/admin/keuangan/penggajian",
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
          key: "pengaturanPinSiswa",
          icon: KeyRound,
          label: "Pengaturan PIN Siswa",
          path: "/admin/pengguna/pin-siswa",
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
          path: "/admin/pengguna/kelola-user",
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
          path: "/admin/akademik/tahun-ajaran",
        },
        {
          key: "kelas",
          icon: School,
          label: "Kelas",
          path: "/admin/akademik/kelas",
        },
        {
          key: "guruWaliKelas",
          icon: UserCheck,
          label: "Wali Kelas",
          path: "/admin/guru/wali-kelas",
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
          path: "/admin/perpustakaan/peminjaman",
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
          key: "ruangan",
          icon: DoorOpen,
          label: "Ruangan",
          path: "/admin/sarpras/ruangan",
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
          key: "inventaris",
          icon: Package,
          label: "Inventaris",
          path: "/admin/sarpras/iventaris",
        },
        {
          key: "peminjaman",
          icon: PackageCheck,
          label: "Peminjaman",
          path: "/admin/sarpras/peminjaman",
        },
        {
          key: "pengembalian",
          icon: Undo2,
          label: "Pengembalian",
          path: "/admin/sarpras/pengembalian",
        },
        {
          key: "riwayatSarpras",
          icon: History,
          label: "Riwayat",
          path: "/admin/sarpras/riwayat",
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
          key: "jalur",
          icon: Route,
          label: "Jalur Pendaftaran",
          path: "/admin/spmb/jalur",
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
  path: "/admin/cms",

  children: [

     {
      key: "cmsArticleCategories",
      icon: FolderOpen,
      label: "Kategori Artikel",
      path: "/admin/cms/articles/categories",
    },
     {
      key: "cmsArticles",
      icon: FileInput,
      label: "Artikel",
      path: "/admin/cms/articles",
    },
    {
      key: "cmsWebsitePages",
      icon: LayoutTemplate,
      label: "Halaman Website",
      path: "/admin/cms/pages",
    },
   
   
     {
      key: "cmsPages",
      icon: FileText,
      label: "Konfigurasi Konten",
      path: "/admin/cms/menu",
    },
    {
      key: "cmsSettings",
      icon: Settings2,
      label: "Sistem & Pengaturan",
      path: "/admin/cms/pengaturan",
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