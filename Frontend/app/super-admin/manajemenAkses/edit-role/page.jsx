"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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
} from "../../../../services/role.service";

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
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
      };
    case "create":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
      };
    case "update":
      return {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
      };
    case "delete":
      return {
        bg: "bg-rose-50",
        text: "text-rose-600",
        border: "border-rose-100",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-500",
        border: "border-slate-200",
      };
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(15,23,42,0.07)] sm:p-5">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-slate-50 opacity-70 transition-transform duration-500 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>

          <p className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>

          {description && (
            <p className="mt-1 truncate text-[11px] text-slate-400">
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

export default function EditRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleId = searchParams.get("id");

  const [activeMenu, setActiveMenu] = useState("manajemen-akses");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const [selectedPermissions, setSelectedPermissions] = useState(
    new Set()
  );

  const [errors, setErrors] = useState({});

  const [cariModul, setCariModul] = useState("");
  const [modulTerbuka, setModulTerbuka] = useState(null);

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
        Array.isArray(permissionData) ? permissionData : []
      );

      setRoleListData(
        Array.isArray(rolesData)
          ? rolesData.find((item) => item.id === roleId) || null
          : null
      );

      setForm({
        nama: roleDetail.nama || "",
        namaTampilan: roleDetail.namaTampilan || "",
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
      console.error("Gagal mengambil data edit role:", err);

      setError(
        err?.message || "Gagal mengambil data role."
      );
    } finally {
      setLoading(false);
    }
  };

  const jumlahPengguna =
    roleListData?._count?.pengguna || 0;

  const modulGroups = useMemo(() => {
    const map = new Map();

    permissions.forEach((permission) => {
      const modul = permission?.modul || "Lainnya";

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
    const keyword = cariModul.trim().toLowerCase();

    if (!keyword) {
      return modulGroups;
    }

    return modulGroups.filter(({ modul }) =>
      modul.toLowerCase().includes(keyword)
    );
  }, [modulGroups, cariModul]);

  const totalPermissionTersedia = permissions.length;
  const totalDipilih = selectedPermissions.size;

  const totalModul = modulGroups.length;

  const modulAktif = useMemo(() => {
    return modulGroups.filter(({ aksiMap }) =>
      Object.values(aksiMap)
        .filter(Boolean)
        .some((permission) =>
          selectedPermissions.has(permission.id)
        )
    ).length;
  }, [modulGroups, selectedPermissions]);

  const persentaseAkses =
    totalPermissionTersedia > 0
      ? Math.round(
          (totalDipilih / totalPermissionTersedia) * 100
        )
      : 0;

  const togglePermission = (permissionId) => {
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
      .map((permission) => permission.id);

    if (idsModul.length === 0) {
      return;
    }

    const semuaTerpilih = idsModul.every((id) =>
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
        permissions.map((permission) => permission.id)
      )
    );

    setSaved(false);
  };

  const hapusSemua = () => {
    setSelectedPermissions(new Set());
    setSaved(false);
  };

  const handleChange = (field, value) => {
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
      errorBaru.nama = "Nama peran wajib diisi.";
    }

    if (!form.namaTampilan.trim()) {
      errorBaru.namaTampilan =
        "Nama tampilan wajib diisi.";
    }

    setErrors(errorBaru);

    return Object.keys(errorBaru).length === 0;
  };

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
        namaTampilan: form.namaTampilan.trim(),
        deskripsi: form.deskripsi.trim() || null,
        izinIds: Array.from(selectedPermissions),
      };

      console.log("Payload update role:", payload);

      const updatedRole = await updateRole(
        roleId,
        payload
      );

      console.log(
        "Role berhasil diupdate:",
        updatedRole
      );

      setSaved(true);

      setTimeout(() => {
        router.push("/super-admin/manajemenAkses");
      }, 800);
    } catch (err) {
      console.error("Gagal update role:", err);

      setError(
        err?.message ||
          "Gagal menyimpan perubahan role."
      );
    } finally {
      setSaving(false);
    }
  };

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f4f7fb]">
        <Sidebar
          active={activeMenu}
          setActive={setActiveMenu}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(!sidebarOpen)
            }
            notifications={notifications}
            user={{
              name: "Sarah",
              email: "sarah@smartschool.com",
              avatar: "SA",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#155DFC]">
                <RefreshCw
                  size={24}
                  className="animate-spin"
                />
              </div>

              <p className="mt-5 text-sm font-semibold text-slate-800">
                Memuat data role
              </p>

              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                Mengambil detail role dan hak akses dari
                backend.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex min-h-screen bg-[#f4f7fb]">
        <Sidebar
          active={activeMenu}
          setActive={setActiveMenu}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(!sidebarOpen)
            }
            notifications={notifications}
            user={{
              name: "Sarah",
              email: "sarah@smartschool.com",
              avatar: "SA",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle size={25} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Gagal Memuat Role
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error || "Data role tidak ditemukan."}
              </p>

              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <button
                  onClick={() =>
                    router.push(
                      "/super-admin/manajemenAkses"
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>

                <button
                  onClick={loadData}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-4 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(21,93,252,0.2)] transition hover:bg-[#0D47C9]"
                >
                  <RefreshCw size={16} />
                  Coba Lagi
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Sarah",
            email: "sarah@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-7 xl:p-8">
          <div className="mx-auto w-full max-w-[1500px] space-y-5 lg:space-y-6">
            <button
              onClick={() =>
                router.push(
                  "/super-admin/manajemenAkses"
                )
              }
              className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#155DFC]"
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
              Kembali ke Manajemen Akses
            </button>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3.5 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <AlertCircle size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-rose-700">
                    Gagal memproses data
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-rose-600/80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3.5 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Perubahan berhasil disimpan
                  </p>

                  <p className="text-xs text-emerald-600/80">
                    Data role telah diperbarui.
                  </p>
                </div>
              </div>
            )}

            <section className="relative overflow-hidden rounded-3xl bg-[#0F172A] shadow-[0_12px_35px_rgba(15,23,42,0.16)]">
              <div className="absolute inset-0 opacity-[0.08]">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                    backgroundSize: "34px 34px",
                  }}
                />
              </div>

              <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#155DFC]/25 blur-3xl" />
              <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-blue-300 backdrop-blur-sm sm:h-14 sm:w-14">
                      <Shield
                        size={25}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-300">
                          <Settings size={11} />
                          Manajemen Akses
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-slate-300">
                          {role.id}
                        </span>
                      </div>

                      <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Edit Role
                      </h1>

                      <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm">
                        Perbarui informasi peran dan atur hak
                        akses modul untuk pengguna SmartSchool.
                      </p>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto">
                    <button
                      onClick={handleSimpan}
                      disabled={saving}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(21,93,252,0.28)] transition-all hover:bg-[#2563EB] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
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

                <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                      Pengguna
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {jumlahPengguna.toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                      Hak Aktif
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {totalDipilih}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                      Modul Aktif
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {modulAktif}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
                      Cakupan Akses
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {persentaseAkses}%
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                icon={Users}
                label="Pengguna"
                value={jumlahPengguna.toLocaleString(
                  "id-ID"
                )}
                description="Menggunakan role ini"
                iconClass="bg-blue-50 text-[#155DFC]"
              />

              <StatCard
                icon={Key}
                label="Hak Akses"
                value={`${totalDipilih}/${totalPermissionTersedia}`}
                description={`${persentaseAkses}% cakupan`}
                iconClass="bg-indigo-50 text-indigo-600"
              />

              <StatCard
                icon={Layers3}
                label="Modul Aktif"
                value={`${modulAktif}/${totalModul}`}
                description="Modul memiliki akses"
                iconClass="bg-sky-50 text-sky-600"
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
                iconClass="bg-slate-100 text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.5fr)]">
              <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">
                <div className="border-b border-slate-100 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
                      <Settings size={18} />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Detail Peran
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Informasi dasar role
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Nama Peran
                      <span className="ml-1 text-rose-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <UserCog
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                        className={`h-11 w-full rounded-xl border bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                          errors.nama
                            ? "border-rose-300 focus:border-rose-400"
                            : "border-slate-200 focus:border-[#155DFC]"
                        }`}
                      />
                    </div>

                    {errors.nama && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                        <AlertCircle size={12} />
                        {errors.nama}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Nama Tampilan
                      <span className="ml-1 text-rose-500">
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
                      className={`h-11 w-full rounded-xl border bg-slate-50 px-3 font-mono text-sm text-slate-900 outline-none transition-all placeholder:font-sans placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                        errors.namaTampilan
                          ? "border-rose-300 focus:border-rose-400"
                          : "border-slate-200 focus:border-[#155DFC]"
                      }`}
                    />

                    {errors.namaTampilan && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                        <AlertCircle size={12} />
                        {errors.namaTampilan}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
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
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#155DFC] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#155DFC] shadow-sm">
                        <UserCheck size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800">
                          Pengguna role
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Saat ini terdapat{" "}
                          <span className="font-semibold text-[#155DFC]">
                            {jumlahPengguna.toLocaleString(
                              "id-ID"
                            )}
                          </span>{" "}
                          pengguna yang menggunakan role ini.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                          <Database size={15} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Scope Akses
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {role.sekolahId
                              ? "Terikat pada sekolah"
                              : "Berlaku secara global"}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        {role.sekolahId
                          ? "Sekolah"
                          : "Global"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">
                <div className="border-b border-slate-100 px-5 py-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
                          <Lock size={18} />
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            Hak Akses
                          </h2>
                          <p className="mt-0.5 text-xs text-slate-400">
                            Atur izin setiap modul
                          </p>
                        </div>
                      </div>

                      <div className="hidden items-center gap-2 sm:flex">
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#155DFC]">
                          {totalDipilih} dipilih
                        </span>

                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                          {totalPermissionTersedia} tersedia
                        </span>
                      </div>
                    </div>

                    <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="rounded-full bg-[#155DFC] transition-all duration-500"
                        style={{
                          width: `${persentaseAkses}%`,
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Cakupan akses {persentaseAkses}%
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={pilihSemua}
                          disabled={
                            permissions.length === 0
                          }
                          className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-[#155DFC] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Pilih Semua
                        </button>

                        <button
                          onClick={hapusSemua}
                          disabled={
                            selectedPermissions.size ===
                            0
                          }
                          className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Hapus Semua
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        placeholder="Cari modul..."
                        value={cariModul}
                        onChange={(e) =>
                          setCariModul(e.target.value)
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#155DFC] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                </div>

                {!isMobile && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                            Modul
                          </th>

                          {AKSI_LIST.map((aksi) => (
                            <th
                              key={aksi.key}
                              className="px-3 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <aksi.icon size={13} />
                                {aksi.label}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {modulTersaring.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-16 text-center"
                            >
                              <div className="mx-auto flex max-w-xs flex-col items-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                  <Search size={20} />
                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                  Modul tidak ditemukan
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                  Coba gunakan kata kunci
                                  pencarian yang berbeda.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          modulTersaring.map(
                            ({ modul, aksiMap }) => {
                              const idsModul =
                                Object.values(aksiMap)
                                  .filter(Boolean)
                                  .map(
                                    (permission) =>
                                      permission.id
                                  );

                              const semuaTerpilih =
                                idsModul.length > 0 &&
                                idsModul.every((id) =>
                                  selectedPermissions.has(
                                    id
                                  )
                                );

                              const sebagianTerpilih =
                                !semuaTerpilih &&
                                idsModul.some((id) =>
                                  selectedPermissions.has(
                                    id
                                  )
                                );

                              return (
                                <tr
                                  key={modul}
                                  className="group transition-colors hover:bg-blue-50/30"
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
                                            ? "border-[#155DFC] bg-[#155DFC] text-white"
                                            : sebagianTerpilih
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-slate-300 bg-white"
                                        }`}
                                      >
                                        {semuaTerpilih && (
                                          <Check size={13} />
                                        )}

                                        {sebagianTerpilih &&
                                          !semuaTerpilih && (
                                            <span className="h-1.5 w-1.5 rounded-sm bg-[#155DFC]" />
                                          )}
                                      </span>

                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-700 transition-colors group-hover:text-[#155DFC]">
                                          {modul}
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                          {idsModul.length} hak
                                          akses
                                        </p>
                                      </div>
                                    </button>
                                  </td>

                                  {AKSI_LIST.map((aksi) => {
                                    const permission =
                                      aksiMap[aksi.key];

                                    if (!permission) {
                                      return (
                                        <td
                                          key={aksi.key}
                                          className="px-3 py-3.5 text-center"
                                        >
                                          <span className="text-xs text-slate-200">
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
                                        key={aksi.key}
                                        className="px-3 py-3.5 text-center"
                                      >
                                        <label className="inline-flex cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={checked}
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
                                                : "border-slate-200 bg-white text-slate-300 hover:border-slate-300 hover:text-slate-400"
                                            }`}
                                          >
                                            {checked ? (
                                              <CheckCircle
                                                size={16}
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
                                  })}
                                </tr>
                              );
                            }
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {isMobile && (
                  <div className="divide-y divide-slate-100">
                    {modulTersaring.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Search size={18} />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          Modul tidak ditemukan
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Coba ubah kata kunci pencarian.
                        </p>
                      </div>
                    ) : (
                      modulTersaring.map(
                        ({ modul, aksiMap }) => {
                          const idsModul =
                            Object.values(aksiMap)
                              .filter(Boolean)
                              .map(
                                (permission) =>
                                  permission.id
                              );

                          const semuaTerpilih =
                            idsModul.length > 0 &&
                            idsModul.every((id) =>
                              selectedPermissions.has(
                                id
                              )
                            );

                          const sebagianTerpilih =
                            !semuaTerpilih &&
                            idsModul.some((id) =>
                              selectedPermissions.has(
                                id
                              )
                            );

                          const terbuka =
                            modulTerbuka === modul;

                          const jumlahDipilihModul =
                            idsModul.filter((id) =>
                              selectedPermissions.has(
                                id
                              )
                            ).length;

                          return (
                            <div
                              key={modul}
                              className="p-4"
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
                                        ? "border-[#155DFC] bg-[#155DFC] text-white"
                                        : sebagianTerpilih
                                        ? "border-blue-300 bg-blue-50"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {semuaTerpilih && (
                                      <Check size={13} />
                                    )}

                                    {sebagianTerpilih &&
                                      !semuaTerpilih && (
                                        <span className="h-1.5 w-1.5 rounded-sm bg-[#155DFC]" />
                                      )}
                                  </span>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-700">
                                      {modul}
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                      {jumlahDipilihModul}/
                                      {idsModul.length} aktif
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
                                      ? "border-blue-100 bg-blue-50 text-[#155DFC]"
                                      : "border-slate-200 bg-slate-50 text-slate-500"
                                  }`}
                                >
                                  {jumlahDipilihModul}/
                                  {idsModul.length}

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

                                      if (!permission) {
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
                                          key={aksi.key}
                                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                                            checked
                                              ? `${style.bg} ${style.text} ${style.border}`
                                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
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
                                              size={15}
                                            />
                                          ) : (
                                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded border border-slate-300">
                                              <span className="h-1 w-1 rounded-full bg-slate-300" />
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

                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[#155DFC] shadow-sm">
                      <Activity size={13} />
                    </div>

                    <p className="text-[11px] leading-5 text-slate-500">
                      Pilih aksi untuk memberikan izin pada
                      modul. Klik nama modul untuk mengaktifkan
                      atau menonaktifkan seluruh hak akses
                      sekaligus.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CircleCheck
                  size={14}
                  className="text-emerald-500"
                />
                <span>
                  {totalDipilih} hak akses sedang dipilih
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
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 sm:px-6"
                >
                  Batal
                </button>

                <button
                  onClick={handleSimpan}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white shadow-[0_7px_20px_rgba(21,93,252,0.2)] transition-all hover:bg-[#0D47C9] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
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

            <div className="border-t border-slate-200/70 pt-4 text-center">
              <p className="text-[11px] text-slate-400">
                © 2026 SmartSchool • Manajemen Akses
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}