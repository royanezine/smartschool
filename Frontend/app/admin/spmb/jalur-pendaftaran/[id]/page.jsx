"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Users,
  FileCheck2,
  Route,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  ChevronRight,
  FileText,
  UserRound,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import { getJalurPpdb } from "../../../../../services/jalurPpdb.service";

const colorMap = {
  zonasi: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    soft: "bg-blue-100",
    icon: MapPin,
  },
  prestasi: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    soft: "bg-amber-100",
    icon: Sparkles,
  },
  afirmasi: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    soft: "bg-emerald-100",
    icon: Users,
  },
  pindahan: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    soft: "bg-rose-100",
    icon: FileCheck2,
  },
  default: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    soft: "bg-slate-100",
    icon: Route,
  },
};

function getColorByNama(nama) {
  const normalized = String(nama || "").toLowerCase();

  if (normalized.includes("zonasi")) {
    return colorMap.zonasi;
  }

  if (normalized.includes("prestasi")) {
    return colorMap.prestasi;
  }

  if (normalized.includes("afirmasi")) {
    return colorMap.afirmasi;
  }

  if (
    normalized.includes("pindahan") ||
    normalized.includes("perpindahan")
  ) {
    return colorMap.pindahan;
  }

  return colorMap.default;
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

function isPeriodeAktif(item) {
  const now = new Date();

  const mulai = item?.tanggalMulai
    ? new Date(item.tanggalMulai)
    : null;

  const selesai = item?.tanggalSelesai
    ? new Date(item.tanggalSelesai)
    : null;

  if (!mulai || Number.isNaN(mulai.getTime())) {
    return false;
  }

  if (selesai && !Number.isNaN(selesai.getTime())) {
    return now >= mulai && now <= selesai;
  }

  return now >= mulai;
}

function getStatusInfo(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "aktif") {
    return {
      label: "Aktif",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: "Tidak Aktif",
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
  };
}

export default function DetailJalurPendaftaranPage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    if (!params?.id) {
      return "";
    }

    return decodeURIComponent(String(params.id));
  }, [params]);

  const [collapsed, setCollapsed] = useState(false);
  const [jalur, setJalur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const toggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  async function loadData(isRefresh = false) {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getJalurPpdb();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal mengambil data jalur pendaftaran."
        );
      }

      const jalurList = Array.isArray(response?.data)
        ? response.data
        : [];

      const selected = jalurList.find(
        (item) => String(item?.id) === String(id)
      );

      if (!selected) {
        throw new Error(
          "Jalur pendaftaran tidak ditemukan."
        );
      }

      setJalur(selected);
    } catch (err) {
      console.error("GET DETAIL JALUR PPDB ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail jalur pendaftaran."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const style = useMemo(() => {
    return getColorByNama(jalur?.nama);
  }, [jalur?.nama]);

  const Icon = style.icon;

  const statusInfo = getStatusInfo(jalur?.status);

  const periodeAktif =
    isPeriodeAktif(jalur) &&
    String(jalur?.status || "").toLowerCase() === "aktif";

  const filteredPendaftar = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return [];
    }

    return [];
  }, [search]);

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar
          active="spmb"
          setActive={() => {}}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          role="admin"
        />

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex flex-1 items-center justify-center overflow-y-auto">
            <div className="flex flex-col items-center">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Memuat detail jalur pendaftaran...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/spmb/jalur-pendaftaran"
                  )
                }
                className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Kembali
              </button>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>SPMB</span>
                    <span>/</span>
                    <span>Jalur Pendaftaran</span>
                    <span>/</span>
                    <span className="font-medium text-blue-600">
                      Detail
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    Detail Jalur Pendaftaran
                  </h1>

                  <p className="mt-1 text-sm leading-6 text-slate-500 md:text-base">
                    Kelola informasi dan data pendaftar
                    pada jalur pendaftaran ini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw size={17} />
                  )}

                  {refreshing ? "Memuat..." : "Refresh"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {jalur && (
              <>
                <section
                  className={`overflow-hidden rounded-2xl border ${style.border} bg-white shadow-sm`}
                >
                  <div className="p-5 sm:p-6 lg:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${style.bg} ${style.text}`}
                        >
                          <Icon size={25} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                              {jalur.nama || "-"}
                            </h2>

                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            {jalur.deskripsi ||
                              "Tidak ada deskripsi jalur pendaftaran."}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                          periodeAktif
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        <CheckCircle2 size={15} />

                        {periodeAktif
                          ? "Periode sedang berjalan"
                          : "Di luar periode"}
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <InfoCard
                        icon={Users}
                        label="Kuota"
                        value={`${Number(
                          jalur.kuota || 0
                        ).toLocaleString(
                          "id-ID"
                        )} siswa`}
                      />

                      <InfoCard
                        icon={CalendarDays}
                        label="Tanggal Mulai"
                        value={formatTanggal(
                          jalur.tanggalMulai
                        )}
                      />

                      <InfoCard
                        icon={Clock3}
                        label="Tanggal Selesai"
                        value={formatTanggal(
                          jalur.tanggalSelesai
                        )}
                      />

                      <InfoCard
                        icon={ShieldCheck}
                        label="Status Periode"
                        value={
                          periodeAktif
                            ? "Sedang Berjalan"
                            : "Tidak Berjalan"
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <ClipboardList
                            size={19}
                            className="text-blue-600"
                          />

                          <h2 className="text-base font-bold text-slate-900">
                            Daftar Pendaftar
                          </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Daftar calon peserta didik yang
                          mendaftar melalui jalur{" "}
                          <span className="font-semibold text-slate-700">
                            {jalur.nama || "-"}
                          </span>
                          .
                        </p>
                      </div>

                      <div className="relative w-full lg:max-w-sm">
                        <Search
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(event) =>
                            setSearch(event.target.value)
                          }
                          placeholder="Cari nama atau NISN..."
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredPendaftar.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <UserRound size={30} />
                      </div>

                      <h3 className="mt-4 text-base font-bold text-slate-900">
                        Data pendaftar belum tersedia
                      </h3>

                      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">
                        Halaman detail jalur sudah siap.
                        Data calon siswa, status seleksi, dan
                        berkas seperti KK, Akta, dan Ijazah
                        akan ditampilkan pada bagian ini setelah
                        endpoint data pendaftar tersedia.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                              No
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                              Nama
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                              NISN
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                              Status
                            </th>

                            <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredPendaftar.map(
                            (item, index) => (
                              <tr
                                key={item.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                              >
                                <td className="px-5 py-4 text-sm text-slate-500">
                                  {index + 1}
                                </td>

                                <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                                  {item.namaLengkap ||
                                    "-"}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {item.nisn || "-"}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {item.status || "-"}
                                </td>

                                <td className="px-5 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/admin/spmb/pendaftar/detail/${encodeURIComponent(
                                          item.id
                                        )}`
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                  >
                                    Detail
                                    <ChevronRight
                                      size={14}
                                    />
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileCheck2 size={19} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Dokumen Pendukung
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Persyaratan dokumen yang berkaitan
                          dengan jalur pendaftaran.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <DocumentItem label="Kartu Keluarga (KK)" />
                      <DocumentItem label="Akta Kelahiran" />
                      <DocumentItem label="Dokumen persyaratan jalur" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FileText size={19} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Informasi Sistem
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Informasi identitas data jalur
                          pendaftaran.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <SystemInfo
                        label="ID Jalur"
                        value={jalur.id}
                      />

                      <SystemInfo
                        label="ID Sekolah"
                        value={jalur.sekolahId}
                      />

                      <SystemInfo
                        label="Status"
                        value={statusInfo.label}
                      />
                    </div>
                  </div>
                </section>

                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="leading-5">
                    Halaman ini mengambil detail jalur berdasarkan
                    ID pada URL. Detail calon siswa dan berkas
                    pendaftar belum diambil dari backend karena
                    endpoint GET pendaftaran PPDB belum tersedia.
                  </p>
                </div>
              </>
            )}

            <footer className="mt-8 border-t border-slate-200/70 py-5 text-center">
              <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
                <span className="text-[10px] font-medium text-slate-400">
                  © 2026 SmartSchool
                </span>

                <span className="hidden text-slate-300 sm:block">
                  •
                </span>

                <span className="text-[10px] text-slate-400">
                  Dashboard Admin Sekolah
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-slate-400" />

        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function DocumentItem({ label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500">
        <FileCheck2 size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-700">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          Akan diperiksa pada detail pendaftar
        </p>
      </div>

      <ChevronRight
        size={15}
        className="shrink-0 text-slate-300"
      />
    </div>
  );
}

function SystemInfo({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      <p className="text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-medium text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}