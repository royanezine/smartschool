"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Eye,
  X,
  CalendarDays,
  User,
  GraduationCap,
  Tag,
  FileText,
  CheckCircle2,
  Clock3,
  Loader2,
  Gauge,
  ShieldAlert,
  UserCheck,
  Save,
} from "lucide-react";

// =====================================================
// DUMMY DATA
// =====================================================

const KATEGORI_LIST = [
  { nama: "Terlambat masuk sekolah", tingkat: "Ringan", poin: 5 },
  { nama: "Tidak mengerjakan tugas", tingkat: "Ringan", poin: 5 },
  { nama: "Atribut seragam tidak lengkap", tingkat: "Ringan", poin: 5 },
  { nama: "Membolos jam pelajaran", tingkat: "Sedang", poin: 15 },
  { nama: "Merokok di lingkungan sekolah", tingkat: "Berat", poin: 50 },
  { nama: "Berkelahi dengan siswa lain", tingkat: "Berat", poin: 75 },
  { nama: "Membawa barang terlarang", tingkat: "Berat", poin: 100 },
  { nama: "Menggunakan HP saat pelajaran", tingkat: "Ringan", poin: 5 },
];

const PELAPOR_LIST = [
  "Bambang Kurniawan, S.Pd.",
  "Dra. Siti Rahayu, M.Pd.",
  "Guru Piket",
  "Wali Kelas",
  "Satpam Sekolah",
];

const STATUS_LIST = ["Belum Ditangani", "Diproses", "Selesai"];

const initialPelanggaran = [
  {
    id: "PL-0001",
    namaSiswa: "Reza Firmansyah",
    kelas: "X IPA 3",
    kategori: "Terlambat masuk sekolah",
    tingkat: "Ringan",
    poin: 5,
    tanggal: "2026-09-08",
    pelapor: "Guru Piket",
    deskripsi: "Terlambat 20 menit tanpa surat keterangan.",
    tindakan: "Diberi teguran lisan dan dicatat di buku pelanggaran.",
    status: "Selesai",
  },
  {
    id: "PL-0002",
    namaSiswa: "Dewi Anjani",
    kelas: "XI IPS 2",
    kategori: "Membolos jam pelajaran",
    tingkat: "Sedang",
    poin: 15,
    tanggal: "2026-09-09",
    pelapor: "Wali Kelas",
    deskripsi: "Tidak masuk pada jam pelajaran ke-5 dan ke-6 tanpa keterangan.",
    tindakan: "",
    status: "Belum Ditangani",
  },
  {
    id: "PL-0003",
    namaSiswa: "Bagas Setiawan",
    kelas: "XII TKJ 1",
    kategori: "Merokok di lingkungan sekolah",
    tingkat: "Berat",
    poin: 50,
    tanggal: "2026-09-07",
    pelapor: "Satpam Sekolah",
    deskripsi: "Kedapatan merokok di area belakang kantin sekolah.",
    tindakan: "Dipanggil orang tua, surat perjanjian tertulis.",
    status: "Diproses",
  },
  {
    id: "PL-0004",
    namaSiswa: "Intan Permata Sari",
    kelas: "X IPS 1",
    kategori: "Menggunakan HP saat pelajaran",
    tingkat: "Ringan",
    poin: 5,
    tanggal: "2026-09-09",
    pelapor: "Bambang Kurniawan, S.Pd.",
    deskripsi: "Bermain game saat pelajaran Bahasa Indonesia berlangsung.",
    tindakan: "HP disita sementara, dikembalikan akhir hari.",
    status: "Selesai",
  },
  {
    id: "PL-0005",
    namaSiswa: "Fajar Nugraha",
    kelas: "XI MIPA 4",
    kategori: "Berkelahi dengan siswa lain",
    tingkat: "Berat",
    poin: 75,
    tanggal: "2026-09-06",
    pelapor: "Dra. Siti Rahayu, M.Pd.",
    deskripsi: "Terlibat perkelahian dengan siswa kelas lain di kantin.",
    tindakan: "Skorsing 3 hari, mediasi dengan pihak terkait.",
    status: "Diproses",
  },
  {
    id: "PL-0006",
    namaSiswa: "Wulan Ramadhani",
    kelas: "X IPA 1",
    kategori: "Atribut seragam tidak lengkap",
    tingkat: "Ringan",
    poin: 5,
    tanggal: "2026-09-09",
    pelapor: "Guru Piket",
    deskripsi: "Tidak menggunakan dasi dan topi saat upacara.",
    tindakan: "",
    status: "Belum Ditangani",
  },
];

// =====================================================
// HELPER
// =====================================================

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

const tingkatConfig = {
  Ringan: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  Sedang: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  Berat: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
};

const statusConfig = {
  "Belum Ditangani": { icon: AlertTriangle, bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
  Diproses: { icon: Clock3, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  Selesai: { icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
};

const emptyForm = {
  namaSiswa: "",
  kelas: "",
  kategori: KATEGORI_LIST[0].nama,
  tanggal: "",
  pelapor: PELAPOR_LIST[0],
  deskripsi: "",
  tindakan: "",
  status: "Belum Ditangani",
};

// =====================================================
// MAIN
// =====================================================

export default function PelanggaranSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed((c) => !c);

  const [dataList, setDataList] = useState(initialPelanggaran);

  const [search, setSearch] = useState("");
  const [tingkatFilter, setTingkatFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  // ===================================================
  // FILTER
  // ===================================================

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return dataList
      .filter((item) => {
        const matchSearch =
          !keyword ||
          item.namaSiswa.toLowerCase().includes(keyword) ||
          item.kelas.toLowerCase().includes(keyword) ||
          item.kategori.toLowerCase().includes(keyword);

        const matchTingkat = tingkatFilter === "Semua" || item.tingkat === tingkatFilter;
        const matchStatus = statusFilter === "Semua" || item.status === statusFilter;

        return matchSearch && matchTingkat && matchStatus;
      })
      .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
  }, [dataList, search, tingkatFilter, statusFilter]);

  const activeFilterCount = [tingkatFilter !== "Semua", statusFilter !== "Semua"].filter(Boolean).length;

  // ===================================================
  // STATISTICS
  // ===================================================

  const total = dataList.length;
  const totalPoin = dataList.reduce((sum, item) => sum + (Number(item.poin) || 0), 0);
  const belumDitangani = dataList.filter((d) => d.status === "Belum Ditangani").length;
  const selesai = dataList.filter((d) => d.status === "Selesai").length;

  const handleResetFilter = () => {
    setSearch("");
    setTingkatFilter("Semua");
    setStatusFilter("Semua");
  };

  // ===================================================
  // FORM
  // ===================================================

  const getKategoriInfo = (nama) => KATEGORI_LIST.find((k) => k.nama === nama) || KATEGORI_LIST[0];

  const openAddForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setForm({
      namaSiswa: item.namaSiswa,
      kelas: item.kelas,
      kategori: item.kategori,
      tanggal: item.tanggal,
      pelapor: item.pelapor,
      deskripsi: item.deskripsi,
      tindakan: item.tindakan,
      status: item.status,
    });
    setFormErrors({});
    setEditingId(item.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const updateForm = (field, value) => setForm((c) => ({ ...c, [field]: value }));

  const validateForm = () => {
    const errors = {};
    if (!form.namaSiswa.trim()) errors.namaSiswa = "Nama siswa wajib diisi";
    if (!form.kelas.trim()) errors.kelas = "Kelas wajib diisi";
    if (!form.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!form.deskripsi.trim()) errors.deskripsi = "Deskripsi wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    const kategoriInfo = getKategoriInfo(form.kategori);

    setTimeout(() => {
      const payload = { ...form, tingkat: kategoriInfo.tingkat, poin: kategoriInfo.poin };

      if (editingId) {
        setDataList((current) => current.map((item) => (item.id === editingId ? { ...item, ...payload } : item)));
      } else {
        const newId = `PL-${String(dataList.length + 1).padStart(4, "0")}`;
        setDataList((current) => [{ id: newId, ...payload }, ...current]);
      }
      setSaving(false);
      setShowForm(false);
      setEditingId(null);
    }, 500);
  };

  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = (item) => {
    const confirmed = window.confirm(`Yakin ingin menghapus catatan pelanggaran "${item.namaSiswa}" (${item.kategori})?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    setTimeout(() => {
      setDataList((current) => current.filter((d) => d.id !== item.id));
      if (selectedItem?.id === item.id) setSelectedItem(null);
      setDeletingId(null);
    }, 400);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="fixed inset-y-0 left-0 z-[60]">
        <Sidebar active="pelanggaran" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
      </div>

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
        <header className="relative z-50 flex h-[72px] flex-shrink-0 items-center border-b border-slate-200 bg-white">
          <div className="w-full min-w-0">
            <Header
              toggleSidebar={toggleSidebar}
              notifications={[]}
              user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
            />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <div className="w-full px-4 py-5 md:px-6 md:py-6 xl:px-8">
              <div className="mx-auto w-full max-w-[1800px] space-y-5">
                {/* BREADCRUMB */}
                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/bk")}
                    className="font-medium text-slate-400 transition hover:text-blue-600"
                  >
                    Bimbingan & Konseling
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="font-medium text-slate-700">Pelanggaran Siswa</span>
                </div>

                {/* PAGE HEADER */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <ShieldAlert size={23} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Pelanggaran Siswa</h1>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                            BK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Catat, pantau, dan tindak lanjuti pelanggaran tata tertib siswa.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={openAddForm}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                      >
                        <Plus size={17} />
                        Catat Pelanggaran
                      </button>
                    </div>
                  </div>
                </section>

                {/* STATISTICS */}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Kasus</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{total}</p>
                        <p className="mt-1 text-xs text-slate-400">Seluruh periode</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Poin</p>
                        <p className="mt-2 text-2xl font-bold text-indigo-600">{totalPoin}</p>
                        <p className="mt-1 text-xs text-slate-400">Poin terkumpul</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Gauge size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Belum Ditangani</p>
                        <p className="mt-2 text-2xl font-bold text-rose-600">{belumDitangani}</p>
                        <p className="mt-1 text-xs text-slate-400">Perlu tindak lanjut</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <AlertTriangle size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Selesai</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">{selesai}</p>
                        <p className="mt-1 text-xs text-slate-400">Sudah ditangani</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={19} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* SEARCH + FILTER */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                      <div className="relative min-w-0 flex-1">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Cari nama siswa, kelas, atau kategori pelanggaran..."
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFilter((c) => !c)}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                          showFilter || activeFilterCount > 0
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Filter size={17} />
                        Filter
                        {activeFilterCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {showFilter && (
                      <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Tingkat Pelanggaran</label>
                          <select
                            value={tingkatFilter}
                            onChange={(e) => setTingkatFilter(e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="Semua">Semua Tingkat</option>
                            <option value="Ringan">Ringan</option>
                            <option value="Sedang">Sedang</option>
                            <option value="Berat">Berat</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="Semua">Semua Status</option>
                            {STATUS_LIST.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={handleResetFilter}
                            className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                          >
                            Reset semua filter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* TABLE */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Daftar Pelanggaran</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> dari{" "}
                        <span className="font-semibold text-slate-700">{dataList.length}</span> kasus
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-460px)] min-h-[300px] overflow-auto">
                    <table className="w-full min-w-[880px] table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="w-[220px]" />
                        <col className="w-auto" />
                        <col className="w-[110px]" />
                        <col className="w-[120px]" />
                        <col className="w-[170px]" />
                        <col className="w-[140px]" />
                        <col className="w-[150px]" />
                      </colgroup>
                      <thead className="sticky top-0 z-20">
                        <tr className="border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm">
                          <th className="sticky left-0 z-30 border-r border-slate-200 bg-slate-50/90 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Siswa
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Kategori</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Poin</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Tanggal</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Pelapor</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</th>
                          <th className="sticky right-0 z-30 border-l border-slate-200 bg-slate-50/90 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-20 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                  <ShieldAlert size={25} />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-700">Tidak ada data pelanggaran</p>
                                <p className="mt-1 max-w-sm text-xs text-slate-400">
                                  Tidak ditemukan kasus yang sesuai dengan pencarian atau filter.
                                </p>
                                {(search || activeFilterCount > 0) && (
                                  <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                                  >
                                    Reset pencarian
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filtered.map((item, index) => {
                            const sConfig = statusConfig[item.status];
                            const StatusIcon = sConfig.icon;
                            const tConfig = tingkatConfig[item.tingkat];
                            const isDeleting = deletingId === item.id;

                            return (
                              <tr
                                key={item.id}
                                className={`group border-b border-slate-100 align-top transition hover:bg-blue-50/40 ${
                                  index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                                }`}
                              >
                                <td className="sticky left-0 z-10 border-r border-slate-100 bg-inherit px-4 py-3">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                      <User size={17} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate font-semibold text-slate-900">{item.namaSiswa}</p>
                                      <p className="mt-0.5 text-[11px] text-slate-400">{item.kelas}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="truncate text-slate-700">{item.kategori}</p>
                                  <span className={`mt-1 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${tConfig.bg} ${tConfig.text} ${tConfig.border}`}>
                                    {item.tingkat}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700">
                                    +{item.poin}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <CalendarDays size={13} className="text-slate-400" />
                                    {formatDate(item.tanggal)}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="truncate text-xs text-slate-600">{item.pelapor}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${sConfig.bg} ${sConfig.text} ${sConfig.border}`}>
                                    <StatusIcon size={13} />
                                    {item.status}
                                  </span>
                                </td>
                                <td className="sticky right-0 z-10 border-l border-slate-100 bg-inherit px-3 py-3">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedItem(item)}
                                      title="Lihat detail"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Eye size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openEditForm(item)}
                                      title="Edit data"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                    >
                                      <Edit size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      onClick={() => handleDelete(item)}
                                      title="Hapus data"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filtered.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                      <span>Menampilkan <strong className="text-slate-600">{filtered.length}</strong> kasus</span>
                    </div>
                  )}
                </section>

                <div className="pb-4 text-center text-[11px] text-slate-400">
                  © 2026 SmartSchool • Bimbingan & Konseling
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">Detail Pelanggaran</h3>
                  <p className="truncate text-xs text-slate-400">{selectedItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Nama Siswa</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.namaSiswa}</div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <GraduationCap size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Kelas</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.kelas}</div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Tag size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Kategori</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.kategori}</div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Gauge size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tingkat & Poin</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      {selectedItem.tingkat} • +{selectedItem.poin} poin
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <CalendarDays size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tanggal Kejadian</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{formatDate(selectedItem.tanggal)}</div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <UserCheck size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pelapor</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.pelapor}</div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Deskripsi Kejadian</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">{selectedItem.deskripsi}</div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tindakan / Sanksi</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">
                    {selectedItem.tindakan || "Belum ada tindakan."}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = selectedItem;
                  setSelectedItem(null);
                  openEditForm(item);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Edit size={15} />
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FORM MODAL
      ===================================================== */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {editingId ? "Edit Pelanggaran" : "Catat Pelanggaran Baru"}
                  </h3>
                  <p className="truncate text-xs text-slate-400">
                    {editingId ? "Perbarui informasi kasus" : "Isi data pelanggaran siswa"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nama Siswa *</label>
                  <input
                    type="text"
                    value={form.namaSiswa}
                    onChange={(e) => updateForm("namaSiswa", e.target.value)}
                    placeholder="Contoh: Reza Firmansyah"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.namaSiswa ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.namaSiswa && <p className="mt-1 text-xs text-rose-600">{formErrors.namaSiswa}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Kelas *</label>
                  <input
                    type="text"
                    value={form.kelas}
                    onChange={(e) => updateForm("kelas", e.target.value)}
                    placeholder="Contoh: X IPA 3"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.kelas ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.kelas && <p className="mt-1 text-xs text-rose-600">{formErrors.kelas}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Kategori Pelanggaran</label>
                  <select
                    value={form.kategori}
                    onChange={(e) => updateForm("kategori", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {KATEGORI_LIST.map((k) => (
                      <option key={k.nama} value={k.nama}>
                        {k.nama} ({k.tingkat} • +{k.poin} poin)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tanggal Kejadian *</label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => updateForm("tanggal", e.target.value)}
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.tanggal ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.tanggal && <p className="mt-1 text-xs text-rose-600">{formErrors.tanggal}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Pelapor</label>
                  <select
                    value={form.pelapor}
                    onChange={(e) => updateForm("pelapor", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {PELAPOR_LIST.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Deskripsi Kejadian *</label>
                  <textarea
                    value={form.deskripsi}
                    onChange={(e) => updateForm("deskripsi", e.target.value)}
                    rows={3}
                    placeholder="Ceritakan kronologi kejadian secara singkat..."
                    className={`w-full resize-none rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.deskripsi ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.deskripsi && <p className="mt-1 text-xs text-rose-600">{formErrors.deskripsi}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tindakan / Sanksi</label>
                  <textarea
                    value={form.tindakan}
                    onChange={(e) => updateForm("tindakan", e.target.value)}
                    rows={2}
                    placeholder="Tindakan yang sudah atau akan diberikan..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status Penanganan</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {STATUS_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {editingId ? "Simpan Perubahan" : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}