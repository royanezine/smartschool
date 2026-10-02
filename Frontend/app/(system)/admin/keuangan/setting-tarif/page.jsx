"use client";

import { useState } from "react";
import {
  Save,
  Edit,
  Plus,
  Trash2,
  Tag,
  X,
  Check,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings2,
  CircleDollarSign,
  Receipt,
  AlertCircle,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

export default function SettingTarifPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(4);

  // =========================================================
  // MODAL STATES
  // =========================================================
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("tambah");
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nominal: "",
    keterangan: "",
    aktif: true,
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // =========================================================
  // DATA DUMMY
  // =========================================================
  const [tarif, setTarif] = useState([
    {
      id: 1,
      nama: "SPP",
      nominal: 150000,
      keterangan: "Bulanan",
      aktif: true,
    },
    {
      id: 2,
      nama: "Uang Pangkal",
      nominal: 500000,
      keterangan: "Sekali",
      aktif: true,
    },
    {
      id: 3,
      nama: "Kegiatan Ekstrakurikuler",
      nominal: 75000,
      keterangan: "Bulanan",
      aktif: false,
    },
    {
      id: 4,
      nama: "Ujian Nasional",
      nominal: 200000,
      keterangan: "Sekali",
      aktif: true,
    },
    {
      id: 5,
      nama: "Biaya Praktek",
      nominal: 100000,
      keterangan: "Per Semester",
      aktif: true,
    },
    {
      id: 6,
      nama: "Dana Sosial",
      nominal: 50000,
      keterangan: "Bulanan",
      aktif: false,
    },
    {
      id: 7,
      nama: "Perpustakaan",
      nominal: 25000,
      keterangan: "Bulanan",
      aktif: true,
    },
  ]);

  // =========================================================
  // STATISTIK
  // =========================================================
  const totalTarif = tarif.length;

  const totalNominal = tarif.reduce(
    (total, item) => total + item.nominal,
    0
  );

  const totalAktif = tarif.filter((item) => item.aktif).length;

  const totalNonaktif = totalTarif - totalAktif;

  // =========================================================
  // FILTER
  // =========================================================
  const filtered = tarif.filter((item) => {
    const keyword = search.toLowerCase().trim();

    const matchSearch =
      item.nama.toLowerCase().includes(keyword) ||
      item.keterangan.toLowerCase().includes(keyword);

    const matchFilter =
      filter === "semua" ||
      (filter === "aktif" && item.aktif) ||
      (filter === "nonaktif" && !item.aktif);

    return matchSearch && matchFilter;
  });

  // =========================================================
  // PAGINATION
  // =========================================================
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / entriesPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const indexOfLast = safeCurrentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;

  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);

  // =========================================================
  // MODAL TAMBAH
  // =========================================================
  const openTambahModal = () => {
    setModalMode("tambah");

    setFormData({
      nama: "",
      nominal: "",
      keterangan: "",
      aktif: true,
    });

    setSelectedId(null);
    setShowModal(true);
  };

  // =========================================================
  // MODAL EDIT
  // =========================================================
  const openEditModal = (item) => {
    setModalMode("edit");

    setFormData({
      nama: item.nama,
      nominal: String(item.nominal),
      keterangan: item.keterangan,
      aktif: item.aktif,
    });

    setSelectedId(item.id);
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================
  const closeModal = () => {
    setShowModal(false);

    setFormData({
      nama: "",
      nominal: "",
      keterangan: "",
      aktif: true,
    });

    setSelectedId(null);
  };

  // =========================================================
  // SAVE
  // =========================================================
  const handleSave = () => {
    if (!formData.nama.trim() || !formData.nominal.trim()) {
      return;
    }

    const nominal = parseInt(
      formData.nominal.replace(/\D/g, ""),
      10
    );

    if (Number.isNaN(nominal) || nominal <= 0) {
      return;
    }

    if (modalMode === "tambah") {
      const newId =
        tarif.length > 0
          ? Math.max(...tarif.map((item) => item.id)) + 1
          : 1;

      const newTarif = {
        id: newId,
        nama: formData.nama.trim(),
        nominal,
        keterangan: formData.keterangan.trim() || "-",
        aktif: formData.aktif,
      };

      setTarif((prev) => [...prev, newTarif]);

      setCurrentPage(1);
    } else {
      setTarif((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                nama: formData.nama.trim(),
                nominal,
                keterangan: formData.keterangan.trim() || "-",
                aktif: formData.aktif,
              }
            : item
        )
      );
    }

    closeModal();
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================
  const toggleStatus = (id) => {
    setTarif((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              aktif: !item.aktif,
            }
          : item
      )
    );
  };

  // =========================================================
  // DELETE CONFIRM
  // =========================================================
  const confirmDelete = (id) => {
    setDeleteConfirm(id);
    setShowDeleteModal(true);
  };

  // =========================================================
  // DELETE
  // =========================================================
  const handleDelete = () => {
    setTarif((prev) =>
      prev.filter((item) => item.id !== deleteConfirm)
    );

    setShowDeleteModal(false);
    setDeleteConfirm(null);

    setCurrentPage((prev) => {
      const nextFilteredLength = filtered.length - 1;
      const nextTotalPages = Math.max(
        1,
        Math.ceil(nextFilteredLength / entriesPerPage)
      );

      return Math.min(prev, nextTotalPages);
    });
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================
  const formatRupiah = (value) => {
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <Sidebar
        active="settingTarif"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* =====================================================
            MAIN
        ===================================================== */}
        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            {/* =================================================
                PAGE HEADER
            ================================================= */}
            <div
              className="
                theme-card
                theme-border
                mb-6
                overflow-hidden
                rounded-2xl
                border
                p-6
                shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_10%,transparent)]
                sm:p-8
              "
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]
                      bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]
                      text-[var(--color-primary)]
                    "
                  >
                    <Settings2 size={28} />
                  </div>

                  {/* Title */}
                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-[var(--color-primary)]
                      "
                    >
                      Keuangan & Kas
                    </p>

                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Setting Tarif Tagihan
                    </h1>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Kelola tarif biaya sekolah secara terpusat
                    </p>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={openTambahModal}
                  className="
                    theme-primary
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]
                    transition
                    hover:opacity-90
                  "
                >
                  <Plus size={16} />
                  Tambah Tarif
                </button>
              </div>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Tag size={22} />}
                label="Total Tarif"
                value={totalTarif}
                color="blue"
                subtext="Semua jenis tarif"
              />

              <StatCard
                icon={<CircleDollarSign size={22} />}
                label="Total Nominal"
                value={formatRupiah(totalNominal)}
                color="emerald"
                subtext="Total semua tarif"
              />

              <StatCard
                icon={<Check size={22} />}
                label="Tarif Aktif"
                value={totalAktif}
                color="purple"
                subtext="Sedang digunakan"
              />

              <StatCard
                icon={<X size={22} />}
                label="Tarif Nonaktif"
                value={totalNonaktif}
                color="red"
                subtext="Tidak digunakan"
              />
            </div>

            {/* =================================================
                SEARCH & FILTER
            ================================================= */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="
                    theme-text-muted
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama tarif atau keterangan..."
                  className="
                    theme-input
                    theme-border
                    theme-text
                    w-full
                    rounded-xl
                    border
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    placeholder:text-[var(--color-text-placeholder)]
                    focus:border-[var(--color-primary)]
                    focus:ring-4
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  "
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                  theme-input
                  theme-border
                  theme-text
                  rounded-xl
                  border
                  px-4
                  py-2.5
                  text-sm
                  outline-none
                  transition
                  focus:border-[var(--color-primary)]
                  focus:ring-4
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                "
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>

              {/* Refresh */}
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("semua");
                  setCurrentPage(1);
                }}
                className="
                  theme-border
                  theme-card
                  theme-text-secondary
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  transition
                  hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                  hover:text-[var(--color-primary)]
                "
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}
            <div
              className="
                theme-card
                theme-border
                overflow-hidden
                rounded-2xl
                border
                shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
              "
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {/* Table Header */}
                  <thead>
                    <tr
                      className="
                        theme-border
                        border-b
                        bg-[color-mix(in_srgb,var(--color-primary)_5%,var(--color-card))]
                      "
                    >
                      <th
                        className="
                          theme-text-muted
                          px-4
                          py-3.5
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                        "
                      >
                        Nama Tarif
                      </th>

                      <th
                        className="
                          theme-text-muted
                          px-4
                          py-3.5
                          text-right
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                        "
                      >
                        Nominal
                      </th>

                      <th
                        className="
                          theme-text-muted
                          px-4
                          py-3.5
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                        "
                      >
                        Keterangan
                      </th>

                      <th
                        className="
                          theme-text-muted
                          px-4
                          py-3.5
                          text-center
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                        "
                      >
                        Status
                      </th>

                      <th
                        className="
                          theme-text-muted
                          px-4
                          py-3.5
                          text-center
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                        "
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {currentEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText
                              size={32}
                              className="theme-text-placeholder"
                            />

                            <p className="theme-text-secondary text-sm font-medium">
                              Tidak ada tarif ditemukan
                            </p>

                            <p className="theme-text-muted text-xs">
                              Coba ubah kata kunci pencarian atau filter
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((item) => (
                        <tr
                          key={item.id}
                          className="
                            group
                            transition
                            hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]
                          "
                        >
                          {/* Nama */}
                          <td className="theme-text px-4 py-3.5 font-medium">
                            <div className="flex items-center gap-2">
                              <Receipt
                                size={15}
                                className="text-[var(--color-primary)]"
                              />

                              {item.nama}
                            </div>
                          </td>

                          {/* Nominal */}
                          <td className="theme-text px-4 py-3.5 text-right font-bold">
                            {formatRupiah(item.nominal)}
                          </td>

                          {/* Keterangan */}
                          <td className="theme-text-secondary px-4 py-3.5">
                            {item.keterangan}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleStatus(item.id)}
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                border
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                transition
                              "
                              style={{
                                borderColor: item.aktif
                                  ? "color-mix(in srgb, var(--color-success) 25%, transparent)"
                                  : "var(--color-border)",
                                backgroundColor: item.aktif
                                  ? "color-mix(in srgb, var(--color-success) 10%, var(--color-card))"
                                  : "color-mix(in srgb, var(--color-text-muted) 8%, var(--color-card))",
                                color: item.aktif
                                  ? "var(--color-success)"
                                  : "var(--color-text-muted)",
                              }}
                            >
                              {item.aktif ? (
                                <>
                                  <Check size={12} />
                                  Aktif
                                </>
                              ) : (
                                <>
                                  <X size={12} />
                                  Nonaktif
                                </>
                              )}
                            </button>
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="
                                  theme-text-muted
                                  rounded-lg
                                  p-1.5
                                  transition
                                  hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                                  hover:text-[var(--color-primary)]
                                "
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => confirmDelete(item.id)}
                                className="
                                  theme-text-muted
                                  rounded-lg
                                  p-1.5
                                  transition
                                  hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]
                                  hover:text-[var(--color-danger)]
                                "
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}
              {filtered.length > 0 && (
                <div
                  className="
                    theme-border
                    flex
                    flex-col
                    gap-3
                    border-t
                    bg-[color-mix(in_srgb,var(--color-primary)_3%,var(--color-card))]
                    px-4
                    py-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <p className="theme-text-secondary text-sm">
                    Menampilkan {indexOfFirst + 1}-
                    {Math.min(indexOfLast, filtered.length)} dari{" "}
                    {filtered.length} tarif
                  </p>

                  <div className="flex items-center gap-1">
                    {/* Previous */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.max(1, page - 1)
                        )
                      }
                      disabled={safeCurrentPage === 1}
                      className="
                        theme-border
                        theme-card
                        theme-text-secondary
                        rounded-lg
                        border
                        p-2
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                        hover:text-[var(--color-primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Pages */}
                    {Array.from(
                      { length: totalPages },
                      (_, index) => {
                        const page = index + 1;

                        return (
                          <button
                            type="button"
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`
                              rounded-lg
                              px-3.5
                              py-1.5
                              text-sm
                              font-medium
                              transition
                              ${
                                safeCurrentPage === page
                                  ? "theme-primary shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
                                  : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-card))] hover:text-[var(--color-primary)]"
                              }
                            `}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    {/* Next */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={safeCurrentPage === totalPages}
                      className="
                        theme-border
                        theme-card
                        theme-text-secondary
                        rounded-lg
                        border
                        p-2
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                        hover:text-[var(--color-primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}
            <footer
              className="
                theme-border-soft
                theme-text-muted
                mt-8
                border-t
                pt-6
                text-center
                text-xs
              "
            >
              © 2026 SmartSchool • Setting Tarif Tagihan
            </footer>
          </div>
        </main>
      </div>

      {/* =======================================================
          MODAL TAMBAH / EDIT
      ======================================================= */}
      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-[color-mix(in_srgb,var(--color-text)_50%,transparent)]
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              theme-card
              theme-border
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-2xl
              border
              shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]
            "
          >
            {/* Modal Header */}
            <div
              className="
                theme-border
                flex
                items-center
                justify-between
                border-b
                px-6
                py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-primary)_10%,var(--color-card))]
                    text-[var(--color-primary)]
                  "
                >
                  {modalMode === "tambah" ? (
                    <Plus size={20} />
                  ) : (
                    <Edit size={20} />
                  )}
                </div>

                <div>
                  <h2 className="theme-text text-lg font-bold">
                    {modalMode === "tambah"
                      ? "Tambah Tarif"
                      : "Edit Tarif"}
                  </h2>

                  <p className="theme-text-muted text-xs">
                    {modalMode === "tambah"
                      ? "Buat tarif baru"
                      : "Perbarui data tarif"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="
                  theme-text-muted
                  rounded-lg
                  p-1.5
                  transition
                  hover:bg-[color-mix(in_srgb,var(--color-text-muted)_10%,transparent)]
                  hover:text-[var(--color-text)]
                "
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6">
              {/* Nama Tarif */}
              <div>
                <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                  Nama Tarif{" "}
                  <span className="text-[var(--color-danger)]">*</span>
                </label>

                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nama: e.target.value,
                    })
                  }
                  placeholder="Contoh: SPP, Uang Pangkal"
                  className="
                    theme-input
                    theme-border
                    theme-text
                    w-full
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    placeholder:text-[var(--color-text-placeholder)]
                    focus:border-[var(--color-primary)]
                    focus:ring-4
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  "
                />
              </div>

              {/* Nominal */}
              <div>
                <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                  Nominal{" "}
                  <span className="text-[var(--color-danger)]">*</span>
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.nominal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nominal: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Contoh: 150000"
                  className="
                    theme-input
                    theme-border
                    theme-text
                    w-full
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    placeholder:text-[var(--color-text-placeholder)]
                    focus:border-[var(--color-primary)]
                    focus:ring-4
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  "
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                  Keterangan
                </label>

                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keterangan: e.target.value,
                    })
                  }
                  placeholder="Contoh: Bulanan, Sekali"
                  className="
                    theme-input
                    theme-border
                    theme-text
                    w-full
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    placeholder:text-[var(--color-text-placeholder)]
                    focus:border-[var(--color-primary)]
                    focus:ring-4
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  "
                />
              </div>

              {/* Status */}
              <div>
                <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                  Status
                </label>

                <div className="flex gap-3">
                  {/* Aktif */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        aktif: true,
                      })
                    }
                    className={`
                      flex-1
                      rounded-xl
                      border
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      transition
                      ${
                        formData.aktif
                          ? "border-[color-mix(in_srgb,var(--color-success)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-card))] text-[var(--color-success)]"
                          : "theme-border theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-success)_6%,var(--color-card))]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Check size={16} />
                      Aktif
                    </div>
                  </button>

                  {/* Nonaktif */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        aktif: false,
                      })
                    }
                    className={`
                      flex-1
                      rounded-xl
                      border
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      transition
                      ${
                        !formData.aktif
                          ? "theme-border bg-[color-mix(in_srgb,var(--color-text-muted)_10%,var(--color-card))] theme-text-secondary"
                          : "theme-border theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text-muted)_7%,var(--color-card))]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <X size={16} />
                      Nonaktif
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="
                theme-border
                flex
                justify-end
                gap-3
                border-t
                px-6
                py-4
              "
            >
              <button
                type="button"
                onClick={closeModal}
                className="
                  theme-border
                  theme-card-soft
                  theme-text-secondary
                  rounded-xl
                  border
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                  hover:text-[var(--color-primary)]
                "
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="
                  theme-primary
                  rounded-xl
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  shadow-[0_6px_16px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]
                  transition
                  hover:opacity-90
                "
              >
                <div className="flex items-center gap-2">
                  <Save size={16} />

                  {modalMode === "tambah"
                    ? "Simpan"
                    : "Perbarui"}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          DELETE MODAL
      ======================================================= */}
      {showDeleteModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-[color-mix(in_srgb,var(--color-text)_50%,transparent)]
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              theme-card
              theme-border
              w-full
              max-w-md
              rounded-2xl
              border
              shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]
            "
          >
            <div className="p-6 text-center">
              {/* Alert Icon */}
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)]
                  bg-[color-mix(in_srgb,var(--color-danger)_10%,var(--color-card))]
                  text-[var(--color-danger)]
                "
              >
                <AlertCircle size={32} />
              </div>

              <h3 className="theme-text text-lg font-bold">
                Hapus Tarif?
              </h3>

              <p className="theme-text-muted mt-2 text-sm">
                Apakah Anda yakin ingin menghapus tarif ini?
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="mt-6 flex justify-center gap-3">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirm(null);
                  }}
                  className="
                    theme-border
                    theme-card-soft
                    theme-text-secondary
                    rounded-xl
                    border
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    transition
                    hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                    hover:text-[var(--color-primary)]
                  "
                >
                  Batal
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="
                    rounded-xl
                    bg-[var(--color-danger)]
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_6px_16px_color-mix(in_srgb,var(--color-danger)_22%,transparent)]
                    transition
                    hover:opacity-90
                  "
                >
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} />
                    Hapus
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================
function StatCard({
  icon,
  label,
  value,
  color,
  subtext,
}) {
  const colors = {
    blue: {
      wrapper:
        "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]",
      icon:
        "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]",
    },

    emerald: {
      wrapper:
        "border-[color-mix(in_srgb,var(--color-success)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_7%,var(--color-card))]",
      icon:
        "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]",
    },

    purple: {
      wrapper:
        "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]",
      icon:
        "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]",
    },

    red: {
      wrapper:
        "border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_7%,var(--color-card))]",
      icon:
        "bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]",
    },
  };

  const selected = colors[color] || colors.blue;

  return (
    <div
      className={`
        theme-card
        theme-border
        group
        rounded-2xl
        border
        p-5
        shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_7%,transparent)]
        transition
        hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]
        ${selected.wrapper}
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            transition
            group-hover:scale-105
            ${selected.icon}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="theme-text-muted text-xs font-medium">
            {label}
          </p>

          <p className="theme-text mt-1 text-xl font-bold">
            {value}
          </p>

          {subtext && (
            <p className="theme-text-muted mt-0.5 text-xs">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}