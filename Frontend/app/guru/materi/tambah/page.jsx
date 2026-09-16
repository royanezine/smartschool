"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Film,
  FolderOpen,
  Info,
  Link as LinkIcon,
  Loader2,
  Save,
  Upload,
  Video,
  X,
  AlertCircle,
  Users,
} from "lucide-react";

import {
  createMateriDenganFile,
  createMateriDenganLink,
  getKelasMapel,
} from "../../../../services/materiPembelajaran.service";

export default function UploadMateriPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [kelasMapelList, setKelasMapelList] =
    useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [form, setForm] = useState({
    kelasMapelId: "",
    judul: "",
    kategori: "",
    deskripsi: "",
    sumber: "file",
    urlLink: "",
  });

  const [file, setFile] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================================
  // FILE CONFIG
  // ============================================================

  const MAX_FILE_SIZE =
    100 * 1024 * 1024;

  const allowedMimeTypes = [
    "application/pdf",
    "video/mp4",
    "video/mpeg",
    "video/webm",
    "video/quicktime",
  ];

  const allowedExtensions =
    ".pdf,.mp4,.mpeg,.webm,.mov";

  // ============================================================
  // LOAD USER
  // ============================================================

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = () => {
    try {
      if (typeof window === "undefined") {
        return;
      }

      const rawUser =
        localStorage.getItem("user");

      if (!rawUser) {
        console.warn(
          "[UPLOAD MATERI] localStorage.user tidak ditemukan"
        );

        setCurrentUser(null);
        return;
      }

      const parsedUser =
        JSON.parse(rawUser);

      console.log(
        "[UPLOAD MATERI] CURRENT USER:",
        parsedUser
      );

      setCurrentUser(parsedUser);
    } catch (err) {
      console.error(
        "[UPLOAD MATERI] GAGAL MEMBACA USER:",
        err
      );

      setCurrentUser(null);
    }
  };

  // ============================================================
  // GET CURRENT USER ID
  // ============================================================

  const currentUserId = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return (
      currentUser?.userId ??
      currentUser?.id ??
      currentUser?.data?.userId ??
      currentUser?.data?.id ??
      currentUser?.user?.id ??
      null
    );
  }, [currentUser]);

  // ============================================================
  // GET CURRENT USER NAME
  // ============================================================

  const currentUserName = useMemo(() => {
    return (
      currentUser?.namaLengkap ??
      currentUser?.nama ??
      currentUser?.name ??
      currentUser?.user?.namaLengkap ??
      "Guru"
    );
  }, [currentUser]);

  // ============================================================
  // GET CURRENT USER EMAIL
  // ============================================================

  const currentUserEmail = useMemo(() => {
    return (
      currentUser?.email ??
      currentUser?.user?.email ??
      "guru@smartschool.com"
    );
  }, [currentUser]);

  // ============================================================
  // GET AVATAR
  // ============================================================

  const currentUserAvatar = useMemo(() => {
    const name =
      currentUserName || "Guru";

    return name
      .split(" ")
      .filter(Boolean)
      .map((item) => item[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [currentUserName]);

  // ============================================================
  // LOAD KELAS MAPEL
  // ============================================================

  useEffect(() => {
    if (currentUser) {
      loadKelasMapel();
    }
  }, [currentUser]);

  const loadKelasMapel = async () => {
    try {
      setLoadingData(true);
      setError("");
      setSuccess("");

      console.log(
        "=============================================="
      );

      console.log(
        "[UPLOAD MATERI] MEMUAT KELAS MAPEL"
      );

      console.log(
        "[UPLOAD MATERI] USER ID:",
        currentUserId
      );

      // ========================================================
      // CEK USER ID
      // ========================================================

      if (!currentUserId) {
        setKelasMapelList([]);

        setError(
          "ID guru tidak ditemukan pada data login. Silakan login kembali."
        );

        return;
      }

      // ========================================================
      // REQUEST
      // ========================================================

      const response =
        await getKelasMapel();

      console.log(
        "[UPLOAD MATERI] RESPONSE KELAS MAPEL:",
        response
      );

      // ========================================================
      // AMBIL ARRAY DARI response.data
      // ========================================================

      const data =
        Array.isArray(response?.data)
          ? response.data
          : [];

      console.log(
        "[UPLOAD MATERI] SEMUA KELAS MAPEL:",
        data
      );

      console.log(
        "[UPLOAD MATERI] JUMLAH SEMUA:",
        data.length
      );

      // ========================================================
      // FILTER GURU LOGIN
      // ========================================================

      const dataGuru =
        data.filter((item) => {
          const guruId =
            item?.guruPengajarId ??
            item?.guruPengajar?.id ??
            item?.guruId ??
            item?.guru?.id ??
            null;

          return (
            String(guruId) ===
            String(currentUserId)
          );
        });

      console.log(
        "[UPLOAD MATERI] KELAS MAPEL GURU:",
        dataGuru
      );

      console.log(
        "[UPLOAD MATERI] JUMLAH KELAS MAPEL GURU:",
        dataGuru.length
      );

      // ========================================================
      // SET STATE
      // ========================================================

      setKelasMapelList(
        dataGuru
      );

      // ========================================================
      // ERROR JIKA KOSONG
      // ========================================================

      if (dataGuru.length === 0) {
        setError(
          "Belum ada kelas dan mata pelajaran yang ditugaskan kepada akun guru ini."
        );
      }

      console.log(
        "=============================================="
      );
    } catch (err) {
      console.error(
        "[UPLOAD MATERI] GAGAL LOAD KELAS MAPEL:",
        err
      );

      setKelasMapelList([]);

      setError(
        err?.message ||
          "Data kelas dan mata pelajaran gagal dimuat. Silakan coba lagi."
      );
    } finally {
      setLoadingData(false);
    }
  };

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // HANDLE SOURCE
  // ============================================================

  const handleSourceChange = (
    source
  ) => {
    setForm((prev) => ({
      ...prev,
      sumber: source,
      urlLink:
        source === "link"
          ? prev.urlLink
          : "",
    }));

    setFile(null);

    const input =
      document.getElementById(
        "materi-file"
      );

    if (input) {
      input.value = "";
    }

    setError("");
    setSuccess("");
  };

  // ============================================================
  // HANDLE FILE
  // ============================================================

  const handleFileChange = (
    e
  ) => {
    const selectedFile =
      e.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // ========================================================
    // VALIDATE MIME
    // ========================================================

    if (
      !allowedMimeTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Format file tidak didukung. Gunakan PDF atau video MP4, MPEG, WEBM, atau MOV."
      );

      e.target.value = "";
      setFile(null);

      return;
    }

    // ========================================================
    // VALIDATE SIZE
    // ========================================================

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "Ukuran file maksimal 100 MB."
      );

      e.target.value = "";
      setFile(null);

      return;
    }

    // ========================================================
    // SET FILE
    // ========================================================

    setFile(
      selectedFile
    );
  };

  // ============================================================
  // REMOVE FILE
  // ============================================================

  const removeFile = () => {
    setFile(null);

    const input =
      document.getElementById(
        "materi-file"
      );

    if (input) {
      input.value = "";
    }

    setError("");
    setSuccess("");
  };

  // ============================================================
  // FORMAT FILE SIZE
  // ============================================================

  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) {
      return "0 B";
    }

    const units = [
      "B",
      "KB",
      "MB",
      "GB",
    ];

    const index =
      Math.floor(
        Math.log(bytes) /
          Math.log(1024)
      );

    return `${(
      bytes /
      Math.pow(1024, index)
    ).toFixed(2)} ${
      units[index]
    }`;
  };

  // ============================================================
  // GET KELAS NAME
  // ============================================================

  const getKelasName = (
    item
  ) => {
    return (
      item?.kelas?.namaKelas ??
      item?.kelas?.nama ??
      item?.namaKelas ??
      item?.kelasNama ??
      "-"
    );
  };

  // ============================================================
  // GET MAPEL NAME
  // ============================================================

  const getMapelName = (
    item
  ) => {
    return (
      item?.mataPelajaran
        ?.namaMapel ??
      item?.mataPelajaran
        ?.nama ??
      item?.mataPelajaran
        ?.namaMataPelajaran ??
      item?.mataPelajaran
        ?.nama_mata_pelajaran ??
      item?.mapel?.nama ??
      item?.namaMataPelajaran ??
      "-"
    );
  };

  // ============================================================
  // GET GURU NAME
  // ============================================================

  const getGuruName = (
    item
  ) => {
    return (
      item?.guruPengajar
        ?.namaLengkap ??
      item?.guru
        ?.namaLengkap ??
      item?.guruNama ??
      currentUserName
    );
  };

  // ============================================================
  // SELECTED CLASS MAPEL
  // ============================================================

  const selectedClassMapel =
    kelasMapelList.find(
      (item) =>
        String(item.id) ===
        String(
          form.kelasMapelId
        )
    );

  // ============================================================
  // VALIDATE
  // ============================================================

  const validateForm = () => {
    if (
      !form.kelasMapelId
    ) {
      return "Silakan pilih kelas dan mata pelajaran.";
    }

    if (!form.judul.trim()) {
      return "Judul materi wajib diisi.";
    }

    if (
      form.judul
        .trim()
        .length > 100
    ) {
      return "Judul materi maksimal 100 karakter.";
    }

    if (
      form.sumber ===
        "file" &&
      !file
    ) {
      return "Silakan pilih file materi yang akan diupload.";
    }

    if (
      form.sumber ===
      "link"
    ) {
      if (
        !form.urlLink.trim()
      ) {
        return "URL materi wajib diisi.";
      }

      try {
        new URL(
          form.urlLink.trim()
        );
      } catch {
        return "URL materi tidak valid.";
      }
    }

    return "";
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    try {
      setSaving(true);

      console.log(
        "=============================================="
      );

      console.log(
        "[UPLOAD MATERI] SUBMIT"
      );

      console.log(
        "[UPLOAD MATERI] GURU:",
        currentUserId
      );

      console.log(
        "[UPLOAD MATERI] KELAS MAPEL:",
        form.kelasMapelId
      );

      console.log(
        "[UPLOAD MATERI] JUDUL:",
        form.judul
      );

      console.log(
        "[UPLOAD MATERI] SUMBER:",
        form.sumber
      );

      // ========================================================
      // FILE
      // ========================================================

      if (
        form.sumber ===
        "file"
      ) {
        await createMateriDenganFile(
          {
            kelasMapelId:
              form.kelasMapelId,

            judul:
              form.judul.trim(),

            kategori:
              form.kategori.trim() ||
              null,

            deskripsi:
              form.deskripsi.trim() ||
              null,

            file,
          }
        );
      }

      // ========================================================
      // LINK
      // ========================================================

      else {
        await createMateriDenganLink(
          {
            kelasMapelId:
              form.kelasMapelId,

            judul:
              form.judul.trim(),

            kategori:
              form.kategori.trim() ||
              null,

            deskripsi:
              form.deskripsi.trim() ||
              null,

            urlLink:
              form.urlLink.trim(),
          }
        );
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      console.log(
        "[UPLOAD MATERI] BERHASIL"
      );

      setSuccess(
        "Materi pembelajaran berhasil ditambahkan."
      );

      // ========================================================
      // REDIRECT
      // ========================================================

      setTimeout(() => {
        router.push(
          "/guru/materi"
        );
      }, 900);
    } catch (err) {
      console.error(
        "[UPLOAD MATERI] ERROR SUBMIT:",
        err
      );

      setError(
        err?.message ||
          "Materi gagal disimpan. Silakan periksa kembali data yang dimasukkan."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active="materi"
        setActive={() => {}}
        collapsed={
          isSidebarCollapsed
        }
        setCollapsed={
          setIsSidebarCollapsed
        }
        role="guru"
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <Header
          toggleSidebar={() =>
            setIsSidebarCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name:
              currentUserName,
            email:
              currentUserEmail,
            avatar:
              currentUserAvatar,
          }}
        />

        {/* ====================================================
            MAIN
        ==================================================== */}

        <main className="flex-1 overflow-x-hidden overflow-y-auto">

          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">

            {/* ==================================================
                HEADER PAGE
            ================================================== */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex min-w-0 items-start gap-3">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/guru/materi"
                    )
                  }
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  aria-label="Kembali"
                >
                  <ArrowLeft
                    size={18}
                  />
                </button>

                <div className="min-w-0">

                  <div className="mb-1 flex items-center gap-2">

                    <span className="text-sm font-semibold text-blue-600">
                      Materi Pembelajaran
                    </span>

                  </div>

                  <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Tambah Materi
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                    Tambahkan materi pembelajaran
                    untuk kelas dan mata pelajaran
                    yang kamu ajar.
                  </p>

                </div>

              </div>

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold text-red-800">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {error}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="shrink-0 text-red-500 transition hover:text-red-700"
                >
                  <X size={18} />
                </button>

              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold text-emerald-800">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-700">
                    {success}
                  </p>

                </div>

              </div>
            )}

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

                {/* ==================================================
                    LEFT
                ================================================== */}

                <div className="min-w-0 space-y-6">

                  {/* ==================================================
                      INFORMASI DASAR
                  ================================================== */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <BookOpen
                            size={20}
                          />
                        </div>

                        <div>

                          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                            Informasi Materi
                          </h2>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Tentukan kelas, mata
                            pelajaran, dan informasi
                            utama dari materi.
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="space-y-5 p-5 sm:p-6">

                      {/* ==================================================
                          KELAS MAPEL
                      ================================================== */}

                      <div>

                        <label
                          htmlFor="kelasMapelId"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Kelas & Mata Pelajaran
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <select
                          id="kelasMapelId"
                          name="kelasMapelId"
                          value={
                            form.kelasMapelId
                          }
                          onChange={
                            handleChange
                          }
                          disabled={
                            loadingData ||
                            saving ||
                            !currentUserId
                          }
                          className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >

                          <option value="">
                            {loadingData
                              ? "Memuat kelas yang kamu ajar..."
                              : !currentUserId
                              ? "ID guru tidak ditemukan"
                              : kelasMapelList.length ===
                                0
                              ? "Belum ada kelas yang diampu"
                              : "Pilih kelas & mata pelajaran"}
                          </option>

                          {!loadingData &&
                            kelasMapelList.map(
                              (item) => (
                                <option
                                  key={
                                    item.id
                                  }
                                  value={
                                    item.id
                                  }
                                >
                                  {getKelasName(
                                    item
                                  )}{" "}
                                  —{" "}
                                  {getMapelName(
                                    item
                                  )}
                                </option>
                              )
                            )}

                        </select>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Hanya kelas dan mata
                          pelajaran yang diampu oleh
                          akun guru ini yang ditampilkan.
                        </p>

                      </div>

                      {/* ==================================================
                          DETAIL SELECTED
                      ================================================== */}

                      {selectedClassMapel && (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                          <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                              <Users
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                Kelas terpilih
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-900">
                                {getKelasName(
                                  selectedClassMapel
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                {getMapelName(
                                  selectedClassMapel
                                )}
                                {" • "}
                                {getGuruName(
                                  selectedClassMapel
                                )}
                              </p>

                            </div>

                          </div>

                        </div>
                      )}

                      {/* ==================================================
                          JUDUL
                      ================================================== */}

                      <div>

                        <div className="mb-2 flex items-center justify-between gap-4">

                          <label
                            htmlFor="judul"
                            className="block text-sm font-semibold text-slate-800"
                          >
                            Judul Materi
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <span className="text-xs text-slate-400">
                            {
                              form
                                .judul
                                .length
                            }
                            /100
                          </span>

                        </div>

                        <input
                          id="judul"
                          name="judul"
                          type="text"
                          maxLength={
                            100
                          }
                          value={
                            form.judul
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Contoh: Pengenalan React Hooks"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Gunakan judul yang singkat,
                          jelas, dan mudah ditemukan
                          siswa.
                        </p>

                      </div>

                      {/* ==================================================
                          KATEGORI
                      ================================================== */}

                      <div>

                        <label
                          htmlFor="kategori"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Bab / Kategori
                        </label>

                        <input
                          id="kategori"
                          name="kategori"
                          type="text"
                          value={
                            form.kategori
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Contoh: Bab 1 — Pengenalan"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Membantu mengelompokkan materi
                          berdasarkan bab atau topik
                          pembelajaran.
                        </p>

                      </div>

                      {/* ==================================================
                          DESKRIPSI
                      ================================================== */}

                      <div>

                        <label
                          htmlFor="deskripsi"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Deskripsi Materi
                        </label>

                        <textarea
                          id="deskripsi"
                          name="deskripsi"
                          rows={6}
                          value={
                            form.deskripsi
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Tuliskan ringkasan singkat mengenai materi yang akan dipelajari siswa..."
                          className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Jelaskan isi atau tujuan materi
                          agar siswa memahami apa yang
                          akan dipelajari.
                        </p>

                      </div>

                    </div>

                  </section>

                  {/* ==================================================
                      SUMBER MATERI
                  ================================================== */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FolderOpen
                            size={20}
                          />
                        </div>

                        <div>

                          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                            Sumber Materi
                          </h2>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Pilih apakah materi berasal
                            dari file atau tautan
                            eksternal.
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="p-5 sm:p-6">

                      {/* ==================================================
                          SOURCE SWITCH
                      ================================================== */}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {/* FILE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleSourceChange(
                              "file"
                            )
                          }
                          disabled={
                            saving
                          }
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                            form.sumber ===
                            "file"
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              form.sumber ===
                              "file"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Upload
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-bold text-slate-900">
                              Upload File
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              PDF atau video maksimal
                              100 MB.
                            </p>

                          </div>

                        </button>

                        {/* LINK */}

                        <button
                          type="button"
                          onClick={() =>
                            handleSourceChange(
                              "link"
                            )
                          }
                          disabled={
                            saving
                          }
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                            form.sumber ===
                            "link"
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              form.sumber ===
                              "link"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <LinkIcon
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-bold text-slate-900">
                              Gunakan Link
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Masukkan URL materi dari
                              platform lain.
                            </p>

                          </div>

                        </button>

                      </div>

                      {/* ==================================================
                          FILE UPLOAD
                      ================================================== */}

                      {form.sumber ===
                        "file" && (
                        <div className="mt-5">

                          <label
                            htmlFor="materi-file"
                            className="mb-2 block text-sm font-semibold text-slate-800"
                          >
                            File Materi
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          {!file ? (
                            <label
                              htmlFor="materi-file"
                              className="group flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                            >

                              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                                <Upload
                                  size={24}
                                />
                              </div>

                              <p className="text-sm font-bold text-slate-800">
                                Pilih file materi
                              </p>

                              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                                PDF atau video MP4,
                                MPEG, WEBM, dan MOV.
                                Ukuran maksimal 100 MB.
                              </p>

                              <span className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200 transition group-hover:bg-blue-600 group-hover:text-white">
                                Pilih File
                              </span>

                              <input
                                id="materi-file"
                                type="file"
                                accept={
                                  allowedExtensions
                                }
                                onChange={
                                  handleFileChange
                                }
                                disabled={
                                  saving
                                }
                                className="hidden"
                              />

                            </label>
                          ) : (
                            <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                              <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                                  {file.type ===
                                  "application/pdf" ? (
                                    <FileText
                                      size={
                                        21
                                      }
                                    />
                                  ) : (
                                    <Video
                                      size={
                                        21
                                      }
                                    />
                                  )}

                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {
                                      file.name
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatFileSize(
                                      file.size
                                    )}
                                  </p>

                                </div>

                              </div>

                              <button
                                type="button"
                                onClick={
                                  removeFile
                                }
                                disabled={
                                  saving
                                }
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <X
                                  size={15}
                                />
                                Hapus File
                              </button>

                            </div>
                          )}

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            File akan tersimpan pada
                            server sebagai sumber materi
                            pembelajaran.
                          </p>

                        </div>
                      )}

                      {/* ==================================================
                          LINK
                      ================================================== */}

                      {form.sumber ===
                        "link" && (
                        <div className="mt-5">

                          <label
                            htmlFor="urlLink"
                            className="mb-2 block text-sm font-semibold text-slate-800"
                          >
                            URL Materi
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <div className="relative">

                            <LinkIcon
                              size={18}
                              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              id="urlLink"
                              name="urlLink"
                              type="url"
                              value={
                                form.urlLink
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="https://..."
                              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />

                          </div>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Contoh: link video pembelajaran,
                            Google Drive, atau sumber
                            belajar online lainnya.
                          </p>

                        </div>
                      )}

                    </div>

                  </section>

                </div>

                {/* ==================================================
                    RIGHT
                ================================================== */}

                <aside className="min-w-0 space-y-6">

                  {/* ==================================================
                      RINGKASAN
                  ================================================== */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Info
                          size={20}
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-base font-bold text-slate-900">
                          Ringkasan Materi
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Periksa kembali informasi
                          sebelum disimpan.
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 space-y-4">

                      <div className="border-b border-slate-100 pb-4">

                        <p className="text-xs font-medium text-slate-400">
                          Judul
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900">
                          {form.judul ||
                            "Belum diisi"}
                        </p>

                      </div>

                      <div className="border-b border-slate-100 pb-4">

                        <p className="text-xs font-medium text-slate-400">
                          Kelas
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedClassMapel
                            ? getKelasName(
                                selectedClassMapel
                              )
                            : "Belum dipilih"}
                        </p>

                      </div>

                      <div className="border-b border-slate-100 pb-4">

                        <p className="text-xs font-medium text-slate-400">
                          Mata Pelajaran
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedClassMapel
                            ? getMapelName(
                                selectedClassMapel
                              )
                            : "Belum dipilih"}
                        </p>

                      </div>

                      <div className="border-b border-slate-100 pb-4">

                        <p className="text-xs font-medium text-slate-400">
                          Guru
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedClassMapel
                            ? getGuruName(
                                selectedClassMapel
                              )
                            : currentUserName}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-400">
                          Sumber
                        </p>

                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">

                          {form.sumber ===
                          "file" ? (
                            <>
                              <Upload
                                size={14}
                              />
                              File Upload
                            </>
                          ) : (
                            <>
                              <LinkIcon
                                size={14}
                              />
                              Link
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                  </section>

                  {/* ==================================================
                      KETENTUAN FILE
                  ================================================== */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText
                          size={19}
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-base font-bold text-slate-900">
                          Ketentuan File
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Format yang dapat digunakan
                          untuk materi.
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 space-y-3">

                      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                        <FileText
                          size={17}
                          className="shrink-0 text-red-500"
                        />

                        <div>

                          <p className="text-xs font-semibold text-slate-800">
                            PDF
                          </p>

                          <p className="text-[11px] text-slate-500">
                            Materi dokumen
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                        <Film
                          size={17}
                          className="shrink-0 text-blue-500"
                        />

                        <div>

                          <p className="text-xs font-semibold text-slate-800">
                            Video
                          </p>

                          <p className="text-[11px] text-slate-500">
                            MP4, MPEG, WEBM, MOV
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                        <CheckCircle2
                          size={17}
                          className="shrink-0 text-emerald-500"
                        />

                        <div>

                          <p className="text-xs font-semibold text-slate-800">
                            Maksimal 100 MB
                          </p>

                          <p className="text-[11px] text-slate-500">
                            Ukuran file per materi
                          </p>

                        </div>

                      </div>

                    </div>

                  </section>

                  {/* ==================================================
                      TIPS
                  ================================================== */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Clock
                          size={19}
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-base font-bold text-slate-900">
                          Tips
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Agar materi lebih mudah
                          dipahami siswa.
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 space-y-3">

                      <div className="flex items-start gap-2">

                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />

                        <p className="text-xs leading-5 text-slate-600">
                          Gunakan judul materi yang jelas
                          dan spesifik.
                        </p>

                      </div>

                      <div className="flex items-start gap-2">

                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />

                        <p className="text-xs leading-5 text-slate-600">
                          Tambahkan deskripsi untuk
                          memberikan konteks kepada
                          siswa.
                        </p>

                      </div>

                      <div className="flex items-start gap-2">

                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />

                        <p className="text-xs leading-5 text-slate-600">
                          Pastikan materi sesuai dengan
                          kelas dan mata pelajaran yang
                          dipilih.
                        </p>

                      </div>

                    </div>

                  </section>

                </aside>

              </div>

              {/* ==================================================
                  FOOTER ACTION
              ================================================== */}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/guru/materi"
                      )
                    }
                    disabled={
                      saving
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X
                      size={17}
                    />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      loadingData ||
                      !currentUserId ||
                      kelasMapelList.length ===
                        0
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save
                          size={17}
                        />
                        Simpan Materi
                      </>
                    )}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </main>

      </div>

    </div>
  );
}