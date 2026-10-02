"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getAsesmenMinatBakat } from "@/services/bk.service";

export default function DetailAsesmenPage() {
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

        const result = await getAsesmenMinatBakat();
        const list = Array.isArray(result) ? result : [];

        const item = list.find(
          (x) => String(x.id) === String(id)
        );

        if (!item) {
          throw new Error(
            "Data asesmen tidak ditemukan."
          );
        }

        setData(item);
      } catch (err) {
        setError(
          err?.message || "Gagal memuat data."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  /* =========================================================
     FORMAT TANGGAL
  ========================================================= */

  function formatTanggal(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  /* =========================================================
     INITIALS
  ========================================================= */

  function initials(name) {
    if (!name) return "?";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[1][0]
    ).toUpperCase();
  }

  /* =========================================================
     STATUS THEME
  ========================================================= */

  function statusClass(status) {
    const s = (status || "").toLowerCase();

    if (s === "selesai") {
      return "theme-success";
    }

    if (s === "proses") {
      return "theme-info";
    }

    if (s === "dibatalkan") {
      return "theme-danger";
    }

    return "theme-warning";
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="admin"
        active="bk"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="theme-page flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">

                {/* BACK */}

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="theme-card theme-border theme-text-secondary theme-header-hover mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition"
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

                <div className="flex items-start gap-4">

                  {/* ICON */}

                  <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg">
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
                    <h1 className="theme-text text-[26px] font-bold leading-tight tracking-tight">
                      Detail Asesmen
                    </h1>

                    <p className="theme-text-muted mt-1 text-sm font-medium">
                      Informasi lengkap asesmen minat &amp; bakat
                    </p>
                  </div>
                </div>
              </div>

              {/* EDIT */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/admin/bk/asesment-minat-bakat/${id}/edit`
                  )
                }
                className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition"
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

                Edit
              </button>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="theme-danger theme-border mb-6 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm">
                {error}
              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div className="theme-card theme-border rounded-2xl border p-12 text-center shadow-xl">
                <div className="theme-text-muted inline-flex items-center gap-2 text-sm font-medium">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />

                  Memuat data...
                </div>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

                {/* =================================================
                    LEFT CONTENT
                ================================================= */}

                <div className="space-y-5">

                  {/* =================================================
                      HERO CARD
                  ================================================= */}

                  <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-xl">

                    {/* TOP LINE */}

                    <div className="h-1.5 w-full bg-[var(--color-primary)]" />

                    <div className="p-6">

                      {/* STUDENT HEADER */}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">

                          {/* AVATAR */}

                          <div className="theme-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-lg">
                            {initials(
                              data.siswa
                                ?.namaLengkap ||
                                data.siswaId
                            )}
                          </div>

                          <div>
                            <h2 className="theme-text text-xl font-bold">
                              {data.siswa
                                ?.namaLengkap ||
                                data.siswaId}
                            </h2>

                            <p className="theme-text-muted text-sm font-medium">
                              {data.siswa?.nis
                                ? `NIS ${data.siswa.nis}`
                                : "—"}
                            </p>
                          </div>
                        </div>

                        {/* STATUS */}

                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass(
                            data.status
                          )}`}
                        >
                          {data.status || "-"}
                        </span>
                      </div>

                      {/* DETAIL BOXES */}

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <DetailBox
                          icon="tag"
                          label="Jenis Asesmen"
                          value={data.jenis || "-"}
                        />

                        <DetailBox
                          icon="star"
                          label="Skor"
                          value={data.skor ?? "-"}
                        />

                        <DetailBox
                          icon="calendar"
                          label="Tanggal"
                          value={formatTanggal(
                            data.tanggal
                          )}
                        />

                        <DetailBox
                          icon="status"
                          label="Status"
                          value={
                            data.status || "-"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      MINAT
                  ================================================= */}

                  <SectionCard
                    icon="heart"
                    tone="blue"
                    title="Minat"
                  >
                    <p className="theme-text text-sm leading-6">
                      {data.minat || "-"}
                    </p>
                  </SectionCard>

                  {/* =================================================
                      BAKAT
                  ================================================= */}

                  <SectionCard
                    icon="star"
                    tone="amber"
                    title="Bakat"
                  >
                    <p className="theme-text text-sm leading-6">
                      {data.bakat || "-"}
                    </p>
                  </SectionCard>

                  {/* =================================================
                      HASIL
                  ================================================= */}

                  <SectionCard
                    icon="check"
                    tone="emerald"
                    title="Hasil"
                  >
                    <p className="theme-text text-sm leading-6">
                      {data.hasil || "-"}
                    </p>
                  </SectionCard>

                  {/* =================================================
                      REKOMENDASI
                  ================================================= */}

                  <SectionCard
                    icon="arrow"
                    tone="blue"
                    title="Rekomendasi"
                  >
                    <p className="theme-text text-sm leading-6">
                      {data.rekomendasi || "-"}
                    </p>
                  </SectionCard>

                  {/* =================================================
                      CATATAN
                  ================================================= */}

                  <SectionCard
                    icon="note"
                    tone="slate"
                    title="Catatan"
                  >
                    <p className="theme-text text-sm leading-6">
                      {data.catatan || "-"}
                    </p>
                  </SectionCard>
                </div>

                {/* =================================================
                    RIGHT SIDEBAR
                ================================================= */}

                <aside className="space-y-5">

                  {/* =================================================
                      INFO ASESMEN
                  ================================================= */}

                  <div className="theme-card theme-border relative overflow-hidden rounded-2xl border p-6 shadow-xl">

                    <div className="mb-4 flex items-center gap-2">

                      <div className="theme-info flex h-7 w-7 items-center justify-center rounded-lg">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>

                      <h3 className="theme-text-muted text-xs font-bold uppercase tracking-wider">
                        Info Asesmen
                      </h3>
                    </div>

                    <div className="space-y-3.5">

                      <InfoRow
                        icon="id"
                        label="ID"
                        value={`#${data.id}`}
                      />

                      <InfoRow
                        icon="calendar"
                        label="Tanggal"
                        value={formatTanggal(
                          data.tanggal
                        )}
                      />

                      <InfoRow
                        icon="star"
                        label="Skor"
                        value={
                          data.skor ?? "-"
                        }
                      />

                      <InfoRow
                        icon="tag"
                        label="Jenis"
                        value={
                          data.jenis || "-"
                        }
                      />
                    </div>
                  </div>

                  {/* =================================================
                      QUICK ACTION
                  ================================================= */}

                  <div className="theme-card theme-border rounded-2xl border p-6 shadow-xl">

                    <h3 className="theme-text-muted mb-4 text-xs font-bold uppercase tracking-wider">
                      Aksi Cepat
                    </h3>

                    <div className="space-y-2">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/bk/asesment-minat-bakat/${id}/edit`
                          )
                        }
                        className="theme-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition"
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

                        Edit
                      </button>

                      {/* BACK TO LIST */}

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/bk/asesment-minat-bakat"
                          )
                        }
                        className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-sm transition"
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
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                          />
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

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({
  icon,
  label,
  value,
}) {
  const icons = {
    tag: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
      />
    ),

    star: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    ),

    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),

    status: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div className="theme-card-soft theme-border flex items-start gap-3 rounded-xl border px-4 py-3">
      <div className="theme-card theme-border theme-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm">
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
        <p className="theme-text-muted text-[11px] font-bold uppercase tracking-wider">
          {label}
        </p>

        <p className="theme-text mt-0.5 text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  icon,
  tone = "slate",
  title,
  children,
}) {
  const tones = {
    blue: {
      bg: "theme-info",
    },

    emerald: {
      bg: "theme-success",
    },

    amber: {
      bg: "theme-warning",
    },

    slate: {
      bg: "theme-card-soft theme-text-secondary",
    },
  };

  const t =
    tones[tone] || tones.slate;

  const icons = {
    heart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    ),

    star: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    ),

    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),

    arrow: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    ),

    note: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  };

  return (
    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-xl">

      {/* HEADER */}

      <div className="theme-table-header theme-border-soft flex items-center gap-3 border-b px-6 py-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.bg}`}
        >
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

        <h3 className="theme-text text-sm font-bold">
          {title}
        </h3>
      </div>

      {/* CONTENT */}

      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
}) {
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

    star: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    ),

    tag: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
      />
    ),
  };

  return (
    <div className="flex items-center gap-3">
      <div className="theme-card-soft theme-border theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
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
        <p className="theme-text-muted text-[11px] font-bold uppercase tracking-wider">
          {label}
        </p>

        <p className="theme-text truncate text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}