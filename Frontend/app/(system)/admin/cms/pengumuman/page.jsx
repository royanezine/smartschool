// app/cmsAdmin/pengumuman/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  Clock,
  CheckCircle2,
  FileText,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function PengumumanPage() {
  const router = useRouter();

  const [active, setActive] = useState("pengumuman");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Libur Semester Ganjil 2026",
      status: "published",
      category: "Akademik",
      date: "2026-01-20",
    },
    {
      id: 2,
      title: "Pendaftaran Siswa Baru Dibuka",
      status: "scheduled",
      category: "PPDB",
      date: "2026-02-01",
    },
    {
      id: 3,
      title: "Pengumuman Hasil UTS",
      status: "draft",
      category: "Akademik",
      date: "2026-01-15",
    },
    {
      id: 4,
      title: "Upacara Hari Pahlawan",
      status: "published",
      category: "Kegiatan",
      date: "2025-11-10",
    },
  ]);

  const stats = {
    total: announcements.length,
    published: announcements.filter(
      (item) => item.status === "published"
    ).length,
    scheduled: announcements.filter(
      (item) => item.status === "scheduled"
    ).length,
    draft: announcements.filter(
      (item) => item.status === "draft"
    ).length,
  };

  const filteredData = announcements.filter((item) => {
    const keyword = search.toLowerCase().trim();
    const matchSearch = item.title.toLowerCase().includes(keyword);
    const matchStatus =
      filterStatus === "Semua" || item.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus pengumuman ini?")) return;

    setAnnouncements((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "published":
        return {
          wrapper: "theme-success border",
          dot: "bg-[var(--color-success)]",
          label: "Published",
        };

      case "scheduled":
        return {
          wrapper: "theme-info border",
          dot: "bg-[var(--color-info)]",
          label: "Terjadwal",
        };

      default:
        return {
          wrapper: "theme-warning border",
          dot: "bg-[var(--color-warning)]",
          label: "Draft",
        };
    }
  };

  return (
    <div className="flex min-h-screen w-full theme-page">
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* HEADER */}
        <Header
          title="Pengumuman"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 theme-page">
          <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6">
            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs sm:text-sm theme-text-muted">
              <a
                href="/cmsAdmin"
                className="hover:text-[var(--color-primary)] transition"
              >
                Dashboard
              </a>

              <ChevronRight className="w-3.5 h-3.5 theme-text-placeholder" />

              <span className="text-[var(--color-primary)] font-semibold">
                Pengumuman
              </span>
            </nav>

            {/* HEADER CARD */}
            <div className="theme-card rounded-2xl border theme-border shadow-sm p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="shrink-0 p-3 rounded-2xl theme-primary shadow-lg">
                    <Megaphone className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full theme-info border text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3 h-3" />
                      CMS Website
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold theme-text">
                      Kelola Pengumuman
                    </h1>

                    <p className="text-sm theme-text-muted mt-1">
                      Kelola semua pengumuman untuk siswa dan guru
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push("/cmsAdmin/pengumuman/tambah")
                  }
                  className="
                    inline-flex items-center justify-center gap-2
                    px-5 py-2.5
                    theme-primary
                    rounded-xl
                    hover:shadow-lg
                    transition-all
                    shadow-md
                    font-semibold
                    text-sm
                    whitespace-nowrap
                  "
                >
                  <Plus className="w-4 h-4" />
                  Buat Pengumuman
                </button>
              </div>

              {/* STATISTICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t theme-border">
                {/* TOTAL */}
                <div
                  className="
                    theme-card-soft
                    rounded-xl
                    border theme-border
                    p-4
                    hover:shadow-md
                    transition-all
                    hover:-translate-y-0.5
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg theme-info">
                      <LayoutGrid className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                        Total
                      </p>

                      <p className="text-2xl font-bold theme-text">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PUBLISHED */}
                <div
                  className="
                    theme-card-soft
                    rounded-xl
                    border theme-border
                    p-4
                    hover:shadow-md
                    transition-all
                    hover:-translate-y-0.5
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg theme-success">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                        Published
                      </p>

                      <p className="text-2xl font-bold text-[var(--color-success)]">
                        {stats.published}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SCHEDULED */}
                <div
                  className="
                    theme-card-soft
                    rounded-xl
                    border theme-border
                    p-4
                    hover:shadow-md
                    transition-all
                    hover:-translate-y-0.5
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg theme-info">
                      <Clock className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                        Terjadwal
                      </p>

                      <p className="text-2xl font-bold text-[var(--color-info)]">
                        {stats.scheduled}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DRAFT */}
                <div
                  className="
                    theme-card-soft
                    rounded-xl
                    border theme-border
                    p-4
                    hover:shadow-md
                    transition-all
                    hover:-translate-y-0.5
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg theme-warning">
                      <FileText className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">
                        Draft
                      </p>

                      <p className="text-2xl font-bold text-[var(--color-warning)]">
                        {stats.draft}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTER */}
            <div
              className="
                theme-card
                rounded-2xl
                border theme-border
                shadow-sm
                p-4
                flex flex-col sm:flex-row
                gap-3
                items-center
              "
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul pengumuman..."
                  className="
                    theme-input
                    w-full
                    pl-9 pr-4 py-2.5
                    rounded-xl
                    border
                    text-sm
                    outline-none
                    focus:border-[var(--color-primary)]
                    transition
                  "
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 theme-text-muted shrink-0" />

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value)
                  }
                  className="
                    theme-input
                    flex-1 sm:flex-none
                    px-3 py-2.5
                    rounded-xl
                    border
                    text-sm
                    outline-none
                    focus:border-[var(--color-primary)]
                    cursor-pointer
                  "
                >
                  <option value="Semua">Semua Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Terjadwal</option>
                </select>

                <span className="hidden lg:inline-flex text-xs theme-text-muted px-2 whitespace-nowrap">
                  {filteredData.length} data
                </span>
              </div>
            </div>

            {/* TABLE */}
            <div className="theme-card rounded-2xl border theme-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse">
                  <thead className="theme-table-header border-b theme-border">
                    <tr>
                      <th className="px-4 py-3.5 text-left min-w-[230px]">
                        <span className="text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                          Judul
                        </span>
                      </th>

                      <th className="px-4 py-3.5 text-left min-w-[120px]">
                        <span className="text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                          Kategori
                        </span>
                      </th>

                      <th className="px-4 py-3.5 text-left min-w-[120px]">
                        <span className="text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                          Status
                        </span>
                      </th>

                      <th className="px-4 py-3.5 text-left min-w-[120px]">
                        <span className="text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                          Tanggal
                        </span>
                      </th>

                      <th className="px-4 py-3.5 text-right min-w-[120px]">
                        <span className="text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                          Aksi
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => {
                        const statusStyle = getStatusStyle(item.status);

                        return (
                          <tr
                            key={item.id}
                            className="
                              group
                              border-b theme-border-soft
                              theme-table-hover
                              transition-colors duration-200
                            "
                          >
                            {/* JUDUL */}
                            <td className="px-4 py-4 align-middle">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="
                                    shrink-0
                                    w-9 h-9
                                    rounded-xl
                                    theme-info
                                    border
                                    flex items-center justify-center
                                    text-sm font-bold
                                    shadow-sm
                                  "
                                >
                                  {item.title.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className="
                                      text-sm font-semibold
                                      theme-text
                                      group-hover:text-[var(--color-primary)]
                                      transition-colors
                                      truncate
                                      max-w-[280px]
                                      sm:max-w-[360px]
                                      lg:max-w-[500px]
                                      xl:max-w-[700px]
                                    "
                                  >
                                    {item.title}
                                  </p>

                                  <div className="flex items-center gap-2 mt-1.5 md:hidden flex-wrap">
                                    <span
                                      className={`
                                        inline-flex items-center gap-1
                                        text-[10px]
                                        px-2 py-1
                                        rounded-full
                                        font-medium
                                        ${statusStyle.wrapper}
                                      `}
                                    >
                                      <span
                                        className={`
                                          w-1.5 h-1.5
                                          rounded-full
                                          ${statusStyle.dot}
                                        `}
                                      />

                                      {statusStyle.label}
                                    </span>

                                    <span className="text-[10px] theme-text-muted">
                                      {item.date}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* KATEGORI */}
                            <td className="px-4 py-4 text-sm theme-text-secondary whitespace-nowrap">
                              {item.category}
                            </td>

                            {/* STATUS */}
                            <td className="px-4 py-4">
                              <span
                                className={`
                                  hidden md:inline-flex
                                  items-center gap-1.5
                                  px-2.5 py-1
                                  rounded-full
                                  text-[10px] sm:text-xs
                                  font-medium
                                  whitespace-nowrap
                                  ${statusStyle.wrapper}
                                `}
                              >
                                <span
                                  className={`
                                    w-1.5 h-1.5
                                    rounded-full
                                    ${statusStyle.dot}
                                  `}
                                />

                                {statusStyle.label}
                              </span>
                            </td>

                            {/* TANGGAL */}
                            <td className="px-4 py-4 text-xs theme-text-secondary whitespace-nowrap">
                              {item.date}
                            </td>

                            {/* AKSI */}
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                                <button
                                  className="
                                    p-1.5 sm:p-2
                                    rounded-lg
                                    theme-text-muted
                                    hover:text-[var(--color-primary)]
                                    hover:bg-[var(--color-sidebar-active)]
                                    transition-colors
                                  "
                                  title="Detail"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  className="
                                    p-1.5 sm:p-2
                                    rounded-lg
                                    theme-text-muted
                                    hover:text-[var(--color-primary)]
                                    hover:bg-[var(--color-sidebar-active)]
                                    transition-colors
                                  "
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(item.id)
                                  }
                                  className="
                                    p-1.5 sm:p-2
                                    rounded-lg
                                    theme-text-muted
                                    hover:text-[var(--color-danger)]
                                    hover:bg-[var(--color-danger-background)]
                                    transition-colors
                                  "
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                          className="px-6 py-12 text-center"
                        >
                          <Megaphone className="w-12 h-12 theme-text-placeholder mx-auto mb-3" />

                          <p className="text-sm font-medium theme-text-secondary">
                            Tidak ada pengumuman ditemukan
                          </p>

                          <p className="text-xs theme-text-muted mt-1">
                            Coba ubah kata kunci atau filter status
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}
              <div
                className="
                  px-4 py-3
                  border-t theme-border
                  theme-table-header
                  flex items-center justify-between
                  gap-3
                "
              >
                <span className="text-xs theme-text-muted truncate">
                  Menampilkan {filteredData.length} pengumuman
                </span>

                <span
                  className="
                    shrink-0
                    text-[10px]
                    font-medium
                    theme-card
                    theme-text-muted
                    px-3 py-1
                    rounded-full
                    border theme-border
                    flex items-center gap-1.5
                  "
                >
                  <TrendingUp className="w-3 h-3 text-[var(--color-primary)]" />
                  Data simulasi
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <footer className="pt-4 border-t theme-border-soft text-center text-xs theme-text-muted">
              © 2026 SmartSchool CMS • Pengumuman
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}