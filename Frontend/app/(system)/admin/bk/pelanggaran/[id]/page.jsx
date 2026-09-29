"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import { getPelanggaranSiswa } from "../../../../../../services/bk.service";

export default function DetailPelanggaranPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await getPelanggaranSiswa();
        const list = Array.isArray(result) ? result : [];
        const item = list.find((x) => String(x.id) === String(id));
        if (!item) throw new Error("Data pelanggaran tidak ditemukan.");
        setData(item);
      } catch (err) {
        setError(err?.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  function formatTanggal(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function statusClass(status) {
    const s = (status || "").toLowerCase();
    if (s === "ditindaklanjuti" || s === "selesai")
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    if (s === "proses") return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* PAGE HEADER */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => router.back()}
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">
                      Detail Pelanggaran
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Informasi lengkap pelanggaran siswa
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/admin/bk/pelanggaran/${id}/edit`)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700 shadow-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/40">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  Memuat data...
                </div>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-5">
                  {/* HERO CARD */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500" />

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
                            {initials(data.siswa?.namaLengkap || data.siswaId)}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">
                              {data.siswa?.namaLengkap || data.siswaId}
                            </h2>
                            <p className="text-sm font-medium text-slate-500">
                              {data.siswa?.nis ? `NIS ${data.siswa.nis}` : "—"}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(data.status)}`}>
                          {data.status || "-"}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <DetailBox icon="alert" label="Kategori" value={data.kategoriPelanggaran?.nama || "-"} />
                        <DetailBox icon="star" label="Poin" value={`${data.poin ?? 0} poin`} />
                        <DetailBox icon="calendar" label="Tanggal" value={formatTanggal(data.tanggal)} />
                        <DetailBox icon="note" label="Status" value={data.status || "-"} />
                      </div>
                    </div>
                  </div>

                  <SectionCard icon="note" tone="slate" title="Kronologi">
                    <p className="text-sm leading-6 text-slate-900">{data.kronologi || "-"}</p>
                  </SectionCard>

                  <SectionCard icon="arrow" tone="blue" title="Tindak Lanjut">
                    <p className="text-sm leading-6 text-slate-900">{data.tindakLanjut || "-"}</p>
                  </SectionCard>

                  <SectionCard icon="note" tone="amber" title="Catatan">
                    <p className="text-sm leading-6 text-slate-900">{data.catatan || "-"}</p>
                  </SectionCard>
                </div>

                <aside className="space-y-5">
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Info Pelanggaran
                      </h3>
                    </div>

                    <div className="space-y-3.5">
                      <InfoRow icon="id" label="ID" value={`#${data.id}`} />
                      <InfoRow icon="calendar" label="Tanggal" value={formatTanggal(data.tanggal)} />
                      <InfoRow icon="star" label="Poin" value={`${data.poin ?? 0} poin`} />
                      <InfoRow icon="alert" label="Kategori" value={data.kategoriPelanggaran?.nama || "-"} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Aksi Cepat
                    </h3>

                    <div className="space-y-2">
                      <button
                        onClick={() => router.push(`/admin/bk/pelanggaran/${id}/edit`)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/30"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() => router.push("/admin/bk/pelanggaran")}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Daftar
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function DetailBox({ icon, label, value }) {
  const icons = {
    alert: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3l-6.93-12a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    note: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function SectionCard({ icon, tone = "slate", title, children }) {
  const tones = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    slate: { bg: "bg-slate-100", text: "text-slate-600" },
  };
  const t = tones[tone] || tones.slate;
  const icons = {
    note: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    arrow: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.bg} ${t.text}`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {icons[icon]}
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  const icons = {
    id: <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    alert: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3l-6.93-12a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />,
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-500 ring-1 ring-slate-200/60">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}