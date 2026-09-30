"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

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
} from "../../../../../../../services/infrastruktur.service";

/* ============================================================
   THEME HELPERS
============================================================ */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimarySoftStrong =
  "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryBorderHover =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimaryTextHover =
  "hover:text-[var(--color-primary)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_22px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_3px_14px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeCardHover =
  "hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-text)_9%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeWarningSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]";

const themeWarningHover =
  "hover:border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] hover:text-[var(--color-warning)]";

const themeDangerSoft =
  "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeDangerHover =
  "hover:border-[color-mix(in_srgb,var(--color-text)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]";

const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

/* ============================================================
   COMPONENT
============================================================ */

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
      <div className="theme-page flex h-screen overflow-hidden">
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

          <main className="theme-page min-h-0 flex-1 overflow-hidden">
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <div
                  className={`theme-card ${themeCardShadow} mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${themePrimaryBorder}`}
                >
                  <div
                    className="h-6 w-6 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] border-t-[var(--color-primary)]"
                  />
                </div>

                <p className="theme-text mt-4 text-sm font-semibold">
                  Memuat detail gedung
                </p>

                <p className="theme-text-muted mt-1 text-xs">
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
      <div className="theme-page flex h-screen overflow-hidden">
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

          <main className="theme-page min-h-0 flex-1 overflow-auto">
            <div className="flex min-h-full items-center justify-center p-6">
              <div
                className={`theme-card ${themeCardShadow} w-full max-w-md rounded-3xl border ${themePrimaryBorder} p-8 text-center`}
              >
                <div
                  className={`theme-soft-surface theme-text-muted mx-auto flex h-16 w-16 items-center justify-center rounded-2xl`}
                >
                  <Building size={28} />
                </div>

                <h3 className="theme-text mt-5 text-lg font-bold">
                  Gedung tidak ditemukan
                </h3>

                <p className="theme-text-muted mt-2 text-sm leading-6">
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
                  className={`theme-primary-gradient mt-6 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-95 ${themePrimaryShadow}`}
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
    <div className="theme-page flex h-screen overflow-hidden">
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

        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1450px] p-4 sm:p-5 lg:p-6 xl:p-7">

            {/* =================================================
                BREADCRUMB
            ================================================= */}

            <div className="theme-text-muted mb-4 flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/sarpras/gedung"
                  )
                }
                className={`font-medium transition ${themePrimaryTextHover}`}
              >
                Gedung
              </button>

              <ChevronRight size={13} />

              <span className="theme-text-secondary truncate font-medium">
                Detail
              </span>
            </div>

            {/* =================================================
                HERO
            ================================================= */}

            <section
              className={`theme-card ${themeCardShadow} relative overflow-hidden rounded-[22px] border ${themePrimaryBorder}`}
            >
              <div
                className={`pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full ${themePrimarySoft} blur-3xl`}
              />

              <div
                className={`pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full ${themeSoftSurface} blur-3xl`}
              />

              <div className="relative p-5 sm:p-6 lg:p-7">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                  {/* INFO */}

                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`theme-primary-gradient ${themePrimaryShadow} flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[var(--color-card)] sm:h-16 sm:w-16`}
                    >
                      <Building
                        size={27}
                        strokeWidth={1.7}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="theme-text truncate text-xl font-bold tracking-tight sm:text-2xl lg:text-[27px]">
                          {data.nama ||
                            "Detail Gedung"}
                        </h1>

                        <span
                          className={`theme-success inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-2.5 py-1 text-[10px] font-bold`}
                        >
                          <CheckCircle2
                            size={11}
                          />
                          Aktif
                        </span>
                      </div>

                      <p className="theme-text-muted mt-1.5 max-w-2xl text-sm">
                        Informasi lengkap mengenai
                        gedung, lantai, dan kelas
                        yang terdaftar.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        <span
                          className={`theme-card theme-text-secondary inline-flex items-center gap-1.5 rounded-lg border ${themePrimaryBorder} px-2.5 py-1.5 text-[11px] font-semibold`}
                        >
                          <Hash size={12} />
                          {data.kode || "-"}
                        </span>

                        <span
                          className={`theme-primary inline-flex items-center gap-1.5 rounded-lg border ${themePrimaryBorder} ${themePrimarySoft} px-2.5 py-1.5 text-[11px] font-semibold`}
                        >
                          <Layers size={12} />
                          {lantai.length} Lantai
                        </span>

                        <span
                          className={`theme-info inline-flex items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--color-info)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] px-2.5 py-1.5 text-[11px] font-semibold`}
                        >
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
                      className={`theme-card theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border ${themePrimaryBorder} px-3.5 text-xs font-semibold shadow-sm transition ${themeNeutralHover} sm:text-sm`}
                    >
                      <ArrowLeft size={15} />
                      Kembali
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/sarpras/gedung/edit/${data.id}`
                        )
                      }
                      className={`theme-card theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border ${themePrimaryBorder} px-3.5 text-xs font-semibold shadow-sm transition ${themeWarningHover} sm:text-sm`}
                    >
                      <Edit size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={`theme-card theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border ${themePrimaryBorder} px-3.5 text-xs font-semibold shadow-sm transition ${themeDangerHover} disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm`}
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
                      className={`theme-primary-gradient ${themePrimaryShadow} inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold text-[var(--color-card)] transition hover:brightness-95 sm:text-sm`}
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

              {/* GEDUNG */}

              <div
                className={`theme-card ${themeSmallShadow} rounded-2xl border ${themePrimaryBorder} p-4`}
              >
                <div className="flex items-center justify-between">

                  <div
                    className={`theme-primary ${themePrimarySoft} flex h-9 w-9 items-center justify-center rounded-xl`}
                  >
                    <Building size={17} />
                  </div>

                  <span className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                    Gedung
                  </span>
                </div>

                <p className="theme-text mt-3 text-xl font-bold">
                  1
                </p>

                <p className="theme-text-muted mt-0.5 text-[11px]">
                  Gedung terdaftar
                </p>
              </div>

              {/* LANTAI */}

              <div
                className={`theme-card ${themeSmallShadow} rounded-2xl border ${themePrimaryBorder} p-4`}
              >
                <div className="flex items-center justify-between">

                  <div
                    className={`theme-primary ${themePrimarySoft} flex h-9 w-9 items-center justify-center rounded-xl`}
                  >
                    <Layers size={17} />
                  </div>

                  <span className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                    Lantai
                  </span>
                </div>

                <p className="theme-text mt-3 text-xl font-bold">
                  {lantai.length}
                </p>

                <p className="theme-text-muted mt-0.5 text-[11px]">
                  Total lantai
                </p>
              </div>

              {/* KELAS */}

              <div
                className={`theme-card ${themeSmallShadow} rounded-2xl border ${themePrimaryBorder} p-4`}
              >
                <div className="flex items-center justify-between">

                  <div
                    className="theme-info flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]"
                  >
                    <GraduationCap size={17} />
                  </div>

                  <span className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                    Kelas
                  </span>
                </div>

                <p className="theme-text mt-3 text-xl font-bold">
                  {totalKelas}
                </p>

                <p className="theme-text-muted mt-0.5 text-[11px]">
                  Total kelas
                </p>
              </div>

              {/* STATUS */}

              <div
                className={`theme-card ${themeSmallShadow} rounded-2xl border ${themePrimaryBorder} p-4`}
              >
                <div className="flex items-center justify-between">

                  <div
                    className="theme-success flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]"
                  >
                    <CheckCircle2 size={17} />
                  </div>

                  <span className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                    Status
                  </span>
                </div>

                <p className="theme-success mt-3 text-base font-bold">
                  Aktif
                </p>

                <p className="theme-text-muted mt-1 text-[11px]">
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

                <section
                  className={`theme-card ${themeCardShadow} rounded-2xl border ${themePrimaryBorder}`}
                >
                  <div
                    className={`flex items-center justify-between border-b ${themePrimaryBorder} px-5 py-4`}
                  >
                    <div className="flex items-center gap-3">

                      <div
                        className={`theme-primary ${themePrimarySoft} flex h-9 w-9 items-center justify-center rounded-xl`}
                      >
                        <FileText size={16} />
                      </div>

                      <div>
                        <h2 className="theme-text text-sm font-bold">
                          Informasi Dasar
                        </h2>

                        <p className="theme-text-muted mt-0.5 text-[11px]">
                          Detail identitas gedung
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`grid grid-cols-1 gap-px ${themeSoftSurface} sm:grid-cols-2`}
                  >

                    <div className="theme-card p-5">
                      <div className="theme-text-muted flex items-center gap-2">
                        <Building size={15} />

                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                          Nama Gedung
                        </span>
                      </div>

                      <p className="theme-text mt-2 text-sm font-bold">
                        {data.nama || "-"}
                      </p>
                    </div>

                    <div className="theme-card p-5">
                      <div className="theme-text-muted flex items-center gap-2">
                        <Hash size={15} />

                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                          Kode Gedung
                        </span>
                      </div>

                      <p className="theme-text mt-2 font-mono text-sm font-bold">
                        {data.kode || "-"}
                      </p>
                    </div>

                    <div className="theme-card p-5">
                      <div className="theme-text-muted flex items-center gap-2">
                        <Info size={15} />

                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                          ID Gedung
                        </span>
                      </div>

                      <p className="theme-text-secondary mt-2 break-all font-mono text-xs font-semibold">
                        {data.id}
                      </p>
                    </div>

                    <div className="theme-card p-5">
                      <div className="theme-text-muted flex items-center gap-2">
                        <Layers size={15} />

                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                          Jumlah Lantai
                        </span>
                      </div>

                      <p className="theme-text mt-2 text-sm font-bold">
                        {lantai.length} Lantai
                      </p>
                    </div>

                  </div>
                </section>

                {/* =================================================
                    LANTAI
                ================================================= */}

                <section
                  className={`theme-card ${themeCardShadow} overflow-hidden rounded-2xl border ${themePrimaryBorder}`}
                >
                  <div
                    className={`flex items-center justify-between border-b ${themePrimaryBorder} px-5 py-4`}
                  >
                    <div className="flex items-center gap-3">

                      <div
                        className={`theme-primary ${themePrimarySoft} flex h-9 w-9 items-center justify-center rounded-xl`}
                      >
                        <Layers size={16} />
                      </div>

                      <div>
                        <h2 className="theme-text text-sm font-bold">
                          Struktur Lantai
                        </h2>

                        <p className="theme-text-muted mt-0.5 text-[11px]">
                          Lantai dan kelas dalam gedung
                        </p>
                      </div>
                    </div>

                    <span
                      className={`theme-text-secondary ${themeSoftSurface} rounded-lg px-2.5 py-1 text-[10px] font-bold`}
                    >
                      {lantai.length} Lantai
                    </span>
                  </div>

                  {lantai.length === 0 ? (

                    <div className="px-6 py-14 text-center">

                      <div
                        className={`theme-text-muted ${themeSoftSurface} mx-auto flex h-14 w-14 items-center justify-center rounded-2xl`}
                      >
                        <Layers size={24} />
                      </div>

                      <p className="theme-text mt-4 text-sm font-semibold">
                        Belum ada lantai
                      </p>

                      <p className="theme-text-muted mx-auto mt-1 max-w-sm text-xs leading-5">
                        Gedung ini belum memiliki
                        data lantai yang terdaftar.
                      </p>

                    </div>

                  ) : (

                    <div
                      className={`divide-y ${themePrimaryBorder}`}
                    >
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
                              className={`p-5 transition sm:p-6 ${themeNeutralHover}`}
                            >
                              <div className="flex items-center justify-between gap-4">

                                <div className="flex min-w-0 items-center gap-3">

                                  <div
                                    className={`theme-primary ${themePrimarySoft} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl`}
                                  >
                                    <Layers size={18} />
                                  </div>

                                  <div className="min-w-0">

                                    <h3 className="theme-text truncate text-sm font-bold">
                                      {item.nama ||
                                        `Lantai ${
                                          index +
                                          1
                                        }`}
                                    </h3>

                                    <p className="theme-text-muted mt-0.5 text-[11px]">
                                      Lantai{" "}
                                      {index +
                                        1}{" "}
                                      •{" "}
                                      {kelas.length}{" "}
                                      kelas
                                    </p>

                                  </div>
                                </div>

                                <div
                                  className={`theme-card theme-text-secondary hidden items-center gap-1.5 rounded-lg border ${themePrimaryBorder} px-2.5 py-1.5 text-[10px] font-semibold sm:flex`}
                                >
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
                                        className={`theme-card group flex items-center justify-between rounded-xl border ${themePrimaryBorder} p-3 transition-all ${themePrimaryBorderHover} ${themePrimaryHover}`}
                                      >

                                        <div className="flex min-w-0 items-center gap-3">

                                          <div
                                            className={`theme-text-muted ${themeSoftSurface} flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${themePrimarySoft}`}
                                          >
                                            <GraduationCap
                                              size={
                                                15
                                              }
                                            />
                                          </div>

                                          <div className="min-w-0">

                                            <p className="theme-text-secondary truncate text-xs font-bold">
                                              {kelasItem.nama ||
                                                "-"}
                                            </p>

                                            <p className="theme-text-muted mt-0.5 text-[10px]">
                                              Kelas
                                            </p>

                                          </div>

                                        </div>

                                        {kelasItem.tingkat && (
                                          <span
                                            className={`theme-text-muted ${themeSoftSurface} ml-2 shrink-0 rounded-md px-2 py-1 text-[9px] font-bold`}
                                          >
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

                                <div
                                  className={`theme-text-muted mt-4 flex items-center gap-2 rounded-xl border border-dashed ${themePrimaryBorder} ${themeSoftSurface} px-4 py-3`}
                                >
                                  <AlertCircle
                                    size={14}
                                  />

                                  <p className="text-[11px]">
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

                <section
                  className={`theme-card ${themeCardShadow} overflow-hidden rounded-2xl border ${themePrimaryBorder}`}
                >
                  <div
                    className={`flex items-center gap-3 border-b ${themePrimaryBorder} px-5 py-4`}
                  >
                    <div
                      className={`theme-primary ${themePrimarySoft} flex h-9 w-9 items-center justify-center rounded-xl`}
                    >
                      <ImageIcon size={16} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Foto Gedung
                      </h2>

                      <p className="theme-text-muted mt-0.5 text-[11px]">
                        Dokumentasi gedung
                      </p>
                    </div>
                  </div>

                  {fotoGedung ? (

                    <div className="p-3">
                      <div
                        className={`group relative overflow-hidden rounded-xl ${themeSoftSurface}`}
                      >

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
                          className={`hidden h-[220px] flex-col items-center justify-center ${themeSoftSurface} text-center`}
                        >
                          <div
                            className={`theme-card theme-text-muted ${themeSmallShadow} flex h-12 w-12 items-center justify-center rounded-xl`}
                          >
                            <ImageIcon size={22} />
                          </div>

                          <p className="theme-text-secondary mt-3 text-xs font-semibold">
                            Foto tidak dapat dimuat
                          </p>

                          <p className="theme-text-muted mt-1 px-4 text-[10px]">
                            URL foto tidak dapat diakses.
                          </p>
                        </div>

                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-text)_35%,transparent)] to-transparent"
                        />

                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="truncate text-xs font-semibold text-[var(--color-card)]">
                            {data.nama}
                          </p>
                        </div>

                      </div>
                    </div>

                  ) : (

                    <div className="p-4">

                      <div
                        className={`theme-text-muted flex h-[180px] flex-col items-center justify-center rounded-xl border border-dashed ${themePrimaryBorder} ${themeSoftSurface}`}
                      >

                        <div
                          className={`theme-card ${themeTextMutedFix} ${themeSmallShadow} flex h-12 w-12 items-center justify-center rounded-xl`}
                        >
                          <ImageIcon size={22} />
                        </div>

                        <p className="theme-text-secondary mt-3 text-xs font-semibold">
                          Belum ada foto
                        </p>

                        <p className="theme-text-muted mt-1 text-[10px]">
                          Foto gedung belum tersedia
                        </p>

                      </div>

                    </div>
                  )}
                </section>

                {/* =================================================
                    QUICK INFORMATION
                ================================================= */}

                <section
                  className={`theme-card ${themeCardShadow} rounded-2xl border ${themePrimaryBorder} p-5`}
                >
                  <div
                    className={`flex items-center gap-3 border-b ${themePrimaryBorder} pb-4`}
                  >
                    <div
                      className={`theme-text-secondary ${themeSoftSurface} flex h-9 w-9 items-center justify-center rounded-xl`}
                    >
                      <Info size={16} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Ringkasan
                      </h2>

                      <p className="theme-text-muted mt-0.5 text-[11px]">
                        Informasi singkat
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div
                          className="theme-success flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]"
                        >
                          <CheckCircle2 size={14} />
                        </div>

                        <span className="theme-text-secondary text-xs font-medium">
                          Status
                        </span>

                      </div>

                      <span
                        className="theme-success rounded-lg bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-2.5 py-1 text-[10px] font-bold"
                      >
                        Aktif
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div
                          className={`theme-primary ${themePrimarySoft} flex h-8 w-8 items-center justify-center rounded-lg`}
                        >
                          <Hash size={14} />
                        </div>

                        <span className="theme-text-secondary text-xs font-medium">
                          Kode
                        </span>

                      </div>

                      <span className="theme-text-secondary max-w-[150px] truncate font-mono text-xs font-bold">
                        {data.kode || "-"}
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div
                          className="theme-primary flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                        >
                          <Layers size={14} />
                        </div>

                        <span className="theme-text-secondary text-xs font-medium">
                          Lantai
                        </span>

                      </div>

                      <span className="theme-text-secondary text-xs font-bold">
                        {lantai.length}
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div
                          className="theme-info flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]"
                        >
                          <GraduationCap size={14} />
                        </div>

                        <span className="theme-text-secondary text-xs font-medium">
                          Kelas
                        </span>

                      </div>

                      <span className="theme-text-secondary text-xs font-bold">
                        {totalKelas}
                      </span>

                    </div>

                  </div>
                </section>

                {/* =================================================
                    TIMESTAMP
                ================================================= */}

                <section
                  className={`theme-card ${themeCardShadow} rounded-2xl border ${themePrimaryBorder} p-5`}
                >
                  <div
                    className={`flex items-center gap-3 border-b ${themePrimaryBorder} pb-4`}
                  >

                    <div
                      className={`theme-text-secondary ${themeSoftSurface} flex h-9 w-9 items-center justify-center rounded-xl`}
                    >
                      <Clock3 size={16} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Waktu
                      </h2>

                      <p className="theme-text-muted mt-0.5 text-[11px]">
                        Riwayat data
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 space-y-4">

                    <div>
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                        Dibuat
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs font-semibold leading-5">
                        {formatDate(
                          data.createdAt ??
                            data.dibuatPada
                        )}
                      </p>
                    </div>

                    <div
                      className={`border-t ${themePrimaryBorder} pt-4`}
                    >
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                        Terakhir Diperbarui
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs font-semibold leading-5">
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

                <section
                  className={`theme-card ${themeCardShadow} rounded-2xl border ${themePrimaryBorder} p-4`}
                >
                  <p className="theme-text-muted px-1 text-[10px] font-bold uppercase tracking-[0.08em]">
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
                      className={`theme-card theme-text-secondary flex h-10 items-center justify-center gap-2 rounded-xl border ${themePrimaryBorder} text-xs font-semibold transition ${themeWarningHover}`}
                    >
                      <Edit size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={`theme-card theme-text-secondary flex h-10 items-center justify-center gap-2 rounded-xl border ${themePrimaryBorder} text-xs font-semibold transition ${themeDangerHover} disabled:cursor-not-allowed disabled:opacity-50`}
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

            <div
              className={`theme-text-muted mt-5 border-t ${themePrimaryBorder} py-4 text-center`}
            >
              <p className="text-[10px] font-medium">
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
            background: var(--color-card) !important;
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