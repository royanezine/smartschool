"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  Tags,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Eye,
  X,
  Gauge,
  FileText,
  ClipboardList,
  Loader2,
  Save,
  Layers,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";

// =====================================================
// DUMMY DATA
// =====================================================

const TINGKAT_LIST = ["Ringan", "Sedang", "Berat"];

const initialKategori = [
  {
    id: "KP-001",
    kode: "PL-R01",
    nama: "Terlambat masuk sekolah",
    tingkat: "Ringan",
    poin: 5,
    deskripsi: "Siswa datang setelah bel masuk berbunyi tanpa surat keterangan yang sah.",
    sanksi: "Teguran lisan dan dicatat pada buku pelanggaran.",
  },
  {
    id: "KP-002",
    kode: "PL-R02",
    nama: "Atribut seragam tidak lengkap",
    tingkat: "Ringan",
    poin: 5,
    deskripsi: "Tidak memakai kelengkapan seragam sesuai jadwal (dasi, topi, badge, dsb).",
    sanksi: "Teguran lisan, atribut dipinjamkan sementara jika tersedia.",
  },
  {
    id: "KP-003",
    kode: "PL-R03",
    nama: "Menggunakan HP saat pelajaran",
    tingkat: "Ringan",
    poin: 5,
    deskripsi: "Menggunakan ponsel tanpa izin guru selama kegiatan belajar mengajar.",
    sanksi: "HP disita sementara, dikembalikan pada akhir jam sekolah.",
  },
  {
    id: "KP-004",
    kode: "PL-R04",
    nama: "Tidak mengerjakan tugas",
    tingkat: "Ringan",
    poin: 5,
    deskripsi: "Tidak mengumpulkan tugas sesuai tenggat waktu tanpa alasan yang jelas.",
    sanksi: "Diberi kesempatan susulan dengan pengurangan nilai.",
  },
  {
    id: "KP-005",
    kode: "PL-S01",
    nama: "Membolos jam pelajaran",
    tingkat: "Sedang",
    poin: 15,
    deskripsi: "Tidak mengikuti salah satu atau lebih jam pelajaran tanpa keterangan.",
    sanksi: "Panggilan orang tua, surat pernyataan tertulis.",
  },
  {
    id: "KP-006",
    kode: "PL-S02",
    nama: "Mencontek saat ujian",
    tingkat: "Sedang",
    poin: 20,
    deskripsi: "Kedapatan menyontek atau membantu menyontek saat ulangan/ujian berlangsung.",
    sanksi: "Nilai ujian dibatalkan, ujian susulan dengan pengawasan ketat.",
  },
  {
    id: "KP-007",
    kode: "PL-B01",
    nama: "Merokok di lingkungan sekolah",
    tingkat: "Berat",
    poin: 50,
    deskripsi: "Merokok di dalam area sekolah maupun saat mengenakan seragam sekolah.",
    sanksi: "Panggilan orang tua, surat perjanjian, skorsing bila terulang.",
  },
  {
    id: "KP-008",
    kode: "PL-B02",
    nama: "Berkelahi dengan siswa lain",
    tingkat: "Berat",
    poin: 75,
    deskripsi: "Terlibat perkelahian fisik dengan siswa lain di lingkungan sekolah.",
    sanksi: "Skorsing 3-5 hari, mediasi dengan pihak terkait, surat perjanjian.",
  },
  {
    id: "KP-009",
    kode: "PL-B03",
    nama: "Membawa barang terlarang",
    tingkat: "Berat",
    poin: 100,
    deskripsi: "Membawa senjata tajam, minuman keras, atau barang terlarang lain ke sekolah.",
    sanksi: "Skorsing, pemanggilan orang tua, kemungkinan dikeluarkan.",
  },
];

// =====================================================
// HELPER
// =====================================================

const tingkatConfig = {
  Ringan: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: ShieldCheck },
  Sedang: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: ShieldAlert },
  Berat: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", icon: ShieldX },
};

const emptyForm = {
  kode: "",
  nama: "",
  tingkat: "Ringan",
  poin: 5,
  deskripsi: "",
  sanksi: "",
};

// =====================================================
// MAIN
// =====================================================

export default function KategoriPointPelanggaranPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed((c) => !c);

  const [dataList, setDataList] = useState(initialKategori);

  const [search, setSearch] = useState("");
  const [tingkatFilter, setTingkatFilter] = useState("Semua");
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
          item.nama.toLowerCase().includes(keyword) ||
          item.kode.toLowerCase().includes(keyword);

        const matchTingkat = tingkatFilter === "Semua" || item.tingkat === tingkatFilter;

        return matchSearch && matchTingkat;
      })
      .sort((a, b) => a.kode.localeCompare(b.kode));
  }, [dataList, search, tingkatFilter]);

  // ===================================================
  // STATISTICS
  // ===================================================

  const total = dataList.length;
  const ringan = dataList.filter((d) => d.tingkat === "Ringan").length;
  const sedang = dataList.filter((d) => d.tingkat === "Sedang").length;
  const berat = dataList.filter((d) => d.tingkat === "Berat").length;

  const handleResetFilter = () => {
    setSearch("");
    setTingkatFilter("Semua");
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
      kode: item.kode,
      nama: item.nama,
      tingkat: item.tingkat,
      poin: item.poin,
      deskripsi: item.deskripsi,
      sanksi: item.sanksi,
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
    if (!form.kode.trim()) errors.kode = "Kode wajib diisi";
    if (!form.nama.trim()) errors.nama = "Nama kategori wajib diisi";
    if (!form.poin || Number(form.poin) <= 0) errors.poin = "Poin harus lebih dari 0";
    if (!form.deskripsi.trim()) errors.deskripsi = "Deskripsi wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    setTimeout(() => {
      const payload = { ...form, poin: Number(form.poin) };

      if (editingId) {
        setDataList((current) => current.map((item) => (item.id === editingId ? { ...item, ...payload } : item)));
      } else {
        const newId = `KP-${String(dataList.length + 1).padStart(3, "0")}`;
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
    const confirmed = window.confirm(`Yakin ingin menghapus kategori "${item.nama}"? Data pelanggaran yang menggunakan kategori ini tidak akan otomatis berubah.`);
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
        <Sidebar active="kategori-pelanggaran" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
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
                  <span className="font-medium text-slate-700">Kategori & Point Pelanggaran</span>
                </div>

                {/* PAGE HEADER */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <Tags size={23} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                            Kategori & Point Pelanggaran
                          </h1>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                            BK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Kelola master data kategori pelanggaran beserta bobot poin dan sanksinya.
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
                        Tambah Kategori
                      </button>
                    </div>
                  </div>
                </section>

                {/* STATISTICS */}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Kategori</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{total}</p>
                        <p className="mt-1 text-xs text-slate-400">Master data aktif</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Layers size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Ringan</p>
                        <p className="mt-2 text-2xl font-bold text-blue-600">{ringan}</p>
                        <p className="mt-1 text-xs text-slate-400">Kategori tingkat ringan</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ShieldCheck size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Sedang</p>
                        <p className="mt-2 text-2xl font-bold text-amber-600">{sedang}</p>
                        <p className="mt-1 text-xs text-slate-400">Kategori tingkat sedang</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <ShieldAlert size={19} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Berat</p>
                        <p className="mt-2 text-2xl font-bold text-rose-600">{berat}</p>
                        <p className="mt-1 text-xs text-slate-400">Kategori tingkat berat</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <ShieldX size={19} />
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
                          placeholder="Cari kode atau nama kategori..."
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFilter((c) => !c)}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                          showFilter || tingkatFilter !== "Semua"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Filter size={17} />
                        Filter
                        {tingkatFilter !== "Semua" && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                            1
                          </span>
                        )}
                      </button>
                    </div>

                    {showFilter && (
                      <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Tingkat</label>
                          <select
                            value={tingkatFilter}
                            onChange={(e) => setTingkatFilter(e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="Semua">Semua Tingkat</option>
                            {TINGKAT_LIST.map((t) => (
                              <option key={t} value={t}>{t}</option>
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
                      <h2 className="text-base font-bold text-slate-900">Daftar Kategori Pelanggaran</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> dari{" "}
                        <span className="font-semibold text-slate-700">{dataList.length}</span> kategori
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-460px)] min-h-[300px] overflow-auto">
                    <table className="w-full min-w-[820px] table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="w-[110px]" />
                        <col className="w-auto" />
                        <col className="w-[130px]" />
                        <col className="w-[110px]" />
                        <col className="w-[150px]" />
                      </colgroup>
                      <thead className="sticky top-0 z-20">
                        <tr className="border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm">
                          <th className="sticky left-0 z-30 border-r border-slate-200 bg-slate-50/90 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Kode
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Nama Kategori</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Tingkat</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Poin</th>
                          <th className="sticky right-0 z-30 border-l border-slate-200 bg-slate-50/90 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-20 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                  <Tags size={25} />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-700">Tidak ada kategori</p>
                                <p className="mt-1 max-w-sm text-xs text-slate-400">
                                  Tidak ditemukan kategori yang sesuai dengan pencarian atau filter.
                                </p>
                                {(search || tingkatFilter !== "Semua") && (
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
                            const tConfig = tingkatConfig[item.tingkat];
                            const TingkatIcon = tConfig.icon;
                            const isDeleting = deletingId === item.id;

                            return (
                              <tr
                                key={item.id}
                                className={`group border-b border-slate-100 align-top transition hover:bg-blue-50/40 ${
                                  index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                                }`}
                              >
                                <td className="sticky left-0 z-10 border-r border-slate-100 bg-inherit px-4 py-3">
                                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-600">
                                    {item.kode}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="truncate font-medium text-slate-800">{item.nama}</p>
                                  <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.deskripsi}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${tConfig.bg} ${tConfig.text} ${tConfig.border}`}>
                                    <TingkatIcon size={13} />
                                    {item.tingkat}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700">
                                    +{item.poin}
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
                                      title="Edit kategori"
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                    >
                                      <Edit size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      onClick={() => handleDelete(item)}
                                      title="Hapus kategori"
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
                      <span>Menampilkan <strong className="text-slate-600">{filtered.length}</strong> kategori</span>
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
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Tags size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">Detail Kategori</h3>
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
                      <ClipboardList size={14} className="text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Kode</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.kode}</div>
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
                </div>
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <Tags size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Nama Kategori</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">{selectedItem.nama}</div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Deskripsi</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">{selectedItem.deskripsi}</div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sanksi Standar</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">{selectedItem.sanksi}</div>
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
                Edit Kategori
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
            className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Tags size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
                  </h3>
                  <p className="truncate text-xs text-slate-400">
                    {editingId ? "Perbarui informasi kategori" : "Isi data kategori pelanggaran"}
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
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Kode *</label>
                  <input
                    type="text"
                    value={form.kode}
                    onChange={(e) => updateForm("kode", e.target.value)}
                    placeholder="Contoh: PL-R05"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.kode ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.kode && <p className="mt-1 text-xs text-rose-600">{formErrors.kode}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tingkat</label>
                  <select
                    value={form.tingkat}
                    onChange={(e) => updateForm("tingkat", e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {TINGKAT_LIST.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nama Kategori *</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => updateForm("nama", e.target.value)}
                    placeholder="Contoh: Terlambat masuk sekolah"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.nama ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.nama && <p className="mt-1 text-xs text-rose-600">{formErrors.nama}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Poin *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.poin}
                    onChange={(e) => updateForm("poin", e.target.value)}
                    placeholder="Contoh: 5"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.poin ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.poin && <p className="mt-1 text-xs text-rose-600">{formErrors.poin}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Deskripsi *</label>
                  <textarea
                    value={form.deskripsi}
                    onChange={(e) => updateForm("deskripsi", e.target.value)}
                    rows={3}
                    placeholder="Jelaskan kriteria pelanggaran ini..."
                    className={`w-full resize-none rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      formErrors.deskripsi ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-blue-400"
                    }`}
                  />
                  {formErrors.deskripsi && <p className="mt-1 text-xs text-rose-600">{formErrors.deskripsi}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Sanksi Standar</label>
                  <textarea
                    value={form.sanksi}
                    onChange={(e) => updateForm("sanksi", e.target.value)}
                    rows={2}
                    placeholder="Sanksi yang berlaku untuk kategori ini..."
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
                {editingId ? "Simpan Perubahan" : "Simpan Kategori"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}