"use client";

import { useState } from "react";
import {
  BookOpenCheck,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Clock3,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  X,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

export default function MateriModulAjarPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedMateri, setSelectedMateri] = useState(null);

  const [materi, setMateri] = useState([
    {
      id: 1,
      judul: "Pemrograman Dasar",
      mapel: "Pemrograman Dasar",
      kelas: "X PPLG 1",
      guru: "Budi Santoso, S.Kom",
      bab: "Algoritma dan Pemrograman",
      pertemuan: "Pertemuan 1",
      deskripsi: "Pengenalan dasar algoritma dan pemrograman.",
      durasi: "90 Menit",
      tanggal: "02 September 2026",
      status: "Published",
      tipe: "Modul Ajar",
      jumlahSiswa: 32,
    },
    {
      id: 2,
      judul: "Pemrograman Web",
      mapel: "Pemrograman Web",
      kelas: "XI PPLG 1",
      guru: "Andi Wijaya, S.Kom",
      bab: "HTML & CSS",
      pertemuan: "Pertemuan 3",
      deskripsi: "Materi dasar pembuatan halaman web menggunakan HTML dan CSS.",
      durasi: "90 Menit",
      tanggal: "01 September 2026",
      status: "Published",
      tipe: "Materi",
      jumlahSiswa: 30,
    },
    {
      id: 3,
      judul: "Basis Data",
      mapel: "Basis Data",
      kelas: "XI PPLG 2",
      guru: "Rina Maharani, S.Kom",
      bab: "Database Relasional",
      pertemuan: "Pertemuan 2",
      deskripsi: "Konsep database relasional dan penggunaan tabel.",
      durasi: "90 Menit",
      tanggal: "30 Agustus 2026",
      status: "Published",
      tipe: "Modul Ajar",
      jumlahSiswa: 31,
    },
    {
      id: 4,
      judul: "Jaringan Komputer",
      mapel: "Jaringan Komputer",
      kelas: "XII TKJ 1",
      guru: "Dedi Firmansyah, S.Kom",
      bab: "Topologi Jaringan",
      pertemuan: "Pertemuan 1",
      deskripsi: "Pengenalan berbagai jenis topologi jaringan komputer.",
      durasi: "90 Menit",
      tanggal: "28 Agustus 2026",
      status: "Draft",
      tipe: "Materi",
      jumlahSiswa: 31,
    },
  ]);

  const publishedCount = materi.filter(
    (item) => item.status === "Published"
  ).length;

  const draftCount = materi.filter(
    (item) => item.status === "Draft"
  ).length;

  const totalSiswa = materi.reduce(
    (total, item) => total + item.jumlahSiswa,
    0
  );

  const filteredMateri = materi.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.judul.toLowerCase().includes(keyword) ||
      item.mapel.toLowerCase().includes(keyword) ||
      item.kelas.toLowerCase().includes(keyword) ||
      item.guru.toLowerCase().includes(keyword)
    );
  });

  const openAddModal = () => {
    setModalType("add");
    setSelectedMateri(null);
    setShowModal(true);
  };

  const openDetailModal = (item) => {
    setModalType("detail");
    setSelectedMateri(item);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalType("edit");
    setSelectedMateri(item);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      setMateri((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    /*
     * ==========================================================
     * ROOT LAYOUT
     * ==========================================================
     *
     * Sidebar dan area utama harus sejajar secara HORIZONTAL.
     * Header berada DI ATAS main content.
     */
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <Sidebar />

      {/* AREA KANAN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* HEADER HARUS DI SINI */}
        <Header />

        {/* CONTENT */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-3">
            <p className="text-sm text-slate-500">
              LMS & CBT
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-700">
                Materi dan Modul Ajar
              </span>
            </p>
          </div>

          {/* TITLE */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <BookOpenCheck
                  size={24}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Materi dan Modul Ajar
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Kelola materi pembelajaran dan modul ajar untuk siswa.
                </p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus size={18} />
              Tambah Materi
            </button>
          </div>

          {/* STATISTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {/* Total */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Total Materi
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {materi.length}
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    Materi & modul ajar
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BookOpenCheck
                    size={21}
                    className="text-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Published */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Published
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {publishedCount}
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    Sudah diterbitkan
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2
                    size={21}
                    className="text-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Draft */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Draft
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {draftCount}
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    Belum diterbitkan
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Clock3
                    size={21}
                    className="text-orange-600"
                  />
                </div>
              </div>
            </div>

            {/* Siswa */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Total Siswa
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {totalSiswa}
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    Distribusi pembelajaran
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Users
                    size={21}
                    className="text-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* TOOLBAR */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Daftar Materi
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Daftar materi dan modul ajar yang tersedia.
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari materi..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                      Materi
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                      Mata Pelajaran
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                      Kelas
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                      Guru
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                      Status
                    </th>

                    <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500">
                      Siswa
                    </th>

                    <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMateri.length > 0 ? (
                    filteredMateri.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-sm text-slate-800">
                              {item.judul}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {item.tipe} • {item.pertemuan}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600">
                            {item.mapel}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600">
                            {item.kelas}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600">
                            {item.guru}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              item.status === "Published"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-medium text-slate-700">
                            {item.jumlahSiswa}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetailModal(item)}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="Detail"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>

                            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition">
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
                        <BookOpenCheck
                          size={38}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-sm font-medium text-slate-600">
                          Materi tidak ditemukan
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Coba gunakan kata kunci pencarian lain.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {modalType === "add"
                    ? "Tambah Materi"
                    : modalType === "edit"
                    ? "Edit Materi"
                    : "Detail Materi"}
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  {modalType === "detail"
                    ? "Informasi detail materi pembelajaran"
                    : "Kelola informasi materi pembelajaran"}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Detail */}
            {modalType === "detail" && selectedMateri && (
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs text-slate-400 mb-1">
                    Judul Materi
                  </p>
                  <p className="font-semibold text-slate-800">
                    {selectedMateri.judul}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Mata Pelajaran
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedMateri.mapel}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Kelas
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedMateri.kelas}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Guru
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedMateri.guru}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Pertemuan
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedMateri.pertemuan}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Durasi
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedMateri.durasi}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Jumlah Siswa
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedMateri.jumlahSiswa} siswa
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">
                    Deskripsi
                  </p>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedMateri.deskripsi}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {/* Add / Edit */}
            {(modalType === "add" || modalType === "edit") && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowModal(false);
                }}
                className="p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Judul Materi
                    </label>

                    <input
                      defaultValue={selectedMateri?.judul || ""}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Masukkan judul materi"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Mata Pelajaran
                    </label>

                    <input
                      defaultValue={selectedMateri?.mapel || ""}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Mata pelajaran"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Kelas
                    </label>

                    <input
                      defaultValue={selectedMateri?.kelas || ""}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Contoh: X PPLG 1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Guru
                    </label>

                    <input
                      defaultValue={selectedMateri?.guru || ""}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Nama guru"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Pertemuan
                    </label>

                    <input
                      defaultValue={selectedMateri?.pertemuan || ""}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Contoh: Pertemuan 1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Durasi
                    </label>

                    <input
                      defaultValue={selectedMateri?.durasi || ""}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Contoh: 90 Menit"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Tipe
                    </label>

                    <select
                      defaultValue={selectedMateri?.tipe || "Materi"}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option>Materi</option>
                      <option>Modul Ajar</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Deskripsi
                    </label>

                    <textarea
                      defaultValue={selectedMateri?.deskripsi || ""}
                      rows={4}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Deskripsi materi..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                  >
                    {modalType === "edit"
                      ? "Simpan Perubahan"
                      : "Tambah Materi"}
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