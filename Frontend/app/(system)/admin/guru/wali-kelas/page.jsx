"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Search,
  Filter,
  UserCheck,
  Eye,
  Users,
  School,
  CheckCircle2,
  Plus,
  Pencil,
  Unlink,
  Loader2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import {
  getWaliKelasList,
  releaseWaliKelas,
} from "@/services/kelas.service";


const STATUS_OPTIONS = [
  "Semua Status",
  "Ditugaskan",
  "Belum Ditugaskan",
];

function getInitials(nama) {
  if (!nama) return "WK";

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
  const isAssigned = status === "ditugaskan";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        text-[11px]
        font-semibold
        ${
          isAssigned
            ? "theme-success"
            : "theme-card-soft theme-text-muted theme-border border"
        }
      `}
    >
      <span
        className={`
          w-1.5 h-1.5 rounded-full
          ${
            isAssigned
              ? "bg-[var(--color-success)]"
              : "bg-[var(--color-text-muted)]"
          }
        `}
      />

      {isAssigned ? "Ditugaskan" : "Belum Ditugaskan"}
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

  const [wali, setWali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmRelease, setConfirmRelease] = useState(null);
  const [releasingId, setReleasingId] = useState(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const fetchWaliKelas = useCallback(async () => {
    return getWaliKelasList();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchWaliKelas();
      setWali(data);
    } catch (err) {
      console.error(
        "[WaliKelasPage] Gagal mengambil data:",
        err
      );
      setWali([]);
      setError(
        err?.message ||
          "Gagal memuat data wali kelas dari server."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchWaliKelas]);

  useEffect(() => {
    let active = true;

    fetchWaliKelas()
      .then((data) => {
        if (!active) return;
        setWali(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;

        console.error(
          "[WaliKelasPage] Gagal mengambil data:",
          err
        );
        setWali([]);
        setError(
          err?.message ||
            "Gagal memuat data wali kelas dari server."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchWaliKelas]);

  const jenjangOptions = useMemo(
    () => [
      "Semua Jenjang",
      ...Array.from(
        new Set(
          wali
            .map((item) => item.jenjang)
            .filter((jenjang) => jenjang && jenjang !== "-")
        )
      ).sort(),
    ],
    [wali]
  );

  const filteredWali = useMemo(() => {
    return wali.filter((item) => {
      const keyword = search.trim().toLowerCase();

      const matchSearch =
        !keyword ||
        item.kelas.toLowerCase().includes(keyword) ||
        item.waliKelas.toLowerCase().includes(keyword) ||
        item.nip.toLowerCase().includes(keyword);

      const matchJenjang =
        jenjangFilter === "Semua Jenjang" ||
        item.jenjang === jenjangFilter;

      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Ditugaskan" &&
          item.status === "ditugaskan") ||
        (statusFilter === "Belum Ditugaskan" &&
          item.status === "belum_ditugaskan");

      return matchSearch && matchJenjang && matchStatus;
    });
  }, [wali, search, jenjangFilter, statusFilter]);

  const totalSiswa = wali.reduce(
    (sum, item) => sum + Number(item.jumlahSiswa || 0),
    0
  );

  const totalDitugaskan = wali.filter(
    (item) => item.status === "ditugaskan"
  ).length;

  async function handleRelease(id) {
    setReleasingId(id);
    setError("");
    setNotice("");

    try {
      await releaseWaliKelas(id);
      setConfirmRelease(null);
      setNotice("Wali kelas berhasil dilepas dari kelas.");
      await loadData();
    } catch (err) {
      console.error(
        "[WaliKelasPage] Gagal melepas wali kelas:",
        err
      );
      setError(
        err?.message || "Gagal melepas wali kelas."
      );
      setConfirmRelease(null);
    } finally {
      setReleasingId(null);
    }
  }

  function handleTambah() {
    router.push("/admin/guru/wali-kelas/tambah");
  }

  function handleDetail(id) {
    router.push(`/admin/guru/wali-kelas/${id}`);
  }

  function handleUbah(id) {
    router.push(`/admin/guru/wali-kelas/${id}/edit`);
  }

  function handleTugaskan(id) {
    router.push(`/admin/guru/wali-kelas/${id}/edit`);
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
                    Sudah Ada Wali
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {totalDitugaskan}
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
                  placeholder="Cari kelas, nama wali kelas, atau NIP..."
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
                  {jenjangOptions.map((jenjang) => (
                    <option key={jenjang} value={jenjang}>
                      {jenjang === "Semua Jenjang"
                        ? jenjang
                        : `Kelas ${jenjang}`}
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
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border theme-border theme-danger p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm">{error}</p>
              </div>
            )}

            {notice && (
              <div className="flex items-start gap-3 rounded-xl border theme-border theme-success p-4">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm">{notice}</p>
              </div>
            )}

            <div className="theme-card rounded-xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm border-collapse">
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
                    {loading && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10">
                          <div className="flex items-center justify-center gap-2 text-sm theme-text-muted">
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Memuat data wali kelas...
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filteredWali.map((item) => (
                        <tr
                          key={item.id}
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
                              {item.kelas}
                            </span>
                          </td>

                          <td className="px-4 py-2.5">
                            {item.waliKelasId ? (
                              <div className="flex items-center gap-3">
                                <Avatar
                                  nama={item.waliKelas}
                                  size="sm"
                                />

                                <span className="font-semibold theme-text">
                                  {item.waliKelas}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs theme-text-muted italic">
                                Belum ditugaskan
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5">
                            <span className="font-mono text-xs theme-text-secondary">
                              {item.nip || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 text-center">
                            <span className="inline-flex items-center gap-1.5 theme-text-secondary font-medium">
                              <Users
                                size={13}
                                className="theme-text-muted"
                              />

                              {item.jumlahSiswa} siswa
                            </span>
                          </td>

                          <td className="px-4 py-2.5 theme-text-secondary">
                            {item.tahunAjaran}
                            {item.semester
                              ? ` (${item.semester})`
                              : ""}
                          </td>

                          <td className="px-4 py-2.5 text-center">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleDetail(item.id)
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

                              {item.waliKelasId ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleUbah(item.id)
                                    }
                                    title="Ganti wali kelas"
                                    className="
                                      inline-flex items-center justify-center
                                      p-1.5
                                      rounded-md
                                      text-[var(--color-primary)]
                                      bg-[var(--color-info-background)]
                                      text-xs font-medium
                                      transition-colors
                                    "
                                  >
                                    <Pencil size={13} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      setConfirmRelease(item)
                                    }
                                    disabled={
                                      releasingId === item.id
                                    }
                                    title="Lepas wali kelas"
                                    className="
                                      inline-flex items-center justify-center
                                      p-1.5
                                      rounded-md
                                      theme-warning
                                      text-xs font-medium
                                      transition-colors
                                      disabled:opacity-60
                                    "
                                  >
                                    {releasingId === item.id ? (
                                      <Loader2
                                        size={13}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Unlink size={13} />
                                    )}
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleTugaskan(item.id)
                                  }
                                  title="Tugaskan wali kelas"
                                  className="
                                    inline-flex items-center justify-center
                                    p-1.5
                                    rounded-md
                                    theme-success
                                    text-xs font-medium
                                    transition-colors
                                  "
                                >
                                  <Plus size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                    {!loading && filteredWali.length === 0 && (
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
                          {wali.length === 0
                            ? "Belum ada data kelas dari server."
                            : "Tidak ada kelas yang cocok dengan filter ini."}
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

      {confirmRelease && (
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
                Lepas Wali Kelas?
              </p>
            </div>

            <p className="text-sm theme-text-muted mb-5">
              Wali kelas{" "}
              <span className="font-semibold theme-text">
                {confirmRelease.waliKelas}
              </span>{" "}
              akan dilepas dari kelas{" "}
              <span className="font-semibold theme-text">
                {confirmRelease.kelas}
              </span>
              . Data kelas dan guru tetap tersimpan.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRelease(null)}
                disabled={Boolean(releasingId)}
                className="
                  flex-1
                  px-4 py-2.5
                  rounded-lg
                  text-sm font-semibold
                  theme-card-soft
                  theme-text-secondary
                  theme-header-hover
                  transition-colors
                  disabled:opacity-60
                "
              >
                Batal
              </button>

              <button
                onClick={() =>
                  handleRelease(confirmRelease.id)
                }
                disabled={Boolean(releasingId)}
                className="
                  flex-1
                  px-4 py-2.5
                  rounded-lg
                  text-sm font-semibold
                  theme-danger
                  transition-colors
                  disabled:opacity-60
                "
              >
                {releasingId ? "Melepas..." : "Ya, Lepas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
