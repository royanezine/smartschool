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
  AlertCircle,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

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
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

/* ============================================================
   PAGE
============================================================ */

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

  /* ============================================================
     STATISTICS
  ============================================================ */

  const totalTugas = tugas.length;

  const published = tugas.filter(
    (item) => item.status === "Published"
  ).length;

  const draft = tugas.filter(
    (item) => item.status === "Draft"
  ).length;

  const totalDikumpulkan = tugas.reduce(
    (total, item) => total + item.dikumpulkan,
    0
  );

  const mapelList = [...new Set(tugas.map((item) => item.mapel))];

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredTugas = useMemo(() => {
    return tugas.filter((item) => {
      const keyword = search.toLowerCase();

      const cocokSearch =
        item.judul.toLowerCase().includes(keyword) ||
        item.mapel.toLowerCase().includes(keyword) ||
        item.kelas.toLowerCase().includes(keyword) ||
        item.guru.toLowerCase().includes(keyword);

      const cocokStatus =
        filterStatus === "Semua" ||
        item.status === filterStatus;

      const cocokMapel =
        filterMapel === "Semua" ||
        item.mapel === filterMapel;

      return cocokSearch && cocokStatus && cocokMapel;
    });
  }, [tugas, search, filterStatus, filterMapel]);

  /* ============================================================
     MODAL
  ============================================================ */

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

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = (id) => {
    const yakin = window.confirm(
      "Apakah Anda yakin ingin menghapus tugas ini?"
    );

    if (!yakin) return;

    setTugas((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.judul ||
      !form.mapel ||
      !form.kelas ||
      !form.deadline
    ) {
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

  /* ============================================================
     HELPERS
  ============================================================ */

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(
      tanggal + "T00:00:00"
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getProgress = (item) => {
    if (!item.jumlahSiswa) return 0;

    return Math.round(
      (item.dikumpulkan / item.jumlahSiswa) * 100
    );
  };

  return (
    <div className="flex min-h-screen theme-page">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* ==================================================
              BREADCRUMB
          ================================================== */}

          <div className="mb-2 text-sm theme-text-secondary">
            LMS & CBT

            <span className="mx-2 theme-text-muted">
              /
            </span>

            <span className="theme-text">
              Tugas Siswa
            </span>
          </div>

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">
            <div className="flex items-start gap-4">
              <div
                className={`
                  w-12 h-12 rounded-xl
                  bg-[var(--color-primary)]
                  flex items-center justify-center
                  text-white
                  ${themePrimaryShadow}
                  shrink-0
                `}
              >
                <ClipboardList size={24} />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold theme-text">
                  Tugas Siswa
                </h1>

                <p className="text-sm theme-text-secondary mt-1">
                  Kelola tugas, deadline, dan pengumpulan tugas siswa.
                </p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className={`
                inline-flex items-center justify-center gap-2
                px-5 py-3 rounded-xl
                bg-[var(--color-primary)]
                hover:opacity-90
                text-white
                text-sm font-semibold
                ${themePrimaryShadow}
                transition-all
              `}
            >
              <Plus size={18} />
              Tambah Tugas
            </button>
          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Tugas"
              value={totalTugas}
              description="Semua tugas"
              icon={ClipboardList}
              variant="primary"
            />

            <StatCard
              title="Published"
              value={published}
              description="Sudah diterbitkan"
              icon={CheckCircle2}
              variant="success"
            />

            <StatCard
              title="Draft"
              value={draft}
              description="Belum diterbitkan"
              icon={FileText}
              variant="warning"
            />

            <StatCard
              title="Dikumpulkan"
              value={totalDikumpulkan}
              description="Total pengumpulan"
              icon={Users}
              variant="info"
            />
          </div>

          {/* ==================================================
              FILTER CARD
          ================================================== */}

          <div className="theme-card rounded-2xl theme-border border p-4 mb-5 themeCardShadow">
            <div className="flex flex-col xl:flex-row gap-3">
              {/* SEARCH */}

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="
                    absolute left-3.5 top-1/2
                    -translate-y-1/2
                    theme-text-muted
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari tugas, mata pelajaran, kelas, atau guru..."
                  className="
                    theme-input
                    w-full
                    pl-10 pr-4 py-2.5
                    rounded-xl
                    border
                    theme-border
                    text-sm
                    theme-text
                    theme-text-placeholder
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                    focus:border-[var(--color-primary)]
                  "
                />
              </div>

              {/* STATUS */}

              <div className="relative">
                <Filter
                  size={16}
                  className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    theme-text-muted
                    pointer-events-none
                  "
                />

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value)
                  }
                  className="
                    theme-input
                    appearance-none
                    w-full xl:w-44
                    pl-9 pr-8 py-2.5
                    rounded-xl
                    border
                    theme-border
                    text-sm
                    theme-text-secondary
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                    focus:border-[var(--color-primary)]
                  "
                >
                  <option value="Semua">
                    Semua Status
                  </option>

                  <option value="Published">
                    Published
                  </option>

                  <option value="Draft">
                    Draft
                  </option>
                </select>
              </div>

              {/* MAPEL */}

              <select
                value={filterMapel}
                onChange={(e) =>
                  setFilterMapel(e.target.value)
                }
                className="
                  theme-input
                  w-full xl:w-52
                  px-4 py-2.5
                  rounded-xl
                  border
                  theme-border
                  text-sm
                  theme-text-secondary
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                  focus:border-[var(--color-primary)]
                "
              >
                <option value="Semua">
                  Semua Mata Pelajaran
                </option>

                {mapelList.map((mapel) => (
                  <option key={mapel} value={mapel}>
                    {mapel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ==================================================
              LIST
          ================================================== */}

          <div className="space-y-4">
            {filteredTugas.length > 0 ? (
              filteredTugas.map((item) => (
                <div
                  key={item.id}
                  className="
                    theme-card
                    rounded-2xl
                    border
                    theme-border
                    overflow-hidden
                    transition-all
                    hover:-translate-y-[1px]
                    shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_4%,transparent)]
                    hover:shadow-[0_8px_28px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
                  "
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                      {/* ICON */}

                      <div
                        className={`
                          w-12 h-12 rounded-xl
                          ${themePrimarySoft}
                          flex items-center justify-center
                          shrink-0
                          text-[var(--color-primary)]
                        `}
                      >
                        <ClipboardList size={23} />
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-base md:text-lg font-bold theme-text">
                            {item.judul}
                          </h2>

                          <StatusBadge
                            status={item.status}
                          />
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs theme-text-secondary mb-3">
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

                        <p className="text-sm theme-text-secondary line-clamp-2 max-w-3xl">
                          {item.deskripsi}
                        </p>

                        {/* META */}

                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="flex items-center gap-2 text-xs theme-text-secondary">
                            <CalendarDays
                              size={15}
                              className="text-[var(--color-primary)]"
                            />

                            <span>
                              Deadline:{" "}
                              <strong className="theme-text">
                                {formatTanggal(
                                  item.deadline
                                )}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs theme-text-secondary">
                            <Clock3
                              size={15}
                              className="text-[var(--color-warning)]"
                            />

                            <span>
                              <strong className="theme-text">
                                {item.waktu}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs theme-text-secondary">
                            <Users
                              size={15}
                              className="text-[var(--color-info)]"
                            />

                            <span>
                              Guru:{" "}
                              <strong className="theme-text">
                                {item.guru}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTION */}

                      <div className="flex lg:flex-col items-center gap-2">
                        {/* DETAIL */}

                        <button
                          onClick={() =>
                            openDetailModal(item)
                          }
                          className={`
                            w-9 h-9
                            rounded-lg
                            border
                            theme-border
                            flex items-center justify-center
                            theme-text-secondary
                            ${themePrimaryHover}
                            hover:text-[var(--color-primary)]
                            hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]
                            transition-all
                          `}
                          title="Lihat detail"
                        >
                          <Eye size={16} />
                        </button>

                        {/* EDIT */}

                        <button
                          onClick={() =>
                            openEditModal(item)
                          }
                          className="
                            w-9 h-9
                            rounded-lg
                            border
                            theme-border
                            flex items-center justify-center
                            theme-text-secondary
                            hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]
                            hover:text-[var(--color-warning)]
                            hover:border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]
                            transition-all
                          "
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className="
                            w-9 h-9
                            rounded-lg
                            border
                            theme-border
                            flex items-center justify-center
                            theme-text-secondary
                            hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]
                            hover:text-[var(--color-danger)]
                            hover:border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)]
                            transition-all
                          "
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      PROGRESS
                  ================================================== */}

                  <div className="border-t theme-border-soft theme-card-soft px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium theme-text-secondary">
                        Pengumpulan Tugas
                      </span>

                      <span className="text-xs font-semibold theme-text">
                        {item.dikumpulkan}/
                        {item.jumlahSiswa} siswa
                      </span>
                    </div>

                    <div className="h-2 theme-card rounded-full overflow-hidden">
                      <div
                        className="
                          h-full
                          bg-[var(--color-primary)]
                          rounded-full
                          transition-all
                        "
                        style={{
                          width: `${getProgress(item)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* ==================================================
                 EMPTY STATE
              ================================================== */

              <div className="theme-card rounded-2xl border theme-border p-12 text-center">
                <div
                  className={`
                    w-14 h-14 rounded-full
                    ${themePrimarySoft}
                    flex items-center justify-center
                    mx-auto mb-3
                    text-[var(--color-primary)]
                  `}
                >
                  <ClipboardList size={25} />
                </div>

                <h3 className="text-sm font-semibold theme-text">
                  Tugas tidak ditemukan
                </h3>

                <p className="text-xs theme-text-muted mt-1">
                  Coba ubah kata pencarian atau filter.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========================================================
          MODAL
      ======================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-text)_40%,transparent)] backdrop-blur-sm">
          <div
            className="
              w-full max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              theme-card
              rounded-2xl
              shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]
              border
              theme-border
            "
          >
            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div
              className="
                sticky top-0
                theme-card
                border-b
                theme-border-soft
                px-5 py-4
                flex items-center justify-between
                z-10
              "
            >
              <div>
                <h2 className="text-lg font-bold theme-text">
                  {modalType === "add"
                    ? "Tambah Tugas"
                    : modalType === "edit"
                    ? "Edit Tugas"
                    : "Detail Tugas"}
                </h2>

                <p className="text-xs theme-text-muted mt-0.5">
                  {modalType === "detail"
                    ? "Informasi lengkap tugas siswa"
                    : "Lengkapi informasi tugas"}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="
                  w-9 h-9
                  rounded-lg
                  theme-text-secondary
                  flex items-center justify-center
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  transition-colors
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* ==================================================
                DETAIL
            ================================================== */}

            {modalType === "detail" &&
            selectedTugas ? (
              <div className="p-5">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`
                      w-12 h-12 rounded-xl
                      ${themePrimarySoft}
                      text-[var(--color-primary)]
                      flex items-center justify-center
                      shrink-0
                    `}
                  >
                    <ClipboardList size={23} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold theme-text">
                        {selectedTugas.judul}
                      </h3>

                      <StatusBadge
                        status={selectedTugas.status}
                      />
                    </div>

                    <p className="text-sm theme-text-muted mt-1">
                      {selectedTugas.mapel} •{" "}
                      {selectedTugas.kelas}
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

                <div className="theme-card-soft rounded-xl p-4 border theme-border-soft">
                  <p className="text-xs font-semibold theme-text-secondary mb-2">
                    Deskripsi Tugas
                  </p>

                  <p className="text-sm theme-text-secondary leading-relaxed">
                    {selectedTugas.deskripsi ||
                      "Tidak ada deskripsi."}
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                  <button
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="
                      px-4 py-2.5
                      rounded-xl
                      border
                      theme-border
                      text-sm
                      font-medium
                      theme-text-secondary
                      hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                      transition-colors
                    "
                  >
                    Tutup
                  </button>

                  <button
                    onClick={() =>
                      openEditModal(selectedTugas)
                    }
                    className="
                      px-4 py-2.5
                      rounded-xl
                      bg-[var(--color-primary)]
                      hover:opacity-90
                      text-white
                      text-sm
                      font-semibold
                      transition-all
                    "
                  >
                    Edit Tugas
                  </button>
                </div>
              </div>
            ) : (
              /* ==================================================
                 FORM
              ================================================== */

              <form
                onSubmit={handleSubmit}
                className="p-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* JUDUL */}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                      Judul Tugas{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        theme-text-placeholder
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    />
                  </div>

                  {/* MAPEL */}

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                      Mata Pelajaran{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        theme-text-placeholder
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    />
                  </div>

                  {/* KELAS */}

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                      Kelas{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        theme-text-placeholder
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    />
                  </div>

                  {/* GURU */}

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        theme-text-placeholder
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    />
                  </div>

                  {/* TIPE */}

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    >
                      <option>
                        Tugas Individu
                      </option>

                      <option>
                        Tugas Kelompok
                      </option>

                      <option>
                        Proyek
                      </option>

                      <option>
                        Praktikum
                      </option>
                    </select>
                  </div>

                  {/* DEADLINE */}

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                      Deadline{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    />
                  </div>

                  {/* WAKTU */}

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    />
                  </div>

                  {/* STATUS */}

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    >
                      <option value="Draft">
                        Draft
                      </option>

                      <option value="Published">
                        Published
                      </option>
                    </select>
                  </div>

                  {/* DESKRIPSI */}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
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
                      className="
                        theme-input
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border
                        theme-border
                        text-sm
                        theme-text
                        theme-text-placeholder
                        resize-none
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                        focus:border-[var(--color-primary)]
                      "
                    />
                  </div>
                </div>

                {/* ==================================================
                    INFO
                ================================================== */}

                <div
                  className={`
                    mt-4
                    flex items-start gap-2
                    p-3 rounded-xl
                    ${themePrimarySoft}
                    border
                    ${themePrimarySoftBorder}
                  `}
                >
                  <AlertCircle
                    size={16}
                    className="text-[var(--color-primary)] mt-0.5 shrink-0"
                  />

                  <p className="text-xs text-[var(--color-primary)] leading-relaxed">
                    Data tugas saat ini masih tersimpan sementara di
                    frontend. Setelah API backend tersedia, bagian ini
                    dapat dihubungkan ke endpoint tugas siswa.
                  </p>
                </div>

                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t theme-border-soft">
                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="
                      px-4 py-2.5
                      rounded-xl
                      border
                      theme-border
                      text-sm
                      font-medium
                      theme-text-secondary
                      hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                      transition-colors
                    "
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="
                      px-5 py-2.5
                      rounded-xl
                      bg-[var(--color-primary)]
                      hover:opacity-90
                      text-white
                      text-sm
                      font-semibold
                      shadow-[0_6px_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                      transition-all
                    "
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
  variant = "primary",
}) {
  const variantConfig = {
    primary: {
      bg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
      text: "text-[var(--color-primary)]",
    },

    success: {
      bg: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
      text: "text-[var(--color-success)]",
    },

    warning: {
      bg: "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
      text: "text-[var(--color-warning)]",
    },

    info: {
      bg: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
      text: "text-[var(--color-info)]",
    },
  };

  const current =
    variantConfig[variant] ||
    variantConfig.primary;

  return (
    <div
      className="
        theme-card
        rounded-2xl
        border
        theme-border
        p-5
        shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_4%,transparent)]
      "
    >
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
          className={`
            w-11 h-11
            rounded-xl
            ${current.bg}
            flex items-center justify-center
            ${current.text}
          `}
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
      <span
        className="
          inline-flex items-center gap-1
          px-2.5 py-1
          rounded-full
          text-[10px]
          font-semibold
          bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
          text-[var(--color-success)]
          border
          border-[color-mix(in_srgb,var(--color-success)_20%,transparent)]
        "
      >
        <CheckCircle2 size={11} />
        Published
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex items-center gap-1
        px-2.5 py-1
        rounded-full
        text-[10px]
        font-semibold
        bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]
        text-[var(--color-warning)]
        border
        border-[color-mix(in_srgb,var(--color-warning)_20%,transparent)]
      "
    >
      <Clock3 size={11} />
      Draft
    </span>
  );
}

/* ============================================================
   DETAIL BOX
============================================================ */

function DetailBox({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="theme-card-soft border theme-border-soft rounded-xl p-3.5">
      <div className="flex items-center gap-2 text-xs theme-text-muted mb-1.5">
        <Icon size={14} />
        {label}
      </div>

      <p className="text-sm font-semibold theme-text">
        {value || "-"}
      </p>
    </div>
  );
}