"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getSesiKonseling } from "@/services/bk.service";

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

        if (!item) {
          throw new Error("Data sesi konseling tidak ditemukan.");
        }

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
    if (status === "selesai") {
      return "theme-success";
    }

    if (status === "berlangsung") {
      return "theme-info";
    }

    if (status === "dibatalkan") {
      return "theme-danger";
    }

    return "theme-warning";
  }

  function initials(name) {
    if (!name) return "?";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-7">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* PAGE HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="
                    theme-card theme-text-muted theme-border
                    mt-1 flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-lg border
                    transition
                    hover:opacity-80
                  "
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex items-start gap-3">
                  <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h1 className="theme-text text-2xl font-bold tracking-tight">
                      Detail Sesi Konseling
                    </h1>

                    <p className="theme-text-muted mt-1 text-sm font-medium">
                      Informasi lengkap sesi konseling
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/bk/sesi-konseling/${id}/edit`)
                }
                className="
                  theme-primary
                  inline-flex items-center gap-2
                  rounded-lg
                  px-4 py-2.5
                  text-sm font-bold
                  shadow-sm
                  transition
                "
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
                Edit Sesi
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="theme-danger mb-5 rounded-lg border px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="theme-card theme-border rounded-xl border p-12 text-center shadow-sm">
                <div className="theme-text-muted inline-flex items-center gap-2 text-sm font-medium">
                  <span className="border-theme-border h-4 w-4 animate-spin rounded-full border-2 border-t-[var(--color-primary)]" />
                  Memuat data...
                </div>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">

                {/* KONTEN UTAMA */}
                <div className="space-y-5">

                  {/* RINGKASAN */}
                  <div className="theme-card theme-border rounded-xl border p-6 shadow-sm">
                    <div className="theme-border-soft flex items-start justify-between gap-4 border-b pb-5">
                      <div className="flex items-center gap-3">
                        <div className="theme-info flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold ring-1">
                          {initials(
                            data.siswa?.namaLengkap || data.siswaId
                          )}
                        </div>

                        <div>
                          <h2 className="theme-text text-lg font-bold">
                            {data.siswa?.namaLengkap || data.siswaId}
                          </h2>

                          <p className="theme-text-muted text-sm font-medium">
                            {data.siswa?.nis
                              ? `NIS ${data.siswa.nis}`
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(
                          data.status
                        )}`}
                      >
                        {statusLabel(data.status)}
                      </span>
                    </div>

                    <div className="grid gap-4 pt-5 md:grid-cols-2">
                      <DetailBox
                        label="Konselor"
                        value={
                          data.konselor?.namaLengkap ||
                          data.konselorId ||
                          "-"
                        }
                      />

                      <DetailBox
                        label="Topik"
                        value={data.topik}
                      />

                      <DetailBox
                        label="Tanggal"
                        value={formatTanggal(data.tanggal)}
                      />

                      <DetailBox
                        label="Waktu"
                        value={`${data.waktuMulai || "-"} ${
                          data.waktuSelesai
                            ? `- ${data.waktuSelesai}`
                            : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* MASALAH */}
                  <SectionCard title="Masalah">
                    <p className="theme-text-secondary text-sm leading-6">
                      {data.masalah || "-"}
                    </p>
                  </SectionCard>

                  {/* HASIL */}
                  <SectionCard title="Hasil">
                    <p className="theme-text-secondary text-sm leading-6">
                      {data.hasil || "-"}
                    </p>
                  </SectionCard>

                  {/* TINDAK LANJUT */}
                  <SectionCard title="Tindak Lanjut">
                    <p className="theme-text-secondary text-sm leading-6">
                      {data.tindakLanjut || "-"}
                    </p>
                  </SectionCard>

                  {/* CATATAN */}
                  <SectionCard title="Catatan">
                    <p className="theme-text-secondary text-sm leading-6">
                      {data.catatan || "-"}
                    </p>
                  </SectionCard>
                </div>

                {/* SIDE CARD */}
                <aside className="space-y-5">

                  {/* INFO CARD */}
                  <div className="theme-card theme-border rounded-xl border p-5 shadow-sm">
                    <h3 className="theme-text-muted mb-4 text-sm font-bold uppercase tracking-wider">
                      Info Sesi
                    </h3>

                    <div className="space-y-3.5">
                      <InfoRow
                        icon="id"
                        label="ID Sesi"
                        value={`#${data.id}`}
                      />

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
                            ? `${data.waktuMulai}${
                                data.waktuSelesai
                                  ? ` - ${data.waktuSelesai}`
                                  : ""
                              }`
                            : "-"
                        }
                      />

                      <InfoRow
                        icon="user"
                        label="Konselor"
                        value={
                          data.konselor?.namaLengkap ||
                          data.konselorId ||
                          "-"
                        }
                      />
                    </div>
                  </div>

                  {/* STATUS CARD */}
                  <div className="theme-card theme-border rounded-xl border p-5 shadow-sm">
                    <h3 className="theme-text-muted mb-3 text-sm font-bold uppercase tracking-wider">
                      Status Sesi
                    </h3>

                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(
                        data.status
                      )}`}
                    >
                      {statusLabel(data.status)}
                    </span>

                    <p className="theme-text-muted mt-3 text-xs leading-5">
                      {data.status === "selesai" &&
                        "Sesi konseling telah selesai dilaksanakan."}

                      {data.status === "berlangsung" &&
                        "Sesi konseling sedang berlangsung."}

                      {data.status === "dijadwalkan" &&
                        "Sesi konseling akan dilaksanakan."}

                      {data.status === "dibatalkan" &&
                        "Sesi konseling telah dibatalkan."}
                    </p>
                  </div>

                  {/* AKSI CARD */}
                  <div className="theme-card theme-border rounded-xl border p-5 shadow-sm">
                    <h3 className="theme-text-muted mb-3 text-sm font-bold uppercase tracking-wider">
                      Aksi Cepat
                    </h3>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/bk/sesi-konseling/${id}/edit`
                          )
                        }
                        className="
                          theme-primary
                          flex w-full items-center justify-center gap-2
                          rounded-lg
                          px-4 py-2.5
                          text-sm font-bold
                          transition
                        "
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                          />
                        </svg>
                        Edit Sesi
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push("/admin/bk/sesi-konseling")
                        }
                        className="
                          theme-card theme-border theme-text
                          flex w-full items-center justify-center gap-2
                          rounded-lg border
                          px-4 py-2.5
                          text-sm font-bold
                          transition
                          hover:opacity-80
                        "
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

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({ label, value }) {
  return (
    <div className="theme-card-soft theme-border-soft rounded-lg border px-4 py-3">
      <p className="theme-text-muted text-xs font-bold uppercase tracking-wider">
        {label}
      </p>

      <p className="theme-text mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({ title, children }) {
  return (
    <div className="theme-card theme-border rounded-xl border p-6 shadow-sm">
      <h3 className="theme-text-muted mb-3 text-sm font-bold uppercase tracking-wider">
        {title}
      </h3>

      {children}
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({ icon, label, value }) {
  const icons = {
    id: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
      />
    ),

    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),

    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),

    user: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
  };

  return (
    <div className="flex items-center gap-3">
      <div className="theme-card-soft theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          {icons[icon]}
        </svg>
      </div>

      <div className="min-w-0">
        <p className="theme-text-muted text-xs font-medium">
          {label}
        </p>

        <p className="theme-text truncate text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}