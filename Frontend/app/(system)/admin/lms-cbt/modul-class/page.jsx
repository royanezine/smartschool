"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

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

  const themePrimarySoft =
    "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

  const themePrimarySoftBorder =
    "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

  const themePrimaryHover =
    "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  const themeTextHover =
    "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

  const themePrimaryShadow =
    "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

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
    const item = classes.find(
      (classItem) => classItem.id === id
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Hapus kelas "${item.namaKelas}"?`
    );

    if (!confirmed) return;

    setClasses((prev) =>
      prev.filter((classItem) => classItem.id !== id)
    );
  };

  const toggleStatus = (id) => {
    setClasses((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Aktif"
                  ? "Nonaktif"
                  : "Aktif",
            }
          : item
      )
    );
  };

  return (
    <div className="theme-page min-h-screen flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header notifications={notifications} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-7 lg:p-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="theme-text-muted">
                LMS & CBT
              </span>

              <span className="theme-text-placeholder">
                /
              </span>

              <span className="theme-text font-medium">
                Modul LMS & Class
              </span>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center ${themePrimaryShadow}`}
                >
                  <MonitorPlay
                    size={24}
                    className="text-white"
                  />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold theme-text">
                    Modul LMS & Class
                  </h1>

                  <p className="text-sm theme-text-secondary mt-1">
                    Kelola kelas pembelajaran dan peserta LMS.
                  </p>
                </div>
              </div>

              <button
                onClick={openAddModal}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:brightness-95 text-white rounded-xl text-sm font-semibold ${themePrimaryShadow} transition-all`}
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
            <div className="theme-card rounded-2xl border theme-border overflow-hidden shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">

              {/* Toolbar */}
              <div className="p-4 md:p-5 border-b theme-border-soft">
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

                  <div className="relative flex-1 max-w-xl">
                    <Search
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari nama kelas, guru, mapel..."
                      className="theme-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowFilter(!showFilter)
                      }
                      className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border theme-border rounded-xl text-sm font-medium theme-text-secondary ${themeTextHover} transition`}
                    >
                      <Filter size={16} />
                      Filter

                      <ChevronDown
                        size={15}
                        className={`transition-transform ${
                          showFilter
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {showFilter && (
                      <div className="absolute right-0 mt-2 w-44 theme-card border theme-border rounded-xl shadow-xl z-20 p-1.5">
                        {[
                          "Semua",
                          "Aktif",
                          "Nonaktif",
                        ].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setFilterStatus(status);
                              setShowFilter(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                              filterStatus === status
                                ? `${themePrimarySoft} text-[var(--color-primary)] font-medium`
                                : `theme-text-secondary ${themeTextHover}`
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
                    <tr className="theme-card-soft border-b theme-border-soft">
                      <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Kelas
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Guru Pengampu
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Mata Pelajaran
                      </th>

                      <th className="text-center px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Siswa
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Tahun Ajaran
                      </th>

                      <th className="text-center px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Status
                      </th>

                      <th className="text-right px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y theme-border-soft">
                    {filteredClasses.length > 0 ? (
                      filteredClasses.map((item) => (
                        <tr
                          key={item.id}
                          className={`${themePrimaryHover} transition`}
                        >
                          {/* Kelas */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">

                              <div
                                className={`w-10 h-10 rounded-xl ${themePrimarySoft} flex items-center justify-center`}
                              >
                                <GraduationCap
                                  size={19}
                                  className="text-[var(--color-primary)]"
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-sm theme-text">
                                  {item.namaKelas}
                                </p>

                                <p className="text-xs theme-text-muted mt-0.5">
                                  {item.tingkat} •{" "}
                                  {item.jurusan}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Guru */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">

                              <div className="w-8 h-8 rounded-lg theme-success flex items-center justify-center">
                                <UserCheck
                                  size={15}
                                  className="text-[var(--color-success)]"
                                />
                              </div>

                              <span className="text-sm theme-text-secondary">
                                {item.guru}
                              </span>
                            </div>
                          </td>

                          {/* Mapel */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <BookOpen
                                size={15}
                                className="theme-text-muted"
                              />

                              <span className="text-sm theme-text-secondary">
                                {item.mataPelajaran}
                              </span>
                            </div>
                          </td>

                          {/* Siswa */}
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold theme-text">
                              <Users
                                size={15}
                                className="text-[var(--color-primary)]"
                              />

                              {item.jumlahSiswa}
                            </span>
                          </td>

                          {/* Tahun */}
                          <td className="px-5 py-4">
                            <span className="text-sm theme-text-secondary">
                              {item.tahunAjaran}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() =>
                                toggleStatus(item.id)
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                                item.status === "Aktif"
                                  ? "theme-success hover:brightness-95"
                                  : "theme-card-soft theme-text-muted hover:brightness-95"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === "Aktif"
                                    ? "bg-[var(--color-success)]"
                                    : "bg-[var(--color-text-muted)]"
                                }`}
                              />

                              {item.status}
                            </button>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">

                              {/* Detail */}
                              <button
                                onClick={() =>
                                  openDetailModal(item)
                                }
                                title="Lihat detail"
                                className={`p-2 rounded-lg theme-text-muted hover:text-[var(--color-primary)] ${themePrimarySoft} transition`}
                              >
                                <Eye size={16} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() =>
                                  openEditModal(item)
                                }
                                title="Edit"
                                className="p-2 rounded-lg theme-text-muted hover:text-[var(--color-warning)] hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] transition"
                              >
                                <Edit3 size={16} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() =>
                                  handleDelete(item.id)
                                }
                                title="Hapus"
                                className="p-2 rounded-lg theme-text-muted theme-danger hover:brightness-95 transition"
                              >
                                <Trash2 size={16} />
                              </button>

                              {/* More */}
                              <button
                                title="Menu lainnya"
                                className={`p-2 rounded-lg theme-text-muted ${themeTextHover} transition`}
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-14 text-center"
                        >
                          <div className="flex flex-col items-center">

                            <div
                              className={`w-14 h-14 rounded-2xl ${themePrimarySoft} flex items-center justify-center mb-3`}
                            >
                              <MonitorPlay
                                size={25}
                                className="theme-text-muted"
                              />
                            </div>

                            <p className="font-semibold theme-text">
                              Tidak ada kelas ditemukan
                            </p>

                            <p className="text-sm theme-text-muted mt-1">
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
              <div className="px-5 py-4 border-t theme-border-soft flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">

                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text-secondary">
                    {filteredClasses.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text-secondary">
                    {classes.length}
                  </span>{" "}
                  kelas
                </p>

                <div className="text-xs theme-text-muted">
                  Total peserta:{" "}
                  <span className="font-semibold theme-text-secondary">
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
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)] backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto theme-card rounded-2xl border theme-border shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 theme-card z-10 px-6 py-4 border-b theme-border-soft flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold theme-text">
                  {modalType === "add"
                    ? "Tambah Kelas LMS"
                    : modalType === "edit"
                    ? "Edit Kelas LMS"
                    : "Detail Kelas LMS"}
                </h2>

                <p className="text-xs theme-text-muted mt-1">
                  {modalType === "detail"
                    ? "Informasi lengkap kelas LMS."
                    : "Lengkapi informasi kelas pembelajaran."}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg theme-text-muted ${themeTextHover} transition`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Detail */}
            {modalType === "detail" && selectedClass ? (
              <div className="p-6">

                <div
                  className={`flex items-center gap-4 p-4 rounded-xl ${themePrimarySoft} border ${themePrimarySoftBorder} mb-5`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
                    <GraduationCap
                      size={24}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold theme-text text-lg">
                      {selectedClass.namaKelas}
                    </h3>

                    <p className="text-sm theme-text-secondary">
                      {selectedClass.tingkat} •{" "}
                      {selectedClass.jurusan}
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

                  <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider mb-2">
                    Deskripsi
                  </p>

                  <div className="p-4 rounded-xl theme-card-soft text-sm theme-text-secondary leading-relaxed border theme-border-soft">
                    {selectedClass.deskripsi ||
                      "Tidak ada deskripsi."}
                  </div>
                </div>

                <div className="flex justify-end mt-6">

                  <button
                    onClick={() => setShowModal(false)}
                    className={`px-5 py-2.5 rounded-xl theme-card-soft border theme-border ${themeTextHover} text-sm font-medium theme-text-secondary transition`}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form
                onSubmit={handleSubmit}
                className="p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <FormInput
                    label="Nama Kelas"
                    value={form.namaKelas}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        namaKelas: value,
                      })
                    }
                    placeholder="Contoh: X PPLG 1"
                    required
                  />

                  <FormSelect
                    label="Tingkat"
                    value={form.tingkat}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        tingkat: value,
                      })
                    }
                    options={["X", "XI", "XII"]}
                    placeholder="Pilih tingkat"
                    required
                  />

                  <FormInput
                    label="Jurusan"
                    value={form.jurusan}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        jurusan: value,
                      })
                    }
                    placeholder="Contoh: PPLG"
                    required
                  />

                  <FormInput
                    label="Guru Pengampu"
                    value={form.guru}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        guru: value,
                      })
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
                    options={[
                      "Aktif",
                      "Nonaktif",
                    ]}
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium theme-text mb-1.5">
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
                    className="theme-input w-full px-3.5 py-2.5 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t theme-border-soft">

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-5 py-2.5 rounded-xl border theme-border theme-text-secondary ${themeTextHover} text-sm font-medium transition`}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:brightness-95 text-white text-sm font-semibold transition ${themePrimaryShadow}`}
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
    <div className="theme-card rounded-2xl border theme-border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)] p-5">
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm theme-text-secondary">
            {title}
          </p>

          <p className="text-2xl font-bold theme-text mt-2">
            {value}
          </p>

          <p className="text-xs theme-text-muted mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl ${"bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"} flex items-center justify-center`}
        >
          <Icon
            size={20}
            className="text-[var(--color-primary)]"
          />
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
      <label className="block text-sm font-medium theme-text mb-1.5">
        {label}

        {required && (
          <span className="theme-danger ml-1">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="theme-input w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] focus:border-[var(--color-primary)] transition"
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
      <label className="block text-sm font-medium theme-text mb-1.5">
        {label}

        {required && (
          <span className="theme-danger ml-1">
            *
          </span>
        )}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        required={required}
        className="theme-input w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] focus:border-[var(--color-primary)] transition"
      >
        {placeholder && !value && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
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

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="p-3.5 rounded-xl border theme-border-soft theme-card-soft">
      <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wide">
        {label}
      </p>

      <p className="text-sm font-semibold theme-text mt-1">
        {value}
      </p>
    </div>
  );
}