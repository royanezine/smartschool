"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

// dummyPermissions diimpor dari halaman list manajemen akses
import { dummyPermissions } from "../page";

import {
  Shield,
  Users,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Save,
  ArrowLeft,
  AlertCircle,
  Globe,
  Building2,
  Mail,
  FileText,
  Sparkles,
  Settings,
  UserCog,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

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

  const [activeMenu, setActiveMenu] = useState("manajemen-akses");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [selectedPermissions, setSelectedPermissions] = useState(() => new Set());

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

  // Kelompokkan permission berdasarkan modul
  const modulGroups = useMemo(() => {
    const map = new Map();
    dummyPermissions.forEach((perm) => {
      if (!map.has(perm.modul)) map.set(perm.modul, {});
      map.get(perm.modul)[perm.aksi] = perm;
    });
    return Array.from(map.entries()).map(([modul, aksiMap]) => ({ modul, aksiMap }));
  }, []);

  const modulTersaring = useMemo(
    () => modulGroups.filter((m) => m.modul.toLowerCase().includes(cariModul.toLowerCase())),
    [modulGroups, cariModul]
  );

  const totalPermissionTersedia = dummyPermissions.length;
  const totalDipilih = selectedPermissions.size;

  // Nama tampilan otomatis dari nama peran, kecuali sudah diubah manual
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
      namaTampilan: namaTampilanManual ? prev.namaTampilan : buatSlug(value),
    }));
  };

  const handleNamaTampilanChange = (value) => {
    setNamaTampilanManual(true);
    setForm((prev) => ({ ...prev, namaTampilan: value }));
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleModulPenuh = (aksiMap) => {
    const idsModul = Object.values(aksiMap).map((p) => p.id);
    const semuaTerpilih = idsModul.every((id) => selectedPermissions.has(id));
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      idsModul.forEach((id) => (semuaTerpilih ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const pilihSemua = () => setSelectedPermissions(new Set(dummyPermissions.map((p) => p.id)));
  const hapusSemua = () => setSelectedPermissions(new Set());

  const validasi = () => {
    const errBaru = {};
    if (!form.nama.trim()) errBaru.nama = "Nama peran wajib diisi.";
    if (!form.namaTampilan.trim()) errBaru.namaTampilan = "Nama tampilan wajib diisi.";
    setErrors(errBaru);
    return Object.keys(errBaru).length === 0;
  };

  const handleSimpan = () => {
    if (!validasi()) return;
    setIsSaving(true);
    // Simulasi penyimpanan ke server
    setTimeout(() => {
      console.log("Tambah role:", { ...form, permissions: Array.from(selectedPermissions) });
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => {
        router.push("/super-admin/manajemenAkses");
      }, 900);
    }, 600);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Sarah",
            email: "sarah@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-7 xl:p-8">
          <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5 lg:space-y-6">
            
            {/* ==================================================
                BACK BUTTON - KIRI ATAS
            ================================================== */}
            <button
              onClick={() => router.push("/super-admin/manajemenAkses")}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-violet-600 group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
              Kembali ke Manajemen Akses
            </button>

            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-50/70 blur-3xl" />

              <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-[0_8px_20px_rgba(139,92,246,0.25)] sm:h-14 sm:w-14">
                    <Shield size={22} strokeWidth={1.9} className="sm:h-[25px] sm:w-[25px]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl lg:text-[26px]">
                        Tambah Role
                      </h1>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-violet-600 sm:px-3 sm:py-1 sm:text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        Manajemen Akses
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                      <UserCog size={13} className="shrink-0 text-violet-400 sm:h-[14px] sm:w-[14px]" strokeWidth={2} />
                      <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                        Buat peran baru dan tentukan hak akses modul yang dimiliki.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                  <button
                    onClick={handleSimpan}
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.16)] transition-all hover:bg-slate-800 hover:shadow-[0_9px_22px_rgba(15,23,42,0.20)] active:scale-[0.98] disabled:opacity-60 sm:h-11 sm:px-5"
                  >
                    <Save size={16} strokeWidth={2.3} className="sm:h-[17px] sm:w-[17px]" />
                    {isSaving ? "Menyimpan..." : "Simpan Role"}
                  </button>
                </div>
              </div>
            </section>

            {/* ==================================================
                NOTIFICATION
            ================================================== */}
            {saved && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 sm:gap-3 sm:px-4 sm:py-3">
                <CheckCircle size={16} className="text-emerald-600 sm:h-[18px] sm:w-[18px]" />
                <span className="text-xs sm:text-sm">Role baru berhasil dibuat. Mengalihkan ke daftar role...</span>
              </div>
            )}

            {/* ==================================================
                DETAIL ROLE
            ================================================== */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] p-4 sm:p-5 lg:p-6">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 sm:mb-5 sm:gap-3 sm:pb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 sm:h-9 sm:w-9">
                  <Settings size={14} className="sm:h-[16px] sm:w-[16px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Informasi Peran</p>
                  <p className="text-xs text-slate-400">Informasi dasar mengenai peran</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Nama Peran */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 sm:mb-1.5">
                    Nama Peran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => handleNamaChange(e.target.value)}
                    placeholder="Contoh: Admin Perpustakaan"
                    className={`w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 sm:px-4 sm:py-2.5 ${
                      errors.nama ? "border-rose-300" : "border-slate-200"
                    }`}
                  />
                  {errors.nama && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 sm:mt-1.5">
                      <AlertCircle size={12} />
                      {errors.nama}
                    </p>
                  )}
                </div>

                {/* Nama Tampilan */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 sm:mb-1.5">
                    Nama Tampilan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.namaTampilan}
                    onChange={(e) => handleNamaTampilanChange(e.target.value)}
                    placeholder="admin-perpustakaan"
                    className={`w-full rounded-xl border bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 outline-none transition-all placeholder:font-sans placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 sm:px-4 sm:py-2.5 ${
                      errors.namaTampilan ? "border-rose-300" : "border-slate-200"
                    }`}
                  />
                  {errors.namaTampilan ? (
                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 sm:mt-1.5">
                      <AlertCircle size={12} />
                      {errors.namaTampilan}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400 sm:mt-1.5">
                      Terisi otomatis dari nama peran, bisa diubah manual.
                    </p>
                  )}
                </div>

                {/* Deskripsi */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-700 sm:mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={form.deskripsi}
                    onChange={(e) => handleChange("deskripsi", e.target.value)}
                    rows={3}
                    placeholder="Jelaskan tanggung jawab dan cakupan akses peran ini..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 resize-none sm:px-4 sm:py-2.5"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 sm:mb-1.5">
                    Status
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {["aktif", "nonaktif"].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleChange("status", s)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 ${
                          form.status === s
                            ? s === "aktif"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                              : "border-rose-300 bg-rose-50 text-rose-700 shadow-[0_2px_8px_rgba(244,63,94,0.15)]"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {s === "aktif" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {s === "aktif" ? "Aktif" : "Nonaktif"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-end">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-1.5 sm:px-3 sm:py-2">
                    <AlertCircle size={13} className="text-slate-400 sm:h-[14px] sm:w-[14px]" />
                    <p className="text-xs text-slate-500">
                      Role baru belum memiliki pengguna. Pengguna dapat ditetapkan setelah role dibuat.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                PENEMPATAN HAK AKSES
            ================================================== */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="border-b border-slate-100 p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 sm:h-9 sm:w-9">
                      <Lock size={14} className="sm:h-[16px] sm:w-[16px]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Penempatan Hak Akses</p>
                      <p className="text-xs text-slate-400">
                        Pilih modul dan aksi yang boleh diakses oleh role ini.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 sm:px-3 sm:py-1">
                      {totalDipilih}/{totalPermissionTersedia} dipilih
                    </span>
                    <button
                      onClick={pilihSemua}
                      className="rounded-lg px-2 py-0.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-50 sm:px-3 sm:py-1"
                    >
                      Pilih Semua
                    </button>
                    <button
                      onClick={hapusSemua}
                      className="rounded-lg px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 sm:px-3 sm:py-1"
                    >
                      Hapus Semua
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mt-3 sm:mt-4">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:left-3.5 sm:h-[16px] sm:w-[16px]" />
                  <input
                    type="text"
                    placeholder="Cari modul..."
                    value={cariModul}
                    onChange={(e) => setCariModul(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 sm:h-10 sm:pl-10"
                  />
                </div>
              </div>

              {/* TAMPILAN DESKTOP: TABEL */}
              {!isMobile && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:px-5 sm:py-3">
                          Modul
                        </th>
                        {AKSI_LIST.map((aksi) => (
                          <th key={aksi.key} className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:px-3 sm:py-3">
                            {aksi.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {modulTersaring.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center sm:px-5 sm:py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 sm:h-12 sm:w-12">
                                <Search size={18} className="sm:h-[20px] sm:w-[20px]" />
                              </div>
                              <p className="mt-2 text-sm font-semibold text-slate-700 sm:mt-3">Modul tidak ditemukan</p>
                              <p className="mt-0.5 text-xs text-slate-400 sm:mt-1">Coba ubah kata kunci pencarian.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        modulTersaring.map(({ modul, aksiMap }) => {
                          const idsModul = Object.values(aksiMap).map((p) => p.id);
                          const semuaTerpilih = idsModul.every((id) => selectedPermissions.has(id));
                          const sebagianTerpilih = !semuaTerpilih && idsModul.some((id) => selectedPermissions.has(id));
                          return (
                            <tr key={modul} className="transition-colors hover:bg-slate-50/70">
                              <td className="px-4 py-3 sm:px-5 sm:py-3.5">
                                <button
                                  onClick={() => toggleModulPenuh(aksiMap)}
                                  className="flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-violet-600"
                                >
                                  <span
                                    className={`inline-block h-3.5 w-3.5 rounded border transition-all sm:h-4 sm:w-4 ${
                                      semuaTerpilih
                                        ? "border-violet-600 bg-violet-600"
                                        : sebagianTerpilih
                                        ? "border-violet-300 bg-violet-100"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  />
                                  {modul}
                                </button>
                              </td>
                              {AKSI_LIST.map((aksi) => {
                                const perm = aksiMap[aksi.key];
                                if (!perm) {
                                  return <td key={aksi.key} className="px-2 py-3 text-center text-slate-300 sm:px-3 sm:py-3.5">—</td>;
                                }
                                const checked = selectedPermissions.has(perm.id);
                                return (
                                  <td key={aksi.key} className="px-2 py-3 text-center sm:px-3 sm:py-3.5">
                                    <label className="inline-flex cursor-pointer items-center justify-center">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => togglePermission(perm.id)}
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30 sm:h-4 sm:w-4"
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

              {/* TAMPILAN MOBILE: KARTU AKORDEON */}
              {isMobile && (
                <div className="divide-y divide-slate-100">
                  {modulTersaring.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:px-5 sm:py-16">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Search size={18} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-700">Modul tidak ditemukan</p>
                      <p className="mt-0.5 text-xs text-slate-400">Coba ubah kata kunci pencarian.</p>
                    </div>
                  ) : (
                    modulTersaring.map(({ modul, aksiMap }) => {
                      const idsModul = Object.values(aksiMap).map((p) => p.id);
                      const semuaTerpilih = idsModul.every((id) => selectedPermissions.has(id));
                      const sebagianTerpilih = !semuaTerpilih && idsModul.some((id) => selectedPermissions.has(id));
                      const terbuka = modulTerbuka === modul;
                      const jumlahDipilihModul = idsModul.filter((id) => selectedPermissions.has(id)).length;
                      return (
                        <div key={modul} className="p-3 sm:p-4">
                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={() => toggleModulPenuh(aksiMap)}
                              className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700"
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 shrink-0 rounded border transition-all ${
                                  semuaTerpilih
                                    ? "border-violet-600 bg-violet-600"
                                    : sebagianTerpilih
                                    ? "border-violet-300 bg-violet-100"
                                    : "border-slate-300 bg-white"
                                }`}
                              />
                              <span className="truncate">{modul}</span>
                            </button>
                            <button
                              onClick={() => setModulTerbuka(terbuka ? null : modul)}
                              className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 sm:px-2.5 sm:py-1"
                            >
                              {jumlahDipilihModul}/{idsModul.length}
                              {terbuka ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          </div>
                          {terbuka && (
                            <div className="mt-2 grid grid-cols-2 gap-1.5 pl-5 sm:mt-3 sm:gap-2 sm:pl-6">
                              {AKSI_LIST.map((aksi) => {
                                const perm = aksiMap[aksi.key];
                                if (!perm) return null;
                                const checked = selectedPermissions.has(perm.id);
                                return (
                                  <label
                                    key={aksi.key}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-2 py-2 text-xs transition-all sm:gap-2 sm:px-3 sm:py-2.5 ${
                                      checked
                                        ? "border-violet-200 bg-violet-50 text-violet-700"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => togglePermission(perm.id)}
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30"
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

              {/* Footer Info */}
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 sm:px-5 sm:py-3.5">
                <p className="flex items-center gap-1.5 text-xs text-slate-500 sm:gap-2">
                  <AlertCircle size={13} className="text-slate-400 sm:h-[14px] sm:w-[14px]" />
                  Centang kolom aksi untuk memberi izin, atau klik nama modul untuk memilih/melepas seluruh aksi pada modul tersebut sekaligus.
                </p>
              </div>
            </section>

            {/* ==================================================
                AKSI BAWAH
            ================================================== */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5 sm:pt-5">
              <button
                onClick={() => router.push("/super-admin/manajemenAkses")}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] sm:h-11 sm:px-6"
              >
                Batal
              </button>
              <button
                onClick={handleSimpan}
                disabled={isSaving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.16)] transition-all hover:bg-slate-800 hover:shadow-[0_9px_22px_rgba(15,23,42,0.20)] active:scale-[0.98] disabled:opacity-60 sm:h-11 sm:px-6"
              >
                <Save size={16} strokeWidth={2.3} className="sm:h-[17px] sm:w-[17px]" />
                {isSaving ? "Menyimpan..." : "Simpan Role"}
              </button>
            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}
            <div className="border-t border-slate-200/70 pt-4 text-center sm:pt-5">
              <p className="text-xs text-slate-400">© 2026 SmartSchool • Manajemen Akses</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}