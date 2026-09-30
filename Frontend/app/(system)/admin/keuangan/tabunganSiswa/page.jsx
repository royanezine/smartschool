"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Save,
  CreditCard,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

export default function TabunganSiswaPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    kelas: "",
    saldo: "",
    totalSetor: "",
    totalTarik: "",
  });

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const [students, setStudents] = useState([
    {
      id: 1,
      nama: "Ahmad Fauzi",
      kelas: "XII IPA 1",
      saldo: 450000,
      totalSetor: 600000,
      totalTarik: 150000,
    },
    {
      id: 2,
      nama: "Siti Rahma",
      kelas: "XI IPS 2",
      saldo: 275000,
      totalSetor: 350000,
      totalTarik: 75000,
    },
    {
      id: 3,
      nama: "Budi Santoso",
      kelas: "X MIPA 3",
      saldo: 620000,
      totalSetor: 700000,
      totalTarik: 80000,
    },
    {
      id: 4,
      nama: "Dewi Lestari",
      kelas: "XII IPS 1",
      saldo: 120000,
      totalSetor: 200000,
      totalTarik: 80000,
    },
    {
      id: 5,
      nama: "Eko Prasetyo",
      kelas: "XI IPA 2",
      saldo: 380000,
      totalSetor: 500000,
      totalTarik: 120000,
    },
    {
      id: 6,
      nama: "Fitriani Nur",
      kelas: "X MIPA 1",
      saldo: 520000,
      totalSetor: 650000,
      totalTarik: 130000,
    },
    {
      id: 7,
      nama: "Galih Prabowo",
      kelas: "XII IPS 2",
      saldo: 90000,
      totalSetor: 200000,
      totalTarik: 110000,
    },
  ]);

  const filtered = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.kelas.toLowerCase().includes(search.toLowerCase())
  );

  const totalSaldo = students.reduce((a, b) => a + b.saldo, 0);
  const totalSetor = students.reduce((a, b) => a + b.totalSetor, 0);
  const totalTarik = students.reduce((a, b) => a + b.totalTarik, 0);

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const handleOpenModal = (student = null) => {
    if (student) {
      setSelectedStudent(student);

      setFormData({
        nama: student.nama,
        kelas: student.kelas,
        saldo: student.saldo.toString(),
        totalSetor: student.totalSetor.toString(),
        totalTarik: student.totalTarik.toString(),
      });
    } else {
      setSelectedStudent(null);

      setFormData({
        nama: "",
        kelas: "",
        saldo: "",
        totalSetor: "",
        totalTarik: "",
      });
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSave = () => {
    if (selectedStudent) {
      setStudents(
        students.map((s) =>
          s.id === selectedStudent.id
            ? {
                ...s,
                ...formData,
                saldo: parseInt(formData.saldo),
                totalSetor: parseInt(formData.totalSetor),
                totalTarik: parseInt(formData.totalTarik),
              }
            : s
        )
      );
    } else {
      const newId =
        students.length > 0
          ? Math.max(...students.map((s) => s.id)) + 1
          : 1;

      setStudents([
        ...students,
        {
          id: newId,
          nama: formData.nama,
          kelas: formData.kelas,
          saldo: parseInt(formData.saldo),
          totalSetor: parseInt(formData.totalSetor),
          totalTarik: parseInt(formData.totalTarik),
        },
      ]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
      <Sidebar
        active="tabunganSiswa"
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
            {/* Header */}
            <div className="mb-6 rounded-2xl theme-header p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-14 w-14 shrink-0 items-center justify-center
                      rounded-xl
                      border border-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]
                      bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      text-[var(--color-primary)]
                    "
                  >
                    <Wallet size={28} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider theme-primary">
                      Keuangan & Kas
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                      Tabungan Siswa
                    </h1>

                    <p className="mt-1 text-sm theme-text-secondary">
                      Kelola saldo tabungan siswa secara lengkap
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal()}
                  className="
                    inline-flex items-center gap-2 rounded-lg
                    theme-primary
                    px-4 py-2.5
                    text-sm font-medium
                    transition
                    shadow-[0_10px_30px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                    hover:brightness-95
                  "
                >
                  <Plus size={16} />
                  Tambah Siswa
                </button>
              </div>
            </div>

            {/* Statistik */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Wallet size={22} />}
                label="Total Saldo"
                value={`Rp ${totalSaldo.toLocaleString()}`}
                color="blue"
                subtext="Semua saldo siswa"
              />

              <StatCard
                icon={<TrendingUp size={22} />}
                label="Total Setoran"
                value={`Rp ${totalSetor.toLocaleString()}`}
                color="emerald"
                subtext="Total uang masuk"
              />

              <StatCard
                icon={<CreditCard size={22} />}
                label="Total Penarikan"
                value={`Rp ${totalTarik.toLocaleString()}`}
                color="red"
                subtext="Total uang keluar"
              />

              <StatCard
                icon={<Users size={22} />}
                label="Total Siswa"
                value={students.length}
                color="purple"
                subtext="Terdaftar di sistem"
              />
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari siswa atau kelas..."
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

            {/* Tabel */}
            <div className="overflow-hidden rounded-2xl border theme-border theme-card shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider theme-text-muted">
                        Nama
                      </th>

                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider theme-text-muted">
                        Kelas
                      </th>

                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider theme-text-muted">
                        Saldo
                      </th>

                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider theme-text-muted">
                        Total Setor
                      </th>

                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider theme-text-muted">
                        Total Tarik
                      </th>

                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider theme-text-muted">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y theme-border-soft">
                    {currentEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center theme-text-muted"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText
                              size={32}
                              className="theme-text-placeholder"
                            />

                            <p className="text-sm font-medium">
                              Tidak ada siswa ditemukan
                            </p>

                            <p className="text-xs">
                              Coba ubah kata kunci pencarian
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((s) => (
                        <tr
                          key={s.id}
                          className="
                            group transition
                            hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                          "
                        >
                          <td className="px-4 py-3.5 font-medium theme-text">
                            {s.nama}
                          </td>

                          <td className="px-4 py-3.5 theme-text-secondary">
                            {s.kelas}
                          </td>

                          <td className="px-4 py-3.5 text-right font-bold theme-primary">
                            Rp {s.saldo.toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5 text-right font-medium theme-success">
                            Rp {s.totalSetor.toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5 text-right font-medium theme-danger">
                            Rp {s.totalTarik.toLocaleString()}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewDetail(s)}
                                className="
                                  rounded-lg p-1.5
                                  theme-text-muted
                                  transition
                                  hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                                  hover:text-[var(--color-primary)]
                                "
                                title="Lihat detail"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                onClick={() => handleOpenModal(s)}
                                className="
                                  rounded-lg p-1.5
                                  theme-text-muted
                                  transition
                                  hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                                  hover:text-[var(--color-primary)]
                                "
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                onClick={() => handleDelete(s.id)}
                                className="
                                  rounded-lg p-1.5
                                  theme-text-muted
                                  transition
                                  hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]
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

              {/* Pagination */}
              {filtered.length > 0 && (
                <div className="flex items-center justify-between border-t theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-4 py-3">
                  <p className="text-sm theme-text-muted">
                    Menampilkan {indexOfFirst + 1}-
                    {Math.min(indexOfLast, filtered.length)} dari{" "}
                    {filtered.length} siswa
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="
                        rounded-lg border theme-border
                        theme-card
                        p-2 theme-text-muted
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                        disabled:opacity-40
                      "
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
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
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="
                        rounded-lg border theme-border
                        theme-card
                        p-2 theme-text-muted
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                        disabled:opacity-40
                      "
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="mt-8 border-t theme-border-soft pt-6 text-center text-xs theme-text-muted">
              © 2026 SmartSchool • Tabungan Siswa
            </footer>
          </div>
        </main>
      </div>

      {/* ============================================================
          MODAL TAMBAH / EDIT
      ============================================================ */}
      {isModalOpen && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-[color-mix(in_srgb,var(--color-text)_55%,transparent)]
            p-4 backdrop-blur-sm
          "
        >
          <div
            className="
              w-full max-w-lg rounded-2xl
              theme-card
              p-6
              shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]
              animate-in fade-in zoom-in duration-200
            "
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold theme-text">
                {selectedStudent ? "Edit Siswa" : "Tambah Siswa"}
              </h2>

              <button
                onClick={handleCloseModal}
                className="
                  rounded-lg p-1
                  theme-text-muted
                  transition
                  hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]
                "
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <FormInput
                label="Nama Siswa"
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nama: e.target.value,
                  })
                }
                placeholder="Masukkan nama siswa"
              />

              <FormInput
                label="Kelas"
                type="text"
                value={formData.kelas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kelas: e.target.value,
                  })
                }
                placeholder="Contoh: XII IPA 1"
              />

              <FormInput
                label="Saldo (Rp)"
                type="number"
                value={formData.saldo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    saldo: e.target.value,
                  })
                }
                placeholder="Masukkan saldo"
              />

              <FormInput
                label="Total Setor (Rp)"
                type="number"
                value={formData.totalSetor}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalSetor: e.target.value,
                  })
                }
                placeholder="Masukkan total setor"
              />

              <FormInput
                label="Total Tarik (Rp)"
                type="number"
                value={formData.totalTarik}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalTarik: e.target.value,
                  })
                }
                placeholder="Masukkan total tarik"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="
                  rounded-lg border theme-border
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
                onClick={handleSave}
                className="
                  rounded-lg
                  theme-primary
                  px-4 py-2
                  text-sm font-medium
                  transition
                  shadow-[0_6px_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                  hover:brightness-95
                "
              >
                <Save size={16} className="mr-2 inline" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DETAIL
      ============================================================ */}
      {isDetailModalOpen && selectedStudent && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-[color-mix(in_srgb,var(--color-text)_55%,transparent)]
            p-4 backdrop-blur-sm
          "
        >
          <div
            className="
              w-full max-w-md rounded-2xl
              theme-card
              p-6
              shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]
              animate-in fade-in zoom-in duration-200
            "
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold theme-text">
                Detail Siswa
              </h2>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="
                  rounded-lg p-1
                  theme-text-muted
                  transition
                  hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]
                "
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <DetailRow
                label="Nama"
                value={selectedStudent.nama}
              />

              <DetailRow
                label="Kelas"
                value={selectedStudent.kelas}
              />

              <DetailRow
                label="Saldo"
                value={`Rp ${selectedStudent.saldo.toLocaleString()}`}
                valueClass="theme-primary"
                bold
              />

              <DetailRow
                label="Total Setor"
                value={`Rp ${selectedStudent.totalSetor.toLocaleString()}`}
                valueClass="theme-success"
              />

              <div className="flex justify-between py-2">
                <span className="text-sm theme-text-muted">
                  Total Tarik
                </span>

                <span className="text-sm font-semibold theme-danger">
                  Rp {selectedStudent.totalTarik.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="
                  rounded-lg
                  theme-primary
                  px-4 py-2
                  text-sm font-medium
                  transition
                  hover:brightness-95
                "
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

/* ================================================================
   FORM INPUT
================================================================ */

function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium theme-text-secondary">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full rounded-lg
          theme-input
          px-3 py-2
          text-sm
          outline-none
          transition
          placeholder:theme-text-placeholder
          focus:border-[var(--color-primary)]
          focus:ring-2
          focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
        "
      />
    </div>
  );
}

/* ================================================================
   DETAIL ROW
================================================================ */

function DetailRow({
  label,
  value,
  valueClass = "theme-text",
  bold = false,
}) {
  return (
    <div className="flex justify-between border-b theme-border-soft py-2">
      <span className="text-sm theme-text-muted">
        {label}
      </span>

      <span
        className={`text-sm ${
          bold ? "font-bold" : "font-semibold"
        } ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function StatCard({
  icon,
  label,
  value,
  color,
  subtext,
}) {
  const colors = {
    blue: `
      bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
      text-[var(--color-primary)]
    `,

    emerald: `
      bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
      text-[var(--color-success)]
    `,

    red: `
      bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]
      text-[var(--color-danger)]
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