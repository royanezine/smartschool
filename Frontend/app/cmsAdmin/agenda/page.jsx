"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  LayoutGrid,
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
        wrapper:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70",
        dot: "bg-emerald-500",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        label: "Published",
      };
    }

    if (status === "scheduled") {
      return {
        wrapper:
          "bg-sky-50 text-sky-700 ring-1 ring-sky-200/70",
        dot: "bg-sky-500",
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "Terjadwal",
      };
    }

    return {
      wrapper:
        "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70",
      dot: "bg-amber-500",
      icon: <FileEdit className="h-3.5 w-3.5" />,
      label: "Draft",
    };
  };

  // =====================================================
  // CATEGORY STYLE
  // =====================================================

  const getCategoryStyle = (category) => {
    const styles = {
      Rapat:
        "bg-violet-50 text-violet-700 ring-violet-200/70",
      PPDB:
        "bg-sky-50 text-sky-700 ring-sky-200/70",
      Kegiatan:
        "bg-teal-50 text-teal-700 ring-teal-200/70",
    };

    return (
      styles[category] ||
      "bg-slate-100 text-slate-600 ring-slate-200"
    );
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
    <div className="flex min-h-screen w-full min-w-0 overflow-x-clip bg-slate-50">
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
          PENTING:
          - flex-1
          - min-w-0
          - TIDAK menggunakan w-0
          - tidak memotong sidebar
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ===== HEADER dengan CMS Admin ===== */}
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

        <main className="min-w-0 flex-1 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
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
                      className="text-slate-400 transition-colors hover:text-indigo-600"
                    >
                      Dashboard
                    </a>
                  </li>

                  <li className="shrink-0">
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </li>

                  <li className="shrink-0 font-semibold text-indigo-600">
                    Agenda
                  </li>
                </ol>
              </nav>

              {/* =================================================
                  HERO / HEADER
              ================================================== */}

              <section
                className="
                  relative
                  w-full
                  min-w-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200/70
                  bg-white
                  shadow-[0_10px_35px_rgba(15,23,42,0.05)]
                  sm:rounded-3xl
                "
              >
                {/* DECORATION */}

                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-100/50 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-100/40 blur-3xl" />

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
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-indigo-100
                        bg-gradient-to-br
                        from-indigo-50
                        to-violet-50
                        shadow-sm
                        sm:h-14
                        sm:w-14
                      "
                    >
                      <Calendar className="h-5 w-5 text-indigo-600 sm:h-6 sm:w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-indigo-50
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            text-indigo-700
                            ring-1
                            ring-indigo-100
                            sm:text-xs
                          "
                        >
                          <Sparkles className="h-3 w-3" />
                          CMS Website
                        </span>
                      </div>

                      <h1
                        className="
                          text-xl
                          font-bold
                          tracking-tight
                          text-slate-900
                          sm:text-2xl
                          md:text-3xl
                        "
                      >
                        Semua Agenda
                      </h1>

                      <p
                        className="
                          mt-1.5
                          max-w-2xl
                          text-xs
                          leading-relaxed
                          text-slate-500
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
                      inline-flex
                      w-full
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-indigo-600
                      to-violet-600
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-indigo-600/20
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:shadow-xl
                      hover:shadow-indigo-600/25
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
                {/* TOTAL */}

                <StatCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Total Agenda"
                  value={totalAgenda}
                  description="Seluruh agenda"
                  iconWrapper="bg-indigo-50 text-indigo-600"
                  accent="from-indigo-500 to-violet-500"
                />

                {/* TERJADWAL */}

                <StatCard
                  icon={<Clock className="h-5 w-5" />}
                  label="Terjadwal"
                  value={scheduledCount}
                  description="Menunggu diterbitkan"
                  iconWrapper="bg-sky-50 text-sky-600"
                  accent="from-sky-500 to-cyan-500"
                />

                {/* PUBLISHED */}

                <StatCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Published"
                  value={publishedCount}
                  description="Sudah diterbitkan"
                  iconWrapper="bg-emerald-50 text-emerald-600"
                  accent="from-emerald-500 to-teal-500"
                />

                {/* DRAFT */}

                <StatCard
                  icon={<FileEdit className="h-5 w-5" />}
                  label="Draft"
                  value={draftCount}
                  description="Belum diterbitkan"
                  iconWrapper="bg-amber-50 text-amber-600"
                  accent="from-amber-500 to-orange-500"
                />
              </section>

              {/* =================================================
                  SEARCH + FILTER
              ================================================== */}

              <section
                className="
                  w-full
                  min-w-0
                  rounded-2xl
                  border
                  border-slate-200/70
                  bg-white
                  p-3
                  shadow-[0_8px_25px_rgba(15,23,42,0.04)]
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
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari judul, kategori, atau lokasi agenda..."
                      className="
                        w-full
                        min-w-0
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50/70
                        py-3
                        pl-10
                        pr-10
                        text-sm
                        text-slate-800
                        outline-none
                        transition-all
                        placeholder:text-slate-400
                        focus:border-indigo-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-indigo-500/10
                      "
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-1
                          text-slate-400
                          transition-colors
                          hover:bg-slate-100
                          hover:text-slate-600
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
                      <Filter className="h-4 w-4 shrink-0 text-slate-400" />

                      <select
                        value={filterCategory}
                        onChange={(e) =>
                          setFilterCategory(e.target.value)
                        }
                        className="
                          min-w-0
                          flex-1
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50/70
                          px-3
                          py-3
                          text-sm
                          font-medium
                          text-slate-700
                          outline-none
                          transition-all
                          focus:border-indigo-400
                          focus:bg-white
                          focus:ring-4
                          focus:ring-indigo-500/10
                          sm:w-auto
                          sm:flex-none
                        "
                      >
                        <option value="Semua">
                          Semua Kategori
                        </option>
                        <option value="Rapat">Rapat</option>
                        <option value="PPDB">PPDB</option>
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
                          inline-flex
                          items-center
                          justify-center
                          gap-1.5
                          rounded-xl
                          px-3
                          py-2.5
                          text-xs
                          font-semibold
                          text-slate-500
                          transition-colors
                          hover:bg-slate-100
                          hover:text-slate-700
                        "
                      >
                        <X className="h-3.5 w-3.5" />
                        Reset
                      </button>
                    )}

                    <span
                      className="
                        whitespace-nowrap
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1.5
                        text-center
                        text-[11px]
                        font-semibold
                        text-slate-500
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
                  w-full
                  min-w-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200/70
                  bg-white
                  shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                  sm:rounded-3xl
                "
              >
                {/* TABLE HEADER */}

                <div
                  className="
                    flex
                    min-w-0
                    flex-col
                    gap-2
                    border-b
                    border-slate-100
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
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                      Daftar Agenda
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Kelola agenda sekolah yang tersedia.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-[11px] font-medium text-slate-500">
                      Sistem aktif
                    </span>
                  </div>
                </div>

                {/* =================================================
                    TABLE WRAPPER

                    Hanya tabel yang boleh horizontal scroll.
                    Sidebar TIDAK ikut terpotong.
                ================================================== */}

                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[850px] table-auto">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-4 py-4 text-left sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                            Agenda
                          </span>
                        </th>

                        <th className="px-4 py-4 text-left sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                            Tanggal
                          </span>
                        </th>

                        <th className="px-4 py-4 text-left sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                            Lokasi
                          </span>
                        </th>

                        <th className="px-4 py-4 text-left sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                            Status
                          </span>
                        </th>

                        <th className="px-4 py-4 text-right sm:px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                            Aksi
                          </span>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
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
                                group
                                transition-colors
                                duration-200
                                hover:bg-indigo-50/30
                              "
                            >
                              {/* AGENDA */}

                              <td className="px-4 py-4 sm:px-6 sm:py-5">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div
                                    className="
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-xl
                                      bg-indigo-50
                                      text-indigo-600
                                      ring-1
                                      ring-indigo-100
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
                                        max-w-[300px]
                                        break-words
                                        text-sm
                                        font-bold
                                        leading-snug
                                        text-slate-800
                                        transition-colors
                                        group-hover:text-indigo-700
                                      "
                                    >
                                      {item.title}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <span
                                        className={`
                                          inline-flex
                                          items-center
                                          rounded-full
                                          px-2
                                          py-1
                                          text-[10px]
                                          font-semibold
                                          ring-1
                                          ${categoryStyle}
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
                                  <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 sm:flex">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  </div>

                                  <div>
                                    <p className="whitespace-nowrap text-xs font-semibold text-slate-700 sm:text-sm">
                                      {item.date.split(" ")[0]}
                                    </p>

                                    <p className="mt-0.5 whitespace-nowrap text-[11px] text-slate-400">
                                      {item.date.split(" ")[1]}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* LOKASI */}

                              <td className="px-4 py-4 sm:px-6 sm:py-5">
                                <div className="flex max-w-[190px] items-center gap-2">
                                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                                  <span className="truncate text-sm font-medium text-slate-600">
                                    {item.location}
                                  </span>
                                </div>
                              </td>

                              {/* STATUS */}

                              <td className="px-4 py-4 sm:px-6 sm:py-5">
                                <span
                                  className={`
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
                                    ${status.wrapper}
                                  `}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
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
                                      rounded-xl
                                      p-2
                                      text-slate-400
                                      transition-all
                                      hover:bg-indigo-50
                                      hover:text-indigo-600
                                    "
                                    title="Lihat Detail"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    className="
                                      rounded-xl
                                      p-2
                                      text-slate-400
                                      transition-all
                                      hover:bg-sky-50
                                      hover:text-sky-600
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
                                      rounded-xl
                                      p-2
                                      text-slate-400
                                      transition-all
                                      hover:bg-rose-50
                                      hover:text-rose-600
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
                                  mb-4
                                  flex
                                  h-14
                                  w-14
                                  items-center
                                  justify-center
                                  rounded-2xl
                                  bg-slate-100
                                  text-slate-400
                                "
                              >
                                <Search className="h-6 w-6" />
                              </div>

                              <h3 className="text-sm font-bold text-slate-800">
                                Agenda tidak ditemukan
                              </h3>

                              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                Coba ubah kata pencarian atau
                                filter kategori.
                              </p>

                              <button
                                type="button"
                                onClick={clearFilter}
                                className="
                                  mt-4
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  bg-slate-100
                                  px-4
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-slate-600
                                  transition-colors
                                  hover:bg-slate-200
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
                    flex
                    min-w-0
                    flex-col
                    gap-2
                    border-t
                    border-slate-100
                    bg-slate-50/50
                    px-4
                    py-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-6
                  "
                >
                  <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                    Menampilkan{" "}
                    <span className="font-bold text-slate-600">
                      {filteredData.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-bold text-slate-600">
                      {agendas.length}
                    </span>{" "}
                    agenda
                  </p>

                  <span
                    className="
                      inline-flex
                      w-fit
                      items-center
                      gap-1.5
                      rounded-full
                      bg-white
                      px-3
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-slate-400
                      ring-1
                      ring-slate-200
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Data simulasi
                  </span>
                </div>
              </section>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <footer className="w-full border-t border-slate-200/70 pt-5 pb-4 text-center">
                <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
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
  iconWrapper,
  accent,
}) {
  return (
    <div
      className="
        group
        relative
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/70
        bg-white
        p-4
        shadow-[0_8px_25px_rgba(15,23,42,0.04)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
        sm:p-5
      "
    >
      {/* TOP ACCENT */}

      <div
        className={`
          absolute
          left-0
          right-0
          top-0
          h-0.5
          bg-gradient-to-r
          ${accent}
        `}
      />

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 truncate text-[10px] font-medium text-slate-400 sm:text-xs">
            {description}
          </p>
        </div>

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${iconWrapper}
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