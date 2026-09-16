"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  MapPin,
  Sparkles,
  Users,
  FileCheck2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Info,
  CalendarDays,
  Loader2,
  AlertCircle,
  Route,
  Clock3,
  Search,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { getPendaftarPpdb } from "../../../../services/ppdb.service";

const colorMap = {
  zonasi: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    icon: MapPin,
  },
  prestasi: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    icon: Sparkles,
  },
  afirmasi: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    icon: Users,
  },
  pindahan: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    icon: FileCheck2,
  },
  default: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
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
    normalized.includes("perpindahan") ||
    normalized.includes("mutasi")
  ) {
    return colorMap.pindahan;
  }

  return colorMap.default;
}

function formatTanggalLengkap(value) {
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

function getDokumenPendukung(nama) {
  const normalized = String(nama || "").toLowerCase();

  if (normalized.includes("prestasi")) {
    return [
      "Kartu Keluarga (KK)",
      "Sertifikat atau Piagam Prestasi",
      "Fotokopi Rapor Kelas Terakhir",
    ];
  }

  if (normalized.includes("afirmasi")) {
    return [
      "Kartu Keluarga (KK)",
      "Dokumen Pendukung Afirmasi",
      "Fotokopi Rapor",
    ];
  }

  if (
    normalized.includes("pindahan") ||
    normalized.includes("perpindahan") ||
    normalized.includes("mutasi")
  ) {
    return [
      "Kartu Keluarga (KK)",
      "Surat Tugas / Perpindahan Kerja Orang Tua",
      "Fotokopi Rapor Kelas Terakhir",
    ];
  }

  return [
    "Kartu Keluarga (KK)",
    "Akta Kelahiran",
    "Fotokopi Rapor Kelas Terakhir",
  ];
}

function getStatusInfo(item) {
  const status = String(item?.status || "").toLowerCase();

  if (status === "aktif") {
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

  if (
    selesai &&
    !Number.isNaN(selesai.getTime())
  ) {
    return now >= mulai && now <= selesai;
  }

  return now >= mulai;
}

export default function JalurPendaftaranPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");

  const toggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  const loadData = useCallback(
    async (isRefresh = false) => {
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
              "Gagal mengambil data jalur pendaftaran."
          );
        }

        const pendaftar = Array.isArray(response?.data)
          ? response.data
          : [];

        const uniqueMap = new Map();

        pendaftar.forEach((item) => {
          const jalur = item?.jalurPpdb;

          if (!jalur?.id) {
            return;
          }

          if (!uniqueMap.has(jalur.id)) {
            uniqueMap.set(jalur.id, {
              id: jalur.id,
              sekolahId: item?.sekolahId || "",
              nama: jalur?.nama || "-",
              deskripsi: jalur?.deskripsi || "",
              kuota: Number(jalur?.kuota || 0),
              tanggalMulai: jalur?.tanggalMulai || null,
              tanggalSelesai: jalur?.tanggalSelesai || null,
              status: jalur?.status || "",
            });
          }
        });

        const jalur = Array.from(uniqueMap.values());

        setData(jalur);

        setOpenId((currentId) => {
          if (
            currentId &&
            jalur.some(
              (item) => item?.id === currentId
            )
          ) {
            return currentId;
          }

          return jalur[0]?.id || null;
        });
      } catch (err) {
        console.error(
          "GET JALUR PPDB ERROR:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data jalur pendaftaran."
        );

        setData([]);
        setOpenId(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return data;
    }

    return data.filter((item) => {
      const nama = String(
        item?.nama || ""
      ).toLowerCase();

      const deskripsi = String(
        item?.deskripsi || ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        deskripsi.includes(keyword)
      );
    });
  }, [data, search]);

  const totalJalur = data.length;

  const totalKuota = data.reduce(
    (total, item) =>
      total + Number(item?.kuota || 0),
    0
  );

  const jalurAktif = data.filter(
    (item) =>
      String(
        item?.status || ""
      ).toLowerCase() === "aktif"
  ).length;

  const jalurPeriodeAktif = data.filter(
    (item) =>
      String(
        item?.status || ""
      ).toLowerCase() === "aktif" &&
      isPeriodeAktif(item)
  ).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu="spmb"
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
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <span>SPMB</span>
                  <span>/</span>
                  <span className="font-medium text-blue-600">
                    Jalur Pendaftaran
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Jalur Pendaftaran
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                  Lihat informasi jalur pendaftaran,
                  kuota, periode, dan persyaratan SPMB.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
              >
                {refreshing ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw size={17} />
                )}

                {refreshing
                  ? "Memuat..."
                  : "Refresh"}
              </button>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Jalur"
                value={totalJalur}
                icon={Route}
                description="Jalur tersedia"
              />

              <StatCard
                title="Total Kuota"
                value={totalKuota}
                icon={Users}
                description="Daya tampung siswa"
              />

              <StatCard
                title="Jalur Aktif"
                value={jalurAktif}
                icon={CheckCircle2}
                description="Status aktif"
              />

              <StatCard
                title="Periode Aktif"
                value={jalurPeriodeAktif}
                icon={Clock3}
                description="Sedang berjalan"
              />
            </div>

            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Daftar Jalur Pendaftaran
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Klik jalur untuk melihat informasi lengkap.
                  </p>
                </div>

                <div className="relative w-full md:max-w-sm">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Cari nama jalur..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col items-center">
                  <Loader2
                    size={30}
                    className="animate-spin text-blue-600"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    Memuat jalur pendaftaran...
                  </p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Route size={30} />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {data.length === 0
                    ? "Belum ada jalur pendaftaran"
                    : "Data tidak ditemukan"}
                </h3>

                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                  {data.length === 0
                    ? "Belum ada data jalur pendaftaran yang tersedia."
                    : "Coba gunakan kata kunci pencarian yang berbeda."}
                </p>

                {data.length === 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      loadData(true)
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <RefreshCw size={17} />
                    Muat Ulang
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((item) => {
                  const isOpen =
                    openId === item?.id;

                  const style =
                    getColorByNama(
                      item?.nama
                    );

                  const Icon = style.icon;

                  const statusInfo =
                    getStatusInfo(item);

                  const dokumen =
                    getDokumenPendukung(
                      item?.nama
                    );

                  const periodeAktif =
                    isPeriodeAktif(item) &&
                    String(
                      item?.status || ""
                    ).toLowerCase() ===
                      "aktif";

                  return (
                    <div
                      key={item?.id}
                      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${style.border}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenId(
                            isOpen
                              ? null
                              : item?.id
                          )
                        }
                        className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                        aria-expanded={isOpen}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">
                              {item?.nama || "-"}
                            </p>

                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                            {item?.deskripsi ||
                              "Tidak ada deskripsi jalur."}
                          </p>
                        </div>

                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="text-xs text-slate-400">
                            Kuota
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-slate-800">
                            {Number(
                              item?.kuota || 0
                            ).toLocaleString(
                              "id-ID"
                            )}{" "}
                            siswa
                          </p>
                        </div>

                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-slate-400 transition-transform ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-4 pb-5 pt-5 sm:px-5 sm:pb-6">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <DetailCard
                              icon={Users}
                              label="Kuota"
                              value={`${Number(
                                item?.kuota || 0
                              ).toLocaleString(
                                "id-ID"
                              )} siswa`}
                            />

                            <DetailCard
                              icon={
                                CalendarDays
                              }
                              label="Tanggal Mulai"
                              value={formatTanggalLengkap(
                                item?.tanggalMulai
                              )}
                            />

                            <DetailCard
                              icon={Clock3}
                              label="Tanggal Selesai"
                              value={formatTanggalLengkap(
                                item?.tanggalSelesai
                              )}
                            />
                          </div>

                          <div className="mt-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                periodeAktif
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-100 text-slate-600"
                              }`}
                            >
                              <CheckCircle2
                                size={14}
                              />

                              {periodeAktif
                                ? "Sedang dalam periode pendaftaran"
                                : "Di luar periode pendaftaran"}
                            </span>
                          </div>

                          <div className="mt-6">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                              Deskripsi
                            </p>

                            <p className="text-sm leading-6 text-slate-600">
                              {item?.deskripsi ||
                                "Tidak ada deskripsi jalur pendaftaran."}
                            </p>
                          </div>

                          <div className="mt-6">
                            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                              Dokumen Pendukung
                            </p>

                            <div className="space-y-2">
                              {dokumen.map(
                                (
                                  dokumenItem,
                                  index
                                ) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2.5 rounded-lg bg-slate-50 px-3.5 py-3"
                                  >
                                    <FileCheck2
                                      size={15}
                                      className={`mt-0.5 shrink-0 ${style.text}`}
                                    />

                                    <span className="text-sm text-slate-600">
                                      {
                                        dokumenItem
                                      }
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-xs font-semibold text-slate-400">
                                ID Jalur
                              </p>

                              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                                {item?.id || "-"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-xs font-semibold text-slate-400">
                                ID Sekolah
                              </p>

                              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                                {item?.sekolahId ||
                                  "-"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-5 text-slate-400">
                              Data jalur berasal dari
                              sistem PPDB.
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/spmb/jalur-pendaftaran/detail/${encodeURIComponent(
                                    String(
                                      item?.id || ""
                                    )
                                  )}`
                                )
                              }
                              disabled={!item?.id}
                              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Lihat Detail
                              <ChevronRight
                                size={16}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
              <Info
                size={15}
                className="mt-0.5 shrink-0 text-blue-500"
              />

              <p className="leading-5">
                Data nama jalur, kuota, periode,
                status, ID jalur, dan ID sekolah
                ditampilkan berdasarkan data dari
                sistem PPDB.
              </p>
            </div>

            <footer className="mt-6 border-t border-slate-200/70 py-4 text-center">
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

function DetailCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className="text-slate-400"
        />

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

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {Number(
              value || 0
            ).toLocaleString("id-ID")}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}