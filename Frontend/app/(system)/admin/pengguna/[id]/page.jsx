"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Loader2,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Briefcase,
  CreditCard,
  GraduationCap,
  MapPin,
  CalendarDays,
  VenusAndMars,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/* =========================================================
   THEME HELPERS
========================================================= */

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

/* =========================================================
   HELPER
========================================================= */

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const getGenderLabel = (value) => {
  if (!value) return "-";

  if (
    value === "L" ||
    value.toLowerCase?.() === "laki-laki"
  ) {
    return "Laki-laki";
  }

  if (
    value === "P" ||
    value.toLowerCase?.() === "perempuan"
  ) {
    return "Perempuan";
  }

  return value;
};

const getRoleLabel = (user) => {
  if (!user?.peran) return "-";

  if (user.peran.namaTampilan) {
    return user.peran.namaTampilan;
  }

  const role = String(
    user.peran.nama || ""
  ).toLowerCase();

  if (role === "guru") return "Guru";
  if (role === "siswa") return "Siswa";

  if (
    role === "staff" ||
    role === "staf"
  ) {
    return "Staff";
  }

  if (role === "admin_sekolah") {
    return "Admin Sekolah";
  }

  return user.peran.nama || "-";
};

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        border-[var(--color-border-soft)]
        bg-[color-mix(in_srgb,var(--color-card)_92%,var(--color-text)_3%)]
        p-4
        transition
        hover:border-[color-mix(in_srgb,var(--color-primary)_25%,var(--color-border))]
        hover:bg-[color-mix(in_srgb,var(--color-card)_88%,var(--color-primary)_3%)]
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            w-9
            h-9
            rounded-lg
            ${themePrimarySoft}
            border
            ${themePrimarySoftBorder}
            flex
            items-center
            justify-center
            shrink-0
          `}
        >
          <Icon
            size={16}
            className="text-[var(--color-primary)]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide theme-text-muted">
            {label}
          </p>

          <p className="mt-1 text-sm font-semibold theme-text break-words">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const active =
    String(status || "").toLowerCase() ===
    "aktif";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-3
        py-1.5
        text-xs
        font-semibold
        border
        ${
          active
            ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]"
            : "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] theme-text-muted border-[var(--color-border)]"
        }
      `}
    >
      {active ? (
        <CheckCircle2 size={13} />
      ) : (
        <XCircle size={13} />
      )}

      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-[var(--color-border-soft)]">
      <div className="flex items-center gap-2">
        <div
          className={`
            w-8
            h-8
            rounded-lg
            ${themePrimarySoft}
            border
            ${themePrimarySoftBorder}
            flex
            items-center
            justify-center
            shrink-0
          `}
        >
          <Icon
            size={15}
            className="text-[var(--color-primary)]"
          />
        </div>

        <div>
          <h2 className="text-sm font-bold theme-text">
            {title}
          </h2>

          <p className="text-xs theme-text-muted mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function DetailPenggunaPage() {
  const params = useParams();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [user, setUser] =
    useState(null);

  /* =========================================================
     GET DETAIL USER
  ========================================================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          throw new Error(
            "Token login tidak ditemukan."
          );
        }

        const id = Array.isArray(params?.id)
          ? params.id[0]
          : params?.id;

        if (!id) {
          throw new Error(
            "ID pengguna tidak ditemukan."
          );
        }

        const response = await fetch(
          `${API_URL}/api/users/${id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result =
          await response.json();

        console.log(
          "DETAIL USER:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Gagal mengambil detail pengguna."
          );
        }

        setUser(
          result?.data || null
        );
      } catch (err) {
        console.error(
          "GET DETAIL USER ERROR:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil detail pengguna."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [params]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          role="admin"
          activeMenu="pengguna"
          isOpen={sidebarOpen}
          onToggle={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            title="Detail Pengguna"
            onMenuClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
          />

          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-sm theme-text-secondary">
              <Loader2
                size={20}
                className="animate-spin text-[var(--color-primary)]"
              />

              Memuat data pengguna...
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !user) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          role="admin"
          activeMenu="pengguna"
          isOpen={sidebarOpen}
          onToggle={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            title="Detail Pengguna"
            onMenuClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
          />

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)]
                  bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]
                  p-4
                "
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold theme-text">
                    Gagal mengambil data
                  </p>

                  <p className="mt-1 text-sm theme-text-secondary">
                    {error ||
                      "Pengguna tidak ditemukan."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.back()
                  }
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    ${themePrimarySoftBorder}
                    ${themePrimarySoft}
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-[var(--color-primary)]
                    ${themePrimaryHover}
                    transition
                  `}
                >
                  <ArrowLeft size={14} />
                  Kembali
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        activeMenu="pengguna"
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          title="Detail Pengguna"
          onMenuClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-11
                    h-11
                    rounded-xl
                    bg-[var(--color-primary)]
                    text-white
                    flex
                    items-center
                    justify-center
                    ${themePrimaryShadow}
                    shrink-0
                  `}
                >
                  <User size={20} />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      theme-text
                      truncate
                    "
                  >
                    Detail Pengguna
                  </h1>

                  <p className="text-xs sm:text-sm theme-text-muted mt-1">
                    Informasi lengkap pengguna sekolah.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.back()
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    theme-border
                    theme-card
                    theme-text-secondary
                    text-sm
                    font-semibold
                    hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                    hover:border-[var(--color-border)]
                    transition
                  "
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/pengguna/${user.id}/edit`
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    bg-[var(--color-primary)]
                    text-white
                    text-sm
                    font-semibold
                    shadow-sm
                    hover:brightness-110
                    transition
                  "
                >
                  <Edit3 size={15} />
                  Edit Pengguna
                </button>
              </div>
            </div>

            {/* =================================================
                PROFILE CARD
            ================================================== */}

            <section
              className={`
                theme-card
                theme-border
                rounded-2xl
                overflow-hidden
                ${themeCardShadow}
              `}
            >
              <div className="p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* AVATAR */}

                  <div
                    className="
                      w-20
                      h-20
                      rounded-2xl
                      bg-[var(--color-primary)]
                      flex
                      items-center
                      justify-center
                      text-white
                      text-2xl
                      font-bold
                      shrink-0
                      overflow-hidden
                    "
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={
                          user.namaLengkap ||
                          "Pengguna"
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (
                        user.namaLengkap ||
                        "P"
                      )
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h2 className="text-xl font-bold theme-text">
                        {user.namaLengkap ||
                          "-"}
                      </h2>

                      <StatusBadge
                        status={
                          user.status
                        }
                      />
                    </div>

                    <p className="mt-1 text-sm theme-text-muted">
                      @{user.namaPengguna || "-"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          ${themePrimarySoftBorder}
                          ${themePrimarySoft}
                          px-2.5
                          py-1.5
                          text-xs
                          font-semibold
                          text-[var(--color-primary)]
                        `}
                      >
                        <ShieldCheck
                          size={13}
                        />

                        {getRoleLabel(user)}
                      </span>

                      {user.jabatan && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            theme-border
                            theme-card-soft
                            px-2.5
                            py-1.5
                            text-xs
                            font-semibold
                            theme-text-secondary
                          "
                        >
                          <Briefcase
                            size={13}
                          />

                          {user.jabatan}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                INFORMASI AKUN
            ================================================== */}

            <section
              className={`
                theme-card
                theme-border
                rounded-2xl
                overflow-hidden
                ${themeCardShadow}
              `}
            >
              <SectionHeader
                icon={User}
                title="Informasi Akun"
                description="Data akun dan akses pengguna."
              />

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={User}
                    label="Nama Lengkap"
                    value={
                      user.namaLengkap
                    }
                  />

                  <InfoItem
                    icon={User}
                    label="Username"
                    value={
                      user.namaPengguna
                    }
                  />

                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={user.email}
                  />

                  <InfoItem
                    icon={Phone}
                    label="No. Telepon"
                    value={
                      user.noTelepon
                    }
                  />

                  <InfoItem
                    icon={ShieldCheck}
                    label="Peran"
                    value={getRoleLabel(
                      user
                    )}
                  />

                  <InfoItem
                    icon={Briefcase}
                    label="Jabatan"
                    value={
                      user.jabatan
                    }
                  />

                  <InfoItem
                    icon={CreditCard}
                    label="NIP"
                    value={user.nip}
                  />

                  <InfoItem
                    icon={CreditCard}
                    label="Golongan"
                    value={
                      user.golongan
                    }
                  />

                  <InfoItem
                    icon={GraduationCap}
                    label="NIPD"
                    value={user.nipd}
                  />

                  <InfoItem
                    icon={GraduationCap}
                    label="NISN"
                    value={user.nisn}
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                DATA PRIBADI
            ================================================== */}

            <section
              className={`
                theme-card
                theme-border
                rounded-2xl
                overflow-hidden
                ${themeCardShadow}
              `}
            >
              <SectionHeader
                icon={User}
                title="Data Pribadi"
                description="Informasi pribadi pengguna."
              />

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={CreditCard}
                    label="NIK"
                    value={user.nik}
                  />

                  <InfoItem
                    icon={VenusAndMars}
                    label="Jenis Kelamin"
                    value={getGenderLabel(
                      user.jenisKelamin
                    )}
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Tempat Lahir"
                    value={
                      user.tempatLahir
                    }
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Tanggal Lahir"
                    value={formatDate(
                      user.tanggalLahir
                    )}
                  />

                  <InfoItem
                    icon={MapPin}
                    label="Alamat"
                    value={
                      user.alamat
                    }
                  />

                  <InfoItem
                    icon={MapPin}
                    label="Alamat Domisili"
                    value={
                      user.alamatDomisili
                    }
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                SEKOLAH
            ================================================== */}

            <section
              className={`
                theme-card
                theme-border
                rounded-2xl
                overflow-hidden
                ${themeCardShadow}
              `}
            >
              <SectionHeader
                icon={GraduationCap}
                title="Sekolah"
                description="Informasi sekolah pengguna."
              />

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={GraduationCap}
                    label="Nama Sekolah"
                    value={
                      user.sekolah?.nama
                    }
                  />

                  <InfoItem
                    icon={CreditCard}
                    label="Kode Sekolah"
                    value={
                      user.sekolah?.kode
                    }
                  />

                  <InfoItem
                    icon={User}
                    label="Dibuat Pada"
                    value={formatDate(
                      user.dibuatPada
                    )}
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                FACE ID
            ================================================== */}

            <section
              className={`
                theme-card
                theme-border
                rounded-2xl
                overflow-hidden
                ${themeCardShadow}
              `}
            >
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      w-8
                      h-8
                      rounded-lg
                      bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
                      border
                      border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    `}
                  >
                    <CheckCircle2
                      size={15}
                      className="text-[var(--color-success)]"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Face ID
                    </h3>

                    {user.biometrikWajah ? (
                      <>
                        <p className="mt-1 text-xs text-[var(--color-success)]">
                          Face ID sudah terdaftar.
                        </p>

                        <p className="mt-1 text-xs theme-text-muted">
                          Status:{" "}
                          {user
                            .biometrikWajah
                            ?.status ||
                            "-"}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs theme-text-secondary">
                        Face ID belum terdaftar untuk pengguna ini.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}