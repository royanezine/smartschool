"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Shield,
  Users,
  Lock,
  CheckCircle,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Save,
  ArrowLeft,
  AlertCircle,
  Settings,
  UserCog,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Key,
  Building2,
  RefreshCw,
  Layers3,
  Check,
  Database,
  Activity,
  CircleCheck,
} from "lucide-react";

import {
  getRoles,
  getRoleById,
  getPermissions,
  updateRole,
} from "@/services/role.service";

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

const themeCardHoverShadow =
  "hover:shadow-[0_8px_28px_color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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
// ACTION LIST
// ============================================================

const AKSI_LIST = [
  {
    key: "view",
    label: "Lihat",
    icon: Eye,
  },
  {
    key: "create",
    label: "Tambah",
    icon: Plus,
  },
  {
    key: "update",
    label: "Ubah",
    icon: Edit,
  },
  {
    key: "delete",
    label: "Hapus",
    icon: Trash2,
  },
];

// ============================================================
// UTILITIES
// ============================================================

function formatTanggal(value) {
  if (!value) return "-";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function getActionStyle(action) {
  switch (action) {
    case "view":
      return {
        bg: themeInfoSurface,
        text: "text-[var(--color-info)]",
        border: themeInfoBorder,
      };

    case "create":
      return {
        bg: themeSuccessSurface,
        text: "text-[var(--color-success)]",
        border: themeSuccessBorder,
      };

    case "update":
      return {
        bg: themeWarningSurface,
        text: "text-[var(--color-warning)]",
        border: themeWarningBorder,
      };

    case "delete":
      return {
        bg: themeDangerSurface,
        text: "text-[color-mix(in_srgb,var(--color-warning)_82%,var(--color-text))]",
        border: themeDangerBorder,
      };

    default:
      return {
        bg: themeNeutralSurface,
        text: "theme-text-muted",
        border: themeNeutralBorder,
      };
  }
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border theme-border theme-card p-4 ${themeCardShadow} ${themeCardHoverShadow} transition-all duration-300 hover:-translate-y-0.5 sm:p-5`}
    >
      <div
        className={`absolute -right-8 -top-8 h-20 w-20 rounded-full ${themeNeutralSurface} opacity-70 transition-transform duration-500 group-hover:scale-125`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.1em]">
            {label}
          </p>

          <p className="theme-text mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
            {value}
          </p>

          {description && (
            <p className="theme-text-muted mt-1 truncate text-[11px]">
              {description}
            </p>
          )}
        </div>

        <div
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

function EditRolePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleId = searchParams.get("id");

  const [isMobile, setIsMobile] = useState(false);

  const [role, setRole] = useState(null);
  const [roleListData, setRoleListData] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nama: "",
    namaTampilan: "",
    deskripsi: "",
  });

  const [selectedPermissions, setSelectedPermissions] =
    useState(new Set());

  const [errors, setErrors] = useState({});

  const [cariModul, setCariModul] = useState("");
  const [modulTerbuka, setModulTerbuka] = useState(null);

  // ============================================================
  // MOBILE DETECTION
  // ============================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!roleId) {
      setLoading(false);
      setError("ID role tidak ditemukan.");
      return;
    }

    loadData();
  }, [roleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setSaved(false);

      const [roleDetail, permissionData, rolesData] =
        await Promise.all([
          getRoleById(roleId),
          getPermissions(),
          getRoles(),
        ]);

      if (!roleDetail) {
        throw new Error("Data role tidak ditemukan.");
      }

      setRole(roleDetail);

      setPermissions(
        Array.isArray(permissionData)
          ? permissionData
          : []
      );

      setRoleListData(
        Array.isArray(rolesData)
          ? rolesData.find(
              (item) => item.id === roleId
            ) || null
          : null
      );

      setForm({
        nama: roleDetail.nama || "",
        namaTampilan:
          roleDetail.namaTampilan || "",
        deskripsi: roleDetail.deskripsi || "",
      });

      setSelectedPermissions(
        new Set(
          Array.isArray(roleDetail.izinIds)
            ? roleDetail.izinIds
            : []
        )
      );
    } catch (err) {
      console.error(
        "Gagal mengambil data edit role:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data role."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const jumlahPengguna =
    roleListData?._count?.pengguna || 0;

  const modulGroups = useMemo(() => {
    const map = new Map();

    permissions.forEach((permission) => {
      const modul =
        permission?.modul || "Lainnya";

      if (!map.has(modul)) {
        map.set(modul, {});
      }

      const aksi = permission?.aksi || "";

      map.get(modul)[aksi] = permission;
    });

    return Array.from(map.entries()).map(
      ([modul, aksiMap]) => ({
        modul,
        aksiMap,
      })
    );
  }, [permissions]);

  const modulTersaring = useMemo(() => {
    const keyword =
      cariModul.trim().toLowerCase();

    if (!keyword) {
      return modulGroups;
    }

    return modulGroups.filter(
      ({ modul }) =>
        modul
          .toLowerCase()
          .includes(keyword)
    );
  }, [modulGroups, cariModul]);

  const totalPermissionTersedia =
    permissions.length;

  const totalDipilih =
    selectedPermissions.size;

  const totalModul = modulGroups.length;

  const modulAktif = useMemo(() => {
    return modulGroups.filter(
      ({ aksiMap }) =>
        Object.values(aksiMap)
          .filter(Boolean)
          .some((permission) =>
            selectedPermissions.has(
              permission.id
            )
          )
    ).length;
  }, [modulGroups, selectedPermissions]);

  const persentaseAkses =
    totalPermissionTersedia > 0
      ? Math.round(
          (totalDipilih /
            totalPermissionTersedia) *
            100
        )
      : 0;

  // ============================================================
  // PERMISSION HANDLERS
  // ============================================================

  const togglePermission = (
    permissionId
  ) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);

      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }

      return next;
    });

    setSaved(false);
  };

  const toggleModulPenuh = (aksiMap) => {
    const idsModul = Object.values(aksiMap)
      .filter(Boolean)
      .map(
        (permission) => permission.id
      );

    if (idsModul.length === 0) {
      return;
    }

    const semuaTerpilih =
      idsModul.every((id) =>
        selectedPermissions.has(id)
      );

    setSelectedPermissions((prev) => {
      const next = new Set(prev);

      idsModul.forEach((id) => {
        if (semuaTerpilih) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });

      return next;
    });

    setSaved(false);
  };

  const pilihSemua = () => {
    setSelectedPermissions(
      new Set(
        permissions.map(
          (permission) => permission.id
        )
      )
    );

    setSaved(false);
  };

  const hapusSemua = () => {
    setSelectedPermissions(new Set());
    setSaved(false);
  };

  // ============================================================
  // FORM
  // ============================================================

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validasi = () => {
    const errorBaru = {};

    if (!form.nama.trim()) {
      errorBaru.nama =
        "Nama peran wajib diisi.";
    }

    if (!form.namaTampilan.trim()) {
      errorBaru.namaTampilan =
        "Nama tampilan wajib diisi.";
    }

    setErrors(errorBaru);

    return (
      Object.keys(errorBaru).length === 0
    );
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSimpan = async () => {
    if (!validasi()) {
      return;
    }

    if (!roleId) {
      setError("ID role tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const payload = {
        nama: form.nama.trim(),
        namaTampilan:
          form.namaTampilan.trim(),
        deskripsi:
          form.deskripsi.trim() || null,
        izinIds: Array.from(
          selectedPermissions
        ),
      };

      console.log(
        "Payload update role:",
        payload
      );

      const updatedRole =
        await updateRole(
          roleId,
          payload
        );

      console.log(
        "Role berhasil diupdate:",
        updatedRole
      );

      setSaved(true);

      setTimeout(() => {
        router.push(
          "/super-admin/manajemenAkses"
        );
      }, 800);
    } catch (err) {
      console.error(
        "Gagal update role:",
        err
      );

      setError(
        err?.message ||
          "Gagal menyimpan perubahan role."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="theme-page theme-text flex min-h-full items-center justify-center p-6">
        <div
          className={`theme-card theme-border w-full max-w-sm rounded-3xl border p-8 text-center ${themeCardShadow}`}
        >
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeInfoSurface} text-[var(--color-info)]`}
          >
            <RefreshCw
              size={24}
              className="animate-spin"
            />
          </div>

          <p className="theme-text mt-5 text-sm font-semibold">
            Memuat data role
          </p>

          <p className="theme-text-muted mt-1.5 text-xs leading-5">
            Mengambil detail role dan hak akses
            dari backend.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR / ROLE NOT FOUND
  // ============================================================

  if (!role) {
    return (
      <div className="theme-page theme-text flex min-h-full items-center justify-center p-6">
        <div
          className={`theme-card theme-border w-full max-w-md rounded-3xl border p-7 text-center ${themeCardShadow}`}
        >
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeDangerSurface} text-[var(--color-warning)]`}
          >
            <AlertCircle size={25} />
          </div>

          <h2 className="theme-text mt-5 text-lg font-semibold">
            Gagal Memuat Role
          </h2>

          <p className="theme-text-secondary mt-2 text-sm leading-6">
            {error ||
              "Data role tidak ditemukan."}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              onClick={() =>
                router.push(
                  "/super-admin/manajemenAkses"
                )
              }
              className={`theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
            >
              <ArrowLeft size={16} />
              Kembali
            </button>

            <button
              onClick={loadData}
              className={`${themePrimaryGradient} ${themePrimaryShadow} inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-105`}
            >
              <RefreshCw size={16} />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <main className="w-full px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-7 xl:px-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5 lg:space-y-6">

          {/* BACK */}
          <button
            onClick={() =>
              router.push(
                "/super-admin/manajemenAkses"
              )
            }
            className="group theme-text-secondary inline-flex items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />
            Kembali ke Manajemen Akses
          </button>

          {/* ERROR */}
          {error && (
            <div
              className={`flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3.5`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${themeWarningSurface} text-[var(--color-warning)]`}
              >
                <AlertCircle size={17} />
              </div>

              <div className="min-w-0">
                <p className="theme-text text-sm font-semibold">
                  Gagal memproses data
                </p>

                <p className="theme-text-secondary mt-0.5 text-xs leading-5">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {saved && (
            <div
              className={`flex items-center gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} px-4 py-3.5`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${themeSuccessSurface} text-[var(--color-success)]`}
              >
                <CheckCircle size={17} />
              </div>

              <div>
                <p className="text-[var(--color-success)] text-sm font-semibold">
                  Perubahan berhasil disimpan
                </p>

                <p className="theme-text-secondary text-xs">
                  Data role telah diperbarui.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================
              HERO
          ====================================================== */}

          <section
            className={`relative overflow-hidden rounded-3xl ${themePrimaryGradient} ${themePrimaryShadow}`}
          >
            <div className="absolute inset-0 opacity-[0.08]">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "linear-gradient(color-mix(in srgb,var(--color-card) 50%,transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb,var(--color-card) 50%,transparent) 1px, transparent 1px)",
                  backgroundSize:
                    "34px 34px",
                }}
              />
            </div>

            <div
              className="absolute -right-24 -top-28 h-72 w-72 rounded-full blur-3xl"
              style={{
                background:
                  "color-mix(in srgb,var(--color-card) 14%,transparent)",
              }}
            />

            <div
              className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full blur-3xl"
              style={{
                background:
                  "color-mix(in srgb,var(--color-info) 18%,transparent)",
              }}
            />

            <div className="relative p-5 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] text-[var(--color-card)] backdrop-blur-sm sm:h-14 sm:w-14"
                  >
                    <Shield
                      size={25}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-card)]"
                      >
                        <Settings size={11} />
                        Manajemen Akses
                      </span>

                      <span
                        className="rounded-full border border-[color-mix(in_srgb,var(--color-card)_14%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_6%,transparent)] px-2.5 py-1 font-mono text-[10px] text-[color-mix(in_srgb,var(--color-card)_75%,transparent)]"
                      >
                        {role.id}
                      </span>
                    </div>

                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl">
                      Edit Role
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[color-mix(in_srgb,var(--color-card)_68%,transparent)] sm:text-sm">
                      Perbarui informasi peran dan
                      atur hak akses modul untuk
                      pengguna SmartSchool.
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-auto">
                  <button
                    onClick={handleSimpan}
                    disabled={saving}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-card)] px-5 text-sm font-semibold text-[var(--color-primary)] shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_18%,transparent)] transition-all hover:brightness-[0.97] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                  >
                    {saving ? (
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={17}
                        strokeWidth={2.2}
                      />
                    )}

                    {saving
                      ? "Menyimpan..."
                      : "Simpan Perubahan"}
                  </button>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[color-mix(in_srgb,var(--color-card)_14%,transparent)] pt-5 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--color-card)_48%,transparent)]">
                    Pengguna
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--color-card)]">
                    {jumlahPengguna.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--color-card)_48%,transparent)]">
                    Hak Aktif
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--color-card)]">
                    {totalDipilih}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--color-card)_48%,transparent)]">
                    Modul Aktif
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--color-card)]">
                    {modulAktif}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--color-card)_48%,transparent)]">
                    Cakupan Akses
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--color-card)]">
                    {persentaseAkses}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================
              STATISTICS
          ====================================================== */}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Pengguna"
              value={jumlahPengguna.toLocaleString(
                "id-ID"
              )}
              description="Menggunakan role ini"
              iconClass={`${themeInfoSurface} text-[var(--color-info)]`}
            />

            <StatCard
              icon={Key}
              label="Hak Akses"
              value={`${totalDipilih}/${totalPermissionTersedia}`}
              description={`${persentaseAkses}% cakupan`}
              iconClass={`${themePrimarySoft} ${themePrimaryText}`}
            />

            <StatCard
              icon={Layers3}
              label="Modul Aktif"
              value={`${modulAktif}/${totalModul}`}
              description="Modul memiliki akses"
              iconClass={`${themeSuccessSurface} text-[var(--color-success)]`}
            />

            <StatCard
              icon={Building2}
              label="Scope"
              value={
                role.sekolahId
                  ? "Sekolah"
                  : "Global"
              }
              description={
                role.sekolahId
                  ? "Terbatas pada sekolah"
                  : "Akses sistem global"
              }
              iconClass={`${themeNeutralSurface} theme-text-secondary`}
            />
          </div>

          {/* ======================================================
              MAIN GRID
          ====================================================== */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.5fr)]">

            {/* ====================================================
                DETAIL ROLE
            ==================================================== */}

            <section
              className={`theme-card theme-border rounded-2xl border ${themeCardShadow}`}
            >
              <div
                className={`border-b ${themeDivider} px-5 py-5`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <Settings size={18} />
                  </div>

                  <div>
                    <h2 className="theme-text text-sm font-semibold">
                      Detail Peran
                    </h2>

                    <p className="theme-text-muted mt-0.5 text-xs">
                      Informasi dasar role
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">

                {/* Nama Peran */}
                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Nama Peran
                    <span className="ml-1 text-[var(--color-warning)]">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <UserCog
                      size={16}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={form.nama}
                      onChange={(e) =>
                        handleChange(
                          "nama",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: Admin Perpustakaan"
                      className={`theme-input theme-text h-11 w-full rounded-xl border pl-10 pr-3 text-sm outline-none transition-all placeholder:theme-text-placeholder ${themeFocus} ${
                        errors.nama
                          ? "border-[var(--color-warning)] focus:border-[var(--color-warning)] focus:ring-[color-mix(in_srgb,var(--color-warning)_14%,transparent)]"
                          : "theme-border"
                      }`}
                    />
                  </div>

                  {errors.nama && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-warning)]">
                      <AlertCircle size={12} />
                      {errors.nama}
                    </p>
                  )}
                </div>

                {/* Nama Tampilan */}
                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Nama Tampilan
                    <span className="ml-1 text-[var(--color-warning)]">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={form.namaTampilan}
                    onChange={(e) =>
                      handleChange(
                        "namaTampilan",
                        e.target.value
                      )
                    }
                    placeholder="admin-perpustakaan"
                    className={`theme-input theme-text h-11 w-full rounded-xl border px-3 font-mono text-sm outline-none transition-all placeholder:font-sans placeholder:theme-text-placeholder ${themeFocus} ${
                      errors.namaTampilan
                        ? "border-[var(--color-warning)] focus:border-[var(--color-warning)] focus:ring-[color-mix(in_srgb,var(--color-warning)_14%,transparent)]"
                        : "theme-border"
                    }`}
                  />

                  {errors.namaTampilan && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-warning)]">
                      <AlertCircle size={12} />
                      {errors.namaTampilan}
                    </p>
                  )}
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Deskripsi
                  </label>

                  <textarea
                    value={form.deskripsi}
                    onChange={(e) =>
                      handleChange(
                        "deskripsi",
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Jelaskan tanggung jawab dan cakupan akses peran ini..."
                    className={`theme-input theme-text w-full resize-none rounded-xl border px-3 py-3 text-sm leading-6 outline-none transition-all placeholder:theme-text-placeholder ${themeFocus}`}
                  />
                </div>

                {/* Pengguna Role */}
                <div
                  className={`rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme-card} ${themePrimaryText} ${themeCardShadow}`}
                    >
                      <UserCheck size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="theme-text text-xs font-semibold">
                        Pengguna role
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs leading-5">
                        Saat ini terdapat{" "}
                        <span className="font-semibold text-[var(--color-primary)]">
                          {jumlahPengguna.toLocaleString(
                            "id-ID"
                          )}
                        </span>{" "}
                        pengguna yang menggunakan
                        role ini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scope */}
                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg theme-card theme-text-muted ${themeCardShadow}`}
                      >
                        <Database size={15} />
                      </div>

                      <div>
                        <p className="theme-text-secondary text-xs font-semibold">
                          Scope Akses
                        </p>

                        <p className="theme-text-muted text-[11px]">
                          {role.sekolahId
                            ? "Terikat pada sekolah"
                            : "Berlaku secara global"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border ${themeNeutralBorder} theme-card theme-text-secondary px-2.5 py-1 text-[10px] font-semibold`}
                    >
                      {role.sekolahId
                        ? "Sekolah"
                        : "Global"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ====================================================
                HAK AKSES
            ==================================================== */}

            <section
              className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}
            >
              <div
                className={`border-b ${themeDivider} px-5 py-5`}
              >
                <div className="flex flex-col gap-4">

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <Lock size={18} />
                      </div>

                      <div>
                        <h2 className="theme-text text-sm font-semibold">
                          Hak Akses
                        </h2>

                        <p className="theme-text-muted mt-0.5 text-xs">
                          Atur izin setiap modul
                        </p>
                      </div>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                      <span
                        className={`rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-2.5 py-1 text-[11px] font-semibold`}
                      >
                        {totalDipilih} dipilih
                      </span>

                      <span
                        className={`rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-muted px-2.5 py-1 text-[11px] font-medium`}
                      >
                        {totalPermissionTersedia} tersedia
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div
                    className={`flex h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                  >
                    <div
                      className="rounded-full bg-[var(--color-primary)] transition-all duration-500"
                      style={{
                        width: `${persentaseAkses}%`,
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="theme-text-muted text-[11px]">
                      Cakupan akses{" "}
                      {persentaseAkses}%
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={pilihSemua}
                        disabled={
                          permissions.length ===
                          0
                        }
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${themePrimaryText} transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        Pilih Semua
                      </button>

                      <button
                        onClick={hapusSemua}
                        disabled={
                          selectedPermissions.size ===
                          0
                        }
                        className={`theme-text-secondary rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        Hapus Semua
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search
                      size={16}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      placeholder="Cari modul..."
                      value={cariModul}
                      onChange={(e) =>
                        setCariModul(
                          e.target.value
                        )
                      }
                      className={`theme-input theme-text h-10 w-full rounded-xl border pl-10 pr-3 text-sm outline-none transition-all placeholder:theme-text-placeholder ${themeNeutralBorder} ${themeFocus}`}
                    />
                  </div>
                </div>
              </div>

              {/* ==================================================
                  DESKTOP TABLE
              ================================================== */}

              {!isMobile && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead>
                      <tr
                        className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                      >
                        <th className="theme-text-muted px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em]">
                          Modul
                        </th>

                        {AKSI_LIST.map(
                          (aksi) => (
                            <th
                              key={aksi.key}
                              className="theme-text-muted px-3 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em]"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <aksi.icon
                                  size={13}
                                />
                                {aksi.label}
                              </div>
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {modulTersaring.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-16 text-center"
                          >
                            <div className="mx-auto flex max-w-xs flex-col items-center">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                              >
                                <Search size={20} />
                              </div>

                              <p className="theme-text mt-3 text-sm font-semibold">
                                Modul tidak ditemukan
                              </p>

                              <p className="theme-text-muted mt-1 text-xs leading-5">
                                Coba gunakan kata kunci
                                pencarian yang berbeda.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        modulTersaring.map(
                          ({
                            modul,
                            aksiMap,
                          }) => {
                            const idsModul =
                              Object.values(
                                aksiMap
                              )
                                .filter(Boolean)
                                .map(
                                  (
                                    permission
                                  ) =>
                                    permission.id
                                );

                            const semuaTerpilih =
                              idsModul.length >
                                0 &&
                              idsModul.every(
                                (id) =>
                                  selectedPermissions.has(
                                    id
                                  )
                              );

                            const sebagianTerpilih =
                              !semuaTerpilih &&
                              idsModul.some(
                                (id) =>
                                  selectedPermissions.has(
                                    id
                                  )
                              );

                            return (
                              <tr
                                key={modul}
                                className={`group border-b ${themeDivider} transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]`}
                              >
                                <td className="px-5 py-3.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleModulPenuh(
                                        aksiMap
                                      )
                                    }
                                    className="flex items-center gap-3 text-left"
                                  >
                                    <span
                                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                                        semuaTerpilih
                                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-card)]"
                                          : sebagianTerpilih
                                          ? `${themePrimarySoftBorder} ${themePrimarySoft}`
                                          : `${themeNeutralBorder} theme-card`
                                      }`}
                                    >
                                      {semuaTerpilih && (
                                        <Check
                                          size={13}
                                        />
                                      )}

                                      {sebagianTerpilih &&
                                        !semuaTerpilih && (
                                          <span className="h-1.5 w-1.5 rounded-sm bg-[var(--color-primary)]" />
                                        )}
                                    </span>

                                    <div className="min-w-0">
                                      <p className="theme-text-secondary truncate text-sm font-semibold transition-colors group-hover:text-[var(--color-primary)]">
                                        {modul}
                                      </p>

                                      <p className="theme-text-muted mt-0.5 text-[10px]">
                                        {
                                          idsModul.length
                                        }{" "}
                                        hak akses
                                      </p>
                                    </div>
                                  </button>
                                </td>

                                {AKSI_LIST.map(
                                  (aksi) => {
                                    const permission =
                                      aksiMap[
                                        aksi.key
                                      ];

                                    if (
                                      !permission
                                    ) {
                                      return (
                                        <td
                                          key={
                                            aksi.key
                                          }
                                          className="px-3 py-3.5 text-center"
                                        >
                                          <span className="theme-text-muted text-xs opacity-40">
                                            —
                                          </span>
                                        </td>
                                      );
                                    }

                                    const checked =
                                      selectedPermissions.has(
                                        permission.id
                                      );

                                    const style =
                                      getActionStyle(
                                        aksi.key
                                      );

                                    return (
                                      <td
                                        key={
                                          aksi.key
                                        }
                                        className="px-3 py-3.5 text-center"
                                      >
                                        <label className="inline-flex cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={
                                              checked
                                            }
                                            onChange={() =>
                                              togglePermission(
                                                permission.id
                                              )
                                            }
                                            className="peer sr-only"
                                          />

                                          <span
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                                              checked
                                                ? `${style.bg} ${style.text} ${style.border}`
                                                : `${themeNeutralBorder} theme-card theme-text-muted hover:${themePrimaryText}`
                                            }`}
                                          >
                                            {checked ? (
                                              <CheckCircle
                                                size={
                                                  16
                                                }
                                                strokeWidth={
                                                  2.2
                                                }
                                              />
                                            ) : (
                                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            )}
                                          </span>
                                        </label>
                                      </td>
                                    );
                                  }
                                )}
                              </tr>
                            );
                          }
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ==================================================
                  MOBILE
              ================================================== */}

              {isMobile && (
                <div>
                  {modulTersaring.length ===
                  0 ? (
                    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                      >
                        <Search size={18} />
                      </div>

                      <p className="theme-text mt-3 text-sm font-semibold">
                        Modul tidak ditemukan
                      </p>

                      <p className="theme-text-muted mt-1 text-xs">
                        Coba ubah kata kunci
                        pencarian.
                      </p>
                    </div>
                  ) : (
                    modulTersaring.map(
                      ({
                        modul,
                        aksiMap,
                      }) => {
                        const idsModul =
                          Object.values(
                            aksiMap
                          )
                            .filter(Boolean)
                            .map(
                              (
                                permission
                              ) =>
                                permission.id
                            );

                        const semuaTerpilih =
                          idsModul.length >
                            0 &&
                          idsModul.every(
                            (id) =>
                              selectedPermissions.has(
                                id
                              )
                          );

                        const sebagianTerpilih =
                          !semuaTerpilih &&
                          idsModul.some(
                            (id) =>
                              selectedPermissions.has(
                                id
                              )
                          );

                        const terbuka =
                          modulTerbuka ===
                          modul;

                        const jumlahDipilihModul =
                          idsModul.filter(
                            (id) =>
                              selectedPermissions.has(
                                id
                              )
                          ).length;

                        return (
                          <div
                            key={modul}
                            className={`border-b ${themeDivider} p-4`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleModulPenuh(
                                    aksiMap
                                  )
                                }
                                className="flex min-w-0 items-center gap-3 text-left"
                              >
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                    semuaTerpilih
                                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-card)]"
                                      : sebagianTerpilih
                                      ? `${themePrimarySoftBorder} ${themePrimarySoft}`
                                      : `${themeNeutralBorder} theme-card`
                                  }`}
                                >
                                  {semuaTerpilih && (
                                    <Check
                                      size={13}
                                    />
                                  )}

                                  {sebagianTerpilih &&
                                    !semuaTerpilih && (
                                      <span className="h-1.5 w-1.5 rounded-sm bg-[var(--color-primary)]" />
                                    )}
                                </span>

                                <div className="min-w-0">
                                  <p className="theme-text-secondary truncate text-sm font-semibold">
                                    {modul}
                                  </p>

                                  <p className="theme-text-muted mt-0.5 text-[10px]">
                                    {
                                      jumlahDipilihModul
                                    }
                                    /
                                    {
                                      idsModul.length
                                    }{" "}
                                    aktif
                                  </p>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setModulTerbuka(
                                    terbuka
                                      ? null
                                      : modul
                                  )
                                }
                                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                  terbuka
                                    ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`
                                    : `${themeNeutralBorder} ${themeNeutralSurface} theme-text-muted`
                                }`}
                              >
                                {
                                  jumlahDipilihModul
                                }
                                /
                                {
                                  idsModul.length
                                }

                                {terbuka ? (
                                  <ChevronDown
                                    size={14}
                                  />
                                ) : (
                                  <ChevronRight
                                    size={14}
                                  />
                                )}
                              </button>
                            </div>

                            {terbuka && (
                              <div className="mt-4 grid grid-cols-2 gap-2 pl-8">
                                {AKSI_LIST.map(
                                  (aksi) => {
                                    const permission =
                                      aksiMap[
                                        aksi.key
                                      ];

                                    if (
                                      !permission
                                    ) {
                                      return null;
                                    }

                                    const checked =
                                      selectedPermissions.has(
                                        permission.id
                                      );

                                    const style =
                                      getActionStyle(
                                        aksi.key
                                      );

                                    return (
                                      <label
                                        key={
                                          aksi.key
                                        }
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                                          checked
                                            ? `${style.bg} ${style.text} ${style.border}`
                                            : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={
                                            checked
                                          }
                                          onChange={() =>
                                            togglePermission(
                                              permission.id
                                            )
                                          }
                                          className="sr-only"
                                        />

                                        {checked ? (
                                          <CheckCircle
                                            size={
                                              15
                                            }
                                          />
                                        ) : (
                                          <span
                                            className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${themeNeutralBorder}`}
                                          >
                                            <span className="h-1 w-1 rounded-full bg-[var(--color-text-muted)]" />
                                          </span>
                                        )}

                                        {aksi.label}
                                      </label>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              )}

              {/* ==================================================
                  INFO FOOTER
              ================================================== */}

              <div
                className={`border-t ${themeDivider} ${themeNeutralSurface} px-5 py-3.5`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg theme-card ${themePrimaryText} ${themeCardShadow}`}
                  >
                    <Activity size={13} />
                  </div>

                  <p className="theme-text-secondary text-[11px] leading-5">
                    Pilih aksi untuk memberikan izin
                    pada modul. Klik nama modul untuk
                    mengaktifkan atau menonaktifkan
                    seluruh hak akses sekaligus.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ======================================================
              BOTTOM ACTIONS
          ====================================================== */}

          <div
            className={`flex flex-col-reverse gap-2 border-t ${themeDivider} pt-5 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div className="theme-text-muted flex items-center gap-2 text-xs">
              <CircleCheck
                size={14}
                className="text-[var(--color-success)]"
              />

              <span>
                {totalDipilih} hak akses sedang
                dipilih
              </span>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                onClick={() =>
                  router.push(
                    "/super-admin/manajemenAkses"
                  )
                }
                disabled={saving}
                className={`theme-card theme-border theme-text-secondary inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium ${themeCardShadow} transition-all ${themeNeutralHover} hover:text-[var(--color-primary)] disabled:opacity-50 sm:px-6`}
              >
                Batal
              </button>

              <button
                onClick={handleSimpan}
                disabled={saving}
                className={`${themePrimaryGradient} ${themePrimaryShadow} inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[var(--color-card)] transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6`}
              >
                {saving ? (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                {saving
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>
            </div>
          </div>

          {/* ======================================================
              FOOTER
          ====================================================== */}

          <div
            className={`border-t ${themeDivider} pt-4 text-center`}
          >
            <p className="theme-text-muted text-[11px]">
              © 2026 SmartSchool • Manajemen Akses
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// SUSPENSE
// ============================================================

export default function EditRolePage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page min-h-full" />
      }
    >
      <EditRolePageContent />
    </Suspense>
  );
}