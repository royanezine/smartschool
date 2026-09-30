"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

// =========================================================
// ROLE CONFIG
// =========================================================

const roleConfig = {
  Guru: {
    bg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    text: "text-[var(--color-primary)]",
    border:
      "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
  },

  Siswa: {
    bg: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
    text: "text-[var(--color-info)]",
    border:
      "border-[color-mix(in_srgb,var(--color-info)_20%,transparent)]",
  },

  Staff: {
    bg: "theme-card-soft",
    text: "theme-text-secondary",
    border: "theme-border",
  },

  Admin: {
    bg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    text: "text-[var(--color-primary)]",
    border:
      "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
  },
};

// =========================================================
// ROLE NORMALIZER
// =========================================================

function normalizeRole(role) {
  const value = String(role || "").toLowerCase();

  if (value.includes("guru")) {
    return "Guru";
  }

  if (value.includes("siswa")) {
    return "Siswa";
  }

  if (value.includes("staff") || value.includes("staf")) {
    return "Staff";
  }

  if (value.includes("admin")) {
    return "Admin";
  }

  return role || "Staff";
}

// =========================================================
// INITIAL
// =========================================================

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}

// =========================================================
// FILE URL
// =========================================================

function getFileUrl(filePath) {
  if (!filePath) {
    return "";
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  const base = apiBase
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/$/, "");

  return `${base}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// =========================================================
// FORMAT DATETIME
// =========================================================

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =========================================================
// ROLE BADGE
// =========================================================

function RoleBadge({ role }) {
  const config = roleConfig[role] || roleConfig.Staff;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      {role}
    </span>
  );
}

// =========================================================
// FACE STATUS
// =========================================================

function FaceStatus({ registered }) {
  if (registered) {
    return (
      <span className="theme-success inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
        <CheckCircle2 size={13} />
        Terdaftar
      </span>
    );
  }

  return (
    <span className="theme-warning inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
      <XCircle size={13} />
      Belum Terdaftar
    </span>
  );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="theme-card rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <div className="theme-card-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Icon size={16} className="theme-text-muted" />
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-1 break-words text-sm font-semibold">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// PAGE
// =========================================================

export default function FaceIdDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id ? String(params.id) : "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // =======================================================
  // LOAD DETAIL
  // =======================================================

  const loadDetail = async () => {
    if (!id) {
      setError("ID pengguna tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await apiFetch(`/api/users/${id}`, {
        method: "GET",
      });

      const data = response?.data;

      if (!data) {
        throw new Error("Data pengguna tidak ditemukan.");
      }

      const biometric = data.biometrikWajah || null;

      const role = normalizeRole(
        data.peran?.namaTampilan || data.peran?.nama
      );

      const registered =
        String(biometric?.status || "").toLowerCase() === "aktif";

      setUser({
        id: data.id,

        nama:
          data.namaLengkap ||
          data.namaPengguna ||
          "Tanpa Nama",

        username: data.namaPengguna || "-",

        email: data.email || "-",

        noTelepon: data.noTelepon || "-",

        role,

        jabatan:
          data.jabatan ||
          data.nisn ||
          "-",

        status:
          String(data.status || "").toLowerCase() === "aktif"
            ? "Aktif"
            : "Nonaktif",

        faceStatus: registered
          ? "Terdaftar"
          : "Belum Terdaftar",

        faceId: biometric?.id || null,

        facePhoto:
          biometric?.urlFotoReferensi || null,

        registeredAt:
          biometric?.dibuatPada || null,

        updatedAt:
          biometric?.diperbaruiPada || null,

        dibuatPada:
          data.dibuatPada || null,

        avatar: getInitials(
          data.namaLengkap ||
            data.namaPengguna
        ),
      });
    } catch (err) {
      console.error(
        "Gagal mengambil detail Face ID:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil detail pengguna."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async () => {
    if (!id || !user?.faceId) {
      return;
    }

    const confirmed = window.confirm(
      `Hapus Face ID milik ${user.nama}? Akun pengguna tidak akan ikut terhapus.`
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
        }
      );

      router.push("/admin/pengguna/face-id");
    } catch (err) {
      console.error(
        "Gagal menghapus Face ID:",
        err
      );

      alert(
        err?.message ||
          "Gagal menghapus Face ID."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // =======================================================
  // SIDEBAR
  // =======================================================

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (isLoading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="faceId"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2
                size={30}
                className="animate-spin text-[var(--color-primary)]"
              />

              <p className="theme-text-secondary mt-3 text-sm font-medium">
                Mengambil detail Face ID...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error || !user) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="faceId"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div
              className={`theme-card ${themeCardShadow} w-full max-w-md rounded-2xl border p-6 text-center`}
            >
              <div className="theme-danger mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                <AlertCircle size={24} />
              </div>

              <h2 className="theme-text mt-4 text-base font-bold">
                Data tidak ditemukan
              </h2>

              <p className="theme-text-secondary mt-1 text-sm">
                {error ||
                  "Detail pengguna tidak tersedia."}
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/admin/pengguna/face-id"
                  )
                }
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition ${themePrimaryShadow} ${themePrimaryHover}`}
              >
                <ArrowLeft size={16} />
                Kembali ke Face ID
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const registered =
    user.faceStatus === "Terdaftar";

  // =======================================================
  // MAIN
  // =======================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="faceId"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* MAIN */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-40 shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">

            {/* BACK */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/pengguna/face-id"
                )
              }
              className="theme-text-secondary mb-5 inline-flex items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={16} />
              Kembali ke Face ID
            </button>

            {/* PAGE HEADER */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft}`}
                >
                  <ScanFace
                    size={22}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold tracking-tight">
                    Detail Face ID
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Informasi detail pengguna dan registrasi Face ID.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/pengguna/face-id/edit/${id}`
                    )
                  }
                  className={`theme-card theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${themeTextHover}`}
                >
                  <Edit3 size={16} />

                  {registered
                    ? "Perbarui Face ID"
                    : "Daftarkan Face ID"}
                </button>

                {/* DELETE */}

                {registered && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="theme-danger inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    {isDeleting
                      ? "Menghapus..."
                      : "Hapus Face ID"}
                  </button>
                )}

              </div>
            </div>

            {/* PROFILE CARD */}

            <section
              className={`theme-card ${themeCardShadow} mb-5 overflow-hidden rounded-2xl border`}
            >
              <div className="theme-card-soft border-b px-5 py-4 sm:px-6">
                <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                  Profil Pengguna
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  {/* AVATAR */}

                  <div
                    className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ${themePrimarySoft} text-2xl font-bold text-[var(--color-primary)]`}
                  >
                    {user.avatar}
                  </div>

                  {/* USER INFO */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="theme-text text-xl font-bold">
                        {user.nama}
                      </h2>

                      <RoleBadge role={user.role} />

                      <FaceStatus
                        registered={registered}
                      />
                    </div>

                    <p className="theme-text-muted mt-1 text-sm">
                      @{user.username}
                    </p>

                    <div className="theme-text-secondary mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">

                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={14} />
                        {user.email}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={14} />
                        {user.noTelepon ||
                          "Nomor belum tersedia"}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness size={14} />
                        {user.jabatan || "—"}
                      </span>

                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FACE ID CARD */}

            <section
              className={`theme-card ${themeCardShadow} mb-5 rounded-2xl border`}
            >
              <div className="border-b px-5 py-4 sm:px-6 theme-border-soft">
                <div className="flex items-center gap-2">

                  <ScanFace
                    size={18}
                    className="text-[var(--color-primary)]"
                  />

                  <h2 className="theme-text text-sm font-bold">
                    Informasi Face ID
                  </h2>

                </div>
              </div>

              <div className="grid gap-6 p-5 md:grid-cols-[240px_1fr] md:p-6">

                {/* FACE PHOTO */}

                <div>
                  <div className="theme-card-soft relative aspect-square overflow-hidden rounded-2xl border">

                    {user.facePhoto ? (
                      <img
                        src={getFileUrl(
                          user.facePhoto
                        )}
                        alt="Foto Face ID"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <ScanFace
                          size={70}
                          strokeWidth={1.2}
                          className="theme-text-muted"
                        />

                        <p className="theme-text-muted mt-3 text-xs font-medium">
                          Belum ada foto Face ID
                        </p>
                      </div>
                    )}

                    {registered && (
                      <div className="theme-card absolute bottom-3 left-3 right-3 rounded-lg border px-3 py-2 text-center text-xs font-semibold shadow-sm">
                        <span className="theme-success">
                          Face ID terdaftar
                        </span>
                      </div>
                    )}

                  </div>
                </div>

                {/* FACE INFO */}

                <div>

                  <div className="mb-5">
                    <p className="theme-text-muted text-xs font-medium">
                      Status Registrasi
                    </p>

                    <div className="mt-2">
                      <FaceStatus
                        registered={registered}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <InfoItem
                      icon={Fingerprint}
                      label="Face ID"
                      value={
                        user.faceId ||
                        "Belum tersedia"
                      }
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Tanggal Registrasi"
                      value={formatDate(
                        user.registeredAt
                      )}
                    />

                    <InfoItem
                      icon={Clock3}
                      label="Terakhir Diperbarui"
                      value={formatDateTime(
                        user.updatedAt
                      )}
                    />

                    <InfoItem
                      icon={ShieldCheck}
                      label="Status Akun"
                      value={user.status}
                    />

                  </div>

                  {/* VERIFICATION INFO */}

                  <div
                    className={`mt-5 rounded-xl border p-4 ${themePrimarySoft} ${themePrimarySoftBorder}`}
                  >
                    <div className="flex items-start gap-3">

                      <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />

                      <div>
                        <p className="theme-text text-sm font-semibold">
                          Face Verification
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs leading-relaxed">
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

            {/* ACCOUNT INFORMATION */}

            <section
              className={`theme-card ${themeCardShadow} mb-5 rounded-2xl border`}
            >
              <div className="border-b px-5 py-4 sm:px-6 theme-border-soft">
                <div className="flex items-center gap-2">

                  <UserRound
                    size={18}
                    className="text-[var(--color-primary)]"
                  />

                  <h2 className="theme-text text-sm font-bold">
                    Informasi Akun
                  </h2>

                </div>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">

                <InfoItem
                  icon={UserRound}
                  label="Nama Lengkap"
                  value={user.nama}
                />

                <InfoItem
                  icon={UserRound}
                  label="Username"
                  value={user.username}
                />

                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />

                <InfoItem
                  icon={Phone}
                  label="Nomor Telepon"
                  value={user.noTelepon}
                />

                <InfoItem
                  icon={BriefcaseBusiness}
                  label="Jabatan / Kelas"
                  value={user.jabatan}
                />

                <InfoItem
                  icon={ShieldCheck}
                  label="Status Akun"
                  value={user.status}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Tanggal Dibuat"
                  value={formatDate(
                    user.dibuatPada
                  )}
                />

              </div>
            </section>

            {/* FOOTER ACTION */}

            <div className="theme-border flex justify-start border-t pt-5">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/pengguna/face-id"
                  )
                }
                className={`theme-card theme-text-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${themeTextHover}`}
              >
                <ArrowLeft size={16} />
                Kembali ke daftar Face ID
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}