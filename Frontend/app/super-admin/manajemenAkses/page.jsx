"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Users,
  ChevronDown,
  KeyRound,
  Copy,
  Lock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — shaped after the `peran` table schema (id, nama, nama_tampilan,
// deskripsi, status, dibuat_pada, diperbarui_pada). Swap `initialPeran` for a
// real fetch (e.g. from /api/peran) once the backend endpoint is ready.
// `izin_ids` holds the permission ids currently granted to that role.
// ---------------------------------------------------------------------------
const initialPeran = [
  {
    id: "1",
    nama: "super_admin",
    nama_tampilan: "Super Admin",
    deskripsi: "Akses penuh ke seluruh modul dan pengaturan sistem SmartSchool.",
    status: "aktif",
    jumlah_pengguna: 3,
    dibuat_pada: "2026-01-12",
    izin_ids: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
  },
  {
    id: "2",
    nama: "admin_sekolah",
    nama_tampilan: "Admin Sekolah",
    deskripsi: "Mengelola data sekolah, guru, siswa, dan kelas pada satu sekolah.",
    status: "aktif",
    jumlah_pengguna: 125,
    dibuat_pada: "2026-01-12",
    izin_ids: ["p1", "p2", "p5", "p6"],
  },
  {
    id: "3",
    nama: "guru",
    nama_tampilan: "Guru",
    deskripsi: "Mengelola nilai, presensi, dan materi ajar untuk kelas yang diampu.",
    status: "aktif",
    jumlah_pengguna: 842,
    dibuat_pada: "2026-01-15",
    izin_ids: ["p1", "p6"],
  },
  {
    id: "4",
    nama: "wali_kelas",
    nama_tampilan: "Wali Kelas",
    deskripsi: "Memantau perkembangan siswa dan mengelola data satu kelas.",
    status: "aktif",
    jumlah_pengguna: 210,
    dibuat_pada: "2026-02-02",
    izin_ids: ["p1"],
  },
  {
    id: "5",
    nama: "bendahara",
    nama_tampilan: "Bendahara",
    deskripsi: "Mengelola pembayaran, tagihan, dan laporan keuangan sekolah.",
    status: "tidak_aktif",
    jumlah_pengguna: 18,
    dibuat_pada: "2026-03-20",
    izin_ids: ["p7", "p8"],
  },
];

// ---------------------------------------------------------------------------
// Mock data for `izin` (permission) — id, nama, kode, modul, deskripsi, status
// ---------------------------------------------------------------------------
const initialIzin = [
  { id: "p1", nama: "Lihat Dashboard", kode: "dashboard.lihat", modul: "Dashboard", deskripsi: "Melihat ringkasan statistik pada dashboard.", status: "aktif", dibuat_pada: "2026-01-10" },
  { id: "p2", nama: "Kelola Sekolah", kode: "sekolah.kelola", modul: "Data Master", deskripsi: "Menambah, mengubah, dan menghapus data sekolah.", status: "aktif", dibuat_pada: "2026-01-10" },
  { id: "p3", nama: "Kelola Yayasan", kode: "yayasan.kelola", modul: "Data Master", deskripsi: "Menambah, mengubah, dan menghapus data yayasan.", status: "aktif", dibuat_pada: "2026-01-10" },
  { id: "p4", nama: "Kelola Paket & Modul", kode: "paket.kelola", modul: "Produk", deskripsi: "Mengatur paket langganan dan modul yang tersedia.", status: "aktif", dibuat_pada: "2026-01-11" },
  { id: "p5", nama: "Kelola Langganan", kode: "langganan.kelola", modul: "Produk", deskripsi: "Mengelola langganan sekolah dan status pembayarannya.", status: "aktif", dibuat_pada: "2026-01-11" },
  { id: "p6", nama: "Kelola Manajemen Akses", kode: "akses.kelola", modul: "Administrasi", deskripsi: "Mengelola peran dan izin pada seluruh sistem.", status: "aktif", dibuat_pada: "2026-01-12" },
  { id: "p7", nama: "Lihat Laporan Analitik", kode: "laporan.lihat", modul: "Administrasi", deskripsi: "Melihat laporan dan analitik penggunaan sistem.", status: "aktif", dibuat_pada: "2026-01-14" },
  { id: "p8", nama: "Kelola Pengaturan Sistem", kode: "sistem.kelola", modul: "Sistem", deskripsi: "Mengubah konfigurasi global sistem SmartSchool.", status: "aktif", dibuat_pada: "2026-01-14" },
];

const emptyPeranForm = { nama: "", nama_tampilan: "", deskripsi: "", status: "aktif" };
const emptyIzinForm = { nama: "", kode: "", modul: "", deskripsi: "", status: "aktif" };

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function StatusBadge({ status }) {
  const aktif = status === "aktif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        aktif ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${aktif ? "bg-emerald-500" : "bg-gray-400"}`} />
      {aktif ? "Aktif" : "Tidak Aktif"}
    </span>
  );
}

export default function ManajemenAksesPage() {
  const [activeTab, setActiveTab] = useState("peran"); // "peran" | "izin"

  // ---- Peran (Role) state -------------------------------------------------
  const [peranList, setPeranList] = useState(initialPeran);
  const [peranQuery, setPeranQuery] = useState("");
  const [peranStatusFilter, setPeranStatusFilter] = useState("semua");

  const [peranModalOpen, setPeranModalOpen] = useState(false);
  const [editingPeranId, setEditingPeranId] = useState(null);
  const [peranForm, setPeranForm] = useState(emptyPeranForm);
  const [peranErrors, setPeranErrors] = useState({});
  const [deletePeranTarget, setDeletePeranTarget] = useState(null);

  // ---- Izin (Permission) state --------------------------------------------
  const [izinList, setIzinList] = useState(initialIzin);
  const [izinQuery, setIzinQuery] = useState("");
  const [izinModuleFilter, setIzinModuleFilter] = useState("semua");

  const [izinModalOpen, setIzinModalOpen] = useState(false);
  const [editingIzinId, setEditingIzinId] = useState(null);
  const [izinForm, setIzinForm] = useState(emptyIzinForm);
  const [izinErrors, setIzinErrors] = useState({});
  const [deleteIzinTarget, setDeleteIzinTarget] = useState(null);

  // ---- Assign izin to a peran ---------------------------------------------
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignSelection, setAssignSelection] = useState([]);

  const modules = useMemo(
    () => Array.from(new Set(initialIzin.map((i) => i.modul))),
    []
  );

  const filteredPeran = useMemo(() => {
    return peranList.filter((p) => {
      const matchesQuery =
        p.nama_tampilan.toLowerCase().includes(peranQuery.toLowerCase()) ||
        p.nama.toLowerCase().includes(peranQuery.toLowerCase());
      const matchesStatus = peranStatusFilter === "semua" || p.status === peranStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [peranList, peranQuery, peranStatusFilter]);

  const filteredIzin = useMemo(() => {
    return izinList.filter((i) => {
      const matchesQuery =
        i.nama.toLowerCase().includes(izinQuery.toLowerCase()) ||
        i.kode.toLowerCase().includes(izinQuery.toLowerCase());
      const matchesModule = izinModuleFilter === "semua" || i.modul === izinModuleFilter;
      return matchesQuery && matchesModule;
    });
  }, [izinList, izinQuery, izinModuleFilter]);

  const totalPeranAktif = peranList.filter((p) => p.status === "aktif").length;
  const totalPengguna = peranList.reduce((sum, p) => sum + p.jumlah_pengguna, 0);
  const totalIzinAktif = izinList.filter((i) => i.status === "aktif").length;

  // ---- Peran handlers -------------------------------------------------------
  function openAddPeran() {
    setEditingPeranId(null);
    setPeranForm(emptyPeranForm);
    setPeranErrors({});
    setPeranModalOpen(true);
  }

  function openEditPeran(peran) {
    setEditingPeranId(peran.id);
    setPeranForm({
      nama: peran.nama,
      nama_tampilan: peran.nama_tampilan,
      deskripsi: peran.deskripsi,
      status: peran.status,
    });
    setPeranErrors({});
    setPeranModalOpen(true);
  }

  function closePeranModal() {
    setPeranModalOpen(false);
    setEditingPeranId(null);
    setPeranForm(emptyPeranForm);
    setPeranErrors({});
  }

  function handleNamaTampilanChange(value) {
    setPeranForm((f) => ({
      ...f,
      nama_tampilan: value,
      // auto-generate the unique slug from the display name unless editing
      nama: editingPeranId ? f.nama : slugify(value),
    }));
  }

  function validatePeran() {
    const next = {};
    if (!peranForm.nama_tampilan.trim()) next.nama_tampilan = "Nama peran wajib diisi.";
    if (!peranForm.nama.trim()) next.nama = "Nama unik wajib diisi.";
    const duplicate = peranList.some(
      (p) => p.nama === peranForm.nama && p.id !== editingPeranId
    );
    if (duplicate) next.nama = "Nama unik ini sudah digunakan.";
    setPeranErrors(next);
    return Object.keys(next).length === 0;
  }

  function handlePeranSubmit(e) {
    e.preventDefault();
    if (!validatePeran()) return;

    if (editingPeranId) {
      setPeranList((list) =>
        list.map((p) => (p.id === editingPeranId ? { ...p, ...peranForm } : p))
      );
    } else {
      setPeranList((list) => [
        ...list,
        {
          id: crypto.randomUUID(),
          ...peranForm,
          jumlah_pengguna: 0,
          dibuat_pada: new Date().toISOString().slice(0, 10),
          izin_ids: [],
        },
      ]);
    }
    closePeranModal();
  }

  function duplicatePeran(peran) {
    setPeranList((list) => [
      ...list,
      {
        ...peran,
        id: crypto.randomUUID(),
        nama: `${peran.nama}_salinan`,
        nama_tampilan: `${peran.nama_tampilan} (Salinan)`,
        jumlah_pengguna: 0,
        dibuat_pada: new Date().toISOString().slice(0, 10),
      },
    ]);
  }

  function confirmDeletePeran() {
    setPeranList((list) => list.filter((p) => p.id !== deletePeranTarget.id));
    setDeletePeranTarget(null);
  }

  // ---- Izin handlers -------------------------------------------------------
  function openAddIzin() {
    setEditingIzinId(null);
    setIzinForm(emptyIzinForm);
    setIzinErrors({});
    setIzinModalOpen(true);
  }

  function openEditIzin(izin) {
    setEditingIzinId(izin.id);
    setIzinForm({
      nama: izin.nama,
      kode: izin.kode,
      modul: izin.modul,
      deskripsi: izin.deskripsi,
      status: izin.status,
    });
    setIzinErrors({});
    setIzinModalOpen(true);
  }

  function closeIzinModal() {
    setIzinModalOpen(false);
    setEditingIzinId(null);
    setIzinForm(emptyIzinForm);
    setIzinErrors({});
  }

  function handleIzinNamaChange(value) {
    setIzinForm((f) => ({
      ...f,
      nama: value,
      kode: editingIzinId ? f.kode : slugify(value).replace(/_/g, "."),
    }));
  }

  function validateIzin() {
    const next = {};
    if (!izinForm.nama.trim()) next.nama = "Nama izin wajib diisi.";
    if (!izinForm.kode.trim()) next.kode = "Kode wajib diisi.";
    if (!izinForm.modul.trim()) next.modul = "Modul wajib diisi.";
    const duplicate = izinList.some(
      (i) => i.kode === izinForm.kode && i.id !== editingIzinId
    );
    if (duplicate) next.kode = "Kode ini sudah digunakan.";
    setIzinErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleIzinSubmit(e) {
    e.preventDefault();
    if (!validateIzin()) return;

    if (editingIzinId) {
      setIzinList((list) =>
        list.map((i) => (i.id === editingIzinId ? { ...i, ...izinForm } : i))
      );
    } else {
      setIzinList((list) => [
        ...list,
        {
          id: crypto.randomUUID(),
          ...izinForm,
          dibuat_pada: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    closeIzinModal();
  }

  function confirmDeleteIzin() {
    const removedId = deleteIzinTarget.id;
    setIzinList((list) => list.filter((i) => i.id !== removedId));
    // keep role assignments consistent once a permission is removed
    setPeranList((list) =>
      list.map((p) => ({ ...p, izin_ids: p.izin_ids.filter((id) => id !== removedId) }))
    );
    setDeleteIzinTarget(null);
  }

  // ---- Assign izin to peran --------------------------------------------------
  function openAssignModal(peran) {
    setAssignTarget(peran);
    setAssignSelection(peran.izin_ids);
  }

  function toggleAssignSelection(izinId) {
    setAssignSelection((sel) =>
      sel.includes(izinId) ? sel.filter((id) => id !== izinId) : [...sel, izinId]
    );
  }

  function saveAssignSelection() {
    setPeranList((list) =>
      list.map((p) => (p.id === assignTarget.id ? { ...p, izin_ids: assignSelection } : p))
    );
    setAssignTarget(null);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="manajemenAkses" />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header title="Manajemen Akses" />

        <main className="flex-1 px-6 py-8 md:px-10">
          {/* Page header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-400">Administrasi</p>
              <h1 className="text-2xl font-semibold text-gray-900">Manajemen Akses</h1>
              <p className="mt-1 text-sm text-gray-500">
                Kelola peran dan izin pengguna pada seluruh sistem SmartSchool.
              </p>
            </div>
            <button
              onClick={activeTab === "peran" ? openAddPeran : openAddIzin}
              className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              {activeTab === "peran" ? "Tambah Peran" : "Tambah Izin"}
            </button>
          </div>

      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => setActiveTab("peran")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === "peran" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Role (Peran)
        </button>
        <button
          onClick={() => setActiveTab("izin")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === "izin" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <KeyRound className="h-4 w-4" />
          Izin (Permission)
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Total Peran</p>
              <p className="text-xl font-semibold text-gray-900">{peranList.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Peran Aktif</p>
              <p className="text-xl font-semibold text-gray-900">{totalPeranAktif}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Pengguna Tercakup</p>
              <p className="text-xl font-semibold text-gray-900">
                {totalPengguna.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PERAN TAB                                                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "peran" && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={peranQuery}
                onChange={(e) => setPeranQuery(e.target.value)}
                placeholder="Cari peran..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <select
                value={peranStatusFilter}
                onChange={(e) => setPeranStatusFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-3 pr-9 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-44"
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3 font-medium">Peran</th>
                  <th className="px-5 py-3 font-medium">Deskripsi</th>
                  <th className="px-5 py-3 font-medium">Izin</th>
                  <th className="px-5 py-3 font-medium">Pengguna</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPeran.map((p) => (
                  <tr key={p.id} className="transition hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{p.nama_tampilan}</p>
                      <p className="text-xs text-gray-400">{p.nama}</p>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-gray-500">{p.deskripsi}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openAssignModal(p)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <KeyRound className="h-3 w-3" />
                        {p.izin_ids.length} izin
                      </button>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{p.jumlah_pengguna}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => duplicatePeran(p)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                          aria-label={`Duplikat peran ${p.nama_tampilan}`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditPeran(p)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                          aria-label={`Ubah peran ${p.nama_tampilan}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletePeranTarget(p)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Hapus peran ${p.nama_tampilan}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPeran.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                      Tidak ada peran yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* IZIN TAB                                                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "izin" && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={izinQuery}
                onChange={(e) => setIzinQuery(e.target.value)}
                placeholder="Cari izin..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <select
                value={izinModuleFilter}
                onChange={(e) => setIzinModuleFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-3 pr-9 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-44"
              >
                <option value="semua">Semua Modul</option>
                {modules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3 font-medium">Izin</th>
                  <th className="px-5 py-3 font-medium">Modul</th>
                  <th className="px-5 py-3 font-medium">Deskripsi</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIzin.map((i) => (
                  <tr key={i.id} className="transition hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{i.nama}</p>
                      <p className="font-mono text-xs text-gray-400">{i.kode}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {i.modul}
                      </span>
                    </td>
                    <td className="max-w-sm px-5 py-4 text-gray-500">{i.deskripsi}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditIzin(i)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                          aria-label={`Ubah izin ${i.nama}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteIzinTarget(i)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Hapus izin ${i.nama}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredIzin.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                      Tidak ada izin yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Peran modal */}
      {peranModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingPeranId ? "Ubah Peran" : "Tambah Peran"}
              </h2>
              <button
                onClick={closePeranModal}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePeranSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nama Peran
                </label>
                <input
                  value={peranForm.nama_tampilan}
                  onChange={(e) => handleNamaTampilanChange(e.target.value)}
                  placeholder="Contoh: Wali Kelas"
                  className={`h-10 w-full rounded-lg border bg-gray-50 px-3 text-sm text-gray-800 outline-none transition focus:bg-white focus:ring-2 ${
                    peranErrors.nama_tampilan
                      ? "border-red-300 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                {peranErrors.nama_tampilan && (
                  <p className="mt-1 text-xs text-red-500">{peranErrors.nama_tampilan}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nama Unik (slug)
                </label>
                <input
                  value={peranForm.nama}
                  onChange={(e) =>
                    setPeranForm((f) => ({ ...f, nama: slugify(e.target.value) }))
                  }
                  placeholder="wali_kelas"
                  className={`h-10 w-full rounded-lg border bg-gray-50 px-3 font-mono text-sm text-gray-800 outline-none transition focus:bg-white focus:ring-2 ${
                    peranErrors.nama
                      ? "border-red-300 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                {peranErrors.nama && <p className="mt-1 text-xs text-red-500">{peranErrors.nama}</p>}
                <p className="mt-1 text-xs text-gray-400">
                  Digunakan sistem untuk mengecek hak akses, tidak dapat mengandung spasi.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  value={peranForm.deskripsi}
                  onChange={(e) =>
                    setPeranForm((f) => ({ ...f, deskripsi: e.target.value }))
                  }
                  rows={3}
                  placeholder="Jelaskan cakupan akses peran ini..."
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                <div className="flex gap-2">
                  {["aktif", "tidak_aktif"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setPeranForm((f) => ({ ...f, status: s }))}
                      className={`h-9 flex-1 rounded-lg border text-sm font-medium transition ${
                        peranForm.status === s
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {s === "aktif" ? "Aktif" : "Tidak Aktif"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePeranModal}
                  className="h-10 flex-1 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  {editingPeranId ? "Simpan Perubahan" : "Tambah Peran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Peran confirmation */}
      {deletePeranTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Hapus Peran?</h2>
            <p className="mt-2 text-sm text-gray-500">
              Peran{" "}
              <span className="font-medium text-gray-700">
                {deletePeranTarget.nama_tampilan}
              </span>{" "}
              akan dihapus (soft delete) dan tidak lagi bisa ditetapkan ke pengguna baru.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeletePeranTarget(null)}
                className="h-10 flex-1 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDeletePeran}
                className="h-10 flex-1 rounded-lg bg-red-600 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Izin modal */}
      {izinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingIzinId ? "Ubah Izin" : "Tambah Izin"}
              </h2>
              <button
                onClick={closeIzinModal}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleIzinSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nama Izin
                </label>
                <input
                  value={izinForm.nama}
                  onChange={(e) => handleIzinNamaChange(e.target.value)}
                  placeholder="Contoh: Kelola Nilai Siswa"
                  className={`h-10 w-full rounded-lg border bg-gray-50 px-3 text-sm text-gray-800 outline-none transition focus:bg-white focus:ring-2 ${
                    izinErrors.nama
                      ? "border-red-300 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                {izinErrors.nama && <p className="mt-1 text-xs text-red-500">{izinErrors.nama}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Kode Izin
                </label>
                <input
                  value={izinForm.kode}
                  onChange={(e) => setIzinForm((f) => ({ ...f, kode: e.target.value }))}
                  placeholder="nilai.kelola"
                  className={`h-10 w-full rounded-lg border bg-gray-50 px-3 font-mono text-sm text-gray-800 outline-none transition focus:bg-white focus:ring-2 ${
                    izinErrors.kode
                      ? "border-red-300 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                {izinErrors.kode && <p className="mt-1 text-xs text-red-500">{izinErrors.kode}</p>}
                <p className="mt-1 text-xs text-gray-400">
                  Kode unik yang dicek sistem saat memvalidasi hak akses.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Modul</label>
                <input
                  list="modul-list"
                  value={izinForm.modul}
                  onChange={(e) => setIzinForm((f) => ({ ...f, modul: e.target.value }))}
                  placeholder="Contoh: Akademik"
                  className={`h-10 w-full rounded-lg border bg-gray-50 px-3 text-sm text-gray-800 outline-none transition focus:bg-white focus:ring-2 ${
                    izinErrors.modul
                      ? "border-red-300 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                <datalist id="modul-list">
                  {modules.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                {izinErrors.modul && <p className="mt-1 text-xs text-red-500">{izinErrors.modul}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  value={izinForm.deskripsi}
                  onChange={(e) => setIzinForm((f) => ({ ...f, deskripsi: e.target.value }))}
                  rows={3}
                  placeholder="Jelaskan tindakan apa yang diizinkan..."
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                <div className="flex gap-2">
                  {["aktif", "tidak_aktif"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setIzinForm((f) => ({ ...f, status: s }))}
                      className={`h-9 flex-1 rounded-lg border text-sm font-medium transition ${
                        izinForm.status === s
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {s === "aktif" ? "Aktif" : "Tidak Aktif"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeIzinModal}
                  className="h-10 flex-1 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  {editingIzinId ? "Simpan Perubahan" : "Tambah Izin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Izin confirmation */}
      {deleteIzinTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Hapus Izin?</h2>
            <p className="mt-2 text-sm text-gray-500">
              Izin <span className="font-medium text-gray-700">{deleteIzinTarget.nama}</span> akan
              dihapus dan otomatis dicabut dari semua peran yang memilikinya.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteIzinTarget(null)}
                className="h-10 flex-1 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteIzin}
                className="h-10 flex-1 rounded-lg bg-red-600 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign izin to peran modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Kelola Izin — {assignTarget.nama_tampilan}
              </h2>
              <button
                onClick={() => setAssignTarget(null)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Pilih izin yang diberikan kepada peran ini.
            </p>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {modules.map((m) => (
                <div key={m}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {m}
                  </p>
                  <div className="space-y-2">
                    {izinList
                      .filter((i) => i.modul === m)
                      .map((i) => (
                        <label
                          key={i.id}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={assignSelection.includes(i.id)}
                            onChange={() => toggleAssignSelection(i.id)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                          />
                          <span>
                            <span className="block text-sm font-medium text-gray-800">
                              {i.nama}
                            </span>
                            <span className="block text-xs text-gray-400">{i.deskripsi}</span>
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="h-3.5 w-3.5" />
                {assignSelection.length} izin dipilih
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setAssignTarget(null)}
                  className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={saveAssignSelection}
                  className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
}