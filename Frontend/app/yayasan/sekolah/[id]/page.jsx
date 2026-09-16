"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { apiFetch } from "../../../../lib/api"; // sesuaikan path kalau beda
import {
  School,
  ArrowLeft,
  Phone,
  Mail,
  Users,
  GraduationCap,
  Layers,
  BadgeCheck,
  Sparkles,
  CalendarClock,
} from "lucide-react";

export default function DetailSekolahPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch(`/yayasan/sekolah/${id}`);
        if (res) setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const notifications = [
    { id: 1, title: "Pengumuman Libur Semester", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Deadline Input Nilai", desc: "Dikirim 5 jam lalu", read: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        role="yayasan"
        active="sekolah"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Admin Yayasan", email: "admin@smartschool.com", avatar: "Y" }}
        />
        <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* BACK LINK */}
            <Link
              href="/yayasan/sekolah"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={15} />
              Kembali ke Daftar Sekolah
            </Link>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                Gagal memuat detail sekolah: {error}
              </div>
            )}

            {/* LOADING SKELETON */}
            {loading && (
              <div className="space-y-6">
                <div className="h-24 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-white rounded-xl border border-slate-200/80 animate-pulse" />
                  ))}
                </div>
              </div>
            )}

            {/* NOT FOUND */}
            {!loading && !error && !data && (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-10 text-center">
                <School size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">Sekolah tidak ditemukan.</p>
              </div>
            )}

            {/* CONTENT */}
            {!loading && !error && data && (() => {
              const { profil, statistik } = data;
              const langganan = profil.langgananSekolah?.[0];

              return (
                <>
                  {/* PAGE HEADER */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                          <School size={26} />
                        </div>
                        <div className="min-w-0">
                          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                            {profil.nama}
                          </h1>
                          <p className="text-sm text-slate-400 mt-0.5 truncate">{profil.subdomain}</p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span
                              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border capitalize ${
                                profil.status === "aktif"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-amber-50 text-amber-600 border-amber-200"
                              }`}
                            >
                              {profil.status}
                            </span>
                            {langganan?.paket?.nama && (
                              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                                Paket {langganan.paket.nama}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATISTIK */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={GraduationCap} label="Total Guru" value={statistik.totalGuru} color="blue" />
                    <StatCard icon={Users} label="Total Siswa" value={statistik.totalSiswa} color="emerald" />
                    <StatCard icon={Layers} label="Total Kelas" value={statistik.totalKelas} color="amber" />
                  </div>

                  {/* INFO SEKOLAH + LANGGANAN */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2.5 p-4 sm:p-5 border-b border-slate-100">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700">Informasi Sekolah</h3>
                      </div>
                      <div className="p-4 sm:p-5 space-y-3">
                        <InfoRow icon={Phone} label="Telepon" value={profil.telepon || "-"} />
                        <InfoRow icon={Mail} label="Email" value={profil.email || "-"} />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2.5 p-4 sm:p-5 border-b border-slate-100">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">
                          <BadgeCheck size={16} />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700">Langganan Aktif</h3>
                      </div>
                      <div className="p-4 sm:p-5 space-y-3">
                        {langganan ? (
                          <>
                            <InfoRow icon={BadgeCheck} label="Paket" value={langganan.paket?.nama || "-"} />
                            <InfoRow
                              icon={CalendarClock}
                              label="Berakhir Pada"
                              value={
                                langganan.tanggalBerakhir
                                  ? new Date(langganan.tanggalBerakhir).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "-"
                              }
                            />
                            <InfoRow icon={Sparkles} label="Status Langganan" value={langganan.statusLangganan || "-"} />
                          </>
                        ) : (
                          <p className="text-sm text-slate-400">Belum ada data langganan.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-800">{value ?? "-"}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon size={15} className="text-slate-400 flex-shrink-0" />
      <span className="text-slate-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-slate-700 font-medium truncate">{value}</span>
    </div>
  );
}