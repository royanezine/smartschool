"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Search,
  Plus,
  Clock3,
  Users,
  Pencil,
  Trash2,
  ChevronRight,
  CheckCircle2,
  GraduationCap,
  BriefcaseBusiness,
  UserRound,
  SlidersHorizontal,
  CalendarClock,
} from "lucide-react";

// =========================================================
// INITIAL DATA
// =========================================================

const initialShifts = [
  {
    id: 1,
    name: "Shift Pagi",
    code: "SHIFT-PAGI",
    startTime: "07:00",
    endTime: "15:00",
    tolerance: 15,
    status: "Aktif",
    appliesTo: ["Guru", "Staff", "Siswa"],
    description:
      "Shift pagi untuk guru, staff, dan siswa yang mengikuti kegiatan sekolah pada pagi hari.",
    members: [
      {
        id: 101,
        name: "Budi Santoso",
        category: "Guru",
        position: "Guru Matematika",
      },
      {
        id: 102,
        name: "Siti Rahma",
        category: "Guru",
        position: "Guru Bahasa Indonesia",
      },
      {
        id: 103,
        name: "Dewi Lestari",
        category: "Staff",
        position: "Staff Tata Usaha",
      },
      {
        id: 104,
        name: "Andi Pratama",
        category: "Siswa",
        position: "Siswa Kelas X IPA 1",
      },
      {
        id: 105,
        name: "Nadia Putri",
        category: "Siswa",
        position: "Siswa Kelas X IPA 2",
      },
    ],
  },
  {
    id: 2,
    name: "Shift Siang",
    code: "SHIFT-SIANG",
    startTime: "13:00",
    endTime: "21:00",
    tolerance: 15,
    status: "Aktif",
    appliesTo: ["Guru", "Staff", "Siswa"],
    description:
      "Shift siang untuk pengguna yang memiliki jadwal kerja atau kegiatan sekolah pada siang sampai malam hari.",
    members: [
      {
        id: 201,
        name: "Rizky Maulana",
        category: "Guru",
        position: "Guru Produktif",
      },
      {
        id: 202,
        name: "Fajar Hidayat",
        category: "Staff",
        position: "Staff Laboratorium",
      },
      {
        id: 203,
        name: "Aulia Salsabila",
        category: "Siswa",
        position: "Siswa Kelas XI IPS 1",
      },
    ],
  },
];

// =========================================================
// HELPERS
// =========================================================

function getLateLimit(shift) {
  const [hour, minute] = shift.startTime.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + Number(shift.tolerance);
  const finalHour = Math.floor(totalMinutes / 60) % 24;
  const finalMinute = totalMinutes % 60;

  return `${String(finalHour).padStart(2, "0")}:${String(
    finalMinute
  ).padStart(2, "0")}`;
}

function getCategoryIcon(category) {
  if (category === "Guru") return <GraduationCap size={14} />;
  if (category === "Staff") return <BriefcaseBusiness size={14} />;
  return <UserRound size={14} />;
}

function getCategoryCount(shift, category) {
  return shift.members.filter((member) => member.category === category).length;
}

// =========================================================
// PAGE
// =========================================================

export default function MasterShiftPage() {
  const router = useRouter();

  const [shifts, setShifts] = useState(initialShifts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  const filteredShifts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return shifts.filter((shift) => {
      const matchesSearch =
        shift.name.toLowerCase().includes(keyword) ||
        shift.code.toLowerCase().includes(keyword) ||
        shift.members.some((m) =>
          m.name.toLowerCase().includes(keyword)
        );

      const matchesStatus =
        statusFilter === "Semua" || shift.status === statusFilter;

      const matchesCategory =
        categoryFilter === "Semua" ||
        shift.appliesTo.includes(categoryFilter);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [shifts, search, statusFilter, categoryFilter]);

  const activeShifts = shifts.filter((s) => s.status === "Aktif").length;

  const guruCount = shifts.reduce(
    (t, s) =>
      t + s.members.filter((m) => m.category === "Guru").length,
    0
  );

  const staffCount = shifts.reduce(
    (t, s) =>
      t + s.members.filter((m) => m.category === "Staff").length,
    0
  );

  const siswaCount = shifts.reduce(
    (t, s) =>
      t + s.members.filter((m) => m.category === "Siswa").length,
    0
  );

  const handleDelete = (shift) => {
    const confirmed = window.confirm(
      `Hapus ${shift.name}? Data shift akan dihapus dari daftar master.`
    );

    if (!confirmed) return;

    setShifts((current) =>
      current.filter((item) => item.id !== shift.id)
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page theme-text">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto theme-page">
          <div className="mx-auto w-full max-w-[1500px] 2xl:max-w-[1700px] 3xl:max-w-[1900px] px-6 py-6 md:px-8 md:py-8 2xl:px-10 2xl:py-10">
            <div className="flex flex-col gap-6 2xl:gap-7">

              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm">
                    <Clock3 size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="theme-primary h-1.5 w-1.5 rounded-full" />

                      <p className="theme-sidebar-text-active text-[11px] font-bold uppercase tracking-[0.12em]">
                        Manajemen Kehadiran
                      </p>
                    </div>

                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-[28px]">
                      Master Data Shift
                    </h1>

                    <p className="theme-text-muted mt-1 text-sm">
                      Kelola jam masuk, jam pulang, toleransi keterlambatan,
                      dan pengguna yang menggunakan setiap shift.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/presensi/master-shift/tambah"
                    )
                  }
                  className="theme-primary inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-colors"
                >
                  <Plus size={16} />
                  Tambah Shift
                </button>
              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 2xl:gap-4">
                <SummaryCard
                  icon={Clock3}
                  label="Total Shift"
                  value={shifts.length}
                  description="Shift terdaftar"
                />

                <SummaryCard
                  icon={CheckCircle2}
                  label="Shift Aktif"
                  value={activeShifts}
                  description="Sedang digunakan"
                  tone="emerald"
                />

                <SummaryCard
                  icon={GraduationCap}
                  label="Guru"
                  value={guruCount}
                  description="Terhubung ke shift"
                />

                <SummaryCard
                  icon={BriefcaseBusiness}
                  label="Staff"
                  value={staffCount}
                  description="Terhubung ke shift"
                />

                <SummaryCard
                  icon={Users}
                  label="Siswa"
                  value={siswaCount}
                  description="Terhubung ke shift"
                />
              </div>

              {/* =================================================
                  FILTER
              ================================================= */}

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm 2xl:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={16}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Cari nama shift, kode, atau nama pengguna..."
                      className="theme-input h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="theme-card-soft theme-border theme-text-muted hidden h-10 w-10 items-center justify-center rounded-lg border sm:flex">
                      <SlidersHorizontal size={16} />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value)
                      }
                      className="theme-input h-11 rounded-lg border px-3.5 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>

                    <select
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(event.target.value)
                      }
                      className="theme-input h-11 rounded-lg border px-3.5 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)/.15]"
                    >
                      <option value="Semua">
                        Semua Pengguna
                      </option>
                      <option value="Guru">Guru</option>
                      <option value="Staff">Staff</option>
                      <option value="Siswa">Siswa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* =================================================
                  LIST
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 2xl:gap-6">
                {filteredShifts.map((shift) => {
                  const isActive = shift.status === "Aktif";

                  return (
                    <div
                      key={shift.id}
                      className="theme-card theme-border flex flex-col overflow-hidden rounded-xl border shadow-sm transition-colors hover:border-[var(--color-primary)]"
                    >
                      {/* CARD HEADER */}

                      <div className="theme-border border-b p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                                isActive
                                  ? "theme-info"
                                  : "theme-card-soft theme-text-muted theme-border"
                              }`}
                            >
                              <Clock3 size={19} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="theme-text text-base font-bold">
                                  {shift.name}
                                </h2>

                                <span
                                  className={
                                    isActive
                                      ? "theme-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                      : "theme-card-soft theme-text-muted theme-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                  }
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isActive
                                        ? "bg-[var(--color-success)]"
                                        : "bg-[var(--color-text-muted)]"
                                    }`}
                                  />

                                  {shift.status}
                                </span>
                              </div>

                              <p className="theme-text-placeholder mt-1 font-mono text-xs font-semibold">
                                {shift.code}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/presensi/master-shift/${shift.id}/edit`
                                )
                              }
                              title="Edit shift"
                              className="theme-text-muted theme-sidebar-hover rounded-lg p-2 transition-colors hover:text-[var(--color-primary)]"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(shift)}
                              title="Hapus shift"
                              className="theme-text-muted rounded-lg p-2 transition-colors hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <p className="theme-text-muted mt-4 text-sm leading-6">
                          {shift.description}
                        </p>
                      </div>

                      {/* TIME */}

                      <div className="theme-border grid grid-cols-3 border-b">
                        <TimeBox
                          label="Jam Masuk"
                          value={shift.startTime}
                        />

                        <TimeBox
                          label="Jam Pulang"
                          value={shift.endTime}
                          bordered
                        />

                        <TimeBox
                          label="Toleransi"
                          value={`${shift.tolerance} menit`}
                          highlight
                        />
                      </div>

                      {/* APPLIES TO */}

                      <div className="theme-border border-b p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="theme-primary h-1 w-1 rounded-full" />

                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                            Berlaku Untuk
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {shift.appliesTo.map((category) => (
                            <span
                              key={category}
                              className="theme-card-soft theme-border theme-text-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold"
                            >
                              <span className="theme-sidebar-text-active">
                                {getCategoryIcon(category)}
                              </span>

                              {category}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* RULE */}

                      <div className="theme-card-soft theme-border border-b p-5">
                        <div className="flex items-start gap-3">
                          <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                            <CalendarClock size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text text-sm font-bold">
                              Ketentuan Presensi
                            </p>

                            <p className="theme-text-muted mt-1 text-xs leading-5">
                              Jam masuk{" "}
                              <b className="theme-text">
                                {shift.startTime}
                              </b>
                              . Batas toleransi sampai pukul{" "}
                              <span className="theme-info rounded-md px-1.5 py-0.5 font-bold">
                                {getLateLimit(shift)}
                              </span>
                              . Setelah melewati batas tersebut,
                              kehadiran dicatat sebagai{" "}
                              <b className="theme-text">Telat</b>.
                            </p>

                            <p className="theme-text-muted mt-2 text-xs leading-5">
                              Jam pulang mengacu pada waktu selesai
                              shift, yaitu{" "}
                              <b className="theme-text">
                                {shift.endTime}
                              </b>
                              .
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* USERS */}

                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="theme-primary h-1 w-1 rounded-full" />

                            <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                              Pengguna Terhubung
                            </p>
                          </div>

                          <span className="theme-card-soft theme-border theme-text-muted rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
                            {shift.members.length} pengguna
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <CategoryBox
                            icon={<GraduationCap size={14} />}
                            label="Guru"
                            value={getCategoryCount(
                              shift,
                              "Guru"
                            )}
                          />

                          <CategoryBox
                            icon={<BriefcaseBusiness size={14} />}
                            label="Staff"
                            value={getCategoryCount(
                              shift,
                              "Staff"
                            )}
                          />

                          <CategoryBox
                            icon={<UserRound size={14} />}
                            label="Siswa"
                            value={getCategoryCount(
                              shift,
                              "Siswa"
                            )}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/presensi/master-shift/${shift.id}`
                            )
                          }
                          className="mt-auto w-full pt-4"
                        >
                          <span className="theme-card theme-border theme-text-secondary flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                            Lihat Detail Shift
                            <ChevronRight size={16} />
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredShifts.length === 0 && (
                  <div className="theme-card theme-border col-span-full rounded-xl border border-dashed px-6 py-16 text-center">
                    <div className="theme-card-soft theme-border theme-text-muted mx-auto flex h-14 w-14 items-center justify-center rounded-xl border">
                      <Clock3 size={22} />
                    </div>

                    <h3 className="theme-text mt-4 text-sm font-bold">
                      Shift tidak ditemukan
                    </h3>

                    <p className="theme-text-muted mt-1 text-xs">
                      Coba ubah kata kunci atau filter pencarian.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// SUB COMPONENTS
// =========================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "blue",
}) {
  const tones = {
    blue: "theme-info",
    emerald: "theme-success",
  };

  return (
    <div className="theme-card theme-border rounded-xl border p-4 shadow-sm transition-colors hover:border-[var(--color-primary)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-placeholder truncate text-[10px] font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-1 text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="theme-text-placeholder mt-0.5 truncate text-[11px]">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
            tones[tone] || tones.blue
          }`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function TimeBox({
  label,
  value,
  bordered = false,
  highlight = false,
}) {
  return (
    <div
      className={`p-5 ${
        bordered ? "theme-border border-x" : ""
      }`}
    >
      <p className="theme-text-placeholder text-[10px] font-bold uppercase tracking-wider">
        {label}
      </p>

      <p
        className={`mt-1.5 text-xl font-bold ${
          highlight
            ? "theme-sidebar-text-active"
            : "theme-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CategoryBox({ icon, label, value }) {
  return (
    <div className="theme-card-soft theme-border rounded-lg border p-3 transition-colors hover:border-[var(--color-primary)]">
      <div className="theme-text-muted flex items-center gap-2">
        <span className="theme-sidebar-text-active">
          {icon}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="theme-text mt-1.5 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}