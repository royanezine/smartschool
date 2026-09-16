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
  Library,
  CheckCircle2,
  AlertTriangle,
  Archive,
  MapPin,
} from "lucide-react";

/* =========================================================
   DATA DUMMY
========================================================= */

const initialBooks = [
  {
    id: 1,
    kode: "BK-0001",
    isbn: "978-602-1234-01-1",
    judul: "Matematika untuk SMA Kelas X",
    penulis: "Budi Santoso",
    penerbit: "Edukasi Nasional",
    tahun: "2025",
    kategori: "Matematika",
    jenjang: "SMA",
    lokasi: "Rak A-01",
    stok: 8,
    tersedia: 6,
    dipinjam: 2,
    kondisi: "Baik",
    status: "Aktif",
  },
  {
    id: 2,
    kode: "BK-0002",
    isbn: "978-602-1234-02-8",
    judul: "Bahasa Indonesia untuk Pelajar",
    penulis: "Siti Rahmawati",
    penerbit: "Media Pendidikan",
    tahun: "2024",
    kategori: "Bahasa Indonesia",
    jenjang: "SMA",
    lokasi: "Rak A-02",
    stok: 10,
    tersedia: 8,
    dipinjam: 2,
    kondisi: "Baik",
    status: "Aktif",
  },
  {
    id: 3,
    kode: "BK-0003",
    isbn: "978-602-1234-03-5",
    judul: "Fisika Dasar",
    penulis: "Andi Pratama",
    penerbit: "Sains Indonesia",
    tahun: "2025",
    kategori: "IPA",
    jenjang: "SMA",
    lokasi: "Rak B-01",
    stok: 7,
    tersedia: 5,
    dipinjam: 2,
    kondisi: "Baik",
    status: "Aktif",
  },
  {
    id: 4,
    kode: "BK-0004",
    isbn: "978-602-1234-04-2",
    judul: "Pemrograman Dasar",
    penulis: "Ahmad Fauzi",
    penerbit: "Tekno Edu",
    tahun: "2025",
    kategori: "Informatika",
    jenjang: "SMK",
    lokasi: "Rak C-01",
    stok: 12,
    tersedia: 9,
    dipinjam: 3,
    kondisi: "Baik",
    status: "Aktif",
  },
  {
    id: 5,
    kode: "BK-0005",
    isbn: "978-602-1234-05-9",
    judul: "Sejarah Indonesia",
    penulis: "Rina Kusuma",
    penerbit: "Nusantara Press",
    tahun: "2023",
    kategori: "Sejarah",
    jenjang: "SMA",
    lokasi: "Rak B-03",
    stok: 6,
    tersedia: 4,
    dipinjam: 2,
    kondisi: "Rusak Ringan",
    status: "Aktif",
  },
  {
    id: 6,
    kode: "BK-0006",
    isbn: "978-602-1234-06-6",
    judul: "Dasar-Dasar Akuntansi",
    penulis: "Hendra Wijaya",
    penerbit: "Bisnis Edukasi",
    tahun: "2024",
    kategori: "Ekonomi",
    jenjang: "SMK",
    lokasi: "Rak C-03",
    stok: 9,
    tersedia: 9,
    dipinjam: 0,
    kondisi: "Baik",
    status: "Aktif",
  },
  {
    id: 7,
    kode: "BK-0007",
    isbn: "978-602-1234-07-3",
    judul: "English for Students",
    penulis: "Dewi Anggraini",
    penerbit: "Global Education",
    tahun: "2024",
    kategori: "Bahasa Inggris",
    jenjang: "SMA",
    lokasi: "Rak A-04",
    stok: 8,
    tersedia: 5,
    dipinjam: 3,
    kondisi: "Baik",
    status: "Aktif",
  },
  {
    id: 8,
    kode: "BK-0008",
    isbn: "978-602-1234-08-0",
    judul: "Teknik Komputer dan Jaringan",
    penulis: "Yusuf Prasetyo",
    penerbit: "Teknologi Sekolah",
    tahun: "2023",
    kategori: "Teknologi",
    jenjang: "SMK",
    lokasi: "Rak C-04",
    stok: 5,
    tersedia: 2,
    dipinjam: 3,
    kondisi: "Rusak Ringan",
    status: "Aktif",
  },
  {
    id: 9,
    kode: "BK-0009",
    isbn: "978-602-1234-09-7",
    judul: "Pendidikan Jasmani dan Kesehatan",
    penulis: "Slamet Riyadi",
    penerbit: "Sehat Bersama",
    tahun: "2024",
    kategori: "PJOK",
    jenjang: "SMA",
    lokasi: "Rak D-01",
    stok: 6,
    tersedia: 6,
    dipinjam: 0,
    kondisi: "Baik",
    status: "Aktif",
  },
  {
    id: 10,
    kode: "BK-0010",
    isbn: "978-602-1234-10-3",
    judul: "Modul Biologi Kelas XI",
    penulis: "Dewi Lestari",
    penerbit: "Sains Edu",
    tahun: "2022",
    kategori: "Biologi",
    jenjang: "SMA",
    lokasi: "Rak B-05",
    stok: 4,
    tersedia: 0,
    dipinjam: 4,
    kondisi: "Baik",
    status: "Aktif",
  },
];

/* =========================================================
   FORM DEFAULT
========================================================= */

const emptyForm = {
  kode: "",
  isbn: "",
  judul: "",
  penulis: "",
  penerbit: "",
  tahun: "",
  kategori: "Matematika",
  jenjang: "SMA",
  lokasi: "",
  stok: "",
  tersedia: "",
  dipinjam: "0",
  kondisi: "Baik",
  status: "Aktif",
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  type = "blue",
}) {
  const styles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-slate-900",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      value: "text-emerald-700",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-orange-700",
    },
    purple: {
      bg: "bg-violet-50",
      text: "text-violet-600",
      value: "text-violet-700",
    },
  };

  const style = styles[type];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}
        >
          <Icon size={19} />
        </div>

        <div>
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
   STATUS
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
        <Archive size={13} />
      )}

      {status}
    </span>
  );
}

/* =========================================================
   CONDITION
========================================================= */

function ConditionBadge({ condition }) {
  if (condition === "Baik") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        Baik
      </span>
    );
  }

  if (condition === "Rusak Ringan") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <AlertTriangle size={12} />
        Rusak Ringan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
      <AlertTriangle size={12} />
      Rusak
    </span>
  );
}

/* =========================================================
   FORM MODAL
========================================================= */

function BookForm({
  initial,
  onCancel,
  onSave,
  editMode,
}) {
  const [form, setForm] = useState(initial);

  const update = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.judul.trim()) return;
    if (!form.penulis.trim()) return;

    onSave({
      ...form,
      stok: Number(form.stok) || 0,
      tersedia: Number(form.tersedia) || 0,
      dipinjam: Number(form.dipinjam) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* KODE + ISBN */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Kode Buku
          </label>

          <input
            value={form.kode}
            onChange={update("kode")}
            placeholder="Contoh: BK-0011"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            ISBN
          </label>

          <input
            value={form.isbn}
            onChange={update("isbn")}
            placeholder="978-602-xxxx-xx-x"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* JUDUL */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          Judul Buku
        </label>

        <input
          required
          value={form.judul}
          onChange={update("judul")}
          placeholder="Masukkan judul buku"
          className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* PENULIS + PENERBIT */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Penulis
          </label>

          <input
            required
            value={form.penulis}
            onChange={update("penulis")}
            placeholder="Nama penulis"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Penerbit
          </label>

          <input
            value={form.penerbit}
            onChange={update("penerbit")}
            placeholder="Nama penerbit"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* TAHUN + KATEGORI + JENJANG */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Tahun Terbit
          </label>

          <input
            type="number"
            value={form.tahun}
            onChange={update("tahun")}
            placeholder="2025"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Kategori
          </label>

          <div className="relative">
            <select
              value={form.kategori}
              onChange={update("kategori")}
              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>Matematika</option>
              <option>Bahasa Indonesia</option>
              <option>Bahasa Inggris</option>
              <option>IPA</option>
              <option>Biologi</option>
              <option>Sejarah</option>
              <option>Ekonomi</option>
              <option>Informatika</option>
              <option>Teknologi</option>
              <option>PJOK</option>
              <option>Lainnya</option>
            </select>

            <ChevronDown
              size={15}
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
              value={form.jenjang}
              onChange={update("jenjang")}
              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>SD</option>
              <option>SMP</option>
              <option>SMA</option>
              <option>SMK</option>
              <option>Umum</option>
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* LOKASI */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          Lokasi Rak
        </label>

        <input
          value={form.lokasi}
          onChange={update("lokasi")}
          placeholder="Contoh: Rak A-01"
          className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* STOK */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Total Stok
          </label>

          <input
            type="number"
            min="0"
            value={form.stok}
            onChange={update("stok")}
            placeholder="10"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Tersedia
          </label>

          <input
            type="number"
            min="0"
            value={form.tersedia}
            onChange={update("tersedia")}
            placeholder="8"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Dipinjam
          </label>

          <input
            type="number"
            min="0"
            value={form.dipinjam}
            onChange={update("dipinjam")}
            placeholder="2"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* KONDISI + STATUS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Kondisi Buku
          </label>

          <div className="relative">
            <select
              value={form.kondisi}
              onChange={update("kondisi")}
              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>Baik</option>
              <option>Rusak Ringan</option>
              <option>Rusak</option>
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Status
          </label>

          <div className="relative">
            <select
              value={form.status}
              onChange={update("status")}
              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>Aktif</option>
              <option>Nonaktif</option>
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
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
          className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {editMode ? "Simpan Perubahan" : "Simpan Buku"}
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Detail Data Buku
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Informasi lengkap koleksi perpustakaan
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
          {/* HEADER BOOK */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex h-36 w-full shrink-0 items-center justify-center rounded-xl bg-blue-600 sm:w-28">
              <BookOpen
                size={45}
                strokeWidth={1.5}
                className="text-white"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                  {book.kode}
                </span>

                <StatusBadge status={book.status} />
              </div>

              <h3 className="mt-3 text-xl font-bold leading-7 text-slate-900">
                {book.judul}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {book.penulis}
              </p>
            </div>
          </div>

          {/* INFORMATION */}
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">
                ISBN
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {book.isbn || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Penerbit
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {book.penerbit || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Tahun Terbit
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {book.tahun || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Kategori
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {book.kategori}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Jenjang
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {book.jenjang}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Lokasi Rak
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <MapPin size={14} className="text-blue-500" />
                {book.lokasi || "-"}
              </p>
            </div>
          </div>

          {/* STOCK */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Informasi Stok
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-400">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {book.stok}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                <p className="text-xs text-emerald-600">
                  Tersedia
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-700">
                  {book.tersedia}
                </p>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-center">
                <p className="text-xs text-orange-600">
                  Dipinjam
                </p>

                <p className="mt-1 text-xl font-bold text-orange-700">
                  {book.dipinjam}
                </p>
              </div>
            </div>
          </div>

          {/* CONDITION */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div>
              <p className="text-xs text-slate-400">
                Kondisi Buku
              </p>

              <div className="mt-1.5">
                <ConditionBadge condition={book.kondisi} />
              </div>
            </div>

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

export default function DataBukuPage() {
  const [books, setBooks] = useState(initialBooks);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [jenjangFilter, setJenjangFilter] = useState("Semua");
  const [conditionFilter, setConditionFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [modal, setModal] = useState(null);
  const [activeBook, setActiveBook] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchSearch =
        !query ||
        book.judul.toLowerCase().includes(query) ||
        book.penulis.toLowerCase().includes(query) ||
        book.kode.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        book.penerbit.toLowerCase().includes(query);

      const matchCategory =
        categoryFilter === "Semua" ||
        book.kategori === categoryFilter;

      const matchJenjang =
        jenjangFilter === "Semua" ||
        book.jenjang === jenjangFilter;

      const matchCondition =
        conditionFilter === "Semua" ||
        book.kondisi === conditionFilter;

      const matchStatus =
        statusFilter === "Semua" ||
        book.status === statusFilter;

      return (
        matchSearch &&
        matchCategory &&
        matchJenjang &&
        matchCondition &&
        matchStatus
      );
    });
  }, [
    books,
    search,
    categoryFilter,
    jenjangFilter,
    conditionFilter,
    statusFilter,
  ]);

  /* =========================================================
     STATISTIC
  ========================================================= */

  const totalJudul = books.length;

  const totalStok = books.reduce(
    (sum, book) => sum + book.stok,
    0
  );

  const totalTersedia = books.reduce(
    (sum, book) => sum + book.tersedia,
    0
  );

  const totalDipinjam = books.reduce(
    (sum, book) => sum + book.dipinjam,
    0
  );

  /* =========================================================
     ADD
  ========================================================= */

  const openAdd = () => {
    const nextNumber = books.length + 1;

    setActiveBook({
      ...emptyForm,
      kode: `BK-${String(nextNumber).padStart(4, "0")}`,
    });

    setModal("add");
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const openEdit = (book) => {
    setActiveBook({
      ...book,
    });

    setModal("edit");
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const closeModal = () => {
    setModal(null);
    setActiveBook(null);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const saveBook = (form) => {
    if (modal === "add") {
      setBooks((current) => [
        {
          ...form,
          id: Date.now(),
        },
        ...current,
      ]);
    } else {
      setBooks((current) =>
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

  const confirmDelete = () => {
    if (!deleteBook) return;

    setBooks((current) =>
      current.filter(
        (book) => book.id !== deleteBook.id
      )
    );

    setDeleteBook(null);
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setCategoryFilter("Semua");
    setJenjangFilter("Semua");
    setConditionFilter("Semua");
    setStatusFilter("Semua");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex min-h-screen bg-[#F5F8FC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Library size={23} />
                </div>

                <div>
                  <h1 className="text-[25px] font-bold tracking-tight text-slate-900">
                    Data Buku Perpustakaan
                  </h1>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Kelola koleksi dan ketersediaan buku perpustakaan sekolah
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                STATISTIC
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={BookOpen}
                label="Judul Buku"
                value={totalJudul}
                type="blue"
              />

              <StatCard
                icon={Library}
                label="Total Eksemplar"
                value={totalStok}
                type="purple"
              />

              <StatCard
                icon={CheckCircle2}
                label="Buku Tersedia"
                value={totalTersedia}
                type="green"
              />

              <StatCard
                icon={Archive}
                label="Sedang Dipinjam"
                value={totalDipinjam}
                type="orange"
              />
            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Cari kode, judul buku, penulis, ISBN, atau penerbit..."
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* FILTER ROW */}

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:flex xl:items-center">
                {/* CATEGORY */}

                <div className="relative xl:w-48">
                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Semua">
                      Semua Kategori
                    </option>
                    <option>Matematika</option>
                    <option>Bahasa Indonesia</option>
                    <option>Bahasa Inggris</option>
                    <option>IPA</option>
                    <option>Biologi</option>
                    <option>Sejarah</option>
                    <option>Ekonomi</option>
                    <option>Informatika</option>
                    <option>Teknologi</option>
                    <option>PJOK</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* JENJANG */}

                <div className="relative xl:w-40">
                  <select
                    value={jenjangFilter}
                    onChange={(event) =>
                      setJenjangFilter(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Semua">
                      Semua Jenjang
                    </option>
                    <option>SD</option>
                    <option>SMP</option>
                    <option>SMA</option>
                    <option>SMK</option>
                    <option>Umum</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* CONDITION */}

                <div className="relative xl:w-44">
                  <select
                    value={conditionFilter}
                    onChange={(event) =>
                      setConditionFilter(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Semua">
                      Semua Kondisi
                    </option>
                    <option>Baik</option>
                    <option>Rusak Ringan</option>
                    <option>Rusak</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* STATUS */}

                <div className="relative xl:w-40">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Semua">
                      Semua Status
                    </option>
                    <option>Aktif</option>
                    <option>Nonaktif</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="h-10 px-3 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 xl:text-center"
                >
                  Reset Filter
                </button>

                <div className="xl:ml-auto">
                  <span className="text-sm text-slate-500">
                    {filteredBooks.length} data ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
              {/* TABLE HEADER */}

              <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Koleksi Buku
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Daftar seluruh buku fisik perpustakaan
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <BookOpen size={14} />
                  {filteredBooks.length} buku
                </div>
              </div>

              {/* RESPONSIVE TABLE */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Buku
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        ISBN
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Kategori
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Jenjang
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Lokasi
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Stok
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Kondisi
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <tr
                          key={book.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          {/* BOOK */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <BookOpen size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[270px] truncate text-sm font-semibold text-slate-800">
                                  {book.judul}
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-[11px] font-medium text-blue-600">
                                    {book.kode}
                                  </span>

                                  <span className="text-[11px] text-slate-400">
                                    •
                                  </span>

                                  <span className="text-[11px] text-slate-400">
                                    {book.tahun}
                                  </span>
                                </div>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {book.penulis}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ISBN */}

                          <td className="px-4 py-4">
                            <span className="text-xs text-slate-600">
                              {book.isbn || "-"}
                            </span>
                          </td>

                          {/* CATEGORY */}

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {book.kategori}
                            </span>
                          </td>

                          {/* JENJANG */}

                          <td className="px-4 py-4">
                            <span className="text-xs font-medium text-slate-600">
                              {book.jenjang}
                            </span>
                          </td>

                          {/* LOCATION */}

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <MapPin
                                size={14}
                                className="text-slate-400"
                              />

                              {book.lokasi || "-"}
                            </div>
                          </td>

                          {/* STOCK */}

                          <td className="px-4 py-4">
                            <div className="min-w-[105px]">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-700">
                                  {book.tersedia}
                                </span>

                                <span className="text-slate-400">
                                  / {book.stok}
                                </span>
                              </div>

                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{
                                    width:
                                      book.stok > 0
                                        ? `${Math.min(
                                            100,
                                            (book.tersedia /
                                              book.stok) *
                                              100
                                          )}%`
                                        : "0%",
                                  }}
                                />
                              </div>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {book.dipinjam} dipinjam
                              </p>
                            </div>
                          </td>

                          {/* CONDITION */}

                          <td className="px-4 py-4">
                            <ConditionBadge
                              condition={book.kondisi}
                            />
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-4">
                            <StatusBadge
                              status={book.status}
                            />
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setDetailBook(book)
                                }
                                title="Detail"
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(book)
                                }
                                title="Edit"
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteBook(book)
                                }
                                title="Hapus"
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-16 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Search size={20} />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Data buku tidak ditemukan
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Coba ubah kata kunci atau filter.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}

              <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Menampilkan{" "}
                  <span className="font-medium text-slate-600">
                    {filteredBooks.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-slate-600">
                    {books.length}
                  </span>{" "}
                  buku
                </p>

                <p className="text-xs text-slate-400">
                  Total{" "}
                  <span className="font-medium text-slate-600">
                    {totalStok}
                  </span>{" "}
                  eksemplar
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {modal && activeBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modal === "add"
                    ? "Tambah Data Buku"
                    : "Edit Data Buku"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {modal === "add"
                    ? "Tambahkan koleksi buku baru"
                    : "Perbarui informasi buku"}
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
                initial={activeBook}
                editMode={modal === "edit"}
                onCancel={closeModal}
                onSave={saveBook}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL
      ===================================================== */}

      <DetailModal
        book={detailBook}
        onClose={() => setDetailBook(null)}
      />

      {/* =====================================================
          DELETE
      ===================================================== */}

      {deleteBook && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Trash2 size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Hapus data buku?
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Data buku{" "}
                  <span className="font-semibold text-slate-700">
                    "{deleteBook.judul}"
                  </span>{" "}
                  akan dihapus dari daftar perpustakaan.
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
                onClick={confirmDelete}
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