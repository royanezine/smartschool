"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Edit,
  UserCheck,
  GraduationCap,
  X,
  Check,
  Clock3,
  School,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getKelasById } from "../../../../services/kelas.service";
import { getJadwalMengajar } from "../../../../services/jadwalMengajar.service";

const HARI_LIST = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const EMPTY_JADWAL = {
  hari: "Senin",
  jamMulai: "07:30",
  jamSelesai: "09:00",
  mapel: "",
  ruangan: "",
  guru: "",
};

function extractData(response) {
  if (!response) return null;

  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data) {
    return response.data;
  }

  return response;
}

function extractArray(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getNama(value) {
  if (!value) return "";

  return (
    value?.namaLengkap ||
    value?.nama_lengkap ||
    value?.nama ||
    value?.name ||
    ""
  );
}

function getMapelName(item) {
  return (
    item?.mapel ||
    item?.mataPelajaran?.nama ||
    item?.kelasMapel?.mataPelajaran?.nama ||
    item?.kelas_mapel?.mataPelajaran?.nama ||
    "-"
  );
}

function getGuruName(item) {
  return (
    item?.guru ||
    item?.guruPengajar?.namaLengkap ||
    item?.guruPengajar?.nama ||
    item?.kelasMapel?.guruPengajar?.namaLengkap ||
    item?.kelasMapel?.guruPengajar?.nama ||
    item?.kelas_mapel?.guruPengajar?.namaLengkap ||
    item?.kelas_mapel?.guruPengajar?.nama ||
    "-"
  );
}

function getKelasIdFromJadwal(item) {
  return (
    item?.kelasId ||
    item?.kelas_id ||
    item?.kelasMapel?.kelasId ||
    item?.kelasMapel?.kelas?.id ||
    item?.kelas_mapel?.kelasId ||
    item?.kelas_mapel?.kelas?.id ||
    ""
  );
}

function getTahunAjaranName(tahunAjaran) {
  return (
    tahunAjaran?.nama ||
    tahunAjaran?.tahunAjaran ||
    tahunAjaran?.tahun_ajaran ||
    "-"
  );
}

export default function DetailKelasPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [kelas, setKelas] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingJadwal, setLoadingJadwal] = useState(false);

  const [error, setError] = useState("");
  const [jadwalError, setJadwalError] = useState("");

  const [activeTab, setActiveTab] = useState("kelas");

  const [jadwal, setJadwal] = useState([]);

  const [showAddJadwal, setShowAddJadwal] = useState(false);

  const [guruList, setGuruList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  const [newJadwal, setNewJadwal] = useState(EMPTY_JADWAL);

  // =========================================================
  // LOAD DETAIL KELAS
  // =========================================================

  const loadDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await getKelasById(String(id));

      const data = extractData(response);

      if (!data) {
        throw new Error("Data kelas tidak ditemukan.");
      }

      const anggota =
        Array.isArray(data?.anggota)
          ? data.anggota
          : Array.isArray(data?.data?.anggota)
          ? data.data.anggota
          : Array.isArray(data?.siswa)
          ? data.siswa
          : Array.isArray(data?.data?.siswa)
          ? data.data.siswa
          : [];

      const tahunAjaran =
        data?.tahunAjaran ||
        data?.tahun_ajaran ||
        data?.data?.tahunAjaran ||
        data?.data?.tahun_ajaran ||
        null;

      const waliKelas =
        data?.waliKelas ||
        data?.wali_kelas ||
        null;

      setKelas({
        ...data,
        anggota,
        tahunAjaran,
        waliKelas,
      });

      console.log("DETAIL KELAS:", data);
      console.log("ANGGOTA SISWA:", anggota);
    } catch (err) {
      console.error("Gagal mengambil detail kelas:", err);

      setError(
        err?.message ||
          "Gagal mengambil data kelas."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD JADWAL DARI BACKEND
  // =========================================================

  const loadJadwal = async () => {
    if (!id) return;

    try {
      setLoadingJadwal(true);
      setJadwalError("");

      const response = await getJadwalMengajar();

      const data = extractArray(response);

      console.log("SEMUA JADWAL:", data);

      const filtered = data
        .filter((item) => {
          const kelasId = getKelasIdFromJadwal(item);

          return (
            String(kelasId) === String(id)
          );
        })
        .map((item) => ({
          ...item,

          hari:
            item?.hari ||
            item?.day ||
            "-",

          jamMulai:
            item?.jamMulai ||
            item?.jam_mulai ||
            "-",

          jamSelesai:
            item?.jamSelesai ||
            item?.jam_selesai ||
            "-",

          mapel: getMapelName(item),

          guru: getGuruName(item),

          ruangan:
            item?.ruangan ||
            item?.namaRuangan ||
            item?.room ||
            "-",
        }));

      console.log(
        "JADWAL UNTUK KELAS:",
        filtered
      );

      setJadwal(filtered);
    } catch (err) {
      console.error(
        "Gagal mengambil jadwal:",
        err
      );

      setJadwalError(
        err?.message ||
          "Gagal mengambil data jadwal."
      );

      setJadwal([]);
    } finally {
      setLoadingJadwal(false);
    }
  };

  // =========================================================
  // LOAD DETAIL + JADWAL
  // =========================================================

  useEffect(() => {
    if (!id) return;

    loadDetail();
    loadJadwal();
  }, [id]);

  // =========================================================
  // DATA GURU & MAPEL
  // =========================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const guru = localStorage.getItem(
        "guru_data"
      );

      const mapel = localStorage.getItem(
        "mapel_data"
      );

      setGuruList(
        guru
          ? JSON.parse(guru)
          : []
      );

      setMapelList(
        mapel
          ? JSON.parse(mapel)
          : []
      );
    } catch (err) {
      console.error(
        "Gagal membaca guru/mapel:",
        err
      );

      setGuruList([]);
      setMapelList([]);
    }
  }, []);

  // =========================================================
  // JUMLAH SISWA
  // =========================================================

  const jumlahSiswa = useMemo(() => {
    if (
      Array.isArray(
        kelas?.anggota
      )
    ) {
      return kelas.anggota.length;
    }

    return Number(
      kelas?._count?.anggota ??
        kelas?.jumlahSiswa ??
        kelas?.jumlah_siswa ??
        0
    );
  }, [kelas]);

  // =========================================================
  // DATA ANGGOTA
  // =========================================================

  const daftarSiswa = useMemo(() => {
    return Array.isArray(
      kelas?.anggota
    )
      ? kelas.anggota
      : [];
  }, [kelas]);

  // =========================================================
  // AMBIL DATA SISWA
  // =========================================================

  const getSiswaData = (anggota) => {
    return (
      anggota?.siswa ||
      anggota?.murid ||
      anggota?.pengguna ||
      anggota?.data?.siswa ||
      anggota?.data?.murid ||
      anggota?.data?.pengguna ||
      anggota ||
      {}
    );
  };

  // =========================================================
  // NAMA SISWA
  // =========================================================

  const getNamaSiswa = (anggota) => {
    const siswa =
      getSiswaData(anggota);

    return (
      siswa?.namaLengkap ||
      siswa?.nama_lengkap ||
      siswa?.nama ||
      siswa?.name ||
      anggota?.namaLengkap ||
      anggota?.nama_lengkap ||
      anggota?.nama ||
      "-"
    );
  };

  // =========================================================
  // NIS
  // =========================================================

  const getNisSiswa = (anggota) => {
    const siswa =
      getSiswaData(anggota);

    return (
      siswa?.nis ||
      siswa?.NIS ||
      siswa?.nomorInduk ||
      siswa?.nomor_induk ||
      anggota?.nis ||
      anggota?.NIS ||
      "-"
    );
  };

  // =========================================================
  // NISN
  // =========================================================

  const getNisnSiswa = (anggota) => {
    const siswa =
      getSiswaData(anggota);

    return (
      siswa?.nisn ||
      siswa?.NISN ||
      anggota?.nisn ||
      anggota?.NISN ||
      "-"
    );
  };

  // =========================================================
  // LABEL GURU
  // =========================================================

  const getGuruLabel = (value) => {
    if (!value) return "-";

    const found =
      guruList.find(
        (guru) =>
          guru?.nama === value ||
          guru?.namaLengkap === value ||
          String(guru?.id) ===
            String(value)
      );

    return found
      ? getNama(found)
      : value;
  };

  // =========================================================
  // HITUNG JAM GURU
  // =========================================================

  const jamPerGuru = useMemo(() => {
    const counts = {};

    jadwal.forEach((item) => {
      const guru =
        getGuruName(item);

      if (
        !guru ||
        guru === "-"
      ) {
        return;
      }

      counts[guru] =
        (counts[guru] || 0) + 1;
    });

    return counts;
  }, [jadwal]);

  // =========================================================
  // TAMBAH JADWAL
  // =========================================================

  const handleAddJadwal = () => {
    if (
      !newJadwal.mapel ||
      !newJadwal.guru
    ) {
      alert(
        "Mata pelajaran dan guru wajib diisi!"
      );
      return;
    }

    /*
      Catatan:
      Backend kamu saat ini baru kita gunakan
      untuk GET jadwal melalui getJadwalMengajar().

      Jadi data baru di bawah ini hanya ditambahkan
      ke tampilan sementara sampai endpoint POST
      jadwal digunakan.
    */

    const newEntry = {
      id: `local-${Date.now()}`,

      kelasId: id,

      hari: newJadwal.hari,

      jamMulai:
        newJadwal.jamMulai,

      jamSelesai:
        newJadwal.jamSelesai,

      mapel:
        newJadwal.mapel,

      guru:
        newJadwal.guru,

      ruangan:
        newJadwal.ruangan,
    };

    setJadwal((prev) => [
      ...prev,
      newEntry,
    ]);

    setNewJadwal({
      ...EMPTY_JADWAL,
    });

    setShowAddJadwal(false);
  };

  // =========================================================
  // DELETE JADWAL
  // =========================================================

  const handleDeleteJadwal = (
    jadwalId
  ) => {
    if (
      !confirm(
        "Hapus jadwal ini?"
      )
    ) {
      return;
    }

    /*
      Hapus dari tampilan.
      Untuk data yang berasal dari backend,
      endpoint DELETE perlu disambungkan
      jika backend sudah menyediakan endpoint tersebut.
    */

    setJadwal((prev) =>
      prev.filter(
        (item) =>
          String(item.id) !==
          String(jadwalId)
      )
    );
  };

  // =========================================================
  // TINGKAT
  // =========================================================

  const getTingkatLabel = (
    tingkat,
    short = false
  ) => {
    if (
      tingkat === 10 ||
      String(tingkat) === "10"
    ) {
      return short
        ? "X"
        : "X (Sepuluh)";
    }

    if (
      tingkat === 11 ||
      String(tingkat) === "11"
    ) {
      return short
        ? "XI"
        : "XI (Sebelas)";
    }

    if (
      tingkat === 12 ||
      String(tingkat) === "12"
    ) {
      return short
        ? "XII"
        : "XII (Dua Belas)";
    }

    return tingkat || "-";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F4F7FB]">
        <Sidebar
          active="kelas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={
            setIsCollapsed
          }
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() =>
              setIsCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={28}
                className="animate-spin text-[#2563EB]"
              />

              <p className="text-sm font-medium text-slate-500">
                Memuat data kelas...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (
    error ||
    !kelas
  ) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F4F7FB]">
        <Sidebar
          active="kelas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={
            setIsCollapsed
          }
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() =>
              setIsCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-5">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                <AlertCircle
                  size={28}
                  className="text-rose-500"
                />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-800">
                Gagal Memuat Kelas
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error ||
                  "Data kelas tidak ditemukan."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/kelas"
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft
                  size={16}
                />
                Kembali
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F7FB]">
      {/* SIDEBAR */}

      <Sidebar
        active="kelas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
      />

      {/* MAIN */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}

        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* CONTENT */}

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-5 sm:px-5 md:px-7 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1600px] space-y-6">
              {/* HEADER */}

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/kelas"
                      )
                    }
                    className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#1E3A8A]"
                  >
                    <ArrowLeft
                      size={17}
                    />

                    <span>
                      Kembali ke Daftar
                      Kelas
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
                      {kelas.nama ||
                        "-"}
                    </h1>

                    <span className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1E3A8A]">
                      {getTingkatLabel(
                        kelas.tingkat,
                        true
                      )}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${
                        kelas.status ===
                        "aktif"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          kelas.status ===
                          "aktif"
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        }`}
                      />

                      {kelas.status ===
                      "aktif"
                        ? "Aktif"
                        : "Nonaktif"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Informasi detail dan
                    pengelolaan kelas
                  </p>
                </div>

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/kelas/edit/${kelas.id}`
                    )
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]"
                >
                  <Edit size={16} />
                  Edit Kelas
                </button>
              </div>

              {/* OVERVIEW */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                  {/* WALI */}

                  <div className="flex min-w-0 items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                      <GraduationCap
                        size={20}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-medium text-slate-400">
                        Wali Kelas
                      </p>

                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {getNama(
                          kelas.waliKelas
                        ) ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  {/* TAHUN */}

                  <div className="flex min-w-0 items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                      <Calendar
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-medium text-slate-400">
                        Tahun Ajaran
                      </p>

                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {getTahunAjaranName(
                          kelas.tahunAjaran
                        )}
                      </p>

                      {kelas
                        .tahunAjaran
                        ?.semester && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          Semester{" "}
                          {
                            kelas
                              .tahunAjaran
                              .semester
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* JUMLAH SISWA */}

                  <div className="flex min-w-0 items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                      <Users
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-medium text-slate-400">
                        Jumlah Siswa
                      </p>

                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {jumlahSiswa}{" "}
                        siswa
                      </p>
                    </div>
                  </div>

                  {/* KAPASITAS */}

                  <div className="flex min-w-0 items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                      <Users
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-medium text-slate-400">
                        Kapasitas
                      </p>

                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {kelas.kapasitas ??
                          0}{" "}
                        siswa
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* TABS */}

              <div className="border-b border-slate-200">
                <div className="overflow-x-auto">
                  <nav className="flex min-w-max gap-1">
                    {/* INFORMASI */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "kelas"
                        )
                      }
                      className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                        activeTab ===
                        "kelas"
                          ? "border-[#2563EB] text-[#1E3A8A]"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      <School
                        size={16}
                      />
                      Informasi Kelas
                    </button>

                    {/* SISWA */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "siswa"
                        )
                      }
                      className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                        activeTab ===
                        "siswa"
                          ? "border-[#2563EB] text-[#1E3A8A]"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      <Users
                        size={16}
                      />
                      Siswa
                    </button>

                    {/* GURU */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "guru"
                        )
                      }
                      className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                        activeTab ===
                        "guru"
                          ? "border-[#2563EB] text-[#1E3A8A]"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      <UserCheck
                        size={16}
                      />
                      Guru / Wali Kelas
                    </button>

                    {/* JADWAL */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "jadwal"
                        )
                      }
                      className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                        activeTab ===
                        "jadwal"
                          ? "border-[#2563EB] text-[#1E3A8A]"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      <BookOpen
                        size={16}
                      />
                      Mata Pelajaran /
                      Jadwal
                    </button>
                  </nav>
                </div>
              </div>

              {/* CONTENT CARD */}

              <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* =================================================
                    TAB KELAS
                ================================================= */}

                {activeTab ===
                  "kelas" && (
                  <div>
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                      <h2 className="text-base font-bold text-[#0F172A]">
                        Informasi Kelas
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Detail informasi
                        kelas yang sedang
                        dipilih.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                      {/* NAMA */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <p className="mb-1.5 text-xs font-medium text-slate-400">
                          Nama Kelas
                        </p>

                        <p className="text-sm font-semibold text-[#0F172A]">
                          {kelas.nama ||
                            "-"}
                        </p>
                      </div>

                      {/* TINGKAT */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <p className="mb-1.5 text-xs font-medium text-slate-400">
                          Tingkat
                        </p>

                        <p className="text-sm font-semibold text-[#0F172A]">
                          {getTingkatLabel(
                            kelas.tingkat
                          )}
                        </p>
                      </div>

                      {/* TAHUN */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <p className="mb-1.5 text-xs font-medium text-slate-400">
                          Tahun Ajaran
                        </p>

                        <p className="text-sm font-semibold text-[#0F172A]">
                          {getTahunAjaranName(
                            kelas.tahunAjaran
                          )}
                        </p>

                        {kelas
                          .tahunAjaran
                          ?.semester && (
                          <p className="mt-1 text-xs text-slate-400">
                            Semester{" "}
                            {
                              kelas
                                .tahunAjaran
                                .semester
                            }
                          </p>
                        )}
                      </div>

                      {/* WALI */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <p className="mb-1.5 text-xs font-medium text-slate-400">
                          Wali Kelas
                        </p>

                        <p className="text-sm font-semibold text-[#0F172A]">
                          {getNama(
                            kelas.waliKelas
                          ) ||
                            "-"}
                        </p>
                      </div>

                      {/* JUMLAH SISWA */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <p className="mb-1.5 text-xs font-medium text-slate-400">
                          Jumlah Siswa
                        </p>

                        <p className="text-sm font-semibold text-[#0F172A]">
                          {jumlahSiswa}{" "}
                          siswa
                        </p>
                      </div>

                      {/* KAPASITAS */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <p className="mb-1.5 text-xs font-medium text-slate-400">
                          Kapasitas Kelas
                        </p>

                        <p className="text-sm font-semibold text-[#0F172A]">
                          {kelas.kapasitas ??
                            0}{" "}
                          siswa
                        </p>
                      </div>

                      {/* RUANGAN */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <p className="mb-1.5 text-xs font-medium text-slate-400">
                          Ruangan
                        </p>

                        <p className="text-sm font-semibold text-[#0F172A]">
                          {kelas
                            .lantai
                            ?.gedung
                            ?.nama ||
                            kelas
                              .lantai
                              ?.nama ||
                            kelas
                              .ruangan
                              ?.nama ||
                            kelas.ruangan ||
                            "-"}
                        </p>
                      </div>

                      {/* STATUS */}

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <p className="mb-2 text-xs font-medium text-slate-400">
                          Status Kelas
                        </p>

                        <span
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            kelas.status ===
                            "aktif"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              kelas.status ===
                              "aktif"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />

                          {kelas.status ===
                          "aktif"
                            ? "Kelas Aktif"
                            : "Kelas Nonaktif"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    TAB SISWA
                ================================================= */}

                {activeTab ===
                  "siswa" && (
                  <div>
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div>
                        <h2 className="text-base font-bold text-[#0F172A]">
                          Daftar Siswa
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Daftar siswa yang
                          terdaftar di
                          kelas{" "}
                          <span className="font-medium text-slate-700">
                            {kelas.nama ||
                              "-"}
                          </span>
                          .
                        </p>
                      </div>

                      <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#1E3A8A]">
                        <Users
                          size={16}
                        />
                        {jumlahSiswa}{" "}
                        Siswa
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[700px] text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80">
                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              No
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Nama Siswa
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              NIS
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              NISN
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {daftarSiswa.length >
                          0 ? (
                            daftarSiswa.map(
                              (
                                anggota,
                                index
                              ) => {
                                const siswa =
                                  getSiswaData(
                                    anggota
                                  );

                                const nama =
                                  getNamaSiswa(
                                    anggota
                                  );

                                const initial =
                                  nama !==
                                  "-"
                                    ? nama
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()
                                    : "?";

                                return (
                                  <tr
                                    key={
                                      anggota?.id ||
                                      siswa?.id ||
                                      anggota?.siswaId ||
                                      index
                                    }
                                    className="border-b border-slate-100 transition hover:bg-blue-50/30"
                                  >
                                    <td className="px-5 py-4 text-slate-500">
                                      {index +
                                        1}
                                    </td>

                                    <td className="px-5 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#1E3A8A]">
                                          {
                                            initial
                                          }
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate font-semibold text-[#0F172A]">
                                            {
                                              nama
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-5 py-4 text-slate-600">
                                      {getNisSiswa(
                                        anggota
                                      )}
                                    </td>

                                    <td className="px-5 py-4 text-slate-600">
                                      {getNisnSiswa(
                                        anggota
                                      )}
                                    </td>

                                    <td className="px-5 py-4">
                                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Aktif
                                      </span>
                                    </td>
                                  </tr>
                                );
                              }
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={
                                  5
                                }
                                className="px-5 py-14 text-center"
                              >
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                  <Users
                                    size={
                                      23
                                    }
                                  />
                                </div>

                                <p className="mt-4 text-sm font-semibold text-slate-600">
                                  Belum ada
                                  siswa
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Belum ada
                                  siswa yang
                                  terdaftar di
                                  kelas ini.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {daftarSiswa.length >
                      0 && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 sm:px-6">
                        <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            Total{" "}
                            <strong className="font-semibold text-slate-700">
                              {
                                daftarSiswa.length
                              }
                            </strong>{" "}
                            siswa
                            terdaftar
                          </span>

                          <span>
                            Kelas{" "}
                            <strong className="font-semibold text-[#1E3A8A]">
                              {kelas.nama}
                            </strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* =================================================
                    TAB GURU
                ================================================= */}

                {activeTab ===
                  "guru" && (
                  <div>
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                      <h2 className="text-base font-bold text-[#0F172A]">
                        Guru dan Wali
                        Kelas
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Daftar guru yang
                        terkait dengan
                        kegiatan
                        pembelajaran
                        kelas.
                      </p>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[760px] text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80">
                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              No
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Nama Guru
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Mata Pelajaran
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Peran
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Jam Mengajar
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {guruList.filter(
                            (guru) =>
                              guru?.mapel ||
                              guru?.mataPelajaran
                          ).length >
                          0 ? (
                            guruList
                              .filter(
                                (
                                  guru
                                ) =>
                                  guru?.mapel ||
                                  guru?.mataPelajaran
                              )
                              .map(
                                (
                                  guru,
                                  index
                                ) => {
                                  const namaGuru =
                                    getNama(
                                      guru
                                    );

                                  const jam =
                                    jamPerGuru[
                                      namaGuru
                                    ] ||
                                    0;

                                  const waliNama =
                                    getNama(
                                      kelas.waliKelas
                                    );

                                  const isWali =
                                    namaGuru ===
                                    waliNama;

                                  return (
                                    <tr
                                      key={
                                        guru?.id ??
                                        index
                                      }
                                      className="border-b border-slate-100 transition hover:bg-blue-50/30"
                                    >
                                      <td className="px-5 py-4 text-slate-500">
                                        {index +
                                          1}
                                      </td>

                                      <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#1E3A8A]">
                                            {namaGuru
                                              ?.charAt(
                                                0
                                              )
                                              ?.toUpperCase() ||
                                              "G"}
                                          </div>

                                          <span className="font-semibold text-[#0F172A]">
                                            {namaGuru ||
                                              "-"}
                                          </span>
                                        </div>
                                      </td>

                                      <td className="px-5 py-4 text-slate-600">
                                        {guru?.mapel ||
                                          guru
                                            ?.mataPelajaran
                                            ?.nama ||
                                          "-"}
                                      </td>

                                      <td className="px-5 py-4">
                                        {isWali ? (
                                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1E3A8A]">
                                            <UserCheck
                                              size={
                                                13
                                              }
                                            />
                                            Wali Kelas
                                          </span>
                                        ) : (
                                          <span className="text-slate-500">
                                            Guru
                                          </span>
                                        )}
                                      </td>

                                      <td className="px-5 py-4">
                                        <span className="font-semibold text-[#1E3A8A]">
                                          {jam}{" "}
                                          jam
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                }
                              )
                          ) : (
                            <tr>
                              <td
                                colSpan={
                                  5
                                }
                                className="px-5 py-12 text-center"
                              >
                                <UserCheck
                                  size={
                                    30
                                  }
                                  className="mx-auto mb-3 text-slate-300"
                                />

                                <p className="text-sm font-semibold text-slate-600">
                                  Belum ada
                                  guru
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Data guru
                                  belum
                                  tersedia
                                  untuk
                                  kelas ini.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* =================================================
                    TAB JADWAL
                ================================================= */}

                {activeTab ===
                  "jadwal" && (
                  <div>
                    {/* HEADER */}

                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-base font-bold text-[#0F172A]">
                          Jadwal Pelajaran
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Jadwal mata
                          pelajaran dan
                          guru pengajar
                          untuk kelas ini.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={
                            loadJadwal
                          }
                          disabled={
                            loadingJadwal
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RefreshCw
                            size={16}
                            className={
                              loadingJadwal
                                ? "animate-spin"
                                : ""
                            }
                          />
                          Refresh
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setShowAddJadwal(
                              (prev) =>
                                !prev
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
                        >
                          {showAddJadwal ? (
                            <X
                              size={
                                16
                              }
                            />
                          ) : (
                            <Plus
                              size={
                                16
                              }
                            />
                          )}

                          {showAddJadwal
                            ? "Tutup Form"
                            : "Tambah Jadwal"}
                        </button>
                      </div>
                    </div>

                    {/* ERROR JADWAL */}

                    {jadwalError && (
                      <div className="border-b border-amber-200 bg-amber-50 px-5 py-3.5 sm:px-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle
                            size={
                              18
                            }
                            className="mt-0.5 shrink-0 text-amber-600"
                          />

                          <div>
                            <p className="text-sm font-semibold text-amber-800">
                              Gagal memuat
                              jadwal
                            </p>

                            <p className="mt-0.5 text-xs text-amber-700">
                              {
                                jadwalError
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FORM TAMBAH */}

                    {showAddJadwal && (
                      <div className="border-b border-slate-200 bg-slate-50/80 p-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                          {/* HARI */}

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Hari
                            </label>

                            <select
                              value={
                                newJadwal.hari
                              }
                              onChange={(
                                e
                              ) =>
                                setNewJadwal(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    hari: e
                                      .target
                                      .value,
                                  })
                                )
                              }
                              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            >
                              {HARI_LIST.map(
                                (
                                  hari
                                ) => (
                                  <option
                                    key={
                                      hari
                                    }
                                    value={
                                      hari
                                    }
                                  >
                                    {
                                      hari
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* JAM MULAI */}

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Jam Mulai
                            </label>

                            <input
                              type="time"
                              value={
                                newJadwal.jamMulai
                              }
                              onChange={(
                                e
                              ) =>
                                setNewJadwal(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    jamMulai:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          {/* JAM SELESAI */}

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Jam Selesai
                            </label>

                            <input
                              type="time"
                              value={
                                newJadwal.jamSelesai
                              }
                              onChange={(
                                e
                              ) =>
                                setNewJadwal(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    jamSelesai:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          {/* MAPEL */}

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Mata Pelajaran
                            </label>

                            <select
                              value={
                                newJadwal.mapel
                              }
                              onChange={(
                                e
                              ) =>
                                setNewJadwal(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    mapel:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="">
                                Pilih
                                Mapel
                              </option>

                              {mapelList.map(
                                (
                                  mapel
                                ) => (
                                  <option
                                    key={
                                      mapel.id
                                    }
                                    value={
                                      mapel.nama
                                    }
                                  >
                                    {
                                      mapel.nama
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* GURU */}

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Guru
                            </label>

                            <select
                              value={
                                newJadwal.guru
                              }
                              onChange={(
                                e
                              ) =>
                                setNewJadwal(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    guru:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="">
                                Pilih
                                Guru
                              </option>

                              {guruList.map(
                                (
                                  guru
                                ) => (
                                  <option
                                    key={
                                      guru.id
                                    }
                                    value={
                                      getNama(
                                        guru
                                      )
                                    }
                                  >
                                    {getNama(
                                      guru
                                    )}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* RUANGAN */}

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Ruangan
                            </label>

                            <input
                              type="text"
                              value={
                                newJadwal.ruangan
                              }
                              onChange={(
                                e
                              ) =>
                                setNewJadwal(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    ruangan:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder="A-01"
                              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() =>
                              setShowAddJadwal(
                                false
                              )
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                          >
                            <X
                              size={
                                15
                              }
                            />
                            Batal
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleAddJadwal
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1E3A8A]"
                          >
                            <Check
                              size={
                                16
                              }
                            />
                            Simpan Jadwal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LOADING JADWAL */}

                    {loadingJadwal ? (
                      <div className="flex min-h-[280px] flex-col items-center justify-center">
                        <Loader2
                          size={
                            28
                          }
                          className="animate-spin text-[#2563EB]"
                        />

                        <p className="mt-3 text-sm font-medium text-slate-500">
                          Memuat jadwal
                          pelajaran...
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* TABLE */}

                        <div className="w-full overflow-x-auto">
                          <table className="w-full min-w-[1000px] text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  No
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  Hari
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  Waktu
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  Mata
                                  Pelajaran
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  Guru
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  Ruangan
                                </th>

                                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  Aksi
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {jadwal.length ===
                              0 ? (
                                <tr>
                                  <td
                                    colSpan={
                                      7
                                    }
                                    className="px-5 py-14 text-center"
                                  >
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                      <Calendar
                                        size={
                                          23
                                        }
                                      />
                                    </div>

                                    <p className="mt-4 text-sm font-semibold text-slate-600">
                                      Belum ada
                                      jadwal
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      Belum ada
                                      jadwal
                                      pelajaran
                                      untuk kelas
                                      ini.
                                    </p>
                                  </td>
                                </tr>
                              ) : (
                                jadwal.map(
                                  (
                                    item,
                                    index
                                  ) => {
                                    const guru =
                                      getGuruName(
                                        item
                                      );

                                    const mapel =
                                      getMapelName(
                                        item
                                      );

                                    return (
                                      <tr
                                        key={
                                          item.id ??
                                          index
                                        }
                                        className="border-b border-slate-100 transition hover:bg-blue-50/30"
                                      >
                                        <td className="px-5 py-4 text-slate-500">
                                          {index +
                                            1}
                                        </td>

                                        <td className="px-5 py-4">
                                          <span className="font-semibold text-[#0F172A]">
                                            {item.hari ||
                                              "-"}
                                          </span>
                                        </td>

                                        <td className="px-5 py-4">
                                          <div className="flex items-center gap-2 text-slate-600">
                                            <Clock3
                                              size={
                                                15
                                              }
                                              className="text-slate-400"
                                            />

                                            <span className="whitespace-nowrap">
                                              {item.jamMulai ||
                                                "-"}{" "}
                                              –
                                              {item.jamSelesai ||
                                                "-"}
                                            </span>
                                          </div>
                                        </td>

                                        <td className="px-5 py-4">
                                          <span className="font-semibold text-[#0F172A]">
                                            {mapel}
                                          </span>
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                          {getGuruLabel(
                                            guru
                                          )}
                                        </td>

                                        <td className="px-5 py-4">
                                          <div className="flex items-center gap-2 text-slate-600">
                                            <MapPin
                                              size={
                                                14
                                              }
                                              className="text-slate-400"
                                            />

                                            <span>
                                              {item.ruangan ||
                                                "-"}
                                            </span>
                                          </div>
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteJadwal(
                                                item.id
                                              )
                                            }
                                            title="Hapus jadwal"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                          >
                                            <Trash2
                                              size={
                                                16
                                              }
                                            />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  }
                                )
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* TOTAL */}

                        {jadwal.length >
                          0 && (
                          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 sm:px-6">
                            <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                              <span>
                                Total{" "}
                                <strong className="font-semibold text-slate-700">
                                  {
                                    jadwal.length
                                  }
                                </strong>{" "}
                                jadwal
                                pelajaran
                              </span>

                              <span>
                                Kelas{" "}
                                <strong className="font-semibold text-[#1E3A8A]">
                                  {
                                    kelas.nama
                                  }
                                </strong>
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}