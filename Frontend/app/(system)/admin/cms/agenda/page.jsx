"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Clock,
  CheckCircle2,
  FileEdit,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";

export default function AgendaPage() {
  const router = useRouter();

  const [active, setActive] = useState("agenda");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");

  // =====================================================
  // DUMMY DATA
  // =====================================================

  const [agendas, setAgendas] = useState([
    {
      id: 1,
      title: "Rapat Guru & Karyawan",
      category: "Rapat",
      location: "Aula Utama",
      date: "2026-01-25 09:00",
      status: "published",
    },
    {
      id: 2,
      title: "Pendaftaran Siswa Baru 2026",
      category: "PPDB",
      location: "Gedung A",
      date: "2026-02-01 08:00",
      status: "scheduled",
    },
    {
      id: 3,
      title: "Upacara Hari Pahlawan",
      category: "Kegiatan",
      location: "Lapangan Sekolah",
      date: "2025-11-10 07:00",
      status: "published",
    },
    {
      id: 4,
      title: "Rapat Evaluasi UTS",
      category: "Rapat",
      location: "Ruangan Guru",
      date: "2026-01-15 14:00",
      status: "draft",
    },
  ]);

  // =====================================================
  // FILTER DATA
  // =====================================================

  const filteredData = useMemo(() => {
    return agendas.filter((item) => {
      const keyword = search.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword);

      const matchCategory =
        filterCategory === "Semua" ||
        item.category === filterCategory;

      return matchSearch && matchCategory;
    });
  }, [agendas, search, filterCategory]);

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = (id) => {
    const target = agendas.find((item) => item.id === id);

    if (!target) return;

    if (
      confirm(
        `Yakin ingin menghapus agenda "${target.title}"?\n\nTindakan ini tidak dapat dibatalkan.`
      )
    ) {
      setAgendas((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    if (status === "published") {
      return {
        wrapper: "theme-success",
        dot: "var(--color-success)",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        label: "Published",
      };
    }

    if (status === "scheduled") {
      return {
        wrapper: "theme-info",
        dot: "var(--color-info)",
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "Terjadwal",
      };
    }

    return {
      wrapper: "theme-warning",
      dot: "var(--color-warning)",
      icon: <FileEdit className="h-3.5 w-3.5" />,
      label: "Draft",
    };
  };

  // =====================================================
  // CATEGORY STYLE
  // =====================================================

  const getCategoryStyle = (category) => {
    if (category === "Rapat") {
      return "theme-info";
    }

    if (category === "PPDB") {
      return "theme-info";
    }

    if (category === "Kegiatan") {
      return "theme-success";
    }

    return "theme-card-soft theme-text-secondary";
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalAgenda = agendas.length;

  const publishedCount = agendas.filter(
    (item) => item.status === "published"
  ).length;

  const scheduledCount = agendas.filter(
    (item) => item.status === "scheduled"
  ).length;

  const draftCount = agendas.filter(
    (item) => item.status === "draft"
  ).length;

  // =====================================================
  // CLEAR FILTER
  // =====================================================

  const clearFilter = () => {
    setSearch("");
    setFilterCategory("Semua");
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="theme-page flex min-h-screen w-full min-w-0 overflow-x-clip">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="shrink-0">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <Header
          title="Agenda"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="theme-page min-w-0 flex-1">
          <div
            className="
              mx-auto
              w-full
              min-w-0
              max-w-[1800px]
              px-3
              py-5
              sm:px-5
              sm:py-6
              md:px-7
              md:py-7
              lg:px-8
              lg:py-8
              xl:px-10
              2xl:px-12
            "
          >
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              {/* =================================================
                  BREADCRUMB
              ================================================== */}

              <nav
                aria-label="Breadcrumb"
                className="w-full min-w-0"
              >
                <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-medium sm:gap-2 sm:text-sm">
                  <li className="shrink-0">
                    <a
                      href="/cmsAdmin"
                      className="theme-text-muted transition-opacity hover:opacity-80"
                    >
                      Dashboard
                    </a>
                  </li>

                  <li className="shrink-0">
                    <ChevronRight className="theme-text-placeholder h-3.5 w-3.5" />
                  </li>

                  <li
                    className="theme-text"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Agenda
                  </li>
                </ol>
              </nav>

              {/* =================================================
                  HERO / HEADER
              ================================================== */}

              <section
                className="
                  theme-card
                  theme-border
                  relative
                  w-full
                  min-w-0
                  overflow-hidden
                  rounded-2xl
                  border
                  shadow-sm
                  sm:rounded-3xl
                "
              >
                {/* DECORATION */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-52
                    w-52
                    rounded-full
                    opacity-20
                    blur-3xl
                  "
                  style={{
                    backgroundColor: "var(--color-primary)",
                  }}
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-24
                    left-1/3
                    h-48
                    w-48
                    rounded-full
                    opacity-10
                    blur-3xl
                  "
                  style={{
                    backgroundColor: "var(--color-info)",
                  }}
                />

                <div
                  className="
                    relative
                    flex
                    min-w-0
                    flex-col
                    gap-5
                    p-4
                    sm:p-5
                    md:p-6
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    lg:p-7
                    xl:p-8
                  "
                >
                  {/* LEFT */}

                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div
                      className="
                        theme-info
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        sm:h-14
                        sm:w-14
                      "
                    >
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className="
                            theme-info
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            sm:text-xs
                          "
                        >
                          <Sparkles className="h-3 w-3" />
                          CMS Website
                        </span>
                      </div>

                      <h1
                        className="
                          theme-text
                          text-xl
                          font-bold
                          tracking-tight
                          sm:text-2xl
                          md:text-3xl
                        "
                      >
                        Semua Agenda
                      </h1>

                      <p
                        className="
                          theme-text-secondary
                          mt-1.5
                          max-w-2xl
                          text-xs
                          leading-relaxed
                          sm:text-sm
                        "
                      >
                        Kelola jadwal kegiatan, rapat, acara,
                        dan aktivitas sekolah dalam satu tempat.
                      </p>
                    </div>
                  </div>

                  {/* BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/cmsAdmin/agenda/tambah")
                    }
                    className="
                      theme-primary
                      inline-flex
                      w-full
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      shadow-lg
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:shadow-xl
                      active:translate-y-0
                      sm:w-auto
                    "
                  >
                    <Plus className="h-4 w-4" />
                    Buat Agenda
                  </button>
                </div>
              </section>

              {/* =================================================
                  STATISTICS
              ================================================== */}

              <section
                className="
                  grid
                  w-full
                  min-w-0
                  grid-cols-1
                  gap-3
                  min-[420px]:grid-cols-2
                  lg:grid-cols-4
                  sm:gap-4
                "
              >
                <StatCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Total Agenda"
                  value={totalAgenda}
                  description="Seluruh agenda"
                  tone="primary"
                />

                <StatCard
                  icon={<Clock className="h-5 w-5" />}
                  label="Terjadwal"
                  value={scheduledCount}
                  description="Menunggu diterbitkan"
                  tone="info"
                />

                <StatCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Published"
                  value={publishedCount}
                  description="Sudah diterbitkan"
                  tone="success"
                />

                <StatCard
                  icon={<FileEdit className="h-5 w-5" />}
                  label="Draft"
                  value={draftCount}
                  description="Belum diterbitkan"
                  tone="warning"
                />
              </section>

              {/* =================================================
                  SEARCH + FILTER
              ================================================== */}

              <section
                className="
                  theme-card
                  theme-border
                  w-full
                  min-w-0
                  rounded-2xl
                  border
                  p-3
                  shadow-sm
                  sm:p-4
                  lg:p-5
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    flex-col
                    gap-3
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
                >
                  {/* SEARCH */}

                  <div className="relative min-w-0 flex-1">
                    <Search
                      className="
                        theme-text-placeholder
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                      "
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari judul, kategori, atau lokasi agenda..."
                      className="
                        theme-input
                        w-full
                        min-w-0
                        rounded-xl
                        border
                        py-3
                        pl-10
                        pr-10
                        text-sm
                        outline-none
                        transition-all
                        focus:border-[var(--color-primary)]
                      "
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="
                          theme-text-muted
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-1
                          transition-opacity
                          hover:opacity-70
                        "
                        title="Hapus pencarian"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* FILTER */}

                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <Filter className="theme-text-muted h-4 w-4 shrink-0" />

                      <select
                        value={filterCategory}
                        onChange={(e) =>
                          setFilterCategory(e.target.value)
                        }
                        className="
                          theme-input
                          min-w-0
                          flex-1
                          cursor-pointer
                          rounded-xl
                          border
                          px-3
                          py-3
                          text-sm
                          font-medium
                          outline-none
                          transition-all
                          focus:border-[var(--color-primary)]
                          sm:w-auto
                          sm:flex-none
                        "
                      >
                        <option value="Semua">
                          Semua Kategori
                        </option>

                        <option value="Rapat">
                          Rapat
                        </option>

                        <option value="PPDB">
                          PPDB
                        </option>

                        <option value="Kegiatan">
                          Kegiatan
                        </option>
                      </select>
                    </div>

                    {(search || filterCategory !== "Semua") && (
                      <button
                        type="button"
                        onClick={clearFilter}
                        className="
                          theme-text-muted
                          inline-flex
                          items-center
                          justify-center
                          gap-1.5
                          rounded-xl
                          px-3
                          py-2.5
                          text-xs
                          font-semibold
                          transition-opacity
                          hover:opacity-70
                        "
                      >
                        <X className="h-3.5 w-3.5" />
                        Reset
                      </button>
                    )}

                    <span
                      className="
                        theme-card-soft
                        theme-text-secondary
                        whitespace-nowrap
                        rounded-full
                        px-3
                        py-1.5
                        text-center
                        text-[11px]
                        font-semibold
                      "
                    >
                      {filteredData.length} data
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================================
                  TABLE
              ================================================== */}

              <section
                className="
                  theme-card
                  theme-border
                  w-full
                  min-w-0
                  overflow-hidden
                  rounded-2xl
                  border
                  shadow-sm
                  sm:rounded-3xl
                "
              >
                {/* TABLE HEADER */}

                <div
                  className="
                    theme-border
                    flex
                    min-w-0
                    flex-col
                    gap-2
                    border-b
                    px-4
                    py-4
                    sm:px-5
                    md:flex-row
                    md:items-center
                    md:justify-between
                    md:px-6
                  "
                >
                  <div className="min-w-0">
                    <h2 className="theme-text text-sm font-bold sm:text-base">
                      Daftar Agenda
                    </h2>

                    <p className="theme-text-muted mt-0.5 text-xs">
                      Kelola agenda sekolah yang tersedia.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          "var(--color-success)",
                      }}
                    />

                    <span className="theme-text-muted text-[11px] font-medium">
                      Sistem aktif
                    </span>
                  </div>
                </div>

                {/* TABLE WRAPPER */}

                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[850px] table-auto">
                    <thead>
                      <tr className="theme-table-header theme-border border-b">
                        <th className="px-4 py-4 text-left sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                            Agenda
                          </span>
                        </th>

                        <th className="px-4 py-4 text-left sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                            Tanggal
                          </span>
                        </th>

                        <th className="px-4 py-4 text-left sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                            Lokasi
                          </span>
                        </th>

                        <th className="px-4 py-4 text-left sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                            Status
                          </span>
                        </th>

                        <th className="px-4 py-4 text-right sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">
                            Aksi
                          </span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item) => {
                          const status = getStatusStyle(
                            item.status
                          );

                          const categoryStyle =
                            getCategoryStyle(item.category);

                          return (
                            <tr
                              key={item.id}
                              className="
                                theme-border-soft
                                theme-table-hover
                                group
                                border-b
                                transition-colors
                                duration-200
                              "
                            >
                              {/* AGENDA */}

                              <td className="px-4 py-4 sm:px-6 sm:py-5">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div
                                    className="
                                      theme-info
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-xl
                                      transition-transform
                                      duration-200
                                      group-hover:scale-105
                                    "
                                  >
                                    <Calendar className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0">
                                    <p
                                      className="
                                        theme-text
                                        max-w-[300px]
                                        break-words
                                        text-sm
                                        font-bold
                                        leading-snug
                                        transition-opacity
                                        group-hover:opacity-80
                                      "
                                    >
                                      {item.title}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <span
                                        className={`
                                          ${categoryStyle}
                                          inline-flex
                                          items-center
                                          rounded-full
                                          px-2
                                          py-1
                                          text-[10px]
                                          font-semibold
                                        `}
                                      >
                                        {item.category}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* TANGGAL */}

                              <td className="px-4 py-4 sm:px-6 sm:py-5">
                                <div className="flex items-center gap-2">
                                  <div className="theme-card-soft theme-text-muted hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:flex">
                                    <Clock className="h-3.5 w-3.5" />
                                  </div>

                                  <div>
                                    <p className="theme-text-secondary whitespace-nowrap text-xs font-semibold sm:text-sm">
                                      {item.date.split(" ")[0]}
                                    </p>

                                    <p className="theme-text-muted mt-0.5 whitespace-nowrap text-[11px]">
                                      {item.date.split(" ")[1]}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* LOKASI */}

                              <td className="px-4 py-4 sm:px-6 sm:py-5">
                                <div className="flex max-w-[190px] items-center gap-2">
                                  <MapPin className="theme-text-muted h-4 w-4 shrink-0" />

                                  <span className="theme-text-secondary truncate text-sm font-medium">
                                    {item.location}
                                  </span>
                                </div>
                              </td>

                              {/* STATUS */}

                              <td className="px-4 py-4 sm:px-6 sm:py-5">
                                <span
                                  className={`
                                    ${status.wrapper}
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    whitespace-nowrap
                                    rounded-full
                                    px-2.5
                                    py-1.5
                                    text-[10px]
                                    font-semibold
                                    sm:text-xs
                                  `}
                                >
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{
                                      backgroundColor:
                                        status.dot,
                                    }}
                                  />

                                  {status.icon}

                                  {status.label}
                                </span>
                              </td>

                              {/* AKSI */}

                              <td className="px-4 py-4 sm:px-6 sm:py-5">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    className="
                                      theme-text-muted
                                      rounded-xl
                                      p-2
                                      transition-all
                                      hover:opacity-70
                                    "
                                    title="Lihat Detail"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    className="
                                      theme-text-muted
                                      rounded-xl
                                      p-2
                                      transition-all
                                      hover:opacity-70
                                    "
                                    title="Edit Agenda"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(item.id)
                                    }
                                    className="
                                      theme-text-muted
                                      rounded-xl
                                      p-2
                                      transition-all
                                      hover:opacity-70
                                    "
                                    title="Hapus Agenda"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-16 text-center"
                          >
                            <div className="mx-auto flex max-w-sm flex-col items-center">
                              <div
                                className="
                                  theme-card-soft
                                  theme-text-muted
                                  mb-4
                                  flex
                                  h-14
                                  w-14
                                  items-center
                                  justify-center
                                  rounded-2xl
                                "
                              >
                                <Search className="h-6 w-6" />
                              </div>

                              <h3 className="theme-text text-sm font-bold">
                                Agenda tidak ditemukan
                              </h3>

                              <p className="theme-text-muted mt-1 text-xs leading-relaxed">
                                Coba ubah kata pencarian atau
                                filter kategori.
                              </p>

                              <button
                                type="button"
                                onClick={clearFilter}
                                className="
                                  theme-card-soft
                                  theme-text-secondary
                                  mt-4
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  px-4
                                  py-2
                                  text-xs
                                  font-semibold
                                  transition-opacity
                                  hover:opacity-80
                                "
                              >
                                <X className="h-3.5 w-3.5" />
                                Reset Filter
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TABLE FOOTER */}

                <div
                  className="
                    theme-card-soft
                    theme-border
                    flex
                    min-w-0
                    flex-col
                    gap-2
                    border-t
                    px-4
                    py-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-6
                  "
                >
                  <p className="theme-text-muted text-[10px] font-medium sm:text-xs">
                    Menampilkan{" "}
                    <span className="theme-text-secondary font-bold">
                      {filteredData.length}
                    </span>{" "}
                    dari{" "}
                    <span className="theme-text-secondary font-bold">
                      {agendas.length}
                    </span>{" "}
                    agenda
                  </p>

                  <span
                    className="
                      theme-card
                      theme-border
                      theme-text-muted
                      inline-flex
                      w-fit
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-[10px]
                      font-semibold
                    "
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          "var(--color-success)",
                      }}
                    />

                    Data simulasi
                  </span>
                </div>
              </section>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <footer className="theme-border w-full border-t pt-5 pb-4 text-center">
                <p className="theme-text-muted text-[10px] font-medium sm:text-xs">
                  © 2026 SmartSchool CMS • Agenda Management
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  label,
  value,
  description,
  tone = "primary",
}) {
  const toneClass = {
    primary: "theme-info",
    info: "theme-info",
    success: "theme-success",
    warning: "theme-warning",
  };

  const selectedTone =
    toneClass[tone] || toneClass.primary;

  return (
    <div
      className="
        theme-card
        theme-border
        group
        relative
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
        sm:p-5
      "
    >
      {/* TOP ACCENT */}

      <div
        className="absolute left-0 right-0 top-0 h-0.5"
        style={{
          backgroundColor:
            tone === "success"
              ? "var(--color-success)"
              : tone === "warning"
                ? "var(--color-warning)"
                : tone === "info"
                  ? "var(--color-info)"
                  : "var(--color-primary)",
        }}
      />

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted truncate text-[10px] font-bold uppercase tracking-wider sm:text-xs">
            {label}
          </p>

          <p className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </p>

          <p className="theme-text-muted mt-1 truncate text-[10px] font-medium sm:text-xs">
            {description}
          </p>
        </div>

        <div
          className={`
            ${selectedTone}
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            transition-transform
            duration-300
            group-hover:scale-105
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}