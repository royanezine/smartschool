"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  GraduationCap,
  Save,
  X,
  School,
  Users,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  Edit3,
  Loader2,
  Info,
  Building2,
  Layers3,
  AlertCircle,
  UserCheck,
} from "lucide-react";

import {
  getKelasById,
  updateKelas,
} from "@/services/kelas.service";

import {
  getTahunAjaran,
} from "@/services/tahunAjaran.service";

import {
  getUsers,
} from "@/services/user.service";

import {
  getGedung,
  getLantaiByGedung,
} from "@/services/infrastruktur.service";

const TINGKAT_OPTIONS = [
  {
    value: 10,
    label: "X (Sepuluh)",
  },
  {
    value: 11,
    label: "XI (Sebelas)",
  },
  {
    value: 12,
    label: "XII (Dua Belas)",
  },
];

function unwrapData(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
}

export default function AdminKelasEditPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);

  const [loading, setLoading] = useState(false);

  const [loadingTahun, setLoadingTahun] = useState(true);

  const [loadingGedung, setLoadingGedung] = useState(true);

  const [loadingLantai, setLoadingLantai] = useState(false);

  const [loadingGuru, setLoadingGuru] = useState(true);

  const [tahunAjaranList, setTahunAjaranList] = useState([]);

  const [gedungList, setGedungList] = useState([]);

  const [lantaiList, setLantaiList] = useState([]);

  const [guruList, setGuruList] = useState([]);

  const [waliKelasAwal, setWaliKelasAwal] = useState(null);

  const [jumlahSiswa, setJumlahSiswa] = useState(0);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    tingkat: "",
    tahunAjaranId: "",
    kapasitas: "",
    waliKelasId: "",
    gedungId: "",
    lantaiId: "",
    fotoKelasUrl: null,
  });

  async function loadGuru() {
    try {
      setLoadingGuru(true);

      const response = await getUsers({
        page: 1,
        limit: 200,
        role: "guru",
        status: "aktif",
      });

      const list = unwrapData(response);

      setGuruList(list);
    } catch (err) {
      console.error(
        "Gagal mengambil data guru:",
        err
      );

      setGuruList([]);

      setError(
        err?.message ||
          "Gagal mengambil data guru."
      );
    } finally {
      setLoadingGuru(false);
    }
  }


  async function loadTahunAjaran() {
    try {
      setLoadingTahun(true);

      const response = await getTahunAjaran();

      const list = unwrapData(response);

      setTahunAjaranList(list);
    } catch (err) {
      console.error(
        "Gagal mengambil tahun ajaran:",
        err
      );
    } finally {
      setLoadingTahun(false);
    }
  }

  async function loadGedung() {
    try {
      setLoadingGedung(true);

      const response = await getGedung();

      const list = unwrapData(response);

      setGedungList(list);
    } catch (err) {
      console.error(
        "Gagal mengambil gedung:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data gedung."
      );
    } finally {
      setLoadingGedung(false);
    }
  }

  async function loadLantai(
    gedungId,
    selectedLantaiId = ""
  ) {
    if (!gedungId) {
      setLantaiList([]);
      return;
    }

    try {
      setLoadingLantai(true);

      const response =
        await getLantaiByGedung(gedungId);

      const list = unwrapData(response);

      setLantaiList(list);

      if (selectedLantaiId) {
        const exists = list.some(
          (item) =>
            item.id === selectedLantaiId
        );

        if (!exists) {
          setForm((prev) => ({
            ...prev,
            lantaiId: "",
          }));
        }
      }
    } catch (err) {
      console.error(
        "Gagal mengambil lantai:",
        err
      );

      setLantaiList([]);

      setError(
        err?.message ||
          "Gagal mengambil data lantai."
      );
    } finally {
      setLoadingLantai(false);
    }
  }

  async function loadDetail() {
    try {
      setPageLoading(true);
      setError("");

      console.log(
        "========== LOAD DETAIL KELAS =========="
      );

      console.log("ID:", id);

      const response =
        await getKelasById(id);

      console.log(
        "RESPONSE DETAIL:",
        response
      );

      const data =
        response?.data?.data ??
        response?.data ??
        response?.result ??
        response;

      console.log(
        "DATA DETAIL:",
        data
      );

      if (!data || !data.id) {
        throw new Error(
          "Data kelas tidak ditemukan."
        );
      }

      const lantaiId =
        data.lantaiId ||
        data.lantai_id ||
        data.lantai?.id ||
        "";

      const gedungId =
        data.lantai?.gedungId ||
        data.lantai?.gedung_id ||
        data.lantai?.gedung?.id ||
        "";

      setForm({
        nama: data.nama || "",

        tingkat:
          data.tingkat !== null &&
          data.tingkat !== undefined
            ? String(data.tingkat)
            : "",

        tahunAjaranId:
          data.tahunAjaranId ||
          data.tahun_ajaran_id ||
          data.tahunAjaran?.id ||
          "",

        kapasitas:
          data.kapasitas !== null &&
          data.kapasitas !== undefined
            ? String(data.kapasitas)
            : "",

        waliKelasId:
          data.waliKelasId ||
          data.wali_kelas_id ||
          data.waliKelas?.id ||
          "",

        gedungId,

        lantaiId,

        fotoKelasUrl:
          data.fotoKelasUrl ||
          data.foto_kelas_url ||
          null,
      });

      setWaliKelasAwal(data.waliKelas || null);

      const count = Number(
        data?._count?.anggota ??
          data?.jumlahSiswa ??
          data?.jumlah_siswa ??
          data?.anggota?.length ??
          0
      );

      setJumlahSiswa(
        Number.isFinite(count)
          ? count
          : 0
      );

      if (gedungId) {
        await loadLantai(
          gedungId,
          lantaiId
        );
      }
    } catch (err) {
      console.error(
        "Gagal mengambil detail kelas:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data kelas."
      );
    } finally {
      setPageLoading(false);
    }
  }


  useEffect(() => {
    const timer = setTimeout(() => {
      loadTahunAjaran();
      loadGedung();
      loadGuru();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!id) {
      const timer = setTimeout(() => {
        setError("ID kelas tidak ditemukan.");
        setPageLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      loadDetail();
    }, 0);
    return () => clearTimeout(timer);
  }, [id]);

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    if (name === "gedungId") {
      setForm((prev) => ({
        ...prev,
        gedungId: value,
        lantaiId: "",
      }));

      setLantaiList([]);

      if (value) {
        loadLantai(value);
      }

      setError("");
      setSuccess("");

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }


  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!id) {
      setError(
        "ID kelas tidak ditemukan."
      );
      return;
    }

    if (!form.nama.trim()) {
      setError(
        "Nama kelas wajib diisi."
      );
      return;
    }

    if (!form.tingkat) {
      setError(
        "Tingkat kelas wajib dipilih."
      );
      return;
    }

    if (!form.tahunAjaranId) {
      setError(
        "Tahun ajaran wajib dipilih."
      );
      return;
    }

    if (!form.kapasitas) {
      setError(
        "Kapasitas kelas wajib diisi."
      );
      return;
    }

    const kapasitas =
      Number(form.kapasitas);

    if (!Number.isFinite(kapasitas)) {
      setError(
        "Kapasitas harus berupa angka."
      );
      return;
    }

    if (kapasitas < 1) {
      setError(
        "Kapasitas kelas minimal 1 siswa."
      );
      return;
    }

    if (
      form.gedungId &&
      !form.lantaiId
    ) {
      setError(
        "Jika gedung dipilih, lantai juga harus dipilih."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nama: form.nama.trim(),

        tingkat:
          Number(form.tingkat),

        tahunAjaranId:
          form.tahunAjaranId,

        kapasitas,

        waliKelasId:
          form.waliKelasId || null,

        lantaiId:
          form.lantaiId || null,

        fotoKelasUrl:
          form.fotoKelasUrl || null,
      };

      console.log(
        "========== UPDATE KELAS =========="
      );

      console.log(
        "ID:",
        id
      );

      console.log(
        "PAYLOAD:",
        payload
      );

      const response =
        await updateKelas(
          id,
          payload
        );

      console.log(
        "UPDATE RESPONSE:",
        response
      );

      console.log(
        "================================="
      );

      setSuccess(
        "Data kelas berhasil diperbarui."
      );

      setTimeout(() => {
        router.push(
          `/admin/akademik/kelas/${id}`
        );

        router.refresh();
      }, 800);
    } catch (err) {
      console.error(
        "Gagal memperbarui kelas:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui data kelas."
      );
    } finally {
      setLoading(false);
    }
  }


  if (pageLoading) {
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

          <main className="theme-page flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={30}
                className="animate-spin theme-sidebar-text-active"
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

  const selectedGedung =
    gedungList.find(
      (item) =>
        item.id === form.gedungId
    );

  const selectedLantai =
    lantaiList.find(
      (item) =>
        item.id === form.lantaiId
    );

  const opsiWali = (() => {
    const list = Array.isArray(guruList)
      ? [...guruList]
      : [];

    if (
      form.waliKelasId &&
      waliKelasAwal?.id &&
      !list.some(
        (guru) =>
          String(guru.id) ===
          String(form.waliKelasId)
      )
    ) {
      list.unshift(waliKelasAwal);
    }

    return list;
  })();

  const selectedWali = opsiWali.find(
    (guru) =>
      String(guru.id) ===
      String(form.waliKelasId)
  );

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

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/admin/akademik/kelas/${id}`
                  )
                }
                className="p-2.5 rounded-xl theme-card theme-border theme-text-muted theme-header-hover transition-colors shrink-0"
                title="Kembali ke detail kelas"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="p-2.5 rounded-xl bg-[image:var(--color-brand-logo-bg)] text-white shadow-lg shrink-0">
                <Edit3 size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Edit Kelas
                </h1>
                <p className="text-sm theme-text-muted">
                  Perbarui informasi kelas termasuk lokasi gedung dan lantai.
                </p>
              </div>
            </div>





              {error && (
                <div className="theme-danger mb-5 flex items-start gap-3 rounded-2xl border p-4">
                  <div className="theme-danger flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      Gagal memuat / menyimpan data
                    </p>

                    <p className="mt-1 break-words text-sm leading-6">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="theme-header-hover rounded-lg p-1 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}


              {success && (
                <div className="theme-success mb-5 flex items-start gap-3 rounded-2xl border p-4">
                  <div className="theme-success flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <CheckCircle size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="mt-1 text-sm leading-6">
                      {success}
                    </p>
                  </div>
                </div>
              )}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <form
                onSubmit={handleSubmit}
                className="lg:col-span-2 theme-card rounded-xl border shadow-sm overflow-hidden"
              >
                <div className="theme-card-soft theme-border-soft border-b px-4 py-4 sm:px-6 md:px-7">
                  <div className="flex items-start gap-3">
                    <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <School size={19} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Kelas
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs leading-5">
                        Perbarui data kelas dan lokasi
                        ruangannya.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full p-4 sm:p-6 md:p-7 lg:p-8">
                  <div className="grid w-full grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">


                    <div className="min-w-0 md:col-span-2">
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Nama Kelas
                        <span className="ml-1 text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <GraduationCap
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          name="nama"
                          value={form.nama}
                          onChange={handleChange}
                          disabled={loading}
                          placeholder="Contoh: X RPL 1"
                          className="theme-input h-11 w-full rounded-xl border pl-10 pr-3 text-sm outline-none transition disabled:opacity-60"
                        />
                      </div>
                    </div>


                    <div>
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Tingkat
                        <span className="ml-1 text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <School
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <select
                          name="tingkat"
                          value={form.tingkat}
                          onChange={handleChange}
                          disabled={loading}
                          className="theme-input h-11 w-full appearance-none rounded-xl border pl-10 pr-10 text-sm outline-none disabled:opacity-60"
                        >
                          <option value="">
                            Pilih tingkat
                          </option>

                          {TINGKAT_OPTIONS.map(
                            (item) => (
                              <option
                                key={item.value}
                                value={item.value}
                              >
                                {item.label}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown
                          size={16}
                          className="theme-text-placeholder pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                        />
                      </div>
                    </div>


                    <div>
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Tahun Ajaran
                        <span className="ml-1 text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                        />

                        <select
                          name="tahunAjaranId"
                          value={
                            form.tahunAjaranId
                          }
                          onChange={
                            handleChange
                          }
                          disabled={
                            loading ||
                            loadingTahun
                          }
                          className="theme-input h-11 w-full appearance-none rounded-xl border pl-10 pr-10 text-sm outline-none disabled:opacity-60"
                        >
                          <option value="">
                            {loadingTahun
                              ? "Memuat..."
                              : "Pilih tahun ajaran"}
                          </option>

                          {tahunAjaranList.map(
                            (item) => (
                              <option
                                key={item.id}
                                value={item.id}
                              >
                                {item.nama} -{" "}
                                {item.semester}
                                {item.status ===
                                "aktif"
                                  ? " (Aktif)"
                                  : ""}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown
                          size={16}
                          className="theme-text-placeholder pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                        />
                      </div>
                    </div>


                    <div>
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Kapasitas Kelas
                        <span className="ml-1 text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Users
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="number"
                          min="1"
                          name="kapasitas"
                          value={
                            form.kapasitas
                          }
                          onChange={
                            handleChange
                          }
                          disabled={loading}
                          className="theme-input h-11 w-full rounded-xl border pl-10 pr-3 text-sm outline-none disabled:opacity-60"
                        />
                      </div>
                    </div>


                    <div>
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Jumlah Siswa
                      </label>

                      <div className="relative">
                        <Users
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          value={jumlahSiswa}
                          readOnly
                          className="theme-input theme-card-soft h-11 w-full rounded-xl border pl-10 pr-3 text-sm font-semibold outline-none"
                        />
                      </div>
                    </div>


                    <div className="min-w-0 md:col-span-2">
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Wali Kelas
                      </label>

                      <div className="relative">
                        <UserCheck
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                        />

                        <select
                          name="waliKelasId"
                          value={form.waliKelasId}
                          onChange={handleChange}
                          disabled={loading || loadingGuru}
                          className="theme-input h-11 w-full appearance-none rounded-xl border pl-10 pr-10 text-sm outline-none disabled:opacity-60"
                        >
                          <option value="">
                            {loadingGuru
                              ? "Memuat data guru..."
                              : "Belum ditentukan / Tanpa wali kelas"}
                          </option>

                          {opsiWali.map((guru) => (
                            <option
                              key={guru.id}
                              value={guru.id}
                            >
                              {guru.namaLengkap ||
                                guru.namaPengguna ||
                                guru.email}
                              {guru.nip
                                ? ` (NIP ${guru.nip})`
                                : ""}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={16}
                          className="theme-text-placeholder pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                        />
                      </div>

                      <p className="theme-text-muted mt-1.5 text-[11px] leading-5">
                        {selectedWali
                          ? `Wali kelas saat ini: ${
                              selectedWali.namaLengkap ||
                              selectedWali.namaPengguna ||
                              selectedWali.email
                            }`
                          : "Kelas ini belum memiliki wali kelas."}
                      </p>

                      <p className="theme-text-muted mt-0.5 text-[11px] leading-5">
                        Satu guru dapat menjadi wali kelas pada lebih dari
                        satu kelas. Mengubah wali di sini tidak mengubah
                        penugasan pada kelas lain.
                      </p>
                    </div>


                    <div>
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Gedung
                      </label>

                      <div className="relative">
                        <Building2
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                        />

                        <select
                          name="gedungId"
                          value={
                            form.gedungId
                          }
                          onChange={
                            handleChange
                          }
                          disabled={
                            loading ||
                            loadingGedung
                          }
                          className="theme-input h-11 w-full appearance-none rounded-xl border pl-10 pr-10 text-sm outline-none disabled:opacity-60"
                        >
                          <option value="">
                            {loadingGedung
                              ? "Memuat gedung..."
                              : "Tanpa lokasi gedung"}
                          </option>

                          {gedungList.map(
                            (gedung) => (
                              <option
                                key={gedung.id}
                                value={gedung.id}
                              >
                                {gedung.nama}
                                {gedung.kode
                                  ? ` (${gedung.kode})`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown
                          size={16}
                          className="theme-text-placeholder pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                        />
                      </div>
                    </div>


                    <div>
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Lantai
                      </label>

                      <div className="relative">
                        <Layers3
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                        />

                        <select
                          name="lantaiId"
                          value={
                            form.lantaiId
                          }
                          onChange={
                            handleChange
                          }
                          disabled={
                            loading ||
                            !form.gedungId ||
                            loadingLantai
                          }
                          className="theme-input h-11 w-full appearance-none rounded-xl border pl-10 pr-10 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">
                            {loadingLantai
                              ? "Memuat lantai..."
                              : !form.gedungId
                              ? "Pilih gedung dahulu"
                              : lantaiList.length ===
                                0
                              ? "Belum ada lantai"
                              : "Pilih lantai"}
                          </option>

                          {lantaiList.map(
                            (lantai) => (
                              <option
                                key={lantai.id}
                                value={lantai.id}
                              >
                                {lantai.nama}
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown
                          size={16}
                          className="theme-text-placeholder pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                        />
                      </div>
                    </div>
                  </div>


                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 px-6 py-4 border-t theme-border-soft theme-card-soft">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/akademik/kelas/${id}`
                      )
                    }
                    disabled={loading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border theme-border theme-text-secondary theme-header-hover transition-all font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <X size={17} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      loadingTahun ||
                      loadingGedung
                    }
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 theme-primary rounded-xl transition-all shadow-sm font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Side Preview & Existing Information Panel */}
              <div className="space-y-6">
                <div className="theme-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b theme-border-soft theme-card-soft">
                    <h2 className="text-sm font-semibold theme-text-secondary">
                      Pratinjau Kelas
                    </h2>
                    <p className="text-xs theme-text-muted mt-0.5">
                      Ringkasan data kelas saat ini.
                    </p>
                  </div>

                  <div className="bg-[image:var(--color-brand-logo-bg)] px-5 py-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-[color:color-mix(in_srgb,var(--color-card)_20%,transparent)] text-[var(--color-card)]">
                      <GraduationCap size={22} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-[color:color-mix(in_srgb,var(--color-card)_80%,transparent)]">
                        Kelas {selectedTingkat?.label || "-"}
                      </p>
                      <p className="font-bold text-[var(--color-card)] text-base leading-tight truncate">
                        {form.nama || "Nama Kelas"}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">Tingkat</span>
                      <span className="font-medium text-xs theme-text-secondary">
                        {selectedTingkat?.label || "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">Tahun Ajaran</span>
                      <span className="theme-text-secondary font-medium text-xs">
                        {selectedTahun
                          ? `${selectedTahun.nama} (${selectedTahun.semester})`
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">Kapasitas / Siswa</span>
                      <span className="theme-text-secondary font-medium inline-flex items-center gap-1.5 text-xs">
                        <Users size={12} />
                        {form.kapasitas ? `${form.kapasitas} siswa` : "-"} ({jumlahSiswa} terisi)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">Wali Kelas</span>
                      <span className="theme-text-secondary font-medium text-xs truncate max-w-[180px] text-right">
                        {selectedWali
                          ? (selectedWali.namaLengkap || selectedWali.namaPengguna || selectedWali.email)
                          : "Belum ditentukan"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">Lokasi Ruangan</span>
                      <span className="theme-text-secondary font-medium text-xs truncate max-w-[180px] text-right">
                        {selectedGedung
                          ? `${selectedGedung.nama}${selectedLantai ? ` • ${selectedLantai.nama}` : ""}`
                          : "Belum dipilih"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="theme-info rounded-xl border p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Info size={16} className="shrink-0" />
                    <h2 className="text-sm font-semibold">Informasi Lokasi & Relasi</h2>
                  </div>
                  <ul className="space-y-2 text-xs theme-text-secondary list-disc list-inside">
                    <li>Lokasi ruangan disimpan melalui relasi <b>Kelas.lantaiId</b>.</li>
                    <li>Mengubah wali kelas tidak menghapus penugasan pada kelas lain.</li>
                    <li>Kapasitas terisi saat ini adalah {jumlahSiswa} siswa.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}