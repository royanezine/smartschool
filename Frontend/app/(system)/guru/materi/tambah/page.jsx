"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

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
} from "../../../../../services/materiPembelajaran.service";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// MAIN
// ============================================================

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
  // CURRENT USER ID
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
  // CURRENT USER NAME
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
  // CURRENT USER EMAIL
  // ============================================================

  const currentUserEmail = useMemo(() => {
    return (
      currentUser?.email ??
      currentUser?.user?.email ??
      "guru@smartschool.com"
    );
  }, [currentUser]);

  // ============================================================
  // AVATAR
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

      if (!currentUserId) {
        setKelasMapelList([]);

        setError(
          "ID guru tidak ditemukan pada data login. Silakan login kembali."
        );

        return;
      }

      const response =
        await getKelasMapel();

      console.log(
        "[UPLOAD MATERI] RESPONSE KELAS MAPEL:",
        response
      );

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

      setKelasMapelList(
        dataGuru
      );

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
      } else {
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

      console.log(
        "[UPLOAD MATERI] BERHASIL"
      );

      setSuccess(
        "Materi pembelajaran berhasil ditambahkan."
      );

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
    <div className="theme-page flex h-screen w-full overflow-hidden">

      {/* ======================================================
          SIDEBAR GURU
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
            HEADER GURU
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
                PAGE HEADER
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
                  className={`theme-card theme-text-secondary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${themeNeutralBorder} ${themeSmallShadow} ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                  aria-label="Kembali"
                >
                  <ArrowLeft
                    size={18}
                  />
                </button>

                <div className="min-w-0">

                  <div className="mb-1 flex items-center gap-2">

                    <span
                      className={`text-sm font-semibold ${themePrimaryText}`}
                    >
                      Materi Pembelajaran
                    </span>

                  </div>

                  <h1 className="theme-text truncate text-2xl font-bold tracking-tight sm:text-3xl">
                    Tambah Materi
                  </h1>

                  <p className="theme-text-secondary mt-1 max-w-2xl text-sm leading-6 sm:text-[15px]">
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
              <div
                className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${themeDangerSurface} ${themeDangerBorder}`}
              >
                <AlertCircle
                  size={20}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <div className="min-w-0 flex-1">

                  <p className="theme-danger text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="theme-danger mt-1 text-sm leading-6">
                    {error}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="theme-danger shrink-0 transition-opacity hover:opacity-70"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${themeSuccessSurface} ${themeSuccessBorder}`}
              >
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold text-[var(--color-success)]">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--color-success)]">
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

                  <section
                    className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div
                      className={`border-b px-5 py-5 sm:px-6 ${themeDivider}`}
                    >
                      <div className="flex items-start gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <BookOpen
                            size={20}
                          />
                        </div>

                        <div>
                          <h2 className="theme-text text-base font-bold sm:text-lg">
                            Informasi Materi
                          </h2>

                          <p className="theme-text-secondary mt-1 text-sm leading-6">
                            Tentukan kelas, mata
                            pelajaran, dan informasi
                            utama dari materi.
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">

                      {/* KELAS MAPEL */}

                      <div>
                        <label
                          htmlFor="kelasMapelId"
                          className="theme-text mb-2 block text-sm font-semibold"
                        >
                          Kelas & Mata Pelajaran
                          <span className="theme-danger ml-1">
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
                          className={`theme-input w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${themeNeutralBorder} ${themeFocus}`}
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

                        <p className="theme-text-muted mt-2 text-xs leading-5">
                          Hanya kelas dan mata
                          pelajaran yang diampu oleh
                          akun guru ini yang ditampilkan.
                        </p>
                      </div>

                      {/* SELECTED */}

                      {selectedClassMapel && (
                        <div
                          className={`rounded-2xl border p-4 ${themePrimarySoft} ${themePrimarySoftBorder}`}
                        >
                          <div className="flex items-start gap-3">

                            <div
                              className={`theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimaryText} ${themeSmallShadow}`}
                            >
                              <Users
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">

                              <p
                                className={`text-xs font-semibold uppercase tracking-wide ${themePrimaryText}`}
                              >
                                Kelas terpilih
                              </p>

                              <p className="theme-text mt-1 text-sm font-bold">
                                {getKelasName(
                                  selectedClassMapel
                                )}
                              </p>

                              <p className="theme-text-secondary mt-1 text-xs">
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

                      {/* JUDUL */}

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-4">

                          <label
                            htmlFor="judul"
                            className="theme-text block text-sm font-semibold"
                          >
                            Judul Materi
                            <span className="theme-danger ml-1">
                              *
                            </span>
                          </label>

                          <span className="theme-text-muted text-xs">
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
                          className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeNeutralBorder} ${themeFocus}`}
                        />

                        <p className="theme-text-muted mt-2 text-xs leading-5">
                          Gunakan judul yang singkat,
                          jelas, dan mudah ditemukan
                          siswa.
                        </p>
                      </div>

                      {/* KATEGORI */}

                      <div>
                        <label
                          htmlFor="kategori"
                          className="theme-text mb-2 block text-sm font-semibold"
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
                          className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeNeutralBorder} ${themeFocus}`}
                        />

                        <p className="theme-text-muted mt-2 text-xs leading-5">
                          Membantu mengelompokkan materi
                          berdasarkan bab atau topik
                          pembelajaran.
                        </p>
                      </div>

                      {/* DESKRIPSI */}

                      <div>
                        <label
                          htmlFor="deskripsi"
                          className="theme-text mb-2 block text-sm font-semibold"
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
                          className={`theme-input w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeNeutralBorder} ${themeFocus}`}
                        />

                        <p className="theme-text-muted mt-2 text-xs leading-5">
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

                  <section
                    className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div
                      className={`border-b px-5 py-5 sm:px-6 ${themeDivider}`}
                    >
                      <div className="flex items-start gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <FolderOpen
                            size={20}
                          />
                        </div>

                        <div>
                          <h2 className="theme-text text-base font-bold sm:text-lg">
                            Sumber Materi
                          </h2>

                          <p className="theme-text-secondary mt-1 text-sm leading-6">
                            Pilih apakah materi berasal
                            dari file atau tautan
                            eksternal.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">

                      {/* SOURCE SWITCH */}

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
                              ? `${themePrimarySoftBorder} ${themePrimarySoft} ring-2 ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`
                              : `theme-card ${themeNeutralBorder} ${themeNeutralHover}`
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              form.sumber ===
                              "file"
                                ? `${themePrimaryGradient} text-[var(--color-card)]`
                                : `${themeNeutralSurface} theme-text-secondary`
                            }`}
                          >
                            <Upload
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="theme-text text-sm font-bold">
                              Upload File
                            </p>

                            <p className="theme-text-muted mt-1 text-xs leading-5">
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
                              ? `${themePrimarySoftBorder} ${themePrimarySoft} ring-2 ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`
                              : `theme-card ${themeNeutralBorder} ${themeNeutralHover}`
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              form.sumber ===
                              "link"
                                ? `${themePrimaryGradient} text-[var(--color-card)]`
                                : `${themeNeutralSurface} theme-text-secondary`
                            }`}
                          >
                            <LinkIcon
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="theme-text text-sm font-bold">
                              Gunakan Link
                            </p>

                            <p className="theme-text-muted mt-1 text-xs leading-5">
                              Masukkan URL materi dari
                              platform lain.
                            </p>

                          </div>
                        </button>
                      </div>

                      {/* FILE UPLOAD */}

                      {form.sumber ===
                        "file" && (
                        <div className="mt-5">

                          <label
                            htmlFor="materi-file"
                            className="theme-text mb-2 block text-sm font-semibold"
                          >
                            File Materi
                            <span className="theme-danger ml-1">
                              *
                            </span>
                          </label>

                          {!file ? (
                            <label
                              htmlFor="materi-file"
                              className={`group flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${themeNeutralBorder} ${themeNeutralSurface} hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]`}
                            >
                              <div
                                className={`theme-card mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimaryText} ${themeSmallShadow}`}
                              >
                                <Upload
                                  size={24}
                                />
                              </div>

                              <p className="theme-text text-sm font-bold">
                                Pilih file materi
                              </p>

                              <p className="theme-text-muted mt-1 max-w-md text-xs leading-5">
                                PDF atau video MP4,
                                MPEG, WEBM, dan MOV.
                                Ukuran maksimal 100 MB.
                              </p>

                              <span
                                className={`mt-4 inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold transition ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} group-hover:opacity-90`}
                              >
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
                            <div
                              className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${themePrimarySoft} ${themePrimarySoftBorder}`}
                            >
                              <div className="flex min-w-0 items-center gap-3">

                                <div
                                  className={`theme-card flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${themePrimaryText} ${themeSmallShadow}`}
                                >
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

                                  <p className="theme-text truncate text-sm font-semibold">
                                    {
                                      file.name
                                    }
                                  </p>

                                  <p className="theme-text-muted mt-1 text-xs">
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
                                className={`theme-danger inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${themeDangerBorder} ${themeNeutralSurface} ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                <X
                                  size={15}
                                />
                                Hapus File
                              </button>
                            </div>
                          )}

                          <p className="theme-text-muted mt-2 text-xs leading-5">
                            File akan tersimpan pada
                            server sebagai sumber materi
                            pembelajaran.
                          </p>
                        </div>
                      )}

                      {/* LINK */}

                      {form.sumber ===
                        "link" && (
                        <div className="mt-5">

                          <label
                            htmlFor="urlLink"
                            className="theme-text mb-2 block text-sm font-semibold"
                          >
                            URL Materi
                            <span className="theme-danger ml-1">
                              *
                            </span>
                          </label>

                          <div className="relative">

                            <LinkIcon
                              size={18}
                              className="theme-text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
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
                              className={`theme-input w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeNeutralBorder} ${themeFocus}`}
                            />
                          </div>

                          <p className="theme-text-muted mt-2 text-xs leading-5">
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
                    RIGHT SIDEBAR
                ================================================== */}

                <aside className="min-w-0 space-y-6">

                  {/* ==================================================
                      RINGKASAN
                  ================================================== */}

                  <section
                    className={`theme-card rounded-2xl border p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} theme-text-secondary`}
                      >
                        <Info
                          size={20}
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="theme-text text-base font-bold">
                          Ringkasan Materi
                        </h2>

                        <p className="theme-text-muted mt-1 text-xs leading-5">
                          Periksa kembali informasi
                          sebelum disimpan.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">

                      <div
                        className={`border-b pb-4 ${themeDivider}`}
                      >
                        <p className="theme-text-muted text-xs font-medium">
                          Judul
                        </p>

                        <p className="theme-text mt-1 break-words text-sm font-semibold leading-6">
                          {form.judul ||
                            "Belum diisi"}
                        </p>
                      </div>

                      <div
                        className={`border-b pb-4 ${themeDivider}`}
                      >
                        <p className="theme-text-muted text-xs font-medium">
                          Kelas
                        </p>

                        <p className="theme-text mt-1 text-sm font-semibold">
                          {selectedClassMapel
                            ? getKelasName(
                                selectedClassMapel
                              )
                            : "Belum dipilih"}
                        </p>
                      </div>

                      <div
                        className={`border-b pb-4 ${themeDivider}`}
                      >
                        <p className="theme-text-muted text-xs font-medium">
                          Mata Pelajaran
                        </p>

                        <p className="theme-text mt-1 text-sm font-semibold">
                          {selectedClassMapel
                            ? getMapelName(
                                selectedClassMapel
                              )
                            : "Belum dipilih"}
                        </p>
                      </div>

                      <div
                        className={`border-b pb-4 ${themeDivider}`}
                      >
                        <p className="theme-text-muted text-xs font-medium">
                          Guru
                        </p>

                        <p className="theme-text mt-1 text-sm font-semibold">
                          {selectedClassMapel
                            ? getGuruName(
                                selectedClassMapel
                              )
                            : currentUserName}
                        </p>
                      </div>

                      <div>

                        <p className="theme-text-muted text-xs font-medium">
                          Sumber
                        </p>

                        <div
                          className={`theme-text-secondary mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${themeNeutralSurface}`}
                        >
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

                  <section
                    className={`theme-card rounded-2xl border p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <FileText
                          size={19}
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="theme-text text-base font-bold">
                          Ketentuan File
                        </h2>

                        <p className="theme-text-muted mt-1 text-xs leading-5">
                          Format yang dapat digunakan
                          untuk materi.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">

                      {/* PDF */}

                      <div
                        className={`flex items-center gap-3 rounded-xl p-3 ${themeNeutralSurface}`}
                      >
                        <FileText
                          size={17}
                          className={`shrink-0 ${themePrimaryText}`}
                        />

                        <div>
                          <p className="theme-text text-xs font-semibold">
                            PDF
                          </p>

                          <p className="theme-text-muted text-[11px]">
                            Materi dokumen
                          </p>
                        </div>
                      </div>

                      {/* VIDEO */}

                      <div
                        className={`flex items-center gap-3 rounded-xl p-3 ${themeNeutralSurface}`}
                      >
                        <Film
                          size={17}
                          className="shrink-0 text-[var(--color-info)]"
                        />

                        <div>
                          <p className="theme-text text-xs font-semibold">
                            Video
                          </p>

                          <p className="theme-text-muted text-[11px]">
                            MP4, MPEG, WEBM, MOV
                          </p>
                        </div>
                      </div>

                      {/* SIZE */}

                      <div
                        className={`flex items-center gap-3 rounded-xl p-3 ${themeNeutralSurface}`}
                      >
                        <CheckCircle2
                          size={17}
                          className="shrink-0 text-[var(--color-success)]"
                        />

                        <div>
                          <p className="theme-text text-xs font-semibold">
                            Maksimal 100 MB
                          </p>

                          <p className="theme-text-muted text-[11px]">
                            Ukuran file per materi
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ==================================================
                      TIPS
                  ================================================== */}

                  <section
                    className={`theme-card rounded-2xl border p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeWarningSurface} text-[var(--color-warning)]`}
                      >
                        <Clock
                          size={19}
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="theme-text text-base font-bold">
                          Tips
                        </h2>

                        <p className="theme-text-muted mt-1 text-xs leading-5">
                          Agar materi lebih mudah
                          dipahami siswa.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">

                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${themePrimaryGradient}`}
                        />

                        <p className="theme-text-secondary text-xs leading-5">
                          Gunakan judul materi yang jelas
                          dan spesifik.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${themePrimaryGradient}`}
                        />

                        <p className="theme-text-secondary text-xs leading-5">
                          Tambahkan deskripsi untuk
                          memberikan konteks kepada
                          siswa.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${themePrimaryGradient}`}
                        />

                        <p className="theme-text-secondary text-xs leading-5">
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

              <div
                className={`mt-6 theme-card rounded-2xl border p-4 sm:p-5 ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                  {/* BATAL */}

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
                    className={`theme-card theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${themeNeutralBorder} ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <X
                      size={17}
                    />
                    Batal
                  </button>

                  {/* SIMPAN */}

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      loadingData ||
                      !currentUserId ||
                      kelasMapelList.length ===
                        0
                    }
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
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