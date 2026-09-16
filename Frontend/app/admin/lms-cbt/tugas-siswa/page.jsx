"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  Users,
  FileText,
  CalendarDays,
  BookOpen,
  MoreVertical,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

export default function TugasSiswaPage() {
  const [tugas, setTugas] = useState([
    {
      id: 1,
      judul: "Membuat Website Sederhana",
      mapel: "Pemrograman Web",
      kelas: "XI PPLG 1",
      guru: "Budi Santoso",
      tipe: "Tugas Individu",
      deadline: "2026-09-12",
      waktu: "23:59",
      status: "Published",
      jumlahSiswa: 32,
      dikumpulkan: 24,
      deskripsi:
        "Siswa membuat sebuah website sederhana menggunakan HTML, CSS, dan JavaScript.",
    },
    {
      id: 2,
      judul: "Normalisasi Database",
      mapel: "Basis Data",
      kelas: "XI PPLG 2",
      guru: "Andi Wijaya",
      tipe: "Tugas Individu",
      deadline: "2026-09-15",
      waktu: "20:00",
      status: "Published",
      jumlahSiswa: 30,
      dikumpulkan: 21,
      deskripsi:
        "Mengerjakan latihan normalisasi database dari bentuk tidak normal sampai 3NF.",
    },
    {
      id: 3,
      judul: "Konfigurasi Jaringan LAN",
      mapel: "Jaringan Komputer",
      kelas: "XII TKJ 1",
      guru: "Rina Marlina",
      tipe: "Tugas Kelompok",
      deadline: "2026-09-18",
      waktu: "21:00",
      status: "Published",
      jumlahSiswa: 28,
      dikumpulkan: 18,
      deskripsi:
        "Membuat laporan konfigurasi jaringan LAN beserta dokumentasi praktik.",
    },
    {
      id: 4,
      judul: "Algoritma Percabangan",
      mapel: "Pemrograman Dasar",
      kelas: "X PPLG 1",
      guru: "Dedi Kurniawan",
      tipe: "Tugas Individu",
      deadline: "2026-09-20",
      waktu: "23:59",
      status: "Draft",
      jumlahSiswa: 34,
      dikumpulkan: 0,
      deskripsi:
        "Latihan membuat program menggunakan percabangan if, else if, dan switch.",
    },
    {
      id: 5,
      judul: "Analisis Sistem Informasi",
      mapel: "Analisis Sistem",
      kelas: "XII PPLG 2",
      guru: "Siti Rahma",
      tipe: "Tugas Individu",
      deadline: "2026-09-22",
      waktu: "22:00",
      status: "Published",
      jumlahSiswa: 31,
      dikumpulkan: 27,
      deskripsi:
        "Membuat analisis kebutuhan sistem informasi berdasarkan studi kasus.",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterMapel, setFilterMapel] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedTugas, setSelectedTugas] = useState(null);

  const [form, setForm] = useState({
    judul: "",
    mapel: "",
    kelas: "",
    guru: "",
    tipe: "Tugas Individu",
    deadline: "",
    waktu: "23:59",
    status: "Draft",
    deskripsi: "",
  });

  const totalTugas = tugas.length;
  const published = tugas.filter((item) => item.status === "Published").length;
  const draft = tugas.filter((item) => item.status === "Draft").length;
  const totalDikumpulkan = tugas.reduce(
    (total, item) => total + item.dikumpulkan,
    0
  );

  const mapelList = [...new Set(tugas.map((item) => item.mapel))];

  const filteredTugas = useMemo(() => {
    return tugas.filter((item) => {
      const keyword = search.toLowerCase();

      const cocokSearch =
        item.judul.toLowerCase().includes(keyword) ||
        item.mapel.toLowerCase().includes(keyword) ||
        item.kelas.toLowerCase().includes(keyword) ||
        item.guru.toLowerCase().includes(keyword);

      const cocokStatus =
        filterStatus === "Semua" || item.status === filterStatus;

      const cocokMapel =
        filterMapel === "Semua" || item.mapel === filterMapel;

      return cocokSearch && cocokStatus && cocokMapel;
    });
  }, [tugas, search, filterStatus, filterMapel]);

  const openAddModal = () => {
    setModalType("add");
    setSelectedTugas(null);

    setForm({
      judul: "",
      mapel: "",
      kelas: "",
      guru: "",
      tipe: "Tugas Individu",
      deadline: "",
      waktu: "23:59",
      status: "Draft",
      deskripsi: "",
    });

    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalType("edit");
    setSelectedTugas(item);

    setForm({
      judul: item.judul,
      mapel: item.mapel,
      kelas: item.kelas,
      guru: item.guru,
      tipe: item.tipe,
      deadline: item.deadline,
      waktu: item.waktu,
      status: item.status,
      deskripsi: item.deskripsi,
    });

    setShowModal(true);
  };

  const openDetailModal = (item) => {
    setModalType("detail");
    setSelectedTugas(item);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const yakin = window.confirm(
      "Apakah Anda yakin ingin menghapus tugas ini?"
    );

    if (!yakin) return;

    setTugas((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.judul || !form.mapel || !form.kelas || !form.deadline) {
      alert("Mohon lengkapi data tugas.");
      return;
    }

    if (modalType === "edit" && selectedTugas) {
      setTugas((prev) =>
        prev.map((item) =>
          item.id === selectedTugas.id
            ? {
                ...item,
                ...form,
              }
            : item
        )
      );
    } else {
      const newTugas = {
        id: Date.now(),
        ...form,
        jumlahSiswa: 0,
        dikumpulkan: 0,
      };

      setTugas((prev) => [newTugas, ...prev]);
    }

    setShowModal(false);
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getProgress = (item) => {
    if (!item.jumlahSiswa) return 0;

    return Math.round((item.dikumpulkan / item.jumlahSiswa) * 100);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* BREADCRUMB */}
          <div className="mb-2 text-sm text-slate-500">
            LMS & CBT
            <span className="mx-2">/</span>
            <span className="text-slate-700">Tugas Siswa</span>
          </div>

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <ClipboardList size={24} />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Tugas Siswa
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Kelola tugas, deadline, dan pengumpulan tugas siswa.
                </p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus size={18} />
              Tambah Tugas
            </button>
          </div>

          {/* STATISTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Tugas"
              value={totalTugas}
              description="Semua tugas"
              icon={ClipboardList}
            />

            <StatCard
              title="Published"
              value={published}
              description="Sudah diterbitkan"
              icon={CheckCircle2}
              iconClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />

            <StatCard
              title="Draft"
              value={draft}
              description="Belum diterbitkan"
              icon={FileText}
              iconClass="text-amber-600"
              bgClass="bg-amber-50"
            />

            <StatCard
              title="Dikumpulkan"
              value={totalDikumpulkan}
              description="Total pengumpulan"
              icon={Users}
              iconClass="text-purple-600"
              bgClass="bg-purple-50"
            />
          </div>

          {/* FILTER CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
            <div className="flex flex-col xl:flex-row gap-3">
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari tugas, mata pelajaran, kelas, atau guru..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* STATUS */}
              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none w-full xl:w-44 pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* MAPEL */}
              <select
                value={filterMapel}
                onChange={(e) => setFilterMapel(e.target.value)}
                className="w-full xl:w-52 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Semua">Semua Mata Pelajaran</option>

                {mapelList.map((mapel) => (
                  <option key={mapel} value={mapel}>
                    {mapel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {filteredTugas.length > 0 ? (
              filteredTugas.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                      {/* ICON */}
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <ClipboardList size={23} />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-base md:text-lg font-bold text-slate-800">
                            {item.judul}
                          </h2>

                          <StatusBadge status={item.status} />
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 mb-3">
                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen size={14} />
                            {item.mapel}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Users size={14} />
                            {item.kelas}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <FileText size={14} />
                            {item.tipe}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 line-clamp-2 max-w-3xl">
                          {item.deskripsi}
                        </p>

                        {/* META */}
                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays
                              size={15}
                              className="text-blue-500"
                            />
                            <span>
                              Deadline:{" "}
                              <strong className="text-slate-700">
                                {formatTanggal(item.deadline)}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock3 size={15} className="text-orange-500" />
                            <span>
                              <strong className="text-slate-700">
                                {item.waktu}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Users size={15} className="text-purple-500" />
                            <span>
                              Guru:{" "}
                              <strong className="text-slate-700">
                                {item.guru}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTION */}
                      <div className="flex lg:flex-col items-center gap-2">
                        <button
                          onClick={() => openDetailModal(item)}
                          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                          title="Lihat detail"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">
                        Pengumpulan Tugas
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
                        {item.dikumpulkan}/{item.jumlahSiswa} siswa
                      </span>
                    </div>

                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{
                          width: `${getProgress(item)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <ClipboardList
                    size={25}
                    className="text-slate-400"
                  />
                </div>

                <h3 className="text-sm font-semibold text-slate-700">
                  Tugas tidak ditemukan
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Coba ubah kata pencarian atau filter.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {modalType === "add"
                    ? "Tambah Tugas"
                    : modalType === "edit"
                    ? "Edit Tugas"
                    : "Detail Tugas"}
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  {modalType === "detail"
                    ? "Informasi lengkap tugas siswa"
                    : "Lengkapi informasi tugas"}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X size={19} />
              </button>
            </div>

            {/* DETAIL */}
            {modalType === "detail" && selectedTugas ? (
              <div className="p-5">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ClipboardList size={23} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-800">
                        {selectedTugas.judul}
                      </h3>

                      <StatusBadge status={selectedTugas.status} />
                    </div>

                    <p className="text-sm text-slate-400 mt-1">
                      {selectedTugas.mapel} • {selectedTugas.kelas}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <DetailBox
                    label="Mata Pelajaran"
                    value={selectedTugas.mapel}
                    icon={BookOpen}
                  />

                  <DetailBox
                    label="Kelas"
                    value={selectedTugas.kelas}
                    icon={Users}
                  />

                  <DetailBox
                    label="Guru"
                    value={selectedTugas.guru}
                    icon={Users}
                  />

                  <DetailBox
                    label="Tipe Tugas"
                    value={selectedTugas.tipe}
                    icon={FileText}
                  />

                  <DetailBox
                    label="Deadline"
                    value={`${formatTanggal(
                      selectedTugas.deadline
                    )} • ${selectedTugas.waktu}`}
                    icon={CalendarDays}
                  />

                  <DetailBox
                    label="Pengumpulan"
                    value={`${selectedTugas.dikumpulkan}/${selectedTugas.jumlahSiswa} siswa`}
                    icon={CheckCircle2}
                  />
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    Deskripsi Tugas
                  </p>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedTugas.deskripsi || "Tidak ada deskripsi."}
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Tutup
                  </button>

                  <button
                    onClick={() => openEditModal(selectedTugas)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                  >
                    Edit Tugas
                  </button>
                </div>
              </div>
            ) : (
              /* FORM */
              <form onSubmit={handleSubmit} className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* JUDUL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Judul Tugas <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={form.judul}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          judul: e.target.value,
                        })
                      }
                      placeholder="Masukkan judul tugas"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* MAPEL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Mata Pelajaran <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={form.mapel}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          mapel: e.target.value,
                        })
                      }
                      placeholder="Contoh: Pemrograman Web"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* KELAS */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Kelas <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={form.kelas}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          kelas: e.target.value,
                        })
                      }
                      placeholder="Contoh: XI PPLG 1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* GURU */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Guru
                    </label>

                    <input
                      type="text"
                      value={form.guru}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          guru: e.target.value,
                        })
                      }
                      placeholder="Nama guru"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* TIPE */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Tipe Tugas
                    </label>

                    <select
                      value={form.tipe}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tipe: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option>Tugas Individu</option>
                      <option>Tugas Kelompok</option>
                      <option>Proyek</option>
                      <option>Praktikum</option>
                    </select>
                  </div>

                  {/* DEADLINE */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Deadline <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* WAKTU */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Waktu Deadline
                    </label>

                    <input
                      type="time"
                      value={form.waktu}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          waktu: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* STATUS */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>

                  {/* DESKRIPSI */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Deskripsi Tugas
                    </label>

                    <textarea
                      rows={5}
                      value={form.deskripsi}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          deskripsi: e.target.value,
                        })
                      }
                      placeholder="Tuliskan instruksi atau deskripsi tugas..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* INFO */}
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <AlertCircle
                    size={16}
                    className="text-blue-500 mt-0.5 shrink-0"
                  />

                  <p className="text-xs text-blue-600 leading-relaxed">
                    Data tugas saat ini masih tersimpan sementara di
                    frontend. Setelah API backend tersedia, bagian ini
                    dapat dihubungkan ke endpoint tugas siswa.
                  </p>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20"
                  >
                    {modalType === "edit"
                      ? "Simpan Perubahan"
                      : "Simpan Tugas"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "text-blue-600",
  bgClass = "bg-blue-50",
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="text-2xl font-bold text-slate-900 mt-2">
            {value}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl ${bgClass} flex items-center justify-center ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  if (status === "Published") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={11} />
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600">
      <Clock3 size={11} />
      Draft
    </span>
  );
}

/* ============================================================
   DETAIL BOX
============================================================ */

function DetailBox({ label, value, icon: Icon }) {
  return (
    <div className="border border-slate-100 rounded-xl p-3.5">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
        <Icon size={14} />
        {label}
      </div>

      <p className="text-sm font-semibold text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}