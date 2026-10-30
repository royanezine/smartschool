"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import Link from "next/link";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Link2,
  X,
  Search,
  RefreshCw,
  CheckCircle2,
  Eye,
} from "lucide-react";

import TautanPendaftaranModal from "@/app/components/spmb/TautanPendaftaranModal";

import {
  hasPermission,
  subscribeAuth,
} from "@/lib/auth";

import {
  getJalurPpdb,
  getJalurPpdbById,
  deleteJalurPpdb,
} from "@/services/jalurPpdb.service";


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

const AKSES_DITOLAK_VIEW =
  "Akses ditolak: akun ini tidak memiliki izin ppdb.view untuk melihat jalur PPDB.";

function getPermissionSnapshot() {
  return JSON.stringify({
    view: hasPermission("ppdb.view"),
    create: hasPermission("ppdb.create"),
    update: hasPermission("ppdb.update"),
    delete: hasPermission("ppdb.delete"),
  });
}

function getServerPermissionSnapshot() {
  return "null";
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


export default function JalurPPDBPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [jalurList, setJalurList] = useState([]);

  const [activeStatus, setActiveStatus] =
    useState("Semua");

  const [search, setSearch] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [linkTarget, setLinkTarget] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const permissionSnapshot = useSyncExternalStore(
    subscribeAuth,
    getPermissionSnapshot,
    getServerPermissionSnapshot
  );

  const izin = useMemo(() => {
    try {
      const parsed = JSON.parse(permissionSnapshot);

      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }, [permissionSnapshot]);

  const checkingAccess = izin === null;
  const canView = Boolean(izin?.view);
  const displayedError =
    error || (izin && !izin.view ? AKSES_DITOLAK_VIEW : "");
  const summaryLoading =
    checkingAccess || (loading && canView);


  const fetchJalur = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getJalurPpdb();

        if (response?.success === false) {
          throw new Error(
            response?.message ||
              "Gagal mengambil data jalur PPDB"
          );
        }

        const data =
          response?.data ??
          response?.result ??
          [];

        const rows =
          Array.isArray(data) ? data : [];

        setJalurList(rows);

        return rows;
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

        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!canView) {
      return;
    }

    Promise.resolve().then(() => {
      fetchJalur();
    });
  }, [canView, fetchJalur]);


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



  const openTautan = (jalur) => {
    if (!jalur?.id) {
      setError(
        "Jalur tidak memiliki ID dari Backend sehingga tautan tidak dapat dibuat."
      );

      return;
    }

    setError("");
    setSuccessMessage("");
    setLinkTarget(jalur);

    getJalurPpdbById(jalur.id)
      .then((response) => {
        const detail = response?.data;

        if (!detail?.id) {
          return;
        }

        setLinkTarget((current) => {
          if (
            !current ||
            String(current.id) !==
              String(detail.id)
          ) {
            return current;
          }

          return {
            ...current,
            ...detail,
            sekolahId:
              detail.sekolahId ||
              current.sekolahId,
          };
        });
      })
      .catch((err) => {
        console.error(
          "Error memuat detail jalur PPDB:",
          err
        );

        if (!jalur.sekolahId) {
          setError(
            err?.message ||
              "Detail jalur tidak dapat dimuat sehingga sekolahId tidak tersedia."
          );
        }
      });
  };


  const confirmDelete =
    async () => {
      if (!deleteTarget?.id)
        return;

      if (!izin?.delete) {
        setDeleteTarget(null);
        setError(
          "Akses ditolak: akun ini tidak memiliki izin ppdb.delete untuk menghapus jalur PPDB."
        );
        return;
      }

      const nama = deleteTarget.nama || "Jalur PPDB";

      try {
        setDeleting(true);
        setError("");
        setSuccessMessage("");

        const response = await deleteJalurPpdb(
          deleteTarget.id
        );

        if (response?.success === false) {
          throw new Error(
            response?.message ||
              "Gagal menghapus jalur PPDB"
          );
        }

        setDeleteTarget(null);

        await fetchJalur();

        setSuccessMessage(
          `${nama} berhasil dihapus dari daftar jalur.`
        );
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


  const toggleSidebar = () => {
    setIsCollapsed(
      (prev) => !prev
    );
  };


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        active="spmb"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
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
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-5 px-4 py-6 sm:px-6 lg:px-8">


            <div className="theme-text-muted flex items-center gap-1.5 text-xs">
              <span>PPDB</span>

              <ChevronRight size={12} />

              <span className="theme-text-secondary font-medium">
                Jalur Pendaftaran
              </span>
            </div>


            {displayedError && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] px-4 py-3 text-xs text-[var(--color-danger)]">
                <span>
                  {displayedError}
                </span>

                {error && (
                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="opacity-70 transition hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-4 py-3 text-xs text-[var(--color-success)]">
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className="shrink-0"
                  />
                  {successMessage}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSuccessMessage("")
                  }
                  className="opacity-70 transition hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}


            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <SummaryCard
                title="Total Jalur"
                value={
                  summaryLoading
                    ? "..."
                    : jalurList.length
                }
              />

              <SummaryCard
                title="Jalur Aktif"
                value={
                  summaryLoading
                    ? "..."
                    : aktifCount
                }
                tone="success"
              />

              <SummaryCard
                title="Total Kuota"
                value={
                  summaryLoading
                    ? "..."
                    : formatNumber(
                        totalKuota
                      )
                }
              />

              <SummaryCard
                title="Pendaftar"
                value="-"
                soft
                description="Data pendaftar belum tersedia dari Backend"
              />
            </section>


            <section
              className={`theme-card overflow-hidden rounded-xl ${themeCardShadow}`}
            >
              <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b ${themeDivider} px-5 pb-4 pt-4`}
              >

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


                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMessage("");
                      fetchJalur();
                    }}
                    disabled={loading || !izin?.view}
                    className={`flex items-center justify-center rounded-md border ${themeNeutralBorder} theme-text-muted p-2 transition-colors ${themeNeutralHover} disabled:opacity-50`}
                    title="Refresh"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        loading && canView
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

                  <Link
                    href="/admin/spmb/jalur/tambah"
                    title={
                      izin?.create
                        ? "Tambah jalur PPDB"
                        : "Butuh izin ppdb.create"
                    }
                    className={`${themePrimaryGradient} flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium text-[var(--color-card)] transition hover:brightness-95 ${!izin?.create ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <Plus size={14} />
                    Tambah Jalur
                  </Link>
                </div>
              </div>


              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">


                {(checkingAccess || (loading && canView)) && (
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


                {!checkingAccess &&
                  canView &&
                  !loading &&
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


                {!checkingAccess &&
                  canView &&
                  !loading &&
                  filtered.map(
                    (j, index) => {
                      const color =
                        getColor(
                          index
                        );

                      const status =
                        normalizeStatus(
                          j.status
                        );

                      return (
                        <div
                          key={j.id}
                          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 transition-shadow hover:${themeCardShadow}`}
                        >

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


                          <p className="theme-text-secondary mt-2.5 text-xs leading-relaxed">
                            {j.deskripsi ||
                              "Tidak ada deskripsi."}
                          </p>


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


                          <div
                            className={`mt-4 flex items-center justify-between gap-2 border-t ${themeDivider} pt-3`}
                          >
                            <span className="theme-text-muted text-xs">
                              Kuota
                            </span>

                            <span className="theme-text-secondary whitespace-nowrap font-mono text-xs tabular-nums">
                              {formatNumber(
                                j.kuota
                              )}{" "}
                              siswa
                            </span>
                          </div>


                          <div
                            className={`mt-3.5 flex items-center justify-end gap-2 border-t ${themeDivider} pt-3`}
                          >
                            <Link
                              href={`/admin/spmb/jalur/${encodeURIComponent(j.id)}`}
                              className="theme-text-muted flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)]"
                              title="Lihat Detail Jalur"
                            >
                              <Eye size={12} />
                              Detail
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                openTautan(j)
                              }
                              className={`theme-text-muted flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)]`}
                            >
                              <Link2 size={12} />
                              Tautan
                            </button>

                            <Link
                              href={`/admin/spmb/jalur/${encodeURIComponent(j.id)}/edit`}
                              title={
                                izin?.update
                                  ? "Edit jalur"
                                  : "Butuh izin ppdb.update"
                              }
                              className={`theme-text-muted flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)] ${!izin?.update ? "pointer-events-none opacity-40" : ""}`}
                            >
                              <Pencil
                                size={12}
                              />
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                if (!izin?.delete) {
                                  setError(
                                    "Akses ditolak: akun ini tidak memiliki izin ppdb.delete untuk menghapus jalur PPDB."
                                  );
                                  return;
                                }

                                setSuccessMessage("");
                                setDeleteTarget(j);
                              }}
                              disabled={!izin?.delete}
                              title={
                                izin?.delete
                                  ? "Hapus jalur"
                                  : "Butuh izin ppdb.delete"
                              }
                              className="theme-text-muted flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-40"
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


            <footer className="theme-text-muted py-3 text-center text-[11px]">
              © 2026 SmartSchool · Dashboard
              Admin PPDB · All rights reserved
            </footer>
          </div>
        </main>
      </div>


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

      <TautanPendaftaranModal
        open={Boolean(linkTarget)}
        jalur={linkTarget}
        onClose={() => setLinkTarget(null)}
      />
    </div>
  );
}

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