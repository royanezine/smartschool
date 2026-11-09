"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getMenuBaku,
  createJabatan,
} from "@/services/jabatan.service";

import {
  ArrowLeft,
  Save,
  AlertCircle,
  X,
  Loader2,
  Check,
  HelpCircle,
  CheckSquare,
  Square,
} from "lucide-react";

export default function TambahJabatanPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuBaku, setMenuBaku] = useState({ menus: [], actions: [] });

  const [namaJabatan, setNamaJabatan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  // Mapping: { [menuName: string]: Set<action: string> }
  const [selectedPermissions, setSelectedPermissions] = useState({});

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil daftar menu baku dan actions secara dinamis dari Backend
  useEffect(() => {
    let active = true;
    async function fetchMenu() {
      try {
        setLoadingMenu(true);
        const data = await getMenuBaku();
        if (active) {
          const menus = Array.isArray(data?.menus) ? data.menus : [];
          const actions = Array.isArray(data?.actions)
            ? data.actions
            : ["view", "create", "update", "delete"];
          setMenuBaku({ menus, actions });

          // Inisialisasi state permissions kosong untuk setiap menu
          const initialMap = {};
          menus.forEach((m) => {
            initialMap[m] = new Set();
          });
          setSelectedPermissions(initialMap);
        }
      } catch (err) {
        console.error("[TambahJabatan] Gagal memuat menu baku:", err);
        if (active) {
          setServerError(
            err?.message ||
              "Gagal memuat konfigurasi menu baku dari server backend."
          );
        }
      } finally {
        if (active) setLoadingMenu(false);
      }
    }

    fetchMenu();
    return () => {
      active = false;
    };
  }, []);

  // Toggling permission per menu
  const togglePermission = (menu, action) => {
    setSelectedPermissions((prev) => {
      const currentSet = new Set(prev[menu] || []);
      if (currentSet.has(action)) {
        currentSet.delete(action);
        // Jika view dimatikan, matikan juga create, update, delete karena view adalah prasyarat
        if (action === "view") {
          currentSet.clear();
        }
      } else {
        currentSet.add(action);
        // Jika create/update/delete dinyalakan, otomatis nyalakan view
        if (action !== "view") {
          currentSet.add("view");
        }
      }
      return {
        ...prev,
        [menu]: currentSet,
      };
    });
  };

  // Toggle semua action untuk satu menu
  const toggleAllActionsForMenu = (menu) => {
    setSelectedPermissions((prev) => {
      const currentSet = prev[menu] || new Set();
      const allActions = menuBaku.actions;
      const isAllSelected = allActions.every((a) => currentSet.has(a));

      const newSet = new Set();
      if (!isAllSelected) {
        allActions.forEach((a) => newSet.add(a));
      }
      return {
        ...prev,
        [menu]: newSet,
      };
    });
  };

  // Validasi lokal sesuai kontrak backend (422 validation rules)
  const validateForm = () => {
    const errors = {};
    const cleanNama = namaJabatan.trim();

    if (!cleanNama) {
      errors.namaJabatan = "Nama jabatan wajib diisi.";
    } else if (cleanNama.length > 100) {
      errors.namaJabatan = "Nama jabatan maksimal 100 karakter.";
    }

    if (deskripsi && deskripsi.length > 500) {
      errors.deskripsi = "Deskripsi maksimal 500 karakter.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    // Susun array aksesMenu sesuai kontrak Backend
    const aksesMenuPayload = [];
    Object.entries(selectedPermissions).forEach(([menu, permsSet]) => {
      if (permsSet && permsSet.size > 0) {
        aksesMenuPayload.push({
          menu,
          permissions: Array.from(permsSet),
        });
      }
    });

    setIsSubmitting(true);
    try {
      await createJabatan({
        namaJabatan: namaJabatan.trim(),
        deskripsi: deskripsi.trim() || null,
        aksesMenu: aksesMenuPayload,
      });

      router.push("/admin/pengguna/jabatan");
    } catch (err) {
      console.error("[TambahJabatan] Gagal menyimpan jabatan:", err);

      const status = err?.status || err?.response?.status;
      const errorCode =
        err?.errorCode || err?.raw?.errorCode || err?.response?.data?.errorCode;
      const rawMessage =
        err?.message || err?.raw?.message || err?.response?.data?.message || "";

      // HTTP 400 DUPLICATE_JABATAN
      if (
        status === 400 &&
        (errorCode === "DUPLICATE_JABATAN" ||
          rawMessage.toLowerCase().includes("sudah ada") ||
          rawMessage.toLowerCase().includes("sudah digunakan"))
      ) {
        setServerError(
          `Jabatan dengan nama "${namaJabatan.trim()}" sudah ada. Silakan gunakan nama lain.`
        );
      } else if (status === 422) {
        setServerError(
          rawMessage ||
            "Validasi gagal: Periksa batasan panjang nama (1-100 karakter) dan deskripsi (maks 500 karakter)."
        );
      } else {
        setServerError(
          rawMessage ||
            "Terjadi kesalahan saat menyimpan data jabatan ke server."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-page min-h-screen">
      <Sidebar
        active="pengguna"
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <Link
                href="/admin/pengguna/jabatan"
                className="theme-input inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Daftar Jabatan</span>
              </Link>
            </div>

            {/* Page Title */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                Tambah Jabatan Baru
              </h1>
              <p className="mt-1 text-sm theme-text-secondary">
                Tentukan nama jabatan dan delegasikan izin akses menu baku secara
                dinamis sesuai kebutuhan operasional.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4 text-sm"
              >
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-danger)]">
                    Gagal Menyimpan Jabatan
                  </p>
                  <p className="mt-0.5 theme-text-secondary">{serverError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setServerError("")}
                  className="theme-text-muted hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Data Pokok Jabatan */}
              <div className="theme-card theme-border rounded-2xl border p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold theme-text border-b theme-border pb-3">
                  Informasi Utama Jabatan
                </h2>

                <div>
                  <label className="block text-sm font-semibold theme-text">
                    Nama Jabatan <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Staf Keuangan, Pustakawan, Koordinator BK"
                    value={namaJabatan}
                    maxLength={100}
                    onChange={(e) => {
                      setNamaJabatan(e.target.value);
                      if (fieldErrors.namaJabatan) {
                        setFieldErrors((prev) => ({ ...prev, namaJabatan: "" }));
                      }
                    }}
                    className={`theme-input mt-1.5 h-11 w-full rounded-xl px-4 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)] ${
                      fieldErrors.namaJabatan ? "border-[var(--color-danger)]" : ""
                    }`}
                  />
                  <div className="mt-1 flex items-center justify-between text-xs">
                    {fieldErrors.namaJabatan ? (
                      <span className="text-[var(--color-danger)] font-medium">
                        {fieldErrors.namaJabatan}
                      </span>
                    ) : (
                      <span className="theme-text-muted">
                        Panjang 1–100 karakter
                      </span>
                    )}
                    <span className="theme-text-muted">
                      {namaJabatan.length}/100
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold theme-text">
                    Deskripsi Tugas / Jabatan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan secara ringkas lingkup tanggung jawab jabatan ini..."
                    value={deskripsi}
                    maxLength={500}
                    onChange={(e) => {
                      setDeskripsi(e.target.value);
                      if (fieldErrors.deskripsi) {
                        setFieldErrors((prev) => ({ ...prev, deskripsi: "" }));
                      }
                    }}
                    className={`theme-input mt-1.5 w-full rounded-xl p-3.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)] ${
                      fieldErrors.deskripsi ? "border-[var(--color-danger)]" : ""
                    }`}
                  />
                  <div className="mt-1 flex items-center justify-between text-xs">
                    {fieldErrors.deskripsi ? (
                      <span className="text-[var(--color-danger)] font-medium">
                        {fieldErrors.deskripsi}
                      </span>
                    ) : (
                      <span className="theme-text-muted">Maksimal 500 karakter</span>
                    )}
                    <span className="theme-text-muted">{deskripsi.length}/500</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Menu Baku & Action Permissions */}
              <div className="theme-card theme-border rounded-2xl border p-6 shadow-sm space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b theme-border pb-3">
                  <div>
                    <h2 className="text-base font-bold theme-text">
                      Delegasi Hak Akses Menu Baku (RBAC)
                    </h2>
                    <p className="text-xs theme-text-secondary mt-0.5">
                      Daftar menu diambil langsung dari kontrak backend{" "}
                      <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[11px] dark:bg-white/10">
                        GET /api/jabatan/menu-baku
                      </code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold theme-text-muted">
                      <HelpCircle size={14} />
                      View wajib aktif untuk mengizinkan Create, Update, Delete
                    </span>
                  </div>
                </div>

                {loadingMenu ? (
                  <div className="flex items-center justify-center p-8 gap-3">
                    <Loader2
                      size={24}
                      className="animate-spin text-[var(--color-primary)]"
                    />
                    <span className="text-sm theme-text-muted">
                      Memuat daftar menu baku dari backend...
                    </span>
                  </div>
                ) : menuBaku.menus.length === 0 ? (
                  <div className="p-6 text-center text-sm theme-text-muted">
                    Tidak ada menu baku yang tersedia dari server.
                  </div>
                ) : (
                  <div className="divide-y theme-border">
                    {menuBaku.menus.map((menuName) => {
                      const currentSet =
                        selectedPermissions[menuName] || new Set();
                      const allActions = menuBaku.actions;
                      const isAllChecked =
                        allActions.length > 0 &&
                        allActions.every((a) => currentSet.has(a));

                      return (
                        <div
                          key={menuName}
                          className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleAllActionsForMenu(menuName)}
                              title={
                                isAllChecked
                                  ? "Batalkan semua aksi"
                                  : "Pilih semua aksi"
                              }
                              className="theme-text-muted hover:text-[var(--color-primary)] transition"
                            >
                              {isAllChecked ? (
                                <CheckSquare
                                  size={18}
                                  className="text-[var(--color-primary)]"
                                />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                            <div>
                              <p className="font-semibold text-sm theme-text capitalize">
                                {menuName}
                              </p>
                              <p className="text-xs theme-text-muted">
                                {currentSet.size === 0
                                  ? "Tidak ada akses"
                                  : `${currentSet.size} dari ${allActions.length} aksi diizinkan`}
                              </p>
                            </div>
                          </div>

                          {/* Action Checkboxes: view, create, update, delete */}
                          <div className="flex flex-wrap items-center gap-2 pl-7 sm:pl-0">
                            {allActions.map((action) => {
                              const isChecked = currentSet.has(action);
                              return (
                                <button
                                  type="button"
                                  key={action}
                                  onClick={() =>
                                    togglePermission(menuName, action)
                                  }
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                                    isChecked
                                      ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)] shadow-sm"
                                      : "theme-border theme-text-secondary hover:border-[var(--color-text)]"
                                  }`}
                                >
                                  {isChecked ? (
                                    <Check size={13} strokeWidth={3} />
                                  ) : (
                                    <span className="h-3 w-3 rounded border border-current opacity-40" />
                                  )}
                                  <span>{action}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Link
                  href="/admin/pengguna/jabatan"
                  className="theme-input inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold theme-text-secondary"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || loadingMenu}
                  className="theme-primary inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:brightness-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  <span>
                    {isSubmitting ? "Menyimpan..." : "Simpan Jabatan"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
