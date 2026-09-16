"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  Building,
  ArrowLeft,
  Edit,
  Trash2,
  Layers,
  FileText,
  Info,
  Hash,
  Printer,
  GraduationCap,
  ChevronRight,
  Clock3,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  getGedung,
  getLantaiByGedung,
  deleteGedung,
} from "../../../../../../services/infrastruktur.service";

export default function DetailGedungPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [data, setData] = useState(null);
  const [lantai, setLantai] = useState([]);

  const [error, setError] = useState("");

  /* =========================================================
     FOTO GEDUNG
  ========================================================= */

  const fotoGedung = useMemo(() => {
    const foto = data?.fotoGedung ?? data?.fotoUrl ?? "";

    return typeof foto === "string" ? foto.trim() : "";
  }, [data]);

  /* =========================================================
     FORMAT TANGGAL
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     TOTAL KELAS
  ========================================================= */

  const totalKelas = useMemo(() => {
    return lantai.reduce((total, item) => {
      return (
        total +
        (Array.isArray(item?.kelas)
          ? item.kelas.length
          : 0)
      );
    }, 0);
  }, [lantai]);

  /* =========================================================
     FETCH DETAIL
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError("");

        const gedungResponse = await getGedung();

        const gedungList =
          gedungResponse?.data ??
          gedungResponse?.result ??
          gedungResponse ??
          [];

        if (!Array.isArray(gedungList)) {
          throw new Error(
            "Format data gedung tidak valid."
          );
        }

        const found = gedungList.find(
          (item) =>
            String(item.id) === String(id)
        );

        if (!found) {
          if (mounted) {
            setData(null);
            setError(
              `Data gedung dengan ID #${id} tidak tersedia.`
            );
          }

          return;
        }

        if (mounted) {
          setData(found);
        }

        try {
          const lantaiResponse =
            await getLantaiByGedung(id);

          const lantaiData =
            lantaiResponse?.data ??
            lantaiResponse?.result ??
            lantaiResponse ??
            [];

          if (mounted) {
            setLantai(
              Array.isArray(lantaiData)
                ? lantaiData
                : []
            );
          }
        } catch (lantaiError) {
          console.error(
            "Error fetch lantai:",
            lantaiError
          );

          if (mounted) {
            setLantai([]);
          }
        }
      } catch (err) {
        console.error(
          "Error fetch detail gedung:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              "Gagal mengambil detail gedung."
          );

          setData(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {
    if (!data) return;

    const confirmed = window.confirm(
      `Yakin ingin menghapus gedung "${data.nama}"?`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      await deleteGedung(data.id);

      alert("Gedung berhasil dihapus.");

      router.push("/admin/sarpras/gedung");
    } catch (err) {
      console.error(
        "Error hapus gedung:",
        err
      );

      alert(
        err?.message ||
          "Gagal menghapus gedung. Pastikan gedung tidak memiliki lantai."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
        <div className="fixed inset-y-0 left-0 z-50">
          <Sidebar
            active="sarpras"
            setActive={() => {}}
            collapsed={isCollapsed}
            setCollapsed={setIsCollapsed}
          />
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ${
            isCollapsed
              ? "lg:ml-[88px]"
              : "lg:ml-[260px]"
          }`}
        >
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setIsCollapsed(
                  (value) => !value
                )
              }
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email:
                  "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="min-h-0 flex-1 overflow-hidden">
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Memuat detail gedung
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Mohon tunggu sebentar...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!data) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
        <div className="fixed inset-y-0 left-0 z-50">
          <Sidebar
            active="sarpras"
            setActive={() => {}}
            collapsed={isCollapsed}
            setCollapsed={setIsCollapsed}
          />
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ${
            isCollapsed
              ? "lg:ml-[88px]"
              : "lg:ml-[260px]"
          }`}
        >
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setIsCollapsed(
                  (value) => !value
                )
              }
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email:
                  "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="min-h-0 flex-1 overflow-auto">
            <div className="flex min-h-full items-center justify-center p-6">
              <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Building size={28} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-800">
                  Gedung tidak ditemukan
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {error ||
                    `Data gedung dengan ID #${id} tidak tersedia.`}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/sarpras/gedung"
                    )
                  }
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     NORMAL PAGE
  ========================================================= */

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setIsCollapsed(
                (value) => !value
              )
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1450px] p-4 sm:p-5 lg:p-6 xl:p-7">

            {/* =================================================
                BREADCRUMB
            ================================================= */}

            <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/sarpras/gedung"
                  )
                }
                className="font-medium transition hover:text-blue-600"
              >
                Gedung
              </button>

              <ChevronRight size={13} />

              <span className="truncate font-medium text-slate-600">
                Detail
              </span>
            </div>

            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.045)]">

              <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl" />

              <div className="relative p-5 sm:p-6 lg:p-7">

                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                  {/* INFO */}

                  <div className="flex min-w-0 items-start gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.22)] sm:h-16 sm:w-16">
                      <Building
                        size={27}
                        strokeWidth={1.7}
                      />
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[27px]">
                          {data.nama ||
                            "Detail Gedung"}
                        </h1>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2
                            size={11}
                          />
                          Aktif
                        </span>

                      </div>

                      <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
                        Informasi lengkap mengenai
                        gedung, lantai, dan kelas
                        yang terdaftar.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
                          <Hash size={12} />
                          {data.kode || "-"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600">
                          <Layers size={12} />
                          {lantai.length} Lantai
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-600">
                          <GraduationCap
                            size={12}
                          />
                          {totalKelas} Kelas
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ACTION */}

                  <div className="flex flex-wrap items-center gap-2 xl:shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/sarpras/gedung"
                        )
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 sm:text-sm"
                    >
                      <ArrowLeft
                        size={15}
                      />
                      Kembali
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/sarpras/gedung/edit/${data.id}`
                        )
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 sm:text-sm"
                    >
                      <Edit size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                    >
                      <Trash2 size={15} />
                      {isDeleting
                        ? "Menghapus..."
                        : "Hapus"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        window.print()
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-[0_7px_18px_rgba(15,23,42,0.14)] transition hover:bg-slate-800 sm:text-sm"
                    >
                      <Printer size={15} />
                      Cetak
                    </button>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

                <div className="flex items-center justify-between">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Building size={17} />
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    Gedung
                  </span>

                </div>

                <p className="mt-3 text-xl font-bold text-slate-800">
                  1
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Gedung terdaftar
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

                <div className="flex items-center justify-between">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Layers size={17} />
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    Lantai
                  </span>

                </div>

                <p className="mt-3 text-xl font-bold text-slate-800">
                  {lantai.length}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Total lantai
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

                <div className="flex items-center justify-between">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap
                      size={17}
                    />
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    Kelas
                  </span>

                </div>

                <p className="mt-3 text-xl font-bold text-slate-800">
                  {totalKelas}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Total kelas
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

                <div className="flex items-center justify-between">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2
                      size={17}
                    />
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    Status
                  </span>

                </div>

                <p className="mt-3 text-base font-bold text-emerald-600">
                  Aktif
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Data gedung aktif
                </p>

              </div>

            </div>

            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">

              {/* =================================================
                  LEFT
              ================================================= */}

              <div className="min-w-0 space-y-4">

                {/* =================================================
                    INFORMATION
                ================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.04)]">

                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText
                          size={16}
                        />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          Informasi Dasar
                        </h2>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Detail identitas gedung
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">

                    <div className="bg-white p-5">

                      <div className="flex items-center gap-2 text-slate-400">
                        <Building
                          size={15}
                        />

                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                          Nama Gedung
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-800">
                        {data.nama || "-"}
                      </p>

                    </div>

                    <div className="bg-white p-5">

                      <div className="flex items-center gap-2 text-slate-400">
                        <Hash size={15} />

                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                          Kode Gedung
                        </span>
                      </div>

                      <p className="mt-2 font-mono text-sm font-bold text-slate-800">
                        {data.kode || "-"}
                      </p>

                    </div>

                    <div className="bg-white p-5">

                      <div className="flex items-center gap-2 text-slate-400">
                        <Info size={15} />

                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                          ID Gedung
                        </span>
                      </div>

                      <p className="mt-2 break-all font-mono text-xs font-semibold text-slate-700">
                        {data.id}
                      </p>

                    </div>

                    <div className="bg-white p-5">

                      <div className="flex items-center gap-2 text-slate-400">
                        <Layers size={15} />

                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                          Jumlah Lantai
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-800">
                        {lantai.length} Lantai
                      </p>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    LANTAI
                ================================================= */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.04)]">

                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Layers
                          size={16}
                        />
                      </div>

                      <div>

                        <h2 className="text-sm font-bold text-slate-800">
                          Struktur Lantai
                        </h2>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Lantai dan kelas dalam gedung
                        </p>

                      </div>

                    </div>

                    <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                      {lantai.length} Lantai
                    </span>

                  </div>

                  {lantai.length === 0 ? (

                    <div className="px-6 py-14 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Layers size={24} />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Belum ada lantai
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                        Gedung ini belum memiliki
                        data lantai yang terdaftar.
                      </p>

                    </div>

                  ) : (

                    <div className="divide-y divide-slate-100">

                      {lantai.map(
                        (
                          item,
                          index
                        ) => {

                          const kelas =
                            Array.isArray(
                              item?.kelas
                            )
                              ? item.kelas
                              : [];

                          return (

                            <div
                              key={
                                item.id ||
                                index
                              }
                              className="p-5 transition hover:bg-slate-50/40 sm:p-6"
                            >

                              <div className="flex items-center justify-between gap-4">

                                <div className="flex min-w-0 items-center gap-3">

                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <Layers
                                      size={18}
                                    />
                                  </div>

                                  <div className="min-w-0">

                                    <h3 className="truncate text-sm font-bold text-slate-800">
                                      {item.nama ||
                                        `Lantai ${
                                          index +
                                          1
                                        }`}
                                    </h3>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                      Lantai{" "}
                                      {index +
                                        1}{" "}
                                      •{" "}
                                      {kelas.length}{" "}
                                      kelas
                                    </p>

                                  </div>

                                </div>

                                <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 sm:flex">

                                  <GraduationCap
                                    size={12}
                                  />

                                  {kelas.length}{" "}
                                  Kelas

                                </div>

                              </div>

                              {kelas.length > 0 ? (

                                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">

                                  {kelas.map(
                                    (
                                      kelasItem,
                                      kelasIndex
                                    ) => (

                                      <div
                                        key={
                                          kelasItem.id ||
                                          kelasIndex
                                        }
                                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-200 hover:bg-blue-50/30"
                                      >

                                        <div className="flex min-w-0 items-center gap-3">

                                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                                            <GraduationCap
                                              size={
                                                15
                                              }
                                            />
                                          </div>

                                          <div className="min-w-0">

                                            <p className="truncate text-xs font-bold text-slate-700">
                                              {kelasItem.nama ||
                                                "-"}
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-slate-400">
                                              Kelas
                                            </p>

                                          </div>

                                        </div>

                                        {kelasItem.tingkat && (
                                          <span className="ml-2 shrink-0 rounded-md bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-500">
                                            {
                                              kelasItem.tingkat
                                            }
                                          </span>
                                        )}

                                      </div>

                                    )
                                  )}

                                </div>

                              ) : (

                                <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">

                                  <AlertCircle
                                    size={14}
                                    className="text-slate-400"
                                  />

                                  <p className="text-[11px] text-slate-400">
                                    Belum ada kelas pada
                                    lantai ini.
                                  </p>

                                </div>

                              )}

                            </div>

                          );
                        }
                      )}

                    </div>

                  )}

                </section>

              </div>

              {/* =================================================
                  RIGHT
              ================================================= */}

              <aside className="space-y-4">

                {/* =================================================
                    FOTO
                ================================================= */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.04)]">

                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ImageIcon
                        size={16}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-800">
                        Foto Gedung
                      </h2>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Dokumentasi gedung
                      </p>
                    </div>

                  </div>

                  {fotoGedung ? (

                    <div className="p-3">

                      <div className="group relative overflow-hidden rounded-xl bg-slate-100">

                        <img
                          src={fotoGedung}
                          alt={
                            data.nama ||
                            "Foto Gedung"
                          }
                          className="h-[220px] w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";

                            const fallback =
                              event.currentTarget
                                .parentElement
                                ?.querySelector(
                                  "[data-photo-fallback]"
                                );

                            if (fallback) {
                              fallback.classList.remove(
                                "hidden"
                              );
                            }
                          }}
                        />

                        <div
                          data-photo-fallback
                          className="hidden h-[220px] flex-col items-center justify-center bg-slate-100 text-center"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                            <ImageIcon
                              size={22}
                            />
                          </div>

                          <p className="mt-3 text-xs font-semibold text-slate-500">
                            Foto tidak dapat dimuat
                          </p>

                          <p className="mt-1 px-4 text-[10px] text-slate-400">
                            URL foto tidak dapat diakses.
                          </p>
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />

                        <div className="absolute bottom-3 left-3 right-3">

                          <p className="truncate text-xs font-semibold text-white">
                            {data.nama}
                          </p>

                        </div>

                      </div>

                    </div>

                  ) : (

                    <div className="p-4">

                      <div className="flex h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                          <ImageIcon
                            size={22}
                          />
                        </div>

                        <p className="mt-3 text-xs font-semibold text-slate-500">
                          Belum ada foto
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Foto gedung belum tersedia
                        </p>

                      </div>

                    </div>

                  )}

                </section>

                {/* =================================================
                    QUICK INFORMATION
                ================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.04)]">

                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Info size={16} />
                    </div>

                    <div>

                      <h2 className="text-sm font-bold text-slate-800">
                        Ringkasan
                      </h2>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Informasi singkat
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 space-y-4">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <CheckCircle2
                            size={14}
                          />
                        </div>

                        <span className="text-xs font-medium text-slate-500">
                          Status
                        </span>

                      </div>

                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                        Aktif
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Hash size={14} />
                        </div>

                        <span className="text-xs font-medium text-slate-500">
                          Kode
                        </span>

                      </div>

                      <span className="max-w-[150px] truncate font-mono text-xs font-bold text-slate-700">
                        {data.kode || "-"}
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Layers
                            size={14}
                          />
                        </div>

                        <span className="text-xs font-medium text-slate-500">
                          Lantai
                        </span>

                      </div>

                      <span className="text-xs font-bold text-slate-700">
                        {lantai.length}
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <GraduationCap
                            size={14}
                          />
                        </div>

                        <span className="text-xs font-medium text-slate-500">
                          Kelas
                        </span>

                      </div>

                      <span className="text-xs font-bold text-slate-700">
                        {totalKelas}
                      </span>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    TIMESTAMP
                ================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.04)]">

                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Clock3 size={16} />
                    </div>

                    <div>

                      <h2 className="text-sm font-bold text-slate-800">
                        Informasi Waktu
                      </h2>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Riwayat data
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 space-y-4">

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Dibuat
                      </p>

                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
                        {formatDate(
                          data.createdAt ??
                            data.dibuatPada
                        )}
                      </p>

                    </div>

                    <div className="border-t border-slate-100 pt-4">

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Terakhir Diperbarui
                      </p>

                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
                        {formatDate(
                          data.updatedAt ??
                            data.diperbaruiPada
                        )}
                      </p>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    ACTION
                ================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.04)]">

                  <p className="px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Aksi Gedung
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/sarpras/gedung/edit/${data.id}`
                        )
                      }
                      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <Edit size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} />

                      {isDeleting
                        ? "..."
                        : "Hapus"}
                    </button>

                  </div>

                </section>

              </aside>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="mt-5 border-t border-slate-200/70 py-4 text-center">

              <p className="text-[10px] font-medium text-slate-400">
                © 2026 SmartSchool • Sarana &
                Prasarana
              </p>

            </div>

          </div>
        </main>
      </div>

      {/* =====================================================
          PRINT STYLE
      ===================================================== */}

      <style jsx global>{`
        @media print {
          aside,
          button,
          header,
          nav {
            display: none !important;
          }

          body {
            background: white !important;
          }

          main {
            overflow: visible !important;
          }

          * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}