import {
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  GraduationCap,
  ClipboardCheck,
  User,
  CalendarDays,
} from "lucide-react";

/**
 * Konfigurasi menu untuk role "siswa".
 *
 * Struktur folder aktual (app/siswa):
 * - page.jsx                          -> Beranda (/siswa)
 * - absensi/page.jsx                  -> Absensi (/siswa/absensi)
 * - jadwal/page.jsx                   -> Jadwal (/siswa/jadwal)
 * - ujian/page.jsx                    -> Ujian (/siswa/ujian)
 * - mataPelajaran/page.jsx            -> Mata Pelajaran (/siswa/mataPelajaran)
 *   - materi/page.jsx                 -> Materi
 *   - tugas/page.jsx                  -> Tugas
 *   - ujian/page.jsx                  -> Ujian
 * - profil/pengaturan                  -> Pengaturan
 *
 * "Mata Pelajaran" dibikin bertingkat karena memiliki
 * beberapa sub-halaman pembelajaran.
 */
export const siswaSidebarConfig = {
  basePath: "/siswa",
  brandName: "Portal Siswa",
  initials: "SW",
  email: "siswa@smartschool.com",

  menuSections: [
    {
      type: "item",
      key: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/siswa",
    },

    {
      type: "item",
      key: "absensi",
      icon: ClipboardCheck,
      label: "Absensi",
      path: "/siswa/absensi",
    },

    {
      type: "item",
      key: "jadwal",
      icon: CalendarDays,
      label: "Jadwal",
      path: "/siswa/jadwal",
    },

    {
      type: "item",
      key: "ujian",
      icon: ClipboardCheck,
      label: "Ujian",
      path: "/siswa/ujian",
    },

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
        
      ],
    },

    {
      type: "item",
      key: "pengaturan",
      icon: User,
      label: "Pengaturan",
      path: "/siswa/pengaturan",
    },
  ],
};