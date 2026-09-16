"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  ArrowLeft,
  BookMarked,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Hash,
  Type,
  ToggleLeft,
  Info,
  School,
  UserRound,
  Search,
  ChevronDown,
  Check,
  X,
  BookOpen,
} from "lucide-react";

import {
  createMataPelajaran,
} from "../../../../../services/mataPelajaran.service";

import {
  createKelasMapel,
} from "../../../../../services/kelasMapel.service";

import {
  getKelas,
} from "../../../../../services/kelas.service";

import {
  getUsers,
} from "../../../../../services/user.service";

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const aktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        aktif
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          aktif
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}

/* =========================================================
   RESPONSE DATA HELPER
========================================================= */

function getResponseData(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.users)) {
    return response.users;
  }

  if (Array.isArray(response?.kelas)) {
    return response.kelas;
  }

  return [];
}

function getUserData(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

/* =========================================================
   PAGE
========================================================= */

export default function TambahMapelPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [form, setForm] = useState({
    nama: "",
    kode: "",
    status: "aktif",
    guruPengajarId: "",
  });

  const [kelasList, setKelasList] =
    useState([]);

  const [guruList, setGuruList] =
    useState([]);

  const [selectedKelasIds, setSelectedKelasIds] =
    useState([]);

  const [kelasSearch, setKelasSearch] =
    useState("");

  const [guruSearch, setGuruSearch] =
    useState("");

  const [showGuruDropdown, setShowGuruDropdown] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  /* =========================================================
     LOAD KELAS + GURU
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoadingData(true);
        setError("");

        const [
          kelasResponse,
          guruResponse,
        ] = await Promise.all([
          getKelas({
            page: 1,
            limit: 100,
          }),

          getUsers({
            page: 1,
            limit: 100,
            role: "guru",
            status: "aktif",
          }),
        ]);

        if (!mounted) return;

        const kelasData =
          getResponseData(kelasResponse);

        const guruData =
          getUserData(guruResponse);

        setKelasList(kelasData);
        setGuruList(guruData);
      } catch (err) {
        console.error(
          "LOAD DATA TAMBAH MAPEL ERROR:",
          err
        );

        if (!mounted) return;

        setError(
          err?.message ||
            "Gagal mengambil data kelas dan guru."
        );
      } finally {
        if (mounted) {
          setLoadingData(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     HANDLE FORM
  ========================================================= */

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     FILTER KELAS
  ========================================================= */

  const filteredKelas = useMemo(() => {
    const keyword =
      kelasSearch
        .trim()
        .toLowerCase();

    if (!keyword) {
      return kelasList;
    }

    return kelasList.filter(
      (kelas) => {
        const nama =
          String(
            kelas?.nama || ""
          ).toLowerCase();

        const tingkat =
          String(
            kelas?.tingkat || ""
          ).toLowerCase();

        return (
          nama.includes(keyword) ||
          tingkat.includes(keyword)
        );
      }
    );
  }, [
    kelasList,
    kelasSearch,
  ]);

  /* =========================================================
     FILTER GURU
  ========================================================= */

  const filteredGuru = useMemo(() => {
    const keyword =
      guruSearch
        .trim()
        .toLowerCase();

    if (!keyword) {
      return guruList;
    }

    return guruList.filter(
      (guru) => {
        const nama =
          String(
            guru?.namaLengkap || ""
          ).toLowerCase();

        const email =
          String(
            guru?.email || ""
          ).toLowerCase();

        const nip =
          String(
            guru?.nip || ""
          ).toLowerCase();

        return (
          nama.includes(keyword) ||
          email.includes(keyword) ||
          nip.includes(keyword)
        );
      }
    );
  }, [
    guruList,
    guruSearch,
  ]);

  /* =========================================================
     SELECTED GURU
  ========================================================= */

  const selectedGuru = useMemo(() => {
    return guruList.find(
      (guru) =>
        guru.id ===
        form.guruPengajarId
    );
  }, [
    guruList,
    form.guruPengajarId,
  ]);

  /* =========================================================
     SELECTED KELAS
  ========================================================= */

  const selectedKelas = useMemo(() => {
    return kelasList.filter(
      (kelas) =>
        selectedKelasIds.includes(
          kelas.id
        )
    );
  }, [
    kelasList,
    selectedKelasIds,
  ]);

  /* =========================================================
     TOGGLE KELAS
  ========================================================= */

  const toggleKelas = (
    kelasId
  ) => {
    setSelectedKelasIds(
      (prev) => {
        if (
          prev.includes(kelasId)
        ) {
          return prev.filter(
            (id) =>
              id !== kelasId
          );
        }

        return [
          ...prev,
          kelasId,
        ];
      }
    );

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     SELECT ALL KELAS
  ========================================================= */

  const selectAllFilteredKelas =
    () => {
      const filteredIds =
        filteredKelas.map(
          (kelas) =>
            kelas.id
        );

      setSelectedKelasIds(
        (prev) => {
          const merged =
            new Set([
              ...prev,
              ...filteredIds,
            ]);

          return Array.from(
            merged
          );
        }
      );

      if (error) {
        setError("");
      }
    };

  /* =========================================================
     CLEAR KELAS
  ========================================================= */

  const clearSelectedKelas =
    () => {
      setSelectedKelasIds([]);
    };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (saving) return;

    const nama =
      form.nama.trim();

    const kode =
      form.kode.trim().toUpperCase();

    /* VALIDASI */

    if (!nama) {
      setError(
        "Nama mata pelajaran wajib diisi."
      );
      return;
    }

    if (!kode) {
      setError(
        "Kode mata pelajaran wajib diisi."
      );
      return;
    }

    if (!form.guruPengajarId) {
      setError(
        "Guru pengajar wajib dipilih."
      );
      return;
    }

    if (
      selectedKelasIds.length ===
      0
    ) {
      setError(
        "Minimal pilih satu kelas untuk mata pelajaran ini."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      /* ======================================================
         STEP 1
         CREATE MATA PELAJARAN
      ====================================================== */

      const mapelResponse =
        await createMataPelajaran({
          nama,
          kode,
          status: form.status,
        });

      if (
        !mapelResponse?.success
      ) {
        throw new Error(
          mapelResponse?.message ||
            "Gagal membuat mata pelajaran."
        );
      }

      const mataPelajaranId =
        mapelResponse?.data?.id;

      if (!mataPelajaranId) {
        throw new Error(
          "Mata pelajaran berhasil dibuat, tetapi ID mata pelajaran tidak diterima dari server."
        );
      }

      /* ======================================================
         STEP 2
         CREATE KELAS MAPEL
      ====================================================== */

      const relationResults =
        await Promise.allSettled(
          selectedKelasIds.map(
            async (kelasId) => {
              return createKelasMapel({
                kelasId,
                mataPelajaranId,
                guruPengajarId:
                  form.guruPengajarId,
              });
            }
          )
        );

      const failedRelations =
        relationResults.filter(
          (result) =>
            result.status ===
            "rejected"
        );

      if (
        failedRelations.length >
        0
      ) {
        console.error(
          "GAGAL CREATE KELAS MAPEL:",
          failedRelations
        );

        const berhasil =
          relationResults.length -
          failedRelations.length;

        throw new Error(
          `Mata pelajaran berhasil dibuat, tetapi ${failedRelations.length} relasi kelas gagal dibuat. ${berhasil} relasi berhasil dibuat.`
        );
      }

      /* SEMUA BERHASIL */

      setSuccess(true);

      setTimeout(() => {
        router.push(
          "/admin/guru/mapel"
        );

        router.refresh();
      }, 1200);

    } catch (err) {
      console.error(
        "CREATE MAPEL + KELAS MAPEL ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal menyimpan mata pelajaran."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    if (saving) return;

    router.push(
      "/admin/guru/mapel"
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active="guruMapel"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
        role="admin"
      />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        <Header
          toggleSidebar={
            toggleSidebar
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">

          <div className="p-4 sm:p-6 lg:p-8">

            <div className="max-w-7xl mx-auto space-y-6">

              {/* ==================================================
                  PAGE HEADER
              ================================================== */}

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={
                    handleBack
                  }
                  disabled={saving}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Kembali"
                >
                  <ArrowLeft
                    size={20}
                  />
                </button>

                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-blue-900/10 shrink-0">
                  <BookMarked
                    size={20}
                  />
                </div>

                <div className="min-w-0">

                  <h1 className="text-2xl font-bold text-slate-800">
                    Tambah Mata
                    Pelajaran
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Tambahkan mata
                    pelajaran,
                    guru pengajar,
                    dan kelas yang
                    menggunakan
                    mata pelajaran.
                  </p>

                </div>

              </div>

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50">

                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2
                      size={20}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-emerald-800">
                      Mata pelajaran
                      berhasil
                      ditambahkan
                    </p>

                    <p className="text-xs text-emerald-700 mt-0.5">
                      Relasi guru dan
                      kelas berhasil
                      disimpan.
                      Mengalihkan ke
                      daftar mata
                      pelajaran...
                    </p>

                  </div>

                </div>
              )}

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50">

                  <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                    <AlertCircle
                      size={20}
                      className="text-rose-600"
                    />
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-semibold text-rose-800">
                      Gagal menyimpan
                      data
                    </p>

                    <p className="text-sm text-rose-700 mt-1">
                      {error}
                    </p>

                  </div>

                </div>
              )}

              {/* ==================================================
                  LOADING DATA
              ================================================== */}

              {loadingData && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50">

                  <Loader2
                    size={19}
                    className="text-[#155DFC] animate-spin"
                  />

                  <div>

                    <p className="text-sm font-semibold text-blue-800">
                      Menyiapkan data
                    </p>

                    <p className="text-xs text-blue-700 mt-0.5">
                      Mengambil daftar
                      kelas dan guru
                      dari server...
                    </p>

                  </div>

                </div>
              )}

              {/* ==================================================
                  CONTENT GRID
              ================================================== */}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* =================================================
                    LEFT FORM
                ================================================= */}

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >

                  {/* FORM HEADER */}

                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">

                        <BookMarked
                          size={18}
                          className="text-[#155DFC]"
                        />

                      </div>

                      <div>

                        <h2 className="text-sm font-semibold text-slate-700">
                          Detail Mata
                          Pelajaran
                        </h2>

                        <p className="text-xs text-slate-500 mt-0.5">
                          Isi informasi
                          dasar mata
                          pelajaran.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* FORM BODY */}

                  <div className="p-6 space-y-7">

                    {/* NAMA */}

                    <div>

                      <label
                        htmlFor="nama"
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2"
                      >
                        <Type
                          size={14}
                          className="text-slate-400"
                        />

                        Nama Mata
                        Pelajaran

                        <span className="text-rose-500">
                          *
                        </span>
                      </label>

                      <input
                        id="nama"
                        type="text"
                        value={
                          form.nama
                        }
                        onChange={(e) =>
                          handleChange(
                            "nama",
                            e.target.value
                          )
                        }
                        placeholder="Contoh: Matematika"
                        disabled={saving}
                        autoComplete="off"
                        className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />

                      <p className="text-xs text-slate-400 mt-1.5">
                        Masukkan nama
                        mata pelajaran
                        sesuai kurikulum
                        sekolah.
                      </p>

                    </div>

                    {/* KODE */}

                    <div>

                      <label
                        htmlFor="kode"
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2"
                      >
                        <Hash
                          size={14}
                          className="text-slate-400"
                        />

                        Kode Mata
                        Pelajaran

                        <span className="text-rose-500">
                          *
                        </span>
                      </label>

                      <input
                        id="kode"
                        type="text"
                        value={
                          form.kode
                        }
                        onChange={(e) =>
                          handleChange(
                            "kode",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="Contoh: MTK-01"
                        disabled={saving}
                        autoComplete="off"
                        className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      />

                      <p className="text-xs text-slate-400 mt-1.5">
                        Kode harus unik
                        untuk sekolah
                        ini.
                      </p>

                    </div>

                    {/* STATUS */}

                    <div>

                      <label
                        htmlFor="status"
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2"
                      >
                        <ToggleLeft
                          size={15}
                          className="text-slate-400"
                        />

                        Status
                      </label>

                      <select
                        id="status"
                        value={
                          form.status
                        }
                        onChange={(e) =>
                          handleChange(
                            "status",
                            e.target.value
                          )
                        }
                        disabled={saving}
                        className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="aktif">
                          Aktif
                        </option>

                        <option value="nonaktif">
                          Nonaktif
                        </option>
                      </select>

                    </div>

                    {/* GURU */}

                    <div>

                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">

                        <UserRound
                          size={14}
                          className="text-slate-400"
                        />

                        Guru Pengajar

                        <span className="text-rose-500">
                          *
                        </span>

                      </label>

                      <div className="relative">

                        <button
                          type="button"
                          disabled={
                            saving ||
                            loadingData
                          }
                          onClick={() =>
                            setShowGuruDropdown(
                              (prev) =>
                                !prev
                            )
                          }
                          className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-white text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                        >

                          <div className="flex items-center gap-3 min-w-0">

                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">

                              <UserRound
                                size={15}
                                className="text-[#155DFC]"
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="text-sm font-medium text-slate-700 truncate">

                                {selectedGuru
                                  ?.namaLengkap ||
                                  "Pilih guru pengajar"}

                              </p>

                              {selectedGuru && (
                                <p className="text-[11px] text-slate-400 truncate">
                                  {selectedGuru.email ||
                                    selectedGuru.nip ||
                                    "Guru"}
                                </p>
                              )}

                            </div>

                          </div>

                          <ChevronDown
                            size={17}
                            className={`text-slate-400 shrink-0 transition-transform ${
                              showGuruDropdown
                                ? "rotate-180"
                                : ""
                            }`}
                          />

                        </button>

                        {showGuruDropdown && (
                          <div className="absolute z-30 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">

                            <div className="p-3 border-b border-slate-100">

                              <div className="relative">

                                <Search
                                  size={15}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                  type="text"
                                  value={
                                    guruSearch
                                  }
                                  onChange={(e) =>
                                    setGuruSearch(
                                      e.target.value
                                    )
                                  }
                                  placeholder="Cari nama, email, atau NIP..."
                                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50"
                                />

                              </div>

                            </div>

                            <div className="max-h-64 overflow-y-auto">

                              {filteredGuru.length ===
                              0 ? (
                                <div className="p-6 text-center">

                                  <UserRound
                                    size={24}
                                    className="mx-auto text-slate-300"
                                  />

                                  <p className="text-xs text-slate-500 mt-2">
                                    Guru tidak
                                    ditemukan.
                                  </p>

                                </div>
                              ) : (
                                filteredGuru.map(
                                  (guru) => (
                                    <button
                                      key={
                                        guru.id
                                      }
                                      type="button"
                                      onClick={() => {
                                        handleChange(
                                          "guruPengajarId",
                                          guru.id
                                        );

                                        setShowGuruDropdown(
                                          false
                                        );

                                        setGuruSearch(
                                          ""
                                        );
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                                    >

                                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">

                                        <UserRound
                                          size={
                                            16
                                          }
                                          className="text-slate-500"
                                        />

                                      </div>

                                      <div className="flex-1 min-w-0">

                                        <p className="text-sm font-medium text-slate-700 truncate">
                                          {
                                            guru.namaLengkap
                                          }
                                        </p>

                                        <p className="text-[11px] text-slate-400 truncate">
                                          {guru.nip
                                            ? `NIP ${guru.nip}`
                                            : guru.email}
                                        </p>

                                      </div>

                                      {form.guruPengajarId ===
                                        guru.id && (
                                        <Check
                                          size={
                                            17
                                          }
                                          className="text-[#155DFC] shrink-0"
                                        />
                                      )}

                                    </button>
                                  )
                                )
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                      {selectedGuru && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">

                          <CheckCircle2
                            size={13}
                          />

                          Guru pengajar:
                          <span className="font-semibold">
                            {
                              selectedGuru.namaLengkap
                            }
                          </span>

                        </div>
                      )}

                    </div>

                    {/* KELAS */}

                    <div>

                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-2">

                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">

                          <School
                            size={14}
                            className="text-slate-400"
                          />

                          Kelas yang
                          Menggunakan Mapel

                          <span className="text-rose-500">
                            *
                          </span>

                        </label>

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={
                              selectAllFilteredKelas
                            }
                            disabled={
                              saving ||
                              loadingData ||
                              filteredKelas.length ===
                                0
                            }
                            className="text-xs font-medium text-[#155DFC] hover:text-[#0d47c9] disabled:text-slate-300"
                          >
                            Pilih semua
                          </button>

                          <span className="text-slate-300">
                            |
                          </span>

                          <button
                            type="button"
                            onClick={
                              clearSelectedKelas
                            }
                            disabled={
                              saving ||
                              selectedKelasIds.length ===
                                0
                            }
                            className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:text-slate-300"
                          >
                            Bersihkan
                          </button>

                        </div>

                      </div>

                      <div className="relative mb-3">

                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          value={
                            kelasSearch
                          }
                          onChange={(e) =>
                            setKelasSearch(
                              e.target.value
                            )
                          }
                          disabled={
                            saving ||
                            loadingData
                          }
                          placeholder="Cari nama kelas..."
                          className="w-full pl-9 pr-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50 transition-all disabled:bg-slate-50"
                        />

                      </div>

                      <div className="flex items-center justify-between mb-3">

                        <p className="text-xs text-slate-500">

                          {selectedKelasIds.length >
                          0 ? (
                            <>
                              <span className="font-semibold text-[#155DFC]">
                                {
                                  selectedKelasIds.length
                                }
                              </span>{" "}
                              kelas dipilih
                            </>
                          ) : (
                            "Belum ada kelas dipilih"
                          )}

                        </p>

                        <p className="text-[11px] text-slate-400">
                          Total {kelasList.length} kelas
                        </p>

                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden">

                        {loadingData ? (
                          <div className="p-8 text-center">

                            <Loader2
                              size={22}
                              className="mx-auto text-[#155DFC] animate-spin"
                            />

                            <p className="text-xs text-slate-500 mt-2">
                              Memuat kelas...
                            </p>

                          </div>
                        ) : filteredKelas.length ===
                          0 ? (
                          <div className="p-8 text-center">

                            <School
                              size={28}
                              className="mx-auto text-slate-300"
                            />

                            <p className="text-sm font-medium text-slate-500 mt-2">
                              Kelas tidak
                              ditemukan
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              Coba gunakan kata
                              pencarian lain.
                            </p>

                          </div>
                        ) : (
                          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">

                            {filteredKelas.map(
                              (kelas) => {
                                const isSelected =
                                  selectedKelasIds.includes(
                                    kelas.id
                                  );

                                return (
                                  <button
                                    key={
                                      kelas.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      toggleKelas(
                                        kelas.id
                                      )
                                    }
                                    disabled={
                                      saving
                                    }
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                      isSelected
                                        ? "bg-blue-50/70"
                                        : "bg-white hover:bg-slate-50"
                                    }`}
                                  >

                                    <div
                                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                        isSelected
                                          ? "bg-[#155DFC] border-[#155DFC]"
                                          : "bg-white border-slate-300"
                                      }`}
                                    >

                                      {isSelected && (
                                        <Check
                                          size={14}
                                          className="text-white"
                                        />
                                      )}

                                    </div>

                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">

                                      <School
                                        size={16}
                                        className="text-slate-500"
                                      />

                                    </div>

                                    <div className="flex-1 min-w-0">

                                      <p className="text-sm font-semibold text-slate-700 truncate">
                                        {kelas.nama}
                                      </p>

                                      <p className="text-[11px] text-slate-400 mt-0.5">

                                        {kelas.tingkat
                                          ? `Tingkat ${kelas.tingkat}`
                                          : "Kelas"}

                                        {kelas.kapasitas
                                          ? ` • Kapasitas ${kelas.kapasitas}`
                                          : ""}

                                      </p>

                                    </div>

                                    {isSelected && (
                                      <CheckCircle2
                                        size={17}
                                        className="text-[#155DFC] shrink-0"
                                      />
                                    )}

                                  </button>
                                );
                              }
                            )}

                          </div>
                        )}

                      </div>

                      {selectedKelas.length >
                        0 && (
                        <div className="mt-3 flex flex-wrap gap-2">

                          {selectedKelas.map(
                            (kelas) => (
                              <span
                                key={
                                  kelas.id
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs font-medium text-[#155DFC]"
                              >

                                {
                                  kelas.nama
                                }

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleKelas(
                                      kelas.id
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                                  title={`Hapus ${kelas.nama}`}
                                >

                                  <X
                                    size={
                                      13
                                    }
                                  />

                                </button>

                              </span>
                            )
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      FORM FOOTER
                  ================================================= */}

                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/60">

                    <button
                      type="button"
                      onClick={
                        handleBack
                      }
                      disabled={saving}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        success ||
                        loadingData
                      }
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#155DFC] hover:bg-[#0d47c9] text-white rounded-xl transition-all shadow-sm font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                      {saving ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />

                          Menyimpan
                          data...
                        </>
                      ) : (
                        <>
                          <Save
                            size={17}
                          />

                          Simpan Mata
                          Pelajaran
                        </>
                      )}

                    </button>

                  </div>

                </form>

                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="space-y-6">

                  {/* PREVIEW */}

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">

                      <h2 className="text-sm font-semibold text-slate-700">
                        Pratinjau
                      </h2>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Data yang akan
                        disimpan ke
                        SmartSchool.
                      </p>

                    </div>

                    <div className="p-5">

                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="font-mono text-xs font-semibold text-[#155DFC] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">

                            {form.kode.trim()
                              ? form.kode
                                  .trim()
                                  .toUpperCase()
                              : "KODE"}

                          </span>

                          <StatusBadge
                            status={
                              form.status
                            }
                          />

                        </div>

                        <h3 className="text-base font-bold text-slate-900 mt-3">

                          {form.nama.trim() ||
                            "Nama mata pelajaran"}

                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          Mata Pelajaran
                        </p>

                        {selectedGuru && (
                          <div className="mt-4 pt-3 border-t border-slate-200">

                            <div className="flex items-center gap-2">

                              <UserRound
                                size={14}
                                className="text-slate-400"
                              />

                              <div className="min-w-0">

                                <p className="text-[11px] text-slate-400">
                                  Guru Pengajar
                                </p>

                                <p className="text-xs font-semibold text-slate-700 truncate">
                                  {
                                    selectedGuru.namaLengkap
                                  }
                                </p>

                              </div>

                            </div>

                          </div>
                        )}

                        {selectedKelas.length >
                          0 && (
                          <div className="mt-3">

                            <div className="flex items-center gap-2 mb-2">

                              <School
                                size={14}
                                className="text-slate-400"
                              />

                              <p className="text-[11px] text-slate-400">
                                Kelas
                              </p>

                            </div>

                            <div className="flex flex-wrap gap-1.5">

                              {selectedKelas
                                .slice(
                                  0,
                                  6
                                )
                                .map(
                                  (kelas) => (
                                    <span
                                      key={
                                        kelas.id
                                      }
                                      className="text-[10px] px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600"
                                    >
                                      {
                                        kelas.nama
                                      }
                                    </span>
                                  )
                                )}

                              {selectedKelas.length >
                                6 && (
                                <span className="text-[10px] px-2 py-1 rounded-md bg-slate-100 text-slate-500">
                                  +
                                  {selectedKelas.length -
                                    6}{" "}
                                  lainnya
                                </span>
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* RELATION INFO */}

                  <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">

                    <div className="flex items-center gap-2 mb-3">

                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">

                        <BookOpen
                          size={16}
                          className="text-[#155DFC]"
                        />

                      </div>

                      <div>

                        <h2 className="text-sm font-semibold text-[#0d47c9]">
                          Relasi Pengajaran
                        </h2>

                        <p className="text-[11px] text-blue-700/70">
                          Kelas Mapel
                        </p>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-xs text-slate-500">
                          Guru
                        </span>

                        <span className="text-xs font-semibold text-slate-700 text-right">
                          {selectedGuru?.namaLengkap ||
                            "-"}
                        </span>

                      </div>

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-xs text-slate-500">
                          Jumlah kelas
                        </span>

                        <span className="text-xs font-semibold text-[#155DFC]">
                          {
                            selectedKelasIds.length
                          }
                        </span>

                      </div>

                      <div className="pt-3 border-t border-blue-100">

                        <p className="text-[11px] text-blue-700/70 leading-relaxed">
                          Setelah mata
                          pelajaran
                          berhasil dibuat,
                          SmartSchool akan
                          otomatis membuat
                          relasi antara
                          mata pelajaran,
                          guru pengajar,
                          dan setiap kelas
                          yang dipilih.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* BACKEND INFO */}

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

                    <div className="flex items-start gap-3">

                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">

                        <Info
                          size={18}
                          className="text-emerald-600"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          Sinkronisasi
                          Backend
                        </p>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Data sekolah
                          otomatis mengikuti
                          akun Admin Sekolah
                          yang sedang login.
                          Form ini tidak
                          mengirim sekolahId
                          secara manual.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}