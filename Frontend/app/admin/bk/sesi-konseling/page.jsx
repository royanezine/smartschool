"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  HeartHandshake,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Eye,
  X,
  CalendarDays,
  Clock3,
  User,
  GraduationCap,
  Tag,
  FileText,
  CheckCircle2,
  Circle,
  XCircle,
  Loader2,
  ClipboardList,
  Save,
} from "lucide-react";

// =====================================================
// DUMMY DATA
// =====================================================

const KONSELOR_LIST = [
  "Dra. Siti Rahayu, M.Pd.",
  "Bambang Kurniawan, S.Pd.",
  "Ratna Wulandari, S.Psi.",
  "Ahmad Fauzi, M.Pd.",
];

const JENIS_KONSELING = ["Akademik", "Pribadi", "Sosial", "Karir"];

const STATUS_LIST = ["Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"];

const initialSesi = [
  {
    id: "SK-0001",
    namaSiswa: "Muhammad Rizky Pratama",
    kelas: "XI IPA 2",
    konselor: "Dra. Siti Rahayu, M.Pd.",
    tanggal: "2026-09-08",
    waktu: "09:00",
    jenis: "Akademik",
    topik: "Kesulitan mengikuti pelajaran Matematika",
    catatan:
      "Siswa merasa tertinggal materi trigonometri sejak absen 1 minggu karena sakit. Sudah diberikan jadwal bimbingan tambahan bersama guru mapel.",
    tindakLanjut: "Pantau nilai ulangan harian berikutnya, evaluasi 2 minggu ke depan.",
    status: "Selesai",
  },
  {
    id: "SK-0002",
    namaSiswa: "Ayu Lestari Wijaya",
    kelas: "X IPS 1",
    konselor: "Ratna Wulandari, S.Psi.",
    tanggal: "2026-09-09",
    waktu: "10:30",
    jenis: "Pribadi",
    topik: "Kesulitan menyesuaikan diri di lingkungan baru",
    catatan: "Siswa pindahan dari luar kota, masih menutup diri dari teman sekelas.",
    tindakLanjut: "Libatkan dalam kegiatan ekstrakurikuler, sesi lanjutan minggu depan.",
    status: "Terjadwal",
  },
  {
    id: "SK-0003",
    namaSiswa: "Farhan Maulana",
    kelas: "XII IPA 1",
    konselor: "Ahmad Fauzi, M.Pd.",
    tanggal: "2026-09-09",
    waktu: "13:00",
    jenis: "Karir",
    topik: "Bimbingan pemilihan jurusan kuliah",
    catatan: "Siswa masih ragu antara Teknik Informatika dan Kedokteran.",
    tindakLanjut: "Sarankan ikut tes minat bakat lanjutan sebelum sesi berikutnya.",
    status: "Berlangsung",
  },
  {
    id: "SK-0004",
    namaSiswa: "Nabila Putri Anggraini",
    kelas: "XI IPS 3",
    konselor: "Bambang Kurniawan, S.Pd.",
    tanggal: "2026-09-07",
    waktu: "08:00",
    jenis: "Sosial",
    topik: "Konflik pertemanan di kelas",
    catatan: "Terjadi kesalahpahaman dengan teman satu kelompok tugas.",
    tindakLanjut: "Sudah dimediasi, kedua pihak sepakat berbaikan.",
    status: "Selesai",
  },
  {
    id: "SK-0005",
    namaSiswa: "Dimas Aditya Nugroho",
    kelas: "X MIPA 4",
    konselor: "Dra. Siti Rahayu, M.Pd.",
    tanggal: "2026-09-10",
    waktu: "11:00",
    jenis: "Akademik",
    topik: "Menurunnya motivasi belajar",
    catatan: "Nilai rapor menurun signifikan dari semester sebelumnya.",
    tindakLanjut: "",
    status: "Terjadwal",
  },
  {
    id: "SK-0006",
    namaSiswa: "Salsabila Zahra",
    kelas: "XII IPS 2",
    konselor: "Ratna Wulandari, S.Psi.",
    tanggal: "2026-09-06",
    waktu: "14:00",
    jenis: "Pribadi",
    topik: "Kecemasan menghadapi ujian akhir",
    catatan: "Siswa menunjukkan gejala kecemasan berlebih menjelang ujian.",
    tindakLanjut: "Ajarkan teknik relaksasi, jadwalkan sesi mingguan hingga UAS selesai.",
    status: "Dibatalkan",
  },
];

// =====================================================
// HELPER
// =====================================================

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const statusConfig = {
  Terjadwal: {
    icon: Circle,
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  Berlangsung: {
    icon: Clock3,
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  Selesai: {
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  Dibatalkan: {
    icon: XCircle,
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
};

const emptyForm = {
  namaSiswa: "",
  kelas: "",
  konselor: KONSELOR_LIST[0],
  tanggal: "",
  waktu: "",
  jenis: JENIS_KONSELING[0],
  topik: "",
  catatan: "",
  tindakLanjut: "",
  status: "Terjadwal",
};

// =====================================================
// MAIN
// =====================================================

export default function SesiKonselingSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed((c) => !c);

  const [sesiList, setSesiList] = useState(initialSesi);

  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [konselorFilter, setKonselorFilter] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedSesi, setSelectedSesi] = useState(null);
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

    return sesiList
      .filter((item) => {
        const matchSearch =
          !keyword ||
          item.namaSiswa.toLowerCase().includes(keyword) ||
          item.kelas.toLowerCase().includes(keyword) ||
          item.topik.toLowerCase().includes(keyword) ||
          item.konselor.toLowerCase().includes(keyword);

        const matchJenis = jenisFilter === "Semua" || item.jenis === jenisFilter;
        const matchStatus = statusFilter === "Semua" || item.status === statusFilter;
        const matchKonselor = konselorFilter === "Semua" || item.konselor === konselorFilter;

        return matchSearch && matchJenis && matchStatus && matchKonselor;
      })
      .sort((a, b) => (a.tanggal + a.waktu < b.tanggal + b.waktu ? 1 : -1));
  }, [sesiList, search, jenisFilter, statusFilter, konselorFilter]);

  const activeFilterCount = [
    jenisFilter !== "Semua",
    statusFilter !== "Semua",
    konselorFilter !== "Semua",
  ].filter(Boolean).length;

  // ===================================================
  // STATISTICS
  // ===================================================

  const total = sesiList.length;
  const terjadwal = sesiList.filter((s) => s.status === "Terjadwal").length;
  const selesai = sesiList.filter((s) => s.status === "Selesai").length;
  const dibatalkan = sesiList.filter((s) => s.status === "Dibatalkan").length;

  // ===================================================
  // RESET FILTER
  // ===================================================

  const handleResetFilter = () => {
    setSearch("");
    setJenisFilter("Semua");
    setStatusFilter("Semua");
    setKonselorFilter("Semua");
  };

  // ===================================================
  // FORM
  // ===================================================

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
      konselor: item.konselor,
      tanggal: item.tanggal,
      waktu: item.waktu,
      jenis: item.jenis,
      topik: item.topik,
      catatan: item.catatan,
      tindakLanjut: item.tindakLanjut,
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

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.namaSiswa.trim()) errors.namaSiswa = "Nama siswa wajib diisi";
    if (!form.kelas.trim()) errors.kelas = "Kelas wajib diisi";
    if (!form.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!form.waktu) errors.waktu = "Waktu wajib diisi";
    if (!form.topik.trim()) errors.topik = "Topik wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    // Simulasi proses simpan ke server dengan dummy data
    setTimeout(() => {
      if (editingId) {
        setSesiList((current) =>
          current.map((item) => (item.id === editingId ? { ...item, ...form } : item))
        );
      } else {
        const newId = `SK-${String(sesiList.length + 1).padStart(4, "0")}`;
        setSesiList((current) => [{ id: newId, ...form }, ...current]);
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
    const confirmed = window.confirm(
      `Yakin ingin menghapus sesi konseling "${item.namaSiswa}" (${item.topik})?`
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setTimeout(() => {
      setSesiList((current) => current.filter((s) => s.id !== item.id));
      if (selectedSesi?.id === item.id) setSelectedSesi(null);
      setDeletingId(null);
    }, 400);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="fixed inset-y-0 left-0 z-[60]">
        <Sidebar active="konseling" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
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
                  <span className="font-medium text-slate-700">Sesi Konseling Siswa</span>
                </div>

                {/* PAGE HEADER */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <HeartHandshake size={23} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                            Sesi Konseling Siswa
                          </h1>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                            BK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Kelola jadwal, catatan, dan tindak lanjut sesi konseling siswa.
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
                        Jadwalkan Sesi
                      </button>
                    </div>
                  </div>
                </section>

                {/* STATISTICS */}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Sesi</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{total}</p>
                        <p className="mt-1 text-xs text-slate-400">Seluruh periode</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ClipboardList size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Terjadwal</p>
                        <p className="mt-2 text-2xl font-bold text-blue-600">{terjadwal}</p>
                        <p className="mt-1 text-xs text-slate-400">Belum dimulai</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Circle size={19} />
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
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Dibatalkan</p>
                        <p className="mt-2 text-2xl font-bold text-rose-600">{dibatalkan}</p>
                        <p className="mt-1 text-xs text-slate-400">Tidak terlaksana</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <XCircle size={19} />
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
                          placeholder="Cari nama siswa, kelas, topik, atau konselor..."
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
                      <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Jenis Konseling</label>
                          <select
                            value={jenisFilter}
                            onChange={(e) => setJenisFilter(e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="Semua">Semua Jenis</option>
                            {JENIS_KONSELING.map((j) => (
                              <option key={j} value={j}>{j}</option>
                            ))}
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
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Konselor</label>
                          <select
                            value={konselorFilter}
                            onChange={(e) => setKonselorFilter(e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="Semua">Semua Konselor</option>
                            {KONSELOR_LIST.map((k) => (
                              <option key={k} value={k}>{k}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-3">
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
                      <h2 className="text-base font-bold text-slate-900">Daftar Sesi Konseling</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> dari{" "}
                        <span className="font-semibold text-slate-700">{sesiList.length}</span> sesi
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-460px)] min-h-[300px] overflow-auto">
                    <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="w-[240px]" />
                        <col className="w-[180px]" />
                        <col className="w-[150px]" />
                        <col className="w-[130px]" />
                        <col className="w-auto" />
                        <col className="w-[130px]" />
                        <col className="w-[150px]" />
                      </colgroup>
                      <thead className="sticky top-0 z-20">
                        <tr className="border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm">
                          <th className="sticky left-0 z-30 border-r border-slate-200 bg-slate-50/90 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Siswa
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Konselor</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Jadwal</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Jenis</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Topik</th>
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
                                  <HeartHandshake size={25} />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-700">Tidak ada sesi konseling</p>
                                <p className="mt-1 max-w-sm text-xs text-slate-400">
                                  Tidak ditemukan sesi yang sesuai dengan pencarian atau filter.
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
                            const config = statusConfig[item.status];
                            const StatusIcon = config.icon;
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
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                      <User size={17} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate font-semibold text-slate-900">{item.namaSiswa}</p>
                                      <p className="mt-0.5 text-[11px] text-slate-400">{item.kelas}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="truncate text-slate-700">{item.konselor}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <CalendarDays size={13} className="text-slate-400" />
                                    {formatDate(item.tanggal)}
                                  </div>
                                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                    <Clock3 size={13} />
                                    {item.waktu} WIB
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700">
                                    <Tag size={12} />
                                    {item.jenis}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="truncate text-slate-700">{item.topik}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}>
                                    <StatusIcon size={13} />
                                    {item.status}
                                  </span>
                                </td>
                                <td className="sticky right-0 z-10 border-l border-slate-100 bg-inherit px-3 py-3">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSesi(item)}
                                      title="Lihat detail"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Eye size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openEditForm(item)}
                                      title="Edit sesi"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                    >
                                      <Edit size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      onClick={() => handleDelete(item)}
                                      title="Hapus sesi"
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
                      <span>Menampilkan <strong className="text-slate-600">{filtered.length}</strong> sesi</span>
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
      {selectedSesi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <HeartHandshake size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">Detail Sesi Konseling</h3>
                  <p className="truncate text-xs text-slate-400">{selectedSesi.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSesi(null)}
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
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      {selectedSesi.namaSiswa}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <GraduationCap size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Kelas</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      {selectedSesi.kelas}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Konselor</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      {selectedSesi.konselor}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Tag size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Jenis Konseling</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      {selectedSesi.jenis}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <CalendarDays size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tanggal & Waktu</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      {formatDate(selectedSesi.tanggal)} • {selectedSesi.waktu} WIB
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      {selectedSesi.status}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Topik</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                    {selectedSesi.topik}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Catatan Konseling</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">
                    {selectedSesi.catatan || "Belum ada catatan."}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <ClipboardList size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tindak Lanjut</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">
                    {selectedSesi.tindakLanjut || "Belum ada tindak lanjut."}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedSesi(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = selectedSesi;
                  setSelectedSesi(null);
                  openEditForm(item);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Edit size={15} />
                Edit Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FORM MODAL (TAMBAH / EDIT)
      ===================================================== */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <HeartHandshake size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {editingId ? "Edit Sesi Konseling" : "Jadwalkan Sesi Konseling"}
                  </h3>
                  <p className="truncate text-xs text-slate-400">
                    {editingId ? "Perbarui informasi sesi" : "Isi data sesi konseling baru"}
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
                    placeholder="Contoh: Muhammad Rizky Pratama"
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
                    placeholder="Contoh: XI IPA 2"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.kelas ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.kelas && <p className="mt-1 text-xs text-rose-600">{formErrors.kelas}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Konselor</label>
                  <select
                    value={form.konselor}
                    onChange={(e) => updateForm("konselor", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {KONSELOR_LIST.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Jenis Konseling</label>
                  <select
                    value={form.jenis}
                    onChange={(e) => updateForm("jenis", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {JENIS_KONSELING.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tanggal *</label>
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
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Waktu *</label>
                  <input
                    type="time"
                    value={form.waktu}
                    onChange={(e) => updateForm("waktu", e.target.value)}
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.waktu ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.waktu && <p className="mt-1 text-xs text-rose-600">{formErrors.waktu}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Topik *</label>
                  <input
                    type="text"
                    value={form.topik}
                    onChange={(e) => updateForm("topik", e.target.value)}
                    placeholder="Contoh: Kesulitan mengikuti pelajaran Matematika"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.topik ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.topik && <p className="mt-1 text-xs text-rose-600">{formErrors.topik}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Catatan Konseling</label>
                  <textarea
                    value={form.catatan}
                    onChange={(e) => updateForm("catatan", e.target.value)}
                    rows={3}
                    placeholder="Tuliskan ringkasan hasil konseling..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tindak Lanjut</label>
                  <textarea
                    value={form.tindakLanjut}
                    onChange={(e) => updateForm("tindakLanjut", e.target.value)}
                    rows={2}
                    placeholder="Rencana tindak lanjut untuk siswa..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label>
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
                {editingId ? "Simpan Perubahan" : "Simpan Sesi"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}