"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

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
  const totalMinutes = hour * 60 + minute + Number(shift.tolerance);
  const finalHour = Math.floor(totalMinutes / 60) % 24;
  const finalMinute = totalMinutes % 60;
  return `${String(finalHour).padStart(2, "0")}:${String(finalMinute).padStart(2, "0")}`;
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
        shift.members.some((m) => m.name.toLowerCase().includes(keyword));

      const matchesStatus =
        statusFilter === "Semua" || shift.status === statusFilter;

      const matchesCategory =
        categoryFilter === "Semua" || shift.appliesTo.includes(categoryFilter);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [shifts, search, statusFilter, categoryFilter]);

  const activeShifts = shifts.filter((s) => s.status === "Aktif").length;
  const guruCount = shifts.reduce((t, s) => t + s.members.filter((m) => m.category === "Guru").length, 0);
  const staffCount = shifts.reduce((t, s) => t + s.members.filter((m) => m.category === "Staff").length, 0);
  const siswaCount = shifts.reduce((t, s) => t + s.members.filter((m) => m.category === "Siswa").length, 0);

  const handleDelete = (shift) => {
    const confirmed = window.confirm(
      `Hapus ${shift.name}? Data shift akan dihapus dari daftar master.`
    );
    if (!confirmed) return;
    setShifts((current) => current.filter((item) => item.id !== shift.id));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F8FAFC]">
          {/*
            CONTAINER RESPONSIVE
            - max-w naik bertahap: 1500 → 1700 (2xl) → 1900 (3xl) → full (4xl+)
            - padding naik proporsional
          */}
          <div className="mx-auto w-full max-w-[1500px] 2xl:max-w-[1700px] 3xl:max-w-[1900px] px-6 py-6 md:px-8 md:py-8 2xl:px-10 2xl:py-10">
            <div className="flex flex-col gap-6 2xl:gap-7">

              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
                    <Clock3 size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                        Manajemen Kehadiran
                      </p>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-[28px]">
                      Master Data Shift
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Kelola jam masuk, jam pulang, toleransi keterlambatan, dan pengguna yang menggunakan setiap shift.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/admin/presensi/master-shift/tambah")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E3A5F] flex-shrink-0"
                >
                  <Plus size={16} />
                  Tambah Shift
                </button>
              </div>

              {/* =================================================
                  SUMMARY
                  - Mobile: 2 col
                  - sm: 3 col
                  - xl: 5 col
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

              <div className="rounded-xl border border-[#60A5FA]/20 bg-white p-4 shadow-sm 2xl:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="relative flex-1 min-w-0">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari nama shift, kode, atau nama pengguna..."
                      className="h-11 w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] text-slate-500">
                      <SlidersHorizontal size={16} />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="h-11 rounded-lg border border-[#60A5FA]/20 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>

                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className="h-11 rounded-lg border border-[#60A5FA]/20 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                    >
                      <option value="Semua">Semua Pengguna</option>
                      <option value="Guru">Guru</option>
                      <option value="Staff">Staff</option>
                      <option value="Siswa">Siswa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* =================================================
                  LIST
                  - Mobile: 1 col
                  - xl: 2 col
                  - 2xl (≥1536px): 3 col
                  - 3xl (custom ≥1920px): 4 col
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 2xl:gap-6">
                {filteredShifts.map((shift) => {
                  const isActive = shift.status === "Aktif";

                  return (
                    <div
                      key={shift.id}
                      className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm transition-colors hover:border-[#2563EB]/40 flex flex-col"
                    >
                      {/* CARD HEADER */}
                      <div className="border-b border-[#60A5FA]/15 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                                isActive
                                  ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]"
                                  : "bg-slate-50 border-slate-200 text-slate-400"
                              }`}
                            >
                              <Clock3 size={19} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold text-[#0F172A]">
                                  {shift.name}
                                </h2>

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
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/admin/presensi/master-shift/${shift.id}/edit`)
                              }
                              title="Edit shift"
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(shift)}
                              title="Hapus shift"
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-500">
                          {shift.description}
                        </p>
                      </div>

                      {/* TIME */}
                      <div className="grid grid-cols-3 border-b border-[#60A5FA]/15">
                        <TimeBox label="Jam Masuk" value={shift.startTime} />
                        <TimeBox label="Jam Pulang" value={shift.endTime} bordered />
                        <TimeBox
                          label="Toleransi"
                          value={`${shift.tolerance} menit`}
                          highlight
                        />
                      </div>

                      {/* APPLIES TO */}
                      <div className="border-b border-[#60A5FA]/15 p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Berlaku Untuk
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {shift.appliesTo.map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#60A5FA]/25 bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#1E3A5F]"
                            >
                              <span className="text-[#2563EB]">
                                {getCategoryIcon(category)}
                              </span>
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* RULE */}
                      <div className="border-b border-[#60A5FA]/15 bg-[#F8FAFC] p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                            <CalendarClock size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0F172A]">
                              Ketentuan Presensi
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Jam masuk{" "}
                              <b className="text-[#0F172A]">{shift.startTime}</b>.
                              Batas toleransi sampai pukul{" "}
                              <span className="rounded-md bg-[#2563EB]/10 px-1.5 py-0.5 font-bold text-[#2563EB]">
                                {getLateLimit(shift)}
                              </span>
                              . Setelah melewati batas tersebut, kehadiran
                              dicatat sebagai <b className="text-[#0F172A]">Telat</b>.
                            </p>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              Jam pulang mengacu pada waktu selesai shift, yaitu{" "}
                              <b className="text-[#0F172A]">{shift.endTime}</b>.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* USERS — flex-1 biar button nempel bawah */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Pengguna Terhubung
                            </p>
                          </div>
                          <span className="rounded-full border border-[#60A5FA]/25 bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                            {shift.members.length} pengguna
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <CategoryBox
                            icon={<GraduationCap size={14} />}
                            label="Guru"
                            value={getCategoryCount(shift, "Guru")}
                          />
                          <CategoryBox
                            icon={<BriefcaseBusiness size={14} />}
                            label="Staff"
                            value={getCategoryCount(shift, "Staff")}
                          />
                          <CategoryBox
                            icon={<UserRound size={14} />}
                            label="Siswa"
                            value={getCategoryCount(shift, "Siswa")}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/admin/presensi/master-shift/${shift.id}`)
                          }
                          className="mt-auto pt-4 w-full"
                        >
                          <span className="flex items-center justify-center gap-2 rounded-lg border border-[#60A5FA]/25 bg-white py-2.5 text-sm font-semibold text-[#1E3A5F] transition-colors hover:border-[#2563EB] hover:bg-[#2563EB]/5 hover:text-[#2563EB]">
                            Lihat Detail Shift
                            <ChevronRight size={16} />
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredShifts.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-[#60A5FA]/40 bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#60A5FA]/20 bg-[#F8FAFC] text-[#60A5FA]">
                      <Clock3 size={22} />
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
                      Shift tidak ditemukan
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
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

function SummaryCard({ icon: Icon, label, value, description, tone = "blue" }) {
  const tones = {
    blue: "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]",
    emerald: "bg-emerald-50 border-emerald-200/70 text-emerald-600",
  };

  return (
    <div className="rounded-xl border border-[#60A5FA]/20 bg-white p-4 shadow-sm transition-colors hover:border-[#2563EB]/40">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
            {value}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400 truncate">
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

function TimeBox({ label, value, bordered = false, highlight = false }) {
  return (
    <div className={`p-5 ${bordered ? "border-x border-[#60A5FA]/15" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1.5 text-xl font-bold ${
          highlight ? "text-[#2563EB]" : "text-[#0F172A]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CategoryBox({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] p-3 transition-colors hover:border-[#2563EB]/40">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-[#2563EB]">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-lg font-bold text-[#0F172A]">{value}</p>
    </div>
  );
}