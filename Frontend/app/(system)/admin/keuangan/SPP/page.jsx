"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  FileText,
  X,
  Wallet,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

export default function SPPPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterKelas, setFilterKelas] = useState("semua");
  const [filterBulan, setFilterBulan] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(6);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSpp, setSelectedSpp] = useState(null);

  const [formData, setFormData] = useState({
    siswa: "",
    kelas: "",
    bulan: "",
    nominal: "",
    status: "Belum",
    tanggalBayar: "",
  });

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const [sppData, setSppData] = useState([
    {
      id: 1,
      siswa: "Ahmad Fauzi",
      kelas: "XII IPA 1",
      bulan: "September 2026",
      nominal: 150000,
      status: "Lunas",
      tanggalBayar: "2026-09-01",
      metode: "Transfer",
      keterangan: "-",
    },
    {
      id: 2,
      siswa: "Siti Rahma",
      kelas: "XI IPS 2",
      bulan: "September 2026",
      nominal: 150000,
      status: "Belum",
      tanggalBayar: "-",
      metode: "-",
      keterangan: "-",
    },
    {
      id: 3,
      siswa: "Budi Santoso",
      kelas: "X MIPA 3",
      bulan: "September 2026",
      nominal: 150000,
      status: "Lunas",
      tanggalBayar: "2026-09-03",
      metode: "Tunai",
      keterangan: "Pembayaran tepat waktu",
    },
    {
      id: 4,
      siswa: "Dewi Lestari",
      kelas: "XII IPS 1",
      bulan: "September 2026",
      nominal: 150000,
      status: "Tunggak",
      tanggalBayar: "-",
      metode: "-",
      keterangan: "Tunggak 2 bulan",
    },
    {
      id: 5,
      siswa: "Eko Prasetyo",
      kelas: "XI IPA 2",
      bulan: "September 2026",
      nominal: 150000,
      status: "Lunas",
      tanggalBayar: "2026-09-05",
      metode: "Transfer",
      keterangan: "-",
    },
    {
      id: 6,
      siswa: "Rina Marlina",
      kelas: "XII IPA 1",
      bulan: "September 2026",
      nominal: 150000,
      status: "Lunas",
      tanggalBayar: "2026-09-02",
      metode: "Tunai",
      keterangan: "-",
    },
    {
      id: 7,
      siswa: "Agus Salim",
      kelas: "XI IPS 1",
      bulan: "September 2026",
      nominal: 150000,
      status: "Belum",
      tanggalBayar: "-",
      metode: "-",
      keterangan: "-",
    },
    {
      id: 8,
      siswa: "Farah Hanum",
      kelas: "X MIPA 1",
      bulan: "September 2026",
      nominal: 150000,
      status: "Tunggak",
      tanggalBayar: "-",
      metode: "-",
      keterangan: "Tunggak 3 bulan",
    },
    {
      id: 9,
      siswa: "Indra Saputra",
      kelas: "XII IPA 2",
      bulan: "September 2026",
      nominal: 150000,
      status: "Lunas",
      tanggalBayar: "2026-09-04",
      metode: "Transfer",
      keterangan: "-",
    },
    {
      id: 10,
      siswa: "Nina Kusuma",
      kelas: "XI IPS 2",
      bulan: "September 2026",
      nominal: 150000,
      status: "Lunas",
      tanggalBayar: "2026-09-06",
      metode: "Tunai",
      keterangan: "-",
    },
    {
      id: 11,
      siswa: "Doni Irawan",
      kelas: "X MIPA 2",
      bulan: "September 2026",
      nominal: 150000,
      status: "Belum",
      tanggalBayar: "-",
      metode: "-",
      keterangan: "-",
    },
    {
      id: 12,
      siswa: "Rani Permata",
      kelas: "XII IPS 1",
      bulan: "September 2026",
      nominal: 150000,
      status: "Lunas",
      tanggalBayar: "2026-09-07",
      metode: "Transfer",
      keterangan: "-",
    },
  ]);

  const uniqueKelas = [...new Set(sppData.map((s) => s.kelas))];
  const uniqueBulan = [...new Set(sppData.map((s) => s.bulan))];

  const totalSiswa = sppData.length;
  const totalLunas = sppData.filter((s) => s.status === "Lunas").length;
  const totalBelum = sppData.filter((s) => s.status === "Belum").length;
  const totalTunggak = sppData.filter((s) => s.status === "Tunggak").length;

  const totalNominalLunas = sppData
    .filter((s) => s.status === "Lunas")
    .reduce((a, b) => a + b.nominal, 0);

  const totalNominalTunggak = sppData
    .filter((s) => s.status === "Tunggak")
    .reduce((a, b) => a + b.nominal, 0);

  const filtered = sppData.filter((s) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      s.siswa.toLowerCase().includes(keyword) ||
      s.kelas.toLowerCase().includes(keyword);

    const matchStatus =
      filterStatus === "semua" || s.status === filterStatus;

    const matchKelas =
      filterKelas === "semua" || s.kelas === filterKelas;

    const matchBulan =
      filterBulan === "semua" || s.bulan === filterBulan;

    return matchSearch && matchStatus && matchKelas && matchBulan;
  });

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      siswa: "",
      kelas: "",
      bulan: "",
      nominal: "",
      status: "Belum",
      tanggalBayar: "",
    });
  };

  const handleAdd = () => {
    const newId =
      sppData.length > 0
        ? Math.max(...sppData.map((s) => s.id)) + 1
        : 1;

    const newEntry = {
      id: newId,
      ...formData,
      nominal: parseInt(formData.nominal) || 0,
    };

    setSppData((prev) => [...prev, newEntry]);
    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      setSppData((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleViewDetail = (item) => {
    setSelectedSpp(item);
    setShowDetailModal(true);
  };

  const handleEdit = (item) => {
    setSelectedSpp(item);

    setFormData({
      siswa: item.siswa,
      kelas: item.kelas,
      bulan: item.bulan,
      nominal: item.nominal.toString(),
      status: item.status,
      tanggalBayar: item.tanggalBayar,
    });

    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!selectedSpp) return;

    setSppData((prev) =>
      prev.map((s) =>
        s.id === selectedSpp.id
          ? {
              ...s,
              ...formData,
              nominal: parseInt(formData.nominal) || 0,
            }
          : s
      )
    );

    setShowEditModal(false);
    setSelectedSpp(null);
    resetForm();
  };

  const getStatusBadge = (status) => {
    const styles = {
      Lunas: "theme-success",
      Belum: "theme-warning",
      Tunggak: "theme-danger",
    };

    const icons = {
      Lunas: <CheckCircle2 size={12} />,
      Belum: <Clock size={12} />,
      Tunggak: <XCircle size={12} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || "theme-card-soft theme-text-muted"}`}
      >
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spp"
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

        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">

            {/* HEADER */}
            <div className="theme-card mb-6 overflow-hidden rounded-2xl border theme-border shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="flex flex-col gap-4 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                      <Wallet size={28} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                        Keuangan & Kas
                      </p>

                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        SPP
                      </h1>

                      <p className="theme-text-secondary mt-1 text-sm">
                        Kelola pembayaran SPP siswa secara lengkap
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="theme-card-soft theme-text-secondary inline-flex items-center gap-2 rounded-lg border theme-border px-4 py-2.5 text-sm font-medium transition hover:brightness-95"
                    >
                      <FileText size={16} />
                      Laporan
                    </button>

                    <button
                      onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                      }}
                      className="theme-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-[0_6px_18px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] transition hover:brightness-95"
                    >
                      <Plus size={16} />
                      Tambah Pembayaran
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STATISTIK */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<UsersIcon />}
                label="Total Siswa"
                value={totalSiswa}
                color="primary"
                subtext="Total siswa terdaftar"
              />

              <StatCard
                icon={<CheckCircle2 size={22} />}
                label="Lunas"
                value={totalLunas}
                color="success"
                subtext={`Rp ${totalNominalLunas.toLocaleString()}`}
              />

              <StatCard
                icon={<Clock size={22} />}
                label="Belum"
                value={totalBelum}
                color="warning"
                subtext={`${totalBelum} siswa belum bayar`}
              />

              <StatCard
                icon={<XCircle size={22} />}
                label="Tunggak"
                value={totalTunggak}
                color="danger"
                subtext={`Rp ${totalNominalTunggak.toLocaleString()}`}
              />
            </div>

            {/* FILTER */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari siswa atau kelas..."
                  className="theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterSelect
                  value={filterStatus}
                  onChange={(e) =>
                    handleFilterChange(setFilterStatus, e.target.value)
                  }
                >
                  <option value="semua">Semua Status</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum">Belum</option>
                  <option value="Tunggak">Tunggak</option>
                </FilterSelect>

                <FilterSelect
                  value={filterKelas}
                  onChange={(e) =>
                    handleFilterChange(setFilterKelas, e.target.value)
                  }
                >
                  <option value="semua">Semua Kelas</option>

                  {uniqueKelas.map((kelas) => (
                    <option key={kelas} value={kelas}>
                      {kelas}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  value={filterBulan}
                  onChange={(e) =>
                    handleFilterChange(setFilterBulan, e.target.value)
                  }
                >
                  <option value="semua">Semua Bulan</option>

                  {uniqueBulan.map((bulan) => (
                    <option key={bulan} value={bulan}>
                      {bulan}
                    </option>
                  ))}
                </FilterSelect>
              </div>
            </div>

            {/* TABLE */}
            <div className="theme-card overflow-hidden rounded-2xl border theme-border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="theme-card-soft border-b theme-border">
                      {[
                        "No",
                        "Siswa",
                        "Kelas",
                        "Bulan",
                        "Nominal",
                        "Status",
                        "Tgl Bayar",
                        "Aksi",
                      ].map((heading, index) => (
                        <th
                          key={heading}
                          className={`theme-text-muted px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                            index === 4
                              ? "text-right"
                              : index === 7
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {currentEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText
                              size={32}
                              className="opacity-50"
                            />

                            <p className="theme-text-secondary text-sm font-medium">
                              Tidak ada data ditemukan
                            </p>

                            <p className="text-xs">
                              Coba ubah kata kunci atau filter
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((s, index) => (
                        <tr
                          key={s.id}
                          className="theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]"
                        >
                          <td className="theme-text-muted px-4 py-3.5 text-sm">
                            {indexOfFirst + index + 1}
                          </td>

                          <td className="theme-text px-4 py-3.5 font-medium">
                            {s.siswa}
                          </td>

                          <td className="px-4 py-3.5">
                            {s.kelas}
                          </td>

                          <td className="px-4 py-3.5">
                            {s.bulan}
                          </td>

                          <td className="theme-text px-4 py-3.5 text-right font-bold">
                            Rp {s.nominal.toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5">
                            {getStatusBadge(s.status)}
                          </td>

                          <td className="px-4 py-3.5">
                            {s.tanggalBayar || "-"}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ActionButton
                                title="Lihat detail"
                                icon={<Eye size={16} />}
                                onClick={() => handleViewDetail(s)}
                                type="primary"
                              />

                              <ActionButton
                                title="Edit"
                                icon={<Edit size={16} />}
                                onClick={() => handleEdit(s)}
                                type="primary"
                              />

                              <ActionButton
                                title="Hapus"
                                icon={<Trash2 size={16} />}
                                onClick={() => handleDelete(s.id)}
                                type="danger"
                              />
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
                <div className="theme-card-soft flex items-center justify-between border-t theme-border px-4 py-3">
                  <p className="theme-text-muted text-sm">
                    Menampilkan {indexOfFirst + 1}-
                    {Math.min(indexOfLast, filtered.length)} dari{" "}
                    {filtered.length} data
                  </p>

                  <div className="flex items-center gap-1">
                    <PaginationButton
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                    >
                      <ChevronLeft size={16} />
                    </PaginationButton>

                    {Array.from(
                      { length: totalPages },
                      (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={
                            currentPage === i + 1
                              ? "theme-primary rounded-lg px-3.5 py-1.5 text-sm font-medium"
                              : "theme-text-secondary rounded-lg px-3.5 py-1.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                          }
                        >
                          {i + 1}
                        </button>
                      )
                    )}

                    <PaginationButton
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(totalPages, p + 1)
                        )
                      }
                    >
                      <ChevronRight size={16} />
                    </PaginationButton>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <footer className="theme-text-muted mt-8 border-t theme-border-soft pt-6 text-center text-xs">
              © 2026 SmartSchool • SPP
            </footer>
          </div>
        </main>
      </div>

      {/* MODAL TAMBAH */}
      {showAddModal && (
        <Modal
          title="Tambah Pembayaran SPP"
          icon={<Plus size={20} />}
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          saveLabel="Simpan"
        >
          <FormInput
            label="Nama Siswa"
            name="siswa"
            value={formData.siswa}
            onChange={handleInputChange}
            placeholder="Masukkan nama siswa"
          />

          <FormInput
            label="Kelas"
            name="kelas"
            value={formData.kelas}
            onChange={handleInputChange}
            placeholder="Masukkan kelas"
          />

          <FormSelect
            label="Bulan"
            name="bulan"
            value={formData.bulan}
            onChange={handleInputChange}
            options={uniqueBulan}
            placeholder="Pilih bulan"
          />

          <FormInput
            label="Nominal (Rp)"
            name="nominal"
            value={formData.nominal}
            onChange={handleInputChange}
            placeholder="Masukkan nominal"
            type="number"
          />

          <FormSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={["Belum", "Lunas", "Tunggak"]}
          />

          <FormInput
            label="Tanggal Bayar"
            name="tanggalBayar"
            value={formData.tanggalBayar}
            onChange={handleInputChange}
            placeholder="YYYY-MM-DD"
          />
        </Modal>
      )}

      {/* MODAL EDIT */}
      {showEditModal && (
        <Modal
          title="Edit Pembayaran SPP"
          icon={<Edit size={20} />}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdate}
          saveLabel="Update"
        >
          <FormInput
            label="Nama Siswa"
            name="siswa"
            value={formData.siswa}
            onChange={handleInputChange}
            placeholder="Masukkan nama siswa"
          />

          <FormInput
            label="Kelas"
            name="kelas"
            value={formData.kelas}
            onChange={handleInputChange}
            placeholder="Masukkan kelas"
          />

          <FormSelect
            label="Bulan"
            name="bulan"
            value={formData.bulan}
            onChange={handleInputChange}
            options={uniqueBulan}
            placeholder="Pilih bulan"
          />

          <FormInput
            label="Nominal (Rp)"
            name="nominal"
            value={formData.nominal}
            onChange={handleInputChange}
            placeholder="Masukkan nominal"
            type="number"
          />

          <FormSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={["Belum", "Lunas", "Tunggak"]}
          />

          <FormInput
            label="Tanggal Bayar"
            name="tanggalBayar"
            value={formData.tanggalBayar}
            onChange={handleInputChange}
            placeholder="YYYY-MM-DD"
          />
        </Modal>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedSpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="theme-card w-full max-w-lg overflow-hidden rounded-2xl border theme-border shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]">
            <div className="flex items-center justify-between border-b theme-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                  <Eye size={20} />
                </div>

                <div>
                  <h2 className="theme-text text-lg font-bold">
                    Detail Pembayaran SPP
                  </h2>

                  <p className="theme-text-muted text-xs">
                    Informasi lengkap pembayaran
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="theme-text-muted rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <DetailRow label="Siswa" value={selectedSpp.siswa} />
              <DetailRow label="Kelas" value={selectedSpp.kelas} />
              <DetailRow label="Bulan" value={selectedSpp.bulan} />

              <DetailRow
                label="Nominal"
                value={`Rp ${selectedSpp.nominal.toLocaleString()}`}
              />

              <DetailRow
                label="Status"
                value={selectedSpp.status}
                valueBadge={getStatusBadge(selectedSpp.status)}
              />

              <DetailRow
                label="Tanggal Bayar"
                value={selectedSpp.tanggalBayar || "-"}
              />

              <DetailRow
                label="Metode"
                value={selectedSpp.metode || "-"}
              />

              <DetailRow
                label="Keterangan"
                value={selectedSpp.keterangan || "-"}
              />
            </div>

            <div className="flex justify-end border-t theme-border px-6 py-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="theme-primary rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:brightness-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ICON
========================================================= */

function UsersIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, label, value, color, subtext }) {
  const colors = {
    primary:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    success: "theme-success",
    warning: "theme-warning",
    danger: "theme-danger",
  };

  return (
    <div className="theme-card group rounded-2xl border theme-border p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color]} transition group-hover:scale-105`}
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

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="theme-input rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
    >
      {children}
    </select>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  title,
  icon,
  onClick,
  type = "primary",
}) {
  const styles =
    type === "danger"
      ? "hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] hover:text-[var(--color-danger)]"
      : "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`theme-text-muted rounded-lg p-1.5 transition ${styles}`}
    >
      {icon}
    </button>
  );
}

/* =========================================================
   PAGINATION BUTTON
========================================================= */

function PaginationButton({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="theme-card theme-text-muted rounded-lg border theme-border p-2 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  icon,
  onClose,
  onSave,
  saveLabel = "Simpan",
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="theme-card w-full max-w-lg overflow-hidden rounded-2xl border theme-border shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]">
        <div className="flex items-center justify-between border-b theme-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
              {icon}
            </div>

            <div>
              <h2 className="theme-text text-lg font-bold">
                {title}
              </h2>

              <p className="theme-text-muted text-xs">
                Isi data dengan benar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="theme-text-muted rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {children}
        </div>

        <div className="flex justify-end gap-3 border-t theme-border px-6 py-4">
          <button
            onClick={onClose}
            className="theme-card-soft theme-text-secondary rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold transition hover:brightness-95"
          >
            Batal
          </button>

          <button
            onClick={onSave}
            className="theme-primary rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:brightness-95"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="theme-input w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      />
    </div>
  );
}

/* =========================================================
   FORM SELECT
========================================================= */

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="theme-input w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}

        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({ label, value, valueBadge }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b theme-border-soft pb-3 last:border-b-0 last:pb-0">
      <span className="theme-text-muted text-sm font-medium">
        {label}
      </span>

      {valueBadge ? (
        <span>{valueBadge}</span>
      ) : (
        <span className="theme-text text-right text-sm font-semibold">
          {value || "-"}
        </span>
      )}
    </div>
  );
}