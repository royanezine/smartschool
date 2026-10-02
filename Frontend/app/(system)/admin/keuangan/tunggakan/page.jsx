"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  X,
  Calendar,
  Download,
  Printer,
  FileText,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

export default function TrackingTunggakanPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTunggakan, setSelectedTunggakan] = useState(null);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const [tunggakan, setTunggakan] = useState([
    {
      id: 1,
      siswa: "Siti Rahma",
      kelas: "XI IPS 2",
      nisn: "1234567890",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 5,
      status: "Menunggak",
      kategori: "SPP",
      denda: 15000,
      totalTagihan: 165000,
      tanggalTagihan: "2026-09-01",
    },
    {
      id: 2,
      siswa: "Dewi Lestari",
      kelas: "XII IPS 1",
      nisn: "1234567891",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 8,
      status: "Menunggak",
      kategori: "SPP",
      denda: 24000,
      totalTagihan: 174000,
      tanggalTagihan: "2026-09-01",
    },
    {
      id: 3,
      siswa: "Budi Santoso",
      kelas: "X MIPA 3",
      nisn: "1234567892",
      tagihan: "Uang Pangkal",
      nominal: 500000,
      jatuhTempo: "2026-08-31",
      hari: 12,
      status: "Menunggak",
      kategori: "Pangkal",
      denda: 60000,
      totalTagihan: 560000,
      tanggalTagihan: "2026-08-01",
    },
    {
      id: 4,
      siswa: "Ahmad Fauzi",
      kelas: "XII IPA 1",
      nisn: "1234567893",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 0,
      status: "Lunas",
      kategori: "SPP",
      denda: 0,
      totalTagihan: 150000,
      tanggalTagihan: "2026-09-01",
      tanggalBayar: "2026-09-08",
    },
    {
      id: 5,
      siswa: "Eko Prasetyo",
      kelas: "XI IPA 2",
      nisn: "1234567894",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 3,
      status: "Menunggak",
      kategori: "SPP",
      denda: 9000,
      totalTagihan: 159000,
      tanggalTagihan: "2026-09-01",
    },
    {
      id: 6,
      siswa: "Rina Anggraini",
      kelas: "XII IPA 2",
      nisn: "1234567895",
      tagihan: "Kegiatan Ekstrakurikuler",
      nominal: 75000,
      jatuhTempo: "2026-09-15",
      hari: 0,
      status: "Lunas",
      kategori: "Ekstra",
      denda: 0,
      totalTagihan: 75000,
      tanggalTagihan: "2026-09-01",
      tanggalBayar: "2026-09-12",
    },
    {
      id: 7,
      siswa: "Maya Sari",
      kelas: "X MIPA 1",
      nisn: "1234567896",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 6,
      status: "Menunggak",
      kategori: "SPP",
      denda: 18000,
      totalTagihan: 168000,
      tanggalTagihan: "2026-09-01",
    },
  ]);

  const totalTunggakan = tunggakan.filter(
    (t) => t.status === "Menunggak"
  ).length;

  const totalLunas = tunggakan.filter(
    (t) => t.status === "Lunas"
  ).length;

  const totalNominalTunggak = tunggakan
    .filter((t) => t.status === "Menunggak")
    .reduce((a, b) => a + b.totalTagihan, 0);

  const totalSiswaTunggak = new Set(
    tunggakan
      .filter((t) => t.status === "Menunggak")
      .map((t) => t.siswa)
  ).size;

  const filtered = tunggakan.filter((t) => {
    const matchSearch =
      t.siswa.toLowerCase().includes(search.toLowerCase()) ||
      t.kelas.toLowerCase().includes(search.toLowerCase()) ||
      t.nisn.includes(search);

    const matchFilter =
      filter === "semua" || t.status === filter;

    return matchSearch && matchFilter;
  });

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    filtered.length / entriesPerPage
  );

  const handleViewDetail = (item) => {
    setSelectedTunggakan(item);
    setShowDetailModal(true);
  };

  const handleEdit = (item) => {
    setSelectedTunggakan(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedTunggakan(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedTunggakan) {
      setTunggakan(
        tunggakan.filter(
          (t) => t.id !== selectedTunggakan.id
        )
      );

      setShowDeleteModal(false);
      setSelectedTunggakan(null);
    }
  };

  const handleAddPayment = () => {
    setShowAddModal(true);
  };

  const saveEdit = () => {
    setShowEditModal(false);
    setSelectedTunggakan(null);
  };

  const saveAdd = () => {
    setShowAddModal(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
      <Sidebar
        active="trackingTunggakan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden theme-page">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">

            {/* BREADCRUMB */}
            <div className="mb-6 flex items-center gap-2 text-sm">
              <button
                onClick={() => window.history.back()}
                className="
                  inline-flex items-center gap-1.5
                  theme-text-secondary
                  transition
                  hover:text-[var(--color-primary)]
                "
              >
                <ArrowLeft size={16} />
                <span className="font-medium">
                  Kembali
                </span>
              </button>

              <span className="theme-text-placeholder">
                /
              </span>

              <span className="theme-text-muted">
                Keuangan
              </span>

              <span className="theme-text-placeholder">
                /
              </span>

              <span className="font-medium theme-primary">
                Tracking Tunggakan
              </span>
            </div>

            {/* HEADER */}
            <div className="mb-6 rounded-2xl theme-header p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-14 w-14 shrink-0
                      items-center justify-center
                      rounded-xl
                      border
                      border-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]
                      bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]
                      theme-danger
                    "
                  >
                    <AlertCircle size={28} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider theme-primary">
                      Keuangan & Kas
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                      Tracking Tunggakan
                    </h1>

                    <p className="mt-1 text-sm theme-text-secondary">
                      Pantau dan kelola tagihan siswa yang menunggak
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="
                      inline-flex items-center gap-2
                      rounded-lg
                      theme-card-soft
                      px-4 py-2.5
                      text-sm font-medium
                      theme-text-secondary
                      transition
                      hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]
                    "
                  >
                    <Printer size={16} />
                    Cetak
                  </button>

                  <button
                    className="
                      inline-flex items-center gap-2
                      rounded-lg
                      theme-card-soft
                      px-4 py-2.5
                      text-sm font-medium
                      theme-text-secondary
                      transition
                      hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]
                    "
                  >
                    <Download size={16} />
                    Ekspor
                  </button>

                  <button
                    onClick={handleAddPayment}
                    className="
                      inline-flex items-center gap-2
                      rounded-lg
                      theme-primary
                      px-4 py-2.5
                      text-sm font-medium
                      transition
                      shadow-[0_10px_30px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                      hover:brightness-95
                    "
                  >
                    <Plus size={16} />
                    Tambah Pembayaran
                  </button>
                </div>
              </div>
            </div>

            {/* STATISTIK */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<AlertCircle size={22} />}
                label="Total Tunggakan"
                value={totalTunggakan}
                color="red"
                subtext="Tagihan yang belum dibayar"
              />

              <StatCard
                icon={<DollarSign size={22} />}
                label="Total Nominal Tunggak"
                value={`Rp ${totalNominalTunggak.toLocaleString()}`}
                color="blue"
                subtext="Total tagihan + denda"
              />

              <StatCard
                icon={<Users size={22} />}
                label="Siswa Tunggak"
                value={totalSiswaTunggak}
                color="purple"
                subtext="Jumlah siswa menunggak"
              />

              <StatCard
                icon={<CheckCircle2 size={22} />}
                label="Lunas"
                value={totalLunas}
                color="emerald"
                subtext="Tagihan sudah dibayar"
              />
            </div>

            {/* FILTER & SEARCH */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari siswa, kelas, atau NISN..."
                  className="
                    w-full rounded-xl
                    theme-input
                    py-2.5 pl-10 pr-4
                    text-sm outline-none transition
                    placeholder:theme-text-placeholder
                    focus:border-[var(--color-primary)]
                    focus:ring-4
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  "
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="
                    rounded-xl
                    theme-input
                    px-4 py-2.5
                    text-sm
                    outline-none
                    focus:border-[var(--color-primary)]
                    focus:ring-4
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  "
                >
                  <option value="semua">
                    Semua Status
                  </option>
                  <option value="Menunggak">
                    Menunggak
                  </option>
                  <option value="Lunas">
                    Lunas
                  </option>
                </select>

                <button
                  className="
                    inline-flex items-center gap-2
                    rounded-xl
                    border theme-border
                    theme-card
                    px-4 py-2.5
                    text-sm font-medium
                    theme-text-secondary
                    transition
                    hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  "
                >
                  <Calendar size={16} />
                  Periode
                </button>
              </div>
            </div>

            {/* TABEL */}
            <div
              className="
                overflow-hidden rounded-2xl
                border theme-border
                theme-card
                shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
              "
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                      <TableHead>Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Tagihan</TableHead>
                      <TableHead align="right">Nominal</TableHead>
                      <TableHead align="right">Denda</TableHead>
                      <TableHead align="right">Total</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead align="center">Status</TableHead>
                      <TableHead align="center">Aksi</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y theme-border-soft">
                    {currentEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-12 text-center theme-text-muted"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText
                              size={32}
                              className="theme-text-placeholder"
                            />

                            <p className="text-sm font-medium">
                              Tidak ada data tunggakan
                            </p>

                            <p className="text-xs">
                              Coba ubah kata kunci pencarian
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((item) => (
                        <tr
                          key={item.id}
                          className="
                            group transition
                            hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                          "
                        >
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="font-medium theme-text">
                                {item.siswa}
                              </p>

                              <p className="text-xs theme-text-muted">
                                NISN: {item.nisn}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 theme-text-secondary">
                            {item.kelas}
                          </td>

                          <td className="px-4 py-3.5">
                            <div>
                              <p className="theme-text-secondary">
                                {item.tagihan}
                              </p>

                              <p className="text-xs theme-text-muted">
                                {item.kategori}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right font-medium theme-text-secondary">
                            Rp {item.nominal.toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5 text-right font-medium theme-danger">
                            {item.denda > 0
                              ? `Rp ${item.denda.toLocaleString()}`
                              : "-"}
                          </td>

                          <td className="px-4 py-3.5 text-right font-bold theme-text">
                            Rp {item.totalTagihan.toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5 theme-text-secondary">
                            <div className="flex items-center gap-1.5">
                              <Calendar
                                size={14}
                                className="theme-text-muted"
                              />

                              {item.jatuhTempo}

                              {item.hari > 0 && (
                                <span
                                  className="
                                    ml-1 rounded-full
                                    theme-danger
                                    bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]
                                    px-2 py-0.5
                                    text-xs font-medium
                                  "
                                >
                                  +{item.hari} hari
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <StatusBadge
                              status={item.status}
                            />
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ActionButton
                                onClick={() =>
                                  handleViewDetail(item)
                                }
                                type="primary"
                                title="Lihat detail"
                              >
                                <Eye size={16} />
                              </ActionButton>

                              <ActionButton
                                onClick={() =>
                                  handleEdit(item)
                                }
                                type="primary"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </ActionButton>

                              <ActionButton
                                onClick={() =>
                                  handleDelete(item)
                                }
                                type="danger"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filtered.length > 0 && (
                <div
                  className="
                    flex items-center justify-between
                    border-t theme-border
                    bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]
                    px-4 py-3
                  "
                >
                  <p className="text-sm theme-text-muted">
                    Menampilkan {indexOfFirst + 1}-
                    {Math.min(indexOfLast, filtered.length)} dari{" "}
                    {filtered.length} data
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.max(1, p - 1)
                        )
                      }
                      disabled={currentPage === 1}
                      className="
                        rounded-lg border theme-border
                        theme-card
                        p-2 theme-text-muted
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                        disabled:opacity-40
                      "
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            setCurrentPage(i + 1)
                          }
                          className={`
                            rounded-lg px-3.5 py-1.5
                            text-sm font-medium transition
                            ${
                              currentPage === i + 1
                                ? "theme-primary shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
                                : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                            }
                          `}
                        >
                          {i + 1}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(totalPages, p + 1)
                        )
                      }
                      disabled={
                        currentPage === totalPages
                      }
                      className="
                        rounded-lg border theme-border
                        theme-card
                        p-2 theme-text-muted
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                        disabled:opacity-40
                      "
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <footer className="mt-8 border-t theme-border-soft pt-6 text-center text-xs theme-text-muted">
              © 2026 SmartSchool • Tracking Tunggakan
            </footer>
          </div>
        </main>
      </div>

      {/* =========================================================
          MODAL DETAIL
      ========================================================= */}
      {showDetailModal && selectedTunggakan && (
        <Modal
          title="Detail Tunggakan"
          onClose={() => setShowDetailModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Siswa"
                value={selectedTunggakan.siswa}
              />

              <DetailItem
                label="NISN"
                value={selectedTunggakan.nisn}
              />

              <DetailItem
                label="Kelas"
                value={selectedTunggakan.kelas}
              />

              <DetailItem
                label="Kategori"
                value={selectedTunggakan.kategori}
              />

              <DetailItem
                label="Tagihan"
                value={selectedTunggakan.tagihan}
              />

              <div>
                <p className="text-xs font-medium theme-text-muted">
                  Status
                </p>
                <StatusBadge
                  status={selectedTunggakan.status}
                />
              </div>

              <DetailItem
                label="Nominal"
                value={`Rp ${selectedTunggakan.nominal.toLocaleString()}`}
              />

              <DetailItem
                label="Denda"
                value={`Rp ${selectedTunggakan.denda.toLocaleString()}`}
                valueClass="theme-danger"
              />

              <DetailItem
                label="Total"
                value={`Rp ${selectedTunggakan.totalTagihan.toLocaleString()}`}
                valueClass="theme-text"
                bold
              />

              <DetailItem
                label="Jatuh Tempo"
                value={selectedTunggakan.jatuhTempo}
              />

              {selectedTunggakan.tanggalBayar && (
                <DetailItem
                  label="Tanggal Bayar"
                  value={selectedTunggakan.tanggalBayar}
                  valueClass="theme-success"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 border-t theme-border-soft pt-4">
              <button
                onClick={() =>
                  setShowDetailModal(false)
                }
                className="
                  rounded-xl border theme-border
                  theme-card-soft
                  px-4 py-2
                  text-sm font-medium
                  theme-text-secondary
                  transition
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                "
              >
                Tutup
              </button>

              <button
                className="
                  rounded-xl
                  theme-primary
                  px-4 py-2
                  text-sm font-medium
                  transition
                  hover:brightness-95
                "
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL EDIT
      ========================================================= */}
      {showEditModal && selectedTunggakan && (
        <Modal
          title="Edit Tunggakan"
          onClose={() => setShowEditModal(false)}
        >
          <div className="space-y-4">
            <FormField
              label="Nama Siswa"
              type="text"
              value={selectedTunggakan.siswa}
              onChange={(e) =>
                setSelectedTunggakan({
                  ...selectedTunggakan,
                  siswa: e.target.value,
                })
              }
            />

            <FormField
              label="Kelas"
              type="text"
              value={selectedTunggakan.kelas}
              onChange={(e) =>
                setSelectedTunggakan({
                  ...selectedTunggakan,
                  kelas: e.target.value,
                })
              }
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium theme-text-secondary">
                Status
              </label>

              <select
                value={selectedTunggakan.status}
                onChange={(e) =>
                  setSelectedTunggakan({
                    ...selectedTunggakan,
                    status: e.target.value,
                  })
                }
                className="
                  w-full rounded-xl
                  theme-input
                  px-4 py-2.5
                  text-sm outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-4
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                "
              >
                <option value="Menunggak">
                  Menunggak
                </option>
                <option value="Lunas">
                  Lunas
                </option>
              </select>
            </div>

            <ModalActions
              onCancel={() => setShowEditModal(false)}
              onSave={saveEdit}
            />
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL DELETE
      ========================================================= */}
      {showDeleteModal && selectedTunggakan && (
        <Modal
          title="Konfirmasi Hapus"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="space-y-4">
            <div
              className="
                flex items-start gap-4 rounded-xl
                border
                border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)]
                bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]
                p-4
              "
            >
              <AlertCircle
                size={24}
                className="shrink-0 theme-danger"
              />

              <div>
                <p className="text-sm font-semibold theme-danger">
                  Hapus Data Tunggakan?
                </p>

                <p className="text-sm theme-text-secondary">
                  Apakah Anda yakin ingin menghapus data
                  tunggakan untuk{" "}
                  <span className="font-bold theme-text">
                    {selectedTunggakan.siswa}
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="
                  rounded-xl border theme-border
                  theme-card-soft
                  px-4 py-2
                  text-sm font-medium
                  theme-text-secondary
                  transition
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                "
              >
                Batal
              </button>

              <button
                onClick={confirmDelete}
                className="
                  rounded-xl
                  theme-danger
                  px-4 py-2
                  text-sm font-medium
                  transition
                  hover:brightness-95
                "
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL ADD PAYMENT
      ========================================================= */}
      {showAddModal && (
        <Modal
          title="Tambah Pembayaran"
          onClose={() => setShowAddModal(false)}
        >
          <div className="space-y-4">
            <FormSelect
              label="Nama Siswa"
              required
              options={[
                ["", "Pilih Siswa"],
                ["1", "Ahmad Fauzi"],
                ["2", "Siti Rahma"],
                ["3", "Budi Santoso"],
                ["4", "Dewi Lestari"],
                ["5", "Eko Prasetyo"],
              ]}
            />

            <FormSelect
              label="Jenis Tagihan"
              required
              options={[
                ["", "Pilih Tagihan"],
                ["SPP", "SPP"],
                ["Pangkal", "Uang Pangkal"],
                ["Ekstra", "Ekstrakurikuler"],
                ["Ujian", "Ujian Nasional"],
              ]}
            />

            <FormField
              label="Nominal"
              required
              type="number"
              placeholder="Masukkan nominal"
            />

            <FormField
              label="Tanggal Bayar"
              required
              type="date"
            />

            <ModalActions
              onCancel={() => setShowAddModal(false)}
              onSave={saveAdd}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({ children, align = "left" }) {
  const alignment = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  return (
    <th
      className={`
        px-4 py-3.5
        ${alignment[align]}
        text-xs font-semibold
        uppercase tracking-wider
        theme-text-muted
      `}
    >
      {children}
    </th>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const isLunas = status === "Lunas";

  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full
        px-2.5 py-1
        text-xs font-semibold
        ${
          isLunas
            ? "theme-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]"
            : "theme-danger bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
        }
      `}
    >
      {isLunas ? (
        <CheckCircle2 size={12} />
      ) : (
        <Clock size={12} />
      )}

      {status}
    </span>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  children,
  onClick,
  type = "primary",
  title,
}) {
  const styles =
    type === "danger"
      ? `
        hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]
        hover:text-[var(--color-danger)]
      `
      : `
        hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
        hover:text-[var(--color-primary)]
      `;

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        rounded-lg
        p-1.5
        theme-text-muted
        transition
        ${styles}
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
  valueClass = "theme-text",
  bold = false,
}) {
  return (
    <div>
      <p className="text-xs font-medium theme-text-muted">
        {label}
      </p>

      <p
        className={`${
          bold ? "font-bold" : "font-semibold"
        } ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium theme-text-secondary">
        {label}

        {required && (
          <span className="ml-1 theme-danger">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full rounded-xl
          theme-input
          px-4 py-2.5
          text-sm outline-none
          placeholder:theme-text-placeholder
          focus:border-[var(--color-primary)]
          focus:ring-4
          focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
        "
      />
    </div>
  );
}

/* =========================================================
   FORM SELECT
========================================================= */

function FormSelect({
  label,
  required = false,
  options,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium theme-text-secondary">
        {label}

        {required && (
          <span className="ml-1 theme-danger">
            *
          </span>
        )}
      </label>

      <select
        className="
          w-full rounded-xl
          theme-input
          px-4 py-2.5
          text-sm outline-none
          focus:border-[var(--color-primary)]
          focus:ring-4
          focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
        "
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   MODAL ACTIONS
========================================================= */

function ModalActions({
  onCancel,
  onSave,
}) {
  return (
    <div className="flex justify-end gap-2 border-t theme-border-soft pt-4">
      <button
        onClick={onCancel}
        className="
          rounded-xl border theme-border
          theme-card-soft
          px-4 py-2
          text-sm font-medium
          theme-text-secondary
          transition
          hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
        "
      >
        Batal
      </button>

      <button
        onClick={onSave}
        className="
          rounded-xl
          theme-primary
          px-4 py-2
          text-sm font-medium
          transition
          hover:brightness-95
        "
      >
        Simpan
      </button>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  color,
  subtext,
}) {
  const colors = {
    emerald: `
      bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
      text-[var(--color-success)]
    `,

    red: `
      bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]
      text-[var(--color-danger)]
    `,

    blue: `
      bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
      text-[var(--color-primary)]
    `,

    purple: `
      bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]
      text-[var(--color-info)]
    `,
  };

  return (
    <div
      className="
        group rounded-2xl
        border theme-border
        theme-card
        p-5
        shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
        transition
        hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]
      "
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            flex h-12 w-12 shrink-0
            items-center justify-center
            rounded-xl
            transition
            group-hover:scale-105
            ${colors[color]}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium theme-text-muted">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold theme-text">
            {value}
          </p>

          {subtext && (
            <p className="mt-0.5 text-xs theme-text-muted">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-[color-mix(in_srgb,var(--color-text)_55%,transparent)]
        p-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          max-h-[90vh]
          w-full max-w-2xl
          overflow-y-auto
          rounded-2xl
          theme-card
          p-6
          shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold theme-text">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              rounded-lg p-1.5
              theme-text-muted
              transition
              hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]
              hover:text-[var(--color-text)]
            "
          >
            <X size={20} />
          </button>
        </div>

        <div className="divide-y theme-border-soft">
          {children}
        </div>
      </div>
    </div>
  );
}