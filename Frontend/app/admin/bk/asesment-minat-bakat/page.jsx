"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  BrainCircuit,
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
  Loader2,
  Save,
  UserCheck,
  Sparkles,
  Award,
  Compass,
} from "lucide-react";

// =====================================================
// DUMMY DATA
// =====================================================

const JENIS_ASESMEN = ["Minat Bakat (RIASEC)", "Kepribadian (MBTI)", "Kecerdasan Majemuk", "Minat Karir"];

const PENGUJI_LIST = [
  "Ratna Wulandari, S.Psi.",
  "Dra. Siti Rahayu, M.Pd.",
  "Ahmad Fauzi, M.Pd.",
];

const initialAsesmen = [
  {
    id: "AS-0001",
    namaSiswa: "Clarissa Amelia Putri",
    kelas: "X IPA 2",
    jenis: "Minat Bakat (RIASEC)",
    tanggal: "2026-09-01",
    penguji: "Ratna Wulandari, S.Psi.",
    hasilDominan: "Investigative & Artistic",
    skor: 88,
    rekomendasi: "Cocok untuk bidang riset, desain, atau sains terapan. Disarankan eksplorasi jurusan Teknik/Desain.",
  },
  {
    id: "AS-0002",
    namaSiswa: "Yusuf Ibrahim",
    kelas: "XI IPS 1",
    jenis: "Minat Karir",
    tanggal: "2026-09-03",
    penguji: "Ahmad Fauzi, M.Pd.",
    hasilDominan: "Bisnis & Kewirausahaan",
    skor: 82,
    rekomendasi: "Menunjukkan minat kuat pada manajemen dan komunikasi, cocok untuk jurusan Ekonomi/Manajemen.",
  },
  {
    id: "AS-0003",
    namaSiswa: "Putri Anjani Maharani",
    kelas: "X MIPA 1",
    jenis: "Kepribadian (MBTI)",
    tanggal: "2026-09-05",
    penguji: "Dra. Siti Rahayu, M.Pd.",
    hasilDominan: "INFJ - The Advocate",
    skor: 90,
    rekomendasi: "Cenderung empatik dan idealis, potensial di bidang psikologi, konseling, atau pendidikan.",
  },
  {
    id: "AS-0004",
    namaSiswa: "Galih Pratama Putra",
    kelas: "XII TKJ 2",
    jenis: "Kecerdasan Majemuk",
    tanggal: "2026-09-06",
    penguji: "Ratna Wulandari, S.Psi.",
    hasilDominan: "Logis-Matematis & Spasial",
    skor: 85,
    rekomendasi: "Sangat kuat dalam pemecahan masalah teknis, disarankan lanjut ke bidang Teknik/Informatika.",
  },
  {
    id: "AS-0005",
    namaSiswa: "Zahra Aulia Ramadhani",
    kelas: "XI IPA 3",
    jenis: "Minat Bakat (RIASEC)",
    tanggal: "2026-09-08",
    penguji: "Ahmad Fauzi, M.Pd.",
    hasilDominan: "Social & Enterprising",
    skor: 79,
    rekomendasi: "Memiliki potensi kepemimpinan dan kepedulian sosial, cocok bidang Hukum, HI, atau Pendidikan.",
  },
  {
    id: "AS-0006",
    namaSiswa: "Aditya Wira Kusuma",
    kelas: "X IPS 2",
    jenis: "Minat Karir",
    tanggal: "2026-09-09",
    penguji: "Dra. Siti Rahayu, M.Pd.",
    hasilDominan: "Belum terpetakan",
    skor: 0,
    rekomendasi: "",
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

function getSkorConfig(skor) {
  const value = Number(skor) || 0;
  if (value <= 0) return { label: "Belum ada skor", bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", bar: "bg-slate-300" };
  if (value >= 85) return { label: "Sangat Tinggi", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", bar: "bg-emerald-500" };
  if (value >= 70) return { label: "Tinggi", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", bar: "bg-blue-500" };
  return { label: "Cukup", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", bar: "bg-amber-500" };
}

const emptyForm = {
  namaSiswa: "",
  kelas: "",
  jenis: JENIS_ASESMEN[0],
  tanggal: "",
  penguji: PENGUJI_LIST[0],
  hasilDominan: "",
  skor: "",
  rekomendasi: "",
};

// =====================================================
// MAIN
// =====================================================

export default function AsesmenMinatBakatPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed((c) => !c);

  const [dataList, setDataList] = useState(initialAsesmen);

  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("Semua");
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
          item.hasilDominan.toLowerCase().includes(keyword);

        const matchJenis = jenisFilter === "Semua" || item.jenis === jenisFilter;

        return matchSearch && matchJenis;
      })
      .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
  }, [dataList, search, jenisFilter]);

  // ===================================================
  // STATISTICS
  // ===================================================

  const total = dataList.length;
  const sudahDinilai = dataList.filter((d) => Number(d.skor) > 0).length;
  const belumDinilai = total - sudahDinilai;
  const rataSkor = sudahDinilai > 0
    ? Math.round(dataList.reduce((sum, d) => sum + (Number(d.skor) || 0), 0) / sudahDinilai)
    : 0;

  const handleResetFilter = () => {
    setSearch("");
    setJenisFilter("Semua");
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
      jenis: item.jenis,
      tanggal: item.tanggal,
      penguji: item.penguji,
      hasilDominan: item.hasilDominan,
      skor: item.skor,
      rekomendasi: item.rekomendasi,
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
    if (form.skor !== "" && (Number(form.skor) < 0 || Number(form.skor) > 100)) {
      errors.skor = "Skor harus antara 0-100";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    setTimeout(() => {
      const payload = { ...form, skor: form.skor === "" ? 0 : Number(form.skor) };

      if (editingId) {
        setDataList((current) => current.map((item) => (item.id === editingId ? { ...item, ...payload } : item)));
      } else {
        const newId = `AS-${String(dataList.length + 1).padStart(4, "0")}`;
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
    const confirmed = window.confirm(`Yakin ingin menghapus hasil asesmen "${item.namaSiswa}" (${item.jenis})?`);
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
        <Sidebar active="asesmen" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
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
                  <span className="font-medium text-slate-700">Asesmen & Minat Bakat Siswa</span>
                </div>

                {/* PAGE HEADER */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <BrainCircuit size={23} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                            Asesmen & Minat Bakat Siswa
                          </h1>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                            BK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Rekam hasil tes minat, bakat, dan kepribadian siswa beserta rekomendasi arah.
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
                        Tambah Hasil Asesmen
                      </button>
                    </div>
                  </div>
                </section>

                {/* STATISTICS */}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Asesmen</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{total}</p>
                        <p className="mt-1 text-xs text-slate-400">Seluruh periode</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ClipboardList2 />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Sudah Dinilai</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">{sudahDinilai}</p>
                        <p className="mt-1 text-xs text-slate-400">Skor tersedia</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Award size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Belum Dinilai</p>
                        <p className="mt-2 text-2xl font-bold text-amber-600">{belumDinilai}</p>
                        <p className="mt-1 text-xs text-slate-400">Menunggu hasil</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Compass size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Rata-rata Skor</p>
                        <p className="mt-2 text-2xl font-bold text-indigo-600">{rataSkor}</p>
                        <p className="mt-1 text-xs text-slate-400">Dari siswa ternilai</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Sparkles size={19} />
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
                          placeholder="Cari nama siswa, kelas, atau hasil dominan..."
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFilter((c) => !c)}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                          showFilter || jenisFilter !== "Semua"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Filter size={17} />
                        Filter
                        {jenisFilter !== "Semua" && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                            1
                          </span>
                        )}
                      </button>
                    </div>

                    {showFilter && (
                      <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Jenis Asesmen</label>
                          <select
                            value={jenisFilter}
                            onChange={(e) => setJenisFilter(e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="Semua">Semua Jenis</option>
                            {JENIS_ASESMEN.map((j) => (
                              <option key={j} value={j}>{j}</option>
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
                      <h2 className="text-base font-bold text-slate-900">Daftar Hasil Asesmen</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> dari{" "}
                        <span className="font-semibold text-slate-700">{dataList.length}</span> hasil
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-460px)] min-h-[300px] overflow-auto">
                    <table className="w-full min-w-[920px] table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="w-[230px]" />
                        <col className="w-[170px]" />
                        <col className="w-[120px]" />
                        <col className="w-auto" />
                        <col className="w-[160px]" />
                        <col className="w-[150px]" />
                      </colgroup>
                      <thead className="sticky top-0 z-20">
                        <tr className="border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm">
                          <th className="sticky left-0 z-30 border-r border-slate-200 bg-slate-50/90 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Siswa
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Jenis Asesmen</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Tanggal</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Hasil Dominan</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Skor</th>
                          <th className="sticky right-0 z-30 border-l border-slate-200 bg-slate-50/90 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-20 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                  <BrainCircuit size={25} />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-700">Tidak ada hasil asesmen</p>
                                <p className="mt-1 max-w-sm text-xs text-slate-400">
                                  Tidak ditemukan data yang sesuai dengan pencarian atau filter.
                                </p>
                                {(search || jenisFilter !== "Semua") && (
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
                            const skorConfig = getSkorConfig(item.skor);
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
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                      <User size={17} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate font-semibold text-slate-900">{item.namaSiswa}</p>
                                      <p className="mt-0.5 text-[11px] text-slate-400">{item.kelas}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1.5 truncate rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                                    <Tag size={12} className="flex-shrink-0" />
                                    <span className="truncate">{item.jenis}</span>
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <CalendarDays size={13} className="text-slate-400" />
                                    {formatDate(item.tanggal)}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="truncate font-medium text-slate-700">{item.hasilDominan}</p>
                                  <p className="mt-0.5 truncate text-[11px] text-slate-400">Penguji: {item.penguji}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-bold ${skorConfig.bg} ${skorConfig.text} ${skorConfig.border}`}>
                                      {Number(item.skor) > 0 ? item.skor : "-"}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{skorConfig.label}</span>
                                  </div>
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
                                      title="Edit hasil"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                    >
                                      <Edit size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      onClick={() => handleDelete(item)}
                                      title="Hapus hasil"
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
                      <span>Menampilkan <strong className="text-slate-600">{filtered.length}</strong> hasil</span>
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
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BrainCircuit size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">Detail Hasil Asesmen</h3>
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
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Jenis Asesmen</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.jenis}</div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <CalendarDays size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tanggal Pelaksanaan</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{formatDate(selectedItem.tanggal)}</div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <UserCheck size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Penguji</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.penguji}</div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Award size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Skor</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      {Number(selectedItem.skor) > 0 ? selectedItem.skor : "Belum dinilai"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <Sparkles size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Hasil Dominan</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.hasilDominan}</div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Rekomendasi</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">
                    {selectedItem.rekomendasi || "Belum ada rekomendasi."}
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
                Edit Hasil
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
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BrainCircuit size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {editingId ? "Edit Hasil Asesmen" : "Tambah Hasil Asesmen"}
                  </h3>
                  <p className="truncate text-xs text-slate-400">
                    {editingId ? "Perbarui hasil asesmen siswa" : "Isi data hasil asesmen baru"}
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
                    placeholder="Contoh: Clarissa Amelia Putri"
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
                    placeholder="Contoh: X IPA 2"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.kelas ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.kelas && <p className="mt-1 text-xs text-rose-600">{formErrors.kelas}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Jenis Asesmen</label>
                  <select
                    value={form.jenis}
                    onChange={(e) => updateForm("jenis", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {JENIS_ASESMEN.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tanggal Pelaksanaan *</label>
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
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Penguji</label>
                  <select
                    value={form.penguji}
                    onChange={(e) => updateForm("penguji", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {PENGUJI_LIST.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Skor (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.skor}
                    onChange={(e) => updateForm("skor", e.target.value)}
                    placeholder="Contoh: 88"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.skor ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.skor && <p className="mt-1 text-xs text-rose-600">{formErrors.skor}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Hasil Dominan</label>
                  <input
                    type="text"
                    value={form.hasilDominan}
                    onChange={(e) => updateForm("hasilDominan", e.target.value)}
                    placeholder="Contoh: Investigative & Artistic"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Rekomendasi</label>
                  <textarea
                    value={form.rekomendasi}
                    onChange={(e) => updateForm("rekomendasi", e.target.value)}
                    rows={3}
                    placeholder="Rekomendasi arah minat/jurusan/karir untuk siswa..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
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
                {editingId ? "Simpan Perubahan" : "Simpan Hasil"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ClipboardList2() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h6" />
    </svg>
  );
}