"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

// dummyPermissions diimpor dari data dummy terpusat
import { dummyPermissions } from "../../../../../lib/dummyData";

import {
  Shield,
  CheckCircle,
  XCircle,
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
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

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

const themeHeroSecondary =
  "text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]";

const themeHeroSoft =
  "bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)]";

const themeHeroSoftBorder =
  "border-[color-mix(in_srgb,var(--color-card)_22%,transparent)]";

// ============================================================
// DATA
// ============================================================

const AKSI_LIST = [
  { key: "view", label: "Lihat", icon: Eye },
  { key: "create", label: "Tambah", icon: Plus },
  { key: "edit", label: "Ubah", icon: Edit },
  { key: "delete", label: "Hapus", icon: Trash2 },
];

const formKosong = {
  nama: "",
  namaTampilan: "",
  deskripsi: "",
  status: "aktif",
};

export default function TambahRolePage() {
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cariModul, setCariModul] = useState("");
  const [modulTerbuka, setModulTerbuka] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [form, setForm] = useState(formKosong);

  const [selectedPermissions, setSelectedPermissions] = useState(
    () => new Set()
  );

  // ============================================================
  // KELOMPOKKAN PERMISSION BERDASARKAN MODUL
  // ============================================================

  const modulGroups = useMemo(() => {
    const map = new Map();

    dummyPermissions.forEach((perm) => {
      if (!map.has(perm.modul)) {
        map.set(perm.modul, {});
      }

      map.get(perm.modul)[perm.aksi] = perm;
    });

    return Array.from(map.entries()).map(([modul, aksiMap]) => ({
      modul,
      aksiMap,
    }));
  }, []);

  const modulTersaring = useMemo(
    () =>
      modulGroups.filter((m) =>
        m.modul.toLowerCase().includes(cariModul.toLowerCase())
      ),
    [modulGroups, cariModul]
  );

  const totalPermissionTersedia = dummyPermissions.length;
  const totalDipilih = selectedPermissions.size;

  // ============================================================
  // NAMA TAMPILAN OTOMATIS
  // ============================================================

  const [namaTampilanManual, setNamaTampilanManual] = useState(false);

  const buatSlug = (teks) =>
    teks
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleNamaChange = (value) => {
    setForm((prev) => ({
      ...prev,
      nama: value,
      namaTampilan: namaTampilanManual
        ? prev.namaTampilan
        : buatSlug(value),
    }));
  };

  const handleNamaTampilanChange = (value) => {
    setNamaTampilanManual(true);

    setForm((prev) => ({
      ...prev,
      namaTampilan: value,
    }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // PERMISSION
  // ============================================================

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);

      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }

      return next;
    });
  };

  const toggleModulPenuh = (aksiMap) => {
    const idsModul = Object.values(aksiMap).map((p) => p.id);

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
  };

  const pilihSemua = () => {
    setSelectedPermissions(
      new Set(dummyPermissions.map((p) => p.id))
    );
  };

  const hapusSemua = () => {
    setSelectedPermissions(new Set());
  };

  // ============================================================
  // VALIDASI
  // ============================================================

  const validasi = () => {
    const errBaru = {};

    if (!form.nama.trim()) {
      errBaru.nama = "Nama peran wajib diisi.";
    }

    if (!form.namaTampilan.trim()) {
      errBaru.namaTampilan = "Nama tampilan wajib diisi.";
    }

    setErrors(errBaru);

    return Object.keys(errBaru).length === 0;
  };

  // ============================================================
  // SIMPAN
  // ============================================================

  const handleSimpan = () => {
    if (!validasi()) return;

    setIsSaving(true);

    // Simulasi penyimpanan ke server
    setTimeout(() => {
      console.log("Tambah role:", {
        ...form,
        permissions: Array.from(selectedPermissions),
      });

      setIsSaving(false);
      setSaved(true);

      setTimeout(() => {
        router.push("/super-admin/manajemenAkses");
      }, 900);
    }, 600);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <main className="w-full max-w-[1600px] mx-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">

          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <button
            onClick={() => router.push("/super-admin/manajemenAkses")}
            className={`group inline-flex items-center gap-2 text-sm font-medium theme-text-secondary transition-colors hover:text-[var(--color-primary)]`}
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-0.5"
            />

            Kembali ke Manajemen Akses
          </button>

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section
            className={`relative overflow-hidden rounded-2xl theme-card theme-border ${themeCardShadow}`}
          >
            <div
              className={`pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full ${themePrimarySoft} blur-3xl`}
            />

            <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} sm:h-14 sm:w-14`}
                >
                  <Shield
                    size={22}
                    strokeWidth={1.9}
                    className="sm:h-[25px] sm:w-[25px]"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-[-0.025em] theme-text sm:text-2xl lg:text-[26px]">
                      Tambah Role
                    </h1>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-2.5 py-0.5 text-[10px] font-semibold ${themePrimaryText} sm:px-3 sm:py-1 sm:text-[11px]`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                      />

                      Manajemen Akses
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                    <UserCog
                      size={13}
                      className={`shrink-0 ${themePrimaryText} sm:h-[14px] sm:w-[14px]`}
                      strokeWidth={2}
                    />

                    <p
                      className={`text-xs leading-5 theme-text-muted sm:text-sm`}
                    >
                      Buat peran baru dan tentukan hak akses modul yang dimiliki.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                <button
                  onClick={handleSimpan}
                  disabled={isSaving}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-4 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60 sm:h-11 sm:px-5`}
                >
                  <Save
                    size={16}
                    strokeWidth={2.3}
                    className="sm:h-[17px] sm:w-[17px]"
                  />

                  {isSaving ? "Menyimpan..." : "Simpan Role"}
                </button>
              </div>
            </div>
          </section>

          {/* ==================================================
              NOTIFICATION
          ================================================== */}

          {saved && (
            <div
              className={`flex items-center gap-2 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} px-3 py-2.5 text-sm text-[var(--color-success)] sm:gap-3 sm:px-4 sm:py-3`}
            >
              <CheckCircle
                size={16}
                className="sm:h-[18px] sm:w-[18px]"
              />

              <span className="text-xs sm:text-sm">
                Role baru berhasil dibuat. Mengalihkan ke daftar role...
              </span>
            </div>
          )}

          {/* ==================================================
              INFORMASI ROLE
          ================================================== */}

          <section
            className={`rounded-2xl theme-card theme-border ${themeCardShadow} p-4 sm:p-5 lg:p-6`}
          >
            <div
              className={`mb-4 flex items-center gap-2 border-b ${themeDivider} pb-3 sm:mb-5 sm:gap-3 sm:pb-4`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} sm:h-9 sm:w-9`}
              >
                <Settings
                  size={14}
                  className="sm:h-[16px] sm:w-[16px]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold theme-text">
                  Informasi Peran
                </p>

                <p className="text-xs theme-text-muted">
                  Informasi dasar mengenai peran
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* Nama Peran */}

              <div>
                <label className="mb-1 block text-xs font-medium theme-text-secondary sm:mb-1.5">
                  Nama Peran{" "}
                  <span className="text-[var(--color-warning)]">*</span>
                </label>

                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => handleNamaChange(e.target.value)}
                  placeholder="Contoh: Admin Perpustakaan"
                  className={`w-full rounded-xl border ${errors.nama ? themeDangerBorder : themeNeutralBorder} ${themeNeutralSurface} px-3 py-2 text-sm theme-text outline-none transition-all placeholder:theme-text-placeholder ${themeFocus} sm:px-4 sm:py-2.5`}
                />

                {errors.nama && (
                  <p
                    className={`mt-1 flex items-center gap-1 text-xs text-[var(--color-warning)] sm:mt-1.5`}
                  >
                    <AlertCircle size={12} />
                    {errors.nama}
                  </p>
                )}
              </div>

              {/* Nama Tampilan */}

              <div>
                <label className="mb-1 block text-xs font-medium theme-text-secondary sm:mb-1.5">
                  Nama Tampilan{" "}
                  <span className="text-[var(--color-warning)]">*</span>
                </label>

                <input
                  type="text"
                  value={form.namaTampilan}
                  onChange={(e) =>
                    handleNamaTampilanChange(e.target.value)
                  }
                  placeholder="admin-perpustakaan"
                  className={`w-full rounded-xl border ${errors.namaTampilan ? themeDangerBorder : themeNeutralBorder} ${themeNeutralSurface} px-3 py-2 font-mono text-sm theme-text outline-none transition-all placeholder:font-sans placeholder:theme-text-placeholder ${themeFocus} sm:px-4 sm:py-2.5`}
                />

                {errors.namaTampilan ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-warning)] sm:mt-1.5">
                    <AlertCircle size={12} />
                    {errors.namaTampilan}
                  </p>
                ) : (
                  <p className="mt-1 text-xs theme-text-muted sm:mt-1.5">
                    Terisi otomatis dari nama peran, bisa diubah manual.
                  </p>
                )}
              </div>

              {/* Deskripsi */}

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium theme-text-secondary sm:mb-1.5">
                  Deskripsi
                </label>

                <textarea
                  value={form.deskripsi}
                  onChange={(e) =>
                    handleChange("deskripsi", e.target.value)
                  }
                  rows={3}
                  placeholder="Jelaskan tanggung jawab dan cakupan akses peran ini..."
                  className={`w-full resize-none rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-2 text-sm theme-text outline-none transition-all placeholder:theme-text-placeholder ${themeFocus} sm:px-4 sm:py-2.5`}
                />
              </div>

              {/* Status */}

              <div>
                <label className="mb-1 block text-xs font-medium theme-text-secondary sm:mb-1.5">
                  Status
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  {["aktif", "nonaktif"].map((s) => {
                    const isActive = form.status === s;

                    const activeClasses =
                      s === "aktif"
                        ? `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`
                        : `${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)]`;

                    return (
                      <button
                        key={s}
                        onClick={() => handleChange("status", s)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 ${
                          isActive
                            ? `${activeClasses} shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_7%,transparent)]`
                            : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                        }`}
                      >
                        {s === "aktif" ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}

                        {s === "aktif" ? "Aktif" : "Nonaktif"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info */}

              <div className="flex items-end">
                <div
                  className={`flex items-center gap-2 rounded-xl ${themeNeutralSurface} px-2 py-1.5 sm:px-3 sm:py-2`}
                >
                  <AlertCircle
                    size={13}
                    className="theme-text-muted sm:h-[14px] sm:w-[14px]"
                  />

                  <p className="text-xs theme-text-muted">
                    Role baru belum memiliki pengguna. Pengguna dapat
                    ditetapkan setelah role dibuat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              PENEMPATAN HAK AKSES
          ================================================== */}

          <section
            className={`overflow-hidden rounded-2xl theme-card theme-border ${themeCardShadow}`}
          >
            <div
              className={`border-b ${themeDivider} p-4 sm:p-5 lg:p-6`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} sm:h-9 sm:w-9`}
                  >
                    <Shield
                      size={14}
                      className="sm:h-[16px] sm:w-[16px]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text">
                      Penempatan Hak Akses
                    </p>

                    <p className="text-xs theme-text-muted">
                      Pilih modul dan aksi yang boleh diakses oleh role ini.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full ${themeNeutralSurface} px-2.5 py-0.5 text-xs font-medium theme-text-secondary sm:px-3 sm:py-1`}
                  >
                    {totalDipilih}/{totalPermissionTersedia} dipilih
                  </span>

                  <button
                    onClick={pilihSemua}
                    className={`rounded-lg px-2 py-0.5 text-xs font-medium ${themePrimaryText} transition-colors hover:${themePrimaryText} ${themePrimarySoft} sm:px-3 sm:py-1`}
                  >
                    Pilih Semua
                  </button>

                  <button
                    onClick={hapusSemua}
                    className={`rounded-lg px-2 py-0.5 text-xs font-medium theme-text-secondary transition-colors ${themeNeutralHover} sm:px-3 sm:py-1`}
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>

              {/* Search */}

              <div className="relative mt-3 sm:mt-4">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted sm:left-3.5 sm:h-[16px] sm:w-[16px]"
                />

                <input
                  type="text"
                  placeholder="Cari modul..."
                  value={cariModul}
                  onChange={(e) => setCariModul(e.target.value)}
                  className={`h-9 w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} pl-9 pr-3 text-sm theme-text outline-none transition-all placeholder:theme-text-placeholder ${themeFocus} sm:h-10 sm:pl-10`}
                />
              </div>
            </div>

            {/* ==================================================
                DESKTOP
            ================================================== */}

            {!isMobile && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                    >
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] theme-text-muted sm:px-5 sm:py-3">
                        Modul
                      </th>

                      {AKSI_LIST.map((aksi) => (
                        <th
                          key={aksi.key}
                          className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] theme-text-muted sm:px-3 sm:py-3"
                        >
                          {aksi.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {modulTersaring.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-12 text-center sm:px-5 sm:py-16"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted sm:h-12 sm:w-12`}
                            >
                              <Search
                                size={18}
                                className="sm:h-[20px] sm:w-[20px]"
                              />
                            </div>

                            <p className="mt-2 text-sm font-semibold theme-text sm:mt-3">
                              Modul tidak ditemukan
                            </p>

                            <p className="mt-0.5 text-xs theme-text-muted sm:mt-1">
                              Coba ubah kata kunci pencarian.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      modulTersaring.map(({ modul, aksiMap }) => {
                        const idsModul = Object.values(aksiMap).map(
                          (p) => p.id
                        );

                        const semuaTerpilih = idsModul.every((id) =>
                          selectedPermissions.has(id)
                        );

                        const sebagianTerpilih =
                          !semuaTerpilih &&
                          idsModul.some((id) =>
                            selectedPermissions.has(id)
                          );

                        return (
                          <tr
                            key={modul}
                            className={`border-b ${themeDivider} transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]`}
                          >
                            <td className="px-4 py-3 sm:px-5 sm:py-3.5">
                              <button
                                onClick={() =>
                                  toggleModulPenuh(aksiMap)
                                }
                                className={`flex items-center gap-2 text-sm font-medium theme-text-secondary transition-colors hover:text-[var(--color-primary)]`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 rounded border transition-all sm:h-4 sm:w-4 ${
                                    semuaTerpilih
                                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                      : sebagianTerpilih
                                      ? `${themePrimarySoftBorder} ${themePrimarySoft}`
                                      : `${themeNeutralBorder} theme-card`
                                  }`}
                                />

                                {modul}
                              </button>
                            </td>

                            {AKSI_LIST.map((aksi) => {
                              const perm = aksiMap[aksi.key];

                              if (!perm) {
                                return (
                                  <td
                                    key={aksi.key}
                                    className="px-2 py-3 text-center theme-text-muted sm:px-3 sm:py-3.5"
                                  >
                                    —
                                  </td>
                                );
                              }

                              const checked = selectedPermissions.has(
                                perm.id
                              );

                              return (
                                <td
                                  key={aksi.key}
                                  className="px-2 py-3 text-center sm:px-3 sm:py-3.5"
                                >
                                  <label className="inline-flex cursor-pointer items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        togglePermission(perm.id)
                                      }
                                      className="h-3.5 w-3.5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] sm:h-4 sm:w-4"
                                    />
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
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
                {modulTersaring.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:px-5 sm:py-16">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                    >
                      <Search size={18} />
                    </div>

                    <p className="mt-2 text-sm font-semibold theme-text">
                      Modul tidak ditemukan
                    </p>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Coba ubah kata kunci pencarian.
                    </p>
                  </div>
                ) : (
                  modulTersaring.map(({ modul, aksiMap }) => {
                    const idsModul = Object.values(aksiMap).map(
                      (p) => p.id
                    );

                    const semuaTerpilih = idsModul.every((id) =>
                      selectedPermissions.has(id)
                    );

                    const sebagianTerpilih =
                      !semuaTerpilih &&
                      idsModul.some((id) =>
                        selectedPermissions.has(id)
                      );

                    const terbuka = modulTerbuka === modul;

                    const jumlahDipilihModul = idsModul.filter(
                      (id) => selectedPermissions.has(id)
                    ).length;

                    return (
                      <div
                        key={modul}
                        className={`border-b ${themeDivider} p-3 last:border-b-0 sm:p-4`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <button
                            onClick={() =>
                              toggleModulPenuh(aksiMap)
                            }
                            className="flex min-w-0 items-center gap-2 text-sm font-medium theme-text-secondary"
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 shrink-0 rounded border transition-all ${
                                semuaTerpilih
                                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                  : sebagianTerpilih
                                  ? `${themePrimarySoftBorder} ${themePrimarySoft}`
                                  : `${themeNeutralBorder} theme-card`
                              }`}
                            />

                            <span className="truncate">
                              {modul}
                            </span>
                          </button>

                          <button
                            onClick={() =>
                              setModulTerbuka(
                                terbuka ? null : modul
                              )
                            }
                            className={`flex shrink-0 items-center gap-1 rounded-lg ${themeNeutralSurface} px-2 py-0.5 text-xs font-medium theme-text-secondary transition-colors ${themeNeutralHover} sm:px-2.5 sm:py-1`}
                          >
                            {jumlahDipilihModul}/{idsModul.length}

                            {terbuka ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </button>
                        </div>

                        {terbuka && (
                          <div className="mt-2 grid grid-cols-2 gap-1.5 pl-5 sm:mt-3 sm:gap-2 sm:pl-6">
                            {AKSI_LIST.map((aksi) => {
                              const perm = aksiMap[aksi.key];

                              if (!perm) return null;

                              const checked =
                                selectedPermissions.has(perm.id);

                              return (
                                <label
                                  key={aksi.key}
                                  className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-2 py-2 text-xs transition-all sm:gap-2 sm:px-3 sm:py-2.5 ${
                                    checked
                                      ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`
                                      : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      togglePermission(perm.id)
                                    }
                                    className="h-3.5 w-3.5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
                                  />

                                  {aksi.label}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ==================================================
                FOOTER INFO
            ================================================== */}

            <div
              className={`border-t ${themeDivider} ${themeNeutralSurface} px-4 py-2.5 sm:px-5 sm:py-3.5`}
            >
              <p className="flex items-center gap-1.5 text-xs theme-text-muted sm:gap-2">
                <AlertCircle
                  size={13}
                  className="theme-text-muted sm:h-[14px] sm:w-[14px]"
                />

                Centang kolom aksi untuk memberi izin, atau klik nama modul
                untuk memilih/melepas seluruh aksi pada modul tersebut
                sekaligus.
              </p>
            </div>
          </section>

          {/* ==================================================
              AKSI BAWAH
          ================================================== */}

          <div
            className={`flex flex-col-reverse gap-2 border-t ${themeDivider} pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5 sm:pt-5`}
          >
            <button
              onClick={() =>
                router.push("/super-admin/manajemenAkses")
              }
              className={`inline-flex h-10 items-center justify-center rounded-xl border ${themeNeutralBorder} theme-card px-5 text-sm font-medium theme-text-secondary ${themeNeutralHover} transition-all active:scale-[0.98] sm:h-11 sm:px-6`}
            >
              Batal
            </button>

            <button
              onClick={handleSimpan}
              disabled={isSaving}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60 sm:h-11 sm:px-6`}
            >
              <Save
                size={16}
                strokeWidth={2.3}
                className="sm:h-[17px] sm:w-[17px]"
              />

              {isSaving ? "Menyimpan..." : "Simpan Role"}
            </button>
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className={`border-t ${themeDivider} pt-4 text-center sm:pt-5`}
          >
            <p className="text-xs theme-text-muted">
              © 2026 SmartSchool • Manajemen Akses
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}