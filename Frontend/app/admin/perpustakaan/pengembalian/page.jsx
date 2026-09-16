"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  BookOpen,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  CalendarDays,
  UserRound,
  ChevronDown,
  Library,
  ReceiptText,
  CircleDollarSign,
} from "lucide-react";

/* =========================================================
   DATA DUMMY
========================================================= */

const initialReturns = [
  {
    id: 1,
    kode: "PG-0001",
    kodePinjam: "PJ-0004",
    siswa: "Dimas Pratama",
    nis: "20240004",
    kelas: "9B",
    buku: "Pemrograman Dasar",
    kodeBuku: "BK-0004",
    tanggalPinjam: "2026-08-20",
    jatuhTempo: "2026-08-27",
    tanggalKembali: "2026-08-26",
    kondisi: "Baik",
    keterlambatan: 0,
    denda: 0,
    status: "Selesai",
    petugas: "Admin Perpustakaan",
  },
  {
    id: 2,
    kode: "PG-0002",
    kodePinjam: "PJ-0006",
    siswa: "Fajar Ramadhan",
    nis: "20240006",
    kelas: "10A",
    buku: "Dasar-Dasar Akuntansi",
    kodeBuku: "BK-0006",
    tanggalPinjam: "2026-08-15",
    jatuhTempo: "2026-08-22",
    tanggalKembali: "2026-08-22",
    kondisi: "Baik",
    keterlambatan: 0,
    denda: 0,
    status: "Selesai",
    petugas: "Admin Perpustakaan",
  },
  {
    id: 3,
    kode: "PG-0003",
    kodePinjam: "PJ-0009",
    siswa: "Rizky Maulana",
    nis: "20240009",
    kelas: "11A",
    buku: "Kimia untuk SMA",
    kodeBuku: "BK-0009",
    tanggalPinjam: "2026-08-15",
    jatuhTempo: "2026-08-22",
    tanggalKembali: "2026-08-25",
    kondisi: "Baik",
    keterlambatan: 3,
    denda: 15000,
    status: "Terlambat",
    petugas: "Admin Perpustakaan",
  },
  {
    id: 4,
    kode: "PG-0004",
    kodePinjam: "PJ-0010",
    siswa: "Siti Aisyah",
    nis: "20240010",
    kelas: "11B",
    buku: "Biologi Dasar",
    kodeBuku: "BK-0010",
    tanggalPinjam: "2026-08-10",
    jatuhTempo: "2026-08-17",
    tanggalKembali: "2026-08-20",
    kondisi: "Rusak Ringan",
    keterlambatan: 3,
    denda: 25000,
    status: "Terlambat",
    petugas: "Admin Perpustakaan",
  },
  {
    id: 5,
    kode: "PG-0005",
    kodePinjam: "PJ-0011",
    siswa: "Nadia Putri",
    nis: "20240011",
    kelas: "12A",
    buku: "Bahasa Inggris Advanced",
    kodeBuku: "BK-0011",
    tanggalPinjam: "2026-08-28",
    jatuhTempo: "2026-09-04",
    tanggalKembali: "2026-09-03",
    kondisi: "Baik",
    keterlambatan: 0,
    denda: 0,
    status: "Selesai",
    petugas: "Admin Perpustakaan",
  },
  {
    id: 6,
    kode: "PG-0006",
    kodePinjam: "PJ-0012",
    siswa: "Rian Setiawan",
    nis: "20240012",
    kelas: "12A",
    buku: "Algoritma dan Pemrograman",
    kodeBuku: "BK-0012",
    tanggalPinjam: "2026-08-12",
    jatuhTempo: "2026-08-19",
    tanggalKembali: "2026-08-24",
    kondisi: "Baik",
    keterlambatan: 5,
    denda: 25000,
    status: "Terlambat",
    petugas: "Admin Perpustakaan",
  },
  {
    id: 7,
    kode: "PG-0007",
    kodePinjam: "PJ-0013",
    siswa: "Aldi Prakoso",
    nis: "20240013",
    kelas: "10B",
    buku: "Fisika Dasar",
    kodeBuku: "BK-0003",
    tanggalPinjam: "2026-09-01",
    jatuhTempo: "2026-09-08",
    tanggalKembali: "2026-09-07",
    kondisi: "Baik",
    keterlambatan: 0,
    denda: 0,
    status: "Selesai",
    petugas: "Admin Perpustakaan",
  },
];

/* =========================================================
   FORM
========================================================= */

const emptyForm = {
  siswa: "",
  nis: "",
  kelas: "9A",
  buku: "",
  kodeBuku: "",
  kodePinjam: "",
  tanggalPinjam: "",
  jatuhTempo: "",
  tanggalKembali: "2026-09-07",
  kondisi: "Baik",
  keterlambatan: "0",
  denda: "0",
  status: "Selesai",
  petugas: "Admin Perpustakaan",
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon: Icon, label, value, type }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles[type]}`}
        >
          <Icon size={19} />
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
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
  if (status === "Terlambat") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
        <AlertTriangle size={13} />
        Terlambat
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 size={13} />
      Selesai
    </span>
  );
}

/* =========================================================
   CONDITION BADGE
========================================================= */

function ConditionBadge({ kondisi }) {
  if (kondisi === "Rusak Berat") {
    return (
      <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
        Rusak Berat
      </span>
    );
  }

  if (kondisi === "Rusak Ringan") {
    return (
      <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
        Rusak Ringan
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      Baik
    </span>
  );
}

/* =========================================================
   FORM MODAL
========================================================= */

function ReturnForm({
  initial,
  editMode,
  onCancel,
  onSave,
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

    if (!form.siswa.trim()) return;
    if (!form.buku.trim()) return;

    onSave({
      ...form,
      keterlambatan: Number(form.keterlambatan) || 0,
      denda: Number(form.denda) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* PEMINJAM */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Nama Siswa
          </label>

          <input
            required
            value={form.siswa}
            onChange={update("siswa")}
            placeholder="Nama siswa"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            NIS
          </label>

          <input
            value={form.nis}
            onChange={update("nis")}
            placeholder="Nomor induk siswa"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* KELAS */}

      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          Kelas
        </label>

        <div className="relative">
          <select
            value={form.kelas}
            onChange={update("kelas")}
            className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option>9A</option>
            <option>9B</option>
            <option>9C</option>
            <option>10A</option>
            <option>10B</option>
            <option>10C</option>
            <option>11A</option>
            <option>11B</option>
            <option>12A</option>
            <option>12B</option>
          </select>

          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* BUKU */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Judul Buku
          </label>

          <input
            required
            value={form.buku}
            onChange={update("buku")}
            placeholder="Judul buku"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Kode Buku
          </label>

          <input
            value={form.kodeBuku}
            onChange={update("kodeBuku")}
            placeholder="BK-0001"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* KODE TRANSAKSI */}

      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          Kode Peminjaman
        </label>

        <input
          value={form.kodePinjam}
          onChange={update("kodePinjam")}
          placeholder="PJ-0001"
          className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* TANGGAL */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Tanggal Pinjam
          </label>

          <input
            type="date"
            value={form.tanggalPinjam}
            onChange={update("tanggalPinjam")}
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Jatuh Tempo
          </label>

          <input
            type="date"
            value={form.jatuhTempo}
            onChange={update("jatuhTempo")}
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Tanggal Pengembalian
          </label>

          <input
            type="date"
            value={form.tanggalKembali}
            onChange={update("tanggalKembali")}
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* CONDITION */}

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
            <option>Rusak Berat</option>
            <option>Hilang</option>
          </select>

          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* LATE + FINE */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Keterlambatan
          </label>

          <div className="relative">
            <input
              type="number"
              min="0"
              value={form.keterlambatan}
              onChange={update("keterlambatan")}
              className="h-11 w-full rounded-lg border border-slate-300 px-3.5 pr-14 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              hari
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Denda
          </label>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              Rp
            </span>

            <input
              type="number"
              min="0"
              value={form.denda}
              onChange={update("denda")}
              className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* PETUGAS */}

      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-600">
          Petugas
        </label>

        <input
          value={form.petugas}
          onChange={update("petugas")}
          className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
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
          {editMode
            ? "Simpan Perubahan"
            : "Simpan Pengembalian"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function DetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Detail Pengembalian
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Informasi lengkap transaksi pengembalian
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
          {/* BOOK */}

          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BookOpen size={27} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {item.kode}
                </span>

                <StatusBadge status={item.status} />
              </div>

              <h3 className="mt-2 text-lg font-bold text-slate-900">
                {item.buku}
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                {item.kodeBuku}
              </p>
            </div>
          </div>

          {/* USER */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                <UserRound size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {item.siswa}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  NIS {item.nis} • Kelas {item.kelas}
                </p>
              </div>
            </div>
          </div>

          {/* DATE */}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarDays size={15} />

                <span className="text-xs">
                  Tanggal Pinjam
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                {item.tanggalPinjam}
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
              <div className="flex items-center gap-2 text-orange-500">
                <Clock3 size={15} />

                <span className="text-xs">
                  Jatuh Tempo
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-orange-700">
                {item.jatuhTempo}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-500">
                <RotateCcw size={15} />

                <span className="text-xs">
                  Dikembalikan
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-emerald-700">
                {item.tanggalKembali}
              </p>
            </div>
          </div>

          {/* CONDITION */}

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-500">
              Kondisi Buku
            </span>

            <ConditionBadge kondisi={item.kondisi} />
          </div>

          {/* LATE */}

          <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-500">
              Keterlambatan
            </span>

            <span className="text-sm font-semibold text-slate-700">
              {item.keterlambatan} hari
            </span>
          </div>

          {/* FINE */}

          <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-500">
              Total Denda
            </span>

            <span
              className={`text-sm font-bold ${
                item.denda > 0
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              Rp {item.denda.toLocaleString("id-ID")}
            </span>
          </div>

          {/* PETUGAS */}

          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-xs text-slate-400">
              Petugas
            </span>

            <span className="text-xs font-medium text-slate-600">
              {item.petugas}
            </span>
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
   MAIN
========================================================= */

export default function PengembalianPage() {
  const [returns, setReturns] = useState(initialReturns);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [conditionFilter, setConditionFilter] =
    useState("Semua");

  const [modal, setModal] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredReturns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return returns.filter((item) => {
      const matchSearch =
        !query ||
        item.kode.toLowerCase().includes(query) ||
        item.kodePinjam.toLowerCase().includes(query) ||
        item.siswa.toLowerCase().includes(query) ||
        item.nis.toLowerCase().includes(query) ||
        item.buku.toLowerCase().includes(query) ||
        item.kodeBuku.toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "Semua" ||
        item.status === statusFilter;

      const matchCondition =
        conditionFilter === "Semua" ||
        item.kondisi === conditionFilter;

      return (
        matchSearch &&
        matchStatus &&
        matchCondition
      );
    });
  }, [
    returns,
    search,
    statusFilter,
    conditionFilter,
  ]);

  /* =========================================================
     STAT
  ========================================================= */

  const totalPengembalian = returns.length;

  const selesai = returns.filter(
    (item) => item.status === "Selesai"
  ).length;

  const terlambat = returns.filter(
    (item) => item.status === "Terlambat"
  ).length;

  const totalDenda = returns.reduce(
    (total, item) => total + item.denda,
    0
  );

  /* =========================================================
     ADD
  ========================================================= */

  const openAdd = () => {
    const nextNumber = returns.length + 1;

    setActiveItem({
      ...emptyForm,
      kode: `PG-${String(nextNumber).padStart(4, "0")}`,
    });

    setModal("add");
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const openEdit = (item) => {
    setActiveItem({
      ...item,
    });

    setModal("edit");
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const saveReturn = (form) => {
    if (modal === "add") {
      setReturns((current) => [
        {
          ...form,
          id: Date.now(),
        },
        ...current,
      ]);
    } else {
      setReturns((current) =>
        current.map((item) =>
          item.id === form.id
            ? {
                ...item,
                ...form,
              }
            : item
        )
      );
    }

    closeModal();
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const closeModal = () => {
    setModal(null);
    setActiveItem(null);
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const confirmDelete = () => {
    if (!deleteItem) return;

    setReturns((current) =>
      current.filter(
        (item) => item.id !== deleteItem.id
      )
    );

    setDeleteItem(null);
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("Semua");
    setConditionFilter("Semua");
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

            {/* HEADER */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <RotateCcw size={23} />
                </div>

                <div>
                  <h1 className="text-[25px] font-bold tracking-tight text-slate-900">
                    Pengembalian Buku
                  </h1>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Kelola pengembalian buku dan denda perpustakaan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openAdd}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <RotateCcw size={17} />
                Catat Pengembalian
              </button>
            </div>

            {/* STAT */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={ReceiptText}
                label="Total Pengembalian"
                value={totalPengembalian}
                type="blue"
              />

              <StatCard
                icon={CheckCircle2}
                label="Selesai"
                value={selesai}
                type="green"
              />

              <StatCard
                icon={AlertTriangle}
                label="Terlambat"
                value={terlambat}
                type="orange"
              />

              <StatCard
                icon={CircleDollarSign}
                label="Total Denda"
                value={`Rp ${totalDenda.toLocaleString(
                  "id-ID"
                )}`}
                type="red"
              />
            </div>

            {/* FILTER */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
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
                  placeholder="Cari transaksi, siswa, NIS, atau judul buku..."
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:flex">
                {/* STATUS */}

                <div className="relative xl:w-48">
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

                    <option>Selesai</option>
                    <option>Terlambat</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* CONDITION */}

                <div className="relative xl:w-48">
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
                    <option>Rusak Berat</option>
                    <option>Hilang</option>
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

                <div className="flex items-center xl:ml-auto">
                  <span className="text-sm text-slate-500">
                    {filteredReturns.length} data ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* TABLE */}

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Riwayat Pengembalian
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Daftar buku yang telah dikembalikan
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Library size={14} />
                  {filteredReturns.length} transaksi
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Peminjam
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Buku
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Jatuh Tempo
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Tgl Kembali
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Kondisi
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Keterlambatan
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Denda
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
                    {filteredReturns.length > 0 ? (
                      filteredReturns.map((item) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          {/* PEMINJAM */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <UserRound size={18} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {item.siswa}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {item.nis} • Kelas {item.kelas}
                                </p>

                                <p className="mt-0.5 text-[11px] font-medium text-blue-600">
                                  {item.kode}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* BUKU */}

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <BookOpen size={16} />
                              </div>

                              <div>
                                <p className="max-w-[240px] truncate text-sm font-medium text-slate-700">
                                  {item.buku}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  {item.kodeBuku}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* JATUH TEMPO */}

                          <td className="px-4 py-4">
                            <span className="text-xs text-slate-600">
                              {item.jatuhTempo}
                            </span>
                          </td>

                          {/* KEMBALI */}

                          <td className="px-4 py-4">
                            <span className="text-xs font-medium text-emerald-600">
                              {item.tanggalKembali}
                            </span>
                          </td>

                          {/* CONDITION */}

                          <td className="px-4 py-4">
                            <ConditionBadge
                              kondisi={item.kondisi}
                            />
                          </td>

                          {/* LATE */}

                          <td className="px-4 py-4">
                            <span
                              className={`text-xs font-semibold ${
                                item.keterlambatan > 0
                                  ? "text-orange-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {item.keterlambatan} hari
                            </span>
                          </td>

                          {/* DENDA */}

                          <td className="px-4 py-4">
                            <span
                              className={`text-xs font-semibold ${
                                item.denda > 0
                                  ? "text-rose-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              Rp{" "}
                              {item.denda.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-4">
                            <StatusBadge
                              status={item.status}
                            />
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Detail"
                                onClick={() =>
                                  setDetailItem(item)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  openEdit(item)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                title="Hapus"
                                onClick={() =>
                                  setDeleteItem(item)
                                }
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
                            Data pengembalian tidak ditemukan
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

              <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Menampilkan{" "}
                  <span className="font-medium text-slate-600">
                    {filteredReturns.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-slate-600">
                    {returns.length}
                  </span>{" "}
                  transaksi
                </p>

                <p className="text-xs text-slate-400">
                  Total denda:{" "}
                  <span className="font-semibold text-rose-600">
                    Rp{" "}
                    {totalDenda.toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {modal && activeItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modal === "add"
                    ? "Catat Pengembalian"
                    : "Edit Pengembalian"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {modal === "add"
                    ? "Catat transaksi pengembalian buku"
                    : "Perbarui data pengembalian buku"}
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
              <ReturnForm
                initial={activeItem}
                editMode={modal === "edit"}
                onCancel={closeModal}
                onSave={saveReturn}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL
      ===================================================== */}

      <DetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
      />

      {/* =====================================================
          DELETE
      ===================================================== */}

      {deleteItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Trash2 size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Hapus data pengembalian?
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Data pengembalian{" "}
                  <span className="font-semibold text-slate-700">
                    {deleteItem.kode}
                  </span>{" "}
                  milik{" "}
                  <span className="font-semibold text-slate-700">
                    {deleteItem.siswa}
                  </span>{" "}
                  akan dihapus.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
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