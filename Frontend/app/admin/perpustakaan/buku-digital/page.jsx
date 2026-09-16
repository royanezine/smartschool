"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  RefreshCw,
  ChevronDown,
  FileText,
  Download,
  Users,
  CheckCircle2,
  Clock3,
  BookMarked,
  Upload,
  Library,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const initialBooks = [
  {
    id: 1,
    title: "Matematika untuk SMA Kelas X",
    author: "Dr. Budi Santoso, M.Pd.",
    publisher: "Penerbit Edukasi Nasional",
    year: "2025",
    category: "Matematika",
    level: "SMA",
    format: "PDF",
    pages: 184,
    size: "8.4 MB",
    status: "Aktif",
    downloads: 342,
    description:
      "Buku pembelajaran Matematika untuk siswa SMA kelas X yang mencakup materi dasar hingga latihan soal.",
    color: "blue",
  },
  {
    id: 2,
    title: "Bahasa Indonesia: Cakap Berbahasa",
    author: "Siti Rahmawati, S.Pd.",
    publisher: "Media Pendidikan",
    year: "2024",
    category: "Bahasa Indonesia",
    level: "SMA",
    format: "PDF",
    pages: 216,
    size: "11.2 MB",
    status: "Aktif",
    downloads: 287,
    description:
      "Materi Bahasa Indonesia yang dilengkapi contoh teks, latihan, dan pembahasan.",
    color: "rose",
  },
  {
    id: 3,
    title: "Fisika Dasar untuk Pelajar",
    author: "Andi Pratama, S.Si.",
    publisher: "Sains Indonesia",
    year: "2025",
    category: "IPA",
    level: "SMA",
    format: "PDF",
    pages: 248,
    size: "14.7 MB",
    status: "Aktif",
    downloads: 221,
    description:
      "Buku digital Fisika dengan pembahasan konsep, rumus, contoh soal, dan latihan.",
    color: "emerald",
  },
  {
    id: 4,
    title: "Pemrograman Dasar",
    author: "Ahmad Fauzi, S.Kom.",
    publisher: "Tekno Edu",
    year: "2025",
    category: "Informatika",
    level: "SMK",
    format: "PDF",
    pages: 302,
    size: "18.6 MB",
    status: "Aktif",
    downloads: 418,
    description:
      "Panduan dasar pemrograman untuk siswa SMK mulai dari algoritma hingga implementasi program.",
    color: "violet",
  },
  {
    id: 5,
    title: "Sejarah Indonesia Modern",
    author: "Dr. Rina Kusuma",
    publisher: "Nusantara Press",
    year: "2023",
    category: "Sejarah",
    level: "SMA",
    format: "PDF",
    pages: 276,
    size: "12.5 MB",
    status: "Aktif",
    downloads: 194,
    description:
      "Membahas perjalanan sejarah Indonesia modern secara ringkas dan sistematis.",
    color: "amber",
  },
  {
    id: 6,
    title: "Dasar-Dasar Akuntansi",
    author: "Hendra Wijaya, S.E.",
    publisher: "Bisnis Edukasi",
    year: "2024",
    category: "Ekonomi",
    level: "SMK",
    format: "PDF",
    pages: 228,
    size: "10.8 MB",
    status: "Aktif",
    downloads: 163,
    description:
      "Materi dasar akuntansi untuk siswa SMK dengan contoh transaksi dan latihan.",
    color: "orange",
  },
  {
    id: 7,
    title: "English for Students",
    author: "Dewi Anggraini, M.Pd.",
    publisher: "Global Education",
    year: "2024",
    category: "Bahasa Inggris",
    level: "SMA",
    format: "PDF",
    pages: 194,
    size: "9.7 MB",
    status: "Aktif",
    downloads: 305,
    description:
      "Materi Bahasa Inggris untuk meningkatkan kemampuan reading, writing, listening, dan speaking.",
    color: "indigo",
  },
  {
    id: 8,
    title: "Modul Teknik Komputer dan Jaringan",
    author: "Yusuf Prasetyo, S.T.",
    publisher: "Teknologi Sekolah",
    year: "2023",
    category: "Teknologi",
    level: "SMK",
    format: "PDF",
    pages: 318,
    size: "21.4 MB",
    status: "Nonaktif",
    downloads: 126,
    description:
      "Modul pembelajaran jaringan komputer, perangkat jaringan, dan troubleshooting dasar.",
    color: "cyan",
  },
  {
    id: 9,
    title: "Pendidikan Jasmani dan Kesehatan",
    author: "Slamet Riyadi, S.Pd.",
    publisher: "Sehat Bersama",
    year: "2024",
    category: "PJOK",
    level: "SMA",
    format: "PDF",
    pages: 172,
    size: "7.9 MB",
    status: "Aktif",
    downloads: 148,
    description:
      "Panduan pembelajaran pendidikan jasmani, olahraga, dan kesehatan untuk siswa.",
    color: "lime",
  },
];

const emptyForm = {
  title: "",
  author: "",
  publisher: "",
  year: "",
  category: "Matematika",
  level: "SMA",
  format: "PDF",
  pages: "",
  size: "",
  status: "Aktif",
  description: "",
  color: "blue",
};

/* =========================================================
   COLOR CONFIG
========================================================= */

const coverStyles = {
  blue: {
    bg: "bg-blue-600",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  rose: {
    bg: "bg-rose-500",
    light: "bg-rose-50",
    text: "text-rose-600",
  },
  emerald: {
    bg: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
  violet: {
    bg: "bg-violet-600",
    light: "bg-violet-50",
    text: "text-violet-600",
  },
  amber: {
    bg: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-600",
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600",
  },
  indigo: {
    bg: "bg-indigo-600",
    light: "bg-indigo-50",
    text: "text-indigo-600",
  },
  cyan: {
    bg: "bg-cyan-500",
    light: "bg-cyan-50",
    text: "text-cyan-600",
  },
  lime: {
    bg: "bg-lime-500",
    light: "bg-lime-50",
    text: "text-lime-600",
  },
};

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
    purple: {
      box: "bg-indigo-50",
      icon: "text-indigo-600",
      value: "text-indigo-700",
    },
    orange: {
      box: "bg-orange-50",
      icon: "text-orange-600",
      value: "text-orange-700",
    },
  };

  const style = styles[type];

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:px-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
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
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const active = status === "Aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-500"
      }`}
    >
      {active ? (
        <CheckCircle2 size={13} />
      ) : (
        <Clock3 size={13} />
      )}

      {status}
    </span>
  );
}

/* =========================================================
   BOOK CARD
========================================================= */

function BookCard({ book, onDetail, onEdit, onDelete }) {
  const style = coverStyles[book.color] || coverStyles.blue;

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(15,23,42,0.08)]">
      {/* COVER */}
      <div className="relative p-4 pb-0">
        <div
          className={`relative flex h-[190px] items-center justify-center overflow-hidden rounded-lg ${style.bg}`}
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[20px] border-white/10" />
          <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full border-[25px] border-white/10" />

          <div className="relative flex h-24 w-20 flex-col items-center justify-center rounded-md bg-white/95 shadow-xl">
            <BookOpen
              size={28}
              className={style.text}
              strokeWidth={1.8}
            />

            <span className="mt-2 text-[8px] font-bold uppercase tracking-wider text-slate-500">
              Digital Book
            </span>
          </div>

          <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm">
            {book.format}
          </div>

          <div className="absolute bottom-3 right-3 rounded-md bg-black/20 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {book.year}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span
            className={`rounded-md ${style.light} px-2 py-1 text-[10px] font-semibold ${style.text}`}
          >
            {book.category}
          </span>

          <StatusBadge status={book.status} />
        </div>

        <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-slate-900">
          {book.title}
        </h3>

        <p className="mt-1 truncate text-xs text-slate-500">
          {book.author}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] text-slate-400">Halaman</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              {book.pages} halaman
            </p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400">Ukuran</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              {book.size}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Download size={13} />
            {book.downloads.toLocaleString("id-ID")} unduhan
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDetail(book)}
              title="Lihat detail"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <Eye size={16} />
            </button>

            <button
              type="button"
              onClick={() => onEdit(book)}
              title="Edit buku"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil size={16} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(book)}
              title="Hapus buku"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOOK FORM
========================================================= */

function BookForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);

  const update = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.author.trim()) {
      return;
    }

    onSave({
      ...form,
      pages: Number(form.pages) || 0,
      downloads: initial.downloads || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* JUDUL */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          Judul Buku
        </label>

        <input
          required
          value={form.title}
          onChange={update("title")}
          placeholder="Contoh: Matematika untuk SMA Kelas X"
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* AUTHOR + PUBLISHER */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Penulis
          </label>

          <input
            required
            value={form.author}
            onChange={update("author")}
            placeholder="Nama penulis"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Penerbit
          </label>

          <input
            value={form.publisher}
            onChange={update("publisher")}
            placeholder="Nama penerbit"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* CATEGORY + LEVEL */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Kategori
          </label>

          <div className="relative">
            <select
              value={form.category}
              onChange={update("category")}
              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>Matematika</option>
              <option>Bahasa Indonesia</option>
              <option>Bahasa Inggris</option>
              <option>IPA</option>
              <option>Informatika</option>
              <option>Sejarah</option>
              <option>Ekonomi</option>
              <option>Teknologi</option>
              <option>PJOK</option>
              <option>Lainnya</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Jenjang
          </label>

          <div className="relative">
            <select
              value={form.level}
              onChange={update("level")}
              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>SMA</option>
              <option>SMK</option>
              <option>SMP</option>
              <option>SD</option>
              <option>Umum</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* YEAR + PAGE + SIZE */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Tahun Terbit
          </label>

          <input
            type="number"
            value={form.year}
            onChange={update("year")}
            placeholder="2025"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Jumlah Halaman
          </label>

          <input
            type="number"
            min="0"
            value={form.pages}
            onChange={update("pages")}
            placeholder="200"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Ukuran File
          </label>

          <input
            value={form.size}
            onChange={update("size")}
            placeholder="10 MB"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* STATUS */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          Status
        </label>

        <div className="relative">
          <select
            value={form.status}
            onChange={update("status")}
            className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option>Aktif</option>
            <option>Nonaktif</option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          Deskripsi
        </label>

        <textarea
          rows={4}
          value={form.description}
          onChange={update("description")}
          placeholder="Deskripsi singkat mengenai buku..."
          className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* FILE */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          File Buku Digital
        </label>

        <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Upload size={18} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">
              Upload file buku
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Format PDF maksimal 50 MB
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Batal
        </button>

        <button
          type="submit"
          className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Simpan Buku
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function DetailModal({ book, onClose }) {
  if (!book) return null;

  const style = coverStyles[book.color] || coverStyles.blue;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Detail Buku Digital
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Informasi lengkap buku
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* COVER */}
            <div
              className={`flex h-52 w-full shrink-0 items-center justify-center rounded-xl ${style.bg} sm:w-40`}
            >
              <div className="flex h-28 w-24 flex-col items-center justify-center rounded-lg bg-white shadow-xl">
                <BookOpen size={32} className={style.text} />
                <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Digital
                </span>
              </div>
            </div>

            {/* INFO */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md ${style.light} px-2.5 py-1 text-xs font-semibold ${style.text}`}
                >
                  {book.category}
                </span>

                <StatusBadge status={book.status} />
              </div>

              <h3 className="mt-3 text-xl font-bold leading-7 text-slate-900">
                {book.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {book.author}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Penerbit</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {book.publisher || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Tahun Terbit</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {book.year || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Jenjang</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {book.level}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Format</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {book.format}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Halaman</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {book.pages} halaman
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Ukuran File</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {book.size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Deskripsi
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {book.description || "Tidak ada deskripsi."}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Download size={16} />
                <span className="text-xs">Total Unduhan</span>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {book.downloads.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={16} />
                <span className="text-xs">Akses Siswa</span>
              </div>

              <p className="mt-2 text-xl font-bold text-slate-900">
                Aktif
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function BukuDigitalPage() {
  const [data, setData] = useState(initialBooks);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [levelFilter, setLevelFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [modalMode, setModalMode] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const [detailBook, setDetailBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);

  /* =========================================================
     FILTER
  ========================================================= */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return data.filter((book) => {
      const matchSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        book.publisher.toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "Semua" ||
        book.category === categoryFilter;

      const matchLevel =
        levelFilter === "Semua" ||
        book.level === levelFilter;

      const matchStatus =
        statusFilter === "Semua" ||
        book.status === statusFilter;

      return (
        matchSearch &&
        matchCategory &&
        matchLevel &&
        matchStatus
      );
    });
  }, [
    data,
    search,
    categoryFilter,
    levelFilter,
    statusFilter,
  ]);

  /* =========================================================
     STATISTIC
  ========================================================= */

  const totalBooks = data.length;

  const totalActive = data.filter(
    (book) => book.status === "Aktif"
  ).length;

  const totalDownloads = data.reduce(
    (total, book) => total + book.downloads,
    0
  );

  const totalCategories = new Set(
    data.map((book) => book.category)
  ).size;

  /* =========================================================
     MODAL
  ========================================================= */

  const openAdd = () => {
    setActiveItem({
      ...emptyForm,
    });

    setModalMode("add");
  };

  const openEdit = (book) => {
    setActiveItem({
      ...book,
    });

    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveItem(null);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const saveBook = (form) => {
    if (modalMode === "add") {
      setData((current) => [
        {
          ...form,
          id: Date.now(),
        },
        ...current,
      ]);
    } else {
      setData((current) =>
        current.map((book) =>
          book.id === form.id
            ? {
                ...book,
                ...form,
              }
            : book
        )
      );
    }

    closeModal();
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const removeBook = () => {
    if (!deleteBook) return;

    setData((current) =>
      current.filter((book) => book.id !== deleteBook.id)
    );

    setDeleteBook(null);
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setCategoryFilter("Semua");
    setLevelFilter("Semua");
    setStatusFilter("Semua");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex min-h-screen bg-[#F5F8FC]">
      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <Header />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Library size={23} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-[24px] font-bold tracking-tight text-slate-900 sm:text-[27px]">
                    Buku Digital
                  </h1>

                  <p className="text-sm text-slate-500">
                    Kelola koleksi buku digital dan bahan bacaan siswa
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilter}
                  className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw size={16} />

                  <span className="hidden sm:inline">
                    Reset
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openAdd}
                  className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Tambah Buku
                </button>
              </div>
            </div>

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={BookOpen}
                label="Total Buku"
                value={totalBooks}
                type="blue"
              />

              <StatCard
                icon={CheckCircle2}
                label="Buku Aktif"
                value={totalActive}
                type="green"
              />

              <StatCard
                icon={Download}
                label="Total Unduhan"
                value={totalDownloads.toLocaleString("id-ID")}
                type="purple"
              />

              <StatCard
                icon={BookMarked}
                label="Kategori"
                value={totalCategories}
                type="orange"
              />
            </div>

            {/* =================================================
                FILTER CARD
            ================================================= */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:p-5">
              {/* SEARCH */}
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari judul buku, penulis, kategori, atau penerbit..."
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* FILTER */}
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center">
                {/* CATEGORY */}
                <div className="relative w-full lg:w-52">
                  <select
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(e.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Semua">
                      Semua Kategori
                    </option>

                    <option value="Matematika">
                      Matematika
                    </option>

                    <option value="Bahasa Indonesia">
                      Bahasa Indonesia
                    </option>

                    <option value="Bahasa Inggris">
                      Bahasa Inggris
                    </option>

                    <option value="IPA">IPA</option>

                    <option value="Informatika">
                      Informatika
                    </option>

                    <option value="Sejarah">
                      Sejarah
                    </option>

                    <option value="Ekonomi">
                      Ekonomi
                    </option>

                    <option value="Teknologi">
                      Teknologi
                    </option>

                    <option value="PJOK">PJOK</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* LEVEL */}
                <div className="relative w-full lg:w-44">
                  <select
                    value={levelFilter}
                    onChange={(e) =>
                      setLevelFilter(e.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Semua">
                      Semua Jenjang
                    </option>

                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                    <option value="Umum">Umum</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* STATUS */}
                <div className="relative w-full lg:w-44">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Semua">
                      Semua Status
                    </option>

                    <option value="Aktif">
                      Aktif
                    </option>

                    <option value="Nonaktif">
                      Nonaktif
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="h-10 rounded-lg px-3 text-left text-sm font-medium text-blue-600 transition hover:bg-blue-50 sm:col-span-2 lg:ml-1 lg:text-center"
                >
                  Reset Filter
                </button>

                <div className="lg:ml-auto">
                  <span className="text-sm font-medium text-slate-500">
                    {filtered.length} buku ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                BOOK GRID
            ================================================= */}

            <div className="mt-5">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onDetail={setDetailBook}
                      onEdit={openEdit}
                      onDelete={setDeleteBook}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Search size={21} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Buku tidak ditemukan
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Coba ubah kata kunci atau filter pencarian.
                  </p>
                </div>
              )}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="mt-4 pb-5">
              <p className="text-xs text-slate-400">
                Menampilkan{" "}
                <span className="font-medium text-slate-600">
                  {filtered.length}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-slate-600">
                  {data.length}
                </span>{" "}
                buku digital
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {modalMode && activeItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === "add"
                    ? "Tambah Buku Digital"
                    : "Edit Buku Digital"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Lengkapi informasi buku digital
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <BookForm
                initial={activeItem}
                onCancel={closeModal}
                onSave={saveBook}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      <DetailModal
        book={detailBook}
        onClose={() => setDetailBook(null)}
      />

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteBook && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Trash2 size={20} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">
                  Hapus buku digital?
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Buku{" "}
                  <span className="font-semibold text-slate-700">
                    "{deleteBook.title}"
                  </span>{" "}
                  akan dihapus dari daftar buku digital.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteBook(null)}
                className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={removeBook}
                className="h-10 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}