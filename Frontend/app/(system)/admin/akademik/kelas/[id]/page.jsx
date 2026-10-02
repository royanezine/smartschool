"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

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

import { getKelasById } from "../../../../../../services/kelas.service";
import { getJadwalMengajar } from "../../../../../../services/jadwalMengajar.service";

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

          return String(kelasId) === String(id);
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
    if (Array.isArray(kelas?.anggota)) {
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
    return Array.isArray(kelas?.anggota)
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
    const siswa = getSiswaData(anggota);

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
    const siswa = getSiswaData(anggota);

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
    const siswa = getSiswaData(anggota);

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

    const found = guruList.find(
      (guru) =>
        guru?.nama === value ||
        guru?.namaLengkap === value ||
        String(guru?.id) === String(value)
    );

    return found ? getNama(found) : value;
  };

  // =========================================================
  // HITUNG JAM GURU
  // =========================================================

  const jamPerGuru = useMemo(() => {
    const counts = {};

    jadwal.forEach((item) => {
      const guru = getGuruName(item);

      if (!guru || guru === "-") {
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
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="kelas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
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
                className="animate-spin text-[var(--color-primary)]"
              />

              <p className="theme-text-muted text-sm font-medium">
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

  if (error || !kelas) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="kelas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
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
            <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-7 text-center shadow-sm">
              <div className="theme-danger mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                <AlertCircle size={28} />
              </div>

              <h2 className="theme-text mt-4 text-lg font-bold">
                Gagal Memuat Kelas
              </h2>

              <p className="theme-text-muted mt-2 text-sm leading-6">
                {error ||
                  "Data kelas tidak ditemukan."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/akademik/kelas"
                  )
                }
                className="theme-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
              >
                <ArrowLeft size={16} />
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
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="kelas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
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

        <main className="theme-page min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-5 sm:px-5 md:px-7 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1600px] space-y-6">

              {/* HEADER */}

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/akademik/kelas"
                      )
                    }
                    className="theme-text-muted mb-3 inline-flex items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft size={17} />

                    <span>
                      Kembali ke Daftar
                      Kelas
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                      {kelas.nama || "-"}
                    </h1>

                    <span className="theme-info inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold">
                      {getTingkatLabel(
                        kelas.tingkat,
                        true
                      )}
                    </span>

                    <span
                      className={
                        kelas.status === "aktif"
                          ? "theme-success inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold"
                          : "theme-danger inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold"
                      }
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />

                      {kelas.status === "aktif"
                        ? "Aktif"
                        : "Nonaktif"}
                    </span>
                  </div>

                  <p className="theme-text-muted mt-1 text-sm">
                    Informasi detail dan
                    pengelolaan kelas
                  </p>
                </div>

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/akademik/kelas/edit/${kelas.id}`
                    )
                  }
                  className="theme-card theme-border theme-text-secondary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-[var(--color-header-hover)]"
                >
                  <Edit size={16} />
                  Edit Kelas
                </button>
              </div>

              {/* OVERVIEW */}

              <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                <div className="grid grid-cols-1 divide-y divide-[var(--color-border-soft)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                  
                  {/* WALI */}

                  <div className="flex min-w-0 items-center gap-4 p-5">
                    <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <GraduationCap size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted mb-1 text-xs font-medium">
                        Wali Kelas
                      </p>

                      <p className="theme-text truncate text-sm font-semibold">
                        {getNama(
                          kelas.waliKelas
                        ) || "-"}
                      </p>
                    </div>
                  </div>

                  {/* TAHUN */}

                  <div className="flex min-w-0 items-center gap-4 p-5">
                    <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Calendar size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted mb-1 text-xs font-medium">
                        Tahun Ajaran
                      </p>

                      <p className="theme-text truncate text-sm font-semibold">
                        {getTahunAjaranName(
                          kelas.tahunAjaran
                        )}
                      </p>

                      {kelas.tahunAjaran?.semester && (
                        <p className="theme-text-muted mt-0.5 text-xs">
                          Semester{" "}
                          {kelas.tahunAjaran.semester}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* JUMLAH SISWA */}

                  <div className="flex min-w-0 items-center gap-4 p-5">
                    <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Users size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted mb-1 text-xs font-medium">
                        Jumlah Siswa
                      </p>

                      <p className="theme-text truncate text-sm font-semibold">
                        {jumlahSiswa} siswa
                      </p>
                    </div>
                  </div>

                  {/* KAPASITAS */}

                  <div className="flex min-w-0 items-center gap-4 p-5">
                    <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Users size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text-muted mb-1 text-xs font-medium">
                        Kapasitas
                      </p>

                      <p className="theme-text truncate text-sm font-semibold">
                        {kelas.kapasitas ?? 0} siswa
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* TABS */}

              <div className="theme-border border-b">
                <div className="overflow-x-auto">
                  <nav className="flex min-w-max gap-1">

                    {/* INFORMASI */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("kelas")
                      }
                      className={`theme-text-muted inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "kelas"
                          ? "border-[var(--color-primary)] theme-sidebar-text-active"
                          : "border-transparent hover:border-[var(--color-border)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <School size={16} />
                      Informasi Kelas
                    </button>

                    {/* SISWA */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("siswa")
                      }
                      className={`theme-text-muted inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "siswa"
                          ? "border-[var(--color-primary)] theme-sidebar-text-active"
                          : "border-transparent hover:border-[var(--color-border)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <Users size={16} />
                      Siswa
                    </button>

                    {/* GURU */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("guru")
                      }
                      className={`theme-text-muted inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "guru"
                          ? "border-[var(--color-primary)] theme-sidebar-text-active"
                          : "border-transparent hover:border-[var(--color-border)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <UserCheck size={16} />
                      Guru / Wali Kelas
                    </button>

                    {/* JADWAL */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("jadwal")
                      }
                      className={`theme-text-muted inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                        activeTab === "jadwal"
                          ? "border-[var(--color-primary)] theme-sidebar-text-active"
                          : "border-transparent hover:border-[var(--color-border)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      <BookOpen size={16} />
                      Mata Pelajaran / Jadwal
                    </button>
                  </nav>
                </div>
              </div>

              {/* CONTENT CARD */}

              <section className="theme-card theme-border min-w-0 overflow-hidden rounded-2xl border shadow-sm">

                {/* =================================================
                    TAB KELAS
                ================================================= */}

                {activeTab === "kelas" && (
                  <div>
                    <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                      <h2 className="theme-text text-base font-bold">
                        Informasi Kelas
                      </h2>

                      <p className="theme-text-muted mt-1 text-sm">
                        Detail informasi kelas yang sedang dipilih.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">

                      {/* NAMA */}

                      <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                        <p className="theme-text-muted mb-1.5 text-xs font-medium">
                          Nama Kelas
                        </p>

                        <p className="theme-text text-sm font-semibold">
                          {kelas.nama || "-"}
                        </p>
                      </div>

                      {/* TINGKAT */}

                      <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                        <p className="theme-text-muted mb-1.5 text-xs font-medium">
                          Tingkat
                        </p>

                        <p className="theme-text text-sm font-semibold">
                          {getTingkatLabel(
                            kelas.tingkat
                          )}
                        </p>
                      </div>

                      {/* TAHUN */}

                      <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                        <p className="theme-text-muted mb-1.5 text-xs font-medium">
                          Tahun Ajaran
                        </p>

                        <p className="theme-text text-sm font-semibold">
                          {getTahunAjaranName(
                            kelas.tahunAjaran
                          )}
                        </p>

                        {kelas.tahunAjaran?.semester && (
                          <p className="theme-text-muted mt-1 text-xs">
                            Semester{" "}
                            {kelas.tahunAjaran.semester}
                          </p>
                        )}
                      </div>

                      {/* WALI */}

                      <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                        <p className="theme-text-muted mb-1.5 text-xs font-medium">
                          Wali Kelas
                        </p>

                        <p className="theme-text text-sm font-semibold">
                          {getNama(
                            kelas.waliKelas
                          ) || "-"}
                        </p>
                      </div>

                      {/* JUMLAH SISWA */}

                      <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                        <p className="theme-text-muted mb-1.5 text-xs font-medium">
                          Jumlah Siswa
                        </p>

                        <p className="theme-text text-sm font-semibold">
                          {jumlahSiswa} siswa
                        </p>
                      </div>

                      {/* KAPASITAS */}

                      <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                        <p className="theme-text-muted mb-1.5 text-xs font-medium">
                          Kapasitas Kelas
                        </p>

                        <p className="theme-text text-sm font-semibold">
                          {kelas.kapasitas ?? 0} siswa
                        </p>
                      </div>

                      {/* RUANGAN */}

                      <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                        <p className="theme-text-muted mb-1.5 text-xs font-medium">
                          Ruangan
                        </p>

                        <p className="theme-text text-sm font-semibold">
                          {kelas.lantai?.gedung?.nama ||
                            kelas.lantai?.nama ||
                            kelas.ruangan?.nama ||
                            kelas.ruangan ||
                            "-"}
                        </p>
                      </div>

                      {/* STATUS */}

                      <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                        <p className="theme-text-muted mb-2 text-xs font-medium">
                          Status Kelas
                        </p>

                        <span
                          className={
                            kelas.status === "aktif"
                              ? "theme-success inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                              : "theme-danger inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          }
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />

                          {kelas.status === "aktif"
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

                {activeTab === "siswa" && (
                  <div>
                    <div className="theme-border-soft flex flex-col gap-3 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div>
                        <h2 className="theme-text text-base font-bold">
                          Daftar Siswa
                        </h2>

                        <p className="theme-text-muted mt-1 text-sm">
                          Daftar siswa yang terdaftar di kelas{" "}
                          <span className="theme-text-secondary font-medium">
                            {kelas.nama || "-"}
                          </span>
                          .
                        </p>
                      </div>

                      <div className="theme-info inline-flex w-fit shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
                        <Users size={16} />
                        {jumlahSiswa} Siswa
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[700px] text-sm">
                        <thead>
                          <tr className="theme-table-header theme-border border-b">
                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              No
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              Nama Siswa
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              NIS
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              NISN
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {daftarSiswa.length > 0 ? (
                            daftarSiswa.map(
                              (anggota, index) => {
                                const siswa =
                                  getSiswaData(
                                    anggota
                                  );

                                const nama =
                                  getNamaSiswa(
                                    anggota
                                  );

                                const initial =
                                  nama !== "-"
                                    ? nama
                                        .charAt(0)
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
                                    className="theme-border-soft theme-table-hover border-b transition"
                                  >
                                    <td className="theme-text-muted px-5 py-4">
                                      {index + 1}
                                    </td>

                                    <td className="px-5 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                                          {initial}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="theme-text truncate font-semibold">
                                            {nama}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="theme-text-secondary px-5 py-4">
                                      {getNisSiswa(
                                        anggota
                                      )}
                                    </td>

                                    <td className="theme-text-secondary px-5 py-4">
                                      {getNisnSiswa(
                                        anggota
                                      )}
                                    </td>

                                    <td className="px-5 py-4">
                                      <span className="theme-success inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
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
                                colSpan={5}
                                className="px-5 py-14 text-center"
                              >
                                <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                                  <Users size={23} />
                                </div>

                                <p className="theme-text-secondary mt-4 text-sm font-semibold">
                                  Belum ada siswa
                                </p>

                                <p className="theme-text-muted mt-1 text-xs">
                                  Belum ada siswa yang terdaftar di kelas ini.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {daftarSiswa.length > 0 && (
                      <div className="theme-card-soft theme-border-soft border-t px-5 py-3.5 sm:px-6">
                        <div className="theme-text-muted flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            Total{" "}
                            <strong className="theme-text-secondary font-semibold">
                              {daftarSiswa.length}
                            </strong>{" "}
                            siswa terdaftar
                          </span>

                          <span>
                            Kelas{" "}
                            <strong className="theme-sidebar-text-active font-semibold">
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

                {activeTab === "guru" && (
                  <div>
                    <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                      <h2 className="theme-text text-base font-bold">
                        Guru dan Wali Kelas
                      </h2>

                      <p className="theme-text-muted mt-1 text-sm">
                        Daftar guru yang terkait dengan kegiatan pembelajaran kelas.
                      </p>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[760px] text-sm">
                        <thead>
                          <tr className="theme-table-header theme-border border-b">
                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              No
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              Nama Guru
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              Mata Pelajaran
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              Peran
                            </th>

                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                              Jam Mengajar
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {guruList.filter(
                            (guru) =>
                              guru?.mapel ||
                              guru?.mataPelajaran
                          ).length > 0 ? (
                            guruList
                              .filter(
                                (guru) =>
                                  guru?.mapel ||
                                  guru?.mataPelajaran
                              )
                              .map(
                                (guru, index) => {
                                  const namaGuru =
                                    getNama(guru);

                                  const jam =
                                    jamPerGuru[
                                      namaGuru
                                    ] || 0;

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
                                      className="theme-border-soft theme-table-hover border-b transition"
                                    >
                                      <td className="theme-text-muted px-5 py-4">
                                        {index + 1}
                                      </td>

                                      <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                          <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                                            {namaGuru
                                              ?.charAt(
                                                0
                                              )
                                              ?.toUpperCase() ||
                                              "G"}
                                          </div>

                                          <span className="theme-text font-semibold">
                                            {namaGuru ||
                                              "-"}
                                          </span>
                                        </div>
                                      </td>

                                      <td className="theme-text-secondary px-5 py-4">
                                        {guru?.mapel ||
                                          guru?.mataPelajaran?.nama ||
                                          "-"}
                                      </td>

                                      <td className="px-5 py-4">
                                        {isWali ? (
                                          <span className="theme-info inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold">
                                            <UserCheck size={13} />
                                            Wali Kelas
                                          </span>
                                        ) : (
                                          <span className="theme-text-muted">
                                            Guru
                                          </span>
                                        )}
                                      </td>

                                      <td className="px-5 py-4">
                                        <span className="theme-sidebar-text-active font-semibold">
                                          {jam} jam
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                }
                              )
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-5 py-12 text-center"
                              >
                                <UserCheck
                                  size={30}
                                  className="theme-text-placeholder mx-auto mb-3"
                                />

                                <p className="theme-text-secondary text-sm font-semibold">
                                  Belum ada guru
                                </p>

                                <p className="theme-text-muted mt-1 text-xs">
                                  Data guru belum tersedia untuk kelas ini.
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

                {activeTab === "jadwal" && (
                  <div>

                    {/* HEADER */}

                    <div className="theme-border-soft flex flex-col gap-4 border-b px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="theme-text text-base font-bold">
                          Jadwal Pelajaran
                        </h2>

                        <p className="theme-text-muted mt-1 text-sm">
                          Jadwal mata pelajaran dan guru pengajar untuk kelas ini.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={loadJadwal}
                          disabled={loadingJadwal}
                          className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-header-hover)] disabled:cursor-not-allowed disabled:opacity-60"
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
                              (prev) => !prev
                            )
                          }
                          className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition"
                        >
                          {showAddJadwal ? (
                            <X size={16} />
                          ) : (
                            <Plus size={16} />
                          )}

                          {showAddJadwal
                            ? "Tutup Form"
                            : "Tambah Jadwal"}
                        </button>
                      </div>
                    </div>

                    {/* ERROR JADWAL */}

                    {jadwalError && (
                      <div className="theme-warning theme-border border-b px-5 py-3.5 sm:px-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                          />

                          <div>
                            <p className="text-sm font-semibold">
                              Gagal memuat jadwal
                            </p>

                            <p className="mt-0.5 text-xs">
                              {jadwalError}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FORM TAMBAH */}

                    {showAddJadwal && (
                      <div className="theme-card-soft theme-border border-b p-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

                          {/* HARI */}

                          <div>
                            <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                              Hari
                            </label>

                            <select
                              value={newJadwal.hari}
                              onChange={(e) =>
                                setNewJadwal(
                                  (prev) => ({
                                    ...prev,
                                    hari: e.target.value,
                                  })
                                )
                              }
                              className="theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            >
                              {HARI_LIST.map(
                                (hari) => (
                                  <option
                                    key={hari}
                                    value={hari}
                                  >
                                    {hari}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* JAM MULAI */}

                          <div>
                            <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                              Jam Mulai
                            </label>

                            <input
                              type="time"
                              value={
                                newJadwal.jamMulai
                              }
                              onChange={(e) =>
                                setNewJadwal(
                                  (prev) => ({
                                    ...prev,
                                    jamMulai:
                                      e.target.value,
                                  })
                                )
                              }
                              className="theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            />
                          </div>

                          {/* JAM SELESAI */}

                          <div>
                            <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                              Jam Selesai
                            </label>

                            <input
                              type="time"
                              value={
                                newJadwal.jamSelesai
                              }
                              onChange={(e) =>
                                setNewJadwal(
                                  (prev) => ({
                                    ...prev,
                                    jamSelesai:
                                      e.target.value,
                                  })
                                )
                              }
                              className="theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            />
                          </div>

                          {/* MAPEL */}

                          <div>
                            <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                              Mata Pelajaran
                            </label>

                            <select
                              value={
                                newJadwal.mapel
                              }
                              onChange={(e) =>
                                setNewJadwal(
                                  (prev) => ({
                                    ...prev,
                                    mapel:
                                      e.target.value,
                                  })
                                )
                              }
                              className="theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            >
                              <option value="">
                                Pilih Mapel
                              </option>

                              {mapelList.map(
                                (mapel) => (
                                  <option
                                    key={mapel.id}
                                    value={mapel.nama}
                                  >
                                    {mapel.nama}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* GURU */}

                          <div>
                            <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                              Guru
                            </label>

                            <select
                              value={
                                newJadwal.guru
                              }
                              onChange={(e) =>
                                setNewJadwal(
                                  (prev) => ({
                                    ...prev,
                                    guru:
                                      e.target.value,
                                  })
                                )
                              }
                              className="theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            >
                              <option value="">
                                Pilih Guru
                              </option>

                              {guruList.map(
                                (guru) => (
                                  <option
                                    key={guru.id}
                                    value={getNama(guru)}
                                  >
                                    {getNama(guru)}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* RUANGAN */}

                          <div>
                            <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                              Ruangan
                            </label>

                            <input
                              type="text"
                              value={
                                newJadwal.ruangan
                              }
                              onChange={(e) =>
                                setNewJadwal(
                                  (prev) => ({
                                    ...prev,
                                    ruangan:
                                      e.target.value,
                                  })
                                )
                              }
                              placeholder="A-01"
                              className="theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
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
                            className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition hover:bg-[var(--color-header-hover)]"
                          >
                            <X size={15} />
                            Batal
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleAddJadwal
                            }
                            className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition"
                          >
                            <Check size={16} />
                            Simpan Jadwal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LOADING JADWAL */}

                    {loadingJadwal ? (
                      <div className="flex min-h-[280px] flex-col items-center justify-center">
                        <Loader2
                          size={28}
                          className="animate-spin text-[var(--color-primary)]"
                        />

                        <p className="theme-text-muted mt-3 text-sm font-medium">
                          Memuat jadwal pelajaran...
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* TABLE */}

                        <div className="w-full overflow-x-auto">
                          <table className="w-full min-w-[1000px] text-sm">
                            <thead>
                              <tr className="theme-table-header theme-border border-b">
                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                                  No
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                                  Hari
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                                  Waktu
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                                  Mata Pelajaran
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                                  Guru
                                </th>

                                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider">
                                  Ruangan
                                </th>

                                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider">
                                  Aksi
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {jadwal.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="px-5 py-14 text-center"
                                  >
                                    <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                                      <Calendar size={23} />
                                    </div>

                                    <p className="theme-text-secondary mt-4 text-sm font-semibold">
                                      Belum ada jadwal
                                    </p>

                                    <p className="theme-text-muted mt-1 text-xs">
                                      Belum ada jadwal pelajaran untuk kelas ini.
                                    </p>
                                  </td>
                                </tr>
                              ) : (
                                jadwal.map(
                                  (item, index) => {
                                    const guru =
                                      getGuruName(item);

                                    const mapel =
                                      getMapelName(item);

                                    return (
                                      <tr
                                        key={
                                          item.id ??
                                          index
                                        }
                                        className="theme-border-soft theme-table-hover border-b transition"
                                      >
                                        <td className="theme-text-muted px-5 py-4">
                                          {index + 1}
                                        </td>

                                        <td className="px-5 py-4">
                                          <span className="theme-text font-semibold">
                                            {item.hari ||
                                              "-"}
                                          </span>
                                        </td>

                                        <td className="px-5 py-4">
                                          <div className="theme-text-secondary flex items-center gap-2">
                                            <Clock3
                                              size={15}
                                              className="theme-text-placeholder"
                                            />

                                            <span className="whitespace-nowrap">
                                              {item.jamMulai ||
                                                "-"}{" "}
                                              –{" "}
                                              {item.jamSelesai ||
                                                "-"}
                                            </span>
                                          </div>
                                        </td>

                                        <td className="px-5 py-4">
                                          <span className="theme-text font-semibold">
                                            {mapel}
                                          </span>
                                        </td>

                                        <td className="theme-text-secondary px-5 py-4">
                                          {getGuruLabel(
                                            guru
                                          )}
                                        </td>

                                        <td className="px-5 py-4">
                                          <div className="theme-text-secondary flex items-center gap-2">
                                            <MapPin
                                              size={14}
                                              className="theme-text-placeholder"
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
                                            className="theme-text-muted inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
                                          >
                                            <Trash2 size={16} />
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

                        {jadwal.length > 0 && (
                          <div className="theme-card-soft theme-border-soft border-t px-5 py-3.5 sm:px-6">
                            <div className="theme-text-muted flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
                              <span>
                                Total{" "}
                                <strong className="theme-text-secondary font-semibold">
                                  {jadwal.length}
                                </strong>{" "}
                                jadwal pelajaran
                              </span>

                              <span>
                                Kelas{" "}
                                <strong className="theme-sidebar-text-active font-semibold">
                                  {kelas.nama}
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