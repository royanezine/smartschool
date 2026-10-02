"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  Clock3,
  Users,
  GraduationCap,
  BriefcaseBusiness,
  UserRound,
  CalendarClock,
  CheckCircle2,
  Info,
  Sun,
  Moon,
  AlertCircle,
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
  const total = hour * 60 + minute + Number(shift.tolerance);

  const finalHour = Math.floor(total / 60) % 24;
  const finalMinute = total % 60;

  return `${String(finalHour).padStart(2, "0")}:${String(
    finalMinute
  ).padStart(2, "0")}`;
}

function getCategoryIcon(category) {
  if (category === "Guru") return <GraduationCap size={14} />;
  if (category === "Staff") return <BriefcaseBusiness size={14} />;
  return <UserRound size={14} />;
}

function getCategoryTone(category) {
  if (category === "Guru") return "blue";
  if (category === "Staff") return "violet";
  return "slate";
}

const categoryTones = {
  blue: "theme-info",
  violet: "bg-violet-100/70 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60",
  slate: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

// =========================================================
// PAGE
// =========================================================

export default function MasterShiftDetailPage() {
  const router = useRouter();
  const params = useParams();

  const shiftId = Number(params.id);

  const shift = useMemo(
    () => initialShifts.find((item) => item.id === shiftId),
    [shiftId]
  );

  // =======================================================
  // NOT FOUND
  // =======================================================

  if (!shift) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar />

        <div className="flex h-screen min-w-0 flex-1 flex-col">
          <Header />

          <main className="flex flex-1 items-center justify-center px-6 theme-page">
            <div className="w-full max-w-md rounded-xl border border-dashed theme-border bg-[var(--color-card)] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl theme-border border theme-card-soft theme-text-muted">
                <Clock3 size={24} />
              </div>

              <h1 className="mt-4 text-sm font-bold theme-text">
                Shift tidak ditemukan
              </h1>

              <p className="mt-1 text-xs theme-text-muted">
                Data shift yang Anda cari tidak tersedia.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/admin/presensi/master-shift")
                }
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg theme-primary px-4 text-sm font-semibold transition-colors"
              >
                <ArrowLeft size={15} />
                Kembali ke Master Shift
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const guruCount = shift.members.filter(
    (m) => m.category === "Guru"
  ).length;

  const staffCount = shift.members.filter(
    (m) => m.category === "Staff"
  ).length;

  const siswaCount = shift.members.filter(
    (m) => m.category === "Siswa"
  ).length;

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Hapus ${shift.name}? Data shift akan dihapus dari master.`
    );

    if (!confirmed) return;

    router.push("/admin/presensi/master-shift");
  };

  const isActive = shift.status === "Aktif";

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto theme-page">
          {/* CONTAINER FULL WIDTH */}
          <div className="w-full px-6 py-6 md:px-8 md:py-8 xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">

            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                router.push("/admin/presensi/master-shift")
              }
              className="mb-5 inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition-colors hover:theme-text"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-card transition-colors hover:theme-primary-outline">
                <ArrowLeft size={14} />
              </span>

              Kembali ke Master Shift
            </button>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                    isActive
                      ? "theme-info"
                      : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                  }`}
                >
                  <Clock3 size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full theme-primary" />

                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] theme-sidebar-text-active">
                      Master Shift
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-[28px]">
                      {shift.name}
                    </h1>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        isActive
                          ? "theme-success"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />

                      {shift.status}
                    </span>
                  </div>

                  <p className="mt-1 font-mono text-xs font-semibold theme-text-muted">
                    {shift.code}
                  </p>

                  <p className="mt-3 max-w-3xl text-sm leading-6 theme-text-secondary">
                    {shift.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/presensi/master-shift/${shift.id}/edit`
                    )
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-semibold theme-text-secondary transition-colors hover:theme-primary-outline"
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex h-10 items-center gap-2 rounded-lg theme-danger px-4 text-sm font-semibold transition-colors"
                >
                  <Trash2 size={15} />
                  Hapus
                </button>
              </div>
            </div>

            {/* =================================================
                QUICK STATS
            ================================================= */}

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:gap-4">
              <StatCard
                icon={<Sun size={15} />}
                label="Jam Masuk"
                value={shift.startTime}
              />

              <StatCard
                icon={<Moon size={15} />}
                label="Jam Pulang"
                value={shift.endTime}
              />

              <StatCard
                icon={<Clock3 size={15} />}
                label="Toleransi"
                value={`${shift.tolerance} menit`}
              />

              <StatCard
                icon={<AlertCircle size={15} />}
                label="Batas Telat"
                value={getLateLimit(shift)}
                highlight
              />
            </div>

            {/* =================================================
                MAIN CONTENT GRID
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:gap-6">

              {/* =================================================
                  LEFT COLUMN
              ================================================= */}

              <div className="space-y-5 2xl:space-y-6">

                {/* BERLAKU UNTUK */}

                <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                  <div className="flex items-center gap-3 border-b theme-border theme-card-soft px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border theme-info">
                      <Users size={15} />
                    </div>

                    <div>
                      <p className="text-sm font-bold theme-text">
                        Shift Berlaku Untuk
                      </p>

                      <p className="mt-0.5 text-[11px] theme-text-muted">
                        Kategori pengguna yang menggunakan jadwal ini.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                    {shift.appliesTo.map((category) => {
                      const tone = getCategoryTone(category);

                      return (
                        <div
                          key={category}
                          className="flex items-center gap-3 rounded-lg border theme-border theme-card-soft p-3.5 transition-colors hover:border-[var(--color-primary)]"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                              categoryTones[tone]
                            }`}
                          >
                            {getCategoryIcon(category)}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold theme-text">
                              {category}
                            </p>

                            <p className="mt-0.5 text-[11px] theme-text-muted">
                              Menggunakan shift
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* PENGGUNA TERHUBUNG */}

                <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b theme-border theme-card-soft px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border theme-info">
                        <Users size={15} />
                      </div>

                      <div>
                        <p className="text-sm font-bold theme-text">
                          Pengguna Terhubung
                        </p>

                        <p className="mt-0.5 text-[11px] theme-text-muted">
                          Guru, staff, dan siswa yang menggunakan shift ini.
                        </p>
                      </div>
                    </div>

                    <span className="flex-shrink-0 rounded-full border theme-border theme-card px-2.5 py-1 text-[11px] font-semibold theme-text-muted">
                      {shift.members.length} pengguna
                    </span>
                  </div>

                  {/* COUNT CARDS */}

                  <div className="grid grid-cols-3 gap-2 border-b theme-border p-4 sm:gap-3 sm:p-5">
                    <CountCard
                      icon={<GraduationCap size={14} />}
                      label="Guru"
                      value={guruCount}
                      tone="blue"
                    />

                    <CountCard
                      icon={<BriefcaseBusiness size={14} />}
                      label="Staff"
                      value={staffCount}
                      tone="violet"
                    />

                    <CountCard
                      icon={<UserRound size={14} />}
                      label="Siswa"
                      value={siswaCount}
                      tone="slate"
                    />
                  </div>

                  {/* MEMBER LIST */}

                  <div className="divide-y divide-[var(--color-border)]">
                    {shift.members.map((member) => {
                      const tone = getCategoryTone(member.category);

                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--color-table-hover)] sm:gap-4"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                              categoryTones[tone]
                            }`}
                          >
                            {getCategoryIcon(member.category)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold theme-text">
                              {member.name}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] theme-text-muted">
                              {member.position}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              categoryTones[tone]
                            }`}
                          >
                            {member.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* =================================================
                  RIGHT COLUMN
              ================================================= */}

              <aside className="space-y-5 xl:sticky xl:top-6 2xl:space-y-6">

                {/* KETENTUAN PRESENSI */}

                <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                  <div className="flex items-center gap-3 border-b theme-border theme-card-soft px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border theme-info">
                      <CalendarClock size={15} />
                    </div>

                    <p className="text-sm font-bold theme-text">
                      Ketentuan Presensi
                    </p>
                  </div>

                  <div className="space-y-2 p-4">
                    <RuleRow
                      title="Hadir"
                      description="Datang sebelum atau sampai batas toleransi."
                      dot="bg-emerald-500"
                    />

                    <RuleRow
                      title="Telat"
                      description="Datang setelah batas toleransi."
                      dot="bg-amber-500"
                    />

                    <RuleRow
                      title="Izin"
                      description="Pengajuan izin telah disetujui."
                      dot="bg-[var(--color-primary)]"
                    />

                    <RuleRow
                      title="Cuti"
                      description="Data cuti telah disetujui."
                      dot="bg-violet-500"
                    />

                    <RuleRow
                      title="Alpha"
                      description="Tidak ada presensi dan izin."
                      dot="bg-red-500"
                    />
                  </div>
                </section>

                {/* JAM KERJA */}

                <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                  <div className="flex items-center gap-3 border-b theme-border theme-card-soft px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border theme-info">
                      <Clock3 size={15} />
                    </div>

                    <p className="text-sm font-bold theme-text">
                      Jam Kerja
                    </p>
                  </div>

                  <div className="space-y-3.5 p-5">
                    <WorkTime
                      label="Mulai Kerja"
                      value={shift.startTime}
                    />

                    <Divider />

                    <WorkTime
                      label="Batas Toleransi"
                      value={getLateLimit(shift)}
                      highlight
                    />

                    <Divider />

                    <WorkTime
                      label="Selesai / Absen Pulang"
                      value={shift.endTime}
                    />
                  </div>
                </section>

                {/* INFO CARD */}

                <section className="theme-info rounded-xl border p-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border theme-border theme-card text-[var(--color-primary)]">
                      <Info size={14} />
                    </div>

                    <div>
                      <p className="text-xs font-bold">
                        Digunakan sebagai acuan presensi
                      </p>

                      <p className="mt-1 text-[11px] leading-5 opacity-80">
                        Jam masuk, batas keterlambatan, dan jam pulang pada
                        shift ini menjadi acuan ketika sistem mencatat
                        kehadiran pengguna.
                      </p>
                    </div>
                  </div>
                </section>
              </aside>
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

function StatCard({ icon, label, value, highlight = false }) {
  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm transition-colors hover:border-[var(--color-primary)]">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border theme-info">
          {icon}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
          {label}
        </p>
      </div>

      <p
        className={`mt-2.5 text-xl font-bold tracking-tight ${
          highlight
            ? "text-[var(--color-primary)]"
            : "theme-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CountCard({ icon, label, value, tone = "blue" }) {
  const tones = {
    blue: "theme-info",
    violet:
      "bg-violet-100/70 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60",
    slate:
      "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };

  return (
    <div className="theme-card-soft rounded-lg border theme-border p-3 transition-colors hover:border-[var(--color-primary)]">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md border ${
            tones[tone] || tones.blue
          }`}
        >
          {icon}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
          {label}
        </p>
      </div>

      <p className="mt-2 text-xl font-bold theme-text">
        {value}
      </p>
    </div>
  );
}

function RuleRow({ title, description, dot }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border theme-border theme-card-soft p-3 transition-colors hover:border-[var(--color-primary)]">
      <span
        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dot}`}
      />

      <div className="min-w-0">
        <p className="text-xs font-bold theme-text">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-4 theme-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

function WorkTime({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs theme-text-muted">
        {label}
      </span>

      <span
        className={`text-sm font-bold ${
          highlight
            ? "text-[var(--color-primary)]"
            : "theme-text"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px bg-[var(--color-border)]" />
  );
}