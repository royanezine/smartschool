"use client";

import { useState, useMemo } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  ChevronRight,
  Pencil,
  X,
  AlertTriangle,
  Search,
  Settings2,
} from "lucide-react";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

// =========================================================
// DUMMY DATA
// =========================================================

const DAYA_TAMPUNG_AWAL = 1500;

const initialAlokasi = [
  {
    id: 1,
    jalur: "Jalur Reguler",
    gelombang: "Gelombang 1",
    kuota: 300,
    terisi: 300,
    colorType: "primary",
  },
  {
    id: 2,
    jalur: "Jalur Reguler",
    gelombang: "Gelombang 2",
    kuota: 250,
    terisi: 210,
    colorType: "primary",
  },
  {
    id: 3,
    jalur: "Jalur Reguler",
    gelombang: "Gelombang 3",
    kuota: 150,
    terisi: 91,
    colorType: "primary",
  },
  {
    id: 4,
    jalur: "Jalur Prestasi",
    gelombang: "Gelombang 1",
    kuota: 200,
    terisi: 200,
    colorType: "warning",
  },
  {
    id: 5,
    jalur: "Jalur Prestasi",
    gelombang: "Gelombang 2",
    kuota: 250,
    terisi: 212,
    colorType: "warning",
  },
  {
    id: 6,
    jalur: "Jalur Afirmasi",
    gelombang: "Gelombang 1",
    kuota: 100,
    terisi: 88,
    colorType: "danger",
  },
  {
    id: 7,
    jalur: "Jalur Afirmasi",
    gelombang: "Gelombang 2",
    kuota: 100,
    terisi: 90,
    colorType: "danger",
  },
  {
    id: 8,
    jalur: "Jalur Mutasi",
    gelombang: "Gelombang 2",
    kuota: 60,
    terisi: 57,
    colorType: "info",
  },
];

const JALUR_OPTIONS = [
  "Jalur Reguler",
  "Jalur Prestasi",
  "Jalur Afirmasi",
  "Jalur Mutasi",
];

const JALUR_FILTERS = [
  "Semua",
  ...JALUR_OPTIONS,
];

function formatRupiah(n) {
  return n.toLocaleString("id-ID");
}

// =========================================================
// THEME COLOR HELPERS
// =========================================================

function getThemeColor(type) {
  const colors = {
    primary: "var(--color-primary)",
    warning: "var(--color-warning)",
    danger: "var(--color-text)",
    info: "var(--color-info)",
  };

  return colors[type] || "var(--color-text-muted)";
}

function getThemeText(type) {
  const colors = {
    primary: "text-[var(--color-primary)]",
    warning: "text-[var(--color-warning)]",
    danger: "theme-danger",
    info: "text-[var(--color-info)]",
  };

  return colors[type] || "theme-text-secondary";
}

// =========================================================
// PAGE
// =========================================================

export default function KuotaPPDBPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [alokasiList, setAlokasiList] =
    useState(initialAlokasi);

  const [dayaTampung, setDayaTampung] =
    useState(DAYA_TAMPUNG_AWAL);

  const [dayaTampungInput, setDayaTampungInput] =
    useState(String(DAYA_TAMPUNG_AWAL));

  const [activeJalur, setActiveJalur] =
    useState("Semua");

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editTarget, setEditTarget] =
    useState(null);

  const [kuotaInput, setKuotaInput] =
    useState("");

  const toggleSidebar = () =>
    setIsCollapsed(!isCollapsed);

  // =========================================================
  // FILTER
  // =========================================================

  const filtered = alokasiList.filter((a) => {
    const matchJalur =
      activeJalur === "Semua" ||
      a.jalur === activeJalur;

    const keyword =
      search.toLowerCase();

    const matchSearch =
      a.jalur
        .toLowerCase()
        .includes(keyword) ||
      a.gelombang
        .toLowerCase()
        .includes(keyword);

    return matchJalur && matchSearch;
  });

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalDialokasikan =
    alokasiList.reduce(
      (a, x) => a + x.kuota,
      0
    );

  const totalTerisi =
    alokasiList.reduce(
      (a, x) => a + x.terisi,
      0
    );

  const sisaAlokasi =
    dayaTampung - totalDialokasikan;

  const isOverAllocated =
    sisaAlokasi < 0;

  // =========================================================
  // PER JALUR
  // =========================================================

  const perJalur = useMemo(() => {
    return JALUR_OPTIONS.map((nama) => {
      const rows = alokasiList.filter(
        (a) => a.jalur === nama
      );

      const kuota = rows.reduce(
        (a, x) => a + x.kuota,
        0
      );

      const terisi = rows.reduce(
        (a, x) => a + x.terisi,
        0
      );

      const colorType =
        rows[0]?.colorType ||
        "primary";

      return {
        nama,
        kuota,
        terisi,
        colorType,
      };
    });
  }, [alokasiList]);

  // =========================================================
  // EDIT
  // =========================================================

  const openEdit = (a) => {
    setEditTarget(a);
    setKuotaInput(
      String(a.kuota)
    );
    setShowModal(true);
  };

  const handleSaveKuota = (e) => {
    e.preventDefault();

    const nilai =
      Number(kuotaInput);

    if (
      isNaN(nilai) ||
      nilai < 0
    ) {
      return;
    }

    setAlokasiList((prev) =>
      prev.map((a) =>
        a.id === editTarget.id
          ? {
              ...a,
              kuota: nilai,
            }
          : a
      )
    );

    setShowModal(false);
  };

  // =========================================================
  // DAYA TAMPUNG
  // =========================================================

  const handleSaveDayaTampung =
    () => {
      const nilai =
        Number(dayaTampungInput);

      if (
        isNaN(nilai) ||
        nilai < 0
      ) {
        return;
      }

      setDayaTampung(nilai);
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="kuota"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={
            toggleSidebar
          }
          notifications={[]}
          user={{
            name: "Admin PPDB",
            email:
              "adminppdb@smartschool.com",
            avatar: "PP",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1320px] space-y-5">

              {/* =================================================
                  BREADCRUMB
              ================================================= */}

              <div className="flex items-center gap-1.5 text-xs">
                <span className="theme-text-muted">
                  PPDB
                </span>

                <ChevronRight
                  size={12}
                  className="theme-text-placeholder"
                />

                <span
                  className={`font-medium ${themePrimaryText}`}
                >
                  Kuota
                </span>
              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <SummaryCard
                  title="Daya Tampung Sekolah"
                  value={formatRupiah(
                    dayaTampung
                  )}
                />

                <SummaryCard
                  title="Total Dialokasikan"
                  value={formatRupiah(
                    totalDialokasikan
                  )}
                />

                <div
                  className={`theme-card ${themeNeutralBorder} rounded-xl border p-5 ${themeCardShadow}`}
                >
                  <p className="theme-text-muted text-xs">
                    Sisa Alokasi
                  </p>

                  <p
                    className={`mt-2 text-2xl font-bold ${
                      isOverAllocated
                        ? "theme-danger"
                        : "text-[var(--color-success)]"
                    }`}
                  >
                    {isOverAllocated
                      ? "-"
                      : ""}
                    {formatRupiah(
                      Math.abs(
                        sisaAlokasi
                      )
                    )}
                  </p>
                </div>

                <div
                  className={`theme-card ${themeNeutralBorder} flex flex-col items-center justify-center rounded-xl border p-5 text-center ${themeCardShadow}`}
                >
                  <p className="theme-text-muted text-xs">
                    Kuota Terisi
                  </p>

                  <p className="theme-text-secondary mt-3 text-3xl font-bold">
                    {totalDialokasikan >
                    0
                      ? Math.round(
                          (totalTerisi /
                            totalDialokasikan) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </section>

              {/* =================================================
                  WARNING
              ================================================= */}

              {isOverAllocated && (
                <div
                  className={`theme-danger ${themeWarningSurface} ${themeWarningBorder} flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs`}
                >
                  <AlertTriangle
                    size={15}
                    className="shrink-0"
                  />

                  <span>
                    Total kuota yang
                    dialokasikan
                    melebihi daya
                    tampung sekolah
                    sebanyak{" "}
                    <span className="font-semibold">
                      {formatRupiah(
                        Math.abs(
                          sisaAlokasi
                        )
                      )}
                    </span>{" "}
                    siswa. Silakan
                    sesuaikan
                    alokasi.
                  </span>
                </div>
              )}

              {/* =================================================
                  DAYA TAMPUNG
              ================================================= */}

              <section
                className={`theme-card ${themeNeutralBorder} rounded-xl border p-5 ${themeCardShadow}`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Settings2
                    size={15}
                    className="theme-text-muted"
                  />

                  <h3 className="theme-text text-sm font-semibold">
                    Pengaturan Daya
                    Tampung Sekolah
                  </h3>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="theme-text-secondary mb-1 block text-xs">
                      Total Daya Tampung
                      (siswa)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        dayaTampungInput
                      }
                      onChange={(e) =>
                        setDayaTampungInput(
                          e.target.value
                        )
                      }
                      className={`theme-input w-48 rounded-md border px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                    />
                  </div>

                  <button
                    onClick={
                      handleSaveDayaTampung
                    }
                    className={`${themePrimaryGradient} rounded-md px-4 py-2 text-xs font-medium text-[var(--color-card)] transition hover:opacity-90`}
                  >
                    Simpan
                  </button>

                  <p className="theme-text-muted text-xs">
                    Total kuota di seluruh
                    jalur & gelombang
                    tidak boleh melebihi
                    angka ini.
                  </p>
                </div>
              </section>

              {/* =================================================
                  REKAP PER JALUR
              ================================================= */}

              <section
                className={`theme-card ${themeNeutralBorder} rounded-xl border p-5 ${themeCardShadow}`}
              >
                <h3 className="theme-text mb-4 text-sm font-semibold">
                  Rekap Kuota per Jalur
                </h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {perJalur.map((j) => {
                    const persen =
                      j.kuota > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (j.terisi /
                                j.kuota) *
                                100
                            )
                          )
                        : 0;

                    const color =
                      getThemeColor(
                        j.colorType
                      );

                    return (
                      <div
                        key={j.nama}
                        className={`${themeNeutralBorder} rounded-lg border p-3.5`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                color,
                            }}
                          />

                          <p className="theme-text-secondary truncate text-xs font-medium">
                            {j.nama}
                          </p>
                        </div>

                        <p className="theme-text mt-2 font-mono text-lg font-bold tabular-nums">
                          {j.terisi}

                          <span className="theme-text-muted text-xs font-normal">
                            {" "}
                            / {j.kuota}
                          </span>
                        </p>

                        <div
                          className={`mt-2 h-1.5 overflow-hidden rounded-full ${themeNeutralSurface}`}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${persen}%`,
                              backgroundColor:
                                color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* =================================================
                  TABLE
              ================================================= */}

              <section
                className={`theme-card ${themeNeutralBorder} overflow-hidden rounded-xl border ${themeCardShadow}`}
              >
                <div
                  className={`${themeDivider} flex flex-wrap items-center justify-between gap-3 border-b px-5 pb-4 pt-4`}
                >
                  <div className="flex items-center gap-5 overflow-x-auto">
                    {JALUR_FILTERS.map(
                      (f) => (
                        <button
                          key={f}
                          onClick={() =>
                            setActiveJalur(
                              f
                            )
                          }
                          className={`relative whitespace-nowrap pb-2.5 text-sm font-medium transition-colors ${
                            activeJalur ===
                            f
                              ? themePrimaryText
                              : "theme-text-muted hover:text-[var(--color-text)]"
                          }`}
                        >
                          {f}

                          {activeJalur ===
                            f && (
                            <span
                              className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full"
                              style={{
                                backgroundColor:
                                  "var(--color-primary)",
                              }}
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>

                  <div
                    className={`${themeNeutralBorder} theme-input flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs`}
                  >
                    <Search
                      size={13}
                      className="theme-text-muted"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Cari jalur/gelombang..."
                      className="theme-text w-40 bg-transparent outline-none placeholder:text-[var(--color-text-placeholder)]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className={`${themeDivider} theme-text-muted border-b text-left text-xs`}
                      >
                        <th className="px-5 py-3 font-medium">
                          Jalur
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Gelombang
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Kuota
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Terisi
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Sisa
                        </th>

                        <th className="px-5 py-3 font-medium">
                          Progres
                        </th>

                        <th className="px-5 py-3 text-right font-medium">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="theme-text-muted px-5 py-10 text-center text-sm"
                          >
                            Tidak ada
                            alokasi
                            ditemukan.
                          </td>
                        </tr>
                      )}

                      {filtered.map(
                        (a) => {
                          const persen =
                            a.kuota >
                            0
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (a.terisi /
                                      a.kuota) *
                                      100
                                  )
                                )
                              : 0;

                          const sisa =
                            a.kuota -
                            a.terisi;

                          const color =
                            getThemeColor(
                              a.colorType
                            );

                          return (
                            <tr
                              key={a.id}
                              className={`${themeDivider} border-b transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]`}
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{
                                      backgroundColor:
                                        color,
                                    }}
                                  />

                                  <span className="theme-text font-medium">
                                    {a.jalur}
                                  </span>
                                </div>
                              </td>

                              <td className="theme-text-secondary px-5 py-4">
                                {a.gelombang}
                              </td>

                              <td className="theme-text px-5 py-4 font-mono tabular-nums">
                                {a.kuota}
                              </td>

                              <td className="theme-text px-5 py-4 font-mono tabular-nums">
                                {a.terisi}
                              </td>

                              <td className="px-5 py-4 font-mono tabular-nums">
                                <span
                                  className={
                                    sisa < 0
                                      ? "theme-danger font-semibold"
                                      : "theme-text-secondary"
                                  }
                                >
                                  {sisa}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`h-1.5 w-16 overflow-hidden rounded-full ${themeNeutralSurface}`}
                                  >
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${persen}%`,
                                        backgroundColor:
                                          color,
                                      }}
                                    />
                                  </div>

                                  <span className="theme-text-muted font-mono text-xs">
                                    {persen}%
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end">
                                  <button
                                    onClick={() =>
                                      openEdit(
                                        a
                                      )
                                    }
                                    className={`theme-text-muted rounded-md p-1.5 transition-colors hover:${themePrimaryText} ${themePrimarySoft}`}
                                  >
                                    <Pencil
                                      size={
                                        14
                                      }
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>

                    {filtered.length >
                      0 && (
                      <tfoot>
                        <tr
                          className={`${themeDivider} ${themeNeutralSurface} border-t`}
                        >
                          <td
                            className="theme-text-secondary px-5 py-3 text-xs font-semibold"
                            colSpan={2}
                          >
                            Total (
                            {
                              filtered.length
                            }{" "}
                            alokasi)
                          </td>

                          <td className="theme-text px-5 py-3 font-mono text-xs font-semibold">
                            {filtered.reduce(
                              (a, x) =>
                                a +
                                x.kuota,
                              0
                            )}
                          </td>

                          <td className="theme-text px-5 py-3 font-mono text-xs font-semibold">
                            {filtered.reduce(
                              (a, x) =>
                                a +
                                x.terisi,
                              0
                            )}
                          </td>

                          <td colSpan={3} />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </section>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="theme-text-muted py-3 text-center text-[11px]">
                © 2026 SmartSchool &middot;
                Dashboard Admin PPDB
                &middot; All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* =======================================================
          MODAL EDIT KUOTA
      ======================================================= */}

      {showModal &&
        editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_35%,transparent)] p-4 backdrop-blur-[2px]">
            <div
              className={`theme-card ${themeNeutralBorder} w-full max-w-sm rounded-xl border p-6 ${themeCardShadow}`}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="theme-text text-sm font-semibold">
                  Edit Kuota
                </h3>

                <button
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                  className="theme-text-muted transition hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="theme-text-secondary mb-4 text-xs">
                {editTarget.jalur}{" "}
                &middot;{" "}
                {
                  editTarget.gelombang
                }
              </p>

              <form
                onSubmit={
                  handleSaveKuota
                }
                className="space-y-4"
              >
                <div>
                  <label className="theme-text-secondary mb-1 block text-xs">
                    Kuota
                  </label>

                  <input
                    type="number"
                    min={
                      editTarget.terisi
                    }
                    value={
                      kuotaInput
                    }
                    onChange={(e) =>
                      setKuotaInput(
                        e.target.value
                      )
                    }
                    className={`theme-input w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                    required
                  />

                  <p className="theme-text-muted mt-1.5 text-[11px]">
                    Sudah terisi{" "}
                    {
                      editTarget.terisi
                    }{" "}
                    siswa, kuota
                    tidak boleh
                    kurang dari
                    angka ini.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                    className="theme-text-secondary px-4 py-2 text-xs font-medium transition hover:text-[var(--color-text)]"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className={`${themePrimaryGradient} rounded-md px-4 py-2 text-xs font-medium text-[var(--color-card)] transition hover:opacity-90`}
                  >
                    Simpan
                    Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  title,
  value,
}) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-5 ${themeCardShadow}`}
    >
      <p className="theme-text-muted text-xs">
        {title}
      </p>

      <p className="theme-text mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}