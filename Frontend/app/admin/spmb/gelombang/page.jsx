"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  Plus,
  CalendarDays,
  Users,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock3,
  XCircle,
  MoreHorizontal,
  X,
} from "lucide-react";

const GELOMBANG = [
  {
    id: 1,
    nama: "Gelombang 1",
    mulai: "01 Agustus 2026",
    selesai: "31 Agustus 2026",
    kuota: 100,
    pendaftar: 100,
    status: "Selesai",
    keterangan:
      "Gelombang pendaftaran tahap pertama.",
  },
  {
    id: 2,
    nama: "Gelombang 2",
    mulai: "01 September 2026",
    selesai: "30 September 2026",
    kuota: 200,
    pendaftar: 148,
    status: "Aktif",
    keterangan:
      "Gelombang pendaftaran utama tahun ajaran 2026/2027.",
  },
  {
    id: 3,
    nama: "Gelombang 3",
    mulai: "01 Oktober 2026",
    selesai: "31 Oktober 2026",
    kuota: 100,
    pendaftar: 0,
    status: "Belum Dibuka",
    keterangan:
      "Gelombang terakhir penerimaan siswa baru.",
  },
];

export default function GelombangPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setCollapsed((v) => !v)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col p-4 sm:p-5 lg:p-6">
            {/* HEADER */}

            <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ff]">
                  <CalendarDays
                    size={20}
                    className="text-[#155DFC]"
                  />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Gelombang Pendaftaran
                  </h1>

                  <p className="text-xs text-slate-500">
                    Kelola periode dan kuota setiap gelombang
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(
                    "/admin/spmb/gelombang/tambah"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0d47c9]"
              >
                <Plus size={16} />
                Tambah Gelombang
              </button>
            </div>

            {/* SUMMARY */}

            <div className="mb-5 grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
              <Summary
                title="Total Gelombang"
                value="3"
                icon={CalendarDays}
              />

              <Summary
                title="Gelombang Aktif"
                value="1"
                icon={CheckCircle2}
              />

              <Summary
                title="Total Kuota"
                value="400"
                icon={Users}
              />

              <Summary
                title="Total Pendaftar"
                value="248"
                icon={Clock3}
              />
            </div>

            {/* CONTENT */}

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="grid gap-4 xl:grid-cols-3">
                {GELOMBANG.map((item) => {
                  const percent =
                    item.kuota > 0
                      ? Math.round(
                          (item.pendaftar /
                            item.kuota) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border bg-white p-5 shadow-sm ${
                        item.status === "Aktif"
                          ? "border-[#c7dbff]"
                          : "border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-800">
                              {item.nama}
                            </h2>

                            {item.status ===
                              "Aktif" && (
                              <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                                AKTIF
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {item.keterangan}
                          </p>
                        </div>

                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal size={17} />
                        </button>
                      </div>

                      <div className="mt-5 rounded-lg bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="text-[#155DFC]"
                          />

                          <div>
                            <p className="text-[10px] text-slate-400">
                              Periode
                            </p>

                            <p className="text-xs font-semibold text-slate-700">
                              {item.mulai}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              sampai {item.selesai}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Penggunaan Kuota
                          </span>

                          <span className="text-xs font-bold text-slate-700">
                            {item.pendaftar}/
                            {item.kuota}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#155DFC]"
                            style={{
                              width: `${Math.min(
                                percent,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="mt-1 text-right text-[10px] text-slate-400">
                          {percent}% terisi
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span
                          className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold ${
                            item.status ===
                            "Aktif"
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : item.status ===
                                "Selesai"
                              ? "border-slate-200 bg-slate-100 text-slate-500"
                              : "border-amber-100 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>

                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              setSelected(item)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() =>
                              router.push(
                                `/admin/spmb/gelombang/${item.id}/edit`
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* DETAIL MODAL */}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Detail Gelombang
                </h2>
                <p className="text-xs text-slate-400">
                  Informasi periode penerimaan
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-[#f5f8ff] p-4">
                <p className="text-lg font-bold text-slate-800">
                  {selected.nama}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {selected.mulai} — {selected.selesai}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Info
                  label="Kuota"
                  value={`${selected.kuota} siswa`}
                />

                <Info
                  label="Pendaftar"
                  value={`${selected.pendaftar} siswa`}
                />

                <Info
                  label="Status"
                  value={selected.status}
                />

                <Info
                  label="Sisa Kuota"
                  value={`${Math.max(
                    selected.kuota -
                      selected.pendaftar,
                    0
                  )} siswa`}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-5 py-4">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf1ff]">
          <Icon
            size={18}
            className="text-[#155DFC]"
          />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}