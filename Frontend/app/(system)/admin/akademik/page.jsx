"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ClipboardList,
  NotebookPen,
  Award,
  FileSpreadsheet,
  GraduationCap,
  Search,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  CalendarDays,
  School,
  Split,
  RefreshCw,
} from "lucide-react";

import { getUsers } from "@/services/user.service";
import { getKelas, getKelasById } from "@/services/kelas.service";


const getInitials = (nama = "") => {
  const parts = nama.trim().split(" ");

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return nama.substring(0, 2).toUpperCase();
};

const getAvatarColor = (nama = "") => {
  const colors = [
    "bg-blue-600",
    "bg-slate-600",
    "bg-cyan-600",
    "bg-indigo-600",
    "bg-sky-600",
    "bg-teal-600",
  ];

  return colors[nama.length % colors.length];
};





export default function AkademikPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      let allSiswa = [];
      let pageSiswa = 1;
      let totalPagesSiswa = 1;

      do {
        const res = await getUsers({
          page: pageSiswa,
          limit: 100,
          role: "siswa",
        });
        const raw = res?.data ?? [];
        const rows = Array.isArray(raw) ? raw : [];
        allSiswa = allSiswa.concat(rows);

        const nextTotal = Number(
          res?.pagination?.totalPages ??
            res?.meta?.totalPages ??
            1
        );
        totalPagesSiswa = Number.isFinite(nextTotal) && nextTotal > 0 ? nextTotal : 1;
        pageSiswa += 1;
      } while (pageSiswa <= totalPagesSiswa);

      let allKelas = [];
      let pageKelas = 1;
      let totalPagesKelas = 1;

      do {
        const resKelas = await getKelas({
          page: pageKelas,
          limit: 100,
          sortBy: "nama",
          sortOrder: "asc",
        });
        const rawK = resKelas?.data ?? resKelas?.data?.data ?? [];
        const rowsK = Array.isArray(rawK) ? rawK : [];
        allKelas = allKelas.concat(rowsK);

        const nextTotalK = Number(
          resKelas?.meta?.totalPages ??
            resKelas?.pagination?.totalPages ??
            1
        );
        totalPagesKelas = Number.isFinite(nextTotalK) && nextTotalK > 0 ? nextTotalK : 1;
        pageKelas += 1;
      } while (pageKelas <= totalPagesKelas);

      const siswaKelasMap = {};
      const kelasDetailFailedSet = new Set();

      const kelasDetails = await Promise.allSettled(
        allKelas.map((k) => getKelasById(k.id))
      );

      kelasDetails.forEach((result, idx) => {
        const k = allKelas[idx];
        if (result.status === "fulfilled") {
          const detail =
            result.value?.data?.data ??
            result.value?.data ??
            result.value;
          const kNama = k?.nama || "Tanpa Kelas";
          const anggota = Array.isArray(detail?.anggota) ? detail.anggota : [];
          anggota.forEach((item) => {
            const sid = item?.siswa?.id ?? item?.siswaId ?? item?.penggunaId;
            if (sid) {
              siswaKelasMap[sid] = kNama;
            }
          });
        } else {
          if (k?.id) {
            kelasDetailFailedSet.add(k.id);
          }
        }
      });

      const hasKelasDetailFailure = kelasDetailFailedSet.size > 0;
      const normalizedSiswa = allSiswa.map((s) => {
        let kelasNama = "Belum ada kelas";
        if (siswaKelasMap[s.id]) {
          kelasNama = siswaKelasMap[s.id];
        } else if (hasKelasDetailFailure) {
          kelasNama = "Gagal memuat kelas";
        }

        return {
          id: s.id,
          nama: s.namaLengkap || s.nama || "Tanpa Nama",
          kelas: kelasNama,
          status: s.status || "aktif",
        };
      });

      setSiswaList(normalizedSiswa);
      setKelasList(allKelas);
    } catch (err) {
      console.error("Gagal memuat data akademik:", err);
      setError("Gagal memuat data dari server. Periksa koneksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const totalSiswa = siswaList.length;

  const ringkasanKelas = useMemo(() => {
    const map = {};

    kelasList.forEach((k) => {
      const rawCount =
        k?._count?.anggota ?? k?.jumlahSiswa ?? k?.jumlah_siswa;
      const countNum =
        rawCount !== undefined && rawCount !== null
          ? Number(rawCount)
          : null;

      map[k.nama] = {
        kelas: k.nama,
        jumlah: Number.isFinite(countNum) ? countNum : null,
      };
    });

    siswaList.forEach((siswa) => {
      if (siswa.kelas && siswa.kelas !== "Belum ada kelas" && siswa.kelas !== "Gagal memuat kelas") {
        if (!map[siswa.kelas]) {
          map[siswa.kelas] = {
            kelas: siswa.kelas,
            jumlah: null,
          };
        }
      }
    });

    return Object.values(map).sort((a, b) => a.kelas.localeCompare(b.kelas));
  }, [kelasList, siswaList]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return siswaList;
    }

    return siswaList.filter(
      (item) =>
        item.nama.toLowerCase().includes(keyword) ||
        item.kelas.toLowerCase().includes(keyword)
    );
  }, [siswaList, search]);


  const quickLinks = [
    {
      label: "Tahun Ajaran",
      icon: CalendarDays,
      path: "/admin/akademik/tahun-ajaran",
    },
    {
      label: "Kelas & Rombel",
      icon: School,
      path: "/admin/akademik/kelas",
    },
    {
      label: "Jurusan",
      icon: Split,
      path: "/admin/akademik/jurusan",
    },
    {
      label: "Entry Nilai e-Rapor",
      icon: NotebookPen,
      path: "/admin/eraport/entry-nilai",
    },
    {
      label: "Cetak Rapor",
      icon: FileSpreadsheet,
      path: "/admin/eraport/cetak-raport",
    },
  ];


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">

      <Sidebar
        active="akademik"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />


      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />


        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
            <div className="space-y-6">


              <section>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-3">

                    <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm">
                      <GraduationCap size={21} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                          Akademik
                        </h1>

                        <span className="theme-info inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold">
                          Tahun Aktif
                        </span>

                      </div>

                      <p className="theme-text-muted mt-1 max-w-2xl text-xs leading-5 sm:text-sm">
                        Pantau perkembangan akademik siswa melalui nilai,
                        prestasi, sikap, dan status rapor.
                      </p>
                    </div>
                  </div>


                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadData()}
                      disabled={loading}
                      title="Perbarui Data"
                      className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                      <span>{loading ? "Memuat..." : "Refresh"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/siswa"
                        )
                      }
                      className="theme-primary inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg px-4 text-xs font-semibold shadow-sm transition xl:self-center"
                    >
                      <ClipboardList size={15} />

                      Data Siswa

                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </section>


              <section className="theme-card overflow-hidden rounded-xl border shadow-sm">
                <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-5">


                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Users size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Total Siswa
                        </p>

                        <p className="theme-text mt-1 text-xl font-bold">
                          {totalSiswa}
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Siswa terdata
                        </p>
                      </div>

                    </div>
                  </div>


                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <TrendingUp size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Rata-rata Nilai
                        </p>

                        <p className="theme-text mt-1 text-xl font-bold">
                          —
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Nilai akademik
                        </p>
                      </div>

                    </div>
                  </div>


                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Award size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Prestasi
                        </p>

                        <p className="theme-text mt-1 text-xl font-bold">
                          —
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Total capaian
                        </p>
                      </div>

                    </div>
                  </div>


                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-danger flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <AlertCircle size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Perlu Perhatian
                        </p>

                        <p className="theme-text mt-1 text-xl font-bold">
                          —
                        </p>

                        <p className="theme-text-muted mt-0.5 text-[10px]">
                          Siswa perlu ditinjau
                        </p>
                      </div>

                    </div>
                  </div>


                  <div className="col-span-2 min-w-0 p-4 sm:col-span-1 sm:p-5">
                    <div className="flex items-start gap-3">

                      <div className="theme-success flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <FileSpreadsheet size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">

                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                            Rapor Selesai
                          </p>

                          <p className="theme-text text-sm font-bold">
                            —
                          </p>

                        </div>

                        <div className="theme-card-soft mt-2 h-1.5 overflow-hidden rounded-full">
                          <div
                            className="theme-primary h-full rounded-full transition-all"
                            style={{
                              width: "0%",
                            }}
                          />
                        </div>

                        <p className="theme-text-muted mt-1.5 text-[10px]">
                          — dari {totalSiswa} siswa
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </section>


              {error && (
                <div className="theme-danger flex items-center justify-between rounded-xl border p-4 text-xs font-medium shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadData()}
                    className="underline hover:no-underline"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              <section className="flex flex-col gap-3">
                <div>
                  <p className="theme-text text-sm font-bold">
                    Modul Akademik
                  </p>

                  <p className="theme-text-muted mt-1 text-xs">
                    Akses cepat ke pengelolaan akademik.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() =>
                          router.push(item.path)
                        }
                        className="theme-card theme-border theme-text-secondary theme-header-hover group inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-semibold shadow-sm transition"
                      >
                        <Icon
                          size={14}
                          className="theme-text-muted transition group-hover:theme-sidebar-text-active"
                        />

                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </section>


              <section className="theme-card overflow-hidden rounded-xl border shadow-sm">

                <div className="theme-border-soft border-b px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-1">

                    <h2 className="theme-text text-sm font-bold">
                      Ringkasan Per Kelas
                    </h2>

                    <p className="theme-text-muted text-xs">
                      Perbandingan capaian akademik setiap kelas.
                    </p>

                  </div>
                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[780px] border-collapse">

                    <thead>
                      <tr className="theme-table-header">

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Kelas
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Siswa
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Rata-rata
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Prestasi
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Perhatian
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Rapor
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {ringkasanKelas.map((item) => (
                        <tr
                          key={item.kelas}
                          className="theme-table-hover transition"
                        >

                          <td className="theme-border-soft border-b px-5 py-3.5">
                            <div className="flex items-center gap-2.5">

                              <div className="theme-info flex h-8 w-8 items-center justify-center rounded-lg">
                                <GraduationCap size={15} />
                              </div>

                              <span className="theme-text-secondary text-xs font-bold">
                                {item.kelas}
                              </span>

                            </div>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5 text-center text-xs font-medium">
                            <span className="theme-text-secondary">
                              {item.jumlah !== null && item.jumlah !== undefined
                                ? item.jumlah
                                : "—"}
                            </span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5 text-center text-xs">
                            <span className="theme-text-muted">—</span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5 text-center text-xs">
                            <span className="theme-text-muted">—</span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5 text-center text-xs">
                            <span className="theme-text-muted">—</span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="theme-text-muted text-[11px]">
                                —
                              </span>
                            </div>
                          </td>

                        </tr>
                      ))}

                      {loading && ringkasanKelas.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center">
                            <p className="theme-text-muted text-xs">
                              Memuat ringkasan kelas...
                            </p>
                          </td>
                        </tr>
                      )}

                      {!loading && ringkasanKelas.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-12 text-center"
                          >
                            <p className="theme-text-secondary text-sm font-semibold">
                              Belum ada data kelas
                            </p>

                            <p className="theme-text-muted mt-1 text-xs">
                              Data akan tampil setelah kelas dan siswa tersedia.
                            </p>
                          </td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>
              </section>


              <section className="theme-card overflow-hidden rounded-xl border shadow-sm">


                <div className="theme-border-soft border-b px-4 py-4 sm:px-5">

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Data Akademik Siswa
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        Ringkasan kondisi akademik setiap siswa.
                      </p>
                    </div>

                    <div className="w-full lg:w-[320px]">

                      <div className="relative">

                        <Search
                          size={16}
                          className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                          placeholder="Cari nama atau kelas..."
                          className="theme-input h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition"
                        />

                      </div>
                    </div>

                  </div>
                </div>


                <div className="overflow-x-auto">

                  <table className="w-full min-w-[900px] border-collapse">

                    <thead>
                      <tr className="theme-table-header">

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Siswa
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Kelas
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Nilai
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Prestasi
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider">
                          Sikap
                        </th>

                        <th className="theme-border-soft border-b px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Rapor
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filtered.map((student) => (
                        <tr
                          key={student.id}
                          className="theme-table-hover transition"
                        >


                          <td className="theme-border-soft border-b px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getAvatarColor(
                                  student.nama
                                )} text-[11px] font-bold text-white`}
                              >
                                {getInitials(student.nama)}
                              </div>

                              <div className="min-w-0">

                                <p className="theme-text-secondary truncate text-xs font-bold sm:text-sm">
                                  {student.nama}
                                </p>

                                <p className="theme-text-muted mt-0.5 text-[10px]">
                                  ID Siswa: {student.id}
                                </p>

                              </div>

                            </div>
                          </td>


                          <td className="theme-border-soft border-b px-5 py-4">

                            <span className="theme-info inline-flex rounded-md px-2.5 py-1 text-[10px] font-semibold">
                              {student.kelas}
                            </span>

                          </td>


                          <td className="theme-border-soft border-b px-5 py-4 text-center">
                            <span className="theme-text-muted text-xs">—</span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-4 text-center">
                            <span className="theme-text-muted text-xs">—</span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-4 text-center">
                            <span className="theme-text-muted text-xs">—</span>
                          </td>

                          <td className="theme-border-soft border-b px-5 py-4">
                            <span className="theme-text-muted text-xs">—</span>
                          </td>

                        </tr>
                      ))}

                      {loading && filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-14 text-center">
                            <p className="theme-text-muted text-xs">
                              Memuat data siswa dari server...
                            </p>
                          </td>
                        </tr>
                      )}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-14 text-center"
                          >
                            <div className="flex flex-col items-center">

                              <div className="theme-card-soft theme-text-muted flex h-12 w-12 items-center justify-center rounded-xl">
                                <Search size={20} />
                              </div>

                              <p className="theme-text-secondary mt-3 text-sm font-semibold">
                                Data tidak ditemukan
                              </p>

                              <p className="theme-text-muted mt-1 text-xs">
                                {search
                                  ? "Tidak ada siswa yang sesuai dengan pencarian."
                                  : "Belum ada data siswa terdaftar."}
                              </p>

                            </div>
                          </td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>


                {filtered.length > 0 && (
                  <div className="theme-card-soft theme-border-soft flex items-center justify-between border-t px-4 py-3 sm:px-5">

                    <p className="theme-text-muted text-[10px] sm:text-xs">
                      Menampilkan{" "}
                      <span className="theme-text-secondary font-semibold">
                        {filtered.length}
                      </span>{" "}
                      dari{" "}
                      <span className="theme-text-secondary font-semibold">
                        {totalSiswa}
                      </span>{" "}
                      siswa
                    </p>

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="theme-sidebar-text-active text-[10px] font-semibold hover:underline sm:text-xs"
                      >
                        Hapus pencarian
                      </button>
                    )}

                  </div>
                )}
              </section>


              <footer className="pb-5 pt-1 text-center">
                <p className="theme-text-muted text-[10px]">
                  © 2026 SmartSchool • Akademik
                </p>
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}