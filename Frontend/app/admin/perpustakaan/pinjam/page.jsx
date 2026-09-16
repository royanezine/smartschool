"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  BookOpen,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  ChevronDown,
  Library,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserRound,
  CalendarDays,
} from "lucide-react";

/* =========================================================
   DATA DUMMY
========================================================= */

const initialLoans = [
  {
    id: 1,
    kode: "PJ-0001",
    siswa: "Andi Saputra",
    nis: "20240001",
    kelas: "9A",
    buku: "Matematika untuk SMA Kelas X",
    kodeBuku: "BK-0001",
    tanggalPinjam: "2026-09-01",
    jatuhTempo: "2026-09-08",
    tanggalKembali: "",
    status: "Dipinjam",
    denda: 0,
    petugas: "Admin Perpustakaan",
  },
  {
    id: 2,
    kode: "PJ-0002",
    siswa: "Budi Santoso",
    nis: "20240002",
    kelas: "9A",
    buku: "Fisika Dasar",
    kodeBuku: "BK-0003",
    tanggalPinjam: "2026-09-02",
    jatuhTempo: "2026-09-09",
    tanggalKembali: "",
    status: "Dipinjam",
    denda: 0,
    petugas: "Admin Perpustakaan",
  },
  {
    id: 3,
    kode: "PJ-0003",
    siswa: "Citra Lestari",
    nis: "20240003",
    kelas: "9B",
    buku: "Bahasa Indonesia untuk Pelajar",
    kodeBuku: "BK-0002",
    tanggalPinjam: "2026-08-25",
    jatuhTempo: "2026-09-01",
    tanggalKembali: "",
    status: "Terlambat",
    denda: 15000,
    petugas: "Admin Perpustakaan",
  },
  {
    id: 4,
    kode: "PJ-0004",
    siswa: "Dimas Pratama",
    nis: "20240004",
    kelas: "9B",
    buku: "Pemrograman Dasar",
    kodeBuku: "BK-0004",
    tanggalPinjam: "2026-08-20",
    jatuhTempo: "2026-08-27",
    tanggalKembali: "2026-08-26",
    status: "Dikembalikan",
    denda: 0,
    petugas: "Admin Perpustakaan",
  },
  {
    id: 5,
    kode: "PJ-0005",
    siswa: "Eka Wulandari",
    nis: "20240005",
    kelas: "10A",
    buku: "Sejarah Indonesia",
    kodeBuku: "BK-0005",
    tanggalPinjam: "2026-08-29",
    jatuhTempo: "2026-09-05",
    tanggalKembali: "",
    status: "Dipinjam",
    denda: 0,
    petugas: "Admin Perpustakaan",
  },
  {
    id: 6,
    kode: "PJ-0006",
    siswa: "Fajar Ramadhan",
    nis: "20240006",
    kelas: "10A",
    buku: "Dasar-Dasar Akuntansi",
    kodeBuku: "BK-0006",
    tanggalPinjam: "2026-08-15",
    jatuhTempo: "2026-08-22",
    tanggalKembali: "2026-08-22",
    status: "Dikembalikan",
    denda: 0,
    petugas: "Admin Perpustakaan",
  },
  {
    id: 7,
    kode: "PJ-0007",
    siswa: "Gita Maharani",
    nis: "20240007",
    kelas: "10B",
    buku: "English for Students",
    kodeBuku: "BK-0007",
    tanggalPinjam: "2026-09-03",
    jatuhTempo: "2026-09-10",
    tanggalKembali: "",
    status: "Dipinjam",
    denda: 0,
    petugas: "Admin Perpustakaan",
  },
  {
    id: 8,
    kode: "PJ-0008",
    siswa: "Hendra Wijaya",
    nis: "20240008",
    kelas: "10B",
    buku: "Teknik Komputer dan Jaringan",
    kodeBuku: "BK-0008",
    tanggalPinjam: "2026-08-18",
    jatuhTempo: "2026-08-25",
    tanggalKembali: "",
    status: "Terlambat",
    denda: 20000,
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
  tanggalPinjam: "2026-09-07",
  jatuhTempo: "2026-09-14",
  tanggalKembali: "",
  status: "Dipinjam",
  denda: "0",
  petugas: "Admin Perpustakaan",
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon: Icon, label, value, type }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
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
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  if (status === "Dipinjam") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
        <Clock3 size={13} />
        Dipinjam
      </span>
    );
  }

  if (status === "Terlambat") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
        <AlertTriangle size={13} />
        Terlambat
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 size={13} />
      Dikembalikan
    </span>
  );
}

/* =========================================================
   FORM MODAL
========================================================= */

function LoanForm({ initial, editMode, onCancel, onSave }) {
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
      denda: Number(form.denda) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* SISWA */}

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
            Tanggal Kembali
          </label>

          <input
            type="date"
            value={form.tanggalKembali}
            onChange={update("tanggalKembali")}
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* STATUS + DENDA */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <option>Dipinjam</option>
              <option>Terlambat</option>
              <option>Dikembalikan</option>
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
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
          {editMode ? "Simpan Perubahan" : "Simpan Peminjaman"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function DetailModal({ loan, onClose }) {
  if (!loan) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Detail Peminjaman
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Informasi transaksi peminjaman buku
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
          {/* BOOK HEADER */}

          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BookOpen size={27} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {loan.kode}
                </span>

                <StatusBadge status={loan.status} />
              </div>

              <h3 className="mt-2 text-lg font-bold text-slate-900">
                {loan.buku}
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                {loan.kodeBuku}
              </p>
            </div>
          </div>

          {/* SISWA */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                <UserRound size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {loan.siswa}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  NIS {loan.nis} • Kelas {loan.kelas}
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
                {loan.tanggalPinjam}
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
                {loan.jatuhTempo}
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
                {loan.tanggalKembali || "-"}
              </p>
            </div>
          </div>

          {/* DENDA */}

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-500">
              Total Denda
            </span>

            <span className="text-sm font-bold text-slate-900">
              Rp {loan.denda.toLocaleString("id-ID")}
            </span>
          </div>

          {/* PETUGAS */}

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-xs text-slate-400">
              Petugas
            </span>

            <span className="text-xs font-medium text-slate-600">
              {loan.petugas}
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
   MAIN PAGE
========================================================= */

export default function PinjamPage() {
  const [loans, setLoans] = useState(initialLoans);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [classFilter, setClassFilter] = useState("Semua");

  const [modal, setModal] = useState(null);
  const [activeLoan, setActiveLoan] = useState(null);
  const [detailLoan, setDetailLoan] = useState(null);
  const [deleteLoan, setDeleteLoan] = useState(null);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredLoans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const matchSearch =
        !query ||
        loan.kode.toLowerCase().includes(query) ||
        loan.siswa.toLowerCase().includes(query) ||
        loan.nis.toLowerCase().includes(query) ||
        loan.buku.toLowerCase().includes(query) ||
        loan.kodeBuku.toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "Semua" ||
        loan.status === statusFilter;

      const matchClass =
        classFilter === "Semua" ||
        loan.kelas === classFilter;

      return matchSearch && matchStatus && matchClass;
    });
  }, [loans, search, statusFilter, classFilter]);

  /* =========================================================
     STATISTIC
  ========================================================= */

  const totalPeminjaman = loans.length;

  const sedangDipinjam = loans.filter(
    (loan) => loan.status === "Dipinjam"
  ).length;

  const terlambat = loans.filter(
    (loan) => loan.status === "Terlambat"
  ).length;

  const dikembalikan = loans.filter(
    (loan) => loan.status === "Dikembalikan"
  ).length;

  /* =========================================================
     ADD
  ========================================================= */

  const openAdd = () => {
    const nextNumber = loans.length + 1;

    setActiveLoan({
      ...emptyForm,
      kode: `PJ-${String(nextNumber).padStart(4, "0")}`,
    });

    setModal("add");
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const openEdit = (loan) => {
    setActiveLoan({
      ...loan,
    });

    setModal("edit");
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    setModal(null);
    setActiveLoan(null);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const saveLoan = (form) => {
    if (modal === "add") {
      setLoans((current) => [
        {
          ...form,
          id: Date.now(),
        },
        ...current,
      ]);
    } else {
      setLoans((current) =>
        current.map((loan) =>
          loan.id === form.id
            ? {
                ...loan,
                ...form,
              }
            : loan
        )
      );
    }

    closeModal();
  };

  /* =========================================================
     RETURN BOOK
  ========================================================= */

  const returnBook = (loan) => {
    setLoans((current) =>
      current.map((item) =>
        item.id === loan.id
          ? {
              ...item,
              status: "Dikembalikan",
              tanggalKembali: "2026-09-07",
              denda: 0,
            }
          : item
      )
    );
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const confirmDelete = () => {
    if (!deleteLoan) return;

    setLoans((current) =>
      current.filter(
        (loan) => loan.id !== deleteLoan.id
      )
    );

    setDeleteLoan(null);
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("Semua");
    setClassFilter("Semua");
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
                  <BookOpen size={23} />
                </div>

                <div>
                  <h1 className="text-[25px] font-bold tracking-tight text-slate-900">
                    Peminjaman Buku
                  </h1>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Kelola transaksi peminjaman dan pengembalian buku
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
                  Pinjam Buku
                </button>
              </div>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Library}
                label="Total Transaksi"
                value={totalPeminjaman}
                type="blue"
              />

              <StatCard
                icon={Clock3}
                label="Sedang Dipinjam"
                value={sedangDipinjam}
                type="orange"
              />

              <StatCard
                icon={AlertTriangle}
                label="Terlambat"
                value={terlambat}
                type="red"
              />

              <StatCard
                icon={CheckCircle2}
                label="Dikembalikan"
                value={dikembalikan}
                type="green"
              />
            </div>

            {/* =================================================
                FILTER
            ================================================= */}

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
                  placeholder="Cari kode transaksi, siswa, NIS, atau judul buku..."
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

                    <option>Dipinjam</option>
                    <option>Terlambat</option>
                    <option>Dikembalikan</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* CLASS */}

                <div className="relative xl:w-40">
                  <select
                    value={classFilter}
                    onChange={(event) =>
                      setClassFilter(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Semua">
                      Semua Kelas
                    </option>

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

                <button
                  type="button"
                  onClick={resetFilter}
                  className="h-10 px-3 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 xl:text-center"
                >
                  Reset Filter
                </button>

                <div className="flex items-center xl:ml-auto">
                  <span className="text-sm text-slate-500">
                    {filteredLoans.length} transaksi ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Daftar Peminjaman
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Riwayat transaksi peminjaman buku siswa
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Library size={14} />
                  {filteredLoans.length} transaksi
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Peminjam
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Buku
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Tanggal Pinjam
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Jatuh Tempo
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Kembali
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Denda
                      </th>

                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredLoans.length > 0 ? (
                      filteredLoans.map((loan) => (
                        <tr
                          key={loan.id}
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
                                  {loan.siswa}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {loan.nis} • Kelas {loan.kelas}
                                </p>

                                <p className="mt-0.5 text-[11px] font-medium text-blue-600">
                                  {loan.kode}
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
                                <p className="max-w-[250px] truncate text-sm font-medium text-slate-700">
                                  {loan.buku}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  {loan.kodeBuku}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* TANGGAL PINJAM */}

                          <td className="px-4 py-4">
                            <span className="text-xs text-slate-600">
                              {loan.tanggalPinjam}
                            </span>
                          </td>

                          {/* JATUH TEMPO */}

                          <td className="px-4 py-4">
                            <span
                              className={`text-xs font-medium ${
                                loan.status === "Terlambat"
                                  ? "text-rose-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {loan.jatuhTempo}
                            </span>
                          </td>

                          {/* KEMBALI */}

                          <td className="px-4 py-4">
                            <span className="text-xs text-slate-500">
                              {loan.tanggalKembali || "-"}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-4">
                            <StatusBadge status={loan.status} />
                          </td>

                          {/* DENDA */}

                          <td className="px-4 py-4">
                            <span
                              className={`text-xs font-semibold ${
                                loan.denda > 0
                                  ? "text-rose-600"
                                  : "text-slate-500"
                              }`}
                            >
                              Rp{" "}
                              {loan.denda.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Detail"
                                onClick={() =>
                                  setDetailLoan(loan)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={16} />
                              </button>

                              {loan.status !==
                                "Dikembalikan" && (
                                <button
                                  type="button"
                                  title="Kembalikan Buku"
                                  onClick={() =>
                                    returnBook(loan)
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}

                              <button
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  openEdit(loan)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                title="Hapus"
                                onClick={() =>
                                  setDeleteLoan(loan)
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
                          colSpan={8}
                          className="px-5 py-16 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Search size={20} />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Data peminjaman tidak ditemukan
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
                    {filteredLoans.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-slate-600">
                    {loans.length}
                  </span>{" "}
                  transaksi
                </p>

                <p className="text-xs text-slate-400">
                  Terlambat:{" "}
                  <span className="font-medium text-rose-600">
                    {terlambat}
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

      {modal && activeLoan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modal === "add"
                    ? "Pinjam Buku"
                    : "Edit Peminjaman"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {modal === "add"
                    ? "Buat transaksi peminjaman buku baru"
                    : "Perbarui data transaksi peminjaman"}
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
              <LoanForm
                initial={activeLoan}
                editMode={modal === "edit"}
                onCancel={closeModal}
                onSave={saveLoan}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL
      ===================================================== */}

      <DetailModal
        loan={detailLoan}
        onClose={() => setDetailLoan(null)}
      />

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteLoan && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Trash2 size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Hapus transaksi?
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Transaksi{" "}
                  <span className="font-semibold text-slate-700">
                    {deleteLoan.kode}
                  </span>{" "}
                  milik{" "}
                  <span className="font-semibold text-slate-700">
                    {deleteLoan.siswa}
                  </span>{" "}
                  akan dihapus.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteLoan(null)}
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