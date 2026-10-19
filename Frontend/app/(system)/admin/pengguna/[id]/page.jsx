
"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
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
  Clock3,
  Tags,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getShiftKerja } from "@/services/shiftKerja.service";
import { getKategoriJabatan } from "@/services/kategoriJabatan.service";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

// getToken diimpor dari @/lib/auth (single source of truth)

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function unwrapUserResponse(result) {
  let value = result;

  for (let i = 0; i < 4; i += 1) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      break;
    }

    // Objek pengguna langsung.
    if (value.id && (value.email || value.namaLengkap || value.namaPengguna)) {
      return value;
    }

    // Beberapa endpoint membungkus objek dengan key user/pengguna.
    if (value.user && typeof value.user === "object") {
      value = value.user;
      continue;
    }

    if (value.pengguna && typeof value.pengguna === "object") {
      value = value.pengguna;
      continue;
    }

    if (value.data !== undefined) {
      value = value.data;
      continue;
    }

    break;
  }

  return value;
}

function firstValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== ""
  );
}

function getArrayFromResponse(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data?.items)) return result.data.items;
  if (Array.isArray(result?.data?.data)) return result.data.data;

  return [];
}

function getId(value) {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "object") {
    return value.id ?? value._id ?? null;
  }

  return value;
}

function getAssignedShiftId(user) {
  return getId(
    firstValue(
      user?.shiftKerjaId,
      user?.shiftKerjaMaster?.id,
      user?.shiftKerja?.id,
      user?.shiftId
    )
  );
}

function getAssignedCategoryId(user) {
  return getId(
    firstValue(
      user?.kategoriJabatanId,
      user?.kategoriJabatan?.id,
      user?.kategoriJabatanMaster?.id
    )
  );
}

/* =========================================================
   DISPLAY HELPERS
========================================================= */

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getGenderLabel = (value) => {
  if (!value) return "-";

  const gender = String(value).toLowerCase();

  if (gender === "l" || gender === "laki-laki") {
    return "Laki-laki";
  }

  if (gender === "p" || gender === "perempuan") {
    return "Perempuan";
  }

  return value;
};

const getRoleLabel = (user) => {
  const role = firstValue(
    user?.peran?.namaTampilan,
    user?.peran?.nama,
    user?.role?.namaTampilan,
    user?.role?.nama,
    user?.namaPeran,
    user?.roleName,
    user?.role
  );

  if (!role || typeof role === "object") return "-";

  const normalized = String(role).toLowerCase();

  const labels = {
    guru: "Guru",
    siswa: "Siswa",
    staff: "Staff",
    staf: "Staff",
    admin_sekolah: "Admin Sekolah",
    super_admin: "Super Admin",
    admin_yayasan: "Admin Yayasan",
    cms_admin: "CMS Admin",
  };

  return labels[normalized] || role;
};

function getShiftLabel(user, matchedShift) {
  const shift = firstValue(
    matchedShift?.nama,
    user?.shiftKerjaMaster?.nama,
    user?.shiftKerjaMaster?.namaShift,
    user?.shiftKerjaMaster?.namaShiftKerja,
    typeof user?.shiftKerja === "object"
      ? user.shiftKerja?.nama
      : user?.shiftKerja,
    user?.shift
  );

  if (!shift) return "-";

  const normalized = String(shift).toLowerCase();

  if (normalized === "pagi") return "Pagi";
  if (normalized === "siang") return "Siang";

  return shift;
}

function getShiftTime(user, matchedShift) {
  const shift =
    matchedShift ||
    user?.shiftKerjaMaster ||
    (typeof user?.shiftKerja === "object" ? user.shiftKerja : null);

  const masuk = firstValue(shift?.jamMasuk);
  const keluar = firstValue(shift?.jamKeluar);

  if (masuk && keluar) {
    return `${masuk} – ${keluar}`;
  }

  return "-";
}

function getShiftCode(user, matchedShift) {
  return (
    firstValue(
      matchedShift?.kode,
      user?.shiftKerjaMaster?.kode,
      typeof user?.shiftKerja === "object"
        ? user.shiftKerja?.kode
        : null
    ) ?? "-"
  );
}

function getCategoryLabel(user, matchedCategory) {
  const category = firstValue(
    matchedCategory?.nama,
    user?.kategoriJabatan?.nama,
    user?.kategoriJabatan?.namaKategori,
    user?.kategoriJabatan?.namaKategoriJabatan,
    user?.kategoriJabatan?.namaJabatan,
    user?.kategoriJabatanMaster?.nama,
    user?.kategoriJabatanNama
  );

  if (category && typeof category !== "object") {
    return category;
  }

  return "-";
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ icon: Icon, label, value }) {
  const displayValue =
    value !== undefined && value !== null && value !== ""
      ? value
      : "-";

  return (
    <div
      className="
        rounded-xl border
        border-[var(--color-border-soft)]
        bg-[color-mix(in_srgb,var(--color-card)_92%,var(--color-text)_3%)]
        p-4 transition
        hover:border-[color-mix(in_srgb,var(--color-primary)_25%,var(--color-border))]
        hover:bg-[color-mix(in_srgb,var(--color-card)_88%,var(--color-primary)_3%)]
      "
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder}
          `}
        >
          <Icon size={16} className="text-[var(--color-primary)]" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide theme-text-muted">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold theme-text">
            {String(displayValue)}
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
  const active = String(status || "").toLowerCase() === "aktif";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border
        px-3 py-1.5 text-xs font-semibold
        ${
          active
            ? "border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
            : "border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] theme-text-muted"
        }
      `}
    >
      {active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="border-b border-[var(--color-border-soft)] px-4 py-4 sm:px-5 lg:px-6">
      <div className="flex items-center gap-2">
        <div
          className={`
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder}
          `}
        >
          <Icon size={15} className="text-[var(--color-primary)]" />
        </div>

        <div>
          <h2 className="text-sm font-bold theme-text">{title}</h2>
          <p className="mt-1 text-xs theme-text-muted">{description}</p>
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

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [error, setError] = useState("");
  const [masterError, setMasterError] = useState("");
  const [user, setUser] = useState(null);
  const [daftarShift, setDaftarShift] = useState([]);
  const [daftarKategoriJabatan, setDaftarKategoriJabatan] = useState([]);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Token login tidak ditemukan. Silakan login kembali.");
      }

      if (!id) {
        throw new Error("ID pengguna tidak ditemukan.");
      }

      const response = await fetch(
        `${API_URL}/api/users/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Gagal mengambil detail pengguna."
        );
      }

      if (result?.success === false) {
        throw new Error(result?.message || "Gagal mengambil detail pengguna.");
      }

      const userData = unwrapUserResponse(result);

      if (
        !userData ||
        typeof userData !== "object" ||
        !userData.id
      ) {
        throw new Error(
          "Respons backend tidak berisi data pengguna yang valid."
        );
      }

      setUser(userData);
    } catch (err) {
      console.error("GET DETAIL USER ERROR:", err);
      setError(err?.message || "Gagal mengambil detail pengguna.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadMasterData = useCallback(async () => {
    try {
      setLoadingMaster(true);
      setMasterError("");

      const [shiftResult, kategoriResult] = await Promise.all([
        getShiftKerja({ page: 1, limit: 100 }),
        getKategoriJabatan({ page: 1, limit: 100 }),
      ]);

      setDaftarShift(
        Array.isArray(shiftResult?.data) ? shiftResult.data : []
      );

      setDaftarKategoriJabatan(
        Array.isArray(kategoriResult?.data) ? kategoriResult.data : []
      );
    } catch (err) {
      console.error("GET MASTER SHIFT/KATEGORI ERROR:", err);
      setMasterError(
        err?.message ||
          "Daftar shift kerja dan kategori jabatan gagal dimuat."
      );
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    loadMasterData();
  }, [loadUser, loadMasterData]);

  const pageLayout = (content) => (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        activeMenu="pengguna"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((previous) => !previous)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title="Detail Pengguna"
          onMenuClick={() => setSidebarOpen((previous) => !previous)}
        />
        {content}
      </div>
    </div>
  );

  if (loading) {
    return pageLayout(
      <main className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3 text-sm theme-text-secondary">
          <Loader2
            size={20}
            className="animate-spin text-[var(--color-primary)]"
          />
          Memuat data pengguna...
        </div>
      </main>
    );
  }

  if (error || !user) {
    return pageLayout(
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-[var(--color-warning)]"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold theme-text">
                Gagal mengambil data
              </p>
              <p className="mt-1 break-words text-sm theme-text-secondary">
                {error || "Pengguna tidak ditemukan."}
              </p>

              <button
                type="button"
                onClick={loadUser}
                className="mt-3 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
              >
                Coba Lagi
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className={`
                inline-flex items-center gap-2 rounded-lg border
                ${themePrimarySoftBorder} ${themePrimarySoft}
                px-3 py-2 text-xs font-semibold
                text-[var(--color-primary)] ${themePrimaryHover}
              `}
            >
              <ArrowLeft size={14} />
              Kembali
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const fullName = firstValue(
    user.namaLengkap,
    user.nama,
    user.name,
    "-"
  );

  const username = firstValue(
    user.namaPengguna,
    user.username,
    "-"
  );

  const email = firstValue(user.email, "-");
  const phone = firstValue(user.noTelepon, user.nomorTelepon, "-");

  /*
   * Cocokkan hanya dengan ID penugasan pengguna.
   * Jangan memilih shift/kategori pertama jika ID tidak tersedia.
   */
  const assignedShiftId = getAssignedShiftId(user);
  const assignedCategoryId = getAssignedCategoryId(user);

  const matchedShift = assignedShiftId
    ? daftarShift.find(
        (shift) => String(shift.id) === String(assignedShiftId)
      )
    : null;

  const matchedCategory = assignedCategoryId
    ? daftarKategoriJabatan.find(
        (kategori) => String(kategori.id) === String(assignedCategoryId)
      )
    : null;

  const shiftLabel = getShiftLabel(user, matchedShift);
  const shiftTime = getShiftTime(user, matchedShift);
  const shiftCode = getShiftCode(user, matchedShift);
  const categoryLabel = getCategoryLabel(user, matchedCategory);

  const hasShiftAssignment =
    Boolean(assignedShiftId) ||
    Boolean(user.shiftKerjaMaster) ||
    (typeof user.shiftKerja === "object" && Boolean(user.shiftKerja?.id));

  const hasCategoryAssignment =
    Boolean(assignedCategoryId) ||
    Boolean(user.kategoriJabatan?.nama) ||
    Boolean(user.kategoriJabatanMaster?.nama);

  /* =========================================================
     RENDER
  ========================================================= */

  return pageLayout(
    <main className="flex-1 overflow-y-auto">
      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
                flex h-11 w-11 shrink-0 items-center justify-center
                rounded-xl bg-[var(--color-primary)] text-white
                ${themePrimaryShadow}
              `}
            >
              <User size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold theme-text sm:text-2xl">
                Detail Pengguna
              </h1>
              <p className="mt-1 text-xs theme-text-muted sm:text-sm">
                Informasi lengkap pengguna sekolah.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
            >
              <ArrowLeft size={15} />
              Kembali
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(`/admin/pengguna/${user.id}/edit`)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              <Edit3 size={15} />
              Edit Pengguna
            </button>
          </div>
        </div>

        {/* PROFILE CARD */}
        <section
          className={`theme-card theme-border overflow-hidden rounded-2xl ${themeCardShadow}`}
        >
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-primary)] text-2xl font-bold text-white">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={String(fullName)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  String(fullName).charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <h2 className="text-xl font-bold theme-text">
                    {fullName}
                  </h2>
                  <StatusBadge status={user.status} />
                </div>

                <p className="mt-1 text-sm theme-text-muted">
                  @{username}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`
                      inline-flex items-center gap-1.5 rounded-lg border
                      ${themePrimarySoftBorder} ${themePrimarySoft}
                      px-2.5 py-1.5 text-xs font-semibold
                      text-[var(--color-primary)]
                    `}
                  >
                    <ShieldCheck size={13} />
                    {getRoleLabel(user)}
                  </span>

                  {user.jabatan && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border theme-border theme-card-soft px-2.5 py-1.5 text-xs font-semibold theme-text-secondary">
                      <Briefcase size={13} />
                      {user.jabatan}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INFORMASI AKUN */}
        <section
          className={`theme-card theme-border overflow-hidden rounded-2xl ${themeCardShadow}`}
        >
          <SectionHeader
            icon={User}
            title="Informasi Akun"
            description="Data akun dan akses pengguna."
          />

          <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 lg:p-8">
            <InfoItem icon={User} label="Nama Lengkap" value={fullName} />
            <InfoItem icon={User} label="Username" value={username} />
            <InfoItem icon={Mail} label="Email" value={email} />
            <InfoItem icon={Phone} label="No. Telepon" value={phone} />
            <InfoItem
              icon={ShieldCheck}
              label="Peran"
              value={getRoleLabel(user)}
            />
            <InfoItem
              icon={Briefcase}
              label="Jabatan"
              value={user.jabatan}
            />
            <InfoItem icon={CreditCard} label="NIP" value={user.nip} />
            <InfoItem
              icon={CreditCard}
              label="Golongan"
              value={user.golongan}
            />
            <InfoItem icon={GraduationCap} label="NIPD" value={user.nipd} />
            <InfoItem icon={GraduationCap} label="NISN" value={user.nisn} />
          </div>
        </section>

        {/* INFORMASI KEPEGAWAIAN */}
        <section
          className={`theme-card theme-border overflow-hidden rounded-2xl ${themeCardShadow}`}
        >
          <SectionHeader
            icon={Briefcase}
            title="Informasi Kepegawaian"
            description="Shift kerja, jam kerja, dan kategori jabatan pengguna."
          />

          <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 lg:p-8">
            <InfoItem
              icon={Clock3}
              label="Shift Kerja"
              value={shiftLabel}
            />

            <InfoItem
              icon={CalendarDays}
              label="Jam Kerja"
              value={shiftTime}
            />

            <InfoItem
              icon={Tags}
              label="Kategori Jabatan"
              value={categoryLabel}
            />

            <InfoItem
              icon={Briefcase}
              label="Kode Shift"
              value={shiftCode}
            />
          </div>

          {loadingMaster && (
            <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg border theme-border p-3 text-sm theme-text-secondary sm:mx-6 lg:mx-8">
              <Loader2
                size={16}
                className="animate-spin text-[var(--color-primary)]"
              />
              Memuat daftar shift dan kategori jabatan...
            </div>
          )}

          {!loadingMaster && masterError && (
            <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-3 text-sm theme-text-secondary sm:mx-6 lg:mx-8">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-[var(--color-warning)]"
              />
              <span>{masterError}</span>
            </div>
          )}

          {!loadingMaster && !masterError && !hasShiftAssignment && (
            <div className="mx-4 mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 sm:mx-6 lg:mx-8">
              ID penugasan shift belum tersedia pada respons detail pengguna.
              Daftar shift berhasil dimuat, tetapi tidak ada dasar untuk
              menentukan shift mana yang ditugaskan kepada pengguna ini.
            </div>
          )}

          {!loadingMaster && !masterError && !hasCategoryAssignment && (
            <div className="mx-4 mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 sm:mx-6 lg:mx-8">
              ID kategori jabatan belum tersedia pada respons detail pengguna.
              Daftar kategori berhasil dimuat, tetapi kategori pengguna tidak
              bisa ditentukan secara akurat dari daftar master saja.
            </div>
          )}
        </section>

        {/* DATA PRIBADI */}
        <section
          className={`theme-card theme-border overflow-hidden rounded-2xl ${themeCardShadow}`}
        >
          <SectionHeader
            icon={User}
            title="Data Pribadi"
            description="Informasi pribadi pengguna."
          />

          <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 lg:p-8">
            <InfoItem icon={CreditCard} label="NIK" value={user.nik} />
            <InfoItem
              icon={VenusAndMars}
              label="Jenis Kelamin"
              value={getGenderLabel(user.jenisKelamin)}
            />
            <InfoItem
              icon={CalendarDays}
              label="Tempat Lahir"
              value={user.tempatLahir}
            />
            <InfoItem
              icon={CalendarDays}
              label="Tanggal Lahir"
              value={formatDate(user.tanggalLahir)}
            />
            <InfoItem icon={MapPin} label="Alamat" value={user.alamat} />
            <InfoItem
              icon={MapPin}
              label="Alamat Domisili"
              value={user.alamatDomisili}
            />
          </div>
        </section>

        {/* SEKOLAH */}
        <section
          className={`theme-card theme-border overflow-hidden rounded-2xl ${themeCardShadow}`}
        >
          <SectionHeader
            icon={GraduationCap}
            title="Sekolah"
            description="Informasi sekolah pengguna."
          />

          <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 lg:p-8">
            <InfoItem
              icon={GraduationCap}
              label="Nama Sekolah"
              value={user.sekolah?.nama}
            />
            <InfoItem
              icon={CreditCard}
              label="Kode Sekolah"
              value={user.sekolah?.kode}
            />
            <InfoItem
              icon={CalendarDays}
              label="Dibuat Pada"
              value={formatDate(user.dibuatPada)}
            />
          </div>
        </section>

        {/* FACE ID */}
        <section
          className={`theme-card theme-border overflow-hidden rounded-2xl ${themeCardShadow}`}
        >
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]">
                <CheckCircle2
                  size={15}
                  className="text-[var(--color-success)]"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold theme-text">Face ID</h3>

                {user.biometrikWajah ? (
                  <>
                    <p className="mt-1 text-xs text-[var(--color-success)]">
                      Face ID sudah terdaftar.
                    </p>
                    <p className="mt-1 text-xs theme-text-muted">
                      Status: {user.biometrikWajah.status || "-"}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-xs theme-text-secondary">
                    Informasi Face ID tidak tersedia pada respons detail
                    pengguna.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
