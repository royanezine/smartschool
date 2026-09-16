"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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

import { getPendaftarPpdb } from "../../../../services/ppdb.service";

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
    Terverifikasi:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Menunggu Verifikasi":
      "bg-amber-50 text-amber-700 border-amber-100",
    Ditolak:
      "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold ${
        config[status] ||
        config["Menunggu Verifikasi"]
      }`}
    >
      {status}
    </span>
  );
}

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

  const daftarJalur = useMemo(() => {
    const values = normalizedData
      .map((item) => item.jalurNama)
      .filter(
        (item) => item && item !== "-"
      );

    return [...new Set(values)];
  }, [normalizedData]);

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
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
            <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ff]">
                  <Users
                    size={20}
                    className="text-[#155DFC]"
                  />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Data Pendaftaran
                  </h1>

                  <p className="text-xs text-slate-500">
                    Kelola seluruh data calon siswa SPMB
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportData}
                  disabled={!filtered.length}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0d47c9]"
                >
                  <Plus size={16} />
                  Tambah Pendaftar
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex shrink-0 items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Gagal memuat data
                  </p>

                  <p className="mt-0.5 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            )}

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
              />

              <Stat
                title="Menunggu"
                value={totalMenunggu}
                icon={Clock3}
              />

              <Stat
                title="Ditolak"
                value={totalDitolak}
                icon={XCircle}
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex shrink-0 flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari nama, NISN, nomor pendaftaran..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#8bb4ff] focus:bg-white focus:ring-2 focus:ring-[#155DFC]/10"
                  />
                </div>

                <select
                  value={jalur}
                  onChange={(e) =>
                    setJalur(e.target.value)
                  }
                  className="h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-600 outline-none"
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
                  className="h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-600 outline-none"
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
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs text-slate-500 hover:bg-slate-50"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="min-h-0 flex-1 overflow-auto">
                {loading ? (
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                      <Loader2
                        size={28}
                        className="mx-auto animate-spin text-[#155DFC]"
                      />

                      <p className="mt-3 text-xs font-medium text-slate-500">
                        Memuat data pendaftar...
                      </p>
                    </div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex min-h-[400px] items-center justify-center px-6">
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Users size={25} />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-700">
                        Data pendaftar tidak ditemukan
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
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
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d47c9]"
                        >
                          <RefreshCw size={14} />
                          Muat Ulang
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <table className="w-full min-w-[1050px]">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <Th>Pendaftar</Th>
                        <Th>Asal Sekolah</Th>
                        <Th>Jalur</Th>
                        <Th>Tanggal</Th>
                        <Th>Status</Th>
                        <Th>Aksi</Th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1ff] text-xs font-bold text-[#155DFC]">
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
                                <p className="text-xs font-semibold text-slate-700">
                                  {item.nama}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  {item.nomor}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="max-w-[200px] truncate text-xs font-medium text-slate-600">
                              {item.asalSekolah ||
                                "-"}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              NISN{" "}
                              {item.nisn ||
                                "-"}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                              <Route
                                size={11}
                              />

                              {item.jalurNama}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-500">
                            {item.tanggal}
                          </td>

                          <td className="px-4 py-3">
                            <StatusBadge
                              status={
                                item.statusLabel
                              }
                            />
                          </td>

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
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-[#155DFC] hover:bg-[#eaf1ff] hover:text-[#155DFC] disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Menampilkan{" "}
                  {filtered.length} dari{" "}
                  {totalPendaftar} data
                </p>

                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
                  >
                    <ChevronLeft
                      size={15}
                    />
                  </button>

                  <button
                    type="button"
                    className="h-8 min-w-8 rounded-lg bg-[#155DFC] px-2 text-xs font-semibold text-white"
                  >
                    1
                  </button>

                  <button
                    type="button"
                    disabled
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
                  >
                    <ChevronRight
                      size={15}
                    />
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

function Stat({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {Number(
              value || 0
            ).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf1ff]">
          <Icon
            size={18}
            className="text-[#155DFC]"
          />
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}