"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Search,
  Filter,
  UserCheck,
  Eye,
  Users,
  School,
  CheckCircle2,
  Plus,
  Trash2,
  PowerOff,
  Power,
  AlertTriangle,
} from "lucide-react";

/**
 * app/admin/guru/wali-kelas/page.jsx
 *
 * Halaman Wali Kelas — daftar penugasan wali kelas per kelas.
 * "Detail" sekarang mengarah ke halaman /wali-kelas/[id] (bukan modal lagi),
 * dan dari halaman detail itu bisa lanjut ke /wali-kelas/[id]/edit.
 * Nonaktifkan/aktifkan & hapus tetap bisa langsung dari tabel di sini.
 *
 * CATATAN DATA:
 * MOCK_WALIKELAS di bawah masih dummy dan dipakai sebagai initial state.
 * Karena setiap route (page.jsx, [id]/page.jsx, [id]/edit/page.jsx) adalah
 * file terpisah, masing-masing saat ini punya salinan MOCK_WALIKELAS sendiri
 * supaya bisa langsung dibuka lewat URL. Begitu backend API tersedia, ganti
 * semua salinan ini dengan fetch by id, dan sambungkan submit edit ke
 * endpoint updateWaliKelas.
 */

export const MOCK_WALIKELAS = [
  {
    id: 1,
    kelas: "7A",
    jenjang: "VII",
    waliKelas: "Siti Rahayu, S.Pd",
    nip: "198501152010012001",
    telp: "0812-3456-7890",
    email: "sarah.amelia@smartschool.sch.id",
    jumlahSiswa: 32,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: [
      "Alya Ramadhani",
      "Bunga Citra Lestari",
      "Cahyo Nugroho",
      "Dimas Prasetyo",
    ],
  },
  {
    id: 2,
    kelas: "7B",
    jenjang: "VII",
    waliKelas: "Andi Prasetyo, S.Pd",
    nip: "198712052012011002",
    telp: "0857-1122-3344",
    email: "andi.prasetyo@smartschool.sch.id",
    jumlahSiswa: 30,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: [
      "Eka Wulandari",
      "Fajar Setiawan",
      "Gilang Ramadhan",
      "Hana Permatasari",
    ],
  },
  {
    id: 3,
    kelas: "8A",
    jenjang: "VIII",
    waliKelas: "Dewi Anggraini, S.Si",
    nip: "199002202015022004",
    telp: "0821-9988-7766",
    email: "dewi.anggraini@smartschool.sch.id",
    jumlahSiswa: 31,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: [
      "Indra Kusuma",
      "Julia Anggraeni",
      "Krisna Aditya",
      "Larasati Dewi",
    ],
  },
  {
    id: 4,
    kelas: "8B",
    jenjang: "VIII",
    waliKelas: "Nina Kartika, S.Sn",
    nip: "199105182018022005",
    telp: "0878-5566-7788",
    email: "nina.kartika@smartschool.sch.id",
    jumlahSiswa: 29,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: [
      "Muhammad Fadli",
      "Naila Zahra",
      "Oka Wijaya",
      "Putri Ayuningtyas",
    ],
  },
  {
    id: 5,
    kelas: "9A",
    jenjang: "IX",
    waliKelas: "Budi Santoso, S.Pd",
    nip: "197803102005011003",
    telp: "0813-2233-4455",
    email: "budi.santoso@smartschool.sch.id",
    jumlahSiswa: 28,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: [
      "Reza Firmansyah",
      "Salsabila Putri",
      "Taufik Hidayat",
      "Umi Kalsum",
    ],
  },
  {
    id: 6,
    kelas: "9B",
    jenjang: "IX",
    waliKelas: "Rudi Hartono, S.Pd",
    nip: "198309252008011006",
    telp: "0896-4433-2211",
    email: "rudi.hartono@smartschool.sch.id",
    jumlahSiswa: 27,
    tahunAjaran: "2024/2025",
    status: "nonaktif",
    siswa: [
      "Vino Bastian",
      "Wulan Sari",
      "Yoga Pratama",
      "Zahra Aulia",
    ],
  },
];

const STATUS_OPTIONS = ["Semua Status", "Aktif", "Nonaktif"];

function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }) {
  const isActive = status === "aktif";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        text-[11px]
        font-semibold
        ${
          isActive
            ? "theme-success"
            : "theme-card-soft theme-text-muted theme-border border"
        }
      `}
    >
      <span
        className={`
          w-1.5 h-1.5 rounded-full
          ${
            isActive
              ? "bg-[var(--color-success)]"
              : "bg-[var(--color-text-muted)]"
          }
        `}
      />

      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function Avatar({ nama, size = "md" }) {
  const dims =
    size === "sm"
      ? "w-9 h-9 text-xs"
      : "w-14 h-14 text-base";

  return (
    <div
      className={`
        ${dims}
        rounded-full
        bg-[image:var(--color-brand-logo-bg)]
        text-white
        flex items-center justify-center
        font-bold
        flex-shrink-0
      `}
    >
      {getInitials(nama)}
    </div>
  );
}

export default function WaliKelasPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState("Semua Jenjang");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const [wali, setWali] = useState(MOCK_WALIKELAS);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const jenjangOptions = useMemo(
    () => [
      "Semua Jenjang",
      ...Array.from(new Set(wali.map((w) => w.jenjang))).sort(),
    ],
    [wali]
  );

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredWali = useMemo(() => {
    return wali.filter((w) => {
      const matchSearch =
        w.kelas.toLowerCase().includes(search.toLowerCase()) ||
        w.waliKelas.toLowerCase().includes(search.toLowerCase());

      const matchJenjang =
        jenjangFilter === "Semua Jenjang" ||
        w.jenjang === jenjangFilter;

      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Aktif"
          ? w.status === "aktif"
          : w.status === "nonaktif");

      return matchSearch && matchJenjang && matchStatus;
    });
  }, [wali, search, jenjangFilter, statusFilter]);

  const totalSiswa = wali.reduce(
    (sum, w) => sum + Number(w.jumlahSiswa || 0),
    0
  );

  const totalKelasAktif = wali.filter(
    (w) => w.status === "aktif"
  ).length;

  function handleToggleStatus(id) {
    setWali((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status:
                w.status === "aktif"
                  ? "nonaktif"
                  : "aktif",
            }
          : w
      )
    );
  }

  function handleDelete(id) {
    setWali((prev) => prev.filter((w) => w.id !== id));
    setConfirmDelete(null);
  }

  function handleTambah() {
    router.push("/admin/guru/wali-kelas/tambah");
  }

  function handleDetail(id) {
    router.push(`/admin/guru/wali-kelas/${id}`);
  }

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="guruWaliKelas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className="
                    p-2.5 rounded-xl
                    bg-[image:var(--color-brand-logo-bg)]
                    text-white
                    shadow-lg
                  "
                >
                  <UserCheck size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Wali Kelas
                  </h1>

                  <p className="text-sm theme-text-muted">
                    Penugasan wali kelas dan jumlah siswa binaan tiap kelas.
                  </p>
                </div>
              </div>

              <button
                onClick={handleTambah}
                className="
                  inline-flex items-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  bg-[image:var(--color-brand-logo-bg)]
                  text-white
                  text-sm font-semibold
                  shadow-lg
                  hover:opacity-90
                  transition-opacity
                "
              >
                <Plus size={16} />
                Tambah Wali Kelas
              </button>
            </div>

            {/* STATISTIK RINGKAS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="theme-card rounded-xl border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <School
                    size={14}
                    className="text-[var(--color-primary)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Total Kelas
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {wali.length}
                </p>
              </div>

              <div className="theme-card rounded-xl border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserCheck
                    size={14}
                    className="text-[var(--color-primary)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Kelas Aktif
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {totalKelasAktif}
                </p>
              </div>

              <div className="theme-card rounded-xl border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users
                    size={14}
                    className="text-[var(--color-primary)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Total Siswa Binaan
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {totalSiswa}
                </p>
              </div>

              <div className="theme-card rounded-xl border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-[var(--color-success)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Rata-rata / Kelas
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {wali.length
                    ? Math.round(totalSiswa / wali.length)
                    : 0}
                </p>
              </div>
            </div>

            {/* FILTER BAR */}
            <div
              className="
                theme-card
                rounded-xl
                border
                p-4
                shadow-sm
                flex flex-col sm:flex-row gap-3
              "
            >
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    theme-text-muted
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kelas atau nama wali kelas..."
                  className="
                    w-full
                    pl-9 pr-3 py-2
                    text-sm
                    rounded-lg
                    theme-input
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--color-primary)]
                    focus:ring-opacity-25
                    focus:border-[var(--color-primary)]
                  "
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter
                  size={15}
                  className="theme-text-muted hidden sm:block"
                />

                <select
                  value={jenjangFilter}
                  onChange={(e) =>
                    setJenjangFilter(e.target.value)
                  }
                  className="
                    text-sm
                    rounded-lg
                    theme-input
                    px-3 py-2
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--color-primary)]
                    focus:ring-opacity-25
                    focus:border-[var(--color-primary)]
                    font-medium
                  "
                >
                  {jenjangOptions.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="
                    text-sm
                    rounded-lg
                    theme-input
                    px-3 py-2
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--color-primary)]
                    focus:ring-opacity-25
                    focus:border-[var(--color-primary)]
                    font-medium
                  "
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABEL WALI KELAS */}
            <div className="theme-card rounded-xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr
                      className="
                        bg-[image:var(--color-brand-logo-bg)]
                        text-white
                      "
                    >
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Kelas
                      </th>

                      <th className="text-left font-semibold px-4 py-3 min-w-[220px]">
                        Wali Kelas
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        NIP
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Jumlah Siswa
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Tahun Ajaran
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Status
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredWali.map((w, idx) => (
                      <tr
                        key={w.id}
                        className="
                          border-b
                          theme-border-soft
                          last:border-0
                          transition-colors
                          theme-table-hover
                        "
                      >
                        <td className="px-4 py-2.5">
                          <span
                            className="
                              inline-flex items-center justify-center
                              min-w-[44px]
                              px-2.5 py-1
                              rounded-lg
                              text-xs font-bold
                              text-[var(--color-primary)]
                              bg-[var(--color-info-background)]
                              border
                              border-[var(--color-primary)]
                            "
                          >
                            {w.kelas}
                          </span>
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              nama={w.waliKelas}
                              size="sm"
                            />

                            <span className="font-semibold theme-text">
                              {w.waliKelas}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs theme-text-secondary">
                            {w.nip}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center gap-1.5 theme-text-secondary font-medium">
                            <Users
                              size={13}
                              className="theme-text-muted"
                            />

                            {w.jumlahSiswa} siswa
                          </span>
                        </td>

                        <td className="px-4 py-2.5 theme-text-secondary">
                          {w.tahunAjaran}
                        </td>

                        <td className="px-4 py-2.5 text-center">
                          <StatusBadge status={w.status} />
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* DETAIL */}
                            <button
                              onClick={() =>
                                handleDetail(w.id)
                              }
                              title="Detail kelas"
                              className="
                                inline-flex items-center gap-1.5
                                px-2.5 py-1.5
                                rounded-md
                                text-[var(--color-primary)]
                                bg-[var(--color-info-background)]
                                hover:bg-[var(--color-card-soft)]
                                text-xs font-medium
                                transition-colors
                              "
                            >
                              <Eye size={13} />
                              Detail
                            </button>

                            {/* TOGGLE STATUS */}
                            <button
                              onClick={() =>
                                handleToggleStatus(w.id)
                              }
                              title={
                                w.status === "aktif"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"
                              }
                              className={`
                                inline-flex items-center justify-center
                                p-1.5
                                rounded-md
                                text-xs font-medium
                                transition-colors
                                ${
                                  w.status === "aktif"
                                    ? "theme-warning"
                                    : "theme-success"
                                }
                              `}
                            >
                              {w.status === "aktif" ? (
                                <PowerOff size={13} />
                              ) : (
                                <Power size={13} />
                              )}
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() =>
                                setConfirmDelete(w)
                              }
                              title="Hapus"
                              className="
                                inline-flex items-center justify-center
                                p-1.5
                                rounded-md
                                theme-danger
                                text-xs font-medium
                                transition-colors
                              "
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredWali.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="
                            px-4 py-10
                            text-center
                            text-sm
                            theme-text-muted
                          "
                        >
                          Tidak ada kelas yang cocok dengan filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {confirmDelete && (
        <div
          className="
            fixed inset-0 z-[60]
            flex items-center justify-center
            p-4
            bg-black/50
            backdrop-blur-sm
          "
        >
          <div className="theme-card rounded-2xl shadow-xl max-w-sm w-full p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full theme-danger flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} />
              </div>

              <p className="font-bold theme-text">
                Hapus Wali Kelas?
              </p>
            </div>

            <p className="text-sm theme-text-muted mb-5">
              Data wali kelas{" "}
              <span className="font-semibold theme-text">
                {confirmDelete.waliKelas}
              </span>{" "}
              untuk kelas{" "}
              <span className="font-semibold theme-text">
                {confirmDelete.kelas}
              </span>{" "}
              akan dihapus secara permanen. Tindakan ini tidak dapat
              dibatalkan.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="
                  flex-1
                  px-4 py-2.5
                  rounded-lg
                  text-sm font-semibold
                  theme-card-soft
                  theme-text-secondary
                  theme-header-hover
                  transition-colors
                "
              >
                Batal
              </button>

              <button
                onClick={() =>
                  handleDelete(confirmDelete.id)
                }
                className="
                  flex-1
                  px-4 py-2.5
                  rounded-lg
                  text-sm font-semibold
                  theme-danger
                  transition-colors
                "
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}