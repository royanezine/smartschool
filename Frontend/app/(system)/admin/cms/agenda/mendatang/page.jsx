// app/cmsAdmin/agenda/mendatang/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Calendar,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  CalendarDays,
  Timer,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

export default function AgendaMendatangPage() {
  const router = useRouter();

  const [active, setActive] = useState("agenda");
  const [collapsed, setCollapsed] = useState(false);

  const [upcoming, setUpcoming] = useState([
    {
      id: 2,
      title: "Pendaftaran Siswa Baru 2026",
      category: "PPDB",
      location: "Gedung A",
      date: "2026-02-01 08:00",
      status: "scheduled",
    },
    {
      id: 5,
      title: "Pembagian Raport Semester Ganjil",
      category: "Kegiatan",
      location: "Ruang Auditorium",
      date: "2026-01-28 08:00",
      status: "scheduled",
    },
    {
      id: 4,
      title: "Rapat Evaluasi UTS",
      category: "Rapat",
      location: "Ruangan Guru",
      date: "2026-01-25 14:00",
      status: "draft",
    },
  ]);

  const handleDelete = (id) => {
    if (confirm("Hapus agenda mendatang ini?")) {
      setUpcoming((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }
  };

  const getDateInfo = (dateString) => {
    const date = new Date(dateString.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
      return {
        month: "---",
        day: "--",
        fullDate: "-",
        time: "-",
      };
    }

    return {
      month: date
        .toLocaleDateString("id-ID", {
          month: "short",
        })
        .replace(".", ""),

      day: date.getDate(),

      fullDate: date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),

      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case "PPDB":
        return "theme-info";

      case "Kegiatan":
        return "theme-success";

      case "Rapat":
        return "theme-card theme-border theme-text-secondary";

      default:
        return "theme-card theme-border theme-text-muted";
    }
  };

  const getStatusStyle = (status) => {
    if (status === "scheduled") {
      return {
        wrapper: "theme-info",
        dot: "var(--color-info)",
        icon: CalendarDays,
        label: "Terjadwal",
      };
    }

    return {
      wrapper: "theme-warning",
      dot: "var(--color-warning)",
      icon: Clock,
      label: "Draft",
    };
  };

  return (
    <div className="theme-page flex min-h-screen w-full">
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title="Agenda Mendatang"
          user={{ name: "Admin" }}
          notifications={[]}
        />

        <main className="theme-page min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">

            {/* BREADCRUMB */}
            <nav className="theme-text-muted flex items-center gap-2 text-xs sm:text-sm">
              <a
                href="/cmsAdmin"
                className="transition hover:opacity-70"
              >
                Dashboard
              </a>

              <ChevronRight className="theme-text-placeholder h-3.5 w-3.5" />

              <a
                href="/cmsAdmin/agenda"
                className="transition hover:opacity-70"
              >
                Agenda
              </a>

              <ChevronRight className="theme-text-placeholder h-3.5 w-3.5" />

              <span className="theme-text-primary font-semibold">
                Mendatang
              </span>
            </nav>

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => router.back()}
              className="theme-text-muted group inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Kembali
            </button>

            {/* HEADER CARD */}
            <div className="theme-card theme-border rounded-2xl border p-6 shadow-sm lg:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="theme-primary shrink-0 rounded-2xl p-3 shadow-lg">
                    <CalendarDays className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="theme-info mb-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" />
                      Agenda Sekolah
                    </div>

                    <h1 className="theme-text text-2xl font-bold sm:text-3xl">
                      Agenda Mendatang
                    </h1>

                    <p className="theme-text-muted mt-1 text-sm">
                      Kelola event, kegiatan, dan jadwal sekolah
                      yang akan datang
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/cmsAdmin/agenda/tambah")
                  }
                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Buat Agenda Baru
                </button>
              </div>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              {/* TOTAL */}
              <div className="theme-card theme-border flex items-center gap-4 rounded-xl border p-4 shadow-sm">
                <div className="theme-info rounded-xl p-2.5">
                  <Calendar className="h-5 w-5" />
                </div>

                <div>
                  <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                    Total Agenda
                  </p>

                  <p className="theme-text text-2xl font-bold">
                    {upcoming.length}
                  </p>
                </div>
              </div>

              {/* TERJADWAL */}
              <div className="theme-card theme-border flex items-center gap-4 rounded-xl border p-4 shadow-sm">
                <div className="theme-success rounded-xl p-2.5">
                  <Timer className="h-5 w-5" />
                </div>

                <div>
                  <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                    Terjadwal
                  </p>

                  <p className="theme-text text-2xl font-bold">
                    {
                      upcoming.filter(
                        (i) => i.status === "scheduled"
                      ).length
                    }
                  </p>
                </div>
              </div>

              {/* DRAFT */}
              <div className="theme-card theme-border flex items-center gap-4 rounded-xl border p-4 shadow-sm">
                <div className="theme-warning rounded-xl p-2.5">
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                    Draft
                  </p>

                  <p className="theme-text text-2xl font-bold">
                    {
                      upcoming.filter(
                        (i) => i.status === "draft"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* LIST HEADER */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  Jadwal Terdekat
                </h2>

                <p className="theme-text-muted text-sm">
                  Daftar agenda yang dijadwalkan berikutnya
                </p>
              </div>

              <span className="theme-card theme-border theme-text-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm">
                <CalendarDays
                  className="h-3.5 w-3.5"
                  style={{
                    color: "var(--color-primary)",
                  }}
                />

                {upcoming.length} agenda
              </span>
            </div>

            {/* LIST */}
            <div className="space-y-3">
              {upcoming.length > 0 ? (
                upcoming.map((item) => {
                  const dateInfo = getDateInfo(item.date);
                  const status = getStatusStyle(item.status);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={item.id}
                      className="
                        theme-card theme-border
                        group relative
                        overflow-hidden rounded-2xl border
                        shadow-sm
                        transition-all duration-300
                        hover:shadow-lg
                      "
                    >
                      {/* ACCENT */}
                      <div
                        className="absolute bottom-0 left-0 top-0 w-1"
                        style={{
                          backgroundColor:
                            "var(--color-primary)",
                        }}
                      />

                      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">

                        {/* DATE */}
                        <div className="flex shrink-0 items-center gap-3 lg:block">
                          <div className="theme-info flex h-16 w-16 flex-col items-center justify-center rounded-xl border shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                              {dateInfo.month}
                            </span>

                            <span className="theme-text mt-0.5 text-2xl font-extrabold leading-none">
                              {dateInfo.day}
                            </span>
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <h3
                              className="
                                theme-text
                                break-words
                                text-sm font-bold
                                transition
                                sm:text-base
                                lg:text-lg
                              "
                            >
                              {item.title}
                            </h3>

                            <span
                              className={`inline-flex w-fit shrink-0 items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${getCategoryStyle(
                                item.category
                              )}`}
                            >
                              {item.category}
                            </span>
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">

                            {/* DATE */}
                            <div className="theme-text-muted inline-flex items-center gap-1.5 text-xs">
                              <Calendar
                                className="h-3.5 w-3.5"
                                style={{
                                  color:
                                    "var(--color-text-placeholder)",
                                }}
                              />

                              <span>
                                {dateInfo.fullDate}
                              </span>
                            </div>

                            {/* TIME */}
                            <div className="theme-text-muted inline-flex items-center gap-1.5 text-xs">
                              <Clock
                                className="h-3.5 w-3.5"
                                style={{
                                  color:
                                    "var(--color-text-placeholder)",
                                }}
                              />

                              <span>
                                {dateInfo.time} WIB
                              </span>
                            </div>

                            {/* LOCATION */}
                            <div className="theme-text-muted inline-flex items-center gap-1.5 text-xs">
                              <MapPin
                                className="h-3.5 w-3.5"
                                style={{
                                  color:
                                    "var(--color-text-placeholder)",
                                }}
                              />

                              <span className="max-w-[200px] truncate">
                                {item.location}
                              </span>
                            </div>
                          </div>

                          {/* STATUS MOBILE */}
                          <div className="mt-3 lg:hidden">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.wrapper}`}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    status.dot,
                                }}
                              />

                              <StatusIcon className="h-3 w-3" />

                              {status.label}
                            </span>
                          </div>
                        </div>

                        {/* STATUS DESKTOP */}
                        <div className="hidden shrink-0 lg:block">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.wrapper}`}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  status.dot,
                              }}
                            />

                            <StatusIcon className="h-3.5 w-3.5" />

                            {status.label}
                          </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="theme-border-soft flex shrink-0 items-center justify-end gap-1.5 border-t pt-3 lg:border-t-0 lg:pt-0">

                          {/* EDIT */}
                          <button
                            type="button"
                            className="
                              theme-text-muted
                              inline-flex h-9 w-9
                              items-center justify-center
                              rounded-lg border
                              border-transparent
                              transition-all
                              hover:border-[var(--color-info)]
                              hover:opacity-80
                            "
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                            className="
                              theme-text-muted
                              inline-flex h-9 w-9
                              items-center justify-center
                              rounded-lg border
                              border-transparent
                              transition-all
                              hover:border-[var(--color-danger)]
                              hover:opacity-80
                            "
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {/* OPTIONS */}
                          <button
                            type="button"
                            className="
                              theme-text-muted
                              hidden h-9 w-9
                              items-center justify-center
                              rounded-lg border
                              border-transparent
                              transition-all
                              hover:opacity-80
                              sm:inline-flex
                            "
                            title="Opsi"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* EMPTY STATE */
                <div className="theme-card theme-border flex flex-col items-center justify-center rounded-2xl border px-5 py-14 text-center shadow-sm">
                  <div className="theme-card-soft theme-border flex h-16 w-16 items-center justify-center rounded-2xl border">
                    <CalendarDays className="theme-text-muted h-7 w-7" />
                  </div>

                  <h3 className="theme-text mt-4 text-base font-bold">
                    Tidak ada agenda mendatang
                  </h3>

                  <p className="theme-text-muted mt-1 max-w-md text-sm">
                    Belum terdapat agenda yang dijadwalkan.
                    Tambahkan agenda baru untuk mulai mengatur
                    kegiatan sekolah.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/cmsAdmin/agenda/tambah"
                      )
                    }
                    className="theme-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Agenda
                  </button>
                </div>
              )}
            </div>

            {/* FOOTER INFO */}
            {upcoming.length > 0 && (
              <div className="theme-card theme-border flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="theme-text-muted flex items-center gap-2 text-xs">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Menampilkan {upcoming.length} agenda mendatang
                </span>

                <span className="theme-text-placeholder text-xs">
                  Data simulasi
                </span>
              </div>
            )}

            {/* FOOTER */}
            <footer className="theme-border-soft theme-text-muted border-t pt-4 text-center text-xs">
              © 2026 SmartSchool CMS • Agenda Mendatang
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}