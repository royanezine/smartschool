"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Info,
  ServerCrash,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

export default function SpmbBackendBlocker({
  title,
  description,
  blockers = [],
  notes = [],
  sidebarRole = "admin",
  active = "spmb",
  backHref,
  backLabel = "Kembali",
}) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active={active}
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role={sidebarRole}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setCollapsed((value) => !value)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl p-4 sm:p-6 lg:p-8">
            {backHref && (
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className="mb-4 inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={15} />
                {backLabel}
              </button>
            )}

            <div className="mb-6 flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
              >
                <ServerCrash size={21} />
              </div>

              <div>
                <h1 className="theme-text text-xl font-bold sm:text-2xl">
                  {title}
                </h1>

                {description && (
                  <p className="theme-text-secondary mt-1 text-sm leading-6">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                />

                <div>
                  <p className="theme-text text-sm font-bold">
                    Fitur belum dapat digunakan
                  </p>

                  <p className="theme-text-secondary mt-1 text-sm leading-6">
                    Antarmuka sudah tersedia, tetapi
                    endpoint Backend yang dibutuhkan
                    belum ada. Data contoh tidak
                    ditampilkan agar tidak menyesatkan.
                  </p>
                </div>
              </div>

              {blockers.length > 0 && (
                <div className="mt-5">
                  <p className="theme-text-muted text-xs font-bold uppercase tracking-wide">
                    Endpoint yang dibutuhkan
                  </p>

                  <ul className="mt-2 space-y-2">
                    {blockers.map((item) => {
                      const label =
                        typeof item === "string"
                          ? item
                          : item.label;

                      const detail =
                        typeof item === "string"
                          ? ""
                          : item.detail;

                      return (
                        <li
                          key={label}
                          className={`rounded-xl border ${themeNeutralBorder} bg-[var(--color-card)] px-4 py-3`}
                        >
                          <p className="theme-text font-mono text-xs font-semibold">
                            {label}
                          </p>

                          {detail && (
                            <p className="theme-text-secondary mt-1 text-xs leading-5">
                              {detail}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {notes.length > 0 && (
              <div
                className={`theme-card ${themeNeutralBorder} mt-5 rounded-2xl border p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center gap-2">
                  <Info
                    size={16}
                    className={themePrimaryText}
                  />

                  <p className="theme-text text-sm font-semibold">
                    Catatan integrasi
                  </p>
                </div>

                <ul
                  className={`mt-3 space-y-2 border-t ${themeDivider} pt-3`}
                >
                  {notes.map((note) => (
                    <li
                      key={note}
                      className="theme-text-secondary flex items-start gap-2 text-xs leading-5"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${themePrimarySoft}`}
                      />

                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className={`${themeNeutralSurface} ${themeNeutralBorder} mt-5 rounded-xl border p-4`}
            >
              <p className="theme-text-secondary text-xs leading-5">
                Modul SPMB yang sudah terhubung ke
                Backend: <strong>Jalur Pendaftaran</strong>{" "}
                (GET/POST/PUT/DELETE /api/jalur-ppdb),{" "}
                <strong>pendaftaran publik</strong>{" "}
                (POST /api/ppdb/daftar dan POST
                /api/ppdb/:id/berkas), verifikasi{" "}
                (PATCH /api/ppdb/:id/verifikasi),{" "}
                <strong>pengaturan</strong> (GET/POST
                /api/pengaturan), serta <strong>baca
                pendaftar</strong> (GET /api/ppdb/pendaftar
                dan GET /api/ppdb/pendaftar/:id) yang
                dipakai Dashboard, Seleksi, Kuota, dan
                Laporan. Ketersediaan endpoint baca pada
                server yang berjalan dapat diperiksa dari
                halaman ringkasan SPMB.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
