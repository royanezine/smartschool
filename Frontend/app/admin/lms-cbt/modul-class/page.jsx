"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  MonitorPlay,
  Plus,
  Search,
  Filter,
  Users,
  UserCheck,
  BookOpen,
  MoreVertical,
  Edit3,
  Eye,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

export default function ModulClassPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedClass, setSelectedClass] = useState(null);

  const [form, setForm] = useState({
    namaKelas: "",
    tingkat: "",
    jurusan: "",
    guru: "",
    mataPelajaran: "",
    tahunAjaran: "2025/2026",
    jumlahSiswa: "",
    status: "Aktif",
    deskripsi: "",
  });

  const [classes, setClasses] = useState([
    {
      id: 1,
      namaKelas: "X PPLG 1",
      tingkat: "X",
      jurusan: "PPLG",
      guru: "Budi Santoso, S.Kom",
      mataPelajaran: "Pemrograman Dasar",
      tahunAjaran: "2025/2026",
      jumlahSiswa: 32,
      status: "Aktif",
      deskripsi: "Kelas LMS untuk pembelajaran Pemrograman Dasar.",
    },
    {
      id: 2,
      namaKelas: "XI PPLG 1",
      tingkat: "XI",
      jurusan: "PPLG",
      guru: "Andi Wijaya, S.Kom",
      mataPelajaran: "Pemrograman Web",
      tahunAjaran: "2025/2026",
      jumlahSiswa: 30,
      status: "Aktif",
      deskripsi: "Pembelajaran pengembangan aplikasi web.",
    },
    {
      id: 3,
      namaKelas: "XI TKJ 1",
      tingkat: "XI",
      jurusan: "TKJ",
      guru: "Dedi Irawan, S.Kom",
      mataPelajaran: "Jaringan Komputer",
      tahunAjaran: "2025/2026",
      jumlahSiswa: 31,
      status: "Aktif",
      deskripsi: "Kelas pembelajaran jaringan komputer dan infrastruktur.",
    },
    {
      id: 4,
      namaKelas: "XII PPLG 1",
      tingkat: "XII",
      jurusan: "PPLG",
      guru: "Rina Permata, S.Kom",
      mataPelajaran: "Basis Data",
      tahunAjaran: "2025/2026",
      jumlahSiswa: 31,
      status: "Nonaktif",
      deskripsi: "Kelas LMS basis data untuk tingkat akhir.",
    },
  ]);

  const notifications = [];

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.namaKelas.toLowerCase().includes(keyword) ||
        item.jurusan.toLowerCase().includes(keyword) ||
        item.guru.toLowerCase().includes(keyword) ||
        item.mataPelajaran.toLowerCase().includes(keyword);

      const matchStatus =
        filterStatus === "Semua" || item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [classes, search, filterStatus]);

  const totalClasses = classes.length;
  const activeClasses = classes.filter(
    (item) => item.status === "Aktif"
  ).length;
  const inactiveClasses = classes.filter(
    (item) => item.status === "Nonaktif"
  ).length;
  const totalStudents = classes.reduce(
    (total, item) => total + Number(item.jumlahSiswa || 0),
    0
  );

  const resetForm = () => {
    setForm({
      namaKelas: "",
      tingkat: "",
      jurusan: "",
      guru: "",
      mataPelajaran: "",
      tahunAjaran: "2025/2026",
      jumlahSiswa: "",
      status: "Aktif",
      deskripsi: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setModalType("add");
    setSelectedClass(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setSelectedClass(item);
    setForm({
      namaKelas: item.namaKelas,
      tingkat: item.tingkat,
      jurusan: item.jurusan,
      guru: item.guru,
      mataPelajaran: item.mataPelajaran,
      tahunAjaran: item.tahunAjaran,
      jumlahSiswa: item.jumlahSiswa,
      status: item.status,
      deskripsi: item.deskripsi,
    });
    setModalType("edit");
    setShowModal(true);
  };

  const openDetailModal = (item) => {
    setSelectedClass(item);
    setModalType("detail");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modalType === "edit" && selectedClass) {
      setClasses((prev) =>
        prev.map((item) =>
          item.id === selectedClass.id
            ? {
                ...item,
                ...form,
                jumlahSiswa: Number(form.jumlahSiswa || 0),
              }
            : item
        )
      );
    } else {
      setClasses((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...form,
          jumlahSiswa: Number(form.jumlahSiswa || 0),
        },
      ]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id) => {
    const item = classes.find((classItem) => classItem.id === id);

    if (!item) return;

    const confirmed = window.confirm(
      `Hapus kelas "${item.namaKelas}"?`
    );

    if (!confirmed) return;

    setClasses((prev) => prev.filter((classItem) => classItem.id !== id));
  };

  const toggleStatus = (id) => {
    setClasses((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Aktif" ? "Nonaktif" : "Aktif",
            }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header notifications={notifications} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-7 lg:p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="text-slate-400">LMS & CBT</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-medium">
                Modul LMS & Class
              </span>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <MonitorPlay size={24} className="text-white" />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Modul LMS & Class
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Kelola kelas pembelajaran dan peserta LMS.
                  </p>
                </div>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
              >
                <Plus size={18} />
                Tambah Kelas
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
              <StatCard
                title="Total Kelas"
                value={totalClasses}
                description="Semua kelas LMS"
                icon={MonitorPlay}
              />

              <StatCard
                title="Kelas Aktif"
                value={activeClasses}
                description="Sedang digunakan"
                icon={CheckCircle2}
              />

              <StatCard
                title="Kelas Nonaktif"
                value={inactiveClasses}
                description="Tidak aktif"
                icon={Clock3}
              />

              <StatCard
                title="Total Siswa"
                value={totalStudents}
                description="Peserta seluruh kelas"
                icon={Users}
              />
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="p-4 md:p-5 border-b border-slate-100">
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                  <div className="relative flex-1 max-w-xl">
                    <Search
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama kelas, guru, mapel..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowFilter(!showFilter)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                      <Filter size={16} />
                      Filter
                      <ChevronDown
                        size={15}
                        className={`transition-transform ${
                          showFilter ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showFilter && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-1.5">
                        {["Semua", "Aktif", "Nonaktif"].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setFilterStatus(status);
                              setShowFilter(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                              filterStatus === status
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Guru Pengampu
                      </th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Mata Pelajaran
                      </th>
                      <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Siswa
                      </th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Tahun Ajaran
                      </th>
                      <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredClasses.length > 0 ? (
                      filteredClasses.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          {/* Kelas */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <GraduationCap
                                  size={19}
                                  className="text-blue-600"
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-sm text-slate-800">
                                  {item.namaKelas}
                                </p>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  {item.tingkat} • {item.jurusan}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Guru */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <UserCheck
                                  size={15}
                                  className="text-emerald-600"
                                />
                              </div>

                              <span className="text-sm text-slate-600">
                                {item.guru}
                              </span>
                            </div>
                          </td>

                          {/* Mapel */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <BookOpen
                                size={15}
                                className="text-slate-400"
                              />
                              <span className="text-sm text-slate-600">
                                {item.mataPelajaran}
                              </span>
                            </div>
                          </td>

                          {/* Siswa */}
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                              <Users size={15} className="text-blue-500" />
                              {item.jumlahSiswa}
                            </span>
                          </td>

                          {/* Tahun */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">
                              {item.tahunAjaran}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => toggleStatus(item.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                                item.status === "Aktif"
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === "Aktif"
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }`}
                              />
                              {item.status}
                            </button>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openDetailModal(item)}
                                title="Lihat detail"
                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                onClick={() => openEditModal(item)}
                                title="Edit"
                                className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                onClick={() => handleDelete(item.id)}
                                title="Hapus"
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 size={16} />
                              </button>

                              <button
                                title="Menu lainnya"
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-5 py-14 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                              <MonitorPlay
                                size={25}
                                className="text-slate-400"
                              />
                            </div>

                            <p className="font-semibold text-slate-700">
                              Tidak ada kelas ditemukan
                            </p>

                            <p className="text-sm text-slate-400 mt-1">
                              Coba ubah kata pencarian atau filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-600">
                    {filteredClasses.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-600">
                    {classes.length}
                  </span>{" "}
                  kelas
                </p>

                <div className="text-xs text-slate-400">
                  Total peserta:{" "}
                  <span className="font-semibold text-slate-600">
                    {totalStudents} siswa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {modalType === "add"
                    ? "Tambah Kelas LMS"
                    : modalType === "edit"
                    ? "Edit Kelas LMS"
                    : "Detail Kelas LMS"}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  {modalType === "detail"
                    ? "Informasi lengkap kelas LMS."
                    : "Lengkapi informasi kelas pembelajaran."}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Detail */}
            {modalType === "detail" && selectedClass ? (
              <div className="p-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <GraduationCap
                      size={24}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {selectedClass.namaKelas}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {selectedClass.tingkat} • {selectedClass.jurusan}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem
                    label="Guru Pengampu"
                    value={selectedClass.guru}
                  />

                  <DetailItem
                    label="Mata Pelajaran"
                    value={selectedClass.mataPelajaran}
                  />

                  <DetailItem
                    label="Tahun Ajaran"
                    value={selectedClass.tahunAjaran}
                  />

                  <DetailItem
                    label="Jumlah Siswa"
                    value={`${selectedClass.jumlahSiswa} siswa`}
                  />

                  <DetailItem
                    label="Status"
                    value={selectedClass.status}
                  />

                  <DetailItem
                    label="Tingkat"
                    value={selectedClass.tingkat}
                  />
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Deskripsi
                  </p>

                  <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-600 leading-relaxed">
                    {selectedClass.deskripsi || "Tidak ada deskripsi."}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nama Kelas"
                    value={form.namaKelas}
                    onChange={(value) =>
                      setForm({ ...form, namaKelas: value })
                    }
                    placeholder="Contoh: X PPLG 1"
                    required
                  />

                  <FormSelect
                    label="Tingkat"
                    value={form.tingkat}
                    onChange={(value) =>
                      setForm({ ...form, tingkat: value })
                    }
                    options={["X", "XI", "XII"]}
                    placeholder="Pilih tingkat"
                    required
                  />

                  <FormInput
                    label="Jurusan"
                    value={form.jurusan}
                    onChange={(value) =>
                      setForm({ ...form, jurusan: value })
                    }
                    placeholder="Contoh: PPLG"
                    required
                  />

                  <FormInput
                    label="Guru Pengampu"
                    value={form.guru}
                    onChange={(value) =>
                      setForm({ ...form, guru: value })
                    }
                    placeholder="Nama guru"
                    required
                  />

                  <FormInput
                    label="Mata Pelajaran"
                    value={form.mataPelajaran}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        mataPelajaran: value,
                      })
                    }
                    placeholder="Contoh: Pemrograman Web"
                    required
                  />

                  <FormSelect
                    label="Tahun Ajaran"
                    value={form.tahunAjaran}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        tahunAjaran: value,
                      })
                    }
                    options={[
                      "2025/2026",
                      "2026/2027",
                      "2027/2028",
                    ]}
                    required
                  />

                  <FormInput
                    label="Jumlah Siswa"
                    type="number"
                    value={form.jumlahSiswa}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        jumlahSiswa: value,
                      })
                    }
                    placeholder="Contoh: 32"
                    required
                  />

                  <FormSelect
                    label="Status"
                    value={form.status}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        status: value,
                      })
                    }
                    options={["Aktif", "Nonaktif"]}
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Deskripsi
                  </label>

                  <textarea
                    value={form.deskripsi}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        deskripsi: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Deskripsi kelas..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/20"
                  >
                    {modalType === "edit"
                      ? "Simpan Perubahan"
                      : "Tambah Kelas"}
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

        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon size={20} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FORM INPUT
============================================================ */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
      />
    </div>
  );
}

/* ============================================================
   FORM SELECT
============================================================ */

function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
      >
        {placeholder && !value && (
          <option value="">{placeholder}</option>
        )}

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({ label, value }) {
  return (
    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-700 mt-1">
        {value}
      </p>
    </div>
  );
}