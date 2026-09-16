"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  Search,
  Printer,
  Eye,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
  Download,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

/* =========================================================
   DATA SISWA
========================================================= */

const initialStudents = [
  {
    id: 1,
    nama: "Ahmad Fauzan",
    nis: "2024001",
    nisn: "0061234567",
    kelas: "XII PPLG 1",
    totalMapel: 10,
    nilaiTerisi: 10,
    rataRata: 89,
    status: "Siap Dicetak",
  },
  {
    id: 2,
    nama: "Budi Santoso",
    nis: "2024002",
    nisn: "0061234568",
    kelas: "XII PPLG 1",
    totalMapel: 10,
    nilaiTerisi: 10,
    rataRata: 86,
    status: "Siap Dicetak",
  },
  {
    id: 3,
    nama: "Citra Lestari",
    nis: "2024003",
    nisn: "0061234569",
    kelas: "XII PPLG 1",
    totalMapel: 10,
    nilaiTerisi: 9,
    rataRata: 84,
    status: "Belum Lengkap",
  },
  {
    id: 4,
    nama: "Dimas Pratama",
    nis: "2024004",
    nisn: "0061234570",
    kelas: "XII PPLG 1",
    totalMapel: 10,
    nilaiTerisi: 10,
    rataRata: 91,
    status: "Siap Dicetak",
  },
  {
    id: 5,
    nama: "Eka Saputra",
    nis: "2024005",
    nisn: "0061234571",
    kelas: "XII PPLG 1",
    totalMapel: 10,
    nilaiTerisi: 8,
    rataRata: 81,
    status: "Belum Lengkap",
  },
  {
    id: 6,
    nama: "Fajar Ramadhan",
    nis: "2024006",
    nisn: "0061234572",
    kelas: "XII PPLG 2",
    totalMapel: 10,
    nilaiTerisi: 10,
    rataRata: 88,
    status: "Siap Dicetak",
  },
  {
    id: 7,
    nama: "Gilang Maulana",
    nis: "2024007",
    nisn: "0061234573",
    kelas: "XII PPLG 2",
    totalMapel: 10,
    nilaiTerisi: 10,
    rataRata: 90,
    status: "Siap Dicetak",
  },
  {
    id: 8,
    nama: "Hana Putri",
    nis: "2024008",
    nisn: "0061234574",
    kelas: "XII PPLG 2",
    totalMapel: 10,
    nilaiTerisi: 9,
    rataRata: 87,
    status: "Belum Lengkap",
  },
];

/* =========================================================
   DATA NILAI DETAIL
========================================================= */

const nilaiSiswa = {
  1: [
    {
      mapel: "Pendidikan Agama",
      tugas: 90,
      uts: 88,
      uas: 90,
      praktik: 92,
      nilaiAkhir: 90,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pendidikan Pancasila",
      tugas: 88,
      uts: 86,
      uas: 89,
      praktik: 88,
      nilaiAkhir: 88,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Bahasa Indonesia",
      tugas: 87,
      uts: 89,
      uas: 88,
      praktik: 90,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Matematika",
      tugas: 85,
      uts: 87,
      uas: 86,
      praktik: 88,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Bahasa Inggris",
      tugas: 89,
      uts: 90,
      uas: 88,
      praktik: 91,
      nilaiAkhir: 90,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Dasar",
      tugas: 92,
      uts: 90,
      uas: 94,
      praktik: 95,
      nilaiAkhir: 93,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Web",
      tugas: 90,
      uts: 88,
      uas: 92,
      praktik: 94,
      nilaiAkhir: 91,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Basis Data",
      tugas: 88,
      uts: 86,
      uas: 90,
      praktik: 92,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Jaringan Komputer",
      tugas: 84,
      uts: 86,
      uas: 87,
      praktik: 88,
      nilaiAkhir: 86,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Produk Kreatif dan Kewirausahaan",
      tugas: 88,
      uts: 87,
      uas: 90,
      praktik: 91,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
  ],

  2: [
    {
      mapel: "Pendidikan Agama",
      tugas: 86,
      uts: 85,
      uas: 88,
      praktik: 87,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pendidikan Pancasila",
      tugas: 84,
      uts: 86,
      uas: 85,
      praktik: 87,
      nilaiAkhir: 85,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Indonesia",
      tugas: 85,
      uts: 87,
      uas: 86,
      praktik: 88,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Matematika",
      tugas: 82,
      uts: 84,
      uas: 85,
      praktik: 86,
      nilaiAkhir: 84,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Inggris",
      tugas: 86,
      uts: 88,
      uas: 87,
      praktik: 89,
      nilaiAkhir: 88,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Dasar",
      tugas: 89,
      uts: 87,
      uas: 90,
      praktik: 92,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Web",
      tugas: 88,
      uts: 86,
      uas: 89,
      praktik: 91,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Basis Data",
      tugas: 85,
      uts: 84,
      uas: 87,
      praktik: 89,
      nilaiAkhir: 86,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Jaringan Komputer",
      tugas: 83,
      uts: 82,
      uas: 85,
      praktik: 87,
      nilaiAkhir: 84,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Produk Kreatif dan Kewirausahaan",
      tugas: 86,
      uts: 85,
      uas: 88,
      praktik: 89,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
  ],

  3: [
    {
      mapel: "Pendidikan Agama",
      tugas: 84,
      uts: 83,
      uas: 85,
      praktik: 86,
      nilaiAkhir: 84,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Pendidikan Pancasila",
      tugas: 82,
      uts: 84,
      uas: 83,
      praktik: 85,
      nilaiAkhir: 83,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Indonesia",
      tugas: 85,
      uts: 84,
      uas: 86,
      praktik: 87,
      nilaiAkhir: 85,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Matematika",
      tugas: 80,
      uts: 81,
      uas: 83,
      praktik: 84,
      nilaiAkhir: 82,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Inggris",
      tugas: 84,
      uts: 85,
      uas: 86,
      praktik: 87,
      nilaiAkhir: 85,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Pemrograman Dasar",
      tugas: 87,
      uts: 86,
      uas: 89,
      praktik: 91,
      nilaiAkhir: 88,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Web",
      tugas: 86,
      uts: 85,
      uas: 88,
      praktik: 90,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Basis Data",
      tugas: 82,
      uts: 83,
      uas: 85,
      praktik: 87,
      nilaiAkhir: 84,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Jaringan Komputer",
      tugas: 80,
      uts: 81,
      uas: 83,
      praktik: 85,
      nilaiAkhir: 82,
      predikat: "B",
      keterangan: "Baik",
    },
  ],

  4: [
    {
      mapel: "Pendidikan Agama",
      tugas: 92,
      uts: 90,
      uas: 93,
      praktik: 94,
      nilaiAkhir: 92,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pendidikan Pancasila",
      tugas: 90,
      uts: 91,
      uas: 89,
      praktik: 92,
      nilaiAkhir: 90,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Bahasa Indonesia",
      tugas: 91,
      uts: 89,
      uas: 92,
      praktik: 93,
      nilaiAkhir: 91,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Matematika",
      tugas: 88,
      uts: 90,
      uas: 89,
      praktik: 91,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Bahasa Inggris",
      tugas: 92,
      uts: 91,
      uas: 90,
      praktik: 93,
      nilaiAkhir: 91,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Dasar",
      tugas: 95,
      uts: 93,
      uas: 96,
      praktik: 98,
      nilaiAkhir: 96,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Web",
      tugas: 94,
      uts: 92,
      uas: 95,
      praktik: 97,
      nilaiAkhir: 95,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Basis Data",
      tugas: 92,
      uts: 90,
      uas: 94,
      praktik: 96,
      nilaiAkhir: 93,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Jaringan Komputer",
      tugas: 89,
      uts: 88,
      uas: 91,
      praktik: 93,
      nilaiAkhir: 90,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Produk Kreatif dan Kewirausahaan",
      tugas: 90,
      uts: 91,
      uas: 92,
      praktik: 94,
      nilaiAkhir: 92,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
  ],

  5: [
    {
      mapel: "Pendidikan Agama",
      tugas: 80,
      uts: 81,
      uas: 82,
      praktik: 83,
      nilaiAkhir: 81,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Pendidikan Pancasila",
      tugas: 79,
      uts: 80,
      uas: 81,
      praktik: 82,
      nilaiAkhir: 80,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Indonesia",
      tugas: 82,
      uts: 81,
      uas: 83,
      praktik: 84,
      nilaiAkhir: 82,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Matematika",
      tugas: 78,
      uts: 80,
      uas: 81,
      praktik: 82,
      nilaiAkhir: 80,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Inggris",
      tugas: 80,
      uts: 82,
      uas: 81,
      praktik: 83,
      nilaiAkhir: 81,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Pemrograman Dasar",
      tugas: 84,
      uts: 83,
      uas: 85,
      praktik: 87,
      nilaiAkhir: 85,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Pemrograman Web",
      tugas: 83,
      uts: 82,
      uas: 84,
      praktik: 86,
      nilaiAkhir: 84,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Basis Data",
      tugas: 81,
      uts: 80,
      uas: 83,
      praktik: 85,
      nilaiAkhir: 82,
      predikat: "B",
      keterangan: "Baik",
    },
  ],

  6: [
    {
      mapel: "Pendidikan Agama",
      tugas: 88,
      uts: 87,
      uas: 89,
      praktik: 90,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pendidikan Pancasila",
      tugas: 86,
      uts: 85,
      uas: 88,
      praktik: 89,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Bahasa Indonesia",
      tugas: 87,
      uts: 86,
      uas: 88,
      praktik: 90,
      nilaiAkhir: 88,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Matematika",
      tugas: 84,
      uts: 83,
      uas: 86,
      praktik: 88,
      nilaiAkhir: 85,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Inggris",
      tugas: 88,
      uts: 87,
      uas: 89,
      praktik: 91,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Dasar",
      tugas: 91,
      uts: 90,
      uas: 92,
      praktik: 94,
      nilaiAkhir: 92,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Web",
      tugas: 90,
      uts: 88,
      uas: 92,
      praktik: 93,
      nilaiAkhir: 91,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Basis Data",
      tugas: 87,
      uts: 86,
      uas: 89,
      praktik: 91,
      nilaiAkhir: 88,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Jaringan Komputer",
      tugas: 85,
      uts: 84,
      uas: 87,
      praktik: 89,
      nilaiAkhir: 86,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Produk Kreatif dan Kewirausahaan",
      tugas: 88,
      uts: 87,
      uas: 90,
      praktik: 91,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
  ],

  7: [
    {
      mapel: "Pendidikan Agama",
      tugas: 90,
      uts: 89,
      uas: 91,
      praktik: 92,
      nilaiAkhir: 91,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pendidikan Pancasila",
      tugas: 89,
      uts: 88,
      uas: 90,
      praktik: 91,
      nilaiAkhir: 90,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Bahasa Indonesia",
      tugas: 90,
      uts: 89,
      uas: 91,
      praktik: 92,
      nilaiAkhir: 91,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Matematika",
      tugas: 87,
      uts: 89,
      uas: 88,
      praktik: 90,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Bahasa Inggris",
      tugas: 91,
      uts: 90,
      uas: 92,
      praktik: 93,
      nilaiAkhir: 92,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Dasar",
      tugas: 93,
      uts: 92,
      uas: 95,
      praktik: 97,
      nilaiAkhir: 94,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Web",
      tugas: 92,
      uts: 91,
      uas: 94,
      praktik: 96,
      nilaiAkhir: 93,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Basis Data",
      tugas: 90,
      uts: 89,
      uas: 92,
      praktik: 94,
      nilaiAkhir: 91,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Jaringan Komputer",
      tugas: 88,
      uts: 87,
      uas: 90,
      praktik: 92,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Produk Kreatif dan Kewirausahaan",
      tugas: 89,
      uts: 90,
      uas: 91,
      praktik: 93,
      nilaiAkhir: 91,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
  ],

  8: [
    {
      mapel: "Pendidikan Agama",
      tugas: 86,
      uts: 85,
      uas: 87,
      praktik: 88,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pendidikan Pancasila",
      tugas: 85,
      uts: 84,
      uas: 86,
      praktik: 87,
      nilaiAkhir: 86,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Indonesia",
      tugas: 87,
      uts: 86,
      uas: 88,
      praktik: 89,
      nilaiAkhir: 88,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Matematika",
      tugas: 83,
      uts: 82,
      uas: 85,
      praktik: 86,
      nilaiAkhir: 84,
      predikat: "B",
      keterangan: "Baik",
    },
    {
      mapel: "Bahasa Inggris",
      tugas: 86,
      uts: 85,
      uas: 87,
      praktik: 89,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Dasar",
      tugas: 89,
      uts: 88,
      uas: 91,
      praktik: 93,
      nilaiAkhir: 90,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Pemrograman Web",
      tugas: 88,
      uts: 87,
      uas: 90,
      praktik: 92,
      nilaiAkhir: 89,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Basis Data",
      tugas: 85,
      uts: 84,
      uas: 88,
      praktik: 90,
      nilaiAkhir: 87,
      predikat: "A",
      keterangan: "Sangat Baik",
    },
    {
      mapel: "Jaringan Komputer",
      tugas: 84,
      uts: 83,
      uas: 86,
      praktik: 88,
      nilaiAkhir: 85,
      predikat: "B",
      keterangan: "Baik",
    },
  ],
};

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const ready = status === "Siap Dicetak";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        ready
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {ready ? (
        <CheckCircle2 size={14} />
      ) : (
        <AlertCircle size={14} />
      )}

      {status}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon: Icon, label, value, type = "blue" }) {
  const styles = {
    blue: {
      box: "bg-blue-50",
      icon: "text-blue-600",
      value: "text-slate-900",
    },
    green: {
      box: "bg-emerald-50",
      icon: "text-emerald-600",
      value: "text-emerald-700",
    },
    amber: {
      box: "bg-amber-50",
      icon: "text-amber-600",
      value: "text-amber-700",
    },
    purple: {
      box: "bg-indigo-50",
      icon: "text-indigo-600",
      value: "text-indigo-700",
    },
  };

  const style = styles[type];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:px-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} />
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function CetakRaportPage() {
  const [students, setStudents] = useState(initialStudents);

  const [search, setSearch] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [semester, setSemester] = useState("Genap");
  const [kelas, setKelas] = useState("Semua Kelas");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const [selectedIds, setSelectedIds] = useState([]);
  const [detailStudent, setDetailStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        student.nama.toLowerCase().includes(keyword) ||
        student.nis.toLowerCase().includes(keyword) ||
        student.nisn.toLowerCase().includes(keyword);

      const matchKelas =
        kelas === "Semua Kelas" || student.kelas === kelas;

      const matchStatus =
        statusFilter === "Semua Status" ||
        student.status === statusFilter;

      return matchSearch && matchKelas && matchStatus;
    });
  }, [students, search, kelas, statusFilter]);

  /* =======================================================
     STATISTIK
  ======================================================= */

  const totalSiswa = students.length;

  const siapCetak = students.filter(
    (student) => student.status === "Siap Dicetak"
  ).length;

  const belumLengkap = students.filter(
    (student) => student.status === "Belum Lengkap"
  ).length;

  const rataRata =
    students.length > 0
      ? Math.round(
          students.reduce(
            (total, student) => total + student.rataRata,
            0
          ) / students.length
        )
      : 0;

  /* =======================================================
     CHECKBOX
  ======================================================= */

  const toggleStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    const filteredIds = filteredStudents.map((student) => student.id);

    const allSelected = filteredIds.every((id) =>
      selectedIds.includes(id)
    );

    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...filteredIds]),
      ]);
    }
  };

  /* =======================================================
     PREVIEW / DETAIL
  ======================================================= */

  const openDetail = (student) => {
    setDetailStudent(student);
  };

  /* =======================================================
     CETAK
  ======================================================= */

  const handlePrint = (student) => {
    if (student.status !== "Siap Dicetak") {
      alert("Raport siswa belum lengkap.");
      return;
    }

    setDetailStudent(student);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleBulkPrint = () => {
    const selectedStudents = students.filter((student) =>
      selectedIds.includes(student.id)
    );

    const incomplete = selectedStudents.filter(
      (student) => student.status !== "Siap Dicetak"
    );

    if (selectedStudents.length === 0) {
      alert("Pilih siswa terlebih dahulu.");
      return;
    }

    if (incomplete.length > 0) {
      alert(
        "Ada siswa yang raportnya belum lengkap. Hanya raport yang lengkap yang dapat dicetak."
      );
      return;
    }

    setDetailStudent(selectedStudents[0]);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex print:block">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col print:block">
          <Header />

          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 print:p-0">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Printer size={21} />
                  </div>

                  <div>
                    <h1 className="text-xl font-bold text-slate-900">
                      Cetak Raport Siswa
                    </h1>

                    <p className="mt-0.5 text-sm text-slate-600">
                      Kelola preview dan pencetakan raport siswa
                    </p>
                  </div>
                </div>
              </div>

              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkPrint}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Printer size={17} />
                  Cetak {selectedIds.length} Raport
                </button>
              )}
            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* TAHUN AJARAN */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Tahun Ajaran
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <select
                      value={tahunAjaran}
                      onChange={(e) =>
                        setTahunAjaran(e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>2025/2026</option>
                      <option>2024/2025</option>
                      <option>2023/2024</option>
                    </select>
                  </div>
                </div>

                {/* SEMESTER */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Semester
                  </label>

                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Ganjil</option>
                    <option>Genap</option>
                  </select>
                </div>

                {/* KELAS */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Kelas
                  </label>

                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Semua Kelas</option>
                    <option>XII PPLG 1</option>
                    <option>XII PPLG 2</option>
                  </select>
                </div>

                {/* STATUS */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Status Raport
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Semua Status</option>
                    <option>Siap Dicetak</option>
                    <option>Belum Lengkap</option>
                  </select>
                </div>
              </div>

              {/* SEARCH */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama siswa, NIS, atau NISN..."
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setTahunAjaran("2025/2026");
                    setSemester("Genap");
                    setKelas("Semua Kelas");
                    setStatusFilter("Semua Status");
                    setSelectedIds([]);
                  }}
                  className="h-10 rounded-lg px-4 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Reset Filter
                </button>
              </div>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total Siswa"
                value={totalSiswa}
                type="blue"
              />

              <StatCard
                icon={CheckCircle2}
                label="Siap Dicetak"
                value={siapCetak}
                type="green"
              />

              <StatCard
                icon={AlertCircle}
                label="Belum Lengkap"
                value={belumLengkap}
                type="amber"
              />

              <StatCard
                icon={BookOpen}
                label="Rata-rata Nilai"
                value={rataRata}
                type="purple"
              />
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Data Raport Siswa
                  </h2>

                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    {filteredStudents.length} siswa ditemukan
                  </p>
                </div>

                {selectedIds.length > 0 && (
                  <span className="text-xs font-semibold text-blue-600">
                    {selectedIds.length} dipilih
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-xs font-semibold uppercase tracking-wide text-white">
                      <th className="w-12 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredStudents.length > 0 &&
                            filteredStudents.every((student) =>
                              selectedIds.includes(student.id)
                            )
                          }
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-white accent-blue-700"
                        />
                      </th>

                      <th className="w-14 px-4 py-3.5 text-center">
                        No
                      </th>

                      <th className="px-5 py-3.5 text-left">
                        Siswa
                      </th>

                      <th className="px-5 py-3.5 text-left">
                        NIS / NISN
                      </th>

                      <th className="px-5 py-3.5 text-left">
                        Kelas
                      </th>

                      <th className="px-5 py-3.5 text-center">
                        Nilai
                      </th>

                      <th className="px-5 py-3.5 text-center">
                        Rata-rata
                      </th>

                      <th className="px-5 py-3.5 text-left">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const selected = selectedIds.includes(student.id);

                      return (
                        <tr
                          key={student.id}
                          className={`border-b border-slate-100 transition last:border-0 hover:bg-slate-50 ${
                            selected ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleStudent(student.id)
                              }
                              className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                            />
                          </td>

                          <td className="px-4 py-4 text-center text-sm font-medium text-slate-700">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <GraduationCap size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {student.nama}
                                </p>

                                <p className="mt-0.5 text-xs font-medium text-slate-600">
                                  NIS {student.nis}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-800">
                              {student.nis}
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-slate-600">
                              NISN {student.nisn}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                            {student.kelas}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`text-sm font-bold ${
                                student.nilaiTerisi ===
                                student.totalMapel
                                  ? "text-emerald-700"
                                  : "text-amber-700"
                              }`}
                            >
                              {student.nilaiTerisi}/
                              {student.totalMapel}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="text-sm font-bold text-slate-900">
                              {student.rataRata}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={student.status} />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* DETAIL */}
                              <button
                                type="button"
                                onClick={() =>
                                  openDetail(student)
                                }
                                title="Lihat detail raport"
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Eye size={16} />
                              </button>

                              {/* CETAK */}
                              <button
                                type="button"
                                onClick={() =>
                                  handlePrint(student)
                                }
                                title="Cetak raport"
                                disabled={
                                  student.status !==
                                  "Siap Dicetak"
                                }
                                className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                                  student.status ===
                                  "Siap Dicetak"
                                    ? "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    : "cursor-not-allowed text-slate-300"
                                }`}
                              >
                                <Printer size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-16 text-center"
                        >
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                              <Search size={21} />
                            </div>

                            <p className="mt-3 text-sm font-semibold text-slate-900">
                              Data tidak ditemukan
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-600">
                              Coba ubah kata kunci atau filter
                              yang digunakan.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =================================================
                INFO
            ================================================= */}

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
              <div className="flex gap-3">
                <div className="mt-0.5 text-blue-600">
                  <FileText size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Informasi Cetak Raport
                  </p>

                  <p className="mt-1 text-xs font-medium leading-5 text-slate-700">
                    Raport hanya dapat dicetak apabila seluruh
                    nilai mata pelajaran siswa sudah lengkap.
                    Gunakan tombol Detail untuk melihat seluruh
                    nilai siswa sebelum mencetak raport.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* =====================================================
          MODAL DETAIL RAPORT
      ===================================================== */}

      {detailStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-3 sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Detail Raport Siswa
                  </h2>

                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    {detailStudent.nama} • {detailStudent.kelas}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
              {/* IDENTITAS */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap
                    size={18}
                    className="text-blue-600"
                  />

                  <h3 className="text-sm font-bold text-slate-900">
                    Identitas Siswa
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Nama Siswa
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {detailStudent.nama}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      NIS
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {detailStudent.nis}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      NISN
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {detailStudent.nisn}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Kelas
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {detailStudent.kelas}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-600">
                      Tahun Ajaran
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {tahunAjaran}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-600">
                      Semester
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {semester}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-600">
                      Status Raport
                    </p>

                    <div className="mt-1">
                      <StatusBadge
                        status={detailStudent.status}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RINGKASAN */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-600">
                    Mata Pelajaran
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {detailStudent.nilaiTerisi}/
                    {detailStudent.totalMapel}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-600">
                    Rata-rata Nilai
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-700">
                    {detailStudent.rataRata}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-600">
                    Status
                  </p>

                  <div className="mt-1">
                    <StatusBadge
                      status={detailStudent.status}
                    />
                  </div>
                </div>
              </div>

              {/* SELURUH NILAI */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Seluruh Nilai Mata Pelajaran
                  </h3>

                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    Detail nilai akademik siswa pada semester{" "}
                    {semester.toLowerCase()}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-xs font-bold text-slate-800">
                        <th className="w-14 px-4 py-3 text-center">
                          No
                        </th>

                        <th className="px-4 py-3 text-left">
                          Mata Pelajaran
                        </th>

                        <th className="px-4 py-3 text-center">
                          Tugas
                        </th>

                        <th className="px-4 py-3 text-center">
                          UTS
                        </th>

                        <th className="px-4 py-3 text-center">
                          UAS
                        </th>

                        <th className="px-4 py-3 text-center">
                          Praktik
                        </th>

                        <th className="px-4 py-3 text-center">
                          Nilai Akhir
                        </th>

                        <th className="px-4 py-3 text-center">
                          Predikat
                        </th>

                        <th className="px-4 py-3 text-left">
                          Keterangan
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {(nilaiSiswa[detailStudent.id] || []).map(
                        (nilai, index) => (
                          <tr
                            key={`${detailStudent.id}-${index}`}
                            className="border-t border-slate-200 transition hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                              {index + 1}
                            </td>

                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                              {nilai.mapel}
                            </td>

                            <td className="px-4 py-3 text-center text-sm font-semibold text-slate-800">
                              {nilai.tugas}
                            </td>

                            <td className="px-4 py-3 text-center text-sm font-semibold text-slate-800">
                              {nilai.uts}
                            </td>

                            <td className="px-4 py-3 text-center text-sm font-semibold text-slate-800">
                              {nilai.uas}
                            </td>

                            <td className="px-4 py-3 text-center text-sm font-semibold text-slate-800">
                              {nilai.praktik}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-bold text-slate-900">
                                {nilai.nilaiAkhir}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs font-bold ${
                                  nilai.predikat === "A"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {nilai.predikat}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-sm font-medium text-slate-700">
                              {nilai.keterangan}
                            </td>
                          </tr>
                        )
                      )}

                      {(!nilaiSiswa[detailStudent.id] ||
                        nilaiSiswa[detailStudent.id].length === 0) && (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-5 py-10 text-center"
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              Data nilai belum tersedia
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KEHADIRAN */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays
                    size={18}
                    className="text-blue-600"
                  />

                  <h3 className="text-sm font-bold text-slate-900">
                    Rekap Kehadiran
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                      Sakit
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      2
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                      Izin
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      1
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                      Alpa
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      0
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                      Kehadiran
                    </p>
                    <p className="mt-1 text-lg font-bold text-emerald-700">
                      98%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X size={16} />
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(
                    "Fitur Download PDF siap dihubungkan ke backend/PDF generator."
                  );
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download size={16} />
                Download PDF
              </button>

              <button
                type="button"
                disabled={
                  detailStudent.status !== "Siap Dicetak"
                }
                onClick={() => handlePrint(detailStudent)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition ${
                  detailStudent.status === "Siap Dicetak"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-300"
                }`}
              >
                <Printer size={16} />
                Cetak Raport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRINT STYLE
      ===================================================== */}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .print\\:block,
          .print\\:block * {
            visibility: visible !important;
          }

          .fixed {
            position: static !important;
          }

          header {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}