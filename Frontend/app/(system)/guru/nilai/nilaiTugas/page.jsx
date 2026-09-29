"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  GraduationCap,
  ChevronDown,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  Pencil,
  Save,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

import {
  getTugasGuru,
  getPengumpulanByTugas,
  beriNilaiTugas,
} from "../../../../services/tugas.service";

const KKM = 75;

const colorClasses = {
  emerald: {
    badge:
      "bg-emerald-50 text-emerald-600 border-emerald-200",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  },

  blue: {
    badge:
      "bg-blue-50 text-blue-600 border-blue-200",
    bar: "bg-blue-500",
    text: "text-blue-600",
  },

  amber: {
    badge:
      "bg-amber-50 text-amber-600 border-amber-200",
    bar: "bg-amber-500",
    text: "text-amber-600",
  },

  rose: {
    badge:
      "bg-rose-50 text-rose-600 border-rose-200",
    bar: "bg-rose-500",
    text: "text-rose-600",
  },

  slate: {
    badge:
      "bg-slate-100 text-slate-500 border-slate-200",
    bar: "bg-slate-300",
    text: "text-slate-500",
  },
};

function getPredikat(nilai) {
  if (
    nilai === null ||
    nilai === undefined ||
    nilai === ""
  ) {
    return null;
  }

  const n = Number(nilai);

  if (n >= 90) {
    return {
      label: "A",
      color: "emerald",
    };
  }

  if (n >= KKM) {
    return {
      label: "B",
      color: "blue",
    };
  }

  if (n >= 60) {
    return {
      label: "C",
      color: "amber",
    };
  }

  return {
    label: "D",
    color: "rose",
  };
}

function getTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getJam(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GuruNilaiTugasPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [loadingPengumpulan, setLoadingPengumpulan] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [tugasList, setTugasList] =
    useState([]);

  const [selectedKelasMapelId, setSelectedKelasMapelId] =
    useState("");

  const [selectedTugasId, setSelectedTugasId] =
    useState("");

  const [pengumpulanList, setPengumpulanList] =
    useState([]);

  const [nilaiForm, setNilaiForm] =
    useState({});

  const [catatanForm, setCatatanForm] =
    useState({});

  const [sidebarNotifications] = useState([
    {
      id: 1,
      title: "Rapat Wali Kelas",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Batas Input Nilai Rapor",
      desc: "Dikirim 5 jam lalu",
      read: false,
    },
  ]);

  /*
   * ==========================================
   * AMBIL SEMUA TUGAS GURU
   * ==========================================
   */
  const loadTugas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTugasGuru();

      setTugasList(
        Array.isArray(data) ? data : []
      );

      if (Array.isArray(data) && data.length > 0) {
        setSelectedKelasMapelId(
          data[0].kelasMapelId
        );

        setSelectedTugasId(
          data[0].id
        );
      } else {
        setSelectedKelasMapelId("");
        setSelectedTugasId("");
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Gagal mengambil data tugas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTugas();
  }, []);

  /*
   * ==========================================
   * FILTER KELAS-MAPEL
   * ==========================================
   */
  const kelasMapelOptions = useMemo(() => {
    const map = new Map();

    tugasList.forEach((tugas) => {
      if (!tugas.kelasMapelId) return;

      if (!map.has(tugas.kelasMapelId)) {
        map.set(tugas.kelasMapelId, {
          id: tugas.kelasMapelId,
          kelasNama:
            tugas.kelasNama || "-",
          mapelNama:
            tugas.mapelNama || "-",
          guruNama:
            tugas.guruNama || "-",
        });
      }
    });

    return Array.from(map.values());
  }, [tugasList]);

  /*
   * ==========================================
   * TUGAS UNTUK KELAS-MAPEL TERPILIH
   * ==========================================
   */
  const tugasKelasIni = useMemo(() => {
    return tugasList
      .filter(
        (tugas) =>
          tugas.kelasMapelId ===
          selectedKelasMapelId
      )
      .sort((a, b) => {
        const dateA =
          new Date(
            a.dibuatPada ||
              a.batasWaktu ||
              0
          ).getTime();

        const dateB =
          new Date(
            b.dibuatPada ||
              b.batasWaktu ||
              0
          ).getTime();

        return dateB - dateA;
      });
  }, [
    tugasList,
    selectedKelasMapelId,
  ]);

  /*
   * ==========================================
   * TUGAS YANG SEDANG DIPILIH
   * ==========================================
   */
  const selectedTugas = useMemo(() => {
    return (
      tugasList.find(
        (tugas) =>
          tugas.id === selectedTugasId
      ) || null
    );
  }, [
    tugasList,
    selectedTugasId,
  ]);

  /*
   * ==========================================
   * AMBIL PENGUMPULAN
   * ==========================================
   */
  const loadPengumpulan = async (
    tugasId
  ) => {
    if (!tugasId) {
      setPengumpulanList([]);
      setNilaiForm({});
      setCatatanForm({});
      return;
    }

    try {
      setLoadingPengumpulan(true);
      setError("");
      setSuccess("");

      const response =
        await getPengumpulanByTugas(
          tugasId
        );

      const data =
        response?.data?.data ??
        response?.data ??
        response ??
        [];

      const list =
        Array.isArray(data)
          ? data
          : [];

      setPengumpulanList(list);

      const nilai = {};
      const catatan = {};

      list.forEach((item) => {
        nilai[item.id] =
          item.nilai ?? "";

        catatan[item.id] =
          item.keterangan ?? "";
      });

      setNilaiForm(nilai);
      setCatatanForm(catatan);
    } catch (err) {
      console.error(err);

      setPengumpulanList([]);
      setNilaiForm({});
      setCatatanForm({});

      setError(
        err?.message ||
          "Gagal mengambil pengumpulan siswa."
      );
    } finally {
      setLoadingPengumpulan(false);
    }
  };

  useEffect(() => {
    if (selectedTugasId) {
      loadPengumpulan(
        selectedTugasId
      );
    }
  }, [selectedTugasId]);

  /*
   * ==========================================
   * KETIKA KELAS-MAPEL BERUBAH
   * ==========================================
   */
  const handleKelasMapelChange = (
    value
  ) => {
    setSelectedKelasMapelId(value);

    const tugasPertama =
      tugasList.find(
        (tugas) =>
          tugas.kelasMapelId === value
      );

    setSelectedTugasId(
      tugasPertama?.id || ""
    );

    setSuccess("");
    setError("");
  };

  /*
   * ==========================================
   * KETIKA TUGAS BERUBAH
   * ==========================================
   */
  const handleTugasChange = (
    value
  ) => {
    setSelectedTugasId(value);
    setSuccess("");
    setError("");
  };

  /*
   * ==========================================
   * INPUT NILAI
   * ==========================================
   */
  const setNilaiSiswa = (
    pengumpulanId,
    value
  ) => {
    if (value !== "") {
      const number = Number(value);

      if (
        Number.isNaN(number) ||
        number < 0 ||
        number > 100
      ) {
        return;
      }
    }

    setNilaiForm((prev) => ({
      ...prev,
      [pengumpulanId]: value,
    }));
  };

  /*
   * ==========================================
   * INPUT CATATAN
   * ==========================================
   */
  const setCatatanSiswa = (
    pengumpulanId,
    value
  ) => {
    setCatatanForm((prev) => ({
      ...prev,
      [pengumpulanId]: value,
    }));
  };

  /*
   * ==========================================
   * REKAP
   * ==========================================
   */
  const nilaiTerisi = useMemo(() => {
    return Object.values(
      nilaiForm
    ).filter(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined
    );
  }, [nilaiForm]);

  const rekap = useMemo(() => {
    const angka =
      nilaiTerisi
        .map(Number)
        .filter(
          (value) =>
            !Number.isNaN(value)
        );

    if (angka.length === 0) {
      return {
        rataRata: 0,
        tertinggi: 0,
        terendah: 0,
        belumTuntas: 0,
        sudahDinilai: 0,
      };
    }

    const rataRata =
      Math.round(
        (angka.reduce(
          (a, b) => a + b,
          0
        ) /
          angka.length) *
          10
      ) / 10;

    return {
      rataRata,
      tertinggi:
        Math.max(...angka),
      terendah:
        Math.min(...angka),
      belumTuntas:
        angka.filter(
          (n) => n < KKM
        ).length,
      sudahDinilai:
        angka.length,
    };
  }, [nilaiTerisi]);

  /*
   * ==========================================
   * SIMPAN SEMUA NILAI
   * ==========================================
   */
  const simpanSemuaNilai =
    async () => {
      const dataYangDinilai =
        pengumpulanList.filter(
          (item) => {
            const value =
              nilaiForm[item.id];

            return (
              value !== "" &&
              value !== null &&
              value !== undefined
            );
          }
        );

      if (
        dataYangDinilai.length === 0
      ) {
        setError(
          "Belum ada nilai yang diisi."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await Promise.all(
          dataYangDinilai.map(
            (item) =>
              beriNilaiTugas(
                item.id,
                {
                  nilai: Number(
                    nilaiForm[item.id]
                  ),
                  keterangan:
                    catatanForm[
                      item.id
                    ] || null,
                }
              )
          )
        );

        setSuccess(
          "Semua nilai berhasil disimpan."
        );

        await loadPengumpulan(
          selectedTugasId
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
            "Gagal menyimpan nilai."
        );
      } finally {
        setSaving(false);
      }
    };

  /*
   * ==========================================
   * REFRESH
   * ==========================================
   */
  const refreshData = async () => {
    setSuccess("");
    setError("");

    await loadTugas();

    if (selectedTugasId) {
      await loadPengumpulan(
        selectedTugasId
      );
    }
  };

  const kelasTerpilih =
    kelasMapelOptions.find(
      (item) =>
        item.id ===
        selectedKelasMapelId
    );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="nilaiTugas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          notifications={
            sidebarNotifications
          }
          user={{
            name: "Guru",
            email:
              "guru@smartschool.com",
            avatar: "GU",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
                    <GraduationCap
                      size={18}
                    />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Nilai Tugas
                  </h1>
                </div>

                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles
                    size={14}
                    className="text-slate-400"
                  />

                  <span>
                    Input dan rekap nilai
                    tugas siswa dari
                    tugas yang telah
                    diberikan.
                  </span>
                </p>
              </div>

              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700">
                <XCircle
                  size={18}
                  className="flex-shrink-0 mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="text-xs mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2
                  size={18}
                />

                <p className="text-sm font-medium">
                  {success}
                </p>
              </div>
            )}

            {/* SELECTOR */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* KELAS MAPEL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    Kelas & Mata Pelajaran
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedKelasMapelId
                      }
                      onChange={(e) =>
                        handleKelasMapelChange(
                          e.target.value
                        )
                      }
                      disabled={
                        loading ||
                        kelasMapelOptions.length ===
                          0
                      }
                      className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50"
                    >
                      {kelasMapelOptions.length ===
                      0 ? (
                        <option value="">
                          Belum ada kelas-mapel
                        </option>
                      ) : (
                        kelasMapelOptions.map(
                          (item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              Kelas{" "}
                              {
                                item.kelasNama
                              }{" "}
                              ·{" "}
                              {
                                item.mapelNama
                              }
                            </option>
                          )
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* TUGAS */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    Tugas / Penilaian
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedTugasId
                      }
                      onChange={(e) =>
                        handleTugasChange(
                          e.target.value
                        )
                      }
                      disabled={
                        tugasKelasIni.length ===
                        0
                      }
                      className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50"
                    >
                      {tugasKelasIni.length ===
                      0 ? (
                        <option value="">
                          Belum ada tugas
                        </option>
                      ) : (
                        tugasKelasIni.map(
                          (tugas) => (
                            <option
                              key={tugas.id}
                              value={tugas.id}
                            >
                              {tugas.judul}
                            </option>
                          )
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DETAIL TUGAS */}
            {selectedTugas && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText
                        size={17}
                        className="text-blue-500"
                      />

                      <h2 className="text-sm font-semibold text-slate-800 truncate">
                        {selectedTugas.judul}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                      <span>
                        Kelas{" "}
                        {selectedTugas.kelasNama}
                      </span>

                      <span>
                        Mapel{" "}
                        {selectedTugas.mapelNama}
                      </span>

                      <span>
                        Dibuat{" "}
                        {getTanggal(
                          selectedTugas.dibuatPada
                        )}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock
                          size={12}
                        />

                        Batas{" "}
                        {getTanggal(
                          selectedTugas.batasWaktu
                        )}

                        {getJam(
                          selectedTugas.batasWaktu
                        ) &&
                          ` · ${getJam(
                            selectedTugas.batasWaktu
                          )}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs font-medium">
                      {pengumpulanList.length}{" "}
                      pengumpulan
                    </span>

                    {kelasTerpilih && (
                      <span className="px-2.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium">
                        Kelas{" "}
                        {kelasTerpilih.kelasNama}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUMMARY */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3">
                <div className="p-2 rounded-lg border bg-slate-100 text-slate-500 border-slate-200">
                  <Users size={16} />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Pengumpulan
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {pengumpulanList.length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3">
                <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                  <BarChart3
                    size={16}
                  />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Rata-rata
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {rekap.rataRata ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200">
                  <TrendingUp
                    size={16}
                  />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Tertinggi
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {rekap.tertinggi ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3">
                <div className="p-2 rounded-lg border bg-rose-50 text-rose-600 border-rose-200">
                  <TrendingDown
                    size={16}
                  />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Terendah
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {rekap.terendah ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200">
                  <AlertTriangle
                    size={16}
                  />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Belum Tuntas
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {rekap.belumTuntas}
                  </p>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* FORM NILAI */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

                <div className="p-4 sm:p-5 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Daftar Nilai Siswa
                      </h2>

                      <p className="text-xs text-slate-400 mt-1">
                        Nilai 0–100 · KKM{" "}
                        {KKM}
                      </p>
                    </div>

                    {pengumpulanList.length >
                      0 && (
                      <button
                        onClick={
                          simpanSemuaNilai
                        }
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        {saving ? (
                          <RefreshCw
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Save
                            size={15}
                          />
                        )}

                        {saving
                          ? "Menyimpan..."
                          : "Simpan Semua Nilai"}
                      </button>
                    )}
                  </div>
                </div>

                {loadingPengumpulan ? (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <RefreshCw
                      size={24}
                      className="text-blue-500 animate-spin"
                    />

                    <p className="text-sm text-slate-500 mt-3">
                      Mengambil data
                      pengumpulan siswa...
                    </p>
                  </div>
                ) : pengumpulanList.length ===
                  0 ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Users
                        size={20}
                        className="text-slate-400"
                      />
                    </div>

                    <h3 className="text-sm font-semibold text-slate-700 mt-4">
                      Belum ada pengumpulan
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Belum ada siswa yang
                      mengumpulkan tugas
                      ini.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pengumpulanList.map(
                      (
                        item,
                        index
                      ) => {
                        const siswa =
                          item.pengguna ||
                          {};

                        const nilai =
                          nilaiForm[
                            item.id
                          ] ?? "";

                        const predikat =
                          getPredikat(
                            nilai
                          );

                        return (
                          <div
                            key={item.id}
                            className="p-4 sm:px-5 sm:py-4 hover:bg-slate-50/60 transition-colors"
                          >
                            <div className="flex flex-col gap-3">

                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <span className="w-6 text-xs font-medium text-slate-400">
                                    {index +
                                      1}
                                    .
                                  </span>

                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                      {siswa.namaLengkap ||
                                        "Nama siswa"}
                                    </p>

                                    <p className="text-[11px] text-slate-400">
                                      NISN{" "}
                                      {siswa.nisn ||
                                        "-"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={
                                      nilai
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      setNilaiSiswa(
                                        item.id,
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    placeholder="0-100"
                                    className="w-20 px-3 py-1.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                  />

                                  <span
                                    className={`inline-flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-lg border ${
                                      predikat
                                        ? colorClasses[
                                            predikat
                                              .color
                                          ].badge
                                        : colorClasses
                                            .slate
                                            .badge
                                    }`}
                                  >
                                    {predikat
                                      ? predikat.label
                                      : "-"}
                                  </span>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={
                                  catatanForm[
                                    item.id
                                  ] || ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  setCatatanSiswa(
                                    item.id,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Catatan / feedback untuk siswa (opsional)"
                                className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                              />

                              <div className="flex flex-wrap items-center gap-2">
                                {item.status ===
                                  "dinilai" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    <CheckCircle2
                                      size={11}
                                    />
                                    Sudah dinilai
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                    <Clock
                                      size={11}
                                    />
                                    Belum dinilai
                                  </span>
                                )}

                                {item.urlFile && (
                                  <a
                                    href={
                                      item.urlFile
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                  >
                                    Lihat pengumpulan
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {pengumpulanList.length >
                  0 && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        {rekap.sudahDinilai} dari{" "}
                        {
                          pengumpulanList.length
                        }{" "}
                        pengumpulan sudah
                        memiliki nilai.
                      </p>

                      <p className="text-[11px] text-slate-400 mt-1">
                        Perubahan akan
                        disimpan ke database
                        SmartSchool.
                      </p>
                    </div>

                    <button
                      onClick={
                        simpanSemuaNilai
                      }
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      {saving ? (
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={15}
                        />
                      )}

                      {saving
                        ? "Menyimpan..."
                        : "Simpan Nilai"}
                    </button>
                  </div>
                )}
              </div>

              {/* SIDEBAR KANAN */}
              <div className="space-y-6">

                {/* STATISTIK */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award
                      size={16}
                      className="text-slate-400"
                    />

                    <h2 className="text-sm font-semibold text-slate-800">
                      Statistik
                    </h2>
                  </div>

                  {nilaiTerisi.length ===
                  0 ? (
                    <p className="text-xs text-slate-400">
                      Belum ada nilai yang
                      diinput.
                    </p>
                  ) : (
                    <div className="space-y-4">

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-slate-400">
                            Rata-rata
                          </span>

                          <span className="text-lg font-bold text-slate-800">
                            {
                              rekap.rataRata
                            }
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${Math.min(
                                rekap.rataRata,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                          <p className="text-[11px] text-emerald-600">
                            Tertinggi
                          </p>

                          <p className="text-lg font-bold text-emerald-700 mt-1">
                            {
                              rekap.tertinggi
                            }
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                          <p className="text-[11px] text-rose-600">
                            Terendah
                          </p>

                          <p className="text-lg font-bold text-rose-700 mt-1">
                            {
                              rekap.terendah
                            }
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            size={14}
                            className="text-amber-500"
                          />

                          <span className="text-xs font-medium text-amber-700">
                            Di bawah KKM
                          </span>
                        </div>

                        <p className="text-lg font-bold text-amber-700 mt-1">
                          {
                            rekap.belumTuntas
                          }{" "}
                          siswa
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* DAFTAR TUGAS */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-slate-100">
                    <History
                      size={16}
                      className="text-slate-400"
                    />

                    <h2 className="text-sm font-semibold text-slate-800">
                      Riwayat Tugas
                    </h2>
                  </div>

                  {tugasKelasIni.length ===
                  0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-slate-400">
                        Belum ada tugas pada
                        kelas ini.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                      {tugasKelasIni.map(
                        (tugas) => {
                          const aktif =
                            tugas.id ===
                            selectedTugasId;

                          return (
                            <button
                              key={
                                tugas.id
                              }
                              onClick={() =>
                                setSelectedTugasId(
                                  tugas.id
                                )
                              }
                              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                                aktif
                                  ? "bg-blue-50/60"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-lg flex-shrink-0 ${
                                    aktif
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <FileText
                                    size={
                                      15
                                    }
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-xs font-medium truncate ${
                                      aktif
                                        ? "text-blue-700"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {
                                      tugas.judul
                                    }
                                  </p>

                                  <p className="text-[11px] text-slate-400 mt-1">
                                    {getTanggal(
                                      tugas.batasWaktu
                                    )}
                                  </p>

                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">
                                      {
                                        tugas.jumlahPengumpulan ??
                                        0
                                      }{" "}
                                      dikumpulkan
                                    </span>

                                    {aktif && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
                                        Dibuka
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}