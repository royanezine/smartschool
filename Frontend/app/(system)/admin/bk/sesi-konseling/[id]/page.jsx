"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import { getSesiKonseling } from "../../../../../../services/bk.service";

export default function DetailSesiKonselingPage() {
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
        const result = await getSesiKonseling();
        const list = Array.isArray(result) ? result : [];
        const item = list.find((x) => String(x.id) === String(id));
        if (!item) throw new Error("Data sesi konseling tidak ditemukan.");
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

  function statusLabel(status) {
    const map = {
      dijadwalkan: "Dijadwalkan",
      berlangsung: "Berlangsung",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };
    return map[status] || status || "-";
  }

  function statusClass(status) {
    if (status === "selesai")
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    if (status === "berlangsung")
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    if (status === "dibatalkan")
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-7">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* PAGE HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => router.back()}
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Detail Sesi Konseling
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Informasi lengkap sesi konseling
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/admin/bk/sesi-konseling/${id}/edit`)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Sesi
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  Memuat data...
                </div>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
                {/* KONTEN UTAMA */}
                <div className="space-y-5">
                  {/* RINGKASAN */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-bold text-blue-600 ring-1 ring-blue-100">
                          {initials(data.siswa?.namaLengkap || data.siswaId)}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">
                            {data.siswa?.namaLengkap || data.siswaId}
                          </h2>
                          <p className="text-sm font-medium text-slate-500">
                            {data.siswa?.nis ? `NIS ${data.siswa.nis}` : "—"}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(data.status)}`}>
                        {statusLabel(data.status)}
                      </span>
                    </div>

                    <div className="grid gap-4 pt-5 md:grid-cols-2">
                      <DetailBox label="Konselor" value={data.konselor?.namaLengkap || data.konselorId || "-"} />
                      <DetailBox label="Topik" value={data.topik} />
                      <DetailBox label="Tanggal" value={formatTanggal(data.tanggal)} />
                      <DetailBox
                        label="Waktu"
                        value={`${data.waktuMulai || "-"} ${data.waktuSelesai ? `- ${data.waktuSelesai}` : ""}`}
                      />
                    </div>
                  </div>

                  {/* MASALAH */}
                  <SectionCard title="Masalah">
                    <p className="text-sm leading-6 text-slate-700">{data.masalah || "-"}</p>
                  </SectionCard>

                  {/* HASIL */}
                  <SectionCard title="Hasil">
                    <p className="text-sm leading-6 text-slate-700">{data.hasil || "-"}</p>
                  </SectionCard>

                  {/* TINDAK LANJUT */}
                  <SectionCard title="Tindak Lanjut">
                    <p className="text-sm leading-6 text-slate-700">{data.tindakLanjut || "-"}</p>
                  </SectionCard>

                  {/* CATATAN */}
                  <SectionCard title="Catatan">
                    <p className="text-sm leading-6 text-slate-700">{data.catatan || "-"}</p>
                  </SectionCard>
                </div>

                {/* SIDE CARD */}
                <aside className="space-y-5">
                  {/* INFO CARD */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                      Info Sesi
                    </h3>

                    <div className="space-y-3.5">
                      <InfoRow icon="id" label="ID Sesi" value={`#${data.id}`} />
                      <InfoRow
                        icon="calendar"
                        label="Tanggal"
                        value={formatTanggal(data.tanggal)}
                      />
                      <InfoRow
                        icon="clock"
                        label="Waktu"
                        value={
                          data.waktuMulai
                            ? `${data.waktuMulai}${data.waktuSelesai ? ` - ${data.waktuSelesai}` : ""}`
                            : "-"
                        }
                      />
                      <InfoRow
                        icon="user"
                        label="Konselor"
                        value={data.konselor?.namaLengkap || data.konselorId || "-"}
                      />
                    </div>
                  </div>

                  {/* STATUS CARD */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                      Status Sesi
                    </h3>
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(data.status)}`}>
                      {statusLabel(data.status)}
                    </span>
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      {data.status === "selesai" && "Sesi konseling telah selesai dilaksanakan."}
                      {data.status === "berlangsung" && "Sesi konseling sedang berlangsung."}
                      {data.status === "dijadwalkan" && "Sesi konseling akan dilaksanakan."}
                      {data.status === "dibatalkan" && "Sesi konseling telah dibatalkan."}
                    </p>
                  </div>

                  {/* AKSI CARD */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                      Aksi Cepat
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push(`/admin/bk/sesi-konseling/${id}/edit`)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Sesi
                      </button>
                      <button
                        onClick={() => router.push("/admin/bk/sesi-konseling")}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
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

function DetailBox({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  const icons = {
    id: <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}