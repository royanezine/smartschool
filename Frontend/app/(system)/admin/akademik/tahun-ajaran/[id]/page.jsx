"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  CalendarDays,
  ArrowLeft,
  Edit,
  CheckCircle2,
  XCircle,
  Clock3,
  Database,
  Hash,
  CalendarCheck,
  RefreshCw,
  AlertCircle,
  Info,
  Layers3,
  GraduationCap,
} from "lucide-react";

import { getTahunAjaran } from "../../../../../../services/tahunAjaran.service";
import { getKelas } from "../../../../../../services/kelas.service";

export default function DetailTahunAjaranPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState(null);
  const [kelas, setKelas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // Helper mengambil array kelas dari berbagai bentuk response
  // =========================================================
  const extractKelas = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    return [];
  };

  // =========================================================
  // Helper mengambil list tahun ajaran
  // =========================================================
  const extractTahunAjaran = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    return [];
  };

  // =========================================================
  // Load detail
  // =========================================================
  const loadDetail = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setLoadingKelas(true);
      }

      // -------------------------------------------------------
      // Ambil data tahun ajaran
      // -------------------------------------------------------
      const response = await getTahunAjaran();
      const list = extractTahunAjaran(response);

      const found = list.find(
        (item) => String(item?.id) === String(id)
      );

      if (!found) {
        setData(null);
        setKelas([]);
        setError("Data tahun ajaran tidak ditemukan.");
        return;
      }

      setData(found);

      // -------------------------------------------------------
      // Ambil data kelas berdasarkan tahun ajaran
      // -------------------------------------------------------
      try {
        const kelasResponse = await getKelas({
          tahunAjaranId: id,
          page: 1,
          limit: 100,
        });

        setKelas(extractKelas(kelasResponse));
      } catch (kelasError) {
        console.error(
          "Gagal mengambil data kelas:",
          kelasError
        );

        setKelas([]);
      }
    } catch (err) {
      console.error(
        "Gagal mengambil detail tahun ajaran:",
        err
      );

      setData(null);
      setKelas([]);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail tahun ajaran."
      );
    } finally {
      setLoading(false);
      setLoadingKelas(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // Load saat ID tersedia
  // =========================================================
  useEffect(() => {
    if (id) {
      loadDetail(false);
    }
  }, [id]);

  // =========================================================
  // Sidebar
  // =========================================================
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // =========================================================
  // Status
  // =========================================================
  const isActive = data?.status === "aktif";

  const statusLabel = isActive
    ? "Aktif"
    : "Tidak Aktif";

  // =========================================================
  // Format tanggal
  // =========================================================
  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // Deskripsi semester
  // =========================================================
  const semesterDescription = useMemo(() => {
    if (data?.semester === "Ganjil") {
      return "Semester pertama pada tahun ajaran.";
    }

    if (data?.semester === "Genap") {
      return "Semester kedua pada tahun ajaran.";
    }

    return "Periode semester akademik.";
  }, [data]);

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="tahunAjaran"
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

          <main className="flex min-h-0 flex-1 items-center justify-center theme-page">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />

              <p className="text-sm font-medium theme-text-muted">
                Memuat detail tahun ajaran...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================
  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="tahunAjaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}
        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="space-y-7">

              {/* =================================================
                  BREADCRUMB
              ================================================= */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/akademik/tahun-ajaran")
                  }
                  className="inline-flex items-center gap-1.5 theme-text-muted transition theme-sidebar-hover"
                >
                  <ArrowLeft size={16} />

                  <span className="font-medium">
                    Kembali
                  </span>
                </button>

                <span className="theme-text-placeholder">
                  /
                </span>

                <span className="font-medium theme-text-secondary">
                  Detail Tahun Ajaran
                </span>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}
              {error && (
                <div className="theme-danger rounded-xl border p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full theme-danger">
                      <AlertCircle
                        size={20}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        Gagal memuat data
                      </p>

                      <p className="mt-1 text-sm">
                        {error}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/akademik/tahun-ajaran"
                        )
                      }
                      className="rounded-lg border theme-border theme-card px-4 py-2 text-sm font-medium theme-text-secondary transition theme-header-hover"
                    >
                      Kembali
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  DATA
              ================================================= */}
              {data && (
                <>
                  {/* =================================================
                      HERO
                  ================================================= */}
                  <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-primary px-6 py-6 sm:px-8 sm:py-7">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* TITLE */}
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
                            <CalendarDays size={28} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                              Tahun Ajaran
                            </p>

                            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                              {data.nama || "-"}
                            </h1>

                            <p className="mt-1 text-sm text-white/75">
                              Semester{" "}
                              {data.semester || "-"}
                            </p>
                          </div>
                        </div>

                        {/* ACTION */}
                        <div className="flex flex-wrap items-center gap-3">

                          {/* STATUS */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                              isActive
                                ? "theme-success"
                                : "theme-card-soft theme-text-secondary"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}

                            {statusLabel}
                          </span>

                          {/* REFRESH */}
                          <button
                            type="button"
                            onClick={() =>
                              loadDetail(true)
                            }
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw
                              size={15}
                              className={
                                refreshing
                                  ? "animate-spin"
                                  : ""
                              }
                            />

                            Refresh
                          </button>

                          {/* EDIT */}
                          <Link
                            href={`/admin/akademik/tahun-ajaran/edit/${data.id}`}
                            className="theme-card inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white px-5 py-2.5 text-sm font-semibold theme-text transition hover:bg-white/90"
                          >
                            <Edit size={16} />

                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0 divide-[var(--color-border-soft)]">
                      <StatItem
                        icon={
                          <CalendarCheck size={18} />
                        }
                        label="Semester"
                        value={
                          data.semester || "-"
                        }
                      />

                      <StatItem
                        icon={
                          isActive ? (
                            <CheckCircle2
                              size={18}
                              className="text-[var(--color-success)]"
                            />
                          ) : (
                            <XCircle
                              size={18}
                              className="theme-text-muted"
                            />
                          )
                        }
                        label="Status"
                        value={statusLabel}
                        valueClass={
                          isActive
                            ? "text-[var(--color-success)]"
                            : "theme-text-secondary"
                        }
                      />

                      <StatItem
                        icon={
                          <Layers3 size={18} />
                        }
                        label="Jumlah Kelas"
                        value={
                          loadingKelas
                            ? "..."
                            : String(
                                kelas.length
                              )
                        }
                      />

                      <StatItem
                        icon={<Hash size={18} />}
                        label="ID Tahun Ajaran"
                        value={
                          data.id || "-"
                        }
                        truncate
                      />
                    </div>
                  </div>

                  {/* =================================================
                      DETAIL CARDS
                  ================================================= */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* INFORMASI PERIODE */}
                    <DetailCard
                      title="Informasi Periode"
                      icon={
                        <CalendarCheck size={20} />
                      }
                      description="Data utama tahun ajaran"
                    >
                      <DetailRow
                        label="Nama Tahun Ajaran"
                        value={
                          data.nama || "-"
                        }
                      />

                      <DetailRow
                        label="Semester"
                        value={
                          <span
                            className={
                              data.semester ===
                              "Ganjil"
                                ? "theme-info inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold"
                                : "theme-primary-outline inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold"
                            }
                          >
                            {data.semester ||
                              "-"}
                          </span>
                        }
                      />

                      <DetailRow
                        label="Deskripsi"
                        value={
                          semesterDescription
                        }
                      />

                      <DetailRow
                        label="Status"
                        value={
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? "theme-success"
                                : "theme-card-soft theme-text-secondary"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle2
                                size={12}
                              />
                            ) : (
                              <XCircle
                                size={12}
                              />
                            )}

                            {statusLabel}
                          </span>
                        }
                      />

                      <DetailRow
                        label="Sekolah"
                        value={
                          data?.sekolah?.nama ||
                          "Sekolah Aktif"
                        }
                      />

                      <DetailRow
                        label="ID Sekolah"
                        value={
                          data.sekolahId ||
                          data?.sekolah?.id ||
                          "-"
                        }
                        breakValue
                      />
                    </DetailCard>

                    {/* INFORMASI SISTEM */}
                    <DetailCard
                      title="Informasi Sistem"
                      icon={
                        <Database size={20} />
                      }
                      description="Metadata & riwayat data"
                    >
                      <DetailRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <Clock3
                              size={14}
                              className="theme-text-muted"
                            />
                            Dibuat
                          </span>
                        }
                        value={formatDateTime(
                          data.dibuatPada
                        )}
                      />

                      <DetailRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <RefreshCw
                              size={14}
                              className="theme-text-muted"
                            />
                            Diperbarui
                          </span>
                        }
                        value={formatDateTime(
                          data.diperbaruiPada
                        )}
                      />

                      <DetailRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <XCircle
                              size={14}
                              className="theme-text-muted"
                            />
                            Dihapus
                          </span>
                        }
                        value={formatDateTime(
                          data.dihapusPada
                        )}
                      />
                    </DetailCard>
                  </div>

                  {/* =================================================
                      KELAS
                  ================================================= */}
                  <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">

                    {/* HEADER KELAS */}
                    <div className="theme-card-soft theme-border-soft flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                          <Layers3 size={21} />
                        </div>

                        <div>
                          <h2 className="text-base font-bold theme-text">
                            Kelas
                          </h2>

                          <p className="mt-1 text-xs theme-text-muted">
                            Daftar kelas yang
                            terhubung dengan
                            tahun ajaran ini.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="theme-info rounded-full px-3 py-1.5 text-xs font-bold">
                          {loadingKelas
                            ? "Memuat..."
                            : `${kelas.length} Kelas`}
                        </span>

                        <Link
                          href="/admin/kelas"
                          className="theme-card theme-border inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold theme-text-secondary transition theme-header-hover"
                        >
                          <GraduationCap
                            size={15}
                          />

                          Kelola Kelas
                        </Link>
                      </div>
                    </div>

                    {/* CONTENT KELAS */}
                    <div className="p-5 sm:p-6">

                      {/* LOADING KELAS */}
                      {loadingKelas ? (
                        <div className="flex min-h-[160px] items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader />

                            <p className="text-sm theme-text-muted">
                              Memuat data kelas...
                            </p>
                          </div>
                        </div>
                      ) : kelas.length === 0 ? (

                        /* EMPTY STATE */
                        <div className="theme-card-soft theme-border rounded-xl border border-dashed px-5 py-10 text-center">
                          <div className="theme-card mx-auto flex h-12 w-12 items-center justify-center rounded-xl theme-text-placeholder shadow-sm">
                            <Layers3 size={24} />
                          </div>

                          <h3 className="mt-4 text-sm font-bold theme-text">
                            Belum ada kelas
                          </h3>

                          <p className="mx-auto mt-1 max-w-md text-xs leading-5 theme-text-muted">
                            Belum ada kelas yang
                            menggunakan tahun
                            ajaran{" "}
                            <span className="font-semibold theme-text-secondary">
                              {data.nama}
                            </span>
                            .
                          </p>

                          <Link
                            href="/admin/kelas"
                            className="theme-primary mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition"
                          >
                            <GraduationCap
                              size={15}
                            />

                            Tambah / Kelola
                            Kelas
                          </Link>
                        </div>
                      ) : (

                        /* TABLE */
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[700px] text-left">
                            <thead>
                              <tr className="theme-border-soft border-b">
                                <th className="theme-table-header px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                                  No
                                </th>

                                <th className="theme-table-header px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                                  Nama Kelas
                                </th>

                                <th className="theme-table-header px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                                  Tingkat
                                </th>

                                <th className="theme-table-header px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                                  Kapasitas
                                </th>

                                <th className="theme-table-header px-4 py-3 text-[11px] font-bold uppercase tracking-wide">
                                  Wali Kelas
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-[var(--color-border-soft)]">
                              {kelas.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <tr
                                    key={
                                      item.id ||
                                      index
                                    }
                                    className="theme-table-hover transition"
                                  >
                                    {/* NO */}
                                    <td className="px-4 py-4 text-sm theme-text-muted">
                                      {index + 1}
                                    </td>

                                    {/* NAMA */}
                                    <td className="px-4 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                          <GraduationCap
                                            size={17}
                                          />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold theme-text-secondary">
                                            {item.nama ||
                                              "-"}
                                          </p>

                                          <p className="mt-0.5 text-[11px] theme-text-muted">
                                            ID:{" "}
                                            {item.id ||
                                              "-"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* TINGKAT */}
                                    <td className="px-4 py-4">
                                      <span className="theme-info inline-flex rounded-md px-2.5 py-1 text-xs font-semibold">
                                        Tingkat{" "}
                                        {item.tingkat ?? "-"}
                                      </span>
                                    </td>

                                    {/* KAPASITAS */}
                                    <td className="px-4 py-4 text-sm theme-text-secondary">
                                      {item.kapasitas ?? "-"}{" "}
                                      siswa
                                    </td>

                                    {/* WALI KELAS */}
                                    <td className="px-4 py-4 text-sm font-medium theme-text-secondary">
                                      {item
                                        ?.waliKelas
                                        ?.namaLengkap ||
                                        item
                                          ?.waliKelas
                                          ?.namaPengguna ||
                                        item.waliKelasNama ||
                                        "-"}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      STATUS INFORMATION
                  ================================================= */}
                  <div
                    className={
                      isActive
                        ? "theme-success rounded-2xl border p-5"
                        : "theme-card-soft theme-border rounded-2xl border p-5"
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={
                          isActive
                            ? "theme-card flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                            : "theme-card-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        }
                      >
                        {isActive ? (
                          <CheckCircle2
                            size={22}
                            className="text-[var(--color-success)]"
                          />
                        ) : (
                          <Info
                            size={22}
                            className="theme-text-muted"
                          />
                        )}
                      </div>

                      <div>
                        <p
                          className={
                            isActive
                              ? "text-sm font-bold text-[var(--color-success)]"
                              : "text-sm font-bold theme-text"
                          }
                        >
                          {isActive
                            ? "Tahun Ajaran Aktif"
                            : "Tahun Ajaran Tidak Aktif"}
                        </p>

                        <p
                          className={
                            isActive
                              ? "mt-1 text-sm leading-6 text-[var(--color-success)] opacity-80"
                              : "mt-1 text-sm leading-6 theme-text-secondary"
                          }
                        >
                          {isActive
                            ? `${data.nama} semester ${data.semester} sedang digunakan sebagai periode akademik aktif sekolah.`
                            : `${data.nama} semester ${data.semester} saat ini tidak digunakan sebagai periode akademik aktif.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      FOOTER ACTION
                  ================================================= */}
                  <div className="theme-border-soft flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/akademik/tahun-ajaran"
                        )
                      }
                      className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition theme-header-hover"
                    >
                      <ArrowLeft size={16} />

                      Kembali
                    </button>

                    <Link
                      href={`/admin/akademik/tahun-ajaran/edit/${data.id}`}
                      className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition"
                    >
                      <Edit size={16} />

                      Edit Tahun Ajaran
                    </Link>
                  </div>

                  {/* =================================================
                      FOOTER
                  ================================================= */}
                  <footer className="pt-6 text-center text-xs theme-text-muted">
                    © 2026 SmartSchool • Detail Tahun Ajaran
                  </footer>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =============================================================
// LOADER
// =============================================================
function Loader() {
  return (
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
  );
}

// =============================================================
// STAT ITEM
// =============================================================
function StatItem({
  icon,
  label,
  value,
  valueClass = "theme-text",
  truncate = false,
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 sm:py-5">
      <div className="theme-card-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-lg theme-sidebar-text-active">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium theme-text-muted">
          {label}
        </p>

        <p
          className={`mt-0.5 text-sm font-bold ${valueClass} ${
            truncate ? "truncate" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// =============================================================
// DETAIL CARD
// =============================================================
function DetailCard({
  title,
  icon,
  description,
  children,
}) {
  return (
    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
      <div className="theme-border-soft border-b px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            {icon}
          </div>

          <div>
            <h2 className="text-sm font-bold theme-text">
              {title}
            </h2>

            <p className="mt-0.5 text-xs theme-text-muted">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="divide-y divide-[var(--color-border-soft)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// DETAIL ROW
// =============================================================
function DetailRow({
  label,
  value,
  breakValue = false,
}) {
  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-xs font-medium theme-text-secondary">
        {label}
      </span>

      <span
        className={`text-sm font-semibold theme-text sm:text-right ${
          breakValue ? "break-all" : ""
        } sm:max-w-[60%]`}
      >
        {value || "-"}
      </span>
    </div>
  );
}