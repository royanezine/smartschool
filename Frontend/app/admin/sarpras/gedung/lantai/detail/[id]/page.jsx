"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers3,
  CalendarDays,
  School,
  Hash,
  Pencil,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  getGedung,
  getLantaiByGedung,
} from "../../../../../../../services/infrastruktur.service";

export default function DetailLantaiPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [data, setData] = useState(null);
  const [gedung, setGedung] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  async function loadDetail() {
    try {
      setLoading(true);
      setError("");

      const gedungResult = await getGedung();

      if (!gedungResult?.success) {
        throw new Error(
          gedungResult?.message ||
            "Gagal mengambil data gedung."
        );
      }

      const gedungList = gedungResult.data || [];

      let foundLantai = null;
      let foundGedung = null;

      for (const item of gedungList) {
        const result = await getLantaiByGedung(item.id);

        if (!result?.success) {
          continue;
        }

        const lantaiList = result.data || [];

        const found = lantaiList.find(
          (lantai) => String(lantai.id) === String(id)
        );

        if (found) {
          foundLantai = found;
          foundGedung = item;
          break;
        }
      }

      if (!foundLantai) {
        throw new Error("Data lantai tidak ditemukan.");
      }

      setData(foundLantai);
      setGedung(foundGedung);
    } catch (err) {
      console.error(err);

      setError(
        err?.message || "Gagal mengambil detail lantai."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={false}
          setCollapsed={() => {}}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 size={34} className="animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-600">
                Memuat detail lantai...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={false}
          setCollapsed={() => {}}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6">
            <div className="w-full max-w-2xl">
              <button
                onClick={() =>
                  router.push("/admin/sarpras/gedung/lantai")
                }
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft size={17} />
                Kembali
              </button>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle size={21} className="mt-0.5 text-red-500" />
                  <div>
                    <h2 className="font-semibold text-red-800">
                      Data tidak ditemukan
                    </h2>
                    <p className="mt-1 text-sm text-red-700">
                      {error || "Data lantai tidak tersedia."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const kelas = Array.isArray(data.kelas) ? data.kelas : [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
      {/* SIDEBAR */}
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={() => {}}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-6xl space-y-6">
              {/* HEADER SECTION */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <button
                    onClick={() =>
                      router.push("/admin/sarpras/gedung/lantai")
                    }
                    className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Data Lantai
                  </button>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Detail Lantai
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Informasi lengkap lantai dan kelas yang menggunakannya.
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(`/admin/sarpras/lantai/edit/${data.id}`)
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(37,99,235,0.25)] transition-all hover:shadow-[0_9px_22px_rgba(37,99,235,0.35)] hover:brightness-105 active:scale-[0.98]"
                >
                  <Pencil size={17} />
                  Edit Lantai
                </button>
              </div>

              {/* OVERVIEW CARDS */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* NAMA */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]">
                    <Layers3 size={20} />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                    Nama Lantai
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {data.nama || "-"}
                  </h2>
                </div>

                {/* GEDUNG */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
                    <Building2 size={20} />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                    Gedung
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {gedung?.nama || "-"}
                  </h2>
                  {gedung?.kode && (
                    <p className="mt-1 text-xs text-slate-500">
                      Kode: {gedung.kode}
                    </p>
                  )}
                </div>

                {/* JUMLAH KELAS */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]">
                    <School size={20} />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                    Jumlah Kelas
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {kelas.length}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    kelas menggunakan lantai ini
                  </p>
                </div>
              </div>

              {/* DETAIL INFORMATION */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5 sm:px-8">
                  <h2 className="text-base font-semibold text-slate-900">
                    Informasi Lantai
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Detail data yang tersimpan pada sistem.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2">
                  {/* ID */}
                  <div className="flex gap-4 border-b border-slate-100 p-5 sm:border-r">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Hash size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                        ID Lantai
                      </p>
                      <p className="mt-1 break-all font-mono text-sm font-medium text-slate-700">
                        {data.id}
                      </p>
                    </div>
                  </div>

                  {/* GEDUNG ID */}
                  <div className="flex gap-4 border-b border-slate-100 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Building2 size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                        ID Gedung
                      </p>
                      <p className="mt-1 break-all font-mono text-sm font-medium text-slate-700">
                        {data.gedungId || gedung?.id || "-"}
                      </p>
                    </div>
                  </div>

                  {/* TANGGAL */}
                  <div className="flex gap-4 border-b border-slate-100 p-5 sm:border-r sm:border-b-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <CalendarDays size={19} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                        Dibuat Pada
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(data.dibuatPada)}
                      </p>
                    </div>
                  </div>

                  {/* TOTAL KELAS */}
                  <div className="flex gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Users size={19} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                        Total Kelas
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {kelas.length} kelas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KELAS TABLE */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Kelas di Lantai Ini
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Daftar kelas yang terhubung dengan lantai.
                    </p>
                  </div>
                  <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    <School size={16} />
                    {kelas.length} Kelas
                  </div>
                </div>

                {kelas.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <School size={28} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-700">
                      Belum ada kelas
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Belum ada kelas yang menggunakan lantai ini.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            No
                          </th>
                          <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Nama Kelas
                          </th>
                          <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Tingkat
                          </th>
                          <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            ID Kelas
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {kelas.map((item, index) => (
                          <tr
                            key={item.id}
                            className="transition-colors hover:bg-slate-50/70"
                          >
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                  <School size={17} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                  {item.nama || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {item.tingkat || "-"}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-slate-500">
                                {item.id}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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