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

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

/* ============================================================
   THEME HELPERS
============================================================ */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_24px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

/* ============================================================
   PAGE
============================================================ */

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
      deskripsi:
        "Pengenalan dasar algoritma dan pemrograman.",
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
      deskripsi:
        "Materi dasar pembuatan halaman web menggunakan HTML dan CSS.",
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
      deskripsi:
        "Konsep database relasional dan penggunaan tabel.",
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
      deskripsi:
        "Pengenalan berbagai jenis topologi jaringan komputer.",
      durasi: "90 Menit",
      tanggal: "28 Agustus 2026",
      status: "Draft",
      tipe: "Materi",
      jumlahSiswa: 31,
    },
  ]);

  /* ============================================================
     STATISTICS
  ============================================================ */

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

  /* ============================================================
     SEARCH
  ============================================================ */

  const filteredMateri = materi.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.judul.toLowerCase().includes(keyword) ||
      item.mapel.toLowerCase().includes(keyword) ||
      item.kelas.toLowerCase().includes(keyword) ||
      item.guru.toLowerCase().includes(keyword)
    );
  });

  /* ============================================================
     MODAL ACTIONS
  ============================================================ */

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
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus materi ini?"
      )
    ) {
      setMateri((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen flex theme-page">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* ======================================================
          AREA KANAN
      ====================================================== */}

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 theme-page">
          {/* ==================================================
              BREADCRUMB
          ================================================== */}

          <div className="mb-3">
            <p className="text-sm theme-text-muted">
              LMS & CBT

              <span className="mx-2 theme-text-placeholder">
                /
              </span>

              <span className="theme-text-secondary">
                Materi dan Modul Ajar
              </span>
            </p>
          </div>

          {/* ==================================================
              TITLE
          ================================================== */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-12 h-12
                  rounded-xl
                  bg-[var(--color-primary)]
                  flex
                  items-center
                  justify-center
                  ${themePrimaryShadow}
                `}
              >
                <BookOpenCheck
                  size={24}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Materi dan Modul Ajar
                </h1>

                <p className="text-sm theme-text-muted mt-1">
                  Kelola materi pembelajaran dan modul ajar
                  untuk siswa.
                </p>
              </div>
            </div>

            {/* ADD BUTTON */}

            <button
              onClick={openAddModal}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                bg-[var(--color-primary)]
                hover:brightness-95
                text-white
                text-sm
                font-semibold
                rounded-xl
                transition-all
                shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
              "
            >
              <Plus size={18} />
              Tambah Materi
            </button>
          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {/* TOTAL */}

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">
                    Total Materi
                  </p>

                  <p className="text-3xl font-bold theme-text mt-2">
                    {materi.length}
                  </p>

                  <p className="text-xs theme-text-placeholder mt-2">
                    Materi & modul ajar
                  </p>
                </div>

                <div
                  className={`
                    w-11
                    h-11
                    rounded-xl
                    ${themePrimarySoft}
                    flex
                    items-center
                    justify-center
                    text-[var(--color-primary)]
                  `}
                >
                  <BookOpenCheck size={21} />
                </div>
              </div>
            </div>

            {/* PUBLISHED */}

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">
                    Published
                  </p>

                  <p className="text-3xl font-bold theme-text mt-2">
                    {publishedCount}
                  </p>

                  <p className="text-xs theme-text-placeholder mt-2">
                    Sudah diterbitkan
                  </p>
                </div>

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    theme-success
                    flex
                    items-center
                    justify-center
                  "
                >
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>

            {/* DRAFT */}

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">
                    Draft
                  </p>

                  <p className="text-3xl font-bold theme-text mt-2">
                    {draftCount}
                  </p>

                  <p className="text-xs theme-text-placeholder mt-2">
                    Belum diterbitkan
                  </p>
                </div>

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    theme-warning
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Clock3 size={21} />
                </div>
              </div>
            </div>

            {/* SISWA */}

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">
                    Total Siswa
                  </p>

                  <p className="text-3xl font-bold theme-text mt-2">
                    {totalSiswa}
                  </p>

                  <p className="text-xs theme-text-placeholder mt-2">
                    Distribusi pembelajaran
                  </p>
                </div>

                <div
                  className={`
                    w-11
                    h-11
                    rounded-xl
                    ${themePrimarySoft}
                    flex
                    items-center
                    justify-center
                    text-[var(--color-primary)]
                  `}
                >
                  <Users size={21} />
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              TABLE CARD
          ================================================== */}

          <div
            className={`
              theme-card
              theme-border
              rounded-2xl
              border
              ${themeCardShadow}
              overflow-hidden
            `}
          >
            {/* TOOLBAR */}

            <div className="p-5 theme-border-soft border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="font-semibold theme-text">
                    Daftar Materi
                  </h2>

                  <p className="text-xs theme-text-placeholder mt-1">
                    Daftar materi dan modul ajar yang tersedia.
                  </p>
                </div>

                {/* SEARCH */}

                <div className="relative w-full md:w-72">
                  <Search
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      theme-text-placeholder
                    "
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari materi..."
                    className="
                      theme-input
                      w-full
                      pl-10
                      pr-4
                      py-2.5
                      rounded-xl
                      text-sm
                      focus:outline-none
                    "
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="theme-card-soft theme-border-soft border-b">
                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Materi
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Mata Pelajaran
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Kelas
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Guru
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Status
                    </th>

                    <th className="text-center px-5 py-4 text-xs font-semibold theme-text-muted">
                      Siswa
                    </th>

                    <th className="text-right px-5 py-4 text-xs font-semibold theme-text-muted">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y theme-border-soft">
                  {filteredMateri.length > 0 ? (
                    filteredMateri.map((item) => (
                      <tr
                        key={item.id}
                        className={`
                          transition-colors
                          ${themePrimaryHover}
                        `}
                      >
                        {/* MATERI */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-sm theme-text">
                              {item.judul}
                            </p>

                            <p className="text-xs theme-text-placeholder mt-1">
                              {item.tipe} • {item.pertemuan}
                            </p>
                          </div>
                        </td>

                        {/* MAPEL */}

                        <td className="px-5 py-4">
                          <span className="text-sm theme-text-secondary">
                            {item.mapel}
                          </span>
                        </td>

                        {/* KELAS */}

                        <td className="px-5 py-4">
                          <span className="text-sm theme-text-secondary">
                            {item.kelas}
                          </span>
                        </td>

                        {/* GURU */}

                        <td className="px-5 py-4">
                          <span className="text-sm theme-text-secondary">
                            {item.guru}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex
                              items-center
                              px-2.5
                              py-1
                              rounded-full
                              text-xs
                              font-medium
                              ${
                                item.status === "Published"
                                  ? "theme-success"
                                  : "theme-warning"
                              }
                            `}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* SISWA */}

                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-medium theme-text-secondary">
                            {item.jumlahSiswa}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">

                            {/* DETAIL */}

                            <button
                              onClick={() =>
                                openDetailModal(item)
                              }
                              className={`
                                p-2
                                rounded-lg
                                theme-text-placeholder
                                transition
                                hover:text-[var(--color-primary)]
                                ${themePrimarySoft}
                              `}
                              title="Detail"
                            >
                              <Eye size={16} />
                            </button>

                            {/* EDIT */}

                            <button
                              onClick={() =>
                                openEditModal(item)
                              }
                              className="
                                p-2
                                rounded-lg
                                theme-text-placeholder
                                hover:theme-warning
                                transition
                              "
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            {/* DELETE */}

                            <button
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              className="
                                p-2
                                rounded-lg
                                theme-text-placeholder
                                hover:theme-danger
                                transition
                              "
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>

                            {/* MORE */}

                            <button
                              className={`
                                p-2
                                rounded-lg
                                theme-text-placeholder
                                transition
                                ${themeTextHover}
                              `}
                              title="Menu"
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
                        <BookOpenCheck
                          size={38}
                          className="mx-auto theme-text-placeholder mb-3"
                        />

                        <p className="text-sm font-medium theme-text-secondary">
                          Materi tidak ditemukan
                        </p>

                        <p className="text-xs theme-text-placeholder mt-1">
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

      {/* ========================================================
          MODAL
      ======================================================== */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)]
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className={`
              theme-card
              theme-border
              w-full
              max-w-2xl
              rounded-2xl
              border
              ${themeCardShadow}
              overflow-hidden
              max-h-[90vh]
              overflow-y-auto
            `}
          >
            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="px-6 py-4 theme-border-soft border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold theme-text">
                  {modalType === "add"
                    ? "Tambah Materi"
                    : modalType === "edit"
                    ? "Edit Materi"
                    : "Detail Materi"}
                </h3>

                <p className="text-xs theme-text-placeholder mt-1">
                  {modalType === "detail"
                    ? "Informasi detail materi pembelajaran"
                    : "Kelola informasi materi pembelajaran"}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className={`
                  p-2
                  rounded-lg
                  theme-text-placeholder
                  transition
                  ${themeTextHover}
                  hover:text-[var(--color-primary)]
                `}
              >
                <X size={18} />
              </button>
            </div>

            {/* ==================================================
                DETAIL
            ================================================== */}

            {modalType === "detail" &&
              selectedMateri && (
                <div className="p-6 space-y-5">

                  {/* JUDUL */}

                  <div>
                    <p className="text-xs theme-text-placeholder mb-1">
                      Judul Materi
                    </p>

                    <p className="font-semibold theme-text">
                      {selectedMateri.judul}
                    </p>
                  </div>

                  {/* GRID DETAIL */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* MAPEL */}

                    <div>
                      <p className="text-xs theme-text-placeholder mb-1">
                        Mata Pelajaran
                      </p>

                      <p className="text-sm theme-text-secondary">
                        {selectedMateri.mapel}
                      </p>
                    </div>

                    {/* KELAS */}

                    <div>
                      <p className="text-xs theme-text-placeholder mb-1">
                        Kelas
                      </p>

                      <p className="text-sm theme-text-secondary">
                        {selectedMateri.kelas}
                      </p>
                    </div>

                    {/* GURU */}

                    <div>
                      <p className="text-xs theme-text-placeholder mb-1">
                        Guru
                      </p>

                      <p className="text-sm theme-text-secondary">
                        {selectedMateri.guru}
                      </p>
                    </div>

                    {/* PERTEMUAN */}

                    <div>
                      <p className="text-xs theme-text-placeholder mb-1">
                        Pertemuan
                      </p>

                      <p className="text-sm theme-text-secondary">
                        {selectedMateri.pertemuan}
                      </p>
                    </div>

                    {/* DURASI */}

                    <div>
                      <p className="text-xs theme-text-placeholder mb-1">
                        Durasi
                      </p>

                      <p className="text-sm theme-text-secondary">
                        {selectedMateri.durasi}
                      </p>
                    </div>

                    {/* SISWA */}

                    <div>
                      <p className="text-xs theme-text-placeholder mb-1">
                        Jumlah Siswa
                      </p>

                      <p className="text-sm theme-text-secondary">
                        {selectedMateri.jumlahSiswa} siswa
                      </p>
                    </div>
                  </div>

                  {/* DESKRIPSI */}

                  <div>
                    <p className="text-xs theme-text-placeholder mb-1">
                      Deskripsi
                    </p>

                    <p className="text-sm theme-text-secondary leading-relaxed">
                      {selectedMateri.deskripsi}
                    </p>
                  </div>

                  {/* STATUS */}

                  <div>
                    <p className="text-xs theme-text-placeholder mb-2">
                      Status
                    </p>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        selectedMateri.status ===
                        "Published"
                          ? "theme-success"
                          : "theme-warning"
                      }`}
                    >
                      {selectedMateri.status}
                    </span>
                  </div>

                  {/* BUTTON */}

                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        setShowModal(false)
                      }
                      className="
                        px-4
                        py-2.5
                        rounded-xl
                        theme-card-soft
                        theme-text-secondary
                        text-sm
                        font-medium
                        transition
                        hover:brightness-95
                      "
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}

            {/* ==================================================
                ADD / EDIT
            ================================================== */}

            {(modalType === "add" ||
              modalType === "edit") && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowModal(false);
                }}
                className="p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* JUDUL */}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Judul Materi
                    </label>

                    <input
                      defaultValue={
                        selectedMateri?.judul || ""
                      }
                      required
                      className="
                        theme-input
                        w-full
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        focus:outline-none
                      "
                      placeholder="Masukkan judul materi"
                    />
                  </div>

                  {/* MAPEL */}

                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Mata Pelajaran
                    </label>

                    <input
                      defaultValue={
                        selectedMateri?.mapel || ""
                      }
                      required
                      className="
                        theme-input
                        w-full
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        focus:outline-none
                      "
                      placeholder="Mata pelajaran"
                    />
                  </div>

                  {/* KELAS */}

                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Kelas
                    </label>

                    <input
                      defaultValue={
                        selectedMateri?.kelas || ""
                      }
                      required
                      className="
                        theme-input
                        w-full
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        focus:outline-none
                      "
                      placeholder="Contoh: X PPLG 1"
                    />
                  </div>

                  {/* GURU */}

                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Guru
                    </label>

                    <input
                      defaultValue={
                        selectedMateri?.guru || ""
                      }
                      required
                      className="
                        theme-input
                        w-full
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        focus:outline-none
                      "
                      placeholder="Nama guru"
                    />
                  </div>

                  {/* PERTEMUAN */}

                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Pertemuan
                    </label>

                    <input
                      defaultValue={
                        selectedMateri?.pertemuan || ""
                      }
                      className="
                        theme-input
                        w-full
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        focus:outline-none
                      "
                      placeholder="Contoh: Pertemuan 1"
                    />
                  </div>

                  {/* DURASI */}

                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Durasi
                    </label>

                    <input
                      defaultValue={
                        selectedMateri?.durasi || ""
                      }
                      className="
                        theme-input
                        w-full
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        focus:outline-none
                      "
                      placeholder="Contoh: 90 Menit"
                    />
                  </div>

                  {/* TIPE */}

                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Tipe
                    </label>

                    <select
                      defaultValue={
                        selectedMateri?.tipe ||
                        "Materi"
                      }
                      className="
                        theme-input
                        w-full
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        focus:outline-none
                      "
                    >
                      <option value="Materi">
                        Materi
                      </option>

                      <option value="Modul Ajar">
                        Modul Ajar
                      </option>
                    </select>
                  </div>

                  {/* DESKRIPSI */}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                      Deskripsi
                    </label>

                    <textarea
                      defaultValue={
                        selectedMateri?.deskripsi || ""
                      }
                      rows={4}
                      className="
                        theme-input
                        w-full
                        px-3.5
                        py-2.5
                        rounded-xl
                        text-sm
                        resize-none
                        focus:outline-none
                      "
                      placeholder="Deskripsi materi..."
                    />
                  </div>
                </div>

                {/* FORM ACTION */}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="
                      px-4
                      py-2.5
                      rounded-xl
                      theme-card-soft
                      theme-text-secondary
                      text-sm
                      font-medium
                      transition
                      hover:brightness-95
                    "
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="
                      px-5
                      py-2.5
                      rounded-xl
                      bg-[var(--color-primary)]
                      hover:brightness-95
                      text-white
                      text-sm
                      font-semibold
                      transition
                    "
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