"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import { getKategoriPelanggaran } from "../../../../../../services/bk.service";

export default function DetailKategoriPage() {
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

        const result = await getKategoriPelanggaran();
        const list = Array.isArray(result) ? result : [];

        const item = list.find((x) => String(x.id) === String(id));

        if (!item) {
          throw new Error("Data kategori tidak ditemukan.");
        }

        setData(item);
      } catch (err) {
        setError(err?.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  function initials(name) {
    if (!name) return "?";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function statusClass(status) {
    const s = (status || "").toLowerCase();

    if (s === "aktif") {
      return "theme-success";
    }

    return "theme-card-soft theme-text-muted";
  }

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">
            {/* PAGE HEADER */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                {/* BACK BUTTON */}
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="
                    theme-card
                    theme-border
                    theme-text-secondary
                    theme-sidebar-hover
                    mt-1 flex h-10 w-10 shrink-0
                    items-center justify-center rounded-xl
                    border shadow-sm transition
                  "
                  title="Kembali"
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
                  {/* HEADER ICON */}
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
                      Detail Kategori
                    </h1>

                    <p className="theme-text-muted mt-1 text-sm font-medium">
                      Informasi lengkap kategori pelanggaran
                    </p>
                  </div>
                </div>
              </div>

              {/* EDIT BUTTON */}
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/bk/kategori-point/${id}/edit`)
                }
                className="
                  theme-primary
                  inline-flex items-center gap-2
                  rounded-xl px-4 py-2.5
                  text-sm font-bold shadow-lg transition
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

                Edit
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="theme-danger mb-6 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm">
                {error}
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="theme-card theme-border rounded-2xl border p-12 text-center shadow-xl">
                <div className="theme-text-muted inline-flex items-center gap-2 text-sm font-medium">
                  <span
                    className="
                      h-4 w-4 animate-spin rounded-full border-2
                      border-[var(--color-border)]
                      border-t-[var(--color-primary)]
                    "
                  />

                  Memuat data...
                </div>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-5">
                  {/* HERO CARD */}
                  <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-xl">
                    <div className="theme-primary h-1.5 w-full" />

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {/* INITIAL */}
                          <div className="theme-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-lg">
                            {initials(data.nama)}
                          </div>

                          <div className="min-w-0">
                            <h2 className="theme-text truncate text-xl font-bold">
                              {data.nama}
                            </h2>

                            <p className="theme-text-muted text-sm font-medium">
                              Kategori Pelanggaran
                            </p>
                          </div>
                        </div>

                        {/* STATUS */}
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(
                            data.status
                          )}`}
                        >
                          {data.status || "-"}
                        </span>
                      </div>

                      {/* DETAIL GRID */}
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <DetailBox
                          icon="star"
                          label="Poin"
                          value={`${data.poin ?? 0} poin`}
                        />

                        <DetailBox
                          icon="status"
                          label="Status"
                          value={data.status || "-"}
                        />

                        <DetailBox
                          icon="id"
                          label="ID Kategori"
                          value={`#${data.id}`}
                        />

                        <DetailBox
                          icon="note"
                          label="Nama"
                          value={data.nama || "-"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <SectionCard
                    icon="note"
                    tone="neutral"
                    title="Deskripsi"
                  >
                    <p className="theme-text-secondary text-sm leading-6">
                      {data.deskripsi || "-"}
                    </p>
                  </SectionCard>
                </div>

                {/* SIDEBAR */}
                <aside className="space-y-5">
                  {/* INFO CATEGORY */}
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
                        Info Kategori
                      </h3>
                    </div>

                    <div className="space-y-3.5">
                      <InfoRow
                        icon="id"
                        label="ID"
                        value={`#${data.id}`}
                      />

                      <InfoRow
                        icon="star"
                        label="Poin"
                        value={`${data.poin ?? 0} poin`}
                      />

                      <InfoRow
                        icon="status"
                        label="Status"
                        value={data.status || "-"}
                      />
                    </div>
                  </div>

                  {/* QUICK ACTION */}
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
                            `/admin/bk/kategori-point/${id}/edit`
                          )
                        }
                        className="
                          theme-primary
                          inline-flex w-full items-center
                          justify-center gap-2 rounded-xl
                          px-4 py-2.5 text-sm font-bold
                          shadow-lg transition
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1-1-4 9.5-9.5z"
                          />
                        </svg>

                        Edit
                      </button>

                      {/* BACK TO LIST */}
                      <button
                        type="button"
                        onClick={() =>
                          router.push("/admin/bk/kategori-point")
                        }
                        className="
                          theme-card
                          theme-border
                          theme-text-secondary
                          theme-sidebar-hover
                          inline-flex w-full items-center
                          justify-center gap-2 rounded-xl
                          border px-4 py-2.5
                          text-sm font-bold shadow-sm transition
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

function DetailBox({ icon, label, value }) {
  const icons = {
    star: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    ),

    status: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),

    id: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
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
  tone = "neutral",
  title,
  children,
}) {
  const toneClass = {
    blue: "theme-info",
    emerald: "theme-success",
    amber: "theme-warning",
    neutral: "theme-card-soft theme-text-muted",
  };

  const icons = {
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
      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-6 py-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass[tone] || toneClass.neutral}`}
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

      <div className="px-6 py-5">
        {children}
      </div>
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

    star: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
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