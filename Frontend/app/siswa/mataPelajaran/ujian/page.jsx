"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  ArrowLeft,
  GraduationCap,
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  BookOpen,
  Palette,
  Music,
  Dumbbell,
  CalendarClock,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Award,
} from "lucide-react";

const mataPelajaranList = [
  { id: "matematika", nama: "Matematika", guru: "Bu Sari", icon: Calculator, color: "blue" },
  { id: "bindo", nama: "Bahasa Indonesia", guru: "Pak Budi", icon: Languages, color: "rose" },
  { id: "ipa", nama: "IPA", guru: "Bu Dewi", icon: FlaskConical, color: "emerald" },
  { id: "ips", nama: "IPS", guru: "Pak Anwar", icon: Globe2, color: "amber" },
  { id: "binggris", nama: "Bahasa Inggris", guru: "Bu Rina", icon: BookOpen, color: "indigo" },
  { id: "seni", nama: "Seni Budaya", guru: "Bu Wulan", icon: Palette, color: "fuchsia" },
  { id: "musik", nama: "Seni Musik", guru: "Pak Doni", icon: Music, color: "cyan" },
  { id: "penjas", nama: "Penjaskes", guru: "Pak Rudi", icon: Dumbbell, color: "orange" },
];

// status: "mendatang" | "berlangsung" | "selesai"
const STATUS_STYLE = {
  mendatang: { label: "Mendatang", bg: "bg-blue-50", text: "text-blue-600", icon: CalendarClock },
  berlangsung: { label: "Bisa Dikerjakan", bg: "bg-amber-50", text: "text-amber-600", icon: PlayCircle },
  selesai: { label: "Selesai", bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle2 },
};

const ujianList = [
  {
    id: 1,
    mapelId: "matematika",
    judul: "Ulangan Harian Bab 4 - Operasi Pecahan",
    tipe: "Ulangan Harian",
    guru: "Bu Sari",
    tanggal: "25 Agu 2026, 08:00",
    durasi: "60 menit",
    status: "mendatang",
    nilai: null,
  },
  {
    id: 2,
    mapelId: "bindo",
    judul: "Ujian Tengah Semester",
    tipe: "UTS",
    guru: "Pak Budi",
    tanggal: "28 Agu 2026, 09:00",
    durasi: "90 menit",
    status: "mendatang",
    nilai: null,
  },
  {
    id: 3,
    mapelId: "binggris",
    judul: "Quiz Grammar Unit 4",
    tipe: "Kuis",
    guru: "Bu Rina",
    tanggal: "20 Agu 2026, 07:30",
    durasi: "30 menit",
    status: "berlangsung",
    nilai: null,
  },
  {
    id: 4,
    mapelId: "ipa",
    judul: "Ulangan Harian Bab 3 - Ekosistem",
    tipe: "Ulangan Harian",
    guru: "Bu Dewi",
    tanggal: "10 Agu 2026, 08:00",
    durasi: "45 menit",
    status: "selesai",
    nilai: 88,
  },
  {
    id: 5,
    mapelId: "matematika",
    judul: "Ulangan Harian Bab 3 - Aljabar",
    tipe: "Ulangan Harian",
    guru: "Bu Sari",
    tanggal: "5 Agu 2026, 08:00",
    durasi: "60 menit",
    status: "selesai",
    nilai: 76,
  },
  {
    id: 6,
    mapelId: "ips",
    judul: "Kuis Sumber Daya Alam",
    tipe: "Kuis",
    guru: "Pak Anwar",
    tanggal: "2 Agu 2026, 10:00",
    durasi: "20 menit",
    status: "selesai",
    nilai: 95,
  },
];

export default function UjianPage() {
  return (
    <Suspense fallback={null}>
      <UjianPageInner />
    </Suspense>
  );
}

function UjianPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapelParam = searchParams.get("mapel");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMapel, setActiveMapel] = useState(mapelParam || "semua");
  const [activeFilter, setActiveFilter] = useState("semua");

  const selectedMapel = mataPelajaranList.find((m) => m.id === activeMapel);

  const filteredUjian = useMemo(() => {
    return ujianList
      .filter((u) => (activeMapel === "semua" ? true : u.mapelId === activeMapel))
      .filter((u) => (activeFilter === "semua" ? true : u.status === activeFilter));
  }, [activeMapel, activeFilter]);

  const ujianSelesai = ujianList.filter((u) => u.status === "selesai" && u.nilai !== null);
  const rataRata = ujianSelesai.length > 0
    ? Math.round(ujianSelesai.reduce((sum, u) => sum + u.nilai, 0) / ujianSelesai.length)
    : null;
  const jumlahMendatang = ujianList.filter((u) => u.status === "mendatang" || u.status === "berlangsung").length;

  const notifications = [
    { id: 1, title: "Quiz Grammar bisa dikerjakan sekarang", desc: "Bahasa Inggris - Bu Rina", read: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        role="siswa"
        active="mataPelajaran"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Andi Saputra", email: "siswa@smartschool.com", avatar: "AS" }}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-5xl mx-auto space-y-6">

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/siswa/mataPelajaran")}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  {selectedMapel ? selectedMapel.nama : "Semua Mata Pelajaran"}
                </p>
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 mt-1 tracking-tight">
                  Ujian
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Jadwal ujian, kuis, dan hasil yang sudah dinilai.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <CalendarClock size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-slate-900 leading-none">{jumlahMendatang}</p>
                  <p className="text-xs text-slate-500 mt-1">Ujian mendatang</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                  <Award size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-slate-900 leading-none">{rataRata !== null ? rataRata : "-"}</p>
                  <p className="text-xs text-slate-500 mt-1">Rata-rata nilai</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setActiveMapel("semua")}
                className={activeMapel === "semua" ? "flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border bg-slate-800 border-slate-800 text-white" : "flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border bg-white border-slate-200 text-slate-500 hover:border-slate-300"}
              >
                Semua Mapel
              </button>
              {mataPelajaranList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMapel(m.id)}
                  className={activeMapel === m.id ? "flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border bg-slate-800 border-slate-800 text-white" : "flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border bg-white border-slate-200 text-slate-500 hover:border-slate-300"}
                >
                  {m.nama}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {["semua", "mendatang", "berlangsung", "selesai"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={activeFilter === f ? "text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600" : "text-xs font-medium px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"}
                >
                  {f === "semua" ? "Semua Status" : STATUS_STYLE[f].label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredUjian.length > 0 ? (
                filteredUjian.map((ujian) => {
                  const mapel = mataPelajaranList.find((m) => m.id === ujian.mapelId);
                  const s = STATUS_STYLE[ujian.status];
                  const StatusIcon = s.icon;
                  return (
                    <div key={ujian.id} className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 sm:p-5">
                      <div className="flex items-start gap-3.5">
                        <div className={"w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 " + s.bg + " " + s.text}>
                          <GraduationCap size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={"text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-1 " + s.bg + " " + s.text}>
                              <StatusIcon size={10} />
                              {s.label}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {ujian.tipe}
                            </span>
                            {activeMapel === "semua" && mapel ? (
                              <span className="text-[11px] font-medium text-slate-400">{mapel.nama}</span>
                            ) : null}
                          </div>
                          <p className="text-sm font-medium text-slate-800 mt-1.5">{ujian.judul}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {ujian.guru} - {ujian.tanggal} - {ujian.durasi}
                          </p>
                        </div>

                        {ujian.status === "selesai" ? (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-2xl font-bold text-slate-900">{ujian.nilai}</p>
                            <p className="text-[11px] text-slate-400">Nilai</p>
                          </div>
                        ) : ujian.status === "berlangsung" ? (
                          <button className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors rounded-lg px-3 py-2">
                            Kerjakan
                            <ChevronRight size={13} />
                          </button>
                        ) : (
                          <div className="flex-shrink-0 mt-1 text-slate-300">
                            <ChevronRight size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm text-center py-14 px-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3">
                    <GraduationCap size={22} />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Tidak ada ujian</p>
                  <p className="text-xs text-slate-400 mt-1">Tidak ada ujian yang cocok dengan filter ini.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}