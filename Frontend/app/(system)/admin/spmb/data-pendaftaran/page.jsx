"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Search,
  Plus,
  Users,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle,
  Route,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { getPendaftarPpdb } from "@/services/ppdb.service";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// HELPERS
// ============================================================

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "lulus") {
    return "Terverifikasi";
  }

  if (value === "ditolak") {
    return "Ditolak";
  }

  return "Menunggu Verifikasi";
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const config = {
    Terverifikasi: {
      className:
        "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
    },

    "Menunggu Verifikasi": {
      className:
        "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
    },

    Ditolak: {
      className:
        "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] text-[var(--color-danger)] border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]",
    },
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold ${
        config[status]?.className ||
        config["Menunggu Verifikasi"].className
      }`}
    >
      {status}
    </span>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function PendaftaranPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [jalur, setJalur] = useState("Semua");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD DATA
  // ============================================================

  async function loadData(isRefresh = false) {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getPendaftarPpdb();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal mengambil data pendaftar PPDB."
        );
      }

      const pendaftar = Array.isArray(response?.data)
        ? response.data
        : [];

      setData(pendaftar);
    } catch (err) {
      console.error(
        "GET PENDAFTAR PPDB ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data pendaftar PPDB."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // NORMALIZE DATA
  // ============================================================

  const normalizedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      nama: item?.namaLengkap || "-",
      nomor: item?.nomorPendaftaran || "-",
      jalurNama:
        item?.jalurPpdb?.nama || "-",
      tanggal: formatTanggal(
        item?.dibuatPada
      ),
      statusLabel: normalizeStatus(
        item?.status
      ),
    }));
  }, [data]);

  // ============================================================
  // JALUR
  // ============================================================

  const daftarJalur = useMemo(() => {
    const values = normalizedData
      .map((item) => item.jalurNama)
      .filter(
        (item) => item && item !== "-"
      );

    return [...new Set(values)];
  }, [normalizedData]);

  // ============================================================
  // FILTER
  // ============================================================

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return normalizedData.filter((item) => {
      const cocokSearch =
        !q ||
        String(item.nama || "")
          .toLowerCase()
          .includes(q) ||
        String(item.nisn || "")
          .toLowerCase()
          .includes(q) ||
        String(item.nomor || "")
          .toLowerCase()
          .includes(q) ||
        String(item.asalSekolah || "")
          .toLowerCase()
          .includes(q);

      const cocokStatus =
        status === "Semua" ||
        item.statusLabel === status;

      const cocokJalur =
        jalur === "Semua" ||
        item.jalurNama === jalur;

      return (
        cocokSearch &&
        cocokStatus &&
        cocokJalur
      );
    });
  }, [
    normalizedData,
    search,
    status,
    jalur,
  ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalPendaftar = data.length;

  const totalTerverifikasi = data.filter(
    (item) =>
      String(item?.status || "")
        .toLowerCase() === "lulus"
  ).length;

  const totalMenunggu = data.filter(
    (item) =>
      !item?.status ||
      String(item?.status || "")
        .toLowerCase() === "menunggu"
  ).length;

  const totalDitolak = data.filter(
    (item) =>
      String(item?.status || "")
        .toLowerCase() === "ditolak"
  ).length;

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportData = () => {
    if (!filtered.length) {
      return;
    }

    const header = [
      "Nomor Pendaftaran",
      "Nama Lengkap",
      "NISN",
      "Asal Sekolah",
      "Jalur",
      "Tanggal Pendaftaran",
      "Status",
      "Telepon",
      "Email",
      "Alamat",
    ];

    const rows = filtered.map((item) => [
      item.nomor,
      item.nama,
      item.nisn || "",
      item.asalSekolah || "",
      item.jalurNama,
      item.tanggal,
      item.statusLabel,
      item.telepon || "",
      item.email || "",
      item.alamat || "",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      "data-pendaftaran-ppdb.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // DETAIL
  // ============================================================

  const handleDetail = (id) => {
    if (!id) {
      return;
    }

    router.push(
      `/admin/spmb/data-pendaftaran/${encodeURIComponent(
        String(id)
      )}`
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

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
        <div className="shrink-0">
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
        </div>

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col p-4 sm:p-5 lg:p-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft}`}
                >
                  <Users
                    size={20}
                    className={themePrimaryText}
                  />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold">
                    Data Pendaftaran
                  </h1>

                  <p className="theme-text-muted text-xs">
                    Kelola seluruh data calon siswa SPMB
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportData}
                  disabled={!filtered.length}
                  className={`theme-neutral-border theme-card theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Download size={15} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/spmb/data-pendaftaran/tambah"
                    )
                  }
                  className={`${themePrimaryGradient} inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themeSmallShadow} transition hover:brightness-95`}
                >
                  <Plus size={16} />
                  Tambah Pendaftar
                </button>
              </div>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-4 flex shrink-0 items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-3 text-sm">
                <AlertCircle
                  size={18}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <div>
                  <p className="theme-danger font-semibold">
                    Gagal memuat data
                  </p>

                  <p className="theme-text-secondary mt-0.5 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="mb-4 grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat
                title="Total Pendaftar"
                value={totalPendaftar}
                icon={Users}
              />

              <Stat
                title="Terverifikasi"
                value={totalTerverifikasi}
                icon={CheckCircle2}
                tone="success"
              />

              <Stat
                title="Menunggu"
                value={totalMenunggu}
                icon={Clock3}
                tone="warning"
              />

              <Stat
                title="Ditolak"
                value={totalDitolak}
                icon={XCircle}
                tone="danger"
              />
            </div>

            {/* ==================================================
                MAIN CARD
            ================================================== */}

            <div
              className={`theme-card ${themeNeutralBorder} flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border ${themeCardShadow}`}
            >

              {/* ==================================================
                  FILTER BAR
              ================================================== */}

              <div
                className={`flex shrink-0 flex-col gap-3 border-b ${themeDivider} p-4 xl:flex-row`}
              >
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari nama, NISN, nomor pendaftaran..."
                    className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} pl-9 pr-3 text-xs outline-none transition ${themeFocus}`}
                  />
                </div>

                <select
                  value={jalur}
                  onChange={(e) =>
                    setJalur(e.target.value)
                  }
                  className={`theme-input theme-text theme-neutral-border h-10 rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                >
                  <option value="Semua">
                    Semua Jalur
                  </option>

                  {daftarJalur.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className={`theme-input theme-text theme-neutral-border h-10 rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                >
                  <option value="Semua">
                    Semua Status
                  </option>

                  <option value="Terverifikasi">
                    Terverifikasi
                  </option>

                  <option value="Menunggu Verifikasi">
                    Menunggu Verifikasi
                  </option>

                  <option value="Ditolak">
                    Ditolak
                  </option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("Semua");
                    setJalur("Semua");
                  }}
                  className={`theme-neutral-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs transition ${themeNeutralHover}`}
                >
                  <RefreshCw size={14} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className={`theme-neutral-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {refreshing ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw size={14} />
                  )}

                  Refresh
                </button>
              </div>

              {/* ==================================================
                  TABLE / STATES
              ================================================== */}

              <div className="min-h-0 flex-1 overflow-auto">
                {loading ? (
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                      <Loader2
                        size={28}
                        className={`${themePrimaryText} mx-auto animate-spin`}
                      />

                      <p className="theme-text-muted mt-3 text-xs font-medium">
                        Memuat data pendaftar...
                      </p>
                    </div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex min-h-[400px] items-center justify-center px-6">
                    <div className="text-center">
                      <div
                        className={`theme-text-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface}`}
                      >
                        <Users size={25} />
                      </div>

                      <h3 className="theme-text mt-4 text-sm font-bold">
                        Data pendaftar tidak ditemukan
                      </h3>

                      <p className="theme-text-muted mt-1 text-xs">
                        Belum ada pendaftar atau
                        tidak ada data yang sesuai
                        dengan filter.
                      </p>

                      {data.length === 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            loadData(true)
                          }
                          className={`${themePrimaryGradient} mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95`}
                        >
                          <RefreshCw size={14} />
                          Muat Ulang
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <table className="w-full min-w-[1050px]">
                    <thead
                      className={`theme-card sticky top-0 z-10`}
                    >
                      <tr
                        className={`border-b ${themeDivider}`}
                      >
                        <Th>Pendaftar</Th>
                        <Th>Asal Sekolah</Th>
                        <Th>Jalur</Th>
                        <Th>Tanggal</Th>
                        <Th>Status</Th>
                        <Th>Aksi</Th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((item) => (
                        <tr
                          key={item.id}
                          className={`border-b ${themeDivider} transition ${themeNeutralHover}`}
                        >
                          {/* PENDAFTAR */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText} text-xs font-bold`}
                              >
                                {item.nama
                                  .split(" ")
                                  .map(
                                    (x) =>
                                      x[0]
                                  )
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="theme-text text-xs font-semibold">
                                  {item.nama}
                                </p>

                                <p className="theme-text-muted text-[10px]">
                                  {item.nomor}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ASAL SEKOLAH */}
                          <td className="px-4 py-3">
                            <p className="theme-text-secondary max-w-[200px] truncate text-xs font-medium">
                              {item.asalSekolah ||
                                "-"}
                            </p>

                            <p className="theme-text-muted text-[10px]">
                              NISN{" "}
                              {item.nisn ||
                                "-"}
                            </p>
                          </td>

                          {/* JALUR */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-2.5 py-1 text-[10px] font-semibold`}
                            >
                              <Route size={11} />

                              {item.jalurNama}
                            </span>
                          </td>

                          {/* TANGGAL */}
                          <td className="theme-text-secondary px-4 py-3 text-xs">
                            {item.tanggal}
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-3">
                            <StatusBadge
                              status={
                                item.statusLabel
                              }
                            />
                          </td>

                          {/* AKSI */}
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDetail(
                                    item.id
                                  )
                                }
                                disabled={!item.id}
                                className={`theme-neutral-border theme-text-secondary rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ==================================================
                  FOOTER / PAGINATION
              ================================================== */}

              <div
                className={`flex shrink-0 items-center justify-between border-t ${themeDivider} px-4 py-3`}
              >
                <p className="theme-text-muted text-xs">
                  Menampilkan{" "}
                  {filtered.length} dari{" "}
                  {totalPendaftar} data
                </p>

                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled
                    className={`theme-neutral-border theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border opacity-50`}
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <button
                    type="button"
                    className={`${themePrimaryGradient} h-8 min-w-8 rounded-lg px-2 text-xs font-semibold text-[var(--color-card)]`}
                  >
                    1
                  </button>

                  <button
                    type="button"
                    disabled
                    className={`theme-neutral-border theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border opacity-50`}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// STAT
// ============================================================

function Stat({
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

    danger: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)]",
      text:
        "text-[var(--color-danger)]",
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
            {Number(
              value || 0
            ).toLocaleString("id-ID")}
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
// TABLE HEADER
// ============================================================

function Th({ children }) {
  return (
    <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
}