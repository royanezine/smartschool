"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Plus,
  CalendarDays,
  Users,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  X,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

// ============================================================
// DATA
// ============================================================

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

// ============================================================
// PAGE
// ============================================================

export default function GelombangPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
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

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft}`}
                >
                  <CalendarDays
                    size={20}
                    className={themePrimaryText}
                  />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold">
                    Gelombang Pendaftaran
                  </h1>

                  <p className="theme-text-muted text-xs">
                    Kelola periode dan kuota setiap gelombang
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/spmb/gelombang/tambah"
                  )
                }
                className={`${themePrimaryGradient} inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themeSmallShadow} transition hover:brightness-95`}
              >
                <Plus size={16} />
                Tambah Gelombang
              </button>
            </div>

            {/* ==================================================
                SUMMARY
            ================================================== */}

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
                tone="success"
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
                tone="warning"
              />
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}

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

                  const isActive =
                    item.status === "Aktif";

                  return (
                    <div
                      key={item.id}
                      className={`theme-card rounded-xl border p-5 ${themeCardShadow} ${
                        isActive
                          ? themePrimarySoftBorder
                          : themeNeutralBorder
                      }`}
                    >
                      {/* CARD HEADER */}

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="theme-text text-sm font-bold">
                              {item.nama}
                            </h2>

                            {isActive && (
                              <span className="rounded-md border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-2 py-1 text-[9px] font-semibold text-[var(--color-success)]">
                                AKTIF
                              </span>
                            )}
                          </div>

                          <p className="theme-text-muted mt-1 text-[10px]">
                            {item.keterangan}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="theme-text-muted transition hover:text-[var(--color-text)]"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>

                      {/* PERIOD */}

                      <div
                        className={`mt-5 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className={themePrimaryText}
                          />

                          <div>
                            <p className="theme-text-muted text-[10px]">
                              Periode
                            </p>

                            <p className="theme-text-secondary text-xs font-semibold">
                              {item.mulai}
                            </p>

                            <p className="theme-text-muted text-[10px]">
                              sampai {item.selesai}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* QUOTA */}

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="theme-text-secondary text-xs">
                            Penggunaan Kuota
                          </span>

                          <span className="theme-text text-xs font-bold">
                            {item.pendaftar}/
                            {item.kuota}
                          </span>
                        </div>

                        <div
                          className={`h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                        >
                          <div
                            className={`${themePrimaryGradient} h-full rounded-full`}
                            style={{
                              width: `${Math.min(
                                percent,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="theme-text-muted mt-1 text-right text-[10px]">
                          {percent}% terisi
                        </p>
                      </div>

                      {/* FOOTER */}

                      <div
                        className={`mt-5 flex items-center justify-between border-t ${themeDivider} pt-4`}
                      >
                        <StatusBadge
                          status={item.status}
                        />

                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(item)
                            }
                            className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)]"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/admin/spmb/gelombang/${item.id}/edit`
                              )
                            }
                            className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)]"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] hover:text-[var(--color-danger)]"
                          >
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

      {/* ======================================================
          DETAIL MODAL
      ====================================================== */}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_42%,transparent)] p-4 backdrop-blur-sm">
          <div
            className={`theme-card w-full max-w-lg overflow-hidden rounded-2xl ${themeCardShadow}`}
          >
            {/* MODAL HEADER */}

            <div
              className={`flex items-center justify-between border-b ${themeDivider} px-5 py-4`}
            >
              <div>
                <h2 className="theme-text text-base font-bold">
                  Detail Gelombang
                </h2>

                <p className="theme-text-muted text-xs">
                  Informasi periode penerimaan
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]"
              >
                <X size={17} />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="space-y-4 p-5">
              <div
                className={`rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-4`}
              >
                <p className="theme-text text-lg font-bold">
                  {selected.nama}
                </p>

                <p className="theme-text-muted mt-1 text-xs">
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

            {/* MODAL FOOTER */}

            <div
              className={`flex justify-end border-t ${themeDivider} px-5 py-4`}
            >
              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className={`theme-neutral-border theme-text-secondary rounded-lg border px-4 py-2 text-xs font-semibold transition ${themeNeutralHover}`}
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

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  if (status === "Aktif") {
    return (
      <span className="rounded-md border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-success)]">
        {status}
      </span>
    );
  }

  if (status === "Selesai") {
    return (
      <span
        className={`theme-neutral-border theme-text-muted ${themeNeutralSurface} rounded-md border px-2.5 py-1 text-[10px] font-semibold`}
      >
        {status}
      </span>
    );
  }

  return (
    <span className="rounded-md border border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-warning)]">
      {status}
    </span>
  );
}

// ============================================================
// SUMMARY
// ============================================================

function Summary({
  title,
  value,
  icon: Icon,
  tone = "primary",
}) {
  const toneConfig = {
    primary: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
      text:
        "text-[var(--color-primary)]",
    },

    success: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
      text:
        "text-[var(--color-success)]",
    },

    warning: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
      text:
        "text-[var(--color-warning)]",
    },
  };

  const current =
    toneConfig[tone] ||
    toneConfig.primary;

  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-4 ${themeSmallShadow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="theme-text-muted text-xs">
            {title}
          </p>

          <p className="theme-text mt-1 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${current.surface}`}
        >
          <Icon
            size={18}
            className={current.text}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFO
// ============================================================

function Info({ label, value }) {
  return (
    <div
      className={`theme-neutral-border ${themeNeutralSurface} rounded-lg border p-3`}
    >
      <p className="theme-text-muted text-[10px] uppercase">
        {label}
      </p>

      <p className="theme-text-secondary mt-1 text-xs font-bold">
        {value}
      </p>
    </div>
  );
}