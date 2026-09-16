"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Clock,
  Calendar,
  Pencil,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Plus,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

export default function TerjadwalPage() {
  const router = useRouter();

  const [active, setActive] = useState("pengumuman");
  const [collapsed, setCollapsed] = useState(false);

  const [scheduled, setScheduled] = useState([
    {
      id: 2,
      title: "Pendaftaran Siswa Baru Dibuka",
      category: "PPDB",
      date: "2026-02-01 08:00",
      status: "akan datang",
    },
    {
      id: 5,
      title: "Pengumuman Kelulusan",
      category: "Akademik",
      date: "2026-03-15 09:00",
      status: "akan datang",
    },
    {
      id: 6,
      title: "Sosialisasi MPLS",
      category: "Kegiatan",
      date: "2025-12-20 10:00",
      status: "akan datang",
    },
  ]);

  const handleDelete = (id) => {
    if (
      confirm(
        "Hapus pengumuman terjadwal ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      setScheduled((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <div className="relative z-30 shrink-0">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* =====================================================
          PAGE AREA
          PENTING:
          - flex-1
          - min-w-0
          - TIDAK memakai w-0
          - sidebar tidak ikut terpotong
      ====================================================== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <Header
          title="Pengumuman Terjadwal"
          user={{ name: "Admin" }}
        />

        {/* ===================================================
            MAIN
        ==================================================== */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="w-full min-w-0 px-3 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
            {/* =================================================
                CONTENT
            ================================================== */}
            <div className="mx-auto w-full max-w-[1500px] min-w-0">
              {/* =================================================
                  BREADCRUMB + BACK
              ================================================== */}
              <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                {/* BREADCRUMB */}
                <nav
                  aria-label="Breadcrumb"
                  className="min-w-0 overflow-x-auto"
                >
                  <ol className="flex w-max max-w-full items-center gap-2 whitespace-nowrap text-xs font-medium text-slate-500 sm:text-sm">
                    <li className="shrink-0">
                      <a
                        href="/cmsAdmin"
                        className="transition-colors hover:text-indigo-600"
                      >
                        Dashboard
                      </a>
                    </li>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                    <li className="shrink-0">
                      <a
                        href="/cmsAdmin/pengumuman"
                        className="transition-colors hover:text-indigo-600"
                      >
                        Pengumuman
                      </a>
                    </li>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                    <li className="shrink-0 font-semibold text-indigo-600">
                      Terjadwal
                    </li>
                  </ol>
                </nav>

                {/* BACK */}
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:bg-white hover:text-indigo-600 sm:text-sm"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  Kembali
                </button>
              </div>

              {/* =================================================
                  HERO HEADER
              ================================================== */}
              <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:mb-7">
                {/* subtle decoration */}
                <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-indigo-100/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-100/30 blur-3xl" />

                <div className="relative flex min-w-0 flex-col gap-5 p-5 sm:p-6 md:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
                  {/* LEFT */}
                  <div className="flex min-w-0 items-start gap-4">
                    {/* ICON */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm sm:h-14 sm:w-14">
                      <Clock className="h-6 w-6 text-indigo-600 sm:h-7 sm:w-7" />
                    </div>

                    {/* TEXT */}
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          CMS Website
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      </div>

                      <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                        Pengumuman Terjadwal
                      </h1>

                      <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                        Kelola pengumuman yang akan diterbitkan secara
                        otomatis sesuai tanggal dan waktu yang telah
                        ditentukan.
                      </p>
                    </div>
                  </div>

                  {/* ACTION */}
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/cmsAdmin/pengumuman/tambah")
                    }
                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/25 active:scale-[0.98] sm:w-fit sm:text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Jadwal Baru
                  </button>
                </div>
              </section>

              {/* =================================================
                  SUMMARY
              ================================================== */}
              <section className="mb-6 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <SummaryCard
                  icon={<Clock className="h-5 w-5 text-indigo-600" />}
                  label="Total Terjadwal"
                  value={scheduled.length}
                  description="Pengumuman menunggu terbit"
                  iconBg="bg-indigo-50"
                />

                <SummaryCard
                  icon={<Calendar className="h-5 w-5 text-blue-600" />}
                  label="Jadwal Mendatang"
                  value={scheduled.length}
                  description="Siap diterbitkan otomatis"
                  iconBg="bg-blue-50"
                />

                <SummaryCard
                  icon={
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  }
                  label="Status"
                  value="Aktif"
                  description="Penjadwalan berjalan normal"
                  iconBg="bg-emerald-50"
                />
              </section>

              {/* =================================================
                  LIST HEADER
              ================================================== */}
              <section className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                    Daftar Pengumuman
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    Pengumuman yang telah dijadwalkan untuk diterbitkan.
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm sm:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {scheduled.length} Jadwal
                </div>
              </section>

              {/* =================================================
                  LIST
              ================================================== */}
              <section className="w-full min-w-0 space-y-3">
                {scheduled.length > 0 ? (
                  scheduled.map((item) => (
                    <ScheduledCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <EmptyState
                    onCreate={() =>
                      router.push("/cmsAdmin/pengumuman/tambah")
                    }
                  />
                )}
              </section>

              {/* =================================================
                  INFO
              ================================================== */}
              <section className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/50">
                <div className="flex min-w-0 items-start gap-3 p-4 sm:p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-indigo-100">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 sm:text-sm">
                      Sistem Penjadwalan
                    </h3>

                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                      Pengumuman terjadwal akan dipublikasikan secara
                      otomatis ketika waktu yang ditentukan telah tiba.
                      Pastikan tanggal dan waktu sudah sesuai sebelum
                      menyimpan jadwal.
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  FOOTER
              ================================================== */}
              <footer className="mt-8 border-t border-slate-200 py-5 text-center">
                <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                  © 2026 SmartSchool CMS • Pengumuman Terjadwal
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
  description,
  iconBg,
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-slate-50 transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm ring-1 ring-white`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
            {label}
          </p>

          <div className="mt-0.5 flex items-end gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {value}
            </span>
          </div>

          <p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-xs">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCHEDULED CARD
============================================================ */

function ScheduledCard({ item, onDelete }) {
  return (
    <article className="group relative w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg">
      {/* LEFT ACCENT */}
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-indigo-500 via-blue-500 to-indigo-400" />

      <div className="flex min-w-0 flex-col gap-4 p-4 pl-5 sm:p-5 sm:pl-6 lg:flex-row lg:items-center">
        {/* ICON */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm lg:self-center">
          <Clock className="h-5 w-5" />
        </div>

        {/* INFORMATION */}
        <div className="min-w-0 flex-1">
          {/* TITLE */}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 max-w-full break-words text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-base">
              {item.title}
            </h3>

            <span className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">
              {item.category}
            </span>
          </div>

          {/* META */}
          <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-2">
            <div className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500 sm:text-xs">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{item.date}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-100 sm:text-xs">
              <CheckCircle className="h-3.5 w-3.5" />
              Menunggu diterbitkan
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          <span className="text-[10px] font-medium text-slate-400 lg:hidden">
            Aksi
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Edit Jadwal"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-400 transition-all hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Hapus Jadwal"
              onClick={() => onDelete(item.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Opsi"
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-300 transition-all hover:bg-slate-50 hover:text-slate-500 sm:flex"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ onCreate }) {
  return (
    <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm sm:py-16">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 shadow-inner ring-1 ring-slate-200">
        <Clock className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
        Belum ada jadwal
      </h3>

      <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
        Belum ada pengumuman yang dijadwalkan. Buat jadwal baru
        agar pengumuman dapat diterbitkan secara otomatis.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg sm:text-sm"
      >
        <Plus className="h-4 w-4" />
        Buat Jadwal Sekarang
      </button>
    </div>
  );
}