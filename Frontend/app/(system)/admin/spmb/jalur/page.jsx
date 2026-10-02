"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  X,
  Search,
  RefreshCw,
} from "lucide-react";

import {
  getJalurPpdb,
  createJalurPpdb,
  updateJalurPpdb,
  deleteJalurPpdb,
} from "../../../../../services/jalurPpdb.service";

// =========================================================
// THEME HELPERS
// =========================================================

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// =========================================================
// STATUS
// =========================================================

const STATUS_FILTERS = [
  "Semua",
  "Aktif",
  "Nonaktif",
];

const PRESET_COLORS = [
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-primary)",
];

function formatNumber(n) {
  return Number(n || 0).toLocaleString("id-ID");
}

function emptyForm() {
  return {
    id: null,
    nama: "",
    deskripsi: "",
    kuota: "",
    status: "aktif",
    tanggalMulai: "",
    tanggalSelesai: "",
  };
}

function normalizeStatus(status) {
  if (!status) return "aktif";

  const value = String(status).toLowerCase();

  if (
    value === "aktif" ||
    value === "active"
  ) {
    return "aktif";
  }

  return "nonaktif";
}

function statusLabel(status) {
  return normalizeStatus(status) === "aktif"
    ? "Aktif"
    : "Nonaktif";
}

function getColor(index) {
  return PRESET_COLORS[
    index % PRESET_COLORS.length
  ];
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);

  if (normalized === "aktif") {
    return (
      <span className="rounded-full border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-success)]">
        Aktif
      </span>
    );
  }

  return (
    <span
      className={`rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-muted px-2.5 py-1 text-[11px] font-medium`}
    >
      Nonaktif
    </span>
  );
}

// =========================================================
// PAGE
// =========================================================

export default function JalurPPDBPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [jalurList, setJalurList] = useState([]);

  const [activeStatus, setActiveStatus] =
    useState("Semua");

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm());

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  const fetchJalur = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getJalurPpdb();

        const data =
          response?.data ??
          response?.result ??
          [];

        setJalurList(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Error fetch jalur PPDB:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data jalur PPDB"
        );

        setJalurList([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchJalur();
  }, [fetchJalur]);

  // =========================================================
  // FILTER
  // =========================================================

  const filtered = useMemo(() => {
    return jalurList.filter((j) => {
      const status =
        normalizeStatus(j.status);

      const matchStatus =
        activeStatus === "Semua" ||
        statusLabel(status) ===
          activeStatus;

      const matchSearch =
        String(j.nama || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchStatus &&
        matchSearch
      );
    });
  }, [
    jalurList,
    activeStatus,
    search,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalKuota = useMemo(() => {
    return jalurList.reduce(
      (total, j) =>
        total +
        Number(j.kuota || 0),
      0
    );
  }, [jalurList]);

  const aktifCount = useMemo(() => {
    return jalurList.filter(
      (j) =>
        normalizeStatus(
          j.status
        ) === "aktif"
    ).length;
  }, [jalurList]);

  /*
   * Backend getJalurPpdb saat ini belum
   * mengirim jumlah pendaftar per jalur.
   */
  const totalPendaftar = 0;

  // =========================================================
  // TAMBAH
  // =========================================================

  const openTambah = () => {
    setError("");
    setForm(emptyForm());
    setShowModal(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const openEdit = (j) => {
    setError("");

    setForm({
      id: j.id,
      nama: j.nama || "",
      deskripsi: j.deskripsi || "",
      kuota: j.kuota ?? "",
      status: normalizeStatus(
        j.status
      ),
      tanggalMulai:
        j.tanggalMulai
          ? String(
              j.tanggalMulai
            ).slice(0, 10)
          : "",
      tanggalSelesai:
        j.tanggalSelesai
          ? String(
              j.tanggalSelesai
            ).slice(0, 10)
          : "",
    });

    setShowModal(true);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama.trim()) {
      setError(
        "Nama jalur wajib diisi."
      );
      return;
    }

    if (
      form.kuota === "" ||
      Number(form.kuota) <= 0
    ) {
      setError(
        "Kuota harus lebih dari 0."
      );
      return;
    }

    if (
      form.tanggalMulai &&
      form.tanggalSelesai &&
      new Date(
        form.tanggalSelesai
      ) <
        new Date(
          form.tanggalMulai
        )
    ) {
      setError(
        "Tanggal selesai tidak boleh sebelum tanggal mulai."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nama: form.nama.trim(),
        deskripsi:
          form.deskripsi.trim() ||
          undefined,
        kuota: Number(
          form.kuota
        ),
        tanggalMulai:
          form.tanggalMulai ||
          undefined,
        tanggalSelesai:
          form.tanggalSelesai ||
          undefined,
        status: form.status,
      };

      if (form.id) {
        await updateJalurPpdb(
          form.id,
          payload
        );
      } else {
        await createJalurPpdb(
          payload
        );
      }

      setShowModal(false);
      setForm(emptyForm());

      await fetchJalur();
    } catch (err) {
      console.error(
        "Error simpan jalur PPDB:",
        err
      );

      setError(
        err?.message ||
          "Gagal menyimpan jalur PPDB"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const confirmDelete =
    async () => {
      if (!deleteTarget?.id)
        return;

      try {
        setDeleting(true);
        setError("");

        await deleteJalurPpdb(
          deleteTarget.id
        );

        setDeleteTarget(null);

        await fetchJalur();
      } catch (err) {
        console.error(
          "Error hapus jalur PPDB:",
          err
        );

        setError(
          err?.message ||
            "Gagal menghapus jalur PPDB"
        );
      } finally {
        setDeleting(false);
      }
    };

  // =========================================================
  // SIDEBAR
  // =========================================================

  const toggleSidebar = () => {
    setIsCollapsed(
      (prev) => !prev
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="jalur"
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

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1320px] space-y-5 p-4 md:p-6 lg:p-8">

            {/* =================================================
                BREADCRUMB
            ================================================= */}

            <div className="theme-text-muted flex items-center gap-1.5 text-xs">
              <span>PPDB</span>

              <ChevronRight size={12} />

              <span className="theme-text-secondary font-medium">
                Jalur Pendaftaran
              </span>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] px-4 py-3 text-xs text-[var(--color-danger)]">
                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="opacity-70 transition hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <SummaryCard
                title="Total Jalur"
                value={
                  loading
                    ? "..."
                    : jalurList.length
                }
              />

              <SummaryCard
                title="Jalur Aktif"
                value={
                  loading
                    ? "..."
                    : aktifCount
                }
                tone="success"
              />

              <SummaryCard
                title="Total Kuota"
                value={
                  loading
                    ? "..."
                    : formatNumber(
                        totalKuota
                      )
                }
              />

              <SummaryCard
                title="Kuota Terisi"
                value={`${totalKuota > 0
                  ? Math.round(
                      (totalPendaftar /
                        totalKuota) *
                        100
                    )
                  : 0}%`}
                soft
                description="Menunggu data pendaftar"
              />
            </section>

            {/* =================================================
                PANEL
            ================================================= */}

            <section
              className={`theme-card overflow-hidden rounded-xl ${themeCardShadow}`}
            >
              <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b ${themeDivider} px-5 pb-4 pt-4`}
              >
                {/* FILTER */}

                <div className="flex items-center gap-5">
                  {STATUS_FILTERS.map(
                    (f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() =>
                          setActiveStatus(
                            f
                          )
                        }
                        className={`relative pb-2.5 text-sm font-medium transition-colors ${
                          activeStatus ===
                          f
                            ? themePrimaryText
                            : "theme-text-muted hover:text-[var(--color-text)]"
                        }`}
                      >
                        {f}

                        {activeStatus ===
                          f && (
                          <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-[var(--color-primary)]" />
                        )}
                      </button>
                    )
                  )}
                </div>

                {/* ACTIONS */}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={
                      fetchJalur
                    }
                    disabled={loading}
                    className={`flex items-center justify-center rounded-md border ${themeNeutralBorder} theme-text-muted p-2 transition-colors ${themeNeutralHover} disabled:opacity-50`}
                    title="Refresh"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>

                  <div
                    className={`flex items-center gap-2 rounded-md border ${themeNeutralBorder} theme-text-secondary px-3 py-1.5 text-xs`}
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
                      placeholder="Cari jalur..."
                      className="theme-text min-w-0 w-32 bg-transparent text-xs outline-none placeholder:text-[var(--color-text-placeholder)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      openTambah
                    }
                    className={`${themePrimaryGradient} flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium text-[var(--color-card)] transition hover:brightness-95`}
                  >
                    <Plus size={14} />
                    Tambah Jalur
                  </button>
                </div>
              </div>

              {/* =================================================
                  DAFTAR
              ================================================= */}

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">

                {/* LOADING */}

                {loading && (
                  <>
                    {[1, 2, 3, 4].map(
                      (item) => (
                        <div
                          key={item}
                          className={`animate-pulse rounded-xl border ${themeNeutralBorder} p-4`}
                        >
                          <div
                            className={`h-4 w-32 rounded ${themeNeutralSurface}`}
                          />

                          <div
                            className={`mt-4 h-3 w-full rounded ${themeNeutralSurface}`}
                          />

                          <div
                            className={`mt-2 h-3 w-3/4 rounded ${themeNeutralSurface}`}
                          />

                          <div
                            className={`mt-6 h-2 w-full rounded ${themeNeutralSurface}`}
                          />
                        </div>
                      )
                    )}
                  </>
                )}

                {/* EMPTY */}

                {!loading &&
                  filtered.length ===
                    0 && (
                    <p className="theme-text-muted col-span-2 py-10 text-center text-sm">
                      {search ||
                      activeStatus !==
                        "Semua"
                        ? "Tidak ada jalur ditemukan."
                        : "Belum ada jalur PPDB."}
                    </p>
                  )}

                {/* DATA */}

                {!loading &&
                  filtered.map(
                    (j, index) => {
                      const color =
                        getColor(
                          index
                        );

                      /*
                       * Backend saat ini belum
                       * mengirim jumlah pendaftar.
                       */
                      const pendaftar =
                        0;

                      const persen =
                        Number(
                          j.kuota
                        ) > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (pendaftar /
                                  Number(
                                    j.kuota
                                  )) *
                                  100
                              )
                            )
                          : 0;

                      const status =
                        normalizeStatus(
                          j.status
                        );

                      return (
                        <div
                          key={j.id}
                          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 transition-shadow hover:${themeCardShadow}`}
                        >
                          {/* HEADER */}

                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-3 w-3 flex-shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    color,
                                }}
                              />

                              <h4 className="theme-text text-sm font-semibold">
                                {j.nama}
                              </h4>
                            </div>

                            <StatusBadge
                              status={
                                status
                              }
                            />
                          </div>

                          {/* DESCRIPTION */}

                          <p className="theme-text-secondary mt-2.5 text-xs leading-relaxed">
                            {j.deskripsi ||
                              "Tidak ada deskripsi."}
                          </p>

                          {/* DATE */}

                          {(j.tanggalMulai ||
                            j.tanggalSelesai) && (
                            <div className="theme-text-muted mt-3 text-[10px]">
                              Periode:{" "}
                              {j.tanggalMulai
                                ? new Date(
                                    j.tanggalMulai
                                  ).toLocaleDateString(
                                    "id-ID"
                                  )
                                : "-"}

                              {" - "}

                              {j.tanggalSelesai
                                ? new Date(
                                    j.tanggalSelesai
                                  ).toLocaleDateString(
                                    "id-ID"
                                  )
                                : "-"}
                            </div>
                          )}

                          {/* QUOTA */}

                          <div className="mt-4 flex items-center gap-2">
                            <div
                              className={`h-1.5 flex-1 overflow-hidden rounded-full ${themeNeutralSurface}`}
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

                            <span className="theme-text-secondary whitespace-nowrap font-mono text-xs tabular-nums">
                              {formatNumber(
                                pendaftar
                              )}
                              /
                              {formatNumber(
                                j.kuota
                              )}
                            </span>
                          </div>

                          {/* ACTIONS */}

                          <div
                            className={`mt-3.5 flex items-center justify-end gap-2 border-t ${themeDivider} pt-3`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  j
                                )
                              }
                              className={`theme-text-muted flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)]`}
                            >
                              <Pencil
                                size={12}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  j
                                )
                              }
                              className="theme-text-muted flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] hover:text-[var(--color-danger)]"
                            >
                              <Trash2
                                size={12}
                              />
                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
              </div>
            </section>

            {/* FOOTER */}

            <footer className="theme-text-muted py-3 text-center text-[11px]">
              © 2026 SmartSchool · Dashboard
              Admin PPDB · All rights reserved
            </footer>
          </div>
        </main>
      </div>

      {/* =====================================================
          MODAL TAMBAH / EDIT
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_38%,transparent)] p-4 backdrop-blur-sm">
          <div
            className={`theme-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl ${themeCardShadow}`}
          >
            <div className="p-6">

              {/* MODAL HEADER */}

              <div className="mb-5 flex items-center justify-between">
                <h3 className="theme-text text-sm font-semibold">
                  {form.id
                    ? "Edit Jalur"
                    : "Tambah Jalur"}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    !saving &&
                    setShowModal(
                      false
                    )
                  }
                  className="theme-text-muted transition hover:text-[var(--color-text)] disabled:opacity-50"
                  disabled={saving}
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-4"
              >
                {/* ERROR */}

                {error && (
                  <div className="rounded-md border border-[color-mix(in_srgb,var(--color-danger)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] px-3 py-2 text-xs text-[var(--color-danger)]">
                    {error}
                  </div>
                )}

                {/* NAMA */}

                <div>
                  <label className="theme-text-secondary mb-1 block text-xs">
                    Nama Jalur
                  </label>

                  <input
                    value={form.nama}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nama: e.target.value,
                      })
                    }
                    placeholder="Contoh: Jalur Zonasi"
                    className={`theme-input theme-text w-full rounded-md border px-3 py-2 text-sm outline-none placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                    required
                    disabled={saving}
                  />
                </div>

                {/* DESKRIPSI */}

                <div>
                  <label className="theme-text-secondary mb-1 block text-xs">
                    Deskripsi
                  </label>

                  <textarea
                    value={
                      form.deskripsi
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        deskripsi:
                          e.target.value,
                      })
                    }
                    placeholder="Penjelasan singkat mengenai jalur ini"
                    rows={2}
                    className={`theme-input theme-text w-full resize-none rounded-md border px-3 py-2 text-sm outline-none placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                    disabled={saving}
                  />
                </div>

                {/* KUOTA */}

                <div>
                  <label className="theme-text-secondary mb-1 block text-xs">
                    Kuota
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.kuota}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        kuota:
                          e.target.value,
                      })
                    }
                    placeholder="500"
                    className={`theme-input theme-text w-full rounded-md border px-3 py-2 text-sm outline-none placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                    required
                    disabled={saving}
                  />
                </div>

                {/* TANGGAL MULAI */}

                <div>
                  <label className="theme-text-secondary mb-1 block text-xs">
                    Tanggal Mulai
                  </label>

                  <input
                    type="date"
                    value={
                      form.tanggalMulai
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tanggalMulai:
                          e.target.value,
                      })
                    }
                    className={`theme-input theme-text w-full rounded-md border px-3 py-2 text-sm outline-none ${themeFocus}`}
                    disabled={saving}
                  />
                </div>

                {/* TANGGAL SELESAI */}

                <div>
                  <label className="theme-text-secondary mb-1 block text-xs">
                    Tanggal Selesai
                  </label>

                  <input
                    type="date"
                    value={
                      form.tanggalSelesai
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tanggalSelesai:
                          e.target.value,
                      })
                    }
                    className={`theme-input theme-text w-full rounded-md border px-3 py-2 text-sm outline-none ${themeFocus}`}
                    disabled={saving}
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label className="theme-text-secondary mb-1 block text-xs">
                    Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value,
                      })
                    }
                    className={`theme-input theme-text w-full rounded-md border px-3 py-2 text-sm outline-none ${themeFocus}`}
                    disabled={saving}
                  >
                    <option value="aktif">
                      Aktif
                    </option>

                    <option value="nonaktif">
                      Nonaktif
                    </option>
                  </select>
                </div>

                {/* BUTTON */}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                    className="theme-text-secondary rounded-md px-4 py-2 text-xs font-medium transition hover:text-[var(--color-text)] disabled:opacity-50"
                    disabled={saving}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className={`${themePrimaryGradient} rounded-md px-4 py-2 text-xs font-medium text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {saving
                      ? "Menyimpan..."
                      : form.id
                      ? "Simpan Perubahan"
                      : "Tambah Jalur"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL HAPUS
      ====================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_38%,transparent)] p-4 backdrop-blur-sm">
          <div
            className={`theme-card w-full max-w-sm rounded-xl ${themeCardShadow}`}
          >
            <div className="p-6">
              <h3 className="theme-text mb-2 text-sm font-semibold">
                Hapus Jalur?
              </h3>

              <p className="theme-text-secondary mb-5 text-xs">
                Jalur{" "}
                <span className="theme-text font-medium">
                  {
                    deleteTarget.nama
                  }
                </span>{" "}
                akan dinonaktifkan
                dari data PPDB.
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    !deleting &&
                    setDeleteTarget(
                      null
                    )
                  }
                  className="theme-text-secondary rounded-md px-4 py-2 text-xs font-medium transition hover:text-[var(--color-text)] disabled:opacity-50"
                  disabled={deleting}
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={
                    confirmDelete
                  }
                  disabled={deleting}
                  className="rounded-md bg-[var(--color-danger)] px-4 py-2 text-xs font-medium text-[var(--color-card)] transition hover:brightness-90 disabled:opacity-60"
                >
                  {deleting
                    ? "Menghapus..."
                    : "Ya, Hapus"}
                </button>
              </div>
            </div>
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
  tone = "primary",
  soft = false,
  description,
}) {
  const toneClass =
    tone === "success"
      ? "text-[var(--color-success)]"
      : "text-[var(--color-primary)]";

  if (soft) {
    return (
      <div
        className={`theme-card flex flex-col items-center justify-center rounded-xl p-5 text-center ${themeCardShadow}`}
      >
        <p className="theme-text-muted text-xs">
          {title}
        </p>

        <p className="theme-text mt-3 text-3xl font-bold">
          {value}
        </p>

        {description && (
          <p className="theme-text-muted mt-1 text-[10px]">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`theme-card rounded-xl p-5 ${themeCardShadow}`}
    >
      <p className="theme-text-muted text-xs">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${toneClass}`}
      >
        {value}
      </p>
    </div>
  );
}