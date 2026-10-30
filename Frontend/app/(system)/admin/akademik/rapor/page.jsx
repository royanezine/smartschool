"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getKelas, getDetailKelas } from "@/services/raport.service";
import {
  Search,
  FileText,
  ChevronLeft,
  Users,
  GraduationCap,
  Eye,
  Loader2,
} from "lucide-react";

export default function RaporPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [kelasFilter, setKelasFilter] = useState("");
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [search, setSearch] = useState("");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoadingKelas(true);
        const res = await getKelas({ limit: 100 });
        if (!active) return;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setKelasList(list);
      } catch {
        // Fallback to empty list
      } finally {
        if (active) setLoadingKelas(false);
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const handleSelectKelas = async (kelas) => {
    setSelectedKelas(kelas);
    setSearch("");
    setLoadingSiswa(true);
    try {
      const res = await getDetailKelas(kelas.id);
      const detail = res?.data || res || {};
      const anggota = Array.isArray(detail?.anggota) ? detail.anggota : [];
      const formatted = anggota.map((a, idx) => {
        const s = a.siswa || a;
        return {
          id: s.id,
          induk: s.nis || s.nisn || String(idx + 1),
          nama: s.namaLengkap || "Siswa",
          lp: s.jenisKelamin
            ? s.jenisKelamin.toLowerCase().startsWith("p")
              ? "P"
              : "L"
            : "-",
          tahunAjaranId: detail?.tahunAjaranId || kelas?.tahunAjaranId,
        };
      });
      setSiswaList(formatted);
    } catch {
      setSiswaList([]);
    } finally {
      setLoadingSiswa(false);
    }
  };

  const filteredKelas = useMemo(() => {
    return kelasList.filter((k) => {
      const nama = k?.nama || "";
      return nama.toLowerCase().includes(kelasFilter.toLowerCase());
    });
  }, [kelasList, kelasFilter]);

  const siswaDiKelas = useMemo(() => {
    if (!selectedKelas) return [];

    return siswaList.filter((s) =>
      (s?.nama || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [selectedKelas, siswaList, search]);

  const handleLihatRapor = (siswa) => {
    const taId = siswa.tahunAjaranId || selectedKelas?.tahunAjaranId || "";
    const kId = selectedKelas?.id || "";
    router.push(
      `/admin/akademik/rapor/${siswa.id}?kelasId=${kId}&tahunAjaranId=${taId}`
    );
  };

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="akademikRapor"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl theme-primary shadow-lg">
                <FileText size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Rapor Akademik
                </h1>

                <p className="text-sm theme-text-secondary mt-0.5">
                  Pilih kelas untuk melihat dan mencetak buku rapor siswa
                </p>
              </div>
            </div>

            {!selectedKelas ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-sm font-semibold theme-text">
                    Pilih Kelas ({filteredKelas.length})
                  </p>

                  <div className="relative w-full sm:w-64">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <input
                      type="text"
                      value={kelasFilter}
                      onChange={(e) => setKelasFilter(e.target.value)}
                      placeholder="Cari kelas..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border theme-border theme-input focus:outline-none"
                    />
                  </div>
                </div>

                {loadingKelas ? (
                  <div className="theme-card rounded-xl border theme-border p-12 text-center text-sm theme-text-muted flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin theme-primary-text" />
                    Memuat data kelas...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredKelas.map((kelas) => {
                      const jumlahSiswa =
                        kelas._count?.anggota ||
                        (Array.isArray(kelas.anggota) ? kelas.anggota.length : 0);
                      const namaWali =
                        kelas.waliKelas?.namaLengkap ||
                        kelas.waliKelas?.nama ||
                        "-";

                      return (
                        <button
                          key={kelas.id}
                          onClick={() => handleSelectKelas(kelas)}
                          className="text-left theme-card rounded-xl border theme-border p-5 shadow-sm theme-header-hover transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="p-2.5 rounded-lg theme-info">
                              <GraduationCap size={20} />
                            </div>

                            <span className="flex items-center gap-1 text-xs font-medium theme-card-soft theme-text-secondary px-2 py-1 rounded-md">
                              <Users size={12} />
                              {jumlahSiswa} siswa
                            </span>
                          </div>

                          <p className="text-lg font-bold theme-text mt-3">
                            {kelas.nama}
                          </p>

                          <p className="text-sm theme-text-secondary mt-0.5">
                            Wali Kelas: {namaWali}
                          </p>
                        </button>
                      );
                    })}

                    {filteredKelas.length === 0 && (
                      <div className="col-span-full theme-card rounded-xl border theme-border p-10 text-center text-sm theme-text-muted shadow-sm">
                        Tidak ada kelas yang cocok dengan pencarian.
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    onClick={() => setSelectedKelas(null)}
                    className="flex items-center gap-1.5 text-sm font-semibold theme-text-muted theme-sidebar-hover transition-colors rounded-md px-1 py-1"
                  >
                    <ChevronLeft size={16} />
                    Kembali ke daftar kelas
                  </button>

                  <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama siswa..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border theme-border theme-input focus:outline-none"
                    />
                  </div>
                </div>

                <div className="theme-card rounded-xl border theme-border p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg theme-info">
                      <GraduationCap size={20} />
                    </div>

                    <div>
                      <p className="text-base font-bold theme-text">
                        {selectedKelas.nama}
                      </p>

                      <p className="text-sm theme-text-secondary">
                        Wali Kelas:{" "}
                        {selectedKelas.waliKelas?.namaLengkap ||
                          selectedKelas.waliKelas?.nama ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-sm font-semibold theme-card-soft theme-text-secondary px-3 py-1.5 rounded-lg">
                    <Users size={14} />
                    {siswaDiKelas.length} siswa
                  </span>
                </div>

                <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                            No.
                          </th>

                          <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                            Induk
                          </th>

                          <th className="text-left font-semibold px-4 py-3 min-w-[220px]">
                            Nama Siswa
                          </th>

                          <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                            L/P
                          </th>

                          <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {loadingSiswa ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-10 text-center theme-text-muted"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin theme-primary-text" />
                                Memuat data siswa...
                              </div>
                            </td>
                          </tr>
                        ) : siswaDiKelas.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-8 text-center text-sm theme-text-muted"
                            >
                              Belum ada siswa terdaftar di kelas ini.
                            </td>
                          </tr>
                        ) : (
                          siswaDiKelas.map((s, idx) => (
                            <tr
                              key={s.id}
                              className="border-b theme-border-soft last:border-0 theme-table-hover transition-colors"
                            >
                              <td className="px-4 py-2.5 theme-text-secondary font-medium">
                                {idx + 1}
                              </td>

                              <td className="px-4 py-2.5 theme-text-secondary">
                                {s.induk}
                              </td>

                              <td className="px-4 py-2.5 theme-text font-semibold">
                                {s.nama}
                              </td>

                              <td className="px-4 py-2.5 text-center theme-text-secondary font-medium">
                                {s.lp}
                              </td>

                              <td className="px-4 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleLihatRapor(s)}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md theme-info transition-colors"
                                  >
                                    <Eye size={12} />
                                    Lihat Rapor
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
