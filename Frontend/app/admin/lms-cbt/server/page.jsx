"use client";

import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Server,
  Users,
  MonitorCheck,
  Wifi,
  Clock3,
  CircleCheck,
  CircleAlert,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const serverStats = [
  {
    title: "CPU Usage",
    value: "42%",
    status: "Normal",
    icon: Cpu,
    progress: 42,
  },
  {
    title: "Memory Usage",
    value: "6.8 GB / 16 GB",
    status: "Normal",
    icon: MemoryStick,
    progress: 43,
  },
  {
    title: "Storage",
    value: "128 GB / 500 GB",
    status: "Normal",
    icon: HardDrive,
    progress: 26,
  },
  {
    title: "Network",
    value: "24.8 Mbps",
    status: "Stabil",
    icon: Network,
    progress: 68,
  },
];

const activeExams = [
  {
    id: 1,
    exam: "Ujian Tengah Semester",
    subject: "Pemrograman Web",
    className: "XII PPLG 1",
    participants: 32,
    online: 29,
    duration: "08:00 - 09:30",
    status: "Berlangsung",
  },
  {
    id: 2,
    exam: "Ujian Praktik Basis Data",
    subject: "Basis Data",
    className: "XII PPLG 2",
    participants: 30,
    online: 30,
    duration: "08:00 - 09:00",
    status: "Berlangsung",
  },
  {
    id: 3,
    exam: "Quiz HTML & CSS",
    subject: "Pemrograman Web",
    className: "XI PPLG 1",
    participants: 31,
    online: 0,
    duration: "09:00 - 09:30",
    status: "Selesai",
  },
];

const activities = [
  {
    title: "Server CBT berjalan normal",
    time: "2 menit lalu",
    type: "success",
  },
  {
    title: "29 siswa sedang mengikuti ujian",
    time: "5 menit lalu",
    type: "info",
  },
  {
    title: "Backup data ujian berhasil",
    time: "18 menit lalu",
    type: "success",
  },
  {
    title: "Peningkatan traffic terdeteksi",
    time: "32 menit lalu",
    type: "warning",
  },
];

export default function ServerCbtPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
            <span>CBT</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              Kapasitas & Server
            </span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Kapasitas & Server CBT
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Monitoring kondisi server dan aktivitas ujian CBT
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

              <span className="text-sm font-medium text-emerald-700">
                Server Online
              </span>
            </div>
          </div>

          {/* Server Overview */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Server size={24} className="text-slate-700" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    SmartSchool CBT Server
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Server utama sistem ujian
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-400">
                  Uptime
                </p>

                <p className="font-semibold text-slate-700 mt-1">
                  14 Hari 08 Jam
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {serverStats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        {item.title}
                      </p>

                      <p className="text-xl font-bold text-slate-800 mt-2">
                        {item.value}
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon size={20} className="text-slate-600" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-700 rounded-full"
                        style={{
                          width: `${item.progress}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">
                        Penggunaan
                      </span>

                      <span className="text-xs font-medium text-emerald-600">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Online Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SummaryCard
              icon={Users}
              title="Siswa Online"
              value="59"
              description="Siswa sedang terhubung"
            />

            <SummaryCard
              icon={MonitorCheck}
              title="Ujian Aktif"
              value="2"
              description="Sesi ujian berlangsung"
            />

            <SummaryCard
              icon={Wifi}
              title="Koneksi Aktif"
              value="61"
              description="Perangkat terhubung"
            />
          </div>

          {/* Active Exams + Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Active Exams */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">
                    Aktivitas Ujian
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Ujian yang sedang berjalan di server
                  </p>
                </div>

                <Activity
                  size={20}
                  className="text-slate-500"
                />
              </div>

              <div className="divide-y divide-slate-100">
                {activeExams.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">
                            {item.exam}
                          </h3>

                          <StatusBadge status={item.status} />
                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                          {item.subject} • {item.className}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock3 size={14} />
                            {item.duration}
                          </span>

                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {item.participants} peserta
                          </span>
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-xs text-slate-400">
                          Online
                        </p>

                        <p className="text-lg font-bold text-slate-800 mt-1">
                          {item.online}
                          <span className="text-sm font-normal text-slate-400">
                            {" "}
                            / {item.participants}
                          </span>
                        </p>

                        <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-2 lg:ml-auto overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${
                                item.participants
                                  ? (item.online / item.participants) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Server Activity */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">
                    Aktivitas Server
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Aktivitas terbaru
                  </p>
                </div>

                <RefreshCw
                  size={18}
                  className="text-slate-400"
                />
              </div>

              <div className="p-5">
                <div className="space-y-5">
                  {activities.map((item, index) => {
                    const isWarning = item.type === "warning";

                    return (
                      <div
                        key={index}
                        className="flex gap-3"
                      >
                        <div className="mt-0.5 shrink-0">
                          {isWarning ? (
                            <CircleAlert
                              size={18}
                              className="text-amber-500"
                            />
                          ) : (
                            <CircleCheck
                              size={18}
                              className="text-emerald-500"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700">
                            {item.title}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Server Info */}
          <div className="mt-6 bg-slate-800 rounded-xl p-5 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Server size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Sistem CBT berjalan normal
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    Tidak ada gangguan pada layanan ujian saat ini.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Semua sistem normal
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon size={21} className="text-slate-600" />
        </div>

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="text-xl font-bold text-slate-800 mt-1">
            {value}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const selesai = status === "Selesai";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-medium ${
        selesai
          ? "bg-violet-50 text-violet-700 border-violet-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          selesai ? "bg-violet-500" : "bg-emerald-500"
        }`}
      />

      {status}
    </span>
  );
}