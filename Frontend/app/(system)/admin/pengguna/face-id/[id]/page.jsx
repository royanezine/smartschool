"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";

import {
  ArrowLeft,
  ScanFace,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Fingerprint,
  ShieldCheck,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BriefcaseBusiness,
  Clock3,
} from "lucide-react";

import { apiFetch } from "../../../../../../lib/api";

/* =========================================================
   ROLE CONFIG
========================================================= */

const roleConfig = {
  Guru: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
  },

  Siswa: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-100",
  },

  Staff: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },

  Admin: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-100",
  },
};

/* =========================================================
   ROLE NORMALIZER
========================================================= */

function normalizeRole(role) {
  const value =
    String(role || "").toLowerCase();

  if (value.includes("guru")) {
    return "Guru";
  }

  if (value.includes("siswa")) {
    return "Siswa";
  }

  if (
    value.includes("staff") ||
    value.includes("staf")
  ) {
    return "Staff";
  }

  if (value.includes("admin")) {
    return "Admin";
  }

  return role || "Staff";
}

/* =========================================================
   INITIAL
========================================================= */

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

/* =========================================================
   FILE URL
========================================================= */

function getFileUrl(filePath) {
  if (!filePath) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      filePath,
    )
  ) {
    return filePath;
  }

  const apiBase =
    process.env
      .NEXT_PUBLIC_API_URL ||
    "";

  const base =
    apiBase
      .replace(
        /\/api\/v1\/?$/,
        "",
      )
      .replace(
        /\/$/,
        "",
      );

  return `${base}${
    filePath.startsWith("/")
      ? filePath
      : `/${filePath}`
  }`;
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

/* =========================================================
   FORMAT DATETIME
========================================================= */

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const config =
    roleConfig[role] ||
    roleConfig.Staff;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      {role}
    </span>
  );
}

/* =========================================================
   FACE STATUS
========================================================= */

function FaceStatus({ registered }) {
  if (registered) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 size={13} />
        Terdaftar
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <XCircle size={13} />
      Belum Terdaftar
    </span>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Icon
            size={16}
            className="text-slate-400"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-700">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function FaceIdDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id
    ? String(params.id)
    : "";

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [isDeleting, setIsDeleting] =
    useState(false);

  /* =======================================================
     LOAD DETAIL
  ======================================================= */

  const loadDetail = async () => {
    if (!id) {
      setError(
        "ID pengguna tidak ditemukan.",
      );

      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);
      setError("");

      /*
       * Mengambil detail user langsung
       * dari backend.
       */
      const response =
        await apiFetch(
          `/api/users/${id}`,
          {
            method: "GET",
          },
        );

      const data =
        response?.data;

      if (!data) {
        throw new Error(
          "Data pengguna tidak ditemukan.",
        );
      }

      /*
       * Backend GET /users/:id yang
       * sebelumnya kamu kirim belum
       * mengambil biometrikWajah.
       *
       * Kalau endpoint sudah mengembalikannya,
       * langsung dipakai di sini.
       */
      const biometric =
        data.biometrikWajah ||
        null;

      const role =
        normalizeRole(
          data.peran
            ?.namaTampilan ||
            data.peran?.nama,
        );

      const registered =
        String(
          biometric?.status || "",
        ).toLowerCase() ===
        "aktif";

      setUser({
        id: data.id,

        nama:
          data.namaLengkap ||
          data.namaPengguna ||
          "Tanpa Nama",

        username:
          data.namaPengguna ||
          "-",

        email:
          data.email ||
          "-",

        noTelepon:
          data.noTelepon ||
          "-",

        role,

        jabatan:
          data.jabatan ||
          data.nisn ||
          "-",

        status:
          String(
            data.status || "",
          ).toLowerCase() ===
          "aktif"
            ? "Aktif"
            : "Nonaktif",

        faceStatus:
          registered
            ? "Terdaftar"
            : "Belum Terdaftar",

        faceId:
          biometric?.id ||
          null,

        facePhoto:
          biometric?.urlFotoReferensi ||
          null,

        registeredAt:
          biometric?.dibuatPada ||
          null,

        updatedAt:
          biometric?.diperbaruiPada ||
          null,

        dibuatPada:
          data.dibuatPada ||
          null,

        avatar:
          getInitials(
            data.namaLengkap ||
              data.namaPengguna,
          ),
      });
    } catch (err) {
      console.error(
        "Gagal mengambil detail Face ID:",
        err,
      );

      setError(
        err?.message ||
          "Gagal mengambil detail pengguna.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async () => {
    if (!id || !user?.faceId) {
      return;
    }

    const confirmed =
      window.confirm(
        `Hapus Face ID milik ${user.nama}? Akun pengguna tidak akan ikut terhapus.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      await apiFetch(
        `/api/users/${id}/face-id`,
        {
          method: "DELETE",
        },
      );

      router.push(
        "/admin/pengguna/face-id",
      );
    } catch (err) {
      console.error(
        "Gagal menghapus Face ID:",
        err,
      );

      alert(
        err?.message ||
          "Gagal menghapus Face ID.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const toggleSidebar = () => {
    setIsCollapsed(
      (prev) => !prev,
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar
          active="faceId"
          setActive={() => {}}
          collapsed={
            isCollapsed
          }
          setCollapsed={
            setIsCollapsed
          }
          role="admin"
        />

        <div className="flex min-w-0 flex-1 flex-col">
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

          <main className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2
                size={30}
                className="animate-spin text-[#155DFC]"
              />

              <p className="mt-3 text-sm font-medium text-slate-500">
                Mengambil detail Face ID...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !user) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar
          active="faceId"
          setActive={() => {}}
          collapsed={
            isCollapsed
          }
          setCollapsed={
            setIsCollapsed
          }
          role="admin"
        />

        <div className="flex min-w-0 flex-1 flex-col">
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

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <AlertCircle
                  size={24}
                  className="text-red-500"
                />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-800">
                Data tidak ditemukan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {error ||
                  "Detail pengguna tidak tersedia."}
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/admin/pengguna/face-id",
                  )
                }
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d47c9]"
              >
                <ArrowLeft
                  size={16}
                />
                Kembali ke Face ID
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const registered =
    user.faceStatus ===
    "Terdaftar";

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* SIDEBAR */}

      <Sidebar
        active="faceId"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
        role="admin"
      />

      {/* MAIN */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-40 shrink-0">
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
        </div>

        <main className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">

            {/* =================================================
                BACK
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/pengguna/face-id",
                )
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#155DFC]"
            >
              <ArrowLeft
                size={16}
              />

              Kembali ke Face ID
            </button>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff]">
                  <ScanFace
                    size={22}
                    className="text-[#155DFC]"
                  />
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-800">
                    Detail Face ID
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Informasi detail pengguna dan registrasi Face ID.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/pengguna/face-id/edit/${id}`,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Edit3
                    size={16}
                  />

                  {registered
                    ? "Perbarui Face ID"
                    : "Daftarkan Face ID"}
                </button>

                {registered && (
                  <button
                    type="button"
                    onClick={
                      handleDelete
                    }
                    disabled={
                      isDeleting
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2
                        size={16}
                      />
                    )}

                    {isDeleting
                      ? "Menghapus..."
                      : "Hapus Face ID"}
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
                PROFILE CARD
            ================================================= */}

            <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Profil Pengguna
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  {/* AVATAR */}

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#eaf1ff] text-2xl font-bold text-[#155DFC]">
                    {
                      user.avatar
                    }
                  </div>

                  {/* USER INFO */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-800">
                        {
                          user.nama
                        }
                      </h2>

                      <RoleBadge
                        role={
                          user.role
                        }
                      />

                      <FaceStatus
                        registered={
                          registered
                        }
                      />
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      @
                      {
                        user.username
                      }
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail
                          size={14}
                        />

                        {
                          user.email
                        }
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Phone
                          size={14}
                        />

                        {
                          user.noTelepon ||
                          "Nomor belum tersedia"
                        }
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness
                          size={14}
                        />

                        {
                          user.jabatan ||
                          "—"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                FACE ID CARD
            ================================================= */}

            <section className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <ScanFace
                    size={18}
                    className="text-[#155DFC]"
                  />

                  <h2 className="text-sm font-bold text-slate-800">
                    Informasi Face ID
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 p-5 md:grid-cols-[240px_1fr] md:p-6">

                {/* FACE PHOTO */}

                <div>
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {user.facePhoto ? (
                      <img
                        src={getFileUrl(
                          user.facePhoto,
                        )}
                        alt="Foto Face ID"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <ScanFace
                          size={70}
                          strokeWidth={
                            1.2
                          }
                          className="text-slate-300"
                        />

                        <p className="mt-3 text-xs font-medium text-slate-400">
                          Belum ada foto Face ID
                        </p>
                      </div>
                    )}

                    {registered && (
                      <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-white/95 px-3 py-2 text-center text-xs font-semibold text-emerald-600 shadow-sm">
                        Face ID terdaftar
                      </div>
                    )}
                  </div>
                </div>

                {/* FACE INFO */}

                <div>
                  <div className="mb-5">
                    <p className="text-xs font-medium text-slate-400">
                      Status Registrasi
                    </p>

                    <div className="mt-2">
                      <FaceStatus
                        registered={
                          registered
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <InfoItem
                      icon={
                        Fingerprint
                      }
                      label="Face ID"
                      value={
                        user.faceId ||
                        "Belum tersedia"
                      }
                    />

                    <InfoItem
                      icon={
                        CalendarDays
                      }
                      label="Tanggal Registrasi"
                      value={formatDate(
                        user.registeredAt,
                      )}
                    />

                    <InfoItem
                      icon={Clock3}
                      label="Terakhir Diperbarui"
                      value={formatDateTime(
                        user.updatedAt,
                      )}
                    />

                    <InfoItem
                      icon={
                        ShieldCheck
                      }
                      label="Status Akun"
                      value={
                        user.status
                      }
                    />
                  </div>

                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-[#155DFC]"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Face Verification
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Data Face ID digunakan sebagai
                          referensi pengenalan wajah ketika
                          pengguna melakukan presensi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <section className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <UserRound
                    size={18}
                    className="text-[#155DFC]"
                  />

                  <h2 className="text-sm font-bold text-slate-800">
                    Informasi Akun
                  </h2>
                </div>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                <InfoItem
                  icon={UserRound}
                  label="Nama Lengkap"
                  value={
                    user.nama
                  }
                />

                <InfoItem
                  icon={UserRound}
                  label="Username"
                  value={
                    user.username
                  }
                />

                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={
                    user.email
                  }
                />

                <InfoItem
                  icon={Phone}
                  label="Nomor Telepon"
                  value={
                    user.noTelepon
                  }
                />

                <InfoItem
                  icon={
                    BriefcaseBusiness
                  }
                  label="Jabatan / Kelas"
                  value={
                    user.jabatan
                  }
                />

                <InfoItem
                  icon={
                    ShieldCheck
                  }
                  label="Status Akun"
                  value={
                    user.status
                  }
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Tanggal Dibuat"
                  value={formatDate(
                    user.dibuatPada,
                  )}
                />
              </div>
            </section>

            {/* =================================================
                FOOTER ACTION
            ================================================= */}

            <div className="flex justify-start border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/pengguna/face-id",
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft
                  size={16}
                />

                Kembali ke daftar Face ID
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}