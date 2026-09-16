"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

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

import { getTahunAjaran } from "../../../../services/tahunAjaran.service";
import { getKelas } from "../../../../services/kelas.service";

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
  // Helper untuk mengambil array kelas dari berbagai bentuk response
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
  // Helper untuk mengambil list tahun ajaran
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
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
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

          <main className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#155DFC] border-t-transparent" />

              <p className="text-sm font-medium text-slate-500">
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
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
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50/80 to-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="space-y-7">

              {/* =================================================
                  BREADCRUMB
              ================================================= */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/tahun-ajaran")
                  }
                  className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-[#155DFC]"
                >
                  <ArrowLeft size={16} />
                  <span className="font-medium">
                    Kembali
                  </span>
                </button>

                <span className="text-slate-300">
                  /
                </span>

                <span className="font-medium text-slate-600">
                  Detail Tahun Ajaran
                </span>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50/80 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <AlertCircle
                        size={20}
                        className="text-red-600"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-red-800">
                        Gagal memuat data
                      </p>

                      <p className="mt-1 text-sm text-red-600">
                        {error}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/tahun-ajaran"
                        )
                      }
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
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
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] px-6 py-6 sm:px-8 sm:py-7">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* TITLE */}
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/10 text-white">
                            <CalendarDays size={28} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                              Tahun Ajaran
                            </p>

                            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                              {data.nama || "-"}
                            </h1>

                            <p className="mt-1 text-sm text-slate-300">
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
                                ? "border-emerald-200/50 bg-emerald-50/90 text-emerald-700"
                                : "border-slate-200/50 bg-slate-100/90 text-slate-600"
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
                            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                            href={`/admin/tahun-ajaran/edit/${data.id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d47c9]"
                          >
                            <Edit size={16} />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
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
                              className="text-emerald-600"
                            />
                          ) : (
                            <XCircle
                              size={18}
                              className="text-slate-400"
                            />
                          )
                        }
                        label="Status"
                        value={statusLabel}
                        valueClass={
                          isActive
                            ? "text-emerald-600"
                            : "text-slate-600"
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
                            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${
                              data.semester ===
                              "Ganjil"
                                ? "border-indigo-100 bg-indigo-50 text-indigo-700"
                                : "border-blue-100 bg-blue-50 text-blue-700"
                            }`}
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
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-600"
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
                              className="text-slate-400"
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
                              className="text-slate-400"
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
                              className="text-slate-400"
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
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                    {/* HEADER KELAS */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Layers3 size={21} />
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-slate-800">
                            Kelas
                          </h2>

                          <p className="mt-1 text-xs text-slate-400">
                            Daftar kelas yang
                            terhubung dengan
                            tahun ajaran ini.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                          {loadingKelas
                            ? "Memuat..."
                            : `${kelas.length} Kelas`}
                        </span>

                        <Link
                          href="/admin/kelas"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
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

                            <p className="text-sm text-slate-400">
                              Memuat data kelas...
                            </p>
                          </div>
                        </div>
                      ) : kelas.length === 0 ? (

                        /* EMPTY STATE */
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                            <Layers3 size={24} />
                          </div>

                          <h3 className="mt-4 text-sm font-bold text-slate-700">
                            Belum ada kelas
                          </h3>

                          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                            Belum ada kelas yang
                            menggunakan tahun
                            ajaran{" "}
                            <span className="font-semibold text-slate-500">
                              {data.nama}
                            </span>
                            .
                          </p>

                          <Link
                            href="/admin/kelas"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0d47c9]"
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
                              <tr className="border-b border-slate-100">
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  No
                                </th>

                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Nama Kelas
                                </th>

                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Tingkat
                                </th>

                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Kapasitas
                                </th>

                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Wali Kelas
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
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
                                    className="transition hover:bg-slate-50/70"
                                  >
                                    {/* NO */}
                                    <td className="px-4 py-4 text-sm text-slate-500">
                                      {index + 1}
                                    </td>

                                    {/* NAMA */}
                                    <td className="px-4 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                          <GraduationCap
                                            size={
                                              17
                                            }
                                          />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold text-slate-700">
                                            {item.nama ||
                                              "-"}
                                          </p>

                                          <p className="mt-0.5 text-[11px] text-slate-400">
                                            ID:{" "}
                                            {item.id ||
                                              "-"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* TINGKAT */}
                                    <td className="px-4 py-4">
                                      <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                        Tingkat{" "}
                                        {item.tingkat ??
                                          "-"}
                                      </span>
                                    </td>

                                    {/* KAPASITAS */}
                                    <td className="px-4 py-4 text-sm text-slate-600">
                                      {item.kapasitas ??
                                        "-"}{" "}
                                      siswa
                                    </td>

                                    {/* WALI KELAS */}
                                    <td className="px-4 py-4 text-sm font-medium text-slate-600">
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
                    className={`rounded-2xl border p-5 ${
                      isActive
                        ? "border-emerald-200/70 bg-emerald-50/60"
                        : "border-slate-200/70 bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white ${
                          isActive
                            ? "text-emerald-600"
                            : "text-slate-500"
                        }`}
                      >
                        {isActive ? (
                          <CheckCircle2 size={22} />
                        ) : (
                          <Info size={22} />
                        )}
                      </div>

                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isActive
                              ? "text-emerald-800"
                              : "text-slate-700"
                          }`}
                        >
                          {isActive
                            ? "Tahun Ajaran Aktif"
                            : "Tahun Ajaran Tidak Aktif"}
                        </p>

                        <p
                          className={`mt-1 text-sm leading-6 ${
                            isActive
                              ? "text-emerald-700/80"
                              : "text-slate-500"
                          }`}
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
                  <div className="flex flex-col gap-3 border-t border-slate-200/60 pt-6 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/tahun-ajaran"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft size={16} />

                      Kembali
                    </button>

                    <Link
                      href={`/admin/tahun-ajaran/edit/${data.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d47c9]"
                    >
                      <Edit size={16} />

                      Edit Tahun Ajaran
                    </Link>
                  </div>

                  {/* =================================================
                      FOOTER
                  ================================================= */}
                  <footer className="pt-6 text-center text-xs text-slate-400">
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
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#155DFC] border-t-transparent" />
  );
}

// =============================================================
// STAT ITEM
// =============================================================
function StatItem({
  icon,
  label,
  value,
  valueClass = "text-slate-800",
  truncate = false,
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 sm:py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#155DFC]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
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
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100/80 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#155DFC]">
            {icon}
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {title}
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="divide-y divide-slate-100/80">
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
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span
        className={`text-sm font-semibold text-slate-700 sm:text-right ${
          breakValue ? "break-all" : ""
        } sm:max-w-[60%]`}
      >
        {value || "-"}
      </span>
    </div>
  );
}

