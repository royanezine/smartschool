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
  X,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/* =========================================================
   HELPER
========================================================= */

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  } catch {
    return "-";
  }
};

const getGenderLabel = (value) => {
  if (!value) return "-";

  if (
    value === "L" ||
    value.toLowerCase?.() ===
      "laki-laki"
  ) {
    return "Laki-laki";
  }

  if (
    value === "P" ||
    value.toLowerCase?.() ===
      "perempuan"
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

  const role =
    String(
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

  if (
    role === "admin_sekolah"
  ) {
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
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-start gap-3">
        <div
          className="
            w-9
            h-9
            rounded-lg
            bg-white
            border
            border-slate-200
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Icon
            size={16}
            className="text-[#155DFC]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700 break-words">
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
    String(status || "")
      .toLowerCase() === "aktif";

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
        ${
          active
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }
      `}
    >
      {active ? (
        <CheckCircle2 size={13} />
      ) : (
        <XCircle size={13} />
      )}

      {active
        ? "Aktif"
        : "Nonaktif"}
    </span>
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

        const id = Array.isArray(
          params?.id
        )
          ? params.id[0]
          : params?.id;

        if (!id) {
          throw new Error(
            "ID pengguna tidak ditemukan."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/users/${id}`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
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
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar
          role="admin"
          activeMenu="pengguna"
          isOpen={sidebarOpen}
          onToggle={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            title="Detail Pengguna"
            onMenuClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
          />

          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2
                size={20}
                className="animate-spin text-[#155DFC]"
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
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar
          role="admin"
          activeMenu="pengguna"
          isOpen={sidebarOpen}
          onToggle={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            title="Detail Pengguna"
            onMenuClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
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
                  border-red-200
                  bg-red-50
                  p-4
                "
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Gagal mengambil data
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {error ||
                      "Pengguna tidak ditemukan."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.back()
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-white
                    border
                    border-red-200
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-red-700
                    hover:bg-red-50
                  "
                >
                  <ArrowLeft
                    size={14}
                  />
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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        activeMenu="pengguna"
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          title="Detail Pengguna"
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
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
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-gradient-to-br
                    from-[#155DFC]
                    to-[#0d47c9]
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    shadow-[#155DFC]/20
                    shrink-0
                  "
                >
                  <User size={20} />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-slate-800
                      truncate
                    "
                  >
                    Detail Pengguna
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
                    border-slate-200
                    bg-white
                    text-slate-600
                    text-sm
                    font-semibold
                    hover:bg-slate-50
                    hover:border-slate-300
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
                    bg-gradient-to-r
                    from-[#155DFC]
                    to-[#0d47c9]
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
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              <div className="p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* AVATAR */}

                  <div
                    className="
                      w-20
                      h-20
                      rounded-2xl
                      bg-gradient-to-br
                      from-[#155DFC]
                      to-[#0d47c9]
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
                      <h2 className="text-xl font-bold text-slate-800">
                        {user.namaLengkap ||
                          "-"}
                      </h2>

                      <StatusBadge
                        status={
                          user.status
                        }
                      />
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      @
                      {user.namaPengguna ||
                        "-"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                        <ShieldCheck
                          size={13}
                        />
                        {getRoleLabel(
                          user
                        )}
                      </span>

                      {user.jabatan && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
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
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-[#eaf1ff]
                      border
                      border-[#c7dbff]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <User
                      size={15}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Informasi Akun
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Data akun dan akses pengguna.
                    </p>
                  </div>
                </div>
              </div>

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
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-[#eaf1ff]
                      border
                      border-[#c7dbff]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <User
                      size={15}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Data Pribadi
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Informasi pribadi pengguna.
                    </p>
                  </div>
                </div>
              </div>

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
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-[#eaf1ff]
                      border
                      border-[#c7dbff]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <GraduationCap
                      size={15}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Sekolah
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Informasi sekolah pengguna.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={
                      GraduationCap
                    }
                    label="Nama Sekolah"
                    value={
                      user.sekolah
                        ?.nama
                    }
                  />

                  <InfoItem
                    icon={
                      CreditCard
                    }
                    label="Kode Sekolah"
                    value={
                      user.sekolah
                        ?.kode
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
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-[#eaf1ff]
                      border
                      border-[#c7dbff]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <CheckCircle2
                      size={15}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Face ID
                    </h3>

                    {user.biometrikWajah ? (
                      <>
                        <p className="mt-1 text-xs text-emerald-600">
                          Face ID sudah terdaftar.
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Status:{" "}
                          {user
                            .biometrikWajah
                            ?.status ||
                            "-"}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
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