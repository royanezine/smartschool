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
  ChevronRight,
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
      { id: 101, name: "Budi Santoso", category: "Guru", position: "Guru Matematika" },
      { id: 102, name: "Siti Rahma", category: "Guru", position: "Guru Bahasa Indonesia" },
      { id: 103, name: "Dewi Lestari", category: "Staff", position: "Staff Tata Usaha" },
      { id: 104, name: "Andi Pratama", category: "Siswa", position: "Siswa Kelas X IPA 1" },
      { id: 105, name: "Nadia Putri", category: "Siswa", position: "Siswa Kelas X IPA 2" },
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
      { id: 201, name: "Rizky Maulana", category: "Guru", position: "Guru Produktif" },
      { id: 202, name: "Fajar Hidayat", category: "Staff", position: "Staff Laboratorium" },
      { id: 203, name: "Aulia Salsabila", category: "Siswa", position: "Siswa Kelas XI IPS 1" },
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
  return `${String(finalHour).padStart(2, "0")}:${String(finalMinute).padStart(2, "0")}`;
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
  blue: "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]",
  violet: "bg-violet-50 border-violet-200/70 text-violet-600",
  slate: "bg-slate-50 border-slate-200 text-slate-500",
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

  /* ================================================
     NOT FOUND
  ================================================ */
  if (!shift) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
        <Sidebar />

        <div className="flex h-screen min-w-0 flex-1 flex-col">
          <Header />

          <main className="flex flex-1 items-center justify-center bg-[#F8FAFC] px-6">
            <div className="w-full max-w-md rounded-xl border border-dashed border-[#60A5FA]/40 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#60A5FA]/20 bg-[#F8FAFC] text-[#60A5FA]">
                <Clock3 size={24} />
              </div>

              <h1 className="mt-4 text-sm font-bold text-[#0F172A]">
                Shift tidak ditemukan
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Data shift yang Anda cari tidak tersedia.
              </p>

              <button
                type="button"
                onClick={() => router.push("/admin/presensi/master-shift")}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1E3A5F]"
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

  const guruCount = shift.members.filter((m) => m.category === "Guru").length;
  const staffCount = shift.members.filter((m) => m.category === "Staff").length;
  const siswaCount = shift.members.filter((m) => m.category === "Siswa").length;

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Hapus ${shift.name}? Data shift akan dihapus dari master.`
    );
    if (!confirmed) return;
    router.push("/admin/presensi/master-shift");
  };

  const isActive = shift.status === "Aktif";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F8FAFC]">
          {/* CONTAINER FULL WIDTH */}
          <div className="w-full px-6 py-6 md:px-8 md:py-8 xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">

            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() => router.push("/admin/presensi/master-shift")}
              className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#1E3A5F] transition-colors hover:text-[#0F172A]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#60A5FA]/30 bg-white transition-colors hover:border-[#2563EB]">
                <ArrowLeft size={14} />
              </span>
              Kembali ke Master Shift
            </button>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                    isActive
                      ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <Clock3 size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                      Master Shift
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-[28px]">
                      {shift.name}
                    </h1>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {shift.status}
                    </span>
                  </div>

                  <p className="mt-1 font-mono text-xs font-semibold text-slate-400">
                    {shift.code}
                  </p>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                    {shift.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/presensi/master-shift/${shift.id}/edit`)
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#60A5FA]/30 bg-white px-4 text-sm font-semibold text-[#1E3A5F] transition-colors hover:border-[#2563EB] hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Hapus
                </button>
              </div>
            </div>

            {/* =================================================
                QUICK STATS (Time)
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
                <section className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                      <Users size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">
                        Shift Berlaku Untuk
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
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
                          className="flex items-center gap-3 rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] p-3.5 transition-colors hover:border-[#2563EB]/40"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                              categoryTones[tone]
                            }`}
                          >
                            {getCategoryIcon(category)}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0F172A]">
                              {category}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Menggunakan shift
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* PENGGUNA TERHUBUNG */}
                <section className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                        <Users size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">
                          Pengguna Terhubung
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Guru, staff, dan siswa yang menggunakan shift ini.
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-[#60A5FA]/25 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 flex-shrink-0">
                      {shift.members.length} pengguna
                    </span>
                  </div>

                  {/* COUNT CARDS */}
                  <div className="grid grid-cols-3 gap-2 border-b border-[#60A5FA]/15 p-4 sm:gap-3 sm:p-5">
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
                  <div className="divide-y divide-[#60A5FA]/15">
                    {shift.members.map((member) => {
                      const tone = getCategoryTone(member.category);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F8FAFC] sm:gap-4"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                              categoryTones[tone]
                            }`}
                          >
                            {getCategoryIcon(member.category)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-[#0F172A]">
                              {member.name}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
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
                <section className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                      <CalendarClock size={15} />
                    </div>
                    <p className="text-sm font-bold text-[#0F172A]">
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
                      dot="bg-[#2563EB]"
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
                <section className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                      <Clock3 size={15} />
                    </div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      Jam Kerja
                    </p>
                  </div>

                  <div className="space-y-3.5 p-5">
                    <WorkTime label="Mulai Kerja" value={shift.startTime} />
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
                <section className="rounded-xl border border-[#60A5FA]/30 bg-[#2563EB]/5 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-white text-[#2563EB]">
                      <Info size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1E3A5F]">
                        Digunakan sebagai acuan presensi
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-[#1E3A5F]/80">
                        Jam masuk, batas keterlambatan, dan jam pulang pada shift ini
                        menjadi acuan ketika sistem mencatat kehadiran pengguna.
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
    <div className="rounded-xl border border-[#60A5FA]/20 bg-white p-4 shadow-sm transition-colors hover:border-[#2563EB]/40">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
          {icon}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>

      <p
        className={`mt-2.5 text-xl font-bold tracking-tight ${
          highlight ? "text-[#2563EB]" : "text-[#0F172A]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CountCard({ icon, label, value, tone = "blue" }) {
  const tones = {
    blue: "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]",
    violet: "bg-violet-50 border-violet-200/70 text-violet-600",
    slate: "bg-slate-50 border-slate-200 text-slate-500",
  };

  return (
    <div className="rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] p-3 transition-colors hover:border-[#2563EB]/40">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md border ${
            tones[tone] || tones.blue
          }`}
        >
          {icon}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-2 text-xl font-bold text-[#0F172A]">{value}</p>
    </div>
  );
}

function RuleRow({ title, description, dot }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#60A5FA]/15 bg-[#F8FAFC] p-3 transition-colors hover:border-[#2563EB]/30">
      <span className={`mt-1 w-2 h-2 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#0F172A]">{title}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function WorkTime({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`text-sm font-bold ${
          highlight ? "text-[#2563EB]" : "text-[#0F172A]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#60A5FA]/15" />;
}